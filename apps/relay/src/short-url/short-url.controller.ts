import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { ShortUrlService } from './short-url.service';
import { ReserveShortUrlDto } from './dto/reserve-short-url.dto';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';
import { QrQueryDto } from './dto/qr-query.dto';
import { JwtCookieAuthGuard } from '@lib/shared/guards/jwt-auth.guard';
import { UserContext } from '@lib/shared/decorators/user-context.decorator';
import { BasePaginateDto, UserContextDto } from '@lib/shared/dtos';
import { AnalyticsService } from '../analytics/analytics.service';
import { QrService } from '../qr/qr.service';

@Controller('short-url')
export class ShortUrlController {
  constructor(
    private readonly shortUrlService: ShortUrlService,
    private readonly analyticsService: AnalyticsService,
    private readonly qrService: QrService,
  ) {}

  @Get()
  @UseGuards(JwtCookieAuthGuard)
  findByUser(
    @Query() dto: BasePaginateDto,
    @UserContext() user: UserContextDto,
  ) {
    return this.shortUrlService.findByUser(user.sub, dto);
  }

  @Post()
  @UseGuards(JwtCookieAuthGuard)
  reserve(
    @Body() dto: ReserveShortUrlDto,
    @UserContext() user: UserContextDto,
  ) {
    return this.shortUrlService.reserve(user.sub, dto);
  }

  @Get(':shortUrl/analytics')
  @UseGuards(JwtCookieAuthGuard)
  getAnalytics(
    @Param('shortUrl') shortUrl: string,
    @Query() dto: AnalyticsQueryDto,
    @UserContext() user: UserContextDto,
  ) {
    return this.analyticsService.getClicksWithPagination(
      shortUrl,
      user.sub,
      dto,
    );
  }

  @Get(':shortUrl/analytics/summary')
  @UseGuards(JwtCookieAuthGuard)
  getAnalyticsSummary(
    @Param('shortUrl') shortUrl: string,
    @UserContext() user: UserContextDto,
  ) {
    return this.analyticsService.getSummary(shortUrl, user.sub);
  }

  @Get(':shortUrl/qr')
  @UseGuards(JwtCookieAuthGuard)
  async getQrCode(
    @Param('shortUrl') shortUrl: string,
    @Query() dto: QrQueryDto,
    @UserContext() user: UserContextDto,
    @Res() res: Response,
  ) {
    const { data, contentType } = await this.qrService.generateQr(
      shortUrl,
      user.sub,
      dto.size,
      dto.format,
    );
    res.set('Content-Type', contentType);
    res.set('Cache-Control', 'public, max-age=86400');
    res.send(data);
  }
}
