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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuleTrendController = void 0;
const common_1 = require("@nestjs/common");
const rule_trend_service_1 = require("./rule-trend.service");
const evaluate_rule_trend_dto_1 = require("./dto/evaluate-rule-trend.dto");
let RuleTrendController = class RuleTrendController {
    constructor(ruleTrendService) {
        this.ruleTrendService = ruleTrendService;
    }
    async evaluate(body) {
        return await this.ruleTrendService.evaluateTrend(body.code);
    }
    async evaluateBatch(body) {
        return await this.ruleTrendService.evaluateAll(body.codes);
    }
};
exports.RuleTrendController = RuleTrendController;
__decorate([
    (0, common_1.Post)('evaluate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [evaluate_rule_trend_dto_1.EvaluateRuleTrendDto]),
    __metadata("design:returntype", Promise)
], RuleTrendController.prototype, "evaluate", null);
__decorate([
    (0, common_1.Post)('batch-evaluate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [evaluate_rule_trend_dto_1.EvaluateRuleTrendBatchDto]),
    __metadata("design:returntype", Promise)
], RuleTrendController.prototype, "evaluateBatch", null);
exports.RuleTrendController = RuleTrendController = __decorate([
    (0, common_1.Controller)('strategies/rule-trend'),
    __metadata("design:paramtypes", [rule_trend_service_1.RuleTrendService])
], RuleTrendController);
//# sourceMappingURL=rule-trend.controller.js.map