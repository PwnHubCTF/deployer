import { Module } from '@nestjs/common';
import { InstancesController } from './instances.controller';
import { InstancesService } from './instances.service';
import { BullModule } from '@nestjs/bull';
import { InstancesBuildProcessor } from './instances-build.processor';
import { join } from 'path';
import { Instance } from './entities/instance.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstancesDestroyProcessor } from './instances-destroy.processor';
import { InstanceMultiple } from './entities/instance-multiple.entity';
import { InstanceSingle } from './entities/instance-single.entity';
import { InstancesSingleBuildProcessor } from './instances-single-build.processor';
import { InstancesSingleDestroyProcessor } from './instances-single-destroy.processor';


@Module({
  imports: [
    TypeOrmModule.forFeature([InstanceMultiple, InstanceSingle]),
    BullModule.registerQueue({
      name: 'build',
      processors: [join(__dirname, '../processors/build-processor.js')],
    }, {
      name: 'build-admin',
      processors: [join(__dirname, '../processors/build-processor.js')],
    }, {
      name: 'destroy',
      processors: [join(__dirname, '../processors/destroy-processor.js')],
    }, {
      name: 'destroy-admin',
      processors: [join(__dirname, '../processors/destroy-processor.js')],
    }),
  ],
  controllers: [InstancesController],
  providers: [InstancesService, InstancesBuildProcessor, InstancesDestroyProcessor, InstancesSingleBuildProcessor, InstancesSingleDestroyProcessor]
})
export class InstancesModule { }
