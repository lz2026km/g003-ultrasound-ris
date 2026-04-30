// @ts-nocheck
// ============================================================
// G003 超声RIS系统 - 统计报表页面 v0.2.0 增强版
// 数据统计 / 报表分析 / 趋势图表 / KPI监控
// ============================================================
import { useState, useMemo } from 'react'
import {
  Activity, FileText, CalendarClock, AlertTriangle,
  TrendingUp, TrendingDown, Download, RefreshCw,
  Printer, BarChart3, PieChart as PieChartIcon, LineChart,
  Users, Clock, CheckCircle, Calendar, Grid3X3,
  PrinterIcon, FileSpreadsheet
} from 'lucide-react'
import {
  LineChart as RechartsLine, Line, BarChart as RechartsBar, Bar,
  PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ComposedChart
} from 'recharts'
import { initialStatisticsData } from '../data/initialData'

// ---------- 样式 ----------
const s: Record<string, React.CSSProperties> = {
  root: { padding: 0 },
  header: { marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
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
  btnSuccess: { background: '#22c55e', color: '#fff' },
  // 时间选择器
  timeSelector: {
    display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center',
  },
  timeBtn: {
    padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0',
    background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 500,
    transition: 'all 0.2s',
  },
  timeBtnActive: { background: '#3b82f6', color: '#fff', borderColor: '#3b82f6' },
  // 顶部统计卡片行 2x2
  statRow: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20,
  },
  statCard: {
    background: '#fff', borderRadius: 12, padding: '18px 20px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex',
    alignItems: 'center', gap: 14,
  },
  statIconWrap: {
    width: 44, height: 44, borderRadius: 10, display: 'flex',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  statInfo: { flex: 1, minWidth: 0 },
  statValue: { fontSize: 26, fontWeight: 700, color: '#1a3a5c', lineHeight: 1.2 },
  statLabel: { fontSize: 12, color: '#64748b', marginTop: 2 },
  statTrend: { fontSize: 11, marginTop: 4, display: 'flex', alignItems: 'center', gap: 2 },
  // 图表卡片 2x3 网格
  chartGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20,
  },
  chartCard: {
    background: '#fff', borderRadius: 12, padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  chartTitle: {
    fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 16,
    display: 'flex', alignItems: 'center', gap: 6,
  },
  chartIcon: { color: '#64748b' },
  // 颜色
  blue: { backgroundColor: '#eff6ff', color: '#3b82f6' },
  green: { backgroundColor: '#f0fdf4', color: '#22c55e' },
  orange: { backgroundColor: '#fff7ed', color: '#f97316' },
  red: { backgroundColor: '#fef2f2', color: '#ef4444' },
  purple: { backgroundColor: '#f5f3ff', color: '#8b5cf6' },
  teal: { backgroundColor: '#f0fdfa', color: '#14b8a6' },
}

const COLORS = ['#3b82f6', '#22c55e', '#f97316', '#8b5cf6', '#14b8a6', '#ef4444']

const tooltipStyle = {
  contentStyle: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 },
  labelStyle: { color: '#1a3a5c', fontWeight: 600 },
}

// 生成模拟数据
const generateDailyData = (days: number) => {
  const data = []
  const today = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = `${d.getMonth() + 1}/${d.getDate()}`
    data.push({
      date: dateStr,
      exams: Math.floor(Math.random() * 40 + 40),
      reports: Math.floor(Math.random() * 35 + 35),
      completionRate: Math.floor(Math.random() * 15 + 80),
      positiveRate: (Math.random() * 10 + 15).toFixed(1),
    })
  }
  return data
}

const EXAM_ROOM_DATA = [
  { room: '超声室 A', exams: 186, utilization: 92 },
  { room: '超声室 B', exams: 165, utilization: 85 },
  { room: '超声室 C', exams: 148, utilization: 76 },
  { room: '超声室 D', exams: 132, utilization: 68 },
  { room: '介入超声', exams: 58, utilization: 58 },
]

const DOCTOR_RANKING = [
  { name: '李明辉', exams: 168, reports: 162, completion: 96 },
  { name: '王晓燕', exams: 145, reports: 142, completion: 98 },
  { name: '张伟', exams: 138, reports: 130, completion: 94 },
  { name: '陈静', exams: 125, reports: 120, completion: 96 },
  { name: '刘强', exams: 112, reports: 108, completion: 96 },
  { name: '赵芳', exams: 98, reports: 95, completion: 97 },
]

