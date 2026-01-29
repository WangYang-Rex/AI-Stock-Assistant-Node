export class StrategyInfoDto {
  id: number;
  name: string;
  code: string;
  symbol: string;
  status: string;
  params: any;
}

export class StrategyMetricsDto {
  totalReturn: number;
  annualReturn: number;
  maxDrawdown: number;
  winRate: number;
  tradeCount: number;
}

export class PricePointDto {
  date: string;
  close: number;
}

export class TradePointDto {
  date: string;
  price: number;
  side: 'BUY' | 'SELL';
  allow: boolean;
}

export class EquityCurvePointDto {
  date: string;
  equity: number;
}

export class StrategyDetailDto {
  strategy: StrategyInfoDto;
  metrics: StrategyMetricsDto;
  priceSeries: PricePointDto[];
  trades: TradePointDto[];
  equityCurve: EquityCurvePointDto[];
}
