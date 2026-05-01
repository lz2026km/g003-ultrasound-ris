// @ts-nocheck
// ============================================================
// G004 超声管理系统 - 危急值管理页面
// 危急值：检查中发现的可疑恶性肿瘤等需立即通知患者的指标
// ============================================================
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react'
import {
  AlertTriangle, Phone, CheckCircle, XCircle, Clock,
  Search, Plus, Eye, Bell, User, FileText, ChevronDown, ChevronUp
} from 'lucide-react'
import { initialCriticalValues } from '../data/initialData'
import type { CriticalValue } from '../types'

// ---------- 样式 ----------
const s: Record<string, React.CSSProperties> = {
  root: { padding: 0 },
  header: { marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontSize: 20, fontWeight: 700, color: '#1a3a5c', margin: 0 },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 4 },
  // 统计行
  statRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    background: '#fff',
    borderRadius: 12,
    padding: '18px 20px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  statIconWrap: {
    width: 44, height: 44, borderRadius: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  statInfo: { flex: 1, minWidth: 0 },
  statValue: { fontSize: 22, fontWeight: 700, color: '#1a3a5c', lineHeight: 1.2 },
  statLabel: { fontSize: 11, color: '#64748b', marginTop: 2 },
  // 操作行
  actionRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: '#fff',
    borderRadius: 8,
    padding: '8px 12px',
    border: '1px solid #e2e8f0',
    width: 280,
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    fontSize: 13,
    color: '#334155',
    flex: 1,
    background: 'transparent',
  },
  addBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '8px 16px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  // 卡片列表
  cardList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  card: {
    background: '#fff',
    borderRadius: 12,
    padding: '20px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    borderLeft: '4px solid',
    cursor: 'pointer',
    transition: 'box-shadow 0.2s',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardPatient: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  patientAvatar: {
    width: 40, height: 40, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 16, fontWeight: 700, color: '#fff',
  },
  patientInfo: {},
  patientName: { fontSize: 15, fontWeight: 700, color: '#1a3a5c' },
  patientMeta: { fontSize: 12, color: '#64748b', marginTop: 2 },
  cardTags: { display: 'flex', gap: 6, flexWrap: 'wrap' as const },
  cardBody: { marginBottom: 12 },
  cardContent: { fontSize: 13, color: '#334155', lineHeight: 1.6, marginBottom: 10 },
  cardDetail: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 8,
    fontSize: 12,
    color: '#64748b',
  },
  detailItem: { display: 'flex', alignItems: 'center', gap: 4 },
  detailIcon: { color: '#94a3b8' },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTop: '1px solid #f1f5f9',
  },
  footerLeft: { display: 'flex', gap: 12, fontSize: 12, color: '#64748b' },
  footerRight: { display: 'flex', gap: 8 },
  actionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    padding: '5px 10px',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 500,
    cursor: 'pointer',
    border: 'none',
  },
  // 标签
  tag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '3px 8px',
    borderRadius: 12,
    fontSize: 11,
    fontWeight: 500,
  },
  // 弹窗
  modalOverlay: {
    position: 'fixed' as const,
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: '#fff',
    borderRadius: 16,
    padding: 28,
    width: 560,
    maxHeight: '80vh',
    overflowY: 'auto' as const,
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  },
  modalTitle: { fontSize: 18, fontWeight: 700, color: '#1a3a5c', marginBottom: 20 },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
    marginBottom: 16,
  },
  formGroup: { marginBottom: 14 },
  label: { display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6 },
  input: {
    width: '100%',
    padding: '9px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    fontSize: 13,
    color: '#334155',
    outline: 'none',
    boxSizing: 'border-box' as const,
  },
  select: {
    width: '100%',
    padding: '9px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    fontSize: 13,
    color: '#334155',
    outline: 'none',
    background: '#fff',
    boxSizing: 'border-box' as const,
  },
  textarea: {
    width: '100%',
    padding: '9px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    fontSize: 13,
    color: '#334155',
    outline: 'none',
    resize: 'vertical' as const,
    minHeight: 80,
    fontFamily: 'inherit',
    boxSizing: 'border-box' as const,
  },
  fullWidth: { gridColumn: '1 / -1' },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 20,
    paddingTop: 16,
    borderTop: '1px solid #f1f5f9',
  },
  cancelBtn: {
    padding: '9px 18px',
    borderRadius: 8,
    border: '1px solid #e2e8f0',
    background: '#fff',
    fontSize: 13,
    color: '#64748b',
    cursor: 'pointer',
  },
  saveBtn: {
    padding: '9px 18px',
    borderRadius: 8,
    border: 'none',
    background: '#ef4444',
    fontSize: 13,
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
  },
  // 颜色
  red: { backgroundColor: '#fef2f2', color: '#ef4444', borderColor: '#fecaca' },
  orange: { backgroundColor: '#fff7ed', color: '#f97316', borderColor: '#fed7aa' },
  green: { backgroundColor: '#f0fdf4', color: '#22c55e', borderColor: '#bbf7d0' },
  blue: { backgroundColor: '#eff6ff', color: '#3b82f6', borderColor: '#bfdbfe' },
  purple: { backgroundColor: '#f5f3ff', color: '#8b5cf6', borderColor: '#ddd6fe' },
  gray: { backgroundColor: '#f8fafc', color: '#64748b', borderColor: '#e2e8f0' },
}

