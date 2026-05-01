// @ts-nocheck
// ============================================================
// G004 内镜管理系统 - 会诊管理页面
// KPI概览 / 4Tab切换 / MDT管理 / 30条演示数据
// ============================================================
import { useState } from 'react'
import {
  Users, FileText, Clock, CheckCircle, AlertCircle,
  Microscope, Calendar, User, Search, Filter,
  ChevronRight, Bell, Plus, RefreshCw, Video,
  Stethoscope, Heart, Activity, Brain, Bone
} from 'lucide-react'

// ---------- 样式 ----------
const s: Record<string, React.CSSProperties> = {
  root: { padding: 0 },
  header: {
    marginBottom: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 20, fontWeight: 700, color: '#1a3a5c', margin: 0,
  },
  subtitle: {
    fontSize: 13, color: '#64748b', marginTop: 4,
  },
  refreshBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 14px',
    borderRadius: 8,
    border: '1px solid #e2e8f0',
    background: '#fff',
    cursor: 'pointer',
    fontSize: 12,
    color: '#64748b',
  },
  // KPI Cards
  kpiRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: 16,
    marginBottom: 24,
  },
  kpiCard: {
    background: '#fff',
    borderRadius: 12,
    padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    position: 'relative',
    overflow: 'hidden',
  },
  kpiValue: {
    fontSize: 32,
    fontWeight: 800,
    color: '#1a3a5c',
    lineHeight: 1.1,
  },
  kpiLabel: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 6,
  },
  kpiTrend: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 12,
    marginTop: 8,
    fontWeight: 600,
  },
  kpiIcon: {
    position: 'absolute',
    right: 16,
    top: 16,
    opacity: 0.12,
  },
  // Tabs
  tabContainer: {
    display: 'flex',
    gap: 4,
    marginBottom: 20,
    background: '#f8fafc',
    padding: 4,
    borderRadius: 10,
  },
  tab: {
    flex: 1,
    padding: '10px 16px',
    borderRadius: 8,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 500,
    color: '#64748b',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  tabActive: {
    background: '#fff',
    color: '#1a3a5c',
    fontWeight: 600,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  tabBadge: {
    fontSize: 11,
    fontWeight: 700,
    padding: '2px 6px',
    borderRadius: 10,
    minWidth: 20,
    textAlign: 'center',
  },
  // Table
  tableCard: {
    background: '#fff',
    borderRadius: 12,
    padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  tableHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  tableTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: '#1a3a5c',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 14px',
    borderRadius: 8,
    border: '1px solid #e2e8f0',
    background: '#f8fafc',
    fontSize: 13,
    minWidth: 260,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 13,
  },
  th: {
    textAlign: 'left',
    padding: '12px 8px',
    borderBottom: '2px solid #e2e8f0',
    color: '#64748b',
    fontWeight: 600,
    fontSize: 12,
    whiteSpace: 'nowrap' as const,
  },
  td: {
    padding: '12px 8px',
    borderBottom: '1px solid #f1f5f9',
    color: '#475569',
    verticalAlign: 'middle',
  },
  tr: {
    transition: 'background 0.15s',
  },
  // Status badges
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '3px 10px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
  },
  badgeBlue: { background: '#eff6ff', color: '#2563eb' },
  badgeGreen: { background: '#f0fdf4', color: '#16a34a' },
  badgeOrange: { background: '#fff7ed', color: '#ea580c' },
  badgeRed: { background: '#fef2f2', color: '#dc2626' },
  badgePurple: { background: '#f5f3ff', color: '#7c3aed' },
  badgeGray: { background: '#f1f5f9', color: '#64748b' },
  // Priority
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    display: 'inline-block',
    marginRight: 6,
  },
  // MDT Section
  mdtGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 16,
    marginBottom: 24,
  },
  mdtCard: {
    background: '#fff',
    borderRadius: 12,
    padding: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    borderLeft: '4px solid',
  },
  mdtHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  mdtTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: '#1a3a5c',
  },
  mdtInfo: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  mdtMembers: {
    display: 'flex',
    alignItems: 'center',
    gap: -8,
    marginTop: 12,
  },
  mdtAvatar: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    border: '2px solid #fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    fontWeight: 700,
    color: '#fff',
    marginLeft: -8,
  },
  mdtAvatarFirst: { marginLeft: 0 },
  // Action buttons
  actionBtn: {
    padding: '6px 12px',
    borderRadius: 6,
    border: '1px solid #e2e8f0',
    background: '#fff',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 500,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    color: '#475569',
  },
  actionBtnPrimary: {
    background: '#2563eb',
    color: '#fff',
    border: 'none',
  },
  // Description text
  descText: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 1.5,
    maxWidth: 200,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  // Colors
  blue: { color: '#2563eb', bg: '#eff6ff' },
  green: { color: '#16a34a', bg: '#f0fdf4' },
  orange: { color: '#ea580c', bg: '#fff7ed' },
  red: { color: '#dc2626', bg: '#fef2f2' },
  purple: { color: '#7c3aed', bg: '#f5f3ff' },
  teal: { color: '#0d9488', bg: '#f0fdfa' },
  // 空状态
  emptyState: {
    textAlign: 'center',
    padding: '48px 20px',
    color: '#94a3b8',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
  },
  emptyStateIcon: { opacity: 0.35 },
  emptyStateText: { fontSize: 14, color: '#64748b', fontWeight: 500 },
  emptyStateHint: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
}

