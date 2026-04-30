// @ts-nocheck
// G003 超声RIS - 检查执行页面
import { useState } from 'react'
import { Activity, Search, Play, Pause, CheckCircle, Clock, Monitor, FileText } from 'lucide-react'
import { mockExams } from '../data/initialData'

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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: 16,
  },
  card: {
    background: '#fff', borderRadius: 12, padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0',
  },
  cardHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: 16,
  },
  cardTitle: { fontSize: 15, fontWeight: 600, color: '#1a3a5c', margin: '0 0 4px 0' },
  cardSubtitle: { fontSize: 12, color: '#64748b', margin: 0 },
  cardRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '8px 0', borderBottom: '1px solid #f1f5f9',
  },
  cardLabel: { fontSize: 13, color: '#64748b' },
  cardValue: { fontSize: 13, color: '#1a3a5c', fontWeight: 500 },
  badge: {
    display: 'inline-flex', padding: '2px 10px', borderRadius: 20,
    fontSize: 12, fontWeight: 500,
  },
  statCard: {
    background: '#fff', borderRadius: 12, padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', flex: 1, minWidth: 180,
  },
  statLabel: { fontSize: 13, color: '#64748b', marginBottom: 8 },
  statValue: { fontSize: 28, fontWeight: 700, color: '#1a3a5c' },
}

const statusColors: Record<string, { bg: string; color: string }> = {
  '待检查': { bg: '#fff7ed', color: '#f97316' },
  '检查中': { bg: '#eff6ff', color: '#3b82f6' },
  '已完成': { bg: '#f0fdf4', color: '#22c55e' },
  '已报告': { bg: '#f0fdfa', color: '#14b8a6' },
  '已取消': { bg: '#fef2f2', color: '#ef4444' },
}

export default function ExamPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('全部')
  const exams = mockExams

  const filtered = exams.filter(e => {
    const matchSearch = e.patientName.includes(search) || e.examType.includes(search)
    const matchStatus = statusFilter === '全部' || e.status === statusFilter
    return matchSearch && matchStatus
  })

  const stats = {
    total: exams.length,
    pending: exams.filter(e => e.status === '待检查').length,
    inProgress: exams.filter(e => e.status === '检查中').length,
    completed: exams.filter(e => e.status === '已完成' || e.status === '已报告').length,
  }

  return (
    <div style={s.root}>
      <div style={s.header}>
        <h1 style={s.title}>检查执行</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ ...s.actionBtn, background: '#3b82f6', color: '#fff' }}>
            <Activity size={14} /> 开始检查
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <div style={s.statCard}>
          <div style={s.statLabel}>总检查数</div>
          <div style={s.statValue}>{stats.total}</div>
        </div>
        <div style={s.statCard}>
          <div style={s.statLabel}>待检查</div>
          <div style={{ ...s.statValue, color: '#f97316' }}>{stats.pending}</div>
        </div>
        <div style={s.statCard}>
          <div style={s.statLabel}>检查中</div>
          <div style={{ ...s.statValue, color: '#3b82f6' }}>{stats.inProgress}</div>
        </div>
        <div style={s.statCard}>
          <div style={s.statLabel}>已完成</div>
          <div style={{ ...s.statValue, color: '#22c55e' }}>{stats.completed}</div>
        </div>
      </div>

      <div style={s.filterRow}>
        <Search size={14} color="#64748b" />
        <input style={s.searchInput} placeholder="搜索患者姓名/检查类型..." value={search} onChange={e => setSearch(e.target.value)} />
        <select style={s.filterBtn} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option>全部</option>
          <option>待检查</option>
          <option>检查中</option>
          <option>已完成</option>
          <option>已报告</option>
        </select>
      </div>

      <div style={s.grid}>
        {filtered.map(e => (
          <div key={e.id} style={s.card}>
            <div style={s.cardHeader}>
              <div>
                <h3 style={s.cardTitle}>{e.patientName}</h3>
                <p style={s.cardSubtitle}>ID: {e.id}</p>
              </div>
              <span style={{ ...s.badge, background: statusColors[e.status]?.bg, color: statusColors[e.status]?.color }}>
                {e.status}
              </span>
            </div>
            <div style={s.cardRow}>
              <span style={s.cardLabel}>检查类型</span>
              <span style={s.cardValue}>{e.examType}</span>
            </div>
            <div style={s.cardRow}>
              <span style={s.cardLabel}>检查部位</span>
              <span style={s.cardValue}>{e.examSubtype}</span>
            </div>
            <div style={s.cardRow}>
              <span style={s.cardLabel}>检查医生</span>
              <span style={s.cardValue}>{e.doctor}</span>
            </div>
            <div style={s.cardRow}>
              <span style={s.cardLabel}>设备</span>
              <span style={s.cardValue}>{e.device}</span>
            </div>
            <div style={{ ...s.cardRow, borderBottom: 'none' }}>
              <span style={s.cardLabel}>检查时间</span>
              <span style={s.cardValue}>{e.appointmentTime}</span>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              {e.status === '待检查' && (
                <button style={{ ...s.actionBtn, background: '#3b82f6', color: '#fff', flex: 1 }}>
                  <Play size={14} /> 开始
                </button>
              )}
              {e.status === '检查中' && (
                <button style={{ ...s.actionBtn, background: '#22c55e', color: '#fff', flex: 1 }}>
                  <CheckCircle size={14} /> 完成
                </button>
              )}
              <button style={{ ...s.actionBtn, background: '#fff', color: '#475569', border: '1px solid #e2e8f0', flex: 1 }}>
                <FileText size={14} /> 报告
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
