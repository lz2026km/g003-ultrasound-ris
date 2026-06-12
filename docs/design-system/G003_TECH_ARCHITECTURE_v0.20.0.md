# G003 智慧超声影像信息管理系统 · 技术架构与 UX 基础文档

> **版本**：v0.20.0
> **范围**：CSS 架构、设计 Token、布局框架、响应式策略、组件库选型、主题系统、迁移路径、性能预算
> **适用代码基线**：v0.19.3（53 个 page 文件、100% 内联 React.CSSProperties 样式、零 CSS 文件、零 UI 库、零主题系统）
> **技术栈**：React 18 + Vite 5 + HashRouter + lucide-react + recharts，部署在 GitHub Pages，仓库路径 `/g003-ultrasound-ris/`，开发端口 5193，预览端口 4173
> **主公诉求**：桌面 1920×1080 零移动端，但需要支持窗口缩放 1280–1920；完全自研可控，不引入第三方 UI 库；亮色与暗色双主题并存，且要跟随系统设置
> **文档定位**：本架构文档为总纲，下一步由 `design-ui-designer` 在此基础上产出设计 Token 数值表与组件视觉稿，再由开发侧按本路线图把 53 个 page 从内联样式迁移到统一设计系统

---

## 0. 现状摸底（基线审计）

本章先做一次彻底的代码体检，作为后续所有决策的事实依据。逐项核对仓库现状，得到下表：

| 检查项 | 当前实测值 | 本架构目标值 | 备注与处理建议 |
|---|---|---|---|
| page 文件总数 | 53 | 53 | 按业务模块分批迁移，文件数不变 |
| CSS 文件总数 | 0 | 30 至 40 | 按层（tokens、base、components、pages、layout）拆分 |
| 内联样式占比 | 100% | 低于 10% | 仅保留动态计算样式，如百分比宽度、临时调试样式 |
| Sidebar 实际宽度 | 280 像素（App.tsx） | 260 像素 | 与本架构对齐，需在迁移阶段一并收紧 |
| Topbar 实际高度 | 72 像素（App.tsx） | 56 像素 | 与本架构对齐，需在迁移阶段一并收紧 |
| 主题模式 | 仅亮色 | 亮色、暗色、跟随系统三档 | 新增 ThemeProvider，详见第六章 |
| CSS 变量系统 | 无 | 全量设计 Token | 通过 `src/styles/tokens.css` 单一来源注入 |
| 设计 Token 来源 | 散落在 53 个文件硬编码 | `tokens.css` 加 `tokens.ts` 双源 | TS 侧仅暴露类型与少量常量，不重复定义颜色数值 |
| 部署目标 | GitHub Pages 静态站点 | 同左 | 体积预算极紧，不容许引入 runtime 样式库 |
| 现有第三方依赖 | lucide-react、recharts | 保持不变 | 不引入 styled-components、Tailwind、shadcn-ui |

代码体量上，53 个 page 平均每个约 1140 行，合计约六万行 JSX 与 TSX。其中约 90% 的页面共享四类骨架——数据列表、表单录入、看板大屏、详情抽屉——这是迁移分批的主要依据。设计系统先行落地后，多数样式工作可以借助现成组件复用，单 page 改造量会大幅压缩。

---

## 1. CSS 架构方案

### 1.1 方案选型（决策矩阵）

围绕 CSS 写法与样式归属这一核心问题，列出四个候选方案并横向对比：

| 候选方案 | 开发体验 | 主题切换 | 打包体积 | 与现状契合度 | 学习成本 | 综合推荐 |
|---|---|---|---|---|---|---|
| A. CSS Modules 加原生 CSS 变量 | 优秀 | 优秀 | 最优（无 runtime） | 高（按文件就近） | 低 | 首推 |
| B. 全局 CSS 加 BEM 命名 | 一般 | 良 | 良 | 中（要重写 className） | 中 | 备选 |
| C. Tailwind utility-first | 良 | 良（需配置 darkMode） | 中（PurgeCSS 后中等） | 低（几乎重写所有 className） | 中 | 不推荐 |
| D. CSS-in-JS（styled-components 或 emotion） | 中 | 良 | 差（runtime 约 +12KB） | 低（与现状架构割裂） | 中 | 不推荐 |

**结论：选 A —— CSS Modules 加原生 CSS 变量，主题切换通过 `:root` 与 `data-theme` 属性驱动。**

四项理由如下：

第一，Vite 5 对 CSS Modules 是零配置开箱支持，只要文件名后缀是 `.module.css` 就会自动开启局部作用域。再配合 `localsConvention: 'camelCaseOnly'`，组件里可以直接写 `import styles from './Card.module.css'`、再写 `styles.cardHeader`，命名风格与现有内联 `s.cardHeader` 一致，迁移阻力最小。

第二，53 个 page 当前是内联 JS 对象写法，把这些对象搬到 CSS Module 几乎是「剪切加命名」的工作，diff 最小、最安全，可以做到逐 page 灰度切换。如果改用 Tailwind，意味着每个 className 都要重写、迁移面积膨胀，风险等级完全不同。

第三，CSS 变量天然支持运行时主题切换，没有任何 runtime 开销。相比 styled-components 节省约 12KB gzip，相比 emotion 也至少节省 8KB，对静态部署与体积预算极紧的 G003 项目意义明显。

第四，不引入 utility-first 类库是因为本项目不是通用 SaaS 后台模板，53 个 page 已经使用了大量业务语义命名，如 `examTableRow`、`qcScoreBar`，迁移到 utility 类会让模板可读性崩塌、设计语义丢失。

### 1.2 命名规范：CSS Modules 加局部 BEM 语义名

文件内 `*.module.css` 使用「语义块加修饰符」结构，即局部 BEM 命名约定，不引入全局 BEM 以避免全局污染。举 `Card.module.css` 为例：

```css
/* Card.module.css —— 局部 BEM，作用域仅限于本模块 */
.card            { 背景: var(--bg-surface); 圆角: var(--radius-lg); 阴影: var(--shadow-1); }
.cardHeader      { 内边距: 16px 20px; 下边框: 1px solid var(--border-subtle); }
.cardBody        { 内边距: 20px; }
.card--elevated  { 阴影: var(--shadow-2); }
```

