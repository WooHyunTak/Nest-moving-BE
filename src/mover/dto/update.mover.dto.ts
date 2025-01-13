import { PartialType } from '@nestjs/mapped-types';
import { CreateMoverDto } from './create.mover.dto';

export class UpdateMoverDto extends PartialType(CreateMoverDto) {}
