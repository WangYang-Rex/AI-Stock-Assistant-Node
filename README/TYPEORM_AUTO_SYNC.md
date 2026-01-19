# TypeORM 自动同步机制详解

## 核心配置

在 `src/database/database.module.ts` 文件中，有一个关键配置：

```typescript
TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    type: 'mysql',
    host: configService.get('DB_HOST'),
    port: configService.get('DB_PORT'),
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    database: configService.get('DB_DATABASE'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    
    // 🔑 关键配置：自动同步
    synchronize: configService.get('NODE_ENV') === 'development',
    
    // 开启日志（开发环境）
    logging: configService.get('NODE_ENV') === 'development',
  }),
  inject: [ConfigService],
}),
```

## 工作原理

### 1. **`synchronize` 配置项**

```typescript
synchronize: configService.get('NODE_ENV') === 'development'
```

这个配置的含义：
- **开发环境** (`NODE_ENV === 'development'`): `synchronize = true`
- **生产环境** (`NODE_ENV === 'production'`): `synchronize = false`

### 2. **自动同步的工作流程**

当 `synchronize: true` 时，TypeORM 在应用启动时会执行以下步骤：

#### 步骤 1: 扫描实体文件
```typescript
entities: [__dirname + '/../**/*.entity{.ts,.js}']
```
- 扫描 `src` 目录下所有 `.entity.ts` 或 `.entity.js` 文件
- 解析实体装饰器（`@Entity`, `@Column`, `@Index` 等）
- 构建内存中的数据模型

#### 步骤 2: 读取数据库当前结构
- 连接到 MySQL 数据库
- 查询当前表结构（`SHOW TABLES`, `DESCRIBE table_name`, `SHOW INDEX` 等）
- 构建数据库的当前状态模型

#### 步骤 3: 对比差异
TypeORM 会对比：
- **表**: 是否需要创建、删除或重命名
- **列**: 是否需要添加、删除、修改（类型、长度、默认值等）
- **索引**: 是否需要创建或删除（包括唯一索引、普通索引）
- **外键**: 是否需要创建或删除

#### 步骤 4: 生成并执行 SQL
根据差异自动生成并执行 SQL 语句，例如：

```sql
-- 添加字段
ALTER TABLE `klines` ADD COLUMN `newField` varchar(100) NULL;

-- 删除字段
ALTER TABLE `klines` DROP COLUMN `oldField`;

-- 修改字段
ALTER TABLE `klines` MODIFY COLUMN `name` varchar(100) NULL COMMENT '股票名称';

-- 创建索引
CREATE INDEX `idx_code` ON `klines` (`code`);

-- 删除索引
DROP INDEX `idx_market` ON `klines`;

-- 创建唯一索引
CREATE UNIQUE INDEX `idx_code_date_period` ON `klines` (`code`, `date`, `period`);
```

## 实际案例：移除 market 字段

### 修改前的实体
```typescript
@Entity('klines')
@Index(['code', 'marketCode', 'date', 'period'], { unique: true })
@Index(['code'])
@Index(['marketCode'])
@Index(['date'])
@Index(['market'])
export class Kline {
  // ...
  market: string;
  marketCode: number;
  // ...
}
```

### 修改后的实体
```typescript
@Entity('klines')
@Index(['code', 'date', 'period'], { unique: true })
@Index(['code'])
@Index(['date'])
export class Kline {
  // ...
  // market 和 marketCode 字段已删除
  // ...
}
```

### TypeORM 自动执行的 SQL

当你运行 `npm run start:dev` 时，TypeORM 会自动执行：

```sql
-- 1. 删除旧的唯一索引
DROP INDEX `idx_code_marketCode_date_period` ON `klines`;

-- 2. 删除相关索引
DROP INDEX `idx_marketCode` ON `klines`;
DROP INDEX `idx_market` ON `klines`;

-- 3. 创建新的唯一索引
CREATE UNIQUE INDEX `idx_code_date_period` ON `klines` (`code`, `date`, `period`);

-- 4. 删除字段
ALTER TABLE `klines` DROP COLUMN `marketCode`;
ALTER TABLE `klines` DROP COLUMN `market`;
```

