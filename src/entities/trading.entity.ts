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

  // 交易金额 (成交价格 × 数量)
  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    comment: '交易金额',
  })
  amount: number;

  // 关联交易ID (用于关联买入和卖出交易)
  @Column({
    type: 'int',
    nullable: true,
    comment: '关联交易ID',
  })
  relatedTradingId: number;

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
