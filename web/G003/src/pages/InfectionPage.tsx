// ============================================================
// G004 超声管理系统 - 感染管理页面
// KPI指标 + 5个Tab + 职业暴露管理 + 环境监测 + 40条演示数据
// ============================================================
import { useState } from 'react'
import {
  Activity, AlertTriangle, BarChart3, Bell, Calendar, CheckCircle,
  Clock, Droplets, Edit2, Eye, EyeOff, Filter, Home, MinusCircle,
  MoreHorizontal, Plus, RefreshCw, Save, Search, Shield, ShieldAlert,
  Trash2, TrendingDown, TrendingUp, User, Users, Wind, X, XCircle
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts'

// ---------- 类型定义 ----------
interface InfectionCase {
  id: string
  patientName: string
  patientId: string
  endoscope: string
  procedure: string
  infectionType: string
  severity: '轻症' | '中等' | '重症' | '危重'
  confirmedDate: string
  department: string
  doctor: string
  status: '疑似' | '确诊' | '治愈' | '死亡'
  outcomes: string
  notes: string
}

interface OccupationalExposure {
  id: string
  staffName: string
  staffId: string
  department: string
  exposureType: '针刺伤' | '血液接触' | '体液接触' | '锐器伤' | '黏膜暴露'
  sourcePatient: string
  exposureDate: string
  exposureRoute: string
  severity: '轻度' | '中度' | '重度'
  immediateAction: string
  reporter: string
  reportDate: string
  status: '待处理' | '随访中' | '已完成' | '异常'
  hbvResult?: string
  hcvResult?: string
  hivResult?: string
}

interface EnvironmentMonitor {
  id: string
  location: string
  locationType: '洗消间' | '操作间' | '储藏间' | '更衣室' | '走廊'
  sampleDate: string
  sampleType: '空气' | '物表' | '超声探头' | '手部' | '消毒液'
  targetGerm: string
  result: '合格' | '不合格' | '待复查'
  colonyCount: string
  standard: string
  tester: string
  remarks: string
}

interface DisinfectionMonitor {
  id: string
  endoscopeId: string
  endoscopeName: string
  processDate: string
  processType: '高水平消毒' | '灭菌'
  disinfectant: string
  concentration: string
  exposureTime: string
  temperature: string
  result: '合格' | '不合格'
  batchNo: string
  operator: string
}

// ---------- 演示数据 (40条) ----------
const generateInfectionCases = (): InfectionCase[] => [
  { id: 'INF001', patientName: '王建国', patientId: 'P20240001', endoscope: 'GIF-HQ290(1号)', procedure: '腹部超声检查', infectionType: 'HBV感染', severity: '轻症', confirmedDate: '2024-01-15', department: '消化内科', doctor: '李明华', status: '治愈', outcomes: '完全康复', notes: '既往乙肝小三阳，本次急性发作' },
  { id: 'INF002', patientName: '张丽华', patientId: 'P20240002', endoscope: 'CF-HQ290L(2号)', procedure: '浅表超声检查', infectionType: '艰难梭菌感染', severity: '中等', confirmedDate: '2024-01-18', department: '肛肠外科', doctor: '赵文博', status: '治愈', outcomes: '抗生素治疗有效', notes: '肠镜后3天出现腹泻' },
  { id: 'INF003', patientName: '李志刚', patientId: 'P20240003', endoscope: 'GIF-HQ290(1号)', procedure: 'ERCP', infectionType: '胆道感染', severity: '重症', confirmedDate: '2024-01-22', department: '肝胆外科', doctor: '孙立群', status: '确诊', outcomes: '抗感染治疗中', notes: '术后发热，WBC升高' },
  { id: 'INF004', patientName: '陈秀英', patientId: 'P20240004', endoscope: 'BF-1TQ290(3号)', procedure: '肺部超声检查', infectionType: '肺部感染', severity: '中等', confirmedDate: '2024-02-05', department: '呼吸内科', doctor: '周晓峰', status: '治愈', outcomes: '抗生素治疗有效', notes: '术后低热2天' },
  { id: 'INF005', patientName: '刘德明', patientId: 'P20240005', endoscope: 'GIF-HQ290(1号)', procedure: '腹部超声+活检', infectionType: 'HP感染', severity: '轻症', confirmedDate: '2024-02-10', department: '消化内科', doctor: '李明华', status: '治愈', outcomes: '根除治疗成功', notes: 'HP阳性，病理证实' },
  { id: 'INF006', patientName: '赵雪梅', patientId: 'P20240006', endoscope: 'CF-HQ290L(2号)', procedure: '浅表超声检查', infectionType: '院内获得性肺炎', severity: '危重', confirmedDate: '2024-02-14', department: 'ICU', doctor: '张志远', status: '死亡', outcomes: '多器官功能衰竭', notes: '基础疾病：COPD' },
  { id: 'INF007', patientName: '孙伟东', patientId: 'P20240007', endoscope: 'JF-TF260(4号)', procedure: '介入超声检查', infectionType: '十二指肠穿孔继发感染', severity: '重症', confirmedDate: '2024-02-20', department: '消化内科', doctor: '王建华', status: '治愈', outcomes: '保守治疗成功', notes: '检查后腹痛，影像学证实' },
  { id: 'INF008', patientName: '周桂芳', patientId: 'P20240008', endoscope: 'GIF-HQ290(1号)', procedure: '腹部超声止血术', infectionType: '食管穿孔', severity: '中等', confirmedDate: '2024-03-01', department: '消化内科', doctor: '李明华', status: '治愈', outcomes: '超声探头下夹闭成功', notes: '操作相关并发症' },
  { id: 'INF009', patientName: '吴强', patientId: 'P20240009', endoscope: 'BF-1TQ290(3号)', procedure: 'EBUS-TBNA', infectionType: '纵隔感染', severity: '中等', confirmedDate: '2024-03-08', department: '呼吸内科', doctor: '周晓峰', status: '确诊', outcomes: '抗感染治疗中', notes: '穿刺后纵隔气肿继发' },
  { id: 'INF010', patientName: '郑小红', patientId: 'P20240010', endoscope: 'CF-HQ290L(2号)', procedure: 'EMR', infectionType: '术后感染', severity: '轻症', confirmedDate: '2024-03-12', department: '肛肠外科', doctor: '赵文博', status: '治愈', outcomes: '抗生素治愈', notes: '术后2天切口红肿' },
  { id: 'INF011', patientName: '黄文军', patientId: 'P20240011', endoscope: 'GIF-HQ290(1号)', procedure: '腹部超声检查', infectionType: 'HCV感染', severity: '轻症', confirmedDate: '2024-03-18', department: '消化内科', doctor: '孙立群', status: '治愈', outcomes: 'DAAs治疗中', notes: '既往输血史' },
  { id: 'INF012', patientName: '林婉如', patientId: 'P20240012', endoscope: 'JF-TF260(4号)', procedure: 'ERCP+EST', infectionType: '急性胰腺炎', severity: '重症', confirmedDate: '2024-03-25', department: '肝胆外科', doctor: '王建华', status: '治愈', outcomes: '保守治疗成功', notes: '术后淀粉酶升高' },
  { id: 'INF013', patientName: '徐海军', patientId: 'P20240013', endoscope: 'BF-1TQ290(3号)', procedure: '气管镜检查', infectionType: '铜绿假单胞菌感染', severity: '中等', confirmedDate: '2024-04-02', department: '呼吸内科', doctor: '周晓峰', status: '确诊', outcomes: '抗感染治疗中', notes: '痰培养阳性' },
  { id: 'INF014', patientName: '马秀兰', patientId: 'P20240014', endoscope: 'CF-HQ290L(2号)', procedure: '浅表超声检查', infectionType: '腹膜炎', severity: '重症', confirmedDate: '2024-04-08', department: '普外科', doctor: '张志远', status: '治愈', outcomes: '手术治疗后康复', notes: '肠穿孔后继发' },
  { id: 'INF015', patientName: '杨志远', patientId: 'P20240015', endoscope: 'GIF-HQ290(1号)', procedure: '腹部超声+息肉切除', infectionType: '菌血症', severity: '中等', confirmedDate: '2024-04-15', department: '消化内科', doctor: '李明华', status: '治愈', outcomes: '血培养转阴', notes: '术后寒战高热' },
  { id: 'INF016', patientName: '胡建军', patientId: 'P20240016', endoscope: 'JF-TF260(4号)', procedure: '小肠镜检查', infectionType: '小肠穿孔', severity: '危重', confirmedDate: '2024-04-20', department: '消化内科', doctor: '孙立群', status: '死亡', outcomes: '感染性休克', notes: '基础疾病：Crohn病' },
  { id: 'INF017', patientName: '朱爱玲', patientId: 'P20240017', endoscope: 'CF-HQ290L(2号)', procedure: '浅表超声检查', infectionType: '乙状结肠穿孔', severity: '中等', confirmedDate: '2024-04-25', department: '肛肠外科', doctor: '赵文博', status: '治愈', outcomes: '保守治疗成功', notes: '高龄患者，基础状况差' },
  { id: 'INF018', patientName: '曾繁荣', patientId: 'P20240018', endoscope: 'GIF-HQ290(1号)', procedure: '腹部超声检查', infectionType: 'HIV感染', severity: '轻症', confirmedDate: '2024-05-03', department: '感染科', doctor: '王建华', status: '确诊', outcomes: 'ART治疗中', notes: '术前筛查发现' },
  { id: 'INF019', patientName: '韩志鹏', patientId: 'P20240019', endoscope: 'BF-1TQ290(3号)', procedure: '胸腔镜检查', infectionType: '脓胸', severity: '重症', confirmedDate: '2024-05-10', department: '胸外科', doctor: '周晓峰', status: '治愈', outcomes: '引流+抗感染治愈', notes: '肺大疱继发感染' },
  { id: 'INF020', patientName: '冯桂英', patientId: 'P20240020', endoscope: 'CF-HQ290L(2号)', procedure: '浅表超声+EMR', infectionType: '盆腔脓肿', severity: '中等', confirmedDate: '2024-05-15', department: '肛肠外科', doctor: '赵文博', status: '治愈', outcomes: '穿刺引流后康复', notes: '术后持续发热' },
]

const generateOccupationalExposures = (): OccupationalExposure[] => [
  { id: 'EXP001', staffName: '张晓燕', staffId: 'S20240001', department: '超声中心', exposureType: '针刺伤', sourcePatient: 'P20240018(HIV+)', exposureDate: '2024-01-08', exposureRoute: '静脉穿刺', severity: '重度', immediateAction: '挤压冲洗，碘伏消毒', reporter: '李明华', reportDate: '2024-01-08', status: '已完成', hbvResult: '阴性', hcvResult: '阴性', hivResult: '待复查' },
  { id: 'EXP002', staffName: '王丽娟', staffId: 'S20240002', department: '超声中心', exposureType: '血液接触', sourcePatient: 'P20240001(HBV)', exposureDate: '2024-01-15', exposureRoute: '皮肤破损处', severity: '中度', immediateAction: '大量清水冲洗', reporter: '赵文博', reportDate: '2024-01-15', status: '已完成', hbvResult: '阳性', hcvResult: '阴性', hivResult: '阴性' },
  { id: 'EXP003', staffName: '李秀英', staffId: 'S20240003', department: '洗消部', exposureType: '锐器伤', sourcePatient: '复用超声探头活检孔道', exposureDate: '2024-01-22', exposureRoute: '超声探头清洗时', severity: '轻度', immediateAction: '流动水冲洗，酒精消毒', reporter: '孙立群', reportDate: '2024-01-22', status: '已完成', hbvResult: '阴性', hcvResult: '阴性', hivResult: '阴性' },
  { id: 'EXP004', staffName: '陈建国', staffId: 'S20240004', department: '超声中心', exposureType: '体液接触', sourcePatient: 'P20240006(HCV)', exposureDate: '2024-02-03', exposureRoute: '面颊部溅入', severity: '中度', immediateAction: '生理盐水冲洗', reporter: '周晓峰', reportDate: '2024-02-03', status: '已完成', hbvResult: '阴性', hcvResult: '阴性', hivResult: '阴性' },
  { id: 'EXP005', staffName: '刘建军', staffId: 'S20240005', department: '超声中心', exposureType: '黏膜暴露', sourcePatient: 'P20240011(HIV+)', exposureDate: '2024-02-10', exposureRoute: '腹部超声操作时', severity: '重度', immediateAction: '大量生理盐水冲洗', reporter: '李明华', reportDate: '2024-02-10', status: '随访中', hbvResult: '阴性', hcvResult: '阴性', hivResult: '阴性(4周)' },
  { id: 'EXP006', staffName: '赵志刚', staffId: 'S20240006', department: '洗消部', exposureType: '针刺伤', sourcePatient: '复用穿刺针', exposureDate: '2024-02-18', exposureRoute: '器械预处理', severity: '轻度', immediateAction: '挤压出血，碘伏消毒', reporter: '王建华', reportDate: '2024-02-18', status: '已完成', hbvResult: '阴性', hcvResult: '阴性', hivResult: '阴性' },
  { id: 'EXP007', staffName: '孙红梅', staffId: 'S20240007', department: '超声中心', exposureType: '血液接触', sourcePatient: 'P20240003(HBV)', exposureDate: '2024-03-05', exposureRoute: '术中喷溅', severity: '中度', immediateAction: '流动水冲洗', reporter: '赵文博', reportDate: '2024-03-05', status: '已完成', hbvResult: '阳性', hcvResult: '阴性', hivResult: '阴性' },
  { id: 'EXP008', staffName: '周晓丽', staffId: 'S20240008', department: '超声中心', exposureType: '锐器伤', sourcePatient: '活检钳', exposureDate: '2024-03-12', exposureRoute: '病理标本处理', severity: '轻度', immediateAction: '流动水冲洗，酒精消毒', reporter: '孙立群', reportDate: '2024-03-12', status: '已完成', hbvResult: '阴性', hcvResult: '阴性', hivResult: '阴性' },
  { id: 'EXP009', staffName: '吴海燕', staffId: 'S20240009', department: '洗消部', exposureType: '体液接触', sourcePatient: 'P20240009(多重耐药)', exposureDate: '2024-03-20', exposureRoute: '超声探头表面接触', severity: '中度', immediateAction: '含氯消毒液擦拭', reporter: '周晓峰', reportDate: '2024-03-20', status: '已完成', hbvResult: '阴性', hcvResult: '阴性', hivResult: '阴性' },
  { id: 'EXP010', staffName: '郑金凤', staffId: 'S20240010', department: '超声中心', exposureType: '针刺伤', sourcePatient: '麻醉针', exposureDate: '2024-03-28', exposureRoute: '静脉穿刺', severity: '轻度', immediateAction: '挤压冲洗，碘伏消毒', reporter: '李明华', reportDate: '2024-03-28', status: '已完成', hbvResult: '阴性', hcvResult: '阴性', hivResult: '阴性' },
  { id: 'EXP011', staffName: '黄志强', staffId: 'S20240011', department: '超声中心', exposureType: '黏膜暴露', sourcePatient: 'P20240018(HIV+)', exposureDate: '2024-04-05', exposureRoute: 'ERCP操作', severity: '重度', immediateAction: '大量生理盐水冲洗眼结膜', reporter: '王建华', reportDate: '2024-04-05', status: '异常', hbvResult: '阴性', hcvResult: '阴性', hivResult: '待确认' },
  { id: 'EXP012', staffName: '林晓东', staffId: 'S20240012', department: '洗消部', exposureType: '锐器伤', sourcePatient: '注射器针头', exposureDate: '2024-04-12', exposureRoute: '废物处理', severity: '轻度', immediateAction: '流动水冲洗', reporter: '赵文博', reportDate: '2024-04-12', status: '已完成', hbvResult: '阴性', hcvResult: '阴性', hivResult: '阴性' },
  { id: 'EXP013', staffName: '徐秀兰', staffId: 'S20240013', department: '超声中心', exposureType: '血液接触', sourcePatient: 'P20240014(HBV)', exposureDate: '2024-04-20', exposureRoute: '操作台面', severity: '中度', immediateAction: '含氯消毒剂擦拭', reporter: '孙立群', reportDate: '2024-04-20', status: '已完成', hbvResult: '阳性', hcvResult: '阴性', hivResult: '阴性' },
  { id: 'EXP014', staffName: '马建军', staffId: 'S20240014', department: '超声中心', exposureType: '针刺伤', sourcePatient: '超声探头活检通道', exposureDate: '2024-04-28', exposureRoute: '超声探头清洗', severity: '轻度', immediateAction: '挤压冲洗，碘伏消毒', reporter: '周晓峰', reportDate: '2024-04-28', status: '已完成', hbvResult: '阴性', hcvResult: '阴性', hivResult: '阴性' },
  { id: 'EXP015', staffName: '杨爱华', staffId: 'S20240015', department: '洗消部', exposureType: '体液接触', sourcePatient: 'P20240019(耐甲氧西林葡萄球菌)', exposureDate: '2024-05-05', exposureRoute: '超声探头吸引', severity: '中度', immediateAction: '流动水冲洗，75%酒精消毒', reporter: '李明华', reportDate: '2024-05-05', status: '随访中', hbvResult: '阴性', hcvResult: '阴性', hivResult: '阴性' },
]

const generateEnvironmentMonitors = (): EnvironmentMonitor[] => [
  { id: 'EM001', location: '洗消间A区', locationType: '洗消间', sampleDate: '2024-01-05', sampleType: '空气', targetGerm: '菌落总数', result: '合格', colonyCount: '120CFU/m³', standard: '≤200CFU/m³', tester: '张晓燕', remarks: '' },
  { id: 'EM002', location: '洗消间A区', locationType: '洗消间', sampleDate: '2024-01-05', sampleType: '物表', targetGerm: '菌落总数', result: '合格', colonyCount: '8CFU/cm²', standard: '≤10CFU/cm²', tester: '张晓燕', remarks: '' },
  { id: 'EM003', location: '超声探头1储存柜', locationType: '储藏间', sampleDate: '2024-01-10', sampleType: '超声探头', targetGerm: '菌落总数', result: '合格', colonyCount: '0CFU/件', standard: '≤5CFU/件', tester: '王丽娟', remarks: '高水平消毒后储存' },
  { id: 'EM004', location: '操作间1', locationType: '操作间', sampleDate: '2024-01-15', sampleType: '空气', targetGerm: '菌落总数', result: '合格', colonyCount: '150CFU/m³', standard: '≤200CFU/m³', tester: '李秀英', remarks: '' },
  { id: 'EM005', location: '更衣室', locationType: '更衣室', sampleDate: '2024-01-20', sampleType: '手部', targetGerm: '金黄色葡萄球菌', result: '合格', colonyCount: '0CFU', standard: '不得检出', tester: '陈建国', remarks: '' },
  { id: 'EM006', location: '洗消间B区', locationType: '洗消间', sampleDate: '2024-02-01', sampleType: '消毒液', targetGerm: '有效氯含量', result: '合格', colonyCount: '450mg/L', standard: '400-500mg/L', tester: '刘建军', remarks: '浓度正常' },
  { id: 'EM007', location: '超声探头2储存柜', locationType: '储藏间', sampleDate: '2024-02-05', sampleType: '超声探头', targetGerm: '菌落总数', result: '不合格', colonyCount: '18CFU/件', standard: '≤5CFU/件', tester: '赵志刚', remarks: '储存超期，已重新消毒' },
  { id: 'EM008', location: '走廊', locationType: '走廊', sampleDate: '2024-02-10', sampleType: '空气', targetGerm: '菌落总数', result: '合格', colonyCount: '180CFU/m³', standard: '≤400CFU/m³', tester: '孙红梅', remarks: '' },
  { id: 'EM009', location: '操作间2', locationType: '操作间', sampleDate: '2024-02-15', sampleType: '物表', targetGerm: '菌落总数', result: '合格', colonyCount: '5CFU/cm²', standard: '≤10CFU/cm²', tester: '周晓丽', remarks: '' },
  { id: 'EM010', location: '洗消间A区', locationType: '洗消间', sampleDate: '2024-03-01', sampleType: '超声探头', targetGerm: ' HBV表面抗原', result: '合格', colonyCount: '阴性', standard: '阴性', tester: '吴海燕', remarks: '' },
  { id: 'EM011', location: '超声探头3储存柜', locationType: '储藏间', sampleDate: '2024-03-05', sampleType: '超声探头', targetGerm: '菌落总数', result: '待复查', colonyCount: '12CFU/件', standard: '≤5CFU/件', tester: '郑金凤', remarks: '3天后复查' },
  { id: 'EM012', location: '更衣室', locationType: '更衣室', sampleDate: '2024-03-10', sampleType: '手部', targetGerm: '菌落总数', result: '合格', colonyCount: '3CFU', standard: '≤10CFU', tester: '黄志强', remarks: '' },
  { id: 'EM013', location: '洗消间B区', locationType: '洗消间', sampleDate: '2024-03-15', sampleType: '消毒液', targetGerm: '过氧乙酸浓度', result: '合格', colonyCount: '1800mg/L', standard: '1500-2000mg/L', tester: '林晓东', remarks: '' },
  { id: 'EM014', location: '操作间1', locationType: '操作间', sampleDate: '2024-04-01', sampleType: '空气', targetGerm: '菌落总数', result: '合格', colonyCount: '165CFU/m³', standard: '≤200CFU/m³', tester: '徐秀兰', remarks: '' },
  { id: 'EM015', location: '超声探头1储存柜', locationType: '储藏间', sampleDate: '2024-04-05', sampleType: '超声探头', targetGerm: '菌落总数', result: '合格', colonyCount: '2CFU/件', standard: '≤5CFU/件', tester: '马建军', remarks: '复查合格' },
]

// ---------- KPI 数据 ----------
const kpiData = {
  monthlyInfections: [
    { month: '1月', count: 3, severe: 1 },
    { month: '2月', count: 4, severe: 1 },
    { month: '3月', count: 5, severe: 2 },
    { month: '4月', count: 6, severe: 2 },
    { month: '5月', count: 4, severe: 1 },
    { month: '6月', count: 3, severe: 1 },
  ],
  disinfectionRate: 98.5,
  handHygiene: 92.3,
  environmentPass: 95.8,
  occupationalIncidents: 15,
}

// ---------- 样式定义 ----------
const s: Record<string, React.CSSProperties> = {
  root: { padding: 0 },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 24, flexWrap: 'wrap', gap: 12,
  },
  titleRow: { display: 'flex', alignItems: 'center', gap: 12 },
  titleIcon: { color: '#dc2626' },
  title: { fontSize: 24, fontWeight: 700, color: '#1a3a5c', margin: 0 },
  subtitle: { fontSize: 15, color: '#dc2626', marginTop: 4 },
  alertBanner: {
    background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
    border: '1px solid #fecaca',
    borderRadius: 12,
    padding: '14px 18px',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  alertText: { fontSize: 15, color: '#991b1b', fontWeight: 600 },
  // KPI行
  kpiRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: 16,
    marginBottom: 24,
  },
  kpiCard: {
    background: '#fff',
    borderRadius: 12,
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    borderLeft: '5px solid',
    minHeight: 100,
  },
  kpiIconWrap: {
    width: 48, height: 48, borderRadius: 12,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  kpiValue: { fontSize: 30, fontWeight: 700, lineHeight: 1.2 },
  kpiLabel: { fontSize: 13, color: '#64748b', marginTop: 4 },
  kpiTrend: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, marginTop: 6 },
  // Tab行
  tabRow: {
    display: 'flex',
    gap: 6,
    marginBottom: 20,
    borderBottom: '2px solid #f1f5f9',
    flexWrap: 'wrap',
  },
  tab: {
    padding: '12px 22px',
    fontSize: 15,
    fontWeight: 600,
    color: '#64748b',
    cursor: 'pointer',
    borderBottom: '3px solid transparent',
    marginBottom: -2,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    transition: 'all 0.2s',
    minHeight: 44,
  },
  tabActive: {
    color: '#dc2626',
    borderBottom: '3px solid #dc2626',
  },
  // 工具栏
  toolbar: {
    display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap',
    background: '#fff', padding: '14px 18px', borderRadius: 10,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 16, minHeight: 56,
  },
  searchBox: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: '#f8fafc', border: '1px solid #e2e8f0',
    borderRadius: 10, padding: '10px 14px', flex: 1, minWidth: 200, minHeight: 44,
  },
  searchInput: {
    border: 'none', outline: 'none', background: 'transparent',
    fontSize: 15, color: '#334155', width: '100%',
  },
  select: {
    border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 12px',
    fontSize: 15, color: '#334155', background: '#f8fafc', outline: 'none',
    cursor: 'pointer', minHeight: 44,
  },
  btnPrimary: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: '#dc2626', color: '#fff', border: 'none', borderRadius: 10,
    padding: '10px 18px', fontSize: 15, cursor: 'pointer', fontWeight: 600,
    minHeight: 44,
  },
  btnSecondary: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 10,
    padding: '10px 16px', fontSize: 15, cursor: 'pointer', fontWeight: 600,
    minHeight: 44,
  },
  // 统计卡片行
  statRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    background: '#fff', borderRadius: 10, padding: '16px 18px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
    display: 'flex', flexDirection: 'column', gap: 6, minHeight: 70,
  },
  statLabel: { fontSize: 13, color: '#64748b' },
  statValue: { fontSize: 22, fontWeight: 700, color: '#1a3a5c' },
  // 图表行
  chartRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
    marginBottom: 20,
  },
  chartCard: {
    background: '#fff',
    borderRadius: 12,
    padding: 20,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  chartTitle: {
    fontSize: 16, fontWeight: 700, color: '#1a3a5c', marginBottom: 16,
    display: 'flex', alignItems: 'center', gap: 8,
  },
  // 表格
  table: {
    width: '100%', borderCollapse: 'collapse', background: '#fff',
    borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  th: {
    background: '#fef2f2', padding: '12px 14px', textAlign: 'left',
    fontSize: 13, fontWeight: 700, color: '#991b1b', borderBottom: '2px solid #fecaca',
  },
  td: {
    padding: '12px 14px', fontSize: 14, color: '#334155', borderBottom: '1px solid #f1f5f9',
  },
  badge: {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '4px 10px', borderRadius: 14, fontSize: 12, fontWeight: 600,
  },
  badgeRed: { background: '#fee2e2', color: '#dc2626' },
  badgeOrange: { background: '#fef3c7', color: '#d97706' },
  badgeGreen: { background: '#dcfce7', color: '#16a34a' },
  badgeBlue: { background: '#dbeafe', color: '#1d4ed8' },
  badgeGray: { background: '#f1f5f9', color: '#64748b' },
  badgePurple: { background: '#f3e8ff', color: '#7c3aed' },
  actions: { display: 'flex', gap: 6 },
  // 分页
  pagination: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 16, padding: '14px 18px', background: '#fff',
    borderRadius: 10, boxShadow: '0 2px 6px rgba(0,0,0,0.06)', flexWrap: 'wrap', gap: 10,
  },
  pageInfo: { fontSize: 14, color: '#64748b' },
  pageBtns: { display: 'flex', gap: 4 },
  pageBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 36, height: 36, borderRadius: 8, border: '1px solid #e2e8f0',
    background: '#fff', cursor: 'pointer', fontSize: 14, color: '#475569', fontWeight: 600,
  },
  pageBtnActive: {
    background: '#dc2626', color: '#fff', border: '1px solid #dc2626',
  },
  // 详情模态框
  modal: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000,
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
  },
  modalContent: {
    background: '#fff', borderRadius: 12, padding: 24, maxWidth: 600, width: '100%',
    maxHeight: '80vh', overflowY: 'auto',
  },
  modalHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: 700, color: '#1a3a5c' },
  detailGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14,
  },
  detailItem: {
    display: 'flex', flexDirection: 'column', gap: 4,
  },
  detailLabel: { fontSize: 12, color: '#64748b' },
  detailValue: { fontSize: 14, color: '#334155', fontWeight: 600 },
  // 环境监测专用
  monitorGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16,
  },
  monitorCard: {
    background: '#fff', borderRadius: 10, padding: '16px 18px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.06)', borderTop: '3px solid',
    minHeight: 80,
  },
  monitorTitle: { fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 8 },
  monitorValue: { fontSize: 26, fontWeight: 700 },
  monitorUnit: { fontSize: 13, color: '#64748b' },
  // 步骤指示
  stepIndicator: {
    display: 'flex', gap: 8, marginBottom: 16,
  },
  step: {
    flex: 1, height: 6, borderRadius: 3, background: '#e2e8f0',
  },
  stepActive: { background: '#dc2626' },
  stepDone: { background: '#16a34a' },
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
const getSeverityColor = (severity: string) => {
  switch (severity) {
    case '危重': return '#dc2626'
    case '重症': return '#ea580c'
    case '中等': return '#d97706'
    case '轻度': case '轻症': return '#16a34a'
    case '重度': return '#dc2626'
    case '中度': return '#d97706'
    default: return '#64748b'
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case '确诊': return { bg: '#fee2e2', text: '#dc2626' }
    case '疑似': return { bg: '#fef3c7', text: '#d97706' }
    case '治愈': return { bg: '#dcfce7', text: '#16a34a' }
    case '死亡': return { bg: '#f1f5f9', text: '#64748b' }
    case '待处理': return { bg: '#fef3c7', text: '#d97706' }
    case '随访中': return { bg: '#dbeafe', text: '#1d4ed8' }
    case '已完成': return { bg: '#dcfce7', text: '#16a34a' }
    case '异常': return { bg: '#fee2e2', text: '#dc2626' }
    case '合格': return { bg: '#dcfce7', text: '#16a34a' }
    case '不合格': return { bg: '#fee2e2', text: '#dc2626' }
    case '待复查': return { bg: '#fef3c7', text: '#d97706' }
    default: return { bg: '#f1f5f9', text: '#64748b' }
  }
}

