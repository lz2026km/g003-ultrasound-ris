// @ts-nocheck
// G003 超声RIS系统 - 远程超声会诊模块
import { useState, useEffect } from 'react'
import {
  Video, Search, Filter, Plus, RefreshCw, Send, Image,
  MessageSquare, Users, Wifi, Signal, Clock, CheckCircle,
  AlertCircle, User, UserCheck, Building2, Upload, Phone,
  Monitor, Check, X, ArrowRight
} from 'lucide-react'

const s: Record<string, React.CSSProperties> = {
  root: { padding: 0 },
  header: { marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 20, fontWeight: 700, color: '#1a3a5c', margin: 0 },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 4 },
  networkBar: { display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px', background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', borderRadius: 10, marginBottom: 20, color: '#fff' },
  networkText: { fontWeight: 600 },
  networkStats: { display: 'flex', gap: 16, marginLeft: 'auto', fontSize: 13 },
  kpiRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 },
  kpiCard: { background: '#fff', borderRadius: 10, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  kpiValue: { fontSize: 28, fontWeight: 700, color: '#1a3a5c' },
  kpiLabel: { fontSize: 13, color: '#64748b', marginTop: 4 },
  mainContent: { display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 },
  card: { background: '#fff', borderRadius: 10, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  cardHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #e2e8f0' },
  cardTitle: { fontSize: 15, fontWeight: 600, color: '#1a3a5c', display: 'flex', alignItems: 'center', gap: 8 },
  badge: { padding: '2px 8px', borderRadius: 10, fontSize: 12, fontWeight: 500 },
  tabRow: { display: 'flex', gap: 8, marginBottom: 16 },
  tab: { padding: '8px 16px', borderRadius: 6, fontSize: 13, cursor: 'pointer', border: 'none', background: '#f1f5f9', color: '#64748b' },
  tabActive: { padding: '8px 16px', borderRadius: 6, fontSize: 13, cursor: 'pointer', border: 'none', background: '#2563eb', color: '#fff' },
  searchInput: { padding: '8px 12px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', width: 240 },
  consList: { maxHeight: 400, overflowY: 'auto' },
  consItem: { padding: 12, borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 8, cursor: 'pointer' },
  consItemActive: { padding: 12, borderRadius: 8, border: '2px solid #2563eb', marginBottom: 8, cursor: 'pointer', background: '#eff6ff' },
  chatArea: { height: 350, overflowY: 'auto', padding: 16, background: '#f8fafc', borderRadius: 8, marginBottom: 12 },
  chatInput: { display: 'flex', gap: 8 },
  chatMsg: { marginBottom: 12, display: 'flex', gap: 8 },
  chatMsgSelf: { flexDirection: 'row-reverse' },
  chatBubble: { maxWidth: '70%', padding: '8px 12px', borderRadius: 10, fontSize: 13 },
  chatBubbleSelf: { background: '#2563eb', color: '#fff' },
  chatBubbleOther: { background: '#fff', color: '#1a3a5c', border: '1px solid #e2e8f0' },
  allianceGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 },
  allianceCard: { padding: 16, borderRadius: 8, border: '1px solid #e2e8f0', textAlign: 'center' },
  allianceName: { fontWeight: 600, color: '#1a3a5c', marginBottom: 4 },
  allianceExpert: { fontSize: 12, color: '#64748b' },
  onlineDot: { width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block', marginRight: 4 },
}

const DEMO_CONSULTATIONS = [
  { id: 'RC001', patient: '王芳', age: 45, gender: '女', examType: '腹部US', hospital: '北京协和医院', doctor: '李建国', status: 'pending', priority: 'urgent', reason: '肝右叶占位待确诊', date: '2026-05-01' },
  { id: 'RC002', patient: '张伟', age: 58, gender: '男', examType: '心血管US', hospital: '301医院', doctor: '王红', status: 'in_progress', priority: 'normal', reason: '主动脉瓣狭窄评估', date: '2026-05-01' },
  { id: 'RC003', patient: '刘洋', age: 32, gender: '女', examType: '妇产科US', hospital: '北医三院', doctor: '赵丽', status: 'completed', priority: 'normal', reason: '胎儿生长评估', date: '2026-04-30' },
  { id: 'RC004', patient: '陈静', age: 52, gender: '女', examType: '浅表器官US', hospital: '中日友好医院', doctor: '孙强', status: 'pending', priority: 'normal', reason: '甲状腺结节TI-RADS 4类', date: '2026-04-30' },
  { id: 'RC005', patient: '周明', age: 65, gender: '男', examType: '腹部US', hospital: '宣武医院', doctor: '李娜', status: 'completed', priority: 'urgent', reason: '胰尾占位性质待定', date: '2026-04-29' },
]

const MESSAGES = [
  { id: 1, type: 'other', sender: '李建国 · 协和医院', content: '收到会诊申请，请上传最新的超声造影图像。', time: '09:30' },
  { id: 2, type: 'self', sender: '我', content: '好的，已上传2张超声造影图像，请查阅。', time: '09:32' },
  { id: 3, type: 'other', sender: '李建国 · 协和医院', content: '图像清晰。综合弹性成像表现，考虑肝血管瘤可能性大，建议增强CT进一步检查。', time: '10:15' },
]

export default function RemoteConsultationPage() {
  const [activeTab, setActiveTab] = useState('list')
  const [selectedId, setSelectedId] = useState('RC001')
  const [searchText, setSearchText] = useState('')
  const [inputText, setInputText] = useState('')
  const [messages, setMessages] = useState(MESSAGES)
  const [networkStatus, setNetworkStatus] = useState<'excellent' | 'good' | 'unstable'>('excellent')
  const [bandwidth, setBandwidth] = useState(280)
  const [latency, setLatency] = useState(12)

  useEffect(() => {
    const interval = setInterval(() => {
      const rand = Math.random()
      if (rand < 0.2) { setNetworkStatus('unstable'); setLatency(Math.floor(Math.random() * 30) + 30) }
      else if (rand < 0.5) { setNetworkStatus('good'); setLatency(Math.floor(Math.random() * 15) + 15) }
      else { setNetworkStatus('excellent'); setBandwidth(Math.floor(Math.random() * 100) + 250); setLatency(Math.floor(Math.random() * 10) + 8) }
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  const filtered = DEMO_CONSULTATIONS.filter(c => c.patient.includes(searchText) || c.id.includes(searchText))
  const selected = DEMO_CONSULTATIONS.find(c => c.id === selectedId)

  const getStatusBadge = (status: string) => {
    const map: Record<string, { bg: string, color: string, text: string }> = {
      pending: { bg: '#fef3c7', color: '#d97706', text: '待会诊' },
      in_progress: { bg: '#dbeafe', color: '#2563eb', text: '会诊中' },
      completed: { bg: '#d1fae5', color: '#059669', text: '已完成' },
    }
    return map[status] || map.pending
  }

  const getPriorityBadge = (p: string) => {
    const map: Record<string, { bg: string, color: string, text: string }> = {
      urgent: { bg: '#fee2e2', color: '#dc2626', text: '紧急' },
      normal: { bg: '#f1f5f9', color: '#64748b', text: '普通' },
    }
    return map[p] || map.normal
  }

  const handleSend = () => {
    if (!inputText.trim()) return
    const newMsg = { id: messages.length + 1, type: 'self' as const, sender: '我', content: inputText, time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) }
    setMessages([...messages, newMsg])
    setInputText('')
  }

  return (
    <div style={s.root}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>远程超声会诊</h1>
          <p style={s.subtitle}>5G远程医疗协作平台 - 医联体资源共享</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ ...s.badge, background: '#f1f5f9', color: '#64748b', padding: '8px 16px', border: 'none', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <RefreshCw size={14} /> 刷新
          </button>
          <button style={{ ...s.badge, background: '#2563eb', color: '#fff', padding: '8px 16px', border: 'none', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={14} /> 新建会诊
          </button>
        </div>
      </div>

      {/* 5G Network Status */}
      <div style={s.networkBar}>
        <Wifi size={20} />
        <span style={s.networkText}>
          5G网络状态：{networkStatus === 'excellent' ? '极好' : networkStatus === 'good' ? '良好' : '不稳定'}
        </span>
        <div style={s.networkStats}>
          <span>带宽：{bandwidth} Mbps</span>
          <span>延迟：{latency} ms</span>
          <span>信号：{networkStatus === 'excellent' ? '极强' : networkStatus === 'good' ? '良好' : '较弱'}</span>
        </div>
      </div>

      {/* KPI */}
      <div style={s.kpiRow}>
        {[
          { value: 28, label: '待处理会诊', color: '#dc2626' },
          { value: 12, label: '会诊中', color: '#2563eb' },
          { value: 156, label: '本月完成', color: '#059669' },
          { value: 8, label: '医联体医院', color: '#7c3aed' },
        ].map((k, i) => (
          <div key={i} style={s.kpiCard}>
            <div style={{ ...s.kpiValue, color: k.color }}>{k.value}</div>
            <div style={s.kpiLabel}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={s.tabRow}>
        <button style={activeTab === 'list' ? s.tabActive : s.tab} onClick={() => setActiveTab('list')}>会诊申请</button>
        <button style={activeTab === 'chat' ? s.tabActive : s.tab} onClick={() => setActiveTab('chat')}>图文交流</button>
        <button style={activeTab === 'alliance' ? s.tabActive : s.tab} onClick={() => setActiveTab('alliance')}>医联体协作</button>
      </div>

      {activeTab === 'list' && (
        <div style={s.mainContent}>
          <div style={s.card}>
            <div style={s.cardHeader}>
              <span style={s.cardTitle}><MessageSquare size={16} color="#2563eb" /> 会诊列表</span>
              <input style={s.searchInput} placeholder="搜索患者/会诊号..." value={searchText} onChange={e => setSearchText(e.target.value)} />
            </div>
            <div style={s.consList}>
              {filtered.map(c => {
                const sb = getStatusBadge(c.status)
                const pb = getPriorityBadge(c.priority)
                return (
                  <div key={c.id} style={c.id === selectedId ? s.consItemActive : s.consItem} onClick={() => setSelectedId(c.id)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontWeight: 600, color: '#1a3a5c' }}>{c.patient} · {c.age}岁{c.gender}</span>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <span style={{ ...s.badge, background: pb.bg, color: pb.color }}>{pb.text}</span>
                        <span style={{ ...s.badge, background: sb.bg, color: sb.color }}>{sb.text}</span>
                      </div>
                    </div>
                    <div style={{ fontSize: 13, color: '#64748b' }}>
                      <span style={{ marginRight: 12 }}>{c.examType}</span>
                      <span>{c.hospital}</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{c.reason}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {selected && (
            <div style={s.card}>
              <div style={s.cardHeader}>
                <span style={s.cardTitle}><User size={16} color="#2563eb" /> 会诊详情</span>
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#1a3a5c', marginBottom: 12 }}>{selected.patient}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
                  <div><span style={{ color: '#94a3b8' }}>年龄：</span>{selected.age}岁</div>
                  <div><span style={{ color: '#94a3b8' }}>性别：</span>{selected.gender}</div>
                  <div><span style={{ color: '#94a3b8' }}>检查：</span>{selected.examType}</div>
                  <div><span style={{ color: '#94a3b8' }}>会诊号：</span>{selected.id}</div>
                  <div style={{ gridColumn: '1/-1' }}><span style={{ color: '#94a3b8' }}>目的医院：</span>{selected.hospital}</div>
                  <div style={{ gridColumn: '1/-1' }}><span style={{ color: '#94a3b8' }}>会诊原因：</span>{selected.reason}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={{ flex: 1, padding: '8px 12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <Video size={14} /> 开始会诊
                </button>
                <button style={{ flex: 1, padding: '8px 12px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <Phone size={14} /> 联系对方
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'chat' && (
        <div style={s.card}>
          <div style={s.cardHeader}>
            <span style={s.cardTitle}><MessageSquare size={16} color="#2563eb" /> 实时沟通</span>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>{selected?.hospital} · {selected?.doctor}</span>
          </div>
          <div style={s.chatArea}>
            {messages.map(m => (
              <div key={m.id} style={{ ...s.chatMsg, ...(m.type === 'self' ? s.chatMsgSelf : {}) }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: m.type === 'self' ? '#2563eb' : '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 12, flexShrink: 0 }}>
                  {m.sender[0]}
                </div>
                <div style={{ ...s.chatBubble, ...(m.type === 'self' ? s.chatBubbleSelf : s.chatBubbleOther) }}>
                  <div style={{ fontSize: 11, color: m.type === 'self' ? '#bfdbfe' : '#94a3b8', marginBottom: 2 }}>{m.sender}</div>
                  {m.content}
                  <div style={{ fontSize: 10, color: m.type === 'self' ? '#bfdbfe' : '#94a3b8', marginTop: 4, textAlign: 'right' }}>{m.time}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={s.chatInput}>
            <input style={{ flex: 1, padding: '8px 12px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none' }} placeholder="输入会诊意见..." value={inputText} onChange={e => setInputText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} />
            <button onClick={handleSend} style={{ padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Send size={14} /> 发送
            </button>
          </div>
        </div>
      )}

      {activeTab === 'alliance' && (
        <div style={s.card}>
          <div style={s.cardHeader}>
            <span style={s.cardTitle}><Building2 size={16} color="#7c3aed" /> 医联体协作医院</span>
            <span style={{ fontSize: 13, color: '#64748b' }}>在线专家：<span style={{ color: '#10b981', fontWeight: 600 }}>52</span> 人</span>
          </div>
          <div style={s.allianceGrid}>
            {[
              { name: '北京协和医院', experts: 12, dept: '消化内科/超声科' },
              { name: '301医院', experts: 8, dept: '肝胆外科' },
              { name: '北医三院', experts: 10, dept: '妇产科' },
              { name: '中日友好医院', experts: 6, dept: '内分泌科' },
              { name: '宣武医院', experts: 7, dept: '神经内科' },
              { name: '安贞医院', experts: 9, dept: '心血管科' },
            ].map((h, i) => (
              <div key={i} style={s.allianceCard}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 4 }}>
                  <span style={s.onlineDot}></span>
                  <span style={s.allianceName}>{h.name}</span>
                </div>
                <div style={s.allianceExpert}>{h.experts} 位专家 · {h.dept}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
