import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfirmedQuoteRepository } from './confirmed-quote.repository';
import { throwHttpError } from 'src/common/utills/constructors/httpError';
import { QuoteRepository } from 'src/quote/quote.repository';
import { MovingRequestRepository } from 'src/moving-request/moving-request.repository';
import { NotificationRepository } from 'src/notification/notification.repository';

@Injectable()
export class ConfirmedQuoteService {
  constructor(
    private readonly confirmedQuoteRepository: ConfirmedQuoteRepository,
    private readonly movingRequestRepository: MovingRequestRepository,
    private readonly quoteRepository: QuoteRepository,
    private readonly notificationRepository: NotificationRepository,
  ) {}

  createConfirmedQuote = async (quoteId: number, customerId: number) => {
    const activeMovingRequestPromise =
      this.movingRequestRepository.getActiveRequest(customerId);

    const quotePromise = this.quoteRepository.getQuoteById(quoteId);

    const [activeMovingRequest, quote] = await Promise.all([
      activeMovingRequestPromise,
      quotePromise,
    ]);

    if (!activeMovingRequest) {
      throw new NotFoundException('활성중인 이사요청이 없습니다.');
    }
    if (!quote) {
      throw new NotFoundException('견적서를 찾을 수 없습니다.');
    }

    const confirmedQuote =
      await this.confirmedQuoteRepository.createConfirmedQuote({
        movingRequestId: activeMovingRequest.id,
        quoteId: quote.id,
        customerId: customerId,
        moverId: quote.mover.id,
      });

    //알림 생성 기사에게
    this.notificationRepository.createNotification({
      userId: quote.mover.user.id,
      content: `${quote.mover.nickname}기사님 ${confirmedQuote.customer.user.name}님의 이사요청이 ,확정,되었어요.`,
      isRead: false,
    });

    //알림 생성 고객에게
    this.notificationRepository.createNotification({
      userId: confirmedQuote.customer.user.id,
      content: `${quote.mover.nickname}기사님의 견적이 ,확정,되었어요.`,
      isRead: false,
    });

    return {
      message: '견적서 확정 완료',
      data: {
        id: confirmedQuote.id,
        movingRequestId: confirmedQuote.movingRequest.id,
        quoteId: confirmedQuote.quote.id,
        moverId: confirmedQuote.mover.id,
        customerId,
      },
    };
  };

  getAvailableReviews = async (
    customerId: number,
    pageSize: number,
    pageNum: number,
  ) => {
    const [availableReviews, totalCount] = await Promise.all([
      this.confirmedQuoteRepository.getAvailableReviews(
        customerId,
        pageSize,
        pageNum,
      ),
      this.confirmedQuoteRepository.getAvailableReviewsCount(customerId),
    ]);
    return {
      currentPage: pageNum,
      totalPages: Math.ceil(totalCount / pageSize),
      totalCount,
      list: availableReviews.map((confirmedQuote) => ({
        id: confirmedQuote.id,
        service: confirmedQuote.movingRequest.service,
        isDesignated: confirmedQuote.movingRequest.mover.some(
          (mover) => mover.id === confirmedQuote.mover.id,
        ),
        movingDate: confirmedQuote.movingRequest.movingDate,
        cost: confirmedQuote.quote.cost,
        imageUrl: confirmedQuote.mover.imageUrl[0]?.imageUrl ?? '',
        confirmedQuote: undefined,
        movingRequest: undefined,
        mover: undefined,
      })),
    };
  };
}
