import { Controller, Post, Body } from '@nestjs/common';
import { HoldingsService } from './holdings.service';
import { Holding } from '../entities/holding.entity';

@Controller('holdings')
export class HoldingsController {
  constructor(private readonly holdingsService: HoldingsService) {}

  // 创建持仓记录
  @Post('create')
  async createHolding(@Body() holdingData: Partial<Holding>) {
    return await this.holdingsService.createHolding(holdingData);
  }

  // 批量创建持仓记录
  @Post('create-batch')
  async createMultipleHoldings(@Body() body: { holdingDataList: Partial<Holding>[] }) {
    return await this.holdingsService.createMultipleHoldings(body.holdingDataList);
  }

  // 获取所有持仓记录
  @Post('list')
  async getAllHoldings() {
    return await this.holdingsService.findAll();
  }

  // 根据股票代码获取持仓记录
  @Post('get-by-symbol')
  async getHoldingBySymbol(@Body() body: { symbol: string }) {
    return await this.holdingsService.findBySymbol(body.symbol);
  }

  // 更新持仓记录
  @Post('update')
  async updateHolding(
    @Body()
    body: {
      id: number;
      updateData: Partial<Holding>;
    },
  ) {
    return await this.holdingsService.updateHolding(body.id, body.updateData);
  }

  // 根据股票代码更新持仓记录
  @Post('update-by-symbol')
  async updateHoldingBySymbol(
    @Body()
    body: {
      symbol: string;
      updateData: Partial<Holding>;
    },
  ) {
    return await this.holdingsService.updateHoldingBySymbol(body.symbol, body.updateData);
  }

  // 删除持仓记录
  @Post('delete')
  async deleteHolding(@Body() body: { id: number }) {
    const success = await this.holdingsService.deleteHolding(body.id);
    return { success };
  }

  // 根据股票代码删除持仓记录
  @Post('delete-by-symbol')
  async deleteHoldingBySymbol(@Body() body: { symbol: string }) {
    const success = await this.holdingsService.deleteHoldingBySymbol(body.symbol);
    return { success };
  }

  // 更新当前市值
  @Post('update-current-value')
  async updateCurrentValue(
    @Body()
    body: {
      symbol: string;
      currentValue: number;
    },
  ) {
    return await this.holdingsService.updateCurrentValue(body.symbol, body.currentValue);
  }

  // 批量更新当前市值
  @Post('update-multiple-current-values')
  async updateMultipleCurrentValues(
    @Body()
    body: {
      updates: { symbol: string; currentValue: number }[];
    },
  ) {
    await this.holdingsService.updateMultipleCurrentValues(body.updates);
    return { message: '批量更新完成' };
  }

  // 获取持仓统计信息
  @Post('stats')
  async getHoldingsStats() {
    return await this.holdingsService.getHoldingsStats();
  }

  // 获取总市值
  @Post('total-value')
  async getTotalValue() {
    const totalValue = await this.holdingsService.getTotalValue();
    return { totalValue };
  }

  // 获取总成本
  @Post('total-cost')
  async getTotalCost() {
    const totalCost = await this.holdingsService.getTotalCost();
    return { totalCost };
  }

  // 获取盈亏情况
  @Post('profit-loss')
  async getProfitLoss() {
    return await this.holdingsService.getProfitLoss();
  }

  // 根据盈亏情况排序持仓
  @Post('by-profit')
  async getHoldingsByProfit(
    @Body()
    body: {
      order?: 'asc' | 'desc';
    },
  ) {
    return await this.holdingsService.getHoldingsByProfit(body.order || 'desc');
  }
}
