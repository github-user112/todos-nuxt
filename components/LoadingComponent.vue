<template>
  <Transition name="loading-fade">
    <div class="loading-overlay" v-if="show">
      <div class="loading-container">
        <!-- 品牌化动画 -->
        <div class="brand-spinner">
          <div class="spinner-ring"></div>
          <div class="spinner-ring delay-1"></div>
          <div class="spinner-ring delay-2"></div>
          <div class="spinner-core">📅</div>
        </div>
        <div class="loading-text">{{ text || '日历加载中' }}</div>
        <div class="loading-dots">
          <span class="dot"></span>
          <span class="dot delay-1"></span>
          <span class="dot delay-2"></span>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
defineProps({
  show: { type: Boolean, required: true, default: false },
  text: { type: String, default: '日历加载中' },
})
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: var(--loading-overlay-bg, rgba(250,245,255,0.95));
  backdrop-filter: blur(12px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

/* ---- 品牌动画 ---- */
.brand-spinner {
  position: relative;
  width: 80px;
  height: 80px;
}

.spinner-core {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  font-size: 28px;
  animation: core-bounce 1.6s ease-in-out infinite;
  z-index: 2;
}

@keyframes core-bounce {
  0%, 100% { transform: translate(-50%, -50%) scale(0.9); }
  50% { transform: translate(-50%, -50%) scale(1.1); }
}

.spinner-ring {
  position: absolute;
  top: 0; left: 0;
  width: 80px; height: 80px;
  border-radius: 50%;
  border: 3px solid transparent;
  border-top-color: var(--primary-color, #7c3aed);
  animation: ring-spin 1.2s linear infinite;
}

.spinner-ring.delay-1 {
  width: 64px; height: 64px;
  top: 8px; left: 8px;
  border-top-color: var(--accent-color, #a78bfa);
  animation-duration: 1.6s;
  animation-direction: reverse;
}

.spinner-ring.delay-2 {
  width: 48px; height: 48px;
  top: 16px; left: 16px;
  border-top-color: var(--primary-light, #ede9fe);
  animation-duration: 2s;
}

@keyframes ring-spin {
  to { transform: rotate(360deg); }
}

/* ---- 文字 + 点 ---- */
.loading-text {
  font-size: 15px;
  color: var(--loading-text, #1e1b4b);
  font-weight: 600;
  letter-spacing: 3px;
}

.loading-dots {
  display: flex;
  gap: 6px;
}

.dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--primary-color, #7c3aed);
  animation: dot-pulse 1.4s ease-in-out infinite;
}
.dot.delay-1 { animation-delay: 0.2s; }
.dot.delay-2 { animation-delay: 0.4s; }

@keyframes dot-pulse {
  0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
  40% { opacity: 1; transform: scale(1.2); }
}

.loading-fade-enter-active,
.loading-fade-leave-active {
  transition: opacity 0.4s ease;
}
.loading-fade-enter-from,
.loading-fade-leave-to {
  opacity: 0;
}
</style>
