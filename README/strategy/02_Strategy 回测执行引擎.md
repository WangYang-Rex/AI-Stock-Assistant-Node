好，这一步我们直接上**核心中的核心**了。
我给你的是一套 **可长期演进的 Strategy 回测执行引擎设计**，不是 demo，而是**你这个系统可以一直用下去的那种**。

> 适配你现在的：
>
> * NestJS 后端
> * A 股 / ETF（588080）
> * 尾盘买入、次日卖出
> * 后续还能加网格 / 均线 / 动量

---

# 一、先给你一句“总设计原则”（很重要）

> **回测引擎 = 统一执行框架 + 多策略插件**

✔ 框架只管：

* 时间推进
* 仓位 / 现金
* 交易撮合
* 结果记录

✔ 策略只管：

* **什么时候买**
* **什么时候卖**
* **买多少**

---

# 二、整体架构（你照这个分目录）

```
strategy-engine
├─ engine
│  ├─ BacktestEngine.ts      // 核心驱动
│  ├─ Portfolio.ts           // 资金 & 持仓
│  ├─ OrderExecutor.ts       // 下单 & 成交
│  └─ BacktestContext.ts     // 当前回测状态
│
├─ strategies
│  ├─ BaseStrategy.ts        // 抽象策略
│  └─ TailT1Strategy.ts     // 尾盘买次日卖
│
├─ market
│  ├─ MarketDataProvider.ts  // 行情读取
│  └─ Bar.ts
│
├─ recorder
│  ├─ TradeRecorder.ts
│  ├─ EquityRecorder.ts
│  └─ MetricsCalculator.ts
│
└─ index.ts
```

---

# 三、核心接口定义（非常关键）

## 1️⃣ 策略基类（所有策略的“协议”）

```ts
export abstract class BaseStrategy {
  abstract onBar(ctx: BacktestContext): void

  onInit?(ctx: BacktestContext): void
  onFinish?(ctx: BacktestContext): void
}
```

> 你以后加策略，只需要写 `onBar`

---

## 2️⃣ 回测上下文（策略能看到的一切）

```ts
export class BacktestContext {
  date: string
  bar: Bar

  portfolio: Portfolio
  market: MarketDataProvider

  buy(price: number, amount: number): void
  sell(price: number, amount: number): void
}
```

📌 **策略不能直接改现金 / 仓位，只能下单**

---

## 3️⃣ Portfolio（资金 & 仓位）

```ts
class Portfolio {
  cash: number
  position: number
  positionPrice: number

  get equity() {
    return this.cash + this.position * this.positionPrice
  }
}
```

---

# 四、BacktestEngine（核心驱动器）

```ts
export class BacktestEngine {
  constructor(
    private strategy: BaseStrategy,
    private market: MarketDataProvider,
    private recorder: RecorderGroup
  ) {}

  run() {
    this.strategy.onInit?.(this.ctx)

    for (const bar of this.market.getBars()) {
      this.ctx.bar = bar
      this.ctx.date = bar.date

      this.strategy.onBar(this.ctx)

      this.recorder.record(bar, this.ctx)
    }

    this.strategy.onFinish?.(this.ctx)
  }
}
```

👉 **一句话理解**：

> 用时间把策略“压”一遍

---

# 五、Tail「尾盘买次日卖」策略实现（重点）

## 1️⃣ 参数定义

```ts
interface TailT1Params {
  buyTime: '14:50'
  sellMode: 'NEXT_OPEN'
  maxPosition: number
}
```

---

## 2️⃣ 策略逻辑（非常清晰）

```ts
export class TailT1Strategy extends BaseStrategy {
  constructor(private params: TailT1Params) {
    super()
  }

  onBar(ctx: BacktestContext) {
    const { bar, portfolio } = ctx

    // 尾盘买入
    if (
      bar.time === this.params.buyTime &&
      portfolio.position === 0
    ) {
      const amount = Math.floor(
        (portfolio.cash * this.params.maxPosition) / bar.close
      )
      ctx.buy(bar.close, amount)
    }

    // 次日开盘卖出
    if (bar.isNextDayOpen && portfolio.position > 0) {
      ctx.sell(bar.open, portfolio.position)
    }
  }
}
```

📌 你会发现：

* 策略代码 **不关心数据来源**
* 只表达“交易意图”

---

# 六、交易执行（OrderExecutor）

```ts
class OrderExecutor {
  executeBuy(price, amount, portfolio) {
    portfolio.cash -= price * amount
    portfolio.position += amount
    portfolio.positionPrice = price
  }

  executeSell(price, amount, portfolio) {
    portfolio.cash += price * amount
    portfolio.position -= amount
  }
}
```

👉 简化版，后面可加：

* 手续费
* 滑点
* 部分成交

---

# 七、结果记录（决定你前端能画什么）

## 1️⃣ TradeRecorder

```ts
recordTrade(date, side, price, amount)
```

→ strategy_trades

## 2️⃣ EquityRecorder

```ts
record(date, portfolio.equity)
```

→ equity_curve

## 3️⃣ MetricsCalculator

* 胜率
* 最大回撤
* 年化收益

---

# 八、如何从 API 触发回测（闭环）

```ts
POST /api/strategies/:id/backtest
```

流程：

```
Controller
 → StrategyFactory（按 type）
 → BacktestEngine.run()
 → 写入 strategy_trades / equity_curve / metrics
 → 返回 summary
```

---

# 九、为什么这套设计非常适合你

说实话，这套已经是：

* 🧠 **专业量化系统的最小完整形态**
* 🧩 策略解耦、可扩展
* 🔧 易调试（一条一条 bar 跑）
* 📈 天然支持你前端的图表叠加

而且 **Tail 策略这种偏“规则型”的 A 股打法，特别适合这种架构**。

---

# 十、下一步我建议你直接做的 2 件事

（都可以我直接帮你写）

1️⃣ **MarketDataProvider（分钟 / 日线统一接口）**
2️⃣ **回测任务异步化（BullMQ / Worker）**

你选一个，我直接继续往「实盘级」推进 🚀
