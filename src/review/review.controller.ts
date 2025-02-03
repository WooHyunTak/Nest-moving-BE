import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  Body,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { User } from 'src/common/decorators/user.decorator';
import { OffsetQueryStringDto } from './dto/queryString.dto';
import { TokenPayload } from 'src/common/dto/tokenPayload.dto';
import { AuthGuard } from '@nestjs/passport';
import { CreateReviewDto } from './dto/create.review.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CommonService } from 'src/common/common.service';

@Controller('reviews')
export class ReviewController {
  constructor(
    private readonly reviewService: ReviewService,
    private readonly commonService: CommonService,
  ) {}

  @Get('my-reviews')
  @UseGuards(AuthGuard('jwt'))
  async getMyReviewList(
    @Query() query: OffsetQueryStringDto,
    @User() user: TokenPayload,
  ) {
    const { customerId } = user;
    const customerReviewList = await this.reviewService.getCustomerReviewList(
      customerId,
      query,
    );
    return customerReviewList;
  }

  @Get('mover/:id')
  async getMoverReviewList(
    @Param('id') moverId: number,
    @Query() query: OffsetQueryStringDto,
  ) {
    const { pageSize = 10, pageNum = 1 } = query;
    const moverReviewList = await this.reviewService.getMoverReviewList(
      moverId,
      { pageSize, pageNum },
    );
    return moverReviewList;
  }

  @Post(':id')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FilesInterceptor('imageUrl'))
  async createReview(
    @Param('id') confirmedQuoteId: number,
    @Body() body: CreateReviewDto,
    @User() user: TokenPayload,
    @UploadedFiles() files: Express.Multer.File[], // interceptor가 파싱한 파일 배열을 메소드로 활용하도록 함
  ) {
    const { customerId } = user;
    const imageUrl = await this.commonService.uploadFiles(files, true);
    const review = await this.reviewService.createReview(
      confirmedQuoteId,
      customerId,
      {
        ...body,
        imageUrl: imageUrl,
      },
    );

    return review;
  }
}
