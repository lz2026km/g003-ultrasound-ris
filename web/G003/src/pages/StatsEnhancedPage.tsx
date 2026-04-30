// @ts-nocheck
// ============================================================
// G003 超声RIS系统 - 增强统计页面
// 数据统计 / 趋势分析 / 报表中心 / KPI监控
// ============================================================
import { useState } from 'react'
import {
  Search, Filter, Download, Calendar, TrendingUp,
  BarChart3, PieChart as PieChartIcon, LineChart, Activity,
  Users, FileText, Clock, CheckCircle, AlertCircle,
  Eye, RefreshCw, ChevronLeft, ChevronRight, Plus
} from 'lucide-react'
import {
  LineChart as RechartsLine, Line, BarChart as RechartsBar, Bar,
  PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart
} from 'recharts'
import { initialStatisticsData } from '../data/initialData'

// ---------- 样式 ----------
const s: Record<string, React.CSSProperties> = {
  root: { padding: 0 },
  header: { marginBottom: 24 },
  title: { fontSize: 20, fontWeight: 700, color: '#1a3a5c', margin: 0 },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 4 },
  headerRight: { display: 'flex', gap: 8 },
  statRow: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 24 },
  statCard: { background: '#fff', borderRadius: 12, padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 14 },
  statIconWrap: { width: 44, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  statInfo: { flex: 1, minWidth: 0 },
  statValue: { fontSize: 24, fontWeight: 700, color: '#1a3a5c', lineHeight: 1.2 },
  statLabel: { fontSize: 12, color: '#64748b', marginTop: 2 },
  statTrend: { fontSize: 11, color: '#22c55e', marginTop: 4, display: 'flex', alignItems: 'center', gap: 2 },
  // 时间选择器
  dateSelector: { display: 'flex', gap: 8, marginBottom: 20, alignItems: 'center' },
  dateBtn: { padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: 13, background: '#fff', color: '#475569', transition: 'all 0.2s' },
  dateBtnActive: { padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, background: '#3b82f6', color: '#fff', transition: 'all 0.2s' },
  // 图表卡片
  chartCard: { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 24 },
  chartTitle: { fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 },
  chartIcon: { color: '#64748b' },
  chartGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 },
  chartGrid3: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 },
  // 指标卡片
  kpiCard: { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  kpiHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  kpiTitle: { fontSize: 13, fontWeight: 600, color: '#1a3a5c' },
  kpiValue: { fontSize: 32, fontWeight: 700, color: '#1a3a5c' },
  kpiUnit: { fontSize: 14, color: '#64748b', fontWeight: 400 },
  kpiTrend: { fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 },
  kpiSpark: { display: 'flex', alignItems: 'flex-end', gap: 2, height: 40, marginTop: 12 },
  // 表格
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: { padding: '12px 16px', textAlign: 'left', color: '#64748b', fontWeight: 600, borderBottom: '2px solid #f1f5f9', fontSize: 12 },
  td: { padding: '14px 16px', color: '#475569', borderBottom: '1px solid #f1f5f9' },
  // 按钮
  btn: { padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s' },
  btnPrimary: { background: '#3b82f6', color: '#fff' },
  btnOutline: { padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, background: '#fff', color: '#475569' },
  blue: { backgroundColor: '#eff6ff', color: '#3b82f6' },
  green: { backgroundColor: '#f0fdf4', color: '#22c55e' },
  orange: { backgroundColor: '#fff7ed', color: '#f97316' },
  red: { backgroundColor: '#fef2f2', color: '#ef4444' },
  purple: { backgroundColor: '#f5f3ff', color: '#8b5cf6' },
  teal: { backgroundColor: '#f0fdfa', color: '#14b8a6' },
}

const COLORS = ['#3b82f6', '#22c55e', '#f97316', '#8b5cf6', '#14b8a6', '#ef4444']
const trendTooltip = { contentStyle: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }, labelStyle: { color: '#1a3a5c', fontWeight: 600 } }

