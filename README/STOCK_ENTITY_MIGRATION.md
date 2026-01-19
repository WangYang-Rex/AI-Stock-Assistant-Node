# Stock 实体字段变更说明

## 变更时间
2026-01-19 23:56

## 变更概述
Stock 实体进行了重大重构，简化了字段结构，移除了持仓相关字段和冗余的价格字段。

## 字段映射关系

### ✅ 保留字段（字段名相同）
| 字段名 | 类型 | 说明 |
|--------|------|------|
| `code` | string | 股票代码 |
| `name` | string | 股票名称 |
| `volume` | number | 成交量 |

### 🔄 字段名变更
| 旧字段名 | 新字段名 | 类型变化 | 说明 |
|----------|----------|----------|------|
| `marketCode` | `market` | varchar(20) → int | 市场代码（1-上交所、0-深交所） |
| `market` | `marketType` | varchar(20) → varchar(20) | 市场类型（SH/SZ） |
| `latestPrice` | `price` | decimal(10,6) → decimal(12,4) | 最新价 |
| `changePercent` | `pct` | decimal(8,6) → decimal(10,4) | 涨跌幅 |
| `changeAmount` | `change` | decimal(10,6) → decimal(12,4) | 涨跌额 |

### ➕ 新增字段
| 字段名 | 类型 | 说明 |
|--------|------|------|
| `amount` | decimal(20,4) | 成交额（元） |
| `totalMarketCap` | decimal(20,4) | 总市值（元） |
| `floatMarketCap` | decimal(20,4) | 流通市值（元） |
| `turnover` | decimal(10,4) | 换手率（%） |

### ❌ 移除字段
| 字段名 | 类型 | 说明 |
|--------|------|------|
| `pe` | decimal(8,6) | 市盈率 |
| `openPrice` | decimal(10,6) | 开盘价 |
| `highPrice` | decimal(10,6) | 最高价 |
| `lowPrice` | decimal(10,6) | 最低价 |
| `previousClosePrice` | decimal(10,6) | 昨收价 |
| `holdingQuantity` | decimal(15,0) | 持仓数量 |
| `holdingCost` | decimal(10,6) | 持仓成本 |
| `marketValue` | decimal(15,6) | 市值 |

## 新实体结构

```typescript
export class Stock {
  id: number;                    // 主键
  code: string;                  // 股票代码
  name: string;                  // 股票名称
  market: number;                // 市场代码（1-上交所、0-深交所）
  marketType: string;            // 市场类型（SH-上海、SZ-深圳）
  price: number;                 // 最新价
  pct: number;                   // 涨跌幅（%）
  change: number;                // 涨跌额
  volume: number;                // 成交量（股）
  amount: number;                // 成交额（元）
  totalMarketCap: number;        // 总市值（元）
  floatMarketCap: number;        // 流通市值（元）
  turnover: number;              // 换手率（%）
  createdAt: Date;               // 创建时间
  updatedAt: Date;               // 更新时间
}
```

## 需要更新的文件

### 1. Service 文件
- ✅ `src/entities/stock.entity.ts` - 已更新
- ⚠️ `src/stock/stock.service.ts` - 需要更新
- ⚠️ `src/quotes/quotes.service.ts` - 需要更新
- ⚠️ `src/scheduler/scheduler.service.ts` - 需要更新

### 2. Controller 文件
- ⚠️ `src/stock/stock.controller.ts` - 需要更新
- ⚠️ `src/quotes/quotes.controller.ts` - 需要更新

### 3. Utility 文件
- ⚠️ `src/lib/stock/stockUtil.ts` - 需要更新
- ⚠️ `src/lib/stock/getTrendsData.ts` - 需要更新

## 代码更新指南

### 1. 字段访问更新

#### 旧代码
```typescript
// 访问市场代码
stock.marketCode  // ❌

// 访问市场类型
stock.market      // ❌

// 访问最新价
stock.latestPrice // ❌

// 访问涨跌幅
stock.changePercent // ❌

// 访问持仓数量
stock.holdingQuantity // ❌
```

#### 新代码
```typescript
// 访问市场代码
stock.market      // ✅ 现在是 number 类型

// 访问市场类型
stock.marketType  // ✅

// 访问最新价
stock.price       // ✅

// 访问涨跌幅
stock.pct         // ✅

// 持仓数据已移除，需要从其他表获取
// 建议创建独立的 Holding 表
```

### 2. 查询更新

#### 旧代码
```typescript
// 按市场代码查询
stockRepository.find({ where: { marketCode: 1 } }) // ❌
```

#### 新代码
```typescript
// 按市场代码查询
stockRepository.find({ where: { market: 1 } }) // ✅
```

### 3. 创建/更新数据

