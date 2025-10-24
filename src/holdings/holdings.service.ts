import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Holding } from '../entities/holding.entity';

@Injectable()
export class HoldingsService {
  constructor(
    @InjectRepository(Holding)
    private readonly holdingRepository: Repository<Holding>,
  ) {}

  // 创建持仓记录
  async createHolding(holdingData: Partial<Holding>): Promise<Holding> {
    const holding = this.holdingRepository.create(holdingData);
    return await this.holdingRepository.save(holding);
  }

  // 批量创建持仓记录
  async createMultipleHoldings(
    holdingDataList: Partial<Holding>[],
  ): Promise<Holding[]> {
    const holdings = this.holdingRepository.create(holdingDataList);
    return await this.holdingRepository.save(holdings);
  }

  // 获取所有持仓记录
  async findAll(): Promise<Holding[]> {
    return await this.holdingRepository.find({
      order: { symbol: 'ASC' },
    });
  }

  // 根据股票代码获取持仓记录
  async findBySymbol(symbol: string): Promise<Holding | null> {
    return await this.holdingRepository.findOne({ where: { symbol } });
  }

  // 更新持仓记录
  async updateHolding(
    id: number,
    updateData: Partial<Holding>,
  ): Promise<Holding | null> {
    await this.holdingRepository.update(id, updateData);
    return await this.holdingRepository.findOne({ where: { id } });
  }

  // 根据股票代码更新持仓记录
  async updateHoldingBySymbol(
    symbol: string,
    updateData: Partial<Holding>,
  ): Promise<Holding | null> {
    await this.holdingRepository.update({ symbol }, updateData);
    return await this.holdingRepository.findOne({ where: { symbol } });
  }

  // 删除持仓记录
  async deleteHolding(id: number): Promise<boolean> {
    const result = await this.holdingRepository.delete(id);
    return result.affected ? result.affected > 0 : false;
  }

  // 根据股票代码删除持仓记录
  async deleteHoldingBySymbol(symbol: string): Promise<boolean> {
    const result = await this.holdingRepository.delete({ symbol });
    return result.affected ? result.affected > 0 : false;
  }

  // 更新当前市值
  async updateCurrentValue(
    symbol: string,
    currentValue: number,
  ): Promise<Holding | null> {
    return await this.updateHoldingBySymbol(symbol, { currentValue });
  }

  // 批量更新当前市值
  async updateMultipleCurrentValues(
    updates: { symbol: string; currentValue: number }[],
  ): Promise<void> {
    for (const update of updates) {
      await this.updateCurrentValue(update.symbol, update.currentValue);
    }
  }

  // 获取持仓统计信息
  async getHoldingsStats(): Promise<{
    totalHoldings: number;
    totalCost: number;
    totalCurrentValue: number;
    totalProfit: number;
    totalProfitPercent: number;
    holdings: {
      symbol: string;
      quantity: number;
      cost: number;
      currentValue: number;
      profit: number;
      profitPercent: number;
    }[];
  }> {
    const holdings = await this.findAll();

    const totalHoldings = holdings.length;
    const totalCost = holdings.reduce(
      (sum, h) => sum + Number(h.cost),
      0,
    );
    const totalCurrentValue = holdings.reduce(
      (sum, h) => sum + Number(h.currentValue),
      0,
    );
    const totalProfit = totalCurrentValue - totalCost;
    const totalProfitPercent =
      totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

    const holdingsWithProfit = holdings.map((holding) => {
      const cost = Number(holding.cost);
      const currentValue = Number(holding.currentValue);
      const profit = currentValue - cost;
      const profitPercent = cost > 0 ? (profit / cost) * 100 : 0;

      return {
        symbol: holding.symbol,
        quantity: Number(holding.quantity),
        cost,
        currentValue,
        profit,
        profitPercent,
      };
    });

    return {
      totalHoldings,
      totalCost,
      totalCurrentValue,
      totalProfit,
      totalProfitPercent,
      holdings: holdingsWithProfit,
    };
  }

  // 获取总市值
  async getTotalValue(): Promise<number> {
    const holdings = await this.findAll();
    return holdings.reduce(
      (sum, holding) => sum + Number(holding.currentValue),
      0,
    );
  }

  // 获取总成本
  async getTotalCost(): Promise<number> {
    const holdings = await this.findAll();
    return holdings.reduce(
      (sum, holding) => sum + Number(holding.cost),
      0,
    );
  }

  // 获取盈亏情况
  async getProfitLoss(): Promise<{
    totalProfit: number;
    totalProfitPercent: number;
  }> {
    const totalCost = await this.getTotalCost();
    const totalValue = await this.getTotalValue();
    const totalProfit = totalValue - totalCost;
    const totalProfitPercent = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

    return {
      totalProfit,
      totalProfitPercent,
    };
  }

  // 根据盈亏情况排序持仓
  async getHoldingsByProfit(
    order: 'asc' | 'desc' = 'desc',
  ): Promise<{
    symbol: string;
    quantity: number;
    cost: number;
    currentValue: number;
    profit: number;
    profitPercent: number;
  }[]> {
    const stats = await this.getHoldingsStats();
    return stats.holdings.sort((a, b) => {
      return order === 'desc' ? b.profit - a.profit : a.profit - b.profit;
    });
  }
}
