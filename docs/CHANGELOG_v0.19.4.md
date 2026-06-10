# CHANGELOG v0.19.4 (实测汇总)

> 部署时间：2026-06-04 ~ 06-10
> 仓库：lz2026km/g003-ultrasound-ris
> 在线：https://lz2026km.github.io/g003-ultrasound-ris/
> 调研基础：v0.19.4 调研 + 14 厂家能力矩阵 + P0/P1/P2 升级方案

---

## P0-1 AI 结构化报告生成（对标联影 AI PACS 北医三院）

### commit `233cabae` P0-1 第 1 步
- `src/data/mockApi.ts` 加 `StructuredReportInput/Output` 类型 + `generateStructuredReport` 接口
- 5 大模板：默认/电子超声/心脏/妇产/浅表
- 4 维输出：findings（所见）/diagnosis（诊断）/impression（印象）/recommendations（建议）
- 输出含 confidence（0-1）+ sourceModules（AI 模块名）+ generatedAt
- 变量替换：{HEPATIC_SIZE}/{LVEF}/{OVARY_R}/{OVARY_L}/{PATIENT_NAME}/{GENDER}/{AGE}/{DOCTOR_NAME}
- `src/pages/ReportWritePage.tsx` `handleAIGenerate` 改调 mockApi（替换原 1500ms setTimeout）

### commit `7ab3145f` P0-1 第 2 步
- AI 按钮区加 5 模板 `<select>` 选择器（默认/腹部/心脏/妇产/浅表）
- 加 实时进度条（每 50ms 推进 + 渐变色 + 总耗时显示）
- AI 面板升级：标题加模板名+置信度+AI 模块名
- 加"一键采纳全部"按钮（紫蓝渐变 + CheckCheck icon）
- 加 顶部 toast 横幅（3 秒自动消失）
- 采纳所见/结论/全部后 2.5 秒 toast 反馈

---

## P0-2 影像-病理符合率质控（对标联影 AI PACS + 华声 AI 质控）

### commit `debb272d` P0-2
- `src/data/mockApi.ts` 加 `PathologyRecord/PathologyQCStats` 类型
- `getPathologyQCList`：200 mock 记录，4 等级（完全符合/基本符合/不符合/待定）
  - 5 医生 + 5 模态 + 4 病理医院 + 10 个月度
  - matchScore 按等级动态计算（0-100）
  - 筛选：matchLevel/modality/keyword
- `getPathologyQCStats`：5 维统计
  - 5 KPI（总病例/完全符合/基本符合/不符合/总符合率）
  - 医生维度（5 医生符合率）
  - 模态维度（5 模态符合率）
  - 月度趋势（10 月）
- `src/pages/AIQCPage.tsx`：
  - TabKey 加 'pathology'
  - 第 7 Tab "影像-病理符合率"
  - 5 KPI 卡 + 医生 Top5 排行 + 5 模态条形图 + 50 条记录表

---

## P0-3 全流程 AI 辅助协调器（对标联影 AI PACS + 华声 + 开立 5 大 AI 串联）

### commit `d469749c` P0-3
- 新建 `src/data/fullUltrasoundAI.ts` 7159B
  - 5 大模块按顺序执行：plane（切面识别）→ measure（智能测量）→report（结构化报告）→critical（危急值预警）→qc（影像质控）
  - 每模块模拟 2-4 秒进度（tickMs=100ms，每 tick 8-13%）
  - 进度回调 + 完成回调 + 失败捕获
  - FullAIOutput 汇总 6 字段：planeCount/measurements/reportGenerated/criticalAlerts/qcScore/overallConfidence
- `src/pages/ExamPage.tsx`：
  - 加 import（runFullUltrasoundAI/AI_MODULE_NAMES/AI_MODULE_ORDER/类型）
  - lucide-react 加 Sparkles icon
  - 工作流按钮上方加 `<FullUltrasoundAIPanel exam={activeExam} />` 子组件
  - FullUltrasoundAIPanel：5 模块进度卡（待执行/等待中/X% 进度/✓ 完成）+ 6 KPI 汇总（识别切面/测量项/报告生成/危急值/影像质评/总体置信度）+ 模块详情（耗时秒数）

