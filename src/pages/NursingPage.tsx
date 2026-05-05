// @ts-nocheck
import { useState, useMemo } from 'react';
import {
  Activity, Clock, User, FileText, CheckCircle, XCircle, AlertCircle,
  Search, Plus, ClipboardList, Stethoscope, ArrowRight, Timer,
  Syringe, Droplets, Heart, Brain, Shield, Scissors, Edit, Save,
  TrendingUp, BarChart3, ShieldCheck, AlertTriangle, Users, Calendar,
  ChevronDown, ChevronRight, Star, Award, Target, Zap, RefreshCw,
  Clipboard, MessageSquare, Bell, CheckSquare, Info
} from 'lucide-react';

// 护士数据 (4名护士)
const nurses = [
  { id: 'N001', name: '李美华', title: '主任护师', department: '手术室', phone: '13800001001', shifts: 12, rating: 4.9 },
  { id: 'N002', name: '王丽娜', title: '主管护师', department: '手术室', phone: '13800001002', shifts: 10, rating: 4.7 },
  { id: 'N003', name: '张晓燕', title: '护师', department: '普外科', phone: '13800001003', shifts: 8, rating: 4.6 },
  { id: 'N004', name: '陈婷婷', title: '护士', department: '手术室', phone: '13800001004', shifts: 6, rating: 4.5 },
];

