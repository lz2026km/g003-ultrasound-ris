// ============================================================
// G003 超声RIS系统 - 今日检查工作台
// 卡片列表 + 状态流程
// ============================================================
import type { LucideIcon } from 'lucide-react';
import { useState, useMemo } from 'react'
import {
  Calendar, Clock, User, Stethoscope, CheckCircle,
  Circle, AlertCircle, ChevronRight, Filter, RefreshCw
} from 'lucide-react'
import { initialAppointments, initialUltrasoundExams } from '../data/initialData'
import type { Appointment, AppointmentStatus } from '../types'

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
  // 颜色
  blue: { backgroundColor: '#eff6ff', color: '#3b82f6' },
  green: { backgroundColor: '#f0fdf4', color: '#22c55e' },
  orange: { backgroundColor: '#fff7ed', color: '#f97316' },
  red: { backgroundColor: '#fef2f2', color: '#ef4444' },
  gray: { backgroundColor: '#f8fafc', color: '#64748b' },
  purple: { backgroundColor: '#f5f3ff', color: '#8b5cf6' },
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

// ============ 今日工作台组件 ============
export default function WorklistPage() {
  const today = '2026-04-29'

  // 今日预约
  const todayAppointments = useMemo(() => {
    return initialAppointments.filter(apt => apt.appointmentDate === today)
  }, [])

  // 已完成的检查
  const todayExams = useMemo(() => {
    return initialUltrasoundExams.filter(exam => exam.examDate === today)
  }, [])

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

  // 总计
  const totalCount = todayAppointments.length
  const completedCount = statusCounts['已完成'] || 0
  const inProgressCount = (statusCounts['检查中'] || 0) + (statusCounts['已确认'] || 0)

  return (
    <div style={s.root}>
      {/* 标题区 */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>今日检查工作台</h1>
          <p style={s.subtitle}>
            <Calendar size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
            {new Date(today).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
            <span style={{ marginLeft: 12, color: '#94a3b8' }}>
              共 <strong style={{ color: '#1a3a5c' }}>{totalCount}</strong> 位患者预约
              ，已完成 <strong style={{ color: '#22c55e' }}>{completedCount}</strong> 例
            </span>
          </p>
        </div>
        <div style={s.headerRight}>
          <button style={{ ...s.refreshBtn, minHeight: 44, padding: '8px 16px' }}>
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
          icon={User}
          iconBg={s.purple.backgroundColor as string}
          iconColor={s.purple.color as string}
          value={statusCounts['待确认'] || 0}
          label="待确认"
        />
      </div>

      {/* 筛选栏 */}
      <div style={s.filterBar}>
        <span style={s.filterLabel}><Filter size={13} /> 状态筛选：</span>
        {['全部', '待确认', '已确认', '检查中', '已完成'].map(status => (
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
            <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 4 }}>
              {filterStatus === '全部' ? '请检查排班或日期是否正确' : '可切换上方状态筛选查看其他预约'}
            </div>
            <div style={{ fontSize: 12, color: '#cbd5e1', marginTop: 16 }}>
              共 {todayAppointments.length} 条预约记录
            </div>
          </div>
        ) : (
          filteredAppointments.map((apt) => (
            <WorklistCard key={apt.id} appointment={apt} />
          ))
        )}
      </div>
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
}

function WorklistCard({ appointment }: WorklistCardProps) {
  const cfg = STATUS_CONFIG[appointment.status] || STATUS_CONFIG['待确认']
  const genderColor = GENDER_COLORS[appointment.patientId.startsWith('P00') && parseInt(appointment.patientId.slice(3)) % 2 === 0 ? '女' : '男']

  // 获取关联检查信息
  const relatedExam = initialUltrasoundExams.find(ex => ex.appointmentId === appointment.id)

  return (
    <div style={s.card}>
      {/* 头像 */}
      <div style={{ ...s.cardAvatar, background: genderColor }}>
        {appointment.patientName.slice(-2)}
      </div>

      {/* 信息 */}
      <div style={s.cardInfo}>
        <div style={s.cardName}>{appointment.patientName}</div>
        <div style={s.cardMeta}>
          <span style={s.cardMetaItem}>
            <Stethoscope size={11} />
            {appointment.examItemName}
          </span>
          <span style={s.cardMetaItem}>
            <User size={11} />
            {appointment.doctorName}
          </span>
          <span style={s.cardMetaItem}>
            <Clock size={11} />
            {appointment.appointmentTime}
          </span>
          <span style={s.cardMetaItem}>
            <Calendar size={11} />
            {appointment.examRoom}
          </span>
        </div>
        {appointment.notes && (
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
            备注：{appointment.notes}
          </div>
        )}
        {relatedExam && (
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <CheckCircle size={11} color={s.green.color} />
            已完成 · {relatedExam.imageCount}张图 · 活检{relatedExam.biopsyCount}块
          </div>
        )}
      </div>

      {/* 右侧 */}
      <div style={s.cardRight}>
        <div style={{ ...s.statusBadge, background: cfg.backgroundColor, color: cfg.color }}>
          {cfg.icon}
          {cfg.label}
        </div>
        <div style={s.queueNum}>
          <span>排队</span>
          <strong style={{ fontSize: 14, color: '#1a3a5c' }}>#{appointment.queueNumber}</strong>
        </div>
      </div>

      <ChevronRight size={18} style={s.cardArrow} />
    </div>
  )
}
