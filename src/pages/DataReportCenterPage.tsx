// @ts-nocheck
// ============================================================
// G003 超声RIS系统 - 卫健委数据上报中心页面
// 数据上报/上报记录/模拟接口/统计概览
// 对标：国家卫生健康委员会数据上报接口规范
// ============================================================
import { useState } from 'react'
import {
  Upload, FileText, Clock, CheckCircle, AlertTriangle,
  BarChart3, Database, Activity, ShieldCheck,
  Search, Download, RefreshCw, Eye, Edit, Trash2,
  Play, Pause, Settings, Wifi, WifiOff, Check,
  X, ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown,
  Plus, Filter, ChevronDown, ChevronUp, Link2, Globe,
  Server, TestTube, PieChart, ListChecks, ClipboardList
} from 'lucide-react'

// ============ 类型定义 ============
interface ReportRecord {
  id: number
  reportId: string
  reportType: string
  cycle: string
  reportTime: string
  status: '已上报' | '待上报' | '上报失败' | '审核通过' | '审核驳回'
  records: number
  operator: string
  platform: string
}

interface MockInterface {
  id: number
  name: string
  url: string
  method: 'POST' | 'GET' | 'PUT' | 'DELETE'
  status: '在线' | '离线' | '测试中'
  lastTest: string
  responseTime: number
  successRate: number
}

interface StatsOverview {
  totalReports: number
  totalRecords: number
  successRate: number
  avgResponseTime: number
  todayReports: number
  todayRecords: number
  weekReports: number
  monthReports: number
  pendingReports: number
  failedReports: number
}

// ============ 演示数据 ============
const REPORT_RECORDS: ReportRecord[] = [
  { id: 1, reportId: 'WJ-2026-0428-001', reportType: '检查数据上报', cycle: '2026年4月', reportTime: '2026-04-28 14:32', status: '审核通过', records: 428, operator: '张伟', platform: '国家卫健委平台' },
  { id: 2, reportId: 'WJ-2026-0428-002', reportType: '质控指标上报', cycle: '2026年4月', reportTime: '2026-04-28 11:15', status: '审核通过', records: 156, operator: '李娜', platform: '国家卫健委平台' },
  { id: 3, reportId: 'WJ-2026-0427-001', reportType: '检查数据上报', cycle: '2026年4月', reportTime: '2026-04-27 16:45', status: '审核通过', records: 386, operator: '王芳', platform: '省级平台' },
  { id: 4, reportId: 'WJ-2026-0427-002', reportType: '设备数据上报', cycle: '2026年4月', reportTime: '2026-04-27 09:20', status: '待上报', records: 52, operator: '刘洋', platform: '国家卫健委平台' },
  { id: 5, reportId: 'WJ-2026-0426-001', reportType: '检查数据上报', cycle: '2026年4月', reportTime: '2026-04-26 10:08', status: '上报失败', records: 0, operator: '陈静', platform: '国家卫健委平台' },
  { id: 6, reportId: 'WJ-2026-0425-001', reportType: '质控指标上报', cycle: '2026年4月', reportTime: '2026-04-25 15:30', status: '审核通过', records: 245, operator: '赵强', platform: '国家卫健委平台' },
  { id: 7, reportId: 'WJ-2026-0424-001', reportType: '检查数据上报', cycle: '2026年4月', reportTime: '2026-04-24 08:40', status: '审核通过', records: 512, operator: '孙丽', platform: '省级平台' },
  { id: 8, reportId: 'WJ-2026-0423-001', reportType: '人员数据上报', cycle: '2026年4月', reportTime: '2026-04-23 14:18', status: '审核驳回', records: 38, operator: '周明', platform: '国家卫健委平台' },
  { id: 9, reportId: 'WJ-2026-0422-001', reportType: '检查数据上报', cycle: '2026年4月', reportTime: '2026-04-22 11:05', status: '审核通过', records: 478, operator: '吴霞', platform: '国家卫健委平台' },
  { id: 10, reportId: 'WJ-2026-0421-001', reportType: '质控指标上报', cycle: '2026年4月', reportTime: '2026-04-21 16:22', status: '审核通过', records: 189, operator: '郑涛', platform: '省级平台' },
]

