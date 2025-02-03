import { Controller, Post, Body, Param, Get, Query } from '@nestjs/common';
import { QuoteService } from './quote.service';
import { TokenPayload } from 'src/common/dto/tokenPayload.dto';
import { CreateQuoteDto } from './dto/create.quote.dto';
import { User } from 'src/common/decorators/user.decorator';
import { QueryStringDto } from './dto/queryString.dto';
import { AuthGuard } from '@nestjs/passport';
import { UseGuards } from '@nestjs/common';
import { CreateQuoteValidationPipe } from './pipes/create.validation.pipe';

@Controller('quotes')
export class QuoteController {
  constructor(private readonly quoteService: QuoteService) {}

  @Post(':id')
  async createQuote(
    @Body(CreateQuoteValidationPipe) body: CreateQuoteDto,
    @User() user: TokenPayload,
    @Param('id') movingRequestId: number,
  ) {
    const { moverId } = user;
    const quote = await this.quoteService.createQuote(
      movingRequestId,
      moverId,
      body,
    );
    return quote;
  }

  @Get('mover')
  async getQuoteByMoverId(
    @User() user: TokenPayload,
    @Query() query: QueryStringDto,
  ) {
    const { moverId } = user;
    const { limit = 10, cursor = 0 } = query;
    const quotes = await this.quoteService.getQuoteByMoverId(moverId, {
      limit,
      cursor,
    });
    return quotes;
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async getQuoteById(@Param('id') quoteId: number, @User() user: TokenPayload) {
    const { customerId } = user;
    const quote = await this.quoteService.getQuoteById(customerId, quoteId);
    return quote;
  }
}
