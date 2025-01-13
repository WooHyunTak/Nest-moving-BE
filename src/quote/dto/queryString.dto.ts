import { IsOptional, IsNumber, IsString } from 'class-validator';

export class QueryStringDto {
  @IsOptional()
  @IsNumber()
  limit: number;

  @IsOptional()
  @IsNumber()
  cursor: number;

  @IsOptional()
  @IsString()
  orderBy?: string;
}
