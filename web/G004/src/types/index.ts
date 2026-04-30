// ============================================================
// G004 内镜管理系统 - 类型定义
// 内镜信息系统标准架构
// ============================================================

// ---------- 基础枚举 ----------
export type Gender = '男' | '女' | '其他';
export type ExamStatus = '待预约' | '已预约' | '检查中' | '已完成' | '已取消' | '检查异常';
export type ReportStatus = '未开始' | '书写中' | '待审核' | '已审核' | '已打印' | '已发布';
export type EndoscopeStatus = '空闲' | '使用中' | '清洗中' | '消毒中' | '维修中' | '已报废';
export type DisinfectionStatus = '待清洗' | '清洗中' | '消毒中' | '干燥中' | '已完成' | '异常';
export type DisinfectionResult = '合格' | '不合格' | '待复检';
export type QCCheckStatus = '待检查' | '合格' | '不合格' | '已整改';
export type AppointmentStatus = '待确认' | '已确认' | '检查中' | '已完成' | '已取消' | '迟到' | '待检查' | '进行中';
export type UserRole = '医生' | '护士' | '技师' | '管理员';

// ---------- 用户 ----------
export interface User {
  id: string;
  name: string;
  role: UserRole;
  department: string;
  phone: string;
  username: string;
  password?: string;
}

// ---------- 患者 ----------
export interface Patient {
  id: string;
  name: string;
  gender: Gender;
  age: number;
  phone: string;
  idCard: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  allergyHistory: string;       // 过敏史
  medicalHistory: string;       // 病史
  registrationDate: string;     // 登记日期
  lastExamDate?: string;        // 最近检查日期
  totalExamCount: number;       // 累计检查次数
}

// ---------- 检查项目 ----------
export interface ExamItem {
  id: string;
  code: string;
  name: string;
  category: '胃镜' | '肠镜' | '支气管镜' | '喉镜' | '膀胱镜' | 'ERCP' | '超声内镜' | '其他';
  fee: number;
  duration: number;             // 预计时长(分钟)
  preparationInstructions: string; // 检查前准备
  description: string;
}

// ---------- 预约 ----------
export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  examItemId: string;
  examItemName: string;
  doctorId: string;
  doctorName: string;
  examRoom: string;
  appointmentDate: string;       // 预约日期
  appointmentTime: string;       // 预约时段
  status: AppointmentStatus;
  reason: string;               // 预约原因
  notes: string;
  registrationDate: string;
  queueNumber: number;          // 排队号
}

// ---------- 检查（检查执行） ----------
export interface EndoscopyExam {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  gender: Gender;
  age: number;
  examItemId: string;
  examItemName: string;
  doctorId: string;
  doctorName: string;
  nurseId: string;
  nurseName: string;
  examRoom: string;
  endoscopeId?: string;         // 使用的内镜
  examDate: string;
  examTime: string;
  arrivalTime?: string;          // 到达时间
  startTime?: string;           // 开始时间
  endTime?: string;             // 结束时间
  status: ExamStatus;
  // 质控要求（胃镜≥22张图，退镜≥6分钟）
  photoCount?: number;          // 拍照数量
  withdrawalTime?: number;      // 退镜时间(分钟)
  // 检查所见
  findings: string;
  // 活检
  biopsyCount: number;
  biopsyResult?: string;
  // 麻醉
  anesthesiaMethod: string;     // 麻醉方式
  anesthesiaDoctor?: string;
  // 检查后
  recommendations: string;
  complications?: string;       // 并发症
  // 图像
  imageCount: number;
}

// ---------- 内镜设备 ----------
export interface Endoscope {
  id: string;
  code: string;                 // 设备编号
  name: string;
  model: string;                // 型号
  manufacturer: string;         // 厂商
  category: '胃镜' | '肠镜' | '支气管镜' | '十二指肠镜' | '超声内镜' | '其他';
  purchaseDate: string;
  warrantyEnd: string;
  status: EndoscopeStatus;
  currentPatientId?: string;
  totalUseCount: number;        // 累计使用次数
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  location: string;             // 所在位置
  channelCount: number;         // 管道数
  imageSensor: string;          // 图像传感器
}

