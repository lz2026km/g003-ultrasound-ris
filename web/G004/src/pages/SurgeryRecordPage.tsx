// @ts-nocheck
// ============================================================
// G004 内镜管理系统 - 手术录像管理页面（优化版）
// ============================================================
import { useState } from 'react';
import {
  Play, Pause, Download, Clock, Video, Users, HardDrive,
  Search, Filter, ChevronLeft, ChevronRight, Star, Eye,
  Calendar, CheckCircle2, AlertCircle, FileText, Trash2,
  Edit2, MoreVertical, FolderOpen, BarChart3, PieChart,
  VideoOff, Plus, Upload, RefreshCw, X, CheckCircle
} from 'lucide-react';

// ==================== 类型定义 ====================
interface SurgeryRecord {
  id: string;
  patientName: string;
  patientId: string;
  surgeryName: string;
  surgeryType: string;
  doctorName: string;
  department: string;
  room: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  size: string;
  status: '已完成' | '录制中' | '已归档' | '损坏';
  recordingStatus: 'recording' | 'completed' | 'archived' | 'damaged';
  quality: '高清' | '超清' | '标清';
  viewCount: number;
  downloadCount: number;
  thumbnail?: string;
}

type TabType = 'onDemand' | 'live' | 'archive' | 'stats';

