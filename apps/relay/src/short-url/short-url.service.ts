import { RMQ, URL_GEN } from '@lib/shared/tokens';
import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import type { ClientGrpc, ClientRMQ } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Observable, firstValueFrom } from 'rxjs';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { UrlMapping } from '../schemas/url-mapping.schema';
import { ReserveShortUrlDto } from './dto/reserve-short-url.dto';
import { BasePaginateDto, PagedResultDto } from '@lib/shared/dtos';

interface ShortUrlGrpcService {
  getShortUrl(data: {
    customUrl?: { value: string };
    expiresIn: number;
  }): Observable<{ id: number; shortUrl: string }>;
}

@Injectable()
export class ShortUrlService implements OnModuleInit {
  private grpcService!: ShortUrlGrpcService;
  private readonly logger = new Logger(ShortUrlService.name);

  constructor(
    @Inject(URL_GEN) private readonly urlGenClient: ClientGrpc,
    @Inject(RMQ) private readonly rmqClient: ClientRMQ,
    @InjectModel(UrlMapping.name)
    private readonly urlMappingModel: Model<UrlMapping>,
  ) {}

  onModuleInit() {
    this.grpcService =
      this.urlGenClient.getService<ShortUrlGrpcService>('ShortUrlService');
  }

  async reserve(
    userId: string,
    dto: ReserveShortUrlDto,
  ): Promise<{ shortUrl: string }> {
    const expiresInMs = dto.expiresIn.getTime();

    let grpcResult: { id: number; shortUrl: string };

    try {
      grpcResult = await firstValueFrom(
        this.grpcService.getShortUrl({
          expiresIn: expiresInMs,
          ...(dto.customUrl ? { customUrl: { value: dto.customUrl } } : {}),
        }),
      );
    } catch (e: unknown) {
      this.logger.error(e);
      if ((e as { code?: number })?.code === GrpcStatus.ALREADY_EXISTS) {
        throw new ConflictException('Short URL already in use');
      }
      throw new InternalServerErrorException('Failed to reserve short URL');
    }

    try {
      await this.urlMappingModel.create({
        user: userId,
        longUrl: dto.longUrl,
        shortUrl: grpcResult.shortUrl,
        expiresIn: dto.expiresIn,
      });
    } catch (e: unknown) {
      this.logger.error(e);
      this.rmqClient.emit('unreserve_short_url', {
        id: grpcResult.id,
        lockedUntilMs: expiresInMs,
      });
      throw new InternalServerErrorException(
        'Failed to save URL mapping; reservation rolled back',
      );
    }

    return { shortUrl: grpcResult.shortUrl };
  }

  async findByUser(
    userId: string,
    dto: BasePaginateDto,
  ): Promise<PagedResultDto<UrlMapping>> {
    const filter = { user: userId };
    const skip = (dto.page - 1) * dto.size;

    const [items, count] = await Promise.all([
      this.urlMappingModel
        .find(filter)
        .lean()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(dto.size)
        .exec(),
      this.urlMappingModel.countDocuments(filter).exec(),
    ]);

    return new PagedResultDto(items, dto.size, dto.page, count);
  }
}
