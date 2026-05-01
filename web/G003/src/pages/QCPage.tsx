// ============================================================
// G003 超声RIS系统 - 质量控制中心页面（完整版）
// 5项核心指标：报告及时率/图像达标率/退镜时间/洗消合格率/危急值上报率
// ============================================================
import React, { useState, useMemo } from 'react'
import {
  ClipboardCheck, TrendingUp, TrendingDown, CheckCircle2, AlertTriangle,
  Clock, Camera, Shield, Droplets, Activity, Calendar, Download,
  Filter, Search, ChevronLeft, ChevronRight, RefreshCw, Info,
  Target, Award, BarChart2, PieChart, ArrowUp, ArrowDown,
  X, Check, Bell, User, FileText, Settings, Eye, Timer
} from 'lucide-react'

// ========== 常量与类型 ==========
type IndicatorKey = 'reportTimeliness' | 'imageQuality' | 'withdrawalTime' | 'disinfection' | 'criticalValue'

interface Indicator {
  key: IndicatorKey
  name: string
  icon: React.ElementType
  unit: string
  current: number
  target: number
  trend: number[]
  status: 'excellent' | 'good' | 'warning' | 'danger'
  deptRank: { name: string; value: number; rank: number }[]
  description: string
  suggestions: string[]
}

interface DeptPerformance {
  dept: string
  reportTimeliness: number
  imageQuality: number
  withdrawalTime: number
  disinfection: number
  criticalValue: number
  totalScore: number
}

// ========== Mock 数据生成 ==========
const generateTrend = (base: number, variance: number, length = 12): number[] =>
  Array.from({ length }, (_, i) => Math.max(60, Math.min(100, base + (Math.random() - 0.5) * variance + (i * 0.3))))

const INDICATORS: Indicator[] = [
  {
    key: 'reportTimeliness',
    name: '报告及时率',
    icon: Clock,
    unit: '%',
    current: 94.2,
    target: 95,
    trend: generateTrend(92, 8),
    status: 'good',
    deptRank: [
      { name: '消化内科', value: 97.5, rank: 1 },
      { name: '胃肠外科', value: 95.8, rank: 2 },
      { name: '肝胆外科', value: 93.2, rank: 3 },
      { name: '超声中心', value: 91.6, rank: 4 },
      { name: 'VIP病区', value: 88.3, rank: 5 },
    ],
    description: '检查完成后24小时内出具报告的比例',
    suggestions: ['加强报告书写培训', '优化工作流程', '增加报告审核人员'],
  },
  {
    key: 'imageQuality',
    name: '图像达标率',
    icon: Camera,
    unit: '%',
    current: 87.6,
    target: 90,
    trend: generateTrend(85, 12),
    status: 'warning',
    deptRank: [
      { name: '超声中心', value: 95.2, rank: 1 },
      { name: '消化内科', value: 91.4, rank: 2 },
      { name: '胃肠外科', value: 88.7, rank: 3 },
      { name: '肝胆外科', value: 82.1, rank: 4 },
      { name: 'VIP病区', value: 76.5, rank: 5 },
    ],
    description: '图像采集符合22张标准（胃镜22张/肠镜22张/超声检查标准）的比例',
    suggestions: ['加强图片采集培训', '规范采集流程', '配置高质量摄像头'],
  },
  {
    key: 'withdrawalTime',
    name: '退镜时间合格率',
    icon: Timer,
    unit: '%',
    current: 78.3,
    target: 85,
    trend: generateTrend(74, 15),
    status: 'danger',
    deptRank: [
      { name: '超声中心', value: 92.8, rank: 1 },
      { name: '消化内科', value: 85.4, rank: 2 },
      { name: '胃肠外科', value: 76.2, rank: 3 },
      { name: '肝胆外科', value: 68.9, rank: 4 },
      { name: 'VIP病区', value: 61.3, rank: 5 },
    ],
    description: '结肠镜检查退镜时间≥6分钟的比例',
    suggestions: ['严格执行退镜时间规范', '使用计时器提醒', '加强质量意识教育'],
  },
  {
    key: 'disinfection',
    name: '洗消合格率',
    icon: Droplets,
    unit: '%',
    current: 99.1,
    target: 99,
    trend: generateTrend(98.5, 2),
    status: 'excellent',
    deptRank: [
      { name: '超声中心', value: 99.8, rank: 1 },
      { name: '消化内科', value: 99.5, rank: 2 },
      { name: '胃肠外科', value: 99.2, rank: 3 },
      { name: '肝胆外科', value: 98.9, rank: 4 },
      { name: 'VIP病区', value: 98.4, rank: 5 },
    ],
    description: '超声设备清洗消毒合格的比例',
    suggestions: ['继续保持', '定期维护设备', '加强日常监测'],
  },
  {
    key: 'criticalValue',
    name: '危急值上报率',
    icon: AlertTriangle,
    unit: '%',
    current: 96.8,
    target: 98,
    trend: generateTrend(95, 6),
    status: 'good',
    deptRank: [
      { name: '消化内科', value: 99.2, rank: 1 },
      { name: '超声中心', value: 98.5, rank: 2 },
      { name: '胃肠外科', value: 96.8, rank: 3 },
      { name: '肝胆外科', value: 94.2, rank: 4 },
      { name: 'VIP病区', value: 91.7, rank: 5 },
    ],
    description: '发现危急值后及时通知临床的比例',
    suggestions: ['完善危急值流程', '加强沟通机制', '建立快速响应通道'],
  },
]

