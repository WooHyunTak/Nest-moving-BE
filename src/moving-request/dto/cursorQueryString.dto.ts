import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class CursorQueryStringDto {
  @IsOptional()
  @IsInt()
  limit: number;
  @IsOptional()
  @IsBoolean()
  isDesignated: boolean;
  @IsOptional()
  @IsInt()
  cursor: number;
  @IsOptional()
  @IsString()
  keyword: string;
  @IsOptional()
  @IsBoolean()
  smallMove: boolean;
  @IsOptional()
  @IsBoolean()
  houseMove: boolean;
  @IsOptional()
  @IsBoolean()
  officeMove: boolean;
  @IsOptional()
  @IsString()
  orderBy: string;
  @IsOptional()
  @IsBoolean()
  isQuoted: boolean;
  @IsOptional()
  @IsBoolean()
  isPastRequest: boolean;
}
