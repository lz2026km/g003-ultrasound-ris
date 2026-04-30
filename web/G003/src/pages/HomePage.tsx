// @ts-nocheck
// ============================================================
// G003 超声RIS系统 - 首页概览 v0.2.0
// 患者检查工作流 · 今日概览 · 危急值预警 · AI质控 · 快捷操作
// ============================================================
import { useState, useEffect } from 'react'
import { useNavigate as useNavigateRouter } from 'react-router-dom'
import ReactECharts from 'echarts-for-react'
import {
  Activity, FileText, AlertTriangle, TrendingUp,
  CalendarClock, CheckCircle, Plus, UserPlus,
  Stethoscope, Bell, ClipboardCheck, Clock,
  AlertOctagon, Sparkles, ListChecks, ArrowRight,
  UserCheck, ClipboardList, PackageSearch,
  Scan, Archive, Printer, Send, XCircle,
  CheckSquare, X, RefreshCw, Info,
} from 'lucide-react'
import { initialStatisticsData } from '../data/initialData'

// ---------- 样式 ----------
const s: Record<string, React.CSSProperties> = {
  root: { padding: 0 },
  header: { marginBottom: 24 },
  title: { fontSize: 20, fontWeight: 700, color: '#1a3a5c', margin: 0 },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 4 },
  // 顶栏
  topBar: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 },
  // 今日概览卡片组
  overviewRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 },
  overviewCard: {
    background: '#fff', borderRadius: 12, padding: '16px 20px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex',
    flexDirection: 'column', gap: 8,
  },
  overviewCardTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  overviewCardIcon: {
    width: 36, height: 36, borderRadius: 8, display: 'flex',
    alignItems: 'center', justifyContent: 'center',
  },
  overviewCardValue: { fontSize: 28, fontWeight: 700, color: '#1a3a5c', lineHeight: 1.1 },
  overviewCardLabel: { fontSize: 12, color: '#64748b' },
  overviewCardTrend: { fontSize: 11, display: 'flex', alignItems: 'center', gap: 2 },
  // 主内容区
  mainGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 },
  // 环形进度卡
  ringCard: {
    background: '#fff', borderRadius: 12, padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  cardTitle: {
    fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 16,
    display: 'flex', alignItems: 'center', gap: 6,
  },
  // 时间轴
  timelineCard: {
    background: '#fff', borderRadius: 12, padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  timelineItem: {
    display: 'flex', gap: 12, paddingBottom: 16, position: 'relative',
  },
  timelineDot: {
    width: 28, height: 28, borderRadius: '50%', display: 'flex',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1,
  },
  timelineLine: {
    position: 'absolute', left: 13, top: 28, bottom: 0, width: 2, background: '#e2e8f0',
  },
  timelineContent: { flex: 1, paddingTop: 2 },
  timelineTitle: { fontSize: 12, fontWeight: 600, color: '#1a3a5c' },
  timelineDesc: { fontSize: 11, color: '#64748b', marginTop: 2 },
  timelineTime: { fontSize: 10, color: '#94a3b8', marginTop: 2 },
  // 危急值卡片
  criticalCard: {
    background: '#fff', borderRadius: 12, padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    border: '2px solid #ef4444', marginBottom: 16,
  },
  criticalHeader: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 },
  criticalBadge: {
    fontSize: 11, fontWeight: 700, padding: '3px 10px',
    borderRadius: 10, background: '#fef2f2', color: '#ef4444',
  },
  criticalItem: {
    display: 'flex', gap: 10, padding: '10px 0',
    borderBottom: '1px solid #f1f5f9', alignItems: 'center',
  },
  criticalIcon: {
    width: 32, height: 32, borderRadius: 8, display: 'flex',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  criticalText: { flex: 1 },
  criticalTitle: { fontSize: 12, fontWeight: 600, color: '#1a3a5c' },
  criticalDesc: { fontSize: 11, color: '#64748b', marginTop: 1 },
  criticalTime: { fontSize: 10, color: '#94a3b8', flexShrink: 0 },
  // AI质控卡
  aiQCard: {
    background: '#fff', borderRadius: 12, padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    border: '1px solid #dbeafe', marginBottom: 16,
  },
  aiQCIcon: {
    width: 32, height: 32, borderRadius: 8, background: '#eff6ff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#3b82f6',
  },
  aiQCItem: {
    display: 'flex', gap: 10, padding: '8px 0',
    borderBottom: '1px solid #f1f5f9', alignItems: 'flex-start',
  },
  aiQCText: { flex: 1 },
  aiQCTitle: { fontSize: 12, color: '#475569' },
  aiQCMeta: { fontSize: 10, color: '#94a3b8', marginTop: 1 },
  aiQCBadge: {
    fontSize: 10, fontWeight: 600, padding: '2px 8px',
    borderRadius: 8, flexShrink: 0,
  },
  // 快捷操作
  quickActions: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16,
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
  // 近期报告
  reportCard: {
    background: '#fff', borderRadius: 12, padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  reportItem: {
    display: 'flex', gap: 10, padding: '10px 0',
    borderBottom: '1px solid #f1f5f9', alignItems: 'center',
  },
  reportAvatar: {
    width: 32, height: 32, borderRadius: '50%', background: '#eff6ff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#3b82f6', fontSize: 12, fontWeight: 700, flexShrink: 0,
  },
  reportText: { flex: 1 },
  reportName: { fontSize: 12, fontWeight: 600, color: '#1a3a5c' },
  reportDesc: { fontSize: 11, color: '#64748b', marginTop: 1 },
  reportMeta: { fontSize: 10, color: '#94a3b8', flexShrink: 0 },
  reportBadge: {
    fontSize: 10, fontWeight: 600, padding: '2px 8px',
    borderRadius: 8, flexShrink: 0,
  },
  // 颜色辅助
  blue: { bg: '#eff6ff', color: '#3b82f6' },
  green: { bg: '#f0fdf4', color: '#22c55e' },
  orange: { bg: '#fff7ed', color: '#f97316' },
  red: { bg: '#fef2f2', color: '#ef4444' },
  purple: { bg: '#f5f3ff', color: '#8b5cf6' },
  teal: { bg: '#f0fdfa', color: '#14b8a6' },
}

// 工作流时间轴数据
const WORKFLOW_STEPS = [
  { step: 1, label: '预约登记', icon: CalendarClock, status: 'done', time: '08:30', desc: '患者赵丽预约产科超声' },
  { step: 2, label: '登记报到', icon: UserCheck, status: 'done', time: '09:00', desc: '患者已到达前台登记' },
  { step: 3, label: '检查执行', icon: Scan, status: 'active', time: '09:15', desc: '李红正在进行心血管检查' },
  { step: 4, label: '报告书写', icon: FileText, status: 'pending', time: '--:--', desc: '等待检查完成后书写' },
  { step: 5, label: '报告审核', icon: ClipboardCheck, status: 'pending', time: '--:--', desc: '等待报告提交审核' },
  { step: 6, label: '报告归档', icon: Archive, status: 'pending', time: '--:--', desc: '审核通过后自动归档' },
]

// 今日概览数据
const TODAY_OVERVIEW = [
  { label: '今日预约', value: 18, icon: CalendarClock, trend: '+3', trendUp: true, bg: '#eff6ff', color: '#3b82f6', unit: '例' },
  { label: '待检查', value: 8, icon: Clock, trend: '+2', trendUp: false, bg: '#fff7ed', color: '#f97316', unit: '例' },
  { label: '进行中', value: 3, icon: Activity, trend: '', trendUp: true, bg: '#f5f3ff', color: '#8b5cf6', unit: '例' },
  { label: '已完成报告', value: 42, icon: CheckCircle, trend: '+5', trendUp: true, bg: '#f0fdf4', color: '#22c55e', unit: '份' },
]

// 危急值数据
const CRITICAL_ALERTS = [
  { id: 1, icon: AlertOctagon, iconBg: '#fef2f2', iconColor: '#ef4444', title: '左室壁瘤伴血栓', desc: '患者王五 · 心脏超声危急值', time: '10:32', level: '危急' },
  { id: 2, icon: AlertTriangle, iconBg: '#fff7ed', iconColor: '#f97316', title: '腹部超声异常', desc: '患者孙伟 · 腹部超声异常指标', time: '09:15', level: '异常' },
]

// AI质控提示
const AI_QC_TIPS = [
  { id: 1, title: '报告书写规范性提醒', desc: '患者张三的报告缺少检查所见描述，建议补充', level: '建议', levelBg: '#eff6ff', levelColor: '#3b82f6' },
  { id: 2, title: '图像质量预警', desc: '彩超仪B第3通道图像增益偏高，建议调整', level: '注意', levelBg: '#fff7ed', levelColor: '#f97316' },
  { id: 3, title: '危急值及时性提醒', desc: '患者王五危急值已通报15分钟，请尽快处理', level: '催促', levelBg: '#fef2f2', levelColor: '#ef4444' },
]

// 近期报告
const RECENT_REPORTS = [
  { id: 1, name: '张三', exam: '腹部超声', doctor: '李明辉', time: '10:18', status: '已审核', statusBg: '#f0fdf4', statusColor: '#22c55e' },
  { id: 2, name: '李红', exam: '心血管超声', doctor: '李明辉', time: '09:55', status: '待审核', statusBg: '#fff7ed', statusColor: '#f97316' },
  { id: 3, name: '赵丽', exam: '产科超声', doctor: '王芳', time: '09:30', status: '已审核', statusBg: '#f0fdf4', statusColor: '#22c55e' },
  { id: 4, name: '孙伟', exam: '甲状腺超声', doctor: '李明辉', time: '昨天', status: '已归档', statusBg: '#eff6ff', statusColor: '#3b82f6' },
  { id: 5, name: '周敏', exam: '乳腺超声', doctor: '王芳', time: '昨天', status: '已归档', statusBg: '#eff6ff', statusColor: '#3b82f6' },
]

// 快捷操作
const QUICK_ACTIONS = [
  { icon: UserPlus, label: '新建患者', sub: '登记建档', bg: '#eff6ff', color: '#3b82f6', path: '/patients' },
  { icon: CalendarClock, label: '预约检查', sub: '安排日程', bg: '#f5f3ff', color: '#8b5cf6', path: '/appointments' },
  { icon: FileText, label: '书写报告', sub: '电子病历', bg: '#f0fdfa', color: '#14b8a6', path: '/report-write' },
]

// 工作流环形图 ECharts option
const workflowRingOption = {
  backgroundColor: 'transparent',
  series: [
    {
      type: 'gauge',
      startAngle: 90,
      endAngle: -270,
      radius: '90%',
      pointer: { show: false },
      progress: {
        show: true,
        overlap: false,
        roundCap: true,
        clip: false,
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [
              { offset: 0, color: '#3b82f6' },
              { offset: 0.5, color: '#8b5cf6' },
              { offset: 1, color: '#22c55e' },
            ],
          },
        },
      },
      axisLine: { lineStyle: { width: 14, color: [[1, '#e2e8f0']] } },
      splitLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false },
      data: [{ value: 67, name: '工作流进度', title: { offsetCenter: ['0%', '30%'], fontSize: 12, color: '#64748b' }, detail: { offsetCenter: ['0%', '-5%'], fontSize: 26, fontWeight: 700, color: '#1a3a5c', formatter: '{value}%' } }],
      detail: { valueAnimation: true, fontSize: 26, fontWeight: 700, color: '#1a3a5c', formatter: '{value}%' },
    },
  ],
  title: {
    text: '患者检查工作流进度',
    left: 'center',
    top: 10,
    textStyle: { fontSize: 14, fontWeight: 600, color: '#1a3a5c' },
  },
}

