/**
 * 超声报告工作站 - 老专家友好版
 * @version v0.18.0
 * @description 字号加大、按钮加大、布局宽松、z-index 修复
 *
 * 设计原则：
 * - 字号 14-18px（老专家友好）
 * - 按钮最小 44px（Apple HIG）
 * - 留白充足，节奏舒缓
 * - 避免元素堆叠遮挡
 * - 交互即时可见
 */

import React, { useState } from 'react'
import {
  FileText, Stethoscope, Activity, BookOpen, History, ShieldCheck,
  Save, Printer, Send, Mic, MicOff, Camera, Ruler, Image, Type,
  Check, X, ChevronDown, ChevronRight, Sparkles, Plus, AlertTriangle,
  Brain, Award, Network, BookMarked, Target, Lightbulb, ExternalLink,
  Database, ListChecks, GitBranch, Cpu, RefreshCw, FileCheck, CheckCircle2,
  ArrowRight, Crosshair, Edit3
} from 'lucide-react'

import {
  TIRADS_RULES, BIRADS_RULES, ORADS_RULES, LIRADS_RULES
} from '../data/report-workspace/grading-rules'
import { ULTRASOUND_PROTOCOLS } from '../data/report-workspace/protocols'
import { DISEASE_KNOWLEDGE } from '../data/report-workspace/knowledge-graph'
import { EVIDENCE_GUIDELINES, EVIDENCE_LITERATURE } from '../data/report-workspace/evidence-medicine'

const C = {
  primary: '#1a365d', accent: '#2563eb', success: '#059669',
  warning: '#d97706', danger: '#dc2626', white: '#fff', bg: '#f8fafc',
  border: '#e2e8f0', text: '#1a365c', textLight: '#64748b',
  purple: '#7c3aed',
}

