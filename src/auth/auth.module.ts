import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { env } from 'src/common/config/env';
import { PrismaService } from 'src/prisma.service';
import { UserModule } from 'src/user/user.module';
import { UserRepository } from 'src/user/user.repository';
import { JwtOptionalStrategy } from 'src/common/strategies/jwt.optional.strategy';
import { JwtStrategy } from 'src/common/strategies/jwt.strategy';
import { JwtRefreshStrategy } from 'src/common/strategies/jwt,refresh.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: env.JWT_SECRET,
      signOptions: { expiresIn: '60s' },
    }),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PrismaService,
    JwtOptionalStrategy,
    JwtStrategy,
    JwtRefreshStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}
