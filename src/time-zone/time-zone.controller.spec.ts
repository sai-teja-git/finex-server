import { Test, TestingModule } from '@nestjs/testing';
import { TimeZoneController } from './time-zone.controller';
import { TimeZoneService } from './time-zone.service';

describe('TimeZoneController', () => {
  let controller: TimeZoneController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TimeZoneController],
      providers: [TimeZoneService],
    }).compile();

    controller = module.get<TimeZoneController>(TimeZoneController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
