// @ts-nocheck
// ============================================================
// G003 超声RIS系统 - 科室运营大屏 v0.2.0
// 超声科运营指挥中心 · 实时数据 · 大屏展示
// ============================================================
import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Activity, Users, Stethoscope, Clock, AlertTriangle,
  CheckCircle, RefreshCw, Maximize2, TrendingUp,
  Monitor, Wifi, WifiOff, Wrench, Scissors, CalendarClock,
  Bell, AlertCircle, Plus, FileText
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from 'recharts'
import ReactECharts from 'echarts-for-react'

// ---------- 颜色常量 ----------
const C = {
  bg: '#0f172a',
  card: '#1e293b',
  cardBorder: '#334155',
  text: '#f1f5f9',
  textMuted: '#94a3b8',
  blue: '#3b82f6',
  green: '#22c55e',
  yellow: '#eab308',
  red: '#ef4444',
  purple: '#8b5cf6',
  teal: '#14b8a6',
  orange: '#f97316',
}

// ---------- 模拟数据生成 ----------
const ROOMS = ['检查室1', '检查室2', '检查室3', '检查室4', '检查室5', '检查室6']
const ROOM_STATES = ['空闲', '检查中', '等待中']
const ROOM_COLORS = { '空闲': C.green, '检查中': C.yellow, '等待中': C.red }

const generateRoomData = () =>
  ROOMS.map((name) => ({
    name,
    state: ROOM_STATES[Math.floor(Math.random() * 3)],
  }))

const DEVICES = [
  { name: '彩超仪 A', status: '在线' },
  { name: '彩超仪 B', status: '在线' },
  { name: '便携超声 A', status: '在线' },
  { name: '床旁超声 B', status: '维护中' },
  { name: '介入超声', status: '离线' },
]

const CRITICAL_ALERTS = [
  { id: 1, patient: '王建国', exam: '腹部超声', item: '肝功能异常', time: '10:32', level: '危急' },
  { id: 2, patient: '李红梅', exam: '心血管超声', item: '肌钙蛋白升高', time: '09:15', level: '危急' },
  { id: 3, patient: '张伟', exam: '妇产科超声', item: '胎心率异常', time: '08:45', level: '危急' },
  { id: 4, patient: '赵丽华', exam: '浅表器官', item: '结节伴钙化', time: '11:20', level: '危急' },
]

const SURGERIES = [
  { id: 1, patient: '孙中山', type: '超声引导下穿刺活检', doctor: '李明辉', time: '09:00', status: '进行中' },
  { id: 2, patient: '周婷', type: '超声引导下引流术', doctor: '王晓燕', time: '10:30', status: '待开始' },
  { id: 3, patient: '吴磊', type: '超声造影检查', doctor: '张伟', time: '14:00', status: '已预约' },
]

const generateRealtimeData = () => {
  const now = new Date()
  const h = now.getHours().toString().padStart(2, '0')
  const m = now.getMinutes().toString().padStart(2, '0')
  return {
    time: `${h}:${m}`,
    value: Math.floor(Math.random() * 30 + 20),
  }
}