// ---------- 颜色常量 ----------
const TYPE_COLORS: Record<string, typeof s.red> = {
  '可疑恶性肿瘤': s.red,
  '消化道出血': s.orange,
  '严重感染': s.purple,
  '其他危急值': s.blue,
}

const STATUS_COLORS = {
  handled: s.green,
  pending: s.orange,
}

// ============ CriticalValuePage 组件 ============
export default function CriticalValuePage() {
  const [criticalValues, setCriticalValues] = useState<CriticalValue[]>(initialCriticalValues)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'handled' | 'pending'>('all')
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<'add' | 'view' | 'report'>('add')
  const [selectedCV, setSelectedCV] = useState<CriticalValue | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // 表单状态
  const [formData, setFormData] = useState({
    patientName: '',
    examItemName: '',
    criticalValueType: '可疑恶性肿瘤',
    criticalValueContent: '',
    reportMethod: '电话' as '电话' | '口头' | '书面',
    patientResponse: '',
    notes: '',
  })

  // 统计
  const total = criticalValues.length
  const handled = criticalValues.filter(cv => cv.handled).length
  const pending = total - handled
  const todayNew = criticalValues.filter(cv => {
    const d = cv.detectedTime?.slice(0, 10)
    return d === new Date().toISOString().slice(0, 10)
  }).length

  // 过滤
  const filtered = criticalValues.filter(cv => {
    const matchSearch = !searchKeyword ||
      cv.patientName.includes(searchKeyword) ||
      cv.criticalValueContent.includes(searchKeyword) ||
      cv.examItemName.includes(searchKeyword)
    const matchStatus = filterStatus === 'all' ||
      (filterStatus === 'handled' && cv.handled) ||
      (filterStatus === 'pending' && !cv.handled)
    return matchSearch && matchStatus
  })

  // 打开弹窗
  const openAddModal = () => {
    setModalType('add')
    setFormData({
      patientName: '',
      examItemName: '',
      criticalValueType: '可疑恶性肿瘤',
      criticalValueContent: '',
      reportMethod: '电话',
      patientResponse: '',
      notes: '',
    })
    setShowModal(true)
  }

  const openViewModal = (cv: CriticalValue) => {
    setSelectedCV(cv)
    setModalType('view')
    setShowModal(true)
  }

  const openReportModal = (cv: CriticalValue) => {
    setSelectedCV(cv)
    setModalType('report')
    setFormData({
      patientName: cv.patientName,
      examItemName: cv.examItemName,
      criticalValueType: cv.criticalValueType,
      criticalValueContent: cv.criticalValueContent,
      reportMethod: cv.reportMethod || '电话',
      patientResponse: cv.patientResponse || '',
      notes: cv.notes || '',
    })
    setShowModal(true)
  }

  // 保存
  const handleSave = () => {
    if (modalType === 'add') {
      const now = new Date().toISOString().slice(0, 16).replace('T', ' ')
      const newCV: CriticalValue = {
        id: `CV${String(criticalValues.length + 1).padStart(3, '0')}`,
        examId: '',
        patientId: '',
        patientName: formData.patientName,
        examItemName: formData.examItemName,
        criticalValueType: formData.criticalValueType,
        criticalValueContent: formData.criticalValueContent,
        detectedDoctorId: 'U001',
        detectedDoctorName: '张建国',
        detectedTime: now,
        reportMethod: formData.reportMethod,
        patientResponse: formData.patientResponse,
        handled: false,
        notes: formData.notes,
      }
      setCriticalValues([newCV, ...criticalValues])
    } else if (modalType === 'report' && selectedCV) {
      setCriticalValues(criticalValues.map(cv =>
        cv.id === selectedCV.id
          ? {
              ...cv,
              reportMethod: formData.reportMethod,
              patientResponse: formData.patientResponse,
              reportedDoctorId: 'U001',
              reportedDoctorName: '张建国',
              reportedTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
              handled: true,
              handledTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
              notes: formData.notes,
            }
          : cv
      ))
    }
    setShowModal(false)
  }

  // 标记已处理
  const markHandled = (cv: CriticalValue) => {
    setCriticalValues(criticalValues.map(c =>
      c.id === cv.id
        ? { ...c, handled: true, handledTime: new Date().toISOString().slice(0, 16).replace('T', ' ') }
        : c
    ))
  }

  const getAvatarColor = (name: string) => {
    const colors = [s.red.color, s.orange.color, s.blue.color, s.purple.color, s.green.color]
    const idx = name.charCodeAt(0) % colors.length
    return colors[idx]
  }

  return (
    <div style={s.root}>
      {/* 标题 */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>危急值管理</h1>
          <p style={s.subtitle}>检查中发现的可疑恶性肿瘤等需立即通知患者或家属的指标</p>
        </div>
      </div>

      {/* 统计卡片 */}
      <div style={s.statRow}>
        <StatCard
          icon={AlertTriangle}
          iconBg={s.red.backgroundColor as string}
          iconColor={s.red.color as string}
          value={total}
          unit="例"
          label="危急值总数"
        />
        <StatCard
          icon={Bell}
          iconBg={s.orange.backgroundColor as string}
          iconColor={s.orange.color as string}
          value={pending}
          unit="例"
          label="待处理"
        />
        <StatCard
          icon={CheckCircle}
          iconBg={s.green.backgroundColor as string}
          iconColor={s.green.color as string}
          value={handled}
          unit="例"
          label="已处理"
        />
        <StatCard
          icon={Clock}
          iconBg={s.blue.backgroundColor as string}
          iconColor={s.blue.color as string}
          value={todayNew}
          unit="例"
          label="今日新增"
        />
      </div>

      {/* 操作行 */}
      <div style={s.actionRow}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={s.searchBox}>
            <Search size={15} color="#94a3b8" />
            <input
              style={s.searchInput}
              placeholder="搜索患者姓名、检查项目..."
              value={searchKeyword}
              onChange={e => setSearchKeyword(e.target.value)}
            />
          </div>
          <FilterTabs value={filterStatus} onChange={setFilterStatus} />
        </div>
        <button style={s.addBtn} onClick={openAddModal}>
          <Plus size={15} /> 登记危急值
        </button>
      </div>

      {/* 卡片列表 */}
      <div style={s.cardList}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
            <div style={{ marginBottom: 16 }}>
              <AlertTriangle size={48} color="#d1d5db" strokeWidth={1.5} />
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>暂无危急值记录</div>
            <div style={{ fontSize: 13, color: '#94a3b8' }}>当前没有需要处理的危急值信息</div>
            <div style={{ marginTop: 20 }}>
              <button style={{ ...s.addBtn, minHeight: 44, padding: '10px 24px', fontSize: 14 }} onClick={openAddModal}>
                <Plus size={16} /> 登记危急值
              </button>
            </div>
          </div>
        ) : (
          filtered.map(cv => (
            <CriticalValueCard
              key={cv.id}
              cv={cv}
              isExpanded={expandedId === cv.id}
              onToggle={() => setExpandedId(expandedId === cv.id ? null : cv.id)}
              onView={() => openViewModal(cv)}
              onReport={() => openReportModal(cv)}
              onMarkHandled={() => markHandled(cv)}
              getAvatarColor={getAvatarColor}
            />
          ))
        )}
      </div>

      {/* 弹窗 */}
      {showModal && (
        <div style={s.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            {modalType === 'add' && (
              <>
                <h2 style={s.modalTitle}>登记危急值</h2>
                <div style={s.formGrid}>
                  <div style={s.formGroup}>
                    <label style={s.label}>患者姓名 *</label>
                    <input
                      style={s.input}
                      value={formData.patientName}
                      onChange={e => setFormData({ ...formData, patientName: e.target.value })}
                      placeholder="请输入患者姓名"
                    />
                  </div>
                  <div style={s.formGroup}>
                    <label style={s.label}>检查项目 *</label>
                    <input
                      style={s.input}
                      value={formData.examItemName}
                      onChange={e => setFormData({ ...formData, examItemName: e.target.value })}
                      placeholder="如：电子超声检查"
                    />
                  </div>
                  <div style={s.formGroup}>
                    <label style={s.label}>危急值类型 *</label>
                    <select
                      style={s.select}
                      value={formData.criticalValueType}
                      onChange={e => setFormData({ ...formData, criticalValueType: e.target.value })}
                    >
                      <option value="可疑恶性肿瘤">可疑恶性肿瘤</option>
                      <option value="消化道出血">消化道出血</option>
                      <option value="严重感染">严重感染</option>
                      <option value="其他危急值">其他危急值</option>
                    </select>
                  </div>
                  <div style={s.formGroup}>
                    <label style={s.label}>报告方式</label>
                    <select
                      style={s.select}
                      value={formData.reportMethod}
                      onChange={e => setFormData({ ...formData, reportMethod: e.target.value as '电话' | '口头' | '书面' })}
                    >
                      <option value="电话">电话</option>
                      <option value="口头">口头</option>
                      <option value="书面">书面</option>
                    </select>
                  </div>
                  <div style={{ ...s.formGroup, ...s.fullWidth }}>
                    <label style={s.label}>危急值内容 *</label>
                    <textarea
                      style={s.textarea}
                      value={formData.criticalValueContent}
                      onChange={e => setFormData({ ...formData, criticalValueContent: e.target.value })}
                      placeholder="请详细描述发现的可疑病灶或异常情况..."
                    />
                  </div>
                  <div style={{ ...s.formGroup, ...s.fullWidth }}>
                    <label style={s.label}>患者/家属反馈</label>
                    <input
                      style={s.input}
                      value={formData.patientResponse}
                      onChange={e => setFormData({ ...formData, patientResponse: e.target.value })}
                      placeholder="患者或家属接到通知后的反馈"
                    />
                  </div>
                  <div style={{ ...s.formGroup, ...s.fullWidth }}>
                    <label style={s.label}>备注</label>
                    <textarea
                      style={s.textarea}
                      value={formData.notes}
                      onChange={e => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="其他补充说明..."
                    />
                  </div>
                </div>
              </>
            )}

            {modalType === 'view' && selectedCV && (
              <>
                <h2 style={s.modalTitle}>危急值详情</h2>
                <div style={s.formGrid}>
                  <div style={s.formGroup}>
                    <label style={s.label}>患者姓名</label>
                    <div style={{ fontSize: 14, color: '#334155', padding: '9px 0' }}>{selectedCV.patientName}</div>
                  </div>
                  <div style={s.formGroup}>
                    <label style={s.label}>检查项目</label>
                    <div style={{ fontSize: 14, color: '#334155', padding: '9px 0' }}>{selectedCV.examItemName}</div>
                  </div>
                  <div style={s.formGroup}>
                    <label style={s.label}>危急值类型</label>
                    <div style={{ fontSize: 14, color: '#334155', padding: '9px 0' }}>{selectedCV.criticalValueType}</div>
                  </div>
                  <div style={s.formGroup}>
                    <label style={s.label}>发现时间</label>
                    <div style={{ fontSize: 14, color: '#334155', padding: '9px 0' }}>{selectedCV.detectedTime}</div>
                  </div>
                  <div style={{ ...s.formGroup, ...s.fullWidth }}>
                    <label style={s.label}>发现医生</label>
                    <div style={{ fontSize: 14, color: '#334155', padding: '9px 0' }}>{selectedCV.detectedDoctorName}</div>
                  </div>
                  <div style={{ ...s.formGroup, ...s.fullWidth }}>
                    <label style={s.label}>危急值内容</label>
                    <div style={{ fontSize: 14, color: '#334155', padding: '9px 0', lineHeight: 1.6 }}>{selectedCV.criticalValueContent}</div>
                  </div>
                  <div style={s.formGroup}>
                    <label style={s.label}>报告方式</label>
                    <div style={{ fontSize: 14, color: '#334155', padding: '9px 0' }}>{selectedCV.reportMethod}</div>
                  </div>
                  <div style={s.formGroup}>
                    <label style={s.label}>处理状态</label>
                    <div style={{ padding: '9px 0' }}>
                      {selectedCV.handled ? (
                        <span style={{ ...s.tag, background: s.green.backgroundColor, color: s.green.color }}>
                          <CheckCircle size={12} /> 已处理
                        </span>
                      ) : (
                        <span style={{ ...s.tag, background: s.orange.backgroundColor, color: s.orange.color }}>
                          <Clock size={12} /> 待处理
                        </span>
                      )}
                    </div>
                  </div>
                  {selectedCV.patientResponse && (
                    <div style={{ ...s.formGroup, ...s.fullWidth }}>
                      <label style={s.label}>患者反馈</label>
                      <div style={{ fontSize: 14, color: '#334155', padding: '9px 0' }}>{selectedCV.patientResponse}</div>
                    </div>
                  )}
                  {selectedCV.notes && (
                    <div style={{ ...s.formGroup, ...s.fullWidth }}>
                      <label style={s.label}>备注</label>
                      <div style={{ fontSize: 14, color: '#334155', padding: '9px 0' }}>{selectedCV.notes}</div>
                    </div>
                  )}
                </div>
              </>
            )}

            {modalType === 'report' && selectedCV && (
              <>
                <h2 style={s.modalTitle}>报告与处理</h2>
                <div style={{ marginBottom: 16, padding: '12px 16px', background: s.red.backgroundColor, borderRadius: 8, borderLeft: `4px solid ${s.red.color}` }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: s.red.color, marginBottom: 4 }}>
                    ⚠️ {selectedCV.patientName} - {selectedCV.criticalValueType}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{selectedCV.criticalValueContent}</div>
                </div>
                <div style={s.formGrid}>
                  <div style={s.formGroup}>
                    <label style={s.label}>报告方式 *</label>
                    <select
                      style={s.select}
                      value={formData.reportMethod}
                      onChange={e => setFormData({ ...formData, reportMethod: e.target.value as '电话' | '口头' | '书面' })}
                    >
                      <option value="电话">电话</option>
                      <option value="口头">口头</option>
                      <option value="书面">书面</option>
                    </select>
                  </div>
                  <div style={s.formGroup}>
                    <label style={s.label}>患者/家属反馈</label>
                    <input
                      style={s.input}
                      value={formData.patientResponse}
                      onChange={e => setFormData({ ...formData, patientResponse: e.target.value })}
                      placeholder="反馈说明"
                    />
                  </div>
                  <div style={{ ...s.formGroup, ...s.fullWidth }}>
                    <label style={s.label}>备注</label>
                    <textarea
                      style={s.textarea}
                      value={formData.notes}
                      onChange={e => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="处理情况说明..."
                    />
                  </div>
                </div>
              </>
            )}

            <div style={s.modalActions}>
              <button style={s.cancelBtn} onClick={() => setShowModal(false)}>取消</button>
              <button style={s.saveBtn} onClick={handleSave}>
                {modalType === 'add' ? '登记' : modalType === 'view' ? '关闭' : '确认报告并处理'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ---------- StatCard ----------
interface StatCardProps {
  icon: LucideIcon
  iconBg: React.CSSProperties['background']
  iconColor: string
  value: number | string
  unit: string
  label: string
}

function StatCard({ icon: Icon, iconBg, iconColor, value, unit, label }: StatCardProps) {
  return (
    <div style={s.statCard}>
      <div style={{ ...s.statIconWrap, background: iconBg }}>
        <Icon size={20} color={iconColor} />
      </div>
      <div style={s.statInfo}>
        <div style={s.statValue}>
          {value}<span style={{ fontSize: 13, color: '#64748b', fontWeight: 400 }}>{unit}</span>
        </div>
        <div style={s.statLabel}>{label}</div>
      </div>
    </div>
  )
}

// ---------- FilterTabs ----------
function FilterTabs({ value, onChange }: { value: string; onChange: (v: 'all' | 'handled' | 'pending') => void }) {
  const tabs = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '待处理' },
    { key: 'handled', label: '已处理' },
  ]
  return (
    <div style={{ display: 'flex', background: '#f8fafc', borderRadius: 8, padding: 3, gap: 2 }}>
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key as 'all' | 'handled' | 'pending')}
          style={{
            padding: '5px 12px',
            borderRadius: 6,
            border: 'none',
            fontSize: 12,
            fontWeight: 500,
            cursor: 'pointer',
            background: value === tab.key ? '#fff' : 'transparent',
            color: value === tab.key ? '#1a3a5c' : '#64748b',
            boxShadow: value === tab.key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            transition: 'all 0.2s',
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

// ---------- CriticalValueCard ----------
interface CriticalValueCardProps {
  cv: CriticalValue
  isExpanded: boolean
  onToggle: () => void
  onView: () => void
  onReport: () => void
  onMarkHandled: () => void
  getAvatarColor: (name: string) => string
}

function CriticalValueCard({ cv, isExpanded, onToggle, onView, onReport, onMarkHandled, getAvatarColor }: CriticalValueCardProps) {
  const typeColor = TYPE_COLORS[cv.criticalValueType] || s.blue
  const statusColor = cv.handled ? s.green : s.orange

  return (
    <div
      style={{
        ...s.card,
        borderLeftColor: typeColor.color,
      }}
    >
      {/* 卡片头部 */}
      <div style={s.cardHeader}>
        <div style={s.cardPatient}>
          <div style={{ ...s.patientAvatar, background: getAvatarColor(cv.patientName) }}>
            {cv.patientName.charAt(0)}
          </div>
          <div style={s.patientInfo}>
            <div style={s.patientName}>{cv.patientName}</div>
            <div style={s.patientMeta}>{cv.examItemName}</div>
          </div>
        </div>
        <div style={s.cardTags}>
          <span style={{ ...s.tag, background: typeColor.backgroundColor, color: typeColor.color }}>
            <AlertTriangle size={11} /> {cv.criticalValueType}
          </span>
          <span style={{ ...s.tag, background: statusColor.backgroundColor, color: statusColor.color }}>
            {cv.handled ? <CheckCircle size={11} /> : <Clock size={11} />}
            {cv.handled ? '已处理' : '待处理'}
          </span>
        </div>
      </div>

      {/* 卡片内容 */}
      <div style={s.cardBody}>
        <div style={s.cardContent}>{cv.criticalValueContent}</div>
        <div style={s.cardDetail}>
          <div style={s.detailItem}>
            <User size={12} style={s.detailIcon} />
            <span>发现医生：{cv.detectedDoctorName}</span>
          </div>
          <div style={s.detailItem}>
            <Clock size={12} style={s.detailIcon} />
            <span>发现时间：{cv.detectedTime}</span>
          </div>
          {cv.reportedDoctorName && (
            <div style={s.detailItem}>
              <Phone size={12} style={s.detailIcon} />
              <span>报告医生：{cv.reportedDoctorName}</span>
            </div>
          )}
          {cv.reportMethod && (
            <div style={s.detailItem}>
              <Phone size={12} style={s.detailIcon} />
              <span>报告方式：{cv.reportMethod}</span>
            </div>
          )}
          {cv.patientResponse && (
            <div style={{ ...s.detailItem, gridColumn: '1 / -1' }}>
              <FileText size={12} style={s.detailIcon} />
              <span>患者反馈：{cv.patientResponse}</span>
            </div>
          )}
        </div>
      </div>

      {/* 卡片底部 */}
      <div style={s.cardFooter}>
        <div style={s.footerLeft}>
          {cv.handled && cv.handledTime && (
            <span>处理时间：{cv.handledTime}</span>
          )}
        </div>
        <div style={s.footerRight}>
          <button
            style={{ ...s.actionBtn, background: '#f8fafc', color: '#64748b' }}
            onClick={e => { e.stopPropagation(); onView() }}
          >
            <Eye size={13} /> 详情
          </button>
          {!cv.handled && (
            <button
              style={{ ...s.actionBtn, background: s.orange.backgroundColor, color: s.orange.color }}
              onClick={e => { e.stopPropagation(); onReport() }}
            >
              <Phone size={13} /> 报告处理
            </button>
          )}
          {!cv.handled && (
            <button
              style={{ ...s.actionBtn, background: s.green.backgroundColor, color: s.green.color }}
              onClick={e => { e.stopPropagation(); onMarkHandled() }}
            >
              <CheckCircle size={13} /> 标记已处理
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
