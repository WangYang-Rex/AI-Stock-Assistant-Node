import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('stocks')
@Index(['symbol'], { unique: true })
@Index(['market'])
export class Stock {
  @PrimaryGeneratedColumn()
  id: number;

  // 股票代码
  @Column({ type: 'varchar', length: 20, unique: true, comment: '股票代码' })
  symbol: string;

  // 股票名称
  @Column({ type: 'varchar', length: 100, comment: '股票名称' })
  name: string;

  // 市场类型 (A股、港股、美股等)
  @Column({ type: 'varchar', length: 20, comment: '市场类型' })
  market: string;

  // 市场代码 (A股、港股、美股等)
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

  // 市净率
  @Column({
    type: 'decimal',
    precision: 8,
    scale: 2,
    nullable: true,
    comment: '市净率',
  })
  pb: number;

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

  // 创建时间
  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  // 更新时间
  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;
}
