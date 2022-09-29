require('dotenv').config()
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';


async function bootstrap () {
  const app = await NestFactory.create(AppModule);

  if (process.env.NODE_ENV === 'dev') {
    const config = new DocumentBuilder()
      .addApiKey({ type: 'apiKey', name: 'X-API-KEY', in: 'header', description: 'API Key For External calls' }, 'X-API-KEY')
      .setTitle('Deployer API')
      .setDescription('The Deployer API description')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }
  await app.listen(process.env.APP_PORT);
}
bootstrap();