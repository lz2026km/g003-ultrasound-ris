// ============================================================
// G004 内镜管理系统 - 洗消追溯增强页面
// 超越美迪康基础版：全流程追溯+设备管理+质控预警
// ============================================================
import { useState, useMemo } from 'react'
import {
  Search, Calendar, Clock, User, Activity, AlertTriangle,
  Package, Droplets, Wind, Box, ClipboardCheck, CheckCircle,
  XCircle, RefreshCw, Eye, Filter, TrendingUp, Wrench,
  Monitor, AlertCircle, ScanLine, BarChart3, Plus
} from 'lucide-react'

// ---------- 数据类型 ----------
type DisinfectionStepStatus = 'qualified' | 'unqualified' | 'abnormal' | 'pending'

interface DisinfectionStep {
  name: string
  timestamp: string
  operator: string
  equipment: string
  result: DisinfectionStepStatus
  details?: Record<string, string | number | undefined>
}

interface DisinfectionRecord {
  id: string
  endoscopeId: string
  endoscopeModel: string
  patientName: string
  procedureType: string
  startTime: string
  endTime: string
  steps: DisinfectionStep[]
  finalResult: 'qualified' | 'unqualified' | 'abnormal'
  operator: string
}

interface EndoscopeUsage {
  id: string
  endoscopeId: string
  model: string
  patientName: string
  checkType: string
  useTime: string
  status: 'in_use' | 'pending' | 'cleaning' | 'ready' | 'maintenance'
  nextCleanTime: string
  useCount: number
}

interface DisinfectionEquipment {
  id: string
  name: string
  model: string
  todayUses: number
  weekUses: number
  lastMaintenance: string
  status: 'running' | 'idle' | 'maintenance' | 'fault'
}

interface MaintenanceRecord {
  id: string
  equipmentId: string
  equipmentName: string
  maintenanceType: string
  date: string
  engineer: string
  result: string
}

interface QualityAlert {
  id: string
  alertTime: string
  endoscopeId: string
  alertType: 'concentration' | 'time' | 'equipment' | 'missing'
  detail: string
  handleStatus: 'pending' | 'processing' | 'resolved'
}

// ---------- 模拟数据 ----------
const generateDisinfectionRecords = (): DisinfectionRecord[] => {
  const stepsTemplate = [
    { name: '测漏', icon: ScanLine },
    { name: '预处理', icon: Droplets },
    { name: '清洗', icon: Package, sub: '(机器)' },
    { name: '消毒', icon: Activity, sub: '(高水平)' },
    { name: '干燥', icon: Wind },
    { name: '存储', icon: Box },
    { name: '放行', icon: ClipboardCheck },
  ]
  const results: DisinfectionStepStatus[] = ['qualified', 'qualified', 'qualified', 'qualified', 'qualified', 'qualified', 'qualified']

  const records: DisinfectionRecord[] = []
  const operators = ['张伟', '李娜', '王芳', '刘洋', '陈静']
  const endoscopeModels = ['Olympus CF-HQ290', 'Fujifilm EC-601WM', 'Pentax ED-3490TK', 'Boston Scientific 38032']
  const patients = ['王建国', '李秀英', '张德明', '刘玉兰', '陈志强', '杨桂花', '赵文博', '吴晓燕', '周伟平', '郑美华']
  const procedures = ['胃镜检查', '结肠镜检查', '十二指肠镜', '支气管镜', '超声内镜']

  for (let i = 0; i < 50; i++) {
    const baseTime = new Date(2026, 3, 28 - Math.floor(i / 5), 8 + (i % 12), 30 - (i % 30))
    const endoscopeModel = endoscopeModels[i % endoscopeModels.length]
    const steps: DisinfectionStep[] = stepsTemplate.map((step, idx) => {
      const stepTime = new Date(baseTime.getTime() + idx * 25 * 60000)
      const hasAbnormal = i === 3 || i === 15 || i === 27
      const stepResult = hasAbnormal && idx === 3 ? 'abnormal' : results[idx]
      return {
        name: step.name + (step.sub || ''),
        timestamp: stepTime.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
        operator: operators[idx % operators.length],
        equipment: `洗消机-${(i % 4) + 1}号`,
        result: stepResult,
        details: step.name === '测漏' ? { pressure: 180 + (i % 20) } :
                 step.name === '预处理' ? { temperature: 25 + (i % 10), detergent: '中性' } :
                 step.name === '清洗' ? { waterTemp: 35 + (i % 8), cycle: '标准' } :
                 step.name === '消毒' ? { disinfectant: '戊二醛', concentration: 2.0 + (i % 10) * 0.1, time: 20 } :
                 step.name === '干燥' ? { duration: 15 + (i % 10) } :
                 step.name === '存储' ? { cabinetTemp: 22, humidity: 45 } :
                 { approvalDoctor: operators[idx % operators.length] }
      }
    })

    records.push({
      id: `DTR-${String(1000 + i).padStart(5, '0')}`,
      endoscopeId: `ES-${String(100 + (i % 12)).padStart(4, '0')}`,
      endoscopeModel,
      patientName: patients[i % patients.length],
      procedureType: procedures[i % procedures.length],
      startTime: baseTime.toLocaleString('zh-CN'),
      endTime: new Date(baseTime.getTime() + stepsTemplate.length * 25 * 60000).toLocaleString('zh-CN'),
      steps,
      finalResult: steps.some(s => s.result === 'abnormal') ? 'abnormal' : 'qualified',
      operator: operators[i % operators.length],
    })
  }
  return records
}

