import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { UserRepository } from 'src/user/user.repository';

@Injectable()
export class OauthService {
  constructor(
    private readonly prismaClient: PrismaService,
    private readonly userRepository: UserRepository,
  ) {}

  async google(profile: any, userType: string) {
    const user = await this.userRepository.findByEmail(profile._json.email);

    if (user) {
      return user;
    }

    const newUser = await this.userRepository.createUser(
      {
        email: profile._json.email,
        name: profile._json.name || 'Unknown',
        phoneNumber: '',
        password: '',
        isOAuth: true,
        imageUrl: profile._json.picture,
        services: [],
        regions: [],
      },
      userType,
    );
    return newUser;
  }

  async kakao(profile: any, userType: string) {
    const user = await this.userRepository.findByEmail(
      profile._json.kakao_account.email,
    );

    if (user) {
      return user;
    }

    const newUser = await this.userRepository.createUser(
      {
        email: profile._json.kakao_account.email,
        name: profile._json.kakao_account.profile.nickname || 'Unknown',
        phoneNumber: '',
        password: '',
        isOAuth: true,
        imageUrl: profile._json.kakao_account.profile.profile_image_url,
        services: [],
        regions: [],
      },
      userType,
    );
    return newUser;
  }

  async naver(profile: any, userType: string) {
    const user = await this.userRepository.findByEmail(profile._json.email);

    if (user) {
      return user;
    }

    const newUser = await this.userRepository.createUser(
      {
        email: profile._json.email,
        name: profile._json.name || 'Unknown',
        phoneNumber: '',
        password: '',
        isOAuth: true,
        imageUrl: profile._json.picture,
        services: [],
        regions: [],
      },
      userType,
    );
    return newUser;
  }
}
