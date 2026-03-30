import { getDB } from '../../utils/db';

export default defineEventHandler(async (event) => {
  const userId = getQuery(event).uid as string;
  if (!userId) {
    throw createError({ statusCode: 401, message: '缺少用户 ID' });
  }

  const id = getQuery(event).id as string;
  if (!id) {
    throw createError({ statusCode: 400, message: '缺少待办事项 ID' });
  }

  const DB = getDB(event);

  try {
    const todo = await DB.prepare(`SELECT * FROM todos WHERE id = ? AND user_id = ?`).bind(id, userId).first();
    if (!todo) {
      throw createError({ statusCode: 404, message: '待办事项不存在或无权限' });
    }

    const result = await DB.prepare(`DELETE FROM todos WHERE id = ?`).bind(id).run();
    return { success: result.success };
  } catch (error: any) {
    if (error.statusCode) throw error;
    console.error('删除待办事项时出错:', error);
    throw createError({ statusCode: 500, message: '删除待办事项失败' });
  }
});
