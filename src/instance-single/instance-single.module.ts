import { Module } from '@nestjs/common';
import { InstanceSingleController } from './instance-single.controller';
import { InstanceSingleService } from './instance-single.service';
import { BullModule } from '@nestjs/bull';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstanceSingle } from './entities/instance-single.entity';
import { InstancesSingleBuildProcessor } from './instances-single-build.processor';
import { InstancesSingleDestroyProcessor } from './instances-single-destroy.processor';


@Module({
  imports: [
    TypeOrmModule.forFeature([InstanceSingle]),
    BullModule.registerQueue({
      name: 'build-admin',
      processors: [join(__dirname, '../processors/build-processor.js')],
    }, {
      name: 'destroy-admin',
      processors: [join(__dirname, '../processors/destroy-processor.js')],
    }),
  ],
  exports: [InstanceSingleService],
  controllers: [InstanceSingleController],
  providers: [InstanceSingleService, InstancesSingleBuildProcessor, InstancesSingleDestroyProcessor]
})
export class InstanceSingleModule { }
