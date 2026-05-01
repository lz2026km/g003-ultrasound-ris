// @ts-nocheck
// ============================================================
// G004 内镜中心叫号系统页面
// 功能：内镜中心叫号大屏（竞品对标：卫软信息叫号模块）
// ============================================================
import { useState } from 'react'
import {
  Speaker, RefreshCw, SkipForward, Clock, User,
  Activity, CheckCircle, AlertCircle, PlayCircle, PauseCircle
} from 'lucide-react'

// ---------- 类型定义 ----------
type PatientStatus = '等待' | '已呼叫' | '检查中' | '已完成'
type RoomStatus = '空闲' | '检查中' | '准备中'

interface Patient {
  id: string
  sequence: number
  name: string
  patientId: string
  examType: string
  room: string
  callTime: string
  status: PatientStatus
}

interface Room {
  id: string
  name: string
  status: RoomStatus
  currentPatient?: string
  doctor: string
}

// ---------- 演示数据 ----------
const mockPatients: Patient[] = [
  { id: 'P001', sequence: 1, name: '张三', patientId: '340111199001011234', examType: '电子胃镜检查', room: '诊室1', callTime: '09:05', status: '检查中' },
  { id: 'P002', sequence: 2, name: '李四', patientId: '340222199103022345', examType: '电子胃镜检查', room: '诊室1', callTime: '09:00', status: '已呼叫' },
  { id: 'P003', sequence: 3, name: '王五', patientId: '340333199204033456', examType: '电子结肠镜检查', room: '诊室2', callTime: '08:55', status: '等待' },
  { id: 'P004', sequence: 4, name: '赵六', patientId: '340444199305044567', examType: '电子胃镜检查', room: '诊室2', callTime: '08:50', status: '等待' },
  { id: 'P005', sequence: 5, name: '钱七', patientId: '340555199406055678', examType: '电子结肠镜检查', room: '诊室3', callTime: '08:45', status: '等待' },
  { id: 'P006', sequence: 6, name: '孙八', patientId: '340666199507066789', examType: '电子胃镜检查', room: '诊室3', callTime: '08:40', status: '等待' },
  { id: 'P007', sequence: 7, name: '周九', patientId: '340777199608077890', examType: '电子胃镜检查', room: '诊室2', callTime: '', status: '等待' },
  { id: 'P008', sequence: 8, name: '吴十', patientId: '340888199709088901', examType: '电子结肠镜检查', room: '诊室1', callTime: '', status: '等待' },
  { id: 'P009', sequence: 9, name: '郑一', patientId: '340999199810099012', examType: '电子胃镜检查', room: '诊室3', callTime: '', status: '等待' },
  { id: 'P010', sequence: 10, name: '冯二', patientId: '341010199911101123', examType: '电子胃镜检查', room: '诊室2', callTime: '', status: '等待' },
  { id: 'P011', sequence: 11, name: '陈三', patientId: '341121200001011234', examType: '电子结肠镜检查', room: '诊室1', callTime: '', status: '等待' },
  { id: 'P012', sequence: 12, name: '褚四', patientId: '341232200102122345', examType: '电子胃镜检查', room: '诊室3', callTime: '', status: '等待' },
]

const mockRooms: Room[] = [
  { id: 'R1', name: '诊室1', status: '检查中', currentPatient: '张三', doctor: '张建国' },
  { id: 'R2', name: '诊室2', status: '空闲', doctor: '周明' },
  { id: 'R3', name: '诊室3', status: '准备中', currentPatient: '钱七', doctor: '王芳' },
]

