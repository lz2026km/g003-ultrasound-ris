// @ts-nocheck
// ============================================================
// G004 内镜管理系统 - 数据上报中心页面
// 多格式数据导出/上报（竞品对标：东软上报模块 + 国家数据上报需求）
// ============================================================
import { useState } from 'react'
import {
  FileSpreadsheet, Download, FileText, Printer, Trash2,
  ChevronDown, ChevronUp, Calendar, Filter, Clock,
  Database, Users, Activity, DollarSign, BarChart3,
  CheckCircle, XCircle, RefreshCw, Search,
  TrendingUp, TrendingDown, ShieldCheck
} from 'lucide-react'

// ---------- 类型 ----------
interface ReportRecord {
  id: number
  name: string
  exportTime: string
  format: 'Excel' | 'CSV' | 'PDF'
  operator: string
  type: string
  period: string
}

interface ReportDataRow {
  id: number
  department: string
  doctor: string
  exams: number
  patients: number
  income: number
  quality: number
  avgTime: number
}

// ---------- 样式 ----------
const s: Record<string, React.CSSProperties> = {
  root: { padding: 0 },
  header: {
    marginBottom: 24,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleSection: {},
  title: {
    fontSize: 20, fontWeight: 700, color: '#1a3a5c', margin: 0,
  },
  subtitle: {
    fontSize: 13, color: '#64748b', marginTop: 4,
  },
  // 筛选器
  filterBar: {
    display: 'flex',
    gap: 12,
    alignItems: 'center',
    background: '#f8fafc',
    padding: '16px 20px',
    borderRadius: 10,
    marginBottom: 24,
    flexWrap: 'wrap' as const,
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  filterLabel: {
    fontSize: 13,
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  filterSelect: {
    padding: '8px 12px',
    borderRadius: 6,
    border: '1px solid #e2e8f0',
    fontSize: 13,
    color: '#1a3a5c',
    background: '#fff',
    cursor: 'pointer',
    minWidth: 140,
  },
  filterInput: {
    padding: '8px 12px',
    borderRadius: 6,
    border: '1px solid #e2e8f0',
    fontSize: 13,
    color: '#1a3a5c',
    background: '#fff',
    minWidth: 160,
  },
  btnPrimary: {
    padding: '10px 20px',
    borderRadius: 6,
    border: 'none',
    background: '#3b82f6',
    color: '#fff',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    height: 44,
  },
  btnGenerate: {
    padding: '10px 24px',
    borderRadius: 6,
    border: 'none',
    background: '#3b82f6',
    color: '#fff',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    height: 44,
  },
  // 主内容区
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: 24,
  },
  // 预览区
  previewCard: {
    background: '#fff',
    borderRadius: 12,
    padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: '#1a3a5c',
    marginBottom: 16,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  // 统计卡片行
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16,
    marginBottom: 20,
  },
  statCard: {
    background: '#f8fafc',
    borderRadius: 8,
    padding: '16px',
    textAlign: 'center' as const,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 700,
    color: '#1a3a5c',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  statTrend: {
    fontSize: 11,
    marginTop: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  // 表格
  tableWrap: {
    overflowX: 'auto',
    borderRadius: 8,
    border: '1px solid #e2e8f0',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: 13,
  },
  th: {
    background: '#f8fafc',
    padding: '12px 16px',
    textAlign: 'left' as const,
    fontWeight: 600,
    color: '#475569',
    borderBottom: '1px solid #e2e8f0',
    whiteSpace: 'nowrap' as const,
  },
  td: {
    padding: '12px 16px',
    borderBottom: '1px solid #f1f5f9',
    color: '#1a3a5c',
  },
  trLast: {
    borderBottom: 'none',
  },
  // 导出按钮区
  exportSection: {
    marginBottom: 24,
  },
  exportRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16,
  },
  exportBtn: {
    padding: '14px 20px',
    borderRadius: 8,
    border: 'none',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    transition: 'opacity 0.2s',
  },
  btnExcel: {
    background: '#22c55e',
    color: '#fff',
  },
  btnCSV: {
    background: '#3b82f6',
    color: '#fff',
  },
  btnPDF: {
    background: '#ef4444',
    color: '#fff',
  },
  btnPrint: {
    background: '#64748b',
    color: '#fff',
  },
  // 历史记录
  historyCard: {
    background: '#fff',
    borderRadius: 12,
    padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    marginBottom: 24,
  },
  historyTable: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: 13,
  },
  historyTh: {
    background: '#f8fafc',
    padding: '12px 16px',
    textAlign: 'left' as const,
    fontWeight: 600,
    color: '#475569',
    borderBottom: '1px solid #e2e8f0',
  },
  historyTd: {
    padding: '12px 16px',
    borderBottom: '1px solid #f1f5f9',
    color: '#1a3a5c',
  },
  formatBadge: {
    padding: '3px 10px',
    borderRadius: 12,
    fontSize: 11,
    fontWeight: 600,
  },
  excelBadge: {
    background: '#dcfce7',
    color: '#16a34a',
  },
  csvBadge: {
    background: '#dbeafe',
    color: '#2563eb',
  },
  pdfBadge: {
    background: '#fee2e2',
    color: '#dc2626',
  },
  actionBtn: {
    padding: '6px 12px',
    borderRadius: 6,
    border: '1px solid #e2e8f0',
    background: '#fff',
    fontSize: 12,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    marginRight: 8,
  },
  actionBtnDanger: {
    padding: '6px 12px',
    borderRadius: 6,
    border: '1px solid #fecaca',
    background: '#fff',
    fontSize: 12,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    color: '#dc2626',
  },
  // 高级选项折叠
  advancedSection: {
    background: '#fff',
    borderRadius: 12,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    marginBottom: 24,
    overflow: 'hidden',
  },
  advancedHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    cursor: 'pointer',
    background: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
  },
  advancedTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: '#1a3a5c',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  advancedContent: {
    padding: 20,
  },
  fieldGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 12,
    marginBottom: 20,
  },
  fieldItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 13,
    color: '#475569',
  },
  checkbox: {
    width: 16,
    height: 16,
    cursor: 'pointer',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: '#1a3a5c',
    marginBottom: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  desensitizeRow: {
    display: 'flex',
    gap: 24,
    flexWrap: 'wrap' as const,
  },
  desensitizeItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 13,
    color: '#475569',
  },
  // 提示消息
  toast: {
    position: 'fixed' as const,
    top: 20,
    right: 20,
    padding: '14px 20px',
    borderRadius: 8,
    background: '#22c55e',
    color: '#fff',
    fontSize: 13,
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    zIndex: 9999,
  },
}

