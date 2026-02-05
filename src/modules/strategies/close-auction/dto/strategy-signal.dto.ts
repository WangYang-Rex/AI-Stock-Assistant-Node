export interface StrategySignalDto {
  strategy: string;
  symbol: string;
  allow: boolean;
  confidence: number; // 0–100
  reasons: string[];
  evaluatedAt: string;
}
