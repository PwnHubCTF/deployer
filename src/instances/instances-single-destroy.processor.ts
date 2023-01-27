import { Process, Processor, OnQueueActive, OnQueueError, OnQueueProgress, OnQueueFailed, OnQueueCompleted } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bull';
import { Repository } from 'typeorm';
import { InstanceSingle } from './entities/instance-single.entity';

@Processor('destroy-admin')
export class InstancesSingleDestroyProcessor {
    private readonly logger = new Logger(InstancesSingleDestroyProcessor.name);

    constructor(
        @InjectRepository(InstanceSingle)
        private readonly instanceRepository: Repository<InstanceSingle>) { }


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