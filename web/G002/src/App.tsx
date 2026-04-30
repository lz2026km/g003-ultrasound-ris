import React, { useState, useMemo } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Users, FileText, BarChart3, Image, Settings,
  Menu, X, Home, Calendar, ClipboardList, AlertTriangle,
  Activity, Shield, Clock, CheckCircle, Printer, Bell,
  TrendingUp, TrendingDown, Info, BellRing, Eye,
  ListChecks, Grid3X3, BookOpen, Stethoscope,
} from 'lucide-react';

import PatientsPage from './pages/PatientsPage';
import ExamsPage from './pages/ExamsPage';
import ReportsPage from './pages/ReportsPage';
import ReportWritePage from './pages/ReportWritePage';
import ImagingPage from './pages/ImagingPage';
import StatisticsPage from './pages/StatisticsPage';
import QCPage from './pages/QCPage';
import EquipmentPage from './pages/EquipmentPage';
import AuditCenterPage from './pages/AuditCenterPage';
import WorklistPage from './pages/WorklistPage';
import SchedulePage from './pages/SchedulePage';
import DictionaryPage from './pages/DictionaryPage';
import NotFoundPage from './pages/NotFoundPage';

import {
  initialReports, initialExams, initialPatients,
  initialDailyStatsFull, initialCriticalValueNotifications,
  initialSystemNotifications, initialReportTimeoutRecords,
  initialEquipmentUtilization, initialEquipmentQcRecords,
} from './data/initialData';
import { ReportsProvider } from './context/ReportsContext';

// ===== Windows 10 桌面端全局样式系统 =====
// 基准间距单位: 8px | 主色: #1d4ed8 | 背景: #f1f5f9 | 侧边栏: #1e293b

type CSS = React.CSSProperties;

