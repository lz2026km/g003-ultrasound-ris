// @ts-nocheck
// G003 超声RIS - 感染管理页面
import { useState } from 'react'
import { ShieldAlert, Search, Plus, Filter, Download, AlertTriangle } from 'lucide-react'

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
  purple: { background: '#f5f3ff', color: '#8b5cf6' },
}

const mockInfections = [
  { id: 'IN001', patientId: 'P20240001', patientName: '张三', infectionType: '院内感染', pathogen: '金黄色葡萄球菌', location: '手术切口', level: '医院感染', status: '隔离中', time: '2024-03-15 09:30' },
  { id: 'IN002', patientId: 'P20240002', patientName: '李四', infectionType: '社区感染', pathogen: '流感病毒', location: '呼吸道', level: '普通', status: '治疗中', time: '2024-03-15 10:15' },
  { id: 'IN003', patientId: 'P20240003', patientName: '王五', infectionType: '院内感染', pathogen: '大肠杆菌', location: '泌尿道', level: '医院感染', status: '待出院', time: '2024-03-15 11:00' },
  { id: 'IN004', patientId: 'P20240004', patientName: '赵六', infectionType: '机会感染', pathogen: '白色念珠菌', location: '口腔', level: '普通', status: '观察中', time: '2024-03-15 14:20' },
]

export default function InfectionPage() {
  const [search, setSearch] = useState('')

  const filtered = mockInfections.filter(r =>
    r.patientName.includes(search) || r.patientId.includes(search) || r.pathogen.includes(search)
  )

  const getLevelStyle = (level: string) => {
    if (level === '医院感染') return s.red
    return s.orange
  }

  const getStatusStyle = (status: string) => {
    if (status === '隔离中') return s.red
    if (status === '治疗中') return s.blue
    if (status === '待出院') return s.green
    return s.purple
  }

  return (
    <div style={s.root}>
      <div style={s.header}>
        <h1 style={s.title}>感染管理</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ ...s.actionBtn, background: '#ef4444', color: '#fff' }}>
            <Plus size={14} /> 新增感染
          </button>
          <button style={{ ...s.actionBtn, background: '#fff', color: '#475569', border: '1px solid #e2e8f0' }}>
            <Download size={14} /> 导出
          </button>
        </div>
      </div>

      <div style={s.filterRow}>
        <Search size={14} color="#64748b" />
        <input style={s.searchInput} placeholder="搜索患者姓名/ID/病原体..." value={search} onChange={e => setSearch(e.target.value)} />
        <select style={s.filterBtn}>
          <option>全部类型</option>
          <option>院内感染</option>
          <option>社区感染</option>
          <option>机会感染</option>
        </select>
        <select style={s.filterBtn}>
          <option>全部级别</option>
          <option>医院感染</option>
          <option>普通</option>
        </select>
        <select style={s.filterBtn}>
          <option>全部状态</option>
          <option>隔离中</option>
          <option>治疗中</option>
          <option>观察中</option>
          <option>待出院</option>
        </select>
      </div>

      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>记录ID</th>
              <th style={s.th}>患者ID</th>
              <th style={s.th}>患者姓名</th>
              <th style={s.th}>感染类型</th>
              <th style={s.th}>病原体</th>
              <th style={s.th}>感染部位</th>
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
                <td style={s.td}><ShieldAlert size={14} style={{ marginRight: 4 }} />{r.infectionType}</td>
                <td style={s.td}><span style={{ color: '#64748b' }}>{r.pathogen}</span></td>
                <td style={s.td}>{r.location}</td>
                <td style={s.td}><span style={{ ...s.badge, ...getLevelStyle(r.level) }}><AlertTriangle size={12} style={{ marginRight: 4 }} />{r.level}</span></td>
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
