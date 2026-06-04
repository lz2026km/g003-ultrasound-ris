/**
 * 远程超声（实时）模块
 * @version v0.9.0
 * @description 对标联影远程超声、祥生云平台、华声"四叶草"5G远程超声
 *
 * 核心能力：
 * - WebRTC实时超声图像传输
 * - 操作手法同步
 * - 探头反向控制（深度/增益/频率/TGC）
 * - 5G网络质量监控（带宽/延迟/抖动/丢包）
 * - 录播回放
 * - 云端存储
 */

import React, { useState, useEffect, useRef } from 'react'
import {
  Video, Wifi, Activity, Settings, Play, Pause, Save, Upload,
  Zap, Volume2, VolumeX, Camera, Download, RotateCcw, Ruler, Square,
  ChevronRight, ChevronLeft, Maximize2, Minimize2, RefreshCw, Signal,
  Server, Cloud, Database, Monitor, Smartphone, Sliders, ArrowUp, ArrowDown,
  Plus, Search, X, Check, AlertTriangle, Clock
} from 'lucide-react'

const C = {
  primary: '#1a365d',
  accent: '#2563eb',
  success: '#059669',
  warning: '#d97706',
  danger: '#dc2626',
  white: '#ffffff',
  bg: '#f8fafc',
  border: '#e2e8f0',
  text: '#1a365c',
  textLight: '#64748b',
  purple: '#7c3aed',
}

const s: Record<string, React.CSSProperties> = {
  root: { padding: 0 },
  header: { marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 20, fontWeight: 700, color: C.primary, margin: 0 },
  subtitle: { fontSize: 13, color: C.textLight, marginTop: 4 },
  netBar: { display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px', background: `linear-gradient(135deg, ${C.success} 0%, #10b981 100%)`, borderRadius: 10, marginBottom: 20, color: C.white },
  kpiRow: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 20 },
  kpiCard: { background: C.white, borderRadius: 10, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  kpiValue: { fontSize: 28, fontWeight: 700 },
  kpiLabel: { fontSize: 13, color: C.textLight, marginTop: 4 },
  tabRow: { display: 'flex', gap: 6, marginBottom: 20, borderBottom: `2px solid ${C.border}` },
  tab: { padding: '10px 18px', borderRadius: '6px 6px 0 0', fontSize: 13, cursor: 'pointer', border: 'none', background: 'transparent', color: C.textLight, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 },
  tabActive: { padding: '10px 18px', borderRadius: '6px 6px 0 0', fontSize: 13, cursor: 'pointer', border: 'none', background: C.primary, color: C.white, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 },
  card: { background: C.white, borderRadius: 10, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  cardHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 12, borderBottom: `1px solid ${C.border}` },
  cardTitle: { fontSize: 15, fontWeight: 600, color: C.primary, display: 'flex', alignItems: 'center', gap: 8 },
  badge: { padding: '2px 8px', borderRadius: 10, fontSize: 12, fontWeight: 500 },
  quadScreen: { display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 8, height: 400, marginBottom: 12 },
  quadPane: { background: '#0f172a', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', minHeight: 180, overflow: 'hidden' },
  quadLabel: { color: '#94a3b8', fontSize: 12, position: 'absolute', top: 8, left: 10, fontWeight: 600 },
  quadParams: { color: '#10b981', fontSize: 11, position: 'absolute', bottom: 8, right: 10, fontFamily: 'monospace' },
  quadWave: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.4 },
  probePanel: { padding: 16, background: '#f8fafc', borderRadius: 8, marginBottom: 12 },
  probeRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 },
  probeCol: { display: 'flex', flexDirection: 'column', gap: 6 },
  probeLabel: { fontSize: 12, color: C.textLight, fontWeight: 600 },
  probeSlider: { width: '100%' },
  probeValue: { fontSize: 14, fontWeight: 700, color: C.primary, fontFamily: 'monospace', textAlign: 'center' },
  toolBar: { display: 'flex', gap: 8, padding: '12px 0', borderTop: `1px solid ${C.border}`, marginTop: 12, flexWrap: 'wrap' },
  toolBtn: { padding: '7px 14px', borderRadius: 6, border: `1px solid ${C.border}`, background: C.white, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 },
  callBtn: { padding: '7px 14px', borderRadius: 6, border: 'none', background: C.success, color: C.white, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 },
  callBtnEnd: { padding: '7px 14px', borderRadius: 6, border: 'none', background: C.danger, color: C.white, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 },
  meterRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 },
  meterLabel: { fontSize: 13, color: C.textLight, width: 64 },
  meterBar: { flex: 1, height: 8, background: C.border, borderRadius: 4, overflow: 'hidden' },
  meterFill: { height: '100%', borderRadius: 4, transition: 'width 0.5s' },
  meterValue: { fontSize: 13, fontWeight: 600, width: 80, textAlign: 'right' },
  recordingDot: { width: 10, height: 10, borderRadius: '50%', background: C.danger, animation: 'pulse 1.5s infinite' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: { padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: C.textLight, background: '#f8fafc', borderBottom: `1px solid ${C.border}` },
  td: { padding: '10px 12px', borderBottom: `1px solid ${C.border}`, color: C.text },
  cloudBox: { padding: 16, background: `linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)`, borderRadius: 8, border: `1px solid #bae6fd` },
}

