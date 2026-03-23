import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ShortUrl } from '../entities/shorturl.entity';
import { FindOptionsWhere, Repository } from 'typeorm';

@Injectable()
export class ShortUrlService {
  constructor(
    @InjectRepository(ShortUrl)
    private readonly shortUrlRepo: Repository<ShortUrl>,
  ) {}

  async isInUse(shortUrl: string): Promise<boolean> {
    // todo: add caching
    return this.shortUrlRepo.exists({
      where: {
        key: shortUrl,
      },
    });
  }

  async useShortUrl(custom?: string): Promise<string | null> {
    const where: FindOptionsWhere<ShortUrl> = {
      isInUse: false,
    };
    if (custom) {
      where.key = custom;
    }

    const shortUrl = await this.shortUrlRepo.findOne({
      where,
      lock: {
        mode: 'pessimistic_write',
        onLocked: 'skip_locked',
      },
    });

    if (!shortUrl) {
      return null;
    }

    shortUrl.isInUse = true;
    await this.shortUrlRepo.save(shortUrl);

    return shortUrl.key;
  }
}
