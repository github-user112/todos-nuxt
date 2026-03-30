<template>
  <ClientOnly>
    <NDialogProvider>
      <NMessageProvider>
        <CalendarContainer
          :todos="todos"
          :completedInstances="completedInstances"
          :deletedInstances="deletedInstances"
          :lunarData="lunarData"
          :holidayData="holidayData"
          :userId="userId"
          @fetch-calendar-data="fetchCalendarData"
          @fetch-holiday-data="fetchHolidayData"
          @add-todo="handleAddTodo"
          @complete-todo="handleCompleteTodo"
          @delete-todo="handleDeleteTodo"
        />
      </NMessageProvider>
    </NDialogProvider>
    <template #fallback>
      <div class="loading-placeholder">加载中...</div>
    </template>
  </ClientOnly>
</template>

<script setup>
import { ref, onMounted, provide } from 'vue'
import { NDialogProvider, NMessageProvider } from 'naive-ui'
import { formatDate } from '~/composables/dateUtils'
import { generateHash } from '~/composables/hashUtils'
import { useLoading } from '~/composables/useLoading'

const { setLoading } = useLoading()

const userId = ref(null)
const todos = ref([])
const completedInstances = ref([])
const deletedInstances = ref([])
const lunarData = ref({})
const holidayData = ref({})

provide('holidayData', holidayData)

// 初始化用户 ID
const initializeUserId = () => {
  if (!import.meta.client) return

  // 从 URL query 或 hash 中获取用户 ID
  const urlParams = new URLSearchParams(window.location.search)
  let uid = urlParams.get('uid')

  if (!uid) {
    uid = generateHash()
    // 更新 URL 但不刷新页面
    const newUrl = `${window.location.pathname}?uid=${uid}${window.location.hash}`
    window.history.replaceState(null, '', newUrl)
  }

  userId.value = uid
  initCalendar()
}

// 获取节假日数据
const fetchHolidayData = async (currentYear) => {
  try {
    if (!import.meta.client) return
    const calendar = new window.HolidayCalendar()
    if (!calendar) return

    const ps = [
      calendar.getDates('CN', currentYear - 1),
      calendar.getDates('CN', currentYear),
    ]
    if (currentYear < new Date().getFullYear()) {
      ps.push(calendar.getDates('CN', currentYear + 1))
    }
    const cnDates = await Promise.all(ps)

    const holidayMap = {}
    cnDates.flat().forEach((item) => {
      holidayMap[item.date] = {
        name: item.name_cn,
        type: item.type,
      }
    })
    holidayData.value = { ...holidayData.value, ...holidayMap }
  } catch (error) {
    console.error('获取节假日数据失败:', error)
  }
}

// 初始化
const initCalendar = async () => {
  try {
    const currentDate = new Date()
    setLoading(true)
    await Promise.allSettled([
      fetchHolidayData(currentDate.getFullYear()),
      fetchCalendarData(currentDate),
    ])
    setLoading(false)
  } catch (error) {
    console.error('初始化日历失败:', error)
    alert('加载日历数据失败，请刷新页面重试')
  }
}

// 获取日历数据
const fetchCalendarData = async (currentDateObj) => {
  const year = currentDateObj.getFullYear()
  const month = currentDateObj.getMonth()

  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month + 2, 0)

  const startDate = formatDate(firstDay)
  const endDate = formatDate(lastDay)

  try {
    const result = await $fetch(
      `/api/todos?uid=${userId.value}&startDate=${startDate}&endDate=${endDate}`
    )
    todos.value = result.todos || []
    completedInstances.value = result.completedInstances || []
    deletedInstances.value = result.deletedInstances || []
    return result
  } catch (error) {
    console.error('获取日历数据失败:', error)
    throw error
  }
}

// 添加待办事项
const handleAddTodo = async (todoData) => {
  try {
    const result = await $fetch('/api/todos', {
      method: 'POST',
      query: { uid: userId.value },
      body: {
        text: todoData.text,
        date: todoData.date,
        repeatType: todoData.repeatType,
        repeatInterval: todoData.repeatInterval || 1,
        endDate: todoData.endDate || '2039-12-31',
      },
    })

    if (result.success) {
      todos.value.push(result.todo)
      return true
    }
    return false
  } catch (error) {
    console.error('保存待办事项失败:', error)
    return false
  }
}

// 完成待办事项
const handleCompleteTodo = async ({ todoId, date: todoDate, allInstances }) => {
  try {
    const todo = todos.value.find((t) => t.id == todoId)
    if (!todo) return false

    if ((!todo.repeat_type || todo.repeat_type === 'none') && todo.date === todoDate) {
      const result = await $fetch('/api/todos', {
        method: 'PUT',
        query: { uid: userId.value },
        body: { id: todoId, completed: !todo.completed },
      })
      if (result.success) {
        todo.completed = !todo.completed
        return true
      }
    } else {
      if (allInstances) {
        const result = await $fetch('/api/todos', {
          method: 'PUT',
          query: { uid: userId.value },
          body: {
            id: todoId,
            completed: !todo.completed,
            endDate: todo.end_date || '2039-12-31',
          },
        })
        if (result.success) {
          todo.completed = !todo.completed
          return true
        }
      } else {
        const result = await $fetch('/api/completed-instances', {
          method: 'POST',
          query: { uid: userId.value },
          body: { todoId, date: todoDate },
        })
        if (result.success) {
          if (result.completed) {
            completedInstances.value.push({
              todo_id: parseInt(todoId),
              date: todoDate,
              user_id: userId.value,
            })
          } else {
            const index = completedInstances.value.findIndex(
              (instance) => instance.todo_id == todoId && instance.date === todoDate
            )
            if (index >= 0) completedInstances.value.splice(index, 1)
          }
          return true
        }
      }
    }
    return false
  } catch (error) {
    console.error('更新待办事项状态失败:', error)
    return false
  }
}

// 删除待办事项
const handleDeleteTodo = async ({ todoId, date: todoDate, allInstances }) => {
  try {
    const todo = todos.value.find((t) => t.id == todoId)
    if (!todo) return false

    if ((!todo.repeat_type || todo.repeat_type === 'none') && todo.date === todoDate) {
      const result = await $fetch(`/api/todos?id=${todoId}`, {
        method: 'DELETE',
        query: { uid: userId.value },
      })
      if (result.success) {
        todos.value = todos.value.filter((t) => t.id != todoId)
      }
    } else {
      if (allInstances) {
        const result = await $fetch(`/api/todos?id=${todoId}`, {
          method: 'DELETE',
          query: { uid: userId.value },
        })
        if (result.success) {
          todos.value = todos.value.filter((t) => t.id != todoId)
        }
      } else {
        const result = await $fetch('/api/deleted-instances', {
          method: 'POST',
          query: { uid: userId.value },
          body: { todoId, date: todoDate },
        })
        if (result.success) {
          deletedInstances.value.push({
            todo_id: parseInt(todoId),
            date: todoDate,
            user_id: userId.value,
          })
        }
      }
    }
    return true
  } catch (error) {
    console.error('删除待办事项失败:', error)
    return false
  }
}

// 监听 hash 变化
if (import.meta.client) {
  window.addEventListener('hashchange', () => {
    const urlParams = new URLSearchParams(window.location.search)
    const newUid = urlParams.get('uid')
    if (newUid && newUid !== userId.value) {
      userId.value = newUid
      initCalendar()
    }
  })
}

onMounted(() => {
  initializeUserId()
})
</script>

<style scoped>
.loading-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 18px;
  color: #666;
}
</style>
