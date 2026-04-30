// @ts-nocheck
// G003 超声RIS - 质量管理页面
import { useState } from 'react'
import { CheckCircle, AlertTriangle, Search, Filter, Download, TrendingUp } from 'lucide-react'

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
  tableWrap: {
    background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    background: '#f8fafc', padding: '12px 16px', textAlign: 'left',
    fontSize: 13, fontWeight: 600, color: '#475569', borderBottom: '1px solid #e2e8f0',
  },
  td: {
    padding: '14px 16px', fontSize: 13, color: '#475569', borderBottom: '1px solid #f1f5f9',
  },
  badge: {
    display: 'inline-flex', padding: '2px 10px', borderRadius: 20,
    fontSize: 12, fontWeight: 500,
  },
  statCard: {
    background: '#fff', borderRadius: 10, padding: 16, flex: 1,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', minWidth: 180,
  },
}

const qualityItems = [
  { id: 'QC001', patientName: '张三', examType: '腹部超声', examPart: '肝脏', checkDate: '2026-04-28', inspector: '李医生', device: 'US-001', score: 95, status: '合格' },
  { id: 'QC002', patientName: '李四', examType: '心脏超声', examPart: '心脏', checkDate: '2026-04-28', inspector: '王医生', device: 'US-002', score: 88, status: '合格' },
  { id: 'QC003', patientName: '王五', examType: '甲状腺超声', examPart: '甲状腺', checkDate: '2026-04-27', inspector: '张医生', device: 'US-001', score: 72, status: '待改进' },
  { id: 'QC004', patientName: '赵六', examType: '乳腺超声', examPart: '乳腺', checkDate: '2026-04-27', inspector: '李医生', device: 'US-003', score: 91, status: '合格' },
  { id: 'QC005', patientName: '钱七', examType: '血管超声', examPart: '颈部血管', checkDate: '2026-04-26', inspector: '王医生', device: 'US-002', score: 85, status: '合格' },
]

const statusColors: Record<string, { bg: string; color: string }> = {
  '合格': { bg: '#f0fdf4', color: '#22c55e' },
  '待改进': { bg: '#fff7ed', color: '#f97316' },
  '不合格': { bg: '#fef2f2', color: '#ef4444' },
}

export default function QCPage() {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('全部')

  const filtered = qualityItems.filter(item => {
    const matchSearch = item.patientName.includes(search) || item.examType.includes(search)
    const matchStatus = filterStatus === '全部' || item.status === filterStatus
    return matchSearch && matchStatus
  })

  const passRate = Math.round((qualityItems.filter(i => i.status === '合格').length / qualityItems.length) * 100)

  return (
    <div style={s.root}>
      <div style={s.header}>
        <h1 style={s.title}>质量控制</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ ...s.actionBtn, background: '#3b82f6', color: '#fff' }}>
            <TrendingUp size={14} /> 质控报告
          </button>
          <button style={{ ...s.actionBtn, background: '#fff', color: '#475569', border: '1px solid #e2e8f0' }}>
            <Download size={14} /> 导出
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        <div style={s.statCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <CheckCircle size={18} color="#22c55e" />
            <span style={{ fontSize: 13, color: '#64748b' }}>合格率</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#1a3a5c' }}>{passRate}%</div>
        </div>
        <div style={s.statCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <AlertTriangle size={18} color="#f97316" />
            <span style={{ fontSize: 13, color: '#64748b' }}>待改进</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#1a3a5c' }}>
            {qualityItems.filter(i => i.status === '待改进').length}
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <CheckCircle size={18} color="#3b82f6" />
            <span style={{ fontSize: 13, color: '#64748b' }}>总检查数</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#1a3a5c' }}>{qualityItems.length}</div>
        </div>
      </div>

      <div style={s.filterRow}>
        <Search size={14} color="#64748b" />
        <input style={s.searchInput} placeholder="搜索患者姓名/检查类型..." value={search} onChange={e => setSearch(e.target.value)} />
        <select style={s.filterBtn} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option>全部</option>
          <option>合格</option>
          <option>待改进</option>
          <option>不合格</option>
        </select>
      </div>

      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>质控ID</th>
              <th style={s.th}>患者姓名</th>
              <th style={s.th}>检查类型</th>
              <th style={s.th}>检查部位</th>
              <th style={s.th}>检查日期</th>
              <th style={s.th}>检查医生</th>
              <th style={s.th}>设备</th>
              <th style={s.th}>质量评分</th>
              <th style={s.th}>状态</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} style={{ cursor: 'pointer' }}>
                <td style={s.td}><span style={{ fontFamily: 'monospace', color: '#3b82f6' }}>{item.id}</span></td>
                <td style={{ ...s.td, fontWeight: 600, color: '#1a3a5c' }}>{item.patientName}</td>
                <td style={s.td}>{item.examType}</td>
                <td style={s.td}>{item.examPart}</td>
                <td style={s.td}>{item.checkDate}</td>
                <td style={s.td}>{item.inspector}</td>
                <td style={s.td}>{item.device}</td>
                <td style={s.td}>
                  <span style={{ fontWeight: 600, color: item.score >= 85 ? '#22c55e' : item.score >= 70 ? '#f97316' : '#ef4444' }}>
                    {item.score}
                  </span>
                </td>
                <td style={s.td}>
                  <span style={{ ...s.badge, background: statusColors[item.status]?.bg, color: statusColors[item.status]?.color }}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
