import { getDB } from '../../utils/db';

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

    // 处理已完成实例的记录（用于重复任务实例的完成/取消状态切换）
    // 注意：重复任务实例的完成状态以 completed_instances 表为准
    const existingInstance = await DB.prepare(`
      SELECT * FROM completed_instances
      WHERE todo_id = ? AND date = ? AND user_id = ?
    `).bind(body.todoId, body.date, userId).first();

    let completed = false;

    if (existingInstance) {
      // 取消完成：删除实例记录
      await DB.prepare(`
        DELETE FROM completed_instances WHERE todo_id = ? AND date = ? AND user_id = ?
      `).bind(body.todoId, body.date, userId).run();
    } else {
      // 标记完成：插入实例记录
      await DB.prepare(`
        INSERT INTO completed_instances (todo_id, date, user_id) VALUES (?, ?, ?)
      `).bind(body.todoId, body.date, userId).run();
      completed = true;
    }

    return { success: true, completed };
  } catch (error) {
    console.error('切换完成状态时出错:', error);
    throw createError({ statusCode: 500, message: '切换完成状态失败' });
  }
});
