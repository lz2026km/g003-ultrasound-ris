/**
 * 超声报告工作站 - 专业版
 * @version v0.17.0
 * @description 对标8大厂家（联影/东软/蓝网/开立/岱嘉/卫宁/东华/祥生）
 *
 * 3栏式专业工作站：
 * - 左栏：协议+模板+词库+历史+质控+AI
 * - 中栏：影像+报告+工具栏+测量+缩略图
 * - 右栏：CDSS+分级+决策建议+循证医学
 *
 * 8大核心能力：
 * 1. AI智能协议管理（对标开立SonoAssistant）
 * 2. 多模态报告融合（对标联影AIStream）
 * 3. 报告知识图谱+CDSS（对标东华iMedical）
 * 4. DRG/DIP智能联动（对标卫宁WiNEX）
 * 5. 10维报告质控引擎（对标东软US-RIS）
 * 6. 国际标准分级（对标卫宁/联影）
 * 7. 危急值+随访联动（对标东软）
 * 8. 报告版本控制+对比（对标岱嘉/联影）
 */

import React, { useState, useEffect, useRef } from 'react'
import {
  FileText, Brain, Stethoscope, Activity, BookOpen, History, ShieldCheck,
  Image, Mic, Save, Printer, Send, ChevronDown, ChevronRight, Sparkles,
  Plus, Search, Camera, Ruler, Type, Layers, GitBranch, Award, AlertCircle,
  Heart, Eye, Edit3, EyeOff, MicOff, Volume2, Database, BarChart3, Target,
  Clock, TrendingUp, Tag, Filter, Download, Upload, Settings, X, Check,
  Database as DatabaseIcon, Lightbulb, Network, ListChecks, FileCheck,
  Crosshair, MapPin, Zap, BookMarked, Link, ExternalLink, RefreshCw,
  CheckCircle2, AlertTriangle, ArrowRight, Cpu
} from 'lucide-react'

// 引入数据
import {
  TIRADS_RULES, BIRADS_RULES, ORADS_RULES, LIRADS_RULES
} from '../data/report-workspace/grading-rules'
import {
  ULTRASOUND_PROTOCOLS
} from '../data/report-workspace/protocols'
import {
  DISEASE_KNOWLEDGE
} from '../data/report-workspace/knowledge-graph'
import {
  EVIDENCE_GUIDELINES, EVIDENCE_LITERATURE
} from '../data/report-workspace/evidence-medicine'

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
  teal: '#0d9488',
  orange: '#ea580c',
}

