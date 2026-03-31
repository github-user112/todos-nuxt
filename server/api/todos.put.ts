import { getDB } from '../../utils/db';

export default defineEventHandler(async (event) => {
  const userId = getQuery(event).uid as string;
  if (!userId) {
    throw createError({ statusCode: 401, message: '缺少用户 ID' });
  }

  const DB = getDB(event);
  const body = await readBody(event);

  if (!body.id) {
    throw createError({ statusCode: 400, message: '缺少待办事项 ID' });
  }

  try {
    const todo = await DB.prepare(`SELECT * FROM todos WHERE id = ? AND user_id = ?`).bind(body.id, userId).first();
    if (!todo) {
      throw createError({ statusCode: 404, message: '待办事项不存在或无权限' });
    }

    const completed = body.completed !== undefined ? (body.completed ? 1 : 0) : todo.completed;
    const endDate = body.endDate !== undefined ? body.endDate : todo.end_date;

    const result = await DB.prepare(`UPDATE todos SET completed = ?, end_date = ? WHERE id = ?`).bind(completed, endDate, body.id).run();

    return { success: result.success };
  } catch (error: any) {
    if (error.statusCode) throw error;
    console.error('更新待办事项时出错:', error);
    throw createError({ statusCode: 500, message: '更新待办事项失败' });
  }
});