消费侧的 React 组件写法：

```tsx
import 样式表 from './Card.module.css'
<div className={`${样式表.card} ${是否凸起 ? 样式表['card--elevated'] : ''}`}>
  <div className={样式表.cardHeader}>头部</div>
  <div className={样式表.cardBody}>正文</div>
</div>
```

**为什么不上 utility-first**：本项目里 53 个 page 大量使用业务语义命名（如考试表行、质量控制评分条），utility 类会让模板可读性崩塌、迁移面积膨胀。语义化的 CSS Module 更适合医疗系统这类业务域专一的场景。

### 1.3 Vite 配置（最小改动）

`vite.config.ts` 文件新增 `css` 字段：

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/g003-ultrasound-ris/',
  server: { host: true, port: 5193 },
  css: {
    modules: {
      // 驼峰命名兼容内联样式的 React 风格
      localsConvention: 'camelCaseOnly',
      // 生成稳定的可读类名，便于 DevTools 调试
      generateScopedName: '[name]__[local]___[hash:base64:5]'
    },
    devSourcemap: true
  },
  build: {
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-lucide': ['lucide-react'],
          'vendor-charts': ['recharts']
        }
      }
    }
  }
})
```

### 1.4 文件组织

迁移完成后，目录结构如下所示。`src/styles/` 负责全局样式与设计 Token，`src/components/ui/` 沉淀 10 个通用 UI 原子，`src/layouts/` 负责应用壳布局，`src/theme/` 负责主题切换，`src/pages/` 保留 53 个业务 page 不动文件名，只把内部样式从内联改为 CSS Module 引用。

```
src/
├── styles/                          # 全局样式与设计 Token
│   ├── tokens.css                   # CSS 变量：颜色、间距、字号、阴影、圆角
│   ├── tokens.ts                    # TS 类型与常量镜像（用于动态计算）
│   ├── reset.css                    # 极简 reset：盒模型、外边距、字体家族
│   ├── base.css                     # 全局基线：body、滚动条、focus-visible、选区颜色
│   ├── animations.css               # 全局关键帧：skeleton-shimmer、fade-in、slide-up
│   ├── utilities.css                # 少量工具类：visually-hidden、truncate、sr-only
│   └── index.css                    # 聚合入口，被 main.tsx 一并引入
├── components/
│   └── ui/                          # 通用 UI 原子（详见第五章）
│       ├── Button/                  # 按钮：主、次、危险、链接四型
│       │   ├── Button.tsx
│       │   ├── Button.module.css
│       │   └── index.ts
│       ├── Card/                    # 卡片容器
│       ├── Table/                   # 表格（含固定列、斑马纹）
│       ├── Modal/                   # 模态对话框
│       ├── Tag/                     # 状态标签
│       ├── Skeleton/                # 骨架屏
│       ├── Empty/                   # 空状态
│       ├── Drawer/                  # 抽屉
│       ├── Tabs/                    # 标签页
│       ├── Form/                    # 表单域集合
│       └── StatCard/                # KPI 卡片（医疗看板专用）
├── layouts/                         # 应用壳布局
│   ├── AppLayout.tsx                # 主壳：Sidebar 加 Topbar 加 Content
│   ├── AppLayout.module.css
│   ├── Sidebar.tsx                  # 左侧导航（260 像素）
│   ├── Sidebar.module.css
│   ├── Topbar.tsx                   # 顶部栏（56 像素）
│   ├── Topbar.module.css
│   └── ContentGrid.tsx              # page 内网格容器（详见第三章）
├── theme/                           # 主题系统
│   ├── ThemeProvider.tsx            # Context 注入加 localStorage 加系统主题监听
│   ├── useTheme.ts                  # 消费侧 hook
│   └── theme.ts                     # 类型与常量定义
├── pages/                           # 53 个 page 文件，按第七章分批迁移
└── 其他既有目录：App.tsx、main.tsx、types/、data/、ai-imaging/、ai-stream/
```

文件量预估：迁移完成后，`src/styles/` 约 6 个文件、`src/components/ui/` 约 10 组件乘以 3 文件共 30 个、`src/layouts/` 约 8 个文件，合计新增约 44 个源文件，加上 53 个 page 各产出 1 个同名 `.module.css`，总文件数约 +97，但 90% 都是体量很小的纯样式文件。

---

## 2. 设计 Token 注入方案

### 2.1 Token 分层

设计 Token 从抽象到具体分为四层，便于维护与扩展：

第一层 **Primitive（原始值）**：定义所有原子级别的颜色、间距、字号、圆角、阴影数值，命名以色阶或功能命名，如 `--color-slate-500`、`--space-4`。

第二层 **Semantic（语义层）**：把原始值映射为语义变量，组件代码只引用语义层，如 `--bg-surface`、`--text-primary`、`--status-success`。

第三层 **Component（组件层）**：在 `*.module.css` 中用语义 Token 组合出具体组件样式，如 `Card` 用 `--bg-surface` 加 `--radius-lg` 加 `--shadow-1` 组合而成。

第四层 **Page Override（页面覆盖）**：用 CSS Module 的局部类覆盖组件层，不污染全局。

**全局只暴露前两层作为 CSS 变量**，第三层在组件 CSS Module 内组合，第四层在 page CSS Module 内组合。

### 2.2 `src/styles/tokens.css`（单一来源，示例节选）

```css
/* === 第一层 Primitive：原始值，组件代码不直接使用 === */
:root {
  --color-slate-50:  #f8fafc;
  --color-slate-100: #f1f5f9;
  --color-slate-200: #e2e8f0;
  --color-slate-400: #94a3b8;
  --color-slate-500: #64748b;
  --color-slate-700: #334155;
  --color-slate-900: #0f172a;

  --color-blue-50:  #eff6ff;
  --color-blue-500: #3b82f6;
  --color-blue-700: #1d4ed8;

  --color-green-500: #22c55e;
  --color-amber-500: #f59e0b;
  --color-red-500:   #ef4444;

  /* 医疗品牌色（沿用 App.tsx 中的深海蓝） */
  --brand-deep:      #1a3a5c;
  --brand-accent:    #4ade80;
  --brand-deep-soft: #2a4a6c;

  /* 间距 scale，4 像素基线 */
  --space-1: 4px;   --space-2: 8px;   --space-3: 12px;
  --space-4: 16px;  --space-5: 20px;  --space-6: 24px;
  --space-8: 32px;  --space-10: 40px; --space-12: 48px;

  /* 字号 */
  --text-xs: 12px;  --text-sm: 13px; --text-base: 14px;
  --text-md: 15px;  --text-lg: 16px; --text-xl: 18px;
  --text-2xl: 20px; --text-3xl: 24px; --text-4xl: 28px;

  /* 圆角 */
  --radius-sm: 4px; --radius-md: 6px; --radius-lg: 8px;
  --radius-xl: 12px; --radius-2xl: 16px;

  /* 阴影 */
  --shadow-1: 0 1px 3px rgba(15,23,42,0.06);
  --shadow-2: 0 2px 6px rgba(15,23,42,0.08), 0 4px 12px rgba(15,23,42,0.04);
  --shadow-3: 0 8px 24px rgba(15,23,42,0.12);
}

