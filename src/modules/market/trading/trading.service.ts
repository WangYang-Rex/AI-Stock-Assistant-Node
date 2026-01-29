import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan, MoreThan } from 'typeorm';
import { Trading } from '../../../entities/trading.entity';

@Injectable()
export class TradingService {
  constructor(
    @InjectRepository(Trading)
    private readonly tradingRepository: Repository<Trading>,
  ) { }

  // 创建交易记录
  async createTrading(tradingData: Partial<Trading>): Promise<Trading> {
    const trading = this.tradingRepository.create(tradingData);
    return await this.tradingRepository.save(trading);
  }

  // 批量创建交易记录
  async createMultipleTrading(
    tradingDataList: Partial<Trading>[],
  ): Promise<Trading[]> {
    const tradings = this.tradingRepository.create(tradingDataList);
    return await this.tradingRepository.save(tradings);
  }

  // 获取所有交易记录
  async findAll(): Promise<Trading[]> {
    return await this.tradingRepository.find({
      order: { tradingTime: 'DESC' },
    });
  }

  // 根据股票代码获取交易记录
  async findBySymbol(symbol: string): Promise<Trading[]> {
    return await this.tradingRepository.find({
      where: { symbol },
      order: { tradingTime: 'DESC' },
    });
  }

  // 根据股票代码和时间范围获取交易记录
  async findBySymbolAndTimeRange(
    symbol: string,
    startTime: Date,
    endTime: Date,
  ): Promise<Trading[]> {
    return await this.tradingRepository.find({
      where: {
        symbol,
        tradingTime: Between(startTime, endTime),
      },
      order: { tradingTime: 'ASC' },
    });
  }

  // 根据交易类型获取记录
  async findByType(type: 'buy' | 'sell'): Promise<Trading[]> {
    return await this.tradingRepository.find({
      where: { type },
      order: { tradingTime: 'DESC' },
    });
  }

  // 根据价格范围获取记录
  async findByPriceRange(
    minPrice: number,
    maxPrice: number,
  ): Promise<Trading[]> {
    return await this.tradingRepository.find({
      where: {
        price: Between(minPrice, maxPrice),
      },
      order: { tradingTime: 'DESC' },
    });
  }

  // 获取最新交易记录
  async findLatest(symbol?: string, limit: number = 100): Promise<Trading[]> {
    const queryBuilder = this.tradingRepository.createQueryBuilder('trading');

    if (symbol) {
      queryBuilder.where('trading.symbol = :symbol', { symbol });
    }

    return await queryBuilder
      .orderBy('trading.tradingTime', 'DESC')
      .limit(limit)
      .getMany();
  }

  // 获取指定时间段的交易统计
  async getTradingStats(
    symbol?: string,
    startTime?: Date,
    endTime?: Date,
  ): Promise<{
    totalTrades: number;
    totalVolume: number;
    totalAmount: number;
    buyTrades: number;
    sellTrades: number;
    avgPrice: number;
  }> {
    const queryBuilder = this.tradingRepository.createQueryBuilder('trading');

    if (symbol) {
      queryBuilder.where('trading.symbol = :symbol', { symbol });
    }

    if (startTime && endTime) {
      queryBuilder.andWhere(
        'trading.tradingTime BETWEEN :startTime AND :endTime',
        {
          startTime,
          endTime,
        },
      );
    }

    const [tradings, buyCount, sellCount] = await Promise.all([
      queryBuilder.getMany(),
      queryBuilder
        .clone()
        .andWhere('trading.type = :type', { type: 'buy' })
        .getCount(),
      queryBuilder
        .clone()
        .andWhere('trading.type = :type', { type: 'sell' })
        .getCount(),
    ]);

    const totalTrades = tradings.length;
    const totalVolume = tradings.reduce(
      (sum, t) => sum + Number(t.quantity),
      0,
    );
    const totalAmount = tradings.reduce(
      (sum, t) => sum + Number(t.price * t.quantity),
      0,
    );
    const avgPrice = totalVolume > 0 ? totalAmount / totalVolume : 0;

    return {
      totalTrades,
      totalVolume,
      totalAmount,
      buyTrades: buyCount,
      sellTrades: sellCount,
      avgPrice,
    };
  }

  // 更新交易记录
  async updateTrading(
    id: number,
    updateData: Partial<Trading>,
  ): Promise<Trading | null> {
    await this.tradingRepository.update(id, updateData);
    return await this.tradingRepository.findOne({ where: { id } });
  }

  // 删除交易记录
  async deleteTrading(id: number): Promise<boolean> {
    const result = await this.tradingRepository.delete(id);
    return result.affected ? result.affected > 0 : false;
  }

  // 清理过期数据（保留最近N天的数据）
  async cleanOldData(daysToKeep: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.tradingRepository.delete({
      tradingTime: LessThan(cutoffDate),
    });

    return result.affected || 0;
  }
}
