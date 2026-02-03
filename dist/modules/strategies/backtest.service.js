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
var StrategyBacktestService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StrategyBacktestService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const strategy_signal_entity_1 = require("../../entities/strategy-signal.entity");
const strategy_result_entity_1 = require("../../entities/strategy-result.entity");
const kline_entity_1 = require("../../entities/kline.entity");
let StrategyBacktestService = StrategyBacktestService_1 = class StrategyBacktestService {
    constructor(signalRepo, resultRepo, klineRepo) {
        this.signalRepo = signalRepo;
        this.resultRepo = resultRepo;
        this.klineRepo = klineRepo;
        this.logger = new common_1.Logger(StrategyBacktestService_1.name);
    }
    async settleRecentSignals() {
        this.logger.log('开始执行策略信号归因结算...');
        const signals = await this.signalRepo.find({
            where: { allow: 1 },
            order: { tradeDate: 'DESC' },
            take: 50,
        });
        for (const signal of signals) {
            const existingResult = await this.resultRepo.findOne({
                where: { signalId: signal.id },
            });
            if (existingResult && existingResult.sellPrice)
                continue;
            const nextDayKline = await this.klineRepo.findOne({
                where: {
                    code: signal.symbol,
                    date: (0, typeorm_2.MoreThan)(signal.tradeDate),
                },
                order: { date: 'ASC' },
            });
            if (!nextDayKline) {
                this.logger.debug(`信号 ${signal.id} (${signal.symbol}) 暂无次日行情，跳过`);
                continue;
            }
            const buyPrice = Number(signal.price);
            const sellPrice = Number(nextDayKline.open);
            const returnPct = ((sellPrice - buyPrice) / buyPrice) * 100;
            const resultData = existingResult || new strategy_result_entity_1.StrategyResult();
            resultData.signalId = signal.id;
            resultData.symbol = signal.symbol;
            resultData.buyPrice = buyPrice;
            resultData.sellPrice = sellPrice;
            resultData.sellTime = new Date(nextDayKline.date);
            resultData.returnPct = returnPct;
            resultData.win = returnPct > 0 ? 1 : 0;
            await this.resultRepo.save(resultData);
            this.logger.log(`信号 ${signal.id} 结算完成: 收益率 ${returnPct.toFixed(2)}%`);
        }
        this.logger.log('策略信号归因结算结束');
    }
};
exports.StrategyBacktestService = StrategyBacktestService;
exports.StrategyBacktestService = StrategyBacktestService = StrategyBacktestService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(strategy_signal_entity_1.StrategySignal)),
    __param(1, (0, typeorm_1.InjectRepository)(strategy_result_entity_1.StrategyResult)),
    __param(2, (0, typeorm_1.InjectRepository)(kline_entity_1.Kline)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], StrategyBacktestService);
//# sourceMappingURL=backtest.service.js.map