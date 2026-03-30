/**
 * 重复事件计算工具函数
 * 支持自定义间隔的重复事件计算逻辑
 */

/**
 * 计算重复事件是否应该在指定日期显示
 */
export function shouldShowRepeatingTodo(
  todoDate: Date,
  currentDate: Date,
  repeatType: string,
  interval: number = 1,
  endDate: Date | null = null
): boolean {
  if (currentDate < todoDate) return false;
  if (endDate && currentDate > endDate) return false;
  if (!repeatType || repeatType === 'none') return false;
  if (!Number.isInteger(interval) || interval < 1) return false;

  switch (repeatType) {
    case 'daily':
      return shouldShowDailyInterval(todoDate, currentDate, interval);
    case 'weekly':
      return shouldShowWeeklyInterval(todoDate, currentDate, interval);
    case 'monthly':
      return shouldShowMonthlyInterval(todoDate, currentDate, interval);
    case 'yearly':
      return shouldShowYearlyInterval(todoDate, currentDate, interval);
    default:
      return false;
  }
}

function shouldShowDailyInterval(todoDate: Date, currentDate: Date, interval: number): boolean {
  const dayDiff = Math.floor(
    (currentDate.getTime() - todoDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  return dayDiff >= 0 && dayDiff % interval === 0;
}

function shouldShowWeeklyInterval(todoDate: Date, currentDate: Date, interval: number): boolean {
  if (todoDate.getDay() !== currentDate.getDay()) return false;
  const weekDiff = Math.floor(
    (currentDate.getTime() - todoDate.getTime()) / (1000 * 60 * 60 * 24 * 7)
  );
  return weekDiff >= 0 && weekDiff % interval === 0;
}

function shouldShowMonthlyInterval(todoDate: Date, currentDate: Date, interval: number): boolean {
  const adjustedCurrentDate = adjustMonthEndDate(
    todoDate,
    currentDate.getFullYear(),
    currentDate.getMonth()
  );
  if (adjustedCurrentDate.getDate() !== currentDate.getDate()) return false;
  const monthDiff =
    (currentDate.getFullYear() - todoDate.getFullYear()) * 12 +
    (currentDate.getMonth() - todoDate.getMonth());
  return monthDiff >= 0 && monthDiff % interval === 0;
}

function shouldShowYearlyInterval(todoDate: Date, currentDate: Date, interval: number): boolean {
  if (todoDate.getMonth() !== currentDate.getMonth()) return false;
  const todoDay = todoDate.getDate();
  const currentDay = currentDate.getDate();
  if (todoDay === 29 && todoDate.getMonth() === 1) {
    const isCurrentLeapYear = isLeapYear(currentDate.getFullYear());
    if (!isCurrentLeapYear && currentDay === 28) {
      // allow
    } else if (currentDay !== todoDay) {
      return false;
    }
  } else if (todoDay !== currentDay) {
    return false;
  }
  const yearDiff = currentDate.getFullYear() - todoDate.getFullYear();
  return yearDiff >= 0 && yearDiff % interval === 0;
}

function adjustMonthEndDate(originalDate: Date, targetYear: number, targetMonth: number): Date {
  const originalDay = originalDate.getDate();
  const daysInTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
  const adjustedDay = Math.min(originalDay, daysInTargetMonth);
  return new Date(targetYear, targetMonth, adjustedDay);
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * 验证重复间隔值
 */
export function validateRepeatInterval(
  repeatType: string,
  interval: number
): { valid: boolean; message?: string } {
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

/**
 * 获取重复事件的下一个日期
 */
export function getNextRepeatDates(
  todoDate: Date,
  repeatType: string,
  interval: number = 1,
  count: number = 1
): Date[] {
  const dates: Date[] = [];
  if (!repeatType || repeatType === 'none') return dates;

  for (let i = 1; i <= count; i++) {
    let nextDate: Date | undefined;
    switch (repeatType) {
      case 'daily':
        nextDate = new Date(todoDate);
        nextDate.setDate(todoDate.getDate() + interval * i);
        break;
      case 'weekly':
        nextDate = new Date(todoDate);
        nextDate.setDate(todoDate.getDate() + interval * 7 * i);
        break;
      case 'monthly':
        nextDate = new Date(todoDate);
        nextDate.setMonth(todoDate.getMonth() + interval * i);
        if (nextDate.getDate() !== todoDate.getDate()) {
          nextDate = adjustMonthEndDate(todoDate, nextDate.getFullYear(), nextDate.getMonth());
        }
        break;
      case 'yearly':
        nextDate = new Date(todoDate);
        nextDate.setFullYear(todoDate.getFullYear() + interval * i);
        if (todoDate.getMonth() === 1 && todoDate.getDate() === 29 && !isLeapYear(nextDate.getFullYear())) {
          nextDate.setDate(28);
        }
        break;
    }
    if (nextDate) dates.push(nextDate);
  }
  return dates;
}

/**
 * 获取重复事件的下一个日期（考虑结束日期）
 */
export function getNextRepeatDatesWithEndDate(
  todoDate: Date,
  repeatType: string,
  interval: number = 1,
  count: number = 1,
  endDate: string = ''
): Date[] {
  const dates: Date[] = [];
  if (!repeatType || repeatType === 'none') return dates;

  let endDateTime: Date | null = null;
  if (endDate) {
    endDateTime = new Date(endDate);
    endDateTime.setHours(23, 59, 59, 999);
  }

  for (let i = 1; i <= count; i++) {
    let nextDate: Date | undefined;
    switch (repeatType) {
      case 'daily':
        nextDate = new Date(todoDate);
        nextDate.setDate(todoDate.getDate() + interval * i);
        break;
      case 'weekly':
        nextDate = new Date(todoDate);
        nextDate.setDate(todoDate.getDate() + interval * 7 * i);
        break;
      case 'monthly':
        nextDate = new Date(todoDate);
        nextDate.setMonth(todoDate.getMonth() + interval * i);
        if (nextDate.getDate() !== todoDate.getDate()) {
          nextDate = adjustMonthEndDate(todoDate, nextDate.getFullYear(), nextDate.getMonth());
        }
        break;
      case 'yearly':
        nextDate = new Date(todoDate);
        nextDate.setFullYear(todoDate.getFullYear() + interval * i);
        if (todoDate.getMonth() === 1 && todoDate.getDate() === 29 && !isLeapYear(nextDate.getFullYear())) {
          nextDate.setDate(28);
        }
        break;
    }
    if (nextDate && endDateTime && nextDate > endDateTime) break;
    if (nextDate) dates.push(nextDate);
  }
  return dates;
}
