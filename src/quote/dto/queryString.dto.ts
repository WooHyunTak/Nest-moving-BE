import { Transform } from 'class-transformer';
import { IsOptional, IsNumber, IsString } from 'class-validator';

export class QueryStringDto {
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  limit: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  cursor: number;

  @IsOptional()
  @IsString()
  orderBy?: string;
}
