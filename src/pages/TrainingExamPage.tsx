// @ts-nocheck
// ============================================================
// G003 超声RIS系统 - 培训考核管理页面
// 课程管理 / 考核管理 / 试卷管理 / 考试界面 / 成绩记录 / 证书发放 / 统计分析
// ============================================================
import { useState } from 'react'
import {
  Search, Plus, Filter, Download, Calendar, Clock, Users,
  ChevronRight, BookOpen, Award, FileText, Play, CheckCircle,
  XCircle, AlertCircle, Eye, Edit, Trash2, Printer, ClockRotate,
  BarChart3, TrendingUp, Target, GraduationCap, ScrollText,
  BadgeCheck, Star, ClipboardList, BookMarked, Timer, Percent
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

// ---------- 样式 ----------
const s: Record<string, React.CSSProperties> = {
  root: { padding: 0 },
  header: { marginBottom: 24 },
  title: { fontSize: 20, fontWeight: 700, color: '#1a3a5c', margin: 0 },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 4 },
  headerRight: { display: 'flex', gap: 8 },
  searchBar: { display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' },
  searchInput: {
    flex: 1, padding: '10px 16px', border: '1px solid #e2e8f0',
    borderRadius: 10, fontSize: 13, outline: 'none', background: '#fff',
  },
  statRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 },
  statCard: {
    background: '#fff', borderRadius: 12, padding: '20px 24px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex',
    alignItems: 'center', gap: 16,
  },
  statIconWrap: { width: 48, height: 48, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  statInfo: { flex: 1, minWidth: 0 },
  statValue: { fontSize: 26, fontWeight: 700, color: '#1a3a5c', lineHeight: 1.2 },
  statLabel: { fontSize: 12, color: '#64748b', marginTop: 2 },
  statTrend: { fontSize: 11, color: '#22c55e', marginTop: 4, display: 'flex', alignItems: 'center', gap: 2 },
  tabs: { display: 'flex', gap: 4, marginBottom: 20, borderBottom: '2px solid #f1f5f9' },
  tab: { padding: '10px 20px', fontSize: 13, fontWeight: 600, color: '#64748b', cursor: 'pointer', borderBottom: '2px solid transparent', marginBottom: -2, transition: 'all 0.2s' },
  tabActive: { padding: '10px 20px', fontSize: 13, fontWeight: 600, color: '#3b82f6', cursor: 'pointer', borderBottom: '2px solid #3b82f6', marginBottom: -2 },
  // 课程/考试卡片
  courseCard: {
    background: '#fff', borderRadius: 12, padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 12,
    display: 'flex', gap: 16,
  },
  courseThumb: {
    width: 120, height: 80, borderRadius: 8, background: '#eff6ff',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  courseInfo: { flex: 1, minWidth: 0 },
  courseTitle: { fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 4 },
  courseDesc: { fontSize: 12, color: '#64748b', marginBottom: 8 },
  courseMeta: { display: 'flex', gap: 16, fontSize: 11, color: '#94a3b8' },
  courseTag: { fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 8, flexShrink: 0 },
  // 试卷卡片
  paperCard: {
    background: '#fff', borderRadius: 12, padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 12,
  },
  paperHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  paperTitle: { fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 4 },
  paperDesc: { fontSize: 12, color: '#64748b', marginBottom: 12 },
  paperMeta: { display: 'flex', gap: 16, fontSize: 11, color: '#94a3b8' },
  paperProgress: { height: 6, borderRadius: 3, background: '#e2e8f0', overflow: 'hidden', marginTop: 12 },
  // 图表卡片
  chartCard: { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 24 },
  chartTitle: { fontSize: 14, fontWeight: 600, color: '#1a3a5c', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 },
  chartIcon: { color: '#64748b' },
  chartGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 },
  // 按钮
  btn: { padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s' },
  btnPrimary: { padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, background: '#3b82f6', color: '#fff', transition: 'all 0.2s' },
  btnOutline: { padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, background: '#fff', color: '#475569' },
  btnSuccess: { padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, background: '#22c55e', color: '#fff', transition: 'all 0.2s' },
  btnWarning: { padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, background: '#f97316', color: '#fff', transition: 'all 0.2s' },
  btnDanger: { padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, background: '#ef4444', color: '#fff', transition: 'all 0.2s' },
  btnSm: { padding: '6px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 },
  // 颜色
  blue: { backgroundColor: '#eff6ff', color: '#3b82f6' },
  green: { backgroundColor: '#f0fdf4', color: '#22c55e' },
  orange: { backgroundColor: '#fff7ed', color: '#f97316' },
  red: { backgroundColor: '#fef2f2', color: '#ef4444' },
  purple: { backgroundColor: '#f5f3ff', color: '#8b5cf6' },
  teal: { backgroundColor: '#f0fdfa', color: '#14b8a6' },
  // 考试界面
  examContainer: { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  examHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #e2e8f0' },
  examTitle: { fontSize: 18, fontWeight: 600, color: '#1a3a5c' },
  examTimer: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 600, color: '#f97316' },
  questionCard: { background: '#f8fafc', borderRadius: 12, padding: 24, marginBottom: 20 },
  questionHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: 16 },
  questionNum: { fontSize: 14, fontWeight: 600, color: '#3b82f6' },
  questionScore: { fontSize: 12, color: '#64748b' },
  questionText: { fontSize: 15, color: '#1a3a5c', marginBottom: 16, lineHeight: 1.6 },
  optionList: { display: 'flex', flexDirection: 'column', gap: 10 },
  optionItem: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.2s' },
  optionSelected: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#eff6ff', borderRadius: 8, border: '1px solid #3b82f6', cursor: 'pointer' },
  optionRadio: { width: 18, height: 18, borderRadius: '50%', border: '2px solid #cbd5e1', flexShrink: 0 },
  optionRadioSelected: { width: 18, height: 18, borderRadius: '50%', border: '2px solid #3b82f6', background: '#3b82f6', flexShrink: 0 },
  // 成绩单
  scoreCard: {
    background: '#fff', borderRadius: 12, padding: 24,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 16,
    display: 'flex', gap: 20, alignItems: 'center',
  },
  scoreIcon: { width: 64, height: 64, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  scoreInfo: { flex: 1 },
  scoreTitle: { fontSize: 16, fontWeight: 600, color: '#1a3a5c', marginBottom: 4 },
  scoreDesc: { fontSize: 13, color: '#64748b' },
  scoreValue: { fontSize: 36, fontWeight: 700 },
  // 证书
  certCard: {
    background: 'linear-gradient(135deg, #1a3a5c 0%, #2d5a87 100%)',
    borderRadius: 12, padding: 32, color: '#fff', marginBottom: 16,
  },
  certHeader: { textAlign: 'center', marginBottom: 24 },
  certTitle: { fontSize: 24, fontWeight: 700, marginBottom: 8 },
  certSubtitle: { fontSize: 14, opacity: 0.8 },
  certBody: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 },
  certName: { fontSize: 28, fontWeight: 700, borderBottom: '2px solid rgba(255,255,255,0.3)', paddingBottom: 8 },
  certCourse: { fontSize: 16, opacity: 0.9 },
  certDate: { fontSize: 14, opacity: 0.7 },
  certFooter: { display: 'flex', justifyContent: 'space-between', marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.2)' },
  // 弹窗
  modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalContent: { background: '#fff', borderRadius: 16, padding: 32, width: 600, maxHeight: '80vh', overflow: 'auto' },
  modalTitle: { fontSize: 18, fontWeight: 600, color: '#1a3a5c', marginBottom: 20 },
  formGroup: { marginBottom: 16 },
  formLabel: { fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 6, display: 'block' },
  formInput: { width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, outline: 'none' },
  formTextarea: { width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, outline: 'none', minHeight: 100, resize: 'vertical' },
  modalActions: { display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 },
  // 表格
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '12px 16px', fontSize: 12, fontWeight: 600, color: '#64748b', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' },
  td: { padding: '12px 16px', fontSize: 13, color: '#475569', borderBottom: '1px solid #e2e8f0' },
}

const PIE_COLORS = ['#3b82f6', '#22c55e', '#f97316', '#8b5cf6', '#14b8a6', '#ef4444']
const trendTooltip = { contentStyle: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }, labelStyle: { color: '#1a3a5c', fontWeight: 600 } }

// 课程/考试数据
const COURSES = [
  { id: 1, title: '超声基础知识培训', desc: '超声波物理原理、仪器调节、图像优化', type: '操作培训', date: '2024-12-01', instructor: '张华教授', hours: 20, students: 45, status: 'completed', statusBg: '#f0fdf4', statusColor: '#22c55e' },
  { id: 2, title: '腹部超声诊断理论', desc: '肝胆胰脾超声检查要点与常见病变诊断', type: '理论考试', date: '2024-12-15', instructor: '李明主任', hours: 30, students: 38, status: 'completed', statusBg: '#f0fdf4', statusColor: '#22c55e' },
  { id: 3, title: '心血管超声检查操作', desc: '心脏超声标准化切面与测量', type: '操作培训', date: '2025-01-05', instructor: '王芳副教授', hours: 25, students: 30, status: 'completed', statusBg: '#f0fdf4', statusColor: '#22c55e' },
  { id: 4, title: '肝脏占位病例讨论', desc: '肝脏良恶性占位病变鉴别诊断', type: '病例讨论', date: '2025-01-12', instructor: '刘涛主治', hours: 8, students: 25, status: 'completed', statusBg: '#f0fdf4', statusColor: '#22c55e' },
  { id: 5, title: '甲状腺结节超声评估', desc: 'TI-RADS分类标准与临床应用', type: '理论考试', date: '2025-02-01', instructor: '赵红副主任', hours: 15, students: 42, status: 'upcoming', statusBg: '#fff7ed', statusColor: '#f97316' },
  { id: 6, title: '乳腺超声规范化检查', desc: '乳腺超声标准化操作与BI-RADS分类', type: '操作培训', date: '2025-02-15', instructor: '孙丽主管', hours: 20, students: 35, status: 'upcoming', statusBg: '#fff7ed', statusColor: '#f97316' },
  { id: 7, title: '介入超声基本技能', desc: '超声引导下穿刺活检操作规范', type: '操作培训', date: '2025-03-01', instructor: '周杰教授', hours: 24, students: 20, status: 'upcoming', statusBg: '#fff7ed', statusColor: '#f97316' },
  { id: 8, title: '甲状腺癌病例讨论', desc: '甲状腺乳头状癌超声诊断与鉴别', type: '病例讨论', date: '2025-03-10', instructor: '吴静主任', hours: 8, students: 28, status: 'upcoming', statusBg: '#fff7ed', statusColor: '#f97316' },
  { id: 9, title: '泌尿系统超声诊断', desc: '肾脏、膀胱、前列腺超声检查', type: '理论考试', date: '2025-03-20', instructor: '郑强主治', hours: 18, students: 40, status: 'upcoming', statusBg: '#fff7ed', statusColor: '#f97316' },
  { id: 10, title: '产科超声筛查技术', desc: '早孕期及中孕期超声筛查规范', type: '操作培训', date: '2025-04-01', instructor: '陈萍教授', hours: 30, students: 22, status: 'upcoming', statusBg: '#fff7ed', statusColor: '#f97316' },
  { id: 11, title: '阑尾炎超声诊断', desc: '急性阑尾炎超声诊断要点与鉴别', type: '病例讨论', date: '2025-04-12', instructor: '林涛副主任', hours: 6, students: 32, status: 'upcoming', statusBg: '#fff7ed', statusColor: '#f97316' },
  { id: 12, title: '外周血管超声检查', desc: '四肢血管超声操作规范与报告', type: '操作培训', date: '2025-04-20', instructor: '黄芳主管', hours: 16, students: 28, status: 'upcoming', statusBg: '#fff7ed', statusColor: '#f97316' },
]

// 试卷数据
const EXAM_PAPERS = [
  { id: 1, title: '超声基础理论考核A卷', desc: '超声波物理基础、仪器调节、图像优化', course: '超声基础知识培训', questions: 50, passingScore: 60, duration: 90, type: '理论考试', difficulty: '基础', usedCount: 156 },
  { id: 2, title: '腹部超声诊断理论考核', desc: '肝胆胰脾超声诊断要点', course: '腹部超声诊断理论', questions: 40, passingScore: 65, duration: 80, type: '理论考试', difficulty: '中等', usedCount: 98 },
  { id: 3, title: '心血管超声操作考核', desc: '心脏超声标准化切面与测量', course: '心血管超声检查操作', questions: 20, passingScore: 70, duration: 60, type: '操作考核', difficulty: '中等', usedCount: 75 },
  { id: 4, title: '甲状腺结节TI-RADS考核', desc: '甲状腺结节超声评估标准', course: '甲状腺结节超声评估', questions: 30, passingScore: 60, duration: 45, type: '理论考试', difficulty: '中等', usedCount: 120 },
  { id: 5, title: '乳腺BI-RADS分类考核', desc: '乳腺超声BI-RADS应用', course: '乳腺超声规范化检查', questions: 25, passingScore: 65, duration: 40, type: '理论考试', difficulty: '中等', usedCount: 88 },
  { id: 6, title: '介入超声基本技能考核', desc: '超声引导穿刺操作规范', course: '介入超声基本技能', questions: 15, passingScore: 75, duration: 30, type: '操作考核', difficulty: '困难', usedCount: 45 },
]

// 考试成绩数据
const SCORE_RECORDS = [
  { id: 1, examTitle: '超声基础理论考核A卷', student: '王建国', date: '2024-12-16', score: 85, passed: true, correctRate: 85, timeSpent: 75 },
  { id: 2, examTitle: '超声基础理论考核A卷', student: '李秀英', date: '2024-12-16', score: 72, passed: true, correctRate: 72, timeSpent: 82 },
  { id: 3, examTitle: '超声基础理论考核A卷', student: '张伟', date: '2024-12-16', score: 58, passed: false, correctRate: 58, timeSpent: 88 },
  { id: 4, examTitle: '腹部超声诊断理论考核', student: '刘芳', date: '2024-12-20', score: 90, passed: true, correctRate: 90, timeSpent: 65 },
  { id: 5, examTitle: '腹部超声诊断理论考核', student: '陈军', date: '2024-12-20', score: 68, passed: true, correctRate: 68, timeSpent: 72 },
  { id: 6, examTitle: '心血管超声操作考核', student: '赵敏', date: '2025-01-08', score: 95, passed: true, correctRate: 95, timeSpent: 45 },
  { id: 7, examTitle: '心血管超声操作考核', student: '孙强', date: '2025-01-08', score: 78, passed: true, correctRate: 78, timeSpent: 52 },
  { id: 8, examTitle: '肝脏占位病例讨论', student: '周静', date: '2025-01-15', score: 88, passed: true, correctRate: 88, timeSpent: 60 },
]

// 统计图表数据
const PASS_RATE_BY_COURSE = [
  { name: '超声基础', passRate: 92, total: 45 },
  { name: '腹部超声', passRate: 88, total: 38 },
  { name: '心血管超声', passRate: 95, total: 30 },
  { name: '甲状腺评估', passRate: 85, total: 42 },
  { name: '乳腺超声', passRate: 90, total: 35 },
  { name: '介入超声', passRate: 78, total: 20 },
]

const SCORE_DISTRIBUTION = [
  { range: '0-59', count: 8, color: '#ef4444' },
  { range: '60-69', count: 15, color: '#f97316' },
  { range: '70-79', count: 32, color: '#eab308' },
  { range: '80-89', count: 45, color: '#22c55e' },
  { range: '90-100', count: 28, color: '#3b82f6' },
]

const MONTHLY_TREND = [
  { month: '1月', exams: 12, passRate: 88 },
  { month: '2月', exams: 18, passRate: 85 },
  { month: '3月', exams: 25, passRate: 90 },
  { month: '4月', exams: 22, passRate: 87 },
  { month: '5月', exams: 30, passRate: 92 },
  { month: '6月', exams: 28, passRate: 89 },
]

// 证书数据
const CERTIFICATES = [
  { id: 1, name: '王建国', course: '超声基础知识培训', date: '2024-12-20', score: 85 },
  { id: 2, name: '刘芳', course: '腹部超声诊断理论', date: '2024-12-25', score: 90 },
  { id: 3, name: '赵敏', course: '心血管超声检查操作', date: '2025-01-10', score: 95 },
]

// 考试题目示例
const SAMPLE_QUESTIONS = [
  { id: 1, type: 'single', text: '超声波在人体软组织中的平均传播速度是多少？', options: ['1540 m/s', '3460 m/s', '4080 m/s', '5600 m/s'], correct: 0, score: 2 },
  { id: 2, type: 'single', text: '下列哪种情况最适合使用谐波成像？', options: ['肥胖患者', '儿童', '所有患者', '心脏检查'], correct: 1, score: 2 },
  { id: 3, type: 'single', text: '肝脏血管瘤典型的超声表现是？', options: ['低回声结节', '高回声结节', '无回声区', '混合回声'], correct: 1, score: 2 },
  { id: 4, type: 'single', text: '超声引导下穿刺活检的相对禁忌症包括？', options: ['凝血功能障碍', '浅表肿块', '囊性病变', '实性肿块'], correct: 0, score: 2 },
  { id: 5, type: 'single', text: '甲状腺TI-RADS分类中，4类结节的特点是？', options: ['无恶性特征', '低度可疑', '中度可疑', '高度可疑'], correct: 2, score: 2 },
]

export default function TrainingExamPage() {
  const [activeTab, setActiveTab] = useState('courses')
  const [searchText, setSearchText] = useState('')
  const [showExamModal, setShowExamModal] = useState(false)
  const [showPaperModal, setShowPaperModal] = useState(false)
  const [showScoreModal, setShowScoreModal] = useState(false)
  const [showCertModal, setShowCertModal] = useState(false)
  const [showExamInterface, setShowExamInterface] = useState(false)
  const [currentExam, setCurrentExam] = useState<typeof COURSES[0] | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [selectedCert, setSelectedCert] = useState<typeof CERTIFICATES[0] | null>(null)
  const [examTimeLeft, setExamTimeLeft] = useState(90 * 60)

  // 标签页映射
  const tabLabels: Record<string, string> = {
    courses: '课程列表',
    exams: '考核管理',
    papers: '试卷管理',
    scores: '成绩记录',
    statistics: '统计分析',
  }

  // 获取类型图标和颜色
  const getTypeStyle = (type: string) => {
    switch (type) {
      case '操作培训': return { bg: '#eff6ff', color: '#3b82f6', icon: Play }
      case '理论考试': return { bg: '#fef2f2', color: '#ef4444', icon: FileText }
      case '病例讨论': return { bg: '#f5f3ff', color: '#8b5cf6', icon: Users }
      default: return { bg: '#f0fdf4', color: '#22c55e', icon: BookOpen }
    }
  }

  // 筛选课程
  const filteredCourses = COURSES.filter(c =>
    c.title.includes(searchText) || c.instructor.includes(searchText) || c.type.includes(searchText)
  )

  // 开始考试
  const startExam = (course: typeof COURSES[0]) => {
    setCurrentExam(course)
    setShowExamInterface(true)
    setCurrentQuestion(0)
    setAnswers({})
    setExamTimeLeft((EXAM_PAPERS.find(p => p.course === course.title)?.duration || 90) * 60)
  }

  // 交卷
  const submitExam = () => {
    setShowExamInterface(false)
    setShowScoreModal(true)
  }

  // 查看证书
  const viewCertificate = (cert: typeof CERTIFICATES[0]) => {
    setSelectedCert(cert)
    setShowCertModal(true)
  }

  return (
    <div style={s.root}>
      {/* 标题 */}
      <div style={s.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={s.title}>培训考核管理</h1>
            <p style={s.subtitle}>课程管理 · 考核管理 · 试卷管理 · 成绩记录 · 证书发放</p>
          </div>
          <div style={s.headerRight}>
            <button style={s.btnOutline}><Download size={14} /> 导出数据</button>
            <button style={s.btnPrimary} onClick={() => setShowPaperModal(true)}><Plus size={14} /> 新建课程</button>
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div style={s.statRow}>
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, background: '#eff6ff' }}><GraduationCap size={22} color="#3b82f6" /></div>
          <div style={s.statInfo}>
            <div style={s.statValue}>12</div>
            <div style={s.statLabel}>培训课程</div>
            <div style={s.statTrend}><TrendingUp size={11} /> 本月新增 +3</div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, background: '#f0fdf4' }}><ClipboardList size={22} color="#22c55e" /></div>
          <div style={s.statInfo}>
            <div style={s.statValue}>156</div>
            <div style={s.statLabel}>考核人次</div>
            <div style={s.statTrend}><TrendingUp size={11} /> +28</div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, background: '#fff7ed' }}><Percent size={22} color="#f97316" /></div>
          <div style={s.statInfo}>
            <div style={s.statValue}>89%</div>
            <div style={s.statLabel}>平均通过率</div>
            <div style={s.statTrend}><TrendingUp size={11} /> +5%</div>
          </div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statIconWrap, background: '#f5f3ff' }}><BadgeCheck size={22} color="#8b5cf6" /></div>
          <div style={s.statInfo}>
            <div style={s.statValue}>42</div>
            <div style={s.statLabel}>发放证书</div>
            <div style={s.statTrend}><TrendingUp size={11} /> +12</div>
          </div>
        </div>
      </div>

      {/* 搜索栏 */}
      <div style={s.searchBar}>
        <input style={s.searchInput} placeholder="搜索课程、考核..." value={searchText} onChange={(e) => setSearchText(e.target.value)} />
        <button style={s.btnOutline}><Filter size={14} /> 筛选</button>
      </div>

      {/* 标签页 */}
      <div style={s.tabs}>
        {Object.entries(tabLabels).map(([key, label]) => (
          <div key={key} style={activeTab === key ? s.tabActive : s.tab} onClick={() => setActiveTab(key)}>
            {label}
          </div>
        ))}
      </div>

      {/* 课程列表 */}
      {activeTab === 'courses' && (
        <div>
          {filteredCourses.map((course) => {
            const typeStyle = getTypeStyle(course.type)
            return (
              <div key={course.id} style={s.courseCard}>
                <div style={{ ...s.courseThumb, background: typeStyle.bg }}>
                  <typeStyle.icon size={28} color={typeStyle.color} />
                </div>
                <div style={s.courseInfo}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={s.courseTitle}>{course.title}</div>
                      <div style={s.courseDesc}>{course.desc}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <div style={{ ...s.courseTag, background: typeStyle.bg, color: typeStyle.color }}>{course.type}</div>
                      <div style={{ ...s.courseTag, background: course.statusBg, color: course.statusColor }}>
                        {course.status === 'completed' ? '已完成' : '即将进行'}
                      </div>
                    </div>
                  </div>
                  <div style={s.courseMeta}>
                    <span><Calendar size={12} style={{ marginRight: 4 }} />{course.date}</span>
                    <span><Users size={12} style={{ marginRight: 4 }} />讲师：{course.instructor}</span>
                    <span><Clock size={12} style={{ marginRight: 4 }} />{course.hours}学时</span>
                    <span><BookOpen size={12} style={{ marginRight: 4 }} />{course.students}人</span>
                  </div>
                  {course.status === 'upcoming' && (
                    <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                      <button style={s.btnSuccess} onClick={() => startExam(course)}><Play size={14} /> 开始考核</button>
                      <button style={s.btnOutline}><Eye size={14} /> 查看详情</button>
                    </div>
                  )}
                  {course.status === 'completed' && (
                    <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                      <button style={s.btnOutline}><BadgeCheck size={14} /> 发放证书</button>
                      <button style={s.btnOutline}><BarChart3 size={14} /> 查看成绩</button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 考核管理 */}
      {activeTab === 'exams' && (
        <div>
          {COURSES.filter(c => c.status === 'upcoming').slice(0, 6).map((exam) => (
            <div key={exam.id} style={s.paperCard}>
              <div style={s.paperHeader}>
                <div style={{ flex: 1 }}>
                  <div style={s.paperTitle}>{exam.title}</div>
                  <div style={s.paperDesc}>{exam.desc}</div>
                </div>
                <div style={{ ...s.courseTag, background: exam.statusBg, color: exam.statusColor }}>即将进行</div>
              </div>
              <div style={s.paperMeta}>
                <span><Calendar size={12} style={{ marginRight: 4 }} />{exam.date}</span>
                <span><Clock size={12} style={{ marginRight: 4 }} />{exam.hours}学时</span>
                <span><Users size={12} style={{ marginRight: 4 }} />{exam.students}人报名</span>
                <span><FileText size={12} style={{ marginRight: 4 }} />{EXAM_PAPERS.find(p => p.course === exam.title)?.questions || 30}题</span>
              </div>
              <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                <button style={s.btnPrimary} onClick={() => startExam(exam)}><Play size={14} /> 开始考试</button>
                <button style={s.btnOutline}><Edit size={14} /> 编辑</button>
                <button style={s.btnOutline}><ClipboardList size={14} /> 考生名单</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 试卷管理 */}
      {activeTab === 'papers' && (
        <div>
          {EXAM_PAPERS.map((paper) => (
            <div key={paper.id} style={s.paperCard}>
              <div style={s.paperHeader}>
                <div style={{ flex: 1 }}>
                  <div style={s.paperTitle}>{paper.title}</div>
                  <div style={s.paperDesc}>{paper.desc}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ ...s.courseTag, background: '#eff6ff', color: '#3b82f6' }}>{paper.type}</div>
                  <div style={{ ...s.courseTag, background: paper.difficulty === '困难' ? '#fef2f2' : paper.difficulty === '中等' ? '#fff7ed' : '#f0fdf4', color: paper.difficulty === '困难' ? '#ef4444' : paper.difficulty === '中等' ? '#f97316' : '#22c55e' }}>{paper.difficulty}</div>
                </div>
              </div>
              <div style={s.paperMeta}>
                <span><FileText size={12} style={{ marginRight: 4 }} />{paper.questions}题</span>
                <span><Target size={12} style={{ marginRight: 4 }} />及格分：{paper.passingScore}分</span>
                <span><Timer size={12} style={{ marginRight: 4 }} />时长：{paper.duration}分钟</span>
                <span><Users size={12} style={{ marginRight: 4 }} />已使用{paper.usedCount}次</span>
              </div>
              <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                <button style={s.btnPrimary}><Eye size={14} /> 预览试卷</button>
                <button style={s.btnOutline}><Edit size={14} /> 编辑</button>
                <button style={s.btnOutline}><Play size={14} /> 模拟考试</button>
                <button style={s.btnDanger}><Trash2 size={14} /> 删除</button>
              </div>
            </div>
          ))}
          <div style={{ ...s.paperCard, border: '2px dashed #e2e8f0', background: '#f8fafc', cursor: 'pointer' }} onClick={() => setShowPaperModal(true)}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#64748b' }}>
              <Plus size={20} /> 新建试卷
            </div>
          </div>
        </div>
      )}

      {/* 成绩记录 */}
      {activeTab === 'scores' && (
        <div>
          <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <button style={s.btnOutline}><Download size={14} /> 导出成绩</button>
              <button style={s.btnOutline}><Printer size={14} /> 打印成绩单</button>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={s.btnSuccess}><BadgeCheck size={14} /> 及格学员：6人</button>
              <button style={s.btnDanger}><XCircle size={14} /> 不及格学员：2人</button>
            </div>
          </div>
          {SCORE_RECORDS.map((record) => (
            <div key={record.id} style={s.scoreCard}>
              <div style={{ ...s.scoreIcon, background: record.passed ? '#f0fdf4' : '#fef2f2' }}>
                {record.passed ? <CheckCircle size={28} color="#22c55e" /> : <XCircle size={28} color="#ef4444" />}
              </div>
              <div style={s.scoreInfo}>
                <div style={s.scoreTitle}>{record.student} - {record.examTitle}</div>
                <div style={s.scoreDesc}>考试日期：{record.date} | 用时：{record.timeSpent}分钟 | 正确率：{record.correctRate}%</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 2 }}>最终得分</div>
                <div style={{ ...s.scoreValue, color: record.passed ? '#22c55e' : '#ef4444' }}>{record.score}分</div>
              </div>
              {record.passed && (
                <button style={{ ...s.btnSm, background: '#f0fdf4', color: '#22c55e' }} onClick={() => viewCertificate({ id: record.id, name: record.student, course: record.examTitle, date: record.date, score: record.score })}>
                  <BadgeCheck size={14} /> 发放证书
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 统计分析 */}
      {activeTab === 'statistics' && (
        <div>
          <div style={s.chartGrid}>
            <div style={s.chartCard}>
              <div style={s.chartTitle}><Percent size={16} style={s.chartIcon} /> 各课程通过率</div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={PASS_RATE_BY_COURSE}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} domain={[0, 100]} />
                  <Tooltip {...trendTooltip} />
                  <Bar dataKey="passRate" fill="#3b82f6" name="通过率(%)" radius={[4, 4, 0, 0]}>
                    {PASS_RATE_BY_COURSE.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={s.chartCard}>
              <div style={s.chartTitle}><BarChart3 size={16} style={s.chartIcon} /> 成绩分布</div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={SCORE_DISTRIBUTION}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip {...trendTooltip} />
                  <Bar dataKey="count" name="人数" radius={[4, 4, 0, 0]}>
                    {SCORE_DISTRIBUTION.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div style={s.chartCard}>
            <div style={s.chartTitle}><TrendingUp size={16} style={s.chartIcon} /> 月度考核趋势</div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={MONTHLY_TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#94a3b8' }} domain={[0, 100]} />
                <Tooltip {...trendTooltip} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line yAxisId="left" type="monotone" dataKey="exams" stroke="#3b82f6" name="考核人次" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
                <Line yAxisId="right" type="monotone" dataKey="passRate" stroke="#22c55e" name="通过率(%)" strokeWidth={2} dot={{ fill: '#22c55e' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 考试界面 */}
      {showExamInterface && currentExam && (
        <div style={{ ...s.modal, background: '#f8fafc' }}>
          <div style={{ ...s.examContainer, width: 800, maxHeight: '90vh', overflow: 'auto' }}>
            <div style={s.examHeader}>
              <div style={s.examTitle}>{currentExam.title} - 考核测试</div>
              <div style={s.examTimer}>
                <Timer size={20} /> 剩余时间：{Math.floor(examTimeLeft / 60)}:{String(examTimeLeft % 60).padStart(2, '0')}
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#1a3a5c' }}>第 {currentQuestion + 1} 题 / 共 {SAMPLE_QUESTIONS.length} 题</span>
                <span style={{ fontSize: 13, color: '#64748b' }}>本题满分：{SAMPLE_QUESTIONS[currentQuestion].score}分</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: '#e2e8f0' }}>
                <div style={{ height: '100%', width: `${((currentQuestion + 1) / SAMPLE_QUESTIONS.length) * 100}%`, background: '#3b82f6', borderRadius: 3 }} />
              </div>
            </div>
            <div style={s.questionCard}>
              <div style={s.questionText}>{SAMPLE_QUESTIONS[currentQuestion].text}</div>
              <div style={s.optionList}>
                {SAMPLE_QUESTIONS[currentQuestion].options.map((option, idx) => (
                  <div
                    key={idx}
                    style={answers[currentQuestion] === idx ? s.optionSelected : s.optionItem}
                    onClick={() => setAnswers({ ...answers, [currentQuestion]: idx })}
                  >
                    <div style={answers[currentQuestion] === idx ? s.optionRadioSelected : s.optionRadio} />
                    <span style={{ fontSize: 14, color: '#475569' }}>{option}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
              <button
                style={s.btnOutline}
                disabled={currentQuestion === 0}
                onClick={() => setCurrentQuestion(currentQuestion - 1)}
              >
                上一题
              </button>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  {SAMPLE_QUESTIONS.map((_, idx) => (
                    <div
                      key={idx}
                      style={{
                        width: 24, height: 24, borderRadius: 4, background: answers[idx] !== undefined ? '#3b82f6' : '#e2e8f0',
                        color: '#fff', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                      }}
                      onClick={() => setCurrentQuestion(idx)}
                    >
                      {idx + 1}
                    </div>
                  ))}
                </div>
                {currentQuestion < SAMPLE_QUESTIONS.length - 1 ? (
                  <button style={s.btnPrimary} onClick={() => setCurrentQuestion(currentQuestion + 1)}>下一题</button>
                ) : (
                  <button style={s.btnSuccess} onClick={submitExam}>交卷</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 成绩弹窗 */}
      {showScoreModal && (
        <div style={s.modal} onClick={() => setShowScoreModal(false)}>
          <div style={s.modalContent} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <CheckCircle size={36} color="#22c55e" />
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1a3a5c', margin: '0 0 8px' }}>考试完成！</h2>
              <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>您的成绩已提交，请等待评分结果</p>
            </div>
            <div style={{ background: '#f8fafc', borderRadius: 12, padding: 20, marginBottom: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>完成题数</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#1a3a5c' }}>{Object.keys(answers).length}/{SAMPLE_QUESTIONS.length}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>用时</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#1a3a5c' }}>{90 - Math.floor(examTimeLeft / 60)}分钟</div>
                </div>
              </div>
            </div>
            <div style={s.modalActions}>
              <button style={s.btnOutline} onClick={() => setShowScoreModal(false)}>关闭</button>
              <button style={s.btnPrimary}>查看详细成绩</button>
            </div>
          </div>
        </div>
      )}

      {/* 证书弹窗 */}
      {showCertModal && selectedCert && (
        <div style={s.modal} onClick={() => setShowCertModal(false)}>
          <div style={{ ...s.modalContent, width: 500 } } onClick={e => e.stopPropagation()}>
            <div style={s.certCard}>
              <div style={s.certHeader}>
                <div style={s.certTitle}>培训合格证书</div>
                <div style={s.certSubtitle}>Certificate of Completion</div>
              </div>
              <div style={s.certBody}>
                <div style={{ fontSize: 14, opacity: 0.8 }}>本证书授予</div>
                <div style={s.certName}>{selectedCert.name}</div>
                <div style={{ fontSize: 14, opacity: 0.8 }}>完成</div>
                <div style={s.certCourse}>{selectedCert.course}</div>
                <div style={{ fontSize: 14, opacity: 0.8 }}>考核成绩</div>
                <div style={{ fontSize: 32, fontWeight: 700 }}>{selectedCert.score}分</div>
                <div style={s.certDate}>发证日期：{selectedCert.date}</div>
              </div>
              <div style={s.certFooter}>
                <div style={{ fontSize: 12, opacity: 0.7 }}>超声医学科</div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>盖章有效</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button style={s.btnOutline}><Printer size={14} /> 打印证书</button>
              <button style={s.btnPrimary}><Download size={14} /> 下载证书</button>
              <button style={s.btnOutline} onClick={() => setShowCertModal(false)}>关闭</button>
            </div>
          </div>
        </div>
      )}

      {/* 新建试卷弹窗 */}
      {showPaperModal && (
        <div style={s.modal} onClick={() => setShowPaperModal(false)}>
          <div style={s.modalContent} onClick={e => e.stopPropagation()}>
            <div style={s.modalTitle}>新建课程/考核</div>
            <div style={s.formGroup}>
              <label style={s.formLabel}>课程名称</label>
              <input style={s.formInput} placeholder="请输入课程名称" />
            </div>
            <div style={s.formGroup}>
              <label style={s.formLabel}>课程类型</label>
              <select style={s.formInput}>
                <option>操作培训</option>
                <option>理论考试</option>
                <option>病例讨论</option>
              </select>
            </div>
            <div style={s.formGroup}>
              <label style={s.formLabel}>课程描述</label>
              <textarea style={s.formTextarea} placeholder="请输入课程描述" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={s.formGroup}>
                <label style={s.formLabel}>课程日期</label>
                <input style={s.formInput} type="date" />
              </div>
              <div style={s.formGroup}>
                <label style={s.formLabel}>课程时长（学时）</label>
                <input style={s.formInput} type="number" placeholder="请输入学时" />
              </div>
            </div>
            <div style={s.formGroup}>
              <label style={s.formLabel}>授课讲师</label>
              <input style={s.formInput} placeholder="请输入讲师姓名" />
            </div>
            <div style={s.modalActions}>
              <button style={s.btnOutline} onClick={() => setShowPaperModal(false)}>取消</button>
              <button style={s.btnPrimary}>创建课程</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
