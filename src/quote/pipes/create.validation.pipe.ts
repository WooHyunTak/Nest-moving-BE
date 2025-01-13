import { ArgumentMetadata, BadRequestException } from '@nestjs/common';

import { PipeTransform } from '@nestjs/common';
import { CreateQuoteDto } from '../dto/create.quote.dto';

export class CreateQuoteValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    this.validateData(value);
    return value;
  }

  private validateData(data: CreateQuoteDto) {
    const { comment, cost } = data;
    if (!comment) {
      throw new BadRequestException('코멘트를 입력해 주세요.');
    }
    if (typeof comment !== 'string') {
      throw new BadRequestException('코멘트는 문자열로 입력해 주세요.');
    }
    if (comment.length > 100) {
      throw new BadRequestException('코멘트는 100자 이하로 입력해 주세요.');
    }
    if (!cost) {
      throw new BadRequestException('비용을 입력해 주세요.');
    }
    if (cost < 0) {
      throw new BadRequestException('비용은 0 이상으로 입력해 주세요.');
    }
    if (typeof cost !== 'number') {
      throw new BadRequestException('비용은 숫자로 입력해 주세요.');
    }
  }
}