// ---------- 30条演示数据 ----------
const CONSULTATION_DATA = [
  {
    id: 'C202604001',
    patient: '王建国',
    age: 62,
    gender: '男',
    type: '胃镜',
    consultType: '疑难病理会诊',
    doctor: '张明远',
    dept: '消化内科',
    hospital: '上海市第一人民医院',
    status: 'pending',
    priority: 'urgent',
    date: '2026-04-30',
    description: '胃窦部溃疡型病变，镜下见黏膜结构破坏，腺体排列紊乱，细胞异型性明显，可见异常核分裂象',
    slides: 8,
    mdtTeam: '胃癌MDT',
  },
  {
    id: 'C202604002',
    patient: '李秀英',
    age: 55,
    gender: '女',
    type: '肠镜',
    consultType: '早期癌筛查',
    doctor: '陈晓东',
    dept: '肿瘤内科',
    hospital: '复旦大学附属肿瘤医院',
    status: 'completed',
    priority: 'normal',
    date: '2026-04-29',
    description: '横结肠见一枚直径约1.2cm山田Ⅱ型息肉，表面分叶状，NBI观察腺管开口pattern为type ⅤN',
    slides: 5,
    mdtTeam: '结直肠癌MDT',
  },
  {
    id: 'C202604003',
    patient: '张伟',
    age: 45,
    gender: '男',
    type: '超声内镜',
    consultType: '胰腺占位定性',
    doctor: '孙丽华',
    dept: '胰腺外科',
    hospital: '北京协和医院',
    status: 'processing',
    priority: 'urgent',
    date: '2026-04-30',
    description: '胰头部见低回声占位，大小约2.8×2.3cm，边界不清，内部回声不均匀，可见点状强回声',
    slides: 12,
    mdtTeam: '胰腺疾病MDT',
  },
  {
    id: 'C202604004',
    patient: '赵红梅',
    age: 38,
    gender: '女',
    type: '胃镜',
    consultType: 'Barrett食管评估',
    doctor: '刘志刚',
    dept: '消化内科',
    hospital: '中山大学附属第一医院',
    status: 'pending',
    priority: 'normal',
    date: '2026-04-28',
    description: '食管下段可见橘红色柱状上皮替代鳞状上皮，延伸约3cm，NBI下见栅栏样血管消失',
    slides: 6,
    mdtTeam: '食管癌MDT',
  },
  {
    id: 'C202604005',
    patient: '周建军',
    age: 68,
    gender: '男',
    type: 'ERCP',
    consultType: '胆管狭窄鉴别',
    doctor: '吴亚军',
    dept: '肝胆外科',
    hospital: '东方肝胆医院',
    status: 'completed',
    priority: 'urgent',
    date: '2026-04-27',
    description: '肝门部胆管狭窄，长约1.5cm，狭窄段管壁僵硬，黏膜表面粗糙，可见不规则隆起',
    slides: 9,
    mdtTeam: '胆道肿瘤MDT',
  },
  {
    id: 'C202604006',
    patient: '郑大海',
    age: 52,
    gender: '男',
    type: '肠镜',
    consultType: 'IBD病理评估',
    doctor: '王小丽',
    dept: '消化内科',
    hospital: '浙江大学医学院附属第一医院',
    status: 'processing',
    priority: 'normal',
    date: '2026-04-29',
    description: '回盲部黏膜弥漫性充血水肿，隐窝脓肿形成，杯状细胞减少，基底浆细胞浸润，符合溃疡性结肠炎',
    slides: 7,
    mdtTeam: '炎症性肠病MDT',
  },
  {
    id: 'C202604007',
    patient: '孙桂芳',
    age: 71,
    gender: '女',
    type: '胃镜',
    consultType: '残胃癌诊断',
    doctor: '张明远',
    dept: '胃肠外科',
    hospital: '上海市第一人民医院',
    status: 'pending',
    priority: 'urgent',
    date: '2026-04-30',
    description: '胃次全切除术后残胃小弯侧见溃疡型肿物，质脆易出血，边缘呈堤状隆起，取材6块',
    slides: 6,
    mdtTeam: '胃癌MDT',
  },
  {
    id: 'C202604008',
    patient: '马晓东',
    age: 48,
    gender: '男',
    type: '超声内镜',
    consultType: '胃肠道间质瘤评估',
    doctor: '李志伟',
    dept: '肿瘤内科',
    hospital: '南京鼓楼医院',
    status: 'completed',
    priority: 'normal',
    date: '2026-04-26',
    description: '胃体前壁见直径1.8cm低回声肿块，源于黏膜下层，边界清晰，内部回声均匀，可见点状钙化',
    slides: 8,
    mdtTeam: '胃肠道间质瘤MDT',
  },
  {
    id: 'C202604009',
    patient: '刘淑芬',
    age: 43,
    gender: '女',
    type: '肠镜',
    consultType: '家族性息肉病评估',
    doctor: '陈晓东',
    dept: '遗传咨询科',
    hospital: '复旦大学附属中山医院',
    status: 'processing',
    priority: 'urgent',
    date: '2026-04-29',
    description: '全结肠可见数百枚大小不等息肉，部分已发生不典型增生，Ki-67增殖指数局部升高',
    slides: 15,
    mdtTeam: '结直肠癌MDT',
  },
  {
    id: 'C202604010',
    patient: '黄文博',
    age: 59,
    gender: '男',
    type: '胃镜',
    consultType: '早期胃癌ESD评估',
    doctor: '张明远',
    dept: '消化内科',
    hospital: '上海市第一人民医院',
    status: 'completed',
    priority: 'normal',
    date: '2026-04-25',
    description: '胃角小弯侧见直径约1.5cm浅表凹陷型病变，表面黏膜粗糙，NBI下见不规则微血管结构',
    slides: 7,
    mdtTeam: '胃癌MDT',
  },
  {
    id: 'C202604011',
    patient: '吴月娥',
    age: 66,
    gender: '女',
    type: 'ERCP',
    consultType: '胰腺癌分期',
    doctor: '孙丽华',
    dept: '胰腺外科',
    hospital: '北京301医院',
    status: 'pending',
    priority: 'urgent',
    date: '2026-04-30',
    description: '胰体尾部见分叶状肿块，大小约4.2×3.5cm，侵犯脾静脉，腹腔干旁见多枚肿大淋巴结',
    slides: 10,
    mdtTeam: '胰腺疾病MDT',
  },
  {
    id: 'C202604012',
    patient: '徐志强',
    age: 35,
    gender: '男',
    type: '胶囊内镜',
    consultType: '小肠出血定位',
    doctor: '王秀英',
    dept: '消化内科',
    hospital: '华中科技大学同济医院',
    status: 'processing',
    priority: 'normal',
    date: '2026-04-28',
    description: '小肠中段见活动性出血灶，可见暗红色血痂，周围黏膜轻度水肿，未见明显肿物',
    slides: 4,
    mdtTeam: '小肠疾病MDT',
  },
  {
    id: 'C202604013',
    patient: '高建平',
    age: 74,
    gender: '男',
    type: '肠镜',
    consultType: '直肠神经内分泌瘤评估',
    doctor: '陈晓东',
    dept: '肿瘤外科',
    hospital: '天津医科大学肿瘤医院',
    status: 'completed',
    priority: 'normal',
    date: '2026-04-24',
    description: '直肠距肛缘6cm见直径0.8cm半球形隆起，表面黏膜光滑，NBI下见淡黄色区，符合NET G1',
    slides: 5,
    mdtTeam: '神经内分泌肿瘤MDT',
  },
  {
    id: 'C202604014',
    patient: '韩梅',
    age: 50,
    gender: '女',
    type: '胃镜',
    consultType: '胃泌素瘤定性',
    doctor: '刘志刚',
    dept: '内分泌科',
    hospital: '四川大学华西医院',
    status: 'pending',
    priority: 'normal',
    date: '2026-04-27',
    description: '胃底可见多个直径2-4mm透亮小疱疹，胃体黏膜粗大肥厚，胃液分泌量显著增多',
    slides: 6,
    mdtTeam: '胃肠道神经内分泌肿瘤MDT',
  },
  {
    id: 'C202604015',
    patient: '曹德旺',
    age: 63,
    gender: '男',
    type: '超声内镜',
    consultType: '纵隔淋巴结定性',
    doctor: '吴亚军',
    dept: '胸外科',
    hospital: '广州医科大学附属第一医院',
    status: 'processing',
    priority: 'urgent',
    date: '2026-04-29',
    description: '隆突下见数枚增大淋巴结，最大约2.1×1.5cm，内部回声不均，可见液化区，细胞学穿刺见异型细胞',
    slides: 11,
    mdtTeam: '胸部肿瘤MDT',
  },
  {
    id: 'C202604016',
    patient: '田秀兰',
    age: 41,
    gender: '女',
    type: '肠镜',
    consultType: '克罗恩病评估',
    doctor: '王小丽',
    dept: '消化内科',
    hospital: '武汉大学中南医院',
    status: 'pending',
    priority: 'normal',
    date: '2026-04-26',
    description: '回肠末端见节段性纵行溃疡，肠腔狭窄，黏膜呈鹅卵石样改变，周围淋巴结肿大',
    slides: 8,
    mdtTeam: '炎症性肠病MDT',
  },
  {
    id: 'C202604017',
    patient: '林国栋',
    age: 57,
    gender: '男',
    type: '胃镜',
    consultType: '食管早癌筛查',
    doctor: '张明远',
    dept: '消化内科',
    hospital: '上海市第一人民医院',
    status: 'completed',
    priority: 'normal',
    date: '2026-04-23',
    description: '食管中段见直径约0.6cm浅表平坦型病变，碘染不着色，NBI下见IPCL type B1扩张弯曲',
    slides: 5,
    mdtTeam: '食管癌MDT',
  },
  {
    id: 'C202604018',
    patient: '何小燕',
    age: 33,
    gender: '女',
    type: '胶囊内镜',
    consultType: '小肠克罗恩评估',
    doctor: '王秀英',
    dept: '消化内科',
    hospital: '中山大学附属第六医院',
    status: 'processing',
    priority: 'normal',
    date: '2026-04-28',
    description: '小肠可见多处节段性黏膜溃疡，部分呈纵行分布，肠壁增厚，肠腔轻度狭窄，符合克罗恩病',
    slides: 9,
    mdtTeam: '炎症性肠病MDT',
  },
  {
    id: 'C202604019',
    patient: '彭伟',
    age: 61,
    gender: '男',
    type: 'ERCP',
    consultType: '壶腹癌分期',
    doctor: '孙丽华',
    dept: '肝胆外科',
    hospital: '东方肝胆医院',
    status: 'completed',
    priority: 'urgent',
    date: '2026-04-22',
    description: '十二指肠壶腹部见菜花样肿物，约2.0×1.8cm，表面溃烂，质脆易出血，累及胆管下端',
    slides: 8,
    mdtTeam: '胆道肿瘤MDT',
  },
  {
    id: 'C202604020',
    patient: '曾淑珍',
    age: 58,
    gender: '女',
    type: '胃镜',
    consultType: '胃淋巴瘤评估',
    doctor: '刘志刚',
    dept: '血液内科',
    hospital: '北京大学肿瘤医院',
    status: 'pending',
    priority: 'normal',
    date: '2026-04-25',
    description: '胃体胃底见弥漫性黏膜粗大肥厚，表面有多发糜烂及浅溃疡，活检见淋巴细胞浸润',
    slides: 7,
    mdtTeam: '胃肠道淋巴瘤MDT',
  },
  {
    id: 'C202604021',
    patient: '梁振华',
    age: 47,
    gender: '男',
    type: '肠镜',
    consultType: '侧向发育型肿瘤评估',
    doctor: '陈晓东',
    dept: '消化内科',
    hospital: '复旦大学附属中山医院',
    status: 'processing',
    priority: 'urgent',
    date: '2026-04-29',
    description: '直肠见约5×4cm侧向发育型息肉，LST-NG类型，表面呈结节状，pit pattern为type ⅤN',
    slides: 12,
    mdtTeam: '结直肠癌MDT',
  },
  {
    id: 'C202604022',
    patient: '唐婉清',
    age: 39,
    gender: '女',
    type: '胃镜',
    consultType: '嗜酸细胞性胃炎',
    doctor: '李志伟',
    dept: '过敏反应科',
    hospital: '上海仁济医院',
    status: 'completed',
    priority: 'normal',
    date: '2026-04-21',
    description: '胃窦黏膜可见散在丘疹样隆起，质硬，表面光滑，周围嗜酸性粒细胞浸润>20/HPF',
    slides: 4,
    mdtTeam: '过敏性疾病MDT',
  },
  {
    id: 'C202604023',
    patient: '蒋新民',
    age: 70,
    gender: '男',
    type: '超声内镜',
    consultType: '胰腺囊性病变定性',
    doctor: '孙丽华',
    dept: '胰腺外科',
    hospital: '北京协和医院',
    status: 'processing',
    priority: 'normal',
    date: '2026-04-28',
    description: '胰体部见囊性占位，大小2.5×2.0cm，壁薄光滑，内见分隔，囊液CEA显著升高',
    slides: 8,
    mdtTeam: '胰腺疾病MDT',
  },
  {
    id: 'C202604024',
    patient: '谭桂英',
    age: 54,
    gender: '女',
    type: '肠镜',
    consultType: '锯齿状病变评估',
    doctor: '陈晓东',
    dept: '消化内科',
    hospital: '浙江大学医学院附属第一医院',
    status: 'pending',
    priority: 'normal',
    date: '2026-04-24',
    description: '盲肠见一枚直径1.0cm sessile息肉，表面呈绒毛状，镜下见扩张扭曲的隐窝，符合SSA/P',
    slides: 5,
    mdtTeam: '结直肠癌MDT',
  },
  {
    id: 'C202604025',
    patient: '江海涛',
    age: 56,
    gender: '男',
    type: '胃镜',
    consultType: '胃ca不全梗阻评估',
    doctor: '张明远',
    dept: '胃肠外科',
    hospital: '上海市第一人民医院',
    status: 'completed',
    priority: 'urgent',
    date: '2026-04-20',
    description: '胃窦癌伴幽门狭窄，内镜无法通过，CT示胃壁增厚，浆膜面模糊，周围淋巴结转移',
    slides: 10,
    mdtTeam: '胃癌MDT',
  },
  {
    id: 'C202604026',
    patient: '万雪梅',
    age: 44,
    gender: '女',
    type: '小肠镜',
    consultType: '小肠血管瘤评估',
    doctor: '王秀英',
    dept: '消化内科',
    hospital: '南京鼓楼医院',
    status: 'processing',
    priority: 'normal',
    date: '2026-04-27',
    description: '空肠上段见约1.2cm蓝色静脉扩张团块，表面黏膜完整，轻触易出血',
    slides: 6,
    mdtTeam: '小肠疾病MDT',
  },
  {
    id: 'C202604027',
    patient: '方志强',
    age: 65,
    gender: '男',
    type: 'ERCP',
    consultType: '胆管癌分期',
    doctor: '吴亚军',
    dept: '肝胆外科',
    hospital: '华中科技大学同济医院',
    status: 'pending',
    priority: 'urgent',
    date: '2026-04-30',
    description: '肝门部胆管壁不规则增厚，狭窄段长约2cm，上游胆管明显扩张，可见软组织肿块影',
    slides: 9,
    mdtTeam: '胆道肿瘤MDT',
  },
  {
    id: 'C202604028',
    patient: '余秋香',
    age: 49,
    gender: '女',
    type: '胃镜',
    consultType: '胃黏膜下肿物活检',
    doctor: '李志伟',
    dept: '消化内科',
    hospital: '四川大学华西医院',
    status: 'completed',
    priority: 'normal',
    date: '2026-04-19',
    description: '胃体后壁见直径1.5cm黏膜下隆起，表面黏膜光滑，EUS示起源于肌层，考虑平滑肌瘤',
    slides: 5,
    mdtTeam: '胃肠道间质瘤MDT',
  },
  {
    id: 'C202604029',
    patient: '贺建军',
    age: 72,
    gender: '男',
    type: '超声内镜',
    consultType: '胃癌新辅助治疗后评估',
    doctor: '张明远',
    dept: '肿瘤内科',
    hospital: '北京大学肿瘤医院',
    status: 'processing',
    priority: 'urgent',
    date: '2026-04-29',
    description: '胃体小弯侧肿块经新辅助化疗后缩小约40%，EUS示原瘤床层次模糊，PET示代谢减低',
    slides: 11,
    mdtTeam: '胃癌MDT',
  },
  {
    id: 'C202604030',
    patient: '解晓东',
    age: 51,
    gender: '男',
    type: '肠镜',
    consultType: '直肠癌保肛评估',
    doctor: '陈晓东',
    dept: '结直肠外科',
    hospital: '中山大学附属肿瘤医院',
    status: 'pending',
    priority: 'urgent',
    date: '2026-04-30',
    description: '直肠距肛缘4cm见环周性肿物，MRI示CRM阳性，T3cN+，需评估是否具备保肛手术条件',
    slides: 14,
    mdtTeam: '结直肠癌MDT',
  },
]

