# 沉稳精致风 UI 设计规范

> **Goal:** 为日本采销管理系统打造沉稳精致的企业级设计风格

> **Architecture:** 以炭灰色为主调，琥珀色为点缀，乳白色为背景，营造专业、温暖、值得信赖的商务氛围

> **Tech Stack:** Vue3 + Element Plus + CSS Variables

---

## 配色系统

### 色彩变量定义

```css
:root {
  /* 背景层次 */
  --color-bg-page: #F7F5F2;       /* 温暖乳白主背景 */
  --color-bg-card: #FFFFFF;        /* 纯白卡片 */
  --color-bg-sidebar: #2C2C2C;     /* 深炭灰侧边栏 */
  --color-bg-header: #FFFFFF;      /* 纯白头部 */

  /* 琥珀色系 - 主强调色 */
  --color-primary: #D4A574;        /* 琥珀 */
  --color-primary-hover: #C4956A;
  --color-primary-light: rgba(212, 165, 116, 0.12);

  /* 炭灰色系 - 文字和次要元素 */
  --color-text-primary: #2C2C2C;    /* 深炭灰 */
  --color-text-secondary: #6B6B6B;  /* 中灰 */
  --color-text-muted: #9A9A9A;     /* 浅灰 */
  --color-text-inverse: #FFFFFF;   /* 白色文字（用于深色背景） */

  /* 边框和分隔 */
  --color-border: #E5E2DD;         /* 温暖灰边框 */
  --color-divider: #EEEEEA;        /* 分隔线 */

  /* 功能色 - 沉稳调 */
  --color-success: #5D9B6B;        /* 沉稳绿 */
  --color-warning: #C49A4B;        /* 暗金黄 */
  --color-danger: #B86B6B;         /* 暗玫瑰红 */

  /* 表格 */
  --color-table-header-bg: #FAFAF8;
  --color-table-row-hover: rgba(212, 165, 116, 0.06);

  /* 阴影 */
  --shadow-card: 0 2px 12px rgba(44, 44, 44, 0.06);
  --shadow-hover: 0 6px 20px rgba(44, 44, 44, 0.1);
  --shadow-accent: 0 3px 10px rgba(212, 165, 116, 0.25);

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
- 温暖乳白渐变：`linear-gradient(160deg, #F7F5F2 0%, #EEEBE6 100%)`

**登录卡片：**
- 纯白背景 + 温暖灰边框
- 柔和阴影，营造浮起感

**标题：**
- 琥珀色渐变文字

**按钮：**
- 琥珀色渐变背景
- 悬停时加深并添加阴影

### 2. 侧边栏 (Layout.vue)

**侧边栏背景：** 深炭灰 `#2C2C2C`

**Logo区域：**
- 与侧边栏同色
- 文字使用琥珀色

**菜单项：**
- 默认：白色文字，中等透明度
- 悬停：琥珀色光晕背景
- 选中：
  - 琥珀色背景光晕
  - 左侧 3px 琥珀色竖线
  - 白色文字

**图标：** 随文字颜色变化

### 3. 头部 (Header)

**背景：** 纯白
**底部分隔线：** 温暖灰

### 4. 主内容区

**页面背景：** 温暖乳白 `#F7F5F8`
**卡片：** 纯白 + 温暖灰边框

---

## 组件样式

### 按钮

```css
.el-button--primary {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-hover));
  border: none;
  color: #fff;
  box-shadow: var(--shadow-accent);
}

.el-button--primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 5px 15px rgba(212, 165, 116, 0.35);
}
```

### 输入框

```css
.el-input__wrapper {
  background: #FAFAF8 !important;
  border: 1px solid var(--color-border);
  box-shadow: none !important;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.el-input__wrapper:hover {
  border-color: var(--color-primary);
}

.el-input__wrapper.is-focus {
  border-color: var(--color-primary) !important;
  box-shadow: 0 0 0 3px var(--color-primary-light) !important;
}
```

### 标签

```css
.el-tag {
  border-radius: var(--radius-sm);
  border: none;
  background: var(--color-primary-light);
  color: var(--color-primary-hover);
}
```

---

## 设计理念

| 决策 | 理由 |
|------|------|
| 深炭灰侧边栏 | 形成强烈对比，突出内容区域 |
| 琥珀色点缀 | 温暖、专业、辨识度高，与日式美学契合 |
| 乳白背景 | 温暖舒适，减少长时间使用的视觉疲劳 |
| 白色卡片 | 清晰的层次结构，便于内容聚焦 |
| 沉稳功能色 | 与整体风格协调，不破坏氛围 |

---

## 文件修改清单

1. `web-admin/src/assets/styles/main.css` - 全局CSS变量
2. `web-admin/src/views/Login.vue` - 登录页
3. `web-admin/src/views/Layout.vue` - 侧边栏和头部
