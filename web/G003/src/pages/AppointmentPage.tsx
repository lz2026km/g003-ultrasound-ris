// @ts-nocheck
// G003 超声RIS - 预约管理页面 v0.2.0
import { useState, useMemo } from 'react'
import {
  CalendarClock, Search, Plus, Filter, Download, Clock, X, ChevronLeft,
  ChevronRight, AlertTriangle, CheckCircle, XCircle, User, Calendar,
  BarChart3, Bell, Edit2, Trash2, FastForward, Sun
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell
} from 'recharts'
import { mockAppointments, mockPatients, examTypeOptions, examSubtypeOptions } from '../data/initialData'

// ---------- 类型 ----------
type AppointmentStatus = '已预约' | '已到检' | '已取消' | '已过期'
type TimeSlot = '上午' | '下午' | '晚班'
type CalendarView = '本周' | '本月'

interface Appointment {
  id: string
  patientId: string
  patientName: string
  examType: string
  examSubtype: string
  appointmentDate: string
  appointmentTime: string
  timeSlot: TimeSlot
  status: AppointmentStatus
  doctor: string
  device?: string
  notes?: string
  cancelReason?: string
}

// ---------- 样式 ----------
const s: Record<string, React.CSSProperties> = {
  root: { padding: 0 },
  header: { marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 700, color: '#1a3a5c', margin: 0 },
  version: { fontSize: 11, color: '#94a3b8', marginLeft: 8 },
  headerRight: { display: 'flex', gap: 8 },
  // 布局
  mainLayout: { display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 },
  leftCol: { display: 'flex', flexDirection: 'column', gap: 20 },
  rightCol: {},
  // 顶部卡片行
  topRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 },
  card: {
    background: '#fff', borderRadius: 12, padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  cardTitle: {
    fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 16,
    display: 'flex', alignItems: 'center', gap: 6,
  },
  // 日历
  calendarHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16,
  },
  calendarNav: { display: 'flex', alignItems: 'center', gap: 12 },
  calendarTitle: { fontSize: 15, fontWeight: 600, color: '#1a3a5c' },
  viewToggle: { display: 'flex', gap: 4, background: '#f1f5f9', padding: 3, borderRadius: 8 },
  viewBtn: {
    padding: '4px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
    fontSize: 12, fontWeight: 500, transition: 'all 0.2s',
  },
  viewBtnActive: { background: '#3b82f6', color: '#fff' },
  calendarGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 },
  calendarDayHeader: {
    textAlign: 'center', fontSize: 11, fontWeight: 600, color: '#94a3b8',
    padding: '4px 0', marginBottom: 4,
  },
  calendarDay: {
    aspectRatio: '1', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', borderRadius: 8,
    cursor: 'pointer', transition: 'all 0.15s', fontSize: 13, position: 'relative',
  },
  calendarDayOther: { color: '#cbd5e1' },
  calendarDayToday: { background: '#eff6ff', border: '2px solid #3b82f6' },
  calendarDaySelected: { background: '#3b82f6', color: '#fff' },
  calendarDayHasAppt: { background: '#fef3c7' },
  dayApptCount: {
    position: 'absolute', bottom: 2, fontSize: 9, fontWeight: 600,
    color: '#92400e',
  },
  // 统计
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 },
  statItem: {
    textAlign: 'center', padding: '12px 8px', background: '#f8fafc',
    borderRadius: 8,
  },
  statValue: { fontSize: 22, fontWeight: 700, color: '#1a3a5c' },
  statLabel: { fontSize: 11, color: '#64748b', marginTop: 2 },
  // 图表
  chartContainer: { height: 160 },
  // 按钮
  btn: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
    borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13,
    fontWeight: 500, minHeight: 40,
  },
  btnPrimary: { background: '#3b82f6', color: '#fff' },
  btnSecondary: { background: '#fff', color: '#475569', border: '1px solid #e2e8f0' },
  btnDanger: { background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca' },
  btnSuccess: { background: '#f0fdf4', color: '#22c55e', border: '1px solid #bbf7d0' },
  // 表单
  formGroup: { marginBottom: 16 },
  formLabel: {
    display: 'block', fontSize: 12, fontWeight: 600, color: '#475569',
    marginBottom: 6,
  },
  formInput: {
    width: '100%', padding: '8px 12px', borderRadius: 6,
    border: '1px solid #e2e8f0', fontSize: 13, color: '#1a3a5c',
    background: '#fff', outline: 'none', boxSizing: 'border-box',
  },
  formSelect: {
    width: '100%', padding: '8px 12px', borderRadius: 6,
    border: '1px solid #e2e8f0', fontSize: 13, color: '#1a3a5c',
    background: '#fff', outline: 'none', cursor: 'pointer',
  },
  formTextarea: {
    width: '100%', padding: '8px 12px', borderRadius: 6,
    border: '1px solid #e2e8f0', fontSize: 13, color: '#1a3a5c',
    background: '#fff', outline: 'none', resize: 'vertical' as const, minHeight: 60,
    fontFamily: 'inherit',
  },
  // 表格
  tableWrap: {
    background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    overflow: 'hidden',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    background: '#f8fafc', padding: '12px 16px', textAlign: 'left',
    fontSize: 12, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e2e8f0',
  },
  td: {
    padding: '12px 16px', fontSize: 13, color: '#475569',
    borderBottom: '1px solid #f1f5f9',
  },
  badge: {
    display: 'inline-flex', padding: '2px 10px', borderRadius: 20,
    fontSize: 12, fontWeight: 500,
  },
  // 弹窗
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 1000,
  },
  modal: {
    background: '#fff', borderRadius: 16, width: 480, maxHeight: '90vh',
    overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  },
  modalHeader: {
    padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex',
    justifyContent: 'space-between', alignItems: 'center',
  },
  modalTitle: { fontSize: 16, fontWeight: 700, color: '#1a3a5c', margin: 0 },
  modalBody: { padding: 24 },
  modalFooter: {
    padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex',
    justifyContent: 'flex-end', gap: 8,
  },
  // 时段选择
  slotGroup: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 },
  slotBtn: {
    padding: '10px 8px', borderRadius: 8, border: '1px solid #e2e8f0',
    background: '#fff', cursor: 'pointer', textAlign: 'center' as const,
    transition: 'all 0.15s',
  },
  slotBtnActive: { borderColor: '#3b82f6', background: '#eff6ff' },
  slotTime: { fontSize: 13, fontWeight: 600, color: '#1a3a5c' },
  slotLabel: { fontSize: 11, color: '#64748b', marginTop: 2 },
  // 冲突提示
  conflictAlert: {
    padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca',
    borderRadius: 8, marginBottom: 16, display: 'flex', alignItems: 'flex-start',
    gap: 8,
  },
  conflictText: { fontSize: 12, color: '#dc2626', lineHeight: 1.5 },
  // 操作按钮
  actionGroup: { display: 'flex', gap: 4 },
  iconBtn: {
    width: 30, height: 30, display: 'flex', alignItems: 'center',
    justifyContent: 'center', borderRadius: 6, border: 'none',
    cursor: 'pointer', transition: 'all 0.15s',
  },
  // 快速预约
  quickApptBar: {
    display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center',
    padding: '12px 16px', background: '#fffbeb', borderRadius: 10,
    border: '1px solid #fde68a',
  },
  quickApptLabel: { fontSize: 12, fontWeight: 600, color: '#92400e', display: 'flex', alignItems: 'center', gap: 4 },
  // 筛选
  filterRow: {
    display: 'flex', gap: 12, alignItems: 'center', background: '#f8fafc',
    padding: '12px 16px', borderRadius: 10, marginBottom: 16, flexWrap: 'wrap' as const,
  },
  searchInput: {
    flex: 1, minWidth: 180, padding: '8px 12px', borderRadius: 6,
    border: '1px solid #e2e8f0', fontSize: 13, color: '#1a3a5c',
    background: '#fff', outline: 'none', minHeight: 36,
  },
  // 时间选择
  timeSelectWrap: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 },
  // 空状态
  emptyState: {
    padding: '40px 20px', textAlign: 'center' as const, color: '#94a3b8',
  },
  // 状态颜色
  statusColors: {
    '已预约': { bg: '#eff6ff', color: '#3b82f6' },
    '已到检': { bg: '#f0fdf4', color: '#22c55e' },
    '已取消': { bg: '#fef2f2', color: '#ef4444' },
    '已过期': { bg: '#f5f3ff', color: '#8b5cf6' },
  },
}

