/**
 * 日期工具函数
 */

/**
 * 格式化日期为 YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 计算给定日期所在的周数 (ISO 8601标准)
 */
export function getWeekNumber(date: Date): number {
  const target = new Date(date.valueOf());
  target.setDate(target.getDate() + 3 - ((target.getDay() + 6) % 7));
  const jan4 = new Date(target.getFullYear(), 0, 4);
  jan4.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7));
  const weekNumber =
    1 +
    Math.round(
      ((target.getTime() - jan4.getTime()) / 86400000 - 3 + ((jan4.getDay() + 6) % 7)) / 7
    );
  return weekNumber;
}
