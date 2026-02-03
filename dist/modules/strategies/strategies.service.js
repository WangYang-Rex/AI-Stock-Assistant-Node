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
exports.StrategyAggregateService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const strategy_entity_1 = require("../../entities/strategy.entity");
const strategy_params_entity_1 = require("../../entities/strategy-params.entity");
const strategy_metrics_entity_1 = require("../../entities/strategy-metrics.entity");
const strategy_equity_curve_entity_1 = require("../../entities/strategy-equity-curve.entity");
const strategy_signal_entity_1 = require("../../entities/strategy-signal.entity");
const kline_entity_1 = require("../../entities/kline.entity");
let StrategyAggregateService = class StrategyAggregateService {
    constructor(strategyRepo, paramsRepo, metricsRepo, equityRepo, signalRepo, klineRepo) {
        this.strategyRepo = strategyRepo;
        this.paramsRepo = paramsRepo;
        this.metricsRepo = metricsRepo;
        this.equityRepo = equityRepo;
        this.signalRepo = signalRepo;
        this.klineRepo = klineRepo;
    }
    async getStrategyDetail(id) {
        const strategy = await this.strategyRepo.findOne({ where: { id } });
        if (!strategy) {
            throw new common_1.NotFoundException(`策略 ID ${id} 未找到`);
        }
        const [params, metrics, equityCurve, signals, klines] = await Promise.all([
            this.paramsRepo.findOne({ where: { strategyId: id } }),
            this.metricsRepo.findOne({ where: { strategyId: id } }),
            this.equityRepo.find({
                where: { strategyId: id },
                order: { date: 'ASC' },
            }),
            this.signalRepo.find({
                where: { strategyCode: strategy.code, symbol: strategy.symbol },
                order: { tradeDate: 'ASC' },
            }),
            this.klineRepo.find({
                where: { code: strategy.symbol },
                order: { date: 'ASC' },
                take: 100,
            }),
        ]);
        return {
            strategy: {
                id: strategy.id,
                name: strategy.name,
                code: strategy.code,
                symbol: strategy.symbol,
                status: strategy.status,
                params: params?.params || {},
            },
            metrics: {
                totalReturn: Number(metrics?.totalReturn || 0),
                annualReturn: Number(metrics?.annualReturn || 0),
                maxDrawdown: Number(metrics?.maxDrawdown || 0),
                winRate: Number(metrics?.winRate || 0),
                tradeCount: metrics?.tradeCount || 0,
            },
            priceSeries: klines.map((k) => ({
                date: k.date,
                close: Number(k.close),
            })),
            trades: signals.map((s) => ({
                date: s.tradeDate,
                price: Number(s.price),
                side: 'BUY',
                allow: s.allow === 1,
            })),
            equityCurve: equityCurve.map((e) => ({
                date: e.date,
                equity: Number(e.equity),
            })),
        };
    }
    async querySignals(query) {
        const { strategyCode, symbol, startDate, endDate, allowOnly, minConfidence, page, pageSize, } = query;
        const queryBuilder = this.signalRepo.createQueryBuilder('signal');
        if (strategyCode) {
            queryBuilder.andWhere('signal.strategyCode = :strategyCode', {
                strategyCode,
            });
        }
        if (symbol) {
            queryBuilder.andWhere('signal.symbol = :symbol', { symbol });
        }
        if (startDate && endDate) {
            queryBuilder.andWhere('signal.tradeDate BETWEEN :startDate AND :endDate', {
                startDate,
                endDate,
            });
        }
        else if (startDate) {
            queryBuilder.andWhere('signal.tradeDate >= :startDate', { startDate });
        }
        else if (endDate) {
            queryBuilder.andWhere('signal.tradeDate <= :endDate', { endDate });
        }
        if (allowOnly) {
            queryBuilder.andWhere('signal.allow = 1');
        }
        if (minConfidence) {
            queryBuilder.andWhere('signal.confidence >= :minConfidence', {
                minConfidence,
            });
        }
        const [list, total] = await queryBuilder
            .orderBy('signal.tradeDate', 'DESC')
            .addOrderBy('signal.evalTime', 'DESC')
            .skip((page - 1) * pageSize)
            .take(pageSize)
            .getManyAndCount();
        return { list, total, page, pageSize };
    }
    async getLatestSignals(dto) {
        const { limit = 10, strategyCode, symbol, allowOnly } = dto;
        const where = {};
        if (strategyCode)
            where.strategyCode = strategyCode;
        if (symbol)
            where.symbol = symbol;
        if (allowOnly)
            where.allow = 1;
        return this.signalRepo.find({
            where,
            order: { tradeDate: 'DESC', evalTime: 'DESC' },
            take: limit,
        });
    }
    async getSignalById(id) {
        const signal = await this.signalRepo.findOne({ where: { id } });
        if (!signal) {
            throw new common_1.NotFoundException(`信号 ID ${id} 未找到`);
        }
        return signal;
    }
    async getSignalSummary(date) {
        const targetDate = date || new Date().toISOString().split('T')[0];
        const signals = await this.signalRepo.find({
            where: { tradeDate: targetDate },
        });
        return {
            date: targetDate,
            total: signals.length,
            allowed: signals.filter((s) => s.allow === 1).length,
            denied: signals.filter((s) => s.allow === 0).length,
            avgConfidence: signals.length > 0
                ? signals.reduce((acc, s) => acc + s.confidence, 0) / signals.length
                : 0,
        };
    }
};
exports.StrategyAggregateService = StrategyAggregateService;
exports.StrategyAggregateService = StrategyAggregateService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(strategy_entity_1.Strategy)),
    __param(1, (0, typeorm_1.InjectRepository)(strategy_params_entity_1.StrategyParams)),
    __param(2, (0, typeorm_1.InjectRepository)(strategy_metrics_entity_1.StrategyMetrics)),
    __param(3, (0, typeorm_1.InjectRepository)(strategy_equity_curve_entity_1.StrategyEquityCurve)),
    __param(4, (0, typeorm_1.InjectRepository)(strategy_signal_entity_1.StrategySignal)),
    __param(5, (0, typeorm_1.InjectRepository)(kline_entity_1.Kline)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], StrategyAggregateService);
//# sourceMappingURL=strategies.service.js.map