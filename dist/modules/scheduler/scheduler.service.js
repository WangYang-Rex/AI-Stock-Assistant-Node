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
var SchedulerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulerService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const stock_service_1 = require("../market/stock/stock.service");
const trends_service_1 = require("../market/trends/trends.service");
const close_auction_service_1 = require("../strategies/close-auction/close-auction.service");
let SchedulerService = SchedulerService_1 = class SchedulerService {
    constructor(stockService, trendsService, closeAuctionService) {
        this.stockService = stockService;
        this.trendsService = trendsService;
        this.closeAuctionService = closeAuctionService;
        this.logger = new common_1.Logger(SchedulerService_1.name);
    }
    async handleWeekdayStockSync() {
        this.logger.log('开始执行工作日股票数据同步任务...');
        try {
            const stocks = await this.stockService.findAll();
            if (stocks.length === 0) {
                this.logger.warn('没有找到股票数据，跳过同步任务');
                return;
            }
            this.logger.log(`找到 ${stocks.length} 只股票，开始同步数据...`);
            let successCount = 0;
            let errorCount = 0;
            for (const stock of stocks) {
                try {
                    await this.stockService.syncStockFromAPI(stock.code, stock.market);
                    successCount++;
                    this.logger.debug(`成功同步股票: ${stock.code} - ${stock.name}`);
                }
                catch (error) {
                    errorCount++;
                    this.logger.error(`同步股票失败: ${stock.code} - ${stock.name}`, error);
                }
            }
            this.logger.log(`工作日股票数据同步任务完成 - 成功: ${successCount}, 失败: ${errorCount}`);
        }
        catch (error) {
            this.logger.error('工作日股票数据同步任务执行失败:', error);
        }
    }
    async handleWeekdayTrendSyncMorning() {
        this.logger.log('执行 11:40 分时数据同步任务...');
        await this.syncAllStocksIntradayTrends();
    }
    async handleWeekdayTrendSyncAfternoon() {
        this.logger.log('执行 15:10 分时数据同步任务...');
        await this.syncAllStocksIntradayTrends();
    }
    async syncAllStocksIntradayTrends() {
        this.logger.log('开始同步所有股票当日分时数据...');
        try {
            const stocks = await this.stockService.findAll();
            if (stocks.length === 0) {
                this.logger.warn('没有找到股票数据，跳过分时数据同步');
                return;
            }
            this.logger.log(`找到 ${stocks.length} 只股票，开始同步分时数据(ndays=1)...`);
            let successCount = 0;
            let errorCount = 0;
            let totalSyncedRecords = 0;
            for (const stock of stocks) {
                try {
                    const result = await this.trendsService.syncTrendFromAPI(stock.code, stock.market, 1);
                    if (result.synced > 0) {
                        successCount++;
                        totalSyncedRecords += result.synced;
                        this.logger.debug(`同步成功: ${stock.name}(${stock.code}) - ${result.synced}条记录`);
                    }
                    else {
                        this.logger.debug(`未获取到数据: ${stock.name}(${stock.code})`);
                    }
                }
                catch (error) {
                    errorCount++;
                    this.logger.error(`同步分时数据失败: ${stock.code} - ${stock.name}`, error);
                }
            }
            this.logger.log(`当日分时数据同步完成 - 成功股票数: ${successCount}, 失败股票数: ${errorCount}, 总新增/更新记录: ${totalSyncedRecords}`);
        }
        catch (error) {
            this.logger.error('分时数据同步任务执行全局异常:', error);
        }
    }
    async triggerManualSync() {
        this.logger.log('手动触发股票数据同步...');
        await this.handleWeekdayStockSync();
    }
    async triggerManualTrendSync() {
        this.logger.log('手动触发分时数据同步...');
        await this.syncAllStocksIntradayTrends();
    }
    getSchedulerStatus() {
        return {
            service: 'SchedulerService',
            status: 'running',
            schedules: [
                {
                    name: 'weekday-stock-sync',
                    cron: '0 30 9 * * 1-5',
                    description: '工作日股票基础数据同步',
                },
                {
                    name: 'weekday-trend-sync-morning',
                    cron: '0 40 11 * * 1-5',
                    description: '工作日午间分时数据同步',
                },
                {
                    name: 'weekday-trend-sync-afternoon',
                    cron: '0 10 15 * * 1-5',
                    description: '工作日收盘分时数据同步',
                },
                {
                    name: 'close-auction-strategy-check',
                    cron: '0 50 14 * * 1-5',
                    description: '尾盘战法每日 14:50 执行一次',
                },
            ],
        };
    }
    async handleCloseAuctionStrategyCheck() {
        const symbol = '588080';
        const market = 1;
        this.logger.log(`[尾盘战法] 开始执行检查: ${symbol}`);
        try {
            const result = await this.closeAuctionService.evaluateBySymbol(symbol, market);
            this.logger.log(`[尾盘战法] 评估完成: allow=${result.allow}, confidence=${result.confidence}, reasons=${result.reasons.join(',')}`);
        }
        catch (error) {
            this.logger.error('[尾盘战法] 自动任务执行失败:', error);
        }
    }
};
exports.SchedulerService = SchedulerService;
__decorate([
    (0, schedule_1.Cron)('0 30 9 * * 1-5', {
        name: 'weekday-stock-sync',
        timeZone: 'Asia/Shanghai',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SchedulerService.prototype, "handleWeekdayStockSync", null);
__decorate([
    (0, schedule_1.Cron)('0 40 11 * * 1-5', {
        name: 'weekday-trend-sync-morning',
        timeZone: 'Asia/Shanghai',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SchedulerService.prototype, "handleWeekdayTrendSyncMorning", null);
__decorate([
    (0, schedule_1.Cron)('0 10 15 * * 1-5', {
        name: 'weekday-trend-sync-afternoon',
        timeZone: 'Asia/Shanghai',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SchedulerService.prototype, "handleWeekdayTrendSyncAfternoon", null);
__decorate([
    (0, schedule_1.Cron)('0 50 14 * * 1-5', {
        name: 'close-auction-strategy-check',
        timeZone: 'Asia/Shanghai',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SchedulerService.prototype, "handleCloseAuctionStrategyCheck", null);
exports.SchedulerService = SchedulerService = SchedulerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [stock_service_1.StockService,
        trends_service_1.TrendsService,
        close_auction_service_1.CloseAuctionService])
], SchedulerService);
//# sourceMappingURL=scheduler.service.js.map