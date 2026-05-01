// @ts-nocheck
// ============================================================
// G003 超声RIS系统 - 超声专业词库管理页面
// 功能：三级词库 | 亚专业分类 | 部位词典 | 术语词典 | 报告词库 | 联想输入 | Excel导入导出
// ============================================================
import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import {
  Search, Plus, Edit2, Trash2, X, ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  BookOpen, Filter, RotateCcw, Star, Users, Building2, Copy, Download, Upload,
  Layers, FolderTree, FileText, Sparkles, PanelLeftClose, PanelLeftOpen,
  Tag, List, CheckSquare, Square, AlertCircle, Info, ExternalLink, ArrowRight
} from 'lucide-react'

// ==================== 类型定义 ====================

// 三级管理：个人 / 科室 / 全院
type ScopeLevel = 'personal' | 'department' | 'hospital'

// 超声亚专业
type UltrasoundCategory = '腹部' | '浅表器官' | '心血管' | '妇产' | '介入超声' | '肌骨'

// 术语项
interface TermItem {
  id: string
  category: UltrasoundCategory
  code: string
  name: string
  pinyin?: string       // 全拼
  pinyinInitial?: string // 拼音首字母
  englishName?: string
  synonyms?: string[]   // 同义词列表
  definition?: string
  scope: ScopeLevel
  isActive: boolean
  sortOrder: number
  creator?: string
  createTime?: string
  notes?: string
  tags?: string[]      // 自定义标签
}

// 部位词典
interface BodyPart {
  id: string
  category: UltrasoundCategory
  code: string
  name: string
  pinyin?: string
  englishName?: string
  subParts?: string[]  // 子部位，如肝脏：肝左叶、肝右叶、尾状叶
  descriptors?: string[]  // 常用描述词
  normalRanges?: NormalRange[] // 正常值范围
  relatedTerms?: string[] // 关联术语
  scope: ScopeLevel
  isActive: boolean
  sortOrder: number
  creator?: string
  createTime?: string
}

interface NormalRange {
  measurement: string    // 测量项目，如"长径"
  normalValue: string     // 正常值，如"≤15cm"
  unit?: string           // 单位
  note?: string           // 备注
}

// 报告词库短语
interface ReportPhrase {
  id: string
  category: UltrasoundCategory
  examType: string        // 检查类型，如"腹部常规"、"心脏常规"
  phrase: string          // 短语内容
  pinyin?: string
  useCount: number        // 使用频次
  isPreset: boolean       // 是否为预设
  scope: ScopeLevel
  isActive: boolean
  sortOrder: number
  creator?: string
  createTime?: string
}