/* === 第二层 Semantic：语义层，组件代码只引用这一层 === */
:root,
:root[data-theme='light'] {
  --bg-app:        var(--color-slate-50);
  --bg-surface:    #ffffff;
  --bg-surface-2:  #f8fafc;
  --bg-sidebar:    var(--brand-deep);
  --bg-topbar:     #ffffff;

  --text-primary:   var(--color-slate-900);
  --text-secondary: var(--color-slate-500);
  --text-tertiary:  var(--color-slate-400);
  --text-on-brand:  #ffffff;

  --border-subtle: var(--color-slate-200);
  --border-strong: #cbd5e1;

  --status-success: var(--color-green-500);
  --status-warning: var(--color-amber-500);
  --status-danger:  var(--color-red-500);
  --status-info:    var(--color-blue-500);
}

:root[data-theme='dark'] {
  --bg-app:        #0b1220;
  --bg-surface:    #111a2c;
  --bg-surface-2:  #0f1729;
  --bg-sidebar:    #060d1a;
  --bg-topbar:     #0f1729;

  --text-primary:   #e2e8f0;
  --text-secondary: #94a3b8;
  --text-tertiary:  #64748b;
  --text-on-brand:  #ffffff;

  --border-subtle: #1e293b;
  --border-strong: #334155;

  --status-success: #4ade80;
  --status-warning: #fbbf24;
  --status-danger:  #f87171;
  --status-info:    #60a5fa;

  --shadow-1: 0 1px 3px rgba(0,0,0,0.4);
  --shadow-2: 0 2px 6px rgba(0,0,0,0.5);
  --shadow-3: 0 8px 24px rgba(0,0,0,0.6);
}

/* 主题切换平滑过渡（关闭首屏） */
@media (prefers-reduced-motion: no-preference) {
  :root.theme-ready * {
    transition: background-color 200ms ease, color 200ms ease, border-color 200ms ease;
  }
}
```

### 2.3 `src/styles/tokens.ts`（TS 镜像，仅用于运行时动态计算）

TypeScript 侧只暴露类型与运行时需要的常量（断点、布局尺寸），**不重复定义颜色数值**，避免双源同步成本。

```ts
// 单一来源：与 tokens.css 同步，CI 加 lint 校验数值一致
export const 间距 = {
  s1: 4, s2: 8, s3: 12, s4: 16, s5: 20, s6: 24, s8: 32, s10: 40, s12: 48
} as const

export const 断点 = {
  xl1280: 1280, xl1440: 1440, xl1680: 1680, xl1920: 1920
} as const

export type 断点键 = keyof typeof 断点

// 仅供内联 style 的动态计算，如 recharts 的 width、height 比例
export const 布局 = {
  侧边栏宽度: 260,
  顶栏高度: 56,
  内容内边距: 32
} as const
```

### 2.4 入口装载（`src/main.tsx`）

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider } from './theme/ThemeProvider'
import './styles/index.css'   // tokens 加 reset 加 base 加 animations 加 utilities
import 应用 from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <应用 />
    </ThemeProvider>
  </React.StrictMode>
)
```

### 2.5 为什么坚持 CSS 变量方案

CSS 变量有三个独特优势是 styled-components 与 emotion 这类 CSS-in-JS 方案不具备的：第一，零运行时开销，不增加包体积；第二，浏览器原生级联，主题切换时无需触发 React 重新渲染；第三，可以直接在浏览器 DevTools 中实时修改变量值，便于设计调试。这三点对于追求极简部署与极致调试体验的 G003 项目至关重要。

---

## 3. 布局框架

### 3.1 全局壳结构（AppLayout）

整个应用采用医疗信息系统经典的三段式布局：左侧固定 Sidebar 导航加右侧主区域，主区域顶端是 Topbar 顶栏、下方是 Content 主内容区。Sidebar 宽度固定 260 像素，Topbar 高度固定 56 像素，Content 区域自适应填充剩余空间。

```
┌─────────────────────────────────────────────────────────────┐
│ Sidebar  │  Topbar（高度 56）                                │
│ 宽 260   ├──────────────────────────────────────────────────┤
│ 固定定位  │                                                  │
│ 高度满屏  │  Content（内边距 32，自适应主区域）               │
│          │  ┌────────────────────────────────────────────┐  │
│          │  │ Page Header（标题加操作区）                 │  │
│          │  ├────────────────────────────────────────────┤  │
│          │  │ Page Body（ContentGrid，按 page 类型变化）   │  │
│          │  └────────────────────────────────────────────┘  │
│          │                                                  │
└──────────┴──────────────────────────────────────────────────┘
```

CSS Grid 写法（`AppLayout.module.css`）：

```css
.shell {
  display: grid;
  grid-template-columns: var(--layout-sidebar, 260px) 1fr;
  grid-template-rows: var(--layout-topbar, 56px) 1fr;
  grid-template-areas:
    'sidebar topbar'
    'sidebar main';
  min-height: 100vh;
  background: var(--bg-app);
}
.sidebar { grid-area: sidebar; background: var(--bg-sidebar); }
.topbar  { grid-area: topbar;  background: var(--bg-topbar); }
.main    { grid-area: main;    overflow: auto; padding: var(--space-8); }
```