// 护理记录数据 (18条)
const nursingRecords = [
  // 术前护理记录
  {
    id: 'NR001', patientId: 'P001', patientName: '张伟', gender: '男', age: 58,
    surgeryName: '超声介入手术', surgeryType: '超声介入', surgeryDate: '2026-04-28',
    recordType: 'pre', subType: 'check', nurseId: 'N001', nurseName: '李美华',
    time: '2026-04-28 08:30',
    content: '术前核查完成，患者身份、手术部位、过敏史确认无误，签署知情同意书',
    status: 'completed', vitalSigns: { bp: '128/82', hr: 72, temp: 36.5 },
  },
  {
    id: 'NR002', patientId: 'P001', patientName: '张伟', gender: '男', age: 58,
    surgeryName: '超声介入手术', surgeryType: '超声介入', surgeryDate: '2026-04-28',
    recordType: 'pre', subType: 'bowel', nurseId: 'N002', nurseName: '王丽娜',
    time: '2026-04-28 10:00',
    content: '肠道准备评价：清洁度良好，无残余粪便，肠鸣音正常',
    status: 'completed', bowelScore: 9,
  },
  {
    id: 'NR003', patientId: 'P001', patientName: '张伟', gender: '男', age: 58,
    surgeryName: '超声介入手术', surgeryType: '超声介入', surgeryDate: '2026-04-28',
    recordType: 'pre', subType: 'iv', nurseId: 'N003', nurseName: '张晓燕',
    time: '2026-04-28 10:30',
    content: '建立左上肢静脉通路，20G留置针，滴速通畅，无渗漏',
    status: 'completed', ivSite: '左上肢', ivGauge: '20G',
  },
  {
    id: 'NR004', patientId: 'P002', patientName: '李芳', gender: '女', age: 45,
    surgeryName: '甲状腺全切术', surgeryType: '开放', surgeryDate: '2026-04-28',
    recordType: 'pre', subType: 'check', nurseId: 'N001', nurseName: '李美华',
    time: '2026-04-28 07:45',
    content: '术前核查完成，血型B型，无过敏史，术前用药已执行',
    status: 'completed', vitalSigns: { bp: '118/75', hr: 68, temp: 36.3 },
  },
  {
    id: 'NR005', patientId: 'P002', patientName: '李芳', gender: '女', age: 45,
    surgeryName: '甲状腺全切术', surgeryType: '开放', surgeryDate: '2026-04-28',
    recordType: 'pre', subType: 'bowel', nurseId: 'N002', nurseName: '王丽娜',
    time: '2026-04-28 09:15',
    content: '肠道准备评价：患者为甲状腺手术，无需特殊肠道准备',
    status: 'completed', bowelScore: null,
  },
  {
    id: 'NR006', patientId: 'P002', patientName: '李芳', gender: '女', age: 45,
    surgeryName: '甲状腺全切术', surgeryType: '开放', surgeryDate: '2026-04-28',
    recordType: 'pre', subType: 'iv', nurseId: 'N004', nurseName: '陈婷婷',
    time: '2026-04-28 09:30',
    content: '建立右下肢静脉通路，22G留置针，滴速通畅',
    status: 'completed', ivSite: '右下肢', ivGauge: '22G',
  },
  // 术中配合记录
  {
    id: 'NR007', patientId: 'P001', patientName: '张伟', gender: '男', age: 58,
    surgeryName: '超声介入手术', surgeryType: '超声介入', surgeryDate: '2026-04-28',
    recordType: 'intra', subType: 'instrument', nurseId: 'N002', nurseName: '王丽娜',
    time: '2026-04-28 11:00',
    content: '术前器械清点：纱布20块，止血钳12把，弯钳8把，缝针5枚，超声介入器械套完整',
    status: 'completed', instrumentCount: { gauze: 20, clamp: 12, curved: 8, needle: 5 },
  },
  {
    id: 'NR008', patientId: 'P001', patientName: '张伟', gender: '男', age: 58,
    surgeryName: '超声介入手术', surgeryType: '超声介入', surgeryDate: '2026-04-28',
    recordType: 'intra', subType: 'timeline', nurseId: 'N001', nurseName: '李美华',
    time: '2026-04-28 11:30',
    content: '手术开始，超声引导定位顺利，腔内探查无转移',
    status: 'completed',
  },
  {
    id: 'NR009', patientId: 'P001', patientName: '张伟', gender: '男', age: 58,
    surgeryName: '超声介入手术', surgeryType: '超声介入', surgeryDate: '2026-04-28',
    recordType: 'intra', subType: 'timeline', nurseId: 'N001', nurseName: '李美华',
    time: '2026-04-28 13:00',
    content: '肿瘤切除完成，术中冰冻回报切缘阴性',
    status: 'completed',
  },
  {
    id: 'NR010', patientId: 'P001', patientName: '张伟', gender: '男', age: 58,
    surgeryName: '超声介入手术', surgeryType: '超声介入', surgeryDate: '2026-04-28',
    recordType: 'intra', subType: 'instrument', nurseId: 'N002', nurseName: '王丽娜',
    time: '2026-04-28 15:00',
    content: '关腹前器械清点：数量正确，无遗留，纱布20块，止血钳12把，弯钳8把，缝针5枚',
    status: 'completed', instrumentCount: { gauze: 20, clamp: 12, curved: 8, needle: 5 },
  },
  {
    id: 'NR011', patientId: 'P002', patientName: '李芳', gender: '女', age: 45,
    surgeryName: '甲状腺全切术', surgeryType: '开放', surgeryDate: '2026-04-28',
    recordType: 'intra', subType: 'instrument', nurseId: 'N004', nurseName: '陈婷婷',
    time: '2026-04-28 10:00',
    content: '术前器械清点：纱布10块，甲状腺拉钩2个，精细剪2把，神经监测仪已校准',
    status: 'completed', instrumentCount: { gauze: 10, hook: 2, scissors: 2 },
  },
  {
    id: 'NR012', patientId: 'P002', patientName: '李芳', gender: '女', age: 45,
    surgeryName: '甲状腺全切术', surgeryType: '开放', surgeryDate: '2026-04-28',
    recordType: 'intra', subType: 'timeline', nurseId: 'N003', nurseName: '张晓燕',
    time: '2026-04-28 10:30',
    content: '手术开始，分离颈前肌群，暴露甲状腺',
    status: 'completed',
  },
  // 术后交接记录
  {
    id: 'NR013', patientId: 'P001', patientName: '张伟', gender: '男', age: 58,
    surgeryName: '超声介入手术', surgeryType: '超声介入', surgeryDate: '2026-04-28',
    recordType: 'post', subType: 'score', nurseId: 'N001', nurseName: '李美华',
    time: '2026-04-28 16:00',
    content: '术后Steward评分：4分，意识清醒，可自主呼吸，肢体有反应',
    status: 'completed', stewardScore: 4,
  },
  {
    id: 'NR014', patientId: 'P001', patientName: '张伟', gender: '男', age: 58,
    surgeryName: '超声介入手术', surgeryType: '超声介入', surgeryDate: '2026-04-28',
    recordType: 'post', subType: 'sign', nurseId: 'N001', nurseName: '李美华',
    time: '2026-04-28 16:05',
    content: '交接签字：手术室护士李美华与病房护士张晓燕完成交接，生命体征平稳',
    status: 'completed', handoverFrom: '李美华', handoverTo: '张晓燕',
  },
  {
    id: 'NR015', patientId: 'P002', patientName: '李芳', gender: '女', age: 45,
    surgeryName: '甲状腺全切术', surgeryType: '开放', surgeryDate: '2026-04-28',
    recordType: 'post', subType: 'score', nurseId: 'N003', nurseName: '张晓燕',
    time: '2026-04-28 12:30',
    content: '术后Steward评分：5分，意识完全清醒，生命体征平稳',
    status: 'completed', stewardScore: 5,
  },
  {
    id: 'NR016', patientId: 'P002', patientName: '李芳', gender: '女', age: 45,
    surgeryName: '甲状腺全切术', surgeryType: '开放', surgeryDate: '2026-04-28',
    recordType: 'post', subType: 'sign', nurseId: 'N003', nurseName: '张晓燕',
    time: '2026-04-28 12:35',
    content: '交接签字：手术室护士王丽娜与病房护士陈婷婷完成交接',
    status: 'completed', handoverFrom: '王丽娜', handoverTo: '陈婷婷',
  },
  {
    id: 'NR017', patientId: 'P003', patientName: '王强', gender: '男', age: 62,
    surgeryName: '胃癌根治术', surgeryType: '开放', surgeryDate: '2026-04-27',
    recordType: 'pre', subType: 'check', nurseId: 'N002', nurseName: '王丽娜',
    time: '2026-04-27 07:30',
    content: '术前核查完成，合并高血压病史，血压控制可，术前用药已执行',
    status: 'completed', vitalSigns: { bp: '145/88', hr: 76, temp: 36.4 },
  },
  {
    id: 'NR018', patientId: 'P003', patientName: '王强', gender: '男', age: 62,
    surgeryName: '胃癌根治术', surgeryType: '开放', surgeryDate: '2026-04-27',
    recordType: 'pre', subType: 'iv', nurseId: 'N004', nurseName: '陈婷婷',
    time: '2026-04-27 08:00',
    content: '建立右上肢静脉通路，20G留置针，另备中心静脉导管',
    status: 'completed', ivSite: '右上肢', ivGauge: '20G',
  },
];

// ============ 交接班数据 ============
const shiftHandoverData = [
  {
    id: 'SH001',
    date: '2026-04-28',
    shift: '早班',
    fromNurse: '李美华',
    toNurse: '王丽娜',
    time: '08:00',
    patientCount: 3,
    criticalPatients: ['张伟-超声介入手术', '李芳-甲状腺全切术'],
    summary: '早班工作已完成，两位患者术前准备完善，无特殊交接事项',
    pendingTasks: ['等待张伟术后返回病房', '李芳术后监测甲状腺功能'],
    handoverItems: [
      { item: '术前核查', status: 'completed', note: '已完成' },
      { item: '静脉通路', status: 'completed', note: '通畅' },
      { item: '物资交接', status: 'completed', note: '器械已清点' },
    ],
    riskLevel: 'low',
  },
  {
    id: 'SH002',
    date: '2026-04-28',
    shift: '中班',
    fromNurse: '王丽娜',
    toNurse: '张晓燕',
    time: '16:00',
    patientCount: 2,
    criticalPatients: ['王强-胃癌根治术(术后第1天)'],
    summary: '中班完成手术配合2台，术后交接2名患者，1名患者术后第1天观察中',
    pendingTasks: ['王强术后引流液观察', '注意生命体征监测'],
    handoverItems: [
      { item: '术后评分', status: 'completed', note: 'Steward评分已记录' },
      { item: '交接签字', status: 'completed', note: '双方已签字' },
      { item: '物资清点', status: 'completed', note: '无遗留' },
    ],
    riskLevel: 'medium',
  },
];

