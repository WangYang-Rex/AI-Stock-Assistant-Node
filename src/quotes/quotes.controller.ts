import { Controller, Post, Body, ParseIntPipe } from '@nestjs/common';
import { QuotesService } from './quotes.service';
import type {
  CreateQuoteDto,
  UpdateQuoteDto,
  QuoteQueryDto,
} from './quotes.service';

@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

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
    @Body('startTime') startTime?: string,
    @Body('endTime') endTime?: string,
    @Body('limit', ParseIntPipe) limit?: number,
  ) {
    const start = startTime ? new Date(startTime) : undefined;
    const end = endTime ? new Date(endTime) : undefined;
    return await this.quotesService.findByCode(code, start, end, limit);
  }

  /**
   * 根据日期获取指定股票的行情
   */
  @Post('date-code')
  async findByCodeAndDate(
    @Body('code') code: string,
    @Body('startDate') startDate?: string,
    @Body('endDate') endDate?: string,
    @Body('limit', ParseIntPipe) limit?: number,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return await this.quotesService.findByCodeAndDate(code, start, end, limit);
  }

  /**
   * 获取指定日期的所有行情
   */
  @Post('date')
  async findByDate(@Body('date') date: string) {
    const targetDate = new Date(date);
    return await this.quotesService.findByDate(targetDate);
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
    @Body('startTime') startTime: string,
    @Body('endTime') endTime: string,
  ) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    await this.quotesService.removeByTimeRange(start, end);
  }

  /**
   * 获取市场统计信息
   */
  @Post('stats-market')
  async getMarketStats(): Promise<
    {
      marketCode: string;
      count: string;
      avgPrice: string;
      maxPrice: string;
      minPrice: string;
    }[]
  > {
    return (await this.quotesService.getMarketStats()) as {
      marketCode: string;
      count: string;
      avgPrice: string;
      maxPrice: string;
      minPrice: string;
    }[];
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
