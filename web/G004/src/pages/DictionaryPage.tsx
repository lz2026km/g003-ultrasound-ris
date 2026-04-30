// @ts-nocheck
// ============================================================
// G004 内镜管理系统 - 数据字典管理页面
// ============================================================
import { useState, useMemo } from 'react'
import {
  Search, Plus, Edit2, Trash2, X, ChevronLeft, ChevronRight,
  BookOpen, Filter, RotateCcw
} from 'lucide-react'
import type { DictionaryItem } from '../types'
import { initialDictionaries } from '../data/initialData'

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
    background: '#fff', borderRadius: 12, width: 520, maxHeight: '90vh',
    overflow: 'hidden', display: 'flex', flexDirection: 'column',
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
  },
  modalHeader: {
    padding: '16px 20px', borderBottom: '1px solid #e2e8f0',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  modalTitle: { fontSize: 15, fontWeight: 700, color: '#1a3a5c' },
  modalClose: {
    background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8',
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
  checkbox: {
    width: 16, height: 16, cursor: 'pointer',
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
    fontSize: 16,
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
  deleteModalText: {
    fontSize: 14, color: '#475569', lineHeight: 1.6, marginBottom: 8,
  },
  stats: {
    display: 'flex', gap: 24, marginLeft: 'auto',
  },
  statItem: {
    display: 'flex', alignItems: 'center', gap: 6,
    fontSize: 13, color: '#64748b',
  },
  statNum: { fontWeight: 700, color: '#1a3a5c' },
  categoryTag: {
    display: 'inline-block', padding: '2px 8px', borderRadius: 6,
    fontSize: 11, fontWeight: 600,
  },
}

// ---------- 分类颜色映射 ----------
const categoryColors: Record<string, string> = {
  '检查室': { backgroundColor: '#dbeafe', color: '#1d4ed8' },
  '内镜类型': { backgroundColor: '#fce7f3', color: '#be185d' },
  '诊断术语': { backgroundColor: '#dcfce7', color: '#16a34a' },
  '麻醉方式': { backgroundColor: '#fef3c7', color: '#92400e' },
  '消毒剂': { backgroundColor: '#e0e7ff', color: '#4338ca' },
  '手术器械': { backgroundColor: '#fdf4ff', color: '#a21caf' },
  '并发症': { backgroundColor: '#fff1f2', color: '#e11d48' },
}

// ---------- 空字典项 ----------
const emptyDictionary = (): Partial<DictionaryItem> => ({
  category: '',
  code: '',
  name: '',
  pinyin: '',
  sortOrder: 0,
  isActive: true,
  notes: '',
})

// ---------- 校验 ----------
const validateDictionary = (d: Partial<DictionaryItem>): string[] => {
  const errs: string[] = []
  if (!(d.category ?? "").trim()) errs.push('分类不能为空')
  if (!d.code ?? "".trim()) errs.push('编码不能为空')
  if (!d.name ?? "".trim()) errs.push('名称不能为空')
  if (d.sortOrder ?? 0 < 0) errs.push('排序号不能为负数')
  return errs
}

// ---------- 主组件 ----------
export default function DictionaryPage() {
  const [dictionaries, setDictionaries] = useState<DictionaryItem[]>(initialDictionaries)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 10

  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'delete' | null>(null)
  const [editingDictionary, setEditingDictionary] = useState<Partial<DictionaryItem>>(emptyDictionary())
  const [formErrors, setFormErrors] = useState<string[]>([])

  // 获取所有分类
  const categories = useMemo(() => {
    const cats = [...new Set(dictionaries.map(d => (d.category ?? "")))]
    return cats.sort()
  }, [dictionaries])

  // 过滤
  const filtered = useMemo(() => {
    const kw = search.trim().toLowerCase()
    return dictionaries.filter(d => {
      const matchSearch = !kw ||
        (d.name ?? "").toLowerCase().includes(kw) ||
        (d.code ?? "").toLowerCase().includes(kw) ||
        d.pinyin?.toLowerCase().includes(kw) ||
        d.notes?.toLowerCase().includes(kw)
      const matchCategory = !categoryFilter || ((d.category ?? "")) === categoryFilter
      return matchSearch && matchCategory
    })
  }, [dictionaries, search, categoryFilter])

  // 分页
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  // 统计
  const stats = useMemo(() => {
    const total = dictionaries.length
    const active = dictionaries.filter(d => d.isActive).length
    const catCount = categories.length
    return { total, active, catCount }
  }, [dictionaries, categories])

  const openAdd = () => {
    setEditingDictionary(emptyDictionary())
    setFormErrors([])
    setModalMode('add')
  }

  const openEdit = (d: DictionaryItem) => {
    setEditingDictionary({ ...d })
    setFormErrors([])
    setModalMode('edit')
  }

  const openDelete = (d: DictionaryItem) => {
    setEditingDictionary({ ...d })
    setModalMode('delete')
  }

  const closeModal = () => setModalMode(null)

  const handleSubmit = () => {
    if (modalMode === 'delete') {
      setDictionaries(prev => prev.filter(d => d.id !== editingDictionary.id))
      closeModal()
      return
    }
    const errs = validateDictionary(editingDictionary)
    if (errs.length > 0) { setFormErrors(errs); return }
    if (modalMode === 'add') {
      const id = 'D' + String(Date.now()).slice(-6)
      setDictionaries(prev => [{ ...editingDictionary, id }, ...prev])
    } else if (modalMode === 'edit') {
      setDictionaries(prev => prev.map(d => d.id === editingDictionary.id ? { ...editingDictionary } as DictionaryItem : d))
    }
    closeModal()
  }

  const handleField = (field: keyof Partial<DictionaryItem>, value: string | number | boolean) => {
    setEditingDictionary(prev => ({ ...prev, [field]: value }))
  }

  const resetFilters = () => {
    setSearch('')
    setCategoryFilter('')
    setPage(1)
  }

  return (
    <div>
      {/* 页头 */}
      <div style={s.pageHeader}>
        <div style={s.title}>数据字典管理</div>
        <div style={s.stats}>
          <div style={s.statItem}>
            <BookOpen size={14} />
            <span>共</span>
            <span style={s.statNum}>{stats.total}</span>
            <span>条</span>
          </div>
          <div style={s.statItem}>
            <span>启用</span>
            <span style={s.statNum}>{stats.active}</span>
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

      {/* 工具栏：搜索 + 筛选 + 新增 */}
      <div style={s.toolbar}>
        <div style={s.searchBox}>
          <Search size={15} color="#94a3b8" />
          <input
            style={s.searchInput}
            placeholder="搜索名称、编码、拼音、备注..."
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
        {(search || categoryFilter) && (
          <button style={s.btnIcon} onClick={resetFilters}>
            <RotateCcw size={13} /> 重置
          </button>
        )}
        <button style={s.btnPrimary} onClick={openAdd}>
          <Plus size={15} /> 新增字典项
        </button>
      </div>

      {/* 表格 */}
      {paged.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <div style={s.emptyState}>
            <div style={s.emptyIcon}>
              <BookOpen size={28} color="#94a3b8" />
            </div>
            <div style={s.emptyTitle}>暂无字典数据</div>
            <div style={s.emptyDesc}>当前分类下没有字典记录，请尝试调整筛选条件</div>
            <button style={s.btnPrimary} onClick={openAdd}>
              <Plus size={15} /> 新增第一条字典
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
              <th style={s.th}>排序</th>
              <th style={s.th}>状态</th>
              <th style={s.th}>备注</th>
              <th style={s.th}>操作</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(d => (
              <tr key={d.id} style={{ background: '#fff' }}>
                <td style={s.td}>
                  <span
                    style={{
                      ...s.categoryTag,
                      ...(categoryColors[(d.category ?? "")] || { backgroundColor: '#f1f5f9', color: '#475569' }),
                    }}
                  >
                    {(d.category ?? "")}
                  </span>
                </td>
                <td style={s.td}>
                  <code style={{ fontFamily: 'monospace', fontSize: 12, background: '#f8fafc', padding: '2px 6px', borderRadius: 4 }}>
                    {d.code ?? ""}
                  </code>
                </td>
                <td style={s.td}>
                  <div style={{ fontWeight: 600, color: '#1a3a5c' }}>{d.name ?? ""}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>{d.id}</div>
                </td>
                <td style={s.td}>
                  <span style={{ color: '#64748b', fontSize: 12 }}>{d.pinyin || '-'}</span>
                </td>
                <td style={s.td}>
                  <span style={{ color: '#64748b' }}>{d.sortOrder ?? 0}</span>
                </td>
                <td style={s.td}>
                  <span style={{ ...s.badge, ...(d.isActive ? s.badgeActive : s.badgeInactive) }}>
                    {d.isActive ? '启用' : '停用'}
                  </span>
                </td>
                <td style={s.td}>
                  <div
                    style={{
                      maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap', color: '#94a3b8', fontSize: 12,
                    }}
                    title={d.notes}
                  >
                    {d.notes || '-'}
                  </div>
                </td>
                <td style={s.td}>
                  <div style={s.actions}>
                    <button style={s.btnIcon} onClick={() => openEdit(d)} title="编辑">
                      <Edit2 size={13} /> 编辑
                    </button>
                    <button style={s.btnDanger} onClick={() => openDelete(d)} title="删除">
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
                    确定要删除字典项 <strong>{editingDictionary.name}</strong> 吗？
                  </div>
                  <div style={s.deleteModalText}>
                    分类：{editingDictionary.category}，编码：{editingDictionary.code}
                  </div>
                  <div style={{ ...s.deleteModalText, color: '#dc2626' }}>
                    此操作不可恢复，可能影响依赖此字典的业务功能。
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
                  <div style={s.modalTitle}>{modalMode === 'add' ? '新增字典项' : '编辑字典项'}</div>
                  <button style={s.modalClose} onClick={closeModal}><X size={18} /></button>
                </div>
                <div style={s.modalBody}>
                  {formErrors.length > 0 && (
                    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, padding: '10px 14px', marginBottom: 14 }}>
                      {formErrors.map((e, i) => (
                        <div key={i} style={{ fontSize: 12, color: '#dc2626' }}>• {e}</div>
                      ))}
                    </div>
                  )}
                  <div style={s.formGrid}>
                    {/* 分类 */}
                    <div style={s.formGroup}>
                      <label style={s.label}>分类<span style={s.required}>*</span></label>
                      {modalMode === 'add' ? (
                        <input
                          style={s.input}
                          value={editingDictionary.category}
                          onChange={e => handleField('category', e.target.value)}
                          placeholder="如：检查室、诊断术语"
                          list="categoryList"
                        />
                      ) : (
                        <input
                          style={{ ...s.input, background: '#f8fafc' }}
                          value={editingDictionary.category}
                          disabled
                        />
                      )}
                      <datalist id="categoryList">
                        {categories.map(cat => (
                          <option key={cat} value={cat} />
                        ))}
                      </datalist>
                    </div>
                    {/* 编码 */}
                    <div style={s.formGroup}>
                      <label style={s.label}>编码<span style={s.required}>*</span></label>
                      <input
                        style={s.input}
                        value={editingDictionary.code}
                        onChange={e => handleField('code', e.target.value.toUpperCase())}
                        placeholder="如：GAS、RJ01"
                      />
                    </div>
                    {/* 名称 */}
                    <div style={s.formGroup}>
                      <label style={s.label}>名称<span style={s.required}>*</span></label>
                      <input
                        style={s.input}
                        value={editingDictionary.name}
                        onChange={e => handleField('name', e.target.value)}
                        placeholder="请输入字典名称"
                      />
                    </div>
                    {/* 拼音 */}
                    <div style={s.formGroup}>
                      <label style={s.label}>拼音码</label>
                      <input
                        style={s.input}
                        value={editingDictionary.pinyin || ''}
                        onChange={e => handleField('pinyin', e.target.value.toUpperCase())}
                        placeholder="如：WJ、NJSN1"
                      />
                    </div>
                    {/* 排序号 */}
                    <div style={s.formGroup}>
                      <label style={s.label}>排序号</label>
                      <input
                        style={s.input}
                        type="number"
                        min={0}
                        value={editingDictionary.sortOrder}
                        onChange={e => handleField('sortOrder', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    {/* 是否启用 */}
                    <div style={s.formGroup}>
                      <label style={s.label}>状态</label>
                      <label style={s.checkboxLabel}>
                        <input
                          style={s.checkbox}
                          type="checkbox"
                          checked={editingDictionary.isActive}
                          onChange={e => handleField('isActive', e.target.checked)}
                        />
                        启用此字典项
                      </label>
                    </div>
                    {/* 备注 */}
                    <div style={{ ...s.formGroup, ...s.formGroupFull }}>
                      <label style={s.label}>备注</label>
                      <textarea
                        style={s.textarea}
                        value={editingDictionary.notes || ''}
                        onChange={e => handleField('notes', e.target.value)}
                        placeholder="可选，填写备注说明"
                      />
                    </div>
                  </div>
                </div>
                <div style={s.modalFooter}>
                  <button style={s.btnCancel} onClick={closeModal}>取消</button>
                  <button style={s.btnSubmit} onClick={handleSubmit}>
                    {modalMode === 'add' ? '新增' : '保存'}
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
