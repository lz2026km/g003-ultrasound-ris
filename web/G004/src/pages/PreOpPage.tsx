// @ts-nocheck
import { useState } from 'react';
import {
  Activity, AlertTriangle, CheckCircle, XCircle, Clock, Shield,
  ClipboardCheck, Heart, Droplets, Wind, User, FileText,
  ArrowRight, TrendingUp, Minus, ChevronRight, Info,
  PauseCircle, Ban, Bell, Wind, Stethoscope, ListChecks,
  AlertCircle, Eye, Armchair, Scale, Thermometer, Droplet,
  ClipboardList, MessageSquare, UserCheck, ShieldAlert
} from 'lucide-react';

// ==================== 术前评估数据类型 ====================
export interface PreOpAssessment {
  id: string;
  patientId: string;
  patientName: string;
  gender: string;
  age: number;
  surgeryType: string;       // 手术类型
  surgeryDate: string;       // 手术日期
  doctorName: string;         // 主刀医生
  // ASA分级
  asaLevel: 'ASA I' | 'ASA II' | 'ASA III' | 'ASA IV' | 'ASA V' | 'ASA VI';
  // METs评分
  metsScore: number;          // 1-10
  metsLevel: '低' | '中' | '高';
  // 出血风险
  bleedingRisk: '低危' | '中危' | '高危';
  bleedingScore: number;     // 评分
  // 麻醉风险
  anesthesiaRisk: '低危' | '中危' | '高危';
  anesthesiaMethod: string;   // 麻醉方式
  // Mallampati气道分级 (新增)
  mallampatiClass: 'I' | 'II' | 'III' | 'IV';
  mallampatiDesc: string;
  airwayDifficulty: '正常' | '轻度困难' | '中度困难' | '困难';
  // 核对清单 (新增)
  checklist: {
    identityConfirmed: boolean;     // 患者身份确认
    surgerySiteMarked: boolean;      // 手术部位标记
    informedConsent: boolean;        // 知情同意
    FastingStatus: boolean;          // 禁食状态
    IVAccess: boolean;               // 静脉通路
    labResultsReviewed: boolean;    // 检验结果审核
    imagingReviewed: boolean;        // 影像审核
    anesthesiaAssessment: boolean;   // 麻醉评估
    allergiesConfirmed: boolean;     // 过敏史确认
    medicationsReconciled: boolean;  // 用药核对
    bloodProductsPrepared: boolean; // 备血
    equipmentChecked: boolean;       // 设备检查
    emergencyEquipment: boolean;     // 急救设备
    assistantConfirmed: boolean;    // 助手确认
  };
  // 麻醉访视 (新增)
  anesthesiaVisit: {
    visited: boolean;
    visitTime: string;
    anesthesiologist: string;
    visitNotes: string;
    vitalSigns: {
      bp: string;
      hr: number;
      rr: number;
      temp: number;
      spo2: number;
    };
    cardiacExam: string;
    pulmonaryExam: string;
    airwayExam: string;
    merckelScore: number; // 改良Merkel评分
  };
  // 风险评估 (新增)
  riskAssessment: {
    cardiacRisk: '低危' | '中危' | '高危' | '极高危';
    cardiacRiskFactors: string[];
    pulmonaryRisk: '低危' | '中危' | '高危';
    pulmonaryRiskFactors: string[];
    liverRisk: '低危' | '中危' | '高危';
    kidneyRisk: '低危' | '中危' | '高危';
    dvtRisk: '低危' | '中危' | '高危';
    dvtScore: number;
    nutritionRisk: '低危' | '中危' | '高危';
    nutritionScore: number;
    overallRisk: '低危' | '中危' | '高危';
    riskMitigation: string[];
  };
  // 患者状态
  status: '待评估' | '已评估-可手术' | '已评估-暂缓' | '已评估-禁止' | '已完成';
  // 功能状态
  functionalStatus: string;
  // 合并症
  comorbidities: string[];
  // 检验异常
  labAbnormalities: string[];
  // 评估时间线
  assessments: {
    time: string;
    type: string;
    result: string;
    doctor: string;
  }[];
  // 结论
  conclusion: string;
  // 注意事项
  precautions: string[];
  // 评估医生
  assessedBy: string;
  assessedDate: string;
}

