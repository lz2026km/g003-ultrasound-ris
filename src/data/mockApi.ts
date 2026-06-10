/**
 * 轻量前端 Mock API 层
 * v0.19.0 新增 — 替代直接读 initialData 的硬编码
 * 让 18 个页面从"读 mock 常量"升级为"调 API"
 * 后续可无缝切换到真实后端（仅需替换此文件）
 */
import {
  initialUsers, initialPatients, initialExamItems, initialAppointments,
  initialUltrasoundExams, initialUltrasoundDevices, initialUltrasoundReports,
  initialReportTemplates, initialDictionaries, initialQCChecks,
  initialStatisticsData, initialAuditLogs, initialExamRooms,
  initialDoctorSchedules, initialCriticalValues, initialEscalationRules,
  initialDisinfectionRecords, initialDisinfectionProcesses, initialFollowUps,
} from './initialData'
import { patients_v070 } from './patientsV070'

// ============================================================
// v0.19.2 新增：维修工单（独立表 — 字段与预约不同）
// ============================================================
const initialWorkOrders: any[] = [
  { id: 'WO2026-0512', device: 'GE Voluson E10', dept: '妇产科', type: '故障报修', priority: 'urgent', status: 'in_progress', reporter: '王医生', assignee: '张工程师', reportTime: '2026-06-05 08:30', issue: '探头图像雪花严重', response: '12分钟', progress: 65 },
  { id: 'WO2026-0511', device: '西门子ACUSON Sequoia', dept: '心血管内科', type: '故障报修', priority: 'high', status: 'in_progress', reporter: '李医生', assignee: '刘工程师', reportTime: '2026-06-05 07:15', issue: '开机无显示', response: '8分钟', progress: 40 },
  { id: 'WO2026-0510', device: '飞利浦EPIQ 7C', dept: '超声科', type: '预防性维护', priority: 'normal', status: 'pending', reporter: '巡检计划', assignee: '待派工', reportTime: '2026-06-05 06:00', issue: '季度深度保养', response: '-', progress: 0 },
  { id: 'WO2026-0509', device: '迈瑞Resona R9T', dept: '急诊科', type: '故障报修', priority: 'urgent', status: 'completed', reporter: '陈护士', assignee: '张工程师', reportTime: '2026-06-04 22:18', issue: '电源故障', response: '6分钟', progress: 100 },
  { id: 'WO2026-0508', device: 'GE LOGIQ E9', dept: '超声科', type: '校准', priority: 'normal', status: 'completed', reporter: '质控计划', assignee: '王工程师', reportTime: '2026-06-04 14:30', issue: '探头频率校准', response: '30分钟', progress: 100 },
  { id: 'WO2026-0507', device: '开立S60', dept: '体检中心', type: '故障报修', priority: 'high', status: 'completed', reporter: '张医生', assignee: '刘工程师', reportTime: '2026-06-04 11:45', issue: '触摸屏失灵', response: '15分钟', progress: 100 },
  { id: 'WO2026-0506', device: '东芝Aplio i800', dept: '肝胆外科', type: '配件更换', priority: 'normal', status: 'dispatched', reporter: '孙医生', assignee: '李工程师', reportTime: '2026-06-04 09:20', issue: '更换耦合剂瓶', response: '20分钟', progress: 30 },
  { id: 'WO2026-0505', device: 'GE Voluson E10', dept: '妇产科', type: '故障报修', priority: 'normal', status: 'completed', reporter: '王医生', assignee: '张工程师', reportTime: '2026-06-03 16:50', issue: '打印机卡纸', response: '18分钟', progress: 100 },
  { id: 'WO2026-0504', device: '西门子ACUSON S3000', dept: '超声科', type: '故障报修', priority: 'urgent', status: 'completed', reporter: '质控员', assignee: '王工程师', reportTime: '2026-06-03 10:30', issue: '散热风扇异响', response: '8分钟', progress: 100 },
  { id: 'WO2026-0503', device: '迈瑞DC-80', dept: '心内科', type: '巡检', priority: 'normal', status: 'completed', reporter: '巡检计划', assignee: '陈工程师', reportTime: '2026-06-03 08:00', issue: '月度常规巡检', response: '40分钟', progress: 100 },
]

