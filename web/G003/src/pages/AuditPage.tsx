// @ts-nocheck
// G003 超声RIS - 审计日志页面
import { useState } from 'react'
import { Shield, Search, Filter, Download, Clock, User, FileText } from 'lucide-react'

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
}

const auditLogs = [
  { id: 'LOG001', timestamp: '2026-04-28 14:32:15', user: '李医生', action: '登录系统', module: '认证', ip: '192.168.1.101', result: '成功' },
  { id: 'LOG002', timestamp: '2026-04-28 14:35:22', user: '李医生', action: '查看报告', module: '报告管理', ip: '192.168.1.101', result: '成功' },
  { id: 'LOG003', timestamp: '2026-04-28 14:40:08', user: '王护士', action: '修改患者信息', module: '患者管理', ip: '192.168.1.102', result: '成功' },
  { id: 'LOG004', timestamp: '2026-04-28 15:02:33', user: '张医生', action: '删除检查记录', module: '检查管理', ip: '192.168.1.103', result: '失败' },
  { id: 'LOG005', timestamp: '2026-04-28 15:15:45', user: '管理员', action: '系统设置修改', module: '系统配置', ip: '192.168.1.1', result: '成功' },
  { id: 'LOG006', timestamp: '2026-04-28 15:30:12', user: '李医生', action: '导出数据', module: '数据导出', ip: '192.168.1.101', result: '成功' },
  { id: 'LOG007', timestamp: '2026-04-28 16:05:28', user: '王护士', action: '预约患者', module: '预约管理', ip: '192.168.1.102', result: '成功' },
  { id: 'LOG008', timestamp: '2026-04-28 16:22:41', user: '未知', action: '登录系统', module: '认证', ip: '192.168.1.200', result: '失败' },
]

const actionColors: Record<string, { bg: string; color: string }> = {
  '成功': { bg: '#f0fdf4', color: '#22c55e' },
  '失败': { bg: '#fef2f2', color: '#ef4444' },
}

const moduleIcons: Record<string, string> = {
  '认证': '🔐',
  '报告管理': '📄',
  '患者管理': '👤',
  '检查管理': '🔍',
  '系统配置': '⚙️',
  '数据导出': '📊',
  '预约管理': '📅',
}

export default function AuditPage() {
  const [search, setSearch] = useState('')
  const [filterModule, setFilterModule] = useState('全部')
  const [filterResult, setFilterResult] = useState('全部')

  const filtered = auditLogs.filter(log => {
    const matchSearch = log.user.includes(search) || log.action.includes(search) || log.ip.includes(search)
    const matchModule = filterModule === '全部' || log.module === filterModule
    const matchResult = filterResult === '全部' || log.result === filterResult
    return matchSearch && matchModule && matchResult
  })

  const modules = ['全部', ...Array.from(new Set(auditLogs.map(i => i.module)))]
  const failCount = auditLogs.filter(i => i.result === '失败').length

  return (
    <div style={s.root}>
      <div style={s.header}>
        <h1 style={s.title}>审计日志</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ ...s.actionBtn, background: '#fff', color: '#475569', border: '1px solid #e2e8f0' }}>
            <Download size={14} /> 导出日志
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        <div style={s.statCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Shield size={18} color="#3b82f6" />
            <span style={{ fontSize: 13, color: '#64748b' }}>总日志数</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#1a3a5c' }}>{auditLogs.length}</div>
        </div>
        <div style={s.statCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <FileText size={18} color="#ef4444" />
            <span style={{ fontSize: 13, color: '#64748b' }}>失败操作</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#ef4444' }}>{failCount}</div>
        </div>
        <div style={s.statCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <User size={18} color="#22c55e" />
            <span style={{ fontSize: 13, color: '#64748b' }}>活跃用户</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#1a3a5c' }}>
            {new Set(auditLogs.map(i => i.user)).size}
          </div>
        </div>
      </div>

      <div style={s.filterRow}>
        <Search size={14} color="#64748b" />
        <input style={s.searchInput} placeholder="搜索用户/操作/IP..." value={search} onChange={e => setSearch(e.target.value)} />
        <select style={s.filterBtn} value={filterModule} onChange={e => setFilterModule(e.target.value)}>
          {modules.map(m => <option key={m}>{m}</option>)}
        </select>
        <select style={s.filterBtn} value={filterResult} onChange={e => setFilterResult(e.target.value)}>
          <option>全部</option>
          <option>成功</option>
          <option>失败</option>
        </select>
      </div>

      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>日志ID</th>
              <th style={s.th}>时间</th>
              <th style={s.th}>用户</th>
              <th style={s.th}>操作</th>
              <th style={s.th}>模块</th>
              <th style={s.th}>IP地址</th>
              <th style={s.th}>结果</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(log => (
              <tr key={log.id} style={{ cursor: 'pointer' }}>
                <td style={s.td}><span style={{ fontFamily: 'monospace', color: '#3b82f6' }}>{log.id}</span></td>
                <td style={{ ...s.td, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={12} color="#94a3b8" />{log.timestamp}
                </td>
                <td style={{ ...s.td, fontWeight: 600, color: '#1a3a5c' }}>{log.user}</td>
                <td style={s.td}>{log.action}</td>
                <td style={s.td}>
                  <span style={{ marginRight: 4 }}>{moduleIcons[log.module]}</span>{log.module}
                </td>
                <td style={s.td}><code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, fontSize: 11 }}>{log.ip}</code></td>
                <td style={s.td}>
                  <span style={{ ...s.badge, background: actionColors[log.result]?.bg, color: actionColors[log.result]?.color }}>
                    {log.result}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