const ALL_DEPTS: DeptPerformance[] = [
  { dept: '消化内科', reportTimeliness: 97.5, imageQuality: 91.4, withdrawalTime: 85.4, disinfection: 99.5, criticalValue: 99.2, totalScore: 94.6 },
  { dept: '胃肠外科', reportTimeliness: 95.8, imageQuality: 88.7, withdrawalTime: 76.2, disinfection: 99.2, criticalValue: 96.8, totalScore: 91.3 },
  { dept: '肝胆外科', reportTimeliness: 93.2, imageQuality: 82.1, withdrawalTime: 68.9, disinfection: 98.9, criticalValue: 94.2, totalScore: 87.5 },
  { dept: '超声中心', reportTimeliness: 91.6, imageQuality: 95.2, withdrawalTime: 92.8, disinfection: 99.8, criticalValue: 98.5, totalScore: 95.6 },
  { dept: 'VIP病区', reportTimeliness: 88.3, imageQuality: 76.5, withdrawalTime: 61.3, disinfection: 98.4, criticalValue: 91.7, totalScore: 83.2 },
]

// ========== 样式定义 ==========
const s: Record<string, React.CSSProperties> = {
  pageWrapper: {
    display: 'flex', flexDirection: 'column', height: '100%', minHeight: '80vh',
    background: '#f0f4f8', padding: 20,
  },
  pageHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 20, flexShrink: 0,
  },
  titleRow: { display: 'flex', alignItems: 'center', gap: 10 },
  title: { fontSize: 20, fontWeight: 700, color: '#1a3a5c', margin: 0 },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 4 },
  headerActions: { display: 'flex', gap: 10 },
  // 大按钮样式
  btnLarge: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 8,
    padding: '10px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(26,58,92,0.2)', minHeight: 44,
  },
  btnLargeSuccess: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8,
    padding: '10px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(22,163,74,0.2)', minHeight: 44,
  },
  // 筛选栏
  filterBar: {
    display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' as const,
    background: '#fff', padding: '12px 16px', borderRadius: 8,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: 16,
  },
  searchBox: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: '#f8fafc', border: '1px solid #e2e8f0',
    borderRadius: 6, padding: '8px 12px', flex: 1, minWidth: 200,
  },
  searchInput: {
    border: 'none', outline: 'none', background: 'transparent',
    fontSize: 13, color: '#334155', width: '100%',
  },
  select: {
    border: '1px solid #e2e8f0', borderRadius: 6, padding: '8px 12px',
    fontSize: 13, color: '#334155', background: '#f8fafc', outline: 'none', cursor: 'pointer',
  },
  // 5项核心指标卡片
  indicatorGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 16,
  },
  indicatorCard: {
    background: '#fff', borderRadius: 12, padding: 18,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb',
    display: 'flex', flexDirection: 'column', gap: 12, cursor: 'pointer',
    transition: 'all 0.2s',
  },
  indicatorCardActive: {
    border: '2px solid #2563eb', boxShadow: '0 4px 12px rgba(37,99,235,0.15)',
  },
  indicatorHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  indicatorIcon: {
    width: 40, height: 40, borderRadius: 10, display: 'flex',
    alignItems: 'center', justifyContent: 'center',
  },
  indicatorStatus: {
    width: 8, height: 8, borderRadius: '50%', marginTop: 4,
  },
  indicatorName: { fontSize: 13, fontWeight: 600, color: '#334155', margin: 0 },
  indicatorValue: { fontSize: 28, fontWeight: 800, margin: '4px 0' },
  indicatorTarget: { fontSize: 11, color: '#94a3b8', margin: 0 },
  indicatorTrend: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, marginTop: 4 },
  // 趋势图（纯CSS）
  trendChart: {
    display: 'flex', alignItems: 'flex-end', gap: 3, height: 50,
    marginTop: 8,
  },
  trendBar: {
    flex: 1, borderRadius: '3px 3px 0 0', transition: 'height 0.3s',
    minWidth: 6,
  },
  // 主内容区
  mainContent: {
    display: 'grid', gridTemplateColumns: '1fr 380px', gap: 16, flex: 1,
  },
  // 面板
  panel: {
    background: '#fff', borderRadius: 10, overflow: 'hidden',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column' as const,
  },
  panelHeader: {
    padding: '14px 18px', borderBottom: '1px solid #e2e8f0',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    background: '#f8fafc', flexShrink: 0,
  },
  panelTitle: { fontSize: 14, fontWeight: 700, color: '#1a3a5c', display: 'flex', alignItems: 'center', gap: 6, margin: 0 },
  panelBody: { padding: 16, overflowY: 'auto' as const, flex: 1 },
  // 详情指标卡
  detailCard: {
    background: '#fff', borderRadius: 12, padding: 20,
    border: '1px solid #e5e7eb', marginBottom: 16,
  },
  detailCardHeader: { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 },
  detailIconWrap: {
    width: 52, height: 52, borderRadius: 12, display: 'flex',
    alignItems: 'center', justifyContent: 'center',
  },
  detailTitle: { fontSize: 16, fontWeight: 700, color: '#1a3a5c', margin: 0 },
  detailDesc: { fontSize: 12, color: '#64748b', marginTop: 2 },
  // 进度条
  progressRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 },
  progressLabel: { fontSize: 12, color: '#475569', minWidth: 60 },
  progressBar: { flex: 1, height: 10, background: '#e5e7eb', borderRadius: 5, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 5, transition: 'width 0.6s' },
  progressValue: { fontSize: 13, fontWeight: 700, color: '#1a3a5c', minWidth: 50, textAlign: 'right' as const },
  progressTarget: { fontSize: 11, color: '#94a3b8', minWidth: 50 },
  // 排名表
  rankTable: { width: '100%', borderCollapse: 'collapse' },
  rankTh: {
    background: '#f8fafc', padding: '8px 10px', textAlign: 'left' as const,
    fontSize: 11, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e2e8f0',
  },
  rankTd: {
    padding: '8px 10px', fontSize: 12, color: '#334155', borderBottom: '1px solid #f1f5f9',
  },
  rankBadge: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: 20, height: 20, borderRadius: '50%', fontSize: 10, fontWeight: 700,
  },
  // 整改建议
  suggestionItem: {
    display: 'flex', alignItems: 'flex-start', gap: 10,
    background: '#f8fafc', borderRadius: 8, padding: '10px 14px', marginBottom: 8,
    border: '1px solid #e2e8f0',
  },
  suggestionNum: {
    width: 22, height: 22, borderRadius: '50%', background: '#2563eb', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 11, fontWeight: 700, flexShrink: 0,
  },
  suggestionText: { fontSize: 13, color: '#334155', lineHeight: 1.5 },
  // 总体统计
  summaryRow: { display: 'flex', gap: 12, marginBottom: 16 },
  summaryCard: {
    flex: 1, background: '#fff', borderRadius: 10, padding: 16,
    border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 12,
  },
  summaryIcon: {
    width: 44, height: 44, borderRadius: 10, display: 'flex',
    alignItems: 'center', justifyContent: 'center',
  },
  summaryLabel: { fontSize: 12, color: '#64748b', margin: 0 },
  summaryValue: { fontSize: 22, fontWeight: 800, color: '#1a3a5c', margin: '2px 0 0 0' },
  // 达标状态
  statusBadge: {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600,
  },
  badgeExcellent: { background: '#dcfce7', color: '#16a34a' },
  badgeGood: { background: '#dbeafe', color: '#2563eb' },
  badgeWarning: { background: '#fef3c7', color: '#d97706' },
  badgeDanger: { background: '#fee2e2', color: '#dc2626' },
  // 环形进度
  donutWrap: { position: 'relative', display: 'inline-block' },
  donutCenter: {
    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
    textAlign: 'center',
  },
  // 排名图表
  rankChart: { display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 },
  rankBarRow: { display: 'flex', alignItems: 'center', gap: 10 },
  rankBarLabel: { fontSize: 11, color: '#64748b', minWidth: 60, textAlign: 'right' as const },
  rankBar: { flex: 1, height: 20, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' },
  rankBarFill: { height: '100%', borderRadius: 4, transition: 'width 0.6s' },
  rankBarValue: { fontSize: 11, fontWeight: 600, color: '#334155', minWidth: 40 },
  // 按钮
  btnIcon: {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 6,
    padding: '8px 12px', fontSize: 12, cursor: 'pointer', minHeight: 36,
  },
  // Tab导航
  tabNav: {
    display: 'flex', borderBottom: '1px solid #e2e8f0', padding: '0 16px', background: '#fff',
  },
  tabBtn: {
    padding: '12px 18px', border: 'none', background: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500,
    color: '#64748b', borderBottom: '2px solid transparent', marginBottom: -1,
  },
  tabBtnActive: {
    padding: '12px 18px', border: 'none', background: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600,
    color: '#2563eb', borderBottom: '2px solid #2563eb', marginBottom: -1,
  },
}

