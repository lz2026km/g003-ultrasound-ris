// ============================================================
// G003 超声RIS系统 - 报告质量评分系统页面
// 评分维度 · 等级管理 · 筛选过滤 · 统计报表 · 不合格列表
// ============================================================
import React, { useState, useMemo } from 'react'
import {
  FileText, Award, BarChart3, ClipboardCheck, Search, Filter,
  Download, Calendar, Clock, TrendingUp, TrendingDown, Users,
  AlertTriangle, CheckCircle, XCircle, ShieldCheck, Eye,
  Edit3, Trash2, Plus, RefreshCw, ChevronRight, Star,
  PieChart as PieChartIcon, Target, AlertCircle, BadgeCheck,
  X, Check, Info, Activity, Bell
} from 'lucide-react'

// ========== 类型定义 ==========
type TabKey = 'dimensions' | 'grades' | 'statistics' | 'unqualified'

interface ScoringDimension {
  id: string
  name: string
  code: string
  category: 'report' | 'image' | 'operation' | 'timeliness'
  description: string
  maxScore: number
  weight: number
  enabled: boolean
}

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
  totalScore: number
  grade: string
  dimensions: DimensionScore[]
  issues: string[]
  status: 'pending' | 'passed' | 'failed' | 'reviewed'
  isQualified: boolean
}

interface DimensionScore {
  dimensionId: string
  dimensionName: string
  score: number
  maxScore: number
}

interface UnqualifiedItem {
  id: string
  recordId: number
  date: string
  patientName: string
  examType: string
  reportId: string
  doctor: string
  failReasons: string[]
  severity: 'high' | 'medium' | 'low'
  status: 'pending' | 'rectified' | 'ignored'
  rectNote: string
}

// ========== 评分维度数据 ==========
const SCORING_DIMENSIONS: ScoringDimension[] = [
  { id: 'D01', name: '报告完整性', code: 'RC01', category: 'report', description: '报告各项必填项完整，无遗漏', maxScore: 100, weight: 15, enabled: true },
  { id: 'D02', name: '报告规范性', code: 'RC02', category: 'report', description: '报告格式、术语符合规范要求', maxScore: 100, weight: 15, enabled: true },
  { id: 'D03', name: '诊断准确性', code: 'RC03', category: 'report', description: '超声诊断描述准确无误', maxScore: 100, weight: 20, enabled: true },
  { id: 'D04', name: '图像清晰度', code: 'IC01', category: 'image', description: '超声图像清晰可辨', maxScore: 100, weight: 10, enabled: true },
  { id: 'D05', name: '图像完整性', code: 'IC02', category: 'image', description: '标准切面采集完整', maxScore: 100, weight: 10, enabled: true },
  { id: 'D06', name: '图像标注规范', code: 'IC03', category: 'image', description: '图像标注信息完整准确', maxScore: 100, weight: 5, enabled: true },
  { id: 'D07', name: '操作规范性', code: 'OC01', category: 'operation', description: '检查操作流程规范', maxScore: 100, weight: 10, enabled: true },
  { id: 'D08', name: '报告及时性', code: 'TC01', category: 'timeliness', description: '报告在规定时间内完成', maxScore: 100, weight: 15, enabled: true },
]

const GRADE_LEVELS: GradeLevel[] = [
  { id: 'G01', name: '优秀', code: 'A', minScore: 95, maxScore: 100, color: '#16a34a', bgColor: '#dcfce7', description: '综合评分95分及以上，质量卓越', requiresReview: false },
  { id: 'G02', name: '良好', code: 'B', minScore: 85, maxScore: 94, color: '#2563eb', bgColor: '#dbeafe', description: '综合评分85-94分，质量良好', requiresReview: false },
  { id: 'G03', name: '合格', code: 'C', minScore: 70, maxScore: 84, color: '#d97706', bgColor: '#fef3c7', description: '综合评分70-84分，质量合格', requiresReview: false },
  { id: 'G04', name: '不合格', code: 'D', minScore: 0, maxScore: 69, color: '#dc2626', bgColor: '#fee2e2', description: '综合评分70分以下，质量不合格', requiresReview: true },
]

