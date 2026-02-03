import { QuotesService } from './quotes.service';
import type { QuoteQueryDto } from './quotes.service';
export declare class QuotesController {
    private readonly quotesService;
    constructor(quotesService: QuotesService);
    syncStockQuotesFromAPI(stock: {
        code: string;
        market: number;
    }): Promise<boolean>;
    syncAllStockQuotes(): Promise<{
        message: string;
    }>;
    findAll(queryDto: QuoteQueryDto): Promise<{
        quotes: import("../../../entities/quote.entity").Quote[];
        total: number;
    }>;
    findLatestByCode(code: string): Promise<import("../../../entities/quote.entity").Quote>;
    remove(id: number): Promise<void>;
    getTopGainers(limit?: number): Promise<import("../../../entities/quote.entity").Quote[]>;
    getTopLosers(limit?: number): Promise<import("../../../entities/quote.entity").Quote[]>;
    getTopVolume(limit?: number): Promise<import("../../../entities/quote.entity").Quote[]>;
}
