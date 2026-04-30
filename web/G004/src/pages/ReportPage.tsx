// ============================================================
// G004 内镜管理系统 - 报告管理页面
// DICOM浏览器 + 报告列表 + 模板管理
// ============================================================
import { useState, useMemo } from 'react'
import {
  Search, FileText, CheckCircle, XCircle, Printer, Send,
  Eye, Edit2, ChevronLeft, ChevronRight, Filter, X, RefreshCw,
  FolderOpen, Image, LayoutGrid, List, Plus, Trash2, Copy,
  Download, Upload, EyeOff, Maximize2, Clock, User, Stethoscope,
  Clipboard, FileBarChart, Palette, Save, ArrowLeft
} from 'lucide-react'
import type { EndoscopyReport, ReportStatus, ReportTemplate } from '../types'
import { initialEndoscopyReports, initialReportTemplates } from '../data/initialData'

// ---------- 样式定义 ----------
const s: Record<string, React.CSSProperties> = {
  pageWrapper: {
    display: 'flex', flexDirection: 'column', height: '100%', minHeight: '80vh',
    background: '#f0f4f8',
  },
  pageHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 16, flexShrink: 0,
  },
  title: { fontSize: 18, fontWeight: 700, color: '#1a3a5c' },
  headerActions: { display: 'flex', gap: 10 },
  // 大按钮样式 (G004规范)
  btnLarge: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 8,
    padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(26,58,92,0.25)',
  },
  btnLargeSuccess: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8,
    padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(22,163,74,0.25)',
  },
  btnLargeWarning: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    background: '#d97706', color: '#fff', border: 'none', borderRadius: 8,
    padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(217,119,6,0.25)',
  },
  btnLargeDanger: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8,
    padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(220,38,38,0.25)',
  },
  // 三栏布局
  threeColLayout: {
    display: 'grid', gridTemplateColumns: '320px 1fr 300px', gap: 16,
    flex: 1, minHeight: 0, overflow: 'hidden',
  },
  panel: {
    background: '#fff', borderRadius: 10, overflow: 'hidden',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column',
  },
  panelHeader: {
    padding: '12px 16px', borderBottom: '1px solid #e2e8f0',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    background: '#f8fafc', flexShrink: 0,
  },
  panelTitle: { fontSize: 13, fontWeight: 700, color: '#1a3a5c', display: 'flex', alignItems: 'center', gap: 6 },
  panelBody: { padding: 12, overflowY: 'auto', flex: 1 },
  // DICOM浏览器
  dicomToolbar: {
    display: 'flex', gap: 6, padding: '8px 12px', borderBottom: '1px solid #e2e8f0',
    background: '#f8fafc', flexShrink: 0,
  },
  dicomViewMode: {
    display: 'flex', gap: 4,
  },
  dicomViewBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 30, height: 30, borderRadius: 6, border: '1px solid #e2e8f0',
    background: '#fff', cursor: 'pointer', fontSize: 12, color: '#64748b',
  },
  dicomViewBtnActive: {
    background: '#1a3a5c', color: '#fff', border: '1px solid #1a3a5c',
  },
  dicomThumbGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, padding: 12,
  },
  dicomThumb: {
    aspectRatio: '4/3', background: '#1a1a2e', borderRadius: 6, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    position: 'relative', overflow: 'hidden', border: '2px solid transparent',
  },
  dicomThumbActive: { border: '2px solid #1a3a5c' },
  dicomThumbImg: {
    width: '100%', height: '100%', objectFit: 'cover',
  },
  dicomThumbOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
    padding: '4px 6px', fontSize: 10, color: '#fff',
  },
  dicomMain: {
    flex: 1, background: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center',
    position: 'relative', minHeight: 200,
  },
  dicomMainImg: { maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' },
  dicomInfo: {
    position: 'absolute', top: 8, left: 8, background: 'rgba(0,0,0,0.6)',
    padding: '4px 8px', borderRadius: 4, fontSize: 11, color: '#fff',
  },
  dicomNav: {
    position: 'absolute', top: '50%', transform: 'translateY(-50%)',
    background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%',
    width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', color: '#fff', fontSize: 18,
  },
  // 报告列表
  toolbar: {
    display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' as const,
    background: '#fff', padding: '10px 14px', borderRadius: 8,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: 12, flexShrink: 0,
  },
  searchBox: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: '#f8fafc', border: '1px solid #e2e8f0',
    borderRadius: 6, padding: '6px 10px', flex: 1, minWidth: 160,
  },
  searchInput: {
    border: 'none', outline: 'none', background: 'transparent',
    fontSize: 13, color: '#334155', width: '100%',
  },
  select: {
    border: '1px solid #e2e8f0', borderRadius: 6, padding: '6px 10px',
    fontSize: 13, color: '#334155', background: '#f8fafc', outline: 'none',
    cursor: 'pointer',
  },
  filterGroup: { display: 'flex', alignItems: 'center', gap: 6 },
  filterLabel: { fontSize: 12, color: '#64748b', whiteSpace: 'nowrap' as const },
  btnIcon: {
    display: 'flex', alignItems: 'center', gap: 4,
    background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 6,
    padding: '5px 8px', fontSize: 12, cursor: 'pointer',
  },
  btnSuccess: {
    display: 'flex', alignItems: 'center', gap: 4,
    background: '#dcfce7', color: '#16a34a', border: 'none', borderRadius: 6,
    padding: '5px 8px', fontSize: 12, cursor: 'pointer',
  },
  btnWarning: {
    display: 'flex', alignItems: 'center', gap: 4,
    background: '#fef3c7', color: '#d97706', border: 'none', borderRadius: 6,
    padding: '5px 8px', fontSize: 12, cursor: 'pointer',
  },
  btnDanger: {
    display: 'flex', alignItems: 'center', gap: 4,
    background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 6,
    padding: '5px 8px', fontSize: 12, cursor: 'pointer',
  },
  btnInfo: {
    display: 'flex', alignItems: 'center', gap: 4,
    background: '#dbeafe', color: '#2563eb', border: 'none', borderRadius: 6,
    padding: '5px 8px', fontSize: 12, cursor: 'pointer',
  },
  tableWrap: {
    flex: 1, overflowY: 'auto' as const, overflowX: 'hidden',
  },
  table: {
    width: '100%', borderCollapse: 'collapse', background: '#fff',
  },
  th: {
    background: '#f8fafc', padding: '8px 10px', textAlign: 'left' as const,
    fontSize: 12, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e2e8f0',
    whiteSpace: 'nowrap' as const,
  },
  td: {
    padding: '8px 10px', fontSize: 13, color: '#334155', borderBottom: '1px solid #f1f5f9',
  },
  badge: {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 500,
  },
  badgeNotStarted: { background: '#f1f5f9', color: '#64748b' },
  badgeWriting: { background: '#dbeafe', color: '#1d4ed8' },
  badgePendingReview: { background: '#fef3c7', color: '#d97706' },
  badgeReviewed: { background: '#dcfce7', color: '#16a34a' },
  badgePrinted: { background: '#e0e7ff', color: '#4338ca' },
  badgePublished: { background: '#f3e8ff', color: '#7c3aed' },
  actions: { display: 'flex', gap: 4, flexWrap: 'wrap' as const },
  criticalBadge: {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    background: '#fee2e2', color: '#dc2626',
    padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600,
  },
  pagination: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 14px', background: '#fff', borderTop: '1px solid #e2e8f0',
    flexShrink: 0,
  },
  pageInfo: { fontSize: 13, color: '#64748b' },
  pageBtns: { display: 'flex', gap: 4 },
  pageBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 30, height: 30, borderRadius: 6, border: '1px solid #e2e8f0',
    background: '#fff', cursor: 'pointer', fontSize: 13, color: '#475569',
  },
  pageBtnActive: { background: '#1a3a5c', color: '#fff', border: '1px solid #1a3a5c' },
  pageBtnDisabled: { opacity: 0.5, cursor: 'not-allowed' },
  // 模板管理
  templateList: { display: 'flex', flexDirection: 'column' as const, gap: 8 },
  templateCard: {
    padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0',
    cursor: 'pointer', transition: 'all 0.15s',
  },
  templateCardActive: { border: '1px solid #1a3a5c', background: '#f0f7ff' },
  templateName: { fontSize: 13, fontWeight: 600, color: '#1a3a5c', marginBottom: 2 },
  templateMeta: { fontSize: 11, color: '#94a3b8' },
  templateActions: { display: 'flex', gap: 4, marginTop: 6 },
  // 弹窗
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: '#fff', borderRadius: 12, width: 720, maxHeight: '90vh',
    overflow: 'hidden', display: 'flex', flexDirection: 'column' as const,
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
  },
  modalHeader: {
    padding: '14px 18px', borderBottom: '1px solid #e2e8f0',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  modalTitle: { fontSize: 15, fontWeight: 700, color: '#1a3a5c' },
  modalClose: {
    background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8',
    display: 'flex', alignItems: 'center', padding: 4,
  },
  modalBody: { padding: 18, overflowY: 'auto' as const, flex: 1 },
  modalFooter: {
    padding: '12px 18px', borderTop: '1px solid #e2e8f0',
    display: 'flex', justifyContent: 'flex-end', gap: 10,
  },
  reportSection: { marginBottom: 14 },
  reportSectionTitle: {
    fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8,
    textTransform: 'uppercase' as const, letterSpacing: '0.5px',
  },
  reportGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  reportField: { display: 'flex', flexDirection: 'column' as const, gap: 2 },
  reportFieldLabel: { fontSize: 11, color: '#94a3b8' },
  reportFieldValue: { fontSize: 13, color: '#334155', lineHeight: 1.5 },
  reportFieldFull: { gridColumn: '1 / -1' },
  textarea: {
    border: '1px solid #e2e8f0', borderRadius: 6, padding: '8px 10px',
    fontSize: 13, color: '#334155', outline: 'none', resize: 'vertical' as const,
    minHeight: 72, fontFamily: 'inherit', width: '100%', boxSizing: 'border-box',
  },
  btnCancel: {
    padding: '8px 16px', borderRadius: 6, border: '1px solid #e2e8f0',
    background: '#fff', fontSize: 13, color: '#475569', cursor: 'pointer',
  },
  btnApprove: {
    padding: '8px 16px', borderRadius: 6, border: 'none',
    background: '#16a34a', fontSize: 13, color: '#fff', cursor: 'pointer',
  },
  btnReject: {
    padding: '8px 16px', borderRadius: 6, border: 'none',
    background: '#dc2626', fontSize: 13, color: '#fff', cursor: 'pointer',
  },
  emptyState: {
    textAlign: 'center' as const, padding: '60px 20px', color: '#94a3b8', fontSize: 14,
    display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 12,
  },
  emptyStateIcon: { width: 64, height: 64, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  emptyStateTitle: { fontSize: 15, fontWeight: 600, color: '#64748b', marginTop: 4 },
  emptyStateDesc: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
  statCards: {
    display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' as const, flexShrink: 0,
  },
  statCard: {
    background: '#fff', borderRadius: 8, padding: '10px 14px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)', minWidth: 100,
  },
  statValue: { fontSize: 18, fontWeight: 700, color: '#1a3a5c' },
  statLabel: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  // 模板编辑弹窗
  templateEditor: { display: 'flex', flexDirection: 'column' as const, gap: 12 },
  formGroup: { display: 'flex', flexDirection: 'column' as const, gap: 4 },
  formLabel: { fontSize: 12, fontWeight: 600, color: '#475569' },
  formInput: {
    border: '1px solid #e2e8f0', borderRadius: 6, padding: '7px 10px',
    fontSize: 13, color: '#334155', outline: 'none',
  },
  emptyDicom: {
    flex: 1, display: 'flex', flexDirection: 'column' as const,
    alignItems: 'center', justifyContent: 'center', color: '#64748b',
    fontSize: 13, gap: 8, background: '#f8fafc',
  },
}

// ---------- 状态配置 ----------
const statusConfig: Record<ReportStatus, { label: string; style: React.CSSProperties }> = {
  '未开始': { label: '未开始', style: { ...s.badge, ...s.badgeNotStarted } },
  '书写中': { label: '书写中', style: { ...s.badge, ...s.badgeWriting } },
  '待审核': { label: '待审核', style: { ...s.badge, ...s.badgePendingReview } },
  '已审核': { label: '已审核', style: { ...s.badge, ...s.badgeReviewed } },
  '已打印': { label: '已打印', style: { ...s.badge, ...s.badgePrinted } },
  '已发布': { label: '已发布', style: { ...s.badge, ...s.badgePublished } },
}

// ---------- 模拟DICOM图片 ----------
const generateDicomThumbs = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `img_${i + 1}`,
    url: `https://picsum.photos/seed/dicom${i + 1}/400/300`,
    label: `Frame ${i + 1}`,
    info: `${400}×${300} · DICOM`,
  }))
}

