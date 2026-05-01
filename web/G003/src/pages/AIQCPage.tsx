// ============================================================
// G003 超声RIS系统 - AI智能质控中心页面（完整增强版）
// 图像质量自动评分 · 22张图片标准检测 · 质控指标仪表盘 · 质控统计报表
// ============================================================
import React, { useState, useMemo, useCallback } from 'react'
import {
  Shield, AlertTriangle, CheckCircle, Award, Activity, Calendar,
  Filter, Download, ChevronRight, Clock, Image, FileText, TrendingUp,
  User, BarChart3, PieChart, Play, Pause, RotateCw, Settings,
  Brain, Camera, Zap, Eye, Edit3, Trash2, Plus, Search, Bell,
  Wifi, WifiOff, RefreshCw, X, Check, Info, AlertOctagon,
  Target, Radio, Layers, Cpu, HardDrive, Gauge, Upload,
  VideoOff, FileSearch, BrainCircuit, TrendingDown, CheckSquare,
  CameraOff, Contrast, Layers2,
  BarChart, ArrowUp, ArrowDown, EyeOff, FileCheck, ClipboardList
} from 'lucide-react'
// ========== 常量与类型 ==========
type TabKey = 'realtime' | 'history' | 'scoring' | 'models' | 'dashboard' | 'reports'

interface ImageQCResult {
  id: string
  name: string
  clarity: number    // 清晰度 0-100
  brightness: number  // 亮度 0-100
  coverage: number   // 覆盖度 0-100
  overall: number    // 综合评分 0-100
  issues: string[]   // 问题列表
}

interface StandardPhotoItem {
  id: string
  name: string
  description: string
  required: boolean
  captured: boolean
  quality: 'good' | 'fair' | 'poor' | 'missing'
  thumbnail?: string
}

interface QCPhotoStandard {
  examType: string
  totalRequired: number
  items: StandardPhotoItem[]
}

interface Detection {
  id: string
  frame: number
  type: 'polyp' | 'lesion' | 'bleeding' | 'inflammation' | 'other'
  confidence: number
  x: number
  y: number
  width: number
  height: number
}

interface CADeRecord {
  id: number
  patientName: string
  examType: string
  startTime: string
  status: 'detecting' | 'completed' | 'alert'
  detections: Detection[]
  progress: number
  imageCount: number
  requiredImages: number
  withdrawalTime: number
  requiredTime: number
  aiScore: number
}

interface HistoryRecord {
  id: number
  date: string
  patientName: string
  examType: string
  score: number
  grade: string
  aiSuggestion: string
  doctor: string
  reportTimeliness: number
  imageStandard: number
  withdrawalTime: number
}

interface QCScoring {
  id: number
  patientName: string
  examType: string
  imageQuality: number
  clarity: number
  brightness: number
  coverage: number
  examCompleteness: number
  operationStandard: number
  reportStandard: number
  totalScore: number
  deductions: Deduction[]
}

interface Deduction {
  item: string
  points: number
  reason: string
}

interface AIModel {
  id: string
  name: string
  version: string
  type: 'cade' | 'jmanbi' | 'bbps' | 'report' | 'imageqc' | 'other'
  description: string
  status: 'active' | 'training' | 'inactive'
  accuracy: number
  precision: number
  recall: number
  detections: number
  lastUpdated: string
}

interface QCIndicator {
  key: string
  label: string
  value: number
  unit: string
  target: number
  trend: number[]
  status: 'excellent' | 'good' | 'warning' | 'danger'
}

interface QCIssue {
  id: string
  patientName: string
  examType: string
  date: string
  issueType: string
  severity: 'high' | 'medium' | 'low'
  description: string
  suggestion: string
  status: 'pending' | 'resolved' | 'ignored'
}

// ========== 22张图片标准数据 ==========
const GASTROSCOPY_STANDARD: QCPhotoStandard = {
  examType: '电子胃镜检查',
  totalRequired: 22,
  items: [
    { id: 'G01', name: '食道上段', description: '距门齿约15-20cm，吸气相', required: true, captured: false, quality: 'missing' },
    { id: 'G02', name: '食道中段', description: '距门齿约25-30cm', required: true, captured: false, quality: 'missing' },
    { id: 'G03', name: '食道下段', description: '距门齿约35-38cm', required: true, captured: false, quality: 'missing' },
    { id: 'G04', name: '齿状线（Z线）', description: '清晰显示Z线位置', required: true, captured: false, quality: 'missing' },
    { id: 'G05', name: '胃底（倒镜）', description: '倒镜观察胃底', required: true, captured: false, quality: 'missing' },
    { id: 'G06', name: '胃底黏液湖', description: '观察黏液湖性状', required: true, captured: false, quality: 'missing' },
    { id: 'G07', name: '胃体上部', description: '倒镜观察胃体上部', required: true, captured: false, quality: 'missing' },
    { id: 'G08', name: '胃体中部', description: '观察胃体中部大弯', required: true, captured: false, quality: 'missing' },
    { id: 'G09', name: '胃体下部', description: '观察胃体下部', required: true, captured: false, quality: 'missing' },
    { id: 'G10', name: '胃角（正面）', description: '清晰显示胃角形态', required: true, captured: false, quality: 'missing' },
    { id: 'G11', name: '胃角（远景）', description: '显示胃角与周围关系', required: true, captured: false, quality: 'missing' },
    { id: 'G12', name: '胃窦（远景）', description: '显示胃窦全貌', required: true, captured: false, quality: 'missing' },
    { id: 'G13', name: '胃窦（近景）', description: '近距观察胃窦黏膜', required: true, captured: false, quality: 'missing' },
    { id: 'G14', name: '幽门（开放）', description: '幽门管开放状态', required: true, captured: false, quality: 'missing' },
    { id: 'G15', name: '幽门（关闭）', description: '幽门管关闭状态', required: true, captured: false, quality: 'missing' },
    { id: 'G16', name: '十二指肠球部', description: '显示十二指肠球部', required: true, captured: false, quality: 'missing' },
    { id: 'G17', name: '十二指肠降部', description: '显示十二指肠降部', required: true, captured: false, quality: 'missing' },
    { id: 'G18', name: '后壁位（胃体）', description: '胃体后壁', required: false, captured: false, quality: 'missing' },
    { id: 'G19', name: '小弯位（胃体）', description: '胃体小弯', required: false, captured: false, quality: 'missing' },
    { id: 'G20', name: '病变部位1', description: '如有病变需特写', required: false, captured: false, quality: 'missing' },
    { id: 'G21', name: '病变部位2', description: '如有病变需特写', required: false, captured: false, quality: 'missing' },
    { id: 'G22', name: 'NBI/色素染色', description: '特殊检查（如有）', required: false, captured: false, quality: 'missing' },
  ],
}

