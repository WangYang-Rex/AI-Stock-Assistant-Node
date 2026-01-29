import { Controller, Post, Body } from '@nestjs/common';
import { KlineService, KlinePeriodType, FqTypeValue } from './kline.service';
import { Kline } from '../../../entities/kline.entity';
import { ResponseService } from '../../../common/services/response.service';
import { ApiResponse } from '../../../common/dto/response.dto';

@Controller('klines')
export class KlineController {
  constructor(
    private readonly klineService: KlineService,
    private readonly responseService: ResponseService,
  ) {}

  // ==================== 数据获取接口 ====================

  /**
   * 同步K线数据到数据库
   * @description 从API获取数据并同步到数据库（存在则更新，不存在则新增）
   */
  @Post('sync')
  async syncKlines(
    @Body()
    body: {
      code: string;
      period?: KlinePeriodType;
      fqType?: FqTypeValue;
      limit?: number;
      startDate?: string;
      endDate?: string;
    },
  ): Promise<ApiResponse<{ synced: number; total: number }>> {
    return this.responseService.handleAsync(
      () =>
        this.klineService.syncKlineData({
          code: body.code,
          period: body.period,
          fqType: body.fqType,
          limit: body.limit,
          startDate: body.startDate,
          endDate: body.endDate,
        }),
      'K线数据同步成功',
      'K线数据同步失败',
    );
  }

  // ==================== 数据库 CRUD 接口 ====================

  /**
   * 查询K线数据列表
   */
  @Post('list')
  async listKlines(
    @Body()
    body: {
      code: string;
      period?: number;
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
      orderBy?: 'ASC' | 'DESC';
    },
  ): Promise<
    ApiResponse<{
      data: Kline[];
      total: number;
      page: number;
      limit: number;
    }>
  > {
    return this.responseService.handleAsync(
      () => this.klineService.findKlines(body),
      'K线数据查询成功',
      'K线数据查询失败',
    );
  }

  // ==================== 统计接口 ====================

  /**
   * 获取K线统计信息
   */
  @Post('stats')
  async getKlineStats(
    @Body() body: { code: string; period?: number },
  ): Promise<ApiResponse<any>> {
    return this.responseService.handleAsync(
      () => this.klineService.getKlineStats(body.code, body.period),
      'K线统计信息获取成功',
      'K线统计信息获取失败',
    );
  }
}
