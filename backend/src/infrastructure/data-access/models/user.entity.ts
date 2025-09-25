import { BaseModel } from './base';
import { Column, Entity, Index, Unique } from 'typeorm';

@Entity('users')
@Unique(['username'])
export class User extends BaseModel {
  @Index()
  @Column()
  username: string;

  @Column()
  passwordHash: string;
}
