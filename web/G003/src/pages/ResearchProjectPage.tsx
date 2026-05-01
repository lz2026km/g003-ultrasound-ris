// @ts-nocheck
// ============================================================
// G003 超声RIS系统 - 超声研究项目管理页面
// 研究项目管理 / 患者入组追踪 / 数据采集 / 进度报告
// ============================================================
import { useState } from 'react'
import {
  Search, Plus, Filter, Download, FileText, Users,
  Calendar, Clock, CheckCircle, AlertCircle, ChevronRight,
  Target, FlaskConical, BookOpen, TrendingUp, X,
  Edit, Trash2, Eye, UserPlus, ClipboardList, BarChart3,
  PieChart as PieChartIcon, Activity, Award, DollarSign,
  User, FolderOpen, Save
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts'

// ---------- 样式 ----------
const s: Record<string, React.CSSProperties> = {
  root: { padding: 0 },
  header: { marginBottom: 24 },
  title: { fontSize: 20, fontWeight: 700, color: '#1a3a5c', margin: 0 },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 4 },
  headerRight: { display: 'flex', gap: 8 },
  // 搜索栏
  searchBar: {
    display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center',
  },
  searchInput: {
    flex: 1, padding: '10px 16px', border: '1px solid #e2e8f0',
    borderRadius: 10, fontSize: 13, outline: 'none', background: '#fff',
  },
  // 统计卡片行
  statRow: {
    display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 24,
  },
  statCard: {
    background: '#fff', borderRadius: 12, padding: '18px 20px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex',
    alignItems: 'center', gap: 14,
  },
  statIconWrap: {
    width: 44, height: 44, borderRadius: 10, display: 'flex',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  statInfo: { flex: 1, minWidth: 0 },
  statValue: { fontSize: 24, fontWeight: 700, color: '#1a3a5c', lineHeight: 1.2 },
  statLabel: { fontSize: 12, color: '#64748b', marginTop: 2 },
  statTrend: {
    fontSize: 11, color: '#22c55e', marginTop: 4, display: 'flex',
    alignItems: 'center', gap: 2,
  },
  // 标签页
  tabs: {
    display: 'flex', gap: 4, marginBottom: 20, borderBottom: '2px solid #f1f5f9',
  },
  tab: {
    padding: '10px 20px', fontSize: 13, fontWeight: 600, color: '#64748b',
    cursor: 'pointer', borderBottom: '2px solid transparent', marginBottom: -2,
    transition: 'all 0.2s',
  },
  tabActive: {
    padding: '10px 20px', fontSize: 13, fontWeight: 600, color: '#3b82f6',
    cursor: 'pointer', borderBottom: '2px solid #3b82f6', marginBottom: -2,
  },
  // 按钮
  btn: {
    padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
    fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6,
    transition: 'all 0.2s',
  },
  btnPrimary: {
    padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
    fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6,
    background: '#3b82f6', color: '#fff', transition: 'all 0.2s',
  },
  btnOutline: {
    padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0',
    cursor: 'pointer', fontSize: 13, fontWeight: 500, display: 'flex',
    alignItems: 'center', gap: 6, background: '#fff', color: '#475569',
  },
  btnDanger: {
    padding: '6px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
    fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4,
    background: '#fef2f2', color: '#ef4444', transition: 'all 0.2s',
  },
  btnIcon: {
    padding: '6px', borderRadius: 6, border: '1px solid #e2e8f0',
    cursor: 'pointer', background: '#fff', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
  },
  // 项目卡片
  projectCard: {
    background: '#fff', borderRadius: 12, padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 12,
    cursor: 'pointer', transition: 'all 0.2s',
  },
  projectCardHover: {
    background: '#fff', borderRadius: 12, padding: 20,
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)', marginBottom: 12,
    cursor: 'pointer', transition: 'all 0.2s',
  },
  projectHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12,
  },
  projectTitle: { fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 4 },
  projectDesc: { fontSize: 12, color: '#64748b', marginBottom: 12 },
  projectMeta: {
    display: 'flex', gap: 16, fontSize: 11, color: '#94a3b8',
  },
  projectTag: {
    fontSize: 10, fontWeight: 600, padding: '3px 10px',
    borderRadius: 8, flexShrink: 0,
  },
  projectProgress: {
    height: 6, borderRadius: 3, background: '#e2e8f0', overflow: 'hidden', marginTop: 12,
  },
  // 表格
  table: {
    width: '100%', borderCollapse: 'collapse', fontSize: 13,
  },
  th: {
    padding: '12px 16px', textAlign: 'left', color: '#64748b',
    fontWeight: 600, borderBottom: '2px solid #f1f5f9', fontSize: 12,
  },
  td: {
    padding: '14px 16px', color: '#475569', borderBottom: '1px solid #f1f5f9',
  },
  // 图表卡片
  chartCard: {
    background: '#fff', borderRadius: 12, padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 24,
  },
  chartTitle: {
    fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 16,
    display: 'flex', alignItems: 'center', gap: 6,
  },
  chartIcon: { color: '#64748b' },
  chartGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 24,
  },
  // 模态框
  modal: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.5)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  },
  modalContent: {
    background: '#fff', borderRadius: 16, width: '90%', maxWidth: 800,
    maxHeight: '90vh', overflow: 'auto', padding: 24,
  },
  modalHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #f1f5f9',
  },
  modalTitle: { fontSize: 16, fontWeight: 700, color: '#1a3a5c', margin: 0 },
  // 表单
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6, display: 'block',
  },
  formInput: {
    width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0',
    borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' as const,
  },
  formTextarea: {
    width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0',
    borderRadius: 8, fontSize: 13, outline: 'none', resize: 'vertical' as const,
    minHeight: 80, fontFamily: 'inherit', boxSizing: 'border-box' as const,
  },
  formRow: {
    display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16,
  },
  // 详情卡片
  detailSection: {
    marginBottom: 24,
  },
  detailSectionTitle: {
    fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 12,
    display: 'flex', alignItems: 'center', gap: 6,
  },
  detailItem: {
    display: 'flex', gap: 12, marginBottom: 8, fontSize: 13,
  },
  detailLabel: { color: '#64748b', minWidth: 100 },
  detailValue: { color: '#1a3a5c', fontWeight: 500 },
  // 入组追踪
  enrollmentBar: {
    height: 8, borderRadius: 4, background: '#e2e8f0', overflow: 'hidden', marginTop: 8,
  },
  enrollmentCard: {
    background: '#f8fafc', borderRadius: 8, padding: 16, marginBottom: 12,
  },
  // 颜色
  blue: { backgroundColor: '#eff6ff', color: '#3b82f6' },
  green: { backgroundColor: '#f0fdf4', color: '#22c55e' },
  orange: { backgroundColor: '#fff7ed', color: '#f97316' },
  red: { backgroundColor: '#fef2f2', color: '#ef4444' },
  purple: { backgroundColor: '#f5f3ff', color: '#8b5cf6' },
  teal: { backgroundColor: '#f0fdfa', color: '#14b8a6' },
  // 卡片网格
  cardGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 24,
  },
  // 进度报告
  reportItem: {
    borderLeft: '3px solid #3b82f6', paddingLeft: 16, marginBottom: 16,
    background: '#f8fafc', padding: '16px 20px', borderRadius: '0 8px 8px 0',
  },
  reportDate: { fontSize: 11, color: '#94a3b8', marginBottom: 6 },
  reportContent: { fontSize: 13, color: '#475569', lineHeight: 1.6 },
  // 数据采集
  formCard: {
    background: '#fff', borderRadius: 12, padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 16,
  },
  // 空状态
  emptyState: {
    textAlign: 'center' as const, padding: '60px 20px', color: '#94a3b8',
  },
}

