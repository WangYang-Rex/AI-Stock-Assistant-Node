import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { StrategySignal } from '../../entities/strategy-signal.entity';
import { StrategyResult } from '../../entities/strategy-result.entity';
import { Kline } from '../../entities/kline.entity';

@Injectable()
export class StrategyBacktestService {
  private readonly logger = new Logger(StrategyBacktestService.name);

  constructor(
    @InjectRepository(StrategySignal)
    private readonly signalRepo: Repository<StrategySignal>,
    @InjectRepository(StrategyResult)
    private readonly resultRepo: Repository<StrategyResult>,
    @InjectRepository(Kline)
    private readonly klineRepo: Repository<Kline>,
  ) {}

  /**
   * 自动归因结算：每日收盘后运行，计算前一日生成的信号的次日表现
   * 比如昨日 14:50 产生买入信号，今日 09:35 结算收益
   */
  async settleRecentSignals() {
    this.logger.log('开始执行策略信号归因结算...');

    // 1. 查找尚未结算且 'allow=1' 的信号
    // 简化逻辑：查找过去 2 天内的信号进行结算
    const signals = await this.signalRepo.find({
      where: { allow: 1 },
      order: { tradeDate: 'DESC' },
      take: 50,
    });

    for (const signal of signals) {
      // 检查是否已经存在结果
      const existingResult = await this.resultRepo.findOne({
        where: { signalId: signal.id },
      });
      if (existingResult && existingResult.sellPrice) continue;

      // 2. 获取次日的 K 线数据（简单结算：次日开盘卖出）
      const nextDayKline = await this.klineRepo.findOne({
        where: {
          code: signal.symbol,
          date: MoreThan(signal.tradeDate),
        },
        order: { date: 'ASC' },
      });

      if (!nextDayKline) {
        this.logger.debug(
          `信号 ${signal.id} (${signal.symbol}) 暂无次日行情，跳过`,
        );
        continue;
      }

      // 3. 计算收益率
      const buyPrice = Number(signal.price);
      const sellPrice = Number(nextDayKline.open); // 假设次日开盘卖出
      const returnPct = ((sellPrice - buyPrice) / buyPrice) * 100;

      // 4. 保存/更新结果
      const resultData = existingResult || new StrategyResult();
      resultData.signalId = signal.id;
      resultData.symbol = signal.symbol;
      resultData.buyPrice = buyPrice;
      resultData.sellPrice = sellPrice;
      resultData.sellTime = new Date(nextDayKline.date);
      resultData.returnPct = returnPct;
      resultData.win = returnPct > 0 ? 1 : 0;

      await this.resultRepo.save(resultData);
      this.logger.log(
        `信号 ${signal.id} 结算完成: 收益率 ${returnPct.toFixed(2)}%`,
      );
    }

    this.logger.log('策略信号归因结算结束');
  }
}
