<template>
  <div class="calendar-container">
    <CalendarHeader
      :currentYear="currentYear"
      :currentMonth="currentMonth"
      :animationType="animationType"
      :themeType="themeType"
      @prevMonth="prevMonth"
      @nextMonth="nextMonth"
      @goToToday="goToToday"
      @changeAnimation="changeAnimation"
      @changeTheme="changeTheme"
    />

    <CalendarGrid
      :weekdays="weekdays"
      :calendarDays="calendarDays"
      :weekNumbers="weekNumbers"
      :animationType="animationType"
      @openAddTodoPopup="openAddTodoPopup"
      @openTodoActions="openTodoActions"
    />

    <AddTodoPopup
      v-if="showAddTodoPopup"
      v-model:todoText="todoText"
      v-model:todoRepeat="todoRepeat"
      :selectedDate="selectedDate"
      @close="closeAddTodoPopup"
      @save="saveTodo"
    />

    <TodoActionsMenu
      v-if="showTodoActions"
      :style="todoActionsStyle"
      @complete="completeTodo"
      @delete="deleteTodo"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { formatDate, getWeekNumber } from '~/composables/dateUtils'
import { shouldShowRepeatingTodo } from '~/composables/repeatUtils'

const props = defineProps({
  todos: { type: Array, required: true },
  completedInstances: { type: Array, required: true },
  deletedInstances: { type: Array, required: true },
  lunarData: { type: Object, required: true },
  holidayData: { type: Object, required: true },
  userId: { type: String, required: true },
})

const emit = defineEmits([
  'fetch-calendar-data',
  'add-todo',
  'complete-todo',
  'delete-todo',
])

// State
const currentDate = ref(new Date())
const currentYear = computed(() => currentDate.value.getFullYear())
const currentMonth = computed(() => currentDate.value.getMonth())
const weekdays = ['一', '二', '三', '四', '五', '六', '日']

const allowedAnimations = ['slide-left', 'default']
const savedAnimation = import.meta.client ? localStorage.getItem('calendar_animation_type') : null
const animationType = ref(savedAnimation || 'slide-left')

const savedTheme = import.meta.client ? localStorage.getItem('calendar_theme_type') : null
const themeType = ref(savedTheme || 'default')

// Popup state
const showAddTodoPopup = ref(false)
const todoText = ref('')
const todoRepeat = ref('none')
const selectedDate = ref(null)

// Todo action state
const showTodoActions = ref(false)
const todoActionsStyle = ref({})
const selectedTodo = ref(null)
const selectedTodoDate = ref(null)

// Touch event state
let touchStartTime = 0
let touchStartX = 0
let touchStartY = 0

// Calendar days computation
const calendarDays = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const currentDayOfWeek = today.getDay()
  const offsetToMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1
  const currentMonday = new Date(today)
  currentMonday.setDate(today.getDate() - offsetToMonday)
  currentMonday.setHours(0, 0, 0, 0)

  const startDate = new Date(currentMonday)
  startDate.setDate(startDate.getDate() - 7)

  const result = []
  for (let i = 0; i < 35; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)

    const year = date.getFullYear()
    const month = date.getMonth()
    const dayNumber = date.getDate()

    const isCurrentMonth = month === currentMonth.value && year === currentYear.value
    const dateStr = formatDate(date)
    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()

    result.push({
      dayNumber,
      isOtherMonth: !isCurrentMonth,
      isToday,
      date,
      dateStr,
      lunarDate: getLunarDate(date),
      holiday: props.holidayData[dateStr] || '',
      todos: getTodosForDate(date, dateStr),
    })
  }
  return result
})

// Week numbers
const weekNumbers = computed(() => {
  const weeks = []
  for (let i = 0; i < 5; i++) {
    const firstDayOfWeek = new Date(calendarDays.value[i * 7].date)
    const dayOfWeek = firstDayOfWeek.getDay()
    const offsetToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    const monday = new Date(firstDayOfWeek)
    monday.setDate(firstDayOfWeek.getDate() - offsetToMonday)
    weeks.push(getWeekNumber(monday))
  }
  return weeks
})

function getLunarDate(date) {
  return props.lunarData[formatDate(date)] || ''
}

function getTodosForDate(date, dateStr) {
  const result = []
  props.todos.forEach((todo) => {
    if (isInstanceDeleted(todo.id, dateStr)) return

    const displayDate = todo.next_date || todo.date

    if (displayDate === dateStr) {
      const isCompleted = todo.completed || isInstanceCompleted(todo.id, dateStr)
      result.push({ ...todo, displayDate, isCompleted })
      return
    }

    if (!todo.repeat_type || todo.repeat_type === 'none') return

    const originalDate = new Date(todo.date)
    const currentDateObj = new Date(dateStr)
    const interval = todo.repeat_interval || 1

    if (
      shouldShowRepeatingTodo(
        originalDate,
        currentDateObj,
        todo.repeat_type,
        interval,
        todo.end_date ? new Date(todo.end_date) : null
      )
    ) {
      const isCompleted = isInstanceCompleted(todo.id, dateStr)
      result.push({ ...todo, displayDate, isCompleted })
    }
  })
  return result
}

function isInstanceCompleted(todoId, dateStr) {
  return props.completedInstances.some(
    (instance) => instance.todo_id === todoId && instance.date === dateStr
  )
}

function isInstanceDeleted(todoId, dateStr) {
  return props.deletedInstances.some(
    (instance) => instance.todo_id === todoId && instance.date === dateStr
  )
}

