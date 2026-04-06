import { Body, Controller, Post, Res } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from '../dtos';
import { ResponseHelper } from '@lib/shared/dtos/api-response.dto';
import type { Response } from 'express';
import { cookie } from '@lib/shared/utils';

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
}