const COLONOSCOPY_STANDARD: QCPhotoStandard = {
  examType: '电子结肠镜检查',
  totalRequired: 22,
  items: [
    { id: 'C01', name: '肛管', description: '观察肛管病变', required: true, captured: false, quality: 'missing' },
    { id: 'C02', name: '直肠（远景）', description: '直肠全貌', required: true, captured: false, quality: 'missing' },
    { id: 'C03', name: '直肠（近景）', description: '直肠黏膜', required: true, captured: false, quality: 'missing' },
    { id: 'C04', name: '直肠乙状结肠交界', description: '观察交界处', required: true, captured: false, quality: 'missing' },
    { id: 'C05', name: '乙状结肠（近景）', description: '乙状结肠黏膜', required: true, captured: false, quality: 'missing' },
    { id: 'C06', name: '乙状结肠（远景）', description: '乙状结肠全貌', required: true, captured: false, quality: 'missing' },
    { id: 'C07', name: '降结肠', description: '降结肠黏膜', required: true, captured: false, quality: 'missing' },
    { id: 'C08', name: '脾曲', description: '脾曲通过', required: true, captured: false, quality: 'missing' },
    { id: 'C09', name: '横结肠（近景）', description: '横结肠黏膜', required: true, captured: false, quality: 'missing' },
    { id: 'C10', name: '横结肠（远景）', description: '横结肠全貌', required: true, captured: false, 'quality': 'missing' },
    { id: 'C11', name: '肝曲', description: '肝曲通过', required: true, captured: false, quality: 'missing' },
    { id: 'C12', name: '升结肠', description: '升结肠黏膜', required: true, captured: false, quality: 'missing' },
    { id: 'C13', name: '盲肠', description: '盲肠黏膜', required: true, captured: false, quality: 'missing' },
    { id: 'C14', name: '回盲瓣（正面）', description: '清晰显示回盲瓣', required: true, captured: false, quality: 'missing' },
    { id: 'C15', name: '回肠末段', description: '回肠末段黏膜', required: true, captured: false, quality: 'missing' },
    { id: 'C16', name: '阑尾开口', description: '阑尾开口位置', required: true, captured: false, quality: 'missing' },
    { id: 'C17', name: '退镜观察（直肠）', description: '退镜时直肠观察', required: true, captured: false, quality: 'missing' },
    { id: 'C18', name: '退镜观察（乙状）', description: '退镜时乙状结肠', required: true, captured: false, quality: 'missing' },
    { id: 'C19', name: 'BBPS评分图像', description: 'BBPS评分部位', required: false, captured: false, quality: 'missing' },
    { id: 'C20', name: '病变部位1', description: '如有病变需特写', required: false, captured: false, quality: 'missing' },
    { id: 'C21', name: '病变部位2', description: '如有病变需特写', required: false, captured: false, quality: 'missing' },
    { id: 'C22', name: '染色/NBI图像', description: '特殊检查（如有）', required: false, captured: false, quality: 'missing' },
  ],
}

const EUS_STANDARD: QCPhotoStandard = {
  examType: '超声超声检查（EUS）',
  totalRequired: 18,
  items: [
    { id: 'E01', name: '探查部位1', description: '超声探头探查位置', required: true, captured: false, quality: 'missing' },
    { id: 'E02', name: '探查部位2', description: '第二个探查位置', required: true, captured: false, quality: 'missing' },
    { id: 'E03', name: '病变部位1', description: '病变部位超声图像', required: true, captured: false, quality: 'missing' },
    { id: 'E04', name: '病变测量1', description: '病变大小测量', required: true, captured: false, quality: 'missing' },
    { id: 'E05', name: 'Doppler模式', description: '血流显示（如适用）', required: false, captured: false, quality: 'missing' },
    { id: 'E06', name: 'CEUS模式', description: '造影增强（如适用）', required: false, captured: false, quality: 'missing' },
    { id: 'E07', name: 'EUS-FNA穿刺', description: '细针穿刺（如适用）', required: false, captured: false, quality: 'missing' },
    { id: 'E08', name: '淋巴结评估', description: '淋巴结超声评估', required: true, captured: false, quality: 'missing' },
    { id: 'E09', name: '层面1', description: '标准层面图像', required: true, captured: false, quality: 'missing' },
    { id: 'E10', name: '层面2', description: '标准层面图像', required: true, captured: false, quality: 'missing' },
    { id: 'E11', name: '层面3', description: '标准层面图像', required: true, captured: false, quality: 'missing' },
    { id: 'E12', name: '层间关系', description: '与周围结构关系', required: true, captured: false, quality: 'missing' },
    { id: 'E13', name: '毗邻结构', description: '周围血管/器官', required: true, captured: false, quality: 'missing' },
    { id: 'E14', name: '腔道形态', description: '管腔形态评估', required: false, captured: false, quality: 'missing' },
    { id: 'E15', name: '对比增强', description: '造影增强（如适用）', required: false, captured: false, quality: 'missing' },
    { id: 'E16', name: '弹性成像', description: '弹性成像（如适用）', required: false, captured: false, quality: 'missing' },
    { id: 'E17', name: '实时图像', description: '动态采集（如适用）', required: false, captured: false, quality: 'missing' },
    { id: 'E18', name: '报告附图', description: '关键图像存档', required: true, captured: false, quality: 'missing' },
  ],
}

// ========== Mock 数据 ==========
const generateHistoryRecords = (): HistoryRecord[] => {
  const patients = ['张伟', '王芳', '李明', '刘洋', '陈静', '杨帆', '赵雷', '周婷', '吴强', '郑鑫',
                     '孙鹏', '马云', '李娜', '王磊', '刘芳', '陈刚', '周洋', '吴琳', '郑浩', '冯雪',
                     '许志明', '邓丽华', '梁志强', '肖娜', '朱红梅', '秦建国', '薛丽娜', '贺明', '谭志远', '卢晓峰']
  const types = ['胃镜', '肠镜', 'EUS']
  const suggestions = [
    '建议加强退镜时间把控',
    '图片采集数量需达标',
    'JMANBI评分应完整填写',
    '操作规范符合要求',
    '报告书写需更规范',
    '黏膜下注射量充足',
    '标记点间距合理',
    '剥离层次清晰',
    '图像清晰度需提升',
    '覆盖度不足，需补充拍摄',
  ]
  const doctors = ['李建国', '王秀英', '张志远', '刘德明', '陈晓燕', '赵文博', '陈晓峰']

  return Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    date: `2026-04-${String(30 - (i % 30)).padStart(2, '0')}`,
    patientName: patients[i % patients.length],
    examType: types[i % types.length],
    score: Math.floor(Math.random() * 20) + 80,
    grade: ['优秀', '良好', '合格', '不合格'][i % 4] as string,
    aiSuggestion: suggestions[i % suggestions.length],
    doctor: doctors[i % doctors.length],
    reportTimeliness: Math.floor(Math.random() * 15) + 85,
    imageStandard: Math.floor(Math.random() * 20) + 78,
    withdrawalTime: Math.floor(Math.random() * 25) + 65,
  }))
}

const generateScoringRecords = (): QCScoring[] => {
  const patients = ['张伟', '王芳', '李明', '刘洋', '陈静', '杨帆', '赵雷', '周婷', '吴强', '郑鑫',
                     '孙鹏', '马云', '李娜', '王磊', '刘芳']
  const types = ['胃镜', '肠镜', 'EUS']
  const deductionItems = [
    { item: '图片数量不足', points: 2 },
    { item: '退镜时间不足', points: 3 },
    { item: 'JMANBI未评分', points: 5 },
    { item: '图片质量欠佳', points: 2 },
    { item: '报告迟交', points: 2 },
    { item: 'Photo-Documentation缺失', points: 3 },
    { item: '清晰度不达标', points: 2 },
    { item: '亮度异常', points: 1 },
    { item: '覆盖度不足', points: 2 },
  ]

  return Array.from({ length: 30 }, (_, i) => {
    const deductionCount = Math.floor(Math.random() * 3)
    const deductions = Array.from({ length: deductionCount }, () => {
      const d = deductionItems[Math.floor(Math.random() * deductionItems.length)]
      return { ...d, reason: `${d.item}，扣${d.points}分` }
    })
    const totalDeduction = deductions.reduce((sum, d) => sum + d.points, 0)
    const clarity = Math.floor(Math.random() * 15) + 85
    const brightness = Math.floor(Math.random() * 20) + 80
    const coverage = Math.floor(Math.random() * 15) + 80

    return {
      id: i + 1,
      patientName: patients[i % patients.length],
      examType: types[i % types.length],
      imageQuality: Math.floor(Math.random() * 15) + 85,
      clarity,
      brightness,
      coverage,
      examCompleteness: Math.floor(Math.random() * 15) + 85,
      operationStandard: Math.floor(Math.random() * 15) + 85,
      reportStandard: Math.floor(Math.random() * 15) + 85,
      totalScore: 100 - totalDeduction,
      deductions,
    }
  })
}

