import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stock } from '../entities/stock.entity';
import { getSingleStockInfo } from '../lib/stock/stockUtil';

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(Stock)
    private stockRepository: Repository<Stock>,
  ) {}

  /**
   * 创建股票记录
   */
  async createStock(stockData: Partial<Stock>): Promise<Stock> {
    const stock = this.stockRepository.create(stockData);
    return await this.stockRepository.save(stock);
  }

  /**
   * 同步股票信息：通过API获取股票信息，不存在则新增，存在则更新
   * @param code 股票代码
   * @param market 市场代码（1-上交所、0-深交所）
   */
  async syncStockFromAPI(
    code: string,
    market: number,
  ): Promise<{ stock: Stock; isNew: boolean }> {
    try {
      // 1. 调用API获取股票信息
      const stockInfo = await getSingleStockInfo(code, market);

      // 2. 检查股票是否已存在
      const existingStock = await this.findByCode(code);

      if (existingStock) {
        // 3. 如果存在，更新股票信息
        const updateData: Partial<Stock> = {
          name: stockInfo.name,
          market: stockInfo.market,
          marketType: stockInfo.marketType || (stockInfo.market === 1 ? 'SH' : 'SZ'),
          price: stockInfo.price,
          pct: stockInfo.pct,
          change: stockInfo.change,
          volume: stockInfo.volume,
          amount: stockInfo.amount,
          totalMarketCap: stockInfo.totalMarketCap,
          floatMarketCap: stockInfo.floatMarketCap,
          turnover: stockInfo.turnover,
        };

        const updatedStock = await this.updateStock(
          existingStock.id,
          updateData,
        );
        return { stock: updatedStock!, isNew: false };
      } else {
        // 4. 如果不存在，创建新股票记录
        const stockData: Partial<Stock> = {
          code: stockInfo.code,
          name: stockInfo.name,
          market: stockInfo.market,
          marketType: stockInfo.marketType || (stockInfo.market === 1 ? 'SH' : 'SZ'),
          price: stockInfo.price,
          pct: stockInfo.pct,
          change: stockInfo.change,
          volume: stockInfo.volume,
          amount: stockInfo.amount,
          totalMarketCap: stockInfo.totalMarketCap,
          floatMarketCap: stockInfo.floatMarketCap,
          turnover: stockInfo.turnover,
        };

        const stock = this.stockRepository.create(stockData);
        const savedStock = await this.stockRepository.save(stock);
        return { stock: savedStock, isNew: true };
      }
    } catch (error) {
      console.error(`同步股票 ${code} 失败:`, error);
      throw error;
    }
  }

  /**
   * 根据股票代码查找股票
   */
  async findByCode(code: string): Promise<Stock | null> {
    return await this.stockRepository.findOne({ where: { code } });
  }

  /**
   * 获取所有股票
   */
  async findAll(): Promise<Stock[]> {
    return await this.stockRepository.find();
  }

  /**
   * 根据市场代码查找股票
   * @param market 市场代码（1-上交所、0-深交所）
   */
  async findByMarket(market: number): Promise<Stock[]> {
    return await this.stockRepository.find({ where: { market } });
  }

  /**
   * 根据市场类型查找股票
   * @param marketType 市场类型（SH/SZ）
   */
  async findByMarketType(marketType: string): Promise<Stock[]> {
    return await this.stockRepository.find({ where: { marketType } });
  }

  /**
   * 更新股票信息
   */
  async updateStock(
    id: number,
    updateData: Partial<Stock>,
  ): Promise<Stock | null> {
    await this.stockRepository.update(id, updateData);
    return await this.stockRepository.findOne({ where: { id } });
  }

  /**
   * 删除股票
   */
  async deleteStock(id: number): Promise<boolean> {
    const result = await this.stockRepository.delete(id);
    return result.affected ? result.affected > 0 : false;
  }

  /**
   * 根据股票代码更新股票信息
   */
  async updateStockByCode(
    code: string,
    updateData: Partial<Stock>,
  ): Promise<Stock | null> {
    const stock = await this.findByCode(code);
    if (!stock) {
      return null;
    }

    return await this.updateStock(stock.id, updateData);
  }

  /**
   * 批量更新股票信息
   */
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




}
