import { Module } from '@nestjs/common';
import { QuoteService } from './quote.service';
import { QuoteController } from './quote.controller';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [QuoteController],
  providers: [QuoteService],
  exports: [QuoteService],
})
export class QuoteModule {}