const generateEndoscopeUsage = (): EndoscopeUsage[] => {
  const usage: EndoscopeUsage[] = []
  const models = ['Olympus CF-HQ290', 'Fujifilm EC-601WM', 'Pentax ED-3490TK', 'Boston Scientific 38032']
  const patients = ['王建国', '李秀英', '张德明', '刘玉兰', '陈志强', '杨桂花', '赵文博', '吴晓燕', '周伟平', '郑美华', '孙立新', '朱红梅', '马文涛', '胡丽娜', '郭永强', '林晓峰', '何秀英', '高建国', '罗玉兰', '谢志明']
  const checkTypes = ['胃镜检查', '结肠镜检查', '十二指肠镜', '支气管镜', '超声内镜', 'ERCP', 'EUS']
  const statuses: EndoscopeUsage['status'][] = ['in_use', 'pending', 'cleaning', 'ready', 'maintenance']

  for (let i = 0; i < 20; i++) {
    const baseTime = new Date(2026, 3, 28, 8 + i, 30)
    usage.push({
      id: `EU-${String(2000 + i).padStart(5, '0')}`,
      endoscopeId: `ES-${String(100 + (i % 12)).padStart(4, '0')}`,
      model: models[i % models.length],
      patientName: patients[i],
      checkType: checkTypes[i % checkTypes.length],
      useTime: baseTime.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
      status: statuses[i % statuses.length],
      nextCleanTime: new Date(baseTime.getTime() + 45 * 60000).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
      useCount: 25 + (i * 3) % 40,
    })
  }
  return usage
}

const generateEquipment = (): DisinfectionEquipment[] => [
  { id: 'EQ-001', name: '奥林巴斯 OER-AW', model: 'OER-AW', todayUses: 12, weekUses: 68, lastMaintenance: '2026-04-20', status: 'running' },
  { id: 'EQ-002', name: '富士通 ED-560', model: 'ED-560', todayUses: 8, weekUses: 45, lastMaintenance: '2026-04-25', status: 'idle' },
  { id: 'EQ-003', name: '宾得 D-655', model: 'D-655', todayUses: 15, weekUses: 72, lastMaintenance: '2026-04-15', status: 'maintenance' },
  { id: 'EQ-004', name: '波科 Waltham', model: 'Waltham-380', todayUses: 5, weekUses: 32, lastMaintenance: '2026-04-28', status: 'fault' },
]

const generateMaintenanceRecords = (): MaintenanceRecord[] => {
  const records: MaintenanceRecord[] = []
  const equipment = ['奥林巴斯 OER-AW', '富士通 ED-560', '宾得 D-655', '波科 Waltham']
  const types = ['日常保养', '故障维修', '性能校准', '滤芯更换', '高温灭菌', '探头更换', '管路清洗', '年度检修']
  const engineers = ['李工程师', '王技师', '张高级工程师', '刘技师', '陈工程师', '周技师', '吴高级工程师', '郑技师']
  const results = ['完成', '完成', '完成', '完成', '完成', '完成', '完成', '完成']

  for (let i = 0; i < 8; i++) {
    records.push({
      id: `MR-${String(3000 + i).padStart(5, '0')}`,
      equipmentId: `EQ-00${i % 4 + 1}`,
      equipmentName: equipment[i % equipment.length],
      maintenanceType: types[i],
      date: new Date(2026, 3, 28 - i * 3).toLocaleDateString('zh-CN'),
      engineer: engineers[i],
      result: results[i],
    })
  }
  return records
}