// ============================================================
// 内存数据库（clone 一份避免污染 initialData）
// ============================================================
const db = {
  users: [...initialUsers],
  patients: [...initialPatients],
  examItems: [...initialExamItems],
  appointments: [...initialAppointments],
  ultrasoundExams: [...initialUltrasoundExams],
  ultrasoundDevices: [...initialUltrasoundDevices],
  ultrasoundReports: [...initialUltrasoundReports],
  reportTemplates: [...initialReportTemplates],
  dictionaries: [...initialDictionaries],
  qcChecks: [...initialQCChecks],
  statisticsData: { ...initialStatisticsData },
  auditLogs: [...initialAuditLogs],
  examRooms: [...initialExamRooms],
  doctorSchedules: [...initialDoctorSchedules],
  criticalValues: [...initialCriticalValues],
  escalationRules: [...initialEscalationRules],
  disinfectionRecords: [...initialDisinfectionRecords],
  disinfectionProcesses: [...initialDisinfectionProcesses],
  followUps: [...initialFollowUps],
  workOrders: [...initialWorkOrders],
}

// ============================================================
// 模拟网络延迟（ms），让前端代码面对真实异步场景
// ============================================================
const delay = (ms: number = 100) => new Promise(r => setTimeout(r, ms))

// ============================================================
// 通用 CRUD 接口
// ============================================================
async function list<T>(table: keyof typeof db): Promise<T[]> {
  await delay()
  return [...(db[table] as any[])] as T[]
}

async function get<T>(table: keyof typeof db, id: string): Promise<T | null> {
  await delay()
  return ((db[table] as any[]).find((r: any) => r.id === id) || null) as T | null
}

async function create<T>(table: keyof typeof db, record: T): Promise<T> {
  await delay()
  ;(db[table] as any[]).push(record)
  return record
}

async function update<T>(table: keyof typeof db, id: string, patch: Partial<T>): Promise<T | null> {
  await delay()
  const arr = db[table] as any[]
  const idx = arr.findIndex((r: any) => r.id === id)
  if (idx === -1) return null
  arr[idx] = { ...arr[idx], ...patch }
  return arr[idx] as T
}

async function remove(table: keyof typeof db, id: string): Promise<boolean> {
  await delay()
  const arr = db[table] as any[]
  const idx = arr.findIndex((r: any) => r.id === id)
  if (idx === -1) return false
  arr.splice(idx, 1)
  return true
}

// ============================================================
// 业务专用接口
// ============================================================
/** 患者列表（合并 v0.7.0 扩展数据 — 替代 ResearchPage 硬编码）*/
export async function getAllPatients() {
  await delay()
  return [...db.patients, ...(patients_v070 as any[])]
}

/** 预约 + 检查 + 患者 join 查询（首页用）*/
export async function getDashboardStats() {
  await delay()
  return {
    totalPatients: db.patients.length + patients_v070.length,
    totalAppointments: db.appointments.length,
    totalExams: db.ultrasoundExams.length,
    totalReports: db.ultrasoundReports.length,
    statisticsData: db.statisticsData,
  }
}

/** 危急值超时预警（30/60 分钟）*/
export async function getCriticalValueAlerts() {
  await delay()
  const now = Date.now()
  return db.criticalValues
    .filter((cv: any) => !cv.acknowledgedAt)
    .map((cv: any) => {
      const elapsedMin = (now - new Date(cv.detectedAt).getTime()) / 60000
      return {
        ...cv,
        elapsedMinutes: Math.floor(elapsedMin),
        level: elapsedMin > 60 ? 'critical' : elapsedMin > 30 ? 'warning' : 'normal',
      }
    })
}

/** 探头使用统计（设备管理用）*/
export async function getProbeUsageStats() {
  await delay()
  const stats: Record<string, number> = {}
  db.ultrasoundExams.forEach((e: any) => {
    if (e.probeType) stats[e.probeType] = (stats[e.probeType] || 0) + 1
  })
  return stats
}

/** 报告模板按专科分类*/
export async function getTemplatesBySpecialty() {
  await delay()
  const grouped: Record<string, any[]> = {}
  db.reportTemplates.forEach((t: any) => {
    const k = t.specialty || '其他'
    if (!grouped[k]) grouped[k] = []
    grouped[k].push(t)
  })
  return grouped
}

// ============================================================
// v0.19.2 新增：工单 + 检查流业务接口
// ============================================================
export interface WorkOrderFilters {
  status?: string         // pending / assigned / in_progress / completed / cancelled
  priority?: string       // low / normal / high / urgent
  department?: string
  assignee?: string
  keyword?: string
  page?: number
  pageSize?: number
}

