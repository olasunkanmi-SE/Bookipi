import { OrderStatus } from '../../../common/constants';
import { Column, Entity, Index, Unique } from 'typeorm';
import { BaseModel } from './base';

@Entity('orders')
@Unique(['userId', 'productId'])
export class Order extends BaseModel {
  @Index()
  @Column()
  userId: string;

  @Index()
  @Column()
  productId: string;

  @Column({ nullable: true })
  idempotencyKey: string;

  @Index()
  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;
}
