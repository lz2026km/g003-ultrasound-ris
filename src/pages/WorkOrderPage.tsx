/**
 * 维修工单系统
 * @version v0.9.0
 * @description 对标联影、东软、卫宁设备维修模块
 *
 * 核心能力：
 * - 故障报修（扫码/电话/APP）
 * - 工单流转（待派工→已派工→维修中→已完成）
 * - 配件管理（库存/申领/报废）
 * - 巡检计划（定期/专项）
 * - 维修记录档案
 * - 设备健康度评分
 * - SLA管理（响应时间/解决时间）
 * - 维修成本分析
 */

import React, { useState, useEffect } from 'react'
import {
  Wrench, AlertTriangle, Check, Clock, Package, Search, Plus,
  Download, Activity, Calendar, TrendingUp, DollarSign, User,
  Phone, Camera, FileText, Settings, Wrench as Tool, ClipboardCheck,
  Zap, X, ChevronRight, BarChart3, AlertCircle, Database
} from 'lucide-react'
import { mockApi } from '../data/mockApi'

const C = {
  primary: '#1a365d',
  accent: '#2563eb',
  success: '#059669',
  warning: '#d97706',
  danger: '#dc2626',
  white: '#ffffff',
  bg: '#f8fafc',
  border: '#e2e8f0',
  text: '#1a365c',
  textLight: '#64748b',
  purple: '#7c3aed',
}

const s: Record<string, React.CSSProperties> = {
  root: { padding: 0 },
  header: { marginBottom: 24 },
  title: { fontSize: 20, fontWeight: 700, color: C.primary, margin: 0 },
  subtitle: { fontSize: 13, color: C.textLight, marginTop: 4 },
  kpiRow: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 20 },
  kpiCard: { background: C.white, borderRadius: 10, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  kpiValue: { fontSize: 24, fontWeight: 700 },
  kpiLabel: { fontSize: 12, color: C.textLight, marginTop: 4 },
  kpiHint: { fontSize: 11, marginTop: 4, fontWeight: 500 },
  tabRow: { display: 'flex', gap: 6, marginBottom: 20, borderBottom: `2px solid ${C.border}` },
  tab: { padding: '10px 18px', borderRadius: '6px 6px 0 0', fontSize: 13, cursor: 'pointer', border: 'none', background: 'transparent', color: C.textLight, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 },
  tabActive: { padding: '10px 18px', borderRadius: '6px 6px 0 0', fontSize: 13, cursor: 'pointer', border: 'none', background: C.primary, color: C.white, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 },
  card: { background: C.white, borderRadius: 10, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: 16 },
  cardHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 12, borderBottom: `1px solid ${C.border}` },
  cardTitle: { fontSize: 15, fontWeight: 600, color: C.primary, display: 'flex', alignItems: 'center', gap: 8 },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: { padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: C.textLight, background: '#f8fafc', borderBottom: `1px solid ${C.border}` },
  td: { padding: '10px 12px', borderBottom: `1px solid ${C.border}`, color: C.text },
  badge: { padding: '2px 8px', borderRadius: 10, fontSize: 12, fontWeight: 500 },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  grid3: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 },
  grid4: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 },
  alert: { padding: 14, background: '#fef2f2', borderRadius: 8, border: '1px solid #fecaca', marginBottom: 12 },
}

const INSPECTIONS = [
  { id: 'IN001', name: '6月全院设备巡检', type: '常规巡检', startDate: '2026-06-10', endDate: '2026-06-15', devices: 24, status: 'planned' },
  { id: 'IN002', name: '心脏探头专项检查', type: '专项巡检', startDate: '2026-06-12', endDate: '2026-06-13', devices: 8, status: 'planned' },
  { id: 'IN003', name: '妇产科超声季度深度保养', type: '深度保养', startDate: '2026-06-20', endDate: '2026-06-22', devices: 5, status: 'planned' },
  { id: 'IN004', name: '急诊科设备安全检查', type: '专项巡检', startDate: '2026-06-08', endDate: '2026-06-08', devices: 6, status: 'in_progress' },
]

