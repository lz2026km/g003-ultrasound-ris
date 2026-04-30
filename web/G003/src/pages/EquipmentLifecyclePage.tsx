// @ts-nocheck
// G003 超声RIS - 设备全生命周期页面
import { useState } from 'react'
import { Monitor, Search, Wrench, AlertTriangle, Clock, CheckCircle, BarChart3, Plus, Filter } from 'lucide-react'
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

export default function EquipmentLifecyclePage() {
  const [searchText, setSearchText] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('全部')

  const statuses = ['全部', '在用', '维护中', '已报废', '待入库']

  const equipmentStats = [
    { label: '设备总数', value: '48', icon: Monitor, color: '#3b82f6' },
    { label: '在用设备', value: '35', icon: CheckCircle, color: '#22c55e' },
    { label: '维护中', value: '8', icon: Wrench, color: '#f97316' },
    { label: '即将到期', value: '5', icon: AlertTriangle, color: '#ef4444' },
  ]

  return (
    <div style={s.root}>
      <div style={s.header}>
        <h1 style={s.title}>设备全生命周期管理</h1>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        {equipmentStats.map((stat, i) => (
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
            placeholder="搜索设备名称或编号..."
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
          <Plus size={16} /> 新增设备
        </button>
      </div>

      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>设备编号</th>
              <th style={s.th}>设备名称</th>
              <th style={s.th}>型号</th>
              <th style={s.th}>购置日期</th>
              <th style={s.th}>使用年限</th>
              <th style={s.th}>状态</th>
              <th style={s.th}>下次维保</th>
              <th style={s.th}>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={s.td}>EQ-2024-001</td>
              <td style={s.td}>GE Voluson E10</td>
              <td style={s.td}>妇产科专用</td>
              <td style={s.td}>2022-03-15</td>
              <td style={s.td}>4.1年</td>
              <td style={s.td}><span style={{ ...s.badge, background: '#f0fdf4', color: '#22c55e' }}>在用</span></td>
              <td style={s.td}>2026-06-15</td>
              <td style={s.td}>
                <button style={{ ...s.actionBtn, background: '#f8fafc', color: '#475569', marginRight: 4 }}>详情</button>
                <button style={{ ...s.actionBtn, background: '#fff7ed', color: '#f97316' }}>维保</button>
              </td>
            </tr>
            <tr>
              <td style={s.td}>EQ-2024-002</td>
              <td style={s.td}>Philips EPIQ 7</td>
              <td style={s.td}>全身通用</td>
              <td style={s.td}>2023-01-20</td>
              <td style={s.td}>3.2年</td>
              <td style={s.td}><span style={{ ...s.badge, background: '#f0fdf4', color: '#22c55e' }}>在用</span></td>
              <td style={s.td}>2026-08-20</td>
              <td style={s.td}>
                <button style={{ ...s.actionBtn, background: '#f8fafc', color: '#475569', marginRight: 4 }}>详情</button>
                <button style={{ ...s.actionBtn, background: '#fff7ed', color: '#f97316' }}>维保</button>
              </td>
            </tr>
            <tr>
              <td style={s.td}>EQ-2023-015</td>
              <td style={s.td}>Siemens Acuson S2000</td>
              <td style={s.td}>心血管专用</td>
              <td style={s.td}>2021-06-10</td>
              <td style={s.td}>4.8年</td>
              <td style={s.td}><span style={{ ...s.badge, background: '#fff7ed', color: '#f97316' }}>维护中</span></td>
              <td style={s.td}>-</td>
              <td style={s.td}>
                <button style={{ ...s.actionBtn, background: '#f8fafc', color: '#475569', marginRight: 4 }}>详情</button>
                <button style={{ ...s.actionBtn, background: '#eff6ff', color: '#3b82f6' }}>完成</button>
              </td>
            </tr>
            <tr>
              <td style={s.td}>EQ-2020-008</td>
              <td style={s.td}>Mindray DC-8</td>
              <td style={s.td}>便携式</td>
              <td style={s.td}>2020-09-01</td>
              <td style={s.td}>5.6年</td>
              <td style={s.td}><span style={{ ...s.badge, background: '#fef2f2', color: '#ef4444' }}>即将报废</span></td>
              <td style={s.td}>-</td>
              <td style={s.td}>
                <button style={{ ...s.actionBtn, background: '#f8fafc', color: '#475569', marginRight: 4 }}>详情</button>
                <button style={{ ...s.actionBtn, background: '#fef2f2', color: '#ef4444' }}>报废</button>
              </td>
            </tr>
            <tr>
              <td style={s.td}>EQ-2026-003</td>
              <td style={s.td}>Canon Aplio i900</td>
              <td style={s.td}>剪切波弹性</td>
              <td style={s.td}>2026-04-01</td>
              <td style={s.td}>0.1年</td>
              <td style={s.td}><span style={{ ...s.badge, background: '#eff6ff', color: '#3b82f6' }}>待入库</span></td>
              <td style={s.td}>2027-04-01</td>
              <td style={s.td}>
                <button style={{ ...s.actionBtn, background: '#f8fafc', color: '#475569', marginRight: 4 }}>详情</button>
                <button style={{ ...s.actionBtn, background: '#f0fdf4', color: '#22c55e' }}>入库</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
