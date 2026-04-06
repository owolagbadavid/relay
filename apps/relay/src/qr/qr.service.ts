import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Model } from 'mongoose';
import * as QRCode from 'qrcode';
import { UrlMapping } from '../schemas/url-mapping.schema';

@Injectable()
export class QrService {
  private readonly baseUrl: string;
  private readonly cacheTtl = 86_400_000; // 24 hours

  constructor(
    @InjectModel(UrlMapping.name)
    private readonly urlMappingModel: Model<UrlMapping>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly config: ConfigService,
  ) {
    this.baseUrl = this.config.get('BASE_URL') ?? 'http://localhost:3000';
  }

  async generateQr(
    shortUrl: string,
    userId: string,
    size: number,
    format: 'png' | 'svg',
  ): Promise<{ data: Buffer | string; contentType: string }> {
    await this.verifyOwnership(shortUrl, userId);

    const cacheKey = `qr:${shortUrl}:${size}:${format}`;
    const cached = await this.cacheManager.get<string>(cacheKey);

    if (cached) {
      if (format === 'png') {
        return {
          data: Buffer.from(cached, 'base64'),
          contentType: 'image/png',
        };
      }
      return { data: cached, contentType: 'image/svg+xml' };
    }

    const fullUrl = `${this.baseUrl}/${shortUrl}`;

    if (format === 'svg') {
      const svg = await QRCode.toString(fullUrl, { type: 'svg', width: size });
      await this.cacheManager.set(cacheKey, svg, this.cacheTtl);
      return { data: svg, contentType: 'image/svg+xml' };
    }

    const buffer = await QRCode.toBuffer(fullUrl, { width: size });
    await this.cacheManager.set(
      cacheKey,
      buffer.toString('base64'),
      this.cacheTtl,
    );
    return { data: buffer, contentType: 'image/png' };
  }

  private async verifyOwnership(
    shortUrl: string,
    userId: string,
  ): Promise<void> {
    const mapping = await this.urlMappingModel
      .findOne({ shortUrl })
      .lean()
      .exec();

    if (!mapping) {
      throw new NotFoundException('Short URL not found');
    }

    if (mapping.user.toString() !== userId) {
      throw new ForbiddenException('You do not own this short URL');
    }
  }
}
