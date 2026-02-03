"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketModule = void 0;
const common_1 = require("@nestjs/common");
const stock_module_1 = require("./stock/stock.module");
const quotes_module_1 = require("./quotes/quotes.module");
const kline_module_1 = require("./kline/kline.module");
const trends_module_1 = require("./trends/trends.module");
const trading_module_1 = require("./trading/trading.module");
let MarketModule = class MarketModule {
};
exports.MarketModule = MarketModule;
exports.MarketModule = MarketModule = __decorate([
    (0, common_1.Module)({
        imports: [
            stock_module_1.StockModule,
            quotes_module_1.QuotesModule,
            kline_module_1.KlineModule,
            trends_module_1.TrendsModule,
            trading_module_1.TradingModule,
        ],
        exports: [
            stock_module_1.StockModule,
            quotes_module_1.QuotesModule,
            kline_module_1.KlineModule,
            trends_module_1.TrendsModule,
            trading_module_1.TradingModule,
        ],
    })
], MarketModule);
//# sourceMappingURL=market.module.js.map