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
var RuleTrendService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuleTrendService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const kline_service_1 = require("../../market/kline/kline.service");
const strategy_signal_entity_1 = require("../../../entities/strategy-signal.entity");
const trend_signal_entity_1 = require("../../../entities/trend-signal.entity");
const trend_risk_entity_1 = require("../../../entities/trend-risk.entity");
const trading_entity_1 = require("../../../entities/trading.entity");
const ruleTrendModel_1 = require("../../../lib/stock/ruleTrendModel");
let RuleTrendService = RuleTrendService_1 = class RuleTrendService {
    constructor(klineService, signalRepo, trendSignalRepo, trendRiskRepo, tradingRepo) {
        this.klineService = klineService;
        this.signalRepo = signalRepo;
        this.trendSignalRepo = trendSignalRepo;
        this.trendRiskRepo = trendRiskRepo;
        this.tradingRepo = tradingRepo;
        this.logger = new common_1.Logger(RuleTrendService_1.name);
        this.STRATEGY_CODE = 'RULE_TREND_V1';
    }
    async evaluateTrend(code) {
        this.logger.log(`🔍 正在评估股票 ${code} 的趋势与风险...`);
        const { data: klines } = await this.klineService.findKlines({
            code,
            period: 101,
            limit: 100,
            orderBy: 'ASC',
        });
        if (klines.length < 60) {
            this.logger.warn(`⚠️ 股票 ${code} K线数据不足 (当前: ${klines.length})`);
            return { success: false, message: '数据不足' };
        }
        const modelKlines = klines.map((k) => ({
            date: k.date,
            open: Number(k.open),
            high: Number(k.high),
            low: Number(k.low),
            close: Number(k.close),
            volume: Number(k.volume),
        }));
        const result = (0, ruleTrendModel_1.calcTrend)(modelKlines);
        const risk = (0, ruleTrendModel_1.checkRisk)(modelKlines);
        const position = (0, ruleTrendModel_1.calcPosition)(result, risk);
        const openRecords = await this.tradingRepo.find({
            where: { code, sell_date: null },
        });
        const currentPos = openRecords.length > 0 ? 40 : 0;
        const decision = (0, ruleTrendModel_1.calcPositionAction)(result, risk, modelKlines, currentPos);
        const latestKline = klines[klines.length - 1];
        const signal = new strategy_signal_entity_1.StrategySignal();
        signal.strategyCode = this.STRATEGY_CODE;
        signal.symbol = code;
        signal.tradeDate = latestKline.date;
        signal.allow = position.suggestedRatio > 0 ? 1 : 0;
        signal.confidence = Math.abs(result.score);
        signal.reasons = [
            ...result.reasons,
            risk.reason,
            position.message,
            decision.reason,
        ];
        signal.evalTime = new Date();
        signal.price = latestKline.close;
        signal.volume = latestKline.volume;
        signal.extra = {
            trend: result.trend,
            strength: result.strength,
            score: result.score,
            risk: {
                shouldStop: risk.shouldStop,
                stopPrice: risk.stopPrice,
                reason: risk.reason,
            },
            position: {
                ratio: position.suggestedRatio,
                action: position.action,
                message: position.message,
            },
            decision: {
                action: decision.action,
                percent: decision.percent,
                reason: decision.reason,
            },
        };
        const tSignal = new trend_signal_entity_1.TrendSignal();
        tSignal.code = code;
        tSignal.tradeDate = latestKline.date;
        tSignal.trend = result.trend;
        tSignal.score = result.score;
        tSignal.strength = result.strength;
        tSignal.reasons = result.reasons;
        if (result.snapshot) {
            tSignal.ma5 = result.snapshot.ma5;
            tSignal.ma10 = result.snapshot.ma10;
            tSignal.ma20 = result.snapshot.ma20;
            tSignal.ma60 = result.snapshot.ma60;
            tSignal.ema20 = result.snapshot.ema20;
            tSignal.ema20Slope = result.snapshot.ema20Slope;
            tSignal.macdDif = result.snapshot.macd.dif;
            tSignal.macdDea = result.snapshot.macd.dea;
            tSignal.macdHist = result.snapshot.macd.hist;
            tSignal.rsi14 = result.snapshot.rsi;
            tSignal.price = result.snapshot.price;
            tSignal.volumeRatio = result.snapshot.volumeRatio;
        }
        const tRisk = new trend_risk_entity_1.TrendRisk();
        tRisk.code = code;
        tRisk.tradeDate = latestKline.date;
        tRisk.stopTriggered = risk.shouldStop;
        tRisk.stopPrice = risk.stopPrice;
        tRisk.stopReason = risk.reason;
        if (risk.snapshot) {
            tRisk.atr14 = risk.snapshot.atr14;
            tRisk.ma10 = risk.snapshot.ma10;
            tRisk.ma20 = risk.snapshot.ma20;
        }
        try {
            await Promise.all([
                this.signalRepo.upsert(signal, {
                    conflictPaths: ['strategyCode', 'symbol', 'tradeDate'],
                    skipUpdateIfNoValuesChanged: true,
                }),
                this.trendSignalRepo.upsert(tSignal, {
                    conflictPaths: ['code', 'tradeDate'],
                }),
                this.trendRiskRepo.upsert(tRisk, {
                    conflictPaths: ['code', 'tradeDate'],
                }),
            ]);
            this.logger.log(`✅ 股票 ${code} 评估完成: ${result.trend} | 建议操作: ${decision.action} (${decision.percent}%) | ${decision.reason}`);
            return { success: true, result, risk, position, decision };
        }
        catch (err) {
            const error = err;
            this.logger.error(`❌ 保存股票 ${code} 策略数据失败:`, error.stack);
            return { success: false, message: '数据存库失败', error: error.message };
        }
    }
    async evaluateAll(codes) {
        this.logger.log(`🚀 开始批量评估 ${codes.length} 只股票...`);
        const results = [];
        for (const code of codes) {
            const res = await this.evaluateTrend(code);
            results.push({ code, ...res });
        }
        return results;
    }
};
exports.RuleTrendService = RuleTrendService;
exports.RuleTrendService = RuleTrendService = RuleTrendService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(strategy_signal_entity_1.StrategySignal)),
    __param(2, (0, typeorm_1.InjectRepository)(trend_signal_entity_1.TrendSignal)),
    __param(3, (0, typeorm_1.InjectRepository)(trend_risk_entity_1.TrendRisk)),
    __param(4, (0, typeorm_1.InjectRepository)(trading_entity_1.Trading)),
    __metadata("design:paramtypes", [kline_service_1.KlineService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], RuleTrendService);
//# sourceMappingURL=rule-trend.service.js.map