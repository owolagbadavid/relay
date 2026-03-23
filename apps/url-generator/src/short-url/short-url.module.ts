import { Module } from '@nestjs/common';
import { ShortUrlService } from './short-url.service';
import { ShortUrlController } from './short-url.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShortUrl } from '../entities/shorturl.entity';

@Module({
  controllers: [ShortUrlController],
  providers: [ShortUrlService],
  imports: [TypeOrmModule.forFeature([ShortUrl])],
})
export class ShortUrlModule {}
