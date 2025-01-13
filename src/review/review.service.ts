import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ReviewRepository } from './review.repository';
import { OffsetQueryStringDto } from './dto/queryString.dto';
import { CreateReviewDto } from './dto/create.review.dto';
import { ConfirmedQuoteRepository } from 'src/confirmed-quote/confirmed-quote.repository';
import {
  HttpError,
  throwHttpError,
} from 'src/common/utills/constructors/httpError';

@Injectable()
export class ReviewService {
  constructor(
    private readonly reviewRepository: ReviewRepository,
    private readonly confirmedQuoteRepository: ConfirmedQuoteRepository,
  ) {}

  async getMoverReviewList(moverId: number, query: OffsetQueryStringDto) {
    const [reviewList, totalCount] = await Promise.all([
      this.reviewRepository.getMoverReviewList(moverId, query),
      this.reviewRepository.getMoverReviewCount(moverId),
    ]);

    return {
      currentPage: query.pageNum,
      pageSize: query.pageSize,
      totalPages: Math.ceil(totalCount / query.pageSize),
      totalCount,
      list: reviewList.map((review) => ({
        id: review.id,
        service: review.confirmedQuote.movingRequest.service,
        isDesignated: review.confirmedQuote.movingRequest.isDesignated,
        imageUrl: review.mover.imageUrl[0]?.imageUrl ?? '',
        reviewImageUrl: review.imageUrl ?? [], // string[] -> string
        name: review.customer.user.name, // review.mover.nickname,
        movingDate: review.confirmedQuote.movingRequest.movingDate,
        cost: review.confirmedQuote.quote.cost,
        rating: review.rating,
        content: review.content,
        createdAt: review.createdAt,
      })),
    };
  }

  async getCustomerReviewList(customerId: number, query: OffsetQueryStringDto) {
    const [reviewList, totalCount] = await Promise.all([
      this.reviewRepository.getCustomerReviewList(customerId, query),
      this.reviewRepository.getCustomerReviewCount(customerId),
    ]);

    return {
      currentPage: query.pageNum,
      pageSize: query.pageSize,
      totalPages: Math.ceil(totalCount / query.pageSize),
      totalCount,
      list: reviewList.map((review) => ({
        id: review.id,
        service: review.confirmedQuote.movingRequest.service,
        isDesignated: review.confirmedQuote.movingRequest.isDesignated,
        imageUrl: review.mover.imageUrl[0]?.imageUrl ?? '',
        reviewImageUrl: review.imageUrl ?? [],
        nickname: review.mover.nickname,
        movingDate: review.confirmedQuote.movingRequest.movingDate,
        cost: review.confirmedQuote.quote.cost,
        rating: review.rating,
        content: review.content,
        createdAt: review.createdAt,
      })),
    };
  }

  async createReview(
    confirmedQuoteId: number,
    customerId: number,
    body: CreateReviewDto,
  ) {
    const { rating, content, imageUrl } = body;
    const confirmedQuote =
      await this.confirmedQuoteRepository.getById(confirmedQuoteId);

    if (!confirmedQuote) {
      throw new NotFoundException('작성가능한 견적서가 없습니다.');
    }

    if (confirmedQuote.review.length > 0) {
      throw new BadRequestException('이미 리뷰를 작성하였습니다.');
    }

    return this.reviewRepository.createReview({
      confirmedQuoteId,
      customerId,
      moverId: confirmedQuote.mover.id,
      rating,
      content,
      imageUrl,
    });
  }
}
