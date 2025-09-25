import { Test, TestingModule } from '@nestjs/testing';
import { FashSalesService } from './fash-sales.service';

describe('FashSalesService', () => {
  let service: FashSalesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FashSalesService],
    }).compile();

    service = module.get<FashSalesService>(FashSalesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
