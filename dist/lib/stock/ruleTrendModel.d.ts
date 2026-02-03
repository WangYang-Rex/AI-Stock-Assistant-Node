export interface Kline {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}
export interface TrendResult {
    trend: 'UP' | 'DOWN' | 'SIDEWAYS';
    score: number;
    strength: 'WEAK' | 'MEDIUM' | 'STRONG';
    reasons: string[];
    snapshot?: {
        ma5: number;
        ma10: number;
        ma20: number;
        ma60: number;
        ema20: number;
        ema20Slope: number;
        macd: {
            dif: number;
            dea: number;
            hist: number;
        };
        rsi: number;
        volumeRatio: number;
        price: number;
    };
}
export interface RiskResult {
    shouldStop: boolean;
    stopPrice: number;
    reason: string;
    snapshot?: {
        atr14: number;
        ma10: number;
        ma20: number;
    };
}
export interface PositionResult {
    suggestedRatio: number;
    action: 'BUY' | 'SELL' | 'HOLD' | 'REDUCE' | 'NONE';
    message: string;
}
export interface PositionDecision {
    action: 'ADD' | 'REDUCE' | 'HOLD' | 'STOP';
    percent: number;
    reason: string;
}
export declare function ATR(klines: Kline[], period?: number): number;
export declare function checkRisk(klines: Kline[]): RiskResult;
export declare function SMA(values: number[], period: number): number;
export declare function EMA(values: number[], period: number): number;
export declare function RSI(values: number[], period?: number): number;
export declare function MACD(values: number[]): {
    dif: number;
    dea: number;
    hist: number;
};
export declare function calcTrend(klines: Kline[]): TrendResult;
export declare function calcPosition(trend: TrendResult, risk: RiskResult): PositionResult;
export declare function calcPositionAction(trend: TrendResult, risk: RiskResult, klines: Kline[], currentPosition: number): PositionDecision;