const PATIENT_SOURCE = [
  { name: '门诊', value: 45 },
  { name: '住院', value: 32 },
  { name: '体检', value: 23 },
]

// 生成时段热力图数据 (7天 x 12时段)
const generateHeatmapData = () => {
  const hours = ['8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00']
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const data: { hour: string; day: string; value: number }[] = []
  days.forEach(day => {
    hours.forEach(hour => {
      // 高峰期在上午9-11点和下午2-4点
      let base = 20
      if (hour.includes('9:00') || hour.includes('10:00') || hour.includes('15:00')) base = 80
      else if (hour.includes('11:00') || hour.includes('14:00') || hour.includes('16:00')) base = 65
      else if (hour.includes('8:00') || hour.includes('13:00') || hour.includes('17:00')) base = 45
      else if (hour.includes('12:00') || hour.includes('18:00')) base = 25
      else base = 30
      data.push({ day, hour, value: Math.floor(base + Math.random() * 25) })
    })
  })
  return data
}

const HEATMAP_DATA = generateHeatmapData()
const heatmapHours = ['8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00']
const heatmapDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

const DATE_RANGES = [
  { key: '7d', label: '近7天' },
  { key: '30d', label: '近30天' },
  { key: '90d', label: '近90天' },
  { key: 'year', label: '本年' },
  { key: 'custom', label: '自定义' },
]

