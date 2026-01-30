好，那我直接给你一份**「可直接放进你 NestJS 项目里用」的尾盘战法 Service**。
我会按**工程可落地**来写，而不是伪代码。

> 目标：
> **每天 14:40–14:55 自动判断：588080 是否允许“尾盘买入，次日卖出”**

---

# 一、目录结构（直接照这个来）

```bash
src/modules/strategies/close-auction/
├─ close-auction.module.ts
├─ close-auction.service.ts
├─ close-auction.strategy.ts
├─ close-auction.controller.ts
├─ dto/
│  ├─ evaluate-close-auction.dto.ts
│  └─ strategy-signal.dto.ts
└─ utils/
   ├─ vwap.util.ts
   ├─ volume.util.ts
   └─ component.util.ts
```

---

# 二、核心数据结构（DTO）

## 1️⃣ 分钟 K 线

```ts
// common/types/market.ts
export interface MinuteBar {
  time: string;      // '14:45'
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}
```

---

## 2️⃣ 策略输入

```ts
// dto/evaluate-close-auction.dto.ts
import { MinuteBar } from '@/common/types/market';

export interface EvaluateCloseAuctionDto {
  symbol: string;               // 588080
  tradeDate: string;            // 2026-01-28
  minuteBars: MinuteBar[];      // 至少包含当天 5 分钟K
  componentStrength?: number;   // 成分股强度（0–100，可选）
}
```

---

## 3️⃣ 策略输出（标准化）

```ts
// dto/strategy-signal.dto.ts
export interface StrategySignalDto {
  strategy: 'CLOSE_AUCTION_T1';
  symbol: string;
  allow: boolean;
  confidence: number;     // 0–100
  reasons: string[];
  evaluatedAt: string;
}
```

---

# 三、工具函数（可复用）

## 1️⃣ VWAP 计算

```ts
// utils/vwap.util.ts
import { MinuteBar } from '@/common/types/market';

export function calcVWAP(bars: MinuteBar[]): number {
  let pv = 0;
  let vol = 0;

  for (const b of bars) {
    const typical = (b.high + b.low + b.close) / 3;
    pv += typical * b.volume;
    vol += b.volume;
  }

  return vol === 0 ? bars.at(-1).close : pv / vol;
}
```

---

## 2️⃣ 尾盘是否“疑似出货”

```ts
// utils/volume.util.ts
import { MinuteBar } from '@/common/types/market';

export function isDistribution(bars: MinuteBar[]): boolean {
  const last3 = bars.slice(-3);
  const avgVol =
    bars.slice(0, -3).reduce((s, b) => s + b.volume, 0) /
    Math.max(1, bars.length - 3);

  const lastVol = last3.reduce((s, b) => s + b.volume, 0) / 3;

  // 尾盘放巨量但价格不涨
  return lastVol > avgVol * 2 &&
         last3[last3.length - 1].close <= last3[0].close;
}
```

---

# 四、策略判断核心（最重要）

```ts
// close-auction.strategy.ts
import { EvaluateCloseAuctionDto } from './dto/evaluate-close-auction.dto';
import { StrategySignalDto } from './dto/strategy-signal.dto';
import { calcVWAP } from './utils/vwap.util';
import { isDistribution } from './utils/volume.util';

export function evaluateCloseAuctionStrategy(
  input: EvaluateCloseAuctionDto,
): StrategySignalDto {

  const { symbol, minuteBars, componentStrength = 50 } = input;
  const reasons: string[] = [];

  const lastBar = minuteBars.at(-1);
  const lastTime = lastBar.time;

  // ① 时间窗口
  if (lastTime < '14:40' || lastTime > '14:55') {
    return reject(symbol, '非尾盘时间');
  }

  // ② VWAP
  const vwap = calcVWAP(minuteBars);
  if (lastBar.close < vwap) {
    return reject(symbol, '价格跌破VWAP');
  }
  reasons.push('价格站上VWAP');

  // ③ 成交量结构
  if (isDistribution(minuteBars)) {
    return reject(symbol, '尾盘疑似出货');
  }
  reasons.push('尾盘成交结构健康');

  // ④ 成分股共振
  if (componentStrength < 60) {
    return reject(symbol, '成分股共振不足');
  }
  reasons.push('成分股共振良好');

  // 信心分（简单版）
  const confidence =
    Math.min(
      90,
      50 +
      (lastBar.close > vwap ? 15 : 0) +
      (componentStrength - 50) * 0.5,
    );

  return {
    strategy: 'CLOSE_AUCTION_T1',
    symbol,
    allow: true,
    confidence: Math.round(confidence),
    reasons,
    evaluatedAt: new Date().toISOString(),
  };
}

function reject(symbol: string, reason: string): StrategySignalDto {
  return {
    strategy: 'CLOSE_AUCTION_T1',
    symbol,
    allow: false,
    confidence: 0,
    reasons: [reason],
    evaluatedAt: new Date().toISOString(),
  };
}
```

---

# 五、NestJS Service（你真正调用的）

```ts
// close-auction.service.ts
import { Injectable } from '@nestjs/common';
import { EvaluateCloseAuctionDto } from './dto/evaluate-close-auction.dto';
import { evaluateCloseAuctionStrategy } from './close-auction.strategy';

@Injectable()
export class CloseAuctionService {

  evaluate(input: EvaluateCloseAuctionDto) {
    return evaluateCloseAuctionStrategy(input);
  }
}
```

---

# 六、Controller（给前端用）

```ts
// close-auction.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { CloseAuctionService } from './close-auction.service';
import { EvaluateCloseAuctionDto } from './dto/evaluate-close-auction.dto';

@Controller('strategies/close-auction')
export class CloseAuctionController {
  constructor(private readonly service: CloseAuctionService) {}

  @Post('evaluate')
  evaluate(@Body() dto: EvaluateCloseAuctionDto) {
    return this.service.evaluate(dto);
  }
}
```

---

# 七、你前端怎么用（React 调用方式）

```ts
POST /strategies/close-auction/evaluate

{
  "symbol": "588080",
  "tradeDate": "2026-01-28",
  "minuteBars": [...],
  "componentStrength": 72
}
```

返回：

```json
{
  "strategy": "CLOSE_AUCTION_T1",
  "symbol": "588080",
  "allow": true,
  "confidence": 78,
  "reasons": [
    "价格站上VWAP",
    "尾盘成交结构健康",
    "成分股共振良好"
  ]
}
```

👉 **前端只负责展示，不参与判断**

---

# 八、下一步强烈建议你做的 3 件事

1️⃣ **把 evaluate 结果存表（用于回测）**
2️⃣ **14:40–14:55 定时自动跑**
3️⃣ **前端把 reasons 展示出来（信任感拉满）**

---

## 下一步我可以直接继续帮你：

* **加 Cron 自动扫描版（NestJS）**
* **把 componentStrength 的计算也补齐（用成分股）**
* **帮你做一个“最近 20 次信号胜率”的回测接口**

你直接说下一步要 **哪一个编号**，我继续给你补齐。
