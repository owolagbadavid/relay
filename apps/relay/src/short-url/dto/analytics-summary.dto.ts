import { ApiProperty } from '@nestjs/swagger';

export class ClicksByDayDto {
  @ApiProperty()
  date!: string;

  @ApiProperty()
  count!: number;
}

export class TopRefererDto {
  @ApiProperty()
  referer!: string;

  @ApiProperty()
  count!: number;
}

export class AnalyticsSummaryDto {
  @ApiProperty()
  totalClicks!: number;

  @ApiProperty({ type: [ClicksByDayDto] })
  clicksByDay!: ClicksByDayDto[];

  @ApiProperty({ type: [TopRefererDto] })
  topReferrers!: TopRefererDto[];
}
