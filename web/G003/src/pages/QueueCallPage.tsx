// @ts-nocheck
// ============================================================
// G003 超声RIS系统 - 排队叫号页面
// 患者排队 / 叫号管理 / 候诊显示 / 队列统计
// ============================================================
import { useState } from 'react'
import {
  Search, Plus, Filter, Download, Users, Play,
  Phone, Clock, User, Monitor, Volume2, VolumeX,
  ChevronRight, ChevronUp, ChevronDown, RefreshCw,
  AlertCircle, CheckCircle, XCircle, Pause, SkipForward
} from 'lucide-react'

// ---------- 样式 ----------
const s: Record<string, React.CSSProperties> = {
  root: { padding: 0 },
  header: { marginBottom: 24 },
  title: { fontSize: 20, fontWeight: 700, color: '#1a3a5c', margin: 0 },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 4 },
  headerRight: { display: 'flex', gap: 8 },
  // 统计卡片行
  statRow: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 24 },
  statCard: {
    background: '#fff', borderRadius: 12, padding: '16px 20px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex',
    alignItems: 'center', gap: 12,
  },
  statIconWrap: { width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  statInfo: { flex: 1, minWidth: 0 },
  statValue: { fontSize: 22, fontWeight: 700, color: '#1a3a5c', lineHeight: 1.2 },
  statLabel: { fontSize: 11, color: '#64748b', marginTop: 2 },
  // 主布局
  mainGrid: { display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 },
  // 当前叫号大屏
  callPanel: {
    background: '#fff', borderRadius: 12, padding: 24,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 20,
  },
  callPanelHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  callPanelTitle: { fontSize: 16, fontWeight: 700, color: '#1a3a5c', display: 'flex', alignItems: 'center', gap: 8 },
  currentCall: {
    background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
    borderRadius: 16, padding: '32px 40px', color: '#fff', textAlign: 'center',
  },
  callNumber: { fontSize: 72, fontWeight: 800, lineHeight: 1 },
  callLabel: { fontSize: 14, opacity: 0.8, marginTop: 8 },
  callPatient: { fontSize: 24, fontWeight: 600, marginTop: 16 },
  callExam: { fontSize: 16, opacity: 0.9, marginTop: 8 },
  callActions: { display: 'flex', justifyContent: 'center', gap: 12, marginTop: 24 },
  // 按钮
  btn: { padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s' },
  btnPrimary: { background: '#fff', color: '#3b82f6' },
  btnSecondary: { background: 'rgba(255,255,255,0.2)', color: '#fff' },
  btnWarning: { background: '#f97316', color: '#fff' },
  btnSuccess: { background: '#22c55e', color: '#fff' },
  btnDanger: { background: '#ef4444', color: '#fff' },
  btnOutline: { padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, background: '#fff', color: '#475569' },
  // 队列卡片
  queueCard: {
    background: '#fff', borderRadius: 12, padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 12,
  },
  queueHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  queueTitle: { fontSize: 14, fontWeight: 600, color: '#1a3a5c' },
  queueBadge: { fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 8 },
  queueItem: {
    display: 'flex', gap: 12, padding: '12px 0',
    borderBottom: '1px solid #f1f5f9', alignItems: 'center',
  },
  queueNum: { fontSize: 18, fontWeight: 700, color: '#3b82f6', width: 48, textAlign: 'center' },
  queueInfo: { flex: 1 },
  queuePatient: { fontSize: 13, fontWeight: 600, color: '#1a3a5c' },
  queueMeta: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  queueStatus: { fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 8 },
  // 候诊大屏预览
  displayPanel: {
    background: '#1a3a5c', borderRadius: 12, padding: 20,
    color: '#fff', minHeight: 400,
  },
  displayHeader: { textAlign: 'center', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.1)' },
  displayTitle: { fontSize: 20, fontWeight: 700 },
  displayCurrent: { textAlign: 'center', marginBottom: 20 },
  displayNum: { fontSize: 64, fontWeight: 800, color: '#22c55e' },
  displayPatient: { fontSize: 20, marginTop: 8 },
  displayNext: { textAlign: 'center', padding: '16px 0', borderTop: '1px solid rgba(255,255,255,0.1)' },
  displayNextNum: { fontSize: 32, fontWeight: 700, color: '#94a3b8' },
  // 颜色
  blue: { backgroundColor: '#eff6ff', color: '#3b82f6' },
  green: { backgroundColor: '#f0fdf4', color: '#22c55e' },
  orange: { backgroundColor: '#fff7ed', color: '#f97316' },
  red: { backgroundColor: '#fef2f2', color: '#ef4444' },
  purple: { backgroundColor: '#f5f3ff', color: '#8b5cf6' },
  teal: { backgroundColor: '#f0fdfa', color: '#14b8a6' },
}

// 候诊队列数据
const WAITING_QUEUE = [
  { id: 1, number: 'A025', name: '张三', exam: '腹部超声', doctor: '李明辉', status: '等待中', waitTime: 15 },
  { id: 2, number: 'A026', name: '李红', exam: '心脏超声', doctor: '王芳', status: '等待中', waitTime: 8 },
  { id: 3, number: 'A027', name: '王五', exam: '甲状腺超声', doctor: '张伟', status: '等待中', waitTime: 5 },
  { id: 4, number: 'A028', name: '赵丽', exam: '乳腺超声', doctor: '刘涛', status: '等待中', waitTime: 3 },
]

// 检查室数据
const EXAM_ROOMS = [
  { id: 1, name: '彩超室 A', current: 'A024', patient: '孙伟', status: '检查中', next: 'A025' },
  { id: 2, name: '彩超室 B', current: 'A022', patient: '周杰', status: '检查中', next: 'A026' },
  { id: 3, name: '彩超室 C', current: null, patient: null, status: '空闲', next: null },
  { id: 4, name: '彩超室 D', current: 'A020', patient: '吴敏', status: '检查中', next: 'A027' },
]

export default function QueueCallPage() {
  const [isMuted, setIsMuted] = useState(false)
  const [currentCall, setCurrentCall] = useState({ number: 'A024', name: '孙伟', exam: '腹部超声' })

  const callNext = () => {
    if (WAITING_QUEUE.length > 0) {
      const next = WAITING_QUEUE[0]
      setCurrentCall({ number: next.number, name: next.name, exam: next.exam })
    }
  }

  const skipPatient = () => {
    // 跳过当前患者
  }

  return (
    <div style={s.root}>
      {/* 标题 */}
      <div style={s.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={s.title}>排队叫号管理</h1>
            <p style={s.subtitle}>患者排队 · 叫号管理 · 候诊显示 · 队列统计</p>
          </div>
          <div style={s.headerRight}>
            <button style={s.btnOutline} onClick={() => setIsMuted(!isMuted)}>
              {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />} {isMuted ? '已静音' : '声音开'}
            </button>
            <button style={s.btnOutline}><RefreshCw size={14} /> 刷新</button>
            <button style={{ ...s.btnOutline, background: '#3b82f6', color: '#fff', border: 'none' }}><Play size={14} /> 开始叫号</button>
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div style={s.statRow}>
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, background: '#eff6ff' }}><Users size={20} color="#3b82f6" /></div>
          <div style={s.statInfo}>
            <div style={s.statValue}>28</div>
            <div style={s.statLabel}>候诊人数</div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, background: '#f0fdf4' }}><CheckCircle size={20} color="#22c55e" /></div>
          <div style={s.statInfo}>
            <div style={s.statValue}>156</div>
            <div style={s.statLabel}>今日已完成</div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, background: '#fff7ed' }}><Clock size={20} color="#f97316" /></div>
          <div style={s.statInfo}>
            <div style={s.statValue}>12</div>
            <div style={s.statLabel}>平均等待(分钟)</div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, background: '#fef2f2' }}><AlertCircle size={20} color="#ef4444" /></div>
          <div style={s.statInfo}>
            <div style={s.statValue}>3</div>
            <div style={s.statLabel}>过号患者</div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, background: '#f5f3ff' }}><Monitor size={20} color="#8b5cf6" /></div>
          <div style={s.statInfo}>
            <div style={s.statValue}>4</div>
            <div style={s.statLabel}>检查室</div>
          </div>
        </div>
      </div>

      {/* 主布局 */}
      <div style={s.mainGrid}>
        {/* 左侧 */}
        <div>
          {/* 当前叫号 */}
          <div style={s.callPanel}>
            <div style={s.callPanelHeader}>
              <div style={s.callPanelTitle}><Volume2 size={18} /> 当前叫号</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={{ ...s.btn, ...s.btnWarning }} onClick={skipPatient}><SkipForward size={16} /> 跳过</button>
                <button style={{ ...s.btn, ...s.btnDanger }}><XCircle size={16} /> 终止</button>
              </div>
            </div>
            <div style={s.currentCall}>
              <div style={s.callLabel}>请</div>
              <div style={s.callNumber}>{currentCall.number}</div>
              <div style={s.callPatient}>{currentCall.name}</div>
              <div style={s.callExam}>{currentCall.exam}</div>
              <div style={s.callActions}>
                <button style={{ ...s.btn, ...s.btnPrimary }} onClick={callNext}><Play size={16} /> 下一位</button>
                <button style={{ ...s.btn, ...s.btnSecondary }}><Phone size={16} /> 重新呼叫</button>
              </div>
            </div>
          </div>

          {/* 检查室状态 */}
          <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 16 }}>检查室状态</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {EXAM_ROOMS.map((room) => (
                <div key={room.id} style={{ background: '#f8fafc', borderRadius: 10, padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#1a3a5c' }}>{room.name}</span>
                    <span style={{ ...s.queueBadge, background: room.status === '空闲' ? '#f0fdf4' : '#eff6ff', color: room.status === '空闲' ? '#22c55e' : '#3b82f6' }}>{room.status}</span>
                  </div>
                  {room.current ? (
                    <div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>当前患者</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1a3a5c' }}>{room.current} - {room.patient}</div>
                    </div>
                  ) : (
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>暂无患者</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧 */}
        <div>
          {/* 候诊大屏预览 */}
          <div style={s.displayPanel}>
            <div style={s.displayHeader}>
              <div style={s.displayTitle}>候诊大屏预览</div>
            </div>
            <div style={s.displayCurrent}>
              <div style={{ fontSize: 12, opacity: 0.7 }}>当前叫号</div>
              <div style={s.displayNum}>{currentCall.number}</div>
              <div style={s.displayPatient}>{currentCall.name}</div>
            </div>
            <div style={s.displayNext}>
              <div style={{ fontSize: 11, opacity: 0.5 }}>下一位</div>
              <div style={s.displayNextNum}>A025</div>
            </div>
          </div>

          {/* 候诊队列 */}
          <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginTop: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 16 }}>候诊队列</div>
            {WAITING_QUEUE.map((item, idx) => (
              <div key={item.id} style={s.queueItem}>
                <div style={{ ...s.queueNum, color: idx === 0 ? '#22c55e' : '#3b82f6' }}>{item.number}</div>
                <div style={s.queueInfo}>
                  <div style={s.queuePatient}>{item.name}</div>
                  <div style={s.queueMeta}>{item.exam} | 等待 {item.waitTime} 分钟</div>
                </div>
                <div style={{ ...s.queueStatus, background: idx === 0 ? '#f0fdf4' : '#f1f5f9', color: idx === 0 ? '#22c55e' : '#64748b' }}>
                  {idx === 0 ? '下一位' : '等待中'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
