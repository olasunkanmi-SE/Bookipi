import { ProductsService } from './../products/products.service';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from 'src/infrastructure/data-access/models/product.entity';
import { User } from 'src/infrastructure/data-access/models/user.entity';
import { Order } from '../infrastructure/data-access/models/order.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrderQueueConstants, TYPES } from 'src/common/constants';
import { CacheService } from 'src/infrastructure/cache/redis.service';
import { RedisCacheModule } from 'src/infrastructure/cache/redis.module';
import { OrderProcessor } from './order.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Product, User]),
    BullModule.registerQueue({ name: OrderQueueConstants.QUEUE_NAME }),
    RedisCacheModule,
  ],
  controllers: [OrdersController],
  providers: [
    OrdersService,
    JwtService,
    { provide: TYPES.IRedisService, useClass: CacheService },
    { provide: TYPES.IProductService, useClass: ProductsService },
    { provide: TYPES.IOrderService, useClass: OrdersService },
    OrderProcessor,
  ],
})
export class OrdersModule {}
