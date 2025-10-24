import { SetMetadata } from '@nestjs/common';

export const LOGGING_METADATA_KEY = 'logging';

/**
 * 日志装饰器 - 用于标记需要记录日志的方法
 * @param context 日志上下文
 * @param level 日志级别
 */
export const Log = (
  context?: string,
  level: 'debug' | 'log' | 'warn' | 'error' = 'log',
) => SetMetadata(LOGGING_METADATA_KEY, { context, level });

/**
 * 业务日志装饰器 - 用于记录业务操作
 */
export const BusinessLog = (operation: string) =>
  SetMetadata(LOGGING_METADATA_KEY, {
    context: 'Business',
    operation,
    level: 'business',
  });

/**
 * 数据库日志装饰器 - 用于记录数据库操作
 */
export const DatabaseLog = (operation: string, table?: string) =>
  SetMetadata(LOGGING_METADATA_KEY, {
    context: 'Database',
    operation,
    table,
    level: 'database',
  });

/**
 * 股票日志装饰器 - 用于记录股票相关操作
 */
export const StockLog = (operation: string) =>
  SetMetadata(LOGGING_METADATA_KEY, {
    context: 'Stock',
    operation,
    level: 'stock',
  });

/**
 * 交易日志装饰器 - 用于记录交易相关操作
 */
export const TradingLog = (operation: string) =>
  SetMetadata(LOGGING_METADATA_KEY, {
    context: 'Trading',
    operation,
    level: 'trading',
  });
