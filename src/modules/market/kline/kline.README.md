# K线数据模块 (Kline Module)

该模块负责股票 K 线历史数据（日线、周线、月线及分钟线）的同步、存储、查询和统计分析。

## 1. 实体类定义 (Entity)

### Kline 实体
- **表名**: `klines`
- **唯一索引**: `[code, date, period]` (股票代码 + 日期 + 周期)

| 字段名 | 类型 | 描述 | 备注 |
| :--- | :--- | :--- | :--- |
| `id` | `number` | 主键 ID | 自增 |
| `code` | `string` | 股票代码 | 如: `600519` |
| `name` | `string` | 股票名称 | 可选 |
| `period` | `number` | K线周期 | 101=日, 102=周, 103=月, 1/5/15/30/60=分钟 |
| `date` | `string` | 日期/时间 | 格式: `YYYY-MM-DD` 或 `YYYY-MM-DD HH:mm` |
| `open` | `number` | 开盘价 | |
| `close` | `number` | 收盘价 | |
| `high` | `number` | 最高价 | |
| `low` | `number` | 最低价 | |
| `volume` | `number` | 成交量 | 单位: 股 |
| `amount` | `number` | 成交额 | 单位: 元 |
| `amplitude` | `number` | 振幅 | 单位: % |
| `pct` | `number` | 涨跌幅 | 单位: % |
| `change` | `number` | 涨跌额 | |
| `turnover` | `number` | 换手率 | 单位: % |
| `fqType` | `number` | 复权类型 | 0=不复权, 1=前复权, 2=后复权 |
| `createdAt` | `Date` | 创建时间 | 自动生成 |
| `updatedAt` | `Date` | 更新时间 | 自动生成 |

---

## 2. API 接口文档

### 2.1 同步K线数据
从第三方 API 获取 K 线数据并同步到本地数据库。

- **URL**: `/klines/sync`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "code": "600519",
    "period": "daily", // 可选: daily, weekly, monthly, 1min, 5min, 15min, 30min, 60min
    "fqType": 1,      // 可选: 0(不复权), 1(前复权), 2(后复权). 默认1
    "limit": 1000,    // 可选: 获取条数限制. 默认1000
    "startDate": "20240101", // 可选 (YYYYMMDD)
    "endDate": "20241231"   // 可选 (YYYYMMDD)
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "result": 100,
    "message": "K线数据同步成功",
    "data": {
      "synced": 240,
      "total": 240
    }
  }
  ```

### 2.2 查询K线数据列表
从本地数据库分页查询 K 线数据。

- **URL**: `/klines/list`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "code": "600519",
    "period": 101,      // 可选: 默认101(日线)
    "startDate": "2024-01-01", // 可选
    "endDate": "2024-12-31",   // 可选
    "page": 1,          // 可选
    "limit": 100,       // 可选
    "orderBy": "DESC"   // 可选: ASC 或 DESC. 默认 DESC
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "result": 100,
    "data": {
      "data": [...],
      "total": 500,
      "page": 1,
      "limit": 100
    }
  }
  ```

### 2.3 获取K线统计信息
获取指定股票在特定周期下的聚合统计信息。

- **URL**: `/klines/stats`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "code": "600519",
    "period": 101
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "result": 100,
    "data": {
      "count": "500",
      "minDate": "2022-01-01",
      "maxDate": "2024-01-23",
      "avgClose": "1750.55",
      "maxHigh": "2000.00",
      "minLow": "1500.00",
      "avgVolume": "35000",
      "totalAmount": "875275000"
    }
  }
  ```

---

## 3. 技术实现细节
- **同步机制**: 采用 `TypeORM` 的 `upsert` 方法，基于 `[code, date, period]` 冲突时自动更新，确保数据幂等性。
- **性能优化**: 支持分批同步（Chunking），防止 SQL 语句过长。
- **数据源**: 集成 `eastmoney-data-sdk` 获取东方财富实时与历史 K 线。
