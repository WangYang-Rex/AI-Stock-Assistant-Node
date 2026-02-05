import { Controller, Post, Body } from '@nestjs/common';
import { StockService } from './stock.service';
import { EtfConstituentsService } from './etf-constituents.service';

import { Stock } from '../../../entities/stock.entity';
import { EtfConstituent } from '../../../entities/etf-constituent.entity';
import { ResponseService } from '../../../common/services/response.service';
import { ApiResponse } from '../../../common/dto/response.dto';

@Controller('stocks')
export class StockController {
  constructor(
    private readonly stockService: StockService,
    private readonly etfConstituentsService: EtfConstituentsService,
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
  /**
   * 批量同步/初始化 ETF 成分股数据
   */
  @Post('constituents/sync')
  async syncConstituents(
    @Body() body: { data: Partial<EtfConstituent>[] },
  ): Promise<ApiResponse<any>> {
    // const data = [
    //   { etfCode: '588080', stockCode: '688981', stockName: '中芯国际', weight: 0.085, rank: 1, effectiveDate: '2024-01-01' },
    //   { etfCode: '588080', stockCode: '688041', stockName: '海光信息', weight: 0.072, rank: 2, effectiveDate: '2024-01-01' },
    //   { etfCode: '588080', stockCode: '688256', stockName: '寒武纪', weight: 0.061, rank: 3, effectiveDate: '2024-01-01' },
    //   { etfCode: '588080', stockCode: '688012', stockName: '中微公司', weight: 0.054, rank: 4, effectiveDate: '2024-01-01' },
    //   { etfCode: '588080', stockCode: '688036', stockName: '传音控股', weight: 0.043, rank: 5, effectiveDate: '2024-01-01' },
    //   { etfCode: '588080', stockCode: '688599', stockName: '天合光能', weight: 0.041, rank: 6, effectiveDate: '2024-01-01' },
    //   { etfCode: '588080', stockCode: '688111', stockName: '金山办公', weight: 0.039, rank: 7, effectiveDate: '2024-01-01' },
    //   { etfCode: '588080', stockCode: '688009', stockName: '中国通号', weight: 0.036, rank: 8, effectiveDate: '2024-01-01' },
    //   { etfCode: '588080', stockCode: '688082', stockName: '盛美上海', weight: 0.032, rank: 9, effectiveDate: '2024-01-01' },
    //   { etfCode: '588080', stockCode: '688390', stockName: '固德威', weight: 0.029, rank: 10, effectiveDate: '2024-01-01' },
    // ];
    return this.responseService.handleAsync(
      () => this.etfConstituentsService.syncConstituents(body.data),
      '成分股批量同步成功',
    );
  }

  /**
   * 获取ETF成分股列表
   */
  @Post('constituents/list')
  async listConstituents(
    @Body() query: { etfCode?: string; stockCode?: string },
  ) {
    return this.responseService.handleAsync(
      () => this.etfConstituentsService.findAll(query),
      '获取成分股列表成功',
    );
  }

  /**
   * 创建ETF成分股
   */
  @Post('constituents/create')
  async createConstituent(@Body() data: Partial<EtfConstituent>) {
    return this.responseService.handleAsync(
      () => this.etfConstituentsService.create(data),
      '创建成分股成功',
    );
  }

  /**
   * 更新ETF成分股
   */
  @Post('constituents/update')
  async updateConstituent(
    @Body() body: { id: number; data: Partial<EtfConstituent> },
  ) {
    return this.responseService.handleAsync(
      () => this.etfConstituentsService.update(body.id, body.data),
      '更新成分股成功',
    );
  }

  /**
   * 删除ETF成分股
   */
  @Post('constituents/delete')
  async deleteConstituent(@Body() body: { id: number }) {
    return this.responseService.handleAsync(
      () => this.etfConstituentsService.delete(body.id),
      '删除成分股成功',
    );
  }
}

