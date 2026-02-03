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
exports.StrategyMetrics = void 0;
const typeorm_1 = require("typeorm");
const strategy_entity_1 = require("./strategy.entity");
let StrategyMetrics = class StrategyMetrics {
};
exports.StrategyMetrics = StrategyMetrics;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], StrategyMetrics.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => strategy_entity_1.Strategy),
    (0, typeorm_1.JoinColumn)({ name: 'strategy_id' }),
    __metadata("design:type", strategy_entity_1.Strategy)
], StrategyMetrics.prototype, "strategy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'strategy_id' }),
    __metadata("design:type", Number)
], StrategyMetrics.prototype, "strategyId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'total_return',
        type: 'decimal',
        precision: 10,
        scale: 4,
        default: 0,
        comment: '总收益率',
    }),
    __metadata("design:type", Number)
], StrategyMetrics.prototype, "totalReturn", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'annual_return',
        type: 'decimal',
        precision: 10,
        scale: 4,
        default: 0,
        comment: '年化收益率',
    }),
    __metadata("design:type", Number)
], StrategyMetrics.prototype, "annualReturn", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'max_drawdown',
        type: 'decimal',
        precision: 10,
        scale: 4,
        default: 0,
        comment: '最大回撤',
    }),
    __metadata("design:type", Number)
], StrategyMetrics.prototype, "maxDrawdown", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'win_rate',
        type: 'decimal',
        precision: 10,
        scale: 4,
        default: 0,
        comment: '胜率',
    }),
    __metadata("design:type", Number)
], StrategyMetrics.prototype, "winRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'trade_count', default: 0, comment: '交易总数' }),
    __metadata("design:type", Number)
], StrategyMetrics.prototype, "tradeCount", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], StrategyMetrics.prototype, "updatedAt", void 0);
exports.StrategyMetrics = StrategyMetrics = __decorate([
    (0, typeorm_1.Entity)('strategy_metrics')
], StrategyMetrics);
//# sourceMappingURL=strategy-metrics.entity.js.map