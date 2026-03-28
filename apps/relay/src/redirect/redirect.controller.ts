import {
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  Redirect,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { UrlMapping } from '../schemas/url-mapping.schema';

@Controller()
export class RedirectController {
  private readonly defaultTtl: number;

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @InjectModel(UrlMapping.name)
    private readonly urlMappingModel: Model<UrlMapping>,
    private readonly config: ConfigService,
  ) {
    this.defaultTtl =
      this.config.get<number>('REDIRECT_CACHE_TTL') ?? 3_600_000;
  }

  @Get(':shortUrl')
  @Redirect()
  async redirect(@Param('shortUrl') shortUrl: string) {
    const cacheKey = `redirect:${shortUrl}`;

    const cached = await this.cacheManager.get<{
      longUrl: string;
      expiresInMs: number;
    }>(cacheKey);

    if (cached) {
      const remainingTtl = Math.max(0, cached.expiresInMs - Date.now());
      await this.cacheManager.set(cacheKey, cached, remainingTtl);
      return { url: cached.longUrl, statusCode: 302 };
    }

    const mapping = await this.urlMappingModel
      .findOne({ shortUrl })
      .lean()
      .exec();

    if (!mapping) {
      throw new NotFoundException();
    }

    const expiresInMs = mapping.expiresIn
      ? new Date(mapping.expiresIn).getTime()
      : Date.now() + this.defaultTtl;

    const ttl = Math.max(0, expiresInMs - Date.now());
    await this.cacheManager.set(
      cacheKey,
      { longUrl: mapping.longUrl, expiresInMs },
      ttl,
    );

    return { url: mapping.longUrl, statusCode: 302 };
  }
}
