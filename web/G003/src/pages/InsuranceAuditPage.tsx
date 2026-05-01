// ============================================================
// G004 超声管理系统 - 医保审核页面
// 审核待办 / 审核历史 / 限制药品库 / 适应证规则
// ============================================================
import { useState, useMemo } from 'react'
import {
  ShieldCheck, Clock, CheckCircle, XCircle, AlertTriangle,
  Search, Filter, RefreshCw, ChevronLeft, ChevronRight,
  FileText, Pill, Stethoscope, User, Calendar, MessageSquare,
  Check, X, Send, BookOpen, ClipboardList, Activity
} from 'lucide-react'

// ---------- 类型定义 ----------
interface PendingAudit {
  id: string
  patientName: string
  patientId: string
  examType: string
  examItem: string
  drugName: string
  drugSpec: string
  restriction: string
  reason: string
  submitTime: string
  submitDept: string
  urgency: '高' | '中' | '低'
}

interface AuditHistory {
  id: number
  patientName: string
  patientId: string
  examType: string
  examItem: string
  drugName: string
  result: '通过' | '拒绝' | '补充资料'
  auditor: string
  auditTime: string
  reason?: string
}

interface RestrictedDrug {
  id: number
  name: string
  category: string
  restriction: string
  applicableExams: string
  notes: string
}

interface IndicationRule {
  id: number
  examType: string
  examName: string
  drugName: string
  insuranceRequirement: string
  description: string
}

// ---------- 演示数据 ----------

// 审核待办 - 15条
const pendingAudits: PendingAudit[] = [
  { id: 'PA001', patientName: '王秀兰', patientId: 'P10001', examType: '腹部超声', examItem: '无痛腹部超声检查', drugName: '丙泊酚注射液', drugSpec: '50ml:500mg', restriction: '限二级以上公立医疗机构使用', reason: '门诊患者申请门诊手术镇静', submitTime: '2026-04-30 09:15', submitDept: '消化内科门诊', urgency: '高' },
  { id: 'PA002', patientName: '李建国', patientId: 'P10002', examType: '肠镜', examItem: '浅表超声检查', drugName: '复方聚乙二醇散', drugSpec: '68.56g*10袋', restriction: '限肠镜检查前肠道清洁', reason: '常规肠道准备', submitTime: '2026-04-30 09:32', submitDept: '消化内科门诊', urgency: '中' },
  { id: 'PA003', patientName: '张伟', patientId: 'P10003', examType: 'ERCP', examItem: '逆行胰胆管造影', drugName: '盐酸哌替啶注射液', drugSpec: '1ml:50mg', restriction: '限急性疼痛、术后镇痛', reason: 'ERCP术中镇痛', submitTime: '2026-04-30 09:45', submitDept: '肝胆外科', urgency: '高' },
  { id: 'PA004', patientName: '陈美娟', patientId: 'P10004', examType: '腹部超声', examItem: '普通腹部超声检查', drugName: '盐酸丁卡因胶浆', drugSpec: '10g:80mg', restriction: '限表面麻醉', reason: '咽部局部麻醉', submitTime: '2026-04-30 10:02', submitDept: '消化内科门诊', urgency: '低' },
  { id: 'PA005', patientName: '刘大力', patientId: 'P10005', examType: '超声超声探头', examItem: 'EUS-FNA', drugName: '注射用英夫利西单抗', drugSpec: '100mg', restriction: '限克罗恩病、类风湿关节炎', reason: '克罗恩病伴狭窄', submitTime: '2026-04-30 10:18', submitDept: '消化内科', urgency: '中' },
  { id: 'PA006', patientName: '赵雪梅', patientId: 'P10006', examType: '肠镜', examItem: '无痛浅表超声', drugName: '地西泮注射液', drugSpec: '2ml:10mg', restriction: '限癫痫持续状态、麻醉前给药', reason: '浅表超声检查镇静', submitTime: '2026-04-30 10:35', submitDept: '消化内科门诊', urgency: '中' },
  { id: 'PA007', patientName: '孙国庆', patientId: 'P10007', examType: '腹部超声', examItem: 'ESD术', drugName: '甘油果糖注射液', drugSpec: '250ml', restriction: '限脱水及脑水肿治疗', reason: 'ESD术后减轻脑水肿', submitTime: '2026-04-30 10:52', submitDept: '消化内科', urgency: '低' },
  { id: 'PA008', patientName: '周丽华', patientId: 'P10008', examType: 'ERCP', examItem: 'ERCP+EST', drugName: '硫酸阿托品注射液', drugSpec: '1ml:0.5mg', restriction: '限有机磷中毒、缓慢型心律失常', reason: 'ERCP前抑制肠蠕动', submitTime: '2026-04-30 11:08', submitDept: '肝胆外科', urgency: '高' },
  { id: 'PA009', patientName: '吴明', patientId: 'P10009', examType: '腹部超声', examItem: '腹部超声下止血术', drugName: '肾上腺素注射液', drugSpec: '1ml:1mg', restriction: '限过敏性休克、心脏骤停', reason: '腹部超声下局部止血', submitTime: '2026-04-30 11:25', submitDept: '消化内科急诊', urgency: '高' },
  { id: 'PA010', patientName: '郑小红', patientId: 'P10010', examType: '肠镜', examItem: '肠镜下息肉切除', drugName: '二氧化碳气体', drugSpec: '10L/瓶', restriction: '限腔镜手术充气', reason: '肠镜术中充气', submitTime: '2026-04-30 11:42', submitDept: '消化内科', urgency: '低' },
  { id: 'PA011', patientName: '黄志强', patientId: 'P10011', examType: '超声超声探头', examItem: '胰腺EUS', drugName: '醋酸戈舍瑞林缓释植入剂', drugSpec: '3.6mg', restriction: '限前列腺癌、乳腺癌', reason: '前列腺癌伴消化道侵犯待查', submitTime: '2026-04-30 12:00', submitDept: '肿瘤科', urgency: '中' },
  { id: 'PA012', patientName: '林晓峰', patientId: 'P10012', examType: '腹部超声', examItem: '食管扩张术', drugName: '硝酸甘油注射液', drugSpec: '5ml:5mg', restriction: '限冠心病、心绞痛', reason: '食管痉挛缓解', submitTime: '2026-04-30 13:15', submitDept: '消化内科', urgency: '中' },
  { id: 'PA013', patientName: '杨丽', patientId: 'P10013', examType: '肠镜', examItem: '小肠镜检查', drugName: '双歧杆菌三联活菌胶囊', drugSpec: '0.5g*24粒', restriction: '限肠道菌群失调', reason: '肠道菌群调节', submitTime: '2026-04-30 13:30', submitDept: '消化内科', urgency: '低' },
  { id: 'PA014', patientName: '徐斌', patientId: 'P10014', examType: 'ERCP', examItem: '胆道支架置入', drugName: '注射用头孢哌酮钠舒巴坦钠', drugSpec: '1.5g', restriction: '限中重度感染', reason: '预防ERCP术后胆道感染', submitTime: '2026-04-30 13:48', submitDept: '肝胆外科', urgency: '高' },
  { id: 'PA015', patientName: '马秀英', patientId: 'P10015', examType: '腹部超声', examItem: '胃造口术', drugName: '肠内营养混悬液', drugSpec: '500ml', restriction: '限不能经口进食患者', reason: '经胃造口肠内营养', submitTime: '2026-04-30 14:05', submitDept: '消化内科', urgency: '中' },
]

