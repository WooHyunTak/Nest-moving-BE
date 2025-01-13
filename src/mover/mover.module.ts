import { Module } from '@nestjs/common';
import { MoverService } from './mover.service';
import { MoverController } from './mover.controller';
import { MoverRepository } from './mover.repository';
import { PrismaService } from 'src/prisma.service';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [MoverController],
  providers: [MoverService, MoverRepository, PrismaService],
  exports: [MoverService],
})
export class MoverModule {}
