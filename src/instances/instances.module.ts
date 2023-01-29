import { Module } from '@nestjs/common';
import { InstancesController } from './instances.controller';
import { InstancesService } from './instances.service';
import { BullModule } from '@nestjs/bull';
import { InstancesBuildProcessor } from './instances-build.processor';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstancesDestroyProcessor } from './instances-destroy.processor';
import { InstanceMultiple } from './entities/instance-multiple.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([InstanceMultiple]),
    BullModule.registerQueue({
      name: 'build',
      processors: [join(__dirname, '../processors/build-processor.js')],
    }, {
      name: 'destroy',
      processors: [join(__dirname, '../processors/destroy-processor.js')],
    }),
  ],
  exports: [InstancesService],
  controllers: [InstancesController],
  providers: [InstancesService, InstancesBuildProcessor, InstancesDestroyProcessor]
})
export class InstancesModule { }
