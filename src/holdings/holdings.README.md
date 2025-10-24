### 数据字段
```ts
interface Holding {
  id: number;              // 主键
  symbol: string;           // 股票代码（唯一）
  quantity: number;         // 持仓数量(股)
  cost: number;             // 持仓成本
  currentValue: number;     // 当前市值
  createdAt: Date;          // 创建时间
  updatedAt: Date;          // 更新时间
}
```

### API 端点
```
POST /holdings/create                        # 创建持仓记录
POST /holdings/create-batch                  # 批量创建持仓记录
POST /holdings/list                          # 获取所有持仓记录
POST /holdings/get-by-symbol                 # 根据股票代码获取持仓记录
POST /holdings/update                        # 更新持仓记录
POST /holdings/update-by-symbol              # 根据股票代码更新持仓记录
POST /holdings/delete                        # 删除持仓记录
POST /holdings/delete-by-symbol              # 根据股票代码删除持仓记录
POST /holdings/update-current-value          # 更新当前市值
POST /holdings/update-multiple-current-values # 批量更新当前市值
POST /holdings/stats                         # 获取持仓统计信息
POST /holdings/total-value                   # 获取总市值
POST /holdings/total-cost                    # 获取总成本
POST /holdings/profit-loss                   # 获取盈亏情况
POST /holdings/by-profit                     # 根据盈亏情况排序持仓
```