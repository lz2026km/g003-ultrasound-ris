// @ts-nocheck
// G003 超声RIS - 检查执行页面 v0.2.0 增强版
import { useState, useEffect, useRef } from 'react'
import {
  Search, Play, Pause, CheckCircle, Clock, Monitor, FileText,
  AlertOctagon, Camera, ChevronRight, X, Plus, User,
  Stethoscope, Activity, CheckSquare, Square, Image as ImageIcon,
  Timer, ArrowRight, Save, MonitorCheck
} from 'lucide-react'
import {
  BarChart as RechartsBar, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'
import { mockExams, mockPatients } from '../data/initialData'

// ---------- 样式 ----------
const s: Record<string, React.CSSProperties> = {
  root: { padding: 0 },
  header: { marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 700, color: '#1a3a5c', margin: 0 },
  titleTag: { fontSize: 12, fontWeight: 600, background: '#3b82f6', color: '#fff', padding: '2px 10px', borderRadius: 20, marginLeft: 10 },
  topBar: { display: 'flex', gap: 10, alignItems: 'center' },
  filterRow: {
    display: 'flex', gap: 12, alignItems: 'center', background: '#f8fafc',
    padding: '12px 16px', borderRadius: 10, marginBottom: 20, flexWrap: 'wrap' as const,
  },
  searchInput: {
    flex: 1, minWidth: 200, padding: '8px 12px', borderRadius: 6,
    border: '1px solid #e2e8f0', fontSize: 13, color: '#1a3a5c',
    background: '#fff', outline: 'none', minHeight: 40,
  },
  filterBtn: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
    borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff',
    cursor: 'pointer', fontSize: 13, color: '#64748b', minHeight: 40,
  },
  actionBtn: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
    borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13,
    fontWeight: 500, minHeight: 40,
  },
  badge: {
    display: 'inline-flex', padding: '2px 10px', borderRadius: 20,
    fontSize: 12, fontWeight: 500,
  },
  statCard: {
    background: '#fff', borderRadius: 12, padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', flex: 1, minWidth: 160,
  },
  statLabel: { fontSize: 13, color: '#64748b', marginBottom: 8 },
  statValue: { fontSize: 28, fontWeight: 700, color: '#1a3a5c' },
  // v0.2.0 新增
  examLayout: { display: 'grid', gridTemplateColumns: '320px 1fr 340px', gap: 20, alignItems: 'start' },
  panel: {
    background: '#fff', borderRadius: 12,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0',
    overflow: 'hidden',
  },
  panelHeader: {
    padding: '14px 18px', borderBottom: '1px solid #f1f5f9',
    display: 'flex', alignItems: 'center', gap: 8,
    background: '#fafbfc',
  },
  panelTitle: { fontSize: 14, fontWeight: 600, color: '#1a3a5c', margin: 0 },
  panelBody: { padding: 16 },
  patientCard: { padding: 18 },
  patientRow: { display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13 },
  patientLabel: { color: '#64748b' },
  patientValue: { color: '#1a3a5c', fontWeight: 500 },
  examItemCheckbox: {
    display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
    borderRadius: 8, border: '1px solid #e2e8f0', cursor: 'pointer',
    transition: 'all 0.2s', fontSize: 13, color: '#475569',
    background: '#fff', minHeight: 40,
  },
  examItemActive: {
    border: '1px solid #3b82f6', background: '#eff6ff', color: '#1d4ed8',
  },
  timer: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
    borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff',
    fontSize: 14, fontFamily: 'monospace', fontWeight: 600, color: '#1a3a5c',
  },
  timerRunning: { border: '1px solid #22c55e', background: '#f0fdf4', color: '#16a34a' },
  textarea: {
    width: '100%', minHeight: 120, padding: '10px 12px', borderRadius: 8,
    border: '1px solid #e2e8f0', fontSize: 13, color: '#1a3a5c',
    background: '#fff', outline: 'none', resize: 'vertical' as const,
    fontFamily: 'inherit', lineHeight: 1.6,
  },
  criticalBtn: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px',
    borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13,
    fontWeight: 600, background: '#ef4444', color: '#fff',
    width: '100%', justifyContent: 'center',
  },
  imageThumb: {
    width: 72, height: 72, borderRadius: 8, objectFit: 'cover' as const,
    border: '1px solid #e2e8f0', cursor: 'pointer',
  },
  chartPanel: { padding: 16 },
  stepper: { display: 'flex', alignItems: 'center', gap: 4, marginBottom: 16 },
  step: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
    borderRadius: 20, fontSize: 12, fontWeight: 500,
  },
  stepActive: { background: '#3b82f6', color: '#fff' },
  stepDone: { background: '#22c55e', color: '#fff' },
  stepPending: { background: '#f1f5f9', color: '#94a3b8' },
  deviceSelect: {
    padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0',
    fontSize: 13, color: '#1a3a5c', background: '#fff', outline: 'none',
    minHeight: 40, width: '100%',
  },
  saveNextBtn: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '12px 20px',
    borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 14,
    fontWeight: 600, background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    color: '#fff', width: '100%', justifyContent: 'center',
  },
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  modal: {
    background: '#fff', borderRadius: 12, padding: '24px 28px', maxWidth: 520, width: '90%',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
  },
  modalTitle: { fontSize: 18, fontWeight: 700, color: '#1a3a5c', marginBottom: 20 },
  formRow: { marginBottom: 16 },
  formLabel: { fontSize: 13, color: '#475569', marginBottom: 6, fontWeight: 500 },
  formInput: {
    width: '100%', padding: '8px 12px', borderRadius: 8,
    border: '1px solid #e2e8f0', fontSize: 13, color: '#1a3a5c',
    background: '#fff', outline: 'none', minHeight: 40, boxSizing: 'border-box' as const,
  },
  imageGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 8 },
}

