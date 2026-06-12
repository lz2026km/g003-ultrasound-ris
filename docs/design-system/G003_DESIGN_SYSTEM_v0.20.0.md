# G003 智慧超声影像信息管理系统 — UI 设计系统 v0.20.0

> 适用范围：G003 全部 53 个 page 文件 + AppShell + 后续 v0.20.0+ 增量模块
> 技术栈：React 18 + Vite 5 + lucide-react + recharts + react-router-dom v6 (HashRouter)
> 部署：https://lz2026km.github.io/g003-ultrasound-ris/
> 目标规格：桌面 1920×1080，零移动端
> 版本基线：v0.19.4（已完成 P0 4 项升级）
> 关联文档：`docs/CHANGELOG_v0.19.4.md`、`docs/INDUSTRY_RESEARCH_ULTRASOUND_RIS_v1.md`

---

## 0. 设计原则与基调

| 原则 | 落地方式 |
|---|---|
| **医疗专业感** | 高对比度文字、低饱和度强调色、克制的阴影、信息密度优先于装饰 |
| **现代简约** | 大留白、扁平化、2px 描边为主、4 级阴影而非光晕 |
| **蓝紫主调** | primary 锚定 `#3b82f6`（Tailwind blue-500），非 `#6366f1`（indigo） |
| **可访问性优先** | 全部色值经 WCAG AA 验证，文字与背景 ≥ 4.5:1，UI 大字 ≥ 3:1 |
| **零 emoji 装饰** | 不使用 emoji 头像/表情，状态用 Badge/Icon + 文字 |
| **无金色渐变 / 光晕 / 重复重叠** | 严禁 `linear-gradient(180deg, #f59e0b, ...)` 等金色渐变；阴影统一 token 不堆叠 |
| **CSS 变量驱动** | 全部 Design Token 以 CSS Custom Properties 实现，便于浅深主题切换 |
| **图标库保留** | 沿用 `lucide-react`（已有 import），尺寸 14/16/20/24 标准阶梯 |
| **图表色板统一** | recharts 配色从 primary-100 → primary-900 派生 9 色板 |

### 命名空间

```css
:root {
  --g003-* /* G003 业务 Token */
  --ds-*   /* Design System 通用 Token */
}
```

下文统一使用 `--ds-*` 前缀；与业务强相关的（如 `--g003-sidebar-bg`）单独标注。

---

## 1. 色彩系统（Color Tokens）

### 1.1 Primary — 蓝紫色阶（锚点 #3b82f6）

以 `blue-500`（#3b82f6）为 500 阶梯锚点，对应 Tailwind 蓝系（避免 indigo/紫色过深偏离医疗感）。紫色仅在 primary 派生的 accent 出现。

| Token | Light Value | Dark Value | RGB (light) | 用途 |
|---|---|---|---|---|
| `--ds-primary-50`  | `#eff6ff` | `#172554` | 239,246,255 | 链接/选中底色、Chart 浅色带 |
| `--ds-primary-100` | `#dbeafe` | `#1e3a8a` | 219,234,254 | Hover 浅底、Tag 弱化、Chart 1 |
| `--ds-primary-200` | `#bfdbfe` | `#1e40af` | 191,219,254 | 描边浅色、Chart 2 |
| `--ds-primary-300` | `#93c5fd` | `#1d4ed8` | 147,197,253 | 禁用图标、Chart 3 |
| `--ds-primary-400` | `#60a5fa` | `#2563eb` | 96,165,250 | 次要强调、Chart 4、active 描边 |
| `--ds-primary-500` | **`#3b82f6`** | `#3b82f6` | 59,130,246 | **品牌主色**，primary 按钮、关键链接 |
| `--ds-primary-600` | `#2563eb` | `#60a5fa` | 37,99,235 | primary Hover、正文链接、Chart 5 |
| `--ds-primary-700` | `#1d4ed8` | `#93c5fd` | 29,78,216 | primary 强调文字、Chart 6 |
| `--ds-primary-800` | `#1e40af` | `#bfdbfe` | 30,64,175 | 深底文字、Chart 7 |
| `--ds-primary-900` | `#1e3a8a` | `#dbeafe` | 30,58,138 | 极深文字、Chart 8、品牌深色面 |

**WCAG 对比度（白底 vs 浅色 Token，作为前景色）**：

| Token | Ratio | 等级 | 适用 |
|---|---|---|---|
| primary-500 #3b82f6 | 3.68 | 失败 AA（4.5）/通过 AA Large（3.0）| 仅用于 UI 大字/图标 ≥ 18px 或粗体 ≥ 14px |
| primary-600 #2563eb | 5.17 | **AA** | 链接、强调正文、品牌按钮文字 |
| primary-700 #1d4ed8 | 6.70 | **AA** | 强调文字、标题 |
| primary-800 #1e40af | 8.72 | **AAA** | 高权重标题、严肃声明 |
| primary-900 #1e3a8a | 10.36 | **AAA** | 极深色（仅品牌深面） |

> **使用规约**：正文链接必须使用 `--ds-primary-600` 或更深；`--ds-primary-500` 仅可用于按钮背景、icon、图表描边。

### 1.2 Neutral — 中性灰阶

| Token | Light | Dark | 用途 |
|---|---|---|---|
| `--ds-neutral-0`   | `#ffffff` | `#0b1220` | 卡片、弹层最上 |
| `--ds-neutral-50`  | `#f8fafc` | `#111a2e` | 卡片次级内层 |
| `--ds-neutral-100` | `#f1f5f9` | `#1a253f` | 表格行交替、Disabled 浅底 |
| `--ds-neutral-200` | `#e2e8f0` | `#243152` | 描边 1px、分隔线 |
| `--ds-neutral-300` | `#cbd5e1` | `#334155` | 输入框边框、占位符（dark 模式可作次要文字） |
| `--ds-neutral-400` | `#94a3b8` | `#64748b` | 次要图标、占位符文字（light 模式不用于正文） |
| `--ds-neutral-500` | `#64748b` | `#94a3b8` | 正文次级（light AA 4.76 通过 / dark 4.76 通过）|
| `--ds-neutral-600` | `#475569` | `#cbd5e1` | 正文（light AAA 7.58 / dark 9.43）|
| `--ds-neutral-700` | `#334155` | `#e2e8f0` | 强调正文、标题辅助 |
| `--ds-neutral-800` | `#1e293b` | `#f1f5f9` | 标题、深度正文 |
| `--ds-neutral-900` | `#0f172a` | `#f8fafc` | 主标题、最高对比 |

**WCAG（light 模式）**：neutral-500 = 4.76 AA 通过；neutral-600 = 7.58 AAA；neutral-700 = 10.35 AAA。
**WCAG（dark 模式 surface-2 #1a253f）**：text-100 #f1f5f9 = 13.89 AAA；text-300 #cbd5e1 = 10.25 AAA；text-400 #94a3b8 = 5.93 AA。

### 1.3 Semantic — 语义色

每个语义色提供 50/100/500/600/700 五阶梯。**正文文字必须使用 600+**（500 在白底普遍 FAIL AA）。

