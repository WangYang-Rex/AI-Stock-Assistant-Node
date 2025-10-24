import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('ai_signals')
@Index(['symbol'])
@Index(['signalTime'])
@Index(['signalType'])
@Index(['modelVersion'])
@Index(['symbol', 'signalTime'])
@Index(['signalType', 'signalTime'])
export class AiSignal {
  @PrimaryGeneratedColumn()
  id: number;

  // 股票代码
  @Column({ type: 'varchar', length: 20, comment: '股票代码' })
  symbol: string;

  // 信号时间
  @Column({ type: 'timestamp', comment: '信号时间' })
  signalTime: Date;

  // AI信号类型
  @Column({
    type: 'enum',
    enum: ['buy', 'sell', 'hold'],
    comment: 'AI信号类型',
  })
  signalType: 'buy' | 'sell' | 'hold';

  // 信号置信度 (0-100)
  @Column({
    type: 'int',
    comment: '信号置信度(0-100)',
  })
  confidence: number;

  // AI模型版本号
  @Column({ type: 'varchar', length: 50, comment: 'AI模型版本号' })
  modelVersion: string;

  // 信号说明或模型解释
  @Column({ type: 'text', nullable: true, comment: '信号说明或模型解释' })
  description: string;

  // 创建时间
  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  // 更新时间
  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;
}
