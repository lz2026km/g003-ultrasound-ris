// @ts-nocheck
// ============================================================
// G003 超声RIS系统 - 随访管理页面
// 随访记录 / 随访计划 / 患者追踪 / 数据统计
// ============================================================
import { useState } from 'react'
import { useNavigate as useNavigateRouter } from 'react-router-dom'
import {
  UserCheck, Clock, Bell, Search, Filter, Plus, ChevronRight,
  Phone, MessageSquare, Mail, Calendar, AlertCircle, CheckCircle,
  XCircle, TrendingUp, TrendingDown, Eye, Edit, Trash2,
  Download, Upload, RefreshCw, MoreHorizontal, User
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from 'recharts'

// ---------- 样式 ----------
const s: Record<string, React.CSSProperties> = {
  root: { padding: 0 },
  header: { marginBottom: 24 },
  title: { fontSize: 20, fontWeight: 700, color: '#1a3a5c', margin: 0 },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 4 },
  headerRight: { display: 'flex', gap: 8, marginTop: 8 },
  // 操作按钮
  btnPrimary: {
    padding: '8px 16px', borderRadius: 8, border: 'none',
    background: '#3b82f6', color: '#fff', cursor: 'pointer',
    fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
  },
  btnSecondary: {
    padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0',
    background: '#fff', cursor: 'pointer', fontSize: 13, display: 'flex',
    alignItems: 'center', gap: 6,
  },
  // 统计卡片
  statRow: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24,
  },
  statCard: {
    background: '#fff', borderRadius: 12, padding: '20px 24px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex',
    alignItems: 'center', gap: 16,
  },
  statIconWrap: {
    width: 52, height: 52, borderRadius: 12, display: 'flex',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  statInfo: { flex: 1, minWidth: 0 },
  statValue: { fontSize: 28, fontWeight: 700, color: '#1a3a5c', lineHeight: 1.2 },
  statLabel: { fontSize: 12, color: '#64748b', marginTop: 4 },
  statTrend: { fontSize: 11, marginTop: 6, display: 'flex', alignItems: 'center', gap: 2 },
  // 筛选栏
  filterBar: {
    background: '#fff', borderRadius: 12, padding: '16px 20px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 16,
    display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
  },
  searchInput: {
    flex: 1, minWidth: 200, padding: '8px 12px', borderRadius: 8,
    border: '1px solid #e2e8f0', fontSize: 13, outline: 'none',
  },
  selectInput: {
    padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0',
    fontSize: 13, background: '#fff', cursor: 'pointer', minWidth: 120,
  },
  // 表格
  tableCard: {
    background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    overflow: 'hidden',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600,
    color: '#64748b', background: '#f8fafc', borderBottom: '1px solid #e2e8f0',
  },
  td: {
    padding: '14px 16px', fontSize: 13, color: '#1a3a5c',
    borderBottom: '1px solid #f1f5f9',
  },
  // 状态标签
  statusBadge: {
    fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 10,
    display: 'inline-block',
  },
  // 分页
  pagination: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '16px 20px', borderTop: '1px solid #f1f5f9',
  },
  pageInfo: { fontSize: 13, color: '#64748b' },
  pageButtons: { display: 'flex', gap: 4 },
  pageBtn: {
    padding: '6px 12px', borderRadius: 6, border: '1px solid #e2e8f0',
    background: '#fff', cursor: 'pointer', fontSize: 13,
  },
  pageBtnActive: {
    padding: '6px 12px', borderRadius: 6, border: 'none',
    background: '#3b82f6', color: '#fff', cursor: 'pointer', fontSize: 13,
  },
  // 颜色
  blue: { backgroundColor: '#eff6ff', color: '#3b82f6' },
  green: { backgroundColor: '#f0fdf4', color: '#22c55e' },
  orange: { backgroundColor: '#fff7ed', color: '#f97316' },
  red: { backgroundColor: '#fef2f2', color: '#ef4444' },
  purple: { backgroundColor: '#f5f3ff', color: '#8b5cf6' },
  teal: { backgroundColor: '#f0fdfa', color: '#14b8a6' },
}

