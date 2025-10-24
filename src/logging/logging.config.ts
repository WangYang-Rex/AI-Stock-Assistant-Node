import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';
import * as path from 'path';

// 日志格式配置
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss',
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint(),
);

// 控制台输出格式
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss',
  }),
  winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
    const contextStr = context ? `[${context}]` : '';
    const metaStr = Object.keys(meta).length
      ? JSON.stringify(meta, null, 2)
      : '';
    return `${timestamp} ${level}: ${contextStr} ${message} ${metaStr}`;
  }),
);

export const loggingConfig: WinstonModuleOptions = {
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'ai-stock-assistant' },
  transports: [
    // 控制台输出
    new winston.transports.Console({
      format: consoleFormat,
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
};
