<template>
  <div class="todo-actions">
    <button @click.stop="$emit('complete')" class="action-btn complete-btn">
      <span class="action-icon">✓</span>
      <span>{{ completedText }}</span>
    </button>
    <button @click.stop="$emit('delete')" class="action-btn delete-btn">
      <span class="action-icon">✕</span>
      <span>删除</span>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  isCompleted: { type: Boolean, default: false },
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
  from { opacity: 0; transform: scale(0.9) translateY(-8px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.action-btn {
  padding: 12px 20px;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
  transition: background-color 0.15s, color 0.15s;
  width: 100%;
  box-sizing: border-box;
}

.action-icon {
  font-weight: bold;
  font-size: 14px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: background-color 0.15s;
}

/* ---- 完成：用主题主色 ---- */
.complete-btn {
  color: var(--primary-color);
}
.complete-btn .action-icon {
  background: var(--primary-light);
}
.complete-btn:hover {
  background: var(--primary-color);
  color: var(--on-primary);
}
.complete-btn:hover .action-icon {
  background: rgba(255,255,255,0.2);
}

/* ---- 删除：用 danger 色 ---- */
.delete-btn {
  color: var(--danger-color);
}
.delete-btn .action-icon {
  background: rgba(239,68,68,0.08);
}
.delete-btn:hover {
  background: var(--danger-color);
  color: #fff;
}
.delete-btn:hover .action-icon {
  background: rgba(255,255,255,0.2);
}

@media (max-width: 768px) {
  .todo-actions {
    width: 100%;
    position: fixed;
    bottom: 0; left: 0;
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
}
</style>
