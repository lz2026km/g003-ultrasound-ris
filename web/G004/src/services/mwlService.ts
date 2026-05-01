// ============================================================
// G004 内镜管理系统 - DICOM MWL & HL7 服务层
// Modality Worklist, 状态流转, HL7 消息模拟推送
// ============================================================

import type { Appointment, AppointmentStatus, EndoscopyExam } from '../types';
import { initialAppointments, initialEndoscopyExams } from '../data/initialData';

// ---------- HL7 消息生成 ----------
export interface HL7Message {
  type: 'ADT' | 'ORM' | 'ORU' | 'SDM';
  timestamp: string;
  raw: string;
  fields: Record<string, string>;
}

// 生成 HL7 格式化时间
function hl7TS(): string {
  const d = new Date();
  return d.toISOString().replace(/[-:T]/g, '').slice(0, 14);
}

// 模拟 HL7 ADT A01 (入院/接诊) 消息
export function generateHL7_ADT_A01(apt: Appointment): HL7Message {
  const fields: Record<string, string> = {
    'MSH-3': 'ENDOSCOPY_SYS',
    'MSH-4': 'ENDOSCOPY_CENTER',
    'MSH-5': 'HIS_SYSTEM',
    'MSH-6': 'HOSPITAL_NAME',
    'MSH-7': hl7TS(),
    'MSH-9': 'ADT^A01',
    'MSH-10': `MSG_${apt.id}_${Date.now()}`,
    'PID-3': apt.patientId,
    'PID-5': apt.patientName,
    'PID-7': '19900101', // 模拟
    'PID-8': 'M', // 模拟
    'PV1-3': apt.examRoom,
    'PV1-4': 'OUTPATIENT',
    'PV1-7': apt.doctorId,
    'PV1-8': apt.doctorName,
    'PV1-19': apt.id,
    'OBR-3': apt.id,
    'OBR-4': apt.examItemId,
    'OBR-7': hl7TS(),
    'OBR-8': apt.appointmentTime,
  };
  const raw = buildHL7String(fields);
  return { type: 'ADT', timestamp: new Date().toISOString(), raw, fields };
}

// 生成 HL7 ORM O01 (检查申请) 消息
export function generateHL7_ORM_O01(apt: Appointment): HL7Message {
  const fields: Record<string, string> = {
    'MSH-3': 'ENDOSCOPY_SYS',
    'MSH-4': 'ENDOSCOPY_CENTER',
    'MSH-5': 'ORDER_SYS',
    'MSH-6': 'HOSPITAL_NAME',
    'MSH-7': hl7TS(),
    'MSH-9': 'ORM^O01',
    'MSH-10': `ORD_${apt.id}_${Date.now()}`,
    'PID-3': apt.patientId,
    'PID-5': apt.patientName,
    'ORC-1': 'NW',
    'ORC-5': 'CM',
    'OBR-3': apt.id,
    'OBR-4': apt.examItemId,
    'OBR-7': hl7TS(),
  };
  const raw = buildHL7String(fields);
  return { type: 'ORM', timestamp: new Date().toISOString(), raw, fields };
}

// 生成 HL7 ORU R01 (检查结果) 消息
export function generateHL7_ORU_R01(exam: EndoscopyExam): HL7Message {
  const fields: Record<string, string> = {
    'MSH-3': 'ENDOSCOPY_SYS',
    'MSH-4': 'ENDOSCOPY_CENTER',
    'MSH-5': 'ENDOSCOPY_SYS',
    'MSH-6': 'HOSPITAL_NAME',
    'MSH-7': hl7TS(),
    'MSH-9': 'ORU^R01',
    'MSH-10': `RES_${exam.id}_${Date.now()}`,
    'PID-3': exam.patientId,
    'PID-5': exam.patientName,
    'OBR-3': exam.appointmentId,
    'OBR-4': exam.examItemId,
    'OBR-7': exam.examDate,
    'OBX-3': 'C001',
    'OBX-5': exam.findings,
    'OBX-11': 'F',
  };
  const raw = buildHL7String(fields);
  return { type: 'ORU', timestamp: new Date().toISOString(), raw, fields };
}

// 生成 HL7 SDM N01 (状态变更) 消息
export function generateHL7_SDM(apt: Appointment, fromStatus: AppointmentStatus, toStatus: AppointmentStatus): HL7Message {
  const fields: Record<string, string> = {
    'MSH-3': 'ENDOSCOPY_SYS',
    'MSH-4': 'ENDOSCOPY_CENTER',
    'MSH-5': 'ENDOSCOPY_SYS',
    'MSH-6': 'HOSPITAL_NAME',
    'MSH-7': hl7TS(),
    'MSH-9': 'SDM^N01',
    'MSH-10': `SDM_${apt.id}_${Date.now()}`,
    'PID-3': apt.patientId,
    'PID-5': apt.patientName,
    'SCH-1': apt.id,
    'SCH-3': apt.examRoom,
    'SCH-7': fromStatus,
    'SCH-8': toStatus,
    'SCH-9': hl7TS(),
  };
  const raw = buildHL7String(fields);
  return { type: 'SDM', timestamp: new Date().toISOString(), raw, fields };
}

// 将字段 map 拼装为原始 HL7 文本
function buildHL7String(fields: Record<string, string>): string {
  const lines: string[] = [];
  const mshKeys = ['MSH-3','MSH-4','MSH-5','MSH-6','MSH-7','MSH-9','MSH-10'];
  const otherKeys = Object.keys(fields).filter(k => !k.startsWith('MSH'));
  lines.push(`MSH|^~\\&|${mshKeys.map(k => fields[k] || '').join('|')}`);
  otherKeys.forEach(k => {
    lines.push(`${k.split('-')[0]}|${k.split('-')[1]}||${fields[k] || ''}|||||||||||||||`);
  });
  return lines.join('\r\n');
}

