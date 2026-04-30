// @ts-nocheck
// G003 超声RIS - 患者管理页面
import { useState } from 'react'
import { Users, Search, Plus, UserPlus, Filter, Download } from 'lucide-react'
import { mockPatients } from '../data/initialData'

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

export default function PatientPage() {
  const [search, setSearch] = useState('')
  const patients = mockPatients

  const filtered = patients.filter(p =>
    p.name.includes(search) || p.id.includes(search) || p.phone.includes(search)
  )

  const getTypeStyle = (type: string) => {
    if (type === '门诊') return s.blue
    if (type === '住院') return s.purple
    return s.green
  }

  return (
    <div style={s.root}>
      <div style={s.header}>
        <h1 style={s.title}>患者管理</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ ...s.actionBtn, background: '#3b82f6', color: '#fff' }}>
            <UserPlus size={14} /> 新增患者
          </button>
          <button style={{ ...s.actionBtn, background: '#fff', color: '#475569', border: '1px solid #e2e8f0' }}>
            <Download size={14} /> 导出
          </button>
        </div>
      </div>

      <div style={s.filterRow}>
        <Search size={14} color="#64748b" />
        <input style={s.searchInput} placeholder="搜索患者姓名/ID/电话..." value={search} onChange={e => setSearch(e.target.value)} />
        <select style={s.filterBtn}>
          <option>全部类型</option>
          <option>门诊</option>
          <option>住院</option>
          <option>体检</option>
        </select>
        <select style={s.filterBtn}>
          <option>全部性别</option>
          <option>男</option>
          <option>女</option>
        </select>
      </div>

      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>患者ID</th>
              <th style={s.th}>姓名</th>
              <th style={s.th}>性别</th>
              <th style={s.th}>年龄</th>
              <th style={s.th}>电话</th>
              <th style={s.th}>身份证号</th>
              <th style={s.th}>患者类型</th>
              <th style={s.th}>建档日期</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} style={{ cursor: 'pointer' }}>
                <td style={s.td}><span style={{ fontFamily: 'monospace', color: '#3b82f6' }}>{p.id}</span></td>
                <td style={{ ...s.td, fontWeight: 600, color: '#1a3a5c' }}>{p.name}</td>
                <td style={s.td}>{p.gender}</td>
                <td style={s.td}>{p.age}</td>
                <td style={s.td}>{p.phone}</td>
                <td style={s.td}><span style={{ fontFamily: 'monospace', fontSize: 12 }}>{p.idCard}</span></td>
                <td style={s.td}><span style={{ ...s.badge, ...getTypeStyle(p.patientType) }}>{p.patientType}</span></td>
                <td style={s.td}>{p.registrationDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
