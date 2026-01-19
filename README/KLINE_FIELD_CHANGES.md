# K线实体字段优化记录

## 最新更新 (2026-01-19 23:17)

### ✅ 移除市场类型和市场代码字段 + SQL 文件同步更新

已从 `Kline` 实体中移除以下字段，并同步更新了 SQL 文件：
- `market` (市场类型)
- `marketCode` (市场代码)

### 📋 修改详情

#### 1. **实体层修改** (`src/entities/kline.entity.ts`)

- ❌ **移除字段**
  - `market: string` - 市场类型（SH-上海、SZ-深圳）
  - `marketCode: number` - 市场代码（1-上交所、0-深交所）

- ✅ **恢复索引结构**
  - 移除索引: `@Index(['marketCode'])` 和 `@Index(['market'])`
  - 恢复唯一索引: `['code', 'date', 'period']`（从 `['code', 'marketCode', 'date', 'period']` 恢复）

#### 2. **服务层修改** (`src/kline/kline.service.ts`)

- ✅ **`fetchKlineFromApi` 方法**
  - 移除市场类型和市场代码的提取逻辑
  - 移除数据映射时的 `market` 和 `marketCode` 赋值

- ✅ **`syncKlineData` 方法**
  - 更新 upsert 查询条件，移除 `marketCode`
  - 更新记录时移除 `market` 和 `marketCode` 字段

#### 3. **SQL 文件更新** (`src/database/sql/kline.sql`)

- ✅ **移除字段定义**
  - 移除 `market` 字段
  - 移除 `marketCode` 字段（如果存在）

- ✅ **优化索引结构**
  - 移除 `idx_market` 索引
  - 移除 `idx_period` 索引（实体中未定义）
  - 保留核心索引：
    - `idx_code_date_period` (UNIQUE)
    - `idx_code`
    - `idx_date`

### 🎯 当前实体结构

```typescript
@Entity('klines')
@Index(['code', 'date', 'period'], { unique: true })
@Index(['code'])
@Index(['date'])
export class Kline {
  id: number;
  code: string;           // 股票代码
  name: string;           // 股票名称
  period: number;         // K线周期
  date: string;           // 日期/时间
  open: number;           // 开盘价
  close: number;          // 收盘价
  high: number;           // 最高价
  low: number;            // 最低价
  volume: number;         // 成交量
  amount: number;         // 成交额
  amplitude: number;      // 振幅
  pct: number;            // 涨跌幅
  change: number;         // 涨跌额
  turnover: number;       // 换手率
  fqType: number;         // 复权类型
  createdAt: Date;        // 创建时间
  updatedAt: Date;        // 更新时间
}
```

### 🔄 数据库迁移

#### SQL 文件更新
✅ **已更新**: `src/database/sql/kline.sql`
- 移除 `market` 字段定义
- 移除 `idx_market` 和 `idx_period` 索引
- 保留核心索引：`idx_code_date_period` (UNIQUE), `idx_code`, `idx_date`

✅ **迁移脚本**: `src/database/sql/migrations/20260119_remove_market_fields.sql`
- 提供了完整的数据库迁移 SQL 脚本
- 包含索引删除、字段删除和验证步骤
- 使用 `IF EXISTS` 和 `IF NOT EXISTS` 确保安全执行

#### 开发环境（自动同步）
```bash
# 重启应用，TypeORM 会自动移除 market 和 marketCode 字段
npm run start:dev
```

#### 生产环境（手动迁移）

**⚠️ 重要提示：执行前请先备份数据库！**

**方式一：使用迁移脚本（推荐）**
```bash
mysql -u username -p database_name < src/database/sql/migrations/20260119_remove_market_fields.sql
```

**方式二：手动执行 SQL**
```sql
-- 1. 删除相关索引
ALTER TABLE `klines` DROP INDEX IF EXISTS `idx_market`;
ALTER TABLE `klines` DROP INDEX IF EXISTS `idx_marketCode`;
ALTER TABLE `klines` DROP INDEX IF EXISTS `idx_period`;

-- 2. 删除旧的唯一索引（如果存在 marketCode 版本）
ALTER TABLE `klines` DROP INDEX IF EXISTS `idx_code_marketCode_date_period`;

-- 3. 确保正确的唯一索引存在
ALTER TABLE `klines` 
ADD UNIQUE INDEX IF NOT EXISTS `idx_code_date_period` (`code`, `date`, `period`);

-- 4. 删除字段
ALTER TABLE `klines` DROP COLUMN IF EXISTS `marketCode`;
ALTER TABLE `klines` DROP COLUMN IF EXISTS `market`;
```

**验证迁移结果**
```sql
-- 查看表结构
DESCRIBE `klines`;

-- 查看索引
SHOW INDEX FROM `klines`;

-- 预期结果：
-- 1. 字段列表中不应包含 market 和 marketCode
-- 2. 索引列表应包含：
--    - PRIMARY (id)
--    - idx_code_date_period (UNIQUE, code + date + period)
--    - idx_code (code)
--    - idx_date (date)
```

### ✅ 编译验证

已通过 TypeScript 编译验证，无错误：
```bash
✓ npm run build - 编译成功
```

### 📝 说明

移除这两个字段的原因：
1. **简化数据模型**: 减少冗余字段，K线数据本身不需要存储市场信息
2. **数据一致性**: 市场信息应该从股票代码本身推导，而不是存储在K线表中
3. **性能优化**: 减少字段数量可以降低存储空间和查询开销
4. **职责分离**: K线表专注于价格数据，市场信息由股票表管理

如需获取市场信息，可以：
- 从股票代码推导（6开头为上交所，0/3开头为深交所）
- 关联查询 `stocks` 表获取完整的市场信息

### 📁 更新的文件清单

1. ✅ `src/entities/kline.entity.ts` - 移除字段和索引
2. ✅ `src/kline/kline.service.ts` - 移除相关逻辑
3. ✅ `src/database/sql/kline.sql` - 更新表结构定义
4. ✅ `src/database/sql/migrations/20260119_remove_market_fields.sql` - 迁移脚本

---

## 历史记录

### 2026-01-19 22:44 - 添加 marketCode 字段
- 添加了 `market` 和 `marketCode` 字段
- 优化了索引结构
- 更新了服务层逻辑

### 2026-01-19 22:51 - 移除 market 和 marketCode 字段
- 移除了 `market` 和 `marketCode` 字段
- 恢复了原始索引结构
- 简化了服务层逻辑

### 2026-01-19 23:17 - 同步更新 SQL 文件
- 更新了 `kline.sql` 表结构定义
- 创建了数据库迁移脚本
- 完善了迁移文档和验证步骤
