import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Strategy } from './strategy.entity';

@Entity('strategy_params')
export class StrategyParams {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Strategy)
  @JoinColumn({ name: 'strategy_id' })
  strategy: Strategy;

  @Column({ name: 'strategy_id' })
  strategyId: number;

  @Column({ type: 'json', comment: '策略参数详情' })
  params: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
