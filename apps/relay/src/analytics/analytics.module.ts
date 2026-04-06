import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsService } from './analytics.service';
import { ClickEvent, ClickEventSchema } from '../schemas/click-event.schema';
import { UrlMapping, UrlMappingSchema } from '../schemas/url-mapping.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ClickEvent.name, schema: ClickEventSchema },
      { name: UrlMapping.name, schema: UrlMappingSchema },
    ]),
  ],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
