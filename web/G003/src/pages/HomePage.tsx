// @ts-nocheck
// ============================================================
// G004 超声管理系统 - 首页概览（增强版）
// 快速操作 / 今日进度 / 快捷入口 / 专业仪表盘风格
// ============================================================
import { useState } from 'react'
import { useNavigate as useNavigateRouter } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import {
  Activity, FileText, ShieldCheck, AlertTriangle,
  TrendingUp, Users, Microscope, Clock, CheckCircle,
  BarChart3, PieChart as PieChartIcon, Plus, CalendarClock,
  Stethoscope, Package, RefreshCw, ShieldAlert,
  UserPlus, ClipboardList, PackagePlus, Bell,
  MessageSquare, AlertCircle, Syringe, Thermometer,
  HeartPulse, ClipboardCheck, UserCog, Zap,
  ChevronRight, BellRing, AlertOctagon, Info,
  CheckSquare, Square, Clock3, Tag,
  PackageSearch, Wrench, HardDrive
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { initialStatisticsData } from '../data/initialData'

// ---------- 样式 ----------
const s: Record<string, React.CSSProperties> = {
  root: { padding: 0 },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 20, fontWeight: 700, color: '#1a3a5c', margin: 0,
  },
  subtitle: {
    fontSize: 13, color: '#64748b', marginTop: 4,
  },
  headerRight: {
    display: 'flex',
    gap: 8,
  },
  // 快速操作入口
  quickActions: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: 12,
    marginBottom: 24,
  },
  quickAction: {
    background: '#fff',
    borderRadius: 12,
    padding: '16px 12px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: 'none',
    textAlign: 'center',
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: '#475569',
  },
  quickActionSub: {
    fontSize: 10,
    color: '#94a3b8',
  },
  // 统计卡片行
  statRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    background: '#fff',
    borderRadius: 12,
    padding: '20px 24px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  statIconWrap: {
    width: 48, height: 48, borderRadius: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  statInfo: { flex: 1, minWidth: 0 },
  statValue: {
    fontSize: 26, fontWeight: 700, color: '#1a3a5c', lineHeight: 1.2,
  },
  statLabel: {
    fontSize: 12, color: '#64748b', marginTop: 2,
  },
  statTrend: {
    fontSize: 11, color: '#22c55e', marginTop: 4, display: 'flex', alignItems: 'center', gap: 2,
  },
  // 图表行
  chartRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: 16,
    marginBottom: 24,
  },
  chartRow2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
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
  chartIcon: { color: '#64748b' },
  // 底部指标行
  indicatorRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16,
    marginTop: 24,
  },
  indicatorCard: {
    background: '#fff',
    borderRadius: 12,
    padding: '16px 20px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    borderLeft: '4px solid',
  },
  indicatorValue: {
    fontSize: 20, fontWeight: 700, color: '#1a3a5c',
  },
  indicatorLabel: {
    fontSize: 12, color: '#64748b', marginTop: 2,
  },
  // 快捷入口行
  linkRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 16,
    marginTop: 24,
  },
  linkCard: {
    background: '#fff',
    borderRadius: 12,
    padding: '16px 20px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: 'none',
    textAlign: 'left',
    width: '100%',
  },
  linkIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  linkInfo: { flex: 1 },
  linkTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: '#1a3a5c',
  },
  linkSub: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  // 今日进度条
  progressSection: {
    background: '#fff',
    borderRadius: 12,
    padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    marginBottom: 24,
  },
  progressRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 20,
    marginTop: 12,
  },
  progressItem: {},
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  progressValue: {
    fontSize: 12,
    fontWeight: 600,
    color: '#1a3a5c',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    background: '#e2e8f0',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    transition: 'width 0.3s',
  },
  // 颜色常量
  blue: { backgroundColor: '#eff6ff', color: '#3b82f6' },
  green: { backgroundColor: '#f0fdf4', color: '#22c55e' },
  orange: { backgroundColor: '#fff7ed', color: '#f97316' },
  red: { backgroundColor: '#fef2f2', color: '#ef4444' },
  purple: { backgroundColor: '#f5f3ff', color: '#8b5cf6' },
  teal: { backgroundColor: '#f0fdfa', color: '#14b8a6' },
  // ===== 新增样式 =====
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
  // 医生工作台
  workbenchGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24,
  },
  workbenchCard: {
    background: '#fff', borderRadius: 12, padding: 16,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  workbenchHeader: {
    display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
  },
  workbenchIcon: {
    width: 36, height: 36, borderRadius: 8, display: 'flex',
    alignItems: 'center', justifyContent: 'center',
  },
  workbenchTitle: { fontSize: 13, fontWeight: 600, color: '#1a3a5c' },
  workbenchCount: { fontSize: 22, fontWeight: 700, color: '#1a3a5c', marginBottom: 4 },
  workbenchSub: { fontSize: 11, color: '#64748b' },
  workbenchBar: { height: 5, borderRadius: 3, background: '#e2e8f0', overflow: 'hidden', marginTop: 8 },
  workbenchBarFill: { height: '100%', borderRadius: 3, transition: 'width 0.3s' },
  // KPI升级卡片（带环形+Sparkline）
  kpiCard: {
    background: '#fff', borderRadius: 12, padding: '20px 24px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex',
    alignItems: 'center', gap: 20,
  },
  kpiLeft: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 },
  kpiCenter: { flex: 1 },
  kpiRight: { display: 'flex', flexDirection: 'column', gap: 2 },
  kpiValue: { fontSize: 28, fontWeight: 700, color: '#1a3a5c', lineHeight: 1.1 },
  kpiLabel: { fontSize: 12, color: '#64748b', marginTop: 2 },
  kpiTrendUp: { fontSize: 11, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 2 },
  kpiTrendDown: { fontSize: 11, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 2 },
  kpiMini: { fontSize: 11, color: '#94a3b8' },
  // ===== 预警通知中心 =====
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
  // ===== 今日待办 =====
  todoCard: {
    background: '#fff', borderRadius: 12, padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 24,
  },
  todoHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 16,
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
  // ===== 版本信息 =====
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
  versionTagBeta: {
    fontSize: 10, fontWeight: 700, padding: '3px 10px',
    borderRadius: 10, background: '#fff7ed', color: '#f97316',
  },
}

