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
var QuotesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuotesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const schedule_1 = require("@nestjs/schedule");
const quote_entity_1 = require("../../../entities/quote.entity");
const eastmoney_data_sdk_1 = require("eastmoney-data-sdk");
const stock_service_1 = require("../stock/stock.service");
let QuotesService = QuotesService_1 = class QuotesService {
    constructor(quoteRepository, stockService) {
        this.quoteRepository = quoteRepository;
        this.stockService = stockService;
        this.logger = new common_1.Logger(QuotesService_1.name);
    }
    async createQuote(createQuoteDto) {
        const quote = this.quoteRepository.create(createQuoteDto);
        return await this.quoteRepository.save(quote);
    }
    async createQuotes(createQuoteDtos) {
        const quotes = this.quoteRepository.create(createQuoteDtos);
        return await this.quoteRepository.save(quotes);
    }
    async syncStockQuotesFromAPI(stock) {
        try {
            const secid = `${stock.market}.${stock.code}`;
            this.logger.log(`📊 开始获取股票 ${stock.code} 的实时行情数据...`);
            const quoteData = await eastmoney_data_sdk_1.eastmoney.quote(secid);
            if (!quoteData) {
                this.logger.warn(`⚠️  股票 ${stock.code} 未获取到实时行情数据`);
                return false;
            }
            const { code, name, updateTime } = quoteData;
            this.logger.log(`✅ 获取实时行情成功: ${name}(${code}), 价格: ${quoteData.price}, 涨跌幅: ${quoteData.pct}%`);
            const quote = {
                code: code,
                name: name,
                price: quoteData.price,
                high: quoteData.high,
                low: quoteData.low,
                open: quoteData.open,
                preClose: quoteData.preClose,
                volume: quoteData.volume,
                amount: quoteData.amount,
                pct: quoteData.pct,
                change: quoteData.change,
                turnover: quoteData.turnover,
                totalMarketCap: quoteData.totalMarketCap,
                floatMarketCap: quoteData.floatMarketCap,
                pe: quoteData.pe,
                pb: quoteData.pb,
                updateTime: updateTime,
            };
            const existingQuote = await this.quoteRepository.findOne({
                where: {
                    code: stock.code,
                },
            });
            if (existingQuote) {
                this.logger.log(`📝 更新股票 ${stock.code} 的行情快照 (ID: ${existingQuote.id})...`);
                await this.quoteRepository.update(existingQuote.id, quote);
                this.logger.log(`✅ 行情快照更新成功`);
            }
            else {
                this.logger.log(`💾 创建股票 ${stock.code} 的首条行情快照...`);
                await this.createQuote(quote);
                this.logger.log(`✅ 行情快照创建成功`);
            }
            this.logger.log(`🔄 更新股票实时行情信息...`);
            await this.stockService.updateStockByCode(stock.code, {
                price: quote.price,
                pct: quote.pct,
                change: quote.change,
                volume: quote.volume,
                amount: quote.amount,
                turnover: quote.turnover,
                totalMarketCap: quote.totalMarketCap,
                floatMarketCap: quote.floatMarketCap,
            });
            this.logger.log(`✅ 股票信息更新成功: ${name}(${code}), 价格: ${quote.price}, 涨跌幅: ${quote.pct}%, 成交额: ${(quote.amount / 100000000).toFixed(2)}亿`);
            return true;
        }
        catch (error) {
            this.logger.error(`❌ 同步股票 ${stock.code} 实时行情快照失败:`, error instanceof Error ? error.stack : String(error));
            throw new Error(`同步实时行情快照失败: ${error instanceof Error ? error.message : error}`);
        }
    }
    async findAll(queryDto = {}) {
        const { code, startTime, endTime, page = 1, limit = 10 } = queryDto;
        const where = {};
        if (code) {
            where.code = code;
        }
        if (startTime && endTime) {
            where.updateTime = (0, typeorm_2.Between)(startTime, endTime);
        }
        else if (startTime) {
            where.updateTime = (0, typeorm_2.Between)(startTime, Math.floor(Date.now() / 1000));
        }
        const options = {
            where,
            order: { updateTime: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        };
        const [quotes, total] = await this.quoteRepository.findAndCount(options);
        return { quotes, total };
    }
    async findOne(id) {
        return await this.quoteRepository.findOne({ where: { id } });
    }
    async findLatestByCode(code) {
        return await this.quoteRepository.findOne({
            where: { code },
            order: { updateTime: 'DESC' },
        });
    }
    async update(id, updateQuoteDto) {
        await this.quoteRepository.update(id, updateQuoteDto);
        return await this.findOne(id);
    }
    async remove(id) {
        await this.quoteRepository.delete(id);
    }
    async getTopGainers(limit = 10) {
        return await this.quoteRepository.find({
            order: { pct: 'DESC' },
            take: limit,
        });
    }
    async getTopLosers(limit = 10) {
        return await this.quoteRepository.find({
            order: { pct: 'ASC' },
            take: limit,
        });
    }
    async getTopVolume(limit = 10) {
        return await this.quoteRepository.find({
            order: { volume: 'DESC' },
            take: limit,
        });
    }
    async syncAllStockQuotes() {
        try {
            const stocks = await this.stockService.findAll();
            if (stocks.length === 0) {
                this.logger.warn('没有找到股票数据，跳过同步任务');
                return;
            }
            this.logger.log(`找到 ${stocks.length} 只股票，开始同步快照数据...`);
            let successCount = 0;
            let errorCount = 0;
            for (const stock of stocks) {
                try {
                    const result = await this.syncStockQuotesFromAPI({
                        code: stock.code,
                        market: stock.market,
                    });
                    if (result) {
                        successCount++;
                        this.logger.debug(`成功同步股票快照: ${stock.code} - ${stock.name}`);
                    }
                    else {
                        errorCount++;
                        this.logger.warn(`同步股票快照失败: ${stock.code} - ${stock.name} (返回false)`);
                    }
                }
                catch (error) {
                    errorCount++;
                    this.logger.error(`同步股票快照异常: ${stock.code} - ${stock.name}`, error instanceof Error ? error.stack : String(error));
                }
            }
            this.logger.log(`股票快照同步任务完成 - 成功: ${successCount}, 失败: ${errorCount}`);
        }
        catch (error) {
            this.logger.error('股票快照同步任务执行失败:', error);
        }
    }
    async handleWeekdayNoonQuotesSync() {
        this.logger.log('开始执行工作日中午12点股票快照同步任务...');
        await this.syncAllStockQuotes();
    }
    async handleWeekdayAfternoonQuotesSync() {
        this.logger.log('开始执行工作日下午15点股票快照同步任务...');
        await this.syncAllStockQuotes();
    }
};
exports.QuotesService = QuotesService;
__decorate([
    (0, schedule_1.Cron)('0 0 12 * * 1-5', {
        name: 'weekday-noon-quotes-sync',
        timeZone: 'Asia/Shanghai',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], QuotesService.prototype, "handleWeekdayNoonQuotesSync", null);
__decorate([
    (0, schedule_1.Cron)('0 0 15 * * 1-5', {
        name: 'weekday-afternoon-quotes-sync',
        timeZone: 'Asia/Shanghai',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], QuotesService.prototype, "handleWeekdayAfternoonQuotesSync", null);
exports.QuotesService = QuotesService = QuotesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(quote_entity_1.Quote)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        stock_service_1.StockService])
], QuotesService);
//# sourceMappingURL=quotes.service.js.map