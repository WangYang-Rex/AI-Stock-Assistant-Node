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
Object.defineProperty(exports, "__esModule", { value: true });
exports.StrategyEquityCurve = void 0;
const typeorm_1 = require("typeorm");
const strategy_entity_1 = require("./strategy.entity");
let StrategyEquityCurve = class StrategyEquityCurve {
};
exports.StrategyEquityCurve = StrategyEquityCurve;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], StrategyEquityCurve.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => strategy_entity_1.Strategy),
    (0, typeorm_1.JoinColumn)({ name: 'strategy_id' }),
    __metadata("design:type", strategy_entity_1.Strategy)
], StrategyEquityCurve.prototype, "strategy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'strategy_id' }),
    __metadata("design:type", Number)
], StrategyEquityCurve.prototype, "strategyId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', comment: '日期' }),
    __metadata("design:type", String)
], StrategyEquityCurve.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 18,
        scale: 4,
        comment: '当日净值',
    }),
    __metadata("design:type", Number)
], StrategyEquityCurve.prototype, "equity", void 0);
exports.StrategyEquityCurve = StrategyEquityCurve = __decorate([
    (0, typeorm_1.Entity)('strategy_equity_curve'),
    (0, typeorm_1.Index)(['strategyId', 'date'], { unique: true })
], StrategyEquityCurve);
//# sourceMappingURL=strategy-equity-curve.entity.js.map