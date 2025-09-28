import { Column, Entity, Index, Unique } from 'typeorm';
import { BaseModel } from './base';
import { IsOptional } from 'class-validator';

@Entity('users')
@Unique(['email'])
export class User extends BaseModel {
  @Index()
  @Column()
  email: string;

  @Index()
  @Column({ nullable: true })
  @IsOptional()
  username: string;

  @Column()
  passwordHash: string;
}
