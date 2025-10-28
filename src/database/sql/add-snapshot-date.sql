-- =============================================
-- 添加快照日期字段的迁移脚本
-- =============================================

-- 为quotes表添加snapshotDate字段
ALTER TABLE `quotes` 
ADD COLUMN `snapshotDate` date NOT NULL COMMENT '快照日期' AFTER `snapshotTime`;

-- 添加索引
ALTER TABLE `quotes` 
ADD INDEX `idx_snapshotDate` (`snapshotDate`),
ADD INDEX `idx_code_snapshotDate` (`code`, `snapshotDate`);

-- 更新现有数据，将snapshotTime的日期部分复制到snapshotDate
UPDATE `quotes` 
SET `snapshotDate` = DATE(`snapshotTime`) 
WHERE `snapshotDate` IS NULL OR `snapshotDate` = '0000-00-00';

-- 验证数据
SELECT 
    COUNT(*) as total_records,
    COUNT(snapshotDate) as records_with_date,
    MIN(snapshotDate) as earliest_date,
    MAX(snapshotDate) as latest_date
FROM `quotes`;