// PIE_COLORS for exam type distribution
const PIE_COLORS = ['#3b82f6', '#22c55e', '#f97316', '#8b5cf6', '#14b8a6']

// 趋势图公共Tooltip
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
  { icon: PackagePlus, label: '耗材出库', sub: '物品管理', bg: '#fff7ed', color: '#f97316', path: '/materials' },
  { icon: Bell, label: '随访提醒', sub: '患者随访', bg: '#f0fdf4', color: '#22c55e', path: '/followup' },
]

// Quick link definitions
const QUICK_LINKS = [
  { icon: BarChart3, label: '科室数据看板', sub: 'BI分析 · 实时监控', bg: '#eff6ff', color: '#3b82f6', path: '/dashboard' },
  { icon: ShieldAlert, label: '权限管理', sub: '角色用户 · 访问控制', bg: '#fef2f2', color: '#ef4444', path: '/authority' },
]

// Today's progress data
const TODAY_PROGRESS = [
  { label: '今日检查', done: 38, total: 50, color: '#3b82f6' },
  { label: '已完成报告', done: 35, total: 38, color: '#22c55e' },
  { label: '待洗消超声探头', done: 6, total: 12, color: '#f97316' },
  { label: '待写报告', done: 8, total: 15, color: '#ef4444' },
]

// ===== 新增数据 =====
// 临床动态
const CLINICAL_FEEDS = [
  { id: 1, type: 'urgent', icon: AlertCircle, iconBg: '#fef2f2', iconColor: '#ef4444', title: '危急值通报', desc: '患者李红霞，腹部超声活检结果：高度异型增生', time: '10:32', badge: '紧急', badgeBg: '#fef2f2', badgeColor: '#ef4444' },
  { id: 2, type: 'report', icon: FileText, iconBg: '#eff6ff', iconColor: '#3b82f6', title: '检查报告完成', desc: '王建国 — 浅表超声检查（操作：赵主任）', time: '10:18', badge: '报告', badgeBg: '#eff6ff', badgeColor: '#3b82f6' },
  { id: 3, type: 'disinfect', icon: Syringe, iconBg: '#f0fdfa', iconColor: '#14b8a6', title: '超声探头洗消完成', desc: '腹部超声 #3 洗消完成，可投入使用', time: '09:55', badge: '洗消', badgeBg: '#f0fdfa', badgeColor: '#14b8a6' },
  { id: 4, type: 'appoint', icon: CalendarClock, iconBg: '#f5f3ff', iconColor: '#8b5cf6', title: '新增预约', desc: '张明 — 超声检查，预约时间 14:00', time: '09:40', badge: '预约', badgeBg: '#f5f3ff', badgeColor: '#8b5cf6' },
  { id: 5, type: 'critical', icon: HeartPulse, iconBg: '#fff7ed', iconColor: '#f97316', title: '麻醉复苏提醒', desc: '患者赵磊 — 丙泊酚麻醉复苏中，预计15分钟', time: '09:22', badge: '麻醉', badgeBg: '#fff7ed', badgeColor: '#f97316' },
]

