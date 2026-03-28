import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsOptional, IsString, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';

export class ReserveShortUrlDto {
  @IsUrl()
  @ApiProperty()
  longUrl!: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  customUrl?: string;

  @Type(() => Date)
  @IsDate()
  @ApiProperty({ description: 'ISO date string — when the short URL expires' })
  expiresIn!: Date;
}
