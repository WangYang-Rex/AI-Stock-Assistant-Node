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
exports.Trend = void 0;
const typeorm_1 = require("typeorm");
let Trend = class Trend {
};
exports.Trend = Trend;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ comment: '主键ID' }),
    __metadata("design:type", Number)
], Trend.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, comment: '股票代码' }),
    __metadata("design:type", String)
], Trend.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, comment: '股票名称' }),
    __metadata("design:type", String)
], Trend.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 20,
        comment: '日期时间（YYYY-MM-DD HH:mm 格式）',
    }),
    __metadata("design:type", String)
], Trend.prototype, "datetime", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 18,
        scale: 4,
        nullable: true,
        comment: '当前价格',
        transformer: {
            to: (value) => value,
            from: (value) => (value ? parseFloat(value) : null),
        },
    }),
    __metadata("design:type", Number)
], Trend.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 18,
        scale: 4,
        nullable: true,
        comment: '均价',
        transformer: {
            to: (value) => value,
            from: (value) => (value ? parseFloat(value) : null),
        },
    }),
    __metadata("design:type", Number)
], Trend.prototype, "avgPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'bigint',
        nullable: true,
        comment: '成交量（股）',
        transformer: {
            to: (value) => value,
            from: (value) => (value ? parseInt(value, 10) : null),
        },
    }),
    __metadata("design:type", Number)
], Trend.prototype, "volume", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 20,
        scale: 4,
        nullable: true,
        comment: '成交额（元）',
        transformer: {
            to: (value) => value,
            from: (value) => (value ? parseFloat(value) : null),
        },
    }),
    __metadata("design:type", Number)
], Trend.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 10,
        scale: 4,
        nullable: true,
        comment: '涨跌幅（%）',
        transformer: {
            to: (value) => value,
            from: (value) => (value ? parseFloat(value) : null),
        },
    }),
    __metadata("design:type", Number)
], Trend.prototype, "pct", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ comment: '系统创建时间' }),
    __metadata("design:type", Date)
], Trend.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ comment: '系统更新时间' }),
    __metadata("design:type", Date)
], Trend.prototype, "updatedAt", void 0);
exports.Trend = Trend = __decorate([
    (0, typeorm_1.Entity)('trends'),
    (0, typeorm_1.Index)(['code', 'datetime'], { unique: true }),
    (0, typeorm_1.Index)(['code']),
    (0, typeorm_1.Index)(['datetime'])
], Trend);
//# sourceMappingURL=trend.entity.js.map