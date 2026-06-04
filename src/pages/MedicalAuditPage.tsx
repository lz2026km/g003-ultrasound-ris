/**
 * 医保智能审核模块
 * @version v0.9.0
 * @description 对标东软医保审核、卫宁医保控费
 *
 * 核心能力：
 * - 医保目录库（药品/诊疗/材料）
 * - 规则引擎（项目匹配/限用频次/超量）
 * - 智能审核（事前/事中/事后）
 * - 申诉管理
 * - 违规分析
 * - 医保对账
 */

import React, { useState } from 'react'
import {
  ShieldCheck, FileText, AlertCircle, Check, X, Search, Plus,
  Download, Activity, TrendingUp, Clock, DollarSign, Calendar,
  Filter, ChevronRight, BookOpen, Gavel, AlertTriangle, BarChart3
} from 'lucide-react'

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
  alert: { padding: 14, borderRadius: 8, marginBottom: 12 },
  timeline: { padding: '12px 0', borderLeft: `2px solid ${C.border}`, paddingLeft: 16, marginLeft: 8 },
  timelineItem: { marginBottom: 16, position: 'relative' },
  timelineDot: { width: 10, height: 10, borderRadius: '50%', position: 'absolute', left: -23, top: 6 },
}

const PREAUDIT = [
  { id: 'PA001', patient: '王建国', dept: '心血管内科', type: '检查', item: '冠脉CTA', cost: 1850, rule: '限用适应症', risk: 'low', status: 'pass', reason: '符合冠心病诊断适应症' },
  { id: 'PA002', patient: '李秀英', dept: '肝胆外科', type: '药品', item: '进口阿莫西林克拉维酸', cost: 285, rule: '限用级别', risk: 'medium', status: 'warn', reason: '建议优先使用国产仿制药' },
  { id: 'PA003', patient: '张明远', dept: '呼吸内科', type: '材料', item: '一次性呼吸机管路', cost: 120, rule: '频次限制', risk: 'low', status: 'pass', reason: '符合3日使用频次' },
  { id: 'PA004', patient: '刘晓燕', dept: '神经内科', type: '检查', item: '头颅MRI增强', cost: 850, rule: '适应症', risk: 'low', status: 'pass', reason: '符合脑梗死诊断' },
  { id: 'PA005', patient: '陈志强', dept: '消化内科', type: '药品', item: 'PPI抑制剂(注射)', cost: 165, rule: '超量使用', risk: 'high', status: 'fail', reason: '超医保规定用药天数' },
  { id: 'PA006', patient: '赵丽华', dept: '肾脏内科', type: '诊疗', item: '血液透析', cost: 480, rule: '频次', risk: 'low', status: 'pass', reason: '符合每周3次规定' },
]

const INPROGRESS = [
  { id: 'IP001', patient: '周思远', dept: '骨科', startTime: '2026-06-05 09:30', currentCost: 8500, budget: 15000, items: 12, alerts: 0, status: 'normal' },
  { id: 'IP002', patient: '林晓曼', dept: '心内科', startTime: '2026-06-05 08:00', currentCost: 18800, budget: 20000, items: 18, alerts: 2, status: 'warning' },
  { id: 'IP003', patient: '黄志远', dept: '普外科', startTime: '2026-06-05 07:30', currentCost: 22500, budget: 25000, items: 22, alerts: 1, status: 'warning' },
  { id: 'IP004', patient: '孙明华', dept: '消化内科', startTime: '2026-06-05 06:45', currentCost: 6800, budget: 12000, items: 8, alerts: 0, status: 'normal' },
]

const POSTAUDIT = [
  { id: 'PS001', patient: '何秀珍', dept: '呼吸内科', date: '2026-06-03', cost: 8650, paid: 7800, deduct: 850, rules: '药品超量', status: 'deducted' },
  { id: 'PS002', patient: '马志强', dept: '心血管内科', date: '2026-06-03', cost: 22400, paid: 21800, deduct: 600, rules: '材料超限', status: 'deducted' },
  { id: 'PS003', patient: '罗建平', dept: '肝胆外科', date: '2026-06-02', cost: 18900, paid: 18900, deduct: 0, rules: '-', status: 'passed' },
  { id: 'PS004', patient: '徐丽君', dept: '神经内科', date: '2026-06-02', cost: 12300, paid: 11200, deduct: 1100, rules: '检查不规范', status: 'deducted' },
  { id: 'PS005', patient: '段国华', dept: '骨科', date: '2026-06-01', cost: 35600, paid: 35000, deduct: 600, rules: '材料限价', status: 'deducted' },
  { id: 'PS006', patient: '韩志明', dept: '消化内科', date: '2026-06-01', cost: 9800, paid: 9800, deduct: 0, rules: '-', status: 'passed' },
]

