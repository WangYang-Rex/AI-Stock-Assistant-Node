import { KlineService, KlinePeriodType, FqTypeValue } from './kline.service';
import { Kline } from '../../../entities/kline.entity';
import { ResponseService } from '../../../common/services/response.service';
import { ApiResponse } from '../../../common/dto/response.dto';
export declare class KlineController {
    private readonly klineService;
    private readonly responseService;
    constructor(klineService: KlineService, responseService: ResponseService);
    syncKlines(body: {
        code: string;
        period?: KlinePeriodType;
        fqType?: FqTypeValue;
        limit?: number;
        startDate?: string;
        endDate?: string;
    }): Promise<ApiResponse<{
        synced: number;
        total: number;
    }>>;
    listKlines(body: {
        code: string;
        period?: number;
        startDate?: string;
        endDate?: string;
        page?: number;
        limit?: number;
        orderBy?: 'ASC' | 'DESC';
    }): Promise<ApiResponse<{
        data: Kline[];
        total: number;
        page: number;
        limit: number;
    }>>;
    getKlineStats(body: {
        code: string;
        period?: number;
    }): Promise<ApiResponse<any>>;
}