// ==================== 样式定义 ====================
const s: Record<string, React.CSSProperties> = {
  pageHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 18, fontWeight: 700, color: '#1a3a5c' },
  subtitle: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  statsRow: { display: 'flex', gap: 24 },
  statItem: {
    display: 'flex', alignItems: 'center', gap: 6,
    fontSize: 13, color: '#64748b',
  },
  statNum: { fontWeight: 700, color: '#1a3a5c' },
  scopeTag: {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
  },
  scopePersonal: { background: '#fef3c7', color: '#92400e' },
  scopeDepartment: { background: '#dbeafe', color: '#1d4ed8' },
  scopeHospital: { background: '#f3e8ff', color: '#7c3aed' },
  toolbar: {
    display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap',
    background: '#fff', padding: '12px 16px', borderRadius: 8,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: 16,
  },
  searchBox: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: '#f8fafc', border: '1px solid #e2e8f0',
    borderRadius: 6, padding: '6px 12px', flex: 1, minWidth: 220,
  },
  searchInput: {
    border: 'none', outline: 'none', background: 'transparent',
    fontSize: 15, color: '#334155', width: '100%',
  },
  select: {
    border: '1px solid #e2e8f0', borderRadius: 6, padding: '8px 12px',
    fontSize: 14, color: '#334155', background: '#f8fafc', outline: 'none',
    cursor: 'pointer', minHeight: 44,
  },
  btnPrimary: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 6,
    padding: '10px 16px', fontSize: 14, cursor: 'pointer', minHeight: 44,
  },
  btnSecondary: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 6,
    padding: '10px 16px', fontSize: 14, cursor: 'pointer', minHeight: 44,
  },
  btnDanger: {
    display: 'flex', alignItems: 'center', gap: 4,
    background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 6,
    padding: '8px 12px', fontSize: 13, cursor: 'pointer', minHeight: 44,
  },
  btnIcon: {
    display: 'flex', alignItems: 'center', gap: 4,
    background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 6,
    padding: '8px 12px', fontSize: 13, cursor: 'pointer', minHeight: 44,
  },
  btnSm: {
    display: 'flex', alignItems: 'center', gap: 4,
    background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 5,
    padding: '5px 10px', fontSize: 12, cursor: 'pointer',
  },
  // 主内容区：侧边栏 + 右侧
  mainLayout: {
    display: 'flex', gap: 16,
  },
  // 左侧侧边栏（部位词典树）
  sidebar: {
    width: 280, flexShrink: 0,
    background: '#fff', borderRadius: 8,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    display: 'flex', flexDirection: 'column',
    maxHeight: 'calc(100vh - 220px)',
  },
  sidebarHeader: {
    padding: '14px 16px', borderBottom: '1px solid #e2e8f0',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  sidebarTitle: { fontSize: 13, fontWeight: 700, color: '#1a3a5c' },
  sidebarBody: { flex: 1, overflowY: 'auto', padding: '8px 0' },
  sidebarSection: {
    padding: '8px 16px 4px', fontSize: 11, fontWeight: 700,
    color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5,
  },
  sidebarItem: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '8px 16px', cursor: 'pointer', fontSize: 13,
    color: '#334155', borderRadius: 0,
    transition: 'all 0.15s',
  },
  sidebarItemActive: {
    background: '#eff6ff', color: '#1d4ed8',
    borderRight: '3px solid #1d4ed8',
  },
  sidebarItemChild: {
    padding: '6px 16px 6px 32px', cursor: 'pointer', fontSize: 12,
    color: '#64748b', display: 'flex', alignItems: 'center', gap: 6,
  },
  // 右侧内容
  content: { flex: 1, minWidth: 0 },
  // 标签页
  tabBar: {
    display: 'flex', gap: 4, marginBottom: 16,
    background: '#fff', padding: '8px 12px', borderRadius: 8,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  tab: {
    padding: '8px 16px', borderRadius: 6, border: 'none', cursor: 'pointer',
    fontSize: 14, fontWeight: 500, transition: 'all 0.2s',
    display: 'flex', alignItems: 'center', gap: 6,
  },
  tabActive: { background: '#1a3a5c', color: '#fff' },
  tabInactive: { background: 'transparent', color: '#64748b' },
  tabBadge: {
    background: '#ef4444', color: '#fff', borderRadius: '50%',
    width: 18, height: 18, display: 'inline-flex',
    alignItems: 'center', justifyContent: 'center', fontSize: 10,
  },
  // 表格
  table: {
    width: '100%', borderCollapse: 'collapse', background: '#fff',
    borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  th: {
    background: '#f8fafc', padding: '10px 12px', textAlign: 'left',
    fontSize: 12, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e2e8f0',
    whiteSpace: 'nowrap',
  },
  td: {
    padding: '10px 12px', fontSize: 13, color: '#334155', borderBottom: '1px solid #f1f5f9',
  },
  badge: {
    display: 'inline-block', padding: '2px 8px', borderRadius: 12, fontSize: 11,
  },
  badgeActive: { background: '#dcfce7', color: '#16a34a' },
  badgeInactive: { background: '#f1f5f9', color: '#94a3b8' },
  badgeCat: {
    display: 'inline-block', padding: '3px 10px', borderRadius: 6,
    fontSize: 12, fontWeight: 600,
  },
  actions: { display: 'flex', gap: 6, flexWrap: 'wrap' as const },
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
  pageBtnActive: { background: '#1a3a5c', color: '#fff', border: '1px solid #1a3a5c' },
  pageBtnDisabled: { opacity: 0.5, cursor: 'not-allowed' },
  // 弹窗
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: '#fff', borderRadius: 12, width: 640, maxHeight: '90vh',
    overflow: 'hidden', display: 'flex', flexDirection: 'column',
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
  },
  modalWide: {
    background: '#fff', borderRadius: 12, width: 900, maxHeight: '90vh',
    overflow: 'hidden', display: 'flex', flexDirection: 'column',
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
  },
  modalHeader: {
    padding: '16px 20px', borderBottom: '1px solid #e2e8f0',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  modalTitle: { fontSize: 15, fontWeight: 700, color: '#1a3a5c' },
  modalClose: {
    background: 'none', border: 'none', cursor: 'pointer', color: '#94a8b8',
    display: 'flex', alignItems: 'center', padding: 4,
  },
  modalBody: {
    padding: 20, overflowY: 'auto', flex: 1,
  },
  modalFooter: {
    padding: '12px 20px', borderTop: '1px solid #e2e8f0',
    display: 'flex', justifyContent: 'flex-end', gap: 10,
  },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
  formGroup: { display: 'flex', flexDirection: 'column', gap: 5 },
  formGroupFull: { gridColumn: '1 / -1' },
  label: { fontSize: 12, fontWeight: 600, color: '#475569' },
  required: { color: '#dc2626', marginLeft: 2 },
  input: {
    border: '1px solid #e2e8f0', borderRadius: 6, padding: '10px 12px',
    fontSize: 14, color: '#334155', outline: 'none', minHeight: 44,
  },
  textarea: {
    border: '1px solid #e2e8f0', borderRadius: 6, padding: '10px 12px',
    fontSize: 14, color: '#334155', outline: 'none', resize: 'vertical',
    minHeight: 80, fontFamily: 'inherit',
  },
  checkboxLabel: {
    display: 'flex', alignItems: 'center', gap: 8,
    fontSize: 13, color: '#334155', cursor: 'pointer',
  },
  btnCancel: {
    padding: '10px 20px', borderRadius: 6, border: '1px solid #e2e8f0',
    background: '#fff', fontSize: 14, color: '#475569', cursor: 'pointer', minHeight: 44,
  },
  btnSubmit: {
    padding: '10px 20px', borderRadius: 6, border: 'none',
    background: '#1a3a5c', fontSize: 14, color: '#fff', cursor: 'pointer', minHeight: 44,
  },
  btnDeleteConfirm: {
    padding: '10px 20px', borderRadius: 6, border: 'none',
    background: '#dc2626', fontSize: 14, color: '#fff', cursor: 'pointer', minHeight: 44,
  },
  emptyState: {
    textAlign: 'center', padding: '60px 20px', color: '#94a3b8',
  },
  emptyIcon: {
    width: 64, height: 64, borderRadius: 16, background: '#f1f5f9',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 16px',
  },
  emptyTitle: { fontSize: 16, fontWeight: 600, color: '#64748b', marginBottom: 8 },
  emptyDesc: { fontSize: 13, color: '#94a3b8', marginBottom: 20 },
  infoTip: { fontSize: 11, color: '#94a3b8', marginTop: 4 },
  errorText: { fontSize: 12, color: '#dc2626', marginTop: 4 },
  deleteModalText: { fontSize: 14, color: '#475569', lineHeight: 1.6, marginBottom: 8 },
  // 联想下拉
  autocompleteDropdown: {
    position: 'absolute', top: '100%', left: 0, right: 0,
    background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8,
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 200,
    maxHeight: 320, overflowY: 'auto', marginTop: 4,
  },
  autocompleteItem: {
    padding: '10px 14px', cursor: 'pointer', fontSize: 14,
    display: 'flex', alignItems: 'center', gap: 8,
    borderBottom: '1px solid #f1f5f9',
  },
  autocompleteItemHover: { background: '#f8fafc' },
  autocompleteTag: {
    fontSize: 10, padding: '1px 6px', borderRadius: 4,
    background: '#e2e8f0', color: '#64748b',
  },
  // 部位词典详情
  partDetail: {
    background: '#fff', borderRadius: 8,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    overflow: 'hidden',
  },
  partDetailHeader: {
    padding: '16px 20px', borderBottom: '1px solid #e2e8f0',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  partDetailSection: {
    padding: '16px 20px', borderBottom: '1px solid #f1f5f9',
  },
  partDetailSectionTitle: {
    fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 10,
    display: 'flex', alignItems: 'center', gap: 6,
  },
  chipList: { display: 'flex', flexWrap: 'wrap' as const, gap: 6 },
  chip: {
    padding: '4px 10px', borderRadius: 16, fontSize: 12,
    background: '#f1f5f9', color: '#475569',
    border: '1px solid #e2e8f0',
  },
  chipBlue: { background: '#dbeafe', color: '#1d4ed8', border: '1px solid #bfdbfe' },
  chipGreen: { background: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0' },
  chipPurple: { background: '#f3e8ff', color: '#7c3aed', border: '1px solid #e9d5ff' },
  chipOrange: { background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' },
  chipRed: { background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca' },
  normalRangeTable: {
    width: '100%', borderCollapse: 'collapse', fontSize: 13,
  },
  normalRangeTh: {
    background: '#f8fafc', padding: '8px 12px', textAlign: 'left',
    fontSize: 12, fontWeight: 600, color: '#64748b',
    borderBottom: '1px solid #e2e8f0',
  },
  normalRangeTd: {
    padding: '8px 12px', fontSize: 13, color: '#334155',
    borderBottom: '1px solid #f1f5f9',
  },
  // 搜索框容器（用于联想定位）
  searchWrapper: { position: 'relative' as const, flex: 1, minWidth: 220 },
  // 筛选标签
  filterTags: { display: 'flex', gap: 6, flexWrap: 'wrap' as const, marginBottom: 12 },
  filterTag: {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '4px 10px', borderRadius: 16, fontSize: 12,
    background: '#eff6ff', color: '#1d4ed8',
    border: '1px solid #bfdbfe',
  },
  filterTagClose: {
    background: 'none', border: 'none', cursor: 'pointer',
    color: '#1d4ed8', display: 'flex', alignItems: 'center', padding: 0,
  },
  // 报告短语表格特殊列
  phraseCell: {
    background: '#f8fafc', padding: '10px 14px', borderRadius: 6,
    fontSize: 13, color: '#334155', lineHeight: 1.6,
  },
  useCountBar: {
    height: 4, borderRadius: 2, background: '#e2e8f0',
    width: 60, display: 'inline-block', verticalAlign: 'middle', marginRight: 8,
  },
  // 导入导出提示框
  importInfoBox: {
    background: '#eff6ff', border: '1px solid #bfdbfe',
    borderRadius: 8, padding: '14px 16px', marginBottom: 16,
    fontSize: 13, color: '#1d4ed8', display: 'flex', alignItems: 'flex-start', gap: 8,
  },
  // 词库类型切换
  scopeSwitch: {
    display: 'inline-flex', background: '#f1f5f9', borderRadius: 8, padding: 3, gap: 2,
  },
  scopeSwitchBtn: {
    padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
    fontSize: 13, fontWeight: 500, transition: 'all 0.2s',
  },
  scopeSwitchActive: { background: '#fff', color: '#1a3a5c', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  scopeSwitchInactive: { background: 'transparent', color: '#64748b' },
  // 词库统计卡片
  scopeStats: {
    display: 'flex', gap: 12, marginBottom: 16,
  },
  scopeStatCard: {
    flex: 1, background: '#fff', borderRadius: 8,
    padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    borderTop: '3px solid',
  },
  scopeStatLabel: { fontSize: 12, color: '#64748b', marginBottom: 6 },
  scopeStatValue: { fontSize: 24, fontWeight: 700 },
  // 导入modal
  importStep: {
    display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16,
  },
  importStepNum: {
    width: 28, height: 28, borderRadius: '50%', background: '#1a3a5c',
    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 13, fontWeight: 700, flexShrink: 0,
  },
  importStepText: { fontSize: 14, color: '#334155' },
  fileDropZone: {
    border: '2px dashed #e2e8f0', borderRadius: 10,
    padding: '40px 20px', textAlign: 'center' as const,
    cursor: 'pointer', transition: 'all 0.2s',
    background: '#fafafa',
  },
  fileDropZoneHover: {
    borderColor: '#1a3a5c', background: '#eff6ff',
  },
  hiddenInput: { display: 'none' },
}

// ==================== 分类颜色 ====================
const categoryColors: Record<UltrasoundCategory, { bg: string; color: string }> = {
  '腹部':      { bg: '#dbeafe', color: '#1d4ed8' },
  '浅表器官':  { bg: '#fce7f3', color: '#be185d' },
  '心血管':    { bg: '#fee2e2', color: '#dc2626' },
  '妇产':      { bg: '#f3e8ff', color: '#7c3aed' },
  '介入超声':  { bg: '#d1fae5', color: '#059669' },
  '肌骨':      { bg: '#fef3c7', color: '#92400e' },
}

const scopeLabels: Record<ScopeLevel, string> = {
  personal: '个人词库',
  department: '科室共享',
  hospital: '全院标准',
}

const scopeColors: Record<ScopeLevel, { bg: string; color: string }> = {
  personal: { bg: '#fef3c7', color: '#92400e' },
  department: { bg: '#dbeafe', color: '#1d4ed8' },
  hospital: { bg: '#f3e8ff', color: '#7c3aed' },
}

// ==================== 初始数据 ====================
const initialTerms: TermItem[] = [
  // 腹部
  { id: 'T001', category: '腹部', code: 'ABD-LIV', name: '肝脏', pinyin: 'gānzāng', pinyinInitial: 'gz', englishName: 'Liver', synonyms: ['肝'], definition: '腹部实质性脏器，位于右季肋区，大小约22-28cm', scope: 'hospital', isActive: true, sortOrder: 1, creator: '系统管理员', createTime: '2025-01-10', tags: ['实质性脏器', '腹膜后'] },
  { id: 'T002', category: '腹部', code: 'ABD-GBL', name: '胆囊', pinyin: 'dānnáng', pinyinInitial: 'dn', englishName: 'Gallbladder', synonyms: ['胆'], definition: '梨形囊性器官，储存胆汁，长径≤8cm，壁厚≤3mm', scope: 'hospital', isActive: true, sortOrder: 2, creator: '系统管理员', createTime: '2025-01-10' },
  { id: 'T003', category: '腹部', code: 'ABD-PAN', name: '胰腺', pinyin: 'yíxiàn', pinyinInitial: 'yx', englishName: 'Pancreas', synonyms: ['胰'], definition: '腹膜后器官，分泌胰液和胰岛素，头部厚约1.5-2.5cm', scope: 'hospital', isActive: true, sortOrder: 3, creator: '系统管理员', createTime: '2025-01-10' },
  { id: 'T004', category: '腹部', code: 'ABD-SPL', name: '脾脏', pinyin: 'pízāng', pinyinInitial: 'pz', englishName: 'Spleen', synonyms: ['脾'], definition: '左上腹实质性脏器，长径约10-12cm，厚≤4cm', scope: 'hospital', isActive: true, sortOrder: 4, creator: '系统管理员', createTime: '2025-01-10' },
  { id: 'T005', category: '腹部', code: 'ABD-KID', name: '肾脏', pinyin: 'shènzāng', pinyinInitial: 'sz', englishName: 'Kidney', synonyms: ['肾'], definition: '腹膜后成对实质性脏器，大小约10-12×5-6cm', scope: 'hospital', isActive: true, sortOrder: 5, creator: '系统管理员', createTime: '2025-01-10' },
  { id: 'T006', category: '腹部', code: 'ABD-AOR', name: '腹主动脉', pinyin: 'fùzhǔdòngmài', pinyinInitial: 'fzdm', englishName: 'Abdominal Aorta', synonyms: ['腹主动脉', '主动脉'], definition: '降主动脉的腹段，内径约1.5-2.5cm', scope: 'hospital', isActive: true, sortOrder: 6, creator: '系统管理员', createTime: '2025-01-10' },
  { id: 'T007', category: '腹部', code: 'ABD-GBD', name: '肝外胆管', pinyin: 'gānwàidǎnguǎn', pinyinInitial: 'gwdg', englishName: 'Extrahepatic Bile Duct', synonyms: ['胆管'], definition: '肝十二指肠韧带内的胆管结构，内径≤6mm', scope: 'hospital', isActive: true, sortOrder: 7, creator: '系统管理员', createTime: '2025-01-10' },
  { id: 'T008', category: '腹部', code: 'ABD-MES', name: '肠系膜', pinyin: 'chángxìmó', pinyinInitial: 'cxm', englishName: 'Mesentery', definition: '连接肠管与后腹壁的双层腹膜结构', scope: 'hospital', isActive: true, sortOrder: 8, creator: '系统管理员', createTime: '2025-01-10' },
  { id: 'T009', category: '腹部', code: 'ABD-LYM', name: '腹膜后淋巴结', pinyin: 'fùmóhòu línbājié', pinyinInitial: 'fmhlbj', englishName: 'Retroperitoneal Lymph Nodes', synonyms: ['腹膜后淋巴结', '肿大淋巴结'], definition: '腹膜后间隙的淋巴结，正常短径≤5mm', scope: 'hospital', isActive: true, sortOrder: 9, creator: '系统管理员', createTime: '2025-01-10' },
  // 浅表器官
  { id: 'T010', category: '浅表器官', code: 'SUP-THY', name: '甲状腺', pinyin: 'jiǎzhuàngxiàn', pinyinInitial: 'jzx', englishName: 'Thyroid', synonyms: ['甲亢', '甲状腺结节'], definition: '颈前部蝶形内分泌腺体，左右径约40-50mm', scope: 'hospital', isActive: true, sortOrder: 1, creator: '系统管理员', createTime: '2025-01-10' },
  { id: 'T011', category: '浅表器官', code: 'SUP-BRS', name: '乳腺', pinyin: 'rǔxiàn', pinyinInitial: 'rx', englishName: 'Breast', synonyms: ['乳房', '乳腺结节'], definition: '女性胸部浅表腺体组织，厚度约10-20mm', scope: 'hospital', isActive: true, sortOrder: 2, creator: '系统管理员', createTime: '2025-01-10' },
  { id: 'T012', category: '浅表器官', code: 'SUP-SAL', name: '唾液腺', pinyin: 'tuòyèxiàn', pinyinInitial: 'tyx', englishName: 'Salivary Gland', synonyms: ['腮腺', '颌下腺', '舌下腺'], definition: '包括腮腺、颌下腺、舌下腺三大唾液腺', scope: 'hospital', isActive: true, sortOrder: 3, creator: '系统管理员', createTime: '2025-01-10' },
  { id: 'T013', category: '浅表器官', code: 'SUP-LYM', name: '淋巴结', pinyin: 'línbājié', pinyinInitial: 'lbj', englishName: 'Lymph Node', synonyms: ['肿大淋巴结', '淋巴结肿大'], definition: '椭圆形淋巴器官，短径通常≤5mm', scope: 'hospital', isActive: true, sortOrder: 4, creator: '系统管理员', createTime: '2025-01-10' },
  { id: 'T014', category: '浅表器官', code: 'SUP-SC', name: '阴囊', pinyin: 'yīnnáng', pinyinInitial: 'yn', englishName: 'Scrotum', synonyms: ['睾丸', '附睾'], definition: '容纳睾丸的囊状结构，睾丸约4-5cm×2-3cm', scope: 'hospital', isActive: true, sortOrder: 5, creator: '系统管理员', createTime: '2025-01-10' },
  { id: 'T015', category: '浅表器官', code: 'SUP-SKN', name: '皮肤及皮下组织', pinyin: 'pífū jí píxià zǔzhī', pinyinInitial: 'pfjpixzz', englishName: 'Skin and Subcutaneous Tissue', synonyms: ['皮下肿物', '皮下水肿'], definition: '皮肤层及皮下软组织结构', scope: 'hospital', isActive: true, sortOrder: 6, creator: '系统管理员', createTime: '2025-01-10' },
  // 心血管
  { id: 'T016', category: '心血管', code: 'CV-HRT', name: '心脏', pinyin: 'xīnzàng', pinyinInitial: 'xz', englishName: 'Heart', synonyms: ['心', '心肌'], definition: '中纵隔肌性器官，四个心腔结构', scope: 'hospital', isActive: true, sortOrder: 1, creator: '系统管理员', createTime: '2025-01-10' },
  { id: 'T017', category: '心血管', code: 'CV-IVC', name: '下腔静脉', pinyin: 'xiàqiāngjìngmài', pinyinInitial: 'xqjmdm', englishName: 'Inferior Vena Cava', synonyms: ['IVC', '下腔'], definition: '体内最大的静脉，内径约15-20mm（吸气时）', scope: 'hospital', isActive: true, sortOrder: 2, creator: '系统管理员', createTime: '2025-01-10' },
  { id: 'T018', category: '心血管', code: 'CV-AVT', name: '主动脉瓣', pinyin: 'zhǔdòngmàibàn', pinyinInitial: 'zdmb', englishName: 'Aortic Valve', synonyms: ['主动脉瓣', 'AV'], definition: '左心室与主动脉间的瓣膜，三叶结构', scope: 'hospital', isActive: true, sortOrder: 3, creator: '系统管理员', createTime: '2025-01-10' },
  { id: 'T019', category: '心血管', code: 'CV-MVT', name: '二尖瓣', pinyin: 'èrjiānbàn', pinyinInitial: 'ejb', englishName: 'Mitral Valve', synonyms: ['二尖瓣', 'MV'], definition: '左房与左室间的瓣膜，瓣口面积4-6cm²', scope: 'hospital', isActive: true, sortOrder: 4, creator: '系统管理员', createTime: '2025-01-10' },
  { id: 'T020', category: '心血管', code: 'CV-CAR', name: '颈动脉', pinyin: 'jǐngdòngmài', pinyinInitial: 'jdm', englishName: 'Carotid Artery', synonyms: ['颈总动脉', '颈内动脉'], definition: '颈部主要动脉，IMT≤1.0mm', scope: 'hospital', isActive: true, sortOrder: 5, creator: '系统管理员', createTime: '2025-01-10' },
  { id: 'T021', category: '心血管', code: 'CV-PV', name: '门静脉', pinyin: 'ménjìngmài', pinyinInitial: 'mjm', englishName: 'Portal Vein', synonyms: ['PV'], definition: '肝脏供血的主要静脉，内径约10-14mm', scope: 'hospital', isActive: true, sortOrder: 6, creator: '系统管理员', createTime: '2025-01-10' },
  { id: 'T022', category: '心血管', code: 'CV-LEG', name: '下肢静脉', pinyin: 'xiàzhī jìngmài', pinyinInitial: 'xzjm', englishName: 'Lower Extremity Veins', synonyms: ['股静脉', '腘静脉', '大隐静脉'], definition: '下肢深浅静脉系统', scope: 'hospital', isActive: true, sortOrder: 7, creator: '系统管理员', createTime: '2025-01-10' },
  // 妇产
  { id: 'T023', category: '妇产', code: 'OB-UT', name: '子宫', pinyin: 'zǐgōng', pinyinInitial: 'zg', englishName: 'Uterus', synonyms: ['宫体', '子宫体'], definition: '女性盆腔肌性器官，成人长约7-8cm', scope: 'hospital', isActive: true, sortOrder: 1, creator: '系统管理员', createTime: '2025-01-10' },
  { id: 'T024', category: '妇产', code: 'OB-OV', name: '卵巢', pinyin: 'luǎncháo', pinyinInitial: 'lc', englishName: 'Ovary', synonyms: ['卵巢', 'LOV', 'ROV'], definition: '女性性腺，产生卵子和激素，约3-5cm', scope: 'hospital', isActive: true, sortOrder: 2, creator: '系统管理员', createTime: '2025-01-10' },
  { id: 'T025', category: '妇产', code: 'OB-FET', name: '胎儿', pinyin: 'tāiér', pinyinInitial: 'te', englishName: 'Fetus', synonyms: ['胚胎', '宫内胎儿'], definition: '宫内发育中的胚胎/胎儿', scope: 'hospital', isActive: true, sortOrder: 3, creator: '系统管理员', createTime: '2025-01-10' },
  { id: 'T026', category: '妇产', code: 'OB-PLAC', name: '胎盘', pinyin: 'tāipán', pinyinInitial: 'tp', englishName: 'Placenta', synonyms: ['前置胎盘'], definition: '孕期连接胎儿与子宫壁的器官', scope: 'hospital', isActive: true, sortOrder: 4, creator: '系统管理员', createTime: '2025-01-10' },
  { id: 'T027', category: '妇产', code: 'OB-AMN', name: '羊水', pinyin: 'yángshuǐ', pinyinInitial: 'ys', englishName: 'Amniotic Fluid', synonyms: ['羊水量'], definition: '环绕胎儿的羊膜腔内液体', scope: 'hospital', isActive: true, sortOrder: 5, creator: '系统管理员', createTime: '2025-01-10' },
  // 介入超声
  { id: 'T028', category: '介入超声', code: 'INT-PFA', name: '穿刺活检', pinyin: 'chuāncì huójiǎn', pinyinInitial: 'cchj', englishName: 'Percutaneous Biopsy', synonyms: ['活检', '穿刺'], definition: '经皮穿刺获取组织样本的诊断技术', scope: 'hospital', isActive: true, sortOrder: 1, creator: '系统管理员', createTime: '2025-01-10' },
  { id: 'T029', category: '介入超声', code: 'INT-DRN', name: '置管引流', pinyin: 'zhìguǎn yǐnliú', pinyinInitial: 'zgyldgly', englishName: 'Catheter Drainage', synonyms: ['引流', '置管'], definition: '经皮置管排出液体或脓液的微创技术', scope: 'hospital', isActive: true, sortOrder: 2, creator: '系统管理员', createTime: '2025-01-10' },
  { id: 'T030', category: '介入超声', code: 'INT-ABL', name: '消融治疗', pinyin: 'xiāoróng zhìliáo', pinyinInitial: 'xrzliaol', englishName: 'Ablation Therapy', synonyms: ['射频消融', '微波消融'], definition: '物理或化学方法毁损病变组织的治疗技术', scope: 'hospital', isActive: true, sortOrder: 3, creator: '系统管理员', createTime: '2025-01-10' },
  // 肌骨
  { id: 'T031', category: '肌骨', code: 'MSK-SHO', name: '肩关节', pinyin: 'jiān guānjié', pinyinInitial: 'jgj', englishName: 'Shoulder Joint', synonyms: ['肩袖', '肩周炎'], definition: '盂肱关节及周围软组织结构', scope: 'hospital', isActive: true, sortOrder: 1, creator: '系统管理员', createTime: '2025-01-10' },
  { id: 'T032', category: '肌骨', code: 'MSK-KNE', name: '膝关节', pinyin: 'xī guānjié', pinyinInitial: 'xgj', englishName: 'Knee Joint', synonyms: ['半月板', '交叉韧带'], definition: '人体最大最复杂的关节', scope: 'hospital', isActive: true, sortOrder: 2, creator: '系统管理员', createTime: '2025-01-10' },
  { id: 'T033', category: '肌骨', code: 'MSK-HIP', name: '髋关节', pinyin: 'kuān guānjié', pinyinInitial: 'kgj', englishName: 'Hip Joint', synonyms: ['股骨头'], definition: '髋臼与股骨头构成的球窝关节', scope: 'hospital', isActive: true, sortOrder: 3, creator: '系统管理员', createTime: '2025-01-10' },
  { id: 'T034', category: '肌骨', code: 'MSK-TND', name: '肌腱', pinyin: 'jījiàn', pinyinInitial: 'jj', englishName: 'Tendon', synonyms: ['跟腱', '肱二头肌腱'], definition: '肌肉与骨之间的致密纤维组织', scope: 'hospital', isActive: true, sortOrder: 4, creator: '系统管理员', createTime: '2025-01-10' },
  { id: 'T035', category: '肌骨', code: 'MSK-NRV', name: '外周神经', pinyin: 'wàizhōu shénjīng', pinyinInitial: 'wzsj', englishName: 'Peripheral Nerve', synonyms: ['正中神经', '尺神经', '桡神经'], definition: '外周神经系统结构，可显示神经干横断面', scope: 'hospital', isActive: true, sortOrder: 5, creator: '系统管理员', createTime: '2025-01-10' },
  // 科室共享示例
  { id: 'T036', category: '腹部', code: 'DEPT-LIV01', name: '肝硬化描述模板', pinyin: 'gānyìnghuà miáoshù múbǎn', pinyinInitial: 'gyhmsmb', englishName: 'Liver Cirrhosis Template', synonyms: [], definition: '肝硬化典型超声描述：肝脏体积缩小，形态失常，肝表面呈锯齿状，肝实质回声增粗增强，呈不均匀分布，肝内管道结构显示欠清晰', scope: 'department', isActive: true, sortOrder: 10, creator: '张建国', createTime: '2025-02-01', tags: ['描述模板'] },
  // 个人词库示例
  { id: 'T037', category: '腹部', code: 'MY-LIV01', name: '我的-肝脏常规描述', pinyin: 'wǒde-gānzāng chángguī miáoshù', pinyinInitial: 'wd-gzc.gms', englishName: '', synonyms: [], definition: '肝右叶大小正常，形态规整，肝表面光滑，肝实质回声均匀，肝内管道结构显示清晰', scope: 'personal', isActive: true, sortOrder: 1, creator: '张建国', createTime: '2025-02-01', notes: '个人常用描述模板' },
  { id: 'T038', category: '心血管', code: 'MY-HRT01', name: '我的-心脏常规描述', pinyin: 'wǒde-xīnzàng chángguī miáoshù', pinyinInitial: 'wd-xzc.gms', englishName: '', synonyms: [], definition: '房室大小正常，瓣膜形态及运动未见异常，大动脉根部不宽，心包未见异常', scope: 'personal', isActive: true, sortOrder: 1, creator: '张建国', createTime: '2025-02-01', notes: '个人常用描述模板' },
]

// 部位词典数据
const initialBodyParts: BodyPart[] = [
  // 腹部部位
  {
    id: 'BP001', category: '腹部', code: 'BP-ABD-LIV', name: '肝脏', pinyin: 'gānzāng', englishName: 'Liver',
    subParts: ['肝左叶', '肝右叶', '尾状叶', '肝门'],
    descriptors: [
      '大小正常', '体积增大', '体积缩小', '形态失常',
      '表面光滑', '表面欠光滑', '表面呈锯齿状',
      '实质回声均匀', '实质回声增粗', '实质回声增强', '实质回声不均匀',
      '肝内管道清晰', '肝内管道欠清晰', '肝内钙化灶', '肝内囊性灶',
      '肝静脉显示清晰', '门静脉内径正常', '肝动脉血流正常',
    ],
    normalRanges: [
      { measurement: '长径', normalValue: '≤15cm', unit: 'cm', note: '右叶最大斜径' },
      { measurement: '厚度', normalValue: '≤11cm', unit: 'cm', note: '右叶厚度' },
      { measurement: '门静脉内径', normalValue: '≤13mm', unit: 'mm', note: '吸气末' },
      { measurement: '肝静脉内径', normalValue: '≤10mm', unit: 'mm' },
    ],
    relatedTerms: ['T001', 'T036', 'T037'],
    scope: 'hospital', isActive: true, sortOrder: 1, creator: '系统管理员', createTime: '2025-01-10',
  },
  {
    id: 'BP002', category: '腹部', code: 'BP-ABD-GBL', name: '胆囊', pinyin: 'dānnáng', englishName: 'Gallbladder',
    subParts: ['胆囊体', '胆囊底', '胆囊颈', '胆囊管'],
    descriptors: [
      '大小正常', '胆囊增大', '胆囊缩小', '形态规则', '形态不规则',
      '壁光滑', '壁毛糙', '壁增厚', '壁薄',
      '腔内透声好', '腔内胆汁淤积', '腔内结石', '腔内息肉样病变',
      '胆囊颈部结石嵌顿', '胆囊周围积液',
    ],
    normalRanges: [
      { measurement: '长径', normalValue: '≤8cm', unit: 'cm', note: '空腹状态' },
      { measurement: '宽径', normalValue: '≤3.5cm', unit: 'cm' },
      { measurement: '壁厚', normalValue: '≤3mm', unit: 'mm', note: '空腹充盈状态' },
    ],
    relatedTerms: ['T002'],
    scope: 'hospital', isActive: true, sortOrder: 2, creator: '系统管理员', createTime: '2025-01-10',
  },
  {
    id: 'BP003', category: '腹部', code: 'BP-ABD-PAN', name: '胰腺', pinyin: 'yíxiàn', englishName: 'Pancreas',
    subParts: ['胰头', '胰体', '胰尾', '胰管'],
    descriptors: [
      '大小正常', '胰腺增大', '胰腺萎缩', '形态规则', '形态失常',
      '回声均匀', '回声增粗', '回声减低', '回声不均匀',
      '胰管不扩张', '胰管扩张', '胰管内结石',
      '胰腺占位', '胰腺钙化', '胰腺周围渗出',
    ],
    normalRanges: [
      { measurement: '胰头厚度', normalValue: '≤2.5cm', unit: 'cm' },
      { measurement: '胰体厚度', normalValue: '≤2.0cm', unit: 'cm' },
      { measurement: '胰尾厚度', normalValue: '≤2.5cm', unit: 'cm' },
      { measurement: '胰管内径', normalValue: '≤2mm', unit: 'mm' },
    ],
    relatedTerms: ['T003'],
    scope: 'hospital', isActive: true, sortOrder: 3, creator: '系统管理员', createTime: '2025-01-10',
  },
  {
    id: 'BP004', category: '腹部', code: 'BP-ABD-SPL', name: '脾脏', pinyin: 'pízāng', englishName: 'Spleen',
    subParts: ['脾上极', '脾下极', '脾门', '脾血管'],
    descriptors: [
      '大小正常', '脾大', '脾缩小', '形态规则', '形态失常',
      '包膜光滑', '包膜不光整', '包膜增厚',
      '实质回声均匀', '实质回声增粗', '实质回声减低',
      '脾门静脉曲张', '脾内钙化灶', '脾内囊性灶', '脾内实性占位',
    ],
    normalRanges: [
      { measurement: '长径', normalValue: '≤12cm', unit: 'cm' },
      { measurement: '厚径', normalValue: '≤4cm', unit: 'cm' },
      { measurement: '脾静脉内径', normalValue: '≤8mm', unit: 'mm' },
    ],
    relatedTerms: ['T004'],
    scope: 'hospital', isActive: true, sortOrder: 4, creator: '系统管理员', createTime: '2025-01-10',
  },
  {
    id: 'BP005', category: '腹部', code: 'BP-ABD-KID', name: '肾脏', pinyin: 'shènzāng', englishName: 'Kidney',
    subParts: ['肾皮质', '肾髓质', '肾盂', '肾门'],
    descriptors: [
      '大小正常', '双肾增大', '单肾增大', '双肾缩小', '肾脏萎缩',
      '形态规则', '形态失常', '轮廓清晰', '轮廓不清晰',
      '皮髓质分界清', '皮髓质分界模糊', '肾实质回声正常', '肾实质回声改变',
      '肾盂无扩张', '肾盂扩张', '肾盂分离', '肾结石', '肾钙化',
      '肾囊肿', '肾肿瘤', '肾周无积液', '肾周积液',
    ],
    normalRanges: [
      { measurement: '长径', normalValue: '10-12cm', unit: 'cm' },
      { measurement: '宽径', normalValue: '5-6cm', unit: 'cm' },
      { measurement: '厚径', normalValue: '3-4cm', unit: 'cm' },
      { measurement: '肾盂分离', normalValue: '≤10mm', unit: 'mm', note: '无肾盂肾炎时' },
    ],
    relatedTerms: ['T005'],
    scope: 'hospital', isActive: true, sortOrder: 5, creator: '系统管理员', createTime: '2025-01-10',
  },
  // 心血管部位
  {
    id: 'BP006', category: '心血管', code: 'BP-CV-HRT', name: '心脏', pinyin: 'xīnzàng', englishName: 'Heart',
    subParts: ['左心房', '左心室', '右心房', '右心室', '室间隔', '房间隔'],
    descriptors: [
      '房室大小正常', '左心房增大', '左心室增大', '右心房增大', '右心室增大',
      '室壁厚度正常', '室壁增厚', '室壁运动减弱', '室壁运动异常',
      '瓣膜形态正常', '瓣膜增厚', '瓣膜钙化', '瓣膜狭窄', '瓣膜反流',
      '心包无异常', '心包积液', '心包增厚',
      'EF值正常', 'FS值正常', 'E/A值正常',
    ],
    normalRanges: [
      { measurement: '左室舒张末径', normalValue: '35-55mm', unit: 'mm' },
      { measurement: '左房内径', normalValue: '25-40mm', unit: 'mm' },
      { measurement: '右室内径', normalValue: '20-30mm', unit: 'mm' },
      { measurement: '右房内径', normalValue: '30-45mm', unit: 'mm' },
      { measurement: '室间隔厚度', normalValue: '6-11mm', unit: 'mm' },
      { measurement: 'EF值', normalValue: '≥50%', unit: '%' },
      { measurement: 'FS值', normalValue: '≥25%', unit: '%' },
    ],
    relatedTerms: ['T016', 'T038'],
    scope: 'hospital', isActive: true, sortOrder: 1, creator: '系统管理员', createTime: '2025-01-10',
  },
  {
    id: 'BP007', category: '心血管', code: 'BP-CV-CAR', name: '颈动脉', pinyin: 'jǐngdòngmài', englishName: 'Carotid Artery',
    subParts: ['颈总动脉', '颈内动脉', '颈外动脉', '颈动脉分叉'],
    descriptors: [
      '内-中膜厚度正常', '内-中膜增厚', 'IMT增厚', '斑块形成',
      '斑块类型：硬斑', '斑块类型：软斑', '斑块类型：混合斑',
      '管腔无狭窄', '管腔轻度狭窄', '管腔中度狭窄', '管腔重度狭窄',
      '血流速度正常', '血流速度加快', '五彩镶嵌血流',
    ],
    normalRanges: [
      { measurement: 'CCA-IMT', normalValue: '≤1.0mm', unit: 'mm' },
      { measurement: 'ICA-PSV', normalValue: '<125cm/s', unit: 'cm/s' },
      { measurement: 'ICA-EDV', normalValue: '<40cm/s', unit: 'cm/s' },
    ],
    relatedTerms: ['T020'],
    scope: 'hospital', isActive: true, sortOrder: 2, creator: '系统管理员', createTime: '2025-01-10',
  },
  // 浅表器官部位
  {
    id: 'BP008', category: '浅表器官', code: 'BP-SUP-THY', name: '甲状腺', pinyin: 'jiǎzhuàngxiàn', englishName: 'Thyroid',
    subParts: ['左叶', '右叶', '峡部', '锥状叶'],
    descriptors: [
      '大小正常', '甲状腺增大', '甲状腺缩小', '单侧增大', '峡部增厚',
      '形态规则', '形态失常', '轮廓清晰', '轮廓不清晰',
      '回声均匀', '回声不均匀', '回声减低', '回声增高',
      '血流信号正常', '血流信号丰富', '血流信号减少',
      '结节描述：边界清', '结节描述：边界不清', '结节描述：形态规则', '结节描述：形态不规则',
      '结节描述：纵横比>1', '结节描述：微钙化', '结节描述：粗大钙化', '结节描述：环形钙化',
    ],
    normalRanges: [
      { measurement: '左右径', normalValue: '40-50mm', unit: 'mm' },
      { measurement: '前后径', normalValue: '10-20mm', unit: 'mm' },
      { measurement: '峡部厚度', normalValue: '≤3mm', unit: 'mm' },
      { measurement: '体积', normalValue: '≤20ml', unit: 'ml' },
    ],
    relatedTerms: ['T010'],
    scope: 'hospital', isActive: true, sortOrder: 1, creator: '系统管理员', createTime: '2025-01-10',
  },
  {
    id: 'BP009', category: '浅表器官', code: 'BP-SUP-BRS', name: '乳腺', pinyin: 'rǔxiàn', englishName: 'Breast',
    subParts: ['导管系统', '腺体层', '脂肪层', 'Cooper韧带'],
    descriptors: [
      '腺体层厚度正常', '腺体层增厚', '腺体层萎缩',
      '回声均匀', '回声不均匀', '导管扩张', '导管内透声不良',
      '未见明显占位', '低回声结节', '中等回声结节', '高回声结节',
      '结节描述：边界清晰', '结节描述：边界模糊', '结节描述：形态规则', '结节描述：形态不规则',
      '结节描述：有血流', '结节描述：无血流', '结节描述：未见明显血流',
      'BI-RADS分类', '钙化描述：粗大钙化', '钙化描述：微小钙化', '钙化描述：簇状钙化',
    ],
    normalRanges: [
      { measurement: '腺体层厚度', normalValue: '10-20mm', unit: 'mm' },
    ],
    relatedTerms: ['T011'],
    scope: 'hospital', isActive: true, sortOrder: 2, creator: '系统管理员', createTime: '2025-01-10',
  },
  // 妇产部位
  {
    id: 'BP010', category: '妇产', code: 'BP-OB-UT', name: '子宫', pinyin: 'zǐgōng', englishName: 'Uterus',
    subParts: ['宫体', '宫颈', '子宫内膜', '子宫肌层'],
    descriptors: [
      '子宫大小正常', '子宫增大', '子宫缩小', '前位', '后位', '水平位',
      '肌层回声均匀', '肌层回声不均', '肌层钙化', '肌层肌瘤',
      '宫颈形态正常', '宫颈增厚', '宫颈囊肿', '宫颈占位',
      '子宫内膜厚度正常', '内膜增厚', '内膜薄', '宫腔积液', '宫腔分离',
      '未见明显异常', '占位性病变',
    ],
    normalRanges: [
      { measurement: '宫体长径', normalValue: '55-80mm', unit: 'mm' },
      { measurement: '宫体横径', normalValue: '40-50mm', unit: 'mm' },
      { measurement: '前后径', normalValue: '30-40mm', unit: 'mm' },
      { measurement: '宫颈长度', normalValue: '25-35mm', unit: 'mm' },
      { measurement: '内膜厚度', normalValue: '<5mm（绝经后）', unit: 'mm', note: '绝经前随月经周期变化' },
    ],
    relatedTerms: ['T023'],
    scope: 'hospital', isActive: true, sortOrder: 1, creator: '系统管理员', createTime: '2025-01-10',
  },
  {
    id: 'BP011', category: '妇产', code: 'BP-OB-OV', name: '卵巢', pinyin: 'luǎncháo', englishName: 'Ovary',
    subParts: ['左卵巢', '右卵巢', '卵泡', '黄体'],
    descriptors: [
      '双侧卵巢大小正常', '卵巢增大', '卵巢缩小', '单侧增大',
      '卵巢内未见明显占位', '卵巢囊肿', '卵巢实性占位',
      '卵泡数量正常', '卵泡数量增多', '优势卵泡',
      '黄体囊肿', '黄体血肿',
      '血流信号正常', '血流信号丰富', 'RI值正常', 'RI值减低',
      'PCO样改变', '卵巢多囊样改变',
    ],
    normalRanges: [
      { measurement: '卵巢长径', normalValue: '25-35mm', unit: 'mm' },
      { measurement: '卵巢体积', normalValue: '<10ml', unit: 'ml' },
      { measurement: '窦卵泡数', normalValue: '<12个', unit: '个', note: '双侧之和' },
    ],
    relatedTerms: ['T024'],
    scope: 'hospital', isActive: true, sortOrder: 2, creator: '系统管理员', createTime: '2025-01-10',
  },
  // 肌骨部位
  {
    id: 'BP012', category: '肌骨', code: 'BP-MSK-KNE', name: '膝关节', pinyin: 'xī guānjié', englishName: 'Knee Joint',
    subParts: ['股骨外侧髁', '股骨内侧髁', '胫骨平台', '髌骨', '半月板', '前后交叉韧带'],
    descriptors: [
      '关节腔无积液', '关节腔积液', '滑膜增厚', '滑膜炎症',
      '半月板形态正常', '半月板退变', '半月板撕裂', '半月板囊肿',
      '韧带形态正常', '韧带肿胀', '韧带撕裂', 'ACL断裂', 'PCL断裂',
      '软骨厚度正常', '软骨变薄', '软骨缺损', '软骨下骨改变',
      '腘窝囊肿', 'Baker囊肿',
    ],
    normalRanges: [
      { measurement: '关节腔积液深度', normalValue: '<4mm', unit: 'mm' },
      { measurement: '髌上囊积液', normalValue: '<4mm', unit: 'mm' },
    ],
    relatedTerms: ['T032'],
    scope: 'hospital', isActive: true, sortOrder: 1, creator: '系统管理员', createTime: '2025-01-10',
  },
]

// 报告词库短语
const initialPhrases: ReportPhrase[] = [
  // 腹部常规
  { id: 'P001', category: '腹部', examType: '腹部常规', phrase: '肝右叶大小、形态正常，肝表面光滑，肝实质回声均匀，肝内管道结构显示清晰。', useCount: 856, isPreset: true, scope: 'hospital', isActive: true, sortOrder: 1, creator: '系统管理员', createTime: '2025-01-10' },
  { id: 'P002', category: '腹部', examType: '腹部常规', phrase: '胆囊形态、大小正常，壁薄光滑，腔内透声好。', useCount: 782, isPreset: true, scope: 'hospital', isActive: true, sortOrder: 2, creator: '系统管理员', createTime: '2025-01-10' },
  { id: 'P003', category: '腹部', examType: '腹部常规', phrase: '胰腺形态、大小正常，回声均匀，胰管无扩张。', useCount: 634, isPreset: true, scope: 'hospital', isActive: true, sortOrder: 3, creator: '系统管理员', createTime: '2025-01-10' },
  { id: 'P004', category: '腹部', examType: '腹部常规', phrase: '脾脏大小、形态正常，实质回声均匀。', useCount: 598, isPreset: true, scope: 'hospital', isActive: true, sortOrder: 4, creator: '系统管理员', createTime: '2025-01-10' },
  { id: 'P005', category: '腹部', examType: '腹部常规', phrase: '双肾大小、形态正常，皮髓质分界清，集合系统无分离。', useCount: 712, isPreset: true, scope: 'hospital', isActive: true, sortOrder: 5, creator: '系统管理员', createTime: '2025-01-10' },
  { id: 'P006', category: '腹部', examType: '腹部常规', phrase: '腹膜后未见明显肿大淋巴结。', useCount: 445, isPreset: true, scope: 'hospital', isActive: true, sortOrder: 6, creator: '系统管理员', createTime: '2025-01-10' },
  { id: 'P007', category: '腹部', examType: '腹部常规', phrase: '肝脏体积增大，形态失常，肝表面呈锯齿状，肝实质回声增粗增强，呈不均匀分布，肝内管道结构显示欠清晰。', useCount: 320, isPreset: true, scope: 'hospital', isActive: true, sortOrder: 7, creator: '系统管理员', createTime: '2025-01-10' },
  { id: 'P008', category: '腹部', examType: '腹部常规', phrase: '胆囊壁增厚，壁毛糙，腔内透声差，内可见结石样强回声，后方伴声影。', useCount: 289, isPreset: true, scope: 'hospital', isActive: true, sortOrder: 8, creator: '系统管理员', createTime: '2025-01-10' },
  // 甲状腺
  { id: 'P009', category: '浅表器官', examType: '甲状腺常规', phrase: '甲状腺左右叶大小、形态正常，实质回声均匀，血流信号分布正常。', useCount: 698, isPreset: true, scope: 'hospital', isActive: true, sortOrder: 1, creator: '系统管理员', createTime: '2025-01-10' },
  { id: 'P010', category: '浅表器官', examType: '甲状腺常规', phrase: '甲状腺右叶/左叶内见低回声/中等回声结节，边界清/不清，形态规则/不规则，内部回声均匀/不均匀，CDFI可见/未见明显血流信号。', useCount: 534, isPreset: true, scope: 'hospital', isActive: true, sortOrder: 2, creator: '系统管理员', createTime: '2025-01-10' },
  { id: 'P011', category: '浅表器官', examType: '甲状腺常规', phrase: '甲状腺峡部不增厚。', useCount: 312, isPreset: true, scope: 'hospital', isActive: true, sortOrder: 3, creator: '系统管理员', createTime: '2025-01-10' },
  // 乳腺
  { id: 'P012', category: '浅表器官', examType: '乳腺常规', phrase: '双侧乳腺腺体层厚度正常，回声不均匀，呈豹皮样改变。', useCount: 445, isPreset: true, scope: 'hospital', isActive: true, sortOrder: 1, creator: '系统管理员', createTime: '2025-01-10' },
  { id: 'P013', category: '浅表器官', examType: '乳腺常规', phrase: '左/右侧乳腺*点钟方向距乳头*cm处见低回声结节，大小约*×*cm，边界清，形态规则，内回声均匀，CDFI未见明显血流信号。', useCount: 389, isPreset: true, scope: 'hospital', isActive: true, sortOrder: 2, creator: '系统管理员', createTime: '2025-01-10' },
  // 心脏
  { id: 'P014', category: '心血管', examType: '心脏常规', phrase: '心脏各房室大小正常。室间隔及左室壁厚度正常。静息状态下未见明显节段性室壁运动异常。', useCount: 623, isPreset: true, scope: 'hospital', isActive: true, sortOrder: 1, creator: '系统管理员', createTime: '2025-01-10' },
  { id: 'P015', category: '心血管', examType: '心脏常规', phrase: '各瓣膜形态、回声、启闭运动未见明显异常。', useCount: 578, isPreset: true, scope: 'hospital', isActive: true, sortOrder: 2, creator: '系统管理员', createTime: '2025-01-10' },
  { id: 'P016', category: '心血管', examType: '心脏常规', phrase: '大动脉根部宽度正常。肺动脉不宽。', useCount: 412, isPreset: true, scope: 'hospital', isActive: true, sortOrder: 3, creator: '系统管理员', createTime: '2025-01-10' },
  { id: 'P017', category: '心血管', examType: '心脏常规', phrase: '心包未见异常。', useCount: 398, isPreset: true, scope: 'hospital', isActive: true, sortOrder: 4, creator: '系统管理员', createTime: '2025-01-10' },
  { id: 'P018', category: '心血管', examType: '心脏常规', phrase: '左室舒张功能减低，收缩功能正常。', useCount: 345, isPreset: true, scope: 'hospital', isActive: true, sortOrder: 5, creator: '系统管理员', createTime: '2025-01-10' },
  // 妇产
  { id: 'P019', category: '妇产', examType: '妇科常规', phrase: '子宫前位/后位，大小约**cm，形态规则，肌层回声均匀，内膜厚度cm，宫颈形态正常。', useCount: 534, isPreset: true, scope: 'hospital', isActive: true, sortOrder: 1, creator: '系统管理员', createTime: '2025-01-10' },
  { id: 'P020', category: '妇产', examType: '妇科常规', phrase: '双侧卵巢大小、形态正常，附件区未见明显异常回声。', useCount: 489, isPreset: true, scope: 'hospital', isActive: true, sortOrder: 2, creator: '系统管理员', createTime: '2025-01-10' },
  { id: 'P021', category: '妇产', examType: '早孕', phrase: '子宫增大，宫内可见妊娠囊回声，大小约**mm，囊内可见胚芽及心管搏动。', useCount: 678, isPreset: true, scope: 'hospital', isActive: true, sortOrder: 1, creator: '系统管理员', createTime: '2025-01-10' },
  { id: 'P022', category: '妇产', examType: '中晚孕', phrase: '胎儿双顶径**mm，头围**mm，腹围**mm，股骨长**mm，羊水深度**mm，胎盘位于**壁，成熟度**级。', useCount: 612, isPreset: true, scope: 'hospital', isActive: true, sortOrder: 1, creator: '系统管理员', createTime: '2025-01-10' },
  // 介入
  { id: 'P023', category: '介入超声', examType: '穿刺活检', phrase: '患者取仰卧位/俯卧位/左侧卧位，常规消毒铺巾，2%利多卡因局部麻醉，在超声引导下**探头定位，使用**G穿刺针，经皮穿刺至**部位，取出组织条**条，送病理检查。过程顺利，患者未诉明显不适。', useCount: 234, isPreset: true, scope: 'hospital', isActive: true, sortOrder: 1, creator: '系统管理员', createTime: '2025-01-10' },
  { id: 'P024', category: '介入超声', examType: '置管引流', phrase: '超声引导下将引流管置入**腔内，抽出**ml**性液体，留取标本送检，固定引流管，接引流袋。操作顺利，术后患者无不适。', useCount: 189, isPreset: true, scope: 'hospital', isActive: true, sortOrder: 1, creator: '系统管理员', createTime: '2025-01-10' },
  // 肌骨
  { id: 'P025', category: '肌骨', examType: '关节常规', phrase: '关节腔内未见明显积液。', useCount: 345, isPreset: true, scope: 'hospital', isActive: true, sortOrder: 1, creator: '系统管理员', createTime: '2025-01-10' },
  { id: 'P026', category: '肌骨', examType: '关节常规', phrase: '半月板形态尚可，内可见**信号改变，符合**度退变。', useCount: 289, isPreset: true, scope: 'hospital', isActive: true, sortOrder: 2, creator: '系统管理员', createTime: '2025-01-10' },
  { id: 'P027', category: '肌骨', examType: '关节常规', phrase: '韧带走形正常/欠正常，连续性存在/中断，张力减低/消失。', useCount: 267, isPreset: true, scope: 'hospital', isActive: true, sortOrder: 3, creator: '系统管理员', createTime: '2025-01-10' },
]

// 超声亚专业分类列表
const categories: UltrasoundCategory[] = ['腹部', '浅表器官', '心血管', '妇产', '介入超声', '肌骨']

// 检查类型列表（按专业）
const examTypesByCategory: Record<UltrasoundCategory, string[]> = {
  '腹部': ['腹部常规', '肝脏', '胆囊', '胰腺', '脾脏', '肾脏', '胃肠道', '阑尾', '腹膜后'],
  '浅表器官': ['甲状腺', '乳腺', '唾液腺', '淋巴结', '阴囊', '浅表肿物', '甲状腺穿刺'],
  '心血管': ['心脏常规', '心脏功能', '颈部血管', '四肢血管', '腹部大血管', '经食道超声'],
  '妇产': ['妇科常规', '早孕', '中晚孕', '产科常规', '阴道超声', '卵泡监测', '输卵管造影'],
  '介入超声': ['穿刺活检', '置管引流', '消融治疗', '囊肿硬化', '脓肿引流', '假性动脉瘤栓塞'],
  '肌骨': ['关节常规', '肩关节', '膝关节', '髋关节', '踝关节', '腕关节', '肌腱', '外周神经'],
}

// ==================== 工具函数 ====================

// 拼音首字母匹配
const matchPinyin = (text: string, kw: string): boolean => {
  if (!text) return false
  const t = text.toLowerCase()
  const k = kw.toLowerCase()
  if (t.includes(k)) return true
  // 匹配拼音首字母
  const initials = t.split(' ').map(w => w[0]).join('')
  return initials.includes(k) || initials.startsWith(k)
}

// 搜索匹配
const matchTerm = (t: TermItem, kw: string): boolean => {
  if (!kw) return true
  const k = kw.toLowerCase()
  return (
    t.name.toLowerCase().includes(k) ||
    t.code.toLowerCase().includes(k) ||
    (t.pinyin ?? '').toLowerCase().includes(k) ||
    (t.pinyinInitial ?? '').toLowerCase().includes(k) ||
    (t.englishName ?? '').toLowerCase().includes(k) ||
    (t.definition ?? '').toLowerCase().includes(k) ||
    (t.synonyms ?? []).some(s => s.toLowerCase().includes(k))
  )
}

// 生成唯一ID
const genId = (prefix = 'ID') => prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)

// ==================== 空对象工厂 ====================
const emptyTerm = (): Partial<TermItem> => ({
  category: '腹部',
  code: '', name: '', pinyin: '', pinyinInitial: '', englishName: '',
  synonyms: [], definition: '', scope: 'personal', isActive: true,
  sortOrder: 0, notes: '', tags: [],
})

const emptyBodyPart = (): Partial<BodyPart> => ({
  category: '腹部', code: '', name: '', pinyin: '', englishName: '',
  subParts: [], descriptors: [], normalRanges: [], relatedTerms: [],
  scope: 'personal', isActive: true, sortOrder: 0,
})

const emptyPhrase = (): Partial<ReportPhrase> => ({
  category: '腹部', examType: '腹部常规', phrase: '', useCount: 0,
  isPreset: false, scope: 'personal', isActive: true, sortOrder: 0,
})

// ==================== 校验函数 ====================
const validateTerm = (t: Partial<TermItem>): string[] => {
  const errs: string[] = []
  if (!t.category?.trim()) errs.push('分类不能为空')
  if (!t.code?.trim()) errs.push('编码不能为空')
  if (!t.name?.trim()) errs.push('名称不能为空')
  if (t.sortOrder !== undefined && t.sortOrder < 0) errs.push('排序号不能为负数')
  return errs
}

const validateBodyPart = (b: Partial<BodyPart>): string[] => {
  const errs: string[] = []
  if (!b.category?.trim()) errs.push('分类不能为空')
  if (!b.code?.trim()) errs.push('编码不能为空')
  if (!b.name?.trim()) errs.push('部位名称不能为空')
  return errs
}

const validatePhrase = (p: Partial<ReportPhrase>): string[] => {
  const errs: string[] = []
  if (!p.category?.trim()) errs.push('分类不能为空')
  if (!p.examType?.trim()) errs.push('检查类型不能为空')
  if (!p.phrase?.trim()) errs.push('短语内容不能为空')
  return errs
}

// ==================== 主组件 ====================
export default function TermLibraryPage() {
  // 词库标签页
  const [activeTab, setActiveTab] = useState<'terms' | 'bodyparts' | 'phrases'>('terms')
  // 三级词库范围
  const [scopeFilter, setScopeFilter] = useState<'all' | ScopeLevel>('all')
  // 搜索
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  // 分页
  const [page, setPage] = useState(1)
  const pageSize = 10

  // 弹窗
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'delete' | 'import' | null>(null)
  const [editingTerm, setEditingTerm] = useState<Partial<TermItem>>(emptyTerm())
  const [editingBodyPart, setEditingBodyPart] = useState<Partial<BodyPart>>(emptyBodyPart())
  const [editingPhrase, setEditingPhrase] = useState<Partial<ReportPhrase>>(emptyPhrase())
  const [formErrors, setFormErrors] = useState<string[]>([])
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'term' | 'bodypart' | 'phrase'; item: any } | null>(null)

  // 联想输入
  const [suggestions, setSuggestions] = useState<TermItem[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestionActive, setSuggestionActive] = useState(-1)
  const searchRef = useRef<HTMLDivElement>(null)

  // 部位词典侧边栏选中
  const [selectedBodyPart, setSelectedBodyPart] = useState<BodyPart | null>(null)
  const [bodyPartCategory, setBodyPartCategory] = useState('')

  // 报告短语筛选
  const [phraseCategoryFilter, setPhraseCategoryFilter] = useState('')
  const [phraseExamTypeFilter, setPhraseExamTypeFilter] = useState('')

  // 数据状态
  const [terms, setTerms] = useState<TermItem[]>(initialTerms)
  const [bodyParts, setBodyParts] = useState<BodyPart[]>(initialBodyParts)
  const [phrases, setPhrases] = useState<ReportPhrase[]>(initialPhrases)

  // 导入状态
  const [importing, setImporting] = useState(false)
  const [importStep, setImportStep] = useState(1)
  const [importFile, setImportFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 关闭联想下拉
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // ==================== 过滤逻辑 ====================

  // 术语过滤
  const filteredTerms = useMemo(() => {
    return terms.filter(t => {
      const matchSearch = matchTerm(t, search.trim())
      const matchCategory = !categoryFilter || t.category === categoryFilter
      const matchScope = scopeFilter === 'all' || t.scope === scopeFilter
      return matchSearch && matchCategory && matchScope
    })
  }, [terms, search, categoryFilter, scopeFilter])

  // 联想匹配（全局搜索，不受当前筛选影响）
  const allSuggestions = useMemo(() => {
    if (!search.trim()) return []
    const kw = search.trim().toLowerCase()
    return terms.filter(t =>
      t.isActive && (
        t.name.toLowerCase().includes(kw) ||
        (t.pinyin ?? '').toLowerCase().includes(kw) ||
        (t.pinyinInitial ?? '').toLowerCase().includes(kw) ||
        (t.englishName ?? '').toLowerCase().includes(kw) ||
        (t.synonyms ?? []).some(s => s.toLowerCase().includes(kw))
      )
    ).slice(0, 8)
  }, [terms, search])

  // 部位词典过滤
  const filteredBodyParts = useMemo(() => {
    return bodyParts.filter(bp => {
      const matchSearch = !search.trim() ||
        bp.name.toLowerCase().includes(search.toLowerCase()) ||
        (bp.pinyin ?? '').toLowerCase().includes(search.toLowerCase())
      const matchCategory = !bodyPartCategory || bp.category === bodyPartCategory
      const matchScope = scopeFilter === 'all' || bp.scope === scopeFilter
      return matchSearch && matchCategory && matchScope
    })
  }, [bodyParts, search, bodyPartCategory, scopeFilter])

  // 短语过滤
  const filteredPhrases = useMemo(() => {
    return phrases.filter(p => {
      const matchSearch = !search.trim() ||
        p.phrase.toLowerCase().includes(search.toLowerCase()) ||
        (p.pinyin ?? '').toLowerCase().includes(search.toLowerCase())
      const matchCategory = !phraseCategoryFilter || p.category === phraseCategoryFilter
      const matchExamType = !phraseExamTypeFilter || p.examType === phraseExamTypeFilter
      const matchScope = scopeFilter === 'all' || p.scope === scopeFilter
      return matchSearch && matchCategory && matchExamType && matchScope
    })
  }, [phrases, search, phraseCategoryFilter, phraseExamTypeFilter, scopeFilter])

  // 分页
  const totalPages = Math.max(1, Math.ceil(filteredTerms.length / pageSize))
  const paged = filteredTerms.slice((page - 1) * pageSize, page * pageSize)

  const phrasePageSize = 8
  const phraseTotalPages = Math.max(1, Math.ceil(filteredPhrases.length / phrasePageSize))
  const phrasePaged = filteredPhrases.slice(0, phrasePageSize * 1) // 暂时用全部

  // 统计
  const stats = useMemo(() => {
    const total = terms.length
    const hospital = terms.filter(t => t.scope === 'hospital').length
    const department = terms.filter(t => t.scope === 'department').length
    const personal = terms.filter(t => t.scope === 'personal').length
    return { total, hospital, department, personal, catCount: categories.length, bpCount: bodyParts.length, phraseCount: phrases.length }
  }, [terms, bodyParts, phrases])

  // ==================== 操作函数 ====================

  const resetFilters = () => {
    setSearch('')
    setCategoryFilter('')
    setScopeFilter('all')
    setPage(1)
    setPhraseCategoryFilter('')
    setPhraseExamTypeFilter('')
    setBodyPartCategory('')
  }

  const openAddTerm = () => { setEditingTerm(emptyTerm()); setFormErrors([]); setModalMode('add') }
  const openEditTerm = (t: TermItem) => { setEditingTerm({ ...t }); setFormErrors([]); setModalMode('edit') }
  const openDeleteTerm = (t: TermItem) => { setDeleteTarget({ type: 'term', item: t }); setModalMode('delete') }

  const openAddBodyPart = () => { setEditingBodyPart(emptyBodyPart()); setFormErrors([]); setModalMode('add') }
  const openEditBodyPart = (bp: BodyPart) => { setEditingBodyPart({ ...bp }); setFormErrors([]); setModalMode('edit') }
  const openDeleteBodyPart = (bp: BodyPart) => { setDeleteTarget({ type: 'bodypart', item: bp }); setModalMode('delete') }

  const openAddPhrase = () => { setEditingPhrase(emptyPhrase()); setFormErrors([]); setModalMode('add') }
  const openEditPhrase = (p: ReportPhrase) => { setEditingPhrase({ ...p }); setFormErrors([]); setModalMode('edit') }
  const openDeletePhrase = (p: ReportPhrase) => { setDeleteTarget({ type: 'phrase', item: p }); setModalMode('delete') }

  const closeModal = () => { setModalMode(null); setDeleteTarget(null); setFormErrors([]) }

  const handleSubmit = () => {
    if (modalMode === 'delete' && deleteTarget) {
      if (deleteTarget.type === 'term') {
        setTerms(prev => prev.filter(t => t.id !== deleteTarget.item.id))
      } else if (deleteTarget.type === 'bodypart') {
        setBodyParts(prev => prev.filter(bp => bp.id !== deleteTarget.item.id))
        if (selectedBodyPart?.id === deleteTarget.item.id) setSelectedBodyPart(null)
      } else if (deleteTarget.type === 'phrase') {
        setPhrases(prev => prev.filter(p => p.id !== deleteTarget.item.id))
      }
      closeModal()
      return
    }

    if (modalMode === 'add' || modalMode === 'edit') {
      if (activeTab === 'terms') {
        const errs = validateTerm(editingTerm)
        if (errs.length > 0) { setFormErrors(errs); return }
        if (modalMode === 'add') {
          const id = genId('T')
          setTerms(prev => [{ ...editingTerm, id, creator: '张建国', createTime: new Date().toISOString().slice(0, 10) } as TermItem, ...prev])
        } else {
          setTerms(prev => prev.map(t => t.id === editingTerm.id ? { ...t, ...editingTerm } as TermItem : t))
        }
      } else if (activeTab === 'bodyparts') {
        const errs = validateBodyPart(editingBodyPart)
        if (errs.length > 0) { setFormErrors(errs); return }
        if (modalMode === 'add') {
          const id = genId('BP')
          setBodyParts(prev => [{ ...editingBodyPart, id, creator: '张建国', createTime: new Date().toISOString().slice(0, 10) } as BodyPart, ...prev])
        } else {
          setBodyParts(prev => prev.map(bp => bp.id === editingBodyPart.id ? { ...bp, ...editingBodyPart } as BodyPart : bp))
        }
      } else if (activeTab === 'phrases') {
        const errs = validatePhrase(editingPhrase)
        if (errs.length > 0) { setFormErrors(errs); return }
        if (modalMode === 'add') {
          const id = genId('P')
          setPhrases(prev => [{ ...editingPhrase, id, creator: '张建国', createTime: new Date().toISOString().slice(0, 10) } as ReportPhrase, ...prev])
        } else {
          setPhrases(prev => prev.map(p => p.id === editingPhrase.id ? { ...p, ...editingPhrase } as ReportPhrase : p))
        }
      }
      closeModal()
    }
  }

  const handleCopyToPersonal = (t: TermItem) => {
    const id = genId('MY-')
    setTerms(prev => [{
      ...t, id, scope: 'personal' as ScopeLevel,
      code: 'MY-' + t.code, name: '我的-' + t.name,
      creator: '张建国', createTime: new Date().toISOString().slice(0, 10),
      notes: '从共享词库复制',
    } as TermItem, ...prev])
  }

  // 联想输入处理
  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
    if (value.trim()) {
      setSuggestions(allSuggestions)
      setShowSuggestions(true)
      setSuggestionActive(-1)
    } else {
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (t: TermItem) => {
    setSearch(t.name)
    setShowSuggestions(false)
    setPage(1)
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSuggestionActive(prev => Math.min(prev + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSuggestionActive(prev => Math.max(prev - 1, -1))
    } else if (e.key === 'Enter' && suggestionActive >= 0) {
      e.preventDefault()
      handleSuggestionClick(suggestions[suggestionActive])
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  // 导入导出Excel（模拟）
  const handleExport = () => {
    const data = activeTab === 'terms' ? filteredTerms
      : activeTab === 'bodyparts' ? filteredBodyParts
      : filteredPhrases
    const filename = activeTab === 'terms' ? '超声术语词库'
      : activeTab === 'bodyparts' ? '部位词典'
      : '报告词库'
    // 模拟导出提示
    alert(`已导出 ${data.length} 条${filename}数据到 Excel 文件。\n(实际场景将触发文件下载)`)
  }

  const handleImportClick = () => {
    setImportStep(1)
    setImportFile(null)
    setImporting(true)
    setModalMode('import')
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImportFile(file)
      setImportStep(2)
    }
  }

  const handleImportConfirm = () => {
    // 模拟导入
    setImportStep(3)
    setTimeout(() => {
      setImporting(false)
      setModalMode(null)
      alert(`导入成功！已导入 ${Math.floor(Math.random() * 50 + 10)} 条数据。`)
    }, 1000)
  }

  const getScopeLabel = (scope: ScopeLevel) => scopeLabels[scope] || scope

  // ==================== 渲染辅助 ====================
  const renderScopeBadge = (scope: ScopeLevel) => (
    <span style={{ ...s.scopeTag, ...scopeColors[scope] }}>
      {scope === 'personal' ? '个人' : scope === 'department' ? '科室' : '全院'}
    </span>
  )

  const renderCategoryBadge = (cat: string) => (
    <span style={{ ...s.badgeCat, ...categoryColors[cat as UltrasoundCategory] }}>
      {cat}
    </span>
  )

  const renderActiveBadge = (active: boolean) => (
    <span style={{ ...s.badge, ...(active ? s.badgeActive : s.badgeInactive) }}>
      {active ? '启用' : '停用'}
    </span>
  )

  const maxUseCount = Math.max(...phrases.map(p => p.useCount), 1)

  // ==================== 部位词典侧边栏 ====================
  const renderBodyPartSidebar = () => {
    const grouped = categories.reduce((acc, cat) => {
      const items = filteredBodyParts.filter(bp => bp.category === cat)
      if (items.length > 0) acc[cat] = items
      return acc
    }, {} as Record<string, BodyPart[]>)

    return (
      <div style={s.sidebar}>
        <div style={s.sidebarHeader}>
          <span style={s.sidebarTitle}>部位词典</span>
          <button style={s.btnSm} onClick={openAddBodyPart}><Plus size={12} />新增</button>
        </div>
        <div style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0' }}>
          <select style={{ ...s.select, fontSize: 12, minHeight: 36 }} value={bodyPartCategory} onChange={e => setBodyPartCategory(e.target.value)}>
            <option value="">全部分类</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div style={s.sidebarBody}>
          {Object.entries(grouped).map(([cat, items]) => (
            <div key={cat}>
              <div style={s.sidebarSection}>{cat}</div>
              {items.map(bp => (
                <div
                  key={bp.id}
                  style={{
                    ...s.sidebarItem,
                    ...(selectedBodyPart?.id === bp.id ? s.sidebarItemActive : {}),
                  }}
                  onClick={() => setSelectedBodyPart(bp)}
                >
                  <FolderTree size={13} color={selectedBodyPart?.id === bp.id ? '#1d4ed8' : '#94a3b8'} />
                  <span style={{ flex: 1 }}>{bp.name}</span>
                  {renderScopeBadge(bp.scope)}
                </div>
              ))}
            </div>
          ))}
          {Object.keys(grouped).length === 0 && (
            <div style={{ padding: 20, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
              暂无部位数据
            </div>
          )}
        </div>
      </div>
    )
  }

  // ==================== 部位词典详情 ====================
  const renderBodyPartDetail = () => {
    if (!selectedBodyPart) {
      return (
        <div style={{ ...s.partDetail, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
          <div style={s.emptyState}>
            <div style={s.emptyIcon}><FolderTree size={28} color="#94a3b8" /></div>
            <div style={s.emptyTitle}>选择左侧部位查看详情</div>
            <div style={s.emptyDesc}>点击部位词典中的项目，查看详细描述词和正常值范围</div>
          </div>
        </div>
      )
    }

    const bp = selectedBodyPart
    return (
      <div style={s.partDetail}>
        <div style={s.partDetailHeader}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#1a3a5c' }}>{bp.name}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
              <span style={{ fontFamily: 'monospace' }}>{bp.code}</span>
              {' · '}
              {renderCategoryBadge(bp.category)}
              {' · '}
              {renderScopeBadge(bp.scope)}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button style={s.btnSm} onClick={() => openEditBodyPart(bp)}><Edit2 size={12} />编辑</button>
            <button style={s.btnDanger} onClick={() => openDeleteBodyPart(bp)}><Trash2 size={12} />删除</button>
          </div>
        </div>

        <div style={s.partDetailSection}>
          <div style={s.partDetailSectionTitle}>
            <Info size={13} /> 子部位
          </div>
          <div style={s.chipList}>
            {(bp.subParts ?? []).map(sp => (
              <span key={sp} style={{ ...s.chip, ...s.chipBlue }}>{sp}</span>
            ))}
            {(!bp.subParts || bp.subParts.length === 0) && (
              <span style={{ color: '#94a3b8', fontSize: 13 }}>暂无子部位数据</span>
            )}
          </div>
        </div>

        <div style={s.partDetailSection}>
          <div style={s.partDetailSectionTitle}>
            <Tag size={13} /> 常用描述词
          </div>
          <div style={s.chipList}>
            {(bp.descriptors ?? []).map(d => (
              <span key={d} style={s.chip}>{d}</span>
            ))}
            {(!bp.descriptors || bp.descriptors.length === 0) && (
              <span style={{ color: '#94a3b8', fontSize: 13 }}>暂无描述词</span>
            )}
          </div>
        </div>

        <div style={s.partDetailSection}>
          <div style={s.partDetailSectionTitle}>
            <CheckSquare size={13} /> 正常值范围
          </div>
          {(bp.normalRanges && bp.normalRanges.length > 0) ? (
            <table style={s.normalRangeTable}>
              <thead>
                <tr>
                  <th style={s.normalRangeTh}>测量项目</th>
                  <th style={s.normalRangeTh}>正常值</th>
                  <th style={s.normalRangeTh}>单位</th>
                  <th style={s.normalRangeTh}>备注</th>
                </tr>
              </thead>
              <tbody>
                {bp.normalRanges.map((nr, i) => (
                  <tr key={i}>
                    <td style={s.normalRangeTd}>{nr.measurement}</td>
                    <td style={{ ...s.normalRangeTd, fontWeight: 600, color: '#16a34a' }}>{nr.normalValue}</td>
                    <td style={s.normalRangeTd}>{nr.unit || '-'}</td>
                    <td style={{ ...s.normalRangeTd, color: '#64748b', fontSize: 12 }}>{nr.note || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <span style={{ color: '#94a3b8', fontSize: 13 }}>暂无正常值数据</span>
          )}
        </div>
      </div>
    )
  }

  // ==================== 词库统计卡片 ====================
  const renderScopeStats = () => (
    <div style={s.scopeStats}>
      <div style={{ ...s.scopeStatCard, borderTopColor: '#7c3aed' }}>
        <div style={s.scopeStatLabel}>全院标准</div>
        <div style={{ ...s.scopeStatValue, color: '#7c3aed' }}>{stats.hospital}</div>
        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>术语词条</div>
      </div>
      <div style={{ ...s.scopeStatCard, borderTopColor: '#1d4ed8' }}>
        <div style={s.scopeStatLabel}>科室共享</div>
        <div style={{ ...s.scopeStatValue, color: '#1d4ed8' }}>{stats.department}</div>
        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>术语词条</div>
      </div>
      <div style={{ ...s.scopeStatCard, borderTopColor: '#92400e' }}>
        <div style={s.scopeStatLabel}>个人词库</div>
        <div style={{ ...s.scopeStatValue, color: '#92400e' }}>{stats.personal}</div>
        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>术语词条</div>
      </div>
      <div style={{ ...s.scopeStatCard, borderTopColor: '#16a34a' }}>
        <div style={s.scopeStatLabel}>部位词典</div>
        <div style={{ ...s.scopeStatValue, color: '#16a34a' }}>{stats.bpCount}</div>
        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>检查部位</div>
      </div>
      <div style={{ ...s.scopeStatCard, borderTopColor: '#be185d' }}>
        <div style={s.scopeStatLabel}>报告短语</div>
        <div style={{ ...s.scopeStatValue, color: '#be185d' }}>{stats.phraseCount}</div>
        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>预设短语</div>
      </div>
    </div>
  )

  // ==================== 弹窗内容 ====================
  const renderModal = () => {
    if (!modalMode) return null

    const isDelete = modalMode === 'delete'
    const isImport = modalMode === 'import'
    const isTermForm = (modalMode === 'add' || modalMode === 'edit') && activeTab === 'terms'
    const isBodyPartForm = (modalMode === 'add' || modalMode === 'edit') && activeTab === 'bodyparts'
    const isPhraseForm = (modalMode === 'add' || modalMode === 'edit') && activeTab === 'phrases'

    const modalStyle = isImport ? s.modalWide : (isTermForm || isPhraseForm) ? s.modalWide : s.modal

    return (
      <div style={s.overlay} onClick={e => e.target === e.currentTarget && !isImport && closeModal()}>
        <div style={modalStyle}>
          {isDelete ? (
            <>
              <div style={s.modalHeader}>
                <div style={s.modalTitle}>确认删除</div>
                <button style={s.modalClose} onClick={closeModal}><X size={18} /></button>
              </div>
              <div style={s.modalBody}>
                <div style={s.deleteModalText}>
                  确定要删除 <strong>{deleteTarget?.item.name || deleteTarget?.item.phrase?.slice(0, 20)}</strong> 吗？
                </div>
                <div style={s.deleteModalText}>此操作不可恢复。</div>
              </div>
              <div style={s.modalFooter}>
                <button style={s.btnCancel} onClick={closeModal}>取消</button>
                <button style={s.btnDeleteConfirm} onClick={handleSubmit}>确认删除</button>
              </div>
            </>
          ) : isImport ? (
            <>
              <div style={s.modalHeader}>
                <div style={s.modalTitle}>批量导入术语</div>
                <button style={s.modalClose} onClick={() => { setImporting(false); closeModal() }}><X size={18} /></button>
              </div>
              <div style={s.modalBody}>
                {importStep === 1 && (
                  <>
                    <div style={s.importInfoBox}>
                      <Info size={16} />
                      <div>
                        <strong>导入说明</strong><br />
                        请上传 Excel 文件（.xlsx 或 .xls），文件需包含以下列：<br />
                        <code>分类 | 编码 | 名称 | 拼音 | 英文名 | 同义词 | 定义 | 适用范围 | 状态</code>
                      </div>
                    </div>
                    <div
                      style={{ ...s.fileDropZone, ...(importing ? s.fileDropZoneHover : {}) }}
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={e => { e.preventDefault(); setImporting(true) }}
                      onDragLeave={() => setImporting(false)}
                      onDrop={e => {
                        e.preventDefault()
                        const file = e.dataTransfer.files[0]
                        if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
                          setImportFile(file)
                          setImportStep(2)
                        }
                      }}
                    >
                      <Upload size={32} color="#94a3b8" style={{ marginBottom: 12 }} />
                      <div style={{ fontSize: 14, color: '#334155', marginBottom: 6 }}>
                        点击选择文件 或 拖拽文件到此处
                      </div>
                      <div style={{ fontSize: 12, color: '#94a3b8' }}>支持 .xlsx, .xls 格式</div>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls"
                      style={s.hiddenInput}
                      onChange={handleFileChange}
                    />
                    <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                      <button style={s.btnSecondary} onClick={() => {
                        const link = document.createElement('a')
                        link.href = '#'
                        link.download = '超声术语词库导入模板.xlsx'
                        alert('模板下载功能（实际场景触发文件下载）')
                      }}>
                        <Download size={14} />下载导入模板
                      </button>
                    </div>
                  </>
                )}
                {importStep === 2 && importFile && (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 8, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FileText size={20} color="#16a34a" />
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#1a3a5c' }}>{importFile.name}</div>
                        <div style={{ fontSize: 12, color: '#94a3b8' }}>{(importFile.size / 1024).toFixed(1)} KB</div>
                      </div>
                    </div>
                    <div style={{ background: '#f8fafc', borderRadius: 8, padding: 16, marginBottom: 16 }}>
                      <div style={{ fontSize: 13, color: '#334155', marginBottom: 8 }}>预览（前3条）：</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>
                        • 肝脏 | ABD-LIV | 肝脏 | gānzāng | Liver | ...<br />
                        • 胆囊 | ABD-GBL | 胆囊 | dānnáng | Gallbladder | ...<br />
                        • 胰腺 | ABD-PAN | 胰腺 | yíxiàn | Pancreas | ...
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button style={s.btnCancel} onClick={() => setImportStep(1)}>重新选择</button>
                      <button style={s.btnSubmit} onClick={handleImportConfirm}>确认导入</button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <div style={s.modalHeader}>
                <div style={s.modalTitle}>
                  {isTermForm && (modalMode === 'add' ? '新增术语' : '编辑术语')}
                  {isBodyPartForm && (modalMode === 'add' ? '新增部位' : '编辑部位')}
                  {isPhraseForm && (modalMode === 'add' ? '新增短语' : '编辑短语')}
                </div>
                <button style={s.modalClose} onClick={closeModal}><X size={18} /></button>
              </div>
              <div style={s.modalBody}>
                {formErrors.length > 0 && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, padding: '10px 12px', marginBottom: 14 }}>
                    {formErrors.map((err, i) => <div key={i} style={{ fontSize: 13, color: '#dc2626' }}>{err}</div>)}
                  </div>
                )}

                {/* === 术语表单 === */}
                {isTermForm && (
                  <div style={s.formGrid}>
                    <div style={s.formGroup}>
                      <label style={s.label}>分类<span style={s.required}>*</span></label>
                      <select style={s.input} value={editingTerm.category} onChange={e => setEditingTerm(p => ({ ...p, category: e.target.value as UltrasoundCategory }))}>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div style={s.formGroup}>
                      <label style={s.label}>适用范围<span style={s.required}>*</span></label>
                      <select style={s.input} value={editingTerm.scope} onChange={e => setEditingTerm(p => ({ ...p, scope: e.target.value as ScopeLevel }))}>
                        <option value="personal">个人词库</option>
                        <option value="department">科室共享</option>
                        <option value="hospital">全院标准</option>
                      </select>
                    </div>
                    <div style={s.formGroup}>
                      <label style={s.label}>编码<span style={s.required}>*</span></label>
                      <input style={s.input} placeholder="如 ABD-LIV" value={editingTerm.code} onChange={e => setEditingTerm(p => ({ ...p, code: e.target.value }))} />
                    </div>
                    <div style={s.formGroup}>
                      <label style={s.label}>排序号</label>
                      <input type="number" style={s.input} placeholder="0" value={editingTerm.sortOrder} onChange={e => setEditingTerm(p => ({ ...p, sortOrder: parseInt(e.target.value) || 0 }))} />
                    </div>
                    <div style={{ ...s.formGroup, gridColumn: '1 / -1' }}>
                      <label style={s.label}>名称<span style={s.required}>*</span></label>
                      <input style={s.input} placeholder="术语名称" value={editingTerm.name} onChange={e => setEditingTerm(p => ({ ...p, name: e.target.value }))} />
                    </div>
                    <div style={s.formGroup}>
                      <label style={s.label}>拼音</label>
                      <input style={s.input} placeholder="全拼，如 gānzāng" value={editingTerm.pinyin} onChange={e => setEditingTerm(p => ({ ...p, pinyin: e.target.value }))} />
                    </div>
                    <div style={s.formGroup}>
                      <label style={s.label}>拼音首字母</label>
                      <input style={s.input} placeholder="首字母，如 gz" value={editingTerm.pinyinInitial} onChange={e => setEditingTerm(p => ({ ...p, pinyinInitial: e.target.value }))} />
                    </div>
                    <div style={s.formGroup}>
                      <label style={s.label}>英文名</label>
                      <input style={s.input} placeholder="English name" value={editingTerm.englishName} onChange={e => setEditingTerm(p => ({ ...p, englishName: e.target.value }))} />
                    </div>
                    <div style={s.formGroup}>
                      <label style={s.label}>同义词</label>
                      <input style={s.input} placeholder="多个同义词用逗号分隔" value={(editingTerm.synonyms ?? []).join(', ')} onChange={e => setEditingTerm(p => ({ ...p, synonyms: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))} />
                    </div>
                    <div style={{ ...s.formGroup, gridColumn: '1 / -1' }}>
                      <label style={s.label}>定义/描述</label>
                      <textarea style={s.textarea} placeholder="术语的定义或超声描述说明" value={editingTerm.definition} onChange={e => setEditingTerm(p => ({ ...p, definition: e.target.value }))} />
                    </div>
                    <div style={{ ...s.formGroup, gridColumn: '1 / -1' }}>
                      <label style={s.label}>标签（用逗号分隔）</label>
                      <input style={s.input} placeholder="如：实质性脏器,腹膜后" value={(editingTerm.tags ?? []).join(', ')} onChange={e => setEditingTerm(p => ({ ...p, tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))} />
                    </div>
                    <div style={{ ...s.formGroup, gridColumn: '1 / -1' }}>
                      <label style={s.label}>备注</label>
                      <input style={s.input} placeholder="备注信息" value={editingTerm.notes} onChange={e => setEditingTerm(p => ({ ...p, notes: e.target.value }))} />
                    </div>
                    <div style={{ ...s.formGroup, gridColumn: '1 / -1' }}>
                      <label style={s.checkboxLabel}>
                        <input type="checkbox" checked={editingTerm.isActive} onChange={e => setEditingTerm(p => ({ ...p, isActive: e.target.checked }))} />
                        启用该术语
                      </label>
                    </div>
                  </div>
                )}

                {/* === 部位词典表单 === */}
                {isBodyPartForm && (
                  <div style={s.formGrid}>
                    <div style={s.formGroup}>
                      <label style={s.label}>分类<span style={s.required}>*</span></label>
                      <select style={s.input} value={editingBodyPart.category} onChange={e => setEditingBodyPart(p => ({ ...p, category: e.target.value as UltrasoundCategory }))}>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div style={s.formGroup}>
                      <label style={s.label}>适用范围<span style={s.required}>*</span></label>
                      <select style={s.input} value={editingBodyPart.scope} onChange={e => setEditingBodyPart(p => ({ ...p, scope: e.target.value as ScopeLevel }))}>
                        <option value="personal">个人词库</option>
                        <option value="department">科室共享</option>
                        <option value="hospital">全院标准</option>
                      </select>
                    </div>
                    <div style={s.formGroup}>
                      <label style={s.label}>编码<span style={s.required}>*</span></label>
                      <input style={s.input} placeholder="如 BP-ABD-LIV" value={editingBodyPart.code} onChange={e => setEditingBodyPart(p => ({ ...p, code: e.target.value }))} />
                    </div>
                    <div style={s.formGroup}>
                      <label style={s.label}>排序号</label>
                      <input type="number" style={s.input} placeholder="0" value={editingBodyPart.sortOrder} onChange={e => setEditingBodyPart(p => ({ ...p, sortOrder: parseInt(e.target.value) || 0 }))} />
                    </div>
                    <div style={{ ...s.formGroup, gridColumn: '1 / -1' }}>
                      <label style={s.label}>部位名称<span style={s.required}>*</span></label>
                      <input style={s.input} placeholder="如 肝脏" value={editingBodyPart.name} onChange={e => setEditingBodyPart(p => ({ ...p, name: e.target.value }))} />
                    </div>
                    <div style={s.formGroup}>
                      <label style={s.label}>拼音</label>
                      <input style={s.input} placeholder="全拼" value={editingBodyPart.pinyin} onChange={e => setEditingBodyPart(p => ({ ...p, pinyin: e.target.value }))} />
                    </div>
                    <div style={s.formGroup}>
                      <label style={s.label}>英文名</label>
                      <input style={s.input} placeholder="English name" value={editingBodyPart.englishName} onChange={e => setEditingBodyPart(p => ({ ...p, englishName: e.target.value }))} />
                    </div>
                    <div style={{ ...s.formGroup, gridColumn: '1 / -1' }}>
                      <label style={s.label}>子部位（每行一个）</label>
                      <textarea
                        style={s.textarea}
                        placeholder="肝左叶&#10;肝右叶&#10;尾状叶&#10;肝门"
                        value={(editingBodyPart.subParts ?? []).join('\n')}
                        onChange={e => setEditingBodyPart(p => ({ ...p, subParts: e.target.value.split('\n').map(s => s.trim()).filter(Boolean) }))}
                      />
                    </div>
                    <div style={{ ...s.formGroup, gridColumn: '1 / -1' }}>
                      <label style={s.label}>常用描述词（每行一个）</label>
                      <textarea
                        style={s.textarea}
                        placeholder="大小正常&#10;形态规则&#10;回声均匀"
                        value={(editingBodyPart.descriptors ?? []).join('\n')}
                        onChange={e => setEditingBodyPart(p => ({ ...p, descriptors: e.target.value.split('\n').map(s => s.trim()).filter(Boolean) }))}
                      />
                    </div>
                    <div style={{ ...s.formGroup, gridColumn: '1 / -1' }}>
                      <label style={s.label}>备注</label>
                      <input style={s.input} placeholder="备注" value={editingBodyPart.notes} onChange={e => setEditingBodyPart(p => ({ ...p, notes: e.target.value }))} />
                    </div>
                    <div style={{ ...s.formGroup, gridColumn: '1 / -1' }}>
                      <label style={s.checkboxLabel}>
                        <input type="checkbox" checked={editingBodyPart.isActive} onChange={e => setEditingBodyPart(p => ({ ...p, isActive: e.target.checked }))} />
                        启用该部位
                      </label>
                    </div>
                  </div>
                )}

                {/* === 报告短语表单 === */}
                {isPhraseForm && (
                  <div style={s.formGrid}>
                    <div style={s.formGroup}>
                      <label style={s.label}>分类<span style={s.required}>*</span></label>
                      <select style={s.input} value={editingPhrase.category} onChange={e => setEditingPhrase(p => ({ ...p, category: e.target.value as UltrasoundCategory }))}>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div style={s.formGroup}>
                      <label style={s.label}>检查类型<span style={s.required}>*</span></label>
                      <select style={s.input} value={editingPhrase.examType} onChange={e => setEditingPhrase(p => ({ ...p, examType: e.target.value }))}>
                        {(examTypesByCategory[editingPhrase.category as UltrasoundCategory] ?? []).map(et => (
                          <option key={et} value={et}>{et}</option>
                        ))}
                      </select>
                    </div>
                    <div style={s.formGroup}>
                      <label style={s.label}>适用范围<span style={s.required}>*</span></label>
                      <select style={s.input} value={editingPhrase.scope} onChange={e => setEditingPhrase(p => ({ ...p, scope: e.target.value as ScopeLevel }))}>
                        <option value="personal">个人词库</option>
                        <option value="department">科室共享</option>
                        <option value="hospital">全院标准</option>
                      </select>
                    </div>
                    <div style={s.formGroup}>
                      <label style={s.label}>排序号</label>
                      <input type="number" style={s.input} placeholder="0" value={editingPhrase.sortOrder} onChange={e => setEditingPhrase(p => ({ ...p, sortOrder: parseInt(e.target.value) || 0 }))} />
                    </div>
                    <div style={{ ...s.formGroup, gridColumn: '1 / -1' }}>
                      <label style={s.label}>短语内容<span style={s.required}>*</span></label>
                      <textarea
                        style={{ ...s.textarea, minHeight: 120 }}
                        placeholder="请输入报告短语内容"
                        value={editingPhrase.phrase}
                        onChange={e => setEditingPhrase(p => ({ ...p, phrase: e.target.value }))}
                      />
                    </div>
                    <div style={{ ...s.formGroup, gridColumn: '1 / -1' }}>
                      <label style={s.checkboxLabel}>
                        <input type="checkbox" checked={editingPhrase.isPreset} onChange={e => setEditingPhrase(p => ({ ...p, isPreset: e.target.checked }))} />
                        设为预设短语
                      </label>
                    </div>
                    <div style={{ ...s.formGroup, gridColumn: '1 / -1' }}>
                      <label style={s.checkboxLabel}>
                        <input type="checkbox" checked={editingPhrase.isActive} onChange={e => setEditingPhrase(p => ({ ...p, isActive: e.target.checked }))} />
                        启用该短语
                      </label>
                    </div>
                  </div>
                )}
              </div>
              <div style={s.modalFooter}>
                <button style={s.btnCancel} onClick={closeModal}>取消</button>
                <button style={s.btnSubmit} onClick={handleSubmit}>
                  {modalMode === 'add' ? '确认添加' : '保存修改'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  // ==================== 主渲染 ====================
  return (
    <div>
      {/* 页头 */}
      <div style={s.pageHeader}>
        <div>
          <div style={s.title}>超声专业词库</div>
          <div style={s.subtitle}>三级词库管理 · 超声亚专业分类 · 部位词典 · 术语词典 · 报告词库 · 联想输入 · Excel导入导出</div>
        </div>
        <div style={s.statsRow}>
          <div style={s.statItem}>
            <BookOpen size={14} />
            <span>术语</span>
            <span style={s.statNum}>{stats.total}</span>
          </div>
          <div style={s.statItem}>
            <FolderTree size={14} />
            <span>部位</span>
            <span style={s.statNum}>{stats.bpCount}</span>
          </div>
          <div style={s.statItem}>
            <FileText size={14} />
            <span>短语</span>
            <span style={s.statNum}>{stats.phraseCount}</span>
          </div>
        </div>
      </div>

      {/* 词库统计卡片 */}
      {renderScopeStats()}

      {/* 标签栏：术语 / 部位词典 / 报告词库 */}
      <div style={s.tabBar}>
        <button style={{ ...s.tab, ...(activeTab === 'terms' ? s.tabActive : s.tabInactive) }} onClick={() => { setActiveTab('terms'); setPage(1) }}>
          <BookOpen size={14} />术语词典
        </button>
        <button style={{ ...s.tab, ...(activeTab === 'bodyparts' ? s.tabActive : s.tabInactive) }} onClick={() => setActiveTab('bodyparts')}>
          <FolderTree size={14} />部位词典
          <span style={{ ...s.tabBadge, background: activeTab === 'bodyparts' ? '#fff' : '#ef4444', color: activeTab === 'bodyparts' ? '#1a3a5c' : '#fff' }}>{stats.bpCount}</span>
        </button>
        <button style={{ ...s.tab, ...(activeTab === 'phrases' ? s.tabActive : s.tabInactive) }} onClick={() => setActiveTab('phrases')}>
          <FileText size={14} />报告词库
          <span style={{ ...s.tabBadge, background: activeTab === 'phrases' ? '#fff' : '#ef4444', color: activeTab === 'phrases' ? '#1a3a5c' : '#fff' }}>{stats.phraseCount}</span>
        </button>
      </div>

      {/* ==================== 术语词典 ==================== */}
      {activeTab === 'terms' && (
        <>
          {/* 工具栏 */}
          <div style={s.toolbar}>
            <div style={s.searchWrapper} ref={searchRef}>
              <div style={s.searchBox}>
                <Search size={15} color="#94a3b8" />
                <input
                  style={s.searchInput}
                  placeholder="搜索术语名称、编码、拼音、英文、同义词..."
                  value={search}
                  onChange={e => handleSearchChange(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  onFocus={() => { if (search.trim()) { setSuggestions(allSuggestions); setShowSuggestions(true) } }}
                />
              </div>
              {showSuggestions && suggestions.length > 0 && (
                <div style={s.autocompleteDropdown}>
                  {suggestions.map((t, i) => (
                    <div
                      key={t.id}
                      style={{ ...s.autocompleteItem, ...(i === suggestionActive ? s.autocompleteItemHover : {}) }}
                      onClick={() => handleSuggestionClick(t)}
                    >
                      <span style={{ fontWeight: 600, color: '#1a3a5c' }}>{t.name}</span>
                      <span style={s.autocompleteTag}>{t.category}</span>
                      <span style={{ color: '#94a3b8', fontSize: 12, marginLeft: 'auto' }}>{t.englishName || t.pinyin || ''}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <select style={s.select} value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1) }}>
              <option value="">全部分类</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select style={s.select} value={scopeFilter} onChange={e => { setScopeFilter(e.target.value as any); setPage(1) }}>
              <option value="all">全部范围</option>
              <option value="hospital">全院标准</option>
              <option value="department">科室共享</option>
              <option value="personal">个人词库</option>
            </select>
            {(search || categoryFilter || scopeFilter !== 'all') && (
              <button style={s.btnIcon} onClick={resetFilters}>
                <RotateCcw size={13} /> 重置
              </button>
            )}
            <div style={{ flex: 1 }} />
            <button style={s.btnSecondary} onClick={handleImportClick}>
              <Upload size={14} /> 导入
            </button>
            <button style={s.btnSecondary} onClick={handleExport}>
              <Download size={14} /> 导出
            </button>
            <button style={s.btnPrimary} onClick={openAddTerm}>
              <Plus size={15} /> 新增术语
            </button>
          </div>

          {/* 表格 */}
          {paged.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
              <div style={s.emptyState}>
                <div style={s.emptyIcon}><BookOpen size={28} color="#94a3b8" /></div>
                <div style={s.emptyTitle}>暂无术语数据</div>
                <div style={s.emptyDesc}>当前条件下没有术语记录，请尝试调整筛选条件</div>
                <button style={s.btnPrimary} onClick={openAddTerm}><Plus size={15} />新增第一条术语</button>
              </div>
            </div>
          ) : (
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>分类</th>
                  <th style={s.th}>编码</th>
                  <th style={s.th}>名称</th>
                  <th style={s.th}>拼音/首字母</th>
                  <th style={s.th}>英文名</th>
                  <th style={s.th}>同义词</th>
                  <th style={s.th}>范围</th>
                  <th style={s.th}>状态</th>
                  <th style={s.th}>操作</th>
                </tr>
              </thead>
              <tbody>
                {paged.map(t => (
                  <tr key={t.id} style={{ background: '#fff' }}>
                    <td style={s.td}>{renderCategoryBadge(t.category)}</td>
                    <td style={s.td}>
                      <code style={{ fontFamily: 'monospace', fontSize: 12, background: '#f8fafc', padding: '2px 6px', borderRadius: 4 }}>{t.code}</code>
                    </td>
                    <td style={s.td}>
                      <div style={{ fontWeight: 600, color: '#1a3a5c' }}>{t.name}</div>
                      {(t.tags ?? []).length > 0 && (
                        <div style={{ display: 'flex', gap: 4, marginTop: 2, flexWrap: 'wrap' }}>
                          {(t.tags ?? []).slice(0, 3).map(tag => (
                            <span key={tag} style={{ fontSize: 10, padding: '1px 5px', borderRadius: 3, background: '#f1f5f9', color: '#64748b' }}>{tag}</span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td style={s.td}>
                      <span style={{ fontSize: 12, color: '#64748b' }}>{t.pinyin || '-'}</span>
                      {t.pinyinInitial && <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 4 }}>({t.pinyinInitial})</span>}
                    </td>
                    <td style={s.td}><span style={{ color: '#64748b', fontSize: 12 }}>{t.englishName || '-'}</span></td>
                    <td style={s.td}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                        {(t.synonyms ?? []).slice(0, 2).map(syn => (
                          <span key={syn} style={{ fontSize: 11, padding: '1px 6px', borderRadius: 4, background: '#fef3c7', color: '#92400e' }}>{syn}</span>
                        ))}
                        {(t.synonyms ?? []).length > 2 && <span style={{ fontSize: 11, color: '#94a3b8' }}>+{t.synonyms!.length - 2}</span>}
                      </div>
                    </td>
                    <td style={s.td}>{renderScopeBadge(t.scope)}</td>
                    <td style={s.td}>{renderActiveBadge(t.isActive)}</td>
                    <td style={s.td}>
                      <div style={s.actions}>
                        {t.scope !== 'personal' && (
                          <button style={s.btnIcon} onClick={() => handleCopyToPersonal(t)} title="复制到个人词库">
                            <Copy size={13} /> 复制
                          </button>
                        )}
                        <button style={s.btnIcon} onClick={() => openEditTerm(t)} title="编辑"><Edit2 size={13} /></button>
                        <button style={s.btnDanger} onClick={() => openDeleteTerm(t)} title="删除"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* 分页 */}
          <div style={s.pagination}>
            <div style={s.pageInfo}>共 <strong>{filteredTerms.length}</strong> 条记录，第 <strong>{page}</strong> / <strong>{totalPages}</strong> 页</div>
            <div style={s.pageBtns}>
              <button style={{ ...s.pageBtn, ...(page === 1 ? s.pageBtnDisabled : {}) }} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft size={15} /></button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let num = i + 1
                if (totalPages > 5 && page > 3) num = page - 2 + i
                if (totalPages > 5 && page > totalPages - 2) num = totalPages - 4 + i
                return (
                  <button key={num} style={{ ...s.pageBtn, ...(page === num ? s.pageBtnActive : {}) }} onClick={() => setPage(num)}>{num}</button>
                )
              })}
              <button style={{ ...s.pageBtn, ...(page === totalPages ? s.pageBtnDisabled : {}) }} onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}><ChevronRight size={15} /></button>
            </div>
          </div>
        </>
      )}

      {/* ==================== 部位词典 ==================== */}
      {activeTab === 'bodyparts' && (
        <>
          <div style={s.mainLayout}>
            {renderBodyPartSidebar()}
            <div style={s.content}>
              {/* 工具栏 */}
              <div style={s.toolbar}>
                <div style={s.searchBox}>
                  <Search size={15} color="#94a3b8" />
                  <input style={s.searchInput} placeholder="搜索部位名称..." value={search} onChange={e => { setSearch(e.target.value) }} />
                </div>
                <select style={s.select} value={scopeFilter} onChange={e => setScopeFilter(e.target.value as any)}>
                  <option value="all">全部范围</option>
                  <option value="hospital">全院标准</option>
                  <option value="department">科室共享</option>
                  <option value="personal">个人词库</option>
                </select>
                {(search || scopeFilter !== 'all') && (
                  <button style={s.btnIcon} onClick={() => { setSearch(''); setScopeFilter('all') }}><RotateCcw size={13} /> 重置</button>
                )}
                <div style={{ flex: 1 }} />
                <button style={s.btnSecondary} onClick={handleExport}><Download size={14} /> 导出</button>
                <button style={s.btnPrimary} onClick={openAddBodyPart}><Plus size={15} /> 新增部位</button>
              </div>
              {renderBodyPartDetail()}
            </div>
          </div>
        </>
      )}

      {/* ==================== 报告词库 ==================== */}
      {activeTab === 'phrases' && (
        <>
          <div style={s.toolbar}>
            <div style={s.searchBox}>
              <Search size={15} color="#94a3b8" />
              <input style={s.searchInput} placeholder="搜索短语内容..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select style={s.select} value={phraseCategoryFilter} onChange={e => setPhraseCategoryFilter(e.target.value)}>
              <option value="">全部分类</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select style={s.select} value={phraseExamTypeFilter} onChange={e => setPhraseExamTypeFilter(e.target.value)}>
              <option value="">全部检查类型</option>
              {categories.flatMap(c => (examTypesByCategory[c] ?? []).map(et => (
                <option key={et} value={et}>{et}</option>
              )))}
            </select>
            <select style={s.select} value={scopeFilter} onChange={e => setScopeFilter(e.target.value as any)}>
              <option value="all">全部范围</option>
              <option value="hospital">全院标准</option>
              <option value="department">科室共享</option>
              <option value="personal">个人词库</option>
            </select>
            {(search || phraseCategoryFilter || phraseExamTypeFilter || scopeFilter !== 'all') && (
              <button style={s.btnIcon} onClick={() => { setSearch(''); setPhraseCategoryFilter(''); setPhraseExamTypeFilter(''); setScopeFilter('all') }}>
                <RotateCcw size={13} /> 重置
              </button>
            )}
            <div style={{ flex: 1 }} />
            <button style={s.btnSecondary} onClick={handleImportClick}><Upload size={14} /> 导入</button>
            <button style={s.btnSecondary} onClick={handleExport}><Download size={14} /> 导出</button>
            <button style={s.btnPrimary} onClick={openAddPhrase}><Plus size={15} /> 新增短语</button>
          </div>

          {filteredPhrases.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
              <div style={s.emptyState}>
                <div style={s.emptyIcon}><FileText size={28} color="#94a3b8" /></div>
                <div style={s.emptyTitle}>暂无短语数据</div>
                <div style={s.emptyDesc}>当前条件下没有短语记录</div>
                <button style={s.btnPrimary} onClick={openAddPhrase}><Plus size={15} />新增第一条短语</button>
              </div>
            </div>
          ) : (
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>分类</th>
                  <th style={s.th}>检查类型</th>
                  <th style={{ ...s.th, minWidth: 300 }}>短语内容</th>
                  <th style={s.th}>使用频次</th>
                  <th style={s.th}>范围</th>
                  <th style={s.th}>预设</th>
                  <th style={s.th}>操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredPhrases.map(p => (
                  <tr key={p.id} style={{ background: '#fff' }}>
                    <td style={s.td}>{renderCategoryBadge(p.category)}</td>
                    <td style={s.td}><span style={{ fontSize: 12 }}>{p.examType}</span></td>
                    <td style={s.td}>
                      <div style={s.phraseCell}>{p.phrase}</div>
                    </td>
                    <td style={s.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 60, height: 4, background: '#e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ width: `${(p.useCount / maxUseCount) * 100}%`, height: '100%', background: '#16a34a', borderRadius: 2 }} />
                        </div>
                        <span style={{ fontSize: 12, color: '#64748b' }}>{p.useCount}</span>
                      </div>
                    </td>
                    <td style={s.td}>{renderScopeBadge(p.scope)}</td>
                    <td style={s.td}>
                      {p.isPreset
                        ? <span style={{ ...s.badge, ...s.badgeActive }}>预设</span>
                        : <span style={{ ...s.badge, ...s.badgeInactive }}>自定义</span>
                      }
                    </td>
                    <td style={s.td}>
                      <div style={s.actions}>
                        <button style={s.btnIcon} onClick={() => openEditPhrase(p)}><Edit2 size={13} /></button>
                        <button style={s.btnDanger} onClick={() => openDeletePhrase(p)}><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div style={s.pagination}>
            <div style={s.pageInfo}>共 <strong>{filteredPhrases.length}</strong> 条短语</div>
          </div>
        </>
      )}

      {/* 弹窗 */}
      {renderModal()}
    </div>
  )
}