| 语义 | Token | Light | Dark | 文字色（白底用）| 白字 ratio | 适用 |
|---|---|---|---|---|---|---|
| **成功** | `--ds-success-50`  | `#f0fdf4` | `#052e16` | — | — | Tag 浅底 |
| | `--ds-success-100` | `#dcfce7` | `#14532d` | — | — | Tag 实心淡 |
| | `--ds-success-500` | `#22c55e` | `#22c55e` | — | 2.28 不通过 | 仅大数据/进度条 |
| | `--ds-success-600` | `#16a34a` | `#4ade80` | 通过 | 3.30 不通过 | Tag 文字（建议 700）|
| | `--ds-success-700` | `#15803d` | `#86efac` | 通过 | 5.02 AA | 文字/Tag 强调 |
| **警告** | `--ds-warning-50`  | `#fffbeb` | `#451a03` | — | — | 警告背景 |
| | `--ds-warning-100` | `#fef3c7` | `#78350f` | — | — | Tag 浅 |
| | `--ds-warning-500` | `#f59e0b` | `#f59e0b` | — | 2.15 不通过 | 图标、强调框 |
| | `--ds-warning-600` | `#d97706` | `#fbbf24` | 通过 | 3.19 不通过 | 仅 Large |
| | `--ds-warning-700` | `#b45309` | `#fcd34d` | 通过 | 5.02 AA | 警告文字 |
| **错误** | `--ds-danger-50`  | `#fef2f2` | `#450a0a` | — | — | 错误背景 |
| | `--ds-danger-100` | `#fee2e2` | `#7f1d1d` | — | — | Tag 浅 |
| | `--ds-danger-500` | `#ef4444` | `#ef4444` | — | 3.76 不通过 | 图标 |
| | `--ds-danger-600` | `#dc2626` | `#f87171` | 通过 | 4.83 AA | 错误文字（推荐）|
| | `--ds-danger-700` | `#b91c1c` | `#fca5a5` | 通过 | 6.47 AA | 严重错误 |
| **信息** | `--ds-info-50`  | `#eff6ff` | `#172554` | — | — | 信息背景 |
| | `--ds-info-100` | `#dbeafe` | `#1e3a8a` | — | — | Tag 浅 |
| | `--ds-info-500` | `#3b82f6` | `#3b82f6` | — | 3.68 不通过 | 图标（对齐 primary）|
| | `--ds-info-600` | `#2563eb` | `#60a5fa` | 通过 | 5.17 AA | 信息文字 |
| | `--ds-info-700` | `#1d4ed8` | `#93c5fd` | 通过 | 6.70 AA | 强调 |

> **Tag 文字推荐**：success-700 / warning-700 / danger-700 / info-700 + 白底（白字）或 50 浅底 + 700 文字。**严禁** success-500 / warning-500 / danger-500 / info-500 作为正文文字色。

### 1.4 Surface — 背景层级

浅色（默认）：

| Token | 值 | 用途 |
|---|---|---|
| `--ds-app-bg`        | `#f0f4f8` | AppShell 全局背景（沿用现状，区别于 neutral-50 制造层次） |
| `--ds-surface-1`     | `#ffffff` | 卡片、Modal、Table 容器 |
| `--ds-surface-2`     | `#f8fafc` | 卡片内分区、Tab 内容、表格 head |
| `--ds-surface-3`     | `#f1f5f9` | Hover、表格斑马、Disabled 区域 |
| `--ds-surface-sunken`| `#e2e8f0` | 凹陷容器、嵌入代码块 |
| `--ds-border`        | `#e2e8f0` | 1px 通用描边 |
| `--ds-border-strong` | `#cbd5e1` | 1px 强调描边、输入框 |

深色：

| Token | 值 | 用途 |
|---|---|---|
| `--ds-app-bg`        | `#0b1220` | AppShell 深色背景 |
| `--ds-surface-1`     | `#111a2e` | 卡片、Modal |
| `--ds-surface-2`     | `#1a253f` | 卡片内分区、Tab |
| `--ds-surface-3`     | `#243152` | Hover、选中态 |
| `--ds-surface-sunken`| `#0b1220` | 凹陷 |
| `--ds-border`        | `#243152` | 描边 |
| `--ds-border-strong` | `#334155` | 强调描边 |

### 1.5 业务专属 Token

| Token | Light | Dark | 用途 |
|---|---|---|---|
| `--g003-sidebar-bg`     | `#1a3a5c` | `#0a1828` | 侧边栏深底 |
| `--g003-sidebar-text`   | `#f1f5f9` | `#e2e8f0` | 侧边栏正文（white on #1a3a5c = 11.64 AAA） |
| `--g003-sidebar-muted`  | `rgba(255,255,255,0.6)` | `rgba(255,255,255,0.55)` | 侧边栏次级文字 |
| `--g003-sidebar-active-bg` | `rgba(59,130,246,0.18)` | `rgba(59,130,246,0.22)` | 激活菜单底色（**替换原 #4ade80 绿色高亮**） |
| `--g003-sidebar-active-border` | `#60a5fa` | `#93c5fd` | 激活菜单左 4px 边（**替换原 #4ade80**，与蓝紫主调一致） |
| `--g003-topbar-bg`      | `#ffffff` | `#111a2e` | 顶栏 |
| `--g003-topbar-shadow`  | `0 2px 4px rgba(15,23,42,0.06)` | `0 2px 4px rgba(0,0,0,0.4)` | 顶栏阴影 |

> **重要变更**：v0.19.x 现状 sidebar 激活态使用 `#4ade80`（绿色），与"医疗专业感+蓝紫主调"冲突，v0.20.0 设计系统统一改为 `--g003-sidebar-active-border: #60a5fa`（primary-400，4.58 AA on #1a3a5c 通过）。

---

## 2. 排版系统（Typography Tokens）

### 2.1 字体家族

```css
--ds-font-sans: "Noto Sans SC", "Source Han Sans SC", "Source Han Sans CN",
                "PingFang SC", "Microsoft YaHei", "Segoe UI", system-ui, -apple-system, sans-serif;

--ds-font-mono: "JetBrains Mono", "Fira Code", "SF Mono", "Cascadia Code",
                "Source Code Pro", Consolas, "Liberation Mono", monospace;
```

| 用途 | 字体 | 备注 |
|---|---|---|
| 通用 UI、标题、正文 | `--ds-font-sans` | 思源黑体为优先（开源、可商用），回退系统中文栈 |
| 报告 ID、患者编号、数值、表格数据列 | `--ds-font-mono` | 等宽对齐，提升医疗数据可读性 |
| 状态码、版本号、技术标签 | `--ds-font-mono` | 与数据列一致 |

> **字体引入**：v0.20.0 通过 `index.html` 引入 Google Fonts（Noto Sans SC 400/500/600/700 + JetBrains Mono 400/500），`<link rel="preconnect">` + `&display=swap` 避免阻塞渲染。

### 2.2 字号阶梯（Type Scale）

桌面 1920×1080 设计基线 16px。8 阶梯严格单调递增，比例 ≈ 1.2（小段）/ 1.25（中段）。

| Token | px | rem | 行高 (line-height) | 字间距 (letter-spacing) | 典型用途 |
|---|---|---|---|---|---|
| `--ds-text-xs`   | 12 | 0.75  | 1.5  | 0   | Tag 文字、Tooltip 辅助、版本号 |
| `--ds-text-sm`   | 14 | 0.875 | 1.5  | 0   | 表格正文、辅助说明、按钮（小）|
| `--ds-text-base` | 16 | 1.0   | 1.6  | 0   | **正文默认**、输入框、列表 |
| `--ds-text-md`   | 18 | 1.125 | 1.6  | 0   | 次级标题、强调正文、卡内副标题 |
| `--ds-text-lg`   | 20 | 1.25  | 1.5  | 0   | 卡片标题、Modal 标题、顶栏 |
| `--ds-text-xl`   | 24 | 1.5   | 1.4  | 0   | 区块标题、Drawer 标题 |
| `--ds-text-2xl`  | 30 | 1.875 | 1.3  | -0.01em | 页面大标题 |
| `--ds-text-3xl`  | 36 | 2.25  | 1.2  | -0.015em | 数字 KPI 大字（如 Dashboard）|

