import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Kline } from '../entities/kline.entity';
import {
  eastmoney,
  getKLine,
  getDailyKLine,
  getWeeklyKLine,
  getMonthlyKLine,
  getMinuteKLine,
  KLine as SdkKLine,
  KLINE_PERIOD,
  FQ_TYPE,
} from 'eastmoney-data-sdk';

/**
 * K线周期类型
 */
export type KlinePeriodType =
  | 'daily'
  | 'weekly'
  | 'monthly'
  | '1min'
  | '5min'
  | '15min'
  | '30min'
  | '60min';

/**
 * 复权类型
 */
export type FqTypeValue = 0 | 1 | 2;

/**
 * 获取K线数据的选项
 */
export interface FetchKlineOptions {
  /** 股票代码 */
  code: string;
  /** K线周期 */
  period?: KlinePeriodType;
  /** 复权类型 */
  fqType?: FqTypeValue;
  /** 数据条数限制 */
  limit?: number;
  /** 开始日期（YYYYMMDD格式） */
  startDate?: string;
  /** 结束日期（YYYYMMDD格式） */
  endDate?: string;
  /** 是否保存到数据库 */
  saveToDb?: boolean;
}

/**
 * 查询K线数据的选项
 */
export interface QueryKlineOptions {
  /** 股票代码 */
  code: string;
  /** K线周期 */
  period?: number;
  /** 开始日期 */
  startDate?: string;
  /** 结束日期 */
  endDate?: string;
  /** 分页 - 页码 */
  page?: number;
  /** 分页 - 每页数量 */
  limit?: number;
  /** 排序方式 */
  orderBy?: 'ASC' | 'DESC';
}

@Injectable()
export class KlineService {
  constructor(
    @InjectRepository(Kline)
    private klineRepository: Repository<Kline>,
  ) {}

  /**
   * 将K线周期字符串转换为数值
   */
  private periodToNumber(period: KlinePeriodType): number {
    const periodMap: Record<KlinePeriodType, number> = {
      daily: 101,
      weekly: 102,
      monthly: 103,
      '1min': 1,
      '5min': 5,
      '15min': 15,
      '30min': 30,
      '60min': 60,
    };
    return periodMap[period] || 101;
  }

  /**
   * 根据股票代码构建 secid
   * @param code - 股票代码
   */
  private buildSecid(code: string): string {
    return eastmoney.utils.buildSecid(code);
  }

  /**
   * 从东方财富API获取K线数据
   * @param options - 获取选项
   * @returns K线数据数组
   */
  async fetchKlineFromApi(options: FetchKlineOptions): Promise<Kline[]> {
    const {
      code,
      period = 'daily',
      fqType = 1,
      limit = 1000,
      startDate,
      endDate,
      saveToDb = false,
    } = options;

    const secid = this.buildSecid(code);
    const periodNum = this.periodToNumber(period);

    let sdkKlines: SdkKLine[] = [];

    try {
      // 根据周期类型调用不同的API
      switch (period) {
        case 'daily':
          sdkKlines = await getDailyKLine(secid, limit, fqType);
          break;
        case 'weekly':
          sdkKlines = await getWeeklyKLine(secid, limit, fqType);
          break;
        case 'monthly':
          sdkKlines = await getMonthlyKLine(secid, limit, fqType);
          break;
        case '1min':
        case '5min':
        case '15min':
        case '30min':
        case '60min':
          const minutePeriod = parseInt(period.replace('min', '')) as
            | 1
            | 5
            | 15
            | 30
            | 60;
          sdkKlines = await getMinuteKLine(secid, minutePeriod, limit);
          break;
        default:
          // 使用通用API
          sdkKlines = await getKLine({
            secid,
            klt: periodNum as typeof KLINE_PERIOD.DAILY,
            fqt: fqType as typeof FQ_TYPE.QFQ,
            limit,
            startDate,
            endDate,
          });
      }
    } catch (error) {
      console.error(`获取K线数据失败 [${code}]:`, error);
      throw new Error(`获取K线数据失败: ${error.message}`);
    }

    // 获取股票名称
    let stockName = '';
    try {
      const quote = await eastmoney.quote(secid);
      stockName = quote?.name || '';
    } catch {
      // 忽略获取名称失败的错误
    }

    // 转换为Kline实体
    const klines: Kline[] = sdkKlines.map((item) => {
      const kline = new Kline();
      kline.code = code;
      kline.name = stockName;
      kline.period = periodNum;
      kline.date = item.date;
      kline.open = item.open;
      kline.close = item.close;
      kline.high = item.high;
      kline.low = item.low;
      kline.volume = item.volume;
      kline.amount = item.amount;
      kline.amplitude = item.amplitude;
      kline.pct = item.pct;
      kline.change = item.change;
      kline.turnover = item.turnover;
      kline.fqType = fqType;
      return kline;
    });

    // 如果需要保存到数据库
    if (saveToDb && klines.length > 0) {
      await this.klineRepository.save(klines);
    }

    return klines;
  }

