# G003 超声RIS系统 - 项目开发指南

> 版本: v0.8.0 开发中 | 主公: 主公 | AI 军师: 小诸葛 🦉
> 技术栈: React 18 + TypeScript + Vite + TensorFlow.js + MiniMax-M3

## 项目目标

打造 **"功能最全、AI最强、数据最丰富、临床最贴心"** 的国产超声RIS标杆系统，对标国内十大公司。

## 当前进度

- ✅ v0.7.0 已完成（随访+输血+科研+培训+AI）
- 🔄 **v0.8.0 开发中**（AIStream + 影像AI分割 + 切面识别）
- ⏳ v0.9.0 规划中（DRG/DIP + 远程超声 + 维修工单 + 医保审核）
- ⏳ v1.0.0 规划中（院感监控 + 区域互联 + 国际化）

## 严格推送规则

> **每完成一步，必须通过QQ推送文件给主公审阅！**

每完成以下任一里程碑，必须推送：
- ✅ 一个新模块/页面创建完成
- ✅ 一个核心算法实现完成
- ✅ 一个端到端功能跑通
- ✅ 编译/测试通过
- ✅ 重要决策点

## 目录结构

```
g003-ultrasound-ris/
├── .claude/                  # Claude Code 配置
│   ├── CLAUDE.md            # 本文件
│   ├── commands/            # 命令（任务执行模板）
│   ├── agents/              # 代理（自主行为）
│   ├── skills/              # 技能（知识型指导）
│   └── hookify.*.local.md   # 钩子（行为拦截）
├── docs/
│   └── 业务升级方案/
│       ├── 十大公司对标与G003业务升级方案.md  # 总方案
│       ├── v0.8.0-技术方案.md                  # v0.8.0详细
│       ├── v0.9.0-技术方案.md                  # v0.9.0详细
│       └── v1.0.0-技术方案.md                  # v1.0.0详细
├── src/
│   ├── ai-stream/           # v0.8.0: AI智能工作流
│   ├── ai-imaging/          # v0.8.0: 影像AI分割
│   ├── plane-recognition/   # v0.8.0: 切面识别
│   ├── drg-dip/             # v0.9.0: DRG/DIP
│   ├── remote-ultrasound/   # v0.9.0: 远程超声
│   ├── workorder/           # v0.9.0: 维修工单
│   ├── medical-audit/       # v0.9.0: 医保审核
│   ├── infection-control/   # v1.0.0: 院感监控
│   ├── regional-health/     # v1.0.0: 区域互联
│   ├── i18n/                # v1.0.0: 国际化
│   ├── pages/               # 现有页面
│   └── ...
```

## v0.8.0 模块清单

### 1. AIStream 智能工作流 (`src/ai-stream/`)
- plane-recognition/        # 切面识别
- auto-measure/             # 自动测量
- report-generator/         # LLM报告生成
- quality-evaluation/       # 质量评价
- workflow-orchestrator/    # 工作流编排

### 2. 影像AI分割/检测 (`src/ai-imaging/`)
- dicom-seg/                # DICOM SEG
- detection/                # 病灶检测
- measurement/              # 自动测量
- ai-models/                # AI模型管理

### 3. 智能切面识别 (`src/plane-recognition/`)
- 标准切面库
- 切面评分
- 扫查引导

## 推送文件格式

每次推送需生成：
1. **进展报告** (`progress-{version}-{module}-{date}.md`)
2. **代码文件**（如适用）
3. **测试结果**（如适用）

## 主公批示
> 批准。每完成一步，严格按照推送