const generateQualityAlerts = (): QualityAlert[] => {
  const alerts: QualityAlert[] = []
  const endoscopeIds = ['ES-0100', 'ES-0103', 'ES-0105', 'ES-0107', 'ES-0109', 'ES-0111']
  const alertTypes: QualityAlert['alertType'][] = ['concentration', 'time', 'equipment', 'missing']
  const alertTypeNames = { concentration: '浓度不达标', time: '时间不足', equipment: '设备故障', missing: '记录缺失' }
  const details = {
    concentration: '消毒剂浓度2.1%低于标准值2.2%',
    time: '高水平消毒时间18分钟低于标准20分钟',
    equipment: '洗消机2号高温灭菌模块异常',
    missing: '2026-04-26 14:30预处理记录缺失',
  }
  const handleStatuses: QualityAlert['handleStatus'][] = ['pending', 'processing', 'resolved']

  for (let i = 0; i < 12; i++) {
    alerts.push({
      id: `QA-${String(4000 + i).padStart(5, '0')}`,
      alertTime: new Date(2026, 3, 28, 8 + Math.floor(i / 2), 30 + (i % 3) * 10).toLocaleString('zh-CN'),
      endoscopeId: endoscopeIds[i % endoscopeIds.length],
      alertType: alertTypes[i % alertTypes.length],
      detail: details[alertTypes[i % alertTypes.length]],
      handleStatus: handleStatuses[i % handleStatuses.length],
    })
  }
  return alerts
}

// ---------- 样式定义 ----------
const s: Record<string, React.CSSProperties> = {
  page: { padding: '20px', background: '#f5f7fa', minHeight: '100vh' },
  header: { marginBottom: 20 },
  titleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 18, fontWeight: 700, color: '#1a3a5c' },
  subtitle: { fontSize: 12, color: '#64748b', marginTop: 2 },
  statCards: { display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 },
  statCard: {
    background: '#fff', borderRadius: 10, padding: '14px 18px', flex: 1, minWidth: 150,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 6,
  },
  statLabel: { fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 },
  statValue: { fontSize: 22, fontWeight: 700, color: '#1a3a5c' },
  statValueAlert: { color: '#dc2626' },
  section: { background: '#fff', borderRadius: 10, padding: 20, marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  sectionTitle: { fontSize: 15, fontWeight: 700, color: '#1a3a5c', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 },
  traceContainer: { display: 'flex', gap: 16 },
  filterPanel: { width: 240, flexShrink: 0 },
  filterGroup: { marginBottom: 16 },
  filterLabel: { fontSize: 12, color: '#64748b', marginBottom: 6, fontWeight: 600 },
  filterInput: {
    width: '100%', border: '1px solid #e2e8f0', borderRadius: 6, padding: '8px 10px',
    fontSize: 13, color: '#334155', background: '#f8fafc', outline: 'none', boxSizing: 'border-box',
  },
  filterSelect: {
    width: '100%', border: '1px solid #e2e8f0', borderRadius: 6, padding: '8px 10px',
    fontSize: 13, color: '#334155', background: '#f8fafc', outline: 'none', cursor: 'pointer',
  },
  timelinePanel: { flex: 1 },
  recordCard: {
    border: '1px solid #e2e8f0', borderRadius: 8, marginBottom: 12, overflow: 'hidden', cursor: 'pointer',
    transition: 'box-shadow 0.2s',
  },
  recordCardHover: { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
  recordHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0',
  },
  recordInfo: { display: 'flex', flexDirection: 'column', gap: 2 },
  recordId: { fontSize: 14, fontWeight: 700, color: '#1a3a5c' },
  recordModel: { fontSize: 12, color: '#64748b' },
  recordMeta: { display: 'flex', gap: 16, fontSize: 12, color: '#64748b' },
  recordResult: {
    padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600,
    display: 'flex', alignItems: 'center', gap: 4,
  },
  recordExpanded: { padding: 16 },
  timelineSvg: { width: '100%', height: 100, marginBottom: 12 },
  stepDetails: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 12 },
  stepDetailItem: { background: '#f8fafc', padding: 10, borderRadius: 6, textAlign: 'center' },
  stepDetailLabel: { fontSize: 10, color: '#64748b', marginBottom: 4 },
  stepDetailValue: { fontSize: 13, fontWeight: 600, color: '#1a3a5c' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    background: '#f8fafc', padding: '10px 12px', textAlign: 'left',
    fontSize: 12, fontWeight: 600, color: '#64748b', borderBottom: '2px solid #e2e8f0',
  },
  td: {
    padding: '10px 12px', fontSize: 13, color: '#334155', borderBottom: '1px solid #f1f5f9',
  },
  statusTag: { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600 },
  equipmentGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 },
  equipmentCard: {
    border: '1px solid #e2e8f0', borderRadius: 8, padding: 16, background: '#fff',
  },
  equipmentHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  equipmentName: { fontSize: 14, fontWeight: 700, color: '#1a3a5c' },
  equipmentStatus: { padding: '3px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600 },
  equipmentStats: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 },
  equipmentStat: { background: '#f8fafc', padding: 8, borderRadius: 6 },
  equipmentStatLabel: { fontSize: 10, color: '#64748b' },
  equipmentStatValue: { fontSize: 14, fontWeight: 700, color: '#1a3a5c' },
  alertRow: {
    display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f1f5f9',
  },
  alertTime: { width: 140, fontSize: 12, color: '#64748b' },
  alertEndoscope: { width: 100, fontSize: 13, fontWeight: 600, color: '#1a3a5c' },
  alertType: { width: 100 },
  alertDetail: { flex: 1, fontSize: 12, color: '#475569' },
  alertStatus: { width: 80, textAlign: 'center' },
  badge: { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600 },
  // Status colors
  inUse: { background: '#dbeafe', color: '#1d4ed8' },
  pending: { background: '#fef3c7', color: '#92400e' },
  cleaning: { background: '#ffe4c4', color: '#c2410c' },
  ready: { background: '#dcfce7', color: '#166534' },
  maintenance: { background: '#fee2e2', color: '#dc2626' },
  running: { background: '#dcfce7', color: '#166534' },
  idle: { background: '#dbeafe', color: '#1d4ed8' },
  fault: { background: '#fee2e2', color: '#dc2626' },
  concentration: { background: '#fee2e2', color: '#dc2626' },
  time: { background: '#ffe4c4', color: '#c2410c' },
  equipmentAlert: { background: '#fef3c7', color: '#92400e' },
  missing: { background: '#dbeafe', color: '#1d4ed8' },
  pendingHandle: { background: '#fee2e2', color: '#dc2626' },
  processing: { background: '#fef3c7', color: '#92400e' },
  resolved: { background: '#dcfce7', color: '#166534' },
  qualified: { background: '#dcfce7', color: '#166534' },
  unqualified: { background: '#fee2e2', color: '#dc2626' },
  abnormal: { background: '#fee2e2', color: '#dc2626' },
  btn: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 6,
    padding: '7px 14px', fontSize: 13, cursor: 'pointer',
  },
  btnSmall: {
    display: 'flex', alignItems: 'center', gap: 4,
    background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 4,
    padding: '4px 8px', fontSize: 11, cursor: 'pointer',
  },
  rankList: { display: 'flex', flexDirection: 'column', gap: 8 },
  rankItem: { display: 'flex', alignItems: 'center', gap: 12 },
  rankNumber: { width: 24, height: 24, borderRadius: '50%', background: '#1a3a5c', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 },
  rankBar: { flex: 1, height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' },
  rankBarFill: { height: '100%', background: '#1a3a5c', borderRadius: 4 },
  rankValue: { fontSize: 12, fontWeight: 600, color: '#1a3a5c', minWidth: 40, textAlign: 'right' },
}

