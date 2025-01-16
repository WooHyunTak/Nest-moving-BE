import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MovingRequestModule } from './moving-request/moving-request.module';
import { MoverModule } from './mover/mover.module';
import { CommonModule } from './common/common.module';
import { QuoteModule } from './quote/quote.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { NotificationModule } from './notification/notification.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { env } from 'process';
import { JwtStrategy } from './common/strategies/jwt.strategy';
import { CustomerModule } from './customer/customer.module';
import { ConfirmedQuoteModule } from './confirmed-quote/confirmed-quote.module';
import { ReviewModule } from './review/review.module';
import { ScheduleModule } from '@nestjs/schedule';
import { OauthModule } from './oauth/oauth.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: env.JWT_SECRET ?? 'secret',
      signOptions: { expiresIn: '1d' },
    }),
    ScheduleModule.forRoot(),
    MovingRequestModule,
    MoverModule,
    CommonModule,
    QuoteModule,
    AuthModule,
    UserModule,
    NotificationModule,
    CustomerModule,
    ConfirmedQuoteModule,
    ReviewModule,
    OauthModule,
  ],
  controllers: [AppController],
  providers: [AppService, JwtStrategy],
})
export class AppModule {}
