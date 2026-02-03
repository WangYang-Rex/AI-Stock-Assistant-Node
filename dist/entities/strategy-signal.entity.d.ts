export declare class StrategySignal {
    id: number;
    strategyCode: string;
    symbol: string;
    tradeDate: string;
    allow: number;
    confidence: number;
    reasons: string[];
    evalTime: Date;
    price: number;
    vwap: number;
    volume: number;
    extra: any;
    createdAt: Date;
    updatedAt: Date;
}
