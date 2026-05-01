// @ts-nocheck
import { useState } from 'react';
import {
  FileText, Search, Plus, Edit, Eye, Trash2, Copy, BarChart3,
  X, ChevronDown, Filter, Layout, Image, ListChecks, Calendar,
  Hash, Type, Globe, CheckSquare, PenTool, Download, Upload,
  Stethoscope, AlertCircle, TrendingUp, Clock, Users
} from 'lucide-react';

// ========== 模板类型定义 ==========
type FieldType = 'text' | 'number' | 'select' | 'date' | 'multiselect' | 'image' | 'signature';

interface TemplateField {
  id: string;
  name: string;
  type: FieldType;
  required: boolean;
  options?: string[]; // for select/multiselect
  placeholder?: string;
  defaultValue?: string;
}

interface Template {
  id: string;
  name: string;
  category: '腹部超声' | '肠镜' | '超声超声探头' | 'ERCP' | '早癌筛查' | '其他';
  description: string;
  fields: TemplateField[];
  usageCount: number;
  lastUsed: string;
  createdBy: string;
  createdAt: string;
  isProfessional: boolean; // 早癌筛查等专业模板
}

// ========== 模板数据（5-8个真实模板） ==========
const templates: Template[] = [
  {
    id: 'T001',
    name: '腹部超声检查模板',
    category: '腹部超声',
    description: '常规腹部超声检查报告模板，适用于门诊和住院腹部超声检查',
    usageCount: 1256,
    lastUsed: '2026-04-28',
    createdBy: '张建国',
    createdAt: '2025-01-15',
    isProfessional: false,
    fields: [
      { id: 'f1', name: '患者姓名', type: 'text', required: true },
      { id: 'f2', name: '性别', type: 'select', required: true, options: ['男', '女'] },
      { id: 'f3', name: '年龄', type: 'number', required: true },
      { id: 'f4', name: '检查日期', type: 'date', required: true },
      { id: 'f5', name: '腹部超声编号', type: 'text', required: true },
      { id: 'f6', name: '术前诊断', type: 'text', required: true },
      { id: 'f7', name: '术中诊断', type: 'text', required: true },
      { id: 'f8', name: '镜下表现', type: 'multiselect', required: false, options: ['慢性胃炎', '糜烂', '溃疡', '息肉', '肿瘤', '反流性食管炎'] },
      { id: 'f9', name: '活检数目', type: 'number', required: false },
      { id: 'f10', name: '检查图片', type: 'image', required: false },
      { id: 'f11', name: '检查医生签名', type: 'signature', required: true },
      { id: 'f12', name: '报告日期', type: 'date', required: true },
    ],
  },
  {
    id: 'T002',
    name: '肠镜检查模板',
    category: '肠镜',
    description: '浅表超声检查报告模板，适用于全结肠检查和直肠检查',
    usageCount: 892,
    lastUsed: '2026-04-27',
    createdBy: '李明华',
    createdAt: '2025-02-20',
    isProfessional: false,
    fields: [
      { id: 'f1', name: '患者姓名', type: 'text', required: true },
      { id: 'f2', name: '性别', type: 'select', required: true, options: ['男', '女'] },
      { id: 'f3', name: '年龄', type: 'number', required: true },
      { id: 'f4', name: '检查日期', type: 'date', required: true },
      { id: 'f5', name: '肠镜编号', type: 'text', required: true },
      { id: 'f6', name: '肠道准备', type: 'select', required: true, options: ['良好', '一般', '差'] },
      { id: 'f7', name: '插管深度', type: 'text', required: true },
      { id: 'f8', name: '盲肠到达率', type: 'select', required: true, options: ['是', '否'] },
      { id: 'f9', name: '息肉位置', type: 'multiselect', required: false, options: ['升结肠', '横结肠', '降结肠', '乙状结肠', '直肠'] },
      { id: 'f10', name: '息肉大小(mm)', type: 'number', required: false },
      { id: 'f11', name: '息肉数目', type: 'number', required: false },
      { id: 'f12', name: '病理结果', type: 'select', required: false, options: ['腺瘤', '增生性息肉', '炎性息肉', '恶性', '未送检'] },
      { id: 'f13', name: '检查图片', type: 'image', required: false },
      { id: 'f14', name: '检查医生签名', type: 'signature', required: true },
    ],
  },
  {
    id: 'T003',
    name: '超声超声检查模板',
    category: '超声超声探头',
    description: '超声超声探头（EUS）检查报告模板，适用于消化道及周围器官检查',
    usageCount: 456,
    lastUsed: '2026-04-25',
    createdBy: '王芳',
    createdAt: '2025-03-10',
    isProfessional: false,
    fields: [
      { id: 'f1', name: '患者姓名', type: 'text', required: true },
      { id: 'f2', name: '性别', type: 'select', required: true, options: ['男', '女'] },
      { id: 'f3', name: '年龄', type: 'number', required: true },
      { id: 'f4', name: '检查日期', type: 'date', required: true },
      { id: 'f5', name: 'EUS编号', type: 'text', required: true },
      { id: 'f6', name: '检查部位', type: 'select', required: true, options: ['食管', '胃', '十二指肠', '直肠', '胰腺', '纵隔'] },
      { id: 'f7', name: '超声频率(MHz)', type: 'number', required: true },
      { id: 'f8', name: '病灶大小(mm)', type: 'number', required: false },
      { id: 'f9', name: '病灶位置', type: 'text', required: false },
      { id: 'f10', name: '回声特征', type: 'multiselect', required: false, options: ['低回声', '高回声', '等回声', '无回声', '混合回声'] },
      { id: 'f11', name: '边界', type: 'select', required: false, options: ['清晰', '不清晰'] },
      { id: 'f12', name: '侵袭深度', type: 'select', required: false, options: ['黏膜层', '黏膜下层', '肌层', '浆膜层', '周围组织'] },
      { id: 'f13', name: 'EUS诊断', type: 'text', required: true },
      { id: 'f14', name: 'FNA/FNB', type: 'select', required: false, options: ['是', '否'] },
      { id: 'f15', name: '穿刺标本', type: 'image', required: false },
      { id: 'f16', name: '检查医生签名', type: 'signature', required: true },
    ],
  },
  {
    id: 'T004',
    name: 'ERCP检查模板',
    category: 'ERCP',
    description: '逆行胰胆管造影（ERCP）检查报告模板',
    usageCount: 328,
    lastUsed: '2026-04-26',
    createdBy: '赵强',
    createdAt: '2025-04-05',
    isProfessional: false,
    fields: [
      { id: 'f1', name: '患者姓名', type: 'text', required: true },
      { id: 'f2', name: '性别', type: 'select', required: true, options: ['男', '女'] },
      { id: 'f3', name: '年龄', type: 'number', required: true },
      { id: 'f4', name: '检查日期', type: 'date', required: true },
      { id: 'f5', name: 'ERCP编号', type: 'text', required: true },
      { id: 'f6', name: '术前诊断', type: 'text', required: true },
      { id: 'f7', name: '适应症', type: 'multiselect', required: true, options: ['胆总管结石', '胆管狭窄', '胰管狭窄', '梗阻性黄疸', '胆漏'] },
      { id: 'f8', name: '手术方式', type: 'multiselect', required: true, options: ['EST', '球囊扩张', '支架置入', '取石', '鼻胆管引流'] },
      { id: 'f9', name: '乳头切开大小(mm)', type: 'number', required: false },
      { id: 'f10', name: '支架类型', type: 'select', required: false, options: ['塑料支架', '金属覆膜支架', '金属裸支架'] },
      { id: 'f11', name: '支架数量', type: 'number', required: false },
      { id: 'f12', name: '取石数量', type: 'number', required: false },
      { id: 'f13', name: '并发症', type: 'select', required: false, options: ['无', '轻度胰腺炎', '中度胰腺炎', '出血', '穿孔'] },
      { id: 'f14', name: '手术图片', type: 'image', required: false },
      { id: 'f15', name: '操作医生签名', type: 'signature', required: true },
      { id: 'f16', name: '手术时间(分钟)', type: 'number', required: false },
    ],
  },
  {
    id: 'T005',
    name: '消化道早癌筛查模板',
    category: '早癌筛查',
    description: '消化道早癌筛查专业模板，包含NBI放大超声探头评估、染色超声探头等早癌诊断标准字段',
    usageCount: 678,
    lastUsed: '2026-04-29',
    createdBy: '刘伟',
    createdAt: '2025-01-20',
    isProfessional: true,
    fields: [
      { id: 'f1', name: '患者姓名', type: 'text', required: true },
      { id: 'f2', name: '性别', type: 'select', required: true, options: ['男', '女'] },
      { id: 'f3', name: '年龄', type: 'number', required: true },
      { id: 'f4', name: '检查日期', type: 'date', required: true },
      { id: 'f5', name: '筛查编号', type: 'text', required: true },
      { id: 'f6', name: '筛查类型', type: 'select', required: true, options: ['胃早癌筛查', '结直肠早癌筛查', '食管早癌筛查'] },
      { id: 'f7', name: '风险等级', type: 'select', required: true, options: ['高危', '中危', '低危'] },
      { id: 'f8', name: '既往肿瘤史', type: 'select', required: false, options: ['有', '无'] },
      { id: 'f9', name: '肿瘤家族史', type: 'select', required: false, options: ['有', '无'] },
      { id: 'f10', name: 'NBI放大超声探头', type: 'select', required: false, options: ['是', '否'] },
      { id: 'f11', name: 'NBI分型', type: 'multiselect', required: false, options: ['Type A', 'Type B1', 'Type B2', 'Type B3', 'Type C1', 'Type C2', 'Type C3'] },
      { id: 'f12', name: '染色超声探头', type: 'select', required: false, options: ['是', '否'] },
      { id: 'f13', name: '染色剂类型', type: 'select', required: false, options: ['卢戈液', '靛胭脂', '亚甲蓝', '醋酸'] },
      { id: 'f14', name: 'IPCL分型(食管)', type: 'select', required: false, options: ['Type A', 'Type B1', 'Type B2', 'Type B3', 'Type V'] },
      { id: 'f15', name: '表面型分类', type: 'select', required: false, options: ['0-I', '0-IIa', '0-IIb', '0-IIc', '0-III'] },
      { id: 'f16', name: '病变大小(mm)', type: 'number', required: false },
      { id: 'f17', name: '病变位置', type: 'text', required: false },
      { id: 'f18', name: '浸润深度预估', type: 'select', required: false, options: ['M', 'SM1', 'SM2', 'MP', 'SS'] },
      { id: 'f19', name: '早癌诊断', type: 'select', required: false, options: ['阴性', '疑似早癌', '早癌', '进展期癌'] },
      { id: 'f20', name: '组织病理学', type: 'select', required: false, options: ['炎症', '低级别上皮内瘤变', '高级别上皮内瘤变', '腺癌', '鳞癌'] },
      { id: 'f21', name: '超声探头下治疗建议', type: 'multiselect', required: false, options: ['ESD', 'EMR', '外科手术', '密切随访', '扩大适应症ESD'] },
      { id: 'f22', name: '筛查图片', type: 'image', required: false },
      { id: 'f23', name: '筛查医生签名', type: 'signature', required: true },
    ],
  },
  {
    id: 'T006',
    name: '胃早癌ESD术模板',
    category: '腹部超声',
    description: '胃早癌超声黏膜下剥离术（ESD）专业模板',
    usageCount: 234,
    lastUsed: '2026-04-24',
    createdBy: '张建国',
    createdAt: '2025-05-12',
    isProfessional: true,
    fields: [
      { id: 'f1', name: '患者姓名', type: 'text', required: true },
      { id: 'f2', name: '性别', type: 'select', required: true, options: ['男', '女'] },
      { id: 'f3', name: '年龄', type: 'number', required: true },
      { id: 'f4', name: '手术日期', type: 'date', required: true },
      { id: 'f5', name: 'ESD编号', type: 'text', required: true },
      { id: 'f6', name: '病变位置', type: 'select', required: true, options: ['胃窦', '胃角', '胃体', '胃底', '贲门', '幽门'] },
      { id: 'f7', name: '病变部位(具体)', type: 'text', required: true },
      { id: 'f8', name: '病变大小(mm)', type: 'number', required: true },
      { id: 'f9', name: '术前病理', type: 'select', required: true, options: ['低级别上皮内瘤变', '高级别上皮内瘤变', '早癌'] },
      { id: 'f10', name: '术前分期', type: 'select', required: false, options: ['cT1aM', 'cT1bSM1', 'cT1bSM2'] },
      { id: 'f11', name: '手术时间(分钟)', type: 'number', required: true },
      { id: 'f12', name: '切除方式', type: 'select', required: true, options: ['整块切除', '分块切除'] },
      { id: 'f13', name: '整块切除边缘', type: 'select', required: false, options: ['R0切除', 'R1切除', 'Rx切除'] },
      { id: 'f14', name: '术中并发症', type: 'multiselect', required: false, options: ['出血', '穿孔', '无'] },
      { id: 'f15', name: '术后病理分期', type: 'select', required: false, options: ['pT1a', 'pT1bSM1', 'pT1bSM2', '更深浸润'] },
      { id: 'f16', name: '脉管侵犯', type: 'select', required: false, options: ['无', '有'] },
      { id: 'f17', name: '水平切缘', type: 'select', required: false, options: ['阴性', '阳性', '未评估'] },
      { id: 'f18', name: '垂直切缘', type: 'select', required: false, options: ['阴性', '阳性', '未评估'] },
      { id: 'f19', name: '组织类型', type: 'select', required: false, options: ['管状腺癌', '低分化腺癌', '印戒细胞癌', '其他'] },
      { id: 'f20', name: '分化程度', type: 'select', required: false, options: ['高分化', '中分化', '低分化'] },
      { id: 'f21', name: '治愈性评估', type: 'select', required: false, options: ['eCura A', 'eCura B', 'eCura C'] },
      { id: 'f22', name: '手术图片', type: 'image', required: false },
      { id: 'f23', name: '操作医生签名', type: 'signature', required: true },
    ],
  },
  {
    id: 'T007',
    name: '结肠息肉切除模板',
    category: '肠镜',
    description: '结肠息肉超声探头下切除术（EMR/APC）报告模板',
    usageCount: 567,
    lastUsed: '2026-04-29',
    createdBy: '李明华',
    createdAt: '2025-03-25',
    isProfessional: false,
    fields: [
      { id: 'f1', name: '患者姓名', type: 'text', required: true },
      { id: 'f2', name: '性别', type: 'select', required: true, options: ['男', '女'] },
      { id: 'f3', name: '年龄', type: 'number', required: true },
      { id: 'f4', name: '手术日期', type: 'date', required: true },
      { id: 'f5', name: '息肉编号', type: 'text', required: true },
      { id: 'f6', name: '息肉位置', type: 'select', required: true, options: ['盲肠', '升结肠', '肝曲', '横结肠', '脾曲', '降结肠', '乙状结肠', '直肠'] },
      { id: 'f7', name: '息肉大小(mm)', type: 'number', required: true },
      { id: 'f8', name: '息肉形态', type: 'select', required: true, options: ['Ip', 'Isp', 'Is', 'IIa', 'IIb', 'IIc', 'LST'] },
      { id: 'f9', name: '息肉类型', type: 'select', required: true, options: ['腺瘤', '增生性息肉', '炎性息肉', '幼年性息肉', 'P-J息肉'] },
      { id: 'f10', name: '切除方式', type: 'select', required: true, options: ['冷切除', '热切除', 'EMR', 'ESD', 'APC'] },
      { id: 'f11', name: '切除数目', type: 'number', required: true },
      { id: 'f12', name: '完整回收', type: 'select', required: true, options: ['是', '否'] },
      { id: 'f13', name: '术中并发症', type: 'multiselect', required: false, options: ['出血', '穿孔', '无'] },
      { id: 'f14', name: '术后病理', type: 'select', required: false, options: ['管状腺瘤', '绒毛状腺瘤', '管状绒毛状腺瘤', '低级别上皮内瘤变', '高级别上皮内瘤变', '癌变'] },
      { id: 'f15', name: '切缘', type: 'select', required: false, options: ['阴性', '阳性', '无法评估'] },
      { id: 'f16', name: '手术图片', type: 'image', required: false },
      { id: 'f17', name: '操作医生签名', type: 'signature', required: true },
    ],
  },
];

