import { BadRequestException, PipeTransform } from '@nestjs/common';

export class ValidateUserTypePipe implements PipeTransform {
  transform(value: string) {
    if (value !== 'customer' && value !== 'mover') {
      throw new BadRequestException(
        '사용자는 customer 또는 mover 중 하나여야 합니다.',
      );
    }
    return value;
  }
}
