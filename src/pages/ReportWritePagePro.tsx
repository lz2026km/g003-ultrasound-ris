/**
 * 超声报告工作站 - 超完整版
 * @version v0.18.7
 *
 * 1920×1080 Win桌面级 | 影像70%=1050px
 * 所有按钮真实可点 | 扩充丰富数据 | ErrorBoundary保护
 */

import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FileText, Stethoscope, Activity, BookOpen, History, ShieldCheck,
  Save, Printer, Send, Mic, MicOff, Camera, Ruler, Image as ImageIcon, Type,
  ChevronDown, ChevronRight, Sparkles, AlertTriangle,
  Brain, Award, Network, BookMarked, Target, Lightbulb, ExternalLink,
  Database, ListChecks, GitBranch, CheckCircle2,
  ArrowRight, Crosshair, Edit3, Home, Check, Maximize2, Eraser, Undo2, Redo2,
  Download, Share2, Copy, Eye, Layers, MessageSquare, Phone, User,
  RefreshCw, Settings, Filter, Search, ChevronUp, FileDown, Heart, FlaskConical
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
  topbarLeft: { display: 'flex', alignItems: 'center', gap: 8 },
  topbarRight: { display: 'flex', alignItems: 'center', gap: 4 },
  btn: { padding: '4px 10px', borderRadius: 5, border: 'none', fontSize: 12, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, minHeight: 28, justifyContent: 'center', transition: 'all 0.15s' },
  btnBack: { background: 'rgba(255,255,255,0.15)', color: C.white, border: '1px solid rgba(255,255,255,0.3)' },
  btnSuccess: { background: C.success, color: C.white },
  btnPrimary: { background: C.accent, color: C.white },
  btnDanger: { background: C.danger, color: C.white },

  reportId: { fontSize: 13, fontWeight: 700, color: C.white, fontFamily: 'monospace' },
  patientChip: { padding: '3px 8px', background: 'rgba(255,255,255,0.15)', borderRadius: 5, fontSize: 12, color: C.white, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 },
  statusChip: { padding: '2px 8px', borderRadius: 5, fontSize: 11, fontWeight: 600 },
  scoreChip: { padding: '2px 8px', borderRadius: 5, fontSize: 12, fontWeight: 700, color: C.white },

  cols: { display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 },

  leftCol: { width: 200, background: '#1e293b', color: '#cbd5e1', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0, borderRight: '1px solid #334155' },
  leftSection: { borderBottom: '1px solid #334155', overflow: 'hidden' },
  leftSectionTitle: { padding: '7px 10px', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' as const, letterSpacing: 0.8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0f172a', cursor: 'pointer', userSelect: 'none' as const, minHeight: 30 },
  leftSectionContent: { padding: '3px 6px 5px', maxHeight: 200, overflowY: 'auto' as const },
  leftItem: { padding: '5px 8px', borderRadius: 4, fontSize: 12, color: '#cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 1, minHeight: 28, transition: 'all 0.15s' },
  leftItemActive: { padding: '5px 8px', borderRadius: 4, fontSize: 12, color: C.white, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 1, background: C.accent, fontWeight: 600, minHeight: 28 },
  leftSearch: { width: '100%', padding: '4px 8px', background: '#0f172a', border: '1px solid #334155', borderRadius: 4, color: C.white, fontSize: 11, outline: 'none', boxSizing: 'border-box' as const, margin: '0 6px 4px', width: 'calc(100% - 12px)' },

  centerCol: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 },
  workArea: { display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 },

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

  rightCol: { width: 260, background: C.white, borderLeft: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 },
  rightTabs: { display: 'flex', borderBottom: `1px solid ${C.border}`, background: '#fafbfc', flexShrink: 0, flexWrap: 'wrap' as const },
  rightTab: { flex: 1, minWidth: 50, padding: '8px 4px', fontSize: 11, color: C.textLight, cursor: 'pointer', border: 'none', background: 'transparent', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, borderBottom: '2px solid transparent' },
  rightTabActive: { flex: 1, minWidth: 50, padding: '8px 4px', fontSize: 11, color: C.primary, cursor: 'pointer', border: 'none', background: C.white, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, borderBottom: `2px solid ${C.primary}` },
  rightBody: { flex: 1, padding: 8, overflowY: 'auto' as const },

  cdssCard: { padding: 8, background: '#f8fafc', borderRadius: 5, marginBottom: 6, border: `1px solid ${C.border}` },
  cdssLabel: { fontSize: 11, fontWeight: 700, color: C.textLight, marginBottom: 5, display: 'flex', alignItems: 'center', gap: 3, textTransform: 'uppercase' as const, letterSpacing: 0.5 },
  cdssItem: { padding: '5px 7px', background: C.white, borderRadius: 4, marginBottom: 3, fontSize: 12, color: C.text, display: 'flex', alignItems: 'center', gap: 5, border: `1px solid ${C.border}`, minHeight: 28, cursor: 'pointer', transition: 'all 0.15s' },
  cdssItemHigh: { padding: '5px 7px', background: '#fef2f2', borderRadius: 4, marginBottom: 3, fontSize: 12, color: C.danger, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5, border: '1px solid #fecaca', minHeight: 28, cursor: 'pointer' },
  cdssItemWarn: { padding: '5px 7px', background: '#fff7ed', borderRadius: 4, marginBottom: 3, fontSize: 12, color: C.warning, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5, border: '1px solid #fed7aa', minHeight: 28, cursor: 'pointer' },

  gradeBtn: { padding: '5px 7px', borderRadius: 4, fontSize: 11, color: C.text, cursor: 'pointer', border: `1px solid ${C.border}`, marginBottom: 3, background: C.white, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 5, minHeight: 30, transition: 'all 0.15s' },
  gradeBtnActive: { padding: '5px 7px', borderRadius: 4, fontSize: 11, color: C.white, cursor: 'pointer', border: `2px solid ${C.primary}`, marginBottom: 3, background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 5, fontWeight: 600, minHeight: 30 },
  gradeLevel: { fontWeight: 700, fontSize: 11, padding: '2px 6px', borderRadius: 3, minWidth: 30, textAlign: 'center' as const },

  statusbar: { background: '#0f172a', color: C.white, padding: '4px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, height: 24, fontSize: 11, borderTop: '1px solid #334155' },
  statusbarItem: { display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, opacity: 0.9 },
}

// ========== 真实患者数据 ==========
const CURRENT_PATIENT = { id: 'P2026-0528', name: '王秀珍', age: 52, gender: '女', idNo: '510********1234', exam: '甲状腺US', request: '甲状腺超声检查（常规）', doctor: '张建国', dept: '超声科', phone: '138********', address: '四川省成都市武侯区' }

// ========== 8+ 条历史报告 ==========
const HISTORY_REPORTS = [
  { id: 'R2024-03-12', date: '2024-03-12', diagnosis: '甲状腺右叶结节 TI-RADS 2（0.8cm）', impression: '良性，建议年度随访' },
  { id: 'R2024-12-05', date: '2024-12-05', diagnosis: '甲状腺右叶结节 TI-RADS 3（1.0cm）', impression: '良性可能，建议12月随访' },
  { id: 'R2025-03-08', date: '2025-03-08', diagnosis: '甲状腺右叶结节 TI-RADS 3（1.0cm）', impression: '稳定' },
  { id: 'R2025-06-12', date: '2025-06-12', diagnosis: '甲状腺右叶结节 TI-RADS 3（较前无明显变化）', impression: '继续随访' },
  { id: 'R2025-09-15', date: '2025-09-15', diagnosis: '甲状腺右叶结节 TI-RADS 3（1.1cm）', impression: '缓慢增长' },
  { id: 'R2025-12-10', date: '2025-12-10', diagnosis: '甲状腺右叶结节 TI-RADS 3（1.2×0.9cm）', impression: '6月后复查' },
  { id: 'R2026-03-01', date: '2026-03-01', diagnosis: '甲状腺右叶结节 TI-RADS 4a（1.4×1.0cm）', impression: '低度可疑，建议FNA' },
  { id: 'R2026-05-15', date: '2026-05-15', diagnosis: '甲状腺右叶结节 TI-RADS 4a（1.5×1.1cm）', impression: '较前增大，建议FNA', current: true },
]

// ========== 8 张不同切面 ==========
const IMAGE_THUMBS = [
  { id: 1, label: '横切-右叶', type: 'thyroid-axial' },
  { id: 2, label: '纵切-右叶', type: 'thyroid-sagittal' },
  { id: 3, label: '横切-左叶', type: 'thyroid-axial-left' },
  { id: 4, label: 'CDFI-右', type: 'cdfi' },
  { id: 5, label: '弹性成像', type: 'elastography' },
  { id: 6, label: '颈部LN', type: 'lymph-node' },
  { id: 7, label: '峡部', type: 'isthmus' },
  { id: 8, label: '胸骨上', type: 'suprasternal' },
]

