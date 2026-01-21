import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan, FindManyOptions } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { Trend } from '../entities/trend.entity';
import { eastmoney } from 'eastmoney-data-sdk';

export interface CreateTrendDto {
  code: string;
  name: string;
  datetime: Date;
  price?: number;
  avgPrice?: number;
  volume?: number;
  amount?: number;
  pct?: number;
}

export interface TrendQueryDto {
  code?: string;
  startDatetime?: string;
  endDatetime?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class TrendsService {
  private readonly logger = new Logger(TrendsService.name);

  constructor(
    @InjectRepository(Trend)
    private readonly trendRepository: Repository<Trend>,
  ) {}

  /**
   * 批量创建趋势数据
   */
  async createTrends(createTrendDtos: CreateTrendDto[]): Promise<Trend[]> {
    const trends = this.trendRepository.create(createTrendDtos);
    return await this.trendRepository.save(trends);
  }

  /**
   * 获取所有趋势数据
   */
  async findAllTrends(
    queryDto: TrendQueryDto = {},
  ): Promise<{ trends: Trend[]; total: number }> {
    const { code, startDatetime, endDatetime, page = 1, limit = 10 } = queryDto;

    const where: Record<string, any> = {};

    if (code) {
      where.code = code;
    }

    if (startDatetime && endDatetime) {
      // 将字符串时间转换为 Date 对象
      where.datetime = Between(new Date(startDatetime), new Date(endDatetime));
    }

    const options: FindManyOptions<Trend> = {
      where,
      order: { datetime: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    };

    const [trends, total] = await this.trendRepository.findAndCount(options);

    return { trends, total };
  }

  /**
   * 根据代码和日期范围删除趋势数据
   */
  async removeTrendsByRange(
    code: string,
    startDatetime: string,
    endDatetime: string,
  ): Promise<void> {
    // 将字符串时间转换为 Date 对象
    const startDate = new Date(startDatetime);
    const endDate = new Date(endDatetime);

    await this.trendRepository.delete({
      code,
      datetime: Between(startDate, endDate),
    });
  }

  /**
   * 从东方财富 SDK 同步分时数据到数据库（增量更新）
   * @param code 股票代码
   * @param market 市场代码（1-上交所、0-深交所）
   * @param ndays 获取天数（1-当日分时，5-5日分时）
   * @returns Promise<{ synced: number; total: number }> 同步统计信息
   */
  async syncTrendFromAPI(
    code: string,
    market: number,
    ndays: number = 1,
  ): Promise<{ synced: number; total: number; newAdded: number }> {
    try {
      // 1. 构建 secid
      const secid = `${market}.${code}`;
      this.logger.log(`📊 开始获取股票 ${code} 的 ${ndays} 日分时数据...`);

      // 2. 调用 SDK 获取分时数据
      const trendResult = await eastmoney.trend({ secid, ndays });

      if (!trendResult || !trendResult.data || trendResult.data.length === 0) {
        this.logger.warn(`⚠️  股票 ${code} 未获取到分时数据`);
        return { synced: 0, total: 0, newAdded: 0 };
      }

      const { code: stockCode, name, data: trendData } = trendResult;

      // 2. 转换为 Trend 实体格式（将字符串时间转换为 Date 对象）
      const trends: CreateTrendDto[] = trendData.map((trend) => ({
        code: stockCode,
        name: name,
        datetime: new Date(trend.datetime), // 转换字符串为 Date
        price: trend.price,
        avgPrice: trend.avgPrice,
        volume: trend.volume,
        amount: trend.amount,
        pct: trend.pct,
      }));

      if (trends.length === 0) {
        this.logger.warn(`⚠️  股票 ${code} 转换后无有效数据`);
        return { synced: 0, total: 0, newAdded: 0 };
      }

      // 3. 查询已存在的数据（用于增量更新）
      const datetimes = trends.map((t) => t.datetime);
      const startDatetime = datetimes[0];
      const endDatetime = datetimes[datetimes.length - 1];

      const existingTrends = await this.trendRepository.find({
        where: {
          code: stockCode,
          datetime: Between(startDatetime, endDatetime),
        },
      });

      // 4. 构建已存在数据的时间集合（快速查找，使用时间戳比较）
      const existingTimestamps = new Set(
        existingTrends.map((t) => t.datetime.getTime()),
      );

      // 5. 过滤出需要新增的数据（增量更新策略）
      const newTrends = trends.filter(
        (trend) => !existingTimestamps.has(trend.datetime.getTime()),
      );

      this.logger.log(
        `📊 数据统计: API返回 ${trends.length} 条, 已存在 ${existingTrends.length} 条, 新增 ${newTrends.length} 条`,
      );

      // 6. 批量插入新增的分时数据
      if (newTrends.length > 0) {
        this.logger.log(`💾 开始插入 ${newTrends.length} 条新分时数据...`);
        await this.createTrends(newTrends);
        this.logger.log(`✅ 分时数据插入成功`);
      } else {
        this.logger.log(`ℹ️  无新增数据，跳过插入操作`);
      }

      return {
        synced: trends.length,
        total: existingTrends.length + newTrends.length,
        newAdded: newTrends.length,
      };
    } catch (error) {
      this.logger.error(
        `❌ 同步股票 ${code} 分时数据失败:`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new Error(
        `同步分时数据失败: ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  /**
   * 定时清理15天以前的分时数据
   * 每天凌晨0点执行
   */
  @Cron('0 0 0 * * *', {
    name: 'daily-cleanup-old-trends',
    timeZone: 'Asia/Shanghai',
  })
  async handleDailyCleanupOldTrends() {
    try {
      this.logger.log('🧹 开始执行分时数据清理任务...');

      // 计算15天前的时间
      const fifteenDaysAgo = new Date();
      fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

      this.logger.log(
        `📅 清理时间节点: ${fifteenDaysAgo.toISOString()} (15天前)`,
      );

      // 删除15天以前的数据
      const result = await this.trendRepository.delete({
        datetime: LessThan(fifteenDaysAgo),
      });

      this.logger.log(
        `✅ 分时数据清理完成 - 删除了 ${result.affected || 0} 条记录`,
      );
    } catch (error) {
      this.logger.error(
        '❌ 分时数据清理任务执行失败:',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
