import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from '../dtos';
import { ResponseHelper } from '@lib/shared/dtos/api-response.dto';
import type { Response } from 'express';
import { cookie } from '@lib/shared/utils';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const jwt = await this.authService.login(body.email);

    cookie(res, 'access_token', jwt);
    return ResponseHelper.successNoData();
  }
}
