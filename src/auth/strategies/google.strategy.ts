import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { env } from 'process';
import { OauthService } from 'src/oauth/oauth.service';

@Injectable()
export class JwtGoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly oauthService: OauthService) {
    super({
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: env.GOOGLE_REDIRECT_URI,
      scope: ['profile', 'email'],
      passReqToCallback: true,
    });
  }

  async validate(
    request: any,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: any,
  ) {
    try {
      const userType = request.query.state;
      const user = await this.oauthService.google(profile, userType);
      done(null, user);
    } catch (error) {
      done(error, false);
    }
  }
}