// 审核历史 - 40条
const auditHistory: AuditHistory[] = [
  { id: 1, patientName: '张三', patientId: 'P20001', examType: '腹部超声', examItem: '无痛腹部超声', drugName: '丙泊酚注射液', result: '通过', auditor: '李审核', auditTime: '2026-04-29 14:20' },
  { id: 2, patientName: '李四', patientId: 'P20002', examType: '肠镜', examItem: '浅表超声', drugName: '复方聚乙二醇散', result: '通过', auditor: '王审核', auditTime: '2026-04-29 14:35' },
  { id: 3, patientName: '王五', patientId: 'P20003', examType: 'ERCP', examItem: '逆行胰胆管造影', drugName: '盐酸哌替啶注射液', result: '拒绝', auditor: '李审核', auditTime: '2026-04-29 14:50', reason: '适应证不符，限急性疼痛使用' },
  { id: 4, patientName: '赵六', patientId: 'P20004', examType: '腹部超声', examItem: '普通腹部超声', drugName: '盐酸丁卡因胶浆', result: '通过', auditor: '张审核', auditTime: '2026-04-29 15:05' },
  { id: 5, patientName: '钱七', patientId: 'P20005', examType: '超声超声探头', examItem: 'EUS-FNA', drugName: '注射用英夫利西单抗', result: '拒绝', auditor: '李审核', auditTime: '2026-04-29 15:20', reason: '克罗恩病未在医保限用范围' },
  { id: 6, patientName: '孙八', patientId: 'P20006', examType: '肠镜', examItem: '无痛浅表超声', drugName: '地西泮注射液', result: '补充资料', auditor: '王审核', auditTime: '2026-04-29 15:35', reason: '需提供患者心电图' },
  { id: 7, patientName: '周九', patientId: 'P20007', examType: '腹部超声', examItem: 'ESD术', drugName: '甘油果糖注射液', result: '拒绝', auditor: '张审核', auditTime: '2026-04-29 15:50', reason: '脑水肿不符，超医保适应证' },
  { id: 8, patientName: '吴十', patientId: 'P20008', examType: 'ERCP', examItem: 'ERCP+EST', drugName: '硫酸阿托品注射液', result: '通过', auditor: '李审核', auditTime: '2026-04-29 16:05' },
  { id: 9, patientName: '郑一', patientId: 'P20009', examType: '腹部超声', examItem: '腹部超声下止血术', drugName: '肾上腺素注射液', result: '通过', auditor: '王审核', auditTime: '2026-04-29 16:20' },
  { id: 10, patientName: '冯二', patientId: 'P20010', examType: '肠镜', examItem: '肠镜下息肉切除', drugName: '二氧化碳气体', result: '通过', auditor: '张审核', auditTime: '2026-04-29 16:35' },
  { id: 11, patientName: '陈三', patientId: 'P20011', examType: '超声超声探头', examItem: '胰腺EUS', drugName: '醋酸戈舍瑞林缓释植入剂', result: '拒绝', auditor: '李审核', auditTime: '2026-04-29 16:50', reason: '前列腺癌诊断依据不足' },
  { id: 12, patientName: '褚四', patientId: 'P20012', examType: '腹部超声', examItem: '食管扩张术', drugName: '硝酸甘油注射液', result: '补充资料', auditor: '王审核', auditTime: '2026-04-29 17:05', reason: '需补充冠心病诊断证明' },
  { id: 13, patientName: '卫五', patientId: 'P20013', examType: '肠镜', examItem: '小肠镜检查', drugName: '双歧杆菌三联活菌胶囊', result: '通过', auditor: '张审核', auditTime: '2026-04-29 17:20' },
  { id: 14, patientName: '蒋六', patientId: 'P20014', examType: 'ERCP', examItem: '胆道支架置入', drugName: '注射用头孢哌酮钠舒巴坦钠', result: '通过', auditor: '李审核', auditTime: '2026-04-29 17:35' },
  { id: 15, patientName: '沈七', patientId: 'P20015', examType: '腹部超声', examItem: '胃造口术', drugName: '肠内营养混悬液', result: '通过', auditor: '王审核', auditTime: '2026-04-29 17:50' },
  { id: 16, patientName: '韩八', patientId: 'P20016', examType: '腹部超声', examItem: '无痛腹部超声', drugName: '丙泊酚注射液', result: '通过', auditor: '张审核', auditTime: '2026-04-28 09:10' },
  { id: 17, patientName: '杨九', patientId: 'P20017', examType: '肠镜', examItem: '浅表超声', drugName: '复方聚乙二醇散', result: '通过', auditor: '李审核', auditTime: '2026-04-28 09:25' },
  { id: 18, patientName: '朱十', patientId: 'P20018', examType: 'ERCP', examItem: '逆行胰胆管造影', drugName: '盐酸哌替啶注射液', result: '拒绝', auditor: '王审核', auditTime: '2026-04-28 09:40', reason: '无急性疼痛指征' },
  { id: 19, patientName: '秦一', patientId: 'P20019', examType: '腹部超声', examItem: '普通腹部超声', drugName: '盐酸丁卡因胶浆', result: '通过', auditor: '张审核', auditTime: '2026-04-28 09:55' },
  { id: 20, patientName: '尤二', patientId: 'P20020', examType: '超声超声探头', examItem: 'EUS-FNA', drugName: '注射用英夫利西单抗', result: '拒绝', auditor: '李审核', auditTime: '2026-04-28 10:10', reason: '类风湿关节炎诊断不明确' },
  { id: 21, patientName: '许三', patientId: 'P20021', examType: '肠镜', examItem: '无痛浅表超声', drugName: '地西泮注射液', result: '通过', auditor: '王审核', auditTime: '2026-04-28 10:25' },
  { id: 22, patientName: '何四', patientId: 'P20022', examType: '腹部超声', examItem: 'ESD术', drugName: '甘油果糖注射液', result: '拒绝', auditor: '张审核', auditTime: '2026-04-28 10:40', reason: '不符合医保限用条件' },
  { id: 23, patientName: '吕五', patientId: 'P20023', examType: 'ERCP', examItem: 'ERCP+EST', drugName: '硫酸阿托品注射液', result: '通过', auditor: '李审核', auditTime: '2026-04-28 10:55' },
  { id: 24, patientName: '施六', patientId: 'P20024', examType: '腹部超声', examItem: '腹部超声下止血术', drugName: '肾上腺素注射液', result: '通过', auditor: '王审核', auditTime: '2026-04-28 11:10' },
  { id: 25, patientName: '张七', patientId: 'P20025', examType: '肠镜', examItem: '肠镜下息肉切除', drugName: '二氧化碳气体', result: '通过', auditor: '张审核', auditTime: '2026-04-28 11:25' },
  { id: 26, patientName: '孔八', patientId: 'P20026', examType: '超声超声探头', examItem: '胰腺EUS', drugName: '醋酸戈舍瑞林缓释植入剂', result: '补充资料', auditor: '李审核', auditTime: '2026-04-28 11:40', reason: '需提供病理切片' },
  { id: 27, patientName: '曹九', patientId: 'P20027', examType: '腹部超声', examItem: '食管扩张术', drugName: '硝酸甘油注射液', result: '通过', auditor: '王审核', auditTime: '2026-04-28 11:55' },
  { id: 28, patientName: '严十', patientId: 'P20028', examType: '肠镜', examItem: '小肠镜检查', drugName: '双歧杆菌三联活菌胶囊', result: '通过', auditor: '张审核', auditTime: '2026-04-28 12:10' },
  { id: 29, patientName: '华一', patientId: 'P20029', examType: 'ERCP', examItem: '胆道支架置入', drugName: '注射用头孢哌酮钠舒巴坦钠', result: '通过', auditor: '李审核', auditTime: '2026-04-28 13:30' },
  { id: 30, patientName: '金二', patientId: 'P20030', examType: '腹部超声', examItem: '胃造口术', drugName: '肠内营养混悬液', result: '通过', auditor: '王审核', auditTime: '2026-04-28 13:45' },
  { id: 31, patientName: '魏三', patientId: 'P20031', examType: '腹部超声', examItem: '无痛腹部超声', drugName: '丙泊酚注射液', result: '通过', auditor: '张审核', auditTime: '2026-04-27 14:00' },
  { id: 32, patientName: '陶四', patientId: 'P20032', examType: '肠镜', examItem: '浅表超声', drugName: '复方聚乙二醇散', result: '通过', auditor: '李审核', auditTime: '2026-04-27 14:15' },
  { id: 33, patientName: '姜五', patientId: 'P20033', examType: 'ERCP', examItem: '逆行胰胆管造影', drugName: '盐酸哌替啶注射液', result: '拒绝', auditor: '王审核', auditTime: '2026-04-27 14:30', reason: '非急性疼痛适应证' },
  { id: 34, patientName: '戚六', patientId: 'P20034', examType: '腹部超声', examItem: '普通腹部超声', drugName: '盐酸丁卡因胶浆', result: '通过', auditor: '张审核', auditTime: '2026-04-27 14:45' },
  { id: 35, patientName: '谢七', patientId: 'P20035', examType: '超声超声探头', examItem: 'EUS-FNA', drugName: '注射用英夫利西单抗', result: '拒绝', auditor: '李审核', auditTime: '2026-04-27 15:00', reason: '超医保适应证范围' },
  { id: 36, patientName: '邹八', patientId: 'P20036', examType: '肠镜', examItem: '无痛浅表超声', drugName: '地西泮注射液', result: '通过', auditor: '王审核', auditTime: '2026-04-27 15:15' },
  { id: 37, patientName: '柏九', patientId: 'P20037', examType: '腹部超声', examItem: 'ESD术', drugName: '甘油果糖注射液', result: '拒绝', auditor: '张审核', auditTime: '2026-04-27 15:30', reason: '脑水肿诊断不成立' },
  { id: 38, patientName: '水十', patientId: 'P20038', examType: 'ERCP', examItem: 'ERCP+EST', drugName: '硫酸阿托品注射液', result: '通过', auditor: '李审核', auditTime: '2026-04-27 15:45' },
  { id: 39, patientName: '窦一', patientId: 'P20039', examType: '腹部超声', examItem: '腹部超声下止血术', drugName: '肾上腺素注射液', result: '通过', auditor: '王审核', auditTime: '2026-04-27 16:00' },
  { id: 40, patientName: '章二', patientId: 'P20040', examType: '肠镜', examItem: '肠镜下息肉切除', drugName: '二氧化碳气体', result: '通过', auditor: '张审核', auditTime: '2026-04-27 16:15' },
]