// ==================== 模拟数据 (22条) ====================
const preOpAssessments: PreOpAssessment[] = [
  {
    id: 'POA001', patientId: 'P001', patientName: '王建国', gender: '男', age: 58,
    surgeryType: 'ERCP', surgeryDate: '2026-04-30', doctorName: '张建国',
    asaLevel: 'ASA III', metsScore: 4, metsLevel: '中',
    bleedingRisk: '中危', bleedingScore: 3, anesthesiaRisk: '中危',
    anesthesiaMethod: '全麻',
    mallampatiClass: 'II', mallampatiDesc: '可见软腭+咽峡', airwayDifficulty: '轻度困难',
    checklist: {
      identityConfirmed: true, surgerySiteMarked: true, informedConsent: true,
      FastingStatus: true, IVAccess: true, labResultsReviewed: true,
      imagingReviewed: true, anesthesiaAssessment: true, allergiesConfirmed: true,
      medicationsReconciled: true, bloodProductsPrepared: false, equipmentChecked: true,
      emergencyEquipment: true, assistantConfirmed: true
    },
    anesthesiaVisit: {
      visited: true, visitTime: '2026-04-29 14:00', anesthesiologist: '张主任',
      visitNotes: '心功能尚可，METs 4，中危患者，术中需加强监护',
      vitalSigns: { bp: '145/92mmHg', hr: 76, rr: 18, temp: 36.5, spo2: 97 },
      cardiacExam: '未及明显杂音，律齐', pulmonaryExam: '双肺呼吸音清',
      airwayExam: 'Mallampati II，张口3指，甲颏距离正常',
      merckelScore: 3
    },
    riskAssessment: {
      cardiacRisk: '中危', cardiacRiskFactors: ['高血压', '冠心病支架术后'],
      pulmonaryRisk: '低危', pulmonaryRiskFactors: [],
      liverRisk: '低危', kidneyRisk: '中危', dvtRisk: '中危', dvtScore: 2,
      nutritionRisk: '低危', nutritionScore: 2, overallRisk: '中危',
      riskMitigation: ['控制血压', '加强心电监护', '备血']
    },
    status: '已评估-可手术',
    functionalStatus: '爬2层楼即感气促',
    comorbidities: ['高血压', '冠心病支架术后', '慢性胃炎'],
    labAbnormalities: ['血肌酐偏高', '心电图ST-T改变'],
    assessments: [
      { time: '2026-04-29 08:00', type: 'ASA分级', result: 'ASA III', doctor: '李秀英' },
      { time: '2026-04-29 08:15', type: 'METs评估', result: 'METs 4', doctor: '李秀英' },
      { time: '2026-04-29 08:30', type: '出血风险', result: '中危', doctor: '李秀英' },
      { time: '2026-04-29 08:45', type: '麻醉评估', result: '中危', doctor: '麻醉科张主任' },
      { time: '2026-04-29 09:00', type: '综合结论', result: '可手术', doctor: '张建国' },
    ],
    conclusion: '患者ASA III级，METs 4，中危出血风险及麻醉风险。建议术前纠正贫血，控制血压至160/100mmHg以下，加强心电监护。',
    precautions: ['术前Hb≥100g/L', '血压控制<160/100mmHg', '术中心电监护', '备血'],
    assessedBy: '李秀英', assessedDate: '2026-04-29'
  },
  {
    id: 'POA002', patientId: 'P002', patientName: '李秀芳', gender: '女', age: 45,
    surgeryType: 'EMR', surgeryDate: '2026-04-30', doctorName: '李秀英',
    asaLevel: 'ASA I', metsScore: 8, metsLevel: '高',
    bleedingRisk: '低危', bleedingScore: 1, anesthesiaRisk: '低危',
    anesthesiaMethod: '镇静',
    mallampatiClass: 'I', mallampatiDesc: '可见全软腭+咽峡+悬雍垂', airwayDifficulty: '正常',
    checklist: {
      identityConfirmed: true, surgerySiteMarked: true, informedConsent: true,
      FastingStatus: true, IVAccess: true, labResultsReviewed: true,
      imagingReviewed: true, anesthesiaAssessment: true, allergiesConfirmed: true,
      medicationsReconciled: true, bloodProductsPrepared: false, equipmentChecked: true,
      emergencyEquipment: true, assistantConfirmed: true
    },
    anesthesiaVisit: {
      visited: true, visitTime: '2026-04-29 09:30', anesthesiologist: '李医生',
      visitNotes: 'ASA I级，身体状况良好，可行镇静麻醉',
      vitalSigns: { bp: '118/75mmHg', hr: 68, rr: 16, temp: 36.4, spo2: 99 },
      cardiacExam: '心音正常，律齐', pulmonaryExam: '双肺呼吸音清',
      airwayExam: 'Mallampati I，张口4指，甲颏距离>6cm',
      merckelScore: 1
    },
    riskAssessment: {
      cardiacRisk: '低危', cardiacRiskFactors: [],
      pulmonaryRisk: '低危', pulmonaryRiskFactors: [],
      liverRisk: '低危', kidneyRisk: '低危', dvtRisk: '低危', dvtScore: 0,
      nutritionRisk: '低危', nutritionScore: 0, overallRisk: '低危',
      riskMitigation: ['常规监护']
    },
    status: '已评估-可手术',
    functionalStatus: '正常体力活动',
    comorbidities: [],
    labAbnormalities: [],
    assessments: [
      { time: '2026-04-29 09:00', type: 'ASA分级', result: 'ASA I', doctor: '王海涛' },
      { time: '2026-04-29 09:10', type: 'METs评估', result: 'METs 8', doctor: '王海涛' },
      { time: '2026-04-29 09:20', type: '出血风险', result: '低危', doctor: '王海涛' },
      { time: '2026-04-29 09:30', type: '麻醉评估', result: '低危', doctor: '麻醉科李医生' },
      { time: '2026-04-29 09:45', type: '综合结论', result: '可手术', doctor: '李秀英' },
    ],
    conclusion: '患者ASA I级，METs 8，低危出血及麻醉风险，各项指标正常，可按计划手术。',
    precautions: ['常规监护'],
    assessedBy: '王海涛', assessedDate: '2026-04-29'
  },
  {
    id: 'POA003', patientId: 'P003', patientName: '张德明', gender: '男', age: 62,
    surgeryType: 'ESD', surgeryDate: '2026-04-30', doctorName: '张建国',
    asaLevel: 'ASA IV', metsScore: 3, metsLevel: '低',
    bleedingRisk: '高危', bleedingScore: 5, anesthesiaRisk: '高危',
    anesthesiaMethod: '全麻',
    mallampatiClass: 'III', mallampatiDesc: '仅见软腭上缘', airwayDifficulty: '中度困难',
    checklist: {
      identityConfirmed: true, surgerySiteMarked: true, informedConsent: true,
      FastingStatus: true, IVAccess: true, labResultsReviewed: true,
      imagingReviewed: true, anesthesiaAssessment: true, allergiesConfirmed: true,
      medicationsReconciled: false, bloodProductsPrepared: true, equipmentChecked: true,
      emergencyEquipment: true, assistantConfirmed: false
    },
    anesthesiaVisit: {
      visited: true, visitTime: '2026-04-29 10:30', anesthesiologist: '张主任',
      visitNotes: '心功能差，EF 40%，房颤伴快室率，麻醉高危，建议暂缓',
      vitalSigns: { bp: '138/88mmHg', hr: 98, rr: 20, temp: 36.8, spo2: 94 },
      cardiacExam: '心律不齐，心音强弱不等', pulmonaryExam: '双肺底少量湿啰音',
      airwayExam: 'Mallampati III，颈部活动受限，困难气道可能',
      merckelScore: 5
    },
    riskAssessment: {
      cardiacRisk: '极高危', cardiacRiskFactors: ['心功能不全', '心房颤动', '糖尿病', 'BNP 680'],
      pulmonaryRisk: '高危', pulmonaryRiskFactors: ['心衰肺淤血'],
      liverRisk: '中危', kidneyRisk: '高危', dvtRisk: '高危', dvtScore: 4,
      nutritionRisk: '中危', nutritionScore: 3, overallRisk: '高危',
      riskMitigation: ['暂缓手术', '纠正凝血', '心内科会诊', '改善心功能']
    },
    status: '已评估-暂缓',
    functionalStatus: '无法平底行走',
    comorbidities: ['心功能不全', '心房颤动', '糖尿病', '慢性肾病'],
    labAbnormalities: ['INR 1.8偏高', '血小板 85×10⁹/L', '肌酐 156μmol/L', 'BNP 680pg/mL'],
    assessments: [
      { time: '2026-04-29 10:00', type: 'ASA分级', result: 'ASA IV', doctor: '李秀英' },
      { time: '2026-04-29 10:15', type: 'METs评估', result: 'METs 3', doctor: '李秀英' },
      { time: '2026-04-29 10:30', type: '出血风险', result: '高危', doctor: '李秀英' },
      { time: '2026-04-29 10:45', type: '麻醉评估', result: '高危', doctor: '麻醉科张主任' },
      { time: '2026-04-29 11:00', type: '综合结论', result: '暂缓手术', doctor: '张建国' },
    ],
    conclusion: '患者ASA IV级，心功能差，出血高危（INR偏高+血小板减少），麻醉风险高。建议暂缓手术，先纠正凝血功能，改善心功能，2周后再评估。',
    precautions: ['暂缓手术', '纠正INR至<1.5', '提升血小板>100×10⁹/L', '心内科会诊', '复查BNP'],
    assessedBy: '李秀英', assessedDate: '2026-04-29'
  },
  {
    id: 'POA004', patientId: 'P004', patientName: '周丽娟', gender: '女', age: 38,
    surgeryType: '超声内镜', surgeryDate: '2026-04-30', doctorName: '李秀英',
    asaLevel: 'ASA I', metsScore: 9, metsLevel: '高',
    bleedingRisk: '低危', bleedingScore: 0, anesthesiaRisk: '低危',
    anesthesiaMethod: '局麻',
    mallampatiClass: 'I', mallampatiDesc: '可见全软腭+咽峡+悬雍垂', airwayDifficulty: '正常',
    checklist: {
      identityConfirmed: true, surgerySiteMarked: true, informedConsent: true,
      FastingStatus: true, IVAccess: false, labResultsReviewed: true,
      imagingReviewed: true, anesthesiaAssessment: true, allergiesConfirmed: true,
      medicationsReconciled: true, bloodProductsPrepared: false, equipmentChecked: true,
      emergencyEquipment: true, assistantConfirmed: true
    },
    anesthesiaVisit: {
      visited: true, visitTime: '2026-04-29 10:45', anesthesiologist: '李医生',
      visitNotes: 'ASA I级，仅行局麻，无需特殊麻醉关注',
      vitalSigns: { bp: '112/70mmHg', hr: 72, rr: 16, temp: 36.3, spo2: 99 },
      cardiacExam: '心音正常', pulmonaryExam: '双肺呼吸音清',
      airwayExam: 'Mallampati I，气道正常',
      merckelScore: 1
    },
    riskAssessment: {
      cardiacRisk: '低危', cardiacRiskFactors: [],
      pulmonaryRisk: '低危', pulmonaryRiskFactors: [],
      liverRisk: '低危', kidneyRisk: '低危', dvtRisk: '低危', dvtScore: 0,
      nutritionRisk: '低危', nutritionScore: 0, overallRisk: '低危',
      riskMitigation: ['常规监护']
    },
    status: '已评估-可手术',
    functionalStatus: '正常体力活动',
    comorbidities: [],
    labAbnormalities: [],
    assessments: [
      { time: '2026-04-29 10:30', type: 'ASA分级', result: 'ASA I', doctor: '王海涛' },
      { time: '2026-04-29 10:40', type: 'METs评估', result: 'METs 9', doctor: '王海涛' },
      { time: '2026-04-29 10:50', type: '出血风险', result: '低危', doctor: '王海涛' },
      { time: '2026-04-29 11:00', type: '麻醉评估', result: '低危', doctor: '麻醉科李医生' },
      { time: '2026-04-29 11:10', type: '综合结论', result: '可手术', doctor: '李秀英' },
    ],
    conclusion: '患者ASA I级，METs 9，各项指标正常，无明显出血及麻醉风险，可按计划进行超声内镜检查。',
    precautions: ['常规监护'],
    assessedBy: '王海涛', assessedDate: '2026-04-29'
  },
  {
    id: 'POA005', patientId: 'P005', patientName: '陈伟强', gender: '男', age: 55,
    surgeryType: 'ERCP', surgeryDate: '2026-04-30', doctorName: '张建国',
    asaLevel: 'ASA II', metsScore: 6, metsLevel: '中',
    bleedingRisk: '低危', bleedingScore: 2, anesthesiaRisk: '低危',
    anesthesiaMethod: '全麻',
    mallampatiClass: 'II', mallampatiDesc: '可见软腭+咽峡', airwayDifficulty: '正常',
    checklist: {
      identityConfirmed: true, surgerySiteMarked: true, informedConsent: true,
      FastingStatus: true, IVAccess: true, labResultsReviewed: true,
      imagingReviewed: true, anesthesiaAssessment: true, allergiesConfirmed: true,
      medicationsReconciled: true, bloodProductsPrepared: false, equipmentChecked: true,
      emergencyEquipment: true, assistantConfirmed: true
    },
    anesthesiaVisit: {
      visited: true, visitTime: '2026-04-29 11:30', anesthesiologist: '李医生',
      visitNotes: 'ASA II级，肝功能轻度异常，可行全麻ERCP',
      vitalSigns: { bp: '125/82mmHg', hr: 75, rr: 17, temp: 36.5, spo2: 98 },
      cardiacExam: '心音正常', pulmonaryExam: '双肺呼吸音清',
      airwayExam: 'Mallampati II，张口3指',
      merckelScore: 2
    },
    riskAssessment: {
      cardiacRisk: '低危', cardiacRiskFactors: [],
      pulmonaryRisk: '低危', pulmonaryRiskFactors: [],
      liverRisk: '中危', kidneyRisk: '低危', dvtRisk: '低危', dvtScore: 1,
      nutritionRisk: '低危', nutritionScore: 1, overallRisk: '低危',
      riskMitigation: ['注意肝功能保护', '常规监护']
    },
    status: '已评估-可手术',
    functionalStatus: '正常活动，轻度受限',
    comorbidities: ['HP阳性', '轻度脂肪肝'],
    labAbnormalities: ['ALT 58U/L偏高'],
    assessments: [
      { time: '2026-04-29 11:00', type: 'ASA分级', result: 'ASA II', doctor: '王海涛' },
      { time: '2026-04-29 11:15', type: 'METs评估', result: 'METs 6', doctor: '王海涛' },
      { time: '2026-04-29 11:30', type: '出血风险', result: '低危', doctor: '王海涛' },
      { time: '2026-04-29 11:45', type: '麻醉评估', result: '低危', doctor: '麻醉科李医生' },
      { time: '2026-04-29 12:00', type: '综合结论', result: '可手术', doctor: '张建国' },
    ],
    conclusion: '患者ASA II级，METs 6，低危出血及麻醉风险，轻度肝功能异常不影响手术，可按计划行ERCP。',
    precautions: ['术中注意肝功能保护', '常规监护'],
    assessedBy: '王海涛', assessedDate: '2026-04-29'
  },
  {
    id: 'POA006', patientId: 'P006', patientName: '吴美珍', gender: '女', age: 67,
    surgeryType: '胃底静脉曲张治疗', surgeryDate: '2026-04-30', doctorName: '李秀英',
    asaLevel: 'ASA IV', metsScore: 2, metsLevel: '低',
    bleedingRisk: '高危', bleedingScore: 6, anesthesiaRisk: '高危',
    anesthesiaMethod: '全麻',
    mallampatiClass: 'IV', mallampatiDesc: '硬腭不可见', airwayDifficulty: '困难',
    checklist: {
      identityConfirmed: true, surgerySiteMarked: true, informedConsent: true,
      FastingStatus: true, IVAccess: true, labResultsReviewed: true,
      imagingReviewed: true, anesthesiaAssessment: true, allergiesConfirmed: true,
      medicationsReconciled: false, bloodProductsPrepared: true, equipmentChecked: true,
      emergencyEquipment: true, assistantConfirmed: false
    },
    anesthesiaVisit: {
      visited: true, visitTime: '2026-04-29 13:45', anesthesiologist: '张主任',
      visitNotes: '肝硬化失代偿，Child-Pugh C，麻醉禁忌！禁止手术',
      vitalSigns: { bp: '98/65mmHg', hr: 105, rr: 22, temp: 37.0, spo2: 93 },
      cardiacExam: '心音低钝，律齐', pulmonaryExam: '双肺呼吸音粗',
      airwayExam: 'Mallampati IV，腹水导致膈肌抬高，困难气道',
      merckelScore: 7
    },
    riskAssessment: {
      cardiacRisk: '高危', cardiacRiskFactors: ['肝硬化心肌病'],
      pulmonaryRisk: '高危', pulmonaryRiskFactors: ['腹水膈肌抬高', '肺水肿'],
      liverRisk: '极高危', kidneyRisk: '高危', dvtRisk: '高危', dvtScore: 5,
      nutritionRisk: '高危', nutritionScore: 5, overallRisk: '极高危',
      riskMitigation: ['禁止手术', '纠正凝血', '利尿消腹水', '多学科会诊']
    },
    status: '已评估-禁止',
    functionalStatus: '卧床，仅能自理',
    comorbidities: ['肝硬化失代偿', '腹水', '脾功能亢进', '2型糖尿病', '高血压'],
    labAbnormalities: ['血小板 45×10⁹/L严重减少', 'INR 2.1', '血氨 98μmol/L偏高', '白蛋白 28g/L偏低', '腹水'],
    assessments: [
      { time: '2026-04-29 13:00', type: 'ASA分级', result: 'ASA IV', doctor: '李秀英' },
      { time: '2026-04-29 13:15', type: 'METs评估', result: 'METs 2', doctor: '李秀英' },
      { time: '2026-04-29 13:30', type: '出血风险', result: '高危', doctor: '李秀英' },
      { time: '2026-04-29 13:45', type: '麻醉评估', result: '高危-禁忌', doctor: '麻醉科张主任' },
      { time: '2026-04-29 14:00', type: '综合结论', result: '禁止手术', doctor: '李秀英' },
    ],
    conclusion: '患者ASA IV级，肝硬化失代偿期，出血风险极高（血小板严重减少+INR升高），麻醉风险为禁忌。建议保守治疗，禁止此时期进行静脉曲张治疗，待肝功能改善后再评估。',
    precautions: ['禁止手术', '纠正凝血功能', '利尿消腹水', '营养支持', '多学科会诊'],
    assessedBy: '李秀英', assessedDate: '2026-04-29'
  },
  {
    id: 'POA007', patientId: 'P007', patientName: '黄大军', gender: '男', age: 48,
    surgeryType: 'EMR', surgeryDate: '2026-04-30', doctorName: '张建国',
    asaLevel: 'ASA II', metsScore: 7, metsLevel: '高',
    bleedingRisk: '低危', bleedingScore: 1, anesthesiaRisk: '低危',
    anesthesiaMethod: '镇静',
    mallampatiClass: 'I', mallampatiDesc: '可见全软腭+咽峡+悬雍垂', airwayDifficulty: '正常',
    checklist: {
      identityConfirmed: true, surgerySiteMarked: true, informedConsent: true,
      FastingStatus: true, IVAccess: true, labResultsReviewed: true,
      imagingReviewed: true, anesthesiaAssessment: true, allergiesConfirmed: true,
      medicationsReconciled: true, bloodProductsPrepared: false, equipmentChecked: true,
      emergencyEquipment: true, assistantConfirmed: true
    },
    anesthesiaVisit: {
      visited: true, visitTime: '2026-04-29 14:15', anesthesiologist: '李医生',
      visitNotes: 'ASA II级，血脂偏高，可行镇静麻醉',
      vitalSigns: { bp: '128/80mmHg', hr: 70, rr: 16, temp: 36.4, spo2: 98 },
      cardiacExam: '心音正常', pulmonaryExam: '双肺呼吸音清',
      airwayExam: 'Mallampati I，气道正常',
      merckelScore: 1
    },
    riskAssessment: {
      cardiacRisk: '低危', cardiacRiskFactors: ['高脂血症'],
      pulmonaryRisk: '低危', pulmonaryRiskFactors: [],
      liverRisk: '低危', kidneyRisk: '低危', dvtRisk: '低危', dvtScore: 0,
      nutritionRisk: '低危', nutritionScore: 1, overallRisk: '低危',
      riskMitigation: ['常规监护']
    },
    status: '已评估-可手术',
    functionalStatus: '正常体力活动',
    comorbidities: ['高脂血症'],
    labAbnormalities: ['TC 6.8mmol/L偏高'],
    assessments: [
      { time: '2026-04-29 13:30', type: 'ASA分级', result: 'ASA II', doctor: '王海涛' },
      { time: '2026-04-29 13:45', type: 'METs评估', result: 'METs 7', doctor: '王海涛' },
      { time: '2026-04-29 14:00', type: '出血风险', result: '低危', doctor: '王海涛' },
      { time: '2026-04-29 14:15', type: '麻醉评估', result: '低危', doctor: '麻醉科李医生' },
      { time: '2026-04-29 14:30', type: '综合结论', result: '可手术', doctor: '张建国' },
    ],
    conclusion: '患者ASA II级，METs 7，低危出血及麻醉风险，血脂偏高但不影响手术，可按计划行EMR。',
    precautions: ['常规监护'],
    assessedBy: '王海涛', assessedDate: '2026-04-29'
  },
  {
    id: 'POA008', patientId: 'P008', patientName: '孙红梅', gender: '女', age: 52,
    surgeryType: '食管扩张', surgeryDate: '2026-04-30', doctorName: '李秀英',
    asaLevel: 'ASA II', metsScore: 6, metsLevel: '中',
    bleedingRisk: '低危', bleedingScore: 1, anesthesiaRisk: '低危',
    anesthesiaMethod: '局麻',
    mallampatiClass: 'II', mallampatiDesc: '可见软腭+咽峡', airwayDifficulty: '正常',
    checklist: {
      identityConfirmed: true, surgerySiteMarked: true, informedConsent: true,
      FastingStatus: true, IVAccess: true, labResultsReviewed: true,
      imagingReviewed: true, anesthesiaAssessment: true, allergiesConfirmed: true,
      medicationsReconciled: true, bloodProductsPrepared: false, equipmentChecked: true,
      emergencyEquipment: true, assistantConfirmed: true
    },
    anesthesiaVisit: {
      visited: true, visitTime: '2026-04-29 14:30', anesthesiologist: '李医生',
      visitNotes: 'ASA II级，反流性食管炎，局麻下行食管扩张',
      vitalSigns: { bp: '120/76mmHg', hr: 72, rr: 17, temp: 36.5, spo2: 98 },
      cardiacExam: '心音正常', pulmonaryExam: '双肺呼吸音清',
      airwayExam: 'Mallampati II，气道可',
      merckelScore: 2
    },
    riskAssessment: {
      cardiacRisk: '低危', cardiacRiskFactors: [],
      pulmonaryRisk: '低危', pulmonaryRiskFactors: ['反流性食管炎'],
      liverRisk: '低危', kidneyRisk: '低危', dvtRisk: '低危', dvtScore: 0,
      nutritionRisk: '低危', nutritionScore: 1, overallRisk: '低危',
      riskMitigation: ['注意反流误吸', '常规监护']
    },
    status: '已评估-可手术',
    functionalStatus: '正常活动',
    comorbidities: ['反流性食管炎'],
    labAbnormalities: [],
    assessments: [
      { time: '2026-04-29 14:00', type: 'ASA分级', result: 'ASA II', doctor: '王海涛' },
      { time: '2026-04-29 14:10', type: 'METs评估', result: 'METs 6', doctor: '王海涛' },
      { time: '2026-04-29 14:20', type: '出血风险', result: '低危', doctor: '王海涛' },
      { time: '2026-04-29 14:30', type: '麻醉评估', result: '低危', doctor: '麻醉科李医生' },
      { time: '2026-04-29 14:45', type: '综合结论', result: '可手术', doctor: '李秀英' },
    ],
    conclusion: '患者ASA II级，METs 6，低危出血及麻醉风险，可按计划行食管扩张术。',
    precautions: ['注意反流误吸', '常规监护'],
    assessedBy: '王海涛', assessedDate: '2026-04-29'
  },
  {
    id: 'POA009', patientId: 'P009', patientName: '赵小龙', gender: '男', age: 42,
    surgeryType: 'ESD', surgeryDate: '2026-04-30', doctorName: '张建国',
    asaLevel: 'ASA I', metsScore: 8, metsLevel: '高',
    bleedingRisk: '低危', bleedingScore: 0, anesthesiaRisk: '低危',
    anesthesiaMethod: '全麻',
    mallampatiClass: 'I', mallampatiDesc: '可见全软腭+咽峡+悬雍垂', airwayDifficulty: '正常',
    checklist: {
      identityConfirmed: true, surgerySiteMarked: true, informedConsent: true,
      FastingStatus: true, IVAccess: true, labResultsReviewed: true,
      imagingReviewed: true, anesthesiaAssessment: true, allergiesConfirmed: true,
      medicationsReconciled: true, bloodProductsPrepared: false, equipmentChecked: true,
      emergencyEquipment: true, assistantConfirmed: true
    },
    anesthesiaVisit: {
      visited: true, visitTime: '2026-04-29 15:00', anesthesiologist: '李医生',
      visitNotes: 'ASA I级，身体健康，可行全麻ESD',
      vitalSigns: { bp: '118/72mmHg', hr: 68, rr: 16, temp: 36.3, spo2: 99 },
      cardiacExam: '心音正常', pulmonaryExam: '双肺呼吸音清',
      airwayExam: 'Mallampati I，气道正常',
      merckelScore: 1
    },
    riskAssessment: {
      cardiacRisk: '低危', cardiacRiskFactors: [],
      pulmonaryRisk: '低危', pulmonaryRiskFactors: [],
      liverRisk: '低危', kidneyRisk: '低危', dvtRisk: '低危', dvtScore: 0,
      nutritionRisk: '低危', nutritionScore: 0, overallRisk: '低危',
      riskMitigation: ['常规监护']
    },
    status: '已评估-可手术',
    functionalStatus: '正常体力活动',
    comorbidities: [],
    labAbnormalities: [],
    assessments: [
      { time: '2026-04-29 14:30', type: 'ASA分级', result: 'ASA I', doctor: '王海涛' },
      { time: '2026-04-29 14:40', type: 'METs评估', result: 'METs 8', doctor: '王海涛' },
      { time: '2026-04-29 14:50', type: '出血风险', result: '低危', doctor: '王海涛' },
      { time: '2026-04-29 15:00', type: '麻醉评估', result: '低危', doctor: '麻醉科李医生' },
      { time: '2026-04-29 15:15', type: '综合结论', result: '可手术', doctor: '张建国' },
    ],
    conclusion: '患者ASA I级，METs 8，各项指标正常，无出血及麻醉风险，可按计划行ESD。',
    precautions: ['常规监护'],
    assessedBy: '王海涛', assessedDate: '2026-04-29'
  },
  {
    id: 'POA010', patientId: 'P010', patientName: '周玉芬', gender: '女', age: 71,
    surgeryType: '超声内镜', surgeryDate: '2026-04-30', doctorName: '李秀英',
    asaLevel: 'ASA III', metsScore: 3, metsLevel: '低',
    bleedingRisk: '中危', bleedingScore: 3, anesthesiaRisk: '中危',
    anesthesiaMethod: '镇静',
    mallampatiClass: 'II', mallampatiDesc: '可见软腭+咽峡', airwayDifficulty: '轻度困难',
    checklist: {
      identityConfirmed: true, surgerySiteMarked: true, informedConsent: true,
      FastingStatus: true, IVAccess: true, labResultsReviewed: true,
      imagingReviewed: true, anesthesiaAssessment: true, allergiesConfirmed: true,
      medicationsReconciled: true, bloodProductsPrepared: true, equipmentChecked: true,
      emergencyEquipment: true, assistantConfirmed: true
    },
    anesthesiaVisit: {
      visited: true, visitTime: '2026-04-29 15:45', anesthesiologist: '张主任',
      visitNotes: 'ASA III级，轻度贫血，偶发室早，术中加强监护',
      vitalSigns: { bp: '142/88mmHg', hr: 78, rr: 18, temp: 36.5, spo2: 96 },
      cardiacExam: '未及明显杂音，偶发早搏', pulmonaryExam: '双肺呼吸音清',
      airwayExam: 'Mallampati II，颈椎活动可',
      merckelScore: 4
    },
    riskAssessment: {
      cardiacRisk: '中危', cardiacRiskFactors: ['直肠癌术后', '心电图偶发室早'],
      pulmonaryRisk: '低危', pulmonaryRiskFactors: [],
      liverRisk: '低危', kidneyRisk: '低危', dvtRisk: '中危', dvtScore: 2,
      nutritionRisk: '中危', nutritionScore: 3, overallRisk: '中危',
      riskMitigation: ['术前输血纠正贫血', '术中心电监护', '备血']
    },
    status: '已评估-可手术',
    functionalStatus: '轻微活动即感气促',
    comorbidities: ['直肠癌术后', '肺转移可能', '轻度贫血', '高血压'],
    labAbnormalities: ['Hb 96g/L偏低', 'CEA 8.2ng/mL偏高', '心电图偶发室早'],
    assessments: [
      { time: '2026-04-29 15:00', type: 'ASA分级', result: 'ASA III', doctor: '李秀英' },
      { time: '2026-04-29 15:15', type: 'METs评估', result: 'METs 3', doctor: '李秀英' },
      { time: '2026-04-29 15:30', type: '出血风险', result: '中危', doctor: '李秀英' },
      { time: '2026-04-29 15:45', type: '麻醉评估', result: '中危', doctor: '麻醉科张主任' },
      { time: '2026-04-29 16:00', type: '综合结论', result: '可手术', doctor: '李秀英' },
    ],
    conclusion: '患者ASA III级，METs 3，中危出血及麻醉风险，有轻度贫血。建议输血纠正Hb至100g/L以上，术中加强监护。',
    precautions: ['术前输血纠正贫血', '术中心电监护', '备血'],
    assessedBy: '李秀英', assessedDate: '2026-04-29'
  },
  {
    id: 'POA011', patientId: 'P001', patientName: '王建国', gender: '男', age: 58,
    surgeryType: 'EMR', surgeryDate: '2026-05-02', doctorName: '张建国',
    asaLevel: 'ASA II', metsScore: 5, metsLevel: '中',
    bleedingRisk: '低危', bleedingScore: 1, anesthesiaRisk: '低危',
    anesthesiaMethod: '镇静',
    mallampatiClass: 'II', mallampatiDesc: '可见软腭+咽峡', airwayDifficulty: '正常',
    checklist: {
      identityConfirmed: false, surgerySiteMarked: false, informedConsent: true,
      FastingStatus: false, IVAccess: false, labResultsReviewed: true,
      imagingReviewed: true, anesthesiaAssessment: false, allergiesConfirmed: true,
      medicationsReconciled: false, bloodProductsPrepared: false, equipmentChecked: false,
      emergencyEquipment: false, assistantConfirmed: false
    },
    anesthesiaVisit: {
      visited: false, visitTime: '', anesthesiologist: '',
      visitNotes: '待完善麻醉访视',
      vitalSigns: { bp: '', hr: 0, rr: 0, temp: 0, spo2: 0 },
      cardiacExam: '', pulmonaryExam: '', airwayExam: '',
      merckelScore: 0
    },
    riskAssessment: {
      cardiacRisk: '低危', cardiacRiskFactors: [],
      pulmonaryRisk: '低危', pulmonaryRiskFactors: [],
      liverRisk: '低危', kidneyRisk: '低危', dvtRisk: '低危', dvtScore: 0,
      nutritionRisk: '低危', nutritionScore: 0, overallRisk: '低危',
      riskMitigation: ['完善术前准备']
    },
    status: '待评估',
    functionalStatus: '正常活动',
    comorbidities: ['慢性胃炎'],
    labAbnormalities: [],
    assessments: [
      { time: '2026-04-29 16:00', type: 'ASA分级', result: 'ASA II', doctor: '待定' },
    ],
    conclusion: '待完善评估',
    precautions: [],
    assessedBy: '', assessedDate: ''
  },
  {
    id: 'POA012', patientId: 'P002', patientName: '李秀芳', gender: '女', age: 45,
    surgeryType: 'ERCP', surgeryDate: '2026-05-02', doctorName: '李秀英',
    asaLevel: 'ASA I', metsScore: 9, metsLevel: '高',
    bleedingRisk: '低危', bleedingScore: 0, anesthesiaRisk: '低危',
    anesthesiaMethod: '全麻',
    mallampatiClass: 'I', mallampatiDesc: '可见全软腭+咽峡+悬雍垂', airwayDifficulty: '正常',
    checklist: {
      identityConfirmed: true, surgerySiteMarked: true, informedConsent: true,
      FastingStatus: true, IVAccess: true, labResultsReviewed: true,
      imagingReviewed: true, anesthesiaAssessment: true, allergiesConfirmed: true,
      medicationsReconciled: true, bloodProductsPrepared: false, equipmentChecked: true,
      emergencyEquipment: true, assistantConfirmed: true
    },
    anesthesiaVisit: {
      visited: true, visitTime: '2026-04-28 09:45', anesthesiologist: '李医生',
      visitNotes: 'ASA I级，身体状况良好，全麻ERCP无特殊风险',
      vitalSigns: { bp: '115/72mmHg', hr: 68, rr: 16, temp: 36.4, spo2: 99 },
      cardiacExam: '心音正常', pulmonaryExam: '双肺呼吸音清',
      airwayExam: 'Mallampati I，气道正常',
      merckelScore: 1
    },
    riskAssessment: {
      cardiacRisk: '低危', cardiacRiskFactors: [],
      pulmonaryRisk: '低危', pulmonaryRiskFactors: [],
      liverRisk: '低危', kidneyRisk: '低危', dvtRisk: '低危', dvtScore: 0,
      nutritionRisk: '低危', nutritionScore: 0, overallRisk: '低危',
      riskMitigation: ['术后常规观察']
    },
    status: '已完成',
    functionalStatus: '正常体力活动',
    comorbidities: [],
    labAbnormalities: [],
    assessments: [
      { time: '2026-04-28 09:00', type: 'ASA分级', result: 'ASA I', doctor: '王海涛' },
      { time: '2026-04-28 09:15', type: 'METs评估', result: 'METs 9', doctor: '王海涛' },
      { time: '2026-04-28 09:30', type: '出血风险', result: '低危', doctor: '王海涛' },
      { time: '2026-04-28 09:45', type: '麻醉评估', result: '低危', doctor: '麻醉科李医生' },
      { time: '2026-04-28 10:00', type: '综合结论', result: '可手术', doctor: '李秀英' },
    ],
    conclusion: '患者ASA I级，METs 9，各项指标正常，手术顺利完成。',
    precautions: ['术后常规观察'],
    assessedBy: '王海涛', assessedDate: '2026-04-28'
  },
  {
    id: 'POA013', patientId: 'P003', patientName: '张德明', gender: '男', age: 62,
    surgeryType: '结肠镜检查', surgeryDate: '2026-05-01', doctorName: '张建国',
    asaLevel: 'ASA II', metsScore: 6, metsLevel: '中',
    bleedingRisk: '低危', bleedingScore: 1, anesthesiaRisk: '低危',
    anesthesiaMethod: '镇静',
    mallampatiClass: 'II', mallampatiDesc: '可见软腭+咽峡', airwayDifficulty: '正常',
    checklist: {
      identityConfirmed: true, surgerySiteMarked: true, informedConsent: true,
      FastingStatus: true, IVAccess: true, labResultsReviewed: true,
      imagingReviewed: true, anesthesiaAssessment: true, allergiesConfirmed: true,
      medicationsReconciled: true, bloodProductsPrepared: false, equipmentChecked: true,
      emergencyEquipment: true, assistantConfirmed: true
    },
    anesthesiaVisit: {
      visited: true, visitTime: '2026-04-27 09:45', anesthesiologist: '李医生',
      visitNotes: 'ASA II级，结肠息肉术后，可行镇静肠镜',
      vitalSigns: { bp: '122/78mmHg', hr: 72, rr: 16, temp: 36.4, spo2: 98 },
      cardiacExam: '心音正常', pulmonaryExam: '双肺呼吸音清',
      airwayExam: 'Mallampati II，气道正常',
      merckelScore: 2
    },
    riskAssessment: {
      cardiacRisk: '低危', cardiacRiskFactors: [],
      pulmonaryRisk: '低危', pulmonaryRiskFactors: [],
      liverRisk: '低危', kidneyRisk: '低危', dvtRisk: '低危', dvtScore: 0,
      nutritionRisk: '低危', nutritionScore: 0, overallRisk: '低危',
      riskMitigation: ['术后常规观察']
    },
    status: '已完成',
    functionalStatus: '正常活动',
    comorbidities: ['结肠息肉术后'],
    labAbnormalities: [],
    assessments: [
      { time: '2026-04-27 10:00', type: 'ASA分级', result: 'ASA II', doctor: '王海涛' },
      { time: '2026-04-27 10:15', type: 'METs评估', result: 'METs 6', doctor: '王海涛' },
      { time: '2026-04-27 10:30', type: '出血风险', result: '低危', doctor: '王海涛' },
      { time: '2026-04-27 10:45', type: '麻醉评估', result: '低危', doctor: '麻醉科李医生' },
      { time: '2026-04-27 11:00', type: '综合结论', result: '可手术', doctor: '张建国' },
    ],
    conclusion: '术前评估通过，已顺利完成结肠镜检查，未见明显异常。',
    precautions: ['术后常规观察'],
    assessedBy: '王海涛', assessedDate: '2026-04-27'
  },
  {
    id: 'POA014', patientId: 'P004', patientName: '周丽娟', gender: '女', age: 38,
    surgeryType: '胃镜检查', surgeryDate: '2026-04-29', doctorName: '李秀英',
    asaLevel: 'ASA I', metsScore: 10, metsLevel: '高',
    bleedingRisk: '低危', bleedingScore: 0, anesthesiaRisk: '低危',
    anesthesiaMethod: '咽部局麻',
    mallampatiClass: 'I', mallampatiDesc: '可见全软腭+咽峡+悬雍垂', airwayDifficulty: '正常',
    checklist: {
      identityConfirmed: true, surgerySiteMarked: true, informedConsent: true,
      FastingStatus: true, IVAccess: false, labResultsReviewed: true,
      imagingReviewed: true, anesthesiaAssessment: true, allergiesConfirmed: true,
      medicationsReconciled: true, bloodProductsPrepared: false, equipmentChecked: true,
      emergencyEquipment: true, assistantConfirmed: true
    },
    anesthesiaVisit: {
      visited: true, visitTime: '2026-04-29 08:30', anesthesiologist: '李医生',
      visitNotes: 'ASA I级，仅行局麻，无需特殊关注',
      vitalSigns: { bp: '110/68mmHg', hr: 70, rr: 16, temp: 36.3, spo2: 99 },
      cardiacExam: '心音正常', pulmonaryExam: '双肺呼吸音清',
      airwayExam: 'Mallampati I，气道正常',
      merckelScore: 1
    },
    riskAssessment: {
      cardiacRisk: '低危', cardiacRiskFactors: [],
      pulmonaryRisk: '低危', pulmonaryRiskFactors: [],
      liverRisk: '低危', kidneyRisk: '低危', dvtRisk: '低危', dvtScore: 0,
      nutritionRisk: '低危', nutritionScore: 0, overallRisk: '低危',
      riskMitigation: ['术后常规观察']
    },
    status: '已完成',
    functionalStatus: '正常体力活动',
    comorbidities: [],
    labAbnormalities: [],
    assessments: [
      { time: '2026-04-29 08:00', type: 'ASA分级', result: 'ASA I', doctor: '王海涛' },
      { time: '2026-04-29 08:10', type: 'METs评估', result: 'METs 10', doctor: '王海涛' },
      { time: '2026-04-29 08:20', type: '出血风险', result: '低危', doctor: '王海涛' },
      { time: '2026-04-29 08:30', type: '麻醉评估', result: '低危', doctor: '麻醉科李医生' },
      { time: '2026-04-29 08:45', type: '综合结论', result: '可手术', doctor: '李秀英' },
    ],
    conclusion: '术前评估通过，已顺利完成胃镜检查，提示慢性浅表性胃炎。',
    precautions: ['术后常规观察'],
    assessedBy: '王海涛', assessedDate: '2026-04-29'
  },
  {
    id: 'POA015', patientId: 'P005', patientName: '陈伟强', gender: '男', age: 55,
    surgeryType: '胃镜下活检', surgeryDate: '2026-04-29', doctorName: '李秀英',
    asaLevel: 'ASA II', metsScore: 7, metsLevel: '高',
    bleedingRisk: '低危', bleedingScore: 1, anesthesiaRisk: '低危',
    anesthesiaMethod: '咽部局麻',
    mallampatiClass: 'II', mallampatiDesc: '可见软腭+咽峡', airwayDifficulty: '正常',
    checklist: {
      identityConfirmed: true, surgerySiteMarked: true, informedConsent: true,
      FastingStatus: true, IVAccess: true, labResultsReviewed: true,
      imagingReviewed: true, anesthesiaAssessment: true, allergiesConfirmed: true,
      medicationsReconciled: true, bloodProductsPrepared: false, equipmentChecked: true,
      emergencyEquipment: true, assistantConfirmed: true
    },
    anesthesiaVisit: {
      visited: true, visitTime: '2026-04-29 09:00', anesthesiologist: '李医生',
      visitNotes: 'ASA II级，HP阳性，局麻下行活检',
      vitalSigns: { bp: '120/76mmHg', hr: 72, rr: 16, temp: 36.4, spo2: 98 },
      cardiacExam: '心音正常', pulmonaryExam: '双肺呼吸音清',
      airwayExam: 'Mallampati II，气道正常',
      merckelScore: 2
    },
    riskAssessment: {
      cardiacRisk: '低危', cardiacRiskFactors: [],
      pulmonaryRisk: '低危', pulmonaryRiskFactors: [],
      liverRisk: '低危', kidneyRisk: '低危', dvtRisk: '低危', dvtScore: 0,
      nutritionRisk: '低危', nutritionScore: 1, overallRisk: '低危',
      riskMitigation: ['术后常规观察', '活检后禁食2小时']
    },
    status: '已完成',
    functionalStatus: '正常体力活动',
    comorbidities: ['HP阳性'],
    labAbnormalities: ['HP (+)'],
    assessments: [
      { time: '2026-04-29 08:30', type: 'ASA分级', result: 'ASA II', doctor: '王海涛' },
      { time: '2026-04-29 08:40', type: 'METs评估', result: 'METs 7', doctor: '王海涛' },
      { time: '2026-04-29 08:50', type: '出血风险', result: '低危', doctor: '王海涛' },
      { time: '2026-04-29 09:00', type: '麻醉评估', result: '低危', doctor: '麻醉科李医生' },
      { time: '2026-04-29 09:15', type: '综合结论', result: '可手术', doctor: '李秀英' },
    ],
    conclusion: '术前评估通过，已顺利完成胃镜下活检，标本已送病理。',
    precautions: ['术后常规观察', '活检后禁食2小时'],
    assessedBy: '王海涛', assessedDate: '2026-04-29'
  },
  {
    id: 'POA016', patientId: 'P006', patientName: '吴美珍', gender: '女', age: 67,
    surgeryType: '肠镜检查', surgeryDate: '2026-04-29', doctorName: '李秀英',
    asaLevel: 'ASA III', metsScore: 4, metsLevel: '中',
    bleedingRisk: '中危', bleedingScore: 3, anesthesiaRisk: '中危',
    anesthesiaMethod: '镇静',
    mallampatiClass: 'III', mallampatiDesc: '仅见硬腭', airwayDifficulty: '中度困难',
    checklist: {
      identityConfirmed: true, surgerySiteMarked: true, informedConsent: true,
      FastingStatus: true, IVAccess: true, labResultsReviewed: true,
      imagingReviewed: true, anesthesiaAssessment: true, allergiesConfirmed: true,
      medicationsReconciled: true, bloodProductsPrepared: false, equipmentChecked: true,
      emergencyEquipment: true, assistantConfirmed: true
    },
    anesthesiaVisit: {
      visited: true, visitTime: '2026-04-29 09:45', anesthesiologist: '张主任',
      visitNotes: 'ASA III级，糖尿病高血压，血糖控制欠佳，术中监护',
      vitalSigns: { bp: '148/90mmHg', hr: 80, rr: 18, temp: 36.6, spo2: 97 },
      cardiacExam: '主动脉瓣区可及杂音', pulmonaryExam: '双肺呼吸音粗',
      airwayExam: 'Mallampati III，脊柱后凸',
      merckelScore: 4
    },
    riskAssessment: {
      cardiacRisk: '中危', cardiacRiskFactors: ['高血压', '心电图ST段改变'],
      pulmonaryRisk: '低危', pulmonaryRiskFactors: [],
      liverRisk: '低危', kidneyRisk: '低危', dvtRisk: '中危', dvtScore: 2,
      nutritionRisk: '中危', nutritionScore: 2, overallRisk: '中危',
      riskMitigation: ['术中监护', '注意血糖控制']
    },
    status: '已完成',
    functionalStatus: '活动轻度受限',
    comorbidities: ['2型糖尿病', '高血压', '结肠息肉术后'],
    labAbnormalities: ['血糖 8.6mmol/L偏高'],
    assessments: [
      { time: '2026-04-29 09:00', type: 'ASA分级', result: 'ASA III', doctor: '王海涛' },
      { time: '2026-04-29 09:15', type: 'METs评估', result: 'METs 4', doctor: '王海涛' },
      { time: '2026-04-29 09:30', type: '出血风险', result: '中危', doctor: '王海涛' },
      { time: '2026-04-29 09:45', type: '麻醉评估', result: '中危', doctor: '麻醉科张主任' },
      { time: '2026-04-29 10:00', type: '综合结论', result: '可手术', doctor: '李秀英' },
    ],
    conclusion: '术前评估通过，已顺利完成肠镜检查，提示肠道准备欠佳。',
    precautions: ['术中监护', '注意血糖控制'],
    assessedBy: '王海涛', assessedDate: '2026-04-29'
  },
  {
    id: 'POA017', patientId: 'P007', patientName: '黄大军', gender: '男', age: 48,
    surgeryType: '胃镜检查', surgeryDate: '2026-04-29', doctorName: '张建国',
    asaLevel: 'ASA I', metsScore: 8, metsLevel: '高',
    bleedingRisk: '低危', bleedingScore: 0, anesthesiaRisk: '低危',
    anesthesiaMethod: '咽部局麻',
    mallampatiClass: 'I', mallampatiDesc: '可见全软腭+咽峡+悬雍垂', airwayDifficulty: '正常',
    checklist: {
      identityConfirmed: true, surgerySiteMarked: true, informedConsent: true,
      FastingStatus: true, IVAccess: false, labResultsReviewed: true,
      imagingReviewed: true, anesthesiaAssessment: true, allergiesConfirmed: true,
      medicationsReconciled: true, bloodProductsPrepared: false, equipmentChecked: true,
      emergencyEquipment: true, assistantConfirmed: true
    },
    anesthesiaVisit: {
      visited: true, visitTime: '2026-04-29 10:00', anesthesiologist: '李医生',
      visitNotes: 'ASA I级，身体健康，局麻下完成检查',
      vitalSigns: { bp: '118/72mmHg', hr: 68, rr: 16, temp: 36.3, spo2: 99 },
      cardiacExam: '心音正常', pulmonaryExam: '双肺呼吸音清',
      airwayExam: 'Mallampati I，气道正常',
      merckelScore: 1
    },
    riskAssessment: {
      cardiacRisk: '低危', cardiacRiskFactors: [],
      pulmonaryRisk: '低危', pulmonaryRiskFactors: [],
      liverRisk: '低危', kidneyRisk: '低危', dvtRisk: '低危', dvtScore: 0,
      nutritionRisk: '低危', nutritionScore: 0, overallRisk: '低危',
      riskMitigation: ['术后常规观察']
    },
    status: '已完成',
    functionalStatus: '正常体力活动',
    comorbidities: [],
    labAbnormalities: [],
    assessments: [
      { time: '2026-04-29 09:30', type: 'ASA分级', result: 'ASA I', doctor: '王海涛' },
      { time: '2026-04-29 09:40', type: 'METs评估', result: 'METs 8', doctor: '王海涛' },
      { time: '2026-04-29 09:50', type: '出血风险', result: '低危', doctor: '王海涛' },
      { time: '2026-04-29 10:00', type: '麻醉评估', result: '低危', doctor: '麻醉科李医生' },
      { time: '2026-04-29 10:15', type: '综合结论', result: '可手术', doctor: '张建国' },
    ],
    conclusion: '术前评估通过，已顺利完成胃镜检查，未见明显异常。',
    precautions: ['术后常规观察'],
    assessedBy: '王海涛', assessedDate: '2026-04-29'
  },
  {
    id: 'POA018', patientId: 'P008', patientName: '孙红梅', gender: '女', age: 52,
    surgeryType: '胃镜复查', surgeryDate: '2026-04-29', doctorName: '张建国',
    asaLevel: 'ASA I', metsScore: 7, metsLevel: '高',
    bleedingRisk: '低危', bleedingScore: 0, anesthesiaRisk: '低危',
    anesthesiaMethod: '咽部局麻',
    mallampatiClass: 'I', mallampatiDesc: '可见全软腭+咽峡+悬雍垂', airwayDifficulty: '正常',
    checklist: {
      identityConfirmed: true, surgerySiteMarked: true, informedConsent: true,
      FastingStatus: true, IVAccess: false, labResultsReviewed: true,
      imagingReviewed: true, anesthesiaAssessment: true, allergiesConfirmed: true,
      medicationsReconciled: true, bloodProductsPrepared: false, equipmentChecked: true,
      emergencyEquipment: true, assistantConfirmed: true
    },
    anesthesiaVisit: {
      visited: true, visitTime: '2026-04-29 10:30', anesthesiologist: '李医生',
      visitNotes: 'ASA I级，反流性食管炎复查，局麻下完成',
      vitalSigns: { bp: '115/70mmHg', hr: 70, rr: 16, temp: 36.4, spo2: 99 },
      cardiacExam: '心音正常', pulmonaryExam: '双肺呼吸音清',
      airwayExam: 'Mallampati I，气道正常',
      merckelScore: 1
    },
    riskAssessment: {
      cardiacRisk: '低危', cardiacRiskFactors: [],
      pulmonaryRisk: '低危', pulmonaryRiskFactors: ['反流性食管炎'],
      liverRisk: '低危', kidneyRisk: '低危', dvtRisk: '低危', dvtScore: 0,
      nutritionRisk: '低危', nutritionScore: 0, overallRisk: '低危',
      riskMitigation: ['术后常规观察']
    },
    status: '已完成',
    functionalStatus: '正常体力活动',
    comorbidities: ['反流性食管炎'],
    labAbnormalities: [],
    assessments: [
      { time: '2026-04-29 10:00', type: 'ASA分级', result: 'ASA I', doctor: '王海涛' },
      { time: '2026-04-29 10:10', type: 'METs评估', result: 'METs 7', doctor: '王海涛' },
      { time: '2026-04-29 10:20', type: '出血风险', result: '低危', doctor: '王海涛' },
      { time: '2026-04-29 10:30', type: '麻醉评估', result: '低危', doctor: '麻醉科李医生' },
      { time: '2026-04-29 10:45', type: '综合结论', result: '可手术', doctor: '张建国' },
    ],
    conclusion: '术前评估通过，已顺利完成胃镜复查，提示反流性食管炎较前好转。',
    precautions: ['术后常规观察'],
    assessedBy: '王海涛', assessedDate: '2026-04-29'
  },
  {
    id: 'POA019', patientId: 'P009', patientName: '赵小龙', gender: '男', age: 42,
    surgeryType: '肠镜检查', surgeryDate: '2026-04-30', doctorName: '李秀英',
    asaLevel: 'ASA I', metsScore: 9, metsLevel: '高',
    bleedingRisk: '低危', bleedingScore: 0, anesthesiaRisk: '低危',
    anesthesiaMethod: '镇静',
    mallampatiClass: 'I', mallampatiDesc: '可见全软腭+咽峡+悬雍垂', airwayDifficulty: '正常',
    checklist: {
      identityConfirmed: false, surgerySiteMarked: false, informedConsent: true,
      FastingStatus: false, IVAccess: false, labResultsReviewed: false,
      imagingReviewed: false, anesthesiaAssessment: false, allergiesConfirmed: true,
      medicationsReconciled: false, bloodProductsPrepared: false, equipmentChecked: false,
      emergencyEquipment: false, assistantConfirmed: false
    },
    anesthesiaVisit: {
      visited: false, visitTime: '', anesthesiologist: '',
      visitNotes: '待完善麻醉访视',
      vitalSigns: { bp: '', hr: 0, rr: 0, temp: 0, spo2: 0 },
      cardiacExam: '', pulmonaryExam: '', airwayExam: '',
      merckelScore: 0
    },
    riskAssessment: {
      cardiacRisk: '低危', cardiacRiskFactors: [],
      pulmonaryRisk: '低危', pulmonaryRiskFactors: [],
      liverRisk: '低危', kidneyRisk: '低危', dvtRisk: '低危', dvtScore: 0,
      nutritionRisk: '低危', nutritionScore: 0, overallRisk: '低危',
      riskMitigation: ['完善术前准备']
    },
    status: '待评估',
    functionalStatus: '正常体力活动',
    comorbidities: [],
    labAbnormalities: [],
    assessments: [],
    conclusion: '待完善评估',
    precautions: [],
    assessedBy: '', assessedDate: ''
  },
  {
    id: 'POA020', patientId: 'P010', patientName: '周玉芬', gender: '女', age: 71,
    surgeryType: '结肠镜检查', surgeryDate: '2026-04-30', doctorName: '李秀英',
    asaLevel: 'ASA III', metsScore: 3, metsLevel: '低',
    bleedingRisk: '中危', bleedingScore: 4, anesthesiaRisk: '中危',
    anesthesiaMethod: '镇静',
    mallampatiClass: 'II', mallampatiDesc: '可见软腭+咽峡', airwayDifficulty: '轻度困难',
    checklist: {
      identityConfirmed: true, surgerySiteMarked: true, informedConsent: true,
      FastingStatus: true, IVAccess: true, labResultsReviewed: true,
      imagingReviewed: true, anesthesiaAssessment: true, allergiesConfirmed: true,
      medicationsReconciled: true, bloodProductsPrepared: true, equipmentChecked: true,
      emergencyEquipment: true, assistantConfirmed: true
    },
    anesthesiaVisit: {
      visited: true, visitTime: '2026-04-29 11:45', anesthesiologist: '张主任',
      visitNotes: 'ASA III级，贫血已纠正，可行镇静肠镜',
      vitalSigns: { bp: '135/85mmHg', hr: 76, rr: 17, temp: 36.5, spo2: 97 },
      cardiacExam: '未及明显杂音', pulmonaryExam: '双肺呼吸音清',
      airwayExam: 'Mallampati II，颈椎活动可',
      merckelScore: 3
    },
    riskAssessment: {
      cardiacRisk: '中危', cardiacRiskFactors: ['直肠癌术后', '心电图ST段改变'],
      pulmonaryRisk: '低危', pulmonaryRiskFactors: [],
      liverRisk: '低危', kidneyRisk: '低危', dvtRisk: '中危', dvtScore: 2,
      nutritionRisk: '中危', nutritionScore: 3, overallRisk: '中危',
      riskMitigation: ['术中监护', '备血', '术后补充铁剂']
    },
    status: '已完成',
    functionalStatus: '轻微活动受限',
    comorbidities: ['直肠癌术后', '高血压', '轻度贫血'],
    labAbnormalities: ['Hb 92g/L偏低', '心电图ST段改变'],
    assessments: [
      { time: '2026-04-29 11:00', type: 'ASA分级', result: 'ASA III', doctor: '李秀英' },
      { time: '2026-04-29 11:15', type: 'METs评估', result: 'METs 3', doctor: '李秀英' },
      { time: '2026-04-29 11:30', type: '出血风险', result: '中危', doctor: '李秀英' },
      { time: '2026-04-29 11:45', type: '麻醉评估', result: '中危', doctor: '麻醉科张主任' },
      { time: '2026-04-29 12:00', type: '综合结论', result: '可手术', doctor: '李秀英' },
    ],
    conclusion: '术前评估通过，输血纠正贫血后顺利进行结肠镜检查，发现结肠多发息肉。',
    precautions: ['术中监护', '备血', '术后补充铁剂'],
    assessedBy: '李秀英', assessedDate: '2026-04-29'
  },
  {
    id: 'POA021', patientId: 'P001', patientName: '王建国', gender: '男', age: 58,
    surgeryType: '胃镜复查', surgeryDate: '2026-04-28', doctorName: '张建国',
    asaLevel: 'ASA II', metsScore: 5, metsLevel: '中',
    bleedingRisk: '低危', bleedingScore: 1, anesthesiaRisk: '低危',
    anesthesiaMethod: '咽部局麻',
    mallampatiClass: 'II', mallampatiDesc: '可见软腭+咽峡', airwayDifficulty: '正常',
    checklist: {
      identityConfirmed: true, surgerySiteMarked: true, informedConsent: true,
      FastingStatus: true, IVAccess: false, labResultsReviewed: true,
      imagingReviewed: true, anesthesiaAssessment: true, allergiesConfirmed: true,
      medicationsReconciled: true, bloodProductsPrepared: false, equipmentChecked: true,
      emergencyEquipment: true, assistantConfirmed: true
    },
    anesthesiaVisit: {
      visited: true, visitTime: '2026-04-28 08:45', anesthesiologist: '李医生',
      visitNotes: 'ASA II级，胃溃疡病史，局麻下复查',
      vitalSigns: { bp: '125/80mmHg', hr: 74, rr: 16, temp: 36.4, spo2: 98 },
      cardiacExam: '心音正常', pulmonaryExam: '双肺呼吸音清',
      airwayExam: 'Mallampati II，气道正常',
      merckelScore: 2
    },
    riskAssessment: {
      cardiacRisk: '低危', cardiacRiskFactors: [],
      pulmonaryRisk: '低危', pulmonaryRiskFactors: [],
      liverRisk: '低危', kidneyRisk: '低危', dvtRisk: '低危', dvtScore: 0,
      nutritionRisk: '低危', nutritionScore: 1, overallRisk: '低危',
      riskMitigation: ['术后常规观察', '继续抑酸治疗']
    },
    status: '已完成',
    functionalStatus: '正常活动',
    comorbidities: ['胃溃疡病史'],
    labAbnormalities: [],
    assessments: [
      { time: '2026-04-28 08:00', type: 'ASA分级', result: 'ASA II', doctor: '王海涛' },
      { time: '2026-04-28 08:15', type: 'METs评估', result: 'METs 5', doctor: '王海涛' },
      { time: '2026-04-28 08:30', type: '出血风险', result: '低危', doctor: '王海涛' },
      { time: '2026-04-28 08:45', type: '麻醉评估', result: '低危', doctor: '麻醉科李医生' },
      { time: '2026-04-28 09:00', type: '综合结论', result: '可手术', doctor: '张建国' },
    ],
    conclusion: '术前评估通过，已顺利完成胃镜复查，提示胃溃疡愈合中。',
    precautions: ['术后常规观察', '继续抑酸治疗'],
    assessedBy: '王海涛', assessedDate: '2026-04-28'
  },
  {
    id: 'POA022', patientId: 'P002', patientName: '李秀芳', gender: '女', age: 45,
    surgeryType: '超声内镜', surgeryDate: '2026-04-29', doctorName: '李秀英',
    asaLevel: 'ASA I', metsScore: 8, metsLevel: '高',
    bleedingRisk: '低危', bleedingScore: 0, anesthesiaRisk: '低危',
    anesthesiaMethod: '镇静',
    mallampatiClass: 'I', mallampatiDesc: '可见全软腭+咽峡+悬雍垂', airwayDifficulty: '正常',
    checklist: {
      identityConfirmed: true, surgerySiteMarked: true, informedConsent: true,
      FastingStatus: true, IVAccess: true, labResultsReviewed: true,
      imagingReviewed: true, anesthesiaAssessment: true, allergiesConfirmed: true,
      medicationsReconciled: true, bloodProductsPrepared: false, equipmentChecked: true,
      emergencyEquipment: true, assistantConfirmed: true
    },
    anesthesiaVisit: {
      visited: true, visitTime: '2026-04-29 11:30', anesthesiologist: '李医生',
      visitNotes: 'ASA I级，身体健康，镇静下行超声内镜',
      vitalSigns: { bp: '116/72mmHg', hr: 68, rr: 16, temp: 36.3, spo2: 99 },
      cardiacExam: '心音正常', pulmonaryExam: '双肺呼吸音清',
      airwayExam: 'Mallampati I，气道正常',
      merckelScore: 1
    },
    riskAssessment: {
      cardiacRisk: '低危', cardiacRiskFactors: [],
      pulmonaryRisk: '低危', pulmonaryRiskFactors: [],
      liverRisk: '低危', kidneyRisk: '低危', dvtRisk: '低危', dvtScore: 0,
      nutritionRisk: '低危', nutritionScore: 0, overallRisk: '低危',
      riskMitigation: ['术后常规观察']
    },
    status: '已完成',
    functionalStatus: '正常体力活动',
    comorbidities: [],
    labAbnormalities: [],
    assessments: [
      { time: '2026-04-29 11:00', type: 'ASA分级', result: 'ASA I', doctor: '王海涛' },
      { time: '2026-04-29 11:10', type: 'METs评估', result: 'METs 8', doctor: '王海涛' },
      { time: '2026-04-29 11:20', type: '出血风险', result: '低危', doctor: '王海涛' },
      { time: '2026-04-29 11:30', type: '麻醉评估', result: '低危', doctor: '麻醉科李医生' },
      { time: '2026-04-29 11:45', type: '综合结论', result: '可手术', doctor: '李秀英' },
    ],
    conclusion: '术前评估通过，已顺利完成超声内镜检查，提示胃黏膜下肿物。',
    precautions: ['术后常规观察'],
    assessedBy: '王海涛', assessedDate: '2026-04-29'
  },
  {
    id: 'POA023', patientId: 'P003', patientName: '张德明', gender: '男', age: 62,
    surgeryType: 'EMR', surgeryDate: '2026-04-30', doctorName: '张建国',
    asaLevel: 'ASA III', metsScore: 4, metsLevel: '中',
    bleedingRisk: '中危', bleedingScore: 4, anesthesiaRisk: '中危',
    anesthesiaMethod: '全麻',
    mallampatiClass: 'III', mallampatiDesc: '仅见软腭上缘', airwayDifficulty: '中度困难',
    checklist: {
      identityConfirmed: true, surgerySiteMarked: false, informedConsent: true,
      FastingStatus: true, IVAccess: false, labResultsReviewed: true,
      imagingReviewed: true, anesthesiaAssessment: false, allergiesConfirmed: true,
      medicationsReconciled: false, bloodProductsPrepared: false, equipmentChecked: false,
      emergencyEquipment: false, assistantConfirmed: false
    },
    anesthesiaVisit: {
      visited: false, visitTime: '', anesthesiologist: '',
      visitNotes: '待完善麻醉访视',
      vitalSigns: { bp: '', hr: 0, rr: 0, temp: 0, spo2: 0 },
      cardiacExam: '', pulmonaryExam: '', airwayExam: '',
      merckelScore: 0
    },
    riskAssessment: {
      cardiacRisk: '中危', cardiacRiskFactors: ['冠心病', '糖尿病', '心电图T波改变'],
      pulmonaryRisk: '低危', pulmonaryRiskFactors: [],
      liverRisk: '低危', kidneyRisk: '低危', dvtRisk: '中危', dvtScore: 2,
      nutritionRisk: '中危', nutritionScore: 2, overallRisk: '中危',
      riskMitigation: ['完善术前准备', '控制血糖', '心内科评估']
    },
    status: '待评估',
    functionalStatus: '活动轻度受限',
    comorbidities: ['冠心病', '糖尿病'],
    labAbnormalities: ['空腹血糖 9.2mmol/L偏高', '心电图T波改变'],
    assessments: [
      { time: '2026-04-29 15:00', type: 'ASA分级', result: 'ASA III', doctor: '李秀英' },
      { time: '2026-04-29 15:15', type: 'METs评估', result: 'METs 4', doctor: '李秀英' },
    ],
    conclusion: '待完善出血风险及麻醉评估',
    precautions: [],
    assessedBy: '李秀英', assessedDate: '2026-04-29'
  },
  {
    id: 'POA024', patientId: 'P004', patientName: '周丽娟', gender: '女', age: 38,
    surgeryType: '胶囊内镜', surgeryDate: '2026-05-01', doctorName: '李秀英',
    asaLevel: 'ASA I', metsScore: 10, metsLevel: '高',
    bleedingRisk: '低危', bleedingScore: 0, anesthesiaRisk: '低危',
    anesthesiaMethod: '无需麻醉',
    mallampatiClass: 'I', mallampatiDesc: '可见全软腭+咽峡+悬雍垂', airwayDifficulty: '正常',
    checklist: {
      identityConfirmed: false, surgerySiteMarked: false, informedConsent: false,
      FastingStatus: false, IVAccess: false, labResultsReviewed: false,
      imagingReviewed: false, anesthesiaAssessment: false, allergiesConfirmed: false,
      medicationsReconciled: false, bloodProductsPrepared: false, equipmentChecked: false,
      emergencyEquipment: false, assistantConfirmed: false
    },
    anesthesiaVisit: {
      visited: false, visitTime: '', anesthesiologist: '',
      visitNotes: '无需麻醉，待完善核对清单',
      vitalSigns: { bp: '', hr: 0, rr: 0, temp: 0, spo2: 0 },
      cardiacExam: '', pulmonaryExam: '', airwayExam: '',
      merckelScore: 0
    },
    riskAssessment: {
      cardiacRisk: '低危', cardiacRiskFactors: [],
      pulmonaryRisk: '低危', pulmonaryRiskFactors: [],
      liverRisk: '低危', kidneyRisk: '低危', dvtRisk: '低危', dvtScore: 0,
      nutritionRisk: '低危', nutritionScore: 0, overallRisk: '低危',
      riskMitigation: ['完善术前准备']
    },
    status: '待评估',
    functionalStatus: '正常体力活动',
    comorbidities: [],
    labAbnormalities: [],
    assessments: [
      { time: '2026-04-29 16:30', type: 'ASA分级', result: 'ASA I', doctor: '待定' },
    ],
    conclusion: '待完善评估',
    precautions: [],
    assessedBy: '', assessedDate: ''
  },
  {
    id: 'POA025', patientId: 'P005', patientName: '陈伟强', gender: '男', age: 55,
    surgeryType: 'ERCP', surgeryDate: '2026-05-03', doctorName: '张建国',
    asaLevel: 'ASA II', metsScore: 6, metsLevel: '中',
    bleedingRisk: '低危', bleedingScore: 2, anesthesiaRisk: '低危',
    anesthesiaMethod: '全麻',
    mallampatiClass: 'II', mallampatiDesc: '可见软腭+咽峡', airwayDifficulty: '正常',
    checklist: {
      identityConfirmed: true, surgerySiteMarked: true, informedConsent: true,
      FastingStatus: true, IVAccess: true, labResultsReviewed: true,
      imagingReviewed: true, anesthesiaAssessment: true, allergiesConfirmed: true,
      medicationsReconciled: true, bloodProductsPrepared: false, equipmentChecked: true,
      emergencyEquipment: true, assistantConfirmed: true
    },
    anesthesiaVisit: {
      visited: true, visitTime: '2026-04-29 14:45', anesthesiologist: '李医生',
      visitNotes: 'ASA II级，肝功能异常暂缓ERCP，保肝治疗后重新评估',
      vitalSigns: { bp: '120/78mmHg', hr: 72, rr: 16, temp: 36.4, spo2: 98 },
      cardiacExam: '心音正常', pulmonaryExam: '双肺呼吸音清',
      airwayExam: 'Mallampati II，气道正常',
      merckelScore: 2
    },
    riskAssessment: {
      cardiacRisk: '低危', cardiacRiskFactors: [],
      pulmonaryRisk: '低危', pulmonaryRiskFactors: [],
      liverRisk: '中危', kidneyRisk: '低危', dvtRisk: '低危', dvtScore: 1,
      nutritionRisk: '低危', nutritionScore: 1, overallRisk: '低危',
      riskMitigation: ['暂缓手术', '保肝治疗', '复查肝功能']
    },
    status: '已评估-暂缓',
    functionalStatus: '正常活动',
    comorbidities: ['脂肪肝'],
    labAbnormalities: ['肝功能轻度异常', '凝血功能正常'],
    assessments: [
      { time: '2026-04-29 14:00', type: 'ASA分级', result: 'ASA II', doctor: '王海涛' },
      { time: '2026-04-29 14:15', type: 'METs评估', result: 'METs 6', doctor: '王海涛' },
      { time: '2026-04-29 14:30', type: '出血风险', result: '低危', doctor: '王海涛' },
      { time: '2026-04-29 14:45', type: '麻醉评估', result: '低危', doctor: '麻醉科李医生' },
      { time: '2026-04-29 15:00', type: '综合结论', result: '暂缓-肝功能异常', doctor: '张建国' },
    ],
    conclusion: '患者ASA II级，凝血功能正常但肝功能轻度异常，建议暂缓ERCP，先行保肝治疗，1周后复查肝功能再评估。',
    precautions: ['暂缓手术', '保肝治疗', '复查肝功能', '待肝功能好转后重新评估'],
    assessedBy: '王海涛', assessedDate: '2026-04-29'
  },
];

