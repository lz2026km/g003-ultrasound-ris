// @ts-nocheck
// G003 超声RIS - 运营中心页面
import { useState } from 'react'
import { Activity, Users, Clock, TrendingUp, BarChart3, Settings, Bell, Search, Filter, Download } from 'lucide-react'
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

export default function OperationsCenterPage() {
  const [searchText, setSearchText] = useState('')
  const [selectedDept, setSelectedDept] = useState('全部')

  const departments = ['全部', '超声科', '妇产科', '心血管科', '急诊科', '体检科']

  const operationStats = [
    { label: '今日检查量', value: '386', icon: Activity, color: '#3b82f6', trend: '+12%' },
    { label: '在检人数', value: '42', icon: Users, color: '#22c55e', trend: '实时' },
    { label: '平均等候', value: '18分钟', icon: Clock, color: '#f97316', trend: '-5分钟' },
    { label: '当日完成率', value: '96.8%', icon: TrendingUp, color: '#8b5cf6', trend: '+2.3%' },
  ]

  return (
    <div style={s.root}>
      <div style={s.header}>
        <h1 style={s.title}>运营管理中心</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ ...s.filterBtn }}>
            <Bell size={16} />
          </button>
          <button style={{ ...s.filterBtn }}>
            <Settings size={16} />
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        {operationStats.map((stat, i) => (
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
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <div style={s.statValue}>{stat.value}</div>
                  <span style={{ fontSize: 12, color: stat.trend.includes('+') ? '#22c55e' : stat.trend.includes('-') ? '#22c55e' : '#64748b' }}>{stat.trend}</span>
                </div>
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
            placeholder="搜索科室或医生..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
        </div>
        <select
          style={s.filterBtn}
          value={selectedDept}
          onChange={e => setSelectedDept(e.target.value)}
        >
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <button style={{ ...s.filterBtn, background: '#1a3a5c', color: '#fff', border: 'none' }}>
          <BarChart3 size={16} /> 运营报告
        </button>
      </div>

      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>科室</th>
              <th style={s.th}>当班医生</th>
              <th style={s.th}>今日检查</th>
              <th style={s.th}>待检人数</th>
              <th style={s.th}>平均检查时间</th>
              <th style={s.th}>设备状态</th>
              <th style={s.th}>完成率</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={s.td}>超声科</td>
              <td style={s.td}>王建国</td>
              <td style={s.td}>86</td>
              <td style={s.td}>12</td>
              <td style={s.td}>15分钟</td>
              <td style={s.td}><span style={{ ...s.badge, background: '#f0fdf4', color: '#22c55e' }}>正常</span></td>
              <td style={s.td}><span style={{ color: '#22c55e' }}>98.2%</span></td>
            </tr>
            <tr>
              <td style={s.td}>妇产科</td>
              <td style={s.td}>李秀英</td>
              <td style={s.td}>72</td>
              <td style={s.td}>8</td>
              <td style={s.td}>18分钟</td>
              <td style={s.td}><span style={{ ...s.badge, background: '#f0fdf4', color: '#22c55e' }}>正常</span></td>
              <td style={s.td}><span style={{ color: '#22c55e' }}>97.5%</span></td>
            </tr>
            <tr>
              <td style={s.td}>心血管科</td>
              <td style={s.td}>张志明</td>
              <td style={s.td}>58</td>
              <td style={s.td}>6</td>
              <td style={s.td}>22分钟</td>
              <td style={s.td}><span style={{ ...s.badge, background: '#fff7ed', color: '#f97316' }}>维护中</span></td>
              <td style={s.td}><span style={{ color: '#22c55e' }}>95.8%</span></td>
            </tr>
            <tr>
              <td style={s.td}>急诊科</td>
              <td style={s.td}>赵伟东</td>
              <td style={s.td}>45</td>
              <td style={s.td}>15</td>
              <td style={s.td}>12分钟</td>
              <td style={s.td}><span style={{ ...s.badge, background: '#f0fdf4', color: '#22c55e' }}>正常</span></td>
              <td style={s.td}><span style={{ color: '#22c55e' }}>99.1%</span></td>
            </tr>
            <tr>
              <td style={s.td}>体检科</td>
              <td style={s.td}>陈晓燕</td>
              <td style={s.td}>125</td>
              <td style={s.td}>1</td>
              <td style={s.td}>8分钟</td>
              <td style={s.td}><span style={{ ...s.badge, background: '#f0fdf4', color: '#22c55e' }}>正常</span></td>
              <td style={s.td}><span style={{ color: '#22c55e' }}>99.8%</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
