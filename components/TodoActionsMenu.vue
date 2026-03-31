<template>
  <div class="todo-actions">
    <button @click="$emit('complete')" class="action-btn complete-button">
      <span class="action-icon">✓</span>
      <span>{{ completedText }}</span>
    </button>
    <button @click="$emit('delete')" class="action-btn delete-button">
      <span class="action-icon">✕</span>
      <span>删除</span>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  isCompleted: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['complete', 'delete'])

const completedText = computed(() => props.isCompleted ? '撤销完成' : '完成')
</script>

<style scoped>
.todo-actions {
  position: absolute;
  background: var(--card-background);
  border-radius: 12px;
  box-shadow: var(--shadow-xl);
  z-index: 100;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--border-color);
  min-width: 140px;
  animation: actions-in 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes actions-in {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.action-btn {
  padding: 12px 20px;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
}

.action-btn:hover {
  padding-left: 24px;
}

.action-btn:active {
  transform: scale(0.97);
}

.action-icon {
  font-weight: bold;
  font-size: 16px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s;
}

.complete-button {
  color: var(--success-color);
}
.complete-button:hover {
  background: var(--calendar-day-hover-bg);
}
.complete-button .action-icon {
  background: rgba(16, 185, 129, 0.1);
}
.complete-button:hover .action-icon {
  background: rgba(16, 185, 129, 0.2);
  transform: scale(1.1);
}

.delete-button {
  color: var(--danger-color);
}
.delete-button:hover {
  background: var(--calendar-day-holiday-rest-bg);
}
.delete-button .action-icon {
  background: rgba(239, 68, 68, 0.1);
}
.delete-button:hover .action-icon {
  background: rgba(239, 68, 68, 0.2);
  transform: scale(1.1);
}

@media (max-width: 768px) {
  .todo-actions {
    width: 100%;
    position: fixed;
    bottom: 0;
    left: 0;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    border-radius: 16px 16px 0 0;
    border-bottom: none;
    min-width: auto;
  }
  .action-btn {
    flex: 1;
    justify-content: center;
    padding: 18px;
    font-size: 15px;
  }
  .action-btn:hover {
    padding-left: 20px;
  }
}
</style>