### 2.3 字重（Font Weight）

| Token | 值 | 用途 |
|---|---|---|
| `--ds-weight-regular`  | 400 | 正文、表格数据、说明 |
| `--ds-weight-medium`   | 500 | 按钮、强调正文、Label |
| `--ds-weight-semibold` | 600 | 副标题、字段名、Tab 激活 |
| `--ds-weight-bold`     | 700 | 标题、关键 KPI、Tag 实心 |
| `--ds-weight-black`    | 800 | 仅 36px KPI 数字、品牌字"G003" |

### 2.4 预置文字类（Text Style Presets）

```css
--ds-style-h1: var(--ds-text-2xl) / var(--ds-weight-bold)   / 1.3;  /* 页面标题 */
--ds-style-h2: var(--ds-text-xl)  / var(--ds-weight-bold)   / 1.4;  /* 区块标题 */
--ds-style-h3: var(--ds-text-lg)  / var(--ds-weight-semibold)/ 1.5;  /* 卡片标题 */
--ds-style-h4: var(--ds-text-md)  / var(--ds-weight-semibold)/ 1.6;  /* 副标题 */
--ds-style-body: var(--ds-text-base)/var(--ds-weight-regular)/1.6;  /* 正文 */
--ds-style-body-sm: var(--ds-text-sm)/var(--ds-weight-regular)/1.5;/* 表格/辅助 */
--ds-style-caption: var(--ds-text-xs)/var(--ds-weight-regular)/1.5;/* Tag/Tooltip */
--ds-style-kpi: var(--ds-text-3xl)/var(--ds-weight-black) / 1.1;    /* 大数字 */
--ds-style-code: var(--ds-text-sm)/var(--ds-weight-regular)/1.6
                var(--ds-font-mono);
```

---

## 3. 间距系统（Spacing Tokens）

基于 4px 网格，**所有间距值必须是 4 的倍数**。命名 `space-{n}` 对应 `n × 4px`。

| Token | px | 典型用途 |
|---|---|---|
| `--ds-space-0`  | 0   | 重置 |
| `--ds-space-1`  | 4   | 极小间距（图标与文字 1px 补偿）、Tag 内边距纵向 |
| `--ds-space-2`  | 8   | Tag 水平内边距、输入框内左右边距、紧凑按钮 |
| `--ds-space-3`  | 12  | 按钮小尺寸内边距、列表项垂直 |
| `--ds-space-4`  | 16  | **组件标准内边距**、卡片内 padding、表格单元格 |
| `--ds-space-5`  | 20  | 卡片 padding（大）、Modal 头/体 |
| `--ds-space-6`  | 24  | 区块上下间距、Modal 内容 padding、Table 行高内 |
| `--ds-space-7`  | 28  | 顶栏 padding、侧边栏 logo 区 |
| `--ds-space-8`  | 32  | **页面外边距**、抽屉内容 padding |
| `--ds-space-10` | 40  | 大区块间距、KPI 卡 padding、Modal 上下 |
| `--ds-space-12` | 48  | 页面分区 |
| `--ds-space-14` | 56  | — |
| `--ds-space-16` | 64  | 页面 hero 间距、登录页块 |
| `--ds-space-20` | 80  | 极少用：Modal 上下大留白 |
| `--ds-space-24` | 96  | 极少用：标题与内容超大间距 |

**布局留白规约**：
- 页面 padding：`--ds-space-8`（32px，AppShell.page）
- 卡片 padding：`--ds-space-5` 或 `--ds-space-6`（20/24px）
- 表单字段间距：`--ds-space-4`（16px）
- 区块标题 → 内容：`--ds-space-4`
- 内容 → 下一个区块：`--ds-space-8`

**Gap 工具**（flex/grid 间距）：直接使用 `gap: var(--ds-space-3)` 等，禁止写 14px/22px 这类非 4 倍数。

---

## 4. 阴影系统（Elevation Tokens）

仅 4 级（避免阴影堆叠/光晕）。所有阴影使用 `rgba(15,23,42,α)`（slate-900 基色），**禁止使用纯黑 `rgba(0,0,0,...)`** 以避免在浅蓝/紫背景上偏冷偏脏。

| Token | Light Value | Dark Value | 用途 |
|---|---|---|---|
| `--ds-shadow-sm` | `0 1px 2px 0 rgba(15,23,42,0.06), 0 1px 3px 0 rgba(15,23,42,0.04)` | `0 1px 2px 0 rgba(0,0,0,0.3)` | 表格内行 hover、Tag 弱悬浮、按钮按下 |
| `--ds-shadow-md` | `0 4px 6px -1px rgba(15,23,42,0.08), 0 2px 4px -2px rgba(15,23,42,0.05)` | `0 4px 6px -1px rgba(0,0,0,0.4), 0 2px 4px -2px rgba(0,0,0,0.3)` | **卡片默认**、Popover、Tooltip |
| `--ds-shadow-lg` | `0 10px 15px -3px rgba(15,23,42,0.10), 0 4px 6px -4px rgba(15,23,42,0.05)` | `0 10px 15px -3px rgba(0,0,0,0.5), 0 4px 6px -4px rgba(0,0,0,0.3)` | **卡片悬浮**、Drawer、Modal 容器 |
| `--ds-shadow-xl` | `0 20px 25px -5px rgba(15,23,42,0.12), 0 8px 10px -6px rgba(15,23,42,0.06)` | `0 20px 25px -5px rgba(0,0,0,0.6), 0 8px 10px -6px rgba(0,0,0,0.4)` | 最高层级浮层、嵌套 Modal、命令面板 |

**使用规约**：
- 卡片默认 `md`，hover 升至 `lg`，**禁止同时叠加 `md+lg`**（常见粗糙 UI 病）
- Modal/抽屉/Drawer 用 `xl`
- 严禁使用 `box-shadow: 0 0 20px rgba(59,130,246,0.5)` 这类光晕
- 严禁 `filter: drop-shadow` 与 `box-shadow` 同时使用

**焦点环（Focus Ring）**（独立 token，不算阴影层级）：

```css
--ds-focus-ring: 0 0 0 3px rgba(59,130,246,0.35);
```

仅用于键盘 `:focus-visible`，3px 35% 透明蓝环，符合 WCAG 2.4.7。

---

## 5. 圆角系统（Radius Tokens）

| Token | px | 典型用途 |
|---|---|---|
| `--ds-radius-xs`  | 4   | Tag 小、Checkbox、Radio 内圆点、Skeleton、Code 块 |
| `--ds-radius-sm`  | 6   | 小按钮、Badge 圆角、Tag 默认 |
| `--ds-radius-md`  | 8   | **按钮默认**、输入框、Select 触发器、小卡片 |
| `--ds-radius-lg`  | 12  | **卡片默认**、Modal 中等、Drawer 角落 |
| `--ds-radius-xl`  | 16  | 大卡片、Modal 大、KPI 数字卡 |
| `--ds-radius-2xl` | 24  | 极少用：Banner、Hero 区 |
| `--ds-radius-full`| 9999 | 圆形 Avatar、Badge 圆点、Pagination 当前项 |

