export interface MinuteBar {
  datetime: string; // 2025-01-15 14:56
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ConstituentsMinuteProvider {
  /**
   * 获取某 ETF 成分股在指定时间区间内的分钟行情
   */
  getMinuteBars(
    stockCodes: string[],
    date: string,
    startTime: string, // '14:30'
    endTime: string, // '15:00'
  ): Promise<Record<string, MinuteBar[]>>;
}
