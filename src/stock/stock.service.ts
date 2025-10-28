import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stock } from '../entities/stock.entity';
import { getStockInfo } from '../lib/stock/stockUtil';

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(Stock)
    private stockRepository: Repository<Stock>,
  ) {}

  // 创建股票记录
  async createStock(stockData: Partial<Stock>): Promise<Stock> {
    const stock = this.stockRepository.create(stockData);
    return await this.stockRepository.save(stock);
  }

  // 通过API获取股票信息并添加到数据库
  async addStockFromAPI(code: string, marketCode: number): Promise<Stock> {
    try {
      // 1. 检查股票是否已存在
      const existingStock = await this.findByCode(code);
      if (existingStock) {
        throw new Error(`股票代码 ${code} 已存在于数据库中`);
      }

      // 2. 调用API获取股票信息
      const stockInfo = await getStockInfo(code, marketCode);

      // 3. 将API返回的数据映射到数据库实体
      const stockData: Partial<Stock> = {
        code: stockInfo.code,
        name: stockInfo.name,
        market: stockInfo.market,
        marketCode: stockInfo.marketCode,
        latestPrice: stockInfo.latestPrice,
        changePercent: stockInfo.changePercent,
        changeAmount: stockInfo.changeAmount,
        openPrice: stockInfo.openPrice,
        highPrice: stockInfo.highPrice,
        lowPrice: stockInfo.lowPrice,
        previousClosePrice: stockInfo.previousClosePrice,
        volume: stockInfo.volume,
        pe: stockInfo.pe,
        // 注意：StockInfo 中的 volumeAmount, amplitude, turnoverRate 字段在 Stock 实体中不存在
      };

      // 4. 保存到数据库
      const stock = this.stockRepository.create(stockData);
      return await this.stockRepository.save(stock);
    } catch (error) {
      console.error(`添加股票 ${code} 失败:`, error);
      throw error;
    }
  }

  // 根据股票代码查找股票
  async findByCode(code: string): Promise<Stock | null> {
    return await this.stockRepository.findOne({ where: { code } });
  }

  // 获取所有股票
  async findAll(): Promise<Stock[]> {
    return await this.stockRepository.find();
  }

  // 根据市场类型查找股票
  async findByMarket(market: string): Promise<Stock[]> {
    return await this.stockRepository.find({ where: { market } });
  }

  // 根据市场代码查找股票
  async findByMarketCode(marketCode: number): Promise<Stock[]> {
    return await this.stockRepository.find({ where: { marketCode } });
  }

  // 更新股票信息
  async updateStock(
    id: number,
    updateData: Partial<Stock>,
  ): Promise<Stock | null> {
    await this.stockRepository.update(id, updateData);
    return await this.stockRepository.findOne({ where: { id } });
  }

  // 删除股票
  async deleteStock(id: number): Promise<boolean> {
    const result = await this.stockRepository.delete(id);
    return result.affected ? result.affected > 0 : false;
  }

  // 更新股票价格信息
  async updateStockPrice(
    code: string,
    priceData: {
      latestPrice?: number;
      previousClosePrice?: number;
      changePercent?: number;
      changeAmount?: number;
      openPrice?: number;
      highPrice?: number;
      lowPrice?: number;
      volume?: number;
      pe?: number;
    },
  ): Promise<Stock | null> {
    const stock = await this.findByCode(code);
    if (!stock) {
      return null;
    }

    return await this.updateStock(stock.id, priceData);
  }

  // 更新持仓信息
  async updateHoldingInfo(
    code: string,
    holdingData: {
      holdingQuantity?: number;
      holdingCost?: number;
    },
  ): Promise<Stock | null> {
    const stock = await this.findByCode(code);
    if (!stock) {
      return null;
    }

    // 如果更新了持仓数量，自动计算市值
    const updateData: Partial<Stock> = { ...holdingData };
    if (holdingData.holdingQuantity !== undefined && stock.latestPrice) {
      updateData.marketValue = holdingData.holdingQuantity * stock.latestPrice;
    }

    return await this.updateStock(stock.id, updateData);
  }

  // 计算并更新市值
  async calculateMarketValue(code: string): Promise<Stock | null> {
    const stock = await this.findByCode(code);
    if (!stock || !stock.holdingQuantity || !stock.latestPrice) {
      return null;
    }

    const marketValue = stock.holdingQuantity * stock.latestPrice;
    return await this.updateStock(stock.id, { marketValue });
  }

  // 获取持仓股票列表
  async getHoldingStocks(): Promise<Stock[]> {
    return await this.stockRepository
      .createQueryBuilder('stock')
      .where('stock.holdingQuantity > 0')
      .orderBy('stock.marketValue', 'DESC')
      .getMany();
  }

  // 批量更新股票信息
  async batchUpdateStocks(
    updates: Array<{ code: string; updateData: Partial<Stock> }>,
  ): Promise<Stock[]> {
    const results: Stock[] = [];

    for (const update of updates) {
      const stock = await this.findByCode(update.code);
      if (stock) {
        const updatedStock = await this.updateStock(
          stock.id,
          update.updateData,
        );
        if (updatedStock) {
          results.push(updatedStock);
        }
      }
    }

    return results;
  }

  // 更新市盈率
  async updatePE(code: string, pe: number): Promise<Stock | null> {
    const stock = await this.findByCode(code);
    if (!stock) {
      return null;
    }

    return await this.updateStock(stock.id, { pe });
  }

  // 更新成交量
  async updateVolume(code: string, volume: number): Promise<Stock | null> {
    const stock = await this.findByCode(code);
    if (!stock) {
      return null;
    }

    return await this.updateStock(stock.id, { volume });
  }

  // 获取股票统计信息
  async getStockStats() {
    const total = await this.stockRepository.count();
    const byMarket = await this.stockRepository
      .createQueryBuilder('stock')
      .select('stock.market', 'market')
      .addSelect('COUNT(*)', 'count')
      .groupBy('stock.market')
      .getRawMany();

    const byMarketCode = await this.stockRepository
      .createQueryBuilder('stock')
      .select('stock.marketCode', 'marketCode')
      .addSelect('COUNT(*)', 'count')
      .where('stock.marketCode IS NOT NULL')
      .groupBy('stock.marketCode')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    // 获取价格统计信息
    const priceStats = (await this.stockRepository
      .createQueryBuilder('stock')
      .select('AVG(stock.latestPrice)', 'avgPrice')
      .addSelect('MAX(stock.latestPrice)', 'maxPrice')
      .addSelect('MIN(stock.latestPrice)', 'minPrice')
      .addSelect('AVG(stock.changePercent)', 'avgChangePercent')
      .where('stock.latestPrice IS NOT NULL')
      .getRawOne()) as {
      avgPrice: string;
      maxPrice: string;
      minPrice: string;
      avgChangePercent: string;
    } | null;

    // 获取持仓统计信息
    const holdingStats = (await this.stockRepository
      .createQueryBuilder('stock')
      .select('SUM(stock.marketValue)', 'totalMarketValue')
      .addSelect('AVG(stock.holdingCost)', 'avgHoldingCost')
      .addSelect('COUNT(*)', 'holdingCount')
      .where('stock.holdingQuantity > 0')
      .getRawOne()) as {
      totalMarketValue: string;
      avgHoldingCost: string;
      holdingCount: string;
    } | null;

    return {
      total,
      byMarket,
      byMarketCode,
      priceStats,
      holdingStats,
    };
  }
}
