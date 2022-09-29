import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getAppStatus () {
    return 'up';
  }
}
