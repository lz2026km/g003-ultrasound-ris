import { useState, lazy, Suspense, createContext, useContext, Component } from 'react'
import { Routes, Route, Navigate, HashRouter, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, CalendarClock, Activity, FileText, Microscope,
  ShieldCheck, BarChart3, ClipboardCheck, BookOpen, Shield, ListChecks,
  Menu, X, Stethoscope, LogOut, Bell, Package, ShieldAlert, AlertTriangle,
  Camera, UserCheck, AlertCircle, GraduationCap, UsersRound, Database,
  Scan, Heart, Thermometer, Droplets, Video, ClipboardList, Wrench, DollarSign, Wifi, Sliders, Brain
} from 'lucide-react'
import styles from './styles/app-shell.module.css'
import { useTheme } from './hooks/useTheme'

const NavigateCtx = createContext<(path: string) => void>(() => {})
export const useNav = () => useContext(NavigateCtx)

const HomePage = lazy(() => import('./pages/HomePage'))
const PatientPage = lazy(() => import('./pages/PatientPage'))
const AppointmentPage = lazy(() => import('./pages/AppointmentPage'))
const ExamPage = lazy(() => import('./pages/ExamPage'))
const ReportPage = lazy(() => import('./pages/ReportPage'))
const ReportWritePage = lazy(() => import('./pages/ReportWritePage'))
const UltrasoundPage = lazy(() => import('./pages/UltrasoundPage'))
const DisinfectionPage = lazy(() => import('./pages/DisinfectionPage'))
const StatisticsPage = lazy(() => import('./pages/StatisticsPage'))
const QCPage = lazy(() => import('./pages/QCPage'))
const DictionaryPage = lazy(() => import('./pages/DictionaryPage'))
const TermLibraryPage = lazy(() => import('./pages/TermLibraryPage'))
const AuditPage = lazy(() => import('./pages/AuditPage'))
const WorklistPage = lazy(() => import('./pages/WorklistPage'))
const SchedulePage = lazy(() => import('./pages/SchedulePage'))
const CriticalValuePage = lazy(() => import('./pages/CriticalValuePage'))
const CriticalAlertPage = lazy(() => import('./pages/CriticalAlertPage'))
const MaterialsPage = lazy(() => import('./pages/MaterialsPage'))
const FollowUpPage = lazy(() => import('./pages/FollowUpPage'))
const AuthorityPage = lazy(() => import('./pages/AuthorityPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const ImagePage = lazy(() => import('./pages/ImagePage'))
const EducationPage = lazy(() => import('./pages/EducationPage'))
const TemplatePage = lazy(() => import('./pages/TemplatePage'))
const NursingPage = lazy(() => import('./pages/NursingPage'))
const PreOpPage = lazy(() => import('./pages/PreOpPage'))
const AIQCPage = lazy(() => import('./pages/AIQCPage'))
const TrainingExamPage = lazy(() => import('./pages/TrainingExamPage'))
const UltrasoundModesPage = lazy(() => import('./pages/UltrasoundModesPage'))
const StatsEnhancedPage = lazy(() => import('./pages/StatsEnhancedPage'))
const DisinfectionTracePage = lazy(() => import('./pages/DisinfectionTracePage'))
const ConsultationPage = lazy(() => import('./pages/ConsultationPage'))
const RemoteConsultationPage = lazy(() => import('./pages/RemoteConsultationPage'))
const InfectionPage = lazy(() => import('./pages/InfectionPage'))
const NationalReportPage = lazy(() => import('./pages/NationalReportPage'))
const InsuranceAuditPage = lazy(() => import('./pages/InsuranceAuditPage'))
const ResearchPage = lazy(() => import('./pages/ResearchPage'))
const TrainingPage = lazy(() => import('./pages/TrainingPage'))
const QueueCallPage = lazy(() => import('./pages/QueueCallPage'))
const DataReportCenterPage = lazy(() => import('./pages/DataReportCenterPage'))
const EquipmentLifecyclePage = lazy(() => import('./pages/EquipmentLifecyclePage'))
const OperationsCenterPage = lazy(() => import('./pages/OperationsCenterPage'))
const DicomViewerPage = lazy(() => import('./pages/DicomViewerPage'))
const CostAnalysisPage = lazy(() => import('./pages/CostAnalysisPage'))
const ImagingModesPage = lazy(() => import('./pages/ImagingModesPage'))
const ReportQCPage = lazy(() => import('./pages/ReportQCPage'))
const ProbeManagementPage = lazy(() => import('./pages/ProbeManagementPage'))
const ExamFlowPage = lazy(() => import('./pages/ExamFlowPage'))
const RemoteUltrasoundPage = lazy(() => import('./pages/RemoteUltrasoundPage'))
const DRGDIPPage = lazy(() => import('./pages/DRGDIPPage'))
const WorkOrderPage = lazy(() => import('./pages/WorkOrderPage'))
const ReportWritePagePro = lazy(() => import('./pages/ReportWritePagePro'))
const MedicalAuditPage = lazy(() => import('./pages/MedicalAuditPage'))

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

class ErrorBoundary extends Component<{children: React.ReactNode}, {hasError: boolean; error?: string}> {
  constructor(props: any) { super(props); this.state = { hasError: false } }
  static getDerivedStateFromError(error: any) { return { hasError: true, error: String(error) } }
  componentDidCatch(error: any, errorInfo: any) { console.error('App Error:', error, errorInfo) }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, textAlign: 'center' }}>
          <h2 style={{ color: '#dc2626' }}>组件加载出错</h2>
          <p style={{ color: '#64748b' }}>{this.state.error}</p>
          <button onClick={() => this.setState({ hasError: false })} style={{ padding: '10px 20px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', marginTop: 16 }}>重试</button>
        </div>
      )
    }
    return this.props.children
  }
}

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
      { path: '/report-write-pro', icon: Brain, label: '专业报告工作站' },
      { path: '/critical-value', icon: Bell, label: '危急值' },
      { path: '/critical-alert', icon: AlertTriangle, label: '危机预警' },
      { path: '/images', icon: Camera, label: '影像管理' },
      { path: '/dicom', icon: Camera, label: 'DICOM浏览器' },
      { path: '/imaging-modes', icon: Camera, label: '成像模式介绍' },
      { path: '/templates', icon: FileText, label: '检查模板' },
      { path: '/nursing', icon: ClipboardCheck, label: '护理记录' },
      { path: '/preop', icon: ClipboardCheck, label: '术前评估' },
    ],
  },
  {
    section: '超声设备',
    items: [
      { path: '/ultrasound', icon: Activity, label: '超声设备' },
      { path: '/probe-management', icon: Scan, label: '探头管理' },
      { path: '/ultrasound-modes', icon: Activity, label: '超声模式' },
      { path: '/disinfection', icon: ShieldCheck, label: '洗消追溯' },
      { path: '/disinfection-trace', icon: ShieldCheck, label: '洗消追溯增强' },
      { path: '/workorder', icon: Wrench, label: '维修工单' },
    ],
  },
  {
    section: '质量与安全',
    items: [
      { path: '/ai-qc', icon: BarChart3, label: 'AI质控中心' },
      { path: '/qc', icon: ClipboardCheck, label: '质量控制' },
      { path: '/report-qc', icon: ClipboardCheck, label: '报告质量评分' },
      { path: '/infection', icon: AlertCircle, label: '感染管理' },
      { path: '/consultation', icon: UserCheck, label: '会诊管理' },
      { path: '/remote-consultation', icon: Video, label: '远程会诊' },
      { path: '/remote-ultrasound', icon: Wifi, label: '远程超声（实时）' },
    ],
  },
  {
    section: '管理与统计',
    items: [
      { path: '/statistics', icon: BarChart3, label: '数据统计' },
      { path: '/stats-enhanced', icon: BarChart3, label: '统计分析' },
      { path: '/dashboard', icon: BarChart3, label: '科室看板' },
      { path: '/operations', icon: BarChart3, label: '运营指挥中心' },
      { path: '/exam-flow', icon: Activity, label: '流程管理' },
      { path: '/cost-analysis', icon: BarChart3, label: '成本效益分析' },
      { path: '/authority', icon: ShieldAlert, label: '权限管理' },
      { path: '/dictionary', icon: BookOpen, label: '数据字典' },
      { path: '/term-library', icon: BookOpen, label: '术语词库' },
      { path: '/audit', icon: Shield, label: '审计日志' },
      { path: '/materials', icon: Package, label: '耗材管理' },
      { path: '/equipment-lifecycle', icon: Microscope, label: '设备全生命周期' },
      { path: '/followup', icon: Activity, label: '随访管理' },
      { path: '/national-report', icon: ShieldAlert, label: '国家数据上报' },
      { path: '/data-report', icon: Database, label: '卫健委数据上报' },
      { path: '/insurance-audit', icon: ShieldCheck, label: '医保审核' },
      { path: '/medical-audit', icon: ShieldCheck, label: '医保智能审核' },
      { path: '/drg-dip', icon: DollarSign, label: 'DRG/DIP控费' },
      { path: '/research', icon: Database, label: '临床数据中心' },
    ],
  },
  {
    section: '教育与培训',
    items: [
      { path: '/education', icon: GraduationCap, label: '教育培训' },
      { path: '/training', icon: BookOpen, label: '技能培训中心' },
      { path: '/training-exam', icon: GraduationCap, label: '培训考试' },
    ],
  },
]

