// @ts-nocheck
// ============================================================
// G003 超声RIS系统 - 预约管理页面
// ============================================================
import { useState, useMemo } from 'react'
import {
  Search, Plus, X, ChevronLeft, ChevronRight,
  Calendar, Clock, User, Stethoscope, CheckCircle,
  XCircle, AlertCircle, Ban, Edit2, RefreshCw
} from 'lucide-react'
import type { Appointment, AppointmentStatus } from '../types'
import { initialAppointments, initialPatients, initialExamItems, initialUsers } from '../data/initialData'

// ---------- 样式定义 ----------
const s: Record<string, React.CSSProperties> = {
  pageHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 18, fontWeight: 700, color: '#1a3a5c' },
  statCards: {
    display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap',
  },
  statCard: {
    background: '#fff', borderRadius: 8, padding: '12px 16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)', minWidth: 120,
    display: 'flex', flexDirection: 'column', gap: 4,
  },
  statLabel: { fontSize: 12, color: '#64748b' },
  statValue: { fontSize: 20, fontWeight: 700, color: '#1a3a5c' },
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
    padding: '10px 16px', fontSize: 14, cursor: 'pointer', minHeight: 44,
  },
  btnSecondary: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 6,
    padding: '10px 14px', fontSize: 13, cursor: 'pointer', minHeight: 44,
  },
  btnIcon: {
    display: 'flex', alignItems: 'center', gap: 4,
    background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 6,
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
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 500,
  },
  statusBadge: {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 500,
  },
  badgePending: { background: '#fef3c7', color: '#92400e' },
  badgeConfirmed: { background: '#dbeafe', color: '#1d4ed8' },
  badgeCompleted: { background: '#dcfce7', color: '#166534' },
  badgeCancelled: { background: '#fee2e2', color: '#dc2626' },
  badgeLate: { background: '#f3e8ff', color: '#7c3aed' },
  badgeInProgress: { background: '#e0f2fe', color: '#0369a1' },
  badgePendingCheck: { background: '#fef9c3', color: '#854d0e' },
  badgeOngoing: { background: '#ccfbf1', color: '#115e59' },
  actions: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  pagination: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 16, padding: '12px 16px', background: '#fff',
    borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', flexWrap: 'wrap', gap: 8,
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
    background: '#fff', borderRadius: 12, width: 600, maxHeight: '90vh',
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
  emptyState: {
    textAlign: 'center', padding: '60px 20px', color: '#94a3b8',
    fontSize: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
  },
  emptyStateIcon: { width: 64, height: 64, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  emptyStateTitle: { fontSize: 15, fontWeight: 600, color: '#64748b', marginTop: 4 },
  emptyStateDesc: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
  errorBox: {
    background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6,
    padding: '10px 14px', marginBottom: 14,
  },
  statusTag: {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '3px 8px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
    border: '1px solid transparent',
  },
  statusMenu: {
    position: 'absolute', background: '#fff', borderRadius: 8,
    boxShadow: '0 4px 16px rgba(0,0,0,0.12)', border: '1px solid #e2e8f0',
    zIndex: 50, minWidth: 120, padding: 4,
  },
  statusMenuItem: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '6px 10px', borderRadius: 4, cursor: 'pointer',
    fontSize: 12, color: '#334155', width: '100%', border: 'none', background: 'none',
  },
  rowCell: { position: 'relative' },
  infoText: { fontSize: 12, color: '#64748b' },
}

// ---------- 类型 ----------
type ModalMode = 'add' | 'view' | null

// ---------- 状态徽章样式 ----------
const statusBadgeStyle = (status: AppointmentStatus): React.CSSProperties => {
  switch (status) {
    case '待确认': return { ...s.badge, ...s.badgePending }
    case '已确认': return { ...s.badge, ...s.badgeConfirmed }
    case '已完成': return { ...s.badge, ...s.badgeCompleted }
    case '已取消': return { ...s.badge, ...s.badgeCancelled }
    case '迟到': return { ...s.badge, ...s.badgeLate }
    case '检查中': return { ...s.badge, ...s.badgeInProgress }
    case '待检查': return { ...s.badge, ...s.badgePendingCheck }
    case '进行中': return { ...s.badge, ...s.badgeOngoing }
    default: return { ...s.badge, background: '#f1f5f9', color: '#475569' }
  }
}

const statusIcon = (status: AppointmentStatus) => {
  switch (status) {
    case '待确认': return <AlertCircle size={11} />
    case '已确认': return <CheckCircle size={11} />
    case '已完成': return <CheckCircle size={11} />
    case '已取消': return <XCircle size={11} />
    case '迟到': return <Ban size={11} />
    case '检查中': return <Clock size={11} />
    case '待检查': return <Clock size={11} />
    case '进行中': return <Clock size={11} />
    default: return null
  }
}