const MEASUREMENTS = [
  { name: '右叶 长径', value: '4.8', unit: 'cm', ref: '<5.0' },
  { name: '右叶 宽径', value: '1.8', unit: 'cm', ref: '<2.0' },
  { name: '右叶 厚径', value: '1.6', unit: 'cm', ref: '<2.0' },
  { name: '左叶 长径', value: '4.6', unit: 'cm', ref: '<5.0' },
  { name: '左叶 宽径', value: '1.7', unit: 'cm', ref: '<2.0' },
  { name: '左叶 厚径', value: '1.5', unit: 'cm', ref: '<2.0' },
  { name: '峡部厚度', value: '0.4', unit: 'cm', ref: '<0.5' },
  { name: '右结节 长', value: '1.5', unit: 'cm', ref: '-', attention: true },
  { name: '右结节 宽', value: '1.1', unit: 'cm', ref: '-', attention: true },
  { name: '右结节 厚', value: '0.9', unit: 'cm', ref: '-', attention: true },
]

// ========== 报告模板（一键应用）==========
const REPORT_TEMPLATES = [
  { id: 'T1', name: '甲状腺常规', icon: '🩺', text: '甲状腺大小正常，形态规则，包膜完整。双侧腺体回声均匀，未见明显占位。CDFI：血流信号未见明显异常。颈部未见明显肿大淋巴结。' },
  { id: 'T2', name: '甲状腺结节', icon: '🔵', text: '甲状腺大小正常，形态规则，包膜完整。右叶见一低回声结节，大小约 1.5×1.1×0.9 cm，边界欠清，形态欠规则，内回声不均匀，可见多发点状强回声。CDFI：结节内可见血流信号。TI-RADS 4a。' },
  { id: 'T3', name: '腹部常规', icon: '🫃', text: '肝脏大小正常，包膜光整，实质回声均匀，未见占位。胆囊大小正常，壁不厚，腔内未见结石。胰腺大小正常，回声均匀。脾脏不大。双肾大小正常，集合系统未见分离。' },
  { id: 'T4', name: '心脏常规', icon: '❤️', text: '左心室壁厚度正常，运动协调，收缩功能正常。LVEF 65%。各瓣膜结构未见明显异常，瓣口血流速度正常，未见明显反流。左心房、右心室大小正常。' },
]

// ========== 患者教育材料 ==========
const PATIENT_EDUCATION = [
  { title: 'TI-RADS 4a 解读', content: '您的甲状腺结节为 4a 类，恶性风险约 2-10%。建议进行细针穿刺活检（FNA）以明确诊断。多数 4a 类结节病理结果为良性。' },
  { title: 'FNA 流程说明', content: '细针穿刺活检是微创操作，在超声引导下进行，约 10-15 分钟。术后可能有轻微疼痛或瘀青，1-2 天可恢复。病理结果通常 3-5 个工作日出。' },
  { title: '随访建议', content: '建议 3-6 个月后复查超声，观察结节变化。如有声音嘶哑、吞咽困难、颈部淋巴结肿大等症状，请及时就诊。' },
]

// ========== 同义词库（点击替换）==========
const SYNONYMS: Record<string, string[]> = {
  '低回声': ['低弱回声', '暗回声', '弱回声'],
  '高回声': ['强回声', '亮回声', '高强回声'],
  '等回声': ['等强回声', '中等回声', '正常回声'],
  '无回声': ['液性暗区', '无回声区', '液性回声'],
  '边界清晰': ['边界清楚', '边缘清晰', '边缘锐利', '包膜完整'],
  '边界欠清': ['边界不清', '边缘模糊', '边缘欠规整'],
  'CDFI': ['彩色多普勒', '彩超', '彩色血流'],
  '纵横比>1': ['纵横比大于1', '高大于宽', '前后径大于横径'],
}

// ========== 完整疾病知识图谱（基于现有数据）==========
const FULL_DIFFERENTIAL = [
  { name: '结节性甲状腺肿', probability: 45, reason: '最常见良性病变，多发结节常见' },
  { name: '甲状腺腺瘤', probability: 25, reason: '良性肿瘤，包膜完整' },
  { name: '甲状腺乳头状癌', probability: 18, reason: '最常见甲状腺癌（约80%），微钙化提示' },
  { name: '甲状腺髓样癌', probability: 5, reason: '少见，常伴降钙素升高' },
  { name: '甲状腺未分化癌', probability: 3, reason: '罕见，多见于老年，进展快' },
  { name: '甲状腺淋巴瘤', probability: 2, reason: '罕见，常有桥本背景' },
  { name: '亚急性甲状腺炎', probability: 2, reason: '可有压痛，临床可鉴别' },
]

// ========== 完整治疗建议库 ==========
const TREATMENT_OPTIONS = [
  { name: '细针穿刺活检（FNA）', priority: 'high', desc: '明确结节性质的金标准' },
  { name: '甲状腺功能检查', priority: 'medium', desc: '评估TSH/FT3/FT4水平' },
  { name: '颈部MRI增强', priority: 'medium', desc: '评估结节与周围结构关系' },
  { name: '3-6月后超声复查', priority: 'high', desc: '监测结节变化' },
  { name: '内分泌科会诊', priority: 'medium', desc: '评估是否需要药物治疗' },
  { name: '外科会诊', priority: 'low', desc: '如FNA阳性需手术评估' },
  { name: '核医学科会诊', priority: 'low', desc: '评估是否需要核素治疗' },
  { name: '病理科会诊', priority: 'low', desc: 'FNA后病理诊断' },
]

// ========== 关联检查推荐 ==========
const RELATED_EXAMS = [
  { name: '甲状腺功能五项', urgency: '高', cost: '¥180', reason: '评估甲状腺功能状态' },
  { name: '甲状腺自身抗体', urgency: '中', cost: '¥220', reason: '排除自身免疫性甲状腺炎' },
  { name: '降钙素', urgency: '高', cost: '¥80', reason: '排除髓样癌' },
  { name: '甲状腺球蛋白', urgency: '中', cost: '¥80', reason: '术后监测指标' },
  { name: '颈部CT平扫+增强', urgency: '中', cost: '¥680', reason: '评估淋巴结及周围结构' },
  { name: 'PET-CT', urgency: '低', cost: '¥8500', reason: '如确诊恶性，分期评估' },
]

