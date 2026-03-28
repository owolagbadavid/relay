import { Module } from '@nestjs/common';
import { RedirectController } from './redirect.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UrlMapping, UrlMappingSchema } from '../schemas/url-mapping.schema';

@Module({
  controllers: [RedirectController],
  imports: [
    MongooseModule.forFeature([
      { name: UrlMapping.name, schema: UrlMappingSchema },
    ]),
  ],
})
export class RedirectModule {}
