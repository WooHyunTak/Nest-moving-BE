import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CustomerDto } from './dto/customer.dto';
import { MoverDto } from './dto/mover.dto';
import { UpdateUserDto } from './dto/update.user.dto';
import { SignupDto } from 'src/auth/dto/signup.dto';

@Injectable()
export class UserRepository {
  constructor(private readonly prismaClient: PrismaService) {}

  findByEmail = (email: string) => {
    return this.prismaClient.user.findUnique({
      where: { email: email },
      select: {
        id: true,
        password: true,
        customer: {
          select: { id: true },
        },
        mover: {
          select: { id: true },
        },
      },
    });
  };

  findByUserId = (userId: number) => {
    return this.prismaClient.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        customer: {
          select: { id: true },
        },
        mover: {
          select: { id: true },
        },
      },
    });
  };

  findById = (userId: number) => {
    return this.prismaClient.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        phoneNumber: true,
        password: true,
      },
    });
  };

  existingUser = (email: string, phoneNumber: string) => {
    return this.prismaClient.user.findFirst({
      where: { OR: [{ email }, { phoneNumber }] },
    });
  };

  createUser = (user: SignupDto, userType: string) => {
    return this.prismaClient.user.create({
      data: {
        ...user,
        userType: userType,
      },
    });
  };

  createCustomer = (customer: CustomerDto) => {
    const {
      name,
      email,
      password,
      phoneNumber,
      isOAuth,
      imageUrl,
      services,
      regions,
    } = customer;

    const userData = {
      name,
      email,
      password,
      phoneNumber,
      isOAuth,
    };

    const customerData = {
      services,
      regions,
    };

    return this.prismaClient.user.create({
      data: {
        ...userData,
        customer: {
          create: {
            ...customerData,
            imageUrl: { create: { imageUrl } },
          },
        },
      },
    });
  };

  createMover = (mover: MoverDto) => {
    const {
      name,
      email,
      password,
      phoneNumber,
      isOAuth,
      nickname,
      career,
      introduction,
      description,
      imageUrl,
      services,
      regions,
    } = mover;

    const userData = {
      name,
      email,
      password,
      phoneNumber,
      isOAuth,
    };

    const moverData = {
      nickname,
      career,
      introduction,
      description,
      services,
      regions,
    };

    return this.prismaClient.user.create({
      data: {
        ...userData,
        mover: {
          create: {
            ...moverData,
            imageUrl: { create: { imageUrl } },
          },
        },
      },
    });
  };

  getCustomer = (userId: number) => {
    return this.prismaClient.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        isOAuth: true,
        customer: {
          select: {
            id: true,
            imageUrl: {
              where: {
                status: true,
              },
              select: {
                imageUrl: true,
              },
            },
            services: true,
            regions: true,
          },
        },
      },
    });
  }; //orderBy 추가

  getMover = (userId: number) => {
    return this.prismaClient.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        isOAuth: true,
        mover: {
          select: {
            id: true,
            nickname: true,
            career: true,
            introduction: true,
            description: true,
            imageUrl: {
              where: {
                status: true,
              },
              select: {
                imageUrl: true,
              },
            },
            services: true,
            regions: true,
          },
        },
      },
    });
  };

  getSocialUser = (userId: number) => {
    return this.prismaClient.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phoneNumber: true,
        isOAuth: true,
        customer: {
          select: { id: true },
        },
        mover: {
          select: { id: true },
        },
      },
    });
  };

  getUserType = async (userId: number) => {
    const user = await this.prismaClient.user.findUnique({
      where: { id: userId },
      select: {
        customer: {
          select: { id: true },
        },
        mover: {
          select: { id: true },
        },
      },
    });
    if (user?.customer) {
      return 'customer';
    } else if (user?.mover) {
      return 'mover';
    } else {
      return 'social';
    }
  };

  updateUser = async (userId: number, data: UpdateUserDto) => {
    return this.prismaClient.user.update({
      where: { id: userId },
      data,
    });
  };

  findPassword = (userId: number) => {
    return this.prismaClient.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });
  };
}
