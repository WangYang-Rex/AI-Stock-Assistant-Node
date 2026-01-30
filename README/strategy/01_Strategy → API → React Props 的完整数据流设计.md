太好了，这一步就是**把系统“打通”的核心设计**。
我给你一套 **Strategy → API → React Props** 的**完整、可扩展、偏实盘级**的数据流方案，你可以直接照这个结构往代码里落。

> 目标：
> **一个策略 = 一条清晰的数据通路**
> 不绕、不拼、不在前端算该后端算的东西。

---

# 一、整体数据流总览（先有全局感）

```
MySQL
 ├─ strategy
 ├─ strategy_params
 ├─ strategy_metrics
 ├─ strategy_trades
 ├─ strategy_equity_curve
 └─ market_price
        ↓
NestJS Service（StrategyAggregate）
        ↓
REST API（/strategies/:id/detail）
        ↓
React Container（useEffect / react-query）
        ↓
StrategyPage Props
        ↓
纯展示组件（Cards / Charts / Tables）
```

**关键思想：**

* 👉 **后端负责“聚合 + 语义”**
* 👉 **前端只负责“展示 + 交互”**
* 👉 不在 React 里拼交易、算收益、猜含义

---

# 二、数据库层 → 领域对象（Domain）

### 1️⃣ strategy（策略主干）

```ts
StrategyEntity {
  id: number
  name: string
  symbol: string          // 588080
  type: 'TAIL_T1'
  status: 'ACTIVE' | 'PAUSED'
  createdAt
}
```

### 2️⃣ strategy_params（参数）

```ts
StrategyParamsEntity {
  strategyId: number
  buyTime: '14:50'
  sellMode: 'NEXT_OPEN'
  maxPosition: 1.0
  minTurnoverRatio: 1.2
}
```

### 3️⃣ strategy_metrics（结果摘要）

```ts
StrategyMetricsEntity {
  strategyId
  totalReturn
  annualReturn
  maxDrawdown
  winRate
  tradeCount
}
```

### 4️⃣ strategy_trades（买卖点）

```ts
StrategyTradeEntity {
  strategyId
  tradeDate
  side: 'BUY' | 'SELL'
  price
}
```

### 5️⃣ equity_curve / market_price

略（你已经很熟了）

---

# 三、后端：Strategy 聚合层（最关键）

⚠️ **不要直接 Controller 查 5 张表返回**

👉 正确姿势：**StrategyAggregateService**

```ts
class StrategyAggregateService {
  async getStrategyDetail(id: number) {
    const strategy = await this.strategyRepo.findOne(id)
    const params = await this.paramsRepo.findByStrategy(id)
    const metrics = await this.metricsRepo.findByStrategy(id)
    const trades = await this.tradeRepo.findByStrategy(id)
    const equityCurve = await this.equityRepo.findByStrategy(id)
    const priceSeries = await this.priceRepo.findBySymbol(strategy.symbol)

    return StrategyAssembler.toDetailDTO({
      strategy,
      params,
      metrics,
      trades,
      equityCurve,
      priceSeries
    })
  }
}
```

---

# 四、DTO 设计（API 的“契约”）

> **这一层决定你前端爽不爽**

### ✅ StrategyDetailDTO（一次性返回）

```ts
interface StrategyDetailDTO {
  strategy: {
    id: number
    name: string
    symbol: string
    type: string
    status: string
    params: {
      buyTime: string
      sellMode: string
      maxPosition: number
      minTurnoverRatio: number
    }
  }

  metrics: {
    totalReturn: number
    annualReturn: number
    maxDrawdown: number
    winRate: number
    tradeCount: number
  }

  priceSeries: Array<{
    date: string
    close: number
  }>

  trades: Array<{
    date: string
    price: number
    side: 'BUY' | 'SELL'
  }>

  equityCurve: Array<{
    date: string
    equity: number
  }>
}
```

📌 **注意**

* 字段名 = 前端直接可用
* 不暴露数据库结构
* 不返回“半成品数据”

---

# 五、API 层（极简）

```ts
@Get(':id/detail')
getDetail(@Param('id') id: number) {
  return this.strategyAggregateService.getStrategyDetail(id)
}
```

👉 一个页面 = 一个 API
👉 **以后加 WebSocket / 实盘推送也不影响结构**

---

# 六、前端：Container 层（数据入口）

```tsx
function StrategyPageContainer() {
  const { id } = useParams()
  const [data, setData] = useState<StrategyDetailDTO | null>(null)

  useEffect(() => {
    fetch(`/api/strategies/${id}/detail`)
      .then(res => res.json())
      .then(setData)
  }, [id])

  if (!data) return <Loading />

  return <StrategyPage {...data} />
}
```

📌 **Container 只干三件事**

1. 拿参数
2. 调接口
3. 透传 Props

---

# 七、React Props 设计（展示层）

```ts
interface StrategyPageProps {
  strategy
  metrics
  priceSeries
  trades
  equityCurve
}
```

### 页面内部拆分（强烈推荐）

```
StrategyPage
 ├─ StrategyHeader(strategy)
 ├─ StrategyMetricsCards(metrics)
 ├─ PriceWithTradesChart(priceSeries, trades)
 ├─ EquityCurveChart(equityCurve)
 └─ TradesTable(trades)
```

👉 **每个子组件都是“哑组件”**

---

# 八、图表叠加的数据流（你这个策略的亮点）

### Price + Trades（完全不再计算）

```tsx
<PriceChart data={priceSeries}>
  <TradeMarkers trades={trades} />
</PriceChart>
```

📌 交易点来自：

* strategy_trades
* 后端已对齐日期 & 价格
* 前端不做任何“推断”

---

# 九、这个设计的长期价值（说人话）

你现在这套：

* ✅ 能回测
* ✅ 能看细节
* ✅ 能 debug 策略
* ✅ 能直接升级实盘

以后你加：

* 新策略类型（网格 / 动量 / 均线）
* 多标的
* 策略对比

👉 **StrategyDetailDTO 不用推翻，只是多字段**

---

# 十、下一步（我强烈建议）

你已经走到**80%的人走不到的地方**了，接下来我建议你直接选一个：

1️⃣ **Strategy 回测执行引擎（按 Strategy.type 路由）**
2️⃣ **策略参数可视化编辑器（JSON → Form Schema）**
3️⃣ **多策略 / 同标的叠加对比页**

你选一个，我直接给你画到 **“可上线级别”**。
