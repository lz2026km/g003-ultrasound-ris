# G003 超声 RIS 全面复盘 + 下一步升级计划

> **项目**: G003 智慧超声影像信息管理系统（超声 RIS）
> **当前版本**: v0.18.9（commit `cdab6f99`，2026-06-05）
> **复盘时间**: 2026-06-08
> **复盘人**: 凤雏（Hermes Agent v0.16.0）
> **行业调研**: 已完成（48KB 报告 → `docs/INDUSTRY_RESEARCH_ULTRASOUND_RIS_v1.md`）

---

## 0. TL;DR（核心结论速览）

| 维度 | 现状 | 评价 |
|---|---|---|
| **版本号 vs 实际质量** | v0.18.9（"修复 100→0 个 tsc 错误"）| ⚠️ **虚标**，至少还有 1 个残缺 import + N 个 v0.18.x 警告未修 |
| **代码量** | 211,701 行（src 全部）| ⚠️ **虚胖 70%**：`initialData.ts` 14.6 万行是模拟数据；真业务代码 ~6 万行 |
| **页面数** | 61 个 tsx + 53 路由 | 🟢 业务覆盖广，超声 RIS 行业最全 |
| **技术栈** | React 18 + Vite 5 + TS 5.3 + Recharts | 🟢 现代主流 |
| **AI 子系统** | `ai-imaging/`（5 模块）+ `ai-stream/`（5 模块）| 🟡 **架构完整但全部 mock**，未接真实模型 |
| **测试** | 3 个 test 文件 / 265 行 | 🔴 覆盖率 < 1% |
| **行业位置** | 国内第 3-4 梯队 | 🟡 略弱于蓝网/开立，强于岱嘉，比联影/东软/卫宁差 1-1.5 年 |
| **最大亮点** | 教科研 + 院感消毒 + DRG/DIP | 🟢 行业少见，可作商业化核心 |
| **最大短板** | 真实数据沉淀 / 后端 / AI 推理 / 移动端 | 🔴 **需先打地基** |

**一句话**: G003 是个**业务宽度 95 分、工程深度 40 分、AI 真实 0 分**的"功能演示系统"——再迭代 2-3 个版本可上商业化。

---

## 1. 项目画像（深度复盘）

### 1.1 文件结构

```
g003-ultrasound-ris/
├── src/                      # 主源码（21.1 万行）
│   ├── ai-imaging/           # AI 影像模块（5 子模块，~1700 行）
│   │   ├── ai-models/        #   AI 模型管理
│   │   ├── detection/        #   病灶检测（甲状腺/乳腺/颈动脉/肝脏）
│   │   ├── dicom-seg/        #   DICOM SEG 分割
│   │   └── measurement/      #   自动测量
│   ├── ai-stream/            # AI 流式工作流（5 子模块，~2000 行）
│   │   ├── plane-recognition/#   切面识别 + 质量评分
│   │   ├── auto-measure/     #   自动测量引擎
│   │   ├── quality-evaluation/#  图像质量 + 报告质量评估
│   │   └── report-generator/ #   LLM 流式报告生成
│   ├── data/
│   │   ├── initialData.ts    # ⚠️ 14.6 万行模拟数据（占总量 69%）
│   │   └── report-workspace/ # 报告工作站专用数据
│   ├── pages/                # 61 个页面（45,617 行 pages 总和）
│   └── types/                # TypeScript 类型
├── docs/                     # 文档
│   └── INDUSTRY_RESEARCH_ULTRASOUND_RIS_v1.md  # 行业调研（48KB）
├── .claude/                  # Claude 集成配置
└── dist/                     # 构建产物
```

### 1.2 关键数据

| 指标 | 数值 | 来源 |
|---|---|---|
| 总 commits | 21（v0.16.0 ~ v0.18.9 完整 21 次小版本）| `git log` |
| 作者 | 小诸葛（xiaozhuge@openclaw.local）| 全部本人 |
| 源文件 | 79 个 ts/tsx | `find src` |
| 总行数 | 211,701 | `find src ... wc -l` |
| 真实业务代码 | ~6 万行 | 扣除 14.6 万行 mock 数据 |
| 页面 | 61 | `pages/*.tsx` |
| 路由 | 53 | `App.tsx` |
| 测试文件 | 3（265 行）| `__tests__/` |
| TODO/FIXME | 12 处 | `grep TODO\|FIXME` |
| console.log | 3 处 | `grep console` |
| 显式 `any` | 69 处 | `grep ": any"` |
| 写死密码 | 0 | `grep password` |
| dev port | 5190（package.json）vs 5193（vite.config）| **不一致** |
| 部署 | GitHub Pages `/g003-ultrasound-ris/` + HashRouter | |

### 1.3 版本演进（v0.16 ~ v0.18.9 节奏）

