/**
 * 将 Date 对象转换为 MySQL 标准的本地时间字符串 (YYYY-MM-DD HH:mm:ss)
 * 默认增加 8 小时以适配北京时间 (UTC+8)
 *
 * @param date Date 对象
 * @param offsetHours 时区偏移小时数，默认为 8 (北京时间)
 * @returns 格式化后的时间字符串
 */
export function formatToMysqlDateTime(
  date: Date,
  offsetHours: number = 8,
): string {
  const adjustedDate = new Date(date.getTime() + offsetHours * 60 * 60 * 1000);
  return adjustedDate.toISOString().slice(0, 19).replace('T', ' ');
}
