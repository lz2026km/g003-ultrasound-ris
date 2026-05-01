// @ts-nocheck
// ============================================================
// G003 超声RIS系统 - 报告书写页面（专业增强版）
// ============================================================
import { useState, useMemo, useEffect, useRef } from 'react'
import {
  FileText, Save, Send, ChevronLeft, ChevronRight,
  Search, Plus, Edit2, Trash2, X, Check, AlertTriangle,
  ClipboardList, User, Clock, Stethoscope, Image, Printer,
  Sparkles, CheckCircle2, Circle, ChevronDown, ChevronUp,
  Eye, EyeOff, MessageSquare, Tag, PlusCircle, MinusCircle,
  Camera, Upload, RotateCcw, ShieldCheck, Flag, BookOpen,
  Pill, Scissors, Activity, FileWarning
} from 'lucide-react'
import type { UltrasoundReport, ReportTemplate, ReportStatus, Gender } from '../types'
import { initialUltrasoundReports, initialReportTemplates, initialUltrasoundExams } from '../data/initialData'

// ---------- 常量 ----------
const GASTROSCOPY_MIN_PHOTOS = 22
const COLONOSCOPY_MIN_PHOTOS = 20

// ========== 22张图片标准数据 ==========
const GASTROSCOPY_22_STANDARD: { id: string; name: string; description: string; required: boolean }[] = [
  { id: 'G01', name: '食道上段', description: '距门齿约15-20cm，吸气相', required: true },
  { id: 'G02', name: '食道中段', description: '距门齿约25-30cm', required: true },
  { id: 'G03', name: '食道下段', description: '距门齿约35-38cm', required: true },
  { id: 'G04', name: '齿状线（Z线）', description: '清晰显示Z线位置', required: true },
  { id: 'G05', name: '胃底（倒镜）', description: '倒镜观察胃底', required: true },
  { id: 'G06', name: '胃底黏液湖', description: '观察黏液湖性状', required: true },
  { id: 'G07', name: '胃体上部', description: '倒镜观察胃体上部', required: true },
  { id: 'G08', name: '胃体中部', description: '观察胃体中部大弯', required: true },
  { id: 'G09', name: '胃体下部', description: '观察胃体下部', required: true },
  { id: 'G10', name: '胃角（正面）', description: '清晰显示胃角形态', required: true },
  { id: 'G11', name: '胃角（远景）', description: '显示胃角与周围关系', required: true },
  { id: 'G12', name: '胃窦（远景）', description: '显示胃窦全貌', required: true },
  { id: 'G13', name: '胃窦（近景）', description: '近距观察胃窦黏膜', required: true },
  { id: 'G14', name: '幽门（开放）', description: '幽门管开放状态', required: true },
  { id: 'G15', name: '幽门（关闭）', description: '幽门管关闭状态', required: true },
  { id: 'G16', name: '十二指肠球部', description: '显示十二指肠球部', required: true },
  { id: 'G17', name: '十二指肠降部', description: '显示十二指肠降部', required: true },
  { id: 'G18', name: '后壁位（胃体）', description: '胃体后壁', required: false },
  { id: 'G19', name: '小弯位（胃体）', description: '胃体小弯', required: false },
  { id: 'G20', name: '病变部位1', description: '如有病变需特写', required: false },
  { id: 'G21', name: '病变部位2', description: '如有病变需特写', required: false },
  { id: 'G22', name: 'NBI/色素染色', description: '特殊检查（如有）', required: false },
]

const COLONOSCOPY_22_STANDARD: { id: string; name: string; description: string; required: boolean }[] = [
  { id: 'C01', name: '肛管', description: '观察肛管病变', required: true },
  { id: 'C02', name: '直肠（远景）', description: '直肠全貌', required: true },
  { id: 'C03', name: '直肠（近景）', description: '直肠黏膜', required: true },
  { id: 'C04', name: '直肠乙状结肠交界', description: '观察交界处', required: true },
  { id: 'C05', name: '乙状结肠（近景）', description: '乙状结肠黏膜', required: true },
  { id: 'C06', name: '乙状结肠（远景）', description: '乙状结肠全貌', required: true },
  { id: 'C07', name: '降结肠', description: '降结肠黏膜', required: true },
  { id: 'C08', name: '脾曲', description: '脾曲通过', required: true },
  { id: 'C09', name: '横结肠（近景）', description: '横结肠黏膜', required: true },
  { id: 'C10', name: '横结肠（远景）', description: '横结肠全貌', required: true },
  { id: 'C11', name: '肝曲', description: '肝曲通过', required: true },
  { id: 'C12', name: '升结肠', description: '升结肠黏膜', required: true },
  { id: 'C13', name: '盲肠', description: '盲肠黏膜', required: true },
  { id: 'C14', name: '回盲瓣（正面）', description: '清晰显示回盲瓣', required: true },
  { id: 'C15', name: '回肠末段', description: '回肠末段黏膜', required: true },
  { id: 'C16', name: '阑尾开口', description: '阑尾开口位置', required: true },
  { id: 'C17', name: '退镜观察（直肠）', description: '退镜时直肠观察', required: true },
  { id: 'C18', name: '退镜观察（乙状）', description: '退镜时乙状结肠', required: true },
  { id: 'C19', name: 'BBPS评分图像', description: 'BBPS评分部位', required: false },
  { id: 'C20', name: '病变部位1', description: '如有病变需特写', required: false },
  { id: 'C21', name: '病变部位2', description: '如有病变需特写', required: false },
  { id: 'C22', name: '染色/NBI图像', description: '特殊检查（如有）', required: false },
]

// ========== 结构化报告模板类型 ==========
type ReportTemplateType = 'diagnosis' | 'surgery' | 'emergency' | 'followup'

const STRUCTURED_TEMPLATES: { type: ReportTemplateType; label: string; icon: string; description: string; sections: { title: string; placeholder: string }[] }[] = [
  {
    type: 'diagnosis',
    label: '诊断报告模板',
    icon: '📋',
    description: '标准诊断报告结构，包含检查所见和诊断结论',
    sections: [
      { title: '检查所见', placeholder: '请详细描述各部位黏膜情况...' },
      { title: '诊断结论', placeholder: '1. ...\n2. ...\n3. ...' },
      { title: '建议', placeholder: '建议定期复查或进一步检查...' },
    ],
  },
  {
    type: 'surgery',
    label: '手术报告模板',
    icon: '🔪',
    description: '手术操作详细记录模板',
    sections: [
      { title: '手术名称', placeholder: '如：超声下息肉切除术（EMR）' },
      { title: '术前诊断', placeholder: '结肠多发息肉' },
      { title: '手术步骤', placeholder: '1. 黏膜下注射...\n2. 切开...\n3. 剥离...\n4. 止血...' },
      { title: '术后诊断', placeholder: '结肠多发息肉（已切除）' },
      { title: '术中情况', placeholder: '术中出血约5ml，未发生穿孔...' },
      { title: '标本处理', placeholder: '标本已送病理检查' },
    ],
  },
  {
    type: 'emergency',
    label: '急诊报告模板',
    icon: '🚨',
    description: '急诊绿色通道快速报告模板',
    sections: [
      { title: '急诊主诉', placeholder: '呕血2小时伴晕厥一次...' },
      { title: '检查所见', placeholder: '食管胃底静脉曲张破裂出血...' },
      { title: '紧急处理', placeholder: '已行套扎术止血，过程顺利...' },
      { title: '诊断结论', placeholder: '食管胃底静脉曲张破裂出血（急诊）' },
      { title: '危急值', placeholder: '请立即通知临床医生' },
    ],
  },
  {
    type: 'followup',
    label: '随访报告模板',
    icon: '📅',
    description: '术后/治疗后随访对比报告',
    sections: [
      { title: '上次检查情况', placeholder: '2025-10-15胃镜：胃溃疡（A1期）...' },
      { title: '本次检查所见', placeholder: '溃疡已形成白色疤痕...' },
      { title: '治疗效果评估', placeholder: 'S2期愈合中，HP已根除' },
      { title: '本次诊断', placeholder: '胃溃疡疤痕形成期' },
      { title: '下次复查建议', placeholder: '建议6-12个月复查胃镜' },
    ],
  },
]

// 常用短语库
const COMMON_PHRASES: { category: string; phrases: string[] }[] = [
  {
    category: '食道',
    phrases: [
      '黏膜光滑，血管纹理清晰，齿状线清晰',
      '黏膜充血水肿，血管纹理模糊',
      '可见白色念珠菌样白斑',
      '黏膜粗糙，碘染色阳性',
      '管腔狭窄，超声不能通过',
    ],
  },
  {
    category: '胃',
    phrases: [
      '黏液湖清，黏膜光滑',
      '黏膜红白相间，以红为主',
      '可见点状糜烂',
      '溃疡形成，表面覆白苔',
      '黏膜充血水肿',
      '蠕动良好',
      '幽门圆形，开闭良好',
    ],
  },
  {
    category: '肠',
    phrases: [
      '黏膜光滑，血管纹理清晰',
      '黏膜充血水肿，血管纹理模糊',
      '可见多发息肉',
      '盲肠黏膜光滑',
      '回肠末段黏膜淋巴滤泡增生',
    ],
  },
  {
    category: '通用',
    phrases: [
      '未见明显异常',
      '建议定期复查',
      '建议进一步检查',
      '必要时取活检',
      '禁食辛辣刺激饮食',
    ],
  },
]

// 术语提示
const TERM_HINTS: Record<string, string[]> = {
  '溃疡': ['胃溃疡', '十二指肠溃疡', '复合溃疡', '溃疡愈合中（S1/S2期）'],
  '糜烂': ['点状糜烂', '片状糜烂', '疣状糜烂', '慢性浅表性胃炎伴糜烂'],
  '息肉': ['增生性息肉', '腺瘤性息肉', '息肉切除术后', '多发息肉'],
  '炎症': ['慢性浅表性胃炎', '慢性萎缩性胃炎', '反流性食管炎', '结肠炎'],
  '肿瘤': ['可疑恶性肿瘤', 'Ca？（待病理）', '黏膜下肿物'],
  '出': ['陈旧性出血', '活动性出血', '可见咖啡色物质'],
}

// AI 模拟生成内容
const AI_CONTENT: Record<string, { findings: string; conclusion: string }> = {
  '电子胃镜检查': {
    findings: `食道：黏膜光滑，血管纹理清晰，齿状线清晰，距门齿约38cm。
胃底：黏液湖清，黏膜光滑，色泽正常。
胃体：黏膜红白相间，以红为主，皱襞排列规整。
胃角：弧度存在，黏膜光滑。
胃窦：黏膜充血水肿，散在点状糜烂，幽门前区为著。
幽门：圆形，开闭良好。
十二指肠：球部及降部黏膜光滑，未见溃疡及出血。`,
    conclusion: '1. 慢性浅表性胃炎（糜烂型） 2. HP感染待除外',
  },
  '电子结肠镜检查': {
    findings: `肛管：黏膜光滑。
直肠：黏膜光滑，血管纹理清晰。
乙状结肠：黏膜光滑，血管纹理清晰。
降结肠：黏膜光滑。
横结肠：黏膜光滑，血管纹理清晰。
升结肠：黏膜光滑。
盲肠：黏膜光滑，可见回盲瓣开闭良好。
回肠末段：黏膜光滑，淋巴滤泡轻度增生。`,
    conclusion: '1. 结肠镜检查未见明显异常 2. 回肠末段淋巴滤泡增生',
  },
}

// ========== 新增：质量评分标准 ==========
const QUALITY_CRITERIA: { key: string; label: string; weight: number; check: (r: Partial<UltrasoundReport>, imgs: ReportImage[]) => { score: number; detail: string } }[] = [
  {
    key: 'completeness',
    label: '完整性',
    weight: 25,
    check: (r) => {
      const fields = [r.findings, r.conclusion, r.chiefComplaint, r.history]
      const filled = fields.filter(f => (f || '').trim().length > 0).length
      return { score: (filled / fields.length) * 100, detail: `${filled}/${fields.length} 字段已填` }
    },
  },
  {
    key: 'terminology',
    label: '术语规范',
    weight: 25,
    check: (r) => {
      const text = (r.findings || '') + (r.conclusion || '')
      const goodTerms = ['黏膜', '光滑', '充血', '水肿', '糜烂', '溃疡', '息肉', '血管', '纹理', '未见明显异常']
      const found = goodTerms.filter(t => text.includes(t)).length
      const score = Math.min(100, (found / goodTerms.length) * 150)
      return { score, detail: `${found}个规范术语` }
    },
  },
  {
    key: 'imageStd',
    label: '图像规范',
    weight: 25,
    check: (r, imgs) => {
      const isGastro = (r.examItemName || '').includes('胃镜')
      const min = isGastro ? GASTROSCOPY_MIN_PHOTOS : COLONOSCOPY_MIN_PHOTOS
      const count = imgs.length
      const score = count === 0 ? 0 : count < min ? 40 : count === min ? 80 : 100
      return { score, detail: `${count}张 / 最少${min}张` }
    },
  },
  {
    key: 'conclusion',
    label: '结论明确',
    weight: 25,
    check: (r) => {
      const c = (r.conclusion || '').trim()
      if (!c) return { score: 0, detail: '无结论' }
      const hasNumber = /^\d+\./.test(c)
      const hasItems = c.split('\n').filter(l => l.trim()).length
      return { score: hasNumber && hasItems > 0 ? 100 : hasItems > 0 ? 70 : 30, detail: hasNumber ? '格式规范' : '建议编号' }
    },
  },
]

// ========== 新增：快捷短语增强：常用诊断描述 ==========
const DIAGNOSTIC_TEMPLATES: { category: string; templates: { title: string; findings: string; conclusion: string }[] }[] = [
  {
    category: '胃',
    templates: [
      { title: '慢性胃炎', findings: '胃窦：黏膜充血水肿，红白相间，以红为主。幽门：圆形，开闭良好。', conclusion: '1. 慢性浅表性胃炎\n2. HP感染待除外' },
      { title: '胃溃疡', findings: '胃角：可见一溃疡灶，大小约0.6×0.5cm，表面覆白苔，周围黏膜充血水肿。', conclusion: '1. 胃溃疡（性质待病理）\n2. HP感染待除外' },
      { title: '胃息肉', findings: '胃体：可见一枚息肉样隆起，大小约0.4×0.3cm，表面光滑。', conclusion: '1. 胃息肉\n2. 建议择期切除' },
    ],
  },
  {
    category: '食道',
    templates: [
      { title: '反流性食管炎', findings: '食道：黏膜充血水肿，距门齿约35-38cm可见纵行糜烂，血管纹理模糊。', conclusion: '1. 反流性食管炎（LA-A级）\n2. 慢性胃炎' },
      { title: '食道白斑', findings: '食道：距门齿约25cm可见白色念珠菌样白斑，约0.3×0.2cm。', conclusion: '1. 食道白斑\n2. 建议定期复查' },
    ],
  },
  {
    category: '肠',
    templates: [
      { title: '结肠息肉', findings: '乙状结肠：可见一枚息肉样隆起，大小约0.6×0.5cm，表面光滑。', conclusion: '1. 结肠息肉\n2. 已行切除' },
      { title: '溃疡性结肠炎', findings: '直肠：黏膜弥漫性充血水肿，血管纹理模糊，可见多发溃疡，覆脓性分泌物。', conclusion: '1. 溃疡性结肠炎（活动期）\n2. 建议进一步检查' },
    ],
  },
]

