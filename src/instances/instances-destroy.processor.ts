import { Process, Processor, OnQueueActive, OnQueueError, OnQueueProgress, OnQueueFailed, OnQueueCompleted } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bull';
import { Repository } from 'typeorm';
import { Instance } from './entities/instance.entity';

@Processor('destroy')
export class InstancesDestroyProcessor {
    private readonly logger = new Logger(InstancesDestroyProcessor.name);

    constructor(
        @InjectRepository(Instance)
        private readonly instanceRepository: Repository<Instance>) { }


    @OnQueueCompleted()
    async onComplete (job: Job, result: any) {
        this.logger.debug(`Job ${job.id} finished ! ${JSON.stringify(result)}`);

        await this.instanceRepository.delete({
            owner: job.data.owner
        })
    }

    @OnQueueActive()
    onActive (job: Job) {
        this.logger.debug(`Processing job ${job.id} of type ${job.name} with data ${JSON.stringify(job.data)}`);
    }
}