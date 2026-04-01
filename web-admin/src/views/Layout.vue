<template>
  <el-container class="layout-container">
    <!-- 移动端遮罩层 -->
    <div 
      v-if="isMobile && !isCollapsed" 
      class="sidebar-overlay" 
      @click="isCollapsed = true"
    />
    
    <!-- 侧边栏 -->
    <el-aside
      :width="isCollapsed ? '64px' : '200px'"
      :class="['sidebar', { 'is-collapsed': isCollapsed, 'is-mobile': isMobile }]"
    >
      <div class="logo">
        <h3 v-if="!isCollapsed">
          {{ t('login.title') }}
        </h3>
        <el-icon
          v-else
          :size="20"
        >
          <Shop />
        </el-icon>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapsed && !isMobile"
        router
        background-color="transparent"
        text-color="#bfcbd9"
        active-text-color="#ffffff"
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataLine /></el-icon>
          <template #title>
            {{ t('nav.dashboard') }}
          </template>
        </el-menu-item>
        <el-menu-item index="/customer">
          <el-icon><User /></el-icon>
          <template #title>
            {{ t('nav.customer') }}
          </template>
        </el-menu-item>
        <el-menu-item
          v-if="isAdmin"
          index="/staff"
        >
          <el-icon><UserFilled /></el-icon>
          <template #title>
            {{ t('nav.staff') }}
          </template>
        </el-menu-item>
        <el-menu-item index="/product">
          <el-icon><Goods /></el-icon>
          <template #title>
            {{ t('nav.product') }}
          </template>
        </el-menu-item>
        <el-menu-item index="/category">
          <el-icon><Collection /></el-icon>
          <template #title>
            {{ t('nav.category') }}
          </template>
        </el-menu-item>
        <el-menu-item index="/order">
          <el-icon><Document /></el-icon>
          <template #title>
            {{ t('nav.order') }}
          </template>
        </el-menu-item>
        <el-menu-item index="/invoice">
          <el-icon><Tickets /></el-icon>
          <template #title>
            {{ t('nav.invoice') }}
          </template>
        </el-menu-item>
        <el-menu-item index="/report">
          <el-icon><TrendCharts /></el-icon>
          <template #title>
            {{ t('nav.report') }}
          </template>
        </el-menu-item>
        <el-menu-item
          v-if="isAdmin"
          index="/settings"
        >
          <el-icon><Setting /></el-icon>
          <template #title>
            {{ t('nav.settings') }}
          </template>
        </el-menu-item>
        <el-menu-item
          v-if="isAdmin"
          index="/logs"
        >
          <el-icon><Clock /></el-icon>
          <template #title>
            {{ t('nav.logs') }}
          </template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 主内容区 -->
    <el-container>
      <el-header>
        <div class="header-content">
          <!-- 折叠按钮 -->
          <el-button 
            class="collapse-btn" 
            :icon="isCollapsed ? Expand : Fold" 
            text
            @click="toggleSidebar"
          />
          <el-dropdown @command="handleLanguageChange">
            <span class="language-switch">
              {{ languages.find(l => l.value === locale)?.label }}
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  v-for="lang in languages"
                  :key="lang.value"
                  :command="lang.value"
                >
                  {{ lang.label }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <span class="username">{{ user?.name }}</span>
          <el-button
            type="danger"
            size="small"
            @click="handleLogout"
          >
            {{ t('header.logout') }}
          </el-button>
        </div>
      </el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '../store/user'
import { useLanguageStore } from '../store/language'
import { ElMessageBox } from 'element-plus'
import { Fold, Expand, Shop } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const languageStore = useLanguageStore()
const { t, locale: i18nLocale } = useI18n()

// 响应式状态
const isCollapsed = ref(false)
const isMobile = ref(false)

// 检测屏幕宽度
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
  // 移动端默认折叠侧边栏
  if (isMobile.value) {
    isCollapsed.value = true
  }
}

// 切换侧边栏
const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}

const user = computed(() => userStore.user)
const isAdmin = computed(() => userStore.isAdmin)
const activeMenu = computed(() => route.path)
const locale = computed(() => languageStore.locale)

const languages = [
  { value: 'zh', label: '中文' },
  { value: 'ja', label: '日本語' },
  { value: 'en', label: 'English' }
]

const handleLanguageChange = (lang) => {
  languageStore.setLocale(lang)
  i18nLocale.value = lang
}

const handleLogout = () => {
  ElMessageBox.confirm(t('header.confirmLogout'), t('common.tip'), {
    confirmButtonText: t('common.confirm'),
    cancelButtonText: t('common.cancel'),
    type: 'warning'
  }).then(() => {
    userStore.logout()
    router.push('/login')
  })
}

// 生命周期
onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.sidebar {
  background-color: var(--color-bg-sidebar) !important;
  transition: width 0.3s ease, transform 0.3s ease;
  overflow: hidden;
}

.sidebar.is-collapsed {
  width: 64px !important;
}

/* 移动端样式 */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    z-index: 1001;
    transform: translateX(-100%);
  }
  
  .sidebar.is-collapsed {
    transform: translateX(-100%);
  }
  
  .sidebar:not(.is-collapsed) {
    transform: translateX(0);
    width: 200px !important;
  }
}

/* 遮罩层 */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.el-menu {
  border-right: none !important;
  background-color: transparent !important;
}

.el-menu-item {
  margin: 4px 8px;
  border-radius: var(--radius-md);
  height: 48px;
  transition: all 0.3s ease;
  color: rgba(255, 255, 255, 0.7);
  position: relative;
}

.el-menu-item:hover {
  background-color: var(--color-primary-light) !important;
  color: var(--color-text-inverse);
}

.el-menu-item.is-active {
  background: var(--color-primary-light) !important;
  color: var(--color-text-inverse) !important;
  border-left: 3px solid var(--color-primary);
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #242424;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.logo h3 {
  color: var(--color-primary);
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 1px;
  white-space: nowrap;
}

.logo .el-icon {
  color: var(--color-primary);
}

.el-header {
  background: var(--color-bg-header);
  border-bottom: 1px solid var(--color-divider);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 20px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
}

.collapse-btn {
  margin-right: auto;
  font-size: 20px;
}

.username {
  color: var(--color-text-primary);
  font-weight: 500;
}

.el-main {
  background-color: var(--color-bg-page);
  padding: 20px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .el-main {
    padding: 12px;
  }
  
  .header-content {
    gap: 8px;
  }
  
  .username {
    display: none;
  }
  
  .language-switch {
    font-size: 12px;
  }
}
</style>
