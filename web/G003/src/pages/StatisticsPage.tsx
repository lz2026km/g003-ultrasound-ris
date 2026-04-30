// @ts-nocheck
// ============================================================
// G003 超声RIS系统 - 统计报表页面
// 数据统计 / 报表分析 / 趋势图表 / KPI监控
// ============================================================
import { useState } from 'react'
import { useNavigate as useNavigateRouter } from 'react-router-dom'
import {
  BarChart3, LineChart, PieChart as PieChartIcon, TrendingUp,
  TrendingDown, Activity, FileText, Users, Clock, CheckCircle,
  AlertTriangle, Calendar, Download, RefreshCw, Filter,
  Eye, Printer, Share2, CalendarClock, Stethoscope,
  Monitor, Package, Wrench, HardDrive, Scan, HeartPulse
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from 'recharts'
import { initialStatisticsData } from '../data/initialData'

// ---------- 样式 ----------
const s: Record<string, React.CSSProperties> = {
  root: { padding: 0 },
  header: { marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 700, color: '#1a3a5c', margin: 0 },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 4 },
  headerRight: { display: 'flex', gap: 8 },
  // 操作按钮
  btn: {
    padding: '8px 16px', borderRadius: 8, border: 'none',
    cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex',
    alignItems: 'center', gap: 6, transition: 'all 0.2s',
  },
  btnPrimary: { background: '#3b82f6', color: '#fff' },
  btnSecondary: { background: '#f1f5f9', color: '#475569' },
  // 时间选择器
  timeSelector: {
    display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap',
  },
  timeBtn: {
    padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0',
    background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 500,
    transition: 'all 0.2s',
  },
  timeBtnActive: { background: '#3b82f6', color: '#fff', borderColor: '#3b82f6' },
  // 统计卡片行
  statRow: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24,
  },
  statCard: {
    background: '#fff', borderRadius: 12, padding: '20px 24px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex',
    alignItems: 'center', gap: 16,
  },
  statIconWrap: {
    width: 48, height: 48, borderRadius: 10, display: 'flex',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  statInfo: { flex: 1, minWidth: 0 },
  statValue: { fontSize: 26, fontWeight: 700, color: '#1a3a5c', lineHeight: 1.2 },
  statLabel: { fontSize: 12, color: '#64748b', marginTop: 2 },
  statTrend: { fontSize: 11, marginTop: 4, display: 'flex', alignItems: 'center', gap: 2 },
  // 图表卡片
  chartCard: {
    background: '#fff', borderRadius: 12, padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 24,
  },
  chartTitle: {
    fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 16,
    display: 'flex', alignItems: 'center', gap: 6,
  },
  chartIcon: { color: '#64748b' },
  chartRow: {
    display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 24,
  },
  // KPI升级卡片
  kpiCard: {
    background: '#fff', borderRadius: 12, padding: '20px 24px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex',
    alignItems: 'center', gap: 20,
  },
  kpiLeft: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 },
  kpiCenter: { flex: 1 },
  kpiValue: { fontSize: 28, fontWeight: 700, color: '#1a3a5c', lineHeight: 1.1 },
  kpiLabel: { fontSize: 12, color: '#64748b', marginTop: 2 },
  kpiTrendUp: { fontSize: 11, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 2 },
  kpiTrendDown: { fontSize: 11, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 2 },
  // 表格
  table: {
    width: '100%', borderCollapse: 'collapse', fontSize: 13,
  },
  th: {
    textAlign: 'left', padding: '12px 16px', background: '#f8fafc',
    color: '#64748b', fontWeight: 600, borderBottom: '1px solid #e2e8f0',
  },
  td: {
    padding: '12px 16px', borderBottom: '1px solid #f1f5f9',
    color: '#475569',
  },
  // 颜色
  blue: { backgroundColor: '#eff6ff', color: '#3b82f6' },
  green: { backgroundColor: '#f0fdf4', color: '#22c55e' },
  orange: { backgroundColor: '#fff7ed', color: '#f97316' },
  red: { backgroundColor: '#fef2f2', color: '#ef4444' },
  purple: { backgroundColor: '#f5f3ff', color: '#8b5cf6' },
  teal: { backgroundColor: '#f0fdfa', color: '#14b8a6' },
}

const PIE_COLORS = ['#3b82f6', '#22c55e', '#f97316', '#8b5cf6', '#14b8a6']

const tooltipStyle = {
  contentStyle: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 },
  labelStyle: { color: '#1a3a5c', fontWeight: 600 },
}

