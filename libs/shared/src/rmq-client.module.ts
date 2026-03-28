import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RMQ } from './tokens';

const client = ClientsModule.registerAsync([
  {
    name: RMQ,
    inject: [ConfigService],
    imports: [ConfigModule],
    useFactory: (config: ConfigService) => ({
      transport: Transport.RMQ,
      options: {
        urls: [config.getOrThrow<string>('RMQ_URL')],
        queue: 'main',
        queueOptions: { durable: true },
      },
    }),
  },
]);

@Module({
  imports: [client],
  exports: [client],
})
export class RmqClientModule {}
