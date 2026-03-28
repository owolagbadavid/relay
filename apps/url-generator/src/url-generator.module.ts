import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UrlGeneratorController } from './url-generator.controller';
import { UrlGeneratorService } from './url-generator.service';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies/snake-naming.strategy';
import { ShortUrlModule } from './short-url/short-url.module';
import { ShortUrl } from './entities/shorturl.entity';
import { TasksService } from './services/tasks.service';
import { KeyCounterService } from './services/key-counter.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        autoLoadEntities: true,
        namingStrategy: new SnakeNamingStrategy(),
        synchronize: true,
        // migrations: [__dirname + '/db/migrations/**/*{.js,.ts}'],
        // synchronize: configService.get('NODE_ENV') != 'production',
        // migrationsRun: false,
      }),
    }),
    ShortUrlModule,
    TypeOrmModule.forFeature([ShortUrl]),
  ],
  controllers: [UrlGeneratorController],
  providers: [UrlGeneratorService, TasksService, KeyCounterService],
})
export class UrlGeneratorModule {}
