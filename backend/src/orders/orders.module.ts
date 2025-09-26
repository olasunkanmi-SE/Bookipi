import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../infrastructure/data-access/models/order.entity';
import { Product } from 'src/infrastructure/data-access/models/product.entity';
import { User } from 'src/infrastructure/data-access/models/user.entity';
import { JwtService } from '@nestjs/jwt';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Product, User]),
    BullModule.registerQueue({ name: 'order-processing' }),
  ],
  controllers: [OrdersController],
  providers: [OrdersService, JwtService],
})
export class OrdersModule {}
