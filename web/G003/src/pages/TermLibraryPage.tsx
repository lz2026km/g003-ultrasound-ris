// @ts-nocheck
// ============================================================
// G003 超声RIS系统 - 术语词库管理页面
// ============================================================
import { useState, useMemo } from 'react'
import {
  Search, Plus, Edit2, Trash2, X, ChevronLeft, ChevronRight,
  BookOpen, Filter, RotateCcw, Star, Users, Building2, Copy, Download, Upload
} from 'lucide-react'

// ---------- 类型定义 ----------
interface TermItem {
  id: string
  category: string        // 腹部 | 浅表 | 心血管 | 妇产 | 介入
  code: string
  name: string
  pinyin?: string
  englishName?: string
  definition?: string
  scope: 'personal' | 'shared'  // 个人词库 | 科室共享词库
  isActive: boolean
  sortOrder: number
  creator?: string
  createTime?: string
  notes?: string
}

// ---------- 样式定义 ----------
const s: Record<string, React.CSSProperties> = {
  pageHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 18, fontWeight: 700, color: '#1a3a5c' },
  statsRow: {
    display: 'flex', gap: 24,
  },
  statItem: {
    display: 'flex', alignItems: 'center', gap: 6,
    fontSize: 13, color: '#64748b',
  },
  statNum: { fontWeight: 700, color: '#1a3a5c' },
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
  tabBar: {
    display: 'flex', gap: 4, marginBottom: 16,
    background: '#fff', padding: '8px 12px', borderRadius: 8,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  tab: {
    padding: '8px 16px', borderRadius: 6, border: 'none', cursor: 'pointer',
    fontSize: 14, fontWeight: 500, transition: 'all 0.2s',
  },
  tabActive: {
    background: '#1a3a5c', color: '#fff',
  },
  tabInactive: {
    background: 'transparent', color: '#64748b',
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
  badgeActive: { background: '#dcfce7', color: '#16a34a' },
  badgeInactive: { background: '#f1f5f9', color: '#94a3b8' },
  badgePersonal: { background: '#fef3c7', color: '#92400e' },
  badgeShared: { background: '#dbeafe', color: '#1d4ed8' },
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
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: '#fff', borderRadius: 12, width: 560, maxHeight: '90vh',
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
  formGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14,
  },
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
  infoTip: {
    fontSize: 11, color: '#94a3b8', marginTop: 4,
  },
  errorText: {
    fontSize: 12, color: '#dc2626', marginTop: 4,
  },
  deleteModalText: {
    fontSize: 14, color: '#475569', lineHeight: 1.6, marginBottom: 8,
  },
  categoryTag: {
    display: 'inline-block', padding: '3px 10px', borderRadius: 6,
    fontSize: 12, fontWeight: 600,
  },
}

// ---------- 分类颜色 ----------
const categoryColors: Record<string, { bg: string; color: string }> = {
  '腹部':    { bg: '#dbeafe', color: '#1d4ed8' },
  '浅表':    { bg: '#fce7f3', color: '#be185d' },
  '心血管':  { bg: '#fee2e2', color: '#dc2626' },
  '妇产':    { bg: '#f3e8ff', color: '#7c3aed' },
  '介入':    { bg: '#d1fae5', color: '#059669' },
}