const s: Record<string, React.CSSProperties> = {
  // ===== 整体三栏布局 =====
  root: { display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)', background: '#f0f4f8' },

  // 顶栏
  topbar: { background: C.white, padding: '10px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' },
  topbarLeft: { display: 'flex', alignItems: 'center', gap: 16 },
  topbarRight: { display: 'flex', alignItems: 'center', gap: 8 },
  reportId: { fontSize: 14, fontWeight: 700, color: C.primary, fontFamily: 'monospace' },
  patientChip: { padding: '4px 12px', background: '#f0f9ff', borderRadius: 6, fontSize: 12, color: C.primary, fontWeight: 600 },
  statusChip: { padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600 },
  scoreChip: { padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700, color: C.white },
  btn: { padding: '6px 14px', borderRadius: 6, border: 'none', fontSize: 12, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 },
  btnPrimary: { background: C.primary, color: C.white },
  btnSuccess: { background: C.success, color: C.white },
  btnOutline: { background: C.white, color: C.primary, border: `1px solid ${C.border}` },

  // 三栏容器
  cols: { display: 'flex', flex: 1, overflow: 'hidden' },

  // 左栏
  leftCol: { width: 260, background: C.white, borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  leftSection: { borderBottom: `1px solid ${C.border}`, overflow: 'hidden' },
  leftSectionTitle: { padding: '10px 14px', fontSize: 11, fontWeight: 700, color: C.textLight, textTransform: 'uppercase', letterSpacing: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fafbfc', cursor: 'pointer' },
  leftSectionContent: { padding: '4px 8px 8px', maxHeight: 240, overflowY: 'auto' },
  leftItem: { padding: '8px 10px', borderRadius: 6, fontSize: 12, color: C.text, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 2 },
  leftItemActive: { padding: '8px 10px', borderRadius: 6, fontSize: 12, color: C.primary, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 2, background: '#eff6ff', fontWeight: 600 },
  leftItemIcon: { flexShrink: 0, color: C.textLight },
  leftItemTag: { fontSize: 10, padding: '1px 6px', borderRadius: 4, background: C.primary, color: C.white, fontWeight: 600 },

  // 中栏
  centerCol: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: C.bg },
  centerTabs: { display: 'flex', gap: 4, padding: '6px 12px', background: C.white, borderBottom: `1px solid ${C.border}` },
  centerTab: { padding: '6px 12px', borderRadius: '4px 4px 0 0', fontSize: 12, color: C.textLight, cursor: 'pointer', border: 'none', background: 'transparent', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 },
  centerTabActive: { padding: '6px 12px', borderRadius: '4px 4px 0 0', fontSize: 12, color: C.primary, cursor: 'pointer', border: 'none', background: '#eff6ff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 },

  // 影像+报告同屏
  workArea: { display: 'flex', flex: 1, overflow: 'hidden' },
  imageArea: { width: '45%', background: '#0f172a', display: 'flex', flexDirection: 'column', position: 'relative' },
  imageToolbar: { padding: '6px 12px', background: '#1e293b', display: 'flex', gap: 6, alignItems: 'center', borderBottom: '1px solid #334155' },
  imageToolBtn: { padding: '4px 8px', borderRadius: 4, fontSize: 11, color: '#cbd5e1', cursor: 'pointer', border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', gap: 4 },
  imageToolBtnActive: { padding: '4px 8px', borderRadius: 4, fontSize: 11, color: C.white, cursor: 'pointer', border: 'none', background: C.accent, display: 'flex', alignItems: 'center', gap: 4 },
  imageCanvas: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' },
  imageLabel: { position: 'absolute', top: 8, left: 12, color: '#94a3b8', fontSize: 11, fontWeight: 600 },
  imageParams: { position: 'absolute', bottom: 8, right: 12, color: '#10b981', fontSize: 11, fontFamily: 'monospace' },
  imagePlaceholder: { textAlign: 'center', color: '#64748b' },
  imageThumb: { padding: 8, background: '#1e293b', borderTop: '1px solid #334155', display: 'flex', gap: 6, overflowX: 'auto' },
  imageThumbItem: { width: 60, height: 45, background: '#0f172a', borderRadius: 4, flexShrink: 0, border: `1px solid #334155`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', cursor: 'pointer' },
  imageThumbActive: { width: 60, height: 45, background: '#1e293b', borderRadius: 4, flexShrink: 0, border: `2px solid ${C.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', cursor: 'pointer' },

  // 报告编辑区
  reportArea: { flex: 1, display: 'flex', flexDirection: 'column', background: C.white, overflow: 'hidden' },
  reportToolbar: { padding: '6px 12px', background: '#f8fafc', borderBottom: `1px solid ${C.border}`, display: 'flex', gap: 4, flexWrap: 'wrap' },
  reportBody: { flex: 1, padding: 16, overflowY: 'auto' },
  reportField: { marginBottom: 12 },
  reportLabel: { fontSize: 12, fontWeight: 600, color: C.textLight, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 },
  reportInput: { width: '100%', padding: '8px 10px', borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 13, outline: 'none', boxSizing: 'border-box' },
  reportTextarea: { width: '100%', padding: '8px 10px', borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 13, outline: 'none', minHeight: 60, resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' },
  reportSection: { padding: 12, background: '#fafbfc', borderRadius: 8, marginBottom: 12, border: `1px solid ${C.border}` },
  reportSectionTitle: { fontSize: 12, fontWeight: 700, color: C.primary, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  measurementTable: { width: '100%', fontSize: 11, borderCollapse: 'collapse' },
  measurementTh: { padding: '4px 6px', textAlign: 'left', fontWeight: 600, color: C.textLight, background: '#f1f5f9', borderBottom: `1px solid ${C.border}` },
  measurementTd: { padding: '4px 6px', borderBottom: `1px solid ${C.border}`, color: C.text },

  // 右栏
  rightCol: { width: 320, background: C.white, borderLeft: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  rightTabs: { display: 'flex', borderBottom: `1px solid ${C.border}`, background: '#fafbfc' },
  rightTab: { flex: 1, padding: '8px 4px', fontSize: 11, color: C.textLight, cursor: 'pointer', border: 'none', background: 'transparent', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, borderBottom: '2px solid transparent' },
  rightTabActive: { flex: 1, padding: '8px 4px', fontSize: 11, color: C.primary, cursor: 'pointer', border: 'none', background: C.white, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, borderBottom: `2px solid ${C.primary}` },
  rightBody: { flex: 1, padding: 12, overflowY: 'auto' },

  // CDSS 面板
  cdssCard: { padding: 10, background: '#f8fafc', borderRadius: 8, marginBottom: 8, border: `1px solid ${C.border}` },
  cdssLabel: { fontSize: 11, fontWeight: 700, color: C.textLight, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  cdssItem: { padding: '6px 8px', background: C.white, borderRadius: 6, marginBottom: 4, fontSize: 12, color: C.text, display: 'flex', alignItems: 'center', gap: 6, border: `1px solid ${C.border}` },
  cdssItemHigh: { padding: '6px 8px', background: '#fef2f2', borderRadius: 6, marginBottom: 4, fontSize: 12, color: C.danger, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, border: '1px solid #fecaca' },
  cdssItemWarn: { padding: '6px 8px', background: '#fff7ed', borderRadius: 6, marginBottom: 4, fontSize: 12, color: C.warning, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, border: '1px solid #fed7aa' },

  // 分级系统
  gradeBtn: { padding: '8px 10px', borderRadius: 6, fontSize: 12, color: C.text, cursor: 'pointer', border: `1px solid ${C.border}`, marginBottom: 4, background: C.white, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 },
  gradeBtnActive: { padding: '8px 10px', borderRadius: 6, fontSize: 12, color: C.white, cursor: 'pointer', border: 'none', marginBottom: 4, background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, fontWeight: 600 },
  gradeLevel: { fontWeight: 700, fontSize: 13, padding: '2px 8px', borderRadius: 4, minWidth: 36, textAlign: 'center' },

  // 状态栏
  statusbar: { background: C.primary, color: C.white, padding: '4px 16px', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  statusbarItem: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, opacity: 0.9 },

  // 通用
  badge: { padding: '1px 6px', borderRadius: 4, fontSize: 10, fontWeight: 600, display: 'inline-block' },
  iconBtn: { padding: 4, borderRadius: 4, border: 'none', background: 'transparent', cursor: 'pointer', color: C.textLight, display: 'flex', alignItems: 'center', justifyContent: 'center' },
}

// 当前患者与报告
const CURRENT_PATIENT = { id: 'P2026-0528', name: '王秀珍', age: 52, gender: '女', exam: '甲状腺US', request: '甲状腺超声检查' }

// 模拟历史报告
const HISTORY_REPORTS = [
  { id: 'R2024-1205', date: '2024-12-05', diagnosis: '甲状腺右叶结节 TI-RADS 3', impression: '良性可能' },
  { id: 'R2025-0612', date: '2025-06-12', diagnosis: '甲状腺右叶结节 TI-RADS 3（较前无明显变化）', impression: '随访观察' },
  { id: 'R2025-1210', date: '2025-12-10', diagnosis: '甲状腺右叶结节 TI-RADS 3（1.2×0.9cm）', impression: '6月后复查' },
]

// 模拟影像缩略图
const IMAGE_THUMBS = [
  { id: 1, label: '横切-右叶', active: false },
  { id: 2, label: '纵切-右叶', active: true },
  { id: 3, label: '横切-左叶', active: false },
  { id: 4, label: 'CDFI-右叶', active: false },
  { id: 5, label: '弹性成像', active: false },
  { id: 6, label: '颈部淋巴结', active: false },
]

// 模拟测量值
const MEASUREMENTS = [
  { name: '甲状腺右叶 长径', value: '4.8', unit: 'cm', ref: '<5.0', status: 'normal' },
  { name: '甲状腺右叶 宽径', value: '1.8', unit: 'cm', ref: '<2.0', status: 'normal' },
  { name: '甲状腺右叶 厚径', value: '1.6', unit: 'cm', ref: '<2.0', status: 'normal' },
  { name: '甲状腺左叶 长径', value: '4.6', unit: 'cm', ref: '<5.0', status: 'normal' },
  { name: '甲状腺左叶 宽径', value: '1.7', unit: 'cm', ref: '<2.0', status: 'normal' },
  { name: '甲状腺左叶 厚径', value: '1.5', unit: 'cm', ref: '<2.0', status: 'normal' },
  { name: '峡部厚度', value: '0.4', unit: 'cm', ref: '<0.5', status: 'normal' },
  { name: '右叶结节 长径', value: '1.5', unit: 'cm', ref: '-', status: 'attention' },
  { name: '右叶结节 宽径', value: '1.1', unit: 'cm', ref: '-', status: 'attention' },
  { name: '右叶结节 厚径', value: '0.9', unit: 'cm', ref: '-', status: 'attention' },
]

export default function ReportWritePagePro() {
  const [centerTab, setCenterTab] = useState('work') // work | preview | compare
  const [rightTab, setRightTab] = useState('cdss') // cdss | grading | evidence | drg
  const [leftSection, setLeftSection] = useState<Record<string, boolean>>({ protocol: true, template: false, term: false, history: true, quality: false, ai: true })
  const [selectedProtocol, setSelectedProtocol] = useState('P001')
  const [selectedTemplate, setSelectedTemplate] = useState('T001')
  const [selectedGradingSystem, setSelectedGradingSystem] = useState<'TIRADS' | 'BIRADS' | 'ORADS' | 'LIRADS'>('TIRADS')
  const [selectedGradeLevel, setSelectedGradeLevel] = useState(4)
  const [reportContent, setReportContent] = useState({
    findings: '甲状腺大小正常，形态规则，包膜完整。右叶见一低回声结节，大小约1.5×1.1×0.9cm，边界欠清，形态欠规则，内回声不均匀，可见多发点状强回声。CDFI：结节内可见血流信号。',
    diagnosis: '甲状腺右叶结节 TI-RADS 4a',
    impression: '低度可疑恶性（2-10%），建议细针穿刺活检（FNA）或3-6月后复查',
  })
  const [qualityScore] = useState(85)
  const [isRecording, setIsRecording] = useState(false)
  const [selectedDisease] = useState('D001') // 甲状腺结节
  const [criticalValue, setCriticalValue] = useState(false)

  // 当前选中的疾病知识
  const currentDisease = DISEASE_KNOWLEDGE.find(d => d.id === selectedDisease) || DISEASE_KNOWLEDGE[0]
  const currentGradingRules = selectedGradingSystem === 'TIRADS' ? TIRADS_RULES
    : selectedGradingSystem === 'BIRADS' ? BIRADS_RULES
    : selectedGradingSystem === 'ORADS' ? ORADS_RULES
    : LIRADS_RULES
  const currentProtocol = ULTRASOUND_PROTOCOLS.find(p => p.id === selectedProtocol) || ULTRASOUND_PROTOCOLS[0]

  // 计算质控评分
  const qualityBreakdown = [
    { name: '完整性', score: 95, color: C.success },
    { name: '规范性', score: 88, color: C.success },
    { name: '准确性', score: 82, color: C.warning },
    { name: '及时性', score: 90, color: C.success },
    { name: '一致性', score: 85, color: C.warning },
    { name: '影像关联', score: 80, color: C.warning },
    { name: '测量完整', score: 92, color: C.success },
    { name: '诊断明确', score: 90, color: C.success },
    { name: '建议合理', score: 78, color: C.warning },
    { name: '危急值', score: 100, color: C.success },
  ]

  // DRG 自动匹配
  const drgMatch = {
    group: 'KS1',
    name: '甲状腺疾病，伴合并症',
    weight: 1.25,
    icd10: 'E04.901',
    icd9: '06.0101',
    cost: 8500,
    overrun: -3.2,
  }

  return (
    <div style={s.root}>
      {/* ===== 顶栏 ===== */}
      <div style={s.topbar}>
        <div style={s.topbarLeft}>
          <div style={s.reportId}>RPT-2026-0605-001</div>
          <span style={{ ...s.patientChip, display: 'flex', alignItems: 'center', gap: 6 }}>
            <FileText size={12} /> {CURRENT_PATIENT.name} | {CURRENT_PATIENT.age}岁 {CURRENT_PATIENT.gender}
          </span>
          <span style={{ ...s.statusChip, background: '#fef3c7', color: C.warning }}>● 书写中</span>
          <span style={{ ...s.scoreChip, background: qualityScore >= 90 ? C.success : qualityScore >= 75 ? C.warning : C.danger }}>
            质控 {qualityScore}
          </span>
          <span style={{ ...s.statusChip, background: '#dbeafe', color: C.accent }}>
            <Cpu size={10} style={{ display: 'inline', marginRight: 2 }} />
            AI辅助开启
          </span>
        </div>
        <div style={s.topbarRight}>
          <button style={{ ...s.btn, ...s.btnOutline }}>
            <History size={12} /> v3
          </button>
          <button style={{ ...s.btn, ...s.btnOutline }}>
            <Printer size={12} /> 打印
          </button>
          <button style={{ ...s.btn, ...s.btnOutline }}>
            <Save size={12} /> 暂存
          </button>
          <button style={{ ...s.btn, ...s.btnSuccess }}>
            <Send size={12} /> 提交审核
          </button>
        </div>
      </div>

      {/* ===== 三栏工作区 ===== */}
      <div style={s.cols}>
        {/* ===== 左栏：协议+模板+词库+历史+质控+AI ===== */}
        <div style={s.leftCol}>
          {/* 协议管理 */}
          <div style={s.leftSection}>
            <div style={s.leftSectionTitle} onClick={() => setLeftSection(p => ({ ...p, protocol: !p.protocol }))}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Target size={12} /> AI协议推荐
              </span>
              {leftSection.protocol ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </div>
            {leftSection.protocol && (
              <div style={s.leftSectionContent}>
                <div style={{ fontSize: 10, color: C.textLight, padding: '4px 4px 6px' }}>🔥 基于患者信息智能推荐</div>
                {ULTRASOUND_PROTOCOLS.slice(0, 4).map(p => (
                  <div
                    key={p.id}
                    style={p.id === selectedProtocol ? s.leftItemActive : s.leftItem}
                    onClick={() => setSelectedProtocol(p.id)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, overflow: 'hidden' }}>
                      <span style={s.leftItemIcon}><Activity size={12} /></span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                    </div>
                    {p.id === selectedProtocol && <span style={s.leftItemTag}>已选</span>}
                  </div>
                ))}
                <div style={{ fontSize: 10, color: C.accent, padding: '4px 4px', cursor: 'pointer' }}>查看全部 30+ →</div>
              </div>
            )}
          </div>

          {/* 模板管理 */}
          <div style={s.leftSection}>
            <div style={s.leftSectionTitle} onClick={() => setLeftSection(p => ({ ...p, template: !p.template }))}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <FileText size={12} /> 报告模板
              </span>
              {leftSection.template ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </div>
            {leftSection.template && (
              <div style={s.leftSectionContent}>
                {['甲状腺常规检查', '腹部常规超声', '心脏超声', '妇产科超声', '血管超声'].map((t, i) => (
                  <div
                    key={i}
                    style={i === 0 ? s.leftItemActive : s.leftItem}
                    onClick={() => setSelectedTemplate(`T00${i + 1}`)}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{t}</span>
                    {i === 0 && <span style={s.leftItemTag}>个人</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 历史报告对比 */}
          <div style={s.leftSection}>
            <div style={s.leftSectionTitle} onClick={() => setLeftSection(p => ({ ...p, history: !p.history }))}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <History size={12} /> 历史报告
              </span>
              {leftSection.history ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </div>
            {leftSection.history && (
              <div style={s.leftSectionContent}>
                {HISTORY_REPORTS.map(h => (
                  <div key={h.id} style={s.leftItem}>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: C.primary, fontFamily: 'monospace' }}>{h.id}</div>
                      <div style={{ fontSize: 10, color: C.textLight, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.diagnosis}</div>
                    </div>
                    <span style={{ fontSize: 10, color: C.textLight }}>{h.date}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 词库 */}
          <div style={s.leftSection}>
            <div style={s.leftSectionTitle} onClick={() => setLeftSection(p => ({ ...p, term: !p.term }))}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <BookOpen size={12} /> 术语词库
              </span>
              {leftSection.term ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </div>
            {leftSection.term && (
              <div style={s.leftSectionContent}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, padding: 4 }}>
                  {['低回声', '等回声', '高回声', '无回声', '混合回声', '边界清晰', '边界欠清', '形态规则', '形态欠规则', 'CDFI可见血流', '钙化', '强回声斑', 'TI-RADS', 'BI-RADS'].map((t, i) => (
                    <span key={i} style={{ padding: '2px 6px', background: '#eff6ff', color: C.accent, borderRadius: 4, fontSize: 11, cursor: 'pointer' }}>{t}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 10维质控 */}
          <div style={s.leftSection}>
            <div style={s.leftSectionTitle} onClick={() => setLeftSection(p => ({ ...p, quality: !p.quality }))}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <ShieldCheck size={12} /> 10维质控
              </span>
              {leftSection.quality ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </div>
            {leftSection.quality && (
              <div style={s.leftSectionContent}>
                <div style={{ textAlign: 'center', padding: '8px 0' }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: qualityScore >= 90 ? C.success : qualityScore >= 75 ? C.warning : C.danger, lineHeight: 1 }}>{qualityScore}</div>
                  <div style={{ fontSize: 10, color: C.textLight }}>综合质控评分</div>
                </div>
                {qualityBreakdown.map((q, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 4px', fontSize: 11 }}>
                    <span style={{ width: 60, color: C.textLight }}>{q.name}</span>
                    <div style={{ flex: 1, height: 4, background: '#e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: `${q.score}%`, height: '100%', background: q.color }} />
                    </div>
                    <span style={{ fontWeight: 600, color: q.color, minWidth: 24, textAlign: 'right' }}>{q.score}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI助手 */}
          <div style={s.leftSection}>
            <div style={s.leftSectionTitle} onClick={() => setLeftSection(p => ({ ...p, ai: !p.ai }))}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Sparkles size={12} color={C.purple} /> AI助手
              </span>
              {leftSection.ai ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </div>
            {leftSection.ai && (
              <div style={s.leftSectionContent}>
                {[
                  { icon: <Sparkles size={11} />, label: 'AI一键生成报告', color: C.purple },
                  { icon: <Mic size={11} />, label: '语音转文字', color: C.accent },
                  { icon: <Search size={11} />, label: '相似案例检索', color: C.teal },
                  { icon: <BarChart3 size={11} />, label: 'AI报告评分', color: C.success },
                  { icon: <Lightbulb size={11} />, label: '诊断建议', color: C.warning },
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

        {/* ===== 中栏：影像+报告同屏 ===== */}
        <div style={s.centerCol}>
          {/* 中栏 Tab */}
          <div style={s.centerTabs}>
            <button style={centerTab === 'work' ? s.centerTabActive : s.centerTab} onClick={() => setCenterTab('work')}>
              <Edit3 size={12} /> 报告编辑
            </button>
            <button style={centerTab === 'preview' ? s.centerTabActive : s.centerTab} onClick={() => setCenterTab('preview')}>
              <Eye size={12} /> 预览
            </button>
            <button style={centerTab === 'compare' ? s.centerTabActive : s.centerTab} onClick={() => setCenterTab('compare')}>
              <GitBranch size={12} /> 历史对比
            </button>
            <button style={centerTab === 'version' ? s.centerTabActive : s.centerTab} onClick={() => setCenterTab('version')}>
              <ListChecks size={12} /> 版本 v3
            </button>
            <div style={{ flex: 1 }} />
            <span style={{ fontSize: 11, color: C.textLight, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={11} /> 最后保存 1分钟前
            </span>
          </div>

          <div style={s.workArea}>
            {/* 左：影像区 */}
            <div style={s.imageArea}>
              <div style={s.imageToolbar}>
                <button style={s.imageToolBtn}><Ruler size={11} /> 距离</button>
                <button style={s.imageToolBtn}><Target size={11} /> 面积</button>
                <button style={s.imageToolBtn}><Crosshair size={11} /> 角度</button>
                <button style={s.imageToolBtn}><Edit3 size={11} /> 标注</button>
                <button style={s.imageToolBtn}><Type size={11} /> 文字</button>
                <div style={{ width: 1, height: 16, background: '#334155' }} />
                <button style={s.imageToolBtn}><Camera size={11} /> 冻结</button>
                <button style={s.imageToolBtn}><Download size={11} /> 存图</button>
                <div style={{ flex: 1 }} />
                <span style={{ fontSize: 10, color: '#94a3b8' }}>B-Mode | {currentProtocol.frequency} | {currentProtocol.depth}cm</span>
              </div>

              <div style={s.imageCanvas}>
                <span style={s.imageLabel}>📷 影像区 · 当前帧</span>
                <div style={s.imagePlaceholder}>
                  <Activity size={48} color="#475569" />
                  <div style={{ marginTop: 12, fontSize: 13, color: '#94a3b8' }}>实时超声影像</div>
                  <div style={{ marginTop: 4, fontSize: 11, color: '#64748b' }}>{currentProtocol.name}</div>
                </div>
                <span style={s.imageParams}>深度:{currentProtocol.depth}cm 增益:72 频率:{currentProtocol.frequency}</span>
              </div>

              {/* 缩略图 */}
              <div style={s.imageThumb}>
                {IMAGE_THUMBS.map(t => (
                  <div key={t.id} style={t.active ? s.imageThumbActive : s.imageThumbItem} title={t.label}>
                    <Camera size={14} color={t.active ? C.accent : '#64748b'} />
                    <span style={{ position: 'absolute', bottom: 2, left: 4, right: 4, fontSize: 9, color: t.active ? C.accent : '#94a3b8', textAlign: 'center', overflow: 'hidden' }}>{t.id}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 右：报告区 */}
            <div style={s.reportArea}>
              <div style={s.reportToolbar}>
                <button style={{ ...s.btn, ...s.btnPrimary, fontSize: 11, padding: '4px 10px' }}>
                  <Sparkles size={11} /> AI生成
                </button>
                <button
                  style={{ ...s.btn, background: isRecording ? C.danger : C.accent, color: C.white, fontSize: 11, padding: '4px 10px' }}
                  onClick={() => setIsRecording(!isRecording)}
                >
                  {isRecording ? <MicOff size={11} /> : <Mic size={11} />} {isRecording ? '停止录音' : '语音输入'}
                </button>
                <button style={{ ...s.btn, ...s.btnOutline, fontSize: 11, padding: '4px 10px' }}>
                  <Image size={11} /> 插入影像
                </button>
                <button style={{ ...s.btn, ...s.btnOutline, fontSize: 11, padding: '4px 10px' }}>
                  <Layers size={11} /> 插入图示
                </button>
                <button style={{ ...s.btn, ...s.btnOutline, fontSize: 11, padding: '4px 10px' }}>
                  <BookOpen size={11} /> 词库
                </button>
                <div style={{ flex: 1 }} />
                <button
                  style={{ ...s.btn, background: criticalValue ? C.danger : C.white, color: criticalValue ? C.white : C.textLight, border: `1px solid ${criticalValue ? C.danger : C.border}`, fontSize: 11, padding: '4px 10px' }}
                  onClick={() => setCriticalValue(!criticalValue)}
                >
                  <AlertTriangle size={11} /> {criticalValue ? '危急值 已标记' : '标记危急值'}
                </button>
              </div>

              <div style={s.reportBody}>
                {/* 测量值表（自动从DICOM） */}
                <div style={s.reportSection}>
                  <div style={s.reportSectionTitle}>
                    <span><Ruler size={12} style={{ display: 'inline', marginRight: 4 }} />测量值（自动从DICOM提取）</span>
                    <span style={{ fontSize: 10, color: C.textLight, fontWeight: 400 }}>10 项</span>
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

                {/* 关键影像缩略 */}
                <div style={s.reportSection}>
                  <div style={s.reportSectionTitle}>
                    <span><Image size={12} style={{ display: 'inline', marginRight: 4 }} />关键影像</span>
                    <button style={{ ...s.iconBtn, color: C.accent }}><Plus size={11} /></button>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {[1, 2, 3].map(i => (
                      <div key={i} style={{ width: 80, height: 60, background: '#0f172a', borderRadius: 4, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Activity size={20} color="#10b981" />
                        <span style={{ position: 'absolute', bottom: 2, left: 4, right: 4, fontSize: 9, color: '#cbd5e1', textAlign: 'center' }}>影像 #{i}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 超声所见 */}
                <div style={s.reportField}>
                  <div style={s.reportLabel}>
                    <Eye size={11} /> 超声所见
                    {isRecording && <span style={{ ...s.badge, background: C.danger, color: C.white, marginLeft: 4 }}>● 录音中</span>}
                  </div>
                  <textarea
                    style={s.reportTextarea}
                    value={reportContent.findings}
                    onChange={e => setReportContent(p => ({ ...p, findings: e.target.value }))}
                    rows={5}
                  />
                </div>

                {/* 超声诊断 */}
                <div style={s.reportField}>
                  <div style={s.reportLabel}><Stethoscope size={11} /> 超声诊断</div>
                  <textarea
                    style={{ ...s.reportTextarea, fontWeight: 600, color: C.primary }}
                    value={reportContent.diagnosis}
                    onChange={e => setReportContent(p => ({ ...p, diagnosis: e.target.value }))}
                    rows={2}
                  />
                </div>

                {/* 诊断建议 */}
                <div style={s.reportField}>
                  <div style={s.reportLabel}><Lightbulb size={11} /> 诊断建议</div>
                  <textarea
                    style={s.reportTextarea}
                    value={reportContent.impression}
                    onChange={e => setReportContent(p => ({ ...p, impression: e.target.value }))}
                    rows={2}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== 右栏：CDSS + 分级 + 循证 + DRG ===== */}
        <div style={s.rightCol}>
          <div style={s.rightTabs}>
            <button style={rightTab === 'cdss' ? s.rightTabActive : s.rightTab} onClick={() => setRightTab('cdss')}>
              <Brain size={11} /> CDSS
            </button>
            <button style={rightTab === 'grading' ? s.rightTabActive : s.rightTab} onClick={() => setRightTab('grading')}>
              <Award size={11} /> 分级
            </button>
            <button style={rightTab === 'evidence' ? s.rightTabActive : s.rightTab} onClick={() => setRightTab('evidence')}>
              <BookMarked size={11} /> 循证
            </button>
            <button style={rightTab === 'drg' ? s.rightTabActive : s.rightTab} onClick={() => setRightTab('drg')}>
              <Network size={11} /> DRG
            </button>
          </div>

          <div style={s.rightBody}>
            {rightTab === 'cdss' && (
              <div>
                <div style={s.cdssCard}>
                  <div style={s.cdssLabel}><Brain size={11} /> 当前诊断分析</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.primary }}>{currentDisease.name}</div>
                  <div style={{ fontSize: 10, color: C.textLight, marginTop: 2 }}>ICD-10: {currentDisease.icd10}</div>
                </div>

                <div style={s.cdssCard}>
                  <div style={s.cdssLabel}><Target size={11} /> 鉴别诊断（Top 5）</div>
                  {currentDisease.differentialDiagnosis?.slice(0, 5).map((d: any, i: number) => (
                    <div key={i} style={i === 0 ? s.cdssItemHigh : s.cdssItem}>
                      <span style={{ flex: 1, fontWeight: 500 }}>{d.name}</span>
                      <span style={{ fontSize: 11, color: d.probability > 50 ? C.danger : C.warning, fontWeight: 700 }}>{d.probability}%</span>
                    </div>
                  ))}
                </div>

                <div style={s.cdssCard}>
                  <div style={s.cdssLabel}><AlertCircle size={11} /> 漏诊风险提示</div>
                  <div style={s.cdssItemWarn}>
                    <AlertTriangle size={11} />
                    <span>建议补充：颈部淋巴结扫查（甲状腺癌常伴颈部淋巴结转移）</span>
                  </div>
                  <div style={s.cdssItemWarn}>
                    <AlertTriangle size={11} />
                    <span>建议检查：甲状腺功能（TSH/FT3/FT4）</span>
                  </div>
                </div>

                <div style={s.cdssCard}>
                  <div style={s.cdssLabel}><Send size={11} /> 决策建议</div>
                  <div style={s.cdssItem}>
                    <CheckCircle2 size={11} color={C.success} />
                    <span><strong>建议1：</strong>细针穿刺活检（FNA）</span>
                  </div>
                  <div style={s.cdssItem}>
                    <CheckCircle2 size={11} color={C.success} />
                    <span><strong>建议2：</strong>3-6月后超声复查</span>
                  </div>
                  <div style={s.cdssItem}>
                    <CheckCircle2 size={11} color={C.accent} />
                    <span><strong>建议3：</strong>内分泌科会诊</span>
                  </div>
                </div>
              </div>
            )}

            {rightTab === 'grading' && (
              <div>
                <div style={s.cdssCard}>
                  <div style={s.cdssLabel}><Award size={11} /> 选择分级系统</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                    {[
                      { key: 'TIRADS', label: 'TI-RADS', sub: '甲状腺' },
                      { key: 'BIRADS', label: 'BI-RADS', sub: '乳腺' },
                      { key: 'ORADS', label: 'O-RADS', sub: '卵巢' },
                      { key: 'LIRADS', label: 'LI-RADS', sub: '肝脏' },
                    ].map(g => (
                      <button
                        key={g.key}
                        style={selectedGradingSystem === g.key ? s.gradeBtnActive : s.gradeBtn}
                        onClick={() => setSelectedGradingSystem(g.key as any)}
                      >
                        <span style={{ fontSize: 11, fontWeight: 700 }}>{g.label}</span>
                        <span style={{ fontSize: 10, opacity: 0.7 }}>{g.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div style={s.cdssCard}>
                  <div style={s.cdssLabel}>
                    <span>{selectedGradingSystem} 分级</span>
                    <span style={{ fontSize: 10, color: C.textLight }}>点击选择</span>
                  </div>
                  {currentGradingRules.map((g: any) => (
                    <div
                      key={g.level}
                      style={selectedGradeLevel === g.level ? s.gradeBtnActive : s.gradeBtn}
                      onClick={() => setSelectedGradeLevel(g.level)}
                    >
                      <span style={{ ...s.gradeLevel, background: g.color, color: C.white }}>{g.level}</span>
                      <span style={{ flex: 1, fontSize: 11 }}>{g.name}</span>
                      <span style={{ fontSize: 10, color: C.textLight }}>{g.malignancy}</span>
                    </div>
                  ))}
                </div>

                <div style={s.cdssCard}>
                  <div style={s.cdssLabel}><Lightbulb size={11} /> 当前分级管理建议</div>
                  {(() => {
                    const cur = currentGradingRules.find((g: any) => g.level === selectedGradeLevel)
                    return cur ? (
                      <div style={{ fontSize: 12, color: C.text, lineHeight: 1.6 }}>
                        <div style={{ padding: 8, background: '#eff6ff', borderRadius: 6, marginBottom: 6, color: C.accent, fontWeight: 600 }}>
                          {cur.management}
                        </div>
                        <div style={{ fontSize: 10, color: C.textLight }}>恶性概率: {cur.malignancy}</div>
                      </div>
                    ) : null
                  })()}
                  <button style={{ ...s.btn, ...s.btnPrimary, width: '100%', marginTop: 8, justifyContent: 'center' }}>
                    <ArrowRight size={11} /> 一键应用分级
                  </button>
                </div>
              </div>
            )}

            {rightTab === 'evidence' && (
              <div>
                <div style={s.cdssCard}>
                  <div style={s.cdssLabel}><BookMarked size={11} /> 临床指南（{EVIDENCE_GUIDELINES.length}）</div>
                  {EVIDENCE_GUIDELINES.slice(0, 3).map((g: any) => (
                    <div key={g.id} style={s.cdssItem}>
                      <FileText size={11} color={C.accent} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11, fontWeight: 600 }}>{g.title}</div>
                        <div style={{ fontSize: 10, color: C.textLight }}>{g.organization} · {g.year}</div>
                      </div>
                      <ExternalLink size={10} color={C.textLight} />
                    </div>
                  ))}
                </div>

                <div style={s.cdssCard}>
                  <div style={s.cdssLabel}><Link size={11} /> 关键文献（PubMed）</div>
                  {EVIDENCE_LITERATURE.slice(0, 3).map((l: any, i) => (
                    <div key={i} style={s.cdssItem}>
                      <DatabaseIcon size={11} color={C.success} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11, fontWeight: 500 }}>{l.title}</div>
                        <div style={{ fontSize: 10, color: C.textLight }}>{l.journal} · IF:{l.impactFactor} · {l.year}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {rightTab === 'drg' && (
              <div>
                <div style={s.cdssCard}>
                  <div style={s.cdssLabel}><Network size={11} /> DRG 智能匹配</div>
                  <div style={{ padding: 8, background: '#eff6ff', borderRadius: 6, marginBottom: 8 }}>
                    <div style={{ fontSize: 11, color: C.textLight }}>DRG组</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: C.primary, fontFamily: 'monospace' }}>{drgMatch.group}</div>
                    <div style={{ fontSize: 11, color: C.text }}>{drgMatch.name}</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    <div style={{ padding: 6, background: C.white, borderRadius: 6, border: `1px solid ${C.border}` }}>
                      <div style={{ fontSize: 9, color: C.textLight }}>权重</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: C.primary }}>{drgMatch.weight}</div>
                    </div>
                    <div style={{ padding: 6, background: C.white, borderRadius: 6, border: `1px solid ${C.border}` }}>
                      <div style={{ fontSize: 9, color: C.textLight }}>例均费用</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: C.primary }}>¥{drgMatch.cost}</div>
                    </div>
                    <div style={{ padding: 6, background: C.white, borderRadius: 6, border: `1px solid ${C.border}` }}>
                      <div style={{ fontSize: 9, color: C.textLight }}>ICD-10</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.primary, fontFamily: 'monospace' }}>{drgMatch.icd10}</div>
                    </div>
                    <div style={{ padding: 6, background: C.white, borderRadius: 6, border: `1px solid ${C.border}` }}>
                      <div style={{ fontSize: 9, color: C.textLight }}>ICD-9-CM-3</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.primary, fontFamily: 'monospace' }}>{drgMatch.icd9}</div>
                    </div>
                  </div>
                </div>

                <div style={s.cdssCard}>
                  <div style={s.cdssLabel}><CheckCircle2 size={11} /> 入组状态</div>
                  <div style={{ ...s.cdssItem, background: '#f0fdf4', border: '1px solid #bbf7d0', color: C.success, fontWeight: 600 }}>
                    <CheckCircle2 size={11} />
                    <span>入组成功 · 偏差 {drgMatch.overrun}%</span>
                  </div>
                </div>

                <div style={s.cdssCard}>
                  <div style={s.cdssLabel}><FileCheck size={11} /> 病案首页联动</div>
                  <div style={{ fontSize: 11, color: C.text, lineHeight: 1.6 }}>
                    <div>✅ 主要诊断已自动填充</div>
                    <div>✅ 主要操作已自动填充</div>
                    <div>✅ ICD编码已自动生成</div>
                    <div>✅ DRG组已自动匹配</div>
                    <div>⏳ 出院时自动提交医保</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== 状态栏 ===== */}
      <div style={s.statusbar}>
        <div style={{ display: 'flex', gap: 16 }}>
          <span style={s.statusbarItem}><CheckCircle2 size={11} /> 已保存</span>
          <span style={s.statusbarItem}>字数: {reportContent.findings.length + reportContent.diagnosis.length + reportContent.impression.length}</span>
          <span style={s.statusbarItem}><Image size={11} /> 3张影像</span>
          <span style={s.statusbarItem}><Ruler size={11} /> 10个测量</span>
          <span style={s.statusbarItem}>v3 / 3版本</span>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          {criticalValue && (
            <span style={{ ...s.statusbarItem, color: '#fca5a5', fontWeight: 700 }}>
              <AlertTriangle size={11} /> 危急值已标记
            </span>
          )}
          <span style={s.statusbarItem}><Cpu size={11} /> AI辅助: ON</span>
          <span style={s.statusbarItem}><Network size={11} /> DRG: KS1</span>
          <span style={s.statusbarItem}>质控: {qualityScore}</span>
        </div>
      </div>
    </div>
  )
}
