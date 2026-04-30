# G002放射科RIS系统补充方案

## 一、市场主流RIS系统功能对比

### 1.1 国内主流RIS厂商及产品

| 厂商 | 产品 | 代表功能 | DICOM支持 | 工作流模块 |
|------|------|----------|-----------|------------|
| 岱嘉医学 | RisRis | 全流程管理、叫号集成 | DICOM MWL/SCU/RIS综合 | 检查预约、排队、报告、影像集成 |
| 莱达 | 莱达RIS | 模板化报告、双签审核 | DICOM SCD Wado | 检查管理、胶片管理、统计报表 |
| 华海 | 医技RIS | 与HIS/EMR深度集成 | DICOM IOD全支持 | 预约登记、报告书写、质量控制 |
| 天健 | 天健RIS | 区域影像共享 | DICOM Query/Retrieve | 设备排程、危急值管理 |
| 芯软 | 芯软RIS | 云端部署、智能分诊 | DICOM标准接口 | 排队叫号、报告发布、满意度调查 |
| 瑞康 | 瑞康RIS | 移动端支持、AI辅助诊断 | DICOM 3.0 | 预约管理、影像浏览、绩效统计 |

### 1.2 典型RIS功能模块

| 模块 | 功能说明 | 行业标准 |
|------|----------|----------|
| **检查预约** | 门诊/住院患者检查预约、排程、设备分配 | IHE Schedule Workflow (SWF) |
| **排队叫号** | 分诊叫号、优先级管理、语音呼叫 | 医院信息互联互通标准 |
| **影像管理** | DICOM影像检索、显示、胶片打印 | DICOM 3.0 / WADO |
| **报告书写** | 结构化模板、辅助诊断、双签审核 | HL7 CDA / IHE Radiology Times Profile |
| **质量控制** | 图像质量评价、报告TAT监控、设备质控 | ISO 9001 / 等级医院评审 |
| **统计报表** | 工作量统计、收益分析、设备利用率 | 卫健委报表规范 |
| **危急值管理** | 危急值自动识别、通知、闭环管理 | 医疗质量安全核心制度 |
| **辐射防护** |剂量监测、防护检查记录、公示 | 辐射防护相关法规 |

### 1.3 DICOM标准与集成规范

**DICOM标准支持：**
- DICOM 3.0 影像获取（Storage SCU）
- DICOM Query/Retrieve (Q/R) 影像检索
- DICOM Worklist (MWL) 检查工作列表
- DICOM Print 胶片打印
- WADO 网络影像访问

**HL7/IHE集成：**
- HL7 v2.4 消息（ADT、ORM、ORU）
- IHE RAD Profile (Scheduled Workflow, Patient Information Reconciliation)
- IHE PIX 患者标识交叉引用
- IHE ATNA 安全传输

**报告规范：**
- 结构化报告（CDA R2）
- 中文报告内容规范（中华放射学会）
- 报告审核双签制度

### 1.4 行业合规要求

| 合规项 | 标准/规范 | 要求 |
|--------|-----------|------|
| 等级医院评审 | 国家卫健委 | 放射科信息系统完整，报告及时率≥90% |
| 辐射防护 | 《放射诊疗管理规定》 | 设备定期检测、防护记录完整 |
| 危急值报告 | 《医疗质量安全核心制度》 | 危急值15分钟内通知临床 |
| 隐私保护 | 《个人信息保护法》《数据安全法》 | 患者信息加密存储、审计日志 |
| 电子签名 | 《电子签名法》 | 报告双签（医师+审核医师） |
| 数据存储 | 卫健委数据安全指南 | 影像数据保留≥15年 |

---

## 二、G002现有功能评估

### 2.1 已有数据模型

从 `initialData.ts` 分析，G002已有以下基础数据：

