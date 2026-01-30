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
}

/* ---------- 技术指标工具函数 ---------- */

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
  };
}
