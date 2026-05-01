// @ts-nocheck
// ============================================================
// G004 超声管理系统 - 科室BI看板
// 今日实时概览 / 趋势分析 / 工作量排名 / 预警
// ============================================================
import { useState } from 'react'
import {
  Activity, CalendarClock, FileText, Scissors, Clock,
  TrendingUp, AlertTriangle, CheckCircle, Microscope,
  BarChart3, PieChart as PieChartIcon, Users, Package,
  ArrowUp, ArrowDown, Minus, RefreshCw, Download, Search, Filter, Inbox
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

// ---------- 样式 ----------
const s: Record<string, React.CSSProperties> = {
  root: { padding: 0 },
  header: {
    marginBottom: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 20, fontWeight: 700, color: '#1a3a5c', margin: 0,
  },
  subtitle: {
    fontSize: 13, color: '#64748b', marginTop: 4,
  },
  refreshBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 14px',
    borderRadius: 8,
    border: '1px solid #e2e8f0',
    background: '#fff',
    cursor: 'pointer',
    fontSize: 12,
    color: '#64748b',
  },
  // Big stat cards
  bigStatRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16,
    marginBottom: 24,
  },
  bigStatCard: {
    background: '#fff',
    borderRadius: 12,
    padding: '24px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    position: 'relative',
    overflow: 'hidden',
  },
  bigStatValue: {
    fontSize: 36,
    fontWeight: 800,
    color: '#1a3a5c',
    lineHeight: 1.1,
  },
  bigStatLabel: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 6,
  },
  bigStatTrend: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 12,
    marginTop: 8,
    fontWeight: 600,
  },
  bigStatIcon: {
    position: 'absolute',
    right: 20,
    top: 20,
    opacity: 0.15,
  },
  // Chart grid
  chartGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: 16,
    marginBottom: 24,
  },
  chartGrid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
    marginBottom: 24,
  },
  chartGrid3: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: 16,
    marginBottom: 24,
  },
  chartCard: {
    background: '#fff',
    borderRadius: 12,
    padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: '#1a3a5c',
    marginBottom: 16,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  chartIcon: { color: '#64748b' },
  // Warning list
  warningList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  warningItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 0',
    borderBottom: '1px solid #f1f5f9',
  },
  warningDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    flexShrink: 0,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#475569',
  },
  warningCount: {
    fontSize: 12,
    fontWeight: 600,
    color: '#ef4444',
    background: '#fef2f2',
    padding: '2px 8px',
    borderRadius: 20,
  },
  // Timeline
  timeline: {
    position: 'relative',
    paddingLeft: 20,
  },
  timelineItem: {
    position: 'relative',
    paddingBottom: 14,
    paddingLeft: 18,
    borderLeft: '2px solid #e2e8f0',
  },
  timelineDot: {
    position: 'absolute',
    left: -5,
    top: 3,
    width: 10,
    height: 10,
    borderRadius: '50%',
  },
  timelineTime: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 2,
  },
  timelineText: {
    fontSize: 13,
    color: '#475569',
  },
  // Progress bar
  progressBar: {
    height: 8,
    borderRadius: 4,
    background: '#e2e8f0',
    overflow: 'hidden',
    marginTop: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    transition: 'width 0.3s',
  },
  // Rank list
  rankItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 0',
    borderBottom: '1px solid #f8fafc',
  },
  rankNum: {
    width: 20,
    height: 20,
    borderRadius: '50%',
    background: '#f1f5f9',
    color: '#64748b',
    fontSize: 11,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  rankNumGold: { background: '#fef3c7', color: '#d97706' },
  rankNumSilver: { background: '#f1f5f9', color: '#64748b' },
  rankNumBronze: { background: '#fed7aa', color: '#ea580c' },
  rankName: { flex: 1, fontSize: 13, color: '#475569' },
  rankValue: { fontSize: 13, fontWeight: 600, color: '#1a3a5c' },
  // Usage bar
  usageBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '6px 0',
  },
  usageLabel: { fontSize: 12, color: '#475569', width: 80 },
  usageBarBg: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    background: '#f1f5f9',
    overflow: 'hidden',
  },
  usageBarFill: { height: '100%', borderRadius: 4 },
  usagePct: { fontSize: 12, fontWeight: 600, color: '#1a3a5c', width: 36, textAlign: 'right' },
  // Colors
  blue: { color: '#3b82f6', bg: '#eff6ff' },
  green: { color: '#22c55e', bg: '#f0fdf4' },
  orange: { color: '#f97316', bg: '#fff7ed' },
  red: { color: '#ef4444', bg: '#fef2f2' },
  purple: { color: '#8b5cf6', bg: '#f5f3ff' },
  teal: { color: '#14b8a6', bg: '#f0fdfa' },
  // 空状态
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 24px',
    background: '#fff',
    borderRadius: 12,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    textAlign: 'center',
  },
  emptyStateIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    background: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyStateTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: '#1a3a5c',
    marginBottom: 4,
  },
  emptyStateDesc: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 14,
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
  // 搜索筛选
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
    minWidth: 160,
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
    padding: '8px 14px',
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

