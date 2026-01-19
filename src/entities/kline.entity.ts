import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * K 线数据实体
 * 用于存储股票的K线历史数据（日线、周线、月线、分钟线等）
 */
@Entity('klines')
@Index(['code', 'date', 'period'], { unique: true }) // 股票代码 + 日期 + 周期 唯一索引
@Index(['code'])
@Index(['date'])
export class Kline {
  @PrimaryGeneratedColumn()
  id: number;

  /** 股票代码（如 600519） */
  @Column({ type: 'varchar', length: 20, comment: '股票代码' })
  code: string;

  /** 股票名称 */
  @Column({ type: 'varchar', length: 100, nullable: true, comment: '股票名称' })
  name: string;

  /** K线周期（101=日线, 102=周线, 103=月线, 1/5/15/30/60=分钟线） */
  @Column({ type: 'int', default: 101, comment: 'K线周期' })
  period: number;

  /** 日期/时间（如 2024-01-15 或 2024-01-15 09:30） */
  @Column({ type: 'varchar', length: 30, comment: '日期/时间' })
  date: string;

  /** 开盘价 */
  @Column({
    type: 'decimal',
    precision: 12,
    scale: 4,
    comment: '开盘价',
  })
  open: number;

  /** 收盘价 */
  @Column({
    type: 'decimal',
    precision: 12,
    scale: 4,
    comment: '收盘价',
  })
  close: number;

  /** 最高价 */
  @Column({
    type: 'decimal',
    precision: 12,
    scale: 4,
    comment: '最高价',
  })
  high: number;

  /** 最低价 */
  @Column({
    type: 'decimal',
    precision: 12,
    scale: 4,
    comment: '最低价',
  })
  low: number;

  /** 成交量（股） */
  @Column({
    type: 'bigint',
    comment: '成交量(股)',
  })
  volume: number;

  /** 成交额（元） */
  @Column({
    type: 'decimal',
    precision: 20,
    scale: 4,
    comment: '成交额(元)',
  })
  amount: number;

  /** 振幅（%） */
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 4,
    nullable: true,
    comment: '振幅(%)',
  })
  amplitude: number;

  /** 涨跌幅（%） */
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 4,
    nullable: true,
    comment: '涨跌幅(%)',
  })
  pct: number;

  /** 涨跌额 */
  @Column({
    type: 'decimal',
    precision: 12,
    scale: 4,
    nullable: true,
    comment: '涨跌额',
  })
  change: number;

  /** 换手率（%） */
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 4,
    nullable: true,
    comment: '换手率(%)',
  })
  turnover: number;

  /** 复权类型（0=不复权, 1=前复权, 2=后复权） */
  @Column({ type: 'int', default: 1, comment: '复权类型' })
  fqType: number;

  /** 创建时间 */
  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  /** 更新时间 */
  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;
}