// 限制药品库 - 20种超声探头常用药
const restrictedDrugs: RestrictedDrug[] = [
  { id: 1, name: '丙泊酚注射液', category: '麻醉用药', restriction: '限二级以上公立医疗机构使用，限短期镇静', applicableExams: '无痛腹部超声、无痛肠镜、无痛ERCP', notes: '需麻醉科医师在场' },
  { id: 2, name: '盐酸哌替啶注射液', category: '镇痛药', restriction: '限急性疼痛、术后镇痛及麻醉前给药', applicableExams: 'ERCP、ESD、EMR', notes: '需副主任医师以上开具' },
  { id: 3, name: '地西泮注射液', category: '镇静药', restriction: '限癫痫持续状态、麻醉前给药', applicableExams: '无痛腹部超声、无痛肠镜', notes: '需心电图监测' },
  { id: 4, name: '盐酸丁卡因胶浆', category: '局麻药', restriction: '限表面麻醉使用', applicableExams: '普通腹部超声、喉镜', notes: '需皮试阴性' },
  { id: 5, name: '复方聚乙二醇散', category: '泻药', restriction: '限肠镜检查前肠道清洁', applicableExams: '浅表超声、小肠镜', notes: '2小时内服完' },
  { id: 6, name: '甘油果糖注射液', category: '脱水药', restriction: '限脱水及脑水肿治疗', applicableExams: '颅内手术前准备', notes: '超声探头手术慎用' },
  { id: 7, name: '硫酸阿托品注射液', category: '抗胆碱药', restriction: '限有机磷中毒、缓慢型心律失常', applicableExams: 'ERCP、介入超声', notes: '青光眼患者禁用' },
  { id: 8, name: '肾上腺素注射液', category: '升压药', restriction: '限过敏性休克、心脏骤停、支气管痉挛', applicableExams: '腹部超声下止血、肠镜下止血', notes: '局部使用需稀释' },
  { id: 9, name: '二氧化碳气体', category: '气体', restriction: '限腔镜手术充气', applicableExams: '腹腔镜、胸腔镜', notes: '肠镜充气用空气' },
  { id: 10, name: '醋酸戈舍瑞林缓释植入剂', category: '抗肿瘤药', restriction: '限前列腺癌、乳腺癌', applicableExams: '前列腺侵犯消化道EUS', notes: '需肿瘤科会诊' },
  { id: 11, name: '硝酸甘油注射液', category: '扩血管药', restriction: '限冠心病、心绞痛', applicableExams: '食管动力检查、贲门失弛缓', notes: '需心血管评估' },
  { id: 12, name: '双歧杆菌三联活菌胶囊', category: '微生态制剂', restriction: '限肠道菌群失调', applicableExams: '肠道检查后菌群调节', notes: '温水送服' },
  { id: 13, name: '注射用头孢哌酮钠舒巴坦钠', category: '抗生素', restriction: '限中重度感染', applicableExams: 'ERCP术后、穿孔修补术后', notes: '需皮试' },
  { id: 14, name: '肠内营养混悬液', category: '营养药', restriction: '限不能经口进食患者', applicableExams: '胃造口术、空肠造口术', notes: '需营养科会诊' },
  { id: 15, name: '注射用英夫利西单抗', category: '生物制剂', restriction: '限克罗恩病、类风湿关节炎、强直性脊柱炎', applicableExams: '克罗恩病EUS评估', notes: '需病理确诊' },
  { id: 16, name: '甲硫酸新斯的明注射液', category: '促胃肠动力药', restriction: '限术后肠麻痹、术后尿潴留', applicableExams: '浅表超声检查、ERCP术后', notes: '机械性肠梗阻禁用' },
  { id: 17, name: '氨甲环酸注射液', category: '止血药', restriction: '限急性或慢性局限性纤维蛋白溶解', applicableExams: '消化道出血超声探头下止血', notes: '需凝血功能评估' },
  { id: 18, name: '注射用矛头蝮蛇血凝酶', category: '止血药', restriction: '限出血性疾病', applicableExams: '胃ESD、肠息肉切除术后', notes: '需监测凝血功能' },
  { id: 19, name: '脂肪乳氨基酸葡萄糖注射液', category: '肠外营养', restriction: '限不能经口进食且无法肠内营养者', applicableExams: '胃造口术后、空肠造口术后', notes: '需中心静脉通路' },
  { id: 20, name: '枸橼酸芬太尼注射液', category: '镇痛药', restriction: '限急性剧烈疼痛、麻醉镇痛', applicableExams: 'ERCP、ESD、STER', notes: '需麻醉药品处方权' },
]

