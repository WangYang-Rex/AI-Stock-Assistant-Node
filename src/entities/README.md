### 建表
- 根据entities中的模型，生成建表sql

## 字段列表

| 字段名 | 中文名称 | 数据类型 | 说明 |
|--------|----------|----------|------|
| `code` | 股票代码 | String | 股票的唯一标识码 |
| `name` | 股票名称 | String | 股票的正式名称 |
| `market` | 市场 | String | 所属交易市场 |
| `marketCode` | 市场代码 | String | 市场的唯一标识码 |
| `pe` | 市盈率 | Number | 价格收益比率 |
| `latestPrice` | 最新价 | Number | 当前最新成交价格 |
| `changePercent` | 涨跌幅 | Number | 相对于前一交易日的涨跌百分比 |
| `changeAmount` | 涨跌额 | Number | 相对于前一交易日的涨跌金额 |
| `openPrice` | 开盘价 | Number | 当日开盘价格 |
| `highPrice` | 最高价 | Number | 当日最高成交价格 |
| `lowPrice` | 最低价 | Number | 当日最低成交价格 |
| `volume` | 成交量 | Number | 当日成交的股票数量 |
| `volumeAmount` | 成交额 | Number | 当日成交的总金额 |
| `previousClosePrice` | 昨收价 | Number | 前一交易日的收盘价格 |
| `amplitude` | 振幅 | Number | 当日最高价与最低价的差值占昨收价的比例 |
| `turnoverRate` | 换手率 | Number | 当日成交量占流通股本的比例 |


## 注意事项
- 所有价格相关字段单位为元
- 涨跌幅以百分比形式表示（如：5.67 表示上涨5.67%）
- 成交量和成交额均为当日累计数据
- 振幅以百分比形式表示（如：3.45 表示振幅3.45%）
- 换手率以百分比形式表示（如：2.18 表示换手率2.18%）