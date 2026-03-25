# 商务沉稳风 UI 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将日本采销管理系统重新设计为商务沉稳风格，使用藏蓝渐变背景配合玫瑰金色强调色

**Architecture:** 通过CSS变量统一管理配色，在main.css中定义全局色彩变量，修改Login.vue和Layout.vue的scoped样式实现深色商务风格

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

- [ ] **Step 1: 备份并替换CSS变量定义**

将 `:root` 块中的所有颜色变量替换为商务沉稳风配色：

```css
:root {
  /* 背景渐变 */
  --color-bg-start: #0f1c3a;
  --color-bg-mid: #1a2744;
  --color-bg-end: #0f1c3a;

  /* 侧边栏 */
  --color-sidebar-bg: #0a0f1a;

  /* 卡片 */
  --color-card-bg: rgba(255, 255, 255, 0.03);
  --color-card-border: rgba(183, 110, 121, 0.1);

  /* 强调色 - 玫瑰金 */
  --color-accent: #B76E79;
  --color-accent-hover: #C9848D;
  --color-accent-light: rgba(183, 110, 121, 0.15);

  /* 主色 */
  --color-primary: #B76E79;
  --color-primary-hover: #C9848D;

  /* 文字 */
  --color-text-primary: #E8E8E8;
  --color-text-secondary: #8B8B8B;
  --color-text-muted: #5A5A5A;

  /* 边框 */
  --color-border: rgba(183, 110, 121, 0.2);
  --color-divider: rgba(255, 255, 255, 0.05);

  /* 功能色 */
  --color-success: #5D9B6B;
  --color-warning: #D4A84B;
  --color-danger: #C75B5B;

  /* 表格 */
  --color-table-header-bg: rgba(183, 110, 121, 0.08);
  --color-table-row-hover: rgba(183, 110, 121, 0.05);

  /* 阴影 */
  --shadow-card: 0 4px 20px rgba(0, 0, 0, 0.3);
  --shadow-hover: 0 8px 30px rgba(183, 110, 121, 0.15);
  --shadow-accent: 0 4px 15px rgba(183, 110, 121, 0.3);

  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
}
```

- [ ] **Step 2: 更新Element Plus覆盖样式**

替换 `.el-table th` 样式为：
```css
.el-table th {
  background-color: var(--color-table-header-bg) !important;
  color: var(--color-text-secondary);
  font-weight: 600;
  font-size: 13px;
}
```

- [ ] **Step 3: 更新卡片和按钮样式**

```css
.el-card {
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-card-border);
  background: var(--color-card-bg);
  box-shadow: var(--shadow-card);
  transition: all 0.3s ease;
}

.el-card:hover {
  border-color: var(--color-border);
  box-shadow: var(--shadow-hover);
}

.el-button--primary {
  background: linear-gradient(135deg, var(--color-accent), var(--color-accent-hover));
  border: none;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-accent);
}

.el-button--primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(183, 110, 121, 0.4);
}
```

- [ ] **Step 4: 更新body背景**

```css
body {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
  font-size: 14px;
  color: var(--color-text-primary);
  background: linear-gradient(180deg, var(--color-bg-start) 0%, var(--color-bg-mid) 50%, var(--color-bg-end) 100%);
}
```

- [ ] **Step 5: 提交**

```bash
git add web-admin/src/assets/styles/main.css
git commit -m "feat: apply business-stable color scheme to main.css"
```

---

### Task 2: 重构登录页 (Login.vue)

**Files:**
- Modify: `web-admin/src/views/Login.vue:103-180` (style块)

- [ ] **Step 1: 替换登录容器样式**

```css
.login-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: radial-gradient(ellipse at center, #1a2744 0%, #0f1c3a 100%);
  position: relative;
  overflow: hidden;
}

/* 网格纹理 */
.login-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    linear-gradient(rgba(183, 110, 121, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(183, 110, 121, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
  pointer-events: none;
}
```

- [ ] **Step 2: 更新语言切换器样式**

```css
.language-switch-wrapper {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 10;
}

.language-switch {
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: 14px;
  padding: 8px 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  transition: all 0.3s ease;
  backdrop-filter: blur(4px);
  background: rgba(10, 15, 26, 0.5);
}

.language-switch:hover {
  background: var(--color-accent-light);
  border-color: var(--color-accent);
  color: var(--color-text-primary);
}
```

- [ ] **Step 3: 更新登录卡片样式**

```css
.login-card {
  width: 400px;
  border-radius: var(--radius-lg);
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  border: 1px solid var(--color-card-border);
  box-shadow: var(--shadow-card);
  position: relative;
  z-index: 5;
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
  background: linear-gradient(135deg, var(--color-accent), var(--color-accent-hover));
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
git commit -m "feat: apply business-stable style to login page"
```

---

### Task 3: 重构侧边栏和头部 (Layout.vue)

**Files:**
- Modify: `web-admin/src/views/Layout.vue:137-229` (style块)

- [ ] **Step 1: 更新侧边栏容器样式**

```css
.layout-container {
  height: 100vh;
}

.el-aside {
  background-color: var(--color-sidebar-bg) !important;
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
  background-color: var(--color-accent-light) !important;
  color: var(--color-text-primary);
}

.el-menu-item.is-active {
  background: linear-gradient(90deg, var(--color-accent-light) 0%, rgba(10, 15, 26, 0.9) 100%) !important;
  color: var(--color-accent) !important;
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
  background: linear-gradient(180deg, #050810 0%, #0a0f1a 100%);
  border-bottom: 1px solid var(--color-divider);
}

.logo h3 {
  color: var(--color-accent);
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 2px;
}
```

- [ ] **Step 4: 更新头部样式**

```css
.el-header {
  background: rgba(10, 15, 26, 0.9);
  backdrop-filter: blur(10px);
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
  background: transparent;
  padding: 20px;
}
```

- [ ] **Step 6: 提交**

```bash
git add web-admin/src/views/Layout.vue
git commit -m "feat: apply business-stable style to sidebar and header"
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

- [ ] 登录页背景为藏蓝渐变
- [ ] 登录卡片有玻璃态效果
- [ ] 玫瑰金色用于按钮和强调元素
- [ ] 侧边栏为深藏蓝，菜单项有玫瑰金色选中态
- [ ] 整体配色沉稳内敛，无刺眼亮色
