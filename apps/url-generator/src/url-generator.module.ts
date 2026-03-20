import { Module } from '@nestjs/common';
import { UrlGeneratorController } from './url-generator.controller';
import { UrlGeneratorService } from './url-generator.service';

@Module({
  imports: [],
  controllers: [UrlGeneratorController],
  providers: [UrlGeneratorService],
})
export class UrlGeneratorModule {}