const APP_VERSION = 'v0.20.0-alpha'

function App() {
  return (
    <HashRouter>
      <ErrorBoundary>
        <AppShell />
      </ErrorBoundary>
    </HashRouter>
  )
}

function AppShell() {
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showVersionModal, setShowVersionModal] = useState(false)
  const { resolved: themeResolved, cycle: cycleTheme } = useTheme()
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
        className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
        onClick={() => navTo(item.path)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && navTo(item.path)}
      >
        <item.icon size={16} className={styles.navItemIcon} />
        <span>{item.label}</span>
      </div>
    )
  }

  const currentTitle = NAV_ITEMS.flatMap(g => g.items).find(i => i.path === currentPath)?.label ?? '超声RIS系统'

  return (
    <div className={styles.shell}>
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarBrand}>
          <Activity size={22} className={styles.sidebarBrandIcon} />
          <span>G003 · 超声RIS</span>
        </div>
        <nav className={styles.sidebarNav}>
          {NAV_ITEMS.map((group) => (
            <div key={group.section} className={styles.navGroup}>
              <div className={styles.navGroupTitle}>{group.section}</div>
              {group.items.map(renderNavItem)}
            </div>
          ))}
        </nav>
        <div className={styles.sidebarFooter}>
          <div className={styles.sidebarFooterTitle}>智慧超声影像信息管理系统</div>
          <div className={styles.sidebarFooterRow}>
            <div className={styles.sidebarVersionTag}>{APP_VERSION}</div>
            <div
              className={styles.sidebarVersionLink}
              onClick={() => setShowVersionModal(true)}
              role="button"
              tabIndex={0}
            >历史版本 ▾</div>
          </div>
        </div>
      </aside>

      <div
        className={`${styles.overlay} ${sidebarOpen ? styles.overlayActive : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      <header className={styles.topbar}>
        <div className={styles.topbarLeft}>
          <button
            className={styles.menuToggle}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="切换侧栏"
          >
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <span className={styles.topbarTitle}>{currentTitle}</span>
        </div>
        <div className={styles.topbarRight}>
          <div
            className={styles.versionBadge}
            onClick={cycleTheme}
            role="button"
            tabIndex={0}
            title={`主题：${themeResolved}（点击切换）`}
          >{APP_VERSION}</div>
          <div className={styles.bellWrap} role="button" tabIndex={0}>
            <Bell size={20} />
            <span className={styles.bellBadge}>1</span>
          </div>
          <div className={styles.userBlock}>
            <div className={styles.userAvatar}>张</div>
            <div className={styles.userInfo}>
              <div className={styles.userName}>张建国</div>
              <div className={styles.userRole}>超声科 · 医生</div>
            </div>
          </div>
        </div>
      </header>

      <main className={styles.main}>
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
            <Route path="/ultrasound" element={<UltrasoundPage />} />
            <Route path="/probe-management" element={<ProbeManagementPage />} />
            <Route path="/disinfection" element={<DisinfectionPage />} />
            <Route path="/statistics" element={<StatisticsPage />} />
            <Route path="/qc" element={<QCPage />} />
            <Route path="/report-qc" element={<ReportQCPage />} />
            <Route path="/dictionary" element={<DictionaryPage />} />
            <Route path="/term-library" element={<TermLibraryPage />} />
            <Route path="/audit" element={<AuditPage />} />
            <Route path="/materials" element={<MaterialsPage />} />
            <Route path="/followup" element={<FollowUpPage />} />
            <Route path="/authority" element={<AuthorityPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/images" element={<ImagePage />} />
            <Route path="/templates" element={<TemplatePage />} />
            <Route path="/nursing" element={<NursingPage />} />
            <Route path="/preop" element={<PreOpPage />} />
            <Route path="/education" element={<EducationPage />} />
            <Route path="/ai-qc" element={<AIQCPage />} />
            <Route path="/training-exam" element={<TrainingExamPage />} />
            <Route path="/ultrasound-modes" element={<UltrasoundModesPage />} />
            <Route path="/stats-enhanced" element={<StatsEnhancedPage />} />
            <Route path="/disinfection-trace" element={<DisinfectionTracePage />} />
            <Route path="/consultation" element={<ConsultationPage />} />
            <Route path="/remote-consultation" element={<RemoteConsultationPage />} />
            <Route path="/infection" element={<InfectionPage />} />
            <Route path="/national-report" element={<NationalReportPage />} />
            <Route path="/insurance-audit" element={<InsuranceAuditPage />} />
            <Route path="/dicom" element={<DicomViewerPage />} />
            <Route path="/cost-analysis" element={<CostAnalysisPage />} />
            <Route path="/imaging-modes" element={<ImagingModesPage />} />
            <Route path="/research" element={<ResearchPage />} />
            <Route path="/training" element={<TrainingPage />} />
            <Route path="/queue-call" element={<QueueCallPage />} />
            <Route path="/data-report" element={<DataReportCenterPage />} />
            <Route path="/equipment-lifecycle" element={<EquipmentLifecyclePage />} />
            <Route path="/operations" element={<OperationsCenterPage />} />
            <Route path="/exam-flow" element={<ExamFlowPage />} />
            <Route path="/remote-ultrasound" element={<RemoteUltrasoundPage />} />
            <Route path="/drg-dip" element={<DRGDIPPage />} />
            <Route path="/workorder" element={<WorkOrderPage />} />
            <Route path="/medical-audit" element={<MedicalAuditPage />} />
            <Route path="/report-write-pro" element={<ReportWritePagePro />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>

      {showVersionModal && (
        <div className={styles.modalBackdrop} onClick={() => setShowVersionModal(false)}>
          <div className={styles.modalCard} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>版本升级日志</h2>
              <button className={styles.modalClose} onClick={() => setShowVersionModal(false)} aria-label="关闭">×</button>
            </div>
            <div className={styles.versionList}>
              <div className={`${styles.versionItem} ${styles.versionItemCurrent}`}>
                <div className={styles.versionItemTitle}>
                  {APP_VERSION} <span className={styles.versionItemTag}>（当前版本）</span>
                </div>
                <div className={styles.versionItemDesc}>
                  v0.20.0-alpha 引入设计系统：62 个 CSS 变量、4 套主题、ThemeProvider 切换（亮色/暗色/跟随系统）、AppShell 全部内联样式迁移到 CSS Module；主色统一为 #3b82f6；为后续 51 个 page 的批量重构提供基础设施。
                </div>
              </div>
              <div className={styles.versionItem}>
                <div className={styles.versionItemTitle}>
                  v0.19.4 <span className={styles.versionItemTag}>（P0 全部完成）</span>
                </div>
                <div className={styles.versionItemDesc}>
                  4 项 P0 完成：1) 报告 AI 生成 mockApi 接口 + 5 模板 + 4 维输出 + 进度条 + 3 分项采纳；2) 影像-病理质控 200 mock + 5 维统计 + AIQCPage 第 7 Tab；3) fullUltrasoundAI.ts 5 模块协调器 + ExamPage 启动器；4) reportConstant.ts 抽 7 常量（2996→2731 行）。
                </div>
              </div>
              <div className={styles.versionItem}>
                <div className={styles.versionItemTitle}>
                  v0.19.3 <span className={styles.versionItemTag}>（四大核心模块）</span>
                </div>
                <div className={styles.versionItemDesc}>
                  v0.9.0 四大核心模块：1) 远程超声（实时）- 5G WebRTC + 探头反控 + 5G 云存储 + 录播；2) DRG/DIP 控费 - 376 ADRG 分组 + 6000+ 病种；3) 维修工单 - 工单流转 + 配件库存 + SLA；4) 医保智能审核 - 248 条规则。
                </div>
              </div>
              <div className={styles.versionItem}>
                <div className={styles.versionItemTitle}>
                  v0.14.0 <span className={styles.versionItemTag}>（竞品整合）</span>
                </div>
                <div className={styles.versionItemDesc}>
                  对标蓝网科技/东软/联影/开立/岱嘉 5 家行业竞品，整合词库辅助输入、模板三级管理、报告历史对比、电子签名、危急值超时预警（30/60 分钟）、工作量多维统计、DICOM MWL 强化、5G 远程会诊、探头管理、卫健委数据上报接口。
                </div>
              </div>
              <div className={styles.versionItem}>
                <div className={styles.versionItemTitle}>
                  v0.13.0 <span className={styles.versionItemTag}>（超声 RIS 独立）</span>
                </div>
                <div className={styles.versionItemDesc}>
                  G003 超声 RIS 正式从 G004 内镜系统拆分独立，初始化 47 个核心业务模块。
                </div>
              </div>
              <div className={styles.versionItem}>
                <div className={styles.versionItemTitle}>
                  v0.8.0 <span className={styles.versionItemTag}>（AI 原生版）</span>
                </div>
                <div className={styles.versionItemDesc}>
                  AIStream 智能工作流：4 步流水线（识别→测量→评价→生成）；切面识别、智能测量、LLM 流式报告生成、图像+报告双轨评价、影像 AI（4 病灶检测器 + 胎儿生物测量）。
                </div>
              </div>
              <div className={styles.versionItem}>
                <div className={styles.versionItemTitle}>
                  v0.1.0 <span className={styles.versionItemTag}>（初始版本）</span>
                </div>
                <div className={styles.versionItemDesc}>
                  基础框架搭建，基于 G004 内镜系统复制重构，移植 46 个页面模块。
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnPrimary} onClick={() => setShowVersionModal(false)}>关闭</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
