<template>
  <NModal
    :show="show"
    preset="card"
    title="登录"
    :style="{ width: '90%', maxWidth: '360px' }"
    :mask-closable="true"
    :close-on-esc="false"
    transform-origin="center"
  >
    <div class="login-body">
      <NInput
        v-model:value="password"
        type="password"
        placeholder="请输入密码"
        show-password-on="click"
        size="large"
        @keyup.enter="handleLogin"
      />
      <NText type="error" v-if="error" class="login-error">{{ error }}</NText>
    </div>

    <template #footer>
      <NSpace justify="end">
        <NButton type="primary" size="large" block @click="handleLogin" :loading="loading">
          登录
        </NButton>
      </NSpace>
    </template>
  </NModal>
</template>

<script setup>
import { ref } from 'vue'
import {
  NModal,
  NInput,
  NButton,
  NSpace,
  NText,
  useMessage,
} from 'naive-ui'

const props = defineProps({
  show: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['login-success'])
const message = useMessage()

const password = ref('')
const error = ref('')
const loading = ref(false)

const handleLogin = async () => {
  if (!password.value) {
    error.value = '请输入密码'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const result = await $fetch('/api/login', {
      method: 'POST',
      body: { password: password.value },
    })
    if (result.success) {
      message.success('登录成功')
      emit('login-success', { token: result.token, userId: result.userId })
    } else {
      error.value = '密码错误，请重试'
    }
  } catch (err) {
    error.value = '登录失败，请重试'
    console.error('登录失败:', err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.login-error {
  text-align: center;
  font-size: 13px;
}
</style>