// Navigation
const prevMonth = () => {
  if (import.meta.client) {
    document.documentElement.style.setProperty('--direction', '-1')
  }
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() - 1)
  currentDate.value = newDate
}

const nextMonth = () => {
  if (import.meta.client) {
    document.documentElement.style.setProperty('--direction', '1')
  }
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() + 1)
  currentDate.value = newDate
}

const goToToday = () => {
  currentDate.value = new Date()
}

watch(currentDate, async (newDate, oldValue) => {
  emit('fetch-calendar-data', newDate)
})

// Todo popup
const openAddTodoPopup = (date) => {
  selectedDate.value = date
  showAddTodoPopup.value = true
  todoText.value = ''
  todoRepeat.value = 'none'
}

const closeAddTodoPopup = () => {
  showAddTodoPopup.value = false
}

const saveTodo = async (eventData) => {
  if (!todoText.value.trim()) return
  try {
    await emit('add-todo', {
      text: todoText.value.trim(),
      date: selectedDate.value,
      repeatType: eventData?.repeatType || todoRepeat.value,
      repeatInterval: eventData?.repeatInterval || 1,
      endDate: eventData?.endDate,
    })
    closeAddTodoPopup()
  } catch (error) {
    console.error('添加待办事项失败:', error)
    alert('添加待办事项失败，请重试')
  }
}

// Todo actions
const openTodoActions = (todoId, todoDate, event) => {
  selectedTodo.value = todoId
  selectedTodoDate.value = todoDate
  showTodoActions.value = true

  if (import.meta.client && window.innerWidth <= 480) {
    todoActionsStyle.value = {
      position: 'fixed',
      bottom: '0',
      left: '0',
      width: '100%',
      display: 'flex',
    }
  } else {
    const target = event?.target || event?.currentTarget
    if (target) {
      const rect = target.getBoundingClientRect()
      todoActionsStyle.value = {
        position: 'absolute',
        top: `${rect.bottom}px`,
        left: `${rect.left}px`,
        display: 'block',
      }
    }
  }
}

const completeTodo = async () => {
  if (!selectedTodo.value || !selectedTodoDate.value) return
  await emit('complete-todo', {
    todoId: selectedTodo.value,
    date: selectedTodoDate.value,
    allInstances: false,
  })
  showTodoActions.value = false
}

const deleteTodo = async () => {
  if (!selectedTodo.value || !selectedTodoDate.value) return
  const todo = props.todos.find((t) => t.id === selectedTodo.value)
  if (!todo) return

  if (todo.repeat_type && todo.repeat_type !== 'none') {
    const confirmed = confirm('删除重复事件\n\n确定: 删除所有重复事件\n取消: 仅删除当前事件')
    await emit('delete-todo', {
      todoId: selectedTodo.value,
      date: selectedTodoDate.value,
      allInstances: confirmed,
    })
    if (confirmed) {
      // message.success handled by parent
    }
  } else {
    await emit('delete-todo', {
      todoId: selectedTodo.value,
      date: selectedTodoDate.value,
      allInstances: false,
    })
  }
  showTodoActions.value = false
}

// Theme & Animation
const changeAnimation = (newType) => {
  animationType.value = newType
  if (import.meta.client) localStorage.setItem('calendar_animation_type', newType)
}

const changeTheme = (newType) => {
  themeType.value = newType
  if (import.meta.client) localStorage.setItem('calendar_theme_type', newType)
  applyTheme(newType)
}

const applyTheme = (theme) => {
  if (!import.meta.client) return
  const root = document.documentElement
  root.classList.remove('classic-theme', 'orange-theme', 'green-theme')
  if (theme === 'classic') root.classList.add('classic-theme')
  else if (theme === 'orange') root.classList.add('orange-theme')
  else if (theme === 'green') root.classList.add('green-theme')
}

// Touch events
const handleTouchStart = (event) => {
  touchStartTime = new Date().getTime()
  touchStartX = event.changedTouches[0].screenX
  touchStartY = event.changedTouches[0].screenY
}

const handleTouchEnd = async (event) => {
  const touchEndTime = new Date().getTime()
  const touchEndX = event.changedTouches[0].screenX
  const touchEndY = event.changedTouches[0].screenY

  const touchDuration = touchEndTime - touchStartTime
  const touchDistanceX = Math.abs(touchEndX - touchStartX)
  const touchDistanceY = Math.abs(touchEndY - touchStartY)

  if (touchDuration < 300 && touchDistanceX < 10 && touchDistanceY < 10) {
    const target = event.target.closest('.calendar-day')
    if (target) openAddTodoPopup(target.dataset.date)
  }

  if (touchDistanceX > 100 && touchDistanceY < 50) {
    if (touchEndX < touchStartX) await nextMonth()
    else await prevMonth()
  }
}

const closeActionsOnOutsideClick = (event) => {
  if (
    !event.target.closest('.todo-item') &&
    !event.target.closest('.todo-actions')
  ) {
    showTodoActions.value = false
  }
}

onMounted(async () => {
  if (import.meta.client) {
    document.addEventListener('click', closeActionsOnOutsideClick)
    const calendarEl = document.querySelector('.calendar-grid')
    if (calendarEl) {
      calendarEl.addEventListener('touchstart', handleTouchStart)
      calendarEl.addEventListener('touchend', handleTouchEnd)
    }
    applyTheme(themeType.value)
  }
})
</script>

<style scoped>
.calendar-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 10px;
  margin: 0;
  box-sizing: border-box;
  background: var(--background-color);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: var(--text-primary);
}

@media (max-width: 768px) {
  .calendar-container {
    padding: 4px;
  }
}
</style>
