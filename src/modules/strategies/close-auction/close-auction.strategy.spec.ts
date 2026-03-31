import { evaluateCloseAuctionStrategy } from './close-auction.strategy';
import type { MinuteBar } from './dto/evaluate-close-auction.dto';

/** 构造一根分时 K 线（high/low/close 一致便于 VWAP 可预期） */
function bar(time: string, close: number, volume: number): MinuteBar {
  return {
    time,
    open: close,
    high: close,
    low: close,
    close,
    volume,
  };
}

describe('evaluateCloseAuctionStrategy', () => {
  const baseInput = {
    symbol: '588080',
    tradeDate: '2026-03-31',
  };

  it('缺少K线数据时 allow 为 false', () => {
    const result = evaluateCloseAuctionStrategy({
      ...baseInput,
      minuteBars: [],
    });
    expect(result.allow).toBe(false);
    expect(result.confidence).toBe(0);
    expect(result.reasons).toContain('缺少K线数据');
  });

  it('价格跌破 VWAP 时否决', () => {
    const minuteBars: MinuteBar[] = [
      ...Array.from({ length: 9 }, (_, i) => bar(`09:${30 + i}`, 1.0, 1000)),
      bar('09:39', 0.5, 1000),
    ];
    const result = evaluateCloseAuctionStrategy({
      ...baseInput,
      minuteBars,
      componentStrength: 70,
    });
    expect(result.allow).toBe(false);
    expect(result.reasons.some((r) => r.includes('价格跌破VWAP'))).toBe(true);
  });

  it('成分股共振不足时否决', () => {
    const minuteBars: MinuteBar[] = Array.from({ length: 10 }, (_, i) =>
      bar(`09:${30 + i}`, 1.0, 1000),
    );
    const result = evaluateCloseAuctionStrategy({
      ...baseInput,
      minuteBars,
      componentStrength: 59,
    });
    expect(result.allow).toBe(false);
    expect(result.reasons.some((r) => r.includes('成分股共振不足'))).toBe(true);
  });

  it('尾盘疑似出货时否决（放量走平且满足 isDistribution）', () => {
    const minuteBars: MinuteBar[] = [
      ...Array.from({ length: 17 }, (_, i) => bar(`09:${30 + i}`, 1.0, 100)),
      bar('09:47', 1.0, 5000),
      bar('09:48', 1.0, 5000),
      bar('09:49', 1.0, 5000),
    ];
    const result = evaluateCloseAuctionStrategy({
      ...baseInput,
      minuteBars,
      componentStrength: 70,
    });
    expect(result.allow).toBe(false);
    expect(result.reasons.some((r) => r.includes('尾盘疑似出货'))).toBe(true);
  });

  it('VWAP、成交结构、共振均满足时 allow 为 true 且 confidence > 0', () => {
    const minuteBars: MinuteBar[] = Array.from({ length: 10 }, (_, i) =>
      bar(`09:${30 + i}`, 1.0, 1000),
    );
    const result = evaluateCloseAuctionStrategy({
      ...baseInput,
      minuteBars,
      componentStrength: 70,
    });
    expect(result.allow).toBe(true);
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.strategy).toBe('CLOSE_AUCTION_T1');
    expect(result.reasons.some((r) => r.includes('价格站上VWAP'))).toBe(true);
    expect(result.reasons.some((r) => r.includes('尾盘成交结构健康'))).toBe(
      true,
    );
    expect(result.reasons.some((r) => r.includes('成分股共振良好'))).toBe(true);
  });

  it('reasons 中不包含策略内时间硬过滤文案', () => {
    const minuteBars: MinuteBar[] = Array.from({ length: 5 }, (_, i) =>
      bar(`10:0${i}`, 1.0, 1000),
    );
    const result = evaluateCloseAuctionStrategy({
      ...baseInput,
      minuteBars,
      componentStrength: 70,
    });
    const text = result.reasons.join(' ');
    expect(text).not.toMatch(/非尾盘时间/);
    expect(text).not.toMatch(/尾盘时间验证通过/);
  });
});
