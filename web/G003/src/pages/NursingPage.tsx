// @ts-nocheck
// G003 超声RIS - 护理管理页面
import { useState } from 'react'
import { Activity, Search, Plus, Filter, Download, User } from 'lucide-react'

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
  blue: { background: '#eff6ff', color: '#3b82f6' },
  green: { background: '#f0fdf4', color: '#22c55e' },
  orange: { background: '#fff7ed', color: '#f97316' },
  purple: { background: '#f5f3ff', color: '#8b5cf6' },
}

const mockNursingRecords = [
  { id: 'NR001', patientId: 'P20240001', patientName: '张三', nurse: '李护士', type: '日常护理', status: '已完成', time: '2024-03-15 09:30' },
  { id: 'NR002', patientId: 'P20240002', patientName: '李四', nurse: '王护士', type: '术后护理', status: '进行中', time: '2024-03-15 10:15' },
  { id: 'NR003', patientId: 'P20240003', patientName: '王五', nurse: '赵护士', type: '重症监护', status: '待处理', time: '2024-03-15 11:00' },
  { id: 'NR004', patientId: 'P20240004', patientName: '赵六', nurse: '李护士', type: '日常护理', status: '已完成', time: '2024-03-15 14:20' },
]

export default function NursingPage() {
  const [search, setSearch] = useState('')

  const filtered = mockNursingRecords.filter(r =>
    r.patientName.includes(search) || r.patientId.includes(search) || r.nurse.includes(search)
  )

  const getStatusStyle = (status: string) => {
    if (status === '已完成') return s.green
    if (status === '进行中') return s.blue
    return s.orange
  }

  return (
    <div style={s.root}>
      <div style={s.header}>
        <h1 style={s.title}>护理管理</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ ...s.actionBtn, background: '#3b82f6', color: '#fff' }}>
            <Plus size={14} /> 新增记录
          </button>
          <button style={{ ...s.actionBtn, background: '#fff', color: '#475569', border: '1px solid #e2e8f0' }}>
            <Download size={14} /> 导出
          </button>
        </div>
      </div>

      <div style={s.filterRow}>
        <Search size={14} color="#64748b" />
        <input style={s.searchInput} placeholder="搜索患者姓名/ID/护士..." value={search} onChange={e => setSearch(e.target.value)} />
        <select style={s.filterBtn}>
          <option>全部类型</option>
          <option>日常护理</option>
          <option>术后护理</option>
          <option>重症监护</option>
        </select>
        <select style={s.filterBtn}>
          <option>全部状态</option>
          <option>待处理</option>
          <option>进行中</option>
          <option>已完成</option>
        </select>
      </div>

      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>记录ID</th>
              <th style={s.th}>患者ID</th>
              <th style={s.th}>患者姓名</th>
              <th style={s.th}>负责护士</th>
              <th style={s.th}>护理类型</th>
              <th style={s.th}>状态</th>
              <th style={s.th}>时间</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} style={{ cursor: 'pointer' }}>
                <td style={s.td}><span style={{ fontFamily: 'monospace', color: '#3b82f6' }}>{r.id}</span></td>
                <td style={s.td}><span style={{ fontFamily: 'monospace' }}>{r.patientId}</span></td>
                <td style={{ ...s.td, fontWeight: 600, color: '#1a3a5c' }}>{r.patientName}</td>
                <td style={s.td}><User size={14} style={{ marginRight: 4 }} />{r.nurse}</td>
                <td style={s.td}>{r.type}</td>
                <td style={s.td}><span style={{ ...s.badge, ...getStatusStyle(r.status) }}>{r.status}</span></td>
                <td style={s.td}>{r.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
