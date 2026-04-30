// @ts-nocheck
// G003 超声RIS - 工作列表页面
import { useState } from 'react'
import { List, Search, Filter, Clock, User, Monitor, CheckCircle, AlertCircle } from 'lucide-react'

const mockWorklist = [
  { id: 'W001', patientId: 'P001', patientName: '张三', examType: '腹部超声', examSubtype: '肝脏', priority: 'STAT', status: 'Pending', appointmentTime: '09:00', doctor: '李明辉', device: '彩超仪 A' },
  { id: 'W002', patientId: 'P002', patientName: '李红', examType: '心血管超声', examSubtype: '心脏', priority: 'Urgent', status: 'In Progress', appointmentTime: '09:30', doctor: '王晓燕', device: '彩超仪 B' },
  { id: 'W003', patientId: 'P003', patientName: '王五', examType: '浅表器官超声', examSubtype: '甲状腺', priority: 'Normal', status: 'Pending', appointmentTime: '10:00', doctor: '张伟', device: '彩超仪 A' },
  { id: 'W004', patientId: 'P004', patientName: '赵丽', examType: '妇产科超声', examSubtype: '产科', priority: 'Normal', status: 'Completed', appointmentTime: '10:30', doctor: '李明辉', device: '彩超仪 B' },
  { id: 'W005', patientId: 'P005', patientName: '孙伟', examType: '心血管超声', examSubtype: '颈部血管', priority: 'Low', status: 'Pending', appointmentTime: '11:00', doctor: '王晓燕', device: '彩超仪 A' },
]

const s: Record<string, React.CSSProperties> = {
  root: { padding: 0 },
  header: { marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 700, color: '#1a3a5c', margin: 0 },
  filterRow: {
    display: 'flex', gap: 12, alignItems: 'center', background: '#f8fafc',
    padding: '12px 16px', borderRadius: 10, marginBottom: 20, flexWrap: 'wrap' as const,
  },
  searchInput: {
    flex: 1, minWidth: 200, padding: '8px 12px', borderRadius: 6,
    border: '1px solid #e2e8f0', fontSize: 13, color: '#1a3a5c',
    background: '#fff', outline: 'none', minHeight: 40,
  },
  filterBtn: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
    borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff',
    cursor: 'pointer', fontSize: 13, color: '#64748b', minHeight: 40,
  },
  actionBtn: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
    borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13,
    fontWeight: 500, minHeight: 40,
  },
  listContainer: { display: 'flex', flexDirection: 'column' as const, gap: 12 },
  listItem: {
    background: '#fff', borderRadius: 12, padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0',
    display: 'flex', gap: 20, alignItems: 'center' as const,
  },
  listItemLeft: { display: 'flex', alignItems: 'center' as const, gap: 12, flex: 1 },
  priorityDot: { width: 10, height: 10, borderRadius: '50%', flexShrink: 0 },
  listItemContent: { flex: 1 },
  listItemTitle: { fontSize: 15, fontWeight: 600, color: '#1a3a5c', margin: '0 0 4px 0' },
  listItemMeta: { fontSize: 13, color: '#64748b', margin: 0, display: 'flex', gap: 16 },
  listItemRight: { display: 'flex', alignItems: 'center' as const, gap: 12 },
  badge: {
    display: 'inline-flex', padding: '4px 12px', borderRadius: 20,
    fontSize: 12, fontWeight: 500,
  },
  statCard: {
    background: '#fff', borderRadius: 12, padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', flex: 1, minWidth: 180,
  },
  statLabel: { fontSize: 13, color: '#64748b', marginBottom: 8 },
  statValue: { fontSize: 28, fontWeight: 700, color: '#1a3a5c' },
}

const priorityColors: Record<string, string> = {
  'STAT': '#ef4444',
  'Urgent': '#f97316',
  'Normal': '#3b82f6',
  'Low': '#94a3b8',
}

const statusColors: Record<string, { bg: string; color: string }> = {
  'Pending': { bg: '#fff7ed', color: '#f97316' },
  'In Progress': { bg: '#eff6ff', color: '#3b82f6' },
  'Completed': { bg: '#f0fdf4', color: '#22c55e' },
  'Critical': { bg: '#fef2f2', color: '#ef4444' },
}

