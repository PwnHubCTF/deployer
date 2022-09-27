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
        await this.buildQueue.add('deploy', payload)
    }
}

