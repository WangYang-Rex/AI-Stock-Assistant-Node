# K线实体 marketCode 字段优化说明

## 修改概述

为 `Kline` 实体添加了 `marketCode` 字段，用于标识股票所属的市场代码（上交所为1，深交所为0），并优化了相关的服务方法。

## 详细修改内容

### 1. 实体层修改 (`src/entities/kline.entity.ts`)

#### 新增字段
```typescript
/** 市场代码(1-上交所、0-深交所) */
@Column({ type: 'varchar', length: 20, nullable: true, comment: '市场代码' })
marketCode: number;
```

#### 优化索引
- **新增独立索引**: 为 `marketCode` 字段添加了独立索引，提升基于市场代码的查询性能
  ```typescript
  @Index(['marketCode'])
  ```

- **更新唯一索引**: 将唯一索引从 `['code', 'date', 'period']` 更新为 `['code', 'marketCode', 'date', 'period']`
  ```typescript
  @Index(['code', 'marketCode', 'date', 'period'], { unique: true })
  ```
  
  这样可以更准确地保证数据唯一性，因为同一个股票代码可能在不同市场存在（虽然实际情况较少）。

### 2. 服务层优化 (`src/kline/kline.service.ts`)

#### `fetchKlineFromApi` 方法
- **添加 marketCode 提取逻辑**:
  ```typescript
  // 获取市场类型和市场代码
  // secid 格式: "1.600519" (上交所) 或 "0.000001" (深交所)
  const market = secid.startsWith('1.') ? 'SH' : 'SZ';
  const marketCode = secid.startsWith('1.') ? 1 : 0;
  ```

- **在数据映射时赋值 marketCode**:
  ```typescript
  kline.marketCode = marketCode;
  ```

#### `syncKlineData` 方法
- **更新 upsert 查询条件**: 在查找现有记录时，将 `marketCode` 纳入查询条件
  ```typescript
  const existing = await this.klineRepository.findOne({
    where: {
      code: kline.code,
      marketCode: kline.marketCode,  // 新增
      date: kline.date,
      period: kline.period,
    },
  });
  ```

- **更新记录时包含 marketCode**:
  ```typescript
  await this.klineRepository.update(existing.id, {
    // ... 其他字段
    marketCode: kline.marketCode,  // 新增
  });
  ```

## 数据库迁移

### 自动同步（开发环境）
项目在开发环境下启用了 TypeORM 的 `synchronize: true` 配置，因此：
- **重启应用后会自动添加 `marketCode` 字段**
- **会自动创建相关索引**
- **不需要手动执行 SQL 脚本**

### 生产环境迁移
如果需要在生产环境部署，建议手动执行以下 SQL：

```sql
-- 1. 添加 marketCode 字段
ALTER TABLE `klines` 
ADD COLUMN `marketCode` VARCHAR(20) NULL COMMENT '市场代码' 
AFTER `market`;

-- 2. 根据现有 market 字段填充 marketCode
UPDATE `klines` 
SET `marketCode` = CASE 
  WHEN `market` = 'SH' THEN '1'
  WHEN `market` = 'SZ' THEN '0'
  ELSE NULL 
END;

-- 3. 删除旧的唯一索引
ALTER TABLE `klines` 
DROP INDEX `IDX_code_date_period`;

-- 4. 创建新的唯一索引
ALTER TABLE `klines` 
ADD UNIQUE INDEX `IDX_code_marketCode_date_period` (`code`, `marketCode`, `date`, `period`);

-- 5. 创建 marketCode 独立索引
ALTER TABLE `klines` 
ADD INDEX `IDX_marketCode` (`marketCode`);
```

## 使用示例

### 获取K线数据
```typescript
// 服务会自动设置 marketCode
const klines = await klineService.fetchKlineFromApi({
  code: '600519',
  period: 'daily',
  limit: 100,
});

// klines 中的每条记录都会包含 marketCode 字段
// 例如: { code: '600519', market: 'SH', marketCode: 1, ... }
```

### 同步K线数据
```typescript
// 同步时会使用 code + marketCode + date + period 作为唯一标识
const result = await klineService.syncKlineData({
  code: '600519',
  period: 'daily',
  limit: 100,
});

console.log(`同步成功: ${result.synced}/${result.total}`);
```

### 查询特定市场的K线
```typescript
// 可以基于 marketCode 进行查询（得益于新增的索引）
const shKlines = await klineRepository.find({
  where: {
    marketCode: 1,  // 上交所
    period: 101,
  },
  order: { date: 'DESC' },
  take: 100,
});
```

## 性能优化

1. **索引优化**: 
   - 为 `marketCode` 添加了独立索引，提升基于市场代码的查询性能
   - 更新了唯一索引，确保数据完整性的同时优化查询效率

2. **数据完整性**: 
   - 通过在唯一索引中包含 `marketCode`，更准确地保证数据唯一性
   - 在 upsert 逻辑中使用 `marketCode`，避免潜在的数据冲突

3. **查询灵活性**: 
   - 可以方便地按市场代码筛选K线数据
   - 支持跨市场的数据分析和统计

## 注意事项

1. **现有数据**: 如果数据库中已有K线数据，在生产环境需要手动执行迁移 SQL 来填充 `marketCode` 字段
2. **API 兼容性**: 所有现有的 API 接口保持兼容，`marketCode` 会自动填充
3. **字段类型**: `marketCode` 定义为 `varchar(20)` 类型，虽然当前只存储 0 或 1，但为未来扩展预留了空间

## 测试建议

1. **单元测试**: 验证 `marketCode` 在不同股票代码下的正确性
2. **集成测试**: 测试同步功能是否正确处理 `marketCode`
3. **性能测试**: 验证新索引对查询性能的提升

## 后续优化建议

1. 考虑在 `QueryKlineOptions` 接口中添加 `marketCode` 参数，支持按市场代码查询
2. 在统计方法中增加按市场分组的功能
3. 考虑添加市场代码的枚举类型，提高代码可读性
