<template>
  <Transition name="loading-fade">
    <div class="loading-overlay" v-if="show">
      <div class="loading-container">
        <div class="pulse-ring">
          <div class="pulse-core"></div>
        </div>
        <div class="loading-text">{{ text || '加载中...' }}</div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    required: true,
    default: false,
  },
  text: {
    type: String,
    default: '加载中...',
  },
});
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--loading-overlay-bg);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.pulse-ring {
  position: relative;
  width: 64px;
  height: 64px;
}

.pulse-core {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--primary-color);
  animation: pulse-core 1.5s ease-in-out infinite;
}

.pulse-ring::before,
.pulse-ring::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  border: 2px solid var(--primary-color);
  animation: pulse-ring 1.5s ease-out infinite;
}

.pulse-ring::after {
  animation-delay: 0.5s;
}

@keyframes pulse-core {
  0%, 100% {
    transform: scale(0.85);
    opacity: 1;
  }
  50% {
    transform: scale(1);
    opacity: 0.7;
  }
}

@keyframes pulse-ring {
  0% {
    width: 64px;
    height: 64px;
    opacity: 0.6;
  }
  100% {
    width: 120px;
    height: 120px;
    opacity: 0;
  }
}

.loading-text {
  font-size: 16px;
  color: var(--loading-text);
  font-weight: 500;
  letter-spacing: 2px;
  animation: text-fade 1.5s ease-in-out infinite;
}

@keyframes text-fade {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

.loading-fade-enter-active,
.loading-fade-leave-active {
  transition: opacity 0.3s ease;
}
.loading-fade-enter-from,
.loading-fade-leave-to {
  opacity: 0;
}
</style>