// ============ 规范提示数据 ============
const complianceTips = [
  {
    id: 'CT001',
    category: '术前核查',
    title: '手术安全核查制度',
    content: '患者身份、手术部位、过敏史需三方核查，核查记录需签字确认',
    icon: <ShieldCheck size={16} />,
    color: '#1d4ed8',
    required: true,
  },
  {
    id: 'CT002',
    category: '器械清点',
    title: '器械清点规范',
    content: '清点时机：术前、关腹前、关腹后、缝合结束。清点内容：纱布、缝针、器械数量',
    icon: <Scissors size={16} />,
    color: '#d97706',
    required: true,
  },
  {
    id: 'CT003',
    category: '术后交接',
    title: '交接班制度',
    content: '交班内容：患者基本信息、手术名称、术中情况、术后注意事项、特殊交代',
    icon: <Users size={16} />,
    color: '#16a34a',
    required: true,
  },
  {
    id: 'CT004',
    category: '评分标准',
    title: 'Steward评分标准',
    content: '4-6分可转出恢复室：清醒程度(0-2)、呼吸(0-2)、活动(0-2)',
    icon: <Activity size={16} />,
    color: '#7c3aed',
    required: false,
  },
  {
    id: 'CT005',
    category: '风险预警',
    title: '高风险患者识别',
    content: '年龄>70岁、合并心血管疾病、复杂手术、术中出血>500ml需重点关注',
    icon: <AlertTriangle size={16} />,
    color: '#dc2626',
    required: false,
  },
];

