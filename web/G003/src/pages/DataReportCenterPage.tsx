// @ts-nocheck
// G003 超声RIS - 数据报表中心页面
import { useState } from 'react'
import { BarChart3, PieChart, TrendingUp, Download, Calendar, Filter, FileText, Eye } from 'lucide-react'
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

export default function DataReportCenterPage() {
  const [searchText, setSearchText] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState('本月')

  const periods = ['今日', '本周', '本月', '本季度', '本年']
  const reportTypes = [
    { name: '工作量统计报表', desc: '按科室、人员统计检查数量', type: '官方' },
    { name: '收入分析报表', desc: '收入汇总与对比分析', type: '财务' },
    { name: '质量控制报表', desc: '报告质量与时效统计', type: '质控' },
    { name: '设备使用报表', desc: '设备利用率与故障统计', type: '设备' },
    { name: '患者满意度报表', desc: '满意度调查结果分析', type: '服务' },
    { name: '医保费用报表', desc: '医保结算与审核统计', type: '医保' },
  ]

  const reportStats = [
    { label: '报表总数', value: '156', icon: FileText, color: '#3b82f6' },
    { label: '本周新增', value: '12', icon: TrendingUp, color: '#22c55e' },
    { label: '定制报表', value: '28', icon: BarChart3, color: '#f97316' },
    { label: '自动推送', value: '45', icon: PieChart, color: '#8b5cf6' },
  ]

  return (
    <div style={s.root}>
      <div style={s.header}>
        <h1 style={s.title}>数据报表中心</h1>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        {reportStats.map((stat, i) => (
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
            placeholder="搜索报表名称..."
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
          <Download size={16} /> 新建报表
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {reportTypes.map((report, i) => (
          <div key={i} style={{
            background: '#fff', borderRadius: 12,
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)', padding: 20
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: '#3b82f615', display: 'flex',
                  alignItems: 'center', justifyContent: 'center'
                }}>
                  <BarChart3 size={20} color='#3b82f6' />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1a3a5c' }}>{report.name}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{report.desc}</div>
                </div>
              </div>
              <span style={{
                ...s.badge,
                background: report.type === '官方' ? '#eff6ff' : report.type === '财务' ? '#f0fdf4' : '#faf5ff',
                color: report.type === '官方' ? '#3b82f6' : report.type === '财务' ? '#22c55e' : '#8b5cf6'
              }}>{report.type}</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ ...s.actionBtn, background: '#f8fafc', color: '#475569', flex: 1 }}>
                <Eye size={14} /> 预览
              </button>
              <button style={{ ...s.actionBtn, background: '#1a3a5c', color: '#fff', flex: 1 }}>
                <Download size={14} /> 下载
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
