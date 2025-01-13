import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Next,
  Req,
  UseGuards,
  Res,
  HttpException,
} from '@nestjs/common';
import { MovingRequestService } from './moving-request.service';
import { CreateMovingRequestDto } from './dto/create-moving-request.dto';
import { CursorQueryStringDto } from './dto/cursorQueryString.dto';
import { NextFunction } from 'express';
import { OffsetQueryStringDto } from './dto/offsetQueryString.dto';
import { AuthGuard } from '@nestjs/passport';
import { TokenPayload } from 'src/common/dto/tokenPayload.dto';
import { User } from 'src/common/decorators/user.decorator';
import { Response } from 'express';
import { CreateMovingRequestValidationPipe } from './pipes/create.validation.pipe';

@Controller('moving-requests')
export class MovingRequestController {
  constructor(private readonly movingRequestService: MovingRequestService) {}

  @Get('by-mover')
  @UseGuards(AuthGuard('jwt'))
  async findByMoverId(
    @Query() query: CursorQueryStringDto,
    @User() user: TokenPayload,
  ) {
    try {
      const { moverId } = user;
      const {
        limit = 10,
        cursor = 0,
        isDesignated = false,
        keyword = '',
        smallMove = false,
        houseMove = false,
        officeMove = false,
        orderBy = 'recent',
        isQuoted = false,
        isPastRequest = false,
      } = query;
      const movingRequests = await this.movingRequestService.findByMoverId(
        moverId,
        {
          limit,
          cursor,
          isDesignated,
          keyword,
          smallMove,
          houseMove,
          officeMove,
          orderBy,
          isQuoted,
          isPastRequest,
        },
      );
      return movingRequests;
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  @Get('by-customer')
  @UseGuards(AuthGuard('jwt'))
  async findByCustomerId(
    @Query() query: OffsetQueryStringDto,
    @User() user: TokenPayload,
  ) {
    const { customerId } = user;
    const { pageSize = 10, pageNum = 1 } = query;

    try {
      return await this.movingRequestService.findByCustomerId(customerId, {
        pageSize,
        pageNum,
      });
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  @Get(':id/quotes')
  @UseGuards(AuthGuard('jwt'))
  async findQuotesByMovingRequestId(
    @Param('id') movingRequestId: number,
    @Query() query: { isCompleted: boolean },
    @User() user: TokenPayload,
  ) {
    const { customerId } = user;
    const { isCompleted = false } = query;
    try {
      return await this.movingRequestService.getQuotesByMovingRequestId(
        movingRequestId,
        customerId,
        isCompleted,
      );
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  @Get('pending-quotes')
  @UseGuards(AuthGuard('jwt'))
  async getPendingQuotes(@User() user: TokenPayload) {
    const { customerId } = user;
    try {
      return await this.movingRequestService.getPendingQuotes(customerId);
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  @Get('active')
  @UseGuards(AuthGuard('jwt'))
  async getActiveMovingRequests(@User() user: TokenPayload) {
    const { customerId } = user;
    try {
      return await this.movingRequestService.getActiveMovingRequests(
        customerId,
      );
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async createMovingRequest(
    @User() user: TokenPayload,
    @Body(CreateMovingRequestValidationPipe)
    createMovingRequestDto: CreateMovingRequestDto,
  ) {
    try {
      const { customerId } = user;
      const date = new Date(createMovingRequestDto.movingDate);
      return await this.movingRequestService.create(customerId, {
        ...createMovingRequestDto,
        movingDate: date,
      });
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  @Post(':id/designated')
  @UseGuards(AuthGuard('jwt'))
  async designatedMovingRequest(
    @Param('id') moverId: number,
    @User() user: TokenPayload,
    @Res() res: Response,
  ) {
    const { customerId } = user;
    try {
      const remainingCount = await this.movingRequestService.designateMover(
        moverId,
        customerId,
      );
      return res.status(200).send({
        message: '지정 요청 완료',
        designateRemain: remainingCount,
      });
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  //이사요청 반려 작업
  @Post(':id/rejected')
  @UseGuards(AuthGuard('jwt'))
  async rejectMovingRequest(
    @Param('id') movingRequestId: number,
    @User() user: TokenPayload,
  ) {
    const { moverId } = user;
    const movingRequest = await this.movingRequestService.rejectMovingRequest(
      movingRequestId,
      moverId,
    );
    return movingRequest;
  }
}
