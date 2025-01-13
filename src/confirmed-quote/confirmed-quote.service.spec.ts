import { Test, TestingModule } from '@nestjs/testing';
import { ConfirmedQuoteService } from './confirmed-quote.service';

describe('ConfirmedQuoteService', () => {
  let service: ConfirmedQuoteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConfirmedQuoteService],
    }).compile();

    service = module.get<ConfirmedQuoteService>(ConfirmedQuoteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
