import { Column, Entity } from 'typeorm';
import { BaseModel } from './base';

@Entity('products')
export class Product extends BaseModel {
  @Column({ default: 0 })
  stock: number;

  @Column()
  name: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  price: number;
}
