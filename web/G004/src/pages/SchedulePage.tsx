// ============================================================
// G004 内镜管理系统 - 排班管理页面
// ============================================================
import { useState, useMemo } from 'react'
import {
  Search, Plus, Edit2, Trash2, X, Calendar, Clock,
  AlertTriangle, CheckCircle, Info, User, MapPin
} from 'lucide-react'
import type { DoctorSchedule, ExamRoom } from '../types'
import { initialDoctorSchedules, initialExamRooms, initialUsers } from '../data/initialData'

// ---------- 样式定义 ----------
const s: Record<string, React.CSSProperties> = {
  pageHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 18, fontWeight: 700, color: '#1a3a5c' },
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
  badgeConflict: { background: '#fee2e2', color: '#dc2626' },
  badgeOk: { background: '#dcfce7', color: '#166534' },
  actions: { display: 'flex', gap: 6 },
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: '#fff', borderRadius: 12, width: 520, maxHeight: '90vh',
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
  },
  btnSave: {
    padding: '8px 16px', borderRadius: 6, border: 'none',
    background: '#1a3a5c', color: '#fff', fontSize: 13, cursor: 'pointer',
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
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 16,
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
}

// ---------- 辅助函数 ----------
const weekdays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
const shiftTypeLabels: Record<string, string> = {
  '上午': '上午',
  '下午': '下午',
  '全天': '全天',
  '夜班': '夜班',
}

// 时间冲突检测
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

    // 检查班次类型冲突
    if (shiftType === '全天' || sch.shiftType === '全天') continue
    if (shiftType === '夜班' || sch.shiftType === '夜班') continue

    // 时间重叠检测
    const existStart = sch.startTime
    const existEnd = sch.endTime
    if (!(endTime <= existStart || startTime >= existEnd)) {
      return sch
    }
  }
  return null
}

// 检查同一诊室同一时段是否已被占用
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

    const existStart = sch.startTime
    const existEnd = sch.endTime
    if (!(endTime <= existStart || startTime >= existEnd)) {
      return sch
    }
  }
  return null
}

// 生成ID
function generateId(prefix: string): string {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).substr(2, 4)}`
}

// 获取医生列表
const doctors = initialUsers.filter(u => u.role === '医生')

// ---------- 组件 ----------
export default function SchedulePage() {
  const [schedules, setSchedules] = useState<DoctorSchedule[]>(initialDoctorSchedules)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [filterWeekday, setFilterWeekday] = useState<number | ''>('')
  const [filterDoctor, setFilterDoctor] = useState<string>('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [conflicts, setConflicts] = useState<{ doctor?: DoctorSchedule; room?: DoctorSchedule } | null>(null)

  // 表单状态
  const [form, setForm] = useState({
    doctorId: '',
    examRoomId: '',
    weekday: 1,
    shiftType: '上午' as '上午' | '下午' | '全天' | '夜班',
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
    return {
      totalSchedules: active.length,
      totalSlots,
      usedSlots,
      conflictCount,
    }
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
      shiftType: sch.shiftType,
      startTime: sch.startTime,
      endTime: sch.endTime,
      maxAppointments: sch.maxAppointments,
    })
    setConflicts(null)
    setShowModal(true)
  }

  // 班次变更时更新默认时间
  const handleShiftTypeChange = (type: '上午' | '下午' | '全天' | '夜班') => {
    const times: Record<string, { start: string; end: string }> = {
      '上午': { start: '08:00', end: '12:00' },
      '下午': { start: '14:00', end: '18:00' },
      '全天': { start: '08:00', end: '18:00' },
      '夜班': { start: '18:00', end: '22:00' },
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

  // 保存
  const handleSave = () => {
    // 冲突检测
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
      // 更新
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
      // 新增
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

  // 删除
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

  // 获取班次样式
  const getShiftBadgeStyle = (shiftType: string): React.CSSProperties => {
    const map: Record<string, React.CSSProperties> = {
      '上午': s.badgeMorning,
      '下午': s.badgeAfternoon,
      '全天': s.badgeFullDay,
      '夜班': s.badgeNight,
    }
    return { ...s.badge, ...map[shiftType] }
  }

  return (
    <div style={{ padding: 24 }}>
      {/* 头部 */}
      <div style={s.pageHeader}>
        <div>
          <h2 style={s.title}>医生排班管理</h2>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
            管理内镜中心医生出诊排班与诊室资源分配
          </div>
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
      </div>

      {/* 工具栏 */}
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
        <button style={s.btnPrimary} onClick={openAddModal}>
          <Plus size={16} /> 新增排班
        </button>
      </div>

      {/* 按周分组显示 */}
      {weekdays.map((dayName, idx) => {
        const dayNum = idx + 1
        const daySchedules = grouped[dayNum]
        return (
          <div key={dayNum} style={{ marginBottom: 20 }}>
            <div style={s.weekdayHeader}>
              <Calendar size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              {dayName} ({daySchedules.length} 条排班)
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
                            {shiftTypeLabels[sch.shiftType]}
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
                              style={s.btnIcon}
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

      {/* 新增/编辑弹窗 */}
      {showModal && (
        <div style={s.overlay} onClick={() => setShowModal(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h3 style={s.modalTitle}>{editingId ? '编辑排班' : '新增排班'}</h3>
              <button style={s.closeBtn} onClick={() => setShowModal(false)}>
                <X size={16} />
              </button>
            </div>

            <div style={s.modalBody}>
              {/* 冲突提示 */}
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

              {/* 冲突检测按钮 */}
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
    </div>
  )
}
