// @ts-nocheck
// ============================================================
// G004 US管理系统 - 增强统计分析页面
// 多维度数据统计与可视化分析
// ============================================================
import { useState } from 'react'
import {
  Activity, FileText, TrendingUp, Users, Clock, AlertTriangle,
  BarChart3, PieChart as PieChartIcon, Calendar, CheckCircle,
  Microscope, Droplets, ShieldCheck, Award, Zap, Target,
  Scissors, Stethoscope, ArrowUp, ArrowDown, Minus,
  Search, Filter, Download, RefreshCw, Inbox, Plus
} from 'lucide-react'

// ============ 数据定义 ============
const MONTHLY_EXAM_DATA = [
  { month: '5月', gastroscope: 420, colonoscopy: 380, ultrasound: 120, ercp: 45, capsule: 65 },
  { month: '6月', gastroscope: 445, colonoscopy: 395, ultrasound: 135, ercp: 48, capsule: 72 },
  { month: '7月', gastroscope: 465, colonoscopy: 410, ultrasound: 142, ercp: 52, capsule: 78 },
  { month: '8月', gastroscope: 448, colonoscopy: 398, ultrasound: 138, ercp: 49, capsule: 74 },
  { month: '9月', gastroscope: 478, colonoscopy: 425, ultrasound: 148, ercp: 55, capsule: 82 },
  { month: '10月', gastroscope: 492, colonoscopy: 438, ultrasound: 152, ercp: 58, capsule: 85 },
  { month: '11月', gastroscope: 505, colonoscopy: 452, ultrasound: 158, ercp: 60, capsule: 88 },
  { month: '12月', gastroscope: 518, colonoscopy: 465, ultrasound: 162, ercp: 62, capsule: 90 },
  { month: '1月', gastroscope: 485, colonoscopy: 430, ultrasound: 145, ercp: 54, capsule: 80 },
  { month: '2月', gastroscope: 462, colonoscopy: 408, ultrasound: 138, ercp: 50, capsule: 76 },
  { month: '3月', gastroscope: 512, colonoscopy: 458, ultrasound: 155, ercp: 58, capsule: 86 },
  { month: '4月', gastroscope: 528, colonoscopy: 472, ultrasound: 160, ercp: 62, capsule: 90 },
]

const EXAM_TYPE_DISTRIBUTION = [
  { name: '腹部US', value: 5258, color: '#3b82f6' },
  { name: 'US', value: 4669, color: '#22c55e' },
  { name: 'US探头', value: 1453, color: '#f97316' },
  { name: 'USCP', value: 593, color: '#8b5cf6' },
  { name: '胶囊US', value: 856, color: '#14b8a6' },
]

const DOCTOR_RANKING = [
  { rank: 1, name: '张明华', exams: 386, reportScore: 98.5, completion: 99.2, level: 'S' },
  { rank: 2, name: '李芳', exams: 352, reportScore: 97.8, completion: 98.5, level: 'S' },
  { rank: 3, name: '王建国', exams: 328, reportScore: 96.5, completion: 97.8, level: 'A' },
  { rank: 4, name: '刘洋', exams: 315, reportScore: 95.8, completion: 98.2, level: 'A' },
  { rank: 5, name: '陈晓燕', exams: 298, reportScore: 94.2, completion: 97.5, level: 'A' },
  { rank: 6, name: '赵德明', exams: 285, reportScore: 93.5, completion: 96.8, level: 'B' },
  { rank: 7, name: '孙丽萍', exams: 272, reportScore: 92.8, completion: 96.2, level: 'B' },
  { rank: 8, name: '周伟', exams: 258, reportScore: 91.5, completion: 95.5, level: 'B' },
  { rank: 9, name: '吴静', exams: 245, reportScore: 90.2, completion: 94.8, level: 'C' },
  { rank: 10, name: '郑强', exams: 232, reportScore: 89.5, completion: 94.2, level: 'C' },
]

const QC_TREND_DATA = [
  { month: '5月', imageQuality: 92, operationStandard: 94, reportStandard: 95, overall: 93.5 },
  { month: '6月', imageQuality: 93, operationStandard: 94.5, reportStandard: 95.5, overall: 94.2 },
  { month: '7月', imageQuality: 94, operationStandard: 95, reportStandard: 96, overall: 95 },
  { month: '8月', imageQuality: 93.5, operationStandard: 94.5, reportStandard: 95.5, overall: 94.5 },
  { month: '9月', imageQuality: 94.5, operationStandard: 95.5, reportStandard: 96.5, overall: 95.5 },
  { month: '10月', imageQuality: 95, operationStandard: 96, reportStandard: 97, overall: 96 },
  { month: '11月', imageQuality: 95.5, operationStandard: 96.5, reportStandard: 97.5, overall: 96.5 },
  { month: '12月', imageQuality: 96, operationStandard: 97, reportStandard: 98, overall: 97 },
  { month: '1月', imageQuality: 95.5, operationStandard: 96.5, reportStandard: 97.5, overall: 96.5 },
  { month: '2月', imageQuality: 95, operationStandard: 96, reportStandard: 97, overall: 96 },
  { month: '3月', imageQuality: 96.5, operationStandard: 97, reportStandard: 98, overall: 97.2 },
  { month: '4月', imageQuality: 97, operationStandard: 97.5, reportStandard: 98.5, overall: 97.8 },
]