const REALTIME_SESSIONS = [
  { id: 'RU001', patient: '王嘉怡', age: 52, gender: '女', exam: '心脏US', hospital: '滨海县人民医院', expert: '刘主任', duration: '00:18:42', bandwidth: 320, latency: 18, status: 'live' },
  { id: 'RU002', patient: '陈昊宇', age: 38, gender: '男', exam: '腹部US', hospital: '青浦区中医院', expert: '黄教授', duration: '00:09:15', bandwidth: 280, latency: 22, status: 'live' },
  { id: 'RU003', patient: '林晓曼', age: 67, gender: '女', exam: '颈部血管US', hospital: '临港市第一医院', expert: '赵医师', duration: '00:25:08', bandwidth: 350, latency: 12, status: 'live' },
  { id: 'RU004', patient: '赵明远', age: 45, gender: '男', exam: '泌尿US', hospital: '奉贤区中心医院', expert: '孙医师', duration: '00:05:30', bandwidth: 240, latency: 28, status: 'live' },
]

const RECORDINGS = [
  { id: 'V001', title: '肝占位远程会诊-王嘉怡', date: '2026-06-04 14:30', duration: '23:15', size: '1.2GB', views: 12, expert: '刘主任' },
  { id: 'V002', title: '胎儿心脏评估-陈昊宇', date: '2026-06-04 11:20', duration: '18:42', size: '0.9GB', views: 8, expert: '黄教授' },
  { id: 'V003', title: '颈动脉斑块分析-林晓曼', date: '2026-06-03 16:45', duration: '31:20', size: '1.6GB', views: 24, expert: '赵医师' },
  { id: 'V004', title: '肾占位穿刺-赵明远', date: '2026-06-03 09:15', duration: '12:38', size: '0.6GB', views: 15, expert: '孙医师' },
  { id: 'V005', title: '胆道梗阻评估-周思远', date: '2026-06-02 15:00', duration: '27:50', size: '1.4GB', views: 19, expert: '黄教授' },
]

const CLOUD_STATS = {
  totalSessions: 1248,
  totalDuration: '3856小时',
  totalStorage: '12.8TB',
  cloudSync: 99.7,
  edgeNodes: 8,
  activeStreams: 4,
}