// ---------- 初始数据 ----------
const initialTerms: TermItem[] = [
  // 腹部
  { id: 'T001', category: '腹部', code: 'ABD-LIV', name: '肝脏', pinyin: 'gānzāng', englishName: 'Liver', definition: '腹部实质性脏器，位于右季肋区', scope: 'shared', isActive: true, sortOrder: 1, creator: '张建国', createTime: '2025-01-10', notes: '' },
  { id: 'T002', category: '腹部', code: 'ABD-GBL', name: '胆囊', pinyin: 'dānnáng', englishName: 'Gallbladder', definition: '梨形囊性器官，储存胆汁', scope: 'shared', isActive: true, sortOrder: 2, creator: '张建国', createTime: '2025-01-10', notes: '' },
  { id: 'T003', category: '腹部', code: 'ABD-PAN', name: '胰腺', pinyin: 'yíxiàn', englishName: 'Pancreas', definition: '腹膜后器官，分泌胰液和胰岛素', scope: 'shared', isActive: true, sortOrder: 3, creator: '张建国', createTime: '2025-01-10', notes: '' },
  { id: 'T004', category: '腹部', code: 'ABD-SPL', name: '脾脏', pinyin: 'pízāng', englishName: 'Spleen', definition: '左上腹实质性脏器', scope: 'shared', isActive: true, sortOrder: 4, creator: '张建国', createTime: '2025-01-10', notes: '' },
  { id: 'T005', category: '腹部', code: 'ABD-KID', name: '肾脏', pinyin: 'shènzāng', englishName: 'Kidney', definition: '腹膜后成对实质性脏器', scope: 'shared', isActive: true, sortOrder: 5, creator: '张建国', createTime: '2025-01-10', notes: '' },
  { id: 'T006', category: '腹部', code: 'ABD-AOR', name: '腹主动脉', pinyin: 'fùzhǔdòngmài', englishName: 'Abdominal Aorta', definition: '降主动脉的腹段', scope: 'shared', isActive: true, sortOrder: 6, creator: '张建国', createTime: '2025-01-10', notes: '' },
  // 浅表
  { id: 'T007', category: '浅表', code: 'SUP-THY', name: '甲状腺', pinyin: 'jiǎzhuàngxiàn', englishName: 'Thyroid', definition: '颈前部蝶形内分泌腺体', scope: 'shared', isActive: true, sortOrder: 1, creator: '张建国', createTime: '2025-01-10', notes: '' },
  { id: 'T008', category: '浅表', code: 'SUP-BRS', name: '乳腺', pinyin: 'rǔxiàn', englishName: 'Breast', definition: '女性胸部浅表腺体组织', scope: 'shared', isActive: true, sortOrder: 2, creator: '张建国', createTime: '2025-01-10', notes: '' },
  { id: 'T009', category: '浅表', code: 'SUP-SAL', name: '唾液腺', pinyin: 'tuòyèxiàn', englishName: 'Salivary Gland', definition: '包括腮腺、颌下腺、舌下腺', scope: 'shared', isActive: true, sortOrder: 3, creator: '张建国', createTime: '2025-01-10', notes: '' },
  { id: 'T010', category: '浅表', code: 'SUP-LYM', name: '淋巴结', pinyin: 'línbājié', englishName: 'Lymph Node', definition: '椭圆形淋巴器官', scope: 'shared', isActive: true, sortOrder: 4, creator: '张建国', createTime: '2025-01-10', notes: '' },
  { id: 'T011', category: '浅表', code: 'SUP-SC', name: '阴囊', pinyin: 'yīnnáng', englishName: 'Scrotum', definition: '容纳睾丸的囊状结构', scope: 'shared', isActive: true, sortOrder: 5, creator: '张建国', createTime: '2025-01-10', notes: '' },
  // 心血管
  { id: 'T012', category: '心血管', code: 'CV-HRT', name: '心脏', pinyin: 'xīnzàng', englishName: 'Heart', definition: '中纵隔肌性器官', scope: 'shared', isActive: true, sortOrder: 1, creator: '张建国', createTime: '2025-01-10', notes: '' },
  { id: 'T013', category: '心血管', code: 'CV-IVC', name: '下腔静脉', pinyin: 'xiàqiāngjìngmài', englishName: 'Inferior Vena Cava', definition: '体内最大的静脉', scope: 'shared', isActive: true, sortOrder: 2, creator: '张建国', createTime: '2025-01-10', notes: '' },
  { id: 'T014', category: '心血管', code: 'CV-AVT', name: '主动脉瓣', pinyin: 'zhǔdòngmàibàn', englishName: 'Aortic Valve', definition: '左心室与主动脉间的瓣膜', scope: 'shared', isActive: true, sortOrder: 3, creator: '张建国', createTime: '2025-01-10', notes: '' },
  { id: 'T015', category: '心血管', code: 'CV-CAR', name: '颈动脉', pinyin: 'jǐngdòngmài', englishName: 'Carotid Artery', definition: '颈部主要动脉', scope: 'shared', isActive: true, sortOrder: 4, creator: '张建国', createTime: '2025-01-10', notes: '' },
  { id: 'T016', category: '心血管', code: 'CV-PV', name: '门静脉', pinyin: 'ménjìngmài', englishName: 'Portal Vein', definition: '肝脏供血的主要静脉', scope: 'shared', isActive: true, sortOrder: 5, creator: '张建国', createTime: '2025-01-10', notes: '' },
  // 妇产
  { id: 'T017', category: '妇产', code: 'OB-UT', name: '子宫', pinyin: 'zǐgōng', englishName: 'Uterus', definition: '女性盆腔肌性器官', scope: 'shared', isActive: true, sortOrder: 1, creator: '张建国', createTime: '2025-01-10', notes: '' },
  { id: 'T018', category: '妇产', code: 'OB-OV', name: '卵巢', pinyin: 'luǎncháo', englishName: 'Ovary', definition: '女性性腺，产生卵子和激素', scope: 'shared', isActive: true, sortOrder: 2, creator: '张建国', createTime: '2025-01-10', notes: '' },
  { id: 'T019', category: '妇产', code: 'OB-FET', name: '胎儿', pinyin: 'taier', englishName: 'Fetus', definition: '宫内发育中的胚胎', scope: 'shared', isActive: true, sortOrder: 3, creator: '张建国', createTime: '2025-01-10', notes: '' },
  { id: 'T020', category: '妇产', code: 'OB-PLAC', name: '胎盘', pinyin: 'tāipán', englishName: 'Placenta', definition: '孕期连接胎儿与子宫壁的器官', scope: 'shared', isActive: true, sortOrder: 4, creator: '张建国', createTime: '2025-01-10', notes: '' },
  // 介入
  { id: 'T021', category: '介入', code: 'INT-PFA', name: '穿刺活检', pinyin: 'chuāncìhuójiǎn', englishName: 'Percutaneous Biopsy', definition: '经皮穿刺获取组织样本', scope: 'shared', isActive: true, sortOrder: 1, creator: '张建国', createTime: '2025-01-10', notes: '' },
  { id: 'T022', category: '介入', code: 'INT-DRN', name: '置管引流', pinyin: 'zhìguǎnyǐnliú', englishName: 'Catheter Drainage', definition: '经皮置管排出液体或脓液', scope: 'shared', isActive: true, sortOrder: 2, creator: '张建国', createTime: '2025-01-10', notes: '' },
  { id: 'T023', category: '介入', code: 'INT-ABL', name: '消融治疗', pinyin: 'xiāoróngzhìliáo', englishName: 'Ablation Therapy', definition: '物理或化学方法毁损病变组织', scope: 'shared', isActive: true, sortOrder: 3, creator: '张建国', createTime: '2025-01-10', notes: '' },
  // 个人词库
  { id: 'T024', category: '腹部', code: 'MY-LIV01', name: '我的常用描述-肝脏', pinyin: 'wǒdechángyòngmiáoshù-gānzāng', englishName: '', definition: '肝右叶大小正常，实质回声均匀', scope: 'personal', isActive: true, sortOrder: 1, creator: '张建国', createTime: '2025-02-01', notes: '个人常用描述模板' },
  { id: 'T025', category: '心血管', code: 'MY-HRT01', name: '我的常用描述-心脏', pinyin: 'wǒdechángyòngmiáoshù-xīnzàng', englishName: '', definition: '房室大小正常，瓣膜形态及运动未见异常', scope: 'personal', isActive: true, sortOrder: 1, creator: '张建国', createTime: '2025-02-01', notes: '个人常用描述模板' },
]