const COMPLICATION_DATA = [
  { name: '出血', count: 8, rate: 0.28 },
  { name: '穿孔', count: 2, rate: 0.07 },
  { name: '感染', count: 3, rate: 0.11 },
  { name: '其他', count: 5, rate: 0.18 },
]

const COMPLICATION_DETAILS = [
  { patient: '李某某', type: '出血', handling: '止血钳止血+输血', result: '痊愈', date: '2026-04-15' },
  { patient: '王某某', type: '穿孔', handling: '急诊手术修补', result: '痊愈', date: '2026-04-08' },
  { patient: '张某某', type: '感染', handling: '抗生素治疗', result: '好转', date: '2026-03-28' },
  { patient: '赵某某', type: '出血', handling: 'US探头下止血', result: '痊愈', date: '2026-03-15' },
  { patient: '刘某某', type: '其他', handling: '对症处理', result: '痊愈', date: '2026-03-05' },
]

const INCOME_DATA = [
  { type: '腹部US', income: 2629000, cost: 1577400, profit: 1051600 },
  { type: 'US', income: 2334500, cost: 1400700, profit: 933800 },
  { type: 'US探头', income: 1089750, cost: 653850, profit: 435900 },
  { type: 'USCP', income: 592000, cost: 355200, profit: 236800 },
  { type: '胶囊US', income: 684800, cost: 410880, profit: 273920 },
]

const INCOME_TREND = [
  { month: '11月', income: 480000, cost: 288000, profit: 192000 },
  { month: '12月', income: 520000, cost: 312000, profit: 208000 },
  { month: '1月', income: 495000, cost: 297000, profit: 198000 },
  { month: '2月', income: 465000, cost: 279000, profit: 186000 },
  { month: '3月', income: 535000, cost: 321000, profit: 214000 },
  { month: '4月', income: 558000, cost: 334800, profit: 223200 },
]

const TIME_SEGMENT_DATA = [
  { hour: '08:00', count: 45 },
  { hour: '09:00', count: 128 },
  { hour: '10:00', count: 186 },
  { hour: '11:00', count: 225, isPeak: true },
  { hour: '12:00', count: 95 },
  { hour: '13:00', count: 165 },
  { hour: '14:00', count: 198 },
  { hour: '15:00', count: 215, isPeak: true },
  { hour: '16:00', count: 182 },
  { hour: '17:00', count: 145 },
  { hour: '18:00', count: 78 },
]

const WEEKDAY_VS_WEEKEND = [
  { group: '周一', weekday: 225, weekend: 120 },
  { group: '周二', weekday: 248, weekend: 135 },
  { group: '周三', weekday: 235, weekend: 128 },
  { group: '周四', weekday: 258, weekend: 142 },
  { group: '周五', weekday: 242, weekend: 138 },
]

const EQUIPMENT_DATA = [
  { name: '腹部US GF-260', usage: 1856, faults: 3, repairCost: 15000, usageRate: 92.8 },
  { name: 'US CF-260', usage: 1624, faults: 2, repairCost: 12000, usageRate: 88.5 },
  { name: 'US探头 EU-ME2', usage: 486, faults: 1, repairCost: 25000, usageRate: 78.2 },
  { name: '介入US JF-260', usage: 298, faults: 4, repairCost: 35000, usageRate: 65.4 },
  { name: '胶囊USM6', usage: 245, faults: 0, repairCost: 0, usageRate: 72.8 },
  { name: 'USCP介入US', usage: 186, faults: 2, repairCost: 28000, usageRate: 58.6 },
]

const KPI_DATA = [
  { label: '本月检查量', value: '2,856台', trend: '↑12%', trendUp: true, icon: Activity, color: '#3b82f6', bg: '#eff6ff' },
  { label: '报告及时率', value: '97.2%', trend: '↑0.5%', trendUp: true, icon: FileText, color: '#22c55e', bg: '#f0fdf4' },
  { label: '设备使用率', value: '84.5%', trend: '↑2.1%', trendUp: true, icon: BarChart3, color: '#f97316', bg: '#fff7ed' },
  { label: '患者满意度', value: '4.7/5.0', trend: '↑0.2', trendUp: true, icon: ShieldCheck, color: '#8b5cf6', bg: '#f5f3ff' },
  { label: '床位周转率', value: '3.2人次/天', trend: '持平', trendUp: null, icon: Clock, color: '#14b8a6', bg: '#f0fdfa' },
  { label: '院内感染率', value: '0.12%', trend: '↓0.03%', trendUp: false, icon: AlertTriangle, color: '#ef4444', bg: '#fef2f2' },
  { label: '人均检查时长', value: '28分钟', trend: '↓3分钟', trendUp: false, icon: Clock, color: '#64748b', bg: '#f8fafc' },
  { label: '耗材成本节省', value: '¥12,400', trend: '↑8.2%', trendUp: true, icon: TrendingUp, color: '#22c55e', bg: '#f0fdf4' },
]

