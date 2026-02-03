"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuleTrendModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const rule_trend_service_1 = require("./rule-trend.service");
const rule_trend_controller_1 = require("./rule-trend.controller");
const strategy_signal_entity_1 = require("../../../entities/strategy-signal.entity");
const trend_signal_entity_1 = require("../../../entities/trend-signal.entity");
const trend_risk_entity_1 = require("../../../entities/trend-risk.entity");
const trading_entity_1 = require("../../../entities/trading.entity");
const kline_module_1 = require("../../market/kline/kline.module");
let RuleTrendModule = class RuleTrendModule {
};
exports.RuleTrendModule = RuleTrendModule;
exports.RuleTrendModule = RuleTrendModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([strategy_signal_entity_1.StrategySignal, trend_signal_entity_1.TrendSignal, trend_risk_entity_1.TrendRisk, trading_entity_1.Trading]),
            kline_module_1.KlineModule,
        ],
        providers: [rule_trend_service_1.RuleTrendService],
        controllers: [rule_trend_controller_1.RuleTrendController],
        exports: [rule_trend_service_1.RuleTrendService],
    })
], RuleTrendModule);
//# sourceMappingURL=rule-trend.module.js.map