const generateImageQCResults = (): ImageQCResult[] => {
  return Array.from({ length: 8 }, (_, i) => {
    const clarity = Math.floor(Math.random() * 30) + 70
    const brightness = Math.floor(Math.random() * 25) + 75
    const coverage = Math.floor(Math.random() * 20) + 78
    const overall = Math.round(clarity * 0.4 + brightness * 0.3 + coverage * 0.3)
    const issues: string[] = []
    if (clarity < 80) issues.push('清晰度欠佳')
    if (brightness < 75) issues.push('亮度不足')
    if (brightness > 95) issues.push('亮度过度')
    if (coverage < 80) issues.push('视野覆盖不全')
    return {
      id: `IQ_${i + 1}`,
      name: `图像${i + 1}.jpg`,
      clarity,
      brightness,
      coverage,
      overall,
      issues,
    }
  })
}

const aiModels: AIModel[] = [
  {
    id: 'model-1', name: 'CADe-PolypNet', version: 'v3.2.1', type: 'cade',
    description: '息肉检测深度学习模型，基于ResNet50骨干网络训练，在超声视频中实时检测可疑息肉病变',
    status: 'active', accuracy: 94.5, precision: 92.8, recall: 96.2, detections: 15420, lastUpdated: '2026-04-25',
  },
  {
    id: 'model-2', name: 'JMANBI-Scorer', version: 'v2.1.0', type: 'jmanbi',
    description: '胃镜黏膜下肿瘤分期评分模型，自动评估JMANBI分期指标并给出评分建议',
    status: 'active', accuracy: 88.3, precision: 85.6, recall: 91.1, detections: 8930, lastUpdated: '2026-04-20',
  },
  {
    id: 'model-3', name: 'BBPS-Analyser', version: 'v1.8.5', type: 'bbps',
    description: '肠镜BBPS评分分析模型，自动评估肠道准备质量和BBPS分项得分',
    status: 'active', accuracy: 91.2, precision: 89.5, recall: 93.0, detections: 6780, lastUpdated: '2026-04-18',
  },
  {
    id: 'model-4', name: 'Report-Generator', version: 'v4.0.2', type: 'report',
    description: '智能报告生成模型，基于检查结果和图像分析自动生成结构化报告草稿',
    status: 'active', accuracy: 87.5, precision: 84.2, recall: 90.8, detections: 12350, lastUpdated: '2026-04-22',
  },
  {
    id: 'model-5', name: 'ImageQC-Inspector', version: 'v2.3.0', type: 'imageqc',
    description: '超声图像质量评估模型，自动评估清晰度、亮度、覆盖度三项指标并给出综合评分',
    status: 'active', accuracy: 92.1, precision: 89.7, recall: 94.5, detections: 45200, lastUpdated: '2026-04-28',
  },
  {
    id: 'model-6', name: 'Bleeding-Detector', version: 'v2.0.1', type: 'other',
    description: '术中出血检测模型，实时监测超声操作过程中的出血情况并及时预警',
    status: 'training', accuracy: 89.1, precision: 86.7, recall: 91.5, detections: 4520, lastUpdated: '2026-04-28',
  },
  {
    id: 'model-7', name: 'Lesion-Segmentation', version: 'v1.5.3', type: 'other',
    description: '病变区域分割模型，自动标注超声图像中的可疑病变区域范围',
    status: 'inactive', accuracy: 85.6, precision: 83.1, recall: 88.2, detections: 3210, lastUpdated: '2026-04-10',
  },
]

const QC_INDICATORS: QCIndicator[] = [
  { key: 'reportTimeliness', label: '报告及时率', value: 94.2, unit: '%', target: 95, trend: [90, 91, 89, 92, 93, 94, 93, 94, 94, 95, 94, 94], status: 'good' },
  { key: 'imageStandard', label: '图像达标率', value: 87.6, unit: '%', target: 90, trend: [82, 83, 84, 85, 86, 86, 87, 87, 88, 87, 88, 88], status: 'warning' },
  { key: 'withdrawalTime', label: '退镜时间合格率', value: 78.3, unit: '%', target: 85, trend: [70, 72, 71, 74, 73, 75, 76, 77, 78, 78, 78, 78], status: 'danger' },
  { key: 'disinfection', label: '洗消合格率', value: 99.1, unit: '%', target: 99, trend: [98, 98, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99], status: 'excellent' },
  { key: 'criticalValue', label: '危急值上报率', value: 96.8, unit: '%', target: 98, trend: [94, 95, 95, 96, 96, 96, 97, 96, 97, 97, 97, 97], status: 'good' },
]

const QC_ISSUES: QCIssue[] = [
  { id: 'Q001', patientName: '王芳', examType: '肠镜', date: '2026-04-29', issueType: '图像不达标', severity: 'high', description: '退镜时间仅4分32秒，低于标准6分钟', suggestion: '加强退镜时间培训，使用计时器', status: 'pending' },
  { id: 'Q002', patientName: '李明', examType: '胃镜', date: '2026-04-29', issueType: '图片缺失', severity: 'medium', description: '缺少胃体上部图像', suggestion: '补充采集缺失体位图片', status: 'pending' },
  { id: 'Q003', patientName: '刘洋', examType: '肠镜', date: '2026-04-28', issueType: '清晰度不足', severity: 'medium', description: '图像清晰度评分低于80分', suggestion: '检查摄像头状态，清洁镜头', status: 'resolved' },
  { id: 'Q004', patientName: '陈静', examType: '胃镜', date: '2026-04-28', issueType: '报告迟交', severity: 'low', description: '报告提交时间超过24小时', suggestion: '优化报告书写流程', status: 'ignored' },
]

