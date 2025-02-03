import { Transform } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class OffsetQueryStringDto {
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  pageSize: number;
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  pageNum: number;
}
