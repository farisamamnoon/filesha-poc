import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { join } from 'path';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { appConfig } from './config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  // Log environment configuration used on startup
  appConfig.logConfig(logger);

  const HTTP_PORT = appConfig.HTTP_PORT;
  const GRPC_PORT = appConfig.APP_PORT;

  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const grpcOptions: MicroserviceOptions = {
    transport: Transport.GRPC,
    options: {
      package: 'digital',
      protoPath: join(__dirname, './digital.proto'),
      url: `0.0.0.0:${GRPC_PORT}`,
    },
  };

  app.connectMicroservice(grpcOptions);
  
  await app.startAllMicroservices();
  await app.listen(HTTP_PORT);
}
bootstrap();
