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
exports.StrategyParams = void 0;
const typeorm_1 = require("typeorm");
const strategy_entity_1 = require("./strategy.entity");
let StrategyParams = class StrategyParams {
};
exports.StrategyParams = StrategyParams;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], StrategyParams.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => strategy_entity_1.Strategy),
    (0, typeorm_1.JoinColumn)({ name: 'strategy_id' }),
    __metadata("design:type", strategy_entity_1.Strategy)
], StrategyParams.prototype, "strategy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'strategy_id' }),
    __metadata("design:type", Number)
], StrategyParams.prototype, "strategyId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', comment: '策略参数详情' }),
    __metadata("design:type", Object)
], StrategyParams.prototype, "params", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], StrategyParams.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], StrategyParams.prototype, "updatedAt", void 0);
exports.StrategyParams = StrategyParams = __decorate([
    (0, typeorm_1.Entity)('strategy_params')
], StrategyParams);
//# sourceMappingURL=strategy-params.entity.js.map