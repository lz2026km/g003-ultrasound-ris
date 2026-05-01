// @ts-nocheck
// ============================================================
// G004 消化道早癌筛查平台
// 消化道早癌筛查 - 筛查任务/高危评估/早癌追踪/数据地图
// ============================================================
import { useState, useMemo } from 'react'
import {
  Users, AlertTriangle, Target, Heart, MapPin, TrendingUp,
  Plus, Search, Filter, Download, RefreshCw,
  Activity, Shield, Clock, CheckCircle, XCircle, PauseCircle,
  ArrowUp, ArrowDown, AlertCircle, Microscope, Calendar,
  ChevronDown, ChevronRight, Edit, Trash2, Eye, ClipboardList,
  FileSearch, UserCheck, Inbox
} from 'lucide-react'

// ---------- 统计数据 ----------
const statsData = [
  { label: '累计筛查人数', value: '12,856', unit: '人', icon: Users, color: '#2563eb', bg: '#eff6ff' },
  { label: '高危人群', value: '1,856', unit: '人', sub: '14.4%', icon: AlertTriangle, color: '#ea580c', bg: '#fff7ed' },
  { label: '早癌检出', value: '428', unit: '例', sub: '检出率3.27%', icon: Target, color: '#dc2626', bg: '#fef2f2' },
  { label: '早癌治愈率', value: '91.2', unit: '%', icon: Heart, color: '#16a34a', bg: '#f0fdf4' },
  { label: '筛查覆盖地区', value: '18', unit: '个省市', icon: MapPin, color: '#7c3aed', bg: '#f5f3ff' },
  { label: '本月新增筛查', value: '856', unit: '人', trend: 'up', icon: TrendingUp, color: '#0891b2', bg: '#ecfeff' },
]