// ---------- 常量数据 ----------
const FOLLOWUP_STATUS = [
  { label: '待随访', count: 12, color: '#f97316', bg: '#fff7ed' },
  { label: '进行中', count: 28, color: '#3b82f6', bg: '#eff6ff' },
  { label: '已完成', count: 156, color: '#22c55e', bg: '#f0fdf4' },
  { label: '超时未访', count: 5, color: '#ef4444', bg: '#fef2f2' },
]

const STATUS_OPTIONS = [
  { value: 'pending', label: '待随访', color: '#f97316', bg: '#fff7ed' },
  { value: 'in_progress', label: '进行中', color: '#3b82f6', bg: '#eff6ff' },
  { value: 'completed', label: '已完成', color: '#22c55e', bg: '#f0fdf4' },
  { value: 'overdue', label: '超时未访', color: '#ef4444', bg: '#fef2f2' },
]

const TABLE_DATA = [
  { id: 'F001', patientName: '张三', patientId: 'P10001', examType: '腹部彩超', followupDate: '2026-04-20', nextDate: '2026-05-20', status: 'completed', doctor: '李医生', result: '恢复良好' },
  { id: 'F002', patientName: '李四', patientId: 'P10002', examType: '心脏彩超', followupDate: '2026-04-22', nextDate: '2026-05-22', status: 'in_progress', doctor: '王医生', result: '随访中' },
  { id: 'F003', patientName: '王五', patientId: 'P10003', examType: '甲状腺', followupDate: '2026-04-25', nextDate: '2026-05-25', status: 'pending', doctor: '赵医生', result: '-' },
  { id: 'F004', patientName: '赵六', patientId: 'P10004', examType: '乳腺彩超', followupDate: '2026-04-18', nextDate: '2026-04-28', status: 'overdue', doctor: '孙医生', result: '失访' },
  { id: 'F005', patientName: '钱七', patientId: 'P10005', examType: '血管彩超', followupDate: '2026-04-28', nextDate: '2026-05-28', status: 'pending', doctor: '刘医生', result: '-' },
]

const MONTHLY_TREND = [
  { month: '1月', 完成数: 45, 新增数: 52 },
  { month: '2月', 完成数: 38, 新增数: 42 },
  { month: '3月', 完成数: 56, 新增数: 60 },
  { month: '4月', 完成数: 62, 新增数: 58 },
  { month: '5月', 完成数: 70, 新增数: 75 },
  { month: '6月', 完成数: 68, 新增数: 72 },
]

const tooltipStyle = {
  contentStyle: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 },
  labelStyle: { color: '#1a3a5c', fontWeight: 600 },
}

