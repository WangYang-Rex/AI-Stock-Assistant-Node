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
-- 7. 策略信号表
CREATE TABLE `strategy_signal` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '策略信号ID',
  `strategy_code` varchar(50) NOT NULL COMMENT '策略编码，如 CLOSE_AUCTION_T1',
  `symbol` varchar(20) NOT NULL COMMENT '标的代码，如 588080',
  `trade_date` date NOT NULL COMMENT '信号所属交易日',
  `allow` tinyint NOT NULL COMMENT '是否允许交易 1是0否',
  `confidence` int NOT NULL COMMENT '信心分 0-100',
  `reasons` json DEFAULT NULL COMMENT '策略判断原因列表',
  `eval_time` datetime NOT NULL COMMENT '策略评估时间',
  `price` decimal(10,4) DEFAULT NULL COMMENT '评估时价格',
  `vwap` decimal(10,4) DEFAULT NULL COMMENT '当日VWAP',
  `volume` bigint DEFAULT NULL COMMENT '当日成交量',
  `extra` json DEFAULT NULL COMMENT '扩展字段（成分股强度、指数状态等）',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '系统创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '系统更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_strategy_day` (`strategy_code`, `symbol`, `trade_date`),
  KEY `idx_symbol` (`symbol`),
  KEY `idx_trade_date` (`trade_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='策略信号表';

-- 8. 策略执行结果表
CREATE TABLE `strategy_result` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '结果ID',
  `signal_id` int NOT NULL COMMENT '关联策略信号ID',
  `symbol` varchar(20) NOT NULL COMMENT '标的代码',
  `buy_price` decimal(10,4) DEFAULT NULL COMMENT '假设买入价（尾盘）',
  `sell_price` decimal(10,4) DEFAULT NULL COMMENT '卖出价（次日）',
  `sell_time` datetime DEFAULT NULL COMMENT '卖出时间（如次日09:35）',
  `return_pct` decimal(8,4) DEFAULT NULL COMMENT '收益率 %',
  `max_gain_pct` decimal(8,4) DEFAULT NULL COMMENT '次日最大浮盈 %',
  `max_drawdown_pct` decimal(8,4) DEFAULT NULL COMMENT '次日最大回撤 %',
  `win` tinyint DEFAULT NULL COMMENT '是否盈利',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '系统创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_signal_id` (`signal_id`),
  KEY `idx_symbol` (`symbol`),
  CONSTRAINT `fk_strategy_result_signal` FOREIGN KEY (`signal_id`) REFERENCES `strategy_signal` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='策略执行结果表';

-- 9. 策略定义表
CREATE TABLE `strategies` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '策略ID',
  `name` varchar(100) NOT NULL COMMENT '策略名称',
  `code` varchar(50) NOT NULL COMMENT '策略编码',
  `symbol` varchar(20) NOT NULL COMMENT '默认标的',
  `status` varchar(20) NOT NULL DEFAULT 'ACTIVE' COMMENT '状态: ACTIVE, PAUSED',
  `description` text COMMENT '策略描述',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='策略定义表';

-- 10. 策略参数表
CREATE TABLE `strategy_params` (
  `id` int NOT NULL AUTO_INCREMENT,
  `strategy_id` int NOT NULL COMMENT '策略ID',
  `params` json NOT NULL COMMENT '策略参数详情',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_strategy_id` (`strategy_id`),
  CONSTRAINT `fk_strategy_params_id` FOREIGN KEY (`strategy_id`) REFERENCES `strategies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='策略参数表';

-- 11. 策略指标表
CREATE TABLE `strategy_metrics` (
  `id` int NOT NULL AUTO_INCREMENT,
  `strategy_id` int NOT NULL COMMENT '策略ID',
  `total_return` decimal(10,4) DEFAULT '0.0000' COMMENT '总收益率',
  `annual_return` decimal(10,4) DEFAULT '0.0000' COMMENT '年化收益率',
  `max_drawdown` decimal(10,4) DEFAULT '0.0000' COMMENT '最大回撤',
  `win_rate` decimal(10,4) DEFAULT '0.0000' COMMENT '胜率',
  `trade_count` int DEFAULT '0' COMMENT '交易总数',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_strategy_id` (`strategy_id`),
  CONSTRAINT `fk_strategy_metrics_id` FOREIGN KEY (`strategy_id`) REFERENCES `strategies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='策略指标表';

-- 12. 策略净值曲线表
CREATE TABLE `strategy_equity_curve` (
  `id` int NOT NULL AUTO_INCREMENT,
  `strategy_id` int NOT NULL COMMENT '策略ID',
  `date` date NOT NULL COMMENT '日期',
  `equity` decimal(18,4) NOT NULL COMMENT '当日净值',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_strategy_date` (`strategy_id`, `date`),
  CONSTRAINT `fk_strategy_equity_curve_id` FOREIGN KEY (`strategy_id`) REFERENCES `strategies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='策略净值曲线表';
