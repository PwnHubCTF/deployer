import { Module } from '@nestjs/common';
import { InstancesController } from './instances.controller';
import { InstancesService } from './instances.service';
import { BullModule } from '@nestjs/bull';
import { InstancesProcessor } from './instances.processor';

@Module({
  imports: [BullModule.registerQueue({
    name: 'build',
  })
  ],
  controllers: [InstancesController],
  providers: [InstancesService, InstancesProcessor]
})
export class InstancesModule { }
