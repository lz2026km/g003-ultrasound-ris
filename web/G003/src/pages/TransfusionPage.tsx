// @ts-nocheck
// G003 超声RIS - 输血/输液反应记录页面
import { useState } from 'react'
import { Droplet, Search, Plus, Filter, Download, AlertTriangle, Activity, TrendingUp, Users, Clock } from 'lucide-react'

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
  red: { background: '#fef2f2', color: '#ef4444' },
  orange: { background: '#fff7ed', color: '#f97316' },
  green: { background: '#f0fdf4', color: '#22c55e' },
  blue: { background: '#eff6ff', color: '#3b82f6' },
  purple: { background: '#f5f3ff', color: '#8b5cf6' },
  yellow: { background: '#fefce8', color: '#eab308' },
  // Stats cards
  statsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20,
  },
  statCard: {
    background: '#fff', borderRadius: 10, padding: '16px 20px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex',
    flexDirection: 'column' as const, gap: 8,
  },
  statLabel: { fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 },
  statValue: { fontSize: 24, fontWeight: 700, color: '#1a3a5c' },
  statSub: { fontSize: 11, color: '#94a3b8' },
  // Tab buttons
  tabRow: {
    display: 'flex', gap: 8, marginBottom: 20, borderBottom: '1px solid #e2e8f0', paddingBottom: 12,
  },
  tabBtn: {
    padding: '8px 16px', borderRadius: 6, border: 'none', cursor: 'pointer',
    fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6,
  },
  // Section card
  sectionCard: {
    background: '#fff', borderRadius: 12, padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 16,
  },
  sectionTitle: { fontSize: 15, fontWeight: 600, color: '#1a3a5c', marginBottom: 16 },
  formGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12,
  },
  formGroup: { display: 'flex', flexDirection: 'column' as const, gap: 4 },
  formLabel: { fontSize: 12, color: '#64748b', fontWeight: 500 },
  formInput: {
    padding: '8px 12px', borderRadius: 6, border: '1px solid #e2e8f0',
    fontSize: 13, color: '#1a3a5c', outline: 'none', minHeight: 38,
  },
  formSelect: {
    padding: '8px 12px', borderRadius: 6, border: '1px solid #e2e8f0',
    fontSize: 13, color: '#1a3a5c', background: '#fff', outline: 'none', minHeight: 38,
  },
  // Reaction severity indicators
  severityDot: {
    width: 8, height: 8, borderRadius: '50%', display: 'inline-block', marginRight: 6,
  },
}

