# Kline 模块 API 文档

K线数据模块，提供股票K线数据的获取、同步和增删改查功能。

## 数据来源

通过 `eastmoney-data-sdk` 从东方财富获取K线数据，支持日线、周线、月线和分钟线。

## API 接口列表

### 数据获取接口

#### 1. 从API获取K线数据

```
POST /klines/fetch
```

**请求参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| code | string | 是 | 股票代码（如 600519、000001） |
| period | string | 否 | K线周期：daily/weekly/monthly/1min/5min/15min/30min/60min，默认 daily |
| fqType | number | 否 | 复权类型：0=不复权, 1=前复权, 2=后复权，默认 1 |
| limit | number | 否 | 数据条数限制，默认 1000 |
| startDate | string | 否 | 开始日期（YYYYMMDD格式） |
| endDate | string | 否 | 结束日期（YYYYMMDD格式） |
| saveToDb | boolean | 否 | 是否保存到数据库，默认 false |

**请求示例：**

```json
{
  "code": "600519",
  "period": "daily",
  "fqType": 1,
  "limit": 100,
  "saveToDb": true
}
```

**响应示例：**

```json
{
  "code": 0,
  "message": "K线数据获取成功",
  "data": [
    {
      "code": "600519",
      "name": "贵州茅台",
      "market": "SH",
      "period": 101,
      "date": "2024-01-15",
      "open": 1500.00,
      "close": 1520.00,
      "high": 1530.00,
      "low": 1495.00,
      "volume": 5000000,
      "amount": 7500000000,
      "amplitude": 2.33,
      "pct": 1.33,
      "change": 20.00,
      "turnover": 0.4,
      "fqType": 1
    }
  ]
}
```

---

#### 2. 同步K线数据到数据库

```
POST /klines/sync
```

**请求参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| code | string | 是 | 股票代码 |
| period | string | 否 | K线周期，默认 daily |
| fqType | number | 否 | 复权类型，默认 1 |
| limit | number | 否 | 数据条数限制，默认 1000 |

**请求示例：**

```json
{
  "code": "600519",
  "period": "daily",
  "limit": 500
}
```

**响应示例：**

```json
{
  "code": 0,
  "message": "K线数据同步成功",
  "data": {
    "synced": 500,
    "total": 500
  }
}
```

---

### CRUD 接口

#### 3. 创建K线记录

```
POST /klines/create
```

**请求参数：**

```json
{
  "code": "600519",
  "name": "贵州茅台",
  "market": "SH",
  "period": 101,
  "date": "2024-01-15",
  "open": 1500.00,
  "close": 1520.00,
  "high": 1530.00,
  "low": 1495.00,
  "volume": 5000000,
  "amount": 7500000000,
  "amplitude": 2.33,
  "pct": 1.33,
  "change": 20.00,
  "turnover": 0.4,
  "fqType": 1
}
```

---

#### 4. 批量创建K线记录

```
POST /klines/batch-create
```

**请求参数：**

```json
{
  "klines": [
    {
      "code": "600519",
      "date": "2024-01-15",
      "open": 1500.00,
      "close": 1520.00,
      "high": 1530.00,
      "low": 1495.00,
      "volume": 5000000,
      "amount": 7500000000
    }
  ]
}
```

---

#### 5. 查询K线数据列表

```
POST /klines/list
```

**请求参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| code | string | 是 | 股票代码 |
| period | number | 否 | K线周期（101=日线），默认 101 |
| startDate | string | 否 | 开始日期 |
| endDate | string | 否 | 结束日期 |
| page | number | 否 | 页码，默认 1 |
| limit | number | 否 | 每页数量，默认 100 |
| orderBy | string | 否 | 排序方式：ASC/DESC，默认 DESC |

**请求示例：**

```json
{
  "code": "600519",
  "period": 101,
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "page": 1,
  "limit": 50
}
```

**响应示例：**

```json
{
  "code": 0,
  "message": "K线数据查询成功",
  "data": {
    "data": [...],
    "total": 200,
    "page": 1,
    "limit": 50
  }
}
```

---

#### 6. 根据ID获取K线记录

```
POST /klines/get-by-id
```

**请求参数：**

```json
{
  "id": 1
}
```

---

#### 7. 根据股票代码获取K线数据

```
POST /klines/get-by-code
```

**请求参数：**

```json
{
  "code": "600519",
  "period": 101
}
```

---

#### 8. 根据日期范围获取K线数据

```
POST /klines/get-by-date-range
```

