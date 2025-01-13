import { PrismaService } from 'src/prisma.service';
import { CreateQuoteDto } from './dto/create.quote.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class QuoteRepository {
  constructor(private readonly prismaClient: PrismaService) {}

  getQuoteCountByMovingRequestId(movingRequestId: number) {
    return this.prismaClient.quote.count({
      where: { movingRequestId },
    });
  }

  getQuotesByMovingRequestId(movingRequestId: number, isCompleted = false) {
    return this.prismaClient.quote.findMany({
      where: {
        movingRequestId,
        ...(isCompleted
          ? {
              confirmedQuote: {
                isNot: null,
              },
            }
          : {}),
      },
      select: {
        id: true,
        cost: true,
        comment: true,
        movingRequest: {
          select: {
            service: true,
            movingDate: true,
            createdAt: true,
            pickupAddress: true,
            dropOffAddress: true,
          },
        },
        confirmedQuote: {
          select: {
            id: true,
          },
        },
        mover: {
          select: {
            id: true,
            nickname: true,
            imageUrl: true,
            career: true,
            introduction: true,
            services: true,
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
            _count: {
              select: {
                review: true,
                favorite: true,
                confirmedQuote: true,
              },
            },
            favorite: {
              select: {
                id: true,
              },
            },
            movingRequest: {
              select: {
                id: true,
                service: true,
              },
            },
          },
        },
      },
    });
  }

  getQuoteById(quoteId: number) {
    return this.prismaClient.quote.findUnique({
      where: { id: quoteId },
      select: {
        id: true,
        cost: true,
        comment: true,
        movingRequest: {
          select: {
            service: true,
            createdAt: true,
            movingDate: true,
            pickupAddress: true,
            dropOffAddress: true,
            isDesignated: true,
            confirmedQuote: {
              select: {
                id: true,
              },
            },
          },
        },
        confirmedQuote: {
          select: {
            id: true,
          },
        },
        mover: {
          select: {
            id: true,
            nickname: true,
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
            introduction: true,
            services: true,
            regions: true,
            // review: true,
            career: true,
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
            _count: {
              select: {
                review: true,
                favorite: true,
                confirmedQuote: true,
              },
            },
            favorite: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });
  }

  getQuotesByMoverId(moverId: number, limit: number, cursor: number) {
    return this.prismaClient.quote.findMany({
      where: { moverId },
      take: limit + 1,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        cost: true,
        comment: true,
        createdAt: true,
        movingRequest: {
          select: {
            service: true, // service로 매핑 필요
            movingDate: true,
            pickupAddress: true,
            dropOffAddress: true,
            isDesignated: true,
            customer: {
              select: {
                user: {
                  // User와의 관계를 통해 name을 가져옴
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
        confirmedQuote: {
          select: {
            id: true,
            createdAt: true,
          },
        },
      },
    });
  }

  create(
    movingRequestId: number,
    moverId: number,
    createQuoteDto: CreateQuoteDto,
  ) {
    return this.prismaClient.quote.create({
      data: {
        ...createQuoteDto,
        movingRequestId,
        moverId,
      },
      select: {
        id: true, // 생성된 견적서의 ID
        cost: true, // 생성된 견적서의 비용
        comment: true, // 생성된 견적서의 코멘트
        movingRequest: {
          select: {
            pickupAddress: true,
            dropOffAddress: true,
            movingDate: true,
            isDesignated: true,
            service: true,
          },
        },
      },
    });
  }
}
