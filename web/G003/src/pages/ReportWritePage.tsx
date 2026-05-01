// @ts-nocheck
// G003 超声RIS - 报告书写页面 v0.5.0 全面重构报告书写模块，对标行业顶级竞品
import { useState, useEffect, useMemo } from 'react'
import {
  Save, Send, Printer, ArrowLeft, Image, FileText, Clock, ChevronDown, ChevronRight,
  Plus, X, CheckCircle, AlertCircle, Search, Download, Eye, Edit3, Trash2,
  User, Calendar, Stethoscope, Monitor, Activity, Heart, Wind, Brain, Bones,
  Aperture, Pill, AlertTriangle, CheckSquare, Star, Copy, FileUp, RefreshCw,
  ChevronUp, Filter, MessageSquare, Sparkles, BookOpen, History, LayoutList
} from 'lucide-react'

// ============ 模拟数据 ============

// 检查类型
const EXAM_TYPES = [
  { id: 'abdomen', name: '腹部超声', icon: '🔊', parts: ['肝脏', '胆囊', '胰腺', '脾脏', '肾脏', '肾上腺', '腹膜后', '腹腔'] },
  { id: 'cardiovascular', name: '心血管超声', icon: '❤️', parts: ['心脏', '主动脉', '肺动脉', '腔静脉', '颈动脉', '椎动脉', '四肢动脉', '四肢静脉'] },
  { id: 'obgyn', name: '妇产科超声', icon: '👶', parts: ['子宫', '卵巢', '输卵管', '宫颈', '阴道', '胎儿', '羊水', '胎盘'] },
  { id: 'superficial', name: '浅表器官', icon: '🔬', parts: ['甲状腺', '乳腺', '腮腺', '颌下腺', '淋巴结', '睾丸', '附睾', '阴囊'] },
  { id: 'vascular', name: '外周血管', icon: '💉', parts: ['颈动脉', '椎动脉', '锁骨下动脉', '上肢动脉', '上肢静脉', '下肢动脉', '下肢静脉', '透析通路'] },
  { id: 'intervention', name: '介入超声', icon: '💉', parts: ['穿刺活检', '置管引流', '肿瘤消融', '硬化治疗', '超声造影'] },
  { id: 'musculoskeletal', name: '肌肉骨骼', icon: '🦴', parts: ['肩关节', '肘关节', '腕关节', '髋关节', '膝关节', '踝关节', '肌肉', '肌腱', '韧带', '神经'] },
  { id: 'other', name: '其他', icon: '📋', parts: ['泌尿系', '消化系', '呼吸系', '其他'] },
]

// 常用医学术语词库（50+条）
const MEDICAL_TERMS = [
  { term: '形态正常', category: '形态' },
  { term: '大小正常', category: '大小' },
  { term: '轮廓清晰', category: '轮廓' },
  { term: '边界清晰', category: '边界' },
  { term: '边界模糊', category: '边界' },
  { term: '包膜完整', category: '包膜' },
  { term: '包膜不完整', category: '包膜' },
  { term: '回声均匀', category: '回声' },
  { term: '回声不均匀', category: '回声' },
  { term: '回声增强', category: '回声' },
  { term: '回声减低', category: '回声' },
  { term: '未见明显异常', category: '结论' },
  { term: '未见明显占位', category: '结论' },
  { term: '未见明显肿大', category: '结论' },
  { term: '未见扩张', category: '结论' },
  { term: '未见狭窄', category: '结论' },
  { term: ' CDFI未见异常血流', category: '血流' },
  { term: '可见点状血流', category: '血流' },
  { term: '可见丰富血流', category: '血流' },
  { term: '可见稀疏血流', category: '血流' },
  { term: 'PW可录得动脉频谱', category: '频谱' },
  { term: 'PW可录得静脉频谱', category: '频谱' },
  { term: '呈类圆形', category: '形态' },
  { term: '呈椭圆形', category: '形态' },
  { term: '呈不规则形', category: '形态' },
  { term: '内可见钙化灶', category: '钙化' },
  { term: '内可见无回声区', category: '囊性' },
  { term: '内可见弱回声区', category: '回声' },
  { term: '内可见强回声区', category: '回声' },
  { term: '透声好', category: '透声' },
  { term: '透声差', category: '透声' },
  { term: '后方回声增强', category: '后方' },
  { term: '后方回声衰减', category: '后方' },
  { term: '压缩性良好', category: '压缩性' },
  { term: '内壁光滑', category: '内壁' },
  { term: '内壁粗糙', category: '内壁' },
  { term: '壁厚正常', category: '壁厚' },
  { term: '壁增厚', category: '壁厚' },
  { term: '腔内未见血栓', category: '血栓' },
  { term: '腔内可见血栓', category: '血栓' },
  { term: '流速正常', category: '流速' },
  { term: '流速增快', category: '流速' },
  { term: '流速减慢', category: '流速' },
  { term: 'RI增高', category: 'RI值' },
  { term: 'RI减低', category: 'RI值' },
  { term: '舒张期流速减低', category: '舒张期' },
  { term: '舒张期流速正常', category: '舒张期' },
  { term: 'Vs正常', category: '收缩期' },
  { term: 'Vs增快', category: '收缩期' },
  { term: '建议定期复查', category: '建议' },
  { term: '建议进一步检查', category: '建议' },
  { term: '建议超声造影', category: '建议' },
  { term: '建议CT/MRI检查', category: '建议' },
]

// 诊断建议库（20+条）
const DIAGNOSIS_SUGGESTIONS = [
  '肝囊肿', '肝血管瘤', '原发性肝癌', '转移性肝癌', '肝硬化', '脂肪肝', '肝内胆管结石',
  '胆囊结石', '胆囊息肉', '急性胆囊炎', '慢性胆囊炎', '胆囊腺肌症', '胆管扩张', '胆管结石',
  '胰腺囊肿', '胰腺癌', '急性胰腺炎', '慢性胰腺炎', '脾囊肿', '脾血管瘤', '脾梗死',
  '肾囊肿', '肾结石', '肾积水', '肾肿瘤', '肾萎缩', '肾上腺肿物',
  '甲状腺结节', '甲状腺癌', '甲状腺腺瘤', '桥本甲状腺炎', '甲亢', '甲减',
  '乳腺结节', '乳腺癌', '乳腺纤维腺瘤', '乳腺囊性增生', '乳腺炎',
  '子宫肌瘤', '子宫腺肌症', '子宫内膜息肉', '宫颈息肉', '宫颈囊肿', '卵巢囊肿', '卵巢肿瘤',
  '腹主动脉瘤', '下肢动脉粥样硬化', '下肢深静脉血栓', '下肢静脉曲张',
  '颈动脉粥样硬化', '颈动脉斑块', '颈动脉狭窄', '椎动脉狭窄',
  '肩袖损伤', '膝关节积液', '半月板损伤', '腱鞘囊肿', '肌肉血肿',
  '未见明显异常', '请结合临床',
]

