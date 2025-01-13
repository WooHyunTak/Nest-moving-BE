import { Injectable, NotFoundException } from '@nestjs/common';
import { QuoteRepository } from './quote.repository';
import processQuoteData from '../common/utills/quotes/processQuoteData';
import { MovingRequestRepository } from '../moving-request/moving-request.repository';
import { throwHttpError } from 'src/common/utills/constructors/httpError';
import { MoverRepository } from 'src/mover/mover.repository';
import { CreateQuoteDto } from './dto/create.quote.dto';
import { QueryStringDto } from './dto/queryString.dto';

@Injectable()
export class QuoteService {
  constructor(
    private readonly quoteRepository: QuoteRepository,
    private readonly movingRequestRepository: MovingRequestRepository,
    private readonly moverRepository: MoverRepository,
  ) {}

  getQuoteById = async (customerId: number, quoteId: number) => {
    const quote = await this.quoteRepository.getQuoteById(quoteId);

    if (!quote) {
      throw new NotFoundException('견적을 찾을 수 없습니다.');
    }

    const processedQuote = await processQuoteData(
      customerId,
      quote,
      this.movingRequestRepository,
      this.moverRepository,
    );

    return processedQuote;
  };

  async createQuote(
    movingRequestId: number,
    moverId: number,
    createQuoteDto: CreateQuoteDto,
  ) {
    const movingRequest =
      await this.movingRequestRepository.getMovingRequestById(movingRequestId);

    if (!movingRequest) {
      throw new NotFoundException('이사요청이 존재하지 않습니다.');
    }

    const quote = await this.quoteRepository.create(
      movingRequest.id,
      moverId,
      createQuoteDto,
    );

    return quote;
  }

  async getQuoteByMoverId(moverId: number, query: QueryStringDto) {
    const { limit, cursor } = query;
    const quotes = await this.quoteRepository.getQuotesByMoverId(
      moverId,
      limit,
      cursor,
    );

    const hasNext = quotes.length > limit;
    const nextCursor = hasNext ? quotes[quotes.length - 1].id : null;

    const processedQuotes = quotes.map((quote) => {
      const { movingRequest, confirmedQuote, createdAt, ...rest } = quote;
      const { customer, ...restMovingRequest } = movingRequest;
      let isCompleted = false;
      if (confirmedQuote && movingRequest.movingDate < new Date()) {
        isCompleted = true;
      }
      return {
        ...rest,
        isCompleted,
        isConfirmed: !!confirmedQuote,
        movingRequest: {
          ...restMovingRequest,
          name: customer.user.name,
        },
      };
    });

    return {
      nextCursor,
      hasNext,
      list: processedQuotes,
    };
  }
}
