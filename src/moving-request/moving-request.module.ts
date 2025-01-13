import { Module } from '@nestjs/common';
import { MovingRequestService } from './moving-request.service';
import { MovingRequestController } from './moving-request.controller';
import { CommonModule } from 'src/common/common.module';
import { NotificationModule } from 'src/notification/notification.module';
import { QuoteModule } from 'src/quote/quote.module';
import { MoverModule } from 'src/mover/mover.module';

@Module({
  imports: [CommonModule, NotificationModule, QuoteModule, MoverModule],
  controllers: [MovingRequestController],
  providers: [MovingRequestService],
  exports: [MovingRequestService],
})
export class MovingRequestModule {}
