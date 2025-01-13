import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { CommonModule } from 'src/common/common.module';
import { ReviewRepository } from './review.repository';
import { PrismaService } from 'src/prisma.service';

@Module({
  imports: [CommonModule],
  controllers: [ReviewController],
  providers: [ReviewService, ReviewRepository, PrismaService],
})
export class ReviewModule {}
