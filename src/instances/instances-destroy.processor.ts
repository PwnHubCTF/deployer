import { Process, Processor, OnQueueActive, OnQueueError, OnQueueProgress, OnQueueFailed, OnQueueCompleted } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bull';
import { Repository } from 'typeorm';
import { InstanceMultiple } from './entities/instance-multiple.entity';

@Processor('destroy')
export class InstancesDestroyProcessor {
    private readonly logger = new Logger(InstancesDestroyProcessor.name);

    constructor(
        @InjectRepository(InstanceMultiple)
        private readonly instanceRepository: Repository<InstanceMultiple>) { }


    @OnQueueCompleted()
    async onComplete (job: Job, result: any) {
        this.logger.debug(`Job ${job.id} finished ! ${JSON.stringify(result)}`);

        await this.instanceRepository.delete({
            composeProjectName: job.data.projectName
        })
    }

    @OnQueueFailed()
    onFailed (job: Job, err: Error) {
        this.logger.error(
            `Failed destroy instance`, err.message,
        );
    }

    @OnQueueError()
    onError (error: Error) {
        this.logger.error(
            `Failed destroy instance`, error.name, error.message,
        );
    }
}