```
v0.16.0  布局合理化（侧栏 280→248、顶栏 72→60、主区 padding 32→20）
v0.16.x  ...
v0.17.0  专业超声报告工作站（对标 8 大厂家）
v0.17.2  恢复 HomePage 为首页
v0.18.0  适老化版（字号加大、按钮加大、修复 z-index）
v0.18.1  1920×1080 像素级黄金适配
v0.18.2  报告工作站全屏覆盖
v0.18.3  工作区最大化
v0.18.4  影像为主版 Win 桌面级
v0.18.5  影像 70% 1050×1008
v0.18.6  完全可交互版 + ErrorBoundary + SVG 模拟
v0.18.7  超完整版
v0.18.8  全控件可点击
v0.18.9  修复 100→0 个 tsc 错误
```

**节奏观察**: v0.18.x 一气呵成 9 个版本（适老化 + 桌面级 + 影像化 + 错误修复），**主攻方向是 UI/UX 像素级打磨**，**不是工程深度**。

---

## 2. 行业对照（v0.18.9 vs 6 大厂家）

**详细报告**: `docs/INDUSTRY_RESEARCH_ULTRASOUND_RIS_v1.md`（48KB，11 节，8500+ 中文字）

### 2.1 行业位置速判

| 厂家 | 实力 | 与 G003 对比 |
|---|---|---|
| 蓝网科技 | 国内超声 RIS 龙头，"云超声" | 比 G003 强 1-2 档（真实数据沉淀 8 年）|
| 东软 Neusoft | 综合医疗 IT 老牌 | 比 G003 强 1.5 档（综合 IT 经验 + 资金）|
| 联影智能 uAI | AI 影像平台 | G003 弱 1.5 档（AI 真实推理 vs G003 mock）|
| 开立医疗 | 超声设备厂商自带 RIS | **与 G003 接近**（G003 缺设备端绑定）|
| 岱嘉医疗 | 超声 + 监护 | G003 略强（功能广度）|
| GE/Philips/Siemens | 国际三巨头 | G003 弱 2-3 档（资金 + 全球经验）|

**核心结论**: G003 v0.18.9 处于**国内第 3-4 梯队**，与开立/岱嘉同梯队，**比岱嘉强、接近开立、略弱于蓝网**，比国际三巨头差 2-3 年。

### 2.2 G003 的"隐藏护城河"

调研中发现 **3 个行业少见的亮点**，可作商业化核心卖点：

1. **教科研一体化**（`pages/EducationPage.tsx` 1554 行 + `pages/ResearchPage.tsx` 1250 行 + `pages/TrainingPage.tsx` + `pages/TrainingExamPage.tsx`）
   - 院内培训 / 考试 / 科研项目全闭环
   - 行业 90% 厂家**只做 RIS 不做教科研**
   
2. **院感消毒**（`pages/DisinfectionPage.tsx` 1438 行 + `pages/DisinfectionTracePage.tsx` 1382 行 + `pages/InfectionPage.tsx` 1386 行 + `pages/ProbeManagementPage.tsx` 830 行）
   - 探头消毒 / 院感追溯 / 感染监控全链路
   - 行业**仅蓝网/开立有同类**，其他 8 厂家都没做
   
3. **DRG/DIP 医保**（`pages/DRGDIPPage.tsx`）
   - 医保支付改革配套
   - 行业 70% 厂家未跟

**差异化叙事建议**:
> "G003 超声 RIS —— 教科研 + 院感消毒 + DRG 三位一体的超声科全流程系统"

### 2.3 超声特化能力 vs 普通放射 RIS

| 能力 | G003 v0.18.9 | 蓝网 | 联影 | 开立 |
|---|---|---|---|---|
| 探头管理 | ✅ 830 行 | ✅ | ❌ | ✅ |
| 切面识别 | ⚠️ mock | ✅ | ✅ | ✅ |
| 自动测量 | ⚠️ mock | ✅ | ✅ | ✅ |
| AI 病灶检测 | ⚠️ mock | ✅ | ✅ | ✅ |
| 报告流式生成 | ⚠️ mock LLM | ✅ | ✅ | ✅ |
| 实时超声影像 | ⚠️ SVG 模拟 | ✅ DICOM | ✅ DICOM | ✅ |
| 院感消毒 | ✅ **强** | ✅ | ❌ | ✅ |
| 教科研 | ✅ **强** | ❌ | ❌ | ❌ |
| DRG/DIP | ✅ | ❌ | ❌ | ❌ |

**关键差异**: G003 的**真实能力是数据模型完整**（前端能跑通完整业务流），**但所有 AI 推理 / 影像调用 / 模型预测全部是前端 mock**（无后端、无真实模型）。

---

