import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ReflectionService } from '@grpc/reflection';
import { join } from 'path';
import { UrlGeneratorModule } from './url-generator.module';

async function bootstrap() {
  const app = await NestFactory.create(UrlGeneratorModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('UrlGeneratorBootstrap');
  const grpcUrl = configService.get<string>('GRPC_URL') ?? '0.0.0.0:5001';
  const rmqUrl = configService.get<string>('RMQ_URL');
  const port = Number(configService.get<string>('PORT') ?? 3000);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'test',
      protoPath: join(__dirname, 'proto/test.proto'),
      url: grpcUrl,
      onLoadPackageDefinition: (pkg, server) => {
        new ReflectionService(pkg).addToServer(server);
      },
    },
  });

  if (rmqUrl) {
    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.RMQ,
      options: {
        urls: [rmqUrl],
        queue: 'main',
        queueOptions: { durable: true },
      },
    });
  } else {
    logger.warn('RMQ_URL is not set; skipping RabbitMQ microservice startup');
  }

  await app.startAllMicroservices();
  await app.listen(port);
}
void bootstrap();
