import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from '../dtos';
import { ProfileResponseDto } from './dto/profile-response.dto';
import { ResponseHelper } from '@lib/shared/dtos/api-response.dto';
import { ApiDataResponse } from '@lib/shared/decorators/api-response.decorator';
import type { Response } from 'express';
import { cookie } from '@lib/shared/utils';
import { JwtCookieAuthGuard } from '@lib/shared/guards/jwt-auth.guard';
import { UserContext } from '@lib/shared/decorators/user-context.decorator';
import { UserContextDto } from '@lib/shared/dtos';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const jwt = await this.authService.login(body.email);

    cookie(res, 'access_token', jwt);
    return ResponseHelper.successNoData();
  }

  @Get('profile')
  @UseGuards(JwtCookieAuthGuard)
  @ApiDataResponse(ProfileResponseDto)
  profile(@UserContext() user: UserContextDto) {
    return ResponseHelper.success({ email: user.email });
  }
}
