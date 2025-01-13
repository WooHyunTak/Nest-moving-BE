import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  IsNumber,
} from 'class-validator';

export class CreateCustomerDto {
  @IsNotEmpty()
  @IsString()
  name: string;
  @IsOptional()
  @IsString()
  imageUrl: string;
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  regions: number[];
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  services: number[];
}
