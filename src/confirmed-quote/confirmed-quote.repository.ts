import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateConfirmedQuoteDto } from './dto/create.confirmed-quote.dto';

@Injectable()
export class ConfirmedQuoteRepository {
  constructor(private readonly prismaClient: PrismaService) {}

  getById(id: number) {
    return this.prismaClient.confirmedQuote.findUnique({
      where: { id },
      select: {
        id: true,
        movingRequest: true,
        quote: true,
        mover: true,
        customer: true,
        review: { select: { id: true } },
      },
    });
  }

  // 고객이 확정한 견적 목록 조회 -> 리뷰 작성 가능한 견적 목록 조회
  getCustomerConfirmedQuoteCount(customerId: number) {
    return this.prismaClient.confirmedQuote.count({
      where: {
        customerId,
        movingRequest: {
          movingDate: {
            lt: new Date(),
          },
        },
        review: {
          none: {},
        },
      },
    });
  }

  getCustomerConfirmedQuoteList(
    customerId: number,
    query: { pageSize: number; pageNum: number },
  ) {
    const { pageSize = 10, pageNum = 1 } = query;
    return this.prismaClient.confirmedQuote.findMany({
      where: {
        customerId,
        movingRequest: {
          movingDate: {
            lt: new Date(),
          },
        },
        review: {
          none: {},
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: pageSize,
      skip: (pageNum - 1) * pageSize,
      select: {
        id: true,
        movingRequest: {
          select: {
            service: true,
            movingDate: true,
            mover: {
              select: {
                id: true,
              },
            },
          },
        },
        quote: {
          select: {
            cost: true,
          },
        },
        mover: {
          select: {
            id: true,
            nickname: true,
            imageUrl: {
              orderBy: {
                createdAt: 'desc',
              },
              where: {
                status: true,
              },
              select: {
                imageUrl: true,
              },
            },
          },
        },
      },
    });
  }

  // 견적서 확정
  createConfirmedQuote = (confirmedQuote: CreateConfirmedQuoteDto) => {
    return this.prismaClient.confirmedQuote.create({
      data: confirmedQuote,
      select: {
        id: true,
        movingRequest: {
          select: {
            id: true,
            service: true,
            movingDate: true,
            pickupAddress: true,
            dropOffAddress: true,
          },
        },
        quote: {
          select: {
            id: true,
            cost: true,
            comment: true,
          },
        },
        mover: {
          select: {
            id: true,
            imageUrl: true,
            services: true,
            nickname: true,
            career: true,
            regions: true,
            introduction: true,
          },
        },
        customer: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  };

  getAvailableReviewsCount(customerId: number) {
    return this.prismaClient.confirmedQuote.count({
      where: {
        customerId,
        movingRequest: {
          movingDate: {
            lt: new Date(),
          },
        },
        review: {
          none: {},
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  getAvailableReviews(customerId: number, pageSize: number, pageNum: number) {
    return this.prismaClient.confirmedQuote.findMany({
      where: {
        customerId,
        movingRequest: {
          movingDate: {
            lt: new Date(),
          },
        },
        review: {
          none: {},
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: pageSize,
      skip: (pageNum - 1) * pageSize,
      select: {
        id: true,
        movingRequest: {
          select: {
            service: true,
            movingDate: true,
            mover: {
              select: {
                id: true,
              },
            },
          },
        },
        quote: {
          select: {
            cost: true,
          },
        },
        mover: {
          select: {
            id: true,
            nickname: true,
            imageUrl: {
              orderBy: {
                createdAt: 'desc',
              },
              where: {
                status: true,
              },
              select: {
                imageUrl: true,
              },
            },
          },
        },
      },
    });
  }
}