/** 工单列表（带筛选 + 分页）*/
export async function getWorkOrderList(filters: WorkOrderFilters = {}) {
  await delay()
  const all = (db.workOrders as any[])
  let filtered = all
  if (filters.status) filtered = filtered.filter((o: any) => o.status === filters.status)
  if (filters.priority) filtered = filtered.filter((o: any) => o.priority === filters.priority)
  if (filters.department) filtered = filtered.filter((o: any) => o.dept === filters.department)
  if (filters.assignee) filtered = filtered.filter((o: any) => o.assignee === filters.assignee)
  if (filters.keyword) {
    const k = filters.keyword.toLowerCase()
    filtered = filtered.filter((o: any) =>
      (o.device || '').toLowerCase().includes(k) ||
      (o.id || '').toLowerCase().includes(k) ||
      (o.issue || '').toLowerCase().includes(k) ||
      (o.reporter || '').toLowerCase().includes(k)
    )
  }
  const total = filtered.length
  const page = filters.page || 1
  const pageSize = filters.pageSize || 20
  const start = (page - 1) * pageSize
  const items = filtered.slice(start, start + pageSize)
  // 业务聚合 — 顶部 KPI 卡片用
  const stats = {
    total: all.length,
    pending: all.filter((o: any) => o.status === 'pending').length,
    dispatched: all.filter((o: any) => o.status === 'dispatched').length,
    inProgress: all.filter((o: any) => o.status === 'in_progress').length,
    completed: all.filter((o: any) => o.status === 'completed').length,
    urgent: all.filter((o: any) => o.priority === 'urgent').length,
  }
  return { items, total, page, pageSize, stats }
}

