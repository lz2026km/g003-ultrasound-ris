// @ts-nocheck
// G003 超声RIS - 危急值管理页面
import { useState } from 'react'
import { AlertTriangle, Search, Plus, Filter, Download, Clock } from 'lucide-react'

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
  red: { background: '#fef2f2', color: '#ef4444' },
  orange: { background: '#fff7ed', color: '#f97316' },
  green: { background: '#f0fdf4', color: '#22c55e' },
  blue: { background: '#eff6ff', color: '#3b82f6' },
}

const mockCriticalValues = [
  { id: 'CV001', patientId: 'P20240001', patientName: '张三', item: '肝功能', value: 'ALT 500U/L', level: '危急', status: '待处理', time: '2024-03-15 09:30' },
  { id: 'CV002', patientId: 'P20240002', patientName: '李四', item: '肾功能', value: '肌酐 850μmol/L', level: '危急', status: '已通知', time: '2024-03-15 10:15' },
  { id: 'CV003', patientId: 'P20240003', patientName: '王五', item: '血常规', value: 'PLT 20×10⁹/L', level: '危急', status: '已处理', time: '2024-03-15 11:00' },
  { id: 'CV004', patientId: 'P20240004', patientName: '赵六', item: '电解质', value: 'K+ 6.5mmol/L', level: '警告', status: '待处理', time: '2024-03-15 14:20' },
]

export default function CriticalValuePage() {
  const [search, setSearch] = useState('')

  const filtered = mockCriticalValues.filter(r =>
    r.patientName.includes(search) || r.patientId.includes(search) || r.item.includes(search)
  )

  const getLevelStyle = (level: string) => {
    if (level === '危急') return s.red
    return s.orange
  }

  const getStatusStyle = (status: string) => {
    if (status === '已处理') return s.green
    if (status === '已通知') return s.blue
    return s.orange
  }

  return (
    <div style={s.root}>
      <div style={s.header}>
        <h1 style={s.title}>危急值管理</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ ...s.actionBtn, background: '#ef4444', color: '#fff' }}>
            <Plus size={14} /> 新增危急值
          </button>
          <button style={{ ...s.actionBtn, background: '#fff', color: '#475569', border: '1px solid #e2e8f0' }}>
            <Download size={14} /> 导出
          </button>
        </div>
      </div>

      <div style={s.filterRow}>
        <Search size={14} color="#64748b" />
        <input style={s.searchInput} placeholder="搜索患者姓名/ID/检验项目..." value={search} onChange={e => setSearch(e.target.value)} />
        <select style={s.filterBtn}>
          <option>全部级别</option>
          <option>危急</option>
          <option>警告</option>
        </select>
        <select style={s.filterBtn}>
          <option>全部状态</option>
          <option>待处理</option>
          <option>已通知</option>
          <option>已处理</option>
        </select>
      </div>

      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>记录ID</th>
              <th style={s.th}>患者ID</th>
              <th style={s.th}>患者姓名</th>
              <th style={s.th}>检验项目</th>
              <th style={s.th}>检验值</th>
              <th style={s.th}>级别</th>
              <th style={s.th}>状态</th>
              <th style={s.th}>时间</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} style={{ cursor: 'pointer' }}>
                <td style={s.td}><span style={{ fontFamily: 'monospace', color: '#ef4444' }}>{r.id}</span></td>
                <td style={s.td}><span style={{ fontFamily: 'monospace' }}>{r.patientId}</span></td>
                <td style={{ ...s.td, fontWeight: 600, color: '#1a3a5c' }}>{r.patientName}</td>
                <td style={s.td}>{r.item}</td>
                <td style={s.td}><span style={{ fontWeight: 600, color: '#ef4444' }}>{r.value}</span></td>
                <td style={s.td}><span style={{ ...s.badge, ...getLevelStyle(r.level) }}><AlertTriangle size={12} style={{ marginRight: 4 }} />{r.level}</span></td>
                <td style={s.td}><span style={{ ...s.badge, ...getStatusStyle(r.status) }}>{r.status}</span></td>
                <td style={s.td}><Clock size={12} style={{ marginRight: 4 }} />{r.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
