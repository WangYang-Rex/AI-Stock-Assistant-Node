# Quotes 行情快照模块

## 概述

Quotes模块用于管理股票行情快照数据，提供完整的行情信息存储和查询功能。

## 功能特性

- ✅ 创建单个或批量行情快照
- ✅ 查询历史行情数据
- ✅ 获取最新行情信息
- ✅ 市场统计和排行榜功能
- ✅ 时间范围查询和删除
- ✅ 分页查询支持
- ✅ 按日期查询行情数据
- ✅ 快照日期和时间双重索引

## 数据模型

### Quote 实体字段

| 字段名 | 类型 | 说明 | 必填 |
|--------|------|------|------|
| id | number | 主键ID | 自动生成 |
| code | string | 股票代码 | ✅ |
| name | string | 股票名称 | ✅ |
| market | string | 市场 | ✅ |
| marketCode | string | 市场代码 | ✅ |
| pe | number | 市盈率 | ❌ |
| latestPrice | number | 最新价 | ❌ |
| changePercent | number | 涨跌幅(%) | ❌ |
| changeAmount | number | 涨跌额 | ❌ |
| openPrice | number | 开盘价 | ❌ |
| highPrice | number | 最高价 | ❌ |
| lowPrice | number | 最低价 | ❌ |
| volume | number | 成交量(股) | ❌ |
| volumeAmount | number | 成交额(元) | ❌ |
| previousClosePrice | number | 昨收价 | ❌ |
| snapshotTime | Date | 快照时间 | 默认当前时间 |
| snapshotDate | Date | 快照日期 | ❌ |
| createdAt | Date | 创建时间 | 自动生成 |
| updatedAt | Date | 更新时间 | 自动生成 |

## API 接口

### 基础操作

#### 1. 创建行情快照
```http
POST /quotes
Content-Type: application/json

{
  "code": "000001",
  "name": "平安银行",
  "market": "深交所",
  "marketCode": "0",
  "pe": 5.2,
  "latestPrice": 12.50,
  "changePercent": 2.45,
  "changeAmount": 0.30,
  "openPrice": 12.20,
  "highPrice": 12.60,
  "lowPrice": 12.10,
  "volume": 1000000,
  "volumeAmount": 12500000.00,
  "previousClosePrice": 12.20
}
```

#### 2. 批量创建行情快照
```http
POST /quotes/batch
Content-Type: application/json

[
  {
    "code": "000001",
    "name": "平安银行",
    "market": "深交所",
    "marketCode": "0",
    "latestPrice": 12.50
  },
  {
    "code": "600000",
    "name": "浦发银行",
    "market": "上交所",
    "marketCode": "1",
    "latestPrice": 8.90
  }
]
```

#### 3. 查询所有行情快照
```http
GET /quotes?page=1&limit=10&market=深交所&startTime=2024-01-01&endTime=2024-01-31
```

#### 4. 根据ID查询行情快照
```http
GET /quotes/1
```

#### 5. 获取指定股票的最新行情
```http
GET /quotes/latest/000001
```

#### 6. 获取指定股票的历史行情
```http
GET /quotes/history/000001?startTime=2024-01-01&endTime=2024-01-31&limit=100
```

#### 7. 根据日期获取指定股票的行情
```http
GET /quotes/date/000001?startDate=2024-01-01&endDate=2024-01-31&limit=100
```

#### 8. 获取指定日期的所有行情
```http
GET /quotes/date?date=2024-01-15
```

#### 9. 更新行情快照
```http
PUT /quotes/1
Content-Type: application/json

{
  "latestPrice": 12.60,
  "changePercent": 3.28
}
```

#### 10. 删除行情快照
```http
DELETE /quotes/1
```

#### 11. 批量删除指定时间范围的行情快照
```http
DELETE /quotes/range?startTime=2024-01-01&endTime=2024-01-31
```

### 统计和排行榜

#### 1. 获取市场统计信息
```http
GET /quotes/stats/market
```

