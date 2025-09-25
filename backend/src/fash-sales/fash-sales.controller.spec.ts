import { Test, TestingModule } from '@nestjs/testing';
import { FashSalesController } from './fash-sales.controller';
import { FashSalesService } from './fash-sales.service';

describe('FashSalesController', () => {
  let controller: FashSalesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FashSalesController],
      providers: [FashSalesService],
    }).compile();

    controller = module.get<FashSalesController>(FashSalesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
