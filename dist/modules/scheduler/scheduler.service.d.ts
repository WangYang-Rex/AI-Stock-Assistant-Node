import { StockService } from '../market/stock/stock.service';
import { TrendsService } from '../market/trends/trends.service';
import { CloseAuctionService } from '../strategies/close-auction/close-auction.service';
export declare class SchedulerService {
    private readonly stockService;
    private readonly trendsService;
    private readonly closeAuctionService;
    private readonly logger;
    constructor(stockService: StockService, trendsService: TrendsService, closeAuctionService: CloseAuctionService);
    handleWeekdayStockSync(): Promise<void>;
    handleWeekdayTrendSyncMorning(): Promise<void>;
    handleWeekdayTrendSyncAfternoon(): Promise<void>;
    private syncAllStocksIntradayTrends;
    triggerManualSync(): Promise<void>;
    triggerManualTrendSync(): Promise<void>;
    getSchedulerStatus(): {
        service: string;
        status: string;
        schedules: {
            name: string;
            cron: string;
            description: string;
        }[];
    };
    handleCloseAuctionStrategyCheck(): Promise<void>;
}
