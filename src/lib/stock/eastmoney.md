# 东方财富 API 接口文档

> ⚠️ **注意**：东方财富并未公开官方API文档，以下接口均为开发者通过抓包分析整理的非官方接口，仅供学习研究使用。

## 常用计算公式

#### 涨跌
涨跌幅 = (最新价-昨收价)/昨收价

## 📡 常用 API 接口列表

### 1️⃣ 股票行情相关

#### 批量查询指定股票
```
http://push2.eastmoney.com/api/qt/ulist.np/get?secids=1.600588,0.002230&fields=f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18&ut=bd1d9ddb04089700cf9c27f6f7426281
```
**参数说明：**
- `secids`: 股票代码列表，格式为 `市场代码.股票代码`，多个用逗号分隔
  - 市场代码：`0`=深交所，`1`=上交所/科创板
- `fields`: 需要返回的字段列表
- `ut`: 固定token

**使用示例：**
```javascript
const secids = ['1.600588', '0.002230'].join(',');
const url = `http://push2.eastmoney.com/api/qt/ulist.np/get?secids=${secids}&fields=f1,f2,f3,f4,f5,f6,f12,f13,f14&ut=bd1d9ddb04089700cf9c27f6f7426281`;
```

---

#### 单只股票详情
```
http://push2.eastmoney.com/api/qt/stock/get?secid=0.002230&fields=f43,f44,f45,f46,f47,f48,f49,f50,f51,f52,f57,f58,f59,f60,f61,f62,f63,f64,f65,f66,f67,f68&ut=bd1d9ddb04089700cf9c27f6f7426281
```
**参数说明：**
- `secid`: 股票代码，格式为 `市场代码.股票代码`
- `fields`: 需要返回的字段

---

#### 全市场列表
```
http://push2.eastmoney.com/api/qt/clist/get?pn=1&pz=100&po=1&np=1&ut=bd1d9ddb04089700cf9c27f6f7426281&fltt=2&invt=2&fid=f3&fs=m:0+t:6,m:0+t:80,m:1+t:2,m:1+t:23&fields=f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18
```
**参数说明：**
- `pn`: 页码（从1开始）
- `pz`: 每页数量（建议不超过200）
- `po`: 排序方式（1=正序，0=倒序）
- `fid`: 排序字段（f3=涨跌幅）
- `fs`: 市场筛选
  - `m:0+t:6` - 深交所A股
  - `m:0+t:80` - 深交所创业板
  - `m:1+t:2` - 上交所A股
  - `m:1+t:23` - 上交所科创板

**注意：** 接口有返回数量限制，实际可能只返回100条数据。

---

#### 实时分时数据
```
http://push2.eastmoney.com/api/qt/stock/trends2/get?secid=0.002230&fields1=f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f11,f12,f13&fields2=f51,f52,f53,f54,f55,f56,f57,f58&ut=bd1d9ddb04089700cf9c27f6f7426281
```
**返回：** 当日分时走势数据

---

#### K线数据
```
http://push2his.eastmoney.com/api/qt/stock/kline/get?secid=0.002230&klt=101&fqt=1&beg=20230101&end=20231231&fields1=f1,f2,f3,f4,f5,f6&fields2=f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61&ut=bd1d9ddb04089700cf9c27f6f7426281
```
**参数说明：**
- `klt`: K线类型
  - `1` - 日K
  - `5` - 5分钟K
  - `15` - 15分钟K
  - `30` - 30分钟K
  - `60` - 60分钟K
  - `101` - 周K
  - `102` - 月K
- `fqt`: 复权类型
  - `0` - 不复权
  - `1` - 前复权
  - `2` - 后复权
- `beg`: 开始日期（YYYYMMDD）
- `end`: 结束日期（YYYYMMDD）

---

### 2️⃣ 概念板块/行业板块

#### 概念板块列表
```
http://push2.eastmoney.com/api/qt/clist/get?pn=1&pz=2000&po=1&np=1&ut=bd1d9ddb04089700cf9c27f6f7426281&fltt=2&invt=2&fid=f3&fs=m:90+t:3&fields=f1,f2,f3,f4,f5,f6,f12,f13,f14
```
**参数说明：**
- `fs=m:90+t:3` - 概念板块

---

#### 行业板块列表
```
http://push2.eastmoney.com/api/qt/clist/get?pn=1&pz=2000&po=1&np=1&ut=bd1d9ddb04089700cf9c27f6f7426281&fltt=2&invt=2&fid=f3&fs=m:90+t:2&fields=f1,f2,f3,f4,f5,f6,f12,f13,f14
```
**参数说明：**
- `fs=m:90+t:2` - 行业板块

---

#### 板块成分股
```
http://push2.eastmoney.com/api/qt/clist/get?pn=1&pz=1000&po=1&np=1&ut=bd1d9ddb04089700cf9c27f6f7426281&fltt=2&invt=2&fid=f3&fs=b:BK0735&fields=f1,f2,f3,f4,f5,f6,f12,f13,f14
```
**参数说明：**
- `fs=b:BK0735` - 板块代码（如 BK0735 代表人工智能）

---

### 3️⃣ 资金流向

#### 个股资金流
```
http://push2.eastmoney.com/api/qt/stock/fflow/get?secid=0.002230&fields1=f1,f2,f3,f7&fields2=f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61,f62,f63,f64,f65&ut=bd1d9ddb04089700cf9c27f6f7426281
```
**返回：** 主力净流入、散户净流入等资金流向数据

---

#### 主力资金排名
```
http://push2.eastmoney.com/api/qt/clist/get?pn=1&pz=50&po=1&np=1&ut=bd1d9ddb04089700cf9c27f6f7426281&fltt=2&invt=2&fid=f62&fs=m:0+t:6,m:0+t:80,m:1+t:2,m:1+t:23&fields=f1,f2,f3,f12,f13,f14,f62,f184
```
**参数说明：**
- `fid=f62` - 按主力净流入排序
- `f62`: 主力净流入
- `f184`: 主力净流入占比

---

### 4️⃣ 龙虎榜

#### 龙虎榜详情
```
http://datacenter.eastmoney.com/api/data/get?type=RPTA_LHBWEB_DETAIL&sty=ALL&token=894050c76af8597a853f5b408b759f5d&st=SECURITY_CODE&sr=1&p=1&ps=50&js={"pages":(tp),"data":(x)}&filter=(TRADE_DATE='2023-12-01')
```
**参数说明：**
- `type=RPTA_LHBWEB_DETAIL` - 龙虎榜详情
- `filter`: 日期筛选

---

### 5️⃣ 新闻公告

#### 个股新闻
```
http://np-listapi.eastmoney.com/comm/wap/getListInfo?cb=callback&code=002230&type=1&pageSize=20&pageIndex=1
```
**参数说明：**
- `type`: `1`=新闻，`2`=公告
- `code`: 股票代码（不带市场前缀）
- `pageSize`: 每页数量
- `pageIndex`: 页码

---

### 6️⃣ 财务数据

#### 主要财务指标
```
http://datacenter.eastmoney.com/securities/api/data/get?type=RPT_LICO_FN_CPD&sty=ALL&code=002230&p=1&ps=20&sr=-1&st=REPORT_DATE&filter=(SECURITY_CODE="002230")
```
**返回：** 营收、净利润、ROE等财务指标

---

## 📝 字段说明（fields 参数）

### 常用字段对照表

| 字段 | 说明 | 字段 | 说明 |
|------|------|------|------|
| f1 | 未知 | f2 | 最新价 |
| f3 | 涨跌幅(%) | f4 | 涨跌额 |
| f5 | 成交量(手) | f6 | 成交额 |
| f7 | 振幅(%) | f8 | 换手率(%) |
| f9 | 市盈率(动态) | f10 | 量比 |
| f11 | 5分钟涨跌 | f12 | 股票代码 |
| f13 | 市场编号 | f14 | 股票名称 |
| f15 | 最高价 | f16 | 最低价 |
| f17 | 今开价 | f18 | 昨收价 |
| f20 | 总市值 | f21 | 流通市值 |
| f22 | 涨速(%) | f23 | 市净率 |
| f62 | 主力净流入 | f184 | 主力净占比 |

### 市场编号对照

| 编号 | 市场 |
|------|------|
| 0 | 深交所 |
| 1 | 上交所/科创板 |
| 116 | 港股 |
| 105 | 美股 |

---

## ⚠️ 重要提示

### 1. 法律风险
- ❌ 这些接口**非官方公开**，随时可能失效或调整
- ❌ **仅供个人学习研究**，禁止用于商业用途
- ✅ 商业使用请联系东方财富官方获取授权

### 2. 技术限制
- **访问频率限制**：建议添加请求间隔（建议 ≥ 1秒），避免被限流或封IP
- **返回数量限制**：部分接口有数量限制（如全市场列表实际只返回100条）
- **数据延迟**：非官方接口可能存在延迟，不适合高频交易
- **反爬机制**：可能存在 User-Agent 检查、Cookie 验证等

### 3. 数据质量
- 📊 **数据准确性**：建议与官方数据交叉验证
- ⏰ **实时性**：非Level-2数据，存在延迟
- 🔄 **稳定性**：接口结构可能随时变化，需做好容错处理

### 4. 开发建议
```javascript
// ✅ 推荐：添加请求头
const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Referer': 'http://quote.eastmoney.com/',
  'Accept-Encoding': 'gzip,deflate'
};