const S: Record<string, CSS> = {
  // 根布局
  app: { minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: "'Segoe UI', 'Microsoft YaHei', system-ui, sans-serif" },

  // Header (64px 高，专业医学系统风格)
  header: {
    backgroundColor: '#1e293b', color: 'white',
    height: '64px', padding: '0 28px',
    display: 'flex', alignItems: 'center', gap: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
    position: 'sticky', top: 0, zIndex: 100,
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: '12px',
    fontSize: '18px', fontWeight: 700, color: 'white',
    minWidth: '240px', letterSpacing: '0.3px',
  },
  logoIcon: {
    backgroundColor: '#3b82f6', borderRadius: '8px',
    padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  version: { fontSize: '11px', color: '#94a3b8', fontWeight: 400, marginLeft: '8px' },

  // 顶部导航（横向双排）
  topNavWrap: { display: 'flex', flexDirection: 'column', flex: 1, gap: '2px' },
  topNavRow: { display: 'flex', gap: '4px', alignItems: 'center' },
  topNavLabel: { fontSize: '11px', color: '#64748b', marginRight: '8px', fontWeight: 500, letterSpacing: '0.5px', textTransform: 'uppercase' },
  navLink: {
    color: '#cbd5e1', textDecoration: 'none',
    padding: '7px 14px', borderRadius: '6px',
    fontSize: '13.5px', fontWeight: 500,
    display: 'flex', alignItems: 'center', gap: '7px',
    transition: 'all 0.15s',
    whiteSpace: 'nowrap',
  },
  navLinkActive: {
    backgroundColor: '#3b82f6', color: 'white',
    boxShadow: '0 1px 4px rgba(59,130,246,0.4)',
  },
  navLinkHover: {
    backgroundColor: '#334155', color: 'white',
  },

  // 右侧状态区
  headerRight: { display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto' },
  headerTime: { fontSize: '13px', color: '#94a3b8' },
  headerBadge: {
    backgroundColor: '#ef4444', color: 'white',
    borderRadius: '10px', padding: '2px 8px',
    fontSize: '11px', fontWeight: 700,
    display: 'flex', alignItems: 'center', gap: '4px',
  },
  headerBtn: {
    backgroundColor: 'transparent', border: '1px solid #475569',
    color: '#cbd5e1', borderRadius: '6px',
    padding: '6px 12px', fontSize: '13px', cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: '6px',
    transition: 'all 0.15s',
  },

  // 主内容区
  main: {
    padding: '28px 32px',
    maxWidth: '1680px', margin: '0 auto',
  },

  // 页面标题
  pageTitle: {
    fontSize: '22px', fontWeight: 700, color: '#0f172a',
    marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px',
    letterSpacing: '0.2px',
  },

  // 工具栏（新增预约按钮等）
  toolbar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '20px', gap: '16px',
  },
  toolbarLeft: { display: 'flex', gap: '10px', alignItems: 'center', flex: 1 },
  toolbarRight: { display: 'flex', gap: '10px', alignItems: 'center' },

  // 搜索框
  searchInput: {
    backgroundColor: 'white', border: '1px solid #cbd5e1',
    borderRadius: '8px', padding: '9px 14px 9px 38px',
    fontSize: '14px', width: '280px', outline: 'none',
    color: '#1e293b', transition: 'border-color 0.15s',
  },
  searchWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  searchIcon: { position: 'absolute', left: '12px', color: '#94a3b8', pointerEvents: 'none' },

  // 筛选标签组
  filterGroup: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  filterTag: {
    padding: '6px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 500,
    cursor: 'pointer', border: '1px solid #e2e8f0',
    backgroundColor: 'white', color: '#475569',
    transition: 'all 0.15s',
  },
  filterTagActive: {
    backgroundColor: '#1d4ed8', color: 'white', borderColor: '#1d4ed8',
    boxShadow: '0 1px 4px rgba(29,78,216,0.3)',
  },

  // 主按钮（蓝）
  btnPrimary: {
    backgroundColor: '#1d4ed8', color: 'white',
    border: 'none', borderRadius: '8px',
    padding: '9px 18px', fontSize: '14px', fontWeight: 600,
    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
    boxShadow: '0 1px 4px rgba(29,78,216,0.3)',
    transition: 'all 0.15s',
  },
  // 次按钮
  btnSecondary: {
    backgroundColor: 'white', color: '#475569',
    border: '1px solid #cbd5e1', borderRadius: '8px',
    padding: '8px 16px', fontSize: '13.5px', fontWeight: 500,
    cursor: 'pointer', transition: 'all 0.15s',
  },
  // 危险按钮
  btnDanger: {
    backgroundColor: '#fef2f2', color: '#dc2626',
    border: '1px solid #fecaca', borderRadius: '8px',
    padding: '8px 16px', fontSize: '13.5px', fontWeight: 500,
    cursor: 'pointer', transition: 'all 0.15s',
  },
  // 成功按钮
  btnSuccess: {
    backgroundColor: '#f0fdf4', color: '#16a34a',
    border: '1px solid #bbf7d0', borderRadius: '8px',
    padding: '8px 16px', fontSize: '13.5px', fontWeight: 500,
    cursor: 'pointer', transition: 'all 0.15s',
  },
  // 小按钮
  btnSmall: {
    backgroundColor: 'white', color: '#475569',
    border: '1px solid #e2e8f0', borderRadius: '6px',
    padding: '5px 10px', fontSize: '12px', fontWeight: 500,
    cursor: 'pointer', transition: 'all 0.15s',
  },

  // 通用卡片
  card: {
    backgroundColor: 'white', borderRadius: '12px', padding: '22px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #e8edf2',
  },
  cardTitle: {
    fontSize: '16px', fontWeight: 700, color: '#0f172a',
    marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px',
  },
  cardExtra: { marginLeft: 'auto', fontSize: '13px', color: '#64748b', fontWeight: 400 },

  // 表格
  table: {
    width: '100%', borderCollapse: 'collapse',
    fontSize: '14px', color: '#1e293b',
  },
  th: {
    textAlign: 'left', padding: '12px 16px',
    backgroundColor: '#f8fafc',
    borderBottom: '2px solid #e2e8f0',
    fontSize: '13px', fontWeight: 700, color: '#475569',
    letterSpacing: '0.3px', whiteSpace: 'nowrap',
  },
  td: {
    padding: '13px 16px', borderBottom: '1px solid #f1f5f9',
    verticalAlign: 'middle',
  },
  trHover: { backgroundColor: '#f8fafc' },

  // 状态徽章
  badge: {
    display: 'inline-flex', alignItems: 'center', gap: '5px',
    padding: '3px 10px', borderRadius: '20px',
    fontSize: '12px', fontWeight: 600,
  },
  badgeBlue: { backgroundColor: '#eff6ff', color: '#1d4ed8' },
  badgeGreen: { backgroundColor: '#f0fdf4', color: '#16a34a' },
  badgeYellow: { backgroundColor: '#fffbeb', color: '#d97706' },
  badgeRed: { backgroundColor: '#fef2f2', color: '#dc2626' },
  badgeGray: { backgroundColor: '#f1f5f9', color: '#475569' },
  badgePurple: { backgroundColor: '#f5f3ff', color: '#7c3aed' },

  // 输入框（下拉框通用）
  input: {
    backgroundColor: 'white', border: '1px solid #cbd5e1',
    borderRadius: '8px', padding: '9px 14px',
    fontSize: '14px', color: '#1e293b', outline: 'none',
    transition: 'border-color 0.15s',
  },
  select: {
    backgroundColor: 'white', border: '1px solid #cbd5e1',
    borderRadius: '8px', padding: '9px 14px',
    fontSize: '14px', color: '#1e293b', outline: 'none',
    cursor: 'pointer', minWidth: '140px',
  },

  // 分页器
  pagination: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginTop: '20px', padding: '16px 0',
  },
  paginationInfo: { fontSize: '13px', color: '#64748b' },
  paginationBtns: { display: 'flex', gap: '6px' },
  pageBtn: {
    padding: '7px 13px', borderRadius: '6px',
    border: '1px solid #e2e8f0', backgroundColor: 'white',
    fontSize: '13px', cursor: 'pointer', color: '#475569',
    transition: 'all 0.15s',
  },
  pageBtnActive: {
    backgroundColor: '#1d4ed8', color: 'white', borderColor: '#1d4ed8',
  },

  // 模态框
  modalOverlay: {
    position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, backdropFilter: 'blur(2px)',
  },
  modal: {
    backgroundColor: 'white', borderRadius: '16px',
    padding: '28px', minWidth: '560px', maxWidth: '720px',
    boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
  },
  modalTitle: {
    fontSize: '18px', fontWeight: 700, color: '#0f172a',
    marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px',
  },
  modalFooter: {
    display: 'flex', justifyContent: 'flex-end', gap: '10px',
    marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #f1f5f9',
  },

  // 表单项
  formGroup: { marginBottom: '18px' },
  formLabel: {
    display: 'block', fontSize: '13px', fontWeight: 600,
    color: '#374151', marginBottom: '6px',
  },
  formHint: { fontSize: '12px', color: '#94a3b8', marginTop: '4px' },

  // 空状态
  emptyState: {
    textAlign: 'center', padding: '60px 20px',
    color: '#94a3b8', fontSize: '14px',
  },

  // 分割线
  divider: { height: '1px', backgroundColor: '#f1f5f9', margin: '20px 0' },

  // 辅助文本
  textMuted: { fontSize: '13px', color: '#94a3b8' },
  textDanger: { fontSize: '13px', color: '#dc2626' },
  textSuccess: { fontSize: '13px', color: '#16a34a' },
};

