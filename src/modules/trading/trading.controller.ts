import { Controller, Post, Body } from '@nestjs/common';
import { TradingService } from './trading.service';
import { Trading } from '../../entities/trading.entity';
import { ResponseService } from '../../common/services/response.service';
import { ApiResponse } from '../../common/dto/response.dto';

@Controller('trading')
export class TradingController {
  constructor(
    private readonly tradingService: TradingService,
    private readonly responseService: ResponseService,
  ) { }

  // 创建交易记录
  @Post('create')
  async createTrading(
    @Body() tradingData: Partial<Trading>,
  ): Promise<ApiResponse<Trading | null>> {
    return this.responseService.handleAsync(
      () => this.tradingService.createTrading(tradingData),
      '交易记录创建成功',
      '交易记录创建失败',
    );
  }

  // 批量创建交易记录
  @Post('create-batch')
  async createMultipleTrading(
    @Body() body: { tradingDataList: Partial<Trading>[] },
  ) {
    return await this.tradingService.createMultipleTrading(
      body.tradingDataList,
    );
  }

  // 获取所有交易记录
  @Post('list')
  async getAllTrading() {
    return await this.tradingService.findAll();
  }

  // 根据股票代码获取交易记录
  @Post('get-by-symbol')
  async getTradingBySymbol(@Body() body: { symbol: string }) {
    return await this.tradingService.findBySymbol(body.symbol);
  }

  // 根据股票代码和时间范围获取交易记录
  @Post('get-by-symbol-and-time')
  async getTradingBySymbolAndTimeRange(
    @Body()
    body: {
      symbol: string;
      startTime: string;
      endTime: string;
    },
  ) {
    const startTime = new Date(body.startTime);
    const endTime = new Date(body.endTime);
    return await this.tradingService.findBySymbolAndTimeRange(
      body.symbol,
      startTime,
      endTime,
    );
  }

  // 根据交易类型获取记录
  @Post('get-by-type')
  async getTradingByType(@Body() body: { type: 'buy' | 'sell' }) {
    return await this.tradingService.findByType(body.type);
  }

  // 根据价格范围获取记录
  @Post('get-by-price-range')
  async getTradingByPriceRange(
    @Body()
    body: {
      minPrice: number;
      maxPrice: number;
    },
  ) {
    return await this.tradingService.findByPriceRange(
      body.minPrice,
      body.maxPrice,
    );
  }

  // 获取最新交易记录
  @Post('get-latest')
  async getLatestTrading(
    @Body()
    body: {
      symbol?: string;
      limit?: number;
    },
  ) {
    return await this.tradingService.findLatest(body.symbol, body.limit || 100);
  }

  // 获取交易统计信息
  @Post('stats')
  async getTradingStats(
    @Body()
    body: {
      symbol?: string;
      startTime?: string;
      endTime?: string;
    },
  ) {
    const startTime = body.startTime ? new Date(body.startTime) : undefined;
    const endTime = body.endTime ? new Date(body.endTime) : undefined;
    return await this.tradingService.getTradingStats(
      body.symbol,
      startTime,
      endTime,
    );
  }

  // 更新交易记录
  @Post('update')
  async updateTrading(
    @Body()
    body: {
      id: number;
      updateData: Partial<Trading>;
    },
  ) {
    return await this.tradingService.updateTrading(body.id, body.updateData);
  }

  // 删除交易记录
  @Post('delete')
  async deleteTrading(@Body() body: { id: number }) {
    const success = await this.tradingService.deleteTrading(body.id);
    return { success };
  }

  // 清理过期数据
  @Post('clean-old-data')
  async cleanOldData(@Body() body: { daysToKeep?: number }) {
    const deletedCount = await this.tradingService.cleanOldData(
      body.daysToKeep || 30,
    );
    return { deletedCount, message: `已清理 ${deletedCount} 条过期数据` };
  }
}
