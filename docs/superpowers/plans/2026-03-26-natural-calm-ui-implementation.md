# 自然静谧风 UI 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将日本采销管理系统重新设计为自然静谧风格，使用浅灰白背景配合灰蓝色系和暖米色强调

**Architecture:** 通过CSS变量统一管理配色，在main.css中定义全局色彩变量，修改Login.vue和Layout.vue的scoped样式实现浅色自然静谧风格

**Tech Stack:** Vue3 + Element Plus + CSS Variables + Vite

---

## 文件结构

- `web-admin/src/assets/styles/main.css` - 全局CSS变量（定义所有颜色）
- `web-admin/src/views/Login.vue` - 登录页（背景、卡片、按钮样式）
- `web-admin/src/views/Layout.vue` - 侧边栏和头部样式

---

## 实现任务

### Task 1: 更新全局 CSS 变量 (main.css)

**Files:**
- Modify: `web-admin/src/assets/styles/main.css`

- [ ] **Step 1: 替换CSS变量定义**

将 `:root` 块中的所有颜色变量替换为自然静谧风配色：

```css
:root {
  /* 背景 */
  --color-bg-page: #F5F6F8;
  --color-bg-card: #FFFFFF;
  --color-bg-sidebar: #E8EAED;

  /* 灰蓝色系 - 主色调 */
  --color-primary: #8B9A9F;
  --color-primary-hover: #7A8990;
  --color-primary-light: rgba(139, 154, 159, 0.1);

  /* 暖米色 - 强调色 */
  --color-accent: #D4C5B0;
  --color-accent-hover: #C9B896;
  --color-accent-light: rgba(212, 197, 176, 0.15);

  /* 文字 */
  --color-text-primary: #4A5568;
  --color-text-secondary: #8B9A9F;
  --color-text-muted: #A0AEC0;

  /* 边框 */
  --color-border: #E2E8F0;
  --color-divider: #EDF2F7;

  /* 功能色 */
  --color-success: #68D391;
  --color-warning: #ECC94B;
  --color-danger: #FC8181;

  /* 表格 */
  --color-table-header-bg: #F8FAFC;
  --color-table-row-hover: rgba(139, 154, 159, 0.05);

  /* 阴影 */
  --shadow-card: 0 2px 8px rgba(0, 0, 0, 0.04);
  --shadow-hover: 0 4px 12px rgba(139, 154, 159, 0.12);
  --shadow-accent: 0 2px 8px rgba(212, 197, 176, 0.3);

  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
}
```

- [ ] **Step 2: 更新body背景**

```css
body {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
  font-size: 14px;
  color: var(--color-text-primary);
  background: var(--color-bg-page);
}
```

- [ ] **Step 3: 更新Element Plus表格样式**

```css
.el-table th {
  background-color: var(--color-table-header-bg) !important;
  color: var(--color-text-secondary);
  font-weight: 600;
  font-size: 13px;
}
```

- [ ] **Step 4: 更新卡片样式**

```css
.el-card {
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  background: var(--color-bg-card);
  box-shadow: var(--shadow-card);
  transition: all 0.3s ease;
}

.el-card:hover {
  box-shadow: var(--shadow-hover);
}
```

- [ ] **Step 5: 更新按钮样式**

```css
.el-button--primary {
  background: linear-gradient(135deg, var(--color-accent), var(--color-accent-hover));
  border: none;
  color: var(--color-text-primary);
  box-shadow: var(--shadow-accent);
}

.el-button--primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(212, 197, 176, 0.4);
}
```

- [ ] **Step 6: 添加滚动条变量**

```css
--color-scrollbar-track: #f1f1f1;
--color-scrollbar-thumb: #ccc;
--color-scrollbar-thumb-hover: #999;
```

- [ ] **Step 7: 提交**

```bash
git add web-admin/src/assets/styles/main.css
git commit -m "feat: apply natural-calm color scheme to main.css"
```

---

### Task 2: 重构登录页 (Login.vue)

**Files:**
- Modify: `web-admin/src/views/Login.vue` (style块)

- [ ] **Step 1: 替换登录容器样式**

```css
.login-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(180deg, #F5F6F8 0%, #EBEEF2 100%);
  position: relative;
}
```

