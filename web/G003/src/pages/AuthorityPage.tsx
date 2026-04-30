// @ts-nocheck
// ============================================================
// G003 超声RIS系统 - 权限管理页面
// 用户权限 / 角色配置 / 访问控制 / 审计日志
// ============================================================
import { useState } from 'react'
import {
  Shield, Users, UserCog, Key, Lock, Unlock, CheckCircle,
  XCircle, AlertTriangle, Search, Filter, Plus, ChevronRight,
  Edit, Trash2, Eye, MoreHorizontal, Download, RefreshCw,
  Settings, Activity, Clock, Server, Database, Monitor
} from 'lucide-react'
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from 'recharts'

// ---------- 样式 ----------
const s: Record<string, React.CSSProperties> = {
  root: { padding: 0 },
  header: { marginBottom: 24 },
  title: { fontSize: 20, fontWeight: 700, color: '#1a3a5c', margin: 0 },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 4 },
  headerRight: { display: 'flex', gap: 8, marginTop: 8 },
  // 操作按钮
  btnPrimary: {
    padding: '8px 16px', borderRadius: 8, border: 'none',
    background: '#3b82f6', color: '#fff', cursor: 'pointer',
    fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
  },
  btnSecondary: {
    padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0',
    background: '#fff', cursor: 'pointer', fontSize: 13, display: 'flex',
    alignItems: 'center', gap: 6,
  },
  // 统计卡片
  statRow: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24,
  },
  statCard: {
    background: '#fff', borderRadius: 12, padding: '20px 24px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex',
    alignItems: 'center', gap: 16,
  },
  statIconWrap: {
    width: 52, height: 52, borderRadius: 12, display: 'flex',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  statInfo: { flex: 1, minWidth: 0 },
  statValue: { fontSize: 28, fontWeight: 700, color: '#1a3a5c', lineHeight: 1.2 },
  statLabel: { fontSize: 12, color: '#64748b', marginTop: 4 },
  // 标签页
  tabs: {
    display: 'flex', gap: 4, background: '#f8fafc', padding: 4, borderRadius: 10,
    marginBottom: 24,
  },
  tab: {
    padding: '8px 20px', borderRadius: 8, border: 'none', background: 'transparent',
    cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#64748b',
  },
  tabActive: {
    padding: '8px 20px', borderRadius: 8, border: 'none',
    background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600,
    color: '#1a3a5c', boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  // 卡片
  card: {
    background: '#fff', borderRadius: 12, padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 16,
  },
  cardTitle: {
    fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 16,
    display: 'flex', alignItems: 'center', gap: 8,
  },
  // 用户列表
  userItem: {
    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0',
    borderBottom: '1px solid #f1f5f9',
  },
  userAvatar: {
    width: 40, height: 40, borderRadius: 10, background: '#eff6ff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#3b82f6', fontWeight: 600, fontSize: 14,
  },
  userInfo: { flex: 1 },
  userName: { fontSize: 13, fontWeight: 600, color: '#1a3a5c' },
  userRole: { fontSize: 12, color: '#64748b', marginTop: 2 },
  // 角色标签
  roleBadge: {
    fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 10,
    display: 'inline-block',
  },
  // 权限列表
  permissionItem: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 0', borderBottom: '1px solid #f1f5f9',
  },
  permissionLabel: { fontSize: 13, color: '#1a3a5c', display: 'flex', alignItems: 'center', gap: 8 },
  // 开关
  toggle: {
    width: 44, height: 24, borderRadius: 12, position: 'relative', cursor: 'pointer',
    transition: 'background 0.2s',
  },
  toggleOn: { background: '#22c55e' },
  toggleOff: { background: '#e2e8f0' },
  toggleKnob: {
    width: 20, height: 20, borderRadius: '50%', background: '#fff',
    position: 'absolute', top: 2, transition: 'left 0.2s',
    boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
  },
  // 日志列表
  logItem: {
    display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid #f1f5f9',
  },
  logIcon: {
    width: 36, height: 36, borderRadius: 8, display: 'flex',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  logContent: { flex: 1 },
  logTitle: { fontSize: 13, color: '#1a3a5c', marginBottom: 4 },
  logTime: { fontSize: 11, color: '#94a3b8' },
  // 颜色
  blue: { backgroundColor: '#eff6ff', color: '#3b82f6' },
  green: { backgroundColor: '#f0fdf4', color: '#22c55e' },
  orange: { backgroundColor: '#fff7ed', color: '#f97316' },
  red: { backgroundColor: '#fef2f2', color: '#ef4444' },
  purple: { backgroundColor: '#f5f3ff', color: '#8b5cf6' },
}

const PIE_COLORS = ['#3b82f6', '#22c55e', '#f97316', '#8b5cf6', '#14b8a6']

const tooltipStyle = {
  contentStyle: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 },
  labelStyle: { color: '#1a3a5c', fontWeight: 600 },
}

