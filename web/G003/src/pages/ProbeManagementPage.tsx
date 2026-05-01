import React, { useState } from 'react'
import {
  Scan, Wrench, Package, BarChart3, Search, Plus, X, Edit, Trash2,
  AlertTriangle, CheckCircle, Clock, TrendingUp, TrendingDown, Activity,
  Filter, Download, RefreshCw
} from 'lucide-react'

// ===== 演示数据：探头数据 =====
const mockProbes = [
  { id: 'PRB001', name: '凸阵探头 C5-2', model: 'Mindray C5-2', serial: 'SN2022C52001', vendor: '迈瑞', type: '凸阵', frequency: '2-5MHz', purchaseDate: '2022-03-15', dept: '腹部超声室', status: '在用', useCount: 3250, lastUse: '2026-04-30', nextMaint: '2026-05-20', lifeMonth: 48, deptRate: 82, totalCost: 28000, maintCost: 1800, spareCost: 0, imageUrl: '' },
  { id: 'PRB002', name: '线阵探头 L12-4E', model: 'Mindray L12-4E', serial: 'SN2022L12001', vendor: '迈瑞', type: '线阵', frequency: '4-12MHz', purchaseDate: '2022-03-15', dept: '浅表超声室', status: '在用', useCount: 4120, lastUse: '2026-04-30', nextMaint: '2026-06-01', lifeMonth: 48, deptRate: 91, totalCost: 32000, maintCost: 2200, spareCost: 500, imageUrl: '' },
  { id: 'PRB003', name: '相控阵探头 P4-2', model: 'Philips P4-2', serial: 'SN2021P42001', vendor: '飞利浦', type: '相控阵', frequency: '1-5MHz', purchaseDate: '2021-07-20', dept: '心脏超声室', status: '在用', useCount: 2890, lastUse: '2026-04-29', nextMaint: '2026-05-15', lifeMonth: 58, deptRate: 76, totalCost: 45000, maintCost: 3500, spareCost: 1200, imageUrl: '' },
  { id: 'PRB004', name: '凸阵探头 CA1-5A', model: 'GE CA1-5A', serial: 'SN2020CA15001', vendor: 'GE医疗', type: '凸阵', frequency: '1-5MHz', purchaseDate: '2020-11-08', dept: '腹部超声室', status: '维保中', useCount: 5234, lastUse: '2026-04-28', nextMaint: '2026-05-05', lifeMonth: 64, deptRate: 88, totalCost: 38000, maintCost: 6800, spareCost: 2100, imageUrl: '' },
  { id: 'PRB005', name: '腔内探头 EC4-9', model: 'Siemens EC4-9', serial: 'SN2019EC49001', vendor: '西门子', type: '腔内', frequency: '4-9MHz', purchaseDate: '2019-06-01', dept: '妇产科超声室', status: '在用', useCount: 6920, lastUse: '2026-04-30', nextMaint: '2026-05-10', lifeMonth: 82, deptRate: 95, totalCost: 52000, maintCost: 8200, spareCost: 3400, imageUrl: '' },
  { id: 'PRB006', name: '线阵探头 ML6-15', model: 'Mindray ML6-15', serial: 'SN2023ML15001', vendor: '迈瑞', type: '线阵', frequency: '6-15MHz', purchaseDate: '2023-02-14', dept: '血管超声室', status: '在用', useCount: 1580, lastUse: '2026-04-30', nextMaint: '2026-07-01', lifeMonth: 38, deptRate: 65, totalCost: 42000, maintCost: 800, spareCost: 0, imageUrl: '' },
  { id: 'PRB007', name: '凸阵探头 C7-3', model: 'Philips C7-3', serial: 'SN2018C73001', vendor: '飞利浦', type: '凸阵', frequency: '3-7MHz', purchaseDate: '2018-09-30', dept: '腹部超声室', status: '已报废', useCount: 11230, lastUse: '2024-12-31', nextMaint: '-', lifeMonth: 91, deptRate: 100, totalCost: 25000, maintCost: 15000, spareCost: 8900, imageUrl: '' },
  { id: 'PRB008', name: '经食道探头 X7-2t', model: 'Philips X7-2t', serial: 'SN2022X72001', vendor: '飞利浦', type: '经食道', frequency: '2-7MHz', purchaseDate: '2022-11-11', dept: '心脏超声室', status: '在用', useCount: 890, lastUse: '2026-04-30', nextMaint: '2026-05-28', lifeMonth: 41, deptRate: 45, totalCost: 120000, maintCost: 1500, spareCost: 0, imageUrl: '' },
  { id: 'PRB009', name: '儿科探头 S4-2', model: 'GE S4-2', serial: 'SN2021S42001', vendor: 'GE医疗', type: '凸阵', frequency: '2-4MHz', purchaseDate: '2021-03-15', dept: '儿科超声室', status: '空闲', useCount: 2100, lastUse: '2026-04-25', nextMaint: '2026-06-15', lifeMonth: 61, deptRate: 52, totalCost: 35000, maintCost: 1200, spareCost: 300, imageUrl: '' },
  { id: 'PRB010', name: '穿刺探头 P9-4', model: 'Mindray P9-4', serial: 'SN2020P94001', vendor: '迈瑞', type: '穿刺', frequency: '4-9MHz', purchaseDate: '2020-07-01', dept: '介入超声室', status: '在用', useCount: 3450, lastUse: '2026-04-30', nextMaint: '2026-05-18', lifeMonth: 69, deptRate: 78, totalCost: 48000, maintCost: 4200, spareCost: 1800, imageUrl: '' },
]