// ========== Mock 数据 ==========
const generateQCRecords = (): QCRecord[] => {
  const patients = ['张伟', '王芳', '李明', '刘洋', '陈静', '杨帆', '赵雷', '周婷', '吴强', '郑鑫',
                    '孙鹏', '马云', '李娜', '王磊', '刘芳', '陈刚', '周洋', '吴琳', '郑浩', '冯雪']
  const types = ['上腹部超声', '盆腔超声', '甲状腺超声', '乳腺超声', '心脏超声', '血管超声']
  const doctors = ['李建国', '王秀英', '张志远', '刘德明', '陈晓燕', '赵文博']

  return Array.from({ length: 120 }, (_, i) => {
    const totalScore = Math.floor(Math.random() * 35) + 65 // 65-100
    const grade = totalScore >= 95 ? '优秀' : totalScore >= 85 ? '良好' : totalScore >= 70 ? '合格' : '不合格'
    const isQualified = totalScore >= 70
    const issues: string[] = []
    if (totalScore < 90) issues.push('报告完整性扣分')
    if (totalScore < 85) issues.push('图像质量不达标')
    if (totalScore < 80) issues.push('报告规范性不足')
    if (totalScore < 75) issues.push('诊断描述欠准确')
    if (totalScore < 70) issues.push('报告严重迟交')

    const dimensions: DimensionScore[] = SCORING_DIMENSIONS.map((d, idx) => {
      const base = Math.min(100, totalScore + Math.floor(Math.random() * 10) - 5)
      return {
        dimensionId: d.id,
        dimensionName: d.name,
        score: Math.max(0, Math.min(100, base)),
        maxScore: d.maxScore,
      }
    })

    return {
      id: i + 1,
      date: `2026-04-${String(30 - (i % 30)).padStart(2, '0')}`,
      patientName: patients[i % patients.length],
      examType: types[i % types.length],
      reportId: `RPT-${String(2026040001 + i).padStart(10, '0')}`,
      doctor: doctors[i % doctors.length],
      totalScore,
      grade,
      dimensions,
      issues,
      status: isQualified ? 'passed' : (i % 3 === 0 ? 'reviewed' : 'failed'),
      isQualified,
    }
  })
}