const statusColors: Record<string, { bg: string; color: string }> = {
  '待检查': { bg: '#fff7ed', color: '#f97316' },
  '检查中': { bg: '#eff6ff', color: '#3b82f6' },
  '已完成': { bg: '#f0fdf4', color: '#22c55e' },
  '已报告': { bg: '#f0fdfa', color: '#14b8a6' },
  '已取消': { bg: '#fef2f2', color: '#ef4444' },
}

const EXAM_ITEMS = [
  '肝胆脾胰', '心脏', '妇产', '浅表器官', '血管', '介入超声',
]

const DEVICES = [
  '开立S60', '迈瑞R9', '西门子ACUSON', '飞利浦EPIQ7',
]

const STEPS = ['待检查', '检查中', '已完成', '已报告']

const TODAY_DATA = [
  { hour: '08:00', count: 5 },
  { hour: '09:00', count: 8 },
  { hour: '10:00', count: 12 },
  { hour: '11:00', count: 9 },
  { hour: '14:00', count: 7 },
  { hour: '15:00', count: 11 },
  { hour: '16:00', count: 6 },
]

export default function ExamPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('全部')
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null)
  const [showCriticalModal, setShowCriticalModal] = useState(false)
  const [examItems, setExamItems] = useState<string[]>([])
  const [selectedDevice, setSelectedDevice] = useState('')
  const [findings, setFindings] = useState('')
  const [conclusion, setConclusion] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const [currentStatus, setCurrentStatus] = useState<string>('待检查')
  const [criticalForm, setCriticalForm] = useState({
    patientName: '', item: '', value: '', notes: '',
  })

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const exams = mockExams

  // 今日统计
  const stats = {
    total: exams.length,
    pending: exams.filter(e => e.status === '待检查').length,
    inProgress: exams.filter(e => e.status === '检查中').length,
    completed: exams.filter(e => e.status === '已完成' || e.status === '已报告').length,
  }

  const filtered = exams.filter(e => {
    const matchSearch = e.patientName.includes(search) || e.examType.includes(search)
    const matchStatus = statusFilter === '全部' || e.status === statusFilter
    return matchSearch && matchStatus
  })

  const selectedExam = exams.find(e => e.id === selectedExamId)
  const patient = selectedExam ? mockPatients.find(p => p.id === selectedExam.patientId) : null

  // 选中检查后，加载初始数据
  useEffect(() => {
    if (selectedExam) {
      setCurrentStatus(selectedExam.status)
      setExamItems([])
      setSelectedDevice(selectedExam.device || '')
      setFindings(selectedExam.findings || '')
      setConclusion(selectedExam.diagnosis || '')
      setImages(selectedExam.images || [])
      setTimerSeconds(0)
      setTimerRunning(false)
    }
  }, [selectedExamId])

  // 计时器
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setTimerSeconds(s => s + 1)
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [timerRunning])

  const formatTimer = (secs: number) => {
    const h = Math.floor(secs / 3600)
    const m = Math.floor((secs % 3600) / 60)
    const s = secs % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const toggleExamItem = (item: string) => {
    setExamItems(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    )
  }

  const startExam = () => {
    setCurrentStatus('检查中')
    setTimerSeconds(0)
    setTimerRunning(true)
  }

  const pauseExam = () => {
    setTimerRunning(false)
  }

  const resumeExam = () => {
    setTimerRunning(true)
  }

  const completeExam = () => {
    setTimerRunning(false)
    setCurrentStatus('已完成')
  }

  const saveAndNext = () => {
    setCurrentStatus('已报告')
    setSelectedExamId(null)
  }

  const submitCriticalValue = () => {
    setShowCriticalModal(false)
    setCriticalForm({ patientName: '', item: '', value: '', notes: '' })
  }

  const addImage = () => {
    // 模拟添加图像
    const fakeImg = `img_${Date.now()}.jpg`
    setImages(prev => [...prev, fakeImg])
  }

  const stepIndex = (status: string) => STEPS.indexOf(status)

  return (
    <div style={s.root}>
      {/* 头部 */}
      <div style={s.header}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <h1 style={s.title}>检查执行</h1>
          <span style={s.titleTag}>v0.2.0</span>
        </div>
        <div style={s.topBar}>
          <button
            style={{ ...s.actionBtn, background: '#3b82f6', color: '#fff' }}
            onClick={() => setShowCriticalModal(true)}
          >
            <AlertOctagon size={14} /> 危急值上报
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        <div style={s.statCard}>
          <div style={s.statLabel}>总检查数</div>
          <div style={s.statValue}>{stats.total}</div>
        </div>
        <div style={s.statCard}>
          <div style={s.statLabel}>待检查</div>
          <div style={{ ...s.statValue, color: '#f97316' }}>{stats.pending}</div>
        </div>
        <div style={s.statCard}>
          <div style={s.statLabel}>检查中</div>
          <div style={{ ...s.statValue, color: '#3b82f6' }}>{stats.inProgress}</div>
        </div>
        <div style={s.statCard}>
          <div style={s.statLabel}>已完成</div>
          <div style={{ ...s.statValue, color: '#22c55e' }}>{stats.completed}</div>
        </div>
      </div>

      {/* 搜索筛选 */}
      <div style={s.filterRow}>
        <Search size={14} color="#64748b" />
        <input
          style={s.searchInput}
          placeholder="搜索患者姓名/检查类型..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select style={s.filterBtn} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option>全部</option>
          <option>待检查</option>
          <option>检查中</option>
          <option>已完成</option>
          <option>已报告</option>
        </select>
      </div>

      {/* 列表视图 */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: 16, marginBottom: 24,
      }}>
        {filtered.map(e => (
          <div key={e.id} style={{
            background: '#fff', borderRadius: 12, padding: 20,
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: selectedExamId === e.id ? '2px solid #3b82f6' : '1px solid #e2e8f0',
            cursor: 'pointer', transition: 'all 0.2s',
          }} onClick={() => setSelectedExamId(e.id)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1a3a5c', margin: '0 0 4px 0' }}>{e.patientName}</h3>
                <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>ID: {e.id}</p>
              </div>
              <span style={{ ...s.badge, background: statusColors[e.status]?.bg, color: statusColors[e.status]?.color }}>
                {e.status}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: 13, color: '#64748b' }}>检查类型</span>
              <span style={{ fontSize: 13, color: '#1a3a5c', fontWeight: 500 }}>{e.examType}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: 13, color: '#64748b' }}>检查部位</span>
              <span style={{ fontSize: 13, color: '#1a3a5c', fontWeight: 500 }}>{e.examSubtype}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: 13, color: '#64748b' }}>设备</span>
              <span style={{ fontSize: 13, color: '#1a3a5c', fontWeight: 500 }}>{e.device}</span>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              {e.status === '待检查' && (
                <button
                  style={{ ...s.actionBtn, background: '#3b82f6', color: '#fff', flex: 1 }}
                  onClick={ev => { ev.stopPropagation(); setSelectedExamId(e.id); startExam() }}
                >
                  <Play size={14} /> 开始
                </button>
              )}
              {e.status === '检查中' && (
                <button
                  style={{ ...s.actionBtn, background: '#22c55e', color: '#fff', flex: 1 }}
                  onClick={ev => { ev.stopPropagation(); setSelectedExamId(e.id); completeExam() }}
                >
                  <CheckCircle size={14} /> 完成
                </button>
              )}
              <button style={{ ...s.actionBtn, background: '#fff', color: '#475569', border: '1px solid #e2e8f0', flex: 1 }}
                onClick={ev => { ev.stopPropagation(); setSelectedExamId(e.id) }}>
                <FileText size={14} /> 报告
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ============================================================ */}
      {/* v0.2.0 增强区域：选中检查后的详细工作区 */}
      {/* ============================================================ */}
      {selectedExam && (
        <>
          {/* 状态步骤条 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={s.stepper}>
              {STEPS.map((step, idx) => {
                const isDone = stepIndex(currentStatus) > idx
                const isActive = currentStatus === step
                return (
                  <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{
                      ...s.step,
                      ...(isDone ? s.stepDone : isActive ? s.stepActive : s.stepPending),
                    }}>
                      {isDone ? <CheckCircle size={12} /> : null}
                      {step}
                    </div>
                    {idx < STEPS.length - 1 && (
                      <ChevronRight size={14} color="#cbd5e1" />
                    )}
                  </div>
                )
              })}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* 计时器 */}
              <div style={{ ...s.timer, ...(timerRunning ? s.timerRunning : {}) }}>
                <Timer size={14} />
                {formatTimer(timerSeconds)}
              </div>
              {/* 设备 */}
              <select
                style={{ ...s.deviceSelect, width: 180 }}
                value={selectedDevice}
                onChange={e => setSelectedDevice(e.target.value)}
              >
                <option value="">选择设备</option>
                {DEVICES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          {/* 三栏布局 */}
          <div style={s.examLayout}>
            {/* 左栏：患者信息 */}
            <div style={s.panel}>
              <div style={s.panelHeader}>
                <User size={15} color="#3b82f6" />
                <span style={s.panelTitle}>患者信息</span>
              </div>
              <div style={s.panelBody}>
                {patient && (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: '50%', background: '#1a3a5c',
                        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 16, fontWeight: 600,
                      }}>
                        {patient.name[0]}
                      </div>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: '#1a3a5c' }}>{patient.name}</div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>ID: {patient.id}</div>
                      </div>
                    </div>
                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 12 }}>
                      <div style={s.patientRow}>
                        <span style={s.patientLabel}>性别</span>
                        <span style={s.patientValue}>{patient.gender}</span>
                      </div>
                      <div style={s.patientRow}>
                        <span style={s.patientLabel}>年龄</span>
                        <span style={s.patientValue}>{patient.age}岁</span>
                      </div>
                      <div style={s.patientRow}>
                        <span style={s.patientLabel}>患者类型</span>
                        <span style={s.patientValue}>{patient.patientType}</span>
                      </div>
                      <div style={s.patientRow}>
                        <span style={s.patientLabel}>联系电话</span>
                        <span style={s.patientValue}>{patient.phone}</span>
                      </div>
                      <div style={s.patientRow}>
                        <span style={s.patientLabel}>身份证号</span>
                        <span style={s.patientValue}>{patient.idCard}</span>
                      </div>
                      <div style={s.patientRow}>
                        <span style={s.patientLabel}>地址</span>
                        <span style={s.patientValue}>{patient.address}</span>
                      </div>
                      <div style={{ ...s.patientRow, borderBottom: 'none' }}>
                        <span style={s.patientLabel}>登记日期</span>
                        <span style={s.patientValue}>{patient.registrationDate}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
              {/* 检查信息 */}
              <div style={{ borderTop: '1px solid #f1f5f9', padding: '14px 18px' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1a3a5c', marginBottom: 10 }}>检查信息</div>
                <div style={s.patientRow}>
                  <span style={s.patientLabel}>检查类型</span>
                  <span style={s.patientValue}>{selectedExam.examType}</span>
                </div>
                <div style={s.patientRow}>
                  <span style={s.patientLabel}>检查部位</span>
                  <span style={s.patientValue}>{selectedExam.examSubtype}</span>
                </div>
                <div style={s.patientRow}>
                  <span style={s.patientLabel}>检查医生</span>
                  <span style={s.patientValue}>{selectedExam.doctor}</span>
                </div>
                <div style={{ ...s.patientRow, borderBottom: 'none' }}>
                  <span style={s.patientLabel}>预约时间</span>
                  <span style={s.patientValue}>{selectedExam.examDate} {selectedExam.examTime}</span>
                </div>
              </div>
            </div>

            {/* 中栏：检查所见录入 */}
            <div style={s.panel}>
              <div style={s.panelHeader}>
                <Stethoscope size={15} color="#3b82f6" />
                <span style={s.panelTitle}>检查所见录入</span>
                {(currentStatus === '检查中' || currentStatus === '已完成') && (
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                    {!timerRunning ? (
                      <button style={{ ...s.actionBtn, background: '#22c55e', color: '#fff', padding: '6px 12px', fontSize: 12 }}
                        onClick={resumeExam}>
                        <Play size={12} /> 继续
                      </button>
                    ) : (
                      <button style={{ ...s.actionBtn, background: '#f97316', color: '#fff', padding: '6px 12px', fontSize: 12 }}
                        onClick={pauseExam}>
                        <Pause size={12} /> 暂停
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div style={s.panelBody}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 6, display: 'block' }}>
                    检查所见
                  </label>
                  <textarea
                    style={s.textarea}
                    placeholder="实时录入检查所见..."
                    value={findings}
                    onChange={e => setFindings(e.target.value)}
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 6, display: 'block' }}>
                    检查结论
                  </label>
                  <textarea
                    style={{ ...s.textarea, minHeight: 80 }}
                    placeholder="录入检查结论..."
                    value={conclusion}
                    onChange={e => setConclusion(e.target.value)}
                  />
                </div>
                {/* 附加图像 */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <label style={{ fontSize: 13, fontWeight: 500, color: '#475569' }}>
                      附加图像 ({images.length})
                    </label>
                    <button style={{ ...s.actionBtn, background: '#f1f5f9', color: '#475569', padding: '4px 10px', fontSize: 12 }}
                      onClick={addImage}>
                      <Plus size={12} /> 添加
                    </button>
                  </div>
                  <div style={s.imageGrid}>
                    {images.length === 0 ? (
                      <div style={{
                        gridColumn: '1/-1', padding: 24, textAlign: 'center' as const,
                        color: '#94a3b8', fontSize: 13, border: '1px dashed #e2e8f0', borderRadius: 8,
                      }}>
                        <ImageIcon size={24} style={{ marginBottom: 6, opacity: 0.5 }} />
                        <div>暂无附加图像，点击添加</div>
                      </div>
                    ) : (
                      images.map((img, i) => (
                        <div key={i} style={{ position: 'relative' }}>
                          <div style={{
                            ...s.imageThumb, background: `hsl(${i * 60 + 200}deg, 60%, 90%)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#64748b', fontSize: 10,
                          }}>
                            <ImageIcon size={20} />
                          </div>
                          <div style={{
                            position: 'absolute', top: -4, right: -4, width: 18, height: 18,
                            borderRadius: '50%', background: '#ef4444', color: '#fff',
                            fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer',
                          }}
                            onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                          >×</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
              {/* 底部操作 */}
              <div style={{ padding: '14px 18px', borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* 危急值按钮 */}
                <button style={s.criticalBtn} onClick={() => setShowCriticalModal(true)}>
                  <AlertOctagon size={14} /> 危急值上报
                </button>
                {/* 保存并下一步 */}
                <button style={s.saveNextBtn} onClick={saveAndNext}>
                  <Save size={15} />
                  保存并下一步
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>

            {/* 右栏：检查项目勾选 + 今日图表 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* 检查项目勾选 */}
              <div style={s.panel}>
                <div style={s.panelHeader}>
                  <Activity size={15} color="#3b82f6" />
                  <span style={s.panelTitle}>检查项目</span>
                </div>
                <div style={{ padding: 12 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {EXAM_ITEMS.map(item => {
                      const isActive = examItems.includes(item)
                      return (
                        <div
                          key={item}
                          style={{ ...s.examItemCheckbox, ...(isActive ? s.examItemActive : {}) }}
                          onClick={() => toggleExamItem(item)}
                        >
                          {isActive
                            ? <CheckSquare size={15} color="#3b82f6" />
                            : <Square size={15} color="#94a3b8" />}
                          {item}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* 今日检查量柱状图 */}
              <div style={s.panel}>
                <div style={s.panelHeader}>
                  <BarChart3 size={15} color="#3b82f6" />
                  <span style={s.panelTitle}>今日检查量</span>
                </div>
                <div style={s.chartPanel}>
                  <ResponsiveContainer width="100%" height={180}>
                    <RechartsBar data={TODAY_DATA}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="hour" tick={{ fontSize: 11, color: '#94a3b8' }} />
                      <YAxis tick={{ fontSize: 11, color: '#94a3b8' }} />
                      <Tooltip
                        contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                        cursor={{ fill: '#f8fafc' }}
                      />
                      <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="检查数" />
                    </RechartsBar>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ============================================================ */}
      {/* 危急值弹窗 */}
      {/* ============================================================ */}
      {showCriticalModal && (
        <div style={s.overlay} onClick={() => setShowCriticalModal(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertOctagon size={20} color="#ef4444" />
                <h2 style={{ margin: 0, fontSize: 18, color: '#1a3a5c' }}>危急值上报</h2>
              </div>
              <button onClick={() => setShowCriticalModal(false)} style={{
                background: 'none', border: 'none', cursor: 'pointer', fontSize: 24, color: '#94a3b8', lineHeight: 1,
              }}>×</button>
            </div>

            <div style={s.formRow}>
              <label style={s.formLabel}>患者姓名 *</label>
              <input
                style={s.formInput}
                placeholder="请输入患者姓名"
                value={criticalForm.patientName}
                onChange={e => setCriticalForm(f => ({ ...f, patientName: e.target.value }))}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={s.formRow}>
                <label style={s.formLabel}>危急项目 *</label>
                <input
                  style={s.formInput}
                  placeholder="如：肝功能"
                  value={criticalForm.item}
                  onChange={e => setCriticalForm(f => ({ ...f, item: e.target.value }))}
                />
              </div>
              <div style={s.formRow}>
                <label style={s.formLabel}>危急值 *</label>
                <input
                  style={s.formInput}
                  placeholder="如：ALT 500U/L"
                  value={criticalForm.value}
                  onChange={e => setCriticalForm(f => ({ ...f, value: e.target.value }))}
                />
              </div>
            </div>
            <div style={s.formRow}>
              <label style={s.formLabel}>备注</label>
              <textarea
                style={{ ...s.textarea, minHeight: 60 }}
                placeholder="补充说明..."
                value={criticalForm.notes}
                onChange={e => setCriticalForm(f => ({ ...f, notes: e.target.value }))}
              />
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
              <button
                style={{ ...s.actionBtn, background: '#fff', color: '#475569', border: '1px solid #e2e8f0' }}
                onClick={() => setShowCriticalModal(false)}
              >
                取消
              </button>
              <button
                style={{ ...s.actionBtn, background: '#ef4444', color: '#fff' }}
                onClick={submitCriticalValue}
              >
                <AlertOctagon size={14} /> 确认上报
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// BarChart3 icon fallback if not exported from lucide
function BarChart3({ size = 16, color = 'currentColor' }: { size?: number, color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  )
}