// 医生工作台
const WORKBENCH_TASKS = [
  { icon: ClipboardCheck, title: '待写报告', count: 8, total: 15, bg: '#eff6ff', color: '#3b82f6', path: '/report-pending' },
  { icon: Syringe, title: '待洗消超声探头', count: 6, total: 12, bg: '#f0fdfa', color: '#14b8a6', path: '/disinfection' },
  { icon: AlertCircle, title: '危急值处理', count: 2, total: 5, bg: '#fef2f2', color: '#ef4444', path: '/critical-value' },
  { icon: CalendarClock, title: '今日预约', count: 12, total: 20, bg: '#f5f3ff', color: '#8b5cf6', path: '/appointments' },
  { icon: HeartPulse, title: '麻醉复苏', count: 3, total: 8, bg: '#fff7ed', color: '#f97316', path: '/recovery' },
  { icon: MessageSquare, title: '随访提醒', count: 5, total: 10, bg: '#f0fdf4', color: '#22c55e', path: '/followup' },
]

// KPI升级数据（含Sparkline趋势）
const KPI_DATA = [
  { label: '今日检查', value: 38, unit: '例', ring: 76, ringColor: '#3b82f6', trend: '+12%', trendUp: true, spark: [12, 18, 22, 28, 30, 35, 38], sparkColor: '#3b82f6' },
  { label: '报告完成率', value: 92.1, unit: '%', ring: 92, ringColor: '#22c55e', trend: '+3.2%', trendUp: true, spark: [80, 85, 82, 88, 90, 91, 92], sparkColor: '#22c55e' },
  { label: '洗消完成', value: 18, unit: '条', ring: 90, ringColor: '#14b8a6', trend: '+5%', trendUp: true, spark: [10, 12, 14, 15, 16, 17, 18], sparkColor: '#14b8a6' },
  { label: '平均预约等待', value: 2.3, unit: '天', ring: 65, ringColor: '#8b5cf6', trend: '-0.5天', trendUp: true, spark: [4.1, 3.8, 3.5, 3.2, 2.9, 2.6, 2.3], sparkColor: '#8b5cf6' },
]

// ===== 预警通知中心 =====
const ALERT_NOTIFICATIONS = [
  { id: 1, type: 'critical', icon: AlertOctagon, iconBg: '#fef2f2', iconColor: '#ef4444', title: '超声探头洗消超时预警', desc: '腹部超声 #2 洗消时间超过标准流程30分钟，需重新洗消', time: '10:45', badge: '危急', badgeBg: '#fef2f2', badgeColor: '#ef4444', level: 'critical' },
  { id: 2, type: 'warning', icon: AlertTriangle, iconBg: '#fff7ed', iconColor: '#f97316', title: '耗材库存不足', desc: '一次性活检钳库存仅剩 12 把，建议尽快补货', time: '09:30', badge: '警告', badgeBg: '#fff7ed', badgeColor: '#f97316', level: 'warning' },
  { id: 3, type: 'info', icon: Info, iconBg: '#eff6ff', iconColor: '#3b82f6', title: '设备维护提醒', desc: '电子腹部超声 EG-2990I 累计使用时长达到 800 小时，需进行维护', time: '08:00', badge: '通知', badgeBg: '#eff6ff', badgeColor: '#3b82f6', level: 'info' },
  { id: 4, type: 'warning', icon: BellRing, iconBg: '#fff7ed', iconColor: '#f97316', title: '患者随访逾期', desc: '患者王磊浅表超声复查逾期 7 天，请及时联系患者', time: '昨天', badge: '提醒', badgeBg: '#fff7ed', badgeColor: '#f97316', level: 'warning' },
  { id: 5, type: 'info', icon: PackageSearch, iconBg: '#f5f3ff', iconColor: '#8b5cf6', title: '新耗材入库待验收', desc: '采购订单 PO-2026-0428 到达仓库，请及时验收', time: '昨天', badge: '信息', badgeBg: '#f5f3ff', badgeColor: '#8b5cf6', level: 'info' },
]

