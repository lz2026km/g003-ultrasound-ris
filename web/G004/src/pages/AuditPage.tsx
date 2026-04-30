// ============================================================
// G004 内镜管理系统 - 审计日志页面
// ============================================================
import { useState, useMemo } from 'react'
import {
  Search, Filter, RefreshCw, ChevronLeft, ChevronRight,
  FileText, AlertCircle, CheckCircle, Clock, User, Activity
} from 'lucide-react'
import type { AuditLog } from '../types'
import { initialAuditLogs } from '../data/initialData'

// ---------- 样式定义 ----------
const s: Record<string, React.CSSProperties> = {
  root: { padding: 0 },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 18, fontWeight: 700, color: '#1a3a5c', margin: 0 },
  toolbar: {
    display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap',
    background: '#fff', padding: '12px 16px', borderRadius: 8,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: 16,
  },
  searchBox: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: '#f8fafc', border: '1px solid #e2e8f0',
    borderRadius: 6, padding: '6px 12px', flex: 1, minWidth: 180,
  },
  searchInput: {
    border: 'none', outline: 'none', background: 'transparent',
    fontSize: 13, color: '#334155', width: '100%',
  },
  select: {
    border: '1px solid #e2e8f0', borderRadius: 6, padding: '6px 10px',
    fontSize: 13, color: '#334155', background: '#f8fafc', outline: 'none',
    cursor: 'pointer',
  },
  input: {
    border: '1px solid #e2e8f0', borderRadius: 6, padding: '6px 10px',
    fontSize: 13, color: '#334155', background: '#f8fafc', outline: 'none',
  },
  statRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    background: '#fff',
    borderRadius: 8,
    padding: '14px 16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  statIcon: {
    width: 36, height: 36, borderRadius: 8,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  statValue: {
    fontSize: 20, fontWeight: 700, color: '#1a3a5c', lineHeight: 1.2,
  },
  statLabel: {
    fontSize: 11, color: '#64748b', marginTop: 2,
  },
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
  tdMono: {
    padding: '10px 12px', fontSize: 12, color: '#64748b', borderBottom: '1px solid #f1f5f9',
    fontFamily: 'monospace',
  },
  badge: {
    display: 'inline-block', padding: '2px 8px', borderRadius: 12, fontSize: 11,
    fontWeight: 500,
  },
  badgeSuccess: { background: '#f0fdf4', color: '#16a34a' },
  badgeFail: { background: '#fef2f2', color: '#dc2626' },
  badgeLogin: { background: '#eff6ff', color: '#2563eb' },
  badgeCreate: { background: '#f5f3ff', color: '#7c3aed' },
  badgeEdit: { background: '#fff7ed', color: '#ea580c' },
  badgeDelete: { background: '#fee2e2', color: '#dc2626' },
  badgeReview: { background: '#ecfdf5', color: '#059669' },
  badgePrint: { background: '#f0f9ff', color: '#0284c7' },
  badgePublish: { background: '#fefce8', color: '#ca8a04' },
  badgeQC: { background: '#fdf4ff', color: '#a21caf' },
  badgeSystem: { background: '#f1f5f9', color: '#475569' },
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
    background: '#fff', color: '#475569', cursor: 'pointer', fontSize: 13,
  },
  pageBtnActive: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 32, height: 32, borderRadius: 6, border: 'none',
    background: '#1a3a5c', color: '#fff', cursor: 'pointer', fontSize: 13,
  },
  detailPanel: {
    position: 'fixed', top: 0, right: 0, bottom: 0, width: 420,
    background: '#fff', boxShadow: '-4px 0 20px rgba(0,0,0,0.1)',
    zIndex: 1000, padding: 24, overflowY: 'auto',
  },
  detailTitle: {
    fontSize: 16, fontWeight: 700, color: '#1a3a5c', marginBottom: 20,
  },
  detailRow: {
    display: 'flex', justifyContent: 'space-between', padding: '10px 0',
    borderBottom: '1px solid #f1f5f9', fontSize: 13,
  },
  detailLabel: { color: '#64748b' },
  detailValue: { color: '#1a3a5c', fontWeight: 500, textAlign: 'right', maxWidth: '60%' },
  detailSection: {
    marginTop: 20, padding: 16, background: '#f8fafc', borderRadius: 8,
  },
  detailSectionTitle: {
    fontSize: 13, fontWeight: 600, color: '#1a3a5c', marginBottom: 12,
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
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.3)', zIndex: 999,
  },
  closeBtn: {
    position: 'absolute', top: 16, right: 16, background: 'none', border: 'none',
    cursor: 'pointer', color: '#94a3b8',
  },
}

