import {
  Controller,
  Get,
  HttpException,
  Next,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { QueryStringDto } from './dto/queryString.dto';
import { AuthGuard } from '@nestjs/passport';
import { TokenPayload } from 'src/common/dto/tokenPayload.dto';
import { User } from 'src/common/decorators/user.decorator';
import { NextFunction } from 'express';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async findNotifications(
    @Query() query: QueryStringDto,
    @User() user: TokenPayload,
  ) {
    try {
      const { id: userId } = user;
      const { isRead = false, limit = 10, cursor = 0 } = query;
      return await this.notificationService.findNotifications(userId, {
        isRead,
        limit,
        cursor,
      });
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  @Post(':id')
  @UseGuards(AuthGuard('jwt'))
  async readNotification(@Param('id') notificationId: number) {
    try {
      return await this.notificationService.isReadNotification(notificationId);
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }
}