// ===== 今日待办 =====
const TODAY_TODOS = [
  { id: 1, text: '完成患者张明浅表超声检查报告', tag: '报告', tagBg: '#eff6ff', tagColor: '#3b82f6', time: '09:00', done: true },
  { id: 2, text: '审核患者李红霞腹部超声活检申请单', tag: '审核', tagBg: '#f5f3ff', tagColor: '#8b5cf6', time: '10:00', done: false },
  { id: 3, text: '参加科室疑难病例讨论会', tag: '会议', tagBg: '#fef2f2', tagColor: '#ef4444', time: '14:00', done: false },
  { id: 4, text: '腹部超声 #1 使用后洗消交接', tag: '洗消', tagBg: '#f0fdfa', tagColor: '#14b8a6', time: '11:30', done: false },
  { id: 5, text: '完成本周质量控制数据上报', tag: '质控', tagBg: '#fff7ed', tagColor: '#f97316', time: '16:00', done: false },
  { id: 6, text: '查看患者赵磊麻醉复苏情况', tag: '麻醉', tagBg: '#f0fdf4', tagColor: '#22c55e', time: '09:45', done: true },
]

// ===== 版本信息 =====
const VERSION_INFO = [
  { label: '系统版本', value: 'G004 v0.12.0', tag: '最新', tagBeta: false, icon: Package },
  { label: '前端框架', value: 'React 18.2.0', tag: null, tagBeta: false, icon: Wrench },
  { label: '图表库', value: 'Recharts 2.10.0', tag: null, tagBeta: false, icon: BarChart3 },
  { label: '图标库', value: 'Lucide React 0.294.0', tag: null, tagBeta: false, icon: HardDrive },
  { label: '路由', value: 'React Router 6.20.0', tag: null, tagBeta: false, icon: ChevronRight },
  { label: '构建工具', value: 'Vite 5.0.0', tag: null, tagBeta: false, icon: PackageSearch },
]