/** 创建工单 */
export async function createWorkOrder(data: Record<string, any>) {
  await delay()
  const id = `WO${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
  const record = { id, status: 'pending', createdAt: new Date().toISOString(), ...data }
  ;(db.workOrders as any[]).unshift(record)
  return record
}

/** 更新工单状态（分配/开始/完成/取消）*/
export async function updateWorkOrderStatus(id: string, status: string, extra: Record<string, any> = {}) {
  await delay()
  const arr = db.workOrders as any[]
  const idx = arr.findIndex((o: any) => o.id === id)
  if (idx === -1) return null
  arr[idx] = { ...arr[idx], status, ...extra, updatedAt: new Date().toISOString() }
  return arr[idx]
}

// ============================================================
// 检查流接口
// ============================================================
export interface ExamFilters {
  status?: string         // registered / in_progress / paused / completed / reported / cancelled
  examRoom?: string
  doctor?: string
  patientId?: string
  dateFrom?: string
  dateTo?: string
  keyword?: string
  page?: number
  pageSize?: number
}

/** 检查列表（带筛选 + 分页 + 业务聚合）*/
export async function getExamList(filters: ExamFilters = {}) {
  await delay()
  const all = db.ultrasoundExams as any[]
  let filtered = all
  if (filters.status) filtered = filtered.filter((e: any) => e.status === filters.status)
  if (filters.examRoom) filtered = filtered.filter((e: any) => e.examRoomId === filters.examRoom)
  if (filters.doctor) filtered = filtered.filter((e: any) => e.doctorId === filters.doctor)
  if (filters.patientId) filtered = filtered.filter((e: any) => e.patientId === filters.patientId)
  if (filters.dateFrom) filtered = filtered.filter((e: any) => e.createdAt >= filters.dateFrom!)
  if (filters.dateTo) filtered = filtered.filter((e: any) => e.createdAt <= filters.dateTo!)
  if (filters.keyword) {
    const k = filters.keyword.toLowerCase()
    filtered = filtered.filter((e: any) =>
      (e.patientName || '').toLowerCase().includes(k) ||
      (e.id || '').toLowerCase().includes(k) ||
      (e.examItem || '').toLowerCase().includes(k)
    )
  }
  const total = filtered.length
  const page = filters.page || 1
  const pageSize = filters.pageSize || 20
  const start = (page - 1) * pageSize
  const items = filtered.slice(start, start + pageSize)
  // 业务聚合 — 检查室利用率/医生工作量
  const stats = {
    total: all.length,
    registered: all.filter((e: any) => e.status === 'registered').length,
    inProgress: all.filter((e: any) => e.status === 'in_progress').length,
    completed: all.filter((e: any) => e.status === 'completed').length,
    reported: all.filter((e: any) => e.status === 'reported').length,
  }
  return { items, total, page, pageSize, stats }
}

/** 推进检查状态（开始/暂停/结束/传报告）*/
export async function updateExamStatus(
  id: string,
  status: string,
  extra: Record<string, any> = {}
) {
  await delay()
  const arr = db.ultrasoundExams as any[]
  const idx = arr.findIndex((e: any) => e.id === id)
  if (idx === -1) return null
  arr[idx] = { ...arr[idx], status, ...extra, updatedAt: new Date().toISOString() }
  return arr[idx]
}

// ============================================================
// v0.19.4 P0-1: AI 结构化报告生成（对标联影 AI PACS）
// ============================================================
export interface StructuredReportInput {
  examId: string
  examItemName: string
  patientId?: string
  patientName?: string
  gender?: '男' | '女' | string
  age?: number
  doctorId?: string
  doctorName?: string
  /** 模板 key（不传则按 examItemName 自动匹配）*/
  templateKey?: string
}

export interface StructuredReportOutput {
  findings: string
  diagnosis: string
  impression: string
  recommendations: string
  confidence: number           // 0-1
  templateUsed: string
  sourceModules: string[]      // ['plane-recognition', 'auto-measure', 'report-generator']
  generatedAt: string
}

/** AI 结构化报告生成（mock 模式：对标联影 AI PACS 北医三院案例） */
export async function generateStructuredReport(
  input: StructuredReportInput
): Promise<StructuredReportOutput> {
  await delay(300)              // 模拟 AI 推理 300ms（北医三院报告 5× 速度）
  // 模板库
  const templates: Record<string, { findings: string; diagnosis: string; impression: string; recommendations: string }> = {
    '电子超声检查': {
      findings: '肝右叶最大斜径约 {HEPATIC_SIZE} cm，肝实质回声均匀，未见明显占位性病变。胆囊大小形态正常，壁不厚，腔内未见结石回声。胰腺形态正常，主胰管不扩张。脾脏大小正常。',
      diagnosis: '腹部超声检查未见明显异常',
      impression: '腹部超声检查未见明显异常',
      recommendations: '建议定期体检。',
    },
    '心脏超声': {
      findings: '左室壁各节段运动未见明显异常。左室射血分数（LVEF）约 {LVEF}%。二尖瓣形态及活动正常，瓣口血流速度正常。三尖瓣、主动脉瓣、肺动脉瓣形态及活动未见明显异常。',
      diagnosis: '心脏超声检查未见明显异常',
      impression: '心脏超声检查未见明显异常',
      recommendations: '建议定期心脏专科随访。',
    },
    '妇产科超声': {
      findings: '子宫大小形态正常，宫壁回声均匀，内膜线居中。右侧卵巢大小约 {OVARY_R} cm，左侧卵巢大小约 {OVARY_L} cm，双侧附件区未见明显异常回声。',
      diagnosis: '妇科超声检查未见明显异常',
      impression: '妇科超声检查未见明显异常',
      recommendations: '建议定期妇科专科随访。',
    },
    '浅表超声': {
      findings: '甲状腺大小形态正常，边界清晰，内部回声均匀，未见明显占位性病变。CDFI：腺体内血流信号未见明显异常。双侧颈部未见明显肿大淋巴结。',
      diagnosis: '甲状腺超声检查未见明显异常',
      impression: '甲状腺超声检查未见明显异常',
      recommendations: '建议定期专科随访。',
    },
    'default': {
      findings: '检查区域结构清晰，未见明显占位性病变、积液或其他异常回声。CDFI：血流信号未见明显异常。',
      diagnosis: '超声检查未见明显异常',
      impression: '超声检查未见明显异常',
      recommendations: '建议定期体检。',
    },
  }
  const tpl = templates[input.templateKey || ''] || templates[input.examItemName || ''] || templates.default

  // 变量替换
  const varMap: Record<string, string> = {
    '{HEPATIC_SIZE}': String(10 + Math.floor(Math.random() * 4)),
    '{LVEF}': String(55 + Math.floor(Math.random() * 10)),
    '{OVARY_R}': String((2 + Math.random()).toFixed(1)),
    '{OVARY_L}': String((2 + Math.random()).toFixed(1)),
    '{PATIENT_NAME}': input.patientName || '患者',
    '{PATIENT_ID}': input.patientId || '',
    '{GENDER}': input.gender || '',
    '{AGE}': input.age ? String(input.age) : '',
    '{DOCTOR_NAME}': input.doctorName || '',
  }
  const replace = (s: string) => s.replace(/\{[A-Z_]+\}/g, (m) => varMap[m] ?? m)

  return {
    findings: replace(tpl.findings),
    diagnosis: replace(tpl.diagnosis),
    impression: replace(tpl.impression),
    recommendations: replace(tpl.recommendations),
    confidence: 0.85,
    templateUsed: input.templateKey || input.examItemName || 'default',
    sourceModules: ['plane-recognition', 'auto-measure', 'report-generator', 'quality-evaluation'],
    generatedAt: new Date().toISOString(),
  }
}

// ============================================================
// v0.19.4 P0-2: 影像-病理符合率质控（对标联影 AI PACS + 华声 AI 质控）
// ============================================================
export interface PathologyRecord {
  id: string
  examId: string                  // 关联检查
  patientId: string
  patientName: string
  imagingFindings: string          // 影像所见
  imagingConclusion: string       // 影像诊断
  pathologyDiagnosis: string       // 病理诊断
  pathologyReportNo: string       // 病理报告号
  pathologyDate: string
  pathologyHospital: string        // 病理送检医院
  matchLevel: '完全符合' | '基本符合' | '不符合' | '待定'
  matchScore: number              // 0-100
  discrepancyNote?: string        // 不符合备注
  doctorId: string
  doctorName: string
  createdAt: string
}

export interface PathologyQCStats {
  totalCases: number              // 总病例
  fullMatch: number               // 完全符合
  basicMatch: number              // 基本符合
  mismatch: number                // 不符合
  pending: number                 // 待定
  matchRate: number               // 符合率 %
  mismatchRate: number            // 不符合率 %
  byDoctor: { doctorName: string; total: number; matchRate: number }[]
  byModality: { modality: string; total: number; matchRate: number }[]
  monthly: { month: string; total: number; matchRate: number; mismatch: number }[]
}

/** 影像-病理符合率记录（mock 200 条）*/
export async function getPathologyQCList(filters: {
  matchLevel?: string
  modality?: string
  dateFrom?: string
  dateTo?: string
  keyword?: string
} = {}) {
  await delay()
  const doctors = ['王志远', '李素芬', '张明', '陈晓东', '刘欢']
  const modalities = ['腹部超声', '心脏超声', '妇产超声', '浅表超声', '血管超声']
  const hospitals = ['本院病理科', '协和医院病理科', '301医院病理科', '省肿瘤医院病理科']
  const matchLevels: PathologyRecord['matchLevel'][] = ['完全符合', '基本符合', '不符合', '待定']
  const matches: PathologyRecord[] = []
  for (let i = 0; i < 200; i++) {
    const r = (Math.sin(i * 13.37) + 1) / 2 // 0-1 伪随机
    const lvl = r > 0.6 ? '完全符合' : r > 0.3 ? '基本符合' : r > 0.1 ? '不符合' : '待定'
    const score = lvl === '完全符合' ? 90 + Math.floor(r * 10) : lvl === '基本符合' ? 70 + Math.floor(r * 20) : lvl === '不符合' ? 30 + Math.floor(r * 30) : 0
    matches.push({
      id: `P${String(i + 1).padStart(4, '0')}`,
      examId: `E${String(1000 + i).padStart(5, '0')}`,
      patientId: `P${String(10000 + i).padStart(6, '0')}`,
      patientName: `患者${String(i + 1).padStart(3, '0')}`,
      imagingFindings: lvl === '不符合' ? '影像提示占位性病变，大小约 2.5×1.8cm' : '检查区域结构清晰，未见明显占位性病变',
      imagingConclusion: lvl === '不符合' ? '考虑良性肿瘤可能' : '超声检查未见明显异常',
      pathologyDiagnosis: lvl === '不符合' ? '恶性肿瘤（腺癌）' : lvl === '基本符合' ? '良性肿瘤（腺瘤）' : '未见恶性细胞',
      pathologyReportNo: `B${String(20240000 + i)}`,
      pathologyDate: `2024-${String(Math.floor(i / 20) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
      pathologyHospital: hospitals[i % hospitals.length],
      matchLevel: lvl,
      matchScore: score,
      discrepancyNote: lvl === '不符合' ? '影像误判为良性，病理证实恶性，建议复盘' : '',
      doctorId: `D${(i % 5) + 1}`,
      doctorName: doctors[i % doctors.length],
      createdAt: `2024-${String(Math.floor(i / 20) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}T10:00:00Z`,
    })
  }
  let filtered = matches
  if (filters.matchLevel) filtered = filtered.filter(m => m.matchLevel === filters.matchLevel)
  if (filters.modality) filtered = filtered.filter((_, idx) => modalities[idx % modalities.length] === filters.modality)
  if (filters.keyword) {
    const k = filters.keyword.toLowerCase()
    filtered = filtered.filter(m =>
      m.patientName.toLowerCase().includes(k) ||
      m.id.toLowerCase().includes(k) ||
      m.examId.toLowerCase().includes(k)
    )
  }
  return {
    items: filtered,
    total: filtered.length,
    modalities,
  }
}