// ---------- 常量数据 ----------
const STATS = [
  { label: '总用户数', value: 128, icon: Users, color: '#3b82f6', bg: '#eff6ff' },
  { label: '活跃会话', value: 45, icon: Activity, color: '#22c55e', bg: '#f0fdf4' },
  { label: '角色数量', value: 8, icon: Shield, color: '#8b5cf6', bg: '#f5f3ff' },
  { label: '权限项', value: 156, icon: Key, color: '#f97316', bg: '#fff7ed' },
]

const ROLES = [
  { id: 'admin', name: '系统管理员', count: 3, color: '#ef4444', bg: '#fef2f2', desc: '完全系统控制权' },
  { id: 'doctor', name: '主治医生', count: 28, color: '#3b82f6', bg: '#eff6ff', desc: '检查与报告管理' },
  { id: 'technician', name: '技师', count: 35, color: '#22c55e', bg: '#f0fdf4', desc: '设备操作与图像' },
  { id: 'nurse', name: '护士', count: 42, color: '#f97316', bg: '#fff7ed', desc: '患者管理与预约' },
  { id: 'viewer', name: '查阅者', count: 20, color: '#64748b', bg: '#f1f5f9', desc: '只读数据访问' },
]

const USERS = [
  { id: 1, name: '李建国', username: 'liguojian', role: 'admin', roleName: '系统管理员', dept: '信息中心', status: 'active', lastLogin: '2026-04-30 09:23' },
  { id: 2, name: '王晓明', username: 'wangxiaoming', role: 'doctor', roleName: '主治医生', dept: '超声科', status: 'active', lastLogin: '2026-04-30 08:15' },
  { id: 3, name: '张伟', username: 'zhangwei', role: 'technician', roleName: '技师', dept: '超声科', status: 'active', lastLogin: '2026-04-29 17:42' },
  { id: 4, name: '刘芳', username: 'liufang', role: 'nurse', roleName: '护士', dept: '门诊部', status: 'inactive', lastLogin: '2026-04-28 16:30' },
  { id: 5, name: '陈刚', username: 'chengang', role: 'doctor', roleName: '主治医生', dept: '超声科', status: 'active', lastLogin: '2026-04-30 10:05' },
]

const PERMISSIONS = [
  { id: 'p1', label: '患者管理', icon: Users, enabled: true },
  { id: 'p2', label: '预约管理', icon: Clock, enabled: true },
  { id: 'p3', label: '检查执行', icon: Monitor, enabled: true },
  { id: 'p4', label: '报告书写', icon: Edit, enabled: true },
  { id: 'p5', label: '图像管理', icon: Database, enabled: true },
  { id: 'p6', label: '统计报表', icon: Activity, enabled: true },
  { id: 'p7', label: '系统设置', icon: Settings, enabled: false },
  { id: 'p8', label: '用户管理', icon: UserCog, enabled: false },
]