// ✅ 推荐：添加请求间隔
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
await delay(1000); // 每次请求间隔1秒

// ✅ 推荐：错误处理
try {
  const data = await fetch(url);
  // 业务逻辑
} catch (error) {
  console.error('请求失败，可能接口已失效', error);
}

// ✅ 推荐：数据缓存
const cache = new Map();
if (cache.has(key)) {
  return cache.get(key);
}
```

---

## 💡 推荐做法

### 方案一：使用专业数据服务

如果需要稳定、可靠的金融数据服务，建议使用以下平台：

#### 1. **Tushare** (Python)
- 🌟 开源免费（部分高级功能需付费）
- 📊 数据全面：股票、基金、期货、期权等
- 🔗 官网：https://tushare.pro

```python
import tushare as ts
ts.set_token('your_token')
pro = ts.pro_api()

# 获取股票日线数据
df = pro.daily(ts_code='000001.SZ', start_date='20230101', end_date='20231231')
```

#### 2. **AKShare** (Python)
- 🆓 完全免费开源
- 🚀 无需注册，开箱即用
- 🔗 官网：https://akshare.akfamily.xyz

```python
import akshare as ak

# 获取实时行情
stock_zh_a_spot_em_df = ak.stock_zh_a_spot_em()
```

#### 3. **同花顺 iFinD**
- 💼 专业金融数据终端
- 💰 付费服务，数据质量高
- 🎯 适合机构和专业投资者

#### 4. **Wind（万得）**
- 🏆 行业顶级数据服务商
- 💎 数据最全面、最权威
- 💰 价格较高，适合专业机构

---

### 方案二：合法使用爬虫

如果仍需使用网页数据，请注意：

1. ✅ **遵守 robots.txt**
2. ✅ **控制请求频率**（建议 ≥ 1秒）
3. ✅ **添加合理的User-Agent**
4. ✅ **仅用于个人学习研究**
5. ❌ **不得用于商业用途**
6. ❌ **不得对服务器造成压力**

---

### 方案三：申请官方API

部分券商和数据平台提供官方API：

- 📱 **东方财富Choice金融终端**（付费）
- 📊 **新浪财经API**（部分免费）
- 🎯 **同花顺开放平台**
- 🏦 **券商API**（如雪球、老虎证券等）

---

## 📚 相关资源

- **AKShare文档**: https://akshare.akfamily.xyz
- **Tushare文档**: https://tushare.pro/document/2
- **东方财富网**: https://www.eastmoney.com
- **Python金融数据分析**: https://github.com/topics/financial-data

---

## 📌 免责声明

本文档仅供技术学习和研究使用，所列接口均为非官方接口，使用过程中产生的任何问题和法律风险由使用者自行承担。

如需商业使用或大规模数据获取，请：
1. 联系东方财富官方获取授权
2. 使用正规的金融数据服务商
3. 遵守相关法律法规和网站服务条款

---

**更新时间**: 2025-10-11  
**维护者**: AI Assistant  
**License**: MIT (仅文档，不包括API接口使用权)

