import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { AuthMiddleware } from './middleware/auth.middleware';
import { BullModule } from '@nestjs/bull';
import { InstancesModule } from './instances/instances.module';
import { InstanceSingleModule } from './instance-single/instance-single.module';
import { BuildEventsModule } from './gateways/build-events.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true,
    }),
    BullModule.forRoot({
      url: process.env.REDIS_URL
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    InstancesModule,
    InstanceSingleModule,
    BuildEventsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure (consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('');
  }
}
