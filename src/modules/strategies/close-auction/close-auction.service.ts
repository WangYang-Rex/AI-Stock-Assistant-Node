import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EvaluateCloseAuctionDto } from './dto/evaluate-close-auction.dto';
import { evaluateCloseAuctionStrategy } from './close-auction.strategy';
import { StrategySignal } from '../../../entities/strategy-signal.entity';
import { calcVWAP } from './utils/vwap.util';
import { TrendsService } from '../../market/trends/trends.service';
import { formatToTrendDateTime } from '../../../common/utils/date.utils';
import { DingtalkService } from '../../../common/services/dingtalk.service';
import { StrategySignalDto } from './dto/strategy-signal.dto';

@Injectable()
export class CloseAuctionService {
  constructor(
    @InjectRepository(StrategySignal)
    private readonly signalRepo: Repository<StrategySignal>,
    private readonly trendsService: TrendsService,
    private readonly dingtalkService: DingtalkService,
  ) {}

  /**
   * 根据股票代码自动获取数据并评估
   * @param symbol 股票代码
   * @param market 市场代码 (1-上海, 0-深圳)
   */
  async evaluateBySymbol(symbol: string, market: number = 1) {
    // 1. 同步最新分时数据
    await this.trendsService.syncTrendFromAPI(symbol, market, 1);

    // 2. 获取今日所有分时数据
    const today = new Date();
    const startStr = formatToTrendDateTime(today).slice(0, 10) + ' 09:30';
    const endStr = formatToTrendDateTime(today);

    const { trends } = await this.trendsService.findAllTrends({
      code: symbol,
      startDatetime: startStr,
      endDatetime: endStr,
      limit: 1000,
    });

    if (trends.length === 0) {
      throw new Error(`未找到 ${symbol} 的今日分时数据`);
    }

    // 3. 转换为策略需要的格式
    const minuteBars = trends
      .sort((a, b) => a.datetime.localeCompare(b.datetime))
      .map((t) => ({
        time: t.datetime.slice(11), // 'HH:mm'
        open: t.price,
        high: t.price,
        low: t.price,
        close: t.price,
        volume: t.volume,
      }));

    // 4. 执行评估
    return this.evaluate({
      symbol,
      tradeDate: startStr.slice(0, 10),
      minuteBars,
      componentStrength: 70, // 默认强度
    });
  }

  async evaluate(input: EvaluateCloseAuctionDto) {
    const signalDto: StrategySignalDto = evaluateCloseAuctionStrategy(input);

    // 发送钉钉 ActionCard 通知
    await this.sendSignalActionCard(signalDto);

    const lastBar = input.minuteBars.at(-1);
    const signalData: Partial<StrategySignal> = {
      strategyCode: signalDto.strategy,
      symbol: signalDto.symbol,
      tradeDate: input.tradeDate,
      allow: signalDto.allow ? 1 : 0,
      confidence: signalDto.confidence,
      reasons: signalDto.reasons,
      evalTime: new Date(),
      price: lastBar?.close,
      vwap: calcVWAP(input.minuteBars),
      volume: lastBar?.volume,
    };

    try {
      // 使用 UPSERT 逻辑，避免唯一索引冲突 (uk_strategy_day: strategyCode, symbol, tradeDate)
      await this.signalRepo.upsert(signalData, [
        'strategyCode',
        'symbol',
        'tradeDate',
      ]);
    } catch (error) {
      console.error(`[CloseAuctionService] 保存/更新信号失败:`, error);
      throw error;
    }

    return signalDto;
  }

  private async sendSignalActionCard(signal: StrategySignalDto) {
    const title = `策略信号: ${signal.strategy}`;
    const status = signal.allow ? '✅【符合信号】' : '❌【不符合】';

    const text = `
### ${title}
---
- **标的代码**: ${signal.symbol}
- **判定结果**: ${status}
- **置信度**: ${signal.confidence}%
- **触发时间**: ${new Date(signal.evaluatedAt).toLocaleString('zh-CN', { hour12: false })}
- **原因列表**:
${signal.reasons.map((r: string) => `  - ${r}`).join('\n')}
`;

    try {
      await this.dingtalkService.sendActionCard({
        title,
        text,
        singleTitle: '查看详情',
        // singleURL: `http://localhost:3000/api/strategies/close-auction/evaluate-by-symbol?symbol=${signal.symbol}`,
      });
    } catch (error) {
      console.error(
        '[CloseAuctionService] 发送钉钉 ActionCard 通知失败:',
        error,
      );
    }
  }
}
