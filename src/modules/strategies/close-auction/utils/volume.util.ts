import { MinuteBar } from '../dto/evaluate-close-auction.dto';

export function isDistribution(bars: MinuteBar[]): boolean {
  const last3 = bars.slice(-3);
  if (last3.length === 0) return false;

  const avgVol =
    bars.slice(0, -3).reduce((s, b) => s + b.volume, 0) /
    Math.max(1, bars.length - 3);

  const lastVol = last3.reduce((s, b) => s + b.volume, 0) / last3.length;

  // 尾盘放巨量但价格不涨
  return (
    lastVol > avgVol * 2 && last3[last3.length - 1].close <= last3[0].close
  );
}