// ---------- 组件 ----------
const StatusBadge: React.FC<{ status: string; type: string }> = ({ status, type }) => {
  const getStyle = (): React.CSSProperties => {
    if (type === 'handle') {
      const handleStyles: Record<string, React.CSSProperties> = {
        pending: s.pendingHandle, processing: s.processing, resolved: s.resolved,
      }
      return handleStyles[status] || s.badge
    }
    if (type === 'result') {
      const resultStyles: Record<string, React.CSSProperties> = {
        qualified: s.qualified, unresolved: s.unqualified, abnormal: s.abnormal,
      }
      return resultStyles[status] || s.badge
    }
    const allStyles: Record<string, React.CSSProperties> = {
      in_use: s.inUse, pending: s.pending, cleaning: s.cleaning, ready: s.ready, maintenance: s.maintenance,
      running: s.running, idle: s.idle, fault: s.fault,
      concentration: s.concentration, time: s.time, equipment: s.equipmentAlert, missing: s.missing,
      pending_h: s.pendingHandle, processing: s.processing, resolved: s.resolved,
      qualified: s.qualified, unqualified: s.unqualified, abnormal: s.abnormal,
    }
    return allStyles[status] || s.badge
  }
  const getLabel = (): string => {
    if (type === 'handle') {
      const handleLabels: Record<string, string> = {
        pending: '待处理', processing: '处理中', resolved: '已解决',
      }
      return handleLabels[status] || status
    }
    if (type === 'usage') {
      const usageLabels: Record<string, string> = {
        in_use: '在用', pending: '待洗消', cleaning: '洗消中', ready: '已就绪', maintenance: '维修中',
      }
      return usageLabels[status] || status
    }
    if (type === 'equipment') {
      const equipmentLabels: Record<string, string> = {
        running: '运行中', idle: '空闲', maintenance: '维护中', fault: '故障',
      }
      return equipmentLabels[status] || status
    }
    if (type === 'alert') {
      const alertLabels: Record<string, string> = {
        concentration: '浓度不达标', time: '时间不足', equipment: '设备故障', missing: '记录缺失',
      }
      return alertLabels[status] || status
    }
    if (type === 'result') {
      const resultLabels: Record<string, string> = {
        qualified: '合格', unqualified: '不合格', abnormal: '异常',
      }
      return resultLabels[status] || status
    }
    return status
  }
  return <span style={{ ...s.badge, ...getStyle() }}>{getLabel()}</span>
}

