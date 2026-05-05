// @ts-nocheck
// ============================================================
// G004 超声管理系统 - 患者管理页面（增强版）
// 全流程患者健康档案管理
// ============================================================
import { useState, useMemo } from 'react'
import {
  Search, Plus, Edit2, Trash2, X, ChevronLeft, ChevronRight,
  User, Phone, MapPin, Calendar, AlertTriangle, FileText, RefreshCw,
  Eye, Clock, Stethoscope, Shield, Activity, Heart, ClipboardCheck,
  AlertCircle, CheckCircle, XCircle, Timer, TrendingUp, Filter,
  CalendarClock, UserCheck, Flag, Info
} from 'lucide-react'
import type { Patient, Gender, Appointment, EndoscopyExam } from '../types'
import { initialPatients, initialAppointments, initialUltrasoundExams } from '../data/initialData'

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
    padding: '7px 14px', fontSize: 13, cursor: 'pointer',
  },
  btnSecondary: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 6,
    padding: '7px 14px', fontSize: 13, cursor: 'pointer',
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
    display: 'flex', alignItems: 'center', gap: 4,
    background: '#dcfce7', color: '#16a34a', border: 'none', borderRadius: 6,
    padding: '5px 8px', fontSize: 12, cursor: 'pointer',
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
    display: 'inline-block', padding: '2px 8px', borderRadius: 12, fontSize: 11,
  },
  badgeMale: { background: '#dbeafe', color: '#1d4ed8' },
  badgeFemale: { background: '#fce7f3', color: '#be185d' },
  badgeOther: { background: '#f1f5f9', color: '#475569' },
  badgeDanger: { background: '#fee2e2', color: '#dc2626' },
  badgeWarning: { background: '#fef3c7', color: '#92400e' },
  badgeSuccess: { background: '#dcfce7', color: '#16a34a' },
  badgeInfo: { background: '#e0f2fe', color: '#0369a1' },
  badgeOrange: { background: '#ffedd5', color: '#c2410c' },
  actions: { display: 'flex', gap: 6 },
  pagination: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 16, padding: '12px 16px', background: '#fff',
    borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  pageInfo: { fontSize: 13, color: '#64748b' },
  pageBtns: { display: 'flex', gap: 4 },
  pageBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 32, height: 32, borderRadius: 6, border: '1px solid #e2e8f0',
    background: '#fff', cursor: 'pointer', fontSize: 13, color: '#475569',
  },
  pageBtnActive: {
    background: '#1a3a5c', color: '#fff', border: '1px solid #1a3a5c',
  },
  pageBtnDisabled: { opacity: 0.5, cursor: 'not-allowed' },
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: '#fff', borderRadius: 12, width: 900, maxHeight: '90vh',
    overflow: 'hidden', display: 'flex', flexDirection: 'column',
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
  },
  modalLg: {
    background: '#fff', borderRadius: 12, width: 1100, maxHeight: '90vh',
    overflow: 'hidden', display: 'flex', flexDirection: 'column',
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
  },
  modalHeader: {
    padding: '16px 20px', borderBottom: '1px solid #e2e8f0',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  modalTitle: { fontSize: 15, fontWeight: 700, color: '#1a3a5c' },
  modalClose: {
    background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8',
    display: 'flex', alignItems: 'center', padding: 4,
  },
  modalBody: {
    padding: 20, overflowY: 'auto', flex: 1,
  },
  modalFooter: {
    padding: '12px 20px', borderTop: '1px solid #e2e8f0',
    display: 'flex', justifyContent: 'flex-end', gap: 10,
  },
  formGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14,
  },
  formGroup: { display: 'flex', flexDirection: 'column', gap: 5 },
  formGroupFull: { gridColumn: '1 / -1' },
  label: { fontSize: 12, fontWeight: 600, color: '#475569' },
  required: { color: '#dc2626', marginLeft: 2 },
  input: {
    border: '1px solid #e2e8f0', borderRadius: 6, padding: '8px 10px',
    fontSize: 13, color: '#334155', outline: 'none',
  },
  textarea: {
    border: '1px solid #e2e8f0', borderRadius: 6, padding: '8px 10px',
    fontSize: 13, color: '#334155', outline: 'none', resize: 'vertical',
    minHeight: 72, fontFamily: 'inherit',
  },
  btnCancel: {
    padding: '8px 16px', borderRadius: 6, border: '1px solid #e2e8f0',
    background: '#fff', fontSize: 13, color: '#475569', cursor: 'pointer',
  },
  btnSubmit: {
    padding: '8px 16px', borderRadius: 6, border: 'none',
    background: '#1a3a5c', fontSize: 13, color: '#fff', cursor: 'pointer',
  },
  btnDeleteConfirm: {
    padding: '8px 16px', borderRadius: 6, border: 'none',
    background: '#dc2626', fontSize: 13, color: '#fff', cursor: 'pointer',
  },
  emptyState: {
    textAlign: 'center', padding: '48px 20px', color: '#94a3b8',
    fontSize: 14,
  },
  infoTip: {
    fontSize: 11, color: '#94a3b8', marginTop: 4,
  },
  deleteModalText: {
    fontSize: 14, color: '#475569', lineHeight: 1.6, marginBottom: 8,
  },
  // 档案卡样式
  profileCard: {
    background: '#fff', borderRadius: 10, padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: 16,
  },
  profileHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: 16,
  },
  profileName: { fontSize: 18, fontWeight: 700, color: '#1a3a5c' },
  profileId: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  profileSection: {
    borderTop: '1px solid #f1f5f9', paddingTop: 14, marginTop: 14,
  },
  profileSectionTitle: {
    fontSize: 13, fontWeight: 600, color: '#1a3a5c', marginBottom: 10,
    display: 'flex', alignItems: 'center', gap: 6,
  },
  infoGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12,
  },
  infoItem: { display: 'flex', flexDirection: 'column', gap: 2 },
  infoLabel: { fontSize: 11, color: '#94a3b8' },
  infoValue: { fontSize: 13, color: '#334155', fontWeight: 500 },
  // 警示框
  alertBox: {
    padding: '10px 14px', borderRadius: 8, marginBottom: 12,
    display: 'flex', alignItems: 'flex-start', gap: 10,
  },
  alertDanger: {
    background: '#fef2f2', border: '1px solid #fecaca',
    color: '#dc2626',
  },
  alertWarning: {
    background: '#fffbeb', border: '1px solid #fde68a',
    color: '#92400e',
  },
  alertInfo: {
    background: '#f0f9ff', border: '1px solid #bae6fd',
    color: '#0369a1',
  },
  // 标签页
  tabs: {
    display: 'flex', gap: 4, borderBottom: '2px solid #e2e8f0',
    marginBottom: 16,
  },
  tab: {
    padding: '8px 16px', fontSize: 13, cursor: 'pointer',
    color: '#64748b', borderBottom: '2px solid transparent',
    marginBottom: -2, fontWeight: 500,
  },
  tabActive: {
    padding: '8px 16px', fontSize: 13, cursor: 'pointer',
    color: '#1a3a5c', borderBottom: '2px solid #1a3a5c',
    marginBottom: -2, fontWeight: 600,
  },
  // 就诊历史
  historyItem: {
    padding: '12px 14px', borderRadius: 8, border: '1px solid #e2e8f0',
    marginBottom: 10, background: '#fafafa',
  },
  historyItemHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 6,
  },
  historyItemTitle: { fontSize: 13, fontWeight: 600, color: '#1a3a5c' },
  historyItemMeta: { fontSize: 11, color: '#94a3b8', display: 'flex', gap: 12 },
  // 知情同意
  consentItem: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 14px', borderRadius: 8, border: '1px solid #e2e8f0',
    marginBottom: 8,
  },
  consentItemInfo: { display: 'flex', flexDirection: 'column', gap: 3 },
  consentItemTitle: { fontSize: 13, fontWeight: 600, color: '#334155' },
  consentItemMeta: { fontSize: 11, color: '#94a3b8' },
  // ASA分级
  asaGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8,
  },
  asaItem: {
    padding: '10px 8px', borderRadius: 8, border: '2px solid #e2e8f0',
    textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s',
  },
  asaItemActive: {
    padding: '10px 8px', borderRadius: 8, border: '2px solid #1a3a5c',
    textAlign: 'center', cursor: 'pointer', background: '#f0f7ff',
  },
  asaLevel: { fontSize: 16, fontWeight: 700, color: '#1a3a5c' },
  asaDesc: { fontSize: 10, color: '#64748b', marginTop: 2 },
  // 预约冲突提示
  conflictWarning: {
    background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 6,
    padding: '10px 14px', marginTop: 10, display: 'flex',
    alignItems: 'center', gap: 8,
  },
  // 统计卡片
  statCard: {
    background: '#f8fafc', borderRadius: 8, padding: '12px 16px',
    display: 'flex', alignItems: 'center', gap: 12,
  },
  statIcon: {
    width: 40, height: 40, borderRadius: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  statValue: { fontSize: 22, fontWeight: 700, color: '#1a3a5c' },
  statLabel: { fontSize: 12, color: '#64748b' },
  // 检查室
  roomTag: {
    display: 'inline-block', padding: '2px 8px', borderRadius: 4,
    fontSize: 11, fontWeight: 500, background: '#f1f5f9', color: '#475569',
  },
  // 全选/反选
  filterBar: {
    display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center',
  },
  filterChip: {
    display: 'flex', alignItems: 'center', gap: 4,
    padding: '4px 10px', borderRadius: 20, fontSize: 12,
    cursor: 'pointer', border: '1px solid #e2e8f0',
  },
  filterChipActive: {
    display: 'flex', alignItems: 'center', gap: 4,
    padding: '4px 10px', borderRadius: 20, fontSize: 12,
    cursor: 'pointer', border: '1px solid #1a3a5c',
    background: '#1a3a5c', color: '#fff',
  },
}

