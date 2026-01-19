import { Controller, Post, Body } from '@nestjs/common';
import {
  KlineService,
  FetchKlineOptions,
  QueryKlineOptions,
  KlinePeriodType,
  FqTypeValue,
} from './kline.service';
import { Kline } from '../entities/kline.entity';
import { ResponseService } from '../common/services/response.service';
import { ApiResponse } from '../common/dto/response.dto';

@Controller('klines')
export class KlineController {
  constructor(
    private readonly klineService: KlineService,
    private readonly responseService: ResponseService,
  ) { }

  // ==================== 数据获取接口 ====================

  /**
   * 从东方财富API获取K线数据
   * @description 实时从API获取K线数据，可选择是否保存到数据库
   */
  @Post('fetch')
  async fetchKlines(
    @Body()
    body: {
      code: string;
      period?: KlinePeriodType;
      fqType?: FqTypeValue;
      limit?: number;
      startDate?: string;
      endDate?: string;
      saveToDb?: boolean;
    },
  ): Promise<ApiResponse<Kline[]>> {
    return this.responseService.handleAsync(
      () =>
        this.klineService.fetchKlineFromApi({
          code: body.code,
          period: body.period,
          fqType: body.fqType,
          limit: body.limit,
          startDate: body.startDate,
          endDate: body.endDate,
          saveToDb: body.saveToDb,
        }),
      'K线数据获取成功',
      'K线数据获取失败',
    );
  }

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
   * 创建K线记录
   */
  @Post('create')
  async createKline(
    @Body() body: Partial<Kline>,
  ): Promise<ApiResponse<Kline>> {
    return this.responseService.handleAsync(
      () => this.klineService.create(body),
      'K线记录创建成功',
      'K线记录创建失败',
    );
  }

  /**
   * 批量创建/保存K线记录
   */
  @Post('batch-create')
  async batchCreateKlines(
    @Body() body: { klines: Partial<Kline>[] },
  ): Promise<ApiResponse<Kline[]>> {
    return this.responseService.handleAsync(
      async () => {
        const klines = body.klines.map((data) => {
          const kline = new Kline();
          Object.assign(kline, data);
          return kline;
        });
        return await this.klineService.batchSaveKlines(klines);
      },
      'K线记录批量创建成功',
      'K线记录批量创建失败',
    );
  }

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

  /**
   * 根据ID获取K线记录
   */
  @Post('get-by-id')
  async getKlineById(
    @Body() body: { id: number },
  ): Promise<ApiResponse<Kline>> {
    return this.responseService.handleAsync(
      async () => {
        const kline = await this.klineService.findById(body.id);
        if (!kline) {
          throw new Error('K线记录未找到');
        }
        return kline;
      },
      'K线记录获取成功',
      'K线记录获取失败',
    );
  }

  /**
   * 根据股票代码获取K线数据
   */
  @Post('get-by-code')
  async getKlinesByCode(
    @Body() body: { code: string; period?: number },
  ): Promise<ApiResponse<Kline[]>> {
    return this.responseService.handleAsync(
      () => this.klineService.findByCode(body.code, body.period),
      'K线数据获取成功',
      'K线数据获取失败',
    );
  }

  /**
   * 根据日期范围获取K线数据
   */
  @Post('get-by-date-range')
  async getKlinesByDateRange(
    @Body()
    body: {
      code: string;
      startDate: string;
      endDate: string;
      period?: number;
    },
  ): Promise<ApiResponse<Kline[]>> {
    return this.responseService.handleAsync(
      () =>
        this.klineService.findByDateRange(
          body.code,
          body.startDate,
          body.endDate,
          body.period,
        ),
      'K线数据获取成功',
      'K线数据获取失败',
    );
  }

  /**
   * 获取最新K线数据
   */
  @Post('get-latest')
  async getLatestKlines(
    @Body() body: { code: string; period?: number; count?: number },
  ): Promise<ApiResponse<Kline[]>> {
    return this.responseService.handleAsync(
      () =>
        this.klineService.findLatest(body.code, body.period, body.count || 1),
      '最新K线数据获取成功',
      '最新K线数据获取失败',
    );
  }

  /**
   * 更新K线记录
   */
  @Post('update')
  async updateKline(
    @Body() body: { id: number; updateData: Partial<Kline> },
  ): Promise<ApiResponse<Kline>> {
    return this.responseService.handleAsync(
      async () => {
        const result = await this.klineService.update(body.id, body.updateData);
        if (!result) {
          throw new Error('K线记录未找到');
        }
        return result;
      },
      'K线记录更新成功',
      'K线记录更新失败',
    );
  }

  /**
   * 删除K线记录
   */
  @Post('delete')
  async deleteKline(
    @Body() body: { id: number },
  ): Promise<ApiResponse<{ success: boolean }>> {
    return this.responseService.handleAsync(
      async () => {
        const success = await this.klineService.delete(body.id);
        return { success };
      },
      'K线记录删除成功',
      'K线记录删除失败',
    );
  }

  /**
   * 批量删除K线记录
   */
  @Post('batch-delete')
  async batchDeleteKlines(
    @Body() body: { ids: number[] },
  ): Promise<ApiResponse<{ deleted: number }>> {
    return this.responseService.handleAsync(
      async () => {
        const deleted = await this.klineService.batchDelete(body.ids);
        return { deleted };
      },
      'K线记录批量删除成功',
      'K线记录批量删除失败',
    );
  }

  /**
   * 删除指定股票的K线数据
   */
  @Post('delete-by-code')
  async deleteKlinesByCode(
    @Body() body: { code: string; period?: number },
  ): Promise<ApiResponse<{ deleted: number }>> {
    return this.responseService.handleAsync(
      async () => {
        const deleted = await this.klineService.deleteByCode(
          body.code,
          body.period,
        );
        return { deleted };
      },
      'K线数据删除成功',
      'K线数据删除失败',
    );
  }

  /**
   * 删除指定日期范围的K线数据
   */
  @Post('delete-by-date-range')
  async deleteKlinesByDateRange(
    @Body()
    body: {
      code: string;
      startDate: string;
      endDate: string;
      period?: number;
    },
  ): Promise<ApiResponse<{ deleted: number }>> {
    return this.responseService.handleAsync(
      async () => {
        const deleted = await this.klineService.deleteByDateRange(
          body.code,
          body.startDate,
          body.endDate,
          body.period,
        );
        return { deleted };
      },
      'K线数据删除成功',
      'K线数据删除失败',
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

  /**
   * 获取已存储的股票代码列表
   */
  @Post('stored-codes')
  async getStoredCodes(): Promise<ApiResponse<string[]>> {
    return this.responseService.handleAsync(
      () => this.klineService.getStoredStockCodes(),
      '股票代码列表获取成功',
      '股票代码列表获取失败',
    );
  }

  /**
   * 获取指定股票的K线数据数量
   */
  @Post('count-by-code')
  async getKlineCountByCode(
    @Body() body: { code: string; period?: number },
  ): Promise<ApiResponse<{ count: number }>> {
    return this.responseService.handleAsync(
      async () => {
        const count = await this.klineService.getKlineCountByCode(
          body.code,
          body.period,
        );
        return { count };
      },
      'K线数据数量获取成功',
      'K线数据数量获取失败',
    );
  }
}
