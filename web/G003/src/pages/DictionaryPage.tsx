// @ts-nocheck
// G003 超声RIS - 数据字典页面
import { useState } from 'react'
import { BookOpen, Search, Plus, Edit, Trash2, FolderOpen } from 'lucide-react'

const s: Record<string, React.CSSProperties> = {
  root: { padding: 0 },
  header: { marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 700, color: '#1a3a5c', margin: 0 },
  filterRow: {
    display: 'flex', gap: 12, alignItems: 'center', background: '#f8fafc',
    padding: '12px 16px', borderRadius: 10, marginBottom: 20, flexWrap: 'wrap' as const,
  },
  searchInput: {
    flex: 1, minWidth: 200, padding: '8px 12px', borderRadius: 6,
    border: '1px solid #e2e8f0', fontSize: 13, color: '#1a3a5c',
    background: '#fff', outline: 'none', minHeight: 40,
  },
  filterBtn: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
    borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff',
    cursor: 'pointer', fontSize: 13, color: '#64748b', minHeight: 40,
  },
  actionBtn: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
    borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13,
    fontWeight: 500, minHeight: 40,
  },
  tableWrap: {
    background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    background: '#f8fafc', padding: '12px 16px', textAlign: 'left',
    fontSize: 13, fontWeight: 600, color: '#475569', borderBottom: '1px solid #e2e8f0',
  },
  td: {
    padding: '14px 16px', fontSize: 13, color: '#475569', borderBottom: '1px solid #f1f5f9',
  },
  badge: {
    display: 'inline-flex', padding: '2px 10px', borderRadius: 20,
    fontSize: 12, fontWeight: 500,
  },
  categoryTag: {
    display: 'inline-flex', padding: '2px 10px', borderRadius: 20,
    fontSize: 12, fontWeight: 500,
  },
}

const dictionaryCategories = [
  { id: 'D001', code: 'EXAM_TYPE', name: '检查类型', description: '超声检查类型字典', category: '检查', itemCount: 45, updateTime: '2026-04-20' },
  { id: 'D002', code: 'BODY_PART', name: '检查部位', description: '人体检查部位字典', category: '检查', itemCount: 128, updateTime: '2026-04-18' },
  { id: 'D003', code: 'DEVICE_STATUS', name: '设备状态', description: '设备运行状态字典', category: '设备', itemCount: 12, updateTime: '2026-04-15' },
  { id: 'D004', code: 'DIAGNOSIS_CODE', name: '诊断代码', description: '超声诊断代码字典', category: '诊断', itemCount: 356, updateTime: '2026-04-22' },
  { id: 'D005', code: 'REPORT_TEMPLATE', name: '报告模板', description: '超声报告模板字典', category: '报告', itemCount: 28, updateTime: '2026-04-10' },
  { id: 'D006', code: 'QUALITY_LEVEL', name: '质量等级', description: '图像质量等级字典', category: '质量', itemCount: 5, updateTime: '2026-04-05' },
  { id: 'D007', code: 'EXAM_PROTOCOL', name: '检查协议', description: '超声检查协议字典', category: '检查', itemCount: 67, updateTime: '2026-04-25' },
  { id: 'D008', code: 'ALERT_LEVEL', name: '警报级别', description: '危急值警报级别字典', category: '警报', itemCount: 4, updateTime: '2026-04-12' },
]

const categoryColors: Record<string, { bg: string; color: string }> = {
  '检查': { bg: '#eff6ff', color: '#3b82f6' },
  '设备': { bg: '#f0fdf4', color: '#22c55e' },
  '诊断': { bg: '#fef2f2', color: '#ef4444' },
  '报告': { bg: '#fff7ed', color: '#f97316' },
  '质量': { bg: '#f5f3ff', color: '#8b5cf6' },
  '警报': { bg: '#fef2f2', color: '#ef4444' },
}

export default function DictionaryPage() {
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('全部')

  const filtered = dictionaryCategories.filter(item => {
    const matchSearch = item.name.includes(search) || item.code.includes(search) || item.description.includes(search)
    const matchCategory = filterCategory === '全部' || item.category === filterCategory
    return matchSearch && matchCategory
  })

  const categories = ['全部', ...Array.from(new Set(dictionaryCategories.map(i => i.category)))]

  return (
    <div style={s.root}>
      <div style={s.header}>
        <h1 style={s.title}>数据字典</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ ...s.actionBtn, background: '#3b82f6', color: '#fff' }}>
            <Plus size={14} /> 新增字典
          </button>
        </div>
      </div>

      <div style={s.filterRow}>
        <Search size={14} color="#64748b" />
        <input style={s.searchInput} placeholder="搜索字典名称/代码/描述..." value={search} onChange={e => setSearch(e.target.value)} />
        <select style={s.filterBtn} value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>字典ID</th>
              <th style={s.th}>字典代码</th>
              <th style={s.th}>字典名称</th>
              <th style={s.th}>描述</th>
              <th style={s.th}>分类</th>
              <th style={s.th}>条目数</th>
              <th style={s.th}>更新时间</th>
              <th style={s.th}>操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} style={{ cursor: 'pointer' }}>
                <td style={s.td}><span style={{ fontFamily: 'monospace', color: '#3b82f6' }}>{item.id}</span></td>
                <td style={s.td}><code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>{item.code}</code></td>
                <td style={{ ...s.td, fontWeight: 600, color: '#1a3a5c' }}>{item.name}</td>
                <td style={s.td}>{item.description}</td>
                <td style={s.td}>
                  <span style={{ ...s.categoryTag, background: categoryColors[item.category]?.bg, color: categoryColors[item.category]?.color }}>
                    {item.category}
                  </span>
                </td>
                <td style={s.td}>{item.itemCount}</td>
                <td style={s.td}>{item.updateTime}</td>
                <td style={s.td}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button style={{ ...s.actionBtn, padding: '4px 8px', background: '#f0fdf4', color: '#22c55e', border: '1px solid #bbf7d0' }}>
                      <FolderOpen size={12} />
                    </button>
                    <button style={{ ...s.actionBtn, padding: '4px 8px', background: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe' }}>
                      <Edit size={12} />
                    </button>
                    <button style={{ ...s.actionBtn, padding: '4px 8px', background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca' }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
