import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('trends')
@Index(['code', 'datetime'], { unique: true }) // 复合唯一索引，用于高性能同步
@Index(['code'])
@Index(['datetime'])
export class Trend {
  @PrimaryGeneratedColumn({ comment: '主键ID' })
  id: number;

  @Column({ type: 'varchar', length: 20, comment: '股票代码' })
  code: string;

  @Column({ type: 'varchar', length: 100, comment: '股票名称' })
  name: string;

  @Column({
    type: 'varchar',
    length: 20,
    comment: '日期时间（YYYY-MM-DD HH:mm 格式）',
  })
  datetime: string;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 4,
    nullable: true,
    comment: '当前价格',
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
    comment: '均价',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => (value ? parseFloat(value) : null),
    },
  })
  avgPrice: number;

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

  @CreateDateColumn({ comment: '系统创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '系统更新时间' })
  updatedAt: Date;
}
