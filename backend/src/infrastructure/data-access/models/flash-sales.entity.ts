import { Column, Entity, Index } from 'typeorm';
import { BaseModel } from './base';

@Entity('flashSales')
export class FlashSale extends BaseModel {
  @Index()
  @Column({ type: 'varchar', length: 64 })
  startDate: string;

  @Column({ type: 'varchar', length: 64 })
  endDate: string;
}
