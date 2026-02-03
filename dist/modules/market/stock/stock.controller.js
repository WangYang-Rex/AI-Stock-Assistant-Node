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
exports.StockController = void 0;
const common_1 = require("@nestjs/common");
const stock_service_1 = require("./stock.service");
const response_service_1 = require("../../../common/services/response.service");
let StockController = class StockController {
    constructor(stockService, responseService) {
        this.stockService = stockService;
        this.responseService = responseService;
    }
    async syncStock(body) {
        return this.responseService.handleAsync(() => this.stockService.syncStockFromAPI(body.code, body.market), '股票信息同步成功', '股票信息同步失败');
    }
    async deleteStock(body) {
        return this.responseService.handleAsync(async () => {
            const success = await this.stockService.deleteStock(body.id);
            return { success };
        }, '股票删除成功', '股票删除失败');
    }
    async getAllStocks(filters) {
        return this.responseService.handleAsync(async () => {
            const { market, marketType } = filters;
            if (market !== undefined) {
                return await this.stockService.findByMarket(market);
            }
            if (marketType) {
                return await this.stockService.findByMarketType(marketType);
            }
            return await this.stockService.findAll();
        }, '股票列表获取成功', '股票列表获取失败');
    }
    async getStockByCode(body) {
        return this.responseService.handleAsync(async () => {
            const stock = await this.stockService.findByCode(body.code);
            if (!stock) {
                throw new Error('股票未找到');
            }
            return stock;
        }, '股票信息获取成功', '股票未找到');
    }
};
exports.StockController = StockController;
__decorate([
    (0, common_1.Post)('sync'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StockController.prototype, "syncStock", null);
__decorate([
    (0, common_1.Post)('delete'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StockController.prototype, "deleteStock", null);
__decorate([
    (0, common_1.Post)('list'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StockController.prototype, "getAllStocks", null);
__decorate([
    (0, common_1.Post)('get-by-code'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StockController.prototype, "getStockByCode", null);
exports.StockController = StockController = __decorate([
    (0, common_1.Controller)('stocks'),
    __metadata("design:paramtypes", [stock_service_1.StockService,
        response_service_1.ResponseService])
], StockController);
//# sourceMappingURL=stock.controller.js.map