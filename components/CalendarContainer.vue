<template>
  <div class="calendar-container">
    <!-- 设置抽屉（移动端） -->
    <div class="settings-drawer" :class="{ open: showDrawer }" @click.self="showDrawer = false">
      <div class="drawer-panel">
        <div class="drawer-header">
          <span class="drawer-title">⚙️ 设置</span>
          <button class="drawer-close" @click="showDrawer = false">✕</button>
        </div>
        <div class="drawer-body">
          <div class="setting-group">
            <label class="setting-label">🎨 主题</label>
            <NSelect
              :value="themeType"
              :options="themeOptions"
              size="small"
              @update:value="changeTheme"
            />
          </div>
          <div class="setting-group">
            <label class="setting-label">🎬 动画</label>
            <NSelect
              :value="animationType"
              :options="animationOptions"
              size="small"
              @update:value="changeAnimation"
            />
          </div>
          <div class="setting-group">
            <label class="setting-label">📅 每周起始</label>
            <NSelect
              :value="weekStart"
              :options="weekStartOptions"
              size="small"
              @update:value="changeWeekStart"
            />
          </div>
          <div class="setting-group">
            <label class="setting-label">👁️ 视图模式</label>
            <NSelect
              :value="viewMode"
              :options="viewModeOptions"
              size="small"
              @update:value="changeViewMode"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 移动端汉堡按钮 -->
    <button class="fab-menu" @click="showDrawer = true" v-if="!showDrawer">
      ☰
    </button>

    <CalendarHeader
      :currentYear="currentYear"
      :currentMonth="currentMonth"
      :animationType="animationType"
      :themeType="themeType"
      :weekStart="weekStart"
      :viewMode="viewMode"
      :themeOptions="themeOptions"
      :animationOptions="animationOptions"
      :weekStartOptions="weekStartOptions"
      :viewModeOptions="viewModeOptions"
      @prevMonth="prevMonth"
      @nextMonth="nextMonth"
      @goToToday="goToToday"
      @changeAnimation="changeAnimation"
      @changeTheme="changeTheme"
      @changeWeekStart="changeWeekStart"
      @changeViewMode="changeViewMode"
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
      :show="showAddTodoPopup"
      v-model:todoText="todoText"
      v-model:todoRepeat="todoRepeat"
      :selectedDate="selectedDate"
      @close="closeAddTodoPopup"
      @save="saveTodo"
    />

    <!-- 删除确认弹窗 -->
    <NModal
      :show="showDeleteDialog"
      preset="card"
      :style="{ width: '90%', maxWidth: '380px' }"
      :mask-closable="true"
      :close-on-esc="true"
      @update:show="cancelDelete"
    >
      <div class="delete-dialog-body">
        <div class="delete-icon">🗑️</div>
        <div class="delete-title">确认删除</div>
        <div class="delete-desc">
          {{ deleteAllInstances ? '将删除该重复事项的所有实例' : '确定要删除这个待办事项吗？' }}
        </div>
        <div class="delete-options" v-if="deleteShowOptions">
          <NButton
            :type="!deleteAllInstances ? 'error' : 'default'"
            size="small"
            @click="deleteAllInstances = false"
          >
            仅删除当前
          </NButton>
          <NButton
            :type="deleteAllInstances ? 'error' : 'default'"
            size="small"
            @click="deleteAllInstances = true"
          >
            删除所有重复
          </NButton>
        </div>
      </div>
      <template #footer>
        <NSpace justify="end">
          <NButton @click="cancelDelete">取消</NButton>
          <NButton type="error" @click="confirmDelete">确认删除</NButton>
        </NSpace>
      </template>
    </NModal>

    <TodoActionsMenu
      v-if="showTodoActions"
      :style="todoActionsStyle"
      @complete="completeTodo"
      @delete="startDelete"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { NModal, NButton, NSpace, NSelect } from 'naive-ui'
import { formatDate, getWeekNumber } from '~/composables/dateUtils'
import { shouldShowRepeatingTodo } from '~/composables/repeatUtils'

