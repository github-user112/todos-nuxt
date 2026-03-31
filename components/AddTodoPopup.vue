<template>
  <NModal
    :show="show"
    preset="card"
    title="添加待办事项"
    :style="{ width: '90%', maxWidth: '480px' }"
    :mask-closable="true"
    :close-on-esc="true"
    transform-origin="center"
    @update:show="$emit('close')"
  >
    <div class="popup-body">
      <NInput
        :value="todoText"
        @update:value="$emit('update:todoText', $event)"
        placeholder="请输入待办事项"
        type="text"
        clearable
        size="large"
      />

      <!-- 重复类型选择 -->
      <div class="repeat-section">
        <NText strong class="section-label">重复设置</NText>

        <NRadioGroup
          :value="todoRepeat"
          @update:value="updateRepeatType"
          class="repeat-group"
        >
          <NSpace vertical :size="8">
            <NRadio value="none">不重复</NRadio>

            <div class="repeat-row">
              <NRadio value="daily" />
              <span>每</span>
              <NInputNumber
                :value="intervals.daily"
                @update:value="val => intervals.daily = val"
                :disabled="todoRepeat !== 'daily'"
                :min="1"
                :max="365"
                size="small"
                class="interval-input"
                @blur="validateInterval('daily')"
              />
              <span>天</span>
              <NText depth="3" class="hint" v-if="todoRepeat === 'daily'">(1-365天)</NText>
            </div>

            <div class="repeat-row">
              <NRadio value="weekly" />
              <span>每</span>
              <NInputNumber
                :value="intervals.weekly"
                @update:value="val => intervals.weekly = val"
                :disabled="todoRepeat !== 'weekly'"
                :min="1"
                :max="52"
                size="small"
                class="interval-input"
                @blur="validateInterval('weekly')"
              />
              <span>周</span>
              <NText depth="3" class="hint" v-if="todoRepeat === 'weekly'">(1-52周)</NText>
            </div>

            <div class="repeat-row">
              <NRadio value="monthly" />
              <span>每</span>
              <NInputNumber
                :value="intervals.monthly"
                @update:value="val => intervals.monthly = val"
                :disabled="todoRepeat !== 'monthly'"
                :min="1"
                :max="12"
                size="small"
                class="interval-input"
                @blur="validateInterval('monthly')"
              />
              <span>个月</span>
              <NText depth="3" class="hint" v-if="todoRepeat === 'monthly'">(1-12个月)</NText>
            </div>

            <div class="repeat-row">
              <NRadio value="yearly" />
              <span>每</span>
              <NInputNumber
                :value="intervals.yearly"
                @update:value="val => intervals.yearly = val"
                :disabled="todoRepeat !== 'yearly'"
                :min="1"
                :max="10"
                size="small"
                class="interval-input"
                @blur="validateInterval('yearly')"
              />
              <span>年</span>
              <NText depth="3" class="hint" v-if="todoRepeat === 'yearly'">(1-10年)</NText>
            </div>
          </NSpace>
        </NRadioGroup>

        <!-- 重复次数选项 -->
        <div class="extra-option" v-if="todoRepeat !== 'none'">
          <div class="option-row">
            <NText>重复次数:</NText>
            <NInputNumber
              :value="repeatCount"
              @update:value="val => { repeatCount = val; calculateEndDate() }"
              :min="1"
              size="small"
              class="extra-input"
            />
            <NText depth="3" class="hint">(可选，输入后自动计算结束日期)</NText>
          </div>
        </div>

        <!-- 结束日期选项 -->
        <div class="extra-option" v-if="todoRepeat !== 'none'">
          <div class="option-row">
            <NText>结束日期:</NText>
            <NDatePicker
              :value="endDate ? new Date(endDate).getTime() : null"
              @update:value="handleEndDateChange"
              type="date"
              size="small"
              class="extra-input"
              clearable
            />
            <NText depth="3" class="hint">(可选)</NText>
          </div>
        </div>
      </div>

      <!-- 重复预览 -->
      <div class="preview-container" v-if="todoRepeat !== 'none'">
        <NButton
          quaternary
          size="small"
          @click="togglePreview"
          block
          type="info"
        >
          {{ showPreview ? '隐藏预览' : '显示预览' }}
        </NButton>

        <RepeatPreview
          :showPreview="showPreview"
          :baseDate="selectedDate"
          :repeatType="todoRepeat"
          :repeatInterval="currentInterval"
          :endDate="endDate"
          @close="showPreview = false"
        />
      </div>
    </div>

    <template #footer>
      <NSpace justify="end">
        <NButton @click="$emit('close')">取消</NButton>
        <NButton type="primary" @click="handleSave">保存</NButton>
      </NSpace>
    </template>
  </NModal>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  NModal,
  NCard,
  NInput,
  NInputNumber,
  NRadio,
  NRadioGroup,
  NButton,
  NSpace,
  NText,
  NDatePicker,
  useMessage,
} from 'naive-ui'
import RepeatPreview from './RepeatPreview.vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: true,
  },
  todoText: {
    type: String,
    required: true,
  },
  todoRepeat: {
    type: String,
    required: true,
  },
  selectedDate: {
    type: Date,
    default: () => new Date(),
  },
})