// ---------- 演示数据 ----------
const REPORT_TYPES = [
  { value: 'exam', label: '检查统计' },
  { value: 'patient', label: '患者统计' },
  { value: 'department', label: '科室工作量' },
  { value: 'income', label: '收入统计' },
  { value: 'quality', label: '质量指标' },
]

const TIME_RANGES = [
  { value: 'today', label: '今日' },
  { value: 'week', label: '本周' },
  { value: 'month', label: '本月' },
  { value: 'quarter', label: '本季度' },
  { value: 'year', label: '本年' },
  { value: 'custom', label: '自定义' },
]

const DEPARTMENTS = [
  '消化内科', '呼吸内科', '心内科', '普外科', '泌尿外科',
  '神经内科', '肿瘤科', '急诊科', '儿科', '妇科',
]

const DOCTORS = [
  '张伟', '李娜', '王芳', '刘洋', '陈静',
  '赵强', '孙丽', '周明', '吴霞', '郑涛',
]

const HISTORY_RECORDS: ReportRecord[] = [
  { id: 1, name: '2026年4月检查统计报表', exportTime: '2026-04-30 14:32', format: 'Excel', operator: '张伟', type: '检查统计', period: '本月' },
  { id: 2, name: '消化内科工作量报表', exportTime: '2026-04-29 10:15', format: 'PDF', operator: '李娜', type: '科室工作量', period: '本周' },
  { id: 3, name: '患者统计报表（Q1）', exportTime: '2026-04-28 16:45', format: 'CSV', operator: '王芳', type: '患者统计', period: '本季度' },
  { id: 4, name: '2026年一季度收入汇总', exportTime: '2026-04-27 09:20', format: 'Excel', operator: '刘洋', type: '收入统计', period: '本季度' },
  { id: 5, name: '科室质量指标报表', exportTime: '2026-04-26 11:08', format: 'PDF', operator: '陈静', type: '质量指标', period: '本月' },
  { id: 6, name: '检查统计报表（年度）', exportTime: '2026-04-25 15:30', format: 'Excel', operator: '赵强', type: '检查统计', period: '本年' },
  { id: 7, name: '4月份患者就诊统计', exportTime: '2026-04-24 13:55', format: 'CSV', operator: '孙丽', type: '患者统计', period: '本月' },
  { id: 8, name: '急诊科工作量日报', exportTime: '2026-04-23 08:40', format: 'Excel', operator: '周明', type: '科室工作量', period: '今日' },
  { id: 9, name: '收入统计报表（3月）', exportTime: '2026-04-22 14:18', format: 'PDF', operator: '吴霞', type: '收入统计', period: '本月' },
  { id: 10, name: '质量指标月度评估', exportTime: '2026-04-21 10:05', format: 'Excel', operator: '郑涛', type: '质量指标', period: '本月' },
]

