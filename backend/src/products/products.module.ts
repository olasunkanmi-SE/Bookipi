import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../infrastructure/data-access/models/product.entity';
import { CacheService } from 'src/infrastructure/cache/redis.service';
import { TYPES } from 'src/common/constants';
import { RedisCacheModule } from 'src/infrastructure/cache/redis.module';

@Module({
  imports: [TypeOrmModule.forFeature([Product]), RedisCacheModule],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    { provide: TYPES.IRedisService, useClass: CacheService },
  ],
})
export class ProductsModule {}
