import * as http from 'http';
import * as https from 'https';
import * as zlib from 'zlib';

/* ========== 类型定义 ========== */

export interface StockInfo {
  code: string;
  name: string;
  market: string;
  marketCode: number;
  latestPrice: number;
  changePercent: number;
  changeAmount: number;
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  previousClosePrice: number;
  volume: number;
  volumeAmount: number;
  pe: number;
  amplitude: number;
  turnoverRate: number;
}

interface EastMoneyResponse {
  data: {
    diff: Array<{
      f2: number | null; // 最新价
      f3: number | null; // 涨跌幅
      f4: number | null; // 涨跌额
      f5: number | null; // 成交量
      f6: number | null; // 成交额
      f7: number | null; // 振幅
      f8: number | null; // 换手率
      f9: number | null; // 市盈率
      f12: string; // 股票代码
      f13: number; // 市场代码
      f14: string; // 股票名称
      f15: number | null; // 最高价
      f16: number | null; // 最低价
      f17: number | null; // 开盘价
      f18: number | null; // 昨收价
    }>;
  };
}

/* ========== 配置常量 ========== */
const CONFIG = {
  REQUEST_TIMEOUT: 10000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
};

/* ========== 工具函数 ========== */

/**
 * 延迟函数
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * HTTP请求函数（支持 gzip 解压和重试）
 */
function fetch(
  url: string,
  retries: number = CONFIG.MAX_RETRIES,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    const options = {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Referer: 'http://quote.eastmoney.com/',
        Accept: 'application/json, text/plain, */*',
        'Accept-Encoding': 'gzip, deflate',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        Connection: 'keep-alive',
      },
      timeout: CONFIG.REQUEST_TIMEOUT,
    };

    const req = protocol.get(url, options, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`请求失败，状态码: ${res.statusCode}`));
        return;
      }

      const buf: Buffer[] = [];
      res.on('data', (chunk) => buf.push(chunk as Buffer));
      res.on('end', () => {
        const buffer = Buffer.concat(buf);

        // 根据 content-encoding 解压
        const encoding = res.headers['content-encoding'];
        if (encoding === 'gzip') {
          zlib.gunzip(buffer, (err, decoded) => {
            if (err) reject(err);
            else resolve(decoded.toString());
          });
        } else if (encoding === 'deflate') {
          zlib.inflate(buffer, (err, decoded) => {
            if (err) reject(err);
            else resolve(decoded.toString());
          });
        } else {
          resolve(buffer.toString());
        }
      });
    });

    req.on('error', (error) => {
      if (retries > 0) {
        console.warn(
          `⚠️  请求失败，${CONFIG.RETRY_DELAY}ms 后重试 (剩余 ${retries} 次): ${error.message}`,
        );
        delay(CONFIG.RETRY_DELAY)
          .then(() => fetch(url, retries - 1))
          .then(resolve)
          .catch(reject);
      } else {
        reject(error);
      }
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('请求超时'));
    });
  });
}

/**
 * 构建股票数组的API URL（批量查询）
 */
function buildBatchStockUrl(
  stocks: Array<{ code: string; marketCode: number }>,
): string {
  const secids = stocks.map((s) => `${s.marketCode}.${s.code}`).join(',');
  return (
    `http://push2.eastmoney.com/api/qt/ulist.np/get?` +
    `fltt=2&invt=2&secids=${secids}&` +
    `fields=f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18&` +
    `ut=bd1d9ddb04089700cf9c27f6f7426281`
  );
}

/**
 * 数据验证函数
 */
function validateData(json: unknown): json is EastMoneyResponse {
  if (!json || typeof json !== 'object') {
    throw new Error('接口返回数据格式错误');
  }

  const data = json as Record<string, unknown>;
  if (!data.data || typeof data.data !== 'object') {
    throw new Error('接口返回数据结构异常');
  }

  const dataObj = data.data as Record<string, unknown>;
  if (!Array.isArray(dataObj.diff) || dataObj.diff.length === 0) {
    throw new Error('接口返回数据为空');
  }

  return true;
}

/**
 * 数据处理函数 - 将东方财富API返回的原始数据转换为标准化的股票数据格式
 */