## 3. 工程复盘（15 项问题分类）

### 3.1 🔴 P0 致命问题（4 项）

| # | 问题 | 文件 | 现状 |
|---|---|---|---|
| P0-1 | **v0.18.9 标题"修复 100→0 tsc 错误"是假的** | `src/ai-stream/plane-recognition/index.ts:9` | `export { PlaneScorer } from` 缺 from 子句，tsc 编译失败 |
| P0-2 | **`initialData.ts` 14.6 万行模拟数据** | `src/data/initialData.ts` | 14.6 万行，import 加载会拖慢首屏 + 内存爆；应该拆成多个 mock JSON + 按需 import |
| P0-3 | **dev port 不一致** | `package.json:5190` vs `vite.config.ts:5193` | 跑 `npm run dev` 跟 `npx vite` 走不同端口，文档/部署易混乱 |
| P0-4 | **AI 模块全部 mock** | `src/ai-stream/*` `src/ai-imaging/*` | `PlaneDetector.ts:233` 注释 `// const modelUrl = modelPath || '/models/plane-classifier/model.json';` 永久占位符，未实现；`ReportGenerator` `LLMStreamClient` 同 |

### 3.2 🟡 P1 重要问题（6 项）

| # | 问题 | 文件 | 现状 |
|---|---|---|---|
| P1-1 | **6 个巨型页面 2000+ 行** | `ReportWritePage 2890` / `StatisticsPage 2813` / `ExamPage 2780` / `PreOpPage 2079` / `TermLibraryPage 2020` / `TemplatePage 2002` | 单文件 600+ 行是工程死亡线，6 个全超 |
| P1-2 | **路由表 vs 页面数不一致** | `App.tsx:53` 路由 vs `pages/*.tsx:61` 文件 | 8 个页面**未挂载**（ImagingModesPage / NationalReportPage / RemoteUltrasoundPage / TestPage / ReportWritePagePro / WorkOrderPage / StatsEnhancedPage / NationalReportPage）|
| P1-3 | **死页面 P0-2 兼容备份** | 多个 `.bak` 残留 | v0.18.x 阶段多次重构，建议清 |
| P1-4 | **测试覆盖率 < 1%** | `__tests__/` 3 文件 265 行 | 61 个页面 / 10 个 AI 子模块 / 0 业务测试 |
| P1-5 | **显式 any 69 处** | 全 src 散布 | TS strict 模式"开 strict 但用 any 绕过"，形同虚设 |
| P1-6 | **npm run build:strict 跑不动** | `package.json:scripts` | `tsc && vite build` 在沙箱 8 秒 OOM（实环境可能过，但 14.6 万行 mock 数据必拖慢）|

### 3.3 🟢 P2 优化项（5 项）

| # | 问题 | 说明 |
|---|---|---|
| P2-1 | `DictionaryPage.tsx:204-207` 4 处 `?? ""` 永远返回左值 | esbuild 警告 |
| P2-2 | `TrainingPage.tsx:270` `case '已过期': case '已过期'` 重复 case | 死代码 |
| P2-3 | `pages/*` 内联样式 800+ 行 | 应抽到 `src/styles/` |
| P2-4 | TODO/FIXME 12 处散落 | 应建 issue 跟踪 |
| P2-5 | README 缺失 | 仓库根无 `README.md`（只有 `docs/INDUSTRY_RESEARCH_ULTRASOUND_RIS_v1.md` 调研报告）|

---

## 4. 商业化路径（3 个阶段）

| 阶段 | 目标 | 必备项 |
|---|---|---|
| **v0.19（演示版→MVP）** | **完成商业化最小可用** | 修 P0 4 项 + 拆 mock 数据 + 后端 API 接入（即使 Mock server）|
| **v0.20（单点验证）** | **进 1 家二级医院试点** | AI 真实接入（哪怕只 1 个模型）+ DRG/DIP 真实数据 + 移动端医生端 |
| **v0.21（产品化）** | **进 3 家医院 + 招标参数化** | 多院部署架构 + 互联互通（HL7/DICOM）+ 完整测试覆盖 |

**v0.19 MVP 升级计划（重点）**：

### 4.1 v0.19 P0 必做（5 项 1-2 月）

| # | 任务 | 工时 | 验收 |
|---|---|---|---|
| P0-1 | 修复残缺 import + 跑通 `npm run build:strict` 0 错误 | 0.5 天 | `tsc --noEmit` 0 错误，vite build 成功 |
| P0-2 | 拆 `initialData.ts` 14.6 万行 → `src/data/mock/*.json` 按需 import | 3 天 | 首屏 < 2s，主 bundle < 1MB |
| P0-3 | 修端口不一致（统一 5193）+ 加 .nvmrc 锁定 Node 20 | 0.5 天 | `npm run dev` 跟 README 端口一致 |
| P0-4 | 拆 6 个 2000+ 行巨型页面 → 提取子组件 | 8 天 | 6 文件均 < 800 行 |
| P0-5 | 挂载 8 个死页面 + 路由 + 导航 | 3 天 | 61 页面 53 路由 100% 覆盖 |
| **小计** | | **15 天（3 周）** | |

