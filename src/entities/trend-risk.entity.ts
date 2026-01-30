import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  Unique,
} from 'typeorm';

@Entity('trend_risks')
@Unique(['code', 'tradeDate'])
export class TrendRisk {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 10, comment: '股票代码' })
  @Index()
  code: string;

  @Column({
    name: 'trade_date',
    type: 'varchar',
    length: 20,
    comment: '交易日',
  })
  @Index()
  tradeDate: string;

  @Column({ type: 'decimal', precision: 10, scale: 4, comment: 'ATR14' })
  atr14: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, comment: 'ATR止损价' })
  stopPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, comment: 'MA10' })
  ma10: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, comment: 'MA20' })
  ma20: number;

  @Column({ type: 'boolean', name: 'stop_triggered', comment: '是否触发止损' })
  stopTriggered: boolean;

  @Column({
    name: 'stop_reason',
    length: 100,
    nullable: true,
    comment: '止损原因',
  })
  stopReason: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