// 建议库
const SUGGESTIONS = [
  '定期复查', '3个月后复查', '6个月后复查', '1年后复查',
  '进一步检查', '建议CT检查', '建议MRI检查', '建议超声造影',
  '增强扫描', 'PET-CT检查',
  '科室会诊', '普外科会诊', '肿瘤科会诊', '内分泌科会诊', '心血管科会诊',
  '手术治疗', '择期手术', '急诊手术',
  '穿刺活检', '超声引导下穿刺', '组织活检',
  '保守治疗', '药物治疗', '介入治疗', '随访观察',
]

// 正常值参考范围
const NORMAL_VALUES = {
  '肝脏': { length: [10, 15], width: [8, 12], thickness: [8, 11], '门静脉内径': [0.8, 1.2], '肝静脉内径': [0.8, 1.5] },
  '胆囊': { length: [7, 12], width: [3, 5], '壁厚': [0.2, 0.3] },
  '胰腺': { '胰头': [2, 3], '胰体': [1.5, 2.5], '胰尾': [1.5, 2.5] },
  '脾脏': { length: [10, 12], width: [6, 8], thickness: [3, 4] },
  '肾脏': { length: [9, 12], width: [4, 6], thickness: [3, 5], '皮质厚': [0.8, 1.2] },
  '甲状腺': { '左右径': [1.5, 2.5], '上下径': [4, 6], '前后径': [1, 2], '峡部厚': [0.2, 0.4] },
  '颈动脉': { '内膜中层厚度(IMT)': [0.4, 1.0], '内径': [5, 8] },
  '心脏': { '左室舒张末径': [3.5, 5.5], '左房内径': [2.5, 4.0], 'EF': [50, 70], 'FS': [25, 45] },
}

// 完整报告模板（5种检查类型）
const REPORT_TEMPLATES = {
  abdomen: {
    name: '腹部超声模板',
    findings: `肝脏：大小正常，形态规整，轮廓清晰，肝表面光滑，肝实质回声均匀，肝内管道结构清晰，门静脉内径正常。
胆囊：大小正常，壁薄光滑，腔内透声好，未见结石及息肉。
胰腺：形态正常，轮廓清晰，实质回声均匀，胰管无扩张。
脾脏：大小正常，形态规整，实质回声均匀，未见占位。
双肾：大小形态正常，包膜完整，皮质回声均匀，集合系统无分离。`,
    impressions: [
      '肝胆胰脾双肾超声未见明显异常',
    ],
    diagnoses: ['未见明显异常'],
    suggestions: ['定期复查'],
  },
  cardiovascular: {
    name: '心血管超声模板',
    findings: `心脏：各房室大小正常。左室壁厚度正常，运动协调。室间隔及左室后壁厚度、幅度正常。二尖瓣形态结构正常，启闭自如。三尖瓣形态结构正常，启闭自如。主动脉根部无扩张，瓣叶回声正常，启闭良好。肺动脉内径正常。CDFI：房室水平未见分流信号，大动脉水平未见分流信号。
颈动脉：双侧颈总动脉内膜不厚，内-中膜连续性好，管腔内血流充盈良好，频谱形态正常。双侧颈内、颈外动脉内膜不厚，血流充盈良好，频谱形态正常。`,
    impressions: [
      '心脏结构及功能未见明显异常',
      '双侧颈动脉内膜略增厚',
    ],
    diagnoses: ['颈动脉内膜增厚'],
    suggestions: ['定期复查', '建议进一步检查'],
  },
  obgyn: {
    name: '妇产科超声模板',
    findings: `子宫：前位，形态饱满，肌层回声均匀，未见明显占位。
子宫内膜：厚约8mm，回声均匀，边缘清晰。
宫颈：形态正常，宫颈管无扩张。
双侧卵巢：大小形态正常，卵泡回声正常，未见异常占位。
双侧附件区：未见明显肿块。
盆腔：未见游离无回声区。
宫内节育器：位置正常，形态正常。`,
    impressions: [
      '子宫附件超声未见明显异常',
      '宫内节育器位置正常',
    ],
    diagnoses: ['未见明显异常', '宫内节育器正常位置'],
    suggestions: ['定期复查'],
  },
  superficial: {
    name: '浅表器官超声模板',
    findings: `甲状腺：双侧甲状腺大小形态正常，包膜完整，腺体回声均匀。CDFI：腺体内血流信号分布正常，呈散在点状。
双侧颈部淋巴结：未见肿大。
乳腺：双侧乳腺层次清晰，腺体回声不均匀，未见明确结节。导管无明显扩张。CDFI：未见异常血流信号。`,
    impressions: [
      '甲状腺超声未见明显异常',
      '双侧乳腺未见明显占位',
    ],
    diagnoses: ['未见明显异常'],
    suggestions: ['定期复查'],
  },
  vascular: {
    name: '外周血管超声模板',
    findings: `双侧颈动脉：内膜不厚，内-中膜连续性好，管腔内径正常，血流充盈良好，频谱形态正常，峰值流速在正常范围内。
双侧椎动脉：管径正常，血流方向正常，频谱形态正常。
双侧颈内静脉：管腔通畅，内壁光滑，探头加压后管腔可压闭。
双侧下肢动脉：内膜不厚，管腔通畅，血流充盈良好，频谱形态正常。
双侧下肢静脉：管腔通畅，管壁光滑，探头加压后管腔可压闭，血流方向正常，瓦氏呼吸后血流加速明显。`,
    impressions: [
      '双侧颈动脉未见明显异常',
      '双侧下肢深静脉通畅',
    ],
    diagnoses: ['未见明显异常'],
    suggestions: ['定期复查'],
  },
}

// 历史报告数据
const HISTORY_REPORTS = [
  { id: 'RPT2025040001', date: '2024-04-15', type: '腹部超声', doctor: '张建华', finding: '肝囊肿（约12×10mm），余肝胆胰脾未见明显异常', status: '已审核' },
  { id: 'RPT2025040002', date: '2024-03-20', type: '腹部超声', doctor: '李明辉', finding: '脂肪肝（轻度），余未见明显异常', status: '已审核' },
  { id: 'RPT2025040003', date: '2024-01-10', type: '腹部超声', doctor: '王晓燕', finding: '胆囊结石（约8mm），余未见明显异常', status: '已审核' },
]

// 模拟患者数据
const MOCK_PATIENT = {
  name: '张伟',
  id: 'P10001',
  age: 45,
  gender: '男',
  examType: '腹部超声',
  examPart: '肝胆脾胰',
  applyDoctor: '王建国',
  device: '彩超仪 A（GE Voluson E8）',
  examTime: '2024-05-08 09:30',
  room: '超声诊室 3',
  accessionNo: 'ACC2024050001',
}

