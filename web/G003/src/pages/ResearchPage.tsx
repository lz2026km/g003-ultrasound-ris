// @ts-nocheck
// ============================================================
// G003 超声RIS系统 - 临床数据中心（研究页面）
// 5个Tab：研究课题管理 | 数据提取 | 多中心协作 | 统计分析 | 数据总览
// ============================================================
import { useState, useMemo } from 'react'
import {
  FlaskConical, Database, Building2, BarChart3, Grid3x3,
  Plus, Search, Edit2, Trash2, Download, Upload, Share2,
  FileText, Users, Clock, CheckCircle, XCircle, AlertCircle,
  ChevronLeft, ChevronRight, Filter, RefreshCw, Eye,
  FolderOpen, FileDown, Link2, Globe, Activity, PieChart as PieChartIcon,
  TrendingUp, ArrowUpRight, ArrowDownRight, Target, Award,
  X, Check, Settings, BarChart2, Table2, GitBranch
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { initialPatients, patients_v070 } from '../data/initialData'
import type { Patient, UltrasoundExam } from '../types'
import { initialUltrasoundExams } from '../data/initialData'

// ---------- 数据整合 ----------
const allPatients: Patient[] = [...initialPatients, ...patients_v070]
const allExams: UltrasoundExam[] = initialUltrasoundExams

// ============ 样式 ============
const s: Record<string, React.CSSProperties> = {
  root: { padding: 0 },
  header: {
    marginBottom: 24,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleSection: {},
  title: { fontSize: 20, fontWeight: 700, color: '#1a3a5c', margin: 0 },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 4 },
  // Tab导航
  tabNav: {
    display: 'flex',
    gap: 4,
    background: '#f1f5f9',
    padding: 4,
    borderRadius: 10,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  tabBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 16px',
    borderRadius: 6,
    border: 'none',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 500,
    transition: 'all 0.2s',
  },
  // 卡片
  card: {
    background: '#fff',
    borderRadius: 12,
    padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: '#1a3a5c',
    marginBottom: 16,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  // 按钮
  btnPrimary: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: '#1a3a5c',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '10px 18px',
    fontSize: 13,
    cursor: 'pointer',
    minHeight: 36,
  },
  btnSecondary: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: '#f1f5f9',
    color: '#475569',
    border: 'none',
    borderRadius: 8,
    padding: '10px 18px',
    fontSize: 13,
    cursor: 'pointer',
    minHeight: 36,
  },
  btnIcon: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    background: '#f1f5f9',
    color: '#475569',
    border: 'none',
    borderRadius: 6,
    padding: '6px 10px',
    fontSize: 12,
    cursor: 'pointer',
  },
  // 工具栏
  toolbar: {
    display: 'flex',
    gap: 12,
    alignItems: 'center',
    flexWrap: 'wrap',
    background: '#fff',
    padding: '12px 16px',
    borderRadius: 8,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    marginBottom: 16,
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: 6,
    padding: '6px 12px',
    flex: 1,
    minWidth: 200,
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontSize: 13,
    color: '#334155',
    width: '100%',
  },
  select: {
    border: '1px solid #e2e8f0',
    borderRadius: 6,
    padding: '6px 10px',
    fontSize: 13,
    color: '#334155',
    background: '#f8fafc',
    outline: 'none',
    cursor: 'pointer',
  },
  // 表格
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    background: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  th: {
    background: '#f8fafc',
    padding: '10px 12px',
    textAlign: 'left',
    fontSize: 12,
    fontWeight: 600,
    color: '#64748b',
    borderBottom: '1px solid #e2e8f0',
  },
  td: {
    padding: '10px 12px',
    fontSize: 13,
    color: '#334155',
    borderBottom: '1px solid #f1f5f9',
  },
  // 徽章
  badge: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: 12,
    fontSize: 11,
  },
  badgeBlue: { background: '#dbeafe', color: '#1d4ed8' },
  badgeGreen: { background: '#dcfce7', color: '#16a34a' },
  badgeOrange: { background: '#ffedd5', color: '#c2410c' },
  badgeRed: { background: '#fee2e2', color: '#dc2626' },
  badgePurple: { background: '#f3e8ff', color: '#7c3aed' },
  badgeGray: { background: '#f1f5f9', color: '#475569' },
  // KPI行
  kpiRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16,
    marginBottom: 20,
  },
  kpiCard: {
    background: '#fff',
    borderRadius: 12,
    padding: '18px 20px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: 700,
    color: '#1a3a5c',
  },
  kpiLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  // 模态框
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    background: '#fff',
    borderRadius: 12,
    padding: 24,
    maxWidth: 640,
    width: '90%',
    maxHeight: '85vh',
    overflowY: 'auto',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: '#1a3a5c',
    marginBottom: 16,
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
    marginBottom: 12,
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: 500,
  },
  input: {
    border: '1px solid #e2e8f0',
    borderRadius: 6,
    padding: '8px 12px',
    fontSize: 13,
    color: '#334155',
    outline: 'none',
  },
  textarea: {
    border: '1px solid #e2e8f0',
    borderRadius: 6,
    padding: '8px 12px',
    fontSize: 13,
    color: '#334155',
    outline: 'none',
    resize: 'vertical',
    minHeight: 80,
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 16,
    paddingTop: 16,
    borderTop: '1px solid #e2e8f0',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#94a3b8',
    fontSize: 14,
  },
  statGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 16,
    marginBottom: 20,
  },
  statCard: {
    background: '#fff',
    borderRadius: 12,
    padding: '16px 20px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    background: '#e2e8f0',
    overflow: 'hidden',
  },
}

