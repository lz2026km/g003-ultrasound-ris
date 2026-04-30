// @ts-nocheck
// ============================================================
// G003 超声RIS系统 - 消毒追溯页面
// 消毒管理 / 设备消毒 / 记录追溯 / 提醒通知
// ============================================================
import { useState } from 'react'
import {
  Search, Filter, Download, Plus, RefreshCw,
  Clock, CheckCircle, AlertCircle, AlertTriangle,
  ShieldCheck, Calendar, User, MapPin, ClipboardCheck,
  Wrench, Thermometer, Droplets, Wind
} from 'lucide-react'

// ---------- 样式 ----------
const s: Record<string, React.CSSProperties> = {
  root: { padding: 0 },
  header: { marginBottom: 24 },
  title: { fontSize: 20, fontWeight: 700, color: '#1a3a5c', margin: 0 },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 4 },
  headerRight: { display: 'flex', gap: 8 },
  statRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 },
  statCard: { background: '#fff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 16 },
  statIconWrap: { width: 48, height: 48, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  statInfo: { flex: 1, minWidth: 0 },
  statValue: { fontSize: 26, fontWeight: 700, color: '#1a3a5c', lineHeight: 1.2 },
  statLabel: { fontSize: 12, color: '#64748b', marginTop: 2 },
  statTrend: { fontSize: 11, color: '#22c55e', marginTop: 4, display: 'flex', alignItems: 'center', gap: 2 },
  searchBar: { display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' },
  searchInput: { flex: 1, padding: '10px 16px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 13, outline: 'none', background: '#fff' },
  tabs: { display: 'flex', gap: 4, marginBottom: 20, borderBottom: '2px solid #f1f5f9' },
  tab: { padding: '10px 20px', fontSize: 13, fontWeight: 600, color: '#64748b', cursor: 'pointer', borderBottom: '2px solid transparent', marginBottom: -2 },
  tabActive: { padding: '10px 20px', fontSize: 13, fontWeight: 600, color: '#3b82f6', cursor: 'pointer', borderBottom: '2px solid #3b82f6', marginBottom: -2 },
  // 消毒记录卡片
  recordCard: { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 12 },
  recordHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  recordTitle: { fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 4 },
  recordMeta: { fontSize: 12, color: '#64748b' },
  recordTag: { fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 8 },
  recordContent: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 12 },
  recordItem: { background: '#f8fafc', borderRadius: 8, padding: 12, textAlign: 'center' },
  recordItemLabel: { fontSize: 11, color: '#94a3b8', marginBottom: 4 },
  recordItemValue: { fontSize: 14, fontWeight: 600, color: '#1a3a5c' },
  recordProgress: { height: 8, borderRadius: 4, background: '#e2e8f0', overflow: 'hidden', marginTop: 12 },
  recordActions: { display: 'flex', gap: 8, marginTop: 12 },
  // 设备卡片
  equipmentCard: { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 12, display: 'flex', gap: 16 },
  equipmentIcon: { width: 60, height: 60, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  equipmentInfo: { flex: 1 },
  equipmentName: { fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 4 },
  equipmentStatus: { fontSize: 12, color: '#64748b', marginBottom: 8 },
  equipmentMeta: { display: 'flex', gap: 16, fontSize: 11, color: '#94a3b8' },
  // 提醒卡片
  alertCard: { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 12, borderLeft: '4px solid' },
  alertHeader: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 },
  alertIcon: { width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  alertTitle: { fontSize: 13, fontWeight: 600, color: '#1a3a5c' },
  alertDesc: { fontSize: 12, color: '#64748b', marginLeft: 48 },
  // 按钮
  btn: { padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s' },
  btnPrimary: { background: '#3b82f6', color: '#fff' },
  btnOutline: { padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, background: '#fff', color: '#475569' },
  btnSuccess: { background: '#22c55e', color: '#fff' },
  btnWarning: { background: '#f97316', color: '#fff' },
  btnDanger: { background: '#ef4444', color: '#fff' },
  blue: { backgroundColor: '#eff6ff', color: '#3b82f6' },
  green: { backgroundColor: '#f0fdf4', color: '#22c55e' },
  orange: { backgroundColor: '#fff7ed', color: '#f97316' },
  red: { backgroundColor: '#fef2f2', color: '#ef4444' },
  purple: { backgroundColor: '#f5f3ff', color: '#8b5cf6' },
  teal: { backgroundColor: '#f0fdfa', color: '#14b8a6' },
}

// 消毒记录
const DISINFECTION_RECORDS = [
  { id: 1, equipment: '彩超仪 A', operator: '张丽华', method: '75%酒精擦拭', startTime: '2024-12-15 08:00', duration: 30, result: '合格', status: 'completed' },
  { id: 2, equipment: '彩超仪 B', operator: '李明', method: '紫外线消毒', startTime: '2024-12-15 09:30', duration: 45, result: '合格', status: 'completed' },
  { id: 3, equipment: '探头 1', operator: '王芳', method: '戊二醛浸泡', startTime: '2024-12-15 10:00', duration: 20, result: '合格', status: 'completed' },
  { id: 4, equipment: '彩超仪 C', operator: '刘涛', method: '含氯消毒液', startTime: '2024-12-15 14:00', duration: 30, result: '待审核', status: 'pending' },
]

// 设备状态
const EQUIPMENT_STATUS = [
  { id: 1, name: '彩超仪 A', lastDisinfection: '2024-12-15 08:00', nextDisinfection: '2024-12-16 08:00', status: '正常', overdue: false },
  { id: 2, name: '彩超仪 B', lastDisinfection: '2024-12-15 09:30', nextDisinfection: '2024-12-16 09:30', status: '正常', overdue: false },
  { id: 3, name: '彩超仪 C', lastDisinfection: '2024-12-14 14:00', nextDisinfection: '2024-12-15 14:00', status: '待消毒', overdue: true },
  { id: 4, name: '彩超仪 D', lastDisinfection: '2024-12-15 11:00', nextDisinfection: '2024-12-16 11:00', status: '正常', overdue: false },
]

// 提醒
const ALERTS = [
  { id: 1, type: 'warning', icon: AlertTriangle, color: '#f97316', title: '设备待消毒提醒', desc: '彩超仪 C 已超过24小时未消毒，请尽快处理', time: '30分钟前' },
  { id: 2, type: 'info', icon: CheckCircle, color: '#3b82f6', title: '消毒记录已审核', desc: '彩超仪 A 的消毒记录已通过审核', time: '1小时前' },
  { id: 3, type: 'danger', icon: AlertCircle, color: '#ef4444', title: '消毒液库存不足', desc: '75%酒精库存仅剩 5 瓶，建议补充', time: '2小时前' },
]

export default function DisinfectionPage() {
  const [activeTab, setActiveTab] = useState('records')
  const [searchText, setSearchText] = useState('')

  return (
    <div style={s.root}>
      {/* 标题 */}
      <div style={s.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={s.title}>消毒追溯管理</h1>
            <p style={s.subtitle}>消毒管理 · 设备消毒 · 记录追溯 · 提醒通知</p>
          </div>
          <div style={s.headerRight}>
            <button style={s.btnOutline}><Download size={14} /> 导出记录</button>
            <button style={{ ...s.btn, ...s.btnPrimary }}><Plus size={14} /> 新增消毒记录</button>
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div style={s.statRow}>
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, background: '#f0fdf4' }}><ShieldCheck size={22} color="#22c55e" /></div>
          <div style={s.statInfo}>
            <div style={s.statValue}>48</div>
            <div style={s.statLabel}>今日消毒次数</div>
            <div style={s.statTrend}>全部合格</div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, background: '#eff6ff' }}><CheckCircle size={22} color="#3b82f6" /></div>
          <div style={s.statInfo}>
            <div style={s.statValue}>96%</div>
            <div style={s.statLabel}>设备正常率</div>
            <div style={s.statTrend}><CheckCircle size={11} /> 达标</div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, background: '#fff7ed' }}><AlertTriangle size={22} color="#f97316" /></div>
          <div style={s.statInfo}>
            <div style={s.statValue}>3</div>
            <div style={s.statLabel}>待处理提醒</div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, background: '#f5f3ff' }}><Clock size={22} color="#8b5cf6" /></div>
          <div style={s.statInfo}>
            <div style={s.statValue}>2h</div>
            <div style={s.statLabel}>平均消毒时长</div>
          </div>
        </div>
      </div>

      {/* 搜索栏 */}
      <div style={s.searchBar}>
        <input style={s.searchInput} placeholder="搜索设备、操作人员..." value={searchText} onChange={(e) => setSearchText(e.target.value)} />
        <button style={s.btnOutline}><Filter size={14} /> 筛选</button>
      </div>

      {/* 标签页 */}
      <div style={s.tabs}>
        {['records', 'equipment', 'alerts'].map((tab) => (
          <div key={tab} style={activeTab === tab ? s.tabActive : s.tab} onClick={() => setActiveTab(tab)}>
            {tab === 'records' ? '消毒记录' : tab === 'equipment' ? '设备状态' : '提醒'}
          </div>
        ))}
      </div>

      {/* 消毒记录 */}
      {activeTab === 'records' && (
        <div>
          {DISINFECTION_RECORDS.map((record) => (
            <div key={record.id} style={s.recordCard}>
              <div style={s.recordHeader}>
                <div>
                  <div style={s.recordTitle}>{record.equipment}</div>
                  <div style={s.recordMeta}>操作人：{record.operator} | {record.startTime}</div>
                </div>
                <div style={{ ...s.recordTag, background: record.result === '合格' ? '#f0fdf4' : '#fff7ed', color: record.result === '合格' ? '#22c55e' : '#f97316' }}>
                  {record.result}
                </div>
              </div>
              <div style={s.recordContent}>
                <div style={s.recordItem}>
                  <div style={s.recordItemLabel}>消毒方式</div>
                  <div style={s.recordItemValue}>{record.method}</div>
                </div>
                <div style={s.recordItem}>
                  <div style={s.recordItemLabel}>消毒时长</div>
                  <div style={s.recordItemValue}>{record.duration} 分钟</div>
                </div>
                <div style={s.recordItem}>
                  <div style={s.recordItemLabel}>状态</div>
                  <div style={{ ...s.recordItemValue, color: record.status === 'completed' ? '#22c55e' : '#f97316' }}>
                    {record.status === 'completed' ? '已完成' : '待审核'}
                  </div>
                </div>
              </div>
              <div style={s.recordActions}>
                <button style={s.btnOutline}><ClipboardCheck size={14} /> 查看详情</button>
                {record.status === 'pending' && (
                  <>
                    <button style={{ ...s.btn, ...s.btnSuccess }}><CheckCircle size={14} /> 审核通过</button>
                    <button style={{ ...s.btn, ...s.btnDanger }}><AlertCircle size={14} /> 退回</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 设备状态 */}
      {activeTab === 'equipment' && (
        <div>
          {EQUIPMENT_STATUS.map((equip) => (
            <div key={equip.id} style={s.equipmentCard}>
              <div style={{ ...s.equipmentIcon, background: equip.overdue ? '#fef2f2' : '#f0fdf4' }}>
                <Wrench size={24} color={equip.overdue ? '#ef4444' : '#22c55e'} />
              </div>
              <div style={s.equipmentInfo}>
                <div style={s.equipmentName}>{equip.name}</div>
                <div style={s.equipmentStatus}>
                  <span style={{ color: equip.overdue ? '#ef4444' : '#22c55e', fontWeight: 600 }}>
                    {equip.status}
                  </span>
                  {equip.overdue && <span style={{ color: '#ef4444', marginLeft: 8 }}>已超时</span>}
                </div>
                <div style={s.equipmentMeta}>
                  <span><Clock size={12} style={{ marginRight: 4 }} />上次：{equip.lastDisinfection}</span>
                  <span><Calendar size={12} style={{ marginRight: 4 }} />下次：{equip.nextDisinfection}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {equip.overdue ? (
                  <button style={{ ...s.btn, ...s.btnWarning }}><RefreshCw size={14} /> 立即消毒</button>
                ) : (
                  <span style={{ ...s.recordTag, background: '#f0fdf4', color: '#22c55e' }}><CheckCircle size={12} style={{ marginRight: 4 }} />正常</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 提醒 */}
      {activeTab === 'alerts' && (
        <div>
          {ALERTS.map((alert) => (
            <div key={alert.id} style={{ ...s.alertCard, borderLeftColor: alert.color }}>
              <div style={s.alertHeader}>
                <div style={{ ...s.alertIcon, background: alert.color + '20' }}>
                  <alert.icon size={16} color={alert.color} />
                </div>
                <div style={s.alertTitle}>{alert.title}</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginLeft: 'auto' }}>{alert.time}</div>
              </div>
              <div style={s.alertDesc}>{alert.desc}</div>
              {alert.type === 'warning' && (
                <div style={{ marginTop: 12, marginLeft: 48 }}>
                  <button style={{ ...s.btn, ...s.btnWarning, padding: '6px 12px', fontSize: 12 }}><RefreshCw size={12} /> 处理</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