const emit = defineEmits([
  'update:todoText',
  'update:todoRepeat',
  'save',
  'close',
])

const message = useMessage()

// 各类型的间隔值
const intervals = ref({
  daily: 1,
  weekly: 1,
  monthly: 1,
  yearly: 1,
})

// 结束日期
const endDate = ref('')

// 重复次数
const repeatCount = ref(null)

// 预览显示状态
const showPreview = ref(false)

// 间隔限制配置
const INTERVAL_LIMITS = {
  daily: { min: 1, max: 365, unit: '天' },
  weekly: { min: 1, max: 52, unit: '周' },
  monthly: { min: 1, max: 12, unit: '个月' },
  yearly: { min: 1, max: 10, unit: '年' },
}

// 计算当前活跃的间隔值
const currentInterval = computed(() => {
  return props.todoRepeat === 'none' ? 1 : intervals.value[props.todoRepeat]
})

// 切换预览显示
const togglePreview = () => {
  showPreview.value = !showPreview.value
}

// 更新重复类型
const updateRepeatType = (type) => {
  emit('update:todoRepeat', type)
  showPreview.value = false
  repeatCount.value = null
}

// 处理结束日期变化
const handleEndDateChange = (timestamp) => {
  if (timestamp) {
    const date = new Date(timestamp)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    endDate.value = `${year}-${month}-${day}`
  } else {
    endDate.value = ''
  }
  repeatCount.value = null
}

// 验证间隔值
const validateInterval = (type) => {
  const limit = INTERVAL_LIMITS[type]
  const currentValue = intervals.value[type]

  if (currentValue < limit.min) {
    intervals.value[type] = limit.min
  } else if (currentValue > limit.max) {
    intervals.value[type] = limit.max
  }
}

// 根据重复次数计算结束日期
const calculateEndDate = () => {
  if (!repeatCount.value || repeatCount.value <= 0) {
    return
  }

  const startDate = new Date(props.selectedDate)
  const interval = currentInterval.value
  const repeatType = props.todoRepeat

  const calculatedEndDate = new Date(startDate)
  const effectiveCount = repeatCount.value - 1

  switch (repeatType) {
    case 'daily':
      calculatedEndDate.setDate(startDate.getDate() + (interval * effectiveCount))
      break
    case 'weekly':
      calculatedEndDate.setDate(startDate.getDate() + (interval * effectiveCount * 7))
      break
    case 'monthly':
      calculatedEndDate.setMonth(startDate.getMonth() + (interval * effectiveCount))
      break
    case 'yearly':
      calculatedEndDate.setFullYear(startDate.getFullYear() + (interval * effectiveCount))
      break
    default:
      return
  }

  const year = calculatedEndDate.getFullYear()
  const month = String(calculatedEndDate.getMonth() + 1).padStart(2, '0')
  const day = String(calculatedEndDate.getDate()).padStart(2, '0')
  endDate.value = `${year}-${month}-${day}`
}

// 处理保存
const handleSave = () => {
  if (!props.todoText || !props.todoText.trim()) {
    message.warning('请输入待办事项名称')
    return
  }

  if (props.todoRepeat !== 'none') {
    validateInterval(props.todoRepeat)
  }

  emit('save', {
    repeatType: props.todoRepeat,
    repeatInterval: currentInterval.value,
    endDate: endDate.value || undefined,
    repeatCount: repeatCount.value || undefined,
  })
}
</script>

<style scoped>
.popup-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.repeat-section {
  padding: 16px;
  background: var(--n-color-embedded, #fafafa);
  border-radius: 8px;
}

.section-label {
  display: block;
  margin-bottom: 12px;
  font-size: 14px;
}

.repeat-group {
  width: 100%;
}

.repeat-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.interval-input {
  width: 80px;
}

.hint {
  font-size: 12px;
  font-style: italic;
}

.extra-option {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--n-border-color, #e0e0e6);
}

.option-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.extra-input {
  width: 140px;
}

.preview-container {
  margin-top: 4px;
}

@media (max-width: 768px) {
  .option-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .extra-input {
    width: 100%;
  }
}
</style>
