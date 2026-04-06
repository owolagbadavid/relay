import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ShortUrlModule } from './short-url/short-url.module';
import { SharedModule } from '@lib/shared';
import { RedirectModule } from './redirect/redirect.module';
import { ThrottleModule } from './throttle/throttle.module';

@Module({
  imports: [
    SharedModule,
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow('MONGO_URI'),
      }),
    }),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow('JWT_SECRET'),
      }),
    }),
    ThrottleModule,
    AuthModule,
    ShortUrlModule,
    RedirectModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
