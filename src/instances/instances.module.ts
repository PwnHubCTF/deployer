import { Module } from '@nestjs/common';
import { InstancesController } from './instances.controller';
import { InstancesService } from './instances.service';
import { BullModule } from '@nestjs/bull';
import { InstancesBuildProcessor } from './instances-build.processor';
import { join } from 'path';
import { Instance } from './entities/instance.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstancesDestroyProcessor } from './instances-destroy.processor';


@Module({
  imports: [
    TypeOrmModule.forFeature([Instance]),
    BullModule.registerQueue({
      name: 'build',
      processors: [join(__dirname, '../processors/build-processor.js')],
    }),
    BullModule.registerQueue({
      name: 'destroy',
      processors: [join(__dirname, '../processors/destroy-processor.js')],
    })
  ],
  controllers: [InstancesController],
  providers: [InstancesService, InstancesBuildProcessor, InstancesDestroyProcessor]
})
export class InstancesModule { }
