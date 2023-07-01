import { Test, TestingModule } from '@nestjs/testing';
import { TimeZoneService } from './time-zone.service';

describe('TimeZoneService', () => {
  let service: TimeZoneService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TimeZoneService],
    }).compile();

    service = module.get<TimeZoneService>(TimeZoneService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
