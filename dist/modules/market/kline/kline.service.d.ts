import { Repository } from 'typeorm';
import { StockService } from '../stock/stock.service';
import { Kline } from '../../../entities/kline.entity';
export type KlinePeriodType = 'daily' | 'weekly' | 'monthly' | '1min' | '5min' | '15min' | '30min' | '60min';
export type FqTypeValue = 0 | 1 | 2;
export interface FetchKlineOptions {
    code: string;
    period?: KlinePeriodType;
    fqType?: FqTypeValue;
    limit?: number;
    startDate?: string;
    endDate?: string;
    saveToDb?: boolean;
}
export interface QueryKlineOptions {
    code: string;
    period?: number;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    orderBy?: 'ASC' | 'DESC';
}
export declare class KlineService {
    private klineRepository;
    private stockService;
    private readonly logger;
    constructor(klineRepository: Repository<Kline>, stockService: StockService);
    private periodToNumber;
    private buildSecid;
    fetchKlineFromApi(options: FetchKlineOptions): Promise<Kline[]>;
    syncKlineData(options: FetchKlineOptions): Promise<{
        synced: number;
        total: number;
    }>;
    findKlines(options: QueryKlineOptions): Promise<{
        data: Kline[];
        total: number;
        page: number;
        limit: number;
    }>;
    getKlineStats(code: string, period?: number): Promise<any>;
    handleDailySyncAllStocksKlines(): Promise<void>;
}
