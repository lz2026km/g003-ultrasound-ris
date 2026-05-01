import React, { useState } from 'react'
import {
  TrendingUp, TrendingDown, DollarSign, BarChart2,
  Download, PieChart, Calendar, Users,
  Percent, Activity, Award
} from 'lucide-react'

interface CostItem { name: string; amount: number; percent: number; color: string }
interface RevenueItem { month: string; income: number; cost: number; profit: number }
interface EfficiencyItem { doctor: string; exams: number; income: number; avgTime: number; score: number }

const costData: CostItem[] = [
  { name: '人力成本', amount: 285000, percent: 42, color: '#f85149' },
  { name: '设备折旧', amount: 156000, percent: 23, color: '#a371f7' },
  { name: '耗材支出', amount: 128000, percent: 19, color: '#58a6ff' },
  { name: '维保费用', amount: 62000, percent: 9, color: '#3fb950' },
  { name: '其他支出', amount: 47000, percent: 7, color: '#8b949e' },
]

const revenueData: RevenueItem[] = [
  { month: '1月', income: 420000, cost: 285000, profit: 135000 },
  { month: '2月', income: 380000, cost: 272000, profit: 108000 },
  { month: '3月', income: 510000, cost: 298000, profit: 212000 },
  { month: '4月', income: 468000, cost: 289000, profit: 179000 },
]

const efficiencyData: EfficiencyItem[] = [
  { doctor: '张明华', exams: 186, income: 325600, avgTime: 28, score: 96 },
  { doctor: '李秀英', exams: 162, income: 287400, avgTime: 31, score: 94 },
  { doctor: '王建国', exams: 145, income: 261200, avgTime: 26, score: 92 },
  { doctor: '陈晓梅', exams: 138, income: 243800, avgTime: 29, score: 91 },
  { doctor: '刘大力', exams: 129, income: 218500, avgTime: 33, score: 88 },
  { doctor: '赵丽', exams: 118, income: 201300, avgTime: 30, score: 87 },
]

const cssBar = (percent: number, color: string): React.CSSProperties => ({
  height: 8, width: `${percent}%`, background: color, borderRadius: 4, transition: 'width 0.5s'
})

const cssCard = (): React.CSSProperties => ({
  background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: '20px 24px',
  display: 'flex', flexDirection: 'column', gap: 4, minHeight: 120
})

