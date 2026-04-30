// @ts-nocheck
// G003 超声RIS - 报告管理页面
import { useState } from 'react'
import { FileText, Search, Download, CheckCircle, Eye, Printer, Filter } from 'lucide-react'
import { mockReports } from '../data/initialData'

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
    background: '#fff', borderRadius: 12, padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', flex: 1, minWidth: 180,
  },
  statLabel: { fontSize: 13, color: '#64748b', marginBottom: 8 },
  statValue: { fontSize: 28, fontWeight: 700, color: '#1a3a5c' },
}

const statusColors: Record<string, { bg: string; color: string }> = {
  '待书写': { bg: '#fff7ed', color: '#f97316' },
  '待审核': { bg: '#eff6ff', color: '#3b82f6' },
  '已审核': { bg: '#f0fdf4', color: '#22c55e' },
  '已打印': { bg: '#f0fdfa', color: '#14b8a6' },
  '已发布': { bg: '#f5f3ff', color: '#8b5cf6' },
}

export default function ReportPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('全部')
  const reports = mockReports

  const filtered = reports.filter(r => {
    const matchSearch = r.patientName.includes(search) || r.examType.includes(search) || r.reportId.includes(search)
    const matchStatus = statusFilter === '全部' || r.status === statusFilter
    return matchSearch && matchStatus
  })

  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === '待书写' || r.status === '待审核').length,
    approved: reports.filter(r => r.status === '已审核' || r.status === '已发布').length,
    printed: reports.filter(r => r.status === '已打印').length,
  }

  return (
    <div style={s.root}>
      <div style={s.header}>
        <h1 style={s.title}>报告管理</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ ...s.actionBtn, background: '#fff', color: '#475569', border: '1px solid #e2e8f0' }}>
            <Download size={14} /> 导出
          </button>
          <button style={{ ...s.actionBtn, background: '#3b82f6', color: '#fff' }}>
            <FileText size={14} /> 新建报告
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <div style={s.statCard}>
          <div style={s.statLabel}>报告总数</div>
          <div style={s.statValue}>{stats.total}</div>
        </div>
        <div style={s.statCard}>
          <div style={s.statLabel}>待书写/待审核</div>
          <div style={{ ...s.statValue, color: '#f97316' }}>{stats.pending}</div>
        </div>
        <div style={s.statCard}>
          <div style={s.statLabel}>已审核/已发布</div>
          <div style={{ ...s.statValue, color: '#22c55e' }}>{stats.approved}</div>
        </div>
        <div style={s.statCard}>
          <div style={s.statLabel}>已打印</div>
          <div style={{ ...s.statValue, color: '#14b8a6' }}>{stats.printed}</div>
        </div>
      </div>

      <div style={s.filterRow}>
        <Search size={14} color="#64748b" />
        <input style={s.searchInput} placeholder="搜索患者姓名/报告ID/检查类型..." value={search} onChange={e => setSearch(e.target.value)} />
        <select style={s.filterBtn} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option>全部</option>
          <option>待书写</option>
          <option>待审核</option>
          <option>已审核</option>
          <option>已打印</option>
          <option>已发布</option>
        </select>
        <select style={s.filterBtn}>
          <option>全部类型</option>
        </select>
      </div>

      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>报告ID</th>
              <th style={s.th}>患者姓名</th>
              <th style={s.th}>检查类型</th>
              <th style={s.th}>检查部位</th>
              <th style={s.th}>报告医生</th>
              <th style={s.th}>审核医生</th>
              <th style={s.th}>书写时间</th>
              <th style={s.th}>状态</th>
              <th style={s.th}>操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} style={{ cursor: 'pointer' }}>
                <td style={s.td}><span style={{ fontFamily: 'monospace', color: '#3b82f6' }}>{r.reportId}</span></td>
                <td style={{ ...s.td, fontWeight: 600, color: '#1a3a5c' }}>{r.patientName}</td>
                <td style={s.td}>{r.examType}</td>
                <td style={s.td}>{r.examSubtype}</td>
                <td style={s.td}>{r.reportDoctor}</td>
                <td style={s.td}>{r.reviewDoctor || '-'}</td>
                <td style={s.td}>{r.reportTime}</td>
                <td style={s.td}>
                  <span style={{ ...s.badge, background: statusColors[r.status]?.bg, color: statusColors[r.status]?.color }}>
                    {r.status}
                  </span>
                </td>
                <td style={s.td}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button style={{ ...s.actionBtn, padding: '4px 8px', background: 'transparent', color: '#3b82f6' }}>
                      <Eye size={14} />
                    </button>
                    <button style={{ ...s.actionBtn, padding: '4px 8px', background: 'transparent', color: '#64748b' }}>
                      <Printer size={14} />
                    </button>
                    {r.status === '待审核' && (
                      <button style={{ ...s.actionBtn, padding: '4px 8px', background: 'transparent', color: '#22c55e' }}>
                        <CheckCircle size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