// 环形进度
const RingProgress = ({ percent, size = 56, strokeWidth = 6, color = '#3b82f6' }: { percent: number, size?: number, strokeWidth?: number, color?: string }) => {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (percent / 100) * circumference
  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={strokeWidth} />
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <span style={{ position: 'absolute', fontSize: 11, fontWeight: 700, color: '#1a3a5c' }}>{percent}%</span>
    </div>
  )
}

// Sparkline迷你趋势图
const Sparkline = ({ data, color = '#3b82f6' }: { data: number[], color?: string }) => {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const w = data.length * 6
  const h = 28
  const points = data.map((v, i) => `${i * (w / (data.length - 1))},${h - ((v - min) / range) * h}`).join(' ')
  return (
    <svg width={w} height={h}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  )
}

const TIME_RANGES = ['今日', '本周', '本月', '本季度', '本年', '自定义']

const EXAM_TYPE_DATA = [
  { name: '腹部超声', value: 35, color: '#3b82f6' },
  { name: '心血管超声', value: 25, color: '#22c55e' },
  { name: '甲状腺超声', value: 15, color: '#f97316' },
  { name: '产科超声', value: 12, color: '#8b5cf6' },
  { name: '其他', value: 13, color: '#14b8a6' },
]

const DEVICE_USAGE = [
  { name: '彩超仪 A', usage: 92, exams: 184, color: '#3b82f6' },
  { name: '彩超仪 B', usage: 78, exams: 156, color: '#22c55e' },
  { name: '彩超仪 C', usage: 65, exams: 130, color: '#f97316' },
]

const DOCTOR_STATS = [
  { name: '李明辉', exams: 86, reports: 82, completion: 95, trend: '+5%' },
  { name: '王芳', exams: 72, reports: 70, completion: 97, trend: '+3%' },
  { name: '张伟', exams: 65, reports: 60, completion: 92, trend: '+8%' },
  { name: '刘静', exams: 58, reports: 55, completion: 95, trend: '+2%' },
]

const MONTHLY_TREND = [
  { month: '1月', 检查数: 420, 报告数: 380, 预约数: 450 },
  { month: '2月', 检查数: 480, 报告数: 440, 预约数: 510 },
  { month: '3月', 检查数: 520, 报告数: 490, 预约数: 560 },
  { month: '4月', 检查数: 490, 报告数: 470, 预约数: 530 },
  { month: '5月', 检查数: 560, 报告数: 530, 预约数: 600 },
  { month: '6月', 检查数: 580, 报告数: 550, 预约数: 620 },
]

