import { Process, Processor, OnQueueActive, OnQueueError, OnQueueProgress, OnQueueFailed, OnQueueCompleted } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bull';
import { Repository } from 'typeorm';
import { Instance } from './entities/instance.entity';

@Processor('build')
export class InstancesBuildProcessor {
    private readonly logger = new Logger(InstancesBuildProcessor.name);

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

        try {
            await this.instanceRepository.create({
                githubUrl: job.data.githubUrl,
                owner: job.data.owner,
                team: job.data.team,
                port: result.port
            }).save()
        } catch (error) {
            this.logger.error(`Error while create new instance in DB ${error.name} -> ${error.message}`);
        }
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