**使用规约**：
- 卡片 12，Modal 12-16
- 按钮 8（中等尺寸 6/10 也可，按尺寸梯度）
- 严禁同一元素圆角 4/6/8/12 混用（如同一卡内不同按钮不同圆角）
- `full` 仅用于完全圆形/胶囊

---

## 6. 组件库规格（Component Specs）

> 每个组件给出：变体 / 尺寸 / 颜色 / 字号 / 间距 / 圆角 / 阴影 / 状态 的 Token 组合。
> 全部组件实现位于 `src/components/ui/`，命名 PascalCase 导出。

### 6.1 Button（4 变体 × 3 尺寸 = 12 种）

#### 6.1.1 尺寸（Size）

| Size | 高度 | 水平 padding | 字号 | 字重 | 圆角 | 图标尺寸 |
|---|---|---|---|---|---|---|
| `sm` | 28px | `space-3` (12px) | `--ds-text-sm` (14) | 500 | `--ds-radius-sm` (6) | 14 |
| `md` | 36px | `space-4` (16px) | `--ds-text-base` (16) | 500 | `--ds-radius-md` (8) | 16 |
| `lg` | 44px | `space-5` (20px) | `--ds-text-md` (18) | 500 | `--ds-radius-md` (8) | 18 |

#### 6.1.2 变体（Variant）

| 变体 | 背景 | 文字 | 描边 | Hover 背景 | Active 背景 | 禁用 |
|---|---|---|---|---|---|---|
| **primary** | `--ds-primary-500` | `#ffffff`（3.68:1，仅 Large 接受，建议改用 primary-600 提升可读 — 见下文注） | none | `--ds-primary-600` | `--ds-primary-700` | `--ds-primary-300` + 白字 disabled |
| **secondary** | `--ds-surface-1` | `--ds-primary-700` | 1px `--ds-primary-200` | `--ds-primary-50` | `--ds-primary-100` | 灰底 + neutral-400 文字 |
| **ghost** | transparent | `--ds-primary-600` | none | `--ds-primary-50` | `--ds-primary-100` | neutral-400 文字 |
| **danger** | `--ds-danger-600` | `#ffffff`（4.83:1 AA 通过） | none | `--ds-danger-700` | `#991b1b` | `--ds-danger-300` + 白字 |

> **primary 按钮文字可读性升级建议**：v0.20.0 起 **primary 按钮背景统一从 `--ds-primary-500` 升级为 `--ds-primary-600`**（#2563eb），白字 ratio 升至 5.17 AA 通过。理由：医疗严肃场景下 3.68 在长时间使用中观感偏淡，5.17 更稳重。品牌色 token 仍以 primary-500 为锚点，仅在 solid 按钮场景使用 600。

#### 6.1.3 解剖图

```
┌─────────────────────────────────────┐
│  [icon 16]  Label text              │  md 尺寸: 36×auto, padding 0 16
│                                     │  圆角 8, 字体 16/500
│  ↑ left icon 与文字 gap: space-2    │  shadow: none (无阴影, hover 改 primary-50 底)
└─────────────────────────────────────┘
```

#### 6.1.4 状态

- **Default**：背景 + 文字
- **Hover**：背景 +1 阶（500→600）；transform: none（无缩放）
- **Active/Pressed**：背景 +2 阶；可选 `transform: translateY(0.5px)`
- **Focus**：应用 `--ds-focus-ring`
- **Disabled**：背景 `--ds-neutral-200`，文字 `--ds-neutral-400`，cursor: not-allowed
- **Loading**：内部替换为 Spinner，保留宽度避免抖动

### 6.2 Card

| 部位 | Token |
|---|---|
| 背景 | `--ds-surface-1` |
| 描边 | 1px `--ds-border`（可选，浅色模式可省略） |
| 圆角 | `--ds-radius-lg` (12) |
| 阴影 | 默认 `--ds-shadow-md`，hover `--ds-shadow-lg` |
| 内边距 | `space-5`（20px，标准）/ `space-6`（24px，宽松卡）|
| 标题 | `--ds-style-h3` |
| 副标题/说明 | `--ds-text-sm` + `--ds-neutral-500` |
| 分隔 | `<hr>` 1px `--ds-border`，上下 margin `space-4` |

```
┌──────────────────────────────┐
│  Card Title            [⋮]   │  h-3, 18/600, neutral-800
│  Card subtitle text          │  sm 14/400, neutral-500
│  ──────────────────────────  │  border 1px
│                              │  padding: 24px
│  Card body content...        │  正文 16/400, neutral-700
│                              │
└──────────────────────────────┘
   ↑ shadow-md (4px 6px slate-900 8%)
   ↑ radius 12, bg #fff
```

### 6.3 Input / Textarea

| 部位 | Token |
|---|---|
| 高度 | md=36, sm=28, lg=44（与 Button 对齐）|
| 水平 padding | `space-3` |
| 背景 | `--ds-surface-1` |
| 描边 | 1px `--ds-border-strong` (neutral-300) |
| 圆角 | `--ds-radius-md` (8) |
| 文字 | `--ds-text-base` / neutral-800 |
| 占位符 | `--ds-text-base` / neutral-400 |
| 标签 | 1em 上方 + `space-1` 间距，文字 `--ds-text-sm` / neutral-700 / weight 500 |
| 帮助文字 | 输入框下方 `space-1`，`--ds-text-xs` / neutral-500 |
| 错误文字 | 输入框下方 `space-1`，`--ds-text-xs` / danger-700 |

**状态**：

| 状态 | 描边 | 底色 |
|---|---|---|
| Default | 1px neutral-300 | 白 |
| Hover | 1px neutral-400 | 白 |
| Focus | 2px primary-500 + 3px focus-ring | 白 |
| Error | 1px danger-500（双层 = 2px danger-200 + 1px danger-500） | danger-50 |
| Disabled | 1px neutral-200 | neutral-100，文字 neutral-400 |

**前缀/后缀插槽**：高度与输入框对齐；圆角仅外侧。

### 6.4 Select

| 部位 | Token |
|---|---|
| 触发器 | 同 Input |
| 下拉箭头 | lucide `ChevronDown` size 16，色 neutral-500 |
| 弹出层 | `--ds-surface-1` + `--ds-shadow-lg` + `--ds-radius-md` |
| 列表项高 | 36px |
| 列表项 padding | `space-2 space-3`（8/12） |
| 列表项 hover | `--ds-surface-3` |
| 列表项 selected | `--ds-primary-50` + 文字 `--ds-primary-700` + 左侧 2px primary-500 高亮 |
| 列表项 disabled | 文字 neutral-400，cursor not-allowed |

### 6.5 Modal / Dialog

| 部位 | Token |
|---|---|
| 遮罩 | `rgba(15,23,42,0.5)`（dark 0.7）|
| 容器 | `--ds-surface-1` + `--ds-shadow-xl` + `--ds-radius-lg` (12) |
| 宽度 | sm=384 / md=512 / lg=640 / xl=768 |
| 头 padding | `space-5` |
| 头标题 | `--ds-style-h3` + neutral-800 |
| 头关闭按钮 | 右上角，32×32，icon `X` size 16 |
| 体 padding | `space-5` / `space-6` |
| 脚 padding | `space-4 space-5`，右对齐，与体间有 1px border |
| 最大高度 | 90vh，内部滚动 |

### 6.6 Table