// ============ 首页组件 ============
export default function HomePage() {
  const navigate = useNavigateRouter()
  const stats = initialStatisticsData
  const [todos, setTodos] = useState(TODAY_TODOS)

  // 合并趋势数据用于双线图
  const trendData = stats.examTrend.map((item, i) => ({
    date: item.date.slice(5), // MM-DD
    检查数: item.count,
    报告数: stats.reportTrend[i]?.count ?? 0,
  }))

  // 切换待办完成状态
  const toggleTodo = (id: number) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  // 待办数量
  const pendingCount = todos.filter(t => !t.done).length

  return (
    <div style={s.root}>
      {/* 标题 */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>超声探头诊疗信息管理系统</h1>
          <p style={s.subtitle}>
            {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })} · 您好，张建国医生
          </p>
        </div>
        <div style={s.headerRight}>
          <button
            style={{ ...s.quickAction, padding: '8px 14px', flexDirection: 'row', gap: 6, borderRadius: 8, boxShadow: 'none', border: '1px solid #e2e8f0' }}
            onClick={() => navigate('/')}
          >
            <RefreshCw size={13} color="#64748b" />
            <span style={{ fontSize: 12, color: '#64748b' }}>刷新</span>
          </button>
        </div>
      </div>

      {/* 快速操作入口 */}
      <div style={s.quickActions}>
        {QUICK_ACTIONS.map((action, idx) => (
          <button
            key={idx}
            style={s.quickAction}
            onClick={() => navigate(action.path)}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'none'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)' }}
          >
            <div style={{ ...s.quickActionIcon, background: action.bg }}>
              <action.icon size={20} color={action.color} />
            </div>
            <div style={s.quickActionLabel}>{action.label}</div>
            <div style={s.quickActionSub}>{action.sub}</div>
          </button>
        ))}
      </div>

      {/* ===== 临床动态 ===== */}
      <div style={s.clinicalFeed}>
        <div style={s.chartTitle}>
          <MessageSquare size={16} style={s.chartIcon} />
          临床动态
          <span style={{ marginLeft: 'auto', fontSize: 11, color: '#94a3b8', fontWeight: 400 }}>实时更新</span>
        </div>
        {CLINICAL_FEEDS.map((feed) => (
          <div key={feed.id} style={s.feedItem}>
            <div style={{ ...s.feedIcon, background: feed.iconBg }}>
              <feed.icon size={16} color={feed.iconColor} />
            </div>
            <div style={s.feedContent}>
              <div style={s.feedTitle}>{feed.title}</div>
              <div style={s.feedDesc}>{feed.desc}</div>
              <div style={s.feedTime}>{feed.time}</div>
            </div>
            <div style={{ ...s.feedBadge, background: feed.badgeBg, color: feed.badgeColor }}>
              {feed.badge}
            </div>
          </div>
        ))}
      </div>

      {/* ===== 预警通知中心 ===== */}
      <div style={s.alertCard}>
        <div style={s.chartTitle}>
          <BellRing size={16} style={{ color: '#ef4444' }} />
          预警通知中心
          <span style={{ marginLeft: 'auto', fontSize: 11, color: '#94a3b8', fontWeight: 400 }}>共 {ALERT_NOTIFICATIONS.length} 条预警</span>
        </div>
        {ALERT_NOTIFICATIONS.map((alert) => (
          <div key={alert.id} style={s.alertItem}>
            <div style={{ ...s.alertIcon, background: alert.iconBg }}>
              <alert.icon size={18} color={alert.iconColor} />
            </div>
            <div style={s.alertContent}>
              <div style={s.alertTitle}>{alert.title}</div>
              <div style={s.alertDesc}>{alert.desc}</div>
              <div style={s.alertMeta}>
                <Clock3 size={11} />
                <span>{alert.time}</span>
              </div>
            </div>
            <div style={{ ...s.alertBadge, background: alert.badgeBg, color: alert.badgeColor }}>
              {alert.badge}
            </div>
          </div>
        ))}
      </div>

      {/* ===== 今日待办 ===== */}
      <div style={s.todoCard}>
        <div style={s.todoHeader}>
          <div style={s.todoTitle}>
            <CheckSquare size={16} style={{ color: '#3b82f6' }} />
            今日待办
          </div>
          <div style={s.todoCount}>{pendingCount} 项待完成</div>
        </div>
        {todos.map((todo) => (
          <div key={todo.id} style={s.todoItem}>
            <div
              style={{
                ...s.todoCheck,
                background: todo.done ? '#22c55e' : 'transparent',
                borderColor: todo.done ? '#22c55e' : '#e2e8f0',
              }}
              onClick={() => toggleTodo(todo.id)}
            >
              {todo.done && <CheckCircle size={14} color="#fff" />}
              {!todo.done && <Square size={14} color="#e2e8f0" />}
            </div>
            <div style={todo.done ? s.todoTextDone : s.todoText}>{todo.text}</div>
            <div style={{ ...s.todoTag, background: todo.tagBg, color: todo.tagColor }}>{todo.tag}</div>
            <div style={s.todoTime}>{todo.time}</div>
          </div>
        ))}
      </div>

      {/* ===== 版本信息 ===== */}
      <div style={s.versionCard}>
        <div style={s.chartTitle}>
          <Info size={16} style={s.chartIcon} />
          版本信息
        </div>
        {VERSION_INFO.map((ver, idx) => (
          <div key={idx} style={{ ...s.versionRow, borderBottom: idx === VERSION_INFO.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
            <div style={s.versionLabel}>
              <ver.icon size={14} color="#64748b" />
              {ver.label}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={s.versionValue}>{ver.value}</span>
              {ver.tag && !ver.tagBeta && <span style={s.versionTag}>{ver.tag}</span>}
              {ver.tag && ver.tagBeta && <span style={s.versionTagBeta}>{ver.tag}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* ===== 医生工作台 ===== */}
      <div style={s.workbenchGrid}>
        {WORKBENCH_TASKS.map((task, idx) => {
          const pct = Math.round((task.count / task.total) * 100)
          return (
            <div
              key={idx}
              style={s.workbenchCard}
              onClick={() => navigate(task.path)}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'none'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)' }}
            >
              <div style={s.workbenchHeader}>
                <div style={{ ...s.workbenchIcon, background: task.bg }}>
                  <task.icon size={18} color={task.color} />
                </div>
                <div style={s.workbenchTitle}>{task.title}</div>
              </div>
              <div style={s.workbenchCount}>{task.count}</div>
              <div style={s.workbenchSub}>共 {task.total} 项</div>
              <div style={s.workbenchBar}>
                <div style={{ ...s.workbenchBarFill, width: `${pct}%`, background: task.color }} />
              </div>
            </div>
          )
        })}
      </div>

      {/* 今日检查进度条 */}
      <div style={s.progressSection}>
        <div style={s.chartTitle}>
          <Activity size={16} style={s.chartIcon} />
          今日检查进度
        </div>
        <div style={s.progressRow}>
          {TODAY_PROGRESS.map((item, idx) => {
            const pct = Math.round((item.done / item.total) * 100)
            return (
              <div key={idx} style={s.progressItem}>
                <div style={s.progressHeader}>
                  <span style={s.progressLabel}>{item.label}</span>
                  <span style={s.progressValue}>{item.done}/{item.total}</span>
                </div>
                <div style={s.progressBar}>
                  <div style={{ ...s.progressFill, width: `${pct}%`, background: item.color }} />
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, textAlign: 'right' }}>{pct}%</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ===== KPI升级卡片（环形进度+Sparkline） ===== */}
      <div style={s.statRow}>
        {KPI_DATA.map((kpi, idx) => (
          <div key={idx} style={s.kpiCard}>
            {/* 左侧环形进度 */}
            <div style={s.kpiLeft}>
              <RingProgress percent={kpi.ring} color={kpi.ringColor} size={72} />
            </div>
            {/* 中间数值+标签 */}
            <div style={s.kpiCenter}>
              <div style={s.kpiValue}>{kpi.value}<span style={{ fontSize: 14, fontWeight: 400, color: '#64748b' }}>{kpi.unit}</span></div>
              <div style={s.kpiLabel}>{kpi.label}</div>
              {/* Sparkline趋势 */}
              <div style={s.sparklineWrap}>
                <Sparkline data={kpi.spark} color={kpi.sparkColor} />
              </div>
            </div>
            {/* 右侧趋势 */}
            <div style={s.kpiRight}>
              <div style={kpi.trendUp ? s.kpiTrendUp : s.kpiTrendDown}>
                {kpi.trendUp ? <TrendingUp size={12} /> : <TrendingUp size={12} style={{ transform: 'rotate(180deg)' }} />}
                {kpi.trend}
              </div>
              <div style={s.kpiMini}>周环比</div>
            </div>
          </div>
        ))}
      </div>

      {/* 检查/报告趋势 + 检查类型分布 */}
      <div style={s.chartRow}>
        {/* 趋势折线图 */}
        <div style={s.chartCard}>
          <div style={s.chartTitle}>
            <TrendingUp size={16} style={s.chartIcon} />
            近7日检查与报告趋势
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trendData} {...trendTooltip}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip {...trendTooltip} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="检查数"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="报告数"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 检查类型饼图 */}
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
                cy="45%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {stats.examTypeDistribution.map((_, idx) => (
                  <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => `${value} 例`}
                contentStyle={{
                  background: '#fff', border: '1px solid #e2e8f0',
                  borderRadius: 8, fontSize: 12,
                }}
              />
              <Legend
                layout="vertical"
                align="right"
                verticalAlign="middle"
                wrapperStyle={{ fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 检查室工作量 + 医生工作量 */}
      <div style={s.chartRow2}>
        <div style={s.chartCard}>
          <div style={s.chartTitle}>
            <BarChart3 size={16} style={s.chartIcon} />
            各检查室工作量
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.roomWorkload} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="room" tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip {...trendTooltip} />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={s.chartCard}>
          <div style={s.chartTitle}>
            <Users size={16} style={s.chartIcon} />
            医生工作量
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.doctorWorkload} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="doctor" tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip {...trendTooltip} />
              <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 快捷链接 */}
      <div style={s.linkRow}>
        {QUICK_LINKS.map((link, idx) => (
          <button
            key={idx}
            style={s.linkCard}
            onClick={() => navigate(link.path)}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'none'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)' }}
          >
            <div style={{ ...s.linkIcon, background: link.bg }}>
              <link.icon size={20} color={link.color} />
            </div>
            <div style={s.linkInfo}>
              <div style={s.linkTitle}>{link.label}</div>
              <div style={s.linkSub}>{link.sub}</div>
            </div>
            <ChevronRight size={16} color="#94a3b8" />
          </button>
        ))}
      </div>

      {/* 本月关键指标 */}
      <div style={s.indicatorRow}>
        <IndicatorCard
          label="本月检查总量"
          value={stats.monthExamCount}
          unit="例"
          borderColor={s.blue.color}
        />
        <IndicatorCard
          label="报告完成率"
          value={stats.monthReportCompletionRate}
          unit="%"
          borderColor={s.green.color}
        />
        <IndicatorCard
          label="腹部超声平均拍照"
          value={stats.monthGastroscopyAvgPhotos}
          unit="张"
          borderColor={s.purple.color}
          suffix="/ ≥22张"
        />
        <IndicatorCard
          label="超声平均退镜"
          value={stats.monthColonoscopyAvgWithdrawal}
          unit="分钟"
          borderColor={s.orange.color}
          suffix="/ ≥6分钟"
        />
      </div>
    </div>
  )
}



