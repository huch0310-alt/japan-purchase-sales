<template>
  <slot v-if="!error" />
  <div
    v-else
    class="error-boundary"
  >
    <div class="error-content">
      <el-icon
        class="error-icon"
        :size="64"
      >
        <WarningFilled />
      </el-icon>
      <h2 class="error-title">
        {{ t('error.title') }}
      </h2>
      <p class="error-message">
        {{ error.message || t('error.defaultMessage') }}
      </p>
      <div class="error-actions">
        <el-button
          type="primary"
          @click="resetError"
        >
          {{ t('error.retry') }}
        </el-button>
        <el-button @click="goHome">
          {{ t('error.goHome') }}
        </el-button>
      </div>
      <el-collapse
        v-if="showDetails"
        class="error-details"
      >
        <el-collapse-item
          :title="t('error.details')"
          name="details"
        >
          <pre>{{ error.stack }}</pre>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>

<script setup>
import { ref, onErrorCaptured } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { WarningFilled } from '@element-plus/icons-vue'

const props = defineProps({
  showDetails: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['error'])

const router = useRouter()
const { t } = useI18n()

const error = ref(null)

// 捕获子组件错误
onErrorCaptured((err, instance, info) => {
  error.value = err
  
  // 记录错误日志
  console.error('ErrorBoundary captured error:', {
    error: err,
    component: instance?.$options?.name || 'Unknown',
    info
  })
  
  // 触发错误事件
  emit('error', { error: err, instance, info })
  
  // 返回 false 阻止错误继续向上传播
  return false
})

// 重置错误状态
const resetError = () => {
  error.value = null
}

// 返回首页
const goHome = () => {
  error.value = null
  router.push('/dashboard')
}

// 暴露方法供外部调用
defineExpose({
  resetError
})
</script>

<style scoped>
.error-boundary {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 40px 20px;
}

.error-content {
  text-align: center;
  max-width: 500px;
}

.error-icon {
  color: #f56c6c;
  margin-bottom: 20px;
}

.error-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 12px;
}

.error-message {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0 0 24px;
  line-height: 1.6;
}

.error-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 20px;
}

.error-details {
  text-align: left;
  margin-top: 20px;
}

.error-details pre {
  background: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
  font-size: 12px;
  overflow-x: auto;
  max-height: 200px;
  margin: 0;
}
</style>
