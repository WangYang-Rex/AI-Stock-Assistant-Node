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
exports.StrategiesController = void 0;
const common_1 = require("@nestjs/common");
const strategies_service_1 = require("./strategies.service");
const query_signal_dto_1 = require("./dto/query-signal.dto");
const latest_signal_dto_1 = require("./dto/latest-signal.dto");
let StrategiesController = class StrategiesController {
    constructor(aggregateService) {
        this.aggregateService = aggregateService;
    }
    async getDetail(id) {
        return this.aggregateService.getStrategyDetail(id);
    }
    async querySignals(query) {
        return this.aggregateService.querySignals(query);
    }
    async getLatestSignals(dto) {
        return this.aggregateService.getLatestSignals(dto);
    }
    async getSignalById(id) {
        return this.aggregateService.getSignalById(id);
    }
};
exports.StrategiesController = StrategiesController;
__decorate([
    (0, common_1.Post)('detail'),
    __param(0, (0, common_1.Body)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], StrategiesController.prototype, "getDetail", null);
__decorate([
    (0, common_1.Post)('signals/query'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_signal_dto_1.QuerySignalDto]),
    __metadata("design:returntype", Promise)
], StrategiesController.prototype, "querySignals", null);
__decorate([
    (0, common_1.Post)('signals/latest'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [latest_signal_dto_1.LatestSignalDto]),
    __metadata("design:returntype", Promise)
], StrategiesController.prototype, "getLatestSignals", null);
__decorate([
    (0, common_1.Post)('signals/detail'),
    __param(0, (0, common_1.Body)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], StrategiesController.prototype, "getSignalById", null);
exports.StrategiesController = StrategiesController = __decorate([
    (0, common_1.Controller)('strategies'),
    __metadata("design:paramtypes", [strategies_service_1.StrategyAggregateService])
], StrategiesController);
//# sourceMappingURL=strategies.controller.js.map