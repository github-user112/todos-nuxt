<template>
  <div class="calendar-header">
    <div class="header-left">
      <NButton quaternary circle size="large" @click="$emit('prevMonth')">
        <template #icon><span>◀</span></template>
      </NButton>
      <h2 class="calendar-title">{{ currentYear }}年{{ currentMonth + 1 }}月</h2>
      <NButton quaternary circle size="large" @click="$emit('nextMonth')">
        <template #icon><span>▶</span></template>
      </NButton>
      <NButton type="primary" size="small" @click="$emit('goToToday')" class="today-btn">
        今天
      </NButton>
    </div>

    <div class="header-right">
      <NButton type="success" size="small" @click="copyUrlToClipboard" class="share-btn">
        📤 分享
      </NButton>

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
import { NButton, NSelect, useMessage } from 'naive-ui'

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
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
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
.today-btn { font-weight: 600; letter-spacing: 1px; }
.share-btn { font-weight: 500; }
.selector-group { display: flex; align-items: center; }
.contact-link {
  font-size: 18px;
  text-decoration: none;
  padding: 6px 8px;
  border-radius: 8px;
  transition: all 0.2s;
  line-height: 1;
}
.contact-link:hover {
  background: var(--hover-color);
  transform: scale(1.1);
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
