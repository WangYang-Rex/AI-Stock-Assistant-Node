-- =============================================
-- 简化版建表SQL - 仅包含表结构
-- =============================================

-- 1. AI信号表
CREATE TABLE `ai_signals` (
  `id` int NOT NULL AUTO_INCREMENT,
  `symbol` varchar(20) NOT NULL COMMENT '股票代码',
  `signalTime` timestamp NOT NULL COMMENT '信号时间',
  `signalType` enum('buy','sell','hold') NOT NULL COMMENT 'AI信号类型',
  `confidence` int NOT NULL COMMENT '信号置信度(0-100)',
  `modelVersion` varchar(50) NOT NULL COMMENT 'AI模型版本号',
  `description` text COMMENT '信号说明或模型解释',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_symbol` (`symbol`),
  KEY `idx_signalTime` (`signalTime`),
  KEY `idx_signalType` (`signalType`),
  KEY `idx_modelVersion` (`modelVersion`),
  KEY `idx_symbol_signalTime` (`symbol`, `signalTime`),
  KEY `idx_signalType_signalTime` (`signalType`, `signalTime`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI信号表';

-- 2. 股票基础信息表
CREATE TABLE `stocks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(20) NOT NULL COMMENT '股票代码',
  `name` varchar(100) NOT NULL COMMENT '股票名称',
  `market` varchar(20) NOT NULL COMMENT '市场类型',
  `marketCode` int NOT NULL COMMENT '市场代码',
  `pe` decimal(8,2) COMMENT '市盈率',
  `latestPrice` decimal(10,2) COMMENT '最新价',
  `changePercent` decimal(8,4) COMMENT '涨跌幅(%)',
  `changeAmount` decimal(10,2) COMMENT '涨跌额',
  `openPrice` decimal(10,2) COMMENT '开盘价',
  `highPrice` decimal(10,2) COMMENT '最高价',
  `lowPrice` decimal(10,2) COMMENT '最低价',
  `previousClosePrice` decimal(10,2) COMMENT '昨收价',
  `volume` bigint COMMENT '成交量(股)',
  `holdingQuantity` decimal(15,2) COMMENT '持仓数量',
  `holdingCost` decimal(10,2) COMMENT '持仓成本',
  `marketValue` decimal(15,2) COMMENT '市值',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_market` (`market`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='股票基础信息表';

-- 3. 行情快照表
CREATE TABLE `quotes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(20) NOT NULL COMMENT '股票代码',
  `name` varchar(100) NOT NULL COMMENT '股票名称',
  `market` varchar(20) NOT NULL COMMENT '市场',
  `marketCode` varchar(20) NOT NULL COMMENT '市场代码',
  `pe` decimal(8,2) COMMENT '市盈率',
  `latestPrice` decimal(10,2) COMMENT '最新价',
  `changePercent` decimal(8,4) COMMENT '涨跌幅(%)',
  `changeAmount` decimal(10,2) COMMENT '涨跌额',
  `openPrice` decimal(10,2) COMMENT '开盘价',
  `highPrice` decimal(10,2) COMMENT '最高价',
  `lowPrice` decimal(10,2) COMMENT '最低价',
  `volume` bigint COMMENT '成交量(股)',
  `volumeAmount` decimal(15,2) COMMENT '成交额(元)',
  `previousClosePrice` decimal(10,2) COMMENT '昨收价',
  `amplitude` decimal(8,4) COMMENT '振幅(%)',
  `turnoverRate` decimal(8,4) COMMENT '换手率(%)',
  `snapshotTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '快照时间',
  `snapshotDate` date NOT NULL COMMENT '快照日期',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_code` (`code`),
  KEY `idx_market` (`market`),
  KEY `idx_snapshotTime` (`snapshotTime`),
  KEY `idx_snapshotDate` (`snapshotDate`),
  KEY `idx_code_snapshotTime` (`code`, `snapshotTime`),
  KEY `idx_code_snapshotDate` (`code`, `snapshotDate`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='行情快照表';

-- 4. 交易记录表
CREATE TABLE `trading_records` (
  `id` int NOT NULL AUTO_INCREMENT,
  `symbol` varchar(20) NOT NULL COMMENT '股票代码',
  `name` varchar(100) NOT NULL COMMENT '股票名称',
  `type` enum('buy','sell') NOT NULL COMMENT '交易类型',
  `tradingTime` timestamp NOT NULL COMMENT '成交时间',
  `quantity` bigint NOT NULL COMMENT '交易数量(股)',
  `price` decimal(10,2) NOT NULL COMMENT '成交价格',
  `fee` decimal(10,2) NOT NULL COMMENT '交易手续费',
  `openPrice` decimal(10,2) COMMENT '开盘价',
  `changePercent` decimal(8,4) COMMENT '涨跌幅',
  `changeAmount` decimal(10,4) COMMENT '涨跌额',
  `remarks` text COMMENT '备注',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_symbol` (`symbol`),
  KEY `idx_tradingTime` (`tradingTime`),
  KEY `idx_symbol_tradingTime` (`symbol`, `tradingTime`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='交易记录表';
