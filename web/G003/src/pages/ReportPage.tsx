// @ts-nocheck
// G003 超声RIS - 报告管理页面 v0.3.0
import { useState, useMemo } from 'react'
import {
  FileText, Search, Download, CheckCircle, Eye, Printer, Filter,
  X, ChevronRight, Clock, AlertCircle, CheckSquare, Square,
  BarChart3, Star, Award, Shield
} from 'lucide-react'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts'
import { mockReports } from '../data/initialData'

// 扩展mockReports数据以支持新功能
const extendedReports = mockReports.map((r, i) => ({
  ...r,
  reportId: r.id || `RPT${String(i + 1).padStart(4, '0')}`,
  reportDoctor: r.doctor || '张建华',
  reviewDoctor: r.reviewer || '',
  reportTime: r.signTime || r.createTime || '2025-05-07 10:00',
  qualityScore: r.qualityScore || ['甲级', '乙级', '丙级'][Math.floor(Math.random() * 3)],
  completionHours: Math.round(Math.random() * 48 * 10) / 10,
}))

// 添加更多模拟数据（使用合规超声患者ID）
const allReports = [
  ...extendedReports,
  { id: 'RPT2025040021', reportId: 'RPT2025040021', examId: 'EXM2025040021', patientId: 'US2025040015', patientName: '黄晓东', examType: '浅表器官超声', examDate: '2025-05-07', status: '待审核', reportDoctor: '张伟', reviewDoctor: '', reportTime: '2025-05-07 11:30', qualityScore: '甲级', completionHours: 1.5 },
  { id: 'RPT2025040022', reportId: 'RPT2025040022', examId: 'EXM2025040022', patientId: 'US2025040016', patientName: '林海燕', examType: '妇产科超声', examDate: '2025-05-07', status: '已打印', reportDoctor: '王晓燕', reviewDoctor: '张建华', reportTime: '2025-05-07 10:30', qualityScore: '乙级', completionHours: 2.0 },
  { id: 'RPT2025040023', reportId: 'RPT2025040023', examId: 'EXM2025040023', patientId: 'US2025040019', patientName: '韩志鹏', examType: '肌肉骨骼超声', examDate: '2025-05-07', status: '已归档', reportDoctor: '张伟', reviewDoctor: '张建华', reportTime: '2025-05-07 14:00', qualityScore: '甲级', completionHours: 3.0 },
  { id: 'RPT2025040024', reportId: 'RPT2025040024', examId: 'EXM2025040024', patientId: 'US2025040020', patientName: '宋雅琴', examType: '浅表器官超声', examDate: '2025-05-07', status: '待书写', reportDoctor: '刘强', reviewDoctor: '', reportTime: '', qualityScore: '', completionHours: 0 },
  { id: 'RPT2025040025', reportId: 'RPT2025040025', examId: 'EXM2025040025', patientId: 'US2025040022', patientName: '邓桂香', examType: '腹部超声', examDate: '2025-05-07', status: '待审核', reportDoctor: '陈静', reviewDoctor: '', reportTime: '2025-05-07 15:00', qualityScore: '乙级', completionHours: 1.0 },
  { id: 'RPT2025040026', reportId: 'RPT2025040026', examId: 'EXM2025040026', patientId: 'US2025040024', patientName: '田秀兰', examType: '妇产科超声', examDate: '2025-05-07', status: '已审核', reportDoctor: '李明辉', reviewDoctor: '张建华', reportTime: '2025-05-07 12:00', qualityScore: '甲级', completionHours: 2.5 },
  { id: 'RPT2025040027', reportId: 'RPT2025040027', examId: 'EXM2025040027', patientId: 'US2025040026', patientName: '蒋丽娟', examType: '浅表器官超声', examDate: '2025-05-07', status: '已打印', reportDoctor: '张伟', reviewDoctor: '张建华', reportTime: '2025-05-07 13:30', qualityScore: '丙级', completionHours: 4.0 },
  { id: 'RPT2025040028', reportId: 'RPT2025040028', examId: 'EXM2025040028', patientId: 'US2025040027', patientName: '白建国', examType: '外周血管超声', examDate: '2025-05-07', status: '待审核', reportDoctor: '王晓燕', reviewDoctor: '', reportTime: '2025-05-07 16:00', qualityScore: '乙级', completionHours: 0.8 },
]

