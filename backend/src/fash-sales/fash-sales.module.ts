import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { FlashSale } from '../infrastructure/data-access/models/flash-sales.entity';
import { FlashSalesController } from './flash-sales.controller';
import { FlashSalesService } from './flash-sales.service';
import { TYPES } from 'src/common/constants';
import { CacheService } from 'src/infrastructure/cache/redis.service';
import { RedisCacheModule } from 'src/infrastructure/cache/redis.module';

@Module({
  imports: [TypeOrmModule.forFeature([FlashSale]), RedisCacheModule],
  controllers: [FlashSalesController],
  providers: [
    FlashSalesService,
    { provide: TYPES.IRedisService, useClass: CacheService },
  ],
})
export class FlashSalesModule {}
