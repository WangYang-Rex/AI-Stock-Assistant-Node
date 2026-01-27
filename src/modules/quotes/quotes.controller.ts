import { Controller, Post, Body, ParseIntPipe } from '@nestjs/common';
import { QuotesService } from './quotes.service';
import type { QuoteQueryDto } from './quotes.service';

@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) { }

  /* ========== Quote APIs ========== */

  /**
   * 同步股票快照
   */
  @Post('syncStockQuotesFromAPI')
  async syncStockQuotesFromAPI(
    @Body() stock: { code: string; market: number },
  ) {
    return await this.quotesService.syncStockQuotesFromAPI(stock);
  }

  /**
   * 批量同步所有股票快照
   * 遍历数据库中的所有股票，从东方财富 API 获取最新行情数据并保存
   */
  @Post('syncAllStockQuotes')
  async syncAllStockQuotes() {
    await this.quotesService.syncAllStockQuotes();
    return { message: '批量同步任务已启动，请查看日志了解同步进度' };
  }

  /**
   * 获取所有行情快照
   */
  @Post('list')
  async findAll(@Body() queryDto: QuoteQueryDto) {
    return await this.quotesService.findAll(queryDto);
  }

  /**
   * 获取指定股票的最新行情
   */
  @Post('latest')
  async findLatestByCode(@Body('code') code: string) {
    return await this.quotesService.findLatestByCode(code);
  }

  /**
   * 删除行情快照
   */
  @Post('delete')
  async remove(@Body('id', ParseIntPipe) id: number) {
    await this.quotesService.remove(id);
  }

  /**
   * 获取涨跌幅排行榜
   */
  @Post('rankings-gainers')
  async getTopGainers(@Body('limit', ParseIntPipe) limit?: number) {
    return await this.quotesService.getTopGainers(limit);
  }

  /**
   * 获取跌幅排行榜
   */
  @Post('rankings-losers')
  async getTopLosers(@Body('limit', ParseIntPipe) limit?: number) {
    return await this.quotesService.getTopLosers(limit);
  }

  /**
   * 获取成交量排行榜
   */
  @Post('rankings-volume')
  async getTopVolume(@Body('limit', ParseIntPipe) limit?: number) {
    return await this.quotesService.getTopVolume(limit);
  }
}
