import { Module } from '@nestjs/common';
import { FashSalesService } from './fash-sales.service';
import { FashSalesController } from './fash-sales.controller';

@Module({
  controllers: [FashSalesController],
  providers: [FashSalesService],
})
export class FashSalesModule {}
