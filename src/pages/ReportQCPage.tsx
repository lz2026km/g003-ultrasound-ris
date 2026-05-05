// ============================================================
// G003 超声RIS系统 - 报告质量评分系统页面
// 三维度评分 · 等级管理 · 统计分析 · 月报生成 · 改进建议
// 参考岱嘉报告质控评分标准
// ============================================================
import React, { useState, useMemo } from 'react'
import {
  FileText, Award, BarChart3, ClipboardCheck, Search, Filter,
  Download, Calendar, Clock, TrendingUp, TrendingDown, Users,
  AlertTriangle, CheckCircle, XCircle, ShieldCheck, Eye,
  Edit3, Trash2, Plus, RefreshCw, ChevronRight, Star,
  PieChart as PieChartIcon, Target, AlertCircle, BadgeCheck,
  X, Check, Info, Activity, Bell, Lightbulb, BookOpen,
  MessageSquare, Percent, BarChart2, ListChecks, AlertOctagon
} from 'lucide-react'

// ========== 类型定义 ==========
type TabKey = 'dimensions' | 'grades' | 'statistics' | 'unqualified' | 'report' | 'suggestions'

// 三维度评分体系 (岱嘉标准)
interface ThreeDimensionScore {
  completeness: number      // 完整性: 必填项齐全 (0-100)
  normCompliance: number   // 规范性: 术语/格式标准 (0-100)
  timeliness: number       // 时效性: 规定时间内完成 (0-100)
}

interface ScoringDimension {
  id: string
  name: string
  code: string
  category: 'completeness' | 'normCompliance' | 'timeliness' | 'image' | 'operation'
  description: string
  maxScore: number
  weight: number
  enabled: boolean
}

// 评分等级 (甲级100-90/乙级89-75/丙级74-60/不合格<60)
interface GradeLevel {
  id: string
  name: string
  code: string
  minScore: number
  maxScore: number
  color: string
  bgColor: string
  description: string
  requiresReview: boolean
}

interface QCRecord {
  id: number
  date: string
  patientName: string
  examType: string
  reportId: string
  doctor: string
  department: string
  totalScore: number
  threeScores: ThreeDimensionScore
  grade: string
  issues: QCIssue[]
  status: 'pending' | 'passed' | 'failed' | 'reviewed'
  isQualified: boolean
}

interface QCIssue {
  type: 'missing_item' | 'non_standard_desc' | 'non_standard_image' | 'timeout' | 'other'
  detail: string
  severity: 'high' | 'medium' | 'low'
  score: number
}

interface UnqualifiedItem {
  id: string
  recordId: number
  date: string
  patientName: string
  examType: string
  reportId: string
  doctor: string
  department: string
  failReasons: string[]
  failTypes: QCIssue['type'][]
  severity: 'high' | 'medium' | 'low'
  status: 'pending' | 'rectified' | 'ignored'
  rectNote: string
}

// 质量问题分类统计
interface IssueStats {
  type: QCIssue['type']
  label: string
  count: number
  percentage: number
  avgScore: number
  trend: number
}

// 月报数据结构
interface MonthlyReport {
  month: string
  totalReports: number
  qualifiedCount: number
  unqualifiedCount: number
  passRate: number
  avgScore: number
  avgCompleteness: number
  avgNormCompliance: number
  avgTimeliness: number
  gradeDistribution: { grade: string; count: number; percentage: number }[]
  issueStats: IssueStats[]
  topIssues: { type: string; count: number }[]
  improvementSuggestions: string[]
}

// 质量改进建议
interface ImprovementSuggestion {
  id: string
  category: string
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  targetDimension: string
  affectedCount: number
  recommendedActions: string[]
}

// ========== 评分维度数据 (三维度体系) ==========
const SCORING_DIMENSIONS: ScoringDimension[] = [
  // 完整性维度 (报告必填项齐全)
  { id: 'D01', name: '患者信息完整', code: 'C01', category: 'completeness', description: '姓名/性别/年龄/科室等基本信息完整', maxScore: 100, weight: 8, enabled: true },
  { id: 'D02', name: '临床诊断信息完整', code: 'C02', category: 'completeness', description: '申请科室/临床诊断/检查目的等完整', maxScore: 100, weight: 8, enabled: true },
  { id: 'D03', name: '检查所见描述完整', code: 'C03', category: 'completeness', description: '各部位/器官描述无遗漏', maxScore: 100, weight: 10, enabled: true },
  { id: 'D04', name: '超声诊断结论完整', code: 'C04', category: 'completeness', description: '诊断结论准确完整', maxScore: 100, weight: 10, enabled: true },
  { id: 'D05', name: '签名与审核完整', code: 'C05', category: 'completeness', description: '报告医师/审核医师签名完整', maxScore: 100, weight: 4, enabled: true },
  // 规范性维度 (术语/格式标准)
  { id: 'D06', name: '术语使用规范', code: 'N01', category: 'normCompliance', description: '超声术语符合国家/行业标准', maxScore: 100, weight: 10, enabled: true },
  { id: 'D07', name: '描述格式规范', code: 'N02', category: 'normCompliance', description: '描述格式符合超声报告规范', maxScore: 100, weight: 8, enabled: true },
  { id: 'D08', name: '测量单位规范', code: 'N03', category: 'normCompliance', description: '测量值单位使用标准单位', maxScore: 100, weight: 5, enabled: true },
  { id: 'D09', name: '图像标注规范', code: 'N04', category: 'normCompliance', description: '图像标注信息完整准确', maxScore: 100, weight: 7, enabled: true },
  { id: 'D10', name: '诊断描述准确', code: 'N05', category: 'normCompliance', description: '诊断描述准确无误', maxScore: 100, weight: 10, enabled: true },
  // 时效性维度 (规定时间内完成)
  { id: 'D11', name: '急诊报告时效', code: 'T01', category: 'timeliness', description: '急诊报告30分钟内完成', maxScore: 100, weight: 10, enabled: true },
  { id: 'D12', name: '门诊报告时效', code: 'T02', category: 'timeliness', description: '门诊报告2小时内完成', maxScore: 100, weight: 10, enabled: true },
  { id: 'D13', name: '住院报告时效', code: 'T03', category: 'timeliness', description: '住院报告24小时内完成', maxScore: 100, weight: 5, enabled: true },
  { id: 'D14', name: '图像采集时效', code: 'T04', category: 'timeliness', description: '图像采集及时完成', maxScore: 100, weight: 5, enabled: true },
]

// ========== 评分等级 (岱嘉标准: 甲级100-90/乙级89-75/丙级74-60/不合格<60) ==========
const GRADE_LEVELS: GradeLevel[] = [
  { id: 'G01', name: '甲级', code: '甲', minScore: 90, maxScore: 100, color: '#16a34a', bgColor: '#dcfce7', description: '综合评分90-100分，质量卓越，达到三甲医院标准', requiresReview: false },
  { id: 'G02', name: '乙级', code: '乙', minScore: 75, maxScore: 89, color: '#2563eb', bgColor: '#dbeafe', description: '综合评分75-89分，质量良好，符合规范要求', requiresReview: false },
  { id: 'G03', name: '丙级', code: '丙', minScore: 60, maxScore: 74, color: '#d97706', bgColor: '#fef3c7', description: '综合评分60-74分，质量合格，需改进', requiresReview: true },
  { id: 'G04', name: '不合格', code: '丁', minScore: 0, maxScore: 59, color: '#dc2626', bgColor: '#fee2e2', description: '综合评分60分以下，质量不合格，需重点整改', requiresReview: true },
]