// ---------- MDT团队数据 ----------
const MDT_TEAMS = [
  {
    name: '胃癌MDT',
    color: '#2563eb',
    nextDate: '2026-05-02',
    nextTime: '14:00',
    location: '3号楼5层会议室',
    members: ['张明远', '李志伟', '陈晓东', '王秀英', '刘志刚'],
    pending: 5,
    icon: Stethoscope,
  },
  {
    name: '结直肠癌MDT',
    color: '#16a34a',
    nextDate: '2026-05-03',
    nextTime: '09:00',
    location: '2号楼3层MDT中心',
    members: ['陈晓东', '孙丽华', '吴亚军', '王小丽', '周建国'],
    pending: 4,
    icon: Heart,
  },
  {
    name: '胰腺疾病MDT',
    color: '#ea580c',
    nextDate: '2026-05-04',
    nextTime: '15:30',
    location: '1号楼8层会议室',
    members: ['孙丽华', '张明远', '刘志刚', '徐建平', '赵红梅'],
    pending: 3,
    icon: Brain,
  },
  {
    name: '胆道肿瘤MDT',
    color: '#7c3aed',
    nextDate: '2026-05-05',
    nextTime: '10:00',
    location: '3号楼6层会议室',
    members: ['吴亚军', '孙丽华', '陈晓东', '李志伟'],
    pending: 3,
    icon: Activity,
  },
  {
    name: '炎症性肠病MDT',
    color: '#0d9488',
    nextDate: '2026-05-06',
    nextTime: '16:00',
    location: '2号楼4层会议室',
    members: ['王小丽', '刘志刚', '王秀英', '张明远'],
    pending: 2,
    icon: Microscope,
  },
  {
    name: '食管癌MDT',
    color: '#dc2626',
    nextDate: '2026-05-07',
    nextTime: '11:00',
    location: '1号楼5层会议室',
    members: ['张明远', '陈晓东', '李志伟', '王秀英'],
    pending: 2,
    icon: Bone,
  },
]

