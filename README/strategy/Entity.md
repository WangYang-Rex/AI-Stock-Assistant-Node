好，这一步**非常关键** 👍
Strategy 表一旦设计好，**后面的回测、统计、可视化都会顺**。

我按你现在这个阶段（**单策略 + 588080 + 可扩展**），给你一套**实战级、不过度设计**的表结构方案。

---

# 一、整体表设计思路（先说原则）

### 设计目标

* ✅ 能记录 **每一次策略信号**
* ✅ 能回填 **次日真实结果**
* ✅ 能支持 **回测 / 胜率 / 盈亏统计**
* ✅ 后续能扩展到 **多策略 / 多标的**

👉 所以 **至少 2 张表**：

1. **strategy_signal**（策略当下给的判断）
2. **strategy_result**（事后结果 / 回测）

---

# 二、核心表 1：strategy_signal（信号表）

> 📌 **这是策略引擎每次跑出来必写的表**

```sql
CREATE TABLE strategy_signal (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '策略信号ID',

  strategy_code VARCHAR(50) NOT NULL COMMENT '策略编码，如 CLOSE_AUCTION_T1',
  symbol VARCHAR(20) NOT NULL COMMENT '标的代码，如 588080',
  trade_date DATE NOT NULL COMMENT '信号所属交易日',

  allow TINYINT(1) NOT NULL COMMENT '是否允许交易 1是0否',
  confidence INT NOT NULL COMMENT '信心分 0-100',

  reasons JSON COMMENT '策略判断原因列表',

  eval_time DATETIME NOT NULL COMMENT '策略评估时间（如14:45）',

  -- 快照数据（非常重要，避免未来数据污染）
  price DECIMAL(10,4) COMMENT '评估时价格',
  vwap DECIMAL(10,4) COMMENT '当日VWAP',
  volume BIGINT COMMENT '当日成交量',

  extra JSON COMMENT '扩展字段（成分股强度、指数状态等）',

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uk_strategy_day (strategy_code, symbol, trade_date)
) COMMENT='策略信号表';
```

---

## 🔍 设计解释（你以后一定会感谢）

### ✅ 为什么要存 snapshot？

> **回测最大坑：用到了“未来数据”**

* price / vwap / volume
  → 全部是 **当下快照**
* 后面算胜率、调参数才真实

---

### ✅ reasons 用 JSON

前端可以直接展示：

```json
[
  "价格站上VWAP",
  "尾盘成交结构健康",
  "成分股共振良好"
]
```

---

# 三、核心表 2：strategy_result（结果 / 回测表）

> 📌 **次日或之后回填**

```sql
CREATE TABLE strategy_result (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '结果ID',

  signal_id BIGINT NOT NULL COMMENT '关联策略信号ID',

  symbol VARCHAR(20) NOT NULL COMMENT '标的代码',
  buy_price DECIMAL(10,4) COMMENT '假设买入价（尾盘）',
  sell_price DECIMAL(10,4) COMMENT '卖出价（次日）',

  sell_time DATETIME COMMENT '卖出时间（如次日09:35）',

  return_pct DECIMAL(8,4) COMMENT '收益率 %',
  max_gain_pct DECIMAL(8,4) COMMENT '次日最大浮盈 %',
  max_drawdown_pct DECIMAL(8,4) COMMENT '次日最大回撤 %',

  win TINYINT(1) COMMENT '是否盈利',

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_signal
    FOREIGN KEY (signal_id) REFERENCES strategy_signal(id)
) COMMENT='策略结果表';
```

---

## 🔍 为什么 result 单独一张表？

* 信号 ≠ 结果（**时间不同**）
* 可以：

  * 多种卖出规则回填
  * 多次复盘
* 不污染原始信号

---

# 四、可选扩展表（建议你第二阶段加）

## 1️⃣ strategy_config（参数可调）

```sql
CREATE TABLE strategy_config (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,

  strategy_code VARCHAR(50) NOT NULL,
  symbol VARCHAR(20),

  params JSON COMMENT '策略参数，如VWAP阈值、信心分',

  enabled TINYINT(1) DEFAULT 1,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

👉 后期你就可以在前端调参数，不用改代码。

---

## 2️⃣ strategy_stats（统计缓存表，非必须）

```sql
CREATE TABLE strategy_stats (
  strategy_code VARCHAR(50),
  symbol VARCHAR(20),

  total_count INT,
  win_rate DECIMAL(5,2),
  avg_return DECIMAL(8,4),
  max_drawdown DECIMAL(8,4),

  updated_at DATETIME
);
```

---

# 五、NestJS Entity 示例（strategy_signal）

```ts
@Entity('strategy_signal')
export class StrategySignalEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  strategyCode: string;

  @Column()
  symbol: string;

  @Column({ type: 'date' })
  tradeDate: string;

  @Column({ type: 'tinyint' })
  allow: number;

  @Column()
  confidence: number;

  @Column({ type: 'json', nullable: true })
  reasons: string[];

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  vwap: number;

  @CreateDateColumn()
  createdAt: Date;
}
```

---

# 六、你现在这个系统的「最小可用方案（MVP）」

👉 **只做这 2 张表就够：**

* strategy_signal
* strategy_result

先跑 **588080 + 尾盘战法 1 个月**
你就已经能看到：

* 胜率
* 盈亏分布
* 哪些 reason 最有效

---

## 下一步我可以继续帮你：

1️⃣ **写 signal → result 的“次日自动回填任务”**
2️⃣ **给你一套“统计 SQL（胜率 / 最大回撤）”**
3️⃣ **前端策略回测页面结构设计（React）**

你直接选 **1 / 2 / 3**，我继续往下补。
