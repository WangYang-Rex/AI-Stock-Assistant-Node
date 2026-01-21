import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * 行情快照实体类
 * 用于存储股票的分时行情快照数据，每分钟一条记录
 * 包含股票的实时价格、成交量、涨跌幅等完整行情信息
 */
@Entity('quotes')
@Index(['code']) // 股票代码索引，用于快速查询指定股票的行情数据
@Index(['updateTime']) // 更新时间索引，用于按时间范围查询行情数据
export class Quote {
  /**
   * 主键ID
   * 自增主键，用于唯一标识每条行情快照记录
   */
  @PrimaryGeneratedColumn({ comment: '主键ID' })
  id: number;

  /**
   * 股票代码
   * 格式：6位数字（如 600000、000001）
   * 用于标识具体的股票，关联到 stocks 表
   */
  @Column({ type: 'varchar', length: 20, comment: '股票代码' })
  code: string;

  /**
   * 股票名称
   * 股票的中文名称（如 浦发银行、平安银行）
   * 用于显示和检索，方便用户识别
   */
  @Column({ type: 'varchar', length: 100, comment: '股票名称' })
  name: string;

  /**
   * 最新价
   * 当前分钟的最新成交价格（单位：元）
   * 精度：小数点后4位，支持高精度价格数据
   */
  @Column({
    type: 'decimal',
    precision: 18,
    scale: 4,
    nullable: true,
    comment: '最新价',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => (value ? parseFloat(value) : null),
    },
  })
  price: number;

  /**
   * 今日最高价
   * 从开盘到当前时刻的最高成交价格（单位：元）
   * 精度：小数点后4位
   */
  @Column({
    type: 'decimal',
    precision: 18,
    scale: 4,
    nullable: true,
    comment: '今日最高价',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => (value ? parseFloat(value) : null),
    },
  })
  high: number;

  /**
   * 今日最低价
   * 从开盘到当前时刻的最低成交价格（单位：元）
   * 精度：小数点后4位
   */
  @Column({
    type: 'decimal',
    precision: 18,
    scale: 4,
    nullable: true,
    comment: '今日最低价',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => (value ? parseFloat(value) : null),
    },
  })
  low: number;

  /**
   * 今日开盘价
   * 当日第一笔成交的价格（单位：元）
   * 精度：小数点后4位
   */
  @Column({
    type: 'decimal',
    precision: 18,
    scale: 4,
    nullable: true,
    comment: '今日开盘价',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => (value ? parseFloat(value) : null),
    },
  })
  open: number;

  /**
   * 昨日收盘价
   * 上一个交易日的收盘价格（单位：元）
   * 用于计算涨跌幅和涨跌额，精度：小数点后4位
   */
  @Column({
    type: 'decimal',
    precision: 18,
    scale: 4,
    nullable: true,
    comment: '昨日收盘价',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => (value ? parseFloat(value) : null),
    },
  })
  preClose: number;

  /**
   * 成交量
   * 从开盘到当前时刻的累计成交股数（单位：股）
   * 使用 bigint 类型存储大数值
   */
  @Column({
    type: 'bigint',
    nullable: true,
    comment: '成交量（股）',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => (value ? parseInt(value, 10) : null),
    },
  })
  volume: number;

  /**
   * 成交额
   * 从开盘到当前时刻的累计成交金额（单位：元）
   * 精度：小数点后4位，precision: 20 支持千亿级别的成交额
   */
  @Column({
    type: 'decimal',
    precision: 20,
    scale: 4,
    nullable: true,
    comment: '成交额（元）',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => (value ? parseFloat(value) : null),
    },
  })
  amount: number;

  /**
   * 涨跌幅
   * 相对于昨日收盘价的涨跌百分比（单位：%）
   * 计算公式：(最新价 - 昨收价) / 昨收价 * 100
   * 精度：小数点后4位，正数表示上涨，负数表示下跌
   */
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 4,
    nullable: true,
    comment: '涨跌幅（%）',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => (value ? parseFloat(value) : null),
    },
  })
  pct: number;

  /**
   * 涨跌额
   * 相对于昨日收盘价的涨跌金额（单位：元）
   * 计算公式：最新价 - 昨收价
   * 精度：小数点后4位，正数表示上涨，负数表示下跌
   */
  @Column({
    type: 'decimal',
    precision: 18,
    scale: 4,
    nullable: true,
    comment: '涨跌额',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => (value ? parseFloat(value) : null),
    },
  })
  change: number;

  /**
   * 换手率
   * 成交量占流通股本的百分比（单位：%）
   * 计算公式：成交量 / 流通股本 * 100
   * 精度：小数点后4位，反映股票的流动性和活跃度
   */
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 4,
    nullable: true,
    comment: '换手率（%）',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => (value ? parseFloat(value) : null),
    },
  })
  turnover: number;

  /**
   * 总市值
   * 股票总股本 × 最新价（单位：元）
   * 精度：小数点后4位，precision: 24 支持万亿级别的市值
   * 反映公司的整体价值规模
   */
  @Column({
    type: 'decimal',
    precision: 24,
    scale: 4,
    nullable: true,
    comment: '总市值',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => (value ? parseFloat(value) : null),
    },
  })
  totalMarketCap: number;

  /**
   * 流通市值
   * 流通股本 × 最新价（单位：元）
   * 精度：小数点后4位，precision: 24 支持万亿级别的市值
   * 反映市场上实际可交易的股票价值
   */
  @Column({
    type: 'decimal',
    precision: 24,
    scale: 4,
    nullable: true,
    comment: '流通市值',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => (value ? parseFloat(value) : null),
    },
  })
  floatMarketCap: number;

  /**
   * 市盈率（动态）
   * 股价 / 每股收益（单位：倍）
   * 精度：小数点后4位
   * 反映股票估值水平，常用估值指标之一
   */
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 4,
    nullable: true,
    comment: '市盈率（动态）',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => (value ? parseFloat(value) : null),
    },
  })
  pe: number;

  /**
   * 市净率
   * 股价 / 每股净资产（单位：倍）
   * 精度：小数点后4位
   * 反映股票相对于净资产的估值水平
   */
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 4,
    nullable: true,
    comment: '市净率',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => (value ? parseFloat(value) : null),
    },
  })
  pb: number;

  /**
   * 更新时间戳
   * 行情数据的更新时间（Unix 时间戳，秒级）
   * 用于标识数据的时间点，支持按时间范围查询和排序
   */
  @Column({
    type: 'bigint',
    comment: '更新时间戳（Unix 时间戳，秒级）',
    transformer: {
      to: (value: number) => value,
      from: (value: string) => (value ? parseInt(value, 10) : null),
    },
  })
  updateTime: number;

  /**
   * 系统创建时间
   * 记录数据首次插入数据库的时间
   * 由 TypeORM 自动管理
   */
  @CreateDateColumn({ comment: '系统创建时间' })
  createdAt: Date;

  /**
   * 系统更新时间
   * 记录数据最后一次更新的时间
   * 由 TypeORM 自动管理
   */
  @UpdateDateColumn({ comment: '系统更新时间' })
  updatedAt: Date;
}
