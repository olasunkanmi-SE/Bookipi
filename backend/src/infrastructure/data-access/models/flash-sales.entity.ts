import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { BaseModel } from './base';
import { Product } from './product.entity';

@Entity('flashSales')
@Index('IDX_flashSales_product_start_end', [
  'productId',
  'startDate',
  'endDate',
])
@Unique(['startDate', 'endDate', 'productId'])
export class FlashSale extends BaseModel {
  @Column({ type: 'varchar', length: 64 })
  startDate: string;

  @Column({ type: 'varchar', length: 64 })
  endDate: string;

  @Column()
  productId: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product;
}
