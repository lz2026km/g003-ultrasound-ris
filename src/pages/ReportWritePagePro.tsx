/**
 * 超声报告工作站 - 工作区最大化版
 * @version v0.18.3
 *
 * 1920×1080 像素级优化（最大化工作区）
 * - 顶栏 56px（极简）
 * - 状态栏 32px（极简）
 * - 工作区 992px（最大化）
 *   - 左 220 + 中 1320 + 右 380 = 1920
 *   - 中栏：影像 35% + 报告 65% = 462 + 858
 *
 * 设计：让"主操作区"（报告编辑）占据最大空间
 */

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FileText, Stethoscope, Activity, BookOpen, History, ShieldCheck,
  Save, Printer, Send, Mic, MicOff, Camera, Ruler, Image, Type,
  ChevronDown, ChevronRight, Sparkles, AlertTriangle,
  Brain, Award, Network, BookMarked, Target, Lightbulb, ExternalLink,
  Database, ListChecks, GitBranch, CheckCircle2,
  ArrowRight, Crosshair, Edit3, Home, Check
} from 'lucide-react'

import { TIRADS_RULES, BIRADS_RULES, ORADS_RULES, LIRADS_RULES } from '../data/report-workspace/grading-rules'
import { ULTRASOUND_PROTOCOLS } from '../data/report-workspace/protocols'
import { DISEASE_KNOWLEDGE } from '../data/report-workspace/knowledge-graph'
import { EVIDENCE_GUIDELINES, EVIDENCE_LITERATURE } from '../data/report-workspace/evidence-medicine'

const C = {
  primary: '#1a365d', accent: '#2563eb', success: '#059669',
  warning: '#d97706', danger: '#dc2626', white: '#fff', bg: '#f8fafc',
  border: '#e2e8f0', text: '#1a365c', textLight: '#64748b',
  purple: '#7c3aed',
}