| 数据类型 | 说明 | 完整性 |
|----------|------|--------|
| ExamItem (检查项目) | 32种检查项目，含价格、时长、注意事项 | ★★★★☆ |
| ReportTemplate (报告模板) | 5种常见模板，含正常所见/异常描述 | ★★★☆☆ |
| QcStandard (质控标准) | 20项质控指标，含目标值 | ★★★★☆ |
| Equipment (设备) | 5台设备信息 | ★★★☆☆ |
| CriticalValueTemplate (危急值) | 24种危急值类型 | ★★★★☆ |
| TimelinessThreshold (时效阈值) | 各模态报告TAT阈值 | ★★★★☆ |
| MaintenanceAlert (维保预警) | 设备维保提醒 | ★★★☆☆ |
| EquipmentUsageLog (使用记录) | 设备使用流水 | ★★★☆☆ |
| RadiationProtectionRecord (辐射防护) | 辐射防护台账 | ★★★☆☆ |
| EquipmentQcRecord (设备质控) | 设备质控记录 | ★★★☆☆ |
| EquipmentFaultRecord (故障记录) | 设备故障台账 | ★★★☆☆ |
| ChargePreset (收费预设) | 5种收费套餐 | ★★★☆☆ |
| GenderRule (性别规则) | 检查性别限制 | ★★☆☆☆ |
| ExamQueue (队列) | 6个检查队列 | ★★★☆☆ |
| MWLItem (检查工作列表) | 5条模拟MWL数据 | ★★★☆☆ |

### 2.2 缺失功能模块

| 模块 | 状态 | 说明 |
|------|------|------|
| **患者管理** | ❌ 缺失 | 无患者信息管理页面 |
| **检查管理** | ❌ 缺失 | 无检查申请、排队、上机流程 |
| **报告书写** | ❌ 缺失 | 无报告编辑器界面 |
| **影像查看** | ❌ 缺失 | 无DICOM图像查看器 |
| **统计报表** | ❌ 缺失 | 无工作量统计页面 |
| **系统管理** | ❌ 缺失 | 无用户、角色、权限管理 |
| **预约管理** | ⚠️ 部分 | 仅MWL数据，无预约界面 |
| **排队叫号** | ⚠️ 部分 | 仅队列数据，无叫号界面 |
| **质控看板** | ⚠️ 部分 | 仅标准定义，无实际质控数据展示 |
| **危急值处理** | ⚠️ 部分 | 仅模板，无实际处理流程 |

---

## 三、补充功能模块规划

### 3.1 功能架构

```
G002放射科RIS系统 v0.9
├── 患者管理 (/patients)
│   ├── 患者列表查询
│   ├── 患者信息编辑
│   └── 检查历史
├── 检查管理 (/exams)
│   ├── 检查预约 (/exams/booking)
│   ├── 检查排队 (/exams/queue)
│   ├── 检查登记 (/exams/register)
│   └── 检查详情 (/exams/:id)
├── 报告书写 (/reports)
│   ├── 报告列表 (/reports)
│   ├── 报告书写 (/reports/write/:id)
│   ├── 报告审核 (/reports/review/:id)
│   └── 报告打印 (/reports/print/:id)
├── 影像查看 (/imaging)
│   └── 模拟DICOM查看器
├── 统计报表 (/statistics)
│   ├── 工作量统计
│   ├── 收入统计
│   └── 设备利用率
├── 质控中心 (/qc)
│   ├── 质控看板
│   ├── 报告TAT监控
│   └── 设备质控
└── 系统管理 (/system)
    ├── 设备管理
    ├── 模板管理
    └── 用户管理
```

### 3.2 补充优先级

| 优先级 | 模块 | 工作量 | 价值 |
|--------|------|--------|------|
| P0 | 患者管理 + 检查管理 | 高 | 核心流程 |
| P1 | 报告书写 | 高 | 核心流程 |
| P2 | 统计报表 | 中 | 管理需求 |
| P3 | 影像模拟查看 | 低 | 演示需求 |
| P4 | 质控看板 | 中 | 质控需求 |

---

## 四、模拟数据模板

### 4.1 模拟患者数据（10条）

```typescript
{
  id: 'pat001',
  name: '王建国',
  gender: '男',
  birthDate: '1956-03-15',
  idCard: '310101195603150012',
  phone: '13800138001',
  address: '上海市徐汇区枫林路180号',
  medicalRecordNo: 'MR20250415001',
  age: 69,
}
```

### 4.2 模拟检查数据（5条）

```typescript
{
  id: 'exam001',
  patientId: 'pat001',
  accessionNumber: 'ACC20250428001',
  examItemId: 'ei011',
  examItemName: '头颅CT平扫',
  modality: 'CT',
  bodyPart: '头颅',
  scheduledDate: '2025-04-28',
  scheduledTime: '09:00',
  clinicalDiagnosis: '头晕伴右侧肢体无力2小时',
  requestingPhysician: '张神经',
  status: '已完成',
  priority: '急诊',
  studyInstanceUID: '1.2.840.113619.2.55.3.2025042801',
  technitian: '李技师',
  radiologist: '王主任',
  reportTime: '2025-04-28T10:15:00',
  charge: 350,
}
```

