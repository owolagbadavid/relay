import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';

export class ReserveShortUrlDto {
  @IsUrl()
  @ApiProperty()
  longUrl!: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  customUrl?: string;

  @IsDateString()
  @Type(() => Date)
  @ApiProperty({ description: 'ISO date string — when the short URL expires' })
  expiresIn!: Date;
}
