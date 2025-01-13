import { Test, TestingModule } from '@nestjs/testing';
import { MovingRequestService } from './moving-request.service';

describe('MovingRequestService', () => {
  let service: MovingRequestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MovingRequestService],
    }).compile();

    service = module.get<MovingRequestService>(MovingRequestService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
