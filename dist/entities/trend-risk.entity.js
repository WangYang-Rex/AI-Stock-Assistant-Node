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
exports.TrendRisk = void 0;
const typeorm_1 = require("typeorm");
let TrendRisk = class TrendRisk {
};
exports.TrendRisk = TrendRisk;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], TrendRisk.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 10, comment: '股票代码' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], TrendRisk.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'trade_date',
        type: 'varchar',
        length: 20,
        comment: '交易日',
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], TrendRisk.prototype, "tradeDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 4, comment: 'ATR14' }),
    __metadata("design:type", Number)
], TrendRisk.prototype, "atr14", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 4, comment: 'ATR止损价' }),
    __metadata("design:type", Number)
], TrendRisk.prototype, "stopPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 4, comment: 'MA10' }),
    __metadata("design:type", Number)
], TrendRisk.prototype, "ma10", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 4, comment: 'MA20' }),
    __metadata("design:type", Number)
], TrendRisk.prototype, "ma20", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', name: 'stop_triggered', comment: '是否触发止损' }),
    __metadata("design:type", Boolean)
], TrendRisk.prototype, "stopTriggered", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'stop_reason',
        length: 100,
        nullable: true,
        comment: '止损原因',
    }),
    __metadata("design:type", String)
], TrendRisk.prototype, "stopReason", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], TrendRisk.prototype, "createdAt", void 0);
exports.TrendRisk = TrendRisk = __decorate([
    (0, typeorm_1.Entity)('trend_risks'),
    (0, typeorm_1.Unique)(['code', 'tradeDate'])
], TrendRisk);
//# sourceMappingURL=trend-risk.entity.js.map