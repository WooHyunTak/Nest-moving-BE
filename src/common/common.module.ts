import { Module } from '@nestjs/common';
import { MoverRepository } from 'src/mover/mover.repository';
import { MovingRequestRepository } from 'src/moving-request/moving-request.repository';
import { PrismaService } from 'src/prisma.service';
import { QuoteRepository } from 'src/quote/quote.repository';
import { UserRepository } from 'src/user/user.repository';
import { ConfirmedQuoteRepository } from 'src/confirmed-quote/confirmed-quote.repository';
import { s3ClientProvider } from './providers/s3-client.provider';
import { CommonService } from './common.service';
import { NotificationService } from 'src/notification/notification.service';

@Module({
  providers: [
    MoverRepository,
    UserRepository,
    QuoteRepository,
    PrismaService,
    MovingRequestRepository,
    ConfirmedQuoteRepository,
    CommonService,
    s3ClientProvider,
  ],
  exports: [
    MoverRepository,
    UserRepository,
    QuoteRepository,
    MovingRequestRepository,
    ConfirmedQuoteRepository,
    CommonService,
    PrismaService,
  ],
})
export class CommonModule {}
