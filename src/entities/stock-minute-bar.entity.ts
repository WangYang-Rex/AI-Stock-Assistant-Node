import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

/**分钟 K 线(Minute Box) **/
@Entity('stock_minute_bars')
@Index(['stockCode', 'datetime'], { unique: true })
export class StockMinuteBar {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'stock_code', length: 10, comment: '股票代码' })
  stockCode: string;

  @Column({ type: 'datetime', comment: '分钟时间' })
  datetime: Date;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  open: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  high: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  low: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  close: number;

  @Column({ type: 'bigint', nullable: true })
  volume: number;
}