const MOCK_INTERFACES: MockInterface[] = [
  { id: 1, name: '检查数据上报接口', url: '/api/wjw/report/exam', method: 'POST', status: '在线', lastTest: '2026-04-28 14:32', responseTime: 120, successRate: 98.5 },
  { id: 2, name: '质控指标上报接口', url: '/api/wjw/report/qc', method: 'POST', status: '在线', lastTest: '2026-04-28 11:15', responseTime: 85, successRate: 99.2 },
  { id: 3, name: '设备数据上报接口', url: '/api/wjw/report/equipment', method: 'POST', status: '在线', lastTest: '2026-04-27 09:20', responseTime: 95, successRate: 97.8 },
  { id: 4, name: '人员数据上报接口', url: '/api/wjw/report/staff', method: 'POST', status: '离线', lastTest: '2026-04-23 14:18', responseTime: 0, successRate: 0 },
  { id: 5, name: '数据查询接口', url: '/api/wjw/query', method: 'GET', status: '在线', lastTest: '2026-04-28 16:45', responseTime: 65, successRate: 100 },
  { id: 6, name: '上报记录查询接口', url: '/api/wjw/report/history', method: 'GET', status: '在线', lastTest: '2026-04-28 15:30', responseTime: 78, successRate: 99.5 },
  { id: 7, name: '数据校核接口', url: '/api/wjw/verify', method: 'POST', status: '测试中', lastTest: '2026-04-28 10:00', responseTime: 150, successRate: 85.2 },
  { id: 8, name: '附件上传接口', url: '/api/wjw/upload', method: 'POST', status: '在线', lastTest: '2026-04-27 16:20', responseTime: 230, successRate: 96.5 },
]

const REPORT_TYPES = [
  { value: 'exam', label: '检查数据上报' },
  { value: 'qc', label: '质控指标上报' },
  { value: 'equipment', label: '设备数据上报' },
  { value: 'staff', label: '人员数据上报' },
  { value: 'income', label: '收入数据上报' },
]

const PLATFORMS = [
  { value: 'national', label: '国家卫健委平台' },
  { value: 'province', label: '省级平台' },
  { value: 'city', label: '市级平台' },
]

