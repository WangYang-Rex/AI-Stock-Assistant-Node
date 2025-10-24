import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('trading_records')
@Index(['symbol'])
@Index(['tradingTime'])
@Index(['symbol', 'tradingTime'])
export class Trading {
  @PrimaryGeneratedColumn()
  id: number;

  // 股票代码
  @Column({ type: 'varchar', length: 20, comment: '股票代码' })
  symbol: string;

  // 股票名称
  @Column({ type: 'varchar', length: 100, comment: '股票名称' })
  name: string;

  // 交易类型 (买入/卖出)
  @Column({
    type: 'enum',
    enum: ['buy', 'sell'],
    comment: '交易类型',
  })
  type: 'buy' | 'sell';

  // 成交时间
  @Column({ type: 'timestamp', comment: '成交时间' })
  tradingTime: Date;

  // 成交数量 (股)
  @Column({ type: 'bigint', comment: '交易数量(股)' })
  quantity: number;

  // 成交价格
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: '成交价格',
  })
  price: number;

  // 交易手续费
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: '交易手续费',
  })
  fee: number;

  // 开盘价
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    comment: '开盘价',
  })
  openPrice: number;

  // 涨跌幅
  @Column({
    type: 'decimal',
    precision: 8,
    scale: 4,
    nullable: true,
    comment: '涨跌幅',
  })
  changePercent: number;

  // 涨跌额
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 4,
    nullable: true,
    comment: '涨跌额',
  })
  changeAmount: number;

  // 备注
  @Column({ type: 'text', nullable: true, comment: '备注' })
  remarks: string;

  // 创建时间
  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  // 更新时间
  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;
}
