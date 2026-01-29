import { MinuteBar } from '../dto/evaluate-close-auction.dto';

export function calcVWAP(bars: MinuteBar[]): number {
  let pv = 0;
  let vol = 0;

  for (const b of bars) {
    const typical = (b.high + b.low + b.close) / 3;
    pv += typical * b.volume;
    vol += b.volume;
  }

  return vol === 0 ? bars.at(-1)?.close || 0 : pv / vol;
}
