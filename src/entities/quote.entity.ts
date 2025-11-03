import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('quotes')
@Index(['code'], { unique: false })
@Index(['snapshotTime'])
@Index(['snapshotDate'])
export class Quote {
  @PrimaryGeneratedColumn()
  id: number;

  // 股票代码
  @Column({ type: 'varchar', length: 20, comment: '股票代码' })
  code: string;

  // 股票名称
  @Column({ type: 'varchar', length: 100, comment: '股票名称' })
  name: string;

  // 市场代码
  @Column({ type: 'varchar', length: 20, comment: '市场代码' })
  marketCode: string;

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

  // 开盘价
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    comment: '开盘价',
  })
  openPrice: number;

  // 成交量
  @Column({
    type: 'bigint',
    nullable: true,
    comment: '成交量(股)',
  })
  volume: number;

  // 成交额
  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    nullable: true,
    comment: '成交额(元)',
  })
  volumeAmount: number;

  // 昨收价
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    comment: '昨收价',
  })
  previousClosePrice: number;

  // 快照时间
  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    comment: '快照时间',
  })
  snapshotTime: Date;

  // 快照日期
  @Column({
    type: 'date',
    comment: '快照日期',
  })
  snapshotDate: Date;

  // 创建时间
  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  // 更新时间
  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;
}