// 适应证规则 - 6个场景
const indicationRules: IndicationRule[] = [
  {
    id: 1,
    examType: '腹部超声',
    examName: '无痛腹部超声检查',
    drugName: '丙泊酚注射液',
    insuranceRequirement: '限二级以上公立医疗机构，需麻醉医师在场，需术前评估心肺功能',
    description: '丙泊酚用于无痛腹部超声镇静，需满足医疗机构级别和人员资质要求'
  },
  {
    id: 2,
    examType: 'ERCP',
    examName: '逆行胰胆管造影+EST',
    drugName: '盐酸哌替啶注射液',
    insuranceRequirement: '限急性疼痛（疼痛评分≥7分）、术后镇痛、麻醉前给药',
    description: '哌替啶用于ERCP术中镇痛，需记录疼痛评分及适应证依据'
  },
  {
    id: 3,
    examType: '肠镜',
    examName: '浅表超声检查',
    drugName: '复方聚乙二醇散',
    insuranceRequirement: '限肠镜检查前肠道清洁，不得用于其他清肠目的',
    description: '复方聚乙二醇作为肠镜前肠道准备用药，属医保甲类'
  },
  {
    id: 4,
    examType: '超声超声探头',
    examName: 'EUS-FNA穿刺活检',
    drugName: '注射用英夫利西单抗',
    insuranceRequirement: '限克罗恩病（需病理确诊）、类风湿关节炎、强直性脊柱炎',
    description: '英夫利西单抗用于克罗恩病伴狭窄的EUS评估，需病理确诊'
  },
  {
    id: 5,
    examType: '腹部超声',
    examName: '腹部超声下止血术',
    drugName: '肾上腺素注射液（局部用）',
    insuranceRequirement: '限过敏性休克、心脏骤停、支气管痉挛；局部使用需说明适应证',
    description: '肾上腺素局部注射用于消化道止血，属超适应证使用，需患者知情同意'
  },
  {
    id: 6,
    examType: 'ERCP',
    examName: 'ERCP术',
    drugName: '注射用头孢哌酮钠舒巴坦钠',
    insuranceRequirement: '限中重度感染（社区获得性肺炎、医院获得性肺炎、复杂腹腔感染）',
    description: 'ERCP术后预防性使用抗生素限于复杂胆道感染，需药敏支持'
  },
]