const PIE_COLORS = ['#3b82f6', '#22c55e', '#f97316', '#8b5cf6', '#14b8a6']

// Mock data
const TODAY_STATS = {
  exams: 47,
  examsTrend: '+12%',
  appointments: 23,
  appointmentsTrend: '+5%',
  surgeries: 5,
  surgeriesTrend: '-2%',
  pendingReports: 8,
  pendingReportsTrend: '+3',
}

const TREND_DATA = [
  { date: '04-24', 检查: 38, 报告: 35 },
  { date: '04-25', 检查: 42, 报告: 40 },
  { date: '04-26', 检查: 35, 报告: 38 },
  { date: '04-27', 检查: 45, 报告: 42 },
  { date: '04-28', 检查: 50, 报告: 48 },
  { date: '04-29', 检查: 43, 报告: 45 },
  { date: '04-30', 检查: 47, 报告: 41 },
]

const EXAM_TYPE_DATA = [
  { name: '胃镜', value: 45 },
  { name: '肠镜', value: 28 },
  { name: '超声内镜', value: 12 },
  { name: 'ERCP', value: 8 },
  { name: '其他', value: 7 },
]

const DOCTOR_RANK_DATA = [
  { doctor: '张建国', count: 56 },
  { doctor: '陈晓东', count: 48 },
  { doctor: '孙伟明', count: 42 },
  { doctor: '李明辉', count: 37 },
  { doctor: '王海涛', count: 31 },
  { doctor: '刘志刚', count: 28 },
]

const ENDOSCOPE_USAGE = [
  { name: 'EG-2990I', usage: 92 },
  { name: 'EG-2995I', usage: 85 },
  { name: 'CF-H290I', usage: 78 },
  { name: 'CF-H260I', usage: 65 },
  { name: 'PCF-H290TL', usage: 58 },
]

const WARNING_ITEMS = [
  { name: '一次性活检钳', stock: 12, min: 50 },
  { name: '圈套器', stock: 8, min: 30 },
  { name: '注射针', stock: 5, min: 20 },
  { name: '止血夹', stock: 15, min: 40 },
  { name: '高频电刀头', stock: 3, min: 15 },
]

const TODAY_TODOS = [
  { time: '08:00', text: '交班会议', done: true, color: s.green },
  { time: '08:30', text: '胃超声检查 #1023 患者王五', done: true, color: s.green },
  { time: '09:15', text: '肠镜检查 #1024 患者赵六', done: true, color: s.green },
  { time: '10:00', text: '超声内镜 #1025 患者刘七', done: false, color: s.orange },
  { time: '10:45', text: '胃超声检查 #1026 患者陈八', done: false, color: s.blue },
  { time: '11:30', text: 'ERCP手术 #1027 患者周九', done: false, color: s.purple },
  { time: '14:00', text: '胃超声检查 #1028 患者吴十', done: false, color: s.blue },
  { time: '15:00', text: '书写昨日报告', done: false, color: s.teal },
  { time: '16:30', text: '洗消室交接班', done: false, color: s.teal },
]

const trendTooltip = {
  contentStyle: {
    background: '#fff', border: '1px solid #e2e8f0',
    borderRadius: 8, fontSize: 12,
  },
  labelStyle: { color: '#1a3a5c', fontWeight: 600 },
}

