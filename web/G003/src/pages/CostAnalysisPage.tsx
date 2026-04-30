// @ts-nocheck
// G003 超声RIS - 成本分析页面
import { useState } from 'react'
import { DollarSign, TrendingUp, TrendingDown, BarChart3, PieChart, Search, Filter, Download, Calculator } from 'lucide-react'
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

export default function CostAnalysisPage() {
  const [searchText, setSearchText] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState('本月')

  const periods = ['本周', '本月', '本季度', '本年']

  const costStats = [
    { label: '总成本', value: '¥2,856,000', icon: DollarSign, color: '#3b82f6', trend: '+3.2%' },
    { label: '设备折旧', value: '¥1,120,000', icon: BarChart3, color: '#f97316', trend: '+1.5%' },
    { label: '耗材支出', value: '¥856,000', icon: PieChart, color: '#22c55e', trend: '-2.1%' },
    { label: '人力成本', value: '¥880,000', icon: Calculator, color: '#8b5cf6', trend: '+5.8%' },
  ]

  const costBreakdown = [
    { category: '设备折旧', amount: '1,120,000', percent: '39.2%', trend: '+1.5%' },
    { category: '人力成本', amount: '880,000', percent: '30.8%', trend: '+5.8%' },
    { category: '耗材支出', amount: '856,000', percent: '30.0%', trend: '-2.1%' },
  ]

  return (
    <div style={s.root}>
      <div style={s.header}>
        <h1 style={s.title}>成本分析中心</h1>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        {costStats.map((stat, i) => (
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
                  <span style={{ fontSize: 12, color: stat.trend.includes('+') ? '#ef4444' : '#22c55e' }}>
                    {stat.trend.includes('+') ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {stat.trend}
                  </span>
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
            placeholder="搜索成本项目..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
        </div>
        <select
          style={s.filterBtn}
          value={selectedPeriod}
          onChange={e => setSelectedPeriod(e.target.value)}
        >
          {periods.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <button style={{ ...s.filterBtn, background: '#1a3a5c', color: '#fff', border: 'none' }}>
          <Download size={16} /> 导出报表
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16, marginBottom: 24 }}>
        {costBreakdown.map((item, i) => (
          <div key={i} style={{
            background: '#fff', borderRadius: 12,
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)', padding: 20
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 14, color: '#475569' }}>{item.category}</span>
              <span style={{
                fontSize: 12,
                color: item.trend.includes('+') ? '#ef4444' : '#22c55e',
                display: 'flex', alignItems: 'center', gap: 4
              }}>
                {item.trend.includes('+') ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {item.trend}
              </span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#1a3a5c', marginBottom: 8 }}>¥{item.amount}</div>
            <div style={{ background: '#f1f5f9', borderRadius: 4, height: 8 }}>
              <div style={{
                width: item.percent, height: '100%', borderRadius: 4,
                background: i === 0 ? '#3b82f6' : i === 1 ? '#f97316' : '#22c55e'
              }} />
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>占比 {item.percent}</div>
          </div>
        ))}
      </div>

      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>成本项目</th>
              <th style={s.th}>本月支出</th>
              <th style={s.th}>上月支出</th>
              <th style={s.th}>环比</th>
              <th style={s.th}>预算执行</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={s.td}>设备折旧</td>
              <td style={s.td}>¥1,120,000</td>
              <td style={s.td}>¥1,103,000</td>
              <td style={s.td}><span style={{ color: '#ef4444' }}>+1.5%</span></td>
              <td style={s.td}>
                <div style={{ background: '#f1f5f9', borderRadius: 4, height: 8, width: 120 }}>
                  <div style={{ width: '85%', height: '100%', borderRadius: 4, background: '#3b82f6' }} />
                </div>
                <span style={{ fontSize: 12 }}>85%</span>
              </td>
            </tr>
            <tr>
              <td style={s.td}>人力成本</td>
              <td style={s.td}>¥880,000</td>
              <td style={s.td}>¥832,000</td>
              <td style={s.td}><span style={{ color: '#ef4444' }}>+5.8%</span></td>
              <td style={s.td}>
                <div style={{ background: '#f1f5f9', borderRadius: 4, height: 8, width: 120 }}>
                  <div style={{ width: '92%', height: '100%', borderRadius: 4, background: '#f97316' }} />
                </div>
                <span style={{ fontSize: 12 }}>92%</span>
              </td>
            </tr>
            <tr>
              <td style={s.td}>耗材支出</td>
              <td style={s.td}>¥856,000</td>
              <td style={s.td}>¥874,500</td>
              <td style={s.td}><span style={{ color: '#22c55e' }}>-2.1%</span></td>
              <td style={s.td}>
                <div style={{ background: '#f1f5f9', borderRadius: 4, height: 8, width: 120 }}>
                  <div style={{ width: '78%', height: '100%', borderRadius: 4, background: '#22c55e' }} />
                </div>
                <span style={{ fontSize: 12 }}>78%</span>
              </td>
            </tr>
            <tr>
              <td style={s.td}>维保费用</td>
              <td style={s.td}>¥156,000</td>
              <td style={s.td}>¥148,000</td>
              <td style={s.td}><span style={{ color: '#ef4444' }}>+5.4%</span></td>
              <td style={s.td}>
                <div style={{ background: '#f1f5f9', borderRadius: 4, height: 8, width: 120 }}>
                  <div style={{ width: '65%', height: '100%', borderRadius: 4, background: '#8b5cf6' }} />
                </div>
                <span style={{ fontSize: 12 }}>65%</span>
              </td>
            </tr>
            <tr>
              <td style={s.td}>能源消耗</td>
              <td style={s.td}>¥45,000</td>
              <td style={s.td}>¥46,200</td>
              <td style={s.td}><span style={{ color: '#22c55e' }}>-2.6%</span></td>
              <td style={s.td}>
                <div style={{ background: '#f1f5f9', borderRadius: 4, height: 8, width: 120 }}>
                  <div style={{ width: '55%', height: '100%', borderRadius: 4, background: '#3b82f6' }} />
                </div>
                <span style={{ fontSize: 12 }}>55%</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
