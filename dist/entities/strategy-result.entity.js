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
exports.StrategyResult = void 0;
const typeorm_1 = require("typeorm");
const strategy_signal_entity_1 = require("./strategy-signal.entity");
let StrategyResult = class StrategyResult {
};
exports.StrategyResult = StrategyResult;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ comment: '结果ID' }),
    __metadata("design:type", Number)
], StrategyResult.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => strategy_signal_entity_1.StrategySignal),
    (0, typeorm_1.JoinColumn)({ name: 'signal_id' }),
    __metadata("design:type", strategy_signal_entity_1.StrategySignal)
], StrategyResult.prototype, "signal", void 0);
__decorate([
    (0, typeorm_1.RelationId)((result) => result.signal),
    (0, typeorm_1.Column)({ name: 'signal_id', comment: '关联策略信号ID' }),
    __metadata("design:type", Number)
], StrategyResult.prototype, "signalId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, comment: '标的代码' }),
    __metadata("design:type", String)
], StrategyResult.prototype, "symbol", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'buy_price',
        type: 'decimal',
        precision: 10,
        scale: 4,
        nullable: true,
        comment: '假设买入价（尾盘）',
    }),
    __metadata("design:type", Number)
], StrategyResult.prototype, "buyPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'sell_price',
        type: 'decimal',
        precision: 10,
        scale: 4,
        nullable: true,
        comment: '卖出价（次日）',
    }),
    __metadata("design:type", Number)
], StrategyResult.prototype, "sellPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'sell_time',
        type: 'datetime',
        nullable: true,
        comment: '卖出时间（如次日09:35）',
    }),
    __metadata("design:type", Date)
], StrategyResult.prototype, "sellTime", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'return_pct',
        type: 'decimal',
        precision: 8,
        scale: 4,
        nullable: true,
        comment: '收益率 %',
    }),
    __metadata("design:type", Number)
], StrategyResult.prototype, "returnPct", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'max_gain_pct',
        type: 'decimal',
        precision: 8,
        scale: 4,
        nullable: true,
        comment: '次日最大浮盈 %',
    }),
    __metadata("design:type", Number)
], StrategyResult.prototype, "maxGainPct", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'max_drawdown_pct',
        type: 'decimal',
        precision: 8,
        scale: 4,
        nullable: true,
        comment: '次日最大回撤 %',
    }),
    __metadata("design:type", Number)
], StrategyResult.prototype, "maxDrawdownPct", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'tinyint', nullable: true, comment: '是否盈利' }),
    __metadata("design:type", Number)
], StrategyResult.prototype, "win", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], StrategyResult.prototype, "createdAt", void 0);
exports.StrategyResult = StrategyResult = __decorate([
    (0, typeorm_1.Entity)('strategy_result')
], StrategyResult);
//# sourceMappingURL=strategy-result.entity.js.map