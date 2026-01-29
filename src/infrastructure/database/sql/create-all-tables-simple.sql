-- =============================================
-- 简化版建表SQL - 仅包含表结构
-- =============================================



-- 2. 股票基础信息表
CREATE TABLE `stocks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(20) NOT NULL COMMENT '股票代码',
  `name` varchar(100) NOT NULL COMMENT '股票名称',
  `market` int NOT NULL COMMENT '市场代码（1-上交所、0-深交所）',
  `marketType` varchar(20) NOT NULL COMMENT '市场类型（SH-上海、SZ-深圳）',
  `price` decimal(12,4) COMMENT '最新价',
  `pct` decimal(10,4) COMMENT '涨跌幅(%)',
  `change` decimal(12,4) COMMENT '涨跌额',
  `volume` bigint COMMENT '成交量(股)',
  `amount` decimal(20,4) COMMENT '成交额(元)',
  `totalMarketCap` decimal(20,4) COMMENT '总市值(元)',
  `floatMarketCap` decimal(20,4) COMMENT '流通市值(元)',
  `turnover` decimal(10,4) COMMENT '换手率(%)',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '系统创建时间',
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '系统更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_market` (`market`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='股票基础信息表';

-- 3. 行情快照表
CREATE TABLE `quotes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(20) NOT NULL COMMENT '股票代码',
  `name` varchar(100) NOT NULL COMMENT '股票名称',
  `price` decimal(18,4) COMMENT '最新价',
  `high` decimal(18,4) COMMENT '今日最高价',
  `low` decimal(18,4) COMMENT '今日最低价',
  `open` decimal(18,4) COMMENT '今日开盘价',
  `preClose` decimal(18,4) COMMENT '昨日收盘价',
  `volume` bigint COMMENT '成交量(股)',
  `amount` decimal(20,4) COMMENT '成交额(元)',
  `pct` decimal(10,4) COMMENT '涨跌幅(%)',
  `change` decimal(18,4) COMMENT '涨跌额',
  `turnover` decimal(10,4) COMMENT '换手率(%)',
  `totalMarketCap` decimal(24,4) COMMENT '总市值',
  `floatMarketCap` decimal(24,4) COMMENT '流通市值',
  `pe` decimal(10,4) COMMENT '市盈率(动态)',
  `pb` decimal(10,4) COMMENT '市净率',
  `updateTime` bigint NOT NULL COMMENT '更新时间戳(Unix 时间戳，秒级)',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '系统创建时间',
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '系统更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_code` (`code`),
  KEY `idx_updateTime` (`updateTime`),
  KEY `idx_code_updateTime` (`code`, `updateTime`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='行情快照表';

-- 4. 分时趋势表
CREATE TABLE `trends` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(20) NOT NULL COMMENT '股票代码',
  `name` varchar(100) NOT NULL COMMENT '股票名称',
  `datetime` varchar(20) NOT NULL COMMENT '日期时间（YYYY-MM-DD HH:mm 格式）',
  `price` decimal(18,4) COMMENT '当前价格',
  `avgPrice` decimal(18,4) COMMENT '均价',
  `volume` bigint COMMENT '成交量(股)',
  `amount` decimal(20,4) COMMENT '成交额(元)',
  `pct` decimal(10,4) COMMENT '涨跌幅(%)',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '系统创建时间',
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '系统更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_code` (`code`),
  KEY `idx_datetime` (`datetime`),
  UNIQUE KEY `idx_code_datetime` (`code`, `datetime`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='分时趋势表';

-- 5. 交易记录表
CREATE TABLE `trading_records` (
  `id` int NOT NULL AUTO_INCREMENT,
  `symbol` varchar(20) NOT NULL COMMENT '股票代码',
  `name` varchar(100) NOT NULL COMMENT '股票名称',
  `type` enum('buy','sell') NOT NULL COMMENT '交易类型',
  `tradingTime` timestamp NOT NULL COMMENT '成交时间',
  `quantity` bigint NOT NULL COMMENT '交易数量(股)',
  `price` decimal(10,2) NOT NULL COMMENT '成交价格',
  `amount` decimal(15,2) NOT NULL COMMENT '交易金额(成交价格×数量)',
  `relatedTradingId` int COMMENT '关联交易ID(用于关联买入和卖出交易)',
  `remarks` text COMMENT '备注',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '系统创建时间',
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '系统更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_symbol` (`symbol`),
  KEY `idx_tradingTime` (`tradingTime`),
  KEY `idx_symbol_tradingTime` (`symbol`, `tradingTime`),
  KEY `idx_relatedTradingId` (`relatedTradingId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='交易记录表';

-- 6. K线数据表
CREATE TABLE `klines` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(20) NOT NULL COMMENT '股票代码',
  `name` varchar(100) DEFAULT NULL COMMENT '股票名称',
  `market` varchar(20) DEFAULT NULL COMMENT '市场类型(SH-上海、SZ-深圳)',
  `period` int NOT NULL DEFAULT 101 COMMENT 'K线周期(101=日线, 102=周线, 103=月线, 1/5/15/30/60=分钟线)',
  `date` varchar(20) NOT NULL COMMENT '日期时间（YYYY-MM-DD HH:mm:ss 格式或 YYYY-MM-DD）',
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
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '系统创建时间',
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '系统更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_code_date_period` (`code`, `date`, `period`),
  KEY `idx_code` (`code`),
  KEY `idx_date` (`date`),
  KEY `idx_market` (`market`),
  KEY `idx_period` (`period`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='K线数据表';
