// @ts-nocheck
// ============================================================
// G003 USRIS系统 - 检查执行工作台（大幅增强版）
// 包含：检查执行全流程管理、检查室管理、图像采集、医嘱管理、检查小结
// ============================================================
import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Mic, User, Clock, Camera, AlertTriangle, CheckCircle,
  XCircle, Play, Square, Volume2, Bell, Stethoscope,
  Activity, FileText, RefreshCw, ShieldCheck, Video,
  Footprints, Image as ImageIcon, CheckSquare, Square as SquareOutline,
  AlertCircle, ClipboardList, Save, RotateCcw, Timer,
  Radio, DoorOpen, SprayCan, Settings, ChevronRight,
  Eye, ThumbsUp, ThumbsDown, Copy, X
} from 'lucide-react'
import { initialAppointments, initialUltrasoundExams, initialExamRooms } from '../data/initialData'
import type { EndoscopyExam } from '../types'

// ---------- 类型定义 ----------
type ExamStatus = '待检查' | '已接诊' | '检查准备中' | '检查中' | '复苏中' | '报告待写' | '已完成' | '已取消'
type RoomStatus = '空闲' | '使用中' | '清洁中'
type ImageQuality = '清晰' | '模糊' | '重复'
type EquipmentStatus = '空闲' | '使用中' | '维护中' | '故障'
type ExamPhase = '预约' | '候诊' | '入室' | '麻醉' | '检查' | '复苏' | '报告' | '离院'

interface Equipment {
  id: string
  name: string
  type: '主机' | '镜体' | '光源' | '显示器' | ' recorder' | '附件'
  status: EquipmentStatus
  assignedTo?: string
  room?: string
  lastMaintenance: string
  nextMaintenance: string
  usageCount: number
}

interface QualityScore {
  dimension: '图像质量' | '操作规范' | '镇静评估' | '时间管理' | '沟通协作'
  score: number
  maxScore: number
  weight: number
  remark: string
}

interface QualityRating {
  overall: number
  dimensions: QualityScore[]
  grade: 'A' | 'B' | 'C' | 'D'
  reviewer: string
  reviewedAt: Date
}

interface ExamWorkflow extends EndoscopyExam {
  statusHistory: { status: ExamStatus; enterTime: Date }[]
  currentStatusEnterTime: Date
  examStartTime: Date | null
  examEndTime: Date | null
}

interface CapturedImage {
  id: string
  timestamp: Date
  quality: ImageQuality
  thumbnail: string
}

interface OrderItem {
  id: string
  name: string
  completed: boolean
  category: '麻醉' | '镇静' | '预防用药' | '其他'
}

