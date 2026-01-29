import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Strategy } from './strategy.entity';

@Entity('strategy_metrics')
export class StrategyMetrics {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Strategy)
  @JoinColumn({ name: 'strategy_id' })
  strategy: Strategy;

  @Column({ name: 'strategy_id' })
  strategyId: number;

  @Column({
    name: 'total_return',
    type: 'decimal',
    precision: 10,
    scale: 4,
    default: 0,
    comment: '总收益率',
  })
  totalReturn: number;

  @Column({
    name: 'annual_return',
    type: 'decimal',
    precision: 10,
    scale: 4,
    default: 0,
    comment: '年化收益率',
  })
  annualReturn: number;

  @Column({
    name: 'max_drawdown',
    type: 'decimal',
    precision: 10,
    scale: 4,
    default: 0,
    comment: '最大回撤',
  })
  maxDrawdown: number;

  @Column({
    name: 'win_rate',
    type: 'decimal',
    precision: 10,
    scale: 4,
    default: 0,
    comment: '胜率',
  })
  winRate: number;

  @Column({ name: 'trade_count', default: 0, comment: '交易总数' })
  tradeCount: number;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
