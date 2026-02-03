"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ATR = ATR;
exports.checkRisk = checkRisk;
exports.SMA = SMA;
exports.EMA = EMA;
exports.RSI = RSI;
exports.MACD = MACD;
exports.calcTrend = calcTrend;
exports.calcPosition = calcPosition;
exports.calcPositionAction = calcPositionAction;
exports.intradayExecute = intradayExecute;
exports.calcVWAP = calcVWAP;
function ATR(klines, period = 14) {
    if (klines.length < period)
        return 0;
    const trs = [];
    for (let i = 1; i < klines.length; i++) {
        const high = klines[i].high;
        const low = klines[i].low;
        const prevClose = klines[i - 1].close;
        const tr1 = high - low;
        const tr2 = Math.abs(high - prevClose);
        const tr3 = Math.abs(low - prevClose);
        trs.push(Math.max(tr1, tr2, tr3));
    }
    if (trs.length === 0)
        return 0;
    return SMA(trs.slice(-period), period);
}
function checkRisk(klines) {
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
    const stopPrice = ema20 - 2 * atr;
    let shouldStop = false;
    let reason = '趋势及风险状态正常';
    if (ma10 < ma20) {
        shouldStop = true;
        reason = 'MA10 下穿 MA20，趋势破坏';
    }
    else if (lastClose < stopPrice && prevClose < stopPrice) {
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
function SMA(values, period) {
    if (values.length < period)
        return 0;
    const slice = values.slice(-period);
    return slice.reduce((a, b) => a + b, 0) / slice.length;
}
function EMA(values, period) {
    if (values.length === 0)
        return 0;
    const k = 2 / (period + 1);
    let ema = values[0];
    for (let i = 1; i < values.length; i++) {
        ema = values[i] * k + ema * (1 - k);
    }
    return ema;
}
function RSI(values, period = 14) {
    if (values.length <= period)
        return 50;
    let gains = 0;
    let losses = 0;
    for (let i = values.length - period; i < values.length; i++) {
        const diff = values[i] - values[i - 1];
        if (diff >= 0)
            gains += diff;
        else
            losses -= diff;
    }
    if (losses === 0)
        return 100;
    const rs = gains / losses;
    return 100 - 100 / (1 + rs);
}
function MACD(values) {
    if (values.length < 26) {
        return { dif: 0, dea: 0, hist: 0 };
    }
    const ema12 = EMA(values.slice(-50), 12);
    const ema26 = EMA(values.slice(-50), 26);
    const dif = ema12 - ema26;
    const dea = dif * 0.2 + 0 * 0.8;
    return {
        dif,
        dea,
        hist: dif - dea,
    };
}
function calcTrend(klines) {
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
    const ma5 = SMA(closes, 5);
    const ma10 = SMA(closes, 10);
    const ma20 = SMA(closes, 20);
    const ma60 = SMA(closes, 60);
    const ema20 = EMA(closes.slice(-25), 20);
    const ema20Prev = EMA(closes.slice(-30, -5), 20);
    const rsi = RSI(closes, 14);
    const macd = MACD(closes);
    const volMa20 = SMA(volumes, 20);
    const volumeRatio = volumes[volumes.length - 1] / (volMa20 || 1);
    let score = 0;
    const reasons = [];
    const bullishMA = ma5 > ma10 && ma10 > ma20 && ma20 > ma60;
    const bearishMA = ma5 < ma10 && ma10 < ma20 && ma20 < ma60;
    if (bullishMA) {
        score += 30;
        reasons.push('均线多头排列 (MA5 > 10 > 20 > 60)');
    }
    else if (bearishMA) {
        score -= 30;
        reasons.push('均线空头排列 (MA5 < 10 < 20 < 60)');
    }
    else {
        return {
            trend: 'SIDEWAYS',
            score: 0,
            strength: 'WEAK',
            reasons: ['均线未形成多头/空头排列'],
        };
    }
    const maDiff = ((ma10 - ma20) / ma20) * 1000;
    const maDiffScore = Math.max(-30, Math.min(30, maDiff));
    score += maDiffScore;
    if (maDiffScore > 10)
        reasons.push('均线发散程度良好');
    const emaSlope = (ema20 - ema20Prev) * 1000;
    const emaSlopeScore = Math.max(-20, Math.min(20, emaSlope));
    score += emaSlopeScore;
    if (emaSlopeScore > 5)
        reasons.push('EMA20 斜率向上');
    if (macd.dif > macd.dea && macd.hist > 0) {
        score += 20;
        reasons.push('MACD 多头动量确认');
    }
    else if (macd.dif < macd.dea && macd.hist < 0) {
        score -= 20;
        reasons.push('MACD 空头动量确认');
    }
    if (rsi > 55 && rsi < 75) {
        score += 10;
        reasons.push('RSI 处于强势区间 (55-75)');
    }
    else if (rsi < 45) {
        score -= 10;
        reasons.push('RSI 处于弱势区间 (<45)');
    }
    if (volumeRatio > 1.2 && latestClose > latestOpen) {
        score += 20;
        reasons.push('放量上涨确认');
    }
    else if (volumeRatio < 0.8 && latestClose < latestOpen) {
        score -= 20;
        reasons.push('缩量下跌');
    }
    score = Math.max(-100, Math.min(100, Math.round(score)));
    let trend = 'SIDEWAYS';
    let strength = 'WEAK';
    if (score >= 30)
        trend = 'UP';
    else if (score <= -30)
        trend = 'DOWN';
    const absScore = Math.abs(score);
    if (absScore >= 60)
        strength = 'STRONG';
    else if (absScore >= 30)
        strength = 'MEDIUM';
    else
        strength = 'WEAK';
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
function calcPosition(trend, risk) {
    if (risk.shouldStop) {
        return {
            suggestedRatio: 0,
            action: 'SELL',
            message: `风险触发: ${risk.reason}，建议清仓`,
        };
    }
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
    if (trend.trend === 'SIDEWAYS') {
        return {
            suggestedRatio: 0.1,
            action: 'REDUCE',
            message: '进入震荡区，建议减仓规避波动',
        };
    }
    return {
        suggestedRatio: 0,
        action: 'NONE',
        message: '下跌趋势中，建议空仓观望',
    };
}
function calcPositionAction(trend, risk, klines, currentPosition) {
    if (risk.shouldStop) {
        return {
            action: 'STOP',
            percent: currentPosition,
            reason: `触发离场: ${risk.reason}`,
        };
    }
    const closes = klines.map((k) => k.close);
    const highs = klines.map((k) => k.high);
    const ema20 = EMA(closes.slice(-25), 20);
    const lastClose = closes[closes.length - 1];
    const prevClose = closes[closes.length - 2];
    const volumeRatio = trend.snapshot?.volumeRatio || 1;
    if (trend.trend === 'UP' &&
        trend.strength === 'STRONG' &&
        currentPosition < 100) {
        const highest20 = Math.max(...highs.slice(-21, -1));
        if (lastClose > highest20) {
            return {
                action: 'ADD',
                percent: 20,
                reason: '趋势极强 + 突破20日新高，加仓吃肉',
            };
        }
        if (prevClose < ema20 && lastClose > ema20) {
            return {
                action: 'ADD',
                percent: 10,
                reason: '回踩EMA20企稳，趋势修复加仓',
            };
        }
    }
    if (currentPosition > 0) {
        if (trend.trend !== 'UP') {
            const targetPos = trend.trend === 'SIDEWAYS' ? 10 : 0;
            const reducePercent = Math.max(30, currentPosition - targetPos);
            if (reducePercent > 0) {
                return {
                    action: 'REDUCE',
                    percent: reducePercent,
                    reason: `趋势转为 ${trend.trend === 'SIDEWAYS' ? '震荡' : '下跌'}，减仓至 ${targetPos}% 防御`,
                };
            }
        }
        if (trend.strength === 'MEDIUM' && trend.trend === 'UP') {
            return {
                action: 'REDUCE',
                percent: 20,
                reason: '趋势强度减弱，部分落袋为安',
            };
        }
        if (volumeRatio > 1.5 && (lastClose - prevClose) / prevClose < 0.01) {
            return {
                action: 'REDUCE',
                percent: 20,
                reason: '放量滞涨，警惕主力派发',
            };
        }
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
function intradayExecute(trend, risk, intraday) {
    const { klines5m } = intraday;
    if (klines5m.length < 20) {
        return {
            allow: false,
            action: 'HOLD',
            percent: 0,
            reason: '分时数据不足',
        };
    }
    const last5m = klines5m[klines5m.length - 1];
    const closes5m = klines5m.map((k) => k.close);
    const volumes5m = klines5m.map((k) => k.volume);
    const currentPrice = last5m.close;
    if (trend.trend !== 'UP' || trend.strength === 'WEAK' || risk.shouldStop) {
        return {
            allow: false,
            action: 'HOLD',
            percent: 0,
            reason: `趋势层禁止执行: ${trend.trend === 'UP' ? '强度弱' : '非上涨趋势'} 或 触发风险`,
        };
    }
    const vwapValue = calcVWAP(klines5m);
    const isVWAPPullback = currentPrice < vwapValue * 1.003 &&
        currentPrice > vwapValue * 0.997 &&
        last5m.volume < SMA(volumes5m.slice(-6, -1), 5) * 0.8;
    if (isVWAPPullback) {
        return {
            allow: true,
            action: 'ADD',
            percent: 10,
            reason: '分时 VWAP 回踩企稳 (成交量萎缩)',
        };
    }
    const ema20_5m = EMA(closes5m, 20);
    const avgVol5 = SMA(volumes5m.slice(-6, -1), 5);
    const isEMA20Pullback = last5m.low <= ema20_5m &&
        last5m.close >= ema20_5m &&
        last5m.volume < avgVol5;
    if (isEMA20Pullback) {
        return {
            allow: true,
            action: 'ADD',
            percent: 15,
            reason: '5分钟缩量回踩 EMA20',
        };
    }
    if (trend.strength === 'STRONG') {
        const last30minKlines = klines5m.slice(-6);
        const closes30 = last30minKlines.map((k) => k.close).slice(0, -1);
        const maxClose30 = Math.max(...closes30);
        const minClose30 = Math.min(...closes30);
        const range = (maxClose30 - minClose30) / minClose30;
        if (range < 0.01 &&
            last5m.close > maxClose30 &&
            last5m.volume > avgVol5 * 1.5) {
            return {
                allow: true,
                action: 'ADD',
                percent: 20,
                reason: '5分钟平台放量向上突破',
            };
        }
    }
    return {
        allow: false,
        action: 'HOLD',
        percent: 0,
        reason: '等待更优执行点 (VWAP/EMA20/突破)',
    };
}
function calcVWAP(klines) {
    let totalPV = 0;
    let totalV = 0;
    for (const k of klines) {
        totalPV += k.close * k.volume;
        totalV += k.volume;
    }
    return totalV === 0 ? 0 : totalPV / totalV;
}
//# sourceMappingURL=ruleTrendModel.js.map