// ---------- 工具函数 ----------
const TIME_SLOTS: Record<TimeSlot, { label: string; time: string }> = {
  '上午': { label: '上午', time: '08:00-12:00' },
  '下午': { label: '下午', time: '14:00-18:00' },
  '晚班': { label: '晚班', time: '18:00-22:00' },
}

const DOCTORS = ['李明辉', '王晓燕', '张伟', '陈静', '刘强']
const DEVICES = ['彩超仪 A', '彩超仪 B', '彩超仪 C', '便携超声 A', '床旁超声 B']

const formatDate = (date: Date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const getWeekDates = (date: Date): Date[] => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return Array.from({ length: 7 }, (_, i) => {
    const nd = new Date(d)
    nd.setDate(d.getDate() + i)
    return nd
  })
}

const getMonthDates = (date: Date): Date[] => {
  const year = date.getFullYear()
  const month = date.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const dates: Date[] = []
  // 填充上月末尾
  const firstDow = firstDay.getDay()
  const prevDays = firstDow === 0 ? 6 : firstDow - 1
  for (let i = prevDays; i > 0; i--) {
    dates.push(new Date(year, month, 1 - i))
  }
  // 当月
  for (let i = 1; i <= lastDay.getDate(); i++) {
    dates.push(new Date(year, month, i))
  }
  // 填充下月开头
  const remaining = 42 - dates.length
  for (let i = 1; i <= remaining; i++) {
    dates.push(new Date(year, month + 1, i))
  }
  return dates
}

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