// ============ 样式 ============
const s: Record<string, React.CSSProperties> = {
  root: { padding: '32px', background: '#f0f4f8', minHeight: '100vh' },
  header: { marginBottom: 24 },
  title: { fontSize: 22, fontWeight: 700, color: '#1a3a5c', margin: 0, display: 'flex', alignItems: 'center', gap: 10 },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 6 },
  // KPI卡片
  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 },
  kpiCard: { background: '#fff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 8 },
  kpiIconRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  kpiIconWrap: { width: 44, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  kpiTrend: { fontSize: 12, fontWeight: 600, padding: '2px 8px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 2 },
  kpiValue: { fontSize: 28, fontWeight: 700, color: '#1a3a5c', lineHeight: 1.2 },
  kpiLabel: { fontSize: 13, color: '#64748b' },
  // Tab导航
  tabNav: { display: 'flex', gap: 4, background: '#f1f5f9', padding: 4, borderRadius: 10, marginBottom: 20 },
  tabButton: { flex: 1, padding: '12px 16px', borderRadius: 8, border: 'none', fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 },
  tabContent: { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  // 表单
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 20 },
  formGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: '#475569' },
  input: { padding: '12px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none', transition: 'border-color 0.2s' },
  select: { padding: '12px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none', background: '#fff' },
  textarea: { padding: '12px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none', minHeight: 100, resize: 'vertical' },
  // 按钮
  btnPrimary: { background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, padding: '14px 28px', fontSize: 15, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 },
  btnSecondary: { background: '#fff', color: '#1a3a5c', border: '1px solid #e2e8f0', borderRadius: 8, padding: '14px 28px', fontSize: 15, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 },
  btnSuccess: { background: '#22c55e', color: '#fff', border: 'none', borderRadius: 8, padding: '14px 28px', fontSize: 15, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 },
  btnDanger: { background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, padding: '14px 28px', fontSize: 15, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 },
  btnSm: { padding: '8px 16px', borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 },
  btnIcon: { padding: '8px', borderRadius: 6, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  // 表格
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: { textAlign: 'left', padding: '12px 16px', background: '#f8fafc', color: '#64748b', fontWeight: 600, borderBottom: '1px solid #e2e8f0' },
  td: { padding: '12px 16px', borderBottom: '1px solid #e2e8f0', color: '#1a3a5c' },
  // 状态标签
  tag: { padding: '4px 12px', borderRadius: 12, fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 },
  // 搜索栏
  searchBar: { display: 'flex', gap: 12, marginBottom: 20 },
  searchInput: { flex: 1, padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none' },
  // 统计行
  statsRow: { display: 'flex', gap: 24, marginBottom: 20, padding: '16px 20px', background: '#f8fafc', borderRadius: 8 },
  statItem: { display: 'flex', alignItems: 'center', gap: 8 },
  statValue: { fontSize: 18, fontWeight: 700, color: '#1a3a5c' },
  statLabel: { fontSize: 13, color: '#64748b' },
  // 接口卡片
  interfaceGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 20 },
  interfaceCard: { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' },
  interfaceHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  interfaceName: { fontSize: 15, fontWeight: 600, color: '#1a3a5c', display: 'flex', alignItems: 'center', gap: 6 },
  interfaceUrl: { fontSize: 12, color: '#64748b', fontFamily: 'monospace', marginTop: 4 },
  interfaceStats: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 12 },
  interfaceStat: { display: 'flex', flexDirection: 'column', gap: 2 },
  interfaceStatLabel: { fontSize: 11, color: '#94a3b8' },
  interfaceStatValue: { fontSize: 16, fontWeight: 700, color: '#1a3a5c' },
  // 方法标签
  methodBadge: { padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, fontFamily: 'monospace' },
  // 图表区域
  chartSection: { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 20 },
  chartTitle: { fontSize: 15, fontWeight: 600, color: '#1a3a5c', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 },
  miniChart: { display: 'flex', alignItems: 'flex-end', gap: 4, height: 60, marginTop: 12 },
  miniBar: { flex: 1, background: '#3b82f6', borderRadius: '3px 3px 0 0', minWidth: 12 },
  // 过滤器
  filterBar: { display: 'flex', gap: 12, alignItems: 'center', background: '#f8fafc', padding: '16px 20px', borderRadius: 10, marginBottom: 20, flexWrap: 'wrap' as const },
  filterGroup: { display: 'flex', alignItems: 'center', gap: 8 },
  filterLabel: { fontSize: 13, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 },
  filterSelect: { padding: '8px 12px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 13, color: '#1a3a5c', background: '#fff', cursor: 'pointer', minWidth: 140 },
  filterInput: { padding: '8px 12px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 13, color: '#1a3a5c', background: '#fff', minWidth: 160 },
  // 响应展示
  responseBox: { background: '#1e293b', borderRadius: 8, padding: 16, marginTop: 16, fontFamily: 'monospace', fontSize: 12, color: '#e2e8f0', maxHeight: 300, overflow: 'auto' },
  responseLine: { marginBottom: 4 },
  // 空状态
  emptyState: { textAlign: 'center', padding: '48px 20px', color: '#94a3b8', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 },
  emptyStateIcon: { opacity: 0.35 },
  emptyStateText: { fontSize: 14, color: '#64748b', fontWeight: 500 },
}

// ============ 状态颜色映射 ============
const STATUS_COLORS: Record<string, { bg: string, color: string }> = {
  '已上报': { bg: '#dcfce7', color: '#166534' },
  '待上报': { bg: '#fef9c3', color: '#854d0e' },
  '上报失败': { bg: '#fee2e2', color: '#991b1b' },
  '审核通过': { bg: '#dcfce7', color: '#166534' },
  '审核驳回': { bg: '#fee2e2', color: '#991b1b' },
  '在线': { bg: '#dcfce7', color: '#166534' },
  '离线': { bg: '#fee2e2', color: '#991b1b' },
  '测试中': { bg: '#fef9c3', color: '#854d0e' },
}

const METHOD_COLORS: Record<string, { bg: string, color: string }> = {
  'POST': { bg: '#dcfce7', color: '#166534' },
  'GET': { bg: '#dbeafe', color: '#2563eb' },
  'PUT': { bg: '#fef9c3', color: '#854d0e' },
  'DELETE': { bg: '#fee2e2', color: '#991b1b' },
}

// ============ 主组件 ============
export default function DataReportCenterPage() {
  const [activeTab, setActiveTab] = useState<'report' | 'record' | 'mock' | 'stats'>('report')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [testResponse, setTestResponse] = useState<string | null>(null)
  const [testing, setTesting] = useState<number | null>(null)

  // Tab1 表单状态
  const [formData, setFormData] = useState({
    reportType: 'exam',
    cycle: '2026-04',
    platform: 'national',
    remarks: '',
  })

  // KPI数据
  const stats: StatsOverview = {
    totalReports: 1248,
    totalRecords: 48652,
    successRate: 98.2,
    avgResponseTime: 112,
    todayReports: 12,
    todayRecords: 428,
    weekReports: 86,
    monthReports: 356,
    pendingReports: 5,
    failedReports: 2,
  }

  const kpiData = [
    { label: '累计上报', value: stats.totalReports.toLocaleString(), unit: '次', trend: '+12', trendUp: true, icon: FileText, color: '#3b82f6', bg: '#eff6ff' },
    { label: '上报成功率', value: stats.successRate, unit: '%', trend: '+0.8%', trendUp: true, icon: CheckCircle, color: '#22c55e', bg: '#f0fdf4' },
    { label: '待上报', value: stats.pendingReports, unit: '条', trend: '-3', trendUp: false, icon: Clock, color: '#f97316', bg: '#fff7ed' },
    { label: '平均响应', value: stats.avgResponseTime, unit: 'ms', trend: '-15ms', trendUp: true, icon: Activity, color: '#8b5cf6', bg: '#f5f3ff' },
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    alert(`数据上报成功！\n\n报表类型：${REPORT_TYPES.find(t => t.value === formData.reportType)?.label}\n上报周期：${formData.cycle}\n上报平台：${PLATFORMS.find(p => p.value === formData.platform)?.label}`)
  }

  const handleTestInterface = (iface: MockInterface) => {
    setTesting(iface.id)
    setTestResponse(null)
    setTimeout(() => {
      setTesting(null)
      const success = iface.status !== '离线' && Math.random() > 0.2
      setTestResponse(JSON.stringify({
        code: success ? 200 : 500,
        message: success ? '成功' : '服务器内部错误',
        data: success ? {
          reportId: `WJ-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
          records: Math.floor(Math.random() * 500) + 100,
          timestamp: new Date().toISOString()
        } : null,
        responseTime: Math.floor(Math.random() * 100) + 50
      }, null, 2))
    }, 1500)
  }

  const getStatusTag = (status: string) => {
    const colors = STATUS_COLORS[status] || { bg: '#f1f5f9', color: '#64748b' }
    return (
      <span style={{ ...s.tag, background: colors.bg, color: colors.color }}>
        {status === '已上报' || status === '审核通过' ? <CheckCircle size={12} /> :
         status === '待上报' ? <Clock size={12} /> :
         status === '上报失败' || status === '审核驳回' ? <X size={12} /> :
         status === '在线' ? <Wifi size={12} /> :
         status === '离线' ? <WifiOff size={12} /> :
         <Activity size={12} />}
        {status}
      </span>
    )
  }

  // ============ Tab1: 数据上报 ============
  const renderReport = () => (
    <div style={s.tabContent}>
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 17, fontWeight: 600, color: '#1a3a5c', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Upload size={18} color="#3b82f6" />
          新增上报数据
        </h3>
        <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>填写以下信息，提交至卫健委数据上报平台</p>
      </div>

      <div style={s.formGrid}>
        <div style={s.formGroup}>
          <label style={s.label}>报表类型</label>
          <select style={s.select} value={formData.reportType} onChange={e => handleInputChange('reportType', e.target.value)}>
            {REPORT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div style={s.formGroup}>
          <label style={s.label}>上报周期</label>
          <input type="month" style={s.input} value={formData.cycle} onChange={e => handleInputChange('cycle', e.target.value)} />
        </div>
        <div style={s.formGroup}>
          <label style={s.label}>上报平台</label>
          <select style={s.select} value={formData.platform} onChange={e => handleInputChange('platform', e.target.value)}>
            {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
        <div style={s.formGroup}>
          <label style={s.label}>上报日期</label>
          <input type="date" style={s.input} value={new Date().toISOString().split('T')[0]} onChange={e => {}} />
        </div>
      </div>

      <div style={s.formGroup}>
        <label style={s.label}>备注说明</label>
        <textarea style={s.textarea} value={formData.remarks} onChange={e => handleInputChange('remarks', e.target.value)} placeholder="请输入备注说明（可选）" />
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
        <button style={s.btnSecondary}>
          <Eye size={16} />
          预览数据
        </button>
      </div>
    </div>
  )

  // ============ Tab2: 上报记录 ============
  const renderRecord = () => {
    const filteredData = REPORT_RECORDS.filter(item => {
      const matchKeyword = item.reportId.includes(searchKeyword) || item.reportType.includes(searchKeyword) || item.operator.includes(searchKeyword)
      const matchStatus = filterStatus === 'all' || item.status === filterStatus
      const matchType = filterType === 'all' || item.reportType.includes(filterType)
      return matchKeyword && matchStatus && matchType
    })

    return (
      <div style={s.tabContent}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 600, color: '#1a3a5c', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
              <ClipboardList size={18} color="#3b82f6" />
              上报记录
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

        <div style={s.filterBar}>
          <div style={s.filterGroup}>
            <span style={s.filterLabel}><Search size={16} />关键词搜索</span>
            <input type="text" style={s.filterInput} placeholder="搜索报表ID、类型或操作人..." value={searchKeyword} onChange={e => setSearchKeyword(e.target.value)} />
          </div>
          <div style={s.filterGroup}>
            <span style={s.filterLabel}><Filter size={16} />状态</span>
            <select style={s.filterSelect} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="all">全部状态</option>
              <option value="已上报">已上报</option>
              <option value="待上报">待上报</option>
              <option value="上报失败">上报失败</option>
              <option value="审核通过">审核通过</option>
              <option value="审核驳回">审核驳回</option>
            </select>
          </div>
          <div style={s.filterGroup}>
            <span style={s.filterLabel}><FileText size={16} />类型</span>
            <select style={s.filterSelect} value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value="all">全部类型</option>
              {REPORT_TYPES.map(t => <option key={t.value} value={t.label}>{t.label}</option>)}
            </select>
          </div>
        </div>

        <div style={s.statsRow}>
          <div style={s.statItem}>
            <span style={s.statValue}>{stats.totalReports.toLocaleString()}</span>
            <span style={s.statLabel}>累计上报</span>
          </div>
          <div style={s.statItem}>
            <span style={{ ...s.statValue, color: '#22c55e' }}>{stats.totalRecords.toLocaleString()}</span>
            <span style={s.statLabel}>累计记录</span>
          </div>
          <div style={s.statItem}>
            <span style={{ ...s.statValue, color: '#f97316' }}>{stats.pendingReports}</span>
            <span style={s.statLabel}>待上报</span>
          </div>
          <div style={s.statItem}>
            <span style={{ ...s.statValue, color: '#ef4444' }}>{stats.failedReports}</span>
            <span style={s.statLabel}>上报失败</span>
          </div>
          <div style={s.statItem}>
            <span style={{ ...s.statValue, color: '#3b82f6' }}>{stats.successRate}%</span>
            <span style={s.statLabel}>成功率</span>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>序号</th>
                <th style={s.th}>报表ID</th>
                <th style={s.th}>报表类型</th>
                <th style={s.th}>上报周期</th>
                <th style={s.th}>上报时间</th>
                <th style={s.th}>记录数</th>
                <th style={s.th}>状态</th>
                <th style={s.th}>操作人</th>
                <th style={s.th}>平台</th>
                <th style={s.th}>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={10} style={s.emptyState}>
                    <ClipboardList size={48} style={s.emptyStateIcon} />
                    <div style={s.emptyStateText}>暂无上报记录</div>
                  </td>
                </tr>
              ) : filteredData.map((item) => (
                <tr key={item.id}>
                  <td style={s.td}>{item.id}</td>
                  <td style={{ ...s.td, fontFamily: 'monospace', fontSize: 12 }}>{item.reportId}</td>
                  <td style={s.td}>{item.reportType}</td>
                  <td style={s.td}>{item.cycle}</td>
                  <td style={s.td}>{item.reportTime}</td>
                  <td style={s.td}>{item.records}</td>
                  <td style={s.td}>{getStatusTag(item.status)}</td>
                  <td style={s.td}>{item.operator}</td>
                  <td style={s.td}>{item.platform}</td>
                  <td style={s.td}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button style={{ ...s.btnSm, background: '#eff6ff', color: '#3b82f6', border: 'none' }}>
                        <Eye size={13} />查看
                      </button>
                      <button style={{ ...s.btnSm, background: '#f1f5f9', color: '#64748b', border: 'none' }}>
                        <Download size={13} />下载
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

  // ============ Tab3: 模拟接口 ============
  const renderMock = () => (
    <div style={s.tabContent}>
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 17, fontWeight: 600, color: '#1a3a5c', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
          <TestTube size={18} color="#3b82f6" />
          模拟接口测试
        </h3>
        <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0 0' }}>测试卫健委数据上报接口可用性和响应情况</p>
      </div>

      <div style={s.interfaceGrid}>
        {MOCK_INTERFACES.map((iface) => {
          const methodColors = METHOD_COLORS[iface.method] || { bg: '#f1f5f9', color: '#64748b' }
          return (
            <div key={iface.id} style={{ ...s.interfaceCard, borderColor: iface.status === '离线' ? '#fee2e2' : '#e2e8f0' }}>
              <div style={s.interfaceHeader}>
                <div>
                  <div style={s.interfaceName}>
                    <Server size={16} color={iface.status === '离线' ? '#94a3b8' : '#3b82f6'} />
                    {iface.name}
                    {getStatusTag(iface.status)}
                  </div>
                  <div style={s.interfaceUrl}>{iface.url}</div>
                </div>
                <span style={{ ...s.methodBadge, background: methodColors.bg, color: methodColors.color }}>{iface.method}</span>
              </div>

              <div style={s.interfaceStats}>
                <div style={s.interfaceStat}>
                  <span style={s.interfaceStatLabel}>响应时间</span>
                  <span style={s.interfaceStatValue}>{iface.responseTime > 0 ? `${iface.responseTime}ms` : '-'}</span>
                </div>
                <div style={s.interfaceStat}>
                  <span style={s.interfaceStatLabel}>成功率</span>
                  <span style={{ ...s.interfaceStatValue, color: iface.successRate >= 95 ? '#22c55e' : iface.successRate >= 80 ? '#f97316' : '#ef4444' }}>
                    {iface.successRate > 0 ? `${iface.successRate}%` : '-'}
                  </span>
                </div>
                <div style={s.interfaceStat}>
                  <span style={s.interfaceStatLabel}>最后测试</span>
                  <span style={{ ...s.interfaceStatValue, fontSize: 12, fontWeight: 500 }}>{iface.lastTest}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button
                  style={{ ...s.btnSm, background: iface.status === '离线' ? '#f1f5f9' : '#eff6ff', color: iface.status === '离线' ? '#94a3b8' : '#3b82f6', border: 'none', flex: 1 }}
                  onClick={() => handleTestInterface(iface)}
                  disabled={testing !== null || iface.status === '离线'}
                >
                  {testing === iface.id ? (
                    <><RefreshCw size={13} className="animate-spin" /> 测试中...</>
                  ) : (
                    <><Play size={13} /> 测试接口</>
                  )}
                </button>
                <button style={{ ...s.btnSm, background: '#f1f5f9', color: '#64748b', border: 'none' }}>
                  <Settings size={13} />
                </button>
              </div>

              {testResponse && testing === null && (
                <div style={s.responseBox}>
                  <div style={{ color: '#94a3b8', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Link2 size={12} /> 响应结果
                  </div>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap', color: '#e2e8f0' }}>
                    {testResponse}
                  </pre>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )

  // ============ Tab4: 统计概览 ============
  const renderStats = () => {
    const monthlyData = [
      { month: '1月', reports: 245, success: 240, rate: 98.0 },
      { month: '2月', reports: 198, success: 195, rate: 98.5 },
      { month: '3月', reports: 312, success: 308, rate: 98.7 },
      { month: '4月', reports: 356, success: 352, rate: 98.9 },
    ]
    const typeData = [
      { type: '检查数据上报', count: 1825, color: '#3b82f6' },
      { type: '质控指标上报', count: 486, color: '#22c55e' },
      { type: '设备数据上报', count: 128, color: '#f97316' },
      { type: '人员数据上报', count: 56, color: '#8b5cf6' },
    ]

    return (
      <div style={s.tabContent}>
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 17, fontWeight: 600, color: '#1a3a5c', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
            <PieChart size={18} color="#3b82f6" />
            统计概览
          </h3>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0 0' }}>卫健委数据上报整体情况分析</p>
        </div>

        {/* KPI卡片 */}
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

        {/* 趋势图表 */}
        <div style={s.chartSection}>
          <div style={s.chartTitle}><TrendingUp size={16} color="#3b82f6" />月度上报趋势</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, height: 200 }}>
            {monthlyData.map((item, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 160 }}>
                  <div style={{ width: 40, background: '#3b82f6', borderRadius: '4px 4px 0 0', height: `${(item.reports / 400) * 100}%`, minHeight: 20 }} />
                  <div style={{ width: 40, background: '#22c55e', borderRadius: '4px 4px 0 0', height: `${(item.success / 400) * 100}%`, minHeight: 20 }} />
                </div>
                <span style={{ fontSize: 12, color: '#64748b' }}>{item.month}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#1a3a5c' }}>{item.reports}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b' }}>
              <div style={{ width: 12, height: 12, background: '#3b82f6', borderRadius: 2 }} /> 上报数
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b' }}>
              <div style={{ width: 12, height: 12, background: '#22c55e', borderRadius: 2 }} /> 成功数
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* 报表类型分布 */}
          <div style={s.chartSection}>
            <div style={s.chartTitle}><PieChart size={16} color="#3b82f6" />报表类型分布</div>
            {typeData.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }} />
                <span style={{ flex: 1, fontSize: 13, color: '#475569' }}>{item.type}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#1a3a5c' }}>{item.count}</span>
                <div style={{ width: 100, height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${(item.count / 2000) * 100}%`, height: '100%', background: item.color }} />
                </div>
              </div>
            ))}
          </div>

          {/* 成功率统计 */}
          <div style={s.chartSection}>
            <div style={s.chartTitle}><CheckCircle size={16} color="#22c55e" />成功率统计</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { label: '检查数据上报', rate: 99.2, total: 1825, success: 1810 },
                { label: '质控指标上报', rate: 98.5, total: 486, success: 479 },
                { label: '设备数据上报', rate: 97.8, total: 128, success: 125 },
                { label: '人员数据上报', rate: 96.4, total: 56, success: 54 },
              ].map((item, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, color: '#475569' }}>{item.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#1a3a5c' }}>{item.rate}% ({item.success}/{item.total})</span>
                  </div>
                  <div style={{ height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${item.rate}%`, height: '100%', background: item.rate >= 98 ? '#22c55e' : item.rate >= 95 ? '#f97316' : '#ef4444', borderRadius: 4 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={s.root}>
      {/* 页面标题 */}
      <div style={s.header}>
        <h1 style={s.title}>
          <Database size={24} color="#3b82f6" />
          卫健委数据上报中心
        </h1>
        <p style={s.subtitle}>数据上报 / 上报记录 / 模拟接口 / 统计概览</p>
      </div>

      {/* KPI概览 */}
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

      {/* Tab导航 */}
      <div style={s.tabNav}>
        <button
          style={{ ...s.tabButton, background: activeTab === 'report' ? '#fff' : 'transparent', color: activeTab === 'report' ? '#1a3a5c' : '#64748b', boxShadow: activeTab === 'report' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
          onClick={() => setActiveTab('report')}
        >
          <Upload size={16} />数据上报
        </button>
        <button
          style={{ ...s.tabButton, background: activeTab === 'record' ? '#fff' : 'transparent', color: activeTab === 'record' ? '#1a3a5c' : '#64748b', boxShadow: activeTab === 'record' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
          onClick={() => setActiveTab('record')}
        >
          <ClipboardList size={16} />上报记录
        </button>
        <button
          style={{ ...s.tabButton, background: activeTab === 'mock' ? '#fff' : 'transparent', color: activeTab === 'mock' ? '#1a3a5c' : '#64748b', boxShadow: activeTab === 'mock' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
          onClick={() => setActiveTab('mock')}
        >
          <TestTube size={16} />模拟接口
        </button>
        <button
          style={{ ...s.tabButton, background: activeTab === 'stats' ? '#fff' : 'transparent', color: activeTab === 'stats' ? '#1a3a5c' : '#64748b', boxShadow: activeTab === 'stats' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
          onClick={() => setActiveTab('stats')}
        >
          <PieChart size={16} />统计概览
        </button>
      </div>

      {/* Tab内容 */}
      {activeTab === 'report' && renderReport()}
      {activeTab === 'record' && renderRecord()}
      {activeTab === 'mock' && renderMock()}
      {activeTab === 'stats' && renderStats()}
    </div>
  )
}
