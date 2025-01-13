import { Test, TestingModule } from '@nestjs/testing';
import { ConfirmedQuoteController } from './confirmed-quote.controller';
import { ConfirmedQuoteService } from './confirmed-quote.service';

describe('ConfirmedQuoteController', () => {
  let controller: ConfirmedQuoteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConfirmedQuoteController],
      providers: [ConfirmedQuoteService],
    }).compile();

    controller = module.get<ConfirmedQuoteController>(ConfirmedQuoteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
