// @ts-nocheck
// G003 超声RIS - 材料管理页面
import { useState } from 'react'
import { Package, Search, Plus, Filter, Download, AlertCircle, TrendingDown } from 'lucide-react'

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
  statCard: {
    background: '#fff', borderRadius: 10, padding: 16, flex: 1,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', minWidth: 180,
  },
  progressBar: {
    width: 80, height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden',
  },
}

const materials = [
  { id: 'MAT001', name: '超声耦合剂', category: '耗材', unit: '瓶', stock: 120, minStock: 50, price: 25, supplier: '医疗器械公司A', lastRestock: '2026-04-20' },
  { id: 'MAT002', name: '打印纸(报告)', category: '耗材', unit: '包', stock: 45, minStock: 30, price: 35, supplier: '办公用品公司B', lastRestock: '2026-04-15' },
  { id: 'MAT003', name: '探头清洁纸', category: '耗材', unit: '盒', stock: 18, minStock: 20, price: 45, supplier: '医疗器械公司A', lastRestock: '2026-04-10' },
  { id: 'MAT004', name: '探头保护罩', category: '防护', unit: '个', stock: 200, minStock: 100, price: 8, supplier: '医疗器械公司C', lastRestock: '2026-04-18' },
  { id: 'MAT005', name: '酒精消毒棉', category: '消毒', unit: '瓶', stock: 35, minStock: 20, price: 15, supplier: '消毒用品公司D', lastRestock: '2026-04-22' },
  { id: 'MAT006', name: '利器盒', category: '废物处理', unit: '个', stock: 8, minStock: 15, price: 22, supplier: '环保公司E', lastRestock: '2026-04-05' },
  { id: 'MAT007', name: '医疗垃圾袋', category: '废物处理', unit: '包', stock: 50, minStock: 25, price: 18, supplier: '环保公司E', lastRestock: '2026-04-12' },
  { id: 'MAT008', name: '墨盒(打印机)', category: '设备配件', unit: '个', stock: 5, minStock: 3, price: 280, supplier: '办公用品公司B', lastRestock: '2026-04-25' },
]

const categoryColors: Record<string, { bg: string; color: string }> = {
  '耗材': { bg: '#eff6ff', color: '#3b82f6' },
  '防护': { bg: '#f0fdf4', color: '#22c55e' },
  '消毒': { bg: '#fff7ed', color: '#f97316' },
  '废物处理': { bg: '#f5f3ff', color: '#8b5cf6' },
  '设备配件': { bg: '#fef2f2', color: '#ef4444' },
}

export default function MaterialsPage() {
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('全部')

  const filtered = materials.filter(item => {
    const matchSearch = item.name.includes(search) || item.supplier.includes(search)
    const matchCategory = filterCategory === '全部' || item.category === filterCategory
    return matchSearch && matchCategory
  })

  const categories = ['全部', ...Array.from(new Set(materials.map(i => i.category)))]
  const lowStockItems = materials.filter(i => i.stock < i.minStock)
  const totalValue = materials.reduce((sum, i) => sum + i.stock * i.price, 0)

  return (
    <div style={s.root}>
      <div style={s.header}>
        <h1 style={s.title}>材料管理</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ ...s.actionBtn, background: '#3b82f6', color: '#fff' }}>
            <Plus size={14} /> 新增入库
          </button>
          <button style={{ ...s.actionBtn, background: '#fff', color: '#475569', border: '1px solid #e2e8f0' }}>
            <Download size={14} /> 导出
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        <div style={s.statCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Package size={18} color="#3b82f6" />
            <span style={{ fontSize: 13, color: '#64748b' }}>材料种类</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#1a3a5c' }}>{materials.length}</div>
        </div>
        <div style={s.statCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <AlertCircle size={18} color="#ef4444" />
            <span style={{ fontSize: 13, color: '#64748b' }}>库存不足</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#ef4444' }}>{lowStockItems.length}</div>
        </div>
        <div style={s.statCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <TrendingDown size={18} color="#22c55e" />
            <span style={{ fontSize: 13, color: '#64748b' }}>库存总值</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#1a3a5c' }}>¥{totalValue.toLocaleString()}</div>
        </div>
      </div>

      <div style={s.filterRow}>
        <Search size={14} color="#64748b" />
        <input style={s.searchInput} placeholder="搜索材料名称/供应商..." value={search} onChange={e => setSearch(e.target.value)} />
        <select style={s.filterBtn} value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>材料ID</th>
              <th style={s.th}>材料名称</th>
              <th style={s.th}>分类</th>
              <th style={s.th}>单位</th>
              <th style={s.th}>库存</th>
              <th style={s.th}>最低库存</th>
              <th style={s.th}>库存状态</th>
              <th style={s.th}>单价</th>
              <th style={s.th}>供应商</th>
              <th style={s.th}>最后入库</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => {
              const stockRate = (item.stock / item.minStock) * 100
              const isLow = item.stock < item.minStock
              return (
                <tr key={item.id} style={{ cursor: 'pointer' }}>
                  <td style={s.td}><span style={{ fontFamily: 'monospace', color: '#3b82f6' }}>{item.id}</span></td>
                  <td style={{ ...s.td, fontWeight: 600, color: '#1a3a5c' }}>{item.name}</td>
                  <td style={s.td}>
                    <span style={{ ...s.badge, background: categoryColors[item.category]?.bg, color: categoryColors[item.category]?.color }}>
                      {item.category}
                    </span>
                  </td>
                  <td style={s.td}>{item.unit}</td>
                  <td style={{ ...s.td, fontWeight: 600, color: isLow ? '#ef4444' : '#1a3a5c' }}>{item.stock}</td>
                  <td style={s.td}>{item.minStock}</td>
                  <td style={s.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={s.progressBar}>
                        <div style={{ width: `${Math.min(stockRate, 100)}%`, height: '100%', background: isLow ? '#ef4444' : stockRate < 150 ? '#f97316' : '#22c55e' }} />
                      </div>
                      <span style={{ fontSize: 11, color: isLow ? '#ef4444' : '#64748b', minWidth: 45 }}>
                        {stockRate.toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td style={s.td}>¥{item.price}</td>
                  <td style={s.td}>{item.supplier}</td>
                  <td style={s.td}>{item.lastRestock}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