### 4.3 模拟报告数据（10条，涵盖CT/MRI/X-ray/DR/超声）

| 报告ID | 检查类型 | 患者 | 印象 |
|--------|----------|------|------|
| RPT001 | 头颅CT平扫 | 王建国 | 左侧基底节区急性脑梗死 |
| RPT002 | 胸部CT平扫 | 张美玲 | 右肺上叶磨玻璃结节，建议年度复查 |
| RPT003 | 腰椎MRI平扫 | 陈晓明 | L4/5椎间盘突出，椎管狭窄 |
| RPT004 | 胸部正位片(DR) | 刘国强 | 双肺纹理增粗，考虑支气管炎 |
| RPT005 | 乳腺钼靶摄影 | 李小红 | 双乳未见明显异常（BI-RADS 1类） |
| RPT006 | 腹部CT增强 | 周大力 | 肝血管瘤，考虑良性，建议定期复查 |
| RPT007 | 头颅MRI平扫 | 吴小燕 | 右侧颞叶脑膜瘤，大小约2.5cm |
| RPT008 | 颈椎CT平扫 | 郑老伯 | 颈椎退行性改变，C3/4、C4/5椎间盘突出 |
| RPT009 | 膝关节MRI平扫 | 孙晓丽 | 右膝内侧半月板损伤（III级） |
| RPT010 | 胸部CT平扫 | 钱大爷 | 双肺散在纤维灶，左下肺小结节，建议密切随访 |

---

## 五、技术规范说明

### 5.1 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite 5
- **UI组件库**: 基于现有lucide-react图标库，自定义组件
- **路由**: React Router v6
- **状态管理**: React Context + useState（轻量级）
- **样式**: Tailwind CSS 或 内联样式（保持一致性）

### 5.2 数据模型扩展

在 `types/index.ts` 中定义：

```typescript
// 患者信息
interface Patient {
  id: string;
  name: string;
  gender: '男' | '女';
  birthDate: string;
  idCard: string;
  phone: string;
  address: string;
  medicalRecordNo: string;
  age: number;
}

// 检查记录
interface Exam {
  id: string;
  patientId: string;
  accessionNumber: string;
  examItemId: string;
  examItemName: string;
  modality: Modality;
  bodyPart: string;
  scheduledDate: string;
  scheduledTime: string;
  clinicalDiagnosis: string;
  requestingPhysician: string;
  status: ExamStatus;
  priority: Priority;
  studyInstanceUID: string;
  technitian?: string;
  radiologist?: string;
  reportId?: string;
  charge: number;
}

// 报告记录
interface Report {
  id: string;
  examId: string;
  patientId: string;
  accessionNumber: string;
  examItemName: string;
  modality: Modality;
  findings: string;
  impression: string;
  suggestion: string;
  radiologist: string;
 审核医师?: string;
  reportTime: string;
  auditTime?: string;
  status: ReportStatus;
  isUrgent: boolean;
  criticalValue?: string;
}
```

### 5.3 DICOM规范要点

- **Study Instance UID**: `1.2.840.113619.2.55.3.YYYYMMDDnnn` 格式
- **Accession Number**: `ACC+YYYYMMDD+序号` 格式
- **影像号**: `IMG+YYYYMMDD+6位序号` 格式
- **DICOM日期格式**: `YYYY-MM-DD` 或 `YYYYMMDD`
- **DICOM时间格式**: `HHMMSS` 或 `HH:MM:SS`

### 5.4 版本更新

- **当前版本**: 0.8（数据文件标注）
- **更新后版本**: 0.9
- **更新内容**: 新增完整React应用框架及页面

---

## 六、实现清单

| 文件 | 说明 |
|------|------|
| `package.json` | 项目依赖配置 |
| `vite.config.ts` | Vite构建配置 |
| `tsconfig.json` | TypeScript配置 |
| `index.html` | 入口HTML |
| `src/types/index.ts` | 类型定义 |
| `src/data/initialData.ts` | 数据文件（扩充） |
| `src/components/*` | 通用组件 |
| `src/pages/*` | 页面组件 |
| `src/App.tsx` | 应用入口 |
| `src/main.tsx` | React渲染入口 |
