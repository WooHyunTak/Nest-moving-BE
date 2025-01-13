export class UserDto {
  name: string;
  email: string;
  password?: string | null;
  phoneNumber?: string | null;
  isOAuth: boolean;
}
