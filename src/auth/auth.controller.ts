import {
  Controller,
  Post,
  Body,
  Res,
  HttpException,
  Delete,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import createToken from 'src/common/utills/createtoken';
import {
  cookieOptions,
  refreshCookieOptions,
  deleteCookieOptions,
} from 'src/common/config/cookieOptions';
import { Response } from 'express';
import { SignupDto } from './dto/signup.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CommonService } from 'src/common/common.service';
import { AuthGuard } from '@nestjs/passport';
import { TokenPayload } from 'src/common/dto/tokenPayload.dto';
import { User } from 'src/common/decorators/user.decorator';
import { UserService } from 'src/user/user.service';
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly commonService: CommonService,
    private readonly userService: UserService,
  ) {}

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

  @Delete('logout')
  async logout(@Res() res: Response) {
    res.clearCookie('access_token', deleteCookieOptions);
    res.clearCookie('refresh_token', deleteCookieOptions);
    return res.status(204).send();
  }

  @Post('signup/customer')
  @UseInterceptors(FileInterceptor('image'))
  async signupCustomer(
    @Body() signupDto: SignupDto,
    @UploadedFile() files: Express.Multer.File[],
    res: Response,
  ) {
    const imageUrl = await this.commonService.uploadFiles(files, true);
    const user = await this.authService.signup(
      {
        ...signupDto,
        imageUrl: imageUrl[0],
      },
      'customer',
    );
    const accessToken = createToken(user);
    const refreshToken = createToken(user, 'refresh');

    res.cookie('access_token', accessToken, cookieOptions);
    res.cookie('refresh_token', refreshToken, refreshCookieOptions);

    return res.status(204).send();
  }

  @Post('signup/mover')
  @UseInterceptors(FileInterceptor('image'))
  async signupMover(
    @Body() signupDto: SignupDto,
    @UploadedFile() files: Express.Multer.File[],
    res: Response,
  ) {
    const imageUrl = await this.commonService.uploadFiles(files, true);
    const user = await this.authService.signup(
      {
        ...signupDto,
        imageUrl: imageUrl[0],
      },
      'mover',
    );
    const accessToken = createToken(user);
    const refreshToken = createToken(user, 'refresh');

    res.cookie('access_token', accessToken, cookieOptions);
    res.cookie('refresh_token', refreshToken, refreshCookieOptions);

    return res.status(204).send();
  }

  @Post('refresh')
  @UseGuards(AuthGuard('jwt'))
  async refreshToken(@Res() res: Response, @User() user: TokenPayload) {
    const { id } = user;
    const userInfo = await this.userService.getByID(id);

    const accessToken = createToken(userInfo);
    const refreshToken = createToken(userInfo, 'refresh');

    res.cookie('access_token', accessToken, cookieOptions);
    res.cookie('refresh_token', refreshToken, refreshCookieOptions);

    return res.status(204).send();
  }
}
