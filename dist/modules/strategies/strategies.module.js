"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StrategyModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const close_auction_module_1 = require("./close-auction/close-auction.module");
const rule_trend_module_1 = require("./rule-trend/rule-trend.module");
const strategies_service_1 = require("./strategies.service");
const backtest_service_1 = require("./backtest.service");
const strategies_controller_1 = require("./strategies.controller");
const strategy_entity_1 = require("../../entities/strategy.entity");
const strategy_params_entity_1 = require("../../entities/strategy-params.entity");
const strategy_metrics_entity_1 = require("../../entities/strategy-metrics.entity");
const strategy_equity_curve_entity_1 = require("../../entities/strategy-equity-curve.entity");
const strategy_signal_entity_1 = require("../../entities/strategy-signal.entity");
const strategy_result_entity_1 = require("../../entities/strategy-result.entity");
const kline_entity_1 = require("../../entities/kline.entity");
let StrategyModule = class StrategyModule {
};
exports.StrategyModule = StrategyModule;
exports.StrategyModule = StrategyModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                strategy_entity_1.Strategy,
                strategy_params_entity_1.StrategyParams,
                strategy_metrics_entity_1.StrategyMetrics,
                strategy_equity_curve_entity_1.StrategyEquityCurve,
                strategy_signal_entity_1.StrategySignal,
                strategy_result_entity_1.StrategyResult,
                kline_entity_1.Kline,
            ]),
            close_auction_module_1.CloseAuctionModule,
            rule_trend_module_1.RuleTrendModule,
        ],
        providers: [strategies_service_1.StrategyAggregateService, backtest_service_1.StrategyBacktestService],
        controllers: [strategies_controller_1.StrategiesController],
        exports: [strategies_service_1.StrategyAggregateService, backtest_service_1.StrategyBacktestService],
    })
], StrategyModule);
//# sourceMappingURL=strategies.module.js.map