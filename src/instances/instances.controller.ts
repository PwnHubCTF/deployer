import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiSecurity } from '@nestjs/swagger';
import { DeployInstanceDto } from './dto/deploy-instance.dto';
import { InstancesService } from './instances.service';

@ApiSecurity('X-API-KEY', ['X-API-KEY'])
@Controller('instances')
export class InstancesController {
    constructor(private readonly instanceService: InstancesService) { }

    @Get()
    getInstances () {
        return this.instanceService.getInstances();
    }

    @Post('/deploy')
    async deployInstance (@Body() payload: DeployInstanceDto) {
        return await this.instanceService.createInstance(payload);
    }
}
