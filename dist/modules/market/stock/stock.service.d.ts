import { Repository } from 'typeorm';
import { Stock } from '../../../entities/stock.entity';
export declare class StockService {
    private stockRepository;
    constructor(stockRepository: Repository<Stock>);
    syncStockFromAPI(code: string, market: number): Promise<{
        stock: Stock;
        isNew: boolean;
    }>;
    findByCode(code: string): Promise<Stock | null>;
    findAll(): Promise<Stock[]>;
    findByMarket(market: number): Promise<Stock[]>;
    findByMarketType(marketType: string): Promise<Stock[]>;
    updateStock(id: number, updateData: Partial<Stock>): Promise<Stock | null>;
    deleteStock(id: number): Promise<boolean>;
    updateStockByCode(code: string, updateData: Partial<Stock>): Promise<Stock | null>;
    batchUpdateStocks(updates: Array<{
        code: string;
        updateData: Partial<Stock>;
    }>): Promise<Stock[]>;
}
