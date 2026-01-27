/**
 * 获取科创50ETF(588080)今日价格动态
 * 基于东方财富非官方API
 * 仅供学习研究使用
 */

import { httpGet } from '../utils/httpGet';
// import { saveToJSON } from '../utils/saveToJSON';

// 配置
const CONFIG = {
  UT: 'bd1d9ddb04089700cf9c27f6f7426281',
  REQUEST_DELAY: 1000, // 请求间隔(毫秒)
};

interface TrendItem {
  time: string;
  price: string;
  volume: string;
  amount: string;
  avgPrice: string;
  change: string;
}

interface QuoteData {
  code: string;
  name: string;
  price?: number;
  open?: number;
  high?: number;
  low?: number;
  preClose?: number;
  volume: number;
  amount: number;
  pct?: number;
  change?: number;
  turnover?: number;
  totalMarketCap?: number;
  floatMarketCap?: number;
  pe?: number;
  pb?: number;
  updateTime: number;
}

interface TrendsResponse {
  date: string;
  preClose: number;
  trends: QuoteData[];
}


interface EastMoneyResponse {
  rc: number;
  data?: {
    prePrice: number;
    trends?: string[];
    name?: string;
  };
}

/**
 * 格式化时间戳
 * 支持两种格式：
 * - "2025-10-16 09:15" -> "09:15:00"
 * - "2025-10-16 09:15:30" -> "09:15:30"
 */
function formatTime(timestamp: string): string {
  const str = String(timestamp);

  // 提取时间部分 (空格后的内容)
  const timeStr = str.includes(' ') ? str.split(' ')[1] : str;

  // 解析时分秒
  const timeParts = timeStr.split(':');
  const hour = timeParts[0] || '00';
  const minute = timeParts[1] || '00';
  const second = timeParts[2] || '00';

  return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:${second.padStart(2, '0')}`;
}

/**
 * 转换趋势数据为标准格式
 */
const convertToTrendsData = (
  trends: TrendItem[],
  date: string,
  stockCode: string,
  stockName: string,
  preClose: number,
): QuoteData[] => {
  // 转换数据
  const quotes = trends.map((trend) => {
    // 构建快照时间: 2025-11-10T09:15:00
    const snapshotStr = `${date}T${trend.time}`;
    const updateTime = Math.floor(new Date(snapshotStr).getTime() / 1000);

    // 转换数据类型
    const price = parseFloat(trend.price);
    const pct = parseFloat(trend.change);
    const volume = parseInt(trend.volume) || 0;
    // amount 单位是万元，需要转换为元
    const amount = parseFloat(trend.amount) * 10000 || 0;

    const quote: QuoteData = {
      code: stockCode,
      name: stockName,
      price: !isNaN(price) ? price : undefined,
      preClose: preClose,
      volume: volume,
      amount: amount,
      pct: !isNaN(pct) ? pct : undefined,
      updateTime: updateTime,
    };

    return quote;
  });
  return quotes;
};

/**
 * 获取实时分时数据
 * @param marketCode 市场代码，如 '1' 表示上交所
 * @param stockCode 股票代码，如 '588080'
 * @returns Promise<TrendsResponse | null> 分时数据
 */
export const getTrendsData = async (
  stockCode: any,
  marketCode: string,
): Promise<TrendsResponse | null> => {
  const secid = `${marketCode}.${stockCode}`;
  const fields1 = 'f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f11,f12,f13';
  const fields2 = 'f51,f52,f53,f54,f55,f56,f57,f58';
  const url = `http://push2.eastmoney.com/api/qt/stock/trends2/get?secid=${secid}&fields1=${fields1}&fields2=${fields2}&ut=${CONFIG.UT}`;

  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const rawResponse = await httpGet(url);
    const response = rawResponse as EastMoneyResponse;

    if (response.rc === 0 && response.data) {
      const data = response.data;
      const preClose = data.prePrice; // 昨收价
      const stockName = data.name || stockCode; // 股票名称，如果没有则使用代码

      // 数据处理1
      const trends: TrendItem[] = (data.trends || []).map((item) => {
        const parts = item.split(',');
        const time = formatTime(parts[0]);
        const price = parseFloat(parts[2]);
        const volume = parseInt(parts[5]) / 100; // 转换为手
        const amount = parseFloat(parts[6]);
        const avgPrice = parseFloat(parts[7]);

        return {
          time,
          price: price.toFixed(3),
          volume: volume.toFixed(0),
          amount: (amount / 10000).toFixed(2), // 转换为万元
          avgPrice: avgPrice.toFixed(3),
          change: (((price - preClose) / preClose) * 100).toFixed(2),
        };
      });

      const date = new Date().toISOString().split('T')[0]; // 当天时间戳 "2025-12-15"
      // 数据处理2
      const formattedTrendsData = convertToTrendsData(
        trends,
        date,
        stockCode,
        stockName,
        preClose,
      );

      // 保存json
      // saveToJSON(formattedTrendsData, `588080_${date}.json`);
      return {
        date,
        preClose,
        trends: formattedTrendsData,
      };
    } else {
      throw new Error('获取分时数据失败');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    console.error('❌ 获取分时数据出错:', errorMessage);
    return null;
  }
};