const s: Record<string, React.CSSProperties> = {
  root: { padding: 0, display: 'flex', gap: 16, height: 'calc(100vh - 120px)' },
  // 左侧主区域
  mainArea: { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 },
  header: { marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 700, color: '#1a3a5c', margin: 0 },
  headerRight: { display: 'flex', gap: 8 },
  // 统计卡片行
  statRow: { display: 'flex', gap: 12, marginBottom: 16 },
  statCard: {
    background: '#fff', borderRadius: 10, padding: '14px 18px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', flex: 1, minWidth: 120,
  },
  statLabel: { fontSize: 12, color: '#64748b', marginBottom: 4 },
  statValue: { fontSize: 24, fontWeight: 700, color: '#1a3a5c' },
  // 筛选行
  filterRow: {
    display: 'flex', gap: 10, alignItems: 'center', background: '#f8fafc',
    padding: '12px 14px', borderRadius: 10, marginBottom: 12, flexWrap: 'wrap' as const,
  },
  searchInput: {
    flex: 1, minWidth: 180, padding: '8px 12px', borderRadius: 6,
    border: '1px solid #e2e8f0', fontSize: 13, color: '#1a3a5c',
    background: '#fff', outline: 'none', minHeight: 36,
  },
  filterBtn: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px',
    borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff',
    cursor: 'pointer', fontSize: 12, color: '#64748b', minHeight: 36,
  },
  actionBtn: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
    borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12,
    fontWeight: 500, minHeight: 36,
  },
  // 表格
  tableWrap: {
    background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column' as const,
  },
  tableScroll: { overflow: 'auto', flex: 1 },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    background: '#f8fafc', padding: '10px 12px', textAlign: 'left',
    fontSize: 12, fontWeight: 600, color: '#475569', borderBottom: '1px solid #e2e8f0',
    whiteSpace: 'nowrap' as const,
  },
  td: {
    padding: '10px 12px', fontSize: 12, color: '#475569', borderBottom: '1px solid #f1f5f9',
    whiteSpace: 'nowrap' as const,
  },
  badge: {
    display: 'inline-flex', padding: '2px 8px', borderRadius: 20,
    fontSize: 11, fontWeight: 500,
  },
  checkbox: {
    width: 16, height: 16, cursor: 'pointer', accentColor: '#3b82f6',
  },
  // 右侧预览面板
  previewPanel: {
    width: 380, background: '#fff', borderRadius: 12,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex',
    flexDirection: 'column' as const, overflow: 'hidden',
  },
  previewHeader: {
    padding: '14px 16px', borderBottom: '1px solid #e2e8f0',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  previewTitle: { fontSize: 14, fontWeight: 600, color: '#1a3a5c', margin: 0 },
  previewContent: { flex: 1, overflow: 'auto', padding: 16 },
  previewEmpty: {
    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', color: '#94a3b8', gap: 8,
  },
  // 预览内容样式
  previewSection: { marginBottom: 16 },
  previewLabel: { fontSize: 11, color: '#64748b', marginBottom: 4 },
  previewValue: { fontSize: 13, color: '#1a3a5c', fontWeight: 500 },
  previewDiagnosis: {
    background: '#f8fafc', borderRadius: 8, padding: 12, fontSize: 12,
    color: '#475569', lineHeight: 1.6, marginTop: 8,
  },
  previewActions: {
    padding: '12px 16px', borderTop: '1px solid #e2e8f0',
    display: 'flex', gap: 8,
  },
  // 图表区域
  chartsRow: { display: 'flex', gap: 12, marginBottom: 16 },
  chartCard: {
    background: '#fff', borderRadius: 10, padding: 14,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', flex: 1,
  },
  chartTitle: { fontSize: 12, fontWeight: 600, color: '#1a3a5c', marginBottom: 10 },
}

const statusColors: Record<string, { bg: string; color: string }> = {
  '待书写': { bg: '#fff7ed', color: '#f97316' },
  '待审核': { bg: '#eff6ff', color: '#3b82f6' },
  '已审核': { bg: '#f0fdf4', color: '#22c55e' },
  '已打印': { bg: '#f0fdfa', color: '#14b8a6' },
  '已归档': { bg: '#f5f3ff', color: '#8b5cf6' },
}

const qualityColors: Record<string, string> = {
  '甲级': '#22c55e',
  '乙级': '#3b82f6',
  '丙级': '#f97316',
  '不合格': '#ef4444',
}