export default function CostAnalysisPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'doctor' | 'equipment' | 'trend'>('overview')
  const [timeRange, setTimeRange] = useState('year')

  const totalCost = costData.reduce((s, i) => s + i.amount, 0)
  const totalRevenue = revenueData.reduce((s, i) => s + i.income, 0)
  const totalProfit = revenueData.reduce((s, i) => s + i.profit, 0)
  const avgProfitRate = ((totalProfit / totalRevenue) * 100).toFixed(1)

  const s: Record<string, React.CSSProperties> = {
    root: { padding: 32, minHeight: '100vh', background: '#0d1117', color: '#e6edf3', fontFamily: 'system-ui, sans-serif' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center',    marginBottom: 28 },
    title: { fontSize: 22, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 },
    topRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16,    marginBottom: 24 },
    statCard: cssCard(),
    statLabel: { fontSize: 13, color: '#8b949e', marginBottom: 6 },
    statValue: { fontSize: 28, fontWeight: 700, fontFamily: 'monospace' },
    statSub: { fontSize: 12, color: '#3fb950', display: 'flex', alignItems: 'center', gap: 4 },
    tabRow: { display: 'flex', gap: 6, marginBottom: 24, borderBottom: '1px solid #30363d', paddingBottom: 0 },
    tab: { padding: '10px 18px', cursor: 'pointer', borderBottom: '2px solid transparent', color: '#8b949e', fontSize: 14, transition: 'all 0.15s', minHeight: 44, display: 'flex', alignItems: 'center', gap: 6 },
    tabActive: { borderBottom: '2px solid #58a6ff', color: '#58a6ff' },
    grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20,    marginBottom: 24 },
    card: cssCard(),
    cardTitle: { fontSize: 15, fontWeight: 600, color: '#e6edf3', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 },
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #21262d' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '10px 12px', color: '#8b949e', fontSize: 12, fontWeight: 500, borderBottom: '1px solid #30363d' },
    td: { padding: '10px 12px', fontSize: 13, borderBottom: '1px solid #21262d' },
    badge: { padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600 },
    badgeGreen: { background: 'rgba(63,185,80,0.15)', color: '#3fb950' },
    badgeRed: { background: 'rgba(248,81,73,0.15)', color: '#f85149' },
    barRow: { display: 'flex', alignItems: 'center', gap: 12,    marginBottom: 10 },
    barLabel: { width: 70, fontSize: 12, color: '#8b949e' },
    barBg: { flex: 1, height: 8, background: '#21262d', borderRadius: 4, overflow: 'hidden' },
    barVal: { width: 50, fontSize: 12, color: '#e6edf3', textAlign: 'right', fontFamily: 'monospace' },
    rangeRow: { display: 'flex', gap: 8 },
    rangeBtn: { padding: '6px 14px', borderRadius: 6, border: '1px solid #30363d', backgroundColor: 'transparent', color: '#8b949e', cursor: 'pointer', fontSize: 12, minHeight: 36 },
    btnOutline: { backgroundColor: 'transparent', border: '1px solid #30363d', color: '#8b949e' },
    btnPrimary: { backgroundColor: '#1f6feb', color: '#fff' },
    chartBox: { height: 180, display: 'flex', alignItems: 'flex-end', gap: 12, padding: '0 8px' },
    chartBar: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  }

  const maxRevenue = Math.max(...revenueData.map(d => d.income))
  const maxProfit = Math.max(...revenueData.map(d => d.profit))

  return (
    <div style={s.root}>
      <div style={s.header}>
        <div style={s.title}><TrendingUp size={22} color="#58a6ff" /> 科室成本效益分析</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={s.rangeRow}>
            {['month', 'quarter', 'year'].map(r => (
              <button key={r} style={{ ...s.rangeBtn, ...(timeRange === r ? { bgcolor: '#1f6feb', color: '#fff', borderColor: '#1f6feb' } : {}) }} onClick={() => setTimeRange(r)}>
                {r === 'month' ? '本月' : r === 'quarter' ? '本季度' : '本年'}
              </button>
            ))}
          </div>
          <button style={{ ...s.btn, ...s.btnOutline }}><Download size={14} />导出Excel</button>
        </div>
      </div>

      {/* 核心指标卡片 */}
      <div style={s.topRow}>
        <div style={s.statCard}>
          <div style={s.statLabel}>总收入</div>
          <div style={{ ...s.statValue, color: '#e6edf3' }}>{(totalRevenue / 10000).toFixed(1)}万</div>
          <div style={s.statSub}><TrendingUp size={13} /> 同比 +12.3%</div>
        </div>
        <div style={s.statCard}>
          <div style={s.statLabel}>总成本</div>
          <div style={{ ...s.statValue, color: '#f85149' }}>{(totalCost / 10000).toFixed(1)}万</div>
          <div style={{ ...s.statSub, color: '#f85149' }}><TrendingDown size={13} /> 同比 +5.8%</div>
        </div>
        <div style={s.statCard}>
          <div style={s.statLabel}>净利润</div>
          <div style={{ ...s.statValue, color: '#3fb950' }}>{(totalProfit / 10000).toFixed(1)}万</div>
          <div style={s.statSub}><TrendingUp size={13} /> 同比 +18.6%</div>
        </div>
        <div style={s.statCard}>
          <div style={s.statLabel}>利润率</div>
          <div style={{ ...s.statValue, color: '#58a6ff' }}>{avgProfitRate}%</div>
          <div style={s.statSub}><Percent size={13} /> 同比 +1.2%</div>
        </div>
      </div>

      {/* 标签切换 */}
      <div style={s.tabRow}>
        {([
          ['overview', '成本概览'],
          ['doctor', '医生绩效'],
          ['equipment', '设备效益'],
          ['trend', '趋势分析'],
        ] as [string, string][]).map(([k, v]) => (
          <div key={k} style={{ ...s.tab, ...(activeTab === k ? s.tabActive : {}) }} onClick={() => setActiveTab(k as typeof activeTab)}>
            {k === 'overview' && <PieChart size={15} />}
            {k === 'doctor' && <Users size={15} />}
            {k === 'equipment' && <Activity size={15} />}
            {k === 'trend' && <BarChart2 size={15} />}
            {v}
          </div>
        ))}
      </div>

      {/* 成本概览 */}
      {activeTab === 'overview' && (
        <div style={s.grid2}>
          <div style={s.card}>
            <div style={s.cardTitle}><PieChart size={16} color="#58a6ff" /> 成本结构分析</div>
            {costData.map(item => (
              <div key={item.name} style={s.barRow}>
                <div style={s.barLabel}>{item.name}</div>
                <div style={s.barBg}><div style={cssBar(item.percent, item.color)} /></div>
                <div style={s.barVal}>{item.amount.toLocaleString()}</div>
                <div style={{ width: 35, fontSize: 11, color: '#8b949e', textAlign: 'right' }}>{item.percent}%</div>
              </div>
            ))}
            <div style={{ marginTop: 12, padding: '10px 12px', background: '#21262d', borderRadius: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#8b949e' }}>
                <span>成本合计</span><span style={{ color: '#f85149', fontWeight: 600 }}>¥{totalCost.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><BarChart2 size={16} color="#3fb950" /> 月度收入对比</div>
            <div style={s.chartBox}>
              {revenueData.map(d => {
                const maxH = 150
                return (
                  <div key={d.month} style={s.chartBar}>
                    <div style={{ height: maxH, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 3, width: '100%' }}>
                      <div style={{ height: (d.income / maxRevenue * maxH), background: '#58a6ff', borderRadius: '3px 3px 0 0', opacity: 0.9 }} />
                      <div style={{ height: (d.profit / maxProfit * maxH * 0.6), background: '#3fb950', borderRadius: '3px 3px 0 0' }} />
                    </div>
                    <div style={{ fontSize: 11, color: '#8b949e', marginTop: 4 }}>{d.month}</div>
                  </div>
                )
              })}
            </div>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#8b949e' }}>
                <div style={{ width: 10, height: 10, background: '#58a6ff', borderRadius: 2 }} />收入
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#8b949e' }}>
                <div style={{ width: 10, height: 10, background: '#3fb950', borderRadius: 2 }} />利润
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 医生绩效 */}
      {activeTab === 'doctor' && (
        <div style={s.card}>
          <div style={s.cardTitle}><Award size={16} color="#f0b429" /> 医生绩效排名</div>
          <table style={s.table}>
            <thead>
              <tr>
                {['排名', '医生', '检查量', '收入(元)', '平均时长(分)', '绩效评分'].map(h => <th key={h} style={s.th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {efficiencyData.map((d, i) => (
                <tr key={d.doctor}>
                  <td style={s.td}><span style={{ ...s.badge, background: i === 0 ? 'rgba(240,180,41,0.2)' : 'rgba(88,166,255,0.1)', color: i === 0 ? '#f0b429' : '#58a6ff', fontWeight: 700 }}>{i + 1}</span></td>
                  <td style={{ ...s.td, fontWeight: 600 }}>{d.doctor}</td>
                  <td style={s.td}>{d.exams}例</td>
                  <td style={s.td}>{d.income.toLocaleString()}</td>
                  <td style={s.td}>{d.avgTime}min</td>
                  <td style={s.td}>
                    <span style={{ ...s.badge, ...(d.score >= 92 ? s.badgeGreen : s.badgeRed) }}>{d.score}分</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 设备效益 */}
      {activeTab === 'equipment' && (
        <div style={s.grid2}>
          <div style={s.card}>
            <div style={s.cardTitle}><Activity size={16} color="#a371f7" /> 设备效益分析</div>
            {[
              { name: '电子胃镜 GIF-H290', exams: 486, income: 291600, cost: 42000, profit: 249600, rate: 85 },
              { name: '电子肠镜 CF-H290I', exams: 398, income: 238800, cost: 38000, profit: 200800, rate: 84 },
              { name: '超声内镜 EU-M2000', exams: 124, income: 186000, cost: 65000, profit: 121000, rate: 65 },
              { name: '电子胃镜 GIF-Q260J', exams: 312, income: 187200, cost: 35000, profit: 152200, rate: 81 },
            ].map(eq => (
              <div key={eq.name} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: '#e6edf3' }}>{eq.name}</span>
                  <span style={{ fontSize: 12, color: '#3fb950' }}>{eq.rate}%</span>
                </div>
                <div style={s.barBg}><div style={{ ...cssBar(eq.rate, '#a371f7') }} /></div>
                <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
                  <span style={{ fontSize: 11, color: '#8b949e' }}>检查{eq.exams}例</span>
                  <span style={{ fontSize: 11, color: '#8b949e' }}>收入¥{eq.income.toLocaleString()}</span>
                  <span style={{ fontSize: 11, color: '#f85149' }}>成本¥{eq.cost.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><DollarSign size={16} color="#3fb950" /> 人均效益分析</div>
            {efficiencyData.slice(0, 4).map(d => (
              <div key={d.doctor} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #21262d' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{d.doctor}</div>
                  <div style={{ fontSize: 11, color: '#8b949e' }}>{d.exams}例 · 人均{d.exams > 0 ? Math.round(d.income / d.exams) : 0}元/例</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#3fb950' }}>¥{(d.income / 10000).toFixed(1)}万</div>
                  <div style={{ fontSize: 11, color: '#8b949e' }}>总收入</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 趋势分析 */}
      {activeTab === 'trend' && (
        <div style={s.card}>
          <div style={s.cardTitle}><Calendar size={16} color="#58a6ff" /> 全年趋势分析</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={s.table}>
              <thead>
                <tr>{['月份', '收入', '成本', '利润', '利润率', '同比'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {[
                  ['1月', 420000, 285000, 135000, '32.1%', '+8.2%'],
                  ['2月', 380000, 272000, 108000, '28.4%', '+3.5%'],
                  ['3月', 510000, 298000, 212000, '41.6%', '+15.8%'],
                  ['4月', 468000, 289000, 179000, '38.2%', '+12.1%'],
                  ['5月', 495000, 295000, 200000, '40.4%', '+14.3%'],
                  ['6月', 522000, 302000, 220000, '42.1%', '+16.7%'],
                ].map(([m, inc, cost, profit, rate, yoy]) => (
                  <tr key={m}>
                    <td style={s.td}><span style={{ fontWeight: 600 }}>{m}</span></td>
                    <td style={{ ...s.td, color: '#3fb950' }}>¥{Number(inc).toLocaleString()}</td>
                    <td style={{ ...s.td, color: '#f85149' }}>¥{Number(cost).toLocaleString()}</td>
                    <td style={{ ...s.td, color: '#e6edf3', fontWeight: 600 }}>¥{Number(profit).toLocaleString()}</td>
                    <td style={s.td}><span style={{ ...s.badge, background: 'rgba(88,166,255,0.1)', color: '#58a6ff' }}>{rate}</span></td>
                    <td style={{ ...s.td, color: String(yoy).startsWith('+') ? '#3fb950' : '#f85149', fontWeight: 600 }}>{yoy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