// ============ 样式 ============
const s: Record<string, React.CSSProperties> = {
  root: { padding: 0, minHeight: 'calc(100vh - 80px)' },
  header: { marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' as const, gap: 12 },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  headerRight: { display: 'flex', gap: 8, flexWrap: 'wrap' as const },
  title: { fontSize: 20, fontWeight: 700, color: '#1a3a5c', margin: 0 },
  titleTag: { fontSize: 11, fontWeight: 600, background: '#3b82f6', color: '#fff', padding: '2px 8px', borderRadius: 10, marginLeft: 8 },
  // 主布局
  mainLayout: { display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20, alignItems: 'start' },
  // 卡片
  card: {
    background: '#fff', borderRadius: 12, padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0',
  },
  cardCollapsible: {
    background: '#fff', borderRadius: 12,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0', overflow: 'hidden',
  },
  cardHeader: {
    padding: '14px 18px', borderBottom: '1px solid #f1f5f9',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    background: '#fafbfc', cursor: 'pointer', userSelect: 'none' as const,
  },
  cardTitle: { fontSize: 14, fontWeight: 600, color: '#1a3a5c', margin: 0, display: 'flex', alignItems: 'center', gap: 8 },
  cardBody: { padding: 16 },
  // 按钮
  btn: {
    display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px',
    borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13,
    fontWeight: 500, minHeight: 38, transition: 'all 0.2s',
  },
  btnPrimary: { background: '#3b82f6', color: '#fff' },
  btnSecondary: { background: '#fff', color: '#475569', border: '1px solid #e2e8f0' },
  btnSuccess: { background: '#22c55e', color: '#fff' },
  btnDanger: { background: '#ef4444', color: '#fff' },
  btnGhost: { background: 'transparent', color: '#64748b' },
  btnSm: { padding: '6px 10px', fontSize: 12, minHeight: 32 },
  // 表单
  formRow: { marginBottom: 14 },
  label: { fontSize: 13, color: '#475569', marginBottom: 6, fontWeight: 500 },
  input: {
    width: '100%', padding: '9px 12px', borderRadius: 6,
    border: '1px solid #e2e8f0', fontSize: 13, color: '#1a3a5c',
    background: '#f8fafc', outline: 'none', boxSizing: 'border-box' as const,
    transition: 'border-color 0.2s',
  },
  select: {
    width: '100%', padding: '9px 12px', borderRadius: 6,
    border: '1px solid #e2e8f0', fontSize: 13, color: '#1a3a5c',
    background: '#f8fafc', outline: 'none', boxSizing: 'border-box' as const,
  },
  textarea: {
    width: '100%', minHeight: 100, padding: '10px 12px', borderRadius: 6,
    border: '1px solid #e2e8f0', fontSize: 13, color: '#1a3a5c',
    background: '#fff', outline: 'none', resize: 'vertical' as const,
    fontFamily: 'inherit', lineHeight: 1.6, boxSizing: 'border-box' as const,
  },
  // 信息行
  infoRow: {
    display: 'flex', justifyContent: 'space-between', padding: '8px 0',
    borderBottom: '1px solid #f1f5f9', fontSize: 13,
  },
  infoLabel: { color: '#64748b' },
  infoValue: { color: '#1a3a5c', fontWeight: 500 },
  // 标签页
  tabs: { display: 'flex', gap: 4, borderBottom: '2px solid #f1f5f9', marginBottom: 16 },
  tab: {
    padding: '10px 16px', fontSize: 13, fontWeight: 500, color: '#64748b',
    cursor: 'pointer', borderBottom: '2px solid transparent', marginBottom: -2,
    transition: 'all 0.2s', background: 'none', border: 'none',
  },
  tabActive: { color: '#3b82f6', borderBottom: '2px solid #3b82f6' },
  // 检查类型选择
  examTypeGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 },
  examTypeBtn: {
    display: 'flex', flexDirection: 'column' as const, alignItems: 'center',
    gap: 4, padding: '12px 8px', borderRadius: 8, border: '1px solid #e2e8f0',
    background: '#fff', cursor: 'pointer', fontSize: 11, color: '#64748b',
    transition: 'all 0.2s',
  },
  examTypeBtnActive: {
    border: '2px solid #3b82f6', background: '#eff6ff', color: '#3b82f6',
  },
  examTypeIcon: { fontSize: 20 },
  // 检查部位
  partsGrid: { display: 'flex', flexWrap: 'wrap' as const, gap: 8 },
  partChip: {
    padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500,
    border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer',
    transition: 'all 0.2s', color: '#64748b',
  },
  partChipActive: { border: '1px solid #3b82f6', background: '#eff6ff', color: '#3b82f6' },
  // 快捷术语
  termGrid: { display: 'flex', flexWrap: 'wrap' as const, gap: 6 },
  termBtn: {
    padding: '5px 10px', borderRadius: 4, fontSize: 11, fontWeight: 500,
    border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer',
    transition: 'all 0.2s', color: '#475569',
  },
  termBtnHover: { background: '#e2e8f0' },
  // 提示条目
  impressionItem: {
    display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 12px',
    background: '#f8fafc', borderRadius: 8, marginBottom: 8, border: '1px solid #e2e8f0',
  },
  impressionNum: {
    width: 22, height: 22, borderRadius: 50, background: '#3b82f6',
    color: '#fff', fontSize: 11, fontWeight: 600, display: 'flex',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  impressionInput: {
    flex: 1, border: 'none', background: 'transparent', fontSize: 13,
    color: '#1a3a5c', outline: 'none', fontFamily: 'inherit', lineHeight: 1.5,
  },
  // 诊断条目
  diagnosisItem: {
    display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
    background: '#f8fafc', borderRadius: 8, marginBottom: 6, border: '1px solid #e2e8f0',
  },
  diagnosisRank: {
    padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600,
  },
  rankPrimary: { background: '#fef3c7', color: '#d97706' },
  rankSecondary: { background: '#dbeafe', color: '#2563eb' },
  rankSuspect: { background: '#fee2e2', color: '#dc2626' },
  // 完整度指示器
  completenessBar: {
    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
    background: '#f8fafc', borderRadius: 8, marginBottom: 16,
  },
  completenessTrack: {
    flex: 1, height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden',
  },
  completenessFill: { height: '100%', borderRadius: 4, transition: 'width 0.3s' },
  completenessText: { fontSize: 13, fontWeight: 600, color: '#1a3a5c', minWidth: 45 },
  // 模板树
  templateTree: { maxHeight: 300, overflow: 'auto' },
  templateItem: {
    display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
    borderRadius: 6, cursor: 'pointer', fontSize: 13, color: '#475569',
    transition: 'background 0.2s',
  },
  templateItemHover: { background: '#f1f5f9' },
  // 历史报告
  historyItem: {
    padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0',
    marginBottom: 8, cursor: 'pointer', transition: 'all 0.2s',
  },
  historyItemHover: { borderColor: '#3b82f6', background: '#eff6ff' },
  // 缩略图网格
  imageGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 },
  imageThumb: {
    aspectRatio: '4/3', background: '#f1f5f9', borderRadius: 8,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', border: '2px solid transparent', transition: 'all 0.2s',
    position: 'relative' as const, overflow: 'hidden',
  },
  imageThumbActive: { border: '2px solid #3b82f6' },
  // AI辅助
  aiBox: {
    padding: '12px 14px', borderRadius: 8, background: '#fef3c7',
    border: '1px solid #fcd34d', fontSize: 12, color: '#92400e', lineHeight: 1.6,
  },
  aiAlert: {
    padding: '10px 12px', borderRadius: 8, background: '#fee2e2',
    border: '1px solid #fca5a5', fontSize: 12, color: '#991b1b', marginBottom: 8,
  },
  aiTip: {
    padding: '8px 10px', borderRadius: 6, background: '#dbeafe',
    border: '1px solid #93c5fd', fontSize: 11, color: '#1e40af', marginBottom: 6,
  },
  // 底部工具栏
  bottomBar: {
    position: 'fixed' as const, bottom: 0, left: 0, right: 0,
    background: '#fff', borderTop: '1px solid #e2e8f0',
    padding: '12px 24px', display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', zIndex: 100, boxShadow: '0 -2px 8px rgba(0,0,0,0.06)',
  },
  bottomBarLeft: { display: 'flex', gap: 8 },
  bottomBarRight: { display: 'flex', gap: 8 },
  // 弹窗
  modal: {
    position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 1000,
  },
  modalContent: {
    background: '#fff', borderRadius: 12, padding: 24, maxWidth: 600,
    width: '90%', maxHeight: '80vh', overflow: 'auto',
  },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 16, fontWeight: 600, color: '#1a3a5c' },
  // 抽屉
  drawer: {
    position: 'fixed' as const, bottom: 0, left: 0, right: 0,
    background: '#fff', borderRadius: '16px 16px 0 0',
    boxShadow: '0 -4px 16px rgba(0,0,0,0.12)', zIndex: 200,
    maxHeight: '70vh', transition: 'transform 0.3s',
  },
  drawerHandle: {
    width: 40, height: 4, background: '#e2e8f0', borderRadius: 2,
    margin: '12px auto', cursor: 'pointer',
  },
  // 空状态
  emptyState: {
    textAlign: 'center' as const, padding: '24px 16px', color: '#94a3b8',
    fontSize: 13,
  },
  // 工具面板标签
  toolTabs: { display: 'flex', borderBottom: '1px solid #f1f5f9', marginBottom: 12 },
  toolTab: {
    flex: 1, padding: '10px 8px', fontSize: 12, fontWeight: 500, color: '#64748b',
    cursor: 'pointer', borderBottom: '2px solid transparent', textAlign: 'center' as const,
    transition: 'all 0.2s', background: 'none', border: 'none',
  },
  toolTabActive: { color: '#3b82f6', borderBottom: '2px solid #3b82f6' },
  // 搜索框
  searchBox: {
    display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
    background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0',
    marginBottom: 12,
  },
  searchInput: {
    flex: 1, border: 'none', background: 'transparent', fontSize: 13,
    color: '#1a3a5c', outline: 'none',
  },
  // 分类标题
  sectionTitle: {
    fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' as const,
    letterSpacing: '0.5px', marginBottom: 8, marginTop: 12,
  },
  //  орган展开
  organItem: {
    border: '1px solid #e2e8f0', borderRadius: 8, marginBottom: 8, overflow: 'hidden',
  },
  organHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '10px 14px', background: '#f8fafc', cursor: 'pointer',
    fontSize: 13, fontWeight: 500, color: '#1a3a5c',
  },
  organBody: { padding: 12 },
}

