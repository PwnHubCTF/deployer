import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { DeployAdminInstanceDto } from './dto/deploy-admin-instance.dto';
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

    @Get('admin')
    async getAdminInstances () {
        return await this.instanceService.getAdminInstances();
    }

    @Get('challenge/:challenge_id')
    async getInstancesFromChallengeId (@Param('challenge_id') id: string) {
        return await this.instanceService.getInstancesFromChallengeId(id);
    }

    @Get('admin/challenge/:challenge_id')
    async getAdminInstancesFromChallengeId (@Param('challenge_id') id: string) {
        return await this.instanceService.getAdminInstancesFromChallengeId(id);
    }

    @Get('/team/:team_id')
    async getInstancesFromTeam (@Param('team_id') id: string) {
        return await this.instanceService.getInstancesFromTeam(id);
    }

    @Get('/owner/:owner_id')
    async getInstanceFromOwner (@Param('owner_id') id: string) {
        return await this.instanceService.getInstancesFromOwner(id);
    }

    @Post()
    async deployInstance (@Body() payload: DeployInstanceDto) {
        return await this.instanceService.createInstance(payload);
    }

    @Post('/admin')
    async deployAdminInstance (@Body() payload: DeployAdminInstanceDto) {
        return await this.instanceService.createAdminInstance(payload);
    }

    @Delete('admin/:id')
    async destroyAdminInstance (@Param('id') id: string) {
        return await this.instanceService.destroyAdminInstance(id);
    }

    @Delete('/:id')
    async destroyInstance (@Param('id') id: string) {
        return await this.instanceService.destroyInstance(id);
    }
}
