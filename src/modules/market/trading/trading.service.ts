import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, IsNull, Not } from 'typeorm';
import { Trading } from '../../../entities/trading.entity';

@Injectable()
export class TradingService {
  constructor(
    @InjectRepository(Trading)
    private readonly tradingRepository: Repository<Trading>,
  ) {}

  /**
   * 计算交易收益
   */
  private calculateProfit(trading: Partial<Trading>) {
    if (
      trading.buy_price &&
      trading.buy_volume &&
      trading.sell_price &&
      trading.sell_volume
    ) {
      const buyAmount = Number(trading.buy_price) * Number(trading.buy_volume);
      const sellAmount =
        Number(trading.sell_price) * Number(trading.sell_volume);
      trading.profit = sellAmount - buyAmount;
      trading.profit_rate = trading.profit / buyAmount;
    }
    return trading;
  }

  // 创建交易记录
  async createTrading(tradingData: Partial<Trading>): Promise<Trading> {
    const data = this.calculateProfit(tradingData);
    const trading = this.tradingRepository.create(data);
    return await this.tradingRepository.save(trading);
  }

  // 更新交易记录
  async updateTrading(
    id: number,
    updateData: Partial<Trading>,
  ): Promise<Trading | null> {
    const existing = await this.tradingRepository.findOne({ where: { id } });
    if (!existing) return null;

    const merged = { ...existing, ...updateData };
    this.calculateProfit(merged);

    await this.tradingRepository.save(merged);
    return await this.tradingRepository.findOne({ where: { id } });
  }

  // 删除交易记录
  async deleteTrading(id: number): Promise<boolean> {
    const result = await this.tradingRepository.delete(id);
    return result.affected ? result.affected > 0 : false;
  }

  // 获取所有交易记录
  async findAll(): Promise<Trading[]> {
    return await this.tradingRepository.find({
      order: { buy_date: 'DESC' },
    });
  }

  // 根据股票代码获取交易记录
  async findByCode(code: string): Promise<Trading[]> {
    return await this.tradingRepository.find({
      where: { code },
      order: { buy_date: 'DESC' },
    });
  }

  // 获取已平仓交易
  async findClosedTrades(): Promise<Trading[]> {
    return await this.tradingRepository.find({
      where: { sell_date: Not(IsNull()) },
      order: { sell_date: 'DESC' },
    });
  }

  // 获取持仓中交易
  async findOpenTrades(): Promise<Trading[]> {
    return await this.tradingRepository.find({
      where: { sell_date: IsNull() },
      order: { buy_date: 'DESC' },
    });
  }

  // 获取指定时间段的交易统计
  async getTradingStats(
    code?: string,
    startTime?: Date,
    endTime?: Date,
  ): Promise<{
    totalTrades: number;
    closedTrades: number;
    totalProfit: number;
    avgProfitRate: number;
    winRate: number;
  }> {
    const queryBuilder = this.tradingRepository.createQueryBuilder('trading');

    if (code) {
      queryBuilder.where('trading.code = :code', { code });
    }

    if (startTime && endTime) {
      queryBuilder.andWhere(
        'trading.buy_date BETWEEN :startTime AND :endTime',
        { startTime, endTime },
      );
    }

    const tradings = await queryBuilder.getMany();
    const closedTrades = tradings.filter((t) => t.sell_date !== null);

    const totalProfit = closedTrades.reduce(
      (sum, t) => sum + Number(t.profit || 0),
      0,
    );
    const winTrades = closedTrades.filter(
      (t) => Number(t.profit || 0) > 0,
    ).length;

    const totalTrades = tradings.length;
    const closedCount = closedTrades.length;

    const avgProfitRate =
      closedCount > 0
        ? closedTrades.reduce((sum, t) => sum + Number(t.profit_rate || 0), 0) /
          closedCount
        : 0;

    const winRate = closedCount > 0 ? winTrades / closedCount : 0;

    return {
      totalTrades,
      closedTrades: closedCount,
      totalProfit,
      avgProfitRate,
      winRate,
    };
  }

  // 清理过期数据
  async cleanOldData(daysToKeep: number = 365): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.tradingRepository.delete({
      buy_date: LessThan(cutoffDate),
    });
    return result.affected || 0;
  }
}
