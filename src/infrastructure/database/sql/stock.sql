-- 2. 股票基础信息表 (stocks)
CREATE TABLE IF NOT EXISTS `stocks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(20) NOT NULL COMMENT '股票代码',
  `name` varchar(100) NOT NULL COMMENT '股票名称',
  `market` int NOT NULL COMMENT '市场代码（1-上交所、0-深交所）',
  `marketType` varchar(20) NOT NULL COMMENT '市场类型（SH-上海、SZ-深圳）',
  `price` decimal(12,4) DEFAULT NULL COMMENT '最新价',
  `pct` decimal(10,4) DEFAULT NULL COMMENT '涨跌幅(%)',
  `change` decimal(12,4) DEFAULT NULL COMMENT '涨跌额',
  `volume` bigint DEFAULT NULL COMMENT '成交量(股)',
  `amount` decimal(20,4) DEFAULT NULL COMMENT '成交额(元)',
  `totalMarketCap` decimal(20,4) DEFAULT NULL COMMENT '总市值(元)',
  `floatMarketCap` decimal(20,4) DEFAULT NULL COMMENT '流通市值(元)',
  `turnover` decimal(10,4) DEFAULT NULL COMMENT '换手率(%)',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_stocks_code` (`code`),
  INDEX `IDX_stocks_market` (`market`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='股票基础信息表';