export default function StatisticsPage() {
  const navigate = useNavigateRouter()
  const stats = initialStatisticsData
  const [timeRange, setTimeRange] = useState('本月')

  const filteredData = MONTHLY_TREND

  return (
    <div style={s.root}>
      {/* 标题 */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>统计报表</h1>
          <p style={s.subtitle}>数据统计 · 报表分析 · 趋势监控</p>
        </div>
        <div style={s.headerRight}>
          <button style={{ ...s.btn, ...s.btnSecondary }}>
            <RefreshCw size={14} /> 刷新
          </button>
          <button style={{ ...s.btn, ...s.btnSecondary }}>
            <Download size={14} /> 导出报表
          </button>
          <button style={{ ...s.btn, ...s.btnPrimary }}>
            <Printer size={14} /> 打印
          </button>
        </div>
      </div>

      {/* 时间选择 */}
      <div style={s.timeSelector}>
        {TIME_RANGES.map(range => (
          <button
            key={range}
            style={{
              ...s.timeBtn,
              ...(timeRange === range ? s.timeBtnActive : {}),
            }}
            onClick={() => setTimeRange(range)}
          >
            {range}
          </button>
        ))}
      </div>

      {/* 统计卡片行 */}
      <div style={s.statRow}>
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, background: '#eff6ff' }}>
            <Activity size={22} color="#3b82f6" />
          </div>
          <div style={s.statInfo}>
            <div style={s.statValue}>{stats.todayExams}</div>
            <div style={s.statLabel}>今日检查</div>
            <div style={{ ...s.statTrend, color: '#22c55e' }}>
              <TrendingUp size={11} /> +12%
            </div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, background: '#f0fdf4' }}>
            <FileText size={22} color="#22c55e" />
          </div>
          <div style={s.statInfo}>
            <div style={s.statValue}>{stats.todayReports}</div>
            <div style={s.statLabel}>今日报告</div>
            <div style={{ ...s.statTrend, color: '#22c55e' }}>
              <TrendingUp size={11} /> +8%
            </div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, background: '#fff7ed' }}>
            <CalendarClock size={22} color="#f97316" />
          </div>
          <div style={s.statInfo}>
            <div style={s.statValue}>{stats.todayAppointments}</div>
            <div style={s.statLabel}>今日预约</div>
            <div style={{ ...s.statTrend, color: '#f97316' }}>
              <TrendingDown size={11} /> -3%
            </div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, background: '#fef2f2' }}>
            <AlertTriangle size={22} color="#ef4444" />
          </div>
          <div style={s.statInfo}>
            <div style={s.statValue}>{stats.pendingReports}</div>
            <div style={s.statLabel}>待写报告</div>
            <div style={{ ...s.statTrend, color: '#ef4444' }}>
              <TrendingUp size={11} /> +3
            </div>
          </div>
        </div>
      </div>

      {/* KPI升级卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: '报告完成率', value: 92.5, unit: '%', ring: 93, ringColor: '#22c55e', trend: '+2.3%', trendUp: true, spark: [82, 85, 87, 89, 90, 91, 93], sparkColor: '#22c55e' },
          { label: '平均检查时长', value: 18.5, unit: '分钟', ring: 75, ringColor: '#3b82f6', trend: '-2.1分钟', trendUp: true, spark: [22, 21, 20, 19, 19, 18.5, 18.5], sparkColor: '#3b82f6' },
          { label: '设备利用率', value: 78.3, unit: '%', ring: 78, ringColor: '#14b8a6', trend: '+5.2%', trendUp: true, spark: [68, 70, 72, 74, 75, 77, 78], sparkColor: '#14b8a6' },
          { label: '患者满意度', value: 96.8, unit: '%', ring: 97, ringColor: '#8b5cf6', trend: '+1.2%', trendUp: true, spark: [93, 94, 95, 95, 96, 96.5, 97], sparkColor: '#8b5cf6' },
        ].map((kpi) => (
          <div key={kpi.label} style={s.kpiCard}>
            <div style={s.kpiLeft}>
              <RingProgress percent={kpi.ring} color={kpi.ringColor} />
            </div>
            <div style={s.kpiCenter}>
              <div style={s.kpiValue}>{kpi.value}<span style={{ fontSize: 14, fontWeight: 400 }}>{kpi.unit}</span></div>
              <div style={s.kpiLabel}>{kpi.label}</div>
              <div style={kpi.trendUp ? s.kpiTrendUp : s.kpiTrendDown}>
                {kpi.trendUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />} {kpi.trend}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Sparkline data={kpi.spark} color={kpi.sparkColor} />
            </div>
          </div>
        ))}
      </div>

      {/* 图表行 */}
      <div style={s.chartRow}>
        <div style={s.chartCard}>
          <div style={s.chartTitle}><TrendingUp size={16} style={s.chartIcon} /> 检查与报告趋势</div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={filteredData}>
              <defs>
                <linearGradient id="color检查" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="color报告" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="检查数" stroke="#3b82f6" fill="url(#color检查)" strokeWidth={2} />
              <Area type="monotone" dataKey="报告数" stroke="#22c55e" fill="url(#color报告)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div style={s.chartCard}>
          <div style={s.chartTitle}><PieChartIcon size={16} style={s.chartIcon} /> 检查类型分布</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={stats.examTypeDistribution}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {stats.examTypeDistribution.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip {...tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 设备利用率 */}
      <div style={s.chartCard}>
        <div style={s.chartTitle}><Monitor size={16} style={s.chartIcon} /> 设备利用率</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {DEVICE_USAGE.map((device) => (
            <div key={device.name} style={{ padding: '16px', background: '#f8fafc', borderRadius: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#1a3a5c' }}>{device.name}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: device.color }}>{device.usage}%</span>
              </div>
              <div style={{ height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
                <div style={{ height: '100%', width: `${device.usage}%`, background: device.color, borderRadius: 4 }} />
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>完成检查 {device.exams} 例</div>
            </div>
          ))}
        </div>
      </div>

      {/* 医生工作量表格 */}
      <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginTop: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Users size={16} style={{ color: '#64748b' }} /> 医生工作量统计
        </div>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>医生姓名</th>
              <th style={s.th}>检查数量</th>
              <th style={s.th}>报告数量</th>
              <th style={s.th}>完成率</th>
              <th style={s.th}>趋势</th>
            </tr>
          </thead>
          <tbody>
            {DOCTOR_STATS.map((doc) => (
              <tr key={doc.name}>
                <td style={{ ...s.td, fontWeight: 600, color: '#1a3a5c' }}>{doc.name}</td>
                <td style={s.td}>{doc.exams} 例</td>
                <td style={s.td}>{doc.reports} 份</td>
                <td style={s.td}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden', maxWidth: 100 }}>
                      <div style={{ height: '100%', width: `${doc.completion}%`, background: '#22c55e', borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#22c55e' }}>{doc.completion}%</span>
                  </div>
                </td>
                <td style={{ ...s.td, color: '#22c55e' }}>{doc.trend}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
