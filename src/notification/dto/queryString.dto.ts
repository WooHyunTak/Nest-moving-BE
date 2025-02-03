import { IsBoolean, IsNumber, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryStringDto {
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isRead: boolean | undefined;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  limit: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  cursor: number | undefined;
}
