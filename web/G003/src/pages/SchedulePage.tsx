// @ts-nocheck
// ============================================================
// G003 超声RIS系统 - 日程安排页面
// 预约管理 / 检查排程 / 日历视图 / 时间表管理
// ============================================================
import { useState } from 'react'
import { useNavigate as useNavigateRouter } from 'react-router-dom'
import {
  Calendar, Clock, User, Stethoscope, Plus, Search, Filter,
  ChevronLeft, ChevronRight, CalendarClock, CheckCircle,
  AlertCircle, X, Edit2, Trash2, RefreshCw, Video,
  Phone, MapPin, Bell, Download, Upload, FileText
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { initialStatisticsData } from '../data/initialData'

// ---------- 样式 ----------
const s: Record<string, React.CSSProperties> = {
  root: { padding: 0 },
  header: { marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 700, color: '#1a3a5c', margin: 0 },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 4 },
  headerRight: { display: 'flex', gap: 8 },
  // 操作按钮
  btn: {
    padding: '8px 16px', borderRadius: 8, border: 'none',
    cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex',
    alignItems: 'center', gap: 6, transition: 'all 0.2s',
  },
  btnPrimary: { background: '#3b82f6', color: '#fff' },
  btnSecondary: { background: '#f1f5f9', color: '#475569' },
  btnDanger: { background: '#fef2f2', color: '#ef4444' },
  // 搜索栏
  searchBar: {
    display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap',
  },
  searchInput: {
    flex: 1, minWidth: 200, padding: '10px 14px', borderRadius: 8,
    border: '1px solid #e2e8f0', fontSize: 13, outline: 'none',
  },
  filterSelect: {
    padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0',
    fontSize: 13, outline: 'none', background: '#fff', minWidth: 140,
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
  statTrend: { fontSize: 11, color: '#22c55e', marginTop: 4, display: 'flex', alignItems: 'center', gap: 2 },
  // 日历卡片
  calendarCard: {
    background: '#fff', borderRadius: 12, padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 24,
  },
  calendarHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20,
  },
  calendarTitle: { fontSize: 16, fontWeight: 600, color: '#1a3a5c', display: 'flex', alignItems: 'center', gap: 8 },
  calendarNav: { display: 'flex', gap: 8 },
  calendarNavBtn: {
    width: 32, height: 32, borderRadius: 8, border: '1px solid #e2e8f0',
    background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center',
    justifyContent: 'center', transition: 'all 0.2s',
  },
  calendarGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, textAlign: 'center',
  },
  calendarDayHeader: {
    fontSize: 11, fontWeight: 600, color: '#94a3b8', padding: '8px 0',
  },
  calendarDay: {
    padding: '10px 4px', borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s',
    fontSize: 13, minHeight: 70,
  },
  calendarDayNum: { fontSize: 14, fontWeight: 600, marginBottom: 4 },
  calendarDayOther: { color: '#cbd5e1' },
  calendarDayToday: { background: '#eff6ff' },
  calendarDaySelected: { background: '#3b82f6', color: '#fff' },
  // 预约列表
  appointmentList: {
    background: '#fff', borderRadius: 12, padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 24,
  },
  listHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16,
  },
  listTitle: { fontSize: 14, fontWeight: 600, color: '#1a3a5c', display: 'flex', alignItems: 'center', gap: 8 },
  appointmentItem: {
    display: 'flex', gap: 16, padding: '16px 0',
    borderBottom: '1px solid #f1f5f9', alignItems: 'center',
  },
  appointmentTime: {
    minWidth: 80, textAlign: 'center', padding: '8px 12px',
    borderRadius: 8, background: '#f8fafc',
  },
  appointmentTimeValue: { fontSize: 15, fontWeight: 700, color: '#1a3a5c' },
  appointmentTimeLabel: { fontSize: 10, color: '#94a3b8' },
  appointmentInfo: { flex: 1 },
  appointmentPatient: { fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 4 },
  appointmentDetail: { fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 12 },
  appointmentBadge: {
    fontSize: 11, fontWeight: 600, padding: '4px 10px',
    borderRadius: 12, flexShrink: 0,
  },
  appointmentActions: { display: 'flex', gap: 8 },
  actionBtn: {
    width: 32, height: 32, borderRadius: 8, border: '1px solid #e2e8f0',
    background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center',
    justifyContent: 'center', transition: 'all 0.2s',
  },
  // 时间分布图表
  chartCard: {
    background: '#fff', borderRadius: 12, padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 24,
  },
  chartTitle: {
    fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 16,
    display: 'flex', alignItems: 'center', gap: 6,
  },
  chartIcon: { color: '#64748b' },
  // 颜色
  blue: { backgroundColor: '#eff6ff', color: '#3b82f6' },
  green: { backgroundColor: '#f0fdf4', color: '#22c55e' },
  orange: { backgroundColor: '#fff7ed', color: '#f97316' },
  red: { backgroundColor: '#fef2f2', color: '#ef4444' },
  purple: { backgroundColor: '#f5f3ff', color: '#8b5cf6' },
  teal: { backgroundColor: '#f0fdfa', color: '#14b8a6' },
}

