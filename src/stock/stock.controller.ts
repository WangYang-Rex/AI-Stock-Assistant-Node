import { Controller, Post, Body } from '@nestjs/common';
import { StockService } from './stock.service';
import { Stock } from '../entities/stock.entity';

@Controller('stocks')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  // 创建股票
  @Post('create')
  async createStock(@Body() stockData: Partial<Stock>) {
    return await this.stockService.createStock(stockData);
  }

  // 通过API添加股票
  @Post('add')
  async addStock(
    @Body() body: { code: string; marketCode: number },
  ): Promise<Stock | { error: string }> {
    try {
      const stock = await this.stockService.addStockFromAPI(
        body.code,
        body.marketCode,
      );
      return stock;
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      return { error: errorMessage };
    }
  }

  // 获取所有股票
  @Post('list')
  async getAllStocks(
    @Body()
    filters: {
      market?: string;
      marketCode?: number;
      page?: number;
      limit?: number;
    },
  ) {
    const { market, marketCode } = filters;

    if (market) {
      return await this.stockService.findByMarket(market);
    }
    if (marketCode) {
      return await this.stockService.findByMarketCode(marketCode);
    }
    return await this.stockService.findAll();
  }

  // 根据股票代码获取股票
  @Post('get-by-code')
  async getStockByCode(
    @Body() body: { code: string },
  ): Promise<Stock | { error: string }> {
    const stock = await this.stockService.findByCode(body.code);
    return stock || { error: 'Stock not found' };
  }

  // 更新股票信息
  @Post('update')
  async updateStock(@Body() body: { id: number; updateData: Partial<Stock> }) {
    return await this.stockService.updateStock(body.id, body.updateData);
  }

  // 删除股票
  @Post('delete')
  async deleteStock(@Body() body: { id: number }) {
    const success = await this.stockService.deleteStock(body.id);
    return { success };
  }

  // 更新股票价格信息
  @Post('update-price')
  async updateStockPrice(
    @Body()
    body: {
      code: string;
      latestPrice?: number;
      previousClosePrice?: number;
      changePercent?: number;
      changeAmount?: number;
      openPrice?: number;
      highPrice?: number;
      lowPrice?: number;
      volume?: number;
      pe?: number;
    },
  ) {
    return await this.stockService.updateStockPrice(body.code, {
      latestPrice: body.latestPrice,
      previousClosePrice: body.previousClosePrice,
      changePercent: body.changePercent,
      changeAmount: body.changeAmount,
      openPrice: body.openPrice,
      highPrice: body.highPrice,
      lowPrice: body.lowPrice,
      volume: body.volume,
      pe: body.pe,
    });
  }

  // 更新持仓信息
  @Post('update-holding')
  async updateHoldingInfo(
    @Body()
    body: {
      code: string;
      holdingQuantity?: number;
      holdingCost?: number;
    },
  ) {
    return await this.stockService.updateHoldingInfo(body.code, {
      holdingQuantity: body.holdingQuantity,
      holdingCost: body.holdingCost,
    });
  }

  // 计算市值
  @Post('calculate-market-value')
  async calculateMarketValue(@Body() body: { code: string }) {
    return await this.stockService.calculateMarketValue(body.code);
  }

  // 获取持仓股票列表
  @Post('holdings')
  async getHoldingStocks() {
    return await this.stockService.getHoldingStocks();
  }

  // 批量更新股票信息
  @Post('batch-update')
  async batchUpdateStocks(
    @Body()
    body: {
      updates: Array<{ code: string; updateData: Partial<Stock> }>;
    },
  ): Promise<Stock[]> {
    const result = await this.stockService.batchUpdateStocks(body.updates);
    return result;
  }

  // 更新市盈率
  @Post('update-pe')
  async updatePE(
    @Body() body: { code: string; pe: number },
  ): Promise<Stock | { error: string }> {
    const result = await this.stockService.updatePE(body.code, body.pe);
    return result || { error: 'Stock not found' };
  }

  // 更新成交量
  @Post('update-volume')
  async updateVolume(
    @Body() body: { code: string; volume: number },
  ): Promise<Stock | { error: string }> {
    const result = await this.stockService.updateVolume(body.code, body.volume);
    return result || { error: 'Stock not found' };
  }

  // 获取股票统计信息
  @Post('stats/overview')
  async getStockStats() {
    return await this.stockService.getStockStats();
  }
}
