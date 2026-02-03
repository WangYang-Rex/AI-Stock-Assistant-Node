import { Repository } from 'typeorm';
import { Trend } from '../../../entities/trend.entity';
export interface CreateTrendDto {
    code: string;
    name: string;
    datetime: string;
    price?: number;
    avgPrice?: number;
    volume?: number;
    amount?: number;
    pct?: number;
}
export interface TrendQueryDto {
    code?: string;
    startDatetime?: string;
    endDatetime?: string;
    page?: number;
    limit?: number;
}
export declare class TrendsService {
    private readonly trendRepository;
    private readonly logger;
    constructor(trendRepository: Repository<Trend>);
    createTrends(createTrendDtos: CreateTrendDto[]): Promise<Trend[]>;
    findAllTrends(queryDto?: TrendQueryDto): Promise<{
        trends: Trend[];
        total: number;
    }>;
    removeTrendsByRange(code: string, startDatetime: string, endDatetime: string): Promise<void>;
    syncTrendFromAPI(code: string, market: number, ndays?: number): Promise<{
        synced: number;
        total: number;
        newAdded: number;
    }>;
    handleDailyCleanupOldTrends(): Promise<void>;
}
