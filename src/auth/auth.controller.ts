import { Controller, Post, Body, Res, HttpException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import createToken from 'src/common/utills/createtoken';
import {
  cookieOptions,
  refreshCookieOptions,
} from 'src/common/config/cookieOptions';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    try {
      const user = await this.authService.login(
        loginDto.email,
        loginDto.password,
      );
      const accessToken = createToken(user);
      const refreshToken = createToken(user, 'refresh');

      res.cookie('access_token', accessToken, cookieOptions);
      res.cookie('refresh_token', refreshToken, refreshCookieOptions);

      return res.status(204).send();
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }
}
