// ============================================================
// G004 内镜管理系统 - DICOM MWL 工作列表页
// 功能：工作列表流转、接诊操作、模拟HL7消息推送
// ============================================================
import type { LucideIcon } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import {
  Calendar, Clock, User, Stethoscope, CheckCircle,
  Circle, AlertCircle, ChevronRight, Filter, RefreshCw,
  Activity, FileText, Wifi, WifiOff, X, Send,
  Play, StopCircle, Bell, ArrowRight, Clock3, Check
} from 'lucide-react';
import type { Appointment, AppointmentStatus } from '../types';
import { useMWL } from '../context/MWLContext';
import {
  toDicomMWLStatus,
  canTransition,
  DICOM_MWL_STATUS,
  type MWLTransition,
  type HL7LogEntry,
} from '../services/mwlService';
import type { EndoscopyExam } from '../types';

// ---------- 样式 ----------
const s: Record<string, React.CSSProperties> = {
  root: { padding: 0 },
  header: {
    marginBottom: 24,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 20, fontWeight: 700, color: '#1a3a5c', margin: 0,
  },
  subtitle: {
    fontSize: 13, color: '#64748b', marginTop: 4,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  refreshBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 14px',
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    fontSize: 13,
    color: '#64748b',
    cursor: 'pointer',
  },
  // 状态流程条
  statusFlow: {
    display: 'flex',
    alignItems: 'center',
    background: '#fff',
    borderRadius: 12,
    padding: '16px 24px',
    marginBottom: 24,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    gap: 0,
  },
  flowStep: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
    position: 'relative',
  },
  flowDot: {
    width: 32, height: 32, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 13, fontWeight: 600, zIndex: 1,
  },
  flowLabel: {
    fontSize: 11, color: '#64748b', marginTop: 6, textAlign: 'center',
  },
  flowCount: {
    fontSize: 16, fontWeight: 700, marginTop: 2,
  },
  flowLine: {
    position: 'absolute',
    top: 16,
    left: '50%',
    width: '100%',
    height: 2,
    zIndex: 0,
  },
  // 统计摘要
  summaryRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16,
    marginBottom: 24,
  },
  summaryCard: {
    background: '#fff',
    borderRadius: 10,
    padding: '14px 18px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  summaryIcon: {
    width: 38, height: 38, borderRadius: 8,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  summaryInfo: { flex: 1 },
  summaryValue: {
    fontSize: 20, fontWeight: 700, color: '#1a3a5c', lineHeight: 1.2,
  },
  summaryLabel: {
    fontSize: 11, color: '#64748b', marginTop: 2,
  },
  // 筛选栏
  filterBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  filterLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 13,
    color: '#64748b',
    marginRight: 4,
  },
  filterTab: {
    padding: '6px 14px',
    borderRadius: 20,
    fontSize: 13,
    cursor: 'pointer',
    border: '1px solid transparent',
    transition: 'all 0.2s',
  },
  // MWL标签
  mwlBadge: {
    padding: '2px 8px',
    borderRadius: 10,
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: '0.5px',
  },
  // 卡片列表
  cardList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  card: {
    background: '#fff',
    borderRadius: 12,
    padding: '18px 20px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    cursor: 'pointer',
    transition: 'box-shadow 0.2s',
  },
  cardAvatar: {
    width: 48, height: 48, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 18, fontWeight: 700, color: '#fff',
    flexShrink: 0,
  },
  cardInfo: { flex: 1, minWidth: 0 },
  cardName: {
    fontSize: 15, fontWeight: 600, color: '#1a3a5c', marginBottom: 4,
  },
  cardMeta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px 12px',
    fontSize: 12, color: '#64748b',
  },
  cardMetaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  cardRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 8,
    flexShrink: 0,
  },
  statusBadge: {
    padding: '4px 10px',
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  queueNum: {
    fontSize: 12, color: '#94a3b8',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  cardArrow: {
    color: '#cbd5e1',
  },
  // 空状态
  emptyState: {
    textAlign: 'center',
    padding: '48px 20px',
    color: '#94a3b8',
    fontSize: 14,
  },
  // 侧边详情面板
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.35)',
    zIndex: 100,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  panel: {
    width: 520,
    height: '100%',
    background: '#f8fafc',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
  },
  panelHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    background: '#fff',
    borderBottom: '1px solid #e2e8f0',
  },
  panelTabs: {
    display: 'flex',
    gap: 4,
    padding: '12px 20px',
    background: '#fff',
    borderBottom: '1px solid #e2e8f0',
  },
  panelTab: {
    padding: '6px 16px',
    borderRadius: 8,
    fontSize: 13,
    cursor: 'pointer',
    border: 'none',
    background: 'transparent',
    color: '#64748b',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  panelTabActive: {
    background: '#1a3a5c',
    color: '#fff',
  },
  panelBody: {
    flex: 1,
    overflowY: 'auto',
    padding: 20,
  },
  // 流转按钮区
  actionRow: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  actionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 14px',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.2s',
  },
  // MWL流转指示器
  mwlFlowBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 0,
    background: '#fff',
    borderRadius: 10,
    padding: '12px 16px',
    marginBottom: 16,
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
  },
  mwlStep: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    fontSize: 10,
    color: '#94a3b8',
  },
  mwlStepDone: {
    color: '#22c55e',
    fontWeight: 600,
  },
  mwlStepActive: {
    color: '#3b82f6',
    fontWeight: 700,
  },
  // HL7日志
  hl7LogItem: {
    background: '#fff',
    borderRadius: 10,
    padding: '12px 16px',
    marginBottom: 8,
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    borderLeft: '3px solid',
  },
  hl7Badge: {
    padding: '2px 8px',
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 700,
  },
  hl7Raw: {
    fontSize: 10,
    color: '#94a3b8',
    fontFamily: 'Courier New, monospace',
    marginTop: 6,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    maxHeight: 80,
    overflow: 'hidden',
  },
  // 通知吐司
  toast: {
    position: 'fixed',
    bottom: 24,
    right: 24,
    padding: '12px 18px',
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 500,
    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
    zIndex: 200,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    maxWidth: 340,
  },
  // 颜色
  blue: { backgroundColor: '#eff6ff', color: '#3b82f6' },
  green: { backgroundColor: '#f0fdf4', color: '#22c55e' },
  orange: { backgroundColor: '#fff7ed', color: '#f97316' },
  red: { backgroundColor: '#fef2f2', color: '#ef4444' },
  gray: { backgroundColor: '#f8fafc', color: '#64748b' },
  purple: { backgroundColor: '#f5f3ff', color: '#8b5cf6' },
  teal: { backgroundColor: '#f0fdfa', color: '#14b8a6' },
}

