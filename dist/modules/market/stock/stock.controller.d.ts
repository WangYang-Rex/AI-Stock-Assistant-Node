import { StockService } from './stock.service';
import { Stock } from '../../../entities/stock.entity';
import { ResponseService } from '../../../common/services/response.service';
import { ApiResponse } from '../../../common/dto/response.dto';
export declare class StockController {
    private readonly stockService;
    private readonly responseService;
    constructor(stockService: StockService, responseService: ResponseService);
    syncStock(body: {
        code: string;
        market: number;
    }): Promise<ApiResponse<{
        stock: Stock;
        isNew: boolean;
    }>>;
    deleteStock(body: {
        id: number;
    }): Promise<ApiResponse<{
        success: boolean;
    }>>;
    getAllStocks(filters: {
        market?: number;
        marketType?: string;
    }): Promise<ApiResponse<Stock[]>>;
    getStockByCode(body: {
        code: string;
    }): Promise<ApiResponse<Stock>>;
}