const TimelineNode: React.FC<{ step: DisinfectionStep; index: number; total: number; expanded: boolean }> = ({ step, index, total, expanded }) => {
  const nodeColor = step.result === 'qualified' ? '#22c55e' : step.result === 'unqualified' ? '#ef4444' : step.result === 'abnormal' ? '#f97316' : '#94a3b8'
  const cx = 60 + (index / (total - 1)) * (expanded ? 700 : 500)
  const cy = 50
  const nodeR = step.result === 'abnormal' ? 14 : 10

  return (
    <g>
      {index < total - 1 && (
        <line
          x1={cx} y1={cy}
          x2={60 + ((index + 1) / (total - 1)) * (expanded ? 700 : 500)} y2={cy}
          stroke={step.result === 'qualified' ? '#22c55e' : '#e2e8f0'}
          strokeWidth={3}
          strokeDasharray={step.result !== 'qualified' ? '5,3' : 'none'}
        />
      )}
      <circle cx={cx} cy={cy} r={nodeR} fill={nodeColor} opacity={0.9} />
      <text x={cx} y={cy + 28} textAnchor="middle" fontSize={10} fill="#64748b" fontWeight={600}>{step.name}</text>
      <text x={cx} y={cy + 40} textAnchor="middle" fontSize={8} fill="#94a3b8">{step.timestamp}</text>
      {step.result === 'abnormal' && (
        <g>
          <polygon points={`${cx},${cy - 20} ${cx - 6},${cy - 26} ${cx + 6},${cy - 26}`} fill="#f97316" />
          <text x={cx} y={cy - 22} textAnchor="middle" fontSize={10} fill="#fff" fontWeight={700}>!</text>
        </g>
      )}
    </g>
  )
}

