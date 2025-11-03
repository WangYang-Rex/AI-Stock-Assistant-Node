import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindManyOptions } from 'typeorm';
import { Quote } from '../entities/quote.entity';
import { getStockInfo } from 'src/lib/stock/stockUtil';

export interface CreateQuoteDto {
  code: string;
  name: string;
  marketCode: string;
  latestPrice?: number;
  changePercent?: number;
  openPrice?: number;
  volume?: number;
  volumeAmount?: number;
  previousClosePrice?: number;
  snapshotTime?: Date;
  snapshotDate?: Date;
}

export interface UpdateQuoteDto {
  latestPrice?: number;
  changePercent?: number;
  openPrice?: number;
  volume?: number;
  volumeAmount?: number;
  previousClosePrice?: number;
  snapshotTime?: Date;
  snapshotDate?: Date;
}

export interface QuoteQueryDto {
  code?: string;
  marketCode?: string;
  startTime?: Date;
  endTime?: Date;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

@Injectable()
export class QuotesService {
  constructor(
    @InjectRepository(Quote)
    private readonly quoteRepository: Repository<Quote>,
  ) {}

  /**
   * 创建行情快照
   */
  async createQuote(createQuoteDto: CreateQuoteDto): Promise<Quote> {
    const quote = this.quoteRepository.create(createQuoteDto);
    return await this.quoteRepository.save(quote);
  }

  /**
   * 批量创建行情快照
   */
  async createQuotes(createQuoteDtos: CreateQuoteDto[]): Promise<Quote[]> {
    const quotes = this.quoteRepository.create(createQuoteDtos);
    return await this.quoteRepository.save(quotes);
  }

  // 同步股票快照：通过API获取股票信息，不存在则新增，存在则更新
  async syncStockQuotesFromAPI(
    stocks: Array<{ code: string; marketCode: number }>,
  ): Promise<boolean> {
    try {
      // 1. 调用API获取股票信息
      const stockInfos = await getStockInfo(stocks);

      // 2. 转换为行情快照
      const createQuoteDtos = stockInfos.map((stockInfo) => ({
        code: stockInfo.code,
        name: stockInfo.name,
        marketCode: stockInfo.marketCode.toString(),
        latestPrice: stockInfo.latestPrice,
      }));

      // 3. 插入行情快照
      await this.createQuotes(createQuoteDtos);

      return true;
    } catch (error) {
      console.error(`同步股票快照失败:`, error);
      throw error;
    }
  }

  /**
   * 获取所有行情快照
   */
  async findAll(
    queryDto: QuoteQueryDto = {},
  ): Promise<{ quotes: Quote[]; total: number }> {
    const {
      code,
      marketCode,
      startTime,
      endTime,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = queryDto;

    const where: any = {};

    if (code) {
      where.code = code;
    }

    if (marketCode) {
      where.marketCode = marketCode;
    }

    if (startTime && endTime) {
      where.snapshotTime = Between(startTime, endTime);
    } else if (startTime) {
      where.snapshotTime = Between(startTime, new Date());
    }

    if (startDate && endDate) {
      where.snapshotDate = Between(startDate, endDate);
    } else if (startDate) {
      where.snapshotDate = Between(startDate, new Date());
    }

    const options: FindManyOptions<Quote> = {
      where,
      order: { snapshotTime: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    };

    const [quotes, total] = await this.quoteRepository.findAndCount(options);

    return { quotes, total };
  }

  /**
   * 根据ID获取行情快照
   */
  async findOne(id: number): Promise<Quote | null> {
    return await this.quoteRepository.findOne({ where: { id } });
  }

  /**
   * 获取指定股票的最新行情
   */
  async findLatestByCode(code: string): Promise<Quote | null> {
    return await this.quoteRepository.findOne({
      where: { code },
      order: { snapshotTime: 'DESC' },
    });
  }

  /**
   * 获取指定股票的历史行情
   */
  async findByCode(
    code: string,
    startTime?: Date,
    endTime?: Date,
    limit: number = 100,
  ): Promise<Quote[]> {
    const where: any = { code };

    if (startTime && endTime) {
      where.snapshotTime = Between(startTime, endTime);
    } else if (startTime) {
      where.snapshotTime = Between(startTime, new Date());
    }

    return await this.quoteRepository.find({
      where,
      order: { snapshotTime: 'DESC' },
      take: limit,
    });
  }

  /**
   * 根据日期获取指定股票的行情
   */
  async findByCodeAndDate(
    code: string,
    startDate?: Date,
    endDate?: Date,
    limit: number = 100,
  ): Promise<Quote[]> {
    const where: any = { code };

    if (startDate && endDate) {
      where.snapshotDate = Between(startDate, endDate);
    } else if (startDate) {
      where.snapshotDate = Between(startDate, new Date());
    }

    return await this.quoteRepository.find({
      where,
      order: { snapshotDate: 'DESC', snapshotTime: 'DESC' },
      take: limit,
    });
  }

  /**
   * 获取指定日期的所有行情
   */
  async findByDate(date: Date): Promise<Quote[]> {
    return await this.quoteRepository.find({
      where: { snapshotDate: date },
      order: { snapshotTime: 'DESC' },
    });
  }

  /**
   * 更新行情快照
   */
  async update(
    id: number,
    updateQuoteDto: UpdateQuoteDto,
  ): Promise<Quote | null> {
    await this.quoteRepository.update(id, updateQuoteDto);
    return await this.findOne(id);
  }

  /**
   * 删除行情快照
   */
  async remove(id: number): Promise<void> {
    await this.quoteRepository.delete(id);
  }

  /**
   * 批量删除指定时间范围的行情快照
   */
  async removeByTimeRange(startTime: Date, endTime: Date): Promise<void> {
    await this.quoteRepository.delete({
      snapshotTime: Between(startTime, endTime),
    });
  }

  /**
   * 获取市场统计信息
   */
  async getMarketStats(): Promise<
    {
      marketCode: string;
      count: string;
      avgPrice: string;
      maxPrice: string;
      minPrice: string;
    }[]
  > {
    return await this.quoteRepository
      .createQueryBuilder('quote')
      .select('quote.marketCode', 'marketCode')
      .addSelect('COUNT(*)', 'count')
      .addSelect('AVG(quote.latestPrice)', 'avgPrice')
      .addSelect('MAX(quote.latestPrice)', 'maxPrice')
      .addSelect('MIN(quote.latestPrice)', 'minPrice')
      .groupBy('quote.marketCode')
      .getRawMany();
  }

  /**
   * 获取涨跌幅排行榜
   */
  async getTopGainers(limit: number = 10): Promise<Quote[]> {
    return await this.quoteRepository.find({
      order: { changePercent: 'DESC' },
      take: limit,
    });
  }

  /**
   * 获取跌幅排行榜
   */
  async getTopLosers(limit: number = 10): Promise<Quote[]> {
    return await this.quoteRepository.find({
      order: { changePercent: 'ASC' },
      take: limit,
    });
  }

  /**
   * 获取成交量排行榜
   */
  async getTopVolume(limit: number = 10): Promise<Quote[]> {
    return await this.quoteRepository.find({
      order: { volume: 'DESC' },
      take: limit,
    });
  }
}
