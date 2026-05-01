// @ts-nocheck
import { useState, useMemo } from 'react';
import {
  Calendar, Clock, Users, Scissors, AlertCircle, CheckCircle2,
  ChevronLeft, ChevronRight, Plus, X, Filter, BarChart3,
  GripVertical, AlertTriangle, Timer, Activity, User,
  Trash2, Edit2, Search
} from 'lucide-react';

// ==================== 类型定义 ====================
type SurgeryType = 'ERCP' | 'EMR' | 'ESD' | '食管扩张' | '胃底静脉曲张治疗' | '超声内镜' | '其他';
type SurgeryStatus = '待手术' | '手术中' | '已完成' | '已取消' | '等待中';
type RoomStatus = '空闲' | '手术中' | '准备中' | '清洁中';

interface Surgery {
  id: string;
  patientId: string;
  patientName: string;
  gender: string;
  age: number;
  surgeryType: SurgeryType;
  doctorId: string;
  doctorName: string;
  assistant1Id?: string;
  assistant1Name?: string;
  assistant2Id?: string;
  assistant2Name?: string;
  anesthesiaMethod: string;
  room: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: SurgeryStatus;
  specialNeeds?: string;
  preOpChecklist: string[];
  notes?: string;
}

interface SurgeryRoom {
  id: string;
  name: string;
  status: RoomStatus;
  todaySurgeries: number;
  remainingMinutes: number;
}