const ALL_THEMES = [
  { key: 'default', cls: '', label: '🔮 极光紫' },
  { key: 'deep-dawn', cls: 'theme-deep-dawn', label: '🌅 深邃晨曦' },
  { key: 'twilight-rose', cls: 'theme-twilight-rose', label: '🌹 暮光玫瑰' },
  { key: 'amber-night', cls: 'theme-amber-night', label: '🌆 琥珀夜幕' },
  { key: 'coral-sand', cls: 'theme-coral-sand', label: '🏖️ 珊瑚柔沙' },
  { key: 'azure-flame', cls: 'theme-azure-flame', label: '🔥 蔚蓝烈焰' },
  { key: 'sunset-bay', cls: 'theme-sunset-bay', label: '🌇 落日海湾' },
  { key: 'emerald-gold', cls: 'theme-emerald-gold', label: '💎 翡翠流金' },
  { key: 'violet-spring', cls: 'theme-violet-spring', label: '🌸 紫罗兰春' },
  { key: 'royal-gold', cls: 'theme-royal-gold', label: '👑 皇室金紫' },
  { key: 'midnight-blue', cls: 'theme-midnight-blue', label: '🌃 午夜深蓝' },
]

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

// --- Settings ---
const savedAnimation = import.meta.client ? localStorage.getItem('calendar_animation_type') : null
const animationType = ref(savedAnimation || 'slide-left')
const savedTheme = import.meta.client ? localStorage.getItem('calendar_theme_type') : null
const themeType = ref(savedTheme || 'default')
const savedWeekStart = import.meta.client ? localStorage.getItem('calendar_week_start') : null
const weekStart = ref(savedWeekStart || 'monday') // 'monday' | 'sunday'
const savedViewMode = import.meta.client ? localStorage.getItem('calendar_view_mode') : null
const viewMode = ref(savedViewMode || 'full-week') // 'full-week' | 'focus-today'
const showDrawer = ref(false)

const themeOptions = ALL_THEMES.map(t => ({ label: t.label, value: t.key }))
const animationOptions = [
  { label: '🎬 向左滑动', value: 'slide-left' },
  { label: '⬆️ 淡入上移', value: 'fade-up' },
  { label: '🔍 缩放进入', value: 'zoom-in' },
  { label: '🔄 翻转进入', value: 'flip' },
  { label: '🌊 级联瀑布', value: 'cascade' },
  { label: '🎲 随机', value: 'random' },
  { label: '💥 弹跳', value: 'animate__bounce' },
  { label: '🎉 抖动', value: 'animate__tada' },
]
const weekStartOptions = [
  { label: '周一', value: 'monday' },
  { label: '周日', value: 'sunday' },
]
const viewModeOptions = [
  { label: '完整周视图', value: 'full-week' },
  { label: '聚焦今日', value: 'focus-today' },
]

// --- State ---
const currentDate = ref(new Date())
const currentYear = computed(() => currentDate.value.getFullYear())
const currentMonth = computed(() => currentDate.value.getMonth())

const weekdays = computed(() =>
  weekStart.value === 'monday'
    ? ['一', '二', '三', '四', '五', '六', '日']
    : ['日', '一', '二', '三', '四', '五', '六']
)

// Popup state
const showAddTodoPopup = ref(false)
const todoText = ref('')
const todoRepeat = ref('none')
const selectedDate = ref(null)

// Delete dialog state
const showDeleteDialog = ref(false)
const deleteTargetTodoId = ref(null)
const deleteTargetDate = ref(null)
const deleteAllInstances = ref(false)
const deleteShowOptions = ref(false)

// Todo action state
const showTodoActions = ref(false)
const todoActionsStyle = ref({})
const selectedTodo = ref(null)
const selectedTodoDate = ref(null)

// Touch event state
let touchStartTime = 0
let touchStartX = 0
let touchStartY = 0