// ==================== 样式定义 ====================
const styles: Record<string, React.CSSProperties> = {
  root: { padding: 24, background: '#f0f4f8', minHeight: '100vh' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 20, fontWeight: 700, color: '#1a3a5c', display: 'flex', alignItems: 'center', gap: 8 },
  statRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 },
  statCard: { background: '#fff', borderRadius: 10, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  statLabel: { fontSize: 12, color: '#64748b', marginBottom: 4 },
  statValue: { fontSize: 24, fontWeight: 700, color: '#1a3a5c' },
  statSub: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  tabBar: { display: 'flex', gap: 4, background: '#fff', padding: 4, borderRadius: 8, marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  tab: { padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#64748b', border: 'none', background: 'none', transition: 'all 0.15s' },
  tabActive: { background: '#1a3a5c', color: '#fff' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 },
  patientCard: { background: '#fff', borderRadius: 10, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', cursor: 'pointer', transition: 'all 0.15s', borderLeft: '4px solid' },
  patientHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  patientName: { fontSize: 15, fontWeight: 700, color: '#1a3a5c' },
  patientInfo: { fontSize: 12, color: '#64748b', marginTop: 2 },
  badge: { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600 },
  badgeReady: { background: '#dcfce7', color: '#16a34a' },
  badgeDelayed: { background: '#fef3c7', color: '#d97706' },
  badgeProhibited: { background: '#fee2e2', color: '#dc2626' },
  badgePending: { background: '#f1f5f9', color: '#64748b' },
  badgeCompleted: { background: '#e0e7ff', color: '#4338ca' },
  asaCard: { background: '#fff', borderRadius: 10, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', textAlign: 'center' },
  asaLevel: { fontSize: 28, fontWeight: 800, marginBottom: 4 },
  asaLabel: { fontSize: 12, color: '#64748b' },
  asaDesc: { fontSize: 11, color: '#94a3b8', marginTop: 4 },
  riskSection: { background: '#fff', borderRadius: 10, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: 16 },
  sectionTitle: { fontSize: 14, fontWeight: 700, color: '#1a3a5c', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 },
  riskGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 },
  riskCard: { borderRadius: 10, padding: 16, textAlign: 'center' },
  riskTitle: { fontSize: 12, fontWeight: 600, marginBottom: 8 },
  riskValue: { fontSize: 24, fontWeight: 700 },
  riskBar: { height: 6, borderRadius: 3, marginTop: 8 },
  timeline: { position: 'relative', paddingLeft: 24 },
  timelineItem: { position: 'relative', paddingBottom: 20, paddingLeft: 24, borderLeft: '2px solid #e2e8f0' },
  timelineDot: { position: 'absolute', left: -7, top: 4, width: 12, height: 12, borderRadius: '50%', background: '#1a3a5c', border: '2px solid #fff' },
  timelineTime: { fontSize: 11, color: '#94a3b8' },
  timelineType: { fontSize: 13, fontWeight: 600, color: '#1a3a5c' },
  timelineResult: { fontSize: 12, color: '#64748b' },
  timelineDoctor: { fontSize: 11, color: '#94a3b8' },
  conclusionBox: { background: '#fff', borderRadius: 10, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  conclusionText: { fontSize: 13, color: '#334155', lineHeight: 1.7 },
  precautionList: { display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  precautionChip: { background: '#fef3c7', color: '#92400e', padding: '4px 10px', borderRadius: 12, fontSize: 12, fontWeight: 500 },
  alertBox: { borderRadius: 10, padding: 16, display: 'flex', alignItems: 'flex-start', gap: 12 },
  alertProhibited: { background: '#fee2e2', border: '1px solid #fca5a5' },
  alertDelayed: { background: '#fef3c7', border: '1px solid #fcd34d' },
  alertIcon: { flexShrink: 0 },
  alertTitle: { fontSize: 14, fontWeight: 700, marginBottom: 4 },
  alertText: { fontSize: 13, lineHeight: 1.6 },
  detailGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  detailSection: { background: '#fff', borderRadius: 10, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  detailLabel: { fontSize: 12, color: '#64748b', marginBottom: 4 },
  detailValue: { fontSize: 14, fontWeight: 600, color: '#1a3a5c' },
  tagList: { display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  tag: { background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: 4, fontSize: 11 },
  tagAbnormal: { background: '#fee2e2', color: '#dc2626' },
  noData: { textAlign: 'center', padding: '40px 0', color: '#94a3b8', fontSize: 13 },
  svgChart: { width: '100%', height: 200 },
  // 新增样式
  mallampatiCard: { background: '#fff', borderRadius: 10, padding: 16, textAlign: 'center', flex: 1 },
  mallampatiClass: { fontSize: 36, fontWeight: 800, marginBottom: 4 },
  checklistSection: { background: '#fff', borderRadius: 10, padding: 20, marginBottom: 16 },
  checklistItem: { display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid #f1f5f9' },
  checklistIcon: { width: 20, height: 20, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  checklistLabel: { fontSize: 13, color: '#475569', flex: 1 },
  vitalGrid: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 },
  vitalItem: { textAlign: 'center', padding: 12, background: '#f8fafc', borderRadius: 8 },
  vitalLabel: { fontSize: 11, color: '#64748b', marginBottom: 4 },
  vitalValue: { fontSize: 16, fontWeight: 700, color: '#1a3a5c' },
  riskMatrix: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 },
  riskMatrixItem: { padding: 12, borderRadius: 8, textAlign: 'center' },
  riskMatrixLabel: { fontSize: 11, color: '#64748b', marginBottom: 4 },
  riskMatrixValue: { fontSize: 18, fontWeight: 700 },
  riskMatrixFactors: { fontSize: 10, color: '#94a3b8', marginTop: 4 },
  examRow: { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: '1px solid #f1f5f9' },
  examIcon: { color: '#64748b' },
  examLabel: { fontSize: 12, color: '#64748b', width: 80 },
  examValue: { fontSize: 13, color: '#1a3a5c', flex: 1 },
  mitigationList: { display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  mitigationChip: { background: '#dbeafe', color: '#1e40af', padding: '4px 10px', borderRadius: 12, fontSize: 12, fontWeight: 500 },
  tabBadge: { background: '#fee2e2', color: '#dc2626', padding: '2px 6px', borderRadius: 10, fontSize: 10, fontWeight: 600, marginLeft: 8 },
  airwayBadge: { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600 },
  overallRiskCard: { borderRadius: 10, padding: 20, textAlign: 'center', marginTop: 16 },
};

// Mallampati颜色
const mallampatiColors: Record<string, string> = {
  'I': '#16a34a', 'II': '#3b82f6', 'III': '#f59e0b', 'IV': '#ef4444'
};

// 气道困难颜色
const airwayColors: Record<string, string> = {
  '正常': '#16a34a', '轻度困难': '#3b82f6', '中度困难': '#f59e0b', '困难': '#ef4444'
};

// ASA颜色
const asaColors: Record<string, string> = {
  'ASA I': '#16a34a', 'ASA II': '#3b82f6', 'ASA III': '#f59e0b',
  'ASA IV': '#ef4444', 'ASA V': '#7c3aed', 'ASA VI': '#1a3a5c'
};

// 风险等级颜色
const riskColors: Record<string, string> = {
  '低危': '#16a34a', '中危': '#f59e0b', '高危': '#ef4444', '极高危': '#7c3aed'
};

// ==================== 组件 ====================
export default function PreOpPage() {
  const [activeTab, setActiveTab] = useState<string>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const todayAssessments = preOpAssessments.filter(a => a.surgeryDate === '2026-04-30');
  const completedCount = preOpAssessments.filter(a => a.status === '已完成').length;
  const readyCount = preOpAssessments.filter(a => a.status === '已评估-可手术').length;
  const delayedCount = preOpAssessments.filter(a => a.status === '已评估-暂缓').length;
  const prohibitedCount = preOpAssessments.filter(a => a.status === '已评估-禁止').length;
  const pendingCount = preOpAssessments.filter(a => a.status === '待评估').length;

  const selected = preOpAssessments.find(a => a.id === selectedId);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case '已评估-可手术': return styles.badgeReady;
      case '已评估-暂缓': return styles.badgeDelayed;
      case '已评估-禁止': return styles.badgeProhibited;
      case '已完成': return styles.badgeCompleted;
      default: return styles.badgePending;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case '已评估-可手术': return <CheckCircle size={12} />;
      case '已评估-暂缓': return <PauseCircle size={12} />;
      case '已评估-禁止': return <Ban size={12} />;
      case '已完成': return <CheckCircle size={12} />;
      default: return <Clock size={12} />;
    }
  };

  const renderTab = (key: string, label: string) => (
    <button
      key={key}
      style={{ ...styles.tab, ...(activeTab === key ? styles.tabActive : {}) }}
      onClick={() => setActiveTab(key)}
    >
      {label}
    </button>
  );

  const renderStatCard = (label: string, value: number, sub?: string, color?: string) => (
    <div style={styles.statCard}>
      <div style={styles.statLabel}>{label}</div>
      <div style={{ ...styles.statValue, color: color || '#1a3a5c' }}>{value}</div>
      {sub && <div style={styles.statSub}>{sub}</div>}
    </div>
  );

  // 风险汇总SVG
  const renderRiskSummarySVG = () => {
    const lowRisk = preOpAssessments.filter(a => a.bleedingRisk === '低危').length;
    const mediumRisk = preOpAssessments.filter(a => a.bleedingRisk === '中危').length;
    const highRisk = preOpAssessments.filter(a => a.bleedingRisk === '高危').length;
    const total = preOpAssessments.length || 1;

    return (
      <svg viewBox="0 0 400 180" style={styles.svgChart}>
        {/* 背景 */}
        <rect x="0" y="0" width="400" height="180" fill="#f8fafc" rx="8" />
        
        {/* 标题 */}
        <text x="200" y="20" textAnchor="middle" fontSize="13" fontWeight="700" fill="#1a3a5c">出血风险分布</text>
        
        {/* 饼图 */}
        <g transform="translate(100, 95)">
          {/* 低危 */}
          <path d={`M 0 -50 A 50 50 0 0 1 ${50 * Math.sin(2 * Math.PI * lowRisk / total)} ${-50 * Math.cos(2 * Math.PI * lowRisk / total)} L 0 0 Z`} fill="#16a34a" />
          {/* 中危 */}
          <path d={`M ${50 * Math.sin(2 * Math.PI * lowRisk / total)} ${-50 * Math.cos(2 * Math.PI * lowRisk / total)} A 50 50 0 0 1 ${50 * Math.sin(2 * Math.PI * (lowRisk + mediumRisk) / total)} ${-50 * Math.cos(2 * Math.PI * (lowRisk + mediumRisk) / total)} L 0 0 Z`} fill="#f59e0b" />
          {/* 高危 */}
          <path d={`M ${50 * Math.sin(2 * Math.PI * (lowRisk + mediumRisk) / total)} ${-50 * Math.cos(2 * Math.PI * (lowRisk + mediumRisk) / total)} A 50 50 0 0 1 0 -50 L 0 0 Z`} fill="#ef4444" />
          
          {/* 中心文字 */}
          <text x="0" y="5" textAnchor="middle" fontSize="14" fontWeight="700" fill="#1a3a5c">{total}</text>
          <text x="0" y="18" textAnchor="middle" fontSize="9" fill="#64748b">总评估</text>
        </g>
        
        {/* 图例 */}
        <g transform="translate(220, 45)">
          <rect x="0" y="0" width="14" height="14" rx="3" fill="#16a34a" />
          <text x="20" y="11" fontSize="11" fill="#475569">低危</text>
          <text x="20" y="24" fontSize="10" fill="#94a3b8">{lowRisk}人 ({Math.round(lowRisk/total*100)}%)</text>
          
          <rect x="0" y="40" width="14" height="14" rx="3" fill="#f59e0b" />
          <text x="20" y="51" fontSize="11" fill="#475569">中危</text>
          <text x="20" y="64" fontSize="10" fill="#94a3b8">{mediumRisk}人 ({Math.round(mediumRisk/total*100)}%)</text>
          
          <rect x="0" y="80" width="14" height="14" rx="3" fill="#ef4444" />
          <text x="20" y="91" fontSize="11" fill="#475569">高危</text>
          <text x="20" y="104" fontSize="10" fill="#94a3b8">{highRisk}人 ({Math.round(highRisk/total*100)}%)</text>
        </g>
        
        {/* METs分布条 */}
        <g transform="translate(20, 155)">
          <text x="0" y="0" fontSize="9" fill="#64748b">METs评分分布</text>
          {[1,2,3,4,5,6,7,8,9,10].map(met => {
            const count = preOpAssessments.filter(a => a.metsScore === met).length;
            const width = (count / total) * 150;
            return (
              <g key={met} transform={`translate(${met * 15}, 5)`}>
                <rect x="0" y="0" width={Math.max(width, 2)} height="10" rx="2" fill={met <= 3 ? '#ef4444' : met <= 6 ? '#f59e0b' : '#16a34a'} />
                <text x={Math.max(width/2, 1)} y="7" fontSize="7" fill="#fff" textAnchor="middle">{count > 0 ? count : ''}</text>
              </g>
            );
          })}
        </g>
      </svg>
    );
  };

  return (
    <div style={styles.root}>
      {/* 标题 */}
      <div style={styles.header}>
        <div style={styles.title}>
          <ClipboardCheck size={22} color="#4ade80" />
          术前评估
        </div>
      </div>

      {/* 标签页 */}
      <div style={styles.tabBar}>
        {renderTab('list', '评估列表')}
        {renderTab('summary', '风险汇总')}
      </div>

      {/* ========== 评估列表 ========== */}
      {activeTab === 'list' && !selectedId && (
        <>
          {/* 统计卡片 */}
          <div style={styles.statRow}>
            {renderStatCard('今日手术', todayAssessments.length)}
            {renderStatCard('已完成', completedCount, '', '#4338ca')}
            {renderStatCard('可手术', readyCount, '待执行', '#16a34a')}
            {renderStatCard('暂缓/禁止', delayedCount + prohibitedCount, '需关注', '#dc2626')}
          </div>

          {/* 患者状态分类 */}
          <div style={{ marginBottom: 16 }}>
            <div style={styles.sectionTitle}>
              <Activity size={16} />
              患者状态概览
            </div>
            <div style={styles.grid}>
              {/* 待评估 */}
              <div style={{ ...styles.patientCard, borderLeftColor: '#94a3b8' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#64748b' }}>待评估 ({pendingCount})</span>
                  <Clock size={16} color="#94a3b8" />
                </div>
                {preOpAssessments.filter(a => a.status === '待评估').slice(0, 3).map(a => (
                  <div key={a.id} style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1a3a5c' }}>{a.patientName}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>{a.surgeryType}</div>
                  </div>
                ))}
              </div>

              {/* 可手术 */}
              <div style={{ ...styles.patientCard, borderLeftColor: '#16a34a' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#16a34a' }}>可手术 ({readyCount})</span>
                  <CheckCircle size={16} color="#16a34a" />
                </div>
                {preOpAssessments.filter(a => a.status === '已评估-可手术').slice(0, 3).map(a => (
                  <div key={a.id} style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1a3a5c' }}>{a.patientName}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>{a.surgeryType}</div>
                  </div>
                ))}
              </div>

              {/* 暂缓 */}
              <div style={{ ...styles.patientCard, borderLeftColor: '#d97706' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#d97706' }}>暂缓 ({delayedCount})</span>
                  <PauseCircle size={16} color="#d97706" />
                </div>
                {preOpAssessments.filter(a => a.status === '已评估-暂缓').slice(0, 3).map(a => (
                  <div key={a.id} style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1a3a5c' }}>{a.patientName}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>{a.surgeryType}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 禁止警示 */}
          {prohibitedCount > 0 && (
            <div style={{ ...styles.alertBox, ...styles.alertProhibited, marginBottom: 16 }}>
              <Ban size={20} color="#dc2626" style={styles.alertIcon} />
              <div>
                <div style={{ ...styles.alertTitle, color: '#dc2626' }}>手术禁止警示</div>
                {preOpAssessments.filter(a => a.status === '已评估-禁止').map(a => (
                  <div key={a.id} style={styles.alertText}>
                    <strong>{a.patientName}</strong>（{a.surgeryType}）：{a.conclusion.substring(0, 50)}...
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 全部列表 */}
          <div style={styles.sectionTitle}>
            <FileText size={16} />
            全部评估 ({preOpAssessments.length})
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {preOpAssessments.map(item => (
              <div
                key={item.id}
                style={{ ...styles.patientCard, borderLeftColor: item.status === '已评估-可手术' ? '#16a34a' : item.status === '已评估-暂缓' ? '#d97706' : item.status === '已评估-禁止' ? '#dc2626' : item.status === '已完成' ? '#4338ca' : '#94a3b8' }}
                onClick={() => setSelectedId(item.id)}
              >
                <div style={styles.patientHeader}>
                  <div>
                    <div style={styles.patientName}>{item.patientName}</div>
                    <div style={styles.patientInfo}>{item.patientId} · {item.gender} · {item.age}岁</div>
                  </div>
                  <span style={{ ...styles.badge, ...getStatusStyle(item.status) }}>
                    {getStatusIcon(item.status)}
                    {item.status}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>
                  <FileText size={12} style={{ marginRight: 4 }} />
                  {item.surgeryType} · {item.surgeryDate}
                </div>
                <div style={{ display: 'flex', gap: 16, fontSize: 11, color: '#64748b' }}>
                  <span>
                    <span style={{ fontWeight: 600 }}>ASA</span> {item.asaLevel}
                  </span>
                  <span>
                    <span style={{ fontWeight: 600 }}>METs</span> {item.metsScore}
                  </span>
                  <span>
                    <span style={{ fontWeight: 600 }}>出血</span> {item.bleedingRisk}
                  </span>
                  <span>
                    <span style={{ fontWeight: 600 }}>麻醉</span> {item.anesthesiaRisk}
                  </span>
                </div>
                {item.labAbnormalities.length > 0 && (
                  <div style={{ marginTop: 8, fontSize: 11, color: '#dc2626' }}>
                    <AlertTriangle size={10} style={{ marginRight: 4 }} />
                    {item.labAbnormalities.slice(0, 2).join(', ')}
                    {item.labAbnormalities.length > 2 && ` 等${item.labAbnormalities.length}项异常`}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

          {/* ========== 详情页 ========== */}
      {activeTab === 'list' && selectedId && selected && (
        <div>
          <button
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: '#64748b', fontSize: 13, marginBottom: 16 }}
            onClick={() => setSelectedId(null)}
          >
            <ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} /> 返回列表
          </button>

          {/* 患者头部信息 */}
          <div style={{ background: '#fff', borderRadius: 10, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#1a3a5c' }}>{selected.patientName}</div>
                <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                  {selected.patientId} · {selected.gender} · {selected.age}岁 · 手术日期：{selected.surgeryDate}
                </div>
              </div>
              <span style={{ ...styles.badge, ...getStatusStyle(selected.status), fontSize: 13, padding: '6px 12px' }}>
                {getStatusIcon(selected.status)}
                {selected.status}
              </span>
            </div>
          </div>

          {/* ASA分级卡片 */}
          <div style={{ marginBottom: 16 }}>
            <div style={styles.sectionTitle}>
              <Shield size={16} />
              ASA分级
            </div>
            <div style={styles.riskGrid}>
              {(['ASA I', 'ASA II', 'ASA III', 'ASA IV', 'ASA V', 'ASA VI'] as const).map(level => {
                const isActive = selected.asaLevel === level;
                return (
                  <div
                    key={level}
                    style={{
                      ...styles.asaCard,
                      background: isActive ? asaColors[level] : '#f8fafc',
                      color: isActive ? '#fff' : '#94a3b8',
                      transform: isActive ? 'scale(1.05)' : 'scale(1)',
                      boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'
                    }}
                  >
                    <div style={{ ...styles.asaLevel, color: isActive ? '#fff' : asaColors[level] }}>{level}</div>
                    <div style={styles.asaDesc}>
                      {level === 'ASA I' && '健康，无系统性疾病'}
                      {level === 'ASA II' && '轻度系统性疾病'}
                      {level === 'ASA III' && '中度系统性疾病'}
                      {level === 'ASA IV' && '重度系统性疾病'}
                      {level === 'ASA V' && '濒死状态'}
                      {level === 'ASA VI' && '脑死亡'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ========== Mallampati气道分级 (新增) ========== */}
          <div style={{ marginBottom: 16 }}>
            <div style={styles.sectionTitle}>
              <Wind size={16} />
              Mallampati气道分级
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              {(['I', 'II', 'III', 'IV'] as const).map(cls => {
                const isActive = selected.mallampatiClass === cls;
                return (
                  <div
                    key={cls}
                    style={{
                      ...styles.mallampatiCard,
                      background: isActive ? mallampatiColors[cls] : '#f8fafc',
                      color: isActive ? '#fff' : '#94a3b8',
                      transform: isActive ? 'scale(1.05)' : 'scale(1)',
                      boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'
                    }}
                  >
                    <div style={{ ...styles.mallampatiClass, color: isActive ? '#fff' : mallampatiColors[cls] }}>{cls}</div>
                    <div style={{ fontSize: 11 }}>
                      {cls === 'I' && '可见全软腭+咽峡+悬雍垂'}
                      {cls === 'II' && '可见软腭+咽峡'}
                      {cls === 'III' && '仅见软腭上缘'}
                      {cls === 'IV' && '硬腭不可见'}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 12, display: 'flex', gap: 16, alignItems: 'center' }}>
              <div style={{ ...styles.airwayBadge, background: airwayColors[selected.airwayDifficulty] + '20', color: airwayColors[selected.airwayDifficulty] }}>
                <Eye size={14} />
                气道评估：{selected.airwayDifficulty}
              </div>
              <div style={{ fontSize: 12, color: '#64748b' }}>Merkel评分：<strong>{selected.anesthesiaVisit.merckelScore}</strong></div>
            </div>
          </div>

          {/* 风险评估 */}
          <div style={styles.riskSection}>
            <div style={styles.sectionTitle}>
              <Heart size={16} />
              风险评估
            </div>
            <div style={styles.riskGrid}>
              {/* METs */}
              <div style={{ ...styles.riskCard, background: selected.metsLevel === '高' ? '#dcfce7' : selected.metsLevel === '中' ? '#fef3c7' : '#fee2e2' }}>
                <div style={styles.riskTitle}>METs评分</div>
                <div style={{ ...styles.riskValue, color: selected.metsLevel === '高' ? '#16a34a' : selected.metsLevel === '中' ? '#d97706' : '#dc2626' }}>{selected.metsScore}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>功能状态：{selected.metsLevel}</div>
                <div style={{ ...styles.riskBar, background: selected.metsLevel === '高' ? '#16a34a' : selected.metsLevel === '中' ? '#d97706' : '#dc2626', width: `${selected.metsScore * 10}%`, marginTop: 8 }} />
              </div>

              {/* 出血风险 */}
              <div style={{ ...styles.riskCard, background: selected.bleedingRisk === '低危' ? '#dcfce7' : selected.bleedingRisk === '中危' ? '#fef3c7' : '#fee2e2' }}>
                <div style={styles.riskTitle}>出血风险</div>
                <div style={{ ...styles.riskValue, color: riskColors[selected.bleedingRisk] }}>{selected.bleedingRisk}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>评分：{selected.bleedingScore}</div>
              </div>

              {/* 麻醉风险 */}
              <div style={{ ...styles.riskCard, background: selected.anesthesiaRisk === '低危' ? '#dcfce7' : selected.anesthesiaRisk === '中危' ? '#fef3c7' : '#fee2e2' }}>
                <div style={styles.riskTitle}>麻醉风险</div>
                <div style={{ ...styles.riskValue, color: riskColors[selected.anesthesiaRisk] }}>{selected.anesthesiaRisk}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>方式：{selected.anesthesiaMethod}</div>
              </div>
            </div>
          </div>

          {/* ========== 核对清单 (新增) ========== */}
          <div style={styles.checklistSection}>
            <div style={styles.sectionTitle}>
              <ListChecks size={16} />
              手术安全核对清单
              {selected.checklist && Object.values(selected.checklist).filter(v => !v).length > 0 && (
                <span style={styles.tabBadge}>
                  {Object.values(selected.checklist).filter(v => !v).length}项未完成
                </span>
              )}
            </div>
            {selected.checklist && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
                {[
                  { key: 'identityConfirmed', label: '患者身份确认', icon: User },
                  { key: 'surgerySiteMarked', label: '手术部位标记', icon: FileText },
                  { key: 'informedConsent', label: '知情同意', icon: ClipboardList },
                  { key: 'FastingStatus', label: '禁食状态', icon: Ban },
                  { key: 'IVAccess', label: '静脉通路', icon: Droplet },
                  { key: 'labResultsReviewed', label: '检验结果审核', icon: Activity },
                  { key: 'imagingReviewed', label: '影像审核', icon: Eye },
                  { key: 'anesthesiaAssessment', label: '麻醉评估', icon: Stethoscope },
                  { key: 'allergiesConfirmed', label: '过敏史确认', icon: AlertTriangle },
                  { key: 'medicationsReconciled', label: '用药核对', icon: Shield },
                  { key: 'bloodProductsPrepared', label: '备血', icon: Droplets },
                  { key: 'equipmentChecked', label: '设备检查', icon: CheckCircle },
                  { key: 'emergencyEquipment', label: '急救设备', icon: Bell },
                  { key: 'assistantConfirmed', label: '助手确认', icon: UserCheck },
                ].map(item => (
                  <div key={item.key} style={styles.checklistItem}>
                    <div style={{
                      ...styles.checklistIcon,
                      background: selected.checklist[item.key as keyof typeof selected.checklist] ? '#dcfce7' : '#fee2e2'
                    }}>
                      {selected.checklist[item.key as keyof typeof selected.checklist] ? (
                        <CheckCircle size={14} color="#16a34a" />
                      ) : (
                        <XCircle size={14} color="#dc2626" />
                      )}
                    </div>
                    <span style={{
                      ...styles.checklistLabel,
                      color: selected.checklist[item.key as keyof typeof selected.checklist] ? '#475569' : '#dc2626'
                    }}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ========== 麻醉访视 (新增) ========== */}
          <div style={{ ...styles.riskSection, marginTop: 16 }}>
            <div style={styles.sectionTitle}>
              <Stethoscope size={16} />
              麻醉访视
              {!selected.anesthesiaVisit.visited && (
                <span style={styles.tabBadge}>未访视</span>
              )}
            </div>
            {selected.anesthesiaVisit.visited ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ fontSize: 13, color: '#64748b' }}>
                    访视时间：<strong style={{ color: '#1a3a5c' }}>{selected.anesthesiaVisit.visitTime}</strong>
                  </div>
                  <div style={{ fontSize: 13, color: '#64748b' }}>
                    麻醉医师：<strong style={{ color: '#1a3a5c' }}>{selected.anesthesiaVisit.anesthesiologist}</strong>
                  </div>
                </div>

                {/* 生命体征 */}
                <div style={styles.vitalGrid}>
                  <div style={styles.vitalItem}>
                    <div style={styles.vitalLabel}>血压</div>
                    <div style={styles.vitalValue}>{selected.anesthesiaVisit.vitalSigns.bp}</div>
                  </div>
                  <div style={styles.vitalItem}>
                    <div style={styles.vitalLabel}>心率</div>
                    <div style={styles.vitalValue}>{selected.anesthesiaVisit.vitalSigns.hr} bpm</div>
                  </div>
                  <div style={styles.vitalItem}>
                    <div style={styles.vitalLabel}>呼吸</div>
                    <div style={styles.vitalValue}>{selected.anesthesiaVisit.vitalSigns.rr} /min</div>
                  </div>
                  <div style={styles.vitalItem}>
                    <div style={styles.vitalLabel}>体温</div>
                    <div style={styles.vitalValue}>{selected.anesthesiaVisit.vitalSigns.temp}°C</div>
                  </div>
                  <div style={styles.vitalItem}>
                    <div style={styles.vitalLabel}>SpO₂</div>
                    <div style={styles.vitalValue}>{selected.anesthesiaVisit.vitalSigns.spo2}%</div>
                  </div>
                </div>

                {/* 体格检查 */}
                <div style={{ marginTop: 16 }}>
                  <div style={styles.examRow}>
                    <Heart size={14} style={styles.examIcon} />
                    <span style={styles.examLabel}>心脏</span>
                    <span style={styles.examValue}>{selected.anesthesiaVisit.cardiacExam}</span>
                  </div>
                  <div style={styles.examRow}>
                    <Wind size={14} style={styles.examIcon} />
                    <span style={styles.examLabel}>肺脏</span>
                    <span style={styles.examValue}>{selected.anesthesiaVisit.pulmonaryExam}</span>
                  </div>
                  <div style={styles.examRow}>
                    <Wind size={14} style={styles.examIcon} />
                    <span style={styles.examLabel}>气道</span>
                    <span style={styles.examValue}>{selected.anesthesiaVisit.airwayExam}</span>
                  </div>
                </div>

                {/* 访视备注 */}
                <div style={{ marginTop: 16, padding: 12, background: '#f8fafc', borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>访视备注</div>
                  <div style={{ fontSize: 13, color: '#1a3a5c' }}>{selected.anesthesiaVisit.visitNotes}</div>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: 24, color: '#94a3b8' }}>
                <AlertCircle size={32} style={{ marginBottom: 8 }} />
                <div>麻醉访视尚未完成</div>
              </div>
            )}
          </div>

          {/* ========== 多系统风险评估 (新增) ========== */}
          <div style={{ ...styles.riskSection, marginTop: 16 }}>
            <div style={styles.sectionTitle}>
              <ShieldAlert size={16} />
              多系统风险评估
            </div>
            <div style={styles.riskMatrix}>
              {[
                { label: '心脏风险', value: selected.riskAssessment.cardiacRisk, factors: selected.riskAssessment.cardiacRiskFactors },
                { label: '肺脏风险', value: selected.riskAssessment.pulmonaryRisk, factors: selected.riskAssessment.pulmonaryRiskFactors },
                { label: '肝脏风险', value: selected.riskAssessment.liverRisk, factors: [] },
                { label: '肾脏风险', value: selected.riskAssessment.kidneyRisk, factors: [] },
                { label: 'DVT风险', value: selected.riskAssessment.dvtRisk, factors: [], score: selected.riskAssessment.dvtScore },
                { label: '营养风险', value: selected.riskAssessment.nutritionRisk, factors: [], score: selected.riskAssessment.nutritionScore },
              ].map(item => (
                <div
                  key={item.label}
                  style={{
                    ...styles.riskMatrixItem,
                    background: riskColors[item.value] + '15',
                    border: `1px solid ${riskColors[item.value]}30`
                  }}
                >
                  <div style={styles.riskMatrixLabel}>{item.label}</div>
                  <div style={{ ...styles.riskMatrixValue, color: riskColors[item.value] }}>{item.value}</div>
                  {(item.score !== undefined) && (
                    <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>评分: {item.score}</div>
                  )}
                  {item.factors.length > 0 && (
                    <div style={styles.riskMatrixFactors}>{item.factors.join(', ')}</div>
                  )}
                </div>
              ))}
            </div>

            {/* 总体风险 */}
            <div style={{
              ...styles.overallRiskCard,
              background: riskColors[selected.riskAssessment.overallRisk] + '15',
              border: `1px solid ${riskColors[selected.riskAssessment.overallRisk]}30`
            }}>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>总体手术风险</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: riskColors[selected.riskAssessment.overallRisk] }}>
                {selected.riskAssessment.overallRisk}
              </div>
            </div>

            {/* 风险缓解措施 */}
            {selected.riskAssessment.riskMitigation.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#1a3a5c', marginBottom: 8 }}>风险缓解措施</div>
                <div style={styles.mitigationList}>
                  {selected.riskAssessment.riskMitigation.map(m => (
                    <span key={m} style={styles.mitigationChip}>
                      <Shield size={10} style={{ marginRight: 4 }} />
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 合并症与检验异常 */}
          <div style={styles.detailGrid}>
            <div style={styles.detailSection}>
              <div style={styles.detailLabel}>合并症</div>
              <div style={styles.tagList}>
                {selected.comorbidities.length > 0 ? selected.comorbidities.map(c => (
                  <span key={c} style={styles.tag}>{c}</span>
                )) : <span style={{ ...styles.tag, color: '#16a34a' }}>无</span>}
              </div>
            </div>
            <div style={styles.detailSection}>
              <div style={styles.detailLabel}>检验异常</div>
              <div style={styles.tagList}>
                {selected.labAbnormalities.length > 0 ? selected.labAbnormalities.map(c => (
                  <span key={c} style={{ ...styles.tag, ...styles.tagAbnormal }}>{c}</span>
                )) : <span style={{ ...styles.tag, color: '#16a34a' }}>无</span>}
              </div>
            </div>
          </div>

          {/* 评估时间轴 */}
          <div style={{ ...styles.riskSection, marginTop: 16 }}>
            <div style={styles.sectionTitle}>
              <Clock size={16} />
              评估时间轴
            </div>
            <div style={styles.timeline}>
              {selected.assessments.map((item, idx) => (
                <div key={idx} style={styles.timelineItem}>
                  <div style={{ ...styles.timelineDot, background: idx === selected.assessments.length - 1 ? '#16a34a' : '#1a3a5c' }} />
                  <div style={styles.timelineTime}>{item.time}</div>
                  <div style={styles.timelineType}>{item.type}</div>
                  <div style={styles.timelineResult}>{item.result}</div>
                  <div style={styles.timelineDoctor}>评估人：{item.doctor}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 评估结论 */}
          <div style={{ ...styles.conclusionBox, marginTop: 16 }}>
            <div style={styles.sectionTitle}>
              <FileText size={16} />
              评估结论
            </div>
            <div style={styles.conclusionText}>{selected.conclusion}</div>
            {selected.precautions.length > 0 && (
              <>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1a3a5c', marginTop: 16, marginBottom: 8 }}>注意事项</div>
                <div style={styles.precautionList}>
                  {selected.precautions.map(p => (
                    <span key={p} style={styles.precautionChip}>
                      {p.startsWith('禁止') || p.startsWith('暂缓') ? <Ban size={10} style={{ marginRight: 4 }} /> : <ChevronRight size={10} style={{ marginRight: 4 }} />}
                      {p}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* 警示框 */}
          {(selected.status === '已评估-禁止' || selected.status === '已评估-暂缓') && (
            <div style={{ ...styles.alertBox, ...(selected.status === '已评估-禁止' ? styles.alertProhibited : styles.alertDelayed), marginTop: 16 }}>
              {selected.status === '已评估-禁止' ? (
                <>
                  <Ban size={24} color="#dc2626" style={styles.alertIcon} />
                  <div>
                    <div style={{ ...styles.alertTitle, color: '#dc2626' }}>手术禁止告知</div>
                    <div style={styles.alertText}>根据术前评估，该患者目前存在麻醉禁忌或严重合并症未得到控制，不宜进行手术。请重新评估或选择替代治疗方案。</div>
                  </div>
                </>
              ) : (
                <>
                  <PauseCircle size={24} color="#d97706" style={styles.alertIcon} />
                  <div>
                    <div style={{ ...styles.alertTitle, color: '#d97706' }}>手术暂缓告知</div>
                    <div style={styles.alertText}>根据术前评估，该患者需要先处理以下问题：改善合并症、纠正异常指标或进行进一步检查。请完成相应处理后重新评估。</div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========== 风险汇总 ========== */}
      {activeTab === 'summary' && (
        <>
          <div style={styles.statRow}>
            {renderStatCard('总评估数', preOpAssessments.length)}
            {renderStatCard('可手术', readyCount, '可进行', '#16a34a')}
            {renderStatCard('暂缓/禁止', delayedCount + prohibitedCount, '需关注', '#dc2626')}
            {renderStatCard('完成手术', completedCount, '', '#4338ca')}
          </div>

          <div style={styles.detailGrid}>
            {/* SVG风险汇总图 */}
            <div style={styles.detailSection}>
              {renderRiskSummarySVG()}
            </div>

            {/* ASA分布 */}
            <div style={styles.detailSection}>
              <div style={styles.sectionTitle}>
                <Shield size={16} />
                ASA分级分布
              </div>
              {(['ASA I', 'ASA II', 'ASA III', 'ASA IV', 'ASA V'] as const).map(level => {
                const count = preOpAssessments.filter(a => a.asaLevel === level).length;
                const pct = preOpAssessments.length > 0 ? Math.round(count / preOpAssessments.length * 100) : 0;
                return (
                  <div key={level} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 60, fontSize: 12, fontWeight: 600, color: '#475569' }}>{level}</div>
                    <div style={{ flex: 1, height: 20, background: '#f1f5f9', borderRadius: 4 }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: asaColors[level], borderRadius: 4 }} />
                    </div>
                    <div style={{ width: 40, fontSize: 12, color: '#64748b', textAlign: 'right' }}>{count}人</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* METs分布 */}
          <div style={{ ...styles.detailSection, marginTop: 16 }}>
            <div style={styles.sectionTitle}>
              <Activity size={16} />
              METs功能评分分布
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120, paddingTop: 20 }}>
              {[1,2,3,4,5,6,7,8,9,10].map(met => {
                const count = preOpAssessments.filter(a => a.metsScore === met).length;
                const maxCount = Math.max(...[1,2,3,4,5,6,7,8,9,10].map(m => preOpAssessments.filter(a => a.metsScore === m).length), 1);
                const height = (count / maxCount) * 100;
                return (
                  <div key={met} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{ fontSize: 10, color: '#94a3b8' }}>{count}</div>
                    <div style={{ width: '100%', height: `${Math.max(height, 4)}%`, background: met <= 3 ? '#ef4444' : met <= 6 ? '#f59e0b' : '#16a34a', borderRadius: '4px 4px 0 0' }} />
                    <div style={{ fontSize: 10, color: '#64748b' }}>{met}</div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 12 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#ef4444' }}>
                <div style={{ width: 10, height: 10, background: '#ef4444', borderRadius: 2 }} /> 低(1-3)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#f59e0b' }}>
                <div style={{ width: 10, height: 10, background: '#f59e0b', borderRadius: 2 }} /> 中(4-6)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#16a34a' }}>
                <div style={{ width: 10, height: 10, background: '#16a34a', borderRadius: 2 }} /> 高(7-10)
              </span>
            </div>
          </div>

          {/* 风险因素统计 */}
          <div style={{ ...styles.detailSection, marginTop: 16 }}>
            <div style={styles.sectionTitle}>
              <AlertTriangle size={16} />
              高风险患者汇总
            </div>
            {preOpAssessments.filter(a => a.asaLevel >= 'ASA IV' || a.bleedingRisk === '高危' || a.anesthesiaRisk === '高危').length === 0 ? (
              <div style={styles.noData}>暂无高风险患者</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                {preOpAssessments.filter(a => a.asaLevel >= 'ASA IV' || a.bleedingRisk === '高危' || a.anesthesiaRisk === '高危').map(a => (
                  <div key={a.id} style={{ padding: 12, background: '#fef2f2', borderRadius: 8, border: '1px solid #fecaca' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: 600, color: '#1a3a5c' }}>{a.patientName}</div>
                      <span style={{ ...styles.badge, ...(a.asaLevel >= 'ASA IV' ? styles.badgeProhibited : styles.badgeDelayed) }}>
                        {a.asaLevel}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                      {a.surgeryType} · {a.surgeryDate}
                    </div>
                    <div style={{ fontSize: 11, marginTop: 4 }}>
                      {a.asaLevel >= 'ASA IV' && <span style={{ color: '#dc2626' }}>ASA {a.asaLevel} </span>}
                      {a.bleedingRisk === '高危' && <span style={{ color: '#dc2626' }}>出血高危 </span>}
                      {a.anesthesiaRisk === '高危' && <span style={{ color: '#dc2626' }}>麻醉高危</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
