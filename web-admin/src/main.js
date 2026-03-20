import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import router from './router'
import App from './App.vue'
import { socketService } from './services/socket'

// 全局样式
import './assets/styles/main.css'

const app = createApp(App)

// 注册所有Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(createPinia())
app.use(router)
app.use(ElementPlus)

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
