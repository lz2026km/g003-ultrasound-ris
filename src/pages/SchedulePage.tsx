// ============================================================
// G004 超声管理系统 - 排班管理增强页面
// 功能：班次管理 + 冲突检测 + 排班统计 + 排班模板 + 请假/替班 + 导出
// ============================================================
import { useState, useMemo, useRef } from 'react'
import {
  Search, Plus, Edit2, Trash2, X, Calendar, Clock,
  AlertTriangle, CheckCircle, Info, User, MapPin,
  Download, FileText, Copy, Users, Coffee, RefreshCw,
  ChevronDown, ChevronRight, BarChart3, Save, Upload,
  Eye, Bell, ClipboardList
} from 'lucide-react'
import type { DoctorSchedule, ExamRoom } from '../types'
import { initialDoctorSchedules, initialExamRooms, initialUsers } from '../data/initialData'

// ---------- 类型定义 ----------
interface ScheduleTemplate {
  id: string
  name: string
  description: string
  shifts: Array<{
    doctorId: string
    examRoomId: string
    shiftType: '上午' | '下午' | '全天' | '夜班' | '值班'
    startTime: string
    endTime: string
    maxAppointments: number
  }>
  applicableWeekdays: number[] // 1-7
}

interface LeaveRecord {
  id: string
  doctorId: string
  doctorName: string
  leaveType: '病假' | '事假' | '年假' | '婚假' | '产假' | '其他'
  startDate: string
  endDate: string
  reason: string
  status: '已申请' | '已批准' | '已拒绝' | '已销假'
  applyTime: string
  approver?: string
}

interface ShiftSwapRecord {
  id: string
  originalDoctorId: string
  originalDoctorName: string
  targetDoctorId: string
  targetDoctorName: string
  swapDate: string
  weekday: number
  shiftType: string
  reason: string
  status: '已申请' | '已同意' | '已拒绝' | '已完成'
  applyTime: string
}

interface WorkloadStat {
  doctorId: string
  doctorName: string
  morningCount: number
  afternoonCount: number
  fullDayCount: number
  nightCount: number
  dutyCount: number
  totalShifts: number
  totalAppointments: number
  utilizationRate: number
}

// ---------- 样式定义 ----------
const s: Record<string, React.CSSProperties> = {
  pageHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 18, fontWeight: 700, color: '#1a3a5c' },
  subtitle: { fontSize: 12, color: '#64748b', marginTop: 2 },
  toolbar: {
    display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap',
    background: '#fff', padding: '12px 16px', borderRadius: 8,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: 16,
  },
  searchBox: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: '#f8fafc', border: '1px solid #e2e8f0',
    borderRadius: 6, padding: '6px 12px', flex: 1, minWidth: 200,
  },
  searchInput: {
    border: 'none', outline: 'none', background: 'transparent',
    fontSize: 13, color: '#334155', width: '100%',
  },
  select: {
    border: '1px solid #e2e8f0', borderRadius: 6, padding: '6px 10px',
    fontSize: 13, color: '#334155', background: '#f8fafc', outline: 'none',
    cursor: 'pointer',
  },
  btnPrimary: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 6,
    padding: '7px 14px', fontSize: 13, cursor: 'pointer', minHeight: 44,
  },
  btnSecondary: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 6,
    padding: '7px 14px', fontSize: 13, cursor: 'pointer', minHeight: 44,
  },
  btnDanger: {
    display: 'flex', alignItems: 'center', gap: 4,
    background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 6,
    padding: '5px 8px', fontSize: 12, cursor: 'pointer',
  },
  btnIcon: {
    display: 'flex', alignItems: 'center', gap: 4,
    background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 6,
    padding: '5px 8px', fontSize: 12, cursor: 'pointer',
  },
  btnSuccess: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: '#dcfce7', color: '#166534', border: 'none', borderRadius: 6,
    padding: '7px 14px', fontSize: 13, cursor: 'pointer', minHeight: 44,
  },
  table: {
    width: '100%', borderCollapse: 'collapse', background: '#fff',
    borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  th: {
    background: '#f8fafc', padding: '10px 12px', textAlign: 'left',
    fontSize: 12, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e2e8f0',
  },
  td: {
    padding: '10px 12px', fontSize: 13, color: '#334155', borderBottom: '1px solid #f1f5f9',
  },
  badge: {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '3px 10px', borderRadius: 12, fontSize: 12,
  },
  badgeMorning: { background: '#fef3c7', color: '#92400e' },
  badgeAfternoon: { background: '#dbeafe', color: '#1e40af' },
  badgeFullDay: { background: '#dcfce7', color: '#166534' },
  badgeNight: { background: '#ede9fe', color: '#5b21b6' },
  badgeDuty: { background: '#fce7f3', color: '#9d174d' },
  badgeConflict: { background: '#fee2e2', color: '#dc2626' },
  badgeOk: { background: '#dcfce7', color: '#166534' },
  badgePending: { background: '#fef3c7', color: '#92400e' },
  badgeApproved: { background: '#dcfce7', color: '#166534' },
  badgeRejected: { background: '#fee2e2', color: '#dc2626' },
  actions: { display: 'flex', gap: 6 },
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: '#fff', borderRadius: 12, width: 560, maxHeight: '90vh',
    overflow: 'hidden', display: 'flex', flexDirection: 'column',
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
  },
  modalLarge: {
    background: '#fff', borderRadius: 12, width: 720, maxHeight: '90vh',
    overflow: 'hidden', display: 'flex', flexDirection: 'column',
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
  },
  modalHeader: {
    padding: '16px 20px', borderBottom: '1px solid #e2e8f0',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  modalTitle: { fontSize: 16, fontWeight: 600, color: '#1a3a5c' },
  closeBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 32, height: 32, borderRadius: 6, border: 'none',
    background: '#f1f5f9', cursor: 'pointer', color: '#64748b',
  },
  modalBody: {
    padding: 20, overflowY: 'auto', flex: 1,
  },
  formGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16,
  },
  formGroup: {
    display: 'flex', flexDirection: 'column', gap: 6,
  },
  label: {
    fontSize: 13, fontWeight: 500, color: '#475569',
  },
  input: {
    border: '1px solid #e2e8f0', borderRadius: 6, padding: '8px 12px',
    fontSize: 13, color: '#334155', outline: 'none',
  },
  fullWidth: { gridColumn: '1 / -1' },
  modalFooter: {
    padding: '16px 20px', borderTop: '1px solid #e2e8f0',
    display: 'flex', justifyContent: 'flex-end', gap: 10,
  },
  btnCancel: {
    padding: '8px 16px', borderRadius: 6, border: '1px solid #e2e8f0',
    background: '#fff', color: '#475569', fontSize: 13, cursor: 'pointer',
    minHeight: 44,
  },
  btnSave: {
    padding: '8px 16px', borderRadius: 6, border: 'none',
    background: '#1a3a5c', color: '#fff', fontSize: 13, cursor: 'pointer',
    minHeight: 44,
  },
  conflictAlert: {
    display: 'flex', alignItems: 'flex-start', gap: 10,
    padding: '12px 14px', borderRadius: 8, marginBottom: 16,
    background: '#fef2f2', border: '1px solid #fecaca',
  },
  conflictText: { fontSize: 13, color: '#991b1b', lineHeight: 1.5 },
  emptyState: {
    textAlign: 'center', padding: '48px 20px', color: '#94a3b8',
    fontSize: 14,
  },
  statCards: {
    display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 16,
  },
  statCard: {
    background: '#fff', padding: '16px', borderRadius: 8,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  statLabel: { fontSize: 12, color: '#64748b', marginBottom: 4 },
  statValue: { fontSize: 24, fontWeight: 700, color: '#1a3a5c' },
  statSub: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  weekdayHeader: {
    fontSize: 14, fontWeight: 600, color: '#1a3a5c',
    padding: '12px 16px', background: '#f8fafc',
    borderBottom: '2px solid #e2e8f0',
  },
  // Tabs
  tabBar: {
    display: 'flex', gap: 4, marginBottom: 16, background: '#fff',
    padding: '8px', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  tab: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
    borderRadius: 6, border: 'none', background: 'transparent',
    color: '#64748b', fontSize: 13, cursor: 'pointer', minHeight: 44,
  },
  tabActive: {
    background: '#1a3a5c', color: '#fff',
  },
  // Section
  section: {
    background: '#fff', borderRadius: 8, marginBottom: 16,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 14, fontWeight: 600, color: '#1a3a5c',
    padding: '14px 16px', borderBottom: '1px solid #e2e8f0',
    display: 'flex', alignItems: 'center', gap: 8,
  },
  // Template
  templateCard: {
    border: '1px solid #e2e8f0', borderRadius: 8, padding: 16,
    marginBottom: 12, cursor: 'pointer', transition: 'all 0.2s',
  },
  templateHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 8,
  },
  templateName: { fontSize: 14, fontWeight: 600, color: '#1a3a5c' },
  templateDesc: { fontSize: 12, color: '#64748b', marginBottom: 8 },
  templateMeta: { display: 'flex', gap: 12, flexWrap: 'wrap' as const },
  templateTag: {
    padding: '2px 8px', borderRadius: 10, fontSize: 11,
    background: '#f1f5f9', color: '#475569',
  },
  // Leave/Swap
  leaveRow: {
    display: 'flex', alignItems: 'center', padding: '12px 0',
    borderBottom: '1px solid #f1f5f9', gap: 12,
  },
  leaveAvatar: {
    width: 36, height: 36, borderRadius: '50%', background: '#1a3a5c',
    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 13, fontWeight: 600, flexShrink: 0,
  },
  leaveInfo: { flex: 1 },
  leaveName: { fontSize: 13, fontWeight: 600, color: '#1a3a5c' },
  leaveMeta: { fontSize: 11, color: '#64748b', marginTop: 2 },
  leaveActions: { display: 'flex', gap: 6 },
  // Workload
  workloadRow: {
    display: 'flex', alignItems: 'center', padding: '12px 16px',
    borderBottom: '1px solid #f1f5f9', gap: 16,
  },
  workloadBar: {
    flex: 1, height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden',
  },
  workloadBarFill: { height: '100%', background: '#1a3a5c', borderRadius: 4 },
  // Accordion
  accordionHeader: {
    display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px',
    background: '#f8fafc', borderBottom: '1px solid #e2e8f0',
    cursor: 'pointer',
  },
  accordionContent: { padding: 16 },
  // Info alert
  infoAlert: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 14px', borderRadius: 8, marginBottom: 12,
    background: '#f0f9ff', border: '1px solid #bae6fd',
  },
  // Toggle
  toggle: {
    width: 44, height: 24, borderRadius: 12, border: 'none',
    cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
  },
}

