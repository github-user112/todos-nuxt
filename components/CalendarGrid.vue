<template>
  <div class="calendar-grid">
    <div class="empty-corner"></div>

    <div v-for="(day, index) in weekdays" :key="day" :class="['calendar-weekday', { 'weekend-header': isWeekendHeader(index) }]">
      {{ day }}
    </div>

    <template v-for="(week, weekIndex) in 5" :key="`week-number-${weekIndex}`">
      <div class="week-number" :style="{ gridRow: weekIndex + 2 }">
        {{ weekNumbers[weekIndex] }}
      </div>
    </template>

    <TransitionGroup :name="animationType ? animationType : 'default'" :enter-active-class="activeClass">
      <template v-for="(week, weekIndex) in 5" :key="`week-${weekIndex}`">
        <CalendarDay
          v-for="(day, dayIndex) in calendarDays.slice(weekIndex * 7, (weekIndex + 1) * 7)"
          :key="`${day.dateStr}-${day.isOtherMonth}`"
          :day="day"
          class="list-item"
          :style="{
            '--delay': (weekIndex + dayIndex / 7) * 0.1 + 's',
            '--i': weekIndex,
            '--j': dayIndex,
            'grid-row': weekIndex + 2,
            'grid-column': dayIndex + 2,
          }"
          @dblclick="$emit('openAddTodoPopup', day.dateStr)"
          @openTodoActions="(todoId, todoDate, event) => $emit('openTodoActions', todoId, todoDate, event)"
        />
      </template>
    </TransitionGroup>
  </div>
</template>

<script setup>
const props = defineProps({
  weekdays: { type: Array, required: true },
  calendarDays: { type: Array, required: true },
  weekNumbers: { type: Array, required: true },
  animationType: { type: String, required: true },
})

const activeClass = computed(() =>
  props.animationType.includes('animate')
    ? 'animate__animated ' + props.animationType
    : props.animationType + '-enter-active'
)

// Weekend header highlight: depends on week start
// If weekdays starts with '一', weekends are index 5,6
// If weekdays starts with '日', weekends are index 0,6
function isWeekendHeader(index) {
  if (props.weekdays[0] === '日') {
    return index === 0 || index === 6
  }
  return index >= 5
}

defineEmits(['openAddTodoPopup', 'openTodoActions'])
</script>

<style scoped>
.calendar-grid {
  display: grid;
  grid-template-columns: 40px repeat(7, 1fr);
  grid-template-rows: 36px repeat(5, 1fr);
  gap: 4px;
  flex: 1;
  min-height: 0;
  height: calc(100vh - 80px);
  padding: 0 2px;
  position: relative;
}

.empty-corner {
  grid-column: 1;
  grid-row: 1;
}

.calendar-weekday {
  text-align: center;
  font-weight: 600;
  padding: 12px 0;
  background: var(--hover-color);
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 15px;
  box-shadow: var(--shadow-sm);
  z-index: 10;
  position: relative;
}

.weekend-header {
  color: var(--danger-color);
  background: var(--calendar-day-holiday-rest-bg);
}

.week-number {
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: var(--text-secondary);
  background: var(--hover-color);
  border-radius: 8px;
  font-size: 14px;
  z-index: 10;
  position: relative;
}

@media (max-width: 768px) {
  .calendar-grid {
    gap: 2px;
    grid-template-columns: 24px repeat(7, 1fr);
    height: calc(100vh - 60px);
  }
  .calendar-weekday {
    font-size: 12px;
    padding: 6px 0;
    border-radius: 6px;
  }
  .week-number {
    font-size: 11px;
    border-radius: 6px;
  }
}

@media (max-width: 480px) {
  .calendar-grid {
    grid-template-columns: 0 repeat(7, 1fr);
  }
  .empty-corner,
  .week-number {
    display: none;
  }
}
</style>