// ============ Mock数据 ============

// 研究课题
const RESEARCH_TOPICS = [
  { id: 'RT001', title: '胃镜下早期胃癌筛查多中心研究', PI: '张建国', status: '进行中', patientCount: 156, examCount: 312, startDate: '2026-01-01', endDate: '2026-12-31', progress: 45, institution: '上海市第一人医院' },
  { id: 'RT002', title: '结肠息肉复发因素分析', PI: '李秀英', status: '进行中', patientCount: 89, examCount: 178, startDate: '2026-03-01', endDate: '2027-02-28', progress: 28, institution: '上海市第一人医院' },
  { id: 'RT003', title: 'ERCP术后并发症风险评估模型', PI: '王海涛', status: '待审核', patientCount: 42, examCount: 56, startDate: '2026-06-01', endDate: '2027-05-31', progress: 0, institution: '南京市中心医院' },
  { id: 'RT004', title: '超声检查在胰腺疾病诊断中的应用', PI: '赵晓敏', status: '已完成', patientCount: 120, examCount: 180, startDate: '2025-06-01', endDate: '2026-05-31', progress: 100, institution: '北京市协和医院' },
  { id: 'RT005', title: 'HP感染与胃癌发生相关性研究', PI: '刘伟东', status: '进行中', patientCount: 230, examCount: 460, startDate: '2025-09-01', endDate: '2026-08-31', progress: 62, institution: '广州市第一人医院' },
]

// 数据提取任务
const DATA_EXTRACTIONS = [
  { id: 'DE001', name: '2026年Q1胃镜检查数据', fields: 'patientName,examDate,findings,biopsyResult', recordCount: 856, status: '已完成', createdBy: '张建国', createdAt: '2026-04-01', format: 'CSV' },
  { id: 'DE002', name: '结肠镜息肉患者随访数据', fields: 'patientName,lastExamDate,totalExamCount,findings', recordCount: 342, status: '进行中', createdBy: '李秀英', createdAt: '2026-04-10', format: 'Excel' },
  { id: 'DE003', name: 'HP阳性患者治疗效果追踪', fields: 'patientName,HP_result,treatment,followUpDate', recordCount: 128, status: '待处理', createdBy: '王海涛', createdAt: '2026-04-15', format: 'CSV' },
  { id: 'DE004', name: '早癌筛查阳性病例汇总', fields: 'patientName,examDate,findings,biopsyResult,diagnosis', recordCount: 45, status: '已完成', createdBy: '赵晓敏', createdAt: '2026-03-20', format: 'PDF' },
  { id: 'DE005', name: 'ERCP手术数据提取', fields: 'patientName,examDate,procedure,complications', recordCount: 67, status: '已完成', createdBy: '刘伟东', createdAt: '2026-04-05', format: 'Excel' },
]

// 多中心协作
const MULTI_CENTER_COLLABS = [
  { id: 'MC001', name: '华东地区消化超声联盟', members: 12, myRole: '参与单位', joinedDate: '2025-06-01', dataShared: 4521, examsIncluded: 8950, status: 'active', recentActivity: '2026-04-28' },
  { id: 'MC002', name: '全国早期胃癌筛查网络', members: 45, myRole: '核心成员', joinedDate: '2024-01-01', dataShared: 23400, examsIncluded: 45000, status: 'active', recentActivity: '2026-04-29' },
  { id: 'MC003', name: '结肠早癌AI诊断多中心验证', members: 8, myRole: '牵头单位', joinedDate: '2025-09-01', dataShared: 1200, examsIncluded: 2400, status: 'active', recentActivity: '2026-04-27' },
  { id: 'MC004', name: 'HP规范化治疗研究协作组', members: 23, myRole: '参与单位', joinedDate: '2025-03-01', dataShared: 3200, examsIncluded: 6800, status: 'pending', recentActivity: '2026-04-20' },
]

// ============ 辅助组件 ============

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, React.CSSProperties> = {
    '进行中': s.badgeBlue,
    '已完成': s.badgeGreen,
    '待审核': s.badgeOrange,
    '待处理': s.badgeGray,
    '已取消': s.badgeRed,
    'active': s.badgeGreen,
    'pending': s.badgeOrange,
    '已退出': s.badgeRed,
  }
  return <span style={{ ...s.badge, ...(map[status] || s.badgeGray) }}>{status}</span>
}

const PageSizeSelector = ({ value, onChange }: { value: number, onChange: (v: number) => void }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
    <span style={{ fontSize: 12, color: '#64748b' }}>每页</span>
    <select value={value} onChange={e => onChange(Number(e.target.value))} style={s.select}>
      {[10, 20, 50, 100].map(v => <option key={v} value={v}>{v}条</option>)}
    </select>
  </div>
)

