import { UserDto } from './user.dto';

export class CustomerDto extends UserDto {
  imageUrl: string;
  services: number[];
  regions: number[];
}