// ---------- 洗消记录 ----------
export interface DisinfectionRecord {
  id: string;
  endoscopeId: string;
  endoscopeName: string;
  endoscopeCode: string;
  processType: '手工清洗' | '机洗' | 'EOG灭菌' | '高温高压灭菌';
  // 各流程步骤时间
  collectionTime?: string;       // 回收时间
  cleaningStartTime?: string;
  cleaningEndTime?: string;
  cleaningPerson: string;
  cleaningResult: DisinfectionResult;
  cleaningNotes?: string;
  // 消毒
  disinfectionStartTime?: string;
  disinfectionEndTime?: string;
  disinfectantName?: string;    // 消毒剂名称
  disinfectantLot?: string;     // 消毒剂批号
  disinfectionTemperature?: number; // 消毒温度(°C)
  disinfectionDuration?: number; // 消毒时长(分钟)
  disinfectionResult?: DisinfectionResult;
  // 干燥
  dryingStartTime?: string;
  dryingEndTime?: string;
  dryingResult?: DisinfectionResult;
  // 存储
  storageTime?: string;
  storageLocation?: string;
  storagePerson?: string;
  expirationDate?: string;       // 有效截止日期
  // 最终状态
  finalResult: DisinfectionResult;
  // 关联患者（追溯）
  relatedPatientId?: string;
  relatedPatientName?: string;
  relatedExamId?: string;
  // 状态
  status: DisinfectionStatus;
  // 生物监测
  biologicalMonitoring?: '合格' | '不合格' | '未做';
  biologicalMonitoringDate?: string;
}

// ---------- 检查报告 ----------
export interface EndoscopyReport {
  id: string;
  examId: string;
  patientId: string;
  patientName: string;
  gender: Gender;
  age: number;
  examItemName: string;
  examDate: string;
  doctorId: string;
  doctorName: string;
  // 基本信息
  chiefComplaint: string;        // 主诉
  history: string;              // 病史
  diagnosis: string;           // 诊断
  // 检查详情
  indications: string;         // 检查指征
  anesthesiaMethod: string;    // 麻醉方式
  // 镜下所见
  findings: string;
  // 图片记录
  imageUrls: string[];
  // 活检
  biopsyTaken: boolean;
  biopsyCount?: number;
  biopsyResult?: string;
  // 结论
  conclusion: string;
  // 建议
  recommendations: string;
  // 审核
  status: ReportStatus;
  auditDoctorId?: string;
  auditDoctorName?: string;
  auditTime?: string;
  auditSuggestion?: string;
  // 打印/发布
  printedTime?: string;
  publishedTime?: string;
  // 危急值
  criticalValue: boolean;
  criticalValueAlerted?: boolean;
  criticalValueAlertTime?: string;
  // 报告模板
  templateId?: string;
  templateName?: string;
  // 创建时间
  createdTime: string;
  updatedTime: string;
}

// ---------- 报告模板 ----------
export interface ReportTemplate {
  id: string;
  name: string;
  category: '胃镜' | '肠镜' | '支气管镜' | '其他';
  content: string;
  createdBy: string;
  usageCount: number;
}

// ---------- 数据字典 ----------
export interface DictionaryItem {
  id: string;
  category: string;            // 分类
  code: string;
  name: string;
  pinyin?: string;
  sortOrder: number;
  isActive: boolean;
  notes?: string;
}

// ---------- 质控检查 ----------
export interface QCCheck {
  id: string;
  checkDate: string;
  checkType: '日常质控' | '月度质控' | '季度质控' | '专项质控';
  examinerId: string;
  examinerName: string;
  // 胃镜质控（≥22张图）
  gastroscopyPhotoCount?: number;
  gastroscopyMinPhotos?: number;
  gastroscopyPhotoPass?: boolean;
  // 肠镜质控（退镜≥6分钟）
  colonoscopyWithdrawalTime?: number;
  colonoscopyMinWithdrawal?: number;
  colonoscopyWithdrawalPass?: boolean;
  // 其他质控项
  disinfectionComplianceRate?: number; // 洗消合规率
  reportCompletionRate?: number;        // 报告完成率
  criticalValueReportingRate?: number;   // 危急值报告率
  adverseEventCount?: number;            // 不良事件数
  // 总体评价
  overallStatus: QCCheckStatus;
  findings: string;
  improvementSuggestions: string;
  nextCheckDate?: string;
}

// ---------- 统计分析 ----------
export interface StatisticsData {
  // 日常统计
  todayExamCount: number;
  todayReportCount: number;
  todayDisinfectionCount: number;
  todayCriticalValueCount: number;
  // 本月统计
  monthExamCount: number;
  monthReportCompletionRate: number;
  monthGastroscopyAvgPhotos: number;
  monthColonoscopyAvgWithdrawal: number;
  monthDisinfectionPassRate: number;
  monthCriticalValueCount: number;
  // 趋势数据（近7天）
  examTrend: { date: string; count: number }[];
  reportTrend: { date: string; count: number }[];
  // 各检查类型分布
  examTypeDistribution: { name: string; value: number }[];
  // 各检查室工作量
  roomWorkload: { room: string; count: number }[];
  // 医生工作量
  doctorWorkload: { doctor: string; count: number }[];
  // 雷达图数据（新增）
  departmentRadarData: { subject: string; A: number; B: number }[];
  doctorRadarData: { subject: string; A: number; B: number }[];
}

