import { IsNotEmpty } from 'class-validator';

export class CreateMovingRequestDto {
  @IsNotEmpty()
  moverId: number;
  @IsNotEmpty()
  movingDate: Date;
  @IsNotEmpty()
  pickupAddress: string;
  @IsNotEmpty()
  dropOffAddress: string;
  @IsNotEmpty()
  service: number;
  @IsNotEmpty()
  region: number;
}