export default function HomePage() {
  const navigate = useNavigateRouter()
  const stats = initialStatisticsData
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100)
    return () => clearTimeout(t)
  }, [])

  const getWorkflowStatusColor = (status: string) => {
    if (status === 'done') return '#22c55e'
    if (status === 'active') return '#3b82f6'
    return '#e2e8f0'
  }

  const getWorkflowStatusBg = (status: string) => {
    if (status === 'done') return '#f0fdf4'
    if (status === 'active') return '#eff6ff'
    return '#f8fafc'
  }

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

      {/* 今日检查概览卡片 */}
      <div style={s.overviewRow}>
        {TODAY_OVERVIEW.map((item) => (
          <div key={item.label} style={s.overviewCard}>
            <div style={s.overviewCardTop}>
              <div style={{ ...s.overviewCardIcon, background: item.bg, color: item.color }}>
                <item.icon size={18} />
              </div>
              {item.trend && (
                <div style={{ ...s.overviewCardTrend, color: item.trendUp ? '#22c55e' : '#ef4444' }}>
                  <TrendingUp size={11} /> {item.trend}
                </div>
              )}
            </div>
            <div style={s.overviewCardValue}>{item.value}<span style={{ fontSize: 14, fontWeight: 400, color: '#64748b' }}> {item.unit}</span></div>
            <div style={s.overviewCardLabel}>{item.label}</div>
          </div>
        ))}
      </div>

      {/* 主内容区：环形图 + 时间轴 */}
      <div style={s.mainGrid}>
        {/* 患者检查工作流进度环形图 */}
        <div style={s.ringCard}>
          <ReactECharts option={workflowRingOption} style={{ height: 240 }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 8 }}>
            {[
              { label: '已完成', value: 4, color: '#22c55e' },
              { label: '进行中', value: 3, color: '#3b82f6' },
              { label: '待处理', value: 5, color: '#e2e8f0' },
            ].map((d) => (
              <div key={d.label} style={{ textAlign: 'center', padding: '8px 4px', background: '#f8fafc', borderRadius: 8 }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: d.color }}>{d.value}</div>
                <div style={{ fontSize: 10, color: '#64748b' }}>{d.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 工作流时间轴 */}
        <div style={s.timelineCard}>
          <div style={s.cardTitle}><Activity size={15} color="#3b82f6" /> 患者检查工作流</div>
          {WORKFLOW_STEPS.map((step, idx) => (
            <div key={step.step} style={{ ...s.timelineItem, paddingBottom: idx === WORKFLOW_STEPS.length - 1 ? 0 : 16 }}>
              <div style={{ ...s.timelineDot, background: getWorkflowStatusBg(step.status), border: `2px solid ${getWorkflowStatusColor(step.status)}` }}>
                <step.icon size={13} color={getWorkflowStatusColor(step.status)} />
              </div>
              {idx < WORKFLOW_STEPS.length - 1 && <div style={s.timelineLine} />}
              <div style={s.timelineContent}>
                <div style={{ ...s.timelineTitle, color: step.status === 'done' ? '#94a3b8' : step.status === 'active' ? '#1a3a5c' : '#cbd5e1' }}>{step.label}</div>
                <div style={{ ...s.timelineDesc, color: step.status === 'done' ? '#cbd5e1' : '#94a3b8' }}>{step.desc}</div>
                <div style={{ ...s.timelineTime, color: step.status === 'active' ? '#3b82f6' : '#94a3b8' }}>{step.time}</div>
              </div>
              {step.status === 'active' && (
                <div style={{ fontSize: 10, fontWeight: 600, color: '#3b82f6', background: '#eff6ff', padding: '2px 8px', borderRadius: 8 }}>
                  当前
                </div>
              )}
              {step.status === 'done' && (
                <CheckCircle size={14} color="#22c55e" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 危急值预警卡片（红色高亮） */}
      <div style={s.criticalCard}>
        <div style={s.criticalHeader}>
          <AlertOctagon size={16} color="#ef4444" />
          <span style={{ fontSize: 14, fontWeight: 600, color: '#1a3a5c' }}>危急值预警</span>
          <div style={s.criticalBadge}>紧急</div>
          <div style={{ marginLeft: 'auto', fontSize: 11, color: '#94a3b8' }}>{new Date().toLocaleDateString('zh-CN')}</div>
        </div>
        {CRITICAL_ALERTS.map((alert) => (
          <div key={alert.id} style={s.criticalItem}>
            <div style={{ ...s.criticalIcon, background: alert.iconBg, color: alert.iconColor }}>
              <alert.icon size={15} />
            </div>
            <div style={s.criticalText}>
              <div style={s.criticalTitle}>{alert.title}</div>
              <div style={s.criticalDesc}>{alert.desc}</div>
            </div>
            <div style={{ ...s.reportBadge, background: alert.iconBg, color: alert.iconColor }}>{alert.level}</div>
            <div style={s.criticalTime}>{alert.time}</div>
          </div>
        ))}
      </div>

      {/* 快捷操作入口 */}
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

      {/* AI质控提示卡片 */}
      <div style={s.aiQCard}>
        <div style={{ ...s.cardTitle, marginBottom: 12 }}>
          <div style={s.aiQCIcon}><Sparkles size={15} /></div>
          <span>AI质控提示</span>
          <div style={{ marginLeft: 'auto', fontSize: 10, color: '#94a3b8' }}>共 {AI_QC_TIPS.length} 条</div>
        </div>
        {AI_QC_TIPS.map((tip) => (
          <div key={tip.id} style={s.aiQCItem}>
            <div style={{ flex: 1 }}>
              <div style={s.aiQCTitle}>{tip.title}</div>
              <div style={s.aiQCMeta}>{tip.desc}</div>
            </div>
            <div style={{ ...s.aiQCBadge, background: tip.levelBg, color: tip.levelColor }}>{tip.level}</div>
          </div>
        ))}
      </div>

      {/* 近期报告列表 */}
      <div style={s.reportCard}>
        <div style={{ ...s.cardTitle, marginBottom: 12 }}>
          <FileText size={15} color="#3b82f6" />
          <span>近期报告</span>
          <span style={{ marginLeft: 4, fontSize: 11, color: '#94a3b8' }}>最近 5 条</span>
          <div style={{ marginLeft: 'auto', fontSize: 11, color: '#3b82f6', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2 }}
            onClick={() => navigate('/report')}>
            查看全部 <ArrowRight size={12} />
          </div>
        </div>
        {RECENT_REPORTS.map((report) => (
          <div key={report.id} style={s.reportItem}>
            <div style={s.reportAvatar}>{report.name.slice(0, 1)}</div>
            <div style={s.reportText}>
              <div style={s.reportName}>{report.name}</div>
              <div style={s.reportDesc}>{report.exam} · {report.doctor}</div>
            </div>
            <div style={{ ...s.reportBadge, background: report.statusBg, color: report.statusColor }}>{report.status}</div>
            <div style={s.reportMeta}>{report.time}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
