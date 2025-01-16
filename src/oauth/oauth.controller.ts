import {
  Controller,
  Get,
  MisdirectedException,
  Query,
  Req,
  Res,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { OauthService } from './oauth.service';
import { env } from 'process';
import { Response, Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/common/decorators/user.decorator';
import { TokenPayload } from 'src/common/dto/tokenPayload.dto';
import createToken from '../common/utills/createtoken';
import {
  cookieOptions,
  refreshCookieOptions,
} from 'src/common/config/cookieOptions';
import { ValidateUserTypePipe } from './pipes/validate.user.type.pipe';

@Controller('oauth')
export class OauthController {
  constructor(private readonly oauthService: OauthService) {}

  @Get('naver')
  @UsePipes(ValidateUserTypePipe)
  async naver(
    @Query('state') state: string, // customer or mover
    @Res() res: Response,
  ) {
    const baseURL = 'https://nid.naver.com/oauth2.0/authorize';
    const query = new URLSearchParams({
      scope: 'email',
      response_type: 'code',
      client_id: env.NAVER_CLIENT_ID!,
      redirect_uri: env.NAVER_REDIRECT_URI!,
      auth_type: 'reprompt',
      state: state,
    });

    return res.redirect(`${baseURL}?${query.toString()}`);
  }

  @Get('naver/callback')
  @UseGuards(AuthGuard('naver'))
  async naverCallback(
    @Req() req: Request,
    @Res() res: Response,
    @User() user: TokenPayload,
  ) {
    return this.handleOAuthCallback(req, res, user);
  }

  @Get('kakao')
  @UsePipes(ValidateUserTypePipe)
  async kakao(
    @Query('state') state: string, // customer or mover
    @Res() res: Response,
  ) {
    const baseURL = 'https://kauth.kakao.com/oauth/authorize';
    const query = new URLSearchParams({
      client_id: env.KAKAO_CLIENT_ID!,
      redirect_uri: env.KAKAO_REDIRECT_URI!,
      response_type: 'code',
      scope: 'account_email',
      prompt: 'login',
      state: state,
    });

    return res.redirect(`${baseURL}?${query.toString()}`);
  }

  @Get('kakao/callback')
  @UseGuards(AuthGuard('kakao'))
  async kakaoCallback(
    @Req() req: Request,
    @Res() res: Response,
    @User() user: TokenPayload,
  ) {
    return this.handleOAuthCallback(req, res, user);
  }

  @Get('google')
  @UsePipes(ValidateUserTypePipe)
  async google(
    @Query('state') state: string, // customer or mover
    @Res() res: Response,
  ) {
    const baseURL = 'https://accounts.google.com/o/oauth2/v2/auth';
    const query = new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID!,
      redirect_uri: env.GOOGLE_REDIRECT_URI!,
      response_type: 'code',
      scope: 'profile email',
      state: state,
      access_type: 'offline',
      prompt: 'consent',
    });

    return res.redirect(`${baseURL}?${query.toString()}`);
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(
    @Req() req: Request,
    @Res() res: Response,
    @User() user: TokenPayload,
  ) {
    return this.handleOAuthCallback(req, res, user);
  }

  private async handleOAuthCallback(
    req: Request,
    res: Response,
    user: TokenPayload,
  ) {
    if (!user) {
      return res.redirect('/login');
    }
    const userType = req.query.state as string;

    const accessToken = createToken(user, 'access');
    const refreshToken = createToken(user, 'refresh');

    res.cookie('access_token', accessToken, cookieOptions);
    res.cookie('refresh_token', refreshToken, refreshCookieOptions);

    if (user.customerId || user.moverId) {
      res.redirect(env.FRONTEND_URL);
    } else {
      const messages: Record<string, string> = {
        customer: '고객 프로필을 등록해주세요.',
        mover: '기사 프로필을 등록해주세요.',
      };

      const redirectUrls: Record<string, string> = {
        customer: '/me/profile',
        mover: '/mover/profile',
      };

      return new MisdirectedException(
        messages[userType] || '프로필을 등록해주세요.',
        redirectUrls[userType],
      );
    }
  }
}
