"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const stock_entity_1 = require("../../../entities/stock.entity");
const eastmoney_data_sdk_1 = require("eastmoney-data-sdk");
let StockService = class StockService {
    constructor(stockRepository) {
        this.stockRepository = stockRepository;
    }
    async syncStockFromAPI(code, market) {
        try {
            const secid = `${market}.${code}`;
            const quote = await eastmoney_data_sdk_1.eastmoney.quote(secid);
            if (!quote) {
                throw new Error(`无法获取股票 ${code} 的行情数据`);
            }
            const existingStock = await this.findByCode(code);
            const stockData = {
                name: quote.name || '',
                market: market,
                marketType: market === 1 ? 'SH' : 'SZ',
                price: quote.price || 0,
                pct: quote.pct || 0,
                change: quote.change || 0,
                volume: quote.volume || 0,
                amount: quote.amount || 0,
                totalMarketCap: quote.totalMarketCap || 0,
                floatMarketCap: quote.floatMarketCap || 0,
                turnover: quote.turnover || 0,
            };
            if (existingStock) {
                const updatedStock = await this.updateStock(existingStock.id, stockData);
                console.log(`✅ 更新股票: ${quote.name}(${code}), 价格: ${quote.price}`);
                return { stock: updatedStock, isNew: false };
            }
            else {
                const newStockData = {
                    code: code,
                    ...stockData,
                };
                const stock = this.stockRepository.create(newStockData);
                const savedStock = await this.stockRepository.save(stock);
                console.log(`🆕 新增股票: ${quote.name}(${code}), 价格: ${quote.price}`);
                return { stock: savedStock, isNew: true };
            }
        }
        catch (error) {
            console.error(`❌ 同步股票 ${code} 失败:`, error);
            throw new Error(`同步股票信息失败: ${error.message || error}`);
        }
    }
    async findByCode(code) {
        return await this.stockRepository.findOne({ where: { code } });
    }
    async findAll() {
        return await this.stockRepository.find();
    }
    async findByMarket(market) {
        return await this.stockRepository.find({ where: { market } });
    }
    async findByMarketType(marketType) {
        return await this.stockRepository.find({ where: { marketType } });
    }
    async updateStock(id, updateData) {
        await this.stockRepository.update(id, updateData);
        return await this.stockRepository.findOne({ where: { id } });
    }
    async deleteStock(id) {
        const result = await this.stockRepository.delete(id);
        return result.affected ? result.affected > 0 : false;
    }
    async updateStockByCode(code, updateData) {
        const stock = await this.findByCode(code);
        if (!stock) {
            return null;
        }
        return await this.updateStock(stock.id, updateData);
    }
    async batchUpdateStocks(updates) {
        const results = [];
        for (const update of updates) {
            const stock = await this.findByCode(update.code);
            if (stock) {
                const updatedStock = await this.updateStock(stock.id, update.updateData);
                if (updatedStock) {
                    results.push(updatedStock);
                }
            }
        }
        return results;
    }
};
exports.StockService = StockService;
exports.StockService = StockService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(stock_entity_1.Stock)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], StockService);
//# sourceMappingURL=stock.service.js.map