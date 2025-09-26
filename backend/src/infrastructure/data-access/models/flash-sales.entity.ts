import { Column, Entity, Index } from 'typeorm';
import { BaseModel } from './base';

@Entity('flashSales')
@Index('IDX_flashSales_product_start_end', [
  'productId',
  'startDate',
  'endDate',
])
export class FlashSale extends BaseModel {
  @Column({ type: 'varchar', length: 64 })
  startDate: string;

  @Column({ type: 'varchar', length: 64 })
  endDate: string;

  @Column()
  productId: string;
}
