<template>
  <div class="app-container">
    <LoadingComponent :show="loading" />
    <NuxtPage />
  </div>
</template>

<script setup>
import { useLoading } from '~/composables/useLoading'
import { onMounted } from 'vue'

const { loading } = useLoading()

const THEME_MAP = {
  'default': '',
  'deep-dawn': 'theme-deep-dawn',
  'twilight-rose': 'theme-twilight-rose',
  'amber-night': 'theme-amber-night',
  'coral-sand': 'theme-coral-sand',
  'azure-flame': 'theme-azure-flame',
  'sunset-bay': 'theme-sunset-bay',
  'emerald-gold': 'theme-emerald-gold',
  'violet-spring': 'theme-violet-spring',
  'royal-gold': 'theme-royal-gold',
  'midnight-blue': 'theme-midnight-blue',
}

onMounted(() => {
  if (import.meta.client) {
    const savedTheme = localStorage.getItem('calendar_theme_type')
    if (savedTheme && savedTheme !== 'default') {
      const cls = THEME_MAP[savedTheme]
      if (cls) {
        document.documentElement.classList.add(cls)
        if (savedTheme === 'midnight-blue') {
          document.documentElement.classList.add('dark-mode')
        }
      }
    }
  }
})
</script>

<style>
body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}
</style>
