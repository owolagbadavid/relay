import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ShortUrlService } from './short-url.service';
import { ReserveShortUrlDto } from './dto/reserve-short-url.dto';
import { JwtCookieAuthGuard } from '@lib/shared/guards/jwt-auth.guard';
import { UserContext } from '@lib/shared/decorators/user-context.decorator';
import { UserContextDto } from '@lib/shared/dtos';

@Controller('short-url')
export class ShortUrlController {
  constructor(private readonly shortUrlService: ShortUrlService) {}

  @Post()
  @UseGuards(JwtCookieAuthGuard)
  reserve(
    @Body() dto: ReserveShortUrlDto,
    @UserContext() user: UserContextDto,
  ) {
    return this.shortUrlService.reserve(user.sub, dto);
  }
}