// ---------- 样式定义 ----------
const s: Record<string, React.CSSProperties> = {
  root: { padding: 0 },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 18, fontWeight: 700, color: '#1a3a5c', margin: 0 },
  // KPI卡片行
  kpiRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 12,
    marginBottom: 20,
  },
  kpiCard: {
    background: '#fff',
    borderRadius: 10,
    padding: '16px 18px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  kpiIcon: {
    width: 44, height: 44, borderRadius: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  kpiValue: {
    fontSize: 26, fontWeight: 700, color: '#1a3a5c', lineHeight: 1.2,
  },
  kpiLabel: {
    fontSize: 13, color: '#64748b', marginTop: 2,
  },
  // 标签页
  tabs: {
    display: 'flex',
    gap: 0,
    borderBottom: '2px solid #e2e8f0',
    marginBottom: 20,
  },
  tab: {
    padding: '12px 24px',
    fontSize: 15,
    fontWeight: 600,
    color: '#64748b',
    background: 'none',
    border: 'none',
    borderBottom: '3px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  tabActive: {
    color: '#1a3a5c',
    borderBottom: '3px solid #1a3a5c',
  },
  // 搜索工具栏
  toolbar: {
    display: 'flex',
    gap: 10,
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    background: '#fff',
    padding: '14px 18px',
    borderRadius: 10,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    marginBottom: 16,
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    padding: '8px 14px',
    flex: 1,
    minWidth: 200,
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontSize: 14,
    color: '#334155',
    width: '100%',
  },
  select: {
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    padding: '8px 14px',
    fontSize: 14,
    color: '#334155',
    background: '#f8fafc',
    outline: 'none',
    cursor: 'pointer',
  },
  // 卡片列表（审核待办）
  cardList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: 14,
  },
  card: {
    background: '#fff',
    borderRadius: 10,
    padding: '16px 18px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    border: '1px solid #f1f5f9',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardPatient: {
    fontSize: 16,
    fontWeight: 700,
    color: '#1a3a5c',
  },
  cardPatientId: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  cardTag: {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 600,
  },
  cardRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    fontSize: 13,
    color: '#475569',
  },
  cardDrug: {
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: 8,
    padding: '10px 14px',
    marginBottom: 10,
  },
  cardDrugName: {
    fontSize: 14,
    fontWeight: 600,
    color: '#166534',
  },
  cardDrugSpec: {
    fontSize: 12,
    color: '#16a34a',
    marginTop: 2,
  },
  cardRestriction: {
    fontSize: 12,
    color: '#dc2626',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: 6,
    padding: '6px 10px',
    marginBottom: 10,
  },
  cardActions: {
    display: 'flex',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTop: '1px solid #f1f5f9',
  },
  // 表格
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    background: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  th: {
    background: '#f8fafc',
    padding: '12px 14px',
    textAlign: 'left',
    fontSize: 13,
    fontWeight: 600,
    color: '#64748b',
    borderBottom: '1px solid #e2e8f0',
    whiteSpace: 'nowrap' as const,
  },
  td: {
    padding: '12px 14px',
    fontSize: 13,
    color: '#334155',
    borderBottom: '1px solid #f1f5f9',
  },
  // 标签
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '3px 10px',
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 600,
  },
  badgeSuccess: { background: '#f0fdf4', color: '#16a34a' },
  badgeDanger: { background: '#fef2f2', color: '#dc2626' },
  badgeWarning: { background: '#fffbeb', color: '#d97706' },
  badgeInfo: { background: '#eff6ff', color: '#2563eb' },
  badgePurple: { background: '#f5f3ff', color: '#7c3aed' },
  badgePink: { background: '#fdf2f8', color: '#db2777' },
  badgeOrange: { background: '#fff7ed', color: '#ea580c' },
  // 分页
  pagination: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    padding: '14px 18px',
    background: '#fff',
    borderRadius: 10,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  pageInfo: { fontSize: 13, color: '#64748b' },
  pageBtns: { display: 'flex', gap: 4 },
  pageBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    borderRadius: 8,
    border: '1px solid #e2e8f0',
    background: '#fff',
    color: '#475569',
    cursor: 'pointer',
    fontSize: 14,
  },
  pageBtnActive: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    borderRadius: 8,
    border: 'none',
    background: '#1a3a5c',
    color: '#fff',
    cursor: 'pointer',
    fontSize: 14,
  },
  // 规则卡片
  ruleCard: {
    background: '#fff',
    borderRadius: 10,
    padding: '18px 20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    border: '1px solid #e2e8f0',
    marginBottom: 14,
  },
  ruleHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  ruleExam: {
    fontSize: 15,
    fontWeight: 700,
    color: '#1a3a5c',
  },
  ruleArrow: {
    color: '#94a3b8',
    fontSize: 18,
  },
  ruleDrug: {
    fontSize: 14,
    fontWeight: 600,
    color: '#166534',
    background: '#f0fdf4',
    padding: '4px 12px',
    borderRadius: 6,
    border: '1px solid #bbf7d0',
  },
  ruleContent: {
    background: '#f8fafc',
    borderRadius: 8,
    padding: '12px 14px',
    fontSize: 13,
    color: '#475569',
    lineHeight: 1.7,
    marginBottom: 10,
  },
  ruleReq: {
    fontSize: 13,
    color: '#dc2626',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: 6,
    padding: '8px 12px',
  },
  // 大按钮
  btn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: '10px 18px',
    borderRadius: 8,
    border: 'none',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    minHeight: 44,
  },
  btnSuccess: {
    background: '#16a34a',
    color: '#fff',
  },
  btnDanger: {
    background: '#dc2626',
    color: '#fff',
  },
  btnWarning: {
    background: '#d97706',
    color: '#fff',
  },
  btnOutline: {
    background: '#fff',
    color: '#475569',
    border: '1px solid #e2e8f0',
  },
  // 空状态
  emptyState: {
    textAlign: 'center',
    padding: '48px 20px',
    color: '#94a3b8',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
  },
  emptyStateIcon: { opacity: 0.35 },
  emptyStateText: { fontSize: 14, color: '#64748b', fontWeight: 500 },
  emptyStateHint: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
}

