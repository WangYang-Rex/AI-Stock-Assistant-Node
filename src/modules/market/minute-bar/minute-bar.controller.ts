import { Controller, Post, Body } from '@nestjs/common';
import { MinuteBarService, MinuteBarQueryDto } from './minute-bar.service';

@Controller('market/minute-bar')
export class MinuteBarController {
  constructor(private readonly minuteBarService: MinuteBarService) {}

  /**
   * 同步单只股票的当日分钟 K 线
   */
  @Post('sync-from-api')
  async syncFromAPI(
    @Body('code') code: string,
    @Body('market') market: number,
  ) {
    return await this.minuteBarService.syncMinuteBarsFromAPI(code, market);
  }

  /**
   * 同步所有股票的当日分钟 K 线
   */
  @Post('sync-all-stocks')
  async syncAllStocks() {
    return await this.minuteBarService.syncAllStocksMinuteBars();
  }

  /**
   * 获取分钟 K 线列表
   */
  @Post('list')
  async findMinuteBars(@Body() queryDto: MinuteBarQueryDto) {
    return await this.minuteBarService.findMinuteBars(queryDto);
  }

  /**
   * 按日期清理分钟 K 线
   */
  @Post('clear')
  async clearMinuteBars(
    @Body('code') code: string,
    @Body('date') date: string,
  ) {
    await this.minuteBarService.clearMinuteBars(code, date);
    return { success: true };
  }
}
