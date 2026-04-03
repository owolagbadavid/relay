import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ShortUrlService } from './short-url.service';
import { ReserveShortUrlDto } from './dto/reserve-short-url.dto';
import { JwtCookieAuthGuard } from '@lib/shared/guards/jwt-auth.guard';
import { UserContext } from '@lib/shared/decorators/user-context.decorator';
import { BasePaginateDto, UserContextDto } from '@lib/shared/dtos';

@Controller('short-url')
export class ShortUrlController {
  constructor(private readonly shortUrlService: ShortUrlService) {}

  @Get()
  @UseGuards(JwtCookieAuthGuard)
  findByUser(
    @Query() dto: BasePaginateDto,
    @UserContext() user: UserContextDto,
  ) {
    return this.shortUrlService.findByUser(user.sub, dto);
  }

  @Post()
  @UseGuards(JwtCookieAuthGuard)
  reserve(
    @Body() dto: ReserveShortUrlDto,
    @UserContext() user: UserContextDto,
  ) {
    return this.shortUrlService.reserve(user.sub, dto);
  }
}
