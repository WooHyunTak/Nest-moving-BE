import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { env } from 'src/common/config/env';
import { TokenPayload } from '../dto/tokenPayload.dto';
import { Request } from 'express';

@Injectable()
export class JwtOptionalStrategy extends PassportStrategy(
  Strategy,
  'jwt-optional',
) {
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
    return payload;
  }
}