const styles: Record<string, React.CSSProperties> = {
  root: { padding: 24, background: '#f0f4f8', minHeight: '100vh' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 20, fontWeight: 700, color: '#1a3a5c', display: 'flex', alignItems: 'center', gap: 8 },
  tabBar: { display: 'flex', gap: 4, background: '#fff', padding: 4, borderRadius: 8, marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', flexWrap: 'wrap' },
  tab: { padding: '10px 20px', borderRadius: 6, cursor: 'pointer', fontSize: 14, fontWeight: 500, color: '#64748b', border: 'none', background: 'none', transition: 'all 0.15s' },
  tabActive: { background: '#1a3a5c', color: '#fff' },
  statRow: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 24 },
  statCard: { background: '#fff', borderRadius: 10, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  statLabel: { fontSize: 12, color: '#64748b', marginBottom: 4 },
  statValue: { fontSize: 24, fontWeight: 700, color: '#1a3a5c' },
  statSub: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  searchRow: { display: 'flex', gap: 12, marginBottom: 16 },
  searchBox: { flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: '#fff', borderRadius: 8, padding: '8px 12px', border: '1px solid #e2e8f0' },
  searchInput: { border: 'none', outline: 'none', flex: 1, fontSize: 13 },
  tableWrap: { background: '#fff', borderRadius: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '12px 16px', fontSize: 12, color: '#64748b', fontWeight: 600, background: '#f8fafc', borderBottom: '1px solid #e2e8f0' },
  td: { padding: '12px 16px', fontSize: 13, color: '#334155', borderBottom: '1px solid #f1f5f9' },
  badge: { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600 },
  badgePre: { background: '#dbeafe', color: '#1d4ed8' },
  badgeIntra: { background: '#fef3c7', color: '#d97706' },
  badgePost: { background: '#dcfce7', color: '#16a34a' },
  badgeCompleted: { background: '#dcfce7', color: '#16a34a' },
  sectionCard: { background: '#fff', borderRadius: 10, padding: 16, marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  sectionTitle: { fontSize: 14, fontWeight: 700, color: '#1a3a5c', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 },
  recordCard: { background: '#f8fafc', borderRadius: 8, padding: 16, marginBottom: 12, borderLeft: '4px solid #1a3a5c' },
  recordHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  recordPatient: { fontWeight: 600, color: '#1a3a5c', fontSize: 14 },
  recordMeta: { fontSize: 12, color: '#64748b', marginTop: 2 },
  recordContent: { fontSize: 13, color: '#475569', lineHeight: 1.5 },
  recordFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 8, borderTop: '1px solid #e2e8f0' },
  timeline: { display: 'flex', flexDirection: 'column', gap: 0 },
  timelineItem: { display: 'flex', gap: 12, position: 'relative', paddingBottom: 16 },
  timelineDot: { width: 12, height: 12, borderRadius: '50%', background: '#1a3a5c', marginTop: 4, flexShrink: 0 },
  timelineDotActive: { background: '#16a34a' },
  timelineLine: { position: 'absolute', left: 5, top: 16, bottom: 0, width: 2, background: '#e2e8f0' },
  timelineContent: { flex: 1, background: '#f8fafc', borderRadius: 8, padding: 12 },
  timelineTime: { fontSize: 11, color: '#94a3b8', marginBottom: 4 },
  timelineText: { fontSize: 13, color: '#334155' },
  nurseCard: { display: 'flex', alignItems: 'center', gap: 8, padding: 8, background: '#f1f5f9', borderRadius: 6 },
  nurseAvatar: { width: 32, height: 32, borderRadius: '50%', background: '#1a3a5c', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600 },
  signBox: { border: '2px dashed #e2e8f0', borderRadius: 8, padding: 16, textAlign: 'center', marginTop: 12 },
  signTitle: { fontSize: 13, color: '#64748b', marginBottom: 8 },
  signNames: { display: 'flex', justifyContent: 'center', gap: 32 },
  signItem: { textAlign: 'center' },
  signLabel: { fontSize: 11, color: '#94a3b8' },
  signName: { fontSize: 14, fontWeight: 600, color: '#1a3a5c' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  grid3: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 },
  infoTag: { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', background: '#f1f5f9', borderRadius: 4, fontSize: 11, color: '#475569' },
  noData: { textAlign: 'center', padding: '40px 0', color: '#94a3b8', fontSize: 13 },
  // 新增样式
  workloadCard: { background: '#fff', borderRadius: 10, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  workloadHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  workloadTitle: { fontSize: 13, fontWeight: 600, color: '#1a3a5c', display: 'flex', alignItems: 'center', gap: 6 },
  workloadBar: { height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  workloadBarFill: { height: '100%', borderRadius: 4, transition: 'width 0.3s' },
  workloadStats: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginTop: 12 },
  workloadStat: { textAlign: 'center', padding: 8, background: '#f8fafc', borderRadius: 6 },
  handoverCard: { background: '#f8fafc', borderRadius: 10, padding: 16, marginBottom: 12, border: '1px solid #e2e8f0' },
  handoverHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  handoverShift: { display: 'flex', alignItems: 'center', gap: 8 },
  handoverArrow: { display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 },
  handoverItem: { display: 'flex', alignItems: 'center', gap: 8, padding: 8, background: '#fff', borderRadius: 6, marginBottom: 6 },
  handoverRisk: { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600 },
  handoverRiskLow: { background: '#dcfce7', color: '#16a34a' },
  handoverRiskMedium: { background: '#fef3c7', color: '#d97706' },
  handoverRiskHigh: { background: '#fee2e2', color: '#dc2626' },
  tipCard: { display: 'flex', gap: 12, padding: 12, background: '#f8fafc', borderRadius: 8, marginBottom: 8, borderLeft: '3px solid' },
  tipContent: { flex: 1 },
  tipTitle: { fontSize: 13, fontWeight: 600, color: '#1a3a5c', marginBottom: 4 },
  tipText: { fontSize: 12, color: '#64748b', lineHeight: 1.5 },
  ratingStars: { display: 'flex', gap: 2 },
  ratingStar: { color: '#fbbf24' },
  ratingEmpty: { color: '#e2e8f0' },
  collapseHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '8px 0' },
  collapseContent: { paddingTop: 8 },
  alertBanner: { display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: '#fef3c7', borderRadius: 8, marginBottom: 12, border: '1px solid #fcd34d' },
  alertIcon: { flexShrink: 0 },
  alertText: { flex: 1, fontSize: 13, color: '#92400e' },
  scoreCircle: { width: 60, height: 60, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700 },
  progressRing: { width: 80, height: 80, position: 'relative' as const },
  enhancedTimeline: { position: 'relative' as const, paddingLeft: 30 },
  enhancedTimelineLine: { position: 'absolute' as const, left: 10, top: 0, bottom: 0, width: 3, background: 'linear-gradient(to bottom, #1a3a5c, #16a34a)', borderRadius: 2 },
  enhancedTimelineItem: { position: 'relative' as const, marginBottom: 20, paddingLeft: 20 },
  enhancedTimelineDot: { position: 'absolute' as const, left: -24, top: 4, width: 16, height: 16, borderRadius: '50%', background: '#fff', border: '3px solid #1a3a5c', zIndex: 1 },
  enhancedTimelineDotCompleted: { borderColor: '#16a34a', background: '#dcfce7' },
  enhancedTimelineDotActive: { borderColor: '#d97706', background: '#fef3c7' },
  enhancedTimelineContent: { background: '#f8fafc', borderRadius: 8, padding: 12, border: '1px solid #e2e8f0' },
};

// Tab配置
const tabs = [
  { key: 'dashboard', label: '工作台', icon: <BarChart3 size={14} /> },
  { key: 'pre', label: '术前护理', icon: <ClipboardList size={14} /> },
  { key: 'intra', label: '术中配合', icon: <Stethoscope size={14} /> },
  { key: 'post', label: '术后交接', icon: <ArrowRight size={14} /> },
  { key: 'handover', label: '交接班', icon: <RefreshCw size={14} /> },
  { key: 'tips', label: '规范提示', icon: <Info size={14} /> },
];

// 获取子类型配置
const getSubTypeConfig = (subType: string) => {
  const config: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    check: { label: '术前核查', icon: <Search size={12} />, color: '#1d4ed8' },
    bowel: { label: '肠道准备', icon: <Droplets size={12} />, color: '#7c3aed' },
    iv: { label: '静脉通路', icon: <Syringe size={12} />, color: '#dc2626' },
    instrument: { label: '器械清点', icon: <Scissors size={12} />, color: '#d97706' },
    timeline: { label: '操作时间轴', icon: <Timer size={12} />, color: '#0891b2' },
    score: { label: '状态评分', icon: <Activity size={12} />, color: '#16a34a' },
    sign: { label: '交接签字', icon: <Edit size={12} />, color: '#be185d' },
  };
  return config[subType] || { label: subType, icon: null, color: '#64748b' };
};

// 评分显示组件
const ScoreCircle = ({ score, maxScore = 6 }: { score: number; maxScore?: number }) => {
  const percentage = (score / maxScore) * 100;
  const color = score >= 4 ? '#16a34a' : score >= 2 ? '#d97706' : '#dc2626';
  return (
    <div style={{ ...styles.scoreCircle, background: color + '20', color }}>
      <span>{score}<span style={{ fontSize: 12, fontWeight: 400 }}>/{maxScore}</span></span>
    </div>
  );
};

// 星级评分
const RatingStars = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  return (
    <div style={styles.ratingStars}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={i <= fullStars ? styles.ratingStar : styles.ratingEmpty}>
          ★
        </span>
      ))}
      <span style={{ fontSize: 11, color: '#64748b', marginLeft: 4 }}>{rating.toFixed(1)}</span>
    </div>
  );
};

// 可折叠面板
const CollapsiblePanel = ({ title, icon, children, defaultOpen = false }: { title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div style={styles.sectionCard}>
      <div style={styles.collapseHeader} onClick={() => setIsOpen(!isOpen)}>
        <div style={styles.sectionTitle}>
          {icon}
          {title}
        </div>
        {isOpen ? <ChevronDown size={16} color="#64748b" /> : <ChevronRight size={16} color="#64748b" />}
      </div>
      {isOpen && <div style={styles.collapseContent}>{children}</div>}
    </div>
  );
};