// 状态配置
const STATUS_CONFIG: Record<AppointmentStatus, { label: string; color: string; backgroundColor: string; icon: React.ReactNode }> = {
  '待确认': { label: '待确认', color: '#f97316', backgroundColor: '#fff7ed', icon: <Circle size={12} /> },
  '已确认': { label: '已确认', color: '#3b82f6', backgroundColor: '#eff6ff', icon: <Circle size={12} /> },
  '检查中': { label: '检查中', color: '#8b5cf6', backgroundColor: '#f5f3ff', icon: <AlertCircle size={12} /> },
  '已完成': { label: '已完成', color: '#22c55e', backgroundColor: '#f0fdf4', icon: <CheckCircle size={12} /> },
  '已取消': { label: '已取消', color: '#94a3b8', backgroundColor: '#f8fafc', icon: <Circle size={12} /> },
  '迟到': { label: '迟到', color: '#ef4444', backgroundColor: '#fef2f2', icon: <AlertCircle size={12} /> },
  '待检查': { label: '待检查', color: '#a855f7', backgroundColor: '#faf5ff', icon: <Circle size={12} /> },
  '进行中': { label: '进行中', color: '#0ea5e9', backgroundColor: '#f0f9ff', icon: <AlertCircle size={12} /> },
}

// 流程步骤
const FLOW_STEPS: AppointmentStatus[] = ['待确认', '已确认', '检查中', '已完成']

