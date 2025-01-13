import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        password: true,
        customer: {
          select: {
            id: true,
          },
        },
        mover: {
          select: {
            id: true,
          },
        },
      },
    });
  }
}
