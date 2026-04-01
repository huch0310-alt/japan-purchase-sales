<template>
  <div id="app">
    <ErrorBoundary @error="handleError">
      <router-view />
    </ErrorBoundary>
  </div>
</template>

<script setup>
import ErrorBoundary from './components/ErrorBoundary.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// 全局错误处理
const handleError = ({ error, instance, info }) => {
  // 可以在这里上报错误到监控系统
  console.error('Global error handler:', {
    error,
    componentName: instance?.$options?.name,
    info
  })
}
</script>

<style>
#app {
  font-family: 'PingFang SC', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--color-text-primary);
}
</style>
