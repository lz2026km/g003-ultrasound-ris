// ===== G002 RIS系统类型定义 =====

// 检查模态
export type Modality = 'DR' | 'CT' | 'MR' | '胃肠造影' | '乳腺钼靶' | '口腔全景' | '骨密度' | '超声' | '混合';

// 检查项目
export interface ExamItem {
  id: string;
  name: string;
  modality: Modality;
  bodyPart: string;
  price: number;
  duration: number; // 分钟
  preparation: string;
  reportTAT: number; // 小时
}

// 设备
export interface Equipment {
  id: string;
  name: string;
  model: string;
  manufacturer: string;
  modality: Modality;
  installDate: string;
  status: '正常' | '维护中' | '故障';
  lastMaintenance: string;
  nextMaintenance: string;
  note?: string;
}

// 检查状态
export type ExamStatus = '已预约' | '已登记' | '检查中' | '已完成' | '已报告' | '已取消';
// 报告状态
export type ReportStatus = '待书写' | '待审核' | '已完成' | '已发布';
// 优先级
export type Priority = '普通' | '急诊' | '优先';

// ===== 检查记录 =====
export interface Exam {
  id: string;
  patientId: string;
  accessionNumber: string;
  examItemId: string;
  examItemName: string;
  modality: Modality;
  bodyPart: string;
  scheduledDate: string;
  scheduledTime: string;
  clinicalDiagnosis: string;
  requestingPhysician: string;
  status: ExamStatus;
  priority: Priority;
  studyInstanceUID: string;
  technitian?: string;
  radiologist?: string;
  reportId?: string;
  charge: number;
  notes?: string;
}

// ===== 患者信息 =====
export interface Patient {
  id: string;
  name: string;
  gender: '男' | '女';
  birthDate: string;
  idCard: string;
  phone: string;
  address: string;
  medicalRecordNo: string;
  age: number;
  registrationDate?: string; // P0-6: 患者登记日期，用于"本周新增"筛选
}

// ===== 报告记录 =====
export interface Report {
  id: string;
  examId: string;
  patientId: string;
  accessionNumber: string;
  examItemName: string;
  modality: Modality;
  findings: string;
  impression: string;
  suggestion: string;
  radiologist: string;
  审核医师?: string;
  reportTime: string;
  auditTime?: string;
  status: ReportStatus;
  isUrgent: boolean;
  criticalValue?: string;
}

// ===== 危急值 =====
export interface CriticalValue {
  id: string;
  examId: string;
  patientId: string;
  patientName: string;
  modality: Modality;
  description: string;
  urgencyLevel: '高' | '中' | '低';
  reportTime: string;
  notifyTime?: string;
  handler?: string;
  status: '待通知' | '已通知' | '已处理';
}

// ===== 设备故障记录 =====
export interface EquipmentFaultRecord {
  id: string;
  equipmentId: string;
  equipmentName: string;
  modality: Modality;
  faultTime: string;
  faultType: '硬件故障' | '软件故障' | '安全隐患' | '其他';
  faultDescription: string;
  downtimeHours: number;
  status: '维修中' | '已修复';
  repairer?: string;
  repairStartTime?: string;
  repairEndTime?: string;
  faultCause?: string;
  solution?: string;
  repairCost?: number;
  createdAt: string;
}

// ===== 设备使用记录 =====
export interface EquipmentUsageLog {
  id: string;
  equipmentId: string;
  equipmentName: string;
  modality: Modality;
  examId?: string;
  patientId?: string;
  patientName?: string;
  technitian: string;
  startTime: string;
  endTime: string;
  duration: number; // 分钟
  status: '正常使用' | '待机' | '测试' | '维修';
  note?: string;
}

// ===== 设备质控记录 =====
export interface EquipmentQcRecord {
  id: string;
  equipmentId: string;
  equipmentName: string;
  modality: Modality;
  qcDate: string;
  qcType: '图像质量' | '剂量' | '安全检查' | '准确性';
  checkItem: string;
  result: '合格' | '不合格';
  standardValue: string;
  measuredValue: string;
  inspector: string;
  note?: string;
}