// 性别颜色
const GENDER_COLORS = { '男': '#3b82f6', '女': '#ec4899' }

// MWL 状态配色
const MWL_STATUS_COLORS: Record<MWLTransition, { bg: string; color: string }> = {
  'SCHEDULED':   { bg: '#f8fafc', color: '#64748b' },
  'ARRIVED':     { bg: '#fef3c7', color: '#d97706' },
  'CHECKED_IN':  { bg: '#dbeafe', color: '#2563eb' },
  'IN_PROGRESS': { bg: '#ede9fe', color: '#7c3aed' },
  'COMPLETED':   { bg: '#dcfce7', color: '#16a34a' },
  'CANCELLED':   { bg: '#fee2e2', color: '#dc2626' },
}

// MWL 流转步骤顺序
const MWL_STEPS: MWLTransition[] = ['SCHEDULED', 'ARRIVED', 'CHECKED_IN', 'IN_PROGRESS', 'COMPLETED'];

// ============ MWL工作列表页组件 ============
export default function WorklistPage() {
  const today = '2026-04-29'

  const {
    appointments,
    hl7Log,
    selectedApt,
    isPanelOpen,
    panelTab,
    lastHL7Msg,
    refreshAppointments,
    openPanel,
    closePanel,
    checkIn,
    startExam,
    completeExam,
    cancelApt,
    getExamByAptId,
  } = useMWL()

  // 今日预约（从MWL Context）
  const todayAppointments = useMemo(() => {
    return appointments.filter(apt => apt.appointmentDate === today)
  }, [appointments, today])

  // 状态统计
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      '待确认': 0, '已确认': 0, '检查中': 0, '已完成': 0, '已取消': 0, '迟到': 0,
    }
    todayAppointments.forEach(apt => {
      counts[apt.status] = (counts[apt.status] || 0) + 1
    })
    return counts
  }, [todayAppointments])

  // 筛选状态
  const [filterStatus, setFilterStatus] = useState<string>('全部')

  const filteredAppointments = useMemo(() => {
    if (filterStatus === '全部') return todayAppointments
    return todayAppointments.filter(apt => apt.status === filterStatus)
  }, [todayAppointments, filterStatus])

  // Toast通知
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null)

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // 刷新列表
  const handleRefresh = () => {
    refreshAppointments()
    showToast('工作列表已刷新', 'info')
  }

  // 接诊操作
  const handleCheckIn = (apt: Appointment) => {
    checkIn(apt)
    showToast(`患者 ${apt.patientName} 接诊成功，已推送 HL7 ADT A01`, 'success')
  }

  // 开始检查
  const handleStart = (apt: Appointment) => {
    startExam(apt)
    showToast(`患者 ${apt.patientName} 开始检查`, 'info')
  }

  // 完成检查
  const handleComplete = (apt: Appointment) => {
    completeExam(apt)
    showToast(`患者 ${apt.patientName} 检查完成，已推送 HL7 ORU R01`, 'success')
  }

  // 取消
  const handleCancel = (apt: Appointment) => {
    cancelApt(apt)
    showToast(`患者 ${apt.patientName} 已取消`, 'error')
  }

  // 总计
  const totalCount = todayAppointments.length
  const completedCount = statusCounts['已完成'] || 0
  const inProgressCount = (statusCounts['检查中'] || 0) + (statusCounts['已确认'] || 0) + (statusCounts['待检查'] || 0)

  return (
    <div style={s.root}>
      {/* 标题区 */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>DICOM MWL 工作列表</h1>
          <p style={s.subtitle}>
            <Calendar size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
            {new Date(today).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
            <span style={{ marginLeft: 12, color: '#94a3b8' }}>
              共 <strong style={{ color: '#1a3a5c' }}>{totalCount}</strong> 位患者预约
              ，已完成 <strong style={{ color: '#22c55e' }}>{completedCount}</strong> 例
              | HL7 在线 <Wifi size={12} style={{ verticalAlign: 'middle', marginLeft: 8 }} color="#22c55e" />
            </span>
          </p>
        </div>
        <div style={s.headerRight}>
          <button style={{ ...s.refreshBtn, minHeight: 44, padding: '8px 16px' }} onClick={handleRefresh}>
            <RefreshCw size={15} />
            刷新列表
          </button>
        </div>
      </div>

      {/* 状态流程条 */}
      <div style={s.statusFlow}>
        {FLOW_STEPS.map((step, idx) => {
          const count = statusCounts[step] || 0
          const cfg = STATUS_CONFIG[step]
          const isLast = idx === FLOW_STEPS.length - 1
          return (
            <div key={step} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div style={s.flowStep}>
                <div style={{
                  ...s.flowDot,
                  background: count > 0 ? cfg.backgroundColor : '#f1f5f9',
                  color: count > 0 ? cfg.color : '#cbd5e1',
                  border: `2px solid ${count > 0 ? cfg.color : '#e2e8f0'}`,
                }}>
                  {count}
                </div>
                <div style={s.flowLabel}>{cfg.label}</div>
              </div>
              {!isLast && (
                <div style={{
                  ...s.flowLine,
                  background: `linear-gradient(to right, ${cfg.color}33, ${FLOW_STEPS[idx + 1] ? STATUS_CONFIG[FLOW_STEPS[idx + 1]].color : cfg.color}33)`,
                  width: '100%',
                  left: '50%',
                }} />
              )}
            </div>
          )
        })}
      </div>

      {/* 统计摘要 */}
      <div style={s.summaryRow}>
        <SummaryCard
          icon={Stethoscope}
          iconBg={s.blue.backgroundColor as string}
          iconColor={s.blue.color as string}
          value={totalCount}
          label="今日预约"
        />
        <SummaryCard
          icon={Clock}
          iconBg={s.orange.backgroundColor as string}
          iconColor={s.orange.color as string}
          value={inProgressCount}
          label="进行中"
        />
        <SummaryCard
          icon={CheckCircle}
          iconBg={s.green.backgroundColor as string}
          iconColor={s.green.color as string}
          value={completedCount}
          label="已完成"
        />
        <SummaryCard
          icon={Activity}
          iconBg={s.purple.backgroundColor as string}
          iconColor={s.purple.color as string}
          value={hl7Log.length}
          label="HL7消息"
        />
      </div>

      {/* 筛选栏 */}
      <div style={s.filterBar}>
        <span style={s.filterLabel}><Filter size={13} /> 状态筛选：</span>
        {['全部', '待确认', '已确认', '待检查', '检查中', '已完成'].map(status => (
          <button
            key={status}
            style={{
              ...s.filterTab,
              minHeight: 36,
              padding: '6px 16px',
              background: filterStatus === status ? (status === '全部' ? '#1a3a5c' : STATUS_CONFIG[status as AppointmentStatus]?.color) : '#fff',
              color: filterStatus === status ? '#fff' : '#64748b',
              borderColor: filterStatus === status ? 'transparent' : '#e2e8f0',
            }}
            onClick={() => setFilterStatus(status)}
          >
            {status}
          </button>
        ))}
      </div>

      {/* 卡片列表 */}
      <div style={s.cardList}>
        {filteredAppointments.length === 0 ? (
          <div style={{ ...s.card, textAlign: 'center', padding: '60px 40px', background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <Calendar size={48} style={{ marginBottom: 16, opacity: 0.35, color: '#64748b' }} />
            <div style={{ fontSize: 16, fontWeight: 600, color: '#475569', marginBottom: 8 }}>
              {filterStatus === '全部' ? '今日暂无预约记录' : `暂无${filterStatus}状态的预约`}
            </div>
          </div>
        ) : (
          filteredAppointments.map((apt) => (
            <WorklistCard
              key={apt.id}
              appointment={apt}
              onClick={() => openPanel(apt)}
              onCheckIn={() => handleCheckIn(apt)}
              onStart={() => handleStart(apt)}
              onComplete={() => handleComplete(apt)}
              onCancel={() => handleCancel(apt)}
            />
          ))
        )}
      </div>

      {/* 侧边详情面板 */}
      {isPanelOpen && selectedApt && (
        <MWLPanel
          appointment={selectedApt}
          tab={panelTab}
          onClose={closePanel}
          onTabChange={(t) => openPanel(selectedApt, t)}
          onCheckIn={() => handleCheckIn(selectedApt)}
          onStart={() => handleStart(selectedApt)}
          onComplete={() => handleComplete(selectedApt)}
          onCancel={() => handleCancel(selectedApt)}
          getExamByAptId={getExamByAptId}
        />
      )}

      {/* Toast 通知 */}
      {toast && (
        <div style={{
          ...s.toast,
          background: toast.type === 'success' ? '#22c55e' : toast.type === 'error' ? '#ef4444' : '#1a3a5c',
          color: '#fff',
        }}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : toast.type === 'error' ? <X size={16} /> : <Bell size={16} />}
          {toast.msg}
        </div>
      )}
    </div>
  )
}

// ---------- SummaryCard ----------
interface SummaryCardProps {
  icon: LucideIcon
  iconBg: React.CSSProperties['background']
  iconColor: string
  value: number
  label: string
}

function SummaryCard({ icon: Icon, iconBg, iconColor, value, label }: SummaryCardProps) {
  return (
    <div style={s.summaryCard}>
      <div style={{ ...s.summaryIcon, background: iconBg }}>
        <Icon size={18} color={iconColor} />
      </div>
      <div style={s.summaryInfo}>
        <div style={s.summaryValue}>{value}</div>
        <div style={s.summaryLabel}>{label}</div>
      </div>
    </div>
  )
}

// ---------- WorklistCard ----------
interface WorklistCardProps {
  appointment: Appointment
  onClick: () => void
  onCheckIn: () => void
  onStart: () => void
  onComplete: () => void
  onCancel: () => void
}

function WorklistCard({ appointment: apt, onClick, onCheckIn, onStart, onComplete, onCancel }: WorklistCardProps) {
  const cfg = STATUS_CONFIG[apt.status] || STATUS_CONFIG['待确认']
  const genderColor = GENDER_COLORS['男']
  const mwlStatus = toDicomMWLStatus(apt.status)
  const mwlCfg = MWL_STATUS_COLORS[mwlStatus]

  // 可用操作
  const allowedNext: MWLTransition[] = []
  if (canTransition(mwlStatus, 'CHECKED_IN')) allowedNext.push('CHECKED_IN')
  if (canTransition(mwlStatus, 'IN_PROGRESS')) allowedNext.push('IN_PROGRESS')
  if (canTransition(mwlStatus, 'COMPLETED')) allowedNext.push('COMPLETED')
  if (canTransition(mwlStatus, 'CANCELLED')) allowedNext.push('CANCELLED')

  return (
    <div style={s.card} onClick={onClick}>
      {/* 头像 */}
      <div style={{ ...s.cardAvatar, background: genderColor }}>
        {apt.patientName.slice(-2)}
      </div>

      {/* 信息 */}
      <div style={s.cardInfo}>
        <div style={s.cardName}>
          {apt.patientName}
          {/* MWL 状态徽章 */}
          <span style={{
            ...s.mwlBadge,
            background: mwlCfg.bg,
            color: mwlCfg.color,
            marginLeft: 8,
            verticalAlign: 'middle',
          }}>
            {DICOM_MWL_STATUS[mwlStatus]}
          </span>
        </div>
        <div style={s.cardMeta}>
          <span style={s.cardMetaItem}>
            <Stethoscope size={11} />
            {apt.examItemName}
          </span>
          <span style={s.cardMetaItem}>
            <User size={11} />
            {apt.doctorName}
          </span>
          <span style={s.cardMetaItem}>
            <Clock size={11} />
            {apt.appointmentTime}
          </span>
          <span style={s.cardMetaItem}>
            <Calendar size={11} />
            {apt.examRoom}
          </span>
        </div>
        {apt.notes && (
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
            备注：{apt.notes}
          </div>
        )}
      </div>

      {/* 快捷操作按钮 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
        {allowedNext.includes('CHECKED_IN') && (
          <button
            style={{ ...s.actionBtn, background: '#dbeafe', color: '#2563eb', fontSize: 11, padding: '4px 10px' }}
            onClick={onCheckIn}
            title="接诊"
          >
            <Send size={11} /> 接诊
          </button>
        )}
        {allowedNext.includes('IN_PROGRESS') && (
          <button
            style={{ ...s.actionBtn, background: '#ede9fe', color: '#7c3aed', fontSize: 11, padding: '4px 10px' }}
            onClick={onStart}
            title="开始检查"
          >
            <Play size={11} /> 开始
          </button>
        )}
        {allowedNext.includes('COMPLETED') && (
          <button
            style={{ ...s.actionBtn, background: '#dcfce7', color: '#16a34a', fontSize: 11, padding: '4px 10px' }}
            onClick={onComplete}
            title="完成检查"
          >
            <Check size={11} /> 完成
          </button>
        )}
        {allowedNext.includes('CANCELLED') && (
          <button
            style={{ ...s.actionBtn, background: '#fee2e2', color: '#dc2626', fontSize: 11, padding: '4px 10px' }}
            onClick={onCancel}
            title="取消"
          >
            <X size={11} /> 取消
          </button>
        )}
      </div>

      {/* 右侧状态 */}
      <div style={s.cardRight}>
        <div style={{ ...s.statusBadge, background: cfg.backgroundColor, color: cfg.color }}>
          {cfg.icon}
          {cfg.label}
        </div>
        <div style={s.queueNum}>
          <span>排队</span>
          <strong style={{ fontSize: 14, color: '#1a3a5c' }}>#{apt.queueNumber}</strong>
        </div>
      </div>

      <ChevronRight size={18} style={s.cardArrow} />
    </div>
  )
}

// ---------- MWL 详情面板 ----------
interface MWLPanelProps {
  appointment: Appointment
  tab: 'detail' | 'hl7' | 'workflow'
  onClose: () => void
  onTabChange: (t: 'detail' | 'hl7' | 'workflow') => void
  onCheckIn: () => void
  onStart: () => void
  onComplete: () => void
  onCancel: () => void
  getExamByAptId: (aptId: string) => EndoscopyExam | undefined
}

function MWLPanel({ appointment: apt, tab, onClose, onTabChange, onCheckIn, onStart, onComplete, onCancel, getExamByAptId }: MWLPanelProps) {
  const mwlStatus = toDicomMWLStatus(apt.status)
  const mwlCfg = MWL_STATUS_COLORS[mwlStatus]
  const exam = getExamByAptId(apt.id)
  const { hl7Log } = useMWL()

  const allowedNext: MWLTransition[] = []
  if (canTransition(mwlStatus, 'CHECKED_IN')) allowedNext.push('CHECKED_IN')
  if (canTransition(mwlStatus, 'IN_PROGRESS')) allowedNext.push('IN_PROGRESS')
  if (canTransition(mwlStatus, 'COMPLETED')) allowedNext.push('COMPLETED')
  if (canTransition(mwlStatus, 'CANCELLED')) allowedNext.push('CANCELLED')

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.panel} onClick={e => e.stopPropagation()}>
        {/* 面板头部 */}
        <div style={s.panelHeader}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#1a3a5c' }}>
              {apt.patientName}
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
              {apt.patientId} · {apt.examItemName}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4 }}
          >
            <X size={20} />
          </button>
        </div>

        {/* 面板标签 */}
        <div style={s.panelTabs}>
          {(['detail', 'workflow', 'hl7'] as const).map(t => (
            <button
              key={t}
              style={{
                ...s.panelTab,
                ...(tab === t ? s.panelTabActive : {}),
              }}
              onClick={() => onTabChange(t)}
            >
              {t === 'detail' && <FileText size={13} />}
              {t === 'workflow' && <ArrowRight size={13} />}
              {t === 'hl7' && <Wifi size={13} />}
              {t === 'detail' ? '详情' : t === 'workflow' ? '流转' : 'HL7'}
            </button>
          ))}
        </div>

        {/* 面板内容 */}
        <div style={s.panelBody}>
          {/* === 详情页 === */}
          {tab === 'detail' && (
            <div>
              <div style={{ background: '#fff', borderRadius: 10, padding: 16, marginBottom: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  基本信息
                </div>
                <InfoRow label="患者ID" value={apt.patientId} />
                <InfoRow label="检查项目" value={apt.examItemName} />
                <InfoRow label="检查医生" value={apt.doctorName} />
                <InfoRow label="检查室" value={apt.examRoom} />
                <InfoRow label="预约时间" value={`${apt.appointmentDate} ${apt.appointmentTime}`} />
                <InfoRow label="排队号" value={`#${apt.queueNumber}`} />
                {apt.notes && <InfoRow label="备注" value={apt.notes} />}
                {apt.reason && <InfoRow label="预约原因" value={apt.reason} />}
              </div>

              {/* DICOM MWL 状态 */}
              <div style={{ background: '#fff', borderRadius: 10, padding: 16, marginBottom: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', borderLeft: `4px solid ${mwlCfg.color}` }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  DICOM MWL 状态
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ ...s.mwlBadge, background: mwlCfg.bg, color: mwlCfg.color }}>
                    {DICOM_MWL_STATUS[mwlStatus]}
                  </span>
                  <span style={{ fontSize: 12, color: '#64748b' }}>DICOM Tag (0020,00068)</span>
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>
                  内部状态: {apt.status}
                </div>
              </div>

              {/* 流转操作 */}
              {allowedNext.length > 0 && (
                <div style={{ background: '#fff', borderRadius: 10, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    流转操作
                  </div>
                  <div style={s.actionRow}>
                    {allowedNext.includes('CHECKED_IN') && (
                      <button style={{ ...s.actionBtn, background: '#2563eb', color: '#fff' }} onClick={onCheckIn}>
                        <Send size={14} /> 接收患者（接诊）
                      </button>
                    )}
                    {allowedNext.includes('IN_PROGRESS') && (
                      <button style={{ ...s.actionBtn, background: '#7c3aed', color: '#fff' }} onClick={onStart}>
                        <Play size={14} /> 开始检查
                      </button>
                    )}
                    {allowedNext.includes('COMPLETED') && (
                      <button style={{ ...s.actionBtn, background: '#16a34a', color: '#fff' }} onClick={onComplete}>
                        <CheckCircle size={14} /> 完成检查
                      </button>
                    )}
                    {allowedNext.includes('CANCELLED') && (
                      <button style={{ ...s.actionBtn, background: '#dc2626', color: '#fff' }} onClick={onCancel}>
                        <X size={14} /> 取消预约
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* === 流转页 === */}
          {tab === 'workflow' && (
            <div>
              {/* MWL 流转可视化 */}
              <div style={s.mwlFlowBar}>
                {MWL_STEPS.map((step, idx) => {
                  const stepIdx = MWL_STEPS.indexOf(mwlStatus)
                  const isDone = idx < stepIdx
                  const isActive = idx === stepIdx
                  const isFuture = idx > stepIdx
                  return (
                    <div key={step} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                      <div style={{ ...s.mwlStep, ...(isDone ? s.mwlStepDone : {}), ...(isActive ? s.mwlStepActive : {}) }}>
                        {isDone ? <CheckCircle size={12} /> : isActive ? <Activity size={12} /> : <Circle size={12} />}
                        <span style={{ fontSize: 9 }}>{step}</span>
                      </div>
                      {idx < MWL_STEPS.length - 1 && (
                        <ChevronRight size={10} style={{ color: isDone ? '#22c55e' : '#e2e8f0', flexShrink: 0 }} />
                      )}
                    </div>
                  )
                })}
              </div>

              {/* 流转历史 */}
              <div style={{ background: '#fff', borderRadius: 10, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  流转历史
                </div>
                {[
                  { time: new Date().toLocaleTimeString('zh-CN'), event: '当前状态', status: mwlStatus, icon: <Activity size={12} /> },
                  { time: new Date(Date.now() - 3600000).toLocaleTimeString('zh-CN'), event: '已确认预约', status: 'SCHEDULED', icon: <CheckCircle size={12} /> },
                  { time: new Date(Date.now() - 7200000).toLocaleTimeString('zh-CN'), event: '预约创建', status: 'SCHEDULED', icon: <Circle size={12} /> },
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
                    <div style={{ color: '#94a3b8', marginTop: 2 }}>{item.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: '#1a3a5c' }}>{item.event}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>{item.time}</div>
                    </div>
                    <span style={{ ...s.mwlBadge, background: MWL_STATUS_COLORS[item.status as MWLTransition]?.bg || '#f8fafc', color: MWL_STATUS_COLORS[item.status as MWLTransition]?.color || '#64748b' }}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* === HL7消息页 === */}
          {tab === 'hl7' && (
            <div>
              {/* HL7 消息统计 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                <div style={{ background: '#fff', borderRadius: 10, padding: '12px 14px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Wifi size={16} color="#22c55e" />
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#1a3a5c' }}>{hl7Log.filter(l => l.status === '发送成功').length}</div>
                    <div style={{ fontSize: 10, color: '#94a3b8' }}>发送成功</div>
                  </div>
                </div>
                <div style={{ background: '#fff', borderRadius: 10, padding: '12px 14px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <WifiOff size={16} color="#ef4444" />
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#1a3a5c' }}>{hl7Log.filter(l => l.status === '发送失败').length}</div>
                    <div style={{ fontSize: 10, color: '#94a3b8' }}>发送失败</div>
                  </div>
                </div>
              </div>

              {/* HL7 日志列表 */}
              <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                HL7 消息日志（最新 {Math.min(hl7Log.length, 20)} 条）
              </div>
              {hl7Log.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8', fontSize: 13 }}>
                  <Wifi size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
                  <div>暂无 HL7 消息记录</div>
                </div>
              ) : (
                hl7Log.slice(0, 20).map(entry => (
                  <div key={entry.id} style={{
                    ...s.hl7LogItem,
                    borderLeftColor: entry.status === '发送成功' ? '#22c55e' : '#ef4444',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{
                          ...s.hl7Badge,
                          background: entry.type === 'ADT' ? '#dbeafe' : entry.type === 'ORM' ? '#fef3c7' : entry.type === 'ORU' ? '#dcfce7' : '#ede9fe',
                          color: entry.type === 'ADT' ? '#2563eb' : entry.type === 'ORM' ? '#d97706' : entry.type === 'ORU' ? '#16a34a' : '#7c3aed',
                        }}>
                          {entry.type}
                        </span>
                        <span style={{ fontSize: 11, color: '#1a3a5c', fontWeight: 600 }}>{entry.patientName}</span>
                        <span style={{ fontSize: 10, color: '#94a3b8' }}>{entry.patientId}</span>
                      </div>
                      <span style={{
                        ...s.hl7Badge,
                        background: entry.status === '发送成功' ? '#dcfce7' : '#fee2e2',
                        color: entry.status === '发送成功' ? '#16a34a' : '#dc2626',
                      }}>
                        {entry.status}
                      </span>
                    </div>
                    <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 4 }}>
                      {entry.timestamp} · {entry.note} · ID: {entry.messageId}
                    </div>
                    <div style={s.hl7Raw}>{entry.raw}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// 信息行
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
      <span style={{ fontSize: 12, color: '#94a3b8', width: 80, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 12, color: '#1a3a5c', fontWeight: 500 }}>{value}</span>
    </div>
  )
}
