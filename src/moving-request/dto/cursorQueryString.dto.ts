import { Transform } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class CursorQueryStringDto {
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  limit: number;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isDesignated: boolean;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  cursor: number;

  @IsOptional()
  @IsString()
  keyword: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  smallMove: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  houseMove: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  officeMove: boolean;

  @IsOptional()
  @IsString()
  orderBy: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isQuoted: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isPastRequest: boolean;
}