const PIE_COLORS = ['#3b82f6', '#22c55e', '#f97316', '#8b5cf6', '#14b8a6', '#ef4444']

const tooltipStyle = {
  contentStyle: {
    background: '#fff', border: '1px solid #e2e8f0',
    borderRadius: 8, fontSize: 12,
  },
  labelStyle: { color: '#1a3a5c', fontWeight: 600 },
}

// ---------- Mock 数据 ----------
const RESEARCH_PROJECTS = [
  {
    id: 1,
    title: '基于深度学习的甲状腺结节自动诊断研究',
    pi: '李明辉',
    status: 'on-going',
    statusText: '进行中',
    startDate: '2024-01-15',
    endDate: '2026-01-14',
    funding: '50万',
    fundingSource: '国家自然科学基金',
    type: '国家级',
    progress: 72,
    enrolled: 186,
    target: 300,
    objectives: '构建基于超声影像的甲状腺结节AI辅助诊断模型，实现良恶性自动鉴别，降低漏诊率，提高诊断效率。',
    methods: '收集10,000例甲状腺结节超声影像，采用深度卷积神经网络进行特征提取与分类，运用迁移学习提升模型泛化能力。',
    inclusionCriteria: '①年龄18-75岁；②甲状腺结节直径≥5mm；③术前未进行过穿刺或手术；④临床资料完整。',
    expectedOutcomes: '建立甲状腺结节AI诊断系统，诊断准确率≥90%，发表SCI论文2-3篇，申请发明专利1-2项。',
  },
  {
    id: 2,
    title: '超声弹性成像在肝纤维化分级中的应用',
    pi: '王芳',
    status: 'on-going',
    statusText: '进行中',
    startDate: '2024-03-01',
    endDate: '2025-12-31',
    funding: '30万',
    fundingSource: '省级科技计划',
    type: '省级',
    progress: 58,
    enrolled: 124,
    target: 200,
    objectives: '评估超声弹性成像技术在肝纤维化分期诊断中的临床价值，建立无创诊断模型。',
    methods: '采用实时剪切波弹性成像技术，对慢性乙肝肝纤维化患者进行前瞻性队列研究，与肝穿刺活检对照。',
    inclusionCriteria: '①慢性乙肝患者；②年龄20-65岁；③无肝硬化失代偿表现；④同意参与研究并签署知情同意书。',
    expectedOutcomes: '形成肝纤维化无创诊断专家共识，发表核心期刊论文2篇，培养研究生2名。',
  },
  {
    id: 3,
    title: '乳腺癌早筛超声AI辅助诊断系统研发',
    pi: '张伟',
    status: 'completed',
    statusText: '已完成',
    startDate: '2022-06-01',
    endDate: '2024-05-31',
    funding: '80万',
    fundingSource: '国家重点研发计划',
    type: '国家级',
    progress: 100,
    enrolled: 520,
    target: 500,
    objectives: '研发适用于大规模乳腺癌筛查的超声AI辅助诊断系统，提高早期检出率。',
    methods: '基于多中心超声影像数据，训练深度学习模型，开发移动端诊断APP，开展多中心临床验证。',
    inclusionCriteria: '①女性，年龄35-65岁；②无症状人群或门诊筛查患者；③乳腺影像资料完整。',
    expectedOutcomes: '开发乳腺癌早筛AI系统1套，在3家医院完成验证，诊断敏感度≥92%，特异度≥85%。',
  },
  {
    id: 4,
    title: '心血管超声影像标准化研究',
    pi: '刘涛',
    status: 'recruiting',
    statusText: '招募中',
    startDate: '2025-01-01',
    endDate: '2027-12-31',
    funding: '40万',
    fundingSource: '市级科技基金',
    type: '市级',
    progress: 15,
    enrolled: 32,
    target: 400,
    objectives: '建立心血管超声影像采集、存储、报告的标准化体系，提升超声诊断质量。',
    methods: '制定超声心动图标准化操作流程，建立质量控制体系，开发标准化报告模板。',
    inclusionCriteria: '①心脏疾病患者或健康体检者；②年龄不限；③接受标准化超声检查。',
    expectedOutcomes: '形成心血管超声标准化操作指南，发表论文2篇，推广至10家以上医疗机构。',
  },
  {
    id: 5,
    title: '超声造影在肾脏肿瘤诊断中的应用研究',
    pi: '陈晓燕',
    status: 'on-going',
    statusText: '进行中',
    startDate: '2023-09-01',
    endDate: '2025-08-31',
    funding: '25万',
    fundingSource: '医院种子基金',
    type: '院级',
    progress: 65,
    enrolled: 88,
    target: 150,
    objectives: '评估超声造影在肾脏肿瘤定性诊断中的价值，优化造影方案。',
    methods: '对肾脏占位性病变患者进行超声造影检查，与增强CT/MRI及病理对照分析。',
    inclusionCriteria: '①肾脏占位性病变患者；②年龄18-80岁；③无造影禁忌证。',
    expectedOutcomes: '建立肾脏肿瘤超声造影诊断流程，发表论文1-2篇。',
  },
  {
    id: 6,
    title: '经颅多普勒在脑卒中预警中的应用',
    pi: '赵志刚',
    status: 'recruiting',
    statusText: '招募中',
    startDate: '2025-03-01',
    endDate: '2026-02-28',
    funding: '20万',
    fundingSource: '省级科技计划',
    type: '省级',
    progress: 8,
    enrolled: 15,
    target: 200,
    objectives: '探索经颅多普勒超声在脑卒中风险评估中的应用价值。',
    methods: '对高危人群进行经颅多普勒筛查，建立微栓子监测标准，随访脑血管事件发生率。',
    inclusionCriteria: '①脑卒中高危人群（高血压、糖尿病、高脂血症等）；②年龄40-70岁。',
    expectedOutcomes: '建立脑卒中预警指标体系，发表论文1篇。',
  },
  {
    id: 7,
    title: '肌肉骨骼超声在运动损伤中的诊断价值',
    pi: '周海燕',
    status: 'completed',
    statusText: '已完成',
    startDate: '2021-01-01',
    endDate: '2023-12-31',
    funding: '35万',
    fundingSource: '市科技局',
    type: '市级',
    progress: 100,
    enrolled: 180,
    target: 180,
    objectives: '评估高频超声在运动系统软组织损伤中的诊断效能，建立诊断标准。',
    methods: '对运动损伤患者进行高频超声检查，与MRI及手术结果对照。',
    inclusionCriteria: '①运动损伤患者；②受伤后2周内；③临床资料完整。',
    expectedOutcomes: '建立运动损伤超声诊断指南，发表核心期刊2篇。',
  },
  {
    id: 8,
    title: '产前超声筛查质量控制体系的建立',
    pi: '吴雅琴',
    status: 'on-going',
    statusText: '进行中',
    startDate: '2024-06-01',
    endDate: '2026-05-31',
    funding: '45万',
    fundingSource: '国家卫健委项目',
    type: '国家级',
    progress: 45,
    enrolled: 320,
    target: 600,
    objectives: '建立规范的产前超声筛查质量控制体系，提高胎儿畸形检出率。',
    methods: '制定产前超声筛查标准化操作规范，建立远程质控平台，开展人员培训。',
    inclusionCriteria: '①孕20-28周孕妇；②单胎妊娠；③在我院建档产检。',
    expectedOutcomes: '形成产前超声筛查质量控制标准，发表论文2篇，培训技术人员50名。',
  },
  {
    id: 9,
    title: '超声引导下甲状腺结节穿刺活检的优化策略',
    pi: '孙立强',
    status: 'recruiting',
    statusText: '招募中',
    startDate: '2025-02-01',
    endDate: '2027-01-31',
    funding: '28万',
    fundingSource: '省级自然科学基金',
    type: '省级',
    progress: 12,
    enrolled: 28,
    target: 250,
    objectives: '优化超声引导下甲状腺结节细针穿刺活检的技术流程，提高取材成功率。',
    methods: '比较不同穿刺针型号、负压吸引方式对取材满意率的影响，建立最优方案。',
    inclusionCriteria: '①甲状腺结节TI-RADS 4类及以上；②年龄18-70岁；③无凝血功能障碍。',
    expectedOutcomes: '形成穿刺活检优化方案，发表论文1-2篇，申请实用新型专利1项。',
  },
]