// ===== 维护记录 =====
const maintenanceRecords = [
  { id: 'MNT001', date: '2026-04-10', probe: 'PRB001', type: '常规保养', cost: 600, vendor: '迈瑞维修站', result: '合格', operator: '李工程师' },
  { id: 'MNT002', date: '2026-03-28', probe: 'PRB004', type: '故障维修', cost: 2800, vendor: 'GE维修站', result: '已修复', operator: '张技师' },
  { id: 'MNT003', date: '2026-03-15', probe: 'PRB005', type: '常规保养', cost: 800, vendor: '西门子维修站', result: '合格', operator: '李工程师' },
  { id: 'MNT004', date: '2026-03-01', probe: 'PRB002', type: '配件更换', cost: 1500, vendor: '迈瑞维修站', result: '已修复', operator: '王技师' },
  { id: 'MNT005', date: '2026-02-20', probe: 'PRB010', type: '故障维修', cost: 2200, vendor: '第三方维修', result: '已修复', operator: '赵工程师' },
  { id: 'MNT006', date: '2026-02-05', probe: 'PRB007', type: '评估报告', cost: 0, vendor: '设备科', result: '建议报废', operator: '孙高工' },
  { id: 'MNT007', date: '2026-01-18', probe: 'PRB003', type: '常规保养', cost: 700, vendor: '飞利浦维修站', result: '合格', operator: '李工程师' },
  { id: 'MNT008', date: '2026-01-05', probe: 'PRB006', type: '常规保养', cost: 500, vendor: '迈瑞维修站', result: '合格', operator: '张技师' },
]

// ===== 配件数据 =====
const accessories = [
  { id: 'ACC001', name: '探头保护套', spec: '标准型', unit: '盒/100个', stock: 45, minStock: 20, maxStock: 100, price: 280, vendor: '康林医疗', lastPurchase: '2026-03-15' },
  { id: 'ACC002', name: '耦合剂', spec: '250ml/瓶', unit: '箱/24瓶', stock: 32, minStock: 10, maxStock: 50, price: 360, vendor: '洁瑞医疗', lastPurchase: '2026-04-01' },
  { id: 'ACC003', name: '探头消毒盒', spec: '中型', unit: '个', stock: 8, minStock: 5, maxStock: 15, price: 580, vendor: '安捷医疗', lastPurchase: '2026-02-20' },
  { id: 'ACC004', name: '线阵探头支架', spec: 'L12-4E专用', unit: '个', stock: 3, minStock: 2, maxStock: 6, price: 420, vendor: '迈瑞原厂', lastPurchase: '2025-12-10' },
  { id: 'ACC005', name: '探头清洁湿巾', spec: '医用级', unit: '包/50片', stock: 68, minStock: 15, maxStock: 80, price: 85, vendor: '3M医疗', lastPurchase: '2026-04-15' },
  { id: 'ACC006', name: '经食道探头套', spec: 'TEE专用', unit: '盒/20个', stock: 12, minStock: 8, maxStock: 30, price: 680, vendor: '飞利浦原厂', lastPurchase: '2026-03-28' },
  { id: 'ACC007', name: '穿刺架', spec: '通用型', unit: '套', stock: 5, minStock: 3, maxStock: 10, price: 1280, vendor: '巴德医疗', lastPurchase: '2026-01-15' },
  { id: 'ACC008', name: '探头存储盒', spec: '防震型', unit: '个', stock: 15, minStock: 5, maxStock: 20, price: 380, vendor: '通用医疗', lastPurchase: '2025-11-20' },
]

// ===== KPI数据 =====
const kpiData = {
  totalProbes: 10,
  inUse: 7,
  underMaintenance: 1,
  idle: 1,
  scrapped: 1,
  totalValue: 488000,
  totalMaintCost: 41700,
  totalSpareCost: 18200,
  avgUsageRate: 75.2,
  avgMaintInterval: 4.2,
  probeTypes: [
    { type: '凸阵', count: 4, usage: 87 },
    { type: '线阵', count: 3, usage: 69 },
    { type: '相控阵', count: 1, usage: 76 },
    { type: '腔内', count: 1, usage: 95 },
    { type: '经食道', count: 1, usage: 45 },
  ],
  monthlyTrend: [
    { month: '2025-10', usage: 3120, maint: 2, cost: 8500 },
    { month: '2025-11', usage: 3450, maint: 3, cost: 12000 },
    { month: '2025-12', usage: 3680, maint: 1, cost: 5800 },
    { month: '2026-01', usage: 3290, maint: 2, cost: 9200 },
    { month: '2026-02', usage: 2940, maint: 2, cost: 7800 },
    { month: '2026-03', usage: 3520, maint: 3, cost: 11500 },
  ],
  vendors: [
    { vendor: '迈瑞', count: 4, totalCost: 150000, maintCost: 10000 },
    { vendor: '飞利浦', count: 3, totalCost: 190000, maintCost: 18000 },
    { vendor: 'GE医疗', count: 2, totalCost: 83000, maintCost: 8000 },
    { vendor: '西门子', count: 1, totalCost: 52000, maintCost: 8200 },
  ],
  healthScore: 82,
  mtbf: 18.5,
  mttr: 2.3,
}