// ========== 样式定义 ==========
const s: Record<string, React.CSSProperties> = {
  pageWrapper: {
    display: 'flex', flexDirection: 'column', height: '100%', minHeight: '80vh',
    background: '#f0f4f8', padding: 20,
  },
  pageHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 16, flexShrink: 0,
  },
  title: { fontSize: 20, fontWeight: 700, color: '#1a3a5c', display: 'flex', alignItems: 'center', gap: 10, margin: 0 },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 4 },
  headerActions: { display: 'flex', gap: 10 },
  btnLarge: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 8,
    padding: '10px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(26,58,92,0.2)', minHeight: 44,
  },
  btnLargeSuccess: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8,
    padding: '10px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(22,163,74,0.2)', minHeight: 44,
  },
  btnLargeInfo: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8,
    padding: '10px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(37,99,235,0.2)', minHeight: 44,
  },
  btnLargeWarning: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    background: '#d97706', color: '#fff', border: 'none', borderRadius: 8,
    padding: '10px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(217,119,6,0.2)', minHeight: 44,
  },
  btnIcon: {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 6,
    padding: '8px 12px', fontSize: 12, cursor: 'pointer', minHeight: 36,
  },
  btnSuccess: {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    background: '#dcfce7', color: '#16a34a', border: 'none', borderRadius: 6,
    padding: '8px 12px', fontSize: 12, cursor: 'pointer', minHeight: 36,
  },
  btnWarning: {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    background: '#fef3c7', color: '#d97706', border: 'none', borderRadius: 6,
    padding: '8px 12px', fontSize: 12, cursor: 'pointer', minHeight: 36,
  },
  btnDanger: {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 6,
    padding: '8px 12px', fontSize: 12, cursor: 'pointer', minHeight: 36,
  },
  filterBar: {
    display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' as const,
    background: '#fff', padding: '12px 16px', borderRadius: 8,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: 12,
  },
  searchBox: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: '#f8fafc', border: '1px solid #e2e8f0',
    borderRadius: 6, padding: '8px 12px', flex: 1, minWidth: 200,
  },
  searchInput: {
    border: 'none', outline: 'none', background: 'transparent',
    fontSize: 13, color: '#334155', width: '100%',
  },
  select: {
    border: '1px solid #e2e8f0', borderRadius: 6, padding: '8px 12px',
    fontSize: 13, color: '#334155', background: '#f8fafc', outline: 'none', cursor: 'pointer',
  },
  fourColGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 16 },
  threeColGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 16 },
  twoColGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 },
  panel: {
    background: '#fff', borderRadius: 10, overflow: 'hidden',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column' as const,
  },
  panelHeader: {
    padding: '12px 16px', borderBottom: '1px solid #e2e8f0',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    background: '#f8fafc', flexShrink: 0,
  },
  panelTitle: { fontSize: 14, fontWeight: 700, color: '#1a3a5c', display: 'flex', alignItems: 'center', gap: 6, margin: 0 },
  panelBody: { padding: 16, overflowY: 'auto' as const, flex: 1 },
  tabNav: {
    display: 'flex', borderBottom: '1px solid #e2e8f0', padding: '0 16px', background: '#fff',
  },
  tabBtn: {
    padding: '14px 20px', border: 'none', background: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 500,
    color: '#64748b', borderBottom: '2px solid transparent', marginBottom: -1,
  },
  tabBtnActive: {
    padding: '14px 20px', border: 'none', background: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600,
    color: '#2563eb', borderBottom: '2px solid #2563eb', marginBottom: -1,
  },
  kpiCard: {
    background: '#fff', borderRadius: 12, padding: 20,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb',
  },
  kpiLabel: { fontSize: 13, color: '#64748b', margin: 0 },
  kpiValue: { fontSize: 28, fontWeight: 700, color: '#1f2937', margin: '8px 0 0 0' },
  kpiSub: { fontSize: 12, color: '#64748b', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: 4 },
  badge: {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 500,
  },
  badgeSuccess: { background: '#dcfce7', color: '#16a34a' },
  badgeWarning: { background: '#fef3c7', color: '#d97706' },
  badgeDanger: { background: '#fee2e2', color: '#dc2626' },
  badgeInfo: { background: '#dbeafe', color: '#2563eb' },
  badgePurple: { background: '#f3e8ff', color: '#7c3aed' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    background: '#f8fafc', padding: '10px 12px', textAlign: 'left' as const,
    fontSize: 12, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e2e8f0',
  },
  td: {
    padding: '10px 12px', fontSize: 13, color: '#334155', borderBottom: '1px solid #f1f5f9',
  },
  pagination: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 16px', background: '#fff', borderTop: '1px solid #e2e8f0',
  },
  pageInfo: { fontSize: 13, color: '#64748b' },
  pageBtns: { display: 'flex', gap: 4 },
  pageBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 36, height: 36, borderRadius: 6, border: '1px solid #e2e8f0',
    background: '#fff', cursor: 'pointer', fontSize: 13, color: '#475569',
  },
  pageBtnActive: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 36, height: 36, borderRadius: 6, border: '1px solid #2563eb',
    background: '#2563eb', cursor: 'pointer', fontSize: 13, color: '#fff',
  },
  emptyState: { textAlign: 'center' as const, padding: '48px 20px', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 12 },
  emptyIcon: { width: 72, height: 72, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  emptyText: { fontSize: 16, color: '#94a3b8', fontWeight: 500 },
  emptySubtext: { fontSize: 13, color: '#cbd5e1' },
  // CADe
  cadePanel: {
    background: '#1a1a2e', borderRadius: 10, padding: 16,
    display: 'flex', flexDirection: 'column', gap: 12,
  },
  cadeHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cadeTitle: { fontSize: 14, fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: 8, margin: 0 },
  cadeStatus: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#22c55e' },
  cadeStatusInactive: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#ef4444' },
  cadeView: {
    background: '#0f0f1a', borderRadius: 8, aspectRatio: '16/9',
    display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  cadeControls: { display: 'flex', gap: 8, justifyContent: 'center' },
  cadeStats: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 },
  cadeStat: { background: 'rgba(255,255,255,0.1)', borderRadius: 6, padding: '8px 12px', textAlign: 'center' as const },
  cadeStatLabel: { fontSize: 11, color: 'rgba(255,255,255,0.6)', margin: 0 },
  cadeStatValue: { fontSize: 18, fontWeight: 700, color: '#fff', margin: '4px 0 0 0' },
  // 模型卡片
  modelCard: {
    background: '#fff', borderRadius: 10, padding: 16,
    border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 12,
  },
  modelCardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  modelIcon: {
    width: 48, height: 48, borderRadius: 10,
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  modelName: { fontSize: 15, fontWeight: 600, color: '#1a3a5c', margin: 0 },
  modelVersion: { fontSize: 12, color: '#64748b', margin: '4px 0 0 0' },
  modelDesc: { fontSize: 13, color: '#475569', lineHeight: 1.5, margin: 0 },
  modelStats: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8,
    padding: '12px 0', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9',
  },
  modelStat: { textAlign: 'center' as const },
  modelStatValue: { fontSize: 16, fontWeight: 700, color: '#1a3a5c' },
  modelStatLabel: { fontSize: 11, color: '#64748b' },
  modelActions: { display: 'flex', gap: 8 },
  // 评分详情
  scoreDetail: { display: 'flex', flexDirection: 'column', gap: 12, padding: 16, background: '#f9fafb', borderRadius: 10, border: '1px solid #e5e7eb' },
  scoreRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  scoreLabel: { fontSize: 13, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 },
  scoreBar: { flex: 1, height: 8, background: '#e5e7eb', borderRadius: 4, margin: '0 12px', overflow: 'hidden' },
  scoreBarFill: { height: '100%', borderRadius: 4, transition: 'width 0.5s' },
  scoreValue: { fontSize: 14, fontWeight: 600, color: '#1a3a5c', minWidth: 40, textAlign: 'right' as const },
  // 图片质量
  imageQCCard: {
    background: '#fff', borderRadius: 8, padding: 12,
    border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: 8,
  },
  imageQCHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  imageQCThumb: {
    width: '100%', aspectRatio: '4/3', borderRadius: 6, background: '#f1f5f9',
    display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  imageQCProgress: { display: 'flex', flexDirection: 'column', gap: 4 },
  imageQCProgressRow: { display: 'flex', alignItems: 'center', gap: 8 },
  imageQCProgressLabel: { fontSize: 11, color: '#64748b', minWidth: 50 },
  imageQCProgressBar: { flex: 1, height: 6, background: '#e5e7eb', borderRadius: 3, overflow: 'hidden' },
  imageQCProgressFill: { height: '100%', borderRadius: 3, transition: 'width 0.3s' },
  imageQCProgressValue: { fontSize: 11, fontWeight: 600, minWidth: 30, textAlign: 'right' as const },
  // 22张图标准
  standardGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 },
  standardItem: {
    background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 8,
    padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 4,
  },
  standardItemRequired: { borderLeft: '3px solid #dc2626' },
  standardItemCaptured: { background: '#f0fdf4', border: '1px solid #86efac' },
  standardItemName: { fontSize: 12, fontWeight: 600, color: '#1a3a5c' },
  standardItemDesc: { fontSize: 10, color: '#94a3b8' },
  standardItemQuality: {
    display: 'inline-flex', alignItems: 'center', gap: 3,
    padding: '1px 6px', borderRadius: 8, fontSize: 10, fontWeight: 600,
  },
  // 仪表盘
  dashboardGrid: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 16 },
  dashboardCard: { background: '#fff', borderRadius: 12, padding: 18, border: '1px solid #e5e7eb' },
  dashboardCardTitle: { fontSize: 12, color: '#64748b', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 },
  dashboardCardValue: { fontSize: 24, fontWeight: 800, margin: '4px 0' },
  dashboardCardSub: { fontSize: 11, color: '#94a3b8' },
  // 趋势条
  trendBarContainer: { display: 'flex', alignItems: 'flex-end', gap: 3, height: 40 },
  trendBar: { flex: 1, borderRadius: '3px 3px 0 0', minWidth: 8, transition: 'height 0.3s' },
  // 问题列表
  issueCard: {
    background: '#fff', borderRadius: 8, padding: 12, marginBottom: 8,
    border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: 6,
  },
  issueHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  issueTitle: { fontSize: 13, fontWeight: 600, color: '#1a3a5c' },
  issueType: { fontSize: 11, color: '#64748b' },
  issueDesc: { fontSize: 12, color: '#475569', lineHeight: 1.5 },
  issueSuggestion: { fontSize: 11, color: '#2563eb', background: '#dbeafe', padding: '4px 8px', borderRadius: 4 },
  // 环形图
  donutContainer: { position: 'relative', display: 'inline-block' },
  donutCenter: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' },
}

