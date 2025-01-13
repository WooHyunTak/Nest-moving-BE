import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { WhereConditions } from './dto/whereConditions';
import { MoverProfile } from './dto/moverProfile';
import { UpdateMoverDto } from './dto/update.mover.dto';

interface UpdateMoverProfile {
  nickname?: string;
  career?: number;
  introduction?: string;
  description?: string;
  services?: number[];
  regions?: number[];
}

const defaultSelect = {
  id: true,
  services: true,
  nickname: true,
  career: true,
  regions: true,
  introduction: true,
  description: true,
  _count: {
    select: {
      review: true,
      favorite: true,
      confirmedQuote: true,
    },
  },
};

@Injectable()
export class MoverRepository {
  constructor(private readonly prismaClient: PrismaService) {}

  getMoverCount(where: WhereConditions) {
    return this.prismaClient.mover.count({
      where,
    });
  }

  getMoverList(
    orderBy: { [key: string]: string | object },
    where: WhereConditions,
    cursor: number | null,
    limit: number,
  ) {
    return this.prismaClient.mover.findMany({
      orderBy: [orderBy, { id: 'asc' }],
      where,
      take: limit + 1,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      select: {
        ...defaultSelect,
        imageUrl: {
          where: {
            status: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          select: {
            imageUrl: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
        favorite: {
          select: {
            id: true,
          },
        },
      },
    });
  }

  getMoverById = (customerId: number | null, moverId: number) => {
    return this.prismaClient.mover.findUnique({
      where: { id: moverId },
      select: {
        ...defaultSelect,
        imageUrl: {
          where: {
            status: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          select: {
            imageUrl: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
        ...(customerId
          ? {
              favorite: {
                where: {
                  id: customerId,
                },
                select: {
                  id: true,
                },
              },
            }
          : {}),
      },
    });
  };

  async getRatingsByMoverIds(moverIds: number[]) {
    const ratings = await this.prismaClient.review.groupBy({
      where: {
        moverId: {
          in: moverIds,
        },
      },
      by: ['moverId', 'rating'],
      _count: {
        rating: true,
      },
    });

    return ratings;
  }

  moverFavorite = async (customerId: number, moverId: number) => {
    return this.prismaClient.mover.update({
      where: { id: moverId },
      data: { favorite: { connect: { id: customerId } } },
      select: {
        id: true,
      },
    });
  };

  moverFavoriteCancel = async (customerId: number, moverId: number) => {
    return this.prismaClient.mover.update({
      where: { id: moverId },
      data: { favorite: { disconnect: { id: customerId } } },
      select: {
        id: true,
      },
    });
  };

  getMoverByFavorite = (customerId: number, limit: number, cursor: number) => {
    return this.prismaClient.mover.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      where: { favorite: { some: { id: customerId } } },
      select: {
        ...defaultSelect,
        imageUrl: {
          where: {
            status: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          select: {
            imageUrl: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
        favorite: {
          select: {
            id: true,
          },
        },
      },
    });
  };

  createMoverProfile = (profile: MoverProfile) => {
    return this.prismaClient.mover.create({
      data: {
        ...profile,
        imageUrl: { create: { imageUrl: profile.imageUrl } },
      },
    });
  };

  updateMoverProfile = async (
    imageUrl: string | undefined,
    userId: number,
    moverId: number,
    profile: UpdateMoverDto,
  ) => {
    //이미지url 여부에 따라 조건부 트랜잭션 생성
    const imageTransactions = imageUrl
      ? [
          this.prismaClient.profileImage.updateMany({
            where: {
              moverId,
              status: true,
            },
            data: {
              status: false,
            },
          }),
          this.prismaClient.profileImage.create({
            data: {
              imageUrl,
              moverId,
              status: true,
            },
          }),
        ]
      : [];

    const { userId: _, imageUrl: __, ...updateData } = profile;
    const profileTransaction = this.prismaClient.mover.update({
      where: { userId: userId },
      data: updateData,
    });

    const transactions = [...imageTransactions, profileTransaction];

    return this.prismaClient.$transaction(transactions);
  };
}
