import { ArgumentMetadata, BadRequestException } from '@nestjs/common';

import { PipeTransform } from '@nestjs/common';
import { CreateMovingRequestDto } from '../dto/create-moving-request.dto';

export class CreateMovingRequestValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    this.validateData(value);
    return value;
  }

  private validateData(data: CreateMovingRequestDto) {
    const { service, movingDate, pickupAddress, dropOffAddress, region } = data;

    if (!service || typeof service !== 'number' || service < 1 || service > 3) {
      throw new BadRequestException('이사 서비스 타입이 올바르지 않습니다.');
    }
    const date = new Date(movingDate);

    //이사 날짜 검증
    if (!movingDate || isNaN(date.getTime())) {
      throw new BadRequestException('이사 날짜가 올바르지 않습니다.');
    }

    if (date <= new Date()) {
      throw new BadRequestException('이사 날짜는 오늘 이후여야 합니다.');
    }

    if (!pickupAddress || typeof pickupAddress !== 'string') {
      throw new BadRequestException('이사 출발지가 올바르지 않습니다.');
    }

    if (!dropOffAddress || typeof dropOffAddress !== 'string') {
      throw new BadRequestException('이사 도착지가 올바르지 않습니다.');
    }

    if (!region || typeof region !== 'number') {
      throw new BadRequestException('지역코드가 올바르지 않습니다.');
    }
  }
}
