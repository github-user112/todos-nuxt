import { getDB } from '../../utils/db';

export default defineEventHandler(async (event) => {
  const userId = getQuery(event).uid as string;
  if (!userId) {
    throw createError({ statusCode: 401, message: '缺少用户 ID' });
  }

  const DB = getDB(event);
  const body = await readBody(event);

  if (!body.todoId || !body.date) {
    throw createError({ statusCode: 400, message: '缺少必要的字段' });
  }

  try {
    const todo = await DB.prepare(`SELECT * FROM todos WHERE id = ? AND user_id = ?`).bind(body.todoId, userId).first();
    if (!todo) {
      throw createError({ statusCode: 404, message: '待办事项不存在或无权限' });
    }

    // 处理删除所有实例的情况
    if (body.allInstances && todo.repeat_type !== 'none') {
      await DB.prepare(`DELETE FROM todos WHERE id = ?`).bind(body.todoId).run();
      return { success: true };
    }

    // 检查是否已存在删除记录
    const existingInstance = await DB.prepare(`
      SELECT * FROM deleted_instances 
      WHERE todo_id = ? AND date = ? AND user_id = ?
    `).bind(body.todoId, body.date, userId).first();

    if (!existingInstance) {
      await DB.prepare(`
        INSERT INTO deleted_instances (todo_id, date, user_id)
        VALUES (?, ?, ?)
      `).bind(body.todoId, body.date, userId).run();
    }

    return { success: true };
  } catch (error: any) {
    if (error.statusCode) throw error;
    console.error('创建删除记录时出错:', error);
    throw createError({ statusCode: 500, message: '创建删除记录失败' });
  }
});
