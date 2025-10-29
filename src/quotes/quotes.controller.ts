import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
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
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createQuoteDto: CreateQuoteDto) {
    return await this.quotesService.createQuote(createQuoteDto);
  }

  /**
   * 批量创建行情快照
   */
  @Post('batch')
  @HttpCode(HttpStatus.CREATED)
  async createBatch(@Body() createQuoteDtos: CreateQuoteDto[]) {
    return await this.quotesService.createQuotes(createQuoteDtos);
  }

  /**
   * 获取所有行情快照
   */
  @Get()
  async findAll(@Query() queryDto: QuoteQueryDto) {
    return await this.quotesService.findAll(queryDto);
  }

  /**
   * 根据ID获取行情快照
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.quotesService.findOne(id);
  }

  /**
   * 获取指定股票的最新行情
   */
  @Get('latest/:code')
  async findLatestByCode(@Param('code') code: string) {
    return await this.quotesService.findLatestByCode(code);
  }

  /**
   * 获取指定股票的历史行情
   */
  @Get('history/:code')
  async findByCode(
    @Param('code') code: string,
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string,
    @Query('limit', ParseIntPipe) limit?: number,
  ) {
    const start = startTime ? new Date(startTime) : undefined;
    const end = endTime ? new Date(endTime) : undefined;
    return await this.quotesService.findByCode(code, start, end, limit);
  }

  /**
   * 根据日期获取指定股票的行情
   */
  @Get('date/:code')
  async findByCodeAndDate(
    @Param('code') code: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit', ParseIntPipe) limit?: number,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return await this.quotesService.findByCodeAndDate(code, start, end, limit);
  }

  /**
   * 获取指定日期的所有行情
   */
  @Get('date')
  async findByDate(@Query('date') date: string) {
    const targetDate = new Date(date);
    return await this.quotesService.findByDate(targetDate);
  }

  /**
   * 更新行情快照
   */
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateQuoteDto: UpdateQuoteDto,
  ) {
    return await this.quotesService.update(id, updateQuoteDto);
  }

  /**
   * 删除行情快照
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.quotesService.remove(id);
  }

  /**
   * 批量删除指定时间范围的行情快照
   */
  @Delete('range')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeByTimeRange(
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
  ) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    await this.quotesService.removeByTimeRange(start, end);
  }

  /**
   * 获取市场统计信息
   */
  @Get('stats/market')
  async getMarketStats(): Promise<
    {
      market: string;
      count: string;
      avgPrice: string;
      maxPrice: string;
      minPrice: string;
    }[]
  > {
    return (await this.quotesService.getMarketStats()) as {
      market: string;
      count: string;
      avgPrice: string;
      maxPrice: string;
      minPrice: string;
    }[];
  }

  /**
   * 获取涨跌幅排行榜
   */
  @Get('rankings/gainers')
  async getTopGainers(@Query('limit', ParseIntPipe) limit?: number) {
    return await this.quotesService.getTopGainers(limit);
  }

  /**
   * 获取跌幅排行榜
   */
  @Get('rankings/losers')
  async getTopLosers(@Query('limit', ParseIntPipe) limit?: number) {
    return await this.quotesService.getTopLosers(limit);
  }

  /**
   * 获取成交量排行榜
   */
  @Get('rankings/volume')
  async getTopVolume(@Query('limit', ParseIntPipe) limit?: number) {
    return await this.quotesService.getTopVolume(limit);
  }
}
