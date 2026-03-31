import type { ResonanceScore } from './resonance-indicator.service';

/**
 * 将共振指标映射为策略使用的 componentStrength（0–100）。
 * 与 CloseAuctionService 原逻辑一致，供实盘与回测共用。
 */
export function mapResonanceScoreToComponentStrength(
  result: ResonanceScore,
): number {
  if (result.direction === 'UP') {
    return result.score;
  }
  if (result.direction === 'DOWN') {
    return Math.max(0, 50 - result.score / 2);
  }
  return 50;
}
