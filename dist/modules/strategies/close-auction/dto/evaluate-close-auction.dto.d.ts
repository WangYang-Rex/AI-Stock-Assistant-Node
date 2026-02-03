export interface MinuteBar {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}
export interface EvaluateCloseAuctionDto {
    symbol: string;
    tradeDate: string;
    minuteBars: MinuteBar[];
    componentStrength?: number;
}
