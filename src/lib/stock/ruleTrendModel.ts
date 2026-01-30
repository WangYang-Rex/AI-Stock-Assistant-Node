/**
 * 规则型趋势交易系统 - 核心计算模型
 * 参考：README/single/规则型趋势交易系统.md
 */

export interface Kline {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TrendResult {
  trend: 'UP' | 'DOWN' | 'SIDEWAYS';
  score: number; // -100 ~ +100
  strength: 'WEAK' | 'MEDIUM' | 'STRONG';
  reasons: string[]; // 告诉你为什么是这个趋势
  // 快照数据
  snapshot?: {
    ma5: number;
    ma10: number;
    ma20: number;
    ma60: number;
    ema20: number;
    ema20Slope: number;
    macd: { dif: number; dea: number; hist: number };
    rsi: number;
    volumeRatio: number;
    price: number;
  };
}

export interface RiskResult {
  shouldStop: boolean;
  stopPrice: number;
  reason: string;
  // 快照数据
  snapshot?: {
    atr14: number;
    ma10: number;
    ma20: number;
  };
}

export interface PositionResult {
  suggestedRatio: number; // 建议仓位 (0 ~ 1.0)
  action: 'BUY' | 'SELL' | 'HOLD' | 'REDUCE' | 'NONE';
  message: string;
}

export interface PositionDecision {
  action: 'ADD' | 'REDUCE' | 'HOLD' | 'STOP';
  percent: number; // 仓位变化百分数，如 20 代表加仓总资金的 20%
  reason: string;
}

/* ---------- 技术指标工具函数 ---------- */

/**
 * 真实波动范围 (ATR)
 * 用于衡量市场波动性，常用于设置止损。
 */
export function ATR(klines: Kline[], period = 14): number {
  if (klines.length < period) return 0;

  const trs: number[] = [];
  for (let i = 1; i < klines.length; i++) {
    const high = klines[i].high;
    const low = klines[i].low;
    const prevClose = klines[i - 1].close;

    const tr1 = high - low;
    const tr2 = Math.abs(high - prevClose);
    const tr3 = Math.abs(low - prevClose);

    trs.push(Math.max(tr1, tr2, tr3));
  }

  if (trs.length === 0) return 0;
  return SMA(trs.slice(-period), period);
}

/**
 * 核心风险检查函数 (参考 README/single/02.md)
 */
export function checkRisk(klines: Kline[]): RiskResult {
  if (klines.length < 20) {
    return {
      shouldStop: false,
      stopPrice: 0,
      reason: '数据不足，跳过风险检查',
    };
  }

  const closes = klines.map((k) => Number(k.close));
  const lastClose = closes[closes.length - 1];
  const prevClose = closes[closes.length - 2];

  const ma10 = SMA(closes, 10);
  const ma20 = SMA(closes, 20);

  const ema20 = EMA(closes.slice(-25), 20);
  const atr = ATR(klines, 14);

  // 1. ATR 止损位：EMA20 - 2 * ATR
  const stopPrice = ema20 - 2 * atr;

  let shouldStop = false;
  let reason = '趋势及风险状态正常';

  // 2. 趋势破坏规则：MA10 < MA20
  if (ma10 < ma20) {
    shouldStop = true;
    reason = 'MA10 下穿 MA20，趋势破坏';
  } else if (lastClose < stopPrice && prevClose < stopPrice) {
    // 3. ATR 硬止损 (连续两日收盘跌破)
    shouldStop = true;
    reason = '连续两日跌破 ATR 止损位';
  }

  return {
    shouldStop,
    stopPrice: parseFloat(stopPrice.toFixed(2)),
    reason,
    snapshot: {
      atr14: atr,
      ma10,
      ma20,
    },
  };
}

/**
 * 简单移动平均线 (SMA)
 */
export function SMA(values: number[], period: number): number {
  if (values.length < period) return 0;
  const slice = values.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / slice.length;
}

/**
 * 指数移动平均线 (EMA)
 */
export function EMA(values: number[], period: number): number {
  if (values.length === 0) return 0;
  const k = 2 / (period + 1);
  let ema = values[0];
  for (let i = 1; i < values.length; i++) {
    ema = values[i] * k + ema * (1 - k);
  }
  return ema;
}

/**
 * 相对强弱指标 (RSI)
 */
export function RSI(values: number[], period = 14): number {
  if (values.length <= period) return 50;
  let gains = 0;
  let losses = 0;
  for (let i = values.length - period; i < values.length; i++) {
    const diff = values[i] - values[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }
  if (losses === 0) return 100;
  const rs = gains / losses;
  return 100 - 100 / (1 + rs);
}

/**
 * 平滑异同移动平均线 (MACD)
 */
export function MACD(values: number[]) {
  if (values.length < 26) {
    return { dif: 0, dea: 0, hist: 0 };
  }
  // 注意：这里的 EMA 计算简化了，实际工程中通常需要全量数据迭代以保证准确性
  // 但对于趋势判断，局部 EMA 也具有参考价值
  const ema12 = EMA(values.slice(-50), 12);
  const ema26 = EMA(values.slice(-50), 26);
  const dif = ema12 - ema26;

  // DEA 是 DIF 的 9 日 EMA
  // 简化处理：这里仅作为示意，实际应维护 DIF 序列
  const dea = dif * 0.2 + 0 * 0.8; // 极简模拟

  return {
    dif,
    dea,
    hist: dif - dea,
  };
}

/**
 * 核心趋势判断函数
 * @param klines K线数据数组（建议提供至少 60 根）
 */
export function calcTrend(klines: Kline[]): TrendResult {
  if (klines.length < 60) {
    return {
      trend: 'SIDEWAYS',
      score: 0,
      strength: 'WEAK',
      reasons: ['K线数据不足 (需至少60根)'],
    };
  }

  const closes = klines.map((k) => Number(k.close));
  const volumes = klines.map((k) => Number(k.volume));
  const latestClose = closes[closes.length - 1];
  const latestOpen = Number(klines[klines.length - 1].open);

  // 1. 均线计算
  const ma5 = SMA(closes, 5);
  const ma10 = SMA(closes, 10);
  const ma20 = SMA(closes, 20);
  const ma60 = SMA(closes, 60);

  // 2. 指标计算
  const ema20 = EMA(closes.slice(-25), 20);
  const ema20Prev = EMA(closes.slice(-30, -5), 20);
  const rsi = RSI(closes, 14);
  const macd = MACD(closes);
  const volMa20 = SMA(volumes, 20);
  const volumeRatio = volumes[volumes.length - 1] / (volMa20 || 1);

  let score = 0;
  const reasons: string[] = [];

  /** ---------- 第一层：趋势方向判断（硬规则） ---------- */
  const bullishMA = ma5 > ma10 && ma10 > ma20 && ma20 > ma60;
  const bearishMA = ma5 < ma10 && ma10 < ma20 && ma20 < ma60;

  if (bullishMA) {
    score += 30; // 基础分
    reasons.push('均线多头排列 (MA5 > 10 > 20 > 60)');
  } else if (bearishMA) {
    score -= 30;
    reasons.push('均线空头排列 (MA5 < 10 < 20 < 60)');
  } else {
    // 硬规则：均线不符合，直接判定为震荡
    return {
      trend: 'SIDEWAYS',
      score: 0,
      strength: 'WEAK',
      reasons: ['均线未形成多头/空头排列'],
    };
  }

  /** ---------- 第二层：趋势强度打分 ---------- */

  // 1️⃣ 均线差值 (最多 ±30分)
  const maDiff = ((ma10 - ma20) / ma20) * 1000;
  const maDiffScore = Math.max(-30, Math.min(30, maDiff));
  score += maDiffScore;
  if (maDiffScore > 10) reasons.push('均线发散程度良好');

  // 2️⃣ EMA 斜率 (最多 ±20分)
  const emaSlope = (ema20 - ema20Prev) * 1000;
  const emaSlopeScore = Math.max(-20, Math.min(20, emaSlope));
  score += emaSlopeScore;
  if (emaSlopeScore > 5) reasons.push('EMA20 斜率向上');

  // 3️⃣ MACD 动量 (最多 ±20分)
  if (macd.dif > macd.dea && macd.hist > 0) {
    score += 20;
    reasons.push('MACD 多头动量确认');
  } else if (macd.dif < macd.dea && macd.hist < 0) {
    score -= 20;
    reasons.push('MACD 空头动量确认');
  }

  // 4️⃣ RSI 状态 (最多 ±10分)
  if (rsi > 55 && rsi < 75) {
    score += 10;
    reasons.push('RSI 处于强势区间 (55-75)');
  } else if (rsi < 45) {
    score -= 10;
    reasons.push('RSI 处于弱势区间 (<45)');
  }

  // 5️⃣ 成交量确认 (最多 ±20分)
  if (volumeRatio > 1.2 && latestClose > latestOpen) {
    score += 20;
    reasons.push('放量上涨确认');
  } else if (volumeRatio < 0.8 && latestClose < latestOpen) {
    score -= 20;
    reasons.push('缩量下跌');
  }

  // 最终得分限制
  score = Math.max(-100, Math.min(100, Math.round(score)));

  // 判定结论
  let trend: TrendResult['trend'] = 'SIDEWAYS';
  let strength: TrendResult['strength'] = 'WEAK';

  if (score >= 30) trend = 'UP';
  else if (score <= -30) trend = 'DOWN';

  const absScore = Math.abs(score);
  if (absScore >= 60) strength = 'STRONG';
  else if (absScore >= 30) strength = 'MEDIUM';
  else strength = 'WEAK';

  return {
    trend,
    score,
    strength,
    reasons,
    snapshot: {
      ma5,
      ma10,
      ma20,
      ma60,
      ema20,
      ema20Slope: emaSlope,
      macd: {
        dif: macd.dif,
        dea: macd.dea,
        hist: macd.hist,
      },
      rsi,
      volumeRatio,
      price: latestClose,
    },
  };
}

/**
 * 仓位管理计算
 * @param trend 趋势评估结果
 * @param risk 风险评估结果
 */
export function calcPosition(
  trend: TrendResult,
  risk: RiskResult,
): PositionResult {
  // 1. 风险优先级最高：如果触发止损，直接清仓
  if (risk.shouldStop) {
    return {
      suggestedRatio: 0,
      action: 'SELL',
      message: `风险触发: ${risk.reason}，建议清仓`,
    };
  }

  // 2. 根据趋势强度分配仓位
  if (trend.trend === 'UP') {
    if (trend.strength === 'STRONG') {
      return {
        suggestedRatio: 1.0,
        action: 'BUY',
        message: '极强趋势，建议重仓或满仓持有',
      };
    }
    if (trend.strength === 'MEDIUM') {
      return {
        suggestedRatio: 0.6,
        action: 'BUY',
        message: '趋势确认，建议半仓或中等仓位',
      };
    }
    return {
      suggestedRatio: 0.3,
      action: 'HOLD',
      message: '弱势上涨，建议轻仓试探',
    };
  }

  // 3. 趋势转弱但未触发止损 (SIDEWAYS)
  if (trend.trend === 'SIDEWAYS') {
    return {
      suggestedRatio: 0.1,
      action: 'REDUCE',
      message: '进入震荡区，建议减仓规避波动',
    };
  }

  // 4. 下跌趋势
  return {
    suggestedRatio: 0,
    action: 'NONE',
    message: '下跌趋势中，建议空仓观望',
  };
}

/**
 * 趋势内动态调仓决策
 * @param trend 趋势评估结果
 * @param risk 风险评估结果
 * @param klines K线数据
 * @param currentPosition 当前持仓比例 (0~100)
 */
export function calcPositionAction(
  trend: TrendResult,
  risk: RiskResult,
  klines: Kline[],
  currentPosition: number,
): PositionDecision {
  // 0. 风险止损优先级最高
  if (risk.shouldStop) {
    return {
      action: 'STOP',
      percent: currentPosition, // 全部减掉
      reason: `触发离场: ${risk.reason}`,
    };
  }

  const closes = klines.map((k) => k.close);
  const highs = klines.map((k) => k.high);
  const ema20 = EMA(closes.slice(-25), 20);
  const lastClose = closes[closes.length - 1];
  const prevClose = closes[closes.length - 2];
  const volumeRatio = trend.snapshot?.volumeRatio || 1;

  // 1. 加仓逻辑
  if (
    trend.trend === 'UP' &&
    trend.strength === 'STRONG' &&
    currentPosition < 100
  ) {
    // A. 突破 20 日新高
    const highest20 = Math.max(...highs.slice(-21, -1)); // 不含最后一根
    if (lastClose > highest20) {
      return {
        action: 'ADD',
        percent: 20,
        reason: '趋势极强 + 突破20日新高，加仓吃肉',
      };
    }

    // B. 回踩 EMA20 指标
    if (prevClose < ema20 && lastClose > ema20) {
      return {
        action: 'ADD',
        percent: 10,
        reason: '回踩EMA20企稳，趋势修复加仓',
      };
    }
  }

  // 2. 减仓逻辑
  if (currentPosition > 0) {
    // A. 趋势走弱
    if (trend.strength === 'MEDIUM' && trend.trend === 'UP') {
      // 如果之前是 STRONG 现在变 MEDIUM
      return {
        action: 'REDUCE',
        percent: 20,
        reason: '趋势强度减弱，部分落袋为安',
      };
    }

    // B. 放量滞涨
    if (volumeRatio > 1.5 && (lastClose - prevClose) / prevClose < 0.01) {
      return {
        action: 'REDUCE',
        percent: 20,
        reason: '放量滞涨，警惕主力派发',
      };
    }

    // C. 跌破 EMA20
    if (lastClose < ema20) {
      return {
        action: 'REDUCE',
        percent: 30,
        reason: '收盘价跌破EMA20，保护盈利',
      };
    }
  }

  return {
    action: 'HOLD',
    percent: 0,
    reason: '维持现有仓位，等待新信号',
  };
}
