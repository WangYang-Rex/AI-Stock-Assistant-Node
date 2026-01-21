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

  /**
   * 同步股票信息：通过API获取股票信息，不存在则新增，存在则更新
   */
  @Post('sync')
  async syncStock(
    @Body() body: { code: string; market: number },
  ): Promise<ApiResponse<{ stock: Stock; isNew: boolean }>> {
    return this.responseService.handleAsync(
      () => this.stockService.syncStockFromAPI(body.code, body.market),
      '股票信息同步成功',
      '股票信息同步失败',
    );
  }

  /**
   * 删除股票
   */
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

  /**
   * 获取所有股票
   */
  @Post('list')
  async getAllStocks(
    @Body()
    filters: {
      market?: number;
      marketType?: string;
    },
  ): Promise<ApiResponse<Stock[]>> {
    return this.responseService.handleAsync(
      async () => {
        const { market, marketType } = filters;

        if (market !== undefined) {
          return await this.stockService.findByMarket(market);
        }
        if (marketType) {
          return await this.stockService.findByMarketType(marketType);
        }
        return await this.stockService.findAll();
      },
      '股票列表获取成功',
      '股票列表获取失败',
    );
  }

  /**
   * 根据股票代码获取股票
   */
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
}