// ========== SVG 影像渲染器（8 种完整）==========
const UltrasoundImage: React.FC<{ type: string }> = ({ type }) => {
  const W = 1050, H = 1008
  if (type === 'thyroid-axial') {
    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ background: '#000' }}>
        <defs>
          <radialGradient id="us1" cx="50%" cy="0%" r="100%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.18" />
            <stop offset="50%" stopColor="#475569" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0.85" />
          </radialGradient>
        </defs>
        <path d={`M ${W/2} 0 L ${W*0.1} ${H} L ${W*0.9} ${H} Z`} fill="url(#us1)" />
        {Array.from({ length: 250 }).map((_, i) => {
          const x = W/2 + (Math.random() - 0.5) * 700; const y = Math.random() * H
          return <circle key={i} cx={x} cy={y} r={Math.random() * 8 + 2} fill="#475569" opacity={Math.random() * 0.3 + 0.1} />
        })}
        {/* 甲状腺蝴蝶形 */}
        <ellipse cx={W*0.28} cy={H*0.45} rx={110} ry={75} fill="#94a3b8" opacity="0.4" stroke="#cbd5e1" strokeWidth="1.5" />
        <ellipse cx={W*0.72} cy={H*0.45} rx={120} ry={80} fill="#94a3b8" opacity="0.4" stroke="#cbd5e1" strokeWidth="1.5" />
        <ellipse cx={W*0.28} cy={H*0.45} rx={70} ry={50} fill="#475569" opacity="0.5" />
        <ellipse cx={W*0.72} cy={H*0.45} rx={75} ry={55} fill="#475569" opacity="0.5" />
        {/* 右叶结节 - 高亮 */}
        <ellipse cx={W*0.72} cy={H*0.45} rx={32} ry={24} fill="#1e293b" opacity="0.7" stroke="#fbbf24" strokeWidth="2.5" strokeDasharray="4 2" />
        {/* 微钙化点 */}
        {Array.from({ length: 10 }).map((_, i) => (
          <circle key={i} cx={W*0.72 + (Math.random()-0.5)*45} cy={H*0.45 + (Math.random()-0.5)*35} r="2" fill="#fff" opacity="0.95" />
        ))}
        {/* 测量标尺 */}
        <line x1={W*0.66} y1={H*0.32} x2={W*0.78} y2={H*0.32} stroke="#10b981" strokeWidth="2" />
        <text x={W*0.72} y={H*0.30} fill="#10b981" fontSize="13" textAnchor="middle" fontWeight="bold">↔ 1.5 cm</text>
        <line x1={W*0.65} y1={H*0.58} x2={W*0.79} y2={H*0.58} stroke="#10b981" strokeWidth="2" />
        <text x={W*0.72} y={H*0.62} fill="#10b981" fontSize="13" textAnchor="middle" fontWeight="bold">↔ 1.1 cm</text>
        {/* 标签 */}
        <text x={W*0.62} y={H*0.40} fill="#fbbf24" fontSize="14" textAnchor="middle" fontWeight="bold">★ 结节</text>
        <text x={W*0.62} y={H*0.50} fill="#cbd5e1" fontSize="11" textAnchor="middle">1.5×1.1×0.9 cm</text>
        <text x={W*0.62} y={H*0.53} fill="#94a3b8" fontSize="10" textAnchor="middle">低回声 · 边界欠清 · 微钙化</text>
        <text x={W*0.18} y={H*0.40} fill="#cbd5e1" fontSize="14" textAnchor="middle" fontWeight="bold">左叶</text>
        <text x={W*0.18} y={H*0.43} fill="#94a3b8" fontSize="10" textAnchor="middle">回声均匀</text>
        <text x={W*0.82} y={H*0.40} fill="#cbd5e1" fontSize="14" textAnchor="middle" fontWeight="bold">右叶</text>
        <text x={W*0.82} y={H*0.43} fill="#94a3b8" fontSize="10" textAnchor="middle">见结节</text>
        <rect x={W*0.48} y={H*0.44} width={W*0.04} height={6} fill="#64748b" opacity="0.7" />
        <text x={W*0.5} y={H*0.48} fill="#cbd5e1" fontSize="10" textAnchor="middle">峡部</text>
        {/* 网格 */}
        {Array.from({ length: 10 }).map((_, i) => (<line key={i} x1={0} y1={i * H/10} x2={W} y2={i * H/10} stroke="#1e293b" strokeWidth="0.5" opacity="0.4" />))}
        {Array.from({ length: 10 }).map((_, i) => (<line key={i} x1={i * W/10} y1={0} x2={i * W/10} y2={H} stroke="#1e293b" strokeWidth="0.5" opacity="0.4" />))}
      </svg>
    )
  }
  if (type === 'thyroid-sagittal') {
    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} style={{ background: '#000' }}>
        <defs>
          <radialGradient id="us2" cx="50%" cy="0%" r="100%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0.85" />
          </radialGradient>
        </defs>
        <path d={`M ${W/2} 0 L ${W*0.1} ${H} L ${W*0.9} ${H} Z`} fill="url(#us2)" />
        {Array.from({ length: 200 }).map((_, i) => {
          const x = W/2 + (Math.random() - 0.5) * 600; const y = Math.random() * H
          return <circle key={i} cx={x} cy={y} r={Math.random() * 6 + 1} fill="#475569" opacity={Math.random() * 0.3 + 0.1} />
        })}
        <ellipse cx={W*0.5} cy={H*0.5} rx={200} ry={110} fill="#94a3b8" opacity="0.4" stroke="#cbd5e1" strokeWidth="1.5" />
        <ellipse cx={W*0.5} cy={H*0.5} rx={140} ry={80} fill="#475569" opacity="0.5" />
        <ellipse cx={W*0.5} cy={H*0.5} rx={55} ry={35} fill="#1e293b" opacity="0.7" stroke="#fbbf24" strokeWidth="2.5" strokeDasharray="4 2" />
        {Array.from({ length: 8 }).map((_, i) => (
          <circle key={i} cx={W*0.5 + (Math.random()-0.5)*70} cy={H*0.5 + (Math.random()-0.5)*45} r="2" fill="#fff" opacity="0.95" />
        ))}
        <text x={W*0.5} y={H*0.34} fill="#fbbf24" fontSize="16" textAnchor="middle" fontWeight="bold">★ 纵切面</text>
        <text x={W*0.5} y={H*0.37} fill="#cbd5e1" fontSize="11" textAnchor="middle">右叶纵切面（含结节）</text>
        <line x1={W*0.32} y1={H*0.5} x2={W*0.68} y2={H*0.5} stroke="#10b981" strokeWidth="2" />
        <text x={W*0.5} y={H*0.48} fill="#10b981" fontSize="13" textAnchor="middle" fontWeight="bold">1.5 cm (长径)</text>
        <line x1={W*0.5} y1={H*0.6} x2={W*0.5} y2={H*0.42} stroke="#10b981" strokeWidth="2" />
        <text x={W*0.55} y={H*0.5} fill="#10b981" fontSize="13" fontWeight="bold">0.9 cm</text>
        {Array.from({ length: 10 }).map((_, i) => (<line key={i} x1={0} y1={i * H/10} x2={W} y2={i * H/10} stroke="#1e293b" strokeWidth="0.5" opacity="0.4" />))}
      </svg>
    )
  }
  if (type === 'thyroid-axial-left') {
    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} style={{ background: '#000' }}>
        <defs>
          <radialGradient id="us3" cx="50%" cy="0%" r="100%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0.85" />
          </radialGradient>
        </defs>
        <path d={`M ${W/2} 0 L ${W*0.1} ${H} L ${W*0.9} ${H} Z`} fill="url(#us3)" />
        {Array.from({ length: 180 }).map((_, i) => {
          const x = W/2 + (Math.random() - 0.5) * 600; const y = Math.random() * H
          return <circle key={i} cx={x} cy={y} r={Math.random() * 6 + 1} fill="#475569" opacity={Math.random() * 0.3 + 0.1} />
        })}
        {/* 左叶（详细）*/}
        <ellipse cx={W*0.35} cy={H*0.45} rx={130} ry={90} fill="#94a3b8" opacity="0.4" stroke="#cbd5e1" strokeWidth="1.5" />
        <ellipse cx={W*0.35} cy={H*0.45} rx={80} ry={58} fill="#475569" opacity="0.5" />
        {/* 右叶（小、无结节）*/}
        <ellipse cx={W*0.75} cy={H*0.45} rx={100} ry={70} fill="#94a3b8" opacity="0.3" stroke="#cbd5e1" strokeWidth="1" />
        <ellipse cx={W*0.75} cy={H*0.45} rx={65} ry={45} fill="#475569" opacity="0.4" />
        <text x={W*0.35} y={H*0.40} fill="#cbd5e1" fontSize="16" textAnchor="middle" fontWeight="bold">左叶（详细）</text>
        <text x={W*0.35} y={H*0.50} fill="#10b981" fontSize="12" textAnchor="middle">回声均匀 · 形态规则</text>
        <text x={W*0.35} y={H*0.53} fill="#94a3b8" fontSize="10" textAnchor="middle">4.6×1.7×1.5 cm</text>
        <text x={W*0.75} y={H*0.40} fill="#cbd5e1" fontSize="14" textAnchor="middle" fontWeight="bold">右叶</text>
        <text x={W*0.75} y={H*0.50} fill="#94a3b8" fontSize="11" textAnchor="middle">见结节（详见另帧）</text>
        <text x={W*0.5} y={H*0.85} fill="#10b981" fontSize="12" textAnchor="middle">✓ 左叶未见明显占位</text>
        {Array.from({ length: 10 }).map((_, i) => (<line key={i} x1={0} y1={i * H/10} x2={W} y2={i * H/10} stroke="#1e293b" strokeWidth="0.5" opacity="0.4" />))}
      </svg>
    )
  }
  if (type === 'cdfi') {
    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} style={{ background: '#000' }}>
        <defs>
          <radialGradient id="us4" cx="50%" cy="0%" r="100%">
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0.9" />
          </radialGradient>
        </defs>
        <path d={`M ${W/2} 0 L ${W*0.1} ${H} L ${W*0.9} ${H} Z`} fill="url(#us4)" />
        <ellipse cx={W*0.5} cy={H*0.5} rx={220} ry={130} fill="#475569" opacity="0.4" />
        {/* 随机血流信号 */}
        {Array.from({ length: 100 }).map((_, i) => {
          const x = W*0.5 + (Math.random()-0.5) * 320; const y = H*0.5 + (Math.random()-0.5) * 200
          const colors = ['#ef4444', '#f59e0b', '#eab308', '#84cc16', '#06b6d4']
          return <circle key={i} cx={x} cy={y} r={Math.random() * 3 + 1} fill={colors[Math.floor(Math.random() * 5)]} opacity={Math.random() * 0.7 + 0.3} />
        })}
        {/* 结节内血流（丰富）*/}
        {Array.from({ length: 30 }).map((_, i) => {
          const x = W*0.5 + (Math.random()-0.5) * 100; const y = H*0.5 + (Math.random()-0.5) * 70
          return <circle key={i} cx={x} cy={y} r="2.5" fill="#ef4444" opacity="0.95" />
        })}
        <text x={W*0.5} y={H*0.18} fill="#ef4444" fontSize="18" textAnchor="middle" fontWeight="bold">CDFI 彩色多普勒</text>
        <text x={W*0.5} y={H*0.22} fill="#fbbf24" fontSize="12" textAnchor="middle">结节内血流信号 Adler II 级（较丰富）</text>
        <text x={W*0.5} y={H*0.86} fill="#cbd5e1" fontSize="13" textAnchor="middle">周围组织血流正常 · RI=0.72</text>
        <text x={W*0.5} y={H*0.90} fill="#94a3b8" fontSize="11" textAnchor="middle">（提示新生血管，可疑征象）</text>
      </svg>
    )
  }
  if (type === 'elastography') {
    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} style={{ background: '#000' }}>
        <path d={`M ${W/2} 0 L ${W*0.1} ${H} L ${W*0.9} ${H} Z`} fill="rgba(0,0,0,0.85)" />
        {Array.from({ length: 400 }).map((_, i) => {
          const x = W*0.5 + (Math.random()-0.5) * 450; const y = H*0.5 + (Math.random()-0.5) * 260
          const r = Math.random() * 12 + 3
          const ratio = Math.sqrt(Math.pow((x - W*0.5) / 240, 2) + Math.pow((y - H*0.5) / 140, 2))
          const color = ratio < 0.3 ? '#1e40af' : ratio < 0.55 ? '#0d9488' : ratio < 0.75 ? '#eab308' : '#dc2626'
          return <circle key={i} cx={x} cy={y} r={r} fill={color} opacity={Math.random() * 0.4 + 0.4} />
        })}
        <text x={W*0.5} y={H*0.13} fill="#eab308" fontSize="18" textAnchor="middle" fontWeight="bold">弹性成像 (Elastography)</text>
        <text x={W*0.5} y={H*0.86} fill="#cbd5e1" fontSize="14" textAnchor="middle">Emean = <tspan fill="#ef4444" fontWeight="bold">65 kPa</tspan> · SR = <tspan fill="#ef4444" fontWeight="bold">3.2</tspan></text>
        <text x={W*0.5} y={H*0.90} fill="#fbbf24" fontSize="12" textAnchor="middle">硬度等级：3级（中等硬度，提示可疑）</text>
        <text x={W*0.5} y={H*0.94} fill="#94a3b8" fontSize="10" textAnchor="middle">（建议结合其他征象综合判断）</text>
      </svg>
    )
  }
  if (type === 'lymph-node') {
    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} style={{ background: '#000' }}>
        <path d={`M ${W/2} 0 L ${W*0.1} ${H} L ${W*0.9} ${H} Z`} fill="rgba(0,0,0,0.85)" />
        {[
          { x: 0.25, y: 0.25, r: 38, label: 'II 区', id: 'LN1' },
          { x: 0.4, y: 0.35, r: 28, label: 'III 区', id: 'LN2' },
          { x: 0.6, y: 0.35, r: 32, label: 'IV 区', id: 'LN3', suspicious: true },
          { x: 0.75, y: 0.4, r: 25, label: 'IV 区', id: 'LN4' },
          { x: 0.3, y: 0.65, r: 22, label: 'V 区', id: 'LN5' },
          { x: 0.5, y: 0.7, r: 20, label: 'VI 区', id: 'LN6' },
          { x: 0.7, y: 0.7, r: 24, label: 'VI 区', id: 'LN7' },
        ].map((ln, i) => (
          <g key={i}>
            <ellipse cx={W*ln.x} cy={H*ln.y} rx={ln.r} ry={ln.r*0.7} fill="#475569" opacity="0.5" stroke={ln.suspicious ? "#ef4444" : "#cbd5e1"} strokeWidth={ln.suspicious ? 2.5 : 1.5} strokeDasharray={ln.suspicious ? "4 2" : "0"} />
            <circle cx={W*ln.x} cy={H*ln.y} r={ln.r*0.3} fill="#1e293b" opacity="0.8" />
            <text x={W*ln.x} y={H*ln.y - ln.r - 8} fill={ln.suspicious ? "#ef4444" : "#fbbf24"} fontSize="13" textAnchor="middle" fontWeight="bold">{ln.label}</text>
            <text x={W*ln.x} y={H*ln.y + 4} fill="#cbd5e1" fontSize="11" textAnchor="middle">{(ln.r*0.25).toFixed(1)}cm</text>
            <text x={W*ln.x} y={H*ln.y + 18} fill="#94a3b8" fontSize="9" textAnchor="middle">{ln.id}</text>
          </g>
        ))}
        <text x={W*0.5} y={H*0.92} fill="#ef4444" fontSize="13" textAnchor="middle" fontWeight="bold">⚠ IV 区淋巴结：边界欠清、皮髓质分界不清</text>
        <text x={W*0.5} y={H*0.95} fill="#cbd5e1" fontSize="11" textAnchor="middle">（可疑转移，建议FNA进一步评估）</text>
      </svg>
    )
  }
  if (type === 'isthmus') {
    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} style={{ background: '#000' }}>
        <defs>
          <radialGradient id="us7" cx="50%" cy="0%" r="100%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0.85" />
          </radialGradient>
        </defs>
        <path d={`M ${W/2} 0 L ${W*0.1} ${H} L ${W*0.9} ${H} Z`} fill="url(#us7)" />
        {Array.from({ length: 150 }).map((_, i) => {
          const x = W/2 + (Math.random() - 0.5) * 600; const y = Math.random() * H
          return <circle key={i} cx={x} cy={y} r={Math.random() * 5 + 1} fill="#475569" opacity={Math.random() * 0.3 + 0.1} />
        })}
        {/* 峡部 */}
        <rect x={W*0.3} y={H*0.45} width={W*0.4} height={20} fill="#94a3b8" opacity="0.6" stroke="#cbd5e1" strokeWidth="2" />
        {/* 左右叶（部分）*/}
        <ellipse cx={W*0.18} cy={H*0.5} rx={80} ry={60} fill="#94a3b8" opacity="0.4" stroke="#cbd5e1" strokeWidth="1" />
        <ellipse cx={W*0.82} cy={H*0.5} rx={80} ry={60} fill="#94a3b8" opacity="0.4" stroke="#cbd5e1" strokeWidth="1" />
        {/* 测量 */}
        <line x1={W*0.3} y1={H*0.4} x2={W*0.7} y2={H*0.4} stroke="#10b981" strokeWidth="2" />
        <text x={W*0.5} y={H*0.36} fill="#10b981" fontSize="14" textAnchor="middle" fontWeight="bold">↔ 0.4 cm</text>
        <line x1={W*0.5} y1={H*0.42} x2={W*0.5} y2={H*0.6} stroke="#10b981" strokeWidth="2" />
        <text x={W*0.55} y={H*0.51} fill="#10b981" fontSize="11" fontWeight="bold">↓ 0.4cm</text>
        <text x={W*0.5} y={H*0.15} fill="#cbd5e1" fontSize="16" textAnchor="middle" fontWeight="bold">峡部切面</text>
        <text x={W*0.5} y={H*0.85} fill="#10b981" fontSize="13" textAnchor="middle">✓ 峡部厚度正常（&lt;0.5cm）</text>
        <text x={W*0.5} y={H*0.90} fill="#94a3b8" fontSize="11" textAnchor="middle">回声均匀 · 未见占位</text>
      </svg>
    )
  }
  if (type === 'suprasternal') {
    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} style={{ background: '#000' }}>
        <defs>
          <radialGradient id="us8" cx="50%" cy="0%" r="100%">
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0.9" />
          </radialGradient>
        </defs>
        <path d={`M ${W/2} 0 L ${W*0.1} ${H} L ${W*0.9} ${H} Z`} fill="url(#us8)" />
        {Array.from({ length: 200 }).map((_, i) => {
          const x = W/2 + (Math.random() - 0.5) * 700; const y = Math.random() * H
          return <circle key={i} cx={x} cy={y} r={Math.random() * 6 + 1} fill="#475569" opacity={Math.random() * 0.3 + 0.1} />
        })}
        {/* 胸骨上窝 */}
        <ellipse cx={W*0.5} cy={H*0.45} rx={150} ry={80} fill="#1e293b" opacity="0.5" stroke="#cbd5e1" strokeWidth="1.5" />
        {/* 血管 */}
        <ellipse cx={W*0.4} cy={H*0.5} rx={30} ry={20} fill="#374151" opacity="0.7" stroke="#94a3b8" strokeWidth="1" />
        <text x={W*0.4} y={H*0.55} fill="#cbd5e1" fontSize="10" textAnchor="middle">LCCA</text>
        <ellipse cx={W*0.6} cy={H*0.5} rx={30} ry={20} fill="#374151" opacity="0.7" stroke="#94a3b8" strokeWidth="1" />
        <text x={W*0.6} y={H*0.55} fill="#cbd5e1" fontSize="10" textAnchor="middle">RCCA</text>
        <text x={W*0.5} y={H*0.15} fill="#cbd5e1" fontSize="16" textAnchor="middle" fontWeight="bold">胸骨上窝切面</text>
        <text x={W*0.5} y={H*0.85} fill="#cbd5e1" fontSize="13" textAnchor="middle">未见明显肿大淋巴结</text>
        <text x={W*0.5} y={H*0.90} fill="#94a3b8" fontSize="11" textAnchor="middle">双侧颈总动脉对称</text>
      </svg>
    )
  }
  return <div style={{ color: '#475569' }}>无图像</div>
}

