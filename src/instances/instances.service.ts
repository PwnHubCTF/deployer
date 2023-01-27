import { HttpException, Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { DeployInstanceDto } from './dto/deploy-instance.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { InstanceMultiple } from './entities/instance-multiple.entity';

@Injectable()
export class InstancesService {

    constructor(
        @InjectQueue('destroy') private destroyQueue: Queue,
        @InjectQueue('build') private buildQueue: Queue,
        @InjectRepository(InstanceMultiple) private readonly instanceRepository: Repository<InstanceMultiple>,
    ) { }


    async getInstances () {
        return await this.getInstancesAndQueues()
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
}

