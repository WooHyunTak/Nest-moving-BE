import { IsNumber, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class OffsetQueryStringDto {
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  pageSize: number;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  pageNum: number;
}

export class CursorQueryStringDto {
  @IsNumber()
  @IsOptional()
  cursor: string;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit: number;
}
