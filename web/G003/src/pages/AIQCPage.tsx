// @ts-nocheck
// ============================================================
// G003 超声RIS系统 - AI质控页面
// AI辅助质控 / 质量评估 / 报告审核 / 质控统计
// ============================================================
import { useState } from 'react'
import {
  Search, Filter, Download, CheckCircle, AlertCircle,
  Brain, FileText, BarChart3, TrendingUp, Clock,
  User, Eye, MessageSquare, ThumbsUp, ThumbsDown,
  ChevronRight, Sparkles, ShieldCheck, Activity
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

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
  // 报告审核卡片
  reportCard: { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 12 },
  reportHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  reportTitle: { fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 4 },
  reportMeta: { fontSize: 12, color: '#64748b' },
  reportTag: { fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 8 },
  reportContent: { background: '#f8fafc', borderRadius: 8, padding: 16, marginBottom: 12 },
  reportSection: { marginBottom: 12 },
  reportLabel: { fontSize: 11, color: '#94a3b8', marginBottom: 4 },
  reportText: { fontSize: 13, color: '#475569' },
  aiResult: { display: 'flex', gap: 16, marginTop: 12 },
  aiItem: { flex: 1, padding: 12, borderRadius: 8, textAlign: 'center' },
  aiValue: { fontSize: 20, fontWeight: 700 },
  aiLabel: { fontSize: 11, color: '#64748b', marginTop: 4 },
  // 图表卡片
  chartCard: { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 24 },
  chartTitle: { fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 },
  chartIcon: { color: '#64748b' },
  chartGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 },
  // AI建议卡片
  suggestionCard: { background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 12, borderLeft: '4px solid' },
  suggestionTitle: { fontSize: 13, fontWeight: 600, color: '#1a3a5c', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 },
  suggestionText: { fontSize: 12, color: '#64748b', lineHeight: 1.6 },
  suggestionTag: { fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 6, marginLeft: 'auto' },
  btn: { padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s' },
  btnPrimary: { background: '#3b82f6', color: '#fff' },
  btnOutline: { padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, background: '#fff', color: '#475569' },
  btnSuccess: { background: '#22c55e', color: '#fff' },
  btnDanger: { background: '#ef4444', color: '#fff' },
  blue: { backgroundColor: '#eff6ff', color: '#3b82f6' },
  green: { backgroundColor: '#f0fdf4', color: '#22c55e' },
  orange: { backgroundColor: '#fff7ed', color: '#f97316' },
  red: { backgroundColor: '#fef2f2', color: '#ef4444' },
  purple: { backgroundColor: '#f5f3ff', color: '#8b5cf6' },
  teal: { backgroundColor: '#f0fdfa', color: '#14b8a6' },
}

const PIE_COLORS = ['#22c55e', '#f97316', '#ef4444', '#94a3b8']
const trendTooltip = { contentStyle: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }, labelStyle: { color: '#1a3a5c', fontWeight: 600 } }

// 待审核报告
const PENDING_REPORTS = [
  { id: 1, patient: '张三', exam: '腹部超声', doctor: '李明辉', date: '2024-12-15 10:30', aiScore: 92, issues: [], status: '通过' },
  { id: 2, patient: '李红', exam: '心脏超声', doctor: '王芳', date: '2024-12-15 10:15', aiScore: 78, issues: ['描述不完整'], status: '需修改' },
  { id: 3, patient: '王五', exam: '甲状腺超声', doctor: '张伟', date: '2024-12-15 09:45', aiScore: 65, issues: ['诊断建议不明确', '测量数据缺失'], status: '需修改' },
]

// 质控趋势
const QC_TREND = [
  { date: '12-10', qualified: 45, unqualified: 2, pending: 3 },
  { date: '12-11', qualified: 48, unqualified: 1, pending: 2 },
  { date: '12-12', qualified: 52, unqualified: 3, pending: 4 },
  { date: '12-13', qualified: 50, unqualified: 1, pending: 2 },
  { date: '12-14', qualified: 55, unqualified: 2, pending: 3 },
  { date: '12-15', qualified: 58, unqualified: 1, pending: 2 },
]

// 质控类型分布
const QC_TYPE_DIST = [
  { name: '描述完整', value: 85 },
  { name: '描述不规范', value: 10 },
  { name: '诊断错误', value: 3 },
  { name: '其他', value: 2 },
]

// AI建议
const AI_SUGGESTIONS = [
  { type: 'warning', icon: AlertCircle, color: '#f97316', title: '描述不完整', text: '报告缺少对肝脏大小、形态的详细描述，建议补充。', tag: '需修改' },
  { type: 'info', icon: Brain, color: '#3b82f6', title: '测量建议', text: '甲状腺结节建议增加弹性成像评分，辅助判断良恶性。', tag: '建议' },
  { type: 'success', icon: CheckCircle, color: '#22c55e', title: '诊断准确', text: '该报告诊断准确，描述规范，符合质控标准。', tag: '优秀' },
]

