import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

@Entity('strategy_signal')
@Unique('uk_strategy_day', ['strategyCode', 'symbol', 'tradeDate'])
export class StrategySignal {
  @PrimaryGeneratedColumn({ comment: '策略信号ID' })
  id: number;

  @Column({
    name: 'strategy_code',
    length: 50,
    comment: '策略编码，如 CLOSE_AUCTION_T1',
  })
  strategyCode: string;

  @Column({ length: 20, comment: '标的代码，如 588080' })
  symbol: string;

  @Column({ name: 'trade_date', type: 'date', comment: '信号所属交易日' })
  tradeDate: string;

  @Column({ type: 'tinyint', comment: '是否允许交易 1是0否' })
  allow: number;

  @Column({ comment: '信心分 0-100' })
  confidence: number;

  @Column({ type: 'json', nullable: true, comment: '策略判断原因列表' })
  reasons: string[];

  @Column({
    name: 'eval_time',
    type: 'datetime',
    comment: '策略评估时间（如14:45）',
  })
  evalTime: Date;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 4,
    nullable: true,
    comment: '评估时价格',
  })
  price: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 4,
    nullable: true,
    comment: '当日VWAP',
  })
  vwap: number;

  @Column({ type: 'bigint', nullable: true, comment: '当日成交量' })
  volume: number;

  @Column({
    type: 'json',
    nullable: true,
    comment: '扩展字段（成分股强度、指数状态等）',
  })
  extra: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