响应示例：
```json
[
  {
    "market": "深交所",
    "count": "1500",
    "avgPrice": "15.25",
    "maxPrice": "45.60",
    "minPrice": "2.10"
  },
  {
    "market": "上交所",
    "count": "2000",
    "avgPrice": "18.75",
    "maxPrice": "52.30",
    "minPrice": "1.85"
  }
]
```

#### 2. 获取涨跌幅排行榜
```http
GET /quotes/rankings/gainers?limit=10
```

#### 3. 获取跌幅排行榜
```http
GET /quotes/rankings/losers?limit=10
```

#### 4. 获取成交量排行榜
```http
GET /quotes/rankings/volume?limit=10
```

## 查询参数

### QuoteQueryDto 参数

| 参数名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| code | string | 股票代码 | 000001 |
| market | string | 市场 | 深交所 |
| marketCode | string | 市场代码 | 0 |
| startTime | Date | 开始时间 | 2024-01-01 |
| endTime | Date | 结束时间 | 2024-01-31 |
| startDate | Date | 开始日期 | 2024-01-01 |
| endDate | Date | 结束日期 | 2024-01-31 |
| page | number | 页码 | 1 |
| limit | number | 每页数量 | 10 |

## 使用示例

### 1. 创建行情快照服务
```typescript
import { QuotesService } from './quotes/quotes.service';

@Injectable()
export class StockDataService {
  constructor(private readonly quotesService: QuotesService) {}

  async saveStockQuote(stockData: any) {
    const quoteData = {
      code: stockData.code,
      name: stockData.name,
      market: stockData.market,
      marketCode: stockData.marketCode,
      pe: stockData.pe,
      latestPrice: stockData.price,
      changePercent: stockData.changePercent,
      changeAmount: stockData.changeAmount,
      openPrice: stockData.openPrice,
      highPrice: stockData.highPrice,
      lowPrice: stockData.lowPrice,
      volume: stockData.volume,
      volumeAmount: stockData.volumeAmount,
      previousClosePrice: stockData.previousClosePrice,
    };

    return await this.quotesService.createQuote(quoteData);
  }
}
```

### 2. 查询历史行情
```typescript
async getStockHistory(code: string, days: number = 30) {
  const endTime = new Date();
  const startTime = new Date();
  startTime.setDate(endTime.getDate() - days);

  return await this.quotesService.findByCode(code, startTime, endTime, 100);
}
```

### 3. 按日期查询行情
```typescript
async getStockHistoryByDate(code: string, startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return await this.quotesService.findByCodeAndDate(code, start, end, 100);
}

async getDailyQuotes(date: string) {
  const targetDate = new Date(date);
  return await this.quotesService.findByDate(targetDate);
}
```

### 4. 获取市场排行榜
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

## 数据库索引

为了提高查询性能，quotes表创建了以下索引：

- `idx_code`: 股票代码索引
- `idx_market`: 市场索引
- `idx_snapshotTime`: 快照时间索引
- `idx_snapshotDate`: 快照日期索引
- `idx_code_snapshotTime`: 股票代码+快照时间复合索引
- `idx_code_snapshotDate`: 股票代码+快照日期复合索引

## 注意事项

1. **数据一致性**: 建议在创建行情快照时设置合适的`snapshotTime`和`snapshotDate`，确保数据的时间一致性
2. **批量操作**: 对于大量数据，建议使用批量创建接口提高性能
3. **数据清理**: 定期清理过期的历史数据，避免数据库过大
4. **索引优化**: 根据实际查询模式调整索引策略
5. **数据类型**: 价格相关字段使用decimal类型确保精度
6. **日期字段**: `snapshotDate`字段会自动从`snapshotTime`中提取日期部分，也可以手动设置

## 错误处理

所有接口都包含完整的错误处理机制，常见错误码：

- `400`: 请求参数错误
- `404`: 资源不存在
- `500`: 服务器内部错误

## 性能优化建议

1. 使用分页查询避免一次性加载大量数据
2. 合理使用时间范围查询
3. 定期清理历史数据
4. 监控数据库性能指标
