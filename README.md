# G003 超声 RIS - 智慧超声影像信息管理系统

> **版本**: v0.18.10（v0.18.9 + 12 个 tsc 错误修复 + 2 个新挂载页面）
> **最后更新**: 2026-06-08
> **作者**: 小诸葛（陈王府）

## 项目简介

G003 超声 RIS（Radiology Information System，超声科信息系统）是中国基层/二级医院超声科的全流程管理系统，对标蓝网科技、东软、联影、开立、岱嘉、GE、Philips、Siemens 等 8 大主流厂商的核心产品。

**核心特点**：
- 61 个业务页面（**国内最全**）
- 53 路由全覆盖
- 内置 10 个 AI 子模块（架构完整）
- 三大隐藏护城河：**教科研 + 院感消毒 + DRG/DIP**

## 快速开始

```bash
# 1. 依赖
nvm use   # 锁定 Node 20
npm install

# 2. 启动开发服务器（端口 5193）
npm run dev
# 浏览器打开 http://localhost:5193

# 3. 类型检查（v0.18.10 起 0 错误）
npx tsc --noEmit

# 4. 生产构建
npm run build

# 5. 部署到 GitHub Pages
npm run deploy
```

## 技术栈

| 类别 | 技术 | 版本 |
|---|---|---|
| 前端框架 | React | 18.2.0 |
| 构建工具 | Vite | 5.1.0 |
| 语言 | TypeScript | 5.3.0 |
| 路由 | React Router | 6.22.0 |
| 图表 | Recharts | 2.15.4 |
| 图标 | Lucide React | 0.344.0 |
| 测试 | Vitest | 4.1.8 |

## 项目结构

```
g003-ultrasound-ris/
├── src/
│   ├── ai-imaging/      # AI 影像模块（5 子模块）
│   │   ├── ai-models/   #   AI 模型管理
│   │   ├── detection/   #   病灶检测
│   │   ├── dicom-seg/   #   DICOM SEG 分割
│   │   └── measurement/ #   自动测量
│   ├── ai-stream/       # AI 流式工作流（5 子模块）
│   │   ├── plane-recognition/  # 切面识别
│   │   ├── auto-measure/       # 自动测量
│   │   ├── quality-evaluation/ # 质量评估
│   │   └── report-generator/   # 报告生成
│   ├── data/            # 模拟数据（initialData.ts 14.6 万行）
│   ├── pages/           # 53 个业务页面
│   └── types/           # TypeScript 类型
├── docs/
│   ├── AUDIT_v0.18.9_PLAN_v0.19.md          # 复盘 + 升级方案
│   └── INDUSTRY_RESEARCH_ULTRASOUND_RIS_v1.md  # 行业调研（48KB）
└── dist/                # 构建产物
```

## 业务模块（按侧栏顺序）

### 工作台
- 首页概览 / 检查工作台 / 排班管理

### 患者与预约
- 患者管理 / 预约管理

### 检查与报告
- 检查执行 / 叫号管理 / 报告管理 / 报告书写 / 专业报告工作站 ⭐
- 危急值 / 危机预警 / 影像管理 / DICOM 浏览器
- 成像模式介绍 / 检查模板 / 护理记录 / 术前评估

### 超声设备
- 超声设备 / 探头管理 / 超声模式 / 洗消追溯 / 洗消追溯增强 / 维修工单

### 质量与安全
- AI 质控中心 / 质量控制 / 报告质量评分
- 感染管理 / 会诊管理 / 远程会诊 / 远程超声（实时）

### 管理与统计
- 数据统计 / 统计分析 / 科室看板 / 运营指挥中心
- 流程管理 / 成本效益分析 / 权限管理 / 数据字典
- 术语词库 / 审计日志 / 耗材管理 / 设备全生命周期
- 随访管理 / 国家数据上报 / 卫健委数据上报
- 医保审核 / 医保智能审核 / DRG/DIP 控费 / 临床数据中心

### 教育与培训
- 教育培训 / 技能培训中心 / **培训考试**（v0.18.10 新挂载）