// ============ 样式定义 ============
const s: Record<string, React.CSSProperties> = {
  root: { padding: 0 },
  header: {
    marginBottom: 24,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 20, fontWeight: 700, color: '#1a3a5c', margin: 0,
  },
  subtitle: {
    fontSize: 13, color: '#64748b', marginTop: 4,
  },
  // KPI卡片区
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16,
    marginBottom: 24,
  },
  kpiRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16,
    marginBottom: 16,
  },
  kpiCard: {
    background: '#fff',
    borderRadius: 12,
    padding: '20px 24px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  kpiIconRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  kpiIconWrap: {
    width: 40, height: 40, borderRadius: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  kpiTrend: {
    fontSize: 12, fontWeight: 600, padding: '2px 8px', borderRadius: 6,
    display: 'flex', alignItems: 'center', gap: 2,
  },
  kpiValue: {
    fontSize: 26, fontWeight: 700, color: '#1a3a5c', lineHeight: 1.2,
  },
  kpiLabel: {
    fontSize: 12, color: '#64748b',
  },
  // Tab导航
  tabNav: {
    display: 'flex',
    gap: 4,
    background: '#f1f5f9',
    padding: 4,
    borderRadius: 10,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    padding: '10px 16px',
    borderRadius: 8,
    border: 'none',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  tabContent: {
    background: '#fff',
    borderRadius: 12,
    padding: 24,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  // 图表通用
  chartRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: 16,
    marginBottom: 16,
  },
  chartRowEqual: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
    marginBottom: 16,
  },
  chartCard: {
    background: '#fff',
    borderRadius: 12,
    padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  chartTitle: {
    fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 16,
    display: 'flex', alignItems: 'center', gap: 6,
  },
  // 表格
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 13,
  },
  th: {
    textAlign: 'left',
    padding: '12px 16px',
    background: '#f8fafc',
    color: '#64748b',
    fontWeight: 600,
    borderBottom: '1px solid #e2e8f0',
  },
  td: {
    padding: '12px 16px',
    borderBottom: '1px solid #e2e8f0',
    color: '#1a3a5c',
  },
  // 公式卡片
  formulaCard: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    color: '#fff',
  },
  formulaTitle: {
    fontSize: 14, fontWeight: 600, marginBottom: 8,
  },
  formula: {
    fontSize: 20, fontWeight: 700, fontFamily: 'monospace',
    background: 'rgba(255,255,255,0.2)',
    padding: '12px 16px',
    borderRadius: 8,
    display: 'inline-block',
  },
  // 等级标签
  levelBadge: {
    padding: '2px 10px',
    borderRadius: 10,
    fontSize: 12,
    fontWeight: 600,
  },
  // 空状态
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 24px',
    background: '#fff',
    borderRadius: 12,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    textAlign: 'center',
  },
  emptyStateIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    background: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: '#1a3a5c',
    marginBottom: 6,
  },
  emptyStateDesc: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 16,
  },
  emptyStateAction: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 16px',
    borderRadius: 6,
    border: 'none',
    background: '#3b82f6',
    color: '#fff',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    minHeight: 40,
  },
  // 搜索和筛选
  filterRow: {
    display: 'flex',
    gap: 12,
    alignItems: 'center',
    background: '#f8fafc',
    padding: '12px 16px',
    borderRadius: 10,
    marginBottom: 20,
    flexWrap: 'wrap' as const,
  },
  searchInput: {
    flex: 1,
    minWidth: 180,
    padding: '8px 12px',
    borderRadius: 6,
    border: '1px solid #e2e8f0',
    fontSize: 13,
    color: '#1a3a5c',
    background: '#fff',
    outline: 'none',
    minHeight: 44,
  },
  filterBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 16px',
    borderRadius: 6,
    border: '1px solid #e2e8f0',
    background: '#fff',
    cursor: 'pointer',
    fontSize: 13,
    color: '#64748b',
    minHeight: 44,
  },
  actionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 16px',
    borderRadius: 6,
    border: 'none',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 500,
    minHeight: 44,
  },
}

