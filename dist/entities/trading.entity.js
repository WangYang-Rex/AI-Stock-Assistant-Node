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
exports.Trading = void 0;
const typeorm_1 = require("typeorm");
let Trading = class Trading {
};
exports.Trading = Trading;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Trading.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, comment: '股票代码' }),
    __metadata("design:type", String)
], Trading.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true, comment: '股票名称' }),
    __metadata("design:type", String)
], Trading.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', comment: '买入日期' }),
    __metadata("design:type", Date)
], Trading.prototype, "buy_date", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 10,
        scale: 2,
        comment: '买入价格',
    }),
    __metadata("design:type", Number)
], Trading.prototype, "buy_price", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', comment: '买入数量' }),
    __metadata("design:type", Number)
], Trading.prototype, "buy_volume", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true, comment: '卖出日期' }),
    __metadata("design:type", Date)
], Trading.prototype, "sell_date", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 10,
        scale: 2,
        nullable: true,
        comment: '卖出价格',
    }),
    __metadata("design:type", Number)
], Trading.prototype, "sell_price", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true, comment: '卖出数量' }),
    __metadata("design:type", Number)
], Trading.prototype, "sell_volume", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 15,
        scale: 2,
        nullable: true,
        comment: '收益金额',
    }),
    __metadata("design:type", Number)
], Trading.prototype, "profit", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 10,
        scale: 4,
        nullable: true,
        comment: '收益率',
    }),
    __metadata("design:type", Number)
], Trading.prototype, "profit_rate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true, comment: '备注' }),
    __metadata("design:type", String)
], Trading.prototype, "remarks", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ comment: '创建时间' }),
    __metadata("design:type", Date)
], Trading.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ comment: '更新时间' }),
    __metadata("design:type", Date)
], Trading.prototype, "updatedAt", void 0);
exports.Trading = Trading = __decorate([
    (0, typeorm_1.Entity)('trading_records'),
    (0, typeorm_1.Index)(['code']),
    (0, typeorm_1.Index)(['buy_date']),
    (0, typeorm_1.Index)(['sell_date'])
], Trading);
//# sourceMappingURL=trading.entity.js.map