// ---------- StatCard 子组件 ----------
interface StatCardProps {
  icon: LucideIcon
  iconBg: React.CSSProperties['background']
  iconColor: string
  value: number
  label: string
  trend?: string
  isAlert?: boolean
}

function StatCard({ icon: Icon, iconBg, iconColor, value, label, trend, isAlert }: StatCardProps) {
  return (
    <div style={s.statCard}>
      <div style={{ ...s.statIconWrap, background: iconBg }}>
        <Icon size={22} color={iconColor} />
      </div>
      <div style={s.statInfo}>
        <div style={{
          ...s.statValue,
          color: isAlert ? s.red.color : '#1a3a5c',
        }}>
          {value}
        </div>
        <div style={s.statLabel}>{label}</div>
        {trend && (
          <div style={{
            ...s.statTrend,
            color: trend.startsWith('↑') ? '#22c55e' : trend === '持平' ? '#94a3b8' : '#ef4444',
          }}>
            {trend.startsWith('↑') && <TrendingUp size={11} />}
            {trend}
          </div>
        )}
      </div>
    </div>
  )
}

// ---------- IndicatorCard 子组件 ----------
interface IndicatorCardProps {
  label: string
  value: number
  unit: string
  borderColor: string
  suffix?: string
}

function IndicatorCard({ label, value, unit, borderColor, suffix }: IndicatorCardProps) {
  return (
    <div style={{
      ...s.indicatorCard,
      borderLeftColor: borderColor,
    }}>
      <div style={s.indicatorValue}>
        {value}
        <span style={{ fontSize: 12, fontWeight: 400, color: '#64748b', marginLeft: 2 }}>
          {unit}
        </span>
        {suffix && (
          <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 4 }}>{suffix}</span>
        )}
      </div>
      <div style={s.indicatorLabel}>{label}</div>
    </div>
  )
}