// 老专家友好：字号加大、padding加大、按钮加大
const s: Record<string, React.CSSProperties> = {
  root: { display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)', background: '#f0f4f8', fontSize: 15, fontFamily: '"Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif' },

  // 顶栏：清晰、字号大、高度足
  topbar: { background: C.white, padding: '12px 20px', borderBottom: `2px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', zIndex: 100, position: 'relative' },
  topbarLeft: { display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' as const },
  topbarRight: { display: 'flex', alignItems: 'center', gap: 10 },
  reportId: { fontSize: 16, fontWeight: 700, color: C.primary, fontFamily: 'monospace' },
  patientChip: { padding: '6px 14px', background: '#f0f9ff', borderRadius: 8, fontSize: 14, color: C.primary, fontWeight: 600, border: `1px solid #bae6fd` },
  statusChip: { padding: '6px 12px', borderRadius: 8, fontSize: 13, fontWeight: 600 },
  scoreChip: { padding: '6px 14px', borderRadius: 8, fontSize: 14, fontWeight: 700, color: C.white },
  // 大按钮：高度 44px
  btn: { padding: '10px 18px', borderRadius: 8, border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, minHeight: 44, justifyContent: 'center' },
  btnPrimary: { background: C.primary, color: C.white },
  btnSuccess: { background: C.success, color: C.white },
  btnOutline: { background: C.white, color: C.primary, border: `1px solid ${C.border}` },

  cols: { display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 },

  // 左栏：宽松
  leftCol: { width: 300, background: C.white, borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 },
  leftSection: { borderBottom: `1px solid ${C.border}`, overflow: 'hidden' },
  leftSectionTitle: { padding: '14px 18px', fontSize: 13, fontWeight: 700, color: C.textLight, textTransform: 'uppercase' as const, letterSpacing: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fafbfc', cursor: 'pointer', userSelect: 'none' as const, minHeight: 44 },
  leftSectionContent: { padding: '6px 10px 10px', maxHeight: 280, overflowY: 'auto' as const },
  leftItem: { padding: '10px 12px', borderRadius: 8, fontSize: 14, color: C.text, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4, minHeight: 40 },
  leftItemActive: { padding: '10px 12px', borderRadius: 8, fontSize: 14, color: C.primary, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4, background: '#eff6ff', fontWeight: 600, minHeight: 40, border: `1px solid #bfdbfe` },
  leftItemTag: { fontSize: 11, padding: '2px 8px', borderRadius: 4, background: C.primary, color: C.white, fontWeight: 600 },

  // 中栏
  centerCol: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: C.bg, minWidth: 0 },
  centerTabs: { display: 'flex', gap: 4, padding: '8px 12px', background: C.white, borderBottom: `1px solid ${C.border}` },
  centerTab: { padding: '10px 18px', borderRadius: '6px 6px 0 0', fontSize: 14, color: C.textLight, cursor: 'pointer', border: 'none', background: 'transparent', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, minHeight: 40 },
  centerTabActive: { padding: '10px 18px', borderRadius: '6px 6px 0 0', fontSize: 14, color: C.primary, cursor: 'pointer', border: 'none', background: '#eff6ff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, minHeight: 40, borderBottom: `3px solid ${C.primary}` },

  workArea: { display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 },

  // 影像区：保持可点
  imageArea: { width: '45%', background: '#0f172a', display: 'flex', flexDirection: 'column', position: 'relative', minWidth: 0 },
  imageToolbar: { padding: '10px 14px', background: '#1e293b', display: 'flex', gap: 8, alignItems: 'center', borderBottom: '1px solid #334155', flexWrap: 'wrap' as const },
  imageToolBtn: { padding: '8px 12px', borderRadius: 6, fontSize: 13, color: '#cbd5e1', cursor: 'pointer', border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', gap: 5, minHeight: 36 },
  imageToolBtnActive: { padding: '8px 12px', borderRadius: 6, fontSize: 13, color: C.white, cursor: 'pointer', border: 'none', background: C.accent, display: 'flex', alignItems: 'center', gap: 5, minHeight: 36 },
  imageCanvas: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', minHeight: 200 },
  imageLabel: { position: 'absolute', top: 12, left: 14, color: '#94a3b8', fontSize: 13, fontWeight: 600, zIndex: 1 },
  imageParams: { position: 'absolute', bottom: 12, right: 14, color: '#10b981', fontSize: 12, fontFamily: 'monospace', zIndex: 1 },
  imageThumb: { padding: 10, background: '#1e293b', borderTop: '1px solid #334155', display: 'flex', gap: 8, overflowX: 'auto' as const },
  imageThumbItem: { width: 72, height: 54, background: '#0f172a', borderRadius: 4, flexShrink: 0, border: `1px solid #334155`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', cursor: 'pointer' },
  imageThumbActive: { width: 72, height: 54, background: '#1e293b', borderRadius: 4, flexShrink: 0, border: `2px solid ${C.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', cursor: 'pointer' },

  // 报告编辑区
  reportArea: { flex: 1, display: 'flex', flexDirection: 'column', background: C.white, overflow: 'hidden', minWidth: 0 },
  reportToolbar: { padding: '10px 14px', background: '#f8fafc', borderBottom: `1px solid ${C.border}`, display: 'flex', gap: 8, flexWrap: 'wrap' as const },
  reportBody: { flex: 1, padding: 18, overflowY: 'auto' as const },
  reportField: { marginBottom: 16 },
  reportLabel: { fontSize: 14, fontWeight: 600, color: C.textLight, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 },
  reportInput: { width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 15, outline: 'none', boxSizing: 'border-box' as const, minHeight: 44 },
  reportTextarea: { width: '100%', padding: '12px 14px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 15, outline: 'none', minHeight: 100, resize: 'vertical' as const, fontFamily: 'inherit', boxSizing: 'border-box' as const, lineHeight: 1.6 },
  reportSection: { padding: 14, background: '#fafbfc', borderRadius: 8, marginBottom: 14, border: `1px solid ${C.border}` },
  reportSectionTitle: { fontSize: 14, fontWeight: 700, color: C.primary, marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  measurementTable: { width: '100%', fontSize: 13, borderCollapse: 'collapse' as const },
  measurementTh: { padding: '8px 10px', textAlign: 'left' as const, fontWeight: 600, color: C.textLight, background: '#f1f5f9', borderBottom: `1px solid ${C.border}` },
  measurementTd: { padding: '8px 10px', borderBottom: `1px solid ${C.border}`, color: C.text },

  // 右栏
  rightCol: { width: 360, background: C.white, borderLeft: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 },
  rightTabs: { display: 'flex', borderBottom: `1px solid ${C.border}`, background: '#fafbfc' },
  rightTab: { flex: 1, padding: '12px 6px', fontSize: 13, color: C.textLight, cursor: 'pointer', border: 'none', background: 'transparent', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, borderBottom: '3px solid transparent', minHeight: 44 },
  rightTabActive: { flex: 1, padding: '12px 6px', fontSize: 13, color: C.primary, cursor: 'pointer', border: 'none', background: C.white, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, borderBottom: `3px solid ${C.primary}` },
  rightBody: { flex: 1, padding: 14, overflowY: 'auto' as const },

  // CDSS
  cdssCard: { padding: 12, background: '#f8fafc', borderRadius: 8, marginBottom: 10, border: `1px solid ${C.border}` },
  cdssLabel: { fontSize: 12, fontWeight: 700, color: C.textLight, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5, textTransform: 'uppercase' as const, letterSpacing: 0.5 },
  cdssItem: { padding: '10px 12px', background: C.white, borderRadius: 6, marginBottom: 6, fontSize: 14, color: C.text, display: 'flex', alignItems: 'center', gap: 8, border: `1px solid ${C.border}`, minHeight: 40 },
  cdssItemHigh: { padding: '10px 12px', background: '#fef2f2', borderRadius: 6, marginBottom: 6, fontSize: 14, color: C.danger, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, border: '1px solid #fecaca', minHeight: 40 },
  cdssItemWarn: { padding: '10px 12px', background: '#fff7ed', borderRadius: 6, marginBottom: 6, fontSize: 14, color: C.warning, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8, border: '1px solid #fed7aa', minHeight: 40 },

  // 分级
  gradeBtn: { padding: '12px 14px', borderRadius: 8, fontSize: 14, color: C.text, cursor: 'pointer', border: `1px solid ${C.border}`, marginBottom: 6, background: C.white, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, minHeight: 48 },
  gradeBtnActive: { padding: '12px 14px', borderRadius: 8, fontSize: 14, color: C.white, cursor: 'pointer', border: `2px solid ${C.primary}`, marginBottom: 6, background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, fontWeight: 600, minHeight: 48 },
  gradeLevel: { fontWeight: 700, fontSize: 14, padding: '4px 10px', borderRadius: 4, minWidth: 44, textAlign: 'center' as const },

  // 状态栏
  statusbar: { background: C.primary, color: C.white, padding: '8px 20px', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' as const, gap: 12 },
  statusbarItem: { display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, opacity: 0.95 },
}

const CURRENT_PATIENT = { id: 'P2026-0528', name: '王秀珍', age: 52, gender: '女', exam: '甲状腺US' }
const HISTORY_REPORTS = [
  { id: 'R2024-1205', date: '2024-12-05', diagnosis: '甲状腺右叶结节 TI-RADS 3' },
  { id: 'R2025-0612', date: '2025-06-12', diagnosis: '甲状腺右叶结节 TI-RADS 3（稳定）' },
  { id: 'R2025-1210', date: '2025-12-10', diagnosis: '甲状腺右叶结节 TI-RADS 3（1.2cm）' },
]
const IMAGE_THUMBS = [
  { id: 1, label: '横切-右叶', active: false },
  { id: 2, label: '纵切-右叶', active: true },
  { id: 3, label: '横切-左叶', active: false },
  { id: 4, label: 'CDFI', active: false },
]
const MEASUREMENTS = [
  { name: '甲状腺右叶 长径', value: '4.8', unit: 'cm', ref: '<5.0', status: 'normal' },
  { name: '甲状腺右叶 宽径', value: '1.8', unit: 'cm', ref: '<2.0', status: 'normal' },
  { name: '甲状腺右叶 厚径', value: '1.6', unit: 'cm', ref: '<2.0', status: 'normal' },
  { name: '甲状腺左叶 长径', value: '4.6', unit: 'cm', ref: '<5.0', status: 'normal' },
  { name: '峡部厚度', value: '0.4', unit: 'cm', ref: '<0.5', status: 'normal' },
  { name: '右叶结节 长径', value: '1.5', unit: 'cm', ref: '-', status: 'attention' },
  { name: '右叶结节 宽径', value: '1.1', unit: 'cm', ref: '-', status: 'attention' },
  { name: '右叶结节 厚径', value: '0.9', unit: 'cm', ref: '-', status: 'attention' },
]

export default function ReportWritePagePro() {
  const [centerTab, setCenterTab] = useState('work')
  const [rightTab, setRightTab] = useState('cdss')
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    protocol: true, template: true, history: true, term: false, quality: true, ai: true
  })
  const [selectedProtocol, setSelectedProtocol] = useState('P001')
  const [selectedGrading, setSelectedGrading] = useState<'TIRADS' | 'BIRADS' | 'ORADS' | 'LIRADS'>('TIRADS')
  const [selectedGradeLevel, setSelectedGradeLevel] = useState(4)
  const [reportContent, setReportContent] = useState({
    findings: '甲状腺大小正常，形态规则，包膜完整。右叶见一低回声结节，大小约 1.5×1.1×0.9 cm，边界欠清，形态欠规则，内回声不均匀，可见多发点状强回声。CDFI：结节内可见血流信号。',
    diagnosis: '甲状腺右叶结节 TI-RADS 4a',
    impression: '低度可疑恶性（2-10%），建议细针穿刺活检（FNA），3-6 月后超声复查。',
  })
  const [isRecording, setIsRecording] = useState(false)
  const [criticalValue, setCriticalValue] = useState(false)
  const qualityScore = 85

  const currentDisease = DISEASE_KNOWLEDGE[0]
  const currentGradingRules = selectedGrading === 'TIRADS' ? TIRADS_RULES
    : selectedGrading === 'BIRADS' ? BIRADS_RULES
    : selectedGrading === 'ORADS' ? ORADS_RULES
    : LIRADS_RULES
  const currentProtocol = ULTRASOUND_PROTOCOLS[0]
  const toggleSection = (k: string) => setOpenSections(p => ({ ...p, [k]: !p[k] }))

  return (
    <div style={s.root}>
      {/* 顶栏 */}
      <div style={s.topbar}>
        <div style={s.topbarLeft}>
          <div style={s.reportId}>RPT-2026-0605-001</div>
          <span style={s.patientChip}>👤 {CURRENT_PATIENT.name} | {CURRENT_PATIENT.age}岁 {CURRENT_PATIENT.gender}</span>
          <span style={{ ...s.statusChip, background: '#fef3c7', color: C.warning }}>● 书写中</span>
          <span style={{ ...s.scoreChip, background: qualityScore >= 90 ? C.success : C.warning }}>质控 {qualityScore}</span>
        </div>
        <div style={s.topbarRight}>
          <button style={{ ...s.btn, ...s.btnOutline }} title="历史版本">
            <History size={14} /> v3
          </button>
          <button style={{ ...s.btn, ...s.btnOutline }}>
            <Printer size={14} /> 打印
          </button>
          <button style={{ ...s.btn, ...s.btnOutline }}>
            <Save size={14} /> 暂存
          </button>
          <button style={{ ...s.btn, ...s.btnSuccess }}>
            <Send size={14} /> 提交审核
          </button>
        </div>
      </div>

      {/* 三栏 */}
      <div style={s.cols}>
        {/* 左栏 */}
        <div style={s.leftCol}>
          {/* 协议 */}
          <div style={s.leftSection}>
            <div style={s.leftSectionTitle} onClick={() => toggleSection('protocol')}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Target size={14} /> AI 协议推荐
              </span>
              {openSections.protocol ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </div>
            {openSections.protocol && (
              <div style={s.leftSectionContent}>
                {ULTRASOUND_PROTOCOLS.slice(0, 4).map(p => (
                  <div
                    key={p.id}
                    style={p.id === selectedProtocol ? s.leftItemActive : s.leftItem}
                    onClick={() => setSelectedProtocol(p.id)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, overflow: 'hidden' }}>
                      <Activity size={14} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                    </div>
                    {p.id === selectedProtocol && <span style={s.leftItemTag}>已选</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 模板 */}
          <div style={s.leftSection}>
            <div style={s.leftSectionTitle} onClick={() => toggleSection('template')}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <FileText size={14} /> 报告模板
              </span>
              {openSections.template ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </div>
            {openSections.template && (
              <div style={s.leftSectionContent}>
                {['甲状腺常规检查', '腹部常规超声', '心脏超声', '妇产科超声', '血管超声'].map((t, i) => (
                  <div key={i} style={i === 0 ? s.leftItemActive : s.leftItem}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{t}</span>
                    {i === 0 && <span style={s.leftItemTag}>个人</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 历史 */}
          <div style={s.leftSection}>
            <div style={s.leftSectionTitle} onClick={() => toggleSection('history')}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <History size={14} /> 历史报告
              </span>
              {openSections.history ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </div>
            {openSections.history && (
              <div style={s.leftSectionContent}>
                {HISTORY_REPORTS.map(h => (
                  <div key={h.id} style={s.leftItem}>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.primary, fontFamily: 'monospace' }}>{h.id}</div>
                      <div style={{ fontSize: 12, color: C.textLight, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.diagnosis}</div>
                    </div>
                    <span style={{ fontSize: 11, color: C.textLight }}>{h.date}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 词库 */}
          <div style={s.leftSection}>
            <div style={s.leftSectionTitle} onClick={() => toggleSection('term')}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <BookOpen size={14} /> 术语词库
              </span>
              {openSections.term ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </div>
            {openSections.term && (
              <div style={s.leftSectionContent}>
                <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6, padding: 4 }}>
                  {['低回声', '等回声', '高回声', '无回声', '边界清晰', '边界欠清', '形态规则', 'CDFI血流', '钙化', '强回声斑'].map((t, i) => (
                    <span key={i} style={{ padding: '6px 10px', background: '#eff6ff', color: C.accent, borderRadius: 6, fontSize: 13, cursor: 'pointer', minHeight: 32, display: 'inline-flex', alignItems: 'center' }}>{t}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 质控 */}
          <div style={s.leftSection}>
            <div style={s.leftSectionTitle} onClick={() => toggleSection('quality')}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <ShieldCheck size={14} /> 10 维质控
              </span>
              {openSections.quality ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </div>
            {openSections.quality && (
              <div style={s.leftSectionContent}>
                <div style={{ textAlign: 'center', padding: '8px 0' }}>
                  <div style={{ fontSize: 36, fontWeight: 800, color: qualityScore >= 90 ? C.success : C.warning, lineHeight: 1 }}>{qualityScore}</div>
                  <div style={{ fontSize: 12, color: C.textLight, marginTop: 4 }}>综合质控评分</div>
                </div>
                {['完整性', '规范性', '准确性', '及时性', '一致性'].map((q, i) => {
                  const score = [95, 88, 82, 90, 85][i]
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 4px', fontSize: 13 }}>
                      <span style={{ width: 60, color: C.textLight }}>{q}</span>
                      <div style={{ flex: 1, height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${score}%`, height: '100%', background: score >= 90 ? C.success : C.warning }} />
                      </div>
                      <span style={{ fontWeight: 600, color: score >= 90 ? C.success : C.warning, minWidth: 28, textAlign: 'right' as const }}>{score}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* AI */}
          <div style={s.leftSection}>
            <div style={s.leftSectionTitle} onClick={() => toggleSection('ai')}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={14} color={C.purple} /> AI 助手
              </span>
              {openSections.ai ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </div>
            {openSections.ai && (
              <div style={s.leftSectionContent}>
                {[
                  { icon: <Sparkles size={14} />, label: 'AI 一键生成报告', color: C.purple },
                  { icon: <Mic size={14} />, label: '语音转文字', color: C.accent },
                  { icon: <BookOpen size={14} />, label: '相似案例检索', color: C.success },
                  { icon: <Lightbulb size={14} />, label: '诊断建议', color: C.warning },
                ].map((a, i) => (
                  <div key={i} style={s.leftItem}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: a.color }}>{a.icon}</span>
                      <span>{a.label}</span>
                    </div>
                    <ChevronRight size={12} color={C.textLight} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 中栏 */}
        <div style={s.centerCol}>
          <div style={s.centerTabs}>
            <button style={centerTab === 'work' ? s.centerTabActive : s.centerTab} onClick={() => setCenterTab('work')}>
              <Edit3 size={14} /> 报告编辑
            </button>
            <button style={centerTab === 'preview' ? s.centerTabActive : s.centerTab} onClick={() => setCenterTab('preview')}>
              <FileText size={14} /> 预览
            </button>
            <button style={centerTab === 'compare' ? s.centerTabActive : s.centerTab} onClick={() => setCenterTab('compare')}>
              <GitBranch size={14} /> 历史对比
            </button>
            <button style={centerTab === 'version' ? s.centerTabActive : s.centerTab} onClick={() => setCenterTab('version')}>
              <ListChecks size={14} /> 版本 v3
            </button>
          </div>

          <div style={s.workArea}>
            {/* 影像区 */}
            <div style={s.imageArea}>
              <div style={s.imageToolbar}>
                <button style={s.imageToolBtn}><Ruler size={13} /> 距离</button>
                <button style={s.imageToolBtn}><Target size={13} /> 面积</button>
                <button style={s.imageToolBtn}><Crosshair size={13} /> 角度</button>
                <button style={s.imageToolBtn}><Edit3 size={13} /> 标注</button>
                <button style={s.imageToolBtn}><Camera size={13} /> 冻结</button>
                <button style={s.imageToolBtn}><Save size={13} /> 存图</button>
              </div>

              <div style={s.imageCanvas}>
                <span style={s.imageLabel}>📷 超声影像</span>
                <div style={{ textAlign: 'center', color: '#64748b' }}>
                  <Activity size={56} color="#475569" />
                  <div style={{ marginTop: 14, fontSize: 15, color: '#94a3b8' }}>实时超声影像</div>
                  <div style={{ marginTop: 4, fontSize: 13, color: '#64748b' }}>{currentProtocol.name}</div>
                </div>
                <span style={s.imageParams}>深度:{currentProtocol.depth}cm 增益:72 频率:{currentProtocol.frequency}</span>
              </div>

              <div style={s.imageThumb}>
                {IMAGE_THUMBS.map(t => (
                  <div key={t.id} style={t.active ? s.imageThumbActive : s.imageThumbItem} title={t.label}>
                    <Camera size={16} color={t.active ? C.accent : '#64748b'} />
                    <span style={{ position: 'absolute', bottom: 2, left: 4, right: 4, fontSize: 9, color: t.active ? C.accent : '#94a3b8', textAlign: 'center' as const, overflow: 'hidden' }}>{t.id}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 报告区 */}
            <div style={s.reportArea}>
              <div style={s.reportToolbar}>
                <button style={{ ...s.btn, ...s.btnPrimary, minHeight: 40, padding: '8px 14px', fontSize: 13 }}>
                  <Sparkles size={13} /> AI 生成
                </button>
                <button
                  style={{ ...s.btn, background: isRecording ? C.danger : C.accent, color: C.white, minHeight: 40, padding: '8px 14px', fontSize: 13 }}
                  onClick={() => setIsRecording(!isRecording)}
                >
                  {isRecording ? <MicOff size={13} /> : <Mic size={13} />} {isRecording ? '停止录音' : '语音输入'}
                </button>
                <button style={{ ...s.btn, ...s.btnOutline, minHeight: 40, padding: '8px 14px', fontSize: 13 }}>
                  <Image size={13} /> 插入影像
                </button>
                <button style={{ ...s.btn, ...s.btnOutline, minHeight: 40, padding: '8px 14px', fontSize: 13 }}>
                  <BookOpen size={13} /> 词库
                </button>
                <div style={{ flex: 1 }} />
                <button
                  style={{ ...s.btn, background: criticalValue ? C.danger : C.white, color: criticalValue ? C.white : C.textLight, border: `1px solid ${criticalValue ? C.danger : C.border}`, minHeight: 40, padding: '8px 14px', fontSize: 13 }}
                  onClick={() => setCriticalValue(!criticalValue)}
                >
                  <AlertTriangle size={13} /> {criticalValue ? '危急值已标记' : '标记危急值'}
                </button>
              </div>

              <div style={s.reportBody}>
                {/* 测量值 */}
                <div style={s.reportSection}>
                  <div style={s.reportSectionTitle}>
                    <span><Ruler size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} /> 测量值（自动从 DICOM 提取）</span>
                    <span style={{ fontSize: 12, color: C.textLight, fontWeight: 400 }}>共 8 项</span>
                  </div>
                  <table style={s.measurementTable}>
                    <thead>
                      <tr>
                        <th style={s.measurementTh}>项目</th>
                        <th style={s.measurementTh}>值</th>
                        <th style={s.measurementTh}>单位</th>
                        <th style={s.measurementTh}>参考</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MEASUREMENTS.map((m, i) => (
                        <tr key={i}>
                          <td style={s.measurementTd}>{m.name}</td>
                          <td style={{ ...s.measurementTd, fontWeight: 600, color: m.status === 'attention' ? C.warning : C.text }}>{m.value}</td>
                          <td style={s.measurementTd}>{m.unit}</td>
                          <td style={s.measurementTd}>{m.ref}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 超声所见 */}
                <div style={s.reportField}>
                  <div style={s.reportLabel}>
                    <FileText size={14} /> 超声所见
                    {isRecording && <span style={{ marginLeft: 8, padding: '2px 8px', borderRadius: 4, background: C.danger, color: C.white, fontSize: 11, fontWeight: 600 }}>● 录音中</span>}
                  </div>
                  <textarea
                    style={s.reportTextarea}
                    value={reportContent.findings}
                    onChange={e => setReportContent(p => ({ ...p, findings: e.target.value }))}
                    rows={5}
                  />
                </div>

                {/* 诊断 */}
                <div style={s.reportField}>
                  <div style={s.reportLabel}><Stethoscope size={14} /> 超声诊断</div>
                  <textarea
                    style={{ ...s.reportTextarea, fontWeight: 600, color: C.primary, fontSize: 16, minHeight: 60 }}
                    value={reportContent.diagnosis}
                    onChange={e => setReportContent(p => ({ ...p, diagnosis: e.target.value }))}
                    rows={2}
                  />
                </div>

                {/* 建议 */}
                <div style={s.reportField}>
                  <div style={s.reportLabel}><Lightbulb size={14} /> 诊断建议</div>
                  <textarea
                    style={s.reportTextarea}
                    value={reportContent.impression}
                    onChange={e => setReportContent(p => ({ ...p, impression: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 右栏 */}
        <div style={s.rightCol}>
          <div style={s.rightTabs}>
            <button style={rightTab === 'cdss' ? s.rightTabActive : s.rightTab} onClick={() => setRightTab('cdss')}>
              <Brain size={14} /> CDSS
            </button>
            <button style={rightTab === 'grading' ? s.rightTabActive : s.rightTab} onClick={() => setRightTab('grading')}>
              <Award size={14} /> 分级
            </button>
            <button style={rightTab === 'evidence' ? s.rightTabActive : s.rightTab} onClick={() => setRightTab('evidence')}>
              <BookMarked size={14} /> 循证
            </button>
            <button style={rightTab === 'drg' ? s.rightTabActive : s.rightTab} onClick={() => setRightTab('drg')}>
              <Network size={14} /> DRG
            </button>
          </div>

          <div style={s.rightBody}>
            {rightTab === 'cdss' && (
              <div>
                <div style={s.cdssCard}>
                  <div style={s.cdssLabel}><Brain size={12} /> 当前诊断分析</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.primary }}>{currentDisease.name}</div>
                  <div style={{ fontSize: 12, color: C.textLight, marginTop: 4 }}>ICD-10: {currentDisease.icd10}</div>
                </div>
                <div style={s.cdssCard}>
                  <div style={s.cdssLabel}><Target size={12} /> 鉴别诊断（Top 5）</div>
                  {currentDisease.differentialDiagnosis.map((d: any, i: number) => (
                    <div key={i} style={i === 0 ? s.cdssItemHigh : s.cdssItem}>
                      <span style={{ flex: 1 }}>{d.name}</span>
                      <span style={{ fontSize: 13, color: d.probability > 50 ? C.danger : C.warning, fontWeight: 700 }}>{d.probability}%</span>
                    </div>
                  ))}
                </div>
                <div style={s.cdssCard}>
                  <div style={s.cdssLabel}><AlertTriangle size={12} /> 漏诊风险提示</div>
                  <div style={s.cdssItemWarn}>
                    <AlertTriangle size={14} />
                    <span>建议补充：颈部淋巴结扫查</span>
                  </div>
                  <div style={s.cdssItemWarn}>
                    <AlertTriangle size={14} />
                    <span>建议检查：甲状腺功能（TSH/FT3/FT4）</span>
                  </div>
                </div>
                <div style={s.cdssCard}>
                  <div style={s.cdssLabel}><Check size={14} /> 决策建议</div>
                  <div style={s.cdssItem}>
                    <CheckCircle2 size={14} color={C.success} />
                    <span>建议 1：细针穿刺活检（FNA）</span>
                  </div>
                  <div style={s.cdssItem}>
                    <CheckCircle2 size={14} color={C.success} />
                    <span>建议 2：3-6 月后超声复查</span>
                  </div>
                  <div style={s.cdssItem}>
                    <CheckCircle2 size={14} color={C.accent} />
                    <span>建议 3：内分泌科会诊</span>
                  </div>
                </div>
              </div>
            )}

            {rightTab === 'grading' && (
              <div>
                <div style={s.cdssCard}>
                  <div style={s.cdssLabel}><Award size={12} /> 选择分级系统</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    {[
                      { key: 'TIRADS', label: 'TI-RADS', sub: '甲状腺' },
                      { key: 'BIRADS', label: 'BI-RADS', sub: '乳腺' },
                      { key: 'ORADS', label: 'O-RADS', sub: '卵巢' },
                      { key: 'LIRADS', label: 'LI-RADS', sub: '肝脏' },
                    ].map(g => (
                      <button
                        key={g.key}
                        style={selectedGrading === g.key ? s.gradeBtnActive : s.gradeBtn}
                        onClick={() => setSelectedGrading(g.key as any)}
                      >
                        <span style={{ fontSize: 14, fontWeight: 700 }}>{g.label}</span>
                        <span style={{ fontSize: 11, opacity: 0.8 }}>{g.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div style={s.cdssCard}>
                  <div style={s.cdssLabel}>
                    <span>{selectedGrading} 分级</span>
                    <span style={{ fontSize: 11, color: C.textLight, fontWeight: 400 }}>点击选择</span>
                  </div>
                  {currentGradingRules.map((g: any) => (
                    <div
                      key={g.level}
                      style={selectedGradeLevel === g.level ? s.gradeBtnActive : s.gradeBtn}
                      onClick={() => setSelectedGradeLevel(g.level)}
                    >
                      <span style={{ ...s.gradeLevel, background: g.color, color: C.white }}>{g.level}</span>
                      <span style={{ flex: 1, fontSize: 13 }}>{g.name}</span>
                      <span style={{ fontSize: 11, color: selectedGradeLevel === g.level ? 'rgba(255,255,255,0.8)' : C.textLight }}>{g.malignancy}</span>
                    </div>
                  ))}
                </div>
                <div style={s.cdssCard}>
                  <div style={s.cdssLabel}><Lightbulb size={12} /> 当前分级管理建议</div>
                  {(() => {
                    const cur = currentGradingRules.find((g: any) => g.level === selectedGradeLevel)
                    return cur ? (
                      <div style={{ padding: 12, background: '#eff6ff', borderRadius: 8, color: C.accent, fontWeight: 600, fontSize: 14, lineHeight: 1.6 }}>
                        {cur.management}
                        <div style={{ fontSize: 11, color: C.textLight, marginTop: 6, fontWeight: 400 }}>恶性概率: {cur.malignancy}</div>
                      </div>
                    ) : null
                  })()}
                  <button style={{ ...s.btn, ...s.btnPrimary, width: '100%', marginTop: 10, minHeight: 44 }}>
                    <ArrowRight size={14} /> 一键应用分级到报告
                  </button>
                </div>
              </div>
            )}

            {rightTab === 'evidence' && (
              <div>
                <div style={s.cdssCard}>
                  <div style={s.cdssLabel}><BookMarked size={12} /> 临床指南</div>
                  {EVIDENCE_GUIDELINES.slice(0, 3).map((g: any) => (
                    <div key={g.id} style={s.cdssItem}>
                      <FileText size={14} color={C.accent} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.title}</div>
                        <div style={{ fontSize: 11, color: C.textLight }}>{g.organization} · {g.year}</div>
                      </div>
                      <ExternalLink size={12} color={C.textLight} />
                    </div>
                  ))}
                </div>
                <div style={s.cdssCard}>
                  <div style={s.cdssLabel}><Database size={12} /> 关键文献</div>
                  {EVIDENCE_LITERATURE.slice(0, 3).map((l: any, i) => (
                    <div key={i} style={s.cdssItem}>
                      <Database size={14} color={C.success} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.title}</div>
                        <div style={{ fontSize: 11, color: C.textLight }}>{l.journal} · IF:{l.impactFactor}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {rightTab === 'drg' && (
              <div>
                <div style={s.cdssCard}>
                  <div style={s.cdssLabel}><Network size={12} /> DRG 智能匹配</div>
                  <div style={{ padding: 12, background: '#eff6ff', borderRadius: 8, marginBottom: 10 }}>
                    <div style={{ fontSize: 12, color: C.textLight }}>DRG 组</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: C.primary, fontFamily: 'monospace' }}>KS1</div>
                    <div style={{ fontSize: 13, color: C.text, marginTop: 4 }}>甲状腺疾病，伴合并症</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div style={{ padding: 8, background: C.white, borderRadius: 6, border: `1px solid ${C.border}` }}>
                      <div style={{ fontSize: 11, color: C.textLight }}>权重</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: C.primary }}>1.25</div>
                    </div>
                    <div style={{ padding: 8, background: C.white, borderRadius: 6, border: `1px solid ${C.border}` }}>
                      <div style={{ fontSize: 11, color: C.textLight }}>例均费用</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: C.primary }}>¥8,500</div>
                    </div>
                    <div style={{ padding: 8, background: C.white, borderRadius: 6, border: `1px solid ${C.border}` }}>
                      <div style={{ fontSize: 11, color: C.textLight }}>ICD-10</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.primary, fontFamily: 'monospace' }}>E04.901</div>
                    </div>
                    <div style={{ padding: 8, background: C.white, borderRadius: 6, border: `1px solid ${C.border}` }}>
                      <div style={{ fontSize: 11, color: C.textLight }}>ICD-9-CM-3</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.primary, fontFamily: 'monospace' }}>06.0101</div>
                    </div>
                  </div>
                </div>
                <div style={s.cdssCard}>
                  <div style={s.cdssLabel}><CheckCircle2 size={12} /> 入组状态</div>
                  <div style={{ ...s.cdssItem, background: '#f0fdf4', border: '1px solid #bbf7d0', color: C.success, fontWeight: 600 }}>
                    <CheckCircle2 size={14} />
                    <span>入组成功 · 偏差 -3.2%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 状态栏 */}
      <div style={s.statusbar}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <span style={s.statusbarItem}><CheckCircle2 size={12} /> 已保存</span>
          <span style={s.statusbarItem}>字数: {reportContent.findings.length + reportContent.diagnosis.length + reportContent.impression.length}</span>
          <span style={s.statusbarItem}><Image size={12} /> 3 张影像</span>
          <span style={s.statusbarItem}><Ruler size={12} /> 8 个测量</span>
          <span style={s.statusbarItem}>v3 / 3 版本</span>
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {criticalValue && (
            <span style={{ ...s.statusbarItem, color: '#fca5a5', fontWeight: 700 }}>
              <AlertTriangle size={12} /> 危急值已标记
            </span>
          )}
          <span style={s.statusbarItem}><Sparkles size={12} /> AI 辅助: ON</span>
          <span style={s.statusbarItem}><Network size={12} /> DRG: KS1</span>
          <span style={s.statusbarItem}>质控: {qualityScore}</span>
        </div>
      </div>
    </div>
  )
}
