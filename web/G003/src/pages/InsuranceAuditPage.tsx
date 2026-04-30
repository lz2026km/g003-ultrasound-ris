// @ts-nocheck
// G003 超声RIS - 医保审核页面
import { useState } from 'react'
import { Shield, Search, CheckCircle, XCircle, Clock, AlertTriangle, FileText, Filter } from 'lucide-react'
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
  statCard: {
    background: '#fff', borderRadius: 12, padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', flex: 1, minWidth: 180,
  },
  statLabel: { fontSize: 13, color: '#64748b', marginBottom: 8 },
  statValue: { fontSize: 28, fontWeight: 700, color: '#1a3a5c' },
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

export default function InsuranceAuditPage() {
  const [searchText, setSearchText] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('全部')

  const statuses = ['全部', '待审核', '已通过', '已驳回', '申诉中']

  const auditStats = [
    { label: '待审核', value: '156', icon: Clock, color: '#f97316' },
    { label: '已通过', value: '2,458', icon: CheckCircle, color: '#22c55e' },
    { label: '已驳回', value: '89', icon: XCircle, color: '#ef4444' },
    { label: '申诉中', value: '23', icon: AlertTriangle, color: '#eab308' },
  ]

  return (
    <div style={s.root}>
      <div style={s.header}>
        <h1 style={s.title}>医保审核管理</h1>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        {auditStats.map((stat, i) => (
          <div key={i} style={s.statCard}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: `${stat.color}15`, display: 'flex',
                alignItems: 'center', justifyContent: 'center'
              }}>
                <stat.icon size={22} color={stat.color} />
              </div>
              <div>
                <div style={s.statLabel}>{stat.label}</div>
                <div style={s.statValue}>{stat.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={s.filterRow}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
          <input
            style={{ ...s.searchInput, paddingLeft: 36 }}
            placeholder="搜索患者姓名或医保卡号..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
        </div>
        <select
          style={s.filterBtn}
          value={selectedStatus}
          onChange={e => setSelectedStatus(e.target.value)}
        >
          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button style={{ ...s.filterBtn, background: '#1a3a5c', color: '#fff', border: 'none' }}>
          <Shield size={16} /> 批量审核
        </button>
      </div>

      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>患者姓名</th>
              <th style={s.th}>医保卡号</th>
              <th style={s.th}>申请项目</th>
              <th style={s.th}>申请金额</th>
              <th style={s.th}>审核状态</th>
              <th style={s.th}>申请时间</th>
              <th style={s.th}>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={s.td}>张伟</td>
              <td style={s.td}>310***********1234</td>
              <td style={s.td}>腹部超声检查</td>
              <td style={s.td}>¥280.00</td>
              <td style={s.td}><span style={{ ...s.badge, background: '#fff7ed', color: '#f97316' }}>待审核</span></td>
              <td style={s.td}>2026-04-28 09:23</td>
              <td style={s.td}>
                <button style={{ ...s.actionBtn, background: '#22c55e', color: '#fff', marginRight: 8 }}>通过</button>
                <button style={{ ...s.actionBtn, background: '#ef4444', color: '#fff' }}>驳回</button>
              </td>
            </tr>
            <tr>
              <td style={s.td}>李娜</td>
              <td style={s.td}>320***********5678</td>
              <td style={s.td}>心脏彩超</td>
              <td style={s.td}>¥420.00</td>
              <td style={s.td}><span style={{ ...s.badge, background: '#f0fdf4', color: '#22c55e' }}>已通过</span></td>
              <td style={s.td}>2026-04-28 08:45</td>
              <td style={s.td}><FileText size={16} style={{ color: '#94a3b8', cursor: 'pointer' }} /></td>
            </tr>
            <tr>
              <td style={s.td}>王磊</td>
              <td style={s.td}>330***********9012</td>
              <td style={s.td}>甲状腺超声</td>
              <td style={s.td}>¥180.00</td>
              <td style={s.td}><span style={{ ...s.badge, background: '#fef2f2', color: '#ef4444' }}>已驳回</span></td>
              <td style={s.td}>2026-04-27 15:30</td>
              <td style={s.td}><FileText size={16} style={{ color: '#94a3b8', cursor: 'pointer' }} /></td>
            </tr>
            <tr>
              <td style={s.td}>刘芳</td>
              <td style={s.td}>340***********3456</td>
              <td style={s.td}>乳腺超声检查</td>
              <td style={s.td}>¥320.00</td>
              <td style={s.td}><span style={{ ...s.badge, background: '#fefce8', color: '#eab308' }}>申诉中</span></td>
              <td style={s.td}>2026-04-27 11:20</td>
              <td style={s.td}><FileText size={16} style={{ color: '#94a3b8', cursor: 'pointer' }} /></td>
            </tr>
            <tr>
              <td style={s.td}>陈明</td>
              <td style={s.td}>350***********7890</td>
              <td style={s.td}>血管超声</td>
              <td style={s.td}>¥380.00</td>
              <td style={s.td}><span style={{ ...s.badge, background: '#f0fdf4', color: '#22c55e' }}>已通过</span></td>
              <td style={s.td}>2026-04-26 14:15</td>
              <td style={s.td}><FileText size={16} style={{ color: '#94a3b8', cursor: 'pointer' }} /></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
