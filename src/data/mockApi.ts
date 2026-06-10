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
// 统一导出
// ============================================================
export const mockApi = {
  list, get, create, update, remove,
  getAllPatients, getDashboardStats,
  getCriticalValueAlerts, getProbeUsageStats, getTemplatesBySpecialty,
}

export default mockApi
