import {
  Controller,
  Get,
  Next,
  Param,
  Patch,
  Body,
  HttpException,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { NextFunction } from 'express';
import { UpdateUserDto } from './dto/update.user.dto';
import { AuthGuard } from '@nestjs/passport';
import { TokenPayload } from 'src/common/dto/tokenPayload.dto';
import { User } from 'src/common/decorators/user.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getUser(@User() user: TokenPayload) {
    try {
      const { id } = user;
      const userInfo = await this.userService.getUser(id);
      return userInfo;
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  @Patch()
  @UseGuards(AuthGuard('jwt'))
  updateUser(@Body() data: UpdateUserDto, @User() user: TokenPayload) {
    try {
      const { id } = user;
      return this.userService.updateUser(id, data);
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }
}
