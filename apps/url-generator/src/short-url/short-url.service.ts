import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ShortUrl } from '../entities/shorturl.entity';
import {
  DataSource,
  EntityManager,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { isQueryFailedError } from '@lib/shared/utils';
import { PG_LOCK_NOT_AVAILABLE, PG_UNIQUE_VIOLATION } from '@lib/shared/enums';

@Injectable()
export class ShortUrlService {
  constructor(
    @InjectRepository(ShortUrl)
    private readonly shortUrlRepo: Repository<ShortUrl>,
    private dataSource: DataSource,
  ) {}

  async isInUse(shortUrl: string): Promise<boolean> {
    // todo: add caching
    return this.shortUrlRepo.exists({
      where: {
        key: shortUrl,
      },
    });
  }

  async useShortUrl(custom?: string): Promise<ShortUrl | null> {
    try {
      let where: FindOptionsWhere<ShortUrl> = {
        isInUse: false,
      };

      let onLocked: 'skip_locked' | 'nowait' = 'skip_locked';

      if (custom) {
        where = { key: custom };
        onLocked = 'nowait';
      }

      let shortUrl = await this.shortUrlRepo.findOne({
        where,
        lock: {
          mode: 'pessimistic_write',
          onLocked,
        },
      });

      if (!shortUrl) {
        if (custom) {
          shortUrl = this.shortUrlRepo.create({
            key: custom,
          });
        } else {
          return null;
        }
      } else {
        if (shortUrl.isInUse) {
          throw new ConflictException();
        }
      }

      shortUrl.isInUse = true;
      await this.shortUrlRepo.save(shortUrl);

      return shortUrl;
    } catch (e) {
      if (isQueryFailedError(e)) {
        if (
          e.code === PG_UNIQUE_VIOLATION ||
          e.code === PG_LOCK_NOT_AVAILABLE
        ) {
          throw new ConflictException();
        }
      }

      throw e;
    }
  }

  async useShortUrlTransaction(custom?: string): Promise<ShortUrl | null> {
    try {
      return await this.dataSource.transaction(
        async (manager: EntityManager) => {
          const shortUrlRepo = manager.getRepository(ShortUrl);

          let where: FindOptionsWhere<ShortUrl> = { isInUse: false };
          let onLocked: 'skip_locked' | 'nowait' = 'skip_locked';

          if (custom) {
            where = { key: custom };
            onLocked = 'nowait';
          }

          let shortUrl = await shortUrlRepo.findOne({
            where,
            lock: {
              mode: 'pessimistic_write',
              onLocked,
            },
          });

          if (!shortUrl) {
            if (custom) {
              shortUrl = shortUrlRepo.create({ key: custom });
            } else {
              return null;
            }
          } else {
            if (shortUrl.isInUse) {
              throw new ConflictException();
            }
          }

          shortUrl.isInUse = true;
          await shortUrlRepo.save(shortUrl);

          return shortUrl;
        },
      );
    } catch (e) {
      if (isQueryFailedError(e)) {
        if (
          e.code === PG_UNIQUE_VIOLATION ||
          e.code === PG_LOCK_NOT_AVAILABLE
        ) {
          throw new ConflictException();
        }
      }

      throw e;
    }
  }
}