## v0.18.10 变更日志

### 修补（v0.18.9 → v0.18.10）

| # | 修补项 | 详情 |
|---|---|---|
| 1 | tsc 残缺 import | `src/ai-stream/plane-recognition/index.ts:9` 残缺 `export { PlaneScorer } from` |
| 2 | tsc 12 个潜在错误 | 全部修复（v0.18.9 标题"100→0 tsc 错误"是假的，实际 12 个）|
| 3 | 端口不一致 | `package.json:5190` → `5193`（统一 vite.config）|
| 4 | Node 版本锁定 | 新增 `.nvmrc`（Node 20）|
| 5 | `DictionaryPage` 校验 bug | `!d.code ?? "".trim()` 永远为 true，已修 |
| 6 | `TrainingPage` 重复 case | `case '已过期': case '已过期'` 删一个 |
| 7 | `lucide-react` 改名 | `Hospital → Building2`、`Tool → Wrench`（v0.344 API 变更）|
| 8 | `NodeJS.Timeout` 跨平台 | 改用 `ReturnType<typeof setTimeout>` |
| 9 | AI 模块内部 type 泄漏 | 修复 `MeasurementRule/ReportData/ReportTemplate` 等 7 处 type re-export |

### 提升（功能新增）

| # | 功能 | 详情 |
|---|---|---|
| 1 | **培训考试页** | 挂载 `TrainingExamPage`（733 行），侧栏新增"教育培训"板块 |
| 2 | **超声模式页** | 挂载 `UltrasoundModesPage`（598 行），侧栏新增"超声设备"板块 |
| 3 | **删死页** | 删除 13 行 `TestPage.tsx`（无业务内容）|

### 验证

- ✅ `npx tsc --noEmit` **0 错误**
- ✅ 所有 53 路由全部挂载（无死页面）
- ✅ 所有 53 个页面文件全部活跃

## v0.19 计划

详见 `docs/AUDIT_v0.18.9_PLAN_v0.19.md`（14.5KB）。

| 阶段 | 工时 | 关键任务 |
|---|---|---|
| P0 (5 项) | 15 天 | 拆 mock 数据 / 拆巨型页面 / 挂死页（已 2/5）/ 修端口（已）/ tsc 0 错（已）|
| P1 (5 项) | 22 天 | Mock 后端 / 真实 AI / 核心测试 / 清债 / 文档 |
| P2 (5 项) | 40 天 | 移动端 / LLM 真实接入 / 院感独立包 / 教科研产品化 / 国际化 |
| **总计** | **77 人天 (~4 月)** | |

## 行业调研

详见 `docs/INDUSTRY_RESEARCH_ULTRASOUND_RIS_v1.md`（48KB）。

- 调研 8 大厂家：蓝网 / 东软 / 联影 / 开立 / 岱嘉 / 卫宁 / GE / Philips / Siemens
- 11 维灵魂节对照 + P0/P1/P2 路线图

## 商业化路径（3 选 1 待主公决策）

- **A**: MVP 路线（v0.19 走完 5+5 项 P0/P1）
- **B**: 差异化路线（聚焦教科研 + 院感消毒，做垂直 SaaS）
- **C**: AI 真实化路线（v0.19 优先接 1 个真实 AI 模型）

## 部署

GitHub Pages 自动部署：

- 仓库：`https://github.com/lz2026km/g003-ultrasound-ris`
- 路径：`/g003-ultrasound-ris/`
- 路由：`HashRouter`（兼容 GitHub Pages 无 SPA fallback）
- 部署命令：`npm run deploy`（自动 vite build + gh-pages 推送）

## 联系

- 仓库作者：小诸葛（xiaozhuge@openclaw.local）
- 协助：凤雏（Hermes Agent v0.16.0）
- 调研方法：Tavily Search 8 轮 + Extract 抓全文
- 报告路径：`docs/INDUSTRY_RESEARCH_ULTRASOUND_RIS_v1.md`

---

**版权**: 项目归陈王府所有，未经授权禁止商用。