export default function ReportWritePagePro() {
  const navigate = useNavigate()
  const [rightTab, setRightTab] = useState('cdss')
  const [leftSection, setLeftSection] = useState({ protocol: true, template: true, history: true, term: true, quality: true, ai: true, education: true, related: true })
  const [protocolSearch, setProtocolSearch] = useState('')
  const [selectedProtocolId, setSelectedProtocolId] = useState('P001')
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [selectedThumbId, setSelectedThumbId] = useState(2)
  const [activeTool, setActiveTool] = useState<string | null>('distance')
  const [isFrozen, setIsFrozen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showAnnotations, setShowAnnotations] = useState(true)
  const [selectedGrading, setSelectedGrading] = useState<'TIRADS' | 'BIRADS' | 'ORADS' | 'LIRADS'>('TIRADS')
  const [selectedGradeLevel, setSelectedGradeLevel] = useState(4)
  const [reportContent, setReportContent] = useState({
    findings: '甲状腺大小正常，形态规则，包膜完整。右叶见一低回声结节，大小约 1.5×1.1×0.9 cm，边界欠清，形态欠规则，内回声不均匀，可见多发点状强回声。CDFI：结节内可见血流信号（Adler II 级）。弹性成像：Emean=65kPa，SR=3.2。',
    diagnosis: '甲状腺右叶结节 TI-RADS 4a',
    impression: '低度可疑恶性（2-10%），建议细针穿刺活检（FNA），3-6 月后超声复查。',
  })
  const [isRecording, setIsRecording] = useState(false)
  const [criticalValue, setCriticalValue] = useState(false)
  const [saveStatus, setSaveStatus] = useState('已保存')
  const [aiGenerating, setAiGenerating] = useState(false)
  const [undoStack, setUndoStack] = useState<typeof reportContent[]>([])
  const [redoStack, setRedoStack] = useState<typeof reportContent[]>([])
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null)

  const qualityScore = 85
  const currentGradingRules = selectedGrading === 'TIRADS' ? TIRADS_RULES : selectedGrading === 'BIRADS' ? BIRADS_RULES : selectedGrading === 'ORADS' ? ORADS_RULES : LIRADS_RULES
  const currentProtocol = ULTRASOUND_PROTOCOLS.find(p => p.id === selectedProtocolId) || ULTRASOUND_PROTOCOLS[0]
  const selectedThumb = IMAGE_THUMBS.find(t => t.id === selectedThumbId) || IMAGE_THUMBS[0]
  const filteredProtocols = ULTRASOUND_PROTOCOLS.filter(p => p.name.includes(protocolSearch) || p.category.includes(protocolSearch))
  const totalChars = reportContent.findings.length + reportContent.diagnosis.length + reportContent.impression.length
  const attentionCount = MEASUREMENTS.filter(m => m.attention).length
  const toggleSection = (k: string) => setLeftSection(p => ({ ...p, [k]: !p[k] }))

  // ====== 所有操作函数 ======
  const handleSave = () => { setSaveStatus('保存中...'); setTimeout(() => setSaveStatus('已保存 ✓ ' + new Date().toLocaleTimeString()), 600) }
  const handlePrint = () => { setSaveStatus('生成PDF...'); setTimeout(() => { setSaveStatus('PDF已生成'); window.print() }, 800) }
  const handleSubmit = () => { setSaveStatus('提交中...'); setTimeout(() => setSaveStatus('已提交至审核队列'), 800) }
  const handleShare = () => { setSaveStatus('生成分享链接...'); setTimeout(() => setSaveStatus('链接已复制到剪贴板'), 600) }
  const handleExport = () => { setSaveStatus('导出文档...'); setTimeout(() => setSaveStatus('已导出为Word'), 600) }
  const handleToggleFullscreen = () => { setIsFullscreen(!isFullscreen); setSaveStatus(isFullscreen ? '退出全屏' : '影像全屏') }
  const handleUndo = () => {
    if (undoStack.length > 0) {
      const prev = undoStack[undoStack.length - 1]
      setRedoStack(r => [...r, reportContent])
      setReportContent(prev)
      setUndoStack(u => u.slice(0, -1))
      setSaveStatus('已撤销')
    }
  }
  const handleRedo = () => {
    if (redoStack.length > 0) {
      const next = redoStack[redoStack.length - 1]
      setUndoStack(u => [...u, reportContent])
      setReportContent(next)
      setRedoStack(r => r.slice(0, -1))
      setSaveStatus('已重做')
    }
  }
  const saveSnapshot = () => setUndoStack(u => [...u, reportContent].slice(-20))
  const updateContent = (key: keyof typeof reportContent, val: string) => {
    saveSnapshot()
    setReportContent(p => ({ ...p, [key]: val }))
  }
  const handleAiGenerate = () => {
    setAiGenerating(true); setSaveStatus('AI 正在分析影像...')
    setTimeout(() => {
      saveSnapshot()
      setReportContent(p => ({
        ...p,
        findings: `[AI 生成] 甲状腺大小正常，形态规则，包膜完整。右叶见一低回声结节，大小约 1.5×1.1×0.9 cm，边界欠清，形态欠规则，内回声不均匀，可见多发点状强回声。CDFI：结节内可见血流信号（Adler II 级，RI=0.72）。弹性成像：Emean=65kPa，SR=3.2。颈部IV区淋巴结可见，皮髓质分界欠清。`,
        impression: `[AI 建议] 1. 细针穿刺活检（FNA）明确结节性质；2. 甲状腺功能五项+降钙素检查；3. 3-6月后超声复查；4. 必要时结合内分泌科/外科会诊。`,
      }))
      setAiAnalysis(`AI 分析结果：
- 结节大小 1.5×1.1×0.9cm（较 3月前 1.4×1.0cm 略增大）
- 多项可疑征象：边界欠清 + 微钙化 + 血流 Adler II + 硬度 3级
- TI-RADS 4a 评级合理
- 建议：FNA 进一步明确诊断`)
      setAiGenerating(false); setSaveStatus('AI 报告已生成')
    }, 1500)
  }
  const handleApplyTemplate = (text: string, name: string) => {
    saveSnapshot()
    setReportContent(p => ({ ...p, findings: text }))
    setSelectedTemplate(name)
    setSaveStatus(`已应用模板：${name}`)
  }
  const handleApplyGrade = () => {
    const cur = currentGradingRules.find((g: any) => g.level === selectedGradeLevel)
    if (cur) {
      saveSnapshot()
      setReportContent(p => ({
        ...p,
        diagnosis: `甲状腺右叶结节 ${selectedGrading} ${selectedGradeLevel}`,
        impression: cur.management,
      }))
      setSaveStatus(`已应用 ${selectedGrading} ${selectedGradeLevel}`)
    }
  }
  const handleInsert = (text: string, where: 'findings' | 'impression' = 'impression') => {
    saveSnapshot()
    setReportContent(p => ({ ...p, [where]: p[where] + (p[where] && !p[where].endsWith('。') ? '\n' : '') + text }))
    setSaveStatus('已插入')
  }
  const handleInsertMeasurement = (m: typeof MEASUREMENTS[0]) => {
    handleInsert(`${m.name} ${m.value}${m.unit}`, 'findings')
  }
  const handleInsertHistory = (h: typeof HISTORY_REPORTS[0]) => {
    handleInsert(`[参考 ${h.id}] ${h.diagnosis} → ${h.impression}`, 'impression')
  }
  const handleInsertTerm = (term: string) => {
    handleInsert(term, 'findings')
  }
  const handleInsertTreatment = (t: typeof TREATMENT_OPTIONS[0]) => {
    handleInsert(`[建议·${t.priority === 'high' ? '高优' : t.priority === 'medium' ? '中优' : '低优'}] ${t.name} - ${t.desc}`, 'impression')
  }
  const handleInsertRelatedExam = (e: typeof RELATED_EXAMS[0]) => {
    handleInsert(`[推荐检查] ${e.name} (${e.urgency}优, ${e.cost}) - ${e.reason}`, 'impression')
  }
  const handleApplyPatientEducation = (ed: typeof PATIENT_EDUCATION[0]) => {
    handleInsert(`[患教] ${ed.title}: ${ed.content}`, 'impression')
  }
  const handleSynonym = (word: string) => {
    const syns = SYNONYMS[word]
    if (syns && syns.length > 0) {
      saveSnapshot()
      const newFindings = reportContent.findings.replace(word, syns[0])
      setReportContent(p => ({ ...p, findings: newFindings }))
      setSaveStatus(`已替换为：${syns[0]}`)
    }
  }
  const handleReset = () => {
    if (confirm('确定要清空当前报告吗？')) {
      saveSnapshot()
      setReportContent({ findings: '', diagnosis: '', impression: '' })
      setSaveStatus('已清空')
    }
  }

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
          <span style={s.patientChip}><User size={12} /> {CURRENT_PATIENT.name} | {CURRENT_PATIENT.age}岁 {CURRENT_PATIENT.gender} | {CURRENT_PATIENT.idNo}</span>
          <span style={{ ...s.statusChip, background: '#fef3c7', color: C.warning }}>● 书写中</span>
          <span style={{ ...s.scoreChip, background: qualityScore >= 90 ? C.success : C.warning }}>质控 {qualityScore}</span>
        </div>
        <div style={s.topbarRight}>
          <button style={{ ...s.btn, ...s.btnBack }} onClick={handleUndo} title="撤销 (Ctrl+Z)"><Undo2 size={12} /></button>
          <button style={{ ...s.btn, ...s.btnBack }} onClick={handleRedo} title="重做"><Redo2 size={12} /></button>
          <button style={{ ...s.btn, ...s.btnBack }} onClick={handleSave}><Save size={12} /> 保存</button>
          <button style={{ ...s.btn, ...s.btnBack }} onClick={handlePrint}><Printer size={12} /> 打印</button>
          <button style={{ ...s.btn, ...s.btnBack }} onClick={handleShare}><Share2 size={12} /> 分享</button>
          <button style={{ ...s.btn, ...s.btnBack }} onClick={handleExport}><Download size={12} /> 导出</button>
          <button style={{ ...s.btn, ...s.btnPrimary }} onClick={handleAiGenerate} disabled={aiGenerating}>
            <Sparkles size={12} /> {aiGenerating ? '生成中...' : 'AI生成'}
          </button>
          <button style={{ ...s.btn, ...s.btnSuccess }} onClick={handleSubmit}><Send size={12} /> 提交</button>
        </div>
      </div>

      {/* ===== 三栏 ===== */}
      <div style={s.cols}>
        {/* ===== 左栏 200px ===== */}
        <div style={s.leftCol}>
          {/* 协议（带搜索） */}
          <div style={s.leftSection}>
            <div style={s.leftSectionTitle} onClick={() => toggleSection('protocol')}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Target size={11} /> 协议 ({filteredProtocols.length})</span>
              {leftSection.protocol ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
            </div>
            {leftSection.protocol && (
              <>
                <input
                  className=""
                  style={s.leftSearch}
                  placeholder="🔍 搜索协议..."
                  value={protocolSearch}
                  onChange={e => setProtocolSearch(e.target.value)}
                />
                <div style={{ ...s.leftSectionContent, maxHeight: 150 }}>
                  {filteredProtocols.map(p => (
                    <div key={p.id} style={p.id === selectedProtocolId ? s.leftItemActive : s.leftItem} onClick={() => { setSelectedProtocolId(p.id); setSaveStatus(`已选协议：${p.name}`) }}>
                      <Activity size={11} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{p.name}</span>
                      <span style={{ fontSize: 9, opacity: 0.7 }}>{p.frequency}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* 模板（一键应用） */}
          <div style={s.leftSection}>
            <div style={s.leftSectionTitle} onClick={() => toggleSection('template')}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FileText size={11} /> 模板 ({REPORT_TEMPLATES.length})</span>
              {leftSection.template ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
            </div>
            {leftSection.template && (
              <div style={s.leftSectionContent}>
                {REPORT_TEMPLATES.map(t => (
                  <div
                    key={t.id}
                    style={selectedTemplate === t.name ? s.leftItemActive : s.leftItem}
                    onClick={() => handleApplyTemplate(t.text, t.name)}
                  >
                    <span style={{ fontSize: 14 }}>{t.icon}</span>
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 历史报告 */}
          <div style={s.leftSection}>
            <div style={s.leftSectionTitle} onClick={() => toggleSection('history')}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><History size={11} /> 历史 ({HISTORY_REPORTS.length})</span>
              {leftSection.history ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
            </div>
            {leftSection.history && (
              <div style={{ ...s.leftSectionContent, maxHeight: 120 }}>
                {HISTORY_REPORTS.map((h, i) => (
                  <div key={i} style={s.leftItem} onClick={() => handleInsertHistory(h)}>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: h.current ? C.warning : C.white, fontFamily: 'monospace' }}>{h.id} {h.current && '★'}</div>
                      <div style={{ fontSize: 10, color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.diagnosis}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 术语词库 */}
          <div style={s.leftSection}>
            <div style={s.leftSectionTitle} onClick={() => toggleSection('term')}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><BookOpen size={11} /> 词库</span>
              {leftSection.term ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
            </div>
            {leftSection.term && (
              <div style={s.leftSectionContent}>
                <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 3, padding: 2 }}>
                  {['低回声', '高回声', '等回声', '无回声', '边界清晰', '边界欠清', 'CDFI血流', '微钙化', '纵横比>1', '形态规则'].map((t, i) => (
                    <span
                      key={i}
                      style={{ padding: '3px 6px', background: '#0f172a', color: C.accent, borderRadius: 3, fontSize: 11, cursor: 'pointer', border: '1px solid #334155' }}
                      onClick={() => handleInsertTerm(t)}
                    >{t}</span>
                  ))}
                </div>
                <div style={{ fontSize: 10, color: '#94a3b8', padding: 4 }}>💡 点击词条插入到报告</div>
                <div style={{ fontSize: 10, color: '#fbbf24', padding: 4, fontWeight: 600 }}>同义词（点击替换）</div>
                <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 3, padding: 2 }}>
                  {Object.keys(SYNONYMS).slice(0, 6).map((key, i) => (
                    <span
                      key={i}
                      style={{ padding: '3px 6px', background: '#7c3aed22', color: C.purple, borderRadius: 3, fontSize: 10, cursor: 'pointer', border: '1px solid #7c3aed44' }}
                      onClick={() => handleSynonym(key)}
                      title={`替换为: ${SYNONYMS[key][0]}`}
                    >{key}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 质控 */}
          <div style={s.leftSection}>
            <div style={s.leftSectionTitle} onClick={() => toggleSection('quality')}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><ShieldCheck size={11} /> 质控 {qualityScore}</span>
              {leftSection.quality ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
            </div>
            {leftSection.quality && (
              <div style={s.leftSectionContent}>
                <div style={{ textAlign: 'center', padding: '2px 0 4px' }}>
                  <div style={{ fontSize: 26, fontWeight: 800, color: qualityScore >= 90 ? C.success : C.warning, lineHeight: 1 }}>{qualityScore}</div>
                  <div style={{ fontSize: 9, color: '#94a3b8' }}>综合评分</div>
                </div>
                {['完整性', '规范性', '准确性', '及时性', '一致性', '影像关联', '测量完整', '诊断明确', '建议合理', '危急值'].map((q, i) => {
                  const score = [95, 88, 82, 90, 85, 80, 92, 90, 78, 100][i]
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '1px 2px', fontSize: 10 }}>
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

          {/* AI 助手 */}
          <div style={s.leftSection}>
            <div style={s.leftSectionTitle} onClick={() => toggleSection('ai')}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Sparkles size={11} color={C.purple} /> AI 助手</span>
              {leftSection.ai ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
            </div>
            {leftSection.ai && (
              <div style={s.leftSectionContent}>
                {[
                  { icon: <Sparkles size={11} />, label: 'AI 生成报告', color: '#a855f7', action: handleAiGenerate },
                  { icon: <Mic size={11} />, label: '语音转文字', color: C.accent, action: () => setIsRecording(!isRecording) },
                  { icon: <Lightbulb size={11} />, label: 'AI 诊断建议', color: C.warning, action: () => setRightTab('cdss') },
                  { icon: <Database size={11} />, label: '相似案例检索', color: C.success, action: () => alert('已检索到 12 个相似案例（演示）') },
                  { icon: <BookMarked size={11} />, label: 'AI 影像分析', color: C.accent, action: () => { setSaveStatus('AI 影像分析中...'); setTimeout(() => { setSaveStatus('AI 分析：结节 4a 级，可疑'); setAiAnalysis('AI 已自动识别结节特征') }, 1500) } },
                  { icon: <MessageSquare size={11} />, label: 'AI 问答', color: C.purple, action: () => alert('AI 问答：\nQ: 这个结节恶性概率？\nA: 基于 TI-RADS 4a + 弹性硬度 3 级，恶性风险 5-10%') },
                  { icon: <FlaskConical size={11} />, label: 'AI 文献检索', color: C.success, action: () => setRightTab('evidence') },
                  { icon: <Heart size={11} />, label: 'AI 治疗推荐', color: C.danger, action: () => setRightTab('cdss') },
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

          {/* 患者教育 */}
          <div style={s.leftSection}>
            <div style={s.leftSectionTitle} onClick={() => toggleSection('education')}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Heart size={11} /> 患教 ({PATIENT_EDUCATION.length})</span>
              {leftSection.education ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
            </div>
            {leftSection.education && (
              <div style={s.leftSectionContent}>
                {PATIENT_EDUCATION.map((ed, i) => (
                  <div key={i} style={s.leftItem} onClick={() => handleApplyPatientEducation(ed)}>
                    <Heart size={11} color={C.danger} />
                    <span style={{ fontSize: 11, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ed.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 关联检查 */}
          <div style={s.leftSection}>
            <div style={s.leftSectionTitle} onClick={() => toggleSection('related')}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FlaskConical size={11} /> 关联检查 ({RELATED_EXAMS.length})</span>
              {leftSection.related ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
            </div>
            {leftSection.related && (
              <div style={{ ...s.leftSectionContent, maxHeight: 100 }}>
                {RELATED_EXAMS.map((e, i) => (
                  <div key={i} style={s.leftItem} onClick={() => handleInsertRelatedExam(e)}>
                    <FlaskConical size={11} color={C.accent} />
                    <span style={{ fontSize: 11, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.name}</span>
                    <span style={{ fontSize: 9, color: e.urgency === '高' ? C.danger : e.urgency === '中' ? C.warning : C.textLight, fontWeight: 600 }}>{e.urgency}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ===== 中栏 ===== */}
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
                  <button key={t.key} style={activeTool === t.key ? s.imageToolBtnActive : s.imageToolBtn} onClick={() => setActiveTool(activeTool === t.key ? null : t.key)}>
                    {t.icon} {t.label}
                  </button>
                ))}
                <div style={{ width: 1, height: 16, background: '#475569' }} />
                <button style={s.imageToolBtn} onClick={() => setIsFrozen(!isFrozen)}>{isFrozen ? '▶ 解冻' : '❄ 冻结'}</button>
                <button style={s.imageToolBtn} onClick={handleToggleFullscreen}>{isFullscreen ? '⊟ 退出' : '⊡ 全屏'}</button>
                <button style={s.imageToolBtn} onClick={() => setShowAnnotations(!showAnnotations)}>{showAnnotations ? '👁 标注' : '🚫 标注'}</button>
                <button style={s.imageToolBtn} onClick={() => setActiveTool(null)}><Eraser size={12} /> 清除</button>
                <button style={s.imageToolBtn} onClick={() => alert('图像已保存到本地（演示）')}><Save size={12} /> 存图</button>
                <div style={{ width: 1, height: 16, background: '#475569' }} />
                <button style={s.imageToolBtn} onClick={() => alert('对比模式（演示）')}><Layers size={12} /> 对比</button>
                <button style={s.imageToolBtn} onClick={() => alert('录像模式（演示）')}><Camera size={12} /> 录像</button>
              </div>

              <div style={s.imageCanvas}>
                <span style={s.imageLabel}>📷 {selectedThumb.label} {showAnnotations && '· 标注开启'} {isFrozen && '· ❄ 已冻结'}</span>
                {showAnnotations ? <UltrasoundImage type={selectedThumb.type} /> : <div style={{ color: '#475569', fontSize: 24 }}>标注已隐藏</div>}
                <span style={s.imageParams}>深度:{currentProtocol.depth}cm 增益:72 频率:{currentProtocol.frequency} 工具:{activeTool || '无'}</span>
              </div>

              <div style={s.imageThumb}>
                {IMAGE_THUMBS.map(t => (
                  <div key={t.id} style={t.id === selectedThumbId ? s.imageThumbActive : s.imageThumbItem} onClick={() => { setSelectedThumbId(t.id); setSaveStatus(`已切换：${t.label}`) }} title={t.label}>
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
                <button style={s.reportTab} onClick={() => alert('预览：\n\n' + reportContent.findings + '\n\n诊断：' + reportContent.diagnosis + '\n\n建议：' + reportContent.impression)}><Eye size={12} /> 预览</button>
                <button style={s.reportTab} onClick={() => alert('对比历史报告（演示）')}><GitBranch size={12} /> 对比</button>
                <button style={s.reportTab} onClick={handleReset}><RefreshCw size={12} /> 重置</button>
              </div>
              <div style={s.reportToolbar}>
                <button style={{ ...s.btn, background: isRecording ? C.danger : C.accent, color: C.white }} onClick={() => setIsRecording(!isRecording)}>
                  {isRecording ? <MicOff size={12} /> : <Mic size={12} />} {isRecording ? '停止' : '语音'}
                </button>
                <button style={{ ...s.btn, background: C.white, color: C.primary, border: `1px solid ${C.border}` }} onClick={() => alert('打开影像选择器（演示）')}><ImageIcon size={12} /> 插图</button>
                <button style={{ ...s.btn, background: C.white, color: C.primary, border: `1px solid ${C.border}` }} onClick={() => alert('词库（演示）')}><BookOpen size={12} /> 词库</button>
                <button style={{ ...s.btn, background: C.white, color: C.primary, border: `1px solid ${C.border}` }} onClick={() => alert('打开同义词库（演示）')}><RefreshCw size={12} /> 同义</button>
                <div style={{ flex: 1 }} />
                <button style={{ ...s.btn, background: criticalValue ? C.danger : C.white, color: criticalValue ? C.white : C.textLight, border: `1px solid ${criticalValue ? C.danger : C.border}` }} onClick={() => { setCriticalValue(!criticalValue); setSaveStatus(criticalValue ? '取消危急值' : '标记危急值') }}>
                  <AlertTriangle size={12} /> {criticalValue ? '危急 ✓' : '危急值'}
                </button>
              </div>

              <div style={s.reportBody}>
                {/* AI分析结果（如有） */}
                {aiAnalysis && (
                  <div style={{ ...s.reportSection, background: '#f0f9ff', border: '1px solid #7dd3fc' }}>
                    <div style={s.reportSectionTitle}><span><Sparkles size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle', color: C.purple }} /> AI 影像分析</span>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textLight }} onClick={() => setAiAnalysis(null)}><X size={11} /></button>
                    </div>
                    <pre style={{ fontSize: 11, color: C.text, whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'inherit' }}>{aiAnalysis}</pre>
                  </div>
                )}

                {/* 测量值 */}
                <div style={s.reportSection}>
                  <div style={s.reportSectionTitle}><span><Ruler size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} /> 测量值（点击插入）· {MEASUREMENTS.length} 项</span><span style={{ fontSize: 10, color: C.textLight }}>关注 {attentionCount}</span></div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3 }}>
                    {MEASUREMENTS.map((m, i) => (
                      <div key={i} style={{ padding: '4px 6px', background: C.white, borderRadius: 3, border: `1px solid ${C.border}`, cursor: 'pointer' }} onClick={() => handleInsertMeasurement(m)} title="点击插入到报告">
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

                {/* 超声所见 */}
                <div style={s.reportField}>
                  <div style={s.reportLabel}><FileText size={12} /> 超声所见 {isRecording && <span style={{ marginLeft: 6, padding: '1px 6px', borderRadius: 3, background: C.danger, color: C.white, fontSize: 10, fontWeight: 600 }}>● 录音中</span>}</div>
                  <textarea style={{ ...s.reportTextarea, minHeight: 70 }} value={reportContent.findings} onChange={e => updateContent('findings', e.target.value)} rows={3} />
                </div>

                {/* 超声诊断 */}
                <div style={s.reportField}>
                  <div style={s.reportLabel}><Stethoscope size={12} /> 超声诊断</div>
                  <textarea style={{ ...s.reportTextarea, fontWeight: 600, color: C.primary, fontSize: 14, minHeight: 35 }} value={reportContent.diagnosis} onChange={e => updateContent('diagnosis', e.target.value)} rows={2} />
                </div>

                {/* 诊断建议 */}
                <div style={s.reportField}>
                  <div style={s.reportLabel}><Lightbulb size={12} /> 诊断建议</div>
                  <textarea style={{ ...s.reportTextarea, minHeight: 50 }} value={reportContent.impression} onChange={e => updateContent('impression', e.target.value)} rows={2} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== 右栏 260px ===== */}
        <div style={s.rightCol}>
          <div style={s.rightTabs}>
            <button style={rightTab === 'cdss' ? s.rightTabActive : s.rightTab} onClick={() => setRightTab('cdss')}><Brain size={11} /> CDSS</button>
            <button style={rightTab === 'grading' ? s.rightTabActive : s.rightTab} onClick={() => setRightTab('grading')}><Award size={11} /> 分级</button>
            <button style={rightTab === 'evidence' ? s.rightTabActive : s.rightTab} onClick={() => setRightTab('evidence')}><BookMarked size={11} /> 循证</button>
            <button style={rightTab === 'drg' ? s.rightTabActive : s.rightTab} onClick={() => setRightTab('drg')}><Network size={11} /> DRG</button>
            <button style={rightTab === 'treatment' ? s.rightTabActive : s.rightTab} onClick={() => setRightTab('treatment')}><Heart size={11} /> 治疗</button>
          </div>

          <div style={s.rightBody}>
            {rightTab === 'cdss' && (
              <div>
                <div style={s.cdssCard}>
                  <div style={s.cdssLabel}><Brain size={11} /> 当前诊断分析</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.primary }}>甲状腺右叶结节</div>
                  <div style={{ fontSize: 10, color: C.textLight, marginTop: 2 }}>ICD-10: E04.901 · 内分泌系统</div>
                </div>
                <div style={s.cdssCard}>
                  <div style={s.cdssLabel}><Target size={11} /> 鉴别诊断 · 7 项 (点击插入)</div>
                  {FULL_DIFFERENTIAL.map((d, i) => (
                    <div
                      key={i}
                      style={d.probability >= 30 ? s.cdssItemHigh : d.probability >= 10 ? s.cdssItemWarn : s.cdssItem}
                      onClick={() => handleInsert(`[鉴别] ${d.name} (${d.probability}%) - ${d.reason}`, 'impression')}
                      title={d.reason}
                    >
                      <span style={{ flex: 1 }}>{d.name}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: d.probability >= 30 ? C.danger : d.probability >= 10 ? C.warning : C.textLight }}>{d.probability}%</span>
                    </div>
                  ))}
                </div>
                <div style={s.cdssCard}>
                  <div style={s.cdssLabel}><AlertTriangle size={11} /> 漏诊风险 (点击插入)</div>
                  <div style={s.cdssItemWarn} onClick={() => handleInsert('⚠ 建议补充颈部淋巴结扫查（甲状腺癌常伴颈淋巴结转移）', 'impression')}>
                    <AlertTriangle size={12} /><span>颈部淋巴结扫查</span>
                  </div>
                  <div style={s.cdssItemWarn} onClick={() => handleInsert('⚠ 建议甲状腺功能检查（TSH/FT3/FT4/Tg/TgAb）', 'impression')}>
                    <AlertTriangle size={12} /><span>甲状腺功能</span>
                  </div>
                  <div style={s.cdssItemWarn} onClick={() => handleInsert('⚠ 建议降钙素检测（排除髓样癌）', 'impression')}>
                    <AlertTriangle size={12} /><span>降钙素检测</span>
                  </div>
                  <div style={s.cdssItemWarn} onClick={() => handleInsert('⚠ 注意观察：结节近期增大（1.4→1.5cm）', 'impression')}>
                    <AlertTriangle size={12} /><span>结节增长</span>
                  </div>
                </div>
                <div style={s.cdssCard}>
                  <div style={s.cdssLabel}><Check size={12} /> 决策建议 (点击插入)</div>
                  {TREATMENT_OPTIONS.filter(t => t.priority === 'high').map((t, i) => (
                    <div key={i} style={s.cdssItem} onClick={() => handleInsertTreatment(t)}>
                      <CheckCircle2 size={12} color={C.success} />
                      <span style={{ flex: 1 }}>{t.name}</span>
                      <span style={{ fontSize: 9, color: C.danger, fontWeight: 700 }}>高优</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {rightTab === 'grading' && (
              <div>
                <div style={s.cdssCard}>
                  <div style={s.cdssLabel}><Award size={11} /> 分级系统 (点击切换)</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                    {[
                      { key: 'TIRADS', label: 'TI-RADS', sub: '甲状腺' },
                      { key: 'BIRADS', label: 'BI-RADS', sub: '乳腺' },
                      { key: 'ORADS', label: 'O-RADS', sub: '卵巢' },
                      { key: 'LIRADS', label: 'LI-RADS', sub: '肝脏' },
                    ].map(g => (
                      <button key={g.key} style={selectedGrading === g.key ? s.gradeBtnActive : s.gradeBtn} onClick={() => { setSelectedGrading(g.key as any); setSaveStatus(`已选 ${g.label}`) }}>
                        <span style={{ fontSize: 11, fontWeight: 700 }}>{g.label}</span>
                        <span style={{ fontSize: 9, opacity: 0.8 }}>{g.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div style={s.cdssCard}>
                  <div style={s.cdssLabel}>{selectedGrading} 分级 (点击选择)</div>
                  {currentGradingRules.map((g: any) => (
                    <div
                      key={g.level}
                      style={selectedGradeLevel === g.level ? s.gradeBtnActive : s.gradeBtn}
                      onClick={() => { setSelectedGradeLevel(g.level); setSaveStatus(`已选 ${selectedGrading} ${g.level}`) }}
                    >
                      <span style={{ ...s.gradeLevel, background: g.color, color: C.white }}>{g.level}</span>
                      <span style={{ flex: 1, fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.name}</span>
                      <span style={{ fontSize: 9, color: selectedGradeLevel === g.level ? 'rgba(255,255,255,0.85)' : C.textLight }}>{g.malignancy}</span>
                    </div>
                  ))}
                </div>
                <div style={s.cdssCard}>
                  <div style={s.cdssLabel}><Lightbulb size={11} /> 管理建议</div>
                  {(() => {
                    const cur = currentGradingRules.find((g: any) => g.level === selectedGradeLevel)
                    return cur ? (
                      <div style={{ padding: 8, background: '#eff6ff', borderRadius: 4, color: C.accent, fontWeight: 600, fontSize: 11, lineHeight: 1.5 }}>
                        {cur.management}
                        <div style={{ fontSize: 9, color: C.textLight, marginTop: 3, fontWeight: 400 }}>恶性: {cur.malignancy}</div>
                      </div>
                    ) : null
                  })()}
                  <button style={{ ...s.btn, ...s.btnPrimary, width: '100%', marginTop: 6, minHeight: 30, fontSize: 11 }} onClick={handleApplyGrade}>
                    <ArrowRight size={11} /> 一键应用到报告
                  </button>
                </div>
              </div>
            )}

            {rightTab === 'evidence' && (
              <div>
                <div style={s.cdssCard}>
                  <div style={s.cdssLabel}><BookMarked size={11} /> 临床指南 ({EVIDENCE_GUIDELINES.length})</div>
                  {EVIDENCE_GUIDELINES.map((g: any) => (
                    <div key={g.id} style={s.cdssItem} onClick={() => handleInsert(`[指南] ${g.title} (${g.organization} ${g.year})`, 'impression')}>
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
                  <div style={s.cdssLabel}><Database size={11} /> 关键文献 ({EVIDENCE_LITERATURE.length})</div>
                  {EVIDENCE_LITERATURE.map((l: any, i) => (
                    <div key={i} style={s.cdssItem} onClick={() => handleInsert(`[文献] ${l.title} - ${l.journal} IF:${l.impactFactor}`, 'impression')}>
                      <Database size={12} color={C.success} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 11, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.title}</div>
                        <div style={{ fontSize: 9, color: C.textLight }}>IF:{l.impactFactor} · {l.year}</div>
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
                  <div style={s.cdssLabel}><CheckCircle2 size={11} /> 操作</div>
                  <div style={s.cdssItem} onClick={() => handleInsert(`[DRG] 已匹配 KS1 组（权重 1.25，例均 ¥8,500）`, 'impression')}>
                    <CheckCircle2 size={12} color={C.success} />
                    <span>入组成功 (-3.2%)</span>
                  </div>
                  <div style={s.cdssItem} onClick={() => alert('查看 DRG 详情（演示）')}>
                    <ExternalLink size={12} color={C.accent} />
                    <span>查看 DRG 详情</span>
                  </div>
                  <div style={s.cdssItem} onClick={() => alert('病案首页预览（演示）')}>
                    <FileText size={12} color={C.accent} />
                    <span>病案首页预览</span>
                  </div>
                </div>
              </div>
            )}

            {rightTab === 'treatment' && (
              <div>
                <div style={s.cdssCard}>
                  <div style={s.cdssLabel}><Heart size={11} /> 治疗方案 (点击插入)</div>
                  {TREATMENT_OPTIONS.map((t, i) => (
                    <div key={i} style={s.cdssItem} onClick={() => handleInsertTreatment(t)}>
                      <CheckCircle2 size={12} color={t.priority === 'high' ? C.danger : t.priority === 'medium' ? C.warning : C.textLight} />
                      <span style={{ flex: 1, fontSize: 11 }}>{t.name}</span>
                      <span style={{ fontSize: 9, color: t.priority === 'high' ? C.danger : t.priority === 'medium' ? C.warning : C.textLight, fontWeight: 600 }}>{t.priority === 'high' ? '高' : t.priority === 'medium' ? '中' : '低'}</span>
                    </div>
                  ))}
                </div>
                <div style={s.cdssCard}>
                  <div style={s.cdssLabel}><FlaskConical size={11} /> 关联检查</div>
                  {RELATED_EXAMS.map((e, i) => (
                    <div key={i} style={s.cdssItem} onClick={() => handleInsertRelatedExam(e)}>
                      <FlaskConical size={12} color={C.accent} />
                      <span style={{ flex: 1, fontSize: 11 }}>{e.name}</span>
                      <span style={{ fontSize: 9, color: e.urgency === '高' ? C.danger : e.urgency === '中' ? C.warning : C.textLight, fontWeight: 600 }}>{e.urgency}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== 状态栏 24px ===== */}
      <div style={s.statusbar}>
        <div style={{ display: 'flex', gap: 12 }}>
          <span style={s.statusbarItem}><CheckCircle2 size={10} /> {saveStatus}</span>
          <span style={s.statusbarItem}>字数:{totalChars}</span>
          <span style={s.statusbarItem}><ImageIcon size={10} /> {IMAGE_THUMBS.length}张</span>
          <span style={s.statusbarItem}><Ruler size={10} /> {MEASUREMENTS.length}测量</span>
          <span style={s.statusbarItem}>关注:{attentionCount}</span>
          <span style={s.statusbarItem}>模板:{selectedTemplate || '无'}</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {criticalValue && <span style={{ ...s.statusbarItem, color: '#fca5a5', fontWeight: 700 }}><AlertTriangle size={10} /> 危急</span>}
          <span style={s.statusbarItem}>撤销:{undoStack.length}</span>
          <span style={s.statusbarItem}>工具:{activeTool || '无'}</span>
          <span style={s.statusbarItem}>影像:{selectedThumb.label}</span>
          <span style={s.statusbarItem}>分级:{selectedGrading} {selectedGradeLevel}</span>
          <span style={s.statusbarItem}>质控:{qualityScore}</span>
        </div>
      </div>
    </div>
  )
}
