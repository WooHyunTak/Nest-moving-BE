import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateReviewDto } from './dto/create.review.dto';
import { OffsetQueryStringDto } from './dto/queryString.dto';
interface CreateReviewInput extends CreateReviewDto {
  customerId: number;
  moverId: number;
  confirmedQuoteId: number;
}

@Injectable()
export class ReviewRepository {
  constructor(private readonly prismaClient: PrismaService) {}

  // 기사가 받은 리뷰 목록 조회
  getMoverReviewCount(moverId: number) {
    return this.prismaClient.review.count({
      where: { moverId },
    });
  }

  // (고객이)작성한 리뷰 목록 조회
  getCustomerReviewCount(customerId: number) {
    return this.prismaClient.review.count({
      where: { customerId },
    });
  }

  getCustomerReviewList(customerId: number, query: OffsetQueryStringDto) {
    const { pageSize = 10, pageNum = 1 } = query;
    return this.prismaClient.review.findMany({
      where: { customerId },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (pageNum - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        rating: true,
        content: true,
        createdAt: true,
        imageUrl: true,
        mover: {
          select: {
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
        confirmedQuote: {
          select: {
            movingRequest: {
              select: {
                service: true,
                isDesignated: true,
                movingDate: true,
              },
            },
            quote: {
              select: {
                cost: true,
              },
            },
          },
        },
      },
    });
  }

  getMoverReviewList(moverId: number, query: OffsetQueryStringDto) {
    const { pageSize = 10, pageNum = 1 } = query;
    return this.prismaClient.review.findMany({
      where: { moverId },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (pageNum - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        rating: true,
        content: true,
        createdAt: true,
        imageUrl: true,
        mover: {
          select: {
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
        customer: {
          select: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        confirmedQuote: {
          select: {
            movingRequest: {
              select: {
                service: true,
                isDesignated: true,
                movingDate: true,
              },
            },
            quote: {
              select: {
                cost: true,
              },
            },
          },
        },
      },
    });
  }

  createReview(review: CreateReviewInput) {
    return this.prismaClient.review.create({
      data: review,
      select: {
        id: true,
        rating: true,
        imageUrl: true,
        content: true,
      },
    });
  }
}
