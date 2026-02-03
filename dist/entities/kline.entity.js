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
exports.Kline = void 0;
const typeorm_1 = require("typeorm");
let Kline = class Kline {
};
exports.Kline = Kline;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Kline.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, comment: '股票代码' }),
    __metadata("design:type", String)
], Kline.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true, comment: '股票名称' }),
    __metadata("design:type", String)
], Kline.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 101, comment: 'K线周期' }),
    __metadata("design:type", Number)
], Kline.prototype, "period", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 20,
        comment: '日期时间（YYYY-MM-DD HH:mm:ss 格式或 YYYY-MM-DD）',
    }),
    __metadata("design:type", String)
], Kline.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 12,
        scale: 4,
        comment: '开盘价',
    }),
    __metadata("design:type", Number)
], Kline.prototype, "open", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 12,
        scale: 4,
        comment: '收盘价',
    }),
    __metadata("design:type", Number)
], Kline.prototype, "close", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 12,
        scale: 4,
        comment: '最高价',
    }),
    __metadata("design:type", Number)
], Kline.prototype, "high", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 12,
        scale: 4,
        comment: '最低价',
    }),
    __metadata("design:type", Number)
], Kline.prototype, "low", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'bigint',
        comment: '成交量(股)',
    }),
    __metadata("design:type", Number)
], Kline.prototype, "volume", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 20,
        scale: 4,
        comment: '成交额(元)',
    }),
    __metadata("design:type", Number)
], Kline.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 10,
        scale: 4,
        nullable: true,
        comment: '振幅(%)',
    }),
    __metadata("design:type", Number)
], Kline.prototype, "amplitude", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 10,
        scale: 4,
        nullable: true,
        comment: '涨跌幅(%)',
    }),
    __metadata("design:type", Number)
], Kline.prototype, "pct", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 12,
        scale: 4,
        nullable: true,
        comment: '涨跌额',
    }),
    __metadata("design:type", Number)
], Kline.prototype, "change", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 10,
        scale: 4,
        nullable: true,
        comment: '换手率(%)',
    }),
    __metadata("design:type", Number)
], Kline.prototype, "turnover", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1, comment: '复权类型' }),
    __metadata("design:type", Number)
], Kline.prototype, "fqType", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ comment: '创建时间' }),
    __metadata("design:type", Date)
], Kline.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ comment: '更新时间' }),
    __metadata("design:type", Date)
], Kline.prototype, "updatedAt", void 0);
exports.Kline = Kline = __decorate([
    (0, typeorm_1.Entity)('klines'),
    (0, typeorm_1.Index)(['code', 'date', 'period'], { unique: true }),
    (0, typeorm_1.Index)(['code']),
    (0, typeorm_1.Index)(['date'])
], Kline);
//# sourceMappingURL=kline.entity.js.map