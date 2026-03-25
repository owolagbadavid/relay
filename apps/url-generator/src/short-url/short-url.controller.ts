import { ConflictException, Controller } from '@nestjs/common';
import { ShortUrlService } from './short-url.service';
import { ShortUrlRequest, ShortUrlResponse } from './short-url.dto';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { ShortUrl } from '../entities/shorturl.entity';

@Controller()
export class ShortUrlController {
  constructor(private readonly shortUrlService: ShortUrlService) {}

  @GrpcMethod('ShortUrlService', 'GetShortUrl')
  async getShortUrl(data: ShortUrlRequest): Promise<ShortUrlResponse> {
    let res: ShortUrl | null = null;

    try {
      res = await this.shortUrlService.useShortUrlTransaction(
        data.customUrl?.value,
      );
    } catch (e) {
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
        message: `Error`,
      });
    }

    return {
      id: res.id,
      shortUrl: res.key,
    };
  }
}