// ---------- 样式 ----------
const s: Record<string, React.CSSProperties> = {
  root: { background: C.bg, minHeight: '100vh', color: C.text, padding: '20px 24px' },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 24, paddingBottom: 16, borderBottom: `1px solid ${C.cardBorder}`,
  },
  title: { fontSize: 28, fontWeight: 800, color: C.text, margin: 0, letterSpacing: 2 },
  subtitle: { fontSize: 13, color: C.textMuted, marginTop: 4 },
  headerBtns: { display: 'flex', gap: 8 },
  // 通用卡片
  card: {
    background: C.card, borderRadius: 12, padding: 20,
    border: `1px solid ${C.cardBorder}`,
  },
  cardTitle: {
    fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 16,
    display: 'flex', alignItems: 'center', gap: 8,
  },
  cardIcon: { color: C.textMuted },
  // 顶部统计行
  topStats: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 },
  topStatCard: {
    background: C.card, borderRadius: 12, padding: '20px 24px',
    border: `1px solid ${C.cardBorder}`, display: 'flex',
    alignItems: 'center', gap: 16,
  },
  topStatIcon: {
    width: 52, height: 52, borderRadius: 12,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  topStatValue: { fontSize: 32, fontWeight: 800, color: C.text, lineHeight: 1.1 },
  topStatLabel: { fontSize: 12, color: C.textMuted, marginTop: 4 },
  // 主内容区 3列
  mainGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 },
  // 检查室网格
  roomGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 },
  roomCard: { borderRadius: 10, padding: '16px', display: 'flex', flexDirection: 'column', gap: 8 },
  roomName: { fontSize: 14, fontWeight: 600, color: C.text },
  roomState: { fontSize: 20, fontWeight: 800, color: C.text },
  roomDot: { width: 10, height: 10, borderRadius: '50%' },
  // 危急值列表
  criticalList: { display: 'flex', flexDirection: 'column', gap: 8 },
  criticalItem: {
    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: 8, padding: '12px 16px', display: 'flex',
    justifyContent: 'space-between', alignItems: 'center',
  },
  criticalLeft: { display: 'flex', flexDirection: 'column', gap: 2 },
  criticalPatient: { fontSize: 13, fontWeight: 600, color: C.text },
  criticalExam: { fontSize: 11, color: C.textMuted },
  criticalRight: { textAlign: 'right' as const },
  criticalItem2: { fontSize: 12, fontWeight: 600, color: C.red },
  criticalTime: { fontSize: 11, color: C.textMuted, marginTop: 2 },
  // 手术列表
  surgeryItem: {
    background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
    borderRadius: 8, padding: '12px 16px', marginBottom: 8,
  },
  surgeryTop: { display: 'flex', justifyContent: 'space-between', marginBottom: 4 },
  surgeryPatient: { fontSize: 13, fontWeight: 600, color: C.text },
  surgeryType: { fontSize: 11, color: C.blue },
  surgeryBottom: { display: 'flex', justifyContent: 'space-between', fontSize: 11, color: C.textMuted },
  // 底部分区
  bottomGrid: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 16 },
  // 按钮
  btn: {
    padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
    fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
  },
  btnOutline: {
    background: 'transparent', border: `1px solid ${C.cardBorder}`, color: C.textMuted,
  },
  btnPrimary: {
    background: C.blue, color: '#fff',
  },
  // 全屏
  fullscreen: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, overflow: 'auto' },
}

// ---------- 组件 ----------
const SectionTitle = ({ icon: Icon, title }: { icon: any; title: string }) => (
  <div style={s.cardTitle}>
    <Icon size={16} style={s.cardIcon} />
    {title}
  </div>
)

