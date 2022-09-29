import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { DeployInstanceDto } from './dto/deploy-instance.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Instance } from './entities/instance.entity';

@Injectable()
export class InstancesService {

    constructor(@InjectQueue('destroy') private destroyQueue: Queue, @InjectQueue('build') private buildQueue: Queue, @InjectRepository(Instance)
    private readonly instanceRepository: Repository<Instance>) { }


    async getInstances () {
        return await this.instanceRepository.find()
    }

    async getInstancesFromChallengeId (id: string) {
        return await this.instanceRepository.find({ where: { challengeId: id } })
    }

    async getInstancesFromTeam (id: string) {
        return await this.instanceRepository.find({ where: { team: id } })
    }

    async getInstancesFromOwner (id: string) {
        return await this.instanceRepository.findOne({ where: { owner: id } })
    }

    async destroyInstance (owner: string) {
        let instance = await this.instanceRepository.findOne({ where: { owner: owner } })
        if (!instance) return { "status": "error", "message": "Instance undefined" }

        let activeJobs = await this.destroyQueue.getJobs(['active'])
        let activeJobsCount = activeJobs.filter(j => j.data.owner === owner).length
        if (activeJobsCount >= 1) return { "status": "error", "message": "An instance is already being destroyed. Please wait few minutes" }

        let waitingJobs = await this.destroyQueue.getJobs(['waiting'])
        let waitingJobsCount = waitingJobs.filter(j => j.data.owner === owner).length
        if (waitingJobsCount >= 1) return { "status": "error", "message": "An instance is already being destroyed. Please wait few minutes (in queue)" }

        // destroy task
        await this.destroyQueue.add({
            projectName: instance.composeProjectName
        })
        return { "status": "Destroy enqueued" }
    }

    async createInstance (payload: DeployInstanceDto) {

        let currentInstances = await this.instanceRepository.find({ where: { owner: payload.owner } })
        if (currentInstances.length >= 1) return { "status": "error", "message": "You already have an instance deployed" }

        let activeJobs = await this.buildQueue.getJobs(['active'])
        let activeJobsCount = activeJobs.filter(j => j.data.owner === payload.owner).length
        if (activeJobsCount >= 1) return { "status": "error", "message": "You already have an instance in build" }

        let waitingJobs = await this.buildQueue.getJobs(['waiting'])
        let waitingJobsCount = waitingJobs.filter(j => j.data.owner === payload.owner).length
        if (waitingJobsCount >= 1) return { "status": "error", "message": "You already have a build in queue" }

        await this.buildQueue.add({
            owner: payload.owner,
            team: payload.team,
            githubUrl: payload.githubUrl
        })
        return { "status": "Enqueued" }
    }
}

