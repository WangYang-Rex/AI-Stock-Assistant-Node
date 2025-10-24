import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('quotes')
@Index(['symbol'])
@Index(['quoteDate'])
@Index(['quoteTime'])
@Index(['symbol', 'quoteDate'])
@Index(['symbol', 'quoteTime'])
export class Quote {
  @PrimaryGeneratedColumn()
  id: number;

  // 股票代码
  @Column({ type: 'varchar', length: 20, comment: '股票代码' })
  symbol: string;

  // 行情日期
  @Column({ type: 'date', comment: '行情日期' })
  quoteDate: Date;

  // 行情时间
  @Column({ type: 'time', comment: '行情时间' })
  quoteTime: string;

  // 股票价格
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: '股票价格',
  })
  price: number;

  // 开盘价
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: '开盘价',
  })
  openPrice: number;

  // 最高价
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: '最高价',
  })
  highPrice: number;

  // 最低价
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: '最低价',
  })
  lowPrice: number;

  // 收盘价
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: '收盘价',
  })
  closePrice: number;

  // 成交量
  @Column({
    type: 'bigint',
    comment: '成交量',
  })
  volume: number;

  // 换手率
  @Column({
    type: 'decimal',
    precision: 8,
    scale: 4,
    nullable: true,
    comment: '换手率(%)',
  })
  turnoverRate: number;

  // 创建时间
  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  // 更新时间
  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;
}
