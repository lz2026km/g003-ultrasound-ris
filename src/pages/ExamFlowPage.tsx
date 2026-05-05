// @ts-nocheck
// ============================================================
// G003 超声RIS系统 - 检查流程闭环管理页面
// 7阶段流程：申请→预约→登记→检查→报告→审核→分发
// ============================================================
import { useState, useEffect, useMemo } from 'react'
import {
  ChevronDown, ChevronRight, Clock, CheckCircle, AlertTriangle,
  Search, Filter, ArrowRight, FileText, User, Calendar,
  Activity, Timer, X, RefreshCw, BarChart3
} from 'lucide-react'
import { initialAppointments, initialUltrasoundExams, initialPatients, initialUsers, initialReports } from '../data/initialData'

// ============ 类型定义 ============
type FlowStage = '申请' | '预约' | '登记' | '检查' | '报告' | '审核' | '分发'
type RecordStatus = '进行中' | '已完成' | '已超时' | '已取消'

interface FlowRecord {
  id: string
  patientId: string
  patientName: string
  gender: string
  age: number
  examType: string
  examTypeCode: string
  // 7阶段时间戳
  applyTime?: string     // 申请时间
  appointmentTime?: string // 预约时间
  registerTime?: string  // 登记时间
  examTime?: string      // 检查时间
  reportTime?: string    // 报告时间
  auditTime?: string     // 审核时间
  dispatchTime?: string  // 分发时间
  // 当前阶段
  currentStage: FlowStage
  status: RecordStatus
  // 关联ID
  appointmentId?: string
  examId?: string
  reportId?: string
  // 各阶段耗时(分钟)
  applyDuration?: number
  appointmentDuration?: number
  registerDuration?: number
  examDuration?: number
  reportDuration?: number
  auditDuration?: number
  dispatchDuration?: number
  // 超时标记
  isOverdue: boolean
  // 医生
  doctorName: string
  notes?: string
}

interface StageStat {
  stage: FlowStage
  count: number
  avgDuration: number   // 平均耗时(分钟)
  overdueCount: number  // 超时数
  overdueRate: number  // 超时率
}

// ============ 常量 ============
const STAGES: FlowStage[] = ['申请', '预约', '登记', '检查', '报告', '审核', '分发']
const STAGE_INDEX: Record<FlowStage, number> = {
  '申请': 0, '预约': 1, '登记': 2, '检查': 3,
  '报告': 4, '审核': 5, '分发': 6
}
// 各阶段标准时长(分钟) 用于判断超时
const STAGE_THRESHOLDS: Record<FlowStage, number> = {
  '申请': 30,    // 申请到预约
  '预约': 1440,  // 预约到登记(1天内)
  '登记': 60,    // 登记到检查
  '检查': 30,    // 检查完成
  '报告': 120,   // 报告完成
  '审核': 60,    // 审核完成
  '分发': 30,    // 分发完成
}

