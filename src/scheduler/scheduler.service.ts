import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { StockService } from '../stock/stock.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(private readonly stockService: StockService) {}

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
          await this.stockService.syncStockFromAPI(
            stock.code,
            stock.marketCode,
          );
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

  // 手动触发股票数据同步（用于测试）
  async triggerManualSync() {
    this.logger.log('手动触发股票数据同步...');
    await this.handleWeekdayStockSync();
  }

  // 获取定时任务状态
  getSchedulerStatus() {
    return {
      service: 'SchedulerService',
      status: 'running',
      nextExecution: '每周工作日(周一到周五)上午9:30 (北京时间)',
      description: '工作日股票数据同步任务',
    };
  }
}
