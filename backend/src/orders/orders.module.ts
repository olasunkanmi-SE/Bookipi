import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ORDER_PROCESSING } from 'src/common/constants';
import { Product } from 'src/infrastructure/data-access/models/product.entity';
import { User } from 'src/infrastructure/data-access/models/user.entity';
import { Order } from '../infrastructure/data-access/models/order.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Product, User]),
    BullModule.registerQueue({ name: ORDER_PROCESSING }),
  ],
  controllers: [OrdersController],
  providers: [OrdersService, JwtService],
})
export class OrdersModule {}
