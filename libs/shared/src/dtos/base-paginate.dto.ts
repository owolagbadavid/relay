import { IsInt, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BasePaginateDto {
  @IsOptional()
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
  @IsInt()
  @Min(1)
  @ApiProperty({ type: Number, required: false })
  page: number = 1;
}