// ---------- 类型扩展（本地） ----------
interface PatientEx extends Patient {
  height?: number
  weight?: number
  hepatitisB?: boolean
  hepatitisC?: boolean
  syphilis?: boolean
  hiv?: boolean
  asaLevel?: 'I' | 'II' | 'III' | 'IV' | 'V'
  anesthesiaRisk?: string
  fastingStatus?: '已禁食' | '未禁食' | '部分禁食'
  consents?: ConsentRecord[]
  appointments?: Appointment[]
  exams?: EndoscopyExam[]
}

interface ConsentRecord {
  id: string
  type: '检查知情同意' | '麻醉知情同意' | '特殊治疗同意'
  status: '未签署' | '已签署' | '已过期'
  signedTime?: string
  signedBy?: string
  expiryDate?: string
}

// ---------- 工具函数 ----------
const genderBadgeStyle = (gender: Gender): React.CSSProperties => {
  if (gender === '男') return { ...s.badge, ...s.badgeMale }
  if (gender === '女') return { ...s.badge, ...s.badgeFemale }
  return { ...s.badge, ...s.badgeOther }
}

const calcBMI = (h?: number, w?: number): string => {
  if (!h || !w || h <= 0) return '—'
  const bmi = w / ((h / 100) ** 2)
  if (bmi < 18.5) return `${bmi.toFixed(1)} (偏低)`
  if (bmi < 24) return `${bmi.toFixed(1)} (正常)`
  if (bmi < 28) return `${bmi.toFixed(1)} (超重)`
  return `${bmi.toFixed(1)} (肥胖)`
}

const hasInfectiousDisease = (p: PatientEx): boolean => {
  return !!(p.hepatitisB || p.hepatitisC || p.syphilis || p.hiv)
}

const hasPenicillinAllergy = (allergy: string): boolean => {
  if (!allergy || allergy === '无') return false
  return allergy.toLowerCase().includes('青霉素')
}

const getRiskColor = (asa?: string): string => {
  switch (asa) {
    case 'I': return '#16a34a'
    case 'II': return '#22c55e'
    case 'III': return '#f59e0b'
    case 'IV': return '#ef4444'
    case 'V': return '#dc2626'
    default: return '#94a3b8'
  }
}

const getConsentStatusStyle = (status: string): React.CSSProperties => {
  switch (status) {
    case '已签署': return { ...s.badge, ...s.badgeSuccess }
    case '已过期': return { ...s.badge, ...s.badgeDanger }
    default: return { ...s.badge, ...s.badgeWarning }
  }
}

// ---------- 空患者对象 ----------
const emptyPatient = (): PatientEx => ({
  id: '', name: '', gender: '男', age: 0, phone: '', idCard: '',
  address: '', emergencyContact: '', emergencyPhone: '',
  allergyHistory: '', medicalHistory: '',
  registrationDate: new Date().toISOString().split('T')[0],
  totalExamCount: 0,
  height: undefined, weight: undefined,
  hepatitisB: false, hepatitisC: false, syphilis: false, hiv: false,
  asaLevel: undefined, anesthesiaRisk: '', fastingStatus: undefined,
  consents: [], appointments: [], exams: [],
})

// ---------- 模拟就诊历史数据 ----------
const mockPatientHistory = (patientId: string): EndoscopyExam[] => {
  const today = new Date().toISOString().split('T')[0]
  return initialUltrasoundExams.filter(e => e.patientId === patientId)
}

const mockPatientAppointments = (patientId: string): Appointment[] => {
  return initialAppointments.filter(a => a.patientId === patientId)
}

// 知情同意默认记录
const defaultConsents: ConsentRecord[] = [
  { id: 'c1', type: '检查知情同意', status: '已签署', signedTime: '2026-04-27 09:00', signedBy: '王建国', expiryDate: '2026-05-27' },
  { id: 'c2', type: '麻醉知情同意', status: '已签署', signedTime: '2026-04-27 09:05', signedBy: '王建国', expiryDate: '2026-04-27' },
  { id: 'c3', type: '特殊治疗同意', status: '未签署' },
]

// ---------- 校验 ----------
const validatePatient = (p: PatientEx): string[] => {
  const errs: string[] = []
  if (!p.name.trim()) errs.push('姓名不能为空')
  if (!p.phone.trim()) errs.push('联系电话不能为空')
  if (!/^\d{11}$/.test(p.phone)) errs.push('手机号格式不正确')
  if (p.idCard && !/^\d{17}[\dXx]$/.test(p.idCard)) errs.push('身份证号格式不正确')
  if (p.age < 0 || p.age > 150) errs.push('年龄应在0-150之间')
  if (p.height && (p.height < 50 || p.height > 250)) errs.push('身高应在50-250cm之间')
  if (p.weight && (p.weight < 10 || p.weight > 300)) errs.push('体重应在10-300kg之间')
  return errs
}

