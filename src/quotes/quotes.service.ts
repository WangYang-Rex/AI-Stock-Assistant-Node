import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindManyOptions } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { Quote } from '../entities/quote.entity';
import { eastmoney } from 'eastmoney-data-sdk';
import { StockService } from '../stock/stock.service';

export interface CreateQuoteDto {
  code: string;
  name: string;
  price?: number;
  high?: number;
  low?: number;
  open?: number;
  preClose?: number;
  volume?: number;
  amount?: number;
  pct?: number;
  change?: number;
  turnover?: number;
  totalMarketCap?: number;
  floatMarketCap?: number;
  pe?: number;
  pb?: number;
  updateTime?: number;
}

export interface UpdateQuoteDto {
  price?: number;
  high?: number;
  low?: number;
  open?: number;
  preClose?: number;
  volume?: number;
  amount?: number;
  pct?: number;
  change?: number;
  turnover?: number;
  totalMarketCap?: number;
  floatMarketCap?: number;
  pe?: number;
  pb?: number;
  updateTime?: number;
}

export interface QuoteQueryDto {
  code?: string;
  startTime?: number;
  endTime?: number;
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

  /**
   * 同步股票实时行情快照：通过东方财富API获取实时行情数据并保存到数据库
   * @param stock 股票信息（包含代码和市场代码）
   * @returns Promise<boolean> 同步是否成功
   */
  async syncStockQuotesFromAPI(stock: {
    code: string;
    market: number;
  }): Promise<boolean> {
    try {
      // 1. 构建 secid 并调用 SDK 获取实时行情数据
      const secid = `${stock.market}.${stock.code}`;
      this.logger.log(`📊 开始获取股票 ${stock.code} 的实时行情数据...`);

      // 使用 quote 方法获取完整的实时行情数据（包含价格、成交量、市值、估值等所有字段）
      const quoteData = await eastmoney.quote(secid);

      // 2. 验证返回数据
      if (!quoteData) {
        this.logger.warn(`⚠️  股票 ${stock.code} 未获取到实时行情数据`);
        return false;
      }

      const { code, name, updateTime } = quoteData;
      this.logger.log(
        `✅ 获取实时行情成功: ${name}(${code}), 价格: ${quoteData.price}, 涨跌幅: ${quoteData.pct}%`,
      );

      // 3. 转换实时行情数据为 Quote 实体格式
      const quote: CreateQuoteDto = {
        code: code,
        name: name,
        price: quoteData.price,
        high: quoteData.high,
        low: quoteData.low,
        open: quoteData.open,
        preClose: quoteData.preClose,
        volume: quoteData.volume,
        amount: quoteData.amount,
        pct: quoteData.pct,
        change: quoteData.change,
        turnover: quoteData.turnover,
        totalMarketCap: quoteData.totalMarketCap,
        floatMarketCap: quoteData.floatMarketCap,
        pe: quoteData.pe,
        pb: quoteData.pb,
        updateTime: updateTime,
      };

      // 4. 查找该股票是否已有行情记录（每个股票只保留一条最新记录）
      const existingQuote = await this.quoteRepository.findOne({
        where: {
          code: stock.code,
        },
      });

      // 5. 如果已存在，更新记录；否则创建新记录（upsert 策略）
      if (existingQuote) {
        this.logger.log(
          `📝 更新股票 ${stock.code} 的行情快照 (ID: ${existingQuote.id})...`,
        );

        // 更新现有记录
        await this.quoteRepository.update(existingQuote.id, quote);
        this.logger.log(`✅ 行情快照更新成功`);
      } else {
        // 创建新记录
        this.logger.log(`💾 创建股票 ${stock.code} 的首条行情快照...`);
        await this.createQuote(quote);
        this.logger.log(`✅ 行情快照创建成功`);
      }

      // 6. 更新股票表的实时行情信息
      this.logger.log(`🔄 更新股票实时行情信息...`);
      await this.stockService.updateStockByCode(stock.code, {
        price: quote.price, // 最新价
        pct: quote.pct, // 涨跌幅
        change: quote.change, // 涨跌额
        volume: quote.volume, // 成交量
        amount: quote.amount, // 成交额
        turnover: quote.turnover, // 换手率
        totalMarketCap: quote.totalMarketCap, // 总市值
        floatMarketCap: quote.floatMarketCap, // 流通市值
      });
      this.logger.log(
        `✅ 股票信息更新成功: ${name}(${code}), 价格: ${quote.price}, 涨跌幅: ${quote.pct}%, 成交额: ${(quote.amount / 100000000).toFixed(2)}亿`,
      );

      return true;
    } catch (error) {
      this.logger.error(
        `❌ 同步股票 ${stock.code} 实时行情快照失败:`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new Error(
        `同步实时行情快照失败: ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  /**
   * 获取所有行情快照
   */
  async findAll(
    queryDto: QuoteQueryDto = {},
  ): Promise<{ quotes: Quote[]; total: number }> {
    const { code, startTime, endTime, page = 1, limit = 10 } = queryDto;

    const where: Record<string, any> = {};

    if (code) {
      where.code = code;
    }

    if (startTime && endTime) {
      where.updateTime = Between(startTime, endTime);
    } else if (startTime) {
      where.updateTime = Between(startTime, Math.floor(Date.now() / 1000));
    }

    const options: FindManyOptions<Quote> = {
      where,
      order: { updateTime: 'DESC' },
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
      order: { updateTime: 'DESC' },
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
   * 获取涨跌幅排行榜
   */
  async getTopGainers(limit: number = 10): Promise<Quote[]> {
    return await this.quoteRepository.find({
      order: { pct: 'DESC' },
      take: limit,
    });
  }

  /**
   * 获取跌幅排行榜
   */
  async getTopLosers(limit: number = 10): Promise<Quote[]> {
    return await this.quoteRepository.find({
      order: { pct: 'ASC' },
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
   * 同步所有股票的快照数据
   */
  async syncAllStockQuotes(): Promise<void> {
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
            market: stock.market,
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
  @Cron('0 0 15 * * 1-5', {
    name: 'weekday-afternoon-quotes-sync',
    timeZone: 'Asia/Shanghai',
  })
  async handleWeekdayAfternoonQuotesSync() {
    this.logger.log('开始执行工作日下午15点股票快照同步任务...');
    await this.syncAllStockQuotes();
  }
}
