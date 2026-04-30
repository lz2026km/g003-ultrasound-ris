// @ts-nocheck
// ============================================================
// G003 超声RIS系统 - AI质控中心 v0.2.0
// AI图像质量评估 / 报告完整性检查 / 异常检测 / 质控统计
// ============================================================
import { useState, useEffect } from 'react'
import {
  Search, Filter, Download, CheckCircle, AlertCircle,
  Brain, FileText, BarChart3, TrendingUp, Clock, Settings,
  User, Eye, MessageSquare, ThumbsUp, ThumbsDown, RefreshCw,
  ChevronRight, Sparkles, ShieldCheck, Activity, Image,
  Clipboard, Bell, X, Plus, ChevronDown, Save, RotateCcw,
  Warning, Info, Check, AlertTriangle, Layers
} from 'lucide-react'
import ReactECharts from 'echarts-for-react'

// ---------- 颜色常量 ----------
const C = {
  blue: '#3b82f6',
  green: '#22c55e',
  orange: '#f97316',
  red: '#ef4444',
  purple: '#8b5cf6',
  teal: '#14b8a6',
  yellow: '#eab308',
  bg: '#f8fafc',
  card: '#ffffff',
  border: '#e2e8f0',
  text: '#1a3a5c',
  textMuted: '#64748b',
  textLight: '#94a3b8',
}

