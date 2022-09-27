import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  isSetup (): boolean {
    return false;
  }
}