export default function DisinfectionTracePage() {
  const [filterDateStart, setFilterDateStart] = useState('2026-04-01')
  const [filterDateEnd, setFilterDateEnd] = useState('2026-04-30')
  const [filterEndoscope, setFilterEndoscope] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'trace' | 'usage' | 'equipment' | 'alert'>('trace')

  const disinfectionRecords = useMemo(() => generateDisinfectionRecords(), [])
  const endoscopeUsage = useMemo(() => generateEndoscopeUsage(), [])
  const equipment = useMemo(() => generateEquipment(), [])
  const maintenanceRecords = useMemo(() => generateMaintenanceRecords(), [])
  const qualityAlerts = useMemo(() => generateQualityAlerts(), [])

  const filteredRecords = useMemo(() => {
    return disinfectionRecords.filter(r => {
      const recordDate = new Date(r.startTime)
      const startOk = !filterDateStart || recordDate >= new Date(filterDateStart)
      const endOk = !filterDateEnd || recordDate <= new Date(filterDateEnd + 'T23:59:59')
      const endoscopeOk = !filterEndoscope || r.endoscopeId.includes(filterEndoscope)
      const typeOk = filterType === 'all' || r.procedureType.includes(filterType)
      const statusOk = filterStatus === 'all' || r.finalResult === filterStatus
      return startOk && endOk && endoscopeOk && typeOk && statusOk
    })
  }, [disinfectionRecords, filterDateStart, filterDateEnd, filterEndoscope, filterType, filterStatus])

  const rankData = useMemo(() => {
    const counts: Record<string, number> = {}
    endoscopeUsage.forEach(u => {
      counts[u.endoscopeId] = (counts[u.endoscopeId] || 0) + u.useCount
    })
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([id, count]) => ({ id, count }))
  }, [endoscopeUsage])

  const maxCount = rankData[0]?.count || 1

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.titleRow}>
          <div>
            <div style={s.title}>洗消追溯增强系统</div>
            <div style={s.subtitle}>超越美迪康基础版 · 全流程追溯管理</div>
          </div>
        </div>

        {/* Stats Overview */}
        <div style={s.statCards}>
          <div style={s.statCard}>
            <div style={s.statLabel}><ClipboardCheck size={14} /> 今日洗消数</div>
            <div style={s.statValue}>45<span style={{ fontSize: 13, fontWeight: 400, color: '#64748b' }}> 条</span></div>
          </div>
          <div style={s.statCard}>
            <div style={s.statLabel}><BarChart3 size={14} /> 本月洗消总量</div>
            <div style={s.statValue}>1,286<span style={{ fontSize: 13, fontWeight: 400, color: '#64748b' }}> 条</span></div>
          </div>
          <div style={s.statCard}>
            <div style={s.statLabel}><Monitor size={14} /> 设备总数</div>
            <div style={s.statValue}>12<span style={{ fontSize: 13, fontWeight: 400, color: '#64748b' }}> 台</span></div>
          </div>
          <div style={s.statCard}>
            <div style={s.statLabel}><CheckCircle size={14} /> 洗消合格率</div>
            <div style={s.statValue}>99.8<span style={{ fontSize: 13, fontWeight: 400, color: '#64748b' }}> %</span></div>
          </div>
          <div style={s.statCard}>
            <div style={s.statLabel}><AlertTriangle size={14} /> 异常预警</div>
            <div style={{ ...s.statValue, ...s.statValueAlert }}>2<span style={{ fontSize: 13, fontWeight: 400 }}> 例</span></div>
          </div>
          <div style={s.statCard}>
            <div style={s.statLabel}><Clock size={14} /> 平均洗消时长</div>
            <div style={s.statValue}>28<span style={{ fontSize: 13, fontWeight: 400, color: '#64748b' }}> 分钟</span></div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        {([
          { key: 'trace', label: '洗消流程追溯', icon: Search },
          { key: 'usage', label: '内镜使用追踪', icon: Activity },
          { key: 'equipment', label: '洗消设备管理', icon: Wrench },
          { key: 'alert', label: '质控预警', icon: AlertCircle },
        ] as const).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              ...s.btn,
              background: activeTab === tab.key ? '#1a3a5c' : '#f1f5f9',
              color: activeTab === tab.key ? '#fff' : '#475569',
            }}
          >
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      {/* 功能区1：洗消流程追溯 */}
      {activeTab === 'trace' && (
        <div style={s.section}>
          <div style={s.sectionTitle}><Search size={16} /> 洗消流程追溯</div>
          <div style={s.traceContainer}>
            {/* Filter Panel */}
            <div style={s.filterPanel}>
              <div style={s.filterGroup}>
                <div style={s.filterLabel}>日期范围</div>
                <input type="date" value={filterDateStart} onChange={e => setFilterDateStart(e.target.value)} style={s.filterInput} />
                <input type="date" value={filterDateEnd} onChange={e => setFilterDateEnd(e.target.value)} style={{ ...s.filterInput, marginTop: 6 }} />
              </div>
              <div style={s.filterGroup}>
                <div style={s.filterLabel}>内镜编号</div>
                <input
                  type="text"
                  placeholder="如 ES-0100"
                  value={filterEndoscope}
                  onChange={e => setFilterEndoscope(e.target.value)}
                  style={s.filterInput}
                />
              </div>
              <div style={s.filterGroup}>
                <div style={s.filterLabel}>洗消类型</div>
                <select value={filterType} onChange={e => setFilterType(e.target.value)} style={s.filterSelect}>
                  <option value="all">全部类型</option>
                  <option value="胃镜">胃镜检查</option>
                  <option value="结肠镜">结肠镜检查</option>
                  <option value="十二指肠">十二指肠镜</option>
                  <option value="支气管">支气管镜</option>
                  <option value="超声">超声内镜</option>
                </select>
              </div>
              <div style={s.filterGroup}>
                <div style={s.filterLabel}>状态</div>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={s.filterSelect}>
                  <option value="all">全部状态</option>
                  <option value="qualified">合格</option>
                  <option value="unqualified">不合格</option>
                  <option value="abnormal">异常</option>
                </select>
              </div>
              <button
                onClick={() => { setFilterDateStart('2026-04-01'); setFilterDateEnd('2026-04-30'); setFilterEndoscope(''); setFilterType('all'); setFilterStatus('all') }}
                style={{ ...s.btnSmall, width: '100%', justifyContent: 'center' }}
              >
                <RefreshCw size={12} /> 重置筛选
              </button>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 12 }}>
                共 {filteredRecords.length} 条记录
              </div>
            </div>

            {/* Timeline Panel */}
            <div style={s.timelinePanel}>
              {filteredRecords.slice(0, 10).map(record => (
                <div
                  key={record.id}
                  style={{
                    ...s.recordCard,
                    ...(expandedRecord === record.id ? s.recordCardHover : {}),
                    borderColor: record.finalResult === 'abnormal' ? '#f97316' : '#e2e8f0',
                  }}
                  onClick={() => setExpandedRecord(expandedRecord === record.id ? null : record.id)}
                >
                  <div style={s.recordHeader}>
                    <div style={s.recordInfo}>
                      <div style={s.recordId}>
                        {record.endoscopeId}
                        {record.finalResult === 'abnormal' && (
                          <span style={{ ...s.badge, background: '#fee2e2', color: '#dc2626', marginLeft: 8, fontSize: 10 }}>
                            <AlertTriangle size={10} /> 异常
                          </span>
                        )}
                      </div>
                      <div style={s.recordModel}>{record.endoscopeModel}</div>
                      <div style={s.recordMeta}>
                        <span>{record.patientName}</span>
                        <span>{record.procedureType}</span>
                        <span>{record.startTime}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <StatusBadge status={record.finalResult} type="result" />
                      <Eye size={16} color="#94a3b8" />
                    </div>
                  </div>

                  {expandedRecord === record.id && (
                    <div style={s.recordExpanded}>
                      <svg style={s.timelineSvg} viewBox="0 0 800 100">
                        <TimelineNode step={record.steps[0]} index={0} total={record.steps.length} expanded={true} />
                        <TimelineNode step={record.steps[1]} index={1} total={record.steps.length} expanded={true} />
                        <TimelineNode step={record.steps[2]} index={2} total={record.steps.length} expanded={true} />
                        <TimelineNode step={record.steps[3]} index={3} total={record.steps.length} expanded={true} />
                        <TimelineNode step={record.steps[4]} index={4} total={record.steps.length} expanded={true} />
                        <TimelineNode step={record.steps[5]} index={5} total={record.steps.length} expanded={true} />
                        <TimelineNode step={record.steps[6]} index={6} total={record.steps.length} expanded={true} />
                      </svg>
                      <div style={s.stepDetails}>
                        {record.steps.map((step, idx) => (
                          <div key={idx} style={s.stepDetailItem}>
                            <div style={s.stepDetailLabel}>{step.name}</div>
                            <div style={s.stepDetailValue}>{step.result === 'qualified' ? '合格' : step.result === 'abnormal' ? '异常' : '不合格'}</div>
                            {step.details && Object.entries(step.details).slice(0, 2).map(([k, v]) => (
                              <div key={k} style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>
                                {k}: {v}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                      <div style={{ marginTop: 12, padding: 12, background: '#f8fafc', borderRadius: 6, fontSize: 12, color: '#64748b' }}>
                        <strong>操作员：</strong>{record.operator}　<strong>洗消机：</strong>{record.steps[0]?.equipment}　<strong>总耗时：</strong>约{record.steps.length * 25}分钟
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 功能区2：内镜使用追踪 */}
      {activeTab === 'usage' && (
        <div style={s.section}>
          <div style={{ ...s.sectionTitle, justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Activity size={16} /> 内镜使用追踪</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>共 {endoscopeUsage.length} 条记录</div>
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            {/* Table */}
            <div style={{ flex: 1 }}>
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>内镜编号</th>
                    <th style={s.th}>型号</th>
                    <th style={s.th}>患者姓名</th>
                    <th style={s.th}>检查类型</th>
                    <th style={s.th}>使用时间</th>
                    <th style={s.th}>洗消状态</th>
                    <th style={s.th}>下次洗消</th>
                  </tr>
                </thead>
                <tbody>
                  {endoscopeUsage.map(row => (
                    <tr key={row.id}>
                      <td style={{ ...s.td, fontWeight: 600, color: '#1a3a5c' }}>{row.endoscopeId}</td>
                      <td style={s.td}>{row.model}</td>
                      <td style={s.td}>{row.patientName}</td>
                      <td style={s.td}>{row.checkType}</td>
                      <td style={s.td}>{row.useTime}</td>
                      <td style={s.td}><StatusBadge status={row.status} type="usage" /></td>
                      <td style={s.td}>{row.nextCleanTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Usage Rank */}
            <div style={{ width: 260, background: '#f8fafc', padding: 16, borderRadius: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1a3a5c', marginBottom: 12 }}>本月使用频次排行</div>
              <div style={s.rankList}>
                {rankData.map((item, idx) => (
                  <div key={item.id} style={s.rankItem}>
                    <div style={s.rankNumber}>{idx + 1}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#1a3a5c', marginBottom: 4 }}>{item.id}</div>
                      <div style={s.rankBar}>
                        <div style={{ ...s.rankBarFill, width: `${(item.count / maxCount) * 100}%` }} />
                      </div>
                    </div>
                    <div style={s.rankValue}>{item.count}次</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 功能区3：洗消设备管理 */}
      {activeTab === 'equipment' && (
        <div style={s.section}>
          <div style={s.sectionTitle}><Wrench size={16} /> 洗消设备管理</div>

          {/* Equipment Cards */}
          <div style={s.equipmentGrid}>
            {equipment.map(eq => (
              <div key={eq.id} style={s.equipmentCard}>
                <div style={s.equipmentHeader}>
                  <div>
                    <div style={s.equipmentName}>{eq.name}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>{eq.model}</div>
                  </div>
                  <StatusBadge status={eq.status} type="equipment" />
                </div>
                <div style={s.equipmentStats}>
                  <div style={s.equipmentStat}>
                    <div style={s.equipmentStatLabel}>今日使用</div>
                    <div style={s.equipmentStatValue}>{eq.todayUses}次</div>
                  </div>
                  <div style={s.equipmentStat}>
                    <div style={s.equipmentStatLabel}>本周使用</div>
                    <div style={s.equipmentStatValue}>{eq.weekUses}次</div>
                  </div>
                  <div style={s.equipmentStat}>
                    <div style={s.equipmentStatLabel}>最后维护</div>
                    <div style={{ ...s.equipmentStatValue, fontSize: 11 }}>{eq.lastMaintenance}</div>
                  </div>
                  <div style={s.equipmentStat}>
                    <div style={s.equipmentStatLabel}>设备状态</div>
                    <div style={{ ...s.equipmentStatValue, fontSize: 11, color: eq.status === 'fault' ? '#dc2626' : eq.status === 'running' ? '#166534' : '#1a3a5c' }}>
                      {eq.status === 'running' ? '运行中' : eq.status === 'idle' ? '空闲' : eq.status === 'maintenance' ? '维护中' : '故障'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Maintenance Records */}
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1a3a5c', marginBottom: 12 }}>维护记录</div>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>设备</th>
                  <th style={s.th}>维护类型</th>
                  <th style={s.th}>日期</th>
                  <th style={s.th}>工程师</th>
                  <th style={s.th}>结果</th>
                </tr>
              </thead>
              <tbody>
                {maintenanceRecords.map(rec => (
                  <tr key={rec.id}>
                    <td style={{ ...s.td, fontWeight: 600, color: '#1a3a5c' }}>{rec.equipmentName}</td>
                    <td style={s.td}>{rec.maintenanceType}</td>
                    <td style={s.td}>{rec.date}</td>
                    <td style={s.td}>{rec.engineer}</td>
                    <td style={s.td}><StatusBadge status="resolved" type="result" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 功能区4：质控预警 */}
      {activeTab === 'alert' && (
        <div style={s.section}>
          <div style={{ ...s.sectionTitle, justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><AlertCircle size={16} /> 质控预警</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ ...s.badge, background: '#fee2e2', color: '#dc2626' }}>待处理 2</span>
              <span style={{ ...s.badge, background: '#fef3c7', color: '#92400e' }}>处理中 5</span>
              <span style={{ ...s.badge, background: '#dcfce7', color: '#166534' }}>已解决 5</span>
            </div>
          </div>

          {/* Alert Legend */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 16, padding: 12, background: '#f8fafc', borderRadius: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b' }}>
              <span style={{ ...s.badge, background: '#fee2e2', color: '#dc2626' }}>浓度不达标</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b' }}>
              <span style={{ ...s.badge, background: '#ffe4c4', color: '#c2410c' }}>时间不足</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b' }}>
              <span style={{ ...s.badge, background: '#fef3c7', color: '#92400e' }}>设备故障</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b' }}>
              <span style={{ ...s.badge, background: '#dbeafe', color: '#1d4ed8' }}>记录缺失</span>
            </div>
          </div>

          {/* Alert List */}
          {qualityAlerts.map(alert => (
            <div key={alert.id} style={s.alertRow}>
              <div style={s.alertTime}>{alert.alertTime}</div>
              <div style={s.alertEndoscope}>{alert.endoscopeId}</div>
              <div style={s.alertType}>
                <StatusBadge status={alert.alertType} type="alert" />
              </div>
              <div style={s.alertDetail}>{alert.detail}</div>
              <div style={s.alertStatus}>
                <StatusBadge status={alert.handleStatus} type="handle" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
