import { Module } from '@nestjs/common';
import { UrlGeneratorController } from './url-generator.controller';
import { UrlGeneratorService } from './url-generator.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [UrlGeneratorController],
  providers: [UrlGeneratorService],
})
export class UrlGeneratorModule {}
