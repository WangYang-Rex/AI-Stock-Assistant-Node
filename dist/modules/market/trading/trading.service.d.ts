import { Repository } from 'typeorm';
import { Trading } from '../../../entities/trading.entity';
export declare class TradingService {
    private readonly tradingRepository;
    constructor(tradingRepository: Repository<Trading>);
    private calculateProfit;
    createTrading(tradingData: Partial<Trading>): Promise<Trading>;
    updateTrading(id: number, updateData: Partial<Trading>): Promise<Trading | null>;
    deleteTrading(id: number): Promise<boolean>;
    findAll(): Promise<Trading[]>;
    findByCode(code: string): Promise<Trading[]>;
    findClosedTrades(): Promise<Trading[]>;
    findOpenTrades(): Promise<Trading[]>;
    getTradingStats(code?: string, startTime?: Date, endTime?: Date): Promise<{
        totalTrades: number;
        closedTrades: number;
        totalProfit: number;
        avgProfitRate: number;
        winRate: number;
    }>;
    cleanOldData(daysToKeep?: number): Promise<number>;
}
