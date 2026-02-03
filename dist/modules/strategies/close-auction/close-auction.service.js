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
exports.CloseAuctionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const close_auction_strategy_1 = require("./close-auction.strategy");
const strategy_signal_entity_1 = require("../../../entities/strategy-signal.entity");
const vwap_util_1 = require("./utils/vwap.util");
const trends_service_1 = require("../../market/trends/trends.service");
const date_utils_1 = require("../../../common/utils/date.utils");
const dingtalk_service_1 = require("../../../common/services/dingtalk.service");
let CloseAuctionService = class CloseAuctionService {
    constructor(signalRepo, trendsService, dingtalkService) {
        this.signalRepo = signalRepo;
        this.trendsService = trendsService;
        this.dingtalkService = dingtalkService;
    }
    async evaluateBySymbol(symbol, market = 1) {
        await this.trendsService.syncTrendFromAPI(symbol, market, 1);
        const today = new Date();
        const startStr = (0, date_utils_1.formatToTrendDateTime)(today).slice(0, 10) + ' 09:30';
        const endStr = (0, date_utils_1.formatToTrendDateTime)(today);
        const { trends } = await this.trendsService.findAllTrends({
            code: symbol,
            startDatetime: startStr,
            endDatetime: endStr,
            limit: 1000,
        });
        if (trends.length === 0) {
            throw new Error(`未找到 ${symbol} 的今日分时数据`);
        }
        const minuteBars = trends
            .sort((a, b) => a.datetime.localeCompare(b.datetime))
            .map((t) => ({
            time: t.datetime.slice(11),
            open: t.price,
            high: t.price,
            low: t.price,
            close: t.price,
            volume: t.volume,
        }));
        return this.evaluate({
            symbol,
            tradeDate: startStr.slice(0, 10),
            minuteBars,
            componentStrength: 70,
        });
    }
    async evaluate(input) {
        const signalDto = (0, close_auction_strategy_1.evaluateCloseAuctionStrategy)(input);
        await this.sendSignalActionCard(signalDto);
        const lastBar = input.minuteBars.at(-1);
        const signalData = {
            strategyCode: signalDto.strategy,
            symbol: signalDto.symbol,
            tradeDate: input.tradeDate,
            allow: signalDto.allow ? 1 : 0,
            confidence: signalDto.confidence,
            reasons: signalDto.reasons,
            evalTime: new Date(),
            price: lastBar?.close,
            vwap: (0, vwap_util_1.calcVWAP)(input.minuteBars),
            volume: lastBar?.volume,
        };
        try {
            await this.signalRepo.upsert(signalData, [
                'strategyCode',
                'symbol',
                'tradeDate',
            ]);
        }
        catch (error) {
            console.error(`[CloseAuctionService] 保存/更新信号失败:`, error);
            throw error;
        }
        return signalDto;
    }
    async sendSignalActionCard(signal) {
        const title = `策略信号: ${signal.strategy}`;
        const status = signal.allow ? '✅【符合信号】' : '❌【不符合】';
        const text = `
### ${title}
---
- **标的代码**: ${signal.symbol}
- **判定结果**: ${status}
- **置信度**: ${signal.confidence}%
- **触发时间**: ${new Date(signal.evaluatedAt).toLocaleString('zh-CN', { hour12: false })}
- **原因列表**:
${signal.reasons.map((r) => `  - ${r}`).join('\n')}
`;
        try {
            await this.dingtalkService.sendActionCard({
                title,
                text,
                singleTitle: '查看详情',
            });
        }
        catch (error) {
            console.error('[CloseAuctionService] 发送钉钉 ActionCard 通知失败:', error);
        }
    }
};
exports.CloseAuctionService = CloseAuctionService;
exports.CloseAuctionService = CloseAuctionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(strategy_signal_entity_1.StrategySignal)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        trends_service_1.TrendsService,
        dingtalk_service_1.DingtalkService])
], CloseAuctionService);
//# sourceMappingURL=close-auction.service.js.map