const mockTransfusionRecords = [
  { id: 'TR001', patientId: 'P20240001', patientName: '张三', bloodType: 'A', product: '红细胞悬液', volume: '400ml', speed: '60滴/分', dateTime: '2024-03-15 09:30', nurse: '李护士', doctor: '王医生', status: '已完成', reaction: '无' },
  { id: 'TR002', patientId: 'P20240002', patientName: '李四', bloodType: 'B', product: '血小板', volume: '250ml', speed: '80滴/分', dateTime: '2024-03-15 10:15', nurse: '王护士', doctor: '赵医生', status: '已完成', reaction: '发热' },
  { id: 'TR003', patientId: 'P20240003', patientName: '王五', bloodType: 'O', product: '血浆', volume: '300ml', speed: '50滴/分', dateTime: '2024-03-15 11:00', nurse: '赵护士', doctor: '王医生', status: '进行中', reaction: '无' },
  { id: 'TR004', patientId: 'P20240004', patientName: '赵六', bloodType: 'AB', product: '红细胞悬液', volume: '400ml', speed: '65滴/分', dateTime: '2024-03-15 14:20', nurse: '李护士', doctor: '孙医生', status: '已完成', reaction: '过敏' },
  { id: 'TR005', patientId: 'P20240005', patientName: '钱七', bloodType: 'A', product: '全血', volume: '500ml', speed: '55滴/分', dateTime: '2024-03-15 15:00', nurse: '王护士', doctor: '王医生', status: '已完成', reaction: '无' },
  { id: 'TR006', patientId: 'P20240006', patientName: '孙八', bloodType: 'B', product: '红细胞悬液', volume: '400ml', speed: '70滴/分', dateTime: '2024-03-16 08:30', nurse: '赵护士', doctor: '赵医生', status: '已完成', reaction: '休克' },
  { id: 'TR007', patientId: 'P20240007', patientName: '周九', bloodType: 'O', product: '血小板', volume: '250ml', speed: '90滴/分', dateTime: '2024-03-16 09:45', nurse: '李护士', doctor: '孙医生', status: '已完成', reaction: '无' },
  { id: 'TR008', patientId: 'P20240008', patientName: '吴十', bloodType: 'A', product: '血浆', volume: '300ml', speed: '60滴/分', dateTime: '2024-03-16 10:30', nurse: '王护士', doctor: '王医生', status: '已完成', reaction: '其他' },
  { id: 'TR009', patientId: 'P20240009', patientName: '郑十一', bloodType: 'AB', product: '红细胞悬液', volume: '400ml', speed: '55滴/分', dateTime: '2024-03-16 11:15', nurse: '赵护士', doctor: '赵医生', status: '已完成', reaction: '无' },
  { id: 'TR010', patientId: 'P20240010', patientName: '冯十二', bloodType: 'B', product: '全血', volume: '500ml', speed: '50滴/分', dateTime: '2024-03-16 14:00', nurse: '李护士', doctor: '孙医生', status: '已完成', reaction: '发热' },
  { id: 'TR011', patientId: 'P20240011', patientName: '陈十三', bloodType: 'O', product: '红细胞悬液', volume: '400ml', speed: '75滴/分', dateTime: '2024-03-17 08:00', nurse: '王护士', doctor: '王医生', status: '已完成', reaction: '无' },
  { id: 'TR012', patientId: 'P20240012', patientName: '楚十四', bloodType: 'A', product: '血小板', volume: '250ml', speed: '85滴/分', dateTime: '2024-03-17 09:30', nurse: '赵护士', doctor: '赵医生', status: '已完成', reaction: '过敏' },
  { id: 'TR013', patientId: 'P20240013', patientName: '卫十五', bloodType: 'AB', product: '血浆', volume: '300ml', speed: '65滴/分', dateTime: '2024-03-17 10:45', nurse: '李护士', doctor: '孙医生', status: '进行中', reaction: '无' },
  { id: 'TR014', patientId: 'P20240014', patientName: '蒋十六', bloodType: 'B', product: '红细胞悬液', volume: '400ml', speed: '60滴/分', dateTime: '2024-03-17 13:20', nurse: '王护士', doctor: '王医生', status: '已完成', reaction: '无' },
  { id: 'TR015', patientId: 'P20240015', patientName: '沈十七', bloodType: 'O', product: '全血', volume: '500ml', speed: '55滴/分', dateTime: '2024-03-17 14:30', nurse: '赵护士', doctor: '赵医生', status: '已完成', reaction: '发热' },
  { id: 'TR016', patientId: 'P20240016', patientName: '韩十八', bloodType: 'A', product: '红细胞悬液', volume: '400ml', speed: '70滴/分', dateTime: '2024-03-18 08:45', nurse: '李护士', doctor: '孙医生', status: '已完成', reaction: '无' },
]

const mockReactionRecords = [
  { id: 'RR001', transfusionId: 'TR002', patientName: '李四', reactionType: '发热', severity: '轻度', treatment: '物理降温', outcome: '好转', time: '2024-03-15 10:45' },
  { id: 'RR002', transfusionId: 'TR004', patientName: '赵六', reactionType: '过敏', severity: '中度', treatment: '抗过敏药物', outcome: '好转', time: '2024-03-15 15:00' },
  { id: 'RR003', transfusionId: 'TR006', patientName: '孙八', reactionType: '休克', severity: '重度', treatment: '立即抢救', outcome: '稳定', time: '2024-03-16 09:10' },
  { id: 'RR004', transfusionId: 'TR008', patientName: '吴十', reactionType: '其他', severity: '轻度', treatment: '密切观察', outcome: '观察中', time: '2024-03-16 11:00' },
  { id: 'RR005', transfusionId: 'TR010', patientName: '冯十二', reactionType: '发热', severity: '轻度', treatment: '退热药物', outcome: '好转', time: '2024-03-16 15:30' },
  { id: 'RR006', transfusionId: 'TR012', patientName: '楚十四', reactionType: '过敏', severity: '中度', treatment: '抗过敏药物+激素', outcome: '好转', time: '2024-03-17 10:00' },
  { id: 'RR007', transfusionId: 'TR015', patientName: '沈十七', reactionType: '发热', severity: '轻度', treatment: '物理降温', outcome: '好转', time: '2024-03-17 15:00' },
]