// ========== 新增：历史报告参考数据 ==========
const MOCK_HISTORY_REPORTS: Record<string, { id: string; date: string; examType: string; findings: string; conclusion: string }[]> = {
  'P001': [
    { id: 'RPT202401', date: '2024-01-15', examType: '电子胃镜检查', findings: '食道：黏膜光滑。胃窦：黏膜充血水肿，红白相间，以红为主。', conclusion: '1. 慢性浅表性胃炎\n2. HP感染待除外' },
    { id: 'RPT202310', date: '2023-10-08', examType: '电子胃镜检查', findings: '食道：黏膜光滑，血管纹理清晰。胃底：黏液湖清。', conclusion: '1. 胃镜检查未见明显异常' },
  ],
}

// 活检部位类型
interface BiopsySite {
  id: string
  number: string
  bottleNumber: string
  location: string
  status: '下单' | '已送' | '已回'
}

// ---------- 样式定义 ----------
const s: Record<string, React.CSSProperties> = {
  pageHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 18, fontWeight: 700, color: '#1a3a5c' },
  toolbar: {
    display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap',
    background: '#fff', padding: '12px 16px', borderRadius: 8,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: 16,
  },
  searchBox: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: '#f8fafc', border: '1px solid #e2e8f0',
    borderRadius: 6, padding: '6px 12px', flex: 1, minWidth: 200,
  },
  searchInput: {
    border: 'none', outline: 'none', background: 'transparent',
    fontSize: 13, color: '#334155', width: '100%',
  },
  select: {
    border: '1px solid #e2e8f0', borderRadius: 6, padding: '6px 10px',
    fontSize: 13, color: '#334155', background: '#f8fafc', outline: 'none',
    cursor: 'pointer',
  },
  btnPrimary: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 6,
    padding: '7px 14px', fontSize: 13, cursor: 'pointer',
  },
  btnSuccess: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: '#059669', color: '#fff', border: 'none', borderRadius: 6,
    padding: '7px 14px', fontSize: 13, cursor: 'pointer',
  },
  btnWarning: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: '#d97706', color: '#fff', border: 'none', borderRadius: 6,
    padding: '7px 14px', fontSize: 13, cursor: 'pointer',
  },
  btnDanger: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6,
    padding: '7px 14px', fontSize: 13, cursor: 'pointer',
  },
  btnIcon: {
    display: 'flex', alignItems: 'center', gap: 4,
    background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 6,
    padding: '5px 8px', fontSize: 12, cursor: 'pointer',
  },
  btnAIGhost: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff', border: 'none', borderRadius: 6,
    padding: '7px 14px', fontSize: 13, cursor: 'pointer',
    fontWeight: 600,
  },
  table: {
    width: '100%', borderCollapse: 'collapse', background: '#fff',
    borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  th: {
    background: '#f8fafc', padding: '10px 12px', textAlign: 'left',
    fontSize: 12, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e2e8f0',
  },
  td: {
    padding: '10px 12px', fontSize: 13, color: '#334155', borderBottom: '1px solid #f1f5f9',
  },
  badge: {
    display: 'inline-block', padding: '2px 8px', borderRadius: 12, fontSize: 11,
  },
  badgeDraft: { background: '#fef3c7', color: '#92400e' },
  badgeWriting: { background: '#dbeafe', color: '#1d4ed8' },
  badgePending: { background: '#e0e7ff', color: '#4338ca' },
  badgeApproved: { background: '#d1fae5', color: '#065f46' },
  badgePrinted: { background: '#fce7f3', color: '#be185d' },
  badgePublished: { background: '#d1fae5', color: '#065f46' },
  actions: { display: 'flex', gap: 6 },
  pagination: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 16, padding: '12px 16px', background: '#fff',
    borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  pageInfo: { fontSize: 13, color: '#64748b' },
  pageBtns: { display: 'flex', gap: 4 },
  pageBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 32, height: 32, borderRadius: 6, border: '1px solid #e2e8f0',
    background: '#fff', cursor: 'pointer', fontSize: 13, color: '#475569',
  },
  pageBtnActive: {
    background: '#1a3a5c', color: '#fff', border: '1px solid #1a3a5c',
  },
  pageBtnDisabled: { opacity: 0.5, cursor: 'not-allowed' },
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
    display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
    zIndex: 1000, paddingTop: '5vh', overflowY: 'auto',
  },
  modal: {
    background: '#fff', borderRadius: 12, width: 1100, maxHeight: '90vh',
    overflow: 'hidden', display: 'flex', flexDirection: 'column',
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)', marginBottom: 40,
  },
  modalHeader: {
    padding: '16px 20px', borderBottom: '1px solid #e2e8f0',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: '#f8fafc',
  },
  modalTitle: { fontSize: 15, fontWeight: 700, color: '#1a3a5c' },
  modalClose: {
    background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8',
    display: 'flex', alignItems: 'center', padding: 4,
  },
  modalBody: {
    padding: 0, overflowY: 'auto', flex: 1,
  },
  modalFooter: {
    padding: '12px 20px', borderTop: '1px solid #e2e8f0',
    display: 'flex', justifyContent: 'space-between', gap: 10,
    background: '#f8fafc',
  },
  // 编辑器布局
  editorLayout: {
    display: 'grid', gridTemplateColumns: '220px 1fr 240px', gap: 0, height: '100%',
  },
  templatePanel: {
    borderRight: '1px solid #e2e8f0', padding: 14, background: '#fafbfc',
    overflowY: 'auto', maxHeight: 'calc(90vh - 120px)',
  },
  templatePanelTitle: {
    fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 10,
    display: 'flex', alignItems: 'center', gap: 6,
  },
  templateItem: {
    padding: '8px 10px', borderRadius: 6, cursor: 'pointer',
    marginBottom: 4, border: '1px solid transparent', transition: 'all 0.15s',
  },
  templateItemActive: { background: '#e0e7ff', border: '1px solid #818cf8' },
  templateItemInactive: { background: '#fff', border: '1px solid #e2e8f0' },
  templateName: { fontSize: 12, fontWeight: 600, color: '#334155' },
  templateMeta: { fontSize: 10, color: '#94a3b8', marginTop: 2 },
  templateCategory: {
    display: 'inline-block', padding: '1px 5px', borderRadius: 4,
    fontSize: 10, background: '#e2e8f0', color: '#64748b', marginTop: 3,
  },
  formPanel: {
    padding: 16, overflowY: 'auto', maxHeight: 'calc(90vh - 120px)',
    display: 'flex', flexDirection: 'column', gap: 0,
  },
  // 标签页
  tabBar: {
    display: 'flex', borderBottom: '2px solid #e2e8f0', background: '#f8fafc',
    padding: '0 16px',
  },
  tab: {
    padding: '10px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer',
    borderBottom: '2px solid transparent', marginBottom: -2,
    display: 'flex', alignItems: 'center', gap: 5, color: '#64748b',
    transition: 'all 0.15s',
  },
  tabActive: {
    color: '#1a3a5c', borderBottom: '2px solid #1a3a5c', fontWeight: 600,
  },
  tabContent: {
    flex: 1, overflowY: 'auto', padding: 16,
  },
  formSection: { marginBottom: 20 },
  formSectionTitle: {
    fontSize: 13, fontWeight: 700, color: '#1a3a5c', marginBottom: 10,
    paddingBottom: 6, borderBottom: '2px solid #1a3a5c', display: 'flex',
    alignItems: 'center', gap: 6,
  },
  formGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
  },
  formGrid3: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 },
  formGroup: { display: 'flex', flexDirection: 'column', gap: 4 },
  formGroupFull: { gridColumn: '1 / -1' },
  label: { fontSize: 12, fontWeight: 600, color: '#475569' },
  required: { color: '#dc2626', marginLeft: 2 },
  input: {
    border: '1px solid #e2e8f0', borderRadius: 6, padding: '7px 10px',
    fontSize: 13, color: '#334155', outline: 'none',
  },
  textarea: {
    border: '1px solid #e2e8f0', borderRadius: 6, padding: '8px 10px',
    fontSize: 13, color: '#334155', outline: 'none', resize: 'vertical',
    minHeight: 90, fontFamily: 'inherit', lineHeight: 1.6,
  },
  checkbox: {
    display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
    fontSize: 13, color: '#334155',
  },
  checkboxInput: { width: 15, height: 15, cursor: 'pointer' },
  btnCancel: {
    padding: '8px 16px', borderRadius: 6, border: '1px solid #e2e8f0',
    background: '#fff', fontSize: 13, color: '#475569', cursor: 'pointer',
  },
  btnSubmit: {
    padding: '8px 16px', borderRadius: 6, border: 'none',
    background: '#1a3a5c', fontSize: 13, color: '#fff', cursor: 'pointer',
  },
  emptyState: {
    textAlign: 'center', padding: '60px 20px', color: '#94a3b8',
    fontSize: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
  },
  emptyStateIcon: { width: 64, height: 64, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  emptyStateTitle: { fontSize: 15, fontWeight: 600, color: '#64748b', marginTop: 4 },
  emptyStateDesc: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
  infoTip: { fontSize: 11, color: '#94a3b8', marginTop: 4 },
  errorBox: {
    background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6,
    padding: '10px 14px', marginBottom: 14,
  },
  successBox: {
    background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6,
    padding: '10px 14px', marginBottom: 14,
  },
  templatePreview: {
    background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 6,
    padding: '12px 14px', marginBottom: 16, fontSize: 13, color: '#7c5914',
    lineHeight: 1.7, whiteSpace: 'pre-wrap', maxHeight: 200, overflowY: 'auto',
  },
  templatePreviewTitle: {
    fontSize: 11, fontWeight: 600, color: '#d48806', marginBottom: 6, display: 'flex',
    alignItems: 'center', gap: 4,
  },
  patientInfoBox: {
    background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8,
    padding: '12px 16px', marginBottom: 16,
  },
  patientInfoGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12,
  },
  patientInfoItem: { display: 'flex', flexDirection: 'column', gap: 2 },
  patientInfoLabel: { fontSize: 11, color: '#64748b' },
  patientInfoValue: { fontSize: 13, fontWeight: 600, color: '#1a3a5c' },
  criticalBox: {
    background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6,
    padding: '10px 14px', marginBottom: 14, display: 'flex', alignItems: 'flex-start', gap: 8,
  },
  criticalLabel: {
    background: '#dc2626', color: '#fff', padding: '2px 8px', borderRadius: 4,
    fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap',
  },
  criticalText: { fontSize: 13, color: '#991b1b', flex: 1, lineHeight: 1.5 },
  statusTag: {
    display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px',
    borderRadius: 12, fontSize: 12, fontWeight: 600,
  },
  // 右侧短语面板
  phrasePanel: {
    borderLeft: '1px solid #e2e8f0', padding: 14, background: '#fafbfc',
    overflowY: 'auto', maxHeight: 'calc(90vh - 120px)',
  },
  phrasePanelTitle: {
    fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 10,
    display: 'flex', alignItems: 'center', gap: 6,
  },
  phraseCategory: {
    fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6,
    marginTop: 12, display: 'flex', alignItems: 'center', gap: 4,
  },
  phraseItem: {
    padding: '5px 8px', background: '#fff', border: '1px solid #e2e8f0',
    borderRadius: 5, fontSize: 11, color: '#334155', cursor: 'pointer',
    marginBottom: 4, lineHeight: 1.5, transition: 'all 0.15s',
  },
  phraseItemHover: {
    background: '#f0f9ff', border: '1px solid #7dd3fc',
    color: '#0369a1',
  },
  // 活检管理
  biopsyCard: {
    background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8,
    padding: '12px 14px', marginBottom: 8,
  },
  biopsyCardHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 8,
  },
  biopsyCardTitle: {
    fontSize: 12, fontWeight: 600, color: '#334155',
    display: 'flex', alignItems: 'center', gap: 5,
  },
  biopsyCardBody: {
    display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 100px', gap: 8,
  },
  biopsyStatusBadge: {
    padding: '2px 6px', borderRadius: 10, fontSize: 10, fontWeight: 600,
  },
  // 图片 gallery
  imageGallery: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
    gap: 10, marginTop: 10,
  },
  imageThumb: {
    position: 'relative', borderRadius: 8, overflow: 'hidden',
    border: '2px solid #e2e8f0', aspectRatio: '4/3',
    cursor: 'pointer', transition: 'all 0.15s',
  },
  imageThumbSelected: { border: '2px solid #1a3a5c' },
  imageThumbPlaceholder: {
    width: '100%', height: '100%', background: '#f1f5f9',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexDirection: 'column', gap: 4,
  },
  imageThumbOverlay: {
    position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    opacity: 0, transition: 'opacity 0.15s',
  },
  imageQCWarn: {
    position: 'absolute', top: 4, right: 4,
    background: '#fee2e2', border: '1px solid #fca5a5',
    borderRadius: 4, padding: '1px 4px', fontSize: 9, color: '#dc2626',
    fontWeight: 700,
  },
  imageQCWarnOrange: {
    background: '#ffedd5', border: '1px solid #fdba74', color: '#ea580c',
  },
  imageQCWarnGreen: {
    background: '#dcfce7', border: '1px solid #86efac', color: '#16a34a',
  },
  uploadBox: {
    border: '2px dashed #cbd5e1', borderRadius: 8, aspectRatio: '4/3',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', gap: 6, cursor: 'pointer',
    color: '#94a3b8', fontSize: 12, transition: 'all 0.15s',
  },
  uploadBoxHover: {
    border: '2px dashed #94a3b8', background: '#f8fafc', color: '#64748b',
  },
  // AI 辅助
  aiBox: {
    background: 'linear-gradient(135deg, #667eea11 0%, #764ba211 100%)',
    border: '1px solid #818cf8', borderRadius: 8, padding: '14px 16px',
    marginBottom: 14,
  },
  aiBoxHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 10,
  },
  aiBoxTitle: {
    fontSize: 13, fontWeight: 700, color: '#4338ca',
    display: 'flex', alignItems: 'center', gap: 6,
  },
  aiText: {
    background: '#fff', borderRadius: 6, padding: '10px 12px',
    fontSize: 13, color: '#334155', lineHeight: 1.7, whiteSpace: 'pre-wrap',
    maxHeight: 200, overflowY: 'auto', border: '1px solid #e0e7ff',
  },
  // 术语提示
  termHintBox: {
    position: 'absolute', background: '#fff', border: '1px solid #e2e8f0',
    borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    zIndex: 100, maxHeight: 200, overflowY: 'auto', minWidth: 200,
  },
  termHintItem: {
    padding: '8px 12px', fontSize: 12, color: '#334155', cursor: 'pointer',
    borderBottom: '1px solid #f1f5f9',
  },
  termHintItemLast: { borderBottom: 'none' },
  // 打印预览
  printPreviewOverlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 2000, padding: '2vh 2vw',
  },
  printPreviewModal: {
    background: '#fff', borderRadius: 12, width: 800, maxHeight: '96vh',
    overflow: 'hidden', display: 'flex', flexDirection: 'column',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  printContent: {
    padding: 40, overflowY: 'auto', flex: 1, background: '#fff',
    fontFamily: 'SimSun, "宋体", serif', fontSize: 14, lineHeight: 1.8,
  },
  printHospitalName: {
    textAlign: 'center', fontSize: 20, fontWeight: 700, color: '#1a3a5c',
    marginBottom: 8, letterSpacing: 2,
  },
  printReportTitle: {
    textAlign: 'center', fontSize: 16, fontWeight: 600, color: '#1a3a5c',
    marginBottom: 20, paddingBottom: 10,
    borderBottom: '2px solid #1a3a5c',
  },
  printInfoGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px 16px',
    marginBottom: 16, padding: '10px 14px', background: '#f8fafc',
    borderRadius: 6, border: '1px solid #e2e8f0',
  },
  printInfoItem: { display: 'flex', gap: 6 },
  printLabel: { fontWeight: 600, color: '#475569', fontSize: 13, minWidth: 70 },
  printValue: { color: '#1a3a5c', fontSize: 13 },
  printSection: { marginBottom: 16 },
  printSectionTitle: {
    fontSize: 13, fontWeight: 700, color: '#1a3a5c', marginBottom: 8,
    paddingLeft: 8, borderLeft: '3px solid #1a3a5c',
  },
  printText: { fontSize: 13, color: '#334155', whiteSpace: 'pre-wrap', lineHeight: 1.9 },
  printConclusion: {
    background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 6,
    padding: '10px 14px', fontSize: 13, color: '#7c5914',
    whiteSpace: 'pre-wrap', lineHeight: 1.9,
  },
  printSignature: {
    display: 'flex', justifyContent: 'flex-end', gap: 30, marginTop: 30,
    fontSize: 13, color: '#475569',
  },
  printFooter: {
    textAlign: 'center', marginTop: 20, paddingTop: 10,
    borderTop: '1px solid #e2e8f0', fontSize: 11, color: '#94a3b8',
  },
  // 审核弹窗
  auditBox: {
    background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8,
    padding: '16px 20px', marginBottom: 16,
  },
  auditTitle: {
    fontSize: 13, fontWeight: 700, color: '#065f46', marginBottom: 10,
    display: 'flex', alignItems: 'center', gap: 6,
  },
  // 图片标注
  annotationCanvas: {
    position: 'absolute', inset: 0, cursor: 'crosshair',
  },
  annotationRedBox: {
    position: 'absolute', border: '2px solid #dc2626', cursor: 'move',
  },
  // ========== 新增：质量评分 ==========
  qualityScoreCard: {
    background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8,
    padding: '12px 16px', marginBottom: 14,
  },
  qualityScoreHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 12,
  },
  qualityScoreTitle: {
    fontSize: 13, fontWeight: 700, color: '#1a3a5c',
    display: 'flex', alignItems: 'center', gap: 6,
  },
  qualityScoreTotal: {
    display: 'flex', alignItems: 'center', gap: 8,
  },
  qualityScoreNumber: {
    fontSize: 24, fontWeight: 800,
    fontFamily: 'monospace',
  },
  qualityScoreBar: {
    width: 120, height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden',
  },
  qualityScoreBarFill: { height: '100%', borderRadius: 4, transition: 'width 0.3s' },
  qualityBreakdownItem: {
    display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8,
  },
  qualityBreakdownLabel: { fontSize: 12, color: '#475569', minWidth: 70 },
  qualityBreakdownBar: {
    flex: 1, height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden',
  },
  qualityBreakdownScore: {
    fontSize: 11, fontFamily: 'monospace', color: '#64748b', minWidth: 40, textAlign: 'right',
  },
  qualityBreakdownDetail: { fontSize: 10, color: '#94a3b8', marginLeft: 6 },
  // ========== 新增：历史参考 ==========
  historyPanel: {
    background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8,
    padding: '12px 14px', marginBottom: 14,
  },
  historyPanelTitle: {
    fontSize: 12, fontWeight: 700, color: '#1a3a5c', marginBottom: 10,
    display: 'flex', alignItems: 'center', gap: 6,
  },
  historyItem: {
    background: '#fff', border: '1px solid #e2e8f0', borderRadius: 6,
    padding: '8px 10px', marginBottom: 6, cursor: 'pointer', transition: 'all 0.15s',
  },
  historyItemMeta: {
    fontSize: 11, color: '#64748b', marginBottom: 4,
    display: 'flex', justifyContent: 'space-between',
  },
  historyItemFindings: {
    fontSize: 11, color: '#334155', whiteSpace: 'pre-wrap', lineHeight: 1.5,
    maxHeight: 40, overflow: 'hidden',
  },
  // ========== 新增：诊断模板 ==========
  diagTemplateGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10,
  },
  diagTemplateCard: {
    background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8,
    padding: '10px 12px', cursor: 'pointer', transition: 'all 0.15s',
  },
  diagTemplateCategory: {
    fontSize: 10, color: '#818cf8', fontWeight: 600, marginBottom: 4,
  },
  diagTemplateTitle: {
    fontSize: 12, fontWeight: 700, color: '#1a3a5c', marginBottom: 4,
  },
  diagTemplatePreview: {
    fontSize: 10, color: '#64748b', whiteSpace: 'pre-wrap', lineHeight: 1.4,
    maxHeight: 36, overflow: 'hidden',
  },
  // ========== 新增：AI辅助面板 ==========
  aiAssistPanel: {
    background: 'linear-gradient(135deg, #667eea11 0%, #764ba211 100%)',
    border: '1px solid #818cf8', borderRadius: 8, padding: '14px 16px',
    marginBottom: 14,
  },
  aiAssistHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 10,
  },
  aiAssistTitle: {
    fontSize: 13, fontWeight: 700, color: '#4338ca',
    display: 'flex', alignItems: 'center', gap: 6,
  },
  aiAssistSection: {
    marginBottom: 12,
  },
  aiAssistSectionLabel: {
    fontSize: 11, fontWeight: 600, color: '#4338ca', marginBottom: 6,
  },
  aiAssistText: {
    background: '#fff', borderRadius: 6, padding: '8px 10px',
    fontSize: 12, color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-wrap',
    border: '1px solid #e0e7ff',
  },
  aiAssistActions: {
    display: 'flex', gap: 8, flexWrap: 'wrap',
  },
  // ========== 新增：图片标注画布 ==========
  annotationOverlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 3000, cursor: 'crosshair',
  },
  annotationModal: {
    background: '#fff', borderRadius: 12, padding: 0,
    maxWidth: '90vw', maxHeight: '90vh', overflow: 'hidden',
    display: 'flex', flexDirection: 'column',
  },
  annotationImgContainer: {
    position: 'relative', flex: 1, overflow: 'hidden',
    background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  annotationToolbar: {
    padding: '10px 16px', background: '#f8fafc', borderTop: '1px solid #e2e8f0',
    display: 'flex', gap: 10, alignItems: 'center',
  },
  // ========== 新增：22张图片标准面板 ==========
  photoStdPanel: {
    borderLeft: '1px solid #e2e8f0', padding: 14, background: '#fafbfc',
    overflowY: 'auto', maxHeight: 'calc(90vh - 120px)',
  },
  photoStdPanelTitle: {
    fontSize: 12, fontWeight: 700, color: '#1a3a5c', marginBottom: 10,
    display: 'flex', alignItems: 'center', gap: 6,
  },
  photoStdGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6,
  },
  photoStdItem: {
    background: '#fff', border: '1px solid #e2e8f0', borderRadius: 6,
    padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: 2,
    transition: 'all 0.15s', cursor: 'pointer',
  },
  photoStdItemCaptured: {
    background: '#f0fdf4', border: '1px solid #86efac',
  },
  photoStdItemRequired: {
    borderLeft: '2px solid #dc2626',
  },
  photoStdItemName: { fontSize: 11, fontWeight: 600, color: '#334155' },
  photoStdItemDesc: { fontSize: 9, color: '#94a3b8' },
  photoStdStatusBadge: {
    display: 'inline-flex', alignItems: 'center', gap: 2,
    padding: '1px 4px', borderRadius: 6, fontSize: 9, fontWeight: 600,
    marginTop: 2,
  },
  photoStdProgress: {
    marginTop: 10, padding: '8px 10px', background: '#f8fafc',
    borderRadius: 6, border: '1px solid #e2e8f0',
  },
  photoStdProgressBar: {
    height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden', marginTop: 6,
  },
  photoStdProgressFill: { height: '100%', borderRadius: 3, transition: 'width 0.3s' },
  photoStdProgressText: { fontSize: 11, color: '#64748b', marginTop: 4 },
  // ========== 新增：结构化模板选择 ==========
  structTemplateGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14,
  },
  structTemplateCard: {
    background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8,
    padding: '10px 12px', cursor: 'pointer', transition: 'all 0.15s',
    display: 'flex', flexDirection: 'column', gap: 4,
  },
  structTemplateCardActive: {
    background: '#e0e7ff', border: '1px solid #818cf8',
  },
  structTemplateHeader: {
    display: 'flex', alignItems: 'center', gap: 6,
  },
  structTemplateIcon: { fontSize: 16 },
  structTemplateLabel: { fontSize: 12, fontWeight: 700, color: '#1a3a5c' },
  structTemplateDesc: { fontSize: 10, color: '#64748b' },
  // ========== 新增：图片标注工具栏 ==========
  annotationToolBar: {
    display: 'flex', gap: 8, alignItems: 'center', padding: '8px 0',
  },
  annotationToolBtn: {
    display: 'flex', alignItems: 'center', gap: 4,
    padding: '6px 12px', borderRadius: 6, border: '1px solid #e2e8f0',
    background: '#fff', fontSize: 12, cursor: 'pointer', color: '#475569',
    transition: 'all 0.15s',
  },
  annotationToolBtnActive: {
    background: '#2563eb', color: '#fff', border: '1px solid #2563eb',
  },
  annotationToolBtnDanger: {
    background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5',
  },
  annotationColorPicker: {
    display: 'flex', gap: 4, alignItems: 'center',
  },
  annotationColorDot: {
    width: 20, height: 20, borderRadius: '50%', cursor: 'pointer', border: '2px solid transparent',
    transition: 'all 0.15s',
  },
  annotationColorDotActive: {
    border: '2px solid #1a3a5c', transform: 'scale(1.2)',
  },
  // ========== 新增：报告预览优化 ==========
  printPreviewToolbar: {
    padding: '10px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0',
    display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'space-between',
  },
  printPreviewActions: { display: 'flex', gap: 8 },
  // ========== 新增：术语提示完善 ==========
  termHintSection: {
    marginTop: 10, padding: '10px 12px', background: '#f8fafc',
    borderRadius: 6, border: '1px solid #e2e8f0',
  },
  termHintSectionTitle: {
    fontSize: 11, fontWeight: 600, color: '#475569', marginBottom: 8,
    display: 'flex', alignItems: 'center', gap: 4,
  },
  termHintGrid: {
    display: 'flex', flexWrap: 'wrap', gap: 4,
  },
  termHintChip: {
    padding: '3px 8px', background: '#fff', border: '1px solid #e2e8f0',
    borderRadius: 12, fontSize: 11, color: '#334155', cursor: 'pointer',
    transition: 'all 0.15s',
  },
  termHintChipHover: {
    background: '#e0e7ff', border: '1px solid #818cf8', color: '#4338ca',
  },
}

