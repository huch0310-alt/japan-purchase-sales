<template>
  <el-container class="layout-container">
    <!-- 侧边栏 -->
    <el-aside width="200px">
      <div class="logo">
        <h3>{{ t('login.title') }}</h3>
      </div>
      <el-menu
        :default-active="activeMenu"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409eff"
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataLine /></el-icon>
          <span>{{ t('nav.dashboard') }}</span>
        </el-menu-item>
        <el-menu-item index="/customer">
          <el-icon><User /></el-icon>
          <span>{{ t('nav.customer') }}</span>
        </el-menu-item>
        <el-menu-item index="/staff" v-if="isAdmin">
          <el-icon><UserFilled /></el-icon>
          <span>{{ t('nav.staff') }}</span>
        </el-menu-item>
        <el-menu-item index="/product">
          <el-icon><Goods /></el-icon>
          <span>{{ t('nav.product') }}</span>
        </el-menu-item>
        <el-menu-item index="/category">
          <el-icon><Collection /></el-icon>
          <span>{{ t('nav.category') }}</span>
        </el-menu-item>
        <el-menu-item index="/order">
          <el-icon><Document /></el-icon>
          <span>{{ t('nav.order') }}</span>
        </el-menu-item>
        <el-menu-item index="/invoice">
          <el-icon><Tickets /></el-icon>
          <span>{{ t('nav.invoice') }}</span>
        </el-menu-item>
        <el-menu-item index="/report">
          <el-icon><TrendCharts /></el-icon>
          <span>{{ t('nav.report') }}</span>
        </el-menu-item>
        <el-menu-item index="/settings" v-if="isAdmin">
          <el-icon><Setting /></el-icon>
          <span>{{ t('nav.settings') }}</span>
        </el-menu-item>
        <el-menu-item index="/logs" v-if="isAdmin">
          <el-icon><Clock /></el-icon>
          <span>{{ t('nav.logs') }}</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 主内容区 -->
    <el-container>
      <el-header>
        <div class="header-content">
          <el-dropdown @command="handleLanguageChange">
            <span class="language-switch">
              {{ languages.value.find(l => l.value === locale)?.label }}
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  v-for="lang in languages.value"
                  :key="lang.value"
                  :command="lang.value"
                >
                  {{ lang.label }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <span class="username">{{ user?.name }}</span>
          <el-button type="danger" size="small" @click="handleLogout">
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
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '../store/user'
import { useLanguageStore } from '../store/language'
import { ElMessageBox } from 'element-plus'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const languageStore = useLanguageStore()
const { t, locale: i18nLocale } = useI18n()

const user = computed(() => userStore.user)
const isAdmin = computed(() => userStore.isAdmin)
const activeMenu = computed(() => route.path)
const locale = computed(() => languageStore.locale)

const languages = computed(() => [
  { value: 'zh', label: t('language.zh') },
  { value: 'ja', label: t('language.ja') },
  { value: 'en', label: t('language.en') }
])

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
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.el-aside {
  background-color: #304156;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #2b3a4a;
}

.logo h3 {
  color: #fff;
  margin: 0;
  font-size: 16px;
}

.el-header {
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 20px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.username {
  color: #333;
}

.el-main {
  background-color: #f0f2f5;
  padding: 20px;
}
</style>
