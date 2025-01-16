import { IsBoolean, IsEmail, IsNumber, IsString } from 'class-validator';

export class SignupDto {
  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsString()
  password: string;

  @IsNumber()
  services: number[];

  @IsString()
  phoneNumber: string;

  @IsNumber()
  regions: number[];

  @IsString()
  imageUrl: string;

  @IsBoolean()
  isOAuth: boolean;
}
