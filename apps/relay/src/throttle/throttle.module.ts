import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [{ name: 'default', ttl: 60_000, limit: 20 }],
        storage: new ThrottlerStorageRedisService({
          host: config.getOrThrow<string>('REDIS_HOST'),
          port: +config.getOrThrow('REDIS_PORT'),
          password: config.get<string>('REDIS_PASSWORD') || undefined,
          username: config.get<string>('REDIS_USERNAME') || undefined,
        }),
      }),
    }),
  ],
})
export class ThrottleModule {}
