import { ApiProperty } from '@nestjs/swagger';

export class ReserveShortUrlResponseDto {
  @ApiProperty()
  shortUrl!: string;
}
