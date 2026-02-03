import { Strategy } from './strategy.entity';
export declare class StrategyMetrics {
    id: number;
    strategy: Strategy;
    strategyId: number;
    totalReturn: number;
    annualReturn: number;
    maxDrawdown: number;
    winRate: number;
    tradeCount: number;
    updatedAt: Date;
}