function processData(rawData: EastMoneyResponse['data']['diff']): StockInfo[] {
  return rawData
    .filter((item) => item.f2 !== null)
    .map((item) => ({
      code: String(item.f12).padStart(6, '0'),
      name: item.f14 || '未知',
      market: item.f13 === 1 ? '上交所' : '深交所',
      marketCode: item.f13,
      latestPrice: Number(item.f2) || 0,
      changePercent: Number(item.f3) || 0,
      changeAmount: Number(item.f4) || 0,
      openPrice: Number(item.f17) || 0,
      highPrice: Number(item.f15) || 0,
      lowPrice: Number(item.f16) || 0,
      previousClosePrice: Number(item.f18) || 0,
      volume: Number(item.f5) || 0,
      volumeAmount: Number(item.f6) || 0,
      pe: Number(item.f9) || 0,
      amplitude: Number(item.f7) || 0,
      turnoverRate: Number(item.f8) || 0,
    }));
}

/* ========== 主要函数 ========== */

/**
 * 批量获取股票信息（参考 lighthouse.js 实现）
 * @param stocks 股票代码和市场代码数组，格式：[{code: '600588', marketCode: 1}, ...]
 * @returns Promise<StockInfo[]> 标准化的股票信息数组
 */
const getStockInfo = async (
  stocks: Array<{ code: string; marketCode: number }>,
): Promise<StockInfo[]> => {
  try {
    if (!stocks || stocks.length === 0) {
      throw new Error('股票代码数组不能为空');
    }

    // 1. 构建批量API URL
    const url = buildBatchStockUrl(stocks);

    // 2. 发起网络请求
    const responseText = await fetch(url);
    const json = JSON.parse(responseText) as unknown;

    // 3. 数据验证
    validateData(json);

    // 4. 数据处理
    const processedData = processData((json as EastMoneyResponse).data.diff);

    console.log(`📅 查询时间: ${new Date().toLocaleString('zh-CN')}`);
    console.log(`📈 成功获取 ${processedData.length} 只股票数据\n`);

    if (processedData.length > 0) {
      console.table(
        processedData.map((r) => ({
          代码: r.code,
          名称: r.name,
          市场: r.market,
          最新价: r.latestPrice,
          涨跌幅: `${r.changePercent}%`,
          涨跌额: r.changeAmount,
          成交量: r.volume,
          成交额: r.volumeAmount,
          振幅: `${r.amplitude}%`,
          换手率: `${r.turnoverRate}%`,
          市盈率: r.pe,
          最高: r.highPrice,
          最低: r.lowPrice,
          今开: r.openPrice,
          昨收: r.previousClosePrice,
          市场代码: r.marketCode,
        })),
      );

      // // 显示统计信息
      // const rising = processedData.filter((r) => r.changePercent > 0).length;
      // const falling = processedData.filter((r) => r.changePercent < 0).length;
      // const flat = processedData.filter((r) => r.changePercent === 0).length;
      // const avgChange = (
      //   processedData.reduce((sum, r) => sum + r.changePercent, 0) /
      //   processedData.length
      // ).toFixed(2);

      // console.log('\n📈 市场统计:');
      // console.log(
      //   `  上涨: ${rising} 只 | 下跌: ${falling} 只 | 平盘: ${flat} 只`,
      // );
      // console.log(`  平均涨跌幅: ${avgChange}%`);
    }

    return processedData;
  } catch (error) {
    console.error(`获取股票信息失败:`, error);
    throw error;
  }
};

/**
 * 获取单个股票信息（便捷方法）
 * @param code 股票代码（如：'600588'）
 * @param marketCode 市场代码（1=上交所，0=深交所）
 * @returns Promise<StockInfo> 标准化的股票信息
 */
const getSingleStockInfo = async (
  code: string,
  marketCode: number,
): Promise<StockInfo> => {
  const stocks = [{ code, marketCode }];
  const results = await getStockInfo(stocks);
  if (results.length === 0) {
    throw new Error(`未找到股票代码 ${code} 的数据`);
  }
  return results[0];
};

export { getStockInfo, getSingleStockInfo };
