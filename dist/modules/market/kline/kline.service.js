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
var KlineService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KlineService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const schedule_1 = require("@nestjs/schedule");
const stock_service_1 = require("../stock/stock.service");
const kline_entity_1 = require("../../../entities/kline.entity");
const eastmoney_data_sdk_1 = require("eastmoney-data-sdk");
let KlineService = KlineService_1 = class KlineService {
    constructor(klineRepository, stockService) {
        this.klineRepository = klineRepository;
        this.stockService = stockService;
        this.logger = new common_1.Logger(KlineService_1.name);
    }
    periodToNumber(period) {
        const periodMap = {
            daily: 101,
            weekly: 102,
            monthly: 103,
            '1min': 1,
            '5min': 5,
            '15min': 15,
            '30min': 30,
            '60min': 60,
        };
        return periodMap[period] || 101;
    }
    buildSecid(code) {
        return eastmoney_data_sdk_1.eastmoney.utils.buildSecid(code);
    }
    async fetchKlineFromApi(options) {
        const { code, period = 'daily', fqType = 1, limit = 1000, startDate, endDate, saveToDb = false, } = options;
        const secid = this.buildSecid(code);
        const periodNum = this.periodToNumber(period);
        let sdkKlines = [];
        try {
            switch (period) {
                case 'daily':
                    sdkKlines = await (0, eastmoney_data_sdk_1.getDailyKLine)(secid, limit, fqType);
                    break;
                case 'weekly':
                    sdkKlines = await (0, eastmoney_data_sdk_1.getWeeklyKLine)(secid, limit, fqType);
                    break;
                case 'monthly':
                    sdkKlines = await (0, eastmoney_data_sdk_1.getMonthlyKLine)(secid, limit, fqType);
                    break;
                case '1min':
                case '5min':
                case '15min':
                case '30min':
                case '60min':
                    const minutePeriod = parseInt(period.replace('min', ''));
                    sdkKlines = await (0, eastmoney_data_sdk_1.getMinuteKLine)(secid, minutePeriod, limit);
                    break;
                default:
                    sdkKlines = await (0, eastmoney_data_sdk_1.getKLine)({
                        secid,
                        klt: periodNum,
                        fqt: fqType,
                        limit,
                        startDate,
                        endDate,
                    });
            }
        }
        catch (error) {
            console.error(`获取K线数据失败 [${code}]:`, error);
            throw new Error(`获取K线数据失败: ${error.message}`);
        }
        let stockName = '';
        try {
            const quote = await eastmoney_data_sdk_1.eastmoney.quote(secid);
            stockName = quote?.name || '';
        }
        catch {
        }
        const klines = sdkKlines.map((item) => {
            const kline = new kline_entity_1.Kline();
            kline.code = code;
            kline.name = stockName;
            kline.period = periodNum;
            kline.date = item.date;
            kline.open = item.open;
            kline.close = item.close;
            kline.high = item.high;
            kline.low = item.low;
            kline.volume = item.volume;
            kline.amount = item.amount;
            kline.amplitude = item.amplitude;
            kline.pct = item.pct;
            kline.change = item.change;
            kline.turnover = item.turnover;
            kline.fqType = fqType;
            return kline;
        });
        if (saveToDb && klines.length > 0) {
            await this.klineRepository.save(klines);
        }
        return klines;
    }
    async syncKlineData(options) {
        const klines = await this.fetchKlineFromApi({
            ...options,
            saveToDb: false,
        });
        if (klines.length === 0) {
            return { synced: 0, total: 0 };
        }
        try {
            const chunkSize = 500;
            for (let i = 0; i < klines.length; i += chunkSize) {
                const chunk = klines.slice(i, i + chunkSize);
                const values = chunk
                    .map((k) => `('${k.code}', '${k.name.replace(/'/g, "''")}', ${k.period}, '${k.date}', ${k.open ?? 'NULL'}, ${k.close ?? 'NULL'}, ${k.high ?? 'NULL'}, ${k.low ?? 'NULL'}, ${k.volume ?? 'NULL'}, ${k.amount ?? 'NULL'}, ${k.amplitude ?? 'NULL'}, ${k.pct ?? 'NULL'}, ${k.change ?? 'NULL'}, ${k.turnover ?? 'NULL'}, ${k.fqType ?? 'NULL'})`)
                    .join(',');
                const sql = `
          INSERT INTO klines (code, name, period, date, open, close, high, low, volume, amount, amplitude, pct, \`change\`, turnover, fqType)
          VALUES ${values}
          ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            open = VALUES(open),
            close = VALUES(close),
            high = VALUES(high),
            low = VALUES(low),
            volume = VALUES(volume),
            amount = VALUES(amount),
            amplitude = VALUES(amplitude),
            pct = VALUES(pct),
            \`change\` = VALUES(\`change\`),
            turnover = VALUES(turnover),
            fqType = VALUES(fqType),
            updatedAt = CURRENT_TIMESTAMP
        `;
                await this.klineRepository.query(sql);
            }
            return { synced: klines.length, total: klines.length };
        }
        catch (error) {
            console.error(`❌ 批量同步K线数据失败:`, error);
            throw new Error(`批量同步K线数据失败: ${error.message}`);
        }
    }
    async findKlines(options) {
        const { code, period = 101, startDate, endDate, page = 1, limit = 100, orderBy = 'DESC', } = options;
        const queryBuilder = this.klineRepository
            .createQueryBuilder('kline')
            .where('kline.code = :code', { code })
            .andWhere('kline.period = :period', { period });
        if (startDate && endDate) {
            queryBuilder.andWhere('kline.date BETWEEN :startDate AND :endDate', {
                startDate,
                endDate,
            });
        }
        else if (startDate) {
            queryBuilder.andWhere('kline.date >= :startDate', {
                startDate,
            });
        }
        else if (endDate) {
            queryBuilder.andWhere('kline.date <= :endDate', {
                endDate,
            });
        }
        queryBuilder
            .orderBy('kline.date', orderBy)
            .skip((page - 1) * limit)
            .take(limit);
        const [data, total] = await queryBuilder.getManyAndCount();
        return { data, total, page, limit };
    }
    async getKlineStats(code, period = 101) {
        const stats = await this.klineRepository
            .createQueryBuilder('kline')
            .select('COUNT(*)', 'count')
            .addSelect('MIN(kline.date)', 'minDate')
            .addSelect('MAX(kline.date)', 'maxDate')
            .addSelect('AVG(kline.close)', 'avgClose')
            .addSelect('MAX(kline.high)', 'maxHigh')
            .addSelect('MIN(kline.low)', 'minLow')
            .addSelect('AVG(kline.volume)', 'avgVolume')
            .addSelect('SUM(kline.amount)', 'totalAmount')
            .where('kline.code = :code', { code })
            .andWhere('kline.period = :period', { period })
            .getRawOne();
        return stats;
    }
    async handleDailySyncAllStocksKlines() {
        try {
            this.logger.log('⏰ 开始执行每日所有股票 K 线数据同步任务...');
            const stocks = await this.stockService.findAll();
            this.logger.log(`📊 共需同步 ${stocks.length} 只股票`);
            let totalSynced = 0;
            for (const stock of stocks) {
                try {
                    const result = await this.syncKlineData({
                        code: stock.code,
                        period: 'daily',
                        fqType: 1,
                        limit: 1000,
                    });
                    totalSynced += result.synced;
                }
                catch (error) {
                    this.logger.error(`❌ 同步股票 ${stock.code} (${stock.name}) K 线数据失败: ${error.message}`);
                }
            }
            this.logger.log(`✅ 每日 K 线同步任务完成，共同步 ${totalSynced} 条数据`);
        }
        catch (error) {
            this.logger.error('❌ 执行每日 K 线同步任务失败:', error.stack);
        }
    }
};
exports.KlineService = KlineService;
__decorate([
    (0, schedule_1.Cron)('0 0 0 * * *', {
        name: 'daily-sync-all-stocks-klines',
        timeZone: 'Asia/Shanghai',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], KlineService.prototype, "handleDailySyncAllStocksKlines", null);
exports.KlineService = KlineService = KlineService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(kline_entity_1.Kline)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        stock_service_1.StockService])
], KlineService);
//# sourceMappingURL=kline.service.js.map