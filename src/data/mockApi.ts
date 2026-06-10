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
// 统一导出
// ============================================================
export const mockApi = {
  list, get, create, update, remove,
  getAllPatients, getDashboardStats,
  getCriticalValueAlerts, getProbeUsageStats, getTemplatesBySpecialty,
  // v0.19.2
  getWorkOrderList, createWorkOrder, updateWorkOrderStatus,
  getExamList, updateExamStatus,
}

export default mockApi
