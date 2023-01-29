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

    @Get('challenge/:challenge_id')
    async getInstancesFromChallengeId (@Param('challenge_id') id: string) {
        return await this.instanceService.getInstancesFromChallengeId(id);
    }

    @Get('/team/:team_id')
    async getInstancesFromTeam (@Param('team_id') id: string) {
        return await this.instanceService.getInstancesFromTeam(id);
    }

    @Get('/owner/:owner_id')
    async getInstanceFromOwner (@Param('owner_id') id: string) {
        return await this.instanceService.getInstancesFromOwner(id);
    }

    @Get('/owner/:owner_id/:challenge_id')
    async getInstanceFromOwnerAndChallenge (@Param('challenge_id') challenge_id: string, @Param('owner_id') owner_id: string) {
        let instance = await this.instanceService.getInstanceFromOwnerAndChallenge(owner_id, challenge_id);
        if(instance.length == 0){
            return { "status": "stopped" }
        } else {
            let infos = {
                creation: instance[0].creation,
                destroyAt: instance[0].destroyAt,
                url: instance[0].url
            }
            
            return infos
        }
    }

    @Post()
    async deployInstance (@Body() payload: DeployInstanceDto) {
        await this.instanceService.createInstance(payload);
        return { "status": "Enqueued" }
    }

    @Delete('/:id')
    async destroyInstance (@Param('id') id: string) {
        return await this.instanceService.destroyInstance(id);
    }
}
