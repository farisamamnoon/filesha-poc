import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const configService = new ConfigService();

  const HTTP_PORT = parseInt(configService.get<string>('HTTP_PORT') || '8080', 10);
  const GRPC_PORT = parseInt(configService.get<string>('APP_PORT') || '5001', 10);

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
