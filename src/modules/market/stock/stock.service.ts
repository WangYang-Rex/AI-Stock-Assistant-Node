import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stock } from '../../../entities/stock.entity';
import { eastmoney } from 'eastmoney-data-sdk';

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(Stock)
    private stockRepository: Repository<Stock>,
  ) {}

  /**
   * 同步股票信息：通过东方财富API获取股票信息，不存在则新增，存在则更新
   * @param code 股票代码（如：'600519'）
   * @param market 市场代码（1-上交所、0-深交所）
   * @returns Promise<{ stock: Stock; isNew: boolean }> 返回股票实体和是否为新创建的标识
   */
  async syncStockFromAPI(
    code: string,
    market: number,
  ): Promise<{ stock: Stock; isNew: boolean }> {
    try {
      // 1. 构建 secid（市场代码.股票代码格式）
      const secid = `${market}.${code}`;

      // 2. 调用东方财富 SDK 获取实时行情数据
      const quote = await eastmoney.quote(secid);

      if (!quote) {
        throw new Error(`无法获取股票 ${code} 的行情数据`);
      }

      // 3. 检查股票是否已存在于数据库
      const existingStock = await this.findByCode(code);

      // 4. 准备股票数据（从API响应中提取必要字段）
      const stockData: Partial<Stock> = {
        name: quote.name || '',
        market: market,
        marketType: market === 1 ? 'SH' : 'SZ',
        price: quote.price || 0,
        pct: quote.pct || 0,
        change: quote.change || 0,
        volume: quote.volume || 0,
        amount: quote.amount || 0,
        totalMarketCap: quote.totalMarketCap || 0,
        floatMarketCap: quote.floatMarketCap || 0,
        turnover: quote.turnover || 0,
      };

      if (existingStock) {
        // 5. 如果存在，更新股票信息
        const updatedStock = await this.updateStock(
          existingStock.id,
          stockData,
        );
        console.log(
          `✅ 更新股票: ${quote.name}(${code}), 价格: ${quote.price}`,
        );
        return { stock: updatedStock, isNew: false };
      } else {
        // 6. 如果不存在，创建新股票记录
        const newStockData: Partial<Stock> = {
          code: code,
          ...stockData,
        };

        const stock = this.stockRepository.create(newStockData);
        const savedStock = await this.stockRepository.save(stock);
        console.log(
          `🆕 新增股票: ${quote.name}(${code}), 价格: ${quote.price}`,
        );
        return { stock: savedStock, isNew: true };
      }
    } catch (error) {
      console.error(`❌ 同步股票 ${code} 失败:`, error);
      throw new Error(`同步股票信息失败: ${error.message || error}`);
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