// ==================== 样式 ====================
const s: Record<string, React.CSSProperties> = {
  root: { padding: 24 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 20, fontWeight: 700, color: '#1a3a5c' },
  tabs: { display: 'flex', gap: 8, background: '#f1f5f9', padding: 4, borderRadius: 10 },
  tab: { padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: 'none', background: 'transparent', color: '#64748b', transition: 'all 0.15s' },
  tabActive: { background: '#fff', color: '#1a3a5c', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  headerRight: { display: 'flex', gap: 12, alignItems: 'center' },
  btn: { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: 'none', transition: 'all 0.15s' },
  btnPrimary: { background: '#1a3a5c', color: '#fff' },
  btnSecondary: { background: '#f1f5f9', color: '#1a3a5c' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 },
  statCard: { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  statLabel: { fontSize: 12, color: '#94a3b8', marginBottom: 8 },
  statValue: { fontSize: 28, fontWeight: 700, color: '#1a3a5c' },
  statSub: { fontSize: 11, color: '#94a3b8', marginTop: 4 },
  mainGrid: { display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 },
  card: { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  cardTitle: { fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 },
  calendarHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  calendarNav: { display: 'flex', gap: 8 },
  navBtn: { padding: '6px 10px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  viewToggle: { display: 'flex', gap: 4 },
  viewBtn: { padding: '5px 10px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff', fontSize: 12, cursor: 'pointer' },
  viewBtnActive: { background: '#1a3a5c', color: '#fff', border: '1px solid #1a3a5c' },
  calendarGrid: { display: 'grid', gap: 2 },
  calendarRow: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 },
  calendarDay: { padding: '8px 4px', textAlign: 'center', fontSize: 11, color: '#94a3b8', fontWeight: 500 },
  calendarDate: { padding: 6, textAlign: 'center', fontSize: 13, borderRadius: 8, cursor: 'pointer' },
  calendarDateActive: { background: '#1a3a5c', color: '#fff' },
  calendarDateToday: { border: '2px solid #4ade80' },
  calendarDateSelected: { background: '#e0f2fe' },
  timeSlots: { display: 'flex', flexDirection: 'column', gap: 2 },
  timeSlot: { display: 'grid', gridTemplateColumns: '60px 1fr', gap: 8, minHeight: 70 },
  timeLabel: { fontSize: 11, color: '#94a3b8', textAlign: 'right', paddingTop: 4 },
  slotContent: { background: '#f8fafc', borderRadius: 6, padding: 6, minHeight: 60, position: 'relative' },
  surgeryCard: { borderRadius: 6, padding: '6px 8px', marginBottom: 4, cursor: 'grab', fontSize: 11, color: '#fff', display: 'flex', flexDirection: 'column', gap: 2 },
  surgeryCardHeader: { fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  surgeryCardMeta: { opacity: 0.9, fontSize: 10 },
  roomList: { display: 'flex', flexDirection: 'column', gap: 12 },
  roomItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#f8fafc', borderRadius: 8 },
  roomInfo: { display: 'flex', flexDirection: 'column', gap: 2 },
  roomName: { fontSize: 13, fontWeight: 600, color: '#1a3a5c' },
  roomStatus: { fontSize: 11, color: '#64748b' },
  statusBadge: { padding: '3px 8px', borderRadius: 12, fontSize: 11, fontWeight: 500 },
  statusIdle: { background: '#dcfce7', color: '#16a34a' },
  statusBusy: { background: '#fef3c7', color: '#d97706' },
  statusPrep: { background: '#dbeafe', color: '#2563eb' },
  statusClean: { background: '#f3e8ff', color: '#9333ea' },
  emptySection: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    padding: '40px 20px', gap: 12, background: '#fff', borderRadius: 12,
  },
  emptySectionIcon: { color: '#cbd5e1', marginBottom: 4 },
  emptySectionText: { fontSize: 14, color: '#94a3b8' },
  queueList: { display: 'flex', flexDirection: 'column', gap: 8 },
  queueItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: '#f8fafc', borderRadius: 8 },
  queueNum: { width: 24, height: 24, borderRadius: '50%', background: '#1a3a5c', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600 },
  queueInfo: { flex: 1 },
  queueName: { fontSize: 13, fontWeight: 600, color: '#1a3a5c' },
  queueMeta: { fontSize: 11, color: '#94a3b8' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  formGroup: { marginBottom: 16 },
  formLabel: { fontSize: 12, color: '#64748b', marginBottom: 6, fontWeight: 500 },
  formInput: { width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', boxSizing: 'border-box' },
  formSelect: { width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', background: '#fff', boxSizing: 'border-box' },
  formTextarea: { width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', resize: 'vertical', minHeight: 80, boxSizing: 'border-box' },
  modal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modalContent: { background: '#fff', borderRadius: 16, padding: 24, width: 600, maxHeight: '80vh', overflow: 'auto' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 16, fontWeight: 600, color: '#1a3a5c' },
  checklist: { display: 'flex', flexDirection: 'column', gap: 8 },
  checklistItem: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 },
  checkbox: { width: 18, height: 18, cursor: 'pointer' },
  chartGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  barItem: { display: 'flex', alignItems: 'center', gap: 12 },
  barLabel: { width: 80, fontSize: 12, color: '#64748b' },
  barTrack: { flex: 1, height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4, transition: 'width 0.3s' },
  barValue: { width: 40, fontSize: 12, color: '#1a3a5c', fontWeight: 500, textAlign: 'right' },
  docRank: { display: 'flex', flexDirection: 'column', gap: 8 },
  docRankItem: { display: 'flex', alignItems: 'center', gap: 10 },
  docRankNum: { width: 20, height: 20, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#64748b' },
  docRankName: { flex: 1, fontSize: 13, color: '#1a3a5c' },
  docRankCount: { fontSize: 13, fontWeight: 600, color: '#1a3a5c' },
  conflict: { border: '2px solid #ef4444' },
};

// ==================== 颜色映射 ====================
const SURGERY_COLORS: Record<SurgeryType, string> = {
  'ERCP': '#3b82f6',
  'EMR': '#22c55e',
  'ESD': '#f97316',
  '食管扩张': '#06b6d4',
  '胃底静脉曲张治疗': '#ec4899',
  '超声内镜': '#a855f7',
  '其他': '#64748b',
};

const ROOM_COLORS: Record<RoomStatus, string> = {
  '空闲': '#16a34a',
  '手术中': '#d97706',
  '准备中': '#2563eb',
  '清洁中': '#9333ea',
};

// ==================== 模拟数据 ====================
const SURGERY_TYPES: SurgeryType[] = ['ERCP', 'EMR', 'ESD', '食管扩张', '胃底静脉曲张治疗', '超声内镜', '其他'];
const DOCTORS = [
  { id: 'U001', name: '张建国' },
  { id: 'U002', name: '李秀英' },
];
const ASSISTANTS = [
  { id: 'U003', name: '王海涛' },
  { id: 'U004', name: '赵晓敏' },
];
const ANESTHESIA_METHODS = ['全麻', '局麻', '镇静', '无麻醉'];
const ROOMS = ['手术室1', '手术室2', '手术室3', 'ERCP专用室'];

const initialSurgeries: Surgery[] = [
  { id: 'S001', patientId: 'P001', patientName: '王建国', gender: '男', age: 58, surgeryType: 'ERCP', doctorId: 'U001', doctorName: '张建国', assistant1Id: 'U003', assistant1Name: '王海涛', assistant2Id: 'U004', assistant2Name: '赵晓敏', anesthesiaMethod: '全麻', room: 'ERCP专用室', date: '2026-04-30', startTime: '08:00', endTime: '09:30', duration: 90, status: '已完成', specialNeeds: '既往胃切除史', preOpChecklist: ['术前禁食', '签署知情同意', '备血'], notes: '' },
  { id: 'S002', patientId: 'P002', patientName: '李秀芳', gender: '女', age: 45, surgeryType: 'EMR', doctorId: 'U002', doctorName: '李秀英', assistant1Id: 'U003', assistant1Name: '王海涛', anesthesiaMethod: '镇静', room: '手术室1', date: '2026-04-30', startTime: '08:00', endTime: '09:00', duration: 60, status: '已完成', preOpChecklist: ['术前禁食', '签署知情同意'], notes: '胃窦息肉' },
  { id: 'S003', patientId: 'P003', patientName: '张德明', gender: '男', age: 62, surgeryType: 'ESD', doctorId: 'U001', doctorName: '张建国', assistant1Id: 'U003', assistant1Name: '王海涛', assistant2Id: 'U004', assistant2Name: '赵晓敏', anesthesiaMethod: '全麻', room: '手术室2', date: '2026-04-30', startTime: '09:00', endTime: '11:00', duration: 120, status: '手术中', specialNeeds: '升结肠病变', preOpChecklist: ['术前禁食', '签署知情同意', '肠道准备', '备血'], notes: '早期结肠癌？' },
  { id: 'S004', patientId: 'P004', patientName: '周丽娟', gender: '女', age: 38, surgeryType: '超声内镜', doctorId: 'U002', doctorName: '李秀英', assistant1Id: 'U004', assistant1Name: '赵晓敏', anesthesiaMethod: '局麻', room: '手术室1', date: '2026-04-30', startTime: '09:00', endTime: '09:45', duration: 45, status: '已完成', preOpChecklist: ['术前禁食'], notes: '胰腺囊性病变评估' },
  { id: 'S005', patientId: 'P005', patientName: '陈伟强', gender: '男', age: 55, surgeryType: 'ERCP', doctorId: 'U001', doctorName: '张建国', assistant1Id: 'U003', assistant1Name: '王海涛', assistant2Id: 'U004', assistant2Name: '赵晓敏', anesthesiaMethod: '全麻', room: 'ERCP专用室', date: '2026-04-30', startTime: '10:00', endTime: '11:30', duration: 90, status: '已完成', preOpChecklist: ['术前禁食', '签署知情同意', '抗生素'], notes: '胆管结石取石' },
  { id: 'S006', patientId: 'P006', patientName: '吴美珍', gender: '女', age: 67, surgeryType: '胃底静脉曲张治疗', doctorId: 'U002', doctorName: '李秀英', assistant1Id: 'U003', assistant1Name: '王海涛', anesthesiaMethod: '全麻', room: '手术室3', date: '2026-04-30', startTime: '10:00', endTime: '11:30', duration: 90, status: '已完成', specialNeeds: '肝硬化病史', preOpChecklist: ['术前禁食', '签署知情同意', '备血', 'ICU床位'], notes: 'EVL治疗' },
  { id: 'S007', patientId: 'P007', patientName: '黄大军', gender: '男', age: 48, surgeryType: 'EMR', doctorId: 'U001', doctorName: '张建国', assistant1Id: 'U003', assistant1Name: '王海涛', anesthesiaMethod: '镇静', room: '手术室1', date: '2026-04-30', startTime: '11:00', endTime: '12:00', duration: 60, status: '等待中', preOpChecklist: ['术前禁食', '签署知情同意'], notes: '食管黏膜下肿物' },
  { id: 'S008', patientId: 'P008', patientName: '孙红梅', gender: '女', age: 52, surgeryType: '食管扩张', doctorId: 'U002', doctorName: '李秀英', assistant1Id: 'U004', assistant1Name: '赵晓敏', anesthesiaMethod: '局麻', room: '手术室2', date: '2026-04-30', startTime: '11:00', endTime: '11:30', duration: 30, status: '等待中', specialNeeds: '贲门失弛缓症', preOpChecklist: ['术前禁食'], notes: '' },
  { id: 'S009', patientId: 'P009', patientName: '赵小龙', gender: '男', age: 42, surgeryType: 'ESD', doctorId: 'U001', doctorName: '张建国', assistant1Id: 'U003', assistant1Name: '王海涛', assistant2Id: 'U004', assistant2Name: '赵晓敏', anesthesiaMethod: '全麻', room: '手术室3', date: '2026-04-30', startTime: '13:00', endTime: '15:00', duration: 120, status: '等待中', preOpChecklist: ['术前禁食', '签署知情同意', '肠道准备'], notes: '胃角早期癌' },
  { id: 'S010', patientId: 'P010', patientName: '周玉芬', gender: '女', age: 71, surgeryType: '超声内镜', doctorId: 'U002', doctorName: '李秀英', assistant1Id: 'U003', assistant1Name: '王海涛', anesthesiaMethod: '镇静', room: '手术室1', date: '2026-04-30', startTime: '13:00', endTime: '14:00', duration: 60, status: '等待中', specialNeeds: '直肠癌术后', preOpChecklist: ['术前灌肠'], notes: '淋巴结活检' },
  { id: 'S011', patientId: 'P001', patientName: '王建国', gender: '男', age: 58, surgeryType: 'EMR', doctorId: 'U001', doctorName: '张建国', assistant1Id: 'U003', assistant1Name: '王海涛', anesthesiaMethod: '镇静', room: '手术室2', date: '2026-04-30', startTime: '14:00', endTime: '15:00', duration: 60, status: '等待中', preOpChecklist: ['术前禁食', '签署知情同意'], notes: '复查肠镜' },
  { id: 'S012', patientId: 'P002', patientName: '李秀芳', gender: '女', age: 45, surgeryType: 'ERCP', doctorId: 'U002', doctorName: '李秀英', assistant1Id: 'U003', assistant1Name: '王海涛', assistant2Id: 'U004', assistant2Name: '赵晓敏', anesthesiaMethod: '全麻', room: 'ERCP专用室', date: '2026-04-30', startTime: '14:00', endTime: '15:30', duration: 90, status: '等待中', preOpChecklist: ['术前禁食', '签署知情同意'], notes: '胆管狭窄扩张' },
  { id: 'S013', patientId: 'P003', patientName: '张德明', gender: '男', age: 62, surgeryType: '其他', doctorId: 'U001', doctorName: '张建国', assistant1Id: 'U004', assistant1Name: '赵晓敏', anesthesiaMethod: '局麻', room: '手术室1', date: '2026-04-30', startTime: '15:00', endTime: '15:30', duration: 30, status: '等待中', preOpChecklist: ['术前禁食'], notes: '小肠胶囊内镜引导' },
  { id: 'S014', patientId: 'P004', patientName: '周丽娟', gender: '女', age: 38, surgeryType: 'ESD', doctorId: 'U002', doctorName: '李秀英', assistant1Id: 'U003', assistant1Name: '王海涛', assistant2Id: 'U004', assistant2Name: '赵晓敏', anesthesiaMethod: '全麻', room: '手术室3', date: '2026-04-30', startTime: '15:00', endTime: '17:00', duration: 120, status: '等待中', preOpChecklist: ['术前禁食', '签署知情同意', '肠道准备'], notes: '食管早癌' },
  { id: 'S015', patientId: 'P005', patientName: '陈伟强', gender: '男', age: 55, surgeryType: 'EMR', doctorId: 'U001', doctorName: '张建国', assistant1Id: 'U003', assistant1Name: '王海涛', anesthesiaMethod: '镇静', room: '手术室2', date: '2026-04-30', startTime: '16:00', endTime: '17:00', duration: 60, status: '等待中', preOpChecklist: ['术前禁食', '签署知情同意'], notes: '结肠息肉切除' },
  { id: 'S016', patientId: 'P006', patientName: '吴美珍', gender: '女', age: 67, surgeryType: '胃底静脉曲张治疗', doctorId: 'U002', doctorName: '李秀英', assistant1Id: 'U003', assistant1Name: '王海涛', anesthesiaMethod: '全麻', room: '手术室1', date: '2026-04-30', startTime: '16:00', endTime: '17:30', duration: 90, status: '等待中', specialNeeds: 'TIPS术后', preOpChecklist: ['术前禁食', '签署知情同意', '备血'], notes: '胃底静脉曲张栓塞' },
  { id: 'S017', patientId: 'P007', patientName: '黄大军', gender: '男', age: 48, surgeryType: '超声内镜', doctorId: 'U001', doctorName: '张建国', assistant1Id: 'U004', assistant1Name: '赵晓敏', anesthesiaMethod: '局麻', room: 'ERCP专用室', date: '2026-04-30', startTime: '08:00', endTime: '09:00', duration: 60, status: '已完成', preOpChecklist: ['术前禁食'], notes: '胰腺假性囊肿' },
  { id: 'S018', patientId: 'P008', patientName: '孙红梅', gender: '女', age: 52, surgeryType: 'ERCP', doctorId: 'U002', doctorName: '李秀英', assistant1Id: 'U003', assistant1Name: '王海涛', assistant2Id: 'U004', assistant2Name: '赵晓敏', anesthesiaMethod: '全麻', room: 'ERCP专用室', date: '2026-04-30', startTime: '11:00', endTime: '12:30', duration: 90, status: '已完成', preOpChecklist: ['术前禁食', '签署知情同意'], notes: '胆总管塑料支架置入' },
  { id: 'S019', patientId: 'P009', patientName: '赵小龙', gender: '男', age: 42, surgeryType: 'EMR', doctorId: 'U001', doctorName: '张建国', assistant1Id: 'U003', assistant1Name: '王海涛', anesthesiaMethod: '镇静', room: '手术室3', date: '2026-04-30', startTime: '08:00', endTime: '09:00', duration: 60, status: '已完成', preOpChecklist: ['术前禁食', '签署知情同意'], notes: '十二指肠降部NET' },
  { id: 'S020', patientId: 'P010', patientName: '周玉芬', gender: '女', age: 71, surgeryType: 'ESD', doctorId: 'U002', doctorName: '李秀英', assistant1Id: 'U003', assistant1Name: '王海涛', assistant2Id: 'U004', assistant2Name: '赵晓敏', anesthesiaMethod: '全麻', room: '手术室2', date: '2026-04-30', startTime: '08:00', endTime: '10:00', duration: 120, status: '已完成', preOpChecklist: ['术前禁食', '签署知情同意', '肠道准备'], notes: '直肠侧向发育型肿瘤' },
];

const TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

// ==================== 组件 ====================
export default function SurgeryPage() {
  const [tab, setTab] = useState<'calendar' | 'register' | 'rooms' | 'queue' | 'stats'>('calendar');
  const [view, setView] = useState<'day' | 'week'>('day');
  const [currentDate, setCurrentDate] = useState(new Date('2026-04-30'));
  const [surgeries, setSurgeries] = useState<Surgery[]>(initialSurgeries);
  const [showModal, setShowModal] = useState(false);
  const [editingSurgery, setEditingSurgery] = useState<Surgery | null>(null);
  const [conflictError, setConflictError] = useState('');

  const todayStr = currentDate.toISOString().split('T')[0];
  const weekDays = useMemo(() => {
    const days = [];
    for (let i = -3; i <= 3; i++) {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  }, [currentDate]);

  const surgeriesForDay = surgeries.filter(s => s.date === todayStr);

  const todayStats = useMemo(() => {
    const today = '2026-04-30';
    const todaySurgeries = surgeries.filter(s => s.date === today);
    return {
      total: todaySurgeries.length,
      completed: todaySurgeries.filter(s => s.status === '已完成').length,
      inProgress: todaySurgeries.filter(s => s.status === '手术中').length,
      waiting: todaySurgeries.filter(s => s.status === '等待中').length,
    };
  }, [surgeries]);

  const typeStats = useMemo(() => {
    const today = '2026-04-30';
    const todaySurgeries = surgeries.filter(s => s.date === today);
    const counts: Record<string, number> = {};
    todaySurgeries.forEach(s => {
      counts[s.surgeryType] = (counts[s.surgeryType] || 0) + 1;
    });
    return Object.entries(counts).map(([type, count]) => ({ type, count }));
  }, [surgeries]);

  const doctorStats = useMemo(() => {
    const today = '2026-04-30';
    const todaySurgeries = surgeries.filter(s => s.date === today);
    const counts: Record<string, number> = {};
    todaySurgeries.forEach(s => {
      counts[s.doctorName] = (counts[s.doctorName] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([doctor, count]) => ({ doctor, count }))
      .sort((a, b) => b.count - a.count);
  }, [surgeries]);

  const roomStats = useMemo((): SurgeryRoom[] => {
    const today = '2026-04-30';
    const todaySurgeries = surgeries.filter(s => s.date === today);
    return ROOMS.map((name, idx) => {
      const roomSurgeries = todaySurgeries.filter(s => s.room === name);
      const completed = roomSurgeries.filter(s => s.status === '已完成').length;
      const inProgress = roomSurgeries.some(s => s.status === '手术中');
      const preparing = roomSurgeries.some(s => s.status === '等待中' && roomSurgeries.indexOf(s) === 0);
      const totalMins = roomSurgeries.reduce((sum, s) => sum + s.duration, 0);
      const usedMins = roomSurgeries.filter(s => s.status === '已完成').reduce((sum, s) => sum + s.duration, 0);
      let status: RoomStatus = '空闲';
      if (inProgress) status = '手术中';
      else if (preparing) status = '准备中';
      else if (completed > 0) status = '清洁中';
      return {
        id: `R${idx + 1}`,
        name,
        status,
        todaySurgeries: roomSurgeries.length,
        remainingMinutes: 480 - usedMins,
      };
    });
  }, [surgeries]);

  const queueList = surgeries
    .filter(s => s.status === '等待中')
    .sort((a, b) => {
      const aTime = parseInt(a.startTime.replace(':', ''));
      const bTime = parseInt(b.startTime.replace(':', ''));
      if (aTime !== bTime) return aTime - bTime;
      return 0;
    });

  const checkConflict = (surgery: Partial<Surgery>): string => {
    const sameDoctorSurgeries = surgeries.filter(
      s => s.doctorId === surgery.doctorId && s.date === surgery.date && s.id !== surgery.id
    );
    for (const existing of sameDoctorSurgeries) {
      const existStart = parseInt(existing.startTime.replace(':', ''));
      const existEnd = parseInt(existing.endTime.replace(':', ''));
      const newStart = parseInt(surgery.startTime?.replace(':', '') || '');
      const newEnd = parseInt(surgery.endTime?.replace(':', '') || '');
      if ((newStart >= existStart && newStart < existEnd) || (newEnd > existStart && newEnd <= existEnd) || (newStart <= existStart && newEnd >= existEnd)) {
        return `冲突：${existing.doctorName} 医生在 ${existing.startTime}-${existing.endTime} 已有 ${existing.patientName} 的 ${existing.surgeryType} 手术`;
      }
    }
    return '';
  };

  const formatDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const isToday = (d: Date) => formatDate(d) === '2026-04-30';
  const isSelected = (d: Date) => formatDate(d) === todayStr;

  const [form, setForm] = useState<Partial<Surgery>>({
    patientName: '', gender: '男', age: 0, surgeryType: 'EMR', doctorId: 'U001', doctorName: '张建国',
    assistant1Id: '', assistant1Name: '', assistant2Id: '', assistant2Name: '',
    anesthesiaMethod: '镇静', room: '手术室1', date: '2026-04-30', startTime: '10:00',
    duration: 60, status: '等待中', specialNeeds: '', preOpChecklist: [],
  });

  const openNew = () => {
    setEditingSurgery(null);
    setForm({
      patientName: '', gender: '男', age: 0, surgeryType: 'EMR', doctorId: 'U001', doctorName: '张建国',
      assistant1Id: '', assistant1Name: '', assistant2Id: '', assistant2Name: '',
      anesthesiaMethod: '镇静', room: '手术室1', date: todayStr, startTime: '10:00',
      duration: 60, status: '等待中', specialNeeds: '', preOpChecklist: [],
    });
    setConflictError('');
    setShowModal(true);
  };

  const openEdit = (s: Surgery) => {
    setEditingSurgery(s);
    setForm({ ...s });
    setConflictError('');
    setShowModal(true);
  };

  const handleSave = () => {
    const endHour = parseInt(form.startTime!.split(':')[0]);
    const endMin = parseInt(form.startTime!.split(':')[1]) + form.duration!;
    const endTime = `${String(Math.floor(endHour + endMin / 60)).padStart(2, '0')}:${String(endMin % 60).padStart(2, '0')}`;
    const surgeryWithEnd = { ...form, endTime };

    const conflict = checkConflict(surgeryWithEnd);
    if (conflict) {
      setConflictError(conflict);
      return;
    }

    if (editingSurgery) {
      setSurgeries(prev => prev.map(s => s.id === editingSurgery.id ? { ...s, ...surgeryWithEnd } as Surgery : s));
    } else {
      const newSurgery: Surgery = {
        ...surgeryWithEnd,
        id: `S${String(Date.now()).slice(-3)}`,
        patientId: `P${String(Date.now()).slice(-3)}`,
        status: '等待中',
        preOpChecklist: form.preOpChecklist || [],
      } as Surgery;
      setSurgeries(prev => [...prev, newSurgery]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    setSurgeries(prev => prev.filter(s => s.id !== id));
  };

  const toggleChecklist = (item: string) => {
    setForm(prev => ({
      ...prev,
      preOpChecklist: prev.preOpChecklist?.includes(item)
        ? prev.preOpChecklist.filter(i => i !== item)
        : [...(prev.preOpChecklist || []), item],
    }));
  };

  const getSurgeriesForSlot = (room: string, time: string) => {
    return surgeriesForDay.filter(s => s.room === room && s.startTime === time);
  };

  const PREOP_CHECKLIST = ['术前禁食', '签署知情同意', '备血', '抗生素', '肠道准备', '术前灌肠', 'ICU床位'];

  return (
    <div style={s.root}>
      {/* Header */}
      <div style={s.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <h1 style={s.title}>手术预约管理</h1>
          <div style={s.tabs}>
            {(['calendar', 'register', 'rooms', 'queue', 'stats'] as const).map(t => (
              <button
                key={t}
                style={{ ...s.tab, ...(tab === t ? s.tabActive : {}) }}
                onClick={() => setTab(t)}
              >
                {t === 'calendar' ? '日历' : t === 'register' ? '登记' : t === 'rooms' ? '手术室' : t === 'queue' ? '等待队列' : '统计'}
              </button>
            ))}
          </div>
        </div>
        <div style={s.headerRight}>
          <button style={{ ...s.btn, ...s.btnSecondary }} onClick={openNew}>
            <Plus size={16} /> 新增手术
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div style={s.statsRow}>
        <div style={s.statCard}>
          <div style={s.statLabel}>今日手术</div>
          <div style={s.statValue}>{todayStats.total}</div>
          <div style={s.statSub}>台</div>
        </div>
        <div style={s.statCard}>
          <div style={s.statLabel}>已完成</div>
          <div style={{ ...s.statValue, color: '#22c55e' }}>{todayStats.completed}</div>
          <div style={s.statSub}>台</div>
        </div>
        <div style={s.statCard}>
          <div style={s.statLabel}>进行中</div>
          <div style={{ ...s.statValue, color: '#f97316' }}>{todayStats.inProgress}</div>
          <div style={s.statSub}>台</div>
        </div>
        <div style={s.statCard}>
          <div style={s.statLabel}>等待中</div>
          <div style={{ ...s.statValue, color: '#3b82f6' }}>{todayStats.waiting}</div>
          <div style={s.statSub}>台</div>
        </div>
      </div>

      {/* Calendar Tab */}
      {tab === 'calendar' && (
        <div>
          <div style={s.card}>
            <div style={s.calendarHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button style={s.navBtn} onClick={() => { const d = new Date(currentDate); d.setDate(d.getDate() - 1); setCurrentDate(d); }}>
                  <ChevronLeft size={16} />
                </button>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#1a3a5c', minWidth: 100, textAlign: 'center' }}>
                  {currentDate.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}
                </span>
                <button style={s.navBtn} onClick={() => { const d = new Date(currentDate); d.setDate(d.getDate() + 1); setCurrentDate(d); }}>
                  <ChevronRight size={16} />
                </button>
              </div>
              <div style={s.viewToggle}>
                <button style={{ ...s.viewBtn, ...(view === 'day' ? s.viewBtnActive : {}) }} onClick={() => setView('day')}>日视图</button>
                <button style={{ ...s.viewBtn, ...(view === 'week' ? s.viewBtnActive : {}) }} onClick={() => setView('week')}>周视图</button>
              </div>
            </div>

            {/* Week Strip */}
            <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 16 }}>
              {weekDays.map(d => (
                <div
                  key={d.toISOString()}
                  style={{
                    ...s.calendarDate,
                    ...(isToday(d) ? s.calendarDateToday : {}),
                    ...(isSelected(d) ? s.calendarDateSelected : {}),
                    background: isToday(d) ? '#fef9c3' : isSelected(d) ? '#e0f2fe' : 'transparent',
                    cursor: 'pointer',
                  }}
                  onClick={() => setCurrentDate(d)}
                >
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>{d.toLocaleDateString('zh-CN', { weekday: 'short' })}</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: isToday(d) ? '#ca8a04' : '#1a3a5c' }}>{d.getDate()}</div>
                </div>
              ))}
            </div>

            {/* Day View - Room Rows */}
            {view === 'day' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {ROOMS.map(room => (
                  <div key={room} style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <Scissors size={14} color="#1a3a5c" />
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#1a3a5c' }}>{room}</span>
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>{roomStats.find(r => r.name === room)?.status}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(11, 1fr)', gap: 4 }}>
                      {TIME_SLOTS.map(time => {
                        const slotSurgeries = getSurgeriesForSlot(room, time);
                        return (
                          <div key={time} style={{ position: 'relative', minHeight: 64 }}>
                            <div style={{ fontSize: 10, color: '#94a3b8', textAlign: 'center', marginBottom: 2 }}>{time}</div>
                            {slotSurgeries.map(s => (
                              <div
                                key={s.id}
                                style={{
                                  ...s.surgeryCard,
                                  background: SURGERY_COLORS[s.surgeryType],
                                  cursor: 'pointer',
                                }}
                                onClick={() => openEdit(s)}
                                title={`${s.patientName} - ${s.surgeryType}`}
                              >
                                <div style={s.surgeryCardHeader}>
                                  <span>{s.patientName}</span>
                                </div>
                                <div style={s.surgeryCardMeta}>{s.surgeryType} · {s.doctorName}</div>
                                <div style={s.surgeryCardMeta}>{s.startTime}-{s.endTime}</div>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Week View */}
            {view === 'week' && (
              <div>
                <div style={s.calendarRow}>
                  {['时间', ...weekDays.map(d => d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }))].map((h, i) => (
                    <div key={i} style={{ ...s.calendarDay, fontWeight: 600, color: i === 0 ? 'transparent' : '#1a3a5c' }}>{h}</div>
                  ))}
                </div>
                {TIME_SLOTS.map(time => (
                  <div key={time} style={{ display: 'grid', gridTemplateColumns: '60px repeat(7, 1fr)', gap: 2, marginBottom: 2 }}>
                    <div style={{ fontSize: 10, color: '#94a3b8', textAlign: 'right', paddingRight: 8 }}>{time}</div>
                    {weekDays.map(d => {
                      const dayStr = formatDate(d);
                      const daySurgeries = surgeries.filter(s => s.date === dayStr && s.startTime === time);
                      return (
                        <div key={d.toISOString()} style={{ background: '#f8fafc', borderRadius: 4, padding: 4, minHeight: 50 }}>
                          {daySurgeries.map(s => (
                            <div
                              key={s.id}
                              style={{
                                ...s.surgeryCard,
                                background: SURGERY_COLORS[s.surgeryType],
                                marginBottom: 2,
                              }}
                              onClick={() => openEdit(s)}
                            >
                              <div style={{ fontSize: 10, fontWeight: 600 }}>{s.patientName}</div>
                              <div style={{ fontSize: 9, opacity: 0.9 }}>{s.surgeryType}</div>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Register Tab */}
      {tab === 'register' && (
        <div style={s.card}>
          <div style={s.cardTitle}><Plus size={16} />手术登记</div>
          <div style={s.formGrid}>
            <div style={s.formGroup}>
              <label style={s.formLabel}>患者姓名</label>
              <input style={s.formInput} value={form.patientName || ''} onChange={e => setForm(p => ({ ...p, patientName: e.target.value }))} />
            </div>
            <div style={s.formGroup}>
              <label style={s.formLabel}>性别</label>
              <select style={s.formSelect} value={form.gender || '男'} onChange={e => setForm(p => ({ ...p, gender: e.target.value as any }))}>
                <option value="男">男</option>
                <option value="女">女</option>
              </select>
            </div>
            <div style={s.formGroup}>
              <label style={s.formLabel}>年龄</label>
              <input style={s.formInput} type="number" value={form.age || ''} onChange={e => setForm(p => ({ ...p, age: parseInt(e.target.value) }))} />
            </div>
            <div style={s.formGroup}>
              <label style={s.formLabel}>手术类型</label>
              <select style={s.formSelect} value={form.surgeryType || 'EMR'} onChange={e => setForm(p => ({ ...p, surgeryType: e.target.value as SurgeryType }))}>
                {SURGERY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={s.formGroup}>
              <label style={s.formLabel}>主刀医生</label>
              <select style={s.formSelect} value={form.doctorId || 'U001'} onChange={e => {
                const doc = DOCTORS.find(d => d.id === e.target.value);
                setForm(p => ({ ...p, doctorId: e.target.value, doctorName: doc?.name }));
              }}>
                {DOCTORS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div style={s.formGroup}>
              <label style={s.formLabel}>一助</label>
              <select style={s.formSelect} value={form.assistant1Id || ''} onChange={e => {
                const asst = ASSISTANTS.find(a => a.id === e.target.value);
                setForm(p => ({ ...p, assistant1Id: e.target.value, assistant1Name: asst?.name }));
              }}>
                <option value="">请选择</option>
                {ASSISTANTS.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div style={s.formGroup}>
              <label style={s.formLabel}>二助</label>
              <select style={s.formSelect} value={form.assistant2Id || ''} onChange={e => {
                const asst = ASSISTANTS.find(a => a.id === e.target.value);
                setForm(p => ({ ...p, assistant2Id: e.target.value, assistant2Name: asst?.name }));
              }}>
                <option value="">请选择</option>
                {ASSISTANTS.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div style={s.formGroup}>
              <label style={s.formLabel}>麻醉方式</label>
              <select style={s.formSelect} value={form.anesthesiaMethod || '镇静'} onChange={e => setForm(p => ({ ...p, anesthesiaMethod: e.target.value }))}>
                {ANESTHESIA_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div style={s.formGroup}>
              <label style={s.formLabel}>手术室</label>
              <select style={s.formSelect} value={form.room || '手术室1'} onChange={e => setForm(p => ({ ...p, room: e.target.value }))}>
                {ROOMS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div style={s.formGroup}>
              <label style={s.formLabel}>预约日期</label>
              <input style={s.formInput} type="date" value={form.date || ''} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
            </div>
            <div style={s.formGroup}>
              <label style={s.formLabel}>开始时间</label>
              <select style={s.formSelect} value={form.startTime || '10:00'} onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))}>
                {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={s.formGroup}>
              <label style={s.formLabel}>预计时长(分钟)</label>
              <input style={s.formInput} type="number" value={form.duration || 60} onChange={e => setForm(p => ({ ...p, duration: parseInt(e.target.value) }))} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={s.formLabel}>特殊需求</label>
              <textarea style={s.formTextarea} value={form.specialNeeds || ''} onChange={e => setForm(p => ({ ...p, specialNeeds: e.target.value }))} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={s.formLabel}>术前准备清单</label>
              <div style={s.checklist}>
                {PREOP_CHECKLIST.map(item => (
                  <label key={item} style={s.checklistItem}>
                    <input
                      type="checkbox"
                      style={s.checkbox}
                      checked={form.preOpChecklist?.includes(item) || false}
                      onChange={() => toggleChecklist(item)}
                    />
                    {item}
                  </label>
                ))}
              </div>
            </div>
          </div>
          {conflictError && (
            <div style={{ marginTop: 12, padding: '10px 14px', background: '#fef2f2', borderRadius: 8, color: '#dc2626', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={16} />{conflictError}
            </div>
          )}
          <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
            <button style={{ ...s.btn, ...s.btnPrimary }} onClick={handleSave}>保存</button>
            <button style={{ ...s.btn, ...s.btnSecondary }} onClick={() => setShowModal(false)}>取消</button>
          </div>
        </div>
      )}

      {/* Rooms Tab */}
      {tab === 'rooms' && (
        <div style={s.card}>
          <div style={s.cardTitle}><Scissors size={16} />手术室状态</div>
          <div style={s.roomList}>
            {roomStats.map(room => (
              <div key={room.id} style={s.roomItem}>
                <div style={s.roomInfo}>
                  <div style={s.roomName}>{room.name}</div>
                  <div style={s.roomStatus}>今日已排: {room.todaySurgeries}台 | 剩余可用: {room.remainingMinutes}分钟</div>
                </div>
                <span style={{ ...s.statusBadge, ...(room.status === '空闲' ? s.statusIdle : room.status === '手术中' ? s.statusBusy : room.status === '准备中' ? s.statusPrep : s.statusClean) }}>
                  {room.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Queue Tab */}
      {tab === 'queue' && (
        <div style={s.card}>
          <div style={s.cardTitle}><Clock size={16} />手术等待队列</div>
          <div style={s.queueList}>
            {queueList.length === 0 && (
              <div style={s.emptySection}>
                <CheckCircle2 size={40} style={s.emptySectionIcon} />
                <div style={s.emptySectionText}>暂无等待中的手术</div>
              </div>
            )}
            {queueList.map((s, idx) => (
              <div key={s.id} style={s.queueItem}>
                <div style={s.queueNum}>{idx + 1}</div>
                <div style={s.queueInfo}>
                  <div style={s.queueName}>{s.patientName}</div>
                  <div style={s.queueMeta}>{s.surgeryType} · {s.room} · {s.startTime} · {s.doctorName}</div>
                </div>
                <span style={{ ...s.statusBadge, ...{ background: SURGERY_COLORS[s.surgeryType] + '20', color: SURGERY_COLORS[s.surgeryType] } }}>
                  {s.surgeryType}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Tab */}
      {tab === 'stats' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={s.card}>
            <div style={s.cardTitle}><BarChart3 size={16} />手术类型分布</div>
            <div style={s.chartGrid}>
              {typeStats.map(stat => (
                <div key={stat.type} style={s.barItem}>
                  <div style={s.barLabel}>{stat.type}</div>
                  <div style={s.barTrack}>
                    <div style={{ ...s.barFill, width: `${(stat.count / todayStats.total) * 100}%`, background: SURGERY_COLORS[stat.type as SurgeryType] || '#64748b' }} />
                  </div>
                  <div style={s.barValue}>{stat.count}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><User size={16} />主刀医生排名</div>
            <div style={s.docRank}>
              {doctorStats.map((stat, idx) => (
                <div key={stat.doctor} style={s.docRankItem}>
                  <div style={s.docRankNum}>{idx + 1}</div>
                  <div style={s.docRankName}>{stat.doctor}</div>
                  <div style={s.docRankCount}>{stat.count}台</div>
                </div>
              ))}
            </div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}><CheckCircle2 size={16} />手术准时率</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ fontSize: 48, fontWeight: 700, color: '#22c55e' }}>94%</div>
              <div style={{ color: '#94a3b8', fontSize: 13 }}>今日已完成手术中准时完成的比例<br />近7日平均: 91%</div>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={s.modal}>
          <div style={s.modalContent}>
            <div style={s.modalHeader}>
              <div style={s.modalTitle}>{editingSurgery ? '编辑手术' : '新增手术'}</div>
              <div onClick={() => setShowModal(false)} style={{ cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></div>
            </div>
            <div style={s.formGrid}>
              <div style={s.formGroup}>
                <label style={s.formLabel}>患者姓名</label>
                <input style={s.formInput} value={form.patientName || ''} onChange={e => setForm(p => ({ ...p, patientName: e.target.value }))} />
              </div>
              <div style={s.formGroup}>
                <label style={s.formLabel}>性别</label>
                <select style={s.formSelect} value={form.gender || '男'} onChange={e => setForm(p => ({ ...p, gender: e.target.value as any }))}>
                  <option value="男">男</option>
                  <option value="女">女</option>
                </select>
              </div>
              <div style={s.formGroup}>
                <label style={s.formLabel}>年龄</label>
                <input style={s.formInput} type="number" value={form.age || ''} onChange={e => setForm(p => ({ ...p, age: parseInt(e.target.value) }))} />
              </div>
              <div style={s.formGroup}>
                <label style={s.formLabel}>手术类型</label>
                <select style={s.formSelect} value={form.surgeryType || 'EMR'} onChange={e => setForm(p => ({ ...p, surgeryType: e.target.value as SurgeryType }))}>
                  {SURGERY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div style={s.formGroup}>
                <label style={s.formLabel}>主刀医生</label>
                <select style={s.formSelect} value={form.doctorId || 'U001'} onChange={e => {
                  const doc = DOCTORS.find(d => d.id === e.target.value);
                  setForm(p => ({ ...p, doctorId: e.target.value, doctorName: doc?.name }));
                }}>
                  {DOCTORS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div style={s.formGroup}>
                <label style={s.formLabel}>一助</label>
                <select style={s.formSelect} value={form.assistant1Id || ''} onChange={e => {
                  const asst = ASSISTANTS.find(a => a.id === e.target.value);
                  setForm(p => ({ ...p, assistant1Id: e.target.value, assistant1Name: asst?.name }));
                }}>
                  <option value="">请选择</option>
                  {ASSISTANTS.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div style={s.formGroup}>
                <label style={s.formLabel}>二助</label>
                <select style={s.formSelect} value={form.assistant2Id || ''} onChange={e => {
                  const asst = ASSISTANTS.find(a => a.id === e.target.value);
                  setForm(p => ({ ...p, assistant2Id: e.target.value, assistant2Name: asst?.name }));
                }}>
                  <option value="">请选择</option>
                  {ASSISTANTS.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div style={s.formGroup}>
                <label style={s.formLabel}>麻醉方式</label>
                <select style={s.formSelect} value={form.anesthesiaMethod || '镇静'} onChange={e => setForm(p => ({ ...p, anesthesiaMethod: e.target.value }))}>
                  {ANESTHESIA_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div style={s.formGroup}>
                <label style={s.formLabel}>手术室</label>
                <select style={s.formSelect} value={form.room || '手术室1'} onChange={e => setForm(p => ({ ...p, room: e.target.value }))}>
                  {ROOMS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div style={s.formGroup}>
                <label style={s.formLabel}>预约日期</label>
                <input style={s.formInput} type="date" value={form.date || ''} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
              </div>
              <div style={s.formGroup}>
                <label style={s.formLabel}>开始时间</label>
                <select style={s.formSelect} value={form.startTime || '10:00'} onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))}>
                  {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div style={s.formGroup}>
                <label style={s.formLabel}>预计时长(分钟)</label>
                <input style={s.formInput} type="number" value={form.duration || 60} onChange={e => setForm(p => ({ ...p, duration: parseInt(e.target.value) }))} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={s.formLabel}>特殊需求</label>
                <textarea style={s.formTextarea} value={form.specialNeeds || ''} onChange={e => setForm(p => ({ ...p, specialNeeds: e.target.value }))} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={s.formLabel}>术前准备清单</label>
                <div style={s.checklist}>
                  {PREOP_CHECKLIST.map(item => (
                    <label key={item} style={s.checklistItem}>
                      <input
                        type="checkbox"
                        style={s.checkbox}
                        checked={form.preOpChecklist?.includes(item) || false}
                        onChange={() => toggleChecklist(item)}
                      />
                      {item}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            {conflictError && (
              <div style={{ marginTop: 12, padding: '10px 14px', background: '#fef2f2', borderRadius: 8, color: '#dc2626', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={16} />{conflictError}
              </div>
            )}
            <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
              <button style={{ ...s.btn, ...s.btnPrimary }} onClick={handleSave}>保存</button>
              <button style={{ ...s.btn, ...s.btnSecondary }} onClick={() => setShowModal(false)}>取消</button>
              {editingSurgery && (
                <button style={{ ...s.btn, ...{ background: '#fef2f2', color: '#dc2626', marginLeft: 'auto' } }} onClick={() => { handleDelete(editingSurgery.id); setShowModal(false); }}>
                  <Trash2 size={14} />删除
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