// ========== 辅助函数 ==========
const getStatusColor = (status: Indicator['status']) => {
  const map: Record<Indicator['status'], string> = {
    excellent: '#16a34a', good: '#2563eb', warning: '#d97706', danger: '#dc2626',
  }
  return map[status]
}

const getStatusBg = (status: Indicator['status']) => {
  const map: Record<Indicator['status'], string> = {
    excellent: '#dcfce7', good: '#dbeafe', warning: '#fef3c7', danger: '#fee2e2',
  }
  return map[status]
}

const getStatusLabel = (status: Indicator['status']) => {
  const map: Record<Indicator['status'], string> = {
    excellent: '优秀', good: '良好', warning: '预警', danger: '不达标',
  }
  return map[status]
}

const getTrendIcon = (trend: number) => {
  if (trend > 0) return <ArrowUp size={12} color="#16a34a" />
  if (trend < 0) return <ArrowDown size={12} color="#dc2626" />
  return <TrendingUp size={12} color="#94a3b8" />
}

// ========== 子组件 ==========
const StatusBadge = ({ status }: { status: Indicator['status'] }) => (
  <span style={{ ...s.statusBadge, ...s[`badge${status.charAt(0).toUpperCase() + status.slice(1) as keyof typeof s}` as keyof typeof s] as React.CSSProperties }}>
    {status === 'excellent' && <CheckCircle2 size={12} />}
    {status === 'warning' && <AlertTriangle size={12} />}
    {status === 'danger' && <AlertTriangle size={12} />}
    {status === 'good' && <CheckCircle2 size={12} />}
    {getStatusLabel(status)}
  </span>
)

