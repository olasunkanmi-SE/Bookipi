import { OrderStatus } from 'src/common/constants';
import { Column, Entity, Unique } from 'typeorm';

@Entity('orders')
@Unique(['userId', 'productId']) // Enforces one item per user per product at the database level
export class Order {
  @Column()
  userId: string;

  @Column()
  productId: string;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;
}