// 入组患者Mock数据
const MOCK_ENROLLMENTS = [
  { id: 1, patientId: 'P20240001', name: '张某某', gender: '女', age: 45, enrollmentDate: '2024-02-15', status: 'on-treatment', lastVisit: '2024-12-20', notes: '已完成6个月随访' },
  { id: 2, patientId: 'P20240023', name: '李某某', gender: '女', age: 52, enrollmentDate: '2024-03-08', status: 'on-treatment', lastVisit: '2024-12-18', notes: '病灶缩小30%' },
  { id: 3, patientId: 'P20240045', name: '王某某', gender: '男', age: 38, enrollmentDate: '2024-04-12', status: 'completed', lastVisit: '2024-11-30', notes: '治疗结束，效果良好' },
  { id: 4, patientId: 'P20240067', name: '赵某某', gender: '女', age: 61, enrollmentDate: '2024-05-20', status: 'on-treatment', lastVisit: '2024-12-15', notes: '合并高血压，控制良好' },
  { id: 5, patientId: 'P20240089', name: '陈某某', gender: '男', age: 47, enrollmentDate: '2024-06-01', status: 'dropout', lastVisit: '2024-10-15', notes: '主动退出研究' },
  { id: 6, patientId: 'P20240101', name: '刘某某', gender: '女', age: 55, enrollmentDate: '2024-07-10', status: 'on-treatment', lastVisit: '2024-12-22', notes: '影像学评估待完成' },
  { id: 7, patientId: 'P20240123', name: '黄某某', gender: '女', age: 43, enrollmentDate: '2024-08-05', status: 'on-treatment', lastVisit: '2024-12-19', notes: '耐受性良好' },
  { id: 8, patientId: 'P20240145', name: '周某某', gender: '男', age: 59, enrollmentDate: '2024-09-18', status: 'screened', lastVisit: '2024-12-10', notes: '筛选期' },
]

