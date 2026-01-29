import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('strategies')
export class Strategy {
  @PrimaryGeneratedColumn({ comment: '策略ID' })
  id: number;

  @Column({ length: 100, comment: '策略名称' })
  name: string;

  @Column({ length: 50, unique: true, comment: '策略编码' })
  code: string;

  @Column({ length: 20, comment: '默认标的' })
  symbol: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'ACTIVE',
    comment: '状态: ACTIVE, PAUSED',
  })
  status: string;

  @Column({ type: 'text', nullable: true, comment: '策略描述' })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
