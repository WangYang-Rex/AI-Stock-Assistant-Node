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
exports.TradingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const trading_entity_1 = require("../../../entities/trading.entity");
let TradingService = class TradingService {
    constructor(tradingRepository) {
        this.tradingRepository = tradingRepository;
    }
    calculateProfit(trading) {
        if (trading.buy_price &&
            trading.buy_volume &&
            trading.sell_price &&
            trading.sell_volume) {
            const buyAmount = Number(trading.buy_price) * Number(trading.buy_volume);
            const sellAmount = Number(trading.sell_price) * Number(trading.sell_volume);
            trading.profit = sellAmount - buyAmount;
            trading.profit_rate = trading.profit / buyAmount;
        }
        return trading;
    }
    async createTrading(tradingData) {
        const data = this.calculateProfit(tradingData);
        const trading = this.tradingRepository.create(data);
        return await this.tradingRepository.save(trading);
    }
    async updateTrading(id, updateData) {
        const existing = await this.tradingRepository.findOne({ where: { id } });
        if (!existing)
            return null;
        const merged = { ...existing, ...updateData };
        this.calculateProfit(merged);
        await this.tradingRepository.save(merged);
        return await this.tradingRepository.findOne({ where: { id } });
    }
    async deleteTrading(id) {
        const result = await this.tradingRepository.delete(id);
        return result.affected ? result.affected > 0 : false;
    }
    async findAll() {
        return await this.tradingRepository.find({
            order: { buy_date: 'DESC' },
        });
    }
    async findByCode(code) {
        return await this.tradingRepository.find({
            where: { code },
            order: { buy_date: 'DESC' },
        });
    }
    async findClosedTrades() {
        return await this.tradingRepository.find({
            where: { sell_date: (0, typeorm_2.Not)((0, typeorm_2.IsNull)()) },
            order: { sell_date: 'DESC' },
        });
    }
    async findOpenTrades() {
        return await this.tradingRepository.find({
            where: { sell_date: (0, typeorm_2.IsNull)() },
            order: { buy_date: 'DESC' },
        });
    }
    async getTradingStats(code, startTime, endTime) {
        const queryBuilder = this.tradingRepository.createQueryBuilder('trading');
        if (code) {
            queryBuilder.where('trading.code = :code', { code });
        }
        if (startTime && endTime) {
            queryBuilder.andWhere('trading.buy_date BETWEEN :startTime AND :endTime', { startTime, endTime });
        }
        const tradings = await queryBuilder.getMany();
        const closedTrades = tradings.filter((t) => t.sell_date !== null);
        const totalProfit = closedTrades.reduce((sum, t) => sum + Number(t.profit || 0), 0);
        const winTrades = closedTrades.filter((t) => Number(t.profit || 0) > 0).length;
        const totalTrades = tradings.length;
        const closedCount = closedTrades.length;
        const avgProfitRate = closedCount > 0
            ? closedTrades.reduce((sum, t) => sum + Number(t.profit_rate || 0), 0) /
                closedCount
            : 0;
        const winRate = closedCount > 0 ? winTrades / closedCount : 0;
        return {
            totalTrades,
            closedTrades: closedCount,
            totalProfit,
            avgProfitRate,
            winRate,
        };
    }
    async cleanOldData(daysToKeep = 365) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
        const result = await this.tradingRepository.delete({
            buy_date: (0, typeorm_2.LessThan)(cutoffDate),
        });
        return result.affected || 0;
    }
};
exports.TradingService = TradingService;
exports.TradingService = TradingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(trading_entity_1.Trading)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TradingService);
//# sourceMappingURL=trading.service.js.map