// 纯CSS趋势图
const TrendChart = ({ data, color }: { data: number[]; color: string }) => {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  return (
    <div style={s.trendChart}>
      {data.map((val, i) => {
        const height = 8 + ((val - min) / range) * 42
        return (
          <div
            key={i}
            style={{
              ...s.trendBar,
              height,
              background: i === data.length - 1 ? color : `${color}66`,
            }}
            title={`${val.toFixed(1)}%`}
          />
        )
      })}
    </div>
  )
}

// 环形图（SVG）
const DonutChart = ({ value, size = 80, stroke = 8, color = '#2563eb' }: { value: number; size?: number; stroke?: number; color?: string }) => {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference
  return (
    <div style={s.donutWrap}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div style={s.donutCenter}>
        <div style={{ fontSize: 16, fontWeight: 800, color: '#1a3a5c' }}>{value}</div>
        <div style={{ fontSize: 9, color: '#94a3b8' }}>%</div>
      </div>
    </div>
  )
}

// ========== 主组件 ==========
export default function QCPage() {
  const [selectedIndicator, setSelectedIndicator] = useState<IndicatorKey>('reportTimeliness')
  const [activeTab, setActiveTab] = useState<'overview' | 'dept' | 'trend'>('overview')
  const [searchDept, setSearchDept] = useState('')

  const indicator = INDICATORS.find(i => i.key === selectedIndicator)!

  const trendChange = indicator.trend.length >= 2
    ? indicator.trend[indicator.trend.length - 1] - indicator.trend[indicator.trend.length - 2]
    : 0

  const filteredDepts = ALL_DEPTS.filter(d =>
    d.dept.includes(searchDept) || searchDept === ''
  ).sort((a, b) => b.totalScore - a.totalScore)

  // 总体统计
  const overallStats = useMemo(() => {
    const excellentCount = INDICATORS.filter(i => i.status === 'excellent').length
    const warningCount = INDICATORS.filter(i => i.status === 'warning' || i.status === 'danger').length
    const avgScore = INDICATORS.reduce((sum, i) => sum + i.current, 0) / INDICATORS.length
    const qualifiedRate = (INDICATORS.filter(i => i.current >= i.target).length / INDICATORS.length) * 100
    return { excellentCount, warningCount, avgScore, qualifiedRate }
  }, [])

  return (
    <div style={s.pageWrapper}>
      {/* 页面头部 */}
      <div style={s.pageHeader}>
        <div>
          <div style={s.titleRow}>
            <ClipboardCheck size={24} color="#1a3a5c" />
            <h1 style={s.title}>质量控制中心</h1>
          </div>
          <p style={s.subtitle}>5项核心指标监控 · 科室排名分析 · 趋势追踪</p>
        </div>
        <div style={s.headerActions}>
          <button style={s.btnIcon}><RefreshCw size={14} />刷新数据</button>
          <button style={s.btnLarge}><Download size={14} />导出报表</button>
        </div>
      </div>

      {/* 总体统计 */}
      <div style={s.summaryRow}>
        <div style={s.summaryCard}>
          <div style={{ ...s.summaryIcon, background: '#dcfce7' }}>
            <Award size={22} color="#16a34a" />
          </div>
          <div>
            <div style={s.summaryLabel}>优秀指标数</div>
            <div style={{ ...s.summaryValue, color: '#16a34a' }}>{overallStats.excellentCount}/5</div>
          </div>
        </div>
        <div style={s.summaryCard}>
          <div style={{ ...s.summaryIcon, background: '#fee2e2' }}>
            <AlertTriangle size={22} color="#dc2626" />
          </div>
          <div>
            <div style={s.summaryLabel}>预警/不达标</div>
            <div style={{ ...s.summaryValue, color: '#dc2626' }}>{overallStats.warningCount}项</div>
          </div>
        </div>
        <div style={s.summaryCard}>
          <div style={{ ...s.summaryIcon, background: '#dbeafe' }}>
            <BarChart2 size={22} color="#2563eb" />
          </div>
          <div>
            <div style={s.summaryLabel}>平均达标率</div>
            <div style={s.summaryValue}>{overallStats.qualifiedRate.toFixed(0)}%</div>
          </div>
        </div>
        <div style={s.summaryCard}>
          <div style={{ ...s.summaryIcon, background: '#f3e8ff' }}>
            <Target size={22} color="#7c3aed" />
          </div>
          <div>
            <div style={s.summaryLabel}>综合评分</div>
            <div style={s.summaryValue}>{overallStats.avgScore.toFixed(1)}</div>
          </div>
        </div>
      </div>

      {/* Tab导航 */}
      <div style={s.tabNav}>
        <button style={activeTab === 'overview' ? s.tabBtnActive : s.tabBtn} onClick={() => setActiveTab('overview')}>
          <BarChart2 size={14} />指标总览
        </button>
        <button style={activeTab === 'dept' ? s.tabBtnActive : s.tabBtn} onClick={() => setActiveTab('dept')}>
          <User size={14} />科室排名
        </button>
        <button style={activeTab === 'trend' ? s.tabBtnActive : s.tabBtn} onClick={() => setActiveTab('trend')}>
          <TrendingUp size={14} />趋势分析
        </button>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* 5项核心指标卡片 */}
          <div style={s.indicatorGrid}>
            {INDICATORS.map(ind => {
              const Icon = ind.icon
              const color = getStatusColor(ind.status)
              const bg = getStatusBg(ind.status)
              return (
                <div
                  key={ind.key}
                  style={{
                    ...s.indicatorCard,
                    ...(selectedIndicator === ind.key ? s.indicatorCardActive : {}),
                  }}
                  onClick={() => setSelectedIndicator(ind.key)}
                >
                  <div style={s.indicatorHeader}>
                    <div style={{ ...s.indicatorIcon, background: bg }}>
                      <Icon size={20} color={color} />
                    </div>
                    <div style={{ ...s.indicatorStatus, background: color, boxShadow: `0 0 6px ${color}` }} />
                  </div>
                  <div>
                    <div style={s.indicatorName}>{ind.name}</div>
                    <div style={{ ...s.indicatorValue, color }}>{ind.current}<span style={{ fontSize: 14, fontWeight: 400 }}>{ind.unit}</span></div>
                    <div style={s.indicatorTarget}>目标: {ind.target}{ind.unit}</div>
                    <div style={s.indicatorTrend}>
                      {getTrendIcon(trendChange)}
                      <span style={{ color: trendChange >= 0 ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                        {Math.abs(trendChange).toFixed(1)}
                      </span>
                      <span style={{ color: '#94a3b8' }}>vs上月</span>
                    </div>
                  </div>
                  <TrendChart data={ind.trend} color={color} />
                  <StatusBadge status={ind.status} />
                </div>
              )
            })}
          </div>

          {/* 选中指标详情 */}
          <div style={s.mainContent}>
            <div>
              {/* 指标详情卡 */}
              <div style={s.detailCard}>
                <div style={s.detailCardHeader}>
                  <div style={{ ...s.detailIconWrap, background: getStatusBg(indicator.status) }}>
                    {(() => { const Icon = indicator.icon; return <Icon size={26} color={getStatusColor(indicator.status)} /> })()}
                  </div>
                  <div>
                    <div style={s.detailTitle}>{indicator.name}</div>
                    <div style={s.detailDesc}>{indicator.description}</div>
                  </div>
                  <StatusBadge status={indicator.status} />
                </div>

                {/* 当前值 vs 目标值 */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                    <DonutChart value={indicator.current} size={90} stroke={9} color={getStatusColor(indicator.status)} />
                    <div style={{ flex: 1 }}>
                      <div style={s.progressRow}>
                        <span style={s.progressLabel}>当前值</span>
                        <div style={s.progressBar}>
                          <div style={{ ...s.progressFill, width: `${Math.min(100, indicator.current)}%`, background: getStatusColor(indicator.status) }} />
                        </div>
                        <span style={{ ...s.progressValue, color: getStatusColor(indicator.status) }}>{indicator.current}%</span>
                      </div>
                      <div style={s.progressRow}>
                        <span style={s.progressLabel}>目标值</span>
                        <div style={s.progressBar}>
                          <div style={{ ...s.progressFill, width: `${indicator.target}%`, background: '#e5e7eb' }} />
                        </div>
                        <span style={{ ...s.progressValue, color: '#94a3b8' }}>{indicator.target}%</span>
                      </div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>
                        差距: {(indicator.target - indicator.current).toFixed(1)}% · {indicator.current >= indicator.target ? '已达标' : '未达标'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 月度趋势 */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 8 }}>近12个月趋势</div>
                  <TrendChart data={indicator.trend} color={getStatusColor(indicator.status)} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                    <span style={{ fontSize: 10, color: '#94a3b8' }}>12个月前</span>
                    <span style={{ fontSize: 10, color: '#94a3b8' }}>当前月份</span>
                  </div>
                </div>
              </div>

              {/* 整改建议 */}
              <div style={s.panel}>
                <div style={s.panelHeader}>
                  <div style={s.panelTitle}><Info size={14} />整改建议</div>
                </div>
                <div style={s.panelBody}>
                  {indicator.suggestions.map((suggestion, i) => (
                    <div key={i} style={s.suggestionItem}>
                      <div style={s.suggestionNum}>{i + 1}</div>
                      <div style={s.suggestionText}>{suggestion}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 右侧：科室排名 */}
            <div style={s.panel}>
              <div style={s.panelHeader}>
                <div style={s.panelTitle}><Award size={14} />科室排名</div>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>{indicator.name}</span>
              </div>
              <div style={s.panelBody}>
                <div style={s.rankChart}>
                  {indicator.deptRank.map((dept, i) => {
                    const colors = ['#f59e0b', '#94a3b8', '#cd7c2d', '#64748b', '#475569']
                    const barColor = colors[i] || '#64748b'
                    return (
                      <div key={dept.name} style={s.rankBarRow}>
                        <div style={s.rankBarLabel}>{dept.name}</div>
                        <div style={s.rankBar}>
                          <div style={{
                            ...s.rankBarFill,
                            width: `${dept.value}%`,
                            background: `linear-gradient(90deg, ${barColor}, ${barColor}aa)`,
                          }} />
                        </div>
                        <div style={{ ...s.rankBarValue, color: barColor }}>{dept.value}%</div>
                        <div style={{
                          ...s.rankBadge,
                          background: i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : i === 2 ? '#cd7c2d' : '#e2e8f0',
                          color: i < 3 ? '#fff' : '#64748b',
                        }}>
                          {dept.rank}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'dept' && (
        <>
          {/* 科室筛选 */}
          <div style={s.filterBar}>
            <div style={s.searchBox}>
              <Search size={16} color="#94a3b8" />
              <input
                style={s.searchInput}
                placeholder="搜索科室名称..."
                value={searchDept}
                onChange={e => setSearchDept(e.target.value)}
              />
            </div>
            <button style={s.btnIcon}><Download size={14} />导出科室数据</button>
          </div>

          {/* 科室排名表 */}
          <div style={s.panel}>
            <div style={s.panelBody}>
              <table style={s.rankTable}>
                <thead>
                  <tr>
                    <th style={{ ...s.rankTh, textAlign: 'center', width: 50 }}>排名</th>
                    <th style={s.rankTh}>科室</th>
                    <th style={s.rankTh}>报告及时率</th>
                    <th style={s.rankTh}>图像达标率</th>
                    <th style={s.rankTh}>退镜时间</th>
                    <th style={s.rankTh}>洗消合格</th>
                    <th style={s.rankTh}>危急值</th>
                    <th style={s.rankTh}>综合评分</th>
                    <th style={s.rankTh}>状态</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDepts.map((dept, i) => {
                    const score = dept.totalScore
                    const isExcellent = score >= 90
                    const isGood = score >= 80 && score < 90
                    const isWarning = score >= 70 && score < 80
                    const status = isExcellent ? 'excellent' : isGood ? 'good' : isWarning ? 'warning' : 'danger'
                    return (
                      <tr key={dept.dept}>
                        <td style={{ ...s.rankTd, textAlign: 'center' }}>
                          <span style={{
                            ...s.rankBadge,
                            background: i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : i === 2 ? '#cd7c2d' : '#e2e8f0',
                            color: i < 3 ? '#fff' : '#64748b',
                          }}>
                            {i + 1}
                          </span>
                        </td>
                        <td style={{ ...s.rankTd, fontWeight: 600, color: '#1a3a5c' }}>{dept.dept}</td>
                        <td style={s.rankTd}>
                          <span style={{ color: dept.reportTimeliness >= 95 ? '#16a34a' : dept.reportTimeliness >= 90 ? '#2563eb' : '#dc2626' }}>
                            {dept.reportTimeliness}%
                          </span>
                        </td>
                        <td style={s.rankTd}>
                          <span style={{ color: dept.imageQuality >= 90 ? '#16a34a' : dept.imageQuality >= 85 ? '#2563eb' : '#dc2626' }}>
                            {dept.imageQuality}%
                          </span>
                        </td>
                        <td style={s.rankTd}>
                          <span style={{ color: dept.withdrawalTime >= 85 ? '#16a34a' : dept.withdrawalTime >= 75 ? '#d97706' : '#dc2626' }}>
                            {dept.withdrawalTime}%
                          </span>
                        </td>
                        <td style={s.rankTd}>
                          <span style={{ color: dept.disinfection >= 99 ? '#16a34a' : '#d97706' }}>
                            {dept.disinfection}%
                          </span>
                        </td>
                        <td style={s.rankTd}>
                          <span style={{ color: dept.criticalValue >= 98 ? '#16a34a' : dept.criticalValue >= 95 ? '#2563eb' : '#dc2626' }}>
                            {dept.criticalValue}%
                          </span>
                        </td>
                        <td style={{ ...s.rankTd, fontWeight: 700, color: getStatusColor(status) }}>{score.toFixed(1)}</td>
                        <td style={s.rankTd}>
                          <StatusBadge status={status} />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'trend' && (
        <>
          {/* 趋势分析 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 16 }}>
            {INDICATORS.map(ind => {
              const Icon = ind.icon
              const color = getStatusColor(ind.status)
              return (
                <div key={ind.key} style={s.panel}>
                  <div style={s.panelHeader}>
                    <div style={s.panelTitle}>
                      <Icon size={13} color={color} />{ind.name}
                    </div>
                    <StatusBadge status={ind.status} />
                  </div>
                  <div style={{ padding: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <div>
                        <div style={{ fontSize: 22, fontWeight: 800, color }}>{ind.current}%</div>
                        <div style={{ fontSize: 10, color: '#94a3b8' }}>当前值</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 13, color: '#64748b' }}>目标: {ind.target}%</div>
                        <div style={{ fontSize: 11, color: ind.current >= ind.target ? '#16a34a' : '#dc2626' }}>
                          {ind.current >= ind.target ? '✓ 已达标' : `差距${(ind.target - ind.current).toFixed(1)}%`}
                        </div>
                      </div>
                    </div>
                    <TrendChart data={ind.trend} color={color} />
                  </div>
                </div>
              )
            })}
          </div>

          {/* 详细趋势数据 */}
          <div style={s.panel}>
            <div style={s.panelHeader}>
              <div style={s.panelTitle}><TrendingUp size={14} />指标趋势明细</div>
              <button style={s.btnIcon}><Download size={14} />导出趋势数据</button>
            </div>
            <div style={s.panelBody}>
              <table style={s.rankTable}>
                <thead>
                  <tr>
                    <th style={s.rankTh}>指标</th>
                    {[...Array(12)].map((_, i) => (
                      <th key={i} style={s.rankTh}>{`2026-${String(i + 1).padStart(2, '0')}`}</th>
                    ))}
                    <th style={s.rankTh}>年均值</th>
                  </tr>
                </thead>
                <tbody>
                  {INDICATORS.map(ind => {
                    const avg = ind.trend.reduce((a, b) => a + b, 0) / ind.trend.length
                    const color = getStatusColor(ind.status)
                    return (
                      <tr key={ind.key}>
                        <td style={{ ...s.rankTd, fontWeight: 600, color: '#1a3a5c' }}>{ind.name}</td>
                        {ind.trend.map((val, i) => (
                          <td key={i} style={{ ...s.rankTd, color: val >= ind.target ? '#16a34a' : val >= ind.target - 5 ? '#d97706' : '#dc2626' }}>
                            {val.toFixed(1)}
                          </td>
                        ))}
                        <td style={{ ...s.rankTd, fontWeight: 700, color }}>{avg.toFixed(1)}%</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