// 1920×1080 像素级：每个尺寸都精打细算
const s: Record<string, React.CSSProperties> = {
  // 全屏覆盖
  root: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', background: '#f0f4f8', fontSize: 15, fontFamily: '"Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif', overflow: 'hidden', zIndex: 9999 },

  // 顶栏 1920×56（极简）
  topbar: { background: C.primary, color: C.white, padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', zIndex: 100, flexShrink: 0, height: 56 },
  topbarLeft: { display: 'flex', alignItems: 'center', gap: 10 },
  topbarRight: { display: 'flex', alignItems: 'center', gap: 8 },
  // 顶栏按钮 32px 高（极简但可点）
  btnSm: { padding: '5px 12px', borderRadius: 6, border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, minHeight: 32, justifyContent: 'center' },
  btnBack: { background: 'rgba(255,255,255,0.15)', color: C.white, border: '1px solid rgba(255,255,255,0.3)' },
  btnSuccess: { background: C.success, color: C.white },
  btnPrimary: { background: C.accent, color: C.white },
  btnOutline: { background: C.white, color: C.primary, border: `1px solid ${C.border}` },

  reportId: { fontSize: 14, fontWeight: 700, color: C.white, fontFamily: 'monospace' },
  patientChip: { padding: '4px 10px', background: 'rgba(255,255,255,0.15)', borderRadius: 6, fontSize: 13, color: C.white, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5 },
  statusChip: { padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600 },
  scoreChip: { padding: '3px 10px', borderRadius: 6, fontSize: 13, fontWeight: 700, color: C.white },

  cols: { display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 },

  // 左栏 220px（窄）
  leftCol: { width: 220, background: C.white, borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 },
  leftSection: { borderBottom: `1px solid ${C.border}`, overflow: 'hidden' },
  leftSectionTitle: { padding: '8px 12px', fontSize: 12, fontWeight: 700, color: C.textLight, textTransform: 'uppercase' as const, letterSpacing: 0.8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fafbfc', cursor: 'pointer', userSelect: 'none' as const, minHeight: 34 },
  leftSectionContent: { padding: '3px 6px 6px', maxHeight: 180, overflowY: 'auto' as const },
  leftItem: { padding: '6px 8px', borderRadius: 5, fontSize: 13, color: C.text, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 1, minHeight: 32 },
  leftItemActive: { padding: '6px 8px', borderRadius: 5, fontSize: 13, color: C.primary, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 1, background: '#eff6ff', fontWeight: 600, minHeight: 32 },
  leftItemTag: { fontSize: 10, padding: '1px 5px', borderRadius: 3, background: C.primary, color: C.white, fontWeight: 600 },

  // 中栏 1320px（最大）
  centerCol: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: C.bg, minWidth: 0 },
  centerTabs: { display: 'flex', gap: 2, padding: '0 8px', background: C.white, borderBottom: `1px solid ${C.border}`, flexShrink: 0 },
  centerTab: { padding: '8px 14px', fontSize: 13, color: C.textLight, cursor: 'pointer', border: 'none', background: 'transparent', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5, borderBottom: '2px solid transparent', marginBottom: -1 },
  centerTabActive: { padding: '8px 14px', fontSize: 13, color: C.primary, cursor: 'pointer', border: 'none', background: 'transparent', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5, borderBottom: `2px solid ${C.primary}` },

  workArea: { display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 },

  // 影像区 35%（紧凑）
  imageArea: { width: '35%', background: '#0f172a', display: 'flex', flexDirection: 'column', position: 'relative', minWidth: 0 },
  imageToolbar: { padding: '6px 10px', background: '#1e293b', display: 'flex', gap: 4, alignItems: 'center', borderBottom: '1px solid #334155', flexWrap: 'wrap' as const, flexShrink: 0 },
  imageToolBtn: { padding: '4px 8px', borderRadius: 4, fontSize: 12, color: '#cbd5e1', cursor: 'pointer', border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', gap: 3, minHeight: 28 },
  imageCanvas: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', minHeight: 200 },
  imageLabel: { position: 'absolute', top: 8, left: 12, color: '#94a3b8', fontSize: 12, fontWeight: 600, zIndex: 1 },
  imageParams: { position: 'absolute', bottom: 8, right: 12, color: '#10b981', fontSize: 11, fontFamily: 'monospace', zIndex: 1 },
  imageThumb: { padding: 6, background: '#1e293b', borderTop: '1px solid #334155', display: 'flex', gap: 5, overflowX: 'auto' as const, flexShrink: 0 },
  imageThumbItem: { width: 60, height: 44, background: '#0f172a', borderRadius: 3, flexShrink: 0, border: `1px solid #334155`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', cursor: 'pointer' },
  imageThumbActive: { width: 60, height: 44, background: '#1e293b', borderRadius: 3, flexShrink: 0, border: `2px solid ${C.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', cursor: 'pointer' },

  // 报告编辑区 65%（**最大**，主操作区）
  reportArea: { flex: 1, display: 'flex', flexDirection: 'column', background: C.white, overflow: 'hidden', minWidth: 0 },
  reportToolbar: { padding: '6px 10px', background: '#f8fafc', borderBottom: `1px solid ${C.border}`, display: 'flex', gap: 6, flexWrap: 'wrap' as const, flexShrink: 0 },
  // 报告主体：宽松，留白足
  reportBody: { flex: 1, padding: 16, overflowY: 'auto' as const, display: 'flex', flexDirection: 'column', gap: 12 },
  reportField: {},
  reportLabel: { fontSize: 14, fontWeight: 600, color: C.textLight, marginBottom: 5, display: 'flex', alignItems: 'center', gap: 5 },
  reportInput: { width: '100%', padding: '8px 12px', borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 15, outline: 'none', boxSizing: 'border-box' as const, minHeight: 40 },
  reportTextarea: { width: '100%', padding: '10px 12px', borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 15, outline: 'none', resize: 'vertical' as const, fontFamily: 'inherit', boxSizing: 'border-box' as const, lineHeight: 1.7 },
  reportSection: { padding: 12, background: '#fafbfc', borderRadius: 8, border: `1px solid ${C.border}` },
  reportSectionTitle: { fontSize: 14, fontWeight: 700, color: C.primary, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  measurementTable: { width: '100%', fontSize: 13, borderCollapse: 'collapse' as const },
  measurementTh: { padding: '6px 8px', textAlign: 'left' as const, fontWeight: 600, color: C.textLight, background: '#f1f5f9', borderBottom: `1px solid ${C.border}` },
  measurementTd: { padding: '6px 8px', borderBottom: `1px solid ${C.border}`, color: C.text },

  // 右栏 380px
  rightCol: { width: 380, background: C.white, borderLeft: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 },
  rightTabs: { display: 'flex', borderBottom: `1px solid ${C.border}`, background: '#fafbfc', flexShrink: 0 },
  rightTab: { flex: 1, padding: '10px 4px', fontSize: 13, color: C.textLight, cursor: 'pointer', border: 'none', background: 'transparent', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, borderBottom: '2px solid transparent' },
  rightTabActive: { flex: 1, padding: '10px 4px', fontSize: 13, color: C.primary, cursor: 'pointer', border: 'none', background: C.white, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, borderBottom: `2px solid ${C.primary}` },
  rightBody: { flex: 1, padding: 12, overflowY: 'auto' as const },

  cdssCard: { padding: 10, background: '#f8fafc', borderRadius: 6, marginBottom: 8, border: `1px solid ${C.border}` },
  cdssLabel: { fontSize: 12, fontWeight: 700, color: C.textLight, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4, textTransform: 'uppercase' as const, letterSpacing: 0.5 },
  cdssItem: { padding: '7px 9px', background: C.white, borderRadius: 5, marginBottom: 4, fontSize: 13, color: C.text, display: 'flex', alignItems: 'center', gap: 6, border: `1px solid ${C.border}`, minHeight: 34 },
  cdssItemHigh: { padding: '7px 9px', background: '#fef2f2', borderRadius: 5, marginBottom: 4, fontSize: 13, color: C.danger, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, border: '1px solid #fecaca', minHeight: 34 },
  cdssItemWarn: { padding: '7px 9px', background: '#fff7ed', borderRadius: 5, marginBottom: 4, fontSize: 13, color: C.warning, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, border: '1px solid #fed7aa', minHeight: 34 },

  gradeBtn: { padding: '8px 10px', borderRadius: 6, fontSize: 13, color: C.text, cursor: 'pointer', border: `1px solid ${C.border}`, marginBottom: 4, background: C.white, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, minHeight: 38 },
  gradeBtnActive: { padding: '8px 10px', borderRadius: 6, fontSize: 13, color: C.white, cursor: 'pointer', border: `2px solid ${C.primary}`, marginBottom: 4, background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, fontWeight: 600, minHeight: 38 },
  gradeLevel: { fontWeight: 700, fontSize: 13, padding: '3px 8px', borderRadius: 4, minWidth: 36, textAlign: 'center' as const },

  // 状态栏 32px（极简）
  statusbar: { background: C.primary, color: C.white, padding: '6px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, height: 32, fontSize: 12 },
  statusbarItem: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, opacity: 0.95 },
}

const CURRENT_PATIENT = { id: 'P2026-0528', name: '王秀珍', age: 52, gender: '女', exam: '甲状腺US' }
const HISTORY_REPORTS = [
  { id: 'R2024-1205', date: '2024-12', diagnosis: 'TI-RADS 3' },
  { id: 'R2025-0612', date: '2025-06', diagnosis: 'TI-RADS 3 稳定' },
  { id: 'R2025-1210', date: '2025-12', diagnosis: 'TI-RADS 3 1.2cm' },
]
const IMAGE_THUMBS = [
  { id: 1, label: '横切-右', active: false },
  { id: 2, label: '纵切-右', active: true },
  { id: 3, label: '横切-左', active: false },
  { id: 4, label: 'CDFI', active: false },
  { id: 5, label: '弹性', active: false },
]
const MEASUREMENTS = [
  { name: '右叶 长径', value: '4.8', unit: 'cm', ref: '<5.0' },
  { name: '右叶 宽径', value: '1.8', unit: 'cm', ref: '<2.0' },
  { name: '右叶 厚径', value: '1.6', unit: 'cm', ref: '<2.0' },
  { name: '左叶 长径', value: '4.6', unit: 'cm', ref: '<5.0' },
  { name: '左叶 宽径', value: '1.7', unit: 'cm', ref: '<2.0' },
  { name: '左叶 厚径', value: '1.5', unit: 'cm', ref: '<2.0' },
  { name: '峡部', value: '0.4', unit: 'cm', ref: '<0.5' },
  { name: '右结节 长', value: '1.5', unit: 'cm', ref: '-', attention: true },
  { name: '右结节 宽', value: '1.1', unit: 'cm', ref: '-', attention: true },
  { name: '右结节 厚', value: '0.9', unit: 'cm', ref: '-', attention: true },
]

export default function ReportWritePagePro() {
  const navigate = useNavigate()
  const [rightTab, setRightTab] = useState('cdss')
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    protocol: true, template: true, history: true, term: false, quality: true, ai: true
  })
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
  const currentGradingRules = selectedGrading === 'TIRADS' ? TIRADS_RULES : selectedGrading === 'BIRADS' ? BIRADS_RULES : selectedGrading === 'ORADS' ? ORADS_RULES : LIRADS_RULES
  const currentProtocol = ULTRASOUND_PROTOCOLS[0]
  const toggleSection = (k: string) => setOpenSections(p => ({ ...p, [k]: !p[k] }))

  return (
    <div style={s.root}>
      {/* ===== 顶栏 56px（极简） ===== */}
      <div style={s.topbar}>
        <div style={s.topbarLeft}>
          <button style={{ ...s.btnSm, ...s.btnBack }} onClick={() => navigate('/')} title="返回主界面">
            <Home size={14} /> 返回
          </button>
          <div style={{ width: 1, height: 22, background: 'rgba(255,255,255,0.3)', margin: '0 4px' }} />
          <div style={s.reportId}>RPT-2026-0605-001</div>
          <span style={s.patientChip}><FileText size={13} /> {CURRENT_PATIENT.name} | {CURRENT_PATIENT.age}岁 {CURRENT_PATIENT.gender}</span>
          <span style={{ ...s.statusChip, background: '#fef3c7', color: C.warning }}>● 书写中</span>
          <span style={{ ...s.scoreChip, background: qualityScore >= 90 ? C.success : C.warning }}>质控 {qualityScore}</span>
        </div>
        <div style={s.topbarRight}>
          <button style={{ ...s.btnSm, ...s.btnBack }}><History size={13} /> v3</button>
          <button style={{ ...s.btnSm, ...s.btnBack }}><Printer size={13} /> 打印</button>
          <button style={{ ...s.btnSm, ...s.btnBack }}><Save size={13} /> 暂存</button>
          <button style={{ ...s.btnSm, ...s.btnSuccess }}><Send size={13} /> 提交审核</button>
        </div>
      </div>

      {/* ===== 三栏（最大化工作区） ===== */}
      <div style={s.cols}>
        {/* 左栏 220px（窄） */}
        <div style={s.leftCol}>
          <div style={s.leftSection}>
            <div style={s.leftSectionTitle} onClick={() => toggleSection('protocol')}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Target size={12} /> 协议</span>
              {openSections.protocol ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </div>
            {openSections.protocol && (
              <div style={s.leftSectionContent}>
                {ULTRASOUND_PROTOCOLS.slice(0, 4).map((p, i) => (
                  <div key={i} style={i === 0 ? s.leftItemActive : s.leftItem}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, flex: 1, overflow: 'hidden' }}>
                      <Activity size={12} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={s.leftSection}>
            <div style={s.leftSectionTitle} onClick={() => toggleSection('template')}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><FileText size={12} /> 模板</span>
              {openSections.template ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </div>
            {openSections.template && (
              <div style={s.leftSectionContent}>
                {['甲状腺常规', '腹部常规', '心脏超声', '妇产科', '血管超声'].map((t, i) => (
                  <div key={i} style={i === 0 ? s.leftItemActive : s.leftItem}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{t}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={s.leftSection}>
            <div style={s.leftSectionTitle} onClick={() => toggleSection('history')}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><History size={12} /> 历史</span>
              {openSections.history ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </div>
            {openSections.history && (
              <div style={s.leftSectionContent}>
                {HISTORY_REPORTS.map((h, i) => (
                  <div key={i} style={s.leftItem}>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.primary, fontFamily: 'monospace' }}>{h.id}</div>
                      <div style={{ fontSize: 11, color: C.textLight, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.diagnosis}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={s.leftSection}>
            <div style={s.leftSectionTitle} onClick={() => toggleSection('quality')}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><ShieldCheck size={12} /> 质控 {qualityScore}</span>
              {openSections.quality ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </div>
            {openSections.quality && (
              <div style={s.leftSectionContent}>
                <div style={{ textAlign: 'center', padding: '6px 0 8px' }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: qualityScore >= 90 ? C.success : C.warning, lineHeight: 1 }}>{qualityScore}</div>
                </div>
                {['完整性', '规范性', '准确性', '及时性', '一致性', '影像关联', '测量完整', '诊断明确', '建议合理', '危急值'].map((q, i) => {
                  const score = [95, 88, 82, 90, 85, 80, 92, 90, 78, 100][i]
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 2px', fontSize: 11 }}>
                      <span style={{ width: 48, color: C.textLight }}>{q}</span>
                      <div style={{ flex: 1, height: 4, background: '#e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ width: `${score}%`, height: '100%', background: score >= 90 ? C.success : C.warning }} />
                      </div>
                      <span style={{ fontWeight: 600, color: score >= 90 ? C.success : C.warning, minWidth: 22, textAlign: 'right' as const, fontSize: 11 }}>{score}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div style={s.leftSection}>
            <div style={s.leftSectionTitle} onClick={() => toggleSection('ai')}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Sparkles size={12} color={C.purple} /> AI</span>
              {openSections.ai ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </div>
            {openSections.ai && (
              <div style={s.leftSectionContent}>
                {[
                  { icon: <Sparkles size={12} />, label: 'AI 生成报告', color: C.purple },
                  { icon: <Mic size={12} />, label: '语音转文字', color: C.accent },
                  { icon: <Lightbulb size={12} />, label: '诊断建议', color: C.warning },
                ].map((a, i) => (
                  <div key={i} style={s.leftItem}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ color: a.color }}>{a.icon}</span>
                      <span>{a.label}</span>
                    </div>
                    <ChevronRight size={10} color={C.textLight} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 中栏 1320px（**最大**） */}
        <div style={s.centerCol}>
          <div style={s.workArea}>
            {/* 影像区 35% */}
            <div style={s.imageArea}>
              <div style={s.imageToolbar}>
                <button style={s.imageToolBtn}><Ruler size={12} /> 距离</button>
                <button style={s.imageToolBtn}><Target size={12} /> 面积</button>
                <button style={s.imageToolBtn}><Crosshair size={12} /> 角度</button>
                <button style={s.imageToolBtn}><Edit3 size={12} /> 标注</button>
                <button style={s.imageToolBtn}><Type size={12} /> 文字</button>
                <div style={{ width: 1, height: 16, background: '#334155' }} />
                <button style={s.imageToolBtn}><Camera size={12} /> 冻结</button>
                <button style={s.imageToolBtn}><Save size={12} /> 存图</button>
              </div>

              <div style={s.imageCanvas}>
                <span style={s.imageLabel}>📷 超声影像</span>
                <div style={{ textAlign: 'center', color: '#64748b' }}>
                  <Activity size={48} color="#475569" />
                  <div style={{ marginTop: 10, fontSize: 15, color: '#94a3b8' }}>实时超声影像</div>
                  <div style={{ marginTop: 3, fontSize: 12, color: '#64748b' }}>{currentProtocol.name}</div>
                </div>
                <span style={s.imageParams}>深度:{currentProtocol.depth}cm 增益:72</span>
              </div>

              <div style={s.imageThumb}>
                {IMAGE_THUMBS.map(t => (
                  <div key={t.id} style={t.active ? s.imageThumbActive : s.imageThumbItem} title={t.label}>
                    <Camera size={14} color={t.active ? C.accent : '#64748b'} />
                  </div>
                ))}
              </div>
            </div>

            {/* 报告区 65%（**最大**） */}
            <div style={s.reportArea}>
              <div style={s.reportToolbar}>
                <button style={{ ...s.btnSm, ...s.btnPrimary }}>
                  <Sparkles size={13} /> AI 生成
                </button>
                <button
                  style={{ ...s.btnSm, background: isRecording ? C.danger : C.accent, color: C.white, border: 'none' }}
                  onClick={() => setIsRecording(!isRecording)}
                >
                  {isRecording ? <MicOff size={13} /> : <Mic size={13} />} {isRecording ? '停止' : '语音'}
                </button>
                <button style={{ ...s.btnSm, ...s.btnOutline }}><Image size={13} /> 插图</button>
                <button style={{ ...s.btnSm, ...s.btnOutline }}><BookOpen size={13} /> 词库</button>
                <div style={{ flex: 1 }} />
                <button
                  style={{ ...s.btnSm, background: criticalValue ? C.danger : C.white, color: criticalValue ? C.white : C.textLight, border: `1px solid ${criticalValue ? C.danger : C.border}` }}
                  onClick={() => setCriticalValue(!criticalValue)}
                >
                  <AlertTriangle size={13} /> {criticalValue ? '危急值 ✓' : '危急值'}
                </button>
              </div>

              <div style={s.reportBody}>
                {/* 测量值 - 紧凑但清晰 */}
                <div style={s.reportSection}>
                  <div style={s.reportSectionTitle}>
                    <span><Ruler size={13} style={{ display: 'inline', marginRight: 5, verticalAlign: 'middle' }} /> 测量值（自动从 DICOM）· 10 项</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4 }}>
                    {MEASUREMENTS.map((m, i) => (
                      <div key={i} style={{ padding: '6px 8px', background: C.white, borderRadius: 4, border: `1px solid ${C.border}` }}>
                        <div style={{ fontSize: 11, color: C.textLight, marginBottom: 2 }}>{m.name}</div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                          <span style={{ fontSize: 15, fontWeight: 700, color: m.attention ? C.warning : C.primary }}>{m.value}</span>
                          <span style={{ fontSize: 11, color: C.textLight }}>{m.unit}</span>
                          <span style={{ fontSize: 10, color: C.textLight, marginLeft: 'auto' }}>{m.ref}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 超声所见 - 大输入框 */}
                <div style={s.reportField}>
                  <div style={s.reportLabel}>
                    <FileText size={14} /> 超声所见
                    {isRecording && <span style={{ marginLeft: 8, padding: '2px 8px', borderRadius: 4, background: C.danger, color: C.white, fontSize: 11, fontWeight: 600 }}>● 录音中</span>}
                  </div>
                  <textarea
                    style={{ ...s.reportTextarea, minHeight: 100 }}
                    value={reportContent.findings}
                    onChange={e => setReportContent(p => ({ ...p, findings: e.target.value }))}
                    rows={4}
                  />
                </div>

                {/* 诊断 - 突出显示 */}
                <div style={s.reportField}>
                  <div style={s.reportLabel}><Stethoscope size={14} /> 超声诊断</div>
                  <textarea
                    style={{ ...s.reportTextarea, fontWeight: 600, color: C.primary, fontSize: 16, minHeight: 50 }}
                    value={reportContent.diagnosis}
                    onChange={e => setReportContent(p => ({ ...p, diagnosis: e.target.value }))}
                    rows={2}
                  />
                </div>

                {/* 建议 */}
                <div style={s.reportField}>
                  <div style={s.reportLabel}><Lightbulb size={14} /> 诊断建议</div>
                  <textarea
                    style={{ ...s.reportTextarea, minHeight: 60 }}
                    value={reportContent.impression}
                    onChange={e => setReportContent(p => ({ ...p, impression: e.target.value }))}
                    rows={2}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 右栏 380px */}
        <div style={s.rightCol}>
          <div style={s.rightTabs}>
            <button style={rightTab === 'cdss' ? s.rightTabActive : s.rightTab} onClick={() => setRightTab('cdss')}><Brain size={12} /> CDSS</button>
            <button style={rightTab === 'grading' ? s.rightTabActive : s.rightTab} onClick={() => setRightTab('grading')}><Award size={12} /> 分级</button>
            <button style={rightTab === 'evidence' ? s.rightTabActive : s.rightTab} onClick={() => setRightTab('evidence')}><BookMarked size={12} /> 循证</button>
            <button style={rightTab === 'drg' ? s.rightTabActive : s.rightTab} onClick={() => setRightTab('drg')}><Network size={12} /> DRG</button>
          </div>

          <div style={s.rightBody}>
            {rightTab === 'cdss' && (
              <div>
                <div style={s.cdssCard}>
                  <div style={s.cdssLabel}><Brain size={12} /> 当前诊断</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.primary }}>{currentDisease.name}</div>
                  <div style={{ fontSize: 11, color: C.textLight, marginTop: 3 }}>ICD-10: {currentDisease.icd10}</div>
                </div>
                <div style={s.cdssCard}>
                  <div style={s.cdssLabel}><Target size={12} /> 鉴别诊断 Top 5</div>
                  {currentDisease.differentialDiagnosis.map((d: any, i: number) => (
                    <div key={i} style={i === 0 ? s.cdssItemHigh : s.cdssItem}>
                      <span style={{ flex: 1 }}>{d.name}</span>
                      <span style={{ fontSize: 13, color: d.probability > 50 ? C.danger : C.warning, fontWeight: 700 }}>{d.probability}%</span>
                    </div>
                  ))}
                </div>
                <div style={s.cdssCard}>
                  <div style={s.cdssLabel}><AlertTriangle size={12} /> 漏诊风险</div>
                  <div style={s.cdssItemWarn}><AlertTriangle size={13} /><span>颈部淋巴结扫查</span></div>
                  <div style={s.cdssItemWarn}><AlertTriangle size={13} /><span>甲状腺功能检查</span></div>
                </div>
                <div style={s.cdssCard}>
                  <div style={s.cdssLabel}><Check size={13} /> 决策建议</div>
                  <div style={s.cdssItem}><CheckCircle2 size={13} color={C.success} /><span>细针穿刺活检（FNA）</span></div>
                  <div style={s.cdssItem}><CheckCircle2 size={13} color={C.success} /><span>3-6 月后复查</span></div>
                  <div style={s.cdssItem}><CheckCircle2 size={13} color={C.accent} /><span>内分泌科会诊</span></div>
                </div>
              </div>
            )}

            {rightTab === 'grading' && (
              <div>
                <div style={s.cdssCard}>
                  <div style={s.cdssLabel}><Award size={12} /> 分级系统</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
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
                        <span style={{ fontSize: 13, fontWeight: 700 }}>{g.label}</span>
                        <span style={{ fontSize: 10, opacity: 0.8 }}>{g.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div style={s.cdssCard}>
                  <div style={s.cdssLabel}>{selectedGrading} 分级</div>
                  {currentGradingRules.map((g: any) => (
                    <div
                      key={g.level}
                      style={selectedGradeLevel === g.level ? s.gradeBtnActive : s.gradeBtn}
                      onClick={() => setSelectedGradeLevel(g.level)}
                    >
                      <span style={{ ...s.gradeLevel, background: g.color, color: C.white }}>{g.level}</span>
                      <span style={{ flex: 1, fontSize: 12 }}>{g.name}</span>
                      <span style={{ fontSize: 10, color: selectedGradeLevel === g.level ? 'rgba(255,255,255,0.85)' : C.textLight }}>{g.malignancy}</span>
                    </div>
                  ))}
                </div>
                <div style={s.cdssCard}>
                  <div style={s.cdssLabel}><Lightbulb size={12} /> 建议</div>
                  {(() => {
                    const cur = currentGradingRules.find((g: any) => g.level === selectedGradeLevel)
                    return cur ? (
                      <div style={{ padding: 10, background: '#eff6ff', borderRadius: 6, color: C.accent, fontWeight: 600, fontSize: 13, lineHeight: 1.5 }}>
                        {cur.management}
                        <div style={{ fontSize: 10, color: C.textLight, marginTop: 4, fontWeight: 400 }}>恶性概率: {cur.malignancy}</div>
                      </div>
                    ) : null
                  })()}
                  <button style={{ ...s.btnSm, ...s.btnPrimary, width: '100%', marginTop: 8 }}>
                    <ArrowRight size={13} /> 一键应用
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
                      <FileText size={13} color={C.accent} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.title}</div>
                        <div style={{ fontSize: 10, color: C.textLight }}>{g.organization} · {g.year}</div>
                      </div>
                      <ExternalLink size={11} color={C.textLight} />
                    </div>
                  ))}
                </div>
                <div style={s.cdssCard}>
                  <div style={s.cdssLabel}><Database size={12} /> 关键文献</div>
                  {EVIDENCE_LITERATURE.slice(0, 3).map((l: any, i) => (
                    <div key={i} style={s.cdssItem}>
                      <Database size={13} color={C.success} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.title}</div>
                        <div style={{ fontSize: 10, color: C.textLight }}>IF:{l.impactFactor}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {rightTab === 'drg' && (
              <div>
                <div style={s.cdssCard}>
                  <div style={s.cdssLabel}><Network size={12} /> DRG 匹配</div>
                  <div style={{ padding: 10, background: '#eff6ff', borderRadius: 6, marginBottom: 8 }}>
                    <div style={{ fontSize: 11, color: C.textLight }}>DRG 组</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: C.primary, fontFamily: 'monospace' }}>KS1</div>
                    <div style={{ fontSize: 12, color: C.text, marginTop: 3 }}>甲状腺疾病，伴合并症</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    <div style={{ padding: 8, background: C.white, borderRadius: 5, border: `1px solid ${C.border}` }}>
                      <div style={{ fontSize: 10, color: C.textLight }}>权重</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: C.primary }}>1.25</div>
                    </div>
                    <div style={{ padding: 8, background: C.white, borderRadius: 5, border: `1px solid ${C.border}` }}>
                      <div style={{ fontSize: 10, color: C.textLight }}>例均费用</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: C.primary }}>¥8,500</div>
                    </div>
                    <div style={{ padding: 8, background: C.white, borderRadius: 5, border: `1px solid ${C.border}` }}>
                      <div style={{ fontSize: 10, color: C.textLight }}>ICD-10</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.primary, fontFamily: 'monospace' }}>E04.901</div>
                    </div>
                    <div style={{ padding: 8, background: C.white, borderRadius: 5, border: `1px solid ${C.border}` }}>
                      <div style={{ fontSize: 10, color: C.textLight }}>ICD-9-CM-3</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.primary, fontFamily: 'monospace' }}>06.0101</div>
                    </div>
                  </div>
                </div>
                <div style={s.cdssCard}>
                  <div style={s.cdssLabel}><CheckCircle2 size={12} /> 入组状态</div>
                  <div style={{ ...s.cdssItem, background: '#f0fdf4', border: '1px solid #bbf7d0', color: C.success, fontWeight: 600 }}>
                    <CheckCircle2 size={13} /><span>入组成功 · 偏差 -3.2%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== 状态栏 32px（极简） ===== */}
      <div style={s.statusbar}>
        <div style={{ display: 'flex', gap: 16 }}>
          <span style={s.statusbarItem}><CheckCircle2 size={11} /> 已保存</span>
          <span style={s.statusbarItem}>字数: {reportContent.findings.length + reportContent.diagnosis.length + reportContent.impression.length}</span>
          <span style={s.statusbarItem}><Image size={11} /> 3 张影像</span>
          <span style={s.statusbarItem}><Ruler size={11} /> 10 测量</span>
          <span style={s.statusbarItem}>v3</span>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          {criticalValue && <span style={{ ...s.statusbarItem, color: '#fca5a5', fontWeight: 700 }}><AlertTriangle size={11} /> 危急值</span>}
          <span style={s.statusbarItem}>AI: ON</span>
          <span style={s.statusbarItem}>DRG: KS1</span>
          <span style={s.statusbarItem}>质控: {qualityScore}</span>
        </div>
      </div>
    </div>
  )
}
