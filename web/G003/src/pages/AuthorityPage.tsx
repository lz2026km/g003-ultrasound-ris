import React, { useState } from 'react'
import {
  Shield, Users, UserCog, Key, Eye, EyeOff, Plus, Trash2,
  Edit3, Save, X, Search, Filter, CheckCircle, XCircle,
  ChevronRight, ChevronDown, Lock, Unlock, AlertTriangle
} from 'lucide-react'

interface Role { id: string; name: string; desc: string; userCount: number; color: string }
interface Permission { id: string; name: string; module: string; description: string }
interface User { id: string; name: string; dept: string; role: string; status: 'active' | 'inactive'; lastLogin: string }

const roles: Role[] = [
  { id: 'R001', name: '系统管理员', desc: '拥有系统所有权限，可管理所有模块', userCount: 2, color: '#f85149' },
  { id: 'R002', name: '科室主任', desc: '管理科室运营、查看全部数据、审批报告', userCount: 3, color: '#a371f7' },
  { id: 'R003', name: '主治医师', desc: '书写报告、查看患者、检查执行', userCount: 12, color: '#58a6ff' },
  { id: 'R004', name: '住院医师', desc: '协助检查、记录、随访患者', userCount: 18, color: '#3fb950' },
  { id: 'R005', name: '护士长', desc: '管理护理排班、洗消监督、物资管理', userCount: 5, color: '#f0b429' },
  { id: 'R006', name: '护士', desc: '执行护理操作、协助检查、患者管理', userCount: 24, color: '#3fb950' },
  { id: 'R007', name: '技师', desc: '设备操作、影像采集、洗消执行', userCount: 8, color: '#8b949e' },
  { id: 'R008', name: '数据上报员', desc: '仅可操作国家平台数据上报模块', userCount: 2, color: '#f0b429' },
]

const modules = ['患者管理', '检查执行', '报告管理', '影像管理', '超声设备', '洗消追溯', '手术管理', '质控管理', '统计报表', '系统设置']
const allPermissions: Permission[] = modules.flatMap(mod =>
  ['查看', '新增', '编辑', '删除', '导出'].map(act => ({
    id: `${mod}-${act}`, name: `${act}`, module: mod,
    description: `${mod}的${act}权限`
  }))
)

const users: User[] = [
  { id: 'U001', name: '张明华', dept: '消化内科', role: '主治医师', status: 'active', lastLogin: '2026-04-30 09:12' },
  { id: 'U002', name: '李秀英', dept: '消化内科', role: '护士长', status: 'active', lastLogin: '2026-04-30 08:45' },
  { id: 'U003', name: '王建国', dept: '超声中心', role: '技师', status: 'active', lastLogin: '2026-04-29 17:30' },
  { id: 'U004', name: '陈晓梅', dept: '消化内科', role: '住院医师', status: 'inactive', lastLogin: '2026-04-20 10:00' },
  { id: 'U005', name: '刘大力', dept: '超声中心', role: '主治医师', status: 'active', lastLogin: '2026-04-30 10:30' },
  { id: 'U006', name: '赵丽', dept: '医务科', role: '数据上报员', status: 'active', lastLogin: '2026-04-30 09:00' },
]

