import { Controller, Post, Body } from '@nestjs/common';
import { TradingService } from './trading.service';
import { Trading } from '../../../entities/trading.entity';
import { ResponseService } from '../../../common/services/response.service';
import { ApiResponse } from '../../../common/dto/response.dto';

@Controller('trading')
export class TradingController {
  constructor(
    private readonly tradingService: TradingService,
    private readonly responseService: ResponseService,
  ) {}

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

  // 获取所有交易记录
  @Post('list')
  async getAllTrading() {
    return await this.tradingService.findAll();
  }

  // 根据股票代码获取交易记录
  @Post('get-by-code')
  async getTradingByCode(@Body() body: { code: string }) {
    return await this.tradingService.findByCode(body.code);
  }

  // 获取已平仓交易
  @Post('get-closed')
  async getClosedTrades() {
    return await this.tradingService.findClosedTrades();
  }

  // 获取持仓中交易
  @Post('get-open')
  async getOpenTrades() {
    return await this.tradingService.findOpenTrades();
  }

  // 获取交易统计信息
  @Post('stats')
  async getTradingStats(
    @Body()
    body: {
      code?: string;
      startTime?: string;
      endTime?: string;
    },
  ) {
    const startTime = body.startTime ? new Date(body.startTime) : undefined;
    const endTime = body.endTime ? new Date(body.endTime) : undefined;
    return await this.tradingService.getTradingStats(
      body.code,
      startTime,
      endTime,
    );
  }

  // 清理过期数据
  @Post('clean-old-data')
  async cleanOldData(@Body() body: { daysToKeep?: number }) {
    const deletedCount = await this.tradingService.cleanOldData(
      body.daysToKeep || 365,
    );
    return { deletedCount, message: `已清理 ${deletedCount} 条过期数据` };
  }
}
