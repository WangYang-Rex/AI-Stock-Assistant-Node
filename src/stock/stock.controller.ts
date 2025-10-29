import { Controller, Post, Body } from '@nestjs/common';
import { StockService } from './stock.service';
import { Stock } from '../entities/stock.entity';
import { ResponseService } from '../common/services/response.service';
import { ApiResponse } from '../common/dto/response.dto';

@Controller('stocks')
export class StockController {
  constructor(
    private readonly stockService: StockService,
    private readonly responseService: ResponseService,
  ) {}

  // // 创建股票
  // @Post('create')
  // async createStock(
  //   @Body() stockData: Partial<Stock>,
  // ): Promise<ApiResponse<Stock>> {
  //   return this.responseService.handleAsync(
  //     () => this.stockService.createStock(stockData),
  //     '股票创建成功',
  //     '股票创建失败',
  //   );
  // }

  // 同步股票信息：通过API获取股票信息，不存在则新增，存在则更新
  @Post('sync')
  async syncStock(
    @Body() body: { code: string; marketCode: number },
  ): Promise<ApiResponse<{ stock: Stock; isNew: boolean }>> {
    return this.responseService.handleAsync(
      () => this.stockService.syncStockFromAPI(body.code, body.marketCode),
      '股票信息同步成功',
      '股票信息同步失败',
    );
  }

  // // 更新股票信息
  // @Post('update')
  // async updateStock(
  //   @Body() body: { id: number; updateData: Partial<Stock> },
  // ): Promise<ApiResponse<Stock>> {
  //   return this.responseService.handleAsync(
  //     async () => {
  //       const result = await this.stockService.updateStock(
  //         body.id,
  //         body.updateData,
  //       );
  //       if (!result) {
  //         throw new Error('股票未找到');
  //       }
  //       return result;
  //     },
  //     '股票信息更新成功',
  //     '股票信息更新失败',
  //   );
  // }

  // 删除股票
  @Post('delete')
  async deleteStock(
    @Body() body: { id: number },
  ): Promise<ApiResponse<{ success: boolean }>> {
    return this.responseService.handleAsync(
      async () => {
        const success = await this.stockService.deleteStock(body.id);
        return { success };
      },
      '股票删除成功',
      '股票删除失败',
    );
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
  ): Promise<ApiResponse<Stock[]>> {
    return this.responseService.handleAsync(
      async () => {
        const { market, marketCode } = filters;

        if (market) {
          return await this.stockService.findByMarket(market);
        }
        if (marketCode) {
          return await this.stockService.findByMarketCode(marketCode);
        }
        return await this.stockService.findAll();
      },
      '股票列表获取成功',
      '股票列表获取失败',
    );
  }

  // 根据股票代码获取股票
  @Post('get-by-code')
  async getStockByCode(
    @Body() body: { code: string },
  ): Promise<ApiResponse<Stock>> {
    return this.responseService.handleAsync(
      async () => {
        const stock = await this.stockService.findByCode(body.code);
        if (!stock) {
          throw new Error('股票未找到');
        }
        return stock;
      },
      '股票信息获取成功',
      '股票未找到',
    );
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
  ): Promise<ApiResponse<Stock>> {
    return this.responseService.handleAsync(
      async () => {
        const result = await this.stockService.updateStockPrice(body.code, {
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
        if (!result) {
          throw new Error('股票未找到');
        }
        return result;
      },
      '股票价格更新成功',
      '股票价格更新失败',
    );
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
  ): Promise<ApiResponse<Stock>> {
    return this.responseService.handleAsync(
      async () => {
        const result = await this.stockService.updateHoldingInfo(body.code, {
          holdingQuantity: body.holdingQuantity,
          holdingCost: body.holdingCost,
        });
        if (!result) {
          throw new Error('股票未找到');
        }
        return result;
      },
      '持仓信息更新成功',
      '持仓信息更新失败',
    );
  }

  // 计算市值
  @Post('calculate-market-value')
  async calculateMarketValue(
    @Body() body: { code: string },
  ): Promise<ApiResponse<Stock>> {
    return this.responseService.handleAsync(
      async () => {
        const result = await this.stockService.calculateMarketValue(body.code);
        if (!result) {
          throw new Error('股票未找到或缺少必要信息');
        }
        return result;
      },
      '市值计算成功',
      '市值计算失败',
    );
  }

  // 获取持仓股票列表
  @Post('holdings')
  async getHoldingStocks(): Promise<ApiResponse<Stock[]>> {
    return this.responseService.handleAsync(
      () => this.stockService.getHoldingStocks(),
      '持仓股票列表获取成功',
      '持仓股票列表获取失败',
    );
  }

  // 批量更新股票信息
  @Post('batch-update')
  async batchUpdateStocks(
    @Body()
    body: {
      updates: Array<{ code: string; updateData: Partial<Stock> }>;
    },
  ): Promise<ApiResponse<Stock[]>> {
    return this.responseService.handleAsync(
      () => this.stockService.batchUpdateStocks(body.updates),
      '批量更新成功',
      '批量更新失败',
    );
  }

  // 更新市盈率
  @Post('update-pe')
  async updatePE(
    @Body() body: { code: string; pe: number },
  ): Promise<ApiResponse<Stock>> {
    return this.responseService.handleAsync(
      async () => {
        const result = await this.stockService.updatePE(body.code, body.pe);
        if (!result) {
          throw new Error('股票未找到');
        }
        return result;
      },
      '市盈率更新成功',
      '市盈率更新失败',
    );
  }

  // 更新成交量
  @Post('update-volume')
  async updateVolume(
    @Body() body: { code: string; volume: number },
  ): Promise<ApiResponse<Stock>> {
    return this.responseService.handleAsync(
      async () => {
        const result = await this.stockService.updateVolume(
          body.code,
          body.volume,
        );
        if (!result) {
          throw new Error('股票未找到');
        }
        return result;
      },
      '成交量更新成功',
      '成交量更新失败',
    );
  }

  // 获取股票统计信息
  @Post('stats/overview')
  async getStockStats(): Promise<ApiResponse<any>> {
    return this.responseService.handleAsync(
      () => this.stockService.getStockStats(),
      '股票统计信息获取成功',
      '股票统计信息获取失败',
    );
  }
}
