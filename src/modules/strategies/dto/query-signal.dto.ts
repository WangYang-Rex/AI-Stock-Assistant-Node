export class QuerySignalDto {
  strategyCode?: string;
  symbol?: string;
  startDate?: string;
  endDate?: string;
  allowOnly?: boolean;
  minConfidence?: number;
  page: number = 1;
  pageSize: number = 20;
}

export class SignalListResponseDto {
  list: any[]; // 对应 StrategySignal，这里可以使用具体实体或 Partial
  total: number;
  page: number;
  pageSize: number;
}