const PIE_COLORS = ['#3b82f6', '#22c55e', '#f97316', '#8b5cf6', '#14b8a6']

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

const MOCK_APPOINTMENTS = [
  { id: 1, time: '08:00', patient: '张三', age: 45, gender: '男', examType: '腹部超声', device: '彩超仪 A', status: 'completed', doctor: '李明辉' },
  { id: 2, time: '09:00', patient: '李红', age: 32, gender: '女', examType: '心血管超声', device: '彩超仪 B', status: 'completed', doctor: '李明辉' },
  { id: 3, time: '10:00', patient: '王五', age: 58, gender: '男', examType: '甲状腺超声', device: '彩超仪 A', status: 'in_progress', doctor: '王芳' },
  { id: 4, time: '11:00', patient: '赵丽', age: 28, gender: '女', examType: '产科超声', device: '彩超仪 C', status: 'scheduled', doctor: '李明辉' },
  { id: 5, time: '14:00', patient: '孙伟', age: 62, gender: '男', examType: '血管超声', device: '彩超仪 B', status: 'scheduled', doctor: '王芳' },
  { id: 6, time: '15:00', patient: '周八', age: 41, gender: '女', examType: '乳腺超声', device: '彩超仪 A', status: 'scheduled', doctor: '李明辉' },
  { id: 7, time: '16:00', patient: '吴九', age: 55, gender: '男', examType: '腹部超声', device: '彩超仪 C', status: 'scheduled', doctor: '王芳' },
  { id: 8, time: '17:00', patient: '郑十', age: 37, gender: '女', examType: '心脏超声', device: '彩超仪 B', status: 'scheduled', doctor: '李明辉' },
]

const STATUS_COLORS: Record<string, { bg: string, color: string, label: string }> = {
  completed: { bg: '#f0fdf4', color: '#22c55e', label: '已完成' },
  in_progress: { bg: '#eff6ff', color: '#3b82f6', label: '进行中' },
  scheduled: { bg: '#f5f3ff', color: '#8b5cf6', label: '已预约' },
  cancelled: { bg: '#fef2f2', color: '#ef4444', label: '已取消' },
}

const EXAM_TYPE_COLORS: Record<string, string> = {
  '腹部超声': '#3b82f6',
  '心血管超声': '#22c55e',
  '甲状腺超声': '#f97316',
  '产科超声': '#8b5cf6',
  '血管超声': '#14b8a6',
  '乳腺超声': '#ec4899',
  '心脏超声': '#ef4444',
}

const TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00']

