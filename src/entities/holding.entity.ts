import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('holdings')
@Index(['symbol'], { unique: true })
export class Holding {
  @PrimaryGeneratedColumn()
  id: number;

  // 股票代码
  @Column({ type: 'varchar', length: 20, unique: true, comment: '股票代码' })
  symbol: string;

  // 持仓数量
  @Column({
    type: 'bigint',
    comment: '持仓数量(股)',
  })
  quantity: number;

  // 持仓成本
  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    comment: '持仓成本',
  })
  cost: number;

  // 当前市值
  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    comment: '当前市值',
  })
  currentValue: number;

  // 创建时间
  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  // 更新时间
  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;
}
