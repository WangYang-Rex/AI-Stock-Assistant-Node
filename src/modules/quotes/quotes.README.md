# Quotes 行情快照模块

## 概述

Quotes 模块用于管理股票的实时行情快照数据。每个股票只保留一条最新的行情记录，通过东方财富 API 自动同步更新，确保数据的真实性和权威性。

## 设计理念

### 数据表职责划分

```
📊 quotes 表   - 存储每只股票的最新行情快照（实时数据，每股票一条）
📈 trends 表   - 存储分时数据（历史，按分钟）
📉 kline 表    - 存储K线数据（历史，日/周/月）
📋 stocks 表   - 存储股票基本信息
```

### 核心特性

- ✅ **唯一快照存储**：每个股票只保留一条最新行情记录
- ✅ **自动同步更新**：通过东方财富 API 获取官方数据
- ✅ **Upsert 策略**：存在则更新，不存在则创建
- ✅ **只读数据**：不允许手动创建或修改，确保数据真实性
- ✅ **完整行情信息**：包含价格、成交量、市值、估值等 15 个字段
- ✅ **定时任务同步**：工作日自动同步（中午 12 点、下午 15 点）

## 数据模型

### Quote 实体字段

| 字段名 | 类型 | 说明 | 精度 |
|--------|------|------|------|
| **id** | number | 主键ID | 自动生成 |
| **code** | string | 股票代码（如 600519） | 20字符 |
| **name** | string | 股票名称 | 100字符 |
| **price** | decimal | 最新价（元） | 18,4 |
| **high** | decimal | 今日最高价（元） | 18,4 |
| **low** | decimal | 今日最低价（元） | 18,4 |
| **open** | decimal | 今日开盘价（元） | 18,4 |
| **preClose** | decimal | 昨日收盘价（元） | 18,4 |
| **volume** | bigint | 成交量（股） | - |
| **amount** | decimal | 成交额（元） | 20,4 |
| **pct** | decimal | 涨跌幅（%） | 10,4 |
| **change** | decimal | 涨跌额（元） | 18,4 |
| **turnover** | decimal | 换手率（%） | 10,4 |
| **totalMarketCap** | decimal | 总市值（元） | 24,4 |
| **floatMarketCap** | decimal | 流通市值（元） | 24,4 |
| **pe** | decimal | 市盈率（动态） | 10,4 |
| **pb** | decimal | 市净率 | 10,4 |
| **updateTime** | bigint | 更新时间戳（Unix秒级） | - |
| **createdAt** | Date | 系统创建时间 | 自动生成 |
| **updatedAt** | Date | 系统更新时间 | 自动管理 |

### 数据库索引

```typescript
@Index(['code'])        // 股票代码索引，用于快速查询指定股票
@Index(['updateTime'])  // 更新时间索引，用于按时间范围查询
```

## API 接口

### 数据同步

#### 1. 同步单只股票行情快照

**接口**: `POST /quotes/syncStockQuotesFromAPI`

**说明**: 从东方财富 API 获取指定股票的实时行情数据并保存

**请求体**:
```json
{
  "code": "600519",
  "market": 1
}
```

**响应**:
```json
true  // 同步成功
```

**执行流程**:
1. 调用 `eastmoney.quote(secid)` 获取实时行情
2. 查找该股票是否已有行情记录
3. 如果存在则更新现有记录，否则创建新记录（upsert）
4. 同时更新 stocks 表的实时行情字段

#### 2. 批量同步所有股票行情快照

**接口**: `POST /quotes/syncAllStockQuotes`

**说明**: 遍历数据库中的所有股票，批量同步最新行情数据

**请求体**: 无

**响应**:
```json
{
  "message": "批量同步任务已启动，请查看日志了解同步进度"
}
```

**日志输出示例**:
```
找到 100 只股票，开始同步快照数据...
✅ 获取实时行情成功: 贵州茅台(600519), 价格: 1850.00, 涨跌幅: 2.35%
📝 更新股票 600519 的行情快照 (ID: 123)...
✅ 行情快照更新成功
🔄 更新股票实时行情信息...
✅ 股票信息更新成功: 贵州茅台(600519), 价格: 1850.00, 涨跌幅: 2.35%, 成交额: 125.67亿
股票快照同步任务完成 - 成功: 98, 失败: 2
```

