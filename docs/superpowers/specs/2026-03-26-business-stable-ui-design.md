# 商务沉稳风 UI 设计规范

> **Goal:** 将日本采销管理系统的UI重新设计为商务沉稳风格，采用藏蓝渐变背景配合玫瑰金色强调色

> **Architecture:** 深色系商务风格，强调沉稳内敛的视觉体验，通过微妙的玫瑰金色点缀提升品质感

> **Tech Stack:** Vue3 + Element Plus + CSS Variables

---

## 配色系统

### 色彩变量定义

```css
:root {
  /* 背景渐变 - 从上到下 */
  --color-bg-start: #0f1c3a;      /* 顶部 */
  --color-bg-mid: #1a2744;         /* 中间 */
  --color-bg-end: #0f1c3a;         /* 底部 */

  /* 侧边栏 */
  --color-sidebar-bg: #0a0f1a;      /* 更深的藏蓝 */

  /* 卡片 */
  --color-card-bg: rgba(255, 255, 255, 0.03);  /* 微透明深色 */
  --color-card-border: rgba(183, 110, 121, 0.1);

  /* 强调色 - 玫瑰金 */
  --color-accent: #B76E79;
  --color-accent-hover: #C9848D;
  --color-accent-light: rgba(183, 110, 121, 0.15);

  /* 主色 - 使用强调色作为主色 */
  --color-primary: #B76E79;
  --color-primary-hover: #C9848D;

  /* 文字 */
  --color-text-primary: #E8E8E8;    /* 浅灰白 */
  --color-text-secondary: #8B8B8B;  /* 中性灰 */
  --color-text-muted: #5A5A5A;      /* 暗淡灰 */

  /* 边框/分隔线 */
  --color-border: rgba(183, 110, 121, 0.2);
  --color-divider: rgba(255, 255, 255, 0.05);

  /* 功能色 */
  --color-success: #5D9B6B;         /* 墨绿系成功 */
  --color-warning: #D4A84B;         /* 暗金警告 */
  --color-danger: #C75B5B;          /* 暗红危险 */

  /* 表格 */
  --color-table-header-bg: rgba(183, 110, 121, 0.08);
  --color-table-row-hover: rgba(183, 110, 121, 0.05);

  /* 阴影 */
  --shadow-card: 0 4px 20px rgba(0, 0, 0, 0.3);
  --shadow-hover: 0 8px 30px rgba(183, 110, 121, 0.15);
  --shadow-accent: 0 4px 15px rgba(183, 110, 121, 0.3);
}
```

---

## 页面设计

### 1. 登录页 (Login.vue)

**背景：**
- 藏蓝径向渐变背景
- 添加微妙的网格纹理增加质感

**登录卡片：**
- 玻璃态效果：`background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(10px);`
- 边框：`1px solid var(--color-card-border)`
- 阴影：`var(--shadow-card)`
- 圆角：`12px`

**标题：**
- 使用玫瑰金色渐变文字
- `background: linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))`

**输入框：**
- 深色背景：`rgba(0, 0, 0, 0.3)`
- 边框聚焦时显示玫瑰金色

**按钮：**
- 背景渐变：`linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))`
- 悬停添加发光阴影

### 2. 侧边栏 (Layout.vue)

**Logo区域：**
- 背景：`#0a0f1a` (比侧边栏更深)
- 底部细线分隔：`1px solid var(--color-divider)`

**菜单项：**
- 默认：透明背景，灰色文字 `#8B8B8B`
- 悬停：`rgba(183, 110, 121, 0.1)` 背景
- 选中：
  - 背景：`rgba(183, 110, 121, 0.15)`
  - 文字：`#E8E8E8`
  - 左侧 `3px` 玫瑰金色竖线

**图标：**
- 默认：`#5A5A5A`
- 选中/悬停：玫瑰金色

### 3. 头部 (Header)

**背景：** 微透明深色 `rgba(10, 15, 26, 0.9)`

**用户信息：**
- 用户名使用主文字色
- 语言切换器使用淡色边框

### 4. 主内容区

**页面背景：**
- 使用藏蓝渐变背景
- 子页面容器使用深色卡片

**卡片样式：**
- 背景：`rgba(255, 255, 255, 0.03)`
- 边框：`1px solid var(--color-card-border)`
- 圆角：`12px`
- 悬停：边框变亮，显示微妙阴影

### 5. 表格

**表头：**
- 背景：`var(--color-table-header-bg)`
- 文字：`var(--color-text-secondary)`

**行悬停：**
- 背景：`var(--color-table-row-hover)`

---

## 组件样式

### 按钮

**主要按钮：**
```css
.el-button--primary {
  background: linear-gradient(135deg, var(--color-accent), var(--color-accent-hover));
  border: none;
  box-shadow: var(--shadow-accent);
}

.el-button--primary:hover {
  box-shadow: 0 6px 20px rgba(183, 110, 121, 0.4);
  transform: translateY(-1px);
}
```

### 输入框

```css
.el-input__wrapper {
  background: rgba(0, 0, 0, 0.3) !important;
  box-shadow: none !important;
  border: 1px solid transparent;
}

.el-input__wrapper:hover {
  border-color: var(--color-border);
}

.el-input__wrapper.is-focus {
  border-color: var(--color-accent) !important;
}
```

### 标签

```css
.el-tag {
  border-radius: 4px;
  border: none;
  background: var(--color-accent-light);
  color: var(--color-accent);
}
```

### 下拉菜单

```css
.el-dropdown-menu {
  background: rgba(10, 15, 26, 0.95);
  border: 1px solid var(--color-border);
}

.el-dropdown-menu__item:hover {
  background: var(--color-accent-light);
  color: var(--color-accent);
}
```

---

## 文件修改清单

1. `web-admin/src/assets/styles/main.css` - 全局CSS变量和Element Plus覆盖
2. `web-admin/src/views/Login.vue` - 登录页样式
3. `web-admin/src/views/Layout.vue` - 侧边栏和头部样式
4. 其他页面Vue组件的scoped样式（如需要）

---

## 注意事项

- 所有颜色通过CSS变量管理，便于后续调整
- 保持 Element Plus 组件的功能完整性
- 玫瑰金色使用克制，避免过度装饰
- 深色主题减少眼睛疲劳，适合长时间使用