| 部位 | Token |
|---|---|
| 容器 | 圆角 `--ds-radius-md`，外层可选 1px border |
| 背景 | `--ds-surface-1` |
| 表头背景 | `--ds-surface-2` |
| 表头文字 | `--ds-text-sm` / weight 600 / neutral-700 |
| 表头 padding | `space-3 space-4`（12/16）|
| 表头高度 | 40px |
| 行高 | 48px（标准）/ 56px（宽松）|
| 单元格 padding | `space-3 space-4`（12/16）|
| 单元格文字 | `--ds-text-sm` / neutral-700 |
| 数字列 | 等宽字体 `--ds-font-mono` |
| 斑马 | 偶行 `--ds-surface-2`（`#f8fafc`）|
| 行 hover | `--ds-surface-3` |
| 行选中 | 左侧 2px primary-500，背景 `--ds-primary-50` |
| 行边框 | 1px `--ds-border`（行间分隔，不用粗外框）|
| 空态 | 居中、padding `space-12`，文字 neutral-500 |

### 6.7 Badge（数字 / 状态小圆点）

| 变体 | 背景 | 文字 | 形状 |
|---|---|---|---|
| `solid-primary` | `--ds-primary-500` | white | `--ds-radius-full` |
| `solid-success` | `--ds-success-700` | white | `--ds-radius-full` |
| `solid-warning` | `--ds-warning-700` | white | `--ds-radius-full` |
| `solid-danger` | `--ds-danger-600` | white | `--ds-radius-full` |
| `subtle-primary` | `--ds-primary-50` | `--ds-primary-700` | `--ds-radius-sm` (6) |
| `subtle-success` | `--ds-success-50` | `--ds-success-700` | `--ds-radius-sm` |
| `subtle-warning` | `--ds-warning-50` | `--ds-warning-700` | `--ds-radius-sm` |
| `subtle-danger` | `--ds-danger-50` | `--ds-danger-700` | `--ds-radius-sm` |
| `subtle-neutral` | `--ds-neutral-100` | `--ds-neutral-700` | `--ds-radius-sm` |

- 内边距：`space-1 space-2`（纵向 4 / 横向 8）
- 字号：`--ds-text-xs` (12)
- 字重：600
- 高度：圆形 20×20（数字）/ 22px（文字）

### 6.8 Tag（多选 / 筛选标签）

| 部位 | Token |
|---|---|
| 默认背景 | `--ds-neutral-100` |
| 默认文字 | `--ds-neutral-700` |
| 描边 | 1px `--ds-neutral-200` |
| 圆角 | `--ds-radius-sm` (6) |
| 高度 | 24px |
| 字号 | `--ds-text-xs` (12) |
| 内边距 | `space-1 space-2` |
| Hover | 背景 `--ds-neutral-200` |
| Selected | 背景 `--ds-primary-50` + 描边 `--ds-primary-300` + 文字 `--ds-primary-700` |
| Disabled | 背景 `--ds-neutral-50`，文字 `--ds-neutral-400` |
| 关闭按钮 | `X` lucide 12px，点击不影响父点击 |

### 6.9 Avatar

| 尺寸 | 直径 | 字号 | 用途 |
|---|---|---|---|
| `xs` | 24px | 10 | 列表行内嵌 |
| `sm` | 32px | 12 | 评论、表格 |
| `md` | 40px | 14 | 顶栏、卡片 |
| `lg` | 56px | 18 | 详情页头 |
| `xl` | 80px | 28 | 个人资料 |

- 形状：圆形（`--ds-radius-full`）
- 背景：未上传图时用姓名首字 + `--ds-primary-100` 底 + `--ds-primary-700` 文字
- 描边：1px `--ds-surface-1`（贴底时区分）
- 严禁使用 emoji 头像

### 6.10 Tooltip

| 部位 | Token |
|---|---|
| 背景 | `--ds-neutral-900`（dark mode `--ds-neutral-700`）|
| 文字 | `--ds-neutral-0` |
| 字号 | `--ds-text-xs` (12) |
| 内边距 | `space-1 space-2` |
| 圆角 | `--ds-radius-sm` (6) |
| 阴影 | `--ds-shadow-md` |
| 最大宽度 | 240px |
| 箭头 | 4×4 三角形，与背景同色 |
| 出现延迟 | 400ms，消失 100ms |
| 偏移 | 距目标 8px |

### 6.11 Toast / Notification

| 变体 | 左边条 | 背景 | 文字 | 图标（lucide）|
|---|---|---|---|---|
| `info` | 4px `--ds-info-600` | `--ds-surface-1` | neutral-800 | `Info` |
| `success` | 4px `--ds-success-700` | `--ds-surface-1` | neutral-800 | `CheckCircle2` |
| `warning` | 4px `--ds-warning-700` | `--ds-surface-1` | neutral-800 | `AlertTriangle` |
| `error` | 4px `--ds-danger-600` | `--ds-surface-1` | neutral-800 | `XCircle` |

- 位置：右上角，距顶 80px（避开 topbar），距右 24px
- 宽度：360px
- 内边距：`space-4`
- 字号：标题 `--ds-text-sm` 600，描述 `--ds-text-sm` 400 neutral-500
- 圆角：`--ds-radius-md`
- 阴影：`--ds-shadow-lg`
- 自动关闭：info=4s，success=3s，warning=5s，error=6s
- 多条堆叠：纵向间距 12px
- 顶部横幅变体（页面级）：全宽，padding `space-4 space-8`，左 4px 边条 + 图标 + 文案 + 关闭

### 6.12 Progress

| 部位 | Token |
|---|---|
| 轨道 | `--ds-neutral-200`，高度 8px，圆角 full |
| 填充 | `--ds-primary-500`（默认）/ `--ds-success-600`（完成） / `--ds-warning-600`（警告） / `--ds-danger-600`（错误） |
| 填充动画 | `transition: width 400ms ease-out` |
| 文字版 | 标签在条上方 `space-2` |
| 不确定态 | 24% → 76% 滑动循环，1.4s |

### 6.13 Skeleton

| 部位 | Token |
|---|---|
| 基础色 | `--ds-neutral-200` |
| 高光色 | `--ds-neutral-100` |
| 渐变 | `linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)` |
| 背景尺寸 | `200% 100%` |
| 动画 | `skeleton-shimmer 1.4s ease-in-out infinite` |
| 圆角 | 与被占位元素一致（卡片 12 / 文本行 4）|
| 行高占位 | 高度 = 文字 × 1.6（如 14px 文字 → 22px） |

---

## 7. 浅色 + 深色双主题 Token 集

### 7.1 浅色主题（默认）

