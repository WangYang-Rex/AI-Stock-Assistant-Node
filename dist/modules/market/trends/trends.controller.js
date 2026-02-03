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
exports.TrendsController = void 0;
const common_1 = require("@nestjs/common");
const trends_service_1 = require("./trends.service");
const date_utils_1 = require("../../../common/utils/date.utils");
let TrendsController = class TrendsController {
    constructor(trendsService) {
        this.trendsService = trendsService;
    }
    async syncTrendFromAPI(code, market, ndays) {
        const validNdays = ndays === 5 ? 5 : 1;
        return await this.trendsService.syncTrendFromAPI(code, market, validNdays);
    }
    async findAllTrends(code, ndays, startDatetime, endDatetime, page, limit) {
        if (ndays) {
            const now = new Date();
            const start = new Date();
            start.setDate(now.getDate() - ndays);
            start.setHours(23, 59, 59, 999);
            startDatetime = (0, date_utils_1.formatToTrendDateTime)(start);
            endDatetime = (0, date_utils_1.formatToTrendDateTime)(now);
        }
        return await this.trendsService.findAllTrends({
            code,
            startDatetime,
            endDatetime,
            page,
            limit,
        });
    }
    async removeTrendsByRange(code, startDatetime, endDatetime) {
        await this.trendsService.removeTrendsByRange(code, startDatetime, endDatetime);
    }
};
exports.TrendsController = TrendsController;
__decorate([
    (0, common_1.Post)('sync-from-api'),
    __param(0, (0, common_1.Body)('code')),
    __param(1, (0, common_1.Body)('market')),
    __param(2, (0, common_1.Body)('ndays')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], TrendsController.prototype, "syncTrendFromAPI", null);
__decorate([
    (0, common_1.Post)('list'),
    __param(0, (0, common_1.Body)('code')),
    __param(1, (0, common_1.Body)('ndays')),
    __param(2, (0, common_1.Body)('startDatetime')),
    __param(3, (0, common_1.Body)('endDatetime')),
    __param(4, (0, common_1.Body)('page')),
    __param(5, (0, common_1.Body)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], TrendsController.prototype, "findAllTrends", null);
__decorate([
    (0, common_1.Post)('delete-range'),
    __param(0, (0, common_1.Body)('code')),
    __param(1, (0, common_1.Body)('startDatetime')),
    __param(2, (0, common_1.Body)('endDatetime')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], TrendsController.prototype, "removeTrendsByRange", null);
exports.TrendsController = TrendsController = __decorate([
    (0, common_1.Controller)('trends'),
    __metadata("design:paramtypes", [trends_service_1.TrendsService])
], TrendsController);
//# sourceMappingURL=trends.controller.js.map