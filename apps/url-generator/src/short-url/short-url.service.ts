import { ConflictException, Injectable } from '@nestjs/common';
import { ShortUrl } from '../entities/shorturl.entity';
import { DataSource, EntityManager } from 'typeorm';
import { isQueryFailedError } from '@lib/shared/utils';
import { PG_LOCK_NOT_AVAILABLE, PG_UNIQUE_VIOLATION } from '@lib/shared/enums';

@Injectable()
export class ShortUrlService {
  constructor(private readonly dataSource: DataSource) {}

  async useShortUrlTransaction(
    expiresIn: number,
    custom?: string,
  ): Promise<ShortUrl | null> {
    try {
      return await this.dataSource.transaction(
        async (manager: EntityManager) => {
          const shortUrlRepo = manager.getRepository(ShortUrl);
          const onLocked: 'skip_locked' | 'nowait' = custom
            ? 'nowait'
            : 'skip_locked';

          let shortUrl: ShortUrl | null;

          if (custom) {
            shortUrl = await shortUrlRepo
              .createQueryBuilder('s')
              .where('s.key = :key', { key: custom })
              .setLock('pessimistic_write', undefined, ['nowait'])
              .getOne();
          } else {
            shortUrl = await shortUrlRepo
              .createQueryBuilder('s')
              .where('s.locked_until IS NULL OR s.locked_until <= NOW()')
              .setLock('pessimistic_write', undefined, [onLocked])
              .getOne();
          }

          if (!shortUrl) {
            if (custom) {
              shortUrl = shortUrlRepo.create({ key: custom });
            } else {
              return null;
            }
          }

          shortUrl.lockedUntil = new Date(expiresIn);
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

  async unreserve(id: number, lockedUntilMs: number): Promise<void> {
    await this.dataSource
      .createQueryBuilder()
      .update(ShortUrl)
      .set({ lockedUntil: null })
      .where('id = :id AND locked_until = :lockedUntil', {
        id,
        lockedUntil: new Date(lockedUntilMs),
      })
      .execute();
  }
}