const PARTS_INVENTORY = [
  { code: 'P001', name: '凸阵探头C5-2', stock: 4, minStock: 2, maxStock: 8, unit: '个', price: 18500, status: 'normal' },
  { code: 'P002', name: '线阵探头L9-3', stock: 2, minStock: 2, maxStock: 6, unit: '个', price: 22000, status: 'low' },
  { code: 'P003', name: '心腔探头S5-1', stock: 1, minStock: 1, maxStock: 4, unit: '个', price: 28000, status: 'critical' },
  { code: 'P004', name: '耦合剂(1L)', stock: 35, minStock: 20, maxStock: 100, unit: '瓶', price: 85, status: 'normal' },
  { code: 'P005', name: '热敏打印纸', stock: 18, minStock: 30, maxStock: 200, unit: '卷', price: 35, status: 'low' },
  { code: 'P006', name: '探头消毒湿巾', stock: 120, minStock: 50, maxStock: 500, unit: '盒', price: 45, status: 'normal' },
  { code: 'P007', name: '电源板(通用)', stock: 3, minStock: 2, maxStock: 8, unit: '块', price: 1500, status: 'normal' },
  { code: 'P008', name: '显示屏总成', stock: 0, minStock: 1, maxStock: 3, unit: '块', price: 5800, status: 'out' },
]

const DEVICE_HEALTH = [
  { id: 'D001', name: 'GE Voluson E10', dept: '妇产科', totalHours: 8650, healthScore: 88, lastService: '2026-05-15', nextService: '2026-08-15' },
  { id: 'D002', name: '西门子ACUSON Sequoia', dept: '心血管内科', totalHours: 12340, healthScore: 75, lastService: '2026-04-20', nextService: '2026-07-20' },
  { id: 'D003', name: '飞利浦EPIQ 7C', dept: '超声科', totalHours: 15820, healthScore: 62, lastService: '2026-03-10', nextService: '2026-06-10' },
  { id: 'D004', name: '迈瑞Resona R9T', dept: '急诊科', totalHours: 9850, healthScore: 92, lastService: '2026-05-28', nextService: '2026-08-28' },
  { id: 'D005', name: 'GE LOGIQ E9', dept: '超声科', totalHours: 18450, healthScore: 58, lastService: '2026-02-15', nextService: '2026-05-15' },
  { id: 'D006', name: '开立S60', dept: '体检中心', totalHours: 5430, healthScore: 95, lastService: '2026-06-01', nextService: '2026-09-01' },
]

const getStatusInfo = (status: string) => {
  const map: Record<string, { bg: string; color: string; text: string }> = {
    pending: { bg: '#fef3c7', color: C.warning, text: '待派工' },
    dispatched: { bg: '#dbeafe', color: C.accent, text: '已派工' },
    in_progress: { bg: '#dbeafe', color: C.accent, text: '维修中' },
    completed: { bg: '#d1fae5', color: C.success, text: '已完成' },
  }
  return map[status] || map.pending
}

const getPriorityInfo = (priority: string) => {
  const map: Record<string, { bg: string; color: string; text: string }> = {
    urgent: { bg: '#fee2e2', color: C.danger, text: '紧急' },
    high: { bg: '#fef3c7', color: C.warning, text: '高' },
    normal: { bg: '#f1f5f9', color: C.textLight, text: '普通' },
  }
  return map[priority] || map.normal
}

