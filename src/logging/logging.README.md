# 日志模块

本模块为AI股票助手项目提供完整的日志功能，包括结构化日志记录、文件输出、日志级别控制等功能。

## 功能特性

- 🎯 **多级别日志**: 支持 debug、log、warn、error 等不同级别
- 📁 **文件输出**: 自动按类型分离日志文件（错误日志、应用日志、HTTP日志）
- 🎨 **格式化输出**: 控制台彩色输出，文件JSON格式
- 🔄 **日志轮转**: 自动文件大小控制和数量限制
- 📊 **业务日志**: 专门针对股票、交易、数据库操作的日志记录
- 🚀 **性能监控**: HTTP请求响应时间记录
- 🎭 **装饰器支持**: 通过装饰器简化日志记录

## 日志文件

- `logs/app.log` - 应用主日志
- `logs/error.log` - 错误日志
- `logs/http.log` - HTTP请求日志

## 使用方法

### 1. 基本使用

```typescript
import { LoggingService } from './logging/logging.service';

@Injectable()
export class YourService {
  constructor(private readonly loggingService: LoggingService) {}

  someMethod() {
    // 记录一般信息
    this.loggingService.log('操作成功', 'YourService');
    
    // 记录错误
    this.loggingService.error('操作失败', error.stack, 'YourService');
    
    // 记录警告
    this.loggingService.warn('需要注意的问题', 'YourService');
  }
}
```

### 2. 业务日志

```typescript
// 记录股票操作
this.loggingService.stock('AAPL', 'price_update', { price: 150.25 });

// 记录交易操作
this.loggingService.trading('AAPL', 'buy_order', { quantity: 100, price: 150.25 });

// 记录数据库操作
this.loggingService.database('INSERT', 'stocks', { symbol: 'AAPL', price: 150.25 });
```

### 3. 装饰器使用

```typescript
import { Log, BusinessLog, StockLog } from './logging/logging.decorator';

@Injectable()
export class StockService {
  @Log('StockService', 'log')
  getStockPrice(symbol: string) {
    // 方法执行时会自动记录日志
  }

  @BusinessLog('price_update')
  updateStockPrice(symbol: string, price: number) {
    // 业务操作日志
  }

  @StockLog('price_fetch')
  fetchStockData(symbol: string) {
    // 股票操作日志
  }
}
```

## 配置

### 环境变量

- `LOG_LEVEL`: 日志级别 (debug, log, warn, error)，默认: info

### 日志级别说明

- `debug`: 调试信息，最详细的日志
- `log`: 一般信息，默认级别
- `warn`: 警告信息
- `error`: 错误信息

## 日志格式

### 控制台输出
```
2024-01-15 10:30:45 info: [StockService] 获取股票价格成功
```

### 文件输出 (JSON格式)
```json
{
  "timestamp": "2024-01-15T10:30:45.123Z",
  "level": "info",
  "message": "获取股票价格成功",
  "context": "StockService",
  "service": "ai-stock-assistant"
}
```

## 集成

日志模块已自动集成到主应用中，包括：

1. **全局HTTP拦截器**: 自动记录所有HTTP请求
2. **错误处理**: 自动记录未捕获的异常
3. **性能监控**: 记录请求响应时间

## 最佳实践

1. **使用合适的日志级别**: 不要滥用debug级别
2. **包含上下文信息**: 提供足够的上下文便于问题定位
3. **避免敏感信息**: 不要在日志中记录密码、token等敏感信息
4. **结构化数据**: 使用meta参数传递结构化数据
5. **业务日志**: 对重要业务操作使用专门的日志方法
