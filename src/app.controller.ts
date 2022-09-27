import { Controller, Get } from '@nestjs/common';
import { ApiSecurity } from '@nestjs/swagger';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @ApiSecurity('X-API-KEY', ['X-API-KEY'])
  @Get()
  getHello () {
    return this.appService.isSetup();
  }
}