// ---------- KPI统计 ----------
const KPI_DATA = [
  {
    label: '待处理会诊',
    value: 12,
    trend: '+3',
    icon: Clock,
    color: '#2563eb',
    bg: '#eff6ff',
  },
  {
    label: '今日完成',
    value: 8,
    trend: '+2',
    icon: CheckCircle,
    color: '#16a34a',
    bg: '#f0fdf4',
  },
  {
    label: '进行中',
    value: 5,
    trend: '-1',
    icon: Activity,
    color: '#ea580c',
    bg: '#fff7ed',
  },
  {
    label: 'MDT讨论',
    value: 6,
    trend: '+1',
    icon: Users,
    color: '#7c3aed',
    bg: '#f5f3ff',
  },
  {
    label: '本月会诊',
    value: 156,
    trend: '+12%',
    icon: FileText,
    color: '#0d9488',
    bg: '#f0fdfa',
  },
]

// ---------- 工具函数 ----------
const getStatusConfig = (status: string) => {
  switch (status) {
    case 'pending':
      return { label: '待处理', style: s.badgeOrange }
    case 'processing':
      return { label: '进行中', style: s.badgeBlue }
    case 'completed':
      return { label: '已完成', style: s.badgeGreen }
    default:
      return { label: '未知', style: s.badgeGray }
  }
}

