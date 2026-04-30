import React from 'react'
import { ShieldAlert } from 'lucide-react'

const s: Record<string, React.CSSProperties> = {
  root: { padding: 32 },
  title: { fontSize: 22, fontWeight: 700, color: '#1a3a5c', marginBottom: 24 },
  empty: {
    textAlign: 'center', padding: '80px 20px', color: '#94a3b8',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
  },
  emptyIcon: { background: '#f1f5f9', borderRadius: '50%', padding: 24 },
  emptyTitle: { fontSize: 18, fontWeight: 600, color: '#475569' },
  emptyDesc: { fontSize: 14, color: '#94a3b8', marginTop: 8 },
}

export default function AuthorityPage() {
  return (
    <div style={s.root}>
      <div style={s.title}>权限管理中心</div>
      <div style={s.empty}>
        <div style={s.emptyIcon}>
          <ShieldAlert size={48} color="#94a3b8" />
        </div>
        <div style={s.emptyTitle}>暂无权限数据</div>
        <div style={s.emptyDesc}>权限管理数据正在加载中，请稍后刷新页面</div>
      </div>
    </div>
  )
}
