import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { StockService } from '../market/stock/stock.service';
import { TrendsService } from '../market/trends/trends.service';
import { CloseAuctionService } from '../strategies/close-auction/close-auction.service';
import { formatToTrendDateTime } from '../../common/utils/date.utils';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly stockService: StockService,
    private readonly trendsService: TrendsService,
    private readonly closeAuctionService: CloseAuctionService,
  ) {}

  // 每周工作日早上9:30执行股票数据同步（北京时间）
  @Cron('0 30 9 * * 1-5', {
    name: 'weekday-stock-sync',
    timeZone: 'Asia/Shanghai',
  })
  async handleWeekdayStockSync() {
    this.logger.log('开始执行工作日股票数据同步任务...');

    try {
      // 获取所有股票列表
      const stocks = await this.stockService.findAll();

      if (stocks.length === 0) {
        this.logger.warn('没有找到股票数据，跳过同步任务');
        return;
      }

      this.logger.log(`找到 ${stocks.length} 只股票，开始同步数据...`);

      let successCount = 0;
      let errorCount = 0;

      // 批量同步股票数据
      for (const stock of stocks) {
        try {
          await this.stockService.syncStockFromAPI(stock.code, stock.market);
          successCount++;
          this.logger.debug(`成功同步股票: ${stock.code} - ${stock.name}`);
        } catch (error) {
          errorCount++;
          this.logger.error(
            `同步股票失败: ${stock.code} - ${stock.name}`,
            error,
          );
        }
      }

      this.logger.log(
        `工作日股票数据同步任务完成 - 成功: ${successCount}, 失败: ${errorCount}`,
      );
    } catch (error) {
      this.logger.error('工作日股票数据同步任务执行失败:', error);
    }
  }

  // 工作日 11:40 同步分时数据
  @Cron('0 40 11 * * 1-5', {
    name: 'weekday-trend-sync-morning',
    timeZone: 'Asia/Shanghai',
  })
  async handleWeekdayTrendSyncMorning() {
    this.logger.log('执行 11:40 分时数据同步任务...');
    await this.syncAllStocksIntradayTrends();
  }

  // 工作日 15:10 同步分时数据
  @Cron('0 10 15 * * 1-5', {
    name: 'weekday-trend-sync-afternoon',
    timeZone: 'Asia/Shanghai',
  })
  async handleWeekdayTrendSyncAfternoon() {
    this.logger.log('执行 15:10 分时数据同步任务...');
    await this.syncAllStocksIntradayTrends();
  }

  /**
   * 同步所有股票的当日分时数据
   */
  private async syncAllStocksIntradayTrends() {
    this.logger.log('开始同步所有股票当日分时数据...');
    try {
      const stocks = await this.stockService.findAll();

      if (stocks.length === 0) {
        this.logger.warn('没有找到股票数据，跳过分时数据同步');
        return;
      }

      this.logger.log(
        `找到 ${stocks.length} 只股票，开始同步分时数据(ndays=1)...`,
      );

      let successCount = 0;
      let errorCount = 0;
      let totalSyncedRecords = 0;

      // 批量同步，可以考虑并发或者分批处理，目前保持串行防止请求过快封IP
      // 如果股票数量很大，建议增加延时或并发控制
      for (const stock of stocks) {
        try {
          const result = await this.trendsService.syncTrendFromAPI(
            stock.code,
            stock.market,
            1, // ndays = 1
          );

          if (result.synced > 0) {
            successCount++;
            totalSyncedRecords += result.synced;
            this.logger.debug(
              `同步成功: ${stock.name}(${stock.code}) - ${result.synced}条记录`,
            );
          } else {
            // 可能是停牌或者没有数据
            this.logger.debug(`未获取到数据: ${stock.name}(${stock.code})`);
          }
        } catch (error) {
          errorCount++;
          this.logger.error(
            `同步分时数据失败: ${stock.code} - ${stock.name}`,
            error,
          );
        }
      }

      this.logger.log(
        `当日分时数据同步完成 - 成功股票数: ${successCount}, 失败股票数: ${errorCount}, 总新增/更新记录: ${totalSyncedRecords}`,
      );
    } catch (error) {
      this.logger.error('分时数据同步任务执行全局异常:', error);
    }
  }

  // 手动触发股票数据同步（用于测试）
  async triggerManualSync() {
    this.logger.log('手动触发股票数据同步...');
    await this.handleWeekdayStockSync();
  }

  // 手动触发分时数据同步（用于测试）
  async triggerManualTrendSync() {
    this.logger.log('手动触发分时数据同步...');
    await this.syncAllStocksIntradayTrends();
  }

  // 获取定时任务状态
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
          cron: '0 35-50 14 * * 1-5',
          description: '尾盘战法自动执行任务',
        },
      ],
    };
  }

  /**
   * 尾盘战法自动执行任务
   * 每天 14:35 - 14:50 每分钟执行一次
   */
  @Cron('0 35-50 14 * * 1-5', {
    name: 'close-auction-strategy-check',
    timeZone: 'Asia/Shanghai',
  })
  async handleCloseAuctionStrategyCheck() {
    const symbol = '588080';
    const market = 1; // 上交所
    this.logger.log(`[尾盘战法] 开始执行检查: ${symbol}`);

    try {
      // 使用 Service 中封装好的方法：同步数据 -> 转换格式 -> 执行评估
      const result = await this.closeAuctionService.evaluateBySymbol(
        symbol,
        market,
      );

      this.logger.log(
        `[尾盘战法] 评估完成: allow=${result.allow}, confidence=${result.confidence}, reasons=${result.reasons.join(',')}`,
      );
    } catch (error) {
      this.logger.error('[尾盘战法] 自动任务执行失败:', error);
    }
  }
}
