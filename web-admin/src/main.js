import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import router from './router'
import App from './App.vue'
import { socketService } from './services/socket'
import zh from './locales/zh'
import ja from './locales/ja'
import en from './locales/en'
import { useLanguageStore } from './store/language'
import api from './api'

// 全局样式
import './assets/styles/main.css'

// 创建 i18n 实例
const savedLocale = localStorage.getItem('language') || 'zh'
const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: 'zh',
  messages: { zh, ja, en }
})

const app = createApp(App)

// 注册所有Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(createPinia())
app.use(i18n)
app.use(router)
app.use(ElementPlus)

// 初始化 CSRF token（只需在首次加载时调用一次）
api.get('/security/csrf').catch(() => {
  // 这里不弹错误，避免首屏加载被打断；后续写操作若无 token 会收到 403
})

// 初始化WebSocket连接
const token = localStorage.getItem('token')
if (token) {
  socketService.connect()
}

// 路由守卫：登录时连接WebSocket，退出时断开
router.beforeEach((to, from, next) => {
  if (to.path === '/login') {
    socketService.disconnect()
  } else if (!socketService.getConnectionStatus()) {
    const token = localStorage.getItem('token')
    if (token) {
      socketService.connect()
    }
  }
  next()
})

app.mount('#app')