// ===== 维保预警 =====
export interface MaintenanceAlert {
  id: string;
  equipmentId: string;
  equipmentName: string;
  modality: Modality;
  alertType: '即将维护' | '已逾期' | '维保计划';
  alertDate: string;
  nextMaintenance: string;
  daysLeft: number;
  handled: boolean;
  handledBy?: string;
  handledTime?: string;
  note?: string;
}

// ===== 辐射防护记录 =====
export interface RadiationProtectionRecord {
  id: string;
  equipmentId: string;
  equipmentName: string;
  modality: Modality;
  inspectionDate: string;
  inspector: string;
  protectiveEquipment: string;
  leadClothingStatus: string;
  leadGlassStatus: string;
  radiationLeakage: string;
  dosimeterReading: number; // mSv
  warningSignIntact: boolean;
  note?: string;
}

// ===== 质控标准 =====
export interface QcStandard {
  id: string;
  category: string;
  checkPoint: string;
  standard: string;
  target: string;
}

// ===== 报告模板 =====
export interface ReportTemplate {
  id: string;
  examItemId: string;
  examItemName: string;
  modality: string;
  examination: string;
  normalFindings: string;
  commonFindings: { label: string; description: string }[];
  normalImpression: string;
  commonImpressions: { label: string; impression: string; suggestion: string }[];
}

// ===== 危急值模板 =====
export interface CriticalValueTemplate {
  id: string;
  modality: Modality;
  label: string;
  keywords: string[];
  description: string;
  urgencyLevel: '高' | '中' | '低';
}

// ===== 时效阈值 =====
export interface TimelinessThreshold {
  modality: Modality | 'ALL';
  warningMinutes: number;
  urgentMinutes: number;
}

// ===== 收费预设 =====
export interface ChargePreset {
  id: string;
  name: string;
  description: string;
  items: { examItemId: string; examItemName: string; modality: Modality; price: number; discount?: number }[];
  totalPrice: number;
  discountRate?: number;
  priority?: Priority;
  applicableModality: Modality[];
}

// ===== 性别规则 =====
export interface GenderRule {
  examItemId: string;
  appropriateness: string;
  reason: string;
}

// ===== 检查队列 =====
export interface ExamQueue {
  id: string;
  name: string;
  modality: Modality | '混合';
  deviceId?: string;
  deviceName?: string;
  status: '等待' | '检查中' | '暂停';
  currentNumber: number;
  waitingCount: number;
  displayOrder: number;
}

// ===== MWL项目 =====
export interface MWLItem {
  id: string;
  patientId: string;
  patientName: string;
  patientGender: '男' | '女';
  patientAge: number;
  patientBirthDate: string;
  patientPhone: string;
  accessionNumber: string;
  examItemId: string;
  examItemName: string;
  modality: Modality;
  bodyPart: string;
  scheduledDate: string;
  scheduledTime: string;
  clinicalDiagnosis: string;
  requestingPhysician: string;
  status: '已预约' | '已登记' | '已完成' | '已取消';
  priority: Priority;
  notes?: string;
  studyInstanceUID: string;
  referringPhysicianName: string;
  patientWeight?: number;
  patientHeight?: number;
  medicalRecordLocator?: string;
}

// ===== 影像号配置 =====
export interface ImageNumberConfig {
  prefix: string;
  dateFormat: string;
  startNumber: number;
  digits: number;
}

// ===== 统计数据类型 =====
export interface DailyStat {
  date: string;
  examCount: number;
  reportCount: number;
  modality: Modality;
  revenue: number;
}

export interface EquipmentUtilization {
  equipmentId: string;
  equipmentName: string;
  modality: Modality;
  totalHours: number;
  examCount: number;
  utilizationRate: number;
}

// ===== 报告打印记录 =====
export interface ReportPrintRecord {
  id: string;
  reportId: string;
  patientId: string;
  patientName: string;
  examItemName: string;
  modality: Modality;
  printedBy: string;
  printedAt: string;
  printCopies: number;
  printType: '诊断报告' | '急诊报告' | '副本' | '临床会诊';
  printerName: string;
  paperSize: 'A4' | 'A5';
}

