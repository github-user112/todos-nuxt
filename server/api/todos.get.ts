import { getDB } from '../../utils/db';

export default defineEventHandler(async (event) => {
  const userId = getQuery(event).uid as string;
  if (!userId) {
    throw createError({ statusCode: 401, message: '缺少用户 ID' });
  }

  const startDate = getQuery(event).startDate as string || '2000-01-01';
  const endDate = getQuery(event).endDate as string || '2099-12-31';

  const DB = getDB(event);

  try {
    // 查询指定日期范围内的待办事项（与 worker.js 逻辑一致）
    const todosResult = await DB.prepare(`
      SELECT * FROM todos
      WHERE user_id = ? AND (
        (date BETWEEN ? AND ?) OR
        (repeat_type != 'none' AND date <= ? AND (end_date IS NULL OR end_date >= ?))
      ) AND (end_date IS NULL OR end_date >= ?)
      ORDER BY date, repeat_type, repeat_interval
    `).bind(userId, startDate, endDate, endDate, startDate, startDate).all();

    // 获取查询范围内的已完成实例
    const completedInstancesResult = await DB.prepare(`
      SELECT * FROM completed_instances 
      WHERE user_id = ? AND date BETWEEN ? AND ?
    `).bind(userId, startDate, endDate).all();

    // 获取查询范围内的已删除实例
    const deletedInstancesResult = await DB.prepare(`
      SELECT * FROM deleted_instances 
      WHERE user_id = ? AND date BETWEEN ? AND ?
    `).bind(userId, startDate, endDate).all();

    return {
      todos: todosResult.results || [],
      completedInstances: completedInstancesResult.results || [],
      deletedInstances: deletedInstancesResult.results || [],
    };
  } catch (error: any) {
    const detail = error?.message || String(error)
    throw createError({ statusCode: 500, message: `D1 Error: ${detail}` });
  }
});
