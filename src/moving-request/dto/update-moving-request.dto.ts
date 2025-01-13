import { PartialType } from '@nestjs/mapped-types';
import { CreateMovingRequestDto } from './create-moving-request.dto';

export class UpdateMovingRequestDto extends PartialType(CreateMovingRequestDto) {}