const WaveAnimation: React.FC<{ color: string }> = ({ color }) => (
  <svg style={s.quadWave} viewBox="0 0 200 100" preserveAspectRatio="none">
    <path d="M 0,50 Q 25,30 50,50 T 100,50 T 150,50 T 200,50" stroke={color} strokeWidth="1.5" fill="none">
      <animate attributeName="d" dur="2s" repeatCount="indefinite"
        values="M 0,50 Q 25,30 50,50 T 100,50 T 150,50 T 200,50;
                M 0,50 Q 25,70 50,50 T 100,50 T 150,50 T 200,50;
                M 0,50 Q 25,30 50,50 T 100,50 T 150,50 T 200,50" />
    </path>
    <path d="M 0,60 Q 25,40 50,60 T 100,60 T 150,60 T 200,60" stroke={color} strokeWidth="1" fill="none" opacity="0.6">
      <animate attributeName="d" dur="3s" repeatCount="indefinite"
        values="M 0,60 Q 25,40 50,60 T 100,60 T 150,60 T 200,60;
                M 0,60 Q 25,80 50,60 T 100,60 T 150,60 T 200,60;
                M 0,60 Q 25,40 50,60 T 100,60 T 150,60 T 200,60" />
    </path>
  </svg>
)

export default function RemoteUltrasoundPage() {
  const [activeTab, setActiveTab] = useState('realtime')
  const [selectedSession, setSelectedSession] = useState('RU001')
  const [isLive, setIsLive] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [callDuration, setCallDuration] = useState(1122)
  const [bandwidth, setBandwidth] = useState(320)
  const [latency, setLatency] = useState(18)
  const [jitter, setJitter] = useState(5)
  const [packetLoss, setPacketLoss] = useState(0.1)
  // 探头参数
  const [depth, setDepth] = useState(15)
  const [gain, setGain] = useState(72)
  const [frequency, setFrequency] = useState(35)
  const [tgc, setTgc] = useState(5)
  const [searchText, setSearchText] = useState('')

  useEffect(() => {
    const interval = setInterval(() => {
      setBandwidth(b => Math.max(200, Math.min(400, b + Math.floor(Math.random() * 30) - 15)))
      setLatency(l => Math.max(8, Math.min(50, l + Math.floor(Math.random() * 8) - 4)))
      setJitter(j => Math.max(1, Math.min(20, j + Math.floor(Math.random() * 3) - 1)))
      setPacketLoss(p => Math.max(0, Number((p + (Math.random() * 0.4 - 0.2)).toFixed(2))))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>
    if (isLive) {
      timer = setInterval(() => setCallDuration(d => d + 1), 1000)
    }
    return () => clearInterval(timer)
  }, [isLive])

  const fmtTime = (sec: number) => {
    const h = Math.floor(sec / 3600).toString().padStart(2, '0')
    const m = Math.floor((sec % 3600) / 60).toString().padStart(2, '0')
    const s = (sec % 60).toString().padStart(2, '0')
    return `${h}:${m}:${s}`
  }

  const getMeterColor = (pct: number) => {
    if (pct >= 80) return C.success
    if (pct >= 50) return C.warning
    return C.danger
  }

  const selected = REALTIME_SESSIONS.find(s => s.id === selectedSession)
  const filteredRecs = RECORDINGS.filter(r => r.title.includes(searchText) || r.id.includes(searchText))

  return (
    <div style={s.root}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>

      <div style={s.header}>
        <div>
          <h1 style={s.title}>远程超声（实时）</h1>
          <p style={s.subtitle}>5G远程医疗协作平台 · 实时超声图像+操作手法同步 · 探头反控</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ ...s.badge, background: '#f1f5f9', color: C.textLight, padding: '8px 16px', border: 'none', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <RefreshCw size={14} /> 刷新
          </button>
          <button style={{ ...s.badge, background: C.primary, color: C.white, padding: '8px 16px', border: 'none', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={14} /> 新建会诊
          </button>
        </div>
      </div>

      <div style={s.netBar}>
        <Zap size={20} />
        <span style={{ fontWeight: 600 }}>5G网络：</span>
        <span style={{ fontWeight: 700, fontSize: 16 }}>极好（280-350 Mbps）</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 20, fontSize: 13 }}>
          <span>📡 带宽: <strong>{bandwidth} Mbps</strong></span>
          <span>⏱ 延迟: <strong>{latency} ms</strong></span>
          <span>📊 抖动: <strong>{jitter} ms</strong></span>
          <span>📉 丢包: <strong>{packetLoss}%</strong></span>
          <span>🏥 边缘节点: <strong>{CLOUD_STATS.edgeNodes}</strong></span>
        </div>
      </div>

      <div style={s.kpiRow}>
        {[
          { value: REALTIME_SESSIONS.length, label: '进行中会诊', color: C.danger, icon: <Video size={20} /> },
          { value: CLOUD_STATS.activeStreams, label: '云端实时流', color: C.accent, icon: <Cloud size={20} /> },
          { value: CLOUD_STATS.totalSessions, label: '累计会诊', color: C.success, icon: <Activity size={20} /> },
          { value: CLOUD_STATS.totalStorage, label: '云端存储', color: C.purple, icon: <Database size={20} /> },
          { value: `${CLOUD_STATS.cloudSync}%`, label: '云同步率', color: C.warning, icon: <Signal size={20} /> },
        ].map((k, i) => (
          <div key={i} style={s.kpiCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ ...s.kpiValue, color: k.color }}>{k.value}</div>
              <div style={{ color: k.color, opacity: 0.6 }}>{k.icon}</div>
            </div>
            <div style={s.kpiLabel}>{k.label}</div>
          </div>
        ))}
      </div>

      <div style={s.tabRow}>
        {[
          { key: 'realtime', label: '实时会诊', icon: <Video size={14} /> },
          { key: 'control', label: '探头反控', icon: <Sliders size={14} /> },
          { key: 'recording', label: '录播管理', icon: <Play size={14} /> },
          { key: 'cloud', label: '5G云存储', icon: <Cloud size={14} /> },
          { key: 'monitor', label: '网络监控', icon: <Wifi size={14} /> },
        ].map(tab => (
          <button
            key={tab.key}
            style={activeTab === tab.key ? s.tabActive : s.tab}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'realtime' && (
        <div style={{ display: 'grid', gridTemplateColumns: isFullscreen ? '1fr' : '1fr 320px', gap: 20 }}>
          <div style={s.card}>
            <div style={s.cardHeader}>
              <span style={s.cardTitle}>
                <Video size={16} color={C.primary} /> 实时超声会诊
                {isLive && <span style={s.recordingDot} title="直播中"></span>}
              </span>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {REALTIME_SESSIONS.map(r => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedSession(r.id)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 6,
                      border: `1px solid ${r.id === selectedSession ? C.accent : C.border}`,
                      background: r.id === selectedSession ? '#eff6ff' : C.white,
                      color: r.id === selectedSession ? C.accent : C.textLight,
                      cursor: 'pointer',
                      fontSize: 12,
                    }}
                  >
                    {r.patient}
                  </button>
                ))}
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  style={{ padding: '4px 8px', borderRadius: 6, border: `1px solid ${C.border}`, background: C.white, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  {isFullscreen ? <Minimize2 size={14} color={C.textLight} /> : <Maximize2 size={14} color={C.textLight} />}
                </button>
              </div>
            </div>

            <div style={s.quadScreen}>
              <div style={s.quadPane}>
                <span style={s.quadLabel}>🩺 超声图像（实时）</span>
                <WaveAnimation color="#10b981" />
                <div style={{ textAlign: 'center', zIndex: 1 }}>
                  <Activity size={36} color="#334155" />
                  <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 8 }}>B-Mode 实时超声</div>
                  <div style={{ color: '#10b981', fontSize: 11, marginTop: 4 }}>● 直播中</div>
                </div>
                <span style={s.quadParams}>深度:{depth}cm 增益:{gain}</span>
              </div>
              <div style={s.quadPane}>
                <span style={s.quadLabel}>✋ 操作手法同步</span>
                <WaveAnimation color="#3b82f6" />
                <div style={{ textAlign: 'center', zIndex: 1 }}>
                  <Video size={36} color="#334155" />
                  <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 8 }}>探头操作手法</div>
                </div>
                <span style={s.quadParams}>频率:{frequency / 10}MHz</span>
              </div>
              <div style={s.quadPane}>
                <span style={s.quadLabel}>👨‍⚕️ 申请方医师</span>
                <WaveAnimation color="#f59e0b" />
                <div style={{ textAlign: 'center', zIndex: 1 }}>
                  <Camera size={36} color="#334155" />
                  <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 8 }}>{selected?.hospital}</div>
                  <div style={{ color: '#94a3b8', fontSize: 11 }}>{selected?.expert}</div>
                </div>
                <span style={{ ...s.quadLabel, top: 8, left: 10, color: '#10b981', fontSize: 11 }}>● 通话中</span>
              </div>
              <div style={s.quadPane}>
                <span style={s.quadLabel}>👩‍⚕️ 会诊方专家</span>
                <WaveAnimation color="#dc2626" />
                <div style={{ textAlign: 'center', zIndex: 1 }}>
                  <Camera size={36} color="#334155" />
                  <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 8 }}>本院 · 超声科</div>
                  <div style={{ color: '#94a3b8', fontSize: 11 }}>张建国 主任</div>
                </div>
                <span style={{ ...s.quadLabel, top: 8, left: 10, color: '#10b981', fontSize: 11 }}>● 通话中</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 16, padding: '8px 16px', background: '#f8fafc', borderRadius: 6, marginBottom: 12, fontSize: 12, color: C.textLight, alignItems: 'center' }}>
              <span>通话: <strong style={{ color: C.primary, fontFamily: 'monospace', fontSize: 14 }}>{fmtTime(callDuration)}</strong></span>
              <span>·</span>
              <span>深度: <strong style={{ color: C.primary }}>{depth}cm</strong></span>
              <span>增益: <strong style={{ color: C.primary }}>{gain}</strong></span>
              <span>频率: <strong style={{ color: C.primary }}>{(frequency / 10).toFixed(1)}MHz</strong></span>
              <span>TGC: <strong style={{ color: C.primary }}>{tgc}</strong></span>
              <span style={{ marginLeft: 'auto' }}>探头: <strong style={{ color: C.primary }}>凸阵 C5-2</strong></span>
            </div>

            <div style={s.toolBar}>
              <button
                style={isLive ? s.callBtnEnd : s.callBtn}
                onClick={() => setIsLive(!isLive)}
              >
                {isLive ? <><X size={14} /> 结束会诊</> : <><Video size={14} /> 开始会诊</>}
              </button>
              <span style={{ width: 1, background: C.border, margin: '0 4px' }} />
              <button style={s.toolBtn}><Ruler size={14} /> 距离测量</button>
              <button style={s.toolBtn}><Square size={14} /> 面积测量</button>
              <span style={{ width: 1, background: C.border, margin: '0 4px' }} />
              <button style={s.toolBtn}><Camera size={14} /> 冻结</button>
              <button style={s.toolBtn}><Download size={14} /> 截图</button>
              <button style={s.toolBtn}><Save size={14} /> 录制</button>
              <span style={{ width: 1, background: C.border, margin: '0 4px' }} />
              <button style={s.toolBtn} onClick={() => setIsMuted(!isMuted)}>
                {isMuted ? <VolumeX size={14} color={C.danger} /> : <Volume2 size={14} />}
                {isMuted ? '取消静音' : '静音'}
              </button>
            </div>
          </div>

          {!isFullscreen && (
            <div style={s.card}>
              <div style={s.cardHeader}>
                <span style={s.cardTitle}><Monitor size={16} color={C.primary} /> 会诊信息</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ padding: '10px 12px', background: '#f0f9ff', borderRadius: 6, fontSize: 13 }}>
                  <div style={{ color: '#94a3b8', marginBottom: 4 }}>患者</div>
                  <div style={{ fontWeight: 600, color: C.primary, fontSize: 15 }}>{selected?.patient}</div>
                  <div style={{ fontSize: 12, color: C.textLight, marginTop: 2 }}>{selected?.age}岁 · {selected?.gender} · {selected?.exam}</div>
                </div>
                <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: 6, fontSize: 13 }}>
                  <div style={{ color: '#94a3b8', marginBottom: 4 }}>会诊医院</div>
                  <div style={{ fontWeight: 600, color: C.primary }}>{selected?.hospital}</div>
                </div>
                <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: 6, fontSize: 13 }}>
                  <div style={{ color: '#94a3b8', marginBottom: 4 }}>会诊专家</div>
                  <div style={{ fontWeight: 600, color: C.primary }}>{selected?.expert}</div>
                </div>
                <div style={{ padding: '10px 12px', background: isLive ? '#f0fdf4' : '#fef2f2', borderRadius: 6, fontSize: 13 }}>
                  <div style={{ color: '#94a3b8', marginBottom: 4 }}>通话计时</div>
                  <div style={{ fontWeight: 700, fontSize: 22, color: isLive ? C.success : C.textLight, fontFamily: 'monospace' }}>
                    {isLive ? fmtTime(callDuration) : '00:00:00'}
                  </div>
                </div>
                <div style={{ padding: '10px 12px', background: '#fff7ed', borderRadius: 6, fontSize: 12, border: '1px solid #fed7aa' }}>
                  <div style={{ color: C.warning, fontWeight: 600, marginBottom: 4 }}>⚡ 实时状态</div>
                  <div>网络：<strong style={{ color: C.success }}>极好</strong></div>
                  <div>云端：<strong style={{ color: C.success }}>同步中</strong></div>
                  <div>录制：<strong style={{ color: C.danger }}>● 进行中</strong></div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'control' && (
        <div style={s.card}>
          <div style={s.cardHeader}>
            <span style={s.cardTitle}><Sliders size={16} color={C.primary} /> 探头反向控制（专家远程调节超声参数）</span>
            <span style={{ fontSize: 12, color: C.textLight }}>对标：华声"四叶草"5G远程超声</span>
          </div>
          <div style={s.probePanel}>
            <div style={s.probeRow}>
              <div style={s.probeCol}>
                <div style={s.probeLabel}>📏 扫描深度 (cm)</div>
                <input
                  type="range" min="5" max="30" value={depth}
                  onChange={e => setDepth(Number(e.target.value))}
                  style={s.probeSlider}
                />
                <div style={s.probeValue}>{depth} cm</div>
              </div>
              <div style={s.probeCol}>
                <div style={s.probeLabel}>🔆 增益 (Gain)</div>
                <input
                  type="range" min="0" max="100" value={gain}
                  onChange={e => setGain(Number(e.target.value))}
                  style={s.probeSlider}
                />
                <div style={s.probeValue}>{gain}</div>
              </div>
              <div style={s.probeCol}>
                <div style={s.probeLabel}>📡 频率 (×0.1 MHz)</div>
                <input
                  type="range" min="20" max="80" value={frequency}
                  onChange={e => setFrequency(Number(e.target.value))}
                  style={s.probeSlider}
                />
                <div style={s.probeValue}>{(frequency / 10).toFixed(1)} MHz</div>
              </div>
              <div style={s.probeCol}>
                <div style={s.probeLabel}>🎚 TGC时间增益</div>
                <input
                  type="range" min="0" max="10" value={tgc}
                  onChange={e => setTgc(Number(e.target.value))}
                  style={s.probeSlider}
                />
                <div style={s.probeValue}>{tgc}</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
            {[
              { label: '探头型号', value: '凸阵 C5-2' },
              { label: '预设模式', value: '腹部常规' },
              { label: '谐波成像', value: '开启' },
              { label: '空间复合成像', value: '3级' },
              { label: '斑点抑制', value: '2级' },
              { label: '动态范围', value: '65 dB' },
            ].map((p, i) => (
              <div key={i} style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: 6, fontSize: 13 }}>
                <span style={{ color: '#94a3b8' }}>{p.label}：</span>
                <strong style={{ color: C.primary }}>{p.value}</strong>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{ ...s.toolBtn, background: C.primary, color: C.white, border: 'none', padding: '10px 20px' }}>
              <Check size={14} /> 应用参数
            </button>
            <button style={s.toolBtn}>
              <RotateCcw size={14} /> 恢复默认
            </button>
            <button style={s.toolBtn}>
              <Save size={14} /> 存为预设
            </button>
          </div>

          <div style={{ marginTop: 16, padding: '12px 16px', background: '#fff7ed', borderRadius: 8, border: '1px solid #fed7aa', fontSize: 12, color: C.textLight }}>
            <div style={{ fontWeight: 600, color: C.warning, marginBottom: 4 }}>💡 反向控制说明</div>
            专家可通过本界面远程调节申请方超声设备的参数（深度、增益、频率、TGC等），实现"足不出户"远程扫查指导。参数调整延迟 &lt; 100ms。
          </div>
        </div>
      )}

      {activeTab === 'recording' && (
        <div style={s.card}>
          <div style={s.cardHeader}>
            <span style={s.cardTitle}><Play size={16} color={C.primary} /> 录播管理</span>
            <input
              style={{ padding: '8px 12px', borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 13, outline: 'none', width: 220 }}
              placeholder="搜索录播..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
            />
          </div>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>录播ID</th>
                <th style={s.th}>标题</th>
                <th style={s.th}>日期</th>
                <th style={s.th}>时长</th>
                <th style={s.th}>大小</th>
                <th style={s.th}>观看</th>
                <th style={s.th}>专家</th>
                <th style={s.th}>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecs.map(r => (
                <tr key={r.id}>
                  <td style={s.td}><strong style={{ color: C.primary }}>{r.id}</strong></td>
                  <td style={s.td}>{r.title}</td>
                  <td style={s.td}>{r.date}</td>
                  <td style={s.td}><span style={{ fontFamily: 'monospace' }}>{r.duration}</span></td>
                  <td style={s.td}>{r.size}</td>
                  <td style={s.td}>{r.views} 次</td>
                  <td style={s.td}>{r.expert}</td>
                  <td style={s.td}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button style={{ ...s.toolBtn, padding: '4px 8px', fontSize: 12 }}>
                        <Play size={12} /> 播放
                      </button>
                      <button style={{ ...s.toolBtn, padding: '4px 8px', fontSize: 12 }}>
                        <Download size={12} /> 下载
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'cloud' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
            {[
              { value: CLOUD_STATS.totalSessions, label: '累计会诊数', color: C.primary, icon: <Activity size={24} /> },
              { value: CLOUD_STATS.totalDuration, label: '累计时长', color: C.accent, icon: <Clock size={24} /> },
              { value: CLOUD_STATS.totalStorage, label: '总存储量', color: C.purple, icon: <Database size={24} /> },
              { value: `${CLOUD_STATS.cloudSync}%`, label: '云同步率', color: C.success, icon: <Cloud size={24} /> },
            ].map((k, i) => (
              <div key={i} style={s.cloudBox}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: k.color }}>{k.value}</div>
                    <div style={{ fontSize: 13, color: C.textLight }}>{k.label}</div>
                  </div>
                  <div style={{ color: k.color, opacity: 0.6 }}>{k.icon}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={s.card}>
            <div style={s.cardHeader}>
              <span style={s.cardTitle}><Server size={16} color={C.primary} /> 5G边缘节点分布</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {[
                { name: '华东节点（上海）', load: 65, latency: 8, status: 'normal' },
                { name: '华南节点（广州）', load: 78, latency: 12, status: 'normal' },
                { name: '华北节点（北京）', load: 92, latency: 6, status: 'busy' },
                { name: '西南节点（成都）', load: 45, latency: 18, status: 'normal' },
                { name: '华中节点（武汉）', load: 58, latency: 14, status: 'normal' },
                { name: '东北节点（沈阳）', load: 32, latency: 22, status: 'idle' },
                { name: '西北节点（西安）', load: 41, latency: 25, status: 'idle' },
                { name: '华东二节点（杭州）', load: 71, latency: 9, status: 'normal' },
              ].map((n, i) => (
                <div key={i} style={{ padding: 14, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.primary }}>{n.name}</div>
                    <span style={{
                      ...s.badge,
                      background: n.status === 'busy' ? '#fee2e2' : n.status === 'idle' ? '#dbeafe' : '#d1fae5',
                      color: n.status === 'busy' ? C.danger : n.status === 'idle' ? C.accent : C.success,
                    }}>
                      {n.status === 'busy' ? '繁忙' : n.status === 'idle' ? '空闲' : '正常'}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: C.textLight }}>
                    负载: <strong style={{ color: C.primary }}>{n.load}%</strong> · 延迟: <strong style={{ color: C.primary }}>{n.latency}ms</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'monitor' && (
        <div style={s.card}>
          <div style={s.cardHeader}>
            <span style={s.cardTitle}><Wifi size={16} color={C.primary} /> 5G网络质量实时监控</span>
            <span style={{ fontSize: 12, color: C.success, fontWeight: 600 }}>● 网络状态：极好</span>
          </div>

          {[
            { label: '带宽', value: bandwidth, max: 500, unit: 'Mbps' },
            { label: '延迟', value: latency, max: 50, unit: 'ms', inverse: true },
            { label: '抖动', value: jitter, max: 20, unit: 'ms', inverse: true },
            { label: '丢包率', value: packetLoss, max: 5, unit: '%', inverse: true },
          ].map((m, i) => {
            const pct = m.inverse ? Math.max(0, 100 - (m.value / m.max) * 100) : Math.min(100, (m.value / m.max) * 100)
            return (
              <div key={i} style={s.meterRow}>
                <span style={s.meterLabel}>{m.label}</span>
                <div style={s.meterBar}>
                  <div style={{ ...s.meterFill, width: `${pct}%`, background: getMeterColor(pct) }} />
                </div>
                <span style={{ ...s.meterValue, color: getMeterColor(pct) }}>{m.value} {m.unit}</span>
              </div>
            )
          })}

          <div style={{ marginTop: 24, padding: '16px 20px', background: '#fff7ed', borderRadius: 8, border: '1px solid #fed7aa' }}>
            <div style={{ fontWeight: 600, color: C.warning, fontSize: 14, marginBottom: 8 }}>⚡ 自动降质策略</div>
            <div style={{ fontSize: 13, color: C.textLight, lineHeight: 1.6 }}>
              当网络质量下降时，系统自动切换：<br />
              <span style={{ display: 'inline-block', padding: '3px 10px', background: C.success, color: C.white, borderRadius: 4, fontSize: 12, margin: '4px 4px' }}>高清 1080P</span>
              → <span style={{ display: 'inline-block', padding: '3px 10px', background: C.warning, color: C.white, borderRadius: 4, fontSize: 12, margin: '4px 4px' }}>标清 720P</span>
              → <span style={{ display: 'inline-block', padding: '3px 10px', background: C.danger, color: C.white, borderRadius: 4, fontSize: 12, margin: '4px 4px' }}>流畅 480P</span>
              → <span style={{ display: 'inline-block', padding: '3px 10px', background: '#6b7280', color: C.white, borderRadius: 4, fontSize: 12, margin: '4px 4px' }}>纯音频</span>
            </div>
          </div>

          <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {[
              { label: '视频编码', value: 'H.265/HEVC' },
              { label: '帧率', value: '30 fps' },
              { label: '分辨率', value: '1920×1080' },
              { label: '音频编码', value: 'AAC-LC 48kHz' },
              { label: '传输协议', value: 'WebRTC/SRTP' },
              { label: '信令协议', value: 'SIP over WS' },
              { label: '抗丢包', value: 'FEC+ARQ' },
              { label: '端到端延迟', value: '< 200ms' },
            ].map((p, i) => (
              <div key={i} style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: 6, fontSize: 12 }}>
                <span style={{ color: '#94a3b8' }}>{p.label}：</span>
                <strong style={{ color: C.primary }}>{p.value}</strong>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