const s: Record<string, React.CSSProperties> = {
  root: { padding: 32, minHeight: '100vh', background: '#0d1117', color: '#e6edf3', fontFamily: 'system-ui, sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  title: { fontSize: 22, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 },
  card: { background: '#161b22', border: '1px solid #30363d', borderRadius: 10, overflow: 'hidden' },
  cardHeader: { padding: '14px 20px', borderBottom: '1px solid #30363d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 },
  cardBody: { padding: 16 },
  roleItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderBottom: '1px solid #21262d', cursor: 'pointer', transition: 'background 0.15s' },
  roleInfo: { display: 'flex', alignItems: 'center', gap: 10 },
  roleDot: { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
  userRow: { display: 'flex', alignItems: 'center', padding: '10px 14px', borderBottom: '1px solid #21262d', gap: 12 },
  avatar: { width: 36, height: 36, borderRadius: '50%', background: '#21262d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: '#8b949e', flexShrink: 0 },
  searchInput: { padding: '8px 12px', background: '#0d1117', border: '1px solid #30363d', borderRadius: 6, color: '#e6edf3', fontSize: 13, outline: 'none', width: 200 },
  btn: { padding: '8px 16px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, minHeight: 40, transition: 'all 0.15s' },
  btnPrimary: { background: '#1f6feb', color: '#fff' },
  btnOutline: { background: 'transparent', border: '1px solid #30363d', color: '#8b949e' },
  btnDanger: { background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.3)', color: '#f85149' },
  badge: { padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600 },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '10px 12px', fontSize: 12, color: '#8b949e', fontWeight: 500, borderBottom: '1px solid #30363d' },
  td: { padding: '10px 12px', fontSize: 13, borderBottom: '1px solid #21262d' },
  divider: { height: 1, background: '#30363d', margin: '20px 0' },
  permGrid: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 },
  permItem: { padding: '8px 10px', borderRadius: 6, border: '1px solid #30363d', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', transition: 'all 0.15s' },
  permItemActive: { background: 'rgba(88,166,255,0.1)', border: '1px solid rgba(88,166,255,0.4)', color: '#58a6ff' },
  empty: { textAlign: 'center', padding: '60px 20px', color: '#8b949e', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 },
}

export default function AuthorityPage() {
  const [activeTab, setActiveTab] = useState<'roles' | 'users' | 'permissions'>('roles')
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPerms, setSelectedPerms] = useState<Set<string>>(new Set())
  const [showAddUser, setShowAddUser] = useState(false)

  const filteredUsers = users.filter(u =>
    u.name.includes(searchTerm) || u.dept.includes(searchTerm) || u.role.includes(searchTerm)
  )

  const handleTogglePerm = (permId: string) => {
    setSelectedPerms(prev => {
      const next = new Set(prev)
      next.has(permId) ? next.delete(permId) : next.add(permId)
      return next
    })
  }

  const handleSelectRole = (role: Role) => {
    setSelectedRole(role)
    // 模拟：根据角色预设权限
    const presetPerms = new Set<string>()
    if (role.id === 'R001') {
      allPermissions.forEach(p => presetPerms.add(p.id))
    } else if (role.id === 'R002') {
      modules.filter(m => !['系统设置'].includes(m)).forEach(m =>
        ['查看', '新增', '编辑', '删除', '导出'].forEach(a => presetPerms.add(`${m}-${a}`))
      )
    } else if (role.id === 'R003') {
      ;['患者管理', '检查执行', '报告管理', '影像管理', '统计报表'].forEach(m =>
        ['查看', '新增', '编辑'].forEach(a => presetPerms.add(`${m}-${a}`))
      )
    }
    setSelectedPerms(presetPerms)
  }

  return (
    <div style={s.root}>
      <div style={s.header}>
        <div style={s.title}><Shield size={22} color="#58a6ff" /> 权限管理中心</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            style={s.searchInput}
            placeholder="搜索用户/部门/角色..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <button style={{ ...s.btn, ...s.btnPrimary }} onClick={() => setShowAddUser(true)}><Plus size={14} />新增用户</button>
        </div>
      </div>

      {/* 标签 */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24, borderBottom: '1px solid #30363d', paddingBottom: 0 }}>
        {([
          ['roles', '角色管理', Users],
          ['users', '用户管理', UserCog],
          ['permissions', '权限配置', Key],
        ] as [string, string, React.ElementType][]).map(([k, label, Icon]) => (
          <div
            key={k}
            onClick={() => setActiveTab(k as typeof activeTab)}
            style={{
              padding: '10px 18px', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6,
              borderBottom: activeTab === k ? '2px solid #58a6ff' : '2px solid transparent',
              color: activeTab === k ? '#58a6ff' : '#8b949e', minHeight: 44, transition: 'all 0.15s'
            }}
          >
            <Icon size={15} />{label}
          </div>
        ))}
      </div>

      {/* 角色管理 */}
      {activeTab === 'roles' && (
        <div style={s.grid}>
          <div style={s.card}>
            <div style={s.cardHeader}>
              <div style={s.cardTitle}><Users size={15} color="#58a6ff" /> 角色列表</div>
              <button style={{ ...s.btn, ...s.btnOutline, minHeight: 36, padding: '6px 12px', fontSize: 12 }}><Plus size={13} />新建角色</button>
            </div>
            <div style={{ overflowY: 'auto', maxHeight: 500 }}>
              {roles.map(role => (
                <div
                  key={role.id}
                  onClick={() => handleSelectRole(role)}
                  style={{
                    ...s.roleItem,
                    background: selectedRole?.id === role.id ? '#1f3a5f' : 'transparent',
                  }}
                >
                  <div style={s.roleInfo}>
                    <div style={{ ...s.roleDot, background: role.color }} />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#e6edf3' }}>{role.name}</div>
                      <div style={{ fontSize: 11, color: '#8b949e', marginTop: 2 }}>{role.desc}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ ...s.badge, background: `${role.color}18`, color: role.color }}>{role.userCount}人</span>
                    <ChevronRight size={14} color="#8b949e" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={s.card}>
            <div style={s.cardHeader}>
              <div style={s.cardTitle}><Key size={15} color="#f0b429" />{selectedRole ? `权限配置 — ${selectedRole.name}` : '选择角色查看权限'}</div>
              {selectedRole && <button style={{ ...s.btn, ...s.btnPrimary, minHeight: 36, padding: '6px 12px', fontSize: 12 }}><Save size={13} />保存</button>}
            </div>
            <div style={s.cardBody}>
              {!selectedRole ? (
                <div style={s.empty}>
                  <Shield size={40} color="#30363d" />
                  <div style={{ fontSize: 14, color: '#8b949e' }}>请从左侧选择一个角色</div>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: 16, padding: '10px 12px', background: '#21262d', borderRadius: 8 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{selectedRole.name}</div>
                    <div style={{ fontSize: 12, color: '#8b949e' }}>{selectedRole.desc}</div>
                    <div style={{ fontSize: 12, color: '#6e7681', marginTop: 4 }}>共 {selectedPerms.size} 项权限</div>
                  </div>
                  {modules.map(mod => (
                    <div key={mod} style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: 12, color: '#8b949e', marginBottom: 6, fontWeight: 600 }}>{mod}</div>
                      <div style={s.permGrid}>
                        {['查看', '新增', '编辑', '删除', '导出'].map(act => {
                          const permId = `${mod}-${act}`
                          const active = selectedPerms.has(permId)
                          return (
                            <div
                              key={permId}
                              onClick={() => handleTogglePerm(permId)}
                              style={{
                                ...s.permItem,
                                ...(active ? s.permItemActive : {}),
                              }}
                            >
                              {active ? <CheckCircle size={12} /> : <XCircle size={12} style={{ opacity: 0.4 }} />}
                              <span style={{ fontSize: 12 }}>{act}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 用户管理 */}
      {activeTab === 'users' && (
        <div style={s.card}>
          <div style={s.cardHeader}>
            <div style={s.cardTitle}><UserCog size={15} color="#a371f7" /> 用户列表（共{filteredUsers.length}人）</div>
            <button style={{ ...s.btn, ...s.btnPrimary, minHeight: 36, padding: '6px 12px', fontSize: 12 }}><Plus size={13} />新增用户</button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={s.table}>
              <thead>
                <tr>{['用户', '部门', '角色', '状态', '最后登录', '操作'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u.id}>
                    <td style={s.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={s.avatar}>{u.name.slice(0, 1)}</div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{u.name}</div>
                          <div style={{ fontSize: 11, color: '#8b949e' }}>{u.id}</div>
                        </div>
                      </div>
                    </td>
                    <td style={s.td}>{u.dept}</td>
                    <td style={s.td}>{u.role}</td>
                    <td style={s.td}>
                      <span style={{ ...s.badge, background: u.status === 'active' ? 'rgba(63,185,80,0.15)' : 'rgba(248,81,73,0.15)', color: u.status === 'active' ? '#3fb950' : '#f85149' }}>
                        {u.status === 'active' ? '在职' : '停用'}
                      </span>
                    </td>
                    <td style={{ ...s.td, color: '#8b949e' }}>{u.lastLogin}</td>
                    <td style={s.td}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button style={{ ...s.btn, ...s.btnOutline, minHeight: 32, padding: '4px 10px', fontSize: 11 }}><Edit3 size={12} />编辑</button>
                        <button style={{ ...s.btn, ...s.btnDanger, minHeight: 32, padding: '4px 10px', fontSize: 11 }}><Trash2 size={12} />删除</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 权限配置 */}
      {activeTab === 'permissions' && (
        <div style={s.card}>
          <div style={s.cardHeader}>
            <div style={s.cardTitle}><Lock size={15} color="#f85149" /> 系统权限总览</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ fontSize: 12, color: '#8b949e', display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle size={12} color="#3fb950" />已授权
              </span>
              <span style={{ fontSize: 12, color: '#8b949e', display: 'flex', alignItems: 'center', gap: 6 }}>
                <XCircle size={12} color="#8b949e" />未授权
              </span>
            </div>
          </div>
          <div style={{ padding: 20 }}>
            {modules.map(mod => (
              <div key={mod} style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AlertTriangle size={13} color="#f0b429" />{mod}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {allPermissions.filter(p => p.module === mod).map(p => {
                    const has = selectedPerms.has(p.id)
                    return (
                      <div key={p.id} style={{ ...s.permItem, minWidth: 100, justifyContent: 'center' }}>
                        {has ? <CheckCircle size={12} color="#3fb950" /> : <XCircle size={12} color="#8b949e" />}
                        <span style={{ fontSize: 12, color: has ? '#3fb950' : '#8b949e' }}>{p.name}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
