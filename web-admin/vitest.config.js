import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  
  // 路径别名
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  
  // 测试配置
  test: {
    // 测试环境
    environment: 'jsdom',
    // 全局变量
    globals: true,
    // 测试文件匹配模式
    include: ['tests/**/*.{test,spec}.{js,ts}'],
    // 排除目录
    exclude: ['node_modules', 'dist'],
    // 覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        'src/main.js'
      ]
    },
    // 设置文件
    setupFiles: ['tests/setup.js']
  }
})
