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
exports.StrategySignal = void 0;
const typeorm_1 = require("typeorm");
let StrategySignal = class StrategySignal {
};
exports.StrategySignal = StrategySignal;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ comment: '策略信号ID' }),
    __metadata("design:type", Number)
], StrategySignal.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'strategy_code',
        length: 50,
        comment: '策略编码，如 CLOSE_AUCTION_T1',
    }),
    __metadata("design:type", String)
], StrategySignal.prototype, "strategyCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, comment: '标的代码，如 588080' }),
    __metadata("design:type", String)
], StrategySignal.prototype, "symbol", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'trade_date', type: 'date', comment: '信号所属交易日' }),
    __metadata("design:type", String)
], StrategySignal.prototype, "tradeDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'tinyint', comment: '是否允许交易 1是0否' }),
    __metadata("design:type", Number)
], StrategySignal.prototype, "allow", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: '信心分 0-100' }),
    __metadata("design:type", Number)
], StrategySignal.prototype, "confidence", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true, comment: '策略判断原因列表' }),
    __metadata("design:type", Array)
], StrategySignal.prototype, "reasons", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'eval_time',
        type: 'datetime',
        comment: '策略评估时间（如14:45）',
    }),
    __metadata("design:type", Date)
], StrategySignal.prototype, "evalTime", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 10,
        scale: 4,
        nullable: true,
        comment: '评估时价格',
    }),
    __metadata("design:type", Number)
], StrategySignal.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 10,
        scale: 4,
        nullable: true,
        comment: '当日VWAP',
    }),
    __metadata("design:type", Number)
], StrategySignal.prototype, "vwap", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true, comment: '当日成交量' }),
    __metadata("design:type", Number)
], StrategySignal.prototype, "volume", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'json',
        nullable: true,
        comment: '扩展字段（成分股强度、指数状态等）',
    }),
    __metadata("design:type", Object)
], StrategySignal.prototype, "extra", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], StrategySignal.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], StrategySignal.prototype, "updatedAt", void 0);
exports.StrategySignal = StrategySignal = __decorate([
    (0, typeorm_1.Entity)('strategy_signal'),
    (0, typeorm_1.Unique)('uk_strategy_day', ['strategyCode', 'symbol', 'tradeDate'])
], StrategySignal);
//# sourceMappingURL=strategy-signal.entity.js.map