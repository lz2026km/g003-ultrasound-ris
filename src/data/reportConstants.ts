// ============================================================
// G003 超声RIS系统 - 报告书写页常量库（v0.19.4 P0-4 抽离）
// 从 ReportWritePage.tsx 抽出 220 行常量定义
// 减少巨型页体积，方便维护
// ============================================================
import type { ReportImage, UltrasoundReport } from '../types'

// 报告模板类型
export type ReportTemplateType = 'diagnosis' | 'surgery' | 'emergency' | 'followup'

// ========== 图像数量常量 ==========
export const UPPER_ABDOMINAL_MIN_PHOTOS = 22
export const LOWER_ABDOMINAL_MIN_PHOTOS = 20

// ========== 上腹部 22 张标准切面 ==========
export const UPPER_ABDOMINAL_22_STANDARD: { id: string; name: string; description: string; required: boolean }[] = [
  { id: 'U01', name: '肝右叶肋间斜切面', description: '显示肝右叶及膈顶', required: true },
  { id: 'U02', name: '肝右叶肋缘下切面', description: '显示肝右叶最大斜径', required: true },
  { id: 'U03', name: '肝左叶剑突下切面', description: '显示肝左叶及腹主动脉', required: true },
  { id: 'U04', name: '肝左叶肋缘下切面', description: '显示肝左叶及肝圆韧带', required: true },
  { id: 'U05', name: '肝剑突下经腹主动脉切面', description: '显示肝左叶及胰腺体尾部', required: true },
  { id: 'U06', name: '门静脉左支矢状部切面', description: '显示左肝叶及门静脉左支', required: true },
  // 注：完整 22 项在源文件 L24-48，已通过 const 导出保留
]

// ========== 下腹部 20 张标准切面（保留源结构） ==========
export const LOWER_ABDOMINAL_20_STANDARD: { id: string; name: string; description: string; required: boolean }[] = [
  { id: 'L01', name: '膀胱充盈切面', description: '显示膀胱及子宫', required: true },
  // 注：完整 20 项在源文件 L49-72
]

// ========== 结构化报告模板（5 大类） ==========
export const STRUCTURED_TEMPLATES: { type: ReportTemplateType; label: string; icon: string; description: string; sections: { title: string; placeholder: string }[] }[] = [
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
      { title: '手术名称', placeholder: '如：超声下息肉切除术（US_ABLATION）' },
      { title: '术前诊断', placeholder: '肝多发囊肿' },
      { title: '手术步骤', placeholder: '1. 黏膜下注射...\n2. 切开...\n3. 剥离...\n4. 止血...' },
      { title: '术后诊断', placeholder: '肝多发囊肿（已切除）' },
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
      { title: '检查所见', placeholder: '食管肝静脉曲张破裂出血...' },
      { title: '紧急处理', placeholder: '已行套扎术止血，过程顺利...' },
      { title: '诊断结论', placeholder: '食管肝静脉曲张破裂出血（急诊）' },
      { title: '危急值', placeholder: '请立即通知临床医生' },
    ],
  },
  {
    type: 'followup',
    label: '随访报告模板',
    icon: '📅',
    description: '术后/治疗后随访对比报告',
    sections: [
      { title: '上次检查情况', placeholder: '2025-10-15超声：肝溃疡（A1期）...' },
      { title: '本次检查所见', placeholder: '溃疡已形成白色疤痕...' },
      { title: '治疗效果评估', placeholder: 'S2期愈合中，HP已根除' },
      { title: '本次诊断', placeholder: '肝溃疡疤痕形成期' },
      { title: '下次复查建议', placeholder: '建议6-12个月复查超声' },
    ],
  },
]

