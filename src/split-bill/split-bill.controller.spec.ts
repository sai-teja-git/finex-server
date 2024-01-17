import { Test, TestingModule } from '@nestjs/testing';
import { SplitBillController } from './split-bill.controller';
import { SplitBillService } from './split-bill.service';

describe('SplitBillController', () => {
  let controller: SplitBillController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SplitBillController],
      providers: [SplitBillService],
    }).compile();

    controller = module.get<SplitBillController>(SplitBillController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