export default function DashboardPage() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [searchText, setSearchText] = useState('')

  const handleRefresh = () => {
    setRefreshKey(k => k + 1)
  }

  return (
    <div style={s.root}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>科室数据看板</h1>
          <p style={s.subtitle}>
            {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })} · 实时数据
          </p>
        </div>
        <button style={s.refreshBtn} onClick={handleRefresh}>
          <RefreshCw size={13} /> 刷新数据
        </button>
        <button style={{ ...s.refreshBtn, background: '#3b82f6', color: '#fff', border: 'none' }}>
          <Download size={13} /> 导出报表
        </button>
      </div>

      {/* 搜索筛选栏 */}
      <div style={s.filterRow}>
        <Search size={14} color="#64748b" />
        <input
          style={s.searchInput}
          placeholder="搜索科室数据..."
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
        />
        <select style={{ ...s.filterBtn, borderRadius: 6 }}>
          <option>全部时间</option>
          <option>今日</option>
          <option>近7天</option>
          <option>近30天</option>
        </select>
        <select style={{ ...s.filterBtn, borderRadius: 6 }}>
          <option>全部科室</option>
          <option>消化内科</option>
          <option>超声中心</option>
        </select>
      </div>

      {/* 今日概览大字卡片 */}
      <div style={s.bigStatRow}>
        <BigStatCard
          icon={Activity}
          value={TODAY_STATS.exams}
          label="今日检查"
          trend={TODAY_STATS.examsTrend}
          trendDir="up"
          color={s.blue.color}
          bg={s.blue.bg}
        />
        <BigStatCard
          icon={CalendarClock}
          value={TODAY_STATS.appointments}
          label="今日预约"
          trend={TODAY_STATS.appointmentsTrend}
          trendDir="up"
          color={s.green.color}
          bg={s.green.bg}
        />
        <BigStatCard
          icon={Scissors}
          value={TODAY_STATS.surgeries}
          label="今日手术"
          trend={TODAY_STATS.surgeriesTrend}
          trendDir="down"
          color={s.purple.color}
          bg={s.purple.bg}
        />
        <BigStatCard
          icon={FileText}
          value={TODAY_STATS.pendingReports}
          label="待写报告"
          trend={TODAY_STATS.pendingReportsTrend}
          trendDir="warn"
          color={s.orange.color}
          bg={s.orange.bg}
        />
      </div>

      {/* 7天趋势 + 检查类型 */}
      <div style={s.chartGrid}>
        <div style={s.chartCard}>
          <div style={s.chartTitle}>
            <TrendingUp size={16} style={s.chartIcon} />
            近7日检查量趋势
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={TREND_DATA} {...trendTooltip}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip {...trendTooltip} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="检查" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="报告" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={s.chartCard}>
          <div style={s.chartTitle}>
            <PieChartIcon size={16} style={s.chartIcon} />
            检查类型占比
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={EXAM_TYPE_DATA}
                cx="50%"
                cy="45%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {EXAM_TYPE_DATA.map((_, idx) => (
                  <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${value} 例`} contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }} />
              <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 医生工作量 + 超声使用率 */}
      <div style={s.chartGrid2}>
        <div style={s.chartCard}>
          <div style={s.chartTitle}>
            <BarChart3 size={16} style={s.chartIcon} />
            医生工作量排行（本周）
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={DOCTOR_RANK_DATA} layout="vertical" barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis type="category" dataKey="doctor" tick={{ fontSize: 12, fill: '#64748b' }} width={60} />
              <Tooltip {...trendTooltip} />
              <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={s.chartCard}>
          <div style={s.chartTitle}>
            <Microscope size={16} style={s.chartIcon} />
            超声设备使用率
          </div>
          <div style={{ padding: '8px 0' }}>
            {ENDOSCOPE_USAGE.map((item, idx) => {
              const barColor = item.usage >= 80 ? '#22c55e' : item.usage >= 60 ? '#3b82f6' : '#f97316'
              return (
                <div key={item.name} style={s.usageBar}>
                  <span style={s.usageLabel}>{item.name}</span>
                  <div style={s.usageBarBg}>
                    <div style={{ ...s.usageBarFill, width: `${item.usage}%`, background: barColor }} />
                  </div>
                  <span style={{ ...s.usagePct, color: barColor }}>{item.usage}%</span>
                </div>
              )
            })}
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 16, justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#64748b' }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: '#22c55e', display: 'inline-block' }} /> ≥80%
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#64748b' }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: '#3b82f6', display: 'inline-block' }} /> 60-79%
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#64748b' }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: '#f97316', display: 'inline-block' }} /> &lt;60%
            </div>
          </div>
        </div>
      </div>

      {/* 耗材预警 + 今日待办 */}
      <div style={s.chartGrid2}>
        <div style={s.chartCard}>
          <div style={s.chartTitle}>
            <AlertTriangle size={16} style={{ color: '#ef4444' }} />
            耗材库存预警
            <span style={{ marginLeft: 4, background: '#fef2f2', color: '#ef4444', borderRadius: 20, padding: '1px 8px', fontSize: 11, fontWeight: 600 }}>
              {WARNING_ITEMS.length} 项
            </span>
          </div>
          <ul style={s.warningList}>
            {WARNING_ITEMS.map(item => (
              <li key={item.name} style={s.warningItem}>
                <span style={{ ...s.warningDot, background: '#ef4444' }} />
                <span style={s.warningText}>{item.name}</span>
                <span style={{ fontSize: 11, color: '#ef4444', marginRight: 8 }}>库存{item.stock}</span>
                <span style={s.warningCount}>低于阈值{item.min}</span>
              </li>
            ))}
          </ul>
        </div>

        <div style={s.chartCard}>
          <div style={s.chartTitle}>
            <Clock size={16} style={s.chartIcon} />
            今日待办
          </div>
          <div style={s.timeline}>
            {TODAY_TODOS.map((todo, idx) => (
              <div key={idx} style={s.timelineItem}>
                <div style={{
                  ...s.timelineDot,
                  background: todo.done ? '#22c55e' : '#e2e8f0',
                  boxShadow: todo.done ? '0 0 0 2px #22c55e' : 'none',
                }} />
                <div style={s.timelineTime}>{todo.time}</div>
                <div style={{
                  ...s.timelineText,
                  textDecoration: todo.done ? 'line-through' : 'none',
                  color: todo.done ? '#94a3b8' : '#475569',
                }}>
                  {todo.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 今日检查进度 */}
      <div style={s.chartCard}>
        <div style={s.chartTitle}>
          <Activity size={16} style={s.chartIcon} />
          今日检查完成进度
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginTop: 4 }}>
          <ProgressItem label="胃镜" done={18} total={25} color="#3b82f6" />
          <ProgressItem label="肠镜" done={12} total={15} color="#22c55e" />
          <ProgressItem label="超声内镜" done={4} total={5} color="#8b5cf6" />
          <ProgressItem label="ERCP" done={2} total={3} color="#f97316" />
        </div>
      </div>
    </div>
  )
}

// BigStatCard sub-component
function BigStatCard({ icon: Icon, value, label, trend, trendDir, color, bg }: any) {
  const trendColor = trendDir === 'up' ? '#22c55e' : trendDir === 'down' ? '#ef4444' : '#f97316'
  const TrendIcon = trendDir === 'up' ? ArrowUp : trendDir === 'down' ? ArrowDown : AlertTriangle
  return (
    <div style={s.bigStatCard}>
      <div style={{ ...s.bigStatValue, color }}>{value}</div>
      <div style={s.bigStatLabel}>{label}</div>
      <div style={{ ...s.bigStatTrend, color: trendColor }}>
        <TrendIcon size={13} />
        {trend}
      </div>
      <div style={s.bigStatIcon}>
        <Icon size={56} color={color} />
      </div>
    </div>
  )
}

// ProgressItem sub-component
function ProgressItem({ label, done, total, color }: { label: string; done: number; total: number; color: string }) {
  const pct = Math.round((done / total) * 100)
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: '#475569', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 13, color: '#1a3a5c', fontWeight: 600 }}>{done}/{total}</span>
      </div>
      <div style={s.progressBar}>
        <div style={{ ...s.progressFill, width: `${pct}%`, background: color }} />
      </div>
      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, textAlign: 'right' }}>{pct}% 完成</div>
    </div>
  )
}