// ===== 系统审计日志 =====
export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: '医师' | '技师' | '护士' | '管理员';
  action: string;
  target: string;
  targetId: string;
  detail: string;
  ipAddress: string;
  result: '成功' | '失败' | '警告';
}

// ===== 危急值通知记录 =====
export interface CriticalValueNotification {
  id: string;
  examId: string;
  reportId: string;
  patientId: string;
  patientName: string;
  modality: Modality;
  criticalValue: string;
  urgencyLevel: '高' | '中' | '低';
  reportTime: string;
  notifiedTo: string;
  notifiedBy: string;
  notifyTime: string;
  notifyMethod: '电话' | '短信' | '系统' | '对讲';
  responseTime: string; // 分钟
  status: '待通知' | '已通知' | '已确认' | '已处理';
  note?: string;
}

// ===== 月度报告汇总 =====
export interface MonthlyReport {
  id: string;
  year: number;
  month: number;
  totalExams: number;
  totalReports: number;
  totalRevenue: number;
  avgReportTAT: number; // 小时
  criticalValueCount: number;
  reportErrorCount: number;
  equipmentDowntimeHours: number;
  patientSatisfaction: number; // 百分比
  topExams: { examItemName: string; count: number }[];
  modalityDistribution: { modality: Modality; count: number; revenue: number }[];
}

// ===== 报告审核记录 =====
export interface ReportAuditRecord {
  id: string;
  reportId: string;
  patientId: string;
  patientName: string;
  examItemName: string;
  modality: Modality;
  originalFindings: string;
  originalImpression: string;
  modifiedFindings?: string;
  modifiedImpression?: string;
  modifyReason: string;
  auditorName: string;
  authorName: string;
  auditTime: string;
  auditResult: '通过' | '驳回' | '修改';
}

// ===== 系统通知 =====
export interface SystemNotification {
  id: string;
  type: '维护公告' | '系统更新' | '质控提醒' | '危急值' | '预约提醒' | '其他';
  title: string;
  content: string;
  priority: '紧急' | '重要' | '一般';
  createdAt: string;
  expiresAt?: string;
  readBy: string[];
  targetRoles: ('医师' | '技师' | '护士' | '管理员')[];
}

// ===== 报告超时记录 =====
export interface ReportTimeoutRecord {
  id: string;
  reportId: string;
  examId: string;
  patientId: string;
  patientName: string;
  examItemName: string;
  modality: Modality;
  examCompletedTime: string;
  reportDeadline: string;
  reportActualTime?: string;
  timeoutMinutes?: number;
  status: '超时' | '即将超时' | '正常';
  radiologist?: string;
}

// ===== 用户与权限 =====
export interface User {
  id: string;
  username: string;
  realName: string;
  role: UserRole;
  department: string;
  title?: string; // 主任医师/副主任医师/主治医师/住院医师/技师/护士
  phone: string;
  email?: string;
  isActive: boolean;
  lastLogin?: string;
}

export type UserRole = '医师' | '技师' | '护士' | '管理员' | '超级管理员';

export interface LoginRecord {
  id: string;
  userId: string;
  userName: string;
  loginTime: string;
  logoutTime?: string;
  ipAddress: string;
  device: string; // Chrome/Edge/Firefox/Safari + OS
  result: '成功' | '失败';
  failureReason?: string;
}

// ===== DICOM 影像实体 =====
export interface DicomSeries {
  seriesInstanceUID: string;
  seriesNumber: number;
  modality: Modality;
  seriesDescription: string;
  seriesDate: string;
  seriesTime: string;
  bodyPart: string;
  sliceThickness: number; // mm
  imageCount: number;
  images: DicomInstance[];
}

