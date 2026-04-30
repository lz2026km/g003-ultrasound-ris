// @ts-nocheck
// ============================================================
// G004 内镜管理系统 - 国家数据上报页面
// 上报录入/上报历史/省级平台/质控指标
// ============================================================
import { useState } from 'react'
import {
  ShieldAlert, FileText, Clock, CheckCircle, AlertTriangle,
  BarChart3, TrendingUp, Database, MapPin, Activity,
  Plus, Search, Download, Upload, RefreshCw, Eye, Edit,
  Check, X, ArrowRight, Globe, Building2, Link2, AlertCircle,
  ArrowUpRight, ArrowDownRight, Minus, Star, Award, Target
} from 'lucide-react'

// ============ 演示数据 ============
// 上报历史数据 - 30条
const REPORT_HISTORY = [
  { id: 1, date: '2026-04-28', cycle: '2026Q1', content: '胃镜检查数据上报', doctor: '张明华', status: '已通过', records: 428 },
  { id: 2, date: '2026-04-27', cycle: '2026Q1', content: '肠镜检查数据上报', doctor: '李芳', status: '已通过', records: 386 },
  { id: 3, date: '2026-04-26', cycle: '2026Q1', content: 'ERCP操作数据上报', doctor: '王建国', status: '待审核', records: 52 },
  { id: 4, date: '2026-04-25', cycle: '2026Q1', content: '超声内镜数据上报', doctor: '刘洋', status: '已通过', records: 128 },
  { id: 5, date: '2026-04-24', cycle: '2026Q1', content: '胶囊内镜数据上报', doctor: '陈晓燕', status: '已通过', records: 68 },
  { id: 6, date: '2026-04-23', cycle: '2026Q1', content: '胃镜检查数据上报', doctor: '赵德明', status: '已通过', records: 415 },
  { id: 7, date: '2026-04-22', cycle: '2026Q1', content: '肠镜检查数据上报', doctor: '孙丽萍', status: '已通过', records: 372 },
  { id: 8, date: '2026-04-21', cycle: '2026Q1', content: '早癌筛查数据上报', doctor: '周伟', status: '待审核', records: 89 },
  { id: 9, date: '2026-04-20', cycle: '2026Q1', content: '质控指标数据上报', doctor: '吴静', status: '已通过', records: 1245 },
  { id: 10, date: '2026-04-19', cycle: '2026Q1', content: '胃镜检查数据上报', doctor: '郑强', status: '已通过', records: 398 },
  { id: 11, date: '2026-04-18', cycle: '2026Q1', content: '肠镜检查数据上报', doctor: '张明华', status: '已通过', records: 365 },
  { id: 12, date: '2026-04-17', cycle: '2026Q1', content: '并发症数据上报', doctor: '李芳', status: '已通过', records: 18 },
  { id: 13, date: '2026-04-16', cycle: '2026Q1', content: '胃镜检查数据上报', doctor: '王建国', status: '已通过', records: 422 },
  { id: 14, date: '2026-04-15', cycle: '2026Q1', content: 'ERCP操作数据上报', doctor: '刘洋', status: '待审核', records: 48 },
  { id: 15, date: '2026-04-14', cycle: '2026Q1', content: '超声内镜数据上报', doctor: '陈晓燕', status: '已通过', records: 115 },
  { id: 16, date: '2026-04-13', cycle: '2026Q1', content: '胶囊内镜数据上报', doctor: '赵德明', status: '已通过', records: 72 },
  { id: 17, date: '2026-04-12', cycle: '2026Q1', content: '胃镜检查数据上报', doctor: '孙丽萍', status: '已通过', records: 408 },
  { id: 18, date: '2026-04-11', cycle: '2026Q1', content: '肠镜检查数据上报', doctor: '周伟', status: '已通过', records: 358 },
  { id: 19, date: '2026-04-10', cycle: '2026Q1', content: '早癌筛查数据上报', doctor: '吴静', status: '已通过', records: 95 },
  { id: 20, date: '2026-04-09', cycle: '2026Q1', content: '质控指标数据上报', doctor: '郑强', status: '已通过', records: 1180 },
  { id: 21, date: '2026-04-08', cycle: '2026Q1', content: '胃镜检查数据上报', doctor: '张明华', status: '已通过', records: 435 },
  { id: 22, date: '2026-04-07', cycle: '2026Q1', content: '肠镜检查数据上报', doctor: '李芳', status: '已通过', records: 392 },
  { id: 23, date: '2026-04-06', cycle: '2026Q1', content: '并发症数据上报', doctor: '王建国', status: '已通过', records: 22 },
  { id: 24, date: '2026-04-05', cycle: '2026Q1', content: '胃镜检查数据上报', doctor: '刘洋', status: '已通过', records: 418 },
  { id: 25, date: '2026-04-04', cycle: '2026Q1', content: 'ERCP操作数据上报', doctor: '陈晓燕', status: '待审核', records: 55 },
  { id: 26, date: '2026-04-03', cycle: '2026Q1', content: '超声内镜数据上报', doctor: '赵德明', status: '已通过', records: 122 },
  { id: 27, date: '2026-04-02', cycle: '2026Q1', content: '胶囊内镜数据上报', doctor: '孙丽萍', status: '已通过', records: 78 },
  { id: 28, date: '2026-04-01', cycle: '2026Q1', content: '胃镜检查数据上报', doctor: '周伟', status: '已通过', records: 428 },
  { id: 29, date: '2026-03-31', cycle: '2026Q1', content: '肠镜检查数据上报', doctor: '吴静', status: '已通过', records: 378 },
  { id: 30, date: '2026-03-30', cycle: '2026Q1', content: '早癌筛查数据上报', doctor: '郑强', status: '已通过', records: 102 },
]