// ===== 样式 =====
const s: Record<string, React.CSSProperties> = {
  root: { padding: 32 },
  title: { fontSize: 22, fontWeight: 700, color: '#1a3a5c', marginBottom: 24 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 24 },
  statCard: { background: '#fff', borderRadius: 10, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' },
  statLabel: { fontSize: 13, color: '#64748b', marginBottom: 8 },
  statValue: { fontSize: 28, fontWeight: 700, color: '#1a3a5c' },
  statSub: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
  statGreen: { color: '#16a34a' },
  statOrange: { color: '#d97706' },
  statRed: { color: '#dc2626' },
  statBlue: { color: '#2563eb' },
  toolbar: { display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' as const, alignItems: 'center' },
  searchBox: { display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 14px', flex: '0 0 280px' },
  searchInput: { border: 'none', outline: 'none', fontSize: 15, flex: 1, background: 'transparent' },
  select: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 12px', fontSize: 14, outline: 'none' },
  btn: { padding: '10px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s', minHeight: 44 },
  btnPrimary: { background: '#1a3a5c', color: '#fff' },
  btnSuccess: { background: '#16a34a', color: '#fff' },
  btnWarning: { background: '#d97706', color: '#fff' },
  btnDanger: { background: '#dc2626', color: '#fff' },
  btnGhost: { background: '#f1f5f9', color: '#475569' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  th: { background: '#f8fafc', padding: '12px 16px', textAlign: 'left' as const, fontSize: 14, fontWeight: 600, color: '#475569', borderBottom: '2px solid #e2e8f0' },
  td: { padding: '12px 16px', fontSize: 14, color: '#334155', borderBottom: '1px solid #f1f5f9' },
  badge: { padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
  badgeGreen: { background: '#dcfce7', color: '#16a34a' },
  badgeBlue: { background: '#dbeafe', color: '#2563eb' },
  badgeOrange: { background: '#fef3c7', color: '#d97706' },
  badgeGray: { background: '#f1f5f9', color: '#64748b' },
  badgeRed: { background: '#fee2e2', color: '#dc2626' },
  modal: { position: 'fixed' as const, inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modalContent: { background: '#fff', borderRadius: 12, padding: 28, width: 700, maxHeight: '85vh', overflowY: 'auto' as const, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' },
  modalTitle: { fontSize: 18, fontWeight: 700, color: '#1a3a5c', marginBottom: 20 },
  detailGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 },
  detailItem: { padding: '10px 14px', background: '#f8fafc', borderRadius: 8 },
  detailLabel: { fontSize: 12, color: '#64748b', marginBottom: 4 },
  detailValue: { fontSize: 15, fontWeight: 600, color: '#1a3a5c' },
  sectionTitle: { fontSize: 15, fontWeight: 700, color: '#1a3a5c', marginTop: 20, marginBottom: 12, paddingBottom: 8, borderBottom: '2px solid #e2e8f0' },
  progressBar: { height: 8, borderRadius: 4, background: '#e2e8f0', overflow: 'hidden', marginTop: 6 },
  progressFill: { height: '100%', borderRadius: 4, transition: 'width 0.5s' },
  tabs: { display: 'flex', gap: 0, marginBottom: 20, borderBottom: '2px solid #e2e8f0' },
  tab: { padding: '10px 24px', cursor: 'pointer', fontSize: 15, fontWeight: 600, color: '#64748b', borderBottom: '3px solid transparent', transition: 'all 0.2s' },
  tabActive: { color: '#1a3a5c', borderBottomColor: '#1a3a5c' },
  empty: { textAlign: 'center' as const, padding: 40, color: '#94a3b8', fontSize: 15 },
  chartContainer: { background: '#fff', borderRadius: 10, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: 24 },
  chartTitle: { fontSize: 16, fontWeight: 700, color: '#1a3a5c', marginBottom: 16 },
  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 },
  kpiCard: { background: '#fff', borderRadius: 10, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', textAlign: 'center' as const },
  kpiValue: { fontSize: 32, fontWeight: 700, color: '#1a3a5c' },
  kpiLabel: { fontSize: 13, color: '#64748b', marginTop: 8 },
  trendUp: { color: '#16a34a', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 },
  trendDown: { color: '#dc2626', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 },
  vendorRow: { display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #f1f5f9', alignItems: 'center' },
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { style: React.CSSProperties; label: string }> = {
    '在用': { style: s.badgeGreen, label: '在用' },
    '空闲': { style: s.badgeBlue, label: '空闲' },
    '维保中': { style: s.badgeOrange, label: '维保中' },
    '已报废': { style: s.badgeGray, label: '已报废' },
  }
  const b = map[status] || { style: s.badgeGray, label: status }
  return <span style={{ ...s.badge, ...b.style }}>{b.label}</span>
}

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div style={s.progressBar}>
      <div style={{ ...s.progressFill, width: `${Math.min(value, 100)}%`, background: color }} />
    </div>
  )
}

function TrendIndicator({ value, suffix = '' }: { value: number; suffix?: string }) {
  if (value > 0) {
    return <span style={s.trendUp as React.CSSProperties}><TrendingUp size={14} />{value}{suffix}</span>
  } else if (value < 0) {
    return <span style={s.trendDown as React.CSSProperties}><TrendingDown size={14} />{Math.abs(value)}{suffix}</span>
  }
  return <span style={{ color: '#64748b', fontSize: 13 }}>{value}{suffix}</span>
}

export default function ProbeManagementPage() {
  const [activeTab, setActiveTab] = useState('探头追踪')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('全部')
  const [typeFilter, setTypeFilter] = useState('全部')
  const [selectedProbe, setSelectedProbe] = useState<typeof mockProbes[0] | null>(null)
  const [showAddProbe, setShowAddProbe] = useState(false)
  const [showAddRecord, setShowAddRecord] = useState(false)
  const [showAddAccessory, setShowAddAccessory] = useState(false)

  const filteredProbes = mockProbes.filter(p => {
    const matchSearch = p.name.includes(search) || p.model.includes(search) || p.id.includes(search)
    const matchStatus = statusFilter === '全部' || p.status === statusFilter
    const matchType = typeFilter === '全部' || p.type === typeFilter
    return matchSearch && matchStatus && matchType
  })

  const soonExpire = mockProbes.filter(p => {
    if (p.status === '已报废' || p.nextMaint === '-') return false
    const next = new Date(p.nextMaint)
    const now = new Date('2026-04-30')
    const diff = (next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    return diff <= 30
  })

  const lowStockAccessories = accessories.filter(a => a.stock <= a.minStock)

  const renderTabs = () => (
    <div style={s.tabs}>
      {['探头追踪', '维护记录', '配件管理', 'KPI指标'].map(t => (
        <div
          key={t}
          style={{ ...s.tab, ...(activeTab === t ? s.tabActive : {}) }}
          onClick={() => setActiveTab(t)}
        >
          {t}
          {t === '探头追踪' && soonExpire.length > 0 && (
            <span style={{ marginLeft: 6, background: '#dc2626', color: '#fff', borderRadius: '50%', width: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>{soonExpire.length}</span>
          )}
          {t === '配件管理' && lowStockAccessories.length > 0 && (
            <span style={{ marginLeft: 6, background: '#d97706', color: '#fff', borderRadius: '50%', width: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>{lowStockAccessories.length}</span>
          )}
        </div>
      ))}
    </div>
  )

  const renderStatCards = () => (
    <div style={s.statsGrid}>
      <div style={s.statCard}>
        <div style={s.statLabel}>探头总数</div>
        <div style={s.statValue}>{kpiData.totalProbes}</div>
        <div style={s.statSub}>在用 {kpiData.inUse} 台</div>
      </div>
      <div style={s.statCard}>
        <div style={s.statLabel}>在用探头</div>
        <div style={{ ...s.statValue, ...s.statGreen }}>{kpiData.inUse}</div>
        <div style={s.statSub}>使用率 {kpiData.avgUsageRate}%</div>
      </div>
      <div style={s.statCard}>
        <div style={s.statLabel}>维保中</div>
        <div style={{ ...s.statValue, ...s.statOrange }}>{kpiData.underMaintenance}</div>
        <div style={s.statSub}>到期预警 {soonExpire.length} 台</div>
      </div>
      <div style={s.statCard}>
        <div style={s.statLabel}>资产总值</div>
        <div style={s.statValue}>{Math.round(kpiData.totalValue / 10000)}万</div>
        <div style={s.statSub}>累计维保 {kpiData.totalMaintCost}元</div>
      </div>
      <div style={s.statCard}>
        <div style={s.statLabel}>健康评分</div>
        <div style={{ ...s.statValue, color: kpiData.healthScore >= 80 ? '#16a34a' : kpiData.healthScore >= 60 ? '#d97706' : '#dc2626' }}>{kpiData.healthScore}</div>
        <div style={s.statSub}>MTBF {kpiData.mtbf}月</div>
      </div>
    </div>
  )

  const renderProbeTracking = () => (
    <>
      {renderStatCards()}

      {/* 维保到期提醒 */}
      {soonExpire.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 10, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: 24, border: '1px solid #fef3c7' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#1a3a5c', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={18} color="#d97706" />
            维保到期提醒 — {soonExpire.length} 个探头将在30天内到期
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {soonExpire.map(p => {
              const next = new Date(p.nextMaint)
              const now = new Date('2026-04-30')
              const days = Math.ceil((next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
              return (
                <div key={p.id} style={{ padding: '14px 16px', borderRadius: 8, border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1a3a5c' }}>{p.name}</div>
                    <div style={{ fontSize: 13, color: '#64748b' }}>{p.id} · {p.dept}</div>
                    <div style={{ fontSize: 12, color: '#dc2626', fontWeight: 600, marginTop: 4 }}>还剩 {days} 天</div>
                  </div>
                  <button style={{ ...s.btn, ...s.btnGhost, fontSize: 13, padding: '6px 12px' }}>预约维保</button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div style={s.toolbar}>
        <div style={s.searchBox}>
          <Search size={16} color="#94a3b8" />
          <input style={s.searchInput} placeholder="搜索探头名称/型号/编号" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select style={s.select} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="全部">全部状态</option>
          <option value="在用">在用</option>
          <option value="空闲">空闲</option>
          <option value="维保中">维保中</option>
          <option value="已报废">已报废</option>
        </select>
        <select style={s.select} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="全部">全部类型</option>
          <option value="凸阵">凸阵</option>
          <option value="线阵">线阵</option>
          <option value="相控阵">相控阵</option>
          <option value="腔内">腔内</option>
          <option value="经食道">经食道</option>
          <option value="穿刺">穿刺</option>
        </select>
        <div style={{ flex: 1 }} />
        <button style={{ ...s.btn, ...s.btnGhost }}><Download size={16} />导出</button>
        <button style={{ ...s.btn, ...s.btnSuccess }} onClick={() => setShowAddProbe(true)}><Plus size={16} />添加探头</button>
      </div>

      <table style={s.table}>
        <thead>
          <tr>
            {['探头编号', '探头名称', '型号', '类型', '使用科室', '状态', '使用次数', '下次维保', '使用率', '操作'].map(h => (
              <th key={h} style={s.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredProbes.length === 0 && (
            <tr><td colSpan={10} style={s.empty}>暂无探头数据</td></tr>
          )}
          {filteredProbes.map(p => (
            <tr key={p.id} style={{ background: p.status === '已报废' ? '#f8fafc' : '#fff' }}>
              <td style={s.td}><span style={{ fontFamily: 'monospace', fontSize: 13, color: '#64748b' }}>{p.id}</span></td>
              <td style={s.td}><span style={{ fontWeight: 600 }}>{p.name}</span></td>
              <td style={s.td}>{p.model}</td>
              <td style={s.td}><span style={{ ...s.badge, background: '#f0f9ff', color: '#0369a1' }}>{p.type}</span></td>
              <td style={s.td}>{p.dept}</td>
              <td style={s.td}><StatusBadge status={p.status} /></td>
              <td style={s.td}>{p.useCount > 0 ? p.useCount.toLocaleString() : '-'}</td>
              <td style={s.td}>
                {p.nextMaint === '-' ? '-' : (
                  <span style={{ color: soonExpire.includes(p) ? '#dc2626' : '#334155', fontWeight: soonExpire.includes(p) ? 600 : 400 }}>
                    {p.nextMaint}
                  </span>
                )}
              </td>
              <td style={s.td}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 80 }}>
                    <ProgressBar value={p.deptRate} color={p.deptRate >= 80 ? '#16a34a' : p.deptRate >= 50 ? '#d97706' : '#94a3b8'} />
                  </div>
                  <span style={{ fontSize: 13, color: '#64748b' }}>{p.deptRate}%</span>
                </div>
              </td>
              <td style={s.td}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button style={{ ...s.btn, ...s.btnGhost, fontSize: 13, padding: '6px 12px' }} onClick={() => setSelectedProbe(p)}>详情</button>
                  <button style={{ ...s.btn, ...s.btnGhost, fontSize: 13, padding: '6px 12px' }}>维保</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )

  const renderMaintenanceRecords = () => (
    <>
      <div style={s.toolbar}>
        <div style={s.searchBox}>
          <Search size={16} color="#94a3b8" />
          <input style={s.searchInput} placeholder="搜索探头/维护类型" />
        </div>
        <select style={s.select}>
          <option value="">全部类型</option>
          <option value="常规保养">常规保养</option>
          <option value="故障维修">故障维修</option>
          <option value="配件更换">配件更换</option>
        </select>
        <select style={s.select}>
          <option value="">全部结果</option>
          <option value="合格">合格</option>
          <option value="已修复">已修复</option>
          <option value="建议报废">建议报废</option>
        </select>
        <div style={{ flex: 1 }} />
        <button style={{ ...s.btn, ...s.btnSuccess }} onClick={() => setShowAddRecord(true)}><Plus size={16} />记录维保</button>
      </div>

      <table style={s.table}>
        <thead>
          <tr>
            {['记录编号', '日期', '探头编号', '探头名称', '维保类型', '费用', '服务商', '结果', '操作员', '操作'].map(h => (
              <th key={h} style={s.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {maintenanceRecords.map(r => {
            const probe = mockProbes.find(p => p.id === r.probe)
            return (
              <tr key={r.id}>
                <td style={s.td}><span style={{ fontFamily: 'monospace', fontSize: 13, color: '#64748b' }}>{r.id}</span></td>
                <td style={s.td}>{r.date}</td>
                <td style={s.td}><span style={{ fontFamily: 'monospace', fontSize: 13, color: '#64748b' }}>{r.probe}</span></td>
                <td style={s.td}><span style={{ fontWeight: 600 }}>{probe?.name || r.probe}</span></td>
                <td style={s.td}><span style={{ ...s.badge, background: '#f0f9ff', color: '#0369a1' }}>{r.type}</span></td>
                <td style={s.td}>{r.cost > 0 ? `¥${r.cost.toLocaleString()}` : '-'}</td>
                <td style={s.td}>{r.vendor}</td>
                <td style={s.td}>
                  <span style={{ ...s.badge, ...(r.result === '合格' || r.result === '已修复' ? s.badgeGreen : r.result === '建议报废' ? s.badgeRed : s.badgeOrange) }}>
                    {r.result}
                  </span>
                </td>
                <td style={s.td}>{r.operator}</td>
                <td style={s.td}>
                  <button style={{ ...s.btn, ...s.btnGhost, fontSize: 13, padding: '6px 12px' }}>详情</button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* 成本汇总 */}
      <div style={{ marginTop: 24, background: '#fff', borderRadius: 10, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#1a3a5c', marginBottom: 16 }}>维护成本汇总</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[
            { label: '累计维保费用', value: `¥${maintenanceRecords.filter(r => r.cost > 0).reduce((s, r) => s + r.cost, 0).toLocaleString()}`, color: '#1a3a5c' },
            { label: '累计配件费用', value: `¥${mockProbes.reduce((s, p) => s + p.spareCost, 0).toLocaleString()}`, color: '#1a3a5c' },
            { label: '探头总价值', value: `¥${kpiData.totalValue.toLocaleString()}`, color: '#1a3a5c' },
            { label: '维保费用占探头比', value: `${Math.round(maintenanceRecords.reduce((s, r) => s + r.cost, 0) / kpiData.totalValue * 100)}%`, color: '#d97706' },
          ].map(item => (
            <div key={item.label} style={{ padding: 16, background: '#f8fafc', borderRadius: 8, textAlign: 'center' as const }}>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>{item.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: item.color }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  )

  const renderAccessoryManagement = () => (
    <>
      {lowStockAccessories.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 10, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: 24, border: '1px solid #fef3c7' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#1a3a5c', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={18} color="#d97706" />
            库存预警 — {lowStockAccessories.length} 个配件库存不足
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {lowStockAccessories.map(a => (
              <div key={a.id} style={{ padding: '14px 16px', borderRadius: 8, border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1a3a5c' }}>{a.name}</div>
                  <div style={{ fontSize: 13, color: '#64748b' }}>{a.id} · 当前库存 {a.stock} {a.unit}</div>
                  <div style={{ fontSize: 12, color: '#dc2626', fontWeight: 600, marginTop: 4 }}>低于最低库存 {a.minStock}</div>
                </div>
                <button style={{ ...s.btn, ...s.btnGhost, fontSize: 13, padding: '6px 12px' }}>采购</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={s.toolbar}>
        <div style={s.searchBox}>
          <Search size={16} color="#94a3b8" />
          <input style={s.searchInput} placeholder="搜索配件名称/规格" />
        </div>
        <select style={s.select}>
          <option value="">全部供应商</option>
          <option value="迈瑞">迈瑞</option>
          <option value="飞利浦">飞利浦</option>
          <option value="GE">GE医疗</option>
        </select>
        <div style={{ flex: 1 }} />
        <button style={{ ...s.btn, ...s.btnGhost }}><Download size={16} />导出</button>
        <button style={{ ...s.btn, ...s.btnSuccess }} onClick={() => setShowAddAccessory(true)}><Plus size={16} />添加配件</button>
      </div>

      <table style={s.table}>
        <thead>
          <tr>
            {['配件编号', '配件名称', '规格型号', '单位', '当前库存', '最低库存', '最高库存', '单价', '供应商', '最近采购', '操作'].map(h => (
              <th key={h} style={s.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {accessories.map(a => (
            <tr key={a.id} style={{ background: a.stock <= a.minStock ? '#fff7ed' : '#fff' }}>
              <td style={s.td}><span style={{ fontFamily: 'monospace', fontSize: 13, color: '#64748b' }}>{a.id}</span></td>
              <td style={s.td}><span style={{ fontWeight: 600 }}>{a.name}</span></td>
              <td style={s.td}>{a.spec}</td>
              <td style={s.td}>{a.unit}</td>
              <td style={s.td}>
                <span style={{ color: a.stock <= a.minStock ? '#dc2626' : '#334155', fontWeight: a.stock <= a.minStock ? 700 : 400 }}>
                  {a.stock}
                </span>
                {a.stock <= a.minStock && <AlertTriangle size={14} color="#dc2626" style={{ marginLeft: 4 }} />}
              </td>
              <td style={s.td}>{a.minStock}</td>
              <td style={s.td}>{a.maxStock}</td>
              <td style={s.td}>¥{a.price.toLocaleString()}</td>
              <td style={s.td}>{a.vendor}</td>
              <td style={s.td}>{a.lastPurchase}</td>
              <td style={s.td}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button style={{ ...s.btn, ...s.btnGhost, fontSize: 13, padding: '6px 12px' }}>入库</button>
                  <button style={{ ...s.btn, ...s.btnGhost, fontSize: 13, padding: '6px 12px' }}>详情</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 库存汇总 */}
      <div style={{ marginTop: 24, background: '#fff', borderRadius: 10, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#1a3a5c', marginBottom: 16 }}>库存汇总</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[
            { label: '配件种类', value: accessories.length, color: '#1a3a5c' },
            { label: '库存不足', value: lowStockAccessories.length, color: '#dc2626' },
            { label: '库存充足率', value: `${Math.round((accessories.length - lowStockAccessories.length) / accessories.length * 100)}%`, color: '#16a34a' },
            { label: '总库存价值', value: `¥${accessories.reduce((s, a) => s + a.stock * a.price, 0).toLocaleString()}`, color: '#1a3a5c' },
          ].map(item => (
            <div key={item.label} style={{ padding: 16, background: '#f8fafc', borderRadius: 8, textAlign: 'center' as const }}>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>{item.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: item.color }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  )

  const renderKPIIndicators = () => (
    <>
      {/* 核心KPI卡片 */}
      <div style={s.kpiGrid}>
        <div style={s.kpiCard}>
          <div style={{ fontSize: 14, color: '#64748b', marginBottom: 8 }}>探头总数</div>
          <div style={s.kpiValue}>{kpiData.totalProbes}</div>
          <div style={s.kpiLabel}>台</div>
          <div style={{ marginTop: 8 }}><TrendIndicator value={2} suffix=" vs上月" /></div>
        </div>
        <div style={s.kpiCard}>
          <div style={{ fontSize: 14, color: '#64748b', marginBottom: 8 }}>平均使用率</div>
          <div style={{ ...s.kpiValue, color: '#16a34a' }}>{kpiData.avgUsageRate}%</div>
          <div style={s.kpiLabel}>科室使用率</div>
          <div style={{ marginTop: 8 }}><TrendIndicator value={3.2} suffix="%" /></div>
        </div>
        <div style={s.kpiCard}>
          <div style={{ fontSize: 14, color: '#64748b', marginBottom: 8 }}>平均故障间隔</div>
          <div style={s.kpiValue}>{kpiData.mtbf}</div>
          <div style={s.kpiLabel}>月 (MTBF)</div>
          <div style={{ marginTop: 8 }}><TrendIndicator value={1.5} suffix="月" /></div>
        </div>
        <div style={s.kpiCard}>
          <div style={{ fontSize: 14, color: '#64748b', marginBottom: 8 }}>平均修复时间</div>
          <div style={{ ...s.kpiValue, color: '#2563eb' }}>{kpiData.mttr}</div>
          <div style={s.kpiLabel}>天 (MTTR)</div>
          <div style={{ marginTop: 8 }}><TrendIndicator value={-0.5} suffix="天" /></div>
        </div>
      </div>

      {/* 探头类型分布 */}
      <div style={s.chartContainer}>
        <div style={s.chartTitle}>探头类型分布</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
          {kpiData.probeTypes.map(pt => (
            <div key={pt.type} style={{ textAlign: 'center' as const, padding: 16, background: '#f8fafc', borderRadius: 8 }}>
              <div style={{ fontSize: 14, color: '#64748b', marginBottom: 8 }}>{pt.type}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#1a3a5c' }}>{pt.count}</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>台</div>
              <div style={{ marginTop: 8 }}>
                <ProgressBar value={pt.usage} color={pt.usage >= 80 ? '#16a34a' : pt.usage >= 50 ? '#d97706' : '#94a3b8'} />
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>使用率 {pt.usage}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* 月度趋势 */}
      <div style={s.chartContainer}>
        <div style={s.chartTitle}>月度使用与维护趋势</div>
        <table style={s.table}>
          <thead>
            <tr>
              {['月份', '使用次数', '环比', '维保次数', '环比', '维保成本', '环比'].map(h => (
                <th key={h} style={s.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {kpiData.monthlyTrend.map((m, i) => {
              const prev = kpiData.monthlyTrend[i - 1]
              const usageChange = prev ? ((m.usage - prev.usage) / prev.usage * 100).toFixed(1) : '0'
              const maintChange = prev ? m.maint - prev.maint : 0
              const costChange = prev ? m.cost - prev.cost : 0
              return (
                <tr key={m.month}>
                  <td style={s.td}><span style={{ fontWeight: 600 }}>{m.month}</span></td>
                  <td style={s.td}>{m.usage.toLocaleString()}</td>
                  <td style={s.td}><TrendIndicator value={parseFloat(usageChange)} suffix="%" /></td>
                  <td style={s.td}>{m.maint}</td>
                  <td style={s.td}><TrendIndicator value={maintChange} suffix="次" /></td>
                  <td style={s.td}>¥{m.cost.toLocaleString()}</td>
                  <td style={s.td}><TrendIndicator value={costChange} suffix="元" /></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* 厂商分布 */}
      <div style={s.chartContainer}>
        <div style={s.chartTitle}>厂商维保分布</div>
        <div>
          {kpiData.vendors.map((v, i) => (
            <div key={v.vendor} style={s.vendorRow}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: ['#1a3a5c', '#2563eb', '#16a34a', '#d97706'][i], color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>{v.vendor[0]}</div>
                <div>
                  <div style={{ fontWeight: 600, color: '#1a3a5c' }}>{v.vendor}</div>
                  <div style={{ fontSize: 13, color: '#64748b' }}>探头 {v.count} 台</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' as const }}>
                <div style={{ fontWeight: 600, color: '#1a3a5c' }}>¥{v.totalCost.toLocaleString()}</div>
                <div style={{ fontSize: 13, color: '#64748b' }}>维保 ¥{v.maintCost.toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 综合健康评分 */}
      <div style={s.chartContainer}>
        <div style={s.chartTitle}>探头综合健康评分</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ position: 'relative', width: 120, height: 120 }}>
            <svg viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="60" cy="60" r="52" fill="none" stroke="#e2e8f0" strokeWidth="12" />
              <circle cx="60" cy="60" r="52" fill="none" stroke={kpiData.healthScore >= 80 ? '#16a34a' : kpiData.healthScore >= 60 ? '#d97706' : '#dc2626'} strokeWidth="12" strokeDasharray={`${kpiData.healthScore * 3.27} 327`} strokeLinecap="round" />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#1a3a5c' }}>{kpiData.healthScore}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>分</div>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#64748b', marginBottom: 4 }}>
                <span>设备状态</span><span style={{ fontWeight: 600, color: '#1a3a5c' }}>优秀</span>
              </div>
              <ProgressBar value={90} color="#16a34a" />
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#64748b', marginBottom: 4 }}>
                <span>维保及时性</span><span style={{ fontWeight: 600, color: '#1a3a5c' }}>良好</span>
              </div>
              <ProgressBar value={78} color="#16a34a" />
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#64748b', marginBottom: 4 }}>
                <span>使用效率</span><span style={{ fontWeight: 600, color: '#1a3a5c' }}>良好</span>
              </div>
              <ProgressBar value={75} color="#d97706" />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#64748b', marginBottom: 4 }}>
                <span>配件库存率</span><span style={{ fontWeight: 600, color: '#1a3a5c' }}>优秀</span>
              </div>
              <ProgressBar value={85} color="#16a34a" />
            </div>
          </div>
        </div>
      </div>
    </>
  )

  return (
    <div style={s.root}>
      <div style={s.title}>探头使用维护管理</div>

      {renderTabs()}

      {activeTab === '探头追踪' && renderProbeTracking()}
      {activeTab === '维护记录' && renderMaintenanceRecords()}
      {activeTab === '配件管理' && renderAccessoryManagement()}
      {activeTab === 'KPI指标' && renderKPIIndicators()}

      {/* 探头详情弹窗 */}
      {selectedProbe && (
        <div style={s.modal} onClick={() => setSelectedProbe(null)}>
          <div style={{ ...s.modalContent, width: 750 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={s.modalTitle}>探头详情 — {selectedProbe.name}</div>
              <button style={{ ...s.btn, ...s.btnGhost, padding: '6px' }} onClick={() => setSelectedProbe(null)}><X size={18} /></button>
            </div>
            <div style={s.detailGrid}>
              {[
                { label: '探头编号', value: selectedProbe.id },
                { label: '探头名称', value: selectedProbe.name },
                { label: '型号', value: selectedProbe.model },
                { label: '序列号', value: selectedProbe.serial },
                { label: '厂商', value: selectedProbe.vendor },
                { label: '探头类型', value: selectedProbe.type },
                { label: '频率范围', value: selectedProbe.frequency },
                { label: '使用科室', value: selectedProbe.dept },
                { label: '购置日期', value: selectedProbe.purchaseDate },
                { label: '探头状态', value: selectedProbe.status },
              ].map(item => (
                <div key={item.label} style={s.detailItem}>
                  <div style={s.detailLabel}>{item.label}</div>
                  <div style={s.detailValue}>{item.value}</div>
                </div>
              ))}
            </div>
            <div style={s.sectionTitle}>使用情况</div>
            <div style={s.detailGrid}>
              {[
                { label: '累计使用次数', value: selectedProbe.useCount > 0 ? `${selectedProbe.useCount.toLocaleString()} 次` : '无统计数据' },
                { label: '最近使用日期', value: selectedProbe.lastUse },
                { label: '使用率', value: `${selectedProbe.deptRate}%` },
                { label: '剩余寿命', value: `${selectedProbe.lifeMonth} 个月` },
              ].map(item => (
                <div key={item.label} style={s.detailItem}>
                  <div style={s.detailLabel}>{item.label}</div>
                  <div style={s.detailValue}>{item.value}</div>
                  {item.label === '使用率' && (
                    <ProgressBar value={selectedProbe.deptRate} color={selectedProbe.deptRate >= 80 ? '#16a34a' : selectedProbe.deptRate >= 50 ? '#d97706' : '#94a3b8'} />
                  )}
                </div>
              ))}
            </div>
            <div style={s.sectionTitle}>成本分析</div>
            <div style={{ ...s.detailGrid, gridTemplateColumns: '1fr' }}>
              {[
                { label: '探头采购价值', value: `¥${selectedProbe.totalCost.toLocaleString()}` },
                { label: '累计维保费用', value: `¥${selectedProbe.maintCost.toLocaleString()}` },
                { label: '累计配件费用', value: `¥${selectedProbe.spareCost.toLocaleString()}` },
                { label: '综合维护成本', value: `¥${(selectedProbe.maintCost + selectedProbe.spareCost).toLocaleString()}`, highlight: true },
              ].map(item => (
                <div key={item.label} style={{ ...s.detailItem, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={s.detailLabel}>{item.label}</div>
                  <div style={{ ...s.detailValue, color: item.highlight ? '#dc2626' : '#1a3a5c' }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 添加探头弹窗 */}
      {showAddProbe && (
        <div style={s.modal} onClick={() => setShowAddProbe(false)}>
          <div style={s.modalContent} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={s.modalTitle}>添加新探头</div>
              <button style={{ ...s.btn, ...s.btnGhost, padding: '6px' }} onClick={() => setShowAddProbe(false)}><X size={18} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {['探头名称', '探头型号', '序列号', '厂商', '探头类型', '频率范围', '购置日期', '使用科室', '采购金额'].map(field => (
                <div key={field} style={s.detailItem}>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>{field}</div>
                  <input style={{ border: '1px solid #e2e8f0', borderRadius: 6, padding: '6px 10px', fontSize: 14, width: '100%', outline: 'none', background: '#fff' }} placeholder={`请输入${field}`} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 20, justifyContent: 'flex-end' }}>
              <button style={{ ...s.btn, ...s.btnGhost }} onClick={() => setShowAddProbe(false)}>取消</button>
              <button style={{ ...s.btn, ...s.btnSuccess }}>保存探头</button>
            </div>
          </div>
        </div>
      )}

      {/* 添加维保记录弹窗 */}
      {showAddRecord && (
        <div style={s.modal} onClick={() => setShowAddRecord(false)}>
          <div style={s.modalContent} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={s.modalTitle}>记录维保</div>
              <button style={{ ...s.btn, ...s.btnGhost, padding: '6px' }} onClick={() => setShowAddRecord(false)}><X size={18} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {['维保日期', '探头编号', '维保类型', '维保费用', '服务商', '操作员'].map(field => (
                <div key={field} style={s.detailItem}>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>{field}</div>
                  <input style={{ border: '1px solid #e2e8f0', borderRadius: 6, padding: '6px 10px', fontSize: 14, width: '100%', outline: 'none', background: '#fff' }} placeholder={`请输入${field}`} />
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12 }}>
              <div style={{ ...s.detailItem, gridColumn: '1 / -1' }}>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>维保结果</div>
                <select style={{ border: '1px solid #e2e8f0', borderRadius: 6, padding: '6px 10px', fontSize: 14, width: '100%', outline: 'none', background: '#fff' }}>
                  <option value="合格">合格</option>
                  <option value="已修复">已修复</option>
                  <option value="建议报废">建议报废</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 20, justifyContent: 'flex-end' }}>
              <button style={{ ...s.btn, ...s.btnGhost }} onClick={() => setShowAddRecord(false)}>取消</button>
              <button style={{ ...s.btn, ...s.btnSuccess }}>保存记录</button>
            </div>
          </div>
        </div>
      )}

      {/* 添加配件弹窗 */}
      {showAddAccessory && (
        <div style={s.modal} onClick={() => setShowAddAccessory(false)}>
          <div style={s.modalContent} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={s.modalTitle}>添加配件</div>
              <button style={{ ...s.btn, ...s.btnGhost, padding: '6px' }} onClick={() => setShowAddAccessory(false)}><X size={18} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {['配件名称', '规格型号', '单位', '当前库存', '最低库存', '最高库存', '单价', '供应商'].map(field => (
                <div key={field} style={s.detailItem}>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>{field}</div>
                  <input style={{ border: '1px solid #e2e8f0', borderRadius: 6, padding: '6px 10px', fontSize: 14, width: '100%', outline: 'none', background: '#fff' }} placeholder={`请输入${field}`} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 20, justifyContent: 'flex-end' }}>
              <button style={{ ...s.btn, ...s.btnGhost }} onClick={() => setShowAddAccessory(false)}>取消</button>
              <button style={{ ...s.btn, ...s.btnSuccess }}>保存配件</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
