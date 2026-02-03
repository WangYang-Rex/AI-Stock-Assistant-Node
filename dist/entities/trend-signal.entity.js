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
exports.TrendSignal = void 0;
const typeorm_1 = require("typeorm");
let TrendSignal = class TrendSignal {
};
exports.TrendSignal = TrendSignal;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], TrendSignal.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 10, comment: '股票代码' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], TrendSignal.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'trade_date',
        type: 'varchar',
        length: 20,
        comment: '交易日',
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], TrendSignal.prototype, "tradeDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['UP', 'DOWN', 'SIDEWAYS'],
        comment: '趋势方向',
    }),
    __metadata("design:type", String)
], TrendSignal.prototype, "trend", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', comment: '趋势评分(-100~100)' }),
    __metadata("design:type", Number)
], TrendSignal.prototype, "score", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['WEAK', 'MEDIUM', 'STRONG'],
        comment: '趋势强度',
    }),
    __metadata("design:type", String)
], TrendSignal.prototype, "strength", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 10,
        scale: 4,
        nullable: true,
        comment: 'MA5',
    }),
    __metadata("design:type", Number)
], TrendSignal.prototype, "ma5", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 10,
        scale: 4,
        nullable: true,
        comment: 'MA10',
    }),
    __metadata("design:type", Number)
], TrendSignal.prototype, "ma10", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 10,
        scale: 4,
        nullable: true,
        comment: 'MA20',
    }),
    __metadata("design:type", Number)
], TrendSignal.prototype, "ma20", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 10,
        scale: 4,
        nullable: true,
        comment: 'MA60',
    }),
    __metadata("design:type", Number)
], TrendSignal.prototype, "ma60", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 10,
        scale: 4,
        nullable: true,
        comment: 'EMA20',
    }),
    __metadata("design:type", Number)
], TrendSignal.prototype, "ema20", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 10,
        scale: 6,
        nullable: true,
        comment: 'EMA20斜率',
    }),
    __metadata("design:type", Number)
], TrendSignal.prototype, "ema20Slope", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 10,
        scale: 6,
        nullable: true,
        comment: 'MACD DIF',
    }),
    __metadata("design:type", Number)
], TrendSignal.prototype, "macdDif", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 10,
        scale: 6,
        nullable: true,
        comment: 'MACD DEA',
    }),
    __metadata("design:type", Number)
], TrendSignal.prototype, "macdDea", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 10,
        scale: 6,
        nullable: true,
        comment: 'MACD柱',
    }),
    __metadata("design:type", Number)
], TrendSignal.prototype, "macdHist", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 6,
        scale: 2,
        nullable: true,
        comment: 'RSI14',
    }),
    __metadata("design:type", Number)
], TrendSignal.prototype, "rsi14", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 10,
        scale: 4,
        nullable: true,
        comment: '当前价格',
    }),
    __metadata("design:type", Number)
], TrendSignal.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 6,
        scale: 2,
        nullable: true,
        comment: '量比',
    }),
    __metadata("design:type", Number)
], TrendSignal.prototype, "volumeRatio", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true, comment: '趋势判断原因' }),
    __metadata("design:type", Array)
], TrendSignal.prototype, "reasons", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], TrendSignal.prototype, "createdAt", void 0);
exports.TrendSignal = TrendSignal = __decorate([
    (0, typeorm_1.Entity)('trend_signals'),
    (0, typeorm_1.Unique)(['code', 'tradeDate'])
], TrendSignal);
//# sourceMappingURL=trend-signal.entity.js.map