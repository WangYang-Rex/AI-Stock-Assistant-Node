import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan, FindManyOptions } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { Trend } from '../../../entities/trend.entity';
import { eastmoney } from 'eastmoney-data-sdk';
import {
  formatToMysqlDateTime,
  formatToTrendDateTime,
} from '../../../common/utils/date.utils';

export interface CreateTrendDto {
  code: string;
  name: string;
  datetime: string;
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
      // 存储为字符串后，可以直接进行字符串范围比较（YYYY-MM-DD HH:mm 格式天然支持）
      where.datetime = Between(startDatetime, endDatetime);
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
    await this.trendRepository.delete({
      code,
      datetime: Between(startDatetime, endDatetime),
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

      // 3. 转换为 Trend 实体对象
      const trends = trendData.map((trend) => ({
        code: stockCode,
        name: name,
        datetime: formatToTrendDateTime(new Date(trend.datetime)),
        price: trend.price,
        avgPrice: trend.avgPrice,
        volume: trend.volume,
        amount: trend.amount,
        pct: trend.pct,
      }));

      if (trends.length === 0) {
        return { synced: 0, total: 0, newAdded: 0 };
      }

      // 4. 🎯 高性能批量同步 (UPSERT)
      // 使用 MySQL 原生 INSERT ... ON DUPLICATE KEY UPDATE
      const chunkSize = 500;
      for (let i = 0; i < trends.length; i += chunkSize) {
        const chunk = trends.slice(i, i + chunkSize);

        const values = chunk
          .map(
            (t) =>
              `('${t.code}', '${t.name}', '${t.datetime}', ${t.price ?? 'NULL'}, ${t.avgPrice ?? 'NULL'}, ${t.volume ?? 'NULL'}, ${t.amount ?? 'NULL'}, ${t.pct ?? 'NULL'})`,
          )
          .join(',');

        const sql = `
          INSERT INTO trends (code, name, datetime, price, avgPrice, volume, amount, pct)
          VALUES ${values}
          ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            price = VALUES(price),
            avgPrice = VALUES(avgPrice),
            volume = VALUES(volume),
            amount = VALUES(amount),
            pct = VALUES(pct),
            updatedAt = CURRENT_TIMESTAMP
        `;

        await this.trendRepository.query(sql);
      }

      this.logger.log(`✅ 成功同步 ${trends.length} 条分时数据`);

      return {
        synced: trends.length,
        total: trends.length,
        newAdded: trends.length,
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

      // 计算15天前的时间字符串
      const fifteenDaysAgo = new Date();
      fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
      const fifteenDaysAgoStr = formatToTrendDateTime(fifteenDaysAgo);

      this.logger.log(`📅 清理时间节点: ${fifteenDaysAgoStr} (15天前)`);

      // 删除15天以前的数据
      const result = await this.trendRepository.delete({
        datetime: LessThan(fifteenDaysAgoStr),
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
