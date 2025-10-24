import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import * as path from 'path';

@Injectable()
export class LoggingService implements LoggerService {
  private readonly logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
      defaultMeta: { service: 'ai-stock-assistant' },
      transports: [
        // 控制台输出
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp({
              format: 'YYYY-MM-DD HH:mm:ss',
            }),
            winston.format.printf(
              ({ timestamp, level, message, context, ...meta }) => {
                const contextStr = context ? `[${context}]` : '';
                const metaStr = Object.keys(meta).length
                  ? JSON.stringify(meta, null, 2)
                  : '';
                return `${timestamp} ${level}: ${contextStr} ${message} ${metaStr}`;
              },
            ),
          ),
        }),

        // 错误日志文件
        new winston.transports.File({
          filename: path.join(process.cwd(), 'logs', 'error.log'),
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),

        // 所有日志文件
        new winston.transports.File({
          filename: path.join(process.cwd(), 'logs', 'app.log'),
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),

        // HTTP请求日志（单独文件）
        new winston.transports.File({
          filename: path.join(process.cwd(), 'logs', 'http.log'),
          level: 'http',
          maxsize: 5242880, // 5MB
          maxFiles: 3,
        }),
      ],
    });
  }

  /**
   * 记录调试信息
   */
  debug(message: string, context?: string, meta?: Record<string, any>) {
    this.logger.debug(message, { context, ...meta });
  }

  /**
   * 记录一般信息
   */
  log(message: string, context?: string, meta?: Record<string, any>) {
    this.logger.info(message, { context, ...meta });
  }

  /**
   * 记录警告信息
   */
  warn(message: string, context?: string, meta?: Record<string, any>) {
    this.logger.warn(message, { context, ...meta });
  }

  /**
   * 记录错误信息
   */
  error(
    message: string,
    trace?: string,
    context?: string,
    meta?: Record<string, any>,
  ) {
    this.logger.error(message, { trace, context, ...meta });
  }

  /**
   * 记录HTTP请求
   */
  http(message: string, context?: string, meta?: Record<string, any>) {
    this.logger.info(message, { context, level: 'http', ...meta });
  }

  /**
   * 记录业务操作
   */
  business(operation: string, data?: Record<string, any>, context?: string) {
    this.logger.info(`Business operation: ${operation}`, {
      context: context || 'Business',
      operation,
      data,
    });
  }

  /**
   * 记录数据库操作
   */
  database(operation: string, table?: string, data?: Record<string, any>) {
    this.logger.info(`Database operation: ${operation}`, {
      context: 'Database',
      operation,
      table,
      data,
    });
  }

  /**
   * 记录API调用
   */
  api(
    method: string,
    url: string,
    statusCode?: number,
    duration?: number,
    context?: string,
  ) {
    this.logger.info(`API call: ${method} ${url}`, {
      context: context || 'API',
      method,
      url,
      statusCode,
      duration,
    });
  }

  /**
   * 记录股票相关操作
   */
  stock(symbol: string, operation: string, data?: Record<string, any>) {
    this.logger.info(`Stock operation: ${operation} for ${symbol}`, {
      context: 'Stock',
      symbol,
      operation,
      data,
    });
  }

  /**
   * 记录交易相关操作
   */
  trading(symbol: string, operation: string, data?: Record<string, any>) {
    this.logger.info(`Trading operation: ${operation} for ${symbol}`, {
      context: 'Trading',
      symbol,
      operation,
      data,
    });
  }
}
