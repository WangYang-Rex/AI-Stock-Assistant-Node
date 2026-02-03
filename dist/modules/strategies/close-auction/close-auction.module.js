"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloseAuctionModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const close_auction_service_1 = require("./close-auction.service");
const close_auction_controller_1 = require("./close-auction.controller");
const strategy_signal_entity_1 = require("../../../entities/strategy-signal.entity");
const strategy_result_entity_1 = require("../../../entities/strategy-result.entity");
const strategy_entity_1 = require("../../../entities/strategy.entity");
const strategy_params_entity_1 = require("../../../entities/strategy-params.entity");
const strategy_metrics_entity_1 = require("../../../entities/strategy-metrics.entity");
const strategy_equity_curve_entity_1 = require("../../../entities/strategy-equity-curve.entity");
const trends_module_1 = require("../../market/trends/trends.module");
const common_module_1 = require("../../../common/common.module");
let CloseAuctionModule = class CloseAuctionModule {
};
exports.CloseAuctionModule = CloseAuctionModule;
exports.CloseAuctionModule = CloseAuctionModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                strategy_signal_entity_1.StrategySignal,
                strategy_result_entity_1.StrategyResult,
                strategy_entity_1.Strategy,
                strategy_params_entity_1.StrategyParams,
                strategy_metrics_entity_1.StrategyMetrics,
                strategy_equity_curve_entity_1.StrategyEquityCurve,
            ]),
            trends_module_1.TrendsModule,
            common_module_1.CommonModule,
        ],
        providers: [close_auction_service_1.CloseAuctionService],
        controllers: [close_auction_controller_1.CloseAuctionController],
        exports: [close_auction_service_1.CloseAuctionService],
    })
], CloseAuctionModule);
//# sourceMappingURL=close-auction.module.js.map