<template>
  <div class="app-container">
    <LoadingComponent :show="loading" />
    <NuxtPage />
  </div>
</template>

<script setup>
import { useLoading } from '~/composables/useLoading'

const { loading } = useLoading()
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
