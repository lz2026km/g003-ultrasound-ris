// @ts-nocheck
// G003 超声RIS - 工作列表页面 v0.2.0 增强版
// 三面板布局：左侧检查列表/中间患者详情/右侧检查信息
import { useState, useCallback } from 'react'
import {
  Search, Filter, Clock, User, Monitor, CheckCircle, AlertCircle,
  ChevronRight, Printer, Archive, RefreshCw, Stethoscope, Activity,
  Baby, Scan, Radio, Heart, Layers, Play, FileText, CheckSquare,
  Square, X, Info, Calendar, DollarSign, Phone, CreditCard
} from 'lucide-react'

// ============ 模拟数据 ============
const examTypes = ['腹部', '心脏', '妇产', '浅表', '血管', '介入']

const workflowSteps = [
  { key: 'scheduled', label: '预约' },
  { key: 'registered', label: '登记' },
  { key: 'examining', label: '检查中' },
  { key: 'reporting', label: '报告' },
  { key: 'archived', label: '归档' },
]

const mockWorklist = [
  {
    id: 'W001', patientId: 'P001', patientName: '张三', examType: '腹部', examSubtype: '肝脏',
    priority: 'STAT', status: 'Pending', appointmentTime: '09:00', doctor: '李明辉',
    device: '彩超仪 A', age: 45, gender: '男', phone: '138****1234',
    workflow: { scheduled: true, registered: true, examining: false, reporting: false, archived: false },
    fee: 180, note: '空腹8小时以上'
  },
  {
    id: 'W002', patientId: 'P002', patientName: '李红', examType: '心脏', examSubtype: '心脏彩超',
    priority: 'Urgent', status: 'In Progress', appointmentTime: '09:30', doctor: '王晓燕',
    device: '彩超仪 B', age: 52, gender: '女', phone: '139****5678',
    workflow: { scheduled: true, registered: true, examining: true, reporting: false, archived: false },
    fee: 280, note: '既往心脏病史'
  },
  {
    id: 'W003', patientId: 'P003', patientName: '王五', examType: '浅表', examSubtype: '甲状腺',
    priority: 'Normal', status: 'Pending', appointmentTime: '10:00', doctor: '张伟',
    device: '彩超仪 A', age: 38, gender: '男', phone: '137****9012',
    workflow: { scheduled: true, registered: false, examining: false, reporting: false, archived: false },
    fee: 120, note: ''
  },
  {
    id: 'W004', patientId: 'P004', patientName: '赵丽', examType: '妇产', examSubtype: '产科彩超',
    priority: 'Normal', status: 'Completed', appointmentTime: '10:30', doctor: '李明辉',
    device: '彩超仪 B', age: 28, gender: '女', phone: '136****3456',
    workflow: { scheduled: true, registered: true, examining: true, reporting: true, archived: false },
    fee: 320, note: '孕12周'
  },
  {
    id: 'W005', patientId: 'P005', patientName: '孙伟', examType: '血管', examSubtype: '颈部血管',
    priority: 'Low', status: 'Archived', appointmentTime: '11:00', doctor: '王晓燕',
    device: '彩超仪 A', age: 61, gender: '男', phone: '135****7890',
    workflow: { scheduled: true, registered: true, examining: true, reporting: true, archived: true },
    fee: 200, note: '高血压病史'
  },
  {
    id: 'W006', patientId: 'P006', patientName: '周敏', examType: '心脏', examSubtype: '负荷超声',
    priority: 'Normal', status: 'Pending', appointmentTime: '11:30', doctor: '王晓燕',
    device: '彩超仪 B', age: 55, gender: '女', phone: '134****2345',
    workflow: { scheduled: true, registered: true, examining: false, reporting: false, archived: false },
    fee: 350, note: '运动平板试验后'
  },
  {
    id: 'W007', patientId: 'P007', patientName: '吴强', examType: '腹部', examSubtype: '脾脏',
    priority: 'Normal', status: 'Pending', appointmentTime: '14:00', doctor: '张伟',
    device: '彩超仪 A', age: 42, gender: '男', phone: '133****6789',
    workflow: { scheduled: true, registered: false, examining: false, reporting: false, archived: false },
    fee: 150, note: ''
  },
  {
    id: 'W008', patientId: 'P008', patientName: '郑丽', examType: '妇产', examSubtype: '阴超',
    priority: 'Normal', status: 'In Progress', appointmentTime: '14:30', doctor: '李明辉',
    device: '彩超仪 B', age: 32, gender: '女', phone: '132****0123',
    workflow: { scheduled: true, registered: true, examining: true, reporting: false, archived: false },
    fee: 220, note: '月经不调'
  },
]

