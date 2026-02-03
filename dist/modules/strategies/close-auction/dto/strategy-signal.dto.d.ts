export interface StrategySignalDto {
    strategy: string;
    symbol: string;
    allow: boolean;
    confidence: number;
    reasons: string[];
    evaluatedAt: string;
}