// ---------- 辅助函数 ----------
function getUrgencyStyle(urgency: string) {
  if (urgency === '高') return { background: '#fef2f2', color: '#dc2626' }
  if (urgency === '中') return { background: '#fffbeb', color: '#d97706' }
  return { background: '#f0fdf4', color: '#16a34a' }
}

function getResultStyle(result: string) {
  if (result === '通过') return s.badgeSuccess
  if (result === '拒绝') return s.badgeDanger
  return s.badgeWarning
}

// ============ 医保审核页面组件 ============
export default function InsuranceAuditPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'history' | 'drugs' | 'rules'>('pending')
  const [historyPage, setHistoryPage] = useState(1)
  const [searchText, setSearchText] = useState('')
  const pageSize = 10

  // KPI统计
  const stats = useMemo(() => {
    const pending = pendingAudits.length
    const highUrgency = pendingAudits.filter(a => a.urgency === '高').length
    const todayApproved = auditHistory.filter(h => h.result === '通过' && h.auditTime.startsWith('2026-04-29')).length
    const todayRejected = auditHistory.filter(h => h.result === '拒绝' && h.auditTime.startsWith('2026-04-29')).length
    return { pending, highUrgency, todayApproved, todayRejected }
  }, [])

  // 审核历史筛选
  const filteredHistory = useMemo(() => {
    if (!searchText) return auditHistory
    return auditHistory.filter(h =>
      h.patientName.includes(searchText) ||
      h.patientId.includes(searchText) ||
      h.drugName.includes(searchText) ||
      h.examType.includes(searchText)
    )
  }, [searchText])

  const totalPages = Math.max(1, Math.ceil(filteredHistory.length / pageSize))
  const pagedHistory = filteredHistory.slice((historyPage - 1) * pageSize, historyPage * pageSize)

  return (
    <div style={s.root}>
      {/* 标题 */}
      <div style={s.header}>
        <h1 style={s.title}>医保审核</h1>
      </div>

      {/* KPI概览 */}
      <div style={s.kpiRow}>
        <div style={s.kpiCard}>
          <div style={{ ...s.kpiIcon, background: '#fff7ed' }}>
            <Clock size={22} color="#ea580c" />
          </div>
          <div>
            <div style={s.kpiValue}>{stats.pending}</div>
            <div style={s.kpiLabel}>待审核申请</div>
          </div>
        </div>
        <div style={s.kpiCard}>
          <div style={{ ...s.kpiIcon, background: '#fef2f2' }}>
            <AlertTriangle size={22} color="#dc2626" />
          </div>
          <div>
            <div style={s.kpiValue}>{stats.highUrgency}</div>
            <div style={s.kpiLabel}>高优先级</div>
          </div>
        </div>
        <div style={s.kpiCard}>
          <div style={{ ...s.kpiIcon, background: '#f0fdf4' }}>
            <CheckCircle size={22} color="#16a34a" />
          </div>
          <div>
            <div style={s.kpiValue}>{stats.todayApproved}</div>
            <div style={s.kpiLabel}>今日通过</div>
          </div>
        </div>
        <div style={s.kpiCard}>
          <div style={{ ...s.kpiIcon, background: '#fef2f2' }}>
            <XCircle size={22} color="#dc2626" />
          </div>
          <div>
            <div style={s.kpiValue}>{stats.todayRejected}</div>
            <div style={s.kpiLabel}>今日拒绝</div>
          </div>
        </div>
      </div>

      {/* 标签页 */}
      <div style={s.tabs}>
        <button
          style={{ ...s.tab, ...(activeTab === 'pending' ? s.tabActive : {}) }}
          onClick={() => setActiveTab('pending')}
        >
          <ClipboardList size={16} /> 审核待办
          <span style={{
            background: '#dc2626',
            color: '#fff',
            borderRadius: '50%',
            width: 20,
            height: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            fontWeight: 700,
          }}>
            {pendingAudits.length}
          </span>
        </button>
        <button
          style={{ ...s.tab, ...(activeTab === 'history' ? s.tabActive : {}) }}
          onClick={() => setActiveTab('history')}
        >
          <FileText size={16} /> 审核历史
        </button>
        <button
          style={{ ...s.tab, ...(activeTab === 'drugs' ? s.tabActive : {}) }}
          onClick={() => setActiveTab('drugs')}
        >
          <Pill size={16} /> 限制药品库
        </button>
        <button
          style={{ ...s.tab, ...(activeTab === 'rules' ? s.tabActive : {}) }}
          onClick={() => setActiveTab('rules')}
        >
          <BookOpen size={16} /> 适应证规则
        </button>
      </div>

      {/* ========== Tab1: 审核待办 ========== */}
      {activeTab === 'pending' && (
        <div style={s.cardList}>
          {pendingAudits.length === 0 ? (
            <div style={s.emptyState}>
              <ClipboardList size={48} style={s.emptyStateIcon} />
              <div style={s.emptyStateText}>暂无待审核申请</div>
              <div style={s.emptyStateHint}>所有医保申请已处理完毕</div>
            </div>
          ) : pendingAudits.map(audit => (
            <div key={audit.id} style={s.card}>
              <div style={s.cardHeader}>
                <div>
                  <div style={s.cardPatient}>{audit.patientName}</div>
                  <div style={s.cardPatientId}>{audit.patientId}</div>
                </div>
                <span style={{ ...s.cardTag, ...getUrgencyStyle(audit.urgency) }}>
                  {audit.urgency === '高' ? <AlertTriangle size={10} /> : null}
                  {audit.urgency}优先级
                </span>
              </div>

              <div style={s.cardRow}>
                <Stethoscope size={13} color="#94a3b8" />
                <span style={{ fontWeight: 600 }}>{audit.examType}</span>
                <span style={{ color: '#94a3b8' }}>·</span>
                <span>{audit.examItem}</span>
              </div>

              <div style={s.cardDrug}>
                <div style={s.cardDrugName}>{audit.drugName}</div>
                <div style={s.cardDrugSpec}>{audit.drugSpec}</div>
              </div>

              <div style={{ ...s.cardRow, color: '#64748b', fontSize: 12, marginBottom: 6 }}>
                <Activity size={12} color="#94a3b8" />
                <span style={{ color: '#dc2626', fontWeight: 600 }}>限制说明：</span>
                <span>{audit.restriction}</span>
              </div>

              <div style={s.cardRestriction}>
                <strong>申请理由：</strong>{audit.reason}
              </div>

              <div style={s.cardRow}>
                <Calendar size={12} color="#94a3b8" />
                <span>{audit.submitTime}</span>
                <span style={{ color: '#94a3b8' }}>|</span>
                <span>{audit.submitDept}</span>
              </div>

              <div style={s.cardActions}>
                <button style={{ ...s.btn, ...s.btnSuccess, flex: 1, minHeight: 44 }}>
                  <Check size={16} /> 审核通过
                </button>
                <button style={{ ...s.btn, ...s.btnDanger, flex: 1, minHeight: 44 }}>
                  <X size={16} /> 审核拒绝
                </button>
                <button style={{ ...s.btn, ...s.btnWarning, minHeight: 44 }}>
                  <MessageSquare size={16} /> 补充资料
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========== Tab2: 审核历史 ========== */}
      {activeTab === 'history' && (
        <>
          <div style={s.toolbar}>
            <div style={s.searchBox}>
              <Search size={14} color="#94a3b8" />
              <input
                style={s.searchInput}
                placeholder="搜索患者、药品、检查类型..."
                value={searchText}
                onChange={e => { setSearchText(e.target.value); setHistoryPage(1) }}
              />
            </div>
            <select style={s.select}>
              <option value="">全部结果</option>
              <option value="通过">通过</option>
              <option value="拒绝">拒绝</option>
              <option value="补充资料">补充资料</option>
            </select>
            <select style={s.select}>
              <option value="">全部类型</option>
              <option value="腹部超声">腹部超声</option>
              <option value="肠镜">肠镜</option>
              <option value="ERCP">ERCP</option>
              <option value="超声超声探头">超声超声探头</option>
            </select>
            <button style={{ ...s.btn, ...s.btnOutline }}>
              <RefreshCw size={13} /> 重置
            </button>
          </div>

          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>序号</th>
                <th style={s.th}>患者</th>
                <th style={s.th}>患者ID</th>
                <th style={s.th}>检查类型</th>
                <th style={s.th}>检查项目</th>
                <th style={s.th}>药品</th>
                <th style={s.th}>审核结果</th>
                <th style={s.th}>审核人</th>
                <th style={s.th}>审核时间</th>
              </tr>
            </thead>
            <tbody>
              {pagedHistory.map(record => (
                <tr key={record.id}>
                  <td style={s.td}>{record.id}</td>
                  <td style={s.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <User size={12} color="#94a3b8" />
                      <span style={{ fontWeight: 600 }}>{record.patientName}</span>
                    </div>
                  </td>
                  <td style={s.td}>{record.patientId}</td>
                  <td style={s.td}>{record.examType}</td>
                  <td style={s.td}>{record.examItem}</td>
                  <td style={s.td}>
                    <span style={{ color: '#166534', fontWeight: 500 }}>{record.drugName}</span>
                  </td>
                  <td style={s.td}>
                    <span style={{ ...s.badge, ...getResultStyle(record.result) }}>
                      {record.result === '通过' && <CheckCircle size={10} />}
                      {record.result === '拒绝' && <XCircle size={10} />}
                      {record.result === '补充资料' && <MessageSquare size={10} />}
                      {record.result}
                    </span>
                  </td>
                  <td style={s.td}>{record.auditor}</td>
                  <td style={s.td}>{record.auditTime}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* 分页 */}
          <div style={s.pagination}>
            <div style={s.pageInfo}>
              共 {filteredHistory.length} 条记录，第 {historyPage}/{totalPages} 页
            </div>
            <div style={s.pageBtns}>
              <button
                style={s.pageBtn}
                disabled={historyPage <= 1}
                onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
              >
                <ChevronLeft size={15} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let num: number
                if (totalPages <= 5) num = i + 1
                else if (historyPage <= 3) num = i + 1
                else if (historyPage >= totalPages - 2) num = totalPages - 4 + i
                else num = historyPage - 2 + i
                return (
                  <button
                    key={num}
                    style={historyPage === num ? s.pageBtnActive : s.pageBtn}
                    onClick={() => setHistoryPage(num)}
                  >
                    {num}
                  </button>
                )
              })}
              <button
                style={s.pageBtn}
                disabled={historyPage >= totalPages}
                onClick={() => setHistoryPage(p => Math.min(totalPages, p + 1))}
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </>
      )}

      {/* ========== Tab3: 限制药品库 ========== */}
      {activeTab === 'drugs' && (
        <>
          <div style={s.toolbar}>
            <div style={s.searchBox}>
              <Search size={14} color="#94a3b8" />
              <input
                style={s.searchInput}
                placeholder="搜索药品名称..."
                onChange={() => {}}
              />
            </div>
            <select style={s.select}>
              <option value="">全部分类</option>
              <option value="麻醉用药">麻醉用药</option>
              <option value="镇痛药">镇痛药</option>
              <option value="镇静药">镇静药</option>
              <option value="抗生素">抗生素</option>
              <option value="止血药">止血药</option>
              <option value="泻药">泻药</option>
            </select>
          </div>

          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>序号</th>
                <th style={s.th}>药品名称</th>
                <th style={s.th}>医保分类</th>
                <th style={s.th}>限制说明</th>
                <th style={s.th}>适用检查</th>
                <th style={s.th}>备注</th>
              </tr>
            </thead>
            <tbody>
              {restrictedDrugs.map(drug => (
                <tr key={drug.id}>
                  <td style={s.td}>{drug.id}</td>
                  <td style={s.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Pill size={13} color="#16a34a" />
                      <span style={{ fontWeight: 600, color: '#1a3a5c' }}>{drug.name}</span>
                    </div>
                  </td>
                  <td style={s.td}>
                    <span style={{
                      ...s.badge,
                      background: '#f5f3ff',
                      color: '#7c3aed',
                    }}>
                      {drug.category}
                    </span>
                  </td>
                  <td style={{ ...s.td, color: '#dc2626', maxWidth: 280 }}>
                    {drug.restriction}
                  </td>
                  <td style={s.td}>{drug.applicableExams}</td>
                  <td style={s.td}>{drug.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* ========== Tab4: 适应证规则 ========== */}
      {activeTab === 'rules' && (
        <>
          {indicationRules.map(rule => (
            <div key={rule.id} style={s.ruleCard}>
              <div style={s.ruleHeader}>
                <Activity size={18} color="#1a3a5c" />
                <span style={s.ruleExam}>{rule.examType} - {rule.examName}</span>
                <span style={s.ruleArrow}>→</span>
                <span style={s.ruleDrug}>
                  <Pill size={12} style={{ marginRight: 4 }} />
                  {rule.drugName}
                </span>
              </div>
              <div style={s.ruleContent}>
                <strong style={{ color: '#1a3a5c' }}>规则说明：</strong>{rule.description}
              </div>
              <div style={s.ruleReq}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                  <ShieldCheck size={13} color="#dc2626" style={{ marginTop: 2, flexShrink: 0 }} />
                  <span><strong>医保要求：</strong>{rule.insuranceRequirement}</span>
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