// 进度报告Mock
const MOCK_REPORTS = [
  { id: 1, projectId: 1, date: '2024-12-01', type: '季度报告', author: '李明辉', content: '已完成数据标注8000例，模型训练V3版本准确率达88.5%，特异度85.2%。计划下季度完成剩余2000例标注及多中心验证。' },
  { id: 2, projectId: 1, date: '2024-09-01', type: '季度报告', author: '李明辉', content: '完成数据收集5200例，标注完成4200例。模型V2版本测试准确率86.3%，初步验证结果符合预期。' },
  { id: 3, projectId: 2, date: '2024-11-15', type: '中期报告', author: '王芳', content: '入组124例，完成弹性成像检查及肝穿刺68例。初步结果显示SWE值与纤维化分期显著相关（r=0.78）。' },
  { id: 4, projectId: 3, date: '2024-06-01', type: '结题报告', author: '张伟', content: '项目已完成各项指标。AI系统诊断敏感度93.2%，特异度87.5%，发表SCI论文3篇，申请专利2项，系统已推广至5家医院。' },
  { id: 5, projectId: 4, date: '2025-03-01', type: '启动报告', author: '刘涛', content: '项目正式启动。已完成标准化方案初稿制定，设备采购及人员培训。计划本月开始入组。' },
]

