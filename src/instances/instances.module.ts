import { Module } from '@nestjs/common';
import { InstancesController } from './instances.controller';
import { InstancesService } from './instances.service';
import { BullModule } from '@nestjs/bull';
import { InstancesProcessor } from './instances.processor';
import { join } from 'path';
import { Instance } from './entities/instance.entity';
import { TypeOrmModule } from '@nestjs/typeorm';


@Module({
  imports: [TypeOrmModule.forFeature([Instance]),
  BullModule.registerQueue({
    name: 'build',
    processors: [join(__dirname, 'processor.js')],
  })
  ],
  controllers: [InstancesController],
  providers: [InstancesService, InstancesProcessor]
})
export class InstancesModule { }
