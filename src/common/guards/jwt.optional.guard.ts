import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtOptionalGuard extends AuthGuard('jwt-optional') {
  handleRequest(err: any, user: any, info: any, context: any, status: any) {
    return user || null;
  }
}
