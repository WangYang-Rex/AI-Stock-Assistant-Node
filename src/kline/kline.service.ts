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
  ) { }

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
      await this.batchSaveKlines(klines);
    }

    return klines;
  }

  /**
   * 同步K线数据到数据库（如果存在则更新，不存在则新增）
   * @param options - 获取选项
   * @returns 同步结果
   */
  async syncKlineData(
    options: FetchKlineOptions,
  ): Promise<{ synced: number; total: number }> {
    const klines = await this.fetchKlineFromApi({
      ...options,
      saveToDb: false, // 不使用简单保存，使用upsert
    });

    let synced = 0;
    for (const kline of klines) {
      try {
        // 使用upsert逻辑：根据code+date+period判断是否存在
        const existing = await this.klineRepository.findOne({
          where: {
            code: kline.code,
            date: kline.date,
            period: kline.period,
          },
        });

        if (existing) {
          // 更新现有记录
          await this.klineRepository.update(existing.id, {
            open: kline.open,
            close: kline.close,
            high: kline.high,
            low: kline.low,
            volume: kline.volume,
            amount: kline.amount,
            amplitude: kline.amplitude,
            pct: kline.pct,
            change: kline.change,
            turnover: kline.turnover,
            name: kline.name,
            fqType: kline.fqType,
          });
        } else {
          // 创建新记录
          await this.klineRepository.save(kline);
        }
        synced++;
      } catch (error) {
        console.error(`同步K线数据失败 [${kline.code} ${kline.date}]:`, error);
      }
    }

    return { synced, total: klines.length };
  }

  // ==================== 数据库 CRUD 操作 ====================

  /**
   * 创建单条K线记录
   * @param klineData - K线数据
   */
  async create(klineData: Partial<Kline>): Promise<Kline> {
    const kline = this.klineRepository.create(klineData);
    return await this.klineRepository.save(kline);
  }

  /**
   * 批量保存K线数据
   * @param klines - K线数据数组
   */
  async batchSaveKlines(klines: Kline[]): Promise<Kline[]> {
    return await this.klineRepository.save(klines);
  }

  /**
   * 根据ID查找K线记录
   * @param id - 记录ID
   */
  async findById(id: number): Promise<Kline | null> {
    return await this.klineRepository.findOne({ where: { id } });
  }

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

  /**
   * 获取指定股票的所有K线数据
   * @param code - 股票代码
   * @param period - K线周期
   */
  async findByCode(code: string, period?: number): Promise<Kline[]> {
    const where: { code: string; period?: number } = { code };
    if (period !== undefined) {
      where.period = period;
    }
    return await this.klineRepository.find({
      where,
      order: { date: 'DESC' },
    });
  }

  /**
   * 获取指定日期范围的K线数据
   * @param code - 股票代码
   * @param startDate - 开始日期
   * @param endDate - 结束日期
   * @param period - K线周期
   */
  async findByDateRange(
    code: string,
    startDate: string,
    endDate: string,
    period: number = 101,
  ): Promise<Kline[]> {
    return await this.klineRepository.find({
      where: {
        code,
        period,
        date: Between(startDate, endDate),
      },
      order: { date: 'ASC' },
    });
  }

  /**
   * 获取最新的K线数据
   * @param code - 股票代码
   * @param period - K线周期
   * @param count - 获取数量
   */
  async findLatest(
    code: string,
    period: number = 101,
    count: number = 1,
  ): Promise<Kline[]> {
    return await this.klineRepository.find({
      where: { code, period },
      order: { date: 'DESC' },
      take: count,
    });
  }

  /**
   * 更新K线记录
   * @param id - 记录ID
   * @param updateData - 更新数据
   */
  async update(id: number, updateData: Partial<Kline>): Promise<Kline | null> {
    await this.klineRepository.update(id, updateData);
    return await this.findById(id);
  }

  /**
   * 删除K线记录
   * @param id - 记录ID
   */
  async delete(id: number): Promise<boolean> {
    const result = await this.klineRepository.delete(id);
    return result.affected ? result.affected > 0 : false;
  }

  /**
   * 批量删除K线记录
   * @param ids - 记录ID数组
   */
  async batchDelete(ids: number[]): Promise<number> {
    const result = await this.klineRepository.delete(ids);
    return result.affected || 0;
  }

  /**
   * 删除指定股票的所有K线数据
   * @param code - 股票代码
   * @param period - K线周期（可选）
   */
  async deleteByCode(code: string, period?: number): Promise<number> {
    const queryBuilder = this.klineRepository
      .createQueryBuilder()
      .delete()
      .where('code = :code', { code });

    if (period !== undefined) {
      queryBuilder.andWhere('period = :period', { period });
    }

    const result = await queryBuilder.execute();
    return result.affected || 0;
  }

  /**
   * 删除指定日期范围的K线数据
   * @param code - 股票代码
   * @param startDate - 开始日期
   * @param endDate - 结束日期
   * @param period - K线周期
   */
  async deleteByDateRange(
    code: string,
    startDate: string,
    endDate: string,
    period: number = 101,
  ): Promise<number> {
    const result = await this.klineRepository
      .createQueryBuilder()
      .delete()
      .where('code = :code', { code })
      .andWhere('period = :period', { period })
      .andWhere('date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .execute();

    return result.affected || 0;
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

  /**
   * 获取所有已存储的股票代码列表
   */
  async getStoredStockCodes(): Promise<string[]> {
    const result = await this.klineRepository
      .createQueryBuilder('kline')
      .select('DISTINCT kline.code', 'code')
      .getRawMany();

    return result.map((item) => item.code);
  }

  /**
   * 获取指定股票的K线数据数量
   * @param code - 股票代码
   * @param period - K线周期
   */
  async getKlineCountByCode(code: string, period?: number): Promise<number> {
    const where: { code: string; period?: number } = { code };
    if (period !== undefined) {
      where.period = period;
    }
    return await this.klineRepository.count({ where });
  }
}
