import { ConflictException, Controller, Logger } from '@nestjs/common';
import { ShortUrlService } from './short-url.service';
import { ShortUrlRequest, ShortUrlResponse } from './short-url.dto';
import {
  GrpcMethod,
  MessagePattern,
  Payload,
  RpcException,
} from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { ShortUrl } from '../entities/shorturl.entity';

@Controller()
export class ShortUrlController {
  private logger: Logger = new Logger(ShortUrlController.name);
  constructor(private readonly shortUrlService: ShortUrlService) {}

  @GrpcMethod('ShortUrlService', 'GetShortUrl')
  async getShortUrl(data: ShortUrlRequest): Promise<ShortUrlResponse> {
    let res: ShortUrl | null = null;

    try {
      res = await this.shortUrlService.useShortUrlTransaction(
        Number(data.expiresIn),
        data.customUrl?.value,
      );
    } catch (e) {
      this.logger.error(e);
      if (e instanceof ConflictException) {
        throw new RpcException({
          code: status.ALREADY_EXISTS,
          message: 'key already in use',
        });
      }
    }

    if (!res) {
      throw new RpcException({
        code: status.ABORTED,
        message: 'No available keys',
      });
    }

    return {
      id: res.id,
      shortUrl: res.key,
    };
  }

  @MessagePattern('unreserve_short_url')
  async unreserveShortUrl(
    @Payload() data: { id: number; lockedUntilMs: number },
  ): Promise<void> {
    await this.shortUrlService.unreserve(data.id, data.lockedUntilMs);
  }
}