**特别说明**：当前 `App.tsx` 中 Sidebar 是 280 像素、Topbar 是 72 像素，与本架构规定的 260 加 56 不一致。迁移阶段必须同步收紧，否则会与 ContentGrid 的列宽计算基准错位，导致看板类 page 在 1280 宽屏出现横向滚动条。Sidebar 内容已留 24 像素内边距，260 足够承载现有菜单文字。

### 3.2 Page ContentGrid 模板（按 page 类型分四种）

53 个 page 按 UI 骨架归为四类，每类对应一个 ContentGrid 模板：

**类型 A：数据列表**（如 PatientPage、ExamPage、ReportPage）。结构为「筛选条件条 + 数据表格 + 分页器」，网格采用「顶部筛选条 + 底部表格 + 分页器」三行布局，行内自动铺满。

**类型 B：表单录入**（如 ReportWritePage、AppointmentPage）。结构为「步骤条 + 表单 + 操作按钮」，网格采用「顶部步骤条 + 中部表单 + 底部操作栏」三行布局。

**类型 C：看板大屏**（如 DashboardPage、OperationsCenterPage）。结构为「KPI 行 + 多分栏图表」，网格采用 12 至 16 列响应式网格，KPI 行占满，下方图表按权重跨列。

**类型 D：详情加侧栏**（如 DicomViewerPage、ReportWritePagePro）。结构为「主显示区 + 右侧抽屉」，网格采用「1fr 360px」两列布局。

以看板型为例（`ContentGrid.module.css`）：

```css
.dashboard {
  display: grid;
  gap: var(--space-6);
  grid-template-columns: repeat(12, 1fr);
  grid-auto-rows: minmax(80px, auto);
}
.kpiRow      { grid-column: span 12; display: grid; gap: var(--space-4);
               grid-template-columns: repeat(4, 1fr); }
.chartMain   { grid-column: span 8; min-height: 360px; }
.chartSide   { grid-column: span 4; min-height: 360px; }
.listWide    { grid-column: span 12; }

/* 1680 宽屏：四列 KPI → 六列 KPI */
@media (min-width: 1680px) {
  .kpiRow { grid-template-columns: repeat(6, 1fr); }
}
/* 1440 紧凑：折线图与饼图 6/6 平分 */
@media (max-width: 1679px) {
  .chartMain { grid-column: span 6; }
  .chartSide { grid-column: span 6; }
}
```

---

## 4. 响应式策略

### 4.1 约束与目标

主公的硬性约束是「桌面 1920×1080 零移动端」，即不设计任何 768 像素以下的视口。但同时要求支持窗口缩放 1280 至 1920 共四档，必须保证四档下均可读、不溢出、布局合理。窗口拖动时要实时重排，不应出现横向滚动条（除非 page 本身是表格且已用列固定功能）。

### 4.2 四档断点详细策略

| 断点范围 | 名称 | ContentGrid 列数 | Sidebar 宽 | KPI 行 | 表格密度 |
|---|---|---|---|---|---|
| 1280 至 1439 | 紧凑 | 12 | 260 像素 | 4 列 | 紧凑（内边距 12） |
| 1440 至 1679 | 标准 | 12 | 260 像素 | 4 列 | 标准（内边距 16） |
| 1680 至 1919 | 舒适 | 16 | 260 像素 | 6 列 | 宽松（内边距 20） |
| 1920 及以上 | 宽屏 | 16 | 260 像素 | 6 列 | 宽松（最大内容宽度 1600，居中） |

### 4.3 容器策略

主内容容器使用 `max-width: 100%; width: 100%`，横向靠 Sidebar 撑开的主区自动占满。宽屏居中方面，在 `@media (min-width: 1920px)` 时，ContentGrid 内层包一层 `max-width: 1600px; margin: 0 auto`，防止 8K 屏或超宽屏把内容过度拉宽到难以阅读。表格方面，`<table>` 设 `table-layout: fixed`，关键列（如操作列、状态列）固定宽度，其余 `min-width: 0` 自适应；横向滚动交由表格自带 `overflow-x: auto` 包裹的 div 处理。recharts 图表方面，所有图表用 `<ResponsiveContainer width="100%" height={320}>` 包裹，外层 `.chartBox` 设 `min-width: 0`，防止 grid 子项把容器撑大导致图表绘制异常。

### 4.4 断点变量与写法

`tokens.css` 中暴露断点变量，仅供 JavaScript 读取（如 recharts 动态尺寸计算）：

```css
:root {
  --bp-compact: 1280px;
  --bp-standard: 1440px;
  --bp-comfortable: 1680px;
  --bp-wide: 1920px;
}
```

CSS Module 中统一使用 `min-width`（移动优先的反向——「桌面优先向上扩展」），保证 1280 也能正常渲染，向 1920 加列加密度：

```css
@media (min-width: 1680px) { /* 加列与加密度 */ }
@media (min-width: 1920px) { /* 内容居中与最大宽度 */ }
```

---

## 5. 组件库选型建议

### 5.1 决策矩阵（四个候选）

围绕组件库来源，列出四个候选并对比：

| 候选方案 | 迁移成本 | 包体积 | 主题切换 | 与主公「自研可控」诉求 | 长期维护 | 综合推荐 |
|---|---|---|---|---|---|---|
| A. 手写 UI 原子加 CSS Modules | 最低（搬运） | 最优（零依赖） | 优秀 | 最契合 | 良 | 首推 |
| B. styled-components 库 | 高（重写） | 差（+12KB runtime） | 良 | 低 | 中 | 不推荐 |
| C. 复制 shadcn-ui 源码 | 中（按需取） | 良（按需打包） | 优秀（CSS 变量原生） | 良 | 中 | 可选 |
| D. 完全自研 CSS Variables 体系加类 Tailwind 工具类 | 高（重写） | 良 | 优秀 | 最契合 | 良 | 备选 |