// ---------- 主组件 ----------
export default function InfectionPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [filterStatus, setFilterStatus] = useState('全部')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedItem, setSelectedItem] = useState<InfectionCase | OccupationalExposure | EnvironmentMonitor | null>(null)
  const pageSize = 10

  const infectionCases = generateInfectionCases()
  const occupationalExposures = generateOccupationalExposures()
  const environmentMonitors = generateEnvironmentMonitors()

  const tabs = [
    { key: 'overview', label: '感染概览', icon: Activity },
    { key: 'occupational', label: '职业暴露', icon: ShieldAlert },
    { key: 'environment', label: '环境监测', icon: Wind },
    { key: 'disinfection', label: '消毒监测', icon: Droplets },
    { key: 'statistics', label: '统计分析', icon: BarChart3 },
  ]

  // 过滤逻辑
  const filteredData = infectionCases.filter(item => {
    const matchKeyword = searchKeyword === '' ||
      item.patientName.includes(searchKeyword) ||
      item.patientId.includes(searchKeyword) ||
      item.id.includes(searchKeyword)
    const matchStatus = filterStatus === '全部' || item.status === filterStatus
    return matchKeyword && matchStatus
  })

  const totalPages = Math.ceil(filteredData.length / pageSize)
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  // 职业暴露过滤
  const filteredExposures = occupationalExposures.filter(item => {
    const matchKeyword = searchKeyword === '' ||
      item.staffName.includes(searchKeyword) ||
      item.staffId.includes(searchKeyword) ||
      item.id.includes(searchKeyword)
    const matchStatus = filterStatus === '全部' || item.status === filterStatus
    return matchKeyword && matchStatus
  })

  // 环境监测过滤
  const filteredEnvironments = environmentMonitors.filter(item => {
    const matchKeyword = searchKeyword === '' ||
      item.location.includes(searchKeyword) ||
      item.id.includes(searchKeyword)
    const matchResult = filterStatus === '全部' || item.result === filterStatus
    return matchKeyword && matchResult
  })

  // KPI计算
  const totalInfections = infectionCases.length
  const confirmedInfections = infectionCases.filter(i => i.status === '确诊').length
  const severeInfections = infectionCases.filter(i => i.severity === '重症' || i.severity === '危重').length
  const exposureIncidents = occupationalExposures.length
  const environmentPassRate = Math.round((environmentMonitors.filter(e => e.result === '合格').length / environmentMonitors.length) * 100)

  const renderBadge = (text: string, status: string) => {
    const color = getStatusColor(status)
    return (
      <span style={{
        ...s.badge,
        background: color.bg,
        color: color.text,
      }}>
        {text}
      </span>
    )
  }

  const renderSeverityBadge = (severity: string) => {
    const color = getSeverityColor(severity)
    return (
      <span style={{
        ...s.badge,
        background: `${color}20`,
        color: color,
      }}>
        {severity}
      </span>
    )
  }

  return (
    <div style={s.root}>
      {/* 页面头部 */}
      <div style={s.header}>
        <div style={s.titleRow}>
          <ShieldAlert size={28} style={s.titleIcon} />
          <div>
            <h1 style={s.title}>感染管理</h1>
            <p style={s.subtitle}>感染监测 · 职业暴露 · 环境监测 · 消毒追溯</p>
          </div>
        </div>
      </div>

      {/* 警示横幅 */}
      <div style={s.alertBanner}>
        <AlertTriangle size={20} color="#dc2626" />
        <span style={s.alertText}>
          ⚠ 本月新增感染病例 4 例，其中重症 1 例 | 职业暴露 2 例 | 环境监测异常 1 处待复查
        </span>
      </div>

      {/* KPI指标行 */}
      <div style={s.kpiRow}>
        <div style={{ ...s.kpiCard, borderLeftColor: '#dc2626' }}>
          <div style={{ ...s.kpiIconWrap, background: '#fee2e2' }}>
            <Activity size={22} color="#dc2626" />
          </div>
          <div style={{ ...s.kpiValue, color: '#dc2626' }}>{totalInfections}</div>
          <div style={s.kpiLabel}>累计感染病例</div>
          <div style={{ ...s.kpiTrend, color: '#16a34a' }}>
            <TrendingDown size={14} /> 本月 +4
          </div>
        </div>

        <div style={{ ...s.kpiCard, borderLeftColor: '#ea580c' }}>
          <div style={{ ...s.kpiIconWrap, background: '#fef3c7' }}>
            <AlertTriangle size={22} color="#ea580c" />
          </div>
          <div style={{ ...s.kpiValue, color: '#ea580c' }}>{confirmedInfections}</div>
          <div style={s.kpiLabel}>确诊感染</div>
          <div style={{ ...s.kpiTrend, color: '#dc2626' }}>
            <TrendingUp size={14} /> 重症 {severeInfections}例
          </div>
        </div>

        <div style={{ ...s.kpiCard, borderLeftColor: '#d97706' }}>
          <div style={{ ...s.kpiIconWrap, background: '#fef3c7' }}>
            <ShieldAlert size={22} color="#d97706" />
          </div>
          <div style={{ ...s.kpiValue, color: '#d97706' }}>{exposureIncidents}</div>
          <div style={s.kpiLabel}>职业暴露事件</div>
          <div style={{ ...s.kpiTrend, color: '#64748b' }}>
            <Shield size={14} /> 随访中 2例
          </div>
        </div>

        <div style={{ ...s.kpiCard, borderLeftColor: '#16a34a' }}>
          <div style={{ ...s.kpiIconWrap, background: '#dcfce7' }}>
            <Wind size={22} color="#16a34a" />
          </div>
          <div style={{ ...s.kpiValue, color: '#16a34a' }}>{environmentPassRate}%</div>
          <div style={s.kpiLabel}>环境监测合格率</div>
          <div style={{ ...s.kpiTrend, color: '#16a34a' }}>
            <CheckCircle size={14} /> 达标
          </div>
        </div>

        <div style={{ ...s.kpiCard, borderLeftColor: '#1d4ed8' }}>
          <div style={{ ...s.kpiIconWrap, background: '#dbeafe' }}>
            <Droplets size={22} color="#1d4ed8" />
          </div>
          <div style={{ ...s.kpiValue, color: '#1d4ed8' }}>{kpiData.disinfectionRate}%</div>
          <div style={s.kpiLabel}>消毒合格率</div>
          <div style={{ ...s.kpiTrend, color: '#16a34a' }}>
            <CheckCircle size={14} /> 持续达标
          </div>
        </div>
      </div>

      {/* Tab切换 */}
      <div style={s.tabRow}>
        {tabs.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.key
          return (
            <div
              key={tab.key}
              style={{
                ...s.tab,
                ...(isActive ? s.tabActive : {}),
              }}
              onClick={() => setActiveTab(tab.key)}
            >
              <Icon size={16} />
              {tab.label}
            </div>
          )
        })}
      </div>

      {/* ========== Tab 1: 感染概览 ========== */}
      {activeTab === 'overview' && (
        <>
          <div style={s.toolbar}>
            <div style={s.searchBox}>
              <Search size={16} color="#94a3b8" />
              <input
                style={s.searchInput}
                placeholder="搜索患者姓名/ID/病例号..."
                value={searchKeyword}
                onChange={e => { setSearchKeyword(e.target.value); setCurrentPage(1) }}
              />
            </div>
            <select style={s.select} value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1) }}>
              <option>全部</option>
              <option>疑似</option>
              <option>确诊</option>
              <option>治愈</option>
              <option>死亡</option>
            </select>
            <button style={s.btnSecondary} onClick={() => {}}>
              <Filter size={14} /> 筛选
            </button>
            <button style={s.btnPrimary} onClick={() => {}}>
              <Plus size={14} /> 新增病例
            </button>
          </div>

          {/* 统计行 */}
          <div style={s.statRow}>
            <div style={s.statCard}>
              <span style={s.statLabel}>本月新增</span>
              <span style={{ ...s.statValue, color: '#dc2626' }}>4</span>
            </div>
            <div style={s.statCard}>
              <span style={s.statLabel}>治愈出院</span>
              <span style={{ ...s.statValue, color: '#16a34a' }}>18</span>
            </div>
            <div style={s.statCard}>
              <span style={s.statLabel}>重症监护</span>
              <span style={{ ...s.statValue, color: '#dc2626' }}>2</span>
            </div>
            <div style={s.statCard}>
              <span style={s.statLabel}>死亡率</span>
              <span style={{ ...s.statValue, color: '#64748b' }}>5.0%</span>
            </div>
          </div>

          {/* 感染类型分布图表 */}
          <div style={s.chartRow}>
            <div style={s.chartCard}>
              <div style={s.chartTitle}>
                <BarChart3 size={16} color="#dc2626" />
                月度感染病例趋势
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={kpiData.monthlyInfections}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip />
                  <Bar dataKey="count" name="感染病例" fill="#dc2626" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="severe" name="重症" fill="#ea580c" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={s.chartCard}>
              <div style={s.chartTitle}>
                <TrendingUp size={16} color="#d97706" />
                感染类型分布
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={[
                  { name: '细菌感染', count: 12 },
                  { name: '病毒感染', count: 5 },
                  { name: '真菌感染', count: 2 },
                  { name: '其他', count: 1 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip />
                  <Bar dataKey="count" name="病例数" fill="#d97706" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 感染病例表格 */}
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>病例号</th>
                <th style={s.th}>患者姓名</th>
                <th style={s.th}>患者ID</th>
                <th style={s.th}>使用超声探头</th>
                <th style={s.th}>操作项目</th>
                <th style={s.th}>感染类型</th>
                <th style={s.th}>严重程度</th>
                <th style={s.th}>确诊日期</th>
                <th style={s.th}>科室</th>
                <th style={s.th}>主治医生</th>
                <th style={s.th}>状态</th>
                <th style={s.th}>操作</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map(item => (
                <tr key={item.id}>
                  <td style={s.td}>{item.id}</td>
                  <td style={s.td}>{item.patientName}</td>
                  <td style={s.td}>{item.patientId}</td>
                  <td style={s.td}>{item.endoscope}</td>
                  <td style={s.td}>{item.procedure}</td>
                  <td style={s.td}>{item.infectionType}</td>
                  <td style={s.td}>{renderSeverityBadge(item.severity)}</td>
                  <td style={s.td}>{item.confirmedDate}</td>
                  <td style={s.td}>{item.department}</td>
                  <td style={s.td}>{item.doctor}</td>
                  <td style={s.td}>{renderBadge(item.status, item.status)}</td>
                  <td style={s.td}>
                    <div style={s.actions}>
                      <button style={{ ...s.btnSecondary, padding: '4px 8px' }} onClick={() => setSelectedItem(item)}>
                        <Eye size={14} />
                      </button>
                      <button style={{ ...s.btnSecondary, padding: '4px 8px' }} onClick={() => {}}>
                        <Edit2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {paginatedData.length === 0 && (
            <div style={s.emptyState}>
              <Activity size={48} style={s.emptyStateIcon} />
              <div style={s.emptyStateText}>暂无感染病例记录</div>
              <div style={s.emptyStateHint}>请尝试调整搜索条件或筛选状态</div>
            </div>
          )}

          {/* 分页 */}
          <div style={s.pagination}>
            <span style={s.pageInfo}>
              共 {filteredData.length} 条记录，第 {currentPage}/{totalPages} 页
            </span>
            <div style={s.pageBtns}>
              <button
                style={s.pageBtn}
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >«</button>
              <button
                style={s.pageBtn}
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >‹</button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1
                return (
                  <button
                    key={page}
                    style={{ ...s.pageBtn, ...(currentPage === page ? s.pageBtnActive : {}) }}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                )
              })}
              <button
                style={s.pageBtn}
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >›</button>
              <button
                style={s.pageBtn}
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >»</button>
            </div>
          </div>
        </>
      )}

      {/* ========== Tab 2: 职业暴露 ========== */}
      {activeTab === 'occupational' && (
        <>
          <div style={s.toolbar}>
            <div style={s.searchBox}>
              <Search size={16} color="#94a3b8" />
              <input
                style={s.searchInput}
                placeholder="搜索人员姓名/工号..."
                value={searchKeyword}
                onChange={e => setSearchKeyword(e.target.value)}
              />
            </div>
            <select style={s.select} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option>全部</option>
              <option>待处理</option>
              <option>随访中</option>
              <option>已完成</option>
              <option>异常</option>
            </select>
            <button style={s.btnPrimary} onClick={() => {}}>
              <Plus size={14} /> 上报暴露
            </button>
          </div>

          {/* 职业暴露统计 */}
          <div style={s.statRow}>
            <div style={s.statCard}>
              <span style={s.statLabel}>本年度累计</span>
              <span style={{ ...s.statValue, color: '#d97706' }}>{occupationalExposures.length}</span>
            </div>
            <div style={s.statCard}>
              <span style={s.statLabel}>针刺伤</span>
              <span style={s.statValue}>5</span>
            </div>
            <div style={s.statCard}>
              <span style={s.statLabel}>血液/体液接触</span>
              <span style={s.statValue}>7</span>
            </div>
            <div style={s.statCard}>
              <span style={s.statLabel}>HIV暴露后阻断</span>
              <span style={{ ...s.statValue, color: '#dc2626' }}>2</span>
            </div>
          </div>

          {/* 暴露类型分布 */}
          <div style={s.chartRow}>
            <div style={s.chartCard}>
              <div style={s.chartTitle}>
                <ShieldAlert size={16} color="#dc2626" />
                暴露类型分布
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={[
                  { name: '针刺伤', count: 5 },
                  { name: '血液接触', count: 4 },
                  { name: '体液接触', count: 3 },
                  { name: '锐器伤', count: 2 },
                  { name: '黏膜暴露', count: 1 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip />
                  <Bar dataKey="count" name="次数" fill="#dc2626" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={s.chartCard}>
              <div style={s.chartTitle}>
                <CheckCircle size={16} color="#16a34a" />
                随访检测结果
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={[
                  { name: 'HBV阳性', count: 2 },
                  { name: 'HCV阳性', count: 0 },
                  { name: 'HIV阳性', count: 0 },
                  { name: '全部阴性', count: 13 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip />
                  <Bar dataKey="count" name="人数" fill="#16a34a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 职业暴露表格 */}
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>编号</th>
                <th style={s.th}>姓名</th>
                <th style={s.th}>工号</th>
                <th style={s.th}>科室</th>
                <th style={s.th}>暴露类型</th>
                <th style={s.th}>暴露源</th>
                <th style={s.th}>暴露日期</th>
                <th style={s.th}>暴露途径</th>
                <th style={s.th}>严重程度</th>
                <th style={s.th}>状态</th>
                <th style={s.th}>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredExposures.map(item => (
                <tr key={item.id}>
                  <td style={s.td}>{item.id}</td>
                  <td style={s.td}>{item.staffName}</td>
                  <td style={s.td}>{item.staffId}</td>
                  <td style={s.td}>{item.department}</td>
                  <td style={s.td}>{item.exposureType}</td>
                  <td style={s.td}>{item.sourcePatient}</td>
                  <td style={s.td}>{item.exposureDate}</td>
                  <td style={s.td}>{item.exposureRoute}</td>
                  <td style={s.td}>{renderSeverityBadge(item.severity)}</td>
                  <td style={s.td}>{renderBadge(item.status, item.status)}</td>
                  <td style={s.td}>
                    <div style={s.actions}>
                      <button style={{ ...s.btnSecondary, padding: '4px 8px' }} onClick={() => setSelectedItem(item)}>
                        <Eye size={14} />
                      </button>
                      <button style={{ ...s.btnSecondary, padding: '4px 8px' }} onClick={() => {}}>
                        <Edit2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredExposures.length === 0 && (
            <div style={s.emptyState}>
              <ShieldAlert size={48} style={s.emptyStateIcon} />
              <div style={s.emptyStateText}>暂无职业暴露记录</div>
              <div style={s.emptyStateHint}>如有职业暴露事件，请点击「上报暴露」按钮</div>
            </div>
          )}

          <div style={s.pagination}>
            <span style={s.pageInfo}>共 {filteredExposures.length} 条记录</span>
          </div>
        </>
      )}

      {/* ========== Tab 3: 环境监测 ========== */}
      {activeTab === 'environment' && (
        <>
          <div style={s.toolbar}>
            <div style={s.searchBox}>
              <Search size={16} color="#94a3b8" />
              <input
                style={s.searchInput}
                placeholder="搜索监测点/编号..."
                value={searchKeyword}
                onChange={e => setSearchKeyword(e.target.value)}
              />
            </div>
            <select style={s.select} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option>全部</option>
              <option>合格</option>
              <option>不合格</option>
              <option>待复查</option>
            </select>
            <button style={s.btnSecondary} onClick={() => {}}>
              <RefreshCw size={14} /> 刷新
            </button>
            <button style={s.btnPrimary} onClick={() => {}}>
              <Plus size={14} /> 新增监测
            </button>
          </div>

          {/* 环境监测统计卡片 */}
          <div style={s.monitorGrid}>
            <div style={{ ...s.monitorCard, borderTopColor: '#16a34a' }}>
              <div style={s.monitorTitle}>空气质量合格率</div>
              <div style={{ ...s.monitorValue, color: '#16a34a' }}>96.2%</div>
              <div style={s.monitorUnit}>目标 ≥95%</div>
            </div>
            <div style={{ ...s.monitorCard, borderTopColor: '#1d4ed8' }}>
              <div style={s.monitorTitle}>物表监测合格率</div>
              <div style={{ ...s.monitorValue, color: '#1d4ed8' }}>100%</div>
              <div style={s.monitorUnit}>目标 100%</div>
            </div>
            <div style={{ ...s.monitorCard, borderTopColor: '#d97706' }}>
              <div style={s.monitorTitle}>超声探头监测合格率</div>
              <div style={{ ...s.monitorValue, color: '#d97706' }}>85.7%</div>
              <div style={s.monitorUnit}>本月1处超标</div>
            </div>
            <div style={{ ...s.monitorCard, borderTopColor: '#16a34a' }}>
              <div style={s.monitorTitle}>手卫生依从率</div>
              <div style={{ ...s.monitorValue, color: '#16a34a' }}>{kpiData.handHygiene}%</div>
              <div style={s.monitorUnit}>目标 ≥90%</div>
            </div>
            <div style={{ ...s.monitorCard, borderTopColor: '#dc2626' }}>
              <div style={s.monitorTitle}>消毒液浓度监测</div>
              <div style={{ ...s.monitorValue, color: '#dc2626' }}>98.3%</div>
              <div style={s.monitorUnit}>1处浓度不足</div>
            </div>
            <div style={{ ...s.monitorCard, borderTopColor: '#7c3aed' }}>
              <div style={s.monitorTitle}>无菌物品合格率</div>
              <div style={{ ...s.monitorValue, color: '#7c3aed' }}>100%</div>
              <div style={s.monitorUnit}>持续达标</div>
            </div>
          </div>

          {/* 监测趋势图 */}
          <div style={s.chartCard}>
            <div style={s.chartTitle}>
              <TrendingUp size={16} color="#dc2626" />
              环境监测合格率趋势
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={[
                { month: '1月', pass: 94.2, target: 95 },
                { month: '2月', pass: 95.8, target: 95 },
                { month: '3月', pass: 93.5, target: 95 },
                { month: '4月', pass: 96.1, target: 95 },
                { month: '5月', pass: 95.8, target: 95 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis domain={[90, 100]} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip />
                <ReferenceLine y={95} stroke="#dc2626" strokeDasharray="5 5" label="目标值" />
                <Line type="monotone" dataKey="pass" name="合格率(%)" stroke="#dc2626" strokeWidth={2} dot={{ fill: '#dc2626' }} />
                <Line type="monotone" dataKey="target" name="目标(%)" stroke="#94a3b8" strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* 环境监测表格 */}
          <table style={{ ...s.table, marginTop: 16 }}>
            <thead>
              <tr>
                <th style={s.th}>编号</th>
                <th style={s.th}>监测地点</th>
                <th style={s.th}>区域类型</th>
                <th style={s.th}>采样日期</th>
                <th style={s.th}>采样类型</th>
                <th style={s.th}>监测指标</th>
                <th style={s.th}>菌落计数</th>
                <th style={s.th}>标准值</th>
                <th style={s.th}>检测人</th>
                <th style={s.th}>结果</th>
                <th style={s.th}>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredEnvironments.map(item => (
                <tr key={item.id}>
                  <td style={s.td}>{item.id}</td>
                  <td style={s.td}>{item.location}</td>
                  <td style={s.td}>{item.locationType}</td>
                  <td style={s.td}>{item.sampleDate}</td>
                  <td style={s.td}>{item.sampleType}</td>
                  <td style={s.td}>{item.targetGerm}</td>
                  <td style={s.td}>{item.colonyCount}</td>
                  <td style={s.td}>{item.standard}</td>
                  <td style={s.td}>{item.tester}</td>
                  <td style={s.td}>{renderBadge(item.result, item.result)}</td>
                  <td style={s.td}>
                    <div style={s.actions}>
                      <button style={{ ...s.btnSecondary, padding: '4px 8px' }} onClick={() => setSelectedItem(item)}>
                        <Eye size={14} />
                      </button>
                      <button style={{ ...s.btnSecondary, padding: '4px 8px' }} onClick={() => {}}>
                        <Edit2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* ========== Tab 4: 消毒监测 ========== */}
      {activeTab === 'disinfection' && (
        <>
          <div style={s.toolbar}>
            <div style={s.searchBox}>
              <Search size={16} color="#94a3b8" />
              <input style={s.searchInput} placeholder="搜索探头编号/名称..." />
            </div>
            <select style={s.select}>
              <option>全部类型</option>
              <option>高水平消毒</option>
              <option>灭菌</option>
            </select>
            <select style={s.select}>
              <option>全部结果</option>
              <option>合格</option>
              <option>不合格</option>
            </select>
            <button style={s.btnSecondary} onClick={() => {}}>
              <RefreshCw size={14} /> 刷新
            </button>
            <button style={s.btnPrimary} onClick={() => {}}>
              <Plus size={14} /> 新增记录
            </button>
          </div>

          {/* 消毒监测统计 */}
          <div style={s.statRow}>
            <div style={s.statCard}>
              <span style={s.statLabel}>本月消毒次数</span>
              <span style={{ ...s.statValue, color: '#1d4ed8' }}>286</span>
            </div>
            <div style={s.statCard}>
              <span style={s.statLabel}>合格率</span>
              <span style={{ ...s.statValue, color: '#16a34a' }}>{kpiData.disinfectionRate}%</span>
            </div>
            <div style={s.statCard}>
              <span style={s.statLabel}>灭菌处理</span>
              <span style={s.statValue}>42</span>
            </div>
            <div style={s.statCard}>
              <span style={s.statLabel}>消毒液更换频次</span>
              <span style={s.statValue}>2次/日</span>
            </div>
          </div>

          {/* 消毒流程卡片 */}
          <div style={{ ...s.chartCard, marginBottom: 16 }}>
            <div style={s.chartTitle}>
              <Droplets size={16} color="#1d4ed8" />
              超声探头洗消流程监控
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
              {[
                { step: '预处理', rate: 99.5, color: '#16a34a' },
                { step: '清洗', rate: 98.8, color: '#16a34a' },
                { step: '高水平消毒', rate: 99.2, color: '#16a34a' },
                { step: '干燥', rate: 97.5, color: '#d97706' },
                { step: '储存', rate: 96.8, color: '#d97706' },
                { step: '发放', rate: 99.9, color: '#16a34a' },
              ].map(item => (
                <div key={item.step} style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: 13, color: '#64748b', marginBottom: 6 }}>{item.step}</div>
                  <div style={{
                    height: 8, borderRadius: 4, background: '#f1f5f9', overflow: 'hidden', marginBottom: 4,
                  }}>
                    <div style={{ height: '100%', width: `${item.rate}%`, background: item.color, borderRadius: 4 }} />
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: item.color }}>{item.rate}%</div>
                </div>
              ))}
            </div>
          </div>

          {/* 消毒记录表格 */}
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>记录编号</th>
                <th style={s.th}>探头编号</th>
                <th style={s.th}>超声探头名称</th>
                <th style={s.th}>处理日期</th>
                <th style={s.th}>处理类型</th>
                <th style={s.th}>消毒剂</th>
                <th style={s.th}>浓度</th>
                <th style={s.th}>作用时间</th>
                <th style={s.th}>温度</th>
                <th style={s.th}>批次号</th>
                <th style={s.th}>操作人</th>
                <th style={s.th}>结果</th>
              </tr>
            </thead>
            <tbody>
              {[
                { id: 'D001', endoscopeId: 'ES-001', endoscopeName: 'GIF-HQ290(1号)', processDate: '2024-05-15', processType: '高水平消毒', disinfectant: '邻苯二甲醛', concentration: '0.55%', exposureTime: '12min', temperature: '25°C', batchNo: 'GL20240501', operator: '张晓燕', result: '合格' },
                { id: 'D002', endoscopeId: 'ES-002', endoscopeName: 'CF-HQ290L(2号)', processDate: '2024-05-15', processType: '灭菌', disinfectant: '过氧乙酸', concentration: '1800mg/L', exposureTime: '30min', temperature: '50°C', batchNo: 'GA20240502', operator: '王丽娟', result: '合格' },
                { id: 'D003', endoscopeId: 'ES-003', endoscopeName: 'BF-1TQ290(3号)', processDate: '2024-05-15', processType: '高水平消毒', disinfectant: '邻苯二甲醛', concentration: '0.52%', exposureTime: '10min', temperature: '24°C', batchNo: 'GL20240501', operator: '李秀英', result: '不合格' },
                { id: 'D004', endoscopeId: 'ES-001', endoscopeName: 'GIF-HQ290(1号)', processDate: '2024-05-14', processType: '高水平消毒', disinfectant: '邻苯二甲醛', concentration: '0.56%', exposureTime: '12min', temperature: '26°C', batchNo: 'GL20240501', operator: '陈建国', result: '合格' },
                { id: 'D005', endoscopeId: 'ES-004', endoscopeName: 'JF-TF260(4号)', processDate: '2024-05-14', processType: '灭菌', disinfectant: '过氧乙酸', concentration: '1850mg/L', exposureTime: '30min', temperature: '52°C', batchNo: 'GA20240501', operator: '刘建军', result: '合格' },
              ].map(item => (
                <tr key={item.id}>
                  <td style={s.td}>{item.id}</td>
                  <td style={s.td}>{item.endoscopeId}</td>
                  <td style={s.td}>{item.endoscopeName}</td>
                  <td style={s.td}>{item.processDate}</td>
                  <td style={s.td}>{item.processType}</td>
                  <td style={s.td}>{item.disinfectant}</td>
                  <td style={s.td}>{item.concentration}</td>
                  <td style={s.td}>{item.exposureTime}</td>
                  <td style={s.td}>{item.temperature}</td>
                  <td style={s.td}>{item.batchNo}</td>
                  <td style={s.td}>{item.operator}</td>
                  <td style={s.td}>{renderBadge(item.result, item.result)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* ========== Tab 5: 统计分析 ========== */}
      {activeTab === 'statistics' && (
        <>
          <div style={s.toolbar}>
            <select style={s.select}>
              <option>2024年</option>
              <option>2023年</option>
            </select>
            <select style={s.select}>
              <option>全年度</option>
              <option>Q1</option>
              <option>Q2</option>
            </select>
            <button style={s.btnSecondary} onClick={() => {}}>
              <BarChart3 size={14} /> 导出报表
            </button>
          </div>

          {/* 综合统计图 */}
          <div style={s.chartRow}>
            <div style={s.chartCard}>
              <div style={s.chartTitle}>
                <Activity size={16} color="#dc2626" />
                月度感染病例趋势
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={kpiData.monthlyInfections}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" name="感染病例" stroke="#dc2626" strokeWidth={2} dot={{ fill: '#dc2626' }} />
                  <Line type="monotone" dataKey="severe" name="重症病例" stroke="#ea580c" strokeWidth={2} dot={{ fill: '#ea580c' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div style={s.chartCard}>
              <div style={s.chartTitle}>
                <ShieldAlert size={16} color="#d97706" />
                职业暴露月度统计
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={[
                  { month: '1月', count: 2 },
                  { month: '2月', count: 2 },
                  { month: '3月', count: 3 },
                  { month: '4月', count: 4 },
                  { month: '5月', count: 4 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip />
                  <Bar dataKey="count" name="暴露次数" fill="#d97706" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 感染部位分布 */}
          <div style={s.chartRow}>
            <div style={s.chartCard}>
              <div style={s.chartTitle}>
                <User size={16} color="#7c3aed" />
                感染部位分布
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={[
                  { name: '下消化道', count: 8 },
                  { name: '上消化道', count: 6 },
                  { name: '呼吸道', count: 4 },
                  { name: '胆道', count: 1 },
                  { name: '腹腔', count: 1 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip />
                  <Bar dataKey="count" name="病例数" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={s.chartCard}>
              <div style={s.chartTitle}>
                <Wind size={16} color="#1d4ed8" />
                环境监测合格率
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={[
                  { month: '1月', pass: 94.2 },
                  { month: '2月', pass: 95.8 },
                  { month: '3月', pass: 93.5 },
                  { month: '4月', pass: 96.1 },
                  { month: '5月', pass: 95.8 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis domain={[90, 100]} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip />
                  <ReferenceLine y={95} stroke="#dc2626" strokeDasharray="5 5" label="标准" />
                  <Line type="monotone" dataKey="pass" name="合格率(%)" stroke="#1d4ed8" strokeWidth={2} dot={{ fill: '#1d4ed8' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 汇总指标 */}
          <div style={s.statRow}>
            <div style={s.statCard}>
              <span style={s.statLabel}>年度感染率</span>
              <span style={{ ...s.statValue, color: '#dc2626' }}>0.82‰</span>
            </div>
            <div style={s.statCard}>
              <span style={s.statLabel}>手术相关感染率</span>
              <span style={{ ...s.statValue, color: '#d97706' }}>1.2%</span>
            </div>
            <div style={s.statCard}>
              <span style={s.statLabel}>手卫生依从率</span>
              <span style={{ ...s.statValue, color: '#16a34a' }}>{kpiData.handHygiene}%</span>
            </div>
            <div style={s.statCard}>
              <span style={s.statLabel}>环境监测综合合格率</span>
              <span style={{ ...s.statValue, color: '#16a34a' }}>{environmentPassRate}%</span>
            </div>
          </div>
        </>
      )}

      {/* 详情模态框 */}
      {selectedItem && (
        <div style={s.modal} onClick={() => setSelectedItem(null)}>
          <div style={s.modalContent} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <span style={s.modalTitle}>详情信息</span>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setSelectedItem(null)}>
                <X size={20} color="#64748b" />
              </button>
            </div>
            <div style={s.detailGrid}>
              {'patientName' in selectedItem && (
                <>
                  <div style={s.detailItem}><span style={s.detailLabel}>患者姓名</span><span style={s.detailValue}>{selectedItem.patientName}</span></div>
                  <div style={s.detailItem}><span style={s.detailLabel}>患者ID</span><span style={s.detailValue}>{selectedItem.patientId}</span></div>
                  <div style={s.detailItem}><span style={s.detailLabel}>使用超声探头</span><span style={s.detailValue}>{selectedItem.endoscope}</span></div>
                  <div style={s.detailItem}><span style={s.detailLabel}>操作项目</span><span style={s.detailValue}>{selectedItem.procedure}</span></div>
                  <div style={s.detailItem}><span style={s.detailLabel}>感染类型</span><span style={s.detailValue}>{selectedItem.infectionType}</span></div>
                  <div style={s.detailItem}><span style={s.detailLabel}>严重程度</span><span style={s.detailValue}>{selectedItem.severity}</span></div>
                  <div style={s.detailItem}><span style={s.detailLabel}>确诊日期</span><span style={s.detailValue}>{selectedItem.confirmedDate}</span></div>
                  <div style={s.detailItem}><span style={s.detailLabel}>科室</span><span style={s.detailValue}>{selectedItem.department}</span></div>
                  <div style={s.detailItem}><span style={s.detailLabel}>主治医生</span><span style={s.detailValue}>{selectedItem.doctor}</span></div>
                  <div style={s.detailItem}><span style={s.detailLabel}>状态</span><span style={s.detailValue}>{selectedItem.status}</span></div>
                  <div style={s.detailItem}><span style={s.detailLabel}>转归</span><span style={s.detailValue}>{selectedItem.outcomes}</span></div>
                  <div style={s.detailItem}><span style={s.detailLabel}>备注</span><span style={s.detailValue}>{selectedItem.notes}</span></div>
                </>
              )}
              {'staffName' in selectedItem && (
                <>
                  <div style={s.detailItem}><span style={s.detailLabel}>姓名</span><span style={s.detailValue}>{selectedItem.staffName}</span></div>
                  <div style={s.detailItem}><span style={s.detailLabel}>工号</span><span style={s.detailValue}>{selectedItem.staffId}</span></div>
                  <div style={s.detailItem}><span style={s.detailLabel}>科室</span><span style={s.detailValue}>{selectedItem.department}</span></div>
                  <div style={s.detailItem}><span style={s.detailLabel}>暴露类型</span><span style={s.detailValue}>{selectedItem.exposureType}</span></div>
                  <div style={s.detailItem}><span style={s.detailLabel}>暴露源</span><span style={s.detailValue}>{selectedItem.sourcePatient}</span></div>
                  <div style={s.detailItem}><span style={s.detailLabel}>暴露日期</span><span style={s.detailValue}>{selectedItem.exposureDate}</span></div>
                  <div style={s.detailItem}><span style={s.detailLabel}>暴露途径</span><span style={s.detailValue}>{selectedItem.exposureRoute}</span></div>
                  <div style={s.detailItem}><span style={s.detailLabel}>严重程度</span><span style={s.detailValue}>{selectedItem.severity}</span></div>
                  <div style={s.detailItem}><span style={s.detailLabel}>紧急处理</span><span style={s.detailValue}>{selectedItem.immediateAction}</span></div>
                  <div style={s.detailItem}><span style={s.detailLabel}>报告人</span><span style={s.detailValue}>{selectedItem.reporter}</span></div>
                  <div style={s.detailItem}><span style={s.detailLabel}>报告日期</span><span style={s.detailValue}>{selectedItem.reportDate}</span></div>
                  <div style={s.detailItem}><span style={s.detailLabel}>状态</span><span style={s.detailValue}>{selectedItem.status}</span></div>
                  {selectedItem.hbvResult && <div style={s.detailItem}><span style={s.detailLabel}>HBV结果</span><span style={s.detailValue}>{selectedItem.hbvResult}</span></div>}
                  {selectedItem.hcvResult && <div style={s.detailItem}><span style={s.detailLabel}>HCV结果</span><span style={s.detailValue}>{selectedItem.hcvResult}</span></div>}
                  {selectedItem.hivResult && <div style={s.detailItem}><span style={s.detailLabel}>HIV结果</span><span style={s.detailValue}>{selectedItem.hivResult}</span></div>}
                </>
              )}
              {'location' in selectedItem && (
                <>
                  <div style={s.detailItem}><span style={s.detailLabel}>监测地点</span><span style={s.detailValue}>{selectedItem.location}</span></div>
                  <div style={s.detailItem}><span style={s.detailLabel}>区域类型</span><span style={s.detailValue}>{selectedItem.locationType}</span></div>
                  <div style={s.detailItem}><span style={s.detailLabel}>采样日期</span><span style={s.detailValue}>{selectedItem.sampleDate}</span></div>
                  <div style={s.detailItem}><span style={s.detailLabel}>采样类型</span><span style={s.detailValue}>{selectedItem.sampleType}</span></div>
                  <div style={s.detailItem}><span style={s.detailLabel}>监测指标</span><span style={s.detailValue}>{selectedItem.targetGerm}</span></div>
                  <div style={s.detailItem}><span style={s.detailLabel}>菌落计数</span><span style={s.detailValue}>{selectedItem.colonyCount}</span></div>
                  <div style={s.detailItem}><span style={s.detailLabel}>标准值</span><span style={s.detailValue}>{selectedItem.standard}</span></div>
                  <div style={s.detailItem}><span style={s.detailLabel}>检测人</span><span style={s.detailValue}>{selectedItem.tester}</span></div>
                  <div style={s.detailItem}><span style={s.detailLabel}>结果</span><span style={s.detailValue}>{selectedItem.result}</span></div>
                  <div style={s.detailItem}><span style={s.detailLabel}>备注</span><span style={s.detailValue}>{selectedItem.remarks}</span></div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
