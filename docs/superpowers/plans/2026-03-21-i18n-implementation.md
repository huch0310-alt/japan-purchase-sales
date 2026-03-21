# 多语言功能实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为日本采销管理系统添加日/中/英三语言切换功能

**Architecture:** 使用 vue-i18n + Pinia 实现语言切换，语言偏好存储在 localStorage 中，仅翻译导航和菜单文字

**Tech Stack:** vue-i18n ^9.x, Pinia, localStorage

---

## 文件结构

```
web-admin/
├── src/
│   ├── locales/
│   │   ├── zh.js      # 中文简体
│   │   ├── ja.js      # 日语
│   │   └── en.js      # 英语
│   ├── store/
│   │   └── language.js # 语言状态管理
│   ├── main.js        # 注册 i18n
│   └── views/
│       └── Layout.vue  # 添加语言切换按钮
```

---

## 任务列表

### 任务 1: 安装 vue-i18n 依赖

**Files:**
- Modify: `web-admin/package.json`

- [ ] **步骤 1: 添加 vue-i18n 依赖**

在 `dependencies` 中添加:
```json
"vue-i18n": "^9.14.0"
```

- [ ] **步骤 2: 提交**

```bash
cd web-admin && npm install
git add package.json package-lock.json
git commit -m "chore: 添加 vue-i18n 依赖"
```

---

### 任务 2: 创建语言文件

**Files:**
- Create: `web-admin/src/locales/zh.js`
- Create: `web-admin/src/locales/ja.js`
- Create: `web-admin/src/locales/en.js`

- [ ] **步骤 1: 创建中文语言文件**

```javascript
// web-admin/src/locales/zh.js
export default {
  nav: {
    dashboard: '信息统计',
    customer: '客户管理',
    staff: '员工管理',
    product: '商品管理',
    category: '分类管理',
    unit: '单位管理',
    order: '订单管理',
    invoice: '账单管理',
    report: '报表统计',
    settings: '系统设置',
    logs: '操作日志'
  },
  header: {
    logout: '退出登录'
  },
  language: {
    zh: '中文',
    ja: '日本語',
    en: 'English'
  }
}
```

- [ ] **步骤 2: 创建日语语言文件**

```javascript
// web-admin/src/locales/ja.js
export default {
  nav: {
    dashboard: '情報統計',
    customer: '顧客管理',
    staff: '従業員管理',
    product: '商品管理',
    category: 'カテゴリ管理',
    unit: '単位管理',
    order: '注文管理',
    invoice: '請求書管理',
    report: 'レポート統計',
    settings: 'システム設定',
    logs: '操作ログ'
  },
  header: {
    logout: 'ログアウト'
  },
  language: {
    zh: '中文',
    ja: '日本語',
    en: 'English'
  }
}
```

- [ ] **步骤 3: 创建英语语言文件**

```javascript
// web-admin/src/locales/en.js
export default {
  nav: {
    dashboard: 'Dashboard',
    customer: 'Customers',
    staff: 'Staff',
    product: 'Products',
    category: 'Categories',
    unit: 'Units',
    order: 'Orders',
    invoice: 'Invoices',
    report: 'Reports',
    settings: 'Settings',
    logs: 'Logs'
  },
  header: {
    logout: 'Logout'
  },
  language: {
    zh: '中文',
    ja: '日本語',
    en: 'English'
  }
}
```

- [ ] **步骤 4: 提交**

```bash
git add src/locales/
git commit -m "feat: 添加多语言翻译文件"
```

---

### 任务 3: 创建语言状态管理

**Files:**
- Create: `web-admin/src/store/language.js`

- [ ] **步骤 1: 创建 Pinia store**

```javascript
// web-admin/src/store/language.js
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useLanguageStore = defineStore('language', () => {
  const locale = ref(localStorage.getItem('language') || 'zh')

  watch(locale, (newLocale) => {
    localStorage.setItem('language', newLocale)
  })

  function setLocale(newLocale) {
    locale.value = newLocale
  }

  return { locale, setLocale }
})
```

- [ ] **步骤 2: 提交**

```bash
git add src/store/language.js
git commit -m "feat: 添加语言状态管理"
```

---

### 任务 4: 配置 vue-i18n

**Files:**
- Modify: `web-admin/src/main.js`

- [ ] **步骤 1: 修改 main.js**

在 import 区域添加:
```javascript
import { createI18n } from 'vue-i18n'
import zh from './locales/zh'
import ja from './locales/ja'
import en from './locales/en'
import { useLanguageStore } from './store/language'

const savedLocale = localStorage.getItem('language') || 'zh'

const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: 'zh',
  messages: { zh, ja, en }
})

// 同步 store 和 i18n
const languageStore = useLanguageStore()
languageStore.$subscribe((mutation, state) => {
  i18n.global.locale.value = state.locale
})
```