// ---------- MWL 状态流转规则 ----------
export type MWLTransition =
  | 'SCHEDULED'      // 已预约
  | 'ARRIVED'        // 已到达
  | 'CHECKED_IN'     // 已接诊/登记
  | 'IN_PROGRESS'    // 检查中
  | 'COMPLETED'      // 检查完成
  | 'CANCELLED';     // 已取消

// DICOM MWL Item Status (0020,00068)
export const DICOM_MWL_STATUS: Record<MWLTransition, string> = {
  'SCHEDULED':   'SCHEDULED',
  'ARRIVED':     'ARRIVED',
  'CHECKED_IN':  'CHECKED IN',
  'IN_PROGRESS': 'IN PROGRESS',
  'COMPLETED':   'COMPLETED',
  'CANCELLED':   'CANCELLED',
};

// 状态映射：内部 AppointmentStatus -> DICOM MWL 状态
export function toDicomMWLStatus(aptStatus: AppointmentStatus): MWLTransition {
  switch (aptStatus) {
    case '待确认':   return 'SCHEDULED';
    case '已确认':   return 'SCHEDULED';
    case '待检查':   return 'ARRIVED';
    case '已取消':   return 'CANCELLED';
    case '进行中':   return 'IN_PROGRESS';
    case '检查中':   return 'IN_PROGRESS';
    case '已完成':   return 'COMPLETED';
    case '迟到':     return 'SCHEDULED';
    default:         return 'SCHEDULED';
  }
}

// 允许的流转
export const ALLOWED_TRANSITIONS: Record<MWLTransition, MWLTransition[]> = {
  'SCHEDULED':   ['ARRIVED', 'CANCELLED'],
  'ARRIVED':     ['CHECKED_IN', 'CANCELLED'],
  'CHECKED_IN':  ['IN_PROGRESS', 'CANCELLED'],
  'IN_PROGRESS': ['COMPLETED', 'CANCELLED'],
  'COMPLETED':   [],
  'CANCELLED':   [],
};

// 判断能否流转
export function canTransition(current: MWLTransition, next: MWLTransition): boolean {
  return ALLOWED_TRANSITIONS[current]?.includes(next) ?? false;
}

// 接诊（Arrived -> Checked-In）
export function simulateCheckIn(apt: Appointment): {
  updatedApt: Appointment;
  hl7msg: HL7Message;
  exam?: EndoscopyExam;
} {
  const updatedApt: Appointment = {
    ...apt,
    status: '待检查',
    notes: apt.notes ? `${apt.notes} | [接诊 ${new Date().toLocaleTimeString('zh-CN')}]` : `[接诊 ${new Date().toLocaleTimeString('zh-CN')}]`,
  };
  const hl7msg = generateHL7_ADT_A01(updatedApt);

  // 创建检查记录
  const exam: EndoscopyExam = {
    id: `EX${Date.now()}`,
    appointmentId: apt.id,
    patientId: apt.patientId,
    patientName: apt.patientName,
    gender: '男',
    age: 0,
    examItemId: apt.examItemId,
    examItemName: apt.examItemName,
    doctorId: apt.doctorId,
    doctorName: apt.doctorName,
    nurseId: '',
    nurseName: '',
    examRoom: apt.examRoom,
    examDate: apt.appointmentDate,
    examTime: apt.appointmentTime,
    arrivalTime: new Date().toISOString(),
    status: '已预约',
    findings: '',
    biopsyCount: 0,
    anesthesiaMethod: '局部麻醉',
    recommendations: '',
    imageCount: 0,
  };

  return { updatedApt, hl7msg, exam };
}

// 开始检查
export function simulateStartExam(apt: Appointment): {
  updatedApt: Appointment;
  hl7msg: HL7Message;
} {
  const updatedApt: Appointment = { ...apt, status: '检查中' };
  const mwlStatus = toDicomMWLStatus(apt.status);
  const hl7msg = generateHL7_SDM(updatedApt, apt.status, '检查中');
  void mwlStatus;
  return { updatedApt, hl7msg };
}

// 完成检查
export function simulateCompleteExam(apt: Appointment, exam: EndoscopyExam): {
  updatedApt: Appointment;
  updatedExam: EndoscopyExam;
  hl7msg: HL7Message;
} {
  const updatedApt: Appointment = { ...apt, status: '已完成' };
  const updatedExam: EndoscopyExam = {
    ...exam,
    status: '已完成',
    endTime: new Date().toISOString(),
  };
  const hl7msg = generateHL7_ORU_R01(updatedExam);
  return { updatedApt, updatedExam, hl7msg };
}

// ---------- HL7 消息日志 ----------
export interface HL7LogEntry {
  id: string;
  timestamp: string;
  type: HL7Message['type'];
  patientId: string;
  patientName: string;
  messageId: string;
  status: '发送成功' | '发送失败' | '等待中';
  raw: string;
  note: string;
}

// 全局 HL7 日志（内存）
const _hl7Log: HL7LogEntry[] = [];

export function getHL7Log(): HL7LogEntry[] {
  return [..._hl7Log];
}

export function addHL7Log(msg: HL7Message, patientId: string, patientName: string, note = ''): HL7LogEntry {
  const entry: HL7LogEntry = {
    id: `HL7_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toLocaleString('zh-CN'),
    type: msg.type,
    patientId,
    patientName,
    messageId: msg.fields['MSH-10'] || '',
    status: Math.random() > 0.05 ? '发送成功' : '发送失败', // 5% 模拟失败
    raw: msg.raw,
    note,
  };
  _hl7Log.unshift(entry);
  if (_hl7Log.length > 200) _hl7Log.pop();
  return entry;
}
