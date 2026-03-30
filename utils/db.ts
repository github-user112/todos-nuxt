/**
 * D1 数据库工具
 * 在 Nuxt Server Routes 中通过 event.context.cloudflare.env.DB 获取
 */

export interface D1Database {
  prepare(sql: string): D1PreparedStatement;
}

export interface D1PreparedStatement {
  bind(...values: any[]): D1PreparedStatement;
  all(): Promise<{ results: any[]; success: boolean }>;
  first<T = any>(colName?: string): Promise<T | null>;
  run(): Promise<{ success: boolean; meta: { last_row_id: number } }>;
}

/**
 * 获取 Cloudflare D1 数据库实例
 */
export function getDB(event: any): D1Database {
  const cf = event.context?.cloudflare
  if (!cf) {
    throw new Error('Cloudflare context not found - not running on Cloudflare?')
  }
  const db = cf.env?.DB
  if (!db) {
    const available = cf.env ? Object.keys(cf.env).join(', ') : 'env is undefined'
    throw new Error(`D1 binding "DB" not found. Available bindings: ${available}`)
  }
  return db
}