```css
:root,
[data-theme="light"] {
  /* Brand */
  --ds-primary-50:  #eff6ff;
  --ds-primary-100: #dbeafe;
  --ds-primary-200: #bfdbfe;
  --ds-primary-300: #93c5fd;
  --ds-primary-400: #60a5fa;
  --ds-primary-500: #3b82f6;
  --ds-primary-600: #2563eb;
  --ds-primary-700: #1d4ed8;
  --ds-primary-800: #1e40af;
  --ds-primary-900: #1e3a8a;

  /* Neutral */
  --ds-neutral-0:   #ffffff;
  --ds-neutral-50:  #f8fafc;
  --ds-neutral-100: #f1f5f9;
  --ds-neutral-200: #e2e8f0;
  --ds-neutral-300: #cbd5e1;
  --ds-neutral-400: #94a3b8;
  --ds-neutral-500: #64748b;
  --ds-neutral-600: #475569;
  --ds-neutral-700: #334155;
  --ds-neutral-800: #1e293b;
  --ds-neutral-900: #0f172a;

  /* Semantic */
  --ds-success-50: #f0fdf4; --ds-success-500: #22c55e;
  --ds-success-600: #16a34a; --ds-success-700: #15803d;
  --ds-warning-50: #fffbeb; --ds-warning-500: #f59e0b;
  --ds-warning-600: #d97706; --ds-warning-700: #b45309;
  --ds-danger-50:  #fef2f2; --ds-danger-500:  #ef4444;
  --ds-danger-600: #dc2626; --ds-danger-700:  #b91c1c;
  --ds-info-50:    #eff6ff; --ds-info-500:    #3b82f6;
  --ds-info-600:   #2563eb; --ds-info-700:    #1d4ed8;

  /* Surface */
  --ds-app-bg:        #f0f4f8;
  --ds-surface-1:     #ffffff;
  --ds-surface-2:     #f8fafc;
  --ds-surface-3:     #f1f5f9;
  --ds-surface-sunken:#e2e8f0;
  --ds-border:        #e2e8f0;
  --ds-border-strong: #cbd5e1;

  /* Shadow (light) */
  --ds-shadow-sm: 0 1px 2px 0 rgba(15,23,42,0.06), 0 1px 3px 0 rgba(15,23,42,0.04);
  --ds-shadow-md: 0 4px 6px -1px rgba(15,23,42,0.08), 0 2px 4px -2px rgba(15,23,42,0.05);
  --ds-shadow-lg: 0 10px 15px -3px rgba(15,23,42,0.10), 0 4px 6px -4px rgba(15,23,42,0.05);
  --ds-shadow-xl: 0 20px 25px -5px rgba(15,23,42,0.12), 0 8px 10px -6px rgba(15,23,42,0.06);
  --ds-focus-ring: 0 0 0 3px rgba(59,130,246,0.35);

  /* Business */
  --g003-sidebar-bg:           #1a3a5c;
  --g003-sidebar-text:         #f1f5f9;
  --g003-sidebar-muted:        rgba(255,255,255,0.6);
  --g003-sidebar-active-bg:    rgba(59,130,246,0.18);
  --g003-sidebar-active-border:#60a5fa;
  --g003-topbar-bg:            #ffffff;
  --g003-topbar-shadow:        0 2px 4px rgba(15,23,42,0.06);

  /* Text on color */
  --ds-text-on-primary: #ffffff;
  --ds-text-on-success: #ffffff;
  --ds-text-on-warning: #ffffff;
  --ds-text-on-danger:  #ffffff;
  --ds-text-on-info:    #ffffff;
}
```

### 7.2 深色主题

```css
[data-theme="dark"] {
  /* Brand（蓝紫调，亮度阶梯反转但保持色彩识别）*/
  --ds-primary-50:  #172554;
  --ds-primary-100: #1e3a8a;
  --ds-primary-200: #1e40af;
  --ds-primary-300: #1d4ed8;
  --ds-primary-400: #2563eb;
  --ds-primary-500: #3b82f6;
  --ds-primary-600: #60a5fa;
  --ds-primary-700: #93c5fd;
  --ds-primary-800: #bfdbfe;
  --ds-primary-900: #dbeafe;

  /* Neutral（深底版，色相反转但保留层次）*/
  --ds-neutral-0:   #0b1220;
  --ds-neutral-50:  #111a2e;
  --ds-neutral-100: #1a253f;
  --ds-neutral-200: #243152;
  --ds-neutral-300: #334155;
  --ds-neutral-400: #64748b;
  --ds-neutral-500: #94a3b8;
  --ds-neutral-600: #cbd5e1;
  --ds-neutral-700: #e2e8f0;
  --ds-neutral-800: #f1f5f9;
  --ds-neutral-900: #f8fafc;

  /* Semantic（保留识别色，500 居中，浅文字版供前景）*/
  --ds-success-50: #052e16; --ds-success-500: #22c55e;
  --ds-success-600: #4ade80; --ds-success-700: #86efac;
  --ds-warning-50: #451a03; --ds-warning-500: #f59e0b;
  --ds-warning-600: #fbbf24; --ds-warning-700: #fcd34d;
  --ds-danger-50:  #450a0a; --ds-danger-500:  #ef4444;
  --ds-danger-600: #f87171; --ds-danger-700:  #fca5a5;
  --ds-info-50:    #172554; --ds-info-500:    #3b82f6;
  --ds-info-600:   #60a5fa; --ds-info-700:    #93c5fd;

  /* Surface（推荐层级）*/
  --ds-app-bg:        #0b1220;
  --ds-surface-1:     #111a2e;
  --ds-surface-2:     #1a253f;
  --ds-surface-3:     #243152;
  --ds-surface-sunken:#0b1220;
  --ds-border:        #243152;
  --ds-border-strong: #334155;

  /* Shadow（深色需更深的 rgba）*/
  --ds-shadow-sm: 0 1px 2px 0 rgba(0,0,0,0.3);
  --ds-shadow-md: 0 4px 6px -1px rgba(0,0,0,0.4), 0 2px 4px -2px rgba(0,0,0,0.3);
  --ds-shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.5), 0 4px 6px -4px rgba(0,0,0,0.3);
  --ds-shadow-xl: 0 20px 25px -5px rgba(0,0,0,0.6), 0 8px 10px -6px rgba(0,0,0,0.4);
  --ds-focus-ring: 0 0 0 3px rgba(96,165,250,0.45);

  /* Business */
  --g003-sidebar-bg:           #0a1828;
  --g003-sidebar-text:         #e2e8f0;
  --g003-sidebar-muted:        rgba(255,255,255,0.55);
  --g003-sidebar-active-bg:    rgba(59,130,246,0.22);
  --g003-sidebar-active-border:#93c5fd;
  --g003-topbar-bg:            #111a2e;
  --g003-topbar-shadow:        0 2px 4px rgba(0,0,0,0.4);

  --ds-text-on-primary: #0b1220;
  --ds-text-on-success: #052e16;
  --ds-text-on-warning: #451a03;
  --ds-text-on-danger:  #450a0a;
  --ds-text-on-info:    #0b1220;
}
```

### 7.3 主题切换

```ts
// src/hooks/useTheme.ts
const [theme, setTheme] = useTheme()
useEffect(() => {
  document.documentElement.dataset.theme = theme
}, [theme])
```

默认 `light`，可选 `dark` / `system`（监听 `prefers-color-scheme`）。**v0.20.0 不强制深色**，仅作为 Token 就绪能力，UI 切换器列入 P2 路线图。

---

## 8. 与 lucide-react + recharts 集成建议

### 8.1 图标（lucide-react 保留）

**图标尺寸阶梯**（与文字对齐）：

| Token | px | 搭配字号 |
|---|---|---|
| `--ds-icon-xs` | 12 | `--ds-text-xs` 12 |
| `--ds-icon-sm` | 14 | `--ds-text-sm` 14 / 按钮 sm |
| `--ds-icon-md` | 16 | `--ds-text-base` 16 / 按钮 md / 顶栏 |
| `--ds-icon-lg` | 20 | `--ds-text-lg` 20 / 卡片标题 |
| `--ds-icon-xl` | 24 | `--ds-text-xl` 24 / 区块标题 / 弹窗 |

**图标颜色**：

| 上下文 | 颜色 Token |
|---|---|
| 主操作图标 | `--ds-primary-600` |
| 状态-成功 | `--ds-success-700` |
| 状态-警告 | `--ds-warning-700` |
| 状态-错误 | `--ds-danger-600` |
| 状态-信息 | `--ds-info-600` |
| 普通图标 | `--ds-neutral-500` |
| 禁用 | `--ds-neutral-400` |
| 在深色背景 | `--ds-neutral-0` 或 `--ds-neutral-100` |