// ============ SVG图表组件 ============
const BarChartSVG = ({ data, height = 280 }: { data: { bars: { value: number, color: string, label?: string }[], labels: string[], maxValue?: number } | { bars: { value: number, color: string, label?: string }[], labels: string[], maxValue?: number, showGrouped?: boolean, groupKeys?: string[] }, height?: number }) => {
  const maxVal = Math.max(...(Array.isArray(data.bars) ? data.bars : []).map(b => 
    Array.isArray(b.value) ? Math.max(...b.value) : b.value
  ), ...(data.maxValue ? [data.maxValue] : []))
  
  const chartHeight = height - 60
  const barWidth = 32
  const groupGap = 48
  const startX = 50
  const chartWidth = Math.max(600, startX + data.labels.length * groupGap + 40)
  
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${chartWidth} ${height}`} style={{ minWidth: 500 }}>
      {/* Y轴网格线和标签 */}
      {[0, 0.25, 0.5, 0.75, 1].map((tick, i) => {
        const y = chartHeight - tick * chartHeight + 10
        const value = Math.round(maxVal * tick)
        return (
          <g key={i}>
            <line x1={startX} y1={y} x2={chartWidth - 20} y2={y} stroke="#e2e8f0" strokeDasharray="4,4" />
            <text x={startX - 10} y={y + 4} textAnchor="end" fontSize={11} fill="#94a3b8">{value}</text>
          </g>
        )
      })}
      
      {/* 柱子 */}
      {'showGrouped' in data && data.showGrouped ? (
        // 分组柱状图
        data.labels.map((label, i) => {
          const values = data.bars[i]?.value as number[] || []
          const groupKeys = data.groupKeys || []
          const groupWidth = barWidth * groupKeys.length + 8 * (groupKeys.length - 1)
          const x = startX + i * groupGap + (groupGap - groupWidth) / 2
          
          return (
            <g key={i}>
              {values.map((v, j) => {
                const barHeight = (v / maxVal) * chartHeight
                const bx = x + j * (barWidth + 8)
                const by = chartHeight - barHeight + 10
                return (
                  <rect
                    key={j}
                    x={bx}
                    y={by}
                    width={barWidth}
                    height={barHeight}
                    fill={data.bars[i]?.color[j] || '#3b82f6'}
                    rx={4}
                  />
                )
              })}
              <text x={startX + i * groupGap + groupGap / 2} y={chartHeight + 25} textAnchor="middle" fontSize={11} fill="#64748b">{label}</text>
            </g>
          )
        })
      ) : (
        // 普通柱状图
        data.bars.map((bar, i) => {
          const barHeight = (Array.isArray(bar.value) ? bar.value[0] : bar.value) / maxVal * chartHeight
          const x = startX + i * groupGap + (groupGap - barWidth) / 2
          const y = chartHeight - barHeight + 10
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={bar.color}
                rx={4}
              />
              {bar.label && (
                <text x={startX + i * groupGap + groupGap / 2} y={chartHeight + 25} textAnchor="middle" fontSize={11} fill="#64748b">{bar.label}</text>
              )}
            </g>
          )
        })
      )}
      
      {/* X轴 */}
      <line x1={startX} y1={chartHeight + 10} x2={chartWidth - 20} y2={chartHeight + 10} stroke="#e2e8f0" />
    </svg>
  )
}

const PieChartSVG = ({ data, size = 200 }: { data: { name: string, value: number, color: string }[], size?: number }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0)
  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 10
  let startAngle = -90
  
  const paths = data.map((item, i) => {
    const angle = (item.value / total) * 360
    const endAngle = startAngle + angle
    const x1 = cx + r * Math.cos((startAngle * Math.PI) / 180)
    const y1 = cy + r * Math.sin((startAngle * Math.PI) / 180)
    const x2 = cx + r * Math.cos((endAngle * Math.PI) / 180)
    const y2 = cy + r * Math.sin((endAngle * Math.PI) / 180)
    const largeArc = angle > 180 ? 1 : 0
    const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`
    startAngle = endAngle
    return { ...item, path, percent: ((item.value / total) * 100).toFixed(1) }
  })

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
      <svg width={size} height={size}>
        {paths.map((p, i) => (
          <path key={i} d={p.path} fill={p.color} />
        ))}
        <circle cx={cx} cy={cy} r={r * 0.5} fill="#fff" />
        <text x={cx} y={cy - 8} textAnchor="middle" fontSize={20} fontWeight={700} fill="#1a3a5c">{total.toLocaleString()}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize={11} fill="#64748b">总检查量</text>
      </svg>
      <div style={{ flex: 1 }}>
        {paths.map((p, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: p.color }} />
            <span style={{ flex: 1, fontSize: 13, color: '#1a3a5c' }}>{p.name}</span>
            <span style={{ fontSize: 13, color: '#64748b' }}>{p.value.toLocaleString()}</span>
            <span style={{ fontSize: 12, color: '#94a3b8', width: 45, textAlign: 'right' }}>{p.percent}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const LineChartSVG = ({ data, lines, height = 280 }: { data: { [key: string]: string | number }[], lines: { key: string, color: string, name: string }[], height?: number }) => {
  const chartHeight = height - 60
  const keys = lines.map(l => l.key)
  const allValues = data.flatMap(d => keys.map(k => Number(d[k]) || 0))
  const maxVal = Math.max(...allValues)
  const minVal = Math.min(...allValues)
  const range = maxVal - minVal || 1
  const startX = 50
  const chartWidth = 600
  const stepX = (chartWidth - startX - 40) / (data.length - 1)

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${chartWidth} ${height}`} style={{ minWidth: 500 }}>
      {/* Y轴网格 */}
      {[0, 0.25, 0.5, 0.75, 1].map((tick, i) => {
        const y = chartHeight - tick * chartHeight + 10
        const value = Math.round(minVal + range * tick)
        return (
          <g key={i}>
            <line x1={startX} y1={y} x2={chartWidth - 20} y2={y} stroke="#e2e8f0" strokeDasharray="4,4" />
            <text x={startX - 10} y={y + 4} textAnchor="end" fontSize={11} fill="#94a3b8">{value}</text>
          </g>
        )
      })}
      
      {/* 线 */}
      {lines.map((line, li) => (
        <g key={li}>
          {data.map((d, i) => {
            const x = startX + i * stepX
            const y = chartHeight - ((Number(d[line.key]) - minVal) / range) * chartHeight + 10
            const nextY = i < data.length - 1 
              ? chartHeight - ((Number(data[i + 1][line.key]) - minVal) / range) * chartHeight + 10
              : y
            const nextX = startX + (i + 1) * stepX
            return (
              <line
                key={i}
                x1={x} y1={y}
                x2={nextX} y2={nextY}
                stroke={line.color}
                strokeWidth={2}
              />
            )
          })}
          {data.map((d, i) => {
            const x = startX + i * stepX
            const y = chartHeight - ((Number(d[line.key]) - minVal) / range) * chartHeight + 10
            return (
              <circle key={i} cx={x} cy={y} r={4} fill={line.color} />
            )
          })}
        </g>
      ))}
      
      {/* X轴标签 */}
      {data.map((d, i) => (
        <text
          key={i}
          x={startX + i * stepX}
          y={chartHeight + 25}
          textAnchor="middle"
          fontSize={11}
          fill="#64748b"
        >
          {d.month}
        </text>
      ))}
      
      {/* 图例 */}
      <g transform={`translate(${startX}, ${height - 15})`}>
        {lines.map((line, i) => (
          <g key={i} transform={`translate(${i * 120}, 0)`}>
            <line x1={0} y1={0} x2={20} y2={0} stroke={line.color} strokeWidth={2} />
            <circle cx={10} cy={0} r={4} fill={line.color} />
            <text x={28} y={4} fontSize={11} fill="#64748b">{line.name}</text>
          </g>
        ))}
      </g>
    </svg>
  )
}

const HorizontalBarSVG = ({ data, height = 200 }: { data: { name: string, value: number, rate: number, color: string }[], height?: number }) => {
  const barHeight = 28
  const gap = 12
  const labelWidth = 80
  const startX = labelWidth + 10
  const chartWidth = 400
  const maxRate = Math.max(...data.map(d => d.rate))
  
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${chartWidth + 100} ${height}`}>
      {data.map((d, i) => {
        const y = i * (barHeight + gap) + 10
        const barW = (d.rate / maxRate) * chartWidth
        return (
          <g key={i}>
            <text x={0} y={y + barHeight / 2 + 4} fontSize={12} fill="#64748b" textAnchor="start">{d.name}</text>
            <rect x={startX} y={y} width={barW} height={barHeight} fill={d.color} rx={4} />
            <text x={startX + barW + 8} y={y + barHeight / 2 + 4} fontSize={11} fill="#1a3a5c">{d.rate.toFixed(2)}%</text>
            <text x={startX + barW + 60} y={y + barHeight / 2 + 4} fontSize={11} fill="#94a3b8">{d.count}例</text>
          </g>
        )
      })}
    </svg>
  )
}

