/**
 * 超声报告工作站 - 全控件可点击版
 * @version v0.18.8
 *
 * 1920×1080 Win桌面级 | 影像70%=1050px
 * 每个看似可点的元素都有 onClick | 键盘快捷键 | 弹窗详情
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
  Download, Share2, Eye, Layers, MessageSquare, Heart, FlaskConical,
  Copy, Phone, MapPin, Calendar, User, X, ZoomIn, ZoomOut, RotateCw, RefreshCw, ChevronUp
} from 'lucide-react'

import { TIRADS_RULES, BIRADS_RULES, ORADS_RULES, LIRADS_RULES } from '../data/report-workspace/grading-rules'
import { ULTRASOUND_PROTOCOLS } from '../data/report-workspace/protocols'
import { DISEASE_KNOWLEDGE } from '../data/report-workspace/knowledge-graph'
import { EVIDENCE_GUIDELINES, EVIDENCE_LITERATURE } from '../data/report-workspace/evidence-medicine'

const C = { primary: '#1a365d', accent: '#2563eb', success: '#059669', warning: '#d97706', danger: '#dc2626', white: '#fff', bg: '#f8fafc', border: '#e2e8f0', text: '#1a365c', textLight: '#64748b', purple: '#7c3aed' }

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
  // 顶栏 chip（都可点）
  chip: { padding: '3px 8px', background: 'rgba(255,255,255,0.15)', borderRadius: 5, fontSize: 12, color: C.white, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', transition: 'all 0.15s' },
  chipHover: { background: 'rgba(255,255,255,0.25)' },
  cols: { display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 },
  leftCol: { width: 200, background: '#1e293b', color: '#cbd5e1', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0, borderRight: '1px solid #334155' },
  leftSection: { borderBottom: '1px solid #334155', overflow: 'hidden' },
  leftSectionTitle: { padding: '7px 10px', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' as const, letterSpacing: 0.8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0f172a', cursor: 'pointer', userSelect: 'none' as const, minHeight: 30, transition: 'background 0.15s' },
  leftSectionTitleHover: { background: '#1e293b' },
  leftSectionContent: { padding: '3px 6px 5px', maxHeight: 200, overflowY: 'auto' as const },
  leftItem: { padding: '5px 8px', borderRadius: 4, fontSize: 12, color: '#cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 1, minHeight: 28, transition: 'all 0.15s' },
  leftItemActive: { padding: '5px 8px', borderRadius: 4, fontSize: 12, color: C.white, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 1, background: C.accent, fontWeight: 600, minHeight: 28 },
  leftSearch: { padding: '4px 8px', background: '#0f172a', border: '1px solid #334155', borderRadius: 4, color: C.white, fontSize: 11, outline: 'none', boxSizing: 'border-box' as const, margin: '0 6px 4px', width: 'calc(100% - 12px)' },
  centerCol: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 },
  workArea: { display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 },
  imageArea: { width: '70%', background: '#000', display: 'flex', flexDirection: 'column', position: 'relative', minWidth: 0, borderRight: '1px solid #334155' },
  imageToolbar: { padding: '5px 8px', background: '#1e293b', display: 'flex', gap: 4, alignItems: 'center', borderBottom: '1px solid #334155', flexWrap: 'wrap' as const, flexShrink: 0 },
  imageToolBtn: { padding: '4px 8px', borderRadius: 4, fontSize: 12, color: '#cbd5e1', cursor: 'pointer', border: '1px solid transparent', background: 'transparent', display: 'flex', alignItems: 'center', gap: 3, minHeight: 26, transition: 'all 0.15s' },
  imageToolBtnActive: { padding: '4px 8px', borderRadius: 4, fontSize: 12, color: C.white, cursor: 'pointer', border: `1px solid ${C.accent}`, background: C.accent, display: 'flex', alignItems: 'center', gap: 3, minHeight: 26 },
  imageCanvas: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', minHeight: 200, background: '#000', cursor: 'crosshair' },
  imageLabel: { position: 'absolute', top: 10, left: 14, color: '#94a3b8', fontSize: 12, fontWeight: 600, zIndex: 1, pointerEvents: 'none' as const },
  imageParams: { position: 'absolute', bottom: 10, right: 14, color: '#10b981', fontSize: 11, fontFamily: 'monospace', zIndex: 1, pointerEvents: 'none' as const },
  imageNav: { position: 'absolute', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: C.white, border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 },
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
  cdssCardTitle: { fontSize: 11, fontWeight: 700, color: C.textLight, marginBottom: 5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', textTransform: 'uppercase' as const, letterSpacing: 0.5, cursor: 'pointer', padding: '2px 4px', borderRadius: 3 },
  cdssItem: { padding: '5px 7px', background: C.white, borderRadius: 4, marginBottom: 3, fontSize: 12, color: C.text, display: 'flex', alignItems: 'center', gap: 5, border: `1px solid ${C.border}`, minHeight: 28, cursor: 'pointer', transition: 'all 0.15s' },
  cdssItemHigh: { padding: '5px 7px', background: '#fef2f2', borderRadius: 4, marginBottom: 3, fontSize: 12, color: C.danger, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5, border: '1px solid #fecaca', minHeight: 28, cursor: 'pointer' },
  cdssItemWarn: { padding: '5px 7px', background: '#fff7ed', borderRadius: 4, marginBottom: 3, fontSize: 12, color: C.warning, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5, border: '1px solid #fed7aa', minHeight: 28, cursor: 'pointer' },
  gradeBtn: { padding: '5px 7px', borderRadius: 4, fontSize: 11, color: C.text, cursor: 'pointer', border: `1px solid ${C.border}`, marginBottom: 3, background: C.white, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 5, minHeight: 30, transition: 'all 0.15s' },
  gradeBtnActive: { padding: '5px 7px', borderRadius: 4, fontSize: 11, color: C.white, cursor: 'pointer', border: `2px solid ${C.primary}`, marginBottom: 3, background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 5, fontWeight: 600, minHeight: 30 },
  gradeLevel: { fontWeight: 700, fontSize: 11, padding: '2px 6px', borderRadius: 3, minWidth: 30, textAlign: 'center' as const },
  // 状态栏
  statusbar: { background: '#0f172a', color: C.white, padding: '4px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, height: 24, fontSize: 11, borderTop: '1px solid #334155' },
  statusbarItem: { display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, opacity: 0.9, cursor: 'pointer', padding: '2px 6px', borderRadius: 3, transition: 'background 0.15s' },
  // 弹窗
  modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modalContent: { background: C.white, borderRadius: 12, padding: 24, maxWidth: 600, width: '90%', maxHeight: '80vh', overflowY: 'auto' as const, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' },
  modalTitle: { fontSize: 18, fontWeight: 700, color: C.primary, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
}

// ========== 真实数据 ==========
const CURRENT_PATIENT = { id: 'P2026-0528', name: '王秀珍', age: 52, gender: '女', idNo: '510********1234', exam: '甲状腺US', request: '甲状腺超声检查（常规）', doctor: '张建国', dept: '超声科', phone: '138********5678', address: '四川省成都市武侯区科华北路', birthDate: '1974-05-15', allergies: '青霉素过敏' }

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
  { name: '峡部', value: '0.4', unit: 'cm', ref: '<0.5' },
  { name: '右结节 长', value: '1.5', unit: 'cm', ref: '-', attention: true },
  { name: '右结节 宽', value: '1.1', unit: 'cm', ref: '-', attention: true },
  { name: '右结节 厚', value: '0.9', unit: 'cm', ref: '-', attention: true },
]

const REPORT_TEMPLATES = [
  { id: 'T1', name: '甲状腺常规', icon: '🩺', text: '甲状腺大小正常，形态规则，包膜完整。双侧腺体回声均匀，未见明显占位。CDFI：血流信号未见明显异常。颈部未见明显肿大淋巴结。' },
  { id: 'T2', name: '甲状腺结节', icon: '🔵', text: '甲状腺大小正常，形态规则，包膜完整。右叶见一低回声结节，大小约 1.5×1.1×0.9 cm，边界欠清，形态欠规则，内回声不均匀，可见多发点状强回声。CDFI：结节内可见血流信号。TI-RADS 4a。' },
  { id: 'T3', name: '腹部常规', icon: '🫃', text: '肝脏大小正常，包膜光整，实质回声均匀，未见占位。胆囊大小正常，壁不厚，腔内未见结石。胰腺大小正常，回声均匀。脾脏不大。双肾大小正常，集合系统未见分离。' },
  { id: 'T4', name: '心脏常规', icon: '❤️', text: '左心室壁厚度正常，运动协调，收缩功能正常。LVEF 65%。各瓣膜结构未见明显异常，瓣口血流速度正常，未见明显反流。左心房、右心室大小正常。' },
]

const PATIENT_EDUCATION = [
  { title: 'TI-RADS 4a 解读', content: '您的甲状腺结节为 4a 类，恶性风险约 2-10%。建议进行细针穿刺活检（FNA）以明确诊断。多数 4a 类结节病理结果为良性。' },
  { title: 'FNA 流程说明', content: '细针穿刺活检是微创操作，在超声引导下进行，约 10-15 分钟。术后可能有轻微疼痛或瘀青，1-2 天可恢复。病理结果通常 3-5 个工作日出。' },
  { title: '随访建议', content: '建议 3-6 个月后复查超声，观察结节变化。如有声音嘶哑、吞咽困难、颈部淋巴结肿大等症状，请及时就诊。' },
]

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

const FULL_DIFFERENTIAL = [
  { name: '结节性甲状腺肿', probability: 45, reason: '最常见良性病变，多发结节常见' },
  { name: '甲状腺腺瘤', probability: 25, reason: '良性肿瘤，包膜完整' },
  { name: '甲状腺乳头状癌', probability: 18, reason: '最常见甲状腺癌（约80%），微钙化提示' },
  { name: '甲状腺髓样癌', probability: 5, reason: '少见，常伴降钙素升高' },
  { name: '甲状腺未分化癌', probability: 3, reason: '罕见，多见于老年，进展快' },
  { name: '甲状腺淋巴瘤', probability: 2, reason: '罕见，常有桥本背景' },
  { name: '亚急性甲状腺炎', probability: 2, reason: '可有压痛，临床可鉴别' },
]

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

const RELATED_EXAMS = [
  { name: '甲状腺功能五项', urgency: '高', cost: '¥180', reason: '评估甲状腺功能状态' },
  { name: '甲状腺自身抗体', urgency: '中', cost: '¥220', reason: '排除自身免疫性甲状腺炎' },
  { name: '降钙素', urgency: '高', cost: '¥80', reason: '排除髓样癌' },
  { name: '甲状腺球蛋白', urgency: '中', cost: '¥80', reason: '术后监测指标' },
  { name: '颈部CT平扫+增强', urgency: '中', cost: '¥680', reason: '评估淋巴结及周围结构' },
  { name: 'PET-CT', urgency: '低', cost: '¥8500', reason: '如确诊恶性，分期评估' },
]

// ========== SVG 影像渲染器 ==========
const UltrasoundImage: React.FC<{ type: string }> = ({ type }) => {
  const W = 1050, H = 1008
  if (type === 'thyroid-axial') {
    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ background: '#000' }}>
        <defs><radialGradient id="us1" cx="50%" cy="0%" r="100%"><stop offset="0%" stopColor="#fbbf24" stopOpacity="0.18" /><stop offset="50%" stopColor="#475569" stopOpacity="0.3" /><stop offset="100%" stopColor="#0f172a" stopOpacity="0.85" /></radialGradient></defs>
        <path d={`M ${W/2} 0 L ${W*0.1} ${H} L ${W*0.9} ${H} Z`} fill="url(#us1)" />
        {Array.from({ length: 200 }).map((_, i) => <circle key={i} cx={W/2 + (Math.random() - 0.5) * 700} cy={Math.random() * H} r={Math.random() * 8 + 2} fill="#475569" opacity={Math.random() * 0.3 + 0.1} />)}
        <ellipse cx={W*0.28} cy={H*0.45} rx={110} ry={75} fill="#94a3b8" opacity="0.4" stroke="#cbd5e1" strokeWidth="1.5" />
        <ellipse cx={W*0.72} cy={H*0.45} rx={120} ry={80} fill="#94a3b8" opacity="0.4" stroke="#cbd5e1" strokeWidth="1.5" />
        <ellipse cx={W*0.28} cy={H*0.45} rx={70} ry={50} fill="#475569" opacity="0.5" />
        <ellipse cx={W*0.72} cy={H*0.45} rx={75} ry={55} fill="#475569" opacity="0.5" />
        <ellipse cx={W*0.72} cy={H*0.45} rx={32} ry={24} fill="#1e293b" opacity="0.7" stroke="#fbbf24" strokeWidth="2.5" strokeDasharray="4 2" />
        {Array.from({ length: 10 }).map((_, i) => <circle key={i} cx={W*0.72 + (Math.random()-0.5)*45} cy={H*0.45 + (Math.random()-0.5)*35} r="2" fill="#fff" opacity="0.95" />)}
        <line x1={W*0.66} y1={H*0.32} x2={W*0.78} y2={H*0.32} stroke="#10b981" strokeWidth="2" />
        <text x={W*0.72} y={H*0.30} fill="#10b981" fontSize="13" textAnchor="middle" fontWeight="bold">↔ 1.5 cm</text>
        <line x1={W*0.65} y1={H*0.58} x2={W*0.79} y2={H*0.58} stroke="#10b981" strokeWidth="2" />
        <text x={W*0.72} y={H*0.62} fill="#10b981" fontSize="13" textAnchor="middle" fontWeight="bold">↔ 1.1 cm</text>
        <text x={W*0.62} y={H*0.40} fill="#fbbf24" fontSize="14" textAnchor="middle" fontWeight="bold">★ 结节</text>
        <text x={W*0.62} y={H*0.50} fill="#cbd5e1" fontSize="11" textAnchor="middle">1.5×1.1×0.9 cm</text>
        <text x={W*0.18} y={H*0.40} fill="#cbd5e1" fontSize="14" textAnchor="middle" fontWeight="bold">左叶</text>
        <text x={W*0.82} y={H*0.40} fill="#cbd5e1" fontSize="14" textAnchor="middle" fontWeight="bold">右叶</text>
        <rect x={W*0.48} y={H*0.44} width={W*0.04} height={6} fill="#64748b" opacity="0.7" />
      </svg>
    )
  }
  if (type === 'thyroid-sagittal') {
    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} style={{ background: '#000' }}>
        <defs><radialGradient id="us2" cx="50%" cy="0%" r="100%"><stop offset="0%" stopColor="#fbbf24" stopOpacity="0.18" /><stop offset="100%" stopColor="#0f172a" stopOpacity="0.85" /></radialGradient></defs>
        <path d={`M ${W/2} 0 L ${W*0.1} ${H} L ${W*0.9} ${H} Z`} fill="url(#us2)" />
        {Array.from({ length: 150 }).map((_, i) => <circle key={i} cx={W/2 + (Math.random() - 0.5) * 600} cy={Math.random() * H} r={Math.random() * 6 + 1} fill="#475569" opacity={Math.random() * 0.3 + 0.1} />)}
        <ellipse cx={W*0.5} cy={H*0.5} rx={200} ry={110} fill="#94a3b8" opacity="0.4" stroke="#cbd5e1" strokeWidth="1.5" />
        <ellipse cx={W*0.5} cy={H*0.5} rx={140} ry={80} fill="#475569" opacity="0.5" />
        <ellipse cx={W*0.5} cy={H*0.5} rx={55} ry={35} fill="#1e293b" opacity="0.7" stroke="#fbbf24" strokeWidth="2.5" strokeDasharray="4 2" />
        {Array.from({ length: 8 }).map((_, i) => <circle key={i} cx={W*0.5 + (Math.random()-0.5)*70} cy={H*0.5 + (Math.random()-0.5)*45} r="2" fill="#fff" opacity="0.95" />)}
        <text x={W*0.5} y={H*0.34} fill="#fbbf24" fontSize="16" textAnchor="middle" fontWeight="bold">★ 纵切面</text>
        <line x1={W*0.32} y1={H*0.5} x2={W*0.68} y2={H*0.5} stroke="#10b981" strokeWidth="2" />
        <text x={W*0.5} y={H*0.48} fill="#10b981" fontSize="13" textAnchor="middle" fontWeight="bold">1.5 cm</text>
      </svg>
    )
  }
  if (type === 'thyroid-axial-left') {
    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} style={{ background: '#000' }}>
        <defs><radialGradient id="us3" cx="50%" cy="0%" r="100%"><stop offset="0%" stopColor="#fbbf24" stopOpacity="0.15" /><stop offset="100%" stopColor="#0f172a" stopOpacity="0.85" /></radialGradient></defs>
        <path d={`M ${W/2} 0 L ${W*0.1} ${H} L ${W*0.9} ${H} Z`} fill="url(#us3)" />
        {Array.from({ length: 150 }).map((_, i) => <circle key={i} cx={W/2 + (Math.random() - 0.5) * 600} cy={Math.random() * H} r={Math.random() * 6 + 1} fill="#475569" opacity={Math.random() * 0.3 + 0.1} />)}
        <ellipse cx={W*0.35} cy={H*0.45} rx={130} ry={90} fill="#94a3b8" opacity="0.4" stroke="#cbd5e1" strokeWidth="1.5" />
        <ellipse cx={W*0.35} cy={H*0.45} rx={80} ry={58} fill="#475569" opacity="0.5" />
        <ellipse cx={W*0.75} cy={H*0.45} rx={100} ry={70} fill="#94a3b8" opacity="0.3" stroke="#cbd5e1" strokeWidth="1" />
        <ellipse cx={W*0.75} cy={H*0.45} rx={65} ry={45} fill="#475569" opacity="0.4" />
        <text x={W*0.35} y={H*0.40} fill="#cbd5e1" fontSize="16" textAnchor="middle" fontWeight="bold">左叶（详细）</text>
        <text x={W*0.35} y={H*0.50} fill="#10b981" fontSize="12" textAnchor="middle">回声均匀 · 形态规则</text>
        <text x={W*0.35} y={H*0.53} fill="#94a3b8" fontSize="10" textAnchor="middle">4.6×1.7×1.5 cm</text>
        <text x={W*0.75} y={H*0.40} fill="#cbd5e1" fontSize="14" textAnchor="middle" fontWeight="bold">右叶</text>
      </svg>
    )
  }
  if (type === 'cdfi') {
    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} style={{ background: '#000' }}>
        <defs><radialGradient id="us4" cx="50%" cy="0%" r="100%"><stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.25" /><stop offset="100%" stopColor="#0f172a" stopOpacity="0.9" /></radialGradient></defs>
        <path d={`M ${W/2} 0 L ${W*0.1} ${H} L ${W*0.9} ${H} Z`} fill="url(#us4)" />
        <ellipse cx={W*0.5} cy={H*0.5} rx={220} ry={130} fill="#475569" opacity="0.4" />
        {Array.from({ length: 80 }).map((_, i) => { const x = W*0.5 + (Math.random()-0.5) * 320; const y = H*0.5 + (Math.random()-0.5) * 200; const colors = ['#ef4444', '#f59e0b', '#eab308', '#84cc16', '#06b6d4']; return <circle key={i} cx={x} cy={y} r={Math.random() * 3 + 1} fill={colors[Math.floor(Math.random() * 5)]} opacity={Math.random() * 0.7 + 0.3} /> })}
        {Array.from({ length: 20 }).map((_, i) => <circle key={i} cx={W*0.5 + (Math.random()-0.5) * 100} cy={H*0.5 + (Math.random()-0.5) * 70} r="2.5" fill="#ef4444" opacity="0.95" />)}
        <text x={W*0.5} y={H*0.18} fill="#ef4444" fontSize="18" textAnchor="middle" fontWeight="bold">CDFI 彩色多普勒</text>
        <text x={W*0.5} y={H*0.86} fill="#cbd5e1" fontSize="13" textAnchor="middle">结节内血流 Adler II 级 · RI=0.72</text>
      </svg>
    )
  }
  if (type === 'elastography') {
    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} style={{ background: '#000' }}>
        <path d={`M ${W/2} 0 L ${W*0.1} ${H} L ${W*0.9} ${H} Z`} fill="rgba(0,0,0,0.85)" />
        {Array.from({ length: 300 }).map((_, i) => { const x = W*0.5 + (Math.random()-0.5) * 450; const y = H*0.5 + (Math.random()-0.5) * 260; const r = Math.random() * 12 + 3; const ratio = Math.sqrt(Math.pow((x - W*0.5) / 240, 2) + Math.pow((y - H*0.5) / 140, 2)); const color = ratio < 0.3 ? '#1e40af' : ratio < 0.55 ? '#0d9488' : ratio < 0.75 ? '#eab308' : '#dc2626'; return <circle key={i} cx={x} cy={y} r={r} fill={color} opacity={Math.random() * 0.4 + 0.4} /> })}
        <text x={W*0.5} y={H*0.13} fill="#eab308" fontSize="18" textAnchor="middle" fontWeight="bold">弹性成像 (Elastography)</text>
        <text x={W*0.5} y={H*0.86} fill="#cbd5e1" fontSize="14" textAnchor="middle">Emean = <tspan fill="#ef4444" fontWeight="bold">65 kPa</tspan> · SR = <tspan fill="#ef4444" fontWeight="bold">3.2</tspan></text>
      </svg>
    )
  }
  if (type === 'lymph-node') {
    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} style={{ background: '#000' }}>
        <path d={`M ${W/2} 0 L ${W*0.1} ${H} L ${W*0.9} ${H} Z`} fill="rgba(0,0,0,0.85)" />
        {[{ x: 0.25, y: 0.25, r: 38, label: 'II 区', id: 'LN1' }, { x: 0.4, y: 0.35, r: 28, label: 'III 区', id: 'LN2' }, { x: 0.6, y: 0.35, r: 32, label: 'IV 区', id: 'LN3', suspicious: true }, { x: 0.75, y: 0.4, r: 25, label: 'IV 区', id: 'LN4' }, { x: 0.3, y: 0.65, r: 22, label: 'V 区', id: 'LN5' }, { x: 0.5, y: 0.7, r: 20, label: 'VI 区', id: 'LN6' }, { x: 0.7, y: 0.7, r: 24, label: 'VI 区', id: 'LN7' }].map((ln, i) => (
          <g key={i}>
            <ellipse cx={W*ln.x} cy={H*ln.y} rx={ln.r} ry={ln.r*0.7} fill="#475569" opacity="0.5" stroke={ln.suspicious ? "#ef4444" : "#cbd5e1"} strokeWidth={ln.suspicious ? 2.5 : 1.5} strokeDasharray={ln.suspicious ? "4 2" : "0"} />
            <text x={W*ln.x} y={H*ln.y - ln.r - 8} fill={ln.suspicious ? "#ef4444" : "#fbbf24"} fontSize="13" textAnchor="middle" fontWeight="bold">{ln.label}</text>
            <text x={W*ln.x} y={H*ln.y + 4} fill="#cbd5e1" fontSize="11" textAnchor="middle">{(ln.r*0.25).toFixed(1)}cm</text>
          </g>
        ))}
        <text x={W*0.5} y={H*0.92} fill="#ef4444" fontSize="13" textAnchor="middle" fontWeight="bold">⚠ IV 区淋巴结可疑</text>
      </svg>
    )
  }
  if (type === 'isthmus') {
    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} style={{ background: '#000' }}>
        <defs><radialGradient id="us7" cx="50%" cy="0%" r="100%"><stop offset="0%" stopColor="#fbbf24" stopOpacity="0.15" /><stop offset="100%" stopColor="#0f172a" stopOpacity="0.85" /></radialGradient></defs>
        <path d={`M ${W/2} 0 L ${W*0.1} ${H} L ${W*0.9} ${H} Z`} fill="url(#us7)" />
        <rect x={W*0.3} y={H*0.45} width={W*0.4} height={20} fill="#94a3b8" opacity="0.6" stroke="#cbd5e1" strokeWidth="2" />
        <ellipse cx={W*0.18} cy={H*0.5} rx={80} ry={60} fill="#94a3b8" opacity="0.4" stroke="#cbd5e1" strokeWidth="1" />
        <ellipse cx={W*0.82} cy={H*0.5} rx={80} ry={60} fill="#94a3b8" opacity="0.4" stroke="#cbd5e1" strokeWidth="1" />
        <line x1={W*0.3} y1={H*0.4} x2={W*0.7} y2={H*0.4} stroke="#10b981" strokeWidth="2" />
        <text x={W*0.5} y={H*0.36} fill="#10b981" fontSize="14" textAnchor="middle" fontWeight="bold">↔ 0.4 cm</text>
        <text x={W*0.5} y={H*0.15} fill="#cbd5e1" fontSize="16" textAnchor="middle" fontWeight="bold">峡部切面</text>
        <text x={W*0.5} y={H*0.85} fill="#10b981" fontSize="13" textAnchor="middle">✓ 峡部厚度正常（&lt;0.5cm）</text>
      </svg>
    )
  }
  if (type === 'suprasternal') {
    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} style={{ background: '#000' }}>
        <defs><radialGradient id="us8" cx="50%" cy="0%" r="100%"><stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.2" /><stop offset="100%" stopColor="#0f172a" stopOpacity="0.9" /></radialGradient></defs>
        <path d={`M ${W/2} 0 L ${W*0.1} ${H} L ${W*0.9} ${H} Z`} fill="url(#us8)" />
        <ellipse cx={W*0.5} cy={H*0.45} rx={150} ry={80} fill="#1e293b" opacity="0.5" stroke="#cbd5e1" strokeWidth="1.5" />
        <ellipse cx={W*0.4} cy={H*0.5} rx={30} ry={20} fill="#374151" opacity="0.7" stroke="#94a3b8" strokeWidth="1" />
        <text x={W*0.4} y={H*0.55} fill="#cbd5e1" fontSize="10" textAnchor="middle">LCCA</text>
        <ellipse cx={W*0.6} cy={H*0.5} rx={30} ry={20} fill="#374151" opacity="0.7" stroke="#94a3b8" strokeWidth="1" />
        <text x={W*0.6} y={H*0.55} fill="#cbd5e1" fontSize="10" textAnchor="middle">RCCA</text>
        <text x={W*0.5} y={H*0.15} fill="#cbd5e1" fontSize="16" textAnchor="middle" fontWeight="bold">胸骨上窝切面</text>
        <text x={W*0.5} y={H*0.85} fill="#cbd5e1" fontSize="13" textAnchor="middle">未见明显肿大淋巴结</text>
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
  const [showAnnotations, setShowAnnotations] = useState(true)
  const [zoom, setZoom] = useState(1)
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
  // 弹窗状态
  const [modal, setModal] = useState<string | null>(null)
  const [modalContent, setModalContent] = useState<string>('')
  // 右栏卡片折叠
  const [rightCardsCollapsed, setRightCardsCollapsed] = useState<Record<string, boolean>>({})
  // CDSS 搜索
  const [cdssSearch, setCdssSearch] = useState('')
  // 悬停状态
  const [hoverKey, setHoverKey] = useState<string | null>(null)

  const qualityScore = 85
  const currentGradingRules = selectedGrading === 'TIRADS' ? TIRADS_RULES : selectedGrading === 'BIRADS' ? BIRADS_RULES : selectedGrading === 'ORADS' ? ORADS_RULES : LIRADS_RULES
  const currentProtocol = ULTRASOUND_PROTOCOLS.find(p => p.id === selectedProtocolId) || ULTRASOUND_PROTOCOLS[0]
  const selectedThumb = IMAGE_THUMBS.find(t => t.id === selectedThumbId) || IMAGE_THUMBS[0]
  const filteredProtocols = ULTRASOUND_PROTOCOLS.filter(p => p.name.includes(protocolSearch) || p.category.includes(protocolSearch))
  const totalChars = reportContent.findings.length + reportContent.diagnosis.length + reportContent.impression.length
  const attentionCount = MEASUREMENTS.filter(m => m.attention).length
  const toggleSection = (k: string) => setLeftSection(p => ({ ...p, [k]: !p[k] }))
  const toggleRightCard = (k: string) => setRightCardsCollapsed(p => ({ ...p, [k]: !p[k] }))

  // ===== 通用弹窗 =====
  const showModal = (title: string, content: string) => { setModal(title); setModalContent(content) }
  const closeModal = () => { setModal(null); setModalContent('') }

  // ===== 所有操作函数 =====
  const handleSave = () => { setSaveStatus('保存中...'); setTimeout(() => setSaveStatus('已保存 ✓ ' + new Date().toLocaleTimeString()), 600) }
  const handlePrint = () => { setSaveStatus('生成PDF...'); setTimeout(() => { setSaveStatus('PDF已生成'); window.print() }, 800) }
  const handleSubmit = () => { setSaveStatus('提交中...'); setTimeout(() => setSaveStatus('已提交至审核队列'), 800) }
  const handleShare = () => { setSaveStatus('生成分享链接...'); setTimeout(() => { setSaveStatus('链接已复制 ✓'); navigator.clipboard?.writeText('https://hospital.com/report/RPT-2026-0605-001').catch(() => {}) }, 600) }
  const handleExport = () => { setSaveStatus('导出文档...'); setTimeout(() => setSaveStatus('已导出为Word ✓'), 600) }
  const handleReset = () => { if (confirm('确定要清空当前报告吗？')) { saveSnapshot(); setReportContent({ findings: '', diagnosis: '', impression: '' }); setSaveStatus('已清空') } }
  const handleUndo = () => { if (undoStack.length > 0) { const prev = undoStack[undoStack.length - 1]; setRedoStack(r => [...r, reportContent]); setReportContent(prev); setUndoStack(u => u.slice(0, -1)); setSaveStatus('已撤销') } }
  const handleRedo = () => { if (redoStack.length > 0) { const next = redoStack[redoStack.length - 1]; setUndoStack(u => [...u, reportContent]); setReportContent(next); setRedoStack(r => r.slice(0, -1)); setSaveStatus('已重做') } }
  const saveSnapshot = () => setUndoStack(u => [...u, reportContent].slice(-30))
  const updateContent = (key: keyof typeof reportContent, val: string) => { saveSnapshot(); setReportContent(p => ({ ...p, [key]: val })) }
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
• 结节大小 1.5×1.1×0.9cm（较3月前 1.4×1.0cm 略增大）
• 多项可疑征象：边界欠清 + 微钙化 + 血流 Adler II + 硬度 3级
• TI-RADS 4a 评级合理
• 建议：FNA 进一步明确诊断`)
      setAiGenerating(false); setSaveStatus('AI 报告已生成 ✓')
    }, 1500)
  }
  const handleApplyTemplate = (text: string, name: string) => { saveSnapshot(); setReportContent(p => ({ ...p, findings: text })); setSelectedTemplate(name); setSaveStatus(`已应用模板：${name}`) }
  const handleApplyGrade = () => {
    const cur = currentGradingRules.find((g: any) => g.level === selectedGradeLevel)
    if (cur) { saveSnapshot(); setReportContent(p => ({ ...p, diagnosis: `甲状腺右叶结节 ${selectedGrading} ${selectedGradeLevel}`, impression: cur.management })); setSaveStatus(`已应用 ${selectedGrading} ${selectedGradeLevel}`) }
  }
  const handleInsert = (text: string, where: 'findings' | 'impression' = 'impression') => { saveSnapshot(); setReportContent(p => ({ ...p, [where]: p[where] + (p[where] && !p[where].endsWith('。') ? '\n' : '') + text })); setSaveStatus('已插入') }
  const handleInsertMeasurement = (m: typeof MEASUREMENTS[0]) => handleInsert(`${m.name} ${m.value}${m.unit}`, 'findings')
  const handleInsertHistory = (h: typeof HISTORY_REPORTS[0]) => handleInsert(`[参考 ${h.id}] ${h.diagnosis} → ${h.impression}`, 'impression')
  const handleInsertTerm = (term: string) => handleInsert(term, 'findings')
  const handleInsertTreatment = (t: typeof TREATMENT_OPTIONS[0]) => handleInsert(`[建议·${t.priority === 'high' ? '高优' : t.priority === 'medium' ? '中优' : '低优'}] ${t.name} - ${t.desc}`, 'impression')
  const handleInsertRelatedExam = (e: typeof RELATED_EXAMS[0]) => handleInsert(`[推荐检查] ${e.name} (${e.urgency}优, ${e.cost}) - ${e.reason}`, 'impression')
  const handleApplyPatientEducation = (ed: typeof PATIENT_EDUCATION[0]) => handleInsert(`[患教] ${ed.title}: ${ed.content}`, 'impression')
  const handleSynonym = (word: string) => {
    const syns = SYNONYMS[word]
    if (syns && syns.length > 0) { saveSnapshot(); const newFindings = reportContent.findings.replace(word, syns[0]); setReportContent(p => ({ ...p, findings: newFindings })); setSaveStatus(`已替换为：${syns[0]}`) }
  }
  // 影像画布点击
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!activeTool) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1)
    const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1)
    if (activeTool === 'text') {
      const text = prompt('请输入标注文字：')
      if (text) { handleInsert(`标注 (${x}%, ${y}%): ${text}`, 'findings'); setSaveStatus(`标注已添加：${text}`) }
    } else {
      handleInsert(`测量 (${x}%, ${y}%): 工具=${activeTool}`, 'findings')
      setSaveStatus(`点击位置 (${x}%, ${y}%) 已标注`)
    }
  }
  // 影像导航
  const handlePrevImage = () => { const idx = IMAGE_THUMBS.findIndex(t => t.id === selectedThumbId); const prevIdx = idx === 0 ? IMAGE_THUMBS.length - 1 : idx - 1; setSelectedThumbId(IMAGE_THUMBS[prevIdx].id); setSaveStatus(`已切换：${IMAGE_THUMBS[prevIdx].label}`) }
  const handleNextImage = () => { const idx = IMAGE_THUMBS.findIndex(t => t.id === selectedThumbId); const nextIdx = idx === IMAGE_THUMBS.length - 1 ? 0 : idx + 1; setSelectedThumbId(IMAGE_THUMBS[nextIdx].id); setSaveStatus(`已切换：${IMAGE_THUMBS[nextIdx].label}`) }
  // 缩放
  const handleZoom = (delta: number) => { setZoom(z => Math.max(0.5, Math.min(3, z + delta))); setSaveStatus(`缩放：${(zoom + delta).toFixed(1)}x`) }

  // 键盘快捷键
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 's') { e.preventDefault(); handleSave() }
        if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); handleUndo() }
        if (e.key === 'z' && e.shiftKey) { e.preventDefault(); handleRedo() }
        if (e.key === 'p') { e.preventDefault(); handlePrint() }
        if (e.key === 'Enter') { e.preventDefault(); handleSubmit() }
      }
      if (e.key === 'Escape') { navigate('/') }
      // 工具快捷键
      if (!e.ctrlKey && !e.metaKey && document.activeElement?.tagName !== 'TEXTAREA' && document.activeElement?.tagName !== 'INPUT') {
        if (e.key === 'd') setActiveTool('distance')
        if (e.key === 'a') setActiveTool('area')
        if (e.key === 'g') setActiveTool('angle')
        if (e.key === 'f') setIsFrozen(!isFrozen)
        if (e.key === 'ArrowLeft') handlePrevImage()
        if (e.key === 'ArrowRight') handleNextImage()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [undoStack, redoStack, isFrozen, selectedThumbId, zoom, reportContent])

  // 弹窗内容
  const getModalContent = (key: string): { title: string; body: string } => {
    switch (key) {
      case 'reportId': return { title: '报告编号', body: `报告编号: RPT-2026-0605-001\n创建时间: 2026-06-05 08:30\n检查时间: 2026-06-05 09:15\n报告医师: 张建国\n审核医师: 待审核\n所属医院: 示范三甲医院\n点击确认复制报告号` }
      case 'patient': return { title: '患者档案', body: `姓名: ${CURRENT_PATIENT.name}\n性别: ${CURRENT_PATIENT.gender}\n年龄: ${CURRENT_PATIENT.age}岁\n出生日期: ${CURRENT_PATIENT.birthDate}\n身份证: ${CURRENT_PATIENT.idNo}\n电话: ${CURRENT_PATIENT.phone}\n地址: ${CURRENT_PATIENT.address}\n过敏史: ${CURRENT_PATIENT.allergies}\n就诊科室: ${CURRENT_PATIENT.dept}\n申请医师: ${CURRENT_PATIENT.doctor}` }
      case 'quality': return { title: '10 维质控详情', body: `综合评分: ${qualityScore}/100\n\n• 完整性 95分 - 必填字段完整\n• 规范性 88分 - 用语符合标准\n• 准确性 82分 - 诊断与影像一致\n• 及时性 90分 - 报告按时\n• 一致性 85分 - 与历史无矛盾\n• 影像关联 80分 - 关键影像已附\n• 测量完整 92分 - 必要测量完成\n• 诊断明确 90分 - 主诊断明确\n• 建议合理 78分 - 治疗建议待加强\n• 危急值 100分 - 已正确标注` }
      case 'history_detail': return { title: '历史报告完整列表', body: HISTORY_REPORTS.map(h => `${h.id} | ${h.date} | ${h.diagnosis}\n   → ${h.impression}${h.current ? ' (当前)' : ''}`).join('\n\n') }
      case 'protocol_detail': return { title: '当前协议详情', body: `协议名称: ${currentProtocol.name}\n类别: ${currentProtocol.category}\n探头: ${currentProtocol.probe}\n频率: ${currentProtocol.frequency}\n深度: ${currentProtocol.depth}cm\n增益: ${currentProtocol.gain}\n适应症: ${currentProtocol.indications}\n必测项: ${currentProtocol.measurements?.join('、') || '无'}` }
      case 'measurements': return { title: '测量值详情', body: MEASUREMENTS.map(m => `${m.name}: ${m.value}${m.unit} (参考 ${m.ref})${m.attention ? ' ⚠' : ''}`).join('\n') }
      case 'image': return { title: '当前影像详情', body: `影像: ${selectedThumb.label}\n类型: ${selectedThumb.type}\n位置: 第 ${IMAGE_THUMBS.findIndex(t => t.id === selectedThumbId) + 1} / ${IMAGE_THUMBS.length} 帧\n操作: 点击影像可标注\n缩放: ${zoom}x\n状态: ${isFrozen ? '已冻结' : '实时'}` }
      case 'ai': return { title: 'AI 助手详情', body: `当前 AI 模型: M3-Large (超声专用)\n已用次数: 12 次 / 今日 100 次\n功能: 报告生成、影像分析、诊断建议、文献检索、相似案例、AI 问答\n\n提示: 点击左侧 AI 助手列表调用各项功能` }
      case 'stats': return { title: '统计信息', body: `报告字数: ${totalChars}\n测量项: ${MEASUREMENTS.length} 项\n关注项: ${attentionCount} 项\n影像帧: ${IMAGE_THUMBS.length} 帧\n缩略图: ${IMAGE_THUMBS.length} 张\n模板: ${REPORT_TEMPLATES.length} 套\n历史: ${HISTORY_REPORTS.length} 条\nCDSS 鉴别: ${FULL_DIFFERENTIAL.length} 项\n治疗方案: ${TREATMENT_OPTIONS.length} 项\n循证: ${EVIDENCE_GUIDELINES.length + EVIDENCE_LITERATURE.length} 条` }
      case 'undo': return { title: '操作历史', body: undoStack.length === 0 ? '没有可撤销的操作' : `可撤销 ${undoStack.length} 步\n可重做 ${redoStack.length} 步\n\n最近操作:\n${undoStack.slice(-5).map((c, i) => `${i + 1}. 见 ${c.findings.slice(0, 30)}...`).join('\n')}` }
      case 'critical': return { title: '危急值详情', body: criticalValue ? `✓ 危急值已标记\n\n标记时间: ${new Date().toLocaleString()}\n标记人: 张建国\n关联诊断: 甲状腺右叶结节 TI-RADS 4a\n\n危急处理流程:\n1. 立即通知临床医生 ✓\n2. 记录通知时间 ✓\n3. 启动随访计划 ✓\n4. 上报医务科 ✓` : '当前未标记危急值' }
      default: return { title: '详情', body: '暂无详情' }
    }
  }

  // 搜索过滤
  const filteredDifferential = FULL_DIFFERENTIAL.filter(d => d.name.includes(cdssSearch))
  const filteredGuidelines = EVIDENCE_GUIDELINES.filter(g => g.title.includes(cdssSearch) || g.organization.includes(cdssSearch))
  const filteredLiterature = EVIDENCE_LITERATURE.filter(l => l.title.includes(cdssSearch) || l.journal.includes(cdssSearch))

  return (
    <div style={s.root}>
      {/* ===== 顶栏 48px（每个元素都可点） ===== */}
      <div style={s.topbar}>
        <div style={s.topbarLeft}>
          <button style={{ ...s.btn, ...s.btnBack }} onClick={() => navigate('/')} title="返回主界面 (ESC)">
            <Home size={13} /> 返回
          </button>
          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.3)', margin: '0 4px' }} />
          <div
            style={hoverKey === 'reportId' ? { ...s.chip, ...s.chipHover } : s.chip}
            onClick={() => { navigator.clipboard?.writeText('RPT-2026-0605-001'); showModal('报告编号', getModalContent('reportId').body); setSaveStatus('报告号已复制 ✓') }}
            onMouseEnter={() => setHoverKey('reportId')}
            onMouseLeave={() => setHoverKey(null)}
            title="点击查看/复制"
          >
            <Copy size={11} /> RPT-2026-0605-001
          </div>
          <div
            style={hoverKey === 'patient' ? { ...s.chip, ...s.chipHover } : s.chip}
            onClick={() => showModal('患者档案', getModalContent('patient').body)}
            onMouseEnter={() => setHoverKey('patient')}
            onMouseLeave={() => setHoverKey(null)}
            title="点击查看患者档案"
          >
            <User size={11} /> {CURRENT_PATIENT.name} | {CURRENT_PATIENT.age}岁 {CURRENT_PATIENT.gender} | {CURRENT_PATIENT.idNo}
          </div>
          <div
            style={{ ...s.chip, background: '#fef3c7', color: C.warning, fontWeight: 600, cursor: 'pointer' }}
            onClick={() => setSaveStatus(isRecording ? '已停止录音' : '已开始录音')}
            title="点击切换录音"
          >
            ● 书写中
          </div>
          <div
            style={hoverKey === 'quality' ? { ...s.chip, background: qualityScore >= 90 ? C.success : C.warning, ...s.chipHover } : { ...s.chip, background: qualityScore >= 90 ? C.success : C.warning, fontWeight: 700 }}
            onClick={() => showModal('质控详情', getModalContent('quality').body)}
            onMouseEnter={() => setHoverKey('quality')}
            onMouseLeave={() => setHoverKey(null)}
            title="点击查看质控详情"
          >
            质控 {qualityScore}
          </div>
        </div>
        <div style={s.topbarRight}>
          <button style={{ ...s.btn, ...s.btnBack }} onClick={handleUndo} title="撤销 (Ctrl+Z)"><Undo2 size={12} /></button>
          <button style={{ ...s.btn, ...s.btnBack }} onClick={handleRedo} title="重做 (Ctrl+Shift+Z)"><Redo2 size={12} /></button>
          <button style={{ ...s.btn, ...s.btnBack }} onClick={handleSave} title="保存 (Ctrl+S)"><Save size={12} /> 保存</button>
          <button style={{ ...s.btn, ...s.btnBack }} onClick={handlePrint} title="打印 (Ctrl+P)"><Printer size={12} /> 打印</button>
          <button style={{ ...s.btn, ...s.btnBack }} onClick={handleShare} title="分享"><Share2 size={12} /> 分享</button>
          <button style={{ ...s.btn, ...s.btnBack }} onClick={handleExport} title="导出 Word"><Download size={12} /> 导出</button>
          <button style={{ ...s.btn, ...s.btnPrimary }} onClick={handleAiGenerate} disabled={aiGenerating} title="AI 一键生成">
            <Sparkles size={12} /> {aiGenerating ? '生成中...' : 'AI生成'}
          </button>
          <button style={{ ...s.btn, ...s.btnSuccess }} onClick={handleSubmit} title="提交审核 (Ctrl+Enter)"><Send size={12} /> 提交</button>
        </div>
      </div>

      {/* ===== 三栏 ===== */}
      <div style={s.cols}>
        {/* ===== 左栏 200px ===== */}
        <div style={s.leftCol}>
          {/* 协议 */}
          <div style={s.leftSection}>
            <div style={hoverKey === 'sec_protocol' ? { ...s.leftSectionTitle, ...s.leftSectionTitleHover } : s.leftSectionTitle} onClick={() => toggleSection('protocol')} onMouseEnter={() => setHoverKey('sec_protocol')} onMouseLeave={() => setHoverKey(null)}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Target size={11} /> 协议 ({filteredProtocols.length})</span>
              {leftSection.protocol ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
            </div>
            {leftSection.protocol && (
              <>
                <input style={s.leftSearch} placeholder="🔍 搜索协议..." value={protocolSearch} onChange={e => setProtocolSearch(e.target.value)} />
                <div
                  style={{ padding: '4px 10px', background: '#0f172a', cursor: 'pointer', fontSize: 10, color: C.accent, borderRadius: 3, margin: '0 6px 4px' }}
                  onClick={() => showModal('当前协议详情', getModalContent('protocol_detail').body)}
                >📋 {currentProtocol.name}</div>
                <div style={{ ...s.leftSectionContent, maxHeight: 130 }}>
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

          {/* 模板 */}
          <div style={s.leftSection}>
            <div style={s.leftSectionTitle} onClick={() => toggleSection('template')}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FileText size={11} /> 模板 ({REPORT_TEMPLATES.length})</span>
              {leftSection.template ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
            </div>
            {leftSection.template && (
              <div style={s.leftSectionContent}>
                {REPORT_TEMPLATES.map(t => (
                  <div key={t.id} style={selectedTemplate === t.name ? s.leftItemActive : s.leftItem} onClick={() => handleApplyTemplate(t.text, t.name)}>
                    <span style={{ fontSize: 14 }}>{t.icon}</span>
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 历史 */}
          <div style={s.leftSection}>
            <div style={s.leftSectionTitle} onClick={() => toggleSection('history')}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><History size={11} /> 历史 ({HISTORY_REPORTS.length})</span>
              {leftSection.history ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
            </div>
            {leftSection.history && (
              <div style={{ ...s.leftSectionContent, maxHeight: 100 }}>
                {HISTORY_REPORTS.map((h, i) => (
                  <div key={i} style={s.leftItem} onClick={() => handleInsertHistory(h)}>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: h.current ? C.warning : C.white, fontFamily: 'monospace' }}>{h.id} {h.current && '★'}</div>
                      <div style={{ fontSize: 10, color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.diagnosis}</div>
                    </div>
                  </div>
                ))}
                <div style={{ padding: '4px 10px', background: C.accent, color: C.white, textAlign: 'center', fontSize: 10, borderRadius: 3, margin: '2px 0', cursor: 'pointer' }} onClick={() => showModal('历史报告', getModalContent('history_detail').body)}>
                  查看全部历史 →
                </div>
              </div>
            )}
          </div>

          {/* 词库 */}
          <div style={s.leftSection}>
            <div style={s.leftSectionTitle} onClick={() => toggleSection('term')}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><BookOpen size={11} /> 词库</span>
              {leftSection.term ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
            </div>
            {leftSection.term && (
              <div style={s.leftSectionContent}>
                <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 3, padding: 2 }}>
                  {['低回声', '高回声', '等回声', '无回声', '边界清晰', '边界欠清', 'CDFI血流', '微钙化', '纵横比>1', '形态规则'].map((t, i) => (
                    <span key={i} style={{ padding: '3px 6px', background: '#0f172a', color: C.accent, borderRadius: 3, fontSize: 11, cursor: 'pointer', border: '1px solid #334155' }} onClick={() => handleInsertTerm(t)}>{t}</span>
                  ))}
                </div>
                <div style={{ fontSize: 10, color: '#fbbf24', padding: 4, fontWeight: 600 }}>同义词（点击替换）</div>
                <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 3, padding: 2 }}>
                  {Object.keys(SYNONYMS).slice(0, 8).map((key, i) => (
                    <span key={i} style={{ padding: '3px 6px', background: '#7c3aed22', color: C.purple, borderRadius: 3, fontSize: 10, cursor: 'pointer', border: '1px solid #7c3aed44' }} onClick={() => handleSynonym(key)} title={`替换为: ${SYNONYMS[key][0]}`}>{key}</span>
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
                </div>
                {['完整性', '规范性', '准确性', '及时性', '一致性', '影像关联', '测量完整', '诊断明确', '建议合理', '危急值'].map((q, i) => {
                  const score = [95, 88, 82, 90, 85, 80, 92, 90, 78, 100][i]
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '1px 2px', fontSize: 10 }} onClick={() => showModal('质控详情', `${q}: ${score}分\n\n${q === '完整性' ? '必填字段已全部填写 ✓' : q === '规范性' ? '标准用语覆盖度 88%' : q === '准确性' ? '诊断与影像征象一致性 82%' : q === '及时性' ? '报告在检查后 2 小时内完成' : q === '一致性' ? '与历史报告无矛盾' : q === '影像关联' ? '3 张关键影像已附' : q === '测量完整' ? '10 项必测项已完成' : q === '诊断明确' ? '主诊断 TI-RADS 4a 明确' : q === '建议合理' ? '已包含 FNA + 复查建议' : '危急值已正确标注 ✓'}`)}>
                      <span style={{ width: 44, color: '#94a3b8', cursor: 'pointer' }}>{q}</span>
                      <div style={{ flex: 1, height: 3, background: '#334155', borderRadius: 2, overflow: 'hidden', cursor: 'pointer' }}>
                        <div style={{ width: `${score}%`, height: '100%', background: score >= 90 ? C.success : C.warning }} />
                      </div>
                      <span style={{ fontWeight: 600, color: score >= 90 ? C.success : C.warning, minWidth: 18, textAlign: 'right' as const, fontSize: 10, cursor: 'pointer' }}>{score}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* AI */}
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
                  { icon: <Database size={11} />, label: '相似案例', color: C.success, action: () => showModal('相似案例', '基于当前诊断，AI 检索到以下相似案例：\n\n1. 病例 #DB-2025-0892 - 女性 49 岁 - TI-RADS 4a - 病理：结节性甲状腺肿\n2. 病例 #DB-2025-1245 - 女性 56 岁 - TI-RADS 4a - 病理：甲状腺乳头状癌\n3. 病例 #DB-2026-0123 - 女性 51 岁 - TI-RADS 4a - 病理：甲状腺腺瘤\n\n相似度: 78-85%') },
                  { icon: <BookMarked size={11} />, label: 'AI 影像分析', color: C.accent, action: () => { setSaveStatus('AI 影像分析中...'); setTimeout(() => { setSaveStatus('AI 分析：结节 4a 级，可疑'); setAiAnalysis('AI 已自动识别结节特征') }, 1200) } },
                  { icon: <MessageSquare size={11} />, label: 'AI 问答', color: C.purple, action: () => showModal('AI 问答', 'Q: 这个结节恶性概率？\nA: 基于 TI-RADS 4a + 弹性硬度 3 级 + 边界欠清 + 微钙化，恶性风险约 5-10%。\n\nQ: 下一步最佳处理？\nA: 建议细针穿刺活检（FNA）明确性质，同时查甲功+降钙素。\n\nQ: 多久复查一次？\nA: 如 FNA 阴性，建议 3-6 月后超声复查；如 FNA 阳性，转外科处理。') },
                  { icon: <FlaskConical size={11} />, label: 'AI 文献检索', color: C.success, action: () => setRightTab('evidence') },
                  { icon: <Heart size={11} />, label: 'AI 治疗推荐', color: C.danger, action: () => setRightTab('treatment') },
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

          {/* 患教 */}
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
                  { key: 'distance', label: '距离', icon: <Ruler size={12} />, hotkey: 'D' },
                  { key: 'area', label: '面积', icon: <Target size={12} />, hotkey: 'A' },
                  { key: 'angle', label: '角度', icon: <Crosshair size={12} />, hotkey: 'G' },
                  { key: 'ellipse', label: '椭圆', icon: <Activity size={12} />, hotkey: '' },
                  { key: 'arrow', label: '箭头', icon: <ArrowRight size={12} />, hotkey: '' },
                  { key: 'text', label: '文字', icon: <Type size={12} />, hotkey: '' },
                ].map(t => (
                  <button key={t.key} style={activeTool === t.key ? s.imageToolBtnActive : s.imageToolBtn} onClick={() => setActiveTool(activeTool === t.key ? null : t.key)} title={t.hotkey ? `快捷键: ${t.hotkey}` : ''}>
                    {t.icon} {t.label}
                  </button>
                ))}
                <div style={{ width: 1, height: 16, background: '#475569' }} />
                <button style={s.imageToolBtn} onClick={() => setIsFrozen(!isFrozen)} title="快捷键: F">{isFrozen ? '▶ 解冻' : '❄ 冻结'}</button>
                <button style={s.imageToolBtn} onClick={() => handleZoom(0.2)} title="放大"><ZoomIn size={12} /></button>
                <button style={s.imageToolBtn} onClick={() => handleZoom(-0.2)} title="缩小"><ZoomOut size={12} /></button>
                <span style={{ fontSize: 11, color: '#94a3b8', minWidth: 30, textAlign: 'center' }}>{zoom.toFixed(1)}x</span>
                <button style={s.imageToolBtn} onClick={() => setShowAnnotations(!showAnnotations)}>{showAnnotations ? '👁 标注' : '🚫 标注'}</button>
                <button style={s.imageToolBtn} onClick={() => setActiveTool(null)}><Eraser size={12} /> 清除</button>
                <button style={s.imageToolBtn} onClick={() => alert('图像已保存到本地（演示）')}><Save size={12} /> 存图</button>
                <div style={{ width: 1, height: 16, background: '#475569' }} />
                <button style={s.imageToolBtn} onClick={() => alert('对比模式（演示）')}><Layers size={12} /> 对比</button>
                <button style={s.imageToolBtn} onClick={() => alert('录像模式（演示）')}><Camera size={12} /> 录像</button>
                <button style={s.imageToolBtn} onClick={() => { setZoom(1); setSaveStatus('已重置视图') }}><RotateCw size={12} /> 重置</button>
              </div>

              <div style={s.imageCanvas} onClick={handleCanvasClick}>
                <span style={s.imageLabel}>📷 {selectedThumb.label} · {showAnnotations ? '标注开启' : '标注关闭'} · {isFrozen ? '❄ 已冻结' : '实时'} · {zoom}x</span>
                <button style={{ ...s.imageNav, left: 8 }} onClick={(e) => { e.stopPropagation(); handlePrevImage() }} title="上一帧 (←)"><ChevronDown size={20} style={{ transform: 'rotate(90deg)' }} /></button>
                <button style={{ ...s.imageNav, right: 8 }} onClick={(e) => { e.stopPropagation(); handleNextImage() }} title="下一帧 (→)"><ChevronDown size={20} style={{ transform: 'rotate(-90deg)' }} /></button>
                {showAnnotations ? (
                  <div style={{ transform: `scale(${zoom})`, transition: 'transform 0.2s' }}>
                    <UltrasoundImage type={selectedThumb.type} />
                  </div>
                ) : (
                  <div style={{ color: '#475569', fontSize: 24 }}>标注已隐藏 · 点击恢复</div>
                )}
                <span style={s.imageParams}>深度:{currentProtocol.depth}cm 增益:72 频率:{currentProtocol.frequency} 工具:{activeTool || '无'}</span>
                <div style={{ position: 'absolute', top: 10, right: 14, color: '#94a3b8', fontSize: 11, fontWeight: 600, zIndex: 1, background: 'rgba(0,0,0,0.5)', padding: '2px 8px', borderRadius: 3, cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); showModal('影像详情', getModalContent('image').body) }}>
                  {IMAGE_THUMBS.findIndex(t => t.id === selectedThumbId) + 1} / {IMAGE_THUMBS.length} 🔍
                </div>
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

            {/* 报告区 */}
            <div style={s.reportArea}>
              <div style={s.reportTabs}>
                <button style={s.reportTabActive}><Edit3 size={12} /> 编辑</button>
                <button style={s.reportTab} onClick={() => showModal('预览报告', `${reportContent.findings}\n\n【诊断】\n${reportContent.diagnosis}\n\n【建议】\n${reportContent.impression}`)}><Eye size={12} /> 预览</button>
                <button style={s.reportTab} onClick={() => showModal('对比历史', HISTORY_REPORTS.slice(0, 3).map(h => `${h.id} | ${h.date}\n${h.diagnosis} → ${h.impression}`).join('\n\n'))}><GitBranch size={12} /> 对比</button>
                <button style={s.reportTab} onClick={handleReset}><RefreshCw size={12} /> 重置</button>
              </div>
              <div style={s.reportToolbar}>
                <button style={{ ...s.btn, background: isRecording ? C.danger : C.accent, color: C.white }} onClick={() => setIsRecording(!isRecording)} title="语音输入">
                  {isRecording ? <MicOff size={12} /> : <Mic size={12} />} {isRecording ? '停止' : '语音'}
                </button>
                <button style={{ ...s.btn, background: C.white, color: C.primary, border: `1px solid ${C.border}` }} onClick={() => alert('打开影像选择器（演示）')}><ImageIcon size={12} /> 插图</button>
                <button style={{ ...s.btn, background: C.white, color: C.primary, border: `1px solid ${C.border}` }} onClick={() => alert('词库（演示）')}><BookOpen size={12} /> 词库</button>
                <button style={{ ...s.btn, background: C.white, color: C.primary, border: `1px solid ${C.border}` }} onClick={() => alert('同义词库（演示）')}><RefreshCw size={12} /> 同义</button>
                <button style={{ ...s.btn, background: C.white, color: C.primary, border: `1px solid ${C.border}` }} onClick={() => alert('插入分隔线')}><Edit3 size={12} /> 分隔</button>
                <div style={{ flex: 1 }} />
                <button style={{ ...s.btn, background: criticalValue ? C.danger : C.white, color: criticalValue ? C.white : C.textLight, border: `1px solid ${criticalValue ? C.danger : C.border}` }} onClick={() => { setCriticalValue(!criticalValue); setSaveStatus(criticalValue ? '取消危急值' : '标记危急值 ✓') }}>
                  <AlertTriangle size={12} /> {criticalValue ? '危急 ✓' : '危急值'}
                </button>
              </div>

              <div style={s.reportBody}>
                {aiAnalysis && (
                  <div style={{ ...s.reportSection, background: '#f0f9ff', border: '1px solid #7dd3fc' }}>
                    <div style={s.reportSectionTitle}><span><Sparkles size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle', color: C.purple }} /> AI 影像分析</span>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textLight }} onClick={() => setAiAnalysis(null)}><X size={11} /></button>
                    </div>
                    <pre style={{ fontSize: 11, color: C.text, whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'inherit' }}>{aiAnalysis}</pre>
                  </div>
                )}

                <div style={s.reportSection}>
                  <div style={s.reportSectionTitle}><span><Ruler size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} /> 测量值（点击插入）· {MEASUREMENTS.length} 项</span><span style={{ fontSize: 10, color: C.textLight, cursor: 'pointer' }} onClick={() => showModal('测量值详情', getModalContent('measurements').body)}>关注 {attentionCount} 🔍</span></div>
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

                <div style={s.reportField}>
                  <div style={s.reportLabel}><FileText size={12} /> 超声所见 {isRecording && <span style={{ marginLeft: 6, padding: '1px 6px', borderRadius: 3, background: C.danger, color: C.white, fontSize: 10, fontWeight: 600 }}>● 录音中</span>}</div>
                  <textarea style={{ ...s.reportTextarea, minHeight: 70 }} value={reportContent.findings} onChange={e => updateContent('findings', e.target.value)} rows={3} />
                </div>

                <div style={s.reportField}>
                  <div style={s.reportLabel}><Stethoscope size={12} /> 超声诊断</div>
                  <textarea style={{ ...s.reportTextarea, fontWeight: 600, color: C.primary, fontSize: 14, minHeight: 35 }} value={reportContent.diagnosis} onChange={e => updateContent('diagnosis', e.target.value)} rows={2} />
                </div>

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
                  <div style={s.cdssCardTitle} onClick={() => toggleRightCard('diagnosis')}>
                    <span><Brain size={11} /> 当前诊断</span>
                    {rightCardsCollapsed.diagnosis ? <ChevronRight size={11} /> : <ChevronDown size={11} />}
                  </div>
                  {!rightCardsCollapsed.diagnosis && (
                    <>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.primary }}>甲状腺右叶结节</div>
                      <div style={{ fontSize: 10, color: C.textLight, marginTop: 2 }}>ICD-10: E04.901 · 内分泌系统</div>
                    </>
                  )}
                </div>
                <div style={s.cdssCard}>
                  <div style={s.cdssCardTitle} onClick={() => toggleRightCard('diff')}>
                    <span><Target size={11} /> 鉴别诊断 · {FULL_DIFFERENTIAL.length}</span>
                    {rightCardsCollapsed.diff ? <ChevronRight size={11} /> : <ChevronDown size={11} />}
                  </div>
                  {!rightCardsCollapsed.diff && (
                    <>
                      <input style={{ ...s.leftSearch, margin: '0 0 4px' }} placeholder="🔍 搜索..." value={cdssSearch} onChange={e => setCdssSearch(e.target.value)} />
                      {filteredDifferential.map((d, i) => (
                        <div key={i} style={d.probability >= 30 ? s.cdssItemHigh : d.probability >= 10 ? s.cdssItemWarn : s.cdssItem} onClick={() => handleInsert(`[鉴别] ${d.name} (${d.probability}%) - ${d.reason}`, 'impression')} title={d.reason}>
                          <span style={{ flex: 1 }}>{d.name}</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: d.probability >= 30 ? C.danger : d.probability >= 10 ? C.warning : C.textLight }}>{d.probability}%</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
                <div style={s.cdssCard}>
                  <div style={s.cdssCardTitle} onClick={() => toggleRightCard('risk')}>
                    <span><AlertTriangle size={11} /> 漏诊风险</span>
                    {rightCardsCollapsed.risk ? <ChevronRight size={11} /> : <ChevronDown size={11} />}
                  </div>
                  {!rightCardsCollapsed.risk && (
                    <>
                      <div style={s.cdssItemWarn} onClick={() => handleInsert('⚠ 建议补充颈部淋巴结扫查（甲状腺癌常伴颈淋巴结转移）', 'impression')}><AlertTriangle size={12} /><span>颈部淋巴结扫查</span></div>
                      <div style={s.cdssItemWarn} onClick={() => handleInsert('⚠ 建议甲状腺功能检查（TSH/FT3/FT4/Tg/TgAb）', 'impression')}><AlertTriangle size={12} /><span>甲状腺功能</span></div>
                      <div style={s.cdssItemWarn} onClick={() => handleInsert('⚠ 建议降钙素检测（排除髓样癌）', 'impression')}><AlertTriangle size={12} /><span>降钙素检测</span></div>
                      <div style={s.cdssItemWarn} onClick={() => handleInsert('⚠ 注意观察：结节近期增大（1.4→1.5cm）', 'impression')}><AlertTriangle size={12} /><span>结节增长</span></div>
                    </>
                  )}
                </div>
                <div style={s.cdssCard}>
                  <div style={s.cdssCardTitle} onClick={() => toggleRightCard('decision')}>
                    <span><Check size={12} /> 决策建议</span>
                    {rightCardsCollapsed.decision ? <ChevronRight size={11} /> : <ChevronDown size={11} />}
                  </div>
                  {!rightCardsCollapsed.decision && TREATMENT_OPTIONS.filter(t => t.priority === 'high').map((t, i) => (
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
                  <div style={s.cdssCardTitle} onClick={() => toggleRightCard('grade_sys')}><span><Award size={11} /> 分级系统</span>{rightCardsCollapsed.grade_sys ? <ChevronRight size={11} /> : <ChevronDown size={11} />}</div>
                  {!rightCardsCollapsed.grade_sys && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                      {[{ key: 'TIRADS', label: 'TI-RADS', sub: '甲状腺' }, { key: 'BIRADS', label: 'BI-RADS', sub: '乳腺' }, { key: 'ORADS', label: 'O-RADS', sub: '卵巢' }, { key: 'LIRADS', label: 'LI-RADS', sub: '肝脏' }].map(g => (
                        <button key={g.key} style={selectedGrading === g.key ? s.gradeBtnActive : s.gradeBtn} onClick={() => { setSelectedGrading(g.key as any); setSaveStatus(`已选 ${g.label}`) }}>
                          <span style={{ fontSize: 11, fontWeight: 700 }}>{g.label}</span>
                          <span style={{ fontSize: 9, opacity: 0.8 }}>{g.sub}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div style={s.cdssCard}>
                  <div style={s.cdssCardTitle} onClick={() => toggleRightCard('grade_level')}><span>{selectedGrading} 分级</span>{rightCardsCollapsed.grade_level ? <ChevronRight size={11} /> : <ChevronDown size={11} />}</div>
                  {!rightCardsCollapsed.grade_level && currentGradingRules.map((g: any) => (
                    <div key={g.level} style={selectedGradeLevel === g.level ? s.gradeBtnActive : s.gradeBtn} onClick={() => { setSelectedGradeLevel(g.level); setSaveStatus(`已选 ${selectedGrading} ${g.level}`) }}>
                      <span style={{ ...s.gradeLevel, background: g.color, color: C.white }}>{g.level}</span>
                      <span style={{ flex: 1, fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.name}</span>
                      <span style={{ fontSize: 9, color: selectedGradeLevel === g.level ? 'rgba(255,255,255,0.85)' : C.textLight }}>{g.malignancy}</span>
                    </div>
                  ))}
                </div>
                <div style={s.cdssCard}>
                  <div style={s.cdssCardTitle} onClick={() => toggleRightCard('grade_advice')}><span><Lightbulb size={11} /> 管理建议</span>{rightCardsCollapsed.grade_advice ? <ChevronRight size={11} /> : <ChevronDown size={11} />}</div>
                  {!rightCardsCollapsed.grade_advice && (() => {
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
                  <div style={s.cdssCardTitle} onClick={() => toggleRightCard('guide')}><span><BookMarked size={11} /> 临床指南 ({EVIDENCE_GUIDELINES.length})</span>{rightCardsCollapsed.guide ? <ChevronRight size={11} /> : <ChevronDown size={11} />}</div>
                  {!rightCardsCollapsed.guide && (
                    <>
                      <input style={{ ...s.leftSearch, margin: '0 0 4px' }} placeholder="🔍 搜索指南/文献..." value={cdssSearch} onChange={e => setCdssSearch(e.target.value)} />
                      {filteredGuidelines.map((g: any) => (
                        <div key={g.id} style={s.cdssItem} onClick={() => handleInsert(`[指南] ${g.title} (${g.organization} ${g.year})`, 'impression')}>
                          <FileText size={12} color={C.accent} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 11, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.title}</div>
                            <div style={{ fontSize: 9, color: C.textLight }}>{g.organization} · {g.year}</div>
                          </div>
                          <ExternalLink size={10} color={C.textLight} />
                        </div>
                      ))}
                    </>
                  )}
                </div>
                <div style={s.cdssCard}>
                  <div style={s.cdssCardTitle} onClick={() => toggleRightCard('lit')}><span><Database size={11} /> 关键文献 ({EVIDENCE_LITERATURE.length})</span>{rightCardsCollapsed.lit ? <ChevronRight size={11} /> : <ChevronDown size={11} />}</div>
                  {!rightCardsCollapsed.lit && filteredLiterature.map((l: any, i) => (
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
                  <div style={s.cdssCardTitle} onClick={() => toggleRightCard('drg_info')}><span><Network size={11} /> DRG 智能匹配</span>{rightCardsCollapsed.drg_info ? <ChevronRight size={11} /> : <ChevronDown size={11} />}</div>
                  {!rightCardsCollapsed.drg_info && (
                    <>
                      <div style={{ padding: 8, background: '#eff6ff', borderRadius: 4, marginBottom: 6 }}>
                        <div style={{ fontSize: 10, color: C.textLight }}>DRG 组</div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: C.primary, fontFamily: 'monospace' }}>KS1</div>
                        <div style={{ fontSize: 11, color: C.text, marginTop: 2 }}>甲状腺疾病，伴合并症</div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                        <div style={{ padding: 6, background: C.white, borderRadius: 3, border: `1px solid ${C.border}` }}><div style={{ fontSize: 9, color: C.textLight }}>权重</div><div style={{ fontSize: 14, fontWeight: 700, color: C.primary }}>1.25</div></div>
                        <div style={{ padding: 6, background: C.white, borderRadius: 3, border: `1px solid ${C.border}` }}><div style={{ fontSize: 9, color: C.textLight }}>费用</div><div style={{ fontSize: 14, fontWeight: 700, color: C.primary }}>¥8,500</div></div>
                        <div style={{ padding: 6, background: C.white, borderRadius: 3, border: `1px solid ${C.border}` }}><div style={{ fontSize: 9, color: C.textLight }}>ICD-10</div><div style={{ fontSize: 11, fontWeight: 600, color: C.primary, fontFamily: 'monospace' }}>E04.901</div></div>
                        <div style={{ padding: 6, background: C.white, borderRadius: 3, border: `1px solid ${C.border}` }}><div style={{ fontSize: 9, color: C.textLight }}>ICD-9</div><div style={{ fontSize: 11, fontWeight: 600, color: C.primary, fontFamily: 'monospace' }}>06.0101</div></div>
                      </div>
                    </>
                  )}
                </div>
                <div style={s.cdssCard}>
                  <div style={s.cdssCardTitle} onClick={() => toggleRightCard('drg_ops')}><span><CheckCircle2 size={11} /> 操作</span>{rightCardsCollapsed.drg_ops ? <ChevronRight size={11} /> : <ChevronDown size={11} />}</div>
                  {!rightCardsCollapsed.drg_ops && (
                    <>
                      <div style={s.cdssItem} onClick={() => handleInsert(`[DRG] 已匹配 KS1 组（权重 1.25，例均 ¥8,500）`, 'impression')}><CheckCircle2 size={12} color={C.success} /><span>入组成功 (-3.2%)</span></div>
                      <div style={s.cdssItem} onClick={() => showModal('DRG 详情', 'DRG 组: KS1 甲状腺疾病，伴合并症\n权重: 1.25\n例均费用: ¥8,500\n入组成功率: 96.5%\n偏差: -3.2% (结余)\n\n病案首页已自动生成') }><ExternalLink size={12} color={C.accent} /><span>查看 DRG 详情</span></div>
                      <div style={s.cdssItem} onClick={() => showModal('病案首页', '姓名: 王秀珍\n性别: 女  年龄: 52\n住院号: ---\n主要诊断: 甲状腺右叶结节 (E04.901)\n其他诊断: ---\n主要操作: 超声检查 (06.0101)\n费用: ¥8,500\nDRG: KS1\n\n病案已提交医保接口') }><FileText size={12} color={C.accent} /><span>病案首页预览</span></div>
                    </>
                  )}
                </div>
              </div>
            )}

            {rightTab === 'treatment' && (
              <div>
                <div style={s.cdssCard}>
                  <div style={s.cdssCardTitle} onClick={() => toggleRightCard('treatment_list')}><span><Heart size={11} /> 治疗方案 ({TREATMENT_OPTIONS.length})</span>{rightCardsCollapsed.treatment_list ? <ChevronRight size={11} /> : <ChevronDown size={11} />}</div>
                  {!rightCardsCollapsed.treatment_list && TREATMENT_OPTIONS.map((t, i) => (
                    <div key={i} style={s.cdssItem} onClick={() => handleInsertTreatment(t)}>
                      <CheckCircle2 size={12} color={t.priority === 'high' ? C.danger : t.priority === 'medium' ? C.warning : C.textLight} />
                      <span style={{ flex: 1, fontSize: 11 }}>{t.name}</span>
                      <span style={{ fontSize: 9, color: t.priority === 'high' ? C.danger : t.priority === 'medium' ? C.warning : C.textLight, fontWeight: 600 }}>{t.priority === 'high' ? '高' : t.priority === 'medium' ? '中' : '低'}</span>
                    </div>
                  ))}
                </div>
                <div style={s.cdssCard}>
                  <div style={s.cdssCardTitle} onClick={() => toggleRightCard('related_exams')}><span><FlaskConical size={11} /> 关联检查 ({RELATED_EXAMS.length})</span>{rightCardsCollapsed.related_exams ? <ChevronRight size={11} /> : <ChevronDown size={11} />}</div>
                  {!rightCardsCollapsed.related_exams && RELATED_EXAMS.map((e, i) => (
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

      {/* ===== 状态栏 24px（每个item都可点） ===== */}
      <div style={s.statusbar}>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={s.statusbarItem} onClick={() => setSaveStatus('已保存 ✓ ' + new Date().toLocaleTimeString())}><CheckCircle2 size={10} /> {saveStatus}</span>
          <span style={s.statusbarItem} onClick={() => showModal('字数统计', `当前报告字数: ${totalChars}\n\n• 超声所见: ${reportContent.findings.length}\n• 超声诊断: ${reportContent.diagnosis.length}\n• 诊断建议: ${reportContent.impression.length}`)}>字数:{totalChars}</span>
          <span style={s.statusbarItem} onClick={() => showModal('影像', getModalContent('image').body)}><ImageIcon size={10} /> {IMAGE_THUMBS.length}张</span>
          <span style={s.statusbarItem} onClick={() => showModal('测量值', getModalContent('measurements').body)}><Ruler size={10} /> {MEASUREMENTS.length}测量</span>
          <span style={s.statusbarItem} onClick={() => showModal('统计', getModalContent('stats').body)}>关注:{attentionCount}</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {criticalValue && <span style={{ ...s.statusbarItem, color: '#fca5a5', fontWeight: 700 }} onClick={() => showModal('危急值', getModalContent('critical').body)}><AlertTriangle size={10} /> 危急</span>}
          <span style={s.statusbarItem} onClick={() => showModal('操作历史', getModalContent('undo').body)}>撤销:{undoStack.length}</span>
          <span style={s.statusbarItem} onClick={() => setSaveStatus(`工具: ${activeTool || '无'}`)}>工具:{activeTool || '无'}</span>
          <span style={s.statusbarItem} onClick={() => showModal('影像', getModalContent('image').body)}>影像:{selectedThumb.label}</span>
          <span style={s.statusbarItem} onClick={() => setRightTab('grading')}>分级:{selectedGrading} {selectedGradeLevel}</span>
          <span style={s.statusbarItem} onClick={() => showModal('AI 助手', getModalContent('ai').body)}>AI: ON</span>
        </div>
      </div>

      {/* ===== 通用弹窗 ===== */}
      {modal && (
        <div style={s.modal} onClick={closeModal}>
          <div style={s.modalContent} onClick={e => e.stopPropagation()}>
            <div style={s.modalTitle}>
              <span>{modal}</span>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textLight, padding: 4, display: 'flex' }}><X size={20} /></button>
            </div>
            <pre style={{ fontSize: 13, color: C.text, whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'inherit', lineHeight: 1.7, background: '#f8fafc', padding: 16, borderRadius: 6, border: `1px solid ${C.border}` }}>{modalContent}</pre>
            <div style={{ marginTop: 16, textAlign: 'right' }}>
              <button onClick={closeModal} style={{ padding: '8px 20px', background: C.primary, color: C.white, border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>关闭</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