### 5.2 推荐方案：A —— 手写 UI 原子加 CSS Modules

推荐理由有四：

第一，**与现状契合度最高**。53 个 page 已经实现了等价 UI（Button、Card、Table、Modal、Tag、Skeleton、Empty、Drawer、Tabs、Form），只是用内联样式写的。把这些内联样式抽到 `src/components/ui/` 的同名组件，几乎是「代码剪切 + 包一层 CSS Module」的工作量。

第二，**零新增依赖**。与 GitHub Pages 静态部署、极致体积预算（CSS 总体积小于 50KB gzip）匹配。shadcn-ui 复制版虽好，但会引入 Radix 依赖（dialog、dropdown 等无障碍底层），与 53 个 page 自有实现存在功能重叠，引入后还需要逐个替换 Radix 与自家实现的对应关系。

第三，**主公「完全自研可控」**。主公在 README 中明确声明不引入第三方 UI 库，且多次强调技术栈必须可控可读。手写组件把样式彻底锁在自家仓库，可读性与可改性最强。

第四，**主题切换零成本**。CSS 变量驱动，所有组件直接 `color: var(--text-primary)`，比 styled-components 的 ThemeProvider 方案更轻、调试更直观。

### 5.3 十个 UI 原子组件的首批清单

按优先级分两批落地：

**P0 优先级（首批必出）**：Button（按钮）、Card（卡片）、Table（表格含固定列）、Tag 与 Badge（标签）、Modal（模态框）、Drawer（抽屉）、Skeleton（骨架屏）。这七个组件覆盖 80% 的样式复用需求。

**P1 优先级（次批出）**：Empty（空状态）、Tabs（标签页）、Form（表单域集合）、StatCard（KPI 卡片）。这四个组件主要用于看板与表单 page。

### 5.4 何时考虑 C 方案（复制 shadcn-ui）

仅当未来需要「复杂交互组件」（如 Combobox、Command 调色板、DateRangePicker、Popover 等）且自写工作量超过两人日时，再按需复制 shadcn 源文件并替换为自家 tokens。本期 v0.20.0 不引入。

---

## 6. 主题系统实现

### 6.1 主题模型

```ts
// src/theme/theme.ts
export type 主题模式 = 'light' | 'dark' | 'system'
export type 实际主题 = 'light' | 'dark'

export interface 主题上下文值 {
  模式: 主题模式           // 用户选择的模式，含 system
  实际: 实际主题           // 实际生效的主题
  设置模式: (m: 主题模式) => void
  切换: () => void         // light 与 dark 二选一切换（不进入 system）
}
```

### 6.2 `ThemeProvider.tsx` 完整实现

```tsx
import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { 主题模式, 实际主题, 主题上下文值 } from './theme'

export const ThemeContext = createContext<主题上下文值 | null>(null)

const 存储键 = 'g003.theme'

function 获取系统主题(): 实际主题 {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function 应用主题(实际: 实际主题) {
  const 根 = document.documentElement
  根.setAttribute('data-theme', 实际)
  根.classList.add('theme-ready')
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [模式, 设置模式状态] = useState<主题模式>(() => {
    if (typeof window === 'undefined') return 'light'
    return (localStorage.getItem(存储键) as 主题模式) || 'system'
  })
  const [系统主题, 设置系统主题] = useState<实际主题>(获取系统主题)

  // 监听系统主题变化
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (e: MediaQueryListEvent) => 设置系统主题(e.matches ? 'dark' : 'light')
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const 实际: 实际主题 = 模式 === 'system' ? 系统主题 : 模式

  useEffect(() => {
    应用主题(实际)
  }, [实际])

  const 设置模式 = useCallback((m: 主题模式) => {
    设置模式状态(m)
    try { localStorage.setItem(存储键, m) } catch {}
  }, [])

  const 切换 = useCallback(() => {
    设置模式(实际 === 'dark' ? 'light' : 'dark')
  }, [实际, 设置模式])

  const 值 = useMemo<主题上下文值>(() => ({ 模式, 实际, 设置模式, 切换 }),
    [模式, 实际, 设置模式, 切换])

  return <ThemeContext.Provider value={值}>{children}</ThemeContext.Provider>
}
```

### 6.3 `useTheme.ts` 消费侧 hook

```ts
import { useContext } from 'react'
import { ThemeContext } from './ThemeProvider'

export function useTheme() {
  const 上下文 = useContext(ThemeContext)
  if (!上下文) throw new Error('useTheme 必须在 ThemeProvider 内使用')
  return 上下文
}
```

### 6.4 防首屏闪烁（`index.html` 内联脚本）

在 `index.html` 的 `<head>` 中、`<link>` 之前插入一段同步执行的脚本，在 CSS 加载前先把 `data-theme` 属性写到 `<html>` 元素上，避免出现「亮色一闪再变暗」的视觉跳变。

```html
<script>
  (function () {
    try {
      var 模式 = localStorage.getItem('g003.theme') || 'system';
      var 实际 = 模式 === 'system'
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : 模式;
      document.documentElement.setAttribute('data-theme', 实际);
    } catch (异常) { /* localStorage 不可用时静默降级 */ }
  })();
</script>
```

### 6.5 切换入口（Topbar 右上角）

```tsx
import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '@/theme/useTheme'

export function 主题切换器() {
  const { 模式, 设置模式, 实际 } = useTheme()
  return (
    <div role="radiogroup" aria-label="主题切换" style={{ display: 'flex', gap: 4 }}>
      <button aria-checked={模式 === 'light'} onClick={() => 设置模式('light')}>
        <Sun size={16} />
      </button>
      <button aria-checked={模式 === 'dark'} onClick={() => 设置模式('dark')}>
        <Moon size={16} />
      </button>
      <button aria-checked={模式 === 'system'} onClick={() => 设置模式('system')}>
        <Monitor size={16} />
      </button>
    </div>
  )
}
```

### 6.6 与 recharts 协同

recharts 的 SVG 元素颜色不会自动读取 CSS 变量，需要通过 `<ChartContainer theme={实际}>` 包裹层把变量值作为 props 传入，封装在 `components/charts/ChartContainer.tsx` 内，业务 page 无感知。封装思路是用 `getComputedStyle(document.documentElement).getPropertyValue('--status-success')` 在主题切换时重新读取，触发 recharts 重绘。