// ========== 子组件 ==========
const EmptyState = ({ icon: Icon, text, subtext }: { icon: React.ElementType; text: string; subtext: string }) => (
  <div style={s.emptyState}>
    <div style={s.emptyIcon}><Icon size={32} color="#94a3b8" /></div>
    <div style={s.emptyText}>{text}</div>
    <div style={s.emptySubtext}>{subtext}</div>
  </div>
)

// 环形图
const DonutChart = ({ value, size = 80, stroke = 8, color = '#2563eb' }: { value: number; size?: number; stroke?: number; color?: string }) => {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference
  return (
    <div style={s.donutContainer}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div style={s.donutCenter}>
        <div style={{ fontSize: 16, fontWeight: 800, color: '#1a3a5c' }}>{value}</div>
        <div style={{ fontSize: 9, color: '#94a3b8' }}>%</div>
      </div>
    </div>
  )
}

// 趋势图
const TrendChart = ({ data, color }: { data: number[]; color: string }) => {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  return (
    <div style={s.trendBarContainer}>
      {data.map((val, i) => {
        const height = 5 + ((val - min) / range) * 35
        return (
          <div key={i} style={{ ...s.trendBar, height, background: i === data.length - 1 ? color : `${color}66` }} title={`${val.toFixed(1)}%`} />
        )
      })}
    </div>
  )
}

