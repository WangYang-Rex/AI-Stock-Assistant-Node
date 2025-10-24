import { Controller, Post, Body } from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { Quote } from '../entities/quote.entity';

@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  // 创建行情记录
  @Post('create')
  async createQuote(@Body() quoteData: Partial<Quote>) {
    return await this.quotesService.createQuote(quoteData);
  }

  // 批量创建行情记录
  @Post('create-batch')
  async createMultipleQuotes(@Body() body: { quoteDataList: Partial<Quote>[] }) {
    return await this.quotesService.createMultipleQuotes(body.quoteDataList);
  }

  // 获取所有行情记录
  @Post('list')
  async getAllQuotes() {
    return await this.quotesService.findAll();
  }

  // 根据股票代码获取行情记录
  @Post('get-by-symbol')
  async getQuotesBySymbol(@Body() body: { symbol: string }) {
    return await this.quotesService.findBySymbol(body.symbol);
  }

  // 根据日期获取行情记录
  @Post('get-by-date')
  async getQuotesByDate(@Body() body: { quoteDate: string }) {
    const quoteDate = new Date(body.quoteDate);
    return await this.quotesService.findByDate(quoteDate);
  }

  // 根据股票代码和日期获取行情记录
  @Post('get-by-symbol-and-date')
  async getQuotesBySymbolAndDate(
    @Body()
    body: {
      symbol: string;
      quoteDate: string;
    },
  ) {
    const quoteDate = new Date(body.quoteDate);
    return await this.quotesService.findBySymbolAndDate(body.symbol, quoteDate);
  }

  // 根据股票代码和日期范围获取行情记录
  @Post('get-by-symbol-and-date-range')
  async getQuotesBySymbolAndDateRange(
    @Body()
    body: {
      symbol: string;
      startDate: string;
      endDate: string;
    },
  ) {
    const startDate = new Date(body.startDate);
    const endDate = new Date(body.endDate);
    return await this.quotesService.findBySymbolAndDateRange(
      body.symbol,
      startDate,
      endDate,
    );
  }

  // 根据价格范围获取行情记录
  @Post('get-by-price-range')
  async getQuotesByPriceRange(
    @Body()
    body: {
      minPrice: number;
      maxPrice: number;
    },
  ) {
    return await this.quotesService.findByPriceRange(body.minPrice, body.maxPrice);
  }

  // 获取最新行情记录
  @Post('get-latest')
  async getLatestQuotes(
    @Body()
    body: {
      symbol?: string;
      limit?: number;
    },
  ) {
    return await this.quotesService.findLatest(body.symbol, body.limit || 100);
  }

  // 获取行情统计信息
  @Post('stats')
  async getQuoteStats(
    @Body()
    body: {
      symbol?: string;
      startDate?: string;
      endDate?: string;
    },
  ) {
    const startDate = body.startDate ? new Date(body.startDate) : undefined;
    const endDate = body.endDate ? new Date(body.endDate) : undefined;
    return await this.quotesService.getQuoteStats(body.symbol, startDate, endDate);
  }

  // 更新行情记录
  @Post('update')
  async updateQuote(
    @Body()
    body: {
      id: number;
      updateData: Partial<Quote>;
    },
  ) {
    return await this.quotesService.updateQuote(body.id, body.updateData);
  }

  // 删除行情记录
  @Post('delete')
  async deleteQuote(@Body() body: { id: number }) {
    const success = await this.quotesService.deleteQuote(body.id);
    return { success };
  }

  // 清理过期数据
  @Post('clean-old-data')
  async cleanOldData(@Body() body: { daysToKeep?: number }) {
    const deletedCount = await this.quotesService.cleanOldData(body.daysToKeep || 30);
    return { deletedCount, message: `已清理 ${deletedCount} 条过期数据` };
  }
}
