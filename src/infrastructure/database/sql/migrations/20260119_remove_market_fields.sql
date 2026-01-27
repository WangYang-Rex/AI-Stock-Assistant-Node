-- =============================================
-- K线数据表迁移脚本
-- =============================================
-- 用途: 移除 market 和 marketCode 字段及相关索引
-- 执行时间: 2026-01-19
-- =============================================

-- 注意：执行前请先备份数据库！

-- 1. 删除 market 字段的索引（如果存在）
ALTER TABLE `klines` DROP INDEX IF EXISTS `idx_market`;

-- 2. 删除 marketCode 字段的索引（如果存在）
ALTER TABLE `klines` DROP INDEX IF EXISTS `idx_marketCode`;

-- 3. 删除 period 字段的索引（如果存在，因为实体中没有定义）
ALTER TABLE `klines` DROP INDEX IF EXISTS `idx_period`;

-- 4. 删除旧的唯一索引（如果存在 marketCode 的版本）
ALTER TABLE `klines` DROP INDEX IF EXISTS `idx_code_marketCode_date_period`;

-- 5. 确保正确的唯一索引存在
-- 先检查是否存在，如果不存在则创建
-- MySQL 8.0+ 可以使用 IF NOT EXISTS，否则需要先检查
ALTER TABLE `klines` 
ADD UNIQUE INDEX IF NOT EXISTS `idx_code_date_period` (`code`, `date`, `period`);

-- 6. 删除 marketCode 字段（如果存在）
ALTER TABLE `klines` DROP COLUMN IF EXISTS `marketCode`;

-- 7. 删除 market 字段（如果存在）
ALTER TABLE `klines` DROP COLUMN IF EXISTS `market`;

-- =============================================
-- 验证迁移结果
-- =============================================
-- 执行以下查询验证表结构是否正确：

-- 查看表结构
-- DESCRIBE `klines`;

-- 查看索引
-- SHOW INDEX FROM `klines`;

-- 预期结果：
-- 1. 字段列表中不应包含 market 和 marketCode
-- 2. 索引列表应包含：
--    - PRIMARY (id)
--    - idx_code_date_period (UNIQUE, code + date + period)
--    - idx_code (code)
--    - idx_date (date)