// ---------- 辅助函数 ----------
const weekdays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
const shiftTypeLabels: Record<string, string> = {
  '上午': '上午',
  '下午': '下午',
  '全天': '全天',
  '夜班': '夜班',
  '值班': '值班',
}

function hasTimeConflict(
  schedules: DoctorSchedule[],
  doctorId: string,
  weekday: number,
  shiftType: string,
  startTime: string,
  endTime: string,
  excludeId?: string
): DoctorSchedule | null {
  for (const sch of schedules) {
    if (excludeId && sch.id === excludeId) continue
    if (sch.doctorId !== doctorId || sch.weekday !== weekday || !sch.isActive) continue
    if (shiftType === '全天' || sch.shiftType === '全天') continue
    if (shiftType === '夜班' || sch.shiftType === '夜班') continue
    if (shiftType === '值班' || sch.shiftType === '值班') continue
    const existStart = sch.startTime
    const existEnd = sch.endTime
    if (!(endTime <= existStart || startTime >= existEnd)) {
      return sch
    }
  }
  return null
}

function hasRoomConflict(
  schedules: DoctorSchedule[],
  examRoomId: string,
  weekday: number,
  shiftType: string,
  startTime: string,
  endTime: string,
  excludeId?: string
): DoctorSchedule | null {
  for (const sch of schedules) {
    if (excludeId && sch.id === excludeId) continue
    if (sch.examRoomId !== examRoomId || sch.weekday !== weekday || !sch.isActive) continue
    if (shiftType === '全天' || sch.shiftType === '全天') continue
    if (shiftType === '夜班' || sch.shiftType === '夜班') continue
    if (shiftType === '值班' || sch.shiftType === '值班') continue
    const existStart = sch.startTime
    const existEnd = sch.endTime
    if (!(endTime <= existStart || startTime >= existEnd)) {
      return sch
    }
  }
  return null
}

