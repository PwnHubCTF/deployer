import { Process, Processor, OnQueueActive, OnQueueError, OnQueueProgress, OnQueueFailed, OnQueueCompleted } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bull';
import { Repository } from 'typeorm';
import { InstanceSingle } from './entities/instance-single.entity';

@Processor('build-admin')
export class InstancesSingleBuildProcessor {

    protected readonly logger = new Logger('InstancesBuildProcessor');

    constructor(
        @InjectRepository(InstanceSingle)
        private readonly instanceRepository: Repository<InstanceSingle>) {  }

    @OnQueueCompleted()
    async onComplete (job: Job, result: any) {
        this.logger.debug(`Job ${job.id} finished ! ${JSON.stringify(result)}`);

        try {
            await this.instanceRepository.create({
                githubUrl: job.data.githubUrl,
                port: result.port,
                composeProjectName: result.composeProjectName,
                challengeId: job.data.challengeId,
            }).save()
        } catch (error) {
            this.logger.error(`Error while create new instance in DB ${error.name} -> ${error.message}`);
        }
    }

    @OnQueueProgress()
    onProgress (job: Job, progress: number) {
        // console.log(
        //     `Progress of job ${job.id} of type ${job.name}: ${progress}`
        // );
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
        this.logger.debug(`Processing job ${job.id} with data ${JSON.stringify(job.data)}`);
    }
}