import { Injectable } from '@nestjs/common';
import { NotificationRepository } from './notification.repository';
import { QueryStringDto } from './dto/queryString.dto';
import { CreateNotificationDto } from './dto/create.notification.dto';
import { calculateTimeGap } from 'src/common/utills/timeGap';

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}

  findNotifications = async (userId: number, query: QueryStringDto) => {
    const { limit, ...restQuery } = query;
    const addLimitNotifications =
      await this.notificationRepository.findNotifications(userId, {
        ...restQuery,
        limit: limit + 1, //한개 더 조회해서 다음 페이지 존재여부 확인
      });

    const hasNext = addLimitNotifications.length > query.limit; //다음 페이지 존재여부 확인
    const notifications = addLimitNotifications.slice(0, limit); //한개 더 조회한 데이터 제거
    const lastCursorId = hasNext ? notifications[limit - 1].id : null; //마지막 알림의 id

    const addTimeGap = notifications.map((notification) => ({
      ...notification,
      timeGap: calculateTimeGap(notification.createdAt),
    })); //각 알림에 timeGap 추가

    return {
      notifications: addTimeGap,
      hasNext,
      lastCursorId,
    };
  };

  //알림 생성
  createNotification = async (notification: CreateNotificationDto) => {
    return await this.notificationRepository.createNotification(notification);
  };

  //알림 읽음 여부 업데이트
  isReadNotification = async (notificationId: number) => {
    return await this.notificationRepository.isReadNotification(notificationId);
  };
}
