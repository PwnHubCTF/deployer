import { Process, Processor, OnQueueActive, OnQueueError, OnQueueProgress, OnQueueFailed, OnQueueCompleted } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bull';
import { Repository } from 'typeorm';
import { Instance } from './entities/instance.entity';

@Processor('build')
export class InstancesProcessor {
    private readonly logger = new Logger(InstancesProcessor.name);

    constructor(
        @InjectRepository(Instance)
        private readonly instanceRepository: Repository<Instance>) { }

    // @OnQueueProgress()
    // onProgress (job: Job, progress: number) {
    //     console.log(
    //         `Progress of job ${job.id} of type ${job.name}: ${progress}`
    //     );
    // }

    @OnQueueCompleted()
    async onComplete (job: Job, result: any) {
        this.logger.debug(`Job ${job.id} finished ! ${JSON.stringify(result)}`);

        await this.instanceRepository.create({ githubUrl: job.data.githubUrl, owner: job.data.owner, port: result.port }).save()
    }

    @OnQueueFailed()
    onFailed (job: Job, err: Error) {
        this.logger.error(
            `Failed job process`, err.message,
        );
    }

    @OnQueueError()
    onError (error: Error) {
        this.logger.error(
            `Error with job process`, error.name, error.message,
        );
    }

    @OnQueueActive()
    onActive (job: Job) {
        this.logger.debug(`Processing job ${job.id} of type ${job.name} with data ${JSON.stringify(job.data)}`);
    }
}