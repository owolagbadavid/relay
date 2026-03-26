import { Module } from '@nestjs/common';
import { SharedService } from './shared.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule, CacheModuleAsyncOptions } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';

const cacheConfig: CacheModuleAsyncOptions = {
  isGlobal: true,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    return {
      stores: [
        createKeyv({
          url: `redis://${configService.get('REDIS_HOST')}:${configService.get('REDIS_PORT')}`,
          password: configService.getOrThrow('REDIS_PASSWORD'),
          username: configService.get('REDIS_USERNAME'),
          options: {
            socket: {
              tls: configService.get('REDIS_TLS') === 'true' ? true : undefined,
            },
          },
        }),
      ],
    };
  },
};

@Module({
  providers: [SharedService],
  exports: [SharedService],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.registerAsync(cacheConfig),
  ],
})
export class SharedModule {}
