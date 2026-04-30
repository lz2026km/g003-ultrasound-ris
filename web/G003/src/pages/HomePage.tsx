// @ts-nocheck
// ============================================================
// G003 超声RIS系统 - 首页概览
// 快速操作 / 今日进度 / 快捷入口 / 专业仪表盘风格
// ============================================================
import { useState } from 'react'
import { useNavigate as useNavigateRouter } from 'react-router-dom'
import {
  Activity, FileText, ShieldCheck, AlertTriangle,
  TrendingUp, Users, Radio, Clock, CheckCircle,
  BarChart3, PieChart as PieChartIcon, Plus, CalendarClock,
  Stethoscope, Package, RefreshCw, ShieldAlert,
  UserPlus, ClipboardList, PackagePlus, Bell,
  MessageSquare, AlertCircle, HeartPulse, ClipboardCheck,
  ChevronRight, BellRing, AlertOctagon, Info,
  CheckSquare, Square, Clock3, Tag,
  PackageSearch, Wrench, HardDrive, Monitor, Scan
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { initialStatisticsData } from '../data/initialData'

// ---------- 样式 ----------
const s: Record<string, React.CSSProperties> = {
  root: { padding: 0 },
  header: { marginBottom: 24 },
  title: { fontSize: 20, fontWeight: 700, color: '#1a3a5c', margin: 0 },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 4 },
  headerRight: { display: 'flex', gap: 8 },
  // 快速操作入口
  quickActions: {
    display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 24,
  },
  quickAction: {
    background: '#fff', borderRadius: 12, padding: '16px 12px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex',
    flexDirection: 'column', alignItems: 'center', gap: 8,
    cursor: 'pointer', transition: 'all 0.2s', border: 'none', textAlign: 'center',
  },
  quickActionIcon: {
    width: 40, height: 40, borderRadius: 10, display: 'flex',
    alignItems: 'center', justifyContent: 'center',
  },
  quickActionLabel: { fontSize: 12, fontWeight: 600, color: '#475569' },
  quickActionSub: { fontSize: 10, color: '#94a3b8' },
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
  statTrend: {
    fontSize: 11, color: '#22c55e', marginTop: 4, display: 'flex',
    alignItems: 'center', gap: 2,
  },
  // 图表行
  chartRow: {
    display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 24,
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
  // 环形进度
  ringProgress: {
    position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  },
  ringLabel: {
    position: 'absolute', fontSize: 11, fontWeight: 700, color: '#1a3a5c',
  },
  // Sparkline
  sparklineWrap: { display: 'flex', alignItems: 'flex-end', gap: 2, height: 28 },
  // 临床动态
  clinicalFeed: {
    background: '#fff', borderRadius: 12, padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 24,
  },
  feedItem: {
    display: 'flex', gap: 12, padding: '12px 0',
    borderBottom: '1px solid #f1f5f9', alignItems: 'flex-start',
  },
  feedIcon: {
    width: 32, height: 32, borderRadius: 8, display: 'flex',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  feedContent: { flex: 1, minWidth: 0 },
  feedTitle: { fontSize: 12, fontWeight: 600, color: '#1a3a5c', marginBottom: 2 },
  feedDesc: { fontSize: 11, color: '#64748b', marginBottom: 2 },
  feedTime: { fontSize: 10, color: '#94a3b8' },
  feedBadge: {
    fontSize: 10, fontWeight: 600, padding: '2px 8px',
    borderRadius: 10, flexShrink: 0,
  },
  // KPI卡片
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
  // 今日待办
  todoCard: {
    background: '#fff', borderRadius: 12, padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 24,
  },
  todoHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16,
  },
  todoTitle: { fontSize: 14, fontWeight: 600, color: '#1a3a5c', display: 'flex', alignItems: 'center', gap: 8 },
  todoCount: {
    fontSize: 12, fontWeight: 600, padding: '2px 10px',
    borderRadius: 10, background: '#fef2f2', color: '#ef4444',
  },
  todoItem: {
    display: 'flex', gap: 12, padding: '12px 0',
    borderBottom: '1px solid #f1f5f9', alignItems: 'center',
  },
  todoCheck: {
    width: 22, height: 22, borderRadius: 6, border: '2px solid #e2e8f0',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, cursor: 'pointer', transition: 'all 0.2s',
  },
  todoText: { flex: 1, fontSize: 13, color: '#475569' },
  todoTextDone: { flex: 1, fontSize: 13, color: '#94a3b8', textDecoration: 'line-through' },
  todoTag: {
    fontSize: 10, fontWeight: 600, padding: '2px 8px',
    borderRadius: 8, flexShrink: 0,
  },
  todoTime: { fontSize: 11, color: '#94a3b8', flexShrink: 0 },
  // 预警通知
  alertCard: {
    background: '#fff', borderRadius: 12, padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 24,
  },
  alertItem: {
    display: 'flex', gap: 12, padding: '14px 0',
    borderBottom: '1px solid #f1f5f9', alignItems: 'flex-start',
  },
  alertIcon: {
    width: 38, height: 38, borderRadius: 10, display: 'flex',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  alertContent: { flex: 1, minWidth: 0 },
  alertTitle: { fontSize: 13, fontWeight: 600, color: '#1a3a5c', marginBottom: 2 },
  alertDesc: { fontSize: 12, color: '#64748b', marginBottom: 4 },
  alertMeta: { fontSize: 11, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 8 },
  alertBadge: {
    fontSize: 11, fontWeight: 600, padding: '3px 10px',
    borderRadius: 12, flexShrink: 0,
  },
  // 版本信息
  versionCard: {
    background: '#fff', borderRadius: 12, padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 24,
  },
  versionRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 0', borderBottom: '1px solid #f1f5f9',
  },
  versionLabel: { fontSize: 13, color: '#64748b', display: 'flex', alignItems: 'center', gap: 8 },
  versionValue: { fontSize: 13, fontWeight: 600, color: '#1a3a5c' },
  versionTag: {
    fontSize: 10, fontWeight: 700, padding: '3px 10px',
    borderRadius: 10, background: '#f0fdf4', color: '#22c55e',
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

const trendTooltip = {
  contentStyle: {
    background: '#fff', border: '1px solid #e2e8f0',
    borderRadius: 8, fontSize: 12,
  },
  labelStyle: { color: '#1a3a5c', fontWeight: 600 },
}

// Quick action definitions
const QUICK_ACTIONS = [
  { icon: UserPlus, label: '新增患者', sub: '登记建档', bg: '#eff6ff', color: '#3b82f6', path: '/patients' },
  { icon: CalendarClock, label: '预约检查', sub: '安排日程', bg: '#f5f3ff', color: '#8b5cf6', path: '/appointments' },
  { icon: Stethoscope, label: '书写报告', sub: '电子病历', bg: '#f0fdfa', color: '#14b8a6', path: '/report-write' },
  { icon: PackagePlus, label: '耗材管理', sub: '物品管理', bg: '#fff7ed', color: '#f97316', path: '/materials' },
  { icon: Bell, label: '危急值', sub: '危急通报', bg: '#f0fdf4', color: '#22c55e', path: '/critical-value' },
]

const TODAY_PROGRESS = [
  { label: '今日检查', done: 48, total: 56, color: '#3b82f6' },
  { label: '已完成报告', done: 42, total: 48, color: '#22c55e' },
  { label: '待写报告', done: 12, total: 18, color: '#f97316' },
  { label: '危急值处理', done: 2, total: 3, color: '#ef4444' },
]

const CLINICAL_FEEDS = [
  { id: 1, type: 'urgent', icon: AlertCircle, iconBg: '#fef2f2', iconColor: '#ef4444', title: '危急值通报', desc: '患者王五，心脏超声提示：左室壁瘤形成伴血栓', time: '10:32', badge: '紧急', badgeBg: '#fef2f2', badgeColor: '#ef4444' },
  { id: 2, type: 'report', icon: FileText, iconBg: '#eff6ff', iconColor: '#3b82f6', title: '检查报告完成', desc: '张三 — 腹部超声检查（操作：李明辉）', time: '10:18', badge: '报告', badgeBg: '#eff6ff', badgeColor: '#3b82f6' },
  { id: 3, type: 'exam', icon: Activity, iconBg: '#f0fdfa', iconColor: '#14b8a6', title: '检查开始', desc: '李红 — 心血管超声检查，设备：彩超仪 B', time: '09:55', badge: '检查', badgeBg: '#f0fdfa', badgeColor: '#14b8a6' },
  { id: 4, type: 'appoint', icon: CalendarClock, iconBg: '#f5f3ff', iconColor: '#8b5cf6', title: '新增预约', desc: '赵丽 — 产科超声检查，预约时间 14:00', time: '09:40', badge: '预约', badgeBg: '#f5f3ff', badgeColor: '#8b5cf6' },
  { id: 5, type: 'device', icon: Monitor, iconBg: '#fff7ed', iconColor: '#f97316', title: '设备维护提醒', desc: '彩超仪 A 累计使用 800 小时，需进行维护保养', time: '08:00', badge: '设备', badgeBg: '#fff7ed', badgeColor: '#f97316' },
]

const ALERT_NOTIFICATIONS = [
  { id: 1, type: 'critical', icon: AlertOctagon, iconBg: '#fef2f2', iconColor: '#ef4444', title: '危急值未处理', desc: '患者王五危急值（左室壁瘤伴血栓）已通报30分钟，未处理', time: '10:45', badge: '危急', badgeBg: '#fef2f2', badgeColor: '#ef4444', level: 'critical' },
  { id: 2, type: 'warning', icon: AlertTriangle, iconBg: '#fff7ed', iconColor: '#f97316', title: '耗材库存不足', desc: '耦合剂库存仅剩 20 瓶，建议尽快补货', time: '09:30', badge: '警告', badgeBg: '#fff7ed', badgeColor: '#f97316', level: 'warning' },
  { id: 3, type: 'info', icon: Info, iconBg: '#eff6ff', iconColor: '#3b82f6', title: '设备维护提醒', desc: '彩超仪 A 累计使用时长达到 800 小时，需进行维护', time: '08:00', badge: '通知', badgeBg: '#eff6ff', badgeColor: '#3b82f6', level: 'info' },
  { id: 4, type: 'warning', icon: BellRing, iconBg: '#fff7ed', iconColor: '#f97316', title: '患者随访逾期', desc: '患者孙伟复查逾期 7 天，请及时联系患者', time: '昨天', badge: '提醒', badgeBg: '#fff7ed', badgeColor: '#f97316', level: 'warning' },
]

const TODAY_TODOS = [
  { id: 1, text: '完成患者张三腹部超声报告', tag: '报告', tagBg: '#eff6ff', tagColor: '#3b82f6', time: '09:30', done: true },
  { id: 2, text: '审核患者李红心血管超声申请单', tag: '审核', tagBg: '#f5f3ff', tagColor: '#8b5cf6', time: '10:00', done: false },
  { id: 3, text: '参加科室疑难病例讨论会', tag: '会议', tagBg: '#fef2f2', tagColor: '#ef4444', time: '14:00', done: false },
  { id: 4, text: '处理患者王五危急值通报', tag: '危急值', tagBg: '#fef2f2', tagColor: '#ef4444', time: '10:32', done: false },
  { id: 5, text: '完成本周质量控制数据上报', tag: '质控', tagBg: '#fff7ed', tagColor: '#f97316', time: '16:00', done: false },
  { id: 6, text: '彩超仪 A 日常维护保养', tag: '设备', tagBg: '#f0fdfa', tagColor: '#14b8a6', time: '17:00', done: false },
]

const VERSION_INFO = [
  { label: '系统版本', value: 'G003 v0.1.0', tag: '最新', tagBeta: false, icon: Package },
  { label: '前端框架', value: 'React 18.2.0', tag: null, tagBeta: false, icon: Wrench },
  { label: '图表库', value: 'Recharts 2.12.0', tag: null, tagBeta: false, icon: BarChart3 },
  { label: '图标库', value: 'Lucide React 0.344.0', tag: null, tagBeta: false, icon: HardDrive },
  { label: '路由', value: 'React Router 6.22.0', tag: null, tagBeta: false, icon: ChevronRight },
  { label: '构建工具', value: 'Vite 5.1.0', tag: null, tagBeta: false, icon: PackageSearch },
]

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

export default function HomePage() {
  const navigate = useNavigateRouter()
  const stats = initialStatisticsData
  const [todos, setTodos] = useState(TODAY_TODOS)

  const trendData = stats.examTrend.map((item, i) => ({
    date: item.date.slice(5),
    检查数: item.count,
    报告数: stats.reportTrend[i]?.count ?? 0,
  }))

  const toggleTodo = (id: number) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  const pendingCount = todos.filter(t => !t.done).length

  return (
    <div style={s.root}>
      {/* 标题 */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>智慧超声RIS信息管理系统</h1>
          <p style={s.subtitle}>
            {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })} · 您好，李明辉医生
          </p>
        </div>
      </div>

      {/* 快速操作入口 */}
      <div style={s.quickActions}>
        {QUICK_ACTIONS.map((action) => (
          <button key={action.label} style={s.quickAction} onClick={() => navigate(action.path)}>
            <div style={{ ...s.quickActionIcon, background: action.bg, color: action.color }}>
              <action.icon size={18} />
            </div>
            <div style={s.quickActionLabel}>{action.label}</div>
            <div style={s.quickActionSub}>{action.sub}</div>
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
            <div style={s.statTrend}><TrendingUp size={11} /> +12%</div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, background: '#f0fdf4' }}>
            <FileText size={22} color="#22c55e" />
          </div>
          <div style={s.statInfo}>
            <div style={s.statValue}>{stats.todayReports}</div>
            <div style={s.statLabel}>今日报告</div>
            <div style={s.statTrend}><TrendingUp size={11} /> +8%</div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, background: '#fff7ed' }}>
            <CalendarClock size={22} color="#f97316" />
          </div>
          <div style={s.statInfo}>
            <div style={s.statValue}>{stats.todayAppointments}</div>
            <div style={s.statLabel}>今日预约</div>
            <div style={s.statTrend}><TrendingUp size={11} /> +5%</div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, background: '#fef2f2' }}>
            <AlertTriangle size={22} color="#ef4444" />
          </div>
          <div style={s.statInfo}>
            <div style={s.statValue}>{stats.pendingReports}</div>
            <div style={s.statLabel}>待写报告</div>
            <div style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>+3</div>
          </div>
        </div>
      </div>

      {/* 图表行：趋势图 + 类型分布 */}
      <div style={s.chartRow}>
        <div style={s.chartCard}>
          <div style={s.chartTitle}><Activity size={16} style={s.chartIcon} /> 检查与报告趋势</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip {...trendTooltip} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="检查数" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="报告数" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={s.chartCard}>
          <div style={s.chartTitle}><PieChartIcon size={16} style={s.chartIcon} /> 检查类型分布</div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={stats.examTypeDistribution} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {stats.examTypeDistribution.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* KPI升级卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: '今日检查', value: 56, unit: '例', ring: 86, ringColor: '#3b82f6', trend: '+12%', trendUp: true, spark: [42, 48, 45, 52, 50, 54, 56], sparkColor: '#3b82f6' },
          { label: '报告完成率', value: 85.7, unit: '%', ring: 86, ringColor: '#22c55e', trend: '+5.2%', trendUp: true, spark: [75, 78, 80, 82, 83, 84, 86], sparkColor: '#22c55e' },
          { label: '设备利用率', value: 83.2, unit: '%', ring: 83, ringColor: '#14b8a6', trend: '+2.1%', trendUp: true, spark: [78, 79, 80, 81, 81, 82, 83], sparkColor: '#14b8a6' },
          { label: '平均预约等待', value: 1.8, unit: '天', ring: 70, ringColor: '#8b5cf6', trend: '-0.3天', trendUp: true, spark: [2.8, 2.6, 2.4, 2.3, 2.2, 2.0, 1.8], sparkColor: '#8b5cf6' },
        ].map((kpi) => (
          <div key={kpi.label} style={s.kpiCard}>
            <div style={s.kpiLeft}>
              <RingProgress percent={kpi.ring} color={kpi.ringColor} />
            </div>
            <div style={s.kpiCenter}>
              <div style={s.kpiValue}>{kpi.value}<span style={{ fontSize: 14, fontWeight: 400 }}>{kpi.unit}</span></div>
              <div style={s.kpiLabel}>{kpi.label}</div>
              <div style={{ ...(kpi.trendUp ? s.kpiTrendUp : { fontSize: 11, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 2 }) }}>
                <TrendingUp size={11} /> {kpi.trend}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Sparkline data={kpi.spark} color={kpi.sparkColor} />
            </div>
          </div>
        ))}
      </div>

      {/* 今日进度条 */}
      <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 16 }}>今日进度</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          {TODAY_PROGRESS.map((p) => (
            <div key={p.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: '#64748b' }}>{p.label}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#1a3a5c' }}>{p.done}/{p.total}</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: '#e2e8f0', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(p.done / p.total) * 100}%`, background: p.color, borderRadius: 3, transition: 'width 0.3s' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 临床动态 + 预警通知 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div style={s.clinicalFeed}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 16 }}>临床动态</div>
          {CLINICAL_FEEDS.map((feed) => (
            <div key={feed.id} style={s.feedItem}>
              <div style={{ ...s.feedIcon, background: feed.iconBg, color: feed.iconColor }}>
                <feed.icon size={14} />
              </div>
              <div style={s.feedContent}>
                <div style={s.feedTitle}>{feed.title}</div>
                <div style={s.feedDesc}>{feed.desc}</div>
                <div style={s.feedTime}>{feed.time}</div>
              </div>
              <div style={{ ...s.feedBadge, background: feed.badgeBg, color: feed.badgeColor }}>{feed.badge}</div>
            </div>
          ))}
        </div>
        <div style={s.alertCard}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 16 }}>预警通知</div>
          {ALERT_NOTIFICATIONS.map((alert) => (
            <div key={alert.id} style={s.alertItem}>
              <div style={{ ...s.alertIcon, background: alert.iconBg, color: alert.iconColor }}>
                <alert.icon size={16} />
              </div>
              <div style={s.alertContent}>
                <div style={s.alertTitle}>{alert.title}</div>
                <div style={s.alertDesc}>{alert.desc}</div>
                <div style={s.alertMeta}>{alert.time}</div>
              </div>
              <div style={{ ...s.alertBadge, background: alert.badgeBg, color: alert.badgeColor }}>{alert.badge}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 今日待办 */}
      <div style={s.todoCard}>
        <div style={s.todoHeader}>
          <div style={s.todoTitle}><CheckSquare size={16} /> 今日待办</div>
          <div style={s.todoCount}>{pendingCount} 项待办</div>
        </div>
        {TODAY_TODOS.map((todo) => (
          <div key={todo.id} style={s.todoItem}>
            <div style={{ ...s.todoCheck, borderColor: todo.done ? '#22c55e' : '#e2e8f0', background: todo.done ? '#f0fdf4' : 'transparent' }}
              onClick={() => toggleTodo(todo.id)}>
              {todo.done && <CheckCircle size={14} color="#22c55e" />}
            </div>
            <div style={todo.done ? s.todoTextDone : s.todoText}>{todo.text}</div>
            <div style={{ ...s.todoTag, background: todo.tagBg, color: todo.tagColor }}>{todo.tag}</div>
            <div style={s.todoTime}>{todo.time}</div>
          </div>
        ))}
      </div>

      {/* 版本信息 */}
      <div style={s.versionCard}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 16 }}>系统信息</div>
        {VERSION_INFO.map((info) => (
          <div key={info.label} style={s.versionRow}>
            <div style={s.versionLabel}><info.icon size={14} /> {info.label}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={s.versionValue}>{info.value}</div>
              {info.tag && <div style={s.versionTag}>{info.tag}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
