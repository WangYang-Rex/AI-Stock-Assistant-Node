# Stock Controller - addStock 方法使用说明

## 概述

新增的 `addStock` 方法允许通过股票代码和市场代码从东方财富 API 获取实时股票信息并保存到数据库中。

## API 端点

```
POST /stocks/add
```

## 请求参数

```json
{
  "code": "600588",
  "marketCode": 1
}
```

### 参数说明

- `code` (string): 股票代码，如 "600588"
- `marketCode` (number): 市场代码
  - `1`: 上交所
  - `0`: 深交所

## 响应格式

### 成功响应

```json
{
  "id": 1,
  "code": "600588",
  "name": "用友网络",
  "market": "上交所",
  "marketCode": 1,
  "latestPrice": 15.00,
  "changePercent": 3.09,
  "changeAmount": 0.45,
  "openPrice": 14.59,
  "highPrice": 15.13,
  "lowPrice": 14.59,
  "previousClosePrice": 14.55,
  "volume": 851665,
  "pe": -27.13,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### 错误响应

```json
{
  "error": "股票代码 600588 已存在于数据库中"
}
```

## 使用示例

### JavaScript/TypeScript

```typescript
// 添加用友网络股票
const response = await fetch('/stocks/add', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    code: '600588',
    marketCode: 1
  })
});

const result = await response.json();

if (result.error) {
  console.error('添加失败:', result.error);
} else {
  console.log('添加成功:', result);
}
```

### cURL

```bash
curl -X POST http://localhost:3000/stocks/add \
  -H "Content-Type: application/json" \
  -d '{
    "code": "600588",
    "marketCode": 1
  }'
```

## 功能特性

- ✅ **实时数据获取**: 从东方财富 API 获取最新股票信息
- ✅ **重复检查**: 自动检查股票代码是否已存在
- ✅ **错误处理**: 完善的错误处理和用户友好的错误信息
- ✅ **数据映射**: 自动将 API 数据映射到数据库字段
- ✅ **类型安全**: 完整的 TypeScript 类型支持

## 错误处理

方法会处理以下错误情况：

1. **股票已存在**: 如果股票代码已存在于数据库中
2. **API 请求失败**: 网络错误或 API 返回错误
3. **数据格式错误**: API 返回的数据格式不正确
4. **股票不存在**: 指定的股票代码在 API 中不存在

## 注意事项

- 该方法会获取股票的实时价格信息
- 如果股票已存在，会返回错误而不是更新现有记录
- API 请求有超时和重试机制
- 只保存 Stock 实体中存在的字段，其他字段会被忽略