export default function SchedulePage() {
  const navigate = useNavigateRouter()
  const stats = initialStatisticsData
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week')

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const startingDayOfWeek = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))
  const goToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }

  const getDaysArray = () => {
    const days: { date: Date, isCurrentMonth: boolean }[] = []
    // Previous month days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({ date: new Date(year, month, -i), isCurrentMonth: false })
    }
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true })
    }
    // Next month days to fill grid
    const remaining = 42 - days.length
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false })
    }
    return days
  }

  const isToday = (date: Date) => {
    const t = new Date()
    return date.getDate() === t.getDate() &&
      date.getMonth() === t.getMonth() &&
      date.getFullYear() === t.getFullYear()
  }

  const isSelected = (date: Date) => {
    return date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
  }

  const filteredAppointments = MOCK_APPOINTMENTS.filter(apt => {
    const matchesSearch = apt.patient.includes(searchTerm) || apt.examType.includes(searchTerm)
    const matchesStatus = filterStatus === 'all' || apt.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const chartData = TIME_SLOTS.map(slot => {
    const count = MOCK_APPOINTMENTS.filter(apt => apt.time === slot).length
    return { time: slot, 预约数: count }
  })

  const examTypeData = Object.entries(
    MOCK_APPOINTMENTS.reduce((acc, apt) => {
      acc[apt.examType] = (acc[apt.examType] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }))

  const tooltipStyle = {
    contentStyle: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 },
    labelStyle: { color: '#1a3a5c', fontWeight: 600 },
  }

  return (
    <div style={s.root}>
      {/* 标题 */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>日程安排</h1>
          <p style={s.subtitle}>检查预约管理 · 排程日历 · 时间表</p>
        </div>
        <div style={s.headerRight}>
          <button style={{ ...s.btn, ...s.btnSecondary }} onClick={goToday}>
            <Calendar size={14} /> 回到今天
          </button>
          <button style={{ ...s.btn, ...s.btnPrimary }} onClick={() => navigate('/appointments')}>
            <Plus size={14} /> 新增预约
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div style={s.statRow}>
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, background: '#eff6ff' }}>
            <CalendarClock size={22} color="#3b82f6" />
          </div>
          <div style={s.statInfo}>
            <div style={s.statValue}>{MOCK_APPOINTMENTS.length}</div>
            <div style={s.statLabel}>今日预约</div>
            <div style={s.statTrend}><CheckCircle size={11} /> 2已完成</div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, background: '#f5f3ff' }}>
            <Clock size={22} color="#8b5cf6" />
          </div>
          <div style={s.statInfo}>
            <div style={s.statValue}>6</div>
            <div style={s.statLabel}>待检查</div>
            <div style={{ fontSize: 11, color: '#8b5cf6', marginTop: 4 }}>本周</div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, background: '#fff7ed' }}>
            <AlertCircle size={22} color="#f97316" />
          </div>
          <div style={s.statInfo}>
            <div style={s.statValue}>1</div>
            <div style={s.statLabel}>迟到</div>
            <div style={{ fontSize: 11, color: '#f97316', marginTop: 4 }}>需关注</div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, background: '#f0fdf4' }}>
            <CheckCircle size={22} color="#22c55e" />
          </div>
          <div style={s.statInfo}>
            <div style={s.statValue}>2</div>
            <div style={s.statLabel}>已完成</div>
            <div style={s.statTrend}><RefreshCw size={11} /> 进行中 1</div>
          </div>
        </div>
      </div>

      {/* 搜索筛选 */}
      <div style={s.searchBar}>
        <input
          style={s.searchInput}
          placeholder="搜索患者姓名或检查类型..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select style={s.filterSelect} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">全部状态</option>
          <option value="scheduled">已预约</option>
          <option value="in_progress">进行中</option>
          <option value="completed">已完成</option>
          <option value="cancelled">已取消</option>
        </select>
        <select style={s.filterSelect} defaultValue="all">
          <option value="all">全部设备</option>
          <option value="A">彩超仪 A</option>
          <option value="B">彩超仪 B</option>
          <option value="C">彩超仪 C</option>
        </select>
        <div style={{ display: 'flex', gap: 4 }}>
          {(['day', 'week', 'month'] as const).map(mode => (
            <button
              key={mode}
              style={{
                ...s.btn, ...s.btnSecondary,
                background: viewMode === mode ? '#3b82f6' : '#f1f5f9',
                color: viewMode === mode ? '#fff' : '#475569',
              }}
              onClick={() => setViewMode(mode)}
            >
              {mode === 'day' ? '日' : mode === 'week' ? '周' : '月'}
            </button>
          ))}
        </div>
      </div>

      {/* 日历 */}
      <div style={s.calendarCard}>
        <div style={s.calendarHeader}>
          <div style={s.calendarTitle}>
            <Calendar size={18} />
            {year}年 {month + 1}月
          </div>
          <div style={s.calendarNav}>
            <button style={s.calendarNavBtn} onClick={prevMonth}><ChevronLeft size={16} /></button>
            <button style={s.calendarNavBtn} onClick={goToday}><RefreshCw size={14} /></button>
            <button style={s.calendarNavBtn} onClick={nextMonth}><ChevronRight size={16} /></button>
          </div>
        </div>
        <div style={s.calendarGrid}>
          {WEEKDAYS.map(day => (
            <div key={day} style={s.calendarDayHeader}>{day}</div>
          ))}
          {getDaysArray().map(({ date, isCurrentMonth }, idx) => {
            const todayStyle = isToday(date) ? s.calendarDayToday : {}
            const selectedStyle = isSelected(date) ? s.calendarDaySelected : {}
            return (
              <div
                key={idx}
                style={{
                  ...s.calendarDay,
                  ...(isCurrentMonth ? {} : s.calendarDayOther),
                  ...todayStyle,
                  ...selectedStyle,
                }}
                onClick={() => setSelectedDate(date)}
              >
                <div style={s.calendarDayNum}>{date.getDate()}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 图表行 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div style={s.chartCard}>
          <div style={s.chartTitle}><Clock size={16} style={s.chartIcon} /> 各时段预约分布</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="预约数" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={s.chartCard}>
          <div style={s.chartTitle}><Stethoscope size={16} style={s.chartIcon} /> 检查类型分布</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={examTypeData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {examTypeData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip {...tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 预约列表 */}
      <div style={s.appointmentList}>
        <div style={s.listHeader}>
          <div style={s.listTitle}><Calendar size={16} /> 预约列表</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{ ...s.btn, ...s.btnSecondary }}>
              <Download size={14} /> 导出
            </button>
          </div>
        </div>
        {filteredAppointments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
            <Calendar size={40} style={{ marginBottom: 12, opacity: 0.5 }} />
            <div style={{ fontSize: 14 }}>暂无预约记录</div>
          </div>
        ) : (
          filteredAppointments.map(apt => {
            const status = STATUS_COLORS[apt.status]
            return (
              <div key={apt.id} style={s.appointmentItem}>
                <div style={{ ...s.appointmentTime, background: status.bg }}>
                  <div style={s.appointmentTimeValue}>{apt.time}</div>
                  <div style={s.appointmentTimeLabel}>{status.label}</div>
                </div>
                <div style={s.appointmentInfo}>
                  <div style={s.appointmentPatient}>{apt.patient}</div>
                  <div style={s.appointmentDetail}>
                    <span>{apt.gender} · {apt.age}岁</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Stethoscope size={11} /> {apt.examType}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={11} /> {apt.device}
                    </span>
                  </div>
                </div>
                <div style={{ ...s.appointmentBadge, background: status.bg, color: status.color }}>
                  {status.label}
                </div>
                <div style={s.appointmentActions}>
                  <button style={s.actionBtn} title="编辑"><Edit2 size={14} color="#64748b" /></button>
                  <button style={s.actionBtn} title="取消"><X size={14} color="#ef4444" /></button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
