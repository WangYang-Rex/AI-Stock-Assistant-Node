对比您提供的 “Strategy → API → React Props 数据流设计” 文档与目前系统的实际进展，我整理了一份 TODO List。

目前的系统已经完成了基础的信号评估（Signal）和钉钉推送，但距离文档中描述的完整策略管理与可视化分析系统还有一段路要走。

📋 策略系统建设 TODO List
1. 数据库模型扩展 (Persistence Layer)
 完善策略元数据表：
创建 strategy 表，存储策略名称、类型、状态等。
创建 strategy_params 表，存储不同策略的配置参数（如尾盘战法的 14:40-14:55 时间窗口）。
 策略信号表 (strategy_signal)：已完成。
 策略结果表 (strategy_result)：已完成（SQL 已生成但尚未在代码中充分利用）。
 创建净值曲线表 (strategy_equity_curve)：用于记录回测及实盘的资金曲线。
2. 后端核心逻辑优化 (Service Layer)
 建立策略聚合层 (StrategyAggregateService)：
实现一个 Service，能够根据策略 ID 一次性聚合查询基本信息、近期信号、历史交易及净值曲线。
 实现回测/计算引擎：
StrategyResult
 的自动更新逻辑：在次日开盘或收盘后，自动计算前一日信号的收益率、最大涨幅、最大回撤等。
 参数化配置：
将目前的硬编码参数（如 CLOSE_AUCTION_T1 的时间逻辑）迁移到数据库配置项中。
3. API 开发 (API Layer)
 基础评估 API：已完成（
evaluate
 & evaluate-by-symbol）。
 详情聚合 API：按照 DTO 设计，实现 GET /api/strategies/:id/detail，为前端提供一站式数据。
 Swagger 定义：已完成（
strategies.swagger.json
）。
4. 前端展示（待启动，目前为重点空白）
 策略详情页容器：实现数据获取逻辑。
 核心看板组件：
StrategyMetricsCards：展示胜率、年化收益、最大回撤等关键指标。
PriceWithTradesChart：在 K 线图/分时图上叠加买卖信号标记（这是该策略的核心亮点）。
EquityCurveChart：展示策略长期表现的净值图。
 策略管理列表：展示所有运行中策略的概览。
5. 交互与自动化
 详情页反向触发：钉钉消息中的“查看详情”按钮，能够准确跳转到前端对应的策略详情页（目前链接暂时注释或指向本地 API）。
 实盘模拟自动化：每日收盘后自动运行一次所有活跃策略的评估。
💡 核心差距点分析：
聚合度：目前 API 是碎片化的（查分时是一步，算策略是一步），文档要求的是通过 StrategyAggregateService 提供一次性聚合 DTO，极大地减轻前端处理压力。
闭环性：目前有了“信号（Signal）”，但缺少自动化的“结果归因（Result）”——即次日自动去算这个信号到底是赚了还是亏了，以此来不断修正策略。
建议下一步动作： 您可以先从 “1. 数据库模型扩展” 开始，或者直接让我为您编写 StrategyAggregateService 的骨架代码。您想先攻克哪一块？