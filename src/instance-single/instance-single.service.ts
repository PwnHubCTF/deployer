import { HttpException, Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { DeployAdminInstanceDto } from './dto/deploy-admin-instance.dto';
import { InstanceSingle } from './entities/instance-single.entity';

@Injectable()
export class InstanceSingleService {

    constructor(
        @InjectQueue('destroy-admin') private destroyAdminQueue: Queue,
        @InjectQueue('build-admin') private buildAdminQueue: Queue,
        @InjectRepository(InstanceSingle) private readonly instanceSingleRepository: Repository<InstanceSingle>
    ) { }


    async getInstances () {
        return await this.getInstancesAndQueues()
    }

    async getInstanceFromChallengeId (id: string) {
        try {
            return await this.getInstancesAndQueues({ challengeId: id })
        } catch (error) {
            return [{'status': 'stopped'}]
        }
    }

    async getInstancesAndQueues (search?: FindOptionsWhere<InstanceSingle> | FindOptionsWhere<InstanceSingle>[]) {
        const instances = await this.instanceSingleRepository.find({ where: search })
        const inBuild = await this.buildAdminQueue.getJobs(['active', 'waiting'])
        const inDestroy = await this.destroyAdminQueue.getJobs(['active', 'waiting'])

        return [...instances, ...[...inBuild, ...inDestroy].map(j => { return { ...j.data, progress: j.progress() } })]
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
        if(!payload.challengeId || !payload.githubUrl) throw new HttpException("Missing informations", 403)

        let currentInstances = await this.instanceSingleRepository.find({ where: { challengeId: payload.challengeId } })
        if (currentInstances.length >= 1) throw new HttpException("This challenge is already deployed", 403)

        let jobs = await this.buildAdminQueue.getJobs(['waiting', 'active'])
        let jobsCount = jobs.filter(j => j.data.challengeId === payload.challengeId).length
        if (jobsCount >= 1) throw new HttpException("This challenge is already being builded", 403)

        return await this.buildAdminQueue.add({
            githubUrl: payload.githubUrl,
            challengeId: payload.challengeId,
        })
    }
}