// ---------- 工具函数 ----------
const getStatusBadge = (status: ReportStatus) => {
  const config = statusConfig[status]
  return (
    <span style={config.style}>
      {status === '待审核' && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#d97706', display: 'inline-block' }} />}
      {config.label}
    </span>
  )
}

// ---------- 主组件 ----------
export default function ReportPage() {
  const [reports, setReports] = useState<EndoscopyReport[]>(initialEndoscopyReports)
  const [templates, setTemplates] = useState<ReportTemplate[]>(initialReportTemplates)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ReportStatus | ''>('')
  const [examTypeFilter, setExamTypeFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 10

  const [selectedReport, setSelectedReport] = useState<EndoscopyReport | null>(null)
  const [viewReport, setViewReport] = useState<EndoscopyReport | null>(null)
  const [reviewReport, setReviewReport] = useState<EndoscopyReport | null>(null)
  const [reviewSuggestion, setReviewSuggestion] = useState('')
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null)

  // DICOM浏览器状态
  const [dicomViewMode, setDicomViewMode] = useState<'grid' | 'full'>('grid')
  const [selectedDicomIdx, setSelectedDicomIdx] = useState(0)
  const [dicomImages, setDicomImages] = useState<{ id: string; url: string; label: string; info: string }[]>([])

  // 模板管理状态
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<ReportTemplate | null>(null)
  const [templateForm, setTemplateForm] = useState({ name: '', category: '胃镜' as '胃镜' | '肠镜' | '支气管镜' | '其他', content: '' })

  // 统计
  const stats = useMemo(() => ({
    total: reports.length,
    pending: reports.filter(r => r.status === '待审核').length,
    reviewed: reports.filter(r => r.status === '已审核').length,
    published: reports.filter(r => r.status === '已发布').length,
  }), [reports])

  // 过滤
  const filtered = useMemo(() => {
    const kw = search.trim().toLowerCase()
    return reports.filter(r => {
      const matchSearch = !kw ||
        r.patientName.toLowerCase().includes(kw) ||
        r.doctorName.toLowerCase().includes(kw) ||
        r.examItemName.toLowerCase().includes(kw) ||
        r.id.toLowerCase().includes(kw)
      const matchStatus = !statusFilter || r.status === statusFilter
      const matchExamType = !examTypeFilter || r.examItemName.includes(examTypeFilter)
      const matchDateFrom = !dateFrom || r.examDate >= dateFrom
      const matchDateTo = !dateTo || r.examDate <= dateTo
      return matchSearch && matchStatus && matchExamType && matchDateFrom && matchDateTo
    })
  }, [reports, search, statusFilter, examTypeFilter, dateFrom, dateTo])

  // 分页
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  const resetFilters = () => {
    setSearch(''); setStatusFilter(''); setExamTypeFilter(''); setDateFrom(''); setDateTo(''); setPage(1)
  }

  const selectReport = (r: EndoscopyReport) => {
    setSelectedReport(r)
    const thumbs = generateDicomThumbs(r.imageUrls?.length || 8)
    setDicomImages(thumbs)
    setSelectedDicomIdx(0)
  }

  const openView = (r: EndoscopyReport) => setViewReport(r)
  const openReview = (r: EndoscopyReport) => {
    setReviewReport(r); setReviewSuggestion(''); setReviewAction(null)
  }
  const closeModal = () => {
    setViewReport(null); setReviewReport(null); setReviewSuggestion(''); setReviewAction(null)
  }

  const handleAudit = (action: 'approve' | 'reject') => {
    if (!reviewReport) return
    const now = new Date().toLocaleString('zh-CN')
    setReports(prev => prev.map(r => {
      if (r.id !== reviewReport.id) return r
      return {
        ...r, status: action === 'approve' ? '已审核' : '未开始',
        auditDoctorId: 'U002', auditDoctorName: '李秀英',
        auditTime: now, auditSuggestion: reviewSuggestion, updatedTime: now,
      }
    }))
    closeModal()
  }

  const handlePrint = (r: EndoscopyReport) => {
    setReports(prev => prev.map(report =>
      report.id === r.id
        ? { ...report, status: '已打印', printedTime: new Date().toLocaleString('zh-CN'), updatedTime: new Date().toLocaleString('zh-CN') }
        : report
    ))
  }

  const handlePublish = (r: EndoscopyReport) => {
    setReports(prev => prev.map(report =>
      report.id === r.id
        ? { ...report, status: '已发布', publishedTime: new Date().toLocaleString('zh-CN'), updatedTime: new Date().toLocaleString('zh-CN') }
        : report
    ))
  }

  // 模板管理
  const openNewTemplate = () => {
    setEditingTemplate(null)
    setTemplateForm({ name: '', category: '胃镜', content: '' })
    setShowTemplateModal(true)
  }

  const openEditTemplate = (t: ReportTemplate) => {
    setEditingTemplate(t)
    setTemplateForm({ name: t.name, category: t.category, content: t.content })
    setShowTemplateModal(true)
  }

  const saveTemplate = () => {
    if (!templateForm.name.trim()) return
    if (editingTemplate) {
      setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? { ...t, ...templateForm } : t))
    } else {
      const newTpl: ReportTemplate = {
        id: `TPL${String(templates.length + 1).padStart(3, '0')}`,
        createdBy: 'U001', usageCount: 0, ...templateForm,
      }
      setTemplates(prev => [...prev, newTpl])
    }
    setShowTemplateModal(false)
  }

  const deleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id))
  }

  const applyTemplate = (t: ReportTemplate) => {
    if (!selectedReport) return
    setReports(prev => prev.map(r =>
      r.id === selectedReport.id
        ? { ...r, templateId: t.id, templateName: t.name, findings: t.content }
        : r
    ))
    // 更新选中的报告
    setSelectedReport(prev => prev ? { ...prev, templateId: t.id, templateName: t.name, findings: t.content } : prev)
  }

  return (
    <div style={s.pageWrapper}>
      {/* 页头 */}
      <div style={s.pageHeader}>
        <div style={s.title}>📋 报告管理</div>
        <div style={s.headerActions}>
          <button style={s.btnLarge} onClick={openNewTemplate}>
            <Plus size={16} /> 新建模板
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div style={s.statCards}>
        <div style={s.statCard}>
          <div style={s.statValue}>{stats.total}</div>
          <div style={s.statLabel}>报告总数</div>
        </div>
        <div style={{ ...s.statCard, borderLeft: '3px solid #d97706' }}>
          <div style={{ ...s.statValue, color: '#d97706' }}>{stats.pending}</div>
          <div style={s.statLabel}>待审核</div>
        </div>
        <div style={{ ...s.statCard, borderLeft: '3px solid #16a34a' }}>
          <div style={{ ...s.statValue, color: '#16a34a' }}>{stats.reviewed}</div>
          <div style={s.statLabel}>已审核</div>
        </div>
        <div style={{ ...s.statCard, borderLeft: '3px solid #7c3aed' }}>
          <div style={{ ...s.statValue, color: '#7c3aed' }}>{stats.published}</div>
          <div style={s.statLabel}>已发布</div>
        </div>
      </div>

      {/* 三栏布局 */}
      <div style={s.threeColLayout}>
        {/* 左栏 - DICOM浏览器 */}
        <div style={s.panel}>
          <div style={s.panelHeader}>
            <div style={s.panelTitle}><Image size={14} /> DICOM浏览器</div>
            <div style={s.dicomToolbar}>
              <div style={s.dicomViewMode}>
                <button
                  style={{ ...s.dicomViewBtn, ...(dicomViewMode === 'grid' ? s.dicomViewBtnActive : {}) }}
                  onClick={() => setDicomViewMode('grid')} title="缩略图"
                >
                  <LayoutGrid size={13} />
                </button>
                <button
                  style={{ ...s.dicomViewBtn, ...(dicomViewMode === 'full' ? s.dicomViewBtnActive : {}) }}
                  onClick={() => setDicomViewMode('full')} title="全屏"
                >
                  <Maximize2 size={13} />
                </button>
              </div>
            </div>
          </div>

          {selectedReport ? (
            <>
              {/* 报告信息头 */}
              <div style={{ padding: '8px 12px', background: '#f0f7ff', borderBottom: '1px solid #e2e8f0', flexShrink: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#1a3a5c' }}>{selectedReport.patientName}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{selectedReport.examItemName} · {selectedReport.examDate}</div>
              </div>

              {dicomViewMode === 'grid' ? (
                <>
                  {/* 缩略图网格 */}
                  <div style={s.dicomThumbGrid}>
                    {dicomImages.map((img, idx) => (
                      <div
                        key={img.id}
                        style={{ ...s.dicomThumb, ...(idx === selectedDicomIdx ? s.dicomThumbActive : {}) }}
                        onClick={() => setSelectedDicomIdx(idx)}
                      >
                        <img src={img.url} alt={img.label} style={s.dicomThumbImg} />
                        <div style={s.dicomThumbOverlay}>{img.label}</div>
                      </div>
                    ))}
                  </div>
                  {/* 主图预览 */}
                  {dicomImages[selectedDicomIdx] && (
                    <div style={{ padding: '0 12px 12px' }}>
                      <div style={{ ...s.dicomMain, borderRadius: 8, height: 180, position: 'relative' }}>
                        <img src={dicomImages[selectedDicomIdx].url} alt="" style={s.dicomMainImg} />
                        <div style={s.dicomInfo}>{dicomImages[selectedDicomIdx].info}</div>
                        <button style={{ ...s.dicomNav, left: 8 }} onClick={() => setSelectedDicomIdx(i => Math.max(0, i - 1))}>
                          <ChevronLeft size={18} />
                        </button>
                        <button style={{ ...s.dicomNav, right: 8 }} onClick={() => setSelectedDicomIdx(i => Math.min(dicomImages.length - 1, i + 1))}>
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* 全屏模式 */
                <div style={{ ...s.dicomMain, flex: 1, borderRadius: 0 }}>
                  {dicomImages[selectedDicomIdx] && (
                    <>
                      <img src={dicomImages[selectedDicomIdx].url} alt="" style={s.dicomMainImg} />
                      <div style={s.dicomInfo}>{dicomImages[selectedDicomIdx].label} · {dicomImages[selectedDicomIdx].info}</div>
                      <button style={{ ...s.dicomNav, left: 12 }} onClick={() => setSelectedDicomIdx(i => Math.max(0, i - 1))}>
                        <ChevronLeft size={20} />
                      </button>
                      <button style={{ ...s.dicomNav, right: 12 }} onClick={() => setSelectedDicomIdx(i => Math.min(dicomImages.length - 1, i + 1))}>
                        <ChevronRight size={20} />
                      </button>
                    </>
                  )}
                </div>
              )}
            </>
          ) : (
            <div style={s.emptyDicom}>
              <FolderOpen size={48} color="#cbd5e1" />
              <div>选择报告以查看DICOM图像</div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>点击左侧列表中的报告</div>
            </div>
          )}
        </div>

        {/* 中栏 - 报告列表 */}
        <div style={s.panel}>
          <div style={s.panelHeader}>
            <div style={s.panelTitle}><FileText size={14} /> 报告列表</div>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>共 {filtered.length} 条</span>
          </div>
          <div style={s.panelBody}>
            {/* 工具栏 */}
            <div style={s.toolbar}>
              <div style={s.searchBox}>
                <Search size={14} color="#94a3b8" />
                <input
                  style={s.searchInput}
                  placeholder="搜索患者、医生、项目..."
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1) }}
                />
              </div>
              <div style={s.filterGroup}>
                <select style={s.select} value={statusFilter} onChange={e => { setStatusFilter(e.target.value as ReportStatus | ''); setPage(1) }}>
                  <option value="">状态</option>
                  <option value="未开始">未开始</option>
                  <option value="书写中">书写中</option>
                  <option value="待审核">待审核</option>
                  <option value="已审核">已审核</option>
                  <option value="已打印">已打印</option>
                  <option value="已发布">已发布</option>
                </select>
              </div>
              <div style={s.filterGroup}>
                <select style={s.select} value={examTypeFilter} onChange={e => { setExamTypeFilter(e.target.value); setPage(1) }}>
                  <option value="">类型</option>
                  <option value="胃镜">胃镜</option>
                  <option value="肠镜">肠镜</option>
                  <option value="支气管镜">支气管镜</option>
                  <option value="ERCP">ERCP</option>
                  <option value="超声内镜">超声内镜</option>
                </select>
              </div>
              <button style={s.btnIcon} onClick={resetFilters} title="重置">
                <RefreshCw size={12} />
              </button>
            </div>

            {/* 表格 */}
            <div style={s.tableWrap}>
              {paged.length === 0 ? (
                <div style={s.emptyState}>
                  <div style={s.emptyStateIcon}><FileText size={32} color="#94a3b8" /></div>
                  <div style={s.emptyStateTitle}>暂无报告信息</div>
                  <div style={s.emptyStateDesc}>完成检查后可在报告书写页面创建报告</div>
                </div>
              ) : (
                <table style={s.table}>
                  <thead>
                    <tr>
                      <th style={s.th}>报告编号</th>
                      <th style={s.th}>患者信息</th>
                      <th style={s.th}>检查项目</th>
                      <th style={s.th}>检查日期</th>
                      <th style={s.th}>报告医生</th>
                      <th style={s.th}>状态</th>
                      <th style={s.th}>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map(r => (
                      <tr
                        key={r.id}
                        style={{ background: selectedReport?.id === r.id ? '#f0f7ff' : '#fff', cursor: 'pointer' }}
                        onClick={() => selectReport(r)}
                      >
                        <td style={s.td}>
                          <div style={{ fontWeight: 600, color: '#1a3a5c', fontFamily: 'monospace', fontSize: 12 }}>{r.id}</div>
                        </td>
                        <td style={s.td}>
                          <div style={{ fontWeight: 600, color: '#1a3a5c' }}>{r.patientName}</div>
                          <div style={{ fontSize: 11, color: '#94a3b8' }}>{r.gender} {r.age}岁</div>
                        </td>
                        <td style={s.td}>
                          <div style={{ color: '#334155' }}>{r.examItemName}</div>
                        </td>
                        <td style={s.td}>
                          <div style={{ color: '#334155' }}>{r.examDate}</div>
                        </td>
                        <td style={s.td}>
                          <div style={{ color: '#334155' }}>{r.doctorName}</div>
                        </td>
                        <td style={s.td}>
                          {getStatusBadge(r.status)}
                          {r.criticalValue && <span style={s.criticalBadge}>危急值</span>}
                        </td>
                        <td style={s.td} onClick={e => e.stopPropagation()}>
                          <div style={s.actions}>
                            <button style={s.btnIcon} onClick={() => openView(r)}><Eye size={12} /> 查看</button>
                            {r.status === '待审核' && (
                              <button style={s.btnSuccess} onClick={() => openReview(r)}><CheckCircle size={12} /> 审核</button>
                            )}
                            {r.status === '已审核' && (
                              <button style={s.btnWarning} onClick={() => handlePrint(r)}><Printer size={12} /> 打印</button>
                            )}
                            {r.status === '已打印' && (
                              <button style={s.btnInfo} onClick={() => handlePublish(r)}><Send size={12} /> 发布</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* 分页 */}
            <div style={s.pagination}>
              <div style={s.pageInfo}>
                第 <strong>{page}</strong> / <strong>{totalPages}</strong> 页，共 <strong>{filtered.length}</strong> 条
              </div>
              <div style={s.pageBtns}>
                <button style={{ ...s.pageBtn, ...(page === 1 ? s.pageBtnDisabled : {}) }} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let num = i + 1
                  if (totalPages > 5) {
                    if (page > 3) num = page - 2 + i
                    if (page > totalPages - 2) num = totalPages - 4 + i
                  }
                  return (
                    <button key={num} style={{ ...s.pageBtn, ...(page === num ? s.pageBtnActive : {}) }} onClick={() => setPage(num)}>
                      {num}
                    </button>
                  )
                })}
                <button style={{ ...s.pageBtn, ...(page === totalPages ? s.pageBtnDisabled : {}) }} onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 右栏 - 模板管理 */}
        <div style={s.panel}>
          <div style={s.panelHeader}>
            <div style={s.panelTitle}><Clipboard size={14} /> 模板管理</div>
            <button style={s.btnIcon} onClick={openNewTemplate}><Plus size={12} /></button>
          </div>
          <div style={s.panelBody}>
            <div style={s.templateList}>
              {templates.map(t => (
                <div key={t.id} style={s.templateCard}>
                  <div style={s.templateName}>{t.name}</div>
                  <div style={s.templateMeta}>
                    <span style={{ marginRight: 8 }}>{t.category}</span>
                    <span>使用 {t.usageCount} 次</span>
                  </div>
                  <div style={s.templateActions}>
                    <button style={s.btnIcon} onClick={() => applyTemplate(t)} title="应用到当前报告">
                      <Download size={11} /> 应用
                    </button>
                    <button style={s.btnIcon} onClick={() => openEditTemplate(t)} title="编辑">
                      <Edit2 size={11} />
                    </button>
                    <button style={{ ...s.btnIcon, color: '#dc2626' }} onClick={() => deleteTemplate(t.id)} title="删除">
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 查看报告弹窗 */}
      {viewReport && (
        <div style={s.overlay} onClick={e => e.target === e.currentTarget && closeModal()}>
          <div style={s.modal}>
            <div style={s.modalHeader}>
              <div style={s.modalTitle}>📄 报告详情 - {viewReport.patientName}</div>
              <button style={s.modalClose} onClick={closeModal}><X size={18} /></button>
            </div>
            <div style={s.modalBody}>
              <div style={s.reportSection}>
                <div style={s.reportSectionTitle}>基本信息</div>
                <div style={s.reportGrid}>
                  <div style={s.reportField}><span style={s.reportFieldLabel}>患者姓名</span><span style={s.reportFieldValue}>{viewReport.patientName}</span></div>
                  <div style={s.reportField}><span style={s.reportFieldLabel}>性别/年龄</span><span style={s.reportFieldValue}>{viewReport.gender} / {viewReport.age}岁</span></div>
                  <div style={s.reportField}><span style={s.reportFieldLabel}>检查项目</span><span style={s.reportFieldValue}>{viewReport.examItemName}</span></div>
                  <div style={s.reportField}><span style={s.reportFieldLabel}>检查日期</span><span style={s.reportFieldValue}>{viewReport.examDate}</span></div>
                  <div style={s.reportField}><span style={s.reportFieldLabel}>报告医生</span><span style={s.reportFieldValue}>{viewReport.doctorName}</span></div>
                  <div style={s.reportField}><span style={s.reportFieldLabel}>报告状态</span><span style={s.reportFieldValue}>{getStatusBadge(viewReport.status)}</span></div>
                </div>
              </div>
              <div style={s.reportSection}>
                <div style={s.reportSectionTitle}>主诉与病史</div>
                <div style={s.reportGrid}>
                  <div style={{ ...s.reportField, ...s.reportFieldFull }}><span style={s.reportFieldLabel}>主诉</span><span style={s.reportFieldValue}>{viewReport.chiefComplaint}</span></div>
                  <div style={{ ...s.reportField, ...s.reportFieldFull }}><span style={s.reportFieldLabel}>病史</span><span style={s.reportFieldValue}>{viewReport.history}</span></div>
                </div>
              </div>
              <div style={s.reportSection}>
                <div style={s.reportSectionTitle}>检查所见</div>
                <div style={s.reportGrid}>
                  <div style={{ ...s.reportField, ...s.reportFieldFull }}><span style={s.reportFieldLabel}>镜下所见</span><span style={s.reportFieldValue} dangerouslySetInnerHTML={{ __html: viewReport.findings.replace(/\n/g, '<br/>') }} /></div>
                </div>
              </div>
              <div style={s.reportSection}>
                <div style={s.reportSectionTitle}>诊断与建议</div>
                <div style={s.reportGrid}>
                  <div style={{ ...s.reportField, ...s.reportFieldFull }}><span style={s.reportFieldLabel}>诊断</span><span style={s.reportFieldValue}>{viewReport.diagnosis}</span></div>
                  <div style={{ ...s.reportField, ...s.reportFieldFull }}><span style={s.reportFieldLabel}>结论</span><span style={s.reportFieldValue}>{viewReport.conclusion}</span></div>
                  <div style={{ ...s.reportField, ...s.reportFieldFull }}><span style={s.reportFieldLabel}>建议</span><span style={s.reportFieldValue}>{viewReport.recommendations}</span></div>
                </div>
              </div>
              {(viewReport.auditDoctorName || viewReport.auditTime) && (
                <div style={s.reportSection}>
                  <div style={s.reportSectionTitle}>审核信息</div>
                  <div style={s.reportGrid}>
                    <div style={s.reportField}><span style={s.reportFieldLabel}>审核医生</span><span style={s.reportFieldValue}>{viewReport.auditDoctorName || '—'}</span></div>
                    <div style={s.reportField}><span style={s.reportFieldLabel}>审核时间</span><span style={s.reportFieldValue}>{viewReport.auditTime || '—'}</span></div>
                    {viewReport.auditSuggestion && <div style={{ ...s.reportField, ...s.reportFieldFull }}><span style={s.reportFieldLabel}>审核意见</span><span style={s.reportFieldValue}>{viewReport.auditSuggestion}</span></div>}
                  </div>
                </div>
              )}
            </div>
            <div style={s.modalFooter}>
              <button style={s.btnCancel} onClick={closeModal}>关闭</button>
              {viewReport.status === '待审核' && (
                <button style={s.btnApprove} onClick={() => { closeModal(); openReview(viewReport) }}>
                  <CheckCircle size={14} /> 审核
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 审核弹窗 */}
      {reviewReport && (
        <div style={s.overlay} onClick={e => e.target === e.currentTarget && closeModal()}>
          <div style={s.modal}>
            <div style={s.modalHeader}>
              <div style={s.modalTitle}>✅ 审核报告 - {reviewReport.patientName}</div>
              <button style={s.modalClose} onClick={closeModal}><X size={18} /></button>
            </div>
            <div style={s.modalBody}>
              <div style={{ background: '#f8fafc', borderRadius: 8, padding: 14, marginBottom: 14 }}>
                <div style={{ fontSize: 13, color: '#334155' }}>
                  <div style={{ marginBottom: 6 }}><strong>检查项目：</strong>{reviewReport.examItemName}</div>
                  <div style={{ marginBottom: 6 }}><strong>检查日期：</strong>{reviewReport.examDate}</div>
                  <div style={{ marginBottom: 6 }}><strong>报告医生：</strong>{reviewReport.doctorName}</div>
                  <div><strong>报告结论：</strong>{reviewReport.conclusion}</div>
                </div>
              </div>
              <div style={s.reportSection}>
                <div style={s.reportSectionTitle}>审核操作</div>
                <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                  <button style={{ ...s.btnApprove, ...(reviewAction === 'approve' ? {} : { background: '#94a3b8' }) }} onClick={() => setReviewAction('approve')}>
                    <CheckCircle size={14} /> 通过审核
                  </button>
                  <button style={{ ...s.btnReject, ...(reviewAction === 'reject' ? {} : { background: '#94a3b8' }) }} onClick={() => setReviewAction('reject')}>
                    <XCircle size={14} /> 退回修改
                  </button>
                </div>
                <div style={s.reportField}>
                  <span style={s.reportFieldLabel}>审核意见</span>
                  <textarea
                    style={s.textarea}
                    placeholder={reviewAction === 'reject' ? '请填写退回原因或修改建议...' : '可填写审核备注（选填）...'}
                    value={reviewSuggestion}
                    onChange={e => setReviewSuggestion(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div style={s.modalFooter}>
              <button style={s.btnCancel} onClick={closeModal}>取消</button>
              <button style={reviewAction === 'approve' ? s.btnApprove : s.btnReject} onClick={() => reviewAction && handleAudit(reviewAction)} disabled={!reviewAction}>
                确认{reviewAction === 'approve' ? '通过' : '退回'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 模板编辑弹窗 */}
      {showTemplateModal && (
        <div style={s.overlay} onClick={e => e.target === e.currentTarget && setShowTemplateModal(false)}>
          <div style={s.modal}>
            <div style={s.modalHeader}>
              <div style={s.modalTitle}>{editingTemplate ? '✏️ 编辑模板' : '➕ 新建模板'}</div>
              <button style={s.modalClose} onClick={() => setShowTemplateModal(false)}><X size={18} /></button>
            </div>
            <div style={s.modalBody}>
              <div style={s.templateEditor}>
                <div style={s.formGroup}>
                  <label style={s.formLabel}>模板名称</label>
                  <input style={s.formInput} value={templateForm.name} onChange={e => setTemplateForm(f => ({ ...f, name: e.target.value }))} placeholder="如：标准胃镜报告模板" />
                </div>
                <div style={s.formGroup}>
                  <label style={s.formLabel}>检查类型</label>
                  <select style={s.select} value={templateForm.category} onChange={e => setTemplateForm(f => ({ ...f, category: e.target.value as typeof templateForm.category }))}>
                    <option value="胃镜">胃镜</option>
                    <option value="肠镜">肠镜</option>
                    <option value="支气管镜">支气管镜</option>
                    <option value="其他">其他</option>
                  </select>
                </div>
                <div style={s.formGroup}>
                  <label style={s.formLabel}>模板内容</label>
                  <textarea
                    style={{ ...s.textarea, minHeight: 200 }}
                    value={templateForm.content}
                    onChange={e => setTemplateForm(f => ({ ...f, content: e.target.value }))}
                    placeholder={'【检查】\n食道：\n胃底：\n胃体：\n...\n\n【诊断】\n\n【建议】'}
                  />
                </div>
              </div>
            </div>
            <div style={s.modalFooter}>
              <button style={s.btnCancel} onClick={() => setShowTemplateModal(false)}>取消</button>
              <button style={s.btnApprove} onClick={saveTemplate}><Save size={14} /> 保存模板</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