在 `app.use(router)` 之后添加:
```javascript
app.use(i18n)
```

- [ ] **步骤 2: 提交**

```bash
git add src/main.js
git commit -m "feat: 配置 vue-i18n"
```

---

### 任务 5: 添加语言切换按钮到头部

**Files:**
- Modify: `web-admin/src/views/Layout.vue`

- [ ] **步骤 1: 添加语言切换**

在 `<script setup>` 中添加:
```javascript
import { useI18n } from 'vue-i18n'
import { useLanguageStore } from '../store/language'

const { t, locale } = useI18n()
const languageStore = useLanguageStore()

const languages = [
  { value: 'zh', label: '中文' },
  { value: 'ja', label: '日本語' },
  { value: 'en', label: 'English' }
]

const handleLanguageChange = (lang) => {
  locale.value = lang
  languageStore.setLocale(lang)
}
```

修改 header 部分，添加语言切换:
```vue
<el-header>
  <div class="header-content">
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
    <el-button type="danger" size="small" @click="handleLogout">
      {{ t('header.logout') }}
    </el-button>
  </div>
</el-header>
```

添加样式:
```css
.language-switch {
  cursor: pointer;
  margin-right: 15px;
  color: #fff;
}
.language-switch:hover {
  color: #409eff;
}
```

- [ ] **步骤 2: 提交**

```bash
git add src/views/Layout.vue
git commit -m "feat: 添加语言切换按钮"
```

---

### 任务 6: 翻译侧边栏菜单

**Files:**
- Modify: `web-admin/src/views/Layout.vue`

- [ ] **步骤 1: 修改菜单项使用翻译**

将硬编码的中文替换为翻译 key:
```vue
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
```

- [ ] **步骤 2: 提交**

```bash
git add src/views/Layout.vue
git commit -m "feat: 翻译侧边栏菜单"
```

---

### 任务 7: 翻译路由标题

**Files:**
- Modify: `web-admin/src/router/index.js`

- [ ] **步骤 1: 修改路由 meta title**

将硬编码的中文替换为翻译 key:
```javascript
// 示例
meta: { title: 'nav.dashboard' }
```

修改所有路由:
```javascript
{
  path: 'dashboard',
  name: 'Dashboard',
  component: () => import('../views/Dashboard.vue'),
  meta: { title: 'nav.dashboard' }
},
{
  path: 'staff',
  name: 'Staff',
  component: () => import('../views/Staff.vue'),
  meta: { title: 'nav.staff', roles: ['super_admin', 'admin'] }
},
{
  path: 'customer',
  name: 'Customer',
  component: () => import('../views/Customer.vue'),
  meta: { title: 'nav.customer' }
},
{
  path: 'product',
  name: 'Product',
  component: () => import('../views/Product.vue'),
  meta: { title: 'nav.product' }
},
{
  path: 'category',
  name: 'Category',
  component: () => import('../views/Category.vue'),
  meta: { title: 'nav.category', roles: ['super_admin', 'admin'] }
},
{
  path: 'unit',
  name: 'Unit',
  component: () => import('../views/Unit.vue'),
  meta: { title: 'nav.unit', roles: ['super_admin', 'admin'] }
},
{
  path: 'order',
  name: 'Order',
  component: () => import('../views/Order.vue'),
  meta: { title: 'nav.order' }
},
{
  path: 'invoice',
  name: 'Invoice',
  component: () => import('../views/Invoice.vue'),
  meta: { title: 'nav.invoice' }
},
{
  path: 'report',
  name: 'Report',
  component: () => import('../views/Report.vue'),
  meta: { title: 'nav.report' }
},
{
  path: 'settings',
  name: 'Settings',
  component: () => import('../views/Settings.vue'),
  meta: { title: 'nav.settings', roles: ['super_admin', 'admin'] }
},
{
  path: 'logs',
  name: 'Logs',
  component: () => import('../views/Logs.vue'),
  meta: { title: 'nav.logs', roles: ['super_admin', 'admin'] }
}
```

- [ ] **步骤 2: 提交**

```bash
git add src/router/index.js
git commit -m "feat: 路由标题使用翻译 key"
```

---

## 验收测试

部署后测试:
1. 访问系统，头部显示语言切换下拉菜单
2. 切换到日本語，菜单文字变为日语
3. 切换到 English，菜单文字变为英语
4. 刷新页面，语言保持不变
5. 切换回中文，菜单正确显示
