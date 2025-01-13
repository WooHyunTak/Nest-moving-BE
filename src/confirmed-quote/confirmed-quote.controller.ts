import {
  Controller,
  Post,
  Param,
  Body,
  UseGuards,
  Get,
  Query,
} from '@nestjs/common';
import { ConfirmedQuoteService } from './confirmed-quote.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/common/decorators/user.decorator';
import { TokenPayload } from 'src/common/dto/tokenPayload.dto';
import { OffsetQueryStringDto } from './dto/queryString.dto';

@Controller('confirmed-quote')
export class ConfirmedQuoteController {
  constructor(private readonly confirmedQuoteService: ConfirmedQuoteService) {}

  @Post(':id')
  @UseGuards(AuthGuard('jwt'))
  async createConfirmedQuote(
    @Param('id') quoteId: number,
    @User() user: TokenPayload,
  ) {
    const { customerId } = user;
    const confirmedQuote =
      await this.confirmedQuoteService.createConfirmedQuote(
        quoteId,
        customerId,
      );
    return confirmedQuote;
  }

  @Get('available-reviews')
  @UseGuards(AuthGuard('jwt'))
  async getAvailableReviews(
    @Query() query: OffsetQueryStringDto,
    @User() user: TokenPayload,
  ) {
    const { customerId } = user;
    const { pageSize = 10, pageNum = 1 } = query;
    const availableReviews =
      await this.confirmedQuoteService.getAvailableReviews(
        customerId,
        pageSize,
        pageNum,
      );
    return availableReviews;
  }
}