// ---------- 空对象 ----------
const emptyTerm = (): Partial<TermItem> => ({
  category: '腹部',
  code: '',
  name: '',
  pinyin: '',
  englishName: '',
  definition: '',
  scope: 'personal',
  isActive: true,
  sortOrder: 0,
  notes: '',
})

// ---------- 校验 ----------
const validateTerm = (t: Partial<TermItem>): string[] => {
  const errs: string[] = []
  if (!t.category?.trim()) errs.push('分类不能为空')
  if (!t.code?.trim()) errs.push('编码不能为空')
  if (!t.name?.trim()) errs.push('名称不能为空')
  if (t.sortOrder !== undefined && t.sortOrder < 0) errs.push('排序号不能为负数')
  return errs
}

// ---------- 主组件 ----------
export default function TermLibraryPage() {
  const [terms, setTerms] = useState<TermItem[]>(initialTerms)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [scopeFilter, setScopeFilter] = useState<'all' | 'personal' | 'shared'>('all')
  const [page, setPage] = useState(1)
  const pageSize = 10

  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'delete' | null>(null)
  const [editingTerm, setEditingTerm] = useState<Partial<TermItem>>(emptyTerm())
  const [formErrors, setFormErrors] = useState<string[]>([])

  // 所有分类
  const categories = ['腹部', '浅表', '心血管', '妇产', '介入']

  // 过滤
  const filtered = useMemo(() => {
    const kw = search.trim().toLowerCase()
    return terms.filter(t => {
      const matchSearch = !kw ||
        t.name.toLowerCase().includes(kw) ||
        t.code.toLowerCase().includes(kw) ||
        (t.pinyin ?? '').toLowerCase().includes(kw) ||
        (t.englishName ?? '').toLowerCase().includes(kw) ||
        (t.definition ?? '').toLowerCase().includes(kw)
      const matchCategory = !categoryFilter || t.category === categoryFilter
      const matchScope = scopeFilter === 'all' || t.scope === scopeFilter
      return matchSearch && matchCategory && matchScope
    })
  }, [terms, search, categoryFilter, scopeFilter])

  // 分页
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  // 统计
  const stats = useMemo(() => {
    const total = terms.length
    const shared = terms.filter(t => t.scope === 'shared').length
    const personal = terms.filter(t => t.scope === 'personal').length
    const catCount = categories.length
    return { total, shared, personal, catCount }
  }, [terms])

  const openAdd = () => {
    setEditingTerm(emptyTerm())
    setFormErrors([])
    setModalMode('add')
  }

  const openEdit = (t: TermItem) => {
    setEditingTerm({ ...t })
    setFormErrors([])
    setModalMode('edit')
  }

  const openDelete = (t: TermItem) => {
    setEditingTerm({ ...t })
    setModalMode('delete')
  }

  const closeModal = () => setModalMode(null)

  const handleSubmit = () => {
    if (modalMode === 'delete') {
      setTerms(prev => prev.filter(t => t.id !== editingTerm.id))
      closeModal()
      return
    }
    const errs = validateTerm(editingTerm)
    if (errs.length > 0) { setFormErrors(errs); return }
    if (modalMode === 'add') {
      const id = 'T' + String(Date.now()).slice(-6)
      setTerms(prev => [{
        ...editingTerm,
        id,
        creator: '张建国',
        createTime: new Date().toISOString().slice(0, 10),
      } as TermItem, ...prev])
    } else if (modalMode === 'edit') {
      setTerms(prev => prev.map(t => t.id === editingTerm.id ? { ...t, ...editingTerm } as TermItem : t))
    }
    closeModal()
  }

  const handleField = (field: keyof Partial<TermItem>, value: string | number | boolean) => {
    setEditingTerm(prev => ({ ...prev, [field]: value }))
  }

  const resetFilters = () => {
    setSearch('')
    setCategoryFilter('')
    setScopeFilter('all')
    setPage(1)
  }

  const handleCopyToPersonal = (t: TermItem) => {
    const id = 'T' + String(Date.now()).slice(-6)
    setTerms(prev => [{
      ...t,
      id,
      scope: 'personal',
      code: 'MY-' + t.code,
      name: '我的-' + t.name,
      creator: '张建国',
      createTime: new Date().toISOString().slice(0, 10),
      notes: '从科室共享词库复制',
    } as TermItem, ...prev])
  }

  return (
    <div>
      {/* 页头 */}
      <div style={s.pageHeader}>
        <div style={s.title}>术语词库管理</div>
        <div style={s.statsRow}>
          <div style={s.statItem}>
            <BookOpen size={14} />
            <span>共</span>
            <span style={s.statNum}>{stats.total}</span>
            <span>条</span>
          </div>
          <div style={s.statItem}>
            <Building2 size={14} />
            <span>科室共享</span>
            <span style={s.statNum}>{stats.shared}</span>
            <span>条</span>
          </div>
          <div style={s.statItem}>
            <Star size={14} />
            <span>个人词库</span>
            <span style={s.statNum}>{stats.personal}</span>
            <span>条</span>
          </div>
          <div style={s.statItem}>
            <Filter size={14} />
            <span>分类</span>
            <span style={s.statNum}>{stats.catCount}</span>
            <span>个</span>
          </div>
        </div>
      </div>

      {/* 标签栏：全部/个人/共享 */}
      <div style={s.tabBar}>
        {(['all', 'personal', 'shared'] as const).map(scope => (
          <button
            key={scope}
            style={{
              ...s.tab,
              ...(scopeFilter === scope ? s.tabActive : s.tabInactive),
            }}
            onClick={() => { setScopeFilter(scope); setPage(1) }}
          >
            {scope === 'all' ? '全部词库' : scope === 'personal' ? '个人词库' : '科室共享词库'}
          </button>
        ))}
      </div>

      {/* 工具栏 */}
      <div style={s.toolbar}>
        <div style={s.searchBox}>
          <Search size={15} color="#94a3b8" />
          <input
            style={s.searchInput}
            placeholder="搜索术语名称、编码、拼音、英文、定义..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <select
          style={s.select}
          value={categoryFilter}
          onChange={e => { setCategoryFilter(e.target.value); setPage(1) }}
        >
          <option value="">全部分类</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        {(search || categoryFilter || scopeFilter !== 'all') && (
          <button style={s.btnIcon} onClick={resetFilters}>
            <RotateCcw size={13} /> 重置
          </button>
        )}
        <button style={s.btnSecondary}>
          <Upload size={14} /> 导入
        </button>
        <button style={s.btnSecondary}>
          <Download size={14} /> 导出
        </button>
        <button style={s.btnPrimary} onClick={openAdd}>
          <Plus size={15} /> 新增术语
        </button>
      </div>

      {/* 表格 */}
      {paged.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <div style={s.emptyState}>
            <div style={s.emptyIcon}>
              <BookOpen size={28} color="#94a3b8" />
            </div>
            <div style={s.emptyTitle}>暂无术语数据</div>
            <div style={s.emptyDesc}>当前条件下没有术语记录，请尝试调整筛选条件</div>
            <button style={s.btnPrimary} onClick={openAdd}>
              <Plus size={15} /> 新增第一条术语
            </button>
          </div>
        </div>
      ) : (
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>分类</th>
              <th style={s.th}>编码</th>
              <th style={s.th}>名称</th>
              <th style={s.th}>拼音</th>
              <th style={s.th}>英文名</th>
              <th style={s.th}>适用范围</th>
              <th style={s.th}>状态</th>
              <th style={s.th}>操作</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(t => (
              <tr key={t.id} style={{ background: '#fff' }}>
                <td style={s.td}>
                  <span style={{
                    ...s.categoryTag,
                    backgroundColor: categoryColors[t.category]?.bg || '#f1f5f9',
                    color: categoryColors[t.category]?.color || '#475569',
                  }}>
                    {t.category}
                  </span>
                </td>
                <td style={s.td}>
                  <code style={{ fontFamily: 'monospace', fontSize: 12, background: '#f8fafc', padding: '2px 6px', borderRadius: 4 }}>
                    {t.code}
                  </code>
                </td>
                <td style={s.td}>
                  <div style={{ fontWeight: 600, color: '#1a3a5c' }}>{t.name}</div>
                </td>
                <td style={s.td}>
                  <span style={{ color: '#64748b', fontSize: 12 }}>{t.pinyin || '-'}</span>
                </td>
                <td style={s.td}>
                  <span style={{ color: '#64748b', fontSize: 12 }}>{t.englishName || '-'}</span>
                </td>
                <td style={s.td}>
                  <span style={{ ...s.badge, ...(t.scope === 'shared' ? s.badgeShared : s.badgePersonal) }}>
                    {t.scope === 'shared' ? '科室共享' : '个人词库'}
                  </span>
                </td>
                <td style={s.td}>
                  <span style={{ ...s.badge, ...(t.isActive ? s.badgeActive : s.badgeInactive) }}>
                    {t.isActive ? '启用' : '停用'}
                  </span>
                </td>
                <td style={s.td}>
                  <div style={s.actions}>
                    {t.scope === 'shared' && (
                      <button style={s.btnIcon} onClick={() => handleCopyToPersonal(t)} title="复制到个人词库">
                        <Copy size={13} /> 复制
                      </button>
                    )}
                    <button style={s.btnIcon} onClick={() => openEdit(t)} title="编辑">
                      <Edit2 size={13} /> 编辑
                    </button>
                    <button style={s.btnDanger} onClick={() => openDelete(t)} title="删除">
                      <Trash2 size={13} /> 删除
                    </button>
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
            {/* 删除确认 */}
            {modalMode === 'delete' ? (
              <>
                <div style={s.modalHeader}>
                  <div style={s.modalTitle}>确认删除</div>
                  <button style={s.modalClose} onClick={closeModal}><X size={18} /></button>
                </div>
                <div style={s.modalBody}>
                  <div style={s.deleteModalText}>
                    确定要删除术语 <strong>{editingTerm.name}</strong> 吗？
                  </div>
                  <div style={s.deleteModalText}>
                    此操作不可恢复。
                  </div>
                </div>
                <div style={s.modalFooter}>
                  <button style={s.btnCancel} onClick={closeModal}>取消</button>
                  <button style={s.btnDeleteConfirm} onClick={handleSubmit}>确认删除</button>
                </div>
              </>
            ) : (
              <>
                <div style={s.modalHeader}>
                  <div style={s.modalTitle}>
                    {modalMode === 'add' ? '新增术语' : '编辑术语'}
                  </div>
                  <button style={s.modalClose} onClick={closeModal}><X size={18} /></button>
                </div>
                <div style={s.modalBody}>
                  {formErrors.length > 0 && (
                    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, padding: '10px 12px', marginBottom: 14 }}>
                      {formErrors.map((err, i) => (
                        <div key={i} style={{ fontSize: 13, color: '#dc2626' }}>{err}</div>
                      ))}
                    </div>
                  )}
                  <div style={s.formGrid}>
                    <div style={s.formGroup}>
                      <label style={s.label}>分类<span style={s.required}>*</span></label>
                      <select
                        style={s.input}
                        value={editingTerm.category}
                        onChange={e => handleField('category', e.target.value)}
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div style={s.formGroup}>
                      <label style={s.label}>适用范围<span style={s.required}>*</span></label>
                      <select
                        style={s.input}
                        value={editingTerm.scope}
                        onChange={e => handleField('scope', e.target.value)}
                      >
                        <option value="personal">个人词库</option>
                        <option value="shared">科室共享词库</option>
                      </select>
                    </div>
                    <div style={s.formGroup}>
                      <label style={s.label}>编码<span style={s.required}>*</span></label>
                      <input
                        style={s.input}
                        placeholder="如 ABD-LIV"
                        value={editingTerm.code}
                        onChange={e => handleField('code', e.target.value)}
                      />
                    </div>
                    <div style={s.formGroup}>
                      <label style={s.label}>排序号</label>
                      <input
                        type="number"
                        style={s.input}
                        placeholder="0"
                        value={editingTerm.sortOrder}
                        onChange={e => handleField('sortOrder', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div style={{ ...s.formGroup, gridColumn: '1 / -1' }}>
                      <label style={s.label}>名称<span style={s.required}>*</span></label>
                      <input
                        style={s.input}
                        placeholder="术语名称"
                        value={editingTerm.name}
                        onChange={e => handleField('name', e.target.value)}
                      />
                    </div>
                    <div style={s.formGroup}>
                      <label style={s.label}>拼音</label>
                      <input
                        style={s.input}
                        placeholder="拼音首字母"
                        value={editingTerm.pinyin}
                        onChange={e => handleField('pinyin', e.target.value)}
                      />
                    </div>
                    <div style={s.formGroup}>
                      <label style={s.label}>英文名</label>
                      <input
                        style={s.input}
                        placeholder="English name"
                        value={editingTerm.englishName}
                        onChange={e => handleField('englishName', e.target.value)}
                      />
                    </div>
                    <div style={{ ...s.formGroup, gridColumn: '1 / -1' }}>
                      <label style={s.label}>定义/描述</label>
                      <textarea
                        style={s.textarea}
                        placeholder="术语的定义或超声描述说明"
                        value={editingTerm.definition}
                        onChange={e => handleField('definition', e.target.value)}
                      />
                    </div>
                    <div style={{ ...s.formGroup, gridColumn: '1 / -1' }}>
                      <label style={s.label}>备注</label>
                      <input
                        style={s.input}
                        placeholder="备注信息"
                        value={editingTerm.notes}
                        onChange={e => handleField('notes', e.target.value)}
                      />
                    </div>
                    <div style={{ ...s.formGroup, gridColumn: '1 / -1' }}>
                      <label style={s.checkboxLabel}>
                        <input
                          type="checkbox"
                          style={s.checkbox}
                          checked={editingTerm.isActive}
                          onChange={e => handleField('isActive', e.target.checked)}
                        />
                        启用该术语
                      </label>
                    </div>
                  </div>
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
      )}
    </div>
  )
}
