# SQL文件更新总结

## 更新内容

根据 `src/entities/` 目录中的实体定义，对SQL文件进行了以下更新：

### 1. 股票基础信息表 (stocks)

**字段更新：**
- `symbol` → `code` (字段名统一)
- `marketCode` 类型从 `varchar(20)` 改为 `int`
- 新增字段：
  - `openPrice` decimal(10,2) - 开盘价
  - `highPrice` decimal(10,2) - 最高价  
  - `lowPrice` decimal(10,2) - 最低价
  - `previousClosePrice` decimal(10,2) - 昨收价
  - `volume` bigint - 成交量(股)
  - `holdingQuantity` decimal(15,2) - 持仓数量
  - `holdingCost` decimal(10,2) - 持仓成本
  - `marketValue` decimal(15,2) - 市值

**索引更新：**
- 唯一键从 `symbol` 改为 `code`

### 2. 行情快照表 (quotes)

**新增字段：**
- `amplitude` decimal(8,4) - 振幅(%)
- `turnoverRate` decimal(8,4) - 换手率(%)

### 3. 其他表

- **AI信号表 (ai_signals)**: 无需更改，与实体定义一致
- **交易记录表 (trading_records)**: 无需更改，与实体定义一致

## 更新的文件

1. `create-all-tables-simple.sql` - 更新了stocks和quotes表结构
2. `stock.sql` - 更新了stocks表结构
3. `create-all-tables-updated.sql` - 新建的完整SQL文件
4. `create-table.js` - 更新为使用新的SQL文件

## 数据类型说明

- 所有价格相关字段单位为元
- 涨跌幅、振幅、换手率以百分比形式表示
- 成交量和成交额均为当日累计数据
- 持仓相关字段用于记录用户持仓信息

## 注意事项

- 所有字段的数据类型、长度、精度都与TypeORM实体定义保持一致
- 索引设置考虑了查询性能优化
- 字符集使用utf8mb4，支持完整的Unicode字符
