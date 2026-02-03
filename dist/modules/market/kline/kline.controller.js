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
exports.KlineController = void 0;
const common_1 = require("@nestjs/common");
const kline_service_1 = require("./kline.service");
const response_service_1 = require("../../../common/services/response.service");
let KlineController = class KlineController {
    constructor(klineService, responseService) {
        this.klineService = klineService;
        this.responseService = responseService;
    }
    async syncKlines(body) {
        return this.responseService.handleAsync(() => this.klineService.syncKlineData({
            code: body.code,
            period: body.period,
            fqType: body.fqType,
            limit: body.limit,
            startDate: body.startDate,
            endDate: body.endDate,
        }), 'K线数据同步成功', 'K线数据同步失败');
    }
    async listKlines(body) {
        return this.responseService.handleAsync(() => this.klineService.findKlines(body), 'K线数据查询成功', 'K线数据查询失败');
    }
    async getKlineStats(body) {
        return this.responseService.handleAsync(() => this.klineService.getKlineStats(body.code, body.period), 'K线统计信息获取成功', 'K线统计信息获取失败');
    }
};
exports.KlineController = KlineController;
__decorate([
    (0, common_1.Post)('sync'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], KlineController.prototype, "syncKlines", null);
__decorate([
    (0, common_1.Post)('list'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], KlineController.prototype, "listKlines", null);
__decorate([
    (0, common_1.Post)('stats'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], KlineController.prototype, "getKlineStats", null);
exports.KlineController = KlineController = __decorate([
    (0, common_1.Controller)('klines'),
    __metadata("design:paramtypes", [kline_service_1.KlineService,
        response_service_1.ResponseService])
], KlineController);
//# sourceMappingURL=kline.controller.js.map