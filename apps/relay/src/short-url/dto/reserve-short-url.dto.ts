import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsOptional, IsString, IsUrl, Length } from 'class-validator';
import { Type } from 'class-transformer';

export class ReserveShortUrlDto {
  @IsUrl()
  @ApiProperty()
  longUrl!: string;

  @IsString()
  @Length(8, 8)
  @IsOptional()
  @ApiPropertyOptional()
  customUrl?: string;

  @Type(() => Date)
  @IsDate()
  @ApiProperty({ description: 'ISO date string — when the short URL expires' })
  expiresIn!: Date;
}
