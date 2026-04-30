// @ts-nocheck
// ============================================================
// G003 超声RIS系统 - 仪表盘页面
// 综合监控面板 / 实时数据 / 快捷入口 / 系统状态
// ============================================================
import { useState } from 'react'
import { useNavigate as useNavigateRouter } from 'react-router-dom'
import {
  Dashboard as DashboardIcon, Activity, FileText, Users, Clock,
  AlertTriangle, AlertCircle, CheckCircle, TrendingUp, TrendingDown,
  Calendar, CalendarClock, Stethoscope, Monitor, Bell, BellRing,
  RefreshCw, Settings, Eye, Plus, ChevronRight, Package,
  Wrench, HardDrive, ShieldAlert, Wifi, WifiOff, Server,
  Database, Cpu, MemoryStick, Gauge, Thermometer,
  PackageSearch, HeartPulse, ClipboardCheck, UserPlus
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
  header: { marginBottom: 24 },
  title: { fontSize: 20, fontWeight: 700, color: '#1a3a5c', margin: 0 },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 4 },
  headerRight: { display: 'flex', gap: 8, marginTop: 8 },
  // 状态指示器
  statusDot: {
    width: 8, height: 8, borderRadius: '50%', display: 'inline-block', marginRight: 6,
  },
  // 快速入口
  quickGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 24,
  },
  quickItem: {
    background: '#fff', borderRadius: 12, padding: '20px 16px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex',
    flexDirection: 'column', alignItems: 'center', gap: 12, cursor: 'pointer',
    transition: 'all 0.2s', border: 'none', textAlign: 'center',
  },
  quickIcon: {
    width: 48, height: 48, borderRadius: 12, display: 'flex',
    alignItems: 'center', justifyContent: 'center',
  },
  quickLabel: { fontSize: 13, fontWeight: 600, color: '#1a3a5c' },
  quickSub: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
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
    width: 52, height: 52, borderRadius: 12, display: 'flex',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  statInfo: { flex: 1, minWidth: 0 },
  statValue: { fontSize: 28, fontWeight: 700, color: '#1a3a5c', lineHeight: 1.2 },
  statLabel: { fontSize: 12, color: '#64748b', marginTop: 4 },
  statTrend: { fontSize: 11, marginTop: 6, display: 'flex', alignItems: 'center', gap: 2 },
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
    display: 'flex', alignItems: 'center', gap: 8,
  },
  chartIcon: { color: '#64748b' },
  // 实时监控卡片
  monitorCard: {
    background: '#fff', borderRadius: 12, padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 24,
  },
  monitorHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16,
  },
  monitorTitle: { fontSize: 14, fontWeight: 600, color: '#1a3a5c', display: 'flex', alignItems: 'center', gap: 8 },
  monitorGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16,
  },
  monitorItem: {
    padding: '16px', background: '#f8fafc', borderRadius: 10,
    display: 'flex', alignItems: 'center', gap: 12,
  },
  monitorIcon: {
    width: 40, height: 40, borderRadius: 10, display: 'flex',
    alignItems: 'center', justifyContent: 'center',
  },
  monitorInfo: { flex: 1 },
  monitorLabel: { fontSize: 11, color: '#94a3b8', marginBottom: 2 },
  monitorValue: { fontSize: 16, fontWeight: 700, color: '#1a3a5c' },
  // 系统状态卡片
  systemCard: {
    background: '#fff', borderRadius: 12, padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 24,
  },
  systemItem: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 0', borderBottom: '1px solid #f1f5f9',
  },
  systemLabel: { fontSize: 13, color: '#64748b', display: 'flex', alignItems: 'center', gap: 8 },
  systemValue: { fontSize: 13, fontWeight: 600, color: '#1a3a5c' },
  systemBadge: {
    fontSize: 11, fontWeight: 600, padding: '3px 10px',
    borderRadius: 10,
  },
  // 告警卡片
  alertCard: {
    background: '#fff', borderRadius: 12, padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 24,
  },
  alertItem: {
    display: 'flex', gap: 14, padding: '14px 0',
    borderBottom: '1px solid #f1f5f9', alignItems: 'flex-start',
  },
  alertIcon: {
    width: 40, height: 40, borderRadius: 10, display: 'flex',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  alertContent: { flex: 1 },
  alertTitle: { fontSize: 13, fontWeight: 600, color: '#1a3a5c', marginBottom: 4 },
  alertDesc: { fontSize: 12, color: '#64748b' },
  alertTime: { fontSize: 11, color: '#94a3b8', marginTop: 4 },
  alertBadge: {
    fontSize: 10, fontWeight: 600, padding: '3px 8px',
    borderRadius: 8, flexShrink: 0,
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

const QUICK_ENTRIES = [
  { icon: UserPlus, label: '新增患者', sub: '快速建档', bg: '#eff6ff', color: '#3b82f6', path: '/patients' },
  { icon: CalendarClock, label: '预约检查', sub: '日程安排', bg: '#f5f3ff', color: '#8b5cf6', path: '/appointments' },
  { icon: Stethoscope, label: '书写报告', sub: '电子病历', bg: '#f0fdfa', color: '#14b8a6', path: '/report-write' },
  { icon: ClipboardCheck, label: '检查工作台', sub: '执行检查', bg: '#fff7ed', color: '#f97316', path: '/exams' },
  { icon: Package, label: '耗材管理', sub: '物资管理', bg: '#f0fdf4', color: '#22c55e', path: '/materials' },
]

const REALTIME_MONITORS = [
  { label: 'CPU 使用率', value: '34%', icon: Cpu, bg: '#eff6ff', color: '#3b82f6', status: 'normal' },
  { label: '内存占用', value: '2.8 GB', icon: MemoryStick, bg: '#f5f3ff', color: '#8b5cf6', status: 'normal' },
  { label: '磁盘使用', value: '156 GB', icon: Database, bg: '#fff7ed', color: '#f97316', status: 'normal' },
  { label: '网络延迟', value: '12 ms', icon: Wifi, bg: '#f0fdf4', color: '#22c55e', status: 'normal' },
  { label: '在线设备', value: '3/3', icon: Monitor, bg: '#f0fdfa', color: '#14b8a6', status: 'normal' },
  { label: '活跃用户', value: '12', icon: Users, bg: '#fef2f2', color: '#ef4444', status: 'normal' },
  { label: '温度', value: '42°C', icon: Thermometer, bg: '#eff6ff', color: '#3b82f6', status: 'normal' },
  { label: '运行时间', value: '99.9%', icon: Gauge, bg: '#f0fdf4', color: '#22c55e', status: 'normal' },
]

const SYSTEM_STATUS = [
  { label: '系统状态', value: '运行正常', icon: CheckCircle, badge: '正常', badgeBg: '#f0fdf4', badgeColor: '#22c55e' },
  { label: '数据库', value: '已连接', icon: Database, badge: '正常', badgeBg: '#f0fdf4', badgeColor: '#22c55e' },
  { label: '接口服务', value: '正常', icon: Server, badge: '正常', badgeBg: '#f0fdf4', badgeColor: '#22c55e' },
  { label: '备份状态', value: '已执行', icon: Package, badge: '完成', badgeBg: '#eff6ff', badgeColor: '#3b82f6' },
  { label: '安全扫描', value: '无威胁', icon: ShieldAlert, badge: '安全', badgeBg: '#f0fdf4', badgeColor: '#22c55e' },
]

const ALERTS = [
  { id: 1, type: 'warning', icon: AlertTriangle, iconBg: '#fff7ed', iconColor: '#f97316', title: '耗材库存预警', desc: '耦合剂库存仅剩 20 瓶，建议尽快补货', time: '10分钟前', badge: '警告', badgeBg: '#fff7ed', badgeColor: '#f97316' },
  { id: 2, type: 'info', icon: Bell, iconBg: '#eff6ff', iconColor: '#3b82f6', title: '设备维护提醒', desc: '彩超仪 A 累计使用 800 小时', time: '30分钟前', badge: '通知', badgeBg: '#eff6ff', badgeColor: '#3b82f6' },
  { id: 3, type: 'urgent', icon: AlertCircle, iconBg: '#fef2f2', iconColor: '#ef4444', title: '危急值待处理', desc: '患者王五危急值已通报 30 分钟', time: '45分钟前', badge: '紧急', badgeBg: '#fef2f2', badgeColor: '#ef4444' },
]

const HOURLY_TREND = [
  { hour: '08:00', 检查数: 12, 报告数: 10 },
  { hour: '09:00', 检查数: 18, 报告数: 15 },
  { hour: '10:00', 检查数: 22, 报告数: 20 },
  { hour: '11:00', 检查数: 16, 报告数: 14 },
  { hour: '12:00', 检查数: 8, 报告数: 7 },
  { hour: '13:00', 检查数: 14, 报告数: 12 },
  { hour: '14:00', 检查数: 20, 报告数: 18 },
  { hour: '15:00', 检查数: 18, 报告数: 16 },
  { hour: '16:00', 检查数: 15, 报告数: 14 },
  { hour: '17:00', 检查数: 10, 报告数: 9 },
]

export default function DashboardPage() {
  const navigate = useNavigateRouter()
  const stats = initialStatisticsData

  const trendData = stats.examTrend.map((item, i) => ({
    date: item.date.slice(5),
    检查数: item.count,
    报告数: stats.reportTrend[i]?.count ?? 0,
  }))

  return (
    <div style={s.root}>
      {/* 标题 */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>综合监控面板</h1>
          <p style={s.subtitle}>
            实时数据监控 · 系统状态 · 综合看板
            <span style={{ marginLeft: 12, display: 'inline-flex', alignItems: 'center' }}>
              <span style={{ ...s.statusDot, background: '#22c55e' }} />
              <span style={{ color: '#22c55e', fontSize: 12 }}>系统运行正常</span>
            </span>
          </p>
        </div>
        <div style={s.headerRight}>
          <button style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
            <RefreshCw size={14} color="#64748b" /> 刷新数据
          </button>
          <button style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#3b82f6', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Settings size={14} /> 设置
          </button>
        </div>
      </div>

      {/* 快速入口 */}
      <div style={s.quickGrid}>
        {QUICK_ENTRIES.map((entry) => (
          <button key={entry.label} style={s.quickItem} onClick={() => navigate(entry.path)}>
            <div style={{ ...s.quickIcon, background: entry.bg, color: entry.color }}>
              <entry.icon size={22} />
            </div>
            <div style={s.quickLabel}>{entry.label}</div>
            <div style={s.quickSub}>{entry.sub}</div>
          </button>
        ))}
      </div>

      {/* 统计卡片行 */}
      <div style={s.statRow}>
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, background: '#eff6ff' }}>
            <Activity size={24} color="#3b82f6" />
          </div>
          <div style={s.statInfo}>
            <div style={s.statValue}>{stats.todayExams}</div>
            <div style={s.statLabel}>今日检查</div>
            <div style={{ ...s.statTrend, color: '#22c55e' }}>
              <TrendingUp size={12} /> +12% 较昨日
            </div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, background: '#f0fdf4' }}>
            <FileText size={24} color="#22c55e" />
          </div>
          <div style={s.statInfo}>
            <div style={s.statValue}>{stats.todayReports}</div>
            <div style={s.statLabel}>今日报告</div>
            <div style={{ ...s.statTrend, color: '#22c55e' }}>
              <TrendingUp size={12} /> +8% 较昨日
            </div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, background: '#fff7ed' }}>
            <CalendarClock size={24} color="#f97316" />
          </div>
          <div style={s.statInfo}>
            <div style={s.statValue}>{stats.todayAppointments}</div>
            <div style={s.statLabel}>今日预约</div>
            <div style={{ ...s.statTrend, color: '#94a3b8' }}>
              <TrendingDown size={12} /> 持平
            </div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, background: '#fef2f2' }}>
            <AlertTriangle size={24} color="#ef4444" />
          </div>
          <div style={s.statInfo}>
            <div style={s.statValue}>{stats.pendingReports}</div>
            <div style={s.statLabel}>待写报告</div>
            <div style={{ ...s.statTrend, color: '#ef4444' }}>
              <TrendingUp size={12} /> +3 新增
            </div>
          </div>
        </div>
      </div>

      {/* 图表行 */}
      <div style={s.chartRow}>
        <div style={s.chartCard}>
          <div style={s.chartTitle}>
            <TrendingUp size={16} style={s.chartIcon} />
            7日检查与报告趋势
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorExam" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorReport" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="检查数" stroke="#3b82f6" fill="url(#colorExam)" strokeWidth={2} />
              <Area type="monotone" dataKey="报告数" stroke="#22c55e" fill="url(#colorReport)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div style={s.chartCard}>
          <div style={s.chartTitle}>
            <PieChartIcon size={16} style={s.chartIcon} />
            检查类型分布
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={stats.examTypeDistribution}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={80}
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

      {/* 实时监控 */}
      <div style={s.monitorCard}>
        <div style={s.monitorHeader}>
          <div style={s.monitorTitle}>
            <Activity size={16} style={{ color: '#64748b' }} />
            实时系统监控
          </div>
          <div style={{ fontSize: 11, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
            实时更新中
          </div>
        </div>
        <div style={s.monitorGrid}>
          {REALTIME_MONITORS.map((item) => (
            <div key={item.label} style={s.monitorItem}>
              <div style={{ ...s.monitorIcon, background: item.bg, color: item.color }}>
                <item.icon size={18} />
              </div>
              <div style={s.monitorInfo}>
                <div style={s.monitorLabel}>{item.label}</div>
                <div style={s.monitorValue}>{item.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 系统状态 + 今日时段分布 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16, marginBottom: 24 }}>
        <div style={s.systemCard}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Server size={16} style={{ color: '#64748b' }} /> 系统状态
          </div>
          {SYSTEM_STATUS.map((item) => (
            <div key={item.label} style={s.systemItem}>
              <div style={s.systemLabel}>
                <item.icon size={14} color="#64748b" />
                {item.label}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={s.systemValue}>{item.value}</span>
                <span style={{ ...s.systemBadge, background: item.badgeBg, color: item.badgeColor }}>
                  {item.badge}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div style={s.chartCard}>
          <div style={s.chartTitle}>
            <Clock size={16} style={s.chartIcon} />
            今日时段分布
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={HOURLY_TREND}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="检查数" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="报告数" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 告警通知 */}
      <div style={s.alertCard}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <BellRing size={16} style={{ color: '#64748b' }} />
          告警通知
          <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 10, background: '#fef2f2', color: '#ef4444', marginLeft: 8 }}>
            {ALERTS.length} 条
          </span>
        </div>
        {ALERTS.map((alert) => (
          <div key={alert.id} style={s.alertItem}>
            <div style={{ ...s.alertIcon, background: alert.iconBg, color: alert.iconColor }}>
              <alert.icon size={18} />
            </div>
            <div style={s.alertContent}>
              <div style={s.alertTitle}>{alert.title}</div>
              <div style={s.alertDesc}>{alert.desc}</div>
              <div style={s.alertTime}>{alert.time}</div>
            </div>
            <div style={{ ...s.alertBadge, background: alert.badgeBg, color: alert.badgeColor }}>
              {alert.badge}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