// ==================== 样式 ====================
const s: Record<string, React.CSSProperties> = {
  root: { padding: 24, background: '#f0f4f8', minHeight: '100vh' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 20, fontWeight: 700, color: '#1a3a5c' },
  headerRight: { display: 'flex', gap: 12, alignItems: 'center' },
  // 按钮样式 - 规范：44px+高度
  btn: { display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: 'none', transition: 'all 0.15s', minHeight: 44 },
  btnPrimary: { background: '#1a3a5c', color: '#fff' },
  btnSecondary: { background: '#fff', color: '#1a3a5c', border: '1px solid #e2e8f0' },
  btnDanger: { background: '#fef2f2', color: '#ef4444', border: '1px solid #fee2e2' },
  // 统计数据行
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 },
  statCard: { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: 16 },
  statIconWrap: { width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statInfo: { flex: 1 },
  statLabel: { fontSize: 12, color: '#64748b', marginBottom: 4 },
  statValue: { fontSize: 24, fontWeight: 700, color: '#1a3a5c' },
  statSub: { fontSize: 11, color: '#94a3b8' },
  // 标签页
  tabs: { display: 'flex', gap: 4, background: '#e8eef5', padding: 4, borderRadius: 10, marginBottom: 20 },
  tab: { padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: 'none', background: 'transparent', color: '#64748b', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 6, minHeight: 44 },
  tabActive: { background: '#fff', color: '#1a3a5c', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  // 搜索栏
  searchBar: { display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' },
  searchInput: { flex: 1, padding: '10px 16px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', background: '#fff', minHeight: 44 },
  filterBtn: { padding: '10px 18px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', minHeight: 44 },
  // 表格
  tableWrap: { background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '14px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' },
  td: { padding: '14px 16px', fontSize: 13, color: '#1a3a5c', borderBottom: '1px solid #f1f5f9' },
  tr: { transition: 'background 0.15s' },
  recordDot: { width: 8, height: 8, borderRadius: '50%', background: '#ef4444', marginRight: 8, display: 'inline-block' },
  badge: { padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 500 },
  badgeDone: { background: '#dcfce7', color: '#16a34a' },
  badgeRecording: { background: '#fef3c7', color: '#d97706' },
  badgeArchived: { background: '#dbeafe', color: '#2563eb' },
  badgeDamaged: { background: '#fee2e2', color: '#dc2626' },
  badgeHD: { background: '#f3e8ff', color: '#9333ea' },
  badgeFHD: { background: '#dbeafe', color: '#2563eb' },
  badgeSD: { background: '#f1f5f9', color: '#64748b' },
  actionBtn: { padding: 8, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 36, minHeight: 36 },
  actionBtnPrimary: { padding: 8, borderRadius: 6, border: 'none', background: '#f0fdf4', cursor: 'pointer', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 36, minHeight: 36 },
  // 分页
  pagination: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: '#f8fafc' },
  pageInfo: { fontSize: 13, color: '#64748b' },
  pageButtons: { display: 'flex', gap: 8 },
  pageBtn: { padding: '8px 14px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, minHeight: 36 },
  pageBtnDisabled: { opacity: 0.5, cursor: 'not-allowed' },
  // 空状态
  emptyState: { textAlign: 'center', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 },
  emptyIcon: { width: 72, height: 72, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  emptyText: { fontSize: 16, color: '#94a3b8', fontWeight: 500 },
  emptySubtext: { fontSize: 13, color: '#cbd5e1' },
  // 归档统计
  archiveStats: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 },
  archiveCard: { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', textAlign: 'center' },
  archiveValue: { fontSize: 28, fontWeight: 700, color: '#1a3a5c' },
  archiveLabel: { fontSize: 12, color: '#64748b', marginTop: 4 },
  // 图表网格
  chartGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 },
  chartCard: { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  chartTitle: { fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 16 },
  barItem: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 },
  barLabel: { width: 80, fontSize: 12, color: '#64748b' },
  barTrack: { flex: 1, height: 10, background: '#f1f5f9', borderRadius: 5, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 5, transition: 'width 0.3s' },
  barValue: { width: 50, fontSize: 12, fontWeight: 600, color: '#1a3a5c', textAlign: 'right' },
  liveIndicator: { display: 'flex', alignItems: 'center', gap: 6 },
  liveDot: { width: 8, height: 8, borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.5s infinite' },
  qualityBadge: { padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 600 },
};

// ==================== 模拟数据 (30条) ====================
const generateRecords = (): SurgeryRecord[] => [
  { id: 'SR001', patientName: '张明华', patientId: 'P20240001', surgeryName: 'ERCP胆管取石术', surgeryType: 'ERCP', doctorName: '李建国', department: '消化内科', room: '手术室1', date: '2026-04-15', startTime: '09:00', endTime: '10:30', duration: 90, size: '4.2GB', status: '已完成', recordingStatus: 'completed', quality: '超清', viewCount: 156, downloadCount: 23 },
  { id: 'SR002', patientName: '王秀英', patientId: 'P20240002', surgeryName: 'ESD胃黏膜剥离术', surgeryType: 'ESD', doctorName: '张伟东', department: '消化内科', room: '手术室2', date: '2026-04-15', startTime: '10:00', endTime: '12:00', duration: 120, size: '5.8GB', status: '已完成', recordingStatus: 'completed', quality: '超清', viewCount: 89, downloadCount: 12 },
  { id: 'SR003', patientName: '刘建军', patientId: 'P20240003', surgeryName: 'EMR结肠息肉切除术', surgeryType: 'EMR', doctorName: '陈晓峰', department: '肛肠外科', room: '手术室3', date: '2026-04-15', startTime: '08:30', endTime: '09:15', duration: 45, size: '2.1GB', status: '已完成', recordingStatus: 'completed', quality: '高清', viewCount: 234, downloadCount: 45 },
  { id: 'SR004', patientName: '陈美玲', patientId: 'P20240004', surgeryName: '超声内镜引导下穿刺', surgeryType: '超声内镜', doctorName: '赵文博', department: '消化内科', room: '手术室1', date: '2026-04-15', startTime: '14:00', endTime: '15:30', duration: 90, size: '4.5GB', status: '已完成', recordingStatus: 'completed', quality: '超清', viewCount: 67, downloadCount: 8 },
  { id: 'SR005', patientName: '周志刚', patientId: 'P20240005', surgeryName: '食管狭窄扩张术', surgeryType: '食管扩张', doctorName: '李建国', department: '消化内科', room: '手术室4', date: '2026-04-14', startTime: '11:00', endTime: '11:40', duration: 40, size: '1.8GB', status: '已完成', recordingStatus: 'completed', quality: '高清', viewCount: 112, downloadCount: 19 },
  { id: 'SR006', patientName: '吴丽娟', patientId: 'P20240006', surgeryName: '胃底静脉曲张组织胶栓塞', surgeryType: '胃底静脉曲张治疗', doctorName: '张伟东', department: '消化内科', room: '手术室2', date: '2026-04-14', startTime: '15:00', endTime: '16:20', duration: 80, size: '3.9GB', status: '已完成', recordingStatus: 'completed', quality: '超清', viewCount: 45, downloadCount: 6 },
  { id: 'SR007', patientName: '郑海涛', patientId: 'P20240007', surgeryName: 'ERCP胆管支架置入术', surgeryType: 'ERCP', doctorName: '王志强', department: '肝胆外科', room: '手术室1', date: '2026-04-14', startTime: '09:30', endTime: '10:45', duration: 75, size: '3.6GB', status: '已完成', recordingStatus: 'completed', quality: '超清', viewCount: 98, downloadCount: 15 },
  { id: 'SR008', patientName: '孙玉芬', patientId: 'P20240008', surgeryName: 'EMR直肠息肉切除术', surgeryType: 'EMR', doctorName: '陈晓峰', department: '肛肠外科', room: '手术室3', date: '2026-04-14', startTime: '14:30', endTime: '15:10', duration: 40, size: '1.9GB', status: '已完成', recordingStatus: 'completed', quality: '高清', viewCount: 178, downloadCount: 32 },
  { id: 'SR009', patientName: '黄文军', patientId: 'P20240009', surgeryName: 'ESD早期胃癌剥离术', surgeryType: 'ESD', doctorName: '李建国', department: '消化内科', room: '手术室2', date: '2026-04-13', startTime: '10:00', endTime: '13:00', duration: 180, size: '8.2GB', status: '已完成', recordingStatus: 'completed', quality: '超清', viewCount: 256, downloadCount: 41 },
  { id: 'SR010', patientName: '林晓东', patientId: 'P20240010', surgeryName: '超声内镜胰腺穿刺', surgeryType: '超声内镜', doctorName: '赵文博', department: '消化内科', room: '手术室1', date: '2026-04-13', startTime: '08:00', endTime: '09:30', duration: 90, size: '4.3GB', status: '已完成', recordingStatus: 'completed', quality: '超清', viewCount: 134, downloadCount: 22 },
  { id: 'SR011', patientName: '杨雪峰', patientId: 'P20240011', surgeryName: '食管支架置入术', surgeryType: '食管扩张', doctorName: '张伟东', department: '消化内科', room: '手术室4', date: '2026-04-13', startTime: '11:30', endTime: '12:15', duration: 45, size: '2.2GB', status: '已完成', recordingStatus: 'completed', quality: '高清', viewCount: 87, downloadCount: 14 },
  { id: 'SR012', patientName: '徐凤英', patientId: 'P20240012', surgeryName: 'ERCP胰管取石术', surgeryType: 'ERCP', doctorName: '王志强', department: '肝胆外科', room: '手术室1', date: '2026-04-13', startTime: '14:00', endTime: '15:20', duration: 80, size: '3.8GB', status: '已完成', recordingStatus: 'completed', quality: '超清', viewCount: 76, downloadCount: 11 },
  { id: 'SR013', patientName: '马建平', patientId: 'P20240013', surgeryName: 'EMR胃息肉切除术', surgeryType: 'EMR', doctorName: '陈晓峰', department: '肛肠外科', room: '手术室3', date: '2026-04-12', startTime: '09:00', endTime: '09:40', duration: 40, size: '1.7GB', status: '已完成', recordingStatus: 'completed', quality: '标清', viewCount: 145, downloadCount: 28 },
  { id: 'SR014', patientName: '朱红梅', patientId: 'P20240014', surgeryName: 'ESD结肠黏膜剥离术', surgeryType: 'ESD', doctorName: '李建国', department: '消化内科', room: '手术室2', date: '2026-04-12', startTime: '10:30', endTime: '13:30', duration: 180, size: '8.5GB', status: '已完成', recordingStatus: 'completed', quality: '超清', viewCount: 198, downloadCount: 35 },
  { id: 'SR015', patientName: '胡志明', patientId: 'P20240015', surgeryName: '胃底静脉曲张套扎术', surgeryType: '胃底静脉曲张治疗', doctorName: '张伟东', department: '消化内科', room: '手术室4', date: '2026-04-12', startTime: '14:30', endTime: '16:00', duration: 90, size: '4.4GB', status: '已完成', recordingStatus: 'completed', quality: '超清', viewCount: 62, downloadCount: 9 },
  { id: 'SR016', patientName: '赵德胜', patientId: 'P20240016', surgeryName: 'ERCP胆管扩张术', surgeryType: 'ERCP', doctorName: '王志强', department: '肝胆外科', room: '手术室1', date: '2026-04-12', startTime: '08:30', endTime: '09:45', duration: 75, size: '3.5GB', status: '已完成', recordingStatus: 'completed', quality: '高清', viewCount: 109, downloadCount: 17 },
  { id: 'SR017', patientName: '刘芳芳', patientId: 'P20240017', surgeryName: '超声内镜纵隔穿刺', surgeryType: '超声内镜', doctorName: '赵文博', department: '消化内科', room: '手术室2', date: '2026-04-11', startTime: '11:00', endTime: '12:30', duration: 90, size: '4.6GB', status: '已完成', recordingStatus: 'completed', quality: '超清', viewCount: 88, downloadCount: 13 },
  { id: 'SR018', patientName: '曹建国', patientId: 'P20240018', surgeryName: 'EMR十二指肠息肉切除', surgeryType: 'EMR', doctorName: '陈晓峰', department: '肛肠外科', room: '手术室3', date: '2026-04-11', startTime: '15:00', endTime: '15:45', duration: 45, size: '2.0GB', status: '已完成', recordingStatus: 'completed', quality: '高清', viewCount: 167, downloadCount: 29 },
  { id: 'SR019', patientName: '许秀兰', patientId: 'P20240019', surgeryName: 'ESD食管早癌剥离', surgeryType: 'ESD', doctorName: '李建国', department: '消化内科', room: '手术室1', date: '2026-04-11', startTime: '09:00', endTime: '12:00', duration: 180, size: '8.8GB', status: '已完成', recordingStatus: 'completed', quality: '超清', viewCount: 287, downloadCount: 52 },
  { id: 'SR020', patientName: '韩梅梅', patientId: 'P20240020', surgeryName: '食管物理扩张术', surgeryType: '食管扩张', doctorName: '张伟东', department: '消化内科', room: '手术室4', date: '2026-04-11', startTime: '14:00', endTime: '14:35', duration: 35, size: '1.5GB', status: '已完成', recordingStatus: 'completed', quality: '标清', viewCount: 93, downloadCount: 16 },
  { id: 'SR021', patientName: '田志刚', patientId: 'P20240021', surgeryName: 'ERCP胰管支架置入', surgeryType: 'ERCP', doctorName: '王志强', department: '肝胆外科', room: '手术室2', date: '2026-04-10', startTime: '10:00', endTime: '11:10', duration: 70, size: '3.4GB', status: '已完成', recordingStatus: 'completed', quality: '高清', viewCount: 72, downloadCount: 10 },
  { id: 'SR022', patientName: '邓丽华', patientId: 'P20240022', surgeryName: '胃底静脉曲张硬化术', surgeryType: '胃底静脉曲张治疗', doctorName: '李建国', department: '消化内科', room: '手术室3', date: '2026-04-10', startTime: '15:30', endTime: '17:00', duration: 90, size: '4.7GB', status: '已完成', recordingStatus: 'completed', quality: '超清', viewCount: 54, downloadCount: 7 },
  { id: 'SR023', patientName: '卢光明', patientId: 'P20240023', surgeryName: 'EMR结肠巨大息肉切除', surgeryType: 'EMR', doctorName: '陈晓峰', department: '肛肠外科', room: '手术室1', date: '2026-04-10', startTime: '08:00', endTime: '09:00', duration: 60, size: '2.8GB', status: '已完成', recordingStatus: 'completed', quality: '高清', viewCount: 203, downloadCount: 38 },
  { id: 'SR024', patientName: '贾晓燕', patientId: 'P20240024', surgeryName: '超声内镜肝脏穿刺', surgeryType: '超声内镜', doctorName: '赵文博', department: '消化内科', room: '手术室4', date: '2026-04-10', startTime: '11:30', endTime: '13:00', duration: 90, size: '4.8GB', status: '已完成', recordingStatus: 'completed', quality: '超清', viewCount: 118, downloadCount: 20 },
  { id: 'SR025', patientName: '崔伟杰', patientId: 'P20240025', surgeryName: 'ESD直肠黏膜剥离术', surgeryType: 'ESD', doctorName: '张伟东', department: '消化内科', room: '手术室2', date: '2026-04-09', startTime: '14:00', endTime: '17:00', duration: 180, size: '9.1GB', status: '已完成', recordingStatus: 'completed', quality: '超清', viewCount: 321, downloadCount: 67 },
  { id: 'SR026', patientName: '钱铁生', patientId: 'P20240026', surgeryName: 'ERCP胆管取石术', surgeryType: 'ERCP', doctorName: '李建国', department: '消化内科', room: '手术室1', date: '2026-04-09', startTime: '09:00', endTime: '10:15', duration: 75, size: '3.6GB', status: '已完成', recordingStatus: 'completed', quality: '高清', viewCount: 84, downloadCount: 14 },
  { id: 'SR027', patientName: '沈婷婷', patientId: 'P20240027', surgeryName: '胃镜精查演示', surgeryType: '胃镜', doctorName: '张伟东', department: '消化内科', room: '手术室3', date: '2026-04-08', startTime: '10:00', endTime: '10:35', duration: 35, size: '1.6GB', status: '已完成', recordingStatus: 'completed', quality: '超清', viewCount: 102, downloadCount: 18 },
  { id: 'SR028', patientName: '唐志明', patientId: 'P20240028', surgeryName: '结肠镜检查示教', surgeryType: '肠镜', doctorName: '陈晓峰', department: '肛肠外科', room: '手术室2', date: '2026-04-08', startTime: '14:00', endTime: '14:30', duration: 30, size: '1.4GB', status: '已完成', recordingStatus: 'completed', quality: '高清', viewCount: 76, downloadCount: 11 },
  { id: 'SR029', patientName: '余晓丽', patientId: 'P20240029', surgeryName: '食管早癌ESD剥离', surgeryType: 'ESD', doctorName: '李建国', department: '消化内科', room: '手术室1', date: '2026-04-07', startTime: '09:00', endTime: '12:00', duration: 180, size: '8.9GB', status: '已完成', recordingStatus: 'completed', quality: '超清', viewCount: 245, downloadCount: 48 },
  { id: 'SR030', patientName: '梁建新', patientId: 'P20240030', surgeryName: '超声内镜脾脏穿刺', surgeryType: '超声内镜', doctorName: '赵文博', department: '消化内科', room: '手术室4', date: '2026-04-07', startTime: '11:00', endTime: '12:00', duration: 60, size: '3.0GB', status: '已完成', recordingStatus: 'completed', quality: '超清', viewCount: 68, downloadCount: 9 },
];

// 模拟正在录制的手术
const liveRecords: SurgeryRecord[] = [
  { id: 'LIV001', patientName: '钱铁生', patientId: 'P20240026', surgeryName: 'ERCP胆管取石术', surgeryType: 'ERCP', doctorName: '李建国', department: '消化内科', room: '手术室1', date: '2026-04-30', startTime: '09:00', endTime: '--:--', duration: 45, size: '2.1GB', status: '录制中', recordingStatus: 'recording', quality: '超清', viewCount: 23, downloadCount: 0 },
  { id: 'LIV002', patientName: '沈婷婷', patientId: 'P20240027', surgeryName: 'ESD胃窦黏膜剥离', surgeryType: 'ESD', doctorName: '张伟东', department: '消化内科', room: '手术室2', date: '2026-04-30', startTime: '10:30', endTime: '--:--', duration: 30, size: '1.5GB', status: '录制中', recordingStatus: 'recording', quality: '超清', viewCount: 12, downloadCount: 0 },
];

// 模拟归档数据
const archiveStats = {
  totalSize: '128.5GB',
  totalCount: 847,
  oldestDate: '2025-01-15',
};

// ==================== 组件 ====================
const RecordingDot = () => (
  <span style={s.recordDot} className="recording-dot" />
);

const QualityBadge = ({ quality }: { quality: string }) => {
  const style = quality === '超清' ? s.badgeFHD : quality === '高清' ? s.badgeHD : s.badgeSD;
  return <span style={{...s.badge, ...style}}>{quality}</span>;
};

const StatusBadge = ({ status }: { status: string }) => {
  const styleMap: Record<string, React.CSSProperties> = {
    '已完成': s.badgeDone,
    '录制中': s.badgeRecording,
    '已归档': s.badgeArchived,
    '损坏': s.badgeDamaged,
  };
  const isRecording = status === '录制中';
  return (
    <span style={{...s.badge, ...styleMap[status]}}>
      {isRecording && <RecordingDot />}
      {status}
    </span>
  );
};

const TableRow = ({ record, onPlay, onDownload, onArchive }: { record: SurgeryRecord; onPlay: () => void; onDownload: () => void; onArchive: () => void }) => (
  <tr style={s.tr}>
    <td style={{ ...s.td, fontWeight: 500 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Video size={16} color="#1a3a5c" />
        <div>
          <div>{record.surgeryName}</div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>{record.id}</div>
        </div>
      </div>
    </td>
    <td style={s.td}>
      <div>{record.patientName}</div>
      <div style={{ fontSize: 11, color: '#94a3b8' }}>{record.patientId}</div>
    </td>
    <td style={s.td}>
      <span style={{ padding: '3px 8px', borderRadius: 4, fontSize: 11, background: '#f1f5f9', color: '#64748b' }}>
        {record.surgeryType}
      </span>
    </td>
    <td style={s.td}>
      <div>{record.doctorName}</div>
      <div style={{ fontSize: 11, color: '#94a3b8' }}>{record.department}</div>
    </td>
    <td style={s.td}>
      <div>{record.date}</div>
      <div style={{ fontSize: 11, color: '#94a3b8' }}>{record.startTime} - {record.endTime}</div>
    </td>
    <td style={s.td}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Clock size={14} color="#64748b" />
        {record.duration}分钟
      </div>
    </td>
    <td style={s.td}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <HardDrive size={14} color="#64748b" />
        {record.size}
      </div>
    </td>
    <td style={s.td}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Eye size={14} color="#64748b" />
        {record.viewCount}
      </div>
    </td>
    <td style={s.td}>
      <QualityBadge quality={record.quality} />
    </td>
    <td style={s.td}>
      <StatusBadge status={record.status} />
    </td>
    <td style={s.td}>
      <div style={{ display: 'flex', gap: 4 }}>
        <button style={s.actionBtnPrimary} onClick={onPlay} title="播放录像">
          <Play size={16} />
        </button>
        <button style={s.actionBtn} onClick={onDownload} title="下载录像">
          <Download size={16} color="#2563eb" />
        </button>
        {record.recordingStatus === 'completed' && (
          <button style={s.actionBtn} onClick={onArchive} title="归档">
            <FolderOpen size={16} color="#9333ea" />
          </button>
        )}
        <button style={s.actionBtn} title="更多操作">
          <MoreVertical size={16} />
        </button>
      </div>
    </td>
  </tr>
);

const LiveRow = ({ record }: { record: SurgeryRecord }) => (
  <tr style={s.tr}>
    <td style={{ ...s.td, fontWeight: 500 }}>
      <div style={s.liveIndicator}>
        <span style={s.liveDot} />
        <Video size={16} color="#ef4444" />
        <span style={{ color: '#ef4444', fontSize: 11, fontWeight: 600 }}>直播中</span>
      </div>
      <div style={{ marginTop: 4 }}>{record.surgeryName}</div>
    </td>
    <td style={s.td}>
      <div>{record.patientName}</div>
      <div style={{ fontSize: 11, color: '#94a3b8' }}>{record.patientId}</div>
    </td>
    <td style={s.td}>{record.surgeryType}</td>
    <td style={s.td}>
      <div>{record.doctorName}</div>
      <div style={{ fontSize: 11, color: '#94a3b8' }}>{record.department}</div>
    </td>
    <td style={s.td}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Clock size={14} color="#64748b" />
        <span style={{ color: '#ef4444', fontWeight: 600 }}>{record.duration}分钟</span>
      </div>
    </td>
    <td style={s.td}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Eye size={14} color="#64748b" />
        {record.viewCount}
      </div>
    </td>
    <td style={s.td}>
      <QualityBadge quality={record.quality} />
    </td>
    <td style={s.td}>
      <div style={{ display: 'flex', gap: 4 }}>
        <button style={{ ...s.btn, ...s.btnPrimary, padding: '8px 14px', fontSize: 12, minHeight: 36 }}>
          <Play size={14} />观看直播
        </button>
      </div>
    </td>
  </tr>
);

const ArchiveStatsCard = ({ title, value, sub, color }: { title: string; value: string; sub: string; color: string }) => (
  <div style={s.archiveCard}>
    <div style={{ fontSize: 14, color: '#64748b', marginBottom: 8 }}>{title}</div>
    <div style={{ ...s.archiveValue, color }}>{value}</div>
    <div style={s.archiveLabel}>{sub}</div>
  </div>
);

const BarChart = ({ data }: { data: { label: string; value: number; total: number; color: string }[] }) => (
  <div>
    {data.map((item, i) => (
      <div key={i} style={s.barItem}>
        <div style={s.barLabel}>{item.label}</div>
        <div style={s.barTrack}>
          <div style={{ ...s.barFill, width: `${(item.value / item.total) * 100}%`, background: item.color }} />
        </div>
        <div style={s.barValue}>{item.value}次</div>
      </div>
    ))}
  </div>
);

// ==================== 主组件 ====================
export default function SurgeryRecordPage() {
  const [activeTab, setActiveTab] = useState<TabType>('onDemand');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterType, setFilterType] = useState('全部');
  const [filterQuality, setFilterQuality] = useState('全部');
  const [filterStatus, setFilterStatus] = useState('全部');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const allRecords = generateRecords();

  const filteredRecords = allRecords.filter(r => {
    const matchSearch = r.patientName.includes(searchKeyword) ||
                        r.surgeryName.includes(searchKeyword) ||
                        r.doctorName.includes(searchKeyword) ||
                        r.id.includes(searchKeyword);
    const matchType = filterType === '全部' || r.surgeryType === filterType;
    const matchQuality = filterQuality === '全部' || r.quality === filterQuality;
    const matchStatus = filterStatus === '全部' || r.status === filterStatus;
    return matchSearch && matchType && matchQuality && matchStatus;
  });

  const paginatedRecords = filteredRecords.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filteredRecords.length / pageSize);

  const surgeryTypes = ['全部', ...Array.from(new Set(allRecords.map(r => r.surgeryType)))];
  const qualities = ['全部', '超清', '高清', '标清'];
  const statuses = ['全部', '已完成', '录制中', '已归档', '损坏'];

  const handlePlay = (id: string) => console.log('播放录像:', id);
  const handleDownload = (id: string) => console.log('下载录像:', id);
  const handleArchive = (id: string) => console.log('归档录像:', id);

  return (
    <div style={s.root}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
        tr:hover { background: #f8fafc; cursor: pointer; }
      `}</style>

      {/* Header */}
      <div style={s.header}>
        <div style={s.title}>手术录像管理</div>
        <div style={s.headerRight}>
          <button style={{ ...s.btn, ...s.btnSecondary }}>
            <Upload size={16} />导入录像
          </button>
          <button style={{ ...s.btn, ...s.btnSecondary }}>
            <Download size={16} />导出报表
          </button>
          <button style={{ ...s.btn, ...s.btnPrimary }}>
            <Video size={16} />新建录制任务
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div style={s.statsRow}>
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, background: '#dbeafe' }}>
            <Video size={24} color="#2563eb" />
          </div>
          <div style={s.statInfo}>
            <div style={s.statLabel}>录像总数</div>
            <div style={s.statValue}>872</div>
            <div style={s.statSub}>本月新增 45 条</div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, background: '#dcfce7' }}>
            <Clock size={24} color="#16a34a" />
          </div>
          <div style={s.statInfo}>
            <div style={s.statLabel}>总录制时长</div>
            <div style={s.statValue}>1,248h</div>
            <div style={s.statSub}>平均单台 86min</div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, background: '#fef3c7' }}>
            <Eye size={24} color="#d97706" />
          </div>
          <div style={s.statInfo}>
            <div style={s.statLabel}>总播放次数</div>
            <div style={s.statValue}>23,456</div>
            <div style={s.statSub}>本周 1,234 次</div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, background: '#f3e8ff' }}>
            <HardDrive size={24} color="#9333ea" />
          </div>
          <div style={s.statInfo}>
            <div style={s.statLabel}>存储用量</div>
            <div style={s.statValue}>2.8TB</div>
            <div style={s.statSub}>共 872 个文件</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={s.tabs}>
        <button
          style={{ ...s.tab, ...(activeTab === 'onDemand' ? s.tabActive : {}) }}
          onClick={() => setActiveTab('onDemand')}
        >
          <Play size={16} />点播回放
        </button>
        <button
          style={{ ...s.tab, ...(activeTab === 'live' ? s.tabActive : {}) }}
          onClick={() => setActiveTab('live')}
        >
          <span style={s.liveDot} />
          直播管理
        </button>
        <button
          style={{ ...s.tab, ...(activeTab === 'archive' ? s.tabActive : {}) }}
          onClick={() => setActiveTab('archive')}
        >
          <FolderOpen size={16} />归档管理
        </button>
        <button
          style={{ ...s.tab, ...(activeTab === 'stats' ? s.tabActive : {}) }}
          onClick={() => setActiveTab('stats')}
        >
          <BarChart3 size={16} />统计报表
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'onDemand' && (
        <>
          {/* Search Bar */}
          <div style={s.searchBar}>
            <input
              style={s.searchInput}
              placeholder="搜索患者姓名、手术名称、术者或录像ID..."
              value={searchKeyword}
              onChange={(e) => { setSearchKeyword(e.target.value); setPage(1); }}
            />
            <select
              style={{ ...s.filterBtn, appearance: 'none', cursor: 'pointer' }}
              value={filterType}
              onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
            >
              {surgeryTypes.map(type => (
                <option key={type} value={type}>{type === '全部' ? '全部类型' : type}</option>
              ))}
            </select>
            <select
              style={{ ...s.filterBtn, appearance: 'none', cursor: 'pointer' }}
              value={filterQuality}
              onChange={(e) => { setFilterQuality(e.target.value); setPage(1); }}
            >
              {qualities.map(q => (
                <option key={q} value={q}>{q === '全部' ? '全部清晰度' : q}</option>
              ))}
            </select>
            <select
              style={{ ...s.filterBtn, appearance: 'none', cursor: 'pointer' }}
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            >
              {statuses.map(st => (
                <option key={st} value={st}>{st === '全部' ? '全部状态' : st}</option>
              ))}
            </select>
          </div>

          {/* Table */}
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>手术信息</th>
                  <th style={s.th}>患者</th>
                  <th style={s.th}>类型</th>
                  <th style={s.th}>术者/科室</th>
                  <th style={s.th}>日期/时间</th>
                  <th style={s.th}>时长</th>
                  <th style={s.th}>大小</th>
                  <th style={s.th}>播放</th>
                  <th style={s.th}>清晰度</th>
                  <th style={s.th}>状态</th>
                  <th style={s.th}>操作</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRecords.length > 0 ? paginatedRecords.map((record) => (
                  <TableRow
                    key={record.id}
                    record={record}
                    onPlay={() => handlePlay(record.id)}
                    onDownload={() => handleDownload(record.id)}
                    onArchive={() => handleArchive(record.id)}
                  />
                )) : (
                  <tr>
                    <td colSpan={11}>
                      <div style={s.emptyState}>
                        <div style={s.emptyIcon}>
                          <VideoOff size={32} color="#94a3b8" />
                        </div>
                        <div style={s.emptyText}>暂无符合条件的录像记录</div>
                        <div style={s.emptySubtext}>请调整搜索条件或筛选条件</div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {filteredRecords.length > 0 && (
              <div style={s.pagination}>
                <div style={s.pageInfo}>
                  显示 {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, filteredRecords.length)} 条，共 {filteredRecords.length} 条
                </div>
                <div style={s.pageButtons}>
                  <button
                    style={{ ...s.pageBtn, ...(page === 1 ? s.pageBtnDisabled : {}) }}
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    <ChevronLeft size={14} />上一页
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let p = i + 1;
                    if (totalPages > 5) {
                      if (page > 3) p = page - 2 + i;
                      if (page > totalPages - 2) p = totalPages - 4 + i;
                    }
                    return (
                      <button
                        key={p}
                        style={{ ...s.pageBtn, ...(page === p ? { background: '#1a3a5c', color: '#fff' } : {}) }}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </button>
                    );
                  })}
                  <button
                    style={{ ...s.pageBtn, ...(page === totalPages ? s.pageBtnDisabled : {}) }}
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    下一页<ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'live' && (
        <>
          <div style={s.searchBar}>
            <input
              style={s.searchInput}
              placeholder="搜索直播手术..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
            <button style={{ ...s.btn, ...s.btnSecondary }}>
              <RefreshCw size={14} />刷新状态
            </button>
          </div>
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>直播手术</th>
                  <th style={s.th}>患者</th>
                  <th style={s.th}>类型</th>
                  <th style={s.th}>术者/科室</th>
                  <th style={s.th}>已录制</th>
                  <th style={s.th}>观看</th>
                  <th style={s.th}>清晰度</th>
                  <th style={s.th}>操作</th>
                </tr>
              </thead>
              <tbody>
                {liveRecords.length > 0 ? liveRecords.map((record) => (
                  <LiveRow key={record.id} record={record} />
                )) : (
                  <tr>
                    <td colSpan={8}>
                      <div style={s.emptyState}>
                        <div style={s.emptyIcon}>
                          <VideoOff size={32} color="#94a3b8" />
                        </div>
                        <div style={s.emptyText}>当前没有正在直播的手术</div>
                        <div style={s.emptySubtext}>如有手术开始录制，将会显示在此处</div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === 'archive' && (
        <>
          <div style={s.archiveStats}>
            <ArchiveStatsCard title="归档总容量" value={archiveStats.totalSize} sub="已归档文件" color="#9333ea" />
            <ArchiveStatsCard title="归档文件数" value={String(archiveStats.totalCount)} sub="个文件" color="#2563eb" />
            <ArchiveStatsCard title="最早归档日期" value={archiveStats.oldestDate} sub="起始时间" color="#64748b" />
          </div>
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>手术信息</th>
                  <th style={s.th}>患者</th>
                  <th style={s.th}>类型</th>
                  <th style={s.th}>术者/科室</th>
                  <th style={s.th}>归档日期</th>
                  <th style={s.th}>大小</th>
                  <th style={s.th}>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={7}>
                    <div style={s.emptyState}>
                      <div style={s.emptyIcon}>
                        <FolderOpen size={32} color="#94a3b8" />
                      </div>
                      <div style={s.emptyText}>归档记录为空</div>
                      <div style={s.emptySubtext}>可将已完成的录像归档以释放存储空间</div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === 'stats' && (
        <div style={s.chartGrid}>
          <div style={s.chartCard}>
            <div style={s.chartTitle}>手术类型分布</div>
            <BarChart data={[
              { label: 'ESD', value: 45, total: 100, color: '#3b82f6' },
              { label: 'EMR', value: 38, total: 100, color: '#22c55e' },
              { label: 'ERCP', value: 28, total: 100, color: '#f97316' },
              { label: '超声内镜', value: 22, total: 100, color: '#8b5cf6' },
              { label: '其他', value: 15, total: 100, color: '#64748b' },
            ]} />
          </div>
          <div style={s.chartCard}>
            <div style={s.chartTitle}>录像清晰度分布</div>
            <BarChart data={[
              { label: '超清', value: 56, total: 100, color: '#3b82f6' },
              { label: '高清', value: 32, total: 100, color: '#22c55e' },
              { label: '标清', value: 12, total: 100, color: '#94a3b8' },
            ]} />
          </div>
        </div>
      )}
    </div>
  );
}
