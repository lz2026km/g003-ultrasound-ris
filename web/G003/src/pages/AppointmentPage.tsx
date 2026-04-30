// @ts-nocheck
// G003 超声RIS - 预约管理页面
import { useState } from 'react'
import { CalendarClock, Search, Plus, Filter, Download, Clock } from 'lucide-react'
import { mockAppointments, examTypeOptions } from '../data/initialData'

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
}

const statusColors: Record<string, { bg: string; color: string }> = {
  '待确认': { bg: '#fff7ed', color: '#f97316' },
  '已确认': { bg: '#eff6ff', color: '#3b82f6' },
  '已到检': { bg: '#f0fdf4', color: '#22c55e' },
  '已完成': { bg: '#f0fdfa', color: '#14b8a6' },
  '已取消': { bg: '#fef2f2', color: '#ef4444' },
  '逾期': { bg: '#f5f3ff', color: '#8b5cf6' },
}

export default function AppointmentPage() {
  const [search, setSearch] = useState('')
  const appointments = mockAppointments

  const filtered = appointments.filter(a =>
    a.patientName.includes(search) || a.examType.includes(search)
  )

  return (
    <div style={s.root}>
      <div style={s.header}>
        <h1 style={s.title}>预约管理</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ ...s.actionBtn, background: '#3b82f6', color: '#fff' }}>
            <Plus size={14} /> 新增预约
          </button>
          <button style={{ ...s.actionBtn, background: '#fff', color: '#475569', border: '1px solid #e2e8f0' }}>
            <Download size={14} /> 导出
          </button>
        </div>
      </div>

      <div style={s.filterRow}>
        <Search size={14} color="#64748b" />
        <input style={s.searchInput} placeholder="搜索患者姓名/检查类型..." value={search} onChange={e => setSearch(e.target.value)} />
        <select style={s.filterBtn}>
          <option>全部状态</option>
          <option>待确认</option>
          <option>已确认</option>
          <option>已到检</option>
          <option>已完成</option>
        </select>
        <select style={s.filterBtn}>
          <option>全部类型</option>
          {examTypeOptions.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>

      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>预约ID</th>
              <th style={s.th}>患者姓名</th>
              <th style={s.th}>检查类型</th>
              <th style={s.th}>检查部位</th>
              <th style={s.th}>预约日期</th>
              <th style={s.th}>预约时间</th>
              <th style={s.th}>接诊医生</th>
              <th style={s.th}>设备</th>
              <th style={s.th}>状态</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(a => (
              <tr key={a.id} style={{ cursor: 'pointer' }}>
                <td style={s.td}><span style={{ fontFamily: 'monospace', color: '#3b82f6' }}>{a.id}</span></td>
                <td style={{ ...s.td, fontWeight: 600, color: '#1a3a5c' }}>{a.patientName}</td>
                <td style={s.td}>{a.examType}</td>
                <td style={s.td}>{a.examSubtype}</td>
                <td style={s.td}>{a.appointmentDate}</td>
                <td style={{ ...s.td, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={12} color="#94a3b8" />{a.appointmentTime}
                </td>
                <td style={s.td}>{a.doctor}</td>
                <td style={s.td}>{a.device}</td>
                <td style={s.td}>
                  <span style={{ ...s.badge, background: statusColors[a.status]?.bg, color: statusColors[a.status]?.color }}>
                    {a.status}
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