### 数据查询

#### 3. 获取行情快照列表

**接口**: `POST /quotes/list`

**说明**: 查询行情快照列表，支持多条件筛选和分页

**请求体**:
```json
{
  "code": "600519",         // 可选，股票代码
  "startTime": 1705766400,  // 可选，开始时间（Unix时间戳，秒）
  "endTime": 1705852800,    // 可选，结束时间（Unix时间戳，秒）
  "page": 1,                // 可选，页码（默认 1）
  "limit": 10               // 可选，每页数量（默认 10）
}
```

**响应**:
```json
{
  "quotes": [
    {
      "id": 1,
      "code": "600519",
      "name": "贵州茅台",
      "price": 1850.00,
      "pct": 2.35,
      "volume": 1234567,
      "amount": 228395450.00,
      "totalMarketCap": 2324500000000.00,
      "updateTime": 1705852800
    }
  ],
  "total": 1
}
```

#### 4. 获取指定股票的最新行情

**接口**: `POST /quotes/latest`

**说明**: 获取指定股票的最新行情快照

**请求体**:
```json
{
  "code": "600519"
}
```

**响应**:
```json
{
  "id": 1,
  "code": "600519",
  "name": "贵州茅台",
  "price": 1850.00,
  "high": 1875.00,
  "low": 1840.00,
  "open": 1845.00,
  "preClose": 1807.00,
  "volume": 1234567,
  "amount": 228395450.00,
  "pct": 2.35,
  "change": 43.00,
  "turnover": 0.98,
  "totalMarketCap": 2324500000000.00,
  "floatMarketCap": 2324500000000.00,
  "pe": 28.50,
  "pb": 10.25,
  "updateTime": 1705852800,
  "createdAt": "2024-01-21T10:30:00.000Z",
  "updatedAt": "2024-01-21T15:00:00.000Z"
}
```

### 数据管理

#### 5. 删除行情快照

**接口**: `POST /quotes/delete`

**说明**: 删除指定的行情快照记录

**请求体**:
```json
{
  "id": 1
}
```

**响应**: 无内容（204）

### 排行榜

#### 6. 获取涨幅排行榜

**接口**: `POST /quotes/rankings-gainers`

**请求体**:
```json
{
  "limit": 10  // 可选，默认 10
}
```

**响应**:
```json
[
  {
    "code": "600519",
    "name": "贵州茅台",
    "price": 1850.00,
    "pct": 5.67,
    "amount": 228395450.00
  }
]
```

#### 7. 获取跌幅排行榜

**接口**: `POST /quotes/rankings-losers`

**请求体**:
```json
{
  "limit": 10  // 可选，默认 10
}
```

#### 8. 获取成交量排行榜

**接口**: `POST /quotes/rankings-volume`

**请求体**:
```json
{
  "limit": 10  // 可选，默认 10
}
```

## 定时任务

### 自动同步任务

系统配置了两个定时任务，在工作日自动同步所有股票的行情数据：

```typescript
// 工作日中午 12 点同步
@Cron('0 0 12 * * 1-5', {
  name: 'weekday-noon-quotes-sync',
  timeZone: 'Asia/Shanghai',
})

// 工作日下午 15 点同步
@Cron('0 0 15 * * 1-5', {
  name: 'weekday-afternoon-quotes-sync',
  timeZone: 'Asia/Shanghai',
})
```

## 使用示例

### 1. 同步单只股票行情

```typescript
import { QuotesService } from './quotes/quotes.service';

@Injectable()
export class StockDataService {
  constructor(private readonly quotesService: QuotesService) {}

  async syncStock(code: string, market: number) {
    const result = await this.quotesService.syncStockQuotesFromAPI({
      code,
      market,
    });
    
    if (result) {
      console.log(`股票 ${code} 同步成功`);
    } else {
      console.log(`股票 ${code} 同步失败`);
    }
  }
}
```

### 2. 批量同步所有股票

```typescript
async syncAllStocks() {
  await this.quotesService.syncAllStockQuotes();
  // 任务会在后台执行，查看日志了解进度
}
```

### 3. 查询最新行情