/** 影像-病理符合率统计（仪表盘）*/
export async function getPathologyQCStats() {
  await delay()
  const list = await getPathologyQCList()
  const total = list.items.length
  const fullMatch = list.items.filter(m => m.matchLevel === '完全符合').length
  const basicMatch = list.items.filter(m => m.matchLevel === '基本符合').length
  const mismatch = list.items.filter(m => m.matchLevel === '不符合').length
  const pending = list.items.filter(m => m.matchLevel === '待定').length
  const matchRate = total > 0 ? Math.round(((fullMatch + basicMatch) / total) * 1000) / 10 : 0
  const mismatchRate = total > 0 ? Math.round((mismatch / total) * 1000) / 10 : 0
  // 医生维度
  const doctorMap: Record<string, { total: number; match: number }> = {}
  list.items.forEach(m => {
    if (!doctorMap[m.doctorName]) doctorMap[m.doctorName] = { total: 0, match: 0 }
    doctorMap[m.doctorName].total++
    if (m.matchLevel === '完全符合' || m.matchLevel === '基本符合') doctorMap[m.doctorName].match++
  })
  const byDoctor = Object.entries(doctorMap).map(([doctorName, v]) => ({
    doctorName,
    total: v.total,
    matchRate: v.total > 0 ? Math.round((v.match / v.total) * 1000) / 10 : 0,
  })).sort((a, b) => b.matchRate - a.matchRate)
  // 模态维度
  const modalityMap: Record<string, { total: number; match: number }> = {}
  list.items.forEach((_, idx) => {
    const mod = list.modalities[idx % list.modalities.length]
    if (!modalityMap[mod]) modalityMap[mod] = { total: 0, match: 0 }
    modalityMap[mod].total++
    if (list.items[idx].matchLevel === '完全符合' || list.items[idx].matchLevel === '基本符合') modalityMap[mod].match++
  })
  const byModality = Object.entries(modalityMap).map(([modality, v]) => ({
    modality,
    total: v.total,
    matchRate: v.total > 0 ? Math.round((v.match / v.total) * 1000) / 10 : 0,
  })).sort((a, b) => b.matchRate - a.matchRate)
  // 月度趋势
  const monthMap: Record<string, { total: number; match: number; mismatch: number }> = {}
  list.items.forEach(m => {
    const month = m.createdAt.substring(0, 7)
    if (!monthMap[month]) monthMap[month] = { total: 0, match: 0, mismatch: 0 }
    monthMap[month].total++
    if (m.matchLevel === '完全符合' || m.matchLevel === '基本符合') monthMap[month].match++
    if (m.matchLevel === '不符合') monthMap[month].mismatch++
  })
  const monthly = Object.entries(monthMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, v]) => ({
      month,
      total: v.total,
      matchRate: v.total > 0 ? Math.round((v.match / v.total) * 1000) / 10 : 0,
      mismatch: v.mismatch,
    }))
  return {
    totalCases: total,
    fullMatch,
    basicMatch,
    mismatch,
    pending,
    matchRate,
    mismatchRate,
    byDoctor,
    byModality,
    monthly,
  }
}

// ============================================================
// 统一导出
// ============================================================
export const mockApi = {
  list, get, create, update, remove,
  getAllPatients, getDashboardStats,
  getCriticalValueAlerts, getProbeUsageStats, getTemplatesBySpecialty,
  // v0.19.2
  getWorkOrderList, createWorkOrder, updateWorkOrderStatus,
  getExamList, updateExamStatus,
  // v0.19.4
  generateStructuredReport,
  // v0.19.4 P0-2
  getPathologyQCList, getPathologyQCStats,
}

export default mockApi
