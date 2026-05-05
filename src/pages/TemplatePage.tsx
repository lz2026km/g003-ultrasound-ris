// @ts-nocheck
import { useState, useCallback, useMemo } from 'react';
import {
  FileText, Search, Plus, Edit, Eye, Trash2, Copy, BarChart3,
  X, ChevronDown, Filter, Layout, Image, ListChecks, Calendar,
  Hash, Type, Globe, CheckSquare, PenTool, Download, Upload,
  Stethoscope, AlertCircle, TrendingUp, Clock, Users, Tag, FilterList,
  History, CheckCircle, XCircle, Send, ClockCounterClockwise, Sparkles,
  Heart, Activity, Baby, Layers, Syringe, Scan, Microscope, Ruler,
  BookOpen, Lightbulb, ChevronRight, Save, RotateCcw, Workflow,
  User, Building2, ArrowUp, ArrowDown, Move, Settings,
  Check, Minus, AlertTriangle, Info, RefreshCw, Zap, BrainCircuit
} from 'lucide-react';

// ========== 模板三级管理 & 专科分类 ==========
type ScopeLevel = 'personal' | 'department' | 'hospital';
type SpecialtyCategory = 'cardiac' | 'abdominal' | 'superficial' | 'obgyn' | 'vascular' | 'interventional';
type TemplateStatus = 'draft' | 'pending_review' | 'published' | 'archived';
type FieldType = 'text' | 'number' | 'select' | 'date' | 'multiselect' | 'image' | 'signature' | 'clinical-finding' | 'measurement' | 'formula';

interface TemplateField {
  id: string;
  name: string;
  type: FieldType;
  required: boolean;
  options?: string[];
  placeholder?: string;
  defaultValue?: string;
  unit?: string;
  normalRange?: string;
  knowledgeTerms?: string[];
  formula?: string;
  category?: string;
}

interface TemplateVersion {
  version: string;
  createdAt: string;
  createdBy: string;
  changes: string;
  status: TemplateStatus;
}

interface Template {
  id: string;
  name: string;
  scope: ScopeLevel;
  specialty: SpecialtyCategory;
  description: string;
  fields: TemplateField[];
  usageCount: number;
  lastUsed: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  version: string;
  versions: TemplateVersion[];
  status: TemplateStatus;
  reviewComment?: string;
  approvedBy?: string;
  departmentId?: string;
  departmentName?: string;
  tags: string[];
  isProfessional: boolean;
  isFavorite: boolean;
}

// ========== 知识库：超声检查联想词库 ==========
interface KnowledgeItem {
  keyword: string;
  measurements: { name: string; unit: string; normalRange: string }[];
  descriptions: string[];
  relatedTerms: string[];
}

const ultrasoundKnowledgeBase: Record<string, KnowledgeItem> = {
  '肝脏': {
    keyword: '肝脏',
    measurements: [
      { name: '门静脉主干内径', unit: 'mm', normalRange: '8-13mm' },
      { name: '肝静脉内径', unit: 'mm', normalRange: '5-10mm' },
      { name: '肝左叶长径', unit: 'mm', normalRange: '50-80mm' },
      { name: '肝右叶斜径', unit: 'mm', normalRange: '100-150mm' },
      { name: '肝脏大小', unit: '', normalRange: '正常或增大' },
    ],
    descriptions: ['肝大小正常，形态规整，包膜光滑', '肝右叶增大', '肝左叶增大', '肝硬化表现', '肝内回声均匀', '肝内未见明显占位'],
    relatedTerms: ['门静脉', '肝静脉', '胆总管', '脾脏'],
  },
  '胆囊': {
    keyword: '胆囊',
    measurements: [
      { name: '胆囊长径', unit: 'mm', normalRange: '40-80mm' },
      { name: '胆囊前后径', unit: 'mm', normalRange: '20-35mm' },
      { name: '胆囊壁厚度', unit: 'mm', normalRange: '<3mm' },
      { name: '胆总管内径', unit: 'mm', normalRange: '3-7mm' },
    ],
    descriptions: ['胆囊大小正常，壁薄光滑', '胆囊壁增厚', '胆囊结石', '胆囊息肉', '胆泥沉积', '胆囊收缩功能良好'],
    relatedTerms: ['胆总管', '肝内胆管', '胆汁'],
  },
  '脾脏': {
    keyword: '脾脏',
    measurements: [
      { name: '脾脏长径', unit: 'mm', normalRange: '80-120mm' },
      { name: '脾脏厚径', unit: 'mm', normalRange: '25-40mm' },
      { name: '脾脏宽径', unit: 'mm', normalRange: '50-70mm' },
    ],
    descriptions: ['脾脏大小正常，形态规整', '脾大', '脾内未见明显占位', '脾破裂', '脾囊肿'],
    relatedTerms: ['门静脉', '左肾', '胰腺尾部'],
  },
  '肾脏': {
    keyword: '肾脏',
    measurements: [
      { name: '肾脏长径', unit: 'mm', normalRange: '90-110mm' },
      { name: '肾脏宽径', unit: 'mm', normalRange: '40-55mm' },
      { name: '肾脏厚径', unit: 'mm', normalRange: '25-35mm' },
      { name: '肾皮质厚度', unit: 'mm', normalRange: '6-10mm' },
    ],
    descriptions: ['双肾大小形态正常', '左肾/右肾缩小', '肾实质回声正常', '肾窦回声正常', '肾积水', '肾结石', '肾囊肿'],
    relatedTerms: ['输尿管', '膀胱', '肾上腺'],
  },
  '心脏': {
    keyword: '心脏',
    measurements: [
      { name: '左室舒张末径', unit: 'mm', normalRange: '35-55mm' },
      { name: '左室收缩末径', unit: 'mm', normalRange: '25-38mm' },
      { name: '室间隔厚度', unit: 'mm', normalRange: '6-11mm' },
      { name: '左室后壁厚度', unit: 'mm', normalRange: '6-11mm' },
      { name: 'EF值', unit: '%', normalRange: '50-70%' },
      { name: 'E/A比值', unit: '', normalRange: '0.8-2.0' },
      { name: '左房内径', unit: 'mm', normalRange: '20-35mm' },
      { name: '主动脉根部内径', unit: 'mm', normalRange: '20-37mm' },
    ],
    descriptions: ['心脏结构正常', '左室壁增厚', '节段性室壁运动异常', '左室舒张功能减低', '心包积液', '瓣膜反流', '瓣膜狭窄'],
    relatedTerms: ['主动脉', '肺动脉', '二尖瓣', '三尖瓣', '主动脉瓣', '肺动脉瓣'],
  },
  '甲状腺': {
    keyword: '甲状腺',
    measurements: [
      { name: '甲状腺左右径', unit: 'mm', normalRange: '15-20mm' },
      { name: '甲状腺前后径', unit: 'mm', normalRange: '10-20mm' },
      { name: '甲状腺峡部厚度', unit: 'mm', normalRange: '<5mm' },
    ],
    descriptions: ['甲状腺大小形态正常', '甲状腺增大', '甲状腺结节', '甲状腺回声减低', '甲状腺回声增强', '桥本氏甲状腺炎'],
    relatedTerms: ['颈部淋巴结', '气管', '颈动脉'],
  },
  '乳腺': {
    keyword: '乳腺',
    measurements: [
      { name: '导管内径', unit: 'mm', normalRange: '<3mm' },
    ],
    descriptions: ['双乳未见明显异常', '乳腺增生', '乳腺结节', '乳腺纤维腺瘤', '乳腺癌', '导管扩张', '腋窝淋巴结可见'],
    relatedTerms: ['腋窝淋巴结', '胸肌', 'Cooper韧带'],
  },
  '颈部血管': {
    keyword: '颈部血管',
    measurements: [
      { name: '颈总动脉内中膜厚度', unit: 'mm', normalRange: '<1.0mm' },
      { name: '颈总动脉内径', unit: 'mm', normalRange: '6-8mm' },
      { name: '颈内动脉内径', unit: 'mm', normalRange: '5-7mm' },
      { name: '收缩期峰值流速', unit: 'cm/s', normalRange: '根据部位而异' },
      { name: '舒张末期流速', unit: 'cm/s', normalRange: '根据部位而异' },
    ],
    descriptions: ['双侧颈动脉内膜光滑', '颈动脉粥样硬化斑块形成', '血管狭窄', '血流速度正常', '颈内静脉可见'],
    relatedTerms: ['椎动脉', '锁骨下动脉', '颈外动脉'],
  },
  '下肢血管': {
    keyword: '下肢血管',
    measurements: [
      { name: '股总动脉内径', unit: 'mm', normalRange: '6-10mm' },
      { name: '腘动脉内径', unit: 'mm', normalRange: '4-7mm' },
      { name: '大隐静脉内径', unit: 'mm', normalRange: '<5mm' },
    ],
    descriptions: ['下肢动脉内膜光滑', '下肢深静脉血流通畅', '大隐静脉曲张', '血栓形成', '斑块形成', '血管狭窄'],
    relatedTerms: ['股浅动脉', '胫前动脉', '胫后动脉', '腓动脉'],
  },
  '产科': {
    keyword: '产科',
    measurements: [
      { name: '头臂长', unit: 'mm', normalRange: '根据孕周而异' },
      { name: '双顶径', unit: 'mm', normalRange: '根据孕周而异' },
      { name: '股骨长', unit: 'mm', normalRange: '根据孕周而异' },
      { name: '腹围', unit: 'mm', normalRange: '根据孕周而异' },
      { name: '羊水深度', unit: 'mm', normalRange: '30-80mm' },
      { name: '胎心率', unit: 'bpm', normalRange: '110-160bpm' },
    ],
    descriptions: ['宫内单活胎', '宫内双胎', '胎位正常', '羊水正常', '胎盘位置正常', '脐带绕颈', '前置胎盘', '胎盘早剥'],
    relatedTerms: ['胎盘', '羊水', '脐带', '宫颈长度'],
  },
  '妇科': {
    keyword: '妇科',
    measurements: [
      { name: '子宫内膜厚度', unit: 'mm', normalRange: '根据月经周期而异' },
      { name: '子宫大小', unit: 'mm', normalRange: '根据年龄而异' },
      { name: '卵巢大小', unit: 'mm', normalRange: '20-30mm' },
    ],
    descriptions: ['子宫大小形态正常', '子宫内膜回声均匀', '双侧卵巢可见', '子宫肌瘤', '子宫腺肌症', '卵巢囊肿', '巧克力囊肿', '输卵管积液'],
    relatedTerms: ['子宫', '卵巢', '输卵管', '宫颈', '盆腔'],
  },
};

