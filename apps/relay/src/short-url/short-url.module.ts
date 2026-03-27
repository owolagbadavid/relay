import { Module } from '@nestjs/common';
import { ShortUrlService } from './short-url.service';
import { ShortUrlController } from './short-url.controller';
import { GrpcClientModule } from '@lib/shared/grpc-client.module';
import { RmqClientModule } from '@lib/shared/rmq-client.module';

@Module({
  controllers: [ShortUrlController],
  providers: [ShortUrlService],
  imports: [GrpcClientModule, RmqClientModule],
})
export class ShortUrlModule {}