// ---------- 辅助函数 ----------
function getActionBadgeStyle(actionType: AuditLog['actionType']) {
  const map: Record<string, React.CSSProperties> = {
    '登录': s.badgeLogin,
    '新增': s.badgeCreate,
    '修改': s.badgeEdit,
    '删除': s.badgeDelete,
    '审核': s.badgeReview,
    '打印': s.badgePrint,
    '发布': s.badgePublish,
    '质控': s.badgeQC,
    '系统': s.badgeSystem,
  }
  return map[actionType] || s.badgeSystem
}

function getResultBadgeStyle(result: AuditLog['result']) {
  return result === '成功'
    ? { background: '#f0fdf4', color: '#16a34a' }
    : { background: '#fef2f2', color: '#dc2626' }
}

// ============ 审计日志页面组件 ============
export default function AuditPage() {
  const [logs] = useState<AuditLog[]>(initialAuditLogs)
  const [searchText, setSearchText] = useState('')
  const [filterAction, setFilterAction] = useState<string>('全部')
  const [filterModule, setFilterModule] = useState<string>('全部')
  const [filterResult, setFilterResult] = useState<string>('全部')
  const [page, setPage] = useState(1)
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const pageSize = 10

  // 统计
  const stats = useMemo(() => {
    const total = logs.length
    const success = logs.filter(l => l.result === '成功').length
    const fail = logs.filter(l => l.result === '失败').length
    const today = logs.filter(l => l.actionTime.startsWith('2026-04-29')).length
    return { total, success, fail, today }
  }, [logs])

  // 筛选
  const filtered = useMemo(() => {
    return logs.filter(log => {
      const matchText = searchText === '' ||
        log.userName.includes(searchText) ||
        log.targetName.includes(searchText) ||
        log.module.includes(searchText) ||
        log.id.includes(searchText)
      const matchAction = filterAction === '全部' || log.actionType === filterAction
      const matchModule = filterModule === '全部' || log.module === filterModule
      const matchResult = filterResult === '全部' || log.result === filterResult
      return matchText && matchAction && matchModule && matchResult
    })
  }, [logs, searchText, filterAction, filterModule, filterResult])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  // 模块列表
  const modules = useMemo(() => {
    const set = new Set(logs.map(l => l.module))
    return ['全部', ...Array.from(set)]
  }, [logs])

  const actionTypes = ['全部', '登录', '新增', '修改', '删除', '审核', '打印', '发布', '质控', '系统']

  return (
    <div style={s.root}>
      {/* 标题 */}
      <div style={s.header}>
        <h1 style={s.title}>审计日志</h1>
      </div>

      {/* 统计卡片 */}
      <div style={s.statRow}>
        <div style={s.statCard}>
          <div style={{ ...s.statIcon, background: '#eff6ff' }}>
            <FileText size={18} color="#3b82f6" />
          </div>
          <div>
            <div style={s.statValue}>{stats.total}</div>
            <div style={s.statLabel}>日志总数</div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statIcon, background: '#f0fdf4' }}>
            <CheckCircle size={18} color="#22c55e" />
          </div>
          <div>
            <div style={s.statValue}>{stats.success}</div>
            <div style={s.statLabel}>成功操作</div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statIcon, background: '#fef2f2' }}>
            <AlertCircle size={18} color="#ef4444" />
          </div>
          <div>
            <div style={s.statValue}>{stats.fail}</div>
            <div style={s.statLabel}>失败操作</div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statIcon, background: '#f5f3ff' }}>
            <Clock size={18} color="#8b5cf6" />
          </div>
          <div>
            <div style={s.statValue}>{stats.today}</div>
            <div style={s.statLabel}>今日记录</div>
          </div>
        </div>
      </div>

      {/* 工具栏 */}
      <div style={s.toolbar}>
        <div style={s.searchBox}>
          <Search size={14} color="#94a3b8" />
          <input
            style={s.searchInput}
            placeholder="搜索用户、目标、模块..."
            value={searchText}
            onChange={e => { setSearchText(e.target.value); setPage(1) }}
          />
        </div>
        <select style={s.select} value={filterAction} onChange={e => { setFilterAction(e.target.value); setPage(1) }}>
          {actionTypes.map(a => <option key={a} value={a}>{a === '全部' ? '全部操作' : a}</option>)}
        </select>
        <select style={s.select} value={filterModule} onChange={e => { setFilterModule(e.target.value); setPage(1) }}>
          {modules.map(m => <option key={m} value={m}>{m === '全部' ? '全部模块' : m}</option>)}
        </select>
        <select style={s.select} value={filterResult} onChange={e => { setFilterResult(e.target.value); setPage(1) }}>
          <option value="全部">全部结果</option>
          <option value="成功">成功</option>
          <option value="失败">失败</option>
        </select>
        <button style={{ ...s.select, display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => { setSearchText(''); setFilterAction('全部'); setFilterModule('全部'); setFilterResult('全部'); setPage(1) }}>
          <RefreshCw size={12} /> 重置
        </button>
      </div>

      {/* 表格 */}
      {paged.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <div style={s.emptyState}>
            <div style={s.emptyIcon}>
              <FileText size={28} color="#94a3b8" />
            </div>
            <div style={s.emptyTitle}>暂无日志记录</div>
            <div style={s.emptyDesc}>没有找到符合条件的审计日志，请调整筛选条件</div>
          </div>
        </div>
      ) : (
        <table style={s.table}>
        <thead>
          <tr>
            <th style={s.th}>时间</th>
            <th style={s.th}>用户</th>
            <th style={s.th}>角色</th>
            <th style={s.th}>操作类型</th>
            <th style={s.th}>模块</th>
            <th style={s.th}>目标</th>
            <th style={s.th}>结果</th>
            <th style={s.th}>IP地址</th>
          </tr>
        </thead>
        <tbody>
          {paged.length === 0 ? (
            <tr>
              <td colSpan={8} style={{ ...s.td, textAlign: 'center', color: '#94a3b8', padding: '32px 0' }}>
                暂无日志记录
              </td>
            </tr>
          ) : paged.map(log => (
            <tr
              key={log.id}
              style={{ cursor: 'pointer' }}
              onClick={() => setSelectedLog(log)}
            >
              <td style={s.tdMono}>{log.actionTime}</td>
              <td style={s.td}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <User size={12} color="#94a3b8" />
                  {log.userName}
                </div>
              </td>
              <td style={s.td}>
                <span style={{
                  ...s.badge,
                  background: log.userRole === '医生' ? '#dbeafe' : log.userRole === '护士' ? '#fce7f3' : '#f1f5f9',
                  color: log.userRole === '医生' ? '#1d4ed8' : log.userRole === '护士' ? '#be185d' : '#475569',
                }}>
                  {log.userRole}
                </span>
              </td>
              <td style={s.td}>
                <span style={{ ...s.badge, ...getActionBadgeStyle(log.actionType) }}>
                  {log.actionType}
                </span>
              </td>
              <td style={s.td}>{log.module}</td>
              <td style={s.td}>
                <div style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.targetName}>
                  {log.targetName}
                </div>
              </td>
              <td style={s.td}>
                <span style={{ ...s.badge, ...getResultBadgeStyle(log.result) }}>
                  {log.result === '成功' ? <CheckCircle size={10} style={{ marginRight: 3 }} /> : <AlertCircle size={10} style={{ marginRight: 3 }} />}
                  {log.result}
                </span>
              </td>
              <td style={s.tdMono}>{log.ipAddress}</td>
            </tr>
          ))}
        </tbody>
      </table>
      )}

      {/* 分页 */}
      <div style={s.pagination}>
        <div style={s.pageInfo}>
          共 {filtered.length} 条记录，第 {page}/{totalPages} 页
        </div>
        <div style={s.pageBtns}>
          <button
            style={s.pageBtn}
            disabled={page <= 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            <ChevronLeft size={14} />
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let num: number
            if (totalPages <= 5) {
              num = i + 1
            } else if (page <= 3) {
              num = i + 1
            } else if (page >= totalPages - 2) {
              num = totalPages - 4 + i
            } else {
              num = page - 2 + i
            }
            return (
              <button
                key={num}
                style={page === num ? s.pageBtnActive : s.pageBtn}
                onClick={() => setPage(num)}
              >
                {num}
              </button>
            )
          })}
          <button
            style={s.pageBtn}
            disabled={page >= totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* 详情弹窗 */}
      {selectedLog && (
        <>
          <div style={s.overlay} onClick={() => setSelectedLog(null)} />
          <div style={s.detailPanel}>
            <button style={s.closeBtn} onClick={() => setSelectedLog(null)}>
              <AlertCircle size={20} />
            </button>
            <h2 style={s.detailTitle}>日志详情</h2>

            <div style={s.detailRow}>
              <span style={s.detailLabel}>日志ID</span>
              <span style={{ ...s.detailValue, fontFamily: 'monospace', fontSize: 12 }}>{selectedLog.id}</span>
            </div>
            <div style={s.detailRow}>
              <span style={s.detailLabel}>操作时间</span>
              <span style={s.detailValue}>{selectedLog.actionTime}</span>
            </div>
            <div style={s.detailRow}>
              <span style={s.detailLabel}>用户</span>
              <span style={s.detailValue}>{selectedLog.userName}（{selectedLog.userRole}）</span>
            </div>
            <div style={s.detailRow}>
              <span style={s.detailLabel}>用户ID</span>
              <span style={s.detailValue}>{selectedLog.userId}</span>
            </div>
            <div style={s.detailRow}>
              <span style={s.detailLabel}>操作类型</span>
              <span style={s.detailValue}>
                <span style={{ ...s.badge, ...getActionBadgeStyle(selectedLog.actionType) }}>{selectedLog.actionType}</span>
              </span>
            </div>
            <div style={s.detailRow}>
              <span style={s.detailLabel}>模块</span>
              <span style={s.detailValue}>{selectedLog.module}</span>
            </div>
            <div style={s.detailRow}>
              <span style={s.detailLabel}>目标名称</span>
              <span style={s.detailValue}>{selectedLog.targetName}</span>
            </div>
            <div style={s.detailRow}>
              <span style={s.detailLabel}>目标ID</span>
              <span style={s.detailValue}>{selectedLog.targetId}</span>
            </div>
            <div style={s.detailRow}>
              <span style={s.detailLabel}>IP地址</span>
              <span style={s.detailValue}>{selectedLog.ipAddress}</span>
            </div>
            <div style={s.detailRow}>
              <span style={s.detailLabel}>操作结果</span>
              <span style={s.detailValue}>
                <span style={{ ...s.badge, ...getResultBadgeStyle(selectedLog.result) }}>{selectedLog.result}</span>
              </span>
            </div>

            {(selectedLog.beforeValue || selectedLog.afterValue) && (
              <div style={s.detailSection}>
                <div style={s.detailSectionTitle}>变更记录</div>
                {selectedLog.beforeValue && (
                  <div style={s.detailRow}>
                    <span style={s.detailLabel}>变更前</span>
                    <span style={{ ...s.detailValue, color: '#dc2626' }}>{selectedLog.beforeValue}</span>
                  </div>
                )}
                {selectedLog.afterValue && (
                  <div style={s.detailRow}>
                    <span style={s.detailLabel}>变更后</span>
                    <span style={{ ...s.detailValue, color: '#16a34a' }}>{selectedLog.afterValue}</span>
                  </div>
                )}
              </div>
            )}

            {selectedLog.notes && (
              <div style={s.detailSection}>
                <div style={s.detailSectionTitle}>备注</div>
                <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.6 }}>{selectedLog.notes}</div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