// ============ 组件 ============

// 数值正常值检查
function checkNormalValue(organ: string, measurement: string, value: number): { normal: boolean; range: string } {
  const organData = NORMAL_VALUES[organ]
  if (!organData) return { normal: true, range: '' }
  const range = organData[measurement]
  if (!range) return { normal: true, range: '' }
  const [min, max] = range
  return {
    normal: value >= min && value <= max,
    range: `${min}-${max}`,
  }
}

// 主组件
export default function ReportWritePage() {
  // 状态
  const [examType, setExamType] = useState<string>('abdomen')
  const [selectedParts, setSelectedParts] = useState<string[]>(['肝脏', '胆囊', '胰腺', '脾脏', '双肾'])
  const [findings, setFindings] = useState<Record<string, string>>({})
  const [findingText, setFindingText] = useState('')
  const [impressions, setImpressions] = useState<string[]>([''])
  const [diagnoses, setDiagnoses] = useState<Array<{ text: string; rank: 'primary' | 'secondary' | 'suspect' }>>([
    { text: '', rank: 'primary' }
  ])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [findingMode, setFindingMode] = useState<'text' | 'structured'>('text')
  const [activeRightTab, setActiveRightTab] = useState('patient')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [showPrintPreview, setShowPrintPreview] = useState(false)
  const [showDiagnosisPicker, setShowDiagnosisPicker] = useState(false)
  const [showTermPicker, setShowTermPicker] = useState(false)
  const [termSearch, setTermSearch] = useState('')
  const [diagnosisSearch, setDiagnosisSearch] = useState('')
  const [expandedOrgans, setExpandedOrgans] = useState<Record<string, boolean>>({})
  const [selectedImage, setSelectedImage] = useState<number | null>(null)
  const [showImageViewer, setShowImageViewer] = useState(false)
  const [findingCursor, setFindingCursor] = useState(0)

  // 计算完整度
  const completeness = useMemo(() => {
    let score = 0
    let total = 100
    if (examType) score += 10
    if (selectedParts.length > 0) score += 10
    if (findingText || Object.values(findings).some(v => v)) score += 30
    if (impressions.some(i => i.trim())) score += 25
    if (diagnoses.some(d => d.text.trim())) score += 15
    if (suggestions.length > 0) score += 10
    return score
  }, [examType, selectedParts, findingText, findings, impressions, diagnoses, suggestions])

  // 完整度颜色
  const completenessColor = completeness < 40 ? '#ef4444' : completeness < 70 ? '#f59e0b' : '#22c55e'

  // 获取当前检查类型的部位
  const currentExamType = EXAM_TYPES.find(t => t.id === examType)
  const currentParts = currentExamType?.parts || []

  // 模板应用
  const applyTemplate = (typeId: string) => {
    const template = REPORT_TEMPLATES[typeId]
    if (!template) return
    setFindingText(template.findings)
    setImpressions(template.impressions)
    setDiagnoses(template.diagnoses.map((d, i) => ({ text: d, rank: i === 0 ? 'primary' : 'secondary' })))
    setSuggestions(template.suggestions)
  }

  // 添加提示条目
  const addImpression = () => setImpressions([...impressions, ''])
  const removeImpression = (index: number) => setImpressions(impressions.filter((_, i) => i !== index))
  const updateImpression = (index: number, value: string) => {
    const updated = [...impressions]
    updated[index] = value
    setImpressions(updated)
  }

  // 添加诊断
  const addDiagnosis = () => setDiagnoses([...diagnoses, { text: '', rank: 'secondary' }])
  const removeDiagnosis = (index: number) => setDiagnoses(diagnoses.filter((_, i) => i !== index))
  const updateDiagnosis = (index: number, value: string) => {
    const updated = [...diagnoses]
    updated[index] = { ...updated[index], text: value }
    setDiagnoses(updated)
  }
  const updateDiagnosisRank = (index: number, rank: 'primary' | 'secondary' | 'suspect') => {
    const updated = [...diagnoses]
    updated[index] = { ...updated[index], rank }
    setDiagnoses(updated)
  }

  // 切换部位
  const togglePart = (part: string) => {
    if (selectedParts.includes(part)) {
      setSelectedParts(selectedParts.filter(p => p !== part))
    } else {
      setSelectedParts([...selectedParts, part])
    }
  }

  // 插入术语到所见
  const insertTerm = (term: string) => {
    const before = findingText.slice(0, findingCursor)
    const after = findingText.slice(findingCursor)
    setFindingText(before + term + after)
    setFindingCursor(findingCursor + term.length)
  }

  // 添加建议
  const toggleSuggestion = (suggestion: string) => {
    if (suggestions.includes(suggestion)) {
      setSuggestions(suggestions.filter(s => s !== suggestion))
    } else {
      setSuggestions([...suggestions, suggestion])
    }
  }

  // 展开/折叠器官
  const toggleOrgan = (organ: string) => {
    setExpandedOrgans({ ...expandedOrgans, [organ]: !expandedOrgans[organ] })
  }

  // 快捷术语过滤
  const filteredTerms = MEDICAL_TERMS.filter(t =>
    t.term.toLowerCase().includes(termSearch.toLowerCase()) ||
    t.category.toLowerCase().includes(termSearch.toLowerCase())
  )

  // 诊断过滤
  const filteredDiagnoses = DIAGNOSIS_SUGGESTIONS.filter(d =>
    d.toLowerCase().includes(diagnosisSearch.toLowerCase())
  )

  // AI模拟分析（检测异常关键词）
  const aiAnalysis = useMemo(() => {
    const abnormalKeywords = ['异常', '肿大', '扩张', '狭窄', '结石', '息肉', '结节', '占位', '血流丰富', '钙化', '增厚', '减低', '增强']
    const findingsText = findingText + impressions.join(' ')
    const found = abnormalKeywords.filter(k => findingsText.includes(k))
    return found
  }, [findingText, impressions])

  return (
    <div style={s.root}>
      {/* 顶部栏 */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <button style={{ ...s.btn, ...s.btnSecondary, padding: '8px 12px' }}>
            <ArrowLeft size={16} /> 返回
          </button>
          <h1 style={s.title}>
            撰写检查报告
            <span style={s.titleTag}>v0.5.0</span>
          </h1>
        </div>
        <div style={s.headerRight}>
          <button style={{ ...s.btn, ...s.btnSecondary }} onClick={() => setShowPrintPreview(true)}>
            <Printer size={14} /> 打印预览
          </button>
          <button style={{ ...s.btn, ...s.btnSecondary }}>
            <Download size={14} /> 导出PDF
          </button>
          <button style={{ ...s.btn, ...s.btnSecondary }}>
            <Save size={14} /> 暂存
          </button>
          <button style={{ ...s.btn, ...s.btnSecondary }}>
            <FileUp size={14} /> 申请会诊
          </button>
          <button style={{ ...s.btn, ...s.btnPrimary }}>
            <Send size={14} /> 提交审核
          </button>
        </div>
      </div>

      {/* 主布局 */}
      <div style={s.mainLayout}>
        {/* 左侧主报告区 */}
        <div>
          {/* 完整度指示器 */}
          <div style={s.completenessBar}>
            <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>报告完整度</span>
            <div style={{ ...s.completenessTrack, flex: 1 }}>
              <div style={{ ...s.completenessFill, width: `${completeness}%`, background: completenessColor }} />
            </div>
            <span style={{ ...s.completenessText, color: completenessColor }}>{completeness}%</span>
            {completeness < 100 && (
              <span style={{ fontSize: 11, color: '#94a3b8' }}>（建议完整填写后提交）</span>
            )}
          </div>

          {/* 检查类型选择 */}
          <div style={{ ...s.card, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1a3a5c', margin: 0 }}>检查类型</h3>
              <button
                style={{ ...s.btn, ...s.btnSm, ...s.btnSecondary }}
                onClick={() => applyTemplate(examType)}
              >
                <Sparkles size={12} /> 应用模板
              </button>
            </div>
            <div style={s.examTypeGrid}>
              {EXAM_TYPES.map(type => (
                <button
                  key={type.id}
                  style={{
                    ...s.examTypeBtn,
                    ...(examType === type.id ? s.examTypeBtnActive : {}),
                  }}
                  onClick={() => setExamType(type.id)}
                >
                  <span style={s.examTypeIcon}>{type.icon}</span>
                  <span>{type.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 检查部位 */}
          <div style={{ ...s.card, marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1a3a5c', margin: '0 0 12px 0' }}>检查部位</h3>
            <div style={s.partsGrid}>
              {currentParts.map(part => (
                <button
                  key={part}
                  style={{
                    ...s.partChip,
                    ...(selectedParts.includes(part) ? s.partChipActive : {}),
                  }}
                  onClick={() => togglePart(part)}
                >
                  {selectedParts.includes(part) && <CheckCircle size={12} style={{ marginRight: 4 }} />}
                  {part}
                </button>
              ))}
            </div>
          </div>

          {/* 检查所见 */}
          <div style={{ ...s.card, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1a3a5c', margin: 0 }}>检查所见 (Finding)</h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  style={{
                    ...s.btn, ...s.btnSm,
                    ...(findingMode === 'text' ? s.btnPrimary : s.btnSecondary),
                  }}
                  onClick={() => setFindingMode('text')}
                >
                  文本模式
                </button>
                <button
                  style={{
                    ...s.btn, ...s.btnSm,
                    ...(findingMode === 'structured' ? s.btnPrimary : s.btnSecondary),
                  }}
                  onClick={() => setFindingMode('structured')}
                >
                  结构化模式
                </button>
              </div>
            </div>

            {/* 快捷术语 */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: '#64748b' }}>常用术语</span>
                <button
                  style={{ ...s.btn, ...s.btnSm, ...s.btnGhost }}
                  onClick={() => setShowTermPicker(!showTermPicker)}
                >
                  <Search size={12} /> 全部词库
                </button>
              </div>
              <div style={s.termGrid}>
                {MEDICAL_TERMS.slice(0, 18).map(term => (
                  <button
                    key={term.term}
                    style={s.termBtn}
                    onClick={() => insertTerm(term.term + '，')}
                    title={`分类: ${term.category}`}
                  >
                    {term.term}
                  </button>
                ))}
              </div>
            </div>

            {/* 所见文本输入 */}
            {findingMode === 'text' ? (
              <textarea
                style={{ ...s.textarea, minHeight: 200 }}
                placeholder="请描述检查所见...&#10;例如：肝脏大小正常，形态规整，轮廓清晰，肝表面光滑，肝实质回声均匀..."
                value={findingText}
                onChange={e => setFindingText(e.target.value)}
                onClick={e => setFindingCursor(e.target.selectionStart)}
                onKeyUp={e => setFindingCursor(e.target.selectionStart)}
              />
            ) : (
              <div>
                {selectedParts.map(part => (
                  <div key={part} style={s.organItem}>
                    <div style={s.organHeader} onClick={() => toggleOrgan(part)}>
                      <span>{part}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#94a3b8' }}>
                        {expandedOrgans[part] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </span>
                    </div>
                    {expandedOrgans[part] && (
                      <div style={s.organBody}>
                        <textarea
                          style={{ ...s.textarea, minHeight: 80 }}
                          placeholder={`描述${part}的超声所见...`}
                          value={findings[part] || ''}
                          onChange={e => setFindings({ ...findings, [part]: e.target.value })}
                        />
                        <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {MEDICAL_TERMS.slice(0, 6).map(term => (
                            <button
                              key={term.term}
                              style={{ ...s.termBtn, fontSize: 10 }}
                              onClick={() => setFindings({
                                ...findings,
                                [part]: (findings[part] || '') + term.term + '，'
                              })}
                            >
                              +{term.term}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 超声提示 */}
          <div style={{ ...s.card, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1a3a5c', margin: 0 }}>超声提示 (Impression)</h3>
              <button style={{ ...s.btn, ...s.btnSm, ...s.btnSecondary }} onClick={addImpression}>
                <Plus size={12} /> 添加条目
              </button>
            </div>
            <div>
              {impressions.map((impression, index) => (
                <div key={index} style={s.impressionItem}>
                  <span style={s.impressionNum}>{index + 1}</span>
                  <input
                    type="text"
                    style={s.impressionInput}
                    placeholder="输入超声提示..."
                    value={impression}
                    onChange={e => updateImpression(index, e.target.value)}
                  />
                  {impressions.length > 1 && (
                    <button
                      style={{ ...s.btn, ...s.btnSm, ...s.btnGhost, padding: '4px 8px' }}
                      onClick={() => removeImpression(index)}
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 诊断意见 */}
          <div style={{ ...s.card, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1a3a5c', margin: 0 }}>诊断意见 (Diagnosis)</h3>
              <button style={{ ...s.btn, ...s.btnSm, ...s.btnSecondary }} onClick={addDiagnosis}>
                <Plus size={12} /> 添加诊断
              </button>
            </div>
            <div>
              {diagnoses.map((diagnosis, index) => (
                <div key={index} style={s.diagnosisItem}>
                  <select
                    style={{
                      ...s.select,
                      width: 'auto', minWidth: 80, padding: '4px 8px', fontSize: 11,
                    }}
                    value={diagnosis.rank}
                    onChange={e => updateDiagnosisRank(index, e.target.value as any)}
                  >
                    <option value="primary">主诊断</option>
                    <option value="secondary">次诊断</option>
                    <option value="suspect">可疑诊断</option>
                  </select>
                  <input
                    type="text"
                    style={{ ...s.input, flex: 1, marginBottom: 0 }}
                    placeholder="输入或选择诊断..."
                    value={diagnosis.text}
                    onChange={e => updateDiagnosis(index, e.target.value)}
                    onFocus={() => setShowDiagnosisPicker(true)}
                  />
                  {diagnoses.length > 1 && (
                    <button
                      style={{ ...s.btn, ...s.btnSm, ...s.btnGhost, padding: '4px 8px' }}
                      onClick={() => removeDiagnosis(index)}
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* 诊断快速选择 */}
            {showDiagnosisPicker && (
              <div style={{ marginTop: 12, padding: 12, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <div style={s.searchBox}>
                  <Search size={14} color="#94a3b8" />
                  <input
                    type="text"
                    style={s.searchInput}
                    placeholder="搜索诊断..."
                    value={diagnosisSearch}
                    onChange={e => setDiagnosisSearch(e.target.value)}
                  />
                </div>
                <div style={{ maxHeight: 200, overflow: 'auto' }}>
                  {filteredDiagnoses.slice(0, 20).map(d => (
                    <div
                      key={d}
                      style={{ padding: '8px 10px', cursor: 'pointer', borderRadius: 4, fontSize: 13 }}
                      onMouseOver={e => (e.currentTarget.style.background = '#e2e8f0')}
                      onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                      onClick={() => {
                        updateDiagnosis(diagnoses.length - 1, d)
                        setShowDiagnosisPicker(false)
                      }}
                    >
                      {d}
                    </div>
                  ))}
                </div>
                <button
                  style={{ ...s.btn, ...s.btnSm, ...s.btnGhost, marginTop: 8 }}
                  onClick={() => setShowDiagnosisPicker(false)}
                >
                  收起
                </button>
              </div>
            )}
          </div>

          {/* 建议 */}
          <div style={{ ...s.card, marginBottom: 100 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1a3a5c', margin: '0 0 12px 0' }}>建议 (Suggestion)</h3>
            <div style={s.termGrid}>
              {SUGGESTIONS.map(suggestion => (
                <button
                  key={suggestion}
                  style={{
                    ...s.partChip,
                    fontSize: 12,
                    ...(suggestions.includes(suggestion) ? s.partChipActive : {}),
                  }}
                  onClick={() => toggleSuggestion(suggestion)}
                >
                  {suggestions.includes(suggestion) && <CheckCircle size={12} style={{ marginRight: 4 }} />}
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧工具面板 */}
        <div>
          {/* 工具面板切换 */}
          <div style={s.toolTabs}>
            {[
              { id: 'patient', label: '患者信息', icon: <User size={12} /> },
              { id: 'template', label: '模板', icon: <FileText size={12} /> },
              { id: 'history', label: '历史报告', icon: <History size={12} /> },
              { id: 'image', label: '图像', icon: <Image size={12} /> },
              { id: 'ai', label: 'AI辅助', icon: <Sparkles size={12} /> },
            ].map(tab => (
              <button
                key={tab.id}
                style={{
                  ...s.toolTab,
                  ...(activeRightTab === tab.id ? s.toolTabActive : {}),
                }}
                onClick={() => setActiveRightTab(tab.id)}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* 患者信息 */}
          {activeRightTab === 'patient' && (
            <div style={s.card}>
              <h3 style={{ ...s.cardTitle, display: 'flex', alignItems: 'center', gap: 8 }}>
                <User size={16} /> 患者信息
              </h3>
              <div style={s.infoRow}>
                <span style={s.infoLabel}>患者姓名</span>
                <span style={s.infoValue}>{MOCK_PATIENT.name}</span>
              </div>
              <div style={s.infoRow}>
                <span style={s.infoLabel}>患者ID</span>
                <span style={s.infoValue}>{MOCK_PATIENT.id}</span>
              </div>
              <div style={s.infoRow}>
                <span style={s.infoLabel}>年龄/性别</span>
                <span style={s.infoValue}>{MOCK_PATIENT.age}岁 / {MOCK_PATIENT.gender}</span>
              </div>
              <div style={s.infoRow}>
                <span style={s.infoLabel}>检查类型</span>
                <span style={s.infoValue}>{MOCK_PATIENT.examType}</span>
              </div>
              <div style={s.infoRow}>
                <span style={s.infoLabel}>检查部位</span>
                <span style={s.infoValue}>{MOCK_PATIENT.examPart}</span>
              </div>
              <div style={s.infoRow}>
                <span style={s.infoLabel}>申请医生</span>
                <span style={s.infoValue}>{MOCK_PATIENT.applyDoctor}</span>
              </div>
              <div style={s.infoRow}>
                <span style={s.infoLabel}>检查设备</span>
                <span style={{ ...s.infoValue, fontSize: 12 }}>{MOCK_PATIENT.device}</span>
              </div>
              <div style={s.infoRow}>
                <span style={s.infoLabel}>检查时间</span>
                <span style={s.infoValue}>{MOCK_PATIENT.examTime}</span>
              </div>
              <div style={{ ...s.infoRow, borderBottom: 'none' }}>
                <span style={s.infoLabel}>检查诊室</span>
                <span style={s.infoValue}>{MOCK_PATIENT.room}</span>
              </div>
            </div>
          )}

          {/* 模板选择 */}
          {activeRightTab === 'template' && (
            <div style={s.card}>
              <h3 style={{ ...s.cardTitle, display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText size={16} /> 报告模板
              </h3>
              <div style={s.templateTree}>
                {Object.entries(REPORT_TEMPLATES).map(([key, template]) => (
                  <div
                    key={key}
                    style={s.templateItem}
                    onMouseOver={e => (e.currentTarget.style.background = '#f1f5f9')}
                    onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                    onClick={() => {
                      applyTemplate(key)
                      setActiveRightTab('patient')
                    }}
                  >
                    <ChevronRight size={14} color="#94a3b8" />
                    <FileText size={14} color="#3b82f6" />
                    <span style={{ flex: 1 }}>{template.name}</span>
                    <button
                      style={{ ...s.btn, ...s.btnSm, ...s.btnSecondary, padding: '4px 8px' }}
                      onClick={e => {
                        e.stopPropagation()
                        applyTemplate(key)
                      }}
                    >
                      应用
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
                <h4 style={{ fontSize: 12, fontWeight: 600, color: '#64748b', margin: '0 0 8px 0' }}>典型病例参考</h4>
                <div style={s.templateItem} onMouseOver={e => (e.currentTarget.style.background = '#f1f5f9')} onMouseOut={e => (e.currentTarget.style.background = 'transparent')}>
                  <BookOpen size={14} color="#22c55e" />
                  <span>肝血管瘤典型病例</span>
                  <Eye size={12} color="#94a3b8" style={{ cursor: 'pointer' }} />
                </div>
                <div style={s.templateItem} onMouseOver={e => (e.currentTarget.style.background = '#f1f5f9')} onMouseOut={e => (e.currentTarget.style.background = 'transparent')}>
                  <BookOpen size={14} color="#22c55e" />
                  <span>胆囊结石典型病例</span>
                  <Eye size={12} color="#94a3b8" style={{ cursor: 'pointer' }} />
                </div>
                <div style={s.templateItem} onMouseOver={e => (e.currentTarget.style.background = '#f1f5f9')} onMouseOut={e => (e.currentTarget.style.background = 'transparent')}>
                  <BookOpen size={14} color="#22c55e" />
                  <span>甲状腺结节TI-RADS分类</span>
                  <Eye size={12} color="#94a3b8" style={{ cursor: 'pointer' }} />
                </div>
              </div>
            </div>
          )}

          {/* 历史报告 */}
          {activeRightTab === 'history' && (
            <div style={s.card}>
              <h3 style={{ ...s.cardTitle, display: 'flex', alignItems: 'center', gap: 8 }}>
                <History size={16} /> 历史报告
              </h3>
              <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 12 }}>
                显示该患者最近3次同类检查报告
              </p>
              {HISTORY_REPORTS.map(report => (
                <div
                  key={report.id}
                  style={s.historyItem}
                  onMouseOver={e => (e.currentTarget.style.borderColor = '#3b82f6', e.currentTarget.style.background = '#eff6ff')}
                  onMouseOut={e => (e.currentTarget.style.borderColor = '#e2e8f0', e.currentTarget.style.background = '#fff')}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#1a3a5c' }}>{report.type}</span>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>{report.date}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#475569', marginBottom: 4, lineHeight: 1.5 }}>
                    {report.finding}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                    <span style={{ fontSize: 11, color: '#64748b' }}>{report.doctor}</span>
                    <span style={{
                      ...s.badge,
                      background: report.status === '已审核' ? '#dcfce7' : '#fef3c7',
                      color: report.status === '已审核' ? '#16a34a' : '#d97706',
                    }}>
                      {report.status}
                    </span>
                  </div>
                </div>
              ))}
              <button style={{ ...s.btn, ...s.btnSecondary, width: '100%', marginTop: 8 }}>
                <LayoutList size={14} /> 查看全部历史
              </button>
            </div>
          )}

          {/* 图像预览 */}
          {activeRightTab === 'image' && (
            <div style={s.card}>
              <h3 style={{ ...s.cardTitle, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Image size={16} /> 检查图像
              </h3>
              <div style={s.imageGrid}>
                {[1, 2, 3, 4].map((i, idx) => (
                  <div
                    key={i}
                    style={{
                      ...s.imageThumb,
                      ...(selectedImage === idx ? s.imageThumbActive : {}),
                    }}
                    onClick={() => {
                      setSelectedImage(idx)
                      setShowImageViewer(true)
                    }}
                  >
                    <Image size={28} color="#94a3b8" />
                    <span style={{ position: 'absolute', bottom: 4, left: 4, fontSize: 10, color: '#64748b', background: 'rgba(255,255,255,0.8)', padding: '2px 6px', borderRadius: 4 }}>
                      IMG-{i}
                    </span>
                  </div>
                ))}
              </div>
              <button style={{ ...s.btn, ...s.btnSecondary, width: '100%', marginTop: 12 }}>
                <Plus size={14} /> 添加图像
              </button>
              <button style={{ ...s.btn, ...s.btnSecondary, width: '100%', marginTop: 8 }}>
                <Monitor size={14} /> DICOM浏览
              </button>
            </div>
          )}

          {/* AI辅助 */}
          {activeRightTab === 'ai' && (
            <div style={s.card}>
              <h3 style={{ ...s.cardTitle, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={16} /> AI辅助诊断
              </h3>

              {aiAnalysis.length > 0 && (
                <div style={s.aiBox}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, fontWeight: 600 }}>
                    <AlertTriangle size={14} /> 检测到以下关键词
                  </div>
                  {aiAnalysis.map(k => (
                    <span key={k} style={{ display: 'inline-block', background: '#fef3c7', padding: '2px 8px', borderRadius: 10, fontSize: 11, marginRight: 4, marginBottom: 4 }}>
                      {k}
                    </span>
                  ))}
                </div>
              )}

              <div style={{ marginTop: 12 }}>
                <h4 style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>典型征象提示</h4>
                {findings.includes('强回声') && (
                  <div style={s.aiTip}>
                    <strong>强回声</strong>：可能提示结石、钙化、纤维化等，建议结合临床判断
                  </div>
                )}
                {findings.includes('低回声') && (
                  <div style={s.aiTip}>
                    <strong>低回声</strong>：可见于炎症、肿瘤等，建议进一步检查
                  </div>
                )}
                {findings.includes('无回声') && (
                  <div style={s.aiTip}>
                    <strong>无回声</strong>：通常提示囊性病变，如囊肿、积液等
                  </div>
                )}
                {impressions.some(i => i.includes('异常')) && (
                  <div style={s.aiAlert}>
                    <AlertCircle size={12} style={{ display: 'inline', marginRight: 4 }} />
                    报告含异常描述，请确保诊断与所见一致
                  </div>
                )}
              </div>

              <div style={{ marginTop: 12 }}>
                <h4 style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>报告质量检查</h4>
                {completeness < 40 && (
                  <div style={{ ...s.aiAlert, background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b' }}>
                    <AlertCircle size={12} style={{ display: 'inline', marginRight: 4 }} />
                    报告完整度较低（{completeness}%），建议完善检查信息和诊断
                  </div>
                )}
                {completeness >= 40 && completeness < 70 && (
                  <div style={{ ...s.aiTip, background: '#fef3c7', border: '1px solid #fcd34d', color: '#92400e' }}>
                    <CheckCircle size={12} style={{ display: 'inline', marginRight: 4 }} />
                    报告完整度{completeness}%，基本完整
                  </div>
                )}
                {completeness >= 70 && (
                  <div style={{ ...s.aiTip, background: '#dcfce7', border: '1px solid #86efac', color: '#166534' }}>
                    <CheckCircle size={12} style={{ display: 'inline', marginRight: 4 }} />
                    报告完整度良好（{completeness}%）
                  </div>
                )}
              </div>

              <div style={{ marginTop: 12, padding: 12, background: '#f8fafc', borderRadius: 8 }}>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>正常值参考</div>
                {Object.entries(NORMAL_VALUES).slice(0, 3).map(([organ, values]) => (
                  <div key={organ} style={{ marginBottom: 6 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: '#475569' }}>{organ}</div>
                    {Object.entries(values).map(([key, range]) => (
                      <div key={key} style={{ fontSize: 11, color: '#64748b', paddingLeft: 8 }}>
                        {key}：{Array.isArray(range) ? range.join('~') : range}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 底部工具栏 */}
      <div style={s.bottomBar}>
        <div style={s.bottomBarLeft}>
          <button style={{ ...s.btn, ...s.btnSecondary }}>
            <Save size={14} /> 保存草稿
          </button>
          <button style={{ ...s.btn, ...s.btnSecondary }}>
            <Copy size={14} /> 复制报告
          </button>
        </div>
        <div style={s.bottomBarRight}>
          <button style={{ ...s.btn, ...s.btnSecondary }} onClick={() => setShowPrintPreview(true)}>
            <Printer size={14} /> 打印预览
          </button>
          <button style={{ ...s.btn, ...s.btnSecondary }}>
            <Download size={14} /> 导出PDF
          </button>
          <button style={{ ...s.btn, ...s.btnSecondary }}>
            <FileUp size={14} /> 申请会诊
          </button>
          <button style={{ ...s.btn, ...s.btnPrimary }}>
            <Send size={14} /> 提交审核
          </button>
        </div>
      </div>

      {/* 打印预览弹窗 */}
      {showPrintPreview && (
        <div style={s.modal} onClick={() => setShowPrintPreview(false)}>
          <div style={s.modalContent} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h3 style={s.modalTitle}>打印预览</h3>
              <button style={{ ...s.btn, ...s.btnGhost, padding: '4px 8px' }} onClick={() => setShowPrintPreview(false)}>
                <X size={18} />
              </button>
            </div>
            <div style={{ background: '#f8fafc', padding: 20, border: '1px solid #e2e8f0', borderRadius: 8 }}>
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1a3a5c', margin: '0 0 8px 0' }}>超声检查报告</h2>
                <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>北京某医院超声科</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 16, fontSize: 12 }}>
                <div><strong>姓名：</strong>{MOCK_PATIENT.name}</div>
                <div><strong>ID：</strong>{MOCK_PATIENT.id}</div>
                <div><strong>年龄：</strong>{MOCK_PATIENT.age}岁</div>
                <div><strong>性别：</strong>{MOCK_PATIENT.gender}</div>
                <div><strong>检查项目：</strong>{MOCK_PATIENT.examType}</div>
                <div><strong>检查日期：</strong>{MOCK_PATIENT.examTime}</div>
              </div>
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 12 }}>
                <h4 style={{ fontSize: 13, fontWeight: 600, color: '#1a3a5c', marginBottom: 8 }}>检查所见：</h4>
                <p style={{ fontSize: 12, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{findingText || '（未填写）'}</p>
              </div>
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 12, marginTop: 12 }}>
                <h4 style={{ fontSize: 13, fontWeight: 600, color: '#1a3a5c', marginBottom: 8 }}>超声提示：</h4>
                <ul style={{ fontSize: 12, paddingLeft: 20, margin: 0 }}>
                  {impressions.filter(i => i).map((imp, i) => <li key={i}>{imp}</li>)}
                  {!impressions.some(i => i) && <li>（未填写）</li>}
                </ul>
              </div>
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 12, marginTop: 12 }}>
                <h4 style={{ fontSize: 13, fontWeight: 600, color: '#1a3a5c', marginBottom: 8 }}>诊断意见：</h4>
                <ul style={{ fontSize: 12, paddingLeft: 20, margin: 0 }}>
                  {diagnoses.filter(d => d.text).map((d, i) => <li key={i}>{d.text}（{d.rank === 'primary' ? '主诊断' : d.rank === 'secondary' ? '次诊断' : '可疑'}）</li>)}
                  {!diagnoses.some(d => d.text) && <li>（未填写）</li>}
                </ul>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, fontSize: 12 }}>
                <span>报告医生：___________</span>
                <span>审核医生：___________</span>
                <span>日期：___________</span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <button style={{ ...s.btn, ...s.btnSecondary }} onClick={() => setShowPrintPreview(false)}>
                关闭
              </button>
              <button style={{ ...s.btn, ...s.btnPrimary }} onClick={() => window.print()}>
                <Printer size={14} /> 打印
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 术语选择弹窗 */}
      {showTermPicker && (
        <div style={s.modal} onClick={() => setShowTermPicker(false)}>
          <div style={{ ...s.modalContent, maxWidth: 500 }} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h3 style={s.modalTitle}>医学术语词库</h3>
              <button style={{ ...s.btn, ...s.btnGhost, padding: '4px 8px' }} onClick={() => setShowTermPicker(false)}>
                <X size={18} />
              </button>
            </div>
            <div style={s.searchBox}>
              <Search size={14} color="#94a3b8" />
              <input
                type="text"
                style={s.searchInput}
                placeholder="搜索术语..."
                value={termSearch}
                onChange={e => setTermSearch(e.target.value)}
              />
            </div>
            <div style={{ maxHeight: 400, overflow: 'auto' }}>
              {filteredTerms.map(term => (
                <div
                  key={term.term}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 12px', borderRadius: 6, cursor: 'pointer',
                  }}
                  onMouseOver={e => (e.currentTarget.style.background = '#f1f5f9')}
                  onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                  onClick={() => {
                    insertTerm(term.term + '，')
                    setShowTermPicker(false)
                  }}
                >
                  <span style={{ fontSize: 13, color: '#1a3a5c' }}>{term.term}</span>
                  <span style={{ fontSize: 11, color: '#94a3b8', background: '#f1f5f9', padding: '2px 8px', borderRadius: 10 }}>
                    {term.category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 移动端抽屉按钮 */}
      <button
        style={{
          display: 'none',
          position: 'fixed' as const,
          right: 16,
          bottom: 80,
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: '#3b82f6',
          color: '#fff',
          border: 'none',
          boxShadow: '0 4px 12px rgba(59,130,246,0.4)',
          cursor: 'pointer',
          zIndex: 99,
        }}
        onClick={() => setDrawerOpen(!drawerOpen)}
      >
        {drawerOpen ? <X size={20} /> : <LayoutList size={20} />}
      </button>

      {/* 响应式样式注入 */}
      <style>{`
        @media (max-width: 1200px) {
          .main-layout { grid-template-columns: 1fr !important; }
          .right-panel { display: none; }
          .mobile-drawer { display: block !important; }
        }
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </div>
  )
}
