import { getDB } from '../../utils/db';

/**
 * 计算下一次的日期
 */
function calculateNextDate(completedDate: string, repeatType: string, repeatInterval: number): string {
  const date = new Date(completedDate);
  if (repeatType === 'daily') {
    date.setDate(date.getDate() + repeatInterval);
  } else if (repeatType === 'weekly') {
    date.setDate(date.getDate() + 7 * repeatInterval);
  } else if (repeatType === 'monthly') {
    const dayOfMonth = date.getDate();
    date.setMonth(date.getMonth() + repeatInterval);
    const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    if (dayOfMonth > lastDayOfMonth) {
      date.setDate(lastDayOfMonth);
    }
  } else if (repeatType === 'yearly') {
    date.setFullYear(date.getFullYear() + repeatInterval);
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default defineEventHandler(async (event) => {
  const userId = getQuery(event).uid as string;
  if (!userId) {
    throw createError({ statusCode: 401, message: '缺少用户 ID' });
  }

  const startDate = getQuery(event).startDate as string;
  const endDate = getQuery(event).endDate as string;
  if (!startDate || !endDate) {
    throw createError({ statusCode: 400, message: '缺少开始日期或结束日期参数' });
  }

  const DB = getDB(event);

  try {
    const todosResult = await DB.prepare(`
      SELECT DISTINCT t.id, t.text, t.date, t.repeat_type, t.repeat_interval, t.end_date, t.completed, t.user_id, t.next_date,
             COALESCE(t.next_date, t.date) as display_date
      FROM todos t
      WHERE t.user_id = ? AND (
        (COALESCE(t.next_date, t.date) BETWEEN ? AND ?) OR
        (t.repeat_type != 'none' AND t.date <= ? AND (t.end_date IS NULL OR t.end_date >= ?))
      ) AND (t.end_date IS NULL OR t.end_date >= ?)
      AND NOT EXISTS (
        SELECT 1 FROM completed_instances ci 
        WHERE ci.todo_id = t.id AND ci.date = COALESCE(t.next_date, t.date)
      )
      ORDER BY display_date, t.repeat_type, t.repeat_interval
    `).bind(userId, startDate, endDate, endDate, startDate, startDate).all();

    const completedInstancesResult = await DB.prepare(`
      SELECT * FROM completed_instances 
      WHERE user_id = ? AND date BETWEEN ? AND ?
    `).bind(userId, startDate, endDate).all();

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
