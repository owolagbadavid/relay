import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import type { Response } from 'express';
import { ShortUrlService } from './short-url.service';
import { ReserveShortUrlDto } from './dto/reserve-short-url.dto';
import { ReserveShortUrlResponseDto } from './dto/reserve-short-url-response.dto';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';
import { AnalyticsSummaryDto } from './dto/analytics-summary.dto';
import { QrQueryDto } from './dto/qr-query.dto';
import { JwtCookieAuthGuard } from '@lib/shared/guards/jwt-auth.guard';
import { UserContext } from '@lib/shared/decorators/user-context.decorator';
import {
  ApiDataResponse,
  ApiPaginatedDataResponse,
} from '@lib/shared/decorators/api-response.decorator';
import { ResponseHelper } from '@lib/shared/dtos/api-response.dto';
import { BasePaginateDto, UserContextDto } from '@lib/shared/dtos';
import { AnalyticsService } from '../analytics/analytics.service';
import { QrService } from '../qr/qr.service';
import { UrlMapping } from '../schemas/url-mapping.schema';
import { ClickEvent } from '../schemas/click-event.schema';

@Controller('short-url')
export class ShortUrlController {
  constructor(
    private readonly shortUrlService: ShortUrlService,
    private readonly analyticsService: AnalyticsService,
    private readonly qrService: QrService,
  ) {}

  @MessagePattern('verify_and_unreserve_short_url')
  async verifyAndUnreserve(
    @Payload() data: { id: number; shortUrl: string; lockedUntilMs: number },
  ): Promise<void> {
    await this.shortUrlService.verifyAndUnreserve(data);
  }

  @Get()
  @UseGuards(JwtCookieAuthGuard)
  @ApiPaginatedDataResponse(UrlMapping)
  async findByUser(
    @Query() dto: BasePaginateDto,
    @UserContext() user: UserContextDto,
  ) {
    return ResponseHelper.success(
      await this.shortUrlService.findByUser(user.sub, dto),
    );
  }

  @Post()
  @UseGuards(JwtCookieAuthGuard)
  @ApiDataResponse(ReserveShortUrlResponseDto, HttpStatus.CREATED)
  async reserve(
    @Body() dto: ReserveShortUrlDto,
    @UserContext() user: UserContextDto,
  ) {
    return ResponseHelper.success(
      await this.shortUrlService.reserve(user.sub, dto),
    );
  }

  @Get(':shortUrl/analytics')
  @UseGuards(JwtCookieAuthGuard)
  @ApiPaginatedDataResponse(ClickEvent)
  async getAnalytics(
    @Param('shortUrl') shortUrl: string,
    @Query() dto: AnalyticsQueryDto,
    @UserContext() user: UserContextDto,
  ) {
    return ResponseHelper.success(
      await this.analyticsService.getClicksWithPagination(
        shortUrl,
        user.sub,
        dto,
      ),
    );
  }

  @Get(':shortUrl/analytics/summary')
  @UseGuards(JwtCookieAuthGuard)
  @ApiDataResponse(AnalyticsSummaryDto)
  async getAnalyticsSummary(
    @Param('shortUrl') shortUrl: string,
    @UserContext() user: UserContextDto,
  ) {
    return ResponseHelper.success(
      await this.analyticsService.getSummary(shortUrl, user.sub),
    );
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