export default function StatisticsPage() {
  const stats = initialStatisticsData
  const [dateRange, setDateRange] = useState('30d')

  // 根据日期范围生成数据
  const trendData = useMemo(() => {
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : dateRange === '90d' ? 90 : 365
    return generateDailyData(days)
  }, [dateRange])

  // 聚合统计
  const summaryStats = useMemo(() => {
    const totalExams = trendData.reduce((sum, d) => sum + d.exams, 0)
    const avgCompletion = Math.round(trendData.reduce((sum, d) => sum + d.completionRate, 0) / trendData.length)
    const avgPositive = (trendData.reduce((sum, d) => sum + parseFloat(d.positiveRate), 0) / trendData.length).toFixed(1)
    return { totalExams, avgCompletion, avgPositive, totalReports: trendData.reduce((sum, d) => sum + d.reports, 0) }
  }, [trendData])

  const handleExportExcel = () => {
    const csvContent = [
      ['日期', '检查数', '报告数', '完成率', '阳性率'],
      ...trendData.map(d => [d.date, d.exams, d.reports, d.completionRate + '%', d.positiveRate + '%']),
    ].map(row => row.join(',')).join('\n')
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `statistics_${dateRange}_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handlePrint = () => {
    window.print()
  }

  // 环形图组件
  const DonutChart = ({ data, title, height = 220 }: { data: { name: string; value: number }[]; title: string; height?: number }) => (
    <div style={s.chartCard}>
      <div style={s.chartTitle}><PieChartIcon size={16} style={s.chartIcon} /> {title}</div>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip {...tooltipStyle} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )

  // 医生排名表格
  const DoctorRankingTable = () => (
    <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <div style={s.chartTitle}><Users size={16} style={s.chartIcon} /> 医生工作量排名</div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>
            {['排名', '医生', '检查数', '报告数', '完成率'].map(h => (
              <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: '#64748b', fontWeight: 600, borderBottom: '2px solid #f1f5f9', fontSize: 12 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DOCTOR_RANKING.map((doc, i) => (
            <tr key={doc.name}>
              <td style={{ padding: '12px 12px', color: i < 3 ? '#f97316' : '#94a3b8', fontWeight: 700 }}>{i + 1}</td>
              <td style={{ padding: '12px 12px', fontWeight: 600, color: '#1a3a5c' }}>{doc.name}</td>
              <td style={{ padding: '12px 12px', color: '#475569' }}>{doc.exams}</td>
              <td style={{ padding: '12px 12px', color: '#475569' }}>{doc.reports}</td>
              <td style={{ padding: '12px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1, height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden', maxWidth: 80 }}>
                    <div style={{ height: '100%', width: `${doc.completion}%`, background: '#22c55e', borderRadius: 3 }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#22c55e' }}>{doc.completion}%</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  // 热力图组件
  const HeatmapChart = () => {
    const maxVal = Math.max(...HEATMAP_DATA.map(d => d.value))
    const getColor = (val: number) => {
      const ratio = val / maxVal
      if (ratio > 0.7) return '#3b82f6'
      if (ratio > 0.5) return '#60a5fa'
      if (ratio > 0.3) return '#93c5fd'
      return '#dbeafe'
    }
    return (
      <div style={s.chartCard}>
        <div style={s.chartTitle}><Grid3X3 size={16} style={s.chartIcon} /> 时段分布热力图</div>
        <div style={{ overflowX: 'auto' }}>
          <div style={{ display: 'flex', minWidth: 600 }}>
            <div style={{ marginRight: 8 }}>
              <div style={{ height: 24 }} />
              {heatmapDays.map(day => (
                <div key={day} style={{ height: 36, display: 'flex', alignItems: 'center', fontSize: 11, color: '#64748b', width: 40 }}>{day}</div>
              ))}
            </div>
            <div>
              <div style={{ display: 'flex', gap: 2, marginBottom: 4 }}>
                {heatmapHours.map(h => (
                  <div key={h} style={{ width: 48, textAlign: 'center', fontSize: 10, color: '#94a3b8' }}>{h}</div>
                ))}
              </div>
              {heatmapDays.map(day => (
                <div key={day} style={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                  {heatmapHours.map(hour => {
                    const cell = HEATMAP_DATA.find(d => d.day === day && d.hour === hour)
                    return (
                      <div
                        key={hour}
                        title={`${day} ${hour}: ${cell?.value ?? 0}例`}
                        style={{
                          width: 48, height: 36, borderRadius: 4,
                          background: cell ? getColor(cell.value) : '#f1f5f9',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, fontWeight: 600, color: cell && cell.value > maxVal * 0.5 ? '#fff' : '#1a3a5c',
                          cursor: 'pointer', transition: 'all 0.2s',
                        }}
                      >
                        {cell?.value}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
          <span style={{ fontSize: 11, color: '#94a3b8' }}>低</span>
          {['#dbeafe', '#93c5fd', '#60a5fa', '#3b82f6'].map(c => (
            <div key={c} style={{ width: 16, height: 16, borderRadius: 3, background: c }} />
          ))}
          <span style={{ fontSize: 11, color: '#94a3b8' }}>高</span>
        </div>
      </div>
    )
  }

  return (
    <div style={s.root}>
      {/* 标题区 */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>统计报表</h1>
          <p style={s.subtitle}>数据统计 · 报表分析 · 趋势监控</p>
        </div>
        <div style={s.headerRight}>
          <button style={{ ...s.btn, ...s.btnSecondary }} onClick={() => window.location.reload()}>
            <RefreshCw size={14} /> 刷新
          </button>
          <button style={{ ...s.btn, ...s.btnSecondary }} onClick={handleExportExcel}>
            <FileSpreadsheet size={14} /> 导出Excel
          </button>
          <button style={{ ...s.btn, ...s.btnSuccess }} onClick={handlePrint}>
            <PrinterIcon size={14} /> 打印报表
          </button>
        </div>
      </div>

      {/* 日期范围选择器 */}
      <div style={s.timeSelector}>
        {DATE_RANGES.map(range => (
          <button
            key={range.key}
            style={{
              ...s.timeBtn,
              ...(dateRange === range.key ? s.timeBtnActive : {}),
            }}
            onClick={() => setDateRange(range.key)}
          >
            {range.label}
          </button>
        ))}
        <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 8 }}>
          共 {trendData.length} 天数据
        </span>
      </div>

      {/* 顶部4个统计卡片 */}
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
            <CalendarClock size={22} color="#22c55e" />
          </div>
          <div style={s.statInfo}>
            <div style={s.statValue}>{summaryStats.totalExams}</div>
            <div style={s.statLabel}>本周检查</div>
            <div style={{ ...s.statTrend, color: '#22c55e' }}>
              <TrendingUp size={11} /> +8%
            </div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, background: '#fff7ed' }}>
            <FileText size={22} color="#f97316" />
          </div>
          <div style={s.statInfo}>
            <div style={s.statValue}>{summaryStats.totalReports}</div>
            <div style={s.statLabel}>本月报告</div>
            <div style={{ ...s.statTrend, color: '#22c55e' }}>
              <TrendingUp size={11} /> +5%
            </div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, background: '#fef2f2' }}>
            <AlertTriangle size={22} color="#ef4444" />
          </div>
          <div style={s.statInfo}>
            <div style={s.statValue}>{stats.pendingReports}</div>
            <div style={s.statLabel}>待出报告</div>
            <div style={{ ...s.statTrend, color: '#ef4444' }}>
              <TrendingDown size={11} /> +3
            </div>
          </div>
        </div>
      </div>

      {/* 图表区 2x3 网格 */}
      <div style={s.chartGrid}>
        {/* 1. 检查量趋势图（折线图） */}
        <div style={{ ...s.chartCard, gridColumn: 'span 2' }}>
          <div style={s.chartTitle}><LineChart size={16} style={s.chartIcon} /> 检查量趋势（近30天）</div>
          <ResponsiveContainer width="100%" height={260}>
            <RechartsLine data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="exams" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="检查数" />
              <Line type="monotone" dataKey="reports" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} name="报告数" />
            </RechartsLine>
          </ResponsiveContainer>
        </div>

        {/* 2. 检查类型分布（饼图+环形图） */}
        <DonutChart data={stats.examTypeDistribution} title="检查类型分布" height={260} />
      </div>

      <div style={s.chartGrid}>
        {/* 3. 各检查室工作量对比（柱状图） */}
        <div style={{ ...s.chartCard, gridColumn: 'span 2' }}>
          <div style={s.chartTitle}><BarChart3 size={16} style={s.chartIcon} /> 各检查室工作量对比</div>
          <ResponsiveContainer width="100%" height={220}>
            <RechartsBar data={EXAM_ROOM_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="room" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="exams" fill="#3b82f6" name="检查数" radius={[4, 4, 0, 0]} />
              <Bar dataKey="utilization" fill="#22c55e" name="利用率%" radius={[4, 4, 0, 0]} />
            </RechartsBar>
          </ResponsiveContainer>
        </div>

        {/* 4. 医生工作量排名（水平柱状图/表格） */}
        <div style={{ ...s.chartCard, gridColumn: 'span 1' }}>
          <div style={s.chartTitle}><Users size={16} style={s.chartIcon} /> 医生工作量排名</div>
          <ResponsiveContainer width="100%" height={220}>
            <RechartsBar data={DOCTOR_RANKING.slice(0, 4)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#94a3b8' }} width={60} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="exams" fill="#3b82f6" name="检查数" radius={[0, 4, 4, 0]} />
            </RechartsBar>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={s.chartGrid}>
        {/* 5. 报告完成率趋势（折线图） */}
        <div style={{ ...s.chartCard, gridColumn: 'span 2' }}>
          <div style={s.chartTitle}><CheckCircle size={16} style={s.chartIcon} /> 报告完成率趋势</div>
          <ResponsiveContainer width="100%" height={220}>
            <RechartsLine data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis domain={[60, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="completionRate" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} name="完成率%" />
            </RechartsLine>
          </ResponsiveContainer>
        </div>

        {/* 6. 患者来源分布（饼图） */}
        <DonutChart data={PATIENT_SOURCE} title="患者来源分布" height={220} />
      </div>

      <div style={s.chartGrid}>
        {/* 7. 检查阳性率趋势（面积图） */}
        <div style={{ ...s.chartCard, gridColumn: 'span 2' }}>
          <div style={s.chartTitle}><TrendingUp size={16} style={s.chartIcon} /> 检查阳性率趋势</div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorPositive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="positiveRate" stroke="#f97316" fill="url(#colorPositive)" strokeWidth={2} name="阳性率%" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 8. 汇总指标 */}
        <div style={{ ...s.chartCard, gridColumn: 'span 1' }}>
          <div style={s.chartTitle}><Activity size={16} style={s.chartIcon} /> 关键指标</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { label: '平均完成率', value: summaryStats.avgCompletion + '%', color: '#22c55e', icon: CheckCircle },
              { label: '平均阳性率', value: summaryStats.avgPositive + '%', color: '#f97316', icon: AlertTriangle },
              { label: '总检查量', value: summaryStats.totalExams, color: '#3b82f6', icon: Activity },
              { label: '总报告量', value: summaryStats.totalReports, color: '#8b5cf6', icon: FileText },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: item.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <item.icon size={18} color={item.color} />
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#1a3a5c' }}>{item.value}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>{item.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 9. 时段分布热力图 */}
      <div style={{ marginBottom: 20 }}>
        <HeatmapChart />
      </div>

      {/* 10-12. 底部医生完整排名表格（复用组件） */}
      <div style={{ marginBottom: 20 }}>
        <DoctorRankingTable />
      </div>
    </div>
  )
}
