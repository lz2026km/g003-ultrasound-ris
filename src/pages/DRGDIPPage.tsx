/**
 * DRG/DIP医保控费模块
 * @version v0.9.0
 * @description 对标卫宁健康WiNEX、东华医为iMedical HOS
 *
 * 核心能力：
 * - DRG分组器（核心DRG/ADRG）
 * - DIP病种分值库
 * - 病案首页质控
 * - 费用预测
 * - 控费建议
 * - 临床路径推荐
 */

import React, { useState } from 'react'
import {
  DollarSign, TrendingUp, TrendingDown, Activity, AlertCircle, Check,
  FileText, Search, Plus, Download, BarChart3, Target, Zap, BookOpen,
  Calculator, ClipboardCheck, Stethoscope, Building2 as Hospital, PieChart, Award
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
  bar: { height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden', position: 'relative' },
  barFill: { height: '100%', borderRadius: 4 },
  alert: { padding: 14, background: '#fff7ed', borderRadius: 8, border: '1px solid #fed7aa', marginBottom: 12 },
}

const DRG_GROUPS = [
  { code: 'AH1', name: '肝胆胰疾病，伴重要合并症', weight: 2.18, avgCost: 18500, cases: 156, overrun: 8.5 },
  { code: 'BR2', name: '中枢神经系统疾病，伴合并症', weight: 1.85, avgCost: 15200, cases: 89, overrun: -2.3 },
  { code: 'CR1', name: '心血管疾病，伴重要合并症', weight: 2.45, avgCost: 22000, cases: 234, overrun: 12.6 },
  { code: 'DT1', name: '消化系统疾病，严重', weight: 1.62, avgCost: 12800, cases: 178, overrun: 4.2 },
  { code: 'ES1', name: '呼吸系统疾病，严重', weight: 1.95, avgCost: 14600, cases: 145, overrun: -5.8 },
  { code: 'FK2', name: '肾脏疾病，伴合并症', weight: 1.78, avgCost: 13900, cases: 67, overrun: 6.1 },
  { code: 'GO1', name: '妇产科疾病，手术', weight: 0.95, avgCost: 8200, cases: 312, overrun: -1.5 },
  { code: 'HP2', name: '肌肉骨骼疾病，伴合并症', weight: 1.42, avgCost: 11500, cases: 198, overrun: 3.8 },
]

const DIP_DISEASES = [
  { code: 'K80.202', name: '胆囊结石伴胆囊炎', score: 1850, avgCost: 11200, cases: 89, ratio: 0.86 },
  { code: 'I20.901', name: '不稳定型心绞痛', score: 2380, avgCost: 18400, cases: 67, ratio: 1.12 },
  { code: 'J18.001', name: '支气管肺炎', score: 1320, avgCost: 8600, cases: 156, ratio: 0.92 },
  { code: 'K35.801', name: '急性阑尾炎', score: 1180, avgCost: 7800, cases: 78, ratio: 0.78 },
  { code: 'I63.401', name: '脑梗死', score: 2680, avgCost: 21500, cases: 92, ratio: 1.18 },
  { code: 'M17.901', name: '膝关节骨关节炎', score: 2950, avgCost: 24800, cases: 45, ratio: 1.05 },
]

const CASE_QUALITY = [
  { id: 'CASE001', patient: '王建国', dept: '心血管内科', score: 92, issues: 0, status: 'excellent' },
  { id: 'CASE002', patient: '李秀英', dept: '肝胆外科', score: 78, issues: 2, status: 'good' },
  { id: 'CASE003', patient: '张明远', dept: '呼吸内科', score: 65, issues: 4, status: 'warning' },
  { id: 'CASE004', patient: '刘晓燕', dept: '神经内科', score: 88, issues: 1, status: 'good' },
  { id: 'CASE005', patient: '陈志强', dept: '消化内科', score: 95, issues: 0, status: 'excellent' },
  { id: 'CASE006', patient: '赵丽华', dept: '肾脏内科', score: 72, issues: 3, status: 'warning' },
]

const COST_FORECAST = [
  { month: '1月', actual: 285, forecast: 280, budget: 300 },
  { month: '2月', actual: 268, forecast: 275, budget: 300 },
  { month: '3月', actual: 312, forecast: 305, budget: 300 },
  { month: '4月', actual: 298, forecast: 295, budget: 300 },
  { month: '5月', actual: 285, forecast: 290, budget: 300 },
  { month: '6月', actual: 278, forecast: 285, budget: 300 },
  { month: '7月', actual: null, forecast: 295, budget: 300 },
  { month: '8月', actual: null, forecast: 305, budget: 300 },
]

const OPT_SUGGESTIONS = [
  { id: 'OPT001', type: '药品', from: '进口阿莫西林', to: '国产仿制药', savings: 850, impact: '高', dept: '呼吸内科' },
  { id: 'OPT002', type: '检查', from: '增强CT', to: 'MRI平扫+增强', savings: 1200, impact: '中', dept: '肝胆外科' },
  { id: 'OPT003', type: '材料', from: '进口支架', to: '国产同规格', savings: 3200, impact: '高', dept: '心血管内科' },
  { id: 'OPT004', type: '临床路径', from: '传统流程', to: '日间手术路径', savings: 4500, impact: '高', dept: '肝胆外科' },
  { id: 'OPT005', type: '用药', from: '广谱抗生素', to: '目标性抗生素', savings: 680, impact: '中', dept: '呼吸内科' },
]

export default function DRGDIPPage() {
  const [activeTab, setActiveTab] = useState('drg')
  const [searchText, setSearchText] = useState('')

  return (
    <div style={s.root}>
      <div style={s.header}>
        <h1 style={s.title}>DRG/DIP 医保控费中心</h1>
        <p style={s.subtitle}>对标卫宁健康WiNEX+DeepSeek、东华医为iMedical HOS · 病组付费+分值付费双轨</p>
      </div>

      <div style={s.kpiRow}>
        {[
          { value: '2,348', label: '本月入组病例', color: C.primary, hint: '↑ 8.2% vs 上月' },
          { value: '94.6%', label: '入组成功率', color: C.success, hint: '↑ 1.8%' },
          { value: '¥18,560', label: '例均费用', color: C.accent, hint: '↓ 2.1%' },
          { value: '¥2.85M', label: '本月结余', color: C.purple, hint: '↑ 12.5%' },
          { value: '5.8%', label: '超支病组占比', color: C.danger, hint: '↓ 1.2%' },
        ].map((k, i) => (
          <div key={i} style={s.kpiCard}>
            <div style={{ ...s.kpiValue, color: k.color }}>{k.value}</div>
            <div style={s.kpiLabel}>{k.label}</div>
            <div style={{ ...s.kpiHint, color: k.hint.includes('↓') && k.color !== C.danger ? C.success : k.hint.includes('↑') && k.color === C.danger ? C.danger : C.textLight }}>{k.hint}</div>
          </div>
        ))}
      </div>

      <div style={s.tabRow}>
        {[
          { key: 'drg', label: 'DRG分组', icon: <BarChart3 size={14} /> },
          { key: 'dip', label: 'DIP分值', icon: <Calculator size={14} /> },
          { key: 'quality', label: '病案质控', icon: <ClipboardCheck size={14} /> },
          { key: 'forecast', label: '费用预测', icon: <TrendingUp size={14} /> },
          { key: 'optimize', label: '控费建议', icon: <Target size={14} /> },
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

      {activeTab === 'drg' && (
        <div>
          <div style={s.alert}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <AlertCircle size={16} color={C.warning} />
              <strong style={{ color: C.warning }}>本月DRG入组异常</strong>
            </div>
            <div style={{ fontSize: 13, color: C.textLight }}>
              CR1 心血管疾病组超支 12.6%（234例），建议重点关注高值耗材使用。
            </div>
          </div>
          <div style={s.card}>
            <div style={s.cardHeader}>
              <span style={s.cardTitle}><BarChart3 size={16} color={C.primary} /> DRG分组明细（8/376 ADRG）</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  style={{ padding: '8px 12px', borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 13, outline: 'none', width: 200 }}
                  placeholder="搜索DRG编码/名称..."
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
                  <th style={s.th}>ADRG编码</th>
                  <th style={s.th}>DRG名称</th>
                  <th style={s.th}>权重</th>
                  <th style={s.th}>例均费用</th>
                  <th style={s.th}>病例数</th>
                  <th style={s.th}>超支率</th>
                  <th style={s.th}>超支可视化</th>
                  <th style={s.th}>状态</th>
                </tr>
              </thead>
              <tbody>
                {DRG_GROUPS.map(g => (
                  <tr key={g.code}>
                    <td style={s.td}><strong style={{ color: C.primary, fontFamily: 'monospace' }}>{g.code}</strong></td>
                    <td style={s.td}>{g.name}</td>
                    <td style={s.td}>{g.weight.toFixed(2)}</td>
                    <td style={s.td}>¥{g.avgCost.toLocaleString()}</td>
                    <td style={s.td}>{g.cases}</td>
                    <td style={s.td}>
                      <span style={{
                        color: g.overrun > 5 ? C.danger : g.overrun < -3 ? C.success : C.warning,
                        fontWeight: 600,
                      }}>
                        {g.overrun > 0 ? '+' : ''}{g.overrun.toFixed(1)}%
                      </span>
                    </td>
                    <td style={s.td}>
                      <div style={s.bar}>
                        <div style={{
                          ...s.barFill,
                          width: `${Math.min(Math.abs(g.overrun) * 8, 100)}%`,
                          background: g.overrun > 5 ? C.danger : g.overrun < -3 ? C.success : C.warning,
                        }} />
                      </div>
                    </td>
                    <td style={s.td}>
                      <span style={{
                        ...s.badge,
                        background: g.overrun > 5 ? '#fee2e2' : g.overrun < -3 ? '#d1fae5' : '#fef3c7',
                        color: g.overrun > 5 ? C.danger : g.overrun < -3 ? C.success : C.warning,
                      }}>
                        {g.overrun > 5 ? '超支' : g.overrun < -3 ? '结余' : '正常'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'dip' && (
        <div style={s.card}>
          <div style={s.cardHeader}>
            <span style={s.cardTitle}><Calculator size={16} color={C.primary} /> DIP病种分值（基于ICD-10）</span>
            <span style={{ fontSize: 12, color: C.textLight }}>已收录 6,000+ 病种</span>
          </div>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>ICD-10编码</th>
                <th style={s.th}>病种名称</th>
                <th style={s.th}>分值</th>
                <th style={s.th}>例均费用</th>
                <th style={s.th}>病例数</th>
                <th style={s.th}>费用/分值比</th>
                <th style={s.th}>趋势</th>
              </tr>
            </thead>
            <tbody>
              {DIP_DISEASES.map(d => (
                <tr key={d.code}>
                  <td style={s.td}><strong style={{ color: C.primary, fontFamily: 'monospace' }}>{d.code}</strong></td>
                  <td style={s.td}>{d.name}</td>
                  <td style={s.td}><strong>{d.score.toLocaleString()}</strong></td>
                  <td style={s.td}>¥{d.avgCost.toLocaleString()}</td>
                  <td style={s.td}>{d.cases}</td>
                  <td style={s.td}>
                    <span style={{ color: d.ratio > 1.1 ? C.danger : d.ratio < 0.9 ? C.success : C.warning, fontWeight: 600 }}>
                      {d.ratio.toFixed(2)}
                    </span>
                  </td>
                  <td style={s.td}>
                    {d.ratio > 1.1 ? <TrendingUp size={16} color={C.danger} /> : d.ratio < 0.9 ? <TrendingDown size={16} color={C.success} /> : <Activity size={16} color={C.warning} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'quality' && (
        <div style={s.card}>
          <div style={s.cardHeader}>
            <span style={s.cardTitle}><ClipboardCheck size={16} color={C.primary} /> 病案首页质控</span>
            <span style={{ fontSize: 12, color: C.textLight }}>本月 6,248 份病案</span>
          </div>
          <div style={s.grid3}>
            {[
              { value: '92.5%', label: '质控合格率', color: C.success, trend: '↑ 2.1%' },
              { value: '88.2%', label: '主要诊断准确率', color: C.success, trend: '↑ 1.5%' },
              { value: '95.6%', label: '主要手术准确率', color: C.success, trend: '↑ 0.8%' },
              { value: '76.3%', label: '并发症填写完整率', color: C.warning, trend: '↓ 0.5%' },
              { value: '89.1%', label: 'ICD编码准确率', color: C.success, trend: '↑ 1.2%' },
              { value: '12.5%', label: '高编码倍率病例', color: C.danger, trend: '↑ 0.8%' },
            ].map((q, i) => (
              <div key={i} style={{ padding: 16, background: '#f8fafc', borderRadius: 8 }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: q.color }}>{q.value}</div>
                <div style={{ fontSize: 12, color: C.textLight, marginTop: 4 }}>{q.label}</div>
                <div style={{ fontSize: 11, color: q.trend.includes('↓') ? C.danger : C.success, marginTop: 4, fontWeight: 600 }}>{q.trend}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20 }}>
            <h3 style={{ fontSize: 14, color: C.primary, marginBottom: 12 }}>近期病案质控明细</h3>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>病案号</th>
                  <th style={s.th}>患者</th>
                  <th style={s.th}>科室</th>
                  <th style={s.th}>质控评分</th>
                  <th style={s.th}>问题数</th>
                  <th style={s.th}>状态</th>
                </tr>
              </thead>
              <tbody>
                {CASE_QUALITY.map(c => (
                  <tr key={c.id}>
                    <td style={s.td}><strong style={{ color: C.primary }}>{c.id}</strong></td>
                    <td style={s.td}>{c.patient}</td>
                    <td style={s.td}>{c.dept}</td>
                    <td style={s.td}>
                      <strong style={{ color: c.score >= 90 ? C.success : c.score >= 80 ? C.warning : C.danger, fontSize: 16 }}>
                        {c.score}
                      </strong>
                    </td>
                    <td style={s.td}>{c.issues}</td>
                    <td style={s.td}>
                      <span style={{
                        ...s.badge,
                        background: c.status === 'excellent' ? '#d1fae5' : c.status === 'good' ? '#dbeafe' : '#fef3c7',
                        color: c.status === 'excellent' ? C.success : c.status === 'good' ? C.accent : C.warning,
                      }}>
                        {c.status === 'excellent' ? '优秀' : c.status === 'good' ? '良好' : '需改进'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'forecast' && (
        <div style={s.card}>
          <div style={s.cardHeader}>
            <span style={s.cardTitle}><TrendingUp size={16} color={C.primary} /> 费用预测（基于时序+病组）</span>
            <div style={{ display: 'flex', gap: 8, fontSize: 12, color: C.textLight }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 12, height: 3, background: C.primary, display: 'inline-block' }}></span> 实际
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 12, height: 3, background: C.accent, borderTop: '2px dashed', display: 'inline-block' }}></span> 预测
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 12, height: 3, background: C.danger, display: 'inline-block' }}></span> 预算
              </span>
            </div>
          </div>

          <div style={{ position: 'relative', height: 280, padding: '20px 0' }}>
            <svg width="100%" height="100%" viewBox="0 0 800 250" preserveAspectRatio="none">
              {[0, 1, 2, 3, 4].map(i => (
                <line key={i} x1="0" y1={i * 50} x2="800" y2={i * 50} stroke="#e2e8f0" strokeWidth="1" />
              ))}
              {/* 预算线 */}
              <line x1="0" y1="80" x2="800" y2="80" stroke={C.danger} strokeWidth="2" strokeDasharray="4 2" />
              <text x="780" y="75" fill={C.danger} fontSize="11" textAnchor="end">预算 ¥30万</text>
              {/* 实际折线 */}
              <polyline points="50,90 150,110 250,55 350,80 450,95 550,105" stroke={C.primary} strokeWidth="2.5" fill="none" />
              {[
                { x: 50, y: 90 }, { x: 150, y: 110 }, { x: 250, y: 55 },
                { x: 350, y: 80 }, { x: 450, y: 95 }, { x: 550, y: 105 }
              ].map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="4" fill={C.primary} />)}
              {/* 预测折线（虚线） */}
              <polyline points="50,90 150,110 250,55 350,80 450,95 550,105 650,75 750,60"
                stroke={C.accent} strokeWidth="2.5" fill="none" strokeDasharray="6 3" />
              {[
                { x: 650, y: 75 }, { x: 750, y: 60 }
              ].map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="4" fill={C.accent} />)}
              {/* X轴标签 */}
              {COST_FORECAST.map((c, i) => (
                <text key={i} x={50 + i * 100} y="240" fill={C.textLight} fontSize="11" textAnchor="middle">{c.month}</text>
              ))}
            </svg>
          </div>

          <div style={{ marginTop: 16, padding: '12px 16px', background: '#f0f9ff', borderRadius: 8, border: '1px solid #bae6fd' }}>
            <div style={{ fontSize: 13, color: C.primary, fontWeight: 600, marginBottom: 6 }}>📊 预测洞察</div>
            <div style={{ fontSize: 12, color: C.textLight, lineHeight: 1.6 }}>
              基于LSTM+Prophet混合模型，预测7-8月例均费用将稳定在 ¥28,500-30,500 区间，
              预计结余 ¥1.85M（+8.5% vs 预算）。建议持续监控CR1心血管病组（超支风险中）。
            </div>
          </div>
        </div>
      )}

      {activeTab === 'optimize' && (
        <div style={s.card}>
          <div style={s.cardHeader}>
            <span style={s.cardTitle}><Target size={16} color={C.primary} /> 智能控费建议（AI生成）</span>
            <span style={{ fontSize: 12, color: C.textLight }}>本月推荐 18 项，已采纳 12 项</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
            {[
              { value: '¥12.5万', label: '本月建议节省', color: C.success },
              { value: '¥8.6万', label: '已实现节省', color: C.primary },
              { value: '68.8%', label: '采纳率', color: C.accent },
            ].map((q, i) => (
              <div key={i} style={{ padding: 16, background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', borderRadius: 8 }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: q.color }}>{q.value}</div>
                <div style={{ fontSize: 12, color: C.textLight, marginTop: 4 }}>{q.label}</div>
              </div>
            ))}
          </div>

          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>编号</th>
                <th style={s.th}>类型</th>
                <th style={s.th}>原方案</th>
                <th style={s.th}>替代方案</th>
                <th style={s.th}>科室</th>
                <th style={s.th}>节省</th>
                <th style={s.th}>影响</th>
                <th style={s.th}>操作</th>
              </tr>
            </thead>
            <tbody>
              {OPT_SUGGESTIONS.map(o => (
                <tr key={o.id}>
                  <td style={s.td}><strong style={{ color: C.primary }}>{o.id}</strong></td>
                  <td style={s.td}><span style={{ ...s.badge, background: '#dbeafe', color: C.accent }}>{o.type}</span></td>
                  <td style={s.td}>{o.from}</td>
                  <td style={s.td}><strong style={{ color: C.success }}>{o.to}</strong></td>
                  <td style={s.td}>{o.dept}</td>
                  <td style={s.td}><strong style={{ color: C.success }}>¥{o.savings}</strong></td>
                  <td style={s.td}>
                    <span style={{
                      ...s.badge,
                      background: o.impact === '高' ? '#fee2e2' : '#fef3c7',
                      color: o.impact === '高' ? C.danger : C.warning,
                    }}>{o.impact}</span>
                  </td>
                  <td style={s.td}>
                    <button style={{ ...s.badge, background: C.success, color: C.white, padding: '4px 12px', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Check size={12} /> 采纳
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: 20, padding: '16px 20px', background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Award size={18} color={C.success} />
              <strong style={{ color: C.success, fontSize: 14 }}>临床路径推荐</strong>
            </div>
            <div style={{ fontSize: 12, color: C.textLight, lineHeight: 1.7 }}>
              <div>• <strong>腹腔镜胆囊切除日间手术路径</strong>：平均住院日 2.3 天，节省 ¥4,500/例（已应用于 56 例）</div>
              <div>• <strong>急性心肌梗死PCI绿色通道路径</strong>：D2B时间 56 分钟，达标率 95%</div>
              <div>• <strong>脑梗死静脉溶栓路径</strong>：DNT时间 28 分钟，达标率 92%</div>
              <div>• <strong>膝关节置换ERAS路径</strong>：平均住院日 5.8 天，节省 ¥3,200/例</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
