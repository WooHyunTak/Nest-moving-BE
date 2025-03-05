import { Module } from '@nestjs/common';
import { ConfirmedQuoteService } from './confirmed-quote.service';
import { ConfirmedQuoteController } from './confirmed-quote.controller';
import { CommonModule } from 'src/common/common.module';
import { ConfirmedQuoteRepository } from './confirmed-quote.repository';
import { PrismaService } from 'src/common/prisma.service';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [CommonModule, NotificationModule],
  controllers: [ConfirmedQuoteController],
  providers: [ConfirmedQuoteService, ConfirmedQuoteRepository, PrismaService],
})
export class ConfirmedQuoteModule {}
