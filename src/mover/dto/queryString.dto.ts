import { Transform } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class QueryString {
  @IsOptional()
  @IsString()
  orderBy: string;
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  region: number;
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  service: number;
  @IsOptional()
  @IsString()
  keyword: string;
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  limit: number;
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  cursor: number;
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isFavorite: boolean;
}
