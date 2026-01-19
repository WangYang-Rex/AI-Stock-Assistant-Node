import { Controller, Post, Body, ParseIntPipe } from '@nestjs/common';
import { QuotesService } from './quotes.service';
import type {
  CreateQuoteDto,
  UpdateQuoteDto,
  QuoteQueryDto,
} from './quotes.service';

@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) { }

  /* ========== Quote APIs ========== */

  /**
   * 创建行情快照
   */
  @Post('add')
  async create(@Body() createQuoteDto: CreateQuoteDto) {
    return await this.quotesService.createQuote(createQuoteDto);
  }

  /**
   * 批量创建行情快照
   */
  @Post('batchAdd')
  async createBatch(@Body() createQuoteDtos: CreateQuoteDto[]) {
    return await this.quotesService.createQuotes(createQuoteDtos);
  }

  /**
   * 获取所有行情快照
   */
  @Post('list')
  async findAll(@Body() queryDto: QuoteQueryDto) {
    return await this.quotesService.findAll(queryDto);
  }

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
   * 根据ID获取行情快照
   */
  @Post('one')
  async findOne(@Body('id', ParseIntPipe) id: number) {
    return await this.quotesService.findOne(id);
  }

  /**
   * 获取指定股票的最新行情
   */
  @Post('latest')
  async findLatestByCode(@Body('code') code: string) {
    return await this.quotesService.findLatestByCode(code);
  }

  /**
   * 获取指定股票的历史行情
   */
  @Post('history')
  async findByCode(
    @Body('code') code: string,
    @Body('startTime') startTime?: number,
    @Body('endTime') endTime?: number,
    @Body('limit', ParseIntPipe) limit?: number,
  ) {
    return await this.quotesService.findByCode(code, startTime, endTime, limit);
  }

  /**
   * 更新行情快照
   */
  @Post('update')
  async update(
    @Body('id', ParseIntPipe) id: number,
    @Body() updateQuoteDto: UpdateQuoteDto,
  ) {
    return await this.quotesService.update(id, updateQuoteDto);
  }

  /**
   * 删除行情快照
   */
  @Post('delete')
  async remove(@Body('id', ParseIntPipe) id: number) {
    await this.quotesService.remove(id);
  }

  /**
   * 批量删除指定时间范围的行情快照
   */
  @Post('delete-range')
  async removeByTimeRange(
    @Body('startTime') startTime: number,
    @Body('endTime') endTime: number,
  ) {
    await this.quotesService.removeByTimeRange(startTime, endTime);
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
