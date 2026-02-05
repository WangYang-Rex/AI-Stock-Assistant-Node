import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * ETF成分股及其权重实体
 * 用于存储ETF（如 588080）在不同时间点的成分股构成及其权重
 */
@Entity('etf_constituents')
@Index(['etfCode', 'effectiveDate']) // 用于查询特定日期的成分股
@Index(['etfCode', 'rank']) // 用于按排名查询
@Index(['stockCode']) // 用于反向查询
export class EtfConstituent {
  @PrimaryGeneratedColumn({ comment: '主键' })
  id: number;

  /** ETF代码（如 588080） */
  @Column({ type: 'varchar', length: 10, comment: 'ETF代码' })
  etfCode: string;

  /** 成分股代码（如 688981） */
  @Column({ type: 'varchar', length: 10, comment: '成分股代码' })
  stockCode: string;

  /** 成分股名称 */
  @Column({ type: 'varchar', length: 50, comment: '成分股名称' })
  stockName: string;

  /** 权重（如 0.0825 表示 8.25%） */
  @Column({
    type: 'decimal',
    precision: 6,
    scale: 4,
    comment: '权重(0.0825=8.25%)',
  })
  weight: number;

  /** 权重排名（1表示权重最大） */
  @Column({ type: 'int', comment: '排名' })
  rank: number;

  /** 生效日期 */
  @Column({ type: 'date', comment: '有效开始日期' })
  effectiveDate: string;

  /** 失效日期（NULL表示当前有效） */
  @Column({ type: 'date', nullable: true, comment: '有效结束日期' })
  expireDate: string | null;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;
}
