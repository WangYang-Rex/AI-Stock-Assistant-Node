import { Repository } from 'typeorm';
import { Quote } from '../../../entities/quote.entity';
import { StockService } from '../stock/stock.service';
export interface CreateQuoteDto {
    code: string;
    name: string;
    price?: number;
    high?: number;
    low?: number;
    open?: number;
    preClose?: number;
    volume?: number;
    amount?: number;
    pct?: number;
    change?: number;
    turnover?: number;
    totalMarketCap?: number;
    floatMarketCap?: number;
    pe?: number;
    pb?: number;
    updateTime?: number;
}
export interface UpdateQuoteDto {
    price?: number;
    high?: number;
    low?: number;
    open?: number;
    preClose?: number;
    volume?: number;
    amount?: number;
    pct?: number;
    change?: number;
    turnover?: number;
    totalMarketCap?: number;
    floatMarketCap?: number;
    pe?: number;
    pb?: number;
    updateTime?: number;
}
export interface QuoteQueryDto {
    code?: string;
    startTime?: number;
    endTime?: number;
    page?: number;
    limit?: number;
}
export declare class QuotesService {
    private readonly quoteRepository;
    private readonly stockService;
    private readonly logger;
    constructor(quoteRepository: Repository<Quote>, stockService: StockService);
    createQuote(createQuoteDto: CreateQuoteDto): Promise<Quote>;
    createQuotes(createQuoteDtos: CreateQuoteDto[]): Promise<Quote[]>;
    syncStockQuotesFromAPI(stock: {
        code: string;
        market: number;
    }): Promise<boolean>;
    findAll(queryDto?: QuoteQueryDto): Promise<{
        quotes: Quote[];
        total: number;
    }>;
    findOne(id: number): Promise<Quote | null>;
    findLatestByCode(code: string): Promise<Quote | null>;
    update(id: number, updateQuoteDto: UpdateQuoteDto): Promise<Quote | null>;
    remove(id: number): Promise<void>;
    getTopGainers(limit?: number): Promise<Quote[]>;
    getTopLosers(limit?: number): Promise<Quote[]>;
    getTopVolume(limit?: number): Promise<Quote[]>;
    syncAllStockQuotes(): Promise<void>;
    handleWeekdayNoonQuotesSync(): Promise<void>;
    handleWeekdayAfternoonQuotesSync(): Promise<void>;
}
