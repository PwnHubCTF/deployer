import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { DeployAdminInstanceDto } from './dto/deploy-admin-instance.dto';
import { InstanceSingleService } from './instance-single.service';

@ApiSecurity('X-API-KEY', ['X-API-KEY'])
@Controller('single')
@ApiTags('single')
export class InstanceSingleController {
    constructor(private readonly instanceService: InstanceSingleService) { }

    @Get()
    async getInstances () {
        return await this.instanceService.getInstances();
    }

    @Get('challenge/:challenge_id')
    async getAdminInstancesFromChallengeId (@Param('challenge_id') id: string) {
        let instance = await this.instanceService.getInstanceFromChallengeId(id);
        if(instance.length == 0){
            return { "status": "stopped" }
        } else {
            return instance[0]
        }
    }

    @Post('')
    async deployAdminInstance (@Body() payload: DeployAdminInstanceDto) {
        await this.instanceService.createAdminInstance(payload);
        return { "status": "Enqueued" }
    }

    @Delete('/:id')
    async destroyInstance (@Param('id') id: string) {
        return await this.instanceService.destroyAdminInstance(id);
    }
}
