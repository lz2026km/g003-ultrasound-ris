// @ts-nocheck
// ============================================================
// G003 超声RIS系统 - 患者管理页面 v0.2.0
// 患者列表卡片 · 详情面板 · 新增表单 · 统计图表
// ============================================================
import { useState, useEffect, useRef } from 'react'
import {
  Search, Plus, UserPlus, Download, X, ChevronRight,
  Calendar, Phone, IdCard, MapPin, AlertCircle,
  Clock, FileText, Image, Activity, Users,
  Stethoscope, User, Edit2, Trash2, Eye, EyeOff,
  BarChart3, PieChart as PieChartIcon
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { mockPatients, mockExams, mockReports } from '../data/initialData'

// ---------- 样式 ----------
const s: Record<string, React.CSSProperties> = {
  root: { padding: 0 },
  header: { marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 700, color: '#1a3a5c', margin: 0 },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 4 },
  headerRight: { display: 'flex', gap: 8 },
  // 操作按钮
  btn: { padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s' },
  btnPrimary: { background: '#3b82f6', color: '#fff' },
  btnOutline: { padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, background: '#fff', color: '#475569' },
  btnDanger: { padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, background: '#ef4444', color: '#fff' },
  // 筛选栏
  filterRow: { display: 'flex', gap: 12, alignItems: 'center', background: '#f8fafc', padding: '12px 16px', borderRadius: 10, marginBottom: 20, flexWrap: 'wrap' as const },
  searchInput: { flex: 1, minWidth: 200, padding: '8px 12px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 13, color: '#1a3a5c', background: '#fff', outline: 'none', minHeight: 40 },
  selectBtn: { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: 13, color: '#64748b', minHeight: 40 },
  // 主内容区：左侧列表 + 右侧详情
  mainContent: { display: 'grid', gridTemplateColumns: '1fr 420px', gap: 20, alignItems: 'start' },
  // 患者卡片列表
  cardList: { display: 'flex', flexDirection: 'column', gap: 12 },
  patientCard: {
    background: '#fff', borderRadius: 12, padding: '16px 20px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', cursor: 'pointer',
    transition: 'all 0.2s', border: '2px solid transparent',
    display: 'flex', alignItems: 'center', gap: 16,
  },
  patientCardHover: {
    boxShadow: '0 4px 12px rgba(59,130,246,0.15)',
    border: '2px solid #3b82f6',
  },
  patientCardActive: {
    border: '2px solid #1d4ed8',
    background: '#eff6ff',
  },
  avatar: {
    width: 52, height: 52, borderRadius: '50%', background: '#dbeafe',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 18, fontWeight: 700, color: '#1d4ed8', flexShrink: 0,
  },
  patientInfo: { flex: 1, minWidth: 0 },
  patientName: { fontSize: 15, fontWeight: 600, color: '#1a3a5c', display: 'flex', alignItems: 'center', gap: 8 },
  patientId: { fontSize: 12, color: '#3b82f6', fontFamily: 'monospace', marginTop: 2 },
  patientMeta: { display: 'flex', gap: 16, marginTop: 6, fontSize: 12, color: '#64748b' },
  examCount: { display: 'flex', alignItems: 'center', gap: 4 },
  patientTags: { display: 'flex', gap: 6, flexWrap: 'wrap' as const },
  // 搜索高亮
  highlight: { background: '#fef08a', padding: '0 2px', borderRadius: 2 },
  // 徽章
  badge: { display: 'inline-flex', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500 },
  // 详情面板
  detailPanel: {
    background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    position: 'sticky' as const, top: 20, maxHeight: 'calc(100vh - 60px)', overflow: 'auto',
  },
  detailHeader: { padding: '20px 20px 16px', borderBottom: '1px solid #f1f5f9' },
  detailTitle: { fontSize: 16, fontWeight: 700, color: '#1a3a5c', margin: 0 },
  detailSubtitle: { fontSize: 12, color: '#64748b', marginTop: 4 },
  detailBody: { padding: '16px 20px' },
  detailSection: { marginBottom: 20 },
  detailSectionTitle: { fontSize: 13, fontWeight: 600, color: '#1a3a5c', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 },
  detailEmpty: { textAlign: 'center', padding: '40px 20px', color: '#94a3b8', fontSize: 13 },
  // 详情信息网格
  infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  infoItem: { display: 'flex', flexDirection: 'column' as const, gap: 2 },
  infoLabel: { fontSize: 11, color: '#94a3b8', textTransform: 'uppercase' as const, letterSpacing: 0.5 },
  infoValue: { fontSize: 13, color: '#1a3a5c', fontWeight: 500 },
  // 时间轴
  timeline: { position: 'relative', paddingLeft: 20 },
  timelineLine: { position: 'absolute', left: 6, top: 0, bottom: 0, width: 2, background: '#e2e8f0' },
  timelineItem: { position: 'relative', marginBottom: 16, paddingLeft: 16 },
  timelineDot: { position: 'absolute', left: -17, top: 4, width: 10, height: 10, borderRadius: '50%', border: '2px solid #3b82f6', background: '#fff' },
  timelineDotComplete: { border: '2px solid #22c55e', background: '#22c55e' },
  timelineDotPending: { border: '2px solid #f97316', background: '#fff' },
  timelineDate: { fontSize: 11, color: '#94a3b8', marginBottom: 2 },
  timelineTitle: { fontSize: 13, color: '#1a3a5c', fontWeight: 500 },
  timelineMeta: { fontSize: 12, color: '#64748b', marginTop: 2 },
  // 列表项
  listItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9' },
  listItemLast: { borderBottom: 'none' },
  // 弹窗
  modal: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, backdropFilter: 'blur(4px)',
  },
  modalContent: {
    background: '#fff', borderRadius: 16, width: 560, maxHeight: '90vh',
    overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  modalHeader: { padding: '20px 24px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 16, fontWeight: 700, color: '#1a3a5c', margin: 0 },
  modalBody: { padding: '24px' },
  modalFooter: { padding: '16px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: 8 },
  // 表单
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  formGroup: { display: 'flex', flexDirection: 'column' as const, gap: 6, marginBottom: 0 },
  formGroupFull: { gridColumn: '1 / -1' },
  formLabel: { fontSize: 13, fontWeight: 500, color: '#475569' },
  formInput: { padding: '8px 12px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 13, color: '#1a3a5c', outline: 'none', minHeight: 38, transition: 'border-color 0.2s' },
  formSelect: { padding: '8px 12px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 13, color: '#1a3a5c', background: '#fff', outline: 'none', minHeight: 38 },
  formTextarea: { padding: '8px 12px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 13, color: '#1a3a5c', outline: 'none', resize: 'vertical' as const, minHeight: 80 },
  // 统计区域
  statsSection: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 },
  statCard: { background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  statTitle: { fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 },
  // 颜色
  blue: { background: '#eff6ff', color: '#3b82f6' },
  green: { background: '#f0fdf4', color: '#22c55e' },
  orange: { background: '#fff7ed', color: '#f97316' },
  purple: { background: '#f5f3ff', color: '#8b5cf6' },
  teal: { background: '#f0fdfa', color: '#14b8a6' },
  red: { background: '#fef2f2', color: '#ef4444' },
  gray: { background: '#f1f5f9', color: '#64748b' },
}

const C_COLORS = ['#3b82f6', '#22c55e', '#f97316', '#8b5cf6', '#14b8a6', '#ef4444']

// ---------- 类型 ----------
interface PatientFormData {
  name: string
  gender: string
  age: string
  idCard: string
  phone: string
  address: string
  patientType: string
  allergyHistory: string
  pastHistory: string
}

// ---------- 辅助函数 ----------
const highlightText = (text: string, search: string) => {
  if (!search.trim()) return text
  const parts = text.split(new RegExp(`(${search})`, 'gi'))
  return parts.map((part, i) =>
    part.toLowerCase() === search.toLowerCase()
      ? <span key={i} style={s.highlight}>{part}</span>
      : part
  )
}

const getPatientExams = (patientId: string) => mockExams.filter(e => e.patientId === patientId)
const getPatientReports = (patientId: string) => mockReports.filter(r => r.patientId === patientId)

const getTypeStyle = (type: string): React.CSSProperties => {
  if (type === '门诊') return s.blue
  if (type === '住院') return s.purple
  if (type === '体检') return s.green
  return s.gray
}

const getStatusStyle = (status: string): React.CSSProperties => {
  if (status === '已完成') return s.green
  if (status === '检查中') return s.blue
  if (status === '待检查') return s.orange
  if (status === '待撰写' || status === '待审核') return s.orange
  return s.gray
}

const getInitials = (name: string) => name.charAt(0)
const getAvatarColor = (name: string) => {
  const colors = ['#1d4ed8', '#0891b2', '#059669', '#d97706', '#dc2626', '#7c3aed']
  const idx = name.charCodeAt(0) % colors.length
  return colors[idx]
}

const AVATAR_BG: Record<string, string> = {
  '张三': '#dbeafe', '李红': '#fce7f3', '王五': '#fef3c7', '赵丽': '#dcfce7', '孙伟': '#e0e7ff',
}

// ---------- 主组件 ----------
export default function PatientPage() {
  const [search, setSearch] = useState('')
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'info' | 'exams' | 'reports' | 'images'>('info')
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null)
  const patients = mockPatients

  const [formData, setFormData] = useState<PatientFormData>({
    name: '', gender: '', age: '', idCard: '', phone: '', address: '',
    patientType: '门诊', allergyHistory: '', pastHistory: '',
  })

  const filtered = patients.filter(p =>
    p.name.includes(search) || p.id.includes(search) || p.phone.includes(search)
  )

  const selectedPatient = patients.find(p => p.id === selectedPatientId)
  const selectedExams = selectedPatient ? getPatientExams(selectedPatient.id) : []
  const selectedReports = selectedPatient ? getPatientReports(selectedPatient.id) : []

  // 统计计算
  const examCountData = patients.map(p => ({
    name: p.name,
    检查次数: getPatientExams(p.id).length,
  }))
  const examTypeData = [
    { name: '腹部超声', value: 2 },
    { name: '心血管超声', value: 2 },
    { name: '浅表器官', value: 1 },
  ]

  // 打开详情
  const openDetail = (id: string) => {
    setSelectedPatientId(id)
    setActiveTab('info')
  }

  // 关闭详情
  const closeDetail = () => {
    setSelectedPatientId(null)
  }

  // 提交表单
  const handleSubmit = () => {
    console.log('新增患者:', formData)
    setShowModal(false)
    setFormData({ name: '', gender: '', age: '', idCard: '', phone: '', address: '', patientType: '门诊', allergyHistory: '', pastHistory: '' })
  }

  return (
    <div style={s.root}>
      {/* 标题栏 */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>患者管理</h1>
          <p style={s.subtitle}>患者列表 · 详情查看 · 统计报表 · 新增建档</p>
        </div>
        <div style={s.headerRight}>
          <button style={s.btnOutline}><Download size={14} /> 导出</button>
          <button style={{ ...s.btn, ...s.btnPrimary }} onClick={() => setShowModal(true)}><UserPlus size={14} /> 新增患者</button>
        </div>
      </div>

      {/* 筛选栏 */}
      <div style={s.filterRow}>
        <Search size={14} color="#64748b" />
        <input
          style={s.searchInput}
          placeholder="搜索患者姓名/ID/电话..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select style={s.selectBtn} value={''} onChange={() => {}}>
          <option value="">全部类型</option>
          <option>门诊</option>
          <option>住院</option>
          <option>体检</option>
        </select>
        <select style={s.selectBtn} value={''} onChange={() => {}}>
          <option value="">全部性别</option>
          <option>男</option>
          <option>女</option>
        </select>
      </div>

      {/* 统计卡片 */}
      <div style={s.statsSection}>
        <div style={s.statCard}>
          <div style={s.statTitle}><BarChart3 size={14} /> 检查次数分布</div>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={examCountData} barSize={16}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="检查次数" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={s.statCard}>
          <div style={s.statTitle}><PieChartIcon size={14} /> 检查类型分布</div>
          <ResponsiveContainer width="100%" height={120}>
            <PieChart>
              <Pie data={examTypeData} cx="50%" cy="50%" innerRadius={24} outerRadius={48} dataKey="value" stroke="none">
                {examTypeData.map((_, i) => <Cell key={i} fill={C_COLORS[i % C_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 主内容区 */}
      <div style={s.mainContent}>
        {/* 左侧：患者卡片列表 */}
        <div style={s.cardList}>
          {filtered.length === 0 ? (
            <div style={{ ...s.detailEmpty, padding: 40 }}>
              <Users size={40} color="#d1d5db" style={{ marginBottom: 12 }} />
              <p>未找到匹配的患者</p>
            </div>
          ) : (
            filtered.map(p => {
              const exams = getPatientExams(p.id)
              const lastExam = exams[0]
              const isActive = selectedPatientId === p.id
              const isHover = hoveredCardId === p.id

              return (
                <div
                  key={p.id}
                  style={{
                    ...s.patientCard,
                    ...(isHover && !isActive ? s.patientCardHover : {}),
                    ...(isActive ? s.patientCardActive : {}),
                  }}
                  onClick={() => openDetail(p.id)}
                  onMouseEnter={() => setHoveredCardId(p.id)}
                  onMouseLeave={() => setHoveredCardId(null)}
                >
                  {/* 头像 */}
                  <div style={{ ...s.avatar, background: AVATAR_BG[p.name] || '#f1f5f9', color: getAvatarColor(p.name) }}>
                    {getInitials(p.name)}
                  </div>

                  {/* 患者信息 */}
                  <div style={s.patientInfo}>
                    <div style={s.patientName}>
                      {highlightText(p.name, search)}
                      <span style={{ ...s.badge, ...getTypeStyle(p.patientType) }}>{p.patientType}</span>
                    </div>
                    <div style={s.patientId}>ID: {highlightText(p.id, search)}</div>
                    <div style={s.patientMeta}>
                      <span>{p.gender} · {p.age}岁</span>
                      <span style={s.examCount}><Activity size={11} />检查 {exams.length} 次</span>
                      {lastExam && <span>最近: {lastExam.examDate}</span>}
                    </div>
                  </div>

                  {/* 联系方式 */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                    <div style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Phone size={11} /> {highlightText(p.phone, search)}
                    </div>
                    <ChevronRight size={16} color={isActive ? '#1d4ed8' : '#cbd5e1'} />
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* 右侧：患者详情面板 */}
        <div style={s.detailPanel}>
          {!selectedPatient ? (
            <div style={s.detailEmpty}>
              <User size={48} color="#d1d5db" style={{ marginBottom: 12 }} />
              <p>选择患者查看详情</p>
            </div>
          ) : (
            <>
              {/* 面板头部 */}
              <div style={s.detailHeader}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ ...s.avatar, width: 56, height: 56, fontSize: 22, background: AVATAR_BG[selectedPatient.name] || '#f1f5f9', color: getAvatarColor(selectedPatient.name) }}>
                      {getInitials(selectedPatient.name)}
                    </div>
                    <div>
                      <h2 style={s.detailTitle}>{selectedPatient.name}</h2>
                      <div style={s.detailSubtitle}>ID: {selectedPatient.id}</div>
                      <span style={{ ...s.badge, ...getTypeStyle(selectedPatient.patientType), marginTop: 6 }}>{selectedPatient.patientType}</span>
                    </div>
                  </div>
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }} onClick={closeDetail}>
                    <X size={18} color="#64748b" />
                  </button>
                </div>

                {/* Tab切换 */}
                <div style={{ display: 'flex', gap: 4, marginTop: 16, background: '#f8fafc', borderRadius: 8, padding: 4 }}>
                  {(['info', 'exams', 'reports', 'images'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      style={{
                        flex: 1, padding: '6px 8px', borderRadius: 6, border: 'none', cursor: 'pointer',
                        fontSize: 12, fontWeight: 500, transition: 'all 0.2s',
                        background: activeTab === tab ? '#fff' : 'transparent',
                        color: activeTab === tab ? '#1d4ed8' : '#64748b',
                        boxShadow: activeTab === tab ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      }}
                    >
                      {tab === 'info' ? '基本信息' : tab === 'exams' ? '检查' : tab === 'reports' ? '报告' : '图像'}
                    </button>
                  ))}
                </div>
              </div>

              {/* 面板内容 */}
              <div style={s.detailBody}>
                {/* 基本信息 */}
                {activeTab === 'info' && (
                  <>
                    <div style={s.detailSection}>
                      <div style={s.detailSectionTitle}><User size={14} /> 基本信息</div>
                      <div style={s.infoGrid}>
                        <div style={s.infoItem}>
                          <span style={s.infoLabel}>姓名</span>
                          <span style={s.infoValue}>{selectedPatient.name}</span>
                        </div>
                        <div style={s.infoItem}>
                          <span style={s.infoLabel}>性别</span>
                          <span style={s.infoValue}>{selectedPatient.gender}</span>
                        </div>
                        <div style={s.infoItem}>
                          <span style={s.infoLabel}>年龄</span>
                          <span style={s.infoValue}>{selectedPatient.age} 岁</span>
                        </div>
                        <div style={s.infoItem}>
                          <span style={s.infoLabel}>患者类型</span>
                          <span style={s.infoValue}>{selectedPatient.patientType}</span>
                        </div>
                        <div style={s.infoItem}>
                          <span style={s.infoLabel}>出生日期</span>
                          <span style={s.infoValue}>{selectedPatient.birthDate}</span>
                        </div>
                        <div style={s.infoItem}>
                          <span style={s.infoLabel}>建档日期</span>
                          <span style={s.infoValue}>{selectedPatient.registrationDate}</span>
                        </div>
                      </div>
                    </div>

                    <div style={s.detailSection}>
                      <div style={s.detailSectionTitle}><Phone size={14} /> 联系方式</div>
                      <div style={s.infoGrid}>
                        <div style={s.infoItem}>
                          <span style={s.infoLabel}>电话</span>
                          <span style={s.infoValue}>{selectedPatient.phone}</span>
                        </div>
                        <div style={s.infoItem}>
                          <span style={s.infoLabel}>身份证</span>
                          <span style={{ ...s.infoValue, fontFamily: 'monospace', fontSize: 12 }}>{selectedPatient.idCard}</span>
                        </div>
                        <div style={{ ...s.infoItem, gridColumn: '1 / -1' }}>
                          <span style={s.infoLabel}>地址</span>
                          <span style={s.infoValue}><MapPin size={12} style={{ marginRight: 4 }} />{selectedPatient.address}</span>
                        </div>
                      </div>
                    </div>

                    <div style={s.detailSection}>
                      <div style={s.detailSectionTitle}><AlertCircle size={14} /> 病史信息</div>
                      <div style={{ ...s.infoItem, marginBottom: 12 }}>
                        <span style={s.infoLabel}>过敏史</span>
                        <span style={s.infoValue}>无</span>
                      </div>
                      <div style={s.infoItem}>
                        <span style={s.infoLabel}>既往史</span>
                        <span style={s.infoValue}>无</span>
                      </div>
                    </div>
                  </>
                )}

                {/* 检查历史 */}
                {activeTab === 'exams' && (
                  <div style={s.detailSection}>
                    <div style={s.detailSectionTitle}><Stethoscope size={14} /> 检查历史</div>
                    {selectedExams.length === 0 ? (
                      <div style={{ ...s.detailEmpty, padding: '20px 0' }}>暂无检查记录</div>
                    ) : (
                      <div style={s.timeline}>
                        <div style={s.timelineLine} />
                        {selectedExams.map(exam => (
                          <div key={exam.id} style={s.timelineItem}>
                            <div style={{ ...s.timelineDot, ...(exam.status === '已完成' ? s.timelineDotComplete : s.timelineDotPending) }} />
                            <div style={s.timelineDate}><Calendar size={10} style={{ marginRight: 4 }} />{exam.examDate} {exam.examTime}</div>
                            <div style={s.timelineTitle}>{exam.examType} · {exam.examSubtype}</div>
                            <div style={s.timelineMeta}>
                              <span style={{ ...s.badge, ...getStatusStyle(exam.status) }}>{exam.status}</span>
                              <span style={{ marginLeft: 8, color: '#94a3b8', fontSize: 11 }}>{exam.doctor}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 报告列表 */}
                {activeTab === 'reports' && (
                  <div style={s.detailSection}>
                    <div style={s.detailSectionTitle}><FileText size={14} /> 报告列表</div>
                    {selectedReports.length === 0 ? (
                      <div style={{ ...s.detailEmpty, padding: '20px 0' }}>暂无报告</div>
                    ) : (
                      selectedReports.map(report => (
                        <div key={report.id} style={{ ...s.listItem, borderBottom: '1px solid #f1f5f9', padding: '12px 0' }}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 500, color: '#1a3a5c' }}>{report.examType}</div>
                            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{report.examDate} · {report.doctor}</div>
                          </div>
                          <span style={{ ...s.badge, ...getStatusStyle(report.status) }}>{report.status}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* 图像列表 */}
                {activeTab === 'images' && (
                  <div style={s.detailSection}>
                    <div style={s.detailSectionTitle}><Image size={14} /> 图像列表</div>
                    {selectedExams.filter(e => e.images && e.images.length > 0).length === 0 ? (
                      <div style={{ ...s.detailEmpty, padding: '20px 0' }}>暂无图像</div>
                    ) : (
                      selectedExams.filter(e => e.images).map(exam => (
                        <div key={exam.id} style={{ marginBottom: 16 }}>
                          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>{exam.examDate} · {exam.examType}</div>
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
                            {exam.images?.map((img, i) => (
                              <div key={i} style={{ width: 80, height: 80, background: '#f1f5f9', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#94a3b8' }}>
                                <Image size={20} color="#cbd5e1" />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 新增患者弹窗 */}
      {showModal && (
        <div style={s.modal} onClick={() => setShowModal(false)}>
          <div style={s.modalContent} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h2 style={s.modalTitle}>新增患者</h2>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }} onClick={() => setShowModal(false)}>
                <X size={18} color="#64748b" />
              </button>
            </div>

            <div style={s.modalBody}>
              <div style={s.formGrid}>
                {/* 姓名 */}
                <div style={s.formGroup}>
                  <label style={s.formLabel}>姓名 <span style={{ color: '#ef4444' }}>*</span></label>
                  <input style={s.formInput} placeholder="请输入患者姓名" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>

                {/* 性别 */}
                <div style={s.formGroup}>
                  <label style={s.formLabel}>性别 <span style={{ color: '#ef4444' }}>*</span></label>
                  <select style={s.formSelect} value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })}>
                    <option value="">请选择</option>
                    <option value="男">男</option>
                    <option value="女">女</option>
                  </select>
                </div>

                {/* 年龄 */}
                <div style={s.formGroup}>
                  <label style={s.formLabel}>年龄 <span style={{ color: '#ef4444' }}>*</span></label>
                  <input style={s.formInput} type="number" placeholder="年龄" value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} />
                </div>

                {/* 患者类型 */}
                <div style={s.formGroup}>
                  <label style={s.formLabel}>患者类型</label>
                  <select style={s.formSelect} value={formData.patientType} onChange={e => setFormData({ ...formData, patientType: e.target.value })}>
                    <option value="门诊">门诊</option>
                    <option value="住院">住院</option>
                    <option value="体检">体检</option>
                  </select>
                </div>

                {/* 身份证 */}
                <div style={{ ...s.formGroup, gridColumn: '1 / -1' }}>
                  <label style={s.formLabel}>身份证号</label>
                  <input style={s.formInput} placeholder="请输入身份证号" value={formData.idCard} onChange={e => setFormData({ ...formData, idCard: e.target.value })} />
                </div>

                {/* 电话 */}
                <div style={s.formGroup}>
                  <label style={s.formLabel}>联系电话 <span style={{ color: '#ef4444' }}>*</span></label>
                  <input style={s.formInput} placeholder="请输入电话" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                </div>

                {/* 地址 */}
                <div style={{ ...s.formGroup, gridColumn: '1 / -1' }}>
                  <label style={s.formLabel}>地址</label>
                  <input style={s.formInput} placeholder="请输入地址" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                </div>

                {/* 过敏史 */}
                <div style={{ ...s.formGroup, gridColumn: '1 / -1' }}>
                  <label style={s.formLabel}>过敏史</label>
                  <textarea style={s.formTextarea} placeholder="请输入过敏史（若无请填写'无'）" value={formData.allergyHistory} onChange={e => setFormData({ ...formData, allergyHistory: e.target.value })} />
                </div>

                {/* 既往史 */}
                <div style={{ ...s.formGroup, gridColumn: '1 / -1' }}>
                  <label style={s.formLabel}>既往史</label>
                  <textarea style={s.formTextarea} placeholder="请输入既往史（若无请填写'无'）" value={formData.pastHistory} onChange={e => setFormData({ ...formData, pastHistory: e.target.value })} />
                </div>
              </div>
            </div>

            <div style={s.modalFooter}>
              <button style={s.btnOutline} onClick={() => setShowModal(false)}>取消</button>
              <button style={{ ...s.btn, ...s.btnPrimary }} onClick={handleSubmit}>确认添加</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