// 模拟趋势数据
const DAILY_TREND = [
  { date: '12-09', exams: 52, reports: 48, revenue: 12500 },
  { date: '12-10', exams: 58, reports: 55, revenue: 14200 },
  { date: '12-11', exams: 62, reports: 58, revenue: 15800 },
  { date: '12-12', exams: 55, reports: 52, revenue: 13500 },
  { date: '12-13', exams: 68, reports: 65, revenue: 17200 },
  { date: '12-14', exams: 72, reports: 68, revenue: 18500 },
  { date: '12-15', exams: 78, reports: 74, revenue: 19800 },
]

const HOURLY_TREND = [
  { hour: '08:00', patients: 12 },
  { hour: '09:00', patients: 28 },
  { hour: '10:00', patients: 35 },
  { hour: '11:00', patients: 42 },
  { hour: '12:00', patients: 18 },
  { hour: '13:00', patients: 25 },
  { hour: '14:00', patients: 38 },
  { hour: '15:00', patients: 32 },
  { hour: '16:00', patients: 28 },
  { hour: '17:00', patients: 15 },
]

const EQUIPMENT_USAGE = [
  { name: '彩超仪 A', usage: 92, efficiency: 95 },
  { name: '彩超仪 B', usage: 85, efficiency: 88 },
  { name: '彩超仪 C', usage: 78, efficiency: 82 },
  { name: '彩超仪 D', usage: 65, efficiency: 70 },
]

const DOCTOR_RANKING = [
  { name: '李明辉', exams: 156, reports: 152, satisfaction: 98 },
  { name: '王芳', exams: 142, reports: 140, satisfaction: 96 },
  { name: '张伟', exams: 138, reports: 135, satisfaction: 95 },
  { name: '刘涛', exams: 125, reports: 122, satisfaction: 94 },
  { name: '陈静', exams: 118, reports: 115, satisfaction: 93 },
]

