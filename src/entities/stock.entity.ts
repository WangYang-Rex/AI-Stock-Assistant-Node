import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * 股票实体
 * 用于存储股票的基本信息和市场数据
 */
@Entity('stocks')
@Index(['code'], { unique: true }) // 股票代码唯一索引
@Index(['market']) // 市场代码索引
export class Stock {
  @PrimaryGeneratedColumn()
  id: number;

  /** 股票代码（如 600519） */
  @Column({ type: 'varchar', length: 20, comment: '股票代码' })
  code: string;

  /** 股票名称 */
  @Column({ type: 'varchar', length: 100, comment: '股票名称' })
  name: string;

  /** 市场代码（1-上交所、0-深交所） */
  @Column({ type: 'int', comment: '市场代码' })
  market: number;

  /** 市场类型（SH-上海、SZ-深圳） */
  @Column({ type: 'varchar', length: 20, comment: '市场类型' })
  marketType: string;

  /** 最新价 */
  @Column({
    type: 'decimal',
    precision: 12,
    scale: 4,
    nullable: true,
    comment: '最新价',
  })
  price: number;

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

  /** 成交量（股） */
  @Column({
    type: 'bigint',
    nullable: true,
    comment: '成交量(股)',
  })
  volume: number;

  /** 成交额（元） */
  @Column({
    type: 'decimal',
    precision: 20,
    scale: 4,
    nullable: true,
    comment: '成交额(元)',
  })
  amount: number;

  /** 总市值（元） */
  @Column({
    type: 'decimal',
    precision: 20,
    scale: 4,
    nullable: true,
    comment: '总市值(元)',
  })
  totalMarketCap: number;

  /** 流通市值（元） */
  @Column({
    type: 'decimal',
    precision: 20,
    scale: 4,
    nullable: true,
    comment: '流通市值(元)',
  })
  floatMarketCap: number;

  /** 换手率（%） */
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 4,
    nullable: true,
    comment: '换手率(%)',
  })
  turnover: number;

  /** 创建时间 */
  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  /** 更新时间 */
  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;
}
