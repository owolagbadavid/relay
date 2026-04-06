import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

export class QrQueryDto {
  @IsOptional()
  @IsInt()
  @Min(50)
  @Max(1000)
  @Type(() => Number)
  @ApiPropertyOptional({ default: 200 })
  size: number = 200;

  @IsOptional()
  @IsIn(['png', 'svg'])
  @ApiPropertyOptional({ enum: ['png', 'svg'], default: 'png' })
  format: 'png' | 'svg' = 'png';
}
