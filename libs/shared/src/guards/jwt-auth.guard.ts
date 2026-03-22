import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { UserContextDto } from '../dtos';

@Injectable()
export class JwtCookieAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const token = this.extractTokenFromCookie(request);

    if (!token) {
      throw new UnauthorizedException('Token not found in cookies');
    }

    try {
      const payload = await this.jwtService.verifyAsync<UserContextDto>(token, {
        secret: this.config.getOrThrow('JWT_SECRET'),
      });

      request['user'] = payload;

      return true;
    } catch (err) {
      Logger.log(err);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractTokenFromCookie(request: Request): string | undefined {
    return (
      (request.signedCookies as { access_token?: string })?.access_token ??
      (request.cookies as { access_token?: string })?.access_token
    );
  }
}
