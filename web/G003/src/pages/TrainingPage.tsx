// @ts-nocheck
// ============================================================
// G003 超声RIS系统 - 培训管理页面
// 技能培训 / 考核管理 / 学习资源 / 培训记录
// ============================================================
import { useState } from 'react'
import {
  Search, Plus, Filter, Download, Users, Play,
  BarChart3, TrendingUp, Calendar, Clock, CheckCircle,
  ChevronRight, BookOpen, Award, Video, FileText,
  Star, Target, GraduationCap, BookMarked
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
  // 课程卡片
  courseCard: {
    background: '#fff', borderRadius: 12, padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 12,
    display: 'flex', gap: 16,
  },
  courseThumb: {
    width: 120, height: 80, borderRadius: 8, background: '#eff6ff',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  courseInfo: { flex: 1, minWidth: 0 },
  courseTitle: { fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 4 },
  courseDesc: { fontSize: 12, color: '#64748b', marginBottom: 8 },
  courseMeta: { display: 'flex', gap: 16, fontSize: 11, color: '#94a3b8' },
  courseTag: {
    fontSize: 10, fontWeight: 600, padding: '3px 10px',
    borderRadius: 8, flexShrink: 0,
  },
  // 考核卡片
  examCard: {
    background: '#fff', borderRadius: 12, padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 12,
  },
  examHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12,
  },
  examTitle: { fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 4 },
  examDesc: { fontSize: 12, color: '#64748b', marginBottom: 12 },
  examMeta: { display: 'flex', gap: 16, fontSize: 11, color: '#94a3b8' },
  examProgress: { height: 6, borderRadius: 3, background: '#e2e8f0', overflow: 'hidden', marginTop: 12 },
  // 资源卡片
  resourceCard: {
    background: '#fff', borderRadius: 12, padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex',
    flexDirection: 'column', alignItems: 'center', gap: 12, cursor: 'pointer',
  },
  resourceIcon: {
    width: 56, height: 56, borderRadius: 12, display: 'flex',
    alignItems: 'center', justifyContent: 'center',
  },
  resourceTitle: { fontSize: 13, fontWeight: 600, color: '#1a3a5c', textAlign: 'center' },
  resourceCount: { fontSize: 11, color: '#94a3b8' },
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
  btnSuccess: {
    padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
    fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6,
    background: '#22c55e', color: '#fff', transition: 'all 0.2s',
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
  contentStyle: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 },
  labelStyle: { color: '#1a3a5c', fontWeight: 600 },
}

// 课程数据
const COURSES = [
  { id: 1, title: '超声基础知识培训', desc: '超声波物理原理、仪器调节、图像优化', teacher: '张华教授', hours: 20, students: 45, progress: 100, type: '必修', typeBg: '#fef2f2', typeColor: '#ef4444' },
  { id: 2, title: '腹部超声诊断技术', desc: '肝胆胰脾超声检查要点与常见病变', teacher: '李明主任', hours: 30, students: 38, progress: 75, type: '必修', typeBg: '#fef2f2', typeColor: '#ef4444' },
  { id: 3, title: '心血管超声检查', desc: '心脏超声标准化切面与测量', teacher: '王芳副教授', hours: 25, students: 30, progress: 45, type: '选修', typeBg: '#eff6ff', typeColor: '#3b82f6' },
  { id: 4, title: '浅表器官超声诊断', desc: '甲状腺、乳腺等浅表器官超声检查', teacher: '刘涛主治', hours: 18, students: 42, progress: 20, type: '选修', typeBg: '#eff6ff', typeColor: '#3b82f6' },
]

// 考核数据
const EXAMS = [
  { id: 1, title: '超声基础理论考核', desc: '考核超声波物理基础理论知识', date: '2024-12-15', duration: 90, score: 85, status: '已完成', statusBg: '#f0fdf4', statusColor: '#22c55e' },
  { id: 2, title: '腹部超声操作考核', desc: '模拟患者腹部超声检查操作', date: '2024-12-20', duration: 60, score: null, status: '待考核', statusBg: '#fff7ed', statusColor: '#f97316' },
  { id: 3, title: '心脏超声诊断考核', desc: '心脏疾病超声诊断能力测评', date: '2025-01-10', duration: 120, score: null, status: '未开始', statusBg: '#f5f3ff', statusColor: '#8b5cf6' },
]

// 学习趋势
const LEARNING_TREND = [
  { month: '1月', hours: 12, courses: 2 },
  { month: '2月', hours: 18, courses: 3 },
  { month: '3月', hours: 25, courses: 4 },
  { month: '4月', hours: 22, courses: 3 },
  { month: '5月', hours: 30, courses: 5 },
  { month: '6月', hours: 28, courses: 4 },
]

// 学习类型分布
const LEARNING_TYPE_DIST = [
  { name: '视频课程', value: 45 },
  { name: '实操培训', value: 30 },
  { name: '理论学习', value: 15 },
  { name: '考核测评', value: 10 },
]

// 资源数据
const RESOURCES = [
  { icon: Video, bg: '#eff6ff', color: '#3b82f6', title: '视频课程', count: 128 },
  { icon: FileText, bg: '#f0fdf4', color: '#22c55e', title: '学习资料', count: 256 },
  { icon: BookOpen, bg: '#fff7ed', color: '#f97316', title: '电子书', count: 45 },
  { icon: Award, bg: '#f5f3ff', color: '#8b5cf6', title: '证书', count: 12 },
]

