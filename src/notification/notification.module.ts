import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { PrismaService } from 'src/prisma.service';
import { NotificationRepository } from './notification.repository';

@Module({
  controllers: [NotificationController],
  providers: [NotificationService, PrismaService, NotificationRepository],
  exports: [NotificationService, NotificationRepository],
})
export class NotificationModule {}