// ---------- 样式定义 ----------
const s: Record<string, React.CSSProperties> = {
  // 页面布局
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0d1b2a 0%, #1b3a5c 50%, #2d5a87 100%)',
    padding: 20,
    fontFamily: '"Microsoft YaHei", "PingFang SC", sans-serif',
  },
  container: {
    maxWidth: 1600,
    margin: '0 auto',
  },
  header: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#fff',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 700,
    marginBottom: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  headerSubtitle: {
    fontSize: 16,
    opacity: 0.8,
  },
  // 统计概览
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    background: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: 12,
    padding: '20px 24px',
    textAlign: 'center',
    border: '1px solid rgba(255,255,255,0.15)',
  },
  statValue: {
    fontSize: 36,
    fontWeight: 700,
    color: '#60a5fa',
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  // 主内容区
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 24,
    marginBottom: 24,
  },
  panel: {
    background: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
  },
  panelHeader: {
    background: 'linear-gradient(90deg, #1a3a5c, #2d5a87)',
    color: '#fff',
    padding: '14px 20px',
    fontSize: 16,
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  // 叫号大屏
  callScreen: {
    padding: 24,
    textAlign: 'center',
  },
  currentCallLabel: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 8,
  },
  currentCallNumber: {
    fontSize: 64,
    fontWeight: 800,
    color: '#1a3a5c',
    marginBottom: 4,
  },
  currentCallName: {
    fontSize: 48,
    fontWeight: 700,
    color: '#dc2626',
    marginBottom: 8,
  },
  currentCallInfo: {
    fontSize: 18,
    color: '#475569',
    marginBottom: 4,
  },
  nextPatientBox: {
    background: '#f0f9ff',
    borderRadius: 8,
    padding: '12px 20px',
    marginTop: 16,
    display: 'inline-block',
  },
  nextPatientLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  nextPatientValue: {
    fontSize: 20,
    fontWeight: 600,
    color: '#1a3a5c',
  },
  // 按钮区
  buttonGroup: {
    display: 'flex',
    gap: 16,
    justifyContent: 'center',
    marginTop: 24,
    flexWrap: 'wrap',
  },
  btnCallNext: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: '#16a34a',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '12px 32px',
    fontSize: 18,
    fontWeight: 600,
    cursor: 'pointer',
    minHeight: 52,
    minWidth: 160,
  },
  btnRecall: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: '#ea580c',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '12px 32px',
    fontSize: 18,
    fontWeight: 600,
    cursor: 'pointer',
    minHeight: 52,
    minWidth: 160,
  },
  btnSkip: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: '#64748b',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '12px 32px',
    fontSize: 18,
    fontWeight: 600,
    cursor: 'pointer',
    minHeight: 52,
    minWidth: 160,
  },
  // 等待队列
  waitingQueue: {
    padding: 16,
  },
  queueTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 15,
  },
  th: {
    background: '#f1f5f9',
    padding: '10px 12px',
    textAlign: 'left',
    fontWeight: 600,
    color: '#334155',
    borderBottom: '2px solid #e2e8f0',
  },
  td: {
    padding: '10px 12px',
    borderBottom: '1px solid #f1f5f9',
    color: '#334155',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 600,
  },
  // 诊室状态
  roomSection: {
    marginBottom: 24,
  },
  roomGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 16,
  },
  roomCard: {
    background: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    padding: 20,
    textAlign: 'center',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
  },
  roomName: {
    fontSize: 20,
    fontWeight: 700,
    color: '#1a3a5c',
    marginBottom: 8,
  },
  roomStatus: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 16px',
    borderRadius: 20,
    fontSize: 14,
    fontWeight: 600,
  },
  roomDoctor: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
  },
  roomPatient: {
    fontSize: 16,
    fontWeight: 600,
    color: '#334155',
    marginTop: 8,
  },
}

// ---------- 状态颜色 ----------
const statusColors: Record<PatientStatus, { bg: string; text: string }> = {
  '等待': { bg: '#e2e8f0', text: '#475569' },
  '已呼叫': { bg: '#fef3c7', text: '#92400e' },
  '检查中': { bg: '#dbeafe', text: '#1e40af' },
  '已完成': { bg: '#dcfce7', text: '#166534' },
}

const roomStatusColors: Record<RoomStatus, { bg: string; text: string }> = {
  '空闲': { bg: '#dcfce7', text: '#166534' },
  '检查中': { bg: '#dbeafe', text: '#1e40af' },
  '准备中': { bg: '#fef3c7', text: '#92400e' },
}