**stroke-width**：lucide-react 默认 2，**禁止修改**（保持视觉一致）。**严禁** 1.5（太细不易识别）或 3（过粗显卡通）。

**严禁** 使用 emoji 替代图标（（成功） / 通过 / （重点）️ 等），在 1920×1080 桌面场景下显得粗糙且不可控。

### 8.2 recharts 图表色板

定义 9 色板，从 primary 派生 + 少量 accent（紫/青），**避免使用 Tailwind 默认色板**（10 色随机感重，与品牌不一致）。

```ts
// src/components/charts/palette.ts
export const CHART_PALETTE = {
  primary: [
    'var(--ds-primary-100)',
    'var(--ds-primary-200)',
    'var(--ds-primary-300)',
    'var(--ds-primary-400)',
    'var(--ds-primary-500)',
    'var(--ds-primary-600)',
    'var(--ds-primary-700)',
    'var(--ds-primary-800)',
    'var(--ds-primary-900)',
  ],
  // 多序列（>9）补充
  accent: [
    '#8b5cf6', // violet-500
    '#06b6d4', // cyan-500
    '#10b981', // emerald-500
  ],
  semantic: {
    success: 'var(--ds-success-600)',
    warning: 'var(--ds-warning-600)',
    danger:  'var(--ds-danger-600)',
    info:    'var(--ds-info-600)',
  },
} as const
```

**使用规约**：

| 图表类型 | 配色策略 |
|---|---|
| 单系列面积/折线 | primary-500 描边 + primary-100 填充 30% 透明 |
| 多系列（2-4） | primary-500 / primary-300 / primary-700 / primary-400 顺序 |
| 多系列（5-9） | primary-100 → primary-900 9 色板 |
| 多系列（>9） | primary 9 色 + accent 3 色 = 12 色上限；超过 12 需分组图表 |
| 柱状图（对比基准 vs 当前） | 当前=primary-500，基准=neutral-300 |
| 进度/完成率 | 完成=success-600，未完成=neutral-200 |
| 阈值告警 | 正常=success-600，警戒=warning-600，超限=danger-600 |
| Pie/Donut 切片 | 关键类别=primary-500/700/900，次要=primary-200/400 |

**Tooltip 与 Legend**：

- Tooltip 背景 `--ds-neutral-900`（dark 模式 `--ds-neutral-700`），文字白
- 圆角 `--ds-radius-sm` (6)
- 字号 `--ds-text-xs` (12)
- 内边距 `space-2 space-3`
- 阴影 `--ds-shadow-md`
- Legend：底部/右侧，字号 12，颜色 `neutral-700`，点状图例 8×8 圆

**坐标轴**：

- 轴线颜色 `--ds-border`
- 网格线 1px `--ds-neutral-200`，水平优先，竖直可选
- 轴标签 `--ds-text-xs` / neutral-500
- 轴标题（单位）`--ds-text-xs` / neutral-700

**严禁**：

- `linear-gradient` 填充柱状图（金色渐变病）
- `filter: drop-shadow` 制造光晕
- 默认 `recharts` 蓝橙红绿 4 色（与品牌脱节）
- 3D 效果 / 玻璃态（不符合医疗严谨调性）

### 8.3 与现有内联样式的迁移策略

v0.20.0+ 迁移分 4 阶段：

| 阶段 | 范围 | 工作量 |
|---|---|---|
| 1. Token 落地 | 在 `src/styles/tokens.css` 注入全部 CSS 变量；引入字体 | 1 PR |
| 2. AppShell 重构 | `src/App.tsx` 中 `const s: Record<...>` 替换为 className | 1 PR |
| 3. 通用组件提取 | 从 53 page 中高频模式（Card/KPI/Table 容器/Badge）抽 `<Card> <KpiCard> <TableContainer> <Badge>` 至 `src/components/ui/` | 2-3 PR |
| 4. 页面级迁移 | 逐 page 文件将硬编码颜色/字号/间距替换为 className + var(--ds-*) | 滚动，每 PR 5-8 page |

迁移规约：

- `color: '#3b82f6'` → `color: var(--ds-primary-500)` 或类名 `.text-primary-500`
- `borderRadius: 12` → `border-radius: var(--ds-radius-lg)` 或 `.rounded-lg`
- `boxShadow: '0 1px 3px rgba(0,0,0,0.06)'` → `box-shadow: var(--ds-shadow-sm)`
- `fontSize: 14` → `font-size: var(--ds-text-sm)` 或 `.text-sm`
- 间距一律走 4 倍数：14/22/26 等需要 round 到 12/20/24/28

**类名规范**（推荐 Tailwind 风格自实现，体积 < 5KB）：

```
.text-{xs,sm,base,md,lg,xl,2xl,3xl}
.font-{regular,medium,semibold,bold,black}
.text-{primary,neutral,semantic}-{50-900}
.bg-{surface-{1,2,3},app-bg,primary-{50-900}}
.border-{neutral-{200,300},primary-{300,500}}
.rounded-{xs,sm,md,lg,xl,full}
.shadow-{sm,md,lg,xl}
.p-{0..16}  /  .px-{0..16}  /  .py-{0..16}  /  .m-{0..16}
.gap-{0..16}
```

不引入 Tailwind CSS 框架（增加 ~30KB 与 React 18 内联 style 文化冲突），仅按需写 `src/styles/utilities.css`（手写 ~200 条类），CI 阶段用 `vite-plugin-purgecss` 摇树。

---

## 9. 自检与不通过规则

### 9.1 自检（v0.20.0 引入后每 PR 必跑）

| 检查项 | 工具 | 阈值 |
|---|---|---|
| 颜色对比度 | 自写脚本 `scripts/check-contrast.ts`（遍历所有 Token 组合） | 正文 ≥ 4.5，UI ≥ 3.0 |
| 间距合法性 | ESLint 规则 `no-off-grid-spacing` | 任何 `padding`/`margin`/`gap` 值必须 4 倍数 |
| 颜色硬编码 | ESLint 规则 `no-hardcoded-color` | src/pages/ 与 src/App.tsx 中 `'#xxx'`/`rgb(...)` 仅允许在 `src/styles/tokens.css` 与 `src/components/charts/palette.ts` 出现 |
| 内联 style 残留 | 自写脚本统计 `style={{...}}` 数量 | 每 PR 净减 ≥ 50；不允许新增 |
| 字号阶梯 | 自写脚本 | 任何 `fontSize: N` 的 N 必须 ∈ {12,14,16,18,20,24,30,36} |
| 圆角阶梯 | 自写脚本 | 任何 `borderRadius: N` 的 N 必须 ∈ {4,6,8,12,16,9999} |
| 金色渐变禁用 | ESLint 规则 | 禁止 `linear-gradient` 含 `f59e0b`/`fbbf24`/`fcd34d` 等 |
| emoji 禁用 | ESLint 规则 | `src/**/*.{ts,tsx}` 中 `[\u{1F300}-\u{1FAFF}]` 字符数 = 0 |

### 9.2 设计红线（Code Review 必须 reject）

