import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  RelationId,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { StrategySignal } from './strategy-signal.entity';

@Entity('strategy_result')
export class StrategyResult {
  @PrimaryGeneratedColumn({ comment: '结果ID' })
  id: number;

  @ManyToOne(() => StrategySignal)
  @JoinColumn({ name: 'signal_id' })
  signal: StrategySignal;

  @RelationId((result: StrategyResult) => result.signal)
  @Column({ name: 'signal_id', comment: '关联策略信号ID' })
  signalId: number;

  @Column({ length: 20, comment: '标的代码' })
  symbol: string;

  @Column({
    name: 'buy_price',
    type: 'decimal',
    precision: 10,
    scale: 4,
    nullable: true,
    comment: '假设买入价（尾盘）',
  })
  buyPrice: number;

  @Column({
    name: 'sell_price',
    type: 'decimal',
    precision: 10,
    scale: 4,
    nullable: true,
    comment: '卖出价（次日）',
  })
  sellPrice: number;

  @Column({
    name: 'sell_time',
    type: 'datetime',
    nullable: true,
    comment: '卖出时间（如次日09:35）',
  })
  sellTime: Date;

  @Column({
    name: 'return_pct',
    type: 'decimal',
    precision: 8,
    scale: 4,
    nullable: true,
    comment: '收益率 %',
  })
  returnPct: number;

  @Column({
    name: 'max_gain_pct',
    type: 'decimal',
    precision: 8,
    scale: 4,
    nullable: true,
    comment: '次日最大浮盈 %',
  })
  maxGainPct: number;

  @Column({
    name: 'max_drawdown_pct',
    type: 'decimal',
    precision: 8,
    scale: 4,
    nullable: true,
    comment: '次日最大回撤 %',
  })
  maxDrawdownPct: number;

  @Column({ type: 'tinyint', nullable: true, comment: '是否盈利' })
  win: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
