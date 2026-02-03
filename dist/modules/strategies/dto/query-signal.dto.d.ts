export declare class QuerySignalDto {
    strategyCode?: string;
    symbol?: string;
    startDate?: string;
    endDate?: string;
    allowOnly?: boolean;
    minConfidence?: number;
    page: number;
    pageSize: number;
}
export declare class SignalListResponseDto {
    list: any[];
    total: number;
    page: number;
    pageSize: number;
}
