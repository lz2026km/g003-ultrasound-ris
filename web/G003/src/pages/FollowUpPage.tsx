// @ts-nocheck
// ============================================================
// G003 超声RIS系统 - 随访管理页面 v2.0.0
// 随访计划 / 任务列表 / 记录录入 / 依从性追踪 / 统计图表
// ============================================================
import { useState, useEffect } from 'react'
import { useNavigate as useNavigateRouter } from 'react-router-dom'
import {
  UserCheck, Clock, Bell, Search, Filter, Plus, ChevronRight,
  Phone, MessageSquare, Mail, Calendar, AlertCircle, CheckCircle,
  XCircle, TrendingUp, TrendingDown, Eye, Edit, Trash2,
  Download, Upload, RefreshCw, MoreHorizontal, User,
  ClipboardList, FileText, Activity, AlertTriangle,
  X, Save, Check, ChevronDown, Tab
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts'

// ---------- 样式 ----------
const s: Record<string, React.CSSProperties> = {
  root: { padding: 0 },
  header: { marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
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
    alignItems: 'center', gap: 6, color: '#475569',
  },
  btnDanger: {
    padding: '8px 16px', borderRadius: 8, border: 'none',
    background: '#ef4444', color: '#fff', cursor: 'pointer',
    fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
  },
  btnSuccess: {
    padding: '8px 16px', borderRadius: 8, border: 'none',
    background: '#22c55e', color: '#fff', cursor: 'pointer',
    fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
  },
  // 统计卡片行
  statRow: {
    display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 24,
  },
  statCard: {
    background: '#fff', borderRadius: 12, padding: '18px 20px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex',
    alignItems: 'center', gap: 14,
  },
  statIconWrap: {
    width: 50, height: 50, borderRadius: 12, display: 'flex',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  statInfo: { flex: 1, minWidth: 0 },
  statValue: { fontSize: 26, fontWeight: 700, color: '#1a3a5c', lineHeight: 1.2 },
  statLabel: { fontSize: 12, color: '#64748b', marginTop: 4 },
  statTrend: { fontSize: 11, marginTop: 4, display: 'flex', alignItems: 'center', gap: 2 },
  // 警报横幅
  alertBanner: {
    background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
    border: '1px solid #fecaca', borderRadius: 10, padding: '12px 16px',
    marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12,
  },
  // 筛选栏
  filterBar: {
    background: '#fff', borderRadius: 12, padding: '14px 18px',
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
  // Tab切换
  tabBar: {
    display: 'flex', gap: 4, background: '#f1f5f9', borderRadius: 10, padding: 4, marginBottom: 16,
  },
  tab: {
    flex: 1, padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
    fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    transition: 'all 0.2s',
  },
  tabActive: {
    background: '#fff', color: '#1a3a5c', fontWeight: 600,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  // 表格卡片
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
    padding: '14px 18px', borderTop: '1px solid #f1f5f9',
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
  // 模态框
  modal: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 1000,
  },
  modalContent: {
    background: '#fff', borderRadius: 16, width: 600, maxHeight: '85vh',
    overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  },
  modalHeader: {
    padding: '20px 24px 16px', borderBottom: '1px solid #f1f5f9',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  modalTitle: { fontSize: 16, fontWeight: 700, color: '#1a3a5c', margin: 0 },
  modalBody: { padding: '20px 24px' },
  modalFooter: {
    padding: '16px 24px', borderTop: '1px solid #f1f5f9',
    display: 'flex', justifyContent: 'flex-end', gap: 10,
  },
  // 表单项
  formGroup: { marginBottom: 18 },
  formLabel: { fontSize: 13, fontWeight: 600, color: '#1a3a5c', marginBottom: 6, display: 'block' },
  formInput: {
    width: '100%', padding: '10px 12px', borderRadius: 8,
    border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', boxSizing: 'border-box',
  },
  formSelect: {
    width: '100%', padding: '10px 12px', borderRadius: 8,
    border: '1px solid #e2e8f0', fontSize: 13, background: '#fff', cursor: 'pointer',
  },
  formTextarea: {
    width: '100%', padding: '10px 12px', borderRadius: 8,
    border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', resize: 'vertical', minHeight: 80,
  },
  // 图表区域
  chartRow: {
    display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20,
  },
  chartCard: {
    background: '#fff', borderRadius: 12, padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  chartTitle: {
    fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 16,
    display: 'flex', alignItems: 'center', gap: 8,
  },
  // 依从性进度条
  complianceBar: {
    height: 8, borderRadius: 4, background: '#e2e8f0', overflow: 'hidden',
  },
  complianceFill: { height: '100%', borderRadius: 4, transition: 'width 0.3s' },
  // 患者卡片
  patientCard: {
    background: '#fff', borderRadius: 12, padding: '14px 16px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', cursor: 'pointer',
    transition: 'all 0.2s', border: '2px solid transparent',
  },
}

// ---------- 颜色映射 ----------
const COLORS = {
  blue: { bg: '#eff6ff', color: '#3b82f6' },
  green: { bg: '#f0fdf4', color: '#22c55e' },
  orange: { bg: '#fff7ed', color: '#f97316' },
  red: { bg: '#fef2f2', color: '#ef4444' },
  purple: { bg: '#f5f3ff', color: '#8b5cf6' },
  teal: { bg: '#f0fdfa', color: '#14b8a6' },
  yellow: { bg: '#fefce8', color: '#eab308' },
}

// ---------- Mock 数据：15+ 患者 ----------
const PATIENTS = [
  { id: 'P10001', name: '张三', gender: '男', age: 45, phone: '138****1234', examType: '腹部彩超', diagnosis: '脂肪肝', department: '消化内科' },
  { id: 'P10002', name: '李四', gender: '女', age: 52, phone: '139****5678', examType: '心脏彩超', diagnosis: '心律失常', department: '心内科' },
  { id: 'P10003', name: '王五', gender: '男', age: 38, phone: '136****9012', examType: '甲状腺', diagnosis: '甲状腺结节', department: '内分泌科' },
  { id: 'P10004', name: '赵六', gender: '女', age: 61, phone: '137****3456', examType: '乳腺彩超', diagnosis: '乳腺囊肿', department: '乳腺外科' },
  { id: 'P10005', name: '钱七', gender: '男', age: 55, phone: '135****7890', examType: '血管彩超', diagnosis: '下肢静脉曲张', department: '血管外科' },
  { id: 'P10006', name: '孙八', gender: '女', age: 47, phone: '133****2345', examType: '腹部彩超', diagnosis: '胆囊结石', department: '肝胆外科' },
  { id: 'P10007', name: '周九', gender: '男', age: 63, phone: '132****6789', examType: '心脏彩超', diagnosis: '心力衰竭', department: '心内科' },
  { id: 'P10008', name: '吴十', gender: '女', age: 34, phone: '131****0123', examType: '妇科彩超', diagnosis: '子宫肌瘤', department: '妇科' },
  { id: 'P10009', name: '郑十一', gender: '男', age: 71, phone: '130****4567', examType: '前列腺', diagnosis: '前列腺增生', department: '泌尿外科' },
  { id: 'P10010', name: '陈十二', gender: '女', age: 29, phone: '139****8901', examType: 'NT检查', diagnosis: '早孕', department: '产科' },
  { id: 'P10011', name: '林十三', gender: '男', age: 58, phone: '138****2345', examType: '血管彩超', diagnosis: '颈动脉斑块', department: '神经内科' },
  { id: 'P10012', name: '黄十四', gender: '女', age: 42, phone: '137****6789', examType: '甲状腺', diagnosis: '桥本甲状腺炎', department: '内分泌科' },
  { id: 'P10013', name: '杨十五', gender: '男', age: 67, phone: '136****0123', examType: '心脏彩超', diagnosis: '主动脉瓣狭窄', department: '心外科' },
  { id: 'P10014', name: '徐十六', gender: '女', age: 50, phone: '135****4567', examType: '腹部彩超', diagnosis: '肝血管瘤', department: '消化内科' },
  { id: 'P10015', name: '许十七', gender: '男', age: 44, phone: '133****8901', examType: '肌骨彩超', diagnosis: '肩周炎', department: '运动医学科' },
  { id: 'P10016', name: '何十八', gender: '女', age: 36, phone: '132****2345', examType: '妇科彩超', diagnosis: '卵巢囊肿', department: '妇科' },
]

// ---------- 随访状态 ----------
const STATUS_OPTIONS = [
  { value: 'pending', label: '待随访', color: '#f97316', bg: '#fff7ed' },
  { value: 'in_progress', label: '进行中', color: '#3b82f6', bg: '#eff6ff' },
  { value: 'completed', label: '已完成', color: '#22c55e', bg: '#f0fdf4' },
  { value: 'overdue', label: '超时未访', color: '#ef4444', bg: '#fef2f2' },
]

// ---------- 随访任务数据 ----------
const FOLLOWUP_TASKS = [
  { id: 'F001', patient: PATIENTS[0], planDate: '2026-04-20', nextDate: '2026-05-20', status: 'completed', doctor: '李医生', result: '恢复良好，脂肪肝程度减轻', compliance: 95 },
  { id: 'F002', patient: PATIENTS[1], planDate: '2026-04-22', nextDate: '2026-05-22', status: 'in_progress', doctor: '王医生', result: '随访中，心率控制稳定', compliance: 88 },
  { id: 'F003', patient: PATIENTS[2], planDate: '2026-04-25', nextDate: '2026-05-25', status: 'pending', doctor: '赵医生', result: '', compliance: 0 },
  { id: 'F004', patient: PATIENTS[3], planDate: '2026-04-18', nextDate: '2026-04-28', status: 'overdue', doctor: '孙医生', result: '失访，已联系3次未果', compliance: 0 },
  { id: 'F005', patient: PATIENTS[4], planDate: '2026-04-28', nextDate: '2026-05-28', status: 'pending', doctor: '刘医生', result: '', compliance: 0 },
  { id: 'F006', patient: PATIENTS[5], planDate: '2026-04-15', nextDate: '2026-05-15', status: 'in_progress', doctor: '周医生', result: '服药规律，症状改善', compliance: 92 },
  { id: 'F007', patient: PATIENTS[6], planDate: '2026-04-10', nextDate: '2026-04-25', status: 'overdue', doctor: '吴医生', result: '用药调整中', compliance: 45 },
  { id: 'F008', patient: PATIENTS[7], planDate: '2026-05-01', nextDate: '2026-06-01', status: 'pending', doctor: '郑医生', result: '', compliance: 0 },
  { id: 'F009', patient: PATIENTS[8], planDate: '2026-04-05', nextDate: '2026-05-05', status: 'completed', doctor: '陈医生', result: '指标正常，维持现状', compliance: 100 },
  { id: 'F010', patient: PATIENTS[9], planDate: '2026-04-20', nextDate: '2026-05-20', status: 'in_progress', doctor: '林医生', result: '产检正常，胎儿发育良好', compliance: 90 },
  { id: 'F011', patient: PATIENTS[10], planDate: '2026-03-28', nextDate: '2026-04-28', status: 'overdue', doctor: '黄医生', result: '斑块稳定，继续观察', compliance: 60 },
  { id: 'F012', patient: PATIENTS[11], planDate: '2026-05-02', nextDate: '2026-06-02', status: 'pending', doctor: '杨医生', result: '', compliance: 0 },
  { id: 'F013', patient: PATIENTS[12], planDate: '2026-04-12', nextDate: '2026-05-12', status: 'in_progress', doctor: '徐医生', result: '偶有胸闷，药物调整', compliance: 75 },
  { id: 'F014', patient: PATIENTS[13], planDate: '2026-04-08', nextDate: '2026-05-08', status: 'completed', doctor: '许医生', result: '血管瘤无明显变化', compliance: 98 },
  { id: 'F015', patient: PATIENTS[14], planDate: '2026-04-30', nextDate: '2026-05-30', status: 'pending', doctor: '何医生', result: '', compliance: 0 },
  { id: 'F016', patient: PATIENTS[15], planDate: '2026-04-22', nextDate: '2026-05-22', status: 'in_progress', doctor: '冯医生', result: '囊肿缩小，定期复查', compliance: 85 },
]

// ---------- 统计数据 ----------
const MONTHLY_TREND = [
  { month: '1月', 完成数: 45, 新增数: 52, 失访数: 3 },
  { month: '2月', 完成数: 38, 新增数: 42, 失访数: 5 },
  { month: '3月', 完成数: 56, 新增数: 60, 失访数: 2 },
  { month: '4月', 完成数: 62, 新增数: 58, 失访数: 4 },
  { month: '5月', 完成数: 70, 新增数: 75, 失访数: 3 },
  { month: '6月', 完成数: 68, 新增数: 72, 失访数: 6 },
]

const STATUS_DISTRIBUTION = [
  { name: '待随访', value: 12, color: '#f97316' },
  { name: '进行中', value: 28, color: '#3b82f6' },
  { name: '已完成', value: 156, color: '#22c55e' },
  { name: '超时未访', value: 5, color: '#ef4444' },
]

const DEPARTMENT_STATS = [
  { department: '心内科', count: 35, rate: 92 },
  { department: '消化内科', count: 28, rate: 88 },
  { department: '内分泌科', count: 24, rate: 95 },
  { department: '妇科', count: 20, rate: 85 },
  { department: '血管外科', count: 18, rate: 78 },
  { department: '乳腺外科', count: 15, rate: 82 },
]

const COMPLIANCE_DATA = [
  { name: '完全依从', value: 120, color: '#22c55e' },
  { name: '部分依从', value: 45, color: '#f97316' },
  { name: '不依从', value: 15, color: '#ef4444' },
]

const tooltipStyle = {
  contentStyle: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 },
  labelStyle: { color: '#1a3a5c', fontWeight: 600 },
}

// ---------- 工具函数 ----------
const getStatusStyle = (status: string) => {
  const option = STATUS_OPTIONS.find(s => s.value === status)
  return option ? { background: option.bg, color: option.color } : {}
}

const getStatusLabel = (status: string) => {
  return STATUS_OPTIONS.find(s => s.value === status)?.label || status
}

const getComplianceColor = (rate: number) => {
  if (rate >= 80) return '#22c55e'
  if (rate >= 50) return '#f97316'
  return '#ef4444'
}

// ---------- 组件 ----------
export default function FollowUpPage() {
  const navigate = useNavigateRouter()
  const [activeTab, setActiveTab] = useState('pending')
  const [searchTerm, setSearchTerm] = useState('')
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [showRecordModal, setShowRecordModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState<any>(null)

  // 表单状态
  const [planForm, setPlanForm] = useState({
    patientId: '', examType: '', followupCycle: '30', followupTimes: '3',
    method: 'phone', department: '', doctor: '', notes: ''
  })
  const [recordForm, setRecordForm] = useState({
    result: '', symptoms: '', medication: '', nextDate: '', compliance: '100', notes: ''
  })

  const filteredTasks = FOLLOWUP_TASKS.filter(task => {
    const matchTab = activeTab === 'all' || task.status === activeTab
    const matchSearch = task.patient.name.includes(searchTerm) ||
      task.patient.id.includes(searchTerm) ||
      task.doctor.includes(searchTerm)
    return matchTab && matchSearch
  })

  const overdueTasks = FOLLOWUP_TASKS.filter(t => t.status === 'overdue')

  const openRecordModal = (task: any) => {
    setSelectedTask(task)
    setRecordForm({
      result: task.result || '',
      symptoms: '',
      medication: '',
      nextDate: task.nextDate,
      compliance: String(task.compliance),
      notes: ''
    })
    setShowRecordModal(true)
  }

  const handleSavePlan = () => {
    setShowPlanModal(false)
    setPlanForm({ patientId: '', examType: '', followupCycle: '30', followupTimes: '3', method: 'phone', department: '', doctor: '', notes: '' })
  }

  const handleSaveRecord = () => {
    setShowRecordModal(false)
  }

  return (
    <div style={s.root}>
      {/* 标题区 */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>随访管理</h1>
          <p style={s.subtitle}>患者随访跟踪 · 随访计划制定 · 依从性管理 · 数据统计</p>
        </div>
        <div style={s.headerRight}>
          <button style={s.btnSecondary} onClick={() => setShowPlanModal(true)}>
            <Plus size={14} color="#64748b" /> 新建随访计划
          </button>
          <button style={s.btnSecondary}>
            <Download size={14} color="#64748b" /> 导出数据
          </button>
          <button style={s.btnSecondary}>
            <RefreshCw size={14} color="#64748b" /> 刷新
          </button>
        </div>
      </div>

      {/* 超时警报 */}
      {overdueTasks.length > 0 && (
        <div style={s.alertBanner}>
          <AlertTriangle size={20} color="#ef4444" />
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#ef4444' }}>
              您有 {overdueTasks.length} 条超时未随访记录
            </span>
            <span style={{ fontSize: 12, color: '#64748b', marginLeft: 8 }}>
              请尽快处理，以免影响患者康复追踪
            </span>
          </div>
          <button style={{ ...s.btnDanger, padding: '6px 12px', fontSize: 12 }}>立即处理</button>
        </div>
      )}

      {/* 统计卡片 */}
      <div style={s.statRow}>
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, background: '#fff7ed' }}>
            <Clock size={22} color="#f97316" />
          </div>
          <div style={s.statInfo}>
            <div style={s.statValue}>12</div>
            <div style={s.statLabel}>待随访</div>
            <div style={{ ...s.statTrend, color: '#f97316' }}>
              <TrendingUp size={12} /> 较上月+3
            </div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, background: '#eff6ff' }}>
            <Activity size={22} color="#3b82f6" />
          </div>
          <div style={s.statInfo}>
            <div style={s.statValue}>28</div>
            <div style={s.statLabel}>进行中</div>
            <div style={{ ...s.statTrend, color: '#3b82f6' }}>
              <TrendingUp size={12} /> 本月新增45
            </div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, background: '#f0fdf4' }}>
            <CheckCircle size={22} color="#22c55e" />
          </div>
          <div style={s.statInfo}>
            <div style={s.statValue}>156</div>
            <div style={s.statLabel}>已完成</div>
            <div style={{ ...s.statTrend, color: '#22c55e' }}>
              <TrendingUp size={12} /> 本月+62
            </div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, background: '#fef2f2' }}>
            <AlertCircle size={22} color="#ef4444" />
          </div>
          <div style={s.statInfo}>
            <div style={s.statValue}>5</div>
            <div style={s.statLabel}>超时未访</div>
            <div style={{ ...s.statTrend, color: '#ef4444' }}>
              <TrendingDown size={12} /> 需紧急处理
            </div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, background: '#f5f3ff' }}>
            <UserCheck size={22} color="#8b5cf6" />
          </div>
          <div style={s.statInfo}>
            <div style={s.statValue}>86%</div>
            <div style={s.statLabel}>总依从率</div>
            <div style={{ ...s.statTrend, color: '#22c55e' }}>
              <TrendingUp size={12} /> 较上月+5%
            </div>
          </div>
        </div>
      </div>

      {/* 图表区域 */}
      <div style={s.chartRow}>
        {/* 随访趋势 */}
        <div style={s.chartCard}>
          <div style={s.chartTitle}>
            <TrendingUp size={16} color="#64748b" /> 月度随访趋势
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={MONTHLY_TREND}>
              <defs>
                <linearGradient id="colorComplete2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorNew2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="完成数" stroke="#22c55e" fill="url(#colorComplete2)" strokeWidth={2} />
              <Area type="monotone" dataKey="新增数" stroke="#3b82f6" fill="url(#colorNew2)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 状态分布 */}
        <div style={s.chartCard}>
          <div style={s.chartTitle}>
            <PieChart size={16} color="#64748b" /> 随访状态分布
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={STATUS_DISTRIBUTION}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {STATUS_DISTRIBUTION.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={STATUS_DISTRIBUTION[index].color} />
                ))}
              </Pie>
              <Tooltip {...tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 依从性分布 */}
        <div style={s.chartCard}>
          <div style={s.chartTitle}>
            <UserCheck size={16} color="#64748b" /> 患者依从性
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={COMPLIANCE_DATA}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {COMPLIANCE_DATA.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COMPLIANCE_DATA[index].color} />
                ))}
              </Pie>
              <Tooltip {...tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 科室依从性柱状图 */}
      <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 20 }}>
        <div style={s.chartTitle}>
          <BarChart size={16} color="#64748b" /> 各科室随访完成率
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={DEPARTMENT_STATS} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <YAxis dataKey="department" type="category" tick={{ fontSize: 11, fill: '#64748b' }} width={70} />
            <Tooltip {...tooltipStyle} formatter={(value: number) => [`${value}%`, '完成率']} />
            <Bar dataKey="rate" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tab切换 */}
      <div style={s.tabBar}>
        {[
          { key: 'pending', label: '待随访', count: 12, color: '#f97316' },
          { key: 'in_progress', label: '进行中', count: 28, color: '#3b82f6' },
          { key: 'completed', label: '已完成', count: 156, color: '#22c55e' },
          { key: 'overdue', label: '超时未访', count: 5, color: '#ef4444' },
          { key: 'all', label: '全部', count: 201, color: '#64748b' },
        ].map(tab => (
          <button
            key={tab.key}
            style={{
              ...s.tab,
              ...(activeTab === tab.key ? s.tabActive : { background: 'transparent', color: '#64748b' }),
            }}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            <span style={{
              background: activeTab === tab.key ? '#e2e8f0' : '#f1f5f9',
              color: activeTab === tab.key ? '#1a3a5c' : '#64748b',
              padding: '1px 6px', borderRadius: 8, fontSize: 11, fontWeight: 600,
            }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* 筛选栏 */}
      <div style={s.filterBar}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: 10, color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="搜索患者姓名、ID或医生..."
            style={{ ...s.searchInput, paddingLeft: 36 }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select style={s.selectInput}>
          <option value="">全部检查类型</option>
          <option value="腹部彩超">腹部彩超</option>
          <option value="心脏彩超">心脏彩超</option>
          <option value="甲状腺">甲状腺</option>
          <option value="乳腺彩超">乳腺彩超</option>
          <option value="血管彩超">血管彩超</option>
          <option value="妇科彩超">妇科彩超</option>
        </select>
        <select style={s.selectInput}>
          <option value="">全部科室</option>
          <option value="心内科">心内科</option>
          <option value="消化内科">消化内科</option>
          <option value="内分泌科">内分泌科</option>
          <option value="妇科">妇科</option>
        </select>
        <button style={s.btnSecondary}>
          <Filter size={14} color="#64748b" /> 高级筛选
        </button>
      </div>

      {/* 任务列表 */}
      <div style={s.tableCard}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>编号</th>
              <th style={s.th}>患者信息</th>
              <th style={s.th}>检查类型</th>
              <th style={s.th}>计划日期</th>
              <th style={s.th}>下次随访</th>
              <th style={s.th}>负责医生</th>
              <th style={s.th}>状态</th>
              <th style={s.th}>依从性</th>
              <th style={s.th}>结果/备注</th>
              <th style={s.th}>操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((task) => (
              <tr key={task.id} style={{ background: task.status === 'overdue' ? '#fef2f2' : 'transparent' }}>
                <td style={s.td}>{task.id}</td>
                <td style={s.td}>
                  <div style={{ fontWeight: 600, color: '#1a3a5c' }}>{task.patient.name}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>{task.patient.id}</div>
                </td>
                <td style={s.td}>{task.patient.examType}</td>
                <td style={s.td}>{task.planDate}</td>
                <td style={s.td}>
                  <span style={{ color: task.status === 'overdue' ? '#ef4444' : '#1a3a5c', fontWeight: task.status === 'overdue' ? 600 : 400 }}>
                    {task.nextDate}
                  </span>
                </td>
                <td style={s.td}>{task.doctor}</td>
                <td style={s.td}>
                  <span style={{ ...s.statusBadge, ...getStatusStyle(task.status) }}>
                    {getStatusLabel(task.status)}
                  </span>
                </td>
                <td style={s.td}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={s.complianceBar}>
                      <div style={{
                        ...s.complianceFill,
                        width: `${task.compliance}%`,
                        background: getComplianceColor(task.compliance),
                      }} />
                    </div>
                    <span style={{ fontSize: 12, color: getComplianceColor(task.compliance), fontWeight: 600 }}>
                      {task.compliance}%
                    </span>
                  </div>
                </td>
                <td style={s.td}>
                  <div style={{ fontSize: 12, color: task.result ? '#1a3a5c' : '#94a3b8', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {task.result || '-'}
                  </div>
                </td>
                <td style={s.td}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {task.status !== 'completed' && (
                      <button
                        style={{ padding: '4px 8px', border: 'none', background: '#eff6ff', borderRadius: 6, cursor: 'pointer', fontSize: 11, color: '#3b82f6', fontWeight: 500 }}
                        onClick={() => openRecordModal(task)}
                      >
                        录入
                      </button>
                    )}
                    <button style={{ padding: 4, border: 'none', background: 'none', cursor: 'pointer' }}>
                      <Eye size={14} color="#64748b" />
                    </button>
                    <button style={{ padding: 4, border: 'none', background: 'none', cursor: 'pointer' }}>
                      <Phone size={14} color="#22c55e" />
                    </button>
                    <button style={{ padding: 4, border: 'none', background: 'none', cursor: 'pointer' }}>
                      <MessageSquare size={14} color="#3b82f6" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 分页 */}
        <div style={s.pagination}>
          <div style={s.pageInfo}>共 {filteredTasks.length} 条记录</div>
          <div style={s.pageButtons}>
            <button style={s.pageBtn}>上一页</button>
            <button style={s.pageBtnActive}>1</button>
            <button style={s.pageBtn}>2</button>
            <button style={s.pageBtn}>3</button>
            <button style={s.pageBtn}>下一页</button>
          </div>
        </div>
      </div>

      {/* 新建随访计划模态框 */}
      {showPlanModal && (
        <div style={s.modal} onClick={() => setShowPlanModal(false)}>
          <div style={s.modalContent} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h2 style={s.modalTitle}>新建随访计划</h2>
              <button style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4 }} onClick={() => setShowPlanModal(false)}>
                <X size={18} color="#64748b" />
              </button>
            </div>
            <div style={s.modalBody}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={s.formGroup}>
                  <label style={s.formLabel}>患者</label>
                  <select style={s.formSelect} value={planForm.patientId} onChange={e => setPlanForm({ ...planForm, patientId: e.target.value })}>
                    <option value="">选择患者</option>
                    {PATIENTS.map(p => <option key={p.id} value={p.id}>{p.name} ({p.id})</option>)}
                  </select>
                </div>
                <div style={s.formGroup}>
                  <label style={s.formLabel}>检查类型</label>
                  <select style={s.formSelect} value={planForm.examType} onChange={e => setPlanForm({ ...planForm, examType: e.target.value })}>
                    <option value="">选择类型</option>
                    <option value="腹部彩超">腹部彩超</option>
                    <option value="心脏彩超">心脏彩超</option>
                    <option value="甲状腺">甲状腺</option>
                    <option value="乳腺彩超">乳腺彩超</option>
                    <option value="血管彩超">血管彩超</option>
                    <option value="妇科彩超">妇科彩超</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={s.formGroup}>
                  <label style={s.formLabel}>随访周期（天）</label>
                  <input style={s.formInput} type="number" value={planForm.followupCycle} onChange={e => setPlanForm({ ...planForm, followupCycle: e.target.value })} />
                </div>
                <div style={s.formGroup}>
                  <label style={s.formLabel}>随访次数</label>
                  <input style={s.formInput} type="number" value={planForm.followupTimes} onChange={e => setPlanForm({ ...planForm, followupTimes: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={s.formGroup}>
                  <label style={s.formLabel}>随访方式</label>
                  <select style={s.formSelect} value={planForm.method} onChange={e => setPlanForm({ ...planForm, method: e.target.value })}>
                    <option value="phone">电话随访</option>
                    <option value="message">短信随访</option>
                    <option value="visit">门诊随访</option>
                    <option value="remote">远程随访</option>
                  </select>
                </div>
                <div style={s.formGroup}>
                  <label style={s.formLabel}>科室</label>
                  <select style={s.formSelect} value={planForm.department} onChange={e => setPlanForm({ ...planForm, department: e.target.value })}>
                    <option value="">选择科室</option>
                    <option value="心内科">心内科</option>
                    <option value="消化内科">消化内科</option>
                    <option value="内分泌科">内分泌科</option>
                    <option value="妇科">妇科</option>
                    <option value="血管外科">血管外科</option>
                  </select>
                </div>
              </div>
              <div style={s.formGroup}>
                <label style={s.formLabel}>负责医生</label>
                <input style={s.formInput} type="text" value={planForm.doctor} onChange={e => setPlanForm({ ...planForm, doctor: e.target.value })} placeholder="输入医生姓名" />
              </div>
              <div style={s.formGroup}>
                <label style={s.formLabel}>备注</label>
                <textarea style={s.formTextarea} value={planForm.notes} onChange={e => setPlanForm({ ...planForm, notes: e.target.value })} placeholder="输入随访计划备注..." />
              </div>
            </div>
            <div style={s.modalFooter}>
              <button style={s.btnSecondary} onClick={() => setShowPlanModal(false)}>取消</button>
              <button style={s.btnPrimary} onClick={handleSavePlan}>
                <Check size={14} /> 创建计划
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 随访记录录入模态框 */}
      {showRecordModal && selectedTask && (
        <div style={s.modal} onClick={() => setShowRecordModal(false)}>
          <div style={s.modalContent} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h2 style={s.modalTitle}>随访记录录入</h2>
              <button style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4 }} onClick={() => setShowRecordModal(false)}>
                <X size={18} color="#64748b" />
              </button>
            </div>
            <div style={s.modalBody}>
              {/* 患者信息 */}
              <div style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 16px', marginBottom: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={20} color="#1d4ed8" />
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#1a3a5c' }}>{selectedTask.patient.name}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{selectedTask.patient.id} · {selectedTask.patient.examType} · {selectedTask.patient.department}</div>
                  </div>
                  <div style={{ marginLeft: 'auto' }}>
                    <span style={{ ...s.statusBadge, ...getStatusStyle(selectedTask.status) }}>
                      {getStatusLabel(selectedTask.status)}
                    </span>
                  </div>
                </div>
              </div>

              <div style={s.formGroup}>
                <label style={s.formLabel}>随访结果</label>
                <textarea style={s.formTextarea} value={recordForm.result} onChange={e => setRecordForm({ ...recordForm, result: e.target.value })} placeholder="描述本次随访结果..." />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={s.formGroup}>
                  <label style={s.formLabel}>症状描述</label>
                  <input style={s.formInput} type="text" value={recordForm.symptoms} onChange={e => setRecordForm({ ...recordForm, symptoms: e.target.value })} placeholder="患者当前症状" />
                </div>
                <div style={s.formGroup}>
                  <label style={s.formLabel}>用药情况</label>
                  <input style={s.formInput} type="text" value={recordForm.medication} onChange={e => setRecordForm({ ...recordForm, medication: e.target.value })} placeholder="药物名称及剂量" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={s.formGroup}>
                  <label style={s.formLabel}>下次随访日期</label>
                  <input style={s.formInput} type="date" value={recordForm.nextDate} onChange={e => setRecordForm({ ...recordForm, nextDate: e.target.value })} />
                </div>
                <div style={s.formGroup}>
                  <label style={s.formLabel}>依从性评分</label>
                  <select style={s.formSelect} value={recordForm.compliance} onChange={e => setRecordForm({ ...recordForm, compliance: e.target.value })}>
                    <option value="100">完全依从 (100%)</option>
                    <option value="80">良好依从 (80%)</option>
                    <option value="60">部分依从 (60%)</option>
                    <option value="40">不依从 (40%)</option>
                    <option value="0">完全不依从 (0%)</option>
                  </select>
                </div>
              </div>
              <div style={s.formGroup}>
                <label style={s.formLabel}>备注</label>
                <textarea style={s.formTextarea} value={recordForm.notes} onChange={e => setRecordForm({ ...recordForm, notes: e.target.value })} placeholder="其他备注信息..." />
              </div>
            </div>
            <div style={s.modalFooter}>
              <button style={s.btnSecondary} onClick={() => setShowRecordModal(false)}>取消</button>
              <button style={s.btnSuccess} onClick={handleSaveRecord}>
                <Check size={14} /> 保存记录
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