// ---------- 组件 ----------
export default function QueueCallPage() {
  const [patients, setPatients] = useState<Patient[]>(mockPatients)
  const [rooms] = useState<Room[]>(mockRooms)

  const currentCall = patients.find(p => p.status === '已呼叫')
  const nextPatient = patients.find(p => p.status === '等待')
  const waitingList = patients.filter(p => p.status === '等待' || p.status === '已呼叫')
  const completedCount = patients.filter(p => p.status === '已完成').length
  const waitingCount = patients.filter(p => p.status === '等待').length

  const handleCallNext = () => {
    setPatients(prev => {
      const current = prev.find(p => p.status === '已呼叫')
      const next = prev.find(p => p.status === '等待')
      if (!next) return prev
      return prev.map(p => {
        if (p.status === '检查中') return { ...p, status: '已完成' as PatientStatus }
        if (p.id === current?.id) return { ...p, status: '检查中' as PatientStatus }
        if (p.id === next.id) return { ...p, status: '已呼叫' as PatientStatus, callTime: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) }
        return p
      })
    })
  }

  const handleRecall = () => {
    // 重呼当前已呼叫的患者
    setPatients(prev => prev.map(p => {
      if (p.status === '已呼叫' || p.status === '检查中') {
        return { ...p, callTime: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) }
      }
      return p
    }))
  }

  const handleSkip = () => {
    setPatients(prev => {
      const current = prev.find(p => p.status === '已呼叫')
      const next = prev.find(p => p.status === '等待')
      if (!next) return prev
      return prev.map(p => {
        if (p.id === current?.id) return { ...p, status: '等待' as PatientStatus, callTime: '' }
        if (p.id === next.id) return { ...p, status: '已呼叫' as PatientStatus, callTime: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) }
        return p
      })
    })
  }

  return (
    <div style={s.page}>
      <div style={s.container}>
        {/* 标题 */}
        <div style={s.header}>
          <div style={s.headerTitle}>
            <Speaker size={36} />
            内镜中心叫号系统
          </div>
          <div style={s.headerSubtitle}> endoscopy Center Queue Call System</div>
        </div>

        {/* 统计概览 */}
        <div style={s.statsRow}>
          <div style={s.statCard}>
            <div style={s.statValue}>{completedCount}</div>
            <div style={s.statLabel}>今日已检查</div>
          </div>
          <div style={s.statCard}>
            <div style={s.statValue}>{waitingCount}</div>
            <div style={s.statLabel}>当前等待</div>
          </div>
          <div style={s.statCard}>
            <div style={s.statValue}>18<span style={{ fontSize: 18 }}>分钟</span></div>
            <div style={s.statLabel}>平均候诊时间</div>
          </div>
        </div>

        {/* 诊室状态栏 */}
        <div style={s.roomSection}>
          <div style={s.panelHeader}>
            <Activity size={20} />
            诊室状态
          </div>
          <div style={{ padding: 16 }}>
            <div style={s.roomGrid}>
              {rooms.map(room => (
                <div key={room.id} style={s.roomCard}>
                  <div style={s.roomName}>{room.name}</div>
                  <div style={{
                    ...s.roomStatus,
                    background: roomStatusColors[room.status].bg,
                    color: roomStatusColors[room.status].text,
                  }}>
                    {room.status === '空闲' && <PauseCircle size={16} />}
                    {room.status === '检查中' && <PlayCircle size={16} />}
                    {room.status === '准备中' && <RefreshCw size={16} />}
                    {room.status}
                  </div>
                  {room.currentPatient && (
                    <div style={s.roomPatient}>{room.currentPatient}</div>
                  )}
                  <div style={s.roomDoctor}>医生：{room.doctor}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 主内容区 */}
        <div style={s.mainGrid}>
          {/* 叫号大屏 */}
          <div style={s.panel}>
            <div style={s.panelHeader}>
              <Speaker size={20} />
              当前叫号
            </div>
            <div style={s.callScreen}>
              <div style={s.currentCallLabel}>正在检查</div>
              {currentCall ? (
                <>
                  <div style={s.currentCallNumber}>第 {currentCall.sequence} 号</div>
                  <div style={s.currentCallName}>{currentCall.name}</div>
                  <div style={s.currentCallInfo}>{currentCall.examType} | {currentCall.room}</div>
                  <div style={s.currentCallInfo}>
                    <Clock size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                    呼叫时间：{currentCall.callTime}
                  </div>
                </>
              ) : (
                <div style={{ fontSize: 24, color: '#94a3b8', padding: '40px 0' }}>
                  暂无叫号
                </div>
              )}

              {nextPatient && (
                <div style={s.nextPatientBox}>
                  <div style={s.nextPatientLabel}>下一位</div>
                  <div style={s.nextPatientValue}>
                    {nextPatient.name} - 第 {nextPatient.sequence} 号
                  </div>
                </div>
              )}

              {/* 操作按钮 */}
              <div style={s.buttonGroup}>
                <button style={s.btnCallNext} onClick={handleCallNext}>
                  <Speaker size={22} />
                  呼叫下一位
                </button>
                <button style={s.btnRecall} onClick={handleRecall}>
                  <RefreshCw size={22} />
                  重呼
                </button>
                <button style={s.btnSkip} onClick={handleSkip}>
                  <SkipForward size={22} />
                  跳过
                </button>
              </div>
            </div>
          </div>

          {/* 候诊区状态 */}
          <div style={s.panel}>
            <div style={s.panelHeader}>
              <User size={20} />
              候诊区状态
            </div>
            <div style={s.waitingQueue}>
              <table style={s.queueTable}>
                <thead>
                  <tr>
                    <th style={{ ...s.th, width: 60 }}>序号</th>
                    <th style={{ ...s.th, width: 80 }}>姓名</th>
                    <th style={{ ...s.th, width: 80 }}>项目</th>
                    <th style={{ ...s.th, width: 80 }}>诊室</th>
                    <th style={{ ...s.th, width: 80 }}>呼叫时间</th>
                    <th style={{ ...s.th }}>状态</th>
                  </tr>
                </thead>
                <tbody>
                  {waitingList.slice(0, 8).map(patient => (
                    <tr key={patient.id}>
                      <td style={s.td}>{patient.sequence}</td>
                      <td style={{ ...s.td, fontWeight: 600 }}>{patient.name}</td>
                      <td style={s.td}>{patient.examType.replace('电子', '').replace('检查', '')}</td>
                      <td style={s.td}>{patient.room}</td>
                      <td style={s.td}>{patient.callTime || '-'}</td>
                      <td style={s.td}>
                        <span style={{
                          ...s.statusBadge,
                          background: statusColors[patient.status].bg,
                          color: statusColors[patient.status].text,
                        }}>
                          {patient.status === '已呼叫' && <Speaker size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />}
                          {patient.status === '检查中' && <Activity size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />}
                          {patient.status === '已完成' && <CheckCircle size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />}
                          {patient.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 底部提示 */}
        <div style={{
          textAlign: 'center',
          color: 'rgba(255,255,255,0.6)',
          fontSize: 14,
          marginTop: 16,
          padding: 12,
        }}>
          内镜中心叫号系统 v1.0 | 请保持网络连接通畅
        </div>
      </div>
    </div>
  )
}