const getPriorityConfig = (priority: string) => {
  switch (priority) {
    case 'urgent':
      return { label: '加急', dot: '#dc2626' }
    case 'normal':
      return { label: '常规', dot: '#64748b' }
    default:
      return { label: '未知', dot: '#64748b' }
  }
}

const getTypeColor = (type: string) => {
  switch (type) {
    case '胃镜': return '#2563eb'
    case '肠镜': return '#16a34a'
    case '超声内镜': return '#ea580c'
    case 'ERCP': return '#7c3aed'
    case '胶囊内镜': return '#0d9488'
    case '小肠镜': return '#0891b2'
    default: return '#64748b'
  }
}

const getConsultTypeColor = (type: string) => {
  if (type.includes('癌') || type.includes('肿瘤')) return '#dc2626'
  if (type.includes('MDT') || type.includes('会诊')) return '#7c3aed'
  if (type.includes('评估') || type.includes('筛查')) return '#2563eb'
  return '#64748b'
}

// ---------- 组件 ----------
function KPICard({ label, value, trend, icon: Icon, color, bg }: any) {
  const trendIsUp = trend.startsWith('+')
  return (
    <div style={s.kpiCard}>
      <Icon size={24} style={{ ...s.kpiIcon, color }} />
      <div style={s.kpiValue}>{value}</div>
      <div style={s.kpiLabel}>{label}</div>
      <div style={{ ...s.kpiTrend, color: trendIsUp ? '#16a34a' : '#dc2626' }}>
        {trendIsUp ? '↑' : '↓'} {trend}
      </div>
    </div>
  )
}

