import { Injectable, Inject } from '@nestjs/common';
import type {
  ConstituentsMinuteProvider,
  MinuteBar,
} from '../../market/minute-bar/interfaces';
import { EtfConstituentsService } from '../../market/stock/etf-constituents.service';
import { EtfConstituent } from '../../../entities/etf-constituent.entity';

export interface ResonanceScore {
  ts: string;
  score: number; // 0～100
  direction: 'UP' | 'DOWN' | 'NEUTRAL';
  detail: {
    directionConsistency: number;
    weightedStrength: number;
    syncRatio: number;
  };
}

@Injectable()
export class ResonanceIndicatorService {
  constructor(
    @Inject('ConstituentsMinuteProvider')
    private readonly minuteProvider: ConstituentsMinuteProvider,
    private readonly etfConstituentsService: EtfConstituentsService,
  ) {}

  /**
   * 计算 ETF 成分股的「分钟级共振指标」
   * 算法来自：README/尾盘策略/04.md
   * @param etfCode ETF 代码
   * @param date 日期
   * @param startTime 开始时间，默认 '14:30'，建议预留足够长度（至少10分钟）
   * @param endTime 结束时间，默认 '15:00'
   */
  async calculateResonanceScore(
    etfCode: string,
    date: string,
    startTime: string = '14:30',
    endTime: string = '15:00',
  ): Promise<ResonanceScore> {
    // 1. 获取主要成分股
    const constituents = await this.etfConstituentsService.getTopConstituents(
      etfCode,
      date,
      20,
    );

    if (!constituents || constituents.length === 0) {
      return this.emptyScore(endTime);
    }

    const stockCodes = constituents.map((c) => c.stockCode);

    // 2. 获取成分股在指定窗口的分钟行情
    const minuteBarsMap = await this.minuteProvider.getMinuteBars(
      stockCodes,
      date,
      startTime,
      endTime,
    );

    // 3. 调用核心计算逻辑
    return this.calculateResonanceFromData(
      endTime,
      minuteBarsMap,
      constituents,
    );
  }

  /**
   * 核心计算逻辑：基于已有的分钟数据和成分股权重计算共振得分
   * 适合在回测循环中批量调用，避免重复查询数据库/接口
   */
  public calculateResonanceFromData(
    timestamp: string,
    barsMap: Record<string, MinuteBar[]>,
    constituents: EtfConstituent[],
  ): ResonanceScore {
    // 1. 准备打分数据
    const scores: number[] = [];
    const weights: number[] = [];

    for (const c of constituents) {
      const bars = barsMap[c.stockCode];
      // 需要至少 2 根 K 线计算分钟动量
      if (!bars || bars.length < 2) continue;

      scores.push(this.calcMomentumScore(bars));
      weights.push(Number(c.weight));
    }

    if (scores.length === 0) {
      return this.emptyScore(timestamp);
    }

    // 2. 计算各维度核心指标
    const directionConsistency = this.calcDirectionConsistency(scores);
    const weightedStrength = this.calcWeightedStrength(scores, weights);
    const syncRatio = this.calcSyncRatio(scores);

    // 3. 综合评分计算 (加权算法)
    const rawScore =
      directionConsistency * 0.4 +
      Math.abs(weightedStrength) * 0.4 +
      syncRatio * 0.2;

    const score = Math.round(rawScore * 100);

    let direction: 'UP' | 'DOWN' | 'NEUTRAL' = 'NEUTRAL';
    if (weightedStrength > 0.05) {
      direction = 'UP';
    } else if (weightedStrength < -0.05) {
      direction = 'DOWN';
    }

    return {
      ts: timestamp,
      score,
      direction,
      detail: {
        directionConsistency,
        weightedStrength,
        syncRatio,
      },
    };
  }

  /**
   * 计算单只股票的「分钟动量得分」
   * 范围: [-1, 1], 1%的分钟变动对应 1.0 分
   */
  private calcMomentumScore(bars: MinuteBar[]): number {
    const last = bars[bars.length - 1];
    const prev = bars[bars.length - 2];

    if (prev.close === 0) return 0;
    const pct = (last.close - prev.close) / prev.close;

    // 放大分钟变化（0.1% -> 0.1），封顶 1.0
    return Math.max(-1, Math.min(1, pct * 100));
  }

  /**
   * 方向一致性 (0 ~ 1)
   */
  private calcDirectionConsistency(scores: number[]): number {
    const up = scores.filter((s) => s > 0).length;
    const down = scores.filter((s) => s < 0).length;
    const total = scores.length;

    return Math.abs(up - down) / total;
  }

  /**
   * 权重加权强度 (-1 ~ 1)
   */
  private calcWeightedStrength(scores: number[], weights: number[]): number {
    let sum = 0;
    let weightSum = 0;

    for (let i = 0; i < scores.length; i++) {
      sum += scores[i] * weights[i];
      weightSum += weights[i];
    }

    if (weightSum === 0) return 0;
    // 归一化強度
    const normalizedStrength = sum / weightSum;
    return Math.max(-1, Math.min(1, normalizedStrength));
  }

  /**
   * 同步性：超过阈值的活跃股票占比 (0 ~ 1)
   * threshold = 0.1 (意味分钟变动超过 0.1%)
   */
  private calcSyncRatio(scores: number[], threshold = 0.1): number {
    const active = scores.filter((s) => Math.abs(s) >= threshold).length;
    return active / scores.length;
  }

  private emptyScore(ts: string): ResonanceScore {
    return {
      ts,
      score: 0,
      direction: 'NEUTRAL',
      detail: {
        directionConsistency: 0,
        weightedStrength: 0,
        syncRatio: 0,
      },
    };
  }
}