export default function NursingPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [search, setSearch] = useState('');

  // 统计数据
  const totalRecords = nursingRecords.length;
  const preRecords = nursingRecords.filter(r => r.recordType === 'pre');
  const intraRecords = nursingRecords.filter(r => r.recordType === 'intra');
  const postRecords = nursingRecords.filter(r => r.recordType === 'post');

  // 工作量统计
  const workloadStats = useMemo(() => {
    const stats = nurses.map(nurse => {
      const nurseRecords = nursingRecords.filter(r => r.nurseId === nurse.id);
      const preCount = nurseRecords.filter(r => r.recordType === 'pre').length;
      const intraCount = nurseRecords.filter(r => r.recordType === 'intra').length;
      const postCount = nurseRecords.filter(r => r.recordType === 'post').length;
      const totalCount = nurseRecords.length;
      const percentage = Math.round((totalCount / totalRecords) * 100);
      return { ...nurse, totalCount, preCount, intraCount, postCount, percentage };
    });
    return stats.sort((a, b) => b.totalCount - a.totalCount);
  }, []);

  // 护理评分统计
  const nursingRatings = useMemo(() => {
    return nurses.map(nurse => ({
      ...nurse,
      qualityScore: (nurse.rating * 20 + Math.random() * 5).toFixed(1),
      punctuality: (90 + Math.random() * 10).toFixed(1),
      completion: (95 + Math.random() * 5).toFixed(1),
    }));
  }, []);

  // 过滤数据
  const filteredRecords = nursingRecords.filter(item => {
    const matchTab = item.recordType === activeTab;
    const matchSearch = item.patientName.includes(search) || item.patientId.includes(search);
    return matchTab && matchSearch;
  });

  // 渲染统计卡片
  const renderStatCard = (label: string, value: number, sub?: string, color?: string, icon?: React.ReactNode) => (
    <div style={styles.statCard}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={styles.statLabel}>{label}</div>
        {icon && <div style={{ color: '#94a3b8' }}>{icon}</div>}
      </div>
      <div style={{ ...styles.statValue, color: color || '#1a3a5c' }}>{value}</div>
      {sub && <div style={styles.statSub}>{sub}</div>}
    </div>
  );

  // 渲染记录卡片
  const renderRecordCard = (record: typeof nursingRecords[0]) => {
    const subTypeConfig = getSubTypeConfig(record.subType);
    return (
      <div key={record.id} style={styles.recordCard}>
        <div style={styles.recordHeader}>
          <div>
            <div style={styles.recordPatient}>
              {record.patientName}
              <span style={{ fontWeight: 400, color: '#64748b', marginLeft: 8 }}>{record.gender} · {record.age}岁</span>
            </div>
            <div style={styles.recordMeta}>
              {record.surgeryName} · {record.surgeryType}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ ...styles.badge, background: subTypeConfig.color + '20', color: subTypeConfig.color }}>
              {subTypeConfig.icon}
              {subTypeConfig.label}
            </span>
            <span style={styles.badge}><CheckCircle size={10} /> 已完成</span>
          </div>
        </div>
        <div style={styles.recordContent}>{record.content}</div>

        {/* 术前特有信息 */}
        {record.recordType === 'pre' && record.vitalSigns && (
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <span style={styles.infoTag}>血压 {record.vitalSigns.bp}</span>
            <span style={styles.infoTag}>心率 {record.vitalSigns.hr}次/分</span>
            <span style={styles.infoTag}>体温 {record.vitalSigns.temp}°C</span>
          </div>
        )}
        {record.recordType === 'pre' && record.bowelScore && (
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <span style={styles.infoTag}>肠道清洁度评分 {record.bowelScore}/10</span>
          </div>
        )}
        {record.recordType === 'pre' && record.ivSite && (
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <span style={styles.infoTag}>静脉通路 {record.ivSite}</span>
            <span style={styles.infoTag}>留置针 {record.ivGauge}</span>
          </div>
        )}

        {/* 术中器械清点 */}
        {record.recordType === 'intra' && record.instrumentCount && (
          <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
            {Object.entries(record.instrumentCount).map(([key, val]) => (
              <span key={key} style={styles.infoTag}>
                {key === 'gauze' ? '纱布' : key === 'clamp' ? '止血钳' : key === 'curved' ? '弯钳' : key === 'needle' ? '缝针' : key === 'hook' ? '拉钩' : key === 'scissors' ? '剪' : key}: {val}
              </span>
            ))}
          </div>
        )}

        {/* 术后状态评分 */}
        {record.recordType === 'post' && record.stewardScore && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
            <ScoreCircle score={record.stewardScore} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#1a3a5c' }}>Steward评分</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>{record.stewardScore >= 4 ? '可转出恢复室' : '需继续观察'}</div>
            </div>
          </div>
        )}

        {/* 术后交接签字 */}
        {record.recordType === 'post' && record.handoverFrom && (
          <div style={styles.signBox}>
            <div style={styles.signTitle}>交接签字</div>
            <div style={styles.signNames}>
              <div style={styles.signItem}>
                <div style={styles.signLabel}>交出人</div>
                <div style={styles.signName}>{record.handoverFrom}</div>
              </div>
              <ArrowRight size={20} color="#94a3b8" />
              <div style={styles.signItem}>
                <div style={styles.signLabel}>接受人</div>
                <div style={styles.signName}>{record.handoverTo}</div>
              </div>
            </div>
          </div>
        )}

        <div style={styles.recordFooter}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={styles.nurseCard}>
              <div style={styles.nurseAvatar}>{record.nurseName[0]}</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#1a3a5c' }}>{record.nurseName}</div>
                <div style={{ fontSize: 10, color: '#94a3b8' }}>{nurses.find(n => n.id === record.nurseId)?.title}</div>
              </div>
            </div>
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={12} />
            {record.time}
          </div>
        </div>
      </div>
    );
  };

  // 增强时间轴视图
  const renderEnhancedTimeline = () => {
    const timelineRecords = [...intraRecords].sort((a, b) => a.time.localeCompare(b.time));
    const phases = [
      { name: '术前准备', time: '10:00-11:00', records: timelineRecords.filter(r => r.time < '11:00') },
      { name: '手术开始', time: '11:00-13:00', records: timelineRecords.filter(r => r.time >= '11:00' && r.time < '13:00') },
      { name: '手术进行', time: '13:00-15:00', records: timelineRecords.filter(r => r.time >= '13:00' && r.time < '15:00') },
      { name: '关腹结束', time: '15:00后', records: timelineRecords.filter(r => r.time >= '15:00') },
    ];

    return (
      <div>
        {/* 时间轴概览 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
          {phases.map((phase, idx) => (
            <div key={idx} style={{ background: '#f8fafc', borderRadius: 8, padding: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#1a3a5c', marginBottom: 4 }}>{phase.name}</div>
              <div style={{ fontSize: 10, color: '#94a3b8' }}>{phase.time}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#16a34a', marginTop: 4 }}>{phase.records.length}</div>
              <div style={{ fontSize: 10, color: '#94a3b8' }}>条记录</div>
            </div>
          ))}
        </div>

        {/* 详细时间轴 */}
        <div style={styles.enhancedTimeline}>
          <div style={styles.enhancedTimelineLine} />
          {timelineRecords.map((record, idx) => {
            const isLast = idx === timelineRecords.length - 1;
            const isCompleted = record.subType === 'instrument';
            const isActive = record.subType === 'timeline';
            return (
              <div key={record.id} style={{ ...styles.enhancedTimelineItem, paddingBottom: isLast ? 0 : 16 }}>
                <div style={{
                  ...styles.enhancedTimelineDot,
                  ...(isCompleted ? styles.enhancedTimelineDotCompleted : {}),
                  ...(isActive ? styles.enhancedTimelineDotActive : {}),
                }} />
                <div style={styles.enhancedTimelineContent}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1a3a5c' }}>{record.patientName}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{record.surgeryName}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{
                        ...styles.badge,
                        background: getSubTypeConfig(record.subType).color + '20',
                        color: getSubTypeConfig(record.subType).color,
                      }}>
                        {getSubTypeConfig(record.subType).icon}
                        {getSubTypeConfig(record.subType).label}
                      </span>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.5 }}>{record.content}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={styles.nurseCard}>
                        <div style={styles.nurseAvatar}>{record.nurseName[0]}</div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: '#1a3a5c' }}>{record.nurseName}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#94a3b8' }}>
                      <Clock size={12} />
                      {record.time}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // 术中时间轴视图（旧版保留）
  const renderIntraTimeline = () => {
    const timelineRecords = intraRecords.sort((a, b) => a.time.localeCompare(b.time));
    return (
      <div style={styles.timeline}>
        {timelineRecords.map((record, idx) => (
          <div key={record.id} style={styles.timelineItem}>
            {idx < timelineRecords.length - 1 && <div style={styles.timelineLine} />}
            <div style={{ ...styles.timelineDot, ...(record.subType === 'instrument' ? styles.timelineDotActive : { background: '#94a3b8' }) } } />
            <div style={styles.timelineContent}>
              <div style={styles.timelineTime}>{record.time}</div>
              <div style={styles.timelineText}>{record.content}</div>
              <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ ...styles.badge, background: '#fef3c7', color: '#d97706' }}>
                  {getSubTypeConfig(record.subType).icon}
                  {getSubTypeConfig(record.subType).label}
                </span>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>{record.nurseName}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={styles.root}>
      {/* 标题 */}
      <div style={styles.header}>
        <div style={styles.title}>
          <Activity size={22} color="#4ade80" />
          护理记录管理系统
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ ...styles.nurseCard, padding: '8px 16px' }}>
            <Calendar size={14} color="#64748b" />
            <span style={{ fontSize: 13, color: '#1a3a5c' }}>2026-04-28</span>
          </div>
        </div>
      </div>

      {/* 标签页 */}
      <div style={styles.tabBar}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            style={{ ...styles.tab, ...(activeTab === tab.key ? styles.tabActive : {}) }}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.icon}
            <span style={{ marginLeft: 6 }}>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ========== 工作台视图 ========== */}
      {activeTab === 'dashboard' && (
        <div>
          {/* 统计卡片 */}
          <div style={styles.statRow}>
            {renderStatCard('总记录数', totalRecords, '手术室护理', '#1a3a5c', <FileText size={18} />)}
            {renderStatCard('术前护理', preRecords.length, '术前核查/肠道/静脉', '#1d4ed8', <ClipboardList size={18} />)}
            {renderStatCard('术中配合', intraRecords.length, '器械清点/时间轴', '#d97706', <Stethoscope size={18} />)}
            {renderStatCard('术后交接', postRecords.length, '评分/签字', '#16a34a', <ArrowRight size={18} />)}
            {renderStatCard('交接班次', shiftHandoverData.length, '早班/中班/夜班', '#7c3aed', <RefreshCw size={18} />)}
          </div>

          {/* 预警提示 */}
          <div style={styles.alertBanner}>
            <AlertTriangle size={20} color="#d97706" style={styles.alertIcon} />
            <div style={styles.alertText}>
              <strong>今日待办：</strong>王强(胃癌术后第1天)需重点关注引流液情况，李芳术后24小时甲状腺功能监测
            </div>
          </div>

          {/* 工作量统计 */}
          <div style={styles.sectionCard}>
            <div style={styles.sectionTitle}>
              <BarChart3 size={14} color="#1a3a5c" />
              护士工作量统计
            </div>
            <div style={styles.grid2}>
              <div>
                {workloadStats.map((nurse, idx) => (
                  <div key={nurse.id} style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={styles.nurseAvatar}>{nurse.name[0]}</div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#1a3a5c' }}>{nurse.name}</div>
                          <div style={{ fontSize: 10, color: '#94a3b8' }}>{nurse.title}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#1a3a5c' }}>{nurse.totalCount}</div>
                        <div style={{ fontSize: 10, color: '#94a3b8' }}>条记录</div>
                      </div>
                    </div>
                    <div style={styles.workloadBar}>
                      <div style={{ ...styles.workloadBarFill, width: nurse.percentage + '%', background: idx === 0 ? '#1a3a5c' : idx === 1 ? '#16a34a' : '#94a3b8' }} />
                    </div>
                    <div style={{ display: 'flex', gap: 12, fontSize: 10, color: '#64748b' }}>
                      <span>术前 {nurse.preCount}</span>
                      <span>术中 {nurse.intraCount}</span>
                      <span>术后 {nurse.postCount}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <div style={styles.sectionTitle}>
                  <Award size={14} color="#d97706" />
                  护理质量评分
                </div>
                {nursingRatings.map(nurse => (
                  <div key={nurse.id} style={{ ...styles.handoverItem, marginBottom: 8 }}>
                    <div style={styles.nurseAvatar}>{nurse.name[0]}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#1a3a5c' }}>{nurse.name}</div>
                        <RatingStars rating={nurse.rating} />
                      </div>
                      <div style={{ display: 'flex', gap: 16, marginTop: 4, fontSize: 11, color: '#64748b' }}>
                        <span>准时率: {nurse.punctuality}%</span>
                        <span>完成率: {nurse.completion}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 护理团队 */}
          <div style={styles.sectionCard}>
            <div style={styles.sectionTitle}>
              <Users size={14} color="#1a3a5c" />
              护理团队
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {nurses.map(nurse => (
                <div key={nurse.id} style={styles.nurseCard}>
                  <div style={styles.nurseAvatar}>{nurse.name[0]}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1a3a5c' }}>{nurse.name}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{nurse.title} · {nurse.department}</div>
                    <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>值班 {nurse.shifts} 次</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 规范提示快捷入口 */}
          <CollapsiblePanel title="规范提示" icon={<Info size={14} color="#d97706" />} defaultOpen={true}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {complianceTips.slice(0, 4).map(tip => (
                <div key={tip.id} style={{ ...styles.tipCard, borderLeftColor: tip.color }}>
                  <div style={{ color: tip.color }}>{tip.icon}</div>
                  <div style={styles.tipContent}>
                    <div style={styles.tipTitle}>{tip.title}</div>
                    <div style={styles.tipText}>{tip.content}</div>
                  </div>
                  {tip.required && (
                    <div style={{ background: '#dc2626', color: '#fff', padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 600 }}>
                      必读
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CollapsiblePanel>
        </div>
      )}

      {/* 搜索框（其他Tab显示） */}
      {activeTab !== 'dashboard' && (
        <div style={styles.searchRow}>
          <div style={styles.searchBox}>
            <Search size={16} color="#94a3b8" />
            <input
              style={styles.searchInput}
              placeholder="搜索患者姓名/ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* ========== 术前护理 ========== */}
      {activeTab === 'pre' && (
        <div>
          <div style={styles.grid2}>
            {/* 术前核查 */}
            <div>
              <div style={styles.sectionTitle}>
                <Search size={14} color="#1d4ed8" />
                术前核查
                <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 400 }}>
                  ({preRecords.filter(r => r.subType === 'check').length}条)
                </span>
              </div>
              {preRecords.filter(r => r.subType === 'check').map(renderRecordCard)}
            </div>

            {/* 肠道准备 & 静脉通路 */}
            <div>
              <div style={styles.sectionTitle}>
                <Droplets size={14} color="#7c3aed" />
                肠道准备评价
                <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 400 }}>
                  ({preRecords.filter(r => r.subType === 'bowel').length}条)
                </span>
              </div>
              {preRecords.filter(r => r.subType === 'bowel').map(renderRecordCard)}

              <div style={{ ...styles.sectionTitle, marginTop: 16 }}>
                <Syringe size={14} color="#dc2626" />
                静脉通路
                <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 400 }}>
                  ({preRecords.filter(r => r.subType === 'iv').length}条)
                </span>
              </div>
              {preRecords.filter(r => r.subType === 'iv').map(renderRecordCard)}
            </div>
          </div>
        </div>
      )}

      {/* ========== 术中配合 ========== */}
      {activeTab === 'intra' && (
        <div>
          <div style={styles.grid2}>
            <div>
              <div style={styles.sectionTitle}>
                <Scissors size={14} color="#d97706" />
                器械清点记录
                <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 400 }}>
                  ({intraRecords.filter(r => r.subType === 'instrument').length}条)
                </span>
              </div>
              {intraRecords.filter(r => r.subType === 'instrument').map(renderRecordCard)}
            </div>
            <div>
              <div style={styles.sectionTitle}>
                <Timer size={14} color="#0891b2" />
                操作时间轴
              </div>
              {renderEnhancedTimeline()}
            </div>
          </div>
        </div>
      )}

      {/* ========== 术后交接 ========== */}
      {activeTab === 'post' && (
        <div>
          <div style={styles.grid2}>
            <div>
              <div style={styles.sectionTitle}>
                <Activity size={14} color="#16a34a" />
                术后状态评分
                <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 400 }}>
                  ({postRecords.filter(r => r.subType === 'score').length}条)
                </span>
              </div>
              {postRecords.filter(r => r.subType === 'score').map(renderRecordCard)}
            </div>
            <div>
              <div style={styles.sectionTitle}>
                <Edit size={14} color="#be185d" />
                交接签字
                <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 400 }}>
                  ({postRecords.filter(r => r.subType === 'sign').length}条)
                </span>
              </div>
              {postRecords.filter(r => r.subType === 'sign').map(renderRecordCard)}
            </div>
          </div>

          {/* 护理评分汇总 */}
          <div style={styles.sectionCard}>
            <div style={styles.sectionTitle}>
              <Star size={14} color="#d97706" />
              护理评分汇总
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {postRecords.filter(r => r.stewardScore).map(record => (
                <div key={record.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, background: '#f8fafc', borderRadius: 8 }}>
                  <ScoreCircle score={record.stewardScore || 0} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1a3a5c' }}>{record.patientName}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{record.surgeryName}</div>
                    <div style={{ fontSize: 11, color: record.stewardScore >= 4 ? '#16a34a' : '#d97706', marginTop: 4 }}>
                      {record.stewardScore >= 4 ? '✓ 可转恢复室' : '○ 继续观察'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========== 护理交接班 ========== */}
      {activeTab === 'handover' && (
        <div>
          <div style={styles.sectionCard}>
            <div style={styles.sectionTitle}>
              <RefreshCw size={14} color="#1a3a5c" />
              交接班记录
              <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 400, marginLeft: 8 }}>
                ({shiftHandoverData.length}次)
              </span>
            </div>

            {shiftHandoverData.map(handover => (
              <div key={handover.id} style={styles.handoverCard}>
                <div style={styles.handoverHeader}>
                  <div style={styles.handoverShift}>
                    <Calendar size={14} color="#64748b" />
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#1a3a5c' }}>{handover.date}</span>
                    <span style={{ ...styles.badge, background: '#e0e7ff', color: '#4338ca' }}>{handover.shift}</span>
                  </div>
                  <span style={{
                    ...styles.handoverRisk,
                    ...(handover.riskLevel === 'low' ? styles.handoverRiskLow : handover.riskLevel === 'medium' ? styles.handoverRiskMedium : styles.handoverRiskHigh)
                  }}>
                    <Shield size={10} />
                    {handover.riskLevel === 'low' ? '低风险' : handover.riskLevel === 'medium' ? '中风险' : '高风险'}
                  </span>
                </div>

                <div style={styles.handoverArrow}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                    <div style={styles.nurseAvatar}>{handover.fromNurse[0]}</div>
                    <div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>交出人</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1a3a5c' }}>{handover.fromNurse}</div>
                    </div>
                  </div>
                  <ArrowRight size={20} color="#94a3b8" />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'flex-end' }}>
                    <div>
                      <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'right' }}>接受人</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1a3a5c', textAlign: 'right' }}>{handover.toNurse}</div>
                    </div>
                    <div style={styles.nurseAvatar}>{handover.toNurse[0]}</div>
                  </div>
                </div>

                <div style={{ marginTop: 12, padding: 12, background: '#fff', borderRadius: 6 }}>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>
                    <Clock size={10} style={{ marginRight: 4 }} />
                    交接时间: {handover.time} · 服务患者: {handover.patientCount}人
                  </div>
                  <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.5 }}>{handover.summary}</div>
                </div>

                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#1a3a5c', marginBottom: 8 }}>交接项目</div>
                  {handover.handoverItems.map((item, idx) => (
                    <div key={idx} style={{ ...styles.handoverItem }}>
                      <CheckSquare size={14} color={item.status === 'completed' ? '#16a34a' : '#94a3b8'} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#1a3a5c' }}>{item.item}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>{item.note}</div>
                      </div>
                      <span style={{ ...styles.badge, background: item.status === 'completed' ? '#dcfce7' : '#fef3c7', color: item.status === 'completed' ? '#16a34a' : '#d97706' }}>
                        {item.status === 'completed' ? '已完成' : '进行中'}
                      </span>
                    </div>
                  ))}
                </div>

                {handover.pendingTasks.length > 0 && (
                  <div style={{ marginTop: 12, padding: 12, background: '#fef3c7', borderRadius: 6, border: '1px solid #fcd34d' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <AlertTriangle size={14} color="#d97706" />
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#92400e' }}>待办事项</span>
                    </div>
                    {handover.pendingTasks.map((task, idx) => (
                      <div key={idx} style={{ fontSize: 12, color: '#92400e', lineHeight: 1.8 }}>
                        • {task}
                      </div>
                    ))}
                  </div>
                )}

                {handover.criticalPatients.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#1a3a5c', marginBottom: 8 }}>
                      <User size={10} style={{ marginRight: 4 }} />
                      重点患者 ({handover.criticalPatients.length})
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {handover.criticalPatients.map((patient, idx) => (
                        <span key={idx} style={{ ...styles.infoTag, background: '#fee2e2', color: '#dc2626' }}>
                          <AlertCircle size={10} />
                          {patient}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========== 规范提示 ========== */}
      {activeTab === 'tips' && (
        <div>
          <div style={styles.sectionCard}>
            <div style={styles.sectionTitle}>
              <ShieldCheck size={14} color="#1a3a5c" />
              护理规范提示库
              <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 400, marginLeft: 8 }}>
                ({complianceTips.length}条)
              </span>
            </div>

            <div style={styles.grid2}>
              {complianceTips.map(tip => (
                <div key={tip.id} style={{ ...styles.tipCard, borderLeftColor: tip.color }}>
                  <div style={{ color: tip.color, fontSize: 20 }}>{tip.icon}</div>
                  <div style={styles.tipContent}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ ...styles.badge, background: tip.color + '20', color: tip.color }}>
                        {tip.category}
                      </span>
                      {tip.required && (
                        <span style={{ background: '#dc2626', color: '#fff', padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 600 }}>
                          必修
                        </span>
                      )}
                    </div>
                    <div style={styles.tipTitle}>{tip.title}</div>
                    <div style={styles.tipText}>{tip.content}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 快速操作提示 */}
          <div style={styles.sectionCard}>
            <div style={styles.sectionTitle}>
              <Target size={14} color="#16a34a" />
              今日质量目标
            </div>
            <div style={styles.grid3}>
              <div style={{ padding: 16, background: '#f0fdf4', borderRadius: 8, textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#16a34a' }}>100%</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>术前核查完成率</div>
              </div>
              <div style={{ padding: 16, background: '#fef3c7', borderRadius: 8, textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#d97706' }}>100%</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>器械清点合规率</div>
              </div>
              <div style={{ padding: 16, background: '#dbeafe', borderRadius: 8, textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#1d4ed8' }}>100%</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>交接签字合规率</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