// ---------- 状态标签样式映射 ----------
const statusBadgeStyle = (status: ReportStatus): React.CSSProperties => {
  const map: Record<ReportStatus, React.CSSProperties> = {
    '未开始': { background: '#f1f5f9', color: '#64748b' },
    '书写中': { background: '#dbeafe', color: '#1d4ed8' },
    '待审核': { background: '#e0e7ff', color: '#4338ca' },
    '已审核': { background: '#d1fae5', color: '#065f46' },
    '已打印': { background: '#fce7f3', color: '#be185d' },
    '已发布': { background: '#d1fae5', color: '#065f46' },
  }
  return { ...s.statusTag, ...map[status] }
}

const biopsyStatusColor = (status: BiopsySite['status']): string => {
  const map: Record<BiopsySite['status'], string> = {
    '下单': '#3b82f6', '已送': '#f59e0b', '已回': '#10b981',
  }
  return map[status]
}

// ---------- 空报告 ----------
const emptyReport = (exam?: typeof initialUltrasoundExams[0]): Partial<UltrasoundReport> => {
  const now = new Date().toISOString().slice(0, 16).replace('T', ' ')
  return {
    examId: exam?.id || '',
    patientId: exam?.patientId || '',
    patientName: exam?.patientName || '',
    gender: exam?.gender || '男',
    age: exam?.age || 0,
    examItemName: exam?.examItemName || '',
    examDate: exam?.examDate || new Date().toISOString().split('T')[0],
    doctorId: exam?.doctorId || '',
    doctorName: exam?.doctorName || '',
    chiefComplaint: exam?.findings ? '' : '',
    history: '',
    diagnosis: '',
    indications: '',
    anesthesiaMethod: exam?.anesthesiaMethod || '',
    findings: '',
    imageUrls: [],
    biopsyTaken: false,
    biopsyCount: 0,
    biopsyResult: '',
    conclusion: '',
    recommendations: '',
    status: '未开始',
    criticalValue: false,
    templateId: '',
    templateName: '',
    createdTime: now,
    updatedTime: now,
  }
}