// 全局工具函数
export function Badge({ type, children }: { type: 'blue'|'green'|'yellow'|'red'|'gray'|'purple'; children: React.ReactNode }) {
  const map: Record<string, React.CSSProperties> = {
    blue: S.badgeBlue, green: S.badgeGreen, yellow: S.badgeYellow,
    red: S.badgeRed, gray: S.badgeGray, purple: S.badgePurple,
  };
  return <span style={{ ...S.badge, ...map[type] }}>{children}</span>;
}

export function PrimaryBtn({ children, onClick, style, disabled }: { children: React.ReactNode; onClick?: () => void; style?: React.CSSProperties; disabled?: boolean }) {
  return (
    <button style={{ ...S.btnPrimary, opacity: disabled ? 0.6 : 1, cursor: disabled ? 'not-allowed' : 'pointer', ...style }} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export function SecondaryBtn({ children, onClick, style }: { children: React.ReactNode; onClick?: () => void; style?: React.CSSProperties }) {
  return <button style={{ ...S.btnSecondary, ...style }} onClick={onClick}>{children}</button>;
}

export function PageTitle({ children, extra }: { children: React.ReactNode; extra?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
      <h1 style={S.pageTitle}>{children}</h1>
      {extra && <div>{extra}</div>}
    </div>
  );
}

export function Card({ children, style, className }: { children: React.ReactNode; style?: React.CSSProperties; className?: string }) {
  return <div style={{ ...S.card, ...style }} className={className}>{children}</div>;
}

export function SectionTitle({ children, extra }: { children: React.ReactNode; extra?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
      <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', margin: 0 }}>{children}</h3>
      {extra && <div>{extra}</div>}
    </div>
  );
}

// ====== NavLink 悬停辅助 ======
function DesktopNavLink({ to, icon: Icon, label }: { to: string; icon: any; label: string }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  const [hovered, setHovered] = useState(false);
  return (
    <NavLink
      to={to}
      style={{
        ...S.navLink,
        ...(isActive ? S.navLinkActive : {}),
        ...(hovered && !isActive ? S.navLinkHover : {}),
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Icon size={15} />
      {label}
    </NavLink>
  );
}

// ===== 页面内容 =====

function HomePage() {
  const navigate = useNavigate();
  const today = '2025-04-28';

  const todayStats = useMemo(() => {
    const todayData = initialDailyStatsFull.filter((s: any) => s.date === today);
    const yesterdayData = initialDailyStatsFull.filter((s: any) => s.date === '2025-04-27');
    const todayExams = todayData.reduce((sum: number, s: any) => sum + s.examCount, 0);
    const todayReports = todayData.reduce((sum: number, s: any) => sum + s.reportCount, 0);
    const todayRevenue = todayData.reduce((sum: number, s: any) => sum + s.revenue, 0);
    const yesterdayExams = yesterdayData.reduce((sum: number, s: any) => sum + s.examCount, 0);
    const examChange = yesterdayExams > 0 ? ((todayExams - yesterdayExams) / yesterdayExams * 100).toFixed(1) : '0';
    return { todayExams, todayReports, todayRevenue, examChange };
  }, []);

  const reportStats = useMemo(() => {
    const pending = initialReports.filter((r: any) => r.status === '待书写');
    const pendingUrgent = pending.filter((r: any) => r.isUrgent);
    const critical = initialReports.filter((r: any) => r.criticalValue && r.status !== '已发布');
    return { pending: pending.length, pendingUrgent: pendingUrgent.length, critical: critical.length };
  }, []);

  const equipmentStats = useMemo(() => {
    const total = initialEquipmentUtilization.length;
    const running = initialEquipmentUtilization.filter((e: any) => e.utilizationRate > 0).length;
    return { total, running };
  }, []);

  const pendingReportsList = useMemo(() => {
    return initialReports
      .filter((r: any) => r.status === '待书写')
      .sort((a: any, b: any) => (a.isUrgent === b.isUrgent ? 0 : a.isUrgent ? -1 : 1))
      .slice(0, 6);
  }, []);

  const todayModalityProgress = useMemo(() => {
    const todayData = initialDailyStatsFull.filter((s: any) => s.date === today);
    const colors: Record<string, string> = { CT: '#2563eb', MR: '#7c3aed', DR: '#10b981', '超声': '#0891b2', '乳腺钼靶': '#db2777' };
    return todayData.map((s: any) => ({
      modality: s.modality,
      examCount: s.examCount,
      reportCount: s.reportCount,
      revenue: s.revenue,
      completionRate: s.examCount > 0 ? Math.round((s.reportCount / s.examCount) * 100) : 0,
      color: colors[s.modality] || '#6b7280',
    }));
  }, []);

  const criticalNotifications = useMemo(() => {
    return initialCriticalValueNotifications.filter((n: any) => n.status !== '已处理').slice(0, 4);
  }, []);

  const systemNotifications = useMemo(() => {
    return initialSystemNotifications.filter((n: any) => n.priority === '紧急' || n.priority === '重要').slice(0, 3);
  }, []);

  const timeoutWarnings = useMemo(() => {
    return initialReportTimeoutRecords.filter((r: any) => r.status === '超时' || r.status === '即将超时');
  }, []);

  return (
    <div>
      {/* 页面标题栏 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={S.pageTitle}>
          <Activity size={24} />
          放射科工作台
          <span style={{ fontSize: '14px', fontWeight: 400, color: '#64748b', marginLeft: '8px', letterSpacing: '0.3px' }}>
            {today} · 星期二
          </span>
        </h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {timeoutWarnings.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca', fontSize: '13px', color: '#dc2626', fontWeight: 600 }}>
              <Clock size={15} />{timeoutWarnings.length} 例报告超时
            </div>
          )}
          {criticalNotifications.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca', fontSize: '13px', color: '#dc2626', fontWeight: 600 }}>
              <AlertTriangle size={15} />{criticalNotifications.length} 危急值待处理
            </div>
          )}
        </div>
      </div>

      {/* 统计卡片 6列 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '18px', marginBottom: '24px' }}>
        <StatCard title="今日检查量" value={String(todayStats.todayExams)} subtitle={`较昨日 ${Number(todayStats.examChange) >= 0 ? '+' : ''}${todayStats.examChange}%`} subColor={Number(todayStats.examChange) >= 0 ? '#10b981' : '#ef4444'} color="#1d4ed8" icon={<Activity size={20} />} subIcon={Number(todayStats.examChange) >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />} />
        <StatCard title="今日报告量" value={String(todayStats.todayReports)} subtitle={`完成率 ${todayStats.todayExams > 0 ? Math.round((todayStats.todayReports / todayStats.todayExams) * 100) : 0}%`} subColor="#10b981" color="#16a34a" icon={<FileText size={20} />} />
        <StatCard title="今日收入" value={`¥${(todayStats.todayRevenue / 10000).toFixed(1)}万`} subtitle="本月累计收入" subColor="#d97706" color="#d97706" icon={<TrendingUp size={20} />} />
        <StatCard title="待书写报告" value={String(reportStats.pending)} subtitle={reportStats.pendingUrgent > 0 ? `含${reportStats.pendingUrgent}例急诊` : '无急诊'} subColor={reportStats.pendingUrgent > 0 ? '#ef4444' : '#64748b'} color="#d97706" icon={<Clock size={20} />} />
        <StatCard title="危急值待处理" value={String(reportStats.critical)} subtitle="需立即通知临床" subColor="#ef4444" color="#dc2626" icon={<AlertTriangle size={20} />} />
        <StatCard title="设备运行率" value={`${Math.round((equipmentStats.running / equipmentStats.total) * 100)}%`} subtitle={`${equipmentStats.running}/${equipmentStats.total} 台运行中`} subColor="#10b981" color="#16a34a" icon={<Settings size={20} />} />
      </div>

      {/* 中部三栏 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 360px', gap: '20px', marginBottom: '24px' }}>
        {/* 左：检查进度 */}
        <div style={S.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: 0 }}>📊 今日检查概览</h3>
            <button onClick={() => navigate('/exams')} style={{ ...S.btnSmall, color: '#1d4ed8', borderColor: '#bfdbfe', backgroundColor: '#eff6ff' }}>
              查看全部 →
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {todayModalityProgress.map((item: any) => (
              <div key={item.modality}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '14px', color: '#374151', fontWeight: 600 }}>
                    <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: item.color }} />
                    {item.modality}
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>
                    {item.reportCount}/{item.examCount} 份
                    <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 400, marginLeft: '6px' }}>¥{(item.revenue / 1000).toFixed(0)}k</span>
                  </span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${item.completionRate}%`, height: '100%', backgroundColor: item.color, borderRadius: '4px', transition: 'width 0.5s' }} />
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '3px', display: 'flex', justifyContent: 'space-between', paddingLeft: '16px' }}>
                  <span>完成率 {item.completionRate}%</span>
                  <span style={{ color: item.completionRate >= 90 ? '#10b981' : item.completionRate >= 70 ? '#d97706' : '#ef4444', fontWeight: 600 }}>
                    {item.completionRate >= 90 ? '● 正常' : item.completionRate >= 70 ? '◐ 预警' : '○ 滞后'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 中：待书写报告 */}
        <div style={S.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: 0 }}>📝 待书写报告</h3>
            <button onClick={() => navigate('/reports')} style={{ ...S.btnSmall, color: '#1d4ed8', borderColor: '#bfdbfe', backgroundColor: '#eff6ff' }}>
              报告管理 →
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {pendingReportsList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8', fontSize: '14px' }}>
                <CheckCircle size={32} style={{ marginBottom: '8px', color: '#10b981' }} />
                <div>暂无待书写报告</div>
              </div>
            ) : pendingReportsList.map((report: any) => {
              const patient = initialPatients.find((p: any) => p.id === report.patientId);
              return (
                <div key={report.id}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '13px 15px',
                    backgroundColor: report.isUrgent ? '#fffbeb' : '#f8fafc',
                    borderRadius: '8px', border: report.isUrgent ? '1px solid #fde68a' : '1px solid #e2e8f0',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                  onClick={() => navigate(`/reports/write/${report.id}`)}
                  onMouseEnter={(e) => { if (!report.isUrgent) e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
                  onMouseLeave={(e) => { if (!report.isUrgent) e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                      <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '14px' }}>{patient?.name || '未知'}</span>
                      {report.isUrgent && <span style={{ padding: '2px 7px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, backgroundColor: '#fef2f2', color: '#dc2626' }}>急诊</span>}
                      <span style={{ padding: '2px 7px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, backgroundColor: '#f1f5f9', color: '#475569' }}>{report.modality}</span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>{report.examItemName} · {patient?.gender} · {patient?.age}岁</div>
                    {report.criticalValue && <div style={{ fontSize: '12px', color: '#dc2626', marginTop: '2px', fontWeight: 600 }}>⚠ {report.criticalValue}</div>}
                  </div>
                  <div style={{ textAlign: 'right', marginLeft: '16px' }}>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>{report.accessionNumber}</div>
                    <div style={{ fontSize: '12px', color: report.isUrgent ? '#dc2626' : '#94a3b8', marginTop: '2px', fontWeight: report.isUrgent ? 700 : 400 }}>
                      {report.isUrgent ? '立即处理' : '排队中'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {pendingReportsList.length > 0 && (
            <button onClick={() => navigate('/reports')} style={{ width: '100%', marginTop: '14px', padding: '11px', backgroundColor: '#1d4ed8', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
              查看全部 {reportStats.pending} 份待书写报告
            </button>
          )}
        </div>

        {/* 右：通知 + 快捷操作 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* 紧急通知 */}
          {systemNotifications.length > 0 && (
            <div style={{ ...S.card, border: '1px solid #fde68a', backgroundColor: '#fffbeb' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <BellRing size={16} color="#d97706" />
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#92400e', margin: 0 }}>紧急通知</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {systemNotifications.map((notif: any) => (
                  <div key={notif.id} style={{ padding: '10px', backgroundColor: 'white', borderRadius: '7px', border: '1px solid #fde68a', fontSize: '13px' }}>
                    <div style={{ fontWeight: 700, color: '#78350f', marginBottom: '2px' }}>{notif.title}</div>
                    <div style={{ color: '#92400e', lineHeight: 1.5 }}>{notif.content}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 危急值追踪 */}
          <div style={S.card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <AlertTriangle size={16} color="#dc2626" />
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', margin: 0 }}>危急值追踪</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {criticalNotifications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '13px' }}>
                  <CheckCircle size={20} style={{ marginBottom: '4px', color: '#10b981' }} />
                  <div>暂无未处理危急值</div>
                </div>
              ) : criticalNotifications.map((cv: any) => (
                <div key={cv.id} style={{ padding: '10px', backgroundColor: '#fef2f2', borderRadius: '7px', border: '1px solid #fecaca', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <span style={{ fontWeight: 700, color: '#dc2626' }}>{cv.patientName}</span>
                    <span style={{ padding: '1px 7px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, backgroundColor: cv.urgencyLevel === '高' ? '#dc2626' : '#d97706', color: 'white' }}>{cv.urgencyLevel}</span>
                  </div>
                  <div style={{ color: '#374151' }}>{cv.criticalValue}</div>
                  <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '2px' }}>→ {cv.notifiedTo} · {cv.status}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 快捷操作 */}
          <div style={S.card}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', marginBottom: '14px' }}>⚡ 快捷操作</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {[
                { icon: <FileText size={18} />, label: '报告管理', color: '#1d4ed8', path: '/reports' },
                { icon: <BarChart3 size={18} />, label: '统计报表', color: '#16a34a', path: '/statistics' },
                { icon: <Shield size={18} />, label: '质控中心', color: '#7c3aed', path: '/qc' },
                { icon: <Settings size={18} />, label: '设备管理', color: '#475569', path: '/equipment' },
              ].map(({ icon, label, color, path }) => (
                <button key={path} onClick={() => navigate(path)} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '7px',
                  padding: '16px 10px',
                  backgroundColor: `${color}10`, border: `1px solid ${color}30`,
                  borderRadius: '10px', cursor: 'pointer', transition: 'all 0.15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = `${color}20`; e.currentTarget.style.borderColor = `${color}50`; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = `${color}10`; e.currentTarget.style.borderColor = `${color}30`; }}
                >
                  <div style={{ color }}>{icon}</div>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 报告超时预警 */}
          {timeoutWarnings.length > 0 && (
            <div style={{ ...S.card, border: '1px solid #f87171', backgroundColor: '#fef2f2' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Clock size={16} color="#dc2626" />
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#dc2626', margin: 0 }}>报告超时预警</h3>
              </div>
              {timeoutWarnings.map((w: any) => (
                <div key={w.id} style={{ fontSize: '13px', marginBottom: '8px', color: '#374151' }}>
                  <span style={{ fontWeight: 700 }}>{w.patientName}</span>
                  <span style={{ color: '#64748b' }}> — {w.examItemName}</span>
                  <div style={{ fontSize: '12px', color: w.status === '超时' ? '#dc2626' : '#d97706', fontWeight: 600 }}>
                    {w.status === '超时' ? '⏰ 已超时' : '⚠ 即将超时'} · {w.modality}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, subColor, color, icon, subIcon }: {
  title: string; value: string; subtitle: string; subColor?: string;
  color: string; icon: React.ReactNode; subIcon?: React.ReactNode;
}) {
  return (
    <div style={{ ...S.card, borderLeft: `4px solid ${color}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>{title}</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>{value}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '5px' }}>
            {subIcon}
            <span style={{ fontSize: '12px', color: subColor || '#94a3b8' }}>{subtitle}</span>
          </div>
        </div>
        <div style={{ padding: '10px', backgroundColor: `${color}15`, borderRadius: '10px' }}>{icon}</div>
      </div>
    </div>
  );
}