// ---------- 组件 ----------
export default function FollowUpPage() {
  const navigate = useNavigateRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const getStatusStyle = (status: string) => {
    const option = STATUS_OPTIONS.find(s => s.value === status)
    return option ? { background: option.bg, color: option.color } : {}
  }

  const getStatusLabel = (status: string) => {
    return STATUS_OPTIONS.find(s => s.value === status)?.label || status
  }

  const filteredData = TABLE_DATA.filter(item => {
    const matchSearch = item.patientName.includes(searchTerm) || item.patientId.includes(searchTerm)
    const matchStatus = statusFilter === 'all' || item.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div style={s.root}>
      {/* 标题 */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>随访管理</h1>
          <p style={s.subtitle}>
            患者随访跟踪 · 随访计划制定 · 随访数据统计
          </p>
        </div>
        <div style={s.headerRight}>
          <button style={s.btnSecondary}>
            <RefreshCw size={14} color="#64748b" /> 刷新
          </button>
          <button style={s.btnSecondary}>
            <Download size={14} color="#64748b" /> 导出
          </button>
          <button style={s.btnPrimary}>
            <Plus size={14} /> 新建随访
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div style={s.statRow}>
        {FOLLOWUP_STATUS.map((item) => (
          <div key={item.label} style={s.statCard}>
            <div style={{ ...s.statIconWrap, background: item.bg }}>
              <UserCheck size={24} color={item.color} />
            </div>
            <div style={s.statInfo}>
              <div style={s.statValue}>{item.count}</div>
              <div style={s.statLabel}>{item.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 图表 */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 24 }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={16} style={{ color: '#64748b' }} /> 随访趋势
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={MONTHLY_TREND}>
              <defs>
                <linearGradient id="colorComplete" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="完成数" stroke="#22c55e" fill="url(#colorComplete)" strokeWidth={2} />
              <Area type="monotone" dataKey="新增数" stroke="#3b82f6" fill="url(#colorNew)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <PieChart size={16} style={{ color: '#64748b' }} /> 状态分布
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={FOLLOWUP_STATUS}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={75}
                paddingAngle={3}
                dataKey="count"
                nameKey="label"
                label={({ label, percent }) => `${label} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {FOLLOWUP_STATUS.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={['#f97316', '#3b82f6', '#22c55e', '#ef4444'][index]} />
                ))}
              </Pie>
              <Tooltip {...tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 筛选栏 */}
      <div style={s.filterBar}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: 10, color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="搜索患者姓名或ID..."
            style={{ ...s.searchInput, paddingLeft: 36 }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select style={s.selectInput} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">全部状态</option>
          <option value="pending">待随访</option>
          <option value="in_progress">进行中</option>
          <option value="completed">已完成</option>
          <option value="overdue">超时未访</option>
        </select>
        <button style={s.btnSecondary}>
          <Filter size={14} color="#64748b" /> 高级筛选
        </button>
      </div>

      {/* 表格 */}
      <div style={s.tableCard}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>编号</th>
              <th style={s.th}>患者姓名</th>
              <th style={s.th}>患者ID</th>
              <th style={s.th}>检查类型</th>
              <th style={s.th}>随访日期</th>
              <th style={s.th}>下次随访</th>
              <th style={s.th}>负责医生</th>
              <th style={s.th}>状态</th>
              <th style={s.th}>结果</th>
              <th style={s.th}>操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row) => (
              <tr key={row.id}>
                <td style={s.td}>{row.id}</td>
                <td style={{ ...s.td, fontWeight: 600 }}>{row.patientName}</td>
                <td style={s.td}>{row.patientId}</td>
                <td style={s.td}>{row.examType}</td>
                <td style={s.td}>{row.followupDate}</td>
                <td style={s.td}>{row.nextDate}</td>
                <td style={s.td}>{row.doctor}</td>
                <td style={s.td}>
                  <span style={{ ...s.statusBadge, ...getStatusStyle(row.status) }}>
                    {getStatusLabel(row.status)}
                  </span>
                </td>
                <td style={s.td}>{row.result}</td>
                <td style={s.td}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button style={{ padding: 4, border: 'none', background: 'none', cursor: 'pointer' }}>
                      <Eye size={14} color="#64748b" />
                    </button>
                    <button style={{ padding: 4, border: 'none', background: 'none', cursor: 'pointer' }}>
                      <Edit size={14} color="#3b82f6" />
                    </button>
                    <button style={{ padding: 4, border: 'none', background: 'none', cursor: 'pointer' }}>
                      <Phone size={14} color="#22c55e" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* 分页 */}
        <div style={s.pagination}>
          <div style={s.pageInfo}>共 {filteredData.length} 条记录</div>
          <div style={s.pageButtons}>
            <button style={s.pageBtn}>上一页</button>
            <button style={s.pageBtnActive}>1</button>
            <button style={s.pageBtn}>2</button>
            <button style={s.pageBtn}>3</button>
            <button style={s.pageBtn}>下一页</button>
          </div>
        </div>
      </div>
    </div>
  )
}