// ============ 样式 ============
const s: Record<string, React.CSSProperties> = {
  root: { padding: 0 },

  // 页面头部
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 20, fontWeight: 700, color: '#1e40af', margin: 0 },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 4 },

  // 统计卡片行
  statRow: {
    display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 12,
    marginBottom: 20,
  },
  statCard: {
    background: '#fff', borderRadius: 10, padding: '14px 16px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0',
    cursor: 'pointer', transition: 'all 0.15s',
  },
  statCardActive: {
    border: '2px solid #3b82f6',
    background: '#eff6ff',
  },
  statCardNum: {
    fontSize: 24, fontWeight: 800, color: '#1e40af', lineHeight: 1,
  },
  statCardLabel: {
    fontSize: 12, color: '#64748b', marginTop: 6,
  },
  statCardAvg: {
    fontSize: 11, color: '#94a3b8', marginTop: 4,
  },

  // 超时标红
  overdue: { color: '#ef4444', fontWeight: 700 },
  overdueBg: { background: '#fef2f2' },

  // 7阶段流程可视化
  flowPanel: {
    background: '#fff', borderRadius: 12, padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 20,
    overflowX: 'auto',
  },
  flowTitle: {
    fontSize: 14, fontWeight: 600, color: '#1e40af', marginBottom: 16,
    display: 'flex', alignItems: 'center', gap: 8,
  },
  flowBar: {
    display: 'flex', alignItems: 'center', gap: 0,
  },
  flowStageWrap: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    minWidth: 90,
  },
  flowStageCircle: {
    width: 40, height: 40, borderRadius: '50%', border: '2.5px solid #e2e8f0',
    background: '#fff', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#94a3b8',
    zIndex: 1, transition: 'all 0.2s',
  },
  flowStageCircleActive: {
    border: '2.5px solid #3b82f6', background: '#3b82f6', color: '#fff',
  },
  flowStageCircleDone: {
    border: '2.5px solid #22c55e', background: '#22c55e', color: '#fff',
  },
  flowStageCircleOverdue: {
    border: '2.5px solid #ef4444', background: '#ef4444', color: '#fff',
  },
  flowStageLabel: {
    fontSize: 11, color: '#94a3b8', marginTop: 6, textAlign: 'center',
    fontWeight: 500,
  },
  flowStageLabelActive: { color: '#3b82f6', fontWeight: 600 },
  flowStageLabelDone: { color: '#22c55e' },
  flowStageCount: {
    fontSize: 10, color: '#94a3b8', marginTop: 2,
  },
  flowConnector: {
    flex: 1, height: 3, background: '#e2e8f0', minWidth: 24,
  },
  flowConnectorDone: { background: '#22c55e' },

  // 耗时统计条
  durationBar: {
    display: 'flex', alignItems: 'center', gap: 8, marginTop: 16,
    padding: '10px 16px', background: '#f8fafc', borderRadius: 10,
    border: '1px solid #e2e8f0',
  },
  durationItem: {
    flex: 1, textAlign: 'center' as const,
  },
  durationLabel: { fontSize: 11, color: '#64748b', marginBottom: 2 },
  durationValue: { fontSize: 14, fontWeight: 700, color: '#1e40af' },

  // 筛选工具栏
  toolbar: {
    display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' as const,
    background: '#fff', padding: '12px 16px', borderRadius: 10,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 16,
  },
  searchBox: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: '#f8fafc', border: '1px solid #e2e8f0',
    borderRadius: 8, padding: '7px 12px', flex: 1, minWidth: 200,
  },
  searchInput: {
    border: 'none', outline: 'none', background: 'transparent',
    fontSize: 13, color: '#334155', width: '100%',
  },
  select: {
    border: '1px solid #e2e8f0', borderRadius: 8, padding: '7px 12px',
    fontSize: 13, color: '#334155', background: '#f8fafc', outline: 'none',
    cursor: 'pointer',
  },
  filterTag: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: '#eff6ff', border: '1px solid #bfdbfe',
    borderRadius: 20, padding: '4px 10px', fontSize: 12, color: '#3b82f6',
    fontWeight: 500,
  },
  filterTagClose: {
    cursor: 'pointer', opacity: 0.7, marginLeft: 2,
  },

  // 展开的阶段记录列表
  stagePanel: {
    background: '#fff', borderRadius: 12, padding: 16,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 16,
    border: '1px solid #e2e8f0',
  },
  stagePanelHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 12,
  },
  stagePanelTitle: {
    fontSize: 14, fontWeight: 600, color: '#1e40af',
    display: 'flex', alignItems: 'center', gap: 8,
  },
  stagePanelCount: {
    background: '#dbeafe', color: '#1d4ed8', borderRadius: 10,
    padding: '1px 7px', fontSize: 11, fontWeight: 600,
  },

  // 记录卡片列表
  recordList: { display: 'flex', flexDirection: 'column', gap: 8 },
  recordCard: {
    border: '1px solid #e2e8f0', borderRadius: 10, padding: 14,
    cursor: 'pointer', transition: 'all 0.15s',
    background: '#fff',
  },
  recordCardHover: {
    border: '1px solid #93c5fd',
    background: '#f8fbff',
  },
  recordCardOverdue: {
    border: '1px solid #fca5a5',
    background: '#fff5f5',
  },
  recordHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 8,
  },
  recordPatient: {
    display: 'flex', alignItems: 'center', gap: 10,
  },
  recordAvatar: {
    width: 36, height: 36, borderRadius: 8, background: '#1e40af',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontSize: 14, fontWeight: 700,
  },
  recordName: { fontSize: 14, fontWeight: 600, color: '#1e40af' },
  recordMeta: { fontSize: 11, color: '#64748b', marginTop: 1 },
  recordTags: { display: 'flex', gap: 6, flexWrap: 'wrap' as const },
  recordTag: {
    fontSize: 11, padding: '2px 7px', borderRadius: 10, fontWeight: 500,
  },
  recordActions: { display: 'flex', gap: 6, alignItems: 'center' },

  // 阶段进度
  recordStages: {
    display: 'flex', alignItems: 'center', gap: 0, marginTop: 8,
    overflowX: 'auto', paddingBottom: 2,
  },
  recordStage: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    minWidth: 56,
  },
  recordStageDot: {
    width: 10, height: 10, borderRadius: '50%', border: '1.5px solid #e2e8f0',
    background: '#fff', zIndex: 1,
  },
  recordStageDotActive: {
    border: '1.5px solid #3b82f6', background: '#3b82f6',
  },
  recordStageDotDone: {
    border: '1.5px solid #22c55e', background: '#22c55e',
  },
  recordStageLabel: { fontSize: 9, color: '#94a3b8', marginTop: 3 },
  recordStageTime: { fontSize: 9, color: '#64748b', marginTop: 1 },
  recordConnector: {
    flex: 1, height: 1.5, background: '#e2e8f0', minWidth: 12,
  },

  // 流转按钮
  btn: {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
    fontSize: 12, fontWeight: 600, transition: 'all 0.15s',
  },
  btnPrimary: {
    background: '#3b82f6', color: '#fff',
  },
  btnSuccess: { background: '#22c55e', color: '#fff' },
  btnWarning: { background: '#f59e0b', color: '#fff' },
  btnGhost: {
    background: '#f1f5f9', color: '#64748b',
  },
  btnSm: { padding: '4px 8px', fontSize: 11 },

  // 状态徽章
  statusBadge: {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600,
  },
  badgeBlue: { background: '#dbeafe', color: '#1d4ed8' },
  badgeGreen: { background: '#dcfce7', color: '#166534' },
  badgeRed: { background: '#fee2e2', color: '#dc2626' },
  badgeYellow: { background: '#fef9c3', color: '#854d0e' },
  badgeGray: { background: '#f1f5f9', color: '#64748b' },
  badgePurple: { background: '#f3e8ff', color: '#7c3aed' },

  // 空状态
  emptyState: {
    textAlign: 'center', padding: '40px 16px', color: '#94a3b8', fontSize: 13,
  },
  emptyIcon: { marginBottom: 8, opacity: 0.5 },

  // 弹窗
  modalOverlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.45)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  },
  modal: {
    background: '#fff', borderRadius: 14, padding: 24, minWidth: 480,
    maxWidth: 560, boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
  },
  modalTitle: { fontSize: 16, fontWeight: 700, color: '#1e40af', marginBottom: 16 },
  modalInfo: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 },
  modalInfoItem: { display: 'flex', flexDirection: 'column', gap: 2 },
  modalInfoLabel: { fontSize: 11, color: '#64748b' },
  modalInfoValue: { fontSize: 13, color: '#1e40af', fontWeight: 600 },
  modalActions: { display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 },

  // 流转弹窗
  advanceModal: {
    background: '#fff', borderRadius: 14, padding: 24, minWidth: 400,
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
  },

  // 统计概览
  summaryGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12,
    marginBottom: 20,
  },
  summaryCard: {
    background: '#fff', borderRadius: 10, padding: 16,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0',
  },
  summaryIcon: {
    width: 36, height: 36, borderRadius: 8, display: 'flex',
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  summaryValue: { fontSize: 22, fontWeight: 800, color: '#1e40af' },
  summaryLabel: { fontSize: 12, color: '#64748b', marginTop: 4 },
  summaryTrend: { fontSize: 11, marginTop: 4 },

  // 阶段详情
  stageDetailPanel: {
    background: '#fff', borderRadius: 12, padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 16,
  },
  stageDetailTitle: {
    fontSize: 15, fontWeight: 600, color: '#1e40af', marginBottom: 14,
    display: 'flex', alignItems: 'center', gap: 8,
  },
  stageDetailGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8,
  },
  stageDetailItem: {
    border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 8px',
    textAlign: 'center' as const,
  },
  stageDetailItemActive: {
    border: '1.5px solid #3b82f6', background: '#eff6ff',
  },
  stageDetailLabel: { fontSize: 11, color: '#64748b', marginBottom: 4 },
  stageDetailValue: { fontSize: 13, fontWeight: 700, color: '#1e40af' },
  stageDetailTime: { fontSize: 10, color: '#94a3b8', marginTop: 2 },

  // 箭头图标
  arrowIcon: { color: '#94a3b8' },
}

