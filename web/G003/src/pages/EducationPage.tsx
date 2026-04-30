// @ts-nocheck
// ============================================================
// G003 超声RIS系统 - 继续教育页面
// 学术会议 / 培训课程 / 学术交流 / 学分管理
// ============================================================
import { useState } from 'react'
import {
  Search, Plus, Filter, Download, Calendar, Clock,
  MapPin, Users, ChevronRight, BookOpen, Award,
  Video, Mic, Globe, GraduationCap, FileText, Star
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
  searchBar: { display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' },
  searchInput: {
    flex: 1, padding: '10px 16px', border: '1px solid #e2e8f0',
    borderRadius: 10, fontSize: 13, outline: 'none', background: '#fff',
  },
  statRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 },
  statCard: {
    background: '#fff', borderRadius: 12, padding: '20px 24px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex',
    alignItems: 'center', gap: 16,
  },
  statIconWrap: { width: 48, height: 48, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  statInfo: { flex: 1, minWidth: 0 },
  statValue: { fontSize: 26, fontWeight: 700, color: '#1a3a5c', lineHeight: 1.2 },
  statLabel: { fontSize: 12, color: '#64748b', marginTop: 2 },
  statTrend: { fontSize: 11, color: '#22c55e', marginTop: 4, display: 'flex', alignItems: 'center', gap: 2 },
  tabs: { display: 'flex', gap: 4, marginBottom: 20, borderBottom: '2px solid #f1f5f9' },
  tab: { padding: '10px 20px', fontSize: 13, fontWeight: 600, color: '#64748b', cursor: 'pointer', borderBottom: '2px solid transparent', marginBottom: -2, transition: 'all 0.2s' },
  tabActive: { padding: '10px 20px', fontSize: 13, fontWeight: 600, color: '#3b82f6', cursor: 'pointer', borderBottom: '2px solid #3b82f6', marginBottom: -2 },
  // 会议卡片
  confCard: {
    background: '#fff', borderRadius: 12, padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 12,
  },
  confHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  confTitle: { fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 4 },
  confDesc: { fontSize: 12, color: '#64748b', marginBottom: 12 },
  confMeta: { display: 'flex', gap: 16, fontSize: 11, color: '#94a3b8' },
  confTag: { fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 8, flexShrink: 0 },
  // 学分卡片
  creditCard: {
    background: '#fff', borderRadius: 12, padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 12,
    display: 'flex', gap: 20, alignItems: 'center',
  },
  creditIcon: { width: 56, height: 56, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  creditInfo: { flex: 1 },
  creditTitle: { fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 4 },
  creditDesc: { fontSize: 12, color: '#64748b' },
  creditValue: { fontSize: 28, fontWeight: 700, color: '#1a3a5c' },
  // 图表卡片
  chartCard: { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 24 },
  chartTitle: { fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 },
  chartIcon: { color: '#64748b' },
  btn: { padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s' },
  btnPrimary: { padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, background: '#3b82f6', color: '#fff', transition: 'all 0.2s' },
  btnOutline: { padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, background: '#fff', color: '#475569' },
  blue: { backgroundColor: '#eff6ff', color: '#3b82f6' },
  green: { backgroundColor: '#f0fdf4', color: '#22c55e' },
  orange: { backgroundColor: '#fff7ed', color: '#f97316' },
  red: { backgroundColor: '#fef2f2', color: '#ef4444' },
  purple: { backgroundColor: '#f5f3ff', color: '#8b5cf6' },
  teal: { backgroundColor: '#f0fdfa', color: '#14b8a6' },
}

const PIE_COLORS = ['#3b82f6', '#22c55e', '#f97316', '#8b5cf6', '#14b8a6']
const trendTooltip = { contentStyle: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }, labelStyle: { color: '#1a3a5c', fontWeight: 600 } }

// 会议数据
const CONFERENCES = [
  { id: 1, title: '2024年全国超声医学学术年会', desc: '超声造影新技术与临床应用研讨', date: '2024-10-15', location: '北京国际会议中心', type: '国家级', credit: 8, status: '报名中', statusBg: '#f0fdf4', statusColor: '#22c55e' },
  { id: 2, title: '心血管超声规范化培训课程', desc: '心脏超声标准化操作与诊断要点', date: '2024-11-01', location: '上海交通大学医学院', type: '省级', credit: 6, status: '报名中', statusBg: '#f0fdf4', statusColor: '#22c55e' },
  { id: 3, title: '浅表器官超声诊断新技术学习班', desc: '甲状腺、乳腺弹性成像应用', date: '2024-09-20', location: '广州中山大学附属医院', type: '市级', credit: 4, status: '已完成', statusBg: '#f5f3ff', statusColor: '#8b5cf6' },
  { id: 4, title: '腹部超声介入治疗工作坊', desc: '超声引导下穿刺活检与治疗技术', date: '2024-08-10', location: '杭州邵逸夫医院', type: '院级', credit: 5, status: '已完成', statusBg: '#f5f3ff', statusColor: '#8b5cf6' },
]

// 学分记录
const CREDIT_RECORDS = [
  { id: 1, title: '全国超声医学学术年会', type: '学术会议', date: '2024-10-15', credit: 8, icon: Globe, bg: '#eff6ff', color: '#3b82f6' },
  { id: 2, title: '心血管超声规范化培训', type: '培训课程', date: '2024-11-01', credit: 6, icon: GraduationCap, bg: '#f0fdf4', color: '#22c55e' },
  { id: 3, title: '腹部超声诊断新技术', type: '在线学习', date: '2024-09-15', credit: 4, icon: Video, bg: '#fff7ed', color: '#f97316' },
  { id: 4, title: '科室疑难病例讨论', type: '学术交流', date: '2024-08-20', credit: 2, icon: Users, bg: '#f5f3ff', color: '#8b5cf6' },
]

// 学分趋势
const CREDIT_TREND = [
  { month: '1月', credit: 6, count: 2 },
  { month: '2月', credit: 8, count: 3 },
  { month: '3月', credit: 12, count: 4 },
  { month: '4月', credit: 10, count: 3 },
  { month: '5月', credit: 15, count: 5 },
  { month: '6月', credit: 14, count: 4 },
]

// 学分来源分布
const CREDIT_SOURCE = [
  { name: '学术会议', value: 35 },
  { name: '培训课程', value: 30 },
  { name: '在线学习', value: 20 },
  { name: '学术交流', value: 15 },
]

export default function EducationPage() {
  const [activeTab, setActiveTab] = useState('conferences')
  const [searchText, setSearchText] = useState('')

  return (
    <div style={s.root}>
      {/* 标题 */}
      <div style={s.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={s.title}>继续教育</h1>
            <p style={s.subtitle}>学术会议 · 培训课程 · 学分管理 · 学术交流</p>
          </div>
          <div style={s.headerRight}>
            <button style={s.btnOutline}><Download size={14} /> 导出学分</button>
            <button style={s.btnPrimary}><Plus size={14} /> 报名会议</button>
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div style={s.statRow}>
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, background: '#eff6ff' }}><Globe size={22} color="#3b82f6" /></div>
          <div style={s.statInfo}>
            <div style={s.statValue}>18</div>
            <div style={s.statLabel}>参加学术会议</div>
            <div style={s.statTrend}>今年新增 +5</div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, background: '#f0fdf4' }}><GraduationCap size={22} color="#22c55e" /></div>
          <div style={s.statInfo}>
            <div style={s.statValue}>56</div>
            <div style={s.statLabel}>获得学分</div>
            <div style={s.statTrend}>已完成年度 70%</div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, background: '#fff7ed' }}><BookOpen size={22} color="#f97316" /></div>
          <div style={s.statInfo}>
            <div style={s.statValue}>32</div>
            <div style={s.statLabel}>培训课程</div>
            <div style={s.statTrend}>本年新增 +8</div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, background: '#f5f3ff' }}><Award size={22} color="#8b5cf6" /></div>
          <div style={s.statInfo}>
            <div style={s.statValue}>12</div>
            <div style={s.statLabel}>获得证书</div>
            <div style={s.statTrend}>本年新增 +3</div>
          </div>
        </div>
      </div>

      {/* 搜索栏 */}
      <div style={s.searchBar}>
        <input style={s.searchInput} placeholder="搜索会议、课程..." value={searchText} onChange={(e) => setSearchText(e.target.value)} />
        <button style={s.btnOutline}><Filter size={14} /> 筛选</button>
      </div>

      {/* 标签页 */}
      <div style={s.tabs}>
        {['conferences', 'credits', 'statistics'].map((tab) => (
          <div key={tab} style={activeTab === tab ? s.tabActive : s.tab} onClick={() => setActiveTab(tab)}>
            {tab === 'conferences' ? '学术会议' : tab === 'credits' ? '学分管理' : '统计分析'}
          </div>
        ))}
      </div>

      {/* 学术会议 */}
      {activeTab === 'conferences' && (
        <div>
          {CONFERENCES.map((conf) => (
            <div key={conf.id} style={s.confCard}>
              <div style={s.confHeader}>
                <div style={{ flex: 1 }}>
                  <div style={s.confTitle}>{conf.title}</div>
                  <div style={s.confDesc}>{conf.desc}</div>
                </div>
                <div style={{ ...s.confTag, background: conf.statusBg, color: conf.statusColor }}>{conf.status}</div>
              </div>
              <div style={s.confMeta}>
                <span><Calendar size={12} style={{ marginRight: 4 }} />{conf.date}</span>
                <span><MapPin size={12} style={{ marginRight: 4 }} />{conf.location}</span>
                <span><Award size={12} style={{ marginRight: 4 }} />{conf.credit}学分</span>
                <span style={{ ...s.confTag, background: conf.type === '国家级' ? '#fef2f2' : conf.type === '省级' ? '#eff6ff' : '#f5f3ff', color: conf.type === '国家级' ? '#ef4444' : conf.type === '省级' ? '#3b82f6' : '#8b5cf6' }}>{conf.type}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 学分管理 */}
      {activeTab === 'credits' && (
        <div>
          {CREDIT_RECORDS.map((record) => (
            <div key={record.id} style={s.creditCard}>
              <div style={{ ...s.creditIcon, background: record.bg }}>
                <record.icon size={24} color={record.color} />
              </div>
              <div style={s.creditInfo}>
                <div style={s.creditTitle}>{record.title}</div>
                <div style={s.creditDesc}>{record.type} | {record.date}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 2 }}>获得学分</div>
                <div style={{ ...s.creditValue, color: record.color }}>+{record.credit}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 统计分析 */}
      {activeTab === 'statistics' && (
        <div>
          <div style={s.chartCard}>
            <div style={s.chartTitle}><Award size={16} style={s.chartIcon} /> 学分获取趋势</div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={CREDIT_TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip {...trendTooltip} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="credit" fill="#3b82f6" name="学分" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={s.chartCard}>
            <div style={s.chartTitle}><BookOpen size={16} style={s.chartIcon} /> 学分来源分布</div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={CREDIT_SOURCE} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {CREDIT_SOURCE.map((_, index) => (<Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}
