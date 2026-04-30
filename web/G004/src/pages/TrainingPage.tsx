// @ts-nocheck
import { useState } from 'react';
import {
  GraduationCap, BookOpen, Award, ClipboardList, FileCheck, Users,
  Search, Filter, Eye, Download, X, Play, ChevronRight, Calendar,
  Clock, CheckCircle2, Circle, BarChart2, Star, Trophy, Medal,
  ScrollText, UserCheck, Briefcase, Target, TrendingUp, RefreshCw,
  Plus, Edit, Trash2, FileText, Video, Image, MessageSquare, Send,
  Bell, Settings, MoreHorizontal, Printer, QrCode, Shield, Zap
} from 'lucide-react';

// ============ Types ============
type TabType = '培训课程库' | '考核管理' | '资质证书' | '培训记录' | '统计分析';
type CourseStatus = '待开始' | '进行中' | '已完成' | '已过期';
type CourseCategory = '岗前培训' | '在职培训' | '技能考核' | '专题讲座' | '学术会议';
type ExamStatus = '未开始' | '进行中' | '已完成' | '已过期';
type CertStatus = '有效' | '即将到期' | '已过期' | '待领取';
type QuestionType = '单选' | '多选' | '判断' | '简答';

// ============ Interfaces ============
interface Course {
  id: string;
  name: string;
  category: CourseCategory;
  instructor: string;
  hours: number;
  students: number;
  maxStudents: number;
  status: CourseStatus;
  startDate: string;
  endDate: string;
  description: string;
  coverType: '视频' | '图文' | 'PDF' | '直播';
  progress?: number;
  score?: number;
}

interface Exam {
  id: string;
  name: string;
  category: CourseCategory;
  totalScore: number;
  passingScore: number;
  duration: number;
  totalQuestions: number;
  participants: number;
  completedCount: number;
  status: ExamStatus;
  deadline: string;
  creator: string;
}

interface Certificate {
  id: string;
  name: string;
  holder: string;
  department: string;
  issueDate: string;
  expiryDate: string;
  certNumber: string;
  status: CertStatus;
  issuer: string;
  type: '资格证书' | '培训证书' | '技能证书' | '荣誉证书';
}

interface TrainingRecord {
  id: string;
  courseName: string;
  date: string;
  hours: number;
  score?: number;
  certificate?: string;
  instructor: string;
  location: string;
  status: '已完成' | '进行中' | '未完成';
}

interface Question {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  difficulty: '简单' | '中等' | '困难';
  category: CourseCategory;
  usageCount: number;
}

// ============ Mock Data ============
const courseData: Course[] = [
  { id: 'C001', name: '医疗质量安全核心制度', category: '岗前培训', instructor: '医务处', hours: 16, students: 45, maxStudents: 60, status: '进行中', startDate: '2026-04-01', endDate: '2026-05-15', description: '解读18项医疗质量安全核心制度要点', coverType: '视频', progress: 65 },
  { id: 'C002', name: '心肺复苏(CPR)操作培训', category: '技能考核', instructor: '急诊科', hours: 8, students: 30, maxStudents: 40, status: '待开始', startDate: '2026-05-10', endDate: '2026-05-10', description: '单人及双人心肺复苏操作演示与练习', coverType: '直播', progress: 0 },
  { id: 'C003', name: '医患沟通技巧与医疗纠纷预防', category: '专题讲座', instructor: '法务部', hours: 4, students: 120, maxStudents: 200, status: '已完成', startDate: '2026-03-20', endDate: '2026-03-20', description: '提升医务人员沟通能力，减少医疗纠纷', coverType: '图文', progress: 100, score: 92 },
  { id: 'C004', name: '最新临床诊疗指南解读', category: '在职培训', instructor: '科教科', hours: 24, students: 80, maxStudents: 100, status: '进行中', startDate: '2026-04-01', endDate: '2026-06-30', description: '2026年最新临床诊疗指南要点解读', coverType: '视频', progress: 40 },
  { id: 'C005', name: '手术室感染控制规范', category: '技能考核', instructor: '院感科', hours: 6, students: 25, maxStudents: 30, status: '已完成', startDate: '2026-02-15', endDate: '2026-02-15', description: '手术室无菌操作与感染控制标准流程', coverType: 'PDF', progress: 100, score: 88 },
  { id: 'C006', name: '医学影像学基础培训', category: '在职培训', instructor: '影像科', hours: 20, students: 35, maxStudents: 50, status: '待开始', startDate: '2026-05-20', endDate: '2026-06-20', description: 'CT、MRI、X线等影像学基础与临床应用', coverType: '视频', progress: 0 },
  { id: 'C007', name: '国际医学教育研讨会', category: '学术会议', instructor: '外聘专家', hours: 32, students: 15, maxStudents: 30, status: '进行中', startDate: '2026-04-15', endDate: '2026-04-20', description: '国际医学教育最新进展与趋势研讨', coverType: '直播', progress: 75 },
  { id: 'C008', name: '病历书写规范与质量控制', category: '岗前培训', instructor: '医务处', hours: 12, students: 50, maxStudents: 60, status: '已完成', startDate: '2026-01-10', endDate: '2026-01-12', description: '规范病历书写，提升病历质量', coverType: '图文', progress: 100, score: 95 },
];

const examData: Exam[] = [
  { id: 'E001', name: '2026年第一季度医疗质量安全考核', category: '技能考核', totalScore: 100, passingScore: 60, duration: 90, totalQuestions: 80, participants: 156, completedCount: 142, status: '已完成', deadline: '2026-03-31', creator: '医务处' },
  { id: 'E002', name: '护理操作技能在线考试', category: '技能考核', totalScore: 100, passingScore: 70, duration: 60, totalQuestions: 50, participants: 80, completedCount: 65, status: '进行中', deadline: '2026-05-15', creator: '护理部' },
  { id: 'E003', name: '医德医风与职业素养考核', category: '岗前培训', totalScore: 100, passingScore: 60, duration: 45, totalQuestions: 40, participants: 45, completedCount: 0, status: '未开始', deadline: '2026-05-30', creator: '人事处' },
  { id: 'E004', name: '临床合理用药知识测试', category: '在职培训', totalScore: 100, passingScore: 65, duration: 60, totalQuestions: 60, participants: 120, completedCount: 98, status: '已完成', deadline: '2026-04-20', creator: '药剂科' },
  { id: 'E005', name: '手术室安全与管理考核', category: '技能考核', totalScore: 100, passingScore: 75, duration: 90, totalQuestions: 75, participants: 30, completedCount: 0, status: '未开始', deadline: '2026-06-10', creator: '手术室' },
  { id: 'E006', name: '院感防控知识竞赛', category: '专题讲座', totalScore: 100, passingScore: 60, duration: 30, totalQuestions: 30, participants: 200, completedCount: 187, status: '已完成', deadline: '2026-04-25', creator: '院感科' },
];