export default function TrainingPage() {
  const [activeTab, setActiveTab] = useState('courses')
  const [searchText, setSearchText] = useState('')

  return (
    <div style={s.root}>
      {/* 标题 */}
      <div style={s.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={s.title}>培训管理</h1>
            <p style={s.subtitle}>技能培训 · 考核管理 · 学习资源 · 培训记录</p>
          </div>
          <div style={s.headerRight}>
            <button style={s.btnOutline}><Download size={14} /> 导出记录</button>
            <button style={s.btnPrimary}><Plus size={14} /> 新建课程</button>
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div style={s.statRow}>
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, background: '#eff6ff' }}>
            <GraduationCap size={22} color="#3b82f6" />
          </div>
          <div style={s.statInfo}>
            <div style={s.statValue}>24</div>
            <div style={s.statLabel}>培训课程</div>
            <div style={s.statTrend}><TrendingUp size={11} /> +5</div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, background: '#f0fdf4' }}>
            <Users size={22} color="#22c55e" />
          </div>
          <div style={s.statInfo}>
            <div style={s.statValue}>156</div>
            <div style={s.statLabel}>培训人次</div>
            <div style={s.statTrend}><TrendingUp size={11} /> +23</div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, background: '#fff7ed' }}>
            <Clock size={22} color="#f97316" />
          </div>
          <div style={s.statInfo}>
            <div style={s.statValue}>380h</div>
            <div style={s.statLabel}>总学习时长</div>
            <div style={s.statTrend}><TrendingUp size={11} /> +45h</div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, background: '#f5f3ff' }}>
            <Award size={22} color="#8b5cf6" />
          </div>
          <div style={s.statInfo}>
            <div style={s.statValue}>42</div>
            <div style={s.statLabel}>获得证书</div>
            <div style={s.statTrend}><TrendingUp size={11} /> +8</div>
          </div>
        </div>
      </div>

      {/* 搜索栏 */}
      <div style={s.searchBar}>
        <input
          style={s.searchInput}
          placeholder="搜索课程、考核..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <button style={s.btnOutline}><Filter size={14} /> 筛选</button>
      </div>

      {/* 标签页 */}
      <div style={s.tabs}>
        {['courses', 'exams', 'resources', 'statistics'].map((tab) => (
          <div
            key={tab}
            style={activeTab === tab ? s.tabActive : s.tab}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'courses' ? '培训课程' : tab === 'exams' ? '考核管理' : tab === 'resources' ? '学习资源' : '统计分析'}
          </div>
        ))}
      </div>

      {/* 培训课程 */}
      {activeTab === 'courses' && (
        <div>
          {COURSES.map((course) => (
            <div key={course.id} style={s.courseCard}>
              <div style={{ ...s.courseThumb, background: course.typeBg }}>
                <Play size={24} color={course.typeColor} />
              </div>
              <div style={s.courseInfo}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={s.courseTitle}>{course.title}</div>
                    <div style={s.courseDesc}>{course.desc}</div>
                  </div>
                  <div style={{ ...s.courseTag, background: course.typeBg, color: course.typeColor }}>
                    {course.type}
                  </div>
                </div>
                <div style={s.courseMeta}>
                  <span>讲师：{course.teacher}</span>
                  <span>学时：{course.hours}h</span>
                  <span>学员：{course.students}人</span>
                </div>
                {course.progress < 100 && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 11, color: '#64748b' }}>学习进度</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#1a3a5c' }}>{course.progress}%</span>
                    </div>
                    <div style={s.examProgress}>
                      <div style={{ height: '100%', width: `${course.progress}%`, background: '#3b82f6', borderRadius: 3 }} />
                    </div>
                  </div>
                )}
                {course.progress === 100 && (
                  <div style={{ marginTop: 8 }}>
                    <span style={{ ...s.courseTag, background: '#f0fdf4', color: '#22c55e' }}>
                      <CheckCircle size={12} style={{ marginRight: 4 }} /> 已完成
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 考核管理 */}
      {activeTab === 'exams' && (
        <div>
          {EXAMS.map((exam) => (
            <div key={exam.id} style={s.examCard}>
              <div style={s.examHeader}>
                <div style={{ flex: 1 }}>
                  <div style={s.examTitle}>{exam.title}</div>
                  <div style={s.examDesc}>{exam.desc}</div>
                </div>
                <div style={{ ...s.courseTag, background: exam.statusBg, color: exam.statusColor }}>
                  {exam.status}
                </div>
              </div>
              <div style={s.examMeta}>
                <span>考核日期：{exam.date}</span>
                <span>时长：{exam.duration}分钟</span>
                {exam.score !== null && <span>得分：{exam.score}分</span>}
              </div>
              {exam.status === '待考核' && (
                <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                  <button style={s.btnSuccess}><Play size={14} /> 开始考核</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 学习资源 */}
      {activeTab === 'resources' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {RESOURCES.map((res, idx) => (
            <div key={idx} style={s.resourceCard}>
              <div style={{ ...s.resourceIcon, background: res.bg }}>
                <res.icon size={24} color={res.color} />
              </div>
              <div style={s.resourceTitle}>{res.title}</div>
              <div style={s.resourceCount}>{res.count} 个</div>
            </div>
          ))}
        </div>
      )}

      {/* 统计分析 */}
      {activeTab === 'statistics' && (
        <div>
          <div style={s.chartCard}>
            <div style={s.chartTitle}><TrendingUp size={16} style={s.chartIcon} /> 学习时长趋势</div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={LEARNING_TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip {...trendTooltip} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="hours" fill="#3b82f6" name="学习时长(h)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={s.chartCard}>
            <div style={s.chartTitle}><BarChart3 size={16} style={s.chartIcon} /> 学习类型分布</div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={LEARNING_TYPE_DIST} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {LEARNING_TYPE_DIST.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
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