// ---------- 样式 ----------
const s: Record<string, React.CSSProperties> = {
  root: { padding: 0 },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 20, fontWeight: 700, color: '#1a3a5c', margin: 0 },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 4 },
  headerActions: { display: 'flex', gap: 12, alignItems: 'center' },

  // 检查室管理
  roomSection: {
    background: '#fff', borderRadius: 14, padding: 16, marginBottom: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  roomSectionTitle: {
    fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 12,
    display: 'flex', alignItems: 'center', gap: 6,
  },
  roomGrid: {
    display: 'flex', gap: 10, flexWrap: 'wrap',
  },
  roomCard: {
    padding: '10px 16px', borderRadius: 10, border: '2px solid #e2e8f0',
    background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 500,
    color: '#64748b', transition: 'all 0.15s', display: 'flex',
    alignItems: 'center', gap: 8, minWidth: 140,
  },
  roomCardActive: {
    border: '2px solid #3b82f6',
    background: '#eff6ff', color: '#3b82f6', fontWeight: 600,
  },
  roomStatusDot: {
    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
  },
  roomBadge: {
    fontSize: 11, padding: '2px 6px', borderRadius: 8, fontWeight: 500,
    marginLeft: 'auto',
  },

  // 主布局
  mainGrid: {
    display: 'grid', gridTemplateColumns: '1fr 420px', gap: 20,
  },
  leftColumn: { display: 'flex', flexDirection: 'column', gap: 16 },
  rightColumn: { display: 'flex', flexDirection: 'column', gap: 16 },

  // 工作流状态机
  workflowPanel: {
    background: '#fff', borderRadius: 14, padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  workflowTitle: {
    fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 16,
    display: 'flex', alignItems: 'center', gap: 6,
  },
  workflowSteps: {
    display: 'flex', alignItems: 'center', gap: 0, marginBottom: 16,
    overflowX: 'auto', paddingBottom: 4,
  },
  workflowStep: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    minWidth: 80, position: 'relative',
  },
  workflowStepCircle: {
    width: 36, height: 36, borderRadius: '50%', border: '2px solid #e2e8f0',
    background: '#fff', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: 12, fontWeight: 600, color: '#94a3b8',
    zIndex: 1,
  },
  workflowStepCircleActive: {
    border: '2px solid #3b82f6', background: '#3b82f6', color: '#fff',
  },
  workflowStepCircleDone: {
    border: '2px solid #22c55e', background: '#22c55e', color: '#fff',
  },
  workflowStepLabel: {
    fontSize: 11, color: '#94a3b8', marginTop: 6, textAlign: 'center',
    whiteSpace: 'nowrap',
  },
  workflowStepLabelActive: { color: '#3b82f6', fontWeight: 600 },
  workflowStepLabelDone: { color: '#22c55e' },
  workflowConnector: {
    flex: 1, height: 2, background: '#e2e8f0', minWidth: 20,
  },
  workflowConnectorDone: { background: '#22c55e' },

  // 时间轴
  timeline: {
    display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12,
    padding: '12px 14px', background: '#f8fafc', borderRadius: 10,
    border: '1px solid #e2e8f0',
  },
  timelineItem: {
    display: 'flex', alignItems: 'center', gap: 10, fontSize: 12,
  },
  timelineDot: {
    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
  },
  timelineTime: { color: '#64748b', minWidth: 52 },
  timelineStatus: { color: '#1a3a5c', fontWeight: 500 },
  timelineDuration: { color: '#94a3b8', marginLeft: 'auto' },

  // 录制指示器
  recordingIndicator: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
    background: '#fef2f2', borderRadius: 20, border: '1px solid #fecaca',
  },
  recordingDot: {
    width: 8, height: 8, borderRadius: '50%', background: '#ef4444',
  },
  recordingText: { fontSize: 12, color: '#ef4444', fontWeight: 600 },
  recordingTime: { fontSize: 12, color: '#ef4444', fontFamily: 'monospace' },

  // 当前患者卡片
  currentPatientCard: {
    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
    border: '2px solid #3b82f6', borderRadius: 12, padding: 16,
  },
  patientHeader: {
    display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10,
  },
  patientAvatar: {
    width: 44, height: 44, borderRadius: 10, background: '#3b82f6',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontSize: 18, fontWeight: 700,
  },
  patientInfo: { flex: 1 },
  patientName: { fontSize: 16, fontWeight: 700, color: '#1e40af' },
  patientMeta: { fontSize: 12, color: '#3b82f6', marginTop: 2 },
  patientTags: { display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 },
  patientTag: {
    fontSize: 11, padding: '2px 8px', borderRadius: 20, fontWeight: 500,
    background: 'rgba(59,130,246,0.1)', color: '#3b82f6',
  },

  // 检查中状态卡片
  examActiveCard: {
    border: '1.5px solid #e2e8f0', borderRadius: 10, padding: 14,
    background: '#fff',
  },
  examActiveHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 10,
  },
  examActiveTitle: { fontSize: 14, fontWeight: 600, color: '#1a3a5c' },
  examActiveBadge: {
    fontSize: 11, padding: '3px 8px', borderRadius: 20, fontWeight: 600,
  },

  // 操作按钮行
  actionRow: { display: 'flex', gap: 8, marginTop: 12 },
  actionRowWrap: { display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' as const },

  // 叫号/等待面板
  callPanel: {
    background: '#fff', borderRadius: 14, padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', textAlign: 'center' as const,
  },
  callPanelTitle: {
    fontSize: 14, fontWeight: 600, color: '#64748b', marginBottom: 14,
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  currentPatient: {
    padding: '20px 16px', borderRadius: 12,
    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
    border: '2px solid #3b82f6', marginBottom: 14,
  },
  currentPatientNone: {
    padding: '20px 16px', borderRadius: 12,
    background: '#f8fafc', border: '2px dashed #cbd5e1', marginBottom: 14,
  },
  queueNumber: {
    fontSize: 42, fontWeight: 800, color: '#1e40af', lineHeight: 1,
  },
  patientNameLarge: {
    fontSize: 20, fontWeight: 700, color: '#1e40af', marginTop: 6,
  },
  examType: { fontSize: 14, color: '#3b82f6', marginTop: 4, fontWeight: 500 },
  callActions: {
    display: 'flex', gap: 8, justifyContent: 'center', marginTop: 14,
    flexWrap: 'wrap',
  },

  // 等待队列
  queuePanel: {
    background: '#fff', borderRadius: 14, padding: 18,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  queueTitle: {
    fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 12,
    display: 'flex', alignItems: 'center', gap: 6,
  },
  queueCount: {
    background: '#f1f5f9', borderRadius: 10, padding: '2px 8px',
    fontSize: 12, color: '#64748b', fontWeight: 500,
  },
  queueItem: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
    borderRadius: 8, marginBottom: 6, cursor: 'pointer', transition: 'background 0.12s',
    border: '1px solid transparent',
  },
  queueItemActive: { background: '#eff6ff', border: '1px solid #bfdbfe' },
  queueNumberBadge: {
    width: 32, height: 32, borderRadius: 8, display: 'flex',
    alignItems: 'center', justifyContent: 'center', fontSize: 13,
    fontWeight: 700, flexShrink: 0,
  },
  queueInfo: { flex: 1, minWidth: 0 },
  queueName: { fontSize: 13, fontWeight: 600, color: '#1a3a5c' },
  queueMeta: { fontSize: 11, color: '#94a3b8', marginTop: 1 },
  queueStatus: {
    fontSize: 10, padding: '2px 7px', borderRadius: 20, fontWeight: 500,
    flexShrink: 0,
  },

  // 图像采集
  imageCapturePanel: {
    background: '#fff', borderRadius: 14, padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  imageCaptureTitle: {
    fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 14,
    display: 'flex', alignItems: 'center', gap: 6,
  },
  imageGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 12,
  },
  imageThumb: {
    aspectRatio: '4/3', borderRadius: 8, border: '1.5px solid #e2e8f0',
    overflow: 'hidden', position: 'relative', cursor: 'pointer',
    background: '#f8fafc', display: 'flex', alignItems: 'center',
    justifyContent: 'center',
  },
  imageThumbActive: { border: '1.5px solid #3b82f6' },
  imageThumbImg: {
    width: '100%', height: '100%', objectFit: 'cover' as const,
  },
  imageThumbPlaceholder: {
    color: '#cbd5e1', fontSize: 20,
  },
  imageQualityBadge: {
    position: 'absolute', bottom: 2, right: 2, fontSize: 9,
    padding: '1px 4px', borderRadius: 4, fontWeight: 600,
  },
  imageQualityClear: { background: '#dcfce7', color: '#16a34a' },
  imageQualityBlur: { background: '#fef9c3', color: '#ca8a04' },
  imageQualityDup: { background: '#e0e7ff', color: '#4338ca' },
  imageThumbDelete: {
    position: 'absolute', top: 2, right: 2, width: 18, height: 18,
    borderRadius: '50%', background: 'rgba(0,0,0,0.5)', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', fontSize: 10,
  },
  imageCaptureActions: { display: 'flex', gap: 8 },
  imageCount: {
    fontSize: 12, color: '#64748b', textAlign: 'right' as const, marginTop: 8,
  },

  // 快捷键提示
  shortcutHint: {
    fontSize: 11, color: '#94a3b8', textAlign: 'center' as const, marginTop: 8,
  },
  shortcutKey: {
    background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 4,
    padding: '1px 5px', fontFamily: 'monospace', fontSize: 10,
  },

  // 医嘱面板
  orderPanel: {
    background: '#fff', borderRadius: 14, padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  orderTitle: {
    fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 14,
    display: 'flex', alignItems: 'center', gap: 6,
  },
  orderCategory: { fontSize: 11, color: '#94a3b8', marginTop: 12, marginBottom: 6 },
  orderItem: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
    borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0',
    marginBottom: 6, cursor: 'pointer', transition: 'all 0.12s',
  },
  orderItemDone: {
    background: '#f0fdf4', border: '1px solid #bbf7d0',
  },
  orderItemText: { flex: 1, fontSize: 13, color: '#1a3a5c' },
  orderItemDoneText: { textDecoration: 'line-through', color: '#94a3b8' },
  orderItemIcon: { flexShrink: 0 },

  // 检查小结
  summaryPanel: {
    background: '#fff', borderRadius: 14, padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  summaryTitle: {
    fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 14,
    display: 'flex', alignItems: 'center', gap: 6,
  },
  summaryTextarea: {
    width: '100%', minHeight: 80, border: '1px solid #e2e8f0', borderRadius: 10,
    padding: '10px 12px', fontSize: 13, color: '#1a3a5c', resize: 'vertical' as const,
    fontFamily: 'inherit', outline: 'none', transition: 'border 0.15s',
    boxSizing: 'border-box' as const,
  },
  complicationRow: { display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' as const },
  complicationLabel: { fontSize: 13, color: '#64748b', marginTop: 4 },
  complicationOption: {
    padding: '5px 12px', borderRadius: 20, border: '1.5px solid #e2e8f0',
    background: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 500,
    color: '#64748b', transition: 'all 0.12s',
  },
  complicationOptionActive: {
    border: '1.5px solid #3b82f6',
    background: '#eff6ff', color: '#3b82f6', fontWeight: 600,
  },
  complicationOptionDanger: {
    border: '1.5px solid #ef4444',
    background: '#fef2f2', color: '#ef4444', fontWeight: 600,
  },

  // 质控面板
  qcPanel: {
    background: '#fff', borderRadius: 14, padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  qcTitle: {
    fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 14,
    display: 'flex', alignItems: 'center', gap: 6,
  },
  qcItem: {
    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
    borderRadius: 10, marginBottom: 8, border: '1px solid #e2e8f0',
  },
  qcIconWrap: {
    width: 36, height: 36, borderRadius: 10, display: 'flex',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  qcInfo: { flex: 1 },
  qcLabel: { fontSize: 12, color: '#64748b', fontWeight: 500 },
  qcValue: { fontSize: 15, fontWeight: 700, color: '#1a3a5c', marginTop: 2 },
  qcRequirement: { fontSize: 11, color: '#94a3b8', marginTop: 1 },
  qcProgress: {
    height: 5, borderRadius: 3, background: '#f1f5f9', marginTop: 6, overflow: 'hidden',
  },
  qcProgressFill: { height: '100%', borderRadius: 3, transition: 'width 0.3s' },
  qcBadge: {
    fontSize: 11, padding: '3px 8px', borderRadius: 20, fontWeight: 600,
    flexShrink: 0,
  },

  // 按钮
  btn: {
    padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
    fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center',
    gap: 5, transition: 'all 0.15s',
  },
  btnPrimary: { background: '#3b82f6', color: '#fff' },
  btnSuccess: { background: '#22c55e', color: '#fff' },
  btnWarning: { background: '#f59e0b', color: '#fff' },
  btnDanger: { background: '#ef4444', color: '#fff' },
  btnOutline: { background: '#fff', color: '#3b82f6', border: '1.5px solid #3b82f6' },
  btnGhost: { background: '#f1f5f9', color: '#64748b' },
  btnSm: { padding: '5px 10px', fontSize: 11 },

  // 空状态
  emptyState: {
    textAlign: 'center', padding: '24px 16px', color: '#94a3b8', fontSize: 13,
  },
  emptyStateIcon: { marginBottom: 8 },

  // 弹窗遮罩
  modalOverlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.4)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  },
  modal: {
    background: '#fff', borderRadius: 16, padding: 24, minWidth: 400,
    maxWidth: 500, boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
  },
  modalTitle: { fontSize: 16, fontWeight: 700, color: '#1a3a5c', marginBottom: 16 },
  modalRow: { display: 'flex', gap: 10, marginBottom: 12 },
  modalInfo: { fontSize: 13, color: '#64748b', marginBottom: 8, lineHeight: 1.6 },
  modalActions: { display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 },

  // 检查室选择器
  roomSelector: {
    display: 'flex', gap: 8, flexWrap: 'wrap' as const, marginBottom: 8,
  },
  roomBtn: {
    padding: '6px 14px', borderRadius: 20, border: '1.5px solid #e2e8f0',
    background: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 500,
    color: '#64748b', transition: 'all 0.15s',
  },
  roomBtnActive: {
    border: '1.5px solid #3b82f6',
    background: '#eff6ff', color: '#3b82f6', fontWeight: 600,
  },

  // 左侧副标题
  sectionSubtitle: { fontSize: 11, color: '#94a3b8', marginBottom: 10 },

  // 实时计时
  timerDisplay: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
    background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0',
  },
  timerLabel: { fontSize: 11, color: '#64748b' },
  timerValue: { fontSize: 15, fontWeight: 700, color: '#1a3a5c', fontFamily: 'monospace' },

  // 患者详情卡
  patientDetailCard: {
    background: '#f8fafc', borderRadius: 10, padding: '10px 12px',
    border: '1px solid #e2e8f0', marginTop: 10,
  },
  patientDetailRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '3px 0', fontSize: 12,
  },
  patientDetailLabel: { color: '#94a3b8' },
  patientDetailValue: { color: '#1a3a5c', fontWeight: 500 },

  // 状态机进度
  workflowProgress: {
    display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10,
  },
  workflowProgressItem: {
    flex: 1, height: 4, borderRadius: 2, background: '#e2e8f0',
  },
  workflowProgressItemActive: { background: '#3b82f6' },
  workflowProgressItemDone: { background: '#22c55e' },

  // ===== 新增：设备分配面板 =====
  equipmentPanel: {
    background: '#fff', borderRadius: 14, padding: 18,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  equipmentTitle: {
    fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 14,
    display: 'flex', alignItems: 'center', gap: 6,
  },
  equipmentGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8,
  },
  equipmentCard: {
    padding: '10px 12px', borderRadius: 10, border: '1px solid #e2e8f0',
    background: '#f8fafc', cursor: 'pointer', transition: 'all 0.15s',
  },
  equipmentCardActive: {
    border: '1.5px solid #3b82f6',
    background: '#eff6ff',
  },
  equipmentCardWarning: {
    border: '1.5px solid #f59e0b',
    background: '#fff7ed',
  },
  equipmentName: {
    fontSize: 12, fontWeight: 600, color: '#1a3a5c', marginBottom: 4,
  },
  equipmentMeta: {
    fontSize: 10, color: '#94a3b8', marginBottom: 4,
  },
  equipmentUsage: {
    fontSize: 10, color: '#64748b', marginTop: 2,
  },
  equipmentBadge: {
    fontSize: 10, padding: '1px 6px', borderRadius: 8, fontWeight: 500,
    marginTop: 4, display: 'inline-block',
  },
  equipmentAssignRow: {
    display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' as const,
  },
  equipmentAssignBtn: {
    padding: '3px 8px', borderRadius: 6, border: '1px solid #e2e8f0',
    background: '#fff', cursor: 'pointer', fontSize: 10, color: '#64748b',
    transition: 'all 0.12s',
  },
  equipmentAssignBtnActive: {
    border: '1px solid #3b82f6',
    background: '#eff6ff', color: '#3b82f6',
  },

  // ===== 新增：质量评分面板 =====
  qualityScorePanel: {
    background: '#fff', borderRadius: 14, padding: 18,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  qualityScoreTitle: {
    fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 14,
    display: 'flex', alignItems: 'center', gap: 6,
  },
  qualityScoreOverall: {
    display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14,
    padding: '12px 14px', borderRadius: 10, background: '#f8fafc',
    border: '1px solid #e2e8f0',
  },
  qualityScoreCircle: {
    width: 52, height: 52, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 18, fontWeight: 800, flexShrink: 0,
  },
  qualityScoreGrade: {
    fontSize: 28, fontWeight: 900, marginRight: 8,
  },
  qualityScoreLabel: {
    fontSize: 11, color: '#94a3b8', marginTop: 2,
  },
  qualityScoreDimensions: {
    display: 'flex', flexDirection: 'column', gap: 8,
  },
  qualityScoreDimItem: {
    display: 'flex', alignItems: 'center', gap: 10,
  },
  qualityScoreDimLabel: {
    fontSize: 11, color: '#64748b', minWidth: 56,
  },
  qualityScoreBar: {
    flex: 1, height: 6, borderRadius: 3, background: '#f1f5f9',
    overflow: 'hidden',
  },
  qualityScoreBarFill: {
    height: '100%', borderRadius: 3, transition: 'width 0.3s',
  },
  qualityScoreDimScore: {
    fontSize: 12, fontWeight: 700, color: '#1a3a5c', minWidth: 28,
    textAlign: 'right' as const,
  },
  qualityScoreActions: {
    display: 'flex', gap: 8, marginTop: 12,
  },

  // ===== 新增：检查室状态看板 =====
  roomStatusBoard: {
    background: '#fff', borderRadius: 14, padding: 18,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  roomStatusBoardTitle: {
    fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 14,
    display: 'flex', alignItems: 'center', gap: 6,
  },
  roomStatusBoardStats: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 14,
  },
  roomStatusStatCard: {
    padding: '10px 12px', borderRadius: 10, textAlign: 'center' as const,
    border: '1px solid #e2e8f0',
  },
  roomStatusStatValue: {
    fontSize: 22, fontWeight: 800, color: '#1a3a5c', lineHeight: 1.2,
  },
  roomStatusStatLabel: {
    fontSize: 10, color: '#94a3b8', marginTop: 4,
  },
  roomStatusBoardList: {
    display: 'flex', flexDirection: 'column', gap: 6,
  },
  roomStatusBoardItem: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
    borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0',
  },
  roomStatusBoardItemDot: {
    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
  },
  roomStatusBoardItemName: {
    fontSize: 12, fontWeight: 600, color: '#1a3a5c', flex: 1,
  },
  roomStatusBoardItemPatient: {
    fontSize: 11, color: '#64748b',
  },
  roomStatusBoardItemTime: {
    fontSize: 10, color: '#94a3b8',
  },

  // ===== 新增：详细流程时间轴 =====
  timelinePhase: {
    display: 'flex', flexDirection: 'column', gap: 4, marginTop: 12,
  },
  timelinePhaseItem: {
    display: 'flex', alignItems: 'flex-start', gap: 10, padding: '6px 0',
    position: 'relative' as const,
  },
  timelinePhaseMarker: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    width: 24, flexShrink: 0,
  },
  timelinePhaseDot: {
    width: 10, height: 10, borderRadius: '50%', border: '2px solid',
    background: '#fff', zIndex: 1,
  },
  timelinePhaseLine: {
    width: 2, flex: 1, background: '#e2e8f0', minHeight: 20,
  },
  timelinePhaseContent: {
    flex: 1, paddingBottom: 8,
  },
  timelinePhaseLabel: {
    fontSize: 12, fontWeight: 600, color: '#1a3a5c',
  },
  timelinePhaseTime: {
    fontSize: 10, color: '#94a3b8', marginTop: 2,
  },
  timelinePhaseDuration: {
    fontSize: 10, color: '#64748b', marginTop: 2,
  },
}

