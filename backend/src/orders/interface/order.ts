import Bull from 'bull';
import { OrderStatus } from 'src/common/constants';
import { Order } from 'src/infrastructure/data-access/models/order.entity';
import { JwtPayload } from 'src/infrastructure/interfaces/infrastructure';
import { CreateOrderDto } from '../dto/create-order.dto';
import { Result } from 'src/common/result';

export interface IOrderService {
  create(
    createOrderDto: CreateOrderDto,
    user: JwtPayload,
    status: OrderStatus,
  ): Promise<IOrderResponseDTO>;
  updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean>;
  hasAttemptedAPurchase(userId: string, productId: string): Promise<boolean>;
  findOne(id: string): Promise<Order | undefined>;
  findByIdempotencyKey(key: string): Promise<Order | null>;
  addOrderToQueue(
    createOrderDto: CreateOrderDto,
    user: JwtPayload,
  ): Promise<Result<IOrderQueue>>;
}

export interface IOrderJobPayload {
  userId: string;
  productId: string;
  username: string;
}

export interface IOrderQueue {
  message: string;
  jobId: Bull.JobId;
}

export interface IOrderResponseDTO {
  id: string;
  userId: string;
  productId: string;
  status: OrderStatus;
}