// ---------- 组件 ----------
const WeekdayLabels = () => ['一', '二', '三', '四', '五', '六', '日'].map(d => (
  <div key={d} style={s.calendarDayHeader}>{d}</div>
))

interface CalendarProps {
  view: CalendarView
  currentDate: Date
  selectedDate: Date
  appointments: Appointment[]
  onNavigate: (dir: -1 | 1) => void
  onSelectDate: (d: Date) => void
  onToday: () => void
}

function Calendar({ view, currentDate, selectedDate, appointments, onNavigate, onSelectDate, onToday }: CalendarProps) {
  const dates = view === '本周' ? getWeekDates(currentDate) : getMonthDates(currentDate)
  const today = new Date()

  const getApptCount = (d: Date) =>
    appointments.filter(a => a.appointmentDate === formatDate(d)).length

  return (
    <div style={s.card}>
      <div style={s.calendarHeader}>
        <div style={s.calendarNav}>
          <button onClick={() => onNavigate(-1)} style={{ ...s.iconBtn, background: '#f1f5f9' }}>
            <ChevronLeft size={16} />
          </button>
          <span style={s.calendarTitle}>
            {currentDate.getFullYear()}年{currentDate.getMonth() + 1}月
          </span>
          <button onClick={() => onNavigate(1)} style={{ ...s.iconBtn, background: '#f1f5f9' }}>
            <ChevronRight size={16} />
          </button>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={onToday} style={{ ...s.btn, ...s.btnSecondary, padding: '4px 12px', minHeight: 32, fontSize: 12 }}>
            <Sun size={12} /> 今天
          </button>
          <div style={s.viewToggle}>
            {(['本周', '本月'] as CalendarView[]).map(v => (
              <button
                key={v}
                onClick={() => {}}
                style={{
                  ...s.viewBtn,
                  ...(view === v ? s.viewBtnActive : {}),
                }}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={s.calendarGrid}>
        <WeekdayLabels />
        {dates.map((d, i) => {
          const isToday = isSameDay(d, today)
          const isSelected = isSameDay(d, selectedDate)
          const isCurrentMonth = d.getMonth() === currentDate.getMonth()
          const apptCount = getApptCount(d)
          const hasAppt = apptCount > 0

          return (
            <div
              key={i}
              onClick={() => onSelectDate(d)}
              style={{
                ...s.calendarDay,
                ...(isToday ? s.calendarDayToday : {}),
                ...(isSelected && !isToday ? s.calendarDaySelected : {}),
                ...(hasAppt && !isToday && !isSelected ? s.calendarDayHasAppt : {}),
                ...(!isCurrentMonth ? s.calendarDayOther : {}),
              }}
            >
              {d.getDate()}
              {hasAppt && (
                <span style={s.dayApptCount}>{apptCount}</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface StatsChartProps {
  appointments: Appointment[]
}

function StatsChart({ appointments }: StatsChartProps) {
  const today = formatDate(new Date())
  const todayObj = new Date()

  // 计算今日/本周/本月
  const todayCount = appointments.filter(a => a.appointmentDate === today).length
  const weekStart = getWeekDates(todayObj)[0]
  const weekEnd = getWeekDates(todayObj)[6]
  const weekCount = appointments.filter(a => {
    const d = new Date(a.appointmentDate)
    return d >= weekStart && d <= weekEnd
  }).length
  const monthStart = new Date(todayObj.getFullYear(), todayObj.getMonth(), 1)
  const monthEnd = new Date(todayObj.getFullYear(), todayObj.getMonth() + 1, 0)
  const monthCount = appointments.filter(a => {
    const d = new Date(a.appointmentDate)
    return d >= monthStart && d <= monthEnd
  }).length

  // 每日预约数据（近7天）
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(todayObj)
    d.setDate(d.getDate() - (6 - i))
    return d
  })

  const chartData = last7Days.map(d => ({
    day: `${d.getMonth() + 1}/${d.getDate()}`,
    count: appointments.filter(a => a.appointmentDate === formatDate(d)).length,
  }))

  return (
    <div style={s.card}>
      <div style={s.cardTitle}>
        <BarChart3 size={14} /> 预约统计
      </div>
      <div style={s.statsRow}>
        <div style={s.statItem}>
          <div style={s.statValue}>{todayCount}</div>
          <div style={s.statLabel}>今日预约</div>
        </div>
        <div style={s.statItem}>
          <div style={s.statValue}>{weekCount}</div>
          <div style={s.statLabel}>本周预约</div>
        </div>
        <div style={s.statItem}>
          <div style={s.statValue}>{monthCount}</div>
          <div style={s.statLabel}>本月预约</div>
        </div>
      </div>
      <div style={s.chartContainer}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: '#1a3a5c', fontWeight: 600 }}
            />
            <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

interface AppointmentModalProps {
  mode: 'add' | 'edit'
  initial?: Partial<Appointment>
  patients: typeof mockPatients
  appointments: Appointment[]
  onSave: (a: Appointment) => void
  onClose: () => void
  onQuickAdd?: (patientId: string) => void
}

function AppointmentModal({ mode, initial, patients, appointments, onSave, onClose, onQuickAdd }: AppointmentModalProps) {
  const [form, setForm] = useState<Partial<Appointment>>(() => ({
    patientId: initial?.patientId || '',
    patientName: initial?.patientName || '',
    examType: initial?.examType || '',
    examSubtype: initial?.examSubtype || '',
    appointmentDate: initial?.appointmentDate || formatDate(new Date()),
    timeSlot: initial?.timeSlot || '上午',
    doctor: initial?.doctor || DOCTORS[0],
    device: initial?.device || DEVICES[0],
    notes: initial?.notes || '',
    ...initial,
  }))

  const [conflict, setConflict] = useState<string[]>([])
  const [selectedPatient, setSelectedPatient] = useState(initial?.patientId || '')

  const handlePatientSelect = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId)
    if (patient) {
      setForm(f => ({ ...f, patientId, patientName: patient.name }))
      setSelectedPatient(patientId)
      if (onQuickAdd) onQuickAdd(patientId)
    }
  }

  const checkConflict = () => {
    if (!form.appointmentDate || !form.timeSlot) return
    const conflicts: string[] = []
    const slotTime = TIME_SLOTS[form.timeSlot].time

    appointments.forEach(a => {
      if (a.id === initial?.id) return
      if (a.appointmentDate === form.appointmentDate && a.timeSlot === form.timeSlot) {
        if (a.device === form.device) {
          conflicts.push(`设备「${a.device}」在 ${slotTime} 已有「${a.patientName}」的${a.examType}预约`)
        }
      }
    })

    setConflict(conflicts)
  }

  const handleSubmit = () => {
    if (!form.patientId || !form.examType || !form.appointmentDate) return

    const newAppt: Appointment = {
      id: initial?.id || `A${String(Date.now()).slice(-6)}`,
      patientId: form.patientId!,
      patientName: form.patientName!,
      examType: form.examType!,
      examSubtype: form.examSubtype || '',
      appointmentDate: form.appointmentDate!,
      appointmentTime: TIME_SLOTS[form.timeSlot!].time.split('-')[0],
      timeSlot: form.timeSlot!,
      status: '已预约',
      doctor: form.doctor!,
      device: form.device,
      notes: form.notes,
    }

    onSave(newAppt)
  }

  const subtypes = form.examType ? examSubtypeOptions[form.examType] || [] : []

  return (
    <div style={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>
        <div style={s.modalHeader}>
          <h2 style={s.modalTitle}>{mode === 'add' ? '新增预约' : '编辑预约'}</h2>
          <button onClick={onClose} style={{ ...s.iconBtn, background: '#f1f5f9' }}>
            <X size={16} />
          </button>
        </div>

        <div style={s.modalBody}>
          {/* 患者选择 */}
          <div style={s.formGroup}>
            <label style={s.formLabel}>患者选择 *</label>
            <select
              style={s.formSelect}
              value={selectedPatient}
              onChange={e => handlePatientSelect(e.target.value)}
            >
              <option value="">-- 选择患者 --</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.id}) - {p.patientType}</option>
              ))}
            </select>
          </div>

          {/* 检查项目 */}
          <div style={s.formGroup}>
            <label style={s.formLabel}>检查类型 *</label>
            <select
              style={s.formSelect}
              value={form.examType}
              onChange={e => setForm(f => ({ ...f, examType: e.target.value, examSubtype: '' }))}
            >
              <option value="">-- 选择检查类型 --</option>
              {examTypeOptions.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {subtypes.length > 0 && (
            <div style={s.formGroup}>
              <label style={s.formLabel}>检查部位</label>
              <select
                style={s.formSelect}
                value={form.examSubtype}
                onChange={e => setForm(f => ({ ...f, examSubtype: e.target.value }))}
              >
                <option value="">-- 选择检查部位 --</option>
                {subtypes.map(st => <option key={st} value={st}>{st}</option>)}
              </select>
            </div>
          )}

          {/* 预约日期 */}
          <div style={s.formGroup}>
            <label style={s.formLabel}>预约日期 *</label>
            <input
              type="date"
              style={s.formInput}
              value={form.appointmentDate}
              onChange={e => setForm(f => ({ ...f, appointmentDate: e.target.value }))}
              onBlur={checkConflict}
            />
          </div>

          {/* 时段 */}
          <div style={s.formGroup}>
            <label style={s.formLabel}>预约时段 *</label>
            <div style={s.slotGroup}>
              {(Object.entries(TIME_SLOTS) as [TimeSlot, { label: string; time: string }][]).map(([key, val]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => { setForm(f => ({ ...f, timeSlot: key })); setTimeout(checkConflict, 0) }}
                  style={{
                    ...s.slotBtn,
                    ...(form.timeSlot === key ? s.slotBtnActive : {}),
                  }}
                >
                  <div style={s.slotTime}>{val.label}</div>
                  <div style={s.slotLabel}>{val.time}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 设备和医生 */}
          <div style={s.timeSelectWrap}>
            <div style={s.formGroup}>
              <label style={s.formLabel}>设备</label>
              <select
                style={s.formSelect}
                value={form.device}
                onChange={e => { setForm(f => ({ ...f, device: e.target.value })); setTimeout(checkConflict, 0) }}
              >
                {DEVICES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div style={s.formGroup}>
              <label style={s.formLabel}>接诊医生</label>
              <select
                style={s.formSelect}
                value={form.doctor}
                onChange={e => setForm(f => ({ ...f, doctor: e.target.value }))}
              >
                {DOCTORS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          {/* 备注 */}
          <div style={s.formGroup}>
            <label style={s.formLabel}>备注</label>
            <textarea
              style={s.formTextarea}
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="可选填写备注信息..."
            />
          </div>

          {/* 冲突提示 */}
          {conflict.length > 0 && (
            <div style={s.conflictAlert}>
              <AlertTriangle size={14} color="#dc2626" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                {conflict.map((c, i) => <div key={i} style={s.conflictText}>{c}</div>)}
              </div>
            </div>
          )}
        </div>

        <div style={s.modalFooter}>
          <button style={{ ...s.btn, ...s.btnSecondary }} onClick={onClose}>取消</button>
          <button
            style={{ ...s.btn, ...s.btnPrimary }}
            onClick={handleSubmit}
            disabled={!form.patientId || !form.examType || !form.appointmentDate}
          >
            {mode === 'add' ? '确认预约' : '保存修改'}
          </button>
        </div>
      </div>
    </div>
  )
}

interface CancelModalProps {
  appointment: Appointment
  onConfirm: (reason: string) => void
  onClose: () => void
}

function CancelModal({ appointment, onConfirm, onClose }: CancelModalProps) {
  const [reason, setReason] = useState('')

  return (
    <div style={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ ...s.modal, width: 400 }}>
        <div style={s.modalHeader}>
          <h2 style={s.modalTitle}>取消预约</h2>
          <button onClick={onClose} style={{ ...s.iconBtn, background: '#f1f5f9' }}>
            <X size={16} />
          </button>
        </div>
        <div style={s.modalBody}>
          <p style={{ fontSize: 13, color: '#475569', marginBottom: 16 }}>
            确定要取消患者 <strong>{appointment.patientName}</strong> 的预约吗？
          </p>
          <div style={s.formGroup}>
            <label style={s.formLabel}>取消原因 *</label>
            <textarea
              style={s.formTextarea}
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="请输入取消原因..."
            />
          </div>
        </div>
        <div style={s.modalFooter}>
          <button style={{ ...s.btn, ...s.btnSecondary }} onClick={onClose}>返回</button>
          <button
            style={{ ...s.btn, ...s.btnDanger }}
            onClick={() => reason.trim() && onConfirm(reason)}
            disabled={!reason.trim()}
          >
            <XCircle size={14} /> 确认取消
          </button>
        </div>
      </div>
    </div>
  )
}

// ---------- 主页面 ----------
export default function AppointmentPage() {
  const [appointments, setAppointments] = useState<Appointment[]>(
    mockAppointments.map(a => ({ ...a, timeSlot: '上午' as TimeSlot }))
  )
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('全部')
  const [typeFilter, setTypeFilter] = useState<string>('全部')

  // 日历状态
  const [calendarView, setCalendarView] = useState<CalendarView>('本月')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())

  // 弹窗状态
  const [showAddModal, setShowAddModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState<Appointment | null>(null)
  const [editingAppt, setEditingAppt] = useState<Appointment | null>(null)

  // 快速预约患者
  const [quickPatientId, setQuickPatientId] = useState('')

  // 过滤
  const filtered = useMemo(() => {
    return appointments.filter(a => {
      const matchSearch = !search ||
        a.patientName.includes(search) ||
        a.examType.includes(search) ||
        a.id.includes(search)
      const matchStatus = statusFilter === '全部' || a.status === statusFilter
      const matchType = typeFilter === '全部' || a.examType === typeFilter
      const matchDate = formatDate(selectedDate) === a.appointmentDate
      return matchSearch && matchStatus && matchType
    })
  }, [appointments, search, statusFilter, typeFilter, selectedDate])

  const handleSaveAppointment = (appt: Appointment) => {
    setAppointments(prev => {
      const idx = prev.findIndex(a => a.id === appt.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = appt
        return next
      }
      return [...prev, appt]
    })
    setShowAddModal(false)
    setEditingAppt(null)
  }

  const handleCancelAppointment = (reason: string) => {
    if (!showCancelModal) return
    setAppointments(prev =>
      prev.map(a =>
        a.id === showCancelModal.id
          ? { ...a, status: '已取消' as AppointmentStatus, cancelReason: reason }
          : a
      )
    )
    setShowCancelModal(null)
  }

  const handleQuickAdd = (patientId: string) => {
    setShowAddModal(true)
  }

  const handleMarkArrived = (appt: Appointment) => {
    setAppointments(prev =>
      prev.map(a => a.id === appt.id ? { ...a, status: '已到检' as AppointmentStatus } : a)
    )
  }

  const handleNavigateCalendar = (dir: -1 | 1) => {
    const next = new Date(currentDate)
    if (calendarView === '本周') {
      next.setDate(next.getDate() + dir * 7)
    } else {
      next.setMonth(next.getMonth() + dir)
    }
    setCurrentDate(next)
  }

  return (
    <div style={s.root}>
      {/* 标题 */}
      <div style={s.header}>
        <div style={{ display: 'flex', alignItems: 'baseline' }}>
          <h1 style={s.title}>预约管理</h1>
          <span style={s.version}>v0.2.0</span>
        </div>
        <div style={s.headerRight}>
          <button style={{ ...s.btn, ...s.btnSecondary }}>
            <Download size={14} /> 导出
          </button>
          <button
            style={{ ...s.btn, ...s.btnPrimary }}
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={14} /> 新增预约
          </button>
        </div>
      </div>

      {/* 顶部区域：日历 + 统计图 */}
      <div style={s.topRow}>
        <Calendar
          view={calendarView}
          currentDate={currentDate}
          selectedDate={selectedDate}
          appointments={appointments}
          onNavigate={handleNavigateCalendar}
          onSelectDate={setSelectedDate}
          onToday={() => { setCurrentDate(new Date()); setSelectedDate(new Date()) }}
        />
        <StatsChart appointments={appointments} />
      </div>

      {/* 主体布局 */}
      <div style={s.mainLayout}>
        {/* 左侧：预约列表 */}
        <div style={s.leftCol}>
          {/* 快速预约栏 */}
          <div style={s.quickApptBar}>
            <span style={s.quickApptLabel}>
              <FastForward size={14} /> 快速预约
            </span>
            <select
              style={{ ...s.formSelect, width: 200 }}
              value={quickPatientId}
              onChange={e => { setQuickPatientId(e.target.value); handleQuickAdd(e.target.value) }}
            >
              <option value="">-- 选择患者快速创建预约 --</option>
              {mockPatients.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
              ))}
            </select>
          </div>

          {/* 筛选 */}
          <div style={s.filterRow}>
            <Search size={14} color="#64748b" />
            <input
              style={s.searchInput}
              placeholder="搜索患者姓名/检查类型..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <select
              style={{ ...s.btn, background: '#fff', border: '1px solid #e2e8f0', minHeight: 36 }}
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option>全部</option>
              <option>已预约</option>
              <option>已到检</option>
              <option>已取消</option>
              <option>已过期</option>
            </select>
            <select
              style={{ ...s.btn, background: '#fff', border: '1px solid #e2e8f0', minHeight: 36 }}
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
            >
              <option>全部</option>
              {examTypeOptions.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>

          {/* 表格 */}
          <div style={s.tableWrap}>
            {filtered.length === 0 ? (
              <div style={s.emptyState}>
                <CalendarClock size={40} style={{ marginBottom: 12, opacity: 0.5 }} />
                <p>暂无预约记录</p>
              </div>
            ) : (
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>预约ID</th>
                    <th style={s.th}>患者姓名</th>
                    <th style={s.th}>检查项目</th>
                    <th style={s.th}>预约日期时段</th>
                    <th style={s.th}>医生</th>
                    <th style={s.th}>状态</th>
                    <th style={s.th}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(a => (
                    <tr key={a.id} style={{ cursor: 'pointer' }}>
                      <td style={s.td}>
                        <span style={{ fontFamily: 'monospace', color: '#3b82f6', fontSize: 12 }}>{a.id}</span>
                      </td>
                      <td style={{ ...s.td, fontWeight: 600, color: '#1a3a5c' }}>{a.patientName}</td>
                      <td style={s.td}>
                        <div style={{ fontSize: 13 }}>{a.examType}</div>
                        {a.examSubtype && <div style={{ fontSize: 11, color: '#94a3b8' }}>{a.examSubtype}</div>}
                      </td>
                      <td style={{ ...s.td, fontSize: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Calendar size={11} color="#94a3b8" />
                          {a.appointmentDate}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#64748b' }}>
                          <Clock size={11} color="#94a3b8" />
                          {TIME_SLOTS[a.timeSlot].time}
                        </div>
                      </td>
                      <td style={s.td}>{a.doctor}</td>
                      <td style={s.td}>
                        <span style={{
                          ...s.badge,
                          background: s.statusColors[a.status]?.bg,
                          color: s.statusColors[a.status]?.color,
                        }}>
                          {a.status}
                        </span>
                      </td>
                      <td style={s.td}>
                        <div style={s.actionGroup}>
                          {a.status === '已预约' && (
                            <>
                              <button
                                style={{ ...s.iconBtn, background: '#f0fdf4' }}
                                onClick={() => handleMarkArrived(a)}
                                title="标记已到检"
                              >
                                <CheckCircle size={14} color="#22c55e" />
                              </button>
                              <button
                                style={{ ...s.iconBtn, background: '#f1f5f9' }}
                                onClick={() => { setEditingAppt(a); setShowAddModal(true) }}
                                title="编辑"
                              >
                                <Edit2 size={14} color="#64748b" />
                              </button>
                              <button
                                style={{ ...s.iconBtn, background: '#fef2f2' }}
                                onClick={() => setShowCancelModal(a)}
                                title="取消预约"
                              >
                                <XCircle size={14} color="#ef4444" />
                              </button>
                            </>
                          )}
                          {a.status === '已到检' && (
                            <span style={{ fontSize: 11, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <CheckCircle size={12} /> 已到检
                            </span>
                          )}
                          {a.status === '已取消' && a.cancelReason && (
                            <span style={{ fontSize: 11, color: '#64748b' }} title={a.cancelReason}>
                              已取消
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* 右侧：新增预约表单（侧边栏常驻） */}
        <div style={s.rightCol}>
          <div style={s.card}>
            <div style={s.cardTitle}>
              <Plus size={14} /> 新增预约
            </div>

            {/* 快速患者选择 */}
            <div style={s.formGroup}>
              <label style={s.formLabel}>选择患者 *</label>
              <select
                style={s.formSelect}
                value={quickPatientId}
                onChange={e => setQuickPatientId(e.target.value)}
              >
                <option value="">-- 选择患者 --</option>
                {mockPatients.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.gender}, {p.age}岁)</option>
                ))}
              </select>
            </div>

            {/* 检查类型 */}
            <div style={s.formGroup}>
              <label style={s.formLabel}>检查类型 *</label>
              <select
                style={s.formSelect}
                onChange={e => {}}
              >
                <option value="">-- 选择检查类型 --</option>
                {examTypeOptions.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* 预约日期 */}
            <div style={s.formGroup}>
              <label style={s.formLabel}>预约日期</label>
              <input type="date" style={s.formInput} defaultValue={formatDate(selectedDate)} />
            </div>

            {/* 时段 */}
            <div style={s.formGroup}>
              <label style={s.formLabel}>预约时段</label>
              <div style={s.slotGroup}>
                {(Object.entries(TIME_SLOTS) as [TimeSlot, { label: string; time: string }][]).map(([key, val]) => (
                  <button
                    key={key}
                    type="button"
                    style={s.slotBtn}
                  >
                    <div style={s.slotTime}>{val.label}</div>
                    <div style={s.slotLabel}>{val.time}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 医生 */}
            <div style={s.formGroup}>
              <label style={s.formLabel}>接诊医生</label>
              <select style={s.formSelect}>
                {DOCTORS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <button
              style={{ ...s.btn, ...s.btnPrimary, width: '100%', justifyContent: 'center' }}
              onClick={() => quickPatientId && setShowAddModal(true)}
              disabled={!quickPatientId}
            >
              <Plus size={14} /> 打开完整表单
            </button>
          </div>

          {/* 今日概览 */}
          <div style={{ ...s.card, marginTop: 20 }}>
            <div style={s.cardTitle}>
              <Sun size={14} /> 今日概览
            </div>
            {['已预约', '已到检', '已取消'].map(status => {
              const count = appointments.filter(
                a => a.appointmentDate === formatDate(new Date()) && a.status === status
              ).length
              return (
                <div key={status} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 0', borderBottom: '1px solid #f1f5f9',
                }}>
                  <span style={{ fontSize: 13, color: '#475569' }}>{status}</span>
                  <span style={{
                    fontSize: 14, fontWeight: 700,
                    color: s.statusColors[status as AppointmentStatus]?.color,
                  }}>{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 弹窗 */}
      {showAddModal && (
        <AppointmentModal
          mode={editingAppt ? 'edit' : 'add'}
          initial={editingAppt || { patientId: quickPatientId }}
          patients={mockPatients}
          appointments={appointments}
          onSave={handleSaveAppointment}
          onClose={() => { setShowAddModal(false); setEditingAppt(null) }}
          onQuickAdd={handleQuickAdd}
        />
      )}

      {showCancelModal && (
        <CancelModal
          appointment={showCancelModal}
          onConfirm={handleCancelAppointment}
          onClose={() => setShowCancelModal(null)}
        />
      )}
    </div>
  )
}
