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
        const { data: klinesRaw } = await this.klineService.findKlines({
            code,
            period: 101,
            limit: 1000,
            orderBy: 'DESC',
        });
        if (klinesRaw.length < 60) {
            this.logger.warn(`⚠️ 股票 ${code} K线数据不足 (当前: ${klinesRaw.length})`);
            return { success: false, message: '数据不足' };
        }
        const klines = klinesRaw.reverse();
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
        let execResult;
        if (result.trend === 'UP' &&
            result.strength !== 'WEAK' &&
            !risk.shouldStop) {
            try {
                const klines5m = await this.klineService.fetchKlineFromApi({
                    code,
                    period: '5min',
                    limit: 100,
                });
                if (klines5m && klines5m.length > 0) {
                    const modelKlines5m = klines5m.map((k) => ({
                        date: k.date,
                        open: Number(k.open),
                        high: Number(k.high),
                        low: Number(k.low),
                        close: Number(k.close),
                        volume: Number(k.volume),
                    }));
                    execResult = (0, ruleTrendModel_1.intradayExecute)(result, risk, {
                        klines5m: modelKlines5m,
                    });
                }
            }
            catch (err) {
                this.logger.error(`获取分时数据失败 [${code}]:`, err.message);
            }
        }
        const latestKline = klines[klines.length - 1];
        const tradeDate = latestKline.date.substring(0, 10);
        const signal = new strategy_signal_entity_1.StrategySignal();
        signal.strategyCode = this.STRATEGY_CODE;
        signal.symbol = code;
        signal.tradeDate = tradeDate;
        signal.allow = position.suggestedRatio > 0 ? 1 : 0;
        signal.confidence = Math.abs(result.score);
        signal.reasons = [
            ...result.reasons,
            risk.reason,
            position.message,
            decision.reason,
            execResult?.reason || '无需分时执行',
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
            exec: execResult,
        };
        const tSignal = new trend_signal_entity_1.TrendSignal();
        tSignal.code = code;
        tSignal.tradeDate = tradeDate;
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
        tRisk.tradeDate = tradeDate;
        tRisk.stopTriggered = risk.shouldStop;
        tRisk.stopPrice = risk.stopPrice;
        tRisk.stopReason = risk.reason;
        if (risk.snapshot) {
            tRisk.atr14 = risk.snapshot.atr14;
            tRisk.ma10 = risk.snapshot.ma10;
            tRisk.ma20 = risk.snapshot.ma20;
        }
        else {
            tRisk.atr14 = 0;
            tRisk.ma10 = 0;
            tRisk.ma20 = 0;
        }
        try {
            await Promise.all([
                this.signalRepo
                    .createQueryBuilder()
                    .insert()
                    .into(strategy_signal_entity_1.StrategySignal)
                    .values({
                    strategyCode: signal.strategyCode,
                    symbol: signal.symbol,
                    tradeDate: signal.tradeDate,
                    allow: signal.allow,
                    confidence: signal.confidence,
                    reasons: signal.reasons,
                    evalTime: signal.evalTime,
                    price: signal.price,
                    volume: signal.volume,
                    extra: signal.extra,
                })
                    .orUpdate([
                    'allow',
                    'confidence',
                    'reasons',
                    'eval_time',
                    'price',
                    'volume',
                    'extra',
                ], ['strategy_code', 'symbol', 'trade_date'])
                    .updateEntity(false)
                    .execute(),
                this.trendSignalRepo
                    .createQueryBuilder()
                    .insert()
                    .into(trend_signal_entity_1.TrendSignal)
                    .values({
                    code: tSignal.code,
                    tradeDate: tSignal.tradeDate,
                    trend: tSignal.trend,
                    score: tSignal.score,
                    strength: tSignal.strength,
                    ma5: tSignal.ma5,
                    ma10: tSignal.ma10,
                    ma20: tSignal.ma20,
                    ma60: tSignal.ma60,
                    ema20: tSignal.ema20,
                    ema20Slope: tSignal.ema20Slope,
                    macdDif: tSignal.macdDif,
                    macdDea: tSignal.macdDea,
                    macdHist: tSignal.macdHist,
                    rsi14: tSignal.rsi14,
                    price: tSignal.price,
                    volumeRatio: tSignal.volumeRatio,
                    reasons: tSignal.reasons,
                })
                    .orUpdate([
                    'trend',
                    'score',
                    'strength',
                    'ma5',
                    'ma10',
                    'ma20',
                    'ma60',
                    'ema20',
                    'ema20Slope',
                    'macdDif',
                    'macdDea',
                    'macdHist',
                    'rsi14',
                    'price',
                    'volumeRatio',
                    'reasons',
                ], ['code', 'trade_date'])
                    .updateEntity(false)
                    .execute(),
                this.trendRiskRepo
                    .createQueryBuilder()
                    .insert()
                    .into(trend_risk_entity_1.TrendRisk)
                    .values({
                    code: tRisk.code,
                    tradeDate: tRisk.tradeDate,
                    atr14: tRisk.atr14,
                    stopPrice: tRisk.stopPrice,
                    ma10: tRisk.ma10,
                    ma20: tRisk.ma20,
                    stopTriggered: tRisk.stopTriggered,
                    stopReason: tRisk.stopReason,
                })
                    .orUpdate([
                    'atr14',
                    'stopPrice',
                    'ma10',
                    'ma20',
                    'stop_triggered',
                    'stop_reason',
                ], ['code', 'trade_date'])
                    .updateEntity(false)
                    .execute(),
            ]);
            this.logger.log(`✅ 股票 ${code} 评估完成: ${result.trend} | 建议操作: ${decision.action} (${decision.percent}%) | 执行建议: ${execResult?.action || 'HOLD'} | ${decision.reason}`);
            return {
                success: true,
                result,
                risk,
                position,
                decision,
                exec: execResult,
            };
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