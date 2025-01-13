import { UserDto } from './user.dto';

export class MoverDto extends UserDto {
  nickname: string;
  career: number;
  introduction: string;
  description: string;
  imageUrl: string;
  services: number[];
  regions: number[];
}