// ========== Mock 数据 ==========
const generateQCRecords = (): QCRecord[] => {
  const patients = ['张伟', '王芳', '李明', '刘洋', '陈静', '杨帆', '赵雷', '周婷', '吴强', '郑鑫',
                    '孙鹏', '马云', '李娜', '王磊', '刘芳', '陈刚', '周洋', '吴琳', '郑浩', '冯雪']
  const types = ['上腹部超声', '盆腔超声', '甲状腺超声', '乳腺超声', '心脏超声', '血管超声']
  const doctors = ['李建国', '王秀英', '张志远', '刘德明', '陈晓燕', '赵文博']
  const departments = ['超声科', '心血管超声', '妇产科超声', '浅表器官超声', '介入超声']

  const issueTypes: QCIssue['type'][] = ['missing_item', 'non_standard_desc', 'non_standard_image', 'timeout']
  const issueDetails: Record<QCIssue['type'], string[]> = {
    'missing_item': ['患者年龄缺失', '临床诊断缺失', '检查部位描述不完整', '签名缺失'],
    'non_standard_desc': ['术语使用不规范', '描述顺序混乱', '单位标注错误', '格式不符合规范'],
    'non_standard_image': ['标准切面缺失', '图像标注错误', '图像质量不达标', '切面数量不足'],
    'timeout': ['报告迟交超过24小时', '急诊报告超时', '图像采集延迟'],
    'other': ['其他问题']
  }

  return Array.from({ length: 150 }, (_, i) => {
    // 生成三维度评分
    const completeness = Math.floor(Math.random() * 25) + 75 // 75-100
    const normCompliance = Math.floor(Math.random() * 30) + 65 // 65-95
    const timeliness = Math.floor(Math.random() * 35) + 60 // 60-95

    // 加权计算总分
    const totalScore = Math.round(completeness * 0.35 + normCompliance * 0.40 + timeliness * 0.25)

    const grade = totalScore >= 90 ? '甲级' : totalScore >= 75 ? '乙级' : totalScore >= 60 ? '丙级' : '不合格'
    const isQualified = totalScore >= 60

    // 生成问题列表
    const issues: QCIssue[] = []
    if (completeness < 85) {
      issues.push({ type: 'missing_item', detail: issueDetails.missing_item[i % issueDetails.missing_item.length], severity: 'medium', score: 5 })
    }
    if (normCompliance < 80) {
      issues.push({ type: 'non_standard_desc', detail: issueDetails.non_standard_desc[i % issueDetails.non_standard_desc.length], severity: 'high', score: 10 })
    }
    if (timeliness < 75) {
      issues.push({ type: 'timeout', detail: issueDetails.timeout[i % issueDetails.timeout.length], severity: 'medium', score: 8 })
    }
    if (Math.random() < 0.15) {
      issues.push({ type: 'non_standard_image', detail: issueDetails.non_standard_image[i % issueDetails.non_standard_image.length], severity: 'low', score: 3 })
    }

    return {
      id: i + 1,
      date: `2026-04-${String(30 - (i % 30)).padStart(2, '0')}`,
      patientName: patients[i % patients.length],
      examType: types[i % types.length],
      reportId: `RPT-${String(2026040001 + i).padStart(10, '0')}`,
      doctor: doctors[i % doctors.length],
      department: departments[i % departments.length],
      totalScore,
      threeScores: { completeness, normCompliance, timeliness },
      grade,
      issues,
      status: isQualified ? 'passed' : (i % 3 === 0 ? 'reviewed' : 'failed'),
      isQualified,
    }
  })
}

const generateUnqualifiedList = (): UnqualifiedItem[] => {
  const patients = ['张伟', '王芳', '李明', '刘洋', '陈静', '杨帆', '赵雷']
  const types = ['上腹部超声', '盆腔超声', '甲状腺超声', '乳腺超声', '心脏超声']
  const doctors = ['李建国', '王秀英', '张志远', '刘德明']
  const departments = ['超声科', '心血管超声', '妇产科超声']
  const failReasonsList = [
    { reasons: ['报告完整性严重不足', '关键描述缺失'], types: ['missing_item'] as QCIssue['type'][] },
    { reasons: ['图像采集不完整', '标准切面缺失3个以上'], types: ['non_standard_image'] as QCIssue['type'][] },
    { reasons: ['报告迟交超过48小时', '违反报告时限规定'], types: ['timeout'] as QCIssue['type'][] },
    { reasons: ['诊断描述不准确', '与临床不符'], types: ['non_standard_desc'] as QCIssue['type'][] },
    { reasons: ['图像质量严重不达标', '无法用于诊断'], types: ['non_standard_image'] as QCIssue['type'][] },
  ]
  const rectNotes = ['', '已补充完整报告', '已重新采集图像', '情况特殊，申请豁免', '']

  return Array.from({ length: 22 }, (_, i) => ({
    id: `UQ-${String(i + 1).padStart(3, '0')}`,
    recordId: 1001 + i,
    date: `2026-04-${String(28 - (i % 28)).padStart(2, '0')}`,
    patientName: patients[i % patients.length],
    examType: types[i % types.length],
    reportId: `RPT-${String(2026040001 + i).padStart(10, '0')}`,
    doctor: doctors[i % doctors.length],
    department: departments[i % departments.length],
    failReasons: failReasonsList[i % failReasonsList.length].reasons,
    failTypes: failReasonsList[i % failReasonsList.length].types,
    severity: i % 3 === 0 ? 'high' : i % 3 === 1 ? 'medium' : 'low',
    status: i % 4 === 0 ? 'rectified' : i % 4 === 1 ? 'ignored' : 'pending',
    rectNote: rectNotes[i % rectNotes.length],
  }))
}