// ---------- 样式 ----------
const s: Record<string, React.CSSProperties> = {
  root: { padding: 0, minHeight: '100vh', background: C.bg },
  header: { marginBottom: 24 },
  title: { fontSize: 20, fontWeight: 700, color: C.text, margin: 0 },
  subtitle: { fontSize: 13, color: C.textMuted, marginTop: 4 },
  headerRight: { display: 'flex', gap: 8 },
  // 主布局：左侧 + 右侧
  mainLayout: { display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20 },
  // 左侧面板
  leftPanel: { display: 'flex', flexDirection: 'column', gap: 16 },
  // 右侧面板
  rightPanel: { display: 'flex', flexDirection: 'column', gap: 16 },
  // 统计卡片行
  statRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 },
  statCard: { background: C.card, borderRadius: 12, padding: '16px 18px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 12 },
  statIconWrap: { width: 42, height: 42, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  statInfo: { flex: 1, minWidth: 0 },
  statValue: { fontSize: 22, fontWeight: 700, color: C.text, lineHeight: 1.2 },
  statLabel: { fontSize: 11, color: C.textMuted, marginTop: 2 },
  statTrend: { fontSize: 10, color: C.green, marginTop: 2, display: 'flex', alignItems: 'center', gap: 2 },
  // 搜索筛选
  searchBar: { display: 'flex', gap: 8, alignItems: 'center' },
  searchInput: { flex: 1, padding: '9px 14px', border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 13, outline: 'none', background: C.card },
  filterBtn: { padding: '9px 14px', border: `1px solid ${C.border}`, borderRadius: 10, background: C.card, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, color: C.textMuted },
  // 筛选面板
  filterPanel: { background: C.card, borderRadius: 12, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  filterTitle: { fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 },
  filterRow: { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 },
  filterLabel: { fontSize: 11, color: C.textMuted, fontWeight: 500 },
  filterSelect: { padding: '8px 12px', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12, outline: 'none', background: '#fff', width: '100%' },
  filterChips: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  filterChip: { padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 500, cursor: 'pointer', border: `1px solid ${C.border}` },
  filterChipActive: { padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 500, cursor: 'pointer', background: C.blue, color: '#fff', border: 'none' },
  // 图表卡片
  chartCard: { background: C.card, borderRadius: 12, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  chartTitle: { fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 },
  chartIcon: { color: C.textMuted },
  // 问题分类卡片
  categoryCard: { background: C.card, borderRadius: 12, padding: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', cursor: 'pointer', transition: 'all 0.2s', border: '2px solid transparent' },
  categoryCardActive: { background: C.card, borderRadius: 12, padding: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', cursor: 'pointer', transition: 'all 0.2s', border: `2px solid ${C.blue}` },
  categoryHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  categoryName: { fontSize: 12, fontWeight: 600, color: C.text, display: 'flex', alignItems: 'center', gap: 6 },
  categoryCount: { fontSize: 18, fontWeight: 700, color: C.text },
  categoryBar: { height: 4, borderRadius: 2, background: C.border, marginTop: 8, overflow: 'hidden' },
  categoryBarFill: { height: '100%', borderRadius: 2, transition: 'width 0.3s' },
  // 规则配置
  configCard: { background: C.card, borderRadius: 12, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  configTitle: { fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 },
  configRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  configLabel: { fontSize: 12, color: C.textMuted },
  configValue: { display: 'flex', alignItems: 'center', gap: 6 },
  configInput: { width: 60, padding: '4px 8px', border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 12, textAlign: 'center' },
  // 标签页
  tabs: { display: 'flex', gap: 4, borderBottom: `2px solid ${C.border}`, marginBottom: 16 },
  tab: { padding: '10px 18px', fontSize: 13, fontWeight: 600, color: C.textMuted, cursor: 'pointer', borderBottom: '2px solid transparent', marginBottom: -2 },
  tabActive: { padding: '10px 18px', fontSize: 13, fontWeight: 600, color: C.blue, cursor: 'pointer', borderBottom: `2px solid ${C.blue}`, marginBottom: -2 },
  // 问题列表
  issueList: { display: 'flex', flexDirection: 'column', gap: 10 },
  issueCard: { background: C.card, borderRadius: 12, padding: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderLeft: '4px solid' },
  issueHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  issueTitle: { fontSize: 13, fontWeight: 600, color: C.text },
  issueMeta: { fontSize: 11, color: C.textMuted, marginTop: 2 },
  issueTag: { fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 6 },
  issueContent: { fontSize: 12, color: C.textMuted, lineHeight: 1.5, marginBottom: 8 },
  issueActions: { display: 'flex', gap: 6 },
  // 详情面板
  detailPanel: { background: C.card, borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  detailHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottom: `1px solid ${C.border}` },
  detailTitle: { fontSize: 15, fontWeight: 600, color: C.text },
  detailSection: { marginBottom: 16 },
  detailLabel: { fontSize: 11, color: C.textMuted, marginBottom: 6, fontWeight: 500 },
  detailText: { fontSize: 13, color: C.text, lineHeight: 1.6 },
  // AI评分
  scoreCircle: { position: 'relative', width: 80, height: 80 },
  scoreValue: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: 22, fontWeight: 700 },
  // 复查申请弹窗
  modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalContent: { background: '#fff', borderRadius: 16, padding: 24, width: 480, maxHeight: '80vh', overflowY: 'auto' },
  modalTitle: { fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 16 },
  modalRow: { marginBottom: 14 },
  modalLabel: { fontSize: 12, color: C.textMuted, marginBottom: 4 },
  modalInput: { width: '100%', padding: '10px 12px', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' },
  modalTextarea: { width: '100%', padding: '10px 12px', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, outline: 'none', resize: 'vertical', minHeight: 80, boxSizing: 'border-box' },
  modalActions: { display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 },
  // 按钮
  btn: { padding: '8px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.2s' },
  btnPrimary: { background: C.blue, color: '#fff' },
  btnOutline: { padding: '8px 14px', borderRadius: 8, border: `1px solid ${C.border}`, cursor: 'pointer', fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5, background: '#fff', color: C.textMuted },
  btnSuccess: { background: C.green, color: '#fff' },
  btnDanger: { background: C.red, color: '#fff' },
  btnOrange: { background: C.orange, color: '#fff' },
  // 标签色
  blue: { backgroundColor: '#eff6ff', color: C.blue },
  green: { backgroundColor: '#f0fdf4', color: C.green },
  orange: { backgroundColor: '#fff7ed', color: C.orange },
  red: { backgroundColor: '#fef2f2', color: C.red },
  purple: { backgroundColor: '#f5f3ff', color: C.purple },
  teal: { backgroundColor: '#f0fdfa', color: C.teal },
  // 空状态
  emptyState: { textAlign: 'center', padding: '40px 20px', color: C.textMuted },
  emptyIcon: { marginBottom: 12 },
  // 趋势选择器
  trendTabs: { display: 'flex', gap: 4, marginBottom: 12 },
  trendTab: { padding: '4px 12px', fontSize: 11, fontWeight: 500, borderRadius: 6, cursor: 'pointer', color: C.textMuted, background: 'transparent' },
  trendTabActive: { padding: '4px 12px', fontSize: 11, fontWeight: 500, borderRadius: 6, cursor: 'pointer', color: '#fff', background: C.blue },
}

// ---------- Mock数据 ----------
const QC_RULES_DEFAULT = {
  passScore: 80,
  requiredFields: ['超声描述', '超声诊断', '检查医生', '检查日期'],
}

const generateTrendData = (days: number) => {
  const data = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = `${d.getMonth() + 1}-${d.getDate()}`
    const base = 85 + Math.random() * 10
    data.push({
      date: dateStr,
      qualified: Math.round(base),
      unqualified: Math.round(100 - base),
      rate: Math.round(base * 10) / 10,
    })
  }
  return data
}

const INITIAL_QC_LIST = [
  {
    id: 1, patient: '张三', exam: '腹部超声', doctor: '李明辉', date: '2024-12-15 10:30',
    aiScore: 95, pass: true, category: 'image',
    issues: [], imageQuality: { clarity: 95, artifact: 2, overall: 96 },
    reportComplete: true, reportIssues: [],
    alerts: []
  },
  {
    id: 2, patient: '李红', exam: '心脏超声', doctor: '王芳', date: '2024-12-15 10:15',
    aiScore: 72, pass: false, category: 'report',
    issues: ['描述不完整：左室壁运动描述缺失'],
    imageQuality: { clarity: 80, artifact: 5, overall: 78 },
    reportComplete: false, reportIssues: ['缺少左室壁运动描述'],
    alerts: [{ type: 'warning', text: '疑似漏诊：左室壁运动异常' }]
  },
  {
    id: 3, patient: '王五', exam: '甲状腺超声', doctor: '张伟', date: '2024-12-15 09:45',
    aiScore: 58, pass: false, category: 'alert',
    issues: ['诊断建议不明确', '测量数据缺失'],
    imageQuality: { clarity: 65, artifact: 12, overall: 62 },
    reportComplete: false, reportIssues: ['诊断结论模糊', '缺少结节大小测量'],
    alerts: [
      { type: 'error', text: '图像伪影：运动伪影明显' },
      { type: 'warning', text: '疑似漏诊：结节恶性特征未描述' }
    ]
  },
  {
    id: 4, patient: '赵丽', exam: '乳腺超声', doctor: '李明辉', date: '2024-12-15 09:20',
    aiScore: 88, pass: true, category: 'report',
    issues: [],
    imageQuality: { clarity: 88, artifact: 3, overall: 87 },
    reportComplete: true, reportIssues: [],
    alerts: []
  },
  {
    id: 5, patient: '孙磊', exam: '血管超声', doctor: '王芳', date: '2024-12-14 16:00',
    aiScore: 45, pass: false, category: 'image',
    issues: ['图像质量差：血管走形不清晰', '测量值异常'],
    imageQuality: { clarity: 48, artifact: 25, overall: 45 },
    reportComplete: true, reportIssues: ['流速测量值超出正常范围'],
    alerts: [{ type: 'error', text: '测量值异常：颈内动脉流速超标' }]
  },
  {
    id: 6, patient: '周婷', exam: '妇产科超声', doctor: '张伟', date: '2024-12-14 15:30',
    aiScore: 92, pass: true, category: 'image',
    issues: [],
    imageQuality: { clarity: 92, artifact: 1, overall: 93 },
    reportComplete: true, reportIssues: [],
    alerts: []
  },
  {
    id: 7, patient: '吴建国', exam: '浅表器官', doctor: '李明辉', date: '2024-12-14 14:00',
    aiScore: 78, pass: false, category: 'report',
    issues: ['描述规范性差：术语使用不规范'],
    imageQuality: { clarity: 82, artifact: 4, overall: 80 },
    reportComplete: true, reportIssues: ['术语使用不规范'],
    alerts: []
  },
  {
    id: 8, patient: '郑小红', exam: '腹部超声', doctor: '王芳', date: '2024-12-14 11:00',
    aiScore: 85, pass: true, category: 'alert',
    issues: [],
    imageQuality: { clarity: 85, artifact: 3, overall: 84 },
    reportComplete: true, reportIssues: [],
    alerts: [{ type: 'info', text: '建议补充：肝血管瘤可能，建议增强扫描' }]
  },
]

const getScoreColor = (score: number) => {
  if (score >= 85) return C.green
  if (score >= 70) return C.orange
  return C.red
}

const getCategoryIcon = (cat: string) => {
  switch (cat) {
    case 'image': return Image
    case 'report': return Clipboard
    case 'alert': return Bell
    default: return AlertCircle
  }
}

const getCategoryColor = (cat: string) => {
  switch (cat) {
    case 'image': return C.orange
    case 'report': return C.blue
    case 'alert': return C.red
    default: return C.textMuted
  }
}

const getCategoryLabel = (cat: string) => {
  switch (cat) {
    case 'image': return '图像质量'
    case 'report': return '报告规范'
    case 'alert': return '异常提醒'
    default: return '全部'
  }
}

export default function AIQCPage() {
  const [activeTab, setActiveTab] = useState('list')
  const [searchText, setSearchText] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showFilter, setShowFilter] = useState(false)
  const [qcList, setQcList] = useState(INITIAL_QC_LIST)
  const [selectedItem, setSelectedItem] = useState<typeof INITIAL_QC_LIST[0] | null>(null)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [reviewForm, setReviewForm] = useState({ reason: '', contact: '' })
  const [qcRules, setQcRules] = useState(QC_RULES_DEFAULT)
  const [trendDays, setTrendDays] = useState(7)
  const [trendData, setTrendData] = useState(generateTrendData(7))

  const todayStats = {
    total: qcList.length,
    passed: qcList.filter(q => q.pass).length,
    failed: qcList.filter(q => !q.pass).length,
    rate: Math.round((qcList.filter(q => q.pass).length / qcList.length) * 1000) / 10,
  }

  const categoryStats = [
    { name: '图像质量', count: qcList.filter(q => q.category === 'image' && !q.pass).length, total: qcList.filter(q => q.category === 'image').length, color: C.orange, icon: Image },
    { name: '报告规范', count: qcList.filter(q => q.category === 'report' && !q.pass).length, total: qcList.filter(q => q.category === 'report').length, color: C.blue, icon: Clipboard },
    { name: '异常提醒', count: qcList.filter(q => q.category === 'alert').length, total: qcList.length, color: C.red, icon: Bell },
  ]

  const filteredList = qcList.filter(item => {
    if (filterCategory !== 'all' && item.category !== filterCategory) return false
    if (filterStatus === 'pass' && !item.pass) return false
    if (filterStatus === 'fail' && item.pass) return false
    if (searchText && !item.patient.includes(searchText) && !item.exam.includes(searchText) && !item.doctor.includes(searchText)) return false
    return true
  })

  const handleApplyRules = () => {
    const updated = qcList.map(item => ({
      ...item,
      pass: item.aiScore >= qcRules.passScore,
    }))
    setQcList(updated)
    setShowConfigModal(false)
  }

  const handleResetRules = () => {
    setQcRules(QC_RULES_DEFAULT)
    setQcList(INITIAL_QC_LIST)
  }

  const getPieOption = () => ({
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { show: false },
    series: [{
      type: 'pie',
      radius: ['50%', '75%'],
      center: ['50%', '50%'],
      avoidLabelOverlap: false,
      label: { show: true, position: 'outside', formatter: '{b}\n{d}%', fontSize: 10, color: C.textMuted },
      labelLine: { show: true },
      data: [
        { value: todayStats.passed, name: '合格', itemStyle: { color: C.green } },
        { value: todayStats.failed, name: '不合格', itemStyle: { color: C.red } },
      ],
    }],
  })

  const getLineOption = (data: typeof trendData) => ({
    tooltip: { trigger: 'axis', axisPointer: { type: 'line' }, formatter: (params: any) => {
      const d = params[0]
      return `${d.name}<br/><span style="color:${C.green}">● 合格率: ${d.data.rate}%</span><br/><span style="color:${C.blue}">● 合格: ${d.data.qualified}</span><br/><span style="color:${C.red}">● 不合格: ${d.data.unqualified}</span>`
    }},
    grid: { left: 40, right: 16, top: 10, bottom: 24 },
    xAxis: { type: 'category', data: data.map(d => d.date), axisLine: { lineStyle: { color: C.border } }, axisLabel: { fontSize: 10, color: C.textMuted } },
    yAxis: { type: 'value', min: 0, max: 100, splitLine: { lineStyle: { color: C.border, type: 'dashed' } }, axisLabel: { fontSize: 10, color: C.textMuted } },
    series: [{
      type: 'line',
      data: data.map(d => d.rate),
      smooth: true,
      lineStyle: { color: C.blue, width: 2 },
      areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(59,130,246,0.3)' }, { offset: 1, color: 'rgba(59,130,246,0)' }] } },
      symbol: 'circle',
      symbolSize: 6,
    }],
  })

  const getGaugeOption = (score: number) => {
    const color = getScoreColor(score)
    return {
      series: [{
        type: 'gauge',
        startAngle: 200,
        endAngle: -20,
        min: 0,
        max: 100,
        splitNumber: 5,
        radius: '90%',
        center: ['50%', '55%'],
        pointer: { show: false },
        progress: { show: true, overlap: false, roundCap: true, clip: false, itemStyle: { color } },
        axisLine: { lineStyle: { width: 8, color: [[1, C.border]] } },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        anchor: { show: false },
        title: { show: false },
        detail: {
          valueAnimation: true, offsetCenter: [0, '10%'],
          fontSize: 22, fontWeight: 700, color,
          formatter: '{value}',
        },
        data: [{ value: score }],
      }],
    }
  }

  return (
    <div style={s.root}>
      {/* 标题 */}
      <div style={s.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={s.title}>AI质控中心</h1>
            <p style={s.subtitle}>AI图像质量评估 · 报告完整性检查 · 异常检测提醒 · 质控统计</p>
          </div>
          <div style={s.headerRight}>
            <button style={s.btnOutline} onClick={() => { setTrendData(generateTrendData(trendDays)) }}><RefreshCw size={13} /> 刷新数据</button>
            <button style={s.btnOutline}><Download size={13} /> 导出报告</button>
            <button style={{ ...s.btn, ...s.btnPrimary }} onClick={() => setShowConfigModal(true)}><Settings size={13} /> 质控规则</button>
          </div>
        </div>
      </div>

      <div style={s.mainLayout}>
        {/* ========== 左侧面板 ========== */}
        <div style={s.leftPanel}>
          {/* 今日统计 */}
          <div style={s.chartCard}>
            <div style={s.chartTitle}><Activity size={15} style={s.chartIcon} /> 今日AI质控统计</div>
            <div style={s.statRow}>
              <div style={s.statCard}>
                <div style={{ ...s.statIconWrap, background: '#f0fdf4' }}><CheckCircle size={18} color={C.green} /></div>
                <div style={s.statInfo}>
                  <div style={s.statValue}>{todayStats.total}</div>
                  <div style={s.statLabel}>AI质检数</div>
                </div>
              </div>
              <div style={s.statCard}>
                <div style={{ ...s.statIconWrap, background: '#eff6ff' }}><Sparkles size={18} color={C.blue} /></div>
                <div style={s.statInfo}>
                  <div style={{ ...s.statValue, color: C.green }}>{todayStats.rate}%</div>
                  <div style={s.statLabel}>合格率</div>
                  <div style={s.statTrend}><TrendingUp size={10} /> +2.3%</div>
                </div>
              </div>
              <div style={s.statCard}>
                <div style={{ ...s.statIconWrap, background: '#fff7ed' }}><AlertCircle size={18} color={C.orange} /></div>
                <div style={s.statInfo}>
                  <div style={{ ...s.statValue, color: C.orange }}>{todayStats.failed}</div>
                  <div style={s.statLabel}>问题数</div>
                </div>
              </div>
            </div>
            {/* 饼图 */}
            <div style={{ height: 160 }}>
              <ReactECharts option={getPieOption()} style={{ height: '100%', width: '100%' }} />
            </div>
          </div>

          {/* 历史趋势 */}
          <div style={s.chartCard}>
            <div style={s.chartTitle}><TrendingUp size={15} style={s.chartIcon} /> 历史质控趋势</div>
            <div style={s.trendTabs}>
              <div style={trendDays === 7 ? s.trendTabActive : s.trendTab} onClick={() => { setTrendDays(7); setTrendData(generateTrendData(7)) }}>7天</div>
              <div style={trendDays === 30 ? s.trendTabActive : s.trendTab} onClick={() => { setTrendDays(30); setTrendData(generateTrendData(30)) }}>30天</div>
            </div>
            <div style={{ height: 160 }}>
              <ReactECharts option={getLineOption(trendData)} style={{ height: '100%', width: '100%' }} />
            </div>
          </div>

          {/* 问题分类 */}
          <div style={s.chartCard}>
            <div style={s.chartTitle}><Layers size={15} style={s.chartIcon} /> 问题分类</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {categoryStats.map(cat => {
                const Icon = cat.icon
                const pct = cat.total > 0 ? Math.round((cat.count / cat.total) * 100) : 0
                return (
                  <div
                    key={cat.name}
                    style={filterCategory === cat.name.toLowerCase().includes('图像') ? s.categoryCardActive : s.categoryCard}
                    onClick={() => setFilterCategory(filterCategory === cat.name.toLowerCase().includes('图像') ? 'all' : cat.name.toLowerCase().includes('图像') ? 'image' : cat.name.toLowerCase().includes('报告') ? 'report' : 'alert')}
                  >
                    <div style={s.categoryHeader}>
                      <div style={s.categoryName}>
                        <Icon size={14} color={cat.color} />
                        {cat.name}
                      </div>
                      <div style={{ ...s.categoryCount, color: cat.color }}>{cat.count}</div>
                    </div>
                    <div style={s.categoryBar}>
                      <div style={{ ...s.categoryBarFill, width: `${pct}%`, background: cat.color }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 质控规则配置快捷入口 */}
          <div style={s.configCard}>
            <div style={s.configTitle}><Settings size={14} style={{ color: C.textMuted }} /> 质控规则配置</div>
            <div style={s.configRow}>
              <span style={s.configLabel}>合格分数阈值</span>
              <span style={{ fontWeight: 700, color: C.text, fontSize: 14 }}>{qcRules.passScore}分</span>
            </div>
            <div style={s.configRow}>
              <span style={s.configLabel}>必填报告项</span>
              <span style={{ fontWeight: 700, color: C.text, fontSize: 14 }}>{qcRules.requiredFields.length}项</span>
            </div>
            <button style={{ ...s.btn, ...s.btnOutline, width: '100%', justifyContent: 'center', marginTop: 4 }} onClick={() => setShowConfigModal(true)}>
              <Settings size={12} /> 配置规则
            </button>
          </div>
        </div>

        {/* ========== 右侧面板 ========== */}
        <div style={s.rightPanel}>
          {/* 搜索栏 */}
          <div style={s.searchBar}>
            <input style={s.searchInput} placeholder="搜索患者、检查项目、检查医生..." value={searchText} onChange={(e) => setSearchText(e.target.value)} />
            <button style={s.filterBtn} onClick={() => setShowFilter(!showFilter)}>
              <Filter size={13} /> 筛选 {showFilter ? <ChevronDown size={12} /> : null}
            </button>
          </div>

          {/* 筛选面板 */}
          {showFilter && (
            <div style={s.filterPanel}>
              <div style={s.filterRow}>
                <div style={s.filterLabel}>问题类型</div>
                <div style={s.filterChips}>
                  {['all', 'image', 'report', 'alert'].map(cat => (
                    <span key={cat} style={filterCategory === cat ? s.filterChipActive : s.filterChip} onClick={() => setFilterCategory(cat)}>
                      {cat === 'all' ? '全部' : getCategoryLabel(cat)}
                    </span>
                  ))}
                </div>
              </div>
              <div style={s.filterRow}>
                <div style={s.filterLabel}>审核状态</div>
                <div style={s.filterChips}>
                  {[['all', '全部'], ['pass', '合格'], ['fail', '不合格']].map(([val, label]) => (
                    <span key={val} style={filterStatus === val ? s.filterChipActive : s.filterChip} onClick={() => setFilterStatus(val)}>{label}</span>
                  ))}
                </div>
              </div>
              <button style={{ ...s.btn, ...s.btnOutline, marginTop: 4 }} onClick={() => { setFilterCategory('all'); setFilterStatus('all'); setSearchText(''); }}>
                <RotateCcw size={11} /> 重置筛选
              </button>
            </div>
          )}

          {/* 标签页 */}
          <div style={s.tabs}>
            {[
              ['list', '质控问题列表'],
              ['detail', '详情面板'],
            ].map(([tab, label]) => (
              <div key={tab} style={activeTab === tab ? s.tabActive : s.tab} onClick={() => setActiveTab(tab)}>
                {label}
                {tab === 'list' && <span style={{ marginLeft: 6, background: C.orange, color: '#fff', borderRadius: 10, padding: '1px 7px', fontSize: 10 }}>{filteredList.length}</span>}
              </div>
            ))}
          </div>

          {/* 质控问题列表 */}
          {activeTab === 'list' && (
            <div style={s.issueList}>
              {filteredList.length === 0 ? (
                <div style={s.emptyState}>
                  <CheckCircle size={40} style={{ color: C.green, marginBottom: 12 }} />
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 4 }}>暂无问题</div>
                  <div style={{ fontSize: 12 }}>当前筛选条件下没有需要处理的问题</div>
                </div>
              ) : (
                filteredList.map(item => {
                  const CatIcon = getCategoryIcon(item.category)
                  return (
                    <div key={item.id} style={{ ...s.issueCard, borderLeftColor: getCategoryColor(item.category) }}>
                      <div style={s.issueHeader}>
                        <div>
                          <div style={s.issueTitle}>{item.patient} - {item.exam}</div>
                          <div style={s.issueMeta}>检查医生：{item.doctor} | {item.date}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <span style={{ ...s.issueTag, background: item.pass ? '#f0fdf4' : '#fef2f2', color: item.pass ? C.green : C.red }}>
                            {item.pass ? '合格' : '不合格'}
                          </span>
                          <span style={{ ...s.issueTag, background: `${getCategoryColor(item.category)}15`, color: getCategoryColor(item.category), display: 'flex', alignItems: 'center', gap: 3 }}>
                            <CatIcon size={10} /> {getCategoryLabel(item.category)}
                          </span>
                        </div>
                      </div>
                      {/* AI评分 */}
                      <div style={{ display: 'flex', gap: 16, marginBottom: 10 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 4 }}>AI质控评分</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 22, fontWeight: 700, color: getScoreColor(item.aiScore) }}>{item.aiScore}</span>
                            <span style={{ fontSize: 11, color: C.textMuted }}>/ 100</span>
                          </div>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 4 }}>图像质量</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 22, fontWeight: 700, color: getScoreColor(item.imageQuality.overall) }}>{item.imageQuality.overall}</span>
                            <span style={{ fontSize: 11, color: C.textMuted }}>/ 100</span>
                          </div>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 4 }}>发现问题</div>
                          <div style={{ fontSize: 22, fontWeight: 700, color: item.issues.length > 0 ? C.orange : C.green }}>
                            {item.issues.length}
                          </div>
                        </div>
                      </div>
                      {/* 问题描述 */}
                      {item.issues.length > 0 && (
                        <div style={{ background: '#fef2f2', borderRadius: 8, padding: '8px 12px', marginBottom: 8 }}>
                          <div style={{ fontSize: 11, color: C.red, fontWeight: 600, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <AlertTriangle size={11} /> 存在问题
                          </div>
                          <div style={{ fontSize: 12, color: C.textMuted }}>{item.issues.join('；')}</div>
                        </div>
                      )}
                      {/* 异常提醒 */}
                      {item.alerts.length > 0 && (
                        <div style={{ background: '#fff7ed', borderRadius: 8, padding: '8px 12px', marginBottom: 8 }}>
                          <div style={{ fontSize: 11, color: C.orange, fontWeight: 600, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Bell size={11} /> 异常提醒
                          </div>
                          {item.alerts.map((alert, idx) => (
                            <div key={idx} style={{ fontSize: 12, color: C.textMuted, display: 'flex', alignItems: 'center', gap: 4 }}>
                              <span style={{ width: 6, height: 6, borderRadius: '50%', background: alert.type === 'error' ? C.red : alert.type === 'warning' ? C.orange : C.blue, flexShrink: 0 }} />
                              {alert.text}
                            </div>
                          ))}
                        </div>
                      )}
                      <div style={s.issueActions}>
                        <button style={{ ...s.btn, ...s.btnSuccess }} onClick={() => { const u = qcList.map(q => q.id === item.id ? { ...q, pass: true } : q); setQcList(u); }}><ThumbsUp size={12} /> 审核通过</button>
                        <button style={{ ...s.btn, ...s.btnDanger }} onClick={() => { const u = qcList.map(q => q.id === item.id ? { ...q, pass: false } : q); setQcList(u); }}><ThumbsDown size={12} /> 退回修改</button>
                        <button style={s.btnOutline} onClick={() => { setSelectedItem(item); setActiveTab('detail'); }}><Eye size={12} /> 查看详情</button>
                        <button style={{ ...s.btn, ...s.btnOrange }} onClick={() => { setSelectedItem(item); setShowReviewModal(true); }}><MessageSquare size={12} /> 申请复查</button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}

          {/* 详情面板 */}
          {activeTab === 'detail' && selectedItem && (
            <div style={s.detailPanel}>
              <div style={s.detailHeader}>
                <div style={s.detailTitle}>报告详情 - {selectedItem.patient}</div>
                <button style={s.btnOutline} onClick={() => setActiveTab('list')}><X size={14} /></button>
              </div>
              {/* 患者信息 */}
              <div style={s.detailSection}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 10 }}>基本信息</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                  {[
                    ['患者姓名', selectedItem.patient],
                    ['检查项目', selectedItem.exam],
                    ['检查医生', selectedItem.doctor],
                    ['检查日期', selectedItem.date],
                  ].map(([label, val]) => (
                    <div key={label} style={{ background: '#f8fafc', borderRadius: 8, padding: '8px 12px' }}>
                      <div style={{ fontSize: 10, color: C.textMuted }}>{label}</div>
                      <div style={{ fontSize: 13, color: C.text, fontWeight: 500, marginTop: 2 }}>{val}</div>
                    </div>
                  ))}
                </div>
              </div>
              {/* AI评分 */}
              <div style={s.detailSection}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 10 }}>AI质量评估</div>
                <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                  <div style={{ width: 100, height: 100 }}>
                    <ReactECharts option={getGaugeOption(selectedItem.aiScore)} style={{ width: '100%', height: '100%' }} />
                    <div style={{ textAlign: 'center', fontSize: 10, color: C.textMuted, marginTop: -8 }}>AI评分</div>
                  </div>
                  <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                    {[
                      ['图像清晰度', selectedItem.imageQuality.clarity, C.blue],
                      ['伪影评分', selectedItem.imageQuality.artifact, C.orange],
                      ['图像总分', selectedItem.imageQuality.overall, getScoreColor(selectedItem.imageQuality.overall)],
                      ['报告完整', selectedItem.reportComplete ? '完整' : '缺失', selectedItem.reportComplete ? C.green : C.red],
                    ].map(([label, val, color]) => (
                      <div key={label} style={{ background: '#f8fafc', borderRadius: 8, padding: '8px 12px' }}>
                        <div style={{ fontSize: 10, color: C.textMuted }}>{label}</div>
                        <div style={{ fontSize: 16, fontWeight: 700, color, marginTop: 2 }}>{val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* 报告完整性 */}
              <div style={s.detailSection}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 10 }}>报告完整性检查</div>
                {selectedItem.reportIssues.length === 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.green, fontSize: 12, background: '#f0fdf4', padding: '8px 12px', borderRadius: 8 }}>
                    <Check size={13} /> 报告完整，所有必填项均已填写
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {selectedItem.reportIssues.map((issue, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.red, fontSize: 12, background: '#fef2f2', padding: '8px 12px', borderRadius: 8 }}>
                        <AlertTriangle size={12} /> {issue}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* 问题列表 */}
              {(selectedItem.issues.length > 0 || selectedItem.alerts.length > 0) && (
                <div style={s.detailSection}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 10 }}>AI检测问题</div>
                  {selectedItem.issues.map((issue, idx) => (
                    <div key={`issue-${idx}`} style={{ marginBottom: 6, padding: '8px 12px', background: '#fef2f2', borderRadius: 8 }}>
                      <div style={{ fontSize: 12, color: C.red, fontWeight: 600, marginBottom: 2 }}><AlertCircle size={11} /> {issue}</div>
                    </div>
                  ))}
                  {selectedItem.alerts.map((alert, idx) => (
                    <div key={`alert-${idx}`} style={{ marginBottom: 6, padding: '8px 12px', background: '#fff7ed', borderRadius: 8 }}>
                      <div style={{ fontSize: 12, color: C.orange, fontWeight: 600, marginBottom: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Bell size={11} />
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: alert.type === 'error' ? C.red : C.orange }} />
                        {alert.text}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button style={{ ...s.btn, ...s.btnSuccess }}><ThumbsUp size={12} /> 审核通过</button>
                <button style={{ ...s.btn, ...s.btnDanger }}><ThumbsDown size={12} /> 退回修改</button>
                <button style={{ ...s.btn, ...s.btnOrange }} onClick={() => setShowReviewModal(true)}><MessageSquare size={12} /> 申请复查</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========== 复查申请弹窗 ========== */}
      {showReviewModal && selectedItem && (
        <div style={s.modal} onClick={(e) => { if (e.target === e.currentTarget) setShowReviewModal(false); }}>
          <div style={s.modalContent}>
            <div style={s.modalTitle}>申请复查 - {selectedItem.patient}</div>
            <div style={s.modalRow}>
              <div style={s.modalLabel}>报告信息</div>
              <div style={{ fontSize: 13, color: C.text, padding: '8px 12px', background: '#f8fafc', borderRadius: 8 }}>
                {selectedItem.exam} | {selectedItem.doctor} | {selectedItem.date}
              </div>
            </div>
            <div style={s.modalRow}>
              <div style={s.modalLabel}>复查原因 *</div>
              <select style={s.modalInput} value={reviewForm.reason} onChange={(e) => setReviewForm({ ...reviewForm, reason: e.target.value })}>
                <option value="">请选择复查原因</option>
                <option value="图像质量存疑">图像质量存疑</option>
                <option value="诊断结论有争议">诊断结论有争议</option>
                <option value="报告描述不准确">报告描述不准确</option>
                <option value="疑似漏诊">疑似漏诊</option>
                <option value="其他">其他</option>
              </select>
            </div>
            <div style={s.modalRow}>
              <div style={s.modalLabel}>详细说明 *</div>
              <textarea style={s.modalTextarea} placeholder="请详细描述复查原因和具体疑问..." value={reviewForm.reason === '其他' ? reviewForm.reason : ''} />
            </div>
            <div style={s.modalRow}>
              <div style={s.modalLabel}>联系邮箱/电话</div>
              <input style={s.modalInput} placeholder="选填，方便质控人员联系您" value={reviewForm.contact} onChange={(e) => setReviewForm({ ...reviewForm, contact: e.target.value })} />
            </div>
            <div style={s.modalActions}>
              <button style={s.btnOutline} onClick={() => setShowReviewModal(false)}>取消</button>
              <button style={{ ...s.btn, ...s.btnPrimary }} onClick={() => { setShowReviewModal(false); alert('复查申请已提交！'); }}><Check size={13} /> 提交复查申请</button>
            </div>
          </div>
        </div>
      )}

      {/* ========== 质控规则配置弹窗 ========== */}
      {showConfigModal && (
        <div style={s.modal} onClick={(e) => { if (e.target === e.currentTarget) setShowConfigModal(false); }}>
          <div style={s.modalContent}>
            <div style={s.modalTitle}>质控规则配置</div>
            <div style={s.modalRow}>
              <div style={s.modalLabel}>合格分数阈值（0-100）</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="range" min="50" max="100" value={qcRules.passScore}
                  style={{ flex: 1 }}
                  onChange={(e) => setQcRules({ ...qcRules, passScore: parseInt(e.target.value) })}
                />
                <span style={{ fontWeight: 700, color: C.blue, fontSize: 16, width: 36, textAlign: 'center' }}>{qcRules.passScore}</span>
              </div>
              <div style={{ fontSize: 10, color: C.textMuted, marginTop: 4 }}>AI评分低于此分数的报告将被标记为不合格</div>
            </div>
            <div style={s.modalRow}>
              <div style={s.modalLabel}>必填报告项</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {['超声描述', '超声诊断', '检查医生', '检查日期', '检查设备', '测量数据'].map(field => (
                  <label key={field} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={qcRules.requiredFields.includes(field)}
                      onChange={(e) => {
                        if (e.target.checked) setQcRules({ ...qcRules, requiredFields: [...qcRules.requiredFields, field] })
                        else setQcRules({ ...qcRules, requiredFields: qcRules.requiredFields.filter(f => f !== field) })
                      }}
                    />
                    {field}
                  </label>
                ))}
              </div>
            </div>
            <div style={s.modalActions}>
              <button style={s.btnOutline} onClick={() => setShowConfigModal(false)}>取消</button>
              <button style={s.btnOutline} onClick={handleResetRules}><RotateCcw size={12} /> 重置</button>
              <button style={{ ...s.btn, ...s.btnPrimary }} onClick={handleApplyRules}><Save size={13} /> 保存并应用</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
