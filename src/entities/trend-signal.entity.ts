import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  Unique,
} from 'typeorm';

@Entity('trend_signals')
@Unique(['code', 'tradeDate'])
export class TrendSignal {
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

  @Column({
    type: 'enum',
    enum: ['UP', 'DOWN', 'SIDEWAYS'],
    comment: '趋势方向',
  })
  trend: 'UP' | 'DOWN' | 'SIDEWAYS';

  @Column({ type: 'int', comment: '趋势评分(-100~100)' })
  score: number;

  @Column({
    type: 'enum',
    enum: ['WEAK', 'MEDIUM', 'STRONG'],
    comment: '趋势强度',
  })
  strength: 'WEAK' | 'MEDIUM' | 'STRONG';

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 4,
    nullable: true,
    comment: 'MA5',
  })
  ma5: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 4,
    nullable: true,
    comment: 'MA10',
  })
  ma10: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 4,
    nullable: true,
    comment: 'MA20',
  })
  ma20: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 4,
    nullable: true,
    comment: 'MA60',
  })
  ma60: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 4,
    nullable: true,
    comment: 'EMA20',
  })
  ema20: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 6,
    nullable: true,
    comment: 'EMA20斜率',
  })
  ema20Slope: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 6,
    nullable: true,
    comment: 'MACD DIF',
  })
  macdDif: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 6,
    nullable: true,
    comment: 'MACD DEA',
  })
  macdDea: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 6,
    nullable: true,
    comment: 'MACD柱',
  })
  macdHist: number;

  @Column({
    type: 'decimal',
    precision: 6,
    scale: 2,
    nullable: true,
    comment: 'RSI14',
  })
  rsi14: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 4,
    nullable: true,
    comment: '当前价格',
  })
  price: number;

  @Column({
    type: 'decimal',
    precision: 6,
    scale: 2,
    nullable: true,
    comment: '量比',
  })
  volumeRatio: number;

  @Column({ type: 'json', nullable: true, comment: '趋势判断原因' })
  reasons: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
