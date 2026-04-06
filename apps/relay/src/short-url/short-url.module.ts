import { Module } from '@nestjs/common';
import { ShortUrlService } from './short-url.service';
import { ShortUrlController } from './short-url.controller';
import { GrpcClientModule } from '@lib/shared/grpc-client.module';
import { RmqClientModule } from '@lib/shared/rmq-client.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UrlMapping, UrlMappingSchema } from '../schemas/url-mapping.schema';
import { AnalyticsModule } from '../analytics/analytics.module';
import { QrModule } from '../qr/qr.module';

@Module({
  controllers: [ShortUrlController],
  providers: [ShortUrlService],
  imports: [
    GrpcClientModule,
    RmqClientModule,
    AnalyticsModule,
    QrModule,
    MongooseModule.forFeature([
      { name: UrlMapping.name, schema: UrlMappingSchema },
    ]),
  ],
})
export class ShortUrlModule {}
