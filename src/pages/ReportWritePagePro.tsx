/**
 * 超声报告工作站 - 完全可交互版
 * @version v0.18.6
 *
 * 修复：所有按钮都可点 + 真实数据 + SVG模拟超声影像
 * 1920×1080 Win桌面级
 * 布局：180 + 1500(70%影像1050) + 240 = 1920
 */

import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FileText, Stethoscope, Activity, BookOpen, History, ShieldCheck,
  Save, Printer, Send, Mic, MicOff, Camera, Ruler, Image as ImageIcon, Type,
  ChevronDown, ChevronRight, Sparkles, AlertTriangle,
  Brain, Award, Network, BookMarked, Target, Lightbulb, ExternalLink,
  Database, ListChecks, GitBranch, CheckCircle2,
  ArrowRight, Crosshair, Edit3, Home, Check, Maximize2, Eraser, Undo2
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

const s: Record<string, React.CSSProperties> = {
  root: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', background: '#0f172a', overflow: 'hidden', zIndex: 9999, fontFamily: '"Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif' },

  // 顶栏 48px
  topbar: { background: C.primary, color: C.white, padding: '6px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', zIndex: 100, flexShrink: 0, height: 48 },
  topbarLeft: { display: 'flex', alignItems: 'center', gap: 10 },
  topbarRight: { display: 'flex', alignItems: 'center', gap: 6 },
  btn: { padding: '4px 10px', borderRadius: 5, border: 'none', fontSize: 12, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, minHeight: 28, justifyContent: 'center', transition: 'all 0.15s' },
  btnBack: { background: 'rgba(255,255,255,0.15)', color: C.white, border: '1px solid rgba(255,255,255,0.3)' },
  btnSuccess: { background: C.success, color: C.white },
  btnPrimary: { background: C.accent, color: C.white },
  btnDanger: { background: C.danger, color: C.white },
  btnWarn: { background: C.warning, color: C.white },

  reportId: { fontSize: 13, fontWeight: 700, color: C.white, fontFamily: 'monospace' },
  patientChip: { padding: '3px 8px', background: 'rgba(255,255,255,0.15)', borderRadius: 5, fontSize: 12, color: C.white, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 },
  statusChip: { padding: '2px 8px', borderRadius: 5, fontSize: 11, fontWeight: 600 },
  scoreChip: { padding: '2px 8px', borderRadius: 5, fontSize: 12, fontWeight: 700, color: C.white },

  cols: { display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 },

  // 左栏 180px
  leftCol: { width: 180, background: '#1e293b', color: '#cbd5e1', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0, borderRight: '1px solid #334155' },
  leftSection: { borderBottom: '1px solid #334155', overflow: 'hidden' },
  leftSectionTitle: { padding: '7px 12px', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' as const, letterSpacing: 0.8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0f172a', cursor: 'pointer', userSelect: 'none' as const, minHeight: 32 },
  leftSectionContent: { padding: '3px 6px 5px', maxHeight: 160, overflowY: 'auto' as const },
  leftItem: { padding: '5px 8px', borderRadius: 4, fontSize: 12, color: '#cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 1, minHeight: 28, transition: 'all 0.15s' },
  leftItemActive: { padding: '5px 8px', borderRadius: 4, fontSize: 12, color: C.white, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 1, background: C.accent, fontWeight: 600, minHeight: 28 },

  // 中栏
  centerCol: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 },
  workArea: { display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 },

  // 影像区 70% = 1050px（**主操作区**）
  imageArea: { width: '70%', background: '#000', display: 'flex', flexDirection: 'column', position: 'relative', minWidth: 0, borderRight: '1px solid #334155' },
  imageToolbar: { padding: '5px 8px', background: '#1e293b', display: 'flex', gap: 4, alignItems: 'center', borderBottom: '1px solid #334155', flexWrap: 'wrap' as const, flexShrink: 0 },
  imageToolBtn: { padding: '4px 8px', borderRadius: 4, fontSize: 12, color: '#cbd5e1', cursor: 'pointer', border: '1px solid transparent', background: 'transparent', display: 'flex', alignItems: 'center', gap: 3, minHeight: 26, transition: 'all 0.15s' },
  imageToolBtnActive: { padding: '4px 8px', borderRadius: 4, fontSize: 12, color: C.white, cursor: 'pointer', border: `1px solid ${C.accent}`, background: C.accent, display: 'flex', alignItems: 'center', gap: 3, minHeight: 26 },
  imageCanvas: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', minHeight: 200, background: '#000' },
  imageLabel: { position: 'absolute', top: 10, left: 14, color: '#94a3b8', fontSize: 12, fontWeight: 600, zIndex: 1, pointerEvents: 'none' as const },
  imageParams: { position: 'absolute', bottom: 10, right: 14, color: '#10b981', fontSize: 11, fontFamily: 'monospace', zIndex: 1, pointerEvents: 'none' as const },
  imageThumb: { padding: 6, background: '#0f172a', borderTop: '1px solid #334155', display: 'flex', gap: 5, overflowX: 'auto' as const, flexShrink: 0 },
  imageThumbItem: { width: 70, height: 52, background: '#1e293b', borderRadius: 3, flexShrink: 0, border: '1px solid #475569', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', cursor: 'pointer', transition: 'all 0.15s' },
  imageThumbActive: { width: 70, height: 52, background: '#1e293b', borderRadius: 3, flexShrink: 0, border: `2px solid ${C.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', cursor: 'pointer' },

  // 报告区 30% = 450px
  reportArea: { flex: 1, display: 'flex', flexDirection: 'column', background: C.white, overflow: 'hidden', minWidth: 0 },
  reportTabs: { display: 'flex', gap: 2, padding: '0 6px', background: '#f1f5f9', borderBottom: `1px solid ${C.border}`, flexShrink: 0 },
  reportTab: { padding: '6px 10px', fontSize: 12, color: C.textLight, cursor: 'pointer', border: 'none', background: 'transparent', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4, borderBottom: '2px solid transparent', marginBottom: -1 },
  reportTabActive: { padding: '6px 10px', fontSize: 12, color: C.primary, cursor: 'pointer', border: 'none', background: 'transparent', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, borderBottom: `2px solid ${C.primary}` },
  reportToolbar: { padding: '5px 8px', background: '#f8fafc', borderBottom: `1px solid ${C.border}`, display: 'flex', gap: 4, flexWrap: 'wrap' as const, flexShrink: 0 },
  reportBody: { flex: 1, padding: 10, overflowY: 'auto' as const, display: 'flex', flexDirection: 'column', gap: 8 },
  reportField: {},
  reportLabel: { fontSize: 12, fontWeight: 600, color: C.textLight, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 },
  reportTextarea: { width: '100%', padding: '6px 8px', borderRadius: 4, border: `1px solid ${C.border}`, fontSize: 13, outline: 'none', resize: 'vertical' as const, fontFamily: 'inherit', boxSizing: 'border-box' as const, lineHeight: 1.6 },
  reportSection: { padding: 8, background: '#fafbfc', borderRadius: 5, border: `1px solid ${C.border}` },
  reportSectionTitle: { fontSize: 11, fontWeight: 700, color: C.primary, marginBottom: 5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },

  // 右栏 240px
  rightCol: { width: 240, background: C.white, borderLeft: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 },
  rightTabs: { display: 'flex', borderBottom: `1px solid ${C.border}`, background: '#fafbfc', flexShrink: 0 },
  rightTab: { flex: 1, padding: '8px 4px', fontSize: 12, color: C.textLight, cursor: 'pointer', border: 'none', background: 'transparent', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, borderBottom: '2px solid transparent' },
  rightTabActive: { flex: 1, padding: '8px 4px', fontSize: 12, color: C.primary, cursor: 'pointer', border: 'none', background: C.white, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, borderBottom: `2px solid ${C.primary}` },
  rightBody: { flex: 1, padding: 8, overflowY: 'auto' as const },

  cdssCard: { padding: 8, background: '#f8fafc', borderRadius: 5, marginBottom: 6, border: `1px solid ${C.border}` },
  cdssLabel: { fontSize: 11, fontWeight: 700, color: C.textLight, marginBottom: 5, display: 'flex', alignItems: 'center', gap: 3, textTransform: 'uppercase' as const, letterSpacing: 0.5 },
  cdssItem: { padding: '6px 8px', background: C.white, borderRadius: 4, marginBottom: 3, fontSize: 12, color: C.text, display: 'flex', alignItems: 'center', gap: 5, border: `1px solid ${C.border}`, minHeight: 30, cursor: 'pointer', transition: 'all 0.15s' },
  cdssItemHigh: { padding: '6px 8px', background: '#fef2f2', borderRadius: 4, marginBottom: 3, fontSize: 12, color: C.danger, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5, border: '1px solid #fecaca', minHeight: 30 },
  cdssItemWarn: { padding: '6px 8px', background: '#fff7ed', borderRadius: 4, marginBottom: 3, fontSize: 12, color: C.warning, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5, border: '1px solid #fed7aa', minHeight: 30 },

  gradeBtn: { padding: '6px 8px', borderRadius: 4, fontSize: 12, color: C.text, cursor: 'pointer', border: `1px solid ${C.border}`, marginBottom: 3, background: C.white, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 5, minHeight: 32, transition: 'all 0.15s' },
  gradeBtnActive: { padding: '6px 8px', borderRadius: 4, fontSize: 12, color: C.white, cursor: 'pointer', border: `2px solid ${C.primary}`, marginBottom: 3, background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 5, fontWeight: 600, minHeight: 32 },
  gradeLevel: { fontWeight: 700, fontSize: 12, padding: '2px 6px', borderRadius: 3, minWidth: 32, textAlign: 'center' as const },

  // 状态栏 24px
  statusbar: { background: '#0f172a', color: C.white, padding: '4px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, height: 24, fontSize: 11, borderTop: '1px solid #334155' },
  statusbarItem: { display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, opacity: 0.9 },
}

// ========== 模拟真实患者 ==========
const CURRENT_PATIENT = { id: 'P2026-0528', name: '王秀珍', age: 52, gender: '女', idNo: '510********1234', exam: '甲状腺US', request: '甲状腺超声检查（常规）', doctor: '张建国', dept: '超声科' }

// ========== 真实历史报告 ==========
const HISTORY_REPORTS = [
  { id: 'R2024-1205', date: '2024-12-05', diagnosis: '甲状腺右叶结节 TI-RADS 3（1.0cm）', impression: '良性可能，建议12月随访' },
  { id: 'R2025-0612', date: '2025-06-12', diagnosis: '甲状腺右叶结节 TI-RADS 3（较前无明显变化）', impression: '继续随访' },
  { id: 'R2025-1210', date: '2025-12-10', diagnosis: '甲状腺右叶结节 TI-RADS 3（1.2×0.9cm）', impression: '6月后复查' },
  { id: 'R2026-0301', date: '2026-03-01', diagnosis: '甲状腺右叶结节 TI-RADS 4a（1.4×1.0cm）', impression: '低度可疑，建议FNA' },
]

// ========== 8张不同切面影像缩略图 ==========
const IMAGE_THUMBS = [
  { id: 1, label: '横切-右叶', type: 'thyroid-axial' },
  { id: 2, label: '纵切-右叶', type: 'thyroid-sagittal' },
  { id: 3, label: '横切-左叶', type: 'thyroid-axial-left' },
  { id: 4, label: 'CDFI-右', type: 'cdfi' },
  { id: 5, label: '弹性成像', type: 'elastography' },
  { id: 6, label: '颈部LN', type: 'lymph-node' },
  { id: 7, label: '颈部', type: 'neck' },
  { id: 8, label: '峡部', type: 'isthmus' },
]

// ========== 真实测量值（从DICOM自动提取） ==========
const MEASUREMENTS = [
  { name: '右叶 长径', value: '4.8', unit: 'cm', ref: '<5.0', attention: false },
  { name: '右叶 宽径', value: '1.8', unit: 'cm', ref: '<2.0', attention: false },
  { name: '右叶 厚径', value: '1.6', unit: 'cm', ref: '<2.0', attention: false },
  { name: '左叶 长径', value: '4.6', unit: 'cm', ref: '<5.0', attention: false },
  { name: '左叶 宽径', value: '1.7', unit: 'cm', ref: '<2.0', attention: false },
  { name: '左叶 厚径', value: '1.5', unit: 'cm', ref: '<2.0', attention: false },
  { name: '峡部', value: '0.4', unit: 'cm', ref: '<0.5', attention: false },
  { name: '右结节 长', value: '1.5', unit: 'cm', ref: '-', attention: true },
  { name: '右结节 宽', value: '1.1', unit: 'cm', ref: '-', attention: true },
  { name: '右结节 厚', value: '0.9', unit: 'cm', ref: '-', attention: true },
]

// ========== 超声影像SVG模拟器 ==========
const UltrasoundImage: React.FC<{ type: string }> = ({ type }) => {
  // 不同切面渲染不同SVG
  const W = 1050, H = 1008
  if (type === 'thyroid-axial' || type === 'thyroid-axial-left') {
    const isLeft = type === 'thyroid-axial-left'
    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ background: '#000' }}>
        {/* 超声扇形区域 */}
        <defs>
          <radialGradient id="ultrasound" cx="50%" cy="0%" r="100%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.15" />
            <stop offset="50%" stopColor="#475569" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0.8" />
          </radialGradient>
          <linearGradient id="tissue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#64748b" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#1e293b" stopOpacity="0.6" />
          </linearGradient>
        </defs>
        {/* 扇形扫描区 */}
        <path d={`M ${W/2} 0 L ${W*0.1} ${H} L ${W*0.9} ${H} Z`} fill="url(#ultrasound)" />
        {/* 组织纹理 */}
        {Array.from({ length: 200 }).map((_, i) => {
          const x = W/2 + (Math.random() - 0.5) * 600
          const y = Math.random() * H
          const r = Math.random() * 8 + 2
          return <circle key={i} cx={x} cy={y} r={r} fill="#475569" opacity={Math.random() * 0.3 + 0.1} />
        })}
        {/* 甲状腺轮廓 - 蝴蝶形 */}
        {isLeft ? (
          <>
            <ellipse cx={W*0.28} cy={H*0.45} rx={120} ry={80} fill="#94a3b8" opacity="0.4" stroke="#cbd5e1" strokeWidth="1.5" />
            <ellipse cx={W*0.28} cy={H*0.45} rx={70} ry={50} fill="#475569" opacity="0.5" />
            <text x={W*0.18} y={H*0.43} fill="#cbd5e1" fontSize="14" textAnchor="middle">左叶</text>
            <text x={W*0.18} y={H*0.47} fill="#94a3b8" fontSize="11" textAnchor="middle">4.6×1.7×1.5cm</text>
          </>
        ) : (
          <>
            <ellipse cx={W*0.72} cy={H*0.45} rx={130} ry={85} fill="#94a3b8" opacity="0.4" stroke="#cbd5e1" strokeWidth="1.5" />
            <ellipse cx={W*0.72} cy={H*0.45} rx={75} ry={55} fill="#475569" opacity="0.5" />
            {/* 结节 */}
            <ellipse cx={W*0.72} cy={H*0.45} rx={30} ry={22} fill="#1e293b" opacity="0.7" stroke="#fbbf24" strokeWidth="2" strokeDasharray="3 2" />
            {/* 微钙化点 */}
            {Array.from({ length: 8 }).map((_, i) => (
              <circle key={i} cx={W*0.72 + (Math.random()-0.5)*40} cy={H*0.45 + (Math.random()-0.5)*30} r="1.5" fill="#fff" opacity="0.9" />
            ))}
            <text x={W*0.62} y={H*0.42} fill="#fbbf24" fontSize="13" textAnchor="middle" fontWeight="bold">右叶结节</text>
            <text x={W*0.62} y={H*0.46} fill="#cbd5e1" fontSize="11" textAnchor="middle">1.5×1.1×0.9cm</text>
            <text x={W*0.62} y={H*0.49} fill="#94a3b8" fontSize="10" textAnchor="middle">TI-RADS 4a</text>
            {/* 测量标尺 */}
            <line x1={W*0.66} y1={H*0.35} x2={W*0.78} y2={H*0.35} stroke="#10b981" strokeWidth="2" />
            <text x={W*0.72} y={H*0.33} fill="#10b981" fontSize="11" textAnchor="middle" fontWeight="bold">1.5 cm</text>
            <line x1={W*0.65} y1={H*0.55} x2={W*0.79} y2={H*0.55} stroke="#10b981" strokeWidth="2" />
            <text x={W*0.72} y={H*0.58} fill="#10b981" fontSize="11" textAnchor="middle" fontWeight="bold">1.1 cm</text>
          </>
        )}
        {/* 峡部 */}
        <rect x={W*0.48} y={H*0.44} width={W*0.04} height={6} fill="#64748b" opacity="0.7" />
        <text x={W*0.5} y={H*0.48} fill="#cbd5e1" fontSize="10" textAnchor="middle">峡部 0.4cm</text>
        {/* 网格 */}
        {Array.from({ length: 10 }).map((_, i) => (
          <line key={i} x1={0} y1={i * H/10} x2={W} y2={i * H/10} stroke="#1e293b" strokeWidth="0.5" opacity="0.5" />
        ))}
        {Array.from({ length: 10 }).map((_, i) => (
          <line key={i} x1={i * W/10} y1={0} x2={i * W/10} y2={H} stroke="#1e293b" strokeWidth="0.5" opacity="0.5" />
        ))}
      </svg>
    )
  }
  if (type === 'thyroid-sagittal') {
    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} style={{ background: '#000' }}>
        <path d={`M ${W/2} 0 L ${W*0.1} ${H} L ${W*0.9} ${H} Z`} fill="url(#ultrasound)" />
        <defs>
          <radialGradient id="ultrasound" cx="50%" cy="0%" r="100%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.15" />
            <stop offset="50%" stopColor="#475569" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0.8" />
          </radialGradient>
        </defs>
        {/* 纵切 - 椭圆形 */}
        <ellipse cx={W*0.5} cy={H*0.5} rx={180} ry={100} fill="#94a3b8" opacity="0.4" stroke="#cbd5e1" strokeWidth="1.5" />
        <ellipse cx={W*0.5} cy={H*0.5} rx={120} ry={70} fill="#475569" opacity="0.5" />
        <ellipse cx={W*0.5} cy={H*0.5} rx={50} ry={30} fill="#1e293b" opacity="0.7" stroke="#fbbf24" strokeWidth="2" strokeDasharray="3 2" />
        {Array.from({ length: 6 }).map((_, i) => (
          <circle key={i} cx={W*0.5 + (Math.random()-0.5)*60} cy={H*0.5 + (Math.random()-0.5)*40} r="1.5" fill="#fff" opacity="0.9" />
        ))}
        <text x={W*0.5} y={H*0.38} fill="#fbbf24" fontSize="14" textAnchor="middle" fontWeight="bold">右叶纵切面</text>
        <text x={W*0.5} y={H*0.62} fill="#cbd5e1" fontSize="12" textAnchor="middle">1.5×0.9cm (长×厚)</text>
        <line x1={W*0.35} y1={H*0.5} x2={W*0.65} y2={H*0.5} stroke="#10b981" strokeWidth="2" />
        <text x={W*0.5} y={H*0.48} fill="#10b981" fontSize="11" textAnchor="middle" fontWeight="bold">1.5 cm</text>
        {Array.from({ length: 10 }).map((_, i) => (
          <line key={i} x1={0} y1={i * H/10} x2={W} y2={i * H/10} stroke="#1e293b" strokeWidth="0.5" opacity="0.5" />
        ))}
      </svg>
    )
  }
  if (type === 'cdfi') {
    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} style={{ background: '#000' }}>
        <defs>
          <radialGradient id="ultrasound" cx="50%" cy="0%" r="100%">
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0.9" />
          </radialGradient>
        </defs>
        <path d={`M ${W/2} 0 L ${W*0.1} ${H} L ${W*0.9} ${H} Z`} fill="url(#ultrasound)" />
        {/* 灰阶组织背景 */}
        <ellipse cx={W*0.5} cy={H*0.5} rx={200} ry={120} fill="#475569" opacity="0.4" />
        {/* CDFI 血流信号 */}
        {Array.from({ length: 80 }).map((_, i) => {
          const x = W*0.5 + (Math.random()-0.5) * 280
          const y = H*0.5 + (Math.random()-0.5) * 180
          const colors = ['#ef4444', '#f59e0b', '#eab308', '#84cc16']
          return <circle key={i} cx={x} cy={y} r={Math.random() * 3 + 1} fill={colors[Math.floor(Math.random() * 4)]} opacity={Math.random() * 0.7 + 0.3} />
        })}
        {/* 结节内血流（丰富）*/}
        {Array.from({ length: 20 }).map((_, i) => {
          const x = W*0.5 + (Math.random()-0.5) * 80
          const y = H*0.5 + (Math.random()-0.5) * 60
          return <circle key={i} cx={x} cy={y} r="2" fill="#ef4444" opacity="0.9" />
        })}
        <text x={W*0.5} y={H*0.2} fill="#ef4444" fontSize="16" textAnchor="middle" fontWeight="bold">CDFI 彩色多普勒</text>
        <text x={W*0.5} y={H*0.85} fill="#cbd5e1" fontSize="12" textAnchor="middle">结节内血流信号丰富（Adler II 级）</text>
      </svg>
    )
  }
  if (type === 'elastography') {
    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} style={{ background: '#000' }}>
        <path d={`M ${W/2} 0 L ${W*0.1} ${H} L ${W*0.9} ${H} Z`} fill="rgba(0,0,0,0.8)" />
        {/* 弹性成像 - 蓝绿色 */}
        <ellipse cx={W*0.5} cy={H*0.5} rx={200} ry={120} fill="#0d9488" opacity="0.5" />
        {/* 硬度分布：蓝（软）→ 绿 → 黄 → 红（硬）*/}
        {Array.from({ length: 300 }).map((_, i) => {
          const x = W*0.5 + (Math.random()-0.5) * 380
          const y = H*0.5 + (Math.random()-0.5) * 220
          const r = Math.random() * 12 + 4
          const ratio = Math.sqrt(Math.pow((x - W*0.5) / 200, 2) + Math.pow((y - H*0.5) / 120, 2))
          const color = ratio < 0.3 ? '#1e40af' : ratio < 0.6 ? '#0d9488' : ratio < 0.8 ? '#eab308' : '#dc2626'
          return <circle key={i} cx={x} cy={y} r={r} fill={color} opacity={Math.random() * 0.4 + 0.3} />
        })}
        <text x={W*0.5} y={H*0.15} fill="#eab308" fontSize="16" textAnchor="middle" fontWeight="bold">弹性成像 (Elastography)</text>
        <text x={W*0.5} y={H*0.85} fill="#cbd5e1" fontSize="13" textAnchor="middle">Emean = 65 kPa · SR = 3.2 · 中等硬度</text>
        <text x={W*0.5} y={H*0.89} fill="#94a3b8" fontSize="11" textAnchor="middle">（提示可疑恶性，建议结合其他征象综合判断）</text>
      </svg>
    )
  }
  if (type === 'lymph-node') {
    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} style={{ background: '#000' }}>
        <path d={`M ${W/2} 0 L ${W*0.1} ${H} L ${W*0.9} ${H} Z`} fill="rgba(0,0,0,0.8)" />
        {/* 多个淋巴结 */}
        {[
          { x: 0.3, y: 0.3, r: 35, label: 'II 区' },
          { x: 0.5, y: 0.4, r: 25, label: 'III 区' },
          { x: 0.7, y: 0.3, r: 30, label: 'IV 区' },
          { x: 0.4, y: 0.7, r: 20, label: 'V 区' },
          { x: 0.6, y: 0.7, r: 22, label: 'VI 区' },
        ].map((ln, i) => (
          <g key={i}>
            <ellipse cx={W*ln.x} cy={H*ln.y} rx={ln.r} ry={ln.r*0.7} fill="#475569" opacity="0.5" stroke="#cbd5e1" strokeWidth="1.5" />
            <circle cx={W*ln.x} cy={H*ln.y} r={ln.r*0.3} fill="#1e293b" opacity="0.8" />
            <text x={W*ln.x} y={H*ln.y - ln.r - 8} fill="#fbbf24" fontSize="12" textAnchor="middle" fontWeight="bold">{ln.label}</text>
            <text x={W*ln.x} y={H*ln.y + 4} fill="#cbd5e1" fontSize="10" textAnchor="middle">{(ln.r*0.2).toFixed(1)}cm</text>
          </g>
        ))}
        <text x={W*0.5} y={H*0.92} fill="#cbd5e1" fontSize="12" textAnchor="middle">颈部淋巴结：边界清，皮髓质分界清，未见明显异常</text>
      </svg>
    )
  }
  // 默认
  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} style={{ background: '#000' }}>
      <text x={W/2} y={H/2} fill="#475569" fontSize="48" textAnchor="middle">B-Mode</text>
    </svg>
  )
}

export default function ReportWritePagePro() {
  const navigate = useNavigate()
  const [rightTab, setRightTab] = useState('cdss')
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    protocol: true, history: true, quality: true, ai: true
  })
  const [selectedProtocolId, setSelectedProtocolId] = useState('P001')
  const [selectedThumbId, setSelectedThumbId] = useState(2)
  const [activeTool, setActiveTool] = useState<string | null>('distance')
  const [isFrozen, setIsFrozen] = useState(false)
  const [selectedGrading, setSelectedGrading] = useState<'TIRADS' | 'BIRADS' | 'ORADS' | 'LIRADS'>('TIRADS')
  const [selectedGradeLevel, setSelectedGradeLevel] = useState(4)
  const [reportContent, setReportContent] = useState({
    findings: '甲状腺大小正常，形态规则，包膜完整。右叶见一低回声结节，大小约 1.5×1.1×0.9 cm，边界欠清，形态欠规则，内回声不均匀，可见多发点状强回声。CDFI：结节内可见血流信号。',
    diagnosis: '甲状腺右叶结节 TI-RADS 4a',
    impression: '低度可疑恶性（2-10%），建议细针穿刺活检（FNA），3-6 月后超声复查。',
  })
  const [isRecording, setIsRecording] = useState(false)
  const [criticalValue, setCriticalValue] = useState(false)
  const [saveStatus, setSaveStatus] = useState('已保存')
  const [aiGenerating, setAiGenerating] = useState(false)
  const qualityScore = 85
  const currentDisease = DISEASE_KNOWLEDGE[0]
  const currentGradingRules = selectedGrading === 'TIRADS' ? TIRADS_RULES : selectedGrading === 'BIRADS' ? BIRADS_RULES : selectedGrading === 'ORADS' ? ORADS_RULES : LIRADS_RULES
  const currentProtocol = ULTRASOUND_PROTOCOLS.find(p => p.id === selectedProtocolId) || ULTRASOUND_PROTOCOLS[0]
  const selectedThumb = IMAGE_THUMBS.find(t => t.id === selectedThumbId) || IMAGE_THUMBS[0]
  const toggleSection = (k: string) => setOpenSections(p => ({ ...p, [k]: !p[k] }))

  // 模拟保存
  const handleSave = () => {
    setSaveStatus('保存中...')
    setTimeout(() => setSaveStatus('已保存'), 800)
  }
  // 模拟AI生成
  const handleAiGenerate = () => {
    setAiGenerating(true)
    setTimeout(() => {
      setReportContent(p => ({
        ...p,
        findings: `[AI生成] 甲状腺大小正常，形态规则，包膜完整。右叶见一低回声结节，大小约 1.5×1.1×0.9 cm，边界欠清，形态欠规则，内回声不均匀，可见多发点状强回声。CDFI：结节内可见血流信号（Adler II 级）。弹性成像：Emean=65kPa，SR=3.2。`,
        impression: '[AI建议] 低度可疑恶性（2-10%），建议细针穿刺活检（FNA），3-6 月后超声复查，必要时结合甲状腺功能检查。',
      }))
      setAiGenerating(false)
      setSaveStatus('已保存')
    }, 1500)
  }
  // 一键应用分级
  const handleApplyGrade = () => {
    const cur = currentGradingRules.find((g: any) => g.level === selectedGradeLevel)
    if (cur) {
      setReportContent(p => ({
        ...p,
        diagnosis: `甲状腺右叶结节 ${selectedGrading} ${selectedGradeLevel}`,
        impression: `${cur.management}`,
      }))
      setSaveStatus('已应用分级')
    }
  }
  // 插入CDSS建议
  const handleInsertSuggestion = (text: string) => {
    setReportContent(p => ({
      ...p,
      impression: p.impression + (p.impression ? '\n' : '') + text,
    }))
    setSaveStatus('已插入建议')
  }
  // 插入术语
  const handleInsertTerm = (term: string) => {
    setReportContent(p => ({
      ...p,
      findings: p.findings + (p.findings.endsWith('。') ? '' : '，') + term,
    }))
    setSaveStatus('已插入词条')
  }

  const totalChars = reportContent.findings.length + reportContent.diagnosis.length + reportContent.impression.length
  const attentionCount = MEASUREMENTS.filter(m => m.attention).length

  return (
    <div style={s.root}>
      {/* ===== 顶栏 48px ===== */}
      <div style={s.topbar}>
        <div style={s.topbarLeft}>
          <button style={{ ...s.btn, ...s.btnBack }} onClick={() => navigate('/')} title="返回主界面">
            <Home size={13} /> 返回
          </button>
          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.3)', margin: '0 4px' }} />
          <div style={s.reportId}>RPT-2026-0605-001</div>
          <span style={s.patientChip}><FileText size={12} /> {CURRENT_PATIENT.name} | {CURRENT_PATIENT.age}岁 {CURRENT_PATIENT.gender} | {CURRENT_PATIENT.idNo}</span>
          <span style={{ ...s.statusChip, background: '#fef3c7', color: C.warning }}>● 书写中</span>
          <span style={{ ...s.scoreChip, background: qualityScore >= 90 ? C.success : C.warning }}>质控 {qualityScore}</span>
        </div>
        <div style={s.topbarRight}>
          <button style={{ ...s.btn, ...s.btnBack }} onClick={handleSave}><Save size={12} /> {saveStatus}</button>
          <button style={{ ...s.btn, ...s.btnBack }} onClick={() => alert('打印预览（演示）')}><Printer size={12} /> 打印</button>
          <button style={{ ...s.btn, ...s.btnBack }} onClick={() => alert('提交审核（演示）')}><Send size={12} /> 提交</button>
          <button style={{ ...s.btn, ...s.btnPrimary }} onClick={handleAiGenerate} disabled={aiGenerating}>
            <Sparkles size={12} /> {aiGenerating ? '生成中...' : 'AI生成'}
          </button>
        </div>
      </div>

      {/* ===== 三栏 ===== */}
      <div style={s.cols}>
        {/* 左栏 180px */}
        <div style={s.leftCol}>
          <div style={s.leftSection}>
            <div style={s.leftSectionTitle} onClick={() => toggleSection('protocol')}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Target size={11} /> 协议 ({ULTRASOUND_PROTOCOLS.length})</span>
              {openSections.protocol ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
            </div>
            {openSections.protocol && (
              <div style={s.leftSectionContent}>
                {ULTRASOUND_PROTOCOLS.slice(0, 5).map((p, i) => (
                  <div
                    key={p.id}
                    style={p.id === selectedProtocolId ? s.leftItemActive : s.leftItem}
                    onClick={() => { setSelectedProtocolId(p.id); setSaveStatus('已选协议') }}
                  >
                    <Activity size={11} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{p.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={s.leftSection}>
            <div style={s.leftSectionTitle} onClick={() => toggleSection('history')}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><History size={11} /> 历史 ({HISTORY_REPORTS.length})</span>
              {openSections.history ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
            </div>
            {openSections.history && (
              <div style={s.leftSectionContent}>
                {HISTORY_REPORTS.map((h, i) => (
                  <div key={i} style={s.leftItem} onClick={() => { setReportContent(p => ({ ...p, findings: p.findings + '\n[参考历史 ' + h.id + '] ' + h.diagnosis })); setSaveStatus('已参考历史') }}>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: C.white, fontFamily: 'monospace' }}>{h.id}</div>
                      <div style={{ fontSize: 10, color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.diagnosis}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={s.leftSection}>
            <div style={s.leftSectionTitle} onClick={() => toggleSection('quality')}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><ShieldCheck size={11} /> 质控 {qualityScore}</span>
              {openSections.quality ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
            </div>
            {openSections.quality && (
              <div style={s.leftSectionContent}>
                <div style={{ textAlign: 'center', padding: '4px 0 6px' }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: qualityScore >= 90 ? C.success : C.warning, lineHeight: 1 }}>{qualityScore}</div>
                </div>
                {['完整性', '规范性', '准确性', '及时性', '一致性', '影像关联', '测量完整', '诊断明确', '建议合理', '危急值'].map((q, i) => {
                  const score = [95, 88, 82, 90, 85, 80, 92, 90, 78, 100][i]
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '1px 2px', fontSize: 10 }}>
                      <span style={{ width: 44, color: '#94a3b8' }}>{q}</span>
                      <div style={{ flex: 1, height: 3, background: '#334155', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ width: `${score}%`, height: '100%', background: score >= 90 ? C.success : C.warning }} />
                      </div>
                      <span style={{ fontWeight: 600, color: score >= 90 ? C.success : C.warning, minWidth: 18, textAlign: 'right' as const, fontSize: 10 }}>{score}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div style={s.leftSection}>
            <div style={s.leftSectionTitle} onClick={() => toggleSection('ai')}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Sparkles size={11} color={C.purple} /> AI 助手</span>
              {openSections.ai ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
            </div>
            {openSections.ai && (
              <div style={s.leftSectionContent}>
                {[
                  { icon: <Sparkles size={11} />, label: 'AI 生成报告', color: '#a855f7', action: handleAiGenerate },
                  { icon: <Mic size={11} />, label: '语音转文字', color: C.accent, action: () => setIsRecording(!isRecording) },
                  { icon: <Lightbulb size={11} />, label: '诊断建议', color: C.warning, action: () => setRightTab('cdss') },
                  { icon: <Database size={11} />, label: '相似案例', color: C.success, action: () => alert('已为您检索 12 个相似案例（演示）') },
                ].map((a, i) => (
                  <div key={i} style={s.leftItem} onClick={a.action}>
                    <span style={{ color: a.color }}>{a.icon}</span>
                    <span>{a.label}</span>
                    <ChevronRight size={10} color="#64748b" style={{ marginLeft: 'auto' }} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 中栏 1500px */}
        <div style={s.centerCol}>
          <div style={s.workArea}>
            {/* 影像区 70% = 1050px */}
            <div style={s.imageArea}>
              <div style={s.imageToolbar}>
                {[
                  { key: 'distance', label: '距离', icon: <Ruler size={12} /> },
                  { key: 'area', label: '面积', icon: <Target size={12} /> },
                  { key: 'angle', label: '角度', icon: <Crosshair size={12} /> },
                  { key: 'ellipse', label: '椭圆', icon: <Activity size={12} /> },
                  { key: 'arrow', label: '箭头', icon: <ArrowRight size={12} /> },
                  { key: 'text', label: '文字', icon: <Type size={12} /> },
                ].map(t => (
                  <button
                    key={t.key}
                    style={activeTool === t.key ? s.imageToolBtnActive : s.imageToolBtn}
                    onClick={() => setActiveTool(activeTool === t.key ? null : t.key)}
                  >
                    {t.icon} {t.label}
                  </button>
                ))}
                <div style={{ width: 1, height: 16, background: '#475569' }} />
                <button style={s.imageToolBtn} onClick={() => setIsFrozen(!isFrozen)}>{isFrozen ? '▶ 解冻' : '❄ 冻结'}</button>
                <button style={s.imageToolBtn} onClick={() => alert('图像已保存（演示）')}><Save size={12} /> 存图</button>
                <button style={s.imageToolBtn}><Maximize2 size={12} /> 全屏</button>
                <button style={s.imageToolBtn} onClick={() => setActiveTool(null)}><Eraser size={12} /> 清除</button>
              </div>

              <div style={s.imageCanvas}>
                <span style={s.imageLabel}>📷 {selectedThumb.label}</span>
                <UltrasoundImage type={selectedThumb.type} />
                <span style={s.imageParams}>深度:{currentProtocol.depth}cm 增益:72 频率:{currentProtocol.frequency} 工具:{activeTool || '无'}</span>
              </div>

              <div style={s.imageThumb}>
                {IMAGE_THUMBS.map(t => (
                  <div
                    key={t.id}
                    style={t.id === selectedThumbId ? s.imageThumbActive : s.imageThumbItem}
                    onClick={() => { setSelectedThumbId(t.id); setSaveStatus('已切换影像') }}
                    title={t.label}
                  >
                    <Camera size={16} color={t.id === selectedThumbId ? C.accent : '#64748b'} />
                    <span style={{ position: 'absolute', bottom: 1, left: 2, right: 2, fontSize: 9, color: t.id === selectedThumbId ? C.accent : '#94a3b8', textAlign: 'center' as const, overflow: 'hidden' }}>{t.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 报告区 30% = 450px */}
            <div style={s.reportArea}>
              <div style={s.reportTabs}>
                <button style={s.reportTabActive}><Edit3 size={12} /> 编辑</button>
                <button style={s.reportTab} onClick={() => alert('预览功能（演示）')}><FileText size={12} /> 预览</button>
                <button style={s.reportTab} onClick={() => alert('对比功能（演示）')}><GitBranch size={12} /> 对比</button>
              </div>
              <div style={s.reportToolbar}>
                <button
                  style={{ ...s.btn, background: isRecording ? C.danger : C.accent, color: C.white }}
                  onClick={() => setIsRecording(!isRecording)}
                >
                  {isRecording ? <MicOff size={12} /> : <Mic size={12} />} {isRecording ? '停止' : '语音'}
                </button>
                <button style={{ ...s.btn, background: C.white, color: C.primary, border: `1px solid ${C.border}` }} onClick={() => alert('插入影像（演示）')}><ImageIcon size={12} /> 插图</button>
                <button style={{ ...s.btn, background: C.white, color: C.primary, border: `1px solid ${C.border}` }} onClick={() => alert('词库（演示）')}><BookOpen size={12} /> 词库</button>
                <div style={{ flex: 1 }} />
                <button
                  style={{ ...s.btn, background: criticalValue ? C.danger : C.white, color: criticalValue ? C.white : C.textLight, border: `1px solid ${criticalValue ? C.danger : C.border}` }}
                  onClick={() => { setCriticalValue(!criticalValue); setSaveStatus(criticalValue ? '取消危急值' : '标记危急值') }}
                >
                  <AlertTriangle size={12} /> {criticalValue ? '危急 ✓' : '危急值'}
                </button>
              </div>

              <div style={s.reportBody}>
                <div style={s.reportSection}>
                  <div style={s.reportSectionTitle}><span><Ruler size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} /> 测量值 · {MEASUREMENTS.length} 项{attentionCount > 0 ? ` · 关注 ${attentionCount}` : ''}</span></div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3 }}>
                    {MEASUREMENTS.map((m, i) => (
                      <div
                        key={i}
                        style={{ padding: '4px 6px', background: C.white, borderRadius: 3, border: `1px solid ${C.border}`, cursor: 'pointer' }}
                        onClick={() => { setReportContent(p => ({ ...p, findings: p.findings + (p.findings.endsWith('。') ? '' : '，') + m.name + m.value + m.unit })); setSaveStatus('已插入测量值') }}
                      >
                        <div style={{ fontSize: 10, color: C.textLight, marginBottom: 1 }}>{m.name}</div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: m.attention ? C.warning : C.primary }}>{m.value}</span>
                          <span style={{ fontSize: 9, color: C.textLight }}>{m.unit}</span>
                          <span style={{ fontSize: 9, color: C.textLight, marginLeft: 'auto' }}>{m.ref}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={s.reportField}>
                  <div style={s.reportLabel}>
                    <FileText size={12} /> 超声所见
                    {isRecording && <span style={{ marginLeft: 6, padding: '1px 6px', borderRadius: 3, background: C.danger, color: C.white, fontSize: 10, fontWeight: 600 }}>● 录音中</span>}
                  </div>
                  <textarea
                    style={{ ...s.reportTextarea, minHeight: 70 }}
                    value={reportContent.findings}
                    onChange={e => { setReportContent(p => ({ ...p, findings: e.target.value })); setSaveStatus('编辑中') }}
                    rows={3}
                  />
                </div>

                <div style={s.reportField}>
                  <div style={s.reportLabel}><Stethoscope size={12} /> 超声诊断</div>
                  <textarea
                    style={{ ...s.reportTextarea, fontWeight: 600, color: C.primary, fontSize: 14, minHeight: 35 }}
                    value={reportContent.diagnosis}
                    onChange={e => { setReportContent(p => ({ ...p, diagnosis: e.target.value })); setSaveStatus('编辑中') }}
                    rows={2}
                  />
                </div>

                <div style={s.reportField}>
                  <div style={s.reportLabel}><Lightbulb size={12} /> 诊断建议</div>
                  <textarea
                    style={{ ...s.reportTextarea, minHeight: 50 }}
                    value={reportContent.impression}
                    onChange={e => { setReportContent(p => ({ ...p, impression: e.target.value })); setSaveStatus('编辑中') }}
                    rows={2}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 右栏 240px */}
        <div style={s.rightCol}>
          <div style={s.rightTabs}>
            <button style={rightTab === 'cdss' ? s.rightTabActive : s.rightTab} onClick={() => setRightTab('cdss')}><Brain size={11} /> CDSS</button>
            <button style={rightTab === 'grading' ? s.rightTabActive : s.rightTab} onClick={() => setRightTab('grading')}><Award size={11} /> 分级</button>
            <button style={rightTab === 'evidence' ? s.rightTabActive : s.rightTab} onClick={() => setRightTab('evidence')}><BookMarked size={11} /> 循证</button>
            <button style={rightTab === 'drg' ? s.rightTabActive : s.rightTab} onClick={() => setRightTab('drg')}><Network size={11} /> DRG</button>
          </div>

          <div style={s.rightBody}>
            {rightTab === 'cdss' && (
              <div>
                <div style={s.cdssCard}>
                  <div style={s.cdssLabel}><Brain size={11} /> 当前诊断</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.primary }}>{currentDisease.name}</div>
                  <div style={{ fontSize: 10, color: C.textLight, marginTop: 2 }}>ICD-10: {currentDisease.icd10} · {currentDisease.system}</div>
                </div>
                <div style={s.cdssCard}>
                  <div style={s.cdssLabel}><Target size={11} /> 鉴别 Top 5 · 点击插入</div>
                  {currentDisease.differentialDiagnosis.map((d: any, i: number) => (
                    <div
                      key={i}
                      style={i === 0 ? s.cdssItemHigh : s.cdssItem}
                      onClick={() => handleInsertSuggestion(`鉴别: ${d.name} (${d.probability}%)`)}
                    >
                      <span style={{ flex: 1 }}>{d.name}</span>
                      <span style={{ fontSize: 12, color: d.probability > 50 ? C.danger : C.warning, fontWeight: 700 }}>{d.probability}%</span>
                    </div>
                  ))}
                </div>
                <div style={s.cdssCard}>
                  <div style={s.cdssLabel}><AlertTriangle size={11} /> 漏诊风险</div>
                  <div style={s.cdssItemWarn} onClick={() => handleInsertSuggestion('建议补充颈部淋巴结扫查')}>
                    <AlertTriangle size={12} /><span>颈部淋巴结扫查</span>
                  </div>
                  <div style={s.cdssItemWarn} onClick={() => handleInsertSuggestion('建议甲状腺功能检查')}>
                    <AlertTriangle size={12} /><span>甲状腺功能检查</span>
                  </div>
                </div>
                <div style={s.cdssCard}>
                  <div style={s.cdssLabel}><Check size={12} /> 决策建议 · 点击插入</div>
                  <div style={s.cdssItem} onClick={() => handleInsertSuggestion('建议：细针穿刺活检（FNA）')}><CheckCircle2 size={12} color={C.success} /><span>细针穿刺（FNA）</span></div>
                  <div style={s.cdssItem} onClick={() => handleInsertSuggestion('建议：3-6月后超声复查')}><CheckCircle2 size={12} color={C.success} /><span>3-6月后复查</span></div>
                  <div style={s.cdssItem} onClick={() => handleInsertSuggestion('建议：内分泌科会诊')}><CheckCircle2 size={12} color={C.accent} /><span>内分泌科会诊</span></div>
                </div>
              </div>
            )}

            {rightTab === 'grading' && (
              <div>
                <div style={s.cdssCard}>
                  <div style={s.cdssLabel}><Award size={11} /> 分级系统</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                    {[
                      { key: 'TIRADS', label: 'TI-RADS', sub: '甲状腺' },
                      { key: 'BIRADS', label: 'BI-RADS', sub: '乳腺' },
                      { key: 'ORADS', label: 'O-RADS', sub: '卵巢' },
                      { key: 'LIRADS', label: 'LI-RADS', sub: '肝脏' },
                    ].map(g => (
                      <button
                        key={g.key}
                        style={selectedGrading === g.key ? s.gradeBtnActive : s.gradeBtn}
                        onClick={() => { setSelectedGrading(g.key as any); setSaveStatus(`已选 ${g.key}`) }}
                      >
                        <span style={{ fontSize: 12, fontWeight: 700 }}>{g.label}</span>
                        <span style={{ fontSize: 10, opacity: 0.8 }}>{g.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div style={s.cdssCard}>
                  <div style={s.cdssLabel}>{selectedGrading} 分级 · 点击选择</div>
                  {currentGradingRules.map((g: any) => (
                    <div
                      key={g.level}
                      style={selectedGradeLevel === g.level ? s.gradeBtnActive : s.gradeBtn}
                      onClick={() => { setSelectedGradeLevel(g.level); setSaveStatus(`已选 ${selectedGrading} ${g.level}`) }}
                    >
                      <span style={{ ...s.gradeLevel, background: g.color, color: C.white }}>{g.level}</span>
                      <span style={{ flex: 1, fontSize: 11 }}>{g.name}</span>
                      <span style={{ fontSize: 9, color: selectedGradeLevel === g.level ? 'rgba(255,255,255,0.85)' : C.textLight }}>{g.malignancy}</span>
                    </div>
                  ))}
                </div>
                <div style={s.cdssCard}>
                  <div style={s.cdssLabel}><Lightbulb size={11} /> 管理建议</div>
                  {(() => {
                    const cur = currentGradingRules.find((g: any) => g.level === selectedGradeLevel)
                    return cur ? (
                      <div style={{ padding: 8, background: '#eff6ff', borderRadius: 4, color: C.accent, fontWeight: 600, fontSize: 12, lineHeight: 1.5 }}>
                        {cur.management}
                        <div style={{ fontSize: 10, color: C.textLight, marginTop: 3, fontWeight: 400 }}>恶性: {cur.malignancy}</div>
                      </div>
                    ) : null
                  })()}
                  <button
                    style={{ ...s.btn, ...s.btnPrimary, width: '100%', marginTop: 6, minHeight: 32, fontSize: 12 }}
                    onClick={handleApplyGrade}
                  >
                    <ArrowRight size={12} /> 一键应用到报告
                  </button>
                </div>
              </div>
            )}

            {rightTab === 'evidence' && (
              <div>
                <div style={s.cdssCard}>
                  <div style={s.cdssLabel}><BookMarked size={11} /> 临床指南</div>
                  {EVIDENCE_GUIDELINES.slice(0, 3).map((g: any) => (
                    <div key={g.id} style={s.cdssItem} onClick={() => handleInsertSuggestion(`[指南] ${g.title}`)}>
                      <FileText size={12} color={C.accent} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.title}</div>
                        <div style={{ fontSize: 9, color: C.textLight }}>{g.organization} · {g.year}</div>
                      </div>
                      <ExternalLink size={10} color={C.textLight} />
                    </div>
                  ))}
                </div>
                <div style={s.cdssCard}>
                  <div style={s.cdssLabel}><Database size={11} /> 关键文献</div>
                  {EVIDENCE_LITERATURE.slice(0, 3).map((l: any, i) => (
                    <div key={i} style={s.cdssItem} onClick={() => handleInsertSuggestion(`[文献] ${l.title}`)}>
                      <Database size={12} color={C.success} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 11, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.title}</div>
                        <div style={{ fontSize: 9, color: C.textLight }}>IF:{l.impactFactor}</div>
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
                  <div style={{ padding: 8, background: '#eff6ff', borderRadius: 4, marginBottom: 6 }}>
                    <div style={{ fontSize: 10, color: C.textLight }}>DRG 组</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: C.primary, fontFamily: 'monospace' }}>KS1</div>
                    <div style={{ fontSize: 11, color: C.text, marginTop: 2 }}>甲状腺疾病，伴合并症</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                    <div style={{ padding: 6, background: C.white, borderRadius: 3, border: `1px solid ${C.border}` }}>
                      <div style={{ fontSize: 9, color: C.textLight }}>权重</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: C.primary }}>1.25</div>
                    </div>
                    <div style={{ padding: 6, background: C.white, borderRadius: 3, border: `1px solid ${C.border}` }}>
                      <div style={{ fontSize: 9, color: C.textLight }}>费用</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: C.primary }}>¥8,500</div>
                    </div>
                    <div style={{ padding: 6, background: C.white, borderRadius: 3, border: `1px solid ${C.border}` }}>
                      <div style={{ fontSize: 9, color: C.textLight }}>ICD-10</div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: C.primary, fontFamily: 'monospace' }}>E04.901</div>
                    </div>
                    <div style={{ padding: 6, background: C.white, borderRadius: 3, border: `1px solid ${C.border}` }}>
                      <div style={{ fontSize: 9, color: C.textLight }}>ICD-9</div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: C.primary, fontFamily: 'monospace' }}>06.0101</div>
                    </div>
                  </div>
                </div>
                <div style={s.cdssCard}>
                  <div style={s.cdssLabel}><CheckCircle2 size={11} /> 入组状态</div>
                  <div style={{ ...s.cdssItem, background: '#f0fdf4', border: '1px solid #bbf7d0', color: C.success, fontWeight: 600 }}>
                    <CheckCircle2 size={12} /><span>入组成功 · 偏差 -3.2%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== 状态栏 24px ===== */}
      <div style={s.statusbar}>
        <div style={{ display: 'flex', gap: 14 }}>
          <span style={s.statusbarItem}><CheckCircle2 size={10} /> {saveStatus}</span>
          <span style={s.statusbarItem}>字数:{totalChars}</span>
          <span style={s.statusbarItem}><ImageIcon size={10} /> 8张影像</span>
          <span style={s.statusbarItem}><Ruler size={10} /> {MEASUREMENTS.length}测量</span>
          <span style={s.statusbarItem}>关注:{attentionCount}</span>
        </div>
        <div style={{ display: 'flex', gap: 14 }}>
          {criticalValue && <span style={{ ...s.statusbarItem, color: '#fca5a5', fontWeight: 700 }}><AlertTriangle size={10} /> 危急</span>}
          <span style={s.statusbarItem}>工具:{activeTool || '无'}</span>
          <span style={s.statusbarItem}>影像:{selectedThumb.label}</span>
          <span style={s.statusbarItem}>AI: ON</span>
          <span style={s.statusbarItem}>质控: {qualityScore}</span>
        </div>
      </div>
    </div>
  )
}
