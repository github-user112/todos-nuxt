<template>
  <Transition @before-enter="onBeforeEnter">
    <div
      :class="[
        'calendar-day',
        { 'other-month': day.isOtherMonth },
        { 'current-day': day.isToday },
        { 'weekend-day': isWeekend(day.date) && !day.holiday },
        { 'holiday-rest-day': day.holiday === '休' || (typeof day.holiday === 'object' && day.holiday.type === 'public_holiday') },
        { 'holiday-work-day': day.holiday === '班' || (typeof day.holiday === 'object' && day.holiday.type === 'transfer_workday') },
      ]"
      :data-date="day.dateStr"
      @dblclick="$emit('dblclick')"
    >
      <div class="day-number">{{ day.dayNumber }}</div>

      <div v-if="day.holiday" class="holiday-badge" :class="getHolidayBadgeClass(day.holiday)">
        {{ getHolidayBadgeText(day.holiday) }}
      </div>

      <div v-if="getHolidayName(day.holiday) || day.lunarDate" class="holiday-name">
        {{ getHolidayName(day.holiday) || day.lunarDate }}
      </div>

      <div class="todo-list">
        <div
          v-for="todo in day.todos"
          :key="`${todo.id}-${day.dateStr}`"
          :class="['todo-item', { completed: todo.isCompleted }]"
          :data-id="todo.id"
          :data-date="todo.displayDate || todo.date"
          @click="$emit('openTodoActions', todo.id, todo.displayDate || todo.date, $event)"
        >
          {{ todo.text }}
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
defineProps({
  day: { type: Object, required: true },
});

defineEmits(['dblclick', 'openTodoActions']);

function onBeforeEnter() {}

function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function getHolidayBadgeClass(holiday) {
  if (holiday === '休' || (typeof holiday === 'object' && holiday.type === 'public_holiday')) {
    return 'rest-badge';
  } else if (holiday === '班' || (typeof holiday === 'object' && holiday.type === 'transfer_workday')) {
    return 'work-badge';
  }
  return '';
}

function getHolidayBadgeText(holiday) {
  if (holiday === '休' || (typeof holiday === 'object' && holiday.type === 'public_holiday')) {
    return '休';
  } else if (holiday === '班' || (typeof holiday === 'object' && holiday.type === 'transfer_workday')) {
    return '班';
  }
  return '';
}

function getHolidayName(holiday) {
  if (typeof holiday === 'object' && holiday.name) {
    return holiday.name;
  }
  return '';
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 5s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.calendar-day {
  border: 1px solid var(--calendar-day-border);
  padding: 8px 4px 4px 4px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  background: var(--calendar-day-bg);
  min-height: 0;
  position: relative;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: default;
}

.calendar-day:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
  border-color: var(--primary-color);
  z-index: 5;
}

.weekend-day {
  background: var(--calendar-day-weekend-bg);
  border-color: var(--calendar-day-weekend-border);
}

.holiday-rest-day {
  background: var(--calendar-day-holiday-rest-bg);
  border-color: var(--calendar-day-holiday-rest-border);
}

.holiday-work-day {
  background: var(--calendar-day-holiday-work-bg);
  border-color: var(--calendar-day-holiday-work-border);
}

.other-month {
  opacity: var(--calendar-day-other-month-opacity);
  color: var(--other-month-text);
  border-color: var(--other-month-border);
}

.other-month.weekend-day,
.other-month.holiday-rest-day,
.other-month.holiday-work-day {
  opacity: var(--calendar-day-other-month-opacity);
}

.day-number {
  position: absolute;
  top: 6px;
  left: 8px;
  font-weight: 600;
  color: var(--text-primary);
  font-size: 15px;
  z-index: 1;
  transition: all 0.3s;
}

.other-month .day-number {
  color: var(--other-month-text);
  font-size: 0.9em;
}

.current-day {
  background: var(--calendar-day-current-bg);
  border: 2px solid var(--calendar-day-current-border);
  box-shadow: 0 0 0 3px var(--form-input-focus-shadow), var(--shadow-md);
}

.current-day .day-number {
  color: var(--calendar-day-current-border);
  font-weight: 700;
  font-size: 1.1em;
}

.holiday-badge {
  position: absolute;
  top: 6px;
  right: 8px;
  font-size: 0.75em;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 12px;
  z-index: 2;
  min-width: 20px;
  text-align: center;
  transition: transform 0.2s;
}

.holiday-badge:hover {
  transform: scale(1.15);
}

.rest-badge {
  background: var(--badge-rest-bg);
  color: var(--badge-text);
  box-shadow: 0 2px 6px rgba(229, 62, 62, 0.35);
}

.work-badge {
  background: var(--badge-work-bg);
  color: var(--badge-text);
  box-shadow: 0 2px 6px rgba(99, 102, 241, 0.35);
}

.holiday-name {
  position: absolute;
  top: 8px;
  right: 40px;
  font-size: 0.7em;
  color: var(--text-secondary);
  z-index: 1;
  max-width: 80%;
  text-align: right;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.holiday-rest-day .holiday-name {
  color: var(--badge-rest-bg);
  font-weight: 600;
}

.holiday-work-day .holiday-name {
  color: var(--badge-work-bg);
  font-weight: 600;
}

.todo-list {
  flex: 1;
  overflow-y: auto;
  margin-top: 25px;
  padding-right: 2px;
  max-height: calc(100% - 28px);
}

.todo-list::-webkit-scrollbar {
  width: 3px;
}

.todo-list::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 3px;
}

.todo-item {
  font-size: 0.82em;
  padding: 6px 8px;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background: var(--todo-item-bg);
  border-radius: 6px;
  border-left: 3px solid var(--todo-item-border-left);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
}

.todo-item:hover {
  background: var(--hover-color);
  transform: translateX(3px);
  box-shadow: var(--shadow-md);
}

.todo-item:active {
  transform: translateX(3px) scale(0.98);
}

.todo-item.completed {
  text-decoration: line-through;
  text-decoration-thickness: 2px;
  color: var(--todo-item-completed-text);
  border-left-color: var(--todo-item-completed-border-left);
  background: var(--todo-item-completed-bg);
}

@media (max-width: 768px) {
  .calendar-day {
    padding: 3px;
    border-radius: 8px;
  }
  .calendar-day:hover {
    transform: none;
  }
  .todo-item {
    padding: 3px 4px;
    font-size: 0.75em;
    border-left-width: 2px;
  }
  .holiday-badge {
    padding: 1px 4px;
    font-size: 0.7em;
    right: 4px;
    top: 4px;
  }
  .holiday-name {
    font-size: 0.65em;
    top: 24px;
    right: 4px;
  }
  .todo-list {
    margin-top: 36px;
  }
}
</style>
