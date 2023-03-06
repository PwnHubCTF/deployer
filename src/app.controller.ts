import { Controller, Get } from '@nestjs/common';
import { ApiSecurity } from '@nestjs/swagger';
import { AppService } from './app.service';

@Controller()
@ApiSecurity('X-API-KEY', ['X-API-KEY'])
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  testApi () {
    return { "status": this.appService.getAppStatus() }
  }

  
  @Get('ressources')
  async ressources () {
    try {
      const disk = await this.appService.getDiskSize()
      return { "disk": disk }
    } catch (error) {
      return { "disk": 'No infos' }
    }
  }
}