// ========== 新增子组件 ==========

// 环形进度组件
interface RingProgressProps {
  percent: number
  color: string
  size?: number
  strokeWidth?: number
}

function RingProgress({ percent, color, size = 72, strokeWidth = 8 }: RingProgressProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percent / 100) * circumference

  return (
    <div style={{ ...s.ringProgress, width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* 背景圈 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
        />
        {/* 进度圈 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div style={{ ...s.ringLabel, fontSize: size * 0.18 }}>{percent}%</div>
    </div>
  )
}

// Sparkline迷你趋势图组件
interface SparklineProps {
  data: number[]
  color: string
  width?: number
  height?: number
}

function Sparkline({ data, color, width = 80, height = 28 }: SparklineProps) {
  if (!data || data.length < 2) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const padding = 2

  const points = data.map((val, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2)
    const y = height - padding - ((val - min) / range) * (height - padding * 2)
    return `${x},${y}`
  })

  const polylinePoints = points.join(' ')

  // 面积路径（闭合）
  const areaPath = `M${points[0]} ` +
    points.slice(1).map(p => `L${p}`).join(' ') +
    ` L${width - padding},${height - padding} L${padding},${height - padding} Z`

  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`sg_${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.25} />
          <stop offset="100%" stopColor={color} stopOpacity={0.02} />
        </linearGradient>
      </defs>
      {/* 面积填充 */}
      <path d={areaPath} fill={`url(#sg_${color.replace('#', '')})`} />
      {/* 线条 */}
      <polyline
        points={polylinePoints}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* 端点圆点 */}
      <circle
        cx={Number(points[points.length - 1].split(',')[0])}
        cy={Number(points[points.length - 1].split(',')[1])}
        r={3}
        fill={color}
      />
    </svg>
  )
}