// ---------- 模板变量替换 ----------
const replaceTemplateVars = (text: string, report: Partial<UltrasoundReport>): string => {
  const now = new Date().toISOString().slice(0, 10)
  return text
    .replace(/\{\{patientName\}\}/g, report.patientName || '')
    .replace(/\{\{age\}\}/g, String(report.age || ''))
    .replace(/\{\{gender\}\}/g, report.gender || '')
    .replace(/\{\{examType\}\}/g, report.examItemName || '')
    .replace(/\{\{doctor\}\}/g, report.doctorName || '')
    .replace(/\{\{date\}\}/g, report.examDate || now)
    .replace(/\{\{chiefComplaint\}\}/g, report.chiefComplaint || '')
    .replace(/\{\{diagnosis\}\}/g, report.diagnosis || '')
    .replace(/\{\{conclusion\}\}/g, report.conclusion || '')
}

// ---------- 图片类型 ----------
interface ReportImage {
  id: string
  url: string
  annotation?: { x: number; y: number; w: number; h: number } | null
}

// ---------- 主组件 ----------
export default function ReportWritePage() {
  const [reports, setReports] = (useState as any)<UltrasoundReport[]>(initialUltrasoundReports)
  const [templates] = (useState as any)<ReportTemplate[]>(initialReportTemplates)
  const [exams] = useState(typeof initialUltrasoundExams !== 'undefined' ? initialUltrasoundExams : [])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = (useState as any)<ReportStatus | ''>('')
  const [page, setPage] = useState(1)
  const pageSize = 8

  const [modalMode, setModalMode] = (useState as any)<'view' | 'edit' | 'new' | null>(null)
  const [editingReport, setEditingReport] = useState<Partial<UltrasoundReport>>(emptyReport())
  const [selectedTemplate, setSelectedTemplate] = (useState as any)<ReportTemplate | null>(null)
  const [selectedStructTemplate, setSelectedStructTemplate] = (useState as any)<(typeof STRUCTURED_TEMPLATES)[0] | null>(null)
  const [formErrors, setFormErrors] = (useState as any)<string[]>([])
  const [submitSuccess, setSubmitSuccess] = useState(false)

  // 关联的检查信息
  const [linkedExam, setLinkedExam] = (useState as any)<typeof initialUltrasoundExams[0] | null>(null)

  // 多标签页
  const [activeTab, setActiveTab] = useState('basic')
  const TABS = [
    { key: 'basic', label: '基本信息', icon: <User size={13} /> },
    { key: 'findings', label: '检查所见', icon: <Stethoscope size={13} /> },
    { key: 'diagnosis', label: '诊断意见', icon: <FileText size={13} /> },
    { key: 'surgery', label: '手术描述', icon: <Scissors size={13} /> },
    { key: 'anesthesia', label: '麻醉记录', icon: <Pill size={13} /> },
    { key: 'appendix', label: '附录', icon: <BookOpen size={13} /> },
  ]

  // 活检管理
  const [biopsySites, setBiopsySites] = (useState as any)<BiopsySite[]>([])

  // 图片 gallery
  const [reportImages, setReportImages] = (useState as any)<ReportImage[]>([])
  const [selectedImageId, setSelectedImageId] = (useState as any)<string | null>(null)
  const [annotatingImageId, setAnnotatingImageId] = (useState as any)<string | null>(null)
  const [activePhotoTab, setActivePhotoTab] = (useState as any)<'standard' | 'gallery'>('standard')
  const [annotationTool, setAnnotationTool] = (useState as any)<'rect' | 'arrow' | 'text' | null>(null)
  const [annotationColor, setAnnotationColor] = useState('#dc2626')
  const [annotationTexts, setAnnotationTexts] = (useState as any)<{ x: number; y: number; text: string; color: string }[]>([])
  const [annotationArrows, setAnnotationArrows] = (useState as any)<{ x1: number; y1: number; x2: number; y2: number; color: string }[]>([])
  const [annDragStart, setAnnDragStart] = (useState as any)<{ x: number; y: number } | null>(null)
  const annotationColors = ['#dc2626', '#ea580c', '#16a34a', '#2563eb', '#7c3aed', '#fff']
  const isGastro = (editingReport.examItemName || '').includes('胃镜')
  const currentStandard = isGastro ? GASTROSCOPY_22_STANDARD : COLONOSCOPY_22_STANDARD
  const capturedCount = Math.min(reportImages.length, currentStandard.length)
  const capturedPercent = currentStandard.length > 0 ? Math.round(capturedCount / currentStandard.length * 100) : 0
  const requiredTotal = currentStandard.filter(s => s.required).length
  const requiredCapturedCount = Math.min(
    reportImages.filter(img => img.isRequired).length,
    requiredTotal
  )
  const [hoveredPhrase, setHoveredPhrase] = (useState as any)<string | null>(null)

  // AI 辅助
  const [aiContent, setAiContent] = (useState as any)<{ findings: string; conclusion: string } | null>(null)
  const [showAIBox, setShowAIBox] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)

  // 术语提示
  const [termHints, setTermHints] = (useState as any)<{ keyword: string; suggestions: string[] } | null>(null)
  const [termHintVisible, setTermHintVisible] = useState(false)
  const findingsRef = (useRef as any)<HTMLTextAreaElement>(null)

  // 打印预览
  const [showPrintPreview, setShowPrintPreview] = useState(false)

  // 审核弹窗
  const [showAuditModal, setShowAuditModal] = useState(false)
  const [auditDoctorName, setAuditDoctorName] = useState('')
  const [auditSuggestion, setAuditSuggestion] = useState('')

  // 手术描述/麻醉记录/附录 local state
  const [surgeryDesc, setSurgeryDesc] = useState('')
  const [anesthesiaDesc, setAnesthesiaDesc] = useState('')
  const [appendixNotes, setAppendixNotes] = useState('')

  // ========== 新增：质量评分 ==========
  const [qualityScore, setQualityScore] = (useState as any)<{ total: number; breakdown: { key: string; label: string; score: number; detail: string; weight: number }[] } | null>(null)

  // ========== 新增：历史参考 ==========
  const [historyReports, setHistoryReports] = (useState as any)<{ id: string; date: string; examType: string; findings: string; conclusion: string }[]>([])
  const [showHistoryPanel, setShowHistoryPanel] = useState(false)

  // ========== 新增：诊断模板弹窗 ==========
  const [showDiagTemplateModal, setShowDiagTemplateModal] = useState(false)

  // 过滤
  const filtered = useMemo(() => {
    const kw = search.trim().toLowerCase()
    return reports.filter(r => {
      const matchSearch = !kw ||
        (r.patientName ?? "").toLowerCase().includes(kw) ||
        (r.examItemName ?? "").toLowerCase().includes(kw) ||
        r.doctorName.toLowerCase().includes(kw) ||
        r.id.toLowerCase().includes(kw)
      const matchStatus = !statusFilter || r.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [reports, search, statusFilter])

  // 分页
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  // 打开新增
  const openNew = () => {
    setEditingReport(emptyReport())
    setSelectedTemplate(null)
    setLinkedExam(null)
    setFormErrors([])
    setSubmitSuccess(false)
    setModalMode('new')
    setActiveTab('basic')
    setBiopsySites([])
    setReportImages([])
    setAiContent(null)
    setShowAIBox(false)
    setSurgeryDesc('')
    setAnesthesiaDesc('')
    setAppendixNotes('')
  }

  // 从列表打开编辑
  const openEdit = (r: UltrasoundReport) => {
    setEditingReport({ ...r })
    setSelectedTemplate(templates.find(t => t.id === r.templateId) || null)
    setLinkedExam(null)
    setFormErrors([])
    setSubmitSuccess(false)
    setModalMode('edit')
    setActiveTab('basic')
    setBiopsySites(r.biopsyTaken && r.biopsyCount ? Array.from({ length: r.biopsyCount }, (_, i) => ({
      id: `BIOPSY_${i + 1}`,
      number: String(i + 1),
      bottleNumber: '',
      location: '',
      status: '下单' as BiopsySite['status'],
    })) : [])
    setReportImages(r.imageUrls.map((url, i) => ({ id: `IMG_${i}`, url })))
    setAiContent(null)
    setShowAIBox(false)
    setSurgeryDesc('')
    setAnesthesiaDesc('')
    setAppendixNotes('')
  }

  // 从列表打开查看
  const openView = (r: UltrasoundReport) => {
    setEditingReport({ ...r })
    setSelectedTemplate(templates.find(t => t.id === r.templateId) || null)
    setModalMode('view')
  }

  const closeModal = () => {
    setModalMode(null)
    setFormErrors([])
    setSubmitSuccess(false)
    setShowPrintPreview(false)
    setShowAuditModal(false)
    setAuditDoctorName('')
    setAuditSuggestion('')
  }

  // 选择模板
  const handleSelectTemplate = (tpl: ReportTemplate) => {
    setSelectedTemplate(tpl)
    const replaced = replaceTemplateVars(tpl.content, editingReport)
    setEditingReport(prev => ({
      ...prev,
      templateId: tpl.id,
      templateName: tpl.name,
      findings: replaced,
    }))
  }

  // 关联检查
  const handleLinkExam = (examId: string) => {
    const exam = exams.find(e => e.id === examId)
    if (exam) {
      setLinkedExam(exam)
      setEditingReport(prev => ({
        ...prev,
        examId: exam.id,
        patientId: exam.patientId,
        patientName: exam.patientName,
        gender: exam.gender,
        age: exam.age,
        examItemName: exam.examItemName,
        examDate: exam.examDate,
        doctorId: exam.doctorId,
        doctorName: exam.doctorName,
        anesthesiaMethod: exam.anesthesiaMethod,
        chiefComplaint: exam.findings,
        findings: '',
      }))
    }
  }

  // 字段更新
  const handleField = (field: keyof Partial<UltrasoundReport>, value: string | number | boolean | string[]) => {
    setEditingReport(prev => ({ ...prev, [field]: value, updatedTime: new Date().toISOString().slice(0, 16).replace('T', ' ') }))
  }

  // 术语提示
  const handleFindingsChange = (value: string) => {
    handleField('findings', value)
    // 检测关键词
    const lastWord = value.split(/[\s\n]+/).pop() || ''
    if (lastWord.length >= 2) {
      const matched = Object.entries(TERM_HINTS).find(([k]) => k.includes(lastWord) || lastWord.includes(k))
      if (matched) {
        setTermHints({ keyword: lastWord, suggestions: matched[1] })
        setTermHintVisible(true)
      } else {
        setTermHintVisible(false)
      }
    } else {
      setTermHintVisible(false)
    }
  }

  const insertHint = (hint: string) => {
    const ta = findingsRef.current
    if (ta) {
      const start = ta.selectionStart
      const end = ta.selectionEnd
      const current = editingReport.findings || ''
      const newVal = current.substring(0, start) + hint + current.substring(end)
      handleField('findings', newVal)
      setTermHintVisible(false)
    }
  }

  // 短语插入
  const insertPhrase = (phrase: string, target: 'findings' | 'conclusion') => {
    if (target === 'findings') {
      const current = editingReport.findings || ''
      handleField('findings', current + (current ? '\n' : '') + phrase)
    } else {
      const current = editingReport.conclusion || ''
      handleField('conclusion', current + (current ? '\n' : '') + phrase)
    }
  }

  // 活检管理
  const addBiopsySite = () => {
    const newSite: BiopsySite = {
      id: 'BIOPSY_' + Date.now(),
      number: String(biopsySites.length + 1),
      bottleNumber: '',
      location: '',
      status: '下单',
    }
    setBiopsySites(prev => [...prev, newSite])
    handleField('biopsyTaken', true)
    handleField('biopsyCount', biopsySites.length + 1)
  }

  const removeBiopsySite = (id: string) => {
    setBiopsySites(prev => prev.filter(s => s.id !== id).map((s, i) => ({ ...s, number: String(i + 1) })))
    handleField('biopsyCount', Math.max(0, biopsySites.length - 1))
  }

  const updateBiopsySite = (id: string, field: keyof BiopsySite, value: string) => {
    setBiopsySites(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s))
  }

  // 图片管理
  const handleImageUpload = () => {
    const newImg: ReportImage = {
      id: 'IMG_' + Date.now(),
      url: `https://picsum.photos/seed/${Date.now()}/400/300`,
      annotation: null,
    }
    setReportImages(prev => [...prev, newImg])
  }

  const removeImage = (id: string) => {
    setReportImages(prev => prev.filter(img => img.id !== id))
    setSelectedImageId(prev => prev === id ? null : prev)
    setAnnotatingImageId(prev => prev === id ? null : prev)
  }

  const toggleAnnotate = (id: string) => {
    setAnnotatingImageId(prev => prev === id ? null : id)
    setReportImages(prev => prev.map(img =>
      img.id === id ? { ...img, annotation: img.annotation || { x: 20, y: 20, w: 60, h: 40 } } : img
    ))
  }

  // AI 辅助
  const handleAIGenerate = () => {
    setAiLoading(true)
    setTimeout(() => {
      const examType = editingReport.examItemName || ''
      const ai = AI_CONTENT[examType] || AI_CONTENT['电子胃镜检查']
      const replacedFindings = replaceTemplateVars(ai.findings, editingReport)
      const replacedConclusion = replaceTemplateVars(ai.conclusion, editingReport)
      setAiContent({ findings: replacedFindings, conclusion: replacedConclusion })
      setShowAIBox(true)
      setAiLoading(false)
    }, 1500)
  }

  const adoptAIFindings = () => {
    if (aiContent) {
      handleField('findings', aiContent.findings)
      setShowAIBox(false)
    }
  }

  const adoptAIConclusion = () => {
    if (aiContent) {
      handleField('conclusion', aiContent.conclusion)
      setShowAIBox(false)
    }
  }

  // 校验
  const validateReport = (r: Partial<UltrasoundReport>): string[] => {
    const errs: string[] = []
    if (!(r.patientName ?? "").trim()) errs.push('患者姓名不能为空')
    if (!(r.examItemName ?? "").trim()) errs.push('检查项目不能为空')
    if (!(r.findings ?? "").trim()) errs.push('检查所见不能为空')
    if (!(r.conclusion ?? "").trim()) errs.push('结论不能为空')
    return errs
  }

  // 保存草稿
  const handleSaveDraft = () => {
    const errs = validateReport(editingReport)
    if (errs.length > 0) { setFormErrors(errs); return }
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ')
    const finalImages = reportImages.map(img => img.url)
    if (modalMode === 'new') {
      const id = 'RPT' + Date.now().toString().slice(-6)
      setReports((prev: UltrasoundReport[]) => [{ ...editingReport, id, status: '书写中', imageUrls: finalImages, createdTime: now, updatedTime: now }, ...prev])
    } else {
      setReports((prev: UltrasoundReport[]) => prev.map(r => r.id === editingReport.id ? { ...editingReport, imageUrls: finalImages, status: r.status === '未开始' ? '书写中' : r.status, updatedTime: now } as UltrasoundReport : r))
    }
    setFormErrors([])
    setSubmitSuccess(true)
    setTimeout(() => setSubmitSuccess(false), 3000)
  }

  // 提交报告
  const handleSubmitReport = () => {
    const errs = validateReport(editingReport)
    if (errs.length > 0) { setFormErrors(errs); return }
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ')
    const finalImages = reportImages.map(img => img.url)
    if (modalMode === 'new') {
      const id = 'RPT' + Date.now().toString().slice(-6)
      setReports((prev: UltrasoundReport[]) => [{ ...editingReport, id, status: '待审核', imageUrls: finalImages, createdTime: now, updatedTime: now }, ...prev])
    } else {
      setReports((prev: UltrasoundReport[]) => prev.map(r => r.id === editingReport.id ? { ...editingReport, imageUrls: finalImages, status: '待审核', updatedTime: now } as UltrasoundReport : r))
    }
    setEditingReport(prev => ({ ...prev, status: '待审核' }))
    closeModal()
  }

  // 审核报告
  const handleAuditReport = () => {
    if (!auditDoctorName.trim()) return
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ')
    setReports((prev: UltrasoundReport[]) => prev.map(r => r.id === editingReport.id ? {
      ...r,
      status: '已审核',
      auditDoctorId: 'U002',
      auditDoctorName: auditDoctorName,
      auditTime: now,
      auditSuggestion: auditSuggestion,
    } as UltrasoundReport : r))
    setEditingReport(prev => ({ ...prev, status: '已审核', auditDoctorId: 'U002', auditDoctorName: auditDoctorName, auditTime: now, auditSuggestion }))
    setShowAuditModal(false)
    setFormErrors([])
    setSubmitSuccess(true)
    setTimeout(() => setSubmitSuccess(false), 3000)
  }

  // 打印
  const handlePrint = () => {
    setShowPrintPreview(true)
  }

  const executePrint = () => {
    window.print()
  }

  // 图片数量质控
  const getImageQCStatus = () => {
    const count = reportImages.length
    const isGastro = (editingReport.examItemName || '').includes('胃镜')
    const min = isGastro ? GASTROSCOPY_MIN_PHOTOS : COLONOSCOPY_MIN_PHOTOS
    if (count < min) return 'warn'
    if (count === min) return 'ok'
    return 'pass'
  }

  const imageQCStatus = getImageQCStatus()

  // ========== 新增：计算质量评分 ==========
  const calculateQualityScore = () => {
    const breakdown = QUALITY_CRITERIA.map(c => {
      const result = c.check(editingReport, reportImages)
      return { key: c.key, label: c.label, score: result.score, detail: result.detail, weight: c.weight }
    })
    const total = Math.round(breakdown.reduce((sum, b) => sum + (b.score * b.weight / 100), 0))
    setQualityScore({ total, breakdown })
    return total
  }

  // ========== 新增：加载历史参考 ==========
  const loadHistoryReports = () => {
    const pid = editingReport.patientId
    const history = MOCK_HISTORY_REPORTS[pid] || []
    setHistoryReports(history)
    setShowHistoryPanel(true)
  }

  // ========== 新增：应用诊断模板 ==========
  const applyDiagnosticTemplate = (tpl: { findings: string; conclusion: string }) => {
    handleField('findings', (editingReport.findings || '') + (editingReport.findings ? '\n' : '') + tpl.findings)
    handleField('conclusion', tpl.conclusion)
    setShowDiagTemplateModal(false)
  }

  // ========== 新增：图片标注交互 ==========
  const [annotatingImg, setAnnotatingImg] = (useState as any)<ReportImage | null>(null)
  const [annBox, setAnnBox] = useState({ x: 20, y: 20, w: 80, h: 60 })
  const [annDrawing, setAnnDrawing] = useState(false)
  const [annStart, setAnnStart] = (useState as any)<{ x: number; y: number } | null>(null)
  const imgRef = (useRef as any)<HTMLImageElement>(null)

  const openAnnotationEditor = (img: ReportImage) => {
    setAnnotatingImg(img)
    if (img.annotation) {
      setAnnBox({ x: img.annotation.x, y: img.annotation.y, w: img.annotation.w, h: img.annotation.h })
    } else {
      setAnnBox({ x: 20, y: 20, w: 80, h: 60 })
    }
  }

  const closeAnnotationEditor = () => {
    if (annotatingImg) {
      setReportImages(prev => prev.map(img =>
        img.id === annotatingImg.id ? { ...img, annotation: { ...annBox } } : img
      ))
    }
    setAnnotatingImg(null)
    setAnnDrawing(false)
    setAnnStart(null)
  }

  const handleAnnotationMouseDown = (e: React.MouseEvent<HTMLImageElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setAnnStart({ x, y })
    setAnnDrawing(true)
  }

  const handleAnnotationMouseMove = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!annDrawing || !annStart || !imgRef.current) return
    const rect = imgRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setAnnBox(prev => ({
      ...prev,
      x: Math.min(annStart.x, x),
      y: Math.min(annStart.y, y),
      w: Math.abs(x - annStart.x),
      h: Math.abs(y - annStart.y),
    }))
  }

  const handleAnnotationMouseUp = () => {
    setAnnDrawing(false)
    setAnnStart(null)
  }

  return (
    <div>
      {/* 页头 */}
      <div style={s.pageHeader}>
        <div style={s.title}>报告书写</div>
        <button style={s.btnPrimary} onClick={openNew}>
          <Plus size={14} /> 新建报告
        </button>
      </div>

      {/* 工具栏 */}
      <div style={s.toolbar}>
        <div style={s.searchBox}>
          <Search size={15} color="#94a3b8" />
          <input
            style={s.searchInput}
            placeholder="搜索患者姓名、检查项目、报告ID..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <select
          style={s.select}
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value as ReportStatus | ''); setPage(1) }}
        >
          <option value="">全部状态</option>
          <option value="未开始">未开始</option>
          <option value="书写中">书写中</option>
          <option value="待审核">待审核</option>
          <option value="已审核">已审核</option>
          <option value="已打印">已打印</option>
          <option value="已发布">已发布</option>
        </select>
      </div>

      {/* 表格 */}
      {paged.length === 0 ? (
        <div style={{ ...s.table, padding: '40px 0' }}>
          <div style={s.emptyState}>
            <div style={s.emptyStateIcon}><FileText size={32} color="#94a3b8" /></div>
            <div style={s.emptyStateTitle}>暂无报告信息</div>
            <div style={s.emptyStateDesc}>点击右上角「新建报告」按钮创建报告</div>
          </div>
        </div>
      ) : (
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>报告ID</th>
              <th style={s.th}>患者信息</th>
              <th style={s.th}>检查项目</th>
              <th style={s.th}>检查日期</th>
              <th style={s.th}>报告医生</th>
              <th style={s.th}>状态</th>
              <th style={s.th}>危急值</th>
              <th style={s.th}>创建时间</th>
              <th style={s.th}>操作</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(r => (
              <tr key={r.id} style={{ background: '#fff' }}>
                <td style={s.td}>
                  <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#64748b' }}>{r.id}</div>
                </td>
                <td style={s.td}>
                  <div style={{ fontWeight: 600, color: '#1a3a5c' }}>{r.patientName ?? ""}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>{r.gender} {r.age}岁</div>
                </td>
                <td style={s.td}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Stethoscope size={12} color="#94a3b8" />
                    {r.examItemName ?? ""}
                  </div>
                </td>
                <td style={s.td}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} color="#94a3b8" />
                    {r.examDate}
                  </div>
                </td>
                <td style={s.td}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <User size={12} color="#94a3b8" />
                    {r.doctorName}
                  </div>
                </td>
                <td style={s.td}>
                  <span style={statusBadgeStyle(r.status)}>{r.status}</span>
                </td>
                <td style={s.td}>
                  {r.criticalValue ? (
                    <span style={{ ...s.badge, background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <AlertTriangle size={11} /> 危急值
                    </span>
                  ) : (
                    <span style={{ color: '#94a3b8' }}>—</span>
                  )}
                </td>
                <td style={s.td}>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{r.createdTime}</div>
                </td>
                <td style={s.td}>
                  <div style={s.actions}>
                    <button style={s.btnIcon} onClick={() => openView(r)} title="查看">
                      <FileText size={13} /> 查看
                    </button>
                    {(r.status === '未开始' || r.status === '书写中') && (
                      <button style={s.btnIcon} onClick={() => openEdit(r)} title="编辑">
                        <Edit2 size={13} /> 编辑
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* 分页 */}
      <div style={s.pagination}>
        <div style={s.pageInfo}>
          共 <strong>{filtered.length}</strong> 条记录，第 <strong>{page}</strong> / <strong>{totalPages}</strong> 页
        </div>
        <div style={s.pageBtns}>
          <button
            style={{ ...s.pageBtn, ...(page === 1 ? s.pageBtnDisabled : {}) }}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft size={15} />
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let num = i + 1
            if (totalPages > 5) {
              if (page > 3) num = page - 2 + i
              if (page > totalPages - 2) num = totalPages - 4 + i
            }
            return (
              <button
                key={num}
                style={{ ...s.pageBtn, ...(page === num ? s.pageBtnActive : {}) }}
                onClick={() => setPage(num)}
              >
                {num}
              </button>
            )
          })}
          <button
            style={{ ...s.pageBtn, ...(page === totalPages ? s.pageBtnDisabled : {}) }}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {/* 弹窗 */}
      {modalMode && (
        <div style={s.overlay} onClick={e => e.target === e.currentTarget && closeModal()}>
          <div style={s.modal}>
            <div style={s.modalHeader}>
              <div style={s.modalTitle}>
                {modalMode === 'view' ? '报告预览' : modalMode === 'edit' ? '编辑报告' : '新建报告'}
                {editingReport.patientName && (
                  <span style={{ fontWeight: 400, fontSize: 13, color: '#64748b', marginLeft: 8 }}>
                    — {editingReport.patientName}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {modalMode === 'view' && editingReport.status === '已审核' && (
                  <button style={s.btnPrimary} onClick={handlePrint}>
                    <Printer size={13} /> 打印报告
                  </button>
                )}
                <button style={s.modalClose} onClick={closeModal}><X size={18} /></button>
              </div>
            </div>

            <div style={s.modalBody}>
              {modalMode !== 'view' ? (
                <>
                  {/* 标签页 */}
                  <div style={s.tabBar}>
                    {TABS.map(tab => (
                      <div
                        key={tab.key}
                        style={{ ...s.tab, ...(activeTab === tab.key ? s.tabActive : {}) }}
                        onClick={() => setActiveTab(tab.key)}
                      >
                        {tab.icon} {tab.label}
                      </div>
                    ))}
                    {/* AI 辅助按钮 */}
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8 }}>
                      <button
                        style={s.btnAIGhost}
                        onClick={handleAIGenerate}
                        disabled={aiLoading}
                      >
                        <Sparkles size={13} />
                        {aiLoading ? 'AI 生成中...' : 'AI 辅助报告'}
                      </button>
                    </div>
                  </div>

                  <div style={s.editorLayout}>
                    {/* 左侧：模板选择 */}
                    <div style={s.templatePanel}>
                      <div style={s.templatePanelTitle}>
                        <ClipboardList size={13} /> 报告模板
                      </div>

                      {/* 关联检查 */}
                      {modalMode === 'new' && exams.length > 0 && (
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ fontSize: 11, color: '#64748b', marginBottom: 5, fontWeight: 600 }}>关联检查</div>
                          <select
                            style={{ ...s.input, width: '100%', fontSize: 12 }}
                            value={editingReport.examId}
                            onChange={e => handleLinkExam(e.target.value)}
                          >
                            <option value="">— 选择关联检查 —</option>
                            {exams.filter(ex => ex.status === '已完成').map(ex => (
                              <option key={ex.id} value={ex.id}>
                                {ex.patientName} - {ex.examItemName}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* 结构化模板选择 */}
                      {modalMode === 'new' && (
                        <div style={{ marginBottom: 14, marginTop: 4 }}>
                          <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <FileText size={11} /> 结构化模板
                          </div>
                          <div style={s.structTemplateGrid}>
                            {STRUCTURED_TEMPLATES.map(tpl => (
                              <div
                                key={tpl.type}
                                style={{
                                  ...s.structTemplateCard,
                                  ...(selectedStructTemplate?.type === tpl.type ? s.structTemplateCardActive : {}),
                                }}
                                onClick={() => setSelectedStructTemplate(tpl)}
                              >
                                <div style={s.structTemplateHeader}>
                                  <span style={s.structTemplateIcon}>{tpl.icon}</span>
                                  <span style={s.structTemplateLabel}>{tpl.label}</span>
                                </div>
                                <div style={s.structTemplateDesc}>{tpl.description}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 模板列表 */}
                      {templates.map(tpl => (
                        <div
                          key={tpl.id}
                          style={{
                            ...s.templateItem,
                            ...(selectedTemplate?.id === tpl.id ? s.templateItemActive : s.templateItemInactive),
                          }}
                          onClick={() => handleSelectTemplate(tpl)}
                        >
                          <div style={s.templateName}>{tpl.name}</div>
                          <div style={s.templateCategory}>{tpl.category}</div>
                          <div style={s.templateMeta}>使用 {tpl.usageCount} 次</div>
                        </div>
                      ))}

                      {/* 模板变量说明 */}
                      <div style={{ marginTop: 16 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Tag size={11} /> 模板变量
                        </div>
                        <div style={{ fontSize: 10, color: '#94a3b8', lineHeight: 1.8 }}>
                          {['patientName', 'age', 'gender', 'examType', 'doctor', 'date'].map(v => (
                            <div key={v} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 4, padding: '2px 6px', marginBottom: 2 }}>
                              {'{{' + v + '}}'}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* 中间：表单 */}
                    <div style={s.formPanel}>
                      {/* 患者信息展示 */}
                      {editingReport.patientName && (
                        <div style={s.patientInfoBox}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: '#1a3a5c', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <User size={13} /> 患者信息
                            {editingReport.status && (
                              <span style={statusBadgeStyle(editingReport.status)}>{editingReport.status}</span>
                            )}
                          </div>
                          <div style={s.patientInfoGrid}>
                            <div style={s.patientInfoItem}><span style={s.patientInfoLabel}>姓名</span><span style={s.patientInfoValue}>{editingReport.patientName}</span></div>
                            <div style={s.patientInfoItem}><span style={s.patientInfoLabel}>性别</span><span style={s.patientInfoValue}>{editingReport.gender}</span></div>
                            <div style={s.patientInfoItem}><span style={s.patientInfoLabel}>年龄</span><span style={s.patientInfoValue}>{editingReport.age}岁</span></div>
                            <div style={s.patientInfoItem}><span style={s.patientInfoLabel}>检查项目</span><span style={s.patientInfoValue}>{editingReport.examItemName}</span></div>
                            <div style={s.patientInfoItem}><span style={s.patientInfoLabel}>检查日期</span><span style={s.patientInfoValue}>{editingReport.examDate}</span></div>
                            <div style={s.patientInfoItem}><span style={s.patientInfoLabel}>报告医生</span><span style={s.patientInfoValue}>{editingReport.doctorName}</span></div>
                            <div style={s.patientInfoItem}><span style={s.patientInfoLabel}>麻醉方式</span><span style={s.patientInfoValue}>{editingReport.anesthesiaMethod || '—'}</span></div>
                            <div style={s.patientInfoItem}><span style={s.patientInfoLabel}>模板</span><span style={s.patientInfoValue}>{editingReport.templateName || '—'}</span></div>
                          </div>
                        </div>
                      )}

                      {/* AI 辅助内容 */}
                      {showAIBox && aiContent && (
                        <div style={s.aiBox}>
                          <div style={s.aiBoxHeader}>
                            <div style={s.aiBoxTitle}>
                              <Sparkles size={14} /> AI 生成内容
                            </div>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button style={{ ...s.btnSuccess, padding: '4px 10px', fontSize: 11 }} onClick={adoptAIFindings}><Check size={11} /> 采纳所见</button>
                              <button style={{ ...s.btnSuccess, padding: '4px 10px', fontSize: 11 }} onClick={adoptAIConclusion}><Check size={11} /> 采纳结论</button>
                              <button style={s.btnIcon} onClick={() => setShowAIBox(false)}><EyeOff size={12} /></button>
                            </div>
                          </div>
                          <div style={{ fontSize: 11, fontWeight: 600, color: '#4338ca', marginBottom: 6 }}>检查所见：</div>
                          <div style={s.aiText}>{aiContent.findings}</div>
                          <div style={{ fontSize: 11, fontWeight: 600, color: '#4338ca', marginBottom: 6, marginTop: 8 }}>诊断结论：</div>
                          <div style={{ ...s.aiText, background: '#fffbe6', border: '1px solid #ffe58f' }}>{aiContent.conclusion}</div>
                        </div>
                      )}

                      {/* 提示信息 */}
                      {formErrors.length > 0 && (
                        <div style={s.errorBox}>
                          {formErrors.map((e, i) => (
                            <div key={i} style={{ fontSize: 12, color: '#dc2626', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <AlertTriangle size={12} /> {e}
                            </div>
                          ))}
                        </div>
                      )}
                      {submitSuccess && (
                        <div style={s.successBox}>
                          <div style={{ fontSize: 12, color: '#059669', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <CheckCircle2 size={14} /> 操作成功！
                          </div>
                        </div>
                      )}

                      {/* ========== 标签页内容 ========== */}

                      {/* 基本信息 */}
                      {activeTab === 'basic' && (
                        <div>
                          <div style={s.formSection}>
                            <div style={s.formSectionTitle}><User size={13} /> 主诉与病史</div>
                            <div style={s.formGrid}>
                              <div style={s.formGroup}>
                                <label style={s.label}>主诉<span style={s.required}>*</span></label>
                                <input style={s.input} value={editingReport.chiefComplaint} onChange={e => handleField('chiefComplaint', e.target.value)} placeholder="请输入主诉" />
                              </div>
                              <div style={s.formGroup}>
                                <label style={s.label}>检查指征</label>
                                <input style={s.input} value={editingReport.indications} onChange={e => handleField('indications', e.target.value)} placeholder="请输入检查指征" />
                              </div>
                              <div style={{ ...s.formGroup, ...s.formGroupFull }}>
                                <label style={s.label}>病史</label>
                                <textarea style={s.textarea} value={editingReport.history} onChange={e => handleField('history', e.target.value)} placeholder="请输入病史" />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 检查所见 */}
                      {activeTab === 'findings' && (
                        <div>
                          <div style={s.formSection}>
                            <div style={s.formSectionTitle}><Stethoscope size={13} /> 镜下所见</div>
                            <div style={{ position: 'relative' }}>
                              <textarea
                                ref={findingsRef}
                                style={{ ...s.textarea, minHeight: 180 }}
                                value={editingReport.findings}
                                onChange={e => handleFindingsChange(e.target.value)}
                                placeholder={`请填写检查所见...\n\n提示：输入关键词（如"溃疡"、"糜烂"）可获得术语提示`}
                              />
                              {/* 术语提示 */}
                              {termHintVisible && termHints && (
                                <div style={s.termHintBox}>
                                  <div style={{ padding: '6px 10px', fontSize: 11, color: '#94a3b8', borderBottom: '1px solid #e2e8f0', fontWeight: 600 }}>
                                    术语提示："{termHints.keyword}"
                                  </div>
                                  {termHints.suggestions.map((hint, i) => (
                                    <div
                                      key={i}
                                      style={{ ...s.termHintItem, ...(i === termHints.suggestions.length - 1 ? s.termHintItemLast : {}) }}
                                      onClick={() => insertHint(hint)}
                                      onMouseEnter={e => (e.currentTarget.style.background = '#f0f9ff')}
                                      onMouseLeave={e => (e.currentTarget.style.background = '')}
                                    >
                                      {hint}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div style={s.infoTip}>
                              <Tag size={10} style={{ display: 'inline', verticalAlign: 'middle' }} /> 提示：从左侧选择模板可快速填充；输入"溃疡/糜烂/息肉/炎症/肿瘤/出"获取术语提示
                            </div>
                          </div>

                          {/* 图片采集 */}
                          <div style={s.formSection}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                              <div style={{ ...s.formSectionTitle, marginBottom: 0 }}><Camera size={13} /> 超声图像采集</div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                {/* 图片质控提示 */}
                                <div style={{
                                  padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                                  ...(imageQCStatus === 'warn' ? { background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5' } :
                                    imageQCStatus === 'ok' ? { background: '#ffedd5', color: '#ea580c', border: '1px solid #fdba74' } :
                                      { background: '#dcfce7', color: '#16a34a', border: '1px solid #86efac' }),
                                }}>
                                  {(editingReport.examItemName || '').includes('胃镜') ? `胃镜` : '肠镜'}：
                                  {reportImages.length} / {(editingReport.examItemName || '').includes('胃镜') ? GASTROSCOPY_MIN_PHOTOS : COLONOSCOPY_MIN_PHOTOS} 张
                                  {imageQCStatus === 'pass' ? ' ✓ 达标' : imageQCStatus === 'ok' ? ' ⚠ 刚好达标' : ' ✗ 不达标'}
                                </div>
                                <button style={{ ...s.btnIcon }} onClick={handleImageUpload}>
                                  <Upload size={12} /> 添加图像
                                </button>
                              </div>
                            </div>

                            <div style={s.imageGallery}>
                              {reportImages.map(img => (
                                <div
                                  key={img.id}
                                  style={{
                                    ...s.imageThumb,
                                    ...(selectedImageId === img.id ? s.imageThumbSelected : {}),
                                  }}
                                  onClick={() => setSelectedImageId(img.id)}
                                >
                                  <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  {img.annotation && (
                                    <div style={{
                                      position: 'absolute',
                                      left: img.annotation.x,
                                      top: img.annotation.y,
                                      width: img.annotation.w,
                                      height: img.annotation.h,
                                      border: '2px solid #dc2626',
                                    }} />
                                  )}
                                  <div
                                    style={s.imageThumbOverlay}
                                    onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                                    onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
                                  >
                                    <button
                                      style={{ background: '#fff', border: 'none', borderRadius: 6, padding: '4px 6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, fontSize: 10 }}
                                      onClick={e => { e.stopPropagation(); openAnnotationEditor(img) }}
                                    >
                                      <Flag size={10} color="#dc2626" /> 标注
                                    </button>
                                    <button
                                      style={{ background: '#fff', border: 'none', borderRadius: 6, padding: '4px 6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, fontSize: 10 }}
                                      onClick={e => { e.stopPropagation(); removeImage(img.id) }}
                                    >
                                      <Trash2 size={10} color="#dc2626" /> 删除
                                    </button>
                                  </div>
                                </div>
                              ))}
                              <div
                                style={s.uploadBox}
                                onClick={handleImageUpload}
                                onMouseEnter={e => Object.assign(e.currentTarget.style, s.uploadBoxHover)}
                                onMouseLeave={e => Object.assign(e.currentTarget.style, { border: '2px dashed #cbd5e1', background: '', color: '#94a3b8' })}
                              >
                                <PlusCircle size={24} color="#94a3b8" />
                                <span>点击上传</span>
                              </div>
                            </div>
                          </div>

                          {/* 活检管理 */}
                          <div style={s.formSection}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                              <div style={{ ...s.formSectionTitle, marginBottom: 0 }}><Scissors size={13} /> 活检管理</div>
                              <label style={s.checkbox}>
                                <input type="checkbox" style={s.checkboxInput} checked={editingReport.biopsyTaken} onChange={e => handleField('biopsyTaken', e.target.checked)} />
                                是否活检
                              </label>
                            </div>

                            {editingReport.biopsyTaken && (
                              <>
                                {biopsySites.map(site => (
                                  <div key={site.id} style={s.biopsyCard}>
                                    <div style={s.biopsyCardHeader}>
                                      <div style={s.biopsyCardTitle}>
                                        <Circle size={10} fill={biopsyStatusColor(site.status)} color={biopsyStatusColor(site.status)} />
                                        活检 #{site.number}
                                      </div>
                                      <div style={{ display: 'flex', gap: 4 }}>
                                        {(['下单', '已送', '已回'] as BiopsySite['status'][]).map(st => (
                                          <button
                                            key={st}
                                            style={{
                                              padding: '2px 7px', borderRadius: 10, fontSize: 10, fontWeight: 600, cursor: 'pointer', border: 'none',
                                              background: site.status === st ? biopsyStatusColor(st) : '#f1f5f9',
                                              color: site.status === st ? '#fff' : '#94a3b8',
                                            }}
                                            onClick={() => updateBiopsySite(site.id, 'status', st)}
                                          >
                                            {st}
                                          </button>
                                        ))}
                                        <button style={{ ...s.btnIcon, color: '#dc2626' }} onClick={() => removeBiopsySite(site.id)}>
                                          <MinusCircle size={12} />
                                        </button>
                                      </div>
                                    </div>
                                    <div style={s.biopsyCardBody}>
                                      <div style={s.formGroup}>
                                        <label style={s.label}>瓶号</label>
                                        <input style={{ ...s.input, fontSize: 12 }} value={site.bottleNumber} onChange={e => updateBiopsySite(site.id, 'bottleNumber', e.target.value)} placeholder="瓶号" />
                                      </div>
                                      <div style={s.formGroup}>
                                        <label style={s.label}>取材位置</label>
                                        <input style={{ ...s.input, fontSize: 12 }} value={site.location} onChange={e => updateBiopsySite(site.id, 'location', e.target.value)} placeholder="如：胃窦" />
                                      </div>
                                      <div style={s.formGroup}>
                                        <label style={s.label}>病理结果</label>
                                        <input style={{ ...s.input, fontSize: 12 }} value={editingReport.biopsyResult || ''} onChange={e => handleField('biopsyResult', e.target.value)} placeholder="待回报" />
                                      </div>
                                    </div>
                                  </div>
                                ))}
                                <button style={{ ...s.btnIcon, color: '#059669' }} onClick={addBiopsySite}>
                                  <PlusCircle size={13} /> 添加活检部位
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      )}

                      {/* 诊断意见 */}
                      {activeTab === 'diagnosis' && (
                        <div>
                          <div style={s.formSection}>
                            <div style={s.formSectionTitle}><FileText size={13} /> 诊断结论</div>
                            <div style={s.formGroup}>
                              <label style={s.label}>诊断结论<span style={s.required}>*</span></label>
                              <textarea
                                style={{ ...s.textarea, minHeight: 120 }}
                                value={editingReport.conclusion}
                                onChange={e => handleField('conclusion', e.target.value)}
                                placeholder="请输入诊断结论..."
                              />
                            </div>
                          </div>
                          <div style={s.formSection}>
                            <div style={s.formSectionTitle}><Activity size={13} /> 建议</div>
                            <div style={s.formGroup}>
                              <label style={s.label}>建议</label>
                              <textarea
                                style={s.textarea}
                                value={editingReport.recommendations}
                                onChange={e => handleField('recommendations', e.target.value)}
                                placeholder="请输入建议..."
                              />
                            </div>
                          </div>
                          <div style={s.formSection}>
                            <div style={s.formSectionTitle}><Flag size={13} /> 危急值</div>
                            <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                              <label style={s.checkbox}>
                                <input type="checkbox" style={s.checkboxInput} checked={editingReport.criticalValue} onChange={e => handleField('criticalValue', e.target.checked)} />
                                标记为危急值
                              </label>
                            </div>
                            {editingReport.criticalValue && (
                              <div style={s.criticalBox}>
                                <span style={s.criticalLabel}>危急值</span>
                                <span style={s.criticalText}>报告包含危急值，请及时通知临床医生并做好记录</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* 手术描述 */}
                      {activeTab === 'surgery' && (
                        <div>
                          <div style={s.formSection}>
                            <div style={s.formSectionTitle}><Scissors size={13} /> 手术描述</div>
                            <div style={s.formGroup}>
                              <textarea
                                style={{ ...s.textarea, minHeight: 200 }}
                                value={surgeryDesc}
                                onChange={e => setSurgeryDesc(e.target.value)}
                                placeholder="请输入手术描述（如息肉切除、活检、取石等）..."
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 麻醉记录 */}
                      {activeTab === 'anesthesia' && (
                        <div>
                          <div style={s.formSection}>
                            <div style={s.formSectionTitle}><Pill size={13} /> 麻醉记录</div>
                            <div style={s.formGrid}>
                              <div style={s.formGroup}>
                                <label style={s.label}>麻醉方式</label>
                                <input style={s.input} value={editingReport.anesthesiaMethod} onChange={e => handleField('anesthesiaMethod', e.target.value)} placeholder="如：咽部局麻" />
                              </div>
                              <div style={s.formGroup}>
                                <label style={s.label}>麻醉药物</label>
                                <input style={s.input} placeholder="麻醉药物" />
                              </div>
                              <div style={{ ...s.formGroup, ...s.formGroupFull }}>
                                <label style={s.label}>麻醉经过</label>
                                <textarea
                                  style={s.textarea}
                                  value={anesthesiaDesc}
                                  onChange={e => setAnesthesiaDesc(e.target.value)}
                                  placeholder="请输入麻醉经过..."
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 附录 */}
                      {activeTab === 'appendix' && (
                        <div>
                          <div style={s.formSection}>
                            <div style={s.formSectionTitle}><BookOpen size={13} /> 附录备注</div>
                            <div style={s.formGroup}>
                              <textarea
                                style={{ ...s.textarea, minHeight: 200 }}
                                value={appendixNotes}
                                onChange={e => setAppendixNotes(e.target.value)}
                                placeholder="请输入附录备注（如特殊情况说明、补充信息等）..."
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 右侧：22张图片标准展示 + 常用短语 */}
                    <div style={s.phrasePanel}>
                      {/* 22张图片标准切换Tab */}
                      <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
                        <button
                          style={{
                            flex: 1, padding: '6px 8px', borderRadius: 6, border: '1px solid #e2e8f0',
                            background: activePhotoTab === 'standard' ? '#2563eb' : '#fff',
                            color: activePhotoTab === 'standard' ? '#fff' : '#64748b',
                            fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                          }}
                          onClick={() => setActivePhotoTab('standard')}
                        >
                          <Camera size={11} /> 22张标准
                        </button>
                        <button
                          style={{
                            flex: 1, padding: '6px 8px', borderRadius: 6, border: '1px solid #e2e8f0',
                            background: activePhotoTab === 'gallery' ? '#2563eb' : '#fff',
                            color: activePhotoTab === 'gallery' ? '#fff' : '#64748b',
                            fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                          }}
                          onClick={() => setActivePhotoTab('gallery')}
                        >
                          <Image size={11} /> 图片库
                        </button>
                      </div>

                      {/* 22张图片标准 */}
                      {activePhotoTab === 'standard' && (
                        <>
                          <div style={s.photoStdPanelTitle}>
                            <Camera size={12} />
                            {isGastro ? '胃镜22张标准' : '肠镜22张标准'}
                          </div>
                          <div style={s.photoStdGrid}>
                            {currentStandard.map((item, idx) => {
                              const captured = idx < capturedCount
                              return (
                                <div
                                  key={item.id}
                                  style={{
                                    ...s.photoStdItem,
                                    ...(captured ? s.photoStdItemCaptured : {}),
                                    ...(item.required && !captured ? s.photoStdItemRequired : {}),
                                  }}
                                  title={item.description}
                                >
                                  <div style={s.photoStdItemName}>
                                    {captured && <CheckCircle2 size={9} color="#16a34a" style={{ marginRight: 2 }} />}
                                    {item.name}
                                  </div>
                                  <div style={s.photoStdItemDesc}>{item.description}</div>
                                  <div style={{
                                    ...s.photoStdStatusBadge,
                                    background: captured ? '#dcfce7' : '#f1f5f9',
                                    color: captured ? '#16a34a' : '#94a3b8',
                                  }}>
                                    {captured ? '✓ 已采集' : item.required ? '○ 必采' : '○ 选采'}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                          {/* 达标进度 */}
                          <div style={s.photoStdProgress}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                              <span style={{ color: '#64748b' }}>总达标率</span>
                              <span style={{ fontWeight: 700, color: capturedPercent >= 90 ? '#16a34a' : capturedPercent >= 70 ? '#d97706' : '#dc2626' }}>{capturedPercent}%</span>
                            </div>
                            <div style={s.photoStdProgressBar}>
                              <div style={{ ...s.photoStdProgressFill, width: `${capturedPercent}%`, background: capturedPercent >= 90 ? '#16a34a' : capturedPercent >= 70 ? '#d97706' : '#dc2626' }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#94a3b8', marginTop: 4 }}>
                              <span>已采 {capturedCount}/{currentStandard.length} 张</span>
                              <span>必采 {requiredCapturedCount}/{requiredTotal} 张</span>
                            </div>
                          </div>
                          {/* 图片标注工具入口 */}
                          <div style={{ marginTop: 10 }}>
                            <div style={{ fontSize: 11, fontWeight: 600, color: '#475569', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Flag size={11} /> 图片标注工具
                            </div>
                            <div style={s.annotationToolBar}>
                              <button
                                style={{ ...s.annotationToolBtn, ...(annotationTool === 'rect' ? s.annotationToolBtnActive : {}) }}
                                onClick={() => setAnnotationTool(annotationTool === 'rect' ? null : 'rect')}
                                title="区域标注"
                              >
                                <svg width="12" height="12" viewBox="0 0 12 12"><rect x="1" y="1" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>
                              </button>
                              <button
                                style={{ ...s.annotationToolBtn, ...(annotationTool === 'arrow' ? s.annotationToolBtnActive : {}) }}
                                onClick={() => setAnnotationTool(annotationTool === 'arrow' ? null : 'arrow')}
                                title="箭头标注"
                              >
                                <svg width="12" height="12" viewBox="0 0 12 12"><path d="M1 11 L11 1 M7 1H11V5" stroke="currentColor" strokeWidth="1.5" fill="none" /></svg>
                              </button>
                              <button
                                style={{ ...s.annotationToolBtn, ...(annotationTool === 'text' ? s.annotationToolBtnActive : {}) }}
                                onClick={() => setAnnotationTool(annotationTool === 'text' ? null : 'text')}
                                title="文字标注"
                              >
                                T
                              </button>
                              <div style={{ flex: 1 }} />
                              <div style={s.annotationColorPicker}>
                                {annotationColors.map(c => (
                                  <div
                                    key={c}
                                    style={{
                                      ...s.annotationColorDot,
                                      background: c,
                                      ...(annotationColor === c ? s.annotationColorDotActive : {}),
                                    }}
                                    onClick={() => setAnnotationColor(c)}
                                  />
                                ))}
                              </div>
                              {annotationArrows.length > 0 || annotationTexts.length > 0 ? (
                                <button style={{ ...s.annotationToolBtn, ...s.annotationToolBtnDanger }} onClick={() => { setAnnotationArrows([]); setAnnotationTexts([]) }}>
                                  <RotateCcw size={10} />
                                </button>
                              ) : null}
                            </div>
                            <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>
                              {annotationTool ? `当前工具: ${annotationTool === 'rect' ? '区域' : annotationTool === 'arrow' ? '箭头' : '文字'}标注` : '选择工具后在图片上操作'}
                            </div>
                          </div>
                        </>
                      )}

                      {/* 图片库Tab */}
                      {activePhotoTab === 'gallery' && (
                        <>
                          <div style={s.photoStdPanelTitle}>
                            <Image size={12} /> 已采集图片 ({reportImages.length}张)
                          </div>
                          {reportImages.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '20px 0', color: '#94a3b8', fontSize: 12 }}>
                              <Camera size={24} style={{ marginBottom: 6 }} />
                              <div>暂无图片</div>
                              <div style={{ fontSize: 11, marginTop: 4 }}>请在检查所见中添加图像</div>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                              {reportImages.map((img, idx) => (
                                <div
                                  key={img.id}
                                  style={{
                                    background: '#fff', border: '1px solid #e2e8f0', borderRadius: 6,
                                    padding: 6, display: 'flex', gap: 8, alignItems: 'center',
                                    cursor: 'pointer',
                                  }}
                                  onClick={() => setSelectedImageId(img.id)}
                                >
                                  <div style={{ width: 48, height: 36, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden', flexShrink: 0 }}>
                                    <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  </div>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 11, fontWeight: 600, color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      图像 #{idx + 1}
                                    </div>
                                    <div style={{ fontSize: 10, color: '#94a3b8' }}>
                                      {idx < currentStandard.length ? currentStandard[idx].name : '附加图像'}
                                    </div>
                                    {img.annotation && (
                                      <div style={{ fontSize: 9, color: '#dc2626', display: 'flex', alignItems: 'center', gap: 2, marginTop: 2 }}>
                                        <Flag size={8} /> 已标注
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}

                      {/* 分隔线 */}
                      <div style={{ borderTop: '1px solid #e2e8f0', marginTop: 14, marginBottom: 10 }} />

                      {/* 常用短语标题 */}
                      <div style={s.phrasePanelTitle}>
                        <BookOpen size={13} /> 常用短语
                      </div>
                      {COMMON_PHRASES.map(cat => (
                        <div key={cat.category}>
                          <div style={s.phraseCategory}>{cat.category}</div>
                          {cat.phrases.map((phrase, i) => (
                            <div
                              key={i}
                              style={s.phraseItem}
                              onClick={() => {
                                if (activeTab === 'findings') insertPhrase(phrase, 'findings')
                                else if (activeTab === 'diagnosis') insertPhrase(phrase, 'conclusion')
                              }}
                              onMouseEnter={e => Object.assign(e.currentTarget.style, s.phraseItemHover)}
                              onMouseLeave={e => Object.assign(e.currentTarget.style, s.phraseItem)}
                              title="点击插入"
                            >
                              {phrase}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>

                    {/* ========== 新增：AI辅助面板（嵌入编辑器布局） ========== */}
                    <div style={{ borderLeft: '1px solid #e2e8f0', padding: 14, background: '#fafbfc', overflowY: 'auto', maxHeight: 'calc(90vh - 120px)' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#4338ca', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Sparkles size={13} /> AI 辅助面板
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <button style={{ ...s.btnAIGhost, fontSize: 11, padding: '6px 10px' }} onClick={handleAIGenerate} disabled={aiLoading}>
                          <Sparkles size={11} />{aiLoading ? '生成中...' : 'AI 生成报告'}
                        </button>
                        <button style={{ ...s.btnIcon, fontSize: 11, justifyContent: 'flex-start' }} onClick={() => calculateQualityScore()}>
                          <ShieldCheck size={11} /> 质量评分
                        </button>
                        <button style={{ ...s.btnIcon, fontSize: 11, justifyContent: 'flex-start' }} onClick={loadHistoryReports}>
                          <Clock size={11} /> 历史参考
                        </button>
                        <button style={{ ...s.btnIcon, fontSize: 11, justifyContent: 'flex-start' }} onClick={() => setShowDiagTemplateModal(true)}>
                          <FileText size={11} /> 诊断模板
                        </button>
                      </div>

                      {/* AI 内容展示 */}
                      {showAIBox && aiContent && (
                        <div style={{ marginTop: 12 }}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: '#4338ca', marginBottom: 4 }}>检查所见：</div>
                          <div style={{ ...s.aiAssistText, maxHeight: 120, fontSize: 11 }}>{aiContent.findings}</div>
                          <div style={{ fontSize: 11, fontWeight: 600, color: '#4338ca', marginBottom: 4, marginTop: 6 }}>诊断结论：</div>
                          <div style={{ ...s.aiAssistText, background: '#fffbe6', border: '1px solid #ffe58f', maxHeight: 80, fontSize: 11 }}>{aiContent.conclusion}</div>
                          <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                            <button style={{ ...s.btnSuccess, padding: '3px 8px', fontSize: 10 }} onClick={adoptAIFindings}><Check size={10} /> 所见</button>
                            <button style={{ ...s.btnSuccess, padding: '3px 8px', fontSize: 10 }} onClick={adoptAIConclusion}><Check size={10} /> 结论</button>
                            <button style={{ ...s.btnIcon, padding: '3px 6px', fontSize: 10 }} onClick={() => setShowAIBox(false)}><EyeOff size={10} /></button>
                          </div>
                        </div>
                      )}

                      {/* 质量评分 */}
                      {qualityScore && (
                        <div style={{ marginTop: 12 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#1a3a5c', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <ShieldCheck size={11} color="#059669" /> 质量评分
                            <span style={{
                              fontSize: 16, fontWeight: 800, marginLeft: 4,
                              color: qualityScore.total >= 80 ? '#10b981' : qualityScore.total >= 60 ? '#f59e0b' : '#dc2626',
                            }}>{qualityScore.total}</span>
                          </div>
                          {qualityScore.breakdown.map(b => (
                            <div key={b.key} style={{ marginBottom: 4 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#64748b' }}>
                                <span>{b.label}</span>
                                <span style={{ color: b.score >= 80 ? '#10b981' : b.score >= 60 ? '#f59e0b' : '#dc2626' }}>{Math.round(b.score)}分</span>
                              </div>
                              <div style={{ height: 4, background: '#e2e8f0', borderRadius: 2, marginTop: 2 }}>
                                <div style={{
                                  height: '100%', borderRadius: 2, width: `${b.score}%`,
                                  background: b.score >= 80 ? '#10b981' : b.score >= 60 ? '#f59e0b' : '#dc2626',
                                }} />
                              </div>
                            </div>
                          ))}
                          <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 4 }}>{qualityScore.breakdown.map(b => `${b.label}${Math.round(b.score)}分`).join(' | ')}</div>
                        </div>
                      )}

                      {/* 历史参考 */}
                      {showHistoryPanel && (
                        <div style={{ marginTop: 12 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#1a3a5c', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Clock size={11} color="#64748b" /> 历史报告
                            <button style={{ ...s.btnIcon, padding: '1px 4px' }} onClick={() => setShowHistoryPanel(false)}><EyeOff size={9} /></button>
                          </div>
                          {historyReports.length === 0 ? (
                            <div style={{ fontSize: 10, color: '#94a3b8', textAlign: 'center', padding: '8px 0' }}>暂无历史</div>
                          ) : historyReports.map(hr => (
                            <div
                              key={hr.id}
                              style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 6, padding: '6px 8px', marginBottom: 4, cursor: 'pointer' }}
                              onClick={() => { handleField('findings', hr.findings); handleField('conclusion', hr.conclusion); setShowHistoryPanel(false) }}
                              onMouseEnter={e => Object.assign(e.currentTarget.style, { border: '1px solid #818cf8', background: '#f0f9ff' })}
                              onMouseLeave={e => Object.assign(e.currentTarget.style, { border: '1px solid #e2e8f0', background: '#fff' })}
                            >
                              <div style={{ fontSize: 10, color: '#64748b' }}>{hr.date} · {hr.examType}</div>
                              <div style={{ fontSize: 10, color: '#334155', marginTop: 2, overflow: 'hidden', maxHeight: 24 }}>{hr.findings}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                /* 查看模式 */
                <div style={{ padding: 20 }}>
                  {/* 患者信息 */}
                  <div style={s.patientInfoBox}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#1a3a5c', marginBottom: 8 }}>患者信息</div>
                    <div style={s.patientInfoGrid}>
                      <div style={s.patientInfoItem}><span style={s.patientInfoLabel}>姓名</span><span style={s.patientInfoValue}>{editingReport.patientName}</span></div>
                      <div style={s.patientInfoItem}><span style={s.patientInfoLabel}>性别</span><span style={s.patientInfoValue}>{editingReport.gender}</span></div>
                      <div style={s.patientInfoItem}><span style={s.patientInfoLabel}>年龄</span><span style={s.patientInfoValue}>{editingReport.age}岁</span></div>
                      <div style={s.patientInfoItem}><span style={s.patientInfoLabel}>检查项目</span><span style={s.patientInfoValue}>{editingReport.examItemName}</span></div>
                      <div style={s.patientInfoItem}><span style={s.patientInfoLabel}>检查日期</span><span style={s.patientInfoValue}>{editingReport.examDate}</span></div>
                      <div style={s.patientInfoItem}><span style={s.patientInfoLabel}>报告医生</span><span style={s.patientInfoValue}>{editingReport.doctorName}</span></div>
                      <div style={s.patientInfoItem}><span style={s.patientInfoLabel}>报告状态</span><span style={s.patientInfoValue}><span style={statusBadgeStyle(editingReport.status)}>{editingReport.status}</span></span></div>
                      <div style={s.patientInfoItem}><span style={s.patientInfoLabel}>麻醉方式</span><span style={s.patientInfoValue}>{editingReport.anesthesiaMethod || '—'}</span></div>
                    </div>
                  </div>

                  {/* 基本信息 */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                    <div style={s.formGroup}>
                      <label style={s.label}>主诉</label>
                      <div style={{ padding: '8px 10px', background: '#f8fafc', borderRadius: 6, fontSize: 13, color: '#334155', minHeight: 36 }}>{editingReport.chiefComplaint || '—'}</div>
                    </div>
                    <div style={s.formGroup}>
                      <label style={s.label}>检查指征</label>
                      <div style={{ padding: '8px 10px', background: '#f8fafc', borderRadius: 6, fontSize: 13, color: '#334155', minHeight: 36 }}>{editingReport.indications || '—'}</div>
                    </div>
                  </div>

                  <div style={{ ...s.formGroup, marginBottom: 16 }}>
                    <label style={s.label}>病史</label>
                    <div style={{ padding: '8px 10px', background: '#f8fafc', borderRadius: 6, fontSize: 13, color: '#334155', minHeight: 60, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{editingReport.history || '—'}</div>
                  </div>

                  <div style={{ ...s.formGroup, marginBottom: 16 }}>
                    <label style={s.label}>镜下所见</label>
                    <div style={{ padding: 12, background: '#f8fafc', borderRadius: 6, fontSize: 13, color: '#334155', minHeight: 100, whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{editingReport.findings || '—'}</div>
                  </div>

                  <div style={{ ...s.formGrid, marginBottom: 16 }}>
                    <div style={s.formGroup}>
                      <label style={s.label}>活检</label>
                      <div style={{ padding: '8px 10px', background: '#f8fafc', borderRadius: 6, fontSize: 13, color: '#334155' }}>
                        {editingReport.biopsyTaken ? `是（${editingReport.biopsyCount}块）` : '否'}
                        {editingReport.biopsyResult && ` — ${editingReport.biopsyResult}`}
                      </div>
                    </div>
                  </div>

                  <div style={{ ...s.formGroup, marginBottom: 16 }}>
                    <label style={s.label}>诊断结论</label>
                    <div style={{ padding: 12, background: '#fffbe6', borderRadius: 6, fontSize: 13, color: '#7c5914', minHeight: 60, whiteSpace: 'pre-wrap', lineHeight: 1.6, border: '1px solid #ffe58f' }}>{editingReport.conclusion || '—'}</div>
                  </div>

                  <div style={{ ...s.formGroup, marginBottom: 16 }}>
                    <label style={s.label}>建议</label>
                    <div style={{ padding: 12, background: '#f8fafc', borderRadius: 6, fontSize: 13, color: '#334155', minHeight: 60, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{editingReport.recommendations || '—'}</div>
                  </div>

                  {editingReport.criticalValue && (
                    <div style={s.criticalBox}>
                      <span style={s.criticalLabel}>危急值</span>
                      <span style={s.criticalText}>此报告包含危急值</span>
                    </div>
                  )}

                  {/* 审核信息 */}
                  {(editingReport.status === '已审核' || editingReport.status === '已打印' || editingReport.status === '已发布') && editingReport.auditDoctorName && (
                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6, padding: '12px 16px' }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#065f46', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                        <ShieldCheck size={13} /> 审核信息
                      </div>
                      <div style={{ fontSize: 13, color: '#047857' }}>
                        审核医生：{editingReport.auditDoctorName} &nbsp;|&nbsp; 审核时间：{editingReport.auditTime}
                        {editingReport.auditSuggestion && <><br />审核意见：{editingReport.auditSuggestion}</>}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={s.modalFooter}>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>
                {modalMode !== 'view' && editingReport.status && (
                  <span>状态：<span style={statusBadgeStyle(editingReport.status)}>{editingReport.status}</span></span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                {modalMode === 'view' && editingReport.status === '待审核' && (
                  <button style={s.btnSuccess} onClick={() => setShowAuditModal(true)}>
                    <ShieldCheck size={13} /> 审核报告
                  </button>
                )}
                {modalMode === 'view' && editingReport.status === '已审核' && (
                  <button style={s.btnPrimary} onClick={handlePrint}>
                    <Printer size={13} /> 打印报告
                  </button>
                )}
                <button style={s.btnCancel} onClick={closeModal}>关闭</button>
                {modalMode !== 'view' && (
                  <>
                    <button style={s.btnWarning} onClick={handleSaveDraft}>
                      <Save size={13} /> 保存草稿
                    </button>
                    <button style={s.btnSuccess} onClick={handleSubmitReport}>
                      <Send size={13} /> 提交报告
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 审核弹窗 */}
      {showAuditModal && (
        <div style={s.overlay} onClick={e => e.target === e.currentTarget && setShowAuditModal(false)}>
          <div style={{ ...s.modal, width: 500 }}>
            <div style={s.modalHeader}>
              <div style={s.modalTitle}>
                <ShieldCheck size={15} style={{ color: '#059669' }} /> 报告审核
              </div>
              <button style={s.modalClose} onClick={() => setShowAuditModal(false)}><X size={18} /></button>
            </div>
            <div style={{ padding: 20 }}>
              <div style={s.auditBox}>
                <div style={s.auditTitle}>
                  <ShieldCheck size={14} /> 审核医师签名
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>审核医师姓名<span style={s.required}>*</span></label>
                  <input style={s.input} value={auditDoctorName} onChange={e => setAuditDoctorName(e.target.value)} placeholder="请输入审核医师姓名" />
                </div>
                <div style={{ ...s.formGroup, marginTop: 12 }}>
                  <label style={s.label}>审核意见</label>
                  <textarea style={s.textarea} value={auditSuggestion} onChange={e => setAuditSuggestion(e.target.value)} placeholder="请输入审核意见（选填）" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button style={s.btnCancel} onClick={() => setShowAuditModal(false)}>取消</button>
                <button style={s.btnSuccess} onClick={handleAuditReport} disabled={!auditDoctorName.trim()}>
                  <ShieldCheck size={13} /> 确认审核
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== 新增：图片标注编辑器 ========== */}
      {annotatingImg && (
        <div
          style={s.annotationOverlay}
          onClick={e => { if (e.target === e.currentTarget) closeAnnotationEditor() }}
        >
          <div style={{ ...s.annotationModal, width: Math.min(800, window.innerWidth * 0.9) }}>
            <div style={{ padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1a3a5c', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Flag size={14} color="#dc2626" /> 图像标注
              </div>
              <div style={{ fontSize: 12, color: '#64748b' }}>
                {annotatingImg.url.split('/').pop()}
              </div>
              <button style={s.modalClose} onClick={closeAnnotationEditor}><X size={16} /></button>
            </div>
            <div
              style={s.annotationImgContainer}
              onMouseUp={handleAnnotationMouseUp}
            >
              <img
                ref={imgRef}
                src={annotatingImg.url}
                alt=""
                style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', cursor: 'crosshair', userSelect: 'none' }}
                onMouseDown={handleAnnotationMouseDown}
                onMouseMove={handleAnnotationMouseMove}
                draggable={false}
              />
              {/* 标注框 */}
              {annBox.w > 0 && annBox.h > 0 && (
                <div style={{
                  position: 'absolute',
                  left: `${annBox.x}%`,
                  top: `${annBox.y}%`,
                  width: `${annBox.w}%`,
                  height: `${annBox.h}%`,
                  border: '2px solid #dc2626',
                  background: 'rgba(220,38,38,0.08)',
                  pointerEvents: 'none',
                }} />
              )}
            </div>
            <div style={s.annotationToolbar}>
              <span style={{ fontSize: 12, color: '#64748b' }}>
                标注区域：X={Math.round(annBox.x)}% Y={Math.round(annBox.y)}% W={Math.round(annBox.w)}% H={Math.round(annBox.h)}%
              </span>
              <div style={{ flex: 1 }} />
              <button
                style={{ ...s.btnWarning, padding: '5px 12px', fontSize: 12 }}
                onClick={() => setAnnBox({ x: 20, y: 20, w: 80, h: 60 })}
              >
                <RotateCcw size={12} /> 重置
              </button>
              <button style={s.btnCancel} onClick={() => setAnnotatingImg(null)}>取消</button>
              <button style={s.btnSuccess} onClick={closeAnnotationEditor}>
                <Check size={12} /> 保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== 新增：诊断模板弹窗 ========== */}
      {showDiagTemplateModal && (
        <div style={s.overlay} onClick={e => e.target === e.currentTarget && setShowDiagTemplateModal(false)}>
          <div style={{ ...s.modal, width: 700 }}>
            <div style={s.modalHeader}>
              <div style={s.modalTitle}>
                <FileText size={14} color="#4338ca" /> 诊断模板库
              </div>
              <button style={s.modalClose} onClick={() => setShowDiagTemplateModal(false)}><X size={16} /></button>
            </div>
            <div style={{ padding: 16 }}>
              <div style={s.diagTemplateGrid}>
                {DIAGNOSTIC_TEMPLATES.flatMap(cat =>
                  cat.templates.map(tpl => (
                    <div
                      key={tpl.title}
                      style={s.diagTemplateCard}
                      onClick={() => applyDiagnosticTemplate(tpl)}
                      onMouseEnter={e => Object.assign(e.currentTarget.style, { border: '1px solid #818cf8', background: '#f0f9ff' })}
                      onMouseLeave={e => Object.assign(e.currentTarget.style, { border: '1px solid #e2e8f0', background: '#f8fafc' })}
                    >
                      <div style={s.diagTemplateCategory}>{cat.category}</div>
                      <div style={s.diagTemplateTitle}>{tpl.title}</div>
                      <div style={s.diagTemplatePreview}>{tpl.findings}</div>
                    </div>
                  ))
                )}
              </div>
              <div style={{ marginTop: 12, fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>
                点击模板后将追加到当前报告内容
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 打印预览 */}
      {showPrintPreview && (
        <div style={s.printPreviewOverlay} onClick={e => e.target === e.currentTarget && setShowPrintPreview(false)}>
          <div style={s.printPreviewModal}>
            <div style={{ padding: '12px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1a3a5c' }}>报告打印预览</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={s.btnPrimary} onClick={executePrint}><Printer size={13} /> 确认打印</button>
                <button style={s.btnCancel} onClick={() => setShowPrintPreview(false)}><X size={13} /> 关闭</button>
              </div>
            </div>
            <div style={s.printContent}>
              {/* 打印头部 */}
              <div style={s.printHospitalName}>上海市第一人民医院超声中心</div>
              <div style={s.printReportTitle}>超声检查报告</div>

              {/* 患者信息 */}
              <div style={s.printInfoGrid}>
                <div style={s.printInfoItem}><span style={s.printLabel}>姓名：</span><span style={s.printValue}>{editingReport.patientName}</span></div>
                <div style={s.printInfoItem}><span style={s.printLabel}>性别：</span><span style={s.printValue}>{editingReport.gender}</span></div>
                <div style={s.printInfoItem}><span style={s.printLabel}>年龄：</span><span style={s.printValue}>{editingReport.age}岁</span></div>
                <div style={s.printInfoItem}><span style={s.printLabel}>检查项目：</span><span style={s.printValue}>{editingReport.examItemName}</span></div>
                <div style={s.printInfoItem}><span style={s.printLabel}>检查日期：</span><span style={s.printValue}>{editingReport.examDate}</span></div>
                <div style={s.printInfoItem}><span style={s.printLabel}>报告医生：</span><span style={s.printValue}>{editingReport.doctorName}</span></div>
                <div style={s.printInfoItem}><span style={s.printLabel}>麻醉方式：</span><span style={s.printValue}>{editingReport.anesthesiaMethod || '—'}</span></div>
                <div style={s.printInfoItem}><span style={{ ...s.printLabel, fontFamily: 'monospace' }}>报告ID：</span><span style={s.printValue}>{editingReport.id}</span></div>
              </div>

              {/* 主诉 */}
              <div style={s.printSection}>
                <div style={s.printSectionTitle}>主诉</div>
                <div style={s.printText}>{editingReport.chiefComplaint || '—'}</div>
              </div>

              {/* 检查所见 */}
              <div style={s.printSection}>
                <div style={s.printSectionTitle}>检查所见</div>
                <div style={s.printText}>{editingReport.findings || '—'}</div>
              </div>

              {/* 活检 */}
              {editingReport.biopsyTaken && (
                <div style={s.printSection}>
                  <div style={s.printSectionTitle}>活检</div>
                  <div style={s.printText}>
                    已活检，共 {editingReport.biopsyCount} 块
                    {editingReport.biopsyResult && `，病理结果：${editingReport.biopsyResult}`}
                  </div>
                </div>
              )}

              {/* 诊断结论 */}
              <div style={s.printSection}>
                <div style={s.printSectionTitle}>诊断结论</div>
                <div style={s.printConclusion}>{editingReport.conclusion || '—'}</div>
              </div>

              {/* 建议 */}
              {editingReport.recommendations && (
                <div style={s.printSection}>
                  <div style={s.printSectionTitle}>建议</div>
                  <div style={s.printText}>{editingReport.recommendations}</div>
                </div>
              )}

              {/* 审核信息 */}
              {editingReport.auditDoctorName && (
                <div style={{ marginTop: 16, padding: '8px 12px', background: '#f0fdf4', borderRadius: 6, fontSize: 12, color: '#065f46' }}>
                  已审核 | 审核医生：{editingReport.auditDoctorName} | 审核时间：{editingReport.auditTime}
                  {editingReport.auditSuggestion && ` | 审核意见：${editingReport.auditSuggestion}`}
                </div>
              )}

              {/* 签名 */}
              <div style={s.printSignature}>
                <div>报告医师：___________</div>
                <div>审核医师：{editingReport.auditDoctorName || '___________'}</div>
                <div>日期：___________</div>
              </div>

              <div style={s.printFooter}>
                本报告仅供临床参考，如有问题请及时联系超声中心 | 报告生成时间：{editingReport.createdTime}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
