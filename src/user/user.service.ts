import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRepository } from './user.repository';
import { throwHttpError } from 'src/common/utills/constructors/httpError';
import { env } from 'src/common/config/env';
import { UpdateUserDto } from './dto/update.user.dto';
import bcrypt from 'bcrypt';

interface CustomerResponse {
  customer: {
    id: number;
    imageUrl: string | { imageUrl: string }[];
    services: number[];
    regions: number[];
  };
}

interface MoverResponse {
  mover: {
    id: number;
    imageUrl: string | { imageUrl: string }[];
    services: number[];
    regions: number[];
    nickname: string;
    career: number;
    introduction: string;
    description: string;
  };
}

interface SocialUserResponse {
  id: number;
  email: string;
  name: string;
  phoneNumber: string;
  isOAuth: boolean;
  mover: null;
  customer: null;
}

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getUser(userId: number) {
    const userType = await this.userRepository.getUserType(userId);

    if (userType === 'customer') {
      const response = (await this.userRepository.getCustomer(
        userId,
      )) as CustomerResponse;
      if (!response || !response.customer) {
        throw new NotFoundException('고객 정보를 찾을 수 없습니다.');
      }

      const customer = response.customer;

      if (!customer.imageUrl || customer.imageUrl.length === 0) {
        customer.imageUrl = env.DEFAULT_PROFILE_IMAGE;
      } else {
        customer.imageUrl =
          typeof customer.imageUrl[0] === 'string'
            ? customer.imageUrl[0]
            : customer.imageUrl[0]?.imageUrl || env.DEFAULT_PROFILE_IMAGE;
      }

      return { ...response, customer };
    } else if (userType === 'mover') {
      const response = await this.userRepository.getMover(userId);
      const mover = response?.mover;
      if (!mover?.imageUrl) {
        mover.imageUrl = [{ imageUrl: env.DEFAULT_PROFILE_IMAGE }];
      } else {
        mover.imageUrl[0].imageUrl =
          mover.imageUrl[0]?.imageUrl || env.DEFAULT_PROFILE_IMAGE;
      }
      return response;
    } else if (userType === 'social') {
      const response = await this.userRepository.getSocialUser(userId);
      return response;
    } else {
      throw new NotFoundException('사용자가 존재하지 않습니다.');
    }
  }

  async getByID(userId: number) {
    const user = await this.userRepository.findByUserId(userId);
    if (!user) {
      throw new NotFoundException('사용자가 존재하지 않습니다.');
    }
    return user;
  }

  async updateUser(userId: number, data: UpdateUserDto) {
    const user = await this.userRepository.findById(userId);

    if (data.newPassword || data.currentPassword) {
      //새로운 비밀번호, 현재 비밀번호가 존재하면 일단 로직 수행
      if (!data.newPassword || !data.currentPassword) {
        //그런데 둘 중 하나라도 없으면 에러 발생
        throw new BadRequestException(
          '비밀번호 변경을 위해서는 현재 비밀번호와 새로운 비밀번호가 모두 필요합니다.',
        );
      }

      const isPasswordCorrect = await bcrypt.compare(
        data.currentPassword,
        user!.password!,
      );

      if (!isPasswordCorrect) {
        throw new UnauthorizedException('현재 비밀번호가 일치하지 않습니다.');
      }

      if (data.currentPassword === data.password) {
        throw new ConflictException('기존 비밀번호와 동일합니다.');
      }
    }

    const updateUserData: {
      name?: string;
      phoneNumber?: string;
      password?: string;
    } = {};

    if (data.name) updateUserData.name = data.name;
    if (data.phoneNumber) updateUserData.phoneNumber = data.phoneNumber;
    if (data.password) {
      updateUserData.password = await bcrypt.hash(data.password, 10);
    }

    return await this.userRepository.updateUser(userId, updateUserData);
  }
}