// ========== 样式 ==========
const s: Record<string, React.CSSProperties> = {
  pageWrapper: {
    display: 'flex', flexDirection: 'column', height: '100%', minHeight: '80vh',
    background: '#f0f4f8', padding: 20,
  },
  pageHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 16, flexShrink: 0,
  },
  title: { fontSize: 20, fontWeight: 700, color: '#1a3a5c', display: 'flex', alignItems: 'center', gap: 10, margin: 0 },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 4 },
  headerActions: { display: 'flex', gap: 10 },
  btnLarge: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 8,
    padding: '10px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(26,58,92,0.2)', minHeight: 44,
  },
  btnLargeSuccess: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8,
    padding: '10px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(22,163,74,0.2)', minHeight: 44,
  },
  btnLargeInfo: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8,
    padding: '10px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(37,99,235,0.2)', minHeight: 44,
  },
  btnLargeWarning: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    background: '#d97706', color: '#fff', border: 'none', borderRadius: 8,
    padding: '10px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(217,119,6,0.2)', minHeight: 44,
  },
  btnIcon: {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 6,
    padding: '8px 12px', fontSize: 12, cursor: 'pointer', minHeight: 36,
  },
  filterBar: {
    display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' as const,
    background: '#fff', padding: '12px 16px', borderRadius: 8,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: 12,
  },
  searchBox: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: '#f8fafc', border: '1px solid #e2e8f0',
    borderRadius: 6, padding: '8px 12px', flex: 1, minWidth: 200,
  },
  searchInput: {
    border: 'none', outline: 'none', background: 'transparent',
    fontSize: 13, color: '#334155', width: '100%',
  },
  select: {
    border: '1px solid #e2e8f0', borderRadius: 6, padding: '8px 12px',
    fontSize: 13, color: '#334155', background: '#f8fafc', outline: 'none', cursor: 'pointer',
  },
  threeColGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 16 },
  fourColGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 16 },
  fiveColGrid: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 16 },
  panel: {
    background: '#fff', borderRadius: 10, overflow: 'hidden',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column' as const,
  },
  panelHeader: {
    padding: '12px 16px', borderBottom: '1px solid #e2e8f0',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    background: '#f8fafc', flexShrink: 0,
  },
  panelTitle: { fontSize: 14, fontWeight: 700, color: '#1a3a5c', display: 'flex', alignItems: 'center', gap: 6, margin: 0 },
  panelBody: { padding: 16, overflowY: 'auto' as const, flex: 1 },
  tabNav: {
    display: 'flex', borderBottom: '1px solid #e2e8f0', padding: '0 16px', background: '#fff',
  },
  tabBtn: {
    padding: '14px 20px', border: 'none', background: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 500,
    color: '#64748b', borderBottom: '2px solid transparent', marginBottom: -1,
  },
  tabBtnActive: {
    padding: '14px 20px', border: 'none', background: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600,
    color: '#2563eb', borderBottom: '2px solid #2563eb', marginBottom: -1,
  },
  kpiCard: {
    background: '#fff', borderRadius: 12, padding: 20,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb',
  },
  kpiLabel: { fontSize: 13, color: '#64748b', margin: 0 },
  kpiValue: { fontSize: 28, fontWeight: 700, color: '#1f2937', margin: '8px 0 0 0' },
  kpiSub: { fontSize: 12, color: '#64748b', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: 4 },
  badge: {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 500,
  },
  badgeSuccess: { background: '#dcfce7', color: '#16a34a' },
  badgeWarning: { background: '#fef3c7', color: '#d97706' },
  badgeDanger: { background: '#fee2e2', color: '#dc2626' },
  badgeInfo: { background: '#dbeafe', color: '#2563eb' },
  badgePurple: { background: '#f3e8ff', color: '#7c3aed' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    background: '#f8fafc', padding: '10px 12px', textAlign: 'left' as const,
    fontSize: 12, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e2e8f0',
  },
  td: {
    padding: '10px 12px', fontSize: 13, color: '#334155', borderBottom: '1px solid #f1f5f9',
  },
  pagination: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 16px', background: '#fff', borderTop: '1px solid #e2e8f0',
  },
  pageInfo: { fontSize: 13, color: '#64748b' },
  pageBtns: { display: 'flex', gap: 4 },
  pageBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 36, height: 36, borderRadius: 6, border: '1px solid #e2e8f0',
    background: '#fff', cursor: 'pointer', fontSize: 13, color: '#475569',
  },
  pageBtnActive: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 36, height: 36, borderRadius: 6, border: '1px solid #2563eb',
    background: '#2563eb', cursor: 'pointer', fontSize: 13, color: '#fff',
  },
  // 维度卡片
  dimensionCard: {
    background: '#fff', borderRadius: 10, padding: 16,
    border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' as const, gap: 12,
  },
  dimensionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  dimensionIcon: {
    width: 44, height: 44, borderRadius: 10, display: 'flex',
    alignItems: 'center', justifyContent: 'center',
  },
  dimensionName: { fontSize: 14, fontWeight: 600, color: '#1a3a5c', margin: '8px 0 4px' },
  dimensionDesc: { fontSize: 12, color: '#64748b', lineHeight: 1.5 },
  dimensionMeta: { display: 'flex', gap: 16, marginTop: 8 },
  dimensionMetaItem: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#64748b' },
  dimensionScore: { fontSize: 22, fontWeight: 800, color: '#1a3a5c' },
  // 等级卡片
  gradeCard: {
    background: '#fff', borderRadius: 10, padding: 20,
    border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' as const, gap: 12,
    position: 'relative', overflow: 'hidden',
  },
  gradeHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  gradeBadge: {
    width: 56, height: 56, borderRadius: 12, display: 'flex',
    alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800,
  },
  gradeName: { fontSize: 18, fontWeight: 700, color: '#1a3a5c' },
  gradeRange: { fontSize: 12, color: '#64748b', marginTop: 2 },
  gradeDesc: { fontSize: 13, color: '#475569', lineHeight: 1.5 },
  gradeStats: { display: 'flex', gap: 16, paddingTop: 12, borderTop: '1px solid #f1f5f9' },
  gradeStat: { display: 'flex', flexDirection: 'column' as const },
  gradeStatValue: { fontSize: 18, fontWeight: 700, color: '#1a3a5c' },
  gradeStatLabel: { fontSize: 11, color: '#64748b' },
  gradeBar: { height: 8, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden', marginTop: 8 },
  gradeBarFill: { height: '100%', borderRadius: 4, transition: 'width 0.5s' },
  // 统计图表区
  chartPanel: {
    background: '#fff', borderRadius: 10, padding: 16,
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: 16,
  },
  chartTitle: { fontSize: 14, fontWeight: 700, color: '#1a3a5c', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 },
  chartRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  chartRow3: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 },
  // 不合格卡片
  unqualifiedCard: {
    background: '#fff', borderRadius: 8, padding: 14, marginBottom: 8,
    border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' as const, gap: 8,
  },
  unqualifiedHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  unqualifiedTitle: { fontSize: 13, fontWeight: 600, color: '#1a3a5c' },
  unqualifiedMeta: { display: 'flex', gap: 16, fontSize: 12, color: '#64748b' },
  unqualifiedReasons: { display: 'flex', flexWrap: 'wrap' as const, gap: 6 },
  unqualifiedReason: {
    padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 500,
  },
  severityHigh: { background: '#fee2e2', color: '#dc2626' },
  severityMedium: { background: '#fef3c7', color: '#d97706' },
  severityLow: { background: '#dbeafe', color: '#2563eb' },
  // 切换开关
  toggle: {
    width: 44, height: 24, borderRadius: 12, position: 'relative' as const,
    cursor: 'pointer', transition: 'background 0.2s', border: 'none',
  },
  toggleOn: { background: '#16a34a' },
  toggleOff: { background: '#e5e7eb' },
  toggleKnob: {
    width: 20, height: 20, borderRadius: '50%', background: '#fff',
    position: 'absolute' as const, top: 2, transition: 'left 0.2s',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
  },
  // 空状态
  emptyState: { textAlign: 'center' as const, padding: '48px 20px', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 12 },
  emptyIcon: { width: 72, height: 72, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  emptyText: { fontSize: 16, color: '#94a3b8', fontWeight: 500 },
  emptySubtext: { fontSize: 13, color: '#cbd5e1' },
  // 环形图
  donutContainer: { position: 'relative' as const, display: 'inline-block' },
  donutCenter: { position: 'absolute' as const, top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' as const },
  // 趋势条
  trendBarContainer: { display: 'flex', alignItems: 'flex-end', gap: 3, height: 40 },
  trendBar: { flex: 1, borderRadius: '3px 3px 0 0', minWidth: 8, transition: 'height 0.3s' },
  // 分数条
  scoreBar: { flex: 1, height: 8, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' },
  scoreBarFill: { height: '100%', borderRadius: 4, transition: 'width 0.5s' },
  // 三维度得分卡
  dimensionScoreCard: {
    background: '#fff', borderRadius: 12, padding: 20,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb',
    display: 'flex', flexDirection: 'column' as const, gap: 12,
  },
  dimensionScoreTitle: { fontSize: 14, fontWeight: 600, color: '#1a3a5c', display: 'flex', alignItems: 'center', gap: 8 },
  dimensionScoreValue: { fontSize: 36, fontWeight: 800 },
  dimensionScoreBar: { height: 10, background: '#e5e7eb', borderRadius: 5, overflow: 'hidden' },
  dimensionScoreBarFill: { height: '100%', borderRadius: 5, transition: 'width 0.5s' },
  // 月报卡片
  reportCard: {
    background: '#fff', borderRadius: 10, padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: 16,
    border: '1px solid #e5e7eb',
  },
  reportTitle: { fontSize: 16, fontWeight: 700, color: '#1a3a5c', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 },
  reportSection: { marginBottom: 20 },
  reportSectionTitle: { fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 12, textTransform: 'uppercase' as const, letterSpacing: 0.5 },
  reportStatRow: { display: 'flex', gap: 24, marginBottom: 12 },
  reportStat: { display: 'flex', flexDirection: 'column' as const },
  reportStatValue: { fontSize: 24, fontWeight: 700, color: '#1a3a5c' },
  reportStatLabel: { fontSize: 12, color: '#64748b' },
  // 建议卡片
  suggestionCard: {
    background: '#fff', borderRadius: 10, padding: 16,
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: 12,
    border: '1px solid #e5e7eb', borderLeft: '4px solid',
  },
  suggestionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  suggestionTitle: { fontSize: 14, fontWeight: 600, color: '#1a3a5c' },
  suggestionDesc: { fontSize: 13, color: '#475569', lineHeight: 1.6, marginBottom: 12 },
  suggestionActions: { display: 'flex', flexDirection: 'column' as const, gap: 6 },
  suggestionAction: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#2563eb' },
  // 问题分类标签
  issueTag: {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 500,
  },
  issueTagMissing: { background: '#fee2e2', color: '#dc2626' },
  issueTagNonStandard: { background: '#fef3c7', color: '#d97706' },
  issueTagImage: { background: '#dbeafe', color: '#2563eb' },
  issueTagTimeout: { background: '#f3e8ff', color: '#7c3aed' },
  // 柱状图
  barChart: { display: 'flex', flexDirection: 'column' as const, gap: 8 },
  barChartItem: { display: 'flex', alignItems: 'center', gap: 12 },
  barChartLabel: { fontSize: 12, color: '#64748b', minWidth: 80 },
  barChartBar: { flex: 1, height: 20, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' },
  barChartBarFill: { height: '100%', borderRadius: 4, transition: 'width 0.5s', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 8 },
  barChartValue: { fontSize: 11, fontWeight: 600, color: '#fff' },
  // 高亮数字
  highlightNumber: { fontSize: 32, fontWeight: 800, lineHeight: 1 },
  highlightUnit: { fontSize: 14, color: '#64748b', marginLeft: 4 },
}

// ========== 子组件 ==========
const EmptyState = ({ icon: Icon, text, subtext }: { icon: React.ElementType; text: string; subtext: string }) => (
  <div style={s.emptyState}>
    <div style={s.emptyIcon}><Icon size={32} color="#94a3b8" /></div>
    <div style={s.emptyText}>{text}</div>
    <div style={s.emptySubtext}>{subtext}</div>
  </div>
)

// 环形图
const DonutChart = ({ value, size = 80, stroke = 8, color = '#2563eb' }: { value: number; size?: number; stroke?: number; color?: string }) => {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference
  return (
    <div style={s.donutContainer}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div style={s.donutCenter}>
        <div style={{ fontSize: 16, fontWeight: 800, color: '#1a3a5c' }}>{value}</div>
        <div style={{ fontSize: 9, color: '#94a3b8' }}>%</div>
      </div>
    </div>
  )
}

// 趋势图
const TrendChart = ({ data, color }: { data: number[]; color: string }) => {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  return (
    <div style={s.trendBarContainer}>
      {data.map((val, i) => {
        const height = 5 + ((val - min) / range) * 35
        return (
          <div key={i} style={{ ...s.trendBar, height, background: i === data.length - 1 ? color : `${color}66` }} title={`${val.toFixed(1)}%`} />
        )
      })}
    </div>
  )
}

// 切换开关
const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
  <button
    style={{ ...s.toggle, ...(checked ? s.toggleOn : s.toggleOff) }}
    onClick={() => onChange(!checked)}
    role="switch"
    aria-checked={checked}
  >
    <div style={{ ...s.toggleKnob, left: checked ? 22 : 2 }} />
  </button>
)

// ========== 主组件 ==========
export default function ReportQCPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('dimensions')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [filterType, setFilterType] = useState('全部')
  const [filterGrade, setFilterGrade] = useState('全部')
  const [filterStatus, setFilterStatus] = useState('全部')
  const [filterDepartment, setFilterDepartment] = useState('全部')
  const [filterDoctor, setFilterDoctor] = useState('全部')
  const [page, setPage] = useState(1)
  const [dimensions, setDimensions] = useState<ScoringDimension[]>(SCORING_DIMENSIONS)
  const [grades] = useState<GradeLevel[]>(GRADE_LEVELS)
  const [selectedMonth, setSelectedMonth] = useState('2026-04')
  const pageSize = 10

  const records = useMemo(() => generateQCRecords(), [])
  const unqualifiedList = useMemo(() => generateUnqualifiedList(), [])

  // 统计数据
  const stats = useMemo(() => {
    const total = records.length
    const qualified = records.filter(r => r.isQualified).length
    const unqualified = total - qualified
    const avgScore = Math.round(records.reduce((sum, r) => sum + r.totalScore, 0) / total)
    const excellent = records.filter(r => r.grade === '甲级').length
    const good = records.filter(r => r.grade === '乙级').length
    const pass = records.filter(r => r.grade === '丙级').length
    const fail = records.filter(r => r.grade === '不合格').length
    return { total, qualified, unqualified, avgScore, excellent, good, pass, fail, qualifiedRate: Math.round(qualified / total * 100) }
  }, [records])

  // 三维度平均得分
  const dimensionAverages = useMemo(() => {
    const total = records.length
    const avgCompleteness = Math.round(records.reduce((sum, r) => sum + r.threeScores.completeness, 0) / total)
    const avgNormCompliance = Math.round(records.reduce((sum, r) => sum + r.threeScores.normCompliance, 0) / total)
    const avgTimeliness = Math.round(records.reduce((sum, r) => sum + r.threeScores.timeliness, 0) / total)
    return { avgCompleteness, avgNormCompliance, avgTimeliness }
  }, [records])

  // 质量问题分类统计
  const issueStats = useMemo((): IssueStats[] => {
    const issueTypes: QCIssue['type'][] = ['missing_item', 'non_standard_desc', 'non_standard_image', 'timeout']
    const labels: Record<QCIssue['type'], string> = {
      'missing_item': '漏项问题',
      'non_standard_desc': '描述不规范',
      'non_standard_image': '图像不标准',
      'timeout': '超时问题',
      'other': '其他问题'
    }
    const colors: Record<QCIssue['type'], string> = {
      'missing_item': '#dc2626',
      'non_standard_desc': '#d97706',
      'non_standard_image': '#2563eb',
      'timeout': '#7c3aed',
      'other': '#64748b'
    }

    const stats: IssueStats[] = issueTypes.map(type => {
      const recordsWithIssue = records.filter(r => r.issues.some(i => i.type === type))
      const count = recordsWithIssue.length
      return {
        type,
        label: labels[type],
        count,
        percentage: Math.round(count / records.length * 100),
        avgScore: count > 0 ? Math.round(recordsWithIssue.reduce((sum, r) => sum + r.totalScore, 0) / count) : 0,
        trend: Math.round(Math.random() * 20) - 10 // 模拟趋势
      }
    })

    return stats.sort((a, b) => b.count - a.count)
  }, [records])

  // 按科室统计不合格率
  const departmentStats = useMemo(() => {
    const departments = ['超声科', '心血管超声', '妇产科超声', '浅表器官超声', '介入超声']
    return departments.map(dept => {
      const deptRecords = records.filter(r => r.department === dept)
      const total = deptRecords.length
      const unqualified = deptRecords.filter(r => !r.isQualified).length
      return {
        department: dept,
        total,
        unqualified,
        rate: total > 0 ? Math.round(unqualified / total * 100) : 0
      }
    })
  }, [records])

  // 按医生统计不合格率
  const doctorStats = useMemo(() => {
    const doctors = ['李建国', '王秀英', '张志远', '刘德明', '陈晓燕', '赵文博']
    return doctors.map(doctor => {
      const docRecords = records.filter(r => r.doctor === doctor)
      const total = docRecords.length
      const unqualified = docRecords.filter(r => !r.isQualified).length
      return {
        doctor,
        total,
        unqualified,
        rate: total > 0 ? Math.round(unqualified / total * 100) : 0,
        avgScore: total > 0 ? Math.round(docRecords.reduce((sum, r) => sum + r.totalScore, 0) / total) : 0
      }
    })
  }, [records])

  // 按检查类型统计
  const examTypeStats = useMemo(() => {
    const types = ['上腹部超声', '盆腔超声', '甲状腺超声', '乳腺超声', '心脏超声', '血管超声']
    return types.map(type => {
      const typeRecords = records.filter(r => r.examType === type)
      const total = typeRecords.length
      const unqualified = typeRecords.filter(r => !r.isQualified).length
      return {
        examType: type,
        total,
        unqualified,
        rate: total > 0 ? Math.round(unqualified / total * 100) : 0,
        avgScore: total > 0 ? Math.round(typeRecords.reduce((sum, r) => sum + r.totalScore, 0) / total) : 0
      }
    })
  }, [records])

  // 过滤记录
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchSearch = r.patientName.includes(searchKeyword) || r.reportId.includes(searchKeyword) || r.doctor.includes(searchKeyword)
      const matchType = filterType === '全部' || r.examType === filterType
      const matchGrade = filterGrade === '全部' || r.grade === filterGrade
      const matchStatus = filterStatus === '全部' || r.status === filterStatus
      const matchDept = filterDepartment === '全部' || r.department === filterDepartment
      const matchDoctor = filterDoctor === '全部' || r.doctor === filterDoctor
      return matchSearch && matchType && matchGrade && matchStatus && matchDept && matchDoctor
    })
  }, [records, searchKeyword, filterType, filterGrade, filterStatus, filterDepartment, filterDoctor])

  const paginatedRecords = filteredRecords.slice((page - 1) * pageSize, page * pageSize)
  const totalPages = Math.ceil(filteredRecords.length / pageSize)

  // 月度趋势数据
  const monthlyTrend = useMemo(() => [
    { month: '1月', rate: 82, avgScore: 78 }, { month: '2月', rate: 85, avgScore: 80 },
    { month: '3月', rate: 88, avgScore: 82 }, { month: '4月', rate: 91, avgScore: 85 },
  ], [])

  // 生成月报
  const monthlyReport = useMemo((): MonthlyReport => {
    const total = records.length
    const qualified = records.filter(r => r.isQualified).length
    const gradeDistribution = GRADE_LEVELS.map(g => ({
      grade: g.name,
      count: records.filter(r => r.grade === g.name).length,
      percentage: Math.round(records.filter(r => r.grade === g.name).length / total * 100)
    }))
    const topIssues = issueStats.slice(0, 3).map(i => ({ type: i.label, count: i.count }))

    return {
      month: selectedMonth,
      totalReports: total,
      qualifiedCount: qualified,
      unqualifiedCount: total - qualified,
      passRate: Math.round(qualified / total * 100),
      avgScore: stats.avgScore,
      avgCompleteness: dimensionAverages.avgCompleteness,
      avgNormCompliance: dimensionAverages.avgNormCompliance,
      avgTimeliness: dimensionAverages.avgTimeliness,
      gradeDistribution,
      issueStats,
      topIssues,
      improvementSuggestions: generateSuggestions(issueStats, dimensionAverages)
    }
  }, [records, selectedMonth, stats, dimensionAverages, issueStats])

  // 生成质量改进建议
  function generateSuggestions(issues: IssueStats[], dims: typeof dimensionAverages): string[] {
    const suggestions: string[] = []
    if (dims.avgCompleteness < 85) {
      suggestions.push('建议开展报告完整性培训，重点关注患者信息和临床诊断的规范填写')
    }
    if (dims.avgNormCompliance < 80) {
      suggestions.push('建议组织超声术语规范化学习，统一描述格式和测量单位标准')
    }
    if (dims.avgTimeliness < 85) {
      suggestions.push('建议优化报告签发流程，设置超时预警机制，提升时效性')
    }
    const topIssue = issues[0]
    if (topIssue && topIssue.count > records.length * 0.2) {
      suggestions.push(`针对${topIssue.label}高发问题，建议专项检查并制定整改措施`)
    }
    if (suggestions.length === 0) {
      suggestions.push('继续保持当前质量水平，可进一步提升至甲级标准')
    }
    return suggestions
  }

  // 质量改进建议列表
  const improvementSuggestions = useMemo((): ImprovementSuggestion[] => {
    const suggestions: ImprovementSuggestion[] = []

    if (dimensionAverages.avgCompleteness < 85) {
      suggestions.push({
        id: 'S001',
        category: '完整性',
        priority: 'high',
        title: '报告完整性待提升',
        description: `完整性维度平均得分${dimensionAverages.avgCompleteness}分，低于目标值85分。主要问题集中在患者基本信息和临床诊断填写不完整。`,
        targetDimension: '完整性',
        affectedCount: records.filter(r => r.threeScores.completeness < 85).length,
        recommendedActions: [
          '建立报告必填项检查清单，系统自动校验',
          '开展报告填写规范培训',
          '设置完整性预警阈值'
        ]
      })
    }

    if (dimensionAverages.avgNormCompliance < 80) {
      suggestions.push({
        id: 'S002',
        category: '规范性',
        priority: 'high',
        title: '术语和描述规范性需改进',
        description: `规范性维度平均得分${dimensionAverages.avgNormCompliance}分，存在术语使用不当、格式不统一等问题。`,
        targetDimension: '规范性',
        affectedCount: records.filter(r => r.threeScores.normCompliance < 80).length,
        recommendedActions: [
          '制定超声报告术语规范手册',
          '建立描述模板库',
          '组织科室学习标准术语'
        ]
      })
    }

    if (dimensionAverages.avgTimeliness < 85) {
      suggestions.push({
        id: 'S003',
        category: '时效性',
        priority: 'medium',
        title: '报告时效性有待加强',
        description: `时效性维度平均得分${dimensionAverages.avgTimeliness}分，部分报告存在超时情况。`,
        targetDimension: '时效性',
        affectedCount: records.filter(r => r.threeScores.timeliness < 85).length,
        recommendedActions: [
          '设置报告签发时限预警',
          '优化报告审核流程',
          '定期通报超时情况'
        ]
      })
    }

    const topIssue = issueStats[0]
    if (topIssue && topIssue.count > records.length * 0.15) {
      suggestions.push({
        id: 'S004',
        category: topIssue.label,
        priority: 'high',
        title: `${topIssue.label}问题突出`,
        description: `${topIssue.label}共发生${topIssue.count}例，占比${topIssue.percentage}%，需重点整改。`,
        targetDimension: topIssue.type === 'missing_item' ? '完整性' : topIssue.type === 'non_standard_desc' ? '规范性' : topIssue.type === 'non_standard_image' ? '图像' : '时效性',
        affectedCount: topIssue.count,
        recommendedActions: [
          '分析问题根因',
          '制定针对性整改措施',
          '加强相关培训'
        ]
      })
    }

    return suggestions
  }, [dimensionAverages, issueStats, records])

  const examTypes = ['全部', '上腹部超声', '盆腔超声', '甲状腺超声', '乳腺超声', '心脏超声', '血管超声']
  const departments = ['全部', '超声科', '心血管超声', '妇产科超声', '浅表器官超声', '介入超声']
  const doctors = ['全部', '李建国', '王秀英', '张志远', '刘德明', '陈晓燕', '赵文博']
  const gradeOptions = ['全部', '甲级', '乙级', '丙级', '不合格']
  const statusOptions = ['全部', 'pending', 'passed', 'failed', 'reviewed']

  const getGradeColor = (grade: string) => {
    const g = grades.find(g => g.name === grade)
    return g ? g.color : '#64748b'
  }

  const getGradeBg = (grade: string) => {
    const g = grades.find(g => g.name === grade)
    return g ? g.bgColor : '#f1f5f9'
  }

  const getIssueTagStyle = (type: QCIssue['type']) => {
    switch (type) {
      case 'missing_item': return s.issueTagMissing
      case 'non_standard_desc': return s.issueTagNonStandard
      case 'non_standard_image': return s.issueTagImage
      case 'timeout': return s.issueTagTimeout
      default: return {}
    }
  }

  const getIssueLabel = (type: QCIssue['type']) => {
    const labels: Record<QCIssue['type'], string> = {
      'missing_item': '漏项',
      'non_standard_desc': '不规范',
      'non_standard_image': '图像不标准',
      'timeout': '超时',
      'other': '其他'
    }
    return labels[type]
  }

  const kpiData = [
    { label: '报告总数', value: stats.total, unit: '份', sub: `较上月 +${Math.floor(Math.random() * 20) + 5}%`, icon: FileText, color: '#2563eb', bg: '#dbeafe' },
    { label: '合格报告', value: stats.qualified, unit: '份', sub: `合格率 ${stats.qualifiedRate}%`, icon: BadgeCheck, color: '#16a34a', bg: '#dcfce7' },
    { label: '不合格报告', value: stats.unqualified, unit: '份', sub: '需重点关注', icon: AlertTriangle, color: '#dc2626', bg: '#fee2e2' },
    { label: '平均评分', value: stats.avgScore, unit: '分', sub: '综合质量评分', icon: Award, color: '#7c3aed', bg: '#f3e8ff' },
  ]

  const categoryIcons: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
    completeness: { icon: FileText, color: '#2563eb', bg: '#dbeafe' },
    normCompliance: { icon: ShieldCheck, color: '#16a34a', bg: '#dcfce7' },
    timeliness: { icon: Clock, color: '#d97706', bg: '#fef3c7' },
    image: { icon: Activity, color: '#7c3aed', bg: '#f3e8ff' },
    operation: { icon: ClipboardCheck, color: '#2563eb', bg: '#dbeafe' },
  }

  return (
    <div style={s.pageWrapper}>
      {/* 页面头部 */}
      <div style={s.pageHeader}>
        <div>
          <h1 style={s.title}>
            <ClipboardCheck size={24} color="#2563eb" />
            报告质量评分系统
          </h1>
          <p style={s.subtitle}>三维度评分（完整性/规范性/时效性）· 等级管理（甲乙丙丁）· 统计分析 · 月报生成</p>
        </div>
        <div style={s.headerActions}>
          <button style={s.btnLargeInfo}><Download size={16} />导出报告</button>
          <button style={s.btnLargeSuccess} onClick={() => setActiveTab('report')}><FileText size={16} />生成月报</button>
          <button style={s.btnLarge} onClick={() => setActiveTab('suggestions')}><Lightbulb size={16} />改进建议</button>
        </div>
      </div>

      {/* KPI统计卡片 */}
      <div style={s.fourColGrid}>
        {kpiData.map((kpi) => (
          <div key={kpi.label} style={s.kpiCard}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 10, background: kpi.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <kpi.icon size={24} color={kpi.color} />
              </div>
              <div>
                <div style={s.kpiLabel}>{kpi.label}</div>
                <div style={{ ...s.kpiValue, color: kpi.color }}>{kpi.value}</div>
                <div style={s.kpiSub}>{kpi.unit} · {kpi.sub}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 三维度得分概览 */}
      <div style={s.chartRow3}>
        <div style={s.dimensionScoreCard}>
          <div style={s.dimensionScoreTitle}>
            <FileText size={18} color="#2563eb" />
            完整性得分
          </div>
          <div style={{ ...s.dimensionScoreValue, color: dimensionAverages.avgCompleteness >= 85 ? '#16a34a' : dimensionAverages.avgCompleteness >= 75 ? '#2563eb' : '#dc2626' }}>
            {dimensionAverages.avgCompleteness}
            <span style={s.highlightUnit}>分</span>
          </div>
          <div style={s.dimensionScoreBar}>
            <div style={{ ...s.dimensionScoreBarFill, width: `${dimensionAverages.avgCompleteness}%`, background: dimensionAverages.avgCompleteness >= 85 ? '#16a34a' : dimensionAverages.avgCompleteness >= 75 ? '#2563eb' : '#dc2626' }} />
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>权重35% · 必填项齐全</div>
        </div>
        <div style={s.dimensionScoreCard}>
          <div style={s.dimensionScoreTitle}>
            <ShieldCheck size={18} color="#16a34a" />
            规范性得分
          </div>
          <div style={{ ...s.dimensionScoreValue, color: dimensionAverages.avgNormCompliance >= 85 ? '#16a34a' : dimensionAverages.avgNormCompliance >= 75 ? '#2563eb' : '#dc2626' }}>
            {dimensionAverages.avgNormCompliance}
            <span style={s.highlightUnit}>分</span>
          </div>
          <div style={s.dimensionScoreBar}>
            <div style={{ ...s.dimensionScoreBarFill, width: `${dimensionAverages.avgNormCompliance}%`, background: dimensionAverages.avgNormCompliance >= 85 ? '#16a34a' : dimensionAverages.avgNormCompliance >= 75 ? '#2563eb' : '#dc2626' }} />
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>权重40% · 术语/格式标准</div>
        </div>
        <div style={s.dimensionScoreCard}>
          <div style={s.dimensionScoreTitle}>
            <Clock size={18} color="#d97706" />
            时效性得分
          </div>
          <div style={{ ...s.dimensionScoreValue, color: dimensionAverages.avgTimeliness >= 85 ? '#16a34a' : dimensionAverages.avgTimeliness >= 75 ? '#2563eb' : '#dc2626' }}>
            {dimensionAverages.avgTimeliness}
            <span style={s.highlightUnit}>分</span>
          </div>
          <div style={s.dimensionScoreBar}>
            <div style={{ ...s.dimensionScoreBarFill, width: `${dimensionAverages.avgTimeliness}%`, background: dimensionAverages.avgTimeliness >= 85 ? '#16a34a' : dimensionAverages.avgTimeliness >= 75 ? '#2563eb' : '#dc2626' }} />
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>权重25% · 规定时间完成</div>
        </div>
      </div>

      {/* Tab导航 */}
      <div style={s.tabNav}>
        <button style={activeTab === 'dimensions' ? s.tabBtnActive : s.tabBtn} onClick={() => setActiveTab('dimensions')}>
          <Target size={16} />评分维度
        </button>
        <button style={activeTab === 'grades' ? s.tabBtnActive : s.tabBtn} onClick={() => setActiveTab('grades')}>
          <Award size={16} />等级管理
        </button>
        <button style={activeTab === 'statistics' ? s.tabBtnActive : s.tabBtn} onClick={() => setActiveTab('statistics')}>
          <BarChart3 size={16} />统计分析
        </button>
        <button style={activeTab === 'unqualified' ? s.tabBtnActive : s.tabBtn} onClick={() => setActiveTab('unqualified')}>
          <AlertTriangle size={16} />不合格列表
        </button>
        <button style={activeTab === 'report' ? s.tabBtnActive : s.tabBtn} onClick={() => setActiveTab('report')}>
          <FileText size={16} />月报生成
        </button>
        <button style={activeTab === 'suggestions' ? s.tabBtnActive : s.tabBtn} onClick={() => setActiveTab('suggestions')}>
          <Lightbulb size={16} />改进建议
        </button>
      </div>

      {/* ========== 评分维度 ========== */}
      {activeTab === 'dimensions' && (
        <div>
          <div style={s.filterBar}>
            <div style={s.searchBox}>
              <Search size={16} color="#94a3b8" />
              <input style={s.searchInput} placeholder="搜索维度名称或编码..." value={searchKeyword} onChange={e => setSearchKeyword(e.target.value)} />
            </div>
            <select style={s.select} value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value="全部">全部分类</option>
              <option value="completeness">完整性</option>
              <option value="normCompliance">规范性</option>
              <option value="timeliness">时效性</option>
              <option value="image">图像质量</option>
              <option value="operation">操作规范</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {dimensions.filter(d => {
              const matchSearch = d.name.includes(searchKeyword) || d.code.includes(searchKeyword)
              const matchCat = filterType === '全部' || d.category === filterType
              return matchSearch && matchCat
            }).map(dim => {
              const catStyle = categoryIcons[dim.category]
              return (
                <div key={dim.id} style={s.dimensionCard}>
                  <div style={s.dimensionHeader}>
                    <div style={{ ...s.dimensionIcon, background: catStyle.bg }}>
                      <catStyle.icon size={22} color={catStyle.color} />
                    </div>
                    <Toggle checked={dim.enabled} onChange={(v) => setDimensions(prev => prev.map(d => d.id === dim.id ? { ...d, enabled: v } : d))} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'monospace' }}>{dim.code}</span>
                    <span style={{ fontSize: 11, padding: '1px 6px', borderRadius: 4, background: catStyle.bg, color: catStyle.color, fontWeight: 600 }}>
                      {dim.category === 'completeness' ? '完整性' : dim.category === 'normCompliance' ? '规范性' : dim.category === 'timeliness' ? '时效性' : dim.category === 'image' ? '图像' : '操作'}
                    </span>
                  </div>
                  <div style={s.dimensionName}>{dim.name}</div>
                  <div style={s.dimensionDesc}>{dim.description}</div>
                  <div style={s.dimensionMeta}>
                    <div style={s.dimensionMetaItem}>
                      <CheckCircle size={12} color="#16a34a" />
                      <span>满分: <strong>{dim.maxScore}分</strong></span>
                    </div>
                    <div style={s.dimensionMetaItem}>
                      <Star size={12} color="#d97706" />
                      <span>权重: <strong>{dim.weight}%</strong></span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ========== 等级管理 ========== */}
      {activeTab === 'grades' && (
        <div>
          {/* 等级分布概览 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div style={s.chartPanel}>
              <div style={s.chartTitle}><PieChartIcon size={16} color="#64748b" />等级分布</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 32, padding: '8px 0' }}>
                <DonutChart value={Math.round(stats.excellent / stats.total * 100)} size={100} stroke={10} color="#16a34a" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px', flex: 1 }}>
                  {[
                    { label: '甲级', count: stats.excellent, color: '#16a34a' },
                    { label: '乙级', count: stats.good, color: '#2563eb' },
                    { label: '丙级', count: stats.pass, color: '#d97706' },
                    { label: '不合格', count: stats.fail, color: '#dc2626' },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 12, height: 12, borderRadius: 3, background: item.color }} />
                      <span style={{ fontSize: 13, color: '#475569' }}>{item.label}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#1a3a5c', marginLeft: 'auto' }}>{item.count}份</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div style={s.chartPanel}>
              <div style={s.chartTitle}><TrendingUp size={16} color="#64748b" />月度合格率趋势</div>
              <div style={{ padding: '8px 0' }}>
                <TrendChart data={monthlyTrend.map(m => m.rate)} color="#16a34a" />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                  {monthlyTrend.map(m => (
                    <span key={m.month} style={{ fontSize: 10, color: '#94a3b8' }}>{m.month}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 等级详情卡片 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {grades.map(grade => {
              const count = grade.name === '甲级' ? stats.excellent
                : grade.name === '乙级' ? stats.good
                : grade.name === '丙级' ? stats.pass
                : stats.fail
              const pct = Math.round(count / stats.total * 100)
              return (
                <div key={grade.id} style={{ ...s.gradeCard, borderLeft: `4px solid ${grade.color}` }}>
                  <div style={s.gradeHeader}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div style={s.gradeName}>{grade.name}</div>
                      <div style={s.gradeRange}>{grade.minScore}-{grade.maxScore}分 · 等级{grade.code}</div>
                    </div>
                    <div style={{ ...s.gradeBadge, background: grade.bgColor, color: grade.color }}>
                      {grade.code}
                    </div>
                  </div>
                  <div style={s.gradeBar}>
                    <div style={{ ...s.gradeBarFill, width: `${pct}%`, background: grade.color }} />
                  </div>
                  <div style={s.gradeDesc}>{grade.description}</div>
                  <div style={s.gradeStats}>
                    <div style={s.gradeStat}>
                      <div style={{ ...s.gradeStatValue, color: grade.color }}>{count}</div>
                      <div style={s.gradeStatLabel}>报告数量</div>
                    </div>
                    <div style={s.gradeStat}>
                      <div style={s.gradeStatValue}>{pct}%</div>
                      <div style={s.gradeStatLabel}>占比</div>
                    </div>
                    <div style={s.gradeStat}>
                      <div style={s.gradeStatValue}>{grade.requiresReview ? '是' : '否'}</div>
                      <div style={s.gradeStatLabel}>需复核</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ========== 统计分析 ========== */}
      {activeTab === 'statistics' && (
        <div>
          <div style={s.filterBar}>
            <div style={s.searchBox}>
              <Search size={16} color="#94a3b8" />
              <input style={s.searchInput} placeholder="搜索患者姓名、报告ID或医生..." value={searchKeyword} onChange={e => setSearchKeyword(e.target.value)} />
            </div>
            <select style={s.select} value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1) }}>
              {examTypes.map(t => (<option key={t} value={t}>{t === '全部' ? '全部检查类型' : t}</option>))}
            </select>
            <select style={s.select} value={filterDepartment} onChange={e => { setFilterDepartment(e.target.value); setPage(1) }}>
              {departments.map(d => (<option key={d} value={d}>{d === '全部' ? '全部科室' : d}</option>))}
            </select>
            <select style={s.select} value={filterGrade} onChange={e => { setFilterGrade(e.target.value); setPage(1) }}>
              {gradeOptions.map(g => (<option key={g} value={g}>{g === '全部' ? '全部等级' : g}</option>))}
            </select>
            <select style={s.select} value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1) }}>
              {statusOptions.map(s => (<option key={s} value={s}>{s === '全部' ? '全部状态' : s === 'pending' ? '待审核' : s === 'passed' ? '已通过' : s === 'failed' ? '未通过' : '已复核'}</option>))}
            </select>
            <button style={s.btnIcon}><Download size={14} />导出</button>
          </div>

          {/* 不合格率统计图表 */}
          <div style={s.chartRow3}>
            <div style={s.chartPanel}>
              <div style={s.chartTitle}><BarChart2 size={16} color="#64748b" />按科室不合格率</div>
              <div style={s.barChart}>
                {departmentStats.map(d => (
                  <div key={d.department} style={s.barChartItem}>
                    <div style={s.barChartLabel}>{d.department}</div>
                    <div style={s.barChartBar}>
                      <div style={{ ...s.barChartBarFill, width: `${d.rate}%`, background: d.rate > 20 ? '#dc2626' : d.rate > 10 ? '#d97706' : '#16a34a' }}>
                        <span style={s.barChartValue}>{d.rate}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={s.chartPanel}>
              <div style={s.chartTitle}><Users size={16} color="#64748b" />按医生不合格率</div>
              <div style={s.barChart}>
                {doctorStats.slice(0, 5).map(d => (
                  <div key={d.doctor} style={s.barChartItem}>
                    <div style={s.barChartLabel}>{d.doctor}</div>
                    <div style={s.barChartBar}>
                      <div style={{ ...s.barChartBarFill, width: `${d.rate}%`, background: d.rate > 20 ? '#dc2626' : d.rate > 10 ? '#d97706' : '#16a34a' }}>
                        <span style={s.barChartValue}>{d.rate}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={s.chartPanel}>
              <div style={s.chartTitle}><Activity size={16} color="#64748b" />按检查类型不合格率</div>
              <div style={s.barChart}>
                {examTypeStats.map(e => (
                  <div key={e.examType} style={s.barChartItem}>
                    <div style={{ ...s.barChartLabel, fontSize: 11 }}>{e.examType.replace('超声', '')}</div>
                    <div style={s.barChartBar}>
                      <div style={{ ...s.barChartBarFill, width: `${e.rate}%`, background: e.rate > 20 ? '#dc2626' : e.rate > 10 ? '#d97706' : '#16a34a' }}>
                        <span style={s.barChartValue}>{e.rate}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 质量问题分类统计 */}
          <div style={s.chartRow}>
            <div style={s.chartPanel}>
              <div style={s.chartTitle}><AlertOctagon size={16} color="#64748b" />质量问题分类统计</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {issueStats.map(issue => (
                  <div key={issue.type} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ ...s.issueTag, ...getIssueTagStyle(issue.type), minWidth: 90 }}>{issue.label}</span>
                    <div style={{ flex: 1, height: 20, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${issue.percentage}%`, height: '100%', background: issue.type === 'missing_item' ? '#dc2626' : issue.type === 'non_standard_desc' ? '#d97706' : issue.type === 'non_standard_image' ? '#2563eb' : '#7c3aed', borderRadius: 4 }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#1a3a5c', minWidth: 40 }}>{issue.count}例</span>
                    <span style={{ fontSize: 11, color: '#94a3b8', minWidth: 35 }}>{issue.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={s.chartPanel}>
              <div style={s.chartTitle}><ShieldCheck size={16} color="#64748b" />各维度平均得分</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: '完整性', score: dimensionAverages.avgCompleteness, weight: 35 },
                  { label: '规范性', score: dimensionAverages.avgNormCompliance, weight: 40 },
                  { label: '时效性', score: dimensionAverages.avgTimeliness, weight: 25 },
                ].map(dim => (
                  <div key={dim.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ fontSize: 12, color: '#64748b', minWidth: 60 }}>{dim.label}</div>
                    <div style={{ flex: 1, height: 8, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${dim.score}%`, height: '100%', background: dim.score >= 85 ? '#16a34a' : dim.score >= 75 ? '#2563eb' : '#dc2626', borderRadius: 4 }} />
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#1a3a5c', minWidth: 36 }}>{dim.score}</div>
                    <div style={{ fontSize: 10, color: '#94a3b8', minWidth: 30 }}>权重{dim.weight}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 详细记录表 */}
          <div style={s.panel}>
            <div style={s.panelHeader}>
              <div style={s.panelTitle}><FileText size={16} />报告评分明细</div>
              <span style={{ fontSize: 12, color: '#64748b' }}>共 {filteredRecords.length} 条记录</span>
            </div>
            <div style={s.panelBody}>
              {paginatedRecords.length > 0 ? (
                <table style={s.table}>
                  <thead>
                    <tr>
                      <th style={s.th}>日期</th>
                      <th style={s.th}>报告编号</th>
                      <th style={s.th}>患者姓名</th>
                      <th style={s.th}>检查类型</th>
                      <th style={s.th}>科室</th>
                      <th style={s.th}>审核医生</th>
                      <th style={s.th}>总分</th>
                      <th style={s.th}>等级</th>
                      <th style={s.th}>问题类型</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRecords.map((record) => (
                      <tr key={record.id}>
                        <td style={s.td}>{record.date}</td>
                        <td style={{ ...s.td, fontFamily: 'monospace', fontSize: 12 }}>{record.reportId}</td>
                        <td style={{ ...s.td, fontWeight: 500 }}>{record.patientName}</td>
                        <td style={s.td}><span style={{ ...s.badge, ...s.badgeInfo }}>{record.examType}</span></td>
                        <td style={s.td}>{record.department}</td>
                        <td style={s.td}>{record.doctor}</td>
                        <td style={s.td}>
                          <span style={{ fontWeight: 700, color: getGradeColor(record.grade) }}>{record.totalScore}</span>
                        </td>
                        <td style={s.td}>
                          <span style={{ ...s.badge, background: getGradeBg(record.grade), color: getGradeColor(record.grade) }}>
                            {record.grade}
                          </span>
                        </td>
                        <td style={s.td}>
                          {record.issues.length > 0 ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                              {record.issues.slice(0, 2).map((issue, i) => (
                                <span key={i} style={{ ...s.issueTag, ...getIssueTagStyle(issue.type), fontSize: 10 }}>
                                  {getIssueLabel(issue.type)}
                                </span>
                              ))}
                              {record.issues.length > 2 && <span style={{ fontSize: 11, color: '#94a3b8' }}>+{record.issues.length - 2}</span>}
                            </div>
                          ) : <span style={{ color: '#94a3b8' }}>-</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <EmptyState icon={FileText} text="暂无评分记录" subtext="请先进行报告质量评分" />
              )}
            </div>

            {filteredRecords.length > 0 && (
              <div style={s.pagination}>
                <div style={s.pageInfo}>显示 {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, filteredRecords.length)} 条，共 {filteredRecords.length} 条</div>
                <div style={s.pageBtns}>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let p = i + 1
                    if (totalPages > 5 && page > 3) p = page - 2 + i
                    if (totalPages > 5 && page > totalPages - 2) p = totalPages - 4 + i
                    return (<button key={p} style={page === p ? s.pageBtnActive : s.pageBtn} onClick={() => setPage(p)}>{p}</button>)
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========== 不合格列表 ========== */}
      {activeTab === 'unqualified' && (
        <div>
          <div style={s.filterBar}>
            <div style={s.searchBox}>
              <Search size={16} color="#94a3b8" />
              <input style={s.searchInput} placeholder="搜索患者姓名或报告编号..." value={searchKeyword} onChange={e => setSearchKeyword(e.target.value)} />
            </div>
            <select style={s.select} value={filterDepartment} onChange={e => setFilterDepartment(e.target.value)}>
              {departments.map(d => (<option key={d} value={d}>{d === '全部' ? '全部科室' : d}</option>))}
            </select>
            <select style={s.select} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              {['全部', 'pending', 'rectified', 'ignored'].map(s => (
                <option key={s} value={s}>{s === '全部' ? '全部状态' : s === 'pending' ? '待处理' : s === 'rectified' ? '已整改' : '已忽略'}</option>
              ))}
            </select>
          </div>

          {/* 未处理高危统计 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 16 }}>
            {[
              { label: '待处理（高危）', count: unqualifiedList.filter(u => u.severity === 'high' && u.status === 'pending').length, color: '#dc2626', bg: '#fee2e2' },
              { label: '待处理（中等）', count: unqualifiedList.filter(u => u.severity === 'medium' && u.status === 'pending').length, color: '#d97706', bg: '#fef3c7' },
              { label: '待处理（低危）', count: unqualifiedList.filter(u => u.severity === 'low' && u.status === 'pending').length, color: '#2563eb', bg: '#dbeafe' },
            ].map(item => (
              <div key={item.label} style={{ ...s.kpiCard, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: 10, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertTriangle size={22} color={item.color} />
                </div>
                <div>
                  <div style={s.kpiLabel}>{item.label}</div>
                  <div style={{ ...s.kpiValue, color: item.color }}>{item.count}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={s.panel}>
            <div style={s.panelHeader}>
              <div style={s.panelTitle}><AlertTriangle size={16} color="#dc2626" />不合格报告清单</div>
              <span style={{ fontSize: 12, color: '#64748b' }}>共 {unqualifiedList.length} 条记录</span>
            </div>
            <div style={s.panelBody}>
              {unqualifiedList.filter(u => {
                const matchSearch = u.patientName.includes(searchKeyword) || u.reportId.includes(searchKeyword)
                const matchStatus = filterStatus === '全部' || u.status === filterStatus
                const matchDept = filterDepartment === '全部' || u.department === filterDepartment
                return matchSearch && matchStatus && matchDept
              }).length > 0 ? (
                unqualifiedList.filter(u => {
                  const matchSearch = u.patientName.includes(searchKeyword) || u.reportId.includes(searchKeyword)
                  const matchStatus = filterStatus === '全部' || u.status === filterStatus
                  const matchDept = filterDepartment === '全部' || u.department === filterDepartment
                  return matchSearch && matchStatus && matchDept
                }).map(item => (
                  <div key={item.id} style={s.unqualifiedCard}>
                    <div style={s.unqualifiedHeader}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontWeight: 600, color: '#1a3a5c' }}>{item.patientName}</span>
                        <span style={{ ...s.badge, ...s.badgeInfo }}>{item.examType}</span>
                        <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#94a3b8' }}>{item.reportId}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          ...s.unqualifiedReason,
                          ...(item.severity === 'high' ? s.severityHigh : item.severity === 'medium' ? s.severityMedium : s.severityLow),
                        }}>
                          {item.severity === 'high' ? '高危' : item.severity === 'medium' ? '中危' : '低危'}
                        </span>
                        <span style={{
                          ...s.badge,
                          ...(item.status === 'rectified' ? s.badgeSuccess : item.status === 'ignored' ? s.badgeWarning : s.badgeDanger),
                        }}>
                          {item.status === 'rectified' ? '已整改' : item.status === 'ignored' ? '已忽略' : '待处理'}
                        </span>
                      </div>
                    </div>
                    <div style={s.unqualifiedMeta}>
                      <span>日期: {item.date}</span>
                      <span>科室: {item.department}</span>
                      <span>医生: {item.doctor}</span>
                      <span>记录ID: {item.recordId}</span>
                    </div>
                    <div style={s.unqualifiedReasons}>
                      {item.failTypes.map((type, i) => (
                        <span key={i} style={{ ...s.issueTag, ...getIssueTagStyle(type), fontSize: 11 }}>
                          {getIssueLabel(type)}
                        </span>
                      ))}
                    </div>
                    {item.rectNote && (
                      <div style={{ fontSize: 12, color: '#2563eb', background: '#dbeafe', padding: '4px 8px', borderRadius: 4 }}>
                        整改备注: {item.rectNote}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <EmptyState icon={CheckCircle} text="暂无不合格报告" subtext="所有报告均已达标，继续保持" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========== 月报生成 ========== */}
      {activeTab === 'report' && (
        <div>
          <div style={s.filterBar}>
            <Calendar size={16} color="#64748b" />
            <select style={s.select} value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>
              <option value="2026-01">2026年1月</option>
              <option value="2026-02">2026年2月</option>
              <option value="2026-03">2026年3月</option>
              <option value="2026-04">2026年4月</option>
            </select>
            <button style={s.btnLargeSuccess}><FileText size={16} />重新生成月报</button>
            <button style={s.btnLargeInfo}><Download size={16} />导出PDF</button>
          </div>

          {/* 月报概览 */}
          <div style={s.reportCard}>
            <div style={s.reportTitle}>
              <ClipboardCheck size={20} color="#2563eb" />
              {selectedMonth} 超声报告质量控制月报
            </div>

            {/* 核心指标 */}
            <div style={s.reportSection}>
              <div style={s.reportSectionTitle}>核心指标</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
                <div style={{ textAlign: 'center', padding: 16, background: '#f8fafc', borderRadius: 8 }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: '#2563eb' }}>{monthlyReport.totalReports}</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>报告总数</div>
                </div>
                <div style={{ textAlign: 'center', padding: 16, background: '#f8fafc', borderRadius: 8 }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: '#16a34a' }}>{monthlyReport.passRate}%</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>合格率</div>
                </div>
                <div style={{ textAlign: 'center', padding: 16, background: '#f8fafc', borderRadius: 8 }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: '#7c3aed' }}>{monthlyReport.avgScore}</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>平均评分</div>
                </div>
                <div style={{ textAlign: 'center', padding: 16, background: '#f8fafc', borderRadius: 8 }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: '#dc2626' }}>{monthlyReport.unqualifiedCount}</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>不合格数</div>
                </div>
                <div style={{ textAlign: 'center', padding: 16, background: '#f8fafc', borderRadius: 8 }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: '#d97706' }}>{monthlyReport.topIssues.length}</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>重点问题</div>
                </div>
              </div>
            </div>

            {/* 三维度得分 */}
            <div style={s.reportSection}>
              <div style={s.reportSectionTitle}>三维度评分</div>
              <div style={s.chartRow}>
                <div style={{ ...s.kpiCard, display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 60, height: 60, borderRadius: 12, background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={28} color="#2563eb" />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: '#64748b' }}>完整性</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: monthlyReport.avgCompleteness >= 85 ? '#16a34a' : '#dc2626' }}>{monthlyReport.avgCompleteness}分</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>权重35%</div>
                  </div>
                </div>
                <div style={{ ...s.kpiCard, display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 60, height: 60, borderRadius: 12, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShieldCheck size={28} color="#16a34a" />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: '#64748b' }}>规范性</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: monthlyReport.avgNormCompliance >= 85 ? '#16a34a' : '#dc2626' }}>{monthlyReport.avgNormCompliance}分</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>权重40%</div>
                  </div>
                </div>
                <div style={{ ...s.kpiCard, display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 60, height: 60, borderRadius: 12, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Clock size={28} color="#d97706" />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: '#64748b' }}>时效性</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: monthlyReport.avgTimeliness >= 85 ? '#16a34a' : '#dc2626' }}>{monthlyReport.avgTimeliness}分</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>权重25%</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 等级分布 */}
            <div style={s.reportSection}>
              <div style={s.reportSectionTitle}>等级分布</div>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                {monthlyReport.gradeDistribution.map(g => (
                  <div key={g.grade} style={{ flex: 1, textAlign: 'center', padding: 12, background: '#f8fafc', borderRadius: 8 }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: getGradeColor(g.grade) }}>{g.count}份</div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{g.grade} {g.percentage}%</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 问题分布 */}
            <div style={s.reportSection}>
              <div style={s.reportSectionTitle}>质量问题分布</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {monthlyReport.issueStats.map(issue => (
                  <div key={issue.type} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ minWidth: 90, fontSize: 13, color: '#475569' }}>{issue.label}</span>
                    <div style={{ flex: 1, height: 24, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${issue.percentage}%`, height: '100%', background: issue.type === 'missing_item' ? '#dc2626' : issue.type === 'non_standard_desc' ? '#d97706' : issue.type === 'non_standard_image' ? '#2563eb' : '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 8 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: '#fff' }}>{issue.count}例 ({issue.percentage}%)</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 改进建议 */}
            <div style={s.reportSection}>
              <div style={s.reportSectionTitle}>质量改进建议</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {monthlyReport.improvementSuggestions.map((suggestion, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: 12, background: '#f8fafc', borderRadius: 6, borderLeft: '3px solid #2563eb' }}>
                    <Lightbulb size={16} color="#2563eb" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontSize: 13, color: '#475569', lineHeight: 1.5 }}>{suggestion}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== 质量改进建议 ========== */}
      {activeTab === 'suggestions' && (
        <div>
          <div style={s.filterBar}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
              <Lightbulb size={16} color="#d97706" />
              <span style={{ fontSize: 14, fontWeight: 600, color: '#1a3a5c' }}>基于历史质量问题自动分析生成</span>
            </div>
            <button style={s.btnIcon}><RefreshCw size={14} />重新分析</button>
          </div>

          {/* 建议概览 */}
          <div style={s.chartRow}>
            <div style={s.chartPanel}>
              <div style={s.chartTitle}><AlertCircle size={16} color="#dc2626" />高优先级建议</div>
              <div style={{ fontSize: 36, fontWeight: 800, color: '#dc2626', textAlign: 'center', padding: 20 }}>
                {improvementSuggestions.filter(s => s.priority === 'high').length}
                <div style={{ fontSize: 14, color: '#64748b', fontWeight: 400, marginTop: 8 }}>项</div>
              </div>
            </div>
            <div style={s.chartPanel}>
              <div style={s.chartTitle}><Clock size={16} color="#d97706" />中优先级建议</div>
              <div style={{ fontSize: 36, fontWeight: 800, color: '#d97706', textAlign: 'center', padding: 20 }}>
                {improvementSuggestions.filter(s => s.priority === 'medium').length}
                <div style={{ fontSize: 14, color: '#64748b', fontWeight: 400, marginTop: 8 }}>项</div>
              </div>
            </div>
            <div style={s.chartPanel}>
              <div style={s.chartTitle}><CheckCircle size={16} color="#16a34a" />影响报告数</div>
              <div style={{ fontSize: 36, fontWeight: 800, color: '#16a34a', textAlign: 'center', padding: 20 }}>
                {records.filter(r => !r.isQualified).length}
                <div style={{ fontSize: 14, color: '#64748b', fontWeight: 400, marginTop: 8 }}>份</div>
              </div>
            </div>
          </div>

          {/* 建议列表 */}
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 12 }}>
            {improvementSuggestions.map(suggestion => (
              <div key={suggestion.id} style={{
                ...s.suggestionCard,
                borderLeftColor: suggestion.priority === 'high' ? '#dc2626' : suggestion.priority === 'medium' ? '#d97706' : '#16a34a'
              }}>
                <div style={s.suggestionHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                      background: suggestion.priority === 'high' ? '#fee2e2' : suggestion.priority === 'medium' ? '#fef3c7' : '#dcfce7',
                      color: suggestion.priority === 'high' ? '#dc2626' : suggestion.priority === 'medium' ? '#d97706' : '#16a34a'
                    }}>
                      {suggestion.priority === 'high' ? '高优先级' : suggestion.priority === 'medium' ? '中优先级' : '低优先级'}
                    </span>
                    <span style={{ ...s.badge, background: '#f1f5f9', color: '#64748b' }}>{suggestion.category}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#1a3a5c' }}>{suggestion.title}</span>
                  </div>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>影响 {suggestion.affectedCount} 份报告</span>
                </div>
                <div style={s.suggestionDesc}>{suggestion.description}</div>
                <div style={s.suggestionActions}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>推荐措施:</div>
                  {suggestion.recommendedActions.map((action, i) => (
                    <div key={i} style={s.suggestionAction}>
                      <ChevronRight size={14} />
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
