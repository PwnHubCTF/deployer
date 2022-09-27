import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { DeployInstanceDto } from './dto/deploy-instance.dto';

@Injectable()
export class InstancesService {
    constructor(@InjectQueue('build') private buildQueue: Queue) { }


    getInstances () {
        return false;
    }

    async createInstance (payload: DeployInstanceDto) {
        let activeJobs = await this.buildQueue.getJobs(['active'])
        let activeJobsCount = activeJobs.filter(j => j.data.owner === payload.owner).length
        if (activeJobsCount >= 1) return { "status": "error", "message": "You already have an instance in build" }

        let waitingJobs = await this.buildQueue.getJobs(['waiting'])
        let waitingJobsCount = waitingJobs.filter(j => j.data.owner === payload.owner).length
        if (waitingJobsCount >= 1) return { "status": "error", "message": "You already have a build in queue" }

        await this.buildQueue.add({
            owner: payload.owner,
            githubUrl: payload.githubUrl
        })
        return { "status": "enqueued" }
    }
}

