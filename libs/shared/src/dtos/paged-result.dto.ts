import { ApiProperty } from '@nestjs/swagger';

export class PagedResultDto<T> {
  @ApiProperty()
  items: T[];
  @ApiProperty({ type: Number })
  size: number;
  @ApiProperty({ type: Number })
  page: number;
  @ApiProperty({ type: Number })
  count: number;

  constructor(items: T[], size: number, page: number, count: number) {
    this.items = items;
    this.size = size;
    this.page = page;
    this.count = count;
  }
}