export interface DicomInstance {
  sopInstanceUID: string;
  seriesInstanceUID: string;
  instanceNumber: number; // 第几帧
  sopClassUID: string;
  rows: number;
  columns: number;
  bitsAllocated: number;
  windowCenter: number;
  windowWidth: number;
  rescaleIntercept: number;
  rescaleSlope: number;
  imagePosition: number; // mm
}

// ===== 检查预约 =====
export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientGender: '男' | '女';
  patientAge: number;
  patientPhone: string;
  examItemId: string;
  examItemName: string;
  modality: Modality;
  bodyPart: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentType: '门诊' | '住院' | '体检' | '急诊';
  clinicalDiagnosis: string;
  requestingPhysician: string;
  requestingDept: string;
  status: AppointmentStatus;
  notes?: string;
 StudyInstanceUID: string;
  cancelReason?: string;
  cancelledAt?: string;
}

export type AppointmentStatus = '已预约' | '已确认' | '已登记' | '已完成' | '已取消' | '超时未到';

// ===== 班次与排班 =====
export interface WorkShift {
  id: string;
  userId: string;
  userName: string;
  role: UserRole;
  modality: Modality | '混合';
  shiftDate: string;
  shiftType: '早班' | '中班' | '夜班' | '加班' | '休息';
  startTime: string; // 08:00
  endTime: string;   // 16:00
  equipmentId?: string;
  equipmentName?: string;
  note?: string;
}

// ===== 模板管理 =====
export interface NormalFindingTemplate {
  id: string;
  modality: Modality;
  bodyPart: string;
  content: string;
  usageCount: number;
}

export interface ImpressionTemplate {
  id: string;
  modality: Modality;
  bodyPart: string;
  label: string;
  content: string;
  isPositive: boolean; // true=阳性模板，false=阴性模板
  usageCount: number;
}

// ===== 报告二级审核 =====
export interface ReportSecondAudit {
  id: string;
  reportId: string;
  examId: string;
  patientId: string;
  patientName: string;
  examItemName: string;
  modality: Modality;
  authorId: string;
  authorName: string;
  authorTitle: string;
  findings: string;
  impression: string;
  suggestion: string;
  submitTime: string;
  auditorId?: string;
  auditorName?: string;
  auditorTitle?: string;
  auditTime?: string;
  auditResult?: '通过' | '驳回' | '修改';
  rejectReason?: string;
  modifiedFindings?: string;
  modifiedImpression?: string;
  modifyReason?: string;
  signature?: string; // 电子签名（Base64或姓名）
  status: '待审核' | '审核中' | '已通过' | '已驳回' | '已修改';
}

// ===== 数据字典条目 =====
export interface DictionaryEntry {
  id: string;
  category: '检查项目' | '检查分组' | '检查部位' | '术语对照' | '收费项目';
  code: string;
  name: string;
  alias?: string;
  pinyin?: string;
  standardCode?: string; // 国家标准/ICD-10编码
  modality?: Modality | '通用';
  isActive: boolean;
  sortOrder: number;
}

// ===== 审核日志（报告修改记录）=====
export interface ReportModificationLog {
  id: string;
  reportId: string;
  operatorId: string;
  operatorName: string;
  operatorRole: UserRole;
  action: '创建' | '修改' | '审核通过' | '审核驳回' | '打印' | '发布' | '撤回';
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
  timestamp: string;
  ipAddress: string;
  deviceInfo: string;
}

// ===== 报告超时规则配置 =====
export interface TATThreshold {
  id: string;
  modality: Modality;
  priority: Priority;
  warningMinutes: number;   // 警告阈值（分钟）
  urgentMinutes: number;    // 超时阈值（分钟）
  isEnabled: boolean;
}

// ===== 设备运行日志 =====
export interface EquipmentRunningLog {
  id: string;
  equipmentId: string;
  equipmentName: string;
  modality: Modality;
  shiftId?: string;
  technitianId: string;
  technitianName: string;
  startTime: string;
  endTime?: string;
  status: '运行' | '待机' | '维护' | '故障' | '空闲';
  examCount: number;
  patientCount: number;
  totalDoseLengthProduct?: number; // mGy·cm
  tubeHeat?: number; // 球管热度%
  note?: string;
}