```typescript
async getLatestQuote(code: string) {
  return await this.quotesService.findLatestByCode(code);
}
```

### 4. 查询行情列表

```typescript
async getQuoteList(code?: string, page: number = 1, limit: number = 10) {
  return await this.quotesService.findAll({
    code,
    page,
    limit,
  });
}
```

### 5. 获取市场排行榜

```typescript
async getMarketRankings() {
  const [gainers, losers, volume] = await Promise.all([
    this.quotesService.getTopGainers(10),
    this.quotesService.getTopLosers(10),
    this.quotesService.getTopVolume(10),
  ]);

  return { gainers, losers, volume };
}
```

## 数据同步到 Stock 表

当同步行情快照时，会同时更新 `stocks` 表的以下字段：

```typescript
{
  price: quote.price,                // 最新价
  pct: quote.pct,                    // 涨跌幅
  change: quote.change,              // 涨跌额
  volume: quote.volume,              // 成交量
  amount: quote.amount,              // 成交额
  turnover: quote.turnover,          // 换手率
  totalMarketCap: quote.totalMarketCap,    // 总市值
  floatMarketCap: quote.floatMarketCap,    // 流通市值
}
```

这样设计的优势：
- ✅ 查询股票列表时无需 join quotes 表
- ✅ Stock 表包含完整的实时行情关键指标
- ✅ Quote 表提供详细的行情快照（含开高低收、估值等）

## 数据来源

所有行情数据来自 **东方财富数据 SDK**：

```typescript
import { eastmoney } from 'eastmoney-data-sdk';

// 获取实时行情
const quote = await eastmoney.quote(secid);
```

返回的数据结构：
```typescript
{
  code: string;              // 股票代码
  name: string;              // 股票名称
  price: number;             // 最新价
  high: number;              // 今日最高价
  low: number;               // 今日最低价
  open: number;              // 今日开盘价
  preClose: number;          // 昨日收盘价
  volume: number;            // 成交量（股）
  amount: number;            // 成交额（元）
  pct: number;               // 涨跌幅（%）
  change: number;            // 涨跌额
  turnover: number;          // 换手率（%）
  totalMarketCap: number;    // 总市值
  floatMarketCap: number;    // 流通市值
  pe: number;                // 市盈率（动态）
  pb: number;                // 市净率
  updateTime: number;        // 更新时间戳（Unix 时间戳，秒级）
}
```

## 注意事项

1. **数据只读**: 行情数据通过 API 自动同步，不允许手动创建或修改
2. **唯一记录**: 每个股票只保留一条最新行情记录，新数据会覆盖旧数据
3. **数据源权威**: 所有数据来自东方财富官方 API，确保真实性
4. **定时同步**: 系统会在交易时段自动同步，无需手动触发
5. **API 限流**: SDK 内置了限流机制（默认 100ms 间隔），批量同步时自动控制
6. **时间戳精度**: updateTime 使用 Unix 秒级时间戳
7. **数值精度**: 价格字段使用 decimal 类型确保计算精度

## 性能优化

1. **单记录策略**: 每股票只保留一条记录，极大减少存储空间
2. **索引优化**: 在 code 和 updateTime 字段建立索引
3. **Upsert 策略**: 避免重复数据插入
4. **批量同步**: 支持一次性同步所有股票
5. **定时任务**: 避免频繁调用 API

## 错误处理

所有接口都包含完整的错误处理机制：

- ✅ API 调用失败会记录错误日志
- ✅ 批量同步统计成功和失败数量
- ✅ 每个股票同步失败不影响其他股票
- ✅ 详细的日志输出，方便排查问题

## 与其他模块的关系

```
┌─────────────┐
│   Stocks    │ ← 存储股票基本信息 + 实时行情关键指标
└─────────────┘
       ↑
       │ 同步更新
       │
┌─────────────┐
│   Quotes    │ ← 存储最新行情快照（每股票一条）
└─────────────┘
       ↑
       │ API 获取
       │
┌─────────────┐
│  Eastmoney  │ ← 东方财富数据源
│     SDK     │
└─────────────┘
```

历史数据存储：
- **Trends 表**：分时数据（按分钟）
- **Kline 表**：K线数据（日/周/月）