// ========== 超声专科分类配置 ==========
const specialtyConfig: Record<SpecialtyCategory, { label: string; icon: React.ReactNode; color: string; keywords: string[] }> = {
  cardiac: {
    label: '心脏',
    icon: <Heart size={16} />,
    color: '#dc2626',
    keywords: ['心脏', '心室', '心房', '瓣膜', '主动脉', '肺动脉', '心包', '冠脉'],
  },
  abdominal: {
    label: '腹部',
    icon: <Activity size={16} />,
    color: '#f59e0b',
    keywords: ['肝脏', '胆囊', '脾脏', '胰腺', '肾脏', '肾上腺', '消化道', '腹膜'],
  },
  superficial: {
    label: '浅表',
    icon: <Scan size={16} />,
    color: '#10b981',
    keywords: ['甲状腺', '乳腺', '腮腺', '颌下腺', '颈部淋巴结', '皮下肿物', '睾丸', '阴囊'],
  },
  obgyn: {
    label: '妇产',
    icon: <Baby size={16} />,
    color: '#ec4899',
    keywords: ['产科', '妇科', '子宫', '卵巢', '输卵管', '胎盘', '羊水', '胎儿'],
  },
  vascular: {
    label: '血管',
    icon: <Layers size={16} />,
    color: '#3b82f6',
    keywords: ['颈部血管', '下肢血管', '上肢血管', '腹部血管', '门静脉', '肝静脉', '肾动脉', '颈总动脉'],
  },
  interventional: {
    label: '介入',
    icon: <Syringe size={16} />,
    color: '#8b5cf6',
    keywords: ['穿刺', '活检', '引流', '消融', '硬化', '栓塞', '置管', '造影'],
  },
};

// ========== 模板数据 ==========
const generateInitialTemplates = (): Template[] => [
  {
    id: 'T001',
    name: '腹部US检查模板',
    scope: 'hospital',
    specialty: 'abdominal',
    description: '常规腹部US检查报告模板，适用于门诊和住院腹部US检查',
    usageCount: 1256,
    lastUsed: '2026-04-28',
    createdBy: '张建国',
    createdAt: '2025-01-15',
    updatedAt: '2026-04-20',
    version: '2.1',
    status: 'published',
    approvedBy: '系统管理员',
    tags: ['腹部', '常规', '标准'],
    isProfessional: false,
    isFavorite: true,
    fields: [
      { id: 'f1', name: '患者姓名', type: 'text', required: true, category: 'patient' },
      { id: 'f2', name: '性别', type: 'select', required: true, options: ['男', '女'], category: 'patient' },
      { id: 'f3', name: '年龄', type: 'number', required: true, unit: '岁', category: 'patient' },
      { id: 'f4', name: '检查日期', type: 'date', required: true, category: 'exam' },
      { id: 'f5', name: '腹部US编号', type: 'text', required: true, category: 'exam' },
      { id: 'f6', name: '检查项目', type: 'multiselect', required: true, options: ['肝脏', '胆囊', '脾脏', '胰腺', '肾脏'], category: 'exam' },
      { id: 'f7', name: '临床诊断', type: 'clinical-finding', required: true, category: 'finding' },
      { id: 'f8', name: '肝脏描述', type: 'clinical-finding', required: false, knowledgeTerms: ['肝脏'], category: 'finding' },
      { id: 'f9', name: '门静脉内径', type: 'measurement', required: false, unit: 'mm', normalRange: '8-13mm', knowledgeTerms: ['肝脏', '门静脉'] },
      { id: 'f10', name: '胆囊描述', type: 'clinical-finding', required: false, knowledgeTerms: ['胆囊'] },
      { id: 'f11', name: '肾脏描述', type: 'clinical-finding', required: false, knowledgeTerms: ['肾脏'] },
      { id: 'f12', name: '检查结论', type: 'clinical-finding', required: true, category: 'finding' },
      { id: 'f13', name: '检查图片', type: 'image', required: false, category: 'attachment' },
      { id: 'f14', name: '检查医生签名', type: 'signature', required: true, category: 'signature' },
      { id: 'f15', name: '报告日期', type: 'date', required: true, category: 'signature' },
    ],
    versions: [
      { version: '2.1', createdAt: '2026-04-20', createdBy: '张建国', changes: '增加肝脏测量字段', status: 'published' },
      { version: '2.0', createdAt: '2026-02-15', createdBy: '张建国', changes: '重构字段结构，添加知识库联想', status: 'archived' },
      { version: '1.0', createdAt: '2025-01-15', createdBy: '系统', changes: '初始版本', status: 'archived' },
    ],
  },
  {
    id: 'T002',
    name: '心脏US检查模板',
    scope: 'department',
    specialty: 'cardiac',
    description: '常规心脏US检查报告模板，适用于各种心脏疾病的诊断',
    usageCount: 892,
    lastUsed: '2026-04-27',
    createdBy: '李明华',
    createdAt: '2025-02-20',
    updatedAt: '2026-03-10',
    version: '1.3',
    status: 'published',
    approvedBy: '王主任',
    departmentName: '心血管内科',
    tags: ['心脏', '心血管', '专科'],
    isProfessional: true,
    isFavorite: true,
    fields: [
      { id: 'f1', name: '患者姓名', type: 'text', required: true, category: 'patient' },
      { id: 'f2', name: '性别', type: 'select', required: true, options: ['男', '女'], category: 'patient' },
      { id: 'f3', name: '年龄', type: 'number', required: true, unit: '岁', category: 'patient' },
      { id: 'f4', name: '检查日期', type: 'date', required: true, category: 'exam' },
      { id: 'f5', name: '左室舒张末径', type: 'measurement', required: false, unit: 'mm', normalRange: '35-55mm', knowledgeTerms: ['心脏', '左室'] },
      { id: 'f6', name: '左室收缩末径', type: 'measurement', required: false, unit: 'mm', normalRange: '25-38mm', knowledgeTerms: ['心脏', '左室'] },
      { id: 'f7', name: '室间隔厚度', type: 'measurement', required: false, unit: 'mm', normalRange: '6-11mm', knowledgeTerms: ['心脏', '室间隔'] },
      { id: 'f8', name: 'EF值', type: 'measurement', required: true, unit: '%', normalRange: '50-70%', knowledgeTerms: ['心脏', '心功能'] },
      { id: 'f9', name: 'E/A比值', type: 'measurement', required: false, unit: '', normalRange: '0.8-2.0', knowledgeTerms: ['心脏', '舒张功能'] },
      { id: 'f10', name: '瓣膜评估', type: 'clinical-finding', required: false, knowledgeTerms: ['心脏', '瓣膜'] },
      { id: 'f11', name: '检查结论', type: 'clinical-finding', required: true },
      { id: 'f12', name: '检查图片', type: 'image', required: false },
      { id: 'f13', name: '检查医生签名', type: 'signature', required: true },
    ],
    versions: [
      { version: '1.3', createdAt: '2026-03-10', createdBy: '李明华', changes: '优化测量字段范围', status: 'published' },
      { version: '1.2', createdAt: '2025-08-15', createdBy: '李明华', changes: '添加E/A比值测量', status: 'archived' },
    ],
  },
  {
    id: 'T003',
    name: '甲状腺US模板',
    scope: 'personal',
    specialty: 'superficial',
    description: '甲状腺US检查报告模板，支持结节分级（TI-RADS）',
    usageCount: 456,
    lastUsed: '2026-04-29',
    createdBy: '当前用户',
    createdAt: '2025-06-01',
    updatedAt: '2026-04-15',
    version: '1.1',
    status: 'published',
    tags: ['甲状腺', '浅表', 'TI-RADS'],
    isProfessional: false,
    isFavorite: false,
    fields: [
      { id: 'f1', name: '患者姓名', type: 'text', required: true },
      { id: 'f2', name: '性别', type: 'select', required: true, options: ['男', '女'] },
      { id: 'f3', name: '年龄', type: 'number', required: true, unit: '岁' },
      { id: 'f4', name: '甲状腺左右径', type: 'measurement', required: false, unit: 'mm', normalRange: '15-20mm', knowledgeTerms: ['甲状腺'] },
      { id: 'f5', name: '甲状腺前后径', type: 'measurement', required: false, unit: 'mm', normalRange: '10-20mm', knowledgeTerms: ['甲状腺'] },
      { id: 'f6', name: '结节位置', type: 'select', required: false, options: ['左侧', '右侧', '双侧'] },
      { id: 'f7', name: '结节大小', type: 'measurement', required: false, unit: 'mm', knowledgeTerms: ['甲状腺', '结节'] },
      { id: 'f8', name: 'TI-RADS分级', type: 'select', required: false, options: ['TI-RADS 1', 'TI-RADS 2', 'TI-RADS 3', 'TI-RADS 4A', 'TI-RADS 4B', 'TI-RADS 4C', 'TI-RADS 5', 'TI-RADS 6'] },
      { id: 'f9', name: '检查描述', type: 'clinical-finding', required: true, knowledgeTerms: ['甲状腺'] },
      { id: 'f10', name: '检查结论', type: 'clinical-finding', required: true },
      { id: 'f11', name: '医生签名', type: 'signature', required: true },
    ],
    versions: [
      { version: '1.1', createdAt: '2026-04-15', createdBy: '当前用户', changes: '添加TI-RADS分级', status: 'published' },
    ],
  },
  {
    id: 'T004',
    name: '产科US模板',
    scope: 'hospital',
    specialty: 'obgyn',
    description: '常规产科US检查模板，适用于早孕、中孕、晚孕检查',
    usageCount: 2341,
    lastUsed: '2026-04-29',
    createdBy: '赵专家',
    createdAt: '2024-11-01',
    updatedAt: '2026-04-10',
    version: '3.0',
    status: 'published',
    approvedBy: '医务科',
    tags: ['产科', '胎儿', '孕检'],
    isProfessional: true,
    isFavorite: true,
    fields: [
      { id: 'f1', name: '孕妇姓名', type: 'text', required: true },
      { id: 'f2', name: '年龄', type: 'number', required: true, unit: '岁' },
      { id: 'f3', name: '孕周', type: 'number', required: true, unit: '周', normalRange: '4-42周' },
      { id: 'f4', name: '检查日期', type: 'date', required: true },
      { id: 'f5', name: '头臂长', type: 'measurement', required: false, unit: 'mm', knowledgeTerms: ['产科'] },
      { id: 'f6', name: '双顶径', type: 'measurement', required: false, unit: 'mm', knowledgeTerms: ['产科', '胎儿'] },
      { id: 'f7', name: '股骨长', type: 'measurement', required: false, unit: 'mm', knowledgeTerms: ['产科', '胎儿'] },
      { id: 'f8', name: '腹围', type: 'measurement', required: false, unit: 'mm', knowledgeTerms: ['产科', '胎儿'] },
      { id: 'f9', name: '羊水深度', type: 'measurement', required: false, unit: 'mm', normalRange: '30-80mm', knowledgeTerms: ['羊水'] },
      { id: 'f10', name: '胎心率', type: 'measurement', required: false, unit: 'bpm', normalRange: '110-160bpm', knowledgeTerms: ['胎儿', '胎心'] },
      { id: 'f11', name: '胎位', type: 'select', required: false, options: ['头位', '臀位', '横位'] },
      { id: 'f12', name: '胎盘位置', type: 'clinical-finding', required: false, knowledgeTerms: ['胎盘'] },
      { id: 'f13', name: '脐带绕颈', type: 'select', required: false, options: ['无', '绕颈一周', '绕颈两周', '绕颈三周及以上'] },
      { id: 'f14', name: '检查描述', type: 'clinical-finding', required: true, knowledgeTerms: ['产科'] },
      { id: 'f15', name: '检查结论', type: 'clinical-finding', required: true },
      { id: 'f16', name: '检查图片', type: 'image', required: false },
      { id: 'f17', name: '医生签名', type: 'signature', required: true },
    ],
    versions: [
      { version: '3.0', createdAt: '2026-04-10', createdBy: '赵专家', changes: '增加晚孕检查字段', status: 'published' },
    ],
  },
  {
    id: 'T005',
    name: '下肢血管US模板',
    scope: 'department',
    specialty: 'vascular',
    description: '下肢动静脉US检查模板，支持血栓评估',
    usageCount: 678,
    lastUsed: '2026-04-26',
    createdBy: '血管外科',
    createdAt: '2025-03-15',
    updatedAt: '2026-02-28',
    version: '1.2',
    status: 'published',
    departmentName: '血管外科',
    tags: ['血管', '下肢', '血栓'],
    isProfessional: true,
    isFavorite: false,
    fields: [
      { id: 'f1', name: '患者姓名', type: 'text', required: true },
      { id: 'f2', name: '性别', type: 'select', required: true, options: ['男', '女'] },
      { id: 'f3', name: '年龄', type: 'number', required: true, unit: '岁' },
      { id: 'f4', name: '检查日期', type: 'date', required: true },
      { id: 'f5', name: '检查侧别', type: 'multiselect', required: true, options: ['左侧', '右侧', '双侧'] },
      { id: 'f6', name: '股总动脉内径', type: 'measurement', required: false, unit: 'mm', normalRange: '6-10mm', knowledgeTerms: ['下肢血管', '股动脉'] },
      { id: 'f7', name: '腘动脉内径', type: 'measurement', required: false, unit: 'mm', normalRange: '4-7mm', knowledgeTerms: ['下肢血管', '腘动脉'] },
      { id: 'f8', name: '大隐静脉内径', type: 'measurement', required: false, unit: 'mm', normalRange: '<5mm', knowledgeTerms: ['下肢血管', '大隐静脉'] },
      { id: 'f9', name: '血流速度', type: 'measurement', required: false, unit: 'cm/s', knowledgeTerms: ['下肢血管'] },
      { id: 'f10', name: '血栓评估', type: 'clinical-finding', required: false, knowledgeTerms: ['下肢血管', '血栓'] },
      { id: 'f11', name: '检查描述', type: 'clinical-finding', required: true },
      { id: 'f12', name: '检查结论', type: 'clinical-finding', required: true },
      { id: 'f13', name: '检查图片', type: 'image', required: false },
      { id: 'f14', name: '医生签名', type: 'signature', required: true },
    ],
    versions: [
      { version: '1.2', createdAt: '2026-02-28', createdBy: '血管外科', changes: '优化血流速度参考范围', status: 'published' },
    ],
  },
  {
    id: 'T006',
    name: '介入穿刺活检模板',
    scope: 'hospital',
    specialty: 'interventional',
    description: 'US引导下穿刺活检记录模板，支持标本标记',
    usageCount: 234,
    lastUsed: '2026-04-25',
    createdBy: '介入科',
    createdAt: '2025-05-10',
    updatedAt: '2026-04-05',
    version: '1.0',
    status: 'pending_review',
    departmentName: '介入科',
    tags: ['介入', '穿刺', '活检'],
    isProfessional: true,
    isFavorite: false,
    fields: [
      { id: 'f1', name: '患者姓名', type: 'text', required: true },
      { id: 'f2', name: '性别', type: 'select', required: true, options: ['男', '女'] },
      { id: 'f3', name: '年龄', type: 'number', required: true, unit: '岁' },
      { id: 'f4', name: '穿刺日期', type: 'date', required: true },
      { id: 'f5', name: '穿刺部位', type: 'clinical-finding', required: true },
      { id: 'f6', name: '穿刺深度', type: 'measurement', required: false, unit: 'mm' },
      { id: 'f7', name: '穿刺角度', type: 'measurement', required: false, unit: '度' },
      { id: 'f8', name: '标本数量', type: 'number', required: false, unit: '条' },
      { id: 'f9', name: '标本标记', type: 'multiselect', required: false, options: ['常规病理', '免疫组化', '分子检测', '细菌培养', '真菌培养'] },
      { id: 'f10', name: '穿刺过程', type: 'clinical-finding', required: true },
      { id: 'f11', name: '术后观察', type: 'clinical-finding', required: false },
      { id: 'f12', name: '并发症', type: 'select', required: false, options: ['无', '少量出血', '中量出血', '气胸', '感染'] },
      { id: 'f13', name: '穿刺图片', type: 'image', required: true },
      { id: 'f14', name: '操作医生', type: 'signature', required: true },
      { id: 'f15', name: '记录时间', type: 'date', required: true },
    ],
    versions: [
      { version: '1.0', createdAt: '2026-04-05', createdBy: '介入科', changes: '初始版本', status: 'pending_review' },
    ],
  },
  {
    id: 'T007',
    name: '颈部血管US模板',
    scope: 'personal',
    specialty: 'vascular',
    description: '颈动脉、椎动脉US检查模板，支持斑块评估',
    usageCount: 567,
    lastUsed: '2026-04-28',
    createdBy: '当前用户',
    createdAt: '2025-07-20',
    updatedAt: '2026-03-25',
    version: '1.1',
    status: 'published',
    tags: ['颈部血管', '颈动脉', '斑块'],
    isProfessional: false,
    isFavorite: true,
    fields: [
      { id: 'f1', name: '患者姓名', type: 'text', required: true },
      { id: 'f2', name: '性别', type: 'select', required: true, options: ['男', '女'] },
      { id: 'f3', name: '年龄', type: 'number', required: true, unit: '岁' },
      { id: 'f4', name: '检查日期', type: 'date', required: true },
      { id: 'f5', name: '检查侧别', type: 'multiselect', required: true, options: ['左侧', '右侧', '双侧'] },
      { id: 'f6', name: '颈总动脉内中膜厚度', type: 'measurement', required: false, unit: 'mm', normalRange: '<1.0mm', knowledgeTerms: ['颈部血管', '颈动脉'] },
      { id: 'f7', name: '颈总动脉内径', type: 'measurement', required: false, unit: 'mm', normalRange: '6-8mm', knowledgeTerms: ['颈部血管', '颈动脉'] },
      { id: 'f8', name: '颈内动脉内径', type: 'measurement', required: false, unit: 'mm', normalRange: '5-7mm', knowledgeTerms: ['颈部血管', '颈内动脉'] },
      { id: 'f9', name: '收缩期峰值流速', type: 'measurement', required: false, unit: 'cm/s', knowledgeTerms: ['颈部血管'] },
      { id: 'f10', name: '舒张末期流速', type: 'measurement', required: false, unit: 'cm/s', knowledgeTerms: ['颈部血管'] },
      { id: 'f11', name: '斑块评估', type: 'clinical-finding', required: false, knowledgeTerms: ['颈部血管', '斑块'] },
      { id: 'f12', name: '狭窄率评估', type: 'select', required: false, options: ['正常', '轻度狭窄(<50%)', '中度狭窄(50-69%)', '重度狭窄(70-99%)', '闭塞'] },
      { id: 'f13', name: '检查描述', type: 'clinical-finding', required: true },
      { id: 'f14', name: '检查结论', type: 'clinical-finding', required: true },
      { id: 'f15', name: '检查图片', type: 'image', required: false },
      { id: 'f16', name: '医生签名', type: 'signature', required: true },
    ],
    versions: [
      { version: '1.1', createdAt: '2026-03-25', createdBy: '当前用户', changes: '添加狭窄率评估', status: 'published' },
    ],
  },
  {
    id: 'T008',
    name: '乳腺US模板（草稿）',
    scope: 'personal',
    specialty: 'superficial',
    description: '乳腺US检查模板（BI-RADS分级），待完善',
    usageCount: 0,
    lastUsed: '',
    createdBy: '当前用户',
    createdAt: '2026-04-28',
    updatedAt: '2026-04-28',
    version: '0.1',
    status: 'draft',
    tags: ['乳腺', 'BI-RADS'],
    isProfessional: false,
    isFavorite: false,
    fields: [
      { id: 'f1', name: '患者姓名', type: 'text', required: true },
      { id: 'f2', name: '性别', type: 'select', required: true, options: ['女'] },
      { id: 'f3', name: '年龄', type: 'number', required: true, unit: '岁' },
      { id: 'f4', name: '检查日期', type: 'date', required: true },
      { id: 'f5', name: '检查侧别', type: 'multiselect', required: true, options: ['左侧', '右侧', '双侧'] },
      { id: 'f6', name: '乳腺腺体层厚度', type: 'measurement', required: false, unit: 'mm' },
      { id: 'f7', name: 'BI-RADS分级', type: 'select', required: false, options: ['BI-RADS 0', 'BI-RADS 1', 'BI-RADS 2', 'BI-RADS 3', 'BI-RADS 4A', 'BI-RADS 4B', 'BI-RADS 4C', 'BI-RADS 5', 'BI-RADS 6'] },
      { id: 'f8', name: '结节描述', type: 'clinical-finding', required: true },
      { id: 'f9', name: '医生签名', type: 'signature', required: true },
    ],
    versions: [
      { version: '0.1', createdAt: '2026-04-28', createdBy: '当前用户', changes: '初始草稿', status: 'draft' },
    ],
  },
];