// 省级平台数据
const PROVINCE_DATA = [
  { province: '山东省', code: 'SD', connected: true, dataVolume: 128456, lastReport: '2026-04-28', status: '正常', coverage: 98.5 },
  { province: '河南省', code: 'HN', connected: true, dataVolume: 98652, lastReport: '2026-04-28', status: '正常', coverage: 96.2 },
  { province: '内蒙古', code: 'NM', connected: true, dataVolume: 45238, lastReport: '2026-04-27', status: '正常', coverage: 92.8 },
  { province: '青海省', code: 'QH', connected: true, dataVolume: 28564, lastReport: '2026-04-28', status: '正常', coverage: 89.5 },
  { province: '福建省', code: 'FJ', connected: true, dataVolume: 76582, lastReport: '2026-04-28', status: '正常', coverage: 97.1 },
  { province: '浙江省', code: 'ZJ', connected: true, dataVolume: 142385, lastReport: '2026-04-28', status: '正常', coverage: 99.2 },
  { province: '江苏省', code: 'JS', connected: true, dataVolume: 115728, lastReport: '2026-04-27', status: '正常', coverage: 98.0 },
  { province: '广东省', code: 'GD', connected: true, dataVolume: 158964, lastReport: '2026-04-28', status: '正常', coverage: 99.5 },
  { province: '四川省', code: 'SC', connected: true, dataVolume: 89256, lastReport: '2026-04-26', status: '正常', coverage: 95.6 },
  { province: '湖南省', code: 'HN', connected: true, dataVolume: 78452, lastReport: '2026-04-28', status: '正常', coverage: 94.8 },
  { province: '安徽省', code: 'AH', connected: false, dataVolume: 32456, lastReport: '2026-03-15', status: '离线', coverage: 68.2 },
  { province: '河北省', code: 'HE', connected: false, dataVolume: 0, lastReport: '2026-02-28', status: '未接入', coverage: 0 },
]

// 质控指标趋势数据
const ADR_TREND = [
  { month: '2025-07', adr: 22.5 }, { month: '2025-08', adr: 23.1 }, { month: '2025-09', adr: 23.8 },
  { month: '2025-10', adr: 24.2 }, { month: '2025-11', adr: 24.8 }, { month: '2025-12', adr: 25.3 },
  { month: '2026-01', adr: 25.9 }, { month: '2026-02', adr: 26.4 }, { month: '2026-03', adr: 27.1 },
  { month: '2026-04', adr: 27.8 },
]

// 各省ADR对比
const PROVINCE_ADR = [
  { province: '浙江', adr: 28.5, target: 25 }, { province: '广东', adr: 27.8, target: 25 },
  { province: '江苏', adr: 27.2, target: 25 }, { province: '山东', adr: 26.8, target: 25 },
  { province: '福建', adr: 26.1, target: 25 }, { province: '河南', adr: 25.6, target: 25 },
  { province: '四川', adr: 24.9, target: 25 }, { province: '湖南', adr: 24.2, target: 25 },
  { province: '内蒙古', adr: 23.5, target: 25 }, { province: '青海', adr: 22.8, target: 25 },
]

