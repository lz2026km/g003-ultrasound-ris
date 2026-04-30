// @ts-nocheck
// ============================================================
// G003 超声RIS系统 - 肿瘤筛查页面
// 癌症早筛 / 风险评估 / 随访管理 / 筛查统计
// ============================================================
import { useState } from 'react'
import {
  Search, Filter, Download, Plus, AlertTriangle,
  Activity, TrendingUp, Users, Calendar, Clock,
  CheckCircle, XCircle, ChevronRight, Heart,
  ShieldAlert, FileText, BarChart3, PieChart as PieChartIcon
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
  // 患者卡片
  patientCard: { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 12 },
  patientHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  patientInfo: { flex: 1 },
  patientName: { fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 4 },
  patientMeta: { fontSize: 12, color: '#64748b' },
  riskTag: { fontSize: 12, fontWeight: 700, padding: '4px 14px', borderRadius: 20 },
  riskBar: { height: 8, borderRadius: 4, background: '#e2e8f0', overflow: 'hidden', marginTop: 12 },
  riskBarFill: { height: '100%', borderRadius: 4, transition: 'width 0.3s' },
  patientActions: { display: 'flex', gap: 8, marginTop: 12 },
  // 图表卡片
  chartCard: { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 24 },
  chartTitle: { fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 },
  chartIcon: { color: '#64748b' },
  chartGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 },
  // 统计表格
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: { padding: '12px 16px', textAlign: 'left', color: '#64748b', fontWeight: 600, borderBottom: '2px solid #f1f5f9', fontSize: 12 },
  td: { padding: '14px 16px', color: '#475569', borderBottom: '1px solid #f1f5f9' },
  btn: { padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s' },
  btnPrimary: { background: '#3b82f6', color: '#fff' },
  btnOutline: { padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, background: '#fff', color: '#475569' },
  btnSuccess: { background: '#22c55e', color: '#fff' },
  btnWarning: { background: '#f97316', color: '#fff' },
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

// 筛查患者数据
const SCREENING_PATIENTS = [
  { id: 1, name: '张三', age: 52, gender: '男', exam: '腹部超声', date: '2024-12-15', risk: 85, riskLevel: '高风险', cancer: '肝癌', status: '已确诊' },
  { id: 2, name: '李红', age: 45, gender: '女', exam: '乳腺超声', date: '2024-12-14', risk: 62, riskLevel: '中风险', cancer: '乳腺癌', status: '随访中' },
  { id: 3, name: '王五', age: 38, gender: '女', exam: '甲状腺超声', date: '2024-12-14', risk: 28, riskLevel: '低风险', cancer: null, status: '正常' },
  { id: 4, name: '赵丽', age: 55, gender: '女', exam: '乳腺超声', date: '2024-12-13', risk: 45, riskLevel: '中风险', cancer: null, status: '复查中' },
]

// 筛查类型分布
const SCREENING_TYPE_DIST = [
  { name: '乳腺癌筛查', value: 35 },
  { name: '甲状腺癌筛查', value: 28 },
  { name: '肝癌筛查', value: 20 },
  { name: '其他', value: 17 },
]

// 筛查趋势
const SCREENING_TREND = [
  { month: '7月', screened: 120, suspected: 8, confirmed: 2 },
  { month: '8月', screened: 145, suspected: 10, confirmed: 3 },
  { month: '9月', screened: 138, suspected: 7, confirmed: 2 },
  { month: '10月', screened: 156, suspected: 12, confirmed: 4 },
  { month: '11月', screened: 168, suspected: 9, confirmed: 3 },
  { month: '12月', screened: 180, suspected: 11, confirmed: 3 },
]

// 高危随访表
const FOLLOWUP_PATIENTS = [
  { id: 1, name: '张三', cancer: '肝癌', risk: 85, lastFollowup: '2024-12-10', nextFollowup: '2025-01-10', status: '随访中' },
  { id: 2, name: '李红', cancer: '乳腺癌', risk: 62, lastFollowup: '2024-12-05', nextFollowup: '2025-01-05', status: '随访中' },
  { id: 3, name: '赵丽', cancer: '乳腺癌', risk: 45, lastFollowup: '2024-11-28', nextFollowup: '2024-12-28', status: '待复查' },
]

export default function CancerScreenPage() {
  const [activeTab, setActiveTab] = useState('screening')
  const [searchText, setSearchText] = useState('')

  const getRiskColor = (risk) => {
    if (risk >= 70) return '#ef4444'
    if (risk >= 40) return '#f97316'
    return '#22c55e'
  }

  return (
    <div style={s.root}>
      {/* 标题 */}
      <div style={s.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={s.title}>肿瘤筛查</h1>
            <p style={s.subtitle}>癌症早筛 · 风险评估 · 随访管理 · 筛查统计</p>
          </div>
          <div style={s.headerRight}>
            <button style={s.btnOutline}><Download size={14} /> 导出数据</button>
            <button style={{ ...s.btn, ...s.btnPrimary }}><Plus size={14} /> 新增筛查</button>
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div style={s.statRow}>
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, background: '#eff6ff' }}><Activity size={22} color="#3b82f6" /></div>
          <div style={s.statInfo}>
            <div style={s.statValue}>856</div>
            <div style={s.statLabel}>本月筛查</div>
            <div style={s.statTrend}><TrendingUp size={11} /> +12%</div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, background: '#fef2f2' }}><AlertTriangle size={22} color="#ef4444" /></div>
          <div style={s.statInfo}>
            <div style={s.statValue}>23</div>
            <div style={s.statLabel}>高危患者</div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, background: '#fff7ed' }}><ShieldAlert size={22} color="#f97316" /></div>
          <div style={s.statInfo}>
            <div style={s.statValue}>8</div>
            <div style={s.statLabel}>疑似病例</div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, background: '#f0fdf4' }}><CheckCircle size={22} color="#22c55e" /></div>
          <div style={s.statInfo}>
            <div style={s.statValue}>15</div>
            <div style={s.statLabel}>确诊早癌</div>
            <div style={s.statTrend}>本年累计</div>
          </div>
        </div>
      </div>

      {/* 搜索栏 */}
      <div style={s.searchBar}>
        <input style={s.searchInput} placeholder="搜索患者姓名..." value={searchText} onChange={(e) => setSearchText(e.target.value)} />
        <button style={s.btnOutline}><Filter size={14} /> 筛选</button>
      </div>

      {/* 标签页 */}
      <div style={s.tabs}>
        {['screening', 'followup', 'statistics'].map((tab) => (
          <div key={tab} style={activeTab === tab ? s.tabActive : s.tab} onClick={() => setActiveTab(tab)}>
            {tab === 'screening' ? '筛查列表' : tab === 'followup' ? '高危随访' : '统计分析'}
          </div>
        ))}
      </div>

      {/* 筛查列表 */}
      {activeTab === 'screening' && (
        <div>
          {SCREENING_PATIENTS.map((patient) => (
            <div key={patient.id} style={s.patientCard}>
              <div style={s.patientHeader}>
                <div style={s.patientInfo}>
                  <div style={s.patientName}>{patient.name} <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 400 }}>{patient.age}岁/{patient.gender}</span></div>
                  <div style={s.patientMeta}>{patient.exam} | 筛查日期：{patient.date}</div>
                </div>
                <div style={{ ...s.riskTag, background: patient.risk >= 70 ? '#fef2f2' : patient.risk >= 40 ? '#fff7ed' : '#f0fdf4', color: getRiskColor(patient.risk) }}>
                  {patient.riskLevel}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: '#64748b' }}>风险评分</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: getRiskColor(patient.risk) }}>{patient.risk}分</span>
              </div>
              <div style={s.riskBar}>
                <div style={{ ...s.riskBarFill, width: `${patient.risk}%`, background: getRiskColor(patient.risk) }} />
              </div>
              {patient.cancer && (
                <div style={{ marginTop: 12, padding: '8px 12px', background: '#fef2f2', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AlertTriangle size={14} color="#ef4444" />
                  <span style={{ fontSize: 12, color: '#ef4444', fontWeight: 600 }}>疑似{patient.cancer}</span>
                </div>
              )}
              <div style={s.patientActions}>
                <button style={{ ...s.btn, ...s.btnPrimary }}><FileText size={14} /> 查看报告</button>
                {patient.status === '随访中' && <button style={{ ...s.btn, ...s.btnWarning }}><Calendar size={14} /> 安排随访</button>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 高危随访 */}
      {activeTab === 'followup' && (
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>患者</th>
                <th style={s.th}>癌种</th>
                <th style={s.th}>风险评分</th>
                <th style={s.th}>上次随访</th>
                <th style={s.th}>下次随访</th>
                <th style={s.th}>状态</th>
                <th style={s.th}>操作</th>
              </tr>
            </thead>
            <tbody>
              {FOLLOWUP_PATIENTS.map((patient) => (
                <tr key={patient.id}>
                  <td style={s.td}>{patient.name}</td>
                  <td style={s.td}>{patient.cancer}</td>
                  <td style={s.td}><span style={{ color: getRiskColor(patient.risk), fontWeight: 600 }}>{patient.risk}分</span></td>
                  <td style={s.td}>{patient.lastFollowup}</td>
                  <td style={s.td}>{patient.nextFollowup}</td>
                  <td style={s.td}>
                    <span style={{ ...s.riskTag, background: patient.status === '随访中' ? '#fff7ed' : '#fef2f2', color: patient.status === '随访中' ? '#f97316' : '#ef4444' }}>
                      {patient.status}
                    </span>
                  </td>
                  <td style={s.td}>
                    <button style={{ ...s.btn, ...s.btnPrimary, padding: '6px 12px', fontSize: 12 }}><Calendar size={12} /> 随访</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 统计分析 */}
      {activeTab === 'statistics' && (
        <div>
          <div style={s.chartGrid}>
            <div style={s.chartCard}>
              <div style={s.chartTitle}><TrendingUp size={16} style={s.chartIcon} /> 筛查趋势</div>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={SCREENING_TREND}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip {...trendTooltip} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="screened" stroke="#3b82f6" strokeWidth={2} name="筛查人数" dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="suspected" stroke="#f97316" strokeWidth={2} name="疑似" dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="confirmed" stroke="#ef4444" strokeWidth={2} name="确诊" dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div style={s.chartCard}>
              <div style={s.chartTitle}><PieChartIcon size={16} style={s.chartIcon} /> 筛查类型分布</div>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={SCREENING_TYPE_DIST} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {SCREENING_TYPE_DIST.map((_, index) => (<Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
