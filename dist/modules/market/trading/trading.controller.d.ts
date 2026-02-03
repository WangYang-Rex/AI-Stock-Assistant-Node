import { TradingService } from './trading.service';
import { Trading } from '../../../entities/trading.entity';
import { ResponseService } from '../../../common/services/response.service';
import { ApiResponse } from '../../../common/dto/response.dto';
export declare class TradingController {
    private readonly tradingService;
    private readonly responseService;
    constructor(tradingService: TradingService, responseService: ResponseService);
    createTrading(tradingData: Partial<Trading>): Promise<ApiResponse<Trading | null>>;
    updateTrading(body: {
        id: number;
        updateData: Partial<Trading>;
    }): Promise<Trading>;
    deleteTrading(body: {
        id: number;
    }): Promise<{
        success: boolean;
    }>;
    getAllTrading(): Promise<Trading[]>;
    getTradingByCode(body: {
        code: string;
    }): Promise<Trading[]>;
    getClosedTrades(): Promise<Trading[]>;
    getOpenTrades(): Promise<Trading[]>;
    getTradingStats(body: {
        code?: string;
        startTime?: string;
        endTime?: string;
    }): Promise<{
        totalTrades: number;
        closedTrades: number;
        totalProfit: number;
        avgProfitRate: number;
        winRate: number;
    }>;
    cleanOldData(body: {
        daysToKeep?: number;
    }): Promise<{
        deletedCount: number;
        message: string;
    }>;
}
