import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'base_model' })
export class BaseModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @CreateDateColumn()
  auditCreatedDateTime: string;

  @Column({ type: 'varchar', length: 50 })
  auditCreatedBy: string;

  @UpdateDateColumn()
  auditModifiedDateTime?: string;

  @Column({
    type: 'varchar',
    length: 128,
    nullable: true,
  })
  auditModifiedBy?: string;

  @DeleteDateColumn()
  auditDeletedDateTime?: string;

  @Column({
    type: 'varchar',
    length: 128,
    nullable: true,
  })
  auditDeletedBy?: string;
}
