import { Controller, Post, Body, ParseIntPipe } from '@nestjs/common';
import { TrendsService } from './trends.service';
import type {
  CreateTrendDto,
  UpdateTrendDto,
  TrendQueryDto,
} from './trends.service';

@Controller('trends')
export class TrendsController {
  constructor(private readonly trendsService: TrendsService) {}

  /**
   * 创建分时数据
   */
  @Post('add')
  async createTrend(@Body() createTrendDto: CreateTrendDto) {
    return await this.trendsService.createTrend(createTrendDto);
  }

  /**
   * 批量创建分时数据
   */
  @Post('batchAdd')
  async createBatchTrends(@Body() createTrendDtos: CreateTrendDto[]) {
    return await this.trendsService.createTrends(createTrendDtos);
  }

  /**
   * 获取分时数据列表
   */
  @Post('list')
  async findAllTrends(@Body() queryDto: TrendQueryDto) {
    return await this.trendsService.findAllTrends(queryDto);
  }

  /**
   * 根据ID获取分时数据
   */
  @Post('one')
  async findOneTrend(@Body('id', ParseIntPipe) id: number) {
    return await this.trendsService.findOneTrend(id);
  }

  /**
   * 更新分时数据
   */
  @Post('update')
  async updateTrend(
    @Body('id', ParseIntPipe) id: number,
    @Body() updateTrendDto: UpdateTrendDto,
  ) {
    return await this.trendsService.updateTrend(id, updateTrendDto);
  }

  /**
   * 删除分时数据
   */
  @Post('delete')
  async removeTrend(@Body('id', ParseIntPipe) id: number) {
    await this.trendsService.removeTrend(id);
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
}
