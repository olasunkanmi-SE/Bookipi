import { Module } from '@nestjs/common';
import { FashSalesService } from './fash-sales.service';
import { FashSalesController } from './fash-sales.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlashSale } from '../infrastructure/data-access/models/flash-sales.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FlashSale])],
  controllers: [FashSalesController],
  providers: [FashSalesService],
})
export class FashSalesModule {}
