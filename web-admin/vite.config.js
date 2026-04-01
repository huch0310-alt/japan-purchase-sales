import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  base: '/',
  
  // 路径别名
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  
  // 开发服务器配置
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },
  
  // 构建优化配置
  build: {
    // 代码分割
    rollupOptions: {
      output: {
        // 手动分割代码块
        manualChunks: {
          // Vue 核心
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          // Element Plus UI库
          'element-plus': ['element-plus', '@element-plus/icons-vue'],
          // ECharts 图表库
          'echarts': ['echarts'],
          // 工具库
          'utils': ['dayjs', 'axios']
        },
        // 文件命名
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    },
    // 代码块大小警告阈值
    chunkSizeWarningLimit: 1000,
    // 启用压缩（使用esbuild，Vite默认）
    minify: 'esbuild',
    // CSS代码分割
    cssCodeSplit: true,
    // 启用sourcemap（生产环境可关闭）
    sourcemap: false
  },
  
  // CSS配置
  css: {
    // CSS预处理器
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/assets/styles/variables.scss" as *;`
      }
    }
  },
  
  // 优化依赖预构建
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'pinia',
      'axios',
      'element-plus',
      '@element-plus/icons-vue',
      'echarts',
      'dayjs'
    ]
  }
})
