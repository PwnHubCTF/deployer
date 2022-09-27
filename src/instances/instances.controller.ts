import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { DeployInstanceDto } from './dto/deploy-instance.dto';
import { InstancesService } from './instances.service';

@ApiSecurity('X-API-KEY', ['X-API-KEY'])
@Controller('instances')
@ApiTags('instances')
export class InstancesController {
    constructor(private readonly instanceService: InstancesService) { }

    @Get()
    async getInstances () {
        return await this.instanceService.getInstances();
    }

    @Get('/team/:team_id')
    async getInstancesByTeam (@Param('team_id') id: string) {
        return await this.instanceService.getInstancesByTeam(id);
    }

    @Post()
    async deployInstance (@Body() payload: DeployInstanceDto) {
        return await this.instanceService.createInstance(payload);
    }

    @Delete('/:owner_id')
    async destroyInstance (@Param('owner_id') owner: string) {
        return await this.instanceService.destroyInstance(owner);
    }
}