// ---------- 主组件 ----------
export default function PatientPage() {
  const [patients, setPatients] = useState<PatientEx[]>(initialPatients as PatientEx[])
  const [search, setSearch] = useState('')
  const [genderFilter, setGenderFilter] = useState<Gender | ''>('')
  const [infectiousFilter, setInfectiousFilter] = useState(false)
  const [todayFilter, setTodayFilter] = useState(false)
  const [page, setPage] = useState(1)
  const pageSize = 10

  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'delete' | 'profile' | 'appointment' | null>(null)
  const [editingPatient, setEditingPatient] = useState<PatientEx>(emptyPatient())
  const [formErrors, setFormErrors] = useState<string[]>([])
  const [profileTab, setProfileTab] = useState<'info' | 'history' | 'consent' | 'risk'>('info')

  // 预约相关状态
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments)
  const [newAppointment, setNewAppointment] = useState<Partial<Appointment>>({
    examItemId: '', examItemName: '', doctorId: '', doctorName: '',
    examRoom: '', appointmentDate: '', appointmentTime: '', reason: '', notes: '',
  })
  const [appointmentConflict, setAppointmentConflict] = useState<string | null>(null)

  // 体检日期（用于今日检查筛选）
  const todayStr = new Date().toISOString().split('T')[0]

  // 高级过滤
  const filtered = useMemo(() => {
    const kw = search.trim().toLowerCase()
    return patients.filter(p => {
      const matchSearch = !kw || [
        p.name.toLowerCase(), p.phone, p.idCard, p.emergencyContact.toLowerCase(),
        p.id, `APT${p.id}`
      ].some(s => s && s.includes(kw))
      const matchGender = !genderFilter || p.gender === genderFilter
      const matchInfectious = !infectiousFilter || hasInfectiousDisease(p)
      const matchToday = !todayFilter || (p.lastExamDate === todayStr)
      return matchSearch && matchGender && matchInfectious && matchToday
    })
  }, [patients, search, genderFilter, infectiousFilter, todayFilter])

  // 分页
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  // 当前选中档案患者
  const [selectedPatient, setSelectedPatient] = useState<PatientEx | null>(null)

  const openAdd = () => {
    setEditingPatient(emptyPatient())
    setFormErrors([])
    setModalMode('add')
  }

  const openEdit = (p: PatientEx) => {
    setEditingPatient({ ...p, consents: p.consents || defaultConsents, appointments: p.appointments || [], exams: p.exams || [] })
    setFormErrors([])
    setModalMode('edit')
  }

  const openDelete = (p: PatientEx) => {
    setEditingPatient(p)
    setModalMode('delete')
  }

  const openProfile = (p: PatientEx) => {
    const history = mockPatientHistory(p.id)
    const appts = mockPatientAppointments(p.id)
    setSelectedPatient({
      ...p,
      exams: history,
      appointments: appts,
      consents: p.consents || defaultConsents,
    })
    setProfileTab('info')
    setModalMode('profile')
  }

  const openAppointment = (p: PatientEx) => {
    setEditingPatient(p)
    setNewAppointment({
      examItemId: '', examItemName: '', doctorId: '', doctorName: '',
      examRoom: '', appointmentDate: '', appointmentTime: '', reason: '', notes: '',
    })
    setAppointmentConflict(null)
    setModalMode('appointment')
  }

  const closeModal = () => setModalMode(null)

  const handleSubmit = () => {
    if (modalMode === 'delete') {
      setPatients(prev => prev.filter(p => p.id !== editingPatient.id))
      closeModal()
      return
    }
    const errs = validatePatient(editingPatient)
    if (errs.length > 0) { setFormErrors(errs); return }
    if (modalMode === 'add') {
      const id = 'P' + String(Date.now()).slice(-6)
      setPatients(prev => [{ ...editingPatient, id, consents: editingPatient.consents || defaultConsents }, ...prev])
    } else if (modalMode === 'edit') {
      setPatients(prev => prev.map(p => p.id === editingPatient.id ? editingPatient : p))
    }
    closeModal()
  }

  const handleField = (field: keyof PatientEx, value: string | number | boolean) => {
    setEditingPatient(prev => ({ ...prev, [field]: value }))
  }

  // 预约冲突检测
  const checkAppointmentConflict = (room: string, date: string, time: string, excludeId?: string) => {
    const conflict = appointments.find(a =>
      a.examRoom === room &&
      a.appointmentDate === date &&
      a.appointmentTime === time &&
      a.id !== excludeId &&
      ['已确认', '检查中', '待确认'].includes(a.status)
    )
    if (conflict) {
      setAppointmentConflict(`⚠️ 冲突：${conflict.patientName} 已预约 ${date} ${time} 在 ${room}`)
    } else {
      setAppointmentConflict(null)
    }
  }

  const handleAppointmentField = (field: keyof Partial<Appointment>, value: string) => {
    setNewAppointment(prev => ({ ...prev, [field]: value }))
    if (field === 'examRoom' || field === 'appointmentDate' || field === 'appointmentTime') {
      const room = field === 'examRoom' ? value : newAppointment.examRoom
      const date = field === 'appointmentDate' ? value : newAppointment.appointmentDate
      const time = field === 'appointmentTime' ? value : newAppointment.appointmentTime
      if (room && date && time) {
        checkAppointmentConflict(room, date, time)
      }
    }
  }

  const submitAppointment = () => {
    if (!newAppointment.examItemId || !newAppointment.examRoom || !newAppointment.appointmentDate || !newAppointment.appointmentTime) {
      setAppointmentConflict('请填写完整预约信息')
      return
    }
    if (appointmentConflict && appointmentConflict.startsWith('⚠️')) return

    const examItemNames: Record<string, string> = {
      'EI001': '电子腹部超声检查', 'EI002': '电子浅表超声检查', 'EI003': '腹部超声下活检',
      'EI004': '超声引导下息肉切除', 'EI005': '超声检查', 'EI006': 'USCP检查',
      'EI007': '电子肺部超声检查', 'EI008': '胶囊超声检查',
    }
    const doctorNames: Record<string, string> = {
      'U001': '张建国', 'U002': '李秀英', 'U003': '王海涛',
    }

    const apt: Appointment = {
      id: 'APT' + String(Date.now()).slice(-6),
      patientId: editingPatient.id,
      patientName: editingPatient.name,
      examItemId: newAppointment.examItemId || '',
      examItemName: examItemNames[newAppointment.examItemId || ''] || newAppointment.examItemName || '',
      doctorId: newAppointment.doctorId || '',
      doctorName: doctorNames[newAppointment.doctorId || ''] || newAppointment.doctorName || '',
      examRoom: newAppointment.examRoom || '',
      appointmentDate: newAppointment.appointmentDate || '',
      appointmentTime: newAppointment.appointmentTime || '',
      status: '待确认',
      reason: newAppointment.reason || '',
      notes: newAppointment.notes || '',
      registrationDate: todayStr,
      queueNumber: Math.floor(Math.random() * 20) + 1,
    }
    setAppointments(prev => [...prev, apt])
    closeModal()
  }

  // 获取知情同意图标
  const getConsentIcon = (status: string) => {
    switch (status) {
      case '已签署': return <CheckCircle size={16} color="#16a34a" />
      case '已过期': return <XCircle size={16} color="#dc2626" />
      default: return <Clock size={16} color="#f59e0b" />
    }
  }

  // ASA选项
  const asaOptions = [
    { level: 'I', desc: '正常健康', risk: '极低' },
    { level: 'II', desc: '轻微系统疾病', risk: '低' },
    { level: 'III', desc: '中度系统疾病', risk: '中等' },
    { level: 'IV', desc: '重度系统疾病', risk: '高' },
    { level: 'V', desc: '濒死状态', risk: '极高' },
  ]

  return (
    <div>
      {/* 页头 */}
      <div style={s.pageHeader}>
        <div>
          <div style={s.title}>患者管理</div>
          <div style={s.subtitle}>全流程患者健康档案管理</div>
        </div>
      </div>

      {/* 工具栏 */}
      <div style={s.toolbar}>
        <div style={s.searchBox}>
          <Search size={15} color="#94a3b8" />
          <input
            style={s.searchInput}
            placeholder="搜索姓名、手机、身份证、预约号..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <select
          style={s.select}
          value={genderFilter}
          onChange={e => { setGenderFilter(e.target.value as Gender | ''); setPage(1) }}
        >
          <option value="">全部性别</option>
          <option value="男">男</option>
          <option value="女">女</option>
          <option value="其他">其他</option>
        </select>
        <div style={s.filterBar}>
          <div
            style={infectiousFilter ? s.filterChipActive : s.filterChip}
            onClick={() => { setInfectiousFilter(!infectiousFilter); setPage(1) }}
          >
            <AlertTriangle size={13} color={infectiousFilter ? '#fff' : '#dc2626'} />
            <span style={{ color: infectiousFilter ? '#fff' : '#dc2626' }}>传染病</span>
          </div>
          <div
            style={todayFilter ? s.filterChipActive : s.filterChip}
            onClick={() => { setTodayFilter(!todayFilter); setPage(1) }}
          >
            <Calendar size={13} color={todayFilter ? '#fff' : '#1a3a5c'} />
            <span style={{ color: todayFilter ? '#fff' : '#1a3a5c' }}>今日检查</span>
          </div>
        </div>
        <button style={s.btnPrimary} onClick={openAdd}>
          <Plus size={14} /> 新增患者
        </button>
      </div>

      {/* 统计概览 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        <div style={s.statCard}>
          <div style={{ ...s.statIcon, background: '#dbeafe' }}>
            <User size={20} color="#1d4ed8" />
          </div>
          <div>
            <div style={s.statValue}>{patients.length}</div>
            <div style={s.statLabel}>患者总数</div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statIcon, background: '#dcfce7' }}>
            <Stethoscope size={20} color="#16a34a" />
          </div>
          <div>
            <div style={s.statValue}>{patients.reduce((sum, p) => sum + p.totalExamCount, 0)}</div>
            <div style={s.statLabel}>累计检查</div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statIcon, background: '#fee2e2' }}>
            <AlertTriangle size={20} color="#dc2626" />
          </div>
          <div>
            <div style={s.statValue}>{patients.filter(p => hasInfectiousDisease(p)).length}</div>
            <div style={s.statLabel}>传染病患者</div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statIcon, background: '#fef3c7' }}>
            <Activity size={20} color="#92400e" />
          </div>
          <div>
            <div style={s.statValue}>{appointments.filter(a => a.appointmentDate === todayStr && a.status !== '已取消').length}</div>
            <div style={s.statLabel}>今日预约</div>
          </div>
        </div>
      </div>

      {/* 表格 */}
      {paged.length === 0 ? (
        <div style={{ ...s.table, padding: '40px 0' }}>
          <div style={s.emptyState}>
            <User size={48} color="#cbd5e1" style={{ marginBottom: 16, opacity: 0.5 }} />
            <div style={{ fontSize: 16, fontWeight: 600, color: '#94a3b8', marginBottom: 8 }}>
              {filtered.length === 0 && (search || genderFilter || infectiousFilter || todayFilter) ? '未找到匹配的患者' : '暂无患者信息'}
            </div>
            <div style={{ fontSize: 13, color: '#cbd5e1' }}>
              {filtered.length === 0 && (search || genderFilter || infectiousFilter || todayFilter) ? '请尝试调整筛选条件或关键词' : '点击右上角"新增患者"添加第一条记录'}
            </div>
          </div>
        </div>
      ) : (
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>姓名</th>
              <th style={s.th}>性别/年龄</th>
              <th style={s.th}>联系方式</th>
              <th style={s.th}>传染病</th>
              <th style={s.th}>过敏史</th>
              <th style={s.th}>身高/体重/BMI</th>
              <th style={s.th}>最近检查</th>
              <th style={s.th}>累计次数</th>
              <th style={s.th}>操作</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(p => (
              <tr key={p.id} style={{ background: '#fff' }}>
                <td style={s.td}>
                  <div style={{ fontWeight: 600, color: '#1a3a5c' }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>{p.id}</div>
                </td>
                <td style={s.td}>
                  <span style={genderBadgeStyle(p.gender)}>{p.gender}</span>
                  <span style={{ marginLeft: 6, color: '#64748b' }}>{p.age}岁</span>
                </td>
                <td style={s.td}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Phone size={12} color="#94a3b8" />
                    {p.phone}
                  </div>
                </td>
                <td style={s.td}>
                  {hasInfectiousDisease(p) ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {p.hepatitisB && <span style={{ ...s.badge, ...s.badgeDanger, display: 'flex', alignItems: 'center', gap: 3 }}><AlertTriangle size={10} /> 乙肝</span>}
                      {p.hepatitisC && <span style={{ ...s.badge, ...s.badgeDanger, display: 'flex', alignItems: 'center', gap: 3 }}><AlertTriangle size={10} /> 丙肝</span>}
                      {p.syphilis && <span style={{ ...s.badge, ...s.badgeDanger, display: 'flex', alignItems: 'center', gap: 3 }}><AlertTriangle size={10} /> 梅毒</span>}
                      {p.hiv && <span style={{ ...s.badge, ...s.badgeDanger, display: 'flex', alignItems: 'center', gap: 3 }}><AlertTriangle size={10} /> HIV</span>}
                    </div>
                  ) : (
                    <span style={{ color: '#94a3b8' }}>无</span>
                  )}
                </td>
                <td style={s.td}>
                  {hasPenicillinAllergy(p.allergyHistory || '') ? (
                    <span style={{ ...s.badge, ...s.badgeDanger, display: 'flex', alignItems: 'center', gap: 3 }}>
                      <AlertTriangle size={11} /> {p.allergyHistory}
                    </span>
                  ) : p.allergyHistory && p.allergyHistory !== '无' ? (
                    <span style={{ ...s.badge, ...s.badgeWarning, display: 'flex', alignItems: 'center', gap: 3 }}>
                      <AlertCircle size={11} /> {p.allergyHistory}
                    </span>
                  ) : (
                    <span style={{ color: '#94a3b8' }}>无</span>
                  )}
                </td>
                <td style={s.td}>
                  {p.height && p.weight ? (
                    <div style={{ fontSize: 12 }}>
                      <div>{p.height}cm / {p.weight}kg</div>
                      <div style={{ color: '#16a34a', fontWeight: 500 }}>BMI {calcBMI(p.height, p.weight)}</div>
                    </div>
                  ) : (
                    <span style={{ color: '#94a3b8', fontSize: 12 }}>—</span>
                  )}
                </td>
                <td style={s.td}>
                  {p.lastExamDate ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <FileText size={12} color="#94a3b8" />
                      {p.lastExamDate}
                    </div>
                  ) : (
                    <span style={{ color: '#94a3b8' }}>—</span>
                  )}
                </td>
                <td style={s.td}>
                  <span style={{ fontWeight: 600, color: '#1a3a5c' }}>{p.totalExamCount}</span>
                  <span style={{ color: '#94a3b8', fontSize: 11 }}> 次</span>
                </td>
                <td style={s.td}>
                  <div style={s.actions}>
                    <button style={s.btnIcon} onClick={() => openProfile(p)} title="档案">
                      <Eye size={13} /> 档案
                    </button>
                    <button style={s.btnSuccess} onClick={() => openAppointment(p)} title="预约">
                      <CalendarClock size={13} /> 预约
                    </button>
                    <button style={s.btnIcon} onClick={() => openEdit(p)} title="编辑">
                      <Edit2 size={13} />
                    </button>
                    <button style={s.btnDanger} onClick={() => openDelete(p)} title="删除">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* 分页 */}
      <div style={s.pagination}>
        <div style={s.pageInfo}>
          共 <strong>{filtered.length}</strong> 条记录，第 <strong>{page}</strong> / <strong>{totalPages}</strong> 页
        </div>
        <div style={s.pageBtns}>
          <button
            style={{ ...s.pageBtn, ...(page === 1 ? s.pageBtnDisabled : {}) }}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft size={15} />
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let num = i + 1
            if (totalPages > 5) {
              if (page > 3) num = page - 2 + i
              if (page > totalPages - 2) num = totalPages - 4 + i
            }
            return (
              <button
                key={num}
                style={{ ...s.pageBtn, ...(page === num ? s.pageBtnActive : {}) }}
                onClick={() => setPage(num)}
              >
                {num}
              </button>
            )
          })}
          <button
            style={{ ...s.pageBtn, ...(page === totalPages ? s.pageBtnDisabled : {}) }}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {/* ========== 弹窗 ========== */}
      {modalMode && (
        <div style={s.overlay} onClick={e => e.target === e.currentTarget && closeModal()}>
          {/* ---------- 患者档案详情 ---------- */}
          {modalMode === 'profile' && selectedPatient && (
            <div style={s.modalLg}>
              <div style={s.modalHeader}>
                <div style={s.modalTitle}>患者档案 - {selectedPatient.name}</div>
                <button style={s.modalClose} onClick={closeModal}><X size={18} /></button>
              </div>

              {/* 警示标签 */}
              {(hasInfectiousDisease(selectedPatient) || hasPenicillinAllergy(selectedPatient.allergyHistory || '')) && (
                <div style={{ padding: '12px 20px', borderBottom: '1px solid #e2e8f0' }}>
                  {hasInfectiousDisease(selectedPatient) && (
                    <div style={{ ...s.alertBox, ...s.alertDanger, marginBottom: 8 }}>
                      <AlertTriangle size={18} />
                      <div>
                        <div style={{ fontWeight: 600, marginBottom: 2 }}>传染病警示</div>
                        <div style={{ fontSize: 12 }}>
                          {selectedPatient.hepatitisB && '• 乙肝 '}
                          {selectedPatient.hepatitisC && '• 丙肝 '}
                          {selectedPatient.syphilis && '• 梅毒 '}
                          {selectedPatient.hiv && '• HIV '}
                          — 请做好职业防护
                        </div>
                      </div>
                    </div>
                  )}
                  {hasPenicillinAllergy(selectedPatient.allergyHistory || '') && (
                    <div style={{ ...s.alertBox, ...s.alertDanger }}>
                      <AlertTriangle size={18} />
                      <div>
                        <div style={{ fontWeight: 600, marginBottom: 2 }}>过敏警示：青霉素</div>
                        <div style={{ fontSize: 12 }}>{selectedPatient.allergyHistory} — 使用抗生素前请务必确认皮试结果</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 标签页 */}
              <div style={s.tabs}>
                {(['info', 'history', 'consent', 'risk'] as const).map(tab => (
                  <div
                    key={tab}
                    style={profileTab === tab ? s.tabActive : s.tab}
                    onClick={() => setProfileTab(tab)}
                  >
                    {{ info: '基本信息', history: '就诊历史', consent: '知情同意', risk: '风险评估' }[tab]}
                  </div>
                ))}
              </div>

              <div style={s.modalBody}>
                {/* ---------- 基本信息 ---------- */}
                {profileTab === 'info' && (
                  <div>
                    <div style={s.profileCard}>
                      <div style={s.profileHeader}>
                        <div>
                          <div style={s.profileName}>{selectedPatient.name}
                            <span style={{ ...s.badge, ...genderBadgeStyle(selectedPatient.gender), marginLeft: 8 }}>
                              {selectedPatient.gender}
                            </span>
                          </div>
                          <div style={s.profileId}>{selectedPatient.id} | 登记日期: {selectedPatient.registrationDate}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button style={s.btnSecondary} onClick={() => { setEditingPatient(selectedPatient); setFormErrors([]); setModalMode('edit') }}>
                            <Edit2 size={13} /> 编辑
                          </button>
                          <button style={s.btnPrimary} onClick={() => openAppointment(selectedPatient)}>
                            <CalendarClock size={13} /> 预约检查
                          </button>
                        </div>
                      </div>

                      <div style={s.infoGrid}>
                        <div style={s.infoItem}>
                          <span style={s.infoLabel}>年龄</span>
                          <span style={s.infoValue}>{selectedPatient.age} 岁</span>
                        </div>
                        <div style={s.infoItem}>
                          <span style={s.infoLabel}>联系电话</span>
                          <span style={s.infoValue}>{selectedPatient.phone}</span>
                        </div>
                        <div style={s.infoItem}>
                          <span style={s.infoLabel}>身份证号</span>
                          <span style={{ ...s.infoValue, fontFamily: 'monospace', fontSize: 12 }}>{selectedPatient.idCard || '—'}</span>
                        </div>
                        <div style={s.infoItem}>
                          <span style={s.infoLabel}>身高</span>
                          <span style={s.infoValue}>{selectedPatient.height ? `${selectedPatient.height} cm` : '—'}</span>
                        </div>
                        <div style={s.infoItem}>
                          <span style={s.infoLabel}>体重</span>
                          <span style={s.infoValue}>{selectedPatient.weight ? `${selectedPatient.weight} kg` : '—'}</span>
                        </div>
                        <div style={s.infoItem}>
                          <span style={s.infoLabel}>BMI</span>
                          <span style={{ ...s.infoValue, color: '#16a34a', fontWeight: 600 }}>
                            {calcBMI(selectedPatient.height, selectedPatient.weight)}
                          </span>
                        </div>
                        <div style={s.infoItem}>
                          <span style={s.infoLabel}>紧急联系人</span>
                          <span style={s.infoValue}>{selectedPatient.emergencyContact || '—'}</span>
                        </div>
                        <div style={s.infoItem}>
                          <span style={s.infoLabel}>紧急联系电话</span>
                          <span style={s.infoValue}>{selectedPatient.emergencyPhone || '—'}</span>
                        </div>
                        <div style={s.infoItem}>
                          <span style={s.infoLabel}>地址</span>
                          <span style={s.infoValue}>{selectedPatient.address || '—'}</span>
                        </div>
                      </div>
                    </div>

                    <div style={s.profileCard}>
                      <div style={s.profileSectionTitle}>
                        <ClipboardCheck size={15} /> 既往病史与过敏史
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div>
                          <div style={s.infoLabel}>过敏史</div>
                          <div style={{ fontSize: 13, color: hasPenicillinAllergy(selectedPatient.allergyHistory || '') ? '#dc2626' : '#334155', fontWeight: hasPenicillinAllergy(selectedPatient.allergyHistory || '') ? 600 : 400 }}>
                            {selectedPatient.allergyHistory || '无'}
                          </div>
                        </div>
                        <div>
                          <div style={s.infoLabel}>既往病史</div>
                          <div style={{ fontSize: 13, color: '#334155' }}>{selectedPatient.medicalHistory || '无'}</div>
                        </div>
                      </div>
                    </div>

                    <div style={s.profileCard}>
                      <div style={s.profileSectionTitle}>
                        <Activity size={15} /> 传染病标记
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                        {[
                          { key: 'hepatitisB', label: '乙肝' },
                          { key: 'hepatitisC', label: '丙肝' },
                          { key: 'syphilis', label: '梅毒' },
                          { key: 'hiv', label: 'HIV' },
                        ].map(item => (
                          <div key={item.key} style={{
                            padding: '10px 12px', borderRadius: 8,
                            background: selectedPatient[item.key as keyof PatientEx] ? '#fee2e2' : '#f8fafc',
                            border: `1px solid ${selectedPatient[item.key as keyof PatientEx] ? '#fecaca' : '#e2e8f0'}`,
                            display: 'flex', alignItems: 'center', gap: 8,
                          }}>
                            {selectedPatient[item.key as keyof PatientEx] ? (
                              <AlertTriangle size={14} color="#dc2626" />
                            ) : (
                              <CheckCircle size={14} color="#16a34a" />
                            )}
                            <div>
                              <div style={{ fontSize: 12, fontWeight: 600, color: selectedPatient[item.key as keyof PatientEx] ? '#dc2626' : '#16a34a' }}>
                                {item.label}
                              </div>
                              <div style={{ fontSize: 10, color: '#94a3b8' }}>
                                {selectedPatient[item.key as keyof PatientEx] ? '阳性' : '阴性'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ---------- 就诊历史 ---------- */}
                {profileTab === 'history' && (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
                      <div style={{ ...s.statCard, background: '#f0f9ff' }}>
                        <div style={{ ...s.statIcon, background: '#dbeafe' }}>
                          <Stethoscope size={18} color="#1d4ed8" />
                        </div>
                        <div>
                          <div style={s.statValue}>{selectedPatient.totalExamCount}</div>
                          <div style={s.statLabel}>累计检查</div>
                        </div>
                      </div>
                      <div style={{ ...s.statCard, background: '#f0fdf4' }}>
                        <div style={{ ...s.statIcon, background: '#dcfce7' }}>
                          <Calendar size={18} color="#16a34a" />
                        </div>
                        <div>
                          <div style={s.statValue}>{selectedPatient.appointments?.length || 0}</div>
                          <div style={s.statLabel}>预约次数</div>
                        </div>
                      </div>
                      <div style={{ ...s.statCard, background: '#fefce8' }}>
                        <div style={{ ...s.statIcon, background: '#fef9c3' }}>
                          <TrendingUp size={18} color="#ca8a04" />
                        </div>
                        <div>
                          <div style={s.statValue}>{selectedPatient.lastExamDate || '—'}</div>
                          <div style={s.statLabel}>最近检查</div>
                        </div>
                      </div>
                    </div>

                    {/* 最近检查摘要 */}
                    {selectedPatient.exams && selectedPatient.exams.length > 0 && (
                      <div style={s.profileCard}>
                        <div style={s.profileSectionTitle}>
                          <FileText size={15} /> 最近检查摘要
                        </div>
                        {selectedPatient.exams.slice(0, 3).map(exam => (
                          <div key={exam.id} style={s.historyItem}>
                            <div style={s.historyItemHeader}>
                              <div style={s.historyItemTitle}>{exam.examItemName}</div>
                              <span style={{ ...s.badge, ...(exam.status === '已完成' ? s.badgeSuccess : exam.status === '检查异常' ? s.badgeDanger : s.badgeInfo) }}>
                                {exam.status}
                              </span>
                            </div>
                            <div style={s.historyItemMeta}>
                              <span><Calendar size={11} /> {exam.examDate}</span>
                              <span><User size={11} /> {exam.doctorName}</span>
                              <span><Stethoscope size={11} /> {exam.examRoom}</span>
                              <span>图片 {exam.imageCount}张</span>
                            </div>
                            {exam.findings && (
                              <div style={{ fontSize: 12, color: '#64748b', marginTop: 6, lineHeight: 1.5 }}>
                                {exam.findings.substring(0, 120)}...
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 预约历史 */}
                    {selectedPatient.appointments && selectedPatient.appointments.length > 0 && (
                      <div style={s.profileCard}>
                        <div style={s.profileSectionTitle}>
                          <CalendarClock size={15} /> 预约记录
                        </div>
                        {selectedPatient.appointments.map(apt => (
                          <div key={apt.id} style={s.historyItem}>
                            <div style={s.historyItemHeader}>
                              <div style={s.historyItemTitle}>{apt.examItemName}</div>
                              <span style={{ ...s.badge, ...(apt.status === '已完成' ? s.badgeSuccess : apt.status === '已取消' ? s.badgeDanger : s.badgeInfo) }}>
                                {apt.status}
                              </span>
                            </div>
                            <div style={s.historyItemMeta}>
                              <span><Calendar size={11} /> {apt.appointmentDate} {apt.appointmentTime}</span>
                              <span><Stethoscope size={11} /> {apt.examRoom}</span>
                              <span><User size={11} /> {apt.doctorName}</span>
                            </div>
                            {apt.reason && (
                              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>原因：{apt.reason}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {(!selectedPatient.exams || selectedPatient.exams.length === 0) && (!selectedPatient.appointments || selectedPatient.appointments.length === 0) && (
                      <div style={s.emptyState}>
                        <FileText size={36} color="#cbd5e1" style={{ marginBottom: 10 }} />
                        <div>暂无就诊记录</div>
                      </div>
                    )}
                  </div>
                )}

                {/* ---------- 知情同意 ---------- */}
                {profileTab === 'consent' && (
                  <div>
                    <div style={s.alertBox, {...s.alertInfo, marginBottom: 16}}>
                      <Info size={16} />
                      <div style={{ fontSize: 12 }}>
                        知情同意书应在检查/治疗前签署，有效期为签署后30天。请确保所有同意书均为最新版本。
                      </div>
                    </div>

                    {selectedPatient.consents?.map(consent => (
                      <div key={consent.id} style={s.consentItem}>
                        <div style={s.consentItemInfo}>
                          <div style={s.consentItemTitle}>{consent.type}</div>
                          <div style={s.consentItemMeta}>
                            {consent.status === '已签署' && consent.signedTime && (
                              <span>签署时间：{consent.signedTime}</span>
                            )}
                            {consent.status === '已签署' && consent.signedBy && (
                              <span>签署人：{consent.signedBy}</span>
                            )}
                            {consent.status === '已签署' && consent.expiryDate && (
                              <span>有效期至：{consent.expiryDate}</span>
                            )}
                            {consent.status === '未签署' && <span style={{ color: '#f59e0b' }}>请尽快签署</span>}
                            {consent.status === '已过期' && <span style={{ color: '#dc2626' }}>已过期，请重新签署</span>}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {getConsentIcon(consent.status)}
                          <span style={getConsentStatusStyle(consent.status)}>{consent.status}</span>
                        </div>
                      </div>
                    ))}

                    <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
                      <button style={s.btnSecondary}>
                        <FileText size={13} /> 查看/打印同意书
                      </button>
                      <button style={s.btnPrimary}>
                        <UserCheck size={13} /> 签署知情同意
                      </button>
                    </div>
                  </div>
                )}

                {/* ---------- 风险评估 ---------- */}
                {profileTab === 'risk' && (
                  <div>
                    {/* ASA分级 */}
                    <div style={s.profileCard}>
                      <div style={s.profileSectionTitle}>
                        <Shield size={15} /> ASA分级（美国麻醉医师协会）
                      </div>
                      <div style={s.asaGrid}>
                        {asaOptions.map(opt => (
                          <div
                            key={opt.level}
                            style={selectedPatient.asaLevel === opt.level ? {
                              ...s.asaItem, ...s.asaItemActive,
                              borderColor: getRiskColor(opt.level),
                            } : {
                              ...s.asaItem,
                              opacity: selectedPatient.asaLevel && selectedPatient.asaLevel !== opt.level ? 0.5 : 1,
                            }}
                          >
                            <div style={{ ...s.asaLevel, color: getRiskColor(opt.level) }}>{opt.level}</div>
                            <div style={s.asaDesc}>{opt.desc}</div>
                            <div style={{ fontSize: 10, color: getRiskColor(opt.level), marginTop: 4, fontWeight: 600 }}>
                              风险: {opt.risk}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: 12, color: '#64748b' }}>
                          当前评级：
                          <span style={{ fontWeight: 700, color: getRiskColor(selectedPatient.asaLevel), marginLeft: 6 }}>
                            {selectedPatient.asaLevel ? `ASA ${selectedPatient.asaLevel}` : '未评估'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 麻醉风险评估 */}
                    <div style={s.profileCard}>
                      <div style={s.profileSectionTitle}>
                        <Heart size={15} /> 麻醉风险评估
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <div>
                          <div style={s.label}>麻醉风险说明</div>
                          <textarea
                            style={s.textarea}
                            value={selectedPatient.anesthesiaRisk || ''}
                            onChange={e => {
                              setSelectedPatient(prev => ({ ...prev, anesthesiaRisk: e.target.value }))
                            }}
                            placeholder="记录麻醉风险评估详情..."
                          />
                        </div>
                        <div>
                          <div style={s.label}>禁食状态</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {(['已禁食', '未禁食', '部分禁食'] as const).map(status => (
                              <div
                                key={status}
                                style={{
                                  padding: '10px 14px', borderRadius: 8, cursor: 'pointer',
                                  border: `2px solid ${selectedPatient.fastingStatus === status ? '#1a3a5c' : '#e2e8f0'}`,
                                  background: selectedPatient.fastingStatus === status ? '#f0f7ff' : '#fff',
                                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                }}
                                onClick={() => setSelectedPatient(prev => ({ ...prev, fastingStatus: status }))}
                              >
                                <span style={{ fontSize: 13, fontWeight: selectedPatient.fastingStatus === status ? 600 : 400, color: '#334155' }}>{status}</span>
                                {selectedPatient.fastingStatus === status && <CheckCircle size={16} color="#1a3a5c" />}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 特殊风险标记 */}
                    <div style={s.profileCard}>
                      <div style={s.profileSectionTitle}>
                        <Flag size={15} /> 特殊风险因素
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {[
                          { key: 'hepatitisB' as const, label: '乙肝病毒携带' },
                          { key: 'hepatitisC' as const, label: '丙肝病毒携带' },
                          { key: 'syphilis' as const, label: '梅毒' },
                          { key: 'hiv' as const, label: 'HIV阳性' },
                        ].map(item => (
                          <div key={item.key} style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '8px 12px', borderRadius: 6,
                            background: selectedPatient[item.key] ? '#fef2f2' : '#f8fafc',
                            border: `1px solid ${selectedPatient[item.key] ? '#fecaca' : '#e2e8f0'}`,
                          }}>
                            {selectedPatient[item.key] ? (
                              <AlertTriangle size={14} color="#dc2626" />
                            ) : (
                              <CheckCircle size={14} color="#16a34a" />
                            )}
                            <span style={{ fontSize: 13, color: selectedPatient[item.key] ? '#dc2626' : '#64748b' }}>
                              {item.label}
                              <span style={{ fontWeight: 600, marginLeft: 6 }}>
                                {selectedPatient[item.key] ? '阳性' : '阴性'}
                              </span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button style={s.btnPrimary} onClick={() => {
                      const updated = patients.map(p => p.id === selectedPatient.id ? selectedPatient : p)
                      setPatients(updated)
                      setSelectedPatient(selectedPatient)
                    }}>
                      <CheckCircle size={13} /> 保存评估结果
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ---------- 新增/编辑患者 ---------- */}
          {(modalMode === 'add' || modalMode === 'edit') && (
            <div style={s.modal}>
              <div style={s.modalHeader}>
                <div style={s.modalTitle}>{modalMode === 'add' ? '新增患者' : '编辑患者'}</div>
                <button style={s.modalClose} onClick={closeModal}><X size={18} /></button>
              </div>
              <div style={s.modalBody}>
                {formErrors.length > 0 && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, padding: '10px 14px', marginBottom: 14 }}>
                    {formErrors.map((e, i) => (
                      <div key={i} style={{ fontSize: 12, color: '#dc2626' }}>• {e}</div>
                    ))}
                  </div>
                )}
                <div style={s.formGrid}>
                  {/* 姓名 */}
                  <div style={s.formGroup}>
                    <label style={s.label}>姓名<span style={s.required}>*</span></label>
                    <input style={s.input} value={editingPatient.name} onChange={e => handleField('name', e.target.value)} placeholder="请输入姓名" />
                  </div>
                  {/* 性别 */}
                  <div style={s.formGroup}>
                    <label style={s.label}>性别<span style={s.required}>*</span></label>
                    <select style={s.input} value={editingPatient.gender} onChange={e => handleField('gender', e.target.value)}>
                      <option value="男">男</option>
                      <option value="女">女</option>
                      <option value="其他">其他</option>
                    </select>
                  </div>
                  {/* 年龄 */}
                  <div style={s.formGroup}>
                    <label style={s.label}>年龄<span style={s.required}>*</span></label>
                    <input style={s.input} type="number" min={0} max={150} value={editingPatient.age || ''} onChange={e => handleField('age', Number(e.target.value))} placeholder="请输入年龄" />
                  </div>
                  {/* 联系电话 */}
                  <div style={s.formGroup}>
                    <label style={s.label}>联系电话<span style={s.required}>*</span></label>
                    <input style={s.input} value={editingPatient.phone} onChange={e => handleField('phone', e.target.value)} placeholder="11位手机号" />
                  </div>
                  {/* 身份证 */}
                  <div style={{ ...s.formGroup, gridColumn: '1 / -1' }}>
                    <label style={s.label}>身份证号</label>
                    <input style={s.input} value={editingPatient.idCard} onChange={e => handleField('idCard', e.target.value)} placeholder="18位身份证号" />
                  </div>
                  {/* 身高体重 */}
                  <div style={s.formGroup}>
                    <label style={s.label}>身高 (cm)</label>
                    <input style={s.input} type="number" min={50} max={250} value={editingPatient.height || ''} onChange={e => handleField('height', Number(e.target.value))} placeholder="cm" />
                  </div>
                  <div style={s.formGroup}>
                    <label style={s.label}>体重 (kg)</label>
                    <input style={s.input} type="number" min={10} max={300} value={editingPatient.weight || ''} onChange={e => handleField('weight', Number(e.target.value))} placeholder="kg" />
                  </div>
                  {/* BMI显示 */}
                  <div style={{ ...s.formGroup, gridColumn: '1 / -1' }}>
                    <label style={s.label}>BMI</label>
                    <div style={{ padding: '8px 10px', background: '#f0fdf4', borderRadius: 6, fontSize: 14, fontWeight: 600, color: '#16a34a' }}>
                      {calcBMI(editingPatient.height, editingPatient.weight)}
                    </div>
                  </div>
                  {/* 地址 */}
                  <div style={{ ...s.formGroup, gridColumn: '1 / -1' }}>
                    <label style={s.label}>地址</label>
                    <input style={s.input} value={editingPatient.address} onChange={e => handleField('address', e.target.value)} placeholder="请输入住址" />
                  </div>
                  {/* 紧急联系人 */}
                  <div style={s.formGroup}>
                    <label style={s.label}>紧急联系人</label>
                    <input style={s.input} value={editingPatient.emergencyContact} onChange={e => handleField('emergencyContact', e.target.value)} placeholder="联系人姓名" />
                  </div>
                  <div style={s.formGroup}>
                    <label style={s.label}>紧急联系电话</label>
                    <input style={s.input} value={editingPatient.emergencyPhone || ''} onChange={e => handleField('emergencyPhone', e.target.value)} placeholder="联系人电话" />
                  </div>
                  {/* 传染病标记 */}
                  <div style={{ ...s.formGroup, gridColumn: '1 / -1' }}>
                    <label style={s.label}>传染病标记</label>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      {[
                        { key: 'hepatitisB' as const, label: '乙肝' },
                        { key: 'hepatitisC' as const, label: '丙肝' },
                        { key: 'syphilis' as const, label: '梅毒' },
                        { key: 'hiv' as const, label: 'HIV' },
                      ].map(item => (
                        <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', padding: '6px 10px', borderRadius: 6, background: editingPatient[item.key] ? '#fef2f2' : '#f8fafc', border: `1px solid ${editingPatient[item.key] ? '#fecaca' : '#e2e8f0'}` }}>
                          <input type="checkbox" checked={!!editingPatient[item.key]} onChange={e => handleField(item.key, e.target.checked)} />
                          <AlertTriangle size={12} color={editingPatient[item.key] ? '#dc2626' : '#94a3b8'} />
                          {item.label}
                        </label>
                      ))}
                    </div>
                  </div>
                  {/* 过敏史 */}
                  <div style={{ ...s.formGroup, gridColumn: '1 / -1' }}>
                    <label style={s.label}>过敏史</label>
                    <input style={editingPatient.allergyHistory && hasPenicillinAllergy(editingPatient.allergyHistory) ? { ...s.input, borderColor: '#dc2626', background: '#fef2f2' } : s.input} value={editingPatient.allergyHistory} onChange={e => handleField('allergyHistory', e.target.value)} placeholder="请输入过敏史，无则填'无'" />
                    {hasPenicillinAllergy(editingPatient.allergyHistory || '') && (
                      <div style={{ fontSize: 11, color: '#dc2626', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                        <AlertTriangle size={11} /> 青霉素过敏警告
                      </div>
                    )}
                  </div>
                  {/* 病史 */}
                  <div style={{ ...s.formGroup, gridColumn: '1 / -1' }}>
                    <label style={s.label}>既往病史</label>
                    <textarea style={s.textarea} value={editingPatient.medicalHistory} onChange={e => handleField('medicalHistory', e.target.value)} placeholder="请输入既往病史" />
                  </div>
                  {/* ASA分级 */}
                  <div style={{ ...s.formGroup, gridColumn: '1 / -1' }}>
                    <label style={s.label}>ASA分级</label>
                    <select style={s.input} value={editingPatient.asaLevel || ''} onChange={e => handleField('asaLevel', e.target.value as any)}>
                      <option value="">未评估</option>
                      <option value="I">I级 - 正常健康</option>
                      <option value="II">II级 - 轻微系统疾病</option>
                      <option value="III">III级 - 中度系统疾病</option>
                      <option value="IV">IV级 - 重度系统疾病</option>
                      <option value="V">V级 - 濒死状态</option>
                    </select>
                  </div>
                  {/* 禁食状态 */}
                  <div style={{ ...s.formGroup, gridColumn: '1 / -1' }}>
                    <label style={s.label}>禁食状态</label>
                    <select style={s.input} value={editingPatient.fastingStatus || ''} onChange={e => handleField('fastingStatus', e.target.value as any)}>
                      <option value="">未确认</option>
                      <option value="已禁食">已禁食</option>
                      <option value="未禁食">未禁食</option>
                      <option value="部分禁食">部分禁食</option>
                    </select>
                  </div>
                  {/* 登记日期 */}
                  <div style={s.formGroup}>
                    <label style={s.label}>登记日期</label>
                    <input style={s.input} type="date" value={editingPatient.registrationDate} onChange={e => handleField('registrationDate', e.target.value)} />
                  </div>
                  {/* 累计检查次数 */}
                  <div style={s.formGroup}>
                    <label style={s.label}>累计检查次数</label>
                    <input style={s.input} type="number" min={0} value={editingPatient.totalExamCount} onChange={e => handleField('totalExamCount', Number(e.target.value))} />
                  </div>
                </div>
              </div>
              <div style={s.modalFooter}>
                <button style={s.btnCancel} onClick={closeModal}>取消</button>
                <button style={s.btnSubmit} onClick={handleSubmit}>{modalMode === 'add' ? '添加患者' : '保存修改'}</button>
              </div>
            </div>
          )}

          {/* ---------- 删除确认 ---------- */}
          {modalMode === 'delete' && (
            <>
              <div style={s.modal}>
                <div style={s.modalHeader}>
                  <div style={s.modalTitle}>确认删除</div>
                  <button style={s.modalClose} onClick={closeModal}><X size={18} /></button>
                </div>
                <div style={s.modalBody}>
                  <div style={s.deleteModalText}>
                    确定要删除患者 <strong>{editingPatient.name}</strong> 吗？
                  </div>
                  <div style={s.deleteModalText}>
                    此操作不可恢复，患者的所有检查记录将保留但无法关联。
                  </div>
                </div>
                <div style={s.modalFooter}>
                  <button style={s.btnCancel} onClick={closeModal}>取消</button>
                  <button style={s.btnDeleteConfirm} onClick={handleSubmit}>确认删除</button>
                </div>
              </div>
            </>
          )}

          {/* ---------- 检查预约 ---------- */}
          {modalMode === 'appointment' && (
            <div style={s.modal}>
              <div style={s.modalHeader}>
                <div style={s.modalTitle}>检查预约 - {editingPatient.name}</div>
                <button style={s.modalClose} onClick={closeModal}><X size={18} /></button>
              </div>
              <div style={s.modalBody}>
                {/* 患者基本信息 */}
                <div style={{ background: '#f8fafc', borderRadius: 8, padding: '12px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <User size={14} color="#64748b" />
                    <span style={{ fontSize: 13, color: '#334155' }}>{editingPatient.name}</span>
                    <span style={genderBadgeStyle(editingPatient.gender)}>{editingPatient.gender}</span>
                    <span style={{ fontSize: 13, color: '#64748b' }}>{editingPatient.age}岁</span>
                  </div>
                  {hasInfectiousDisease(editingPatient) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <AlertTriangle size={13} color="#dc2626" />
                      <span style={{ fontSize: 12, color: '#dc2626' }}>传染病患者</span>
                    </div>
                  )}
                  {hasPenicillinAllergy(editingPatient.allergyHistory || '') && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <AlertTriangle size={13} color="#dc2626" />
                      <span style={{ fontSize: 12, color: '#dc2626' }}>过敏：{editingPatient.allergyHistory}</span>
                    </div>
                  )}
                  {editingPatient.fastingStatus && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Timer size={13} color="#16a34a" />
                      <span style={{ fontSize: 12, color: '#16a34a' }}>{editingPatient.fastingStatus}</span>
                    </div>
                  )}
                </div>

                <div style={s.formGrid}>
                  {/* 检查项目 */}
                  <div style={{ ...s.formGroup, gridColumn: '1 / -1' }}>
                    <label style={s.label}>检查项目<span style={s.required}>*</span></label>
                    <select style={s.input} value={newAppointment.examItemId} onChange={e => handleAppointmentField('examItemId', e.target.value)}>
                      <option value="">请选择检查项目</option>
                      <option value="EI001">电子腹部超声检查</option>
                      <option value="EI002">电子浅表超声检查</option>
                      <option value="EI003">腹部超声下活检</option>
                      <option value="EI004">超声引导下息肉切除</option>
                      <option value="EI005">超声检查</option>
                      <option value="EI006">USCP检查</option>
                      <option value="EI007">电子肺部超声检查</option>
                      <option value="EI008">胶囊超声检查</option>
                    </select>
                  </div>
                  {/* 主诊医生 */}
                  <div style={s.formGroup}>
                    <label style={s.label}>主诊医生</label>
                    <select style={s.input} value={newAppointment.doctorId} onChange={e => handleAppointmentField('doctorId', e.target.value)}>
                      <option value="">请选择医生</option>
                      <option value="U001">张建国</option>
                      <option value="U002">李秀英</option>
                    </select>
                  </div>
                  {/* 检查室 */}
                  <div style={s.formGroup}>
                    <label style={s.label}>检查室<span style={s.required}>*</span></label>
                    <select style={s.input} value={newAppointment.examRoom} onChange={e => handleAppointmentField('examRoom', e.target.value)}>
                      <option value="">请选择检查室</option>
                      <option value="超声室1">超声室1</option>
                      <option value="超声室2">超声室2</option>
                      <option value="超声室3">超声室3</option>
                    </select>
                  </div>
                  {/* 预约日期 */}
                  <div style={s.formGroup}>
                    <label style={s.label}>预约日期<span style={s.required}>*</span></label>
                    <input style={s.input} type="date" value={newAppointment.appointmentDate} onChange={e => handleAppointmentField('appointmentDate', e.target.value)} />
                  </div>
                  {/* 预约时间 */}
                  <div style={s.formGroup}>
                    <label style={s.label}>预约时间<span style={s.required}>*</span></label>
                    <select style={s.input} value={newAppointment.appointmentTime} onChange={e => handleAppointmentField('appointmentTime', e.target.value)}>
                      <option value="">请选择时间</option>
                      <option value="08:00">08:00</option>
                      <option value="08:30">08:30</option>
                      <option value="09:00">09:00</option>
                      <option value="09:30">09:30</option>
                      <option value="10:00">10:00</option>
                      <option value="10:30">10:30</option>
                      <option value="11:00">11:00</option>
                      <option value="11:30">11:30</option>
                      <option value="14:00">14:00</option>
                      <option value="14:30">14:30</option>
                      <option value="15:00">15:00</option>
                      <option value="15:30">15:30</option>
                      <option value="16:00">16:00</option>
                    </select>
                  </div>
                  {/* 预约原因 */}
                  <div style={{ ...s.formGroup, gridColumn: '1 / -1' }}>
                    <label style={s.label}>预约原因</label>
                    <input style={s.input} value={newAppointment.reason || ''} onChange={e => handleAppointmentField('reason', e.target.value)} placeholder="请输入预约原因" />
                  </div>
                  {/* 备注 */}
                  <div style={{ ...s.formGroup, gridColumn: '1 / -1' }}>
                    <label style={s.label}>备注</label>
                    <textarea style={s.textarea} value={newAppointment.notes || ''} onChange={e => handleAppointmentField('notes', e.target.value)} placeholder="特殊注意事项..." />
                  </div>
                </div>

                {/* 预约冲突提示 */}
                {appointmentConflict && (
                  <div style={s.conflictWarning}>
                    <AlertTriangle size={16} color="#ea580c" />
                    <span style={{ fontSize: 13, color: '#c2410c' }}>{appointmentConflict}</span>
                  </div>
                )}
              </div>
              <div style={s.modalFooter}>
                <button style={s.btnCancel} onClick={closeModal}>取消</button>
                <button style={s.btnSubmit} onClick={submitAppointment}>确认预约</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