const certificateData: Certificate[] = [
  { id: 'Cert001', name: 'BLS国际急救证书', holder: '张明华', department: '急诊科', issueDate: '2025-06-15', expiryDate: '2027-06-15', certNumber: 'BLS-2025-0615-0156', status: '有效', issuer: '美国心脏协会', type: '资格证书' },
  { id: 'Cert002', name: '医疗质量安全培训证书', holder: '李晓燕', department: '心内科', issueDate: '2026-03-20', expiryDate: '2028-03-20', certNumber: 'MED-2026-0320-0089', status: '有效', issuer: '医务处', type: '培训证书' },
  { id: 'Cert003', name: '护理操作技能证书', holder: '王丽', department: '手术室', issueDate: '2025-12-01', expiryDate: '2026-06-01', certNumber: 'NUR-2025-1201-0234', status: '即将到期', issuer: '护理部', type: '技能证书' },
  { id: 'Cert004', name: '临床药师规范化培训证书', holder: '赵强', department: '药剂科', issueDate: '2024-01-10', expiryDate: '2026-01-10', certNumber: 'PHA-2024-0110-0056', status: '已过期', issuer: '药剂科', type: '资格证书' },
  { id: 'Cert005', name: '优秀带教老师荣誉证书', holder: '陈建国', department: '骨科', issueDate: '2026-01-15', expiryDate: '2030-01-15', certNumber: 'HON-2026-0115-0012', status: '有效', issuer: '科教科', type: '荣誉证书' },
  { id: 'Cert006', name: 'CPR操作合格证书', holder: '周婷婷', department: '门诊部', issueDate: '2026-04-28', expiryDate: '2028-04-28', certNumber: 'CPR-2026-0428-0078', status: '待领取', issuer: '急诊科', type: '技能证书' },
  { id: 'Cert007', name: '腔镜手术操作资质证书', holder: '孙伟', department: '普外科', issueDate: '2025-09-01', expiryDate: '2027-09-01', certNumber: 'LAP-2025-0901-0034', status: '有效', issuer: '普外科', type: '资格证书' },
  { id: 'Cert008', name: '医学影像诊断资质证书', holder: '刘芳', department: '影像科', issueDate: '2026-02-20', expiryDate: '2029-02-20', certNumber: 'IMG-2026-0220-0015', status: '有效', issuer: '影像科', type: '资格证书' },
];

const trainingRecordData: TrainingRecord[] = [
  { id: 'R001', courseName: '2026年新员工岗前培训', date: '2026-01-15', hours: 40, score: 95, certificate: '岗前培训合格证', instructor: '人事处', location: '学术报告厅', status: '已完成' },
  { id: 'R002', courseName: '手术室安全与管理', date: '2026-02-20', hours: 16, score: 88, certificate: '手术室培训证书', instructor: '手术室护理部', location: '技能培训中心', status: '已完成' },
  { id: 'R003', courseName: '患者安全与风险管理', date: '2026-03-10', hours: 8, score: 92, certificate: '安全培训证书', instructor: '医务处', location: '行政楼会议室', status: '已完成' },
  { id: 'R004', courseName: '心肺复苏技能考核', date: '2026-03-25', hours: 4, score: 100, certificate: 'BLS证书', instructor: '急诊科', location: '急诊科示教室', status: '已完成' },
  { id: 'R005', courseName: '护理科研方法培训', date: '2026-04-28', hours: 12, score: undefined, instructor: '护理部', location: '护理部会议室', status: '进行中' },
  { id: 'R006', courseName: '医患沟通技巧培训', date: '2026-05-05', hours: 6, score: undefined, instructor: '法务部', location: '学术报告厅', status: '未完成' },
];

const questionBankData: Question[] = [
  { id: 'Q001', type: '单选', question: '以下哪项不属于医疗质量安全核心制度？', options: ['首诊负责制', '三级查房制度', '考勤管理制度', '会诊制度'], correctAnswer: '考勤管理制度', difficulty: '简单', category: '岗前培训', usageCount: 1256 },
  { id: 'Q002', type: '单选', question: '心肺复苏时成人胸外按压深度应为多少厘米？', options: ['2-3cm', '3-4cm', '5-6cm', '至少10cm'], correctAnswer: '5-6cm', difficulty: '中等', category: '技能考核', usageCount: 892 },
  { id: 'Q003', type: '判断', question: '手术室参观人员无需遵守无菌操作规范。', options: ['正确', '错误'], correctAnswer: '错误', difficulty: '简单', category: '技能考核', usageCount: 654 },
  { id: 'Q004', type: '多选', question: '医患沟通的基本原则包括？', options: ['尊重患者', '有效倾听', '充分告知', '避免眼神接触'], correctAnswer: ['尊重患者', '有效倾听', '充分告知'], difficulty: '简单', category: '专题讲座', usageCount: 432 },
  { id: 'Q005', type: '单选', question: '下列哪种药物需要进行血药浓度监测？', options: ['青霉素', '地高辛', '阿司匹林', '对乙酰氨基酚'], correctAnswer: '地高辛', difficulty: '困难', category: '在职培训', usageCount: 567 },
  { id: 'Q006', type: '简答', question: '请简述手术安全核查的三个时间点。', correctAnswer: '麻醉实施前、手术开始前、患者离开手术室前', difficulty: '中等', category: '技能考核', usageCount: 321 },
];

// ============ Tab Config ============
const tabConfig: Record<TabType, { icon: React.ReactNode; color: string }> = {
  '培训课程库': { icon: <BookOpen size={18} />, color: '#6366f1' },
  '考核管理': { icon: <ClipboardList size={18} />, color: '#f59e0b' },
  '资质证书': { icon: <Award size={18} />, color: '#10b981' },
  '培训记录': { icon: <ScrollText size={18} />, color: '#ec4899' },
  '统计分析': { icon: <BarChart2 size={18} />, color: '#8b5cf6' },
};

