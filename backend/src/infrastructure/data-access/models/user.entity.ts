import { Column, Entity, Index, Unique } from 'typeorm';
import { BaseModel } from './base';

@Entity('users')
@Unique(['username'])
export class User extends BaseModel {
  @Index()
  @Column()
  username: string;

  @Column()
  passwordHash: string;
}
