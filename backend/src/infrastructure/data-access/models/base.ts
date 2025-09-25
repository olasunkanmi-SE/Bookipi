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
  id?: string;

  @Index()
  @CreateDateColumn({ name: 'audit_created_date_time' })
  auditCreatedDateTime: string;

  @Column({ name: 'audit_created_by', type: 'varchar', length: 50 })
  auditCreatedBy: string;

  @UpdateDateColumn({ name: 'audit_modified_date_time' })
  auditModifiedDateTime?: string;

  @Column({
    name: 'audit_modified_by',
    type: 'varchar',
    length: 128,
    nullable: true,
  })
  auditModifiedBy?: string;

  @DeleteDateColumn({ name: 'audit_delete_date_time' })
  auditDeletedDateTime?: string;

  @Column({
    name: 'audit_delete_by',
    type: 'varchar',
    length: 128,
    nullable: true,
  })
  auditDeletedBy?: string;
}
