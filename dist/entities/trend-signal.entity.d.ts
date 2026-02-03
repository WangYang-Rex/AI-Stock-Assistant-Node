export declare class TrendSignal {
    id: number;
    code: string;
    tradeDate: string;
    trend: 'UP' | 'DOWN' | 'SIDEWAYS';
    score: number;
    strength: 'WEAK' | 'MEDIUM' | 'STRONG';
    ma5: number;
    ma10: number;
    ma20: number;
    ma60: number;
    ema20: number;
    ema20Slope: number;
    macdDif: number;
    macdDea: number;
    macdHist: number;
    rsi14: number;
    price: number;
    volumeRatio: number;
    reasons: string[];
    createdAt: Date;
}