export default function DashboardPage() {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [onDuty, setOnDuty] = useState({ doctors: 8, nurses: 12 })
  const [examProgress, setExamProgress] = useState({ completed: 42, inProgress: 8, pending: 12 })
  const [rooms, setRooms] = useState(generateRoomData())
  const [realtimeChart, setRealtimeChart] = useState(() => {
    const arr = []
    for (let i = 23; i >= 0; i--) {
      const t = new Date(Date.now() - i * 60000)
      arr.push({
        time: `${t.getHours().toString().padStart(2, '0')}:${t.getMinutes().toString().padStart(2, '0')}`,
        value: Math.floor(Math.random() * 30 + 20),
      })
    }
    return arr
  })
  const [hourlyData] = useState([
    { hour: '08:00', count: 12 }, { hour: '09:00', count: 22 },
    { hour: '10:00', count: 28 }, { hour: '11:00', count: 24 },
    { hour: '12:00', count: 10 }, { hour: '13:00', count: 18 },
    { hour: '14:00', count: 26 }, { hour: '15:00', count: 30 },
    { hour: '16:00', count: 22 }, { hour: '17:00', count: 16 },
  ])
  const [doctorAttendance] = useState([
    { name: '出勤', value: 8 }, { name: '休息', value: 2 },
  ])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const refresh = useCallback(() => {
    setLastUpdate(new Date())
    setOnDuty({ doctors: Math.floor(Math.random() * 4) + 7, nurses: Math.floor(Math.random() * 4) + 11 })
    setExamProgress({
      completed: Math.floor(Math.random() * 10) + 38,
      inProgress: Math.floor(Math.random() * 6) + 4,
      pending: Math.floor(Math.random() * 8) + 8,
    })
    setRooms(generateRoomData())
  }, [])

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setRealtimeChart((prev) => {
        const next = [...prev.slice(1)]
        next.push(generateRealtimeData())
        return next
      })
    }, 5000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  const toggleFullscreen = () => setIsFullscreen((v) => !v)

  // ECharts 环形进度图
  const ringOption = {
    series: [{
      type: 'gauge',
      startAngle: 90,
      endAngle: -270,
      radius: '90%',
      pointer: { show: false },
      progress: {
        show: true,
        overlap: false,
        roundCap: true,
        clip: false,
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [
              { offset: 0, color: C.green },
              { offset: 0.5, color: C.yellow },
              { offset: 1, color: C.red },
            ],
          },
        },
      },
      axisLine: { lineStyle: { width: 14, color: [[1, C.cardBorder]] } },
      splitLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false },
      data: [{ value: Math.round((examProgress.completed / (examProgress.completed + examProgress.inProgress + examProgress.pending)) * 100), name: '完成率' }],
      title: { show: false },
      detail: {
        fontSize: 28, color: C.text, fontWeight: 800,
        offsetCenter: [0, 0],
        formatter: '{value}%',
      },
    }],
  }

  // ECharts 仪表盘（设备状态）
  const gaugeOption = (val: number, color: string) => ({
    series: [{
      type: 'gauge',
      startAngle: 200,
      endAngle: -20,
      min: 0, max: 100,
      radius: '100%',
      pointer: { show: false },
      progress: { show: false },
      axisLine: {
        lineStyle: { width: 6, color: [[1, color]] },
      },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },
      data: [{ value: val }],
      detail: {
        fontSize: 14, color: C.text, fontWeight: 700,
        offsetCenter: [0, 0],
        formatter: '{value}%',
      },
      title: { show: false },
    }],
  })

  // 24小时实时折线图
  const realtimeOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis', backgroundColor: C.card,
      borderColor: C.cardBorder, textStyle: { color: C.text, fontSize: 12 },
    },
    grid: { top: 20, right: 20, bottom: 30, left: 50 },
    xAxis: {
      type: 'category', data: realtimeChart.map((d) => d.time),
      axisLine: { lineStyle: { color: C.cardBorder } },
      axisLabel: { color: C.textMuted, fontSize: 10, interval: 3 },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value', min: 0, max: 60,
      axisLine: { show: false },
      splitLine: { lineStyle: { color: C.cardBorder, type: 'dashed' } },
      axisLabel: { color: C.textMuted, fontSize: 10 },
    },
    series: [{
      type: 'line',
      data: realtimeChart.map((d) => d.value),
      smooth: true,
      lineStyle: { color: C.blue, width: 2 },
      areaStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(59,130,246,0.4)' },
            { offset: 1, color: 'rgba(59,130,246,0)' },
          ],
        },
      },
      symbol: 'none',
    }],
  }

  // 当日各时段柱状图
  const barOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis', backgroundColor: C.card,
      borderColor: C.cardBorder, textStyle: { color: C.text, fontSize: 12 },
    },
    grid: { top: 10, right: 10, bottom: 30, left: 40 },
    xAxis: {
      type: 'category', data: hourlyData.map((d) => d.hour),
      axisLine: { lineStyle: { color: C.cardBorder } },
      axisLabel: { color: C.textMuted, fontSize: 10 },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: C.cardBorder, type: 'dashed' } },
      axisLabel: { color: C.textMuted, fontSize: 10 },
    },
    series: [{
      type: 'bar',
      data: hourlyData.map((d) => d.count),
      itemStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: C.blue },
            { offset: 1, color: 'rgba(59,130,246,0.3)' },
          ],
        },
        borderRadius: [4, 4, 0, 0],
      },
    }],
  }

  // 医生出勤率环形图
  const attendanceOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item', backgroundColor: C.card,
      borderColor: C.cardBorder, textStyle: { color: C.text, fontSize: 12 },
    },
    series: [{
      type: 'pie',
      radius: ['50%', '75%'],
      avoidLabelOverlap: false,
      label: { show: false },
      data: [
        { value: doctorAttendance[0].value, name: '出勤', itemStyle: { color: C.green } },
        { value: doctorAttendance[1].value, name: '休息', itemStyle: { color: C.cardBorder } },
      ],
    }],
  }

  const rootStyle = isFullscreen ? s.fullscreen : s.root
  const updateStr = `${lastUpdate.getHours().toString().padStart(2, '0')}:${lastUpdate.getMinutes().toString().padStart(2, '0')}:${lastUpdate.getSeconds().toString().padStart(2, '0')}`

  return (
    <div style={rootStyle}>
      {/* 顶部标题栏 */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>超声科运营指挥中心</h1>
          <p style={s.subtitle}>
            实时监控 · 数据驱动 · 智慧管理
            <span style={{ marginLeft: 16, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: C.green }} />
              <span style={{ color: C.green, fontSize: 12 }}>系统正常 · 更新 {updateStr}</span>
            </span>
          </p>
        </div>
        <div style={s.headerBtns}>
          <button style={{ ...s.btn, ...s.btnOutline }} onClick={refresh}>
            <RefreshCw size={14} /> 刷新数据
          </button>
          <button style={{ ...s.btn, ...s.btnPrimary }} onClick={toggleFullscreen}>
            <Maximize2 size={14} /> {isFullscreen ? '退出全屏' : '全屏模式'}
          </button>
        </div>
      </div>

      {/* 顶部统计卡片 */}
      <div style={s.topStats}>
        <div style={s.topStatCard}>
          <div style={{ ...s.topStatIcon, background: 'rgba(59,130,246,0.15)' }}>
            <Stethoscope size={24} color={C.blue} />
          </div>
          <div>
            <div style={s.topStatValue}>{onDuty.doctors}</div>
            <div style={s.topStatLabel}>在岗医生</div>
          </div>
        </div>
        <div style={s.topStatCard}>
          <div style={{ ...s.topStatIcon, background: 'rgba(20,184,166,0.15)' }}>
            <Users size={24} color={C.teal} />
          </div>
          <div>
            <div style={s.topStatValue}>{onDuty.nurses}</div>
            <div style={s.topStatLabel}>在岗护士</div>
          </div>
        </div>
        <div style={s.topStatCard}>
          <div style={{ ...s.topStatIcon, background: 'rgba(34,197,94,0.15)' }}>
            <CheckCircle size={24} color={C.green} />
          </div>
          <div>
            <div style={s.topStatValue}>{examProgress.completed}</div>
            <div style={s.topStatLabel}>今日已完成</div>
          </div>
        </div>
        <div style={s.topStatCard}>
          <div style={{ ...s.topStatIcon, background: 'rgba(239,68,68,0.15)' }}>
            <AlertCircle size={24} color={C.red} />
          </div>
          <div>
            <div style={s.topStatValue}>{CRITICAL_ALERTS.length}</div>
            <div style={s.topStatLabel}>危急值预警</div>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div style={s.mainGrid}>
        {/* 左：今日实时检查进度 环形图 */}
        <div style={s.card}>
          <SectionTitle icon={Activity} title="今日实时检查进度" />
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <ReactECharts option={ringOption} style={{ height: 180, width: 180 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: '已完成', value: examProgress.completed, color: C.green },
                { label: '进行中', value: examProgress.inProgress, color: C.yellow },
                { label: '待检查', value: examProgress.pending, color: C.red },
              ].map((item) => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: item.color }} />
                  <span style={{ fontSize: 13, color: C.textMuted, width: 50 }}>{item.label}</span>
                  <span style={{ fontSize: 18, fontWeight: 700, color: C.text }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 中：各检查室实时状态 */}
        <div style={s.card}>
          <SectionTitle icon={Monitor} title="各检查室实时状态" />
          <div style={s.roomGrid}>
            {rooms.map((room) => (
              <div key={room.name} style={{
                ...s.roomCard,
                background: `rgba(${ROOM_COLORS[room.state] === C.green ? '34,197,94' : ROOM_COLORS[room.state] === C.yellow ? '234,179,8' : '239,68,68'},0.1)`,
                border: `1px solid ${ROOM_COLORS[room.state]}33`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={s.roomName}>{room.name}</span>
                  <span style={{ ...s.roomDot, background: ROOM_COLORS[room.state] }} />
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: ROOM_COLORS[room.state] }}>
                  {room.state}
                </div>
                <div style={{ fontSize: 11, color: C.textMuted }}>
                  {room.state === '空闲' ? '可接诊' : room.state === '检查中' ? '检查进行中' : '等待患者'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 右：设备运行状态 */}
        <div style={s.card}>
          <SectionTitle icon={Wifi} title="设备运行状态" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {DEVICES.map((device) => {
              const statusColor = device.status === '在线' ? C.green : device.status === '维护中' ? C.yellow : C.red
              const usageVal = device.status === '在线' ? Math.floor(Math.random() * 40) + 60 : device.status === '维护中' ? 0 : 0
              return (
                <div key={device.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                    background: statusColor,
                    boxShadow: `0 0 6px ${statusColor}`,
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 13, color: C.text }}>{device.name}</span>
                      <span style={{ fontSize: 12, color: statusColor, fontWeight: 600 }}>{device.status}</span>
                    </div>
                    <div style={{ background: C.cardBorder, borderRadius: 4, height: 6, overflow: 'hidden' }}>
                      <div style={{
                        width: `${usageVal}%`, height: '100%',
                        background: `linear-gradient(90deg, ${statusColor}88, ${statusColor})`,
                        borderRadius: 4,
                        transition: 'width 0.5s',
                      }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 底部分区 */}
      <div style={s.bottomGrid}>
        {/* 左：24小时实时曲线 + 当日各时段柱状图 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={s.card}>
            <SectionTitle icon={TrendingUp} title="24小时检查量实时曲线（每5秒刷新）" />
            <ReactECharts option={realtimeOption} style={{ height: 200 }} />
          </div>
          <div style={s.card}>
            <SectionTitle icon={Clock} title="当日各时段检查量" />
            <ReactECharts option={barOption} style={{ height: 180 }} />
          </div>
        </div>

        {/* 中：今日危急值预警 */}
        <div style={s.card}>
          <SectionTitle icon={Bell} title="今日危急值预警" />
          <div style={s.criticalList}>
            {CRITICAL_ALERTS.map((alert) => (
              <div key={alert.id} style={s.criticalItem}>
                <div style={s.criticalLeft}>
                  <span style={s.criticalPatient}>{alert.patient}</span>
                  <span style={s.criticalExam}>{alert.exam} · {alert.item}</span>
                </div>
                <div style={s.criticalRight}>
                  <div style={s.criticalItem2}>{alert.level}</div>
                  <div style={s.criticalTime}>{alert.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 右：手术/介入超声 + 医生出勤率 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={s.card}>
            <SectionTitle icon={Scissors} title="今日手术/介入超声" />
            {SURGERIES.map((surgery) => (
              <div key={surgery.id} style={s.surgeryItem}>
                <div style={s.surgeryTop}>
                  <span style={s.surgeryPatient}>{surgery.patient}</span>
                  <span style={{
                    fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 8,
                    background: surgery.status === '进行中' ? 'rgba(239,68,68,0.2)' :
                      surgery.status === '待开始' ? 'rgba(234,179,8,0.2)' : 'rgba(59,130,246,0.2)',
                    color: surgery.status === '进行中' ? C.red :
                      surgery.status === '待开始' ? C.yellow : C.blue,
                  }}>
                    {surgery.status}
                  </span>
                </div>
                <div style={s.surgeryType}>{surgery.type}</div>
                <div style={s.surgeryBottom}>
                  <span>👨‍⚕️ {surgery.doctor}</span>
                  <span>⏰ {surgery.time}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={s.card}>
            <SectionTitle icon={Users} title="医生出勤率" />
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <ReactECharts option={attendanceOption} style={{ height: 120, width: 120 }} />
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: C.green }}>{doctorAttendance[0].value}人</div>
                <div style={{ fontSize: 12, color: C.textMuted }}>已出勤 / 共{doctorAttendance[0].value + doctorAttendance[1].value}人</div>
                <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>出勤率 {Math.round(doctorAttendance[0].value / (doctorAttendance[0].value + doctorAttendance[1].value) * 100)}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
