# 自然静谧风 UI 设计规范

> **Goal:** 将日本采销管理系统的UI重新设计为自然静谧风格，采用浅灰白背景配合灰蓝色系和暖米色强调

> **Architecture:** 浅色系商务风格，强调宁静柔和的视觉体验，通过灰蓝色和暖米色营造舒适的工作氛围

> **Tech Stack:** Vue3 + Element Plus + CSS Variables

---

## 配色系统

### 色彩变量定义

```css
:root {
  /* 背景 */
  --color-bg-page: #F5F6F8;       /* 浅灰白主背景 */
  --color-bg-card: #FFFFFF;        /* 纯白卡片背景 */
  --color-bg-sidebar: #E8EAED;     /* 浅灰侧边栏 */

  /* 灰蓝色系 - 主色调 */
  --color-primary: #8B9A9F;        /* 雾霾蓝灰 */
  --color-primary-hover: #7A8990;
  --color-primary-light: rgba(139, 154, 159, 0.1);

  /* 暖米色 - 强调色 */
  --color-accent: #D4C5B0;         /* 暖米色 */
  --color-accent-hover: #C9B896;
  --color-accent-light: rgba(212, 197, 176, 0.15);

  /* 文字 */
  --color-text-primary: #4A5568;    /* 深灰文字 */
  --color-text-secondary: #8B9A9F;  /* 灰蓝次要文字 */
  --color-text-muted: #A0AEC0;      /* 淡灰辅助文字 */

  /* 边框 */
  --color-border: #E2E8F0;          /* 浅灰边框 */
  --color-divider: #EDF2F7;         /* 分隔线 */

  /* 功能色 */
  --color-success: #68D391;         /* 柔和绿 */
  --color-warning: #ECC94B;         /* 暖黄 */
  --color-danger: #FC8181;          /* 柔和红 */

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

---

## 页面设计

### 1. 登录页 (Login.vue)

**背景：**
- 浅灰白背景 `#F5F6F8`
- 添加微妙的渐变效果增加层次感

**登录卡片：**
- 纯白背景 `background: #FFFFFF`
- 细边框：`1px solid var(--color-border)`
- 柔和阴影：`var(--shadow-card)`
- 圆角：`12px`

**标题：**
- 雾霾蓝灰渐变文字效果

**输入框：**
- 浅灰背景：`rgba(0, 0, 0, 0.03)`
- 边框聚焦时显示雾霾蓝灰色

**按钮：**
- 背景：暖米色渐变
- 悬停时阴影加深

### 2. 侧边栏 (Layout.vue)

**侧边栏背景：** 浅灰 `#E8EAED`

**Logo区域：**
- 与侧边栏同色但略深
- 底部细线分隔

**菜单项：**
- 默认：透明背景，灰蓝色文字 `#8B9A9F`
- 悬停：`var(--color-primary-light)` 背景
- 选中：
  - 背景：`var(--color-primary-light)`
  - 文字：`var(--color-text-primary)`
  - 左侧 `3px` 暖米色竖线

**图标：**
- 默认：`#A0AEC0`
- 选中/悬停：暖米色

### 3. 头部 (Header)

**背景：** 纯白 `#FFFFFF`

**分隔线：** 底部细线 `1px solid var(--color-divider)`

**用户信息：**
- 用户名使用深灰文字
- 语言切换器使用淡边框

### 4. 主内容区

**页面背景：** 浅灰白 `#F5F6F8`

**卡片样式：**
- 背景：`#FFFFFF`
- 边框：`1px solid var(--color-border)`
- 圆角：`12px`
- 悬停：边框变淡，显示柔和阴影

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
  color: var(--color-text-primary);
  box-shadow: var(--shadow-accent);
}

.el-button--primary:hover {
  box-shadow: 0 4px 12px rgba(212, 197, 176, 0.4);
  transform: translateY(-1px);
}
```

### 输入框

```css
.el-input__wrapper {
  background: rgba(0, 0, 0, 0.03) !important;
  box-shadow: none !important;
  border: 1px solid transparent;
}

.el-input__wrapper:hover {
  border-color: var(--color-border);
}

.el-input__wrapper.is-focus {
  border-color: var(--color-primary) !important;
}
```

### 标签

```css
.el-tag {
  border-radius: 4px;
  border: none;
  background: var(--color-primary-light);
  color: var(--color-primary);
}
```

### 下拉菜单

```css
.el-dropdown-menu {
  background: #FFFFFF;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-hover);
}

.el-dropdown-menu__item:hover {
  background: var(--color-primary-light);
  color: var(--color-primary);
}
```

---

## 文件修改清单

1. `web-admin/src/assets/styles/main.css` - 全局CSS变量和Element Plus覆盖
2. `web-admin/src/views/Login.vue` - 登录页样式
3. `web-admin/src/views/Layout.vue` - 侧边栏和头部样式

---

## 注意事项

- 所有颜色通过CSS变量管理，便于后续调整
- 保持 Element Plus 组件的功能完整性
- 整体宁静柔和，适合长时间使用
- 避免过于刺眼的颜色
