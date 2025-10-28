import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('stocks')
@Index(['code'], { unique: true })
@Index(['market'])
export class Stock {
  @PrimaryGeneratedColumn()
  id: number;

  // 股票代码
  @Column({ type: 'varchar', length: 20, unique: true, comment: '股票代码' })
  code: string;

  // 股票名称
  @Column({ type: 'varchar', length: 100, comment: '股票名称' })
  name: string;

  // 市场类型 (上交所、深交所)
  @Column({ type: 'varchar', length: 20, comment: '市场类型' })
  market: string;

  // 市场代码 (上交所1、深交所0)
  @Column({ type: 'varchar', length: 20, comment: '市场代码' })
  marketCode: number;

  // 市盈率
  @Column({
    type: 'decimal',
    precision: 8,
    scale: 2,
    nullable: true,
    comment: '市盈率',
  })
  pe: number;

  // 最新价
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    comment: '最新价',
  })
  latestPrice: number;

  // 涨跌幅
  @Column({
    type: 'decimal',
    precision: 8,
    scale: 4,
    nullable: true,
    comment: '涨跌幅(%)',
  })
  changePercent: number;

  // 涨跌额
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    comment: '涨跌额',
  })
  changeAmount: number;

  // 开盘价
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    comment: '开盘价',
  })
  openPrice: number;

  // 最高价
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    comment: '最高价',
  })
  highPrice: number;

  // 最低价
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    comment: '最低价',
  })
  lowPrice: number;

  // 昨收价
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    comment: '昨收价',
  })
  previousClosePrice: number;

  // 成交量
  @Column({
    type: 'bigint',
    nullable: true,
    comment: '成交量(股)',
  })
  volume: number;

  // 持仓数量
  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    nullable: true,
    comment: '持仓数量',
  })
  holdingQuantity: number;

  // 持仓成本
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    comment: '持仓成本',
  })
  holdingCost: number;

  // 市值
  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    nullable: true,
    comment: '市值',
  })
  marketValue: number;

  // 创建时间
  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  // 更新时间
  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;
}
