import { TrendsService } from './trends.service';
export declare class TrendsController {
    private readonly trendsService;
    constructor(trendsService: TrendsService);
    syncTrendFromAPI(code: string, market: number, ndays?: number): Promise<{
        synced: number;
        total: number;
        newAdded: number;
    }>;
    findAllTrends(code?: string, ndays?: number, startDatetime?: string, endDatetime?: string, page?: number, limit?: number): Promise<{
        trends: import("../../../entities/trend.entity").Trend[];
        total: number;
    }>;
    removeTrendsByRange(code: string, startDatetime: string, endDatetime: string): Promise<void>;
}
