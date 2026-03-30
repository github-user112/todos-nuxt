/**
 * 生成随机哈希值作为用户ID
 */
export function generateHash(): string {
  const randomStr =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
  const timestamp = new Date().getTime().toString();
  return randomStr + timestamp;
}
