import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('trading_records')
@Index(['code'])
@Index(['buy_date'])
@Index(['sell_date'])
export class Trading {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 20, comment: '股票代码' })
  code: string;

  @Column({ type: 'varchar', length: 100, nullable: true, comment: '股票名称' })
  name: string;

  @Column({ type: 'timestamp', comment: '买入日期' })
  buy_date: Date;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 3,
    comment: '买入价格',
  })
  buy_price: number;

  @Column({ type: 'bigint', comment: '买入数量' })
  buy_volume: number;

  @Column({ type: 'timestamp', nullable: true, comment: '卖出日期' })
  sell_date: Date;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 3,
    nullable: true,
    comment: '卖出价格',
  })
  sell_price: number;

  @Column({ type: 'bigint', nullable: true, comment: '卖出数量' })
  sell_volume: number;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 3,
    nullable: true,
    comment: '收益金额',
  })
  profit: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 4,
    nullable: true,
    comment: '收益率',
  })
  profit_rate: number;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  remarks: string;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;
}
