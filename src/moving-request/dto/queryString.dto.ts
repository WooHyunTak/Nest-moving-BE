import { Transform } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export class QueryStringDto {
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  limit: number;
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  cursor: number | null;
  @IsString()
  orderBy: { [key: string]: 'asc' | 'desc' };
}
