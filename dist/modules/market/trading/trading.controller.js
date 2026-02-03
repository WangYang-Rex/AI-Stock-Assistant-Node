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
exports.TradingController = void 0;
const common_1 = require("@nestjs/common");
const trading_service_1 = require("./trading.service");
const response_service_1 = require("../../../common/services/response.service");
let TradingController = class TradingController {
    constructor(tradingService, responseService) {
        this.tradingService = tradingService;
        this.responseService = responseService;
    }
    async createTrading(tradingData) {
        return this.responseService.handleAsync(() => this.tradingService.createTrading(tradingData), '交易记录创建成功', '交易记录创建失败');
    }
    async updateTrading(body) {
        return await this.tradingService.updateTrading(body.id, body.updateData);
    }
    async deleteTrading(body) {
        const success = await this.tradingService.deleteTrading(body.id);
        return { success };
    }
    async getAllTrading() {
        return await this.tradingService.findAll();
    }
    async getTradingByCode(body) {
        return await this.tradingService.findByCode(body.code);
    }
    async getClosedTrades() {
        return await this.tradingService.findClosedTrades();
    }
    async getOpenTrades() {
        return await this.tradingService.findOpenTrades();
    }
    async getTradingStats(body) {
        const startTime = body.startTime ? new Date(body.startTime) : undefined;
        const endTime = body.endTime ? new Date(body.endTime) : undefined;
        return await this.tradingService.getTradingStats(body.code, startTime, endTime);
    }
    async cleanOldData(body) {
        const deletedCount = await this.tradingService.cleanOldData(body.daysToKeep || 365);
        return { deletedCount, message: `已清理 ${deletedCount} 条过期数据` };
    }
};
exports.TradingController = TradingController;
__decorate([
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TradingController.prototype, "createTrading", null);
__decorate([
    (0, common_1.Post)('update'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TradingController.prototype, "updateTrading", null);
__decorate([
    (0, common_1.Post)('delete'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TradingController.prototype, "deleteTrading", null);
__decorate([
    (0, common_1.Post)('list'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TradingController.prototype, "getAllTrading", null);
__decorate([
    (0, common_1.Post)('get-by-code'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TradingController.prototype, "getTradingByCode", null);
__decorate([
    (0, common_1.Post)('get-closed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TradingController.prototype, "getClosedTrades", null);
__decorate([
    (0, common_1.Post)('get-open'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TradingController.prototype, "getOpenTrades", null);
__decorate([
    (0, common_1.Post)('stats'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TradingController.prototype, "getTradingStats", null);
__decorate([
    (0, common_1.Post)('clean-old-data'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TradingController.prototype, "cleanOldData", null);
exports.TradingController = TradingController = __decorate([
    (0, common_1.Controller)('trading'),
    __metadata("design:paramtypes", [trading_service_1.TradingService,
        response_service_1.ResponseService])
], TradingController);
//# sourceMappingURL=trading.controller.js.map