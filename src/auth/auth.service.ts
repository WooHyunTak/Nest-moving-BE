import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from '../user/user.repository';
import bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly userRepository: UserRepository) {}

  async login(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
    }

    const { password: currentPassword, ...userWithoutPassword } = user;

    return userWithoutPassword;
  }
}
