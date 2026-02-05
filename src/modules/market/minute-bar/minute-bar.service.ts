import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindManyOptions } from 'typeorm';
import { StockMinuteBar } from '../../../entities/stock-minute-bar.entity';
import { MinuteBar } from './interfaces';
import { eastmoney } from 'eastmoney-data-sdk';
import { EtfConstituentsService } from '../stock/etf-constituents.service';
import { StockService } from '../stock/stock.service';

export class MinuteBarQueryDto {
  code?: string;
  startDatetime?: string;
  endDatetime?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class MinuteBarService {
  private readonly logger = new Logger(MinuteBarService.name);

  constructor(
    @InjectRepository(StockMinuteBar)
    private readonly repo: Repository<StockMinuteBar>,
    private readonly etfConstituentsService: EtfConstituentsService,
    private readonly stockService: StockService,
  ) {}

  /**
   * 从 API 同步单只股票的分钟行情 (K线)
   * @param code 股票代码
   * @param market 市场代码 (1-SH, 0-SZ)
   */
  async syncMinuteBarsFromAPI(code: string, market: number) {
    try {
      const secid = `${market}.${code}`;
      this.logger.log(`📊 开始从 API 获取 ${code} 的当日分钟 K 线...`);

      // 1. 获取 1 分钟 K 线，获取最近 300 条 (覆盖一整天 240 分钟左右)
      const sdkKlines = await eastmoney.minuteKline(secid, 1, 300);

      if (!sdkKlines || sdkKlines.length === 0) {
        this.logger.warn(`⚠️  未获取到 ${code} 的分钟 K 线数据`);
        return { synced: 0 };
      }

      // 2. 转换为本地 MinuteBar 格式
      const bars: MinuteBar[] = sdkKlines.map((item) => ({
        datetime: item.date, // SDK 返回的 date 是 "YYYY-MM-DD HH:mm"
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        volume: item.volume,
      }));

      await this.syncMinuteBars(code, bars);
      return { synced: bars.length };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`❌ 从 API 同步 ${code} 分钟 K 线失败: ${msg}`);
      throw error;
    }
  }

  /**
   * 批量同步所有股票的分钟行情
   */
  async syncAllStocksMinuteBars() {
    this.logger.log('🚀 开始批量同步所有股票的分钟行情...');
    try {
      const stocks = await this.stockService.findAll();

      if (stocks.length === 0) {
        this.logger.warn('⚠️ 未找到股票数据，跳过同步');
        return { success: 0, fail: 0 };
      }

      let successCount = 0;
      let failCount = 0;

      for (const stock of stocks) {
        try {
          await this.syncMinuteBarsFromAPI(stock.code, stock.market);
          successCount++;
        } catch {
          failCount++;
          this.logger.error(`❌ 同步股票 ${stock.code} 分时行情失败`);
        }
      }

      this.logger.log(
        `🏁 所有股票分钟行情同步完成: 成功 ${successCount}, 失败 ${failCount}`,
      );
      return { success: successCount, fail: failCount };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`❌ 批量同步股票分钟行情异常: ${msg}`);
      throw error;
    }
  }

  /**
   * 批量保存/更新分钟行情数据
   * 采用 MySQL 原生 INSERT ... ON DUPLICATE KEY UPDATE 模式，加入分批处理
   */
  async syncMinuteBars(stockCode: string, bars: MinuteBar[]) {
    if (!bars || bars.length === 0) return;

    try {
      // 参考 TrendsService，采用分批同步 (Chunking) 防止 SQL 过大
      const chunkSize = 500;
      for (let i = 0; i < bars.length; i += chunkSize) {
        const chunk = bars.slice(i, i + chunkSize);

        const valuesArr = chunk.map((bar) => {
          // 处理日期格式，确保兼容
          const dt = new Date(bar.datetime);
          const dtStr = dt.toISOString().slice(0, 19).replace('T', ' ');

          const open = bar.open ?? 'NULL';
          const high = bar.high ?? 'NULL';
          const low = bar.low ?? 'NULL';
          const close = bar.close ?? 'NULL';
          const volume = bar.volume ?? 'NULL';

          return `('${stockCode}', '${dtStr}', ${open}, ${high}, ${low}, ${close}, ${volume})`;
        });

        const sql = `
          INSERT INTO stock_minute_bars (stock_code, datetime, open, high, low, close, volume)
          VALUES ${valuesArr.join(',')}
          ON DUPLICATE KEY UPDATE
            open = VALUES(open),
            high = VALUES(high),
            low = VALUES(low),
            close = VALUES(close),
            volume = VALUES(volume)
        `;

        await this.repo.query(sql);
      }

      this.logger.debug(
        `✅ 成功同步 ${stockCode} 的 ${bars.length} 条分钟行情`,
      );
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`❌ 同步 ${stockCode} 行情失败: ${msg}`);
      throw error;
    }
  }

  /**
   * 清通特定日期的分钟行情（用于数据重刷）
   */
  async clearMinuteBars(stockCode: string, date: string) {
    const start = `${date} 00:00:00`;
    const end = `${date} 23:59:59`;
    this.logger.log(`🧹 清理 ${stockCode} 在 ${date} 的分钟行情数据`);
    await this.repo
      .createQueryBuilder()
      .delete()
      .where('stock_code = :code', { code: stockCode })
      .andWhere('datetime BETWEEN :start AND :end', { start, end })
      .execute();
  }

  /**
   * 获取分钟线数据 (参考 TrendsService.findAllTrends)
   */
  async findMinuteBars(
    queryDto: MinuteBarQueryDto = {},
  ): Promise<{ data: StockMinuteBar[]; total: number }> {
    const {
      code,
      startDatetime,
      endDatetime,
      page = 1,
      limit = 100,
    } = queryDto;

    const where: Record<string, any> = {};

    if (code) {
      where.stockCode = code;
    }

    if (startDatetime && endDatetime) {
      where.datetime = Between(new Date(startDatetime), new Date(endDatetime));
    }

    const options: FindManyOptions<StockMinuteBar> = {
      where,
      order: { datetime: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    };

    const [data, total] = await this.repo.findAndCount(options);

    return { data, total };
  }
}
