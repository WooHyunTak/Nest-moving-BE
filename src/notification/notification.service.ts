import { Injectable } from '@nestjs/common';
import { NotificationRepository } from './notification.repository';
import { QueryStringDto } from './dto/queryString.dto';
import { CreateNotificationDto } from './dto/create.notification.dto';
import { calculateTimeGap } from 'src/common/utills/timeGap';
import { ConfirmedQuoteRepository } from 'src/confirmed-quote/confirmed-quote.repository';
import { Cron } from '@nestjs/schedule';
import { CronExpression } from '@nestjs/schedule';

interface ConfirmedQuote {
  id: number;
  movingRequest: {
    service: number;
    movingDate: Date;
    pickupAddress: string;
    dropOffAddress: string;
  };
  customer: {
    user: {
      id: number;
      name: string;
    };
  };
  quote: {
    id: number;
  };
  mover: {
    user: {
      id: number;
    };
    nickname: string;
  };
}

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly confirmedQuoteRepository: ConfirmedQuoteRepository,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyNotification() {
    console.log('자정 알림 스케줄 실행');
    await this.initNotification();
  }

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

  initNotification = async () => {
    try {
      const tomorrow = new Date();
      tomorrow.setHours(0, 0, 0, 0);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const confirmedQuotes =
        await this.confirmedQuoteRepository.getAllByDay(tomorrow);

      for (const request of confirmedQuotes) {
        const notificationType = this.setMessage(request);

        this.notificationRepository.createManyNotification(notificationType);
      }

      console.log(
        `${tomorrow.toISOString()} - 알림 발송 완료: ${confirmedQuotes.length}건`,
      );
    } catch (error) {
      console.error('알림 발송 중 오류 발생:', error);
    }
  };

  private async extractLocationInfo(address: string) {
    // 시/도와 시/군/구를 추출하는 정규식
    const match = address.match(/([가-힣]+)\s([가-힣]+시[가-힣]*)/);
    if (!match) return address;

    const province = match[1]; // 첫 번째 그룹 (시/도)
    const city = match[2].replace(/시.*$/, ''); // 두 번째 그룹에서 '시' 이후 제거

    return `${province}(${city})`;
  }

  private setMessage(confirmedQuote: ConfirmedQuote) {
    const pickupLocation = this.extractLocationInfo(
      confirmedQuote.movingRequest.pickupAddress,
    );
    const dropOffLocation = this.extractLocationInfo(
      confirmedQuote.movingRequest.dropOffAddress,
    );
    return [
      {
        content: `내일은 ,${pickupLocation} → ${dropOffLocation} 이사 예정일,이에요.`,
        isRead: false,
        userId: confirmedQuote.mover.user.id,
      },
      {
        content: `내일은 ,${pickupLocation} → ${dropOffLocation} 이사 예정일,이에요.`,
        isRead: false,
        userId: confirmedQuote.customer.user.id,
      },
    ];
  }
}