// ===== App 根组件 =====
export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // 导航分两排（前6个和后6个）
  const navRow1 = navItems.slice(0, 6);
  const navRow2 = navItems.slice(6);

  const currentTime = '2025-04-28 14:32';

  return (
    <div style={S.app}>
      <header style={S.header}>
        {/* Logo */}
        <div style={S.logo}>
          <div style={S.logoIcon}>
            <Activity size={22} color="white" />
          </div>
          <div>
            <div>G002 放射科RIS系统</div>
            <div style={S.version}>v1.1 · Windows 桌面端</div>
          </div>
        </div>

        {/* 导航（双排） */}
        <nav style={S.topNavWrap}>
          <div style={S.topNavRow}>
            {navRow1.map((item) => {
              const Icon = item.icon;
              return <DesktopNavLink key={item.path} to={item.path} icon={Icon} label={item.label} />;
            })}
          </div>
          <div style={S.topNavRow}>
            {navRow2.map((item) => {
              const Icon = item.icon;
              return <DesktopNavLink key={item.path} to={item.path} icon={Icon} label={item.label} />;
            })}
          </div>
        </nav>

        {/* 右侧状态 */}
        <div style={S.headerRight}>
          <span style={S.headerTime}>{currentTime}</span>
          <div style={S.headerBadge}>
            <Bell size={13} />
            3
          </div>
          <button style={S.headerBtn}>
            <Printer size={15} /> 打印
          </button>
          <button style={{ ...S.headerBtn, borderColor: '#3b82f6', color: '#60a5fa' }}>
            <Settings size={15} />
          </button>
        </div>

        {/* 移动端菜单按钮 */}
        <button
          style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '8px', display: 'none' }}
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      <main style={S.main}>
        <ReportsProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/worklist" element={<WorklistPage />} />
          <Route path="/patients" element={<PatientsPage />} />
          <Route path="/exams" element={<ExamsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/reports/write/:id" element={<ReportWritePage />} />
          <Route path="/imaging" element={<ImagingPage />} />
          <Route path="/statistics" element={<StatisticsPage />} />
          <Route path="/audit" element={<AuditCenterPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/qc" element={<QCPage />} />
          <Route path="/equipment" element={<EquipmentPage />} />
          <Route path="/dictionary" element={<DictionaryPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        </ReportsProvider>
      </main>

      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; padding: 0; }
        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
        }
        /* 输入框聚焦样式 */
        input:focus, select:focus {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
          outline: none;
        }
        /* 表格行悬停 */
        tr:hover td { background-color: #f8fafc !important; }
        /* 滚动条美化 */
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        /* 按钮悬停 */
        button:hover { filter: brightness(0.95); }
        button:active { transform: translateY(1px); }
      `}</style>
    </div>
  );
}

const navItems = [
  { path: '/', label: '首页', icon: Home },
  { path: '/worklist', label: 'Worklist', icon: ListChecks },
  { path: '/patients', label: '患者管理', icon: Users },
  { path: '/exams', label: '检查管理', icon: Calendar },
  { path: '/reports', label: '报告书写', icon: FileText },
  { path: '/imaging', label: '影像查看', icon: Image },
  { path: '/statistics', label: '统计报表', icon: BarChart3 },
  { path: '/audit', label: '审核中心', icon: Stethoscope },
  { path: '/schedule', label: '排班管理', icon: Grid3X3 },
  { path: '/qc', label: '质控中心', icon: Shield },
  { path: '/equipment', label: '设备管理', icon: Settings },
  { path: '/dictionary', label: '数据字典', icon: BookOpen },
];
