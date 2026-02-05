import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockMinuteBar } from '../../../entities/stock-minute-bar.entity';
import { ConstituentsMinuteProvider, MinuteBar } from './interfaces';

@Injectable()
export class DBMinuteProvider implements ConstituentsMinuteProvider {
  constructor(
    @InjectRepository(StockMinuteBar)
    private readonly repo: Repository<StockMinuteBar>,
  ) {}

  async getMinuteBars(
    stockCodes: string[],
    date: string,
    startTime: string,
    endTime: string,
  ): Promise<Record<string, MinuteBar[]>> {
    const start = `${date} ${startTime}:00`;
    const end = `${date} ${endTime}:00`;

    const queryBuilder = this.repo
      .createQueryBuilder('m')
      .where('m.stock_code IN (:...codes)', { codes: stockCodes })
      .andWhere('m.datetime BETWEEN :start AND :end', { start, end })
      .orderBy('m.datetime', 'ASC');

    const resultRows = await queryBuilder.getMany();

    return this.groupByStockCode(resultRows);
  }

  private groupByStockCode(
    rows: StockMinuteBar[],
  ): Record<string, MinuteBar[]> {
    const grouped: Record<string, MinuteBar[]> = {};
    for (const row of rows) {
      if (!grouped[row.stockCode]) {
        grouped[row.stockCode] = [];
      }
      grouped[row.stockCode].push({
        datetime: row.datetime.toISOString().replace('T', ' ').substring(0, 16),
        open: Number(row.open),
        high: Number(row.high),
        low: Number(row.low),
        close: Number(row.close),
        volume: Number(row.volume),
      });
    }
    return grouped;
  }
}
