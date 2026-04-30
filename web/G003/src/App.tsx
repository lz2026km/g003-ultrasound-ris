import { useState, lazy, Suspense, createContext, useContext } from 'react'
import { Routes, Route, Navigate, BrowserRouter, useNavigate, useLocation } from 'react-router-dom'

// Navigate context
const NavigateCtx = createContext<(path: string) => void>(() => {})
export const useNav = () => useContext(NavigateCtx)

import {
  LayoutDashboard, Users, CalendarClock, Activity, FileText, Microscope,
  ShieldCheck, BarChart3, ClipboardCheck, BookOpen, Shield, ListChecks,
  Menu, X, Stethoscope, LogOut, Bell, Package, Scissors, ShieldAlert, AlertTriangle,
  Camera, UserCheck, AlertCircle, Video, GraduationCap, UsersRound, Database,
  Heart, Thermometer, Droplets, Baby, Brain, Eye, Scan, Wifi, Printer,
  ClipboardList, PackagePlus, AlertOctagon, Info, CheckSquare, Square,
  Clock3, Tag, PackageSearch, Wrench, HardDrive, ChevronRight, BellRing,
  Radio, Monitor, Settings, UserCog, RefreshCw, Download, Search, Filter
} from 'lucide-react'

// 页面组件 — 代码分割
const HomePage = lazy(() => import('./pages/HomePage'))
const PatientPage = lazy(() => import('./pages/PatientPage'))
const AppointmentPage = lazy(() => import('./pages/AppointmentPage'))
const ExamPage = lazy(() => import('./pages/ExamPage'))
const ReportPage = lazy(() => import('./pages/ReportPage'))
const ReportWritePage = lazy(() => import('./pages/ReportWritePage'))
const WorklistPage = lazy(() => import('./pages/WorklistPage'))
const SchedulePage = lazy(() => import('./pages/SchedulePage'))
const StatisticsPage = lazy(() => import('./pages/StatisticsPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const QCPage = lazy(() => import('./pages/QCPage'))
const DictionaryPage = lazy(() => import('./pages/DictionaryPage'))
const AuditPage = lazy(() => import('./pages/AuditPage'))
const MaterialsPage = lazy(() => import('./pages/MaterialsPage'))
const FollowUpPage = lazy(() => import('./pages/FollowUpPage'))
const AuthorityPage = lazy(() => import('./pages/AuthorityPage'))
const ImagePage = lazy(() => import('./pages/ImagePage'))
const TemplatePage = lazy(() => import('./pages/TemplatePage'))
const NursingPage = lazy(() => import('./pages/NursingPage'))
const CriticalValuePage = lazy(() => import('./pages/CriticalValuePage'))
const CriticalAlertPage = lazy(() => import('./pages/CriticalAlertPage'))
const ConsultationPage = lazy(() => import('./pages/ConsultationPage'))
const InfectionPage = lazy(() => import('./pages/InfectionPage'))
const NationalReportPage = lazy(() => import('./pages/NationalReportPage'))
const InsuranceAuditPage = lazy(() => import('./pages/InsuranceAuditPage'))
const DataReportCenterPage = lazy(() => import('./pages/DataReportCenterPage'))
const EquipmentLifecyclePage = lazy(() => import('./pages/EquipmentLifecyclePage'))
const OperationsCenterPage = lazy(() => import('./pages/OperationsCenterPage'))
const CostAnalysisPage = lazy(() => import('./pages/CostAnalysisPage'))
const ResearchPage = lazy(() => import('./pages/ResearchPage'))
const TrainingPage = lazy(() => import('./pages/TrainingPage'))
const QueueCallPage = lazy(() => import('./pages/QueueCallPage'))
const EducationPage = lazy(() => import('./pages/EducationPage'))
const AIQCPage = lazy(() => import('./pages/AIQCPage'))
const CancerScreenPage = lazy(() => import('./pages/CancerScreenPage'))
const StatsEnhancedPage = lazy(() => import('./pages/StatsEnhancedPage'))
const DisinfectionPage = lazy(() => import('./pages/DisinfectionPage'))
const UltrasoundModesPage = lazy(() => import('./pages/UltrasoundModesPage'))
const DicomViewerPage = lazy(() => import('./pages/DicomViewerPage'))

// 骨架屏 Loading 组件
const SkeletonBlock = ({ width = '100%', height = 20, style = {} }: { width?: string | number, height?: number, style?: React.CSSProperties }) => (
  <div style={{
    background: 'linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'skeleton-shimmer 1.4s ease-in-out infinite',
    borderRadius: 4,
    ...style,
    width,
    height,
  }} />
)

const Loading = () => (
  <div style={{ padding: 24 }}>
    <div style={{ background: '#fff', borderRadius: 8, padding: 20, marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <SkeletonBlock height={28} width="40%" style={{ marginBottom: 16 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ padding: 16, background: '#f8fafc', borderRadius: 6 }}>
            <SkeletonBlock height={14} width="60%" style={{ marginBottom: 10 }} />
            <SkeletonBlock height={22} width="80%" />
          </div>
        ))}
      </div>
    </div>
    <div style={{ background: '#fff', borderRadius: 8, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        <SkeletonBlock height={36} width={120} />
        <SkeletonBlock height={36} width={120} />
        <SkeletonBlock height={36} width={120} />
      </div>
      <SkeletonBlock height={400} />
    </div>
    <style>{`@keyframes skeleton-shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }`}</style>
  </div>
)

// ============ 样式 ============
const s: Record<string, React.CSSProperties> = {
  root: { display: 'flex', minHeight: '100vh', background: '#f0f4f8' },
  sidebar: {
    width: 280, background: '#1a3a5c', color: '#fff', display: 'flex',
    flexDirection: 'column', position: 'fixed', height: '100vh', overflowY: 'auto',
    fontFamily: '"Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif',
  },
  logo: {
    padding: '28px 24px 24px', fontSize: 22, fontWeight: 700,
    borderBottom: '1px solid rgba(255,255,255,0.1)', letterSpacing: 1,
    display: 'flex', alignItems: 'center', gap: 12,
  },
  nav: { flex: 1, padding: '20px 0', overflowY: 'auto' },
  navSection: { marginBottom: 8 },
  navSectionTitle: {
    fontSize: 13, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase',
    letterSpacing: 1.5, padding: '14px 24px 8px', fontWeight: 700, lineHeight: 1.4,
  },
  navItem: {
    display: 'flex', alignItems: 'center', gap: 14, padding: '14px 24px',
    cursor: 'pointer', borderRadius: 0, transition: 'all 0.2s',
    fontSize: 16, color: 'rgba(255,255,255,0.8)', borderLeft: '4px solid transparent', lineHeight: 1.5,
  },
  navItemActive: {
    background: 'rgba(255,255,255,0.15)', color: '#fff',
    borderLeft: '4px solid #4ade80',
  },
  navIcon: { flexShrink: 0, opacity: 0.9 },
  sidebarFooter: {
    borderTop: '1px solid rgba(255,255,255,0.1)', padding: '20px 24px',
  },
  userInfo: { fontSize: 14, color: 'rgba(255,255,255,0.6)' },
  main: {
    marginLeft: 280, flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh',
  },
  topbar: {
    background: '#fff', padding: '0 32px', height: 72,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    boxShadow: '0 2px 4px rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 10,
  },
  topbarTitle: { fontSize: 20, fontWeight: 600, color: '#1a3a5c' },
  topbarRight: { display: 'flex', alignItems: 'center', gap: 24 },
  topbarBadge: {
    position: 'relative', cursor: 'pointer', color: '#64748b', display: 'flex',
  },
  badge: {
    position: 'absolute', top: -8, right: -8, background: '#ef4444',
    color: '#fff', borderRadius: '50%', width: 20, height: 20,
    fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  page: { padding: 32, flex: 1, overflowX: 'auto' },
  mobileMenuBtn: {
    display: 'flex', background: 'none', border: 'none', cursor: 'pointer',
    color: '#1a3a5c', padding: 8, minWidth: 44, minHeight: 44,
    alignItems: 'center', justifyContent: 'center',
  },
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 99, display: 'block',
    overflow: 'auto',
  },
}

// ============ 导航配置 ============
const NAV_ITEMS = [
  {
    section: '工作台',
    items: [
      { path: '/', icon: LayoutDashboard, label: '首页概览' },
      { path: '/worklist', icon: ListChecks, label: '检查工作台' },
      { path: '/schedule', icon: CalendarClock, label: '排班管理' },
    ],
  },
  {
    section: '患者与预约',
    items: [
      { path: '/patients', icon: Users, label: '患者管理' },
      { path: '/appointments', icon: CalendarClock, label: '预约管理' },
    ],
  },
  {
    section: '检查与报告',
    items: [
      { path: '/exams', icon: Activity, label: '检查执行' },
      { path: '/queue-call', icon: Bell, label: '叫号管理' },
      { path: '/reports', icon: FileText, label: '报告管理' },
      { path: '/report-write', icon: Stethoscope, label: '报告书写' },
      { path: '/critical-value', icon: Bell, label: '危急值' },
      { path: '/critical-alert', icon: AlertTriangle, label: '危机预警' },
      { path: '/images', icon: Camera, label: '影像管理' },
      { path: '/dicom', icon: Scan, label: 'DICOM浏览器' },
      { path: '/ultrasound-modes', icon: Radio, label: '超声模式介绍' },
      { path: '/templates', icon: FileText, label: '检查模板' },
      { path: '/nursing', icon: ClipboardCheck, label: '护理记录' },
    ],
  },
  {
    section: '质控与安全',
    items: [
      { path: '/ai-qc', icon: BarChart3, label: 'AI质控中心' },
      { path: '/qc', icon: ClipboardCheck, label: '质量控制' },
      { path: '/infection', icon: AlertCircle, label: '感染管理' },
      { path: '/consultation', icon: UserCheck, label: '会诊管理' },
    ],
  },
  {
    section: '管理与统计',
    items: [
      { path: '/statistics', icon: BarChart3, label: '数据统计' },
      { path: '/stats-enhanced', icon: BarChart3, label: '统计分析' },
      { path: '/dashboard', icon: BarChart3, label: '科室看板' },
      { path: '/operations', icon: BarChart3, label: '运营指挥中心' },
      { path: '/cost-analysis', icon: BarChart3, label: '成本效益分析' },
      { path: '/authority', icon: ShieldAlert, label: '权限管理' },
      { path: '/dictionary', icon: BookOpen, label: '数据字典' },
      { path: '/audit', icon: Shield, label: '审计日志' },
      { path: '/materials', icon: Package, label: '耗材管理' },
      { path: '/equipment-lifecycle', icon: Monitor, label: '设备全生命周期' },
      { path: '/followup', icon: Activity, label: '随访管理' },
      { path: '/cancer-screen', icon: AlertTriangle, label: '早癌筛查' },
      { path: '/national-report', icon: ShieldAlert, label: '国家数据上报' },
      { path: '/data-report', icon: Database, label: '数据上报中心' },
      { path: '/insurance-audit', icon: ShieldCheck, label: '医保审核' },
      { path: '/research', icon: Database, label: '临床数据中心' },
    ],
  },
  {
    section: '教育与培训',
    items: [
      { path: '/education', icon: GraduationCap, label: '教育培训' },
      { path: '/training', icon: BookOpen, label: '技能培训中心' },
    ],
  },
]

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}

function AppShell() {
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showVersionModal, setShowVersionModal] = useState(false)
  const currentPath = location.pathname

  const navTo = (path: string) => {
    navigate(path)
    setSidebarOpen(false)
  }

  const renderNavItem = (item: typeof NAV_ITEMS[0]['items'][0]) => {
    const isActive = currentPath === item.path
    return (
      <div
        key={item.path}
        style={{ ...s.navItem, ...(isActive ? s.navItemActive : {}) }}
        onClick={() => navTo(item.path)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && navTo(item.path)}
      >
        <item.icon size={16} style={s.navIcon} />
        <span>{item.label}</span>
      </div>
    )
  }

  return (
    <div style={s.root}>
      {/* 侧边栏 */}
      <aside style={{ ...s.sidebar }}>
        <div style={s.logo}>
          <Radio size={22} color="#4ade80" />
          <span>G003 · 超声RIS</span>
        </div>
        <nav style={s.nav}>
          {NAV_ITEMS.map((group) => (
            <div key={group.section} style={s.navSection}>
              <div style={s.navSectionTitle}>{group.section}</div>
              {group.items.map(renderNavItem)}
            </div>
          ))}
        </nav>
        <div style={s.sidebarFooter}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)' }}>智慧超声RIS信息管理系统</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontFamily: 'monospace', fontSize: 13, color: '#4ade80', fontWeight: 700 }}>v0.2.0</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }} onClick={() => setShowVersionModal(true)}>历史版本 ▾</div>
          </div>
        </div>
      </aside>

      {/* 移动端遮罩 */}
      {sidebarOpen && (
        <div style={s.overlay} onClick={() => setSidebarOpen(false)} />
      )}

      {/* 主内容 */}
      <div style={s.main}>
        {/* 顶部栏 */}
        <header style={s.topbar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              style={s.mobileMenuBtn}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <span style={s.topbarTitle}>
              {NAV_ITEMS.flatMap(g => g.items).find(i => i.path === currentPath)?.label ?? '超声RIS管理系统'}
            </span>
          </div>
          <div style={s.topbarRight}>
            <div style={{ fontSize: 11, color: '#3b82f6', fontFamily: 'monospace', background: '#eff6ff', padding: '3px 8px', borderRadius: 10, border: '1px solid #bfdbfe', fontWeight: 600, minWidth: 44, minHeight: 22, display: 'flex', alignItems: 'center' }}>v0.2.0</div>
            <div style={s.topbarBadge}>
              <Bell size={20} />
              <span style={s.badge}>1</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', background: '#1a3a5c',
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 600,
              }}>
                李
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1a3a5c' }}>李明辉</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>超声科 · 主治医师</div>
              </div>
            </div>
          </div>
        </header>

        {/* 路由 */}
        <div style={s.page}>
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/worklist" element={<WorklistPage />} />
              <Route path="/schedule" element={<SchedulePage />} />
              <Route path="/patients" element={<PatientPage />} />
              <Route path="/appointments" element={<AppointmentPage />} />
              <Route path="/exams" element={<ExamPage />} />
              <Route path="/reports" element={<ReportPage />} />
              <Route path="/report-write" element={<ReportWritePage />} />
              <Route path="/report-write/:reportId" element={<ReportWritePage />} />
              <Route path="/critical-value" element={<CriticalValuePage />} />
              <Route path="/critical-alert" element={<CriticalAlertPage />} />
              <Route path="/statistics" element={<StatisticsPage />} />
              <Route path="/qc" element={<QCPage />} />
              <Route path="/dictionary" element={<DictionaryPage />} />
              <Route path="/audit" element={<AuditPage />} />
              <Route path="/materials" element={<MaterialsPage />} />
              <Route path="/followup" element={<FollowUpPage />} />
              <Route path="/authority" element={<AuthorityPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/images" element={<ImagePage />} />
              <Route path="/templates" element={<TemplatePage />} />
              <Route path="/nursing" element={<NursingPage />} />
              <Route path="/education" element={<EducationPage />} />
              <Route path="/cancer-screen" element={<CancerScreenPage />} />
              <Route path="/ai-qc" element={<AIQCPage />} />
              <Route path="/stats-enhanced" element={<StatsEnhancedPage />} />
              <Route path="/consultation" element={<ConsultationPage />} />
              <Route path="/infection" element={<InfectionPage />} />
              <Route path="/national-report" element={<NationalReportPage />} />
              <Route path="/insurance-audit" element={<InsuranceAuditPage />} />
              <Route path="/dicom" element={<DicomViewerPage />} />
              <Route path="/cost-analysis" element={<CostAnalysisPage />} />
              <Route path="/ultrasound-modes" element={<UltrasoundModesPage />} />
              <Route path="/research" element={<ResearchPage />} />
              <Route path="/training" element={<TrainingPage />} />
              <Route path="/queue-call" element={<QueueCallPage />} />
              <Route path="/data-report" element={<DataReportCenterPage />} />
              <Route path="/equipment-lifecycle" element={<EquipmentLifecyclePage />} />
              <Route path="/operations" element={<OperationsCenterPage />} />
              <Route path="/disinfection" element={<DisinfectionPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </div>
      </div>

      {/* 版本历史弹窗 */}
      {showVersionModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} onClick={() => setShowVersionModal(false)}>
          <div style={{
            background: '#fff', borderRadius: 12, padding: '24px 28px', maxWidth: 520, width: '90%',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 18, color: '#1a3a5c' }}>版本升级日志</h2>
              <button onClick={() => setShowVersionModal(false)} style={{
                background: 'none', border: 'none', cursor: 'pointer', fontSize: 24, color: '#94a3b8',
                lineHeight: 1,
              }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ padding: '14px 16px', background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0' }}>
                <div style={{ fontWeight: 600, color: '#166534', marginBottom: 6 }}>
                  v0.2.0 <span style={{ fontSize: 12, fontWeight: 400, color: '#15803d' }}>（当前版本）</span>
                </div>
                <div style={{ fontSize: 13, color: '#166534', lineHeight: 1.6 }}>
                  核心流程升级：患者检查全流程闭环、DICOM增强、AI质控、统计图表ECharts、科室运营大屏
                </div>
              </div>
              <div style={{ padding: '14px 16px', background: '#f8fafc', borderRadius: 8, border: '#e2e8f0' }}>
                <div style={{ fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                  v0.1.0 <span style={{ fontSize: 12, fontWeight: 400, color: '#64748b' }}>（历史版本）</span>
                </div>
                <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.6 }}>
                  智慧超声RIS信息管理系统 v0.1.0 首发版本，基于G004内镜系统架构全面重构。集成患者管理、预约登记、检查执行、报告书写、叫号分诊、图像采集、数据统计等核心模块。对标蓝网科技、东软医疗US-RIS、联影医疗、开立医疗、岱嘉超声RIS等全网竞品，汇聚所有产品优点于一体。
                </div>
              </div>
              <div style={{ padding: '14px 16px', background: '#f8fafc', borderRadius: 8, border: '#e2e8f0' }}>
                <div style={{ fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                  v0.0.1 <span style={{ fontSize: 12, fontWeight: 400, color: '#64748b' }}>（开发版本）</span>
                </div>
                <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.6 }}>
                  项目初始化，架构设计与竞品分析阶段。
                </div>
              </div>
            </div>
            <div style={{ marginTop: 20, textAlign: 'right' }}>
              <button onClick={() => setShowVersionModal(false)} style={{
                background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 6,
                padding: '8px 24px', fontSize: 13, cursor: 'pointer',
              }}>关闭</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
