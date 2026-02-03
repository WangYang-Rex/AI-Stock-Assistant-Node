import { StrategySignal } from './strategy-signal.entity';
export declare class StrategyResult {
    id: number;
    signal: StrategySignal;
    signalId: number;
    symbol: string;
    buyPrice: number;
    sellPrice: number;
    sellTime: Date;
    returnPct: number;
    maxGainPct: number;
    maxDrawdownPct: number;
    win: number;
    createdAt: Date;
}
