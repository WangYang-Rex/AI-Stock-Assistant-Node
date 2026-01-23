-- =============================================
-- K线数据表 (klines)
-- =============================================
-- 用于存储股票的K线历史数据（日线、周线、月线、分钟线等）
-- =============================================

CREATE TABLE `klines` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(20) NOT NULL COMMENT '股票代码',
  `name` varchar(100) DEFAULT NULL COMMENT '股票名称',
  `period` int NOT NULL DEFAULT 101 COMMENT 'K线周期(101=日线, 102=周线, 103=月线, 1/5/15/30/60=分钟线)',
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
  `fqType` int NOT NULL DEFAULT 1 COMMENT '复权类型(0=不复权, 1=前复权, 2=后复权)',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_code_date_period` (`code`, `date`, `period`),
  KEY `idx_code` (`code`),
  KEY `idx_date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='K线数据表';
