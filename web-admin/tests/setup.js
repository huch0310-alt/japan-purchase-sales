/**
 * Vitest 测试设置文件
 */

import { config } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { vi } from 'vitest'

// 模拟 Element Plus
vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn()
  },
  ElMessageBox: {
    confirm: vi.fn(),
    alert: vi.fn()
  }
}))

// 创建 i18n 实例
const i18n = createI18n({
  legacy: false,
  locale: 'zh',
  messages: {
    zh: {
      common: {
        confirm: '确认',
        cancel: '取消'
      }
    }
  }
})

// 全局配置
config.global.plugins = [i18n]

// 全局 mock
config.global.mocks = {
  $t: (key) => key
}
