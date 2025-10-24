import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan, MoreThan } from 'typeorm';
import { Quote } from '../entities/quote.entity';

@Injectable()
export class QuotesService {
  constructor(
    @InjectRepository(Quote)
    private readonly quoteRepository: Repository<Quote>,
  ) {}

  // 创建行情记录
  async createQuote(quoteData: Partial<Quote>): Promise<Quote> {
    const quote = this.quoteRepository.create(quoteData);
    return await this.quoteRepository.save(quote);
  }

  // 批量创建行情记录
  async createMultipleQuotes(
    quoteDataList: Partial<Quote>[],
  ): Promise<Quote[]> {
    const quotes = this.quoteRepository.create(quoteDataList);
    return await this.quoteRepository.save(quotes);
  }

  // 获取所有行情记录
  async findAll(): Promise<Quote[]> {
    return await this.quoteRepository.find({
      order: { quoteDate: 'DESC', quoteTime: 'DESC' },
    });
  }

  // 根据股票代码获取行情记录
  async findBySymbol(symbol: string): Promise<Quote[]> {
    return await this.quoteRepository.find({
      where: { symbol },
      order: { quoteDate: 'DESC', quoteTime: 'DESC' },
    });
  }

  // 根据日期获取行情记录
  async findByDate(quoteDate: Date): Promise<Quote[]> {
    return await this.quoteRepository.find({
      where: { quoteDate },
      order: { quoteTime: 'ASC' },
    });
  }

  // 根据股票代码和日期获取行情记录
  async findBySymbolAndDate(
    symbol: string,
    quoteDate: Date,
  ): Promise<Quote[]> {
    return await this.quoteRepository.find({
      where: { symbol, quoteDate },
      order: { quoteTime: 'ASC' },
    });
  }

  // 根据股票代码和日期范围获取行情记录
  async findBySymbolAndDateRange(
    symbol: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Quote[]> {
    return await this.quoteRepository.find({
      where: {
        symbol,
        quoteDate: Between(startDate, endDate),
      },
      order: { quoteDate: 'ASC', quoteTime: 'ASC' },
    });
  }

  // 根据价格范围获取行情记录
  async findByPriceRange(
    minPrice: number,
    maxPrice: number,
  ): Promise<Quote[]> {
    return await this.quoteRepository.find({
      where: {
        price: Between(minPrice, maxPrice),
      },
      order: { quoteDate: 'DESC', quoteTime: 'DESC' },
    });
  }

  // 获取最新行情记录
  async findLatest(symbol?: string, limit: number = 100): Promise<Quote[]> {
    const queryBuilder = this.quoteRepository.createQueryBuilder('quote');

    if (symbol) {
      queryBuilder.where('quote.symbol = :symbol', { symbol });
    }

    return await queryBuilder
      .orderBy('quote.quoteDate', 'DESC')
      .addOrderBy('quote.quoteTime', 'DESC')
      .limit(limit)
      .getMany();
  }

  // 获取行情统计信息
  async getQuoteStats(
    symbol?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    totalQuotes: number;
    avgPrice: number;
    maxPrice: number;
    minPrice: number;
    totalVolume: number;
    priceRange: {
      highest: number;
      lowest: number;
    };
  }> {
    const queryBuilder = this.quoteRepository.createQueryBuilder('quote');

    if (symbol) {
      queryBuilder.where('quote.symbol = :symbol', { symbol });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere(
        'quote.quoteDate BETWEEN :startDate AND :endDate',
        {
          startDate,
          endDate,
        },
      );
    }

    const quotes = await queryBuilder.getMany();

    const totalQuotes = quotes.length;
    const prices = quotes.map((q) => Number(q.price));
    const volumes = quotes.map((q) => Number(q.volume));

    const avgPrice =
      prices.length > 0 ? prices.reduce((sum, price) => sum + price, 0) / prices.length : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const totalVolume = volumes.reduce((sum, volume) => sum + volume, 0);

    const highPrices = quotes.map((q) => Number(q.highPrice));
    const lowPrices = quotes.map((q) => Number(q.lowPrice));

    return {
      totalQuotes,
      avgPrice,
      maxPrice,
      minPrice,
      totalVolume,
      priceRange: {
        highest: highPrices.length > 0 ? Math.max(...highPrices) : 0,
        lowest: lowPrices.length > 0 ? Math.min(...lowPrices) : 0,
      },
    };
  }

  // 更新行情记录
  async updateQuote(
    id: number,
    updateData: Partial<Quote>,
  ): Promise<Quote | null> {
    await this.quoteRepository.update(id, updateData);
    return await this.quoteRepository.findOne({ where: { id } });
  }

  // 删除行情记录
  async deleteQuote(id: number): Promise<boolean> {
    const result = await this.quoteRepository.delete(id);
    return result.affected ? result.affected > 0 : false;
  }

  // 清理过期数据（保留最近N天的数据）
  async cleanOldData(daysToKeep: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.quoteRepository.delete({
      quoteDate: LessThan(cutoffDate),
    });

    return result.affected || 0;
  }
}