const generateUnqualifiedList = (): UnqualifiedItem[] => {
  const patients = ['张伟', '王芳', '李明', '刘洋', '陈静']
  const types = ['上腹部超声', '盆腔超声', '甲状腺超声', '乳腺超声']
  const doctors = ['李建国', '王秀英', '张志远']
  const failReasonsList = [
    ['报告完整性严重不足', '关键描述缺失'],
    ['图像采集不完整', '标准切面缺失3个以上'],
    ['报告迟交超过48小时', '违反报告时限规定'],
    ['诊断描述不准确', '与临床不符'],
    ['图像质量严重不达标', '无法用于诊断'],
  ]
  const rectNotes = ['', '已补充完整报告', '已重新采集图像', '情况特殊，申请豁免', '']

  return Array.from({ length: 18 }, (_, i) => ({
    id: `UQ-${String(i + 1).padStart(3, '0')}`,
    recordId: 1001 + i,
    date: `2026-04-${String(28 - (i % 28)).padStart(2, '0')}`,
    patientName: patients[i % patients.length],
    examType: types[i % types.length],
    reportId: `RPT-${String(2026040001 + i).padStart(10, '0')}`,
    doctor: doctors[i % doctors.length],
    failReasons: failReasonsList[i % failReasonsList.length],
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
  const [page, setPage] = useState(1)
  const [dimensions, setDimensions] = useState<ScoringDimension[]>(SCORING_DIMENSIONS)
  const [grades] = useState<GradeLevel[]>(GRADE_LEVELS)
  const pageSize = 10

  const records = useMemo(() => generateQCRecords(), [])
  const unqualifiedList = useMemo(() => generateUnqualifiedList(), [])

  // 统计数据
  const stats = useMemo(() => {
    const total = records.length
    const qualified = records.filter(r => r.isQualified).length
    const unqualified = total - qualified
    const avgScore = Math.round(records.reduce((sum, r) => sum + r.totalScore, 0) / total)
    const excellent = records.filter(r => r.grade === '优秀').length
    const good = records.filter(r => r.grade === '良好').length
    const pass = records.filter(r => r.grade === '合格').length
    const fail = records.filter(r => r.grade === '不合格').length
    return { total, qualified, unqualified, avgScore, excellent, good, pass, fail, qualifiedRate: Math.round(qualified / total * 100) }
  }, [records])

  // 过滤记录
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchSearch = r.patientName.includes(searchKeyword) || r.reportId.includes(searchKeyword) || r.doctor.includes(searchKeyword)
      const matchType = filterType === '全部' || r.examType === filterType
      const matchGrade = filterGrade === '全部' || r.grade === filterGrade
      const matchStatus = filterStatus === '全部' || r.status === filterStatus
      return matchSearch && matchType && matchGrade && matchStatus
    })
  }, [records, searchKeyword, filterType, filterGrade, filterStatus])

  const paginatedRecords = filteredRecords.slice((page - 1) * pageSize, page * pageSize)
  const totalPages = Math.ceil(filteredRecords.length / pageSize)

  // 月度趋势数据
  const monthlyTrend = useMemo(() => [
    { month: '1月', rate: 82 }, { month: '2月', rate: 85 }, { month: '3月', rate: 88 },
    { month: '4月', rate: 91 }, { month: '5月', rate: 89 }, { month: '6月', rate: 92 },
    { month: '7月', rate: 90 }, { month: '8月', rate: 93 }, { month: '9月', rate: 91 },
    { month: '10月', rate: 94 }, { month: '11月', rate: 92 }, { month: '12月', rate: 95 },
  ], [])

  const examTypes = ['全部', '上腹部超声', '盆腔超声', '甲状腺超声', '乳腺超声', '心脏超声', '血管超声']
  const gradeOptions = ['全部', '优秀', '良好', '合格', '不合格']
  const statusOptions = ['全部', 'pending', 'passed', 'failed', 'reviewed']

  const getGradeColor = (grade: string) => {
    const g = grades.find(g => g.name === grade)
    return g ? g.color : '#64748b'
  }

  const getGradeBg = (grade: string) => {
    const g = grades.find(g => g.name === grade)
    return g ? g.bgColor : '#f1f5f9'
  }

  const kpiData = [
    { label: '报告总数', value: stats.total, unit: '份', sub: `较上月 +${Math.floor(Math.random() * 20) + 5}%`, icon: FileText, color: '#2563eb', bg: '#dbeafe' },
    { label: '合格报告', value: stats.qualified, unit: '份', sub: `合格率 ${stats.qualifiedRate}%`, icon: BadgeCheck, color: '#16a34a', bg: '#dcfce7' },
    { label: '不合格报告', value: stats.unqualified, unit: '份', sub: '需重点关注', icon: AlertTriangle, color: '#dc2626', bg: '#fee2e2' },
    { label: '平均评分', value: stats.avgScore, unit: '分', sub: '综合质量评分', icon: Award, color: '#7c3aed', bg: '#f3e8ff' },
  ]

  const categoryIcons: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
    report: { icon: FileText, color: '#2563eb', bg: '#dbeafe' },
    image: { icon: Activity, color: '#7c3aed', bg: '#f3e8ff' },
    operation: { icon: ClipboardCheck, color: '#16a34a', bg: '#dcfce7' },
    timeliness: { icon: Clock, color: '#d97706', bg: '#fef3c7' },
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
          <p style={s.subtitle}>评分维度管理 · 等级评定 · 统计分析 · 不合格报告追踪</p>
        </div>
        <div style={s.headerActions}>
          <button style={s.btnLargeInfo}><Download size={16} />导出报告</button>
          <button style={s.btnLarge}><FileText size={16} />生成月报</button>
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
              <option value="report">报告质量</option>
              <option value="image">图像质量</option>
              <option value="operation">操作规范</option>
              <option value="timeliness">及时性</option>
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
                      {dim.category === 'report' ? '报告' : dim.category === 'image' ? '图像' : dim.category === 'operation' ? '操作' : '时效'}
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
                    { label: '优秀', count: stats.excellent, color: '#16a34a' },
                    { label: '良好', count: stats.good, color: '#2563eb' },
                    { label: '合格', count: stats.pass, color: '#d97706' },
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
                  {monthlyTrend.filter((_, i) => i % 2 === 0).map(m => (
                    <span key={m.month} style={{ fontSize: 10, color: '#94a3b8' }}>{m.month}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 等级详情卡片 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {grades.map(grade => {
              const count = grade.name === '优秀' ? stats.excellent
                : grade.name === '良好' ? stats.good
                : grade.name === '合格' ? stats.pass
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
            <select style={s.select} value={filterGrade} onChange={e => { setFilterGrade(e.target.value); setPage(1) }}>
              {gradeOptions.map(g => (<option key={g} value={g}>{g === '全部' ? '全部等级' : g}</option>))}
            </select>
            <select style={s.select} value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1) }}>
              {statusOptions.map(s => (<option key={s} value={s}>{s === '全部' ? '全部状态' : s}</option>))}
            </select>
            <button style={s.btnIcon}><Download size={14} />导出</button>
          </div>

          <div style={s.chartRow}>
            <div style={s.chartPanel}>
              <div style={s.chartTitle}><ShieldCheck size={16} color="#64748b" />评分分布</div>
              <div style={{ display: 'flex', gap: 16, padding: '8px 0' }}>
                {grades.map(grade => {
                  const count = grade.name === '优秀' ? stats.excellent
                    : grade.name === '良好' ? stats.good
                    : grade.name === '合格' ? stats.pass
                    : stats.fail
                  return (
                    <div key={grade.id} style={{ textAlign: 'center', flex: 1 }}>
                      <DonutChart value={Math.round(count / stats.total * 100)} size={70} stroke={8} color={grade.color} />
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#1a3a5c', marginTop: 8 }}>{grade.name}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>{count}份</div>
                    </div>
                  )
                })}
              </div>
            </div>
            <div style={s.chartPanel}>
              <div style={s.chartTitle}><BarChart3 size={16} color="#64748b" />各维度平均得分</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '8px 0' }}>
                {dimensions.slice(0, 6).map(dim => {
                  const avgScore = Math.round(85 + Math.random() * 10)
                  return (
                    <div key={dim.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ fontSize: 12, color: '#64748b', minWidth: 80 }}>{dim.name}</div>
                      <div style={s.scoreBar}>
                        <div style={{ ...s.scoreBarFill, width: `${avgScore}%`, background: avgScore >= 90 ? '#16a34a' : avgScore >= 80 ? '#2563eb' : '#d97706' }} />
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#1a3a5c', minWidth: 36 }}>{avgScore}</div>
                    </div>
                  )
                })}
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
                      <th style={s.th}>审核医生</th>
                      <th style={s.th}>总分</th>
                      <th style={s.th}>等级</th>
                      <th style={s.th}>状态</th>
                      <th style={s.th}>不合格原因</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRecords.map((record) => (
                      <tr key={record.id}>
                        <td style={s.td}>{record.date}</td>
                        <td style={{ ...s.td, fontFamily: 'monospace', fontSize: 12 }}>{record.reportId}</td>
                        <td style={{ ...s.td, fontWeight: 500 }}>{record.patientName}</td>
                        <td style={s.td}><span style={{ ...s.badge, ...s.badgeInfo }}>{record.examType}</span></td>
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
                          <span style={{
                            ...s.badge,
                            ...(record.status === 'passed' ? s.badgeSuccess : record.status === 'failed' ? s.badgeDanger : record.status === 'reviewed' ? s.badgePurple : s.badgeWarning),
                          }}>
                            {record.status === 'passed' ? '已通过' : record.status === 'failed' ? '未通过' : record.status === 'reviewed' ? '已复核' : '待审核'}
                          </span>
                        </td>
                        <td style={s.td}>
                          {record.issues.length > 0 ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                              {record.issues.slice(0, 2).map((issue, i) => (
                                <span key={i} style={{ fontSize: 11, padding: '1px 6px', borderRadius: 4, background: '#fee2e2', color: '#dc2626' }}>
                                  {issue}
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
                return matchSearch && matchStatus
              }).length > 0 ? (
                unqualifiedList.filter(u => {
                  const matchSearch = u.patientName.includes(searchKeyword) || u.reportId.includes(searchKeyword)
                  const matchStatus = filterStatus === '全部' || u.status === filterStatus
                  return matchSearch && matchStatus
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
                      <span>医生: {item.doctor}</span>
                      <span>记录ID: {item.recordId}</span>
                    </div>
                    <div style={s.unqualifiedReasons}>
                      {item.failReasons.map((reason, i) => (
                        <span key={i} style={{ ...s.unqualifiedReason, background: '#fee2e2', color: '#dc2626' }}>
                          {reason}
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
    </div>
  )
}