#### 旧代码
```typescript
const stock = {
  code: '600519',
  name: '贵州茅台',
  market: 'SH',           // ❌
  marketCode: 1,          // ❌
  latestPrice: 1800.50,   // ❌
  changePercent: 2.5,     // ❌
  holdingQuantity: 100,   // ❌
};
```

#### 新代码
```typescript
const stock = {
  code: '600519',
  name: '贵州茅台',
  market: 1,              // ✅ 数字类型
  marketType: 'SH',       // ✅
  price: 1800.50,         // ✅
  pct: 2.5,               // ✅
  amount: 1000000,        // ✅ 新增
  totalMarketCap: 2260000000000, // ✅ 新增
  floatMarketCap: 2260000000000, // ✅ 新增
  turnover: 0.5,          // ✅ 新增
};
```

## 数据库迁移

### 开发环境
```bash
# TypeORM 会自动同步（如果 synchronize: true）
npm run start:dev
```

### 生产环境
```sql
-- 1. 添加新字段
ALTER TABLE `stocks` 
ADD COLUMN `marketType` varchar(20) NULL COMMENT '市场类型' AFTER `market`,
ADD COLUMN `amount` decimal(20,4) NULL COMMENT '成交额(元)' AFTER `volume`,
ADD COLUMN `totalMarketCap` decimal(20,4) NULL COMMENT '总市值(元)' AFTER `amount`,
ADD COLUMN `floatMarketCap` decimal(20,4) NULL COMMENT '流通市值(元)' AFTER `totalMarketCap`,
ADD COLUMN `turnover` decimal(10,4) NULL COMMENT '换手率(%)' AFTER `floatMarketCap`;

-- 2. 数据迁移
-- 2.1 将 market 字段的值复制到 marketType
UPDATE `stocks` SET `marketType` = `market`;

-- 2.2 将 marketCode 字段的值复制到新的 market 字段（需要先修改类型）
-- 注意：这一步需要先创建临时字段
ALTER TABLE `stocks` ADD COLUMN `market_new` int NULL COMMENT '市场代码';
UPDATE `stocks` SET `market_new` = CAST(`marketCode` AS SIGNED);

-- 2.3 重命名字段
ALTER TABLE `stocks` 
CHANGE COLUMN `latestPrice` `price` decimal(12,4) NULL COMMENT '最新价',
CHANGE COLUMN `changePercent` `pct` decimal(10,4) NULL COMMENT '涨跌幅(%)',
CHANGE COLUMN `changeAmount` `change` decimal(12,4) NULL COMMENT '涨跌额';

-- 2.4 删除旧的 market 字段，重命名 market_new
ALTER TABLE `stocks` DROP COLUMN `market`;
ALTER TABLE `stocks` CHANGE COLUMN `market_new` `market` int NULL COMMENT '市场代码';

-- 3. 删除不需要的字段
ALTER TABLE `stocks` 
DROP COLUMN `marketCode`,
DROP COLUMN `pe`,
DROP COLUMN `openPrice`,
DROP COLUMN `highPrice`,
DROP COLUMN `lowPrice`,
DROP COLUMN `previousClosePrice`,
DROP COLUMN `holdingQuantity`,
DROP COLUMN `holdingCost`,
DROP COLUMN `marketValue`;

-- 4. 更新索引
DROP INDEX `IDX_d2a1ef45ed425faef236585776` ON `stocks`; -- 删除旧的 market 索引
CREATE INDEX `IDX_market` ON `stocks` (`market`); -- 创建新的 market 索引
```

## 注意事项

1. **持仓数据**: 如果需要持仓功能，建议创建独立的 `Holdings` 表
2. **市场代码**: `market` 字段从 `string` 改为 `number`，需要更新所有相关代码
3. **字段重命名**: 很多字段名称发生了变化，需要全局搜索替换
4. **数据精度**: 某些字段的精度发生了变化（如 price 从 10,6 改为 12,4）
5. **移除字段**: 开盘价、最高价、最低价等字段已移除，这些数据应该从 Kline 表获取

## 建议的后续步骤

1. **创建 Holdings 表**: 用于存储持仓数据
2. **更新所有 Service**: 修改字段访问方式
3. **更新所有 Controller**: 修改 API 接口参数
4. **更新前端代码**: 如果有前端，需要同步更新
5. **数据迁移脚本**: 编写完整的数据迁移脚本
6. **测试**: 全面测试所有功能

## 回滚方案

如果需要回滚，可以：
1. 恢复旧的 `stock.entity.ts` 文件
2. 执行数据库回滚脚本
3. 恢复所有相关的 Service 和 Controller 文件

---

**生成时间**: 2026-01-19 23:56
**影响范围**: 高（需要更新多个文件）
**建议**: 分步骤更新，先更新 Service 层，再更新 Controller 层