// ============ 样式 ============
const s: Record<string, React.CSSProperties> = {
  root: { padding: 0, height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' as const },
  header: { marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 700, color: '#1a3a5c', margin: 0 },
  version: { fontSize: 11, color: '#94a3b8', marginLeft: 8, fontWeight: 400 },
  headerActions: { display: 'flex', gap: 8 },
  // 三面板容器
  threePanel: { display: 'flex', gap: 16, flex: 1, minHeight: 0, overflow: 'hidden' },
  // 左侧面板 - 检查列表
  leftPanel: {
    width: 420, flexShrink: 0, display: 'flex', flexDirection: 'column' as const,
    background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    border: '1px solid #e2e8f0', overflow: 'hidden'
  },
  leftPanelHeader: {
    padding: '14px 16px', borderBottom: '1px solid #e2e8f0',
    display: 'flex', flexDirection: 'column' as const, gap: 10, flexShrink: 0
  },
  leftPanelBody: { flex: 1, overflow: 'auto', padding: 8 },
  // 中间面板 - 患者详情
  middlePanel: {
    flex: 1, display: 'flex', flexDirection: 'column' as const,
    background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    border: '1px solid #e2e8f0', overflow: 'hidden'
  },
  middlePanelHeader: { padding: '14px 16px', borderBottom: '1px solid #e2e8f0' },
  middlePanelBody: { flex: 1, overflow: 'auto', padding: 16 },
  // 右侧面板 - 检查信息
  rightPanel: {
    width: 340, flexShrink: 0, display: 'flex', flexDirection: 'column' as const,
    background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    border: '1px solid #e2e8f0', overflow: 'hidden'
  },
  rightPanelHeader: { padding: '14px 16px', borderBottom: '1px solid #e2e8f0' },
  rightPanelBody: { flex: 1, overflow: 'auto', padding: 16 },
  // 筛选栏
  filterRow: {
    display: 'flex', gap: 8, alignItems: 'center', background: '#f8fafc',
    padding: '10px 12px', borderRadius: 8, flexWrap: 'wrap' as const,
  },
  searchInput: {
    flex: 1, minWidth: 140, padding: '6px 10px', borderRadius: 6,
    border: '1px solid #e2e8f0', fontSize: 13, color: '#1a3a5c',
    background: '#fff', outline: 'none', minHeight: 34,
  },
  filterBtn: {
    display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px',
    borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff',
    cursor: 'pointer', fontSize: 12, color: '#64748b', minHeight: 34,
  },
  filterBtnActive: {
    background: '#3b82f6', color: '#fff', border: '1px solid #3b82f6',
  },
  filterChip: {
    padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500,
    cursor: 'pointer', border: '1px solid #e2e8f0', background: '#fff',
  },
  filterChipActive: {
    background: '#1a3a5c', color: '#fff', border: '1px solid #1a3a5c',
  },
  // 检查项列表
  examItem: {
    padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
    border: '1px solid transparent', marginBottom: 4, transition: 'all 0.15s',
  },
  examItemSelected: {
    background: '#eff6ff', border: '1px solid #3b82f6',
  },
  examItemTop: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 },
  priorityDot: { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
  examItemName: { fontSize: 14, fontWeight: 600, color: '#1a3a5c', flex: 1 },
  examItemMeta: { fontSize: 12, color: '#64748b', display: 'flex', gap: 12, flexWrap: 'wrap' as const },
  // 工作流步骤条
  workflowBar: { display: 'flex', alignItems: 'center', gap: 0, marginTop: 8 },
  workflowStep: { display: 'flex', alignItems: 'center' },
  workflowStepIcon: {
    width: 22, height: 22, borderRadius: '50%', display: 'flex',
    alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600,
  },
  workflowStepLabel: { fontSize: 10, color: '#64748b', marginTop: 2, textAlign: 'center' as const },
  workflowLine: { flex: 1, height: 2, marginTop: -10 },
  // 患者详情卡片
  patientCard: { marginBottom: 16 },
  patientName: { fontSize: 22, fontWeight: 700, color: '#1a3a5c', marginBottom: 4 },
  patientId: { fontSize: 13, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 },
  patientTags: { display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' as const },
  tag: {
    display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px',
    borderRadius: 20, fontSize: 12, fontWeight: 500,
  },
  infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 },
  infoItem: { display: 'flex', flexDirection: 'column' as const, gap: 2 },
  infoLabel: { fontSize: 11, color: '#94a3b8', textTransform: 'uppercase' as const },
  infoValue: { fontSize: 14, color: '#1a3a5c', fontWeight: 500 },
  // 检查信息
  examTypeSection: { marginBottom: 20 },
  sectionTitle: { fontSize: 13, fontWeight: 600, color: '#1a3a5c', marginBottom: 10, textTransform: 'uppercase' as const },
  workflowDisplay: { display: 'flex', flexDirection: 'column' as const, gap: 6 },
  workflowRow: { display: 'flex', alignItems: 'center', gap: 8 },
  workflowDot: { width: 10, height: 10, borderRadius: '50%', flexShrink: 0 },
  workflowText: { fontSize: 13, color: '#1a3a5c' },
  actionBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px',
    borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13,
    fontWeight: 500, minHeight: 38,
  },
  actionBtnOutline: {
    display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px',
    borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff',
    cursor: 'pointer', fontSize: 13, fontWeight: 500, minHeight: 38, color: '#64748b',
  },
  batchBar: {
    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px',
    background: '#f8fafc', borderRadius: 8, marginBottom: 10,
  },
  checkbox: { cursor: 'pointer', color: '#3b82f6' },
  emptyState: {
    display: 'flex', flexDirection: 'column' as const, alignItems: 'center',
    justifyContent: 'center', height: '100%', color: '#94a3b8', gap: 8,
  },
  statRow: { display: 'flex', gap: 8, flexWrap: 'wrap' as const },
  statChip: {
    padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500,
    cursor: 'pointer', border: '1px solid #e2e8f0', background: '#fff',
    display: 'flex', alignItems: 'center', gap: 4,
  },
  statChipActive: {
    background: '#1a3a5c', color: '#fff', border: '1px solid #1a3a5c',
  },
  panelTitle: { fontSize: 14, fontWeight: 600, color: '#1a3a5c', margin: 0 },
  badge: {
    display: 'inline-flex', padding: '2px 8px', borderRadius: 20,
    fontSize: 11, fontWeight: 500,
  },
}

