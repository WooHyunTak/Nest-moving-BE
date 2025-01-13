import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class QueryString {
  @IsOptional()
  @IsString()
  orderBy: string;
  @IsOptional()
  @IsNumber()
  region: number;
  @IsOptional()
  @IsNumber()
  service: number;
  @IsOptional()
  @IsString()
  keyword: string;
  @IsOptional()
  @IsNumber()
  limit: number;
  @IsOptional()
  @IsNumber()
  cursor: number;
  @IsOptional()
  @IsBoolean()
  isFavorite: boolean;
}
