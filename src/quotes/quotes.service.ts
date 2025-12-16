import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindManyOptions } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { Quote } from '../entities/quote.entity';
// import { getStockInfo } from 'src/lib/stock/stockUtil';
import { getTrendsData } from '../lib/stock/getTrendsData';
import { sleepFun } from 'src/lib/utils/sleep';
import { StockService } from '../stock/stock.service';

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
  private readonly logger = new Logger(QuotesService.name);

  constructor(
    @InjectRepository(Quote)
    private readonly quoteRepository: Repository<Quote>,
    private readonly stockService: StockService,
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
  async syncStockQuotesFromAPI(stock: {
    code: string;
    marketCode: number;
  }): Promise<boolean> {
    try {
      // 1. 调用API获取股票信息
      // 注意：getTrendsData 参数顺序是 (stockCode, marketCode)
      console.log(`syncStockQuotesFromAPI 获取实时数据开始`);
      const res = await getTrendsData(stock.code, String(stock.marketCode));

      // 2. 检查返回值是否为 null
      if (!res || !res.trends || res.trends.length === 0) {
        console.log(`syncStockQuotesFromAPI 获取分时数据失败：返回值为 null`);
        return false;
      }
      // 3. 解构数据
      const { date, preClose, trends } = res;
      console.log(
        `syncStockQuotesFromAPI 获取分时数据成功`,
        `日期: ${date}`,
        `昨收价: ${preClose}`,
        `共 ${trends.length} 条`,
      );

      await sleepFun(1000); // 延迟1秒

      // 4. 先检查系统中当天的数据有没有
      const today = date; // new Date().toISOString().split('T')[0];
      const existingQuotes = await this.quoteRepository.find({
        where: {
          snapshotDate: Between(
            new Date(`${today} 00:00:00`),
            new Date(`${today} 23:59:59`),
          ),
          code: stock.code,
          marketCode: String(stock.marketCode),
        },
      });
      console.log(
        `syncStockQuotesFromAPI 查询 ${stock.code} ${today} 的数据，${existingQuotes.length} 条`,
      );
      if (existingQuotes.length > 0) {
        // 删除操作
        console.log(`syncStockQuotesFromAPI 有数据，进行删除操作`);
        await this.quoteRepository.delete({
          snapshotDate: Between(
            new Date(`${today} 00:00:00`),
            new Date(`${today} 23:59:59`),
          ),
          code: stock.code,
          marketCode: String(stock.marketCode),
        });
        console.log(`syncStockQuotesFromAPI 删除操作成功`);
      }

      await sleepFun(1000); // 延迟1秒

      // 5. 插入行情快照
      if (trends.length > 0) {
        console.log(`syncStockQuotesFromAPI 插入行情快照开始`);
        await this.createQuotes(trends as any[]);
        console.log(`syncStockQuotesFromAPI 插入行情快照成功`);

        // 用最后一条数据更新stock信息
        console.log(`syncStockQuotesFromAPI 更新stock信息开始`);
        const lastQuote = trends[trends.length - 1];
        await this.stockService.updateStockPrice(stock.code, {
          latestPrice: lastQuote.latestPrice,
          changePercent: lastQuote.changePercent,
        });

        console.log(`syncStockQuotesFromAPI 更新stock信息成功`);
      }

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

    const where: Record<string, any> = {};

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
    const where: Record<string, any> = { code };

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
    const where: Record<string, any> = { code };

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

  /**
   * 工作日中午12点同步股票快照数据
   */
  @Cron('0 0 12 * * 1-5', {
    name: 'weekday-noon-quotes-sync',
    timeZone: 'Asia/Shanghai',
  })
  async handleWeekdayNoonQuotesSync() {
    this.logger.log('开始执行工作日中午12点股票快照同步任务...');
    await this.syncAllStockQuotes();
  }

  /**
   * 工作日下午16点同步股票快照数据
   */
  @Cron('0 0 16 * * 1-5', {
    name: 'weekday-afternoon-quotes-sync',
    timeZone: 'Asia/Shanghai',
  })
  async handleWeekdayAfternoonQuotesSync() {
    this.logger.log('开始执行工作日下午16点股票快照同步任务...');
    await this.syncAllStockQuotes();
  }

  /**
   * 同步所有股票的快照数据
   */
  private async syncAllStockQuotes(): Promise<void> {
    try {
      // 获取所有股票列表
      const stocks = await this.stockService.findAll();

      if (stocks.length === 0) {
        this.logger.warn('没有找到股票数据，跳过同步任务');
        return;
      }

      this.logger.log(`找到 ${stocks.length} 只股票，开始同步快照数据...`);

      let successCount = 0;
      let errorCount = 0;

      // 批量同步股票快照数据
      for (const stock of stocks) {
        try {
          const result = await this.syncStockQuotesFromAPI({
            code: stock.code,
            marketCode: stock.marketCode,
          });
          if (result) {
            successCount++;
            this.logger.debug(
              `成功同步股票快照: ${stock.code} - ${stock.name}`,
            );
          } else {
            errorCount++;
            this.logger.warn(
              `同步股票快照失败: ${stock.code} - ${stock.name} (返回false)`,
            );
          }
        } catch (error) {
          errorCount++;
          this.logger.error(
            `同步股票快照异常: ${stock.code} - ${stock.name}`,
            error instanceof Error ? error.stack : String(error),
          );
        }
      }

      this.logger.log(
        `股票快照同步任务完成 - 成功: ${successCount}, 失败: ${errorCount}`,
      );
    } catch (error) {
      this.logger.error('股票快照同步任务执行失败:', error);
    }
  }
}