// ===== 通知消息 =====
export interface NotificationMessage {
  id: string;
  type: '危急值' | '报告发布' | '审核驳回' | '预约确认' | '设备故障' | '系统公告' | 'TAT预警';
  title: string;
  content: string;
  priority: '紧急' | '重要' | '一般';
  senderId?: string;
  senderName?: string;
  recipientId: string;
  recipientName: string;
  relatedId?: string;   // 关联报告ID/检查ID/设备ID等
  createdAt: string;
  readAt?: string;
  expiresAt?: string;
}

// ===== 模态配置 =====
export interface ModalityConfig {
  modality: Modality;
  displayName: string;
  color: string;
  hasContrast: boolean;
  hasRadiation: boolean;
  defaultTATHours: number;
  requiresPreperation: boolean;
  preparationInstructions?: string;
}

// ===== 医师工作量详细统计 =====
export interface RadiologistWorkloadDetail {
  userId: string;
  userName: string;
  title: string;
  modality: Modality;
  date: string;
  reportCount: number;
  avgReportMinutes: number;
  urgentCount: number;
  criticalCount: number;
  modifyCount: number;         // 被驳回修改次数
  firstTimePassCount: number;  // 首次通过数
  avgTATMinutes: number;       // 平均TAT（分钟）
  qualityScore: number;        // 质量评分 0-100
}

// ===== 报告撤回记录 =====
export interface ReportRecallRecord {
  id: string;
  reportId: string;
  recalledBy: string;
  recalledByName: string;
  recallTime: string;
  recallReason: string;
  previousReportContent: string;
  previousReportTime: string;
  newReportId?: string; // 重新发布后的新报告ID
  status: '已撤回' | '重新发布';
}

// ===== 科室工作量统计 =====
export interface DepartmentWorkloadStat {
  department: string;
  modality: Modality;
  totalExams: number;
  totalReports: number;
  avgReportTAT: number;    // 小时
  avgFilmDeliveryTAT: number; // 小时（片子上传TAT）
  criticalValueCount: number;
  reportErrorCount: number;
  patientSatisfaction: number;
  radiologistCount: number;
  technitianCount: number;
}

// ===== 患者随访记录 =====
export interface PatientFollowUp {
  id: string;
  patientId: string;
  examId: string;
  reportId: string;
  followUpDate: string;
  followUpType: '门诊随访' | '电话随访' | '住院随访' | '影像复查';
  outcome: string;
  radiologistSuggestion?: string;
  nextFollowUpDate?: string;
  recordedBy: string;
  recordedAt: string;
  note?: string;
}

// ===== 危急值历史追踪 =====
export interface CriticalValueTracking {
  id: string;
  examId: string;
  reportId: string;
  patientId: string;
  patientName: string;
  modality: Modality;
  criticalValueType: string;
  urgencyLevel: '高' | '中' | '低';
  detectedAt: string;
  reportedBy: string;
  reportedByName: string;
  notifiedTo: string;
  notifyMethod: '电话' | '短信' | '系统' | '对讲';
  notifyTime: string;
  responseTime: number; // 分钟
  clinicalConfirmed: boolean;
  clinicalOutcome?: string;
  status: '待确认' | '已确认' | '处理中' | '已处理';
  note?: string;
}

// ===== 检查项目适宜性检查 =====
export interface ExamAppropriateness {
  id: string;
  patientId: string;
  examItemId: string;
  modality: Modality;
  patientAge: number;
  patientGender: '男' | '女';
  clinicalIndication: string;
  appropriatenessScore: 1 | 2 | 3 | 4 | 5; // 1=不合适，5=非常合适
  appropriatenessReason: string;
  alternativeSuggestion?: string;
  insuranceType?: string; // 医保类型，影响报销
  checkedAt: string;
}
export interface RadiologistWorkload {
  userId: string;
  userName: string;
  date: string;
  reportCount: number;
  avgReportMinutes: number;
  urgentCount: number;
  criticalCount: number;
  modifyCount: number;
  modality: Modality;
}
