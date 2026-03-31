import { EvaluateCloseAuctionDto } from './dto/evaluate-close-auction.dto';
import { StrategySignalDto } from './dto/strategy-signal.dto';
import { calcVWAP } from './utils/vwap.util';
import { isDistribution } from './utils/volume.util';

const STRATEGY_CODE = 'CLOSE_AUCTION_T1';

export function evaluateCloseAuctionStrategy(
  input: EvaluateCloseAuctionDto,
): StrategySignalDto {
  const { symbol, minuteBars, componentStrength = 70 } = input;
  const reasons: string[] = [];
  let allow = true;

  const lastBar = minuteBars.at(-1);
  if (!lastBar) {
    return {
      strategy: STRATEGY_CODE,
      symbol,
      allow: false,
      confidence: 0,
      reasons: ['缺少K线数据'],
      evaluatedAt: new Date().toISOString(),
    };
  }

  // ① VWAP（评估触发时间由定时任务或手动调用决定，策略内不做时间硬过滤；见 docs/superpowers/specs/2026-03-31-close-auction-t1-signal-design.md）
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

  // ② 成交量结构
  if (isDistribution(minuteBars)) {
    allow = false;
    reasons.push('尾盘疑似出货 (成交量异常放量且跌破均价)');
  } else {
    reasons.push('尾盘成交结构健康');
  }

  // ③ 成分股共振
  if (componentStrength < 60) {
    allow = false;
    reasons.push(`成分股共振不足 (当前强度:${componentStrength})`);
  } else {
    reasons.push(`成分股共振良好 (当前强度:${componentStrength})`);
  }

  // ④ 量能（可选，当前关闭）
  // const volume = lastBar.volume;
  // if (volume < 100000) {
  //   allow = false;
  //   reasons.push(`量能不足 (当前:${volume})`);
  // } else {
  //   reasons.push(`量能充足 (当前:${volume})`);
  // }

  // ⑤ 量比（可选，当前关闭）
  // const volumeRatio = lastBar.volume / vwap;
  // if (volumeRatio < 1) {
  //   allow = false;
  //   reasons.push(`量比不足 (当前:${volumeRatio})`);
  // } else {
  //   reasons.push(`量比充足 (当前:${volumeRatio})`);
  // }

  // ⑥ 提示
  reasons.push(
    `提示: 尾盘战法只通过当日分时线、成分股共振来判断, 实际噪音太大，仅做参考`,
  );

  // 信心分计算
  const confidence = Math.min(
    90,
    50 + (lastBar.close > vwap ? 15 : 0) + (componentStrength - 50) * 0.5,
  );

  return {
    strategy: STRATEGY_CODE,
    symbol,
    allow: allow,
    confidence: allow ? Math.round(confidence) : 0,
    reasons,
    evaluatedAt: new Date().toISOString(),
  };
}
