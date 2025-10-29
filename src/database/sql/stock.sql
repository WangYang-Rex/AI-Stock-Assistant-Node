-- 2. 股票基础信息表 (stocks)
CREATE TABLE IF NOT EXISTS `stocks` (
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
  UNIQUE KEY `UQ_stocks_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='股票基础信息表';

-- 股票表索引
CREATE INDEX `IDX_stocks_market` ON `stocks` (`market`);
CREATE INDEX `IDX_stocks_industry` ON `stocks` (`market`); -- 注意：原实体中没有industry字段，这里用market代替