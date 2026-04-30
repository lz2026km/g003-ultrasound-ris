// @ts-nocheck
// G003 超声RIS - 全国报告页面
import { useState } from 'react'
import { FileText, Search, Download, Filter, MapPin, Building2, Users, BarChart3 } from 'lucide-react'
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

export default function NationalReportPage() {
  const [searchText, setSearchText] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('全部')

  const regions = ['全部', '华北', '华东', '华南', '华中', '西南', '西北', '东北']

  const nationalStats = [
    { label: '全国报告总量', value: '128,459', icon: FileText, color: '#3b82f6' },
    { label: '上报医院数', value: '2,847', icon: Building2, color: '#22c55e' },
    { label: '覆盖医技人员', value: '15,632', icon: Users, color: '#f97316' },
    { label: '数据完整率', value: '98.6%', icon: BarChart3, color: '#8b5cf6' },
  ]

  return (
    <div style={s.root}>
      <div style={s.header}>
        <h1 style={s.title}>全国报告统计</h1>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        {nationalStats.map((stat, i) => (
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
            placeholder="搜索医院或报告编号..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
        </div>
        <select
          style={s.filterBtn}
          value={selectedRegion}
          onChange={e => setSelectedRegion(e.target.value)}
        >
          {regions.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <button style={{ ...s.filterBtn, background: '#1a3a5c', color: '#fff', border: 'none' }}>
          <Download size={16} /> 导出数据
        </button>
      </div>

      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>地区</th>
              <th style={s.th}>医院名称</th>
              <th style={s.th}>报告数</th>
              <th style={s.th}>审核率</th>
              <th style={s.th}>平均出具时间</th>
              <th style={s.th}>数据质量</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={s.td}><MapPin size={14} style={{ marginRight: 6, color: '#94a3b8' }} />华北</td>
              <td style={s.td}>北京协和医院</td>
              <td style={s.td}>12,458</td>
              <td style={s.td}><span style={{ color: '#22c55e' }}>99.2%</span></td>
              <td style={s.td}>2.3小时</td>
              <td style={s.td}><span style={{ ...s.badge, background: '#f0fdf4', color: '#22c55e' }}>优秀</span></td>
            </tr>
            <tr>
              <td style={s.td}><MapPin size={14} style={{ marginRight: 6, color: '#94a3b8' }} />华东</td>
              <td style={s.td}>上海瑞金医院</td>
              <td style={s.td}>11,235</td>
              <td style={s.td}><span style={{ color: '#22c55e' }}>98.7%</span></td>
              <td style={s.td}>2.1小时</td>
              <td style={s.td}><span style={{ ...s.badge, background: '#f0fdf4', color: '#22c55e' }}>优秀</span></td>
            </tr>
            <tr>
              <td style={s.td}><MapPin size={14} style={{ marginRight: 6, color: '#94a3b8' }} />华南</td>
              <td style={s.td}>中山大学附属第一医院</td>
              <td style={s.td}>10,892</td>
              <td style={s.td}><span style={{ color: '#3b82f6' }}>97.5%</span></td>
              <td style={s.td}>2.5小时</td>
              <td style={s.td}><span style={{ ...s.badge, background: '#eff6ff', color: '#3b82f6' }}>良好</span></td>
            </tr>
            <tr>
              <td style={s.td}><MapPin size={14} style={{ marginRight: 6, color: '#94a3b8' }} />华中</td>
              <td style={s.td}>武汉同济医院</td>
              <td style={s.td}>9,456</td>
              <td style={s.td}><span style={{ color: '#3b82f6' }}>96.8%</span></td>
              <td style={s.td}>2.8小时</td>
              <td style={s.td}><span style={{ ...s.badge, background: '#eff6ff', color: '#3b82f6' }}>良好</span></td>
            </tr>
            <tr>
              <td style={s.td}><MapPin size={14} style={{ marginRight: 6, color: '#94a3b8' }} />西南</td>
              <td style={s.td}>四川大学华西医院</td>
              <td style={s.td}>9,123</td>
              <td style={s.td}><span style={{ color: '#22c55e' }}>98.1%</span></td>
              <td style={s.td}>2.2小时</td>
              <td style={s.td}><span style={{ ...s.badge, background: '#f0fdf4', color: '#22c55e' }}>优秀</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
