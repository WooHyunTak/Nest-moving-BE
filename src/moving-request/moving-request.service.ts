import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateMovingRequestDto } from './dto/create-moving-request.dto';
import { CursorQueryStringDto } from './dto/cursorQueryString.dto';
import { WhereConditionDto } from './dto/whereCondition.dto';
import { MovingRequestRepository } from './moving-request.repository';
import { OffsetQueryStringDto } from './dto/offsetQueryString.dto';
import { throwHttpError } from 'src/common/utills/constructors/httpError';
import processQuotes from 'src/common/utills/quotes/processQuoteData';
import { QuoteRepository } from 'src/quote/quote.repository';
import { MoverRepository } from 'src/mover/mover.repository';
import { NotificationRepository } from 'src/notification/notification.repository';

@Injectable()
export class MovingRequestService {
  constructor(
    private readonly movingRequestRepository: MovingRequestRepository,
    private readonly quoteRepository: QuoteRepository,
    private readonly moverRepository: MoverRepository,
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async create(
    customerId: number,
    createMovingRequestDto: CreateMovingRequestDto,
  ) {
    const activeRequest =
      await this.movingRequestRepository.getActiveRequest(customerId);

    if (activeRequest) {
      throw new BadRequestException('활성중인 이사요청이 있습니다.');
    }

    const movingRequest = await this.movingRequestRepository.create(
      customerId,
      createMovingRequestDto,
    );

    return movingRequest;
  }

  async findByMoverId(moverId: number, query: CursorQueryStringDto) {
    const { limit, cursor, orderBy } = query;

    const where = this.getWhereCondition(moverId, query);
    const orderByQuery = this.getOrderBy(orderBy);

    const [countByServices, totalCount, countByDesignated, movingRequests] =
      await Promise.all([
        this.movingRequestRepository.getCountByServices(where),
        this.movingRequestRepository.getTotalCount(where),
        this.movingRequestRepository.getCountByDesignated(moverId, where),
        this.movingRequestRepository.getAllByMover(
          { limit, cursor, orderBy: orderByQuery },
          where,
        ),
      ]);

    const nextCursor =
      movingRequests.length > limit ? movingRequests[limit].id : null;
    const hasNext = Boolean(nextCursor);

    const resList = movingRequests.map((movingRequest) => {
      const {
        _count,
        customer,
        createdAt,
        confirmedQuote,
        isRejected,
        ...rest
      } = movingRequest;

      return {
        ...rest,
        requestDate: createdAt,
        isConfirmed: Boolean(confirmedQuote), //완료된 견적서와 관계가 있다면 true
        name: customer.user.name,
        isDesignated: Boolean(_count.mover), //관계가 있다면 true
        isRejected: Boolean(isRejected.length > 0), //반려된 견적서와 관계가 있다면 true
      };
    });

    return {
      nextCursor,
      hasNext,
      serviceCounts: countByServices,
      requestCounts: {
        totalCount,
        designated: countByDesignated,
      },
      list: resList.slice(0, limit),
    };
  }

  async getQuotesByMovingRequestId(
    movingRequestId: number,
    customerId: number,
    isCompleted: boolean,
  ) {
    const quotes =
      await this.movingRequestRepository.getQuotesByMovingRequestId(
        movingRequestId,
        isCompleted,
      );
    const processedQuotes = await processQuotes(
      customerId,
      quotes,
      this.movingRequestRepository,
      this.moverRepository,
    );

    return {
      movingRequestId,
      list: processedQuotes,
    };
  }

  async findByCustomerId(customerId: number, query: OffsetQueryStringDto) {
    const { pageSize, pageNum } = query;

    const movingRequestsPromise = this.movingRequestRepository.getAllByCustomer(
      customerId,
      { pageSize, pageNum },
    );

    const totalCountPromise =
      this.movingRequestRepository.getTotalCountByCustomer(customerId);

    const [movingRequests, totalCount] = await Promise.all([
      movingRequestsPromise,
      totalCountPromise,
    ]);

    if (!movingRequests) {
      throw new NotFoundException('조건의 맞는 이사요청 목록이 없습니다.');
    }

    const resList = movingRequests.map((movingRequest) => {
      const { customer, createdAt, confirmedQuote, ...rest } = movingRequest;
      return {
        ...rest,
        name: customer.user.name,
        requestDate: createdAt,
        isConfirmed: Boolean(confirmedQuote),
      };
    });

    const totalPage = Math.ceil(totalCount / pageSize);

    return {
      currentPage: pageNum,
      pageSize,
      totalPage,
      totalCount,
      list: resList,
    };
  }

  async getPendingQuotes(customerId: number) {
    const activeRequest =
      await this.movingRequestRepository.getActiveRequest(customerId);

    if (!activeRequest) {
      throw new NotFoundException('활성화된 이사요청이 없습니다.');
    }

    const quotesCountPromise =
      this.quoteRepository.getQuoteCountByMovingRequestId(activeRequest.id);

    const quotePromise = this.quoteRepository.getQuotesByMovingRequestId(
      activeRequest.id,
    );

    const [quotesCount, quotes] = await Promise.all([
      quotesCountPromise,
      quotePromise,
    ]);

    const processedQuotes = await processQuotes(
      customerId,
      quotes,
      this.movingRequestRepository,
      this.moverRepository,
    );

    return {
      totalCount: quotesCount,
      list: processedQuotes,
    };
  }

  async getActiveMovingRequests(customerId: number) {
    const activeRequest =
      await this.movingRequestRepository.getActiveRequest(customerId);

    if (!activeRequest) {
      return {
        activeRequest: false,
        message: '활성중인 이사요청이 없습니다.',
      };
    }

    return {
      activeRequest: true,
      message: '활성중인 이사요청이 있습니다.',
    };
  }

  async designateMover(moverId: number, customerId: number) {
    const activeRequest =
      await this.movingRequestRepository.getActiveRequest(customerId);

    if (!activeRequest) {
      throw new UnprocessableEntityException(
        '일반 견적 요청을 먼저 진행해 주세요.',
      );
    }

    const mover = await this.moverRepository.getMoverById(null, moverId);

    if (!mover) {
      throw new NotFoundException('기사를 찾을 수 없습니다.');
    }

    //지정 가능 인원 조회
    const designateCountPromise =
      this.movingRequestRepository.getDesignateCount(activeRequest.id);

    const designatedMoversPromise =
      this.movingRequestRepository.getDesignatedMovers(
        activeRequest.id,
        moverId,
      );

    const [result, designatedMovers] = await Promise.all([
      designateCountPromise,
      designatedMoversPromise,
    ]);

    if (designatedMovers) {
      throw new BadRequestException('이미 지정된 기사 입니다.');
    }

    //지정 가능 인원 초과 체크
    if (!result || result._count.mover >= 3) {
      throw new BadRequestException(
        '지정 요청 가능한 인원이 초과되었습니다. (최대 3명)',
      );
    }

    //이사요청 지정
    const movingRequest = await this.movingRequestRepository.updateDesignated(
      activeRequest.id,
      moverId,
    );

    //알림 생성 기사에게
    this.notificationRepository.createNotification({
      userId: moverId,
      content: `${mover.nickname}기사님 새로운 지정 요청이 있습니다.`,
      isRead: false,
    });

    //남은 지정요청 수 조회
    const designateRemain = 3 - movingRequest._count.mover;
    return designateRemain;
  }

  async rejectMovingRequest(movingRequestId: number, moverId: number) {
    const movingRequest =
      await this.movingRequestRepository.getMovingRequestById(movingRequestId);

    if (!movingRequest) {
      throw new NotFoundException('이사요청이 존재하지 않습니다.');
    }

    //지정견적인지 확인
    const isDesignated = movingRequest.mover.some(
      (mover) => mover.id === moverId,
    );

    if (isDesignated) {
      //지정견적인 경우 지정 해제와 반려
      this.movingRequestRepository.rejectMovingRequest(
        movingRequestId,
        moverId,
        true,
      );
    } else {
      //지정견적이 아닌 경우 반려
      this.movingRequestRepository.rejectMovingRequest(
        movingRequestId,
        moverId,
      );
    }

    return movingRequest;
  }

  private getOrderBy(orderBy: string) {
    let orderByQuery: { [key: string]: 'desc' | 'asc' };
    switch (orderBy) {
      case 'resent':
        orderByQuery = { createdAt: 'desc' };
        break;
      case 'movingDate':
        orderByQuery = { movingDate: 'asc' };
        break;
      default:
        orderByQuery = { createdAt: 'desc' };
    }
    return orderByQuery;
  }

  private getWhereCondition(moverId: number, query: CursorQueryStringDto) {
    const {
      keyword,
      smallMove,
      houseMove,
      officeMove,
      isDesignated,
      isQuoted,
      isPastRequest,
    } = query;
    const where: WhereConditionDto = {};

    if (keyword) {
      where.OR = [
        {
          customer: {
            user: {
              name: { contains: keyword },
            },
          },
        },
        {
          pickupAddress: {
            contains: keyword,
          },
        },
        {
          dropOffAddress: {
            contains: keyword,
          },
        },
      ];
    }

    const serviceTypes = [];
    if (smallMove) serviceTypes.push(1);
    if (houseMove) serviceTypes.push(2);
    if (officeMove) serviceTypes.push(3);

    if (serviceTypes.length > 0) {
      where.service = {
        in: serviceTypes,
      };
    }

    if (isDesignated === undefined) {
      where.mover = {};
    } else if (isDesignated) {
      where.mover = {
        some: {},
      };
    } else {
      where.mover = {
        none: {},
      };
    }

    if (isQuoted === undefined) {
      where.quote = {};
      where.isRejected = {};
    } else if (isQuoted) {
      where.OR = [
        {
          quote: {
            some: {
              moverId,
            },
          },
        },
        {
          isRejected: {
            some: {
              id: moverId,
            },
          },
        },
      ];
    } else {
      where.AND = [
        {
          quote: {
            none: {
              moverId,
            },
          },
        },
        {
          isRejected: {
            none: {
              id: moverId,
            },
          },
        },
      ];
    }

    if (isPastRequest) {
      // pastRequest가 true면 모든 날짜 조회 (where 조건 없음)
    } else {
      // pastRequest가 false면 오늘 자정 이후의 요청만 조회
      where.movingDate = {
        gt: new Date(),
      };
    }

    return where;
  }
}
