import { Test, TestingModule } from '@nestjs/testing';
import { MovingRequestController } from './moving-request.controller';
import { MovingRequestService } from './moving-request.service';

describe('MovingRequestController', () => {
  let controller: MovingRequestController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MovingRequestController],
      providers: [MovingRequestService],
    }).compile();

    controller = module.get<MovingRequestController>(MovingRequestController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
