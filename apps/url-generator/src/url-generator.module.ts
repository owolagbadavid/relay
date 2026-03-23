import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UrlGeneratorController } from './url-generator.controller';
import { UrlGeneratorService } from './url-generator.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), ScheduleModule.forRoot()],
  controllers: [UrlGeneratorController],
  providers: [UrlGeneratorService],
})
export class UrlGeneratorModule {}
