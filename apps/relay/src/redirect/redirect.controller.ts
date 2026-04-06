import {
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  Redirect,
  Req,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { UrlMapping } from '../schemas/url-mapping.schema';
import { AnalyticsService } from '../analytics/analytics.service';

@Controller()
export class RedirectController {
  private readonly defaultTtl: number;

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @InjectModel(UrlMapping.name)
    private readonly urlMappingModel: Model<UrlMapping>,
    private readonly config: ConfigService,
    private readonly analyticsService: AnalyticsService,
  ) {
    this.defaultTtl =
      this.config.get<number>('REDIRECT_CACHE_TTL') ?? 3_600_000;
  }

  @Get(':shortUrl')
  @Redirect()
  @Throttle({ default: { limit: 100, ttl: 60_000 } })
  async redirect(@Param('shortUrl') shortUrl: string, @Req() req: Request) {
    const cacheKey = `redirect:${shortUrl}`;

    const cached = await this.cacheManager.get<{
      longUrl: string;
      expiresInMs: number;
    }>(cacheKey);

    if (cached) {
      const remainingTtl = Math.max(0, cached.expiresInMs - Date.now());
      await this.cacheManager.set(cacheKey, cached, remainingTtl);
      this.analyticsService.trackClick(
        shortUrl,
        req.ip,
        req.headers['user-agent'],
        req.headers['referer'] as string,
      );
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

    this.analyticsService.trackClick(
      shortUrl,
      req.ip,
      req.headers['user-agent'],
      req.headers['referer'] as string,
    );
    return { url: mapping.longUrl, statusCode: 302 };
  }
}