// ========== 样式 ==========
const styles: Record<string, React.CSSProperties> = {
  root: { padding: 24, background: '#f0f4f8', minHeight: '100vh' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 20, fontWeight: 700, color: '#1a3a5c', display: 'flex', alignItems: 'center', gap: 8 },
  statRow: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 24 },
  statCard: { background: '#fff', borderRadius: 10, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  statLabel: { fontSize: 12, color: '#64748b', marginBottom: 4 },
  statValue: { fontSize: 24, fontWeight: 700, color: '#1a3a5c' },
  statSub: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  tabBar: { display: 'flex', gap: 4, background: '#fff', padding: 4, borderRadius: 8, marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  tab: { padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#64748b', border: 'none', background: 'none', transition: 'all 0.15s' },
  tabActive: { background: '#1a3a5c', color: '#fff' },
  searchRow: { display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' as const },
  searchBox: { flex: '1 1 300px', display: 'flex', alignItems: 'center', gap: 8, background: '#fff', borderRadius: 8, padding: '8px 12px', border: '1px solid #e2e8f0', minWidth: 200 },
  searchInput: { border: 'none', outline: 'none', flex: 1, fontSize: 13 },
  filterBtn: { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: 13, color: '#64748b' },
  cardGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 },
  card: { background: '#fff', borderRadius: 10, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', transition: 'all 0.2s', cursor: 'pointer', border: '2px solid transparent' },
  cardHover: { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
  cardSelected: { borderColor: '#3b82f6' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  cardTitle: { fontSize: 15, fontWeight: 700, color: '#1a3a5c', marginBottom: 4 },
  cardDesc: { fontSize: 12, color: '#64748b', lineHeight: 1.5, marginBottom: 12 },
  cardMeta: { display: 'flex', gap: 16, fontSize: 11, color: '#94a3b8', marginBottom: 12, flexWrap: 'wrap' as const },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid #f1f5f9' },
  badge: { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 },
  scopePersonal: { background: '#dbeafe', color: '#1d4ed8' },
  scopeDepartment: { background: '#dcfce7', color: '#16a34a' },
  scopeHospital: { background: '#fef3c7', color: '#b45309' },
  specialtyCardiac: { background: '#fee2e2', color: '#dc2626' },
  specialtyAbdominal: { background: '#fef3c7', color: '#f59e0b' },
  specialtySuperficial: { background: '#d1fae5', color: '#10b981' },
  specialtyObgyn: { background: '#fce7f3', color: '#ec4899' },
  specialtyVascular: { background: '#dbeafe', color: '#3b82f6' },
  specialtyInterventional: { background: '#ede9fe', color: '#8b5cf6' },
  statusDraft: { background: '#f1f5f9', color: '#64748b' },
  statusPending: { background: '#fef3c7', color: '#d97706' },
  statusPublished: { background: '#d1fae5', color: '#059669' },
  statusArchived: { background: '#e2e8f0', color: '#475569' },
  badgeProfessional: { background: '#fef3c7', color: '#b45309', fontSize: 10 },
  statBadge: { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 6px', borderRadius: 4, fontSize: 10, background: '#f1f5f9', color: '#475569' },
  actionBtn: { padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 },
  btnPrimary: { background: '#1a3a5c', color: '#fff' },
  btnSuccess: { background: '#16a34a', color: '#fff' },
  btnWarning: { background: '#d97706', color: '#fff' },
  btnDanger: { background: '#dc2626', color: '#fff' },
  btnGhost: { background: '#f1f5f9', color: '#475569' },
  btnInfo: { background: '#3b82f6', color: '#fff' },
  modal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalContent: { background: '#fff', borderRadius: 12, width: 1000, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' },
  modalLarge: { width: 1200 },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e2e8f0' },
  modalTitle: { fontSize: 16, fontWeight: 700, color: '#1a3a5c' },
  modalBody: { padding: 20 },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '12px 20px', borderTop: '1px solid #e2e8f0' },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 },
  formRow3: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 },
  formGroup: { marginBottom: 12 },
  formLabel: { display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4 },
  formInput: { width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', boxSizing: 'border-box' as const },
  formSelect: { width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', background: '#fff', boxSizing: 'border-box' as const },
  formTextarea: { width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', resize: 'vertical' as const, minHeight: 80, boxSizing: 'border-box' as const },
  fieldList: { background: '#f8fafc', borderRadius: 8, padding: 16, marginTop: 16 },
  fieldItem: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: '#fff', borderRadius: 6, marginBottom: 8, border: '1px solid #e2e8f0' },
  fieldIcon: { width: 32, height: 32, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' },
  fieldName: { flex: 1, fontSize: 13, fontWeight: 500, color: '#334155' },
  fieldType: { fontSize: 11, color: '#94a3b8' },
  fieldRequired: { color: '#dc2626', fontSize: 11 },
  previewField: { padding: '8px 12px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 13, color: '#64748b' },
  previewLabel: { fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4 },
  previewSection: { marginBottom: 20 },
  previewSectionTitle: { fontSize: 14, fontWeight: 700, color: '#1a3a5c', marginBottom: 12, paddingBottom: 8, borderBottom: '2px solid #1a3a5c' },
  chartCard: { background: '#fff', borderRadius: 10, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  chartTitle: { fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 12 },
  barRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 },
  barLabel: { fontSize: 12, color: '#64748b', width: 80 },
  barBg: { flex: 1, height: 8, background: '#f1f5f9', borderRadius: 4 },
  barFill: { height: 8, borderRadius: 4, transition: 'width 0.3s' },
  emptyState: { textAlign: 'center', padding: '60px 0', color: '#94a3b8' },
  addFieldBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 12, border: '2px dashed #e2e8f0', borderRadius: 8, cursor: 'pointer', color: '#94a3b8', fontSize: 13, background: 'none', width: '100%', marginTop: 8 },
  checkbox: { width: 16, height: 16, cursor: 'pointer' },
  tag: { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 4, fontSize: 11, background: '#f1f5f9', color: '#64748b', marginRight: 4, marginBottom: 4 },
  knowledgePanel: { background: '#fef9c3', border: '1px solid #fde047', borderRadius: 8, padding: 12, marginTop: 8 },
  knowledgeTitle: { fontSize: 12, fontWeight: 600, color: '#854d0e', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 },
  knowledgeItem: { padding: '4px 8px', background: '#fff', borderRadius: 4, fontSize: 12, color: '#475569', cursor: 'pointer', marginBottom: 4, border: '1px solid #e2e8f0' },
  versionBadge: { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 6px', borderRadius: 4, fontSize: 10, background: '#f1f5f9', color: '#64748b' },
  dropdown: { position: 'absolute' as const, top: '100%', left: 0, right: 0, background: '#fff', borderRadius: 6, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 100, maxHeight: 200, overflow: 'auto' },
  dropdownItem: { padding: '8px 12px', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 },
  filterPanel: { background: '#fff', borderRadius: 8, padding: 16, marginBottom: 16, border: '1px solid #e2e8f0' },
  filterRow: { display: 'flex', gap: 12, flexWrap: 'wrap' as const, alignItems: 'center' },
  scopeSelector: { display: 'flex', gap: 8, marginBottom: 16 },
  scopeBtn: { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: '2px solid #e2e8f0', cursor: 'pointer', fontSize: 13, background: '#fff', transition: 'all 0.15s' },
  scopeBtnActive: { borderColor: '#3b82f6', background: '#eff6ff' },
  specialtyGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 },
  specialtyBtn: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 8, padding: 16, borderRadius: 10, border: '2px solid #e2e8f0', cursor: 'pointer', background: '#fff', transition: 'all 0.15s' },
  specialtyBtnActive: { borderColor: '#3b82f6', background: '#eff6ff' },
  specialtyLabel: { fontSize: 13, fontWeight: 600, color: '#334155' },
  previewTpl: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 20 },
  previewFieldRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 },
  previewFieldFull: { gridColumn: '1 / -1' },
  fieldDragHandle: { cursor: 'move', color: '#94a3b8', padding: 4 },
  fieldActions: { display: 'flex', gap: 4 },
};

// 字段类型配置
const fieldTypeConfig: Record<FieldType, { icon: React.ReactNode; color: string; label: string }> = {
  text: { icon: <Type size={14} />, color: '#3b82f6', label: '文本' },
  number: { icon: <Hash size={14} />, color: '#8b5cf6', label: '数字' },
  select: { icon: <ChevronDown size={14} />, color: '#16a34a', label: '下拉选择' },
  date: { icon: <Calendar size={14} />, color: '#d97706', label: '日期' },
  multiselect: { icon: <ListChecks size={14} />, color: '#06b6d4', label: '多选' },
  image: { icon: <Image size={14} />, color: '#ec4899', label: '图片' },
  signature: { icon: <PenTool size={14} />, color: '#1a3a5c', label: '签名' },
  'clinical-finding': { icon: <Stethoscope size={14} />, color: '#059669', label: '临床描述' },
  measurement: { icon: <Ruler size={14} />, color: '#dc2626', label: '测量值' },
  formula: { icon: <Zap size={14} />, color: '#7c3aed', label: '计算公式' },
};

// 状态配置
const statusConfig: Record<TemplateStatus, { label: string; icon: React.ReactNode; color: string }> = {
  draft: { label: '草稿', icon: <Edit size={12} />, color: '#64748b' },
  pending_review: { label: '待审核', icon: <Clock size={12} />, color: '#d97706' },
  published: { label: '已发布', icon: <CheckCircle size={12} />, color: '#059669' },
  archived: { label: '已归档', icon: <History size={12} />, color: '#475569' },
};

// 范围配置
const scopeConfig: Record<ScopeLevel, { label: string; icon: React.ReactNode; color: string }> = {
  personal: { label: '个人', icon: <User size={12} />, color: '#1d4ed8' },
  department: { label: '科室', icon: <Building2 size={12} />, color: '#16a34a' },
  hospital: { label: '全院', icon: <Building2 size={12} />, color: '#b45309' },
};

export default function TemplatePage() {
  const [templates, setTemplates] = useState<Template[]>(generateInitialTemplates());
  const [activeTab, setActiveTab] = useState<string>('list');
  const [search, setSearch] = useState('');
  const [filterScope, setFilterScope] = useState<ScopeLevel | 'all'>('all');
  const [filterSpecialty, setFilterSpecialty] = useState<SpecialtyCategory | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<TemplateStatus | 'all'>('all');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [showKnowledgePanel, setShowKnowledgePanel] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [versionTemplate, setVersionTemplate] = useState<Template | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [knowledgeSearch, setKnowledgeSearch] = useState('');
  const [activeKnowledgeTerm, setActiveKnowledgeTerm] = useState<string | null>(null);
  const [fieldModalMode, setFieldModalMode] = useState<'add' | 'edit'>('add');
  const [editingField, setEditingField] = useState<TemplateField | null>(null);
  const [showFieldModal, setShowFieldModal] = useState(false);

  // 统计数据
  const totalUsage = templates.reduce((sum, t) => sum + t.usageCount, 0);
  const avgUsage = Math.round(totalUsage / templates.length) || 0;
  const professionalCount = templates.filter(t => t.isProfessional).length;
  const recentUsed = templates.filter(t => t.lastUsed >= '2026-04-27').length;
  const pendingReviewCount = templates.filter(t => t.status === 'pending_review').length;

  // 过滤数据
  const filteredTemplates = useMemo(() => {
    return templates.filter(t => {
      const matchSearch = !search || 
        t.name.includes(search) || 
        t.description.includes(search) || 
        t.tags.some(tag => tag.includes(search));
      const matchScope = filterScope === 'all' || t.scope === filterScope;
      const matchSpecialty = filterSpecialty === 'all' || t.specialty === filterSpecialty;
      const matchStatus = filterStatus === 'all' || t.status === filterStatus;
      return matchSearch && matchScope && matchSpecialty && matchStatus;
    });
  }, [templates, search, filterScope, filterSpecialty, filterStatus]);

  // 分类统计
  const scopeStats = useMemo(() => {
    const stats = { personal: 0, department: 0, hospital: 0 };
    templates.forEach(t => { stats[t.scope] += t.usageCount; });
    return stats;
  }, [templates]);

  const specialtyStats = useMemo(() => {
    const stats = {} as Record<SpecialtyCategory, number>;
    templates.forEach(t => { stats[t.specialty] = (stats[t.specialty] || 0) + t.usageCount; });
    return stats;
  }, [templates]);

  // 知识库联想
  const knowledgeSuggestions = useMemo(() => {
    if (!knowledgeSearch || knowledgeSearch.length < 2) return [];
    const suggestions: string[] = [];
    Object.keys(ultrasoundKnowledgeBase).forEach(key => {
      if (key.includes(knowledgeSearch) || key.startsWith(knowledgeSearch)) {
        suggestions.push(key);
      }
      const related = ultrasoundKnowledgeBase[key].relatedTerms;
      related.forEach(term => {
        if (term.includes(knowledgeSearch) && !suggestions.includes(term)) {
          suggestions.push(term);
        }
      });
    });
    return suggestions.slice(0, 10);
  }, [knowledgeSearch]);

  const activeKnowledge = activeKnowledgeTerm ? ultrasoundKnowledgeBase[activeKnowledgeTerm] : null;

  // 打开预览弹窗
  const openPreview = (template: Template) => {
    setPreviewTemplate(template);
    setShowPreviewModal(true);
  };

  // 打开编辑弹窗
  const openEdit = (template?: Template) => {
    if (template) {
      setEditingTemplate({
        ...template,
        fields: [...template.fields],
        tags: [...template.tags],
        versions: [...template.versions],
      });
    } else {
      setEditingTemplate({
        id: `T${String(templates.length + 1).padStart(3, '0')}`,
        name: '',
        scope: 'personal',
        specialty: 'abdominal',
        description: '',
        fields: [],
        usageCount: 0,
        lastUsed: '',
        createdBy: '当前用户',
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        version: '0.1',
        status: 'draft',
        tags: [],
        isProfessional: false,
        isFavorite: false,
        versions: [{ version: '0.1', createdAt: new Date().toISOString().split('T')[0], createdBy: '当前用户', changes: '初始版本', status: 'draft' }],
      });
    }
    setShowEditModal(true);
  };

  // 打开版本历史
  const openVersionHistory = (template: Template) => {
    setVersionTemplate(template);
    setShowVersionModal(true);
  };

  // 提交审核
  const submitForReview = (template: Template) => {
    setTemplates(templates.map(t => 
      t.id === template.id 
        ? { ...t, status: 'pending_review' as TemplateStatus, updatedAt: new Date().toISOString().split('T')[0] }
        : t
    ));
    alert(`模板 "${template.name}" 已提交审核`);
  };

  // 审核通过
  const approveTemplate = (template: Template) => {
    setTemplates(templates.map(t => 
      t.id === template.id 
        ? { ...t, status: 'published' as TemplateStatus, approvedBy: '当前审核人', updatedAt: new Date().toISOString().split('T')[0] }
        : t
    ));
    alert(`模板 "${template.name}" 已审核通过并发布`);
  };

  // 复制模板
  const duplicateTemplate = (template: Template) => {
    const newTemplate: Template = {
      ...template,
      id: `T${String(templates.length + 1).padStart(3, '0')}`,
      name: `${template.name} (副本)`,
      usageCount: 0,
      lastUsed: '',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      status: 'draft',
      versions: [{ version: '0.1', createdAt: new Date().toISOString().split('T')[0], createdBy: '当前用户', changes: '从模板复制', status: 'draft' }],
    };
    setTemplates([...templates, newTemplate]);
    alert(`已复制模板: ${newTemplate.name}`);
  };

  // 删除模板
  const deleteTemplate = (id: string) => {
    if (confirm('确定要删除该模板吗？')) {
      setTemplates(templates.filter(t => t.id !== id));
    }
  };

  // 添加字段
  const addField = () => {
    setEditingField(null);
    setFieldModalMode('add');
    setShowFieldModal(true);
  };

  // 编辑字段
  const editField = (field: TemplateField) => {
    setEditingField({ ...field });
    setFieldModalMode('edit');
    setShowFieldModal(true);
  };

  // 保存字段
  const saveField = (field: TemplateField) => {
    if (!editingTemplate) return;
    if (fieldModalMode === 'add') {
      setEditingTemplate({ ...editingTemplate, fields: [...editingTemplate.fields, field] });
    } else {
      setEditingTemplate({
        ...editingTemplate,
        fields: editingTemplate.fields.map(f => f.id === field.id ? field : f),
      });
    }
    setShowFieldModal(false);
  };

  // 删除字段
  const deleteField = (fieldId: string) => {
    if (!editingTemplate) return;
    setEditingTemplate({
      ...editingTemplate,
      fields: editingTemplate.fields.filter(f => f.id !== fieldId),
    });
  };

  // 移动字段
  const moveField = (index: number, direction: 'up' | 'down') => {
    if (!editingTemplate) return;
    const newFields = [...editingTemplate.fields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newFields.length) return;
    [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
    setEditingTemplate({ ...editingTemplate, fields: newFields });
  };

  // 收藏模板
  const toggleFavorite = (templateId: string) => {
    setTemplates(templates.map(t => 
      t.id === templateId ? { ...t, isFavorite: !t.isFavorite } : t
    ));
  };

  // 保存模板
  const saveTemplate = () => {
    if (!editingTemplate) return;
    const isNew = !templates.find(t => t.id === editingTemplate.id);
    if (isNew) {
      setTemplates([...templates, editingTemplate]);
    } else {
      setTemplates(templates.map(t => t.id === editingTemplate.id ? editingTemplate : t));
    }
    setShowEditModal(false);
    alert(isNew ? '模板已创建' : '模板已保存');
  };

  // 插入知识库术语
  const insertKnowledgeTerm = (fieldName: string, text: string) => {
    if (!editingTemplate) return;
    const fieldIndex = editingTemplate.fields.findIndex(f => f.name === fieldName);
    if (fieldIndex === -1) return;
    const field = editingTemplate.fields[fieldIndex];
    const newValue = (field.defaultValue || '') + text;
    const newFields = [...editingTemplate.fields];
    newFields[fieldIndex] = { ...field, defaultValue: newValue };
    setEditingTemplate({ ...editingTemplate, fields: newFields });
  };

  // 渲染统计卡片
  const renderStatCard = (label: string, value: number, sub?: string, color?: string, icon?: React.ReactNode) => (
    <div style={styles.statCard}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        {icon && <div style={{ color: color || '#1a3a5c' }}>{icon}</div>}
        <div style={styles.statLabel}>{label}</div>
      </div>
      <div style={{ ...styles.statValue, color: color || '#1a3a5c' }}>{typeof value === 'number' ? value.toLocaleString() : value}</div>
      {sub && <div style={styles.statSub}>{sub}</div>}
    </div>
  );

  // 渲染范围标签
  const renderScopeBadge = (scope: ScopeLevel) => {
    const config = scopeConfig[scope];
    return (
      <span style={{ ...styles.badge, background: `${config.color}15`, color: config.color }}>
        {config.icon} {config.label}
      </span>
    );
  };

  // 渲染专科标签
  const renderSpecialtyBadge = (specialty: SpecialtyCategory) => {
    const config = specialtyConfig[specialty];
    return (
      <span style={{ ...styles.badge, background: `${config.color}15`, color: config.color }}>
        {config.icon} {config.label}
      </span>
    );
  };

  // 渲染状态标签
  const renderStatusBadge = (status: TemplateStatus) => {
    const config = statusConfig[status];
    return (
      <span style={{ ...styles.badge, background: `${config.color}15`, color: config.color }}>
        {config.icon} {config.label}
      </span>
    );
  };

  // 渲染字段类型标签
  const renderFieldTypeTag = (type: FieldType) => {
    const config = fieldTypeConfig[type];
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 6px', borderRadius: 4, fontSize: 10, background: `${config.color}15`, color: config.color }}>
        {config.icon} {config.label}
      </span>
    );
  };

  // 渲染模板卡片
  const renderTemplateCard = (template: Template) => (
    <div
      key={template.id}
      style={{ 
        ...styles.card, 
        ...(hoveredCard === template.id ? styles.cardHover : {}),
        ...(template.isFavorite ? styles.cardSelected : {}),
      }}
      onMouseEnter={() => setHoveredCard(template.id)}
      onMouseLeave={() => setHoveredCard(null)}
    >
      <div style={styles.cardHeader}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={styles.cardTitle}>{template.name}</div>
            {template.isFavorite && <span style={{ color: '#fbbf24', fontSize: 14 }}>★</span>}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {renderScopeBadge(template.scope)}
            {renderSpecialtyBadge(template.specialty)}
            {renderStatusBadge(template.status)}
            {template.isProfessional && <span style={{ ...styles.badge, ...styles.badgeProfessional }}>专业</span>}
          </div>
        </div>
      </div>
      <div style={styles.cardDesc}>{template.description}</div>
      <div style={styles.cardMeta}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <FileText size={12} /> {template.fields.length}个字段
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <BarChart3 size={12} /> 使用{template.usageCount}次
        </span>
        {template.lastUsed && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={12} /> {template.lastUsed}
          </span>
        )}
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <History size={12} /> v{template.version}
        </span>
      </div>
      {template.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: 12 }}>
          {template.tags.map(tag => (
            <span key={tag} style={styles.tag}>#{tag}</span>
          ))}
        </div>
      )}
      <div style={styles.cardFooter}>
        <span style={{ fontSize: 11, color: '#94a3b8' }}>创建: {template.createdBy}</span>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <button style={{ ...styles.actionBtn, ...styles.btnGhost }} onClick={() => toggleFavorite(template.id)} title="收藏">
            <span style={{ color: template.isFavorite ? '#fbbf24' : '#94a3b8' }}>★</span>
          </button>
          <button style={{ ...styles.actionBtn, ...styles.btnGhost }} onClick={() => openPreview(template)}>
            <Eye size={12} /> 预览
          </button>
          <button style={{ ...styles.actionBtn, ...styles.btnGhost }} onClick={() => openVersionHistory(template)}>
            <History size={12} />
          </button>
          <button style={{ ...styles.actionBtn, ...styles.btnPrimary }} onClick={() => openEdit(template)}>
            <Edit size={12} /> 编辑
          </button>
        </div>
      </div>
    </div>
  );

  // ========== 字段编辑弹窗 ==========
  const renderFieldModal = () => {
    if (!showFieldModal) return null;
    
    const [field, setField] = useState<TemplateField>(editingField || {
      id: `f${Date.now()}`,
      name: '',
      type: 'text',
      required: false,
    });

    return (
      <div style={styles.modal} onClick={() => setShowFieldModal(false)}>
        <div style={{ ...styles.modalContent, width: 600 }} onClick={e => e.stopPropagation()}>
          <div style={styles.modalHeader}>
            <div style={styles.modalTitle}>{fieldModalMode === 'add' ? '添加字段' : '编辑字段'}</div>
            <button style={{ ...styles.actionBtn, ...styles.btnGhost }} onClick={() => setShowFieldModal(false)}>
              <X size={16} />
            </button>
          </div>
          <div style={styles.modalBody}>
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>字段名称 *</label>
                <input
                  style={styles.formInput}
                  value={field.name}
                  onChange={e => setField({ ...field, name: e.target.value })}
                  placeholder="请输入字段名称"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>字段类型 *</label>
                <select
                  style={styles.formSelect}
                  value={field.type}
                  onChange={e => setField({ ...field, type: e.target.value as FieldType })}
                >
                  {Object.entries(fieldTypeConfig).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>默认值</label>
                <input
                  style={styles.formInput}
                  value={field.defaultValue || ''}
                  onChange={e => setField({ ...field, defaultValue: e.target.value })}
                  placeholder="请输入默认值"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>占位提示</label>
                <input
                  style={styles.formInput}
                  value={field.placeholder || ''}
                  onChange={e => setField({ ...field, placeholder: e.target.value })}
                  placeholder="请输入占位提示"
                />
              </div>
            </div>
            {(field.type === 'select' || field.type === 'multiselect') && (
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>选项（每行一个）</label>
                <textarea
                  style={styles.formTextarea}
                  value={(field.options || []).join('\n')}
                  onChange={e => setField({ ...field, options: e.target.value.split('\n').filter(o => o.trim()) })}
                  placeholder="选项1&#10;选项2&#10;选项3"
                />
              </div>
            )}
            {(field.type === 'measurement' || field.type === 'number') && (
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>单位</label>
                  <input
                    style={styles.formInput}
                    value={field.unit || ''}
                    onChange={e => setField({ ...field, unit: e.target.value })}
                    placeholder="如: mm, cm/s, %"
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>正常范围</label>
                  <input
                    style={styles.formInput}
                    value={field.normalRange || ''}
                    onChange={e => setField({ ...field, normalRange: e.target.value })}
                    placeholder="如: 8-13mm"
                  />
                </div>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <input
                type="checkbox"
                style={styles.checkbox}
                checked={field.required}
                onChange={e => setField({ ...field, required: e.target.checked })}
              />
              <span style={{ fontSize: 13, color: '#334155' }}>必填字段</span>
            </div>
            {(field.type === 'clinical-finding' || field.type === 'measurement') && (
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>知识库联想关键词</label>
                <input
                  style={styles.formInput}
                  value={(field.knowledgeTerms || []).join(', ')}
                  onChange={e => setField({ ...field, knowledgeTerms: e.target.value.split(',').map(t => t.trim()).filter(t => t) })}
                  placeholder="输入关联的检查项目，如: 肝脏, 门静脉"
                />
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                  设置后将支持知识库联想，如"肝脏"字段可联想门静脉、肝静脉等测量值
                </div>
              </div>
            )}
            {field.type === 'formula' && (
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>计算公式</label>
                <input
                  style={styles.formInput}
                  value={field.formula || ''}
                  onChange={e => setField({ ...field, formula: e.target.value })}
                  placeholder="如: {field1} / {field2} * 100"
                />
              </div>
            )}
          </div>
          <div style={styles.modalFooter}>
            <button style={{ ...styles.actionBtn, ...styles.btnGhost }} onClick={() => setShowFieldModal(false)}>取消</button>
            <button
              style={{ ...styles.actionBtn, ...styles.btnSuccess }}
              onClick={() => {
                if (!field.name.trim()) {
                  alert('请输入字段名称');
                  return;
                }
                saveField(field);
              }}
            >
              <Check size={12} /> 确定
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ========== 预览弹窗 ==========
  const renderPreviewModal = () => {
    if (!previewTemplate) return null;
    return (
      <div style={styles.modal} onClick={() => setShowPreviewModal(false)}>
        <div style={{ ...styles.modalContent, ...styles.modalLarge }} onClick={e => e.stopPropagation()}>
          <div style={styles.modalHeader}>
            <div>
              <div style={styles.modalTitle}>{previewTemplate.name}</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                {renderScopeBadge(previewTemplate.scope)}
                {renderSpecialtyBadge(previewTemplate.specialty)}
                {renderStatusBadge(previewTemplate.status)}
                <span style={styles.versionBadge}>v{previewTemplate.version}</span>
              </div>
            </div>
            <button style={{ ...styles.actionBtn, ...styles.btnGhost }} onClick={() => setShowPreviewModal(false)}>
              <X size={16} />
            </button>
          </div>
          <div style={styles.modalBody}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>模板ID</div>
                <div style={{ fontSize: 14, color: '#334155', fontWeight: 500 }}>{previewTemplate.id}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>创建人</div>
                <div style={{ fontSize: 14, color: '#334155', fontWeight: 500 }}>{previewTemplate.createdBy}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>使用次数</div>
                <div style={{ fontSize: 14, color: '#334155', fontWeight: 500 }}>{previewTemplate.usageCount}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>更新时间</div>
                <div style={{ fontSize: 14, color: '#334155', fontWeight: 500 }}>{previewTemplate.updatedAt}</div>
              </div>
            </div>
            {previewTemplate.tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: 20 }}>
                {previewTemplate.tags.map(tag => (
                  <span key={tag} style={styles.tag}>#{tag}</span>
                ))}
              </div>
            )}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>描述</div>
              <div style={{ fontSize: 14, color: '#334155', marginTop: 4 }}>{previewTemplate.description}</div>
            </div>

            {/* 所见即所得预览 */}
            <div style={styles.previewSection}>
              <div style={styles.previewSectionTitle}>报告预览（所见即所得）</div>
              <div style={styles.previewTpl}>
                <div style={{ borderBottom: '2px solid #1a3a5c', paddingBottom: 12, marginBottom: 16 }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#1a3a5c', textAlign: 'center' }}>
                    {previewTemplate.specialty === 'cardiac' ? '心脏US检查报告' :
                     previewTemplate.specialty === 'abdominal' ? '腹部US检查报告' :
                     previewTemplate.specialty === 'superficial' ? '浅表US检查报告' :
                     previewTemplate.specialty === 'obgyn' ? '妇产科US检查报告' :
                     previewTemplate.specialty === 'vascular' ? '血管US检查报告' :
                     previewTemplate.specialty === 'interventional' ? '介入US报告' : 'US检查报告'}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                  {previewTemplate.fields.filter(f => f.category !== 'signature').map(field => (
                    <div key={field.id} style={field.type === 'clinical-finding' ? styles.previewFieldFull : {}}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>{field.name}</span>
                        {field.required && <span style={styles.fieldRequired}>*</span>}
                        {field.unit && <span style={{ fontSize: 11, color: '#94a3b8' }}>({field.unit})</span>}
                        {field.normalRange && <span style={{ fontSize: 11, color: '#10b981' }}>正常: {field.normalRange}</span>}
                        {renderFieldTypeTag(field.type)}
                      </div>
                      <div style={styles.previewField}>
                        {field.type === 'select' && field.options ? (
                          <select style={{ width: '100%', border: 'none', background: 'none', fontSize: 13, color: '#94a3b8' }}>
                            <option>请选择...</option>
                            {field.options.map(opt => <option key={opt}>{opt}</option>)}
                          </select>
                        ) : field.type === 'multiselect' && field.options ? (
                          <span style={{ fontSize: 12, color: '#94a3b8' }}>（多选）{field.options.slice(0, 3).join('、')}...</span>
                        ) : field.type === 'image' ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#94a3b8' }}><Image size={12} /> 点击上传图片</span>
                        ) : field.type === 'signature' ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#94a3b8' }}><PenTool size={12} /> 点击签名</span>
                        ) : field.type === 'date' ? (
                          <span style={{ color: '#94a3b8' }}>2026-04-29</span>
                        ) : field.type === 'measurement' ? (
                          <span style={{ color: '#94a3b8' }}>0 {field.unit || ''}</span>
                        ) : field.type === 'clinical-finding' ? (
                          <textarea style={{ width: '100%', border: 'none', background: 'none', fontSize: 13, color: '#94a3b8', resize: 'none', minHeight: 60 }} placeholder="请输入描述..." />
                        ) : (
                          <span style={{ color: '#94a3b8' }}>{field.placeholder || '请输入...'}</span>
                        )}
                      </div>
                      {/* 知识库联想提示 */}
                      {field.knowledgeTerms && field.knowledgeTerms.length > 0 && (
                        <div style={{ fontSize: 11, color: '#059669', marginTop: 4 }}>
                          <Lightbulb size={10} /> 知识库: {field.knowledgeTerms.join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>
                    报告医生: _______________ 日期: _______________
                  </div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>
                    审核医生: _______________ 
                  </div>
                </div>
              </div>
            </div>

            {/* 字段统计 */}
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#334155', marginBottom: 12 }}>字段列表（共{previewTemplate.fields.length}个）</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {previewTemplate.fields.map(field => (
                  <div key={field.id} style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: 6, fontSize: 12 }}>
                    <span style={{ fontWeight: 500, color: '#334155' }}>{field.name}</span>
                    <span style={{ marginLeft: 8, color: '#94a3b8' }}>{fieldTypeConfig[field.type].label}</span>
                    {field.required && <span style={{ marginLeft: 4, color: '#dc2626' }}>*</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={styles.modalFooter}>
            <button style={{ ...styles.actionBtn, ...styles.btnGhost }} onClick={() => duplicateTemplate(previewTemplate)}>
              <Copy size={12} /> 复制模板
            </button>
            <button style={{ ...styles.actionBtn, ...styles.btnGhost }} onClick={() => { setShowPreviewModal(false); openVersionHistory(previewTemplate); }}>
              <History size={12} /> 版本历史
            </button>
            <button style={{ ...styles.actionBtn, ...styles.btnPrimary }} onClick={() => { setShowPreviewModal(false); openEdit(previewTemplate); }}>
              <Edit size={12} /> 编辑模板
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ========== 版本历史弹窗 ==========
  const renderVersionModal = () => {
    if (!versionTemplate) return null;
    return (
      <div style={styles.modal} onClick={() => setShowVersionModal(false)}>
        <div style={{ ...styles.modalContent, width: 700 }} onClick={e => e.stopPropagation()}>
          <div style={styles.modalHeader}>
            <div style={styles.modalTitle}>版本历史 - {versionTemplate.name}</div>
            <button style={{ ...styles.actionBtn, ...styles.btnGhost }} onClick={() => setShowVersionModal(false)}>
              <X size={16} />
            </button>
          </div>
          <div style={styles.modalBody}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {versionTemplate.versions.map((v, index) => (
                <div key={v.version} style={{ 
                  padding: 16, 
                  background: index === 0 ? '#eff6ff' : '#f8fafc', 
                  borderRadius: 8, 
                  border: index === 0 ? '2px solid #3b82f6' : '1px solid #e2e8f0'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: '#1a3a5c' }}>v{v.version}</span>
                      {renderStatusBadge(v.status)}
                      {index === 0 && <span style={{ ...styles.badge, background: '#3b82f6', color: '#fff' }}>当前版本</span>}
                    </div>
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>{v.createdAt}</span>
                  </div>
                  <div style={{ fontSize: 13, color: '#475569', marginBottom: 4 }}>更新人: {v.createdBy}</div>
                  <div style={{ fontSize: 13, color: '#64748b' }}>变更说明: {v.changes}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={styles.modalFooter}>
            <button style={{ ...styles.actionBtn, ...styles.btnGhost }} onClick={() => setShowVersionModal(false)}>关闭</button>
          </div>
        </div>
      </div>
    );
  };

  // ========== 编辑弹窗 ==========
  const renderEditModal = () => {
    if (!editingTemplate) return null;
    return (
      <div style={styles.modal} onClick={() => setShowEditModal(false)}>
        <div style={{ ...styles.modalContent, ...styles.modalLarge }} onClick={e => e.stopPropagation()}>
          <div style={styles.modalHeader}>
            <div style={styles.modalTitle}>
              {editingTemplate.versions.length > 0 ? `编辑模板 (v${editingTemplate.version})` : '新建模板'}
            </div>
            <button style={{ ...styles.actionBtn, ...styles.btnGhost }} onClick={() => setShowEditModal(false)}>
              <X size={16} />
            </button>
          </div>
          <div style={styles.modalBody}>
            {/* 模板基本信息 */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Settings size={16} /> 基本信息
              </div>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>模板名称 *</label>
                  <input
                    style={styles.formInput}
                    value={editingTemplate.name}
                    onChange={e => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                    placeholder="请输入模板名称"
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>模板ID</label>
                  <input style={styles.formInput} value={editingTemplate.id} disabled />
                </div>
              </div>

              {/* 三级管理范围 */}
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>模板范围 *</label>
                <div style={styles.scopeSelector}>
                  {(['personal', 'department', 'hospital'] as ScopeLevel[]).map(scope => (
                    <button
                      key={scope}
                      style={{
                        ...styles.scopeBtn,
                        ...(editingTemplate.scope === scope ? styles.scopeBtnActive : {}),
                      }}
                      onClick={() => setEditingTemplate({ ...editingTemplate, scope })}
                    >
                      {scopeConfig[scope].icon}
                      <span>{scopeConfig[scope].label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 专科分类 */}
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>专科分类 *</label>
                <div style={styles.specialtyGrid}>
                  {(Object.keys(specialtyConfig) as SpecialtyCategory[]).map(specialty => (
                    <button
                      key={specialty}
                      style={{
                        ...styles.specialtyBtn,
                        ...(editingTemplate.specialty === specialty ? styles.specialtyBtnActive : {}),
                      }}
                      onClick={() => setEditingTemplate({ ...editingTemplate, specialty })}
                    >
                      <div style={{ color: specialtyConfig[specialty].color }}>
                        {specialtyConfig[specialty].icon}
                      </div>
                      <div style={styles.specialtyLabel}>{specialtyConfig[specialty].label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>标签（用逗号分隔）</label>
                  <input
                    style={styles.formInput}
                    value={editingTemplate.tags.join(', ')}
                    onChange={e => setEditingTemplate({ ...editingTemplate, tags: e.target.value.split(',').map(t => t.trim()).filter(t => t) })}
                    placeholder="如: 心脏, 标准, 常规"
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>版本号</label>
                  <input
                    style={styles.formInput}
                    value={editingTemplate.version}
                    onChange={e => setEditingTemplate({ ...editingTemplate, version: e.target.value })}
                  />
                </div>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>描述</label>
                <textarea
                  style={styles.formTextarea}
                  value={editingTemplate.description}
                  onChange={e => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
                  placeholder="请输入模板描述"
                />
              </div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="checkbox"
                    style={styles.checkbox}
                    checked={editingTemplate.isProfessional}
                    onChange={e => setEditingTemplate({ ...editingTemplate, isProfessional: e.target.checked })}
                  />
                  <span style={{ fontSize: 13, color: '#334155' }}>专业模板</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="checkbox"
                    style={styles.checkbox}
                    checked={editingTemplate.isFavorite}
                    onChange={e => setEditingTemplate({ ...editingTemplate, isFavorite: e.target.checked })}
                  />
                  <span style={{ fontSize: 13, color: '#334155' }}>收藏</span>
                </div>
              </div>
            </div>

            {/* 知识库联想面板 */}
            <div style={{ marginBottom: 20 }}>
              <div 
                style={{ 
                  fontSize: 14, 
                  fontWeight: 600, 
                  color: '#1a3a5c', 
                  marginBottom: 12, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 6,
                  cursor: 'pointer'
                }}
                onClick={() => setShowKnowledgePanel(!showKnowledgePanel)}
              >
                <BrainCircuit size={16} /> 知识库联想
                <ChevronRight size={14} style={{ transform: showKnowledgePanel ? 'rotate(90deg)' : 'none', transition: '0.2s' }} />
              </div>
              {showKnowledgePanel && (
                <div style={styles.knowledgePanel}>
                  <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                    <input
                      style={{ ...styles.formInput, flex: 1 }}
                      placeholder="输入检查项目搜索知识库（如：肝脏、心脏、肾脏）..."
                      value={knowledgeSearch}
                      onChange={e => {
                        setKnowledgeSearch(e.target.value);
                        setActiveKnowledgeTerm(null);
                      }}
                    />
                  </div>
                  {knowledgeSearch && knowledgeSuggestions.length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 11, color: '#854d0e', marginBottom: 6 }}>推荐检查项目:</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {knowledgeSuggestions.map(term => (
                          <button
                            key={term}
                            style={{
                              padding: '4px 10px',
                              borderRadius: 4,
                              border: '1px solid #fde047',
                              background: activeKnowledgeTerm === term ? '#fef9c3' : '#fff',
                              cursor: 'pointer',
                              fontSize: 12,
                              color: '#854d0e'
                            }}
                            onClick={() => {
                              setActiveKnowledgeTerm(term);
                              setKnowledgeSearch(term);
                            }}
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {activeKnowledge && (
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#854d0e', marginBottom: 8 }}>
                        {activeKnowledge.keyword} - 知识库内容
                      </div>
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: '#a16207', marginBottom: 4 }}>测量值:</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {activeKnowledge.measurements.map(m => (
                            <button
                              key={m.name}
                              style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #d9f99d', background: '#f7fee7', cursor: 'pointer', fontSize: 11 }}
                              onClick={() => insertKnowledgeTerm(activeKnowledge.keyword + '描述', `${m.name}: ${m.normalRange}`)}
                            >
                              {m.name} ({m.unit}) - {m.normalRange}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: '#a16207', marginBottom: 4 }}>描述词:</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {activeKnowledge.descriptions.map(d => (
                            <button
                              key={d}
                              style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #d9f99d', background: '#f7fee7', cursor: 'pointer', fontSize: 11 }}
                              onClick={() => insertKnowledgeTerm(activeKnowledge.keyword + '描述', d)}
                            >
                              {d}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div style={{ marginTop: 8 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: '#a16207', marginBottom: 4 }}>相关术语:</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {activeKnowledge.relatedTerms.map(term => (
                            <button
                              key={term}
                              style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', fontSize: 11, color: '#64748b' }}
                              onClick={() => setKnowledgeSearch(term)}
                            >
                              {term}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  {!activeKnowledge && !knowledgeSuggestions.length && knowledgeSearch.length >= 2 && (
                    <div style={{ color: '#854d0e', fontSize: 12 }}>未找到相关知识库条目</div>
                  )}
                </div>
              )}
            </div>

            {/* 字段管理 */}
            <div style={styles.fieldList}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1a3a5c' }}>
                  字段配置（共{editingTemplate.fields.length}个）
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{ fontSize: 11, color: '#94a3b8', alignSelf: 'center' }}>
                    支持字段类型: text, number, select, multiselect, date, image, signature, clinical-finding, measurement, formula
                  </span>
                </div>
              </div>
              {editingTemplate.fields.map((field, index) => (
                <div key={field.id} style={styles.fieldItem}>
                  <div style={styles.fieldDragHandle}>
                    <Move size={14} />
                  </div>
                  <div style={{ ...styles.fieldIcon, background: `${fieldTypeConfig[field.type].color}15` }}>
                    {fieldTypeConfig[field.type].icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={styles.fieldName}>{field.name}</div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 2, flexWrap: 'wrap' }}>
                      <span style={{ ...styles.fieldType, color: fieldTypeConfig[field.type].color }}>{fieldTypeConfig[field.type].label}</span>
                      {field.required && <span style={styles.fieldRequired}>必填</span>}
                      {field.unit && <span style={{ fontSize: 10, color: '#94a3b8' }}>单位: {field.unit}</span>}
                      {field.normalRange && <span style={{ fontSize: 10, color: '#10b981' }}>正常: {field.normalRange}</span>}
                      {field.knowledgeTerms && field.knowledgeTerms.length > 0 && (
                        <span style={{ fontSize: 10, color: '#059669' }}>
                          <Lightbulb size={10} /> {field.knowledgeTerms.join(', ')}
                        </span>
                      )}
                      {field.options && <span style={{ fontSize: 10, color: '#94a3b8' }}>选项: {field.options.length}个</span>}
                    </div>
                  </div>
                  <div style={styles.fieldActions}>
                    <button style={{ ...styles.actionBtn, ...styles.btnGhost }} onClick={() => moveField(index, 'up')} disabled={index === 0}>
                      <ArrowUp size={12} />
                    </button>
                    <button style={{ ...styles.actionBtn, ...styles.btnGhost }} onClick={() => moveField(index, 'down')} disabled={index === editingTemplate.fields.length - 1}>
                      <ArrowDown size={12} />
                    </button>
                    <button style={{ ...styles.actionBtn, ...styles.btnGhost }} onClick={() => editField(field)}>
                      <Edit size={12} />
                    </button>
                    <button style={{ ...styles.actionBtn, ...styles.btnGhost }} onClick={() => deleteField(field.id)}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
              <button style={styles.addFieldBtn} onClick={addField}>
                <Plus size={14} /> 添加字段
              </button>
            </div>
          </div>
          <div style={styles.modalFooter}>
            {editingTemplate.status === 'draft' && (
              <button
                style={{ ...styles.actionBtn, ...styles.btnWarning, marginRight: 'auto' }}
                onClick={() => {
                  setEditingTemplate({ ...editingTemplate, status: 'pending_review' });
                  saveTemplate();
                }}
              >
                <Send size={12} /> 提交审核
              </button>
            )}
            {editingTemplate.status === 'pending_review' && (
              <button
                style={{ ...styles.actionBtn, ...styles.btnSuccess, marginRight: 'auto' }}
                onClick={() => {
                  setEditingTemplate({ ...editingTemplate, status: 'published', approvedBy: '当前审核人' });
                  saveTemplate();
                }}
              >
                <CheckCircle size={12} /> 审核通过
              </button>
            )}
            <button style={{ ...styles.actionBtn, ...styles.btnGhost }} onClick={() => setShowEditModal(false)}>取消</button>
            <button style={{ ...styles.actionBtn, ...styles.btnPrimary }} onClick={saveTemplate}>
              <Save size={12} /> 保存模板
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.root}>
      {/* 标题 */}
      <div style={styles.header}>
        <div style={styles.title}>
          <Layout size={22} color="#60a5fa" />
          结构化报告模板引擎
        </div>
        <button style={{ ...styles.actionBtn, ...styles.btnPrimary, display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => openEdit()}>
          <Plus size={14} /> 新建模板
        </button>
      </div>

      {/* 标签页 */}
      <div style={styles.tabBar}>
        <button style={{ ...styles.tab, ...(activeTab === 'list' ? styles.tabActive : {}) }} onClick={() => setActiveTab('list')}>模板列表</button>
        <button style={{ ...styles.tab, ...(activeTab === 'stats' ? styles.tabActive : {}) }} onClick={() => setActiveTab('stats')}>使用统计</button>
        <button style={{ ...styles.tab, ...(activeTab === 'audit' ? styles.tabActive : {}) }} onClick={() => setActiveTab('audit')}>
          审核管理
          {pendingReviewCount > 0 && (
            <span style={{ 
              marginLeft: 6, 
              padding: '2px 6px', 
              borderRadius: 10, 
              background: '#dc2626', 
              color: '#fff', 
              fontSize: 10,
              fontWeight: 700 
            }}>
              {pendingReviewCount}
            </span>
          )}
        </button>
      </div>

      {/* ========== 模板列表 ========== */}
      {activeTab === 'list' && (
        <>
          {/* 统计卡片 */}
          <div style={styles.statRow}>
            {renderStatCard('模板总数', templates.length, '个', '#1a3a5c', <FileText size={16} />)}
            {renderStatCard('总使用次数', totalUsage, `平均 ${avgUsage} 次/模板`, '#3b82f6', <TrendingUp size={16} />)}
            {renderStatCard('专业模板', professionalCount, '高级专业', '#dc2626', <Sparkles size={16} />)}
            {renderStatCard('待审核', pendingReviewCount, '需要审核', '#d97706', <Clock size={16} />)}
            {renderStatCard('最近使用', recentUsed, '3天内活跃', '#10b981', <Activity size={16} />)}
          </div>

          {/* 搜索筛选 */}
          <div style={styles.filterPanel}>
            <div style={styles.filterRow}>
              <div style={styles.searchBox}>
                <Search size={16} color="#94a3b8" />
                <input
                  style={styles.searchInput}
                  placeholder="搜索模板名称/描述/标签..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <select
                style={{ ...styles.formSelect, width: 140 }}
                value={filterScope}
                onChange={e => setFilterScope(e.target.value as ScopeLevel | 'all')}
              >
                <option value="all">全部范围</option>
                <option value="personal">个人模板</option>
                <option value="department">科室模板</option>
                <option value="hospital">全院模板</option>
              </select>
              <select
                style={{ ...styles.formSelect, width: 140 }}
                value={filterSpecialty}
                onChange={e => setFilterSpecialty(e.target.value as SpecialtyCategory | 'all')}
              >
                <option value="all">全部分类</option>
                {(Object.keys(specialtyConfig) as SpecialtyCategory[]).map(s => (
                  <option key={s} value={s}>{specialtyConfig[s].label}</option>
                ))}
              </select>
              <select
                style={{ ...styles.formSelect, width: 120 }}
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value as TemplateStatus | 'all')}
              >
                <option value="all">全部状态</option>
                <option value="draft">草稿</option>
                <option value="pending_review">待审核</option>
                <option value="published">已发布</option>
                <option value="archived">已归档</option>
              </select>
              <div style={{ marginLeft: 'auto', fontSize: 12, color: '#94a3b8', alignSelf: 'center' }}>
                共 {filteredTemplates.length} 个模板
              </div>
            </div>
          </div>

          {/* 模板卡片列表 */}
          <div style={styles.cardGrid}>
            {filteredTemplates.length === 0 ? (
              <div style={{ ...styles.emptyState, gridColumn: '1 / -1' }}>
                <FileText size={48} style={{ marginBottom: 12, opacity: 0.5 }} />
                <div>暂无模板</div>
                <div style={{ fontSize: 12, marginTop: 8 }}>尝试调整筛选条件或创建新模板</div>
              </div>
            ) : filteredTemplates.map(template => renderTemplateCard(template))}
          </div>
        </>
      )}

      {/* ========== 使用统计 ========== */}
      {activeTab === 'stats' && (
        <>
          <div style={styles.statRow}>
            {renderStatCard('总使用次数', totalUsage, undefined, '#3b82f6')}
            {renderStatCard('平均使用', avgUsage, '次/模板', '#8b5cf6')}
            {renderStatCard('专业模板', professionalCount, `占比 ${Math.round((professionalCount / templates.length) * 100)}%`, '#dc2626')}
            {renderStatCard('最高使用', Math.max(...templates.map(t => t.usageCount), 0), '次', '#10b981')}
            {renderStatCard('模板总数', templates.length, '个', '#1a3a5c')}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {/* 范围使用统计 */}
            <div style={styles.chartCard}>
              <div style={styles.chartTitle}>模板范围分布</div>
              {(Object.entries(scopeStats) as [ScopeLevel, number][]).map(([scope, count]) => (
                <div key={scope} style={styles.barRow}>
                  <div style={{ ...styles.barLabel, width: 60, display: 'flex', alignItems: 'center', gap: 4 }}>
                    {scopeConfig[scope].icon} {scopeConfig[scope].label}
                  </div>
                  <div style={styles.barBg}>
                    <div style={{ ...styles.barFill, width: `${totalUsage > 0 ? (count / totalUsage) * 100 : 0}%`, background: scopeConfig[scope].color }} />
                  </div>
                  <div style={{ fontSize: 12, color: '#475569', width: 60, textAlign: 'right' }}>{count}次</div>
                </div>
              ))}
            </div>

            {/* 专科分类统计 */}
            <div style={styles.chartCard}>
              <div style={styles.chartTitle}>专科分类使用分布</div>
              {(Object.entries(specialtyStats) as [SpecialtyCategory, number][]).map(([specialty, count]) => (
                <div key={specialty} style={styles.barRow}>
                  <div style={{ ...styles.barLabel, width: 70, display: 'flex', alignItems: 'center', gap: 4 }}>
                    {specialtyConfig[specialty].icon} {specialtyConfig[specialty].label}
                  </div>
                  <div style={styles.barBg}>
                    <div style={{ ...styles.barFill, width: `${totalUsage > 0 ? (count / totalUsage) * 100 : 0}%`, background: specialtyConfig[specialty].color }} />
                  </div>
                  <div style={{ fontSize: 12, color: '#475569', width: 50, textAlign: 'right' }}>{count}次</div>
                </div>
              ))}
            </div>

            {/* 字段类型分布 */}
            <div style={styles.chartCard}>
              <div style={styles.chartTitle}>字段类型使用统计</div>
              {Object.entries(
                templates.flatMap(t => t.fields).reduce((acc, f) => {
                  acc[f.type] = (acc[f.type] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              ).map(([type, count]) => (
                <div key={type} style={styles.barRow}>
                  <div style={{ ...styles.barLabel, width: 100, display: 'flex', alignItems: 'center', gap: 4 }}>
                    {fieldTypeConfig[type as FieldType]?.icon}
                    {fieldTypeConfig[type as FieldType]?.label || type}
                  </div>
                  <div style={styles.barBg}>
                    <div style={{ ...styles.barFill, width: `${(count / templates.flatMap(t => t.fields).length) * 100}%`, background: fieldTypeConfig[type as FieldType]?.color || '#94a3b8' }} />
                  </div>
                  <div style={{ fontSize: 12, color: '#475569', width: 40, textAlign: 'right' }}>{count}</div>
                </div>
              ))}
            </div>

            {/* 使用排行 */}
            <div style={styles.chartCard}>
              <div style={styles.chartTitle}>模板使用排行 TOP 5</div>
              {[...templates].sort((a, b) => b.usageCount - a.usageCount).slice(0, 5).map((t, i) => (
                <div key={t.id} style={{ ...styles.barRow, marginBottom: 12 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: i === 0 ? '#fbbf24' : i === 1 ? '#94a3b8' : i === 2 ? '#cd7c4b' : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: i < 3 ? '#fff' : '#64748b' }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1, marginLeft: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: '#334155' }}>{t.name}</div>
                    <div style={{ fontSize: 10, color: '#94a3b8' }}>{t.usageCount}次 · {scopeConfig[t.scope].label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ========== 审核管理 ========== */}
      {activeTab === 'audit' && (
        <>
          <div style={styles.statRow}>
            {renderStatCard('待审核', templates.filter(t => t.status === 'pending_review').length, '需要处理', '#d97706')}
            {renderStatCard('已通过', templates.filter(t => t.status === 'published').length, '已发布', '#059669')}
            {renderStatCard('草稿', templates.filter(t => t.status === 'draft').length, '进行中', '#64748b')}
            {renderStatCard('已归档', templates.filter(t => t.status === 'archived').length, '历史版本', '#475569')}
          </div>

          <div style={styles.cardGrid}>
            {templates.filter(t => t.status === 'pending_review').length === 0 ? (
              <div style={{ ...styles.emptyState, gridColumn: '1 / -1' }}>
                <CheckCircle size={48} style={{ marginBottom: 12, opacity: 0.5, color: '#059669' }} />
                <div>暂无待审核模板</div>
                <div style={{ fontSize: 12, marginTop: 8 }}>所有模板都已审核完成</div>
              </div>
            ) : templates.filter(t => t.status === 'pending_review').map(template => (
              <div key={template.id} style={{ ...styles.card, borderLeft: '4px solid #d97706' }}>
                <div style={styles.cardHeader}>
                  <div>
                    <div style={styles.cardTitle}>{template.name}</div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                      {renderScopeBadge(template.scope)}
                      {renderSpecialtyBadge(template.specialty)}
                      {renderStatusBadge(template.status)}
                    </div>
                  </div>
                </div>
                <div style={styles.cardDesc}>{template.description}</div>
                <div style={styles.cardMeta}>
                  <span>创建人: {template.createdBy}</span>
                  <span>创建时间: {template.createdAt}</span>
                </div>
                <div style={{ marginBottom: 12, padding: 12, background: '#fef3c7', borderRadius: 6 }}>
                  <div style={{ fontSize: 12, color: '#92400e' }}>
                    <AlertTriangle size={12} style={{ display: 'inline', marginRight: 4 }} />
                    该模板等待审核，审核通过后将正式发布
                  </div>
                </div>
                <div style={styles.cardFooter}>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>v{template.version}</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button style={{ ...styles.actionBtn, ...styles.btnGhost }} onClick={() => openPreview(template)}>
                      <Eye size={12} /> 预览
                    </button>
                    <button style={{ ...styles.actionBtn, ...styles.btnSuccess }} onClick={() => approveTemplate(template)}>
                      <CheckCircle size={12} /> 通过
                    </button>
                    <button style={{ ...styles.actionBtn, ...styles.btnDanger }} onClick={() => deleteTemplate(template.id)}>
                      <XCircle size={12} /> 拒绝
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 审核历史 */}
          {templates.filter(t => t.status === 'published' && t.approvedBy).length > 0 && (
            <div style={{ marginTop: 24 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 12 }}>最近审核通过</div>
              <div style={{ background: '#fff', borderRadius: 10, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                {templates.filter(t => t.status === 'published' && t.approvedBy).slice(0, 5).map(t => (
                  <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#334155' }}>{t.name}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                        审核人: {t.approvedBy} · 审核时间: {t.updatedAt}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {renderScopeBadge(t.scope)}
                      {renderSpecialtyBadge(t.specialty)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* 预览弹窗 */}
      {showPreviewModal && renderPreviewModal()}

      {/* 编辑弹窗 */}
      {showEditModal && renderEditModal()}

      {/* 版本历史弹窗 */}
      {showVersionModal && renderVersionModal()}

      {/* 字段编辑弹窗 */}
      {renderFieldModal()}
    </div>
  );
}