const APPEALS = [
  { id: 'AP001', patient: '马志强', dept: '心血管内科', deduct: 600, rule: '材料超限', submitTime: '2026-06-04 14:20', status: 'pending', reason: '进口支架为必要耗材，无国产替代' },
  { id: 'AP002', patient: '徐丽君', dept: '神经内科', deduct: 1100, rule: '检查不规范', submitTime: '2026-06-04 10:15', status: 'reviewing', reason: '患者病情需要，加做检查必要' },
  { id: 'AP003', patient: '何秀珍', dept: '呼吸内科', deduct: 850, rule: '药品超量', submitTime: '2026-06-03 16:30', status: 'approved', reason: '医院已审批通过' },
  { id: 'AP004', patient: '段国华', dept: '骨科', deduct: 600, rule: '材料限价', submitTime: '2026-06-03 09:45', status: 'rejected', reason: '证据不足，未通过' },
]

const RULE_STATS = [
  { name: '药品超量', count: 28, deduct: 18600, color: C.danger },
  { name: '材料超限', count: 15, deduct: 9800, color: C.warning },
  { name: '检查不规范', count: 12, deduct: 7200, color: C.purple },
  { name: '诊疗不符', count: 8, deduct: 4500, color: C.accent },
  { name: '其他', count: 5, deduct: 2100, color: C.textLight },
]

const getAuditStatus = (status: string) => {
  const map: Record<string, { bg: string; color: string; text: string }> = {
    pass: { bg: '#d1fae5', color: C.success, text: '通过' },
    warn: { bg: '#fef3c7', color: C.warning, text: '提醒' },
    fail: { bg: '#fee2e2', color: C.danger, text: '拦截' },
    pending: { bg: '#fef3c7', color: C.warning, text: '待审核' },
    reviewing: { bg: '#dbeafe', color: C.accent, text: '审核中' },
    approved: { bg: '#d1fae5', color: C.success, text: '已通过' },
    rejected: { bg: '#fee2e2', color: C.danger, text: '已驳回' },
    deducted: { bg: '#fee2e2', color: C.danger, text: '已扣款' },
    passed: { bg: '#d1fae5', color: C.success, text: '通过' },
  }
  return map[status] || map.pending
}

