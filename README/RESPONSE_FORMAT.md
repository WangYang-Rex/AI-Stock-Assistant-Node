# 统一响应数据格式

本项目已按照 `REAUEST.md` 的要求实现了统一的接口返回数据格式。

## 响应格式

所有接口都遵循以下统一格式：

```typescript
type Response = {
  data: any,        // 返回的数据
  message: string,  // 操作成功/报错信息
  result: number,    // 100表示接口正常，其他数字表示错误码
  success: boolean, // true表示请求成功 false表示接口报错
}
```

## 成功响应示例

```json
{
  "data": {
    "id": 1,
    "code": "000001",
    "name": "平安银行",
    "market": "SZ"
  },
  "message": "股票创建成功",
  "result": 100,
  "success": true
}
```

## 错误响应示例

```json
{
  "data": null,
  "message": "股票未找到",
  "result": 500,
  "success": false
}
```

## 分页响应示例

```json
{
  "data": {
    "items": [
      { "id": 1, "name": "股票1" },
      { "id": 2, "name": "股票2" }
    ],
    "total": 2,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  },
  "message": "查询成功",
  "result": 100,
  "success": true
}
```

## 实现说明

### 1. 核心组件

- **ResponseService**: 提供统一的响应创建方法
- **ResponseInterceptor**: 全局拦截器，自动包装响应
- **GlobalExceptionFilter**: 全局异常过滤器，统一错误处理

### 2. 使用方式

控制器中可以直接使用 `ResponseService` 来创建响应：

```typescript
@Controller('stocks')
export class StockController {
  constructor(
    private readonly stockService: StockService,
    private readonly responseService: ResponseService,
  ) {}

  @Post('create')
  async createStock(@Body() stockData: Partial<Stock>): Promise<ApiResponse<Stock | null>> {
    return this.responseService.handleAsync(
      () => this.stockService.createStock(stockData),
      '股票创建成功',
      '股票创建失败',
    );
  }
}
```

### 3. 自动处理

通过全局拦截器，即使控制器直接返回数据，也会自动包装成统一格式：

```typescript
@Post('list')
async getAllStocks() {
  return await this.stockService.findAll(); // 自动包装为统一格式
}
```

## 已更新的模块

- ✅ StockController
- ✅ AiSignalsController  
- ✅ TradingController
- ✅ AppModule (全局配置)

## 测试验证

运行测试验证响应格式：

```bash
npm test -- response-format.spec.ts
```

所有测试通过，确认响应格式符合要求。
