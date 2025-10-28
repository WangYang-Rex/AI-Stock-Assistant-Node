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
  @Post('get-by-symbol')
  async getStockBySymbol(@Body() body: { symbol: string }) {
    return await this.stockService.findBySymbol(body.symbol);
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
      symbol: string;
      latestPrice?: number;
      previousClose?: number;
      changePercent?: number;
      changeAmount?: number;
    },
  ) {
    return await this.stockService.updateStockPrice(body.symbol, {
      latestPrice: body.latestPrice,
      previousClose: body.previousClose,
      changePercent: body.changePercent,
      changeAmount: body.changeAmount,
    });
  }

  // 更新持仓信息
  @Post('update-holding')
  async updateHoldingInfo(
    @Body()
    body: {
      symbol: string;
      holdingQuantity?: number;
      holdingCost?: number;
    },
  ) {
    return await this.stockService.updateHoldingInfo(body.symbol, {
      holdingQuantity: body.holdingQuantity,
      holdingCost: body.holdingCost,
    });
  }

  // 计算市值
  @Post('calculate-market-value')
  async calculateMarketValue(@Body() body: { symbol: string }) {
    return await this.stockService.calculateMarketValue(body.symbol);
  }

  // 获取持仓股票列表
  @Post('holdings')
  async getHoldingStocks() {
    return await this.stockService.getHoldingStocks();
  }

  // 获取股票统计信息
  @Post('stats/overview')
  async getStockStats() {
    return await this.stockService.getStockStats();
  }
}
