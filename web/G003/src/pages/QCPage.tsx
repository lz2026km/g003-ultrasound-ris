// @ts-nocheck
// G003 超声RIS - 质量管理页面 v0.2.0
// 质控指标配置 / 质控数据录入 / 质控统计图表 / 质控事件上报 / 质控报告生成 / 持续改进建议 / 质控标准库 / 质控人员管理
import { useState } from 'react'
import {
  CheckCircle, AlertTriangle, Search, Filter, Download, TrendingUp,
  Settings, Plus, ChevronDown, ChevronUp, X, Edit2, Save,
  Shield, User, FileText, Activity, BarChart2, Clock,
  AlertCircle, Wrench, Image, MessageSquare, Calendar,
  PieChart as PieChartIcon, ArrowUp, ArrowDown, Eye, RefreshCw
} from 'lucide-react'
import ReactECharts from 'echarts-for-react'

// ============ 样式 ============
const s: Record<string, React.CSSProperties> = {
  root: { padding: 0 },
  header: { marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 700, color: '#1a3a5c', margin: 0 },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 4 },
  headerActions: { display: 'flex', gap: 8, flexWrap: 'wrap' as const },
  // 概览卡片行
  overviewRow: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 20 },
  overviewCard: { background: '#fff', borderRadius: 12, padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 14 },
  overviewIcon: { width: 44, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  overviewValue: { fontSize: 26, fontWeight: 700, color: '#1a3a5c', lineHeight: 1.2 },
  overviewLabel: { fontSize: 12, color: '#64748b', marginTop: 2 },
  overviewTrend: { fontSize: 11, marginTop: 4, display: 'flex', alignItems: 'center', gap: 2 },
  // 标签页
  tabs: { display: 'flex', gap: 4, marginBottom: 20, background: '#f8fafc', padding: 4, borderRadius: 10 },
  tab: { padding: '8px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#64748b', background: 'transparent', border: 'none', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6 },
  tabActive: { padding: '8px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#fff', background: '#3b82f6', border: 'none', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6 },
  // 内容区
  content: { background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', padding: 20, marginBottom: 20 },
  contentTitle: { fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 },
  // 图表网格
  chartGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 },
  chartGrid3: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 },
  // 指标配置
  indicatorRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 16 },
  indicatorCard: { background: '#f8fafc', borderRadius: 10, padding: 16, border: '1px solid #e2e8f0' },
  indicatorName: { fontSize: 13, fontWeight: 600, color: '#1a3a5c', marginBottom: 8 },
  indicatorBar: { height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  indicatorFill: { height: '100%', borderRadius: 4, transition: 'width 0.3s' },
  indicatorMeta: { display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b' },
  // 表格
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', borderBottom: '2px solid #f1f5f9', whiteSpace: 'nowrap' as const },
  td: { padding: '14px 16px', fontSize: 13, color: '#475569', borderBottom: '1px solid #f1f5f9' },
  // 表单
  formRow: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 16 },
  formGroup: { display: 'flex', flexDirection: 'column' as const, gap: 6 },
  label: { fontSize: 12, fontWeight: 600, color: '#475569' },
  input: { padding: '8px 12px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 13, color: '#1a3a5c', background: '#fff', outline: 'none', minHeight: 38 },
  select: { padding: '8px 12px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 13, color: '#1a3a5c', background: '#fff', outline: 'none', minHeight: 38 },
  textarea: { padding: '8px 12px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 13, color: '#1a3a5c', background: '#fff', outline: 'none', minHeight: 80, resize: 'vertical' as const },
  // 按钮
  btn: { padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'all 0.2s' },
  btnPrimary: { background: '#3b82f6', color: '#fff' },
  btnSuccess: { background: '#22c55e', color: '#fff' },
  btnWarning: { background: '#f97316', color: '#fff' },
  btnDanger: { background: '#ef4444', color: '#fff' },
  btnOutline: { background: '#fff', color: '#475569', border: '1px solid #e2e8f0' },
  btnSm: { padding: '5px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 4 },
  // Badge
  badge: { display: 'inline-flex', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500 },
  // 搜索过滤行
  filterRow: { display: 'flex', gap: 12, alignItems: 'center', background: '#f8fafc', padding: '12px 16px', borderRadius: 10, marginBottom: 16, flexWrap: 'wrap' as const },
  searchInput: { flex: 1, minWidth: 180, padding: '8px 12px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 13, color: '#1a3a5c', background: '#fff', outline: 'none', minHeight: 38 },
  // 事件列表
  eventItem: { display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 0', borderBottom: '1px solid #f1f5f9' },
  eventIcon: { width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  eventContent: { flex: 1 },
  eventTitle: { fontSize: 13, fontWeight: 600, color: '#1a3a5c' },
  eventMeta: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  eventDesc: { fontSize: 12, color: '#64748b', marginTop: 4 },
  // 标准库
  standardItem: { padding: '14px 0', borderBottom: '1px solid #f1f5f9' },
  standardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  standardTitle: { fontSize: 13, fontWeight: 600, color: '#1a3a5c' },
  standardCode: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  standardTags: { display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' as const },
  // 人员卡片
  personCard: { background: '#f8fafc', borderRadius: 10, padding: 16, border: '1px solid #e2e8f0' },
  personAvatar: { width: 40, height: 40, borderRadius: '50%', background: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600 },
  personName: { fontSize: 13, fontWeight: 600, color: '#1a3a5c', marginTop: 8 },
  personRole: { fontSize: 11, color: '#64748b', marginTop: 2 },
  // 模态框
  modal: { position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalContent: { background: '#fff', borderRadius: 16, padding: 24, width: 560, maxHeight: '80vh', overflowY: 'auto' as const, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 16, fontWeight: 700, color: '#1a3a5c' },
  // 统计卡片
  statRow: { display: 'flex', gap: 16, marginBottom: 20 },
  statCard: { background: '#fff', borderRadius: 10, padding: 16, flex: 1, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', minWidth: 160 },
  // 报告选择
  reportTypeRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 },
  reportTypeCard: { padding: '20px 16px', borderRadius: 12, border: '2px solid #e2e8f0', cursor: 'pointer', textAlign: 'center' as const, transition: 'all 0.2s' },
  reportTypeCardActive: { padding: '20px 16px', borderRadius: 12, border: '2px solid #3b82f6', cursor: 'pointer', textAlign: 'center' as const, background: '#eff6ff', transition: 'all 0.2s' },
  // 建议卡片
  suggestCard: { padding: 16, borderRadius: 10, border: '1px solid #e2e8f0', marginBottom: 12 },
  suggestHeader: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 },
  suggestTitle: { fontSize: 13, fontWeight: 600, color: '#1a3a5c' },
  suggestScore: { fontSize: 12, color: '#64748b' },
  suggestDesc: { fontSize: 12, color: '#64748b', lineHeight: 1.6 },
  // 建议项标签
  tag: { display: 'inline-flex', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 500 },
}

// ============ Mock 数据 ============
const INDICATORS = [
  { id: 'I001', name: '图像优良率', category: '图像质量', standard: '95%', current: 94.2, target: 95, unit: '%', status: '预警', color: '#f97316' },
  { id: 'I002', name: '报告合格率', category: '报告质量', standard: '98%', current: 97.8, target: 98, unit: '%', status: '预警', color: '#f97316' },
  { id: 'I003', name: '平均出报时间', category: '时效性', standard: '<2h', current: 1.8, target: 2, unit: 'h', status: '达标', color: '#22c55e' },
  { id: 'I004', name: '患者满意度', category: '满意度', standard: '90%', current: 92.5, target: 90, unit: '%', status: '达标', color: '#22c55e' },
  { id: 'I005', name: '设备完好率', category: '设备管理', standard: '98%', current: 96.1, target: 98, unit: '%', status: '预警', color: '#f97316' },
  { id: 'I006', name: '重检率', category: '图像质量', standard: '<3%', current: 2.8, target: 3, unit: '%', status: '达标', color: '#22c55e' },
  { id: 'I007', name: '报告及时率', category: '时效性', standard: '95%', current: 93.2, target: 95, unit: '%', status: '预警', color: '#f97316' },
  { id: 'I008', name: '投诉处理率', category: '满意度', standard: '100%', current: 100, target: 100, unit: '%', status: '达标', color: '#22c55e' },
]

const QC_EVENTS = [
  { id: 'EVT001', type: '设备故障', level: '严重', device: '彩超仪 A (US-001)', reporter: '张技术员', reportTime: '2026-04-28 14:30', status: '处理中', desc: '设备无法开机，疑似电源模块故障' },
  { id: 'EVT002', type: '图像伪影', level: '一般', device: '彩超仪 B (US-002)', reporter: '李医生', reportTime: '2026-04-28 10:15', status: '已解决', desc: '腹部探头图像出现条状伪影，已校准' },
  { id: 'EVT003', type: '报告错误', level: '严重', device: '-', reporter: '王主任', reportTime: '2026-04-27 16:40', status: '已解决', desc: '报告描述与图像不符，已修订并通知患者' },
  { id: 'EVT004', type: '图像伪影', level: '轻微', device: '彩超仪 C (US-003)', reporter: '赵医生', reportTime: '2026-04-27 09:20', status: '已解决', desc: '甲状腺探头偶发伪影，清洁接头后正常' },
  { id: 'EVT005', type: '设备故障', level: '一般', device: '彩超仪 D (US-004)', reporter: '孙技术员', reportTime: '2026-04-26 11:00', status: '已解决', desc: '显示器亮度异常，调试后恢复正常' },
]

const QUALITY_ITEMS = [
  { id: 'QC001', patientName: '张三', examType: '腹部超声', examPart: '肝脏', checkDate: '2026-04-28', inspector: '李医生', device: 'US-001', score: 95, status: '合格' },
  { id: 'QC002', patientName: '李四', examType: '心脏超声', examPart: '心脏', checkDate: '2026-04-28', inspector: '王医生', device: 'US-002', score: 88, status: '合格' },
  { id: 'QC003', patientName: '王五', examType: '甲状腺超声', examPart: '甲状腺', checkDate: '2026-04-27', inspector: '张医生', device: 'US-001', score: 72, status: '待改进' },
  { id: 'QC004', patientName: '赵六', examType: '乳腺超声', examPart: '乳腺', checkDate: '2026-04-27', inspector: '李医生', device: 'US-003', score: 91, status: '合格' },
  { id: 'QC005', patientName: '钱七', examType: '血管超声', examPart: '颈部血管', checkDate: '2026-04-26', inspector: '王医生', device: 'US-002', score: 85, status: '合格' },
  { id: 'QC006', patientName: '孙八', examType: '腹部超声', examPart: '胆囊', checkDate: '2026-04-25', inspector: '张医生', device: 'US-001', score: 68, status: '不合格' },
]

const STANDARDS = [
  { id: 'STD001', name: '超声诊断质量控制规范', code: 'WS/T 279-2008', category: '国家标准', level: '国家', department: '卫生部', effectiveDate: '2008-05-01', desc: '规定了超声诊断质量控制的基本要求、管理制度和评估方法', keywords: ['质量控制', '超声诊断', '管理规范'] },
  { id: 'STD002', name: '医学影像科管理规范', code: '卫医政发[2010]12号', category: '行业标准', level: '行业', department: '卫生部', effectiveDate: '2010-02-12', desc: '医学影像科（包括超声）的质量管理、人员配置、设备管理规范', keywords: ['影像科', '管理', '人员配置'] },
  { id: 'STD003', name: '超声报告书写规范', code: 'CNUCA-2022-003', category: '科室标准', level: '科室', department: '超声科', effectiveDate: '2022-01-01', desc: '本科室超声报告书写规范，包括报告格式、描述术语、诊断标准', keywords: ['报告规范', '描述术语', '诊断标准'] },
  { id: 'STD004', name: '超声仪器维护保养规程', code: '科室-QC-2022-001', category: '科室标准', level: '科室', department: '设备科', effectiveDate: '2022-03-15', desc: '各类超声仪器的日常维护、定期保养和故障处理规程', keywords: ['设备维护', '保养', '故障处理'] },
]

const QC_PERSONNEL = [
  { id: 'P001', name: '王主任', role: '质控主任', department: '超声科', phone: '138****0001', status: '在岗', responsibilities: ['全面负责科室质量控制工作', '定期组织质量分析会议', '审核质控报告和统计数据'] },
  { id: 'P002', name: '李护士长', role: '质控护士长', department: '超声科', phone: '138****0002', status: '在岗', responsibilities: ['图像质量日常抽检', '设备使用登记与监督', '报告时效性跟踪'] },
  { id: 'P003', name: '张技术员', role: '设备质控员', department: '设备科', phone: '138****0003', status: '在岗', responsibilities: ['设备定期维护保养', '设备故障记录与跟踪', '设备质控数据统计分析'] },
  { id: 'P004', name: '赵医生', role: '报告质控员', department: '超声科', phone: '138****0004', status: '在岗', responsibilities: ['报告质量抽检', '报告错误追踪与反馈', '报告规范性培训'] },
]

const IMPROVEMENT_SUGGESTIONS = [
  { id: 'S001', category: '设备管理', priority: '高', title: '加强设备日常维护', score: 72, desc: '设备完好率(96.1%)低于目标值(98%)，建议增加预防性维护频次，特别是使用超过5年的设备。建议每季度进行一次深度保养，每月进行常规校准。', actions: ['增加维护频次', '建立设备健康档案', '超期设备更新计划'] },
  { id: 'S002', category: '报告质量', priority: '中', title: '提升报告撰写规范性', score: 85, desc: '报告合格率(97.8%)接近目标但未达标，主要问题集中在描述不规范和测量值遗漏。建议加强培训，完善报告模板。', actions: ['组织报告规范培训', '优化报告模板', '加强审核环节'] },
  { id: 'S003', category: '时效性', priority: '中', title: '缩短急诊报告出报时间', score: 78, desc: '报告及时率(93.2%)低于目标(95%)，主要出现在高峰时段。建议优化工作流程，合理分配审核资源。', actions: ['开设报告绿色通道', '优化审核流程', '增设审核人员'] },
]

const ROOM_DATA = [
  { room: '检查室 A', doctor: '李医生', exams: 42, qualified: 40, rate: 95.2, avgScore: 92.3 },
  { room: '检查室 B', doctor: '王医生', exams: 38, qualified: 37, rate: 97.4, avgScore: 94.1 },
  { room: '检查室 C', doctor: '张医生', exams: 35, qualified: 31, rate: 88.6, avgScore: 86.5 },
  { room: '检查室 D', doctor: '赵医生', exams: 40, qualified: 38, rate: 95.0, avgScore: 91.8 },
]

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  '合格': { bg: '#f0fdf4', color: '#22c55e' },
  '待改进': { bg: '#fff7ed', color: '#f97316' },
  '不合格': { bg: '#fef2f2', color: '#ef4444' },
  '达标': { bg: '#f0fdf4', color: '#22c55e' },
  '预警': { bg: '#fff7ed', color: '#f97316' },
  '超标': { bg: '#fef2f2', color: '#ef4444' },
  '处理中': { bg: '#eff6ff', color: '#3b82f6' },
  '已解决': { bg: '#f0fdf4', color: '#22c55e' },
  '严重': { bg: '#fef2f2', color: '#ef4444' },
  '一般': { bg: '#fff7ed', color: '#f97316' },
  '轻微': { bg: '#f0fdf4', color: '#22c55e' },
}

const EVENT_ICONS: Record<string, { icon: React.ReactNode; bg: string; color: string }> = {
  '设备故障': { icon: <Wrench size={16} />, bg: '#fef2f2', color: '#ef4444' },
  '图像伪影': { icon: <Image size={16} />, bg: '#fff7ed', color: '#f97316' },
  '报告错误': { icon: <FileText size={16} />, bg: '#eff6ff', color: '#3b82f6' },
}

const TREND_DATA = [
  { month: '11月', passRate: 93.2, reportQuality: 96.5, imageQuality: 92.1, satisfaction: 90.8 },
  { month: '12月', passRate: 94.1, reportQuality: 97.1, imageQuality: 93.0, satisfaction: 91.2 },
  { month: '01月', passRate: 92.8, reportQuality: 96.8, imageQuality: 91.5, satisfaction: 91.5 },
  { month: '02月', passRate: 95.5, reportQuality: 97.5, imageQuality: 94.2, satisfaction: 92.0 },
  { month: '03月', passRate: 94.8, reportQuality: 97.8, imageQuality: 93.8, satisfaction: 92.3 },
  { month: '04月', passRate: 94.2, reportQuality: 97.8, imageQuality: 94.2, satisfaction: 92.5 },
]

const PROBLEM_DISTRIBUTION = [
  { name: '图像伪影', value: 35, percent: 38 },
  { name: '报告描述不规范', value: 25, percent: 27 },
  { name: '出报超时', value: 18, percent: 20 },
  { name: '设备故障', value: 10, percent: 11 },
  { name: '其他', value: 5, percent: 5 },
]

const SCORE_DATA = [
  { name: '李医生', imageScore: 94.5, reportScore: 96.2, timelinessScore: 95.0 },
  { name: '王医生', imageScore: 93.8, reportScore: 97.5, timelinessScore: 93.5 },
  { name: '张医生', imageScore: 88.2, reportScore: 91.5, timelinessScore: 90.0 },
  { name: '赵医生', imageScore: 95.0, reportScore: 96.8, timelinessScore: 94.2 },
]

// ============ 子组件 ============
function IndicatorCard({ indicator }: { indicator: typeof INDICATORS[0] }) {
  const pct = Math.min((indicator.current / indicator.target) * 100, 100)
  const statusColors: Record<string, { bg: string; color: string }> = {
    '达标': { bg: '#f0fdf4', color: '#22c55e' },
    '预警': { bg: '#fff7ed', color: '#f97316' },
    '超标': { bg: '#fef2f2', color: '#ef4444' },
  }

  return (
    <div style={s.indicatorCard}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 12, color: '#64748b' }}>{indicator.category}</div>
        <span style={{ ...s.badge, background: statusColors[indicator.status]?.bg, color: statusColors[indicator.status]?.color }}>
          {indicator.status}
        </span>
      </div>
      <div style={s.indicatorName}>{indicator.name}</div>
      <div style={s.indicatorBar}>
        <div style={{ ...s.indicatorFill, width: `${pct}%`, background: indicator.color }} />
      </div>
      <div style={s.indicatorMeta}>
        <span style={{ fontWeight: 600, color: '#1a3a5c' }}>{indicator.current}{indicator.unit}</span>
        <span>目标: {indicator.target}{indicator.unit}</span>
      </div>
    </div>
  )
}

function EventItem({ event }: { event: typeof QC_EVENTS[0] }) {
  const iconData = EVENT_ICONS[event.type] || { icon: <AlertCircle size={16} />, bg: '#f8fafc', color: '#64748b' }

  return (
    <div style={s.eventItem}>
      <div style={{ ...s.eventIcon, background: iconData.bg, color: iconData.color }}>
        {iconData.icon}
      </div>
      <div style={s.eventContent}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={s.eventTitle}>{event.type}</span>
          <span style={{ ...s.badge, background: STATUS_COLORS[event.level]?.bg, color: STATUS_COLORS[event.level]?.color }}>
            {event.level}
          </span>
          <span style={{ ...s.badge, background: STATUS_COLORS[event.status]?.bg, color: STATUS_COLORS[event.status]?.color }}>
            {event.status}
          </span>
        </div>
        <div style={s.eventMeta}>
          {event.device !== '-' ? `${event.device} · ` : ''}{event.reporter} · {event.reportTime}
        </div>
        <div style={s.eventDesc}>{event.desc}</div>
      </div>
    </div>
  )
}

function StandardItem({ standard }: { standard: typeof STANDARDS[0] }) {
  const levelColors: Record<string, string> = {
    '国家': '#ef4444',
    '行业': '#f97316',
    '科室': '#22c55e',
  }

  return (
    <div style={s.standardItem}>
      <div style={s.standardHeader}>
        <div>
          <div style={s.standardTitle}>{standard.name}</div>
          <div style={s.standardCode}>{standard.code}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: levelColors[standard.level], fontWeight: 600 }}>{standard.level}</span>
          <span style={{ fontSize: 11, color: '#94a3b8' }}>{standard.effectiveDate}</span>
        </div>
      </div>
      <div style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>{standard.desc}</div>
      <div style={s.standardTags}>
        {standard.keywords.map(kw => (
          <span key={kw} style={{ ...s.tag, background: '#f1f5f9', color: '#64748b' }}>{kw}</span>
        ))}
      </div>
    </div>
  )
}

// ============ 图表配置 ============
function getTrendChartOption() {
  return {
    tooltip: { trigger: 'axis', background: '#fff', border: '#e2e8f0', borderRadius: 8, textStyle: { color: '#1a3a5c', fontSize: 12 } },
    legend: { data: ['合格率', '报告质量', '图像质量', '满意度'], bottom: 0, fontSize: 11 },
    grid: { top: 10, right: 20, bottom: 40, left: 50 },
    xAxis: { type: 'category', data: TREND_DATA.map(d => d.month), axisLine: { lineStyle: { color: '#e2e8f0' } }, axisLabel: { color: '#94a3b8', fontSize: 11 } },
    yAxis: { type: 'value', min: 85, max: 100, axisLine: { lineStyle: { color: '#e2e8f0' } }, axisLabel: { color: '#94a3b8', fontSize: 11 }, splitLine: { lineStyle: { color: '#f1f5f9' } } },
    series: [
      { name: '合格率', type: 'line', data: TREND_DATA.map(d => d.passRate), smooth: true, lineStyle: { width: 2 }, itemStyle: { color: '#3b82f6' }, areaStyle: { color: 'rgba(59,130,246,0.1)' } },
      { name: '报告质量', type: 'line', data: TREND_DATA.map(d => d.reportQuality), smooth: true, lineStyle: { width: 2 }, itemStyle: { color: '#22c55e' } },
      { name: '图像质量', type: 'line', data: TREND_DATA.map(d => d.imageQuality), smooth: true, lineStyle: { width: 2 }, itemStyle: { color: '#f97316' } },
      { name: '满意度', type: 'line', data: TREND_DATA.map(d => d.satisfaction), smooth: true, lineStyle: { width: 2 }, itemStyle: { color: '#8b5cf6' } },
    ],
  }
}

function getProblemDistChartOption() {
  return {
    tooltip: { trigger: 'item', background: '#fff', border: '#e2e8f0', borderRadius: 8, textStyle: { color: '#1a3a5c', fontSize: 12 } },
    legend: { orient: 'vertical', right: 20, top: 'center', fontSize: 11 },
    series: [{
      type: 'pie',
      radius: ['45%', '75%'],
      center: ['35%', '50%'],
      label: { show: false },
      data: PROBLEM_DISTRIBUTION.map((d, i) => ({
        name: `${d.name} ${d.percent}%`,
        value: d.value,
        itemStyle: { color: ['#f97316', '#3b82f6', '#8b5cf6', '#ef4444', '#94a3b8'][i] },
      })),
    }],
  }
}

function getScoreChartOption() {
  const categories = SCORE_DATA.map(d => d.name)
  return {
    tooltip: { trigger: 'axis', background: '#fff', border: '#e2e8f0', borderRadius: 8, textStyle: { color: '#1a3a5c', fontSize: 12 } },
    legend: { data: ['图像评分', '报告评分', '时效评分'], bottom: 0, fontSize: 11 },
    grid: { top: 10, right: 20, bottom: 40, left: 50 },
    xAxis: { type: 'category', data: categories, axisLine: { lineStyle: { color: '#e2e8f0' } }, axisLabel: { color: '#94a3b8', fontSize: 11 } },
    yAxis: { type: 'value', min: 80, max: 100, axisLine: { lineStyle: { color: '#e2e8f0' } }, axisLabel: { color: '#94a3b8', fontSize: 11 }, splitLine: { lineStyle: { color: '#f1f5f9' } } },
    series: [
      { name: '图像评分', type: 'bar', data: SCORE_DATA.map(d => d.imageScore), itemStyle: { color: '#3b82f6', borderRadius: [4, 4, 0, 0] } },
      { name: '报告评分', type: 'bar', data: SCORE_DATA.map(d => d.reportScore), itemStyle: { color: '#22c55e', borderRadius: [4, 4, 0, 0] } },
      { name: '时效评分', type: 'bar', data: SCORE_DATA.map(d => d.timelinessScore), itemStyle: { color: '#f97316', borderRadius: [4, 4, 0, 0] } },
    ],
  }
}

function getRoomChartOption() {
  return {
    tooltip: { trigger: 'axis', background: '#fff', border: '#e2e8f0', borderRadius: 8, textStyle: { color: '#1a3a5c', fontSize: 12 } },
    legend: { data: ['检查数', '合格数', '合格率'], bottom: 0, fontSize: 11 },
    grid: { top: 10, right: 60, bottom: 40, left: 50 },
    xAxis: { type: 'category', data: ROOM_DATA.map(d => d.room), axisLine: { lineStyle: { color: '#e2e8f0' } }, axisLabel: { color: '#94a3b8', fontSize: 11 } },
    yAxis: [
      { type: 'value', name: '数量', axisLine: { lineStyle: { color: '#e2e8f0' } }, axisLabel: { color: '#94a3b8', fontSize: 11 }, splitLine: { lineStyle: { color: '#f1f5f9' } } },
      { type: 'value', name: '合格率%', min: 80, max: 100, axisLine: { lineStyle: { color: '#e2e8f0' } }, axisLabel: { color: '#94a3b8', fontSize: 11 }, splitLine: { lineStyle: { color: '#f1f5f9' } } },
    ],
    series: [
      { name: '检查数', type: 'bar', data: ROOM_DATA.map(d => d.exams), itemStyle: { color: '#3b82f6', borderRadius: [4, 4, 0, 0] } },
      { name: '合格数', type: 'bar', data: ROOM_DATA.map(d => d.qualified), itemStyle: { color: '#22c55e', borderRadius: [4, 4, 0, 0] } },
      { name: '合格率', type: 'line', yAxisIndex: 1, data: ROOM_DATA.map(d => d.rate), smooth: true, lineStyle: { width: 2 }, itemStyle: { color: '#f97316' }, label: { show: true, formatter: '{c}%', fontSize: 10, color: '#f97316' } },
    ],
  }
}

function getGaugeOption(label: string, value: number, max: number = 100) {
  const pct = (value / max) * 100
  const color = pct >= 95 ? '#22c55e' : pct >= 85 ? '#f97316' : '#ef4444'
  return {
    series: [{
      type: 'gauge',
      startAngle: 180,
      endAngle: 0,
      center: ['50%', '75%'],
      radius: '90%',
      min: 0,
      max: max,
      splitNumber: 5,
      axisLine: { lineStyle: { width: 8, color: [[1, '#e2e8f0']] } },
      pointer: { icon: 'circle', length: '60%', width: 6, itemStyle: { color } },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },
      detail: { valueAnimation: true, formatter: `{value}%`, color, fontSize: 16, fontWeight: 700, offsetCenter: [0, '-10%'] },
      data: [{ value: Math.round(pct) }],
    }],
  }
}

// ============ 主组件 ============
export default function QCPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('全部')
  const [showEventModal, setShowEventModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportType, setReportType] = useState<'month' | 'quarter' | 'year'>('month')
  const [eventForm, setEventForm] = useState({ type: '设备故障', level: '一般', device: '', desc: '', reporter: '' })

  const filteredItems = QUALITY_ITEMS.filter(item => {
    const matchSearch = item.patientName.includes(search) || item.examType.includes(search)
    const matchStatus = filterStatus === '全部' || item.status === filterStatus
    return matchSearch && matchStatus
  })

  const passRate = Math.round((QUALITY_ITEMS.filter(i => i.status === '合格').length / QUALITY_ITEMS.length) * 100)
  const passRateNum = (QUALITY_ITEMS.filter(i => i.status === '合格').length / QUALITY_ITEMS.length) * 100

  const TABS = [
    { key: 'overview', label: '质控概览', icon: <Activity size={14} /> },
    { key: 'indicators', label: '指标配置', icon: <Settings size={14} /> },
    { key: 'statistics', label: '统计分析', icon: <BarChart2 size={14} /> },
    { key: 'events', label: '事件上报', icon: <AlertTriangle size={14} /> },
    { key: 'report', label: '报告生成', icon: <FileText size={14} /> },
    { key: 'suggestions', label: '改进建议', icon: <TrendingUp size={14} /> },
    { key: 'standards', label: '标准库', icon: <Shield size={14} /> },
    { key: 'personnel', label: '人员管理', icon: <User size={14} /> },
  ]

  return (
    <div style={s.root}>
      {/* 标题 */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>质量控制中心</h1>
          <p style={s.subtitle}>v0.2.0 — 质控指标 · 统计分析 · 事件管理 · 报告生成</p>
        </div>
        <div style={s.headerActions}>
          <button style={{ ...s.btn, ...s.btnPrimary }} onClick={() => setShowEventModal(true)}>
            <Plus size={14} /> 上报事件
          </button>
          <button style={{ ...s.btn, ...s.btnOutline }}>
            <Download size={14} /> 导出数据
          </button>
        </div>
      </div>

      {/* 概览卡片 */}
      <div style={s.overviewRow}>
        <div style={s.overviewCard}>
          <div style={{ ...s.overviewIcon, background: '#f0fdf4' }}><CheckCircle size={20} color="#22c55e" /></div>
          <div>
            <div style={s.overviewValue}>{passRate}%</div>
            <div style={s.overviewLabel}>综合合格率</div>
            <div style={{ ...s.overviewTrend, color: '#22c55e' }}><ArrowUp size={11} /> +1.2%</div>
          </div>
        </div>
        <div style={s.overviewCard}>
          <div style={{ ...s.overviewIcon, background: '#fff7ed' }}><AlertTriangle size={20} color="#f97316" /></div>
          <div>
            <div style={s.overviewValue}>{INDICATORS.filter(i => i.status === '预警').length}</div>
            <div style={s.overviewLabel}>预警指标</div>
            <div style={{ ...s.overviewTrend, color: '#f97316' }}><ArrowDown size={11} /> -1项</div>
          </div>
        </div>
        <div style={s.overviewCard}>
          <div style={{ ...s.overviewIcon, background: '#eff6ff' }}><AlertCircle size={20} color="#3b82f6" /></div>
          <div>
            <div style={s.overviewValue}>{QC_EVENTS.filter(e => e.status === '处理中').length}</div>
            <div style={s.overviewLabel}>处理中事件</div>
            <div style={{ ...s.overviewTrend, color: '#3b82f6' }}>共{QC_EVENTS.length}件</div>
          </div>
        </div>
        <div style={s.overviewCard}>
          <div style={{ ...s.overviewIcon, background: '#fef2f2' }}><FileText size={20} color="#ef4444" /></div>
          <div>
            <div style={s.overviewValue}>{QUALITY_ITEMS.filter(i => i.status === '不合格').length}</div>
            <div style={s.overviewLabel}>不合格项</div>
            <div style={{ ...s.overviewTrend, color: '#ef4444' }}>需重点关注</div>
          </div>
        </div>
        <div style={s.overviewCard}>
          <div style={{ ...s.overviewIcon, background: '#f5f3ff' }}><Shield size={20} color="#8b5cf6" /></div>
          <div>
            <div style={s.overviewValue}>{STANDARDS.length}</div>
            <div style={s.overviewLabel}>标准库条目</div>
            <div style={{ ...s.overviewTrend, color: '#8b5cf6' }}>最新更新</div>
          </div>
        </div>
      </div>

      {/* 标签页 */}
      <div style={s.tabs}>
        {TABS.map(tab => (
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

      {/* ========== 概览页 ========== */}
      {activeTab === 'overview' && (
        <>
          {/* ECharts 仪表盘 + 趋势 */}
          <div style={s.chartGrid}>
            <div style={s.content}>
              <div style={s.contentTitle}><CheckCircle size={16} color="#22c55e" /> 综合质量评分</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
                <ReactECharts option={getGaugeOption('合格率', passRateNum)} style={{ height: 180 }} />
                <ReactECharts option={getGaugeOption('报告质量', 97.8)} style={{ height: 180 }} />
              </div>
            </div>
            <div style={s.content}>
              <div style={s.contentTitle}><TrendingUp size={16} color="#3b82f6" /> 各项指标趋势</div>
              <ReactECharts option={getTrendChartOption()} style={{ height: 220 }} />
            </div>
          </div>

          {/* 问题分布 + 各室质控 */}
          <div style={s.chartGrid}>
            <div style={s.content}>
              <div style={s.contentTitle}><PieChartIcon size={16} color="#f97316" /> 问题类型分布</div>
              <ReactECharts option={getProblemDistChartOption()} style={{ height: 220 }} />
            </div>
            <div style={s.content}>
              <div style={s.contentTitle}><BarChart2 size={16} color="#3b82f6" /> 各检查室质控数据</div>
              <ReactECharts option={getRoomChartOption()} style={{ height: 220 }} />
            </div>
          </div>

          {/* 最近事件 */}
          <div style={s.content}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={s.contentTitle}><AlertTriangle size={16} color="#f97316" /> 近期质控事件</div>
              <button style={{ ...s.btnSm, background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0' }} onClick={() => setActiveTab('events')}>查看全部</button>
            </div>
            {QC_EVENTS.slice(0, 3).map(evt => <EventItem key={evt.id} event={evt} />)}
          </div>

          {/* 最近质控记录 */}
          <div style={s.content}>
            <div style={s.contentTitle}><FileText size={16} color="#3b82f6" /> 最近质控记录</div>
            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>质控ID</th>
                    <th style={s.th}>患者姓名</th>
                    <th style={s.th}>检查类型</th>
                    <th style={s.th}>检查部位</th>
                    <th style={s.th}>检查日期</th>
                    <th style={s.th}>检查医生</th>
                    <th style={s.th}>设备</th>
                    <th style={s.th}>质量评分</th>
                    <th style={s.th}>状态</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map(item => (
                    <tr key={item.id}>
                      <td style={s.td}><span style={{ fontFamily: 'monospace', color: '#3b82f6' }}>{item.id}</span></td>
                      <td style={{ ...s.td, fontWeight: 600, color: '#1a3a5c' }}>{item.patientName}</td>
                      <td style={s.td}>{item.examType}</td>
                      <td style={s.td}>{item.examPart}</td>
                      <td style={s.td}>{item.checkDate}</td>
                      <td style={s.td}>{item.inspector}</td>
                      <td style={s.td}>{item.device}</td>
                      <td style={s.td}>
                        <span style={{ fontWeight: 600, color: item.score >= 85 ? '#22c55e' : item.score >= 70 ? '#f97316' : '#ef4444' }}>
                          {item.score}
                        </span>
                      </td>
                      <td style={s.td}>
                        <span style={{ ...s.badge, background: STATUS_COLORS[item.status]?.bg, color: STATUS_COLORS[item.status]?.color }}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ========== 指标配置页 ========== */}
      {activeTab === 'indicators' && (
        <>
          <div style={s.content}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={s.contentTitle}><Settings size={16} color="#3b82f6" /> 质控指标配置</div>
              <button style={{ ...s.btn, ...s.btnPrimary }}><Plus size={14} /> 新增指标</button>
            </div>
            <div style={s.indicatorRow}>
              {INDICATORS.map(ind => <IndicatorCard key={ind.id} indicator={ind} />)}
            </div>
          </div>

          {/* 质控数据录入 */}
          <div style={s.content}>
            <div style={s.contentTitle}><Edit2 size={16} color="#22c55e" /> 质控数据录入</div>
            <div style={s.formRow}>
              <div style={s.formGroup}>
                <label style={s.label}>检查室</label>
                <select style={s.select}>
                  <option>全部检查室</option>
                  <option>检查室 A</option>
                  <option>检查室 B</option>
                  <option>检查室 C</option>
                  <option>检查室 D</option>
                </select>
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>检查医生</label>
                <select style={s.select}>
                  <option>全部医生</option>
                  <option>李医生</option>
                  <option>王医生</option>
                  <option>张医生</option>
                  <option>赵医生</option>
                </select>
              </div>
            </div>
            <div style={s.formRow}>
              <div style={s.formGroup}>
                <label style={s.label}>日期范围</label>
                <input type="date" style={s.input} defaultValue="2026-04-01" />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>指标类型</label>
                <select style={s.select}>
                  <option>全部类型</option>
                  <option>图像质量</option>
                  <option>报告质量</option>
                  <option>时效性</option>
                  <option>满意度</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button style={{ ...s.btn, ...s.btnPrimary }}><Search size={14} /> 查询数据</button>
              <button style={{ ...s.btn, ...s.btnOutline }}><RefreshCw size={14} /> 重置</button>
            </div>
          </div>

          {/* 各室/各医生数据 */}
          <div style={s.content}>
            <div style={s.contentTitle}><BarChart2 size={16} color="#8b5cf6" /> 各检查室质控数据</div>
            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>检查室</th>
                    <th style={s.th}>检查医生</th>
                    <th style={s.th}>检查数</th>
                    <th style={s.th}>合格数</th>
                    <th style={s.th}>合格率</th>
                    <th style={s.th}>平均评分</th>
                    <th style={s.th}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {ROOM_DATA.map(room => (
                    <tr key={room.room}>
                      <td style={s.td}><span style={{ fontWeight: 600, color: '#1a3a5c' }}>{room.room}</span></td>
                      <td style={s.td}>{room.doctor}</td>
                      <td style={s.td}>{room.exams}</td>
                      <td style={s.td}>{room.qualified}</td>
                      <td style={s.td}>
                        <span style={{ fontWeight: 600, color: room.rate >= 95 ? '#22c55e' : room.rate >= 85 ? '#f97316' : '#ef4444' }}>
                          {room.rate}%
                        </span>
                      </td>
                      <td style={s.td}>{room.avgScore}</td>
                      <td style={s.td}>
                        <button style={{ ...s.btnSm, background: '#eff6ff', color: '#3b82f6' }}><Eye size={12} /> 详情</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ========== 统计分析页 ========== */}
      {activeTab === 'statistics' && (
        <>
          <div style={s.chartGrid}>
            <div style={s.content}>
              <div style={s.contentTitle}><TrendingUp size={16} color="#3b82f6" /> 合格率趋势</div>
              <ReactECharts option={getTrendChartOption()} style={{ height: 280 }} />
            </div>
            <div style={s.content}>
              <div style={s.contentTitle}><PieChartIcon size={16} color="#f97316" /> 问题分布</div>
              <ReactECharts option={getProblemDistChartOption()} style={{ height: 280 }} />
            </div>
          </div>

          <div style={s.chartGrid}>
            <div style={s.content}>
              <div style={s.contentTitle}><BarChart2 size={16} color="#22c55e" /> 各医生评分对比</div>
              <ReactECharts option={getScoreChartOption()} style={{ height: 280 }} />
            </div>
            <div style={s.content}>
              <div style={s.contentTitle}><BarChart2 size={16} color="#8b5cf6" /> 各检查室数据</div>
              <ReactECharts option={getRoomChartOption()} style={{ height: 280 }} />
            </div>
          </div>

          {/* 统计数据表格 */}
          <div style={s.content}>
            <div style={s.contentTitle}><FileText size={16} color="#3b82f6" /> 质控数据明细</div>
            <div style={s.filterRow}>
              <Search size={14} color="#64748b" />
              <input style={s.searchInput} placeholder="搜索患者姓名/检查类型..." value={search} onChange={e => setSearch(e.target.value)} />
              <select style={{ ...s.select, minHeight: 38 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option>全部</option>
                <option>合格</option>
                <option>待改进</option>
                <option>不合格</option>
              </select>
            </div>
            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>质控ID</th>
                    <th style={s.th}>患者姓名</th>
                    <th style={s.th}>检查类型</th>
                    <th style={s.th}>检查部位</th>
                    <th style={s.th}>检查日期</th>
                    <th style={s.th}>检查医生</th>
                    <th style={s.th}>设备</th>
                    <th style={s.th}>质量评分</th>
                    <th style={s.th}>状态</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map(item => (
                    <tr key={item.id}>
                      <td style={s.td}><span style={{ fontFamily: 'monospace', color: '#3b82f6' }}>{item.id}</span></td>
                      <td style={{ ...s.td, fontWeight: 600, color: '#1a3a5c' }}>{item.patientName}</td>
                      <td style={s.td}>{item.examType}</td>
                      <td style={s.td}>{item.examPart}</td>
                      <td style={s.td}>{item.checkDate}</td>
                      <td style={s.td}>{item.inspector}</td>
                      <td style={s.td}>{item.device}</td>
                      <td style={s.td}>
                        <span style={{ fontWeight: 600, color: item.score >= 85 ? '#22c55e' : item.score >= 70 ? '#f97316' : '#ef4444' }}>
                          {item.score}
                        </span>
                      </td>
                      <td style={s.td}>
                        <span style={{ ...s.badge, background: STATUS_COLORS[item.status]?.bg, color: STATUS_COLORS[item.status]?.color }}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ========== 事件上报页 ========== */}
      {activeTab === 'events' && (
        <>
          <div style={s.content}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={s.contentTitle}><AlertTriangle size={16} color="#ef4444" /> 质控事件列表</div>
              <button style={{ ...s.btn, ...s.btnPrimary }} onClick={() => setShowEventModal(true)}><Plus size={14} /> 上报新事件</button>
            </div>
            {QC_EVENTS.map(evt => <EventItem key={evt.id} event={evt} />)}
          </div>

          {/* 事件统计 */}
          <div style={s.chartGrid}>
            <div style={s.content}>
              <div style={s.contentTitle}><BarChart2 size={16} color="#3b82f6" /> 事件类型统计</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {[{ type: '设备故障', count: 2, color: '#ef4444' }, { type: '图像伪影', count: 2, color: '#f97316' }, { type: '报告错误', count: 1, color: '#3b82f6' }].map(item => (
                  <div key={item.type} style={{ background: '#f8fafc', borderRadius: 10, padding: 16, textAlign: 'center' }}>
                    <div style={{ fontSize: 28, fontWeight: 700, color: item.color }}>{item.count}</div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{item.type}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={s.content}>
              <div style={s.contentTitle}><CheckCircle size={16} color="#22c55e" /> 处理状态统计</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                {[{ status: '处理中', count: 1, color: '#3b82f6' }, { status: '已解决', count: 4, color: '#22c55e' }].map(item => (
                  <div key={item.status} style={{ background: '#f8fafc', borderRadius: 10, padding: 20, textAlign: 'center' }}>
                    <div style={{ fontSize: 32, fontWeight: 700, color: item.color }}>{item.count}</div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{item.status}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ========== 报告生成页 ========== */}
      {activeTab === 'report' && (
        <>
          <div style={s.content}>
            <div style={s.contentTitle}><FileText size={16} color="#3b82f6" /> 生成质控报告</div>
            <div style={s.reportTypeRow}>
              {([
                { key: 'month', label: '月度报告', desc: '统计本月各项质控指标数据', icon: <Calendar size={24} /> },
                { key: 'quarter', label: '季度报告', desc: '汇总本季度质控工作与改进措施', icon: <BarChart2 size={24} /> },
                { key: 'year', label: '年度报告', desc: '年度质量控制全面评估报告', icon: <FileText size={24} /> },
              ] as const).map(r => (
                <div
                  key={r.key}
                  style={reportType === r.key ? s.reportTypeCardActive : s.reportTypeCard}
                  onClick={() => setReportType(r.key)}
                >
                  <div style={{ color: reportType === r.key ? '#3b82f6' : '#94a3b8', marginBottom: 8 }}>{r.icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1a3a5c' }}>{r.label}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{r.desc}</div>
                </div>
              ))}
            </div>

            <div style={s.formRow}>
              <div style={s.formGroup}>
                <label style={s.label}>报告周期</label>
                <input type="month" style={s.input} defaultValue="2026-04" />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>报告生成人</label>
                <input type="text" style={s.input} placeholder="输入姓名" defaultValue="王主任" />
              </div>
            </div>
            <div style={{ ...s.formGroup, marginBottom: 16 }}>
              <label style={s.label}>报告内容摘要</label>
              <textarea style={s.textarea} defaultValue={`${reportType === 'month' ? '月度' : reportType === 'quarter' ? '季度' : '年度'}质控报告：\n- 本期综合合格率达到${passRate}%\n- 重点关注预警指标：图像优良率、报告合格率、设备完好率\n- 质控事件共${QC_EVENTS.length}件，已解决${QC_EVENTS.filter(e => e.status === '已解决').length}件\n- 持续改进建议见附件`} />
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ ...s.btn, ...s.btnPrimary }}><FileText size={14} /> 生成报告</button>
              <button style={{ ...s.btn, ...s.btnSuccess }}><Download size={14} /> 导出PDF</button>
              <button style={{ ...s.btn, ...s.btnOutline }}><Eye size={14} /> 打印预览</button>
            </div>
          </div>

          {/* 历史报告 */}
          <div style={s.content}>
            <div style={s.contentTitle}><Clock size={16} color="#64748b" /> 历史报告</div>
            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>报告名称</th>
                    <th style={s.th}>类型</th>
                    <th style={s.th}>生成日期</th>
                    <th style={s.th}>生成人</th>
                    <th style={s.th}>状态</th>
                    <th style={s.th}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: '2026年3月质控月报', type: '月报', date: '2026-04-01', person: '王主任', status: '已归档' },
                    { name: '2026年Q1季度报告', type: '季报', date: '2026-04-01', person: '王主任', status: '已归档' },
                    { name: '2026年2月质控月报', type: '月报', date: '2026-03-01', person: '王主任', status: '已归档' },
                    { name: '2026年1月质控月报', type: '月报', date: '2026-02-01', person: '王主任', status: '已归档' },
                  ].map((r, i) => (
                    <tr key={i}>
                      <td style={s.td}><span style={{ fontWeight: 600, color: '#1a3a5c' }}>{r.name}</span></td>
                      <td style={s.td}>{r.type}</td>
                      <td style={s.td}>{r.date}</td>
                      <td style={s.td}>{r.person}</td>
                      <td style={s.td}><span style={{ ...s.badge, background: '#f0fdf4', color: '#22c55e' }}>{r.status}</span></td>
                      <td style={s.td}>
                        <button style={{ ...s.btnSm, background: '#eff6ff', color: '#3b82f6', marginRight: 4 }}><Eye size={12} />查看</button>
                        <button style={{ ...s.btnSm, background: '#f0fdf4', color: '#22c55e' }}><Download size={12} />下载</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ========== 改进建议页 ========== */}
      {activeTab === 'suggestions' && (
        <>
          <div style={s.content}>
            <div style={s.contentTitle}><TrendingUp size={16} color="#22c55e" /> 基于数据的持续改进建议</div>
            {IMPROVEMENT_SUGGESTIONS.map(sug => {
              const priorityColors: Record<string, { bg: string; color: string }> = {
                '高': { bg: '#fef2f2', color: '#ef4444' },
                '中': { bg: '#fff7ed', color: '#f97316' },
                '低': { bg: '#f0fdf4', color: '#22c55e' },
              }
              return (
                <div key={sug.id} style={s.suggestCard}>
                  <div style={s.suggestHeader}>
                    <span style={{ fontSize: 12, color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: 4 }}>{sug.category}</span>
                    <span style={{ ...s.badge, background: priorityColors[sug.priority]?.bg, color: priorityColors[sug.priority]?.color }}>
                      {sug.priority}优先级
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '8px 0' }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#1a3a5c' }}>{sug.title}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>改善评分: {sug.score}</div>
                  </div>
                  <div style={s.suggestDesc}>{sug.desc}</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                    {sug.actions.map((action, i) => (
                      <span key={i} style={{ ...s.tag, background: '#eff6ff', color: '#3b82f6' }}>
                        <CheckCircle size={10} style={{ marginRight: 3 }} />{action}
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* 改进效果追踪 */}
          <div style={s.content}>
            <div style={s.contentTitle}><Activity size={16} color="#3b82f6" /> 改进效果追踪</div>
            <div style={s.chartGrid}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1a3a5c', marginBottom: 12 }}>图像优良率改善趋势</div>
                <ReactECharts option={{
                  tooltip: { trigger: 'axis', background: '#fff', border: '#e2e8f0', borderRadius: 8, textStyle: { color: '#1a3a5c', fontSize: 12 } },
                  grid: { top: 10, right: 20, bottom: 30, left: 50 },
                  xAxis: { type: 'category', data: ['11月', '12月', '01月', '02月', '03月', '04月'], axisLine: { lineStyle: { color: '#e2e8f0' } }, axisLabel: { color: '#94a3b8', fontSize: 11 } },
                  yAxis: { type: 'value', min: 88, max: 96, axisLine: { lineStyle: { color: '#e2e8f0' } }, axisLabel: { color: '#94a3b8', fontSize: 11 }, splitLine: { lineStyle: { color: '#f1f5f9' } } },
                  series: [{ type: 'line', data: [92.1, 93.0, 91.5, 94.2, 93.8, 94.2], smooth: true, areaStyle: { color: 'rgba(59,130,246,0.1)' }, lineStyle: { width: 2 }, itemStyle: { color: '#3b82f6' } }],
                }} style={{ height: 200 }} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1a3a5c', marginBottom: 12 }}>报告合格率改善趋势</div>
                <ReactECharts option={{
                  tooltip: { trigger: 'axis', background: '#fff', border: '#e2e8f0', borderRadius: 8, textStyle: { color: '#1a3a5c', fontSize: 12 } },
                  grid: { top: 10, right: 20, bottom: 30, left: 50 },
                  xAxis: { type: 'category', data: ['11月', '12月', '01月', '02月', '03月', '04月'], axisLine: { lineStyle: { color: '#e2e8f0' } }, axisLabel: { color: '#94a3b8', fontSize: 11 } },
                  yAxis: { type: 'value', min: 94, max: 100, axisLine: { lineStyle: { color: '#e2e8f0' } }, axisLabel: { color: '#94a3b8', fontSize: 11 }, splitLine: { lineStyle: { color: '#f1f5f9' } } },
                  series: [{ type: 'line', data: [96.5, 97.1, 96.8, 97.5, 97.8, 97.8], smooth: true, areaStyle: { color: 'rgba(34,197,94,0.1)' }, lineStyle: { width: 2 }, itemStyle: { color: '#22c55e' } }],
                }} style={{ height: 200 }} />
              </div>
            </div>
          </div>
        </>
      )}

      {/* ========== 标准库页 ========== */}
      {activeTab === 'standards' && (
        <>
          <div style={s.content}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={s.contentTitle}><Shield size={16} color="#8b5cf6" /> 质控标准库</div>
              <button style={{ ...s.btn, ...s.btnPrimary }}><Plus size={14} /> 新增标准</button>
            </div>
            <div style={{ marginBottom: 8, display: 'flex', gap: 8 }}>
              {['全部', '国家标准', '行业标准', '科室标准'].map(level => (
                <button key={level} style={{ ...s.btnSm, background: level === '全部' ? '#3b82f6' : '#f8fafc', color: level === '全部' ? '#fff' : '#64748b', border: '1px solid #e2e8f0' }}>
                  {level}
                </button>
              ))}
            </div>
            {STANDARDS.map(std => <StandardItem key={std.id} standard={std} />)}
          </div>
        </>
      )}

      {/* ========== 人员管理页 ========== */}
      {activeTab === 'personnel' && (
        <>
          <div style={s.content}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={s.contentTitle}><User size={16} color="#3b82f6" /> 质控人员管理</div>
              <button style={{ ...s.btn, ...s.btnPrimary }}><Plus size={14} /> 添加人员</button>
            </div>
            <div style={s.chartGrid3}>
              {QC_PERSONNEL.map(person => (
                <div key={person.id} style={s.personCard}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={s.personAvatar}>{person.name[0]}</div>
                    <div>
                      <div style={s.personName}>{person.name}</div>
                      <div style={s.personRole}>{person.role}</div>
                    </div>
                    <div style={{ marginLeft: 'auto' }}>
                      <span style={{ ...s.badge, background: person.status === '在岗' ? '#f0fdf4' : '#fef2f2', color: person.status === '在岗' ? '#22c55e' : '#ef4444' }}>
                        {person.status}
                      </span>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 10 }}>部门: {person.department}</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>电话: {person.phone}</div>
                  <div style={{ marginTop: 10, borderTop: '1px solid #e2e8f0', paddingTop: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#475569', marginBottom: 6 }}>职责:</div>
                    {person.responsibilities.map((r, i) => (
                      <div key={i} style={{ fontSize: 11, color: '#64748b', marginBottom: 3, display: 'flex', alignItems: 'flex-start', gap: 4 }}>
                        <CheckCircle size={10} color="#22c55e" style={{ marginTop: 2, flexShrink: 0 }} />
                        {r}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ========== 模态框: 上报事件 ========== */}
      {showEventModal && (
        <div style={s.modal} onClick={() => setShowEventModal(false)}>
          <div style={s.modalContent} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <div style={s.modalTitle}>上报质控事件</div>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }} onClick={() => setShowEventModal(false)}>
                <X size={18} color="#64748b" />
              </button>
            </div>
            <div style={s.formRow}>
              <div style={s.formGroup}>
                <label style={s.label}>事件类型 *</label>
                <select style={s.select} value={eventForm.type} onChange={e => setEventForm({ ...eventForm, type: e.target.value })}>
                  <option>设备故障</option>
                  <option>图像伪影</option>
                  <option>报告错误</option>
                  <option>其他</option>
                </select>
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>严重程度 *</label>
                <select style={s.select} value={eventForm.level} onChange={e => setEventForm({ ...eventForm, level: e.target.value })}>
                  <option>轻微</option>
                  <option>一般</option>
                  <option>严重</option>
                </select>
              </div>
            </div>
            <div style={{ ...s.formGroup, marginBottom: 16 }}>
              <label style={s.label}>涉及设备</label>
              <input type="text" style={s.input} placeholder="如: 彩超仪 A (US-001)" value={eventForm.device} onChange={e => setEventForm({ ...eventForm, device: e.target.value })} />
            </div>
            <div style={{ ...s.formGroup, marginBottom: 16 }}>
              <label style={s.label}>上报人 *</label>
              <input type="text" style={s.input} placeholder="输入姓名" value={eventForm.reporter} onChange={e => setEventForm({ ...eventForm, reporter: e.target.value })} />
            </div>
            <div style={{ ...s.formGroup, marginBottom: 20 }}>
              <label style={s.label}>事件描述 *</label>
              <textarea style={s.textarea} placeholder="详细描述事件情况..." value={eventForm.desc} onChange={e => setEventForm({ ...eventForm, desc: e.target.value })} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ ...s.btn, ...s.btnPrimary }} onClick={() => setShowEventModal(false)}><Save size={14} /> 保存</button>
              <button style={{ ...s.btn, ...s.btnOutline }} onClick={() => setShowEventModal(false)}>取消</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
