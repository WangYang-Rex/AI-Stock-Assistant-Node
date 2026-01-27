import { Controller, Get, Post } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';

@Controller('scheduler')
export class SchedulerController {
  constructor(private readonly schedulerService: SchedulerService) {}

  // 获取定时任务状态
  @Get('status')
  getStatus() {
    return this.schedulerService.getSchedulerStatus();
  }

  // 手动触发股票数据同步
  @Post('trigger-sync')
  async triggerSync() {
    await this.schedulerService.triggerManualSync();
    return {
      message: '股票数据同步任务已触发',
      timestamp: new Date().toISOString(),
    };
  }

  // 手动触发分时数据同步
  @Post('trigger-trend-sync')
  async triggerTrendSync() {
    await this.schedulerService.triggerManualTrendSync();
    return {
      message: '分时数据同步任务已触发',
      timestamp: new Date().toISOString(),
    };
  }
}