// ---------- 颜色常量 ----------
const COLORS = {
  blue: { bg: '#eff6ff', color: '#3b82f6', border: '#bfdbfe' },
  green: { bg: '#f0fdf4', color: '#22c55e', border: '#bbf7d0' },
  orange: { bg: '#fff7ed', color: '#f97316', border: '#fed7aa' },
  red: { bg: '#fef2f2', color: '#ef4444', border: '#fecaca' },
  purple: { bg: '#f5f3ff', color: '#8b5cf6', border: '#ddd6fe' },
  gray: { bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' },
  yellow: { bg: '#fef9c3', color: '#ca8a04', border: '#fde047' },
  indigo: { bg: '#e0e7ff', color: '#4338ca', border: '#a5b4fc' },
}

// 状态配置
const STATUS_CONFIG: Record<ExamStatus, { label: string; color: { bg: string; color: string; border: string }; order: number }> = {
  '待检查': { label: '待检查', color: COLORS.gray, order: 0 },
  '已接诊': { label: '已接诊', color: COLORS.blue, order: 1 },
  '检查准备中': { label: '准备中', color: COLORS.yellow, order: 2 },
  '检查中': { label: '检查中', color: COLORS.purple, order: 3 },
  '复苏中': { label: '复苏中', color: COLORS.orange, order: 4 },
  '报告待写': { label: '待写报告', color: COLORS.indigo, order: 5 },
  '已完成': { label: '已完成', color: COLORS.green, order: 6 },
  '已取消': { label: '已取消', color: COLORS.gray, order: 7 },
}

const WORKFLOW_ORDER: ExamStatus[] = ['待检查', '已接诊', '检查准备中', '检查中', '复苏中', '报告待写', '已完成', '已取消']

// 房间配置
const ROOMS_CONFIG: { name: string; status: RoomStatus; inUseBy?: string }[] = [
  { name: '检查室1', status: '使用中' },
  { name: '检查室2', status: '空闲' },
  { name: '检查室3', status: '使用中', inUseBy: '李秀英' },
  { name: '支气管镜室', status: '空闲' },
  { name: 'USCP室', status: '清洁中' },
]

// 默认医嘱项
const DEFAULT_ORDERS: Omit<OrderItem, 'id' | 'completed'>[] = [
  { name: '咽部局麻（盐酸利多卡因胶浆）', category: '麻醉' },
  { name: '生命体征监测', category: '麻醉' },
  { name: '吸氧', category: '麻醉' },
  { name: '咪达唑仑 2mg 静脉推注', category: '镇静' },
  { name: '丙泊酚静脉麻醉（视情况）', category: '镇静' },
  { name: '山莨菪碱 10mg 肌注（解痉）', category: '预防用药' },
  { name: '二甲硅油 2ml 口服（消泡）', category: '预防用药' },
  { name: '生理盐水冲洗', category: '其他' },
]

// 质控阈值
const GASTRORAPHY_MIN_PHOTOS = 22
const COLONOSCOPY_MIN_WITHDRAWAL = 6

// 设备初始数据
const INITIAL_EQUIPMENT: Equipment[] = [
  { id: 'EQ-001', name: 'Olympus CV-290', type: '主机', status: '使用中', assignedTo: '检查室1', room: '检查室1', lastMaintenance: '2026-03-15', nextMaintenance: '2026-06-15', usageCount: 142 },
  { id: 'EQ-002', name: 'Olympus GIF-H260', type: '镜体', status: '使用中', assignedTo: '检查室1', room: '检查室1', lastMaintenance: '2026-03-20', nextMaintenance: '2026-05-20', usageCount: 89 },
  { id: 'EQ-003', name: 'Olympus CLV-290SL', type: '光源', status: '空闲', lastMaintenance: '2026-04-01', nextMaintenance: '2026-07-01', usageCount: 56 },
  { id: 'EQ-004', name: 'Sony 24寸显示屏', type: '显示器', status: '使用中', assignedTo: '检查室1', room: '检查室1', lastMaintenance: '2026-02-10', nextMaintenance: '2026-05-10', usageCount: 203 },
  { id: 'EQ-005', name: 'Fujifilm EP-6000', type: '主机', status: '空闲', lastMaintenance: '2026-03-25', nextMaintenance: '2026-06-25', usageCount: 78 },
  { id: 'EQ-006', name: 'Pentax ED34-i10', type: '镜体', status: '维护中', lastMaintenance: '2026-04-10', nextMaintenance: '2026-04-28', usageCount: 112 },
  { id: 'EQ-007', name: 'ERBE ICC200', type: '主机', status: '使用中', assignedTo: '检查室3', room: '检查室3', lastMaintenance: '2026-03-05', nextMaintenance: '2026-06-05', usageCount: 95 },
  { id: 'EQ-008', name: '黑光高清 recorder', type: 'recorder', status: '空闲', lastMaintenance: '2026-04-15', nextMaintenance: '2026-07-15', usageCount: 34 },
  { id: 'EQ-009', name: '圈套器/止血钳套装', type: '附件', status: '使用中', assignedTo: '检查室2', room: '检查室2', lastMaintenance: '2026-04-18', nextMaintenance: '2026-05-18', usageCount: 67 },
]

// 质量评分维度配置
const QUALITY_DIMENSIONS: Omit<QualityScore, 'score' | 'remark'>[] = [
  { dimension: '图像质量', maxScore: 10, weight: 0.3 },
  { dimension: '操作规范', maxScore: 10, weight: 0.25 },
  { dimension: '镇静评估', maxScore: 10, weight: 0.2 },
  { dimension: '时间管理', maxScore: 10, weight: 0.15 },
  { dimension: '沟通协作', maxScore: 10, weight: 0.1 },
]

// 流程阶段配置
const EXAM_PHASES: { phase: ExamPhase; label: string; icon: string }[] = [
  { phase: '预约', label: '预约登记', icon: '📋' },
  { phase: '候诊', label: '候诊等待', icon: '⏳' },
  { phase: '入室', label: '进入诊室', icon: '🚪' },
  { phase: '麻醉', label: '麻醉/镇静', icon: '💉' },
  { phase: '检查', label: 'US检查', icon: '🔍' },
  { phase: '复苏', label: '术后复苏', icon: '🛏️' },
  { phase: '报告', label: '报告书写', icon: '📝' },
  { phase: '离院', label: '患者离院', icon: '🏥' },
]

// ============ ExamPage 组件 ============
export default function ExamPage() {
  // 状态
  const [selectedRoom, setSelectedRoom] = useState('检查室1')
  const [roomStatuses, setRoomStatuses] = useState<Record<string, RoomStatus>>(
    Object.fromEntries(ROOMS_CONFIG.map(r => [r.name, r.status]))
  )
  const [currentCall, setCurrentCall] = useState<typeof appointments[0] | null>(null)
  const [calling, setCalling] = useState(false)

  // 当前检查工作流
  const [activeExam, setActiveExam] = useState<ExamWorkflow | null>(null)

  // 实时数据
  const [livePhotoCount, setLivePhotoCount] = useState(0)
  const [liveWithdrawalTime, setLiveWithdrawalTime] = useState(0)
  const [examElapsedSeconds, setExamElapsedSeconds] = useState(0)
  const [isRecording, setIsRecording] = useState(false)

  // 采集图像
  const [capturedImages, setCapturedImages] = useState<CapturedImage[]>([])

  // 医嘱
  const [orders, setOrders] = useState<OrderItem[]>(
    DEFAULT_ORDERS.map((o, i) => ({ ...o, id: `order-${i}`, completed: false }))
  )

  // 检查小结
  const [summaryText, setSummaryText] = useState('')
  const [complication, setComplication] = useState<string>('无')

  // 弹窗
  const [showEndExamModal, setShowEndExamModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)

  // ===== 新增：设备分配状态 =====
  const [equipment, setEquipment] = useState<Equipment[]>(INITIAL_EQUIPMENT)
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null)
  const [equipmentFilter, setEquipmentFilter] = useState<EquipmentStatus | '全部'>('全部')

  // ===== 新增：质量评分状态 =====
  const [qualityRating, setQualityRating] = useState<QualityRating | null>(null)
  const [showQualityPanel, setShowQualityPanel] = useState(false)

  // ===== 新增：检查室状态看板 =====
  const [roomStatsExpanded, setRoomStatsExpanded] = useState(true)

  // 计算检查室统计数据
  const roomStats = {
    total: Object.keys(roomStatuses).length,
    idle: Object.values(roomStatuses).filter(s => s === '空闲').length,
    inUse: Object.values(roomStatuses).filter(s => s === '使用中').length,
    cleaning: Object.values(roomStatuses).filter(s => s === '清洁中').length,
  }

  // 计时器
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)

  // 筛选后的数据
  const appointments = initialAppointments.filter(
    (a) => a.appointmentDate === '2026-04-29' && a.examRoom === selectedRoom
  )

  const waitingList = appointments.filter((a) => a.status !== '已完成' && a.status !== '已取消')

  // 叫号
  const handleCall = (apt?: typeof appointments[0]) => {
    const target = apt || appointments.find((a) => a.status !== '已完成' && a.status !== '检查中')
    if (!target) return
    setCurrentCall(target)
    setCalling(true)
    setTimeout(() => setCalling(false), 3000)
  }

  // 接诊（状态机推进）
  const handleAdmit = () => {
    if (!currentCall) return
    const now = new Date()
    const newExam: ExamWorkflow = {
      id: `EX${Date.now()}`,
      appointmentId: currentCall.id,
      patientId: currentCall.patientId,
      patientName: currentCall.patientName,
      gender: currentCall.patientId === 'P001' ? '男' : currentCall.patientId === 'P002' ? '女' : '男',
      age: 50,
      examItemId: currentCall.examItemId,
      examItemName: currentCall.examItemName,
      doctorId: currentCall.doctorId,
      doctorName: currentCall.doctorName,
      nurseId: 'U004',
      nurseName: '赵晓敏',
      examRoom: selectedRoom,
      examDate: '2026-04-29',
      examTime: now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      arrivalTime: now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      startTime: null as unknown as string,
      endTime: null as unknown as string,
      status: '已接诊',
      findings: '',
      biopsyCount: 0,
      anesthesiaMethod: '咽部局麻',
      recommendations: '',
      imageCount: 0,
      statusHistory: [{ status: '已接诊', enterTime: now }],
      currentStatusEnterTime: now,
      examStartTime: null,
      examEndTime: null,
    }
    setActiveExam(newExam)
    setRoomStatuses(prev => ({ ...prev, [selectedRoom]: '使用中' }))
    setOrders(DEFAULT_ORDERS.map((o, i) => ({ ...o, id: `order-${i}`, completed: false })))
    setCapturedImages([])
    setSummaryText('')
    setComplication('无')
    setLivePhotoCount(0)
    setLiveWithdrawalTime(0)
    setExamElapsedSeconds(0)
  }

  // 状态推进
  const advanceWorkflow = (toStatus: ExamStatus) => {
    if (!activeExam) return
    const now = new Date()
    const newHistory = [...activeExam.statusHistory, { status: toStatus, enterTime: now }]
    const updates: Partial<ExamWorkflow> = {
      status: toStatus,
      statusHistory: newHistory,
      currentStatusEnterTime: now,
    }
    if (toStatus === '检查中') {
      updates.examStartTime = now
      setIsRecording(true)
      setExamElapsedSeconds(0)
    }
    if (toStatus === '已完成' || toStatus === '已取消') {
      updates.examEndTime = now
      setIsRecording(false)
    }
    if (toStatus === '已完成') {
      setRoomStatuses(prev => ({ ...prev, [selectedRoom]: '清洁中' }))
    }
    setActiveExam(prev => prev ? { ...prev, ...updates } : null)
  }

  // 结束检查
  const handleEndExam = () => {
    if (!activeExam) return
    const completedExam = {
      ...activeExam,
      status: '已完成' as ExamStatus,
      endTime: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      imageCount: capturedImages.length,
      photoCount: livePhotoCount,
      withdrawalTime: liveWithdrawalTime,
      findings: summaryText,
      complications: complication,
    }
    setActiveExam(completedExam as unknown as ExamWorkflow)
    setShowEndExamModal(false)
    setIsRecording(false)
    if (timerRef.current) clearInterval(timerRef.current)
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current)
  }

  // 取消检查
  const handleCancelExam = () => {
    if (!activeExam) return
    const cancelledExam = {
      ...activeExam,
      status: '已取消' as ExamStatus,
      endTime: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    }
    setActiveExam(cancelledExam as unknown as ExamWorkflow)
    setShowCancelModal(false)
    setIsRecording(false)
    setRoomStatuses(prev => ({ ...prev, [selectedRoom]: '空闲' }))
    if (timerRef.current) clearInterval(timerRef.current)
  }

  // 重置
  const handleReset = () => {
    setActiveExam(null)
    setCurrentCall(null)
    setCapturedImages([])
    setSummaryText('')
    setComplication('无')
    setLivePhotoCount(0)
    setLiveWithdrawalTime(0)
    setExamElapsedSeconds(0)
    setIsRecording(false)
    setOrders(DEFAULT_ORDERS.map((o, i) => ({ ...o, id: `order-${i}`, completed: false })))
    if (timerRef.current) clearInterval(timerRef.current)
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current)
    setRoomStatuses(prev => ({ ...prev, [selectedRoom]: '空闲' }))
  }

  // 实时计时（检查中时）
  useEffect(() => {
    if (activeExam?.status === '检查中') {
      timerRef.current = setInterval(() => {
        setExamElapsedSeconds(s => s + 1)
      }, 1000)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [activeExam?.status])

  // 录制闪烁效果
  useEffect(() => {
    if (isRecording) {
      recordingTimerRef.current = setInterval(() => {
        // just keep recording state
      }, 500)
    }
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current)
    }
  }, [isRecording])

  // 快捷键采集图像（空格键）
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && activeExam?.status === '检查中') {
        e.preventDefault()
        handleCaptureImage()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeExam])

  // 采集图像
  const handleCaptureImage = () => {
    const qualities: ImageQuality[] = ['清晰', '清晰', '清晰', '模糊', '重复']
    const quality = qualities[Math.floor(Math.random() * qualities.length)]
    const newImage: CapturedImage = {
      id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date(),
      quality,
      thumbnail: '',
    }
    setCapturedImages(prev => [...prev, newImage])
    setLivePhotoCount(c => c + 1)
  }

  // 删除图像
  const handleDeleteImage = (id: string) => {
    setCapturedImages(prev => prev.filter(img => img.id !== id))
    setLivePhotoCount(c => Math.max(0, c - 1))
  }

  // 切换医嘱完成状态
  const toggleOrder = (id: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, completed: !o.completed } : o))
  }

  // 格式化时间
  const formatElapsed = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  // 获取状态样式
  const getStatusStyle = (status: ExamStatus) => {
    const cfg = STATUS_CONFIG[status]
    return {
      background: cfg.color.bg,
      color: cfg.color.color,
      border: `1px solid ${cfg.color.border}`,
    }
  }

  // 渲染工作流步骤
  const renderWorkflowSteps = () => {
    const statuses: ExamStatus[] = ['已接诊', '检查准备中', '检查中', '复苏中', '报告待写', '已完成']
    const currentOrder = activeExam ? STATUS_CONFIG[activeExam.status].order : -1

    return (
      <div style={s.workflowSteps}>
        {statuses.map((status, i) => {
          const cfg = STATUS_CONFIG[status]
          const order = cfg.order
          const isDone = order < currentOrder
          const isActive = order === currentOrder
          const isFuture = order > currentOrder

          return (
            <div key={status} style={{ display: 'flex', alignItems: 'center', flex: i < statuses.length - 1 ? 1 : 0 }}>
              <div style={s.workflowStep}>
                <div style={{
                  ...s.workflowStepCircle,
                  ...(isDone ? s.workflowStepCircleDone : {}),
                  ...(isActive ? s.workflowStepCircleActive : {}),
                  ...(isFuture ? { border: '2px solid #e2e8f0', color: '#cbd5e1', background: '#f8fafc' } : {}),
                }}>
                  {isDone ? <CheckCircle size={16} /> : i + 1}
                </div>
                <div style={{
                  ...s.workflowStepLabel,
                  ...(isDone ? s.workflowStepLabelDone : {}),
                  ...(isActive ? s.workflowStepLabelActive : {}),
                }}>
                  {cfg.label}
                </div>
              </div>
              {i < statuses.length - 1 && (
                <div style={{
                  ...s.workflowConnector,
                  ...(isDone ? s.workflowConnectorDone : {}),
                  flex: 1, marginBottom: 20,
                }} />
              )}
            </div>
          )
        })}
      </div>
    )
  }

  // 渲染时间轴
  const renderTimeline = () => {
    if (!activeExam || activeExam.statusHistory.length === 0) return null

    return (
      <div style={s.timeline}>
        {activeExam.statusHistory.map((entry, i) => {
          const cfg = STATUS_CONFIG[entry.status]
          const duration = i < activeExam.statusHistory.length - 1
            ? Math.round((activeExam.statusHistory[i + 1].enterTime.getTime() - entry.enterTime.getTime()) / 1000)
            : null

          return (
            <div key={i} style={s.timelineItem}>
              <div style={{ ...s.timelineDot, background: cfg.color.color }} />
              <span style={s.timelineTime}>
                {entry.enterTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
              <span style={s.timelineStatus}>{cfg.label}</span>
              {duration !== null && (
                <span style={s.timelineDuration}>
                  {duration < 60 ? `${duration}秒` : `${Math.floor(duration / 60)}分${duration % 60 > 0 ? duration % 60 + '秒' : ''}`}
                </span>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  // ===== 新增：详细流程时间轴（阶段级） =====
  const renderPhaseTimeline = () => {
    if (!activeExam) return null

    // 根据当前状态确定活跃阶段
    const statusToPhase: Record<string, ExamPhase> = {
      '待检查': '候诊',
      '已接诊': '入室',
      '检查准备中': '麻醉',
      '检查中': '检查',
      '复苏中': '复苏',
      '报告待写': '报告',
      '已完成': '离院',
      '已取消': '离院',
    }
    const currentPhase = statusToPhase[activeExam.status] || '候诊'
    const currentPhaseIndex = EXAM_PHASES.findIndex(p => p.phase === currentPhase)

    return (
      <div style={s.timelinePhase}>
        {EXAM_PHASES.map((ph, i) => {
          const isDone = i < currentPhaseIndex
          const isActive = i === currentPhaseIndex
          const isFuture = i > currentPhaseIndex
          const phaseColor = isDone ? '#22c55e' : isActive ? '#3b82f6' : '#e2e8f0'

          // 计算该阶段耗时（基于statusHistory推算）
          let phaseDuration = ''
          if (isDone && i < EXAM_PHASES.length - 1) {
            // 估算阶段停留时间
          }

          return (
            <div key={ph.phase} style={s.timelinePhaseItem}>
              <div style={s.timelinePhaseMarker}>
                <div style={{
                  ...s.timelinePhaseDot,
                  border: `2px solid ${phaseColor}`,
                  background: isActive ? phaseColor : '#fff',
                }} />
                {i < EXAM_PHASES.length - 1 && (
                  <div style={{
                    ...s.timelinePhaseLine,
                    background: isDone ? '#22c55e' : '#e2e8f0',
                  }} />
                )}
              </div>
              <div style={s.timelinePhaseContent}>
                <div style={{
                  ...s.timelinePhaseLabel,
                  color: isActive ? '#3b82f6' : isDone ? '#22c55e' : '#94a3b8',
                }}>
                  {ph.icon} {ph.label}
                  {isActive && <span style={{ marginLeft: 6, fontSize: 10, color: '#3b82f6', fontWeight: 600 }}>进行中</span>}
                  {isDone && <span style={{ marginLeft: 6, fontSize: 10, color: '#22c55e' }}>✓</span>}
                </div>
                {isActive && (
                  <div style={s.timelinePhaseTime}>
                    开始于 {activeExam.currentStatusEnterTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                    {' · '}已持续 {formatElapsed(examElapsedSeconds)}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // ===== 新增：检查室状态看板渲染 =====
  const renderRoomStatusBoard = () => {
    return (
      <div style={s.roomStatusBoard}>
        <div style={s.roomStatusBoardTitle}>
          <Activity size={15} color="#1a3a5c" /> 检查室状态看板
          <span style={{ marginLeft: 'auto', fontSize: 11, color: '#94a3b8' }}>
            实时监控
          </span>
        </div>

        {/* 统计卡片 */}
        <div style={s.roomStatusBoardStats}>
          <div style={{ ...s.roomStatusStatCard, background: '#f8fafc' }}>
            <div style={{ ...s.roomStatusStatValue, color: '#64748b' }}>{roomStats.total}</div>
            <div style={s.roomStatusStatLabel}>全部诊室</div>
          </div>
          <div style={{ ...s.roomStatusStatCard, background: '#f0fdf4' }}>
            <div style={{ ...s.roomStatusStatValue, color: '#22c55e' }}>{roomStats.idle}</div>
            <div style={s.roomStatusStatLabel}>空闲</div>
          </div>
          <div style={{ ...s.roomStatusStatCard, background: '#f5f3ff' }}>
            <div style={{ ...s.roomStatusStatValue, color: '#8b5cf6' }}>{roomStats.inUse}</div>
            <div style={s.roomStatusStatLabel}>使用中</div>
          </div>
          <div style={{ ...s.roomStatusStatCard, background: '#fff7ed' }}>
            <div style={{ ...s.roomStatusStatValue, color: '#f97316' }}>{roomStats.cleaning}</div>
            <div style={s.roomStatusStatLabel}>清洁中</div>
          </div>
        </div>

        {/* 诊室列表 */}
        <div style={s.roomStatusBoardList}>
          {ROOMS_CONFIG.map(room => {
            const statusColor = room.status === '空闲' ? '#22c55e'
              : room.status === '使用中' ? '#8b5cf6'
              : '#f97316'
            return (
              <div key={room.name} style={s.roomStatusBoardItem}>
                <div style={{ ...s.roomStatusBoardItemDot, background: statusColor }} />
                <div style={s.roomStatusBoardItemName}>{room.name}</div>
                {room.inUseBy && (
                  <div style={s.roomStatusBoardItemPatient}>👤 {room.inUseBy}</div>
                )}
                <div style={{
                  ...s.equipmentBadge,
                  background: room.status === '空闲' ? '#f0fdf4' : room.status === '使用中' ? '#f5f3ff' : '#fff7ed',
                  color: statusColor,
                }}>
                  {room.status}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ===== 新增：设备分配面板渲染 =====
  const getEquipmentStatusColor = (status: EquipmentStatus) => {
    switch (status) {
      case '空闲': return { bg: '#f0fdf4', color: '#22c55e', border: '#bbf7d0' }
      case '使用中': return { bg: '#f5f3ff', color: '#8b5cf6', border: '#ddd6fe' }
      case '维护中': return { bg: '#fff7ed', color: '#f97316', border: '#fed7aa' }
      case '故障': return { bg: '#fef2f2', color: '#ef4444', border: '#fecaca' }
    }
  }

  const renderEquipmentPanel = () => {
    const filteredEquipment = equipmentFilter === '全部'
      ? equipment
      : equipment.filter(eq => eq.status === equipmentFilter)

    return (
      <div style={s.equipmentPanel}>
        <div style={s.equipmentTitle}>
          <Settings size={15} color="#1a3a5c" /> 设备分配管理
          <span style={{ marginLeft: 'auto', fontSize: 11, color: '#94a3b8' }}>
            {equipment.length} 台设备
          </span>
        </div>

        {/* 过滤器 */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
          {(['全部', '空闲', '使用中', '维护中', '故障'] as const).map(f => (
            <button
              key={f}
              style={{
                ...s.equipmentAssignBtn,
                ...(equipmentFilter === f ? s.equipmentAssignBtnActive : {}),
              }}
              onClick={() => setEquipmentFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        {/* 设备网格 */}
        <div style={s.equipmentGrid}>
          {filteredEquipment.map(eq => {
            const statusColor = getEquipmentStatusColor(eq.status)
            const isSelected = selectedEquipment === eq.id
            const needsMaintenance = eq.nextMaintenance && new Date(eq.nextMaintenance) < new Date('2026-05-15')

            return (
              <div
                key={eq.id}
                style={{
                  ...s.equipmentCard,
                  ...(isSelected ? s.equipmentCardActive : {}),
                  ...(needsMaintenance && eq.status !== '维护中' ? s.equipmentCardWarning : {}),
                }}
                onClick={() => setSelectedEquipment(isSelected ? null : eq.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={s.equipmentName}>{eq.name}</div>
                  <div style={{
                    ...s.equipmentBadge,
                    background: statusColor.bg,
                    color: statusColor.color,
                  }}>
                    {eq.status}
                  </div>
                </div>
                <div style={s.equipmentMeta}>类型：{eq.type}</div>
                {eq.assignedTo && (
                  <div style={s.equipmentMeta}>分配：{eq.assignedTo}</div>
                )}
                <div style={s.equipmentUsage}>使用次数：{eq.usageCount}</div>
                {needsMaintenance && (
                  <div style={{ fontSize: 9, color: '#f97316', marginTop: 4 }}>
                    ⚠ 即将到期维护
                  </div>
                )}

                {/* 点击后显示分配按钮 */}
                {isSelected && (
                  <div style={s.equipmentAssignRow}>
                    {ROOMS_CONFIG.filter(r => r.status === '空闲').map(room => (
                      <button
                        key={room.name}
                        style={{
                          ...s.equipmentAssignBtn,
                          ...(eq.assignedTo === room.name ? s.equipmentAssignBtnActive : {}),
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          setEquipment(prev => prev.map(e => e.id === eq.id ? {
                            ...e, assignedTo: room.name, room: room.name,
                            status: '使用中' as EquipmentStatus
                          } : e))
                        }}
                      >
                        →{room.name}
                      </button>
                    ))}
                    {eq.assignedTo && (
                      <button
                        style={s.equipmentAssignBtn}
                        onClick={(e) => {
                          e.stopPropagation()
                          setEquipment(prev => prev.map(e => e.id === eq.id ? {
                            ...e, assignedTo: undefined, room: undefined,
                            status: '空闲' as EquipmentStatus
                          } : e))
                        }}
                      >
                        释放
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ===== 新增：质量评分面板渲染 =====
  const getGradeConfig = (grade: 'A' | 'B' | 'C' | 'D') => {
    switch (grade) {
      case 'A': return { bg: '#f0fdf4', color: '#22c55e', border: '#bbf7d0', label: '优秀' }
      case 'B': return { bg: '#eff6ff', color: '#3b82f6', border: '#bfdbfe', label: '良好' }
      case 'C': return { bg: '#fff7ed', color: '#f97316', border: '#fed7aa', label: '一般' }
      case 'D': return { bg: '#fef2f2', color: '#ef4444', border: '#fecaca', label: '不合格' }
    }
  }

  const calculateGrade = (overall: number): 'A' | 'B' | 'C' | 'D' => {
    if (overall >= 9) return 'A'
    if (overall >= 7) return 'B'
    if (overall >= 5) return 'C'
    return 'D'
  }

  const renderQualityScorePanel = () => {
    return (
      <div style={s.qualityScorePanel}>
        <div style={s.qualityScoreTitle}>
          <ShieldCheck size={15} color="#1a3a5c" /> 质量评分
          {qualityRating && (
            <span style={{ marginLeft: 'auto', fontSize: 11, color: '#94a3b8' }}>
              审核人：{qualityRating.reviewer}
            </span>
          )}
        </div>

        {qualityRating ? (
          <>
            {/* 总体评分 */}
            <div style={s.qualityScoreOverall}>
              <div style={{
                ...s.qualityScoreCircle,
                background: getGradeConfig(qualityRating.grade).bg,
                color: getGradeConfig(qualityRating.grade).color,
              }}>
                <span style={s.qualityScoreGrade}>{qualityRating.grade}</span>
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#1a3a5c' }}>
                  综合评分：{qualityRating.overall.toFixed(1)}
                  <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 400 }}> / 10</span>
                </div>
                <div style={s.qualityScoreLabel}>
                  {getGradeConfig(qualityRating.grade).label}
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                  审核时间：{qualityRating.reviewedAt.toLocaleString('zh-CN')}
                </div>
              </div>
            </div>

            {/* 各维度评分 */}
            <div style={s.qualityScoreDimensions}>
              {qualityRating.dimensions.map(dim => {
                const pct = (dim.score / dim.maxScore) * 100
                const barColor = pct >= 80 ? '#22c55e' : pct >= 60 ? '#f59e0b' : '#ef4444'
                return (
                  <div key={dim.dimension} style={s.qualityScoreDimItem}>
                    <div style={s.qualityScoreDimLabel}>{dim.dimension}</div>
                    <div style={s.qualityScoreBar}>
                      <div style={{
                        ...s.qualityScoreBarFill,
                        width: `${pct}%`,
                        background: barColor,
                      }} />
                    </div>
                    <div style={{ ...s.qualityScoreDimScore, color: barColor }}>
                      {dim.score}/{dim.maxScore}
                    </div>
                  </div>
                )
              })}
            </div>

            <div style={s.qualityScoreActions}>
              <button
                style={{ ...s.btn, ...s.btnOutline, flex: 1 }}
                onClick={() => {
                  setQualityRating(null)
                  setShowQualityPanel(false)
                }}
              >
                <RotateCcw size={12} /> 重置评分
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>
              为当前检查打分（完成后可用）
            </div>

            {/* 默认模拟评分数据预览 */}
            <div style={s.qualityScoreDimensions}>
              {QUALITY_DIMENSIONS.map(dim => {
                const pct = 75 + Math.random() * 20
                const score = Math.round((pct / 100) * dim.maxScore)
                const barColor = pct >= 80 ? '#22c55e' : pct >= 60 ? '#f59e0b' : '#ef4444'
                return (
                  <div key={dim.dimension} style={s.qualityScoreDimItem}>
                    <div style={s.qualityScoreDimLabel}>{dim.dimension}</div>
                    <div style={s.qualityScoreBar}>
                      <div style={{
                        ...s.qualityScoreBarFill,
                        width: `${pct}%`,
                        background: barColor,
                      }} />
                    </div>
                    <div style={{ ...s.qualityScoreDimScore, color: barColor }}>
                      {score}/{dim.maxScore}
                    </div>
                  </div>
                )
              })}
            </div>

            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 8 }}>
              综合预估：<span style={{ fontWeight: 600, color: '#22c55e' }}>A 级 · 优秀</span>
            </div>

            <div style={s.qualityScoreActions}>
              <button
                style={{ ...s.btn, ...s.btnPrimary, flex: 1 }}
                onClick={() => {
                  // 生成模拟评分
                  const dims = QUALITY_DIMENSIONS.map(d => ({
                    ...d,
                    score: Math.round((0.7 + Math.random() * 0.3) * d.maxScore),
                    remark: '',
                  }))
                  const overall = dims.reduce((sum, d) => sum + (d.score / d.maxScore) * d.weight * 10, 0)
                  const grade = calculateGrade(overall)
                  setQualityRating({
                    overall,
                    dimensions: dims,
                    grade,
                    reviewer: '张主任',
                    reviewedAt: new Date(),
                  })
                }}
                disabled={!activeExam}
              >
                <ShieldCheck size={12} /> 提交评分
              </button>
              <button
                style={{ ...s.btn, ...s.btnGhost, flex: 1 }}
                onClick={() => setShowQualityPanel(!showQualityPanel)}
              >
                {showQualityPanel ? '收起' : '查看详情'}
              </button>
            </div>
          </>
        )}
      </div>
    )
  }

  // 渲染医嘱
  const renderOrders = () => {
    const categories: OrderItem['category'][] = ['麻醉', '镇静', '预防用药', '其他']
    return (
      <div>
        {categories.map(cat => {
          const items = orders.filter(o => o.category === cat)
          if (items.length === 0) return null
          return (
            <div key={cat}>
              <div style={s.orderCategory}>{cat}</div>
              {items.map(item => (
                <div
                  key={item.id}
                  style={{
                    ...s.orderItem,
                    ...(item.completed ? s.orderItemDone : {}),
                  }}
                  onClick={() => toggleOrder(item.id)}
                >
                  <div style={s.orderItemIcon}>
                    {item.completed
                      ? <CheckSquare size={16} color={COLORS.green.color} />
                      : <SquareOutline size={16} color={COLORS.gray.color} />}
                  </div>
                  <span style={{
                    ...s.orderItemText,
                    ...(item.completed ? s.orderItemDoneText : {}),
                  }}>
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          )
        })}
        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 8 }}>
          已完成 {orders.filter(o => o.completed).length}/{orders.length} 项
        </div>
      </div>
    )
  }

  // 获取当前状态描述
  const getCurrentStatusAction = (status: ExamStatus): string => {
    switch (status) {
      case '已接诊': return '护士签到，患者进入诊室'
      case '检查准备中': return '患者准备，麻醉评估'
      case '检查中': return '正在进行US检查'
      case '复苏中': return '检查结束，患者复苏'
      case '报告待写': return '等待书写检查报告'
      case '已完成': return '检查已完成'
      default: return ''
    }
  }

  return (
    <div style={s.root}>
      {/* 标题栏 */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>检查执行工作台</h1>
          <p style={s.subtitle}>智慧消化专科诊疗平台 · 检查执行与质控</p>
        </div>
        <div style={s.headerActions}>
          <button style={{ ...s.btn, ...s.btnGhost }}>
            <RefreshCw size={13} /> 刷新
          </button>
        </div>
      </div>

      {/* 检查室管理栏 */}
      <div style={s.roomSection}>
        <div style={s.roomSectionTitle}>
          <DoorOpen size={15} color="#64748b" /> 今日检查室
        </div>
        <div style={s.roomGrid}>
          {ROOMS_CONFIG.map(room => {
            const statusColor = room.status === '空闲' ? COLORS.green
              : room.status === '使用中' ? COLORS.purple
              : COLORS.orange
            return (
              <div
                key={room.name}
                style={{
                  ...s.roomCard,
                  ...(selectedRoom === room.name ? s.roomCardActive : {}),
                }}
                onClick={() => {
                  setSelectedRoom(room.name)
                  setActiveExam(null)
                  setCurrentCall(null)
                }}
              >
                <div style={{ ...s.roomStatusDot, background: statusColor.color }} />
                <span>{room.name}</span>
                {room.inUseBy && (
                  <span style={{ fontSize: 10, color: selectedRoom === room.name ? '#93c5fd' : '#94a3b8' }}>
                    · {room.inUseBy}
                  </span>
                )}
                <span style={{
                  ...s.roomBadge,
                  background: statusColor.bg,
                  color: statusColor.color,
                }}>
                  {room.status}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ===== 新增：检查室状态看板 ===== */}
      {renderRoomStatusBoard()}

      {/* 主布局 */}
      <div style={s.mainGrid}>
        {/* 左侧 */}
        <div style={s.leftColumn}>
          {/* 工作流状态机 */}
          {activeExam ? (
            <div style={s.workflowPanel}>
              <div style={s.workflowTitle}>
                <Activity size={15} color="#1a3a5c" /> 检查执行流程
                <span style={{
                  marginLeft: 'auto', fontSize: 12, padding: '3px 10px',
                  borderRadius: 20, fontWeight: 600,
                  ...getStatusStyle(activeExam.status),
                }}>
                  {STATUS_CONFIG[activeExam.status].label}
                </span>
              </div>

              {renderWorkflowSteps()}

              {/* 当前状态描述 */}
              <div style={{
                fontSize: 12, color: '#64748b', padding: '8px 12px',
                background: '#f8fafc', borderRadius: 8, marginBottom: 10,
              }}>
                {getCurrentStatusAction(activeExam.status)}
              </div>

              {/* 录制指示器 & 计时 */}
              {(activeExam.status === '检查中' || activeExam.status === '复苏中') && (
                <div style={{ display: 'flex', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                  {isRecording && (
                    <div style={s.recordingIndicator}>
                      <div style={{ ...s.recordingDot, animation: 'pulse 1s infinite' }} />
                      <span style={s.recordingText}>录制中</span>
                      <span style={s.recordingTime}>{formatElapsed(examElapsedSeconds)}</span>
                    </div>
                  )}
                  <div style={s.timerDisplay}>
                    <Timer size={13} color="#64748b" />
                    <span style={s.timerLabel}>检查时长</span>
                    <span style={s.timerValue}>{formatElapsed(examElapsedSeconds)}</span>
                  </div>
                </div>
              )}

              {/* 时间轴 */}
              {renderTimeline()}

              {/* ===== 新增：详细流程阶段时间轴 ===== */}
              <div style={{ marginTop: 12, padding: '10px 12px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>
                  🔄 流程阶段
                </div>
                {renderPhaseTimeline()}
              </div>

              {/* 操作按钮 */}
              <div style={s.actionRowWrap}>
                {activeExam.status === '已接诊' && (
                  <button style={{ ...s.btn, ...s.btnPrimary }} onClick={() => advanceWorkflow('检查准备中')}>
                    <ChevronRight size={13} /> 开始准备
                  </button>
                )}
                {activeExam.status === '检查准备中' && (
                  <button style={{ ...s.btn, ...s.btnPrimary }} onClick={() => advanceWorkflow('检查中')}>
                    <Play size={13} /> 开始检查
                  </button>
                )}
                {activeExam.status === '检查中' && (
                  <>
                    <button style={{ ...s.btn, ...s.btnWarning }} onClick={() => advanceWorkflow('复苏中')}>
                      <Square size={13} /> 检查结束
                    </button>
                    <button style={{ ...s.btn, ...s.btnDanger }} onClick={() => setShowCancelModal(true)}>
                      <XCircle size={13} /> 终止检查
                    </button>
                  </>
                )}
                {activeExam.status === '复苏中' && (
                  <button style={{ ...s.btn, ...s.btnPrimary }} onClick={() => advanceWorkflow('报告待写')}>
                    <FileText size={13} /> 进入报告
                  </button>
                )}
                {activeExam.status === '报告待写' && (
                  <button style={{ ...s.btn, ...s.btnSuccess }} onClick={() => setShowEndExamModal(true)}>
                    <CheckCircle size={13} /> 完成检查
                  </button>
                )}
                {(activeExam.status === '已完成' || activeExam.status === '已取消') && (
                  <button style={{ ...s.btn, ...s.btnGhost }} onClick={handleReset}>
                    <RotateCcw size={13} /> 重置
                  </button>
                )}
              </div>
            </div>
          ) : null}

          {/* 当前叫号 */}
          <div style={s.callPanel}>
            <div style={s.callPanelTitle}>
              <Mic size={15} color="#64748b" /> 当前叫号
            </div>

            {currentCall ? (
              <div style={s.currentPatient}>
                <div style={s.queueNumber}>No.{currentCall.queueNumber}</div>
                <div style={s.patientNameLarge}>{currentCall.patientName}</div>
                <div style={s.examType}>{currentCall.examItemName}</div>
                <div style={{ fontSize: 12, color: '#3b82f6', marginTop: 4 }}>
                  {currentCall.doctorName} · {currentCall.examRoom}
                </div>
              </div>
            ) : (
              <div style={s.currentPatientNone}>
                <Bell size={32} color="#cbd5e1" style={{ marginBottom: 8 }} />
                <div style={{ fontSize: 14, color: '#94a3b8', fontWeight: 500 }}>
                  暂无待检患者
                </div>
                <div style={{ fontSize: 12, color: '#cbd5e1', marginTop: 4 }}>
                  点击"叫号"或选择下方患者
                </div>
              </div>
            )}

            <div style={s.callActions}>
              <button
                style={{ ...s.btn, ...s.btnWarning }}
                onClick={() => handleCall()}
                disabled={calling}
              >
                <Volume2 size={14} /> {calling ? '播放中...' : '叫号'}
              </button>
              {currentCall && !activeExam && (
                <button style={{ ...s.btn, ...s.btnSuccess }} onClick={handleAdmit}>
                  <User size={14} /> 接诊
                </button>
              )}
              {currentCall && (
                <button style={{ ...s.btn, ...s.btnGhost }} onClick={() => setCurrentCall(null)}>
                  跳过
                </button>
              )}
            </div>
          </div>

          {/* 等待队列 */}
          <div style={s.queuePanel}>
            <div style={s.queueTitle}>
              <Clock size={15} color="#1a3a5c" /> 等待队列
              <span style={s.queueCount}>{waitingList.length} 人</span>
            </div>

            {waitingList.length === 0 ? (
              <div style={s.emptyState}>
                <CheckCircle size={28} color="#cbd5e1" style={{ marginBottom: 6 }} />
                <div>今日检查已全部完成</div>
              </div>
            ) : (
              waitingList.slice(0, 6).map((apt) => {
                const statusCfg = STATUS_CONFIG[apt.status as ExamStatus] || COLORS.gray
                return (
                  <div
                    key={apt.id}
                    style={{
                      ...s.queueItem,
                      ...(currentCall?.id === apt.id ? s.queueItemActive : {}),
                    }}
                    onClick={() => !activeExam && handleCall(apt)}
                  >
                    <div style={{
                      ...s.queueNumberBadge,
                      background: statusCfg.color.bg, color: statusCfg.color.color,
                    }}>
                      {apt.queueNumber}
                    </div>
                    <div style={s.queueInfo}>
                      <div style={s.queueName}>{apt.patientName}</div>
                      <div style={s.queueMeta}>
                        {apt.examItemName} · {apt.appointmentTime}
                      </div>
                    </div>
                    <div style={{
                      ...s.queueStatus,
                      background: statusCfg.color.bg, color: statusCfg.color.color,
                    }}>
                      {apt.status}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* 右侧 */}
        <div style={s.rightColumn}>
          {/* 检查中患者信息 */}
          {activeExam && (
            <div style={s.examActiveCard}>
              <div style={s.examActiveHeader}>
                <div style={s.examActiveTitle}>
                  <User size={14} color="#1a3a5c" /> 检查患者
                </div>
                <div style={{
                  ...s.examActiveBadge,
                  ...getStatusStyle(activeExam.status),
                }}>
                  {STATUS_CONFIG[activeExam.status].label}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={s.patientAvatar}>
                  {activeExam.patientName.slice(-2)}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#1a3a5c' }}>
                    {activeExam.patientName}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                    {activeExam.examItemName} · {activeExam.doctorName}
                  </div>
                </div>
              </div>
              <div style={s.patientDetailCard}>
                <div style={s.patientDetailRow}>
                  <span style={s.patientDetailLabel}>性别/年龄</span>
                  <span style={s.patientDetailValue}>{activeExam.gender} / {activeExam.age}岁</span>
                </div>
                <div style={s.patientDetailRow}>
                  <span style={s.patientDetailLabel}>检查室</span>
                  <span style={s.patientDetailValue}>{activeExam.examRoom}</span>
                </div>
                <div style={s.patientDetailRow}>
                  <span style={s.patientDetailLabel}>护士</span>
                  <span style={s.patientDetailValue}>{activeExam.nurseName}</span>
                </div>
                <div style={s.patientDetailRow}>
                  <span style={s.patientDetailLabel}>麻醉</span>
                  <span style={s.patientDetailValue}>{activeExam.anesthesiaMethod}</span>
                </div>
              </div>
            </div>
          )}

          {/* 质控面板 */}
          <div style={s.qcPanel}>
            <div style={s.qcTitle}>
              <ShieldCheck size={15} color="#1a3a5c" /> 质控标准
            </div>

            {/* US质控 */}
            <div style={s.qcItem}>
              <div style={{ ...s.qcIconWrap, background: COLORS.purple.bg }}>
                <Camera size={18} color={COLORS.purple.color} />
              </div>
              <div style={s.qcInfo}>
                <div style={s.qcLabel}>US检查</div>
                <div style={s.qcValue}>≥ {GASTRORAPHY_MIN_PHOTOS} 张</div>
                <div style={s.qcProgress}>
                  <div style={{
                    ...s.qcProgressFill,
                    width: `${Math.min(100, (livePhotoCount / GASTRORAPHY_MIN_PHOTOS) * 100)}%`,
                    background: livePhotoCount >= GASTRORAPHY_MIN_PHOTOS ? '#22c55e' : '#f97316',
                  }} />
                </div>
              </div>
              <div style={{
                ...s.qcBadge,
                background: livePhotoCount >= GASTRORAPHY_MIN_PHOTOS ? COLORS.green.bg : COLORS.orange.bg,
                color: livePhotoCount >= GASTRORAPHY_MIN_PHOTOS ? COLORS.green.color : COLORS.orange.color,
              }}>
                {livePhotoCount >= GASTRORAPHY_MIN_PHOTOS ? '合格' : `${livePhotoCount}/${GASTRORAPHY_MIN_PHOTOS}`}
              </div>
            </div>

            {/* US质控 */}
            <div style={s.qcItem}>
              <div style={{ ...s.qcIconWrap, background: COLORS.orange.bg }}>
                <Clock size={18} color={COLORS.orange.color} />
              </div>
              <div style={s.qcInfo}>
                <div style={s.qcLabel}>US退镜时间</div>
                <div style={s.qcValue}>≥ {COLONOSCOPY_MIN_WITHDRAWAL} 分钟</div>
                <div style={s.qcProgress}>
                  <div style={{
                    ...s.qcProgressFill,
                    width: `${Math.min(100, (liveWithdrawalTime / COLONOSCOPY_MIN_WITHDRAWAL) * 100)}%`,
                    background: liveWithdrawalTime >= COLONOSCOPY_MIN_WITHDRAWAL ? '#22c55e' : '#f97316',
                  }} />
                </div>
              </div>
              <div style={{
                ...s.qcBadge,
                background: liveWithdrawalTime >= COLONOSCOPY_MIN_WITHDRAWAL ? COLORS.green.bg : COLORS.orange.bg,
                color: liveWithdrawalTime >= COLONOSCOPY_MIN_WITHDRAWAL ? COLORS.green.color : COLORS.orange.color,
              }}>
                {liveWithdrawalTime >= COLONOSCOPY_MIN_WITHDRAWAL ? '合格' : `${liveWithdrawalTime}分`}
              </div>
            </div>

            {/* 实时操作按钮 */}
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button
                style={{ ...s.btn, ...s.btnPrimary, flex: 1 }}
                onClick={handleCaptureImage}
                disabled={!activeExam || activeExam.status !== '检查中'}
              >
                <Camera size={13} /> 拍照 +1
              </button>
              <button
                style={{ ...s.btn, ...s.btnWarning, flex: 1 }}
                onClick={() => setLiveWithdrawalTime(t => t + 1)}
                disabled={!activeExam || activeExam.status !== '检查中'}
              >
                <Clock size={13} /> 退镜 +1分钟
              </button>
            </div>
          </div>

          {/* 图像采集 */}
          <div style={s.imageCapturePanel}>
            <div style={s.imageCaptureTitle}>
              <ImageIcon size={15} color="#1a3a5c" /> 图像采集
              <span style={{ marginLeft: 'auto', fontSize: 12, color: '#94a3b8' }}>
                {capturedImages.length} 张
              </span>
            </div>

            <div style={s.imageGrid}>
              {capturedImages.slice(0, 8).map(img => {
                const qualityStyle = img.quality === '清晰' ? s.imageQualityClear
                  : img.quality === '模糊' ? s.imageQualityBlur
                  : s.imageQualityDup
                return (
                  <div key={img.id} style={s.imageThumb}>
                    <div style={s.imageThumbPlaceholder}>
                      <ImageIcon size={20} color="#e2e8f0" />
                    </div>
                    <span style={{ ...s.imageQualityBadge, ...qualityStyle }}>
                      {img.quality === '清晰' && <ThumbsUp size={8} />}
                      {img.quality === '模糊' && <AlertTriangle size={8} />}
                      {img.quality === '重复' && <Copy size={8} />}
                    </span>
                    <div
                      style={s.imageThumbDelete}
                      onClick={() => handleDeleteImage(img.id)}
                    >
                      ×
                    </div>
                  </div>
                )
              })}
              {/* 空格子 */}
              {Array.from({ length: Math.max(0, 8 - capturedImages.length) }).map((_, i) => (
                <div key={`empty-${i}`} style={{ ...s.imageThumb, border: '1.5px dashed #e2e8f0' }} />
              ))}
            </div>

            <div style={s.imageCaptureActions}>
              <button
                style={{ ...s.btn, ...s.btnPrimary, flex: 1 }}
                onClick={handleCaptureImage}
                disabled={!activeExam || activeExam.status !== '检查中'}
              >
                <Camera size={13} /> 采集图像
              </button>
              {activeExam?.status === '检查中' && (
                <button
                  style={{ ...s.btn, ...s.btnDanger, flex: 1 }}
                  onClick={() => setIsRecording(!isRecording)}
                >
                  <Video size={13} /> {isRecording ? '停止录制' : '开始录制'}
                </button>
              )}
            </div>
            <div style={s.shortcutHint}>
              <Footprints size={11} style={{ verticalAlign: 'middle' }} /> 脚踏开关：按 <span style={s.shortcutKey}>空格</span> 采集图像
            </div>
          </div>

          {/* ===== 新增：设备分配面板 ===== */}
          {renderEquipmentPanel()}

          {/* ===== 新增：质量评分面板 ===== */}
          {renderQualityScorePanel()}

          {/* 检查医嘱 */}
          <div style={s.orderPanel}>
            <div style={s.orderTitle}>
              <ClipboardList size={15} color="#1a3a5c" /> 检查医嘱
            </div>
            {activeExam ? renderOrders() : (
              <div style={s.emptyState}>
                <AlertCircle size={24} color="#cbd5e1" style={{ marginBottom: 6 }} />
                <div>接诊后显示检查医嘱</div>
              </div>
            )}
          </div>

          {/* 检查小结 */}
          <div style={s.summaryPanel}>
            <div style={s.summaryTitle}>
              <FileText size={15} color="#1a3a5c" /> 检查小结
            </div>
            {activeExam ? (
              <>
                <textarea
                  style={s.summaryTextarea}
                  placeholder="请填写检查小结..."
                  value={summaryText}
                  onChange={e => setSummaryText(e.target.value)}
                />
                <div style={s.complicationLabel}>并发症记录</div>
                <div style={s.complicationRow}>
                  {['无', '少量出血', '穿孔', '其他'].map(opt => (
                    <button
                      key={opt}
                      style={{
                        ...s.complicationOption,
                        ...(complication === opt
                          ? opt === '穿孔' || opt === '其他'
                            ? s.complicationOptionDanger
                            : s.complicationOptionActive
                          : {}),
                      }}
                      onClick={() => setComplication(opt)}
                    >
                      {opt === '无' && <CheckCircle size={11} style={{ marginRight: 4 }} />}
                      {opt === '少量出血' && <AlertTriangle size={11} style={{ marginRight: 4 }} />}
                      {opt === '穿孔' && <XCircle size={11} style={{ marginRight: 4 }} />}
                      {opt === '其他' && <AlertCircle size={11} style={{ marginRight: 4 }} />}
                      {opt}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div style={s.emptyState}>
                <FileText size={24} color="#cbd5e1" style={{ marginBottom: 6 }} />
                <div>完成后可填写检查小结</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 结束检查确认弹窗 */}
      {showEndExamModal && (
        <div style={s.modalOverlay}>
          <div style={s.modal}>
            <div style={s.modalTitle}>确认完成检查</div>
            <div style={s.modalInfo}>
              <strong>{activeExam?.patientName}</strong> 的检查即将完成<br/>
              检查室：{selectedRoom}<br/>
              采集图像：{capturedImages.length} 张<br/>
              质控：US {livePhotoCount >= GASTRORAPHY_MIN_PHOTOS ? '✓ 合格' : `✗ ${livePhotoCount}/${GASTRORAPHY_MIN_PHOTOS}`}
            </div>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>
              请确认检查小结已填写
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>
              {summaryText ? `"${summaryText.slice(0, 30)}..."` : '（未填写）'}
            </div>
            <div style={s.modalActions}>
              <button style={{ ...s.btn, ...s.btnGhost }} onClick={() => setShowEndExamModal(false)}>
                取消
              </button>
              <button style={{ ...s.btn, ...s.btnSuccess }} onClick={handleEndExam}>
                <CheckCircle size={13} /> 确认完成
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 取消检查确认弹窗 */}
      {showCancelModal && (
        <div style={s.modalOverlay}>
          <div style={s.modal}>
            <div style={s.modalTitle}>确认终止检查</div>
            <div style={{ fontSize: 14, color: '#ef4444', marginBottom: 16 }}>
              <AlertTriangle size={20} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              此操作不可恢复！
            </div>
            <div style={s.modalInfo}>
              确认终止 <strong>{activeExam?.patientName}</strong> 的检查？<br/>
              请说明终止原因（记录在备注中）。
            </div>
            <div style={s.modalActions}>
              <button style={{ ...s.btn, ...s.btnGhost }} onClick={() => setShowCancelModal(false)}>
                返回
              </button>
              <button style={{ ...s.btn, ...s.btnDanger }} onClick={handleCancelExam}>
                <XCircle size={13} /> 确认终止
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 全局样式动画 */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  )
}
