// @ts-nocheck
// G003 超声RIS - 会诊管理页面
import { useState } from 'react'
import { Stethoscope, Search, Plus, Filter, Download, User } from 'lucide-react'

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

const mockConsultations = [
  { id: 'CS001', patientId: 'P20240001', patientName: '张三', applyDept: '心内科', targetDept: '超声科', applyDoctor: '王医生', type: '普通会诊', status: '待回复', time: '2024-03-15 09:30' },
  { id: 'CS002', patientId: 'P20240002', patientName: '李四', applyDept: '消化科', targetDept: '超声科', applyDoctor: '赵医生', type: '急诊会诊', status: '进行中', time: '2024-03-15 10:15' },
  { id: 'CS003', patientId: 'P20240003', patientName: '王五', applyDept: '普外科', targetDept: '超声科', applyDoctor: '孙医生', type: '普通会诊', status: '已完成', time: '2024-03-15 11:00' },
  { id: 'CS004', patientId: 'P20240004', patientName: '赵六', applyDept: '肿瘤科', targetDept: '超声科', applyDoctor: '周医生', type: '多学科会诊', status: '待安排', time: '2024-03-15 14:20' },
]

export default function ConsultationPage() {
  const [search, setSearch] = useState('')

  const filtered = mockConsultations.filter(r =>
    r.patientName.includes(search) || r.patientId.includes(search) || r.applyDoctor.includes(search)
  )

  const getStatusStyle = (status: string) => {
    if (status === '已完成') return s.green
    if (status === '进行中') return s.blue
    if (status === '待安排') return s.purple
    return s.orange
  }

  return (
    <div style={s.root}>
      <div style={s.header}>
        <h1 style={s.title}>会诊管理</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ ...s.actionBtn, background: '#3b82f6', color: '#fff' }}>
            <Plus size={14} /> 新建会诊
          </button>
          <button style={{ ...s.actionBtn, background: '#fff', color: '#475569', border: '1px solid #e2e8f0' }}>
            <Download size={14} /> 导出
          </button>
        </div>
      </div>

      <div style={s.filterRow}>
        <Search size={14} color="#64748b" />
        <input style={s.searchInput} placeholder="搜索患者姓名/ID/申请医生..." value={search} onChange={e => setSearch(e.target.value)} />
        <select style={s.filterBtn}>
          <option>全部类型</option>
          <option>普通会诊</option>
          <option>急诊会诊</option>
          <option>多学科会诊</option>
        </select>
        <select style={s.filterBtn}>
          <option>全部状态</option>
          <option>待回复</option>
          <option>待安排</option>
          <option>进行中</option>
          <option>已完成</option>
        </select>
      </div>

      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>会诊ID</th>
              <th style={s.th}>患者ID</th>
              <th style={s.th}>患者姓名</th>
              <th style={s.th}>申请科室</th>
              <th style={s.th}>会诊科室</th>
              <th style={s.th}>申请医生</th>
              <th style={s.th}>会诊类型</th>
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
                <td style={s.td}>{r.applyDept}</td>
                <td style={s.td}><Stethoscope size={14} style={{ marginRight: 4 }} />{r.targetDept}</td>
                <td style={s.td}><User size={14} style={{ marginRight: 4 }} />{r.applyDoctor}</td>
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