  /**
   * 同步K线数据到数据库（高性能批量 UPSERT）
   * @param options - 获取选项
   * @returns 同步结果
   */
  async syncKlineData(
    options: FetchKlineOptions,
  ): Promise<{ synced: number; total: number }> {
    const klines = await this.fetchKlineFromApi({
      ...options,
      saveToDb: false, // 手动控制保存逻辑
    });

    if (klines.length === 0) {
      return { synced: 0, total: 0 };
    }

    try {
      // 🎯 分批处理（Chunking）: 防止大数据量时生成的 SQL 语句过长
      const chunkSize = 500;
      for (let i = 0; i < klines.length; i += chunkSize) {
        const chunk = klines.slice(i, i + chunkSize);
        
        // 🚀 使用 TypeORM 的 upsert 方法进行高性能同步
        // 根据 ['code', 'date', 'period'] 唯一索引冲突时自动更新其他字段
        await this.klineRepository.upsert(chunk, ['code', 'date', 'period']);
      }

      return { synced: klines.length, total: klines.length };
    } catch (error) {
      console.error(`❌ 批量同步K线数据失败:`, error);
      throw new Error(`批量同步K线数据失败: ${error.message}`);
    }
  }

  // ==================== 数据库查询操作 ====================
  /**
   * 查询K线数据列表
   * @param options - 查询选项
   */
  async findKlines(options: QueryKlineOptions): Promise<{
    data: Kline[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      code,
      period = 101,
      startDate,
      endDate,
      page = 1,
      limit = 100,
      orderBy = 'DESC',
    } = options;

    const queryBuilder = this.klineRepository
      .createQueryBuilder('kline')
      .where('kline.code = :code', { code })
      .andWhere('kline.period = :period', { period });

    // 日期范围筛选
    if (startDate && endDate) {
      queryBuilder.andWhere('kline.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    } else if (startDate) {
      queryBuilder.andWhere('kline.date >= :startDate', { startDate });
    } else if (endDate) {
      queryBuilder.andWhere('kline.date <= :endDate', { endDate });
    }

    // 排序和分页
    queryBuilder
      .orderBy('kline.date', orderBy)
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total, page, limit };
  }

  // ==================== 统计和分析方法 ====================

  /**
   * 获取K线统计信息
   * @param code - 股票代码
   * @param period - K线周期
   */
  async getKlineStats(code: string, period: number = 101) {
    const stats = await this.klineRepository
      .createQueryBuilder('kline')
      .select('COUNT(*)', 'count')
      .addSelect('MIN(kline.date)', 'minDate')
      .addSelect('MAX(kline.date)', 'maxDate')
      .addSelect('AVG(kline.close)', 'avgClose')
      .addSelect('MAX(kline.high)', 'maxHigh')
      .addSelect('MIN(kline.low)', 'minLow')
      .addSelect('AVG(kline.volume)', 'avgVolume')
      .addSelect('SUM(kline.amount)', 'totalAmount')
      .where('kline.code = :code', { code })
      .andWhere('kline.period = :period', { period })
      .getRawOne();

    return stats;
  }
}
