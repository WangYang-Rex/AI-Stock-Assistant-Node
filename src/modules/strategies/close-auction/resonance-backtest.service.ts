import { Injectable, Logger } from '@nestjs/common';
import {
  ResonanceIndicatorService,
  ResonanceScore,
} from './resonance-indicator.service';
import { KlineService } from '../../market/kline/kline.service';
import { Kline } from '../../../entities/kline.entity';
import { Trend } from '../../../entities/trend.entity';
import { TrendsService } from '../../market/trends/trends.service';
import { evaluateCloseAuctionStrategy } from './close-auction.strategy';
import { mapResonanceScoreToComponentStrength } from './resonance-strength.util';
import type { MinuteBar } from './dto/evaluate-close-auction.dto';

export interface BacktestResult {
  etfCode: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  bullishDays: number; // 向上共振天数 (score >= 70 && direction == 'UP')
  bearishDays: number; // 向下共振天数 (score >= 70 && direction == 'DOWN')
  hitRate: number; // 向上共振且次日最高价超过今日收盘价的概率
  avgOpenReturn: number; // 向上共振次日开盘平均收益
  avgMaxReturn: number; // 向上共振次日最高平均收益
  /** 当日库中存在 ETF 分时并成功执行 CLOSE_AUCTION_T1 评估的交易日数 */
  closeAuctionEvaluatedDays: number;
  /** 其中 allow === true 的天数（与实盘 evaluateCloseAuctionStrategy 一致） */
  closeAuctionAllowDays: number;
  details: BacktestDayDetail[];
}

export interface BacktestDayDetail {
  date: string;
  resonance: ResonanceScore;
  /**
   * 与实盘同一套 evaluateCloseAuctionStrategy；库中无当日分时则为 null。
   */
  closeAuction: {
    allow: boolean;
    confidence: number;
    reasons: string[];
  } | null;
  performance?: {
    nextOpenReturn: number;
    nextHighReturn: number;
    nextCloseReturn: number;
    isSuccess: boolean;
  };
}

@Injectable()
export class ResonanceBacktestService {
  private readonly logger = new Logger(ResonanceBacktestService.name);

  constructor(
    private readonly resonanceService: ResonanceIndicatorService,
    private readonly klineService: KlineService,
    private readonly trendsService: TrendsService,
  ) {}

  /**
   * 对 ETF 进行历史共振回测及次日收益联动分析
   * @param etfCode ETF 代码 (588080)
   * @param dates 日期列表 (YYYY-MM-DD)
   */
  async backtest(etfCode: string, dates: string[]): Promise<BacktestResult> {
    this.logger.log(`🚀 开始回测 ETF: ${etfCode}, 共 ${dates.length} 个交易日`);

    // 1. 预先获取所有的日线 K 线，用于计算收益
    const sortedDates = [...dates].sort();
    const { data: klines } = await this.klineService.findKlines({
      code: etfCode,
      period: 101, // 日线
      startDate: sortedDates[0],
      orderBy: 'ASC',
    });

    const details: BacktestDayDetail[] = [];
    let bullishDaysCount = 0;
    let bearishDaysCount = 0;
    let hitCount = 0;
    let totalOpenReturn = 0;
    let totalMaxReturn = 0;
    let closeAuctionEvaluatedDays = 0;
    let closeAuctionAllowDays = 0;

    for (const date of dates) {
      try {
        // 2. 获取共振得分
        const resonance = await this.resonanceService.calculateResonanceScore(
          etfCode,
          date,
          '14:30',
          '15:00',
        );

        const detail: BacktestDayDetail = {
          date,
          resonance,
          closeAuction: null,
        };

        // 2b. 与实盘一致：有 ETF 分时则跑 CLOSE_AUCTION_T1 纯函数
        const { trends } = await this.trendsService.findAllTrends({
          code: etfCode,
          startDatetime: `${date} 09:30`,
          endDatetime: `${date} 15:00`,
          limit: 8000,
        });
        if (trends.length > 0) {
          const minuteBars = this.mapTrendsToMinuteBars(trends);
          const componentStrength =
            mapResonanceScoreToComponentStrength(resonance);
          const dto = evaluateCloseAuctionStrategy({
            symbol: etfCode,
            tradeDate: date,
            minuteBars,
            componentStrength,
          });
          detail.closeAuction = {
            allow: dto.allow,
            confidence: dto.confidence,
            reasons: dto.reasons,
          };
          closeAuctionEvaluatedDays++;
          if (dto.allow) {
            closeAuctionAllowDays++;
          }
        }

        // 3. 联动次日收益分析
        const currentKlineIndex = klines.findIndex((k) => k.date === date);
        const nextKline =
          currentKlineIndex !== -1 ? klines[currentKlineIndex + 1] : null;

        if (nextKline) {
          // 注意：resonance 里的 weightedStrength 是成分股强度，不是 ETF 价格
          // 我们应该从 Day T 的 K 线里取收盘价
          const todayKline = klines[currentKlineIndex];
          const tClose = Number(todayKline.close);
          const nOpen = Number(nextKline.open);
          const nHigh = Number(nextKline.high);
          const nClose = Number(nextKline.close);

          const nextOpenReturn = (nOpen - tClose) / tClose;
          const nextHighReturn = (nHigh - tClose) / tClose;
          const nextCloseReturn = (nClose - tClose) / tClose;
          const isSuccess = nHigh > tClose;

          detail.performance = {
            nextOpenReturn,
            nextHighReturn,
            nextCloseReturn,
            isSuccess,
          };

          // 仅对向上共振做统计
          if (resonance.score >= 70 && resonance.direction === 'UP') {
            bullishDaysCount++;
            if (isSuccess) hitCount++;
            totalOpenReturn += nextOpenReturn;
            totalMaxReturn += nextHighReturn;
          }
        }

        if (resonance.score >= 70 && resonance.direction === 'DOWN') {
          bearishDaysCount++;
        }

        details.push(detail);
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        this.logger.error(`❌ 回测日期 ${date} 失败: ${msg}`);
      }
    }

    return {
      etfCode,
      startDate: dates[0] || '',
      endDate: dates[dates.length - 1] || '',
      totalDays: dates.length,
      bullishDays: bullishDaysCount,
      bearishDays: bearishDaysCount,
      hitRate: bullishDaysCount > 0 ? (hitCount / bullishDaysCount) * 100 : 0,
      avgOpenReturn:
        bullishDaysCount > 0 ? totalOpenReturn / bullishDaysCount : 0,
      avgMaxReturn:
        bullishDaysCount > 0 ? totalMaxReturn / bullishDaysCount : 0,
      closeAuctionEvaluatedDays,
      closeAuctionAllowDays,
      details,
    };
  }

  /**
   * 与 CloseAuctionService.evaluateBySymbol 中分时转 MinuteBar 逻辑对齐。
   */
  private mapTrendsToMinuteBars(trends: Trend[]): MinuteBar[] {
    return [...trends]
      .sort((a, b) => a.datetime.localeCompare(b.datetime))
      .map((t) => {
        const p = Number(t.price ?? 0);
        return {
          time: t.datetime.slice(11),
          open: p,
          high: p,
          low: p,
          close: p,
          volume: Number(t.volume ?? 0),
        };
      });
  }
}