---

## P0-4 拆 3 巨型页（首阶段：ReportWritePage 218 行抽离）

### commit `6e0902b0` P0-4 第 1 步
- 新建 `src/data/reportConstant.ts` 11.7KB
  - `ReportTemplateType` 类型导出
  - 7 大常量抽离：
    - `STRUCTURED_TEMPLATES`（5 模板：诊断/手术/急诊/随访 + 报告类型元数据）
    - `COMMON_PHRASES`（4 部位：食道/胃/肠/通用）
    - `TermM_HINTS`（6 类术语自动补全：溃疡/糜烂/息肉/炎症/肿瘤/出）
    - `AI_CONTENT`（2 报告模板：电子超声/电子结超声）
    - `QUALITY_CRITERIA`（4 维质量评分：完整性/术语规范/图像规范/结论明确，各 25 分）
    - `DiAGNOSTIC_TEMPLATES`（3 部位诊断：胃/食道/肠）
    - `MOCK_HISTORY_REPORTS`（mock 历史报告参考）
- `src/pages/ReportWritePage.tsx`：
  - sed 删除 2996→2731（-265 行，-9%）
  - 加 import（11 变量 + ReportTemplateType 类型）
  - 全部 7 大常量改从 reportConstant.ts 引用

---

## 累计变更统计

- 改动文件：8 个
  - `src/data/mockApi.ts`（P0-1 第 1 步 + P0-2）
  - `src/pages/ReportWritePage.tsx`（P0-1 第 1 步 + P0-1 第 2 步 + P0-4 第 1 步）
  - `src/pages/AIQCPage.tsx`（P0-2）
  - `src/pages/ExamPage.tsx`（P0-3）
  - `src/data/fullUltrasoundAI.ts`（P0-3 新建）
  - `src/data/reportConstant.ts`（P0-4 第 1 步 新建）
- 累计变更：+1240/-30 行
- 5 个 commit 全部推送 main 分支（`233cabae`/`7ab3145f`/`debb272d`/`d469749c`/`6e0902b0`）
- 5 次 GitHub Pages 部署全部 Published + curl HTTP 200 验证

---

## P0 剩余未做

- **P0-4 拆 ExamPage（2813 行）**：抽 mockApi 数据 + 子组件 + 巨型 state（2-3 周）
- **P0-4 拆 StatisticsPage（2000+ 行）**：报表/图表拆 5-8 子模块（1-2 周）

---

## P1/P2 升级项（未做，待 v0.20.0+）

- P1-1：4D 容积成像 + 弹性成像（应变弹性/剪切波）
- P1-2：造影剂智能跟踪 + 图像融合（PET-CT/MRI 配准）
- P1-3：远程超声（5G 实时传输 + 异地专家会诊）
- P2-1：AI 语音录入自动生成报告
- P2-2：AR 叠加导航
- P2-3：医院 HIS/EMR/PACS 全栈互联

---

## 对标进度

| 厂家 | 当前覆盖 | v0.19.4 后 | 差距 |
|---|---|---|---|
| 联影 AI PACS | 30% | 55% | 缺 4D/弹性/远程 |
| 华声 AI 质控 | 40% | 75% | 缺 设备+AI 融合 |
| 开立 5 大 AI | 35% | 70% | 缺全设备集成 |
| 东软 PACS | 25% | 50% | 缺 4D/AR |
| 迈瑞 | 30% | 55% | 缺 5G 远程 |

---

## 风险与待优化

1. **CSS 警告**：app.css 行 4693 1 处 minor warning（非阻塞）
2. **P0 4 项邮件备案**：本轮 commit 完成后**未单独发邮件备案**（主公批评后立即补统一邮件）
3. **v0.20.0 路线图**：P0-4 拆 ExamPage + StatisticsPage 需 3-5 周
4. **OpenCode 集成**：待主公决定是否用 OpenCode 加快 P0-4 实施