**请求参数：**

```json
{
  "code": "600519",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "period": 101
}
```

---

#### 9. 获取最新K线数据

```
POST /klines/get-latest
```

**请求参数：**

```json
{
  "code": "600519",
  "period": 101,
  "count": 10
}
```

---

#### 10. 更新K线记录

```
POST /klines/update
```

**请求参数：**

```json
{
  "id": 1,
  "updateData": {
    "close": 1525.00,
    "high": 1535.00
  }
}
```

---

#### 11. 删除K线记录

```
POST /klines/delete
```

**请求参数：**

```json
{
  "id": 1
}
```

---

#### 12. 批量删除K线记录

```
POST /klines/batch-delete
```

**请求参数：**

```json
{
  "ids": [1, 2, 3, 4, 5]
}
```

---

#### 13. 删除指定股票的K线数据

```
POST /klines/delete-by-code
```

**请求参数：**

```json
{
  "code": "600519",
  "period": 101
}
```

---

#### 14. 删除指定日期范围的K线数据

```
POST /klines/delete-by-date-range
```

**请求参数：**

```json
{
  "code": "600519",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "period": 101
}
```

---

### 统计接口

#### 15. 获取K线统计信息

```
POST /klines/stats
```

**请求参数：**

```json
{
  "code": "600519",
  "period": 101
}
```

**响应示例：**

```json
{
  "code": 0,
  "message": "K线统计信息获取成功",
  "data": {
    "count": "500",
    "minDate": "2022-01-04",
    "maxDate": "2024-01-15",
    "avgClose": 1520.50,
    "maxHigh": 1800.00,
    "minLow": 1200.00,
    "avgVolume": 5000000,
    "totalAmount": 75000000000000
  }
}
```

---

#### 16. 获取已存储的股票代码列表

```
POST /klines/stored-codes
```

**响应示例：**

```json
{
  "code": 0,
  "message": "股票代码列表获取成功",
  "data": ["600519", "000001", "000858"]
}
```

---

#### 17. 获取K线数据总数

```
POST /klines/count
```

**响应示例：**

```json
{
  "code": 0,
  "message": "K线数据总数获取成功",
  "data": {
    "count": 50000
  }
}
```

---

#### 18. 获取指定股票的K线数据数量

```
POST /klines/count-by-code
```

**请求参数：**

```json
{
  "code": "600519",
  "period": 101
}
```

---

## K线周期说明

| period | 说明 |
|--------|------|
| daily / 101 | 日线 |
| weekly / 102 | 周线 |
| monthly / 103 | 月线 |
| 1min / 1 | 1分钟线 |
| 5min / 5 | 5分钟线 |
| 15min / 15 | 15分钟线 |
| 30min / 30 | 30分钟线 |
| 60min / 60 | 60分钟线 |

## 复权类型说明

| fqType | 说明 |
|--------|------|
| 0 | 不复权 |
| 1 | 前复权（默认） |
| 2 | 后复权 |

## 数据库表结构

```sql
CREATE TABLE `klines` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(20) NOT NULL COMMENT '股票代码',
  `name` varchar(100) DEFAULT NULL COMMENT '股票名称',
  `market` varchar(20) DEFAULT NULL COMMENT '市场类型',
  `period` int NOT NULL DEFAULT 101 COMMENT 'K线周期',
  `date` varchar(30) NOT NULL COMMENT '日期/时间',
  `open` decimal(12,4) NOT NULL COMMENT '开盘价',
  `close` decimal(12,4) NOT NULL COMMENT '收盘价',
  `high` decimal(12,4) NOT NULL COMMENT '最高价',
  `low` decimal(12,4) NOT NULL COMMENT '最低价',
  `volume` bigint NOT NULL COMMENT '成交量(股)',
  `amount` decimal(20,4) NOT NULL COMMENT '成交额(元)',
  `amplitude` decimal(10,4) DEFAULT NULL COMMENT '振幅(%)',
  `pct` decimal(10,4) DEFAULT NULL COMMENT '涨跌幅(%)',
  `change` decimal(12,4) DEFAULT NULL COMMENT '涨跌额',
  `turnover` decimal(10,4) DEFAULT NULL COMMENT '换手率(%)',
  `fqType` int NOT NULL DEFAULT 1 COMMENT '复权类型',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_code_date_period` (`code`, `date`, `period`),
  KEY `idx_code` (`code`),
  KEY `idx_date` (`date`),
  KEY `idx_market` (`market`),
  KEY `idx_period` (`period`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```
