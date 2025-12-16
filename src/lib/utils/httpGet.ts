import * as https from 'https';
import * as http from 'http';

/**
 * 发起HTTP GET请求
 * @param url 请求的URL地址
 * @returns Promise<any> 返回解析后的JSON数据
 */
export function httpGet(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    const options = {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Referer: 'http://quote.eastmoney.com/',
        Accept: 'application/json',
      },
    };

    protocol
      .get(url, options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : '未知错误';
            reject(new Error('JSON解析失败: ' + errorMessage));
          }
        });
      })
      .on('error', (error) => {
        const errorMessage =
          error instanceof Error ? error.message : '未知错误';
        reject(new Error('请求失败: ' + errorMessage));
      });
  });
}
