import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { env } from 'src/common/config/env';
import { TokenPayload } from 'src/common/dto/tokenPayload.dto';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const token = request?.cookies['access_token'];
          if (!token) {
            return null;
          }
          return token;
        },
      ]),

      ignoreExpiration: false,
      secretOrKey: env.JWT_SECRET,
    });
  }

  async validate(payload: TokenPayload) {
    if (!payload) {
      throw new UnauthorizedException('토큰이 존재하지 않습니다.');
    }
    return payload;
  }
}
