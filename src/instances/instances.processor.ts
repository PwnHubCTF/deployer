import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';

@Processor('build')
export class InstancesProcessor {
    private readonly logger = new Logger(InstancesProcessor.name);

    @Process('deploy')
    async handleDeploy (job: Job) {
        const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

        this.logger.debug('Start build...');
        await delay(10000)
        this.logger.debug('build completed');
    }
}