## 查看同步日志

因为配置了 `logging: true`（开发环境），你可以在控制台看到执行的 SQL：

```bash
npm run start:dev
```

输出示例：
```
[Nest] 91305  - 01/19/2026, 11:21:46 PM     LOG [TypeOrmModule] 
query: DROP INDEX `idx_market` ON `klines`
[Nest] 91305  - 01/19/2026, 11:21:46 PM     LOG [TypeOrmModule] 
query: DROP INDEX `idx_marketCode` ON `klines`
[Nest] 91305  - 01/19/2026, 11:21:46 PM     LOG [TypeOrmModule] 
query: ALTER TABLE `klines` DROP COLUMN `market`
[Nest] 91305  - 01/19/2026, 11:21:46 PM     LOG [TypeOrmModule] 
query: ALTER TABLE `klines` DROP COLUMN `marketCode`
```

## 优缺点分析

### ✅ 优点

1. **开发效率高**
   - 无需手动编写迁移 SQL
   - 修改实体后自动同步
   - 快速迭代开发

2. **减少人为错误**
   - 自动生成正确的 SQL 语句
   - 避免手动编写 SQL 的语法错误

3. **保持一致性**
   - 实体定义即数据库结构
   - 代码和数据库始终同步

### ⚠️ 缺点和风险

1. **数据丢失风险**
   - 删除字段会直接删除数据
   - 重命名字段会被识别为删除+创建
   - **生产环境绝对不能使用！**

2. **无法回滚**
   - 没有迁移历史记录
   - 无法轻松回退到之前的版本

3. **复杂变更处理不佳**
   - 数据迁移逻辑无法自动处理
   - 字段重命名需要手动处理

4. **性能问题**
   - 每次启动都要对比结构
   - 大型项目启动会变慢

## 最佳实践

### 开发环境
```typescript
// ✅ 推荐：开发环境使用自动同步
synchronize: process.env.NODE_ENV === 'development'
```

### 生产环境
```typescript
// ✅ 推荐：生产环境禁用自动同步
synchronize: false

// 使用迁移脚本
migrations: ['dist/migrations/**/*.js'],
migrationsRun: true,
```

### 迁移策略

**开发阶段**：
1. 修改实体文件
2. 运行 `npm run start:dev`
3. TypeORM 自动同步数据库

**准备上线**：
1. 根据实体变更编写迁移 SQL
2. 在测试环境验证迁移脚本
3. 生产环境手动执行迁移

## 环境变量配置

确保 `.env` 文件中正确配置：

```bash
# 开发环境
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=stock_assistant
```

```bash
# 生产环境
NODE_ENV=production
DB_HOST=prod-db-host
DB_PORT=3306
DB_USERNAME=prod_user
DB_PASSWORD=secure_password
DB_DATABASE=stock_assistant_prod
```

## 验证同步结果

### 方法 1: 查看日志
```bash
npm run start:dev
# 观察控制台输出的 SQL 语句
```

### 方法 2: 查询数据库
```sql
-- 查看表结构
DESCRIBE klines;

-- 查看索引
SHOW INDEX FROM klines;

-- 查看建表语句
SHOW CREATE TABLE klines;
```

### 方法 3: 使用数据库客户端
- Navicat
- MySQL Workbench
- DBeaver
- TablePlus

## 总结

TypeORM 的自动同步机制通过以下方式实现：

1. **配置启用**: `synchronize: true`
2. **扫描实体**: 读取所有 `.entity.ts` 文件
3. **对比差异**: 比较实体定义和数据库结构
4. **自动执行**: 生成并执行 DDL 语句

这个机制极大地提高了开发效率，但**仅适用于开发环境**。生产环境必须使用手动迁移脚本来确保数据安全和可控性。

---

**相关文件**：
- 配置文件: `src/database/database.module.ts`
- 实体文件: `src/entities/*.entity.ts`
- 迁移脚本: `src/database/sql/migrations/*.sql`
