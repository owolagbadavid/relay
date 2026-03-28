import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class KeyCounterService implements OnModuleDestroy {
  private readonly redis: Redis;
  private static readonly KEY = 'short_url_counter';

  constructor(private readonly config: ConfigService) {
    this.redis = new Redis({
      host: config.getOrThrow('REDIS_HOST'),
      port: +config.getOrThrow('REDIS_PORT'),
      password: config.get('REDIS_PASSWORD'),
      username: config.get('REDIS_USERNAME'),
    });
  }

  async getNextBatchStart(batchSize: number): Promise<number> {
    const next = await this.redis.incrby(KeyCounterService.KEY, batchSize);
    return next - batchSize;
  }

  onModuleDestroy() {
    this.redis.disconnect();
  }
}