// ---------- 审计日志 ----------
export interface AuditLog {
  id: string;
  actionTime: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  actionType: '登录' | '新增' | '修改' | '删除' | '审核' | '打印' | '发布' | '质控' | '系统';
  module: string;
  targetName: string;
  targetId: string;
  beforeValue?: string;
  afterValue?: string;
  ipAddress: string;
  result: '成功' | '失败';
  notes?: string;
}

// ---------- 检查室 ----------
export interface ExamRoom {
  id: string;
  name: string;
  code: string;
  location: string;
  equipment: string;
  isActive: boolean;
}

// ---------- 排班 ----------
export interface DoctorSchedule {
  id: string;
  doctorId: string;
  doctorName: string;
  examRoomId: string;
  examRoomName: string;
  weekday: number;            // 1-7 (周一至周日)
  shiftType: '上午' | '下午' | '全天' | '夜班' | '值班';
  startTime: string;
  endTime: string;
  maxAppointments: number;    // 最大预约数
  currentAppointments: number;
  isActive: boolean;
}

// ---------- 危急值 ----------
export interface CriticalValue {
  id: string;
  examId: string;
  patientId: string;
  patientName: string;
  examItemName: string;
  criticalValueType: string;
  criticalValueContent: string;
  detectedDoctorId: string;
  detectedDoctorName: string;
  detectedTime: string;
  reportedDoctorId?: string;
  reportedDoctorName?: string;
  reportedTime?: string;
  reportMethod?: '电话' | '口头' | '书面';
  patientResponse?: string;
  handled: boolean;
  handledTime?: string;
  notes?: string;
}

// ---------- 洗消流程配置 ----------
export interface DisinfectionProcess {
  id: string;
  name: string;
  category: '胃镜' | '肠镜' | '支气管镜' | '通用';
  steps: DisinfectionStep[];
  isDefault: boolean;
  isActive: boolean;
}

export interface DisinfectionStep {
  stepName: string;
  stepOrder: number;
  requiredDuration: number;   // 最短时间(分钟)
  maxDuration?: number;       // 最长时间(分钟)
  required: boolean;
  notes?: string;
}

// ---------- 随访管理 ----------
export type FollowUpType = '术后随访' | '化疗后随访' | '复查提醒' | '不良反应追踪';
export type FollowUpCycle = '7天' | '30天' | '90天' | '180天' | '1年';
export type FollowUpStatus = '已随访' | '待随访' | '逾期未访' | '已失访';
export type FollowUpMethod = '电话随访' | '门诊随访' | '在线随访' | '住院复查';
export type FollowUpConclusion = '治愈' | '好转' | '稳定' | '恶化' | '失访' | '死亡';
export type ReminderType = '短信' | '电话' | '邮件';

export interface FollowUp {
  id: string;
  patientId: string;
  patientName: string;
  gender: Gender;
  age: number;
  phone: string;
  // 随访计划
  followUpType: FollowUpType;
  followUpCycle: FollowUpCycle;
  status: FollowUpStatus;
  scheduledDate: string;      // 计划随访日期
  followUpDate?: string;       // 实际随访日期
  // 随访方式
  followUpMethod?: FollowUpMethod;
  // 随访内容
  symptoms?: string;           // 症状询问
  vitalSigns?: string;         // 体征记录
  examResults?: string;        // 检查结果
  medication?: string;         // 用药情况
  karnofskyScore?: number;     // Karnofsky生活质量评分(0-100)
  // 随访结论
  conclusion?: FollowUpConclusion;
  // 肿瘤专项
  isOncologyPatient?: boolean;
  tnmStage?: string;           // TNM分期 (如: T2N0M0)
  recurrenceMonitor?: string;  // 复发/转移监测
  survivalStatus?: '生存' | '死亡' | '失访';
  // 提醒
  reminderSent?: boolean;
  reminderDate?: string;
  // 备注
  notes?: string;
  // 医生
  doctorId?: string;
  doctorName?: string;
}

export interface FollowUpReminder {
  id: string;
  patientId: string;
  patientName: string;
  followUpId: string;
  reminderType: ReminderType;
  scheduledDate: string;
  sentDate?: string;
  status: '待发送' | '已发送' | '失败';
}
