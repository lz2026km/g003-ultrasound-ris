// @ts-nocheck
// ============================================================
// G003 超声RIS系统 - 科研管理页面
// 科研项目管理 / 数据分析 / 论文管理 / 统计分析
// ============================================================
import { useState } from 'react'
import {
  Search, Plus, Filter, Download, FileText, Users,
  BarChart3, PieChart as PieChartIcon, TrendingUp,
  Calendar, Clock, CheckCircle, AlertCircle,
  ChevronRight, BookOpen, Target, FlaskConical,
  Award, Globe, Bookmark, Star
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts'
import { initialStatisticsData } from '../data/initialData'

// ---------- 样式 ----------
const s: Record<string, React.CSSProperties> = {
  root: { padding: 0 },
  header: { marginBottom: 24 },
  title: { fontSize: 20, fontWeight: 700, color: '#1a3a5c', margin: 0 },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 4 },
  headerRight: { display: 'flex', gap: 8 },
  // 搜索栏
  searchBar: {
    display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center',
  },
  searchInput: {
    flex: 1, padding: '10px 16px', border: '1px solid #e2e8f0',
    borderRadius: 10, fontSize: 13, outline: 'none', background: '#fff',
  },
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
  // 标签页
  tabs: {
    display: 'flex', gap: 4, marginBottom: 20, borderBottom: '2px solid #f1f5f9',
  },
  tab: {
    padding: '10px 20px', fontSize: 13, fontWeight: 600, color: '#64748b',
    cursor: 'pointer', borderBottom: '2px solid transparent', marginBottom: -2,
    transition: 'all 0.2s',
  },
  tabActive: {
    padding: '10px 20px', fontSize: 13, fontWeight: 600, color: '#3b82f6',
    cursor: 'pointer', borderBottom: '2px solid #3b82f6', marginBottom: -2,
  },
  // 卡片网格
  cardGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 24,
  },
  card: {
    background: '#fff', borderRadius: 12, padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  cardHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16,
  },
  cardTitle: {
    fontSize: 14, fontWeight: 600, color: '#1a3a5c', display: 'flex', alignItems: 'center', gap: 8,
  },
  cardIcon: { color: '#64748b' },
  // 项目卡片
  projectCard: {
    background: '#fff', borderRadius: 12, padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 12,
  },
  projectHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12,
  },
  projectTitle: { fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 4 },
  projectDesc: { fontSize: 12, color: '#64748b', marginBottom: 12 },
  projectMeta: {
    display: 'flex', gap: 16, fontSize: 11, color: '#94a3b8',
  },
  projectTag: {
    fontSize: 10, fontWeight: 600, padding: '3px 10px',
    borderRadius: 8, flexShrink: 0,
  },
  projectProgress: {
    height: 6, borderRadius: 3, background: '#e2e8f0', overflow: 'hidden', marginTop: 12,
  },
  // 论文表格
  table: {
    width: '100%', borderCollapse: 'collapse', fontSize: 13,
  },
  th: {
    padding: '12px 16px', textAlign: 'left', color: '#64748b',
    fontWeight: 600, borderBottom: '2px solid #f1f5f9', fontSize: 12,
  },
  td: {
    padding: '14px 16px', color: '#475569', borderBottom: '1px solid #f1f5f9',
  },
  // 图表卡片
  chartCard: {
    background: '#fff', borderRadius: 12, padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 24,
  },
  chartTitle: {
    fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 16,
    display: 'flex', alignItems: 'center', gap: 6,
  },
  chartIcon: { color: '#64748b' },
  // 按钮
  btn: {
    padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
    fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6,
    transition: 'all 0.2s',
  },
  btnPrimary: {
    padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
    fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6,
    background: '#3b82f6', color: '#fff', transition: 'all 0.2s',
  },
  btnOutline: {
    padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0',
    cursor: 'pointer', fontSize: 13, fontWeight: 500, display: 'flex',
    alignItems: 'center', gap: 6, background: '#fff', color: '#475569',
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

// 科研项目数据
const RESEARCH_PROJECTS = [
  { id: 1, title: '基于深度学习的甲状腺结节自动诊断研究', status: '进行中', progress: 72, leader: '李明辉', start: '2024-01', funding: '50万', type: '国家级', typeBg: '#fef2f2', typeColor: '#ef4444' },
  { id: 2, title: '超声弹性成像在肝纤维化分级中的应用', status: '进行中', progress: 58, leader: '王芳', start: '2024-03', funding: '30万', type: '省级', typeBg: '#eff6ff', typeColor: '#3b82f6' },
  { id: 3, title: '乳腺癌早筛超声AI辅助诊断系统研发', status: '已完成', progress: 100, leader: '张伟', start: '2023-06', funding: '80万', type: '国家级', typeBg: '#f0fdf4', typeColor: '#22c55e' },
  { id: 4, title: '心血管超声影像标准化研究', status: '申请中', progress: 15, leader: '刘涛', start: '2025-01', funding: '40万', type: '市级', typeBg: '#f5f3ff', typeColor: '#8b5cf6' },
]

// 论文数据
const PAPERS = [
  { id: 1, title: '深度学习在甲状腺结节良恶性鉴别中的应用', journal: '中华超声影像学杂志', year: 2024, type: 'SCI', impact: 3.2, status: '已发表', statusBg: '#f0fdf4', statusColor: '#22c55e' },
  { id: 2, title: '超声弹性成像评估肝纤维化分期的Meta分析', journal: '中国医学影像技术', year: 2024, type: '核心', impact: 1.8, status: '审稿中', statusBg: '#fff7ed', statusColor: '#f97316' },
  { id: 3, title: '乳腺癌超声筛查中AI辅助诊断的临床价值', journal: 'Radiology', year: 2023, type: 'SCI', impact: 5.9, status: '已发表', statusBg: '#f0fdf4', statusColor: '#22c55e' },
  { id: 4, title: '超声造影在肾脏肿瘤诊断中的应用研究', journal: '中华医学超声杂志', year: 2023, type: '核心', impact: 1.5, status: '已发表', statusBg: '#f0fdf4', statusColor: '#22c55e' },
]

// 科研趋势数据
const RESEARCH_TREND = [
  { year: '2020', papers: 12, projects: 3, funding: 80 },
  { year: '2021', papers: 18, projects: 5, funding: 120 },
  { year: '2022', papers: 25, projects: 6, funding: 180 },
  { year: '2023', papers: 32, projects: 8, funding: 220 },
  { year: '2024', papers: 38, projects: 10, funding: 280 },
]

// 研究领域分布
const FIELD_DISTRIBUTION = [
  { name: '浅表器官', value: 28 },
  { name: '心血管', value: 22 },
  { name: '腹部', value: 20 },
  { name: '妇产科', value: 18 },
  { name: '其他', value: 12 },
]

// 雷达数据
const RADAR_DATA = [
  { subject: '论文质量', A: 85, fullMark: 100 },
  { subject: '项目数量', A: 72, fullMark: 100 },
  { subject: '科研经费', A: 68, fullMark: 100 },
  { subject: '人才培养', A: 78, fullMark: 100 },
  { subject: '学术交流', A: 65, fullMark: 100 },
  { subject: '成果转化', A: 55, fullMark: 100 },
]

export default function ResearchPage() {
  const [activeTab, setActiveTab] = useState('projects')
  const [searchText, setSearchText] = useState('')

  return (
    <div style={s.root}>
      {/* 标题 */}
      <div style={s.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={s.title}>科研管理</h1>
            <p style={s.subtitle}>科研项目管理 · 论文发表 · 数据分析 · 统计分析</p>
          </div>
          <div style={s.headerRight}>
            <button style={s.btnOutline}><Download size={14} /> 导出数据</button>
            <button style={s.btnPrimary}><Plus size={14} /> 新增项目</button>
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div style={s.statRow}>
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, background: '#eff6ff' }}>
            <Target size={22} color="#3b82f6" />
          </div>
          <div style={s.statInfo}>
            <div style={s.statValue}>24</div>
            <div style={s.statLabel}>在研项目</div>
            <div style={s.statTrend}><TrendingUp size={11} /> +3</div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, background: '#f0fdf4' }}>
            <BookOpen size={22} color="#22c55e" />
          </div>
          <div style={s.statInfo}>
            <div style={s.statValue}>156</div>
            <div style={s.statLabel}>发表论文</div>
            <div style={s.statTrend}><TrendingUp size={11} /> +12</div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, background: '#fff7ed' }}>
            <FlaskConical size={22} color="#f97316" />
          </div>
          <div style={s.statInfo}>
            <div style={s.statValue}>680万</div>
            <div style={s.statLabel}>科研经费</div>
            <div style={s.statTrend}><TrendingUp size={11} /> +120万</div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, background: '#f5f3ff' }}>
            <Award size={22} color="#8b5cf6" />
          </div>
          <div style={s.statInfo}>
            <div style={s.statValue}>8</div>
            <div style={s.statLabel}>获奖成果</div>
            <div style={s.statTrend}><TrendingUp size={11} /> +2</div>
          </div>
        </div>
      </div>

      {/* 搜索栏 */}
      <div style={s.searchBar}>
        <input
          style={s.searchInput}
          placeholder="搜索科研项目、论文..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <button style={s.btnOutline}><Filter size={14} /> 筛选</button>
      </div>

      {/* 标签页 */}
      <div style={s.tabs}>
        {['projects', 'papers', 'statistics'].map((tab) => (
          <div
            key={tab}
            style={activeTab === tab ? s.tabActive : s.tab}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'projects' ? '科研项目' : tab === 'papers' ? '论文管理' : '统计分析'}
          </div>
        ))}
      </div>

      {/* 科研项目 */}
      {activeTab === 'projects' && (
        <div>
          {RESEARCH_PROJECTS.map((project) => (
            <div key={project.id} style={s.projectCard}>
              <div style={s.projectHeader}>
                <div style={{ flex: 1 }}>
                  <div style={s.projectTitle}>{project.title}</div>
                  <div style={s.projectDesc}>负责人：{project.leader} | 起始：{project.start} | 经费：{project.funding}</div>
                </div>
                <div style={{ ...s.projectTag, background: project.typeBg, color: project.typeColor }}>
                  {project.type}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: '#64748b' }}>进度</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#1a3a5c' }}>{project.progress}%</span>
              </div>
              <div style={s.projectProgress}>
                <div style={{ height: '100%', width: `${project.progress}%`, background: project.status === '已完成' ? '#22c55e' : '#3b82f6', borderRadius: 3 }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 论文管理 */}
      {activeTab === 'papers' && (
        <div style={s.card}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>论文标题</th>
                <th style={s.th}>期刊</th>
                <th style={s.th}>年份</th>
                <th style={s.th}>类型</th>
                <th style={s.th}>影响因子</th>
                <th style={s.th}>状态</th>
              </tr>
            </thead>
            <tbody>
              {PAPERS.map((paper) => (
                <tr key={paper.id}>
                  <td style={s.td}>{paper.title}</td>
                  <td style={s.td}>{paper.journal}</td>
                  <td style={s.td}>{paper.year}</td>
                  <td style={s.td}>
                    <span style={{ ...s.projectTag, background: paper.type === 'SCI' ? '#eff6ff' : '#f5f3ff', color: paper.type === 'SCI' ? '#3b82f6' : '#8b5cf6' }}>
                      {paper.type}
                    </span>
                  </td>
                  <td style={s.td}>{paper.impact}</td>
                  <td style={s.td}>
                    <span style={{ ...s.projectTag, background: paper.statusBg, color: paper.statusColor }}>
                      {paper.status}
                    </span>
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
          <div style={s.cardGrid}>
            <div style={s.chartCard}>
              <div style={s.chartTitle}><TrendingUp size={16} style={s.chartIcon} /> 科研趋势（近5年）</div>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={RESEARCH_TREND}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip {...trendTooltip} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="papers" stroke="#3b82f6" strokeWidth={2} name="论文数" dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="projects" stroke="#22c55e" strokeWidth={2} name="项目数" dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="funding" stroke="#f97316" strokeWidth={2} name="经费(万)" dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div style={s.chartCard}>
              <div style={s.chartTitle}><PieChartIcon size={16} style={s.chartIcon} /> 研究领域分布</div>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={FIELD_DISTRIBUTION} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {FIELD_DISTRIBUTION.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div style={s.chartCard}>
            <div style={s.chartTitle}><BarChart3 size={16} style={s.chartIcon} /> 科研能力雷达图</div>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={RADAR_DATA}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: '#64748b' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Radar name="科研能力" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                <Tooltip {...trendTooltip} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}