- 在 1920×1080 设计稿中 viewport `<meta name="viewport" content="width=device-width">`（**保留现状**，锁死桌面）
- 使用 `linear-gradient(180deg, #f59e0b ...)` / `radial-gradient` 制造光晕
- 引用 `3keengames.net` / 任何已失效外链
- 同一元素同时使用 `box-shadow` + `filter: drop-shadow`
- Tag/Badge 文字使用 semantic-500（必须 700 或配白字-700）
- primary 按钮文字使用 primary-500 + 白字（应升级 primary-600 + 白字）
- 表格中纯 emoji 单元格
- 移动端断点 / `@media (max-width: ...)` 适配

---

## 10. Design Token 速查表（单页卡片）

```
┌─ COLOR ───────────────────────────────────────────┐
│ Primary   50 100 200 300 400 500 600 700 800 900   │
│           eff6ff dbeafe bfdbfe 93c5fd 60a5fa      │
│           3b82f6 2563eb 1d4ed8 1e40af 1e3a8a      │
│ Neutral   0/50/100/200/300/400/500/600/700/800/900│
│           fff f8fafc f1f5f9 e2e8f0 cbd5e1 94a3b8  │
│           64748b 475569 334155 1e293b 0f172a      │
│ Semantic  success/warning/danger/info × 50/500/600/700│
└────────────────────────────────────────────────────┘
┌─ TYPOGRAPHY ──────────────────────────────────────┐
│ font-sans: Noto Sans SC → PingFang SC → YaHei      │
│ font-mono: JetBrains Mono → Fira Code              │
│ size: 12 14 16 18 20 24 30 36  (xs..3xl)           │
│ weight: 400 500 600 700 800                        │
│ line-height: 1.5 / 1.6 / 1.4 / 1.3 / 1.2 / 1.1     │
└────────────────────────────────────────────────────┘
┌─ SPACING (4px grid) ───────────────────────────────┐
│ space-{0,1,2,3,4,5,6,7,8,10,12,14,16,20,24}       │
│   0  4  8 12 16 20 24 28 32 40  48  56  64  80  96 │
└────────────────────────────────────────────────────┘
┌─ SHADOW (4 级) ────────────────────────────────────┐
│ sm:  0 1px 2px 0 slate-900 6%                       │
│ md:  0 4px 6px -1px slate-900 8%                    │
│ lg:  0 10px 15px -3px slate-900 10%                 │
│ xl:  0 20px 25px -5px slate-900 12%                 │
└────────────────────────────────────────────────────┘
┌─ RADIUS ───────────────────────────────────────────┐
│ xs 4 / sm 6 / md 8 / lg 12 / xl 16 / 2xl 24 / full 9999│
└────────────────────────────────────────────────────┘
┌─ ICON ─────────────────────────────────────────────┐
│ 12 14 16 20 24  (xs/sm/md/lg/xl)                   │
│ stroke-width: 2（lucide 默认，不改）                │
└────────────────────────────────────────────────────┘
┌─ CHART PALETTE ────────────────────────────────────┐
│ primary[9]: 100/200/300/400/500/600/700/800/900     │
│ accent[3]:  #8b5cf6 #06b6d4 #10b981                 │
│ semantic:   success-600 / warning-600 / danger-600  │
└────────────────────────────────────────────────────┘
```

---

## 11. 落地路径与里程碑

| 版本 | 工作 | 验收 |
|---|---|---|
| v0.20.0-alpha | `src/styles/tokens.css` + `index.html` 字体引入 + `src/components/ui/{Button,Badge,Tag,Card}` 4 个原子组件 | Storybook 截图、Token 速查页可访问 |
| v0.20.0-beta | AppShell 迁移 + `Input/Select/Modal/Toast/Progress/Skeleton` 7 个组件 + 自检脚本 4 条 | AppShell 视觉零变化、所有 page 仍可路由 |
| v0.20.0-rc | 53 page 文件滚动迁移第 1 批（首页/工作台/检查/报告 8 个）| PR 净减内联 style ≥ 400，CI 全绿 |
| v0.20.0 | 完成全部 53 page 迁移 + 深色主题 token 验证 + recharts palette 接入 | 内联 style 残留 ≤ 5%（仅必要动态值如 width/height），`npm run build` 通过，部署到 GitHub Pages |

---

## 12. 附录 A：现状色值 → Token 映射表

| 现状硬编码（v0.19.4） | 出现频次 | 替换为 Token | 备注 |
|---|---|---|---|
| `#1a3a5c` | 590 | `--g003-sidebar-bg` | sidebar 专用 |
| `#1a365d` | 118 | `--g003-sidebar-bg`（合并）| 同一深蓝 |
| `#3b82f6` | 185 | `--ds-primary-500` | 主色锚点 |
| `#2563eb` | 97 | `--ds-primary-600` | hover/正文链接 |
| `#60a5fa` | (低) | `--ds-primary-400` | 激活态描边 |
| `#8b5cf6` | 57 | `--ds-primary-700`（保守）或 accent 紫 | 紫色调统一为蓝紫系 |
| `#64748b` | 835 | `--ds-neutral-500` | 正文次级 |
| `#94a3b8` | 660 | `--ds-neutral-400` | 占位符、次要图标 |
| `#475569` | 209 | `--ds-neutral-600` | 正文 |
| `#334155` | 171 | `--ds-neutral-700` | 强调正文 |
| `#f8fafc` | 301 | `--ds-surface-2` | 卡片次级 |
| `#f1f5f9` | 189 | `--ds-surface-3` | hover 浅底 |
| `#e2e8f0` | 100 | `--ds-border` | 描边 |
| `#16a34a` / `#22c55e` / `#10b981` | 230+160+75 | `--ds-success-{600,500,500}` | success 系列 |
| `#dc2626` / `#ef4444` | 340+133 | `--ds-danger-{600,500}` | danger 系列 |
| `#d97706` / `#f59e0b` / `#f97316` | 157+74+102 | `--ds-warning-{600,500,500}` | warning 系列 |
| `#fef2f2` / `#fee2e2` / `#dcfce7` / `#fef3c7` / `#fff7ed` / `#eff6ff` / `#dbeafe` / `#f0fdf4` | — | `--ds-danger-50/100`、`success-50/100`、`warning-50/100`、`info-50/100` | Tag 浅底 |
| `#fff` | (频繁) | `--ds-surface-1` | 卡片白底 |
| `#4ade80` | (sidebar 激活) | `--g003-sidebar-active-border` → `#60a5fa` | **v0.20.0 蓝紫化** |
| `'linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)'` | skeleton | 保留为 skeleton 专属渐变（已用，不算金色）| OK |

---

## 13. 附录 B：变更对 v0.19.4 的影响

| 影响 | 现状（v0.19.4）| v0.20.0 |
|---|---|---|
| 字体加载 | 仅靠系统字体栈 | 新增 Google Fonts：Noto Sans SC + JetBrains Mono |
| 主题切换 | 不支持 | Token 就绪，UI 切换器 P2 |
| sidebar 激活色 | 绿色 `#4ade80` 卡通感 | 改为 primary-400 `#60a5fa`，专业感对齐 |
| primary 按钮 | `#3b82f6` 底 + 白字 3.68 不达 AA | 升级 `#2563eb` 底 + 白字 5.17 AA |
| Tag 文字 | 偶用 `success-500` `#22c55e` 文字 2.28 不通过 | 统一用 `success-700` `#15803d` 5.02 AA |
| 内联 style | 53 page 100% 内联 | 迁移到 CSS 变量 + 类名，保留少量动态值 |

---

> **维护规约**：本文档随每个版本变更同步更新；Token 增删需在 PR 中附带本文件 diff；任何绕过 Token 直接写色值/字号/间距的 PR 必须在自检中显式豁免并标注原因。