---

## 7. 迁移路径（关键 · 五阶段路线图）

### 7.1 路线图总览

把 53 个 page 的迁移工作拆成五个阶段，按风险由低到高、由基础设施到业务逐步推进。每阶段独立部署、独立回滚，确保任何一阶段出问题都不阻塞整体进度。

| 阶段 | 新增文件数 | 范围 | 工期 | 风险 | 回滚方案 |
|---|---|---|---|---|---|
| P0 基础设施 | 8 文件 | tokens、theme、layout、4 个 UI 原子 | 3 工作日 | 低 | 移除新增文件，不改任何 page |
| P1 高频低风险 | 10 page | 列表加表单骨架类 page | 4 工作日 | 低 | 单 page 文件 git revert |
| P2 中频 | 12 page | 看板、详情、Drawer 类 | 5 工作日 | 中 | 章节切换，单 page revert |
| P3 低频加重型 | 13 page | DICOM、报告工作站、远程超声 | 6 工作日 | 中高 | 特性开关 `__USE_NEW_STYLE__` |
| P4 长尾加收尾 | 10 page | 长尾 page、删内联 style 残骸、性能验证 | 3 工作日 | 低 | 单文件 revert |

**合计**：53 个 page 分 4 批（10、12、13、10）加 1 批基础设施共 5 阶段，21 工作日，约一个月内可完成全部迁移。

### 7.2 P0 阶段：基础设施（8 文件，3 天，低风险）

**新增文件清单**：

第一，`src/styles/tokens.css` —— 全部设计 Token 的 CSS 变量定义。第二，`src/styles/tokens.ts` —— TypeScript 镜像，仅暴露断点与布局尺寸常量。第三，`src/styles/reset.css`、`base.css`、`animations.css`、`utilities.css`、`index.css` —— 五个样式入口文件。第四，`src/theme/theme.ts`、`ThemeProvider.tsx`、`useTheme.ts` —— 主题系统三件套。第五，`src/layouts/AppLayout.tsx` 加 `AppLayout.module.css` —— 应用主壳。第六，`src/layouts/Sidebar.tsx` 加 `Sidebar.module.css` —— 同步把宽度从 280 收紧到 260。第七，`src/layouts/Topbar.tsx` 加 `Topbar.module.css` —— 同步把高度从 72 收紧到 56。第八，`src/layouts/ContentGrid.tsx` 加 `ContentGrid.module.css` —— page 内网格容器。第九，`src/components/ui/Button`、`Card`、`Table`、`Skeleton` 四个原子组件各 3 文件。

**入口改造**：`src/App.tsx` 从 515 行（手写内联样式）改为薄壳，仅渲染 `<AppLayout>` 与路由表；`src/main.tsx` 包 `<ThemeProvider>`；`index.html` 加防闪烁脚本。

**回滚方案**：本阶段不修改任何 page 文件，基础设施是「平行引入」。如发现问题，删除新增文件、`App.tsx` 还原到 `git HEAD` 即可完全回退，对业务零影响。

**验证标准**：打开任意 page，肉眼视觉与重构前一致（误差控制在 2 像素以内）；Sidebar 收紧到 260 后原布局不变形；暗色主题切换流畅无闪烁。

### 7.3 P1 阶段：高频低风险 10 page（4 天，低风险）

**page 清单**（按 page 行数从少到多排序，便于逐步验证）：

第一，`HomePage.tsx`。第二，`WorklistPage.tsx`。第三，`AuditPage.tsx`。第四，`AuthorityPage.tsx`。第五，`DictionaryPage.tsx`。第六，`EducationPage.tsx`。第七，`TrainingPage.tsx`。第八，`TrainingExamPage.tsx`。第九，`PreOpPage.tsx`。第十，`MaterialsPage.tsx`。

**单 page 迁移步骤**：

第一步，把文件底部 `const s: Record<string, React.CSSProperties> = {...}` 中样式按用途分组，分为布局类、排版类、颜色类、表格类四组。第二步，创建 `PageName.module.css`，把每条样式抄成 CSS Module 类，`React.CSSProperties` 转为普通 CSS 属性。第三步，在 page 顶部 `import s from './PageName.module.css'`，把所有 `style={s.xxx}` 替换为 `className={s.xxx}`。第四步，颜色、间距、字号硬编码值同步替换为 `var(--xxx)` Token。第五步，删除原 `const s` 块。

**回滚方案**：`git revert` 单 page 文件即可，每 page 独立 commit，粒度精确到文件。

### 7.4 P2 阶段：中频 12 page（5 天，中风险）

**page 清单**：

第一，`DashboardPage.tsx`（看板模板原点）。第二，`OperationsCenterPage.tsx`。第三，`StatisticsPage.tsx`。第四，`StatsEnhancedPage.tsx`。第五，`ExamFlowPage.tsx`。第六，`CostAnalysisPage.tsx`。第七，`InsuranceAuditPage.tsx`。第八，`MedicalAuditPage.tsx`。第九，`DRGDIPPage.tsx`。第十，`NationalReportPage.tsx`。第十一，`DataReportCenterPage.tsx`。第十二，`QCPage.tsx` 加 `ReportQCPage.tsx`（合并为一批）。

**风险点**：recharts 主题适配需在本阶段完成（`ChartContainer` 组件落地）。如发现 1680 断点 KPI 行拥挤，回退到 4 列布局即可。

**回滚方案**：批次内 `git revert` 全部 12 个 commit；同时启用特性开关 `__USE_NEW_STYLE__` 包裹 ContentGrid 类名（仅 P2 及之后启用），如出问题可一键关闭。

### 7.5 P3 阶段：低频加重型 13 page（6 天，中高风险）

**page 清单**：