export default function ReportPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('全部')
  const [selectedReports, setSelectedReports] = useState<string[]>([])
  const [previewReport, setPreviewReport] = useState<typeof allReports[0] | null>(null)
  const reports = allReports

  // 筛选报告
  const filtered = useMemo(() => {
    return reports.filter(r => {
      const matchSearch = !search ||
        r.patientName.includes(search) ||
        r.reportId.includes(search) ||
        r.examType.includes(search)
      const matchStatus = statusFilter === '全部' || r.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [reports, search, statusFilter])

  // 统计计算
  const stats = useMemo(() => {
    const today = '2025-05-07'
    const todayReports = reports.filter(r => r.examDate === today)
    return {
      todayTotal: todayReports.length,
      pending: todayReports.filter(r => r.status === '待书写' || r.status === '待审核').length,
      completed: todayReports.filter(r => ['已审核', '已打印', '已归档'].includes(r.status)).length,
    }
  }, [reports])

  // 质量评分分布数据
  const qualityData = useMemo(() => {
    const today = '2025-05-07'
    const todayReports = reports.filter(r => r.examDate === today && r.qualityScore)
    const counts: Record<string, number> = { '甲级': 0, '乙级': 0, '丙级': 0, '不合格': 0 }
    todayReports.forEach(r => { if (r.qualityScore) counts[r.qualityScore]++ })
    return Object.entries(counts).map(([name, value]) => ({ name, value })).filter(d => d.value > 0)
  }, [reports])

  // 时效统计
  const timelinessData = useMemo(() => {
    const today = '2025-05-07'
    const todayReports = reports.filter(r => r.examDate === today && r.completionHours > 0)
    const within2h = todayReports.filter(r => r.completionHours <= 2).length
    const within24h = todayReports.filter(r => r.completionHours <= 24).length
    const total = todayReports.length || 1
    return [
      { name: '2小时内', value: Math.round((within2h / total) * 100) },
      { name: '24小时内', value: Math.round((within24h / total) * 100) },
    ]
  }, [reports])

  // 全选/取消全选
  const toggleSelectAll = () => {
    const pendingIds = filtered.filter(r => r.status === '待审核').map(r => r.id)
    if (selectedReports.length === pendingIds.length) {
      setSelectedReports([])
    } else {
      setSelectedReports(pendingIds)
    }
  }

  // 切换单个选中
  const toggleSelect = (id: string) => {
    setSelectedReports(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  // 批量审核
  const batchApprove = () => {
    alert(`批量审核成功：${selectedReports.length} 份报告已审核`)
    setSelectedReports([])
  }

  // 打印报告
  const printReport = (report: typeof allReports[0]) => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html><head><title>报告打印 - ${report.reportId}</title></head>
        <body style="font-family: Arial, sans-serif; padding: 40px;">
          <h1 style="text-align: center; color: #1a3a5c;">超声检查报告</h1>
          <hr/>
          <p><strong>报告编号：</strong>${report.reportId}</p>
          <p><strong>患者姓名：</strong>${report.patientName}</p>
          <p><strong>检查类型：</strong>${report.examType}</p>
          <p><strong>检查日期：</strong>${report.examDate}</p>
          <p><strong>报告医生：</strong>${report.reportDoctor}</p>
          <p><strong>审核医生：</strong>${report.reviewDoctor || '-'}</p>
          <p><strong>报告时间：</strong>${report.reportTime}</p>
          <hr/>
          <h3>诊断结果</h3>
          <p>${report.diagnosis || '无'}</p>
          <h3>检查所见</h3>
          <p>${report.findings || '无'}</p>
          <h3>建议</h3>
          <p>${report.suggestions || '无'}</p>
          <script>window.print();</script>
        </body></html>
      `)
      printWindow.document.close()
    }
  }

  return (
    <div style={s.root}>
      {/* 左侧主区域 */}
      <div style={s.mainArea}>
        <div style={s.header}>
          <h1 style={s.title}>报告管理</h1>
          <div style={s.headerRight}>
            <button style={{ ...s.actionBtn, background: '#fff', color: '#475569', border: '1px solid #e2e8f0' }}>
              <Download size={14} /> 导出
            </button>
            <button style={{ ...s.actionBtn, background: '#3b82f6', color: '#fff' }}>
              <FileText size={14} /> 新建报告
            </button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div style={s.statRow}>
          <div style={s.statCard}>
            <div style={s.statLabel}>今日报告</div>
            <div style={s.statValue}>{stats.todayTotal}</div>
          </div>
          <div style={s.statCard}>
            <div style={s.statLabel}>待审核</div>
            <div style={{ ...s.statValue, color: '#f97316' }}>{stats.pending}</div>
          </div>
          <div style={s.statCard}>
            <div style={s.statLabel}>已完成</div>
            <div style={{ ...s.statValue, color: '#22c55e' }}>{stats.completed}</div>
          </div>
        </div>

        {/* 图表区域 */}
        <div style={s.chartsRow}>
          {/* 报告状态分布饼图 */}
          <div style={s.chartCard}>
            <div style={s.chartTitle}>报告状态分布</div>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie
                  data={[
                    { name: '待书写', value: reports.filter(r => r.status === '待书写').length },
                    { name: '待审核', value: reports.filter(r => r.status === '待审核').length },
                    { name: '已审核', value: reports.filter(r => r.status === '已审核').length },
                    { name: '已打印', value: reports.filter(r => r.status === '已打印').length },
                    { name: '已归档', value: reports.filter(r => r.status === '已归档').length },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={55}
                  paddingAngle={2}
                  dataKey="value"
                >
                  <Cell fill="#f97316" />
                  <Cell fill="#3b82f6" />
                  <Cell fill="#22c55e" />
                  <Cell fill="#14b8a6" />
                  <Cell fill="#8b5cf6" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* 质量评分环形图 */}
          <div style={s.chartCard}>
            <div style={s.chartTitle}>报告质量评分</div>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie
                  data={qualityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={55}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {qualityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={qualityColors[entry.name] || '#ccc'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconSize={8} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* 时效统计 */}
          <div style={s.chartCard}>
            <div style={s.chartTitle}>报告完成时效</div>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={timelinessData} layout="vertical">
                <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value: number) => [`${value}%`, '完成率']} />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 筛选栏 */}
        <div style={s.filterRow}>
          <Search size={14} color="#64748b" />
          <input
            style={s.searchInput}
            placeholder="搜索患者姓名/报告ID/检查项目..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select style={s.filterBtn} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="全部">全部状态</option>
            <option value="待书写">待书写</option>
            <option value="待审核">待审核</option>
            <option value="已审核">已审核</option>
            <option value="已打印">已打印</option>
            <option value="已归档">已归档</option>
          </select>
          {selectedReports.length > 0 && (
            <button
              style={{ ...s.actionBtn, background: '#22c55e', color: '#fff' }}
              onClick={batchApprove}
            >
              <CheckSquare size={14} /> 批量审核 ({selectedReports.length})
            </button>
          )}
        </div>

        {/* 报告列表表格 */}
        <div style={s.tableWrap}>
          <div style={s.tableScroll}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={{ ...s.th, width: 40 }}>
                    <input
                      type="checkbox"
                      style={s.checkbox}
                      checked={selectedReports.length > 0 && selectedReports.length === filtered.filter(r => r.status === '待审核').length}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th style={s.th}>报告ID</th>
                  <th style={s.th}>患者姓名</th>
                  <th style={s.th}>检查项目</th>
                  <th style={s.th}>报告医生</th>
                  <th style={s.th}>审核医生</th>
                  <th style={s.th}>报告时间</th>
                  <th style={s.th}>状态</th>
                  <th style={s.th}>操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr
                    key={r.id}
                    style={{ cursor: 'pointer', background: previewReport?.id === r.id ? '#f0f9ff' : undefined }}
                    onClick={() => setPreviewReport(r)}
                  >
                    <td style={s.td} onClick={e => e.stopPropagation()}>
                      {r.status === '待审核' && (
                        <input
                          type="checkbox"
                          style={s.checkbox}
                          checked={selectedReports.includes(r.id)}
                          onChange={() => toggleSelect(r.id)}
                        />
                      )}
                    </td>
                    <td style={s.td}>
                      <span style={{ fontFamily: 'monospace', color: '#3b82f6', fontWeight: 500 }}>
                        {r.reportId}
                      </span>
                    </td>
                    <td style={{ ...s.td, fontWeight: 600, color: '#1a3a5c' }}>{r.patientName}</td>
                    <td style={s.td}>{r.examType}</td>
                    <td style={s.td}>{r.reportDoctor}</td>
                    <td style={s.td}>{r.reviewDoctor || '-'}</td>
                    <td style={s.td}>{r.reportTime || '-'}</td>
                    <td style={s.td}>
                      <span style={{
                        ...s.badge,
                        background: statusColors[r.status]?.bg,
                        color: statusColors[r.status]?.color,
                      }}>
                        {r.status}
                      </span>
                    </td>
                    <td style={s.td} onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          style={{ ...s.actionBtn, padding: '4px 8px', background: 'transparent', color: '#3b82f6' }}
                          title="预览"
                          onClick={() => setPreviewReport(r)}
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          style={{ ...s.actionBtn, padding: '4px 8px', background: 'transparent', color: '#64748b' }}
                          title="打印"
                          onClick={() => printReport(r)}
                        >
                          <Printer size={14} />
                        </button>
                        {r.status === '待审核' && (
                          <button
                            style={{ ...s.actionBtn, padding: '4px 8px', background: 'transparent', color: '#22c55e' }}
                            title="审核"
                            onClick={() => alert(`已审核报告: ${r.reportId}`)}
                          >
                            <CheckCircle size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 右侧预览面板 */}
      <div style={s.previewPanel}>
        <div style={s.previewHeader}>
          <h3 style={s.previewTitle}>报告预览</h3>
          {previewReport && (
            <X size={16} color="#64748b" style={{ cursor: 'pointer' }} onClick={() => setPreviewReport(null)} />
          )}
        </div>

        {previewReport ? (
          <>
            <div style={s.previewContent}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <span style={{
                  ...s.badge,
                  background: statusColors[previewReport.status]?.bg,
                  color: statusColors[previewReport.status]?.color,
                }}>
                  {previewReport.status}
                </span>
                {previewReport.qualityScore && (
                  <span style={{
                    ...s.badge,
                    background: qualityColors[previewReport.qualityScore] + '20',
                    color: qualityColors[previewReport.qualityScore],
                  }}>
                    <Award size={10} style={{ marginRight: 3 }} />
                    {previewReport.qualityScore}
                  </span>
                )}
              </div>

              <div style={s.previewSection}>
                <div style={s.previewLabel}>报告编号</div>
                <div style={s.previewValue}>{previewReport.reportId}</div>
              </div>

              <div style={s.previewSection}>
                <div style={s.previewLabel}>患者信息</div>
                <div style={s.previewValue}>{previewReport.patientName}</div>
              </div>

              <div style={s.previewSection}>
                <div style={s.previewLabel}>检查项目</div>
                <div style={s.previewValue}>{previewReport.examType}</div>
              </div>

              <div style={s.previewSection}>
                <div style={s.previewLabel}>检查日期</div>
                <div style={s.previewValue}>{previewReport.examDate}</div>
              </div>

              <div style={s.previewSection}>
                <div style={s.previewLabel}>报告医生</div>
                <div style={s.previewValue}>{previewReport.reportDoctor}</div>
              </div>

              <div style={s.previewSection}>
                <div style={s.previewLabel}>审核医生</div>
                <div style={s.previewValue}>{previewReport.reviewDoctor || '待审核'}</div>
              </div>

              <div style={s.previewSection}>
                <div style={s.previewLabel}>报告时间</div>
                <div style={s.previewValue}>{previewReport.reportTime || '-'}</div>
              </div>

              <div style={s.previewSection}>
                <div style={s.previewLabel}>诊断结果</div>
                <div style={s.previewDiagnosis}>
                  {previewReport.diagnosis || '暂无诊断结果'}
                </div>
              </div>

              <div style={s.previewSection}>
                <div style={s.previewLabel}>检查所见</div>
                <div style={s.previewDiagnosis}>
                  {previewReport.findings || '暂无检查所见'}
                </div>
              </div>

              <div style={s.previewSection}>
                <div style={s.previewLabel}>建议</div>
                <div style={s.previewDiagnosis}>
                  {previewReport.suggestions || '暂无建议'}
                </div>
              </div>
            </div>

            <div style={s.previewActions}>
              <button
                style={{ ...s.actionBtn, flex: 1, background: '#f1f5f9', color: '#475569' }}
                onClick={() => printReport(previewReport)}
              >
                <Printer size={14} /> 打印
              </button>
              {previewReport.status === '待审核' && (
                <button
                  style={{ ...s.actionBtn, flex: 1, background: '#22c55e', color: '#fff' }}
                  onClick={() => alert(`已审核报告: ${previewReport.reportId}`)}
                >
                  <CheckCircle size={14} /> 审核
                </button>
              )}
            </div>
          </>
        ) : (
          <div style={s.previewEmpty}>
            <FileText size={48} color="#cbd5e1" />
            <span style={{ fontSize: 13 }}>点击报告查看预览</span>
          </div>
        )}
      </div>
    </div>
  )
}
