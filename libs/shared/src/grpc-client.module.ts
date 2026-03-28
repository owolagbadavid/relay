import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { URL_GEN } from './tokens';

const shortUrlProtoPath = join(__dirname, 'proto/shorturl.proto');

const client = ClientsModule.registerAsync([
  {
    name: URL_GEN,
    inject: [ConfigService],
    imports: [ConfigModule],
    useFactory: (config: ConfigService) => ({
      transport: Transport.GRPC,
      options: {
        url: config.getOrThrow<string>('GRPC_URL'),
        package: 'shorturl',
        protoPath: shortUrlProtoPath,
      },
    }),
  },
]);

@Module({
  imports: [client],
  exports: [client],
})
export class GrpcClientModule {}