// ---------- 样式 ----------
const s: Record<string, React.CSSProperties> = {
  root: { padding: 0 },
  header: { marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 20, fontWeight: 700, color: '#1a3a5c', margin: 0 },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 4 },
  // 统计卡片行
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginBottom: 24 },
  statCard: {
    background: '#fff', borderRadius: 12, padding: '18px 14px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', position: 'relative', overflow: 'hidden',
  },
  statIcon: { width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  statValue: { fontSize: 26, fontWeight: 800, color: '#1a3a5c', lineHeight: 1.1 },
  statLabel: { fontSize: 12, color: '#64748b', marginTop: 4 },
  statSub: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  statTrend: { position: 'absolute', top: 14, right: 14, fontSize: 11, fontWeight: 600 },
  // 功能区分区
  section: { background: '#fff', borderRadius: 12, padding: 20, marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  sectionTitle: { fontSize: 15, fontWeight: 700, color: '#1a3a5c', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 },
  // 任务管理
  taskGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  taskLeft: {},
  taskRight: {},
  taskToolbar: { display: 'flex', gap: 8, marginBottom: 12 },
  searchInput: {
    flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0',
    fontSize: 13, outline: 'none',
  },
  btn: {
    padding: '8px 14px', borderRadius: 8, border: '1px solid #e2e8f0',
    background: '#fff', cursor: 'pointer', fontSize: 13, display: 'flex',
    alignItems: 'center', gap: 6, fontWeight: 500,
  },
  btnPrimary: { padding: '8px 14px', borderRadius: 8, border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500 },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 12 },
  th: { textAlign: 'left', padding: '10px 8px', borderBottom: '2px solid #f1f5f9', color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap' },
  td: { padding: '10px 8px', borderBottom: '1px solid #f8fafc', color: '#334155' },
  statusBadge: { padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600 },
  // 高危评估
  assessGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 },
  assessForm: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  formItem: {},
  formLabel: { fontSize: 12, color: '#64748b', marginBottom: 4 },
  formSelect: { width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', background: '#fff' },
  riskCard: {
    borderRadius: 12, padding: 20, textAlign: 'center', marginBottom: 16,
    border: '2px solid transparent', cursor: 'pointer', transition: 'all 0.2s',
  },
  riskValue: { fontSize: 48, fontWeight: 800, lineHeight: 1 },
  riskLabel: { fontSize: 14, marginTop: 6, fontWeight: 600 },
  riskScore: { fontSize: 12, marginTop: 4, opacity: 0.8 },
  // 早癌检出
  detectionGrid: { display: 'grid', gridTemplateColumns: '1fr', gap: 0 },
  detectionRow: {
    display: 'grid', gridTemplateColumns: '100px 80px 80px 120px 80px 80px 80px 80px',
    gap: 8, padding: '10px 8px', borderBottom: '1px solid #f1f5f9', alignItems: 'center', fontSize: 12,
  },
  detectionHeader: { background: '#f8fafc', borderRadius: 8, marginBottom: 4, fontWeight: 600, color: '#64748b', fontSize: 12 },
  tag: { padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, display: 'inline-block', textAlign: 'center' },
  // 地图
  mapGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 },
  mapSvg: { position: 'relative', background: '#f8fafc', borderRadius: 12, padding: 16, minHeight: 400 },
  mapPlaceholder: { display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' },
  mapProvince: { padding: '6px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'default' },
  provinceTable: { fontSize: 12 },
  provinceTh: { textAlign: 'left', padding: '8px 10px', borderBottom: '2px solid #f1f5f9', color: '#64748b', fontWeight: 600 },
  provinceTd: { padding: '8px 10px', borderBottom: '1px solid #f8fafc', color: '#334155' },
  // 滚动容器
  scrollBox: { maxHeight: 320, overflowY: 'auto' },
  // 空状态
  emptyState: {
    textAlign: 'center',
    padding: '48px 20px',
    color: '#94a3b8',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
  emptyStateIcon: { opacity: 0.35, marginBottom: 4 },
  emptyStateText: { fontSize: 14, color: '#64748b', fontWeight: 500 },
  emptyStateHint: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
}

// ---------- 组件 ----------
const StatCard = ({ label, value, unit, sub, icon: Icon, color, bg, trend }: typeof statsData[0]) => (
  <div style={s.statCard}>
    <div style={{ ...s.statIcon, background: bg }}>
      <Icon size={20} color={color} />
    </div>
    <div style={s.statValue}>{value}<span style={{ fontSize: 14, fontWeight: 400, color: '#64748b' }}>{unit}</span></div>
    <div style={s.statLabel}>{label}</div>
    {sub && <div style={s.statSub}>{sub}</div>}
    {trend && <div style={{ ...s.statTrend, color: trend === 'up' ? '#16a34a' : '#dc2626' }}><ArrowUp size={12} />{trend === 'up' ? '↑' : '↓'}</div>}
  </div>
)

const StatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, { bg: string; text: string }> = {
    '招募中': { bg: '#fefce8', text: '#ca8a04' },
    '进行中': { bg: '#eff6ff', text: '#2563eb' },
    '已完成': { bg: '#f0fdf4', text: '#16a34a' },
  }
  const c = colors[status] || { bg: '#f1f5f9', text: '#64748b' }
  return <span style={{ ...s.statusBadge, background: c.bg, color: c.text }}>{status}</span>
}

const CancerScreenPage = () => {
  const [tab, setTab] = useState(1)
  const [taskSearch, setTaskSearch] = useState('')
  const [currentScore, setCurrentScore] = useState(0)
  const [currentRisk, setCurrentRisk] = useState<'低危' | '中危' | '高危' | '极高危'>('低危')

  // ---------- 数据 (useMemo避免重复计算) ----------
  const taskStatuses = ['招募中', '进行中', '已完成']
  const regions = ['山东省', '河南省', '内蒙古', '青海省', '四川省', '广东省', '江苏省', '浙江省', '安徽省', '福建省', '江西省', '湖南省', '湖北省', '河北省', '山西省', '陕西省', '辽宁省', '吉林省']
  const tasks = useMemo(() => Array.from({ length: 60 }, (_, i) => {
    const status = taskStatuses[Math.floor(Math.random() * 3)]
    const target = 200 + Math.floor(Math.random() * 800)
    const completed = status === '已完成' ? target : Math.floor(target * (0.1 + Math.random() * 0.85))
    const year = i < 30 ? 2025 : 2026
    const month = 1 + (i % 11)
    const day = 10 + (i % 18)
    return {
      id: i + 1,
      name: `${regions[i % regions.length]}第${Math.floor(i / regions.length) + 1}批消化道早癌筛查`,
      region: regions[i % regions.length],
      target,
      completed,
      rate: Math.round((completed / target) * 100),
      status,
      startDate: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      doctor: `张${['伟', '磊', '涛', '勇', '强', '军', '波', '辉', '彬', '龙'][i % 10]}医生`,
    }
  }), [])

  const riskColors: Record<string, string> = { '低危': '#16a34a', '中危': '#ca8a04', '高危': '#ea580c', '极高危': '#dc2626' }
  const riskBgColors: Record<string, string> = { '低危': '#f0fdf4', '中危': '#fefce8', '高危': '#fff7ed', '极高危': '#fef2f2' }
  const names = ['王建国', '李明华', '张秀英', '刘德伟', '陈淑芳', '杨志国', '赵丽娟', '黄文博', '周玉珍', '吴洪亮', '徐海燕', '孙志远', '马晓东', '朱艳红', '胡金生', '郭彩云', '林国栋', '何秀兰', '高建新', '罗春梅', '郑成文', '梁晓燕', '宋立功', '唐桂英', '许志鹏', '韩素芳', '邓小刚', '冯翠花', '曹德华', '彭丽华']
  const assessments = useMemo(() => Array.from({ length: 30 }, (_, i) => {
    const totalScore = 5 + Math.floor(Math.random() * 45)
    let risk: string
    if (totalScore < 15) risk = '低危'
    else if (totalScore < 25) risk = '中危'
    else if (totalScore < 35) risk = '高危'
    else risk = '极高危'
    const year = i < 15 ? 2025 : 2026
    const month = 1 + (i % 11)
    const day = 10 + (i % 18)
    return {
      id: i + 1,
      date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      name: names[i],
      age: 35 + Math.floor(Math.random() * 40),
      totalScore,
      risk,
      doctor: `李${['敏', '娜', '霞', '琳', '燕', '芳', '娟', '玲', '婷', '颖'][i % 10]}医生`,
    }
  }), [])

  const [assessmentForm, setAssessmentForm] = useState({
    age: 45, gender: '男', diet: '一般', hp: '无', family: '无', symptoms: '无', history: '无', region: '低风险'
  })
  const assessmentDimensions = [
    { key: 'age', label: '年龄', options: [{ v: 0, l: '<40岁' }, { v: 1, l: '40-50岁' }, { v: 2, l: '50-60岁' }, { v: 3, l: '>60岁' }] },
    { key: 'gender', label: '性别', options: [{ v: 0, l: '女' }, { v: 1, l: '男' }] },
    { key: 'diet', label: '饮食习惯', options: [{ v: 0, l: '规律' }, { v: 1, l: '一般' }, { v: 2, l: '不规律' }] },
    { key: 'hp', label: 'HP史', options: [{ v: 0, l: '无' }, { v: 2, l: '有' }] },
    { key: 'family', label: '肿瘤家族史', options: [{ v: 0, l: '无' }, { v: 3, l: '有' }] },
    { key: 'symptoms', label: '胃肠道症状', options: [{ v: 0, l: '无' }, { v: 2, l: '轻微' }, { v: 4, l: '明显' }] },
    { key: 'history', label: '既往史', options: [{ v: 0, l: '无' }, { v: 2, l: '胃炎' }, { v: 4, l: '溃疡' }] },
    { key: 'region', label: '地区风险', options: [{ v: 0, l: '低风险' }, { v: 2, l: '中风险' }, { v: 4, l: '高风险' }] },
  ]

  const lesionTypes = ['早期食管癌', '早期胃癌', '早期结直肠癌', '癌前病变', '高级别上皮内瘤变']
  const locations = ['食管下段', '胃窦', '胃体', '结肠右曲', '直肠', '食管中段', '胃底', '降结肠']
  const diffLevels = ['高分化', '中分化', '低分化', '未分化']
  const treatments = ['ESD', '手术', '保守', '待定']
  const treatmentColors: Record<string, { bg: string; text: string }> = {
    'ESD': { bg: '#eff6ff', text: '#2563eb' },
    '手术': { bg: '#fef2f2', text: '#dc2626' },
    '保守': { bg: '#f8fafc', text: '#64748b' },
    '待定': { bg: '#fefce8', text: '#ca8a04' },
  }
  const followUpStatuses = ['在访', '失访', '治愈']
  const patientNames = ['李秀英', '王德明', '张建华', '刘玉兰', '陈国庆', '杨文军', '赵桂英', '黄伟东', '周丽娟', '吴洪波', '徐海峰', '孙桂芳', '马志远', '朱秀云', '胡金生', '郭彩霞', '林国强', '何春梅', '高建波', '罗素芳']
  const detections = useMemo(() => Array.from({ length: 20 }, (_, i) => {
    const year = i < 10 ? 2025 : 2026
    const month = 1 + (i % 11)
    const day = 5 + (i % 20)
    return {
      id: i + 1,
      date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      name: patientNames[i],
      lesionType: lesionTypes[i % lesionTypes.length],
      location: locations[i % locations.length],
      diffLevel: diffLevels[i % diffLevels.length],
      treatment: treatments[i % treatments.length],
      followUp: followUpStatuses[Math.floor(Math.random() * 3)],
    }
  }), [])

  const provinces = [
    { name: '山东', covered: '已覆盖', instCount: 28, screenCount: 2156, rate: 3.2 },
    { name: '河南', covered: '已覆盖', instCount: 24, screenCount: 1892, rate: 3.5 },
    { name: '内蒙古', covered: '覆盖中', instCount: 12, screenCount: 856, rate: 2.8 },
    { name: '青海', covered: '覆盖中', instCount: 8, screenCount: 524, rate: 2.4 },
    { name: '四川', covered: '已覆盖', instCount: 32, screenCount: 2432, rate: 3.8 },
    { name: '广东', covered: '已覆盖', instCount: 36, screenCount: 2654, rate: 3.1 },
    { name: '江苏', covered: '已覆盖', instCount: 30, screenCount: 2286, rate: 3.6 },
    { name: '浙江', covered: '已覆盖', instCount: 26, screenCount: 2034, rate: 3.3 },
    { name: '安徽', covered: '已覆盖', instCount: 18, screenCount: 1456, rate: 2.9 },
    { name: '福建', covered: '覆盖中', instCount: 14, screenCount: 982, rate: 2.6 },
    { name: '江西', covered: '已覆盖', instCount: 16, screenCount: 1124, rate: 2.7 },
    { name: '湖南', covered: '已覆盖', instCount: 20, screenCount: 1568, rate: 3.0 },
    { name: '湖北', covered: '已覆盖', instCount: 22, screenCount: 1682, rate: 3.4 },
    { name: '河北', covered: '已覆盖', instCount: 19, screenCount: 1342, rate: 2.8 },
    { name: '山西', covered: '覆盖中', instCount: 11, screenCount: 724, rate: 2.5 },
    { name: '陕西', covered: '已覆盖', instCount: 17, screenCount: 1286, rate: 3.1 },
    { name: '辽宁', covered: '已覆盖', instCount: 21, screenCount: 1534, rate: 2.9 },
    { name: '吉林', covered: '未覆盖', instCount: 0, screenCount: 0, rate: 0 },
  ]

  const screenStatuses = ['待审核', '已登记', '筛查中', '已完成']
  const screenTypes = ['一般筛查', '高危筛查', '术后复查']
  const screenings = useMemo(() => Array.from({ length: 60 }, (_, i) => {
    const status = screenStatuses[Math.floor(Math.random() * 4)]
    const year = i < 30 ? 2025 : 2026
    const month = 1 + (i % 11)
    const day = 5 + (i % 20)
    return {
      id: i + 1,
      date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      name: ['王秀兰', '李建国', '张桂英', '刘志明', '陈丽娟', '杨文华', '赵德福', '黄秀云', '周小刚', '吴翠花', '徐志远', '孙丽芳', '马金龙', '朱秀英', '胡金生', '郭彩霞', '林国强', '何春梅', '高建波', '罗素芳', '郑成文', '梁晓燕', '宋立功', '唐桂英', '许志鹏', '韩素芳', '邓小刚', '冯翠花', '曹德华', '彭丽华', '田秀英', '董建军', '蒋桂花', '熊国强', '韩秀英', '龚志鹏', '万翠花', '韦小刚', '郎丽芳', '戚秀英', '焦建军', '甄桂花', '令狐国强', '端木秀英', '上官志鹏', '欧阳翠花', '司马小刚', '公孙丽芳', '赫连秀英', '呼延建军', '闾丘桂花', '公冶国强', '子车秀英', '颛孙志鹏', '端星翠花', '谷梁小刚', '百里丽芳', '东郭秀英', '南门建军'][i % 60],
      age: 30 + Math.floor(Math.random() * 45),
      gender: i % 2 === 0 ? '男' : '女',
      phone: `138${String(1000 + i).padStart(4, '0')}${String(100 + (i * 7) % 900).padStart(3, '0')}`,
      type: screenTypes[i % 3],
      result: status === '已完成' ? (Math.random() > 0.7 ? '阳性' : '阴性') : '-',
      status,
      institution: ['山东省立医院', '河南省人民医院', '内蒙古医学院附院', '青海大学附院', '华西医院', '广东省人民医院', '南京鼓楼医院', '浙大一院', '安医大一附院', '福建协和医院', '南昌大一附院', '湘雅医院', '武汉同济医院', '河北医大一院', '山西大医院', '西京医院', '中国医大一院', '长春吉大一院'][i % 18],
    }
  }), [])

  const followUpModes = ['电话随访', '门诊随访', '住院随访', '在线随访']
  const followUpResults = ['稳定', '好转', '恶化', '失访']
  const followUps = useMemo(() => Array.from({ length: 40 }, (_, i) => {
    const year = i < 20 ? 2025 : 2026
    const month = 1 + (i % 11)
    const day = 8 + (i % 18)
    const result = followUpResults[Math.floor(Math.random() * 4)]
    return {
      id: i + 1,
      date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      nextDate: `${year + (month > 10 ? 1 : 0)}-${String((month + 2) % 12 || 12).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      patientName: ['李秀英', '王德明', '张建华', '刘玉兰', '陈国庆', '杨文军', '赵桂英', '黄伟东', '周丽娟', '吴洪波', '徐海峰', '孙桂芳', '马志远', '朱秀云', '胡金生', '郭彩霞', '林国强', '何春梅', '高建波', '罗素芳'][i % 20],
      phone: `139${String(2000 + i).padStart(4, '0')}${String(200 + (i * 11) % 800).padStart(3, '0')}`,
      mode: followUpModes[i % 4],
      result,
      notes: result === '失访' ? '多次联系未果' : (result === '稳定' ? '各项指标正常' : result === '好转' ? '病灶明显缩小' : '病情进展需密切观察'),
      doctor: `王${['敏', '娜', '霞', '琳', '燕', '芳', '娟', '玲', '婷', '颖'][i % 10]}医生`,
    }
  }), [])

  const monthlyData = [
    { month: '2025-01', screenings: 820, detections: 28, rate: 3.4 },
    { month: '2025-02', screenings: 756, detections: 24, rate: 3.2 },
    { month: '2025-03', screenings: 920, detections: 32, rate: 3.5 },
    { month: '2025-04', screenings: 886, detections: 30, rate: 3.4 },
    { month: '2025-05', screenings: 1050, detections: 38, rate: 3.6 },
    { month: '2025-06', screenings: 1120, detections: 42, rate: 3.8 },
    { month: '2025-07', screenings: 980, detections: 35, rate: 3.6 },
    { month: '2025-08', screenings: 1080, detections: 40, rate: 3.7 },
    { month: '2025-09', screenings: 1200, detections: 45, rate: 3.8 },
    { month: '2025-10', screenings: 1150, detections: 42, rate: 3.7 },
    { month: '2025-11', screenings: 1280, detections: 48, rate: 3.8 },
    { month: '2025-12', screenings: 1350, detections: 52, rate: 3.9 },
    { month: '2026-01', screenings: 1100, detections: 40, rate: 3.6 },
    { month: '2026-02', screenings: 980, detections: 35, rate: 3.6 },
    { month: '2026-03', screenings: 1250, detections: 46, rate: 3.7 },
  ]

  const ageDistribution = [
    { range: '30-40', male: 420, female: 380 },
    { range: '41-50', male: 680, female: 620 },
    { range: '51-60', male: 920, female: 840 },
    { range: '61-70', male: 760, female: 680 },
    { range: '71-80', male: 380, female: 320 },
    { range: '>80', male: 120, female: 100 },
  ]

  const cancerTypes = [
    { type: '早期食管癌', count: 156, proportion: 28.5 },
    { type: '早期胃癌', count: 198, proportion: 36.2 },
    { type: '早期结直肠癌', count: 124, proportion: 22.6 },
    { type: '癌前病变', count: 48, proportion: 8.8 },
    { type: '高级别上皮内瘤变', count: 21, proportion: 3.8 },
  ]

  const treatmentOutcome = [
    { treatment: 'ESD', total: 320, cured: 296, improved: 18, stable: 6 },
    { treatment: '手术', total: 156, cured: 128, improved: 20, stable: 8 },
    { treatment: '保守治疗', total: 86, cured: 52, improved: 24, stable: 10 },
  ]

  const coveredColors: Record<string, string> = { '已覆盖': '#16a34a', '覆盖中': '#ca8a04', '未覆盖': '#e2e8f0' }
  const followUpColors: Record<string, { bg: string; text: string }> = {
    '在访': { bg: '#f0fdf4', text: '#16a34a' },
    '失访': { bg: '#fef2f2', text: '#dc2626' },
    '治愈': { bg: '#eff6ff', text: '#2563eb' },
  }

  const calcRisk = (score: number) => {
    if (score < 15) return '低危'
    if (score < 25) return '中危'
    if (score < 35) return '高危'
    return '极高危'
  }

  const handleDimChange = (key: string, val: number) => {
    const newForm = { ...assessmentForm, [key]: val }
    setAssessmentForm(newForm as typeof assessmentForm)
    const score = Object.entries(newForm).reduce((acc, [k, v]) => {
      const dim = assessmentDimensions.find(d => d.key === k)
      if (!dim) return acc
      const opt = dim.options.find(o => o.l === v)
      return acc + (opt?.v || 0)
    }, 0)
    setCurrentScore(score)
    setCurrentRisk(calcRisk(score))
  }

  const filteredTasks = tasks.filter(t =>
    t.name.includes(taskSearch) || t.region.includes(taskSearch)
  )

  return (
    <div style={s.root}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>消化道早癌筛查平台</h1>
          <p style={s.subtitle}> Gastrointestinal Early Cancer Screening Platform · 数据更新于 2024-08-15</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={s.btn}><RefreshCw size={14} /> 同步数据</button>
          <button style={s.btn}><Download size={14} /> 导出报告</button>
        </div>
      </div>

      {/* 6大指标卡片 */}
      <div style={s.statsRow}>
        {statsData.map((stat, i) => <StatCard key={i} {...stat} />)}
      </div>

      {/* 功能区Tab导航 */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#f1f5f9', padding: 4, borderRadius: 10 }}>
        {[
          { label: '筛查任务管理', icon: Target },
          { label: '高危评估', icon: AlertTriangle },
          { label: '早癌检出追踪', icon: Microscope },
          { label: '筛查数据地图', icon: MapPin },
        ].map((t, i) => (
          <button
            key={i}
            onClick={() => setTab(i + 1)}
            style={{
              flex: 1, padding: '10px 16px', borderRadius: 8, border: 'none',
              background: tab === i + 1 ? '#fff' : 'transparent',
              color: tab === i + 1 ? '#2563eb' : '#64748b',
              fontWeight: tab === i + 1 ? 700 : 500, cursor: 'pointer',
              fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              boxShadow: tab === i + 1 ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            <t.icon size={15} />{t.label}
          </button>
        ))}
      </div>

      {/* ========== 功能区1: 筛查任务管理 ========== */}
      {tab === 1 && (
        <div style={s.section}>
          <div style={s.sectionTitle}><Target size={16} color='#dc2626' />筛查任务管理</div>
          <div style={s.taskToolbar}>
            <input
              style={s.searchInput}
              placeholder='搜索任务名称或地区...'
              value={taskSearch}
              onChange={e => setTaskSearch(e.target.value)}
            />
            <button style={{ ...s.btn, minHeight: 44, padding: '8px 16px', fontSize: 14 }}><Filter size={16} />筛选条件</button>
            <button style={{ ...s.btnPrimary, minHeight: 44, padding: '8px 20px', fontSize: 14 }}><Plus size={16} />新建筛查任务</button>
          </div>
          <div style={s.scrollBox}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>任务名称</th>
                  <th style={s.th}>地区</th>
                  <th style={s.th}>目标人数</th>
                  <th style={s.th}>完成人数</th>
                  <th style={s.th}>完成率</th>
                  <th style={s.th}>状态</th>
                  <th style={s.th}>操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={s.emptyState}>
                      <FileSearch size={48} style={s.emptyStateIcon} />
                      <div style={s.emptyStateText}>未找到匹配的任务记录</div>
                      <div style={s.emptyStateHint}>请尝试调整搜索关键词或筛选条件</div>
                    </td>
                  </tr>
                ) : filteredTasks.slice(0, 15).map(task => (
                  <tr key={task.id}>
                    <td style={s.td}>{task.name}</td>
                    <td style={s.td}>{task.region}</td>
                    <td style={s.td}>{task.target}</td>
                    <td style={s.td}>{task.completed}</td>
                    <td style={s.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 60, height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${task.rate}%`, height: '100%', background: task.rate >= 100 ? '#16a34a' : task.rate >= 50 ? '#2563eb' : '#ca8a04', borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 11, color: '#64748b' }}>{task.rate}%</span>
                      </div>
                    </td>
                    <td style={s.td}><StatusBadge status={task.status} /></td>
                    <td style={s.td}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button style={{ ...s.btn, padding: '4px 8px', fontSize: 11 }}><Eye size={12} /></button>
                        <button style={{ ...s.btn, padding: '4px 8px', fontSize: 11 }}><Edit size={12} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 12, fontSize: 12, color: '#94a3b8', textAlign: 'right' }}>
            显示 1-15 条，共 {filteredTasks.length} 条任务
          </div>
        </div>
      )}

      {/* ========== 功能区2: 高危评估 ========== */}
      {tab === 2 && (
        <div style={s.section}>
          <div style={s.sectionTitle}><AlertTriangle size={16} color='#ea580c' />高危评估</div>
          <div style={s.assessGrid}>
            {/* 左: 评估表单 */}
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 12 }}>当前评估</div>
              <div style={s.assessForm}>
                {assessmentDimensions.map(dim => (
                  <div key={dim.key} style={s.formItem}>
                    <div style={s.formLabel}>{dim.label}</div>
                    <select
                      style={s.formSelect}
                      value={assessmentForm[dim.key as keyof typeof assessmentForm]}
                      onChange={e => handleDimChange(dim.key, dim.options.findIndex(o => o.l === e.target.value))}
                    >
                      {dim.options.map(opt => (
                        <option key={opt.l} value={opt.l}>{opt.l}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 16, padding: '12px 16px', background: riskBgColors[currentRisk], borderRadius: 10, textAlign: 'center', border: `2px solid ${riskColors[currentRisk]}` }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: riskColors[currentRisk] }}>评估结果</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: riskColors[currentRisk], lineHeight: 1.2, marginTop: 4 }}>{currentRisk}</div>
                <div style={{ fontSize: 12, color: riskColors[currentRisk], opacity: 0.8, marginTop: 4 }}>风险评分: {currentScore} 分</div>
              </div>
              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                <button style={{ ...s.btnPrimary, minHeight: 44, padding: '10px 20px', fontSize: 14 }}><CheckCircle size={16} />提交评估</button>
                <button style={{ ...s.btn, minHeight: 44, padding: '10px 20px', fontSize: 14 }} onClick={() => { setCurrentScore(0); setCurrentRisk('低危'); setAssessmentForm({ age: 45, gender: '男', diet: '一般', hp: '无', family: '无', symptoms: '无', history: '无', region: '低风险' }) }}>重置评估</button>
              </div>
            </div>
            {/* 右: 历史评估记录 */}
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 12 }}>历史评估 ({assessments.length}条)</div>
              <div style={s.scrollBox}>
                {assessments.length === 0 ? (
                  <div style={s.emptyState}>
                    <ClipboardList size={44} style={s.emptyStateIcon} />
                    <div style={s.emptyStateText}>暂无评估记录</div>
                    <div style={s.emptyStateHint}>完成高危评估后将显示历史记录</div>
                  </div>
                ) : assessments.map(a => (
                  <div key={a.id} style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>{a.name} <span style={{ fontSize: 11, color: '#94a3b8' }}>({a.age}岁)</span></div>
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{a.date} · {a.doctor}</div>
                    </div>
                    <span style={{ ...s.tag, background: riskBgColors[a.risk], color: riskColors[a.risk] }}>{a.risk} ({a.totalScore}分)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== 功能区3: 早癌检出追踪 ========== */}
      {tab === 3 && (
        <div style={s.section}>
          <div style={s.sectionTitle}><Microscope size={16} color='#dc2626' />早癌检出追踪</div>
          {detections.length === 0 ? (
            <div style={s.emptyState}>
              <Inbox size={48} style={s.emptyStateIcon} />
              <div style={s.emptyStateText}>暂无早癌检出记录</div>
              <div style={s.emptyStateHint}>完成筛查任务后发现早癌将自动显示在此</div>
            </div>
          ) : (
          <div style={{ overflowX: 'auto' }}>
            <div style={s.detectionGrid}>
              <div style={s.detectionHeader}>
                <div style={{ display: 'grid', gridTemplateColumns: '100px 80px 80px 120px 80px 80px 80px 80px', gap: 8 }}>
                  <div>日期</div><div>姓名</div><div>年龄</div><div>病变类型</div><div>部位</div><div>分化</div><div>治疗</div><div>随访</div>
                </div>
              </div>
              {detections.map(d => (
                <div key={d.id} style={s.detectionRow}>
                  <div style={{ display: 'grid', gridTemplateColumns: '100px 80px 80px 120px 80px 80px 80px 80px', gap: 8, alignItems: 'center' }}>
                    <div style={{ fontSize: 12 }}>{d.date}</div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{d.name}</div>
                    <div style={{ fontSize: 12 }}>{d.age || '-'}</div>
                    <div style={{ fontSize: 12, color: '#dc2626', fontWeight: 600 }}>{d.lesionType}</div>
                    <div style={{ fontSize: 12 }}>{d.location}</div>
                    <div style={{ fontSize: 12 }}>{d.diffLevel}</div>
                    <div><span style={{ ...s.tag, background: treatmentColors[d.treatment]?.bg, color: treatmentColors[d.treatment]?.text }}>{d.treatment}</span></div>
                    <div><span style={{ ...s.tag, background: followUpColors[d.followUp]?.bg, color: followUpColors[d.followUp]?.text }}>{d.followUp}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          )}
        </div>
      )}

      {/* ========== 功能区4: 筛查数据地图 ========== */}
      {tab === 4 && (
        <div style={s.section}>
          <div style={s.sectionTitle}><MapPin size={16} color='#7c3aed' />筛查数据地图</div>
          <div style={s.mapGrid}>
            {/* 省份列表 */}
            <div style={s.mapSvg}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 12 }}>各省份覆盖情况</div>
              <div style={{ overflowY: 'auto', maxHeight: 400 }}>
                <table style={s.provinceTable}>
                  <thead>
                    <tr>
                      <th style={s.provinceTh}>省份</th>
                      <th style={s.provinceTh}>覆盖状态</th>
                      <th style={s.provinceTh}>机构数</th>
                      <th style={s.provinceTh}>累计筛查</th>
                      <th style={s.provinceTh}>检出率</th>
                    </tr>
                  </thead>
                  <tbody>
                    {provinces.map(p => (
                      <tr key={p.name}>
                        <td style={s.provinceTd}>{p.name}</td>
                        <td style={s.provinceTd}>
                          <span style={{ ...s.tag, background: coveredColors[p.covered] + '22', color: coveredColors[p.covered] }}>{p.covered}</span>
                        </td>
                        <td style={s.provinceTd}>{p.instCount}家</td>
                        <td style={s.provinceTd}>{p.screenCount.toLocaleString()}人</td>
                        <td style={s.provinceTd}>{p.rate > 0 ? `${p.rate}%` : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: 12, display: 'flex', gap: 16, fontSize: 12, color: '#64748b' }}>
                <span>机构总数: <strong>354家</strong></span>
                <span>累计筛查: <strong>28,756人</strong></span>
                <span>整体检出率: <strong>3.27%</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CancerScreenPage