const PREVIEW_DATA: ReportDataRow[] = [
  { id: 1, department: '消化内科', doctor: '张伟', exams: 156, patients: 142, income: 285600, quality: 98.5, avgTime: 35 },
  { id: 2, department: '消化内科', doctor: '李娜', exams: 132, patients: 128, income: 241800, quality: 97.8, avgTime: 38 },
  { id: 3, department: '呼吸内科', doctor: '王芳', exams: 118, patients: 112, income: 198500, quality: 96.2, avgTime: 42 },
  { id: 4, department: '心内科', doctor: '刘洋', exams: 95, patients: 89, income: 176200, quality: 99.1, avgTime: 45 },
  { id: 5, department: '普外科', doctor: '陈静', exams: 88, patients: 82, income: 165400, quality: 97.5, avgTime: 50 },
  { id: 6, department: '泌尿外科', doctor: '赵强', exams: 76, patients: 71, income: 142300, quality: 98.0, avgTime: 48 },
  { id: 7, department: '神经内科', doctor: '孙丽', exams: 68, patients: 65, income: 128900, quality: 96.8, avgTime: 52 },
  { id: 8, department: '肿瘤科', doctor: '周明', exams: 62, patients: 58, income: 118600, quality: 97.2, avgTime: 55 },
  { id: 9, department: '急诊科', doctor: '吴霞', exams: 245, patients: 238, income: 326800, quality: 95.5, avgTime: 28 },
  { id: 10, department: '儿科', doctor: '郑涛', exams: 52, patients: 48, income: 89200, quality: 98.9, avgTime: 32 },
  { id: 11, department: '妇科', doctor: '张伟', exams: 78, patients: 75, income: 138600, quality: 97.0, avgTime: 40 },
  { id: 12, department: '消化内科', doctor: '李娜', exams: 124, patients: 118, income: 226800, quality: 98.2, avgTime: 36 },
]

// ---------- 工具函数 ----------
const getFormatBadgeStyle = (format: string): React.CSSProperties => {
  if (format === 'Excel') return { ...s.formatBadge, ...s.excelBadge }
  if (format === 'CSV') return { ...s.formatBadge, ...s.csvBadge }
  return { ...s.formatBadge, ...s.pdfBadge }
}

