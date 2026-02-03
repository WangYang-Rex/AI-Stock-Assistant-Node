import { EvaluateCloseAuctionDto } from './dto/evaluate-close-auction.dto';
import { StrategySignalDto } from './dto/strategy-signal.dto';
import { calcVWAP } from './utils/vwap.util';
import { isDistribution } from './utils/volume.util';

const STRATEGY_CODE = 'CLOSE_AUCTION_T1';
const STRATEGY_NAME = '尾盘战法策略';

export function evaluateCloseAuctionStrategy(
  input: EvaluateCloseAuctionDto,
): StrategySignalDto {
  const { symbol, minuteBars, componentStrength = 70 } = input;
  const reasons: string[] = [];
  let allow = true;

  const lastBar = minuteBars.at(-1);
  if (!lastBar) {
    return {
      strategy: STRATEGY_NAME,
      symbol,
      allow: false,
      confidence: 0,
      reasons: ['缺少K线数据'],
      evaluatedAt: new Date().toISOString(),
    };
  }
  const lastTime = lastBar.time;

  // ① 时间窗口
  const START_TIME = '14:40';
  const END_TIME = '14:55';
  if (lastTime < START_TIME || lastTime > END_TIME) {
    reasons.push(
      `非尾盘时间: ${lastTime} (策略设定范围: ${START_TIME}-${END_TIME})`,
    );
  } else {
    reasons.push(`尾盘时间验证通过: ${lastTime}`);
  }

  // ② VWAP
  const vwap = calcVWAP(minuteBars);
  if (lastBar.close < vwap) {
    allow = false;
    reasons.push(
      `价格跌破VWAP (当前:${lastBar.close.toFixed(3)}, VWAP:${vwap.toFixed(3)})`,
    );
  } else {
    reasons.push(
      `价格站上VWAP (当前:${lastBar.close.toFixed(3)}, VWAP:${vwap.toFixed(3)})`,
    );
  }

  // ③ 成交量结构
  if (isDistribution(minuteBars)) {
    allow = false;
    reasons.push('尾盘疑似出货 (成交量异常放量且跌破均价)');
  } else {
    reasons.push('尾盘成交结构健康');
  }

  // ④ 成分股共振
  if (componentStrength < 60) {
    allow = false;
    reasons.push(`成分股共振不足 (当前强度:${componentStrength})`);
  } else {
    reasons.push(`成分股共振良好 (当前强度:${componentStrength})`);
  }

  // 信心分计算
  const confidence = Math.min(
    90,
    50 + (lastBar.close > vwap ? 15 : 0) + (componentStrength - 50) * 0.5,
  );

  return {
    strategy: STRATEGY_NAME,
    symbol,
    allow: allow,
    confidence: allow ? Math.round(confidence) : 0,
    reasons,
    evaluatedAt: new Date().toISOString(),
  };
}
