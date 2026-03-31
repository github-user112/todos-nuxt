import { getDB } from '../../utils/db';

function validateRepeatInterval(repeatType: string, interval: number): { valid: boolean; message?: string } {
  const limits: Record<string, { min: number; max: number; unit: string }> = {
    daily: { min: 1, max: 365, unit: '天' },
    weekly: { min: 1, max: 52, unit: '周' },
    monthly: { min: 1, max: 12, unit: '个月' },
    yearly: { min: 1, max: 10, unit: '年' },
  };

  if (repeatType === 'none') return { valid: true };
  const limit = limits[repeatType];
  if (!limit) return { valid: false, message: '不支持的重复类型' };

  if (!Number.isInteger(interval) || interval < limit.min || interval > limit.max) {
    const typeLabel =
      repeatType === 'daily' ? '每日' : repeatType === 'weekly' ? '每周' : repeatType === 'monthly' ? '每月' : '每年';
    return { valid: false, message: `${typeLabel}间隔必须在${limit.min}-${limit.max}${limit.unit}之间` };
  }
  return { valid: true };
}

export default defineEventHandler(async (event) => {
  const userId = getQuery(event).uid as string;
  if (!userId) {
    throw createError({ statusCode: 401, message: '缺少用户 ID' });
  }

  const DB = getDB(event);
  const body = await readBody(event);

  if (!body.text || !body.date) {
    throw createError({ statusCode: 400, message: '缺少必要的字段' });
  }

  const repeatType = body.repeatType || 'none';
  const repeatInterval = body.repeatInterval || 1;
  const endDate = body.endDate || '2039-12-31';

  const validationResult = validateRepeatInterval(repeatType, repeatInterval);
  if (!validationResult.valid) {
    throw createError({ statusCode: 400, message: validationResult.message });
  }

  try {
    const result = await DB.prepare(`
      INSERT INTO todos (text, date, repeat_type, repeat_interval, end_date, completed, user_id)
      VALUES (?, ?, ?, ?, ?, 0, ?)
    `).bind(body.text, body.date, repeatType, repeatInterval, endDate, userId).run();

    if (result.success) {
      const todo = await DB.prepare(`SELECT * FROM todos WHERE id = ?`).bind(result.meta.last_row_id).first();
      return { success: true, todo };
    } else {
      throw new Error('插入待办事项失败');
    }
  } catch (error) {
    console.error('创建待办事项时出错:', error);
    throw createError({ statusCode: 500, message: '创建待办事项失败' });
  }
});
