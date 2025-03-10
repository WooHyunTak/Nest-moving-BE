import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-naver';
import { env } from 'process';
import { OauthService } from 'src/oauth/oauth.service';

@Injectable()
export class NaverStrategy extends PassportStrategy(Strategy, 'naver') {
  constructor(private readonly oauthService: OauthService) {
    super({
      clientID: env.NAVER_CLIENT_ID,
      clientSecret: env.NAVER_CLIENT_SECRET,
      callbackURL: env.NAVER_REDIRECT_URI,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: any,
  ) {
    const userType = profile.state;
    const user = await this.oauthService.naver(profile, userType);
    done(null, user);
  }
}