// ============ Tab1: 研究课题管理 ============
function Tab1Research() {
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState('全部')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState<typeof RESEARCH_TOPICS[0] | null>(null)

  const filtered = useMemo(() => {
    return RESEARCH_TOPICS.filter(t => {
      const matchKw = t.title.includes(keyword) || t.PI.includes(keyword) || t.institution.includes(keyword)
      const matchStatus = statusFilter === '全部' || t.status === statusFilter
      return matchKw && matchStatus
    })
  }, [keyword, statusFilter])

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)
  const totalPages = Math.ceil(filtered.length / pageSize)

  const openNew = () => { setEditItem(null); setShowModal(true) }
  const openEdit = (item: typeof RESEARCH_TOPICS[0]) => { setEditItem(item); setShowModal(true) }

  return (
    <div>
      <div style={s.toolbar}>
        <div style={s.searchBox}>
          <Search size={14} color="#94a3b8" />
          <input style={s.searchInput} placeholder="搜索课题、PI、机构..." value={keyword} onChange={e => { setKeyword(e.target.value); setPage(1) }} />
        </div>
        <select style={s.select} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
          <option value="全部">全部状态</option>
          <option value="进行中">进行中</option>
          <option value="已完成">已完成</option>
          <option value="待审核">待审核</option>
        </select>
        <button style={s.btnPrimary} onClick={openNew}><Plus size={14} />新建课题</button>
      </div>

      {/* KPI概览 */}
      <div style={s.kpiRow}>
        <div style={s.kpiCard}>
          <div style={{ fontSize: 12, color: '#64748b' }}>课题总数</div>
          <div style={s.kpiValue}>{RESEARCH_TOPICS.length}</div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>进行中 {RESEARCH_TOPICS.filter(t => t.status === '进行中').length} 个</div>
        </div>
        <div style={s.kpiCard}>
          <div style={{ fontSize: 12, color: '#64748b' }}>入组患者</div>
          <div style={s.kpiValue}>{RESEARCH_TOPICS.reduce((sum, t) => sum + t.patientCount, 0).toLocaleString()}</div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>累计检查 {RESEARCH_TOPICS.reduce((sum, t) => sum + t.examCount, 0).toLocaleString()} 次</div>
        </div>
        <div style={s.kpiCard}>
          <div style={{ fontSize: 12, color: '#64748b' }}>已完成</div>
          <div style={s.kpiValue}>{RESEARCH_TOPICS.filter(t => t.status === '已完成').length}</div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>待审核 {RESEARCH_TOPICS.filter(t => t.status === '待审核').length} 个</div>
        </div>
        <div style={s.kpiCard}>
          <div style={{ fontSize: 12, color: '#64748b' }}>多中心协作</div>
          <div style={s.kpiValue}>{MULTI_CENTER_COLLABS.length}</div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>联盟机构参与</div>
        </div>
      </div>

      {/* 表格 */}
      <div style={s.card}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>课题名称</th>
              <th style={s.th}>PI</th>
              <th style={s.th}>机构</th>
              <th style={s.th}>状态</th>
              <th style={s.th}>入组</th>
              <th style={s.th}>进度</th>
              <th style={s.th}>时间</th>
              <th style={s.th}>操作</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr><td colSpan={8} style={{ ...s.td, textAlign: 'center', color: '#94a3b8', padding: 32 }}>暂无数据</td></tr>
            ) : paginated.map(item => (
              <tr key={item.id}>
                <td style={s.td}><div style={{ fontWeight: 500, color: '#1a3a5c' }}>{item.title}</div></td>
                <td style={s.td}>{item.PI}</td>
                <td style={s.td}>{item.institution}</td>
                <td style={s.td}><StatusBadge status={item.status} /></td>
                <td style={s.td}>{item.patientCount} / {item.examCount}次</td>
                <td style={s.td}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ ...s.progressBar, width: 60 }}>
                      <div style={{ width: `${item.progress}%`, height: '100%', background: item.progress === 100 ? '#22c55e' : '#3b82f6', borderRadius: 4 }} />
                    </div>
                    <span style={{ fontSize: 11, color: '#64748b' }}>{item.progress}%</span>
                  </div>
                </td>
                <td style={s.td}><div style={{ fontSize: 11 }}>{item.startDate}</div><div style={{ fontSize: 11, color: '#94a3b8' }}>至 {item.endDate}</div></td>
                <td style={s.td}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button style={s.btnIcon} onClick={() => openEdit(item)}><Eye size={12} /></button>
                    <button style={s.btnIcon}><Edit2 size={12} /></button>
                    <button style={{ ...s.btnIcon, color: '#dc2626' }}><Trash2 size={12} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 分页 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, padding: '12px 16px', background: '#f8fafc', borderRadius: 8 }}>
          <span style={{ fontSize: 12, color: '#64748b' }}>共 {filtered.length} 条</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <PageSizeSelector value={pageSize} onChange={v => { setPageSize(v); setPage(1) }} />
            <button style={s.btnIcon} onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}><ChevronLeft size={14} /></button>
            <span style={{ fontSize: 12, color: '#334155' }}>{page} / {totalPages || 1}</span>
            <button style={s.btnIcon} onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages}><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>

      {/* 新建/编辑弹窗 */}
      {showModal && (
        <div style={s.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <div style={s.modalTitle}>{editItem ? '编辑课题' : '新建研究课题'}</div>
            <div style={s.formRow}>
              <div style={s.formGroup}>
                <label style={s.label}>课题名称 *</label>
                <input style={s.input} defaultValue={editItem?.title || ''} placeholder="请输入课题名称" />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>PI负责人 *</label>
                <input style={s.input} defaultValue={editItem?.PI || ''} placeholder="请输入PI姓名" />
              </div>
            </div>
            <div style={s.formRow}>
              <div style={s.formGroup}>
                <label style={s.label}>所属机构 *</label>
                <input style={s.input} defaultValue={editItem?.institution || ''} placeholder="请输入机构名称" />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>研究状态</label>
                <select style={s.input} defaultValue={editItem?.status || '待审核'}>
                  <option>待审核</option><option>进行中</option><option>已完成</option><option>已取消</option>
                </select>
              </div>
            </div>
            <div style={s.formRow}>
              <div style={s.formGroup}>
                <label style={s.label}>开始日期</label>
                <input style={s.input} type="date" defaultValue={editItem?.startDate || ''} />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>结束日期</label>
                <input style={s.input} type="date" defaultValue={editItem?.endDate || ''} />
              </div>
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>研究描述</label>
              <textarea style={s.textarea} defaultValue={editItem?.title || ''} placeholder="请输入课题描述和研究目的..." />
            </div>
            <div style={s.modalActions}>
              <button style={s.btnSecondary} onClick={() => setShowModal(false)}>取消</button>
              <button style={s.btnPrimary} onClick={() => setShowModal(false)}><Check size={14} />保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ============ Tab2: 数据提取 ============
function Tab2DataExtract() {
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState('全部')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [showExtractModal, setShowExtractModal] = useState(false)

  const filtered = useMemo(() => {
    return DATA_EXTRACTIONS.filter(d => {
      const matchKw = d.name.includes(keyword) || d.createdBy.includes(keyword)
      const matchStatus = statusFilter === '全部' || d.status === statusFilter
      return matchKw && matchStatus
    })
  }, [keyword, statusFilter])

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)
  const totalPages = Math.ceil(filtered.length / pageSize)

  const formatBadge = (format: string) => {
    const map: Record<string, React.CSSProperties> = { CSV: s.badgeBlue, Excel: s.badgeGreen, PDF: s.badgeOrange }
    return <span style={{ ...s.badge, ...(map[format] || s.badgeGray) }}>{format}</span>
  }

  return (
    <div>
      <div style={s.toolbar}>
        <div style={s.searchBox}>
          <Search size={14} color="#94a3b8" />
          <input style={s.searchInput} placeholder="搜索提取任务..." value={keyword} onChange={e => { setKeyword(e.target.value); setPage(1) }} />
        </div>
        <select style={s.select} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
          <option value="全部">全部状态</option>
          <option value="已完成">已完成</option>
          <option value="进行中">进行中</option>
          <option value="待处理">待处理</option>
        </select>
        <button style={s.btnPrimary} onClick={() => setShowExtractModal(true)}><Plus size={14} />新建提取</button>
      </div>

      {/* 统计卡片 */}
      <div style={s.kpiRow}>
        <div style={s.kpiCard}>
          <div style={{ fontSize: 12, color: '#64748b' }}>提取任务</div>
          <div style={s.kpiValue}>{DATA_EXTRACTIONS.length}</div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>已完成 {DATA_EXTRACTIONS.filter(d => d.status === '已完成').length} 个</div>
        </div>
        <div style={s.kpiCard}>
          <div style={{ fontSize: 12, color: '#64748b' }}>提取记录</div>
          <div style={s.kpiValue}>{DATA_EXTRACTIONS.reduce((sum, d) => sum + d.recordCount, 0).toLocaleString()}</div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>总记录条数</div>
        </div>
        <div style={s.kpiCard}>
          <div style={{ fontSize: 12, color: '#64748b' }}>进行中</div>
          <div style={s.kpiValue}>{DATA_EXTRACTIONS.filter(d => d.status === '进行中').length}</div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>待处理 {DATA_EXTRACTIONS.filter(d => d.status === '待处理').length}</div>
        </div>
        <div style={s.kpiCard}>
          <div style={{ fontSize: 12, color: '#64748b' }}>数据源</div>
          <div style={s.kpiValue}>{allPatients.length.toLocaleString()}</div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>患者 | {allExams.length} 检查</div>
        </div>
      </div>

      {/* 数据提取向导入口 */}
      <div style={{ ...s.card, marginBottom: 16 }}>
        <div style={s.cardTitle}><Database size={16} color="#3b82f6" />快速数据提取</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { label: '按检查类型', desc: '胃镜/肠镜/超声检查...', icon: FlaskConical, color: '#3b82f6' },
            { label: '按时间范围', desc: '自定义日期区间', icon: Clock, color: '#22c55e' },
            { label: '按诊断结果', desc: '阳性/阴性/息肉...', icon: FileText, color: '#f97316' },
            { label: '按患者特征', desc: '年龄/性别/病史...', icon: Users, color: '#8b5cf6' },
            { label: 'HP追踪数据', desc: 'HP检测与治疗随访', icon: Activity, color: '#14b8a6' },
            { label: '早癌筛查数据', desc: '早癌阳性病例汇总', icon: Target, color: '#dc2626' },
          ].map((item, i) => (
            <div key={i} style={{ padding: 14, background: '#f8fafc', borderRadius: 8, cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'center' }}>
              <item.icon size={20} color={item.color} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#334155' }}>{item.label}</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 提取历史 */}
      <div style={s.card}>
        <div style={s.cardTitle}><FolderOpen size={16} color="#64748b" />提取记录</div>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>任务名称</th>
              <th style={s.th}>提取字段</th>
              <th style={s.th}>记录数</th>
              <th style={s.th}>格式</th>
              <th style={s.th}>状态</th>
              <th style={s.th}>创建人</th>
              <th style={s.th}>时间</th>
              <th style={s.th}>操作</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr><td colSpan={8} style={{ ...s.td, textAlign: 'center', color: '#94a3b8', padding: 32 }}>暂无数据</td></tr>
            ) : paginated.map(item => (
              <tr key={item.id}>
                <td style={s.td}><div style={{ fontWeight: 500, color: '#1a3a5c' }}>{item.name}</div></td>
                <td style={s.td}><div style={{ fontSize: 11, color: '#64748b', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.fields}</div></td>
                <td style={s.td}>{item.recordCount.toLocaleString()}</td>
                <td style={s.td}>{formatBadge(item.format)}</td>
                <td style={s.td}><StatusBadge status={item.status} /></td>
                <td style={s.td}>{item.createdBy}</td>
                <td style={s.td}><div style={{ fontSize: 11 }}>{item.createdAt}</div></td>
                <td style={s.td}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button style={s.btnIcon}><Download size={12} /></button>
                    <button style={s.btnIcon}><Share2 size={12} /></button>
                    <button style={{ ...s.btnIcon, color: '#dc2626' }}><Trash2 size={12} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, padding: '12px 16px', background: '#f8fafc', borderRadius: 8 }}>
          <span style={{ fontSize: 12, color: '#64748b' }}>共 {filtered.length} 条</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <PageSizeSelector value={pageSize} onChange={v => { setPageSize(v); setPage(1) }} />
            <button style={s.btnIcon} onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}><ChevronLeft size={14} /></button>
            <span style={{ fontSize: 12, color: '#334155' }}>{page} / {totalPages || 1}</span>
            <button style={s.btnIcon} onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages}><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>

      {showExtractModal && (
        <div style={s.modalOverlay} onClick={() => setShowExtractModal(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <div style={s.modalTitle}>新建数据提取任务</div>
            <div style={s.formGroup}>
              <label style={s.label}>任务名称 *</label>
              <input style={s.input} placeholder="请输入任务名称" />
            </div>
            <div style={s.formRow}>
              <div style={s.formGroup}>
                <label style={s.label}>数据源</label>
                <select style={s.input}>
                  <option>患者档案</option><option>检查记录</option><option>报告数据</option>
                </select>
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>导出格式</label>
                <select style={s.input}>
                  <option>CSV</option><option>Excel</option><option>PDF</option><option>JSON</option>
                </select>
              </div>
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>筛选条件</label>
              <textarea style={s.textarea} placeholder="例如：examDate >= '2026-01-01' AND examDate <= '2026-04-30'" />
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>提取字段（逗号分隔）</label>
              <input style={s.input} placeholder="patientName, examDate, findings, biopsyResult" />
            </div>
            <div style={s.modalActions}>
              <button style={s.btnSecondary} onClick={() => setShowExtractModal(false)}>取消</button>
              <button style={s.btnPrimary} onClick={() => setShowExtractModal(false)}><Check size={14} />开始提取</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ============ Tab3: 多中心协作 ============
function Tab3MultiCenter() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const paginated = MULTI_CENTER_COLLABS.slice((page - 1) * pageSize, page * pageSize)
  const totalPages = Math.ceil(MULTI_CENTER_COLLABS.length / pageSize)

  const roleBadge = (role: string) => {
    const map: Record<string, React.CSSProperties> = { '牵头单位': s.badgePurple, '核心成员': s.badgeBlue, '参与单位': s.badgeGreen }
    return <span style={{ ...s.badge, ...(map[role] || s.badgeGray) }}>{role}</span>
  }

  return (
    <div>
      {/* 概览 */}
      <div style={s.kpiRow}>
        <div style={s.kpiCard}>
          <div style={{ fontSize: 12, color: '#64748b' }}>协作网络</div>
          <div style={s.kpiValue}>{MULTI_CENTER_COLLABS.length}</div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>活跃 {MULTI_CENTER_COLLABS.filter(m => m.status === 'active').length} 个</div>
        </div>
        <div style={s.kpiCard}>
          <div style={{ fontSize: 12, color: '#64748b' }}>参与机构</div>
          <div style={s.kpiValue}>{MULTI_CENTER_COLLABS.reduce((sum, m) => sum + m.members, 0)}</div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>覆盖全国</div>
        </div>
        <div style={s.kpiCard}>
          <div style={{ fontSize: 12, color: '#64748b' }}>数据共享</div>
          <div style={s.kpiValue}>{(MULTI_CENTER_COLLABS.reduce((sum, m) => sum + m.dataShared) / 10000).toFixed(1)}万</div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>条脱敏记录</div>
        </div>
        <div style={s.kpiCard}>
          <div style={{ fontSize: 12, color: '#64748b' }}>协作检查</div>
          <div style={s.kpiValue}>{(MULTI_CENTER_COLLABS.reduce((sum, m) => sum + m.examsIncluded) / 10000).toFixed(1)}万</div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>纳入分析</div>
        </div>
      </div>

      {/* 协作网络地图示意 */}
      <div style={s.card}>
        <div style={s.cardTitle}><Globe size={16} color="#3b82f6" />协作网络</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {MULTI_CENTER_COLLABS.map(c => (
            <div key={c.id} style={{ padding: 16, borderRadius: 10, border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.2s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1a3a5c' }}>{c.name}</div>
                <StatusBadge status={c.status} />
              </div>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Users size={11} /> {c.members} 家机构</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}><Link2 size={11} /> {roleBadge(c.myRole)}</div>
              </div>
              <div style={{ display: 'grid', gridGridTemplateColumns: '1fr 1fr', gap: 6 }}>
                <div style={{ background: '#f8fafc', borderRadius: 6, padding: '6px 8px' }}>
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>共享数据</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1a3a5c' }}>{c.dataShared.toLocaleString()}</div>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: 6, padding: '6px 8px' }}>
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>纳入检查</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1a3a5c' }}>{c.examsIncluded.toLocaleString()}</div>
                </div>
              </div>
              <div style={{ marginTop: 8, fontSize: 11, color: '#94a3b8' }}>最近活动: {c.recentActivity}</div>
              <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                <button style={{ ...s.btnIcon, flex: 1 }}><GitBranch size={11} />查看详情</button>
                <button style={{ ...s.btnIcon, flex: 1 }}><Share2 size={11} />数据贡献</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 参与机构详情 */}
      <div style={s.card}>
        <div style={s.cardTitle}><Building2 size={16} color="#64748b" />机构列表</div>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>协作名称</th>
              <th style={s.th}>我的角色</th>
              <th style={s.th}>成员数</th>
              <th style={s.th}>共享数据</th>
              <th style={s.th}>纳入检查</th>
              <th style={s.th}>状态</th>
              <th style={s.th}>加入日期</th>
              <th style={s.th}>最近活动</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map(item => (
              <tr key={item.id}>
                <td style={s.td}><div style={{ fontWeight: 500, color: '#1a3a5c' }}>{item.name}</div></td>
                <td style={s.td}>{roleBadge(item.myRole)}</td>
                <td style={s.td}>{item.members}</td>
                <td style={s.td}>{item.dataShared.toLocaleString()}</td>
                <td style={s.td}>{item.examsIncluded.toLocaleString()}</td>
                <td style={s.td}><StatusBadge status={item.status} /></td>
                <td style={s.td}>{item.joinedDate}</td>
                <td style={s.td}>{item.recentActivity}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, padding: '12px 16px', background: '#f8fafc', borderRadius: 8 }}>
          <span style={{ fontSize: 12, color: '#64748b' }}>共 {MULTI_CENTER_COLLABS.length} 条</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <PageSizeSelector value={pageSize} onChange={v => { setPageSize(v); setPage(1) }} />
            <button style={s.btnIcon} onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}><ChevronLeft size={14} /></button>
            <span style={{ fontSize: 12, color: '#334155' }}>{page} / {totalPages || 1}</span>
            <button style={s.btnIcon} onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages}><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============ Tab4: 统计分析 ============
function Tab4Stats() {
  // 基于allPatients数据的统计
  const genderStats = useMemo(() => {
    const male = allPatients.filter(p => p.gender === '男').length
    const female = allPatients.filter(p => p.gender === '女').length
    return [
      { name: '男性', value: male, color: '#3b82f6' },
      { name: '女性', value: female, color: '#ec4899' },
    ]
  }, [])

  const ageStats = useMemo(() => {
    const groups = [
      { label: '0-30', min: 0, max: 30, count: 0 },
      { label: '31-45', min: 31, max: 45, count: 0 },
      { label: '46-60', min: 46, max: 60, count: 0 },
      { label: '61-75', min: 61, max: 75, count: 0 },
      { label: '75+', min: 76, max: 200, count: 0 },
    ]
    allPatients.forEach(p => {
      const g = groups.find(g => p.age >= g.min && p.age <= g.max)
      if (g) g.count++
    })
    return groups.map(g => ({ age: g.label, count: g.count }))
  }, [])

  const examTypeStats = useMemo(() => [
    { name: '胃镜', value: 5258, color: '#3b82f6' },
    { name: '肠镜', value: 4669, color: '#22c55e' },
    { name: '超声检查', value: 1453, color: '#f97316' },
    { name: 'ERCP', value: 593, color: '#8b5cf6' },
    { name: '胶囊超声', value: 856, color: '#14b8a6' },
  ], [])

  const monthlyTrend = [
    { month: '11月', gastroscope: 505, colonoscopy: 452, ultrasound: 158, ercp: 60, capsule: 88 },
    { month: '12月', gastroscope: 518, colonoscopy: 465, ultrasound: 162, ercp: 62, capsule: 90 },
    { month: '1月', gastroscope: 485, colonoscopy: 430, ultrasound: 145, ercp: 54, capsule: 80 },
    { month: '2月', gastroscope: 462, colonoscopy: 408, ultrasound: 138, ercp: 50, capsule: 76 },
    { month: '3月', gastroscope: 512, colonoscopy: 458, ultrasound: 155, ercp: 58, capsule: 86 },
    { month: '4月', gastroscope: 528, colonoscopy: 472, ultrasound: 160, ercp: 62, capsule: 90 },
  ]

  return (
    <div>
      {/* KPI概览 */}
      <div style={s.kpiRow}>
        <div style={s.kpiCard}>
          <div style={{ fontSize: 12, color: '#64748b' }}>患者总数</div>
          <div style={s.kpiValue}>{allPatients.length.toLocaleString()}</div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>男性 {allPatients.filter(p => p.gender === '男').length} | 女性 {allPatients.filter(p => p.gender === '女').length}</div>
        </div>
        <div style={s.kpiCard}>
          <div style={{ fontSize: 12, color: '#64748b' }}>检查总数</div>
          <div style={s.kpiValue}>{allExams.length}</div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>已完成 {allExams.filter(e => e.status === '已完成').length} 例</div>
        </div>
        <div style={s.kpiCard}>
          <div style={{ fontSize: 12, color: '#64748b' }}>平均年龄</div>
          <div style={s.kpiValue}>{Math.round(allPatients.reduce((sum, p) => sum + p.age, 0) / allPatients.length)}岁</div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>年龄范围 {Math.min(...allPatients.map(p => p.age))}-{Math.max(...allPatients.map(p => p.age))}岁</div>
        </div>
        <div style={s.kpiCard}>
          <div style={{ fontSize: 12, color: '#64748b' }}>HP阳性率</div>
          <div style={s.kpiValue}>{(allPatients.filter(p => p.medicalHistory.includes('HP阳性')).length / allPatients.length * 100).toFixed(1)}%</div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>阳性 {allPatients.filter(p => p.medicalHistory.includes('HP阳性')).length} 例</div>
        </div>
      </div>

      {/* 图表行1: 月度趋势 + 性别分布 */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
        <div style={s.card}>
          <div style={s.cardTitle}><TrendingUp size={16} color="#3b82f6" />检查量月度趋势</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="gastroscope" stroke="#3b82f6" strokeWidth={2} name="胃镜" dot={{ r: 3 }} />
              <Line type="monotone" dataKey="colonoscopy" stroke="#22c55e" strokeWidth={2} name="肠镜" dot={{ r: 3 }} />
              <Line type="monotone" dataKey="ultrasound" stroke="#f97316" strokeWidth={2} name="超声" dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={s.card}>
          <div style={s.cardTitle}><PieChartIcon size={16} color="#ec4899" />患者性别分布</div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={genderStats} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {genderStats.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 8 }}>
            {genderStats.map(s => (
              <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#64748b' }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color }} />
                {s.name}: {s.value}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 图表行2: 年龄分布 + 检查类型 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={s.card}>
          <div style={s.cardTitle}><BarChart3 size={16} color="#22c55e" />患者年龄分布</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={ageStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="age" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip />
              <Bar dataKey="count" fill="#22c55e" name="患者数" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={s.card}>
          <div style={s.cardTitle}><BarChart2 size={16} color="#8b5cf6" />检查类型分布</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={examTypeStats} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#64748b' }} width={60} />
              <Tooltip />
              <Bar dataKey="value" name="检查量" radius={[0, 4, 4, 0]}>
                {examTypeStats.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

// ============ Tab5: 数据总览 ============
function Tab5DataOverview() {
  const [tab, setTab] = useState<'patients' | 'exams'>('patients')
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const filteredPatients = useMemo(() => {
    return allPatients.filter(p =>
      p.name.includes(keyword) || p.id.includes(keyword) || p.phone.includes(keyword) || p.idCard.includes(keyword)
    )
  }, [keyword])

  const filteredExams = useMemo(() => {
    return allExams.filter(e =>
      e.patientName.includes(keyword) || e.id.includes(keyword) || e.examItemName.includes(keyword)
    )
  }, [keyword])

  const currentData = tab === 'patients' ? filteredPatients : filteredExams
  const paginated = currentData.slice((page - 1) * pageSize, page * pageSize)
  const totalPages = Math.ceil(currentData.length / pageSize)

  return (
    <div>
      {/* 概览统计 */}
      <div style={s.statGrid}>
        <div style={s.statCard}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={22} color="#3b82f6" />
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#1a3a5c' }}>{allPatients.length.toLocaleString()}</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>患者总数</div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={22} color="#16a34a" />
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#1a3a5c' }}>{allExams.length}</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>检查记录</div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FlaskConical size={22} color="#7c3aed" />
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#1a3a5c' }}>{RESEARCH_TOPICS.length}</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>研究课题</div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: '#ffedd5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Database size={22} color="#c2410c" />
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#1a3a5c' }}>{DATA_EXTRACTIONS.length}</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>数据提取</div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building2 size={22} color="#0369a1" />
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#1a3a5c' }}>{MULTI_CENTER_COLLABS.length}</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>协作网络</div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertCircle size={22} color="#dc2626" />
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#1a3a5c' }}>{allPatients.filter(p => p.allergyHistory !== '无').length}</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>过敏史患者</div>
          </div>
        </div>
      </div>

      {/* 数据切换 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button
          style={{ ...s.tabBtn, background: tab === 'patients' ? '#1a3a5c' : '#f1f5f9', color: tab === 'patients' ? '#fff' : '#64748b' }}
          onClick={() => { setTab('patients'); setPage(1) }}
        >
          <Users size={14} />患者数据 ({allPatients.length.toLocaleString()})
        </button>
        <button
          style={{ ...s.tabBtn, background: tab === 'exams' ? '#1a3a5c' : '#f1f5f9', color: tab === 'exams' ? '#fff' : '#64748b' }}
          onClick={() => { setTab('exams'); setPage(1) }}
        >
          <FileText size={14} />检查数据 ({allExams.length})
        </button>
      </div>

      {/* 搜索栏 */}
      <div style={s.toolbar}>
        <div style={s.searchBox}>
          <Search size={14} color="#94a3b8" />
          <input
            style={s.searchInput}
            placeholder={tab === 'patients' ? '搜索患者姓名/ID/电话/身份证...' : '搜索检查患者/ID/项目名称...'}
            value={keyword}
            onChange={e => { setKeyword(e.target.value); setPage(1) }}
          />
        </div>
        <button style={s.btnSecondary}><RefreshCw size={13} />刷新</button>
        <button style={s.btnSecondary}><Download size={13} />导出</button>
      </div>

      {/* 患者表格 */}
      {tab === 'patients' && (
        <div style={s.card}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>ID</th>
                <th style={s.th}>姓名</th>
                <th style={s.th}>性别</th>
                <th style={s.th}>年龄</th>
                <th style={s.th}>电话</th>
                <th style={s.th}>身份证</th>
                <th style={s.th}>地址</th>
                <th style={s.th}>过敏史</th>
                <th style={s.th}>病史</th>
                <th style={s.th}>登记日期</th>
                <th style={s.th}>累计检查</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={11} style={{ ...s.td, textAlign: 'center', color: '#94a3b8', padding: 32 }}>暂无数据</td></tr>
              ) : paginated.map(p => (
                <tr key={p.id}>
                  <td style={s.td}>{p.id}</td>
                  <td style={s.td}><div style={{ fontWeight: 500, color: '#1a3a5c' }}>{p.name}</div></td>
                  <td style={s.td}>{p.gender}</td>
                  <td style={s.td}>{p.age}</td>
                  <td style={s.td}>{p.phone}</td>
                  <td style={s.td}><div style={{ fontSize: 11 }}>{p.idCard}</div></td>
                  <td style={s.td}><div style={{ fontSize: 11, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.address}</div></td>
                  <td style={s.td}>
                    {p.allergyHistory !== '无' ? (
                      <span style={{ ...s.badge, ...s.badgeRed }}>{p.allergyHistory}</span>
                    ) : <span style={{ color: '#94a3b8' }}>无</span>}
                  </td>
                  <td style={s.td}><div style={{ fontSize: 11, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.medicalHistory}</div></td>
                  <td style={s.td}>{p.registrationDate}</td>
                  <td style={s.td}>{p.totalExamCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 检查表格 */}
      {tab === 'exams' && (
        <div style={s.card}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>ID</th>
                <th style={s.th}>患者</th>
                <th style={s.th}>检查项目</th>
                <th style={s.th}>医生</th>
                <th style={s.th}>检查室</th>
                <th style={s.th}>日期</th>
                <th style={s.th}>时间</th>
                <th style={s.th}>状态</th>
                <th style={s.th}>照片</th>
                <th style={s.th}>活检</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={10} style={{ ...s.td, textAlign: 'center', color: '#94a3b8', padding: 32 }}>暂无数据</td></tr>
              ) : paginated.map(e => (
                <tr key={e.id}>
                  <td style={s.td}>{e.id}</td>
                  <td style={s.td}><div style={{ fontWeight: 500, color: '#1a3a5c' }}>{e.patientName}</div><div style={{ fontSize: 11, color: '#94a3b8' }}>{e.patientId}</div></td>
                  <td style={s.td}>{e.examItemName}</td>
                  <td style={s.td}>{e.doctorName}</td>
                  <td style={s.td}>{e.examRoom}</td>
                  <td style={s.td}>{e.examDate}</td>
                  <td style={s.td}>{e.examTime}</td>
                  <td style={s.td}><StatusBadge status={e.status} /></td>
                  <td style={s.td}>{e.photoCount || 0}</td>
                  <td style={s.td}>{e.biopsCount || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 分页 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <span style={{ fontSize: 12, color: '#64748b' }}>共 {currentData.length.toLocaleString()} 条</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <PageSizeSelector value={pageSize} onChange={v => { setPageSize(v); setPage(1) }} />
          <button style={s.btnIcon} onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}><ChevronLeft size={14} /></button>
          <span style={{ fontSize: 12, color: '#334155' }}>{page} / {totalPages || 1}</span>
          <button style={s.btnIcon} onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages}><ChevronRight size={14} /></button>
        </div>
      </div>
    </div>
  )
}

// ============ 主组件 ============
export default function ResearchPage() {
  const [activeTab, setActiveTab] = useState(0)
  const tabs = [
    { name: '研究课题管理', icon: FlaskConical },
    { name: '数据提取', icon: Database },
    { name: '多中心协作', icon: Building2 },
    { name: '统计分析', icon: BarChart3 },
    { name: '数据总览', icon: Grid3x3 },
  ]
  const tabContents = [Tab1Research, Tab2DataExtract, Tab3MultiCenter, Tab4Stats, Tab5DataOverview]
  const ActiveTabContent = tabContents[activeTab]

  return (
    <div style={s.root}>
      {/* 标题区 */}
      <div style={s.header}>
        <div style={s.titleSection}>
          <h1 style={s.title}>临床数据中心</h1>
          <p style={s.subtitle}>智慧消化专科诊疗平台 · 研究数据管理</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={s.btnSecondary}><Download size={14} />导出报告</button>
          <button style={s.btnSecondary}><Share2 size={14} />共享设置</button>
        </div>
      </div>

      {/* Tab导航 */}
      <div style={s.tabNav}>
        {tabs.map((tab, i) => {
          const Icon = tab.icon
          return (
            <button
              key={i}
              style={{
                ...s.tabBtn,
                background: activeTab === i ? '#fff' : 'transparent',
                color: activeTab === i ? '#1a3a5c' : '#64748b',
                boxShadow: activeTab === i ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                fontWeight: activeTab === i ? 600 : 500,
              }}
              onClick={() => setActiveTab(i)}
            >
              <Icon size={16} />
              {tab.name}
            </button>
          )
        })}
      </div>

      {/* Tab内容 */}
      <ActiveTabContent />
    </div>
  )
}