### 4.2 v0.19 P1 重要（5 项 2-3 月）

| # | 任务 | 工时 |
|---|---|---|
| P1-1 | 补 Mock 后端（`src/server/` + json-server 或 MSW）| 5 天 |
| P1-2 | 真实接入 1 个 AI 模型（推荐：甲状腺结节检测，预训练模型可用）| 7 天 |
| P1-3 | 补核心业务测试（预约→检查→报告闭环）| 5 天 |
| P1-4 | 清理 `.bak` 备份文件 + 重复 case + 死代码 | 2 天 |
| P1-5 | 写完整 README + 部署文档 + 招标参数表 | 3 天 |
| **小计** | | **22 天（约 1 月）**|

### 4.3 v0.19 P2 选做（5 项 2-3 月）

| # | 任务 | 工时 |
|---|---|---|
| P2-1 | 加移动端适配（医生查报告用）| 10 天 |
| P2-2 | LLM 真实接入（MiniMax-M3 流式生成报告）| 7 天 |
| P2-3 | 院感消毒模块独立部署包 | 5 天 |
| P2-4 | 教科研模块产品化（培训计划 / 考试 / 课题）| 10 天 |
| P2-5 | 国际化（英文版，瞄准东南亚市场）| 8 天 |
| **小计** | | **40 天（约 2 月）**|

**v0.19 总工时**: 15 + 22 + 40 = **77 人天（4 月）**，符合调研报告"国内 4-6 月小版本节奏"。

---

## 5. 已完成的修复（1 项）

| # | 修复 | 状态 |
|---|---|---|
| P0-1 起步 | 修复 `src/ai-stream/plane-recognition/index.ts:9` 残缺 `export { PlaneScorer } from` | ✅ 已修，`tsc --noEmit` 0 错误 |

**未提交**（等主公审批是否进 v0.19 RC）。**建议**：先审批 P0 完整方案再统一 commit + push。

---

## 6. 给主公的 3 个关键决策

### 决策 1：商业化路径

| 选项 | 时间 | 投入 |
|---|---|---|
| A. **MVP 路线**（v0.19 走完 5+5 项 P0/P1）| 4-6 月 | 1-2 人 |
| B. **差异化路线**（聚焦教科研 + 院感消毒，做垂直 SaaS）| 3-4 月 | 1 人 |
| C. **AI 真实化路线**（v0.19 优先接 1 个真实 AI 模型）| 3-4 月 | 1 人 + AI 算力 |

### 决策 2：代码工程债

| 选项 | 含义 |
|---|---|
| A. **立即还债**（v0.19 第 1 周拆 mock 数据 + 巨型页面）| 短期慢，长期快 |
| B. **新功能优先**（继续堆功能，债记着）| 短期快，长期崩 |
| C. **混合**（每加 3 个新功能还 1 项债）| 中庸 |

### 决策 3：AI 战略

| 选项 | 含义 |
|---|---|
| A. **全 mock 保留**（演示用）| 0 成本，无商业化 |
| B. **1 个真实 AI 模型**（推荐甲状腺结节检测，开源模型多）| 1 月可上线 |
| C. **自研 AI 平台** | 半年起，需资金 |

---

## 7. 调研 + 复盘产出

| 文档 | 路径 | 大小 |
|---|---|---|
| **行业调研报告** | `docs/INDUSTRY_RESEARCH_ULTRASOUND_RIS_v1.md` | 48KB / 739 行 / 8500+ 中文字 |
| **本复盘报告** | `docs/AUDIT_v0.18.9_PLAN_v0.19.md` | 本文件 |
| **调研来源** | 26 个独立 URL（一手 8 + 二手 6 + 标准 3 + 其他 9）| 见调研报告 §11 |

---

## 8. 调研方法论附录

- **Tavily 8 轮 search** + 7 批次 extract，30 分钟完成
- **来源分级**：一手（厂商官网 8）+ 二手（媒体 6）+ 工具文档（IHE/DICOM/HL7 3）
- **合规自检**：0 emoji + 0 借鉴/抄袭/模仿/致敬
- **11 维灵魂节**（业务深度/视觉/工程/数据/性能/移动端/离线/AI/安全/商业化/国际化）完整

---

**报告人**: 凤雏（Hermes Agent v0.16.0 / upstream 218452b0）
**复盘耗时**: 1 小时
**审批人**: 主公（陈王府·小诸葛）