export default function AIQCPage() {
  const [activeTab, setActiveTab] = useState('review')
  const [searchText, setSearchText] = useState('')

  return (
    <div style={s.root}>
      {/* 标题 */}
      <div style={s.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={s.title}>AI质控</h1>
            <p style={s.subtitle}>AI辅助质控 · 质量评估 · 报告审核 · 质控统计</p>
          </div>
          <div style={s.headerRight}>
            <button style={s.btnOutline}><Download size={14} /> 导出报告</button>
            <button style={{ ...s.btn, ...s.btnPrimary }}><Sparkles size={14} /> AI模型更新</button>
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div style={s.statRow}>
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, background: '#f0fdf4' }}><CheckCircle size={22} color="#22c55e" /></div>
          <div style={s.statInfo}>
            <div style={s.statValue}>96.2%</div>
            <div style={s.statLabel}>今日合格率</div>
            <div style={s.statTrend}><TrendingUp size={11} /> +1.5%</div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, background: '#eff6ff' }}><Brain size={22} color="#3b82f6" /></div>
          <div style={s.statInfo}>
            <div style={s.statValue}>328</div>
            <div style={s.statLabel}>AI审核报告</div>
            <div style={s.statTrend}><TrendingUp size={11} /> +45</div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, background: '#fff7ed' }}><AlertCircle size={22} color="#f97316" /></div>
          <div style={s.statInfo}>
            <div style={s.statValue}>12</div>
            <div style={s.statLabel}>待处理问题</div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, background: '#f5f3ff' }}><ShieldCheck size={22} color="#8b5cf6" /></div>
          <div style={s.statInfo}>
            <div style={s.statValue}>88.5</div>
            <div style={s.statLabel}>科室质控评分</div>
            <div style={s.statTrend}><TrendingUp size={11} /> +2.3</div>
          </div>
        </div>
      </div>

      {/* 搜索栏 */}
      <div style={s.searchBar}>
        <input style={s.searchInput} placeholder="搜索报告、患者..." value={searchText} onChange={(e) => setSearchText(e.target.value)} />
        <button style={s.btnOutline}><Filter size={14} /> 筛选</button>
      </div>

      {/* 标签页 */}
      <div style={s.tabs}>
        {['review', 'statistics', 'suggestions'].map((tab) => (
          <div key={tab} style={activeTab === tab ? s.tabActive : s.tab} onClick={() => setActiveTab(tab)}>
            {tab === 'review' ? '报告审核' : tab === 'statistics' ? '质控统计' : 'AI建议'}
          </div>
        ))}
      </div>

      {/* 报告审核 */}
      {activeTab === 'review' && (
        <div>
          {PENDING_REPORTS.map((report) => (
            <div key={report.id} style={s.reportCard}>
              <div style={s.reportHeader}>
                <div>
                  <div style={s.reportTitle}>{report.patient} - {report.exam}</div>
                  <div style={s.reportMeta}>检查医生：{report.doctor} | {report.date}</div>
                </div>
                <div style={{ ...s.reportTag, background: report.status === '通过' ? '#f0fdf4' : '#fff7ed', color: report.status === '通过' ? '#22c55e' : '#f97316' }}>
                  {report.status}
                </div>
              </div>
              <div style={s.reportContent}>
                <div style={s.reportSection}>
                  <div style={s.reportLabel}>超声描述</div>
                  <div style={s.reportText}>肝脏大小正常，形态规整，实质回声均匀，肝内管道走形正常...</div>
                </div>
                <div style={s.reportSection}>
                  <div style={s.reportLabel}>超声诊断</div>
                  <div style={s.reportText}>肝胆脾胰未见明显异常</div>
                </div>
              </div>
              <div style={s.aiResult}>
                <div style={{ ...s.aiItem, background: '#f0fdf4' }}>
                  <div style={{ ...s.aiValue, color: '#22c55e' }}>{report.aiScore}</div>
                  <div style={s.aiLabel}>AI质控评分</div>
                </div>
                <div style={{ ...s.aiItem, background: report.issues.length > 0 ? '#fff7ed' : '#f0fdf4' }}>
                  <div style={{ ...s.aiValue, color: report.issues.length > 0 ? '#f97316' : '#22c55e' }}>{report.issues.length}</div>
                  <div style={s.aiLabel}>发现问题</div>
                </div>
              </div>
              {report.issues.length > 0 && (
                <div style={{ marginTop: 12, padding: '10px 14px', background: '#fef2f2', borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: '#ef4444', fontWeight: 600, marginBottom: 4 }}>存在问题</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{report.issues.join('、')}</div>
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button style={{ ...s.btn, ...s.btnSuccess }}><ThumbsUp size={14} /> 审核通过</button>
                <button style={{ ...s.btn, ...s.btnDanger }}><ThumbsDown size={14} /> 退回修改</button>
                <button style={s.btnOutline}><Eye size={14} /> 查看详情</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 质控统计 */}
      {activeTab === 'statistics' && (
        <div>
          <div style={s.chartGrid}>
            <div style={s.chartCard}>
              <div style={s.chartTitle}><Activity size={16} style={s.chartIcon} /> 质控趋势（近6天）</div>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={QC_TREND}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip {...trendTooltip} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="qualified" stroke="#22c55e" strokeWidth={2} name="合格" dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="unqualified" stroke="#ef4444" strokeWidth={2} name="不合格" dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div style={s.chartCard}>
              <div style={s.chartTitle}><BarChart3 size={16} style={s.chartIcon} /> 质控类型分布</div>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={QC_TYPE_DIST} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {QC_TYPE_DIST.map((_, index) => (<Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* AI建议 */}
      {activeTab === 'suggestions' && (
        <div>
          {AI_SUGGESTIONS.map((item, idx) => (
            <div key={idx} style={{ ...s.suggestionCard, borderLeftColor: item.color }}>
              <div style={s.suggestionTitle}>
                <item.icon size={16} color={item.color} />
                {item.title}
                <span style={{ ...s.suggestionTag, background: item.color === '#22c55e' ? '#f0fdf4' : item.color === '#f97316' ? '#fff7ed' : '#eff6ff', color: item.color }}>{item.tag}</span>
              </div>
              <div style={s.suggestionText}>{item.text}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