// ---------- 空预约对象 ----------
const emptyAppointment = (): Omit<Appointment, 'id'> => ({
  patientId: '', patientName: '', examItemId: '', examItemName: '',
  doctorId: '', doctorName: '', examRoom: '',
  appointmentDate: new Date().toISOString().split('T')[0],
  appointmentTime: '09:00', status: '待确认',
  reason: '', notes: '',
  registrationDate: new Date().toISOString().split('T')[0],
  queueNumber: 1,
})

// ---------- 校验 ----------
const validateAppointment = (a: Omit<Appointment, 'id'>): string[] => {
  const errs: string[] = []
  if (!a.patientId) errs.push('请选择患者')
  if (!a.examItemId) errs.push('请选择检查项目')
  if (!a.doctorId) errs.push('请选择预约医生')
  if (!a.appointmentDate) errs.push('请选择预约日期')
  if (!a.appointmentTime) errs.push('请选择预约时段')
  if (!a.examRoom) errs.push('请选择检查室')
  return errs
}

// ---------- 主组件 ----------
export default function AppointmentPage() {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | ''>('')
  const [dateFilter, setDateFilter] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 10

  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [viewingAppointment, setViewingAppointment] = useState<Omit<Appointment, 'id'> | null>(null)
  const [formData, setFormData] = useState<Omit<Appointment, 'id'>>(emptyAppointment())
  const [formErrors, setFormErrors] = useState<string[]>([])
  const [statusAnchor, setStatusAnchor] = useState<string | null>(null)

  // 统计
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    const todayAppts = appointments.filter(a => a.appointmentDate === today)
    return {
      total: appointments.length,
      today: todayAppts.length,
      pending: appointments.filter(a => a.status === '待确认').length,
      confirmed: appointments.filter(a => a.status === '已确认').length,
      completed: appointments.filter(a => a.status === '已完成').length,
      cancelled: appointments.filter(a => a.status === '已取消').length,
    }
  }, [appointments])

  // 过滤
  const filtered = useMemo(() => {
    const kw = search.trim().toLowerCase()
    return appointments.filter(a => {
      const matchSearch = !kw ||
        a.patientName.toLowerCase().includes(kw) ||
        a.examItemName.toLowerCase().includes(kw) ||
        a.doctorName.toLowerCase().includes(kw) ||
        a.examRoom.toLowerCase().includes(kw) ||
        a.reason.toLowerCase().includes(kw)
      const matchStatus = !statusFilter || a.status === statusFilter
      const matchDate = !dateFilter || a.appointmentDate === dateFilter
      return matchSearch && matchStatus && matchDate
    })
  }, [appointments, search, statusFilter, dateFilter])

  // 分页
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  const handleField = (field: keyof Omit<Appointment, 'id'>, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handlePatientChange = (patientId: string) => {
    const patient = initialPatients.find(p => p.id === patientId)
    if (patient) {
      setFormData(prev => ({ ...prev, patientId, patientName: patient.name }))
    }
  }

  const handleExamItemChange = (examItemId: string) => {
    const item = initialExamItems.find(i => i.id === examItemId)
    if (item) {
      setFormData(prev => ({ ...prev, examItemId, examItemName: item.name }))
    }
  }

  const handleDoctorChange = (doctorId: string) => {
    const doctor = initialUsers.find(u => u.id === doctorId)
    if (doctor) {
      setFormData(prev => ({ ...prev, doctorId, doctorName: doctor.name }))
    }
  }

  const openAdd = () => {
    setFormData(emptyAppointment())
    setFormErrors([])
    setModalMode('add')
  }

  const openView = (a: Appointment) => {
    setViewingAppointment({ ...a })
    setModalMode('view')
  }

  const closeModal = () => {
    setModalMode(null)
    setFormErrors([])
    setStatusAnchor(null)
  }

  const handleSubmit = () => {
    const errs = validateAppointment(formData)
    if (errs.length > 0) { setFormErrors(errs); return }
    const id = 'APT' + String(Date.now()).slice(-6)
    setAppointments(prev => [{ ...formData, id }, ...prev])
    closeModal()
  }

  const handleStatusChange = (aptId: string, newStatus: AppointmentStatus) => {
    setAppointments(prev => prev.map(a =>
      a.id === aptId ? { ...a, status: newStatus } : a
    ))
    setStatusAnchor(null)
  }

  // 时间段选项
  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  ]

  const examRooms = ['超声室1', '超声室2', '超声室3']

  return (
    <div>
      {/* 页头 */}
      <div style={s.pageHeader}>
        <div style={s.title}>预约管理</div>
      </div>

      {/* 统计卡片 */}
      <div style={s.statCards}>
        <div style={s.statCard}>
          <div style={s.statLabel}>全部预约</div>
          <div style={s.statValue}>{stats.total}</div>
        </div>
        <div style={s.statCard}>
          <div style={s.statLabel}>今日预约</div>
          <div style={s.statValue}>{stats.today}</div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statLabel, color: '#92400e' }}>待确认</div>
          <div style={{ ...s.statValue, color: '#92400e' }}>{stats.pending}</div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statLabel, color: '#1d4ed8' }}>已确认</div>
          <div style={{ ...s.statValue, color: '#1d4ed8' }}>{stats.confirmed}</div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statLabel, color: '#166534' }}>已完成</div>
          <div style={{ ...s.statValue, color: '#166534' }}>{stats.completed}</div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statLabel, color: '#dc2626' }}>已取消</div>
          <div style={{ ...s.statValue, color: '#dc2626' }}>{stats.cancelled}</div>
        </div>
      </div>

      {/* 工具栏 */}
      <div style={s.toolbar}>
        <div style={s.searchBox}>
          <Search size={15} color="#94a3b8" />
          <input
            style={s.searchInput}
            placeholder="搜索患者姓名、检查项目、医生、检查室..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <select
          style={s.select}
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value as AppointmentStatus | ''); setPage(1) }}
        >
          <option value="">全部状态</option>
          <option value="待确认">待确认</option>
          <option value="已确认">已确认</option>
          <option value="检查中">检查中</option>
          <option value="待检查">待检查</option>
          <option value="进行中">进行中</option>
          <option value="已完成">已完成</option>
          <option value="已取消">已取消</option>
          <option value="迟到">迟到</option>
        </select>
        <input
          type="date"
          style={s.select}
          value={dateFilter}
          onChange={e => { setDateFilter(e.target.value); setPage(1) }}
        />
        {dateFilter && (
          <button style={s.btnSecondary} onClick={() => { setDateFilter(''); setPage(1) }}>
            <X size={13} /> 清除日期
          </button>
        )}
        <button style={s.btnPrimary} onClick={openAdd}>
          <Plus size={14} /> 新增预约
        </button>
      </div>

      {/* 表格 */}
      {paged.length === 0 ? (
        <div style={{ ...s.table, padding: '40px 0' }}>
          <div style={s.emptyState}>
            <div style={s.emptyStateIcon}><Calendar size={32} color="#94a3b8" /></div>
            <div style={s.emptyStateTitle}>暂无预约记录</div>
            <div style={s.emptyStateDesc}>点击右上角「新增预约」按钮创建预约</div>
          </div>
        </div>
      ) : (
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>排队号</th>
              <th style={s.th}>患者姓名</th>
              <th style={s.th}>检查项目</th>
              <th style={s.th}>预约日期</th>
              <th style={s.th}>预约时段</th>
              <th style={s.th}>检查室</th>
              <th style={s.th}>预约医生</th>
              <th style={s.th}>状态</th>
              <th style={s.th}>预约原因</th>
              <th style={s.th}>操作</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(apt => (
              <tr key={apt.id} style={{ background: '#fff' }}>
                <td style={s.td}>
                  <div style={{ fontWeight: 700, color: '#1a3a5c', fontSize: 14 }}>
                    {apt.queueNumber <= 9 ? `0${apt.queueNumber}` : apt.queueNumber}
                  </div>
                </td>
                <td style={s.td}>
                  <div style={{ fontWeight: 600, color: '#1a3a5c' }}>{apt.patientName}</div>
                  <div style={s.infoText}>{apt.patientId}</div>
                </td>
                <td style={s.td}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Stethoscope size={12} color="#94a3b8" />
                    {apt.examItemName}
                  </div>
                </td>
                <td style={s.td}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Calendar size={12} color="#94a3b8" />
                    {apt.appointmentDate}
                  </div>
                </td>
                <td style={s.td}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} color="#94a3b8" />
                    {apt.appointmentTime}
                  </div>
                </td>
                <td style={s.td}>{apt.examRoom}</td>
                <td style={s.td}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <User size={12} color="#94a3b8" />
                    {apt.doctorName}
                  </div>
                </td>
                <td style={s.td}>
                  <div style={s.rowCell}>
                    <div
                      style={{ ...statusBadgeStyle(apt.status), border: `1px solid ${apt.status === '待确认' ? '#fbbf24' : 'transparent'}` }}
                      onClick={() => setStatusAnchor(statusAnchor === apt.id ? null : apt.id)}
                      title="点击修改状态"
                    >
                      {statusIcon(apt.status)}
                      {apt.status}
                    </div>
                    {statusAnchor === apt.id && (
                      <div style={s.statusMenu}>
                        {(['待确认', '已确认', '检查中', '已完成', '已取消', '迟到'] as AppointmentStatus[]).map(st => (
                          <button
                            key={st}
                            style={{
                              ...s.statusMenuItem,
                              background: apt.status === st ? '#f1f5f9' : 'transparent',
                              fontWeight: apt.status === st ? 600 : 400,
                            }}
                            onClick={() => handleStatusChange(apt.id, st)}
                          >
                            <span style={statusBadgeStyle(st)}>{statusIcon(st)}</span>
                            {st}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </td>
                <td style={s.td}>
                  <div style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={apt.reason || '-'}>
                    {apt.reason || '-'}
                  </div>
                </td>
                <td style={s.td}>
                  <div style={s.actions}>
                    <button style={s.btnIcon} onClick={() => openView(apt)} title="查看详情">
                      <Stethoscope size={13} /> 查看
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

      {/* 弹窗 */}
      {modalMode && (
        <div style={s.overlay} onClick={e => e.target === e.currentTarget && closeModal()}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            {modalMode === 'view' && viewingAppointment ? (
              <>
                <div style={s.modalHeader}>
                  <div style={s.modalTitle}>预约详情</div>
                  <button style={s.modalClose} onClick={closeModal}><X size={18} /></button>
                </div>
                <div style={s.modalBody}>
                  <div style={{ ...s.statusBadge, ...statusBadgeStyle(viewingAppointment.status), alignSelf: 'flex-start', marginBottom: 16 }}>
                    {statusIcon(viewingAppointment.status)}
                    {viewingAppointment.status}
                  </div>
                  <div style={s.formGrid}>
                    <div style={s.formGroup}>
                      <div style={s.label}>患者姓名</div>
                      <div style={{ fontSize: 14, color: '#334155', padding: '6px 0' }}>{viewingAppointment.patientName}</div>
                    </div>
                    <div style={s.formGroup}>
                      <div style={s.label}>检查项目</div>
                      <div style={{ fontSize: 14, color: '#334155', padding: '6px 0' }}>{viewingAppointment.examItemName}</div>
                    </div>
                    <div style={s.formGroup}>
                      <div style={s.label}>预约医生</div>
                      <div style={{ fontSize: 14, color: '#334155', padding: '6px 0' }}>{viewingAppointment.doctorName}</div>
                    </div>
                    <div style={s.formGroup}>
                      <div style={s.label}>检查室</div>
                      <div style={{ fontSize: 14, color: '#334155', padding: '6px 0' }}>{viewingAppointment.examRoom}</div>
                    </div>
                    <div style={s.formGroup}>
                      <div style={s.label}>预约日期</div>
                      <div style={{ fontSize: 14, color: '#334155', padding: '6px 0' }}>{viewingAppointment.appointmentDate}</div>
                    </div>
                    <div style={s.formGroup}>
                      <div style={s.label}>预约时段</div>
                      <div style={{ fontSize: 14, color: '#334155', padding: '6px 0' }}>{viewingAppointment.appointmentTime}</div>
                    </div>
                    <div style={s.formGroup}>
                      <div style={s.label}>排队号</div>
                      <div style={{ fontSize: 14, color: '#334155', padding: '6px 0' }}>{viewingAppointment.queueNumber}</div>
                    </div>
                    <div style={s.formGroup}>
                      <div style={s.label}>登记日期</div>
                      <div style={{ fontSize: 14, color: '#334155', padding: '6px 0' }}>{viewingAppointment.registrationDate}</div>
                    </div>
                    <div style={{ ...s.formGroup, gridColumn: '1 / -1' }}>
                      <div style={s.label}>预约原因</div>
                      <div style={{ fontSize: 14, color: '#334155', padding: '6px 0' }}>{viewingAppointment.reason || '-'}</div>
                    </div>
                    <div style={{ ...s.formGroup, gridColumn: '1 / -1' }}>
                      <div style={s.label}>备注</div>
                      <div style={{ fontSize: 14, color: '#334155', padding: '6px 0' }}>{viewingAppointment.notes || '-'}</div>
                    </div>
                  </div>
                </div>
                <div style={s.modalFooter}>
                  <button style={s.btnCancel} onClick={closeModal}>关闭</button>
                </div>
              </>
            ) : (
              <>
                <div style={s.modalHeader}>
                  <div style={s.modalTitle}>新增预约</div>
                  <button style={s.modalClose} onClick={closeModal}><X size={18} /></button>
                </div>
                <div style={s.modalBody}>
                  {formErrors.length > 0 && (
                    <div style={s.errorBox}>
                      {formErrors.map((e, i) => (
                        <div key={i} style={{ fontSize: 12, color: '#dc2626' }}>• {e}</div>
                      ))}
                    </div>
                  )}
                  <div style={s.formGrid}>
                    {/* 患者 */}
                    <div style={s.formGroup}>
                      <label style={s.label}>患者<span style={s.required}>*</span></label>
                      <select
                        style={s.input}
                        value={formData.patientId}
                        onChange={e => handlePatientChange(e.target.value)}
                      >
                        <option value="">请选择患者</option>
                        {initialPatients.map(p => (
                          <option key={p.id} value={p.id}>{p.name}（{p.id}）</option>
                        ))}
                      </select>
                    </div>
                    {/* 检查项目 */}
                    <div style={s.formGroup}>
                      <label style={s.label}>检查项目<span style={s.required}>*</span></label>
                      <select
                        style={s.input}
                        value={formData.examItemId}
                        onChange={e => handleExamItemChange(e.target.value)}
                      >
                        <option value="">请选择检查项目</option>
                        {initialExamItems.map(item => (
                          <option key={item.id} value={item.id}>{item.name}（{item.category}）</option>
                        ))}
                      </select>
                    </div>
                    {/* 医生 */}
                    <div style={s.formGroup}>
                      <label style={s.label}>预约医生<span style={s.required}>*</span></label>
                      <select
                        style={s.input}
                        value={formData.doctorId}
                        onChange={e => handleDoctorChange(e.target.value)}
                      >
                        <option value="">请选择医生</option>
                        {initialUsers.filter(u => u.role === '医生').map(doc => (
                          <option key={doc.id} value={doc.id}>{doc.name}（{doc.department}）</option>
                        ))}
                      </select>
                    </div>
                    {/* 检查室 */}
                    <div style={s.formGroup}>
                      <label style={s.label}>检查室<span style={s.required}>*</span></label>
                      <select
                        style={s.input}
                        value={formData.examRoom}
                        onChange={e => handleField('examRoom', e.target.value)}
                      >
                        <option value="">请选择检查室</option>
                        {examRooms.map(room => (
                          <option key={room} value={room}>{room}</option>
                        ))}
                      </select>
                    </div>
                    {/* 预约日期 */}
                    <div style={s.formGroup}>
                      <label style={s.label}>预约日期<span style={s.required}>*</span></label>
                      <input
                        type="date"
                        style={s.input}
                        value={formData.appointmentDate}
                        onChange={e => handleField('appointmentDate', e.target.value)}
                      />
                    </div>
                    {/* 预约时段 */}
                    <div style={s.formGroup}>
                      <label style={s.label}>预约时段<span style={s.required}>*</span></label>
                      <select
                        style={s.input}
                        value={formData.appointmentTime}
                        onChange={e => handleField('appointmentTime', e.target.value)}
                      >
                        <option value="">请选择时段</option>
                        {timeSlots.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    {/* 排队号 */}
                    <div style={s.formGroup}>
                      <label style={s.label}>排队号</label>
                      <input
                        type="number"
                        style={s.input}
                        min={1}
                        value={formData.queueNumber}
                        onChange={e => handleField('queueNumber', parseInt(e.target.value) || 1)}
                      />
                    </div>
                    {/* 预约原因 */}
                    <div style={s.formGroup}>
                      <label style={s.label}>预约原因</label>
                      <input
                        style={s.input}
                        value={formData.reason}
                        onChange={e => handleField('reason', e.target.value)}
                        placeholder="如：胃溃疡复查、体检等"
                      />
                    </div>
                    {/* 备注 */}
                    <div style={{ ...s.formGroup, gridColumn: '1 / -1' }}>
                      <label style={s.label}>备注</label>
                      <textarea
                        style={s.textarea}
                        value={formData.notes}
                        onChange={e => handleField('notes', e.target.value)}
                        placeholder="其他补充说明..."
                      />
                    </div>
                  </div>
                </div>
                <div style={s.modalFooter}>
                  <button style={s.btnCancel} onClick={closeModal}>取消</button>
                  <button style={s.btnSubmit} onClick={handleSubmit}>确认预约</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
