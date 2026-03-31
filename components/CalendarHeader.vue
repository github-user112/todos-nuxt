<template>
  <div class="calendar-header">
    <div class="header-left">
      <button class="nav-btn" @click="$emit('prevMonth')">◀</button>
      <h2 class="calendar-title">{{ currentYear }}年{{ currentMonth + 1 }}月</h2>
      <button class="nav-btn" @click="$emit('nextMonth')">▶</button>
      <button class="today-btn" @click="$emit('goToToday')">今天</button>
    </div>

    <div class="header-right">
      <button class="share-btn" @click="copyUrlToClipboard">📤 分享</button>

      <div class="selector-group desktop-only">
        <NSelect
          :value="themeType"
          :options="themeOptions"
          size="small"
          :style="{ width: '130px' }"
          @update:value="$emit('changeTheme', $event)"
        />
      </div>

      <div class="selector-group desktop-only">
        <NSelect
          :value="animationType"
          :options="animationOptions"
          size="small"
          :style="{ width: '130px' }"
          @update:value="$emit('changeAnimation', $event)"
        />
      </div>

      <div class="selector-group desktop-only">
        <NSelect
          :value="weekStart"
          :options="weekStartOptions"
          size="small"
          :style="{ width: '90px' }"
          @update:value="$emit('changeWeekStart', $event)"
        />
      </div>

      <div class="selector-group desktop-only">
        <NSelect
          :value="viewMode"
          :options="viewModeOptions"
          size="small"
          :style="{ width: '120px' }"
          @update:value="$emit('changeViewMode', $event)"
        />
      </div>

      <a href="mailto:gonesc@foxmail.com" class="contact-link desktop-only" title="联系我">✉️</a>
    </div>
  </div>
</template>

<script setup>
import { NSelect, useMessage } from 'naive-ui'

defineProps({
  currentYear: { type: Number, required: true },
  currentMonth: { type: Number, required: true },
  animationType: { type: String, required: true },
  themeType: { type: String, required: true },
  weekStart: { type: String, required: true },
  viewMode: { type: String, required: true },
  themeOptions: { type: Array, default: () => [] },
  animationOptions: { type: Array, default: () => [] },
  weekStartOptions: { type: Array, default: () => [] },
  viewModeOptions: { type: Array, default: () => [] },
})

defineEmits(['prevMonth', 'nextMonth', 'goToToday', 'changeAnimation', 'changeTheme', 'changeWeekStart', 'changeViewMode'])

const message = useMessage()

const copyUrlToClipboard = () => {
  if (import.meta.client) {
    navigator.clipboard.writeText(window.location.href).then(() => {
      message.success('链接已复制到剪贴板')
    }).catch(console.error)
  }
}
</script>

<style scoped>
.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  margin-bottom: 12px;
  background: var(--card-background);
  border-radius: 16px;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-color);
  transition: box-shadow 0.3s;
}
.calendar-header:hover {
  box-shadow: var(--shadow-lg);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.calendar-title {
  margin: 0;
  font-size: 1.4rem;
  color: var(--text-primary);
  font-weight: 700;
  letter-spacing: 0.5px;
  min-width: 160px;
  text-align: center;
}

/* ---- 按钮统一用主题变量 ---- */
.nav-btn {
  width: 36px;
  height: 36px;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: var(--card-background);
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.15s, color 0.15s, border-color 0.15s;
}
.nav-btn:hover {
  background: var(--hover-color);
  color: var(--primary-color);
  border-color: var(--primary-color);
}

.today-btn {
  padding: 6px 16px;
  border: none;
  border-radius: 10px;
  background: var(--primary-color);
  color: var(--on-primary);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s;
  letter-spacing: 1px;
}
.today-btn:hover {
  background: var(--primary-dark);
}

.share-btn {
  padding: 6px 14px;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: var(--card-background);
  color: var(--accent-color);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.15s, border-color 0.15s;
}
.share-btn:hover {
  background: var(--primary-light);
  border-color: var(--accent-color);
}

.selector-group {
  display: flex;
  align-items: center;
}

.contact-link {
  font-size: 18px;
  text-decoration: none;
  padding: 6px 8px;
  border-radius: 8px;
  transition: background-color 0.15s;
  line-height: 1;
}
.contact-link:hover {
  background: var(--hover-color);
}

@media (max-width: 768px) {
  .calendar-header {
    padding: 8px 12px;
    border-radius: 12px;
    flex-wrap: wrap;
    gap: 8px;
  }
  .header-left { flex: 1; justify-content: center; gap: 4px; }
  .header-right { flex: 1; justify-content: center; gap: 6px; }
  .calendar-title { font-size: 1.1rem; min-width: auto; white-space: nowrap; }
  .desktop-only { display: none; }
}
</style>
