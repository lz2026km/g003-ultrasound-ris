// G003 超声RIS系统 - 类型定义

export interface Patient {
  id: string
  name: string
  gender: '男' | '女'
  age: number
  phone: string
  idCard: string
  address: string
  birthDate: string
  patientType: '门诊' | '住院' | '体检'
  registrationDate: string
  notes?: string
}

export interface Appointment {
  id: string
  patientId: string
  patientName: string
  examType: string
  examSubtype: string
  appointmentDate: string
  appointmentTime: string
  status: '待确认' | '已确认' | '已到检' | '已完成' | '已取消' | '逾期'
  doctor: string
  device?: string
  notes?: string
}

export interface Exam {
  id: string
  patientId: string
  patientName: string
  appointmentId?: string
  examType: string
  examSubtype: string
  examDate: string
  examTime: string
  status: '待检查' | '检查中' | '已完成' | '已取消'
  doctor: string
  sonographer?: string
  device: string
  diagnosis?: string
  findings?: string
  images?: string[]
  reportId?: string
  notes?: string
}

export interface Report {
  id: string
  examId: string
  patientId: string
  patientName: string
  examType: string
  examDate: string
  status: '待撰写' | '待审核' | '已审核' | '已发布'
  doctor: string
  reviewer?: string
  diagnosis: string
  findings: string
  suggestions: string
  createTime: string
  updateTime?: string
  signTime?: string
}

export interface UltrasoundMode {
  id: string
  name: string
  code: string
  description: string
  applicableExamTypes: string[]
  parameters?: string
  clinicalApplications: string
}

export interface StatisticsData {
  todayExams: number
  todayReports: number
  todayAppointments: number
  pendingReports: number
  criticalValues: number
  examTrend: Array<{ date: string; count: number }>
  reportTrend: Array<{ date: string; count: number }>
  examTypeDistribution: Array<{ name: string; value: number }>
  doctorWorkload: Array<{ doctor: string; count: number }>
  deviceUtilization: Array<{ device: string; usage: number }>
}

export interface QCIndicator {
  id: string
  name: string
  standard: string
  current: number
  target: number
  unit: string
  status: '达标' | '预警' | '超标'
}

export interface Material {
  id: string
  name: string
  category: string
  unit: string
  stock: number
  minStock: number
  price: number
  supplier?: string
  expiryDate?: string
}

export interface Equipment {
  id: string
  name: string
  model: string
  manufacturer: string
  sn: string
  status: '正常' | '使用中' | '维护中' | '停用'
  purchaseDate: string
  warrantyEnd?: string
  usageHours?: number
  lastMaintenance?: string
  nextMaintenance?: string
}

export interface FollowUp {
  id: string
  patientId: string
  patientName: string
  examId: string
  examType: string
  followUpDate: string
  followUpType: '常规' | '复查' | '召回'
  status: '待随访' | '已随访' | '逾期' | '失访'
  result?: string
  notes?: string
}
