import { IsInt, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class BasePaginateDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiProperty({
    type: Number,
    description: 'Number of items to return',
    required: false,
    default: 10,
  })
  size: number = 10;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiProperty({ type: Number, required: false })
  page: number = 1;
}