const LOGS = [
  { id: 1, type: 'login', icon: Unlock, iconBg: '#f0fdf4', iconColor: '#22c55e', title: '用户李建国登录系统', time: '2026-04-30 09:23:15' },
  { id: 2, type: 'permission', icon: Key, iconBg: '#eff6ff', iconColor: '#3b82f6', title: '角色权限变更：主治医生', time: '2026-04-30 09:45:32' },
  { id: 3, type: 'config', icon: Settings, iconBg: '#fff7ed', iconColor: '#f97316', title: '系统配置更新', time: '2026-04-30 10:12:08' },
  { id: 4, type: 'login', icon: Lock, iconBg: '#fef2f2', iconColor: '#ef4444', title: '用户刘芳登录失败（密码错误）', time: '2026-04-30 11:05:43' },
  { id: 5, type: 'user', icon: UserCog, iconBg: '#f5f3ff', iconColor: '#8b5cf6', title: '新增用户：陈刚', time: '2026-04-30 14:22:19' },
]

const ROLE_DISTRIBUTION = [
  { name: '系统管理员', value: 3 },
  { name: '主治医生', value: 28 },
  { name: '技师', value: 35 },
  { name: '护士', value: 42 },
  { name: '查阅者', value: 20 },
]

// ---------- 组件 ----------
export default function AuthorityPage() {
  const [activeTab, setActiveTab] = useState('users')

  const getRoleStyle = (role: string) => {
    const r = ROLES.find(item => item.id === role)
    return r ? { background: r.bg, color: r.color } : {}
  }

  return (
    <div style={s.root}>
      {/* 标题 */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>权限管理</h1>
          <p style={s.subtitle}>
            用户账户 · 角色配置 · 权限分配 · 安全审计
          </p>
        </div>
        <div style={s.headerRight}>
          <button style={s.btnSecondary}>
            <RefreshCw size={14} color="#64748b" /> 刷新
          </button>
          <button style={s.btnSecondary}>
            <Download size={14} color="#64748b" /> 导出日志
          </button>
          <button style={s.btnPrimary}>
            <Plus size={14} /> 添加用户
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div style={s.statRow}>
        {STATS.map((item) => (
          <div key={item.label} style={s.statCard}>
            <div style={{ ...s.statIconWrap, background: item.bg }}>
              <item.icon size={24} color={item.color} />
            </div>
            <div style={s.statInfo}>
              <div style={s.statValue}>{item.value}</div>
              <div style={s.statLabel}>{item.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 标签页 */}
      <div style={s.tabs}>
        <button style={activeTab === 'users' ? s.tabActive : s.tab} onClick={() => setActiveTab('users')}>
          <Users size={14} style={{ marginRight: 6 }} /> 用户管理
        </button>
        <button style={activeTab === 'roles' ? s.tabActive : s.tab} onClick={() => setActiveTab('roles')}>
          <Shield size={14} style={{ marginRight: 6 }} /> 角色配置
        </button>
        <button style={activeTab === 'permissions' ? s.tabActive : s.tab} onClick={() => setActiveTab('permissions')}>
          <Key size={14} style={{ marginRight: 6 }} /> 权限分配
        </button>
        <button style={activeTab === 'logs' ? s.tabActive : s.tab} onClick={() => setActiveTab('logs')}>
          <Activity size={14} style={{ marginRight: 6 }} /> 审计日志
        </button>
      </div>

      {/* 用户管理 */}
      {activeTab === 'users' && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
          <div style={s.card}>
            <div style={{ ...s.cardTitle, marginBottom: 0, paddingBottom: 12, borderBottom: '1px solid #f1f5f9' }}>
              <Users size={16} style={{ color: '#64748b' }} /> 用户列表
              <span style={{ marginLeft: 'auto', fontSize: 12, color: '#94a3b8', fontWeight: 400 }}>共 {USERS.length} 人</span>
            </div>
            <div style={{ padding: '8px 0' }}>
              {USERS.map((user) => (
                <div key={user.id} style={s.userItem}>
                  <div style={s.userAvatar}>{user.name.slice(0, 1)}</div>
                  <div style={s.userInfo}>
                    <div style={s.userName}>{user.name}</div>
                    <div style={s.userRole}>@{user.username} · {user.dept}</div>
                  </div>
                  <span style={{ ...s.roleBadge, ...getRoleStyle(user.role) }}>{user.roleName}</span>
                  <span style={{
                    fontSize: 11, padding: '3px 8px', borderRadius: 8,
                    background: user.status === 'active' ? '#f0fdf4' : '#fef2f2',
                    color: user.status === 'active' ? '#22c55e' : '#ef4444',
                  }}>
                    {user.status === 'active' ? '活跃' : '停用'}
                  </span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button style={{ padding: 4, border: 'none', background: 'none', cursor: 'pointer' }}>
                      <Eye size={14} color="#64748b" />
                    </button>
                    <button style={{ padding: 4, border: 'none', background: 'none', cursor: 'pointer' }}>
                      <Edit size={14} color="#3b82f6" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}>
              <Shield size={16} style={{ color: '#64748b' }} /> 角色分布
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={ROLE_DISTRIBUTION}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name.substring(0, 4)} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {ROLE_DISTRIBUTION.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 角色配置 */}
      {activeTab === 'roles' && (
        <div style={s.card}>
          <div style={{ ...s.cardTitle, marginBottom: 0, paddingBottom: 12, borderBottom: '1px solid #f1f5f9' }}>
            <Shield size={16} style={{ color: '#64748b' }} /> 角色列表
            <span style={{ marginLeft: 'auto', fontSize: 12, color: '#94a3b8', fontWeight: 400 }}>共 {ROLES.length} 个角色</span>
          </div>
          <div style={{ padding: '8px 0' }}>
            {ROLES.map((role) => (
              <div key={role.id} style={{ ...s.userItem, padding: '16px 0' }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: role.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Shield size={20} color={role.color} />
                </div>
                <div style={s.userInfo}>
                  <div style={s.userName}>{role.name}</div>
                  <div style={s.userRole}>{role.desc}</div>
                </div>
                <span style={{ fontSize: 13, color: '#64748b' }}>{role.count} 人</span>
                <button style={{ ...s.btnSecondary, padding: '6px 12px' }}>
                  <Edit size={12} color="#64748b" /> 配置
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 权限分配 */}
      {activeTab === 'permissions' && (
        <div style={s.card}>
          <div style={s.cardTitle}>
            <Key size={16} style={{ color: '#64748b' }} /> 权限配置
            <span style={{ marginLeft: 8, fontSize: 12, color: '#94a3b8', fontWeight: 400 }}>当前角色：主治医生</span>
          </div>
          <div>
            {PERMISSIONS.map((perm) => (
              <div key={perm.id} style={s.permissionItem}>
                <div style={s.permissionLabel}>
                  <perm.icon size={14} color="#64748b" />
                  {perm.label}
                </div>
                <div style={{
                  ...s.toggle,
                  ...(perm.enabled ? s.toggleOn : s.toggleOff),
                }}>
                  <div style={{
                    ...s.toggleKnob,
                    left: perm.enabled ? 22 : 2,
                  }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button style={s.btnSecondary}>取消</button>
            <button style={s.btnPrimary}>保存配置</button>
          </div>
        </div>
      )}

      {/* 审计日志 */}
      {activeTab === 'logs' && (
        <div style={s.card}>
          <div style={s.cardTitle}>
            <Activity size={16} style={{ color: '#64748b' }} /> 审计日志
          </div>
          <div>
            {LOGS.map((log) => (
              <div key={log.id} style={s.logItem}>
                <div style={{ ...s.logIcon, background: log.iconBg, color: log.iconColor }}>
                  <log.icon size={16} />
                </div>
                <div style={s.logContent}>
                  <div style={s.logTitle}>{log.title}</div>
                  <div style={s.logTime}>{log.time}</div>
                </div>
                <button style={{ padding: 4, border: 'none', background: 'none', cursor: 'pointer' }}>
                  <ChevronRight size={14} color="#94a3b8" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