export default function MedicalAuditPage() {
  const [activeTab, setActiveTab] = useState('pre')
  const [searchText, setSearchText] = useState('')

  return (
    <div style={s.root}>
      <div style={s.header}>
        <h1 style={s.title}>医保智能审核中心</h1>
        <p style={s.subtitle}>对标东软医保审核、卫宁医保控费 · 规则引擎+智能审核+申诉管理</p>
      </div>

      <div style={s.kpiRow}>
        {[
          { value: '2,486', label: '本月审核单据', color: C.primary, hint: '↑ 8.5%' },
          { value: '94.5%', label: '事前通过率', color: C.success, hint: '↑ 2.1%' },
          { value: '¥68.5K', label: '本月拒付/扣款', color: C.danger, hint: '↓ 12%' },
          { value: '¥186K', label: '挽回医保损失', color: C.success, hint: '↑ 25%' },
          { value: '78%', label: '申诉成功率', color: C.accent, hint: '↑ 5%' },
        ].map((k, i) => (
          <div key={i} style={s.kpiCard}>
            <div style={{ ...s.kpiValue, color: k.color }}>{k.value}</div>
            <div style={s.kpiLabel}>{k.label}</div>
            <div style={{ ...s.kpiHint, color: k.hint.includes('↓') ? C.success : C.textLight }}>{k.hint}</div>
          </div>
        ))}
      </div>

      <div style={s.tabRow}>
        {[
          { key: 'pre', label: '事前审核', icon: <ShieldCheck size={14} /> },
          { key: 'in', label: '事中审核', icon: <Activity size={14} /> },
          { key: 'post', label: '事后审核', icon: <FileText size={14} /> },
          { key: 'appeal', label: '申诉管理', icon: <Gavel size={14} /> },
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

      {activeTab === 'pre' && (
        <div>
          <div style={{ ...s.alert, background: '#f0f9ff', border: '1px solid #bae6fd' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <BookOpen size={16} color={C.accent} />
              <strong style={{ color: C.accent, fontSize: 13 }}>规则引擎：已加载 248 条医保规则（药品156/诊疗58/材料34）</strong>
            </div>
          </div>
          <div style={s.card}>
            <div style={s.cardHeader}>
              <span style={s.cardTitle}><ShieldCheck size={16} color={C.primary} /> 事前审核 - 实时拦截</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  style={{ padding: '8px 12px', borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 13, outline: 'none', width: 220 }}
                  placeholder="搜索患者/项目..."
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                />
                <button style={{ ...s.badge, background: C.primary, color: C.white, padding: '8px 16px', border: 'none', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Download size={14} /> 导出
                </button>
              </div>
            </div>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>单号</th>
                  <th style={s.th}>患者</th>
                  <th style={s.th}>科室</th>
                  <th style={s.th}>类型</th>
                  <th style={s.th}>项目</th>
                  <th style={s.th}>费用</th>
                  <th style={s.th}>触发规则</th>
                  <th style={s.th}>风险</th>
                  <th style={s.th}>状态</th>
                  <th style={s.th}>原因</th>
                </tr>
              </thead>
              <tbody>
                {PREAUDIT.map(p => {
                  const st = getAuditStatus(p.status)
                  return (
                    <tr key={p.id}>
                      <td style={s.td}><strong style={{ color: C.primary, fontFamily: 'monospace' }}>{p.id}</strong></td>
                      <td style={s.td}>{p.patient}</td>
                      <td style={s.td}>{p.dept}</td>
                      <td style={s.td}><span style={{ ...s.badge, background: '#f1f5f9', color: C.textLight }}>{p.type}</span></td>
                      <td style={s.td}>{p.item}</td>
                      <td style={s.td}>¥{p.cost}</td>
                      <td style={s.td}>{p.rule}</td>
                      <td style={s.td}>
                        <span style={{
                          ...s.badge,
                          background: p.risk === 'high' ? '#fee2e2' : p.risk === 'medium' ? '#fef3c7' : '#d1fae5',
                          color: p.risk === 'high' ? C.danger : p.risk === 'medium' ? C.warning : C.success,
                        }}>
                          {p.risk === 'high' ? '高风险' : p.risk === 'medium' ? '中风险' : '低风险'}
                        </span>
                      </td>
                      <td style={s.td}><span style={{ ...s.badge, background: st.bg, color: st.color }}>{st.text}</span></td>
                      <td style={s.td}>{p.reason}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'in' && (
        <div>
          <div style={s.grid2}>
            <div style={s.card}>
              <div style={s.cardHeader}>
                <span style={s.cardTitle}><Activity size={16} color={C.primary} /> 在院患者费用监控</span>
              </div>
              {INPROGRESS.map(i => (
                <div key={i.id} style={{ padding: 14, background: i.status === 'warning' ? '#fff7ed' : '#f8fafc', borderRadius: 8, border: i.status === 'warning' ? '1px solid #fed7aa' : '1px solid #e2e8f0', marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div>
                      <strong style={{ color: C.primary }}>{i.patient}</strong>
                      <span style={{ fontSize: 12, color: C.textLight, marginLeft: 8 }}>{i.dept}</span>
                    </div>
                    <span style={{
                      ...s.badge,
                      background: i.status === 'warning' ? '#fef3c7' : '#d1fae5',
                      color: i.status === 'warning' ? C.warning : C.success,
                    }}>
                      {i.alerts > 0 ? `${i.alerts} 预警` : '正常'}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: C.textLight, marginBottom: 6 }}>
                    入科: {i.startTime} · 项目: {i.items} 项
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span>已用: <strong style={{ color: C.primary }}>¥{i.currentCost.toLocaleString()}</strong> / ¥{i.budget.toLocaleString()}</span>
                    <strong style={{ color: i.currentCost / i.budget > 0.85 ? C.danger : C.success }}>
                      {((i.currentCost / i.budget) * 100).toFixed(0)}%
                    </strong>
                  </div>
                  <div style={{ height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{
                      width: `${Math.min(100, (i.currentCost / i.budget) * 100)}%`,
                      height: '100%',
                      background: i.currentCost / i.budget > 0.85 ? C.danger : i.currentCost / i.budget > 0.6 ? C.warning : C.success,
                    }} />
                  </div>
                </div>
              ))}
            </div>

            <div style={s.card}>
              <div style={s.cardHeader}>
                <span style={s.cardTitle}><AlertCircle size={16} color={C.primary} /> 实时预警</span>
              </div>
              {[
                { time: '10:25', dept: '心内科', patient: '林晓曼', message: '接近医保限额（94%）', level: 'high' },
                { time: '09:45', dept: '普外科', patient: '黄志远', message: '使用医保外药品', level: 'medium' },
                { time: '08:30', dept: '骨科', patient: '周思远', message: '高值耗材使用', level: 'medium' },
                { time: '07:15', dept: 'ICU', patient: '王先生', message: '连续超量使用抗生素', level: 'high' },
              ].map((a, i) => (
                <div key={i} style={{ padding: 12, background: a.level === 'high' ? '#fef2f2' : '#fff7ed', borderRadius: 8, border: `1px solid ${a.level === 'high' ? '#fecaca' : '#fed7aa'}`, marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: C.textLight }}>{a.time}</span>
                    <span style={{
                      ...s.badge,
                      background: a.level === 'high' ? '#fee2e2' : '#fef3c7',
                      color: a.level === 'high' ? C.danger : C.warning,
                    }}>{a.level === 'high' ? '高' : '中'}</span>
                  </div>
                  <div style={{ fontSize: 13 }}>
                    <strong style={{ color: C.primary }}>{a.dept}</strong> · {a.patient}
                  </div>
                  <div style={{ fontSize: 12, color: C.textLight, marginTop: 4 }}>{a.message}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'post' && (
        <div>
          <div style={s.card}>
            <div style={s.cardHeader}>
              <span style={s.cardTitle}><BarChart3 size={16} color={C.primary} /> 违规类型分析（6月）</span>
              <span style={{ fontSize: 12, color: C.textLight }}>本月共审核 2,486 单，扣款 68 单</span>
            </div>
            <div style={s.grid2}>
              {RULE_STATS.map((r, i) => (
                <div key={i} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span><strong style={{ color: r.color }}>{r.name}</strong></span>
                    <span>{r.count} 起 · <strong style={{ color: r.color }}>¥{r.deduct.toLocaleString()}</strong></span>
                  </div>
                  <div style={{ height: 10, background: '#e2e8f0', borderRadius: 5, overflow: 'hidden' }}>
                    <div style={{ width: `${(r.count / 30) * 100}%`, height: '100%', background: r.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={s.card}>
            <div style={s.cardHeader}>
              <span style={s.cardTitle}><FileText size={16} color={C.primary} /> 事后审核明细</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  style={{ padding: '8px 12px', borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 13, outline: 'none', width: 220 }}
                  placeholder="搜索..."
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                />
                <button style={{ ...s.badge, background: C.primary, color: C.white, padding: '8px 16px', border: 'none', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Download size={14} /> 导出
                </button>
              </div>
            </div>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>单号</th>
                  <th style={s.th}>患者</th>
                  <th style={s.th}>科室</th>
                  <th style={s.th}>日期</th>
                  <th style={s.th}>总费用</th>
                  <th style={s.th}>实付</th>
                  <th style={s.th}>扣款</th>
                  <th style={s.th}>违规规则</th>
                  <th style={s.th}>状态</th>
                </tr>
              </thead>
              <tbody>
                {POSTAUDIT.map(p => {
                  const st = getAuditStatus(p.status)
                  return (
                    <tr key={p.id}>
                      <td style={s.td}><strong style={{ color: C.primary, fontFamily: 'monospace' }}>{p.id}</strong></td>
                      <td style={s.td}>{p.patient}</td>
                      <td style={s.td}>{p.dept}</td>
                      <td style={s.td}>{p.date}</td>
                      <td style={s.td}>¥{p.cost.toLocaleString()}</td>
                      <td style={s.td}>¥{p.paid.toLocaleString()}</td>
                      <td style={s.td}>
                        {p.deduct > 0 ? <strong style={{ color: C.danger }}>¥{p.deduct}</strong> : <span style={{ color: C.success }}>¥0</span>}
                      </td>
                      <td style={s.td}>{p.rules}</td>
                      <td style={s.td}><span style={{ ...s.badge, background: st.bg, color: st.color }}>{st.text}</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'appeal' && (
        <div style={s.card}>
          <div style={s.cardHeader}>
            <span style={s.cardTitle}><Gavel size={16} color={C.primary} /> 申诉管理（4条）</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                style={{ padding: '8px 12px', borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 13, outline: 'none', width: 220 }}
                placeholder="搜索..."
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
              />
              <button style={{ ...s.badge, background: C.primary, color: C.white, padding: '8px 16px', border: 'none', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Plus size={14} /> 新建申诉
              </button>
            </div>
          </div>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>申诉号</th>
                <th style={s.th}>患者</th>
                <th style={s.th}>科室</th>
                <th style={s.th}>扣款金额</th>
                <th style={s.th}>违规规则</th>
                <th style={s.th}>申诉理由</th>
                <th style={s.th}>提交时间</th>
                <th style={s.th}>状态</th>
                <th style={s.th}>操作</th>
              </tr>
            </thead>
            <tbody>
              {APPEALS.map(a => {
                const st = getAuditStatus(a.status)
                return (
                  <tr key={a.id}>
                    <td style={s.td}><strong style={{ color: C.primary, fontFamily: 'monospace' }}>{a.id}</strong></td>
                    <td style={s.td}>{a.patient}</td>
                    <td style={s.td}>{a.dept}</td>
                    <td style={s.td}><strong style={{ color: C.danger }}>¥{a.deduct}</strong></td>
                    <td style={s.td}>{a.rule}</td>
                    <td style={s.td}>{a.reason}</td>
                    <td style={s.td}>{a.submitTime}</td>
                    <td style={s.td}><span style={{ ...s.badge, background: st.bg, color: st.color }}>{st.text}</span></td>
                    <td style={s.td}>
                      <button style={{ ...s.badge, background: C.accent, color: C.white, padding: '4px 12px', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>
                        处理
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          <div style={{ marginTop: 20, padding: '14px 18px', background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Check size={16} color={C.success} />
              <strong style={{ color: C.success, fontSize: 14 }}>申诉流程</strong>
            </div>
            <div style={s.timeline}>
              <div style={s.timelineItem}>
                <div style={{ ...s.timelineDot, background: C.primary, left: -23, top: 6 }} />
                <strong style={{ color: C.primary, fontSize: 13 }}>1. 临床科室提交申诉</strong>
                <div style={{ fontSize: 12, color: C.textLight, marginTop: 2 }}>科室医保专员填写申诉理由，上传证据</div>
              </div>
              <div style={s.timelineItem}>
                <div style={{ ...s.timelineDot, background: C.accent, left: -23, top: 6 }} />
                <strong style={{ color: C.accent, fontSize: 13 }}>2. 医保办初审</strong>
                <div style={{ fontSize: 12, color: C.textLight, marginTop: 2 }}>医保办审核申诉材料完整性（1-2工作日）</div>
              </div>
              <div style={s.timelineItem}>
                <div style={{ ...s.timelineDot, background: C.warning, left: -23, top: 6 }} />
                <strong style={{ color: C.warning, fontSize: 13 }}>3. 医保中心复核</strong>
                <div style={{ fontSize: 12, color: C.textLight, marginTop: 2 }}>提交至医保中心专家复核（5-10工作日）</div>
              </div>
              <div style={s.timelineItem}>
                <div style={{ ...s.timelineDot, background: C.success, left: -23, top: 6 }} />
                <strong style={{ color: C.success, fontSize: 13 }}>4. 反馈结果</strong>
                <div style={{ fontSize: 12, color: C.textLight, marginTop: 2 }}>通过/部分通过/驳回，金额自动调整</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
