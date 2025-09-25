import { BaseModel } from './base';
import { Column, Entity, Index } from 'typeorm';

@Entity('users')
export class User extends BaseModel {
  @Index()
  @Column()
  username: string;

  @Column()
  passwordHash: string;
}
