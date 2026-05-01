// @ts-nocheck
// ============================================================
// G004 内镜管理系统 - 手术示教系统页面（优化版）
// ============================================================
import { useState } from 'react';
import {
  Play, Pause, Volume2, VolumeX, Maximize, Settings, Send,
  User, Clock, Users, Activity, Scissors, AlertCircle, CheckCircle2,
  Video, MessageSquare, UserPlus, Wifi, Eye, Calendar, Timer,
  Search, Filter, RefreshCw, Plus, VideoOff, UserCheck, Mic
} from 'lucide-react';

// ==================== 类型定义 ====================
interface SurgeryRecord {
  id: string;
  name: string;
  type: string;
  date: string;
  duration: string;
  viewers: number;
  doctor: string;
  room: string;
}

interface Doctor {
  id: string;
  name: string;
  title: string;
  avatar: string;
  online: boolean;
}

interface Question {
  id: string;
  user: string;
  content: string;
  time: string;
}

interface Medication {
  name: string;
  dose: string;
  time: string;
}

// ==================== 样式 ====================
const s: Record<string, React.CSSProperties> = {
  root: { padding: 24, background: '#f0f4f8', minHeight: '100vh' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 20, fontWeight: 700, color: '#1a3a5c' },
  liveTag: { display: 'flex', alignItems: 'center', gap: 6, background: '#16a34a', color: '#fff', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
  headerRight: { display: 'flex', gap: 12, alignItems: 'center' },
  // 按钮样式 - 规范：44px+高度
  btn: { display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: 'none', transition: 'all 0.15s', minHeight: 44 },
  btnPrimary: { background: '#1a3a5c', color: '#fff' },
  btnSecondary: { background: '#fff', color: '#1a3a5c', border: '1px solid #e2e8f0' },
  btnSuccess: { background: '#16a34a', color: '#fff' },
  btnIcon: { padding: '10px', minWidth: 44, minHeight: 44, justifyContent: 'center' },
  // 搜索栏
  searchBar: { display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' },
  searchInput: { flex: 1, padding: '10px 16px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', background: '#fff', minHeight: 44 },
  filterBtn: { padding: '10px 18px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', minHeight: 44 },
  // 统计数据行
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 },
  statCard: { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: 16 },
  statIconWrap: { width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statInfo: { flex: 1 },
  statLabel: { fontSize: 12, color: '#64748b', marginBottom: 4 },
  statValue: { fontSize: 24, fontWeight: 700, color: '#1a3a5c' },
  statSub: { fontSize: 11, color: '#94a3b8' },
  // 主网格
  mainGrid: { display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 },
  videoSection: { background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  videoArea: { position: 'relative', background: '#0f2744', aspectRatio: '16/9' },
  videoPlaceholder: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff' },
  videoOverlay: { position: 'absolute', top: 16, left: 16, display: 'flex', gap: 8 },
  liveBadge: { background: '#ef4444', padding: '4px 10px', borderRadius: 4, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 },
  recordBadge: { background: 'rgba(0,0,0,0.6)', padding: '4px 10px', borderRadius: 4, fontSize: 11, color: '#fff' },
  videoTitle: { fontSize: 18, fontWeight: 700, marginTop: 16, textAlign: 'center' },
  videoSubtitle: { fontSize: 13, color: '#94a3b8', marginTop: 8 },
  controlsBar: { background: '#1e3a5f', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 },
  controlBtn: { background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: 8, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s', minWidth: 44, minHeight: 44 },
  progressBar: { flex: 1, height: 4, background: 'rgba(255,255,255,0.3)', borderRadius: 2, cursor: 'pointer', position: 'relative' },
  progressFill: { position: 'absolute', left: 0, top: 0, height: '100%', background: '#3b82f6', borderRadius: 2, width: '35%' },
  volumeWrap: { display: 'flex', alignItems: 'center', gap: 6 },
  volumeSlider: { width: 60, height: 4, background: 'rgba(255,255,255,0.3)', borderRadius: 2, position: 'relative', cursor: 'pointer' },
  volumeFill: { position: 'absolute', left: 0, top: 0, height: '100%', background: '#fff', borderRadius: 2, width: '70%' },
  qualitySelect: { background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '8px 12px', borderRadius: 4, fontSize: 12, cursor: 'pointer', minHeight: 36 },
  timeDisplay: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  videoListSection: { padding: 16 },
  sectionTitle: { fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 12 },
  videoList: { display: 'flex', flexDirection: 'column', gap: 8 },
  videoCard: { display: 'flex', gap: 12, padding: 12, borderRadius: 8, border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.15s', background: '#fff' },
  videoThumb: { width: 80, height: 50, background: '#1e3a5f', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  videoCardInfo: { flex: 1, minWidth: 0 },
  videoCardName: { fontSize: 12, fontWeight: 600, color: '#1a3a5c', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  videoCardMeta: { fontSize: 11, color: '#94a3b8' },
  videoCardViewers: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#64748b' },
  rightPanel: { display: 'flex', flexDirection: 'column', gap: 16 },
  infoCard: { background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  cardHeader: { padding: '14px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 8 },
  cardTitle: { fontSize: 14, fontWeight: 600, color: '#1a3a5c' },
  cardBody: { padding: 16 },
  patientInfo: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  infoItem: { display: 'flex', flexDirection: 'column', gap: 2 },
  infoLabel: { fontSize: 11, color: '#94a3b8' },
  infoValue: { fontSize: 13, color: '#1a3a5c', fontWeight: 500 },
  infoValueFull: { fontSize: 13, color: '#1a3a5c', fontWeight: 500, gridColumn: '1 / -1' },
  surgeryDetail: { display: 'flex', flexDirection: 'column', gap: 8 },
  detailRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  detailLabel: { fontSize: 12, color: '#64748b' },
  detailValue: { fontSize: 12, color: '#1a3a5c', fontWeight: 500 },
  timeline: { display: 'flex', flexDirection: 'column', gap: 0 },
  timelineItem: { display: 'flex', alignItems: 'flex-start', gap: 12, position: 'relative' },
  timelineDot: { width: 12, height: 12, borderRadius: '50%', background: '#e2e8f0', border: '2px solid #fff', flexShrink: 0, marginTop: 4, zIndex: 1 },
  timelineDotActive: { background: '#3b82f6' },
  timelineDotComplete: { background: '#16a34a' },
  timelineLine: { position: 'absolute', left: 5, top: 16, width: 2, height: 'calc(100% - 8px)', background: '#e2e8f0' },
  timelineLineComplete: { background: '#16a34a' },
  timelineContent: { paddingBottom: 16 },
  timelineTitle: { fontSize: 12, fontWeight: 600, color: '#1a3a5c' },
  timelineTitleDone: { color: '#16a34a' },
  timelineTitleActive: { color: '#3b82f6' },
  timelineTime: { fontSize: 10, color: '#94a3b8', marginTop: 2 },
  realtimeParams: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  paramItem: { background: '#f8fafc', padding: 12, borderRadius: 8, textAlign: 'center' },
  paramValue: { fontSize: 18, fontWeight: 700, color: '#1a3a5c' },
  paramUnit: { fontSize: 10, color: '#94a3b8', marginTop: 2 },
  paramLabel: { fontSize: 11, color: '#64748b', marginTop: 4 },
  medicationList: { display: 'flex', flexDirection: 'column', gap: 8 },
  medicationItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: '#f8fafc', borderRadius: 6 },
  medName: { fontSize: 12, fontWeight: 500, color: '#1a3a5c' },
  medDose: { fontSize: 11, color: '#64748b' },
  medTime: { fontSize: 10, color: '#94a3b8' },
  chatSection: { flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 },
  chatHeader: { padding: '12px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  onlineCount: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#16a34a' },
  chatMessages: { flex: 1, overflow: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 10, minHeight: 150, maxHeight: 200 },
  chatMsg: { display: 'flex', gap: 8 },
  chatAvatar: { width: 28, height: 28, borderRadius: '50%', background: '#1e3a5f', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, flexShrink: 0 },
  chatBubble: { flex: 1, background: '#f1f5f9', padding: '8px 10px', borderRadius: '0 8px 8px 8px' },
  chatUser: { fontSize: 11, fontWeight: 600, color: '#1a3a5c' },
  chatText: { fontSize: 12, color: '#475569', marginTop: 2 },
  chatInput: { display: 'flex', gap: 8, padding: 12, borderTop: '1px solid #f1f5f9' },
  chatInputField: { flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', minHeight: 44 },
  sendBtn: { padding: '10px 16px', background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', minHeight: 44 },
  onlineList: { padding: 12, display: 'flex', flexDirection: 'column', gap: 8 },
  onlineItem: { display: 'flex', alignItems: 'center', gap: 10 },
  onlineAvatar: { width: 32, height: 32, borderRadius: '50%', background: '#1e3a5f', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, position: 'relative' },
  onlineDot: { position: 'absolute', bottom: 0, right: 0, width: 8, height: 8, borderRadius: '50%', background: '#16a34a', border: '2px solid #fff' },
  onlineDotOffline: { background: '#94a3b8' },
  onlineInfo: { flex: 1 },
  onlineName: { fontSize: 12, fontWeight: 500, color: '#1a3a5c' },
  onlineTitle: { fontSize: 10, color: '#94a3b8' },
  // 空状态样式
  emptyState: { textAlign: 'center', padding: '48px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 },
  emptyIcon: { width: 64, height: 64, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#94a3b8', textAlign: 'center' },
  emptySubtext: { fontSize: 12, color: '#cbd5e1', marginTop: 4 },
};

// ==================== 模拟数据 (30条录像) ====================
const VIDEO_RECORDS: SurgeryRecord[] = [
  { id: '1', name: '胃镜ESD手术-实时示教', type: 'ESD', date: '2026-04-30', duration: '02:35:00', viewers: 156, doctor: '张明华', room: '手术室3' },
  { id: '2', name: '结肠镜EMR切除术', type: 'EMR', date: '2026-04-29', duration: '01:22:00', viewers: 89, doctor: '李建国', room: '手术室1' },
  { id: '3', name: 'ERCP胆管取石术', type: 'ERCP', date: '2026-04-29', duration: '01:45:00', viewers: 112, doctor: '王志强', room: '手术室2' },
  { id: '4', name: '超声内镜引导下穿刺', type: '超声内镜', date: '2026-04-28', duration: '00:58:00', viewers: 67, doctor: '赵文博', room: '手术室1' },
  { id: '5', name: '食管扩张术示教', type: '食管扩张', date: '2026-04-28', duration: '00:42:00', viewers: 45, doctor: '张伟东', room: '手术室4' },
  { id: '6', name: '胃底静脉曲张栓塞术', type: '胃底静脉曲张治疗', date: '2026-04-27', duration: '01:15:00', viewers: 78, doctor: '李建国', room: '手术室2' },
  { id: '7', name: '结肠巨大息肉切除', type: 'EMR', date: '2026-04-27', duration: '00:55:00', viewers: 93, doctor: '陈晓峰', room: '手术室3' },
  { id: '8', name: '早期胃癌剥离术', type: 'ESD', date: '2026-04-26', duration: '02:20:00', viewers: 134, doctor: '张明华', room: '手术室1' },
  { id: '9', name: 'ERCP胰管支架置入', type: 'ERCP', date: '2026-04-26', duration: '01:10:00', viewers: 86, doctor: '王志强', room: '手术室2' },
  { id: '10', name: '直肠黏膜剥离术', type: 'ESD', date: '2026-04-25', duration: '01:50:00', viewers: 108, doctor: '张伟东', room: '手术室3' },
  { id: '11', name: '超声内镜肝脏穿刺', type: '超声内镜', date: '2026-04-25', duration: '00:45:00', viewers: 56, doctor: '赵文博', room: '手术室1' },
  { id: '12', name: '肠镜复查示教', type: '肠镜', date: '2026-04-24', duration: '00:35:00', viewers: 42, doctor: '陈晓峰', room: '手术室3' },
  { id: '13', name: '胃镜精查演示', type: '胃镜', date: '2026-04-24', duration: '00:40:00', viewers: 65, doctor: '李建国', room: '手术室2' },
  { id: '14', name: '食管支架置入术', type: '食管扩张', date: '2026-04-23', duration: '00:50:00', viewers: 72, doctor: '张伟东', room: '手术室4' },
  { id: '15', name: '结肠息肉切除术', type: 'EMR', date: '2026-04-23', duration: '00:38:00', viewers: 88, doctor: '陈晓峰', room: '手术室1' },
  { id: '16', name: '胃底静脉曲张套扎', type: '胃底静脉曲张治疗', date: '2026-04-22', duration: '01:05:00', viewers: 61, doctor: '李建国', room: '手术室2' },
  { id: '17', name: 'ERCP胆管扩张术', type: 'ERCP', date: '2026-04-22', duration: '00:55:00', viewers: 79, doctor: '王志强', room: '手术室3' },
  { id: '18', name: '超声内镜纵隔穿刺', type: '超声内镜', date: '2026-04-21', duration: '01:00:00', viewers: 55, doctor: '赵文博', room: '手术室1' },
  { id: '19', name: 'ESD结肠早癌剥离', type: 'ESD', date: '2026-04-21', duration: '02:10:00', viewers: 121, doctor: '张明华', room: '手术室2' },
  { id: '20', name: '胃镜异物取出术', type: '胃镜', date: '2026-04-20', duration: '00:25:00', viewers: 95, doctor: '李建国', room: '手术室4' },
  { id: '21', name: 'EMR十二指肠息肉切除', type: 'EMR', date: '2026-04-20', duration: '00:42:00', viewers: 67, doctor: '陈晓峰', room: '手术室1' },
  { id: '22', name: '食管物理扩张术', type: '食管扩张', date: '2026-04-19', duration: '00:35:00', viewers: 48, doctor: '张伟东', room: '手术室3' },
  { id: '23', name: '结肠镜检查示教', type: '肠镜', date: '2026-04-19', duration: '00:30:00', viewers: 38, doctor: '王志强', room: '手术室2' },
  { id: '24', name: '胃底静脉曲张硬化术', type: '胃底静脉曲张治疗', date: '2026-04-18', duration: '01:12:00', viewers: 58, doctor: '李建国', room: '手术室1' },
  { id: '25', name: '超声内镜胰腺穿刺', type: '超声内镜', date: '2026-04-18', duration: '00:55:00', viewers: 73, doctor: '赵文博', room: '手术室4' },
  { id: '26', name: 'ERCP胰管取石术', type: 'ERCP', date: '2026-04-17', duration: '01:20:00', viewers: 82, doctor: '王志强', room: '手术室2' },
  { id: '27', name: '胃镜检查演示', type: '胃镜', date: '2026-04-17', duration: '00:28:00', viewers: 52, doctor: '张明华', room: '手术室3' },
  { id: '28', name: 'EMR胃息肉切除术', type: 'EMR', date: '2026-04-16', duration: '00:40:00', viewers: 76, doctor: '陈晓峰', room: '手术室1' },
  { id: '29', name: '食管早癌ESD剥离', type: 'ESD', date: '2026-04-16', duration: '02:05:00', viewers: 118, doctor: '张伟东', room: '手术室2' },
  { id: '30', name: '结肠镜息肉切除', type: '肠镜', date: '2026-04-15', duration: '00:32:00', viewers: 44, doctor: '王志强', room: '手术室4' },
];

const DOCTORS: Doctor[] = [
  { id: '1', name: '张明华', title: '主任医师', avatar: '张', online: true },
  { id: '2', name: '李建国', title: '副主任医师', avatar: '李', online: true },
  { id: '3', name: '王秀英', title: '主治医师', avatar: '王', online: true },
  { id: '4', name: '刘德伟', title: '住院医师', avatar: '刘', online: true },
  { id: '5', name: '陈晓燕', title: '主管护师', avatar: '陈', online: false },
  { id: '6', name: '赵志远', title: '住院医师', avatar: '赵', online: true },
];

const QUESTIONS: Question[] = [
  { id: '1', user: '李建国', content: '请问黏膜下注射使用的是哪种液体？', time: '10:23' },
  { id: '2', user: '王秀英', content: '标记点之间的间距是多少？', time: '10:25' },
  { id: '3', user: '刘德伟', content: '剥离深度如何把握？', time: '10:28' },
  { id: '4', user: '陈晓燕', content: '止血夹的使用数量统计？', time: '10:32' },
  { id: '5', user: '张明华', content: '可以讲解一下切开技巧吗？', time: '10:35' },
  { id: '6', user: '赵志远', content: '术后如何预防穿孔？', time: '10:38' },
];

const MEDICATIONS: Medication[] = [
  { name: '生理盐水', dose: '20ml', time: '10:15' },
  { name: '亚甲蓝', dose: '2ml', time: '10:16' },
  { name: '肾上腺素', dose: '1ml', time: '10:16' },
];

const TIMELINE_STEPS = [
  { name: '建立黏膜下隧道', time: '10:10-10:25', status: 'complete' },
  { name: '标记', time: '10:25-10:30', status: 'complete' },
  { name: '切开', time: '10:30-10:50', status: 'active' },
  { name: '剥离', time: '10:50-11:30', status: 'pending' },
  { name: '止血', time: '11:30-11:45', status: 'pending' },
];

const STATS_DATA = [
  { label: '总录像数', value: '156', sub: '台', icon: Video, color: '#3b82f6', bg: '#dbeafe' },
  { label: '总示教时长', value: '892', sub: '小时', icon: Clock, color: '#8b5cf6', bg: '#ede9fe' },
  { label: '在线学员', value: '42', sub: '人', icon: Users, color: '#16a34a', bg: '#dcfce7' },
  { label: '今日手术', value: '12', sub: '台', icon: Activity, color: '#f97316', bg: '#ffedd5' },
];

// ==================== 主组件 ====================
export default function SurgeryLivePage() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(70);
  const [message, setMessage] = useState('');
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterType, setFilterType] = useState('全部');

  const filteredVideos = VIDEO_RECORDS.filter(video => {
    const matchSearch = video.name.includes(searchKeyword) || 
                        video.doctor.includes(searchKeyword) ||
                        video.type.includes(searchKeyword);
    const matchType = filterType === '全部' || video.type === filterType;
    return matchSearch && matchType;
  });

  const surgeryTypes = ['全部', ...Array.from(new Set(VIDEO_RECORDS.map(v => v.type)))];

  const handleSend = () => {
    if (message.trim()) {
      setMessage('');
    }
  };

  return (
    <div style={s.root}>
      {/* 头部 */}
      <div style={s.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h1 style={s.title}>手术示教系统</h1>
          <div style={s.liveTag}>
            <Wifi size={12} />
            示教模式：直播中
          </div>
        </div>
        <div style={s.headerRight}>
          <button style={{ ...s.btn, ...s.btnSecondary }}>
            <Users size={14} />
            42人在线
          </button>
          <button style={{ ...s.btn, ...s.btnPrimary }}>
            <Plus size={14} />
            新建示教
          </button>
        </div>
      </div>

      {/* 统计数据 */}
      <div style={s.statsRow}>
        {STATS_DATA.map((stat) => (
          <div key={stat.label} style={s.statCard}>
            <div style={{ ...s.statIconWrap, background: stat.bg }}>
              <stat.icon size={22} color={stat.color} />
            </div>
            <div style={s.statInfo}>
              <div style={s.statLabel}>{stat.label}</div>
              <div style={s.statValue}>{stat.value}</div>
              <div style={s.statSub}>{stat.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 搜索和筛选 */}
      <div style={s.searchBar}>
        <input
          style={s.searchInput}
          placeholder="搜索手术名称、术者或类型..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
        />
        <select
          style={{ ...s.filterBtn, appearance: 'none', cursor: 'pointer' }}
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          {surgeryTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <button style={{ ...s.btn, ...s.btnSecondary }}>
          <RefreshCw size={14} />
          刷新列表
        </button>
      </div>

      {/* 主体区域 */}
      <div style={s.mainGrid}>
        {/* 左侧录像播放器 */}
        <div style={s.videoSection}>
          {/* 视频区域 */}
          <div style={s.videoArea}>
            <svg width="100%" height="100%" viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice">
              <defs>
                <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0f2744" />
                  <stop offset="100%" stopColor="#1a3a5c" />
                </linearGradient>
                <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#1e4080" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#0f2744" stopOpacity="0" />
                </radialGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <rect fill="url(#bgGrad)" width="100%" height="100%" />
              <ellipse cx="400" cy="200" rx="250" ry="180" fill="url(#centerGlow)" />
              {/* 胃镜SVG示意 */}
              <g transform="translate(350, 150)">
                <ellipse cx="50" cy="50" rx="45" ry="45" fill="none" stroke="#3b82f6" strokeWidth="2" opacity="0.6" />
                <circle cx="50" cy="50" r="30" fill="none" stroke="#60a5fa" strokeWidth="1.5" opacity="0.8" />
                <circle cx="50" cy="50" r="15" fill="#1e40af" opacity="0.9" />
                <line x1="50" y1="5" x2="50" y2="25" stroke="#3b82f6" strokeWidth="2" />
                <line x1="50" y1="75" x2="50" y2="95" stroke="#3b82f6" strokeWidth="2" />
                <line x1="5" y1="50" x2="25" y2="50" stroke="#3b82f6" strokeWidth="2" />
                <line x1="75" y1="50" x2="95" y2="50" stroke="#3b82f6" strokeWidth="2" />
              </g>
              {/* 组织纹理线条 */}
              <path d="M100 350 Q200 320 300 350 T500 340 T700 360" stroke="#2563eb" strokeWidth="1" fill="none" opacity="0.3" />
              <path d="M80 380 Q180 350 280 370 T480 360 T680 380" stroke="#3b82f6" strokeWidth="1" fill="none" opacity="0.2" />
              <path d="M120 320 Q220 290 320 320 T520 310 T720 330" stroke="#60a5fa" strokeWidth="1" fill="none" opacity="0.2" />
              {/* 指示标记 */}
              <g filter="url(#glow)">
                <circle cx="300" cy="200" r="6" fill="#ef4444" opacity="0.9">
                  <animate attributeName="opacity" values="0.9;0.4;0.9" dur="1.5s" repeatCount="indefinite" />
                </circle>
                <circle cx="300" cy="200" r="12" fill="none" stroke="#ef4444" strokeWidth="1" opacity="0.5">
                  <animate attributeName="r" values="12;20;12" dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.5;0;0.5" dur="1.5s" repeatCount="indefinite" />
                </circle>
              </g>
              {/* 标记文字 */}
              <text x="400" y="380" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="500">
                胃镜ESD手术 - 实时画面
              </text>
              <text x="400" y="400" textAnchor="middle" fill="#64748b" fontSize="11">
                内镜中心 · 手术室3
              </text>
            </svg>
            <div style={s.videoOverlay}>
              <div style={s.liveBadge}>
                <Play size={10} fill="#fff" /> LIVE
              </div>
              <div style={s.recordBadge}>REC</div>
            </div>
          </div>

          {/* 控制条 */}
          <div style={s.controlsBar}>
            <button style={s.controlBtn} onClick={() => setIsPlaying(!isPlaying)}>
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <div style={s.progressBar}>
              <div style={s.progressFill} />
            </div>
            <span style={s.timeDisplay}>00:52:30 / 02:35:00</span>
            <div style={s.volumeWrap}>
              <button style={s.controlBtn} onClick={() => setIsMuted(!isMuted)}>
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <div style={s.volumeSlider}>
                <div style={{ ...s.volumeFill, width: isMuted ? '0%' : `${volume}%` }} />
              </div>
            </div>
            <select style={s.qualitySelect}>
              <option>1080P</option>
              <option>720P</option>
              <option>480P</option>
            </select>
            <button style={s.controlBtn}>
              <Maximize size={18} />
            </button>
          </div>

          {/* 录像列表 */}
          <div style={s.videoListSection}>
            <div style={s.sectionTitle}>手术录像列表 ({filteredVideos.length}条)</div>
            {filteredVideos.length > 0 ? (
              <div style={s.videoList}>
                {filteredVideos.map((video) => (
                  <div
                    key={video.id}
                    style={{
                      ...s.videoCard,
                      background: hoveredCard === video.id ? '#f0f7ff' : '#fff',
                      borderColor: hoveredCard === video.id ? '#3b82f6' : '#e2e8f0',
                      transform: hoveredCard === video.id ? 'translateX(4px)' : 'none',
                    }}
                    onMouseEnter={() => setHoveredCard(video.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <div style={s.videoThumb}>
                      <Video size={20} color="#94a3b8" />
                    </div>
                    <div style={s.videoCardInfo}>
                      <div style={s.videoCardName}>{video.name}</div>
                      <div style={s.videoCardMeta}>{video.type} · {video.date} · {video.duration}</div>
                    </div>
                    <div style={s.videoCardViewers}>
                      <Eye size={12} />
                      {video.viewers}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={s.emptyState}>
                <div style={s.emptyIcon}>
                  <VideoOff size={28} color="#94a3b8" />
                </div>
                <div style={s.emptyText}>暂无符合条件的录像</div>
                <div style={s.emptySubtext}>请调整搜索条件或筛选类型</div>
              </div>
            )}
          </div>
        </div>

        {/* 右侧面板 */}
        <div style={s.rightPanel}>
          {/* 患者信息 */}
          <div style={s.infoCard}>
            <div style={s.cardHeader}>
              <User size={16} color="#1a3a5c" />
              <span style={s.cardTitle}>患者信息</span>
            </div>
            <div style={s.cardBody}>
              <div style={s.patientInfo}>
                <div style={s.infoItem}>
                  <span style={s.infoLabel}>姓名</span>
                  <span style={s.infoValue}>王建国</span>
                </div>
                <div style={s.infoItem}>
                  <span style={s.infoLabel}>性别</span>
                  <span style={s.infoValue}>男</span>
                </div>
                <div style={s.infoItem}>
                  <span style={s.infoLabel}>年龄</span>
                  <span style={s.infoValue}>58岁</span>
                </div>
                <div style={s.infoItem}>
                  <span style={s.infoLabel}>手术类型</span>
                  <span style={s.infoValue}>ESD</span>
                </div>
                <div style={s.infoItem}>
                  <span style={s.infoLabel}>诊断</span>
                  <span style={s.infoValueFull}>胃窦早癌</span>
                </div>
              </div>
            </div>
          </div>

          {/* 手术详情 */}
          <div style={s.infoCard}>
            <div style={s.cardHeader}>
              <Scissors size={16} color="#1a3a5c" />
              <span style={s.cardTitle}>手术详情</span>
            </div>
            <div style={s.cardBody}>
              <div style={s.surgeryDetail}>
                <div style={s.detailRow}>
                  <span style={s.detailLabel}>术式</span>
                  <span style={s.detailValue}>内镜黏膜下剥离术</span>
                </div>
                <div style={s.detailRow}>
                  <span style={s.detailLabel}>操作医生</span>
                  <span style={s.detailValue}>张明华</span>
                </div>
                <div style={s.detailRow}>
                  <span style={s.detailLabel}>助手</span>
                  <span style={s.detailValue}>李建国、王秀英</span>
                </div>
                <div style={s.detailRow}>
                  <span style={s.detailLabel}>开始时间</span>
                  <span style={s.detailValue}>10:10</span>
                </div>
                <div style={s.detailRow}>
                  <span style={s.detailLabel}>预计时长</span>
                  <span style={s.detailValue}>2小时</span>
                </div>
              </div>
            </div>
          </div>

          {/* 手术步骤时间轴 */}
          <div style={s.infoCard}>
            <div style={s.cardHeader}>
              <Clock size={16} color="#1a3a5c" />
              <span style={s.cardTitle}>手术步骤</span>
            </div>
            <div style={s.cardBody}>
              <div style={s.timeline}>
                {TIMELINE_STEPS.map((step, idx) => (
                  <div key={idx} style={s.timelineItem}>
                    {idx < TIMELINE_STEPS.length - 1 && (
                      <div style={{
                        ...s.timelineLine,
                        ...(step.status === 'complete' ? s.timelineLineComplete : {})
                      }} />
                    )}
                    <div style={{
                      ...s.timelineDot,
                      ...(step.status === 'complete' ? s.timelineDotComplete : {}),
                      ...(step.status === 'active' ? s.timelineDotActive : {}),
                    }} />
                    <div style={s.timelineContent}>
                      <div style={{
                        ...s.timelineTitle,
                        ...(step.status === 'complete' ? s.timelineTitleDone : {}),
                        ...(step.status === 'active' ? s.timelineTitleActive : {}),
                      }}>
                        {step.name}
                      </div>
                      <div style={s.timelineTime}>{step.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 实时参数 */}
          <div style={s.infoCard}>
            <div style={s.cardHeader}>
              <Activity size={16} color="#1a3a5c" />
              <span style={s.cardTitle}>实时参数</span>
            </div>
            <div style={s.cardBody}>
              <div style={s.realtimeParams}>
                <div style={s.paramItem}>
                  <div style={s.paramValue}>3.2</div>
                  <div style={s.paramUnit}>mm</div>
                  <div style={s.paramLabel}>当前深度</div>
                </div>
                <div style={s.paramItem}>
                  <div style={s.paramValue}>5</div>
                  <div style={s.paramUnit}>ml</div>
                  <div style={s.paramLabel}>出血量</div>
                </div>
                <div style={s.paramItem}>
                  <div style={s.paramValue}>00:42</div>
                  <div style={s.paramUnit}>min</div>
                  <div style={s.paramLabel}>手术时长</div>
                </div>
                <div style={s.paramItem}>
                  <div style={s.paramValue}>2.8</div>
                  <div style={s.paramUnit}>cm²</div>
                  <div style={s.paramLabel}>剥离面积</div>
                </div>
              </div>
            </div>
          </div>

          {/* 术中用药 */}
          <div style={s.infoCard}>
            <div style={s.cardHeader}>
              <Activity size={16} color="#1a3a5c" />
              <span style={s.cardTitle}>术中用药</span>
            </div>
            <div style={s.cardBody}>
              <div style={s.medicationList}>
                {MEDICATIONS.map((med, idx) => (
                  <div key={idx} style={s.medicationItem}>
                    <div>
                      <div style={s.medName}>{med.name}</div>
                      <div style={s.medDose}>{med.dose}</div>
                    </div>
                    <div style={s.medTime}>{med.time}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 互动答疑 */}
          <div style={s.infoCard}>
            <div style={s.chatSection}>
              <div style={s.chatHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MessageSquare size={16} color="#1a3a5c" />
                  <span style={s.cardTitle}>互动答疑</span>
                </div>
                <div style={s.onlineCount}>
                  <UserCheck size={12} />
                  6人参与
                </div>
              </div>
              <div style={s.chatMessages}>
                {QUESTIONS.map((q) => (
                  <div key={q.id} style={s.chatMsg}>
                    <div style={s.chatAvatar}>{q.user[0]}</div>
                    <div style={s.chatBubble}>
                      <div style={s.chatUser}>{q.user}</div>
                      <div style={s.chatText}>{q.content}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={s.chatInput}>
                <input
                  style={s.chatInputField}
                  placeholder="输入问题..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <button style={s.sendBtn} onClick={handleSend}>
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* 在线人员 */}
          <div style={s.infoCard}>
            <div style={s.cardHeader}>
              <UserCheck size={16} color="#1a3a5c" />
              <span style={s.cardTitle}>在线人员</span>
            </div>
            <div style={s.onlineList}>
              {DOCTORS.map((doc) => (
                <div key={doc.id} style={s.onlineItem}>
                  <div style={s.onlineAvatar}>
                    {doc.avatar}
                    <div style={{ ...s.onlineDot, ...(doc.online ? {} : s.onlineDotOffline) }} />
                  </div>
                  <div style={s.onlineInfo}>
                    <div style={s.onlineName}>{doc.name}</div>
                    <div style={s.onlineTitle}>{doc.title}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
