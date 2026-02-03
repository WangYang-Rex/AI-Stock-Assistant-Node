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
var TrendsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrendsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const schedule_1 = require("@nestjs/schedule");
const trend_entity_1 = require("../../../entities/trend.entity");
const eastmoney_data_sdk_1 = require("eastmoney-data-sdk");
const date_utils_1 = require("../../../common/utils/date.utils");
let TrendsService = TrendsService_1 = class TrendsService {
    constructor(trendRepository) {
        this.trendRepository = trendRepository;
        this.logger = new common_1.Logger(TrendsService_1.name);
    }
    async createTrends(createTrendDtos) {
        const trends = this.trendRepository.create(createTrendDtos);
        return await this.trendRepository.save(trends);
    }
    async findAllTrends(queryDto = {}) {
        const { code, startDatetime, endDatetime, page = 1, limit = 10 } = queryDto;
        const where = {};
        if (code) {
            where.code = code;
        }
        if (startDatetime && endDatetime) {
            where.datetime = (0, typeorm_2.Between)(startDatetime, endDatetime);
        }
        const options = {
            where,
            order: { datetime: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        };
        const [trends, total] = await this.trendRepository.findAndCount(options);
        return { trends, total };
    }
    async removeTrendsByRange(code, startDatetime, endDatetime) {
        await this.trendRepository.delete({
            code,
            datetime: (0, typeorm_2.Between)(startDatetime, endDatetime),
        });
    }
    async syncTrendFromAPI(code, market, ndays = 1) {
        try {
            const secid = `${market}.${code}`;
            this.logger.log(`📊 开始获取股票 ${code} 的 ${ndays} 日分时数据...`);
            const trendResult = await eastmoney_data_sdk_1.eastmoney.trend({ secid, ndays });
            if (!trendResult || !trendResult.data || trendResult.data.length === 0) {
                this.logger.warn(`⚠️  股票 ${code} 未获取到分时数据`);
                return { synced: 0, total: 0, newAdded: 0 };
            }
            const { code: stockCode, name, data: trendData } = trendResult;
            const trends = trendData.map((trend) => ({
                code: stockCode,
                name: name,
                datetime: (0, date_utils_1.formatToTrendDateTime)(new Date(trend.datetime)),
                price: trend.price,
                avgPrice: trend.avgPrice,
                volume: trend.volume,
                amount: trend.amount,
                pct: trend.pct,
            }));
            if (trends.length === 0) {
                return { synced: 0, total: 0, newAdded: 0 };
            }
            const chunkSize = 500;
            for (let i = 0; i < trends.length; i += chunkSize) {
                const chunk = trends.slice(i, i + chunkSize);
                const values = chunk
                    .map((t) => `('${t.code}', '${t.name}', '${t.datetime}', ${t.price ?? 'NULL'}, ${t.avgPrice ?? 'NULL'}, ${t.volume ?? 'NULL'}, ${t.amount ?? 'NULL'}, ${t.pct ?? 'NULL'})`)
                    .join(',');
                const sql = `
          INSERT INTO trends (code, name, datetime, price, avgPrice, volume, amount, pct)
          VALUES ${values}
          ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            price = VALUES(price),
            avgPrice = VALUES(avgPrice),
            volume = VALUES(volume),
            amount = VALUES(amount),
            pct = VALUES(pct),
            updatedAt = CURRENT_TIMESTAMP
        `;
                await this.trendRepository.query(sql);
            }
            this.logger.log(`✅ 成功同步 ${trends.length} 条分时数据`);
            return {
                synced: trends.length,
                total: trends.length,
                newAdded: trends.length,
            };
        }
        catch (error) {
            this.logger.error(`❌ 同步股票 ${code} 分时数据失败:`, error instanceof Error ? error.stack : String(error));
            throw new Error(`同步分时数据失败: ${error instanceof Error ? error.message : error}`);
        }
    }
    async handleDailyCleanupOldTrends() {
        try {
            this.logger.log('🧹 开始执行分时数据清理任务...');
            const fifteenDaysAgo = new Date();
            fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
            const fifteenDaysAgoStr = (0, date_utils_1.formatToTrendDateTime)(fifteenDaysAgo);
            this.logger.log(`📅 清理时间节点: ${fifteenDaysAgoStr} (15天前)`);
            const result = await this.trendRepository.delete({
                datetime: (0, typeorm_2.LessThan)(fifteenDaysAgoStr),
            });
            this.logger.log(`✅ 分时数据清理完成 - 删除了 ${result.affected || 0} 条记录`);
        }
        catch (error) {
            this.logger.error('❌ 分时数据清理任务执行失败:', error instanceof Error ? error.stack : String(error));
        }
    }
};
exports.TrendsService = TrendsService;
__decorate([
    (0, schedule_1.Cron)('0 0 0 * * *', {
        name: 'daily-cleanup-old-trends',
        timeZone: 'Asia/Shanghai',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TrendsService.prototype, "handleDailyCleanupOldTrends", null);
exports.TrendsService = TrendsService = TrendsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(trend_entity_1.Trend)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TrendsService);
//# sourceMappingURL=trends.service.js.map