// ============ 样式 ============
const s: Record<string, React.CSSProperties> = {
  root: { padding: '32px', background: '#f0f4f8', minHeight: '100vh' },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 22, fontWeight: 700, color: '#1a3a5c', margin: 0, display: 'flex', alignItems: 'center', gap: 10,
  },
  subtitle: {
    fontSize: 13, color: '#64748b', marginTop: 6,
  },
  // KPI卡片区
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16,
    marginBottom: 24,
  },
  kpiCard: {
    background: '#fff',
    borderRadius: 12,
    padding: '20px 24px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  kpiIconRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  kpiIconWrap: {
    width: 44, height: 44, borderRadius: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  kpiTrend: {
    fontSize: 12, fontWeight: 600, padding: '2px 8px', borderRadius: 6,
    display: 'flex', alignItems: 'center', gap: 2,
  },
  kpiValue: {
    fontSize: 28, fontWeight: 700, color: '#1a3a5c', lineHeight: 1.2,
  },
  kpiLabel: {
    fontSize: 13, color: '#64748b',
  },
  // Tab导航
  tabNav: {
    display: 'flex',
    gap: 4,
    background: '#f1f5f9',
    padding: 4,
    borderRadius: 10,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    padding: '12px 16px',
    borderRadius: 8,
    border: 'none',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  tabContent: {
    background: '#fff',
    borderRadius: 12,
    padding: 24,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  // 表单样式
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 16,
    marginBottom: 20,
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: '#475569',
  },
  input: {
    padding: '12px 14px',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  select: {
    padding: '12px 14px',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    fontSize: 14,
    outline: 'none',
    background: '#fff',
  },
  textarea: {
    padding: '12px 14px',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    fontSize: 14,
    outline: 'none',
    minHeight: 100,
    resize: 'vertical',
  },
  // 按钮
  btnPrimary: {
    background: '#1a3a5c',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '14px 28px',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  btnSecondary: {
    background: '#fff',
    color: '#1a3a5c',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    padding: '14px 28px',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  btnDanger: {
    background: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '14px 28px',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  btnSm: {
    padding: '8px 16px',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  // 表格
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 13,
  },
  th: {
    textAlign: 'left',
    padding: '12px 16px',
    background: '#f8fafc',
    color: '#64748b',
    fontWeight: 600,
    borderBottom: '1px solid #e2e8f0',
  },
  td: {
    padding: '12px 16px',
    borderBottom: '1px solid #e2e8f0',
    color: '#1a3a5c',
  },
  // 状态标签
  tag: {
    padding: '4px 12px',
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
  },
  // 省份卡片
  provinceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 16,
    marginBottom: 20,
  },
  provinceCard: {
    background: '#fff',
    borderRadius: 12,
    padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    border: '1px solid #e2e8f0',
  },
  provinceHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  provinceName: {
    fontSize: 16, fontWeight: 600, color: '#1a3a5c', display: 'flex', alignItems: 'center', gap: 6,
  },
  provinceStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 12,
  },
  provinceStat: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  provinceStatLabel: {
    fontSize: 11, color: '#94a3b8',
  },
  provinceStatValue: {
    fontSize: 16, fontWeight: 700, color: '#1a3a5c',
  },
  // 质控指标
  qcGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 16,
    marginBottom: 20,
  },
  qcCard: {
    background: '#fff',
    borderRadius: 12,
    padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  qcCardTitle: {
    fontSize: 15, fontWeight: 600, color: '#1a3a5c', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6,
  },
  qcTrend: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  qcValue: {
    fontSize: 32, fontWeight: 700, color: '#1a3a5c',
  },
  qcUnit: {
    fontSize: 14, color: '#64748b',
  },
  qcBar: {
    height: 8,
    background: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 8,
  },
  qcBarFill: {
    height: '100%',
    borderRadius: 4,
    transition: 'width 0.3s',
  },
  // 模拟图表
  miniChart: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 4,
    height: 60,
    marginTop: 12,
  },
  miniBar: {
    flex: 1,
    background: '#3b82f6',
    borderRadius: '3px 3px 0 0',
    minWidth: 12,
  },
  baseline: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    fontSize: 12,
    color: '#64748b',
  },
  // 搜索栏
  searchBar: {
    display: 'flex',
    gap: 12,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    padding: '12px 16px',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    fontSize: 14,
    outline: 'none',
  },
  // 统计行
  statsRow: {
    display: 'flex',
    gap: 24,
    marginBottom: 20,
    padding: '16px 20px',
    background: '#f8fafc',
    borderRadius: 8,
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 18, fontWeight: 700, color: '#1a3a5c',
  },
  statLabel: {
    fontSize: 13, color: '#64748b',
  },
  // 空状态
  emptyState: {
    textAlign: 'center',
    padding: '48px 20px',
    color: '#94a3b8',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
  },
  emptyStateIcon: { opacity: 0.35 },
  emptyStateText: { fontSize: 14, color: '#64748b', fontWeight: 500 },
  emptyStateHint: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
}

// ============ 状态颜色映射 ============
const STATUS_COLORS: Record<string, { bg: string, color: string }> = {
  '已通过': { bg: '#dcfce7', color: '#166534' },
  '待审核': { bg: '#fef9c3', color: '#854d0e' },
  '已拒绝': { bg: '#fee2e2', color: '#991b1b' },
  '正常': { bg: '#dcfce7', color: '#166534' },
  '离线': { bg: '#fef9c3', color: '#854d0e' },
  '未接入': { bg: '#fee2e2', color: '#991b1b' },
}

// ============ 主组件 ============
export default function NationalReportPage() {
  const [activeTab, setActiveTab] = useState<'entry' | 'history' | 'province' | 'qc'>('entry')
  const [searchKeyword, setSearchKeyword] = useState('')

  // Tab1 表单状态
  const [formData, setFormData] = useState({
    date: '2026-04-28',
    doctor: '张明华',
    operationType: '胃镜检查',
    adr: '25.8',
    colonCompletionRate: '92.5',
    disinfectionRate: '98.2',
    equipmentRate: '96.8',
    platform: '国家平台',
    remarks: '',
  })

  // KPI数据
  const kpiData = [
    { label: '上报总数', value: '12,845', unit: '条', trend: '+328', trendUp: true, icon: FileText, color: '#3b82f6', bg: '#eff6ff' },
    { label: '上报率', value: '96.8', unit: '%', trend: '+2.1%', trendUp: true, icon: TrendingUp, color: '#22c55e', bg: '#f0fdf4' },
    { label: '待审核', value: '3', unit: '条', trend: '-5', trendUp: false, icon: Clock, color: '#f97316', bg: '#fff7ed' },
    { label: '自动通过', value: '98.2', unit: '%', trend: '+0.8%', trendUp: true, icon: CheckCircle, color: '#8b5cf6', bg: '#f5f3ff' },
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    alert('数据上报成功！\n\n上报日期：' + formData.date + '\n操作医生：' + formData.doctor + '\n操作类型：' + formData.operationType + '\nADR：' + formData.adr + '%\n肠镜完成率：' + formData.colonCompletionRate + '%')
  }

  const getStatusTag = (status: string) => {
    const colors = STATUS_COLORS[status] || { bg: '#f1f5f9', color: '#64748b' }
    return (
      <span style={{ ...s.tag, background: colors.bg, color: colors.color }}>
        {status === '已通过' && <Check size={12} />}
        {status === '待审核' && <Clock size={12} />}
        {status === '已拒绝' && <X size={12} />}
        {status === '正常' && <CheckCircle size={12} />}
        {status === '离线' && <AlertCircle size={12} />}
        {status === '未接入' && <X size={12} />}
        {status}
      </span>
    )
  }

  const renderKPI = () => (
    <div style={s.kpiGrid}>
      {kpiData.map((kpi, i) => (
        <div key={i} style={s.kpiCard}>
          <div style={s.kpiIconRow}>
            <div style={{ ...s.kpiIconWrap, background: kpi.bg }}>
              <kpi.icon size={22} color={kpi.color} />
            </div>
            <span style={{
              ...s.kpiTrend,
              background: kpi.trendUp ? '#dcfce7' : '#fee2e2',
              color: kpi.trendUp ? '#166534' : '#991b1b',
            }}>
              {kpi.trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {kpi.trend}
            </span>
          </div>
          <div style={s.kpiValue}>{kpi.value}<span style={{ fontSize: 14, color: '#64748b', fontWeight: 400 }}>{kpi.unit}</span></div>
          <div style={s.kpiLabel}>{kpi.label}</div>
        </div>
      ))}
    </div>
  )

  // Tab1: 上报录入
  const renderEntry = () => (
    <div style={s.tabContent}>
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 17, fontWeight: 600, color: '#1a3a5c', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Upload size={18} color="#3b82f6" />
          新增上报数据
        </h3>
        <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>填写以下信息，提交至国家消化内镜质控中心平台</p>
      </div>

      <div style={s.formGrid}>
        <div style={s.formGroup}>
          <label style={s.label}>上报日期</label>
          <input
            type="date"
            style={s.input}
            value={formData.date}
            onChange={e => handleInputChange('date', e.target.value)}
          />
        </div>
        <div style={s.formGroup}>
          <label style={s.label}>操作医生</label>
          <select
            style={s.select}
            value={formData.doctor}
            onChange={e => handleInputChange('doctor', e.target.value)}
          >
            <option value="张明华">张明华</option>
            <option value="李芳">李芳</option>
            <option value="王建国">王建国</option>
            <option value="刘洋">刘洋</option>
            <option value="陈晓燕">陈晓燕</option>
          </select>
        </div>
        <div style={s.formGroup}>
          <label style={s.label}>操作类型</label>
          <select
            style={s.select}
            value={formData.operationType}
            onChange={e => handleInputChange('operationType', e.target.value)}
          >
            <option value="胃镜检查">胃镜检查</option>
            <option value="肠镜检查">肠镜检查</option>
            <option value="ERCP">ERCP</option>
            <option value="超声内镜">超声内镜</option>
            <option value="胶囊内镜">胶囊内镜</option>
          </select>
        </div>
        <div style={s.formGroup}>
          <label style={s.label}>ADR（%）</label>
          <input
            type="number"
            style={s.input}
            value={formData.adr}
            onChange={e => handleInputChange('adr', e.target.value)}
            placeholder="请输入ADR值"
          />
        </div>
        <div style={s.formGroup}>
          <label style={s.label}>肠镜完成率（%）</label>
          <input
            type="number"
            style={s.input}
            value={formData.colonCompletionRate}
            onChange={e => handleInputChange('colonCompletionRate', e.target.value)}
            placeholder="请输入完成率"
          />
        </div>
        <div style={s.formGroup}>
          <label style={s.label}>洗消合规率（%）</label>
          <input
            type="number"
            style={s.input}
            value={formData.disinfectionRate}
            onChange={e => handleInputChange('disinfectionRate', e.target.value)}
            placeholder="请输入洗消合规率"
          />
        </div>
        <div style={s.formGroup}>
          <label style={s.label}>设备在位率（%）</label>
          <input
            type="number"
            style={s.input}
            value={formData.equipmentRate}
            onChange={e => handleInputChange('equipmentRate', e.target.value)}
            placeholder="请输入设备在位率"
          />
        </div>
        <div style={s.formGroup}>
          <label style={s.label}>上报平台</label>
          <select
            style={s.select}
            value={formData.platform}
            onChange={e => handleInputChange('platform', e.target.value)}
          >
            <option value="国家平台">国家平台（国家消化内镜质控中心）</option>
            <option value="山东省平台">山东省平台</option>
            <option value="河南省平台">河南省平台</option>
            <option value="浙江省平台">浙江省平台</option>
          </select>
        </div>
      </div>

      <div style={s.formGroup}>
        <label style={s.label}>备注说明</label>
        <textarea
          style={s.textarea}
          value={formData.remarks}
          onChange={e => handleInputChange('remarks', e.target.value)}
          placeholder="请输入备注说明（可选）"
        />
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        <button style={s.btnPrimary} onClick={handleSubmit}>
          <Upload size={16} />
          提交上报
        </button>
        <button style={s.btnSecondary}>
          <RefreshCw size={16} />
          重置表单
        </button>
      </div>
    </div>
  )

  // Tab2: 上报历史
  const renderHistory = () => {
    const filteredData = REPORT_HISTORY.filter(item =>
      item.content.includes(searchKeyword) ||
      item.doctor.includes(searchKeyword) ||
      item.status.includes(searchKeyword)
    )

    return (
      <div style={s.tabContent}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 600, color: '#1a3a5c', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={18} color="#3b82f6" />
              上报历史记录
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0 0' }}>共 {filteredData.length} 条上报记录</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{ ...s.btnSecondary, padding: '10px 20px' }}>
              <Download size={15} />
              导出数据
            </button>
          </div>
        </div>

        <div style={s.searchBar}>
          <input
            type="text"
            style={s.searchInput}
            placeholder="搜索上报内容、医生或状态..."
            value={searchKeyword}
            onChange={e => setSearchKeyword(e.target.value)}
          />
          <button style={s.btnSecondary}>
            <Search size={16} />
            搜索
          </button>
        </div>

        <div style={s.statsRow}>
          <div style={s.statItem}>
            <span style={s.statValue}>12,845</span>
            <span style={s.statLabel}>累计上报</span>
          </div>
          <div style={s.statItem}>
            <span style={{ ...s.statValue, color: '#22c55e' }}>12,568</span>
            <span style={s.statLabel}>已通过</span>
          </div>
          <div style={s.statItem}>
            <span style={{ ...s.statValue, color: '#f97316' }}>277</span>
            <span style={s.statLabel}>待审核</span>
          </div>
          <div style={s.statItem}>
            <span style={{ ...s.statValue, color: '#3b82f6' }}>98.2%</span>
            <span style={s.statLabel}>自动通过率</span>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>序号</th>
                <th style={s.th}>上报日期</th>
                <th style={s.th}>质控周期</th>
                <th style={s.th}>上报内容</th>
                <th style={s.th}>操作医生</th>
                <th style={s.th}>记录数</th>
                <th style={s.th}>状态</th>
                <th style={s.th}>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={8} style={s.emptyState}>
                    <ClipboardList size={48} style={s.emptyStateIcon} />
                    <div style={s.emptyStateText}>暂无上报记录</div>
                    <div style={s.emptyStateHint}>请先在「上报数据录入」中提交数据</div>
                  </td>
                </tr>
              ) : filteredData.map((item) => (
                <tr key={item.id}>
                  <td style={s.td}>{item.id}</td>
                  <td style={s.td}>{item.date}</td>
                  <td style={s.td}>{item.cycle}</td>
                  <td style={s.td}>{item.content}</td>
                  <td style={s.td}>{item.doctor}</td>
                  <td style={s.td}>{item.records}</td>
                  <td style={s.td}>{getStatusTag(item.status)}</td>
                  <td style={s.td}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button style={{ ...s.btnSm, background: '#eff6ff', color: '#3b82f6', border: 'none' }}>
                        <Eye size={13} />
                        查看
                      </button>
                      <button style={{ ...s.btnSm, background: '#f1f5f9', color: '#64748b', border: 'none' }}>
                        <Edit size={13} />
                        编辑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // Tab3: 省级平台
  const renderProvince = () => (
    <div style={s.tabContent}>
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 17, fontWeight: 600, color: '#1a3a5c', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Building2 size={18} color="#3b82f6" />
          省级平台接入状态
        </h3>
        <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0 0' }}>
          共 {PROVINCE_DATA.length} 个省级平台，其中 {PROVINCE_DATA.filter(p => p.connected).length} 个已接入
        </p>
      </div>

      <div style={{ ...s.statsRow, marginBottom: 24 }}>
        <div style={s.statItem}>
          <span style={s.statValue}>{PROVINCE_DATA.filter(p => p.connected).length}</span>
          <span style={s.statLabel}>已接入省份</span>
        </div>
        <div style={s.statItem}>
          <span style={{ ...s.statValue, color: '#f97316' }}>{PROVINCE_DATA.filter(p => !p.connected).length}</span>
          <span style={s.statLabel}>未接入省份</span>
        </div>
        <div style={s.statItem}>
          <span style={{ ...s.statValue, color: '#3b82f6' }}>{(PROVINCE_DATA.reduce((sum, p) => sum + p.dataVolume, 0)).toLocaleString()}</span>
          <span style={s.statLabel}>累计数据量</span>
        </div>
        <div style={s.statItem}>
          <span style={{ ...s.statValue, color: '#22c55e' }}>96.8%</span>
          <span style={s.statLabel}>平均覆盖率</span>
        </div>
      </div>

      <div style={s.provinceGrid}>
        {PROVINCE_DATA.map((province, i) => (
          <div key={i} style={{
            ...s.provinceCard,
            borderColor: province.connected ? '#e2e8f0' : '#fee2e2',
          }}>
            <div style={s.provinceHeader}>
              <div style={s.provinceName}>
                <MapPin size={16} color={province.connected ? '#3b82f6' : '#94a3b8'} />
                {province.province}
              </div>
              {getStatusTag(province.status)}
            </div>
            <div style={s.provinceStats}>
              <div style={s.provinceStat}>
                <span style={s.provinceStatLabel}>数据量</span>
                <span style={s.provinceStatValue}>{province.dataVolume > 0 ? province.dataVolume.toLocaleString() : '-'}</span>
              </div>
              <div style={s.provinceStat}>
                <span style={s.provinceStatLabel}>覆盖率</span>
                <span style={{ ...s.provinceStatValue, color: province.coverage >= 90 ? '#22c55e' : province.coverage > 0 ? '#f97316' : '#94a3b8' }}>
                  {province.coverage > 0 ? province.coverage + '%' : '-'}
                </span>
              </div>
            </div>
            <div style={{ marginTop: 12, fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={11} />
              最后上报: {province.lastReport}
            </div>
            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              {province.connected ? (
                <>
                  <button style={{ ...s.btnSm, background: '#eff6ff', color: '#3b82f6', border: 'none', flex: 1 }}>
                    <Link2 size={13} />
                    查看详情
                  </button>
                  <button style={{ ...s.btnSm, background: '#f0fdf4', color: '#22c55e', border: 'none' }}>
                    <RefreshCw size={13} />
                  </button>
                </>
              ) : (
                <button style={{ ...s.btnSm, background: '#fef9c3', color: '#854d0e', border: 'none', flex: 1 }}>
                  <AlertCircle size={13} />
                  申请接入
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  // Tab4: 质控指标
  const renderQC = () => (
    <div style={s.tabContent}>
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 17, fontWeight: 600, color: '#1a3a5c', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Target size={18} color="#3b82f6" />
          质控指标分析
        </h3>
        <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0 0' }}>
          国家消化内镜质控中心关键指标监控
        </p>
      </div>

      <div style={s.qcGrid}>
        {/* ADR趋势 */}
        <div style={s.qcCard}>
          <div style={s.qcCardTitle}>
            <TrendingUp size={16} color="#3b82f6" />
            ADR（腺瘤检出率）趋势
          </div>
          <div style={s.qcTrend}>
            <span style={s.qcValue}>27.8%</span>
            <span style={s.qcUnit}>当前值</span>
            <span style={{ ...s.kpiTrend, background: '#dcfce7', color: '#166534', marginLeft: 'auto' }}>
              <ArrowUpRight size={12} /> +5.3%
            </span>
          </div>
          <div style={s.baseline}>
            <span style={{ color: '#22c55e' }}>●</span>
            <span>国家基准线: 25%</span>
          </div>
          <div style={s.miniChart}>
            {ADR_TREND.map((item, i) => (
              <div
                key={i}
                style={{
                  ...s.miniBar,
                  height: (item.adr / 30 * 100) + '%',
                  background: item.adr >= 25 ? '#22c55e' : '#94a3b8',
                }}
                title={`${item.month}: ${item.adr}%`}
              />
            ))}
          </div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, textAlign: 'center' }}>
            近10个月趋势
          </div>
        </div>

        {/* 肠镜完成率 */}
        <div style={s.qcCard}>
          <div style={s.qcCardTitle}>
            <CheckCircle size={16} color="#22c55e" />
            肠镜完成率
          </div>
          <div style={s.qcTrend}>
            <span style={s.qcValue}>92.5%</span>
            <span style={s.qcUnit}>当前值</span>
            <span style={{ ...s.kpiTrend, background: '#dcfce7', color: '#166534', marginLeft: 'auto' }}>
              <ArrowUpRight size={12} /> +1.8%
            </span>
          </div>
          <div style={s.baseline}>
            <span style={{ color: '#22c55e' }}>●</span>
            <span>国家基准线: 90%</span>
          </div>
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: '2026-04', value: 92.5, color: '#22c55e' },
              { label: '2026-03', value: 91.2, color: '#22c55e' },
              { label: '2026-02', value: 90.8, color: '#22c55e' },
              { label: '2026-01', value: 89.5, color: '#94a3b8' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: '#64748b', width: 50 }}>{item.label}</span>
                <div style={{ ...s.qcBar, flex: 1 }}>
                  <div style={{ ...s.qcBarFill, width: item.value + '%', background: item.color }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#1a3a5c', width: 40 }}>{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* 并发症率 */}
        <div style={s.qcCard}>
          <div style={s.qcCardTitle}>
            <AlertTriangle size={16} color="#f97316" />
            并发症发生率
          </div>
          <div style={s.qcTrend}>
            <span style={{ ...s.qcValue, color: '#22c55e' }}>0.42%</span>
            <span style={s.qcUnit}>当前值</span>
            <span style={{ ...s.kpiTrend, background: '#dcfce7', color: '#166534', marginLeft: 'auto' }}>
              <ArrowDownRight size={12} /> -0.12%
            </span>
          </div>
          <div style={s.baseline}>
            <span style={{ color: '#f97316' }}>●</span>
            <span>国家基准线: ≤0.5%</span>
          </div>
          <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
            {[
              { name: '出血', count: 8, rate: 0.28 },
              { name: '穿孔', count: 2, rate: 0.07 },
              { name: '感染', count: 3, rate: 0.11 },
            ].map((item, i) => (
              <div key={i} style={{
                flex: 1,
                background: '#f8fafc',
                borderRadius: 8,
                padding: '10px 12px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#1a3a5c' }}>{item.count}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{item.name}</div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>{item.rate}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* 上报及时率 */}
        <div style={s.qcCard}>
          <div style={s.qcCardTitle}>
            <Clock size={16} color="#8b5cf6" />
            上报及时率
          </div>
          <div style={s.qcTrend}>
            <span style={s.qcValue}>98.5%</span>
            <span style={s.qcUnit}>当前值</span>
            <span style={{ ...s.kpiTrend, background: '#dcfce7', color: '#166534', marginLeft: 'auto' }}>
              <ArrowUpRight size={12} /> +0.5%
            </span>
          </div>
          <div style={s.baseline}>
            <span style={{ color: '#22c55e' }}>●</span>
            <span>国家基准线: ≥95%</span>
          </div>
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: '#64748b' }}>完成度</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#1a3a5c' }}>98.5%</span>
            </div>
            <div style={s.qcBar}>
              <div style={{ ...s.qcBarFill, width: '98.5%', background: 'linear-gradient(90deg, #8b5cf6, #a78bfa)' }} />
            </div>
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <div style={{ flex: 1, textAlign: 'center', padding: '8px', background: '#f0fdf4', borderRadius: 6 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#166534' }}>12,656</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>及时上报</div>
            </div>
            <div style={{ flex: 1, textAlign: 'center', padding: '8px', background: '#fef9c3', borderRadius: 6 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#854d0e' }}>189</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>延迟上报</div>
            </div>
          </div>
        </div>
      </div>

      {/* 各省ADR对比 */}
      <div style={s.qcCard}>
        <div style={s.qcCardTitle}>
          <BarChart3 size={16} color="#3b82f6" />
          各省ADR对比
          <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 400, marginLeft: 'auto' }}>
            目标值: ≥25%
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {PROVINCE_ADR.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 13, color: '#64748b', width: 50 }}>{item.province}</span>
              <div style={{ flex: 1 }}>
                <div style={{ ...s.qcBar, marginTop: 0, height: 20, position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: '62.5%',
                    top: -4,
                    bottom: -4,
                    width: 2,
                    background: '#ef4444',
                    borderRadius: 1,
                  }} />
                  <div style={{
                    ...s.qcBarFill,
                    width: (item.adr / 35 * 100) + '%',
                    background: item.adr >= 25 ? '#22c55e' : '#94a3b8',
                  }} />
                </div>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: item.adr >= 25 ? '#166534' : '#64748b', width: 40 }}>
                {item.adr}%
              </span>
              {item.adr >= 25 ? (
                <CheckCircle size={14} color="#22c55e" />
              ) : (
                <AlertCircle size={14} color="#94a3b8" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const tabs = [
    { key: 'entry', label: '上报录入', icon: Upload },
    { key: 'history', label: '上报历史', icon: FileText },
    { key: 'province', label: '省级平台', icon: Building2 },
    { key: 'qc', label: '质控指标', icon: Target },
  ]

  return (
    <div style={s.root}>
      {/* 标题区 */}
      <div style={s.header}>
        <h1 style={s.title}>
          <ShieldAlert size={26} color="#1a3a5c" />
          国家数据上报
        </h1>
        <p style={s.subtitle}>
          国家消化内镜质控中心数据上报 · 省级平台对接 · 质控指标监控
        </p>
      </div>

      {/* KPI卡片 */}
      {renderKPI()}

      {/* Tab导航 */}
      <div style={s.tabNav}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            style={{
              ...s.tabButton,
              background: activeTab === tab.key ? '#fff' : 'transparent',
              color: activeTab === tab.key ? '#1a3a5c' : '#64748b',
              boxShadow: activeTab === tab.key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
            onClick={() => setActiveTab(tab.key as any)}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab内容 */}
      {activeTab === 'entry' && renderEntry()}
      {activeTab === 'history' && renderHistory()}
      {activeTab === 'province' && renderProvince()}
      {activeTab === 'qc' && renderQC()}
    </div>
  )
}
