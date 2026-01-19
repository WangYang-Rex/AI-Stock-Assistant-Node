import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('quotes')
@Index(['code'])
@Index(['updateTime'])
export class Quote {
  @PrimaryGeneratedColumn({ comment: '主键ID' })
  id: number;

  @Column({ type: 'varchar', length: 20, comment: '股票代码' })
  code: string;

  @Column({ type: 'varchar', length: 100, comment: '股票名称' })
  name: string;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 4,
    nullable: true,
    comment: '最新价',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => (value ? parseFloat(value) : null),
    },
  })
  price: number;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 4,
    nullable: true,
    comment: '今日最高价',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => (value ? parseFloat(value) : null),
    },
  })
  high: number;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 4,
    nullable: true,
    comment: '今日最低价',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => (value ? parseFloat(value) : null),
    },
  })
  low: number;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 4,
    nullable: true,
    comment: '今日开盘价',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => (value ? parseFloat(value) : null),
    },
  })
  open: number;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 4,
    nullable: true,
    comment: '昨日收盘价',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => (value ? parseFloat(value) : null),
    },
  })
  preClose: number;

  @Column({
    type: 'bigint',
    nullable: true,
    comment: '成交量（股）',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => (value ? parseInt(value, 10) : null),
    },
  })
  volume: number;

  @Column({
    type: 'decimal',
    precision: 20,
    scale: 4,
    nullable: true,
    comment: '成交额（元）',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => (value ? parseFloat(value) : null),
    },
  })
  amount: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 4,
    nullable: true,
    comment: '涨跌幅（%）',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => (value ? parseFloat(value) : null),
    },
  })
  pct: number;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 4,
    nullable: true,
    comment: '涨跌额',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => (value ? parseFloat(value) : null),
    },
  })
  change: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 4,
    nullable: true,
    comment: '换手率（%）',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => (value ? parseFloat(value) : null),
    },
  })
  turnover: number;

  @Column({
    type: 'decimal',
    precision: 24,
    scale: 4,
    nullable: true,
    comment: '总市值',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => (value ? parseFloat(value) : null),
    },
  })
  totalMarketCap: number;

  @Column({
    type: 'decimal',
    precision: 24,
    scale: 4,
    nullable: true,
    comment: '流通市值',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => (value ? parseFloat(value) : null),
    },
  })
  floatMarketCap: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 4,
    nullable: true,
    comment: '市盈率（动态）',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => (value ? parseFloat(value) : null),
    },
  })
  pe: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 4,
    nullable: true,
    comment: '市净率',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => (value ? parseFloat(value) : null),
    },
  })
  pb: number;

  @Column({
    type: 'bigint',
    comment: '更新时间戳（Unix 时间戳，秒级）',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => (value ? parseInt(value, 10) : null),
    },
  })
  updateTime: number;

  @CreateDateColumn({ comment: '系统创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '系统更新时间' })
  updatedAt: Date;
}