function MDTList({ teams }: { teams: typeof MDT_TEAMS }) {
  return (
    <div style={s.mdtGrid}>
      {teams.map((team) => {
        const Icon = team.icon
        return (
          <div key={team.name} style={{ ...s.mdtCard, borderLeftColor: team.color }}>
            <div style={s.mdtHeader}>
              <div>
                <div style={s.mdtTitle}>{team.name}</div>
                <div style={s.mdtInfo}>待讨论: {team.pending} 例</div>
              </div>
              <Icon size={20} style={{ color: team.color }} />
            </div>
            <div style={s.mdtInfo}>
              <Calendar size={12} style={{ marginRight: 4 }} />
              {team.nextDate} {team.nextTime}
            </div>
            <div style={s.mdtInfo}>
              <Users size={12} style={{ marginRight: 4 }} />
              {team.location}
            </div>
            <div style={s.mdtMembers}>
              {team.members.slice(0, 4).map((m, i) => (
                <div
                  key={m}
                  style={{
                    ...s.mdtAvatar,
                    background: team.color,
                    marginLeft: i === 0 ? 0 : -8,
                  }}
                >
                  {m.slice(0, 1)}
                </div>
              ))}
              {team.members.length > 4 && (
                <div
                  style={{
                    ...s.mdtAvatar,
                    background: '#e2e8f0',
                    color: '#64748b',
                    marginLeft: -8,
                  }}
                >
                  +{team.members.length - 4}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function ConsultationPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [searchText, setSearchText] = useState('')

  const handleRefresh = () => {
    setSearchText('')
    setActiveTab('all')
  }

  const tabs = [
    { key: 'all', label: '全部会诊', count: 30 },
    { key: 'pending', label: '待处理', count: 12 },
    { key: 'processing', label: '进行中', count: 5 },
    { key: 'completed', label: '已完成', count: 13 },
  ]

  const filteredData = CONSULTATION_DATA.filter(item => {
    const matchTab = activeTab === 'all' || item.status === activeTab
    const matchSearch =
      !searchText ||
      item.patient.includes(searchText) ||
      item.id.includes(searchText) ||
      item.doctor.includes(searchText) ||
      item.hospital.includes(searchText)
    return matchTab && matchSearch
  })

  return (
    <div style={s.root}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>会诊管理</h1>
          <p style={s.subtitle}>
            {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })} · 会诊数据概览
          </p>
        </div>
        <button style={s.refreshBtn} onClick={handleRefresh}>
          <RefreshCw size={13} /> 刷新数据
        </button>
      </div>

      {/* KPI Cards */}
      <div style={s.kpiRow}>
        {KPI_DATA.map((kpi) => (
          <KPICard key={kpi.label} {...kpi} />
        ))}
      </div>

      {/* MDT管理入口 */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#1a3a5c', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Users size={18} style={{ color: '#7c3aed' }} />
          MDT多学科讨论团队
        </div>
        <MDTList teams={MDT_TEAMS} />
      </div>

      {/* Tabs */}
      <div style={s.tabContainer}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            style={{
              ...s.tab,
              ...(activeTab === tab.key ? s.tabActive : {}),
            }}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            <span
              style={{
                ...s.tabBadge,
                background: activeTab === tab.key ? '#e0e7ff' : '#f1f5f9',
                color: activeTab === tab.key ? '#4338ca' : '#64748b',
              }}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={s.tableCard}>
        <div style={s.tableHeader}>
          <div style={s.tableTitle}>
            <FileText size={18} style={{ color: '#2563eb' }} />
            会诊列表
            <span style={{ fontSize: 13, fontWeight: 400, color: '#64748b', marginLeft: 8 }}>
              共 {filteredData.length} 条
            </span>
          </div>
          <div style={s.searchBox}>
            <Search size={14} style={{ color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="搜索患者/会诊号/医生/医院..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: 13,
                width: 220,
                color: '#1a3a5c',
              }}
            />
          </div>
        </div>

        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>会诊号</th>
              <th style={s.th}>患者信息</th>
              <th style={s.th}>检查类型</th>
              <th style={s.th}>会诊类型</th>
              <th style={s.th}>镜下描述</th>
              <th style={s.th}>申请医生</th>
              <th style={s.th}>MDT团队</th>
              <th style={s.th}>优先级</th>
              <th style={s.th}>状态</th>
              <th style={s.th}>日期</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item) => {
              const statusConfig = getStatusConfig(item.status)
              const priorityConfig = getPriorityConfig(item.priority)
              return (
                <tr
                  key={item.id}
                  style={s.tr}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ ...s.td, fontWeight: 600, color: '#2563eb', fontSize: 12 }}>
                    {item.id}
                  </td>
                  <td style={s.td}>
                    <div style={{ fontWeight: 600, color: '#1a3a5c' }}>{item.patient}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>{item.age}岁 · {item.gender}</div>
                  </td>
                  <td style={s.td}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '2px 8px',
                        borderRadius: 4,
                        fontSize: 12,
                        fontWeight: 500,
                        background: `${getTypeColor(item.type)}15`,
                        color: getTypeColor(item.type),
                      }}
                    >
                      {item.type}
                    </span>
                  </td>
                  <td style={s.td}>
                    <span
                      style={{
                        fontSize: 12,
                        color: getConsultTypeColor(item.consultType),
                        fontWeight: 500,
                      }}
                    >
                      {item.consultType}
                    </span>
                  </td>
                  <td style={s.td}>
                    <div style={s.descText} title={item.description}>
                      {item.description}
                    </div>
                  </td>
                  <td style={s.td}>
                    <div style={{ fontWeight: 500 }}>{item.doctor}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>{item.dept}</div>
                  </td>
                  <td style={s.td}>
                    <span
                      style={{
                        fontSize: 11,
                        color: '#7c3aed',
                        fontWeight: 500,
                        background: '#f5f3ff',
                        padding: '2px 6px',
                        borderRadius: 4,
                      }}
                    >
                      {item.mdtTeam}
                    </span>
                  </td>
                  <td style={s.td}>
                    <span style={{ display: 'flex', alignItems: 'center', fontSize: 12 }}>
                      <span style={{ ...s.priorityDot, background: priorityConfig.dot }} />
                      {priorityConfig.label}
                    </span>
                  </td>
                  <td style={s.td}>
                    <span style={{ ...s.badge, ...statusConfig.style }}>
                      {statusConfig.label}
                    </span>
                  </td>
                  <td style={{ ...s.td, fontSize: 12, color: '#94a3b8' }}>{item.date}</td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {filteredData.length === 0 && (
          <div style={s.emptyState}>
            <Search size={48} style={s.emptyStateIcon} />
            <div style={s.emptyStateText}>未找到匹配的会诊记录</div>
            <div style={s.emptyStateHint}>请尝试调整搜索条件或切换其他状态标签</div>
          </div>
        )}
      </div>
    </div>
  )
}