// ============ Category Config ============
const categoryColors: Record<CourseCategory, string> = {
  '岗前培训': '#3b82f6',
  '在职培训': '#6366f1',
  '技能考核': '#f59e0b',
  '专题讲座': '#ec4899',
  '学术会议': '#8b5cf6',
};

// ============ Styles ============
const styles: Record<string, React.CSSProperties> = {
  root: { padding: 24, background: '#f0f4f8', minHeight: '100vh' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 20, fontWeight: 700, color: '#1a3a5c', display: 'flex', alignItems: 'center', gap: 8 },
  // Tab导航
  tabNav: { display: 'flex', gap: 8, marginBottom: 20, background: '#fff', padding: '8px 12px', borderRadius: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflowX: 'auto' },
  tabItem: { display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 500, transition: 'all 0.2s', border: 'none', background: 'transparent', color: '#64748b', whiteSpace: 'nowrap' },
  tabItemActive: { background: '#f1f5f9', color: '#1a3a5c', fontWeight: 600 },
  // 统计卡片
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 },
  statCard: { background: '#fff', borderRadius: 10, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  statLabel: { fontSize: 12, color: '#64748b', marginBottom: 4 },
  statValue: { fontSize: 24, fontWeight: 700, color: '#1a3a5c' },
  // 搜索筛选
  searchRow: { display: 'flex', gap: 12, marginBottom: 16 },
  searchBox: { flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: '#fff', borderRadius: 8, padding: '8px 12px', border: '1px solid #e2e8f0' },
  searchInput: { border: 'none', outline: 'none', flex: 1, fontSize: 13 },
  filterSelect: { padding: '8px 12px', background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', minWidth: 120 },
  // 内容卡片
  contentCard: { background: '#fff', borderRadius: 10, padding: 16, marginBottom: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  cardTitle: { fontSize: 15, fontWeight: 600, color: '#1a3a5c', marginBottom: 4 },
  cardMeta: { display: 'flex', gap: 12, fontSize: 12, color: '#94a3b8', flexWrap: 'wrap' },
  badge: { padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600 },
  // 按钮
  btn: { display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none', transition: 'all 0.2s' },
  btnPrimary: { background: '#1a3a5c', color: '#fff' },
  btnSecondary: { background: '#fff', color: '#64748b', border: '1px solid #e2e8f0' },
  btnDanger: { background: '#ef4444', color: '#fff' },
  btnSuccess: { background: '#10b981', color: '#fff' },
  btnWarning: { background: '#f59e0b', color: '#fff' },
  btnLarge: { padding: '12px 24px', fontSize: 14, height: 44 },
  // 课程卡片
  courseGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 },
  courseCard: { background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', cursor: 'pointer', transition: 'all 0.2s' },
  courseCover: { height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  courseBody: { padding: 14 },
  courseName: { fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 8, lineHeight: 1.4 },
  courseDesc: { fontSize: 12, color: '#64748b', lineHeight: 1.5, marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  courseProgress: { height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden', marginTop: 8 },
  // 考试卡片
  examCard: { background: '#fff', borderRadius: 10, padding: 16, marginBottom: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  examHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  examStats: { display: 'flex', gap: 24, marginTop: 12, paddingTop: 12, borderTop: '1px solid #f1f5f9' },
  examStat: { textAlign: 'center' },
  // 证书卡片
  certGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 },
  certCard: { background: '#fff', borderRadius: 10, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', position: 'relative', overflow: 'hidden' },
  certHeader: { display: 'flex', gap: 12, marginBottom: 12 },
  certIcon: { width: 48, height: 48, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' },
  certBody: { flex: 1 },
  certName: { fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 4 },
  certHolder: { fontSize: 12, color: '#64748b' },
  certMeta: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12, paddingTop: 12, borderTop: '1px solid #f1f5f9' },
  certMetaItem: { fontSize: 11, color: '#64748b' },
  certMetaValue: { fontSize: 12, fontWeight: 600, color: '#1a3a5c' },
  // 记录卡片
  recordCard: { background: '#fff', borderRadius: 10, padding: 16, marginBottom: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', display: 'flex', gap: 16, alignItems: 'center' },
  recordDate: { minWidth: 80, textAlign: 'center', padding: '8px 0', background: '#f8fafc', borderRadius: 8 },
  recordContent: { flex: 1 },
  // 图表容器
  chartContainer: { background: '#fff', borderRadius: 10, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: 16 },
  chartTitle: { fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 16 },
  chartRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  // 模态框
  modal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalContent: { background: '#fff', borderRadius: 12, width: 800, maxHeight: '85vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e2e8f0' },
  modalTitle: { fontSize: 16, fontWeight: 700, color: '#1a3a5c' },
  modalBody: { padding: 20 },
  modalFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderTop: '1px solid #e2e8f0' },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4 },
  // 表格
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '12px 8px', fontSize: 12, fontWeight: 600, color: '#64748b', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' },
  td: { padding: '12px 8px', fontSize: 13, color: '#334155', borderBottom: '1px solid #f1f5f9' },
  // 标签页内容
  tabContent: { background: '#fff', borderRadius: 10, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  sectionTitle: { fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 },
  // 状态颜色
  statusDot: { width: 8, height: 8, borderRadius: '50%', display: 'inline-block', marginRight: 6 },
  noData: { textAlign: 'center', padding: '40px 0', color: '#94a3b8', fontSize: 13 },
  filterTabs: { display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  filterTab: { padding: '6px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b' },
  filterTabActive: { background: '#1a3a5c', color: '#fff', border: '1px solid #1a3a5c' },
};

// ============ Component ============
export default function TrainingPage() {
  const [activeTab, setActiveTab] = useState<TabType>('培训课程库');
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<CourseCategory | '全部'>('全部');
  const [activeStatus, setActiveStatus] = useState<string>('全部');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'course' | 'exam' | 'cert' | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // 统计数据
  const totalCourses = courseData.length;
  const activeCourses = courseData.filter(c => c.status === '进行中').length;
  const totalExams = examData.length;
  const completedExams = examData.filter(e => e.status === '已完成').length;
  const validCerts = certificateData.filter(c => c.status === '有效').length;
  const totalRecords = trainingRecordData.length;
  const totalHours = trainingRecordData.reduce((sum, r) => sum + r.hours, 0);

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case '有效': case '已完成': case '进行中': return '#10b981';
      case '待开始': case '未开始': case '待领取': return '#3b82f6';
      case '即将到期': return '#f59e0b';
      case '已过期': case '已过期': return '#ef4444';
      default: return '#64748b';
    }
  };

  // 渲染Tab
  const renderTab = (tab: TabType) => (
    <button
      key={tab}
      style={{
        ...styles.tabItem,
        ...(activeTab === tab ? styles.tabItemActive : {}),
        color: activeTab === tab ? tabConfig[tab].color : '#64748b',
        background: activeTab === tab ? tabConfig[tab].color + '15' : 'transparent',
      }}
      onClick={() => setActiveTab(tab)}
    >
      {tabConfig[tab].icon}
      {tab}
    </button>
  );

  // 渲染统计卡片
  const renderStats = () => {
    const stats = [
      { label: '培训课程', value: totalCourses, subLabel: '门课程', color: '#6366f1', icon: <BookOpen size={20} /> },
      { label: '进行中', value: activeCourses, subLabel: '门课程', color: '#10b981', icon: <Play size={20} /> },
      { label: '考核管理', value: totalExams, subLabel: '场考核', color: '#f59e0b', icon: <ClipboardList size={20} /> },
      { label: '已完成', value: completedExams, subLabel: '场考核', color: '#ec4899', icon: <FileCheck size={20} /> },
    ];

    if (activeTab === '资质证书') {
      return (
        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: '#10b98120', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                <Award size={18} />
              </div>
              <div style={styles.statLabel}>有效证书</div>
            </div>
            <div style={{ ...styles.statValue, color: '#10b981' }}>{validCerts}</div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>本 / {certificateData.length} 张</div>
          </div>
          <div style={styles.statCard}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: '#f59e0b20', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
                <Clock size={18} />
              </div>
              <div style={styles.statLabel}>即将到期</div>
            </div>
            <div style={{ ...styles.statValue, color: '#f59e0b' }}>{certificateData.filter(c => c.status === '即将到期').length}</div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>个月内到期</div>
          </div>
          <div style={styles.statCard}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: '#ef444420', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                <Shield size={18} />
              </div>
              <div style={styles.statLabel}>已过期</div>
            </div>
            <div style={{ ...styles.statValue, color: '#ef4444' }}>{certificateData.filter(c => c.status === '已过期').length}</div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>需要更新</div>
          </div>
          <div style={styles.statCard}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: '#3b82f620', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                <Download size={18} />
              </div>
              <div style={styles.statLabel}>待领取</div>
            </div>
            <div style={{ ...styles.statValue, color: '#3b82f6' }}>{certificateData.filter(c => c.status === '待领取').length}</div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>未领取</div>
          </div>
        </div>
      );
    }

    if (activeTab === '培训记录') {
      return (
        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: '#6366f120', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
                <ScrollText size={18} />
              </div>
              <div style={styles.statLabel}>培训总数</div>
            </div>
            <div style={{ ...styles.statValue, color: '#6366f1' }}>{totalRecords}</div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>次培训</div>
          </div>
          <div style={styles.statCard}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: '#10b98120', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                <Clock size={18} />
              </div>
              <div style={styles.statLabel}>总学时</div>
            </div>
            <div style={{ ...styles.statValue, color: '#10b981' }}>{totalHours}</div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>小时</div>
          </div>
          <div style={styles.statCard}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: '#f59e0b20', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
                <Trophy size={18} />
              </div>
              <div style={styles.statLabel}>平均成绩</div>
            </div>
            <div style={{ ...styles.statValue, color: '#f59e0b' }}>{Math.round(trainingRecordData.filter(r => r.score).reduce((sum, r) => sum + (r.score || 0), 0) / trainingRecordData.filter(r => r.score).length)}</div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>分</div>
          </div>
          <div style={styles.statCard}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: '#ec489920', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ec4899' }}>
                <UserCheck size={18} />
              </div>
              <div style={styles.statLabel}>完成率</div>
            </div>
            <div style={{ ...styles.statValue, color: '#ec4899' }}>{Math.round(trainingRecordData.filter(r => r.status === '已完成').length / totalRecords * 100)}%</div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>{trainingRecordData.filter(r => r.status === '已完成').length} 次完成</div>
          </div>
        </div>
      );
    }

    return (
      <div style={styles.statsRow}>
        {stats.map((stat, idx) => (
          <div key={idx} style={styles.statCard}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: stat.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>
                {stat.icon}
              </div>
              <div style={styles.statLabel}>{stat.label}</div>
            </div>
            <div style={{ ...styles.statValue, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>{stat.subLabel}</div>
          </div>
        ))}
      </div>
    );
  };

  // 过滤数据
  const filteredCourses = courseData.filter(c => {
    const matchSearch = search === '' || c.name.includes(search) || c.instructor.includes(search);
    const matchCategory = activeCategory === '全部' || c.category === activeCategory;
    const matchStatus = activeStatus === '全部' || c.status === activeStatus;
    return matchSearch && matchCategory && matchStatus;
  });

  const filteredExams = examData.filter(e => {
    const matchSearch = search === '' || e.name.includes(search) || e.creator.includes(search);
    const matchStatus = activeStatus === '全部' || e.status === activeStatus;
    return matchSearch && matchStatus;
  });

  const filteredCerts = certificateData.filter(c => {
    const matchSearch = search === '' || c.name.includes(search) || c.holder.includes(search) || c.department.includes(search);
    const matchStatus = activeStatus === '全部' || c.status === activeStatus;
    return matchSearch && matchStatus;
  });

  // 打开详情弹窗
  const openModal = (type: 'course' | 'exam' | 'cert', item: any) => {
    setModalType(type);
    setSelectedItem(item);
    setShowModal(true);
  };

  // 渲染Tab内容
  const renderContent = () => {
    switch (activeTab) {
      case '培训课程库': return renderCourseLibrary();
      case '考核管理': return renderExamManagement();
      case '资质证书': return renderCertificates();
      case '培训记录': return renderTrainingRecords();
      case '统计分析': return renderStatistics();
      default: return renderCourseLibrary();
    }
  };

  // ============ 培训课程库 ============
  const renderCourseLibrary = () => (
    <>
      {renderStats()}

      {/* 搜索筛选 */}
      <div style={styles.searchRow}>
        <div style={styles.searchBox}>
          <Search size={16} color="#94a3b8" />
          <input
            style={styles.searchInput}
            placeholder="搜索课程名称/讲师..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select style={styles.filterSelect} value={activeCategory} onChange={e => setActiveCategory(e.target.value as CourseCategory | '全部')}>
          <option value="全部">全部分类</option>
          <option value="岗前培训">岗前培训</option>
          <option value="在职培训">在职培训</option>
          <option value="技能考核">技能考核</option>
          <option value="专题讲座">专题讲座</option>
          <option value="学术会议">学术会议</option>
        </select>
        <select style={styles.filterSelect} value={activeStatus} onChange={e => setActiveStatus(e.target.value)}>
          <option value="全部">全部状态</option>
          <option value="待开始">待开始</option>
          <option value="进行中">进行中</option>
          <option value="已完成">已完成</option>
          <option value="已过期">已过期</option>
        </select>
        <button style={{ ...styles.btn, ...styles.btnPrimary, height: 38 }}>
          <Plus size={14} /> 新建课程
        </button>
      </div>

      {/* 课程列表 */}
      <div style={styles.courseGrid}>
        {filteredCourses.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, background: '#fff', borderRadius: 10 }}>
            <BookOpen size={40} color="#e2e8f0" style={{ marginBottom: 12 }} />
            <div style={{ color: '#94a3b8', fontSize: 14 }}>暂无符合条件的课程</div>
          </div>
        ) : filteredCourses.map(course => (
          <div key={course.id} style={styles.courseCard} onClick={() => openModal('course', course)}>
            <div style={{ ...styles.courseCover, background: `linear-gradient(135deg, ${categoryColors[course.category]}15, ${categoryColors[course.category]}30)` }}>
              {course.coverType === '视频' && <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(236,72,153,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Play size={20} color="#fff" fill="#fff" /></div>}
              {course.coverType === '图文' && <Image size={40} color="#3b82f6" />}
              {course.coverType === 'PDF' && <FileText size={40} color="#ef4444" />}
              {course.coverType === '直播' && <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(239,68,68,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Zap size={20} color="#fff" /></div>}
              <span style={{ position: 'absolute', top: 8, right: 8, padding: '3px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600, color: '#fff', background: getStatusColor(course.status) }}>
                {course.status}
              </span>
            </div>
            <div style={styles.courseBody}>
              <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                <span style={{ padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 600, background: categoryColors[course.category] + '20', color: categoryColors[course.category] }}>
                  {course.category}
                </span>
                <span style={{ padding: '2px 6px', borderRadius: 4, fontSize: 10, background: '#f1f5f9', color: '#64748b' }}>
                  {course.coverType}
                </span>
              </div>
              <div style={styles.courseName}>{course.name}</div>
              <div style={styles.courseDesc}>{course.description}</div>
              <div style={styles.cardMeta}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><UserCheck size={10} /> {course.students}/{course.maxStudents}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={10} /> {course.hours}小时</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Calendar size={10} /> {course.startDate}</span>
              </div>
              {course.status === '进行中' && course.progress !== undefined && (
                <>
                  <div style={{ ...styles.courseProgress, marginTop: 10 }}>
                    <div style={{ height: '100%', width: `${course.progress}%`, background: '#10b981', borderRadius: 3, transition: 'width 0.3s' }} />
                  </div>
                  <div style={{ fontSize: 10, color: '#64748b', marginTop: 4 }}>学习进度: {course.progress}%</div>
                </>
              )}
              {course.status === '已完成' && course.score !== undefined && (
                <div style={{ marginTop: 8, padding: '4px 8px', background: course.score >= 90 ? '#dcfce7' : course.score >= 60 ? '#fef3c7' : '#fee2e2', borderRadius: 4, fontSize: 11, fontWeight: 600, color: course.score >= 90 ? '#166534' : course.score >= 60 ? '#92400e' : '#dc2626', display: 'inline-block' }}>
                  考试成绩: {course.score}分
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );

  // ============ 考核管理 ============
  const renderExamManagement = () => (
    <>
      {renderStats()}

      {/* 搜索筛选 */}
      <div style={styles.searchRow}>
        <div style={styles.searchBox}>
          <Search size={16} color="#94a3b8" />
          <input
            style={styles.searchInput}
            placeholder="搜索考核名称/创建人..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select style={styles.filterSelect} value={activeStatus} onChange={e => setActiveStatus(e.target.value)}>
          <option value="全部">全部状态</option>
          <option value="未开始">未开始</option>
          <option value="进行中">进行中</option>
          <option value="已完成">已完成</option>
        </select>
        <button style={{ ...styles.btn, ...styles.btnPrimary, height: 38 }}>
          <Plus size={14} /> 创建考核
        </button>
      </div>

      {/* 考核列表 */}
      <div style={styles.tabContent}>
        <div style={styles.sectionTitle}>
          <ClipboardList size={18} color="#f59e0b" />
          考核列表 ({filteredExams.length})
        </div>
        {filteredExams.length === 0 ? (
          <div style={styles.noData}><ClipboardList size={40} color="#e2e8f0" style={{ marginBottom: 12 }} />暂无考核数据</div>
        ) : filteredExams.map(exam => (
          <div key={exam.id} style={styles.examCard} onClick={() => openModal('exam', exam)}>
            <div style={styles.examHeader}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: '#1a3a5c' }}>{exam.name}</span>
                  <span style={{ ...styles.badge, background: getStatusColor(exam.status) + '20', color: getStatusColor(exam.status) }}>
                    {exam.status === '已完成' && <Trophy size={10} style={{ marginRight: 3 }} />}
                    {exam.status === '进行中' && <RefreshCw size={10} style={{ marginRight: 3 }} />}
                    {exam.status}
                  </span>
                </div>
                <div style={styles.cardMeta}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><FileText size={10} /> {exam.totalQuestions}题</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={10} /> {exam.duration}分钟</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Target size={10} /> {exam.passingScore}分及格</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Calendar size={10} /> {exam.deadline}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={{ ...styles.btn, ...styles.btnSecondary, height: 34, padding: '0 12px' }}>
                  <Eye size={14} /> 查看
                </button>
                {exam.status === '未开始' && (
                  <button style={{ ...styles.btn, ...styles.btnPrimary, height: 34, padding: '0 12px' }}>
                    <Play size={14} /> 开始
                  </button>
                )}
                {exam.status === '进行中' && (
                  <button style={{ ...styles.btn, ...styles.btnWarning, height: 34, padding: '0 12px' }}>
                    <RefreshCw size={14} /> 继续
                  </button>
                )}
              </div>
            </div>
            <div style={styles.examStats}>
              <div style={styles.examStat}>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#1a3a5c' }}>{exam.participants}</div>
                <div style={{ fontSize: 10, color: '#94a3b8' }}>参与人数</div>
              </div>
              <div style={styles.examStat}>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#10b981' }}>{exam.completedCount}</div>
                <div style={{ fontSize: 10, color: '#94a3b8' }}>已完成</div>
              </div>
              <div style={styles.examStat}>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#3b82f6' }}>{exam.participants - exam.completedCount}</div>
                <div style={{ fontSize: 10, color: '#94a3b8' }}>未完成</div>
              </div>
              <div style={styles.examStat}>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#6366f1' }}>{exam.totalScore}</div>
                <div style={{ fontSize: 10, color: '#94a3b8' }}>总分</div>
              </div>
              <div style={{ ...styles.examStat, marginLeft: 'auto' }}>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>创建人: {exam.creator}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );

  // ============ 资质证书 ============
  const renderCertificates = () => (
    <>
      {renderStats()}

      {/* 搜索筛选 */}
      <div style={styles.searchRow}>
        <div style={styles.searchBox}>
          <Search size={16} color="#94a3b8" />
          <input
            style={styles.searchInput}
            placeholder="搜索证书名称/持有人/科室..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select style={styles.filterSelect} value={activeStatus} onChange={e => setActiveStatus(e.target.value)}>
          <option value="全部">全部状态</option>
          <option value="有效">有效</option>
          <option value="即将到期">即将到期</option>
          <option value="已过期">已过期</option>
          <option value="待领取">待领取</option>
        </select>
        <button style={{ ...styles.btn, ...styles.btnPrimary, height: 38 }}>
          <Plus size={14} /> 颁发证书
        </button>
      </div>

      {/* 证书列表 */}
      <div style={styles.certGrid}>
        {filteredCerts.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, background: '#fff', borderRadius: 10 }}>
            <Award size={40} color="#e2e8f0" style={{ marginBottom: 12 }} />
            <div style={{ color: '#94a3b8', fontSize: 14 }}>暂无证书数据</div>
          </div>
        ) : filteredCerts.map(cert => (
          <div key={cert.id} style={styles.certCard} onClick={() => openModal('cert', cert)}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: 60, height: 60, background: getStatusColor(cert.status) + '20', clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }} />
            <div style={styles.certHeader}>
              <div style={{ ...styles.certIcon, background: getStatusColor(cert.status) + '15' }}>
                <Award size={24} color={getStatusColor(cert.status)} />
              </div>
              <div style={styles.certBody}>
                <div style={styles.certName}>{cert.name}</div>
                <div style={styles.certHolder}>{cert.holder} · {cert.department}</div>
              </div>
              <span style={{ ...styles.badge, background: getStatusColor(cert.status) + '20', color: getStatusColor(cert.status) }}>
                {cert.status}
              </span>
            </div>
            <div style={styles.certMeta}>
              <div>
                <div style={styles.certMetaItem}>证书编号</div>
                <div style={styles.certMetaValue}>{cert.certNumber}</div>
              </div>
              <div>
                <div style={styles.certMetaItem}>证书类型</div>
                <div style={styles.certMetaValue}>{cert.type}</div>
              </div>
              <div>
                <div style={styles.certMetaItem}>颁发日期</div>
                <div style={styles.certMetaValue}>{cert.issueDate}</div>
              </div>
              <div>
                <div style={styles.certMetaItem}>有效期至</div>
                <div style={{ ...styles.certMetaValue, color: cert.status === '即将到期' ? '#f59e0b' : cert.status === '已过期' ? '#ef4444' : '#1a3a5c' }}>{cert.expiryDate}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button style={{ ...styles.btn, ...styles.btnSecondary, height: 32, padding: '0 12px', fontSize: 11 }}>
                <Eye size={12} /> 查看
              </button>
              <button style={{ ...styles.btn, ...styles.btnSecondary, height: 32, padding: '0 12px', fontSize: 11 }}>
                <Download size={12} /> 下载
              </button>
              <button style={{ ...styles.btn, ...styles.btnSecondary, height: 32, padding: '0 12px', fontSize: 11 }}>
                <Printer size={12} /> 打印
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );

  // ============ 培训记录 ============
  const renderTrainingRecords = () => (
    <>
      {renderStats()}

      {/* 搜索筛选 */}
      <div style={styles.searchRow}>
        <div style={styles.searchBox}>
          <Search size={16} color="#94a3b8" />
          <input
            style={styles.searchInput}
            placeholder="搜索培训名称/讲师..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select style={styles.filterSelect} value={activeStatus} onChange={e => setActiveStatus(e.target.value)}>
          <option value="全部">全部状态</option>
          <option value="已完成">已完成</option>
          <option value="进行中">进行中</option>
          <option value="未完成">未完成</option>
        </select>
        <button style={{ ...styles.btn, ...styles.btnPrimary, height: 38 }}>
          <Plus size={14} /> 添加记录
        </button>
      </div>

      {/* 培训记录列表 */}
      <div style={styles.tabContent}>
        <div style={styles.sectionTitle}>
          <ScrollText size={18} color="#ec4899" />
          培训记录 ({trainingRecordData.length})
        </div>
        {trainingRecordData.map(record => (
          <div key={record.id} style={styles.recordCard}>
            <div style={styles.recordDate}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#1a3a5c' }}>{record.date.slice(5)}</div>
              <div style={{ fontSize: 9, color: '#94a3b8' }}>{record.date.slice(0, 4)}</div>
            </div>
            <div style={styles.recordContent}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 4 }}>{record.courseName}</div>
              <div style={styles.cardMeta}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={10} /> {record.hours}小时</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><UserCheck size={10} /> {record.instructor}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Briefcase size={10} /> {record.location}</span>
                {record.certificate && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#3b82f6' }}><Award size={10} /> {record.certificate}</span>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {record.score !== undefined && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: record.score >= 90 ? '#10b981' : record.score >= 60 ? '#f59e0b' : '#ef4444' }}>{record.score}</div>
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>分</div>
                </div>
              )}
              <span style={{ ...styles.badge, background: getStatusColor(record.status) + '20', color: getStatusColor(record.status) }}>
                {record.status === '已完成' && <CheckCircle2 size={10} style={{ marginRight: 3 }} />}
                {record.status === '进行中' && <RefreshCw size={10} style={{ marginRight: 3 }} />}
                {record.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );

  // ============ 统计分析 ============
  const renderStatistics = () => (
    <>
      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: '#6366f120', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
              <BookOpen size={18} />
            </div>
            <div style={styles.statLabel}>总课程数</div>
          </div>
          <div style={{ ...styles.statValue, color: '#6366f1' }}>{totalCourses}</div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>门课程</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: '#10b98120', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
              <FileCheck size={18} />
            </div>
            <div style={styles.statLabel}>考核通过率</div>
          </div>
          <div style={{ ...styles.statValue, color: '#10b981' }}>{Math.round(completedExams / totalExams * 100)}%</div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>{completedExams}/{totalExams} 场</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: '#f59e0b20', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
              <Award size={18} />
            </div>
            <div style={styles.statLabel}>证书持有</div>
          </div>
          <div style={{ ...styles.statValue, color: '#f59e0b' }}>{validCerts}</div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>张有效证书</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: '#ec489920', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ec4899' }}>
              <TrendingUp size={18} />
            </div>
            <div style={styles.statLabel}>总学习时长</div>
          </div>
          <div style={{ ...styles.statValue, color: '#ec4899' }}>{totalHours}</div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>小时</div>
        </div>
      </div>

      {/* 图表区域 */}
      <div style={styles.chartRow}>
        <div style={styles.chartContainer}>
          <div style={styles.chartTitle}>
            <TrendingUp size={16} color="#6366f1" style={{ marginRight: 6 }} />
            培训类型分布
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(['岗前培训', '在职培训', '技能考核', '专题讲座', '学术会议'] as CourseCategory[]).map(cat => {
              const count = courseData.filter(c => c.category === cat).length;
              const percent = Math.round(count / totalCourses * 100);
              return (
                <div key={cat}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: '#64748b' }}>{cat}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#1a3a5c' }}>{count} ({percent}%)</span>
                  </div>
                  <div style={{ height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${percent}%`, background: categoryColors[cat], borderRadius: 4 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={styles.chartContainer}>
          <div style={styles.chartTitle}>
            <BarChart2 size={16} color="#f59e0b" style={{ marginRight: 6 }} />
            考核完成情况
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 16 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 700, color: '#10b981' }}>{completedExams}</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>已完成</div>
              </div>
              <div style={{ width: 1, background: '#e2e8f0' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 700, color: '#3b82f6' }}>{examData.filter(e => e.status === '进行中').length}</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>进行中</div>
              </div>
              <div style={{ width: 1, background: '#e2e8f0' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 700, color: '#94a3b8' }}>{examData.filter(e => e.status === '未开始').length}</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>未开始</div>
              </div>
            </div>
            {examData.slice(0, 4).map(exam => (
              <div key={exam.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: 12, color: '#334155', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{exam.name}</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginLeft: 8 }}>{exam.completedCount}/{exam.participants}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 热门题库 */}
      <div style={styles.chartContainer}>
        <div style={styles.chartTitle}>
          <Star size={16} color="#ec4899" style={{ marginRight: 6 }} />
          热门题库 TOP5
        </div>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={{ ...styles.th, width: 50 }}>#</th>
              <th style={styles.th}>题目内容</th>
              <th style={styles.th}>类型</th>
              <th style={styles.th}>难度</th>
              <th style={styles.th}>分类</th>
              <th style={styles.th}>使用次数</th>
            </tr>
          </thead>
          <tbody>
            {questionBankData.slice(0, 5).map((q, idx) => (
              <tr key={q.id}>
                <td style={styles.td}><span style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 600 }}>{idx + 1}</span></td>
                <td style={styles.td}>{q.question.slice(0, 30)}...</td>
                <td style={styles.td}><span style={{ padding: '2px 6px', background: '#f1f5f9', borderRadius: 4, fontSize: 10 }}>{q.type}</span></td>
                <td style={styles.td}><span style={{ padding: '2px 6px', borderRadius: 4, fontSize: 10, background: q.difficulty === '简单' ? '#dcfce7' : q.difficulty === '中等' ? '#fef3c7' : '#fee2e2', color: q.difficulty === '简单' ? '#166534' : q.difficulty === '中等' ? '#92400e' : '#dc2626' }}>{q.difficulty}</span></td>
                <td style={styles.td}><span style={{ padding: '2px 6px', borderRadius: 4, fontSize: 10, background: categoryColors[q.category] + '20', color: categoryColors[q.category] }}>{q.category}</span></td>
                <td style={styles.td}><span style={{ color: '#3b82f6', fontWeight: 600 }}>{q.usageCount}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );

  // ============ 详情弹窗 ============
  const renderModal = () => {
    if (!showModal || !selectedItem) return null;

    return (
      <div style={styles.modal} onClick={() => setShowModal(false)}>
        <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
          <div style={styles.modalHeader}>
            <div style={styles.modalTitle}>
              {modalType === 'course' && '课程详情'}
              {modalType === 'exam' && '考核详情'}
              {modalType === 'cert' && '证书详情'}
            </div>
            <button style={styles.closeBtn} onClick={() => setShowModal(false)}>
              <X size={20} />
            </button>
          </div>
          <div style={styles.modalBody}>
            {modalType === 'course' && (
              <>
                <div style={{ marginBottom: 16 }}>
                  <span style={{ padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600, background: categoryColors[selectedItem.category] + '20', color: categoryColors[selectedItem.category], marginRight: 8 }}>
                    {selectedItem.category}
                  </span>
                  <span style={{ padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600, background: getStatusColor(selectedItem.status) + '20', color: getStatusColor(selectedItem.status) }}>
                    {selectedItem.status}
                  </span>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1a3a5c', marginBottom: 12 }}>{selectedItem.name}</h3>
                <div style={{ padding: 16, background: '#f8fafc', borderRadius: 8, marginBottom: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div><span style={{ fontSize: 12, color: '#64748b' }}>授课讲师: </span><strong style={{ fontSize: 13, color: '#1a3a5c' }}>{selectedItem.instructor}</strong></div>
                    <div><span style={{ fontSize: 12, color: '#64748b' }}>课程时长: </span><strong style={{ fontSize: 13, color: '#1a3a5c' }}>{selectedItem.hours}小时</strong></div>
                    <div><span style={{ fontSize: 12, color: '#64748b' }}>学习人数: </span><strong style={{ fontSize: 13, color: '#1a3a5c' }}>{selectedItem.students}/{selectedItem.maxStudents}人</strong></div>
                    <div><span style={{ fontSize: 12, color: '#64748b' }}>课程形式: </span><strong style={{ fontSize: 13, color: '#1a3a5c' }}>{selectedItem.coverType}</strong></div>
                    <div><span style={{ fontSize: 12, color: '#64748b' }}>开始日期: </span><strong style={{ fontSize: 13, color: '#1a3a5c' }}>{selectedItem.startDate}</strong></div>
                    <div><span style={{ fontSize: 12, color: '#64748b' }}>结束日期: </span><strong style={{ fontSize: 13, color: '#1a3a5c' }}>{selectedItem.endDate}</strong></div>
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>课程描述</div>
                  <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.7 }}>{selectedItem.description}</div>
                </div>
              </>
            )}

            {modalType === 'exam' && (
              <>
                <div style={{ marginBottom: 16 }}>
                  <span style={{ padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600, background: getStatusColor(selectedItem.status) + '20', color: getStatusColor(selectedItem.status) }}>
                    {selectedItem.status}
                  </span>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1a3a5c', marginBottom: 12 }}>{selectedItem.name}</h3>
                <div style={{ padding: 16, background: '#f8fafc', borderRadius: 8, marginBottom: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div><span style={{ fontSize: 12, color: '#64748b' }}>总分: </span><strong style={{ fontSize: 13, color: '#1a3a5c' }}>{selectedItem.totalScore}分</strong></div>
                    <div><span style={{ fontSize: 12, color: '#64748b' }}>及格分: </span><strong style={{ fontSize: 13, color: '#1a3a5c' }}>{selectedItem.passingScore}分</strong></div>
                    <div><span style={{ fontSize: 12, color: '#64748b' }}>题量: </span><strong style={{ fontSize: 13, color: '#1a3a5c' }}>{selectedItem.totalQuestions}题</strong></div>
                    <div><span style={{ fontSize: 12, color: '#64748b' }}>时长: </span><strong style={{ fontSize: 13, color: '#1a3a5c' }}>{selectedItem.duration}分钟</strong></div>
                    <div><span style={{ fontSize: 12, color: '#64748b' }}>截止日期: </span><strong style={{ fontSize: 13, color: '#1a3a5c' }}>{selectedItem.deadline}</strong></div>
                    <div><span style={{ fontSize: 12, color: '#64748b' }}>创建人: </span><strong style={{ fontSize: 13, color: '#1a3a5c' }}>{selectedItem.creator}</strong></div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 24, padding: 16, background: '#f8fafc', borderRadius: 8 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#1a3a5c' }}>{selectedItem.participants}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>参与人数</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#10b981' }}>{selectedItem.completedCount}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>已完成</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#3b82f6' }}>{selectedItem.participants - selectedItem.completedCount}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>未完成</div>
                  </div>
                </div>
              </>
            )}

            {modalType === 'cert' && (
              <>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20 }}>
                  <div style={{ width: 64, height: 64, borderRadius: 12, background: getStatusColor(selectedItem.status) + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Award size={32} color={getStatusColor(selectedItem.status)} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1a3a5c', marginBottom: 4 }}>{selectedItem.name}</h3>
                    <div style={{ fontSize: 14, color: '#64748b' }}>{selectedItem.holder} · {selectedItem.department}</div>
                  </div>
                  <span style={{ ...styles.badge, background: getStatusColor(selectedItem.status) + '20', color: getStatusColor(selectedItem.status), marginLeft: 'auto' }}>
                    {selectedItem.status}
                  </span>
                </div>
                <div style={{ padding: 16, background: '#f8fafc', borderRadius: 8, marginBottom: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div><span style={{ fontSize: 12, color: '#64748b' }}>证书编号: </span><strong style={{ fontSize: 13, color: '#1a3a5c' }}>{selectedItem.certNumber}</strong></div>
                    <div><span style={{ fontSize: 12, color: '#64748b' }}>证书类型: </span><strong style={{ fontSize: 13, color: '#1a3a5c' }}>{selectedItem.type}</strong></div>
                    <div><span style={{ fontSize: 12, color: '#64748b' }}>颁发机构: </span><strong style={{ fontSize: 13, color: '#1a3a5c' }}>{selectedItem.issuer}</strong></div>
                    <div><span style={{ fontSize: 12, color: '#64748b' }}>颁发日期: </span><strong style={{ fontSize: 13, color: '#1a3a5c' }}>{selectedItem.issueDate}</strong></div>
                    <div><span style={{ fontSize: 12, color: '#64748b' }}>有效期至: </span><strong style={{ fontSize: 13, color: selectedItem.status === '即将到期' ? '#f59e0b' : selectedItem.status === '已过期' ? '#ef4444' : '#1a3a5c' }}>{selectedItem.expiryDate}</strong></div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 20 }}>
                  <button style={{ ...styles.btn, ...styles.btnSecondary }}>
                    <QrCode size={14} /> 生成二维码
                  </button>
                  <button style={{ ...styles.btn, ...styles.btnSecondary }}>
                    <Download size={14} /> 下载证书
                  </button>
                  <button style={{ ...styles.btn, ...styles.btnSecondary }}>
                    <Printer size={14} /> 打印证书
                  </button>
                </div>
              </>
            )}
          </div>
          <div style={styles.modalFooter}>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>
              {modalType === 'course' && `课程ID: ${selectedItem.id}`}
              {modalType === 'exam' && `考核ID: ${selectedItem.id}`}
              {modalType === 'cert' && `证书ID: ${selectedItem.id}`}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ ...styles.btn, ...styles.btnSecondary }} onClick={() => setShowModal(false)}>关闭</button>
              <button style={{ ...styles.btn, ...styles.btnPrimary }}>
                <Edit size={14} /> 编辑
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.root}>
      {/* 标题 */}
      <div style={styles.header}>
        <div style={styles.title}>
          <GraduationCap size={22} color="#6366f1" />
          培训考核系统
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ ...styles.btn, ...styles.btnSecondary }}>
            <Bell size={14} /> 通知
          </button>
          <button style={{ ...styles.btn, ...styles.btnSecondary }}>
            <Settings size={14} /> 设置
          </button>
        </div>
      </div>

      {/* Tab导航 */}
      <div style={styles.tabNav}>
        {(Object.keys(tabConfig) as TabType[]).map(tab => renderTab(tab))}
      </div>

      {/* Tab内容 */}
      {renderContent()}

      {/* 详情弹窗 */}
      {renderModal()}
    </div>
  );
}