export default function WorkOrderPage() {
  const [activeTab, setActiveTab] = useState('orders')
  const [searchText, setSearchText] = useState('')
  // v0.19.2: 工单数据改由 mockApi 提供
  const [workOrders, setWorkOrders] = useState<any[]>([])
  const [workOrderTotal, setWorkOrderTotal] = useState(0)
  const [workOrderStats, setWorkOrderStats] = useState<any>({ total: 0, pending: 0, dispatched: 0, inProgress: 0, completed: 0, urgent: 0 })

  const refreshWorkOrders = async () => {
    const r = await mockApi.getWorkOrderList({ keyword: searchText || undefined })
    setWorkOrders(r.items)
    setWorkOrderTotal(r.total)
    setWorkOrderStats(r.stats)
  }

  useEffect(() => { refreshWorkOrders() }, [])
  useEffect(() => { refreshWorkOrders() }, [searchText])

  // 状态流转按钮
  const handleStatusChange = async (id: string, newStatus: string) => {
    await mockApi.updateWorkOrderStatus(id, newStatus)
    refreshWorkOrders()
  }

  return (
    <div style={s.root}>
      <div style={s.header}>
        <h1 style={s.title}>维修工单系统</h1>
        <p style={s.subtitle}>设备全生命周期维护 · 工单流转 · 巡检计划 · 配件管理 · 设备健康度</p>
      </div>

      <div style={s.kpiRow}>
        {[
          { value: workOrderStats.pending, label: '待处理工单', color: C.danger, hint: `紧急 ${workOrderStats.urgent} 单` },
          { value: workOrderStats.dispatched + workOrderStats.inProgress, label: '进行中', color: C.accent, hint: '已派工 + 维修中' },
          { value: workOrderStats.completed, label: '本月完成', color: C.success, hint: '已完成工单' },
          { value: '92%', label: 'SLA达成率', color: C.primary, hint: '↑ 3%' },
          { value: '¥45.6K', label: '本月维修成本', color: C.purple, hint: '↓ 8%' },
        ].map((k, i) => (
          <div key={i} style={s.kpiCard}>
            <div style={{ ...s.kpiValue, color: k.color }}>{k.value}</div>
            <div style={s.kpiLabel}>{k.label}</div>
            <div style={{ ...s.kpiHint, color: k.hint.includes('↓') && k.label.includes('成本') ? C.success : C.textLight }}>{k.hint}</div>
          </div>
        ))}
      </div>

      <div style={s.tabRow}>
        {[
          { key: 'orders', label: '工单列表', icon: <Wrench size={14} /> },
          { key: 'inspection', label: '巡检计划', icon: <ClipboardCheck size={14} /> },
          { key: 'parts', label: '配件库存', icon: <Package size={14} /> },
          { key: 'health', label: '设备健康度', icon: <Activity size={14} /> },
        ].map(tab => (
          <button
            key={tab.key}
            style={activeTab === tab.key ? s.tabActive : s.tab}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'orders' && (
        <div style={s.card}>
          <div style={s.cardHeader}>
            <span style={s.cardTitle}><Wrench size={16} color={C.primary} /> 维修工单（{workOrderTotal}条）<span style={{ marginLeft: 12, fontSize: 11, color: C.accent, fontWeight: 500 }}><Database size={11} style={{ verticalAlign: 'middle' }} /> Mock API 实时</span></span>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                style={{ padding: '8px 12px', borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 13, outline: 'none', width: 220 }}
                placeholder="搜索工单号/设备/问题..."
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
              />
              <button style={{ ...s.badge, background: C.primary, color: C.white, padding: '8px 16px', border: 'none', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Plus size={14} /> 新建工单
              </button>
            </div>
          </div>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>工单号</th>
                <th style={s.th}>设备</th>
                <th style={s.th}>科室</th>
                <th style={s.th}>类型</th>
                <th style={s.th}>问题</th>
                <th style={s.th}>优先级</th>
                <th style={s.th}>状态</th>
                <th style={s.th}>响应</th>
                <th style={s.th}>工程师</th>
                <th style={s.th}>操作</th>
              </tr>
            </thead>
            <tbody>
              {workOrders.map((w: any) => {
                const ps = getPriorityInfo(w.priority)
                const ss = getStatusInfo(w.status)
                return (
                  <tr key={w.id}>
                    <td style={s.td}><strong style={{ color: C.primary, fontFamily: 'monospace' }}>{w.id}</strong></td>
                    <td style={s.td}>{w.device}</td>
                    <td style={s.td}>{w.dept}</td>
                    <td style={s.td}><span style={{ ...s.badge, background: '#f1f5f9', color: C.textLight }}>{w.type}</span></td>
                    <td style={s.td}>{w.issue}</td>
                    <td style={s.td}><span style={{ ...s.badge, background: ps.bg, color: ps.color }}>{ps.text}</span></td>
                    <td style={s.td}><span style={{ ...s.badge, background: ss.bg, color: ss.color }}>{ss.text}</span></td>
                    <td style={s.td}>{w.response}</td>
                    <td style={s.td}>{w.assignee}</td>
                    <td style={s.td}>
                      {w.status === 'completed' ? (
                        <button style={{ ...s.badge, background: C.textLight, color: C.white, padding: '4px 12px', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>
                          查看报告
                        </button>
                      ) : w.status === 'pending' ? (
                        <button onClick={() => handleStatusChange(w.id, 'dispatched')} style={{ ...s.badge, background: C.accent, color: C.white, padding: '4px 12px', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>
                          派工
                        </button>
                      ) : (
                        <button onClick={() => handleStatusChange(w.id, 'completed')} style={{ ...s.badge, background: C.success, color: C.white, padding: '4px 12px', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>
                          完成
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'inspection' && (
        <div style={s.card}>
          <div style={s.cardHeader}>
            <span style={s.cardTitle}><ClipboardCheck size={16} color={C.primary} /> 巡检计划</span>
            <button style={{ ...s.badge, background: C.primary, color: C.white, padding: '8px 16px', border: 'none', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Plus size={14} /> 新建巡检
            </button>
          </div>
          <div style={s.grid3}>
            {INSPECTIONS.map(ins => (
              <div key={ins.id} style={{ padding: 16, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <strong style={{ color: C.primary, fontSize: 14 }}>{ins.name}</strong>
                  <span style={{
                    ...s.badge,
                    background: ins.status === 'in_progress' ? '#dbeafe' : '#fef3c7',
                    color: ins.status === 'in_progress' ? C.accent : C.warning,
                  }}>{ins.status === 'in_progress' ? '进行中' : '计划中'}</span>
                </div>
                <div style={{ fontSize: 12, color: C.textLight, lineHeight: 1.7 }}>
                  <div>📋 类型: <strong>{ins.type}</strong></div>
                  <div>📅 周期: {ins.startDate} ~ {ins.endDate}</div>
                  <div>🏥 设备: {ins.devices} 台</div>
                </div>
                <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
                  <button style={{ flex: 1, padding: '6px 12px', background: C.accent, color: C.white, border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>
                    查看详情
                  </button>
                  <button style={{ flex: 1, padding: '6px 12px', background: C.white, color: C.primary, border: `1px solid ${C.border}`, borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>
                    编辑
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 20 }}>
            <h3 style={{ fontSize: 14, color: C.primary, marginBottom: 12 }}>巡检项目清单模板</h3>
            <div style={s.grid2}>
              {[
                { name: '常规巡检', items: '外观清洁/电源线/接地/开机测试/图像质量/按键功能/打印测试', count: 24 },
                { name: '季度深度保养', items: '探头清洁校准/风扇除尘/滤网更换/参数校准/软件升级', count: 8 },
                { name: '安全检查', items: '漏电检测/绝缘电阻/接地电阻/电气安全/消防设备', count: 6 },
                { name: '图像质量评估', items: '分辨率/穿透力/对比度/彩色灵敏度/频谱多普勒', count: 5 },
              ].map((t, i) => (
                <div key={i} style={{ padding: 14, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <strong style={{ color: C.primary }}>{t.name}</strong>
                    <span style={{ fontSize: 12, color: C.textLight }}>{t.count} 项</span>
                  </div>
                  <div style={{ fontSize: 12, color: C.textLight, lineHeight: 1.6 }}>{t.items}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'parts' && (
        <div style={s.card}>
          <div style={s.cardHeader}>
            <span style={s.cardTitle}><Package size={16} color={C.primary} /> 配件库存管理（8/156 种）</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                style={{ padding: '8px 12px', borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 13, outline: 'none', width: 220 }}
                placeholder="搜索配件..."
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
              />
              <button style={{ ...s.badge, background: C.primary, color: C.white, padding: '8px 16px', border: 'none', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Plus size={14} /> 入库
              </button>
            </div>
          </div>

          <div style={s.alert}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={16} color={C.danger} />
              <strong style={{ color: C.danger, fontSize: 13 }}>3 项配件库存告急，需立即补货</strong>
            </div>
          </div>

          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>配件编码</th>
                <th style={s.th}>名称</th>
                <th style={s.th}>当前库存</th>
                <th style={s.th}>最低/最高</th>
                <th style={s.th}>单价</th>
                <th style={s.th}>总价值</th>
                <th style={s.th}>状态</th>
                <th style={s.th}>操作</th>
              </tr>
            </thead>
            <tbody>
              {PARTS_INVENTORY.map(p => {
                const statusMap: Record<string, { bg: string; color: string; text: string }> = {
                  normal: { bg: '#d1fae5', color: C.success, text: '正常' },
                  low: { bg: '#fef3c7', color: C.warning, text: '低库存' },
                  critical: { bg: '#fed7aa', color: C.warning, text: '严重不足' },
                  out: { bg: '#fee2e2', color: C.danger, text: '缺货' },
                }
                const st = statusMap[p.status]
                return (
                  <tr key={p.code}>
                    <td style={s.td}><strong style={{ color: C.primary, fontFamily: 'monospace' }}>{p.code}</strong></td>
                    <td style={s.td}>{p.name}</td>
                    <td style={s.td}><strong style={{ color: p.stock <= p.minStock ? C.danger : C.success, fontSize: 16 }}>{p.stock}</strong> {p.unit}</td>
                    <td style={s.td}>{p.minStock} / {p.maxStock}</td>
                    <td style={s.td}>¥{p.price.toLocaleString()}</td>
                    <td style={s.td}>¥{(p.stock * p.price).toLocaleString()}</td>
                    <td style={s.td}><span style={{ ...s.badge, background: st.bg, color: st.color }}>{st.text}</span></td>
                    <td style={s.td}>
                      <button style={{ ...s.badge, background: C.accent, color: C.white, padding: '4px 10px', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>
                        申领
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'health' && (
        <div>
          <div style={s.card}>
            <div style={s.cardHeader}>
              <span style={s.cardTitle}><Activity size={16} color={C.primary} /> 设备健康度评分</span>
              <span style={{ fontSize: 12, color: C.textLight }}>基于运行时长+故障频次+保养记录</span>
            </div>
            <div style={s.grid3}>
              {DEVICE_HEALTH.map(d => (
                <div key={d.id} style={{ padding: 16, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <strong style={{ color: C.primary, fontSize: 14 }}>{d.name}</strong>
                      <div style={{ fontSize: 12, color: C.textLight, marginTop: 2 }}>{d.dept}</div>
                    </div>
                    <div style={{
                      width: 50, height: 50, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 18, fontWeight: 700,
                      background: d.healthScore >= 80 ? '#d1fae5' : d.healthScore >= 70 ? '#fef3c7' : '#fee2e2',
                      color: d.healthScore >= 80 ? C.success : d.healthScore >= 70 ? C.warning : C.danger,
                    }}>
                      {d.healthScore}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: C.textLight, lineHeight: 1.7 }}>
                    <div>⏱ 累计运行时: <strong style={{ color: C.primary }}>{d.totalHours.toLocaleString()} 小时</strong></div>
                    <div>🛠 上次保养: {d.lastService}</div>
                    <div>📅 下次保养: {d.nextService}</div>
                  </div>
                  <div style={{ height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden', marginTop: 10 }}>
                    <div style={{
                      width: `${d.healthScore}%`,
                      height: '100%',
                      background: d.healthScore >= 80 ? C.success : d.healthScore >= 70 ? C.warning : C.danger,
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={s.grid2}>
            <div style={s.card}>
              <div style={s.cardHeader}>
                <span style={s.cardTitle}><TrendingUp size={16} color={C.primary} /> 维修成本分析（6月）</span>
              </div>
              <div style={{ padding: 16, background: '#f8fafc', borderRadius: 8 }}>
                <div style={{ fontSize: 30, fontWeight: 700, color: C.primary }}>¥45,680</div>
                <div style={{ fontSize: 12, color: C.textLight, marginTop: 4 }}>本月维修总成本 ↓ 8%</div>
              </div>
              <div style={{ marginTop: 12 }}>
                {[
                  { name: '人工费', amount: 18500, pct: 41, color: C.primary },
                  { name: '配件费', amount: 22300, pct: 49, color: C.accent },
                  { name: '外送维修', amount: 4880, pct: 10, color: C.warning },
                ].map((c, i) => (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                      <span>{c.name}</span>
                      <strong style={{ color: c.color }}>¥{c.amount.toLocaleString()} ({c.pct}%)</strong>
                    </div>
                    <div style={{ height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${c.pct}%`, height: '100%', background: c.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={s.card}>
              <div style={s.cardHeader}>
                <span style={s.cardTitle}><BarChart3 size={16} color={C.primary} /> 故障类型分布</span>
              </div>
              <div style={{ marginTop: 8 }}>
                {[
                  { name: '探头故障', count: 18, pct: 32, color: C.danger },
                  { name: '电源/启动问题', count: 12, pct: 21, color: C.warning },
                  { name: '图像质量', count: 10, pct: 18, color: C.accent },
                  { name: '软件故障', count: 8, pct: 14, color: C.purple },
                  { name: '其他', count: 9, pct: 15, color: C.textLight },
                ].map((c, i) => (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                      <span>{c.name}</span>
                      <strong style={{ color: c.color }}>{c.count} 起 ({c.pct}%)</strong>
                    </div>
                    <div style={{ height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${c.pct * 2}%`, height: '100%', background: c.color, maxWidth: '100%' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