第一，`DicomViewerPage.tsx`（canvas 加测量工具）。第二，`ReportWritePagePro.tsx`（专业报告工作站）。第三，`ReportWritePage.tsx` 加 `ReportPage.tsx`。第四，`RemoteUltrasoundPage.tsx`（WebRTC 加 5G）。第五，`RemoteConsultationPage.tsx`。第六，`ConsultationPage.tsx`。第七，`CriticalValuePage.tsx` 加 `CriticalAlertPage.tsx`。第八，`ImagePage.tsx` 加 `ImagingModesPage.tsx`。第九，`UltrasoundModesPage.tsx`。第十，`UltrasoundPage.tsx`（1580 行，重型 page）。第十一，`ProbeManagementPage.tsx` 加 `EquipmentLifecyclePage.tsx`。第十二，`WorkOrderPage.tsx` 加 `DisinfectionPage.tsx` 加 `DisinfectionTracePage.tsx`。第十三，`InfectionPage.tsx` 加 `FollowUpPage.tsx` 加 `NursingPage.tsx`。

**风险点**：DicomViewer 的 canvas 测量覆层、ReportWrite 的富文本编辑器工具栏，这些组件不能用纯 CSS Module，需要局部内联 style 兜底（保留 `style={}` 不迁移，并在代码注释中说明原因）。这些是预期内的「无法迁移」点，不算遗留问题。

**回滚方案**：单 page revert；如 Pro 报告工作站的 CSS Modules 命名冲突（与基础组件同名），按需添加 page 级前缀如 `reportWriteProCard`。

### 7.6 P4 阶段：长尾 10 page 加收尾（3 天，低风险）

**page 清单**：

第一，`PatientPage.tsx`。第二，`AppointmentPage.tsx`。第三，`ExamPage.tsx`。第四，`CriticalAlertPage.tsx`（如未在 P3 完成）。第五，`TermLibraryPage.tsx`。第六，`TemplatePage.tsx`。第七，`ResearchPage.tsx`。第八，`QueueCallPage.tsx`。第九，`AIQCPage.tsx`。第十，`ReportQCPage.tsx`（如未在 P2 完成）。

**收尾工作**：

第一，全仓 grep `React.CSSProperties` 残留，剩余只允许在三类场景中存在：动态计算样式（如 `width: \`${百分比}%\``）、canvas 与 SVG 注入、第三方组件库要求的 style prop。第二，运行 `vite build` 验证总 CSS 小于 50KB gzip。第三，Lighthouse 跑 Desktop 性能分，验证 TTI 小于 2 秒。第四，删除迁移期间的所有临时注释与调试代码。第五，更新 README，新增「设计系统」章节。第六，更新 CHANGELOG，标记 v0.20.0 发布。

### 7.7 提交与发布策略

每 page 一个 commit，commit 信息遵循 `refactor(migrate): <PageName> to CSS Modules + tokens` 格式。每阶段结束打 tag，命名 `v0.20.0-p0`、`v0.20.0-p1` 直至 `v0.20.0-p4`。GitHub Pages 部署节奏：P0 部署一次（仅壳变化，肉眼无差），P1 后部署一次，P2 后部署一次，P3 后灰度，P4 后正式发布 v0.20.0 正式版。

---

## 8. 性能预算

### 8.1 预算基线

| 指标 | 目标值 | 测量工具 | 触发条件 |
|---|---|---|---|
| CSS 总体积（gzip 后） | 小于 50KB | `vite build` 输出加 gzip 统计 | 构建后自动检查 |
| 单 page JSX 体积 | 小于 250KB（含共享 chunk） | `vite build` 报告 | 路由级代码分割后 |
| 首屏 JS（gzip 后） | 小于 300KB | Lighthouse Desktop | 路由 `/` |
| 单 page 渲染耗时 | 小于 100 毫秒 | React Profiler 加 Performance API | 含 recharts 渲染 |
| TTI（Time to Interactive） | 小于 2.0 秒 | Lighthouse Desktop | 1920×1080，4 倍 CPU 节流 |
| LCP（Largest Contentful Paint） | 小于 1.8 秒 | Lighthouse Desktop | 同上 |
| CLS（Cumulative Layout Shift） | 小于 0.05 | Lighthouse Desktop | 主题切换不引起布局跳动 |
| FCP（First Contentful Paint） | 小于 1.0 秒 | Lighthouse Desktop | 暗色首屏脚本保护 |

### 8.2 体积控制手段

第一，**CSS 按需打包**：每个 `*.module.css` 文件 Vite 会自动 tree-shake 未引用的类。复用率低的类（如某个 page 独有的）保留即可，不会进入最终 bundle。第二，**拆分 chunk**：`vendor-styles` 占位加 `cssCodeSplit: true` 让 tokens 与 base 不进入 page chunk。第三，**不引入 Tailwind 与 styled-components**：节省约 30 至 40KB gzip。第四，**icon 按需引入**：维持 `import { Bell } from 'lucide-react'` 写法，lucide 的 ESM tree-shake 已经做了优化。

### 8.3 渲染性能手段

第一，**Recharts memo 包裹**：所有 `<Line>` 与 `<Bar>` 组件用 `React.memo` 包裹，data prop 用 `useMemo` 缓存。第二，**Table 虚拟滚动**：列表类 page 行数大于 200 时启用 `react-window`（P1 阶段评估是否引入；首选不引入，靠后端分页解决）。第三，**ThemeProvider 不重渲染**：用 `useMemo` 缓存 value（详见第六章第二节），确保主题切换不引起所有订阅组件重渲染。第四，**首屏内联脚本**：通过 `index.html` 中的防闪烁脚本（详见第六章第四节），避免主题过渡动画在首屏跑一次。

### 8.4 监控埋点（可选，P1 引入）

```ts
// src/perf/perf.ts
export function 标记页面(name: string) {
  performance.mark(`page:${name}`)
  // 上报到本地日志（生产可对接 RUM 平台）
  if (import.meta.env.PROD) {
    console.debug(`[perf] ${name} @ ${performance.now().toFixed(1)}ms`)
  }
}
```

`App.tsx` 路由切换时调用 `标记页面(currentPath)`，验证渲染时间小于 100 毫秒。

---

## 9. 落地清单（v0.20.0 发布前必完成）