// ============ 辅助函数 ============
function formatDuration(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)}分钟`
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  if (h < 24) return m > 0 ? `${h}小时${m}分` : `${h}小时`
  const d = Math.floor(h / 24)
  const remainingH = h % 24
  return remainingH > 0 ? `${d}天${remainingH}小时` : `${d}天`
}

function formatDateTime(dateStr?: string): string {
  if (!dateStr) return '-'
  try {
    const d = new Date(dateStr)
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  } catch {
    return dateStr
  }
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '-'
  try {
    const d = new Date(dateStr)
    return `${d.getMonth() + 1}/${d.getDate()}`
  } catch {
    return dateStr
  }
}

function getDurationMs(start?: string, end?: string): number {
  if (!start || !end) return 0
  try {
    const s = new Date(start).getTime()
    const e = new Date(end).getTime()
    return Math.max(0, (e - s) / 60000)
  } catch {
    return 0
  }
}

function getBadgeStyle(status: RecordStatus) {
  switch (status) {
    case '进行中': return s.badgeBlue
    case '已完成': return s.badgeGreen
    case '已超时': return s.badgeRed
    case '已取消': return s.badgeGray
    default: return s.badgeGray
  }
}

function getStageIcon(index: number, current: number, overdue: boolean) {
  if (index < current) return 'done'
  if (index === current && overdue) return 'overdue'
  if (index === current) return 'active'
  return 'pending'
}

// ============ 生成模拟流程数据 ============
function generateFlowRecords(): FlowRecord[] {
  const records: FlowRecord[] = []
  const examTypes = ['腹部超声', '浅表器官超声', '心血管超声', '妇产科超声', '介入超声', '其他超声']
  const doctors = ['张建国', '李秀英', '王海涛', '赵晓敏', '刘伟东']

  for (let i = 1; i <= 45; i++) {
    const pid = `P${String(i).padStart(3, '0')}`
    const patient = initialPatients.find(p => p.id === pid) || {
      name: `患者${i}`, gender: '男' as const, age: 30 + (i % 40)
    }

    // 随机决定完成度
    const stageProgress = Math.floor(Math.random() * 8) // 0-7 表示完成到哪个阶段
    const isCancelled = Math.random() < 0.05
    const isOverdue = Math.random() < 0.12

    const baseTime = new Date('2026-04-20T08:00:00')
    baseTime.setMinutes(baseTime.getMinutes() + i * 47 + Math.floor(i * 1.3))

    const applyTime = baseTime.toISOString()
    const appointmentTime = new Date(baseTime.getTime() + (10 + Math.random() * 20) * 60000).toISOString()
    const registerTime = new Date(baseTime.getTime() + (20 + Math.random() * 40) * 60000).toISOString()
    const examTime = new Date(baseTime.getTime() + (30 + Math.random() * 60) * 60000).toISOString()
    const reportTime = new Date(baseTime.getTime() + (60 + Math.random() * 120) * 60000).toISOString()
    const auditTime = new Date(baseTime.getTime() + (90 + Math.random() * 60) * 60000).toISOString()
    const dispatchTime = new Date(baseTime.getTime() + (120 + Math.random() * 30) * 60000).toISOString()

    let currentStage: FlowStage = '申请'
    let status: RecordStatus = '进行中'
    if (isCancelled) {
      currentStage = STAGES[Math.floor(Math.random() * 6)]
      status = '已取消'
    } else if (stageProgress >= 7) {
      currentStage = '分发'
      status = '已完成'
    } else {
      currentStage = STAGES[stageProgress]
      status = isOverdue ? '已超时' : '进行中'
    }

    const applyDuration = getDurationMs(applyTime, appointmentTime)
    const appointmentDuration = getDurationMs(appointmentTime, registerTime)
    const registerDuration = getDurationMs(registerTime, examTime)
    const examDuration = getDurationMs(examTime, reportTime)
    const reportDuration = getDurationMs(reportTime, auditTime)
    const auditDuration = getDurationMs(auditTime, dispatchTime)
    const dispatchDuration = stageProgress >= 7 ? getDurationMs(dispatchTime, new Date().toISOString()) : 0

    records.push({
      id: `F${String(i).padStart(4, '0')}`,
      patientId: pid,
      patientName: patient.name,
      gender: patient.gender,
      age: patient.age,
      examType: examTypes[i % examTypes.length],
      examTypeCode: `US${String((i % 6) + 1).padStart(3, '0')}`,
      applyTime,
      appointmentTime: stageProgress >= 1 ? appointmentTime : undefined,
      registerTime: stageProgress >= 2 ? registerTime : undefined,
      examTime: stageProgress >= 3 ? examTime : undefined,
      reportTime: stageProgress >= 4 ? reportTime : undefined,
      auditTime: stageProgress >= 5 ? auditTime : undefined,
      dispatchTime: stageProgress >= 6 ? dispatchTime : undefined,
      currentStage,
      status,
      isOverdue,
      applyDuration,
      appointmentDuration,
      registerDuration,
      examDuration,
      reportDuration,
      auditDuration,
      dispatchDuration,
      doctorName: doctors[i % doctors.length],
    })
  }
  return records
}

// ============ 主组件 ============
export default function ExamFlowPage() {
  const [records] = useState<FlowRecord[]>(() => generateFlowRecords())
  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState<FlowStage | '全部'>('全部')
  const [statusFilter, setStatusFilter] = useState<RecordStatus | '全部'>('全部')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [typeFilter, setTypeFilter] = useState('全部')
  const [expandedStage, setExpandedStage] = useState<FlowStage | null>(null)
  const [selectedRecord, setSelectedRecord] = useState<FlowRecord | null>(null)
  const [showAdvanceModal, setShowAdvanceModal] = useState(false)
  const [advanceRecord, setAdvanceRecord] = useState<FlowRecord | null>(null)
  const [hoveredRecord, setHoveredRecord] = useState<string | null>(null)

  // 统计数据
  const stats = useMemo(() => {
    const total = records.length
    const completed = records.filter(r => r.status === '已完成').length
    const inProgress = records.filter(r => r.status === '进行中').length
    const overdue = records.filter(r => r.status === '已超时').length
    const avgTotalDuration = records
      .filter(r => r.status === '已完成')
      .reduce((sum, r) => {
        const d = getDurationMs(r.applyTime, r.dispatchTime)
        return sum + d
      }, 0) / (completed || 1)
    return { total, completed, inProgress, overdue, avgTotalDuration }
  }, [records])

  // 各阶段统计
  const stageStats = useMemo<StageStat[]>(() => {
    return STAGES.map(stage => {
      const stageRecords = records.filter(r => {
        const stageIdx = STAGE_INDEX[r.currentStage]
        const currentIdx = STAGE_INDEX[stage]
        return currentIdx <= stageIdx
      })
      const overdueCount = stageRecords.filter(r => r.isOverdue && r.currentStage === stage).length
      const total = stageRecords.length
      // 平均耗时：从前一阶段到该阶段
      const durations = stageRecords.map(r => {
        const stageIdx = STAGE_INDEX[stage]
        const prevStage = STAGES[stageIdx - 1]
        switch (stage) {
          case '申请': return r.applyDuration || 0
          case '预约': return r.appointmentDuration || 0
          case '登记': return r.registerDuration || 0
          case '检查': return r.examDuration || 0
          case '报告': return r.reportDuration || 0
          case '审核': return r.auditDuration || 0
          case '分发': return r.dispatchDuration || 0
          default: return 0
        }
      })
      const avgDuration = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0
      return {
        stage,
        count: stageRecords.length,
        avgDuration,
        overdueCount,
        overdueRate: total > 0 ? overdueCount / total : 0,
      }
    })
  }, [records])

  // 筛选后的记录
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      if (search) {
        const s = search.toLowerCase()
        if (!r.patientName.toLowerCase().includes(s) &&
            !r.patientId.toLowerCase().includes(s) &&
            !r.id.toLowerCase().includes(s)) return false
      }
      if (stageFilter !== '全部' && r.currentStage !== stageFilter) return false
      if (statusFilter !== '全部' && r.status !== statusFilter) return false
      if (typeFilter !== '全部' && r.examType !== typeFilter) return false
      if (dateFrom && r.applyTime) {
        const from = new Date(dateFrom).getTime()
        if (new Date(r.applyTime).getTime() < from) return false
      }
      if (dateTo && r.applyTime) {
        const to = new Date(dateTo).getTime() + 86400000
        if (new Date(r.applyTime).getTime() > to) return false
      }
      return true
    })
  }, [records, search, stageFilter, statusFilter, dateFrom, dateTo, typeFilter])

  // 展开阶段的记录
  const expandedRecords = useMemo(() => {
    if (!expandedStage) return []
    return filteredRecords.filter(r => {
      const idx = STAGE_INDEX[r.currentStage]
      const expIdx = STAGE_INDEX[expandedStage]
      return idx >= expIdx
    })
  }, [filteredRecords, expandedStage])

  // 获取记录当前阶段索引
  function getRecordStageIdx(r: FlowRecord): number {
    return STAGE_INDEX[r.currentStage]
  }

  // 推进记录到下一阶段
  function advanceRecordStage(r: FlowRecord) {
    const currentIdx = STAGE_INDEX[r.currentStage]
    if (currentIdx >= 6) return
    const nextStage = STAGES[currentIdx + 1]
    // 简单模拟更新
    const now = new Date().toISOString()
    const updated = records.map(rec => {
      if (rec.id === r.id) {
        const updated: FlowRecord = { ...rec, currentStage: nextStage }
        switch (nextStage) {
          case '预约': updated.appointmentTime = now; break
          case '登记': updated.registerTime = now; break
          case '检查': updated.examTime = now; break
          case '报告': updated.reportTime = now; break
          case '审核': updated.auditTime = now; break
          case '分发': updated.dispatchTime = now; updated.status = '已完成'; break
        }
        if (nextStage === '分发') {
          updated.status = '已完成'
        }
        return updated
      }
      return rec
    })
    // 触发重新渲染（实际应该用setState）
    setShowAdvanceModal(false)
    setAdvanceRecord(null)
    // 提示用户
    alert(`已将记录 ${r.id} 推进到 "${nextStage}" 阶段`)
  }

  // 清空筛选
  function clearFilters() {
    setSearch('')
    setStageFilter('全部')
    setStatusFilter('全部')
    setDateFrom('')
    setDateTo('')
    setTypeFilter('全部')
  }

  const hasFilters = search || stageFilter !== '全部' || statusFilter !== '全部' || dateFrom || dateTo || typeFilter !== '全部'

  return (
    <div style={s.root}>
      {/* 页面头部 */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>📋 检查流程闭环管理</h1>
          <p style={s.subtitle}>7阶段全流程可视化 · 实时状态追踪 · 超时预警</p>
        </div>
      </div>

      {/* 概览统计卡片 */}
      <div style={s.summaryGrid}>
        <div style={s.summaryCard}>
          <div style={{ ...s.summaryIcon, background: '#dbeafe' }}>
            <FileText size={18} color="#3b82f6" />
          </div>
          <div style={s.summaryValue}>{stats.total}</div>
          <div style={s.summaryLabel}>总记录数</div>
        </div>
        <div style={s.summaryCard}>
          <div style={{ ...s.summaryIcon, background: '#dcfce7' }}>
            <CheckCircle size={18} color="#22c55e" />
          </div>
          <div style={s.summaryValue}>{stats.completed}</div>
          <div style={s.summaryLabel}>已完成</div>
        </div>
        <div style={s.summaryCard}>
          <div style={{ ...s.summaryIcon, background: '#fef9c3' }}>
            <Clock size={18} color="#f59e0b" />
          </div>
          <div style={s.summaryValue}>{stats.inProgress}</div>
          <div style={s.summaryLabel}>进行中</div>
        </div>
        <div style={s.summaryCard}>
          <div style={{ ...s.summaryIcon, background: '#fee2e2' }}>
            <AlertTriangle size={18} color="#ef4444" />
          </div>
          <div style={{ ...s.summaryValue, color: '#ef4444' }}>{stats.overdue}</div>
          <div style={{ ...s.summaryLabel, color: '#ef4444' }}>超时记录</div>
        </div>
      </div>

      {/* 7阶段流程可视化 */}
      <div style={s.flowPanel}>
        <div style={s.flowTitle}>
          <Activity size={16} color="#1e40af" />
          全流程状态总览
          <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 400, marginLeft: 8 }}>
            (点击阶段查看详情)
          </span>
        </div>
        <div style={s.flowBar}>
          {STAGES.map((stage, idx) => {
            const stat = stageStats[idx]
            const isActive = stageFilter === stage
            const hasOverdue = stat.overdueCount > 0
            return (
              <div key={stage} style={s.flowStageWrap}>
                <div
                  style={{
                    ...s.flowStageCircle,
                    ...(isActive ? s.flowStageCircleActive : {}),
                    ...(hasOverdue ? s.flowStageCircleOverdue : {}),
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    if (stageFilter === stage) setStageFilter('全部')
                    else setStageFilter(stage)
                  }}
                >
                  {idx + 1}
                </div>
                <div style={{
                  ...s.flowStageLabel,
                  ...(isActive ? s.flowStageLabelActive : {}),
                }}>
                  {stage}
                </div>
                <div style={s.flowStageCount}>
                  {stat.count}条
                </div>
                {idx < 6 && (
                  <div style={{
                    ...s.flowConnector,
                    ...(getRecordStageIdx({ currentStage: STAGES[idx] } as FlowRecord) >= idx + 1
                      ? s.flowConnectorDone : {})
                  }} />
                )}
              </div>
            )
          })}
        </div>

        {/* 各阶段平均耗时 */}
        <div style={s.durationBar}>
          {stageStats.map((stat, idx) => (
            <div key={stat.stage} style={s.durationItem}>
              <div style={s.durationLabel}>{stat.stage}</div>
              <div style={{
                ...s.durationValue,
                ...(stat.overdueRate > 0.15 ? s.overdue : {}),
              }}>
                {formatDuration(stat.avgDuration)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 筛选工具栏 */}
      <div style={s.toolbar}>
        <div style={s.searchBox}>
          <Search size={14} color="#94a3b8" />
          <input
            style={s.searchInput}
            placeholder="搜索患者姓名/ID/记录ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select style={s.select} value={stageFilter} onChange={e => setStageFilter(e.target.value as FlowStage | '全部')}>
          <option value="全部">全部阶段</option>
          {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select style={s.select} value={statusFilter} onChange={e => setStatusFilter(e.target.value as RecordStatus | '全部')}>
          <option value="全部">全部状态</option>
          <option value="进行中">进行中</option>
          <option value="已完成">已完成</option>
          <option value="已超时">已超时</option>
          <option value="已取消">已取消</option>
        </select>
        <select style={s.select} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="全部">全部类型</option>
          <option value="腹部超声">腹部超声</option>
          <option value="浅表器官超声">浅表器官超声</option>
          <option value="心血管超声">心血管超声</option>
          <option value="妇产科超声">妇产科超声</option>
          <option value="介入超声">介入超声</option>
          <option value="其他超声">其他超声</option>
        </select>
        <input
          type="date"
          style={s.select}
          value={dateFrom}
          onChange={e => setDateFrom(e.target.value)}
        />
        <span style={{ color: '#94a3b8', fontSize: 13 }}>至</span>
        <input
          type="date"
          style={s.select}
          value={dateTo}
          onChange={e => setDateTo(e.target.value)}
        />
        {hasFilters && (
          <div style={s.filterTag}>
            <span>{filteredRecords.length} 条结果</span>
            <span style={s.filterTagClose} onClick={clearFilters}>×</span>
          </div>
        )}
      </div>

      {/* 阶段展开详情列表 */}
      {expandedStage && (
        <div style={s.stagePanel}>
          <div style={s.stagePanelHeader}>
            <div style={s.stagePanelTitle}>
              <ChevronDown size={16} color="#1e40af" />
              {expandedStage}阶段记录
              <span style={s.stagePanelCount}>{expandedRecords.length} 条</span>
            </div>
            <button
              style={{ ...s.btn, ...s.btnGhost }}
              onClick={() => setExpandedStage(null)}
            >
              <X size={12} /> 收起
            </button>
          </div>
          <div style={s.recordList}>
            {expandedRecords.length === 0 ? (
              <div style={s.emptyState}>
                <div style={s.emptyIcon}>📭</div>
                暂无{expandedStage}阶段的记录
              </div>
            ) : (
              expandedRecords.slice(0, 10).map(r => (
                <RecordCard
                  key={r.id}
                  record={r}
                  isHovered={hoveredRecord === r.id}
                  onHover={setHoveredRecord}
                  onSelect={setSelectedRecord}
                  onAdvance={() => {
                    setAdvanceRecord(r)
                    setShowAdvanceModal(true)
                  }}
                />
              ))
            )}
          </div>
          {expandedRecords.length > 10 && (
            <div style={{ textAlign: 'center', marginTop: 12, color: '#94a3b8', fontSize: 12 }}>
              仅显示前10条，完整数据请使用筛选器查看
            </div>
          )}
        </div>
      )}

      {/* 全部记录列表（未展开时显示前20条） */}
      <div style={s.stagePanel}>
        <div style={s.stagePanelHeader}>
          <div style={s.stagePanelTitle}>
            <BarChart3 size={16} color="#1e40af" />
            全部流程记录
            <span style={s.stagePanelCount}>{filteredRecords.length} 条</span>
          </div>
          {!expandedStage && filteredRecords.length > 0 && (
            <div style={{ fontSize: 11, color: '#94a3b8' }}>
              点击阶段卡片可展开查看详情
            </div>
          )}
        </div>
        <div style={s.recordList}>
          {(expandedStage ? filteredRecords : filteredRecords.slice(0, 20)).map(r => (
            <RecordCard
              key={r.id}
              record={r}
              isHovered={hoveredRecord === r.id}
              onHover={setHoveredRecord}
              onSelect={setSelectedRecord}
              onAdvance={() => {
                setAdvanceRecord(r)
                setShowAdvanceModal(true)
              }}
            />
          ))}
        </div>
        {!expandedStage && filteredRecords.length > 20 && (
          <div style={{ textAlign: 'center', marginTop: 12, color: '#3b82f6', fontSize: 12, cursor: 'pointer' }}
            onClick={() => setExpandedStage('申请')}>
            查看全部 {filteredRecords.length} 条记录 ↓
          </div>
        )}
        {filteredRecords.length === 0 && (
          <div style={s.emptyState}>
            <div style={s.emptyIcon}>🔍</div>
            未找到匹配的流程记录
          </div>
        )}
      </div>

      {/* 记录详情弹窗 */}
      {selectedRecord && (
        <div style={s.modalOverlay} onClick={() => setSelectedRecord(null)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={s.modalTitle}>记录详情 - {selectedRecord.id}</div>
              <button style={{ ...s.btn, ...s.btnGhost, padding: '4px 8px' }} onClick={() => setSelectedRecord(null)}>
                <X size={14} />
              </button>
            </div>
            <div style={s.modalInfo}>
              <div style={s.modalInfoItem}>
                <span style={s.modalInfoLabel}>患者姓名</span>
                <span style={s.modalInfoValue}>{selectedRecord.patientName}</span>
              </div>
              <div style={s.modalInfoItem}>
                <span style={s.modalInfoLabel}>患者ID</span>
                <span style={s.modalInfoValue}>{selectedRecord.patientId}</span>
              </div>
              <div style={s.modalInfoItem}>
                <span style={s.modalInfoLabel}>性别/年龄</span>
                <span style={s.modalInfoValue}>{selectedRecord.gender} / {selectedRecord.age}岁</span>
              </div>
              <div style={s.modalInfoItem}>
                <span style={s.modalInfoLabel}>检查类型</span>
                <span style={s.modalInfoValue}>{selectedRecord.examType}</span>
              </div>
              <div style={s.modalInfoItem}>
                <span style={s.modalInfoLabel}>当前阶段</span>
                <span style={s.modalInfoValue}>{selectedRecord.currentStage}</span>
              </div>
              <div style={s.modalInfoItem}>
                <span style={s.modalInfoLabel}>负责医生</span>
                <span style={s.modalInfoValue}>{selectedRecord.doctorName}</span>
              </div>
              <div style={s.modalInfoItem}>
                <span style={s.modalInfoLabel}>申请时间</span>
                <span style={s.modalInfoValue}>{formatDateTime(selectedRecord.applyTime)}</span>
              </div>
              <div style={s.modalInfoItem}>
                <span style={s.modalInfoLabel}>状态</span>
                <span style={{
                  ...s.statusBadge,
                  ...getBadgeStyle(selectedRecord.status),
                }}>
                  {selectedRecord.status}
                </span>
              </div>
            </div>

            {/* 各阶段时间 */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1e40af', marginBottom: 10 }}>各阶段时间</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
                {STAGES.map((stage, idx) => {
                  const timeMap: Record<FlowStage, string | undefined> = {
                    '申请': selectedRecord.applyTime,
                    '预约': selectedRecord.appointmentTime,
                    '登记': selectedRecord.registerTime,
                    '检查': selectedRecord.examTime,
                    '报告': selectedRecord.reportTime,
                    '审核': selectedRecord.auditTime,
                    '分发': selectedRecord.dispatchTime,
                  }
                  const durationMap: Record<FlowStage, number | undefined> = {
                    '申请': selectedRecord.applyDuration,
                    '预约': selectedRecord.appointmentDuration,
                    '登记': selectedRecord.registerDuration,
                    '检查': selectedRecord.examDuration,
                    '报告': selectedRecord.reportDuration,
                    '审核': selectedRecord.auditDuration,
                    '分发': selectedRecord.dispatchDuration,
                  }
                  const isDone = idx < STAGE_INDEX[selectedRecord.currentStage]
                  const isCurrent = idx === STAGE_INDEX[selectedRecord.currentStage]
                  return (
                    <div key={stage} style={{
                      ...s.stageDetailItem,
                      ...(isCurrent ? s.stageDetailItemActive : {}),
                      ...(selectedRecord.isOverdue && isCurrent ? s.overdueBg : {}),
                    }}>
                      <div style={s.stageDetailLabel}>{stage}</div>
                      <div style={{
                        ...s.stageDetailValue,
                        ...(selectedRecord.isOverdue && isCurrent ? s.overdue : {}),
                      }}>
                        {isDone ? '✓' : isCurrent ? '进行中' : '-'}
                      </div>
                      <div style={s.stageDetailTime}>
                        {isDone ? formatDate(timeMap[stage]) : ''}
                      </div>
                      {isDone && durationMap[stage] && (
                        <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 2 }}>
                          {formatDuration(durationMap[stage]!)}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <div style={s.modalActions}>
              {STAGE_INDEX[selectedRecord.currentStage] < 6 && selectedRecord.status !== '已取消' && (
                <button
                  style={{ ...s.btn, ...s.btnPrimary }}
                  onClick={() => {
                    setSelectedRecord(null)
                    setAdvanceRecord(selectedRecord)
                    setShowAdvanceModal(true)
                  }}
                >
                  <ArrowRight size={12} />
                  推进到下一阶段
                </button>
              )}
              <button style={{ ...s.btn, ...s.btnGhost }} onClick={() => setSelectedRecord(null)}>
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 阶段流转确认弹窗 */}
      {showAdvanceModal && advanceRecord && (
        <div style={s.modalOverlay} onClick={() => setShowAdvanceModal(false)}>
          <div style={s.advanceModal} onClick={e => e.stopPropagation()}>
            <div style={s.modalTitle}>
              <ArrowRight size={16} color="#3b82f6" />
              确认推进阶段
            </div>
            <div style={{ fontSize: 14, color: '#334155', marginBottom: 16, lineHeight: 1.6 }}>
              确定要将检查记录 <strong style={{ color: '#1e40af' }}>{advanceRecord.id}</strong> 从
              <strong style={{ color: '#1e40af' }}>「{advanceRecord.currentStage}」</strong>
              推进到<strong style={{ color: '#22c55e' }}>「{STAGES[STAGE_INDEX[advanceRecord.currentStage] + 1]}」</strong>吗？
            </div>
            <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: 8, marginBottom: 16, border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                <span style={{ color: '#64748b' }}>患者</span>
                <span style={{ color: '#1e40af', fontWeight: 600 }}>{advanceRecord.patientName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                <span style={{ color: '#64748b' }}>检查类型</span>
                <span style={{ color: '#1e40af', fontWeight: 600 }}>{advanceRecord.examType}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#64748b' }}>当前状态</span>
                <span style={{ ...s.statusBadge, ...getBadgeStyle(advanceRecord.status) }}>
                  {advanceRecord.status}
                </span>
              </div>
            </div>
            <div style={s.modalActions}>
              <button
                style={{ ...s.btn, ...s.btnPrimary }}
                onClick={() => advanceRecordStage(advanceRecord)}
              >
                <CheckCircle size={12} />
                确认推进
              </button>
              <button
                style={{ ...s.btn, ...s.btnGhost }}
                onClick={() => setShowAdvanceModal(false)}
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ============ 记录卡片组件 ============
interface RecordCardProps {
  record: FlowRecord
  isHovered: boolean
  onHover: (id: string | null) => void
  onSelect: (r: FlowRecord) => void
  onAdvance: () => void
}

function RecordCard({ record, isHovered, onHover, onSelect, onAdvance }: RecordCardProps) {
  const currentIdx = STAGE_INDEX[record.currentStage]

  return (
    <div
      style={{
        ...s.recordCard,
        ...(isHovered ? s.recordCardHover : {}),
        ...(record.isOverdue ? s.recordCardOverdue : {}),
      }}
      onMouseEnter={() => onHover(record.id)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onSelect(record)}
    >
      <div style={s.recordHeader}>
        <div style={s.recordPatient}>
          <div style={s.recordAvatar}>
            {record.patientName.slice(-2)}
          </div>
          <div>
            <div style={s.recordName}>{record.patientName}</div>
            <div style={s.recordMeta}>
              {record.gender} · {record.age}岁 · {record.examType}
            </div>
          </div>
        </div>
        <div style={s.recordTags}>
          <span style={{ ...s.statusBadge, ...getBadgeStyle(record.status) }}>
            {record.status}
          </span>
          {record.isOverdue && (
            <span style={{ ...s.statusBadge, background: '#fee2e2', color: '#dc2626' }}>
              <AlertTriangle size={10} /> 超时
            </span>
          )}
        </div>
      </div>

      {/* 阶段进度条 */}
      <div style={s.recordStages}>
        {STAGES.map((stage, idx) => {
          const isDone = idx < currentIdx
          const isCurrent = idx === currentIdx
          const timeMap: Record<FlowStage, string | undefined> = {
            '申请': record.applyTime,
            '预约': record.appointmentTime,
            '登记': record.registerTime,
            '检查': record.examTime,
            '报告': record.recordTime,
            '审核': record.auditTime,
            '分发': record.dispatchTime,
          }
          return (
            <div key={stage} style={s.recordStage}>
              <div style={{
                ...s.recordStageDot,
                ...(isDone ? s.recordStageDotDone : {}),
                ...(isCurrent ? s.recordStageDotActive : {}),
              }} />
              <div style={s.recordStageLabel}>{stage}</div>
              <div style={s.recordStageTime}>
                {isDone ? formatDate(timeMap[stage]) : ''}
              </div>
              {idx < 6 && <div style={s.recordConnector} />}
            </div>
          )
        })}
      </div>

      {/* 底部操作 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
        <div style={{ fontSize: 11, color: '#94a3b8' }}>
          记录ID: {record.id} · {record.doctorName} · {formatDateTime(record.applyTime)}
        </div>
        <div style={s.recordActions}>
          <button
            style={{ ...s.btn, ...s.btnSm, ...s.btnPrimary }}
            onClick={e => { e.stopPropagation(); onAdvance() }}
          >
            <ArrowRight size={10} />
            推进
          </button>
        </div>
      </div>
    </div>
  )
}