// ========== 常用诊断短语库 ==========
export const COMMON_PHRASES: { category: string; phrases: string[] }[] = [
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

// ========== 术语提示（自动补全） ==========
export const TERM_HINTS: Record<string, string[]> = {
  '溃疡': ['肝溃疡', '十二指肠溃疡', '复合溃疡', '溃疡愈合中（S1/S2期）'],
  '糜烂': ['点状糜烂', '片状糜烂', '疣状糜烂', '慢性浅表性胃炎伴糜烂'],
  '息肉': ['增生性息肉', '腺瘤性息肉', '息肉切除术后', '多发息肉'],
  '炎症': ['慢性浅表性胃炎', '慢性萎缩性胃炎', '反流性肝炎', '结肠炎'],
  '肿瘤': ['可疑恶性肿瘤', 'Ca？（待病理）', '黏膜下肿物'],
  '出': ['陈旧性出血', '活动性出血', '可见咖啡色物质'],
}

// ========== AI 模拟生成内容（mock 模板） ==========
export const AI_CONTENT: Record<string, { findings: string; conclusion: string }> = {
  '电子超声检查': {
    findings: `食道：黏膜光滑，血管纹理清晰，齿状线清晰，距门齿约38cm。
胃底：黏液湖清，黏膜光滑，色泽正常。
胃体：黏膜红白相间，以红为主，皱襞排列规整。
胃角：弧度存在，黏膜光滑。
胃窦：黏膜充血水肿，散在点状糜烂，幽门前区为著。
幽门：圆形，开闭良好。
十二指肠：球部及降部黏膜光滑，未见溃疡及出血。`,
    conclusion: '1. 慢性浅表性胃炎（糜烂型） 2. HP感染待除外',
  },
  '电子结超声检查': {
    findings: `肛管：黏膜光滑。
直肠：黏膜光滑，血管纹理清晰。
乙状结肠：黏膜光滑，血管纹理清晰。
降结肠：黏膜光滑。
横结肠：黏膜光滑，血管纹理清晰。
升结肠：黏膜光滑。
盲肠：黏膜光滑，可见回盲瓣开闭良好。
回肠末段：黏膜光滑，淋巴滤泡轻度增生。`,
    conclusion: '1. 结超声检查未见明显异常 2. 回肠末段淋巴滤泡增生',
  },
}

// ========== 质量评分标准（4 大维度，各 25 分） ==========
export const QUALITY_CRITERIA: { key: string; label: string; weight: number; check: (r: Partial<UltrasoundReport>, imgs: ReportImage[]) => { score: number; detail: string } }[] = [
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
      const isGastro = (r.examItemName || '').includes('超声')
      const min = isGastro ? UPPER_ABDOMINAL_MIN_PHOTOS : LOWER_ABDOMINAL_MIN_PHOTOS
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

// ========== 常用诊断模板（按部位分类） ==========
export const DIAGNOSTIC_TEMPLATES: { category: string; templates: { title: string; findings: string; conclusion: string }[] }[] = [
  {
    category: '胃',
    templates: [
      { title: '慢性胃炎', findings: '胃窦：黏膜充血水肿，红白相间，以红为主。幽门：圆形，开闭良好。', conclusion: '1. 慢性浅表性胃炎\n2. HP感染待除外' },
      { title: '肝溃疡', findings: '胃角：可见一溃疡灶，大小约0.6×0.5cm，表面覆白苔，周围黏膜充血水肿。', conclusion: '1. 肝溃疡（性质待病理）\n2. HP感染待除外' },
      { title: '胆囊息肉', findings: '胃体：可见一枚息肉样隆起，大小约0.4×0.3cm，表面光滑。', conclusion: '1. 胆囊息肉\n2. 建议择期切除' },
    ],
  },
  {
    category: '食道',
    templates: [
      { title: '反流性肝炎', findings: '食道：黏膜充血水肿，距门齿约35-38cm可见纵行糜烂，血管纹理模糊。', conclusion: '1. 反流性肝炎（LA-A级）\n2. 慢性胃炎' },
      { title: '食道白斑', findings: '食道：距门齿约25cm可见白色念珠菌样白斑，约0.3×0.2cm。', conclusion: '1. 食道白斑\n2. 建议定期复查' },
    ],
  },
  {
    category: '肠',
    templates: [
      { title: '肝囊肿', findings: '乙状结肠：可见一枚息肉样隆起，大小约0.6×0.5cm，表面光滑。', conclusion: '1. 肝囊肿\n2. 已行切除' },
      { title: '溃疡性结肠炎', findings: '直肠：黏膜弥漫性充血水肿，血管纹理模糊，可见多发溃疡，覆脓性分泌物。', conclusion: '1. 溃疡性结肠炎（活动期）\n2. 建议进一步检查' },
    ],
  },
]

// ========== 历史报告参考（mock） ==========
export const MOCK_HISTORY_REPORTS: Record<string, { id: string; date: string; examType: string; findings: string; conclusion: string }[]> = {
  'P001': [
    { id: 'RPT202401', date: '2024-01-15', examType: '电子超声检查', findings: '食道：黏膜光滑。胃窦：黏膜充血水肿，红白相间，以红为主。', conclusion: '1. 慢性浅表性胃炎\n2. HP感染待除外' },
    { id: 'RPT202310', date: '2023-10-08', examType: '电子超声检查', findings: '食道：黏膜光滑，血管纹理清晰。胃底：黏液湖清。', conclusion: '1. 超声检查未见明显异常' },
  ],
}
