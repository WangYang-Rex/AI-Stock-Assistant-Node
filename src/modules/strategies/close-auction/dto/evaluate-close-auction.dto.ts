/* eslint-disable prettier/prettier */
export interface MinuteBar {
  time: string;      // '14:45'
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface EvaluateCloseAuctionDto {
  symbol: string;               // 588080
  tradeDate: string;            // 2026-01-28
  minuteBars: MinuteBar[];      // 至少包含当天 5 分钟K
  componentStrength?: number;   // 成分股强度（0–100，可选）
}
