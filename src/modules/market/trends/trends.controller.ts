import { Controller, Post, Body } from '@nestjs/common';
import { TrendsService } from './trends.service';
import { formatToTrendDateTime } from '../../../common/utils/date.utils';

@Controller('trends')
export class TrendsController {
  constructor(private readonly trendsService: TrendsService) {}

  /**
   * 从东方财富 SDK 同步分时数据到数据库（增量更新）
   * @description 支持同步当日分时（ndays=1）或5日分时（ndays=5）数据到数据库
   * @param code 股票代码（如：600519）
   * @param market 市场代码（1-上交所，0-深交所）
   * @param ndays 获取天数（1-当日分时，5-5日分时，默认为1）
   * @returns 同步统计信息 { synced, total, newAdded }
   */
  @Post('sync-from-api')
  async syncTrendFromAPI(
    @Body('code') code: string,
    @Body('market') market: number,
    @Body('ndays') ndays?: number,
  ) {
    // 参数验证：ndays 只能是 1 或 5
    const validNdays = ndays === 5 ? 5 : 1;
    return await this.trendsService.syncTrendFromAPI(code, market, validNdays);
  }

  /**
   * 同步所有股票的当日分时数据
   * @returns 同步统计信息 { success, fail, totalSynced }
   */
  @Post('sync-all-stocks')
  async syncAllStocksIntradayTrends() {
    return await this.trendsService.syncAllStocksIntradayTrends();
  }

  /**
   * 获取分时数据列表
   * @param code 股票代码（可选）
   * @param ndays 获取最近 N 天的数据（可选，1 或 5）
   * @param startDatetime 开始时间（可选，优先级低于 ndays）
   * @param endDatetime 结束时间（可选，优先级低于 ndays）
   * @param page 页码（默认 1）
   * @param limit 每页数量（默认 10）
   */
  @Post('list')
  async findAllTrends(
    @Body('code') code?: string,
    @Body('ndays') ndays?: number,
    @Body('startDatetime') startDatetime?: string,
    @Body('endDatetime') endDatetime?: string,
    @Body('page') page?: number,
    @Body('limit') limit?: number,
  ) {
    // 如果提供了 ndays 参数，自动计算时间范围
    if (ndays) {
      const now = new Date();
      const start = new Date();
      // 设置为 ndays 天前的 23:59:59
      // 比如 ndays=1，就是昨天 23:59:59，从而包含今天的全部数据
      start.setDate(now.getDate() - ndays);
      start.setHours(23, 59, 59, 999);

      startDatetime = formatToTrendDateTime(start);
      endDatetime = formatToTrendDateTime(now);
    }

    return await this.trendsService.findAllTrends({
      code,
      startDatetime,
      endDatetime,
      page,
      limit,
    });
  }

  /**
   * 根据代码和日期范围批量删除分时数据
   */
  @Post('delete-range')
  async removeTrendsByRange(
    @Body('code') code: string,
    @Body('startDatetime') startDatetime: string,
    @Body('endDatetime') endDatetime: string,
  ) {
    await this.trendsService.removeTrendsByRange(
      code,
      startDatetime,
      endDatetime,
    );
  }
}
