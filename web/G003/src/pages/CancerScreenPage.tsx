// @ts-nocheck
// ============================================================
// G003 超声RIS系统 - 肿瘤筛查页面 v0.2.0
// 癌症早筛 / 风险评估 / 随访管理 / 筛查统计
// ============================================================
import { useState } from 'react'
import {
  Search, Filter, Download, Plus, AlertTriangle,
  Activity, TrendingUp, Users, Calendar, Clock,
  CheckCircle, XCircle, ChevronRight, Heart,
  ShieldAlert, FileText, BarChart3, PieChart as PieChartIcon,
  Bell, Edit2, Trash2, Eye, RefreshCw, Zap, AlertOctagon
} from 'lucide-react'
import ReactECharts from 'echarts-for-react'

// ---------- 样式 ----------
const s: Record<string, React.CSSProperties> = {
  root: { padding: 0 },
  header: { marginBottom: 24 },
  title: { fontSize: 20, fontWeight: 700, color: '#1a3a5c', margin: 0 },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 4 },
  headerRight: { display: 'flex', gap: 8 },
  statRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 },
  statCard: { background: '#fff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 16 },
  statIconWrap: { width: 48, height: 48, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  statInfo: { flex: 1, minWidth: 0 },
  statValue: { fontSize: 26, fontWeight: 700, color: '#1a3a5c', lineHeight: 1.2 },
  statLabel: { fontSize: 12, color: '#64748b', marginTop: 2 },
  statTrend: { fontSize: 11, color: '#22c55e', marginTop: 4, display: 'flex', alignItems: 'center', gap: 2 },
  searchBar: { display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' },
  searchInput: { flex: 1, padding: '10px 16px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 13, outline: 'none', background: '#fff' },
  tabs: { display: 'flex', gap: 4, marginBottom: 20, borderBottom: '2px solid #f1f5f9' },
  tab: { padding: '10px 20px', fontSize: 13, fontWeight: 600, color: '#64748b', cursor: 'pointer', borderBottom: '2px solid transparent', marginBottom: -2 },
  tabActive: { padding: '10px 20px', fontSize: 13, fontWeight: 600, color: '#3b82f6', cursor: 'pointer', borderBottom: '2px solid #3b82f6', marginBottom: -2 },
  // 表格
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: { padding: '12px 16px', textAlign: 'left', color: '#64748b', fontWeight: 600, borderBottom: '2px solid #f1f5f9', fontSize: 12, whiteSpace: 'nowrap' },
  td: { padding: '14px 16px', color: '#475569', borderBottom: '1px solid #f1f5f9' },
  // 按钮
  btn: { padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'all 0.2s' },
  btnPrimary: { background: '#3b82f6', color: '#fff' },
  btnOutline: { padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: 13, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff', color: '#475569' },
  btnSuccess: { background: '#22c55e', color: '#fff' },
  btnWarning: { background: '#f97316', color: '#fff' },
  btnDanger: { background: '#ef4444', color: '#fff' },
  btnSmall: { padding: '5px 10px', fontSize: 12 },
  // 标签
  tag: { fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20, display: 'inline-flex', alignItems: 'center', gap: 4 },
  // 卡片
  card: { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 16 },
  cardTitle: { fontSize: 15, fontWeight: 600, color: '#1a3a5c', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 },
  // 图表
  chartRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 },
  chartCard: { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  // 配置项
  configGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 },
  configItem: { border: '1px solid #e2e8f0', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', gap: 12 },
  configIcon: { width: 44, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  configInfo: { flex: 1 },
  configName: { fontSize: 14, fontWeight: 600, color: '#1a3a5c' },
  configDesc: { fontSize: 12, color: '#64748b', marginTop: 2 },
  // 问卷
  formGroup: { marginBottom: 16 },
  formLabel: { fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6, display: 'block' },
  formInput: { width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' },
  formSelect: { width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, outline: 'none', background: '#fff' },
  formRow: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 },
  radioGroup: { display: 'flex', gap: 20, flexWrap: 'wrap' },
  radioItem: { display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' },
  // 高危标记
  highRiskTag: { background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca' },
  warningIcon: { color: '#ef4444' },
}

// 颜色常量
const COLORS = {
  primary: '#1a3a5c',
  blue: '#3b82f6',
  green: '#22c55e',
  orange: '#f97316',
  red: '#ef4444',
  gray: '#94a3b8',
}

// 筛查类型配置
const SCREENING_TYPES = [
  { id: 'liver', name: '肝癌筛查', icon: '🦠', color: '#fef3c7', textColor: '#d97706', desc: '肝功能/超声 AFP联合筛查' },
  { id: 'breast', name: '乳腺癌筛查', icon: '🎀', color: '#fce7f3', textColor: '#db2777', desc: '乳腺超声+钼靶检查' },
  { id: 'thyroid', name: '甲状腺癌筛查', icon: '🦋', color: '#e0f2fe', textColor: '#0284c7', desc: '甲状腺超声+甲功检测' },
  { id: 'prostate', name: '前列腺癌筛查', icon: '♂️', color: '#ede9fe', textColor: '#7c3aed', desc: 'PSA+前列腺超声' },
  { id: 'ovarian', name: '卵巢癌筛查', icon: '🌸', color: '#fce7f3', textColor: '#ec4899', desc: 'CA125+妇科超声' },
]

// 筛查任务数据
const SCREENING_TASKS = [
  { id: 1, name: '张三', age: 52, gender: '男', type: '肝癌筛查', date: '2024-12-15', result: '阳性', status: '待确认', doctor: '王主任' },
  { id: 2, name: '李红', age: 45, gender: '女', type: '乳腺癌筛查', date: '2024-12-14', result: '阴性', status: '已完成', doctor: '李医生' },
  { id: 3, name: '王五', age: 38, gender: '女', type: '甲状腺癌筛查', date: '2024-12-14', result: '可疑', status: '复查中', doctor: '张医生' },
  { id: 4, name: '赵丽', age: 55, gender: '女', type: '乳腺癌筛查', date: '2024-12-13', result: '阴性', status: '已完成', doctor: '李医生' },
  { id: 5, name: '钱伟', age: 62, gender: '男', type: '前列腺癌筛查', date: '2024-12-12', result: '阳性', status: '随访中', doctor: '王主任' },
  { id: 6, name: '孙芳', age: 35, gender: '女', type: '卵巢癌筛查', date: '2024-12-11', result: '阴性', status: '已完成', doctor: '刘医生' },
  { id: 7, name: '周涛', age: 48, gender: '男', type: '肝癌筛查', date: '2024-12-10', result: '可疑', status: '复查中', doctor: '张医生' },
]

// 高危患者数据
const HIGH_RISK_PATIENTS = [
  { id: 1, name: '张三', age: 52, gender: '男', type: '肝癌筛查', riskScore: 92, result: '阳性', status: '高危', alertLevel: 'urgent' },
  { id: 2, name: '钱伟', age: 62, gender: '男', type: '前列腺癌筛查', riskScore: 88, result: '阳性', status: '高危', alertLevel: 'urgent' },
  { id: 3, name: '李红', age: 45, gender: '女', type: '乳腺癌筛查', riskScore: 75, result: '可疑', status: '高危', alertLevel: 'warning' },
]

// 随访计划数据
const FOLLOWUP_PLANS = [
  { id: 1, patient: '张三', cancer: '肝癌', nextDate: '2025-01-15', interval: '3个月', purpose: '复查AFP+超声', status: '待执行' },
  { id: 2, patient: '钱伟', cancer: '前列腺癌', nextDate: '2025-01-10', interval: '1个月', purpose: 'PSA复查', status: '待执行' },
  { id: 3, patient: '李红', cancer: '乳腺癌', nextDate: '2024-12-28', interval: '2周', purpose: '乳腺钼靶复查', status: '即将到期' },
]

// 统计数据
const STATS_DATA = {
  monthlyScreening: [
    { month: '7月', count: 120, positive: 5, negative: 115 },
    { month: '8月', count: 145, positive: 7, negative: 138 },
    { month: '9月', count: 138, positive: 4, negative: 134 },
    { month: '10月', count: 156, positive: 9, negative: 147 },
    { month: '11月', count: 168, positive: 6, negative: 162 },
    { month: '12月', count: 180, positive: 8, negative: 172 },
  ],
  positiveRate: 4.2,
  followupCompletion: 87.5,
  monthlyGrowth: 12,
}

// 问卷问题
const QUESTIONNAIRE_QUESTIONS = [
  { id: 'age', question: '年龄', type: 'input', placeholder: '请输入年龄' },
  { id: 'family_history', question: '家族肿瘤史', type: 'radio', options: ['无', '父亲/母亲', '兄弟姐妹', '多个亲属'] },
  { id: 'smoking', question: '吸烟习惯', type: 'radio', options: ['从不', '偶尔', '经常', '已戒烟'] },
  { id: 'drinking', question: '饮酒习惯', type: 'radio', options: ['从不', '偶尔', '经常', '已戒酒'] },
  { id: 'diet', question: '饮食习惯', type: 'radio', options: ['规律健康', '偶尔油腻', '经常油腻', '不规律'] },
  { id: 'exercise', question: '运动习惯', type: 'radio', options: ['每周3次以上', '每周1-2次', '偶尔', '几乎不'] },
  { id: 'weight', question: '体重变化', type: 'radio', options: ['稳定', '近期减轻', '近期增加', '明显减轻'] },
]

export default function CancerScreenPage() {
  const [activeTab, setActiveTab] = useState('list')
  const [searchText, setSearchText] = useState('')
  const [selectedTask, setSelectedTask] = useState<number | null>(null)
  const [showResultModal, setShowResultModal] = useState(false)
  const [resultForm, setResultForm] = useState({ result: '阴性', notes: '' })
  const [showQuestionnaire, setShowQuestionnaire] = useState(false)
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState<Record<string, string>>({})

  // 工具函数
  const getResultColor = (result: string) => {
    switch (result) {
      case '阳性': return '#ef4444'
      case '阴性': return '#22c55e'
      case '可疑': return '#f97316'
      case '待确认': return '#94a3b8'
      default: return '#64748b'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case '已完成': return '#22c55e'
      case '复查中': return '#f97316'
      case '待确认': return '#94a3b8'
      case '高危': return '#ef4444'
      case '待执行': return '#3b82f6'
      case '即将到期': return '#f97316'
      default: return '#64748b'
    }
  }

  // 导出报表
  const handleExport = () => {
    const headers = ['姓名', '年龄', '性别', '筛查类型', '日期', '结果', '状态', '医生']
    const rows = SCREENING_TASKS.map(t => [t.name, t.age, t.gender, t.type, t.date, t.result, t.status, t.doctor])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `肿瘤筛查报表_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // 生成随访计划
  const generateFollowup = (patient: typeof HIGH_RISK_PATIENTS[0]) => {
    alert(`为 ${patient.name} 生成随访计划：\n- 筛查类型：${patient.type}\n- 风险评分：${patient.riskScore}\n- 建议随访间隔：1-3个月\n- 下次复查：${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}`)
  }

  // ECharts 配置
  const getScreeningTrendOption = () => ({
    tooltip: { trigger: 'axis', backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: 8, textStyle: { color: '#1a3a5c' } },
    legend: { data: ['筛查人数', '阳性', '阴性'], bottom: 0, textStyle: { fontSize: 12 } },
    grid: { left: 50, right: 20, top: 20, bottom: 50 },
    xAxis: { type: 'category', data: STATS_DATA.monthlyScreening.map(d => d.month), axisLine: { lineStyle: { color: '#e2e8f0' } }, axisLabel: { color: '#94a3b8', fontSize: 11 } },
    yAxis: { type: 'value', axisLine: { show: false }, splitLine: { lineStyle: { color: '#f1f5f9' } }, axisLabel: { color: '#94a3b8', fontSize: 11 } },
    series: [
      { name: '筛查人数', type: 'bar', data: STATS_DATA.monthlyScreening.map(d => d.count), itemStyle: { color: '#3b82f6', borderRadius: [4, 4, 0, 0] }, barWidth: '40%' },
      { name: '阳性', type: 'line', data: STATS_DATA.monthlyScreening.map(d => d.positive), itemStyle: { color: '#ef4444' }, lineStyle: { width: 2 }, symbol: 'circle', symbolSize: 6 },
      { name: '阴性', type: 'line', data: STATS_DATA.monthlyScreening.map(d => d.negative), itemStyle: { color: '#22c55e' }, lineStyle: { width: 2 }, symbol: 'circle', symbolSize: 6 },
    ],
  })

  const getPositiveRateOption = () => ({
    tooltip: { trigger: 'item', backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: 8, textStyle: { color: '#1a3a5c' } },
    series: [{
      type: 'gauge',
      startAngle: 180,
      endAngle: 0,
      min: 0,
      max: 100,
      splitNumber: 4,
      itemStyle: { color: '#ef4444' },
      progress: { show: true, width: 18 },
      pointer: { show: false },
      axisLine: { lineStyle: { width: 18, color: [[1, '#e2e8f0']] } },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },
      title: { offsetCenter: [0, '20%'], fontSize: 12, color: '#64748b' },
      detail: { valueAnimation: true, fontSize: 32, fontWeight: 700, offsetCenter: [0, '-10%'], formatter: '{value}%', color: '#ef4444' },
      data: [{ value: STATS_DATA.positiveRate }],
    }],
  })

  const getFollowupCompletionOption = () => ({
    tooltip: { trigger: 'item', backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: 8, textStyle: { color: '#1a3a5c' } },
    series: [{
      type: 'gauge',
      startAngle: 180,
      endAngle: 0,
      min: 0,
      max: 100,
      splitNumber: 4,
      itemStyle: { color: '#22c55e' },
      progress: { show: true, width: 18 },
      pointer: { show: false },
      axisLine: { lineStyle: { width: 18, color: [[1, '#e2e8f0']] } },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },
      title: { offsetCenter: [0, '20%'], fontSize: 12, color: '#64748b' },
      detail: { valueAnimation: true, fontSize: 32, fontWeight: 700, offsetCenter: [0, '-10%'], formatter: '{value}%', color: '#22c55e' },
      data: [{ value: STATS_DATA.followupCompletion }],
    }],
  })

  const getTypeDistributionOption = () => ({
    tooltip: { trigger: 'item', backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: 8, textStyle: { color: '#1a3a5c' }, formatter: '{b}: {c}人 ({d}%)' },
    legend: { orient: 'vertical', right: 20, top: 'center', textStyle: { fontSize: 12 } },
    series: [{
      type: 'pie',
      radius: ['45%', '70%'],
      center: ['35%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      emphasis: { label: { show: true, fontSize: 14, fontWeight: 600 } },
      data: [
        { value: 35, name: '乳腺癌', itemStyle: { color: '#ec4899' } },
        { value: 28, name: '甲状腺癌', itemStyle: { color: '#0284c7' } },
        { value: 20, name: '肝癌', itemStyle: { color: '#d97706' } },
        { value: 10, name: '前列腺癌', itemStyle: { color: '#7c3aed' } },
        { value: 7, name: '卵巢癌', itemStyle: { color: '#db2777' } },
      ],
    }],
  })

  return (
    <div style={s.root}>
      {/* 标题栏 */}
      <div style={s.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={s.title}>早癌筛查系统</h1>
            <p style={s.subtitle}>肿瘤筛查 · 风险评估 · 随访管理 · 报表统计</p>
          </div>
          <div style={s.headerRight}>
            <button style={s.btnOutline} onClick={handleExport}><Download size={14} /> 导出报表</button>
            <button style={{ ...s.btn, ...s.btnPrimary }} onClick={() => setShowQuestionnaire(true)}><Plus size={14} /> 风险评估</button>
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div style={s.statRow}>
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, background: '#eff6ff' }}><Activity size={22} color="#3b82f6" /></div>
          <div style={s.statInfo}>
            <div style={s.statValue}>{STATS_DATA.monthlyScreening.reduce((a, b) => a + b.count, 0)}</div>
            <div style={s.statLabel}>本月筛查总数</div>
            <div style={s.statTrend}><TrendingUp size={11} /> +{STATS_DATA.monthlyGrowth}%</div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, background: '#fef2f2' }}><AlertTriangle size={22} color="#ef4444" /></div>
          <div style={s.statInfo}>
            <div style={s.statValue}>{HIGH_RISK_PATIENTS.length}</div>
            <div style={s.statLabel}>高危患者</div>
            <div style={{ ...s.statTrend, color: '#ef4444' }}><AlertOctagon size={11} /> 需重点关注</div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, background: '#fff7ed' }}><ShieldAlert size={22} color="#f97316" /></div>
          <div style={s.statInfo}>
            <div style={s.statValue}>{STATS_DATA.positiveRate}%</div>
            <div style={s.statLabel}>本月阳性率</div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, background: '#f0fdf4' }}><CheckCircle size={22} color="#22c55e" /></div>
          <div style={s.statInfo}>
            <div style={s.statValue}>{STATS_DATA.followupCompletion}%</div>
            <div style={s.statLabel}>随访完成率</div>
          </div>
        </div>
      </div>

      {/* 搜索栏 */}
      <div style={s.searchBar}>
        <input style={s.searchInput} placeholder="搜索患者姓名..." value={searchText} onChange={(e) => setSearchText(e.target.value)} />
        <button style={s.btnOutline}><Filter size={14} /> 筛选</button>
        <button style={s.btnOutline}><RefreshCw size={14} /> 刷新</button>
      </div>

      {/* 标签页 */}
      <div style={s.tabs}>
        {[
          { key: 'list', label: '筛查任务' },
          { key: 'config', label: '筛查项目配置' },
          { key: 'highrisk', label: '高危患者' },
          { key: 'followup', label: '随访计划' },
          { key: 'stats', label: '统计分析' },
        ].map(tab => (
          <div key={tab.key} style={activeTab === tab.key ? s.tabActive : s.tab} onClick={() => setActiveTab(tab.key)}>
            {tab.label}
          </div>
        ))}
      </div>

      {/* 筛查任务列表 */}
      {activeTab === 'list' && (
        <div style={s.card}>
          <div style={{ ...s.cardTitle, marginBottom: 12 }}>
            <Users size={18} color="#3b82f6" />
            <span>筛查任务列表</span>
            <span style={{ marginLeft: 'auto', fontSize: 12, color: '#94a3b8', fontWeight: 400 }}>共 {SCREENING_TASKS.length} 条记录</span>
          </div>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>患者姓名</th>
                <th style={s.th}>年龄/性别</th>
                <th style={s.th}>筛查项目</th>
                <th style={s.th}>筛查日期</th>
                <th style={s.th}>筛查结果</th>
                <th style={s.th}>状态</th>
                <th style={s.th}>主治医生</th>
                <th style={s.th}>操作</th>
              </tr>
            </thead>
            <tbody>
              {SCREENING_TASKS.filter(t => t.name.includes(searchText) || t.type.includes(searchText)).map(task => (
                <tr key={task.id}>
                  <td style={{ ...s.td, fontWeight: 600, color: '#1a3a5c' }}>{task.name}</td>
                  <td style={s.td}>{task.age}岁 / {task.gender}</td>
                  <td style={s.td}>{task.type}</td>
                  <td style={s.td}>{task.date}</td>
                  <td style={s.td}>
                    <span style={{ ...s.tag, background: task.result === '阳性' ? '#fef2f2' : task.result === '可疑' ? '#fff7ed' : '#f0fdf4', color: getResultColor(task.result) }}>
                      {task.result === '阳性' && <AlertTriangle size={12} />}
                      {task.result}
                    </span>
                  </td>
                  <td style={s.td}>
                    <span style={{ ...s.tag, background: task.status === '高危' ? '#fef2f2' : task.status === '复查中' || task.status === '即将到期' ? '#fff7ed' : '#f0fdf4', color: getStatusColor(task.status) }}>
                      {task.status}
                    </span>
                  </td>
                  <td style={s.td}>{task.doctor}</td>
                  <td style={s.td}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button style={{ ...s.btn, ...s.btnPrimary, ...s.btnSmall }} onClick={() => { setSelectedTask(task.id); setShowResultModal(true); }}><Edit2 size={12} /> 录入</button>
                      <button style={{ ...s.btn, ...s.btnOutline, ...s.btnSmall }}><Eye size={12} /> 查看</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 筛查项目配置 */}
      {activeTab === 'config' && (
        <div>
          <div style={s.card}>
            <div style={s.cardTitle}><Zap size={18} color="#3b82f6" />筛查项目配置</div>
            <div style={s.configGrid}>
              {SCREENING_TYPES.map(type => (
                <div key={type.id} style={s.configItem}>
                  <div style={{ ...s.configIcon, background: type.color }}>
                    <span style={{ fontSize: 20 }}>{type.icon}</span>
                  </div>
                  <div style={s.configInfo}>
                    <div style={s.configName}>{type.name}</div>
                    <div style={s.configDesc}>{type.desc}</div>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked style={{ width: 18, height: 18, accentColor: '#3b82f6' }} />
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 高危患者 */}
      {activeTab === 'highrisk' && (
        <div>
          {HIGH_RISK_PATIENTS.map(patient => (
            <div key={patient.id} style={{ ...s.card, borderLeft: '4px solid #ef4444', marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: '#1a3a5c' }}>{patient.name}</span>
                    <span style={{ ...s.tag, ...s.highRiskTag }}>
                      <AlertOctagon size={12} /> 高危
                    </span>
                    {patient.alertLevel === 'urgent' && (
                      <span style={{ ...s.tag, background: '#7f1d1d', color: '#fff' }}>
                        <Bell size={12} /> 紧急
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 13, color: '#64748b', display: 'flex', gap: 16 }}>
                    <span>{patient.age}岁 / {patient.gender}</span>
                    <span>{patient.type}</span>
                    <span>风险评分: <strong style={{ color: '#ef4444' }}>{patient.riskScore}</strong></span>
                    <span>结果: <strong style={{ color: '#ef4444' }}>{patient.result}</strong></span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button style={{ ...s.btn, ...s.btnDanger, ...s.btnSmall }} onClick={() => generateFollowup(patient)}><Calendar size={12} /> 生成随访</button>
                  <button style={{ ...s.btn, ...s.btnOutline, ...s.btnSmall }}><FileText size={12} /> 详情</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 随访计划 */}
      {activeTab === 'followup' && (
        <div style={s.card}>
          <div style={s.cardTitle}><Calendar size={18} color="#3b82f6" />随访计划</div>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>患者</th>
                <th style={s.th}>癌种</th>
                <th style={s.th}>下次随访日期</th>
                <th style={s.th}>随访间隔</th>
                <th style={s.th}>随访目的</th>
                <th style={s.th}>状态</th>
                <th style={s.th}>操作</th>
              </tr>
            </thead>
            <tbody>
              {FOLLOWUP_PLANS.map(plan => (
                <tr key={plan.id}>
                  <td style={{ ...s.td, fontWeight: 600, color: '#1a3a5c' }}>{plan.patient}</td>
                  <td style={s.td}>{plan.cancer}</td>
                  <td style={s.td}>{plan.nextDate}</td>
                  <td style={s.td}>{plan.interval}</td>
                  <td style={s.td}>{plan.purpose}</td>
                  <td style={s.td}>
                    <span style={{ ...s.tag, background: plan.status === '待执行' ? '#eff6ff' : '#fff7ed', color: plan.status === '待执行' ? '#3b82f6' : '#f97316' }}>
                      {plan.status}
                    </span>
                  </td>
                  <td style={s.td}>
                    <button style={{ ...s.btn, ...s.btnPrimary, ...s.btnSmall }}><CheckCircle size={12} /> 完成</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 统计分析 */}
      {activeTab === 'stats' && (
        <div>
          <div style={s.chartRow}>
            <div style={s.chartCard}>
              <div style={{ ...s.cardTitle, marginBottom: 8 }}><TrendingUp size={16} color="#3b82f6" />筛查趋势</div>
              <ReactECharts option={getScreeningTrendOption()} style={{ height: 280 }} />
            </div>
            <div style={s.chartCard}>
              <div style={{ ...s.cardTitle, marginBottom: 8 }}><Activity size={16} color="#ef4444" />阳性率</div>
              <ReactECharts option={getPositiveRateOption()} style={{ height: 280 }} />
            </div>
            <div style={s.chartCard}>
              <div style={{ ...s.cardTitle, marginBottom: 8 }}><CheckCircle size={16} color="#22c55e" />随访完成率</div>
              <ReactECharts option={getFollowupCompletionOption()} style={{ height: 280 }} />
            </div>
          </div>
          <div style={s.chartCard}>
            <div style={{ ...s.cardTitle, marginBottom: 8 }}><PieChartIcon size={16} color="#8b5cf6" />筛查类型分布</div>
            <ReactECharts option={getTypeDistributionOption()} style={{ height: 300 }} />
          </div>
        </div>
      )}

      {/* 结果录入弹窗 */}
      {showResultModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, width: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 18, color: '#1a3a5c' }}>筛查结果录入</h3>
            <div style={s.formGroup}>
              <label style={s.formLabel}>筛查结果</label>
              <div style={s.radioGroup}>
                {['阳性', '阴性', '可疑', '待确认'].map(r => (
                  <label key={r} style={{ ...s.radioItem, ...s.btn, ...(resultForm.result === r ? { background: getResultColor(r), color: '#fff' } : { background: '#f8fafc', color: '#475569' }) }}>
                    <input type="radio" name="result" value={r} checked={resultForm.result === r} onChange={(e) => setResultForm({ ...resultForm, result: e.target.value })} style={{ display: 'none' }} />
                    {r}
                  </label>
                ))}
              </div>
            </div>
            <div style={s.formGroup}>
              <label style={s.formLabel}>备注说明</label>
              <textarea style={{ ...s.formInput, height: 80, resize: 'vertical' }} placeholder="请输入备注说明..." value={resultForm.notes} onChange={(e) => setResultForm({ ...resultForm, notes: e.target.value })} />
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
              <button style={{ ...s.btn, ...s.btnOutline }} onClick={() => setShowResultModal(false)}>取消</button>
              <button style={{ ...s.btn, ...s.btnPrimary }} onClick={() => { setShowResultModal(false); alert('结果已保存'); }}>确认提交</button>
            </div>
          </div>
        </div>
      )}

      {/* 风险评估问卷弹窗 */}
      {showQuestionnaire && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, width: 560, maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 18, color: '#1a3a5c' }}>癌症风险评估问卷</h3>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>请如实填写以下信息，以便系统进行风险评估</p>
            {QUESTIONNAIRE_QUESTIONS.map(q => (
              <div key={q.id} style={s.formGroup}>
                <label style={s.formLabel}>{q.question}</label>
                {q.type === 'input' ? (
                  <input style={s.formInput} type="text" placeholder={q.placeholder} value={questionnaireAnswers[q.id] || ''} onChange={(e) => setQuestionnaireAnswers({ ...questionnaireAnswers, [q.id]: e.target.value })} />
                ) : (
                  <div style={s.radioGroup}>
                    {q.options?.map(opt => (
                      <label key={opt} style={{ ...s.radioItem, ...s.btn, ...(questionnaireAnswers[q.id] === opt ? { background: '#3b82f6', color: '#fff' } : { background: '#f8fafc', color: '#475569' }) }}>
                        <input type="radio" name={q.id} value={opt} checked={questionnaireAnswers[q.id] === opt} onChange={(e) => setQuestionnaireAnswers({ ...questionnaireAnswers, [q.id]: e.target.value })} style={{ display: 'none' }} />
                        {opt}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
              <button style={{ ...s.btn, ...s.btnOutline }} onClick={() => setShowQuestionnaire(false)}>取消</button>
              <button style={{ ...s.btn, ...s.btnPrimary }} onClick={() => { setShowQuestionnaire(false); alert('风险评估完成，请查看评估结果'); }}>提交评估</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
