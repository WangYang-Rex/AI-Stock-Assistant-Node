export declare class StrategyInfoDto {
    id: number;
    name: string;
    code: string;
    symbol: string;
    status: string;
    params: any;
}
export declare class StrategyMetricsDto {
    totalReturn: number;
    annualReturn: number;
    maxDrawdown: number;
    winRate: number;
    tradeCount: number;
}
export declare class PricePointDto {
    date: string;
    close: number;
}
export declare class TradePointDto {
    date: string;
    price: number;
    side: 'BUY' | 'SELL';
    allow: boolean;
}
export declare class EquityCurvePointDto {
    date: string;
    equity: number;
}
export declare class StrategyDetailDto {
    strategy: StrategyInfoDto;
    metrics: StrategyMetricsDto;
    priceSeries: PricePointDto[];
    trades: TradePointDto[];
    equityCurve: EquityCurvePointDto[];
}
