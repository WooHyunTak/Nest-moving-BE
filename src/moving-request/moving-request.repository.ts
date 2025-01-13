import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateMovingRequestDto } from './dto/create-moving-request.dto';
import { QueryStringDto } from './dto/queryString.dto';
import { WhereConditionDto } from './dto/whereCondition.dto';
import { OffsetQueryStringDto } from './dto/offsetQueryString.dto';

@Injectable()
export class MovingRequestRepository {
  constructor(private readonly prismaClient: PrismaService) {}

  getMovingRequestById(movingRequestId: number) {
    return this.prismaClient.movingRequest.findUnique({
      where: { id: movingRequestId },
      select: {
        id: true,
        customerId: true,
        mover: {
          select: {
            id: true,
          },
        },
      },
    });
  }

  create(customerId: number, createMovingRequestDto: CreateMovingRequestDto) {
    return this.prismaClient.movingRequest.create({
      data: {
        ...createMovingRequestDto,
        customerId,
      },
      select: {
        id: true,
        service: true,
        movingDate: true,
        pickupAddress: true,
        dropOffAddress: true,
      },
    });
  }

  getAllByMover(query: QueryStringDto, where: WhereConditionDto) {
    const { limit, cursor, orderBy } = query;

    return this.prismaClient.movingRequest.findMany({
      where,
      orderBy,
      take: limit + 1, //커서 페이지 넘버 계산을 위해 1개 더 조회
      skip: cursor ? 1 : 0, //커서 자신을 스킵하기 위함
      cursor: cursor ? { id: cursor } : undefined,
      select: {
        id: true,
        service: true,
        movingDate: true,
        pickupAddress: true,
        dropOffAddress: true,
        createdAt: true,
        _count: {
          select: {
            mover: true,
          },
        },
        confirmedQuote: {
          select: {
            id: true,
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
        isRejected: {
          select: {
            id: true,
          },
        },
      },
    });
  }

  getAllByCustomer(customerId: number, query: OffsetQueryStringDto) {
    const { pageSize, pageNum } = query;

    return this.prismaClient.movingRequest.findMany({
      where: {
        customerId,
      },
      orderBy: { createdAt: 'desc' },
      take: pageSize,
      skip: (pageNum - 1) * pageSize, //페이지 번호 계산 2가 오면 기존의 1페이지의 수를 스킵
      select: {
        id: true,
        service: true,
        movingDate: true,
        pickupAddress: true,
        dropOffAddress: true,
        createdAt: true,
        confirmedQuote: {
          select: {
            id: true,
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
      },
    });
  }

  getQuotesByMovingRequestId(movingRequestId: number, isCompleted: boolean) {
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

  getTotalCount(where: WhereConditionDto = {}) {
    return this.prismaClient.movingRequest.count({
      where,
    });
  }

  getTotalCountByCustomer(customerId: number) {
    return this.prismaClient.movingRequest.count({
      where: {
        customerId,
      },
    });
  }

  getCountByDesignated(moverId: number, where: WhereConditionDto = {}) {
    return this.prismaClient.movingRequest.count({
      where: {
        ...where,
        mover: {
          some: {
            id: moverId,
          },
        },
      },
    });
  }

  async getCountByServices(where: WhereConditionDto = {}) {
    const counts = await this.prismaClient.movingRequest.groupBy({
      where,
      by: ['service'],
      _count: {
        service: true,
      },
    });

    const result: {
      smallMove: number;
      houseMove: number;
      officeMove: number;
    } = {
      smallMove: 0,
      houseMove: 0,
      officeMove: 0,
    };

    counts.forEach((count) => {
      switch (count.service) {
        case 1:
          result.smallMove = count._count.service;
          break;
        case 2:
          result.houseMove = count._count.service;
          break;
        case 3:
          result.officeMove = count._count.service;
          break;
      }
    });

    return result;
  }

  getActiveRequest(customerId: number) {
    return this.prismaClient.movingRequest.findFirst({
      where: {
        customerId,
        confirmedQuote: {
          is: null,
        },
        movingDate: {
          gt: new Date(),
        },
      },
      select: {
        id: true,
        mover: {
          select: {
            id: true,
          },
        },
      },
    });
  }

  getDesignateCount(movingRequestId: number) {
    return this.prismaClient.movingRequest.findUnique({
      where: { id: movingRequestId },
      select: {
        _count: {
          select: {
            mover: true,
          },
        },
      },
    });
  }

  //이사요청 지정
  updateDesignated = (movingRequestId: number, moverId: number) => {
    return this.prismaClient.movingRequest.update({
      where: { id: movingRequestId },
      data: {
        isDesignated: true,
        designateCount: {
          increment: 1,
        },
        mover: {
          connect: {
            id: moverId,
          },
        },
      },
      select: {
        _count: {
          select: {
            mover: true,
          },
        },
        mover: {
          where: {
            id: moverId,
          },
          select: {
            id: true,
            nickname: true,
            user: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });
  };

  //이사요청 지정 취소
  updateDesignatedCancel = (movingRequestId: number, moverId: number) => {
    return this.prismaClient.movingRequest.update({
      where: { id: movingRequestId },
      data: {
        designateCount: {
          decrement: 1,
        },
        mover: {
          disconnect: {
            id: moverId,
          },
        },
      },
      select: {
        _count: {
          select: {
            mover: true,
          },
        },
      },
    });
  };

  getDesignatedMovers = (movingRequestId: number, moverId: number) => {
    return this.prismaClient.movingRequest.findUnique({
      where: {
        id: movingRequestId,
        mover: {
          some: {
            id: moverId,
          },
        },
      },
      select: {
        mover: {
          select: {
            id: true,
            nickname: true,
          },
        },
      },
    });
  };

  rejectMovingRequest(
    movingRequestId: number,
    moverId: number,
    isDesignated: boolean = false, //서비스 정책의 따라 확장 및 변경 가능
  ) {
    return this.prismaClient.movingRequest.update({
      where: { id: movingRequestId },
      data: {
        isRejected: {
          connect: {
            id: moverId,
          },
        },
        ...(isDesignated
          ? {
              mover: {
                disconnect: {
                  id: moverId,
                },
              },
              isRejected: {
                connect: {
                  id: moverId,
                },
              },
            }
          : {}),
      },
    });
  }

  findAllByCustomer(customerId: number) {
    return this.prismaClient.movingRequest.findMany({
      where: {
        customerId,
      },
    });
  }
}
