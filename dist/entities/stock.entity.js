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
exports.Stock = void 0;
const typeorm_1 = require("typeorm");
let Stock = class Stock {
};
exports.Stock = Stock;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Stock.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, comment: '股票代码' }),
    __metadata("design:type", String)
], Stock.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, comment: '股票名称' }),
    __metadata("design:type", String)
], Stock.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', comment: '市场代码' }),
    __metadata("design:type", Number)
], Stock.prototype, "market", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, comment: '市场类型' }),
    __metadata("design:type", String)
], Stock.prototype, "marketType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 12,
        scale: 4,
        nullable: true,
        comment: '最新价',
    }),
    __metadata("design:type", Number)
], Stock.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 10,
        scale: 4,
        nullable: true,
        comment: '涨跌幅(%)',
    }),
    __metadata("design:type", Number)
], Stock.prototype, "pct", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 12,
        scale: 4,
        nullable: true,
        comment: '涨跌额',
    }),
    __metadata("design:type", Number)
], Stock.prototype, "change", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'bigint',
        nullable: true,
        comment: '成交量(股)',
    }),
    __metadata("design:type", Number)
], Stock.prototype, "volume", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 20,
        scale: 4,
        nullable: true,
        comment: '成交额(元)',
    }),
    __metadata("design:type", Number)
], Stock.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 20,
        scale: 4,
        nullable: true,
        comment: '总市值(元)',
    }),
    __metadata("design:type", Number)
], Stock.prototype, "totalMarketCap", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 20,
        scale: 4,
        nullable: true,
        comment: '流通市值(元)',
    }),
    __metadata("design:type", Number)
], Stock.prototype, "floatMarketCap", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 10,
        scale: 4,
        nullable: true,
        comment: '换手率(%)',
    }),
    __metadata("design:type", Number)
], Stock.prototype, "turnover", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ comment: '创建时间' }),
    __metadata("design:type", Date)
], Stock.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ comment: '更新时间' }),
    __metadata("design:type", Date)
], Stock.prototype, "updatedAt", void 0);
exports.Stock = Stock = __decorate([
    (0, typeorm_1.Entity)('stocks'),
    (0, typeorm_1.Index)(['code'], { unique: true }),
    (0, typeorm_1.Index)(['market'])
], Stock);
//# sourceMappingURL=stock.entity.js.map