// ========== 样式 ==========
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
  searchRow: { display: 'flex', gap: 12, marginBottom: 16 },
  searchBox: { flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: '#fff', borderRadius: 8, padding: '8px 12px', border: '1px solid #e2e8f0' },
  searchInput: { border: 'none', outline: 'none', flex: 1, fontSize: 13 },
  filterBtn: { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: 13, color: '#64748b' },
  cardGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 },
  card: { background: '#fff', borderRadius: 10, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', transition: 'all 0.2s', cursor: 'pointer' },
  cardHover: { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  cardTitle: { fontSize: 15, fontWeight: 700, color: '#1a3a5c', marginBottom: 4 },
  cardDesc: { fontSize: 12, color: '#64748b', lineHeight: 1.5, marginBottom: 12 },
  cardMeta: { display: 'flex', gap: 16, fontSize: 11, color: '#94a3b8', marginBottom: 12 },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid #f1f5f9' },
  badge: { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 },
  badgeGastroscope: { background: '#dbeafe', color: '#1d4ed8' },
  badgeColonoscope: { background: '#dcfce7', color: '#16a34a' },
  badgeEUS: { background: '#fef3c7', color: '#d97706' },
  badgeERCP: { background: '#fee2e2', color: '#dc2626' },
  badgeEarlyCancer: { background: '#fce7f3', color: '#be185d' },
  badgeOther: { background: '#f1f5f9', color: '#64748b' },
  badgeProfessional: { background: '#fef3c7', color: '#b45309', fontSize: 10 },
  statBadge: { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 6px', borderRadius: 4, fontSize: 10, background: '#f1f5f9', color: '#475569' },
  actionBtn: { padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 },
  btnPrimary: { background: '#1a3a5c', color: '#fff' },
  btnSuccess: { background: '#16a34a', color: '#fff' },
  btnWarning: { background: '#d97706', color: '#fff' },
  btnDanger: { background: '#dc2626', color: '#fff' },
  btnGhost: { background: '#f1f5f9', color: '#475569' },
  modal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalContent: { background: '#fff', borderRadius: 12, width: 900, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' },
  modalLarge: { width: 1100 },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e2e8f0' },
  modalTitle: { fontSize: 16, fontWeight: 700, color: '#1a3a5c' },
  modalBody: { padding: 20 },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '12px 20px', borderTop: '1px solid #e2e8f0' },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 },
  formGroup: { marginBottom: 12 },
  formLabel: { display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4 },
  formInput: { width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', boxSizing: 'border-box' },
  formSelect: { width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', background: '#fff' },
  formTextarea: { width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', resize: 'vertical', minHeight: 60 },
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
};

// 字段类型图标和颜色
const fieldTypeConfig: Record<FieldType, { icon: React.ReactNode; color: string }> = {
  text: { icon: <Type size={14} />, color: '#3b82f6' },
  number: { icon: <Hash size={14} />, color: '#8b5cf6' },
  select: { icon: <ChevronDown size={14} />, color: '#16a34a' },
  date: { icon: <Calendar size={14} />, color: '#d97706' },
  multiselect: { icon: <ListChecks size={14} />, color: '#06b6d4' },
  image: { icon: <Image size={14} />, color: '#ec4899' },
  signature: { icon: <PenTool size={14} />, color: '#1a3a5c' },
};

// 分类徽章颜色
const categoryBadgeMap: Record<string, React.CSSProperties> = {
  '腹部超声': styles.badgeGastroscope,
  '肠镜': styles.badgeColonoscope,
  '超声超声探头': styles.badgeEUS,
  'ERCP': styles.badgeERCP,
  '早癌筛查': styles.badgeEarlyCancer,
  '其他': styles.badgeOther,
};

export default function TemplatePage() {
  const [activeTab, setActiveTab] = useState<string>('list');
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('全部');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // 统计数据
  const totalUsage = templates.reduce((sum, t) => sum + t.usageCount, 0);
  const avgUsage = Math.round(totalUsage / templates.length);
  const professionalCount = templates.filter(t => t.isProfessional).length;
  const recentUsed = templates.filter(t => t.lastUsed >= '2026-04-27').length;

  // 分类统计
  const categoryStats = templates.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.usageCount;
    return acc;
  }, {} as Record<string, number>);

  // 过滤数据
  const filteredTemplates = templates.filter(t => {
    const matchSearch = t.name.includes(search) || t.description.includes(search) || t.category.includes(search);
    const matchCategory = filterCategory === '全部' || t.category === filterCategory;
    return matchSearch && matchCategory;
  });

  // 打开预览弹窗
  const openPreview = (template: Template) => {
    setPreviewTemplate(template);
    setShowPreviewModal(true);
  };

  // 打开编辑弹窗
  const openEdit = (template?: Template) => {
    setEditingTemplate(template || {
      id: `T${String(templates.length + 1).padStart(3, '0')}`,
      name: '',
      category: '腹部超声',
      description: '',
      fields: [],
      usageCount: 0,
      lastUsed: '',
      createdBy: '当前用户',
      createdAt: new Date().toISOString().split('T')[0],
      isProfessional: false,
    });
    setShowEditModal(true);
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
    };
    alert(`已复制模板: ${newTemplate.name}`);
  };

  // 删除模板
  const deleteTemplate = (id: string) => {
    if (confirm('确定要删除该模板吗？')) {
      alert(`已删除模板: ${id}`);
    }
  };

  // 渲染统计卡片
  const renderStatCard = (label: string, value: number, sub?: string, color?: string) => (
    <div style={styles.statCard}>
      <div style={styles.statLabel}>{label}</div>
      <div style={{ ...styles.statValue, color: color || '#1a3a5c' }}>{value.toLocaleString()}</div>
      {sub && <div style={styles.statSub}>{sub}</div>}
    </div>
  );

  // 渲染分类徽章
  const renderCategoryBadge = (category: string) => (
    <span style={{ ...styles.badge, ...categoryBadgeMap[category] }}>{category}</span>
  );

  // 渲染字段类型标签
  const renderFieldTypeTag = (type: FieldType) => {
    const config = fieldTypeConfig[type];
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 6px', borderRadius: 4, fontSize: 10, background: `${config.color}15`, color: config.color }}>
        {config.icon}
        {type}
      </span>
    );
  };

  // 渲染模板卡片
  const renderTemplateCard = (template: Template) => (
    <div
      key={template.id}
      style={{ ...styles.card, ...(hoveredCard === template.id ? styles.cardHover : {}) }}
      onMouseEnter={() => setHoveredCard(template.id)}
      onMouseLeave={() => setHoveredCard(null)}
    >
      <div style={styles.cardHeader}>
        <div>
          <div style={styles.cardTitle}>{template.name}</div>
          <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
            {renderCategoryBadge(template.category)}
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
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Clock size={12} /> {template.lastUsed}
        </span>
      </div>
      <div style={styles.cardFooter}>
        <span style={{ fontSize: 11, color: '#94a3b8' }}>创建: {template.createdBy}</span>
        <div style={{ display: 'flex', gap: 4 }}>
          <button style={{ ...styles.actionBtn, ...styles.btnGhost }} onClick={() => openPreview(template)}>
            <Eye size={12} /> 预览
          </button>
          <button style={{ ...styles.actionBtn, ...styles.btnPrimary }} onClick={() => openEdit(template)}>
            <Edit size={12} /> 编辑
          </button>
        </div>
      </div>
    </div>
  );

  // ========== 预览弹窗 ==========
  const renderPreviewModal = () => {
    if (!previewTemplate) return null;
    return (
      <div style={styles.modal} onClick={() => setShowPreviewModal(false)}>
        <div style={{ ...styles.modalContent, ...styles.modalLarge }} onClick={e => e.stopPropagation()}>
          <div style={styles.modalHeader}>
            <div>
              <div style={styles.modalTitle}>{previewTemplate.name}</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                {renderCategoryBadge(previewTemplate.category)}
                {previewTemplate.isProfessional && <span style={{ ...styles.badge, ...styles.badgeProfessional }}>专业模板</span>}
              </div>
            </div>
            <button style={{ ...styles.actionBtn, ...styles.btnGhost }} onClick={() => setShowPreviewModal(false)}>
              <X size={16} />
            </button>
          </div>
          <div style={styles.modalBody}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
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
                <div style={{ fontSize: 12, color: '#94a3b8' }}>最后使用</div>
                <div style={{ fontSize: 14, color: '#334155', fontWeight: 500 }}>{previewTemplate.lastUsed}</div>
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>描述</div>
              <div style={{ fontSize: 14, color: '#334155', marginTop: 4 }}>{previewTemplate.description}</div>
            </div>

            {/* 字段预览 */}
            <div style={styles.previewSection}>
              <div style={styles.previewSectionTitle}>字段配置预览（共{previewTemplate.fields.length}个字段）</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                {previewTemplate.fields.map(field => (
                  <div key={field.id}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>{field.name}</span>
                      {field.required && <span style={styles.fieldRequired}>*</span>}
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
                      ) : field.type === 'number' ? (
                        <span style={{ color: '#94a3b8' }}>0</span>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>{field.placeholder || '请输入...'}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={styles.modalFooter}>
            <button style={{ ...styles.actionBtn, ...styles.btnGhost }} onClick={() => duplicateTemplate(previewTemplate)}>
              <Copy size={12} /> 复制模板
            </button>
            <button style={{ ...styles.actionBtn, ...styles.btnPrimary }} onClick={() => { setShowPreviewModal(false); openEdit(previewTemplate); }}>
              <Edit size={12} /> 编辑模板
            </button>
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
            <div style={styles.modalTitle}>{editingTemplate.id ? '编辑模板' : '新建模板'}</div>
            <button style={{ ...styles.actionBtn, ...styles.btnGhost }} onClick={() => setShowEditModal(false)}>
              <X size={16} />
            </button>
          </div>
          <div style={styles.modalBody}>
            {/* 基本信息 */}
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
                <label style={styles.formLabel}>分类 *</label>
                <select
                  style={styles.formSelect}
                  value={editingTemplate.category}
                  onChange={e => setEditingTemplate({ ...editingTemplate, category: e.target.value as Template['category'] })}
                >
                  <option>腹部超声</option>
                  <option>肠镜</option>
                  <option>超声超声探头</option>
                  <option>ERCP</option>
                  <option>早癌筛查</option>
                  <option>其他</option>
                </select>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <input
                type="checkbox"
                style={styles.checkbox}
                checked={editingTemplate.isProfessional}
                onChange={e => setEditingTemplate({ ...editingTemplate, isProfessional: e.target.checked })}
              />
              <span style={{ fontSize: 13, color: '#334155' }}>设为专业模板（早癌筛查等高级专业模板）</span>
            </div>

            {/* 字段管理 */}
            <div style={styles.fieldList}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1a3a5c' }}>字段配置（共{editingTemplate.fields.length}个）</div>
              </div>
              {editingTemplate.fields.map((field, index) => (
                <div key={field.id} style={styles.fieldItem}>
                  <div style={{ ...styles.fieldIcon, background: `${fieldTypeConfig[field.type].color}15` }}>
                    {fieldTypeConfig[field.type].icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={styles.fieldName}>{field.name}</div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 2 }}>
                      <span style={{ ...styles.fieldType, color: fieldTypeConfig[field.type].color }}>{field.type}</span>
                      {field.required && <span style={styles.fieldRequired}>必填</span>}
                      {field.options && <span style={{ fontSize: 10, color: '#94a3b8' }}>选项: {field.options.length}个</span>}
                    </div>
                  </div>
                  <button
                    style={{ ...styles.actionBtn, ...styles.btnGhost }}
                    onClick={() => {
                      const newFields = editingTemplate.fields.filter((_, i) => i !== index);
                      setEditingTemplate({ ...editingTemplate, fields: newFields });
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              <button
                style={styles.addFieldBtn}
                onClick={() => {
                  const newField: TemplateField = {
                    id: `f${Date.now()}`,
                    name: '',
                    type: 'text',
                    required: false,
                  };
                  setEditingTemplate({ ...editingTemplate, fields: [...editingTemplate.fields, newField] });
                }}
              >
                <Plus size={14} /> 添加字段
              </button>
            </div>
          </div>
          <div style={styles.modalFooter}>
            <button style={{ ...styles.actionBtn, ...styles.btnGhost }} onClick={() => setShowEditModal(false)}>取消</button>
            <button
              style={{ ...styles.actionBtn, ...styles.btnSuccess }}
              onClick={() => {
                alert(editingTemplate.id ? '模板已保存' : '模板已创建');
                setShowEditModal(false);
              }}
            >
              保存模板
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
          模板管理
        </div>
        <button style={{ ...styles.actionBtn, ...styles.btnPrimary, display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => openEdit()}>
          <Plus size={14} /> 新建模板
        </button>
      </div>

      {/* 标签页 */}
      <div style={styles.tabBar}>
        <button style={{ ...styles.tab, ...(activeTab === 'list' ? styles.tabActive : {}) }} onClick={() => setActiveTab('list')}>模板列表</button>
        <button style={{ ...styles.tab, ...(activeTab === 'stats' ? styles.tabActive : {}) }} onClick={() => setActiveTab('stats')}>使用统计</button>
      </div>

      {/* ========== 模板列表 ========== */}
      {activeTab === 'list' && (
        <>
          {/* 统计卡片 */}
          <div style={styles.statRow}>
            {renderStatCard('模板总数', templates.length)}
            {renderStatCard('总使用次数', totalUsage, `平均 ${avgUsage} 次/模板`)}
            {renderStatCard('专业模板', professionalCount, '高级专业')}
            {renderStatCard('最近使用', recentUsed, '3天内')
            }
          </div>

          {/* 搜索筛选 */}
          <div style={styles.searchRow}>
            <div style={styles.searchBox}>
              <Search size={16} color="#94a3b8" />
              <input
                style={styles.searchInput}
                placeholder="搜索模板名称/描述..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              style={{ ...styles.formSelect, width: 160 }}
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
            >
              <option value="全部">全部分类</option>
              <option>腹部超声</option>
              <option>肠镜</option>
              <option>超声超声探头</option>
              <option>ERCP</option>
              <option>早癌筛查</option>
              <option>其他</option>
            </select>
          </div>

          {/* 模板卡片列表 */}
          <div style={styles.cardGrid}>
            {filteredTemplates.length === 0 ? (
              <div style={{ ...styles.emptyState, gridColumn: '1 / -1' }}>
                <FileText size={48} style={{ marginBottom: 12, opacity: 0.5 }} />
                <div>暂无模板</div>
              </div>
            ) : filteredTemplates.map(template => renderTemplateCard(template))}
          </div>
        </>
      )}

      {/* ========== 使用统计 ========== */}
      {activeTab === 'stats' && (
        <>
          <div style={styles.statRow}>
            {renderStatCard('总使用次数', totalUsage)}
            {renderStatCard('平均使用', avgUsage, '次/模板', '#3b82f6')}
            {renderStatCard('专业模板', professionalCount, '占比 ' + Math.round((professionalCount / templates.length) * 100) + '%', '#be185d')}
            {renderStatCard('最高使用', Math.max(...templates.map(t => t.usageCount)))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* 分类使用统计 */}
            <div style={styles.chartCard}>
              <div style={styles.chartTitle}>分类使用分布</div>
              {Object.entries(categoryStats).map(([cat, count]) => (
                <div key={cat} style={styles.barRow}>
                  <div style={{ ...styles.barLabel, width: 80 }}>{cat}</div>
                  <div style={styles.barBg}>
                    <div style={{ ...styles.barFill, width: `${(count / totalUsage) * 100}%`, background: categoryBadgeMap[cat]?.background || '#94a3b8', color: categoryBadgeMap[cat]?.color || '#64748b' }} />
                  </div>
                  <div style={{ fontSize: 12, color: '#475569', width: 50, textAlign: 'right' }}>{count}次</div>
                </div>
              ))}
            </div>

            {/* 使用排行 */}
            <div style={styles.chartCard}>
              <div style={styles.chartTitle}>模板使用排行</div>
              {[...templates].sort((a, b) => b.usageCount - a.usageCount).slice(0, 5).map((t, i) => (
                <div key={t.id} style={{ ...styles.barRow, marginBottom: 12 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: i === 0 ? '#fbbf24' : i === 1 ? '#94a3b8' : i === 2 ? '#cd7c4b' : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: i < 3 ? '#fff' : '#64748b' }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1, marginLeft: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: '#334155' }}>{t.name}</div>
                    <div style={{ fontSize: 10, color: '#94a3b8' }}>{t.usageCount}次</div>
                  </div>
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
                  <div style={{ ...styles.barLabel, width: 90, display: 'flex', alignItems: 'center', gap: 4 }}>
                    {fieldTypeConfig[type as FieldType]?.icon}
                    {type}
                  </div>
                  <div style={styles.barBg}>
                    <div style={{ ...styles.barFill, width: `${(count / templates.flatMap(t => t.fields).length) * 100}%`, background: fieldTypeConfig[type as FieldType]?.color }} />
                  </div>
                  <div style={{ fontSize: 12, color: '#475569', width: 40, textAlign: 'right' }}>{count}</div>
                </div>
              ))}
            </div>

            {/* 创建趋势 */}
            <div style={styles.chartCard}>
              <div style={styles.chartTitle}>模板创建时间线</div>
              {templates.map(t => (
                <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: '#334155' }}>{t.name}</div>
                    <div style={{ fontSize: 10, color: '#94a3b8' }}>{t.createdBy}</div>
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{t.createdAt}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* 预览弹窗 */}
      {showPreviewModal && renderPreviewModal()}

      {/* 编辑弹窗 */}
      {showEditModal && renderEditModal()}
    </div>
  );
}
