import {
  Controller,
  Get,
  Next,
  Param,
  Patch,
  Body,
  HttpException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { NextFunction } from 'express';
import { UpdateUserDto } from './dto/update.user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getUser() {
    try {
      const user = this.userService.getUser(1);
      return user;
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  @Patch()
  updateUser(@Body() data: UpdateUserDto) {
    try {
      return this.userService.updateUser(1, data);
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }
}
