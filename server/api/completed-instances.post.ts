import { getDB } from '../../utils/db';

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
    if (dayOfMonth > lastDayOfMonth) date.setDate(lastDayOfMonth);
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
  if (!userId) throw createError({ statusCode: 401, message: '缺少用户 ID' });

  const DB = getDB(event);
  const body = await readBody(event);

  if (!body.todoId || !body.date) throw createError({ statusCode: 400, message: '缺少必要的字段' });

  const todo = await DB.prepare(`SELECT * FROM todos WHERE id = ? AND user_id = ?`).bind(body.todoId, userId).first();
  if (!todo) throw createError({ statusCode: 404, message: '待办事项不存在或无权限' });

  try {
    // 处理所有实例的情况
    if (body.allInstances && todo.repeat_type !== 'none') {
      if (body.completed) {
        await DB.prepare(`UPDATE todos SET completed = 1 WHERE id = ?`).bind(body.todoId).run();
      } else {
        await DB.prepare(`UPDATE todos SET completed = 0 WHERE id = ?`).bind(body.todoId).run();
        await DB.prepare(`DELETE FROM completed_instances WHERE todo_id = ?`).bind(body.todoId).run();
      }
      return { success: true };
    }

    // 检查是否已存在完成记录
    const existingInstance = await DB.prepare(`
      SELECT * FROM completed_instances
      WHERE todo_id = ? AND date = ? AND user_id = ?
    `).bind(body.todoId, body.date, userId).first();

    let completed = false;

    if (existingInstance) {
      // 取消完成
      await DB.prepare(`
        DELETE FROM completed_instances WHERE todo_id = ? AND date = ? AND user_id = ?
      `).bind(body.todoId, body.date, userId).run();
    } else {
      // 标记完成
      await DB.prepare(`
        INSERT INTO completed_instances (todo_id, date, user_id) VALUES (?, ?, ?)
      `).bind(body.todoId, body.date, userId).run();
      completed = true;

      // 计算下一次日期并更新 next_date
      if (todo.repeat_type && todo.repeat_type !== 'none') {
        const nextDate = calculateNextDate(body.date, todo.repeat_type, todo.repeat_interval || 1);
        await DB.prepare(`UPDATE todos SET next_date = ? WHERE id = ?`).bind(nextDate, body.todoId).run();
      }
    }

    return { success: true, completed };
  } catch (error) {
    console.error('切换完成状态时出错:', error);
    throw createError({ statusCode: 500, message: '切换完成状态失败' });
  }
});
