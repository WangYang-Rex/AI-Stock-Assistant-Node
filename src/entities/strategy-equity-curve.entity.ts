import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Strategy } from './strategy.entity';

@Entity('strategy_equity_curve')
@Index(['strategyId', 'date'], { unique: true })
export class StrategyEquityCurve {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Strategy)
  @JoinColumn({ name: 'strategy_id' })
  strategy: Strategy;

  @Column({ name: 'strategy_id' })
  strategyId: number;

  @Column({ type: 'date', comment: '日期' })
  date: string;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 4,
    comment: '当日净值',
  })
  equity: number;
}
