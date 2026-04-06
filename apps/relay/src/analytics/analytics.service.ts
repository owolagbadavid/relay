import { createHash } from 'node:crypto';
import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ClickEvent } from '../schemas/click-event.schema';
import { UrlMapping } from '../schemas/url-mapping.schema';
import { BasePaginateDto, PagedResultDto } from '@lib/shared/dtos';
import {
  AnalyticsSummaryDto,
  ClicksByDayDto,
  TopRefererDto,
} from '../short-url/dto/analytics-summary.dto';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectModel(ClickEvent.name)
    private readonly clickEventModel: Model<ClickEvent>,
    @InjectModel(UrlMapping.name)
    private readonly urlMappingModel: Model<UrlMapping>,
  ) {}

  trackClick(
    shortUrl: string,
    ip: string | undefined,
    userAgent: string | undefined,
    referer: string | undefined,
  ): void {
    const ipHash = ip
      ? createHash('sha256').update(ip).digest('hex')
      : 'unknown';

    Promise.all([
      this.clickEventModel.create({
        shortUrl,
        ipHash,
        userAgent: userAgent ?? '',
        referer: referer ?? '',
      }),
      this.urlMappingModel.updateOne({ shortUrl }, { $inc: { clicks: 1 } }),
    ]).catch((err) => {
      this.logger.error('Failed to track click', err);
    });
  }

  async getClicksWithPagination(
    shortUrl: string,
    userId: string,
    dto: BasePaginateDto,
  ): Promise<PagedResultDto<ClickEvent>> {
    await this.verifyOwnership(shortUrl, userId);

    const skip = (dto.page - 1) * dto.size;

    const [items, count] = await Promise.all([
      this.clickEventModel
        .find({ shortUrl })
        .lean()
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(dto.size)
        .exec(),
      this.clickEventModel.countDocuments({ shortUrl }).exec(),
    ]);

    return new PagedResultDto(items, dto.size, dto.page, count);
  }

  async getSummary(
    shortUrl: string,
    userId: string,
  ): Promise<AnalyticsSummaryDto> {
    const mapping = await this.verifyOwnership(shortUrl, userId);

    const [clicksByDay, topReferrers] = await Promise.all([
      this.clickEventModel.aggregate<ClicksByDayDto>([
        { $match: { shortUrl } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: -1 as const } },
        { $limit: 30 },
        { $project: { _id: 0, date: '$_id', count: 1 } },
      ]),
      this.clickEventModel.aggregate<TopRefererDto>([
        { $match: { shortUrl, referer: { $ne: '' } } },
        { $group: { _id: '$referer', count: { $sum: 1 } } },
        { $sort: { count: -1 as const } },
        { $limit: 10 },
        { $project: { _id: 0, referer: '$_id', count: 1 } },
      ]),
    ]);

    return {
      totalClicks: mapping.clicks ?? 0,
      clicksByDay,
      topReferrers,
    };
  }

  private async verifyOwnership(
    shortUrl: string,
    userId: string,
  ): Promise<UrlMapping> {
    const mapping = await this.urlMappingModel
      .findOne({ shortUrl })
      .lean()
      .exec();

    if (!mapping) {
      throw new NotFoundException('Short URL not found');
    }

    if (mapping.user._id.toString() !== userId) {
      throw new ForbiddenException('You do not own this short URL');
    }

    return mapping;
  }
}
