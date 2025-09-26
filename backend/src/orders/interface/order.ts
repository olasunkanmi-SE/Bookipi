import { OrderStatus } from 'src/common/constants';
import { Order } from 'src/infrastructure/data-access/models/order.entity';
import { JwtPayload } from 'src/infrastructure/interfaces/infrastructure';
import { CreateOrderDto } from '../dto/create-order.dto';
import { IOrderResponseDTO } from '../orders.service';

export interface IOrderService {
  create(
    createOrderDto: CreateOrderDto,
    user: JwtPayload,
    status: OrderStatus,
  ): Promise<IOrderResponseDTO>;
  updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean>;
  hasUserPurchasedProduct(userId: string, productId: string): Promise<boolean>;
  findOne(id: string): Promise<Order | undefined>;
  findByIdempotencyKey(key: string): Promise<Order | null>;
}

export interface IOrderJobPayload {
  userId: string;
  productId: string;
  username: string;
}
