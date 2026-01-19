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
    await this.trendsService.removeTrendsByRange(code, startDatetime, endDatetime);
  }
}