// 数据采集表单Mock
const MOCK_FORMS = [
  { id: 1, projectId: 1, formName: '甲状腺结节基本信息采集表', fields: 24, lastUpdate: '2024-12-20', responses: 186 },
  { id: 2, projectId: 1, formName: '超声影像采集记录表', fields: 36, lastUpdate: '2024-12-19', responses: 180 },
  { id: 3, projectId: 1, formName: '随访记录表（3/6/12月）', fields: 18, lastUpdate: '2024-12-18', responses: 142 },
  { id: 4, projectId: 2, formName: '肝纤维化评估表', fields: 22, lastUpdate: '2024-12-15', responses: 124 },
  { id: 5, projectId: 2, formName: '弹性成像检查记录', fields: 15, lastUpdate: '2024-12-14', responses: 118 },
]

// 统计图表数据
const MONTHLY_TREND = [
  { month: '1月', enrolled: 12, completed: 10 },
  { month: '2月', enrolled: 18, completed: 15 },
  { month: '3月', enrolled: 25, completed: 20 },
  { month: '4月', enrolled: 22, completed: 24 },
  { month: '5月', enrolled: 30, completed: 28 },
  { month: '6月', enrolled: 28, completed: 32 },
  { month: '7月', enrolled: 35, completed: 30 },
  { month: '8月', enrolled: 32, completed: 35 },
  { month: '9月', enrolled: 40, completed: 38 },
  { month: '10月', enrolled: 38, completed: 40 },
  { month: '11月', enrolled: 42, completed: 39 },
  { month: '12月', enrolled: 45, completed: 43 },
]

const STATUS_DISTRIBUTION = [
  { name: '招募中', value: 3 },
  { name: '进行中', value: 4 },
  { name: '已完成', value: 2 },
]

const FUNDING_BY_TYPE = [
  { type: '国家级', amount: 195 },
  { type: '省级', amount: 103 },
  { type: '市级', amount: 75 },
  { type: '院级', amount: 25 },
]

// ---------- 辅助函数 ----------
function getStatusStyle(status: string) {
  switch (status) {
    case 'recruiting':
      return { background: '#eff6ff', color: '#3b82f6' }
    case 'on-going':
      return { background: '#fff7ed', color: '#f97316' }
    case 'completed':
      return { background: '#f0fdf4', color: '#22c55e' }
    default:
      return { background: '#f1f5f9', color: '#64748b' }
  }
}

function getEnrollmentStatusStyle(status: string) {
  switch (status) {
    case 'on-treatment':
      return { background: '#eff6ff', color: '#3b82f6' }
    case 'completed':
      return { background: '#f0fdf4', color: '#22c55e' }
    case 'dropout':
      return { background: '#fef2f2', color: '#ef4444' }
    case 'screened':
      return { background: '#f5f3ff', color: '#8b5cf6' }
    default:
      return { background: '#f1f5f9', color: '#64748b' }
  }
}