// --- Calendar days computation ---
const calendarDays = computed(() => {
  const gridDate = new Date(currentDate.value)
  gridDate.setHours(0, 0, 0, 0)

  const realToday = new Date()
  realToday.setHours(0, 0, 0, 0)

  const isMonday = weekStart.value === 'monday'

  // Find the start of the week containing gridDate
  const dow = gridDate.getDay() // 0=Sun
  let offsetToStart
  if (isMonday) {
    offsetToStart = dow === 0 ? 6 : dow - 1
  } else {
    offsetToStart = dow
  }
  const weekStart_date = new Date(gridDate)
  weekStart_date.setDate(gridDate.getDate() - offsetToStart)
  weekStart_date.setHours(0, 0, 0, 0)

  let startDate
  let totalDays

  if (viewMode.value === 'focus-today') {
    // Focus today: show today in center of 5 rows
    // Go back 2 weeks from today's week start
    startDate = new Date(weekStart_date)
    startDate.setDate(startDate.getDate() - 14)
    totalDays = 35
  } else {
    // Full week: go back 1 week from current week start
    startDate = new Date(weekStart_date)
    startDate.setDate(startDate.getDate() - 7)
    totalDays = 35
  }

  const result = []
  for (let i = 0; i < totalDays; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)

    const year = date.getFullYear()
    const month = date.getMonth()
    const dayNumber = date.getDate()

    const isCurrentMonth = month === currentMonth.value && year === currentYear.value
    const dateStr = formatDate(date)
    const isToday =
      date.getDate() === realToday.getDate() &&
      date.getMonth() === realToday.getMonth() &&
      date.getFullYear() === realToday.getFullYear()

    // Weekend check depends on weekStart
    const dayOfWeek = date.getDay()
    let isWeekendDay
    if (isMonday) {
      isWeekendDay = dayOfWeek === 0 || dayOfWeek === 6
    } else {
      isWeekendDay = dayOfWeek === 0 || dayOfWeek === 6
    }

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
    const isMonday = weekStart.value === 'monday'
    const offsetToMonday = isMonday ? (dayOfWeek === 0 ? 6 : dayOfWeek - 1) : dayOfWeek
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
        originalDate, currentDateObj, todo.repeat_type, interval,
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
  return props.completedInstances.some(i => i.todo_id === todoId && i.date === dateStr)
}
function isInstanceDeleted(todoId, dateStr) {
  return props.deletedInstances.some(i => i.todo_id === todoId && i.date === dateStr)
}

// Navigation
const prevMonth = () => {
  if (import.meta.client) document.documentElement.style.setProperty('--direction', '-1')
  const d = new Date(currentDate.value)
  d.setMonth(d.getMonth() - 1)
  currentDate.value = d
}
const nextMonth = () => {
  if (import.meta.client) document.documentElement.style.setProperty('--direction', '1')
  const d = new Date(currentDate.value)
  d.setMonth(d.getMonth() + 1)
  currentDate.value = d
}
const goToToday = () => { currentDate.value = new Date() }

watch(currentDate, (newDate) => emit('fetch-calendar-data', newDate))

// Settings handlers
const changeAnimation = (v) => {
  animationType.value = v
  if (import.meta.client) localStorage.setItem('calendar_animation_type', v)
}
const changeTheme = (v) => {
  themeType.value = v
  if (import.meta.client) localStorage.setItem('calendar_theme_type', v)
  applyTheme(v)
}
const changeWeekStart = (v) => {
  weekStart.value = v
  if (import.meta.client) localStorage.setItem('calendar_week_start', v)
}
const changeViewMode = (v) => {
  viewMode.value = v
  if (import.meta.client) localStorage.setItem('calendar_view_mode', v)
}

const applyTheme = (theme) => {
  if (!import.meta.client) return
  const root = document.documentElement
  ALL_THEMES.forEach(t => { if (t.cls) root.classList.remove(t.cls) })
  root.classList.remove('dark-mode')
  const found = ALL_THEMES.find(t => t.key === theme)
  if (found && found.cls) {
    root.classList.add(found.cls)
    if (theme === 'midnight-blue') root.classList.add('dark-mode')
  }
}

// Todo popup
const openAddTodoPopup = (date) => {
  selectedDate.value = date
  showAddTodoPopup.value = true
  todoText.value = ''
  todoRepeat.value = 'none'
}
const closeAddTodoPopup = () => { showAddTodoPopup.value = false }

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
  }
}

// Delete dialog
const startDelete = () => {
  if (!selectedTodo.value || !selectedTodoDate.value) return
  const todo = props.todos.find(t => t.id === selectedTodo.value)
  if (!todo) return

  const isRepeating = todo.repeat_type && todo.repeat_type !== 'none'
  deleteTargetTodoId.value = selectedTodo.value
  deleteTargetDate.value = selectedTodoDate.value
  deleteAllInstances.value = false
  deleteShowOptions.value = isRepeating
  showTodoActions.value = false
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  if (!deleteTargetTodoId.value) return
  await emit('delete-todo', {
    todoId: deleteTargetTodoId.value,
    date: deleteTargetDate.value,
    allInstances: deleteAllInstances.value,
  })
  showDeleteDialog.value = false
}