第一，tokens.css 全部变量已定义，CI 加 stylelint 校验，防止新增变量时拼写错误。第二，ThemeProvider 加 localStorage 加系统跟随三件套通过手测，包括刷新页面后主题保留、操作系统切换深色模式时应用跟随切换。第三，AppLayout 加 Sidebar 加 Topbar 渲染与原版对齐，Sidebar 等于 260 像素、Topbar 等于 56 像素。第四，10 个 UI 原子组件已落地并被至少 3 个 page 引用，确保组件不只是「写出来」而是「用起来」。第五，P1 阶段 10 个 page 迁移完成，grep `React.CSSProperties` 在这些 page 中不超过 5 处。第六，P2 阶段 12 个 page 迁移完成，recharts 暗色主题可用且对比度合规。第七，P3 阶段 13 个 page 迁移完成，canvas 加富文本编辑器内联 style 已标注原因。第八，P4 阶段 10 个 page 迁移完成，全仓 `React.CSSProperties` 残留不超过 30 处（仅动态计算）。第九，`vite build` 通过，`dist/assets/*.css` gzip 后总和不超过 50KB。第十，Lighthouse Desktop 报告性能分不低于 90、TTI 小于 2 秒、LCP 小于 1.8 秒、CLS 小于 0.05。第十一，`index.html` 防闪烁脚本部署上线。第十二，README 更新，新增「设计系统」章节，含 token 使用示例。第十三，CHANGELOG 更新，v0.20.0 条目列出本次重构收益。

---

## 10. 风险登记册

| ID | 风险描述 | 等级 | 缓解措施 |
|---|---|---|---|
| R1 | 53 个 page 同步迁移导致大爆炸 | 高 | 5 阶段分批，每阶段独立部署与回滚 |
| R2 | 内联样式到 CSS Module 类名命名不一致 | 中 | P1 阶段先建立 1 个 page 样板，团队评审通过后再推广 |
| R3 | recharts 主题色硬编码导致暗色失效 | 中 | 封装 ChartContainer，自动从 CSS 变量取值 |
| R4 | 暗色主题下医疗数据色（绿、黄、红）对比度不足 | 中 | tokens 中状态色暗色版专门调色，避免直接复用默认色 |
| R5 | Sidebar 从 280 收紧到 260 后某 page 横向溢出 | 中 | P0 阶段做 1920 加 1280 双视口截图比对 |
| R6 | Topbar 从 72 收紧到 56 后下拉菜单被截断 | 中 | 同上，重点验证 Topbar 下拉组件 |
| R7 | GitHub Pages 静态资源缓存导致旧 CSS 与新 JS 不匹配 | 低 | 文件名带 hash，Vite 已处理；发版前清 CDN |
| R8 | localStorage 在浏览器隐身模式抛错 | 低 | ThemeProvider 已 try 加 catch 包裹 |
| R9 | prefers-reduced-motion 用户被全局 transition 影响 | 低 | tokens.css 已加媒体查询守卫 |
| R10 | 后续维护者再写内联样式 | 中 | 加 stylelint 规则禁止新 `<style>` 标签，加 PR 模板提醒 |

---

## 11. 附录 A · 一份 page 迁移前后对比样例

**迁移前**（典型内联样式写法）：

```tsx
const s: Record<string, React.CSSProperties> = {
  card: { background: '#fff', borderRadius: 8, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  title: { fontSize: 18, fontWeight: 600, color: '#1a3a5c', marginBottom: 12 }
}
<div style={s.card}>
  <div style={s.title}>患者列表</div>
</div>
```

**迁移后**（CSS Module 加 Token 写法）：

```tsx
/* PatientListCard.module.css */
.card  { background: var(--bg-surface); border-radius: var(--radius-lg);
         padding: var(--space-5); box-shadow: var(--shadow-1); }
.title { font-size: var(--text-xl); font-weight: 600;
         color: var(--text-primary); margin-bottom: var(--space-3); }

/* PatientListCard.tsx */
import s from './PatientListCard.module.css'
<div className={s.card}>
  <div className={s.title}>患者列表</div>
</div>
```

**迁移收益**：第一，删除约 10 行 JS 对象声明，模板更精简。第二，颜色加间距自动跟随主题切换，深色模式下无需任何额外代码。第三，改一处 token 即可全局换皮，例如把 `--text-primary` 从深灰改为黑色，全站所有标题同步变化。第四，CSS Module 自动生成可读类名（如 `PatientListCard__card___a1b2c`），DevTools 调试清晰。

---

## 12. 附录 B · 与 `design-ui-designer` 设计系统文档的接力说明

本文档输出技术架构层面的决策与实施路径（CSS 架构、Token 注入、布局、迁移路径），不规定视觉数值的具体取值。下一步由 `design-ui-designer` 基于本文档 §1.4 文件组织与 §2 Token 分层，产出下列交付物：

第一，完整的色板、字号、间距、阴影 swatch 表，用于填入 §2.2 的 CSS 变量值。第二，10 个 UI 原子组件的设计稿（Figma 文件或纯 CSS 实现的视觉规范）。第三，4 类 ContentGrid 的设计模板（1280、1440、1680、1920 四档对照）。第四，暗色主题医疗专用色板（保证医疗关键状态色达到 WCAG AAA 对比度）。

设计稿完成后，开发侧按本文档 §7 的 5 阶段执行迁移。如设计 Token 数值与本文档假设的尺寸（如 260、56）有出入，需要在 P0 阶段第一时间同步调整文档与代码。

---

## 13. 附录 C · 与 README 中「不引入第三方 UI 库」声明的呼应

主公在 README 中明确声明 G003 项目不引入第三方 UI 库。本架构完全遵守这一约束：CSS 架构选用 Vite 原生支持的 CSS Modules、主题系统选用浏览器原生 CSS 变量与 Context、组件库选用自研 UI 原子加 CSS Modules。整条技术栈不新增任何 runtime 样式库，主题切换零运行时开销，部署包体积可控可预测。这一选择既符合主公的「完全自研可控」诉求，也与 GitHub Pages 静态部署的性能预算严格对齐。

---

**文档结束**。本文档可作为 v0.20.0 启动会的输入材料，建议与 `design-ui-designer` 的产出联合评审后启动 P0 阶段实施。