- [ ] **Step 2: 更新语言切换器样式**

```css
.language-switch-wrapper {
  position: absolute;
  top: 20px;
  right: 20px;
}

.language-switch {
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: 14px;
  padding: 8px 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  transition: all 0.3s ease;
  background: var(--color-bg-card);
}

.language-switch:hover {
  border-color: var(--color-primary);
  color: var(--color-text-primary);
}
```

- [ ] **Step 3: 更新登录卡片样式**

```css
.login-card {
  width: 400px;
  border-radius: var(--radius-lg);
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-card);
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
```

- [ ] **Step 4: 更新标题样式**

```css
.card-header h2 {
  text-align: center;
  margin: 0;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-hover));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 24px;
  font-weight: 600;
}
```

- [ ] **Step 5: 提交**

```bash
git add web-admin/src/views/Login.vue
git commit -m "feat: apply natural-calm style to login page"
```

---

### Task 3: 重构侧边栏和头部 (Layout.vue)

**Files:**
- Modify: `web-admin/src/views/Layout.vue` (style块)

- [ ] **Step 1: 更新侧边栏容器样式**

```css
.layout-container {
  height: 100vh;
}

.el-aside {
  background-color: var(--color-bg-sidebar) !important;
  border-right: 1px solid var(--color-divider);
}
```

- [ ] **Step 2: 更新菜单基础样式**

```css
.el-menu {
  border-right: none !important;
  background-color: transparent !important;
}

.el-menu-item {
  margin: 4px 8px;
  border-radius: var(--radius-md);
  height: 48px;
  transition: all 0.3s ease;
  color: var(--color-text-secondary);
  position: relative;
}

.el-menu-item:hover {
  background-color: var(--color-primary-light) !important;
  color: var(--color-text-primary);
}

.el-menu-item.is-active {
  background-color: var(--color-primary-light) !important;
  color: var(--color-text-primary) !important;
  border-left: 3px solid var(--color-accent);
}
```

- [ ] **Step 3: 更新Logo样式**

```css
.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-sidebar);
  border-bottom: 1px solid var(--color-divider);
}

.logo h3 {
  color: var(--color-primary);
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 1px;
}
```

- [ ] **Step 4: 更新头部样式**

```css
.el-header {
  background: var(--color-bg-card);
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
}

.username {
  color: var(--color-text-primary);
  font-weight: 500;
}
```

- [ ] **Step 5: 更新主内容区背景**

```css
.el-main {
  background-color: var(--color-bg-page);
  padding: 20px;
}
```

- [ ] **Step 6: 提交**

```bash
git add web-admin/src/views/Layout.vue
git commit -m "feat: apply natural-calm style to sidebar and header"
```

---

### Task 4: 构建和部署

**Files:**
- Build: `web-admin/dist/`

- [ ] **Step 1: 本地构建**

```bash
cd web-admin && npm run build
```

- [ ] **Step 2: 同步到服务器**

```bash
scp -i ~/.ssh/id_rsa web-admin/src/views/Layout.vue root@43.153.155.76:/opt/japan-purchase-sales/web-admin/src/views/Layout.vue
scp -i ~/.ssh/id_rsa web-admin/src/views/Login.vue root@43.153.155.76:/opt/japan-purchase-sales/web-admin/src/views/Login.vue
scp -i ~/.ssh/id_rsa web-admin/src/assets/styles/main.css root@43.153.155.76:/opt/japan-purchase-sales/web-admin/src/assets/styles/main.css
```

- [ ] **Step 3: 服务器构建和部署**

```bash
ssh -i ~/.ssh/id_rsa root@43.153.155.76 "cd /opt/japan-purchase-sales && docker compose build web-admin && docker compose up -d web-admin"
```

- [ ] **Step 4: 验证部署**

```bash
ssh -i ~/.ssh/id_rsa root@43.153.155.76 "curl -I http://localhost:3000"
```

预期：HTTP 200

---

## 验证清单

- [ ] 登录页背景为浅灰白渐变
- [ ] 登录卡片为纯白，有柔和阴影
- [ ] 灰蓝色用于标题和菜单
- [ ] 暖米色用于按钮和选中态
- [ ] 侧边栏为浅灰色
- [ ] 整体宁静柔和，无刺眼颜色