// ============ 颜色映射 ============
const priorityColors: Record<string, string> = {
  'STAT': '#ef4444', 'Urgent': '#f97316', 'Normal': '#3b82f6', 'Low': '#94a3b8',
}

const statusColors: Record<string, { bg: string; color: string; label: string }> = {
  'Pending': { bg: '#fff7ed', color: '#f97316', label: '待检查' },
  'In Progress': { bg: '#eff6ff', color: '#3b82f6', label: '检查中' },
  'Completed': { bg: '#f0fdf4', color: '#22c55e', label: '已完成' },
  'Archived': { bg: '#f8fafc', color: '#64748b', label: '已归档' },
}

const examTypeIcons: Record<string, React.ReactNode> = {
  '腹部': <Stethoscope size={14} />,
  '心脏': <Heart size={14} />,
  '妇产': <Baby size={14} />,
  '浅表': <Scan size={14} />,
  '血管': <Activity size={14} />,
  '介入': <Radio size={14} />,
}

// ============ 组件 ============
function WorkflowBar({ workflow }: { workflow: Record<string, boolean> }) {
  return (
    <div style={s.workflowBar}>
      {workflowSteps.map((step, i) => {
        const done = workflow[step.key]
        const isLast = i === workflowSteps.length - 1
        return (
          <div key={step.key} style={{ display: 'flex', alignItems: 'center', flex: isLast ? 0 : 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                ...s.workflowStepIcon,
                background: done ? '#22c55e' : '#f1f5f9',
                color: done ? '#fff' : '#94a3b8',
              }}>
                {done ? '✓' : i + 1}
              </div>
              <div style={s.workflowStepLabel}>{step.label}</div>
            </div>
            {!isLast && (
              <div style={{
                ...s.workflowLine,
                background: workflow[workflowSteps[i + 1].key] ? '#22c55e' : '#e2e8f0',
                marginLeft: 2, marginRight: 2,
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function PatientDetailPanel({ item }: { item: typeof mockWorklist[0] | null }) {
  if (!item) {
    return (
      <div style={s.emptyState}>
        <User size={40} />
        <span style={{ fontSize: 14 }}>选择检查项查看患者详情</span>
      </div>
    )
  }

  const genderColor = item.gender === '男' ? '#3b82f6' : '#ec4899'
  const priorityColor = priorityColors[item.priority] || '#94a3b8'
  const sc = statusColors[item.status] || statusColors['Pending']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={s.middlePanelHeader}>
        <div style={s.patientName}>{item.patientName}</div>
        <div style={s.patientId}>
          <CreditCard size={12} />
          {item.patientId}
        </div>
        <div style={s.patientTags}>
          <span style={{ ...s.tag, background: `${genderColor}15`, color: genderColor }}>
            {item.gender}
          </span>
          <span style={{ ...s.tag, background: `${genderColor}15`, color: genderColor }}>
            {item.age}岁
          </span>
          <span style={{ ...s.tag, background: `${priorityColor}15`, color: priorityColor }}>
            {item.priority === 'STAT' ? '🔴 STAT' : item.priority === 'Urgent' ? '🟠 Urgent' : item.priority}
          </span>
          <span style={{ ...s.badge, background: sc.bg, color: sc.color }}>
            {sc.label}
          </span>
        </div>
      </div>
      <div style={s.middlePanelBody}>
        <div style={s.infoGrid}>
          <div style={s.infoItem}>
            <span style={s.infoLabel}>联系电话</span>
            <span style={s.infoValue}>{item.phone}</span>
          </div>
          <div style={s.infoItem}>
            <span style={s.infoLabel}>预约时间</span>
            <span style={s.infoValue}>{item.appointmentTime}</span>
          </div>
          <div style={s.infoItem}>
            <span style={s.infoLabel}>检查医生</span>
            <span style={s.infoValue}>{item.doctor}</span>
          </div>
          <div style={s.infoItem}>
            <span style={s.infoLabel}>检查设备</span>
            <span style={s.infoValue}>{item.device}</span>
          </div>
          <div style={s.infoItem}>
            <span style={s.infoLabel}>检查费用</span>
            <span style={s.infoValue}>¥{item.fee}</span>
          </div>
          <div style={s.infoItem}>
            <span style={s.infoLabel}>检查类型</span>
            <span style={s.infoValue}>{item.examType} - {item.examSubtype}</span>
          </div>
        </div>

        {item.note && (
          <div style={{ marginTop: 16, padding: 12, background: '#f8fafc', borderRadius: 8, borderLeft: '3px solid #3b82f6' }}>
            <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4, textTransform: 'uppercase' }}>备注</div>
            <div style={{ fontSize: 13, color: '#1a3a5c' }}>{item.note}</div>
          </div>
        )}

        <div style={{ marginTop: 20 }}>
          <div style={s.sectionTitle}>工作流程</div>
          <WorkflowBar workflow={item.workflow} />
        </div>

        <div style={{ marginTop: 20, display: 'flex', gap: 8 }}>
          {item.status === 'Pending' && (
            <button style={{ ...s.actionBtn, background: '#3b82f6', color: '#fff' }}>
              <Play size={14} /> 开始检查
            </button>
          )}
          {item.status === 'In Progress' && (
            <button style={{ ...s.actionBtn, background: '#22c55e', color: '#fff' }}>
              <CheckCircle size={14} /> 完成检查
            </button>
          )}
          <button style={{ ...s.actionBtnOutline }}>
            <Printer size={14} /> 打印申请单
          </button>
        </div>
      </div>
    </div>
  )
}

function ExamInfoPanel({ item, onBatchAction }: {
  item: typeof mockWorklist[0] | null
  onBatchAction: (action: string) => void
}) {
  if (!item) {
    return (
      <div style={s.emptyState}>
        <Info size={40} />
        <span style={{ fontSize: 14 }}>选择检查项查看检查信息</span>
      </div>
    )
  }

  const typeColor = '#3b82f6'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={s.rightPanelHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8, background: `${typeColor}15`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: typeColor
          }}>
            {examTypeIcons[item.examType] || <Stethoscope size={14} />}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1a3a5c' }}>{item.examType}超声</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>{item.examSubtype}</div>
          </div>
        </div>
      </div>
      <div style={s.rightPanelBody}>
        <div style={s.examTypeSection}>
          <div style={s.sectionTitle}>检查信息</div>
          <div style={s.workflowDisplay}>
            {[
              { label: '检查ID', value: item.id },
              { label: '检查类型', value: `${item.examType} - ${item.examSubtype}` },
              { label: '分配设备', value: item.device },
              { label: '执行医生', value: item.doctor },
              { label: '预约时段', value: item.appointmentTime },
              { label: '检查费用', value: `¥${item.fee}` },
            ].map(row => (
              <div key={row.label} style={s.workflowRow}>
                <span style={{ fontSize: 12, color: '#94a3b8', width: 70 }}>{row.label}</span>
                <span style={s.workflowText}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={s.examTypeSection}>
          <div style={s.sectionTitle}>快捷操作</div>
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
            <button style={{ ...s.actionBtn, background: '#f8fafc', color: '#1a3a5c', justifyContent: 'flex-start' }}
              onClick={() => onBatchAction('print')}>
              <Printer size={14} /> 打印检查单
            </button>
            <button style={{ ...s.actionBtn, background: '#f8fafc', color: '#1a3a5c', justifyContent: 'flex-start' }}
              onClick={() => onBatchAction('report')}>
              <FileText size={14} /> 书写报告
            </button>
            <button style={{ ...s.actionBtn, background: '#f8fafc', color: '#1a3a5c', justifyContent: 'flex-start' }}
              onClick={() => onBatchAction('view')}>
              <Layers size={14} /> 查看影像
            </button>
            {item.status !== 'Archived' && (
              <button style={{ ...s.actionBtn, background: '#f8fafc', color: '#1a3a5c', justifyContent: 'flex-start' }}
                onClick={() => onBatchAction('archive')}>
                <Archive size={14} /> 归档检查
              </button>
            )}
          </div>
        </div>

        <div style={{ marginTop: 'auto', paddingTop: 16 }}>
          <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>
            双击检查项进入执行页面
          </div>
        </div>
      </div>
    </div>
  )
}

export default function WorklistPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('全部')
  const [typeFilter, setTypeFilter] = useState('全部')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [selectMode, setSelectMode] = useState(false)

  const statusOptions = ['全部', '待检查', '检查中', '已完成', '已归档']
  const statusMap: Record<string, string> = {
    '全部': '', '待检查': 'Pending', '检查中': 'In Progress', '已完成': 'Completed', '已归档': 'Archived'
  }

  const filtered = mockWorklist.filter(w => {
    const matchSearch = !search ||
      w.patientName.includes(search) ||
      w.patientId.includes(search) ||
      w.examType.includes(search) ||
      w.examSubtype.includes(search)
    const matchStatus = !statusFilter || statusFilter === '全部' || w.status === statusMap[statusFilter]
    const matchType = !typeFilter || typeFilter === '全部' || w.examType === typeFilter
    return matchSearch && matchStatus && matchType
  })

  const selected = mockWorklist.find(w => w.id === selectedId) || null

  const handleItemClick = useCallback((id: string) => {
    if (selectMode) {
      setSelectedIds(prev => {
        const next = new Set(prev)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        return next
      })
    } else {
      setSelectedId(id)
    }
  }, [selectMode])

  const handleItemDoubleClick = useCallback((id: string) => {
    const item = mockWorklist.find(w => w.id === id)
    if (item) {
      alert(`进入检查执行页面: ${item.examType} - ${item.examSubtype}\n患者: ${item.patientName}`)
    }
  }, [])

  const handleBatchAction = useCallback((action: string) => {
    if (selectedIds.size === 0) return
    const ids = Array.from(selectedIds).join(', ')
    if (action === 'print') {
      alert(`批量打印: ${ids}`)
    } else if (action === 'archive') {
      alert(`批量归档: ${ids}`)
    }
    setSelectedIds(new Set())
    setSelectMode(false)
  }, [selectedIds])

  const toggleSelectMode = () => {
    setSelectMode(prev => !prev)
    if (selectMode) setSelectedIds(new Set())
  }

  const stats = {
    total: mockWorklist.length,
    pending: mockWorklist.filter(w => w.status === 'Pending').length,
    inProgress: mockWorklist.filter(w => w.status === 'In Progress').length,
    completed: mockWorklist.filter(w => w.status === 'Completed').length,
    archived: mockWorklist.filter(w => w.status === 'Archived').length,
  }

  return (
    <div style={s.root}>
      <div style={s.header}>
        <h1 style={s.title}>
          工作列表
          <span style={s.version}>v0.2.0</span>
        </h1>
        <div style={s.headerActions}>
          <button style={{ ...s.actionBtn, background: '#f8fafc', color: '#64748b' }}>
            <RefreshCw size={14} /> 刷新
          </button>
        </div>
      </div>

      <div style={s.threePanel}>
        {/* 左侧: 检查列表 */}
        <div style={s.leftPanel}>
          <div style={s.leftPanelHeader}>
            <div style={s.filterRow}>
              <Search size={13} color="#64748b" />
              <input
                style={s.searchInput}
                placeholder="搜索患者/检查..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {statusOptions.map(opt => (
                <button
                  key={opt}
                  style={{
                    ...s.filterChip,
                    ...(statusFilter === opt ? s.filterChipActive : {}),
                  }}
                  onClick={() => setStatusFilter(opt)}
                >
                  {opt}
                  {opt === '全部' && ` (${stats.total})`}
                  {opt === '待检查' && ` (${stats.pending})`}
                  {opt === '检查中' && ` (${stats.inProgress})`}
                  {opt === '已完成' && ` (${stats.completed})`}
                  {opt === '已归档' && ` (${stats.archived})`}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button
                style={{
                  ...s.filterChip,
                  ...(typeFilter === '全部' ? s.filterChipActive : {}),
                }}
                onClick={() => setTypeFilter('全部')}
              >
                全部
              </button>
              {examTypes.map(t => (
                <button
                  key={t}
                  style={{
                    ...s.filterChip,
                    ...(typeFilter === t ? s.filterChipActive : {}),
                  }}
                  onClick={() => setTypeFilter(t)}
                >
                  {examTypeIcons[t]}
                  <span style={{ marginLeft: 4 }}>{t}</span>
                </button>
              ))}
            </div>
          </div>

          {selectedIds.size > 0 && (
            <div style={s.batchBar}>
              <span style={{ fontSize: 12, color: '#64748b', flex: 1 }}>
                已选 {selectedIds.size} 项
              </span>
              <button style={{ ...s.actionBtn, padding: '4px 10px', background: '#3b82f6', color: '#fff', fontSize: 12 }}
                onClick={() => handleBatchAction('print')}>
                <Printer size={12} /> 批量打印
              </button>
              <button style={{ ...s.actionBtn, padding: '4px 10px', background: '#64748b', color: '#fff', fontSize: 12 }}
                onClick={() => handleBatchAction('archive')}>
                <Archive size={12} /> 批量归档
              </button>
              <button style={{ ...s.actionBtn, padding: '4px 8px', background: '#f8fafc', color: '#64748b', fontSize: 12 }}
                onClick={toggleSelectMode}>
                <X size={12} />
              </button>
            </div>
          )}

          <div style={s.leftPanelBody}>
            {filtered.length === 0 ? (
              <div style={s.emptyState}>
                <Search size={30} />
                <span style={{ fontSize: 13 }}>无匹配检查</span>
              </div>
            ) : filtered.map(w => {
              const sc = statusColors[w.status] || statusColors['Pending']
              const isSelected = selectedId === w.id
              const isChecked = selectedIds.has(w.id)
              return (
                <div
                  key={w.id}
                  style={{
                    ...s.examItem,
                    ...(isSelected ? s.examItemSelected : {}),
                  }}
                  onClick={() => handleItemClick(w.id)}
                  onDoubleClick={() => handleItemDoubleClick(w.id)}
                >
                  <div style={s.examItemTop}>
                    {selectMode && (
                      <span style={s.checkbox}>
                        {isChecked ? <CheckSquare size={16} /> : <Square size={16} />}
                      </span>
                    )}
                    <div style={{ ...s.priorityDot, background: priorityColors[w.priority] || '#94a3b8' }} />
                    <span style={s.examItemName}>{w.patientName}</span>
                    <span style={{ ...s.badge, background: sc.bg, color: sc.color, fontSize: 10 }}>
                      {sc.label}
                    </span>
                    <ChevronRight size={14} color="#94a3b8" />
                  </div>
                  <div style={s.examItemMeta}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      {examTypeIcons[w.examType]}
                      {w.examType} - {w.examSubtype}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Clock size={11} /> {w.appointmentTime}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <User size={11} /> {w.doctor}
                    </span>
                  </div>
                  <WorkflowBar workflow={w.workflow} />
                </div>
              )
            })}
          </div>
        </div>

        {/* 中间: 患者详情 */}
        <div style={s.middlePanel}>
          <PatientDetailPanel item={selected} />
        </div>

        {/* 右侧: 检查信息 */}
        <div style={s.rightPanel}>
          <ExamInfoPanel item={selected} onBatchAction={handleBatchAction} />
        </div>
      </div>
    </div>
  )
}
