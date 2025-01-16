import { Module } from '@nestjs/common';
import { MovingRequestService } from './moving-request.service';
import { MovingRequestController } from './moving-request.controller';
import { CommonModule } from 'src/common/common.module';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [CommonModule, NotificationModule],
  controllers: [MovingRequestController],
  providers: [MovingRequestService],
  exports: [MovingRequestService],
})
export class MovingRequestModule {}
