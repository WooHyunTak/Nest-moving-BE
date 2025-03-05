import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { QueryStringDto } from './dto/queryString.dto';
import { CreateNotificationDto } from './dto/create.notification.dto';

@Injectable()
export class NotificationRepository {
  constructor(private readonly prismaService: PrismaService) {}

  findNotifications = async (userId: number, query: QueryStringDto) => {
    const { isRead, limit, cursor } = query;
    return await this.prismaService.notification.findMany({
      where: {
        userId,
        ...(isRead !== undefined && { isRead }),
      },
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: {
        createdAt: 'desc',
      },
    });
  };

  createNotification = async (notification: CreateNotificationDto) => {
    return await this.prismaService.notification.create({
      data: notification,
    });
  };

  createManyNotification = async (notifications: CreateNotificationDto[]) => {
    return await this.prismaService.notification.createMany({
      data: notifications,
    });
  };

  isReadNotification = async (notificationId: number) => {
    return await this.prismaService.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  };
}