// ---------- 组件 ----------
export default function DataReportCenterPage() {
  const [reportType, setReportType] = useState('exam')
  const [timeRange, setTimeRange] = useState('month')
  const [selectedDepts, setSelectedDepts] = useState<string[]>([])
  const [selectedDoctors, setSelectedDoctors] = useState<string[]>([])
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [historyRecords, setHistoryRecords] = useState<ReportRecord[]>(HISTORY_RECORDS)
  const [showPreview, setShowPreview] = useState(false)

  // 高级选项
  const [selectedFields, setSelectedFields] = useState<string[]>([
    'department', 'doctor', 'exams', 'patients', 'income', 'quality', 'avgTime'
  ])
  const [desensitizeName, setDesensitizeName] = useState(false)
  const [desensitizePhone, setDesensitizePhone] = useState(false)

  const allFields = [
    { id: 'department', label: '科室' },
    { id: 'doctor', label: '医生' },
    { id: 'exams', label: '检查数' },
    { id: 'patients', label: '患者数' },
    { id: 'income', label: '收入(元)' },
    { id: 'quality', label: '质量评分' },
    { id: 'avgTime', label: '平均时长(分钟)' },
  ]

  const toggleField = (id: string) => {
    setSelectedFields(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    )
  }

  const handleGenerate = () => {
    setShowPreview(true)
    showToast('报表生成成功')
  }

  const handleExport = (format: string) => {
    showToast(`${format}导出成功`)
  }

  const handleRedownload = (record: ReportRecord) => {
    showToast(`重新下载: ${record.name}`)
  }

  const handleDelete = (id: number) => {
    setHistoryRecords(prev => prev.filter(r => r.id !== id))
    showToast('删除成功')
  }

  const showToast = (message: string) => {
    setToast(message)
    setTimeout(() => setToast(null), 3000)
  }

  // 统计计算
  const totalExams = PREVIEW_DATA.reduce((sum, r) => sum + r.exams, 0)
  const totalPatients = PREVIEW_DATA.reduce((sum, r) => sum + r.patients, 0)
  const totalIncome = PREVIEW_DATA.reduce((sum, r) => sum + r.income, 0)
  const avgQuality = PREVIEW_DATA.reduce((sum, r) => sum + r.quality, 0) / PREVIEW_DATA.length
  const maxExams = Math.max(...PREVIEW_DATA.map(r => r.exams))
  const minExams = Math.min(...PREVIEW_DATA.map(r => r.exams))
  const avgExams = Math.round(totalExams / PREVIEW_DATA.length)

  return (
    <div style={s.root}>
      {/* 页面标题 */}
      <div style={s.header}>
        <div style={s.titleSection}>
          <h1 style={s.title}>数据上报中心</h1>
          <p style={s.subtitle}>多格式数据导出 / 国家数据上报需求支持</p>
        </div>
      </div>

      {/* 数据报表生成器 */}
      <div style={s.filterBar}>
        <div style={s.filterGroup}>
          <span style={s.filterLabel}>
            <FileSpreadsheet size={16} />
            报表类型
          </span>
          <select
            style={s.filterSelect}
            value={reportType}
            onChange={e => setReportType(e.target.value)}
          >
            {REPORT_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div style={s.filterGroup}>
          <span style={s.filterLabel}>
            <Calendar size={16} />
            时间范围
          </span>
          <select
            style={s.filterSelect}
            value={timeRange}
            onChange={e => setTimeRange(e.target.value)}
          >
            {TIME_RANGES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div style={s.filterGroup}>
          <span style={s.filterLabel}>
            <Users size={16} />
            科室
          </span>
          <select
            style={s.filterSelect}
            multiple
            value={selectedDepts}
            onChange={e => setSelectedDepts(Array.from(e.target.selectedOptions, o => o.value))}
          >
            {DEPARTMENTS.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div style={s.filterGroup}>
          <span style={s.filterLabel}>
            <Activity size={16} />
            医生
          </span>
          <select
            style={s.filterSelect}
            multiple
            value={selectedDoctors}
            onChange={e => setSelectedDoctors(Array.from(e.target.selectedOptions, o => o.value))}
          >
            {DOCTORS.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <button style={s.btnGenerate} onClick={handleGenerate}>
          <BarChart3 size={18} />
          生成报表
        </button>
      </div>

      {/* 报表预览区 */}
      {showPreview && (
        <div style={s.previewCard}>
          <h2 style={s.sectionTitle}>
            <Database size={18} />
            报表预览 - {REPORT_TYPES.find(t => t.value === reportType)?.label}
          </h2>

          {/* 统计卡片 */}
          <div style={s.statsRow}>
            <div style={s.statCard}>
              <div style={s.statValue}>{totalExams.toLocaleString()}</div>
              <div style={s.statLabel}>总计检查数</div>
              <div style={{ ...s.statTrend, color: '#22c55e' }}>
                <TrendingUpIcon size={12} /> 本期
              </div>
            </div>
            <div style={s.statCard}>
              <div style={s.statValue}>{avgExams}</div>
              <div style={s.statLabel}>平均检查数</div>
              <div style={{ ...s.statTrend, color: '#3b82f6' }}>
                <BarChart3 size={12} /> 人均
              </div>
            </div>
            <div style={s.statCard}>
              <div style={s.statValue}>{maxExams}</div>
              <div style={s.statLabel}>最大检查数</div>
              <div style={{ ...s.statTrend, color: '#f97316' }}>
                <TrendingUp size={12} /> 峰值
              </div>
            </div>
            <div style={s.statCard}>
              <div style={s.statValue}>{minExams}</div>
              <div style={s.statLabel}>最小检查数</div>
              <div style={{ ...s.statTrend, color: '#64748b' }}>
                <TrendingDown size={12} /> 低值
              </div>
            </div>
          </div>

          {/* 表格 */}
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>序号</th>
                  {selectedFields.includes('department') && <th style={s.th}>科室</th>}
                  {selectedFields.includes('doctor') && <th style={s.th}>医生</th>}
                  {selectedFields.includes('exams') && <th style={s.th}>检查数</th>}
                  {selectedFields.includes('patients') && <th style={s.th}>患者数</th>}
                  {selectedFields.includes('income') && <th style={s.th}>收入(元)</th>}
                  {selectedFields.includes('quality') && <th style={s.th}>质量评分</th>}
                  {selectedFields.includes('avgTime') && <th style={s.th}>平均时长(分钟)</th>}
                </tr>
              </thead>
              <tbody>
                {PREVIEW_DATA.map((row, idx) => (
                  <tr key={row.id} style={idx === PREVIEW_DATA.length - 1 ? s.trLast : {}}>
                    <td style={s.td}>{row.id}</td>
                    {selectedFields.includes('department') && <td style={s.td}>{row.department}</td>}
                    {selectedFields.includes('doctor') && <td style={s.td}>{row.doctor}</td>}
                    {selectedFields.includes('exams') && <td style={s.td}>{row.exams}</td>}
                    {selectedFields.includes('patients') && <td style={s.td}>{row.patients}</td>}
                    {selectedFields.includes('income') && <td style={s.td}>¥{row.income.toLocaleString()}</td>}
                    {selectedFields.includes('quality') && <td style={s.td}>{row.quality}%</td>}
                    {selectedFields.includes('avgTime') && <td style={s.td}>{row.avgTime}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 导出功能区 */}
      <div style={s.exportSection}>
        <div style={s.exportRow}>
          <button
            style={{ ...s.exportBtn, ...s.btnExcel }}
            onClick={() => handleExport('Excel')}
          >
            <FileSpreadsheet size={20} />
            导出 Excel
          </button>
          <button
            style={{ ...s.exportBtn, ...s.btnCSV }}
            onClick={() => handleExport('CSV')}
          >
            <FileText size={20} />
            导出 CSV
          </button>
          <button
            style={{ ...s.exportBtn, ...s.btnPDF }}
            onClick={() => handleExport('PDF')}
          >
            <Download size={20} />
            导出 PDF
          </button>
          <button
            style={{ ...s.exportBtn, ...s.btnPrint }}
            onClick={() => handleExport('Print')}
          >
            <Printer size={20} />
            打印预览
          </button>
        </div>
      </div>

      {/* 高级选项折叠面板 */}
      <div style={s.advancedSection}>
        <div
          style={s.advancedHeader}
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <span style={s.advancedTitle}>
            <Filter size={16} />
            高级选项 - 数据字段配置
          </span>
          {showAdvanced ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>

        {showAdvanced && (
          <div style={s.advancedContent}>
            <div style={s.sectionLabel}>
              <CheckCircle size={14} />
              选择导出字段
            </div>
            <div style={s.fieldGrid}>
              {allFields.map(field => (
                <label key={field.id} style={s.fieldItem}>
                  <input
                    type="checkbox"
                    style={s.checkbox}
                    checked={selectedFields.includes(field.id)}
                    onChange={() => toggleField(field.id)}
                  />
                  {field.label}
                </label>
              ))}
            </div>

            <div style={s.sectionLabel}>
              <ShieldCheck size={14} />
              数据脱敏选项
            </div>
            <div style={s.desensitizeRow}>
              <label style={s.desensitizeItem}>
                <input
                  type="checkbox"
                  style={s.checkbox}
                  checked={desensitizeName}
                  onChange={e => setDesensitizeName(e.target.checked)}
                />
                隐藏患者姓名中间位（如：张*伟）
              </label>
              <label style={s.desensitizeItem}>
                <input
                  type="checkbox"
                  style={s.checkbox}
                  checked={desensitizePhone}
                  onChange={e => setDesensitizePhone(e.target.checked)}
                />
                隐藏手机号中间位（如：138****5678）
              </label>
            </div>
          </div>
        )}
      </div>

      {/* 历史报表记录 */}
      <div style={s.historyCard}>
        <h2 style={s.sectionTitle}>
          <Clock size={18} />
          历史报表记录
        </h2>

        <div style={s.tableWrap}>
          <table style={s.historyTable}>
            <thead>
              <tr>
                <th style={s.historyTh}>报表名称</th>
                <th style={s.historyTh}>报表类型</th>
                <th style={s.historyTh}>时间范围</th>
                <th style={s.historyTh}>导出时间</th>
                <th style={s.historyTh}>格式</th>
                <th style={s.historyTh}>操作人</th>
                <th style={s.historyTh}>操作</th>
              </tr>
            </thead>
            <tbody>
              {historyRecords.map(record => (
                <tr key={record.id}>
                  <td style={s.historyTd}>{record.name}</td>
                  <td style={s.historyTd}>{record.type}</td>
                  <td style={s.historyTd}>{record.period}</td>
                  <td style={s.historyTd}>{record.exportTime}</td>
                  <td style={s.historyTd}>
                    <span style={getFormatBadgeStyle(record.format)}>
                      {record.format}
                    </span>
                  </td>
                  <td style={s.historyTd}>{record.operator}</td>
                  <td style={s.historyTd}>
                    <button
                      style={s.actionBtn}
                      onClick={() => handleRedownload(record)}
                    >
                      <Download size={14} />
                      下载
                    </button>
                    <button
                      style={s.actionBtnDanger}
                      onClick={() => handleDelete(record.id)}
                    >
                      <Trash2 size={14} />
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Toast 提示 */}
      {toast && (
        <div style={s.toast}>
          <CheckCircle size={18} />
          {toast}
        </div>
      )}
    </div>
  )
}

// 辅助图标组件
function TrendingUpIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  )
}

function TrendingDownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
      <polyline points="16 17 22 17 22 11" />
    </svg>
  )
}
