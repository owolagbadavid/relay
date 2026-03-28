import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { ShortUrl } from '../entities/shorturl.entity';
import { KeyCounterService } from './key-counter.service';
import { intToBase62Fixed } from '@lib/shared/utils';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    @InjectRepository(ShortUrl)
    private readonly shortUrlRepo: Repository<ShortUrl>,
    private readonly keyCounter: KeyCounterService,
    private readonly config: ConfigService,
  ) {}

  @Cron(process.env.SHORT_URL_CRON ?? '45 * * * * *')
  async handleCron() {
    const batchSize = Number(this.config.get('SHORT_URL_BATCH_SIZE')) || 400;
    const minPool = Number(this.config.get('SHORT_URL_MIN_POOL_SIZE')) || 1000;

    const unusedCount = await this.shortUrlRepo
      .createQueryBuilder('s')
      .where('s.locked_until IS NULL OR s.locked_until <= NOW()')
      .getCount();

    if (unusedCount >= minPool) {
      this.logger.debug(
        `Pool sufficient (${unusedCount} unused), skipping generation`,
      );
      return;
    }

    const start = await this.keyCounter.getNextBatchStart(batchSize);

    const values = Array.from({ length: batchSize }, (_, i) => ({
      key: intToBase62Fixed(start + i),
    }));

    await this.shortUrlRepo
      .createQueryBuilder()
      .insert()
      .into(ShortUrl)
      .values(values)
      .orIgnore()
      .execute();

    this.logger.log(
      `Inserted batch [${start}, ${start + batchSize}) — conflicts skipped`,
    );
  }
}