export default function WorklistPage() {
  const [search, setSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('全部')
  const worklist = mockWorklist

  const filtered = worklist.filter(w => {
    const matchSearch = w.patientName.includes(search) || w.examType.includes(search)
    const matchPriority = priorityFilter === '全部' || w.priority === priorityFilter
    return matchSearch && matchPriority
  })

  const stats = {
    total: worklist.length,
    pending: worklist.filter(w => w.status === 'Pending').length,
    inProgress: worklist.filter(w => w.status === 'In Progress').length,
    completed: worklist.filter(w => w.status === 'Completed').length,
    critical: worklist.filter(w => w.priority === 'STAT' || w.priority === 'Urgent').length,
  }

  return (
    <div style={s.root}>
      <div style={s.header}>
        <h1 style={s.title}>工作列表</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ ...s.actionBtn, background: '#3b82f6', color: '#fff' }}>
            <List size={14} /> 刷新
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <div style={s.statCard}>
          <div style={s.statLabel}>待处理</div>
          <div style={{ ...s.statValue, color: '#f97316' }}>{stats.pending}</div>
        </div>
        <div style={s.statCard}>
          <div style={s.statLabel}>进行中</div>
          <div style={{ ...s.statValue, color: '#3b82f6' }}>{stats.inProgress}</div>
        </div>
        <div style={s.statCard}>
          <div style={s.statLabel}>已完成</div>
          <div style={{ ...s.statValue, color: '#22c55e' }}>{stats.completed}</div>
        </div>
        <div style={s.statCard}>
          <div style={s.statLabel}>紧急/STAT</div>
          <div style={{ ...s.statValue, color: '#ef4444' }}>{stats.critical}</div>
        </div>
      </div>

      <div style={s.filterRow}>
        <Search size={14} color="#64748b" />
        <input style={s.searchInput} placeholder="搜索患者姓名/检查类型..." value={search} onChange={e => setSearch(e.target.value)} />
        <select style={s.filterBtn} value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
          <option>全部</option>
          <option>STAT</option>
          <option>Urgent</option>
          <option>Normal</option>
          <option>Low</option>
        </select>
        <select style={s.filterBtn}>
          <option>全部状态</option>
          <option>Pending</option>
          <option>In Progress</option>
          <option>Completed</option>
        </select>
        <select style={s.filterBtn}>
          <option>全部设备</option>
        </select>
      </div>

      <div style={s.listContainer}>
        {filtered.map(w => (
          <div key={w.id} style={s.listItem}>
            <div style={s.listItemLeft}>
              <div style={{ ...s.priorityDot, background: priorityColors[w.priority] || '#94a3b8' }} />
              <div style={s.listItemContent}>
                <h3 style={s.listItemTitle}>
                  {w.patientName}
                  {w.priority === 'STAT' && <AlertCircle size={14} color="#ef4444" style={{ marginLeft: 8, verticalAlign: 'middle' }} />}
                </h3>
                <p style={s.listItemMeta}>
                  <span>{w.examType} - {w.examSubtype}</span>
                  <span><Clock size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />{w.scheduledTime}</span>
                  <span><User size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />{w.doctor}</span>
                  <span><Monitor size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />{w.device}</span>
                </p>
              </div>
            </div>
            <div style={s.listItemRight}>
              <span style={{ ...s.badge, background: statusColors[w.status]?.bg, color: statusColors[w.status]?.color }}>
                {w.status}
              </span>
              <span style={{ fontSize: 12, color: '#64748b', padding: '4px 8px', background: '#f1f5f9', borderRadius: 4 }}>
                {w.priority}
              </span>
              {w.status === 'Pending' && (
                <button style={{ ...s.actionBtn, padding: '6px 12px', background: '#3b82f6', color: '#fff' }}>
                  开始
                </button>
              )}
              {w.status === 'In Progress' && (
                <button style={{ ...s.actionBtn, padding: '6px 12px', background: '#22c55e', color: '#fff' }}>
                  <CheckCircle size={14} /> 完成
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