// ============ 助手组件 ============
const TrendBadge = ({ trend, trendUp }: { trend: string, trendUp: boolean | null }) => {
  const style: React.CSSProperties = {
    ...s.kpiTrend,
    background: trendUp === true ? '#fef2f2' : trendUp === false ? '#f0fdf4' : '#f8fafc',
    color: trendUp === true ? '#ef4444' : trendUp === false ? '#22c55e' : '#64748b',
  }
  const Icon = trendUp === true ? ArrowUp : trendUp === false ? ArrowDown : Minus
  return (
    <span style={style}>
      <Icon size={12} />
      {trend}
    </span>
  )
}

// ============ Tab内容组件 ============
const Tab1ExamStats = () => (
  <div>
    <div style={s.chartRow}>
      <div style={s.chartCard}>
        <div style={s.chartTitle}><BarChart3 size={16} color="#3b82f6" />近12个月检查量趋势</div>
        <BarChartSVG
          data={{
            labels: MONTHLY_EXAM_DATA.map(d => d.month),
            bars: MONTHLY_EXAM_DATA.map(d => ({
              value: d.gastroscope + d.colonoscopy + d.ultrasound + d.ercp + d.capsule,
              color: '#3b82f6',
            })),
            maxValue: 1400,
          }}
        />
      </div>
      <div style={s.chartCard}>
        <div style={s.chartTitle}><PieChartIcon size={16} color="#8b5cf6" />检查类型分布</div>
        <PieChartSVG data={EXAM_TYPE_DISTRIBUTION} />
      </div>
    </div>
    <div style={s.chartCard}>
      <div style={s.chartTitle}><Users size={16} color="#22c55e" />各医生检查量排名</div>
      <table style={s.table}>
        <thead>
          <tr>
            {['排名', '姓名', '检查数量', '报告质量分', '完成率', '等级'].map(h => (
              <th key={h} style={s.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DOCTOR_RANKING.map((d, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? '#fafafa' : '#fff' }}>
              <td style={s.td}>{d.rank}</td>
              <td style={s.td}>{d.name}</td>
              <td style={s.td}>{d.exams}</td>
              <td style={s.td}>{d.reportScore}</td>
              <td style={s.td}>{d.completion}%</td>
              <td style={s.td}>
                <span style={{
                  ...s.levelBadge,
                  background: d.level === 'S' ? '#f5f3ff' : d.level === 'A' ? '#f0fdf4' : d.level === 'B' ? '#eff6ff' : '#fff7ed',
                  color: d.level === 'S' ? '#8b5cf6' : d.level === 'A' ? '#22c55e' : d.level === 'B' ? '#3b82f6' : '#f97316',
                }}>{d.level}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)

const Tab2QualityAnalysis = () => (
  <div>
    <div style={s.chartRowEqual}>
      <div style={s.chartCard}>
        <div style={s.chartTitle}><TrendingUp size={16} color="#8b5cf6" />近12个月质控评分趋势</div>
        <LineChartSVG
          data={QC_TREND_DATA}
          lines={[
            { key: 'imageQuality', color: '#3b82f6', name: '图片质量' },
            { key: 'operationStandard', color: '#22c55e', name: '操作规范' },
            { key: 'reportStandard', color: '#f97316', name: '报告规范' },
            { key: 'overall', color: '#8b5cf6', name: '综合分' },
          ]}
        />
      </div>
      <div style={s.chartCard}>
        <div style={s.chartTitle}><AlertTriangle size={16} color="#ef4444" />各类并发症发生率</div>
        <HorizontalBarSVG data={COMPLICATION_DATA} />
      </div>
    </div>
    <div style={s.chartCard}>
      <div style={s.chartTitle}><Stethoscope size={16} color="#64748b" />并发症详情记录</div>
      <table style={s.table}>
        <thead>
          <tr>
            {['患者', '类型', '处理措施', '结果', '日期'].map(h => (
              <th key={h} style={s.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {COMPLICATION_DETAILS.map((d, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? '#fafafa' : '#fff' }}>
              <td style={s.td}>{d.patient}</td>
              <td style={s.td}>
                <span style={{
                  padding: '2px 8px', borderRadius: 6, fontSize: 12,
                  background: d.type === '出血' ? '#fef2f2' : d.type === '穿孔' ? '#fff7ed' : d.type === '感染' ? '#f5f3ff' : '#f0fdfa',
                  color: d.type === '出血' ? '#ef4444' : d.type === '穿孔' ? '#f97316' : d.type === '感染' ? '#8b5cf6' : '#14b8a6',
                }}>{d.type}</span>
              </td>
              <td style={s.td}>{d.handling}</td>
              <td style={s.td}>
                <span style={{ color: d.result === '痊愈' ? '#22c55e' : '#f97316' }}>{d.result}</span>
              </td>
              <td style={s.td}>{d.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)

const Tab3IncomeStats = () => (
  <div>
    <div style={s.chartRow}>
      <div style={s.chartCard}>
        <div style={s.chartTitle}><BarChart3 size={16} color="#22c55e" />各检查项目收入分布</div>
        <BarChartSVG
          data={{
            labels: INCOME_DATA.map(d => d.type),
            bars: INCOME_DATA.map((d, i) => ({
              value: d.income / 1000,
              color: ['#3b82f6', '#22c55e', '#f97316', '#8b5cf6', '#14b8a6'][i],
            })),
            maxValue: 3000,
          }}
        />
      </div>
      <div style={s.chartCard}>
        <div style={s.chartTitle}><TrendingUp size={16} color="#f97316" />近6个月收入趋势</div>
        <LineChartSVG
          data={INCOME_TREND}
          lines={[
            { key: 'income', color: '#22c55e', name: '收入' },
            { key: 'cost', color: '#ef4444', name: '成本' },
            { key: 'profit', color: '#3b82f6', name: '利润' },
          ]}
          height={240}
        />
      </div>
    </div>
    <div style={s.chartCard}>
      <div style={s.chartTitle}><Activity size={16} color="#64748b" />各检查类型收入/成本/利润明细</div>
      <table style={s.table}>
        <thead>
          <tr>
            {['检查类型', '收入(元)', '成本(元)', '利润(元)', '利润率'].map(h => (
              <th key={h} style={s.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {INCOME_DATA.map((d, i) => {
            const rate = (d.profit / d.income * 100).toFixed(1)
            return (
              <tr key={i} style={{ background: i % 2 === 0 ? '#fafafa' : '#fff' }}>
                <td style={s.td}>{d.type}</td>
                <td style={s.td}>{d.income.toLocaleString()}</td>
                <td style={s.td}>{d.cost.toLocaleString()}</td>
                <td style={s.td}>{d.profit.toLocaleString()}</td>
                <td style={s.td}>
                  <span style={{ color: Number(rate) > 35 ? '#22c55e' : Number(rate) > 30 ? '#f97316' : '#ef4444' }}>
                    {rate}%
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  </div>
)

const Tab4DoctorPerformance = () => {
  const totalExams = DOCTOR_RANKING.reduce((sum, d) => sum + d.exams, 0)
  const avgReport = DOCTOR_RANKING.reduce((sum, d) => sum + d.reportScore, 0) / DOCTOR_RANKING.length
  const avgQC = 95.5
  
  return (
    <div>
      <div style={s.formulaCard}>
        <div style={s.formulaTitle}>综合评分公式</div>
        <div style={s.formula}>ReportScore = 报告质量×40% + 检查数量×30% + 质控合规×30%</div>
        <div style={{ marginTop: 12, fontSize: 13, opacity: 0.9 }}>
          其中：报告质量均分 {avgReport.toFixed(1)} | 质控合规均分 {avgQC} | 总检查量 {totalExams}台
        </div>
      </div>
      <div style={s.chartCard}>
        <div style={s.chartTitle}><Award size={16} color="#8b5cf6" />医生绩效排名</div>
        <table style={s.table}>
          <thead>
            <tr>
              {['排名', '姓名', '检查量', '报告分', '质控分', '综合分', '等级'].map(h => (
                <th key={h} style={s.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DOCTOR_RANKING.map((d, i) => {
              const reportNorm = d.reportScore / 100
              const examNorm = d.exams / 400
              const qcNorm = 0.95
              const score = (reportNorm * 0.4 + examNorm * 0.3 + qcNorm * 0.3 * 100).toFixed(1)
              return (
                <tr key={i} style={{ background: i % 2 === 0 ? '#fafafa' : '#fff' }}>
                  <td style={s.td}>
                    {d.rank <= 3 ? <span style={{ fontWeight: 700, color: '#f59e0b' }}>●</span> : ''}{d.rank}
                  </td>
                  <td style={s.td}>{d.name}</td>
                  <td style={s.td}>{d.exams}</td>
                  <td style={s.td}>{d.reportScore}</td>
                  <td style={s.td}>95.5</td>
                  <td style={s.td}><b>{score}</b></td>
                  <td style={s.td}>
                    <span style={{
                      ...s.levelBadge,
                      background: d.level === 'S' ? '#f5f3ff' : d.level === 'A' ? '#f0fdf4' : d.level === 'B' ? '#eff6ff' : '#fff7ed',
                      color: d.level === 'S' ? '#8b5cf6' : d.level === 'A' ? '#22c55e' : d.level === 'B' ? '#3b82f6' : '#f97316',
                    }}>{d.level}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const Tab5TimeAnalysis = () => (
  <div>
    <div style={s.chartRowEqual}>
      <div style={s.chartCard}>
        <div style={s.chartTitle}><Clock size={16} color="#3b82f6" />每日各时段检查量分布</div>
        <BarChartSVG
          data={{
            labels: TIME_SEGMENT_DATA.map(d => d.hour),
            bars: TIME_SEGMENT_DATA.map(d => ({
              value: d.count,
              color: d.isPeak ? '#ef4444' : '#3b82f6',
            })),
            maxValue: 250,
          }}
        />
        <div style={{ marginTop: 8, fontSize: 11, color: '#ef4444' }}>
          * 红色标注为高峰时段 (11:00, 15:00)
        </div>
      </div>
      <div style={s.chartCard}>
        <div style={s.chartTitle}><Calendar size={16} color="#8b5cf6" />工作日 vs 周末对比</div>
        <LineChartSVG
          data={WEEKDAY_VS_WEEKEND}
          lines={[
            { key: 'weekday', color: '#3b82f6', name: '工作日' },
            { key: 'weekend', color: '#f97316', name: '周末' },
          ]}
          height={240}
        />
      </div>
    </div>
    <div style={s.chartCard}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        <div style={{ background: '#fef2f2', padding: 16, borderRadius: 10 }}>
          <div style={{ fontSize: 12, color: '#ef4444', marginBottom: 4 }}>最忙时段</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#1a3a5c' }}>11:00-12:00</div>
          <div style={{ fontSize: 12, color: '#64748b' }}>225 例检查</div>
        </div>
        <div style={{ background: '#eff6ff', padding: 16, borderRadius: 10 }}>
          <div style={{ fontSize: 12, color: '#3b82f6', marginBottom: 4 }}>次忙时段</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#1a3a5c' }}>15:00-16:00</div>
          <div style={{ fontSize: 12, color: '#64748b' }}>215 例检查</div>
        </div>
        <div style={{ background: '#f0fdf4', padding: 16, borderRadius: 10 }}>
          <div style={{ fontSize: 12, color: '#22c55e', marginBottom: 4 }}>最闲时段</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#1a3a5c' }}>08:00-09:00</div>
          <div style={{ fontSize: 12, color: '#64748b' }}>45 例检查</div>
        </div>
      </div>
    </div>
  </div>
)

const Tab6EquipmentAnalysis = () => (
  <div>
    <div style={s.chartRowEqual}>
      <div style={s.chartCard}>
        <div style={s.chartTitle}><Microscope size={16} color="#14b8a6" />US设备使用率对比</div>
        <BarChartSVG
          data={{
            labels: EQUIPMENT_DATA.map(d => d.name.split(' ')[0]),
            bars: EQUIPMENT_DATA.map(d => ({
              value: d.usageRate,
              color: d.usageRate > 85 ? '#22c55e' : d.usageRate > 70 ? '#3b82f6' : '#f97316',
            })),
            maxValue: 100,
          }}
        />
      </div>
      <div style={{ ...s.chartCard, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>设备总体状况</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#1a3a5c' }}>78.4%</div>
          <div style={{ fontSize: 12, color: '#22c55e' }}>平均使用率</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ background: '#f0fdf4', padding: 12, borderRadius: 8, textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#22c55e' }}>12</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>总故障次数</div>
          </div>
          <div style={{ background: '#fff7ed', padding: 12, borderRadius: 8, textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#f97316' }}>¥11.5万</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>维修总费用</div>
          </div>
        </div>
      </div>
    </div>
    <div style={s.chartCard}>
      <div style={s.chartTitle}><Scissors size={16} color="#64748b" />设备明细一览</div>
      <table style={s.table}>
        <thead>
          <tr>
            {['设备名称', '使用频次', '故障次数', '维修费用', '使用率'].map(h => (
              <th key={h} style={s.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {EQUIPMENT_DATA.map((d, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? '#fafafa' : '#fff' }}>
              <td style={s.td}>{d.name}</td>
              <td style={s.td}>{d.usage} 次</td>
              <td style={s.td}>
                <span style={{ color: d.faults > 3 ? '#ef4444' : d.faults > 1 ? '#f97316' : '#22c55e' }}>
                  {d.faults} 次
                </span>
              </td>
              <td style={s.td}>
                {d.repairCost > 0 ? `¥${d.repairCost.toLocaleString()}` : '-'}
              </td>
              <td style={s.td}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1, height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${d.usageRate}%`, 
                      height: '100%', 
                      background: d.usageRate > 85 ? '#22c55e' : d.usageRate > 70 ? '#3b82f6' : '#f97316',
                      borderRadius: 3,
                    }} />
                  </div>
                  <span style={{ fontSize: 12, color: '#64748b', width: 35 }}>{d.usageRate}%</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)

// ============ 主组件 ============
export default function StatsEnhancedPage() {
  const [activeTab, setActiveTab] = useState(0)
  const [searchText, setSearchText] = useState('')
  const tabs = [
    { name: '检查量统计', icon: BarChart3 },
    { name: '质量分析', icon: ShieldCheck },
    { name: '收入统计', icon: TrendingUp },
    { name: '医生绩效', icon: Award },
    { name: '时段分析', icon: Clock },
    { name: '设备分析', icon: Microscope },
  ]

  const tabContents = [Tab1ExamStats, Tab2QualityAnalysis, Tab3IncomeStats, Tab4DoctorPerformance, Tab5TimeAnalysis, Tab6EquipmentAnalysis]
  const ActiveTabContent = tabContents[activeTab]

  return (
    <div style={s.root}>
      {/* 标题区 */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>增强统计分析</h1>
          <p style={s.subtitle}>智慧消化专科诊疗平台 · 多维度数据统计</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ ...s.filterBtn, background: '#fff' }}>
            <Download size={14} /> 导出报告
          </button>
          <button style={{ ...s.actionBtn, background: '#3b82f6', color: '#fff' }}>
            <RefreshCw size={14} /> 刷新数据
          </button>
        </div>
      </div>

      {/* 搜索筛选栏 */}
      <div style={s.filterRow}>
        <Search size={14} color="#64748b" />
        <input
          style={s.searchInput}
          placeholder="搜索统计数据..."
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
        />
        <select style={{ ...s.filterBtn, borderRadius: 6 }}>
          <option>全部分类</option>
          <option>检查量统计</option>
          <option>质量分析</option>
          <option>收入统计</option>
          <option>医生绩效</option>
          <option>时段分析</option>
          <option>设备分析</option>
        </select>
        <select style={{ ...s.filterBtn, borderRadius: 6 }}>
          <option>全部时间</option>
          <option>近30天</option>
          <option>近90天</option>
          <option>近一年</option>
        </select>
      </div>

      {/* KPI概览卡片 */}
      <div style={s.kpiRow}>
        {KPI_DATA.slice(0, 4).map((kpi, i) => {
          const Icon = kpi.icon
          return (
            <div key={i} style={s.kpiCard}>
              <div style={s.kpiIconRow}>
                <div style={{ ...s.kpiIconWrap, background: kpi.bg }}>
                  <Icon size={20} color={kpi.color} />
                </div>
                <TrendBadge trend={kpi.trend} trendUp={kpi.trendUp} />
              </div>
              <div style={s.kpiValue}>{kpi.value}</div>
              <div style={s.kpiLabel}>{kpi.label}</div>
            </div>
          )
        })}
      </div>
      <div style={s.kpiRow}>
        {KPI_DATA.slice(4, 8).map((kpi, i) => {
          const Icon = kpi.icon
          return (
            <div key={i} style={s.kpiCard}>
              <div style={s.kpiIconRow}>
                <div style={{ ...s.kpiIconWrap, background: kpi.bg }}>
                  <Icon size={20} color={kpi.color} />
                </div>
                <TrendBadge trend={kpi.trend} trendUp={kpi.trendUp} />
              </div>
              <div style={s.kpiValue}>{kpi.value}</div>
              <div style={s.kpiLabel}>{kpi.label}</div>
            </div>
          )
        })}
      </div>

      {/* Tab导航 */}
      <div style={s.tabNav}>
        {tabs.map((tab, i) => {
          const Icon = tab.icon
          return (
            <button
              key={i}
              style={{
                ...s.tabButton,
                background: activeTab === i ? '#fff' : 'transparent',
                color: activeTab === i ? '#1a3a5c' : '#64748b',
                boxShadow: activeTab === i ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
              onClick={() => setActiveTab(i)}
            >
              <Icon size={16} />
              {tab.name}
            </button>
          )
        })}
      </div>

      {/* Tab内容 */}
      <div style={s.tabContent}>
        <ActiveTabContent />
      </div>
    </div>
  )
}