// ========== 主组件 ==========
export default function AIQCPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('realtime')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [filterType, setFilterType] = useState('全部')
  const [page, setPage] = useState(1)
  const [selectedExamType, setSelectedExamType] = useState<string>('gastroscopy')
  const pageSize = 10

  const historyRecords = generateHistoryRecords()
  const scoringRecords = generateScoringRecords()
  const imageQCResults = generateImageQCResults()

  const filteredHistory = historyRecords.filter(r => {
    const matchSearch = r.patientName.includes(searchKeyword) || r.examType.includes(searchKeyword) || r.doctor.includes(searchKeyword)
    const matchType = filterType === '全部' || r.examType === filterType
    return matchSearch && matchType
  })

  const filteredScoring = scoringRecords.filter(r => {
    const matchSearch = r.patientName.includes(searchKeyword) || r.examType.includes(searchKeyword)
    const matchType = filterType === '全部' || r.examType === filterType
    return matchSearch && matchType
  })

  const paginatedHistory = filteredHistory.slice((page - 1) * pageSize, page * pageSize)
  const totalPages = Math.ceil(filteredHistory.length / pageSize)

  const examTypes = ['全部', '胃镜', '肠镜', 'EUS']

  // KPI数据
  const kpiData = [
    { label: '今日检测', value: '38', unit: '例', sub: '较昨日 +12%', color: '#2563eb', bg: '#dbeafe' },
    { label: 'AI提醒次数', value: '126', unit: '次', sub: '发现可疑 23 例', color: '#dc2626', bg: '#fee2e2' },
    { label: '平均评分', value: '92.5', unit: '分', sub: '较上月 +2.3', color: '#16a34a', bg: '#dcfce7' },
    { label: '模型准确率', value: '94.5', unit: '%', sub: 'CADe-PolypNet', color: '#7c3aed', bg: '#f3e8ff' },
  ]

  // 当前选中的22张图标准
  const currentStandard = selectedExamType === 'gastroscopy' ? GASTROSCOPY_STANDARD
    : selectedExamType === 'colonoscopy' ? COLONOSCOPY_STANDARD
    : EUS_STANDARD

  return (
    <div style={s.pageWrapper}>
      {/* 页面头部 */}
      <div style={s.pageHeader}>
        <div>
          <h1 style={s.title}>
            <BrainCircuit size={24} color="#2563eb" />
            AI智能质控中心
          </h1>
          <p style={s.subtitle}>智能辅助质控 · CADe实时检测 · 图像质量评分 · 22张图片标准检测</p>
        </div>
        <div style={s.headerActions}>
          <button style={s.btnLargeInfo}><Upload size={16} />导入数据</button>
          <button style={s.btnLarge}><Download size={16} />导出报告</button>
        </div>
      </div>

      {/* KPI统计卡片 */}
      <div style={s.fourColGrid}>
        {kpiData.map((kpi) => (
          <div key={kpi.label} style={s.kpiCard}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 10, background: kpi.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Brain size={24} color={kpi.color} />
              </div>
              <div>
                <div style={s.kpiLabel}>{kpi.label}</div>
                <div style={{ ...s.kpiValue, color: kpi.color }}>{kpi.value}</div>
                <div style={s.kpiSub}>{kpi.unit} · {kpi.sub}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tab导航 */}
      <div style={s.tabNav}>
        <button style={activeTab === 'realtime' ? s.tabBtnActive : s.tabBtn} onClick={() => setActiveTab('realtime')}>
          <Zap size={16} />实时检测
        </button>
        <button style={activeTab === 'history' ? s.tabBtnActive : s.tabBtn} onClick={() => setActiveTab('history')}>
          <FileSearch size={16} />历史记录
        </button>
        <button style={activeTab === 'scoring' ? s.tabBtnActive : s.tabBtn} onClick={() => setActiveTab('scoring')}>
          <Award size={16} />质控评分
        </button>
        <button style={activeTab === 'dashboard' ? s.tabBtnActive : s.tabBtn} onClick={() => setActiveTab('dashboard')}>
          <BarChart3 size={16} />质控仪表盘
        </button>
        <button style={activeTab === 'models' ? s.tabBtnActive : s.tabBtn} onClick={() => setActiveTab('models')}>
          <Cpu size={16} />AI模型
        </button>
      </div>

      {/* ========== 实时检测 ========== */}
      {activeTab === 'realtime' && (
        <div style={s.twoColGrid}>
          {/* CADe检测面板 */}
          <div style={s.cadePanel}>
            <div style={s.cadeHeader}>
              <div style={s.cadeTitle}>
                <Brain size={16} color="#60a5fa" />
                CADe 实时检测
              </div>
              <div style={s.cadeStatus}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e', display: 'inline-block' }} />
                检测中
              </div>
            </div>
            <div style={s.cadeView}>
              <svg width="100%" height="100%" viewBox="0 0 640 360">
                <defs>
                  <radialGradient id="cadeGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#1e4080" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#0f2744" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <rect fill="#0f0f1a" width="100%" height="100%" />
                <ellipse cx="320" cy="180" rx="200" ry="140" fill="url(#cadeGlow)" />
                <path d="M100 280 Q200 250 300 280 T500 260 T620 280" stroke="#1e4080" strokeWidth="1.5" fill="none" opacity="0.5" />
                <path d="M80 200 Q180 170 280 200 T480 180 T640 200" stroke="#1e4080" strokeWidth="1" fill="none" opacity="0.3" />
                <path d="M120 320 Q220 290 320 320 T520 300 T620 320" stroke="#1e4080" strokeWidth="1" fill="none" opacity="0.4" />
                <rect x="280" y="140" width="60" height="50" fill="none" stroke="#ef4444" strokeWidth="2" rx="4">
                  <animate attributeName="opacity" values="1;0.5;1" dur="1s" repeatCount="indefinite" />
                </rect>
                <text x="310" y="135" fill="#ef4444" fontSize="10" textAnchor="middle">息肉 92%</text>
              </svg>
            </div>
            <div style={s.cadeControls}>
              <button style={{ ...s.btnLarge, padding: '8px 16px', minHeight: 40 }}><Play size={14} />开始检测</button>
              <button style={{ ...s.btnLargeWarning, padding: '8px 16px', minHeight: 40 }}><Pause size={14} />暂停</button>
              <button style={{ ...s.btnLarge, padding: '8px 16px', minHeight: 40 }}><RefreshCw size={14} />重置</button>
            </div>
            <div style={s.cadeStats}>
              <div style={s.cadeStat}><div style={s.cadeStatLabel}>检测帧数</div><div style={s.cadeStatValue}>1,256</div></div>
              <div style={s.cadeStat}><div style={{ ...s.cadeStatValue, color: '#ef4444' }}>3</div><div style={s.cadeStatLabel}>发现可疑</div></div>
              <div style={s.cadeStat}><div style={s.cadeStatValue}>00:42</div><div style={s.cadeStatLabel}>检测时长</div></div>
              <div style={s.cadeStat}><div style={{ ...s.cadeStatValue, color: '#22c55e' }}>94.5%</div><div style={s.cadeStatLabel}>置信度</div></div>
            </div>
          </div>

          {/* 检测记录列表 */}
          <div style={s.panel}>
            <div style={s.panelHeader}>
              <div style={s.panelTitle}><AlertOctagon size={16} color="#dc2626" />待处理提醒</div>
              <span style={{ ...s.badge, ...s.badgeDanger }}>3 条</span>
            </div>
            <div style={s.panelBody}>
              {[
                { patient: '王芳', type: '肠镜', time: '10:32', detection: '发现结肠息肉', confidence: 92 },
                { patient: '李明', type: '胃镜', time: '10:28', detection: '可疑溃疡病灶', confidence: 87 },
                { patient: '刘洋', type: '肠镜', time: '10:15', detection: '直肠息肉', confidence: 95 },
              ].map((item, idx) => (
                <div key={idx} style={{
                  padding: '12px 14px', border: '1px solid #e5e7eb', borderRadius: 8, marginBottom: 8,
                  cursor: 'pointer', transition: 'all 0.2s',
                  background: idx === 0 ? '#f0f7ff' : '#fff',
                  borderColor: idx === 0 ? '#2563eb' : '#e5e7eb',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#1a3a5c' }}>{item.patient}</span>
                      <span style={{ ...s.badge, ...s.badgeInfo }}>{item.type}</span>
                    </div>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>{item.time}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>{item.detection}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, height: 4, background: '#e5e7eb', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${item.confidence}%`, background: item.confidence > 90 ? '#22c55e' : '#f59e0b', borderRadius: 2 }} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: item.confidence > 90 ? '#22c55e' : '#f59e0b' }}>{item.confidence}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========== 历史记录 ========== */}
      {activeTab === 'history' && (
        <>
          <div style={s.filterBar}>
            <div style={s.searchBox}>
              <Search size={16} color="#94a3b8" />
              <input style={s.searchInput} placeholder="搜索患者姓名、检查类型或医生..." value={searchKeyword} onChange={e => setSearchKeyword(e.target.value)} />
            </div>
            <select style={s.select} value={filterType} onChange={e => setFilterType(e.target.value)}>
              {examTypes.map(t => (<option key={t} value={t}>{t === '全部' ? '全部类型' : t}</option>))}
            </select>
            <button style={s.btnIcon}><Download size={14} />导出</button>
          </div>

          <div style={s.panel}>
            <div style={s.panelBody}>
              {paginatedHistory.length > 0 ? (
                <table style={s.table}>
                  <thead>
                    <tr>
                      <th style={s.th}>日期</th>
                      <th style={s.th}>患者姓名</th>
                      <th style={s.th}>检查类型</th>
                      <th style={s.th}>AI评分</th>
                      <th style={s.th}>等级</th>
                      <th style={s.th}>报告及时率</th>
                      <th style={s.th}>图像达标率</th>
                      <th style={s.th}>退镜时间</th>
                      <th style={s.th}>AI建议</th>
                      <th style={s.th}>审核医生</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedHistory.map((record) => (
                      <tr key={record.id}>
                        <td style={s.td}>{record.date}</td>
                        <td style={{ ...s.td, fontWeight: 500 }}>{record.patientName}</td>
                        <td style={s.td}><span style={{ ...s.badge, ...s.badgeInfo }}>{record.examType}</span></td>
                        <td style={s.td}>
                          <span style={{ fontWeight: 600, color: record.score >= 90 ? '#16a34a' : record.score >= 80 ? '#d97706' : '#dc2626' }}>{record.score}分</span>
                        </td>
                        <td style={s.td}>
                          <span style={{ ...s.badge, ...(record.grade === '优秀' ? s.badgeSuccess : record.grade === '良好' ? s.badgeInfo : record.grade === '合格' ? s.badgeWarning : s.badgeDanger) }}>{record.grade}</span>
                        </td>
                        <td style={s.td}>
                          <span style={{ color: record.reportTimeliness >= 95 ? '#16a34a' : record.reportTimeliness >= 90 ? '#d97706' : '#dc2626' }}>{record.reportTimeliness}%</span>
                        </td>
                        <td style={s.td}>
                          <span style={{ color: record.imageStandard >= 90 ? '#16a34a' : record.imageStandard >= 85 ? '#d97706' : '#dc2626' }}>{record.imageStandard}%</span>
                        </td>
                        <td style={s.td}>
                          <span style={{ color: record.withdrawalTime >= 85 ? '#16a34a' : record.withdrawalTime >= 75 ? '#d97706' : '#dc2626' }}>{record.withdrawalTime}%</span>
                        </td>
                        <td style={s.td}>{record.aiSuggestion}</td>
                        <td style={s.td}>{record.doctor}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (<EmptyState icon={FileSearch} text="暂无历史质控记录" subtext="请先进行AI智能质控检测" />)}
            </div>

            {filteredHistory.length > 0 && (
              <div style={s.pagination}>
                <div style={s.pageInfo}>显示 {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, filteredHistory.length)} 条，共 {filteredHistory.length} 条</div>
                <div style={s.pageBtns}>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let p = i + 1
                    if (totalPages > 5 && page > 3) p = page - 2 + i
                    if (totalPages > 5 && page > totalPages - 2) p = totalPages - 4 + i
                    return (<button key={p} style={page === p ? s.pageBtnActive : s.pageBtn} onClick={() => setPage(p)}>{p}</button>)
                  })}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ========== 质控评分 ========== */}
      {activeTab === 'scoring' && (
        <>
          <div style={s.filterBar}>
            <div style={s.searchBox}>
              <Search size={16} color="#94a3b8" />
              <input style={s.searchInput} placeholder="搜索患者姓名或检查类型..." value={searchKeyword} onChange={e => setSearchKeyword(e.target.value)} />
            </div>
            <select style={s.select} value={filterType} onChange={e => setFilterType(e.target.value)}>
              {examTypes.map(t => (<option key={t} value={t}>{t === '全部' ? '全部类型' : t}</option>))}
            </select>
            <button style={s.btnIcon}><Award size={14} />生成报告</button>
          </div>

          {/* 22张图片标准切换 */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <button
                style={{ ...s.btnIcon, background: selectedExamType === 'gastroscopy' ? '#2563eb' : '#f1f5f9', color: selectedExamType === 'gastroscopy' ? '#fff' : '#475569' }}
                onClick={() => setSelectedExamType('gastroscopy')}
              >
                <Camera size={14} />胃镜（22张）
              </button>
              <button
                style={{ ...s.btnIcon, background: selectedExamType === 'colonoscopy' ? '#2563eb' : '#f1f5f9', color: selectedExamType === 'colonoscopy' ? '#fff' : '#475569' }}
                onClick={() => setSelectedExamType('colonoscopy')}
              >
                <Camera size={14} />肠镜（22张）
              </button>
              <button
                style={{ ...s.btnIcon, background: selectedExamType === 'eus' ? '#2563eb' : '#f1f5f9', color: selectedExamType === 'eus' ? '#fff' : '#475569' }}
                onClick={() => setSelectedExamType('eus')}
              >
                <Camera size={14} />超声检查（18张）
              </button>
            </div>

            {/* 22张图片标准展示 */}
            <div style={s.panel}>
              <div style={s.panelHeader}>
                <div style={s.panelTitle}>
                  <Layers2 size={14} />
                  {currentStandard.examType} - 图片采集标准（共{currentStandard.totalRequired}张）
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: '#64748b' }}>
                    已采集: <strong style={{ color: '#16a34a' }}>{currentStandard.items.filter(i => i.captured).length}</strong> / {currentStandard.totalRequired}
                  </span>
                  <span style={{ ...s.badge, ...s.badgeSuccess }}>
                    达标率: {Math.round(currentStandard.items.filter(i => i.captured && i.quality !== 'poor').length / currentStandard.totalRequired * 100)}%
                  </span>
                </div>
              </div>
              <div style={{ padding: 16 }}>
                <div style={s.standardGrid}>
                  {currentStandard.items.map(item => (
                    <div
                      key={item.id}
                      style={{
                        ...s.standardItem,
                        ...(item.required ? s.standardItemRequired : {}),
                        ...(item.captured && item.quality === 'good' ? s.standardItemCaptured : {}),
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={s.standardItemName}>{item.name}</span>
                        {item.required && <span style={{ fontSize: 9, color: '#dc2626', fontWeight: 600 }}>必选</span>}
                      </div>
                      <div style={s.standardItemDesc}>{item.description}</div>
                      <div style={{
                        ...s.standardItemQuality,
                        background: item.captured && item.quality === 'good' ? '#dcfce7' : item.captured && item.quality === 'fair' ? '#fef3c7' : item.captured && item.quality === 'poor' ? '#fee2e2' : '#f1f5f9',
                        color: item.captured && item.quality === 'good' ? '#16a34a' : item.captured && item.quality === 'fair' ? '#d97706' : item.captured && item.quality === 'poor' ? '#dc2626' : '#94a3b8',
                      }}>
                        {item.captured ? (item.quality === 'good' ? '✓ 优质' : item.quality === 'fair' ? '○ 一般' : '△ 差') : '○ 未采集'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 图像质量评分 */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1a3a5c', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Gauge size={14} /> 图像质量自动评分（清晰度/亮度/覆盖度）
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {imageQCResults.map(img => (
                <div key={img.id} style={s.imageQCCard}>
                  <div style={s.imageQCHeader}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#1a3a5c' }}>{img.name}</span>
                    <span style={{
                      ...s.badge,
                      background: img.overall >= 85 ? '#dcfce7' : img.overall >= 75 ? '#fef3c7' : '#fee2e2',
                      color: img.overall >= 85 ? '#16a34a' : img.overall >= 75 ? '#d97706' : '#dc2626',
                    }}>
                      {img.overall >= 85 ? '优秀' : img.overall >= 75 ? '良好' : '不合格'}
                    </span>
                  </div>
                  <div style={s.imageQCThumb}>
                    <Camera size={24} color="#94a3b8" />
                  </div>
                  <div style={s.imageQCProgress}>
                    {[
                      { label: '清晰度', value: img.clarity, color: '#2563eb' },
                      { label: '亮度', value: img.brightness, color: '#f59e0b' },
                      { label: '覆盖度', value: img.coverage, color: '#16a34a' },
                    ].map(item => (
                      <div key={item.label} style={s.imageQCProgressRow}>
                        <span style={s.imageQCProgressLabel}>{item.label}</span>
                        <div style={s.imageQCProgressBar}>
                          <div style={{ ...s.imageQCProgressFill, width: `${item.value}%`, background: item.color }} />
                        </div>
                        <span style={{ ...s.imageQCProgressValue, color: item.color }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                  {img.issues.length > 0 && (
                    <div style={{ fontSize: 10, color: '#dc2626' }}>{img.issues.join('; ')}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 质控评分表 */}
          <div style={s.panel}>
            <div style={s.panelHeader}>
              <div style={s.panelTitle}><Award size={14} />质控评分详情</div>
              <button style={s.btnIcon}><Download size={14} />导出评分</button>
            </div>
            <div style={s.panelBody}>
              {filteredScoring.length > 0 ? (
                <table style={s.table}>
                  <thead>
                    <tr>
                      <th style={s.th}>患者</th>
                      <th style={s.th}>类型</th>
                      <th style={s.th}>图像质量</th>
                      <th style={s.th}>清晰度</th>
                      <th style={s.th}>亮度</th>
                      <th style={s.th}>覆盖度</th>
                      <th style={s.th}>检查完整度</th>
                      <th style={s.th}>操作规范</th>
                      <th style={s.th}>报告规范</th>
                      <th style={s.th}>总分</th>
                      <th style={s.th}>扣分详情</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredScoring.map((record) => (
                      <tr key={record.id}>
                        <td style={{ ...s.td, fontWeight: 500 }}>{record.patientName}</td>
                        <td style={s.td}><span style={{ ...s.badge, ...s.badgeInfo }}>{record.examType}</span></td>
                        <td style={s.td}>{record.imageQuality}分</td>
                        <td style={s.td}>
                          <span style={{ color: record.clarity >= 85 ? '#16a34a' : record.clarity >= 75 ? '#d97706' : '#dc2626' }}>{record.clarity}分</span>
                        </td>
                        <td style={s.td}>
                          <span style={{ color: record.brightness >= 80 ? '#16a34a' : record.brightness >= 70 ? '#d97706' : '#dc2626' }}>{record.brightness}分</span>
                        </td>
                        <td style={s.td}>
                          <span style={{ color: record.coverage >= 85 ? '#16a34a' : record.coverage >= 75 ? '#d97706' : '#dc2626' }}>{record.coverage}分</span>
                        </td>
                        <td style={s.td}>{record.examCompleteness}分</td>
                        <td style={s.td}>{record.operationStandard}分</td>
                        <td style={s.td}>{record.reportStandard}分</td>
                        <td style={s.td}>
                          <span style={{ ...s.badge, ...(record.totalScore >= 90 ? s.badgeSuccess : record.totalScore >= 80 ? s.badgeWarning : s.badgeDanger) }}>{record.totalScore}分</span>
                        </td>
                        <td style={s.td}>
                          {record.deductions.length > 0 ? (
                            <span style={{ fontSize: 11, color: '#dc2626' }}>{record.deductions.map(d => d.item).join('、')}</span>
                          ) : (
                            <span style={{ fontSize: 11, color: '#16a34a' }}>无扣分</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (<EmptyState icon={Award} text="暂无质控评分记录" subtext="请先进行AI智能质控评分" />)}
            </div>
          </div>
        </>
      )}

      {/* ========== 质控仪表盘 ========== */}
      {activeTab === 'dashboard' && (
        <>
          {/* 5项核心指标 */}
          <div style={s.dashboardGrid}>
            {QC_INDICATORS.map(ind => (
              <div key={ind.key} style={s.dashboardCard}>
                <div style={s.dashboardCardTitle}>
                  {ind.label}
                </div>
                <div style={{ ...s.dashboardCardValue, color: ind.status === 'excellent' ? '#16a34a' : ind.status === 'good' ? '#2563eb' : ind.status === 'warning' ? '#d97706' : '#dc2626' }}>
                  {ind.value}
                  <span style={{ fontSize: 14, fontWeight: 400 }}>{ind.unit}</span>
                </div>
                <div style={s.dashboardCardSub}>目标: {ind.target}{ind.unit}</div>
                <TrendChart data={ind.trend} color={ind.status === 'excellent' ? '#16a34a' : ind.status === 'good' ? '#2563eb' : ind.status === 'warning' ? '#d97706' : '#dc2626'} />
                <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>
                  {ind.value >= ind.target ? '✓ 已达标' : `差距 ${(ind.target - ind.value).toFixed(1)}${ind.unit}`}
                </div>
              </div>
            ))}
          </div>

          {/* 质控问题列表 */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1a3a5c', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <AlertTriangle size={16} color="#d97706" /> 质控问题列表及整改建议
            </div>
            {QC_ISSUES.map(issue => (
              <div key={issue.id} style={s.issueCard}>
                <div style={s.issueHeader}>
                  <div>
                    <span style={s.issueTitle}>{issue.patientName}</span>
                    <span style={{ ...s.badge, ...(issue.severity === 'high' ? s.badgeDanger : issue.severity === 'medium' ? s.badgeWarning : s.badgeInfo), marginLeft: 8 }}>{issue.severity === 'high' ? '严重' : issue.severity === 'medium' ? '中等' : '轻微'}</span>
                    <span style={{ ...s.badge, ...s.badgeInfo, marginLeft: 4 }}>{issue.examType}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {issue.status === 'pending' && <span style={{ ...s.badge, ...s.badgeWarning }}>待处理</span>}
                    {issue.status === 'resolved' && <span style={{ ...s.badge, ...s.badgeSuccess }}>已解决</span>}
                    {issue.status === 'ignored' && <span style={{ ...s.badge, ...s.badgeInfo }}>已忽略</span>}
                  </div>
                </div>
                <div style={s.issueDesc}>{issue.description}</div>
                <div style={s.issueSuggestion}>💡 {issue.suggestion}</div>
              </div>
            ))}
          </div>

          {/* AI模型性能概览 */}
          <div style={s.panel}>
            <div style={s.panelHeader}>
              <div style={s.panelTitle}><Cpu size={14} />AI模型性能概览</div>
              <button style={s.btnIcon} onClick={() => setActiveTab('models')}><Eye size={14} />查看详情</button>
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
                {aiModels.slice(0, 5).map(model => (
                  <div key={model.id} style={{ background: '#f8fafc', borderRadius: 8, padding: 12, border: '1px solid #e5e7eb' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1a3a5c', marginBottom: 4 }}>{model.name}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 8 }}>v{model.version}</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <div style={{ flex: 1, textAlign: 'center' }}>
                        <div style={{ fontSize: 16, fontWeight: 700, color: '#2563eb' }}>{model.accuracy}%</div>
                        <div style={{ fontSize: 10, color: '#94a3b8' }}>准确率</div>
                      </div>
                      <div style={{ flex: 1, textAlign: 'center' }}>
                        <div style={{ fontSize: 16, fontWeight: 700, color: '#16a34a' }}>{model.detections > 9999 ? `${(model.detections / 1000).toFixed(0)}k` : model.detections}</div>
                        <div style={{ fontSize: 10, color: '#94a3b8' }}>检测数</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ========== AI模型 ========== */}
      {activeTab === 'models' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={s.btnLargeSuccess}><Plus size={16} />新增模型</button>
              <button style={s.btnLarge}><RefreshCw size={16} />同步模型</button>
            </div>
            <button style={s.btnLargeInfo}><Download size={16} />导出配置</button>
          </div>

          <div style={s.threeColGrid}>
            {aiModels.map((model) => (
              <div key={model.id} style={s.modelCard}>
                <div style={s.modelCardHeader}>
                  <div style={s.modelIcon}>
                    <Brain size={24} color="#fff" />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <span style={{ ...s.badge, ...(model.status === 'active' ? s.badgeSuccess : model.status === 'training' ? s.badgeWarning : s.badgeDanger) }}>
                      {model.status === 'active' ? '运行中' : model.status === 'training' ? '训练中' : '已停用'}
                    </span>
                  </div>
                </div>
                <div>
                  <div style={s.modelName}>{model.name}</div>
                  <div style={s.modelVersion}>版本 {model.version}</div>
                  <div style={s.modelDesc}>{model.description}</div>
                </div>
                <div style={s.modelStats}>
                  <div style={s.modelStat}><div style={s.modelStatValue}>{model.accuracy}%</div><div style={s.modelStatLabel}>准确率</div></div>
                  <div style={s.modelStat}><div style={s.modelStatValue}>{model.precision}%</div><div style={s.modelStatLabel}>精确率</div></div>
                  <div style={s.modelStat}><div style={s.modelStatValue}>{model.recall}%</div><div style={s.modelStatLabel}>召回率</div></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>已检测 {model.detections.toLocaleString()} 次</span>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>更新于 {model.lastUpdated}</span>
                </div>
                <div style={s.modelActions}>
                  {model.status === 'active' ? (
                    <><button style={s.btnWarning} title="暂停模型"><Pause size={12} />暂停</button><button style={s.btnDanger} title="停用模型"><X size={12} />停用</button></>
                  ) : model.status === 'training' ? (
                    <button style={s.btnSuccess}><TrendingUp size={12} />训练中</button>
                  ) : (
                    <button style={s.btnSuccess}><Check size={12} />启用</button>
                  )}
                  <button style={s.btnIcon}><Settings size={12} /></button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