const mockAdverseEvents = [
  { id: 'AE001', transfusionId: 'TR006', patientName: '孙八', eventType: '严重输血反应', description: '患者在输血过程中出现休克症状，立即停止输血并抢救', reportTime: '2024-03-16 09:15', reporter: '李护士', status: '已上报' },
  { id: 'AE002', transfusionId: 'TR004', patientName: '赵六', eventType: '输血过敏反应', description: '患者出现面部潮红、荨麻疹，给予抗过敏处理', reportTime: '2024-03-15 15:05', reporter: '王护士', status: '已处理' },
  { id: 'AE003', transfusionId: 'TR008', patientName: '吴十', eventType: '其他输血反应', description: '患者主诉头晕不适，疑似心理性反应', reportTime: '2024-03-16 11:05', reporter: '赵护士', status: '已处理' },
]

export default function TransfusionPage() {
  const [activeTab, setActiveTab] = useState('records')
  const [search, setSearch] = useState('')
  const [reactionFilter, setReactionFilter] = useState('全部')
  const [severityFilter, setSeverityFilter] = useState('全部')

  const filteredRecords = mockTransfusionRecords.filter(r => {
    const matchSearch = r.patientName.includes(search) || r.patientId.includes(search) || r.id.includes(search)
    const matchReaction = reactionFilter === '全部' || r.reaction === reactionFilter
    return matchSearch && matchReaction
  })

  const filteredReactions = mockReactionRecords.filter(r => {
    const matchSearch = r.patientName.includes(search) || r.transfusionId.includes(search)
    const matchSeverity = severityFilter === '全部' || r.severity === severityFilter
    return matchSearch && matchSeverity
  })

  const totalTransfusions = mockTransfusionRecords.length
  const completedTransfusions = mockTransfusionRecords.filter(r => r.status === '已完成').length
  const reactionCount = mockReactionRecords.length
  const adverseEvents = mockAdverseEvents.length

  const getSeverityStyle = (severity: string) => {
    if (severity === '重度') return s.red
    if (severity === '中度') return s.orange
    if (severity === '轻度') return s.yellow
    return s.green
  }

  const getReactionStyle = (reaction: string) => {
    if (reaction === '发热') return s.orange
    if (reaction === '过敏') return s.red
    if (reaction === '休克') return s.red
    if (reaction === '其他') return s.purple
    return s.green
  }

  const getStatusStyle = (status: string) => {
    if (status === '已完成') return s.green
    if (status === '进行中') return s.blue
    if (status === '已上报') return s.red
    return s.purple
  }

  return (
    <div style={s.root}>
      <div style={s.header}>
        <h1 style={s.title}>输血/输液反应记录</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ ...s.actionBtn, background: '#dc2626', color: '#fff' }}>
            <Plus size={14} /> 新增输血记录
          </button>
          <button style={{ ...s.actionBtn, background: '#fff', color: '#475569', border: '1px solid #e2e8f0' }}>
            <Download size={14} /> 导出
          </button>
        </div>
      </div>

      {/* Statistics Dashboard */}
      <div style={s.statsGrid}>
        <div style={s.statCard}>
          <div style={s.statLabel}><Droplet size={14} color="#3b82f6" /> 输血总次数</div>
          <div style={s.statValue}>{totalTransfusions}</div>
          <div style={s.statSub}>本月累计</div>
        </div>
        <div style={s.statCard}>
          <div style={s.statLabel}><Activity size={14} color="#22c55e" /> 已完成</div>
          <div style={s.statValue}>{completedTransfusions}</div>
          <div style={s.statSub}>完成率 {Math.round(completedTransfusions / totalTransfusions * 100)}%</div>
        </div>
        <div style={s.statCard}>
          <div style={s.statLabel}><AlertTriangle size={14} color="#f97316" /> 反应记录</div>
          <div style={s.statValue}>{reactionCount}</div>
          <div style={s.statSub}>发生率 {Math.round(reactionCount / totalTransfusions * 100)}%</div>
        </div>
        <div style={s.statCard}>
          <div style={s.statLabel}><TrendingUp size={14} color="#ef4444" /> 不良事件</div>
          <div style={s.statValue}>{adverseEvents}</div>
          <div style={s.statSub}>需关注</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={s.tabRow}>
        <button
          style={{ ...s.tabBtn, background: activeTab === 'records' ? '#3b82f6' : '#fff', color: activeTab === 'records' ? '#fff' : '#64748b' }}
          onClick={() => setActiveTab('records')}
        >
          <Droplet size={14} /> 输血记录
        </button>
        <button
          style={{ ...s.tabBtn, background: activeTab === 'reactions' ? '#f97316' : '#fff', color: activeTab === 'reactions' ? '#fff' : '#64748b' }}
          onClick={() => setActiveTab('reactions')}
        >
          <AlertTriangle size={14} /> 反应记录
        </button>
        <button
          style={{ ...s.tabBtn, background: activeTab === 'adverse' ? '#ef4444' : '#fff', color: activeTab === 'adverse' ? '#fff' : '#64748b' }}
          onClick={() => setActiveTab('adverse')}
        >
          <TrendingUp size={14} /> 不良事件
        </button>
        <button
          style={{ ...s.tabBtn, background: activeTab === 'stats' ? '#8b5cf6' : '#fff', color: activeTab === 'stats' ? '#fff' : '#64748b' }}
          onClick={() => setActiveTab('stats')}
        >
          <TrendingUp size={14} /> 统计报表
        </button>
      </div>

      {/* Filter Row */}
      <div style={s.filterRow}>
        <Search size={14} color="#64748b" />
        <input style={s.searchInput} placeholder="搜索患者姓名/ID/记录ID..." value={search} onChange={e => setSearch(e.target.value)} />
        {activeTab === 'records' && (
          <select style={s.filterBtn} value={reactionFilter} onChange={e => setReactionFilter(e.target.value)}>
            <option>全部</option>
            <option>无</option>
            <option>发热</option>
            <option>过敏</option>
            <option>休克</option>
            <option>其他</option>
          </select>
        )}
        {activeTab === 'reactions' && (
          <select style={s.filterBtn} value={severityFilter} onChange={e => setSeverityFilter(e.target.value)}>
            <option>全部级别</option>
            <option>轻度</option>
            <option>中度</option>
            <option>重度</option>
          </select>
        )}
        <button style={{ ...s.filterBtn, background: '#f8fafc' }}>
          <Filter size={14} /> 筛选
        </button>
      </div>

      {/* Transfusion Records Table */}
      {activeTab === 'records' && (
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>记录ID</th>
                <th style={s.th}>患者ID</th>
                <th style={s.th}>患者姓名</th>
                <th style={s.th}>血型</th>
                <th style={s.th}>血液制品</th>
                <th style={s.th}>用量</th>
                <th style={s.th}>速度</th>
                <th style={s.th}>日期/时间</th>
                <th style={s.th}>护士</th>
                <th style={s.th}>医生</th>
                <th style={s.th}>状态</th>
                <th style={s.th}>反应</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map(r => (
                <tr key={r.id} style={{ cursor: 'pointer' }}>
                  <td style={s.td}><span style={{ fontFamily: 'monospace', color: '#dc2626' }}>{r.id}</span></td>
                  <td style={s.td}><span style={{ fontFamily: 'monospace' }}>{r.patientId}</span></td>
                  <td style={{ ...s.td, fontWeight: 600, color: '#1a3a5c' }}>{r.patientName}</td>
                  <td style={s.td}><span style={{ ...s.badge, ...s.blue }}>{r.bloodType}型</span></td>
                  <td style={s.td}><Droplet size={12} style={{ marginRight: 4 }} />{r.product}</td>
                  <td style={s.td}>{r.volume}</td>
                  <td style={s.td}><Clock size={12} style={{ marginRight: 4 }} />{r.speed}</td>
                  <td style={s.td}>{r.dateTime}</td>
                  <td style={s.td}>{r.nurse}</td>
                  <td style={s.td}>{r.doctor}</td>
                  <td style={s.td}><span style={{ ...s.badge, ...getStatusStyle(r.status) }}>{r.status}</span></td>
                  <td style={s.td}><span style={{ ...s.badge, ...getReactionStyle(r.reaction) }}>{r.reaction}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reaction Records Table */}
      {activeTab === 'reactions' && (
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>反应ID</th>
                <th style={s.th}>输血ID</th>
                <th style={s.th}>患者姓名</th>
                <th style={s.th}>反应类型</th>
                <th style={s.th}>严重程度</th>
                <th style={s.th}>处理措施</th>
                <th style={s.th}>转归</th>
                <th style={s.th}>发生时间</th>
              </tr>
            </thead>
            <tbody>
              {filteredReactions.map(r => (
                <tr key={r.id} style={{ cursor: 'pointer' }}>
                  <td style={s.td}><span style={{ fontFamily: 'monospace', color: '#f97316' }}>{r.id}</span></td>
                  <td style={s.td}><span style={{ fontFamily: 'monospace' }}>{r.transfusionId}</span></td>
                  <td style={{ ...s.td, fontWeight: 600, color: '#1a3a5c' }}>{r.patientName}</td>
                  <td style={s.td}><AlertTriangle size={12} style={{ marginRight: 4 }} /><span style={{ ...s.badge, ...getReactionStyle(r.reactionType) }}>{r.reactionType}</span></td>
                  <td style={s.td}>
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ ...s.severityDot, background: r.severity === '重度' ? '#ef4444' : r.severity === '中度' ? '#f97316' : r.severity === '轻度' ? '#eab308' : '#22c55e' }} />
                      <span style={{ ...s.badge, ...getSeverityStyle(r.severity) }}>{r.severity}</span>
                    </span>
                  </td>
                  <td style={s.td}><span style={{ color: '#64748b' }}>{r.treatment}</span></td>
                  <td style={s.td}><span style={{ ...s.badge, ...getStatusStyle(r.outcome) }}>{r.outcome}</span></td>
                  <td style={s.td}>{r.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Adverse Events Table */}
      {activeTab === 'adverse' && (
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>事件ID</th>
                <th style={s.th}>输血ID</th>
                <th style={s.th}>患者姓名</th>
                <th style={s.th}>事件类型</th>
                <th style={s.th}>事件描述</th>
                <th style={s.th}>上报时间</th>
                <th style={s.th}>报告人</th>
                <th style={s.th}>处理状态</th>
              </tr>
            </thead>
            <tbody>
              {mockAdverseEvents.map(r => (
                <tr key={r.id} style={{ cursor: 'pointer' }}>
                  <td style={s.td}><span style={{ fontFamily: 'monospace', color: '#ef4444' }}>{r.id}</span></td>
                  <td style={s.td}><span style={{ fontFamily: 'monospace' }}>{r.transfusionId}</span></td>
                  <td style={{ ...s.td, fontWeight: 600, color: '#1a3a5c' }}>{r.patientName}</td>
                  <td style={s.td}><span style={{ ...s.badge, ...s.red }}><TrendingUp size={10} style={{ marginRight: 4 }} />{r.eventType}</span></td>
                  <td style={{ ...s.td, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.description}</td>
                  <td style={s.td}>{r.reportTime}</td>
                  <td style={s.td}><Users size={12} style={{ marginRight: 4 }} />{r.reporter}</td>
                  <td style={s.td}><span style={{ ...s.badge, ...getStatusStyle(r.status) }}>{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Statistics Dashboard */}
      {activeTab === 'stats' && (
        <div>
          <div style={s.sectionCard}>
            <h3 style={s.sectionTitle}>输血反应统计</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              <div style={{ ...s.statCard, borderLeft: '4px solid #22c55e' }}>
                <div style={s.statLabel}>无反应</div>
                <div style={s.statValue}>{mockTransfusionRecords.filter(r => r.reaction === '无').length}</div>
                <div style={s.statSub}>占比 {Math.round(mockTransfusionRecords.filter(r => r.reaction === '无').length / totalTransfusions * 100)}%</div>
              </div>
              <div style={{ ...s.statCard, borderLeft: '4px solid #f97316' }}>
                <div style={s.statLabel}>发热反应</div>
                <div style={s.statValue}>{mockTransfusionRecords.filter(r => r.reaction === '发热').length}</div>
                <div style={s.statSub}>占比 {Math.round(mockTransfusionRecords.filter(r => r.reaction === '发热').length / totalTransfusions * 100)}%</div>
              </div>
              <div style={{ ...s.statCard, borderLeft: '4px solid #ef4444' }}>
                <div style={s.statLabel}>过敏反应</div>
                <div style={s.statValue}>{mockTransfusionRecords.filter(r => r.reaction === '过敏').length}</div>
                <div style={s.statSub}>占比 {Math.round(mockTransfusionRecords.filter(r => r.reaction === '过敏').length / totalTransfusions * 100)}%</div>
              </div>
              <div style={{ ...s.statCard, borderLeft: '4px solid #8b5cf6' }}>
                <div style={s.statLabel}>其他反应</div>
                <div style={s.statValue}>{mockTransfusionRecords.filter(r => r.reaction === '其他' || r.reaction === '休克').length}</div>
                <div style={s.statSub}>占比 {Math.round((mockTransfusionRecords.filter(r => r.reaction === '其他').length + mockTransfusionRecords.filter(r => r.reaction === '休克').length) / totalTransfusions * 100)}%</div>
              </div>
            </div>
          </div>

          <div style={s.sectionCard}>
            <h3 style={s.sectionTitle}>血液制品使用分布</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              <div style={{ ...s.statCard, borderLeft: '4px solid #3b82f6' }}>
                <div style={s.statLabel}>红细胞悬液</div>
                <div style={s.statValue}>{mockTransfusionRecords.filter(r => r.product === '红细胞悬液').length}</div>
                <div style={s.statSub}>最常用制品</div>
              </div>
              <div style={{ ...s.statCard, borderLeft: '4px solid #f97316' }}>
                <div style={s.statLabel}>血小板</div>
                <div style={s.statValue}>{mockTransfusionRecords.filter(r => r.product === '血小板').length}</div>
                <div style={s.statSub}>次常用制品</div>
              </div>
              <div style={{ ...s.statCard, borderLeft: '4px solid #22c55e' }}>
                <div style={s.statLabel}>血浆</div>
                <div style={s.statValue}>{mockTransfusionRecords.filter(r => r.product === '血浆').length}</div>
                <div style={s.statSub}>第三常用</div>
              </div>
              <div style={{ ...s.statCard, borderLeft: '4px solid #8b5cf6' }}>
                <div style={s.statLabel}>全血</div>
                <div style={s.statValue}>{mockTransfusionRecords.filter(r => r.product === '全血').length}</div>
                <div style={s.statSub}>较少使用</div>
              </div>
            </div>
          </div>

          <div style={s.sectionCard}>
            <h3 style={s.sectionTitle}>严重程度分布</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              <div style={{ ...s.statCard, borderLeft: '4px solid #22c55e' }}>
                <div style={s.statLabel}>轻度反应</div>
                <div style={s.statValue}>{mockReactionRecords.filter(r => r.severity === '轻度').length}</div>
                <div style={s.statSub}>可观察处理</div>
              </div>
              <div style={{ ...s.statCard, borderLeft: '4px solid #f97316' }}>
                <div style={s.statLabel}>中度反应</div>
                <div style={s.statValue}>{mockReactionRecords.filter(r => r.severity === '中度').length}</div>
                <div style={s.statSub}>需药物治疗</div>
              </div>
              <div style={{ ...s.statCard, borderLeft: '4px solid #ef4444' }}>
                <div style={s.statLabel}>重度反应</div>
                <div style={s.statValue}>{mockReactionRecords.filter(r => r.severity === '重度').length}</div>
                <div style={s.statSub}>需紧急抢救</div>
              </div>
            </div>
          </div>

          <div style={s.sectionCard}>
            <h3 style={s.sectionTitle}>转归情况</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              <div style={{ ...s.statCard, borderLeft: '4px solid #22c55e' }}>
                <div style={s.statLabel}>好转</div>
                <div style={s.statValue}>{mockReactionRecords.filter(r => r.outcome === '好转').length}</div>
                <div style={s.statSub}>经处理后好转</div>
              </div>
              <div style={{ ...s.statCard, borderLeft: '4px solid #3b82f6' }}>
                <div style={s.statLabel}>稳定</div>
                <div style={s.statValue}>{mockReactionRecords.filter(r => r.outcome === '稳定').length}</div>
                <div style={s.statSub}>病情稳定</div>
              </div>
              <div style={{ ...s.statCard, borderLeft: '4px solid #64748b' }}>
                <div style={s.statLabel}>观察中</div>
                <div style={s.statValue}>{mockReactionRecords.filter(r => r.outcome === '观察中').length}</div>
                <div style={s.statSub}>继续观察</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