const cancelDelete = () => {
  showDeleteDialog.value = false
}

// Todo actions
const openTodoActions = (todoId, todoDate, event) => {
  selectedTodo.value = todoId
  selectedTodoDate.value = todoDate
  showTodoActions.value = true
  if (import.meta.client && window.innerWidth <= 480) {
    todoActionsStyle.value = { position: 'fixed', bottom: '0', left: '0', width: '100%', display: 'flex' }
  } else {
    const target = event?.target || event?.currentTarget
    if (target) {
      const rect = target.getBoundingClientRect()
      todoActionsStyle.value = { position: 'absolute', top: `${rect.bottom}px`, left: `${rect.left}px`, display: 'block' }
    }
  }
}

const completeTodo = async () => {
  if (!selectedTodo.value || !selectedTodoDate.value) return
  await emit('complete-todo', { todoId: selectedTodo.value, date: selectedTodoDate.value, allInstances: false })
  showTodoActions.value = false
}

// Touch events
const handleTouchStart = (e) => {
  touchStartTime = Date.now()
  touchStartX = e.changedTouches[0].screenX
  touchStartY = e.changedTouches[0].screenY
}
const handleTouchEnd = (e) => {
  const dt = Date.now() - touchStartTime
  const dx = Math.abs(e.changedTouches[0].screenX - touchStartX)
  const dy = Math.abs(e.changedTouches[0].screenY - touchStartY)
  if (dt < 300 && dx < 10 && dy < 10) {
    const target = e.target.closest('.calendar-day')
    if (target) openAddTodoPopup(target.dataset.date)
  }
  if (dx > 100 && dy < 50) {
    if (e.changedTouches[0].screenX < touchStartX) nextMonth()
    else prevMonth()
  }
}

const closeActionsOnOutsideClick = (e) => {
  if (!e.target.closest('.todo-item') && !e.target.closest('.todo-actions')) {
    showTodoActions.value = false
  }
}

onMounted(() => {
  if (import.meta.client) {
    document.addEventListener('click', closeActionsOnOutsideClick)
    const el = document.querySelector('.calendar-grid')
    if (el) {
      el.addEventListener('touchstart', handleTouchStart)
      el.addEventListener('touchend', handleTouchEnd)
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
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  color: var(--text-primary);
  overflow: hidden;
}

/* ---- Delete dialog ---- */
.delete-dialog-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 16px 0;
}
.delete-icon {
  font-size: 48px;
  animation: delete-shake 0.5s ease;
}
@keyframes delete-shake {
  0%, 100% { transform: rotate(0); }
  25% { transform: rotate(-10deg); }
  75% { transform: rotate(10deg); }
}
.delete-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
}
.delete-desc {
  font-size: 14px;
  color: var(--text-secondary);
  text-align: center;
}
.delete-options {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

/* ---- FAB menu ---- */
.fab-menu {
  display: none;
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--button-primary-bg);
  color: var(--on-primary, #fff);
  font-size: 24px;
  border: none;
  box-shadow: var(--shadow-lg);
  cursor: pointer;
  z-index: 1000;
  transition: all 0.3s;
}
.fab-menu:hover {
  transform: scale(1.1);
  box-shadow: var(--shadow-xl);
}

/* ---- Drawer ---- */
.settings-drawer {
  display: none;
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  z-index: 2000;
  background: rgba(0,0,0,0.4);
  backdrop-filter: blur(4px);
  transition: opacity 0.3s;
}
.settings-drawer.open {
  opacity: 1;
  pointer-events: all;
}
.drawer-panel {
  position: absolute;
  right: 0; top: 0;
  width: 280px;
  height: 100%;
  background: var(--card-background);
  box-shadow: var(--shadow-xl);
  transform: translateX(100%);
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
}
.settings-drawer.open .drawer-panel {
  transform: translateX(0);
}
.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
}
.drawer-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
}
.drawer-close {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 4px 8px;
  border-radius: 6px;
}
.drawer-close:hover {
  background: var(--hover-color);
}
.drawer-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
}
.setting-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.setting-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .calendar-container {
    padding: 4px;
  }
  .fab-menu {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .settings-drawer {
    display: block;
    opacity: 0;
    pointer-events: none;
  }
}
</style>
