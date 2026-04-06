import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QrService } from './qr.service';
import { UrlMapping, UrlMappingSchema } from '../schemas/url-mapping.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UrlMapping.name, schema: UrlMappingSchema },
    ]),
  ],
  providers: [QrService],
  exports: [QrService],
})
export class QrModule {}
