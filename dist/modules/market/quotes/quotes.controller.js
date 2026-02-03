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
exports.QuotesController = void 0;
const common_1 = require("@nestjs/common");
const quotes_service_1 = require("./quotes.service");
let QuotesController = class QuotesController {
    constructor(quotesService) {
        this.quotesService = quotesService;
    }
    async syncStockQuotesFromAPI(stock) {
        return await this.quotesService.syncStockQuotesFromAPI(stock);
    }
    async syncAllStockQuotes() {
        await this.quotesService.syncAllStockQuotes();
        return { message: '批量同步任务已启动，请查看日志了解同步进度' };
    }
    async findAll(queryDto) {
        return await this.quotesService.findAll(queryDto);
    }
    async findLatestByCode(code) {
        return await this.quotesService.findLatestByCode(code);
    }
    async remove(id) {
        await this.quotesService.remove(id);
    }
    async getTopGainers(limit) {
        return await this.quotesService.getTopGainers(limit);
    }
    async getTopLosers(limit) {
        return await this.quotesService.getTopLosers(limit);
    }
    async getTopVolume(limit) {
        return await this.quotesService.getTopVolume(limit);
    }
};
exports.QuotesController = QuotesController;
__decorate([
    (0, common_1.Post)('syncStockQuotesFromAPI'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], QuotesController.prototype, "syncStockQuotesFromAPI", null);
__decorate([
    (0, common_1.Post)('syncAllStockQuotes'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], QuotesController.prototype, "syncAllStockQuotes", null);
__decorate([
    (0, common_1.Post)('list'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], QuotesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)('latest'),
    __param(0, (0, common_1.Body)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], QuotesController.prototype, "findLatestByCode", null);
__decorate([
    (0, common_1.Post)('delete'),
    __param(0, (0, common_1.Body)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], QuotesController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('rankings-gainers'),
    __param(0, (0, common_1.Body)('limit', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], QuotesController.prototype, "getTopGainers", null);
__decorate([
    (0, common_1.Post)('rankings-losers'),
    __param(0, (0, common_1.Body)('limit', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], QuotesController.prototype, "getTopLosers", null);
__decorate([
    (0, common_1.Post)('rankings-volume'),
    __param(0, (0, common_1.Body)('limit', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], QuotesController.prototype, "getTopVolume", null);
exports.QuotesController = QuotesController = __decorate([
    (0, common_1.Controller)('quotes'),
    __metadata("design:paramtypes", [quotes_service_1.QuotesService])
], QuotesController);
//# sourceMappingURL=quotes.controller.js.map