function generateId(prefix: string): string {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).substr(2, 4)}`
}

const doctors = initialUsers.filter(u => u.role === '医生')

// ---------- 默认排班模板 ----------
const defaultTemplates: ScheduleTemplate[] = [
  {
    id: 'TPL-001',
    name: '标准门诊模板',
    description: '适用于常规门诊的医生排班模板',
    shifts: [
      { doctorId: doctors[0]?.id || '', examRoomId: initialExamRooms[0]?.id || '', shiftType: '上午', startTime: '08:00', endTime: '12:00', maxAppointments: 12 },
      { doctorId: doctors[1]?.id || '', examRoomId: initialExamRooms[1]?.id || '', shiftType: '上午', startTime: '08:00', endTime: '12:00', maxAppointments: 10 },
    ],
    applicableWeekdays: [1, 2, 3, 4, 5],
  },
  {
    id: 'TPL-002',
    name: '周末门诊模板',
    description: '周末减半排班模板',
    shifts: [
      { doctorId: doctors[0]?.id || '', examRoomId: initialExamRooms[0]?.id || '', shiftType: '上午', startTime: '09:00', endTime: '13:00', maxAppointments: 8 },
    ],
    applicableWeekdays: [6, 7],
  },
  {
    id: 'TPL-003',
    name: '急诊值班模板',
    description: '夜班及节假日急诊排班模板',
    shifts: [
      { doctorId: doctors[2]?.id || '', examRoomId: initialExamRooms[0]?.id || '', shiftType: '夜班', startTime: '18:00', endTime: '22:00', maxAppointments: 6 },
      { doctorId: doctors[0]?.id || '', examRoomId: initialExamRooms[1]?.id || '', shiftType: '值班', startTime: '08:00', endTime: '18:00', maxAppointments: 8 },
    ],
    applicableWeekdays: [1, 2, 3, 4, 5, 6, 7],
  },
]

// ---------- 默认请假记录 ----------
const defaultLeaveRecords: LeaveRecord[] = [
  { id: 'LV-001', doctorId: doctors[1]?.id || '', doctorName: doctors[1]?.name || '李秀英', leaveType: '年假', startDate: '2026-05-06', endDate: '2026-05-10', reason: '年度休假', status: '已批准', applyTime: '2026-04-25 10:30:00', approver: '张主任' },
  { id: 'LV-002', doctorId: doctors[2]?.id || '', doctorName: doctors[2]?.name || '王芳', leaveType: '病假', startDate: '2026-05-02', endDate: '2026-05-03', reason: '感冒发热', status: '已批准', applyTime: '2026-05-01 08:00:00', approver: '张主任' },
  { id: 'LV-003', doctorId: doctors[3]?.id || '', doctorName: doctors[3]?.name || '刘洋', leaveType: '事假', startDate: '2026-05-15', endDate: '2026-05-15', reason: '家中有事', status: '已申请', applyTime: '2026-04-29 14:20:00' },
]

// ---------- 默认替班记录 ----------
const defaultSwapRecords: ShiftSwapRecord[] = [
  { id: 'SW-001', originalDoctorId: doctors[0]?.id || '', originalDoctorName: doctors[0]?.name || '张建国', targetDoctorId: doctors[1]?.id || '', targetDoctorName: doctors[1]?.name || '李秀英', swapDate: '2026-05-08', weekday: 4, shiftType: '上午', reason: '临时会议', status: '已同意', applyTime: '2026-04-28 09:00:00' },
  { id: 'SW-002', originalDoctorId: doctors[2]?.id || '', originalDoctorName: doctors[2]?.name || '王芳', targetDoctorId: doctors[3]?.id || '', targetDoctorName: doctors[3]?.name || '刘洋', swapDate: '2026-05-12', weekday: 2, shiftType: '下午', reason: '个人事务', status: '已申请', applyTime: '2026-04-29 11:30:00' },
]

// ---------- 组件 ----------
export default function SchedulePage() {
  const [schedules, setSchedules] = useState<DoctorSchedule[]>(initialDoctorSchedules)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [filterWeekday, setFilterWeekday] = useState<number | ''>('')
  const [filterDoctor, setFilterDoctor] = useState<string>('')
  const [showModal, setShowModal] = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [showSwapModal, setShowSwapModal] = useState(false)
  const [showWorkloadModal, setShowWorkloadModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [conflicts, setConflicts] = useState<{ doctor?: DoctorSchedule; room?: DoctorSchedule } | null>(null)
  const [activeTab, setActiveTab] = useState<'schedule' | 'template' | 'leave' | 'swap' | 'workload'>('schedule')
  const [templates, setTemplates] = useState<ScheduleTemplate[]>(defaultTemplates)
  const [leaveRecords, setLeaveRecords] = useState<LeaveRecord[]>(defaultLeaveRecords)
  const [swapRecords, setSwapRecords] = useState<ShiftSwapRecord[]>(defaultSwapRecords)
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null)
  const [expandedLeave, setExpandedLeave] = useState<string | null>(null)
  const [expandedSwap, setExpandedSwap] = useState<string | null>(null)
  const [leaveForm, setLeaveForm] = useState({
    doctorId: doctors[0]?.id || '',
    leaveType: '年假' as LeaveRecord['leaveType'],
    startDate: '',
    endDate: '',
    reason: '',
  })
  const [swapForm, setSwapForm] = useState({
    originalDoctorId: doctors[0]?.id || '',
    targetDoctorId: doctors[1]?.id || '',
    swapDate: '',
    weekday: 1,
    shiftType: '上午' as '上午' | '下午' | '全天' | '夜班',
    reason: '',
  })

  const [form, setForm] = useState({
    doctorId: '',
    examRoomId: '',
    weekday: 1,
    shiftType: '上午' as '上午' | '下午' | '全天' | '夜班' | '值班',
    startTime: '08:00',
    endTime: '12:00',
    maxAppointments: 10,
  })

  // 过滤后的数据
  const filtered = useMemo(() => {
    return schedules.filter(sch => {
      if (filterWeekday !== '' && sch.weekday !== filterWeekday) return false
      if (filterDoctor && sch.doctorId !== filterDoctor) return false
      if (searchKeyword) {
        const kw = searchKeyword.toLowerCase()
        if (!sch.doctorName.toLowerCase().includes(kw) &&
            !sch.examRoomName.toLowerCase().includes(kw)) return false
      }
      return true
    })
  }, [schedules, searchKeyword, filterWeekday, filterDoctor])

  // 按周几分组
  const grouped = useMemo(() => {
    const groups: Record<number, DoctorSchedule[]> = {}
    for (let i = 1; i <= 7; i++) {
      groups[i] = filtered.filter(s => s.weekday === i)
    }
    return groups
  }, [filtered])

  // 统计数据
  const stats = useMemo(() => {
    const active = schedules.filter(s => s.isActive)
    const totalSlots = active.reduce((sum, s) => sum + s.maxAppointments, 0)
    const usedSlots = active.reduce((sum, s) => sum + s.currentAppointments, 0)
    const conflictCount = schedules.filter(s => s.isActive && s.currentAppointments > s.maxAppointments).length
    const morningCount = active.filter(s => s.shiftType === '上午').length
    const afternoonCount = active.filter(s => s.shiftType === '下午').length
    const nightCount = active.filter(s => s.shiftType === '夜班').length
    const dutyCount = active.filter(s => s.shiftType === '值班').length
    return {
      totalSchedules: active.length,
      totalSlots,
      usedSlots,
      conflictCount,
      morningCount,
      afternoonCount,
      nightCount,
      dutyCount,
    }
  }, [schedules])

  // 工作量统计
  const workloadStats = useMemo((): WorkloadStat[] => {
    const statMap: Record<string, WorkloadStat> = {}
    doctors.forEach(d => {
      statMap[d.id] = {
        doctorId: d.id,
        doctorName: d.name,
        morningCount: 0,
        afternoonCount: 0,
        fullDayCount: 0,
        nightCount: 0,
        dutyCount: 0,
        totalShifts: 0,
        totalAppointments: 0,
        utilizationRate: 0,
      }
    })
    schedules.filter(s => s.isActive).forEach(sch => {
      const stat = statMap[sch.doctorId]
      if (!stat) return
      stat.totalShifts++
      stat.totalAppointments += sch.currentAppointments
      if (sch.shiftType === '上午') stat.morningCount++
      else if (sch.shiftType === '下午') stat.afternoonCount++
      else if (sch.shiftType === '全天') stat.fullDayCount++
      else if (sch.shiftType === '夜班') stat.nightCount++
      else if (sch.shiftType === '值班') stat.dutyCount++
    })
    Object.values(statMap).forEach(stat => {
      stat.utilizationRate = stat.totalShifts > 0 ? Math.round((stat.totalAppointments / (stat.totalShifts * 10)) * 100) : 0
    })
    return Object.values(statMap).sort((a, b) => b.totalShifts - a.totalShifts)
  }, [schedules])

  // 打开新增弹窗
  const openAddModal = () => {
    setEditingId(null)
    setForm({
      doctorId: doctors[0]?.id || '',
      examRoomId: initialExamRooms[0]?.id || '',
      weekday: 1,
      shiftType: '上午',
      startTime: '08:00',
      endTime: '12:00',
      maxAppointments: 10,
    })
    setConflicts(null)
    setShowModal(true)
  }

  // 打开编辑弹窗
  const openEditModal = (sch: DoctorSchedule) => {
    setEditingId(sch.id)
    setForm({
      doctorId: sch.doctorId,
      examRoomId: sch.examRoomId,
      weekday: sch.weekday,
      shiftType: sch.shiftType as any,
      startTime: sch.startTime,
      endTime: sch.endTime,
      maxAppointments: sch.maxAppointments,
    })
    setConflicts(null)
    setShowModal(true)
  }

  // 班次变更时更新默认时间
  const handleShiftTypeChange = (type: '上午' | '下午' | '全天' | '夜班' | '值班') => {
    const times: Record<string, { start: string; end: string }> = {
      '上午': { start: '08:00', end: '12:00' },
      '下午': { start: '14:00', end: '18:00' },
      '全天': { start: '08:00', end: '18:00' },
      '夜班': { start: '18:00', end: '22:00' },
      '值班': { start: '08:00', end: '18:00' },
    }
    setForm(prev => ({
      ...prev,
      shiftType: type,
      startTime: times[type].start,
      endTime: times[type].end,
    }))
  }

  // 检测冲突
  const detectConflicts = () => {
    const doctorConflict = hasTimeConflict(
      schedules, form.doctorId, form.weekday,
      form.shiftType, form.startTime, form.endTime, editingId || undefined
    )
    const roomConflict = hasRoomConflict(
      schedules, form.examRoomId, form.weekday,
      form.shiftType, form.startTime, form.endTime, editingId || undefined
    )
    setConflicts({
      doctor: doctorConflict || undefined,
      room: roomConflict || undefined,
    })
    return !doctorConflict && !roomConflict
  }

  // 保存排班
  const handleSave = () => {
    const doctorConflict = hasTimeConflict(
      schedules, form.doctorId, form.weekday,
      form.shiftType, form.startTime, form.endTime, editingId || undefined
    )
    const roomConflict = hasRoomConflict(
      schedules, form.examRoomId, form.weekday,
      form.shiftType, form.startTime, form.endTime, editingId || undefined
    )

    if (doctorConflict || roomConflict) {
      setConflicts({
        doctor: doctorConflict || undefined,
        room: roomConflict || undefined,
      })
      return
    }

    const doctor = doctors.find(d => d.id === form.doctorId)
    const room = initialExamRooms.find(r => r.id === form.examRoomId)

    if (editingId) {
      setSchedules(prev => prev.map(s =>
        s.id === editingId
          ? {
              ...s,
              doctorId: form.doctorId,
              doctorName: doctor?.name || s.doctorName,
              examRoomId: form.examRoomId,
              examRoomName: room?.name || s.examRoomName,
              weekday: form.weekday,
              shiftType: form.shiftType,
              startTime: form.startTime,
              endTime: form.endTime,
              maxAppointments: form.maxAppointments,
            }
          : s
      ))
    } else {
      const newSchedule: DoctorSchedule = {
        id: generateId('SCH'),
        doctorId: form.doctorId,
        doctorName: doctor?.name || '',
        examRoomId: form.examRoomId,
        examRoomName: room?.name || '',
        weekday: form.weekday,
        shiftType: form.shiftType,
        startTime: form.startTime,
        endTime: form.endTime,
        maxAppointments: form.maxAppointments,
        currentAppointments: 0,
        isActive: true,
      }
      setSchedules(prev => [...prev, newSchedule])
    }

    setShowModal(false)
  }

  // 删除排班
  const handleDelete = (id: string) => {
    if (confirm('确定要删除该排班记录吗？')) {
      setSchedules(prev => prev.filter(s => s.id !== id))
    }
  }

  // 切换启用状态
  const toggleActive = (id: string) => {
    setSchedules(prev => prev.map(s =>
      s.id === id ? { ...s, isActive: !s.isActive } : s
    ))
  }

  // 应用排班模板
  const applyTemplate = (template: ScheduleTemplate) => {
    const targetWeekdays = template.applicableWeekdays
    const newSchedules: DoctorSchedule[] = [...schedules]

    targetWeekdays.forEach(wd => {
      template.shifts.forEach(shift => {
        const doctor = doctors.find(d => d.id === shift.doctorId)
        const room = initialExamRooms.find(r => r.id === shift.examRoomId)
        const conflict = hasTimeConflict(
          newSchedules, shift.doctorId, wd,
          shift.shiftType, shift.startTime, shift.endTime
        )
        if (!conflict) {
          newSchedules.push({
            id: generateId('SCH'),
            doctorId: shift.doctorId,
            doctorName: doctor?.name || '',
            examRoomId: shift.examRoomId,
            examRoomName: room?.name || '',
            weekday: wd,
            shiftType: shift.shiftType,
            startTime: shift.startTime,
            endTime: shift.endTime,
            maxAppointments: shift.maxAppointments,
            currentAppointments: 0,
            isActive: true,
          })
        }
      })
    })

    setSchedules(newSchedules)
    alert(`已为 ${targetWeekdays.length} 天应用模板"${template.name}"`)
  }

  // 保存模板
  const handleSaveTemplate = (template: ScheduleTemplate) => {
    const existing = templates.find(t => t.id === template.id)
    if (existing) {
      setTemplates(prev => prev.map(t => t.id === template.id ? template : t))
    } else {
      setTemplates(prev => [...prev, { ...template, id: generateId('TPL') }])
    }
    setShowTemplateModal(false)
  }

  // 新增请假记录
  const handleAddLeave = () => {
    const doctor = doctors.find(d => d.id === leaveForm.doctorId)
    const newLeave: LeaveRecord = {
      id: generateId('LV'),
      doctorId: leaveForm.doctorId,
      doctorName: doctor?.name || '',
      leaveType: leaveForm.leaveType,
      startDate: leaveForm.startDate,
      endDate: leaveForm.endDate,
      reason: leaveForm.reason,
      status: '已申请',
      applyTime: new Date().toLocaleString('zh-CN'),
    }
    setLeaveRecords(prev => [...prev, newLeave])
    setLeaveForm({ doctorId: doctors[0]?.id || '', leaveType: '年假', startDate: '', endDate: '', reason: '' })
    setShowLeaveModal(false)
  }

  // 请假审批
  const handleLeaveAction = (id: string, action: '批准' | '拒绝') => {
    setLeaveRecords(prev => prev.map(l =>
      l.id === id ? { ...l, status: action === '批准' ? '已批准' : '已拒绝', approver: '张主任' } : l
    ))
  }

  // 新增替班记录
  const handleAddSwap = () => {
    const original = doctors.find(d => d.id === swapForm.originalDoctorId)
    const target = doctors.find(d => d.id === swapForm.targetDoctorId)
    const newSwap: ShiftSwapRecord = {
      id: generateId('SW'),
      originalDoctorId: swapForm.originalDoctorId,
      originalDoctorName: original?.name || '',
      targetDoctorId: swapForm.targetDoctorId,
      targetDoctorName: target?.name || '',
      swapDate: swapForm.swapDate,
      weekday: swapForm.weekday,
      shiftType: swapForm.shiftType,
      reason: swapForm.reason,
      status: '已申请',
      applyTime: new Date().toLocaleString('zh-CN'),
    }
    setSwapRecords(prev => [...prev, newSwap])
    setSwapForm({ originalDoctorId: doctors[0]?.id || '', targetDoctorId: doctors[1]?.id || '', swapDate: '', weekday: 1, shiftType: '上午', reason: '' })
    setShowSwapModal(false)
  }

  // 替班审批
  const handleSwapAction = (id: string, action: '同意' | '拒绝') => {
    setSwapRecords(prev => prev.map(s =>
      s.id === id ? { ...s, status: action === '同意' ? '已同意' : '已拒绝' } : s
    ))
  }

  // 导出排班数据
  const handleExport = () => {
    const exportData = schedules.map(sch => ({
      医生: sch.doctorName,
      诊室: sch.examRoomName,
      星期: weekdays[sch.weekday - 1],
      班次: shiftTypeLabels[sch.shiftType],
      开始时间: sch.startTime,
      结束时间: sch.endTime,
      最大预约: sch.maxAppointments,
      已预约: sch.currentAppointments,
      状态: sch.isActive ? '启用' : '停用',
    }))
    const csv = [
      Object.keys(exportData[0] || {}).join(','),
      ...exportData.map(row => Object.values(row).join(',')),
    ].join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `排班表_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // 获取班次样式
  const getShiftBadgeStyle = (shiftType: string): React.CSSProperties => {
    const map: Record<string, React.CSSProperties> = {
      '上午': s.badgeMorning,
      '下午': s.badgeAfternoon,
      '全天': s.badgeFullDay,
      '夜班': s.badgeNight,
      '值班': s.badgeDuty,
    }
    return { ...s.badge, ...map[shiftType] }
  }

  const getLeaveBadgeStyle = (status: string): React.CSSProperties => {
    const map: Record<string, React.CSSProperties> = {
      '已申请': s.badgePending,
      '已批准': s.badgeApproved,
      '已拒绝': s.badgeRejected,
      '已销假': s.badgeOk,
    }
    return { ...s.badge, ...map[status] || s.badge }
  }

  const getSwapBadgeStyle = (status: string): React.CSSProperties => {
    const map: Record<string, React.CSSProperties> = {
      '已申请': s.badgePending,
      '已同意': s.badgeApproved,
      '已拒绝': s.badgeRejected,
      '已完成': s.badgeOk,
    }
    return { ...s.badge, ...map[status] || s.badge }
  }

  // 周几对应的shiftType
  const getDayShiftTypes = (daySchedules: DoctorSchedule[]) => {
    const types = new Set(daySchedules.filter(s => s.isActive).map(s => s.shiftType))
    return Array.from(types)
  }

  return (
    <div style={{ padding: 24 }}>
      {/* 头部 */}
      <div style={s.pageHeader}>
        <div>
          <h2 style={s.title}>医生排班管理</h2>
          <div style={s.subtitle}>管理超声中心医生出诊排班与诊室资源分配 · 支持模板、请假、替班功能</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={s.btnSecondary} onClick={handleExport}>
            <Download size={16} /> 导出排班
          </button>
          <button style={s.btnPrimary} onClick={openAddModal}>
            <Plus size={16} /> 新增排班
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div style={s.statCards}>
        <div style={s.statCard}>
          <div style={s.statLabel}>排班数量</div>
          <div style={s.statValue}>{stats.totalSchedules}</div>
          <div style={s.statSub}>当前启用排班数</div>
        </div>
        <div style={s.statCard}>
          <div style={s.statLabel}>总预约容量</div>
          <div style={s.statValue}>{stats.totalSlots}</div>
          <div style={s.statSub}>可预约总人次</div>
        </div>
        <div style={s.statCard}>
          <div style={s.statLabel}>已预约</div>
          <div style={s.statValue}>{stats.usedSlots}</div>
          <div style={s.statSub}>已安排检查人次</div>
        </div>
        <div style={s.statCard}>
          <div style={s.statLabel}>冲突预警</div>
          <div style={{ ...s.statValue, color: stats.conflictCount > 0 ? '#dc2626' : '#166534' }}>
            {stats.conflictCount}
          </div>
          <div style={s.statSub}>超容量排班数</div>
        </div>
        <div style={s.statCard}>
          <div style={s.statLabel}>班次分布</div>
          <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
            <span style={{ ...s.badge, ...s.badgeMorning, fontSize: 10 }}>上午 {stats.morningCount}</span>{' '}
            <span style={{ ...s.badge, ...s.badgeAfternoon, fontSize: 10 }}>下午 {stats.afternoonCount}</span>{' '}
            <span style={{ ...s.badge, ...s.badgeNight, fontSize: 10 }}>夜班 {stats.nightCount}</span>
          </div>
          <div style={s.statSub}>本周排班分布</div>
        </div>
      </div>

      {/* Tab 导航 */}
      <div style={s.tabBar}>
        <button style={{ ...s.tab, ...(activeTab === 'schedule' ? s.tabActive : {}) }} onClick={() => setActiveTab('schedule')}>
          <Calendar size={14} /> 排班管理
        </button>
        <button style={{ ...s.tab, ...(activeTab === 'template' ? s.tabActive : {}) }} onClick={() => setActiveTab('template')}>
          <Copy size={14} /> 排班模板
        </button>
        <button style={{ ...s.tab, ...(activeTab === 'leave' ? s.tabActive : {}) }} onClick={() => setActiveTab('leave')}>
          <Coffee size={14} /> 请假记录
          {leaveRecords.filter(l => l.status === '已申请').length > 0 && (
            <span style={{ background: '#dc2626', color: '#fff', borderRadius: 10, padding: '0 6px', fontSize: 10, fontWeight: 700 }}>
              {leaveRecords.filter(l => l.status === '已申请').length}
            </span>
          )}
        </button>
        <button style={{ ...s.tab, ...(activeTab === 'swap' ? s.tabActive : {}) }} onClick={() => setActiveTab('swap')}>
          <Users size={14} /> 替班记录
          {swapRecords.filter(s => s.status === '已申请').length > 0 && (
            <span style={{ background: '#d97706', color: '#fff', borderRadius: 10, padding: '0 6px', fontSize: 10, fontWeight: 700 }}>
              {swapRecords.filter(s => s.status === '已申请').length}
            </span>
          )}
        </button>
        <button style={{ ...s.tab, ...(activeTab === 'workload' ? s.tabActive : {}) }} onClick={() => setActiveTab('workload')}>
          <BarChart3 size={14} /> 工作量统计
        </button>
      </div>

      {/* ===== 排班管理 ===== */}
      {activeTab === 'schedule' && (
        <>
          <div style={s.toolbar}>
            <div style={s.searchBox}>
              <Search size={16} color="#94a3b8" />
              <input
                style={s.searchInput}
                placeholder="搜索医生或诊室..."
                value={searchKeyword}
                onChange={e => setSearchKeyword(e.target.value)}
              />
            </div>
            <select style={s.select} value={filterWeekday} onChange={e => setFilterWeekday(e.target.value ? Number(e.target.value) : '')}>
              <option value="">全部星期</option>
              {weekdays.map((d, i) => <option key={i} value={i + 1}>{d}</option>)}
            </select>
            <select style={s.select} value={filterDoctor} onChange={e => setFilterDoctor(e.target.value)}>
              <option value="">全部医生</option>
              {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <button style={s.btnSecondary} onClick={() => { setSearchKeyword(''); setFilterWeekday(''); setFilterDoctor('') }}>
              <RefreshCw size={14} /> 重置
            </button>
          </div>

          {/* 按周分组显示 */}
          {weekdays.map((dayName, idx) => {
            const dayNum = idx + 1
            const daySchedules = grouped[dayNum]
            const dayShiftTypes = getDayShiftTypes(daySchedules)
            return (
              <div key={dayNum} style={{ marginBottom: 20 }}>
                <div style={s.weekdayHeader}>
                  <Calendar size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                  {dayName} ({daySchedules.length} 条排班)
                  {dayShiftTypes.length > 0 && (
                    <div style={{ display: 'flex', gap: 4, marginLeft: 12 }}>
                      {dayShiftTypes.map(type => (
                        <span key={type} style={getShiftBadgeStyle(type)}>{shiftTypeLabels[type] || type}</span>
                      ))}
                    </div>
                  )}
                </div>
                {daySchedules.length === 0 ? (
                  <div style={{ ...s.emptyState, background: '#fff', borderRadius: 8, padding: '48px 20px' }}>
                    <Calendar size={40} color="#cbd5e1" style={{ marginBottom: 12, opacity: 0.5 }} />
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#94a3b8', marginBottom: 6 }}>该日暂无排班记录</div>
                    <div style={{ fontSize: 12, color: '#cbd5e1' }}>点击右上角"新增排班"为此日添加医生排班</div>
                  </div>
                ) : (
                  <table style={s.table}>
                    <thead>
                      <tr>
                        <th style={s.th}>医生</th>
                        <th style={s.th}>诊室</th>
                        <th style={s.th}>班次</th>
                        <th style={s.th}>时段</th>
                        <th style={s.th}>预约情况</th>
                        <th style={s.th}>状态</th>
                        <th style={s.th}>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {daySchedules.map(sch => {
                        const isOverload = sch.currentAppointments > sch.maxAppointments
                        return (
                          <tr key={sch.id} style={{ opacity: sch.isActive ? 1 : 0.5 }}>
                            <td style={s.td}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <User size={14} color="#64748b" />
                                {sch.doctorName}
                              </span>
                            </td>
                            <td style={s.td}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <MapPin size={14} color="#64748b" />
                                {sch.examRoomName}
                              </span>
                            </td>
                            <td style={s.td}>
                              <span style={getShiftBadgeStyle(sch.shiftType)}>
                                {shiftTypeLabels[sch.shiftType] || sch.shiftType}
                              </span>
                            </td>
                            <td style={s.td}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Clock size={13} color="#64748b" />
                                {sch.startTime} - {sch.endTime}
                              </span>
                            </td>
                            <td style={s.td}>
                              <span style={{
                                color: isOverload ? '#dc2626' : '#166534',
                                fontWeight: isOverload ? 600 : 400,
                              }}>
                                {sch.currentAppointments} / {sch.maxAppointments}
                              </span>
                              {isOverload && (
                                <AlertTriangle size={14} color="#dc2626" style={{ marginLeft: 4 }} />
                              )}
                            </td>
                            <td style={s.td}>
                              <span style={{
                                ...s.badge,
                                background: sch.isActive ? '#dcfce7' : '#f1f5f9',
                                color: sch.isActive ? '#166534' : '#64748b',
                              }}>
                                {sch.isActive ? '启用' : '停用'}
                              </span>
                            </td>
                            <td style={s.td}>
                              <div style={s.actions}>
                                <button
                                  style={s.btnIcon}
                                  onClick={() => openEditModal(sch)}
                                  title="编辑"
                                >
                                  <Edit2 size={13} />
                                </button>
                                <button
                                  style={{ ...s.btnIcon, background: sch.isActive ? '#fef3c7' : '#dcfce7', color: sch.isActive ? '#92400e' : '#166534' }}
                                  onClick={() => toggleActive(sch.id)}
                                  title={sch.isActive ? '停用' : '启用'}
                                >
                                  {sch.isActive ? '停用' : '启用'}
                                </button>
                                <button
                                  style={s.btnDanger}
                                  onClick={() => handleDelete(sch.id)}
                                  title="删除"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            )
          })}
        </>
      )}

      {/* ===== 排班模板 ===== */}
      {activeTab === 'template' && (
        <div style={s.section}>
          <div style={{ ...s.sectionTitle, justifyContent: 'space-between' }}>
            <div><ClipboardList size={16} /> 排班模板管理</div>
            <button style={s.btnPrimary} onClick={() => { setShowTemplateModal(true) }}>
              <Plus size={14} /> 新建模板
            </button>
          </div>
          <div style={{ padding: 16 }}>
            <div style={s.infoAlert}>
              <Info size={16} color="#0369a1" />
              <span style={{ fontSize: 13, color: '#0c4a6e' }}>
                排班模板可以帮助您快速为多天生成排班。点击模板右侧的"应用"按钮，一键将该模板应用到对应的星期。
              </span>
            </div>
            {templates.map(tpl => (
              <div
                key={tpl.id}
                style={{
                  ...s.templateCard,
                  borderColor: expandedTemplate === tpl.id ? '#1a3a5c' : '#e2e8f0',
                }}
              >
                <div
                  style={s.templateHeader}
                  onClick={() => setExpandedTemplate(expandedTemplate === tpl.id ? null : tpl.id)}
                >
                  <div>
                    <div style={s.templateName}>{tpl.name}</div>
                    <div style={s.templateDesc}>{tpl.description}</div>
                    <div style={s.templateMeta}>
                      {tpl.applicableWeekdays.map(wd => (
                        <span key={wd} style={s.templateTag}>{weekdays[wd - 1]}</span>
                      ))}
                      <span style={{ ...s.templateTag, background: '#ede9fe', color: '#5b21b6' }}>
                        {tpl.shifts.length} 个班次
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      style={s.btnPrimary}
                      onClick={(e) => { e.stopPropagation(); applyTemplate(tpl) }}
                    >
                      <Download size={13} /> 应用模板
                    </button>
                    <ChevronDown
                      size={18}
                      color="#64748b"
                      style={{ transform: expandedTemplate === tpl.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                    />
                  </div>
                </div>
                {expandedTemplate === tpl.id && (
                  <div style={{ marginTop: 12, borderTop: '1px solid #f1f5f9', paddingTop: 12 }}>
                    <table style={s.table}>
                      <thead>
                        <tr>
                          <th style={s.th}>医生</th>
                          <th style={s.th}>诊室</th>
                          <th style={s.th}>班次</th>
                          <th style={s.th}>时段</th>
                          <th style={s.th}>最大预约</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tpl.shifts.map((shift, idx) => {
                          const doc = doctors.find(d => d.id === shift.doctorId)
                          const room = initialExamRooms.find(r => r.id === shift.examRoomId)
                          return (
                            <tr key={idx}>
                              <td style={s.td}>{doc?.name || shift.doctorId}</td>
                              <td style={s.td}>{room?.name || shift.examRoomId}</td>
                              <td style={s.td}>
                                <span style={getShiftBadgeStyle(shift.shiftType)}>
                                  {shift.shiftType}
                                </span>
                              </td>
                              <td style={s.td}>{shift.startTime} - {shift.endTime}</td>
                              <td style={s.td}>{shift.maxAppointments}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== 请假记录 ===== */}
      {activeTab === 'leave' && (
        <div style={s.section}>
          <div style={{ ...s.sectionTitle, justifyContent: 'space-between' }}>
            <div><Coffee size={16} /> 请假记录</div>
            <button style={s.btnPrimary} onClick={() => setShowLeaveModal(true)}>
              <Plus size={14} /> 新增请假
            </button>
          </div>
          <div style={{ padding: 16 }}>
            {leaveRecords.length === 0 ? (
              <div style={s.emptyState}>暂无请假记录</div>
            ) : leaveRecords.map(record => (
              <div key={record.id} style={s.leaveRow}>
                <div style={s.leaveAvatar}>{record.doctorName.slice(0, 1)}</div>
                <div style={s.leaveInfo}>
                  <div style={s.leaveName}>
                    {record.doctorName}
                    <span style={{ ...s.badge, background: record.leaveType === '病假' ? '#fee2e2' : record.leaveType === '年假' ? '#dcfce7' : '#fef3c7', color: record.leaveType === '病假' ? '#dc2626' : record.leaveType === '年假' ? '#166534' : '#92400e', marginLeft: 8, fontSize: 11 }}>
                      {record.leaveType}
                    </span>
                    <span style={{ ...getLeaveBadgeStyle(record.status), marginLeft: 8 }}>{record.status}</span>
                  </div>
                  <div style={s.leaveMeta}>
                    {record.startDate} ~ {record.endDate}
                    {record.reason && ` · ${record.reason}`}
                    {record.approver && ` · 审批人: ${record.approver}`}
                  </div>
                </div>
                <div style={s.leaveActions}>
                  {record.status === '已申请' && (
                    <>
                      <button style={s.btnSuccess} onClick={() => handleLeaveAction(record.id, '批准')}>
                        <CheckCircle size={12} /> 批准
                      </button>
                      <button style={s.btnDanger} onClick={() => handleLeaveAction(record.id, '拒绝')}>
                        <X size={12} /> 拒绝
                      </button>
                    </>
                  )}
                  {record.status !== '已申请' && (
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>{record.applyTime}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== 替班记录 ===== */}
      {activeTab === 'swap' && (
        <div style={s.section}>
          <div style={{ ...s.sectionTitle, justifyContent: 'space-between' }}>
            <div><Users size={16} /> 替班记录</div>
            <button style={s.btnPrimary} onClick={() => setShowSwapModal(true)}>
              <Plus size={14} /> 新增替班
            </button>
          </div>
          <div style={{ padding: 16 }}>
            {swapRecords.length === 0 ? (
              <div style={s.emptyState}>暂无替班记录</div>
            ) : swapRecords.map(record => (
              <div key={record.id} style={s.leaveRow}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={s.leaveAvatar}>{record.originalDoctorName.slice(0, 1)}</div>
                  <ChevronRight size={14} color="#94a3b8" />
                  <div style={s.leaveAvatar}>{record.targetDoctorName.slice(0, 1)}</div>
                </div>
                <div style={s.leaveInfo}>
                  <div style={s.leaveName}>
                    {record.originalDoctorName} → {record.targetDoctorName}
                    <span style={{ ...getSwapBadgeStyle(record.status), marginLeft: 8 }}>{record.status}</span>
                  </div>
                  <div style={s.leaveMeta}>
                    {weekdays[record.weekday - 1]} {record.shiftType}
                    {record.reason && ` · ${record.reason}`}
                  </div>
                </div>
                <div style={s.leaveActions}>
                  {record.status === '已申请' && (
                    <>
                      <button style={s.btnSuccess} onClick={() => handleSwapAction(record.id, '同意')}>
                        <CheckCircle size={12} /> 同意
                      </button>
                      <button style={s.btnDanger} onClick={() => handleSwapAction(record.id, '拒绝')}>
                        <X size={12} /> 拒绝
                      </button>
                    </>
                  )}
                  {record.status !== '已申请' && (
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>{record.applyTime}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== 工作量统计 ===== */}
      {activeTab === 'workload' && (
        <div style={s.section}>
          <div style={s.sectionTitle}>
            <BarChart3 size={16} /> 医生工作量统计
          </div>
          <div style={{ padding: 16 }}>
            <div style={s.infoAlert}>
              <Bell size={16} color="#d97706" />
              <span style={{ fontSize: 13, color: '#92400e' }}>
                以下统计基于当前所有排班记录，包括已启用和已停用的排班。利用率 = 已预约人次 / (排班数 × 每班最大预约数)。
              </span>
            </div>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>医生</th>
                  <th style={s.th}>上午</th>
                  <th style={s.th}>下午</th>
                  <th style={s.th}>全天</th>
                  <th style={s.th}>夜班</th>
                  <th style={s.th}>值班</th>
                  <th style={s.th}>总排班</th>
                  <th style={s.th}>总预约</th>
                  <th style={s.th}>利用率</th>
                </tr>
              </thead>
              <tbody>
                {workloadStats.map(stat => (
                  <tr key={stat.doctorId}>
                    <td style={{ ...s.td, fontWeight: 600 }}>{stat.doctorName}</td>
                    <td style={s.td}><span style={getShiftBadgeStyle('上午')}>{stat.morningCount}</span></td>
                    <td style={s.td}><span style={getShiftBadgeStyle('下午')}>{stat.afternoonCount}</span></td>
                    <td style={s.td}><span style={getShiftBadgeStyle('全天')}>{stat.fullDayCount}</span></td>
                    <td style={s.td}><span style={getShiftBadgeStyle('夜班')}>{stat.nightCount}</span></td>
                    <td style={s.td}><span style={getShiftBadgeStyle('值班')}>{stat.dutyCount}</span></td>
                    <td style={s.td}><strong>{stat.totalShifts}</strong></td>
                    <td style={s.td}>{stat.totalAppointments}</td>
                    <td style={s.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={s.workloadBar}>
                          <div style={{ ...s.workloadBarFill, width: `${stat.utilizationRate}%`, background: stat.utilizationRate > 80 ? '#dc2626' : stat.utilizationRate > 50 ? '#d97706' : '#16a34a' }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#1a3a5c', minWidth: 40 }}>{stat.utilizationRate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== 新增/编辑排班弹窗 ===== */}
      {showModal && (
        <div style={s.overlay} onClick={() => setShowModal(false)}>
          <div style={s.modalLarge} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h3 style={s.modalTitle}>{editingId ? '编辑排班' : '新增排班'}</h3>
              <button style={s.closeBtn} onClick={() => setShowModal(false)}>
                <X size={16} />
              </button>
            </div>

            <div style={s.modalBody}>
              {conflicts && (conflicts.doctor || conflicts.room) && (
                <div style={s.conflictAlert}>
                  <AlertTriangle size={18} color="#dc2626" style={{ flexShrink: 0, marginTop: 1 }} />
                  <div style={s.conflictText}>
                    <strong>检测到冲突：</strong>
                    {conflicts.doctor && (
                      <div>• 该医生在{weekdays[conflicts.doctor.weekday - 1]}
                        {conflicts.doctor.shiftType}已有排班 ({conflicts.doctor.startTime}-{conflicts.doctor.endTime})
                      </div>
                    )}
                    {conflicts.room && (
                      <div>• {conflicts.room.examRoomName}在{weekdays[conflicts.room.weekday - 1]}
                        {conflicts.room.shiftType}已被 {conflicts.room.doctorName} 占用
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div style={s.formGrid}>
                <div style={s.formGroup}>
                  <label style={s.label}>医生</label>
                  <select
                    style={s.select}
                    value={form.doctorId}
                    onChange={e => setForm(prev => ({ ...prev, doctorId: e.target.value }))}
                  >
                    {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>

                <div style={s.formGroup}>
                  <label style={s.label}>诊室</label>
                  <select
                    style={s.select}
                    value={form.examRoomId}
                    onChange={e => setForm(prev => ({ ...prev, examRoomId: e.target.value }))}
                  >
                    {initialExamRooms.filter(r => r.isActive).map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <div style={s.formGroup}>
                  <label style={s.label}>星期</label>
                  <select
                    style={s.select}
                    value={form.weekday}
                    onChange={e => setForm(prev => ({ ...prev, weekday: Number(e.target.value) }))}
                  >
                    {weekdays.map((d, i) => <option key={i} value={i + 1}>{d}</option>)}
                  </select>
                </div>

                <div style={s.formGroup}>
                  <label style={s.label}>班次类型</label>
                  <select
                    style={s.select}
                    value={form.shiftType}
                    onChange={e => handleShiftTypeChange(e.target.value as any)}
                  >
                    <option value="上午">上午</option>
                    <option value="下午">下午</option>
                    <option value="全天">全天</option>
                    <option value="夜班">夜班</option>
                    <option value="值班">值班</option>
                  </select>
                </div>

                <div style={s.formGroup}>
                  <label style={s.label}>开始时间</label>
                  <input
                    type="time"
                    style={s.input}
                    value={form.startTime}
                    onChange={e => setForm(prev => ({ ...prev, startTime: e.target.value }))}
                  />
                </div>

                <div style={s.formGroup}>
                  <label style={s.label}>结束时间</label>
                  <input
                    type="time"
                    style={s.input}
                    value={form.endTime}
                    onChange={e => setForm(prev => ({ ...prev, endTime: e.target.value }))}
                  />
                </div>

                <div style={{ ...s.formGroup, ...s.fullWidth }}>
                  <label style={s.label}>最大预约数</label>
                  <input
                    type="number"
                    style={{ ...s.input, width: 120 }}
                    value={form.maxAppointments}
                    min={1}
                    max={50}
                    onChange={e => setForm(prev => ({ ...prev, maxAppointments: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }}>
                <button
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa',
                    borderRadius: 8, padding: '10px 20px', fontSize: 13,
                    cursor: 'pointer', fontWeight: 500, minHeight: 44,
                  }}
                  onClick={detectConflicts}
                >
                  <AlertTriangle size={15} />
                  检测时间冲突
                </button>
              </div>
            </div>

            <div style={s.modalFooter}>
              <button style={s.btnCancel} onClick={() => setShowModal(false)}>取消</button>
              <button
                style={{
                  ...s.btnSave,
                  background: (conflicts?.doctor || conflicts?.room) ? '#9ca3af' : '#1a3a5c',
                  cursor: (conflicts?.doctor || conflicts?.room) ? 'not-allowed' : 'pointer',
                }}
                onClick={handleSave}
                disabled={!!(conflicts?.doctor || conflicts?.room)}
              >
                <CheckCircle size={14} style={{ marginRight: 4 }} />
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== 新增请假弹窗 ===== */}
      {showLeaveModal && (
        <div style={s.overlay} onClick={() => setShowLeaveModal(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h3 style={s.modalTitle}>新增请假记录</h3>
              <button style={s.closeBtn} onClick={() => setShowLeaveModal(false)}>
                <X size={16} />
              </button>
            </div>
            <div style={s.modalBody}>
              <div style={s.formGrid}>
                <div style={{ ...s.formGroup, ...s.fullWidth }}>
                  <label style={s.label}>医生</label>
                  <select style={s.select} value={leaveForm.doctorId} onChange={e => setLeaveForm(prev => ({ ...prev, doctorId: e.target.value }))}>
                    {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>请假类型</label>
                  <select style={s.select} value={leaveForm.leaveType} onChange={e => setLeaveForm(prev => ({ ...prev, leaveType: e.target.value as LeaveRecord['leaveType'] }))}>
                    <option>病假</option>
                    <option>事假</option>
                    <option>年假</option>
                    <option>婚假</option>
                    <option>产假</option>
                    <option>其他</option>
                  </select>
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>申请日期</label>
                  <input type="date" style={s.input} value={leaveForm.startDate} onChange={e => setLeaveForm(prev => ({ ...prev, startDate: e.target.value }))} />
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>结束日期</label>
                  <input type="date" style={s.input} value={leaveForm.endDate} onChange={e => setLeaveForm(prev => ({ ...prev, endDate: e.target.value }))} />
                </div>
                <div style={{ ...s.formGroup, ...s.fullWidth }}>
                  <label style={s.label}>请假原因</label>
                  <input type="text" style={s.input} placeholder="请输入请假原因" value={leaveForm.reason} onChange={e => setLeaveForm(prev => ({ ...prev, reason: e.target.value }))} />
                </div>
              </div>
            </div>
            <div style={s.modalFooter}>
              <button style={s.btnCancel} onClick={() => setShowLeaveModal(false)}>取消</button>
              <button style={s.btnSave} onClick={handleAddLeave} disabled={!leaveForm.doctorId || !leaveForm.startDate || !leaveForm.endDate}>
                <CheckCircle size={14} style={{ marginRight: 4 }} /> 提交申请
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== 新增替班弹窗 ===== */}
      {showSwapModal && (
        <div style={s.overlay} onClick={() => setShowSwapModal(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h3 style={s.modalTitle}>新增替班申请</h3>
              <button style={s.closeBtn} onClick={() => setShowSwapModal(false)}>
                <X size={16} />
              </button>
            </div>
            <div style={s.modalBody}>
              <div style={s.formGrid}>
                <div style={s.formGroup}>
                  <label style={s.label}>原排班医生</label>
                  <select style={s.select} value={swapForm.originalDoctorId} onChange={e => setSwapForm(prev => ({ ...prev, originalDoctorId: e.target.value }))}>
                    {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>替班医生</label>
                  <select style={s.select} value={swapForm.targetDoctorId} onChange={e => setSwapForm(prev => ({ ...prev, targetDoctorId: e.target.value }))}>
                    {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>替班日期</label>
                  <input type="date" style={s.input} value={swapForm.swapDate} onChange={e => setSwapForm(prev => ({ ...prev, swapDate: e.target.value }))} />
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>星期</label>
                  <select style={s.select} value={swapForm.weekday} onChange={e => setSwapForm(prev => ({ ...prev, weekday: Number(e.target.value) }))}>
                    {weekdays.map((d, i) => <option key={i} value={i + 1}>{d}</option>)}
                  </select>
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>班次</label>
                  <select style={s.select} value={swapForm.shiftType} onChange={e => setSwapForm(prev => ({ ...prev, shiftType: e.target.value as any }))}>
                    <option>上午</option>
                    <option>下午</option>
                    <option>全天</option>
                    <option>夜班</option>
                  </select>
                </div>
                <div style={{ ...s.formGroup, ...s.fullWidth }}>
                  <label style={s.label}>替班原因</label>
                  <input type="text" style={s.input} placeholder="请输入替班原因" value={swapForm.reason} onChange={e => setSwapForm(prev => ({ ...prev, reason: e.target.value }))} />
                </div>
              </div>
            </div>
            <div style={s.modalFooter}>
              <button style={s.btnCancel} onClick={() => setShowSwapModal(false)}>取消</button>
              <button style={s.btnSave} onClick={handleAddSwap} disabled={!swapForm.originalDoctorId || !swapForm.targetDoctorId || !swapForm.swapDate}>
                <CheckCircle size={14} style={{ marginRight: 4 }} /> 提交申请
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
