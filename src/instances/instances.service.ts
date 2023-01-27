import { HttpException, Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { DeployInstanceDto } from './dto/deploy-instance.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { DeployAdminInstanceDto } from './dto/deploy-admin-instance.dto';
import { InstanceMultiple } from './entities/instance-multiple.entity';
import { InstanceSingle } from './entities/instance-single.entity';

@Injectable()
export class InstancesService {

    constructor(
        @InjectQueue('destroy') private destroyQueue: Queue,
        @InjectQueue('destroy-admin') private destroyAdminQueue: Queue,
        @InjectQueue('build') private buildQueue: Queue,
        @InjectQueue('build-admin') private buildAdminQueue: Queue,
        @InjectRepository(InstanceMultiple) private readonly instanceRepository: Repository<InstanceMultiple>,
        @InjectRepository(InstanceSingle) private readonly instanceSingleRepository: Repository<InstanceSingle>
    ) { }


    async getInstances () {
        return await this.getInstancesAndQueues()
    }
    async getAdminInstances () {
        return await this.instanceSingleRepository.find()
    }

    async getAdminInstancesFromChallengeId (id: string) {
        return await this.instanceSingleRepository.find({ where: { challengeId: id } })
    }

    async getInstancesFromChallengeId (id: string) {
        return await this.getInstancesAndQueues({ challengeId: id })
    }

    async getInstancesFromTeam (id: string) {
        return await this.getInstancesAndQueues({ team: id })
    }

    async getInstancesFromOwner (id: string) {
        return await this.getInstancesAndQueues({ owner: id })
    }

    async getInstancesAndQueues (search?: FindOptionsWhere<InstanceMultiple> | FindOptionsWhere<InstanceMultiple>[]) {
        const instances = await this.instanceRepository.find({ where: search })
        const inBuild = await this.buildQueue.getJobs(['active', 'waiting'])
        const inDestroy = await this.destroyQueue.getJobs(['active', 'waiting'])

        return [...instances.map(i => { return { ...i, url: `${process.env.SERVER_URL}:${i.port}` } }), ...[...inBuild, ...inDestroy].map(j => { return { ...j.data, progress: j.progress() } })]
    }

    async destroyInstance (id: string) {
        let instance = await this.instanceRepository.findOne({ where: { id } })
        if (!instance) throw new HttpException("Instance undefined", 404)

        let activeJobs = await this.destroyQueue.getJobs(['active'])
        let activeJobsCount = activeJobs.filter(j => j.data.instanceId === id).length
        if (activeJobsCount >= 1) throw new HttpException("This instance is already being destroyed. Please wait few minutes", 403)

        let waitingJobs = await this.destroyQueue.getJobs(['waiting'])
        let waitingJobsCount = waitingJobs.filter(j => j.data.instanceId === id).length
        if (waitingJobsCount >= 1) throw new HttpException('This instance is already being destroyed. Please wait few minutes (in queue)', 403)

        // destroy task
        await this.destroyQueue.add({
            projectName: instance.composeProjectName,
            instanceId: id
        })
        return { "status": "Destroy enqueued" }
    }

    async createInstance (payload: DeployInstanceDto) {

        let currentInstances = await this.instanceRepository.find({ where: { owner: payload.owner } })
        if (currentInstances.length >= 1) throw new HttpException("You already have an instance deployed", 403)

        let activeJobs = await this.buildQueue.getJobs(['active'])
        let activeJobsCount = activeJobs.filter(j => j.data.owner === payload.owner).length
        if (activeJobsCount >= 1) throw new HttpException("You already have an instance in build", 403)


        let waitingJobs = await this.buildQueue.getJobs(['waiting'])
        let waitingJobsCount = waitingJobs.filter(j => j.data.owner === payload.owner).length
        if (waitingJobsCount >= 1) throw new HttpException("You already have a build in queue", 403)

        await this.buildQueue.add({
            owner: payload.owner,
            team: payload.team,
            githubUrl: payload.githubUrl,
            challengeId: payload.challengeId,
        })
        return { "status": "Enqueued" }
    }

    async destroyAdminInstance (id: string) {
        let instance = await this.instanceSingleRepository.findOne({ where: { id } })
        if (!instance) throw new HttpException("Instance undefined", 404)

        let activeJobs = await this.destroyAdminQueue.getJobs(['active'])
        let activeJobsCount = activeJobs.filter(j => j.data.instanceId === id).length
        if (activeJobsCount >= 1) throw new HttpException("This instance is already being destroyed. Please wait few minutes", 403)

        let waitingJobs = await this.destroyAdminQueue.getJobs(['waiting'])
        let waitingJobsCount = waitingJobs.filter(j => j.data.instanceId === id).length
        if (waitingJobsCount >= 1) throw new HttpException('This instance is already being destroyed. Please wait few minutes (in queue)', 403)

        // destroy task
        await this.destroyAdminQueue.add({
            projectName: instance.composeProjectName,
            instanceId: id
        })
        return { "status": "Destroy enqueued" }
    }

    async createAdminInstance (payload: DeployAdminInstanceDto) {
        let currentInstances = await this.instanceSingleRepository.find({ where: { challengeId: payload.challengeId } })
        if (currentInstances.length >= 1) throw new HttpException("This challenge is already deployed", 403)

        let jobs = await this.buildAdminQueue.getJobs(['waiting', 'active'])
        let jobsCount = jobs.filter(j => j.data.challengeId === payload.challengeId).length
        if (jobsCount >= 1) throw new HttpException("This challenge is already being builded", 403)

        await this.buildAdminQueue.add({
            owner: 'single-instance',
            githubUrl: payload.githubUrl,
            challengeId: payload.challengeId,
        })
        return { "status": "Enqueued" }
    }
}