export default function StatsEnhancedPage() {
  const stats = initialStatisticsData
  const [dateRange, setDateRange] = useState('week')
  const [activeTab, setActiveTab] = useState('overview')

  const trendData = stats.examTrend.map((item, i) => ({
    date: item.date.slice(5),
    检查数: item.count,
    报告数: stats.reportTrend[i]?.count ?? 0,
  }))

  return (
    <div style={s.root}>
      {/* 标题 */}
      <div style={s.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={s.title}>数据统计分析</h1>
            <p style={s.subtitle}>数据统计 · 趋势分析 · 报表中心 · KPI监控</p>
          </div>
          <div style={s.headerRight}>
            <button style={s.btnOutline}><Download size={14} /> 导出报表</button>
            <button style={{ ...s.btn, ...s.btnPrimary }}><Plus size={14} /> 自定义报表</button>
          </div>
        </div>
      </div>

      {/* 时间选择 */}
      <div style={s.dateSelector}>
        {['today', 'week', 'month', 'year'].map((range) => (
          <button
            key={range}
            style={dateRange === range ? s.dateBtnActive : s.dateBtn}
            onClick={() => setDateRange(range)}
          >
            {range === 'today' ? '今日' : range === 'week' ? '本周' : range === 'month' ? '本月' : '本年'}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button style={s.btnOutline}><Calendar size={14} /> 2024-12-09 至 2024-12-15</button>
      </div>

      {/* 统计卡片 */}
      <div style={s.statRow}>
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, background: '#eff6ff' }}><Activity size={20} color="#3b82f6" /></div>
          <div style={s.statInfo}>
            <div style={s.statValue}>{stats.todayExams}</div>
            <div style={s.statLabel}>今日检查</div>
            <div style={s.statTrend}><TrendingUp size={11} /> +12%</div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, background: '#f0fdf4' }}><FileText size={20} color="#22c55e" /></div>
          <div style={s.statInfo}>
            <div style={s.statValue}>{stats.todayReports}</div>
            <div style={s.statLabel}>今日报告</div>
            <div style={s.statTrend}><TrendingUp size={11} /> +8%</div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, background: '#fff7ed' }}><Clock size={20} color="#f97316" /></div>
          <div style={s.statInfo}>
            <div style={s.statValue}>1.8天</div>
            <div style={s.statLabel}>平均预约等待</div>
            <div style={{ fontSize: 11, color: '#22c55e', marginTop: 4 }}>-0.3天</div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, background: '#f5f3ff' }}><Users size={20} color="#8b5cf6" /></div>
          <div style={s.statInfo}>
            <div style={s.statValue}>89.5%</div>
            <div style={s.statLabel}>报告完成率</div>
            <div style={s.statTrend}><TrendingUp size={11} /> +3.2%</div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, background: '#f0fdfa' }}><CheckCircle size={20} color="#14b8a6" /></div>
          <div style={s.statInfo}>
            <div style={s.statValue}>96.2%</div>
            <div style={s.statLabel}>设备利用率</div>
            <div style={s.statTrend}><TrendingUp size={11} /> +1.5%</div>
          </div>
        </div>
      </div>

      {/* 图表区域 */}
      <div style={s.chartGrid}>
        {/* 检查报告趋势 */}
        <div style={s.chartCard}>
          <div style={s.chartTitle}><Activity size={16} style={s.chartIcon} /> 检查与报告趋势</div>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip {...trendTooltip} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="检查数" fill="#3b82f6" name="检查数" radius={[4, 4, 0, 0]} opacity={0.8} />
              <Bar dataKey="报告数" fill="#22c55e" name="报告数" radius={[4, 4, 0, 0]} opacity={0.8} />
              <Line type="monotone" dataKey="检查数" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="报告数" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* 检查类型分布 */}
        <div style={s.chartCard}>
          <div style={s.chartTitle}><PieChartIcon size={16} style={s.chartIcon} /> 检查类型分布</div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={stats.examTypeDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {stats.examTypeDistribution.map((_, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 每日趋势 */}
      <div style={s.chartCard}>
        <div style={s.chartTitle}><TrendingUp size={16} style={s.chartIcon} /> 每日检查量趋势</div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={DAILY_TREND}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <Tooltip {...trendTooltip} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Area type="monotone" dataKey="exams" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} name="检查数" />
            <Area type="monotone" dataKey="reports" stroke="#22c55e" fill="#22c55e" fillOpacity={0.2} name="报告数" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 设备与人员排名 */}
      <div style={s.chartGrid}>
        {/* 设备使用率 */}
        <div style={s.chartCard}>
          <div style={s.chartTitle}><BarChart3 size={16} style={s.chartIcon} /> 设备使用率</div>
          <ResponsiveContainer width="100%" height={220}>
            <RechartsBarChart data={EQUIPMENT_USAGE} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#94a3b8' }} width={80} />
              <Tooltip {...trendTooltip} />
              <Bar dataKey="usage" fill="#3b82f6" name="使用率%" radius={[0, 4, 4, 0]} />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>

        {/* 医生工作量排名 */}
        <div style={s.chartCard}>
          <div style={s.chartTitle}><Users size={16} style={s.chartIcon} /> 医生工作量排名</div>
          <ResponsiveContainer width="100%" height={220}>
            <RechartsBarChart data={DOCTOR_RANKING}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip {...trendTooltip} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="exams" fill="#3b82f6" name="检查数" radius={[4, 4, 0, 0]} />
              <Bar dataKey="reports" fill="#22c55e" name="报告数" radius={[4, 4, 0, 0]} />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 按时段统计 */}
      <div style={s.chartCard}>
        <div style={s.chartTitle}><Clock size={16} style={s.chartIcon} /> 按时段患者分布</div>
        <ResponsiveContainer width="100%" height={220}>
          <RechartsBarChart data={HOURLY_TREND}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <Tooltip {...trendTooltip} />
            <Bar dataKey="patients" fill="#8b5cf6" name="患者数" radius={[4, 4, 0, 0]} />
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
