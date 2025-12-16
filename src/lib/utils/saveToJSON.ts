import { writeFileSync } from 'fs';

/**
 * 保存为JSON
 * @param rows 要保存的数据数组
 * @param filename 文件名
 */
export function saveToJSON<T = any>(rows: T[], filename: string): void {
  const output = {
    timestamp: new Date().toISOString(),
    count: rows.length,
    data: rows,
  };
  writeFileSync(filename, JSON.stringify(output, null, 2), 'utf-8');
}