// ---------- 主组件 ----------
export default function ResearchProjectPage() {
  const [activeTab, setActiveTab] = useState('projects')
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedProject, setSelectedProject] = useState<typeof RESEARCH_PROJECTS[0] | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false)
  const [showFormModal, setShowFormModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  // 过滤项目
  const filteredProjects = RESEARCH_PROJECTS.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(searchText.toLowerCase()) ||
      p.pi.toLowerCase().includes(searchText.toLowerCase())
    const matchStatus = statusFilter === 'all' || p.status === statusFilter
    return matchSearch && matchStatus
  })

  // 打开详情
  const openDetail = (project: typeof RESEARCH_PROJECTS[0]) => {
    setSelectedProject(project)
    setShowDetailModal(true)
  }

  // 统计汇总
  const totalProjects = RESEARCH_PROJECTS.length
  const recruitingCount = RESEARCH_PROJECTS.filter(p => p.status === 'recruiting').length
  const ongoingCount = RESEARCH_PROJECTS.filter(p => p.status === 'on-going').length
  const completedCount = RESEARCH_PROJECTS.filter(p => p.status === 'completed').length
  const totalFunding = RESEARCH_PROJECTS.reduce((sum, p) => sum + parseFloat(p.funding), 0)
  const totalEnrolled = RESEARCH_PROJECTS.reduce((sum, p) => sum + p.enrolled, 0)

  // 特定项目的入组数据
  const projectEnrollments = selectedProject
    ? MOCK_ENROLLMENTS.slice(0, 5)
    : []

  // 特定项目的报告
  const projectReports = selectedProject
    ? MOCK_REPORTS.filter(r => r.projectId === selectedProject.id)
    : []

  // 特定项目的表单
  const projectForms = selectedProject
    ? MOCK_FORMS.filter(f => f.projectId === selectedProject.id)
    : []

  return (
    <div style={s.root}>
      {/* 标题 */}
      <div style={s.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={s.title}>超声研究项目管理</h1>
            <p style={s.subtitle}>研究项目管理 · 患者入组追踪 · 数据采集 · 进度报告</p>
          </div>
          <div style={s.headerRight}>
            <button style={s.btnOutline}><Download size={14} /> 导出数据</button>
            <button style={s.btnPrimary}><Plus size={14} /> 新建项目</button>
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div style={s.statRow}>
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, background: '#eff6ff' }}>
            <Target size={20} color="#3b82f6" />
          </div>
          <div style={s.statInfo}>
            <div style={s.statValue}>{totalProjects}</div>
            <div style={s.statLabel}>研究项目</div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, background: '#fff7ed' }}>
            <Users size={20} color="#f97316" />
          </div>
          <div style={s.statInfo}>
            <div style={s.statValue}>{recruitingCount}</div>
            <div style={s.statLabel}>招募中</div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, background: '#f0fdf4' }}>
            <CheckCircle size={20} color="#22c55e" />
          </div>
          <div style={s.statInfo}>
            <div style={s.statValue}>{completedCount}</div>
            <div style={s.statLabel}>已完成</div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, background: '#f5f3ff' }}>
            <UserPlus size={20} color="#8b5cf6" />
          </div>
          <div style={s.statInfo}>
            <div style={s.statValue}>{totalEnrolled}</div>
            <div style={s.statLabel}>入组患者</div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, background: '#fef2f2' }}>
            <DollarSign size={20} color="#ef4444" />
          </div>
          <div style={s.statInfo}>
            <div style={s.statValue}>{totalFunding}万</div>
            <div style={s.statLabel}>科研经费</div>
          </div>
        </div>
      </div>

      {/* 搜索栏 */}
      <div style={s.searchBar}>
        <input
          style={s.searchInput}
          placeholder="搜索项目名称、负责人..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <select
          style={{ ...s.btnOutline, minWidth: 120 }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">全部状态</option>
          <option value="recruiting">招募中</option>
          <option value="on-going">进行中</option>
          <option value="completed">已完成</option>
        </select>
        <button style={s.btnOutline}><Filter size={14} /> 高级筛选</button>
      </div>

      {/* 标签页 */}
      <div style={s.tabs}>
        {[
          { key: 'projects', label: '项目列表' },
          { key: 'enrollment', label: '入组追踪' },
          { key: 'data', label: '数据采集' },
          { key: 'reports', label: '进度报告' },
          { key: 'statistics', label: '统计分析' },
        ].map(tab => (
          <div
            key={tab.key}
            style={activeTab === tab.key ? s.tabActive : s.tab}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </div>
        ))}
      </div>

      {/* 项目列表 */}
      {activeTab === 'projects' && (
        <div>
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              style={hoveredCard === project.id ? s.projectCardHover : s.projectCard}
              onMouseEnter={() => setHoveredCard(project.id)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => openDetail(project)}
            >
              <div style={s.projectHeader}>
                <div style={{ flex: 1 }}>
                  <div style={s.projectTitle}>{project.title}</div>
                  <div style={s.projectDesc}>
                    负责人：{project.pi} | {project.type} | {project.fundingSource}
                  </div>
                  <div style={s.projectMeta}>
                    <span><Calendar size={11} /> {project.startDate} 至 {project.endDate}</span>
                    <span><UserPlus size={11} /> 入组 {project.enrolled}/{project.target} 例</span>
                    <span><DollarSign size={11} /> {project.funding}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                  <span style={{ ...s.projectTag, ...getStatusStyle(project.status) }}>
                    {project.statusText}
                  </span>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>
                    进度 {project.progress}%
                  </span>
                </div>
              </div>
              <div style={s.projectProgress}>
                <div style={{
                  height: '100%',
                  width: `${project.progress}%`,
                  background: project.status === 'completed' ? '#22c55e' : '#3b82f6',
                  borderRadius: 3,
                }} />
              </div>
            </div>
          ))}
          {filteredProjects.length === 0 && (
            <div style={s.emptyState}>
              <Target size={48} style={{ marginBottom: 16, opacity: 0.4 }} />
              <p>未找到匹配的研究项目</p>
            </div>
          )}
        </div>
      )}

      {/* 入组追踪 */}
      {activeTab === 'enrollment' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#1a3a5c' }}>患者入组情况总览</span>
            <button style={s.btnPrimary}><UserPlus size={14} /> 新增入组</button>
          </div>
          <div style={s.chartCard}>
            <div style={s.chartTitle}><Activity size={16} style={s.chartIcon} /> 入组患者列表</div>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>患者ID</th>
                  <th style={s.th}>姓名</th>
                  <th style={s.th}>性别</th>
                  <th style={s.th}>年龄</th>
                  <th style={s.th}>入组日期</th>
                  <th style={s.th}>研究项目</th>
                  <th style={s.th}>状态</th>
                  <th style={s.th}>最近随访</th>
                  <th style={s.th}>备注</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_ENROLLMENTS.map((item) => (
                  <tr key={item.id}>
                    <td style={s.td}>{item.patientId}</td>
                    <td style={s.td}>{item.name}</td>
                    <td style={s.td}>{item.gender}</td>
                    <td style={s.td}>{item.age}</td>
                    <td style={s.td}>{item.enrollmentDate}</td>
                    <td style={s.td}>
                      <span style={{ ...s.projectTag, background: '#eff6ff', color: '#3b82f6' }}>
                        项目{RESEARCH_PROJECTS.find(p => p.id === 1)?.pi.substring(0, 2)}某
                      </span>
                    </td>
                    <td style={s.td}>
                      <span style={{ ...s.projectTag, ...getEnrollmentStatusStyle(item.status) }}>
                        {item.status === 'on-treatment' ? '治疗中' : item.status === 'completed' ? '已完成' : item.status === 'dropout' ? '脱落' : '筛选中'}
                      </span>
                    </td>
                    <td style={s.td}>{item.lastVisit}</td>
                    <td style={s.td}>{item.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* 入组趋势图 */}
          <div style={s.chartGrid}>
            <div style={s.chartCard}>
              <div style={s.chartTitle}><TrendingUp size={16} style={s.chartIcon} /> 月度入组趋势</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={MONTHLY_TREND}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <Tooltip {...tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="enrolled" fill="#3b82f6" name="入组数" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completed" fill="#22c55e" name="完成数" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={s.chartCard}>
              <div style={s.chartTitle}><PieChartIcon size={16} style={s.chartIcon} /> 项目状态分布</div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={STATUS_DISTRIBUTION}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {STATUS_DISTRIBUTION.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* 数据采集 */}
      {activeTab === 'data' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#1a3a5c' }}>数据采集表单</span>
            <button style={s.btnPrimary}><Plus size={14} /> 新建表单</button>
          </div>
          <div style={s.cardGrid}>
            {MOCK_FORMS.map((form) => (
              <div key={form.id} style={s.formCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 4 }}>{form.formName}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>
                      字段数：{form.fields} | 填写数：{form.responses}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button style={s.btnIcon}><Edit size={14} color="#64748b" /></button>
                    <button style={s.btnIcon}><Eye size={14} color="#64748b" /></button>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>最后更新：{form.lastUpdate}</span>
                  <button style={{ ...s.btnOutline, padding: '4px 10px', fontSize: 12 }}>预览</button>
                </div>
              </div>
            ))}
          </div>
          {/* 采集数据预览 */}
          <div style={s.chartCard}>
            <div style={s.chartTitle}><ClipboardList size={16} style={s.chartIcon} /> 数据质量概览</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              {[
                { label: '表单总数', value: MOCK_FORMS.length, color: '#3b82f6' },
                { label: '填写完整率', value: '94.2%', color: '#22c55e' },
                { label: '数据完整率', value: '96.8%', color: '#f97316' },
                { label: '平均填写时长', value: '8.5min', color: '#8b5cf6' },
              ].map((item, i) => (
                <div key={i} style={{ textAlign: 'center', padding: 16, background: '#f8fafc', borderRadius: 8 }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: item.color }}>{item.value}</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 进度报告 */}
      {activeTab === 'reports' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#1a3a5c' }}>项目进度报告</span>
            <button style={s.btnPrimary}><Plus size={14} /> 新建报告</button>
          </div>
          <div>
            {MOCK_REPORTS.map((report) => (
              <div key={report.id} style={s.reportItem}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#1a3a5c' }}>
                      {RESEARCH_PROJECTS.find(p => p.id === report.projectId)?.title.substring(0, 10)}...
                    </span>
                    <span style={{ ...s.projectTag, background: report.type === '季度报告' ? '#eff6ff' : report.type === '中期报告' ? '#fff7ed' : '#f0fdf4', color: report.type === '季度报告' ? '#3b82f6' : report.type === '中期报告' ? '#f97316' : '#22c55e' }}>
                      {report.type}
                    </span>
                  </div>
                  <span style={s.reportDate}>{report.date}</span>
                </div>
                <div style={{ fontSize: 13, color: '#475569', marginBottom: 6 }}>{report.content}</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>报告人：{report.author}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 统计分析 */}
      {activeTab === 'statistics' && (
        <div>
          <div style={s.chartGrid}>
            <div style={s.chartCard}>
              <div style={s.chartTitle}><TrendingUp size={16} style={s.chartIcon} /> 年度入组趋势</div>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={MONTHLY_TREND}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip {...tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="enrolled" stroke="#3b82f6" strokeWidth={2} name="入组数" dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="completed" stroke="#22c55e" strokeWidth={2} name="完成数" dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div style={s.chartCard}>
              <div style={s.chartTitle}><PieChartIcon size={16} style={s.chartIcon} /> 经费分布（按类型）</div>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={FUNDING_BY_TYPE}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="amount"
                    nameKey="type"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {FUNDING_BY_TYPE.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}万`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div style={s.chartCard}>
            <div style={s.chartTitle}><BarChart3 size={16} style={s.chartIcon} /> 各项目经费对比</div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={RESEARCH_PROJECTS.map(p => ({ name: p.title.substring(0, 8) + '...', funding: parseFloat(p.funding) }))} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} width={80} />
                <Tooltip {...tooltipStyle} formatter={(value) => `${value}万`} />
                <Bar dataKey="funding" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 项目详情模态框 */}
      {showDetailModal && selectedProject && (
        <div style={s.modal} onClick={() => setShowDetailModal(false)}>
          <div style={s.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h2 style={s.modalTitle}>项目详情</h2>
              <button style={s.btnIcon} onClick={() => setShowDetailModal(false)}>
                <X size={18} color="#64748b" />
              </button>
            </div>

            {/* 项目基本信息 */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a3a5c', marginBottom: 8 }}>{selectedProject.title}</h3>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ ...s.projectTag, ...getStatusStyle(selectedProject.status) }}>{selectedProject.statusText}</span>
                    <span style={{ ...s.projectTag, background: '#f5f3ff', color: '#8b5cf6' }}>{selectedProject.type}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#3b82f6' }}>{selectedProject.progress}%</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>完成进度</div>
                </div>
              </div>

              <div style={s.detailSection}>
                <div style={s.detailItem}>
                  <span style={s.detailLabel}>项目负责人：</span>
                  <span style={s.detailValue}>{selectedProject.pi}</span>
                </div>
                <div style={s.detailItem}>
                  <span style={s.detailLabel}>研究期限：</span>
                  <span style={s.detailValue}>{selectedProject.startDate} 至 {selectedProject.endDate}</span>
                </div>
                <div style={s.detailItem}>
                  <span style={s.detailLabel}>科研经费：</span>
                  <span style={s.detailValue}>{selectedProject.funding}（{selectedProject.fundingSource}）</span>
                </div>
              </div>
            </div>

            {/* 入组进度 */}
            <div style={s.detailSection}>
              <div style={s.detailSectionTitle}><Users size={16} color="#3b82f6" /> 患者入组进度</div>
              <div style={s.enrollmentCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: '#475569' }}>入组人数</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#1a3a5c' }}>{selectedProject.enrolled} / {selectedProject.target} 例</span>
                </div>
                <div style={s.enrollmentBar}>
                  <div style={{
                    height: '100%',
                    width: `${(selectedProject.enrolled / selectedProject.target) * 100}%`,
                    background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
                    borderRadius: 4,
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>完成率</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#3b82f6' }}>
                    {((selectedProject.enrolled / selectedProject.target) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* 研究目标 */}
            <div style={s.detailSection}>
              <div style={s.detailSectionTitle}><Target size={16} color="#8b5cf6" /> 研究目标</div>
              <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.7 }}>{selectedProject.objectives}</p>
            </div>

            {/* 研究方法 */}
            <div style={s.detailSection}>
              <div style={s.detailSectionTitle}><FlaskConical size={16} color="#22c55e" /> 研究方法</div>
              <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.7 }}>{selectedProject.methods}</p>
            </div>

            {/* 入组标准 */}
            <div style={s.detailSection}>
              <div style={s.detailSectionTitle}><CheckCircle size={16} color="#f97316" /> 入组标准</div>
              <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.7 }}>{selectedProject.inclusionCriteria}</p>
            </div>

            {/* 预期成果 */}
            <div style={s.detailSection}>
              <div style={s.detailSectionTitle}><Award size={16} color="#14b8a6" /> 预期成果</div>
              <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.7 }}>{selectedProject.expectedOutcomes}</p>
            </div>

            {/* 操作按钮 */}
            <div style={{ display: 'flex', gap: 8, marginTop: 24, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
              <button style={s.btnPrimary}><UserPlus size={14} /> 入组患者</button>
              <button style={s.btnOutline}><ClipboardList size={14} /> 数据采集</button>
              <button style={s.btnOutline}><FileText size={14} /> 进度报告</button>
              <button style={s.btnOutline}><Edit size={14} /> 编辑项目</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
