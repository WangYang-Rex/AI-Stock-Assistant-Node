### 数据字段
```ts
interface AiSignal {
  id: number;                    // 主键
  symbol: string;                // 股票代码
  signalTime: Date;              // 信号时间
  signalType: 'buy' | 'sell' | 'hold'; // AI信号类型
  confidence: number;             // 信号置信度(0-100)
  modelVersion: string;           // AI模型版本号
  description: string;           // 信号说明或模型解释
  createdAt: Date;               // 创建时间
  updatedAt: Date;               // 更新时间
}
```

### API 端点
```
POST /aisignals/create                        # 创建AI信号记录
POST /aisignals/create-batch                  # 批量创建AI信号记录
POST /aisignals/list                          # 获取所有AI信号记录
POST /aisignals/get-by-symbol                 # 根据股票代码获取AI信号记录
POST /aisignals/get-by-signal-type            # 根据信号类型获取AI信号记录
POST /aisignals/get-by-model-version          # 根据模型版本获取AI信号记录
POST /aisignals/get-by-symbol-and-time-range  # 根据股票代码和时间范围获取AI信号记录
POST /aisignals/get-by-confidence-range       # 根据置信度范围获取AI信号记录
POST /aisignals/get-latest                    # 获取最新AI信号记录
POST /aisignals/get-by-symbol-and-type        # 根据股票代码和信号类型获取记录
POST /aisignals/get-high-confidence           # 获取高置信度信号
POST /aisignals/stats                         # 获取AI信号统计信息
POST /aisignals/update                        # 更新AI信号记录
POST /aisignals/delete                        # 删除AI信号记录
POST /aisignals/clean-old-data                # 清理过期数据
```