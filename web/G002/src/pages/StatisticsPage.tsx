import React, { useState, useMemo } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Calendar, Download, Filter, PieChart, Activity, FileText, DollarSign, Users, Clock } from 'lucide-react';
import { Badge, PrimaryBtn, SecondaryBtn, PageTitle, Card, SectionTitle } from '../App';
import {
  initialDailyStatsFull, initialMonthlyReports, initialRadiologistWorkloads,
  initialReports,
} from '../data/initialData';
import type { Modality } from '../types';

// Windows Desktop UI Styles
const S: Record<string, React.CSSProperties> = {
  searchInput: { backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '9px 14px', fontSize: '14px', color: '#1e293b', outline: 'none', width: '280px', transition: 'border-color 0.15s' },
  select: { backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '9px 14px', fontSize: '14px', color: '#1e293b', outline: 'none', cursor: 'pointer', minWidth: '140px' },
  card: { backgroundColor: 'white', borderRadius: '12px', padding: '22px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #e8edf2' },
  table: { width: '100%', borderCollapse: 'collapse' as const, fontSize: '14px', color: '#1e293b' },
  th: { textAlign: 'left' as const, padding: '12px 16px', backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', fontSize: '13px', fontWeight: 700, color: '#475569' },
  td: { padding: '13px 16px', borderBottom: '1px solid #f1f5f9', verticalAlign: 'middle' as const },
  btnPrimary: { backgroundColor: '#1d4ed8', color: 'white', border: 'none', borderRadius: '8px', padding: '9px 18px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' },
  btnSecondary: { backgroundColor: 'white', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px 16px', fontSize: '13.5px', fontWeight: 500, cursor: 'pointer' },
  badgeBlue: { display: 'inline-flex', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, backgroundColor: '#eff6ff', color: '#1d4ed8' },
  badgeGreen: { display: 'inline-flex', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, backgroundColor: '#f0fdf4', color: '#16a34a' },
  badgeYellow: { display: 'inline-flex', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, backgroundColor: '#fffbeb', color: '#d97706' },
  badgeRed: { display: 'inline-flex', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, backgroundColor: '#fef2f2', color: '#dc2626' },
  filterTag: { padding: '6px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', border: '1px solid #e2e8f0', backgroundColor: 'white', color: '#475569' },
  filterTagActive: { padding: '6px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', border: '1px solid #1d4ed8', backgroundColor: '#1d4ed8', color: 'white' },
  pageTitle: { fontSize: '22px', fontWeight: 700, color: '#0f172a', marginBottom: '24px' },
  toolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '16px' },
  toolbarLeft: { display: 'flex', gap: '10px', alignItems: 'center', flex: 1 },
  modalOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' },
  modal: { backgroundColor: 'white', borderRadius: '16px', padding: '28px', minWidth: '560px', maxWidth: '720px', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' },
  input: { backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '9px 14px', fontSize: '14px', color: '#1e293b', outline: 'none', width: '100%' },
  pagination: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px' },
  pageBtn: { padding: '7px 13px', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: 'white', fontSize: '13px', cursor: 'pointer', color: '#475569' },
  pageBtnActive: { padding: '7px 13px', borderRadius: '6px', border: '1px solid #1d4ed8', backgroundColor: '#1d4ed8', color: 'white', fontSize: '13px', cursor: 'pointer' },
};



const modalityColors: Record<string, string> = {
  'CT': '#2563eb', 'MR': '#7c3aed', 'DR': '#10b981',
  '超声': '#0891b2', '乳腺钼靶': '#db2777', '胃肠造影': '#f59e0b', '骨密度': '#6b7280',
};

const modalityLabels: Record<string, string> = {
  'CT': 'CT检查', 'MR': 'MRI检查', 'DR': 'DR摄影', '超声': '超声检查', '乳腺钼靶': '乳腺钼靶',
};

function BarChart({ data, width = 500, height = 280 }: { data: { label: string; value: number; color: string }[]; width?: number; height?: number }) {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  const barWidth = Math.max((width - 60) / data.length - 16, 8);
  const chartHeight = height - 60;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <line x1="40" y1="20" x2="40" y2={chartHeight + 20} stroke="#e5e7eb" strokeWidth="1" />
      <line x1="40" y1={chartHeight + 20} x2={width} y2={chartHeight + 20} stroke="#e5e7eb" strokeWidth="1" />
      {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
        const y = chartHeight + 20 - ratio * chartHeight;
        const value = Math.round(maxValue * ratio);
        return (
          <g key={idx}>
            <line x1="40" y1={y} x2={width - 10} y2={y} stroke="#f1f5f9" strokeWidth="1" />
            <text x="35" y={y + 4} textAnchor="end" fontSize="11" fill="#94a3b8">{value}</text>
          </g>
        );
      })}
      {data.map((d, idx) => {
        const barHeight = Math.max((d.value / maxValue) * chartHeight, 2);
        const x = 50 + idx * ((width - 60) / data.length);
        const y = chartHeight + 20 - barHeight;
        return (
          <g key={idx}>
            <rect x={x} y={y} width={barWidth} height={barHeight} fill={d.color} rx="4" ry="4" />
            <text x={x + barWidth / 2} y={y - 8} textAnchor="middle" fontSize="12" fontWeight="600" fill="#374151">{d.value}</text>
            <text x={x + barWidth / 2} y={chartHeight + 38} textAnchor="middle" fontSize="11" fill="#64748b">{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

function LineChart({ data, width = 600, height = 240 }: { data: { label: string; value: number; color: string }[]; width?: number; height?: number }) {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  const minValue = Math.min(...data.map(d => d.value), 0);
  const range = maxValue - minValue || 1;
  const chartHeight = height - 60;
  const chartWidth = width - 60;
  const stepX = chartWidth / (data.length - 1 || 1);

  const points = data.map((d, idx) => ({
    x: 50 + idx * stepX,
    y: chartHeight + 20 - ((d.value - minValue) / range) * chartHeight,
    ...d,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight + 20} L ${points[0].x} ${chartHeight + 20} Z`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <line x1="40" y1="20" x2="40" y2={chartHeight + 20} stroke="#e5e7eb" strokeWidth="1" />
      <line x1="40" y1={chartHeight + 20} x2={width} y2={chartHeight + 20} stroke="#e5e7eb" strokeWidth="1" />
      {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
        const y = chartHeight + 20 - ratio * chartHeight;
        const value = Math.round(minValue + ratio * range);
        return (
          <g key={idx}>
            <line x1="40" y1={y} x2={width - 10} y2={y} stroke="#f1f5f9" strokeWidth="1" />
            <text x="35" y={y + 4} textAnchor="end" fontSize="11" fill="#94a3b8">{value}</text>
          </g>
        );
      })}
      <path d={areaD} fill={`${data[0]?.color || '#2563eb'}15`} />
      <path d={pathD} fill="none" stroke={data[0]?.color || '#2563eb'} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p, idx) => (
        <circle key={idx} cx={p.x} cy={p.y} r="4" fill={p.color} stroke="white" strokeWidth="2" />
      ))}
      {points.map((p, idx) => (
        <text key={idx} x={p.x} y={chartHeight + 38} textAnchor="middle" fontSize="10" fill="#64748b">{p.label}</text>
      ))}
    </svg>
  );
}

function PieChartSVG({ data, size = 200 }: { data: { label: string; value: number; color: string }[]; size?: number }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const cx = size / 2; const cy = size / 2; const radius = size / 2 - 10;
  let startAngle = -90;

  const paths = data.map((d) => {
    const angle = (d.value / total) * 360;
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = ((startAngle + angle) * Math.PI) / 180;
    const x1 = cx + radius * Math.cos(startAngleRad);
    const y1 = cy + radius * Math.sin(startAngleRad);
    const x2 = cx + radius * Math.cos(endAngleRad);
    const y2 = cy + radius * Math.sin(endAngleRad);
    const largeArc = angle > 180 ? 1 : 0;
    startAngle += angle;
    return { ...d, path: `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`, percentage: ((d.value / total) * 100).toFixed(1) };
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {paths.map((p, idx) => <path key={idx} d={p.path} fill={p.color} stroke="white" strokeWidth="2" />)}
        <text x={cx} y={cy - 8} textAnchor="middle" fontSize="24" fontWeight="700" fill="#1e293b">{total}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="12" fill="#64748b">总检查量</text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {paths.map((p, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: p.color }} />
            <span style={{ fontSize: '13px', color: '#374151' }}>{p.label}</span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginLeft: 'auto' }}>{p.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function exportToCSV(data: Record<string, string | number>[], filename: string) {
  const headers = Object.keys(data[0]);
  const rows = data.map(row => headers.map(h => `"${String(row[h])}"`).join(','));
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
}

export default function StatisticsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'revenue' | 'modality' | 'quality' | 'monthly' | 'workload'>('overview');
  const [dateRange, setDateRange] = useState('30d');
  const [selectedMonth, setSelectedMonth] = useState('2025-04');

  const stats = initialDailyStatsFull;
  const reports = initialReports;
  const monthlyReports = initialMonthlyReports;
  const workloads = initialRadiologistWorkloads;
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const weekStart = new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0];

  const filteredStats = useMemo(() => {
    const now = new Date();
    const cutoff = dateRange === '7d'
      ? new Date(now.getTime() - 7 * 86400000).toISOString().slice(0, 10)
      : dateRange === '14d'
      ? new Date(now.getTime() - 14 * 86400000).toISOString().slice(0, 10)
      : dateRange === '30d'
      ? new Date(now.getTime() - 30 * 86400000).toISOString().slice(0, 10)
      : '2025-01-01';
    return stats.filter(s => s.date >= cutoff);
  }, [dateRange]);

  const overviewStats = useMemo(() => {
    const todayStats = filteredStats.filter(s => s.date === today);
    const yesterdayStats = filteredStats.filter(s => s.date === yesterday);
    const todayExams = todayStats.reduce((sum, s) => sum + s.examCount, 0);
    const todayReports = todayStats.reduce((sum, s) => sum + s.reportCount, 0);
    const todayRevenue = todayStats.reduce((sum, s) => sum + s.revenue, 0);
    const yesterdayExams = yesterdayStats.reduce((sum, s) => sum + s.examCount, 0);
    const examChangePct = yesterdayExams > 0 ? ((todayExams - yesterdayExams) / yesterdayExams * 100).toFixed(1) : '0';
    const periodExams = filteredStats.reduce((sum, s) => sum + s.examCount, 0);
    const periodReports = filteredStats.reduce((sum, s) => sum + s.reportCount, 0);
    const periodRevenue = filteredStats.reduce((sum, s) => sum + s.revenue, 0);
    return { todayExams, todayReports, todayRevenue, examChangePct, periodExams, periodReports, periodRevenue };
  }, [filteredStats, today, yesterday]);

  const modalityStats = useMemo(() => {
    const todayData = filteredStats.filter(s => s.date === today);
    return todayData.map(s => ({
      modality: s.modality, examCount: s.examCount, reportCount: s.reportCount,
      revenue: s.revenue, completionRate: s.examCount > 0 ? Math.round((s.reportCount / s.examCount) * 100) : 0,
      color: modalityColors[s.modality] || '#6b7280',
    }));
  }, [filteredStats, today]);

  const dailyTrend = useMemo(() => {
    const dates = [...new Set(filteredStats.map(s => s.date))].sort();
    return dates.map(date => ({
      date, label: date.slice(5),
      examCount: filteredStats.filter(s => s.date === date).reduce((sum, s) => sum + s.examCount, 0),
      reportCount: filteredStats.filter(s => s.date === date).reduce((sum, s) => sum + s.reportCount, 0),
      revenue: filteredStats.filter(s => s.date === date).reduce((sum, s) => sum + s.revenue, 0),
    }));
  }, [filteredStats]);

  const revenueStats = useMemo(() => {
    const totalRevenue = filteredStats.reduce((sum, s) => sum + s.revenue, 0);
    const todayRevenue = filteredStats.filter(s => s.date === today).reduce((sum, s) => sum + s.revenue, 0);
    const yesterdayRevenue = filteredStats.filter(s => s.date === yesterday).reduce((sum, s) => sum + s.revenue, 0);
    const revenueChange = yesterdayRevenue > 0 ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue * 100).toFixed(1) : '0';
    const weekRevenue = filteredStats.filter(s => s.date >= weekStart).reduce((sum, s) => sum + s.revenue, 0);
    return { totalRevenue, todayRevenue, revenueChange, weekRevenue };
  }, [filteredStats, today, yesterday, weekStart]);

  const qualityStats = useMemo(() => {
    const total = reports.length;
    const completed = reports.filter(r => r.status === '已完成' || r.status === '已发布').length;
    const urgent = reports.filter(r => r.isUrgent).length;
    const critical = reports.filter(r => r.criticalValue).length;
    return { total, completed, urgent, critical };
  }, [reports]);

  const currentMonthly = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    return monthlyReports.find(m => m.year === year && m.month === month) || monthlyReports[0];
  }, [selectedMonth, monthlyReports]);

  const physicianStats = useMemo(() => {
    const grouped: Record<string, typeof workloads> = {};
    workloads.forEach(w => {
      const key = w.userName;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(w);
    });
    return Object.entries(grouped).map(([name, items]) => {
      const totalReports = items.reduce((sum, w) => sum + w.reportCount, 0);
      const totalUrgent = items.reduce((sum, w) => sum + w.urgentCount, 0);
      const totalCritical = items.reduce((sum, w) => sum + w.criticalCount, 0);
      const avgMinutes = items.length > 0 ? Math.round(items.reduce((sum, w) => sum + w.avgReportMinutes, 0) / items.length) : 0;
      const modalities = [...new Set(items.map(w => w.modality))];
      return { name, totalReports, totalUrgent, totalCritical, avgMinutes, modalities, days: items.length };
    }).sort((a, b) => b.totalReports - a.totalReports);
  }, [workloads]);

  const formatMoney = (amount: number) => new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY', minimumFractionDigits: 0 }).format(amount);

  const handleExport = () => {
    const csvData = filteredStats.map(s => ({
      '日期': s.date, '模态': s.modality, '检查量': s.examCount,
      '报告量': s.reportCount, '收入': s.revenue,
    }));
    exportToCSV(csvData, 'G002_RIS_统计数据');
  };

  return (
    <div>
      <PageTitle>
        <BarChart3 size={28} />
        统计报表
        <span style={{ fontSize: '14px', fontWeight: 400, color: '#64748b', marginLeft: '8px' }}>
          {today}
        </span>
      </PageTitle>

      {/* 筛选栏 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[['7d', '近7天'], ['14d', '近14天'], ['30d', '近30天'], ['all', '全部']].map(([val, label]) => (
            <button key={val} onClick={() => setDateRange(val)}
              style={{
                ...S.btnSecondary, padding: '8px 16px',
                backgroundColor: dateRange === val ? '#2563eb' : '#f1f5f9',
                color: dateRange === val ? 'white' : '#475569',
              }}>
              {label}
            </button>
          ))}
        </div>
        <PrimaryBtn onClick={handleExport}>
          <Download size={16} />
          导出CSV
        </PrimaryBtn>
      </div>

      {/* 概览统计卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <Card style={{ borderLeft: '4px solid #2563eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '6px' }}>今日检查量</div>
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#1e293b' }}>{overviewStats.todayExams}</div>
            </div>
            <div style={{ padding: '8px', backgroundColor: '#dbeafe', borderRadius: '8px' }}><Activity size={20} color="#2563eb" /></div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
            {Number(overviewStats.examChangePct) >= 0 ? <TrendingUp size={14} color="#10b981" /> : <TrendingDown size={14} color="#ef4444" />}
            <span style={{ fontSize: '12px', color: Number(overviewStats.examChangePct) >= 0 ? '#10b981' : '#ef4444' }}>
              {overviewStats.examChangePct}% 较昨日
            </span>
          </div>
        </Card>

        <Card style={{ borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '6px' }}>今日报告量</div>
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#1e293b' }}>{overviewStats.todayReports}</div>
            </div>
            <div style={{ padding: '8px', backgroundColor: '#d1fae5', borderRadius: '8px' }}><FileText size={20} color="#10b981" /></div>
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
            完成率 {overviewStats.todayExams > 0 ? Math.round((overviewStats.todayReports / overviewStats.todayExams) * 100) : 0}%
          </div>
        </Card>

        <Card style={{ borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '6px' }}>今日收入</div>
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#1e293b' }}>{formatMoney(revenueStats.todayRevenue)}</div>
            </div>
            <div style={{ padding: '8px', backgroundColor: '#fef3c7', borderRadius: '8px' }}><DollarSign size={24} color="#f59e0b" /></div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
            {Number(revenueStats.revenueChange) >= 0 ? <TrendingUp size={14} color="#10b981" /> : <TrendingDown size={14} color="#ef4444" />}
            <span style={{ fontSize: '12px', color: Number(revenueStats.revenueChange) >= 0 ? '#10b981' : '#ef4444' }}>
              {revenueStats.revenueChange}% 较昨日
            </span>
          </div>
        </Card>

        <Card style={{ borderLeft: '4px solid #ef4444' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '6px' }}>周期报告量</div>
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#1e293b' }}>{overviewStats.periodReports}</div>
            </div>
            <div style={{ padding: '8px', backgroundColor: '#fef2f2', borderRadius: '8px' }}><FileText size={20} color="#ef4444" /></div>
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>周期收入 {formatMoney(overviewStats.periodRevenue)}</div>
        </Card>
      </div>

      {/* Tab切换 */}
      <Card>
        <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', borderBottom: '2px solid #e2e8f0', paddingBottom: '0' }}>
          {([
            ['overview', <PieChart size={16} />, '概览'],
            ['revenue', <DollarSign size={16} />, '收入统计'],
            ['modality', <Activity size={16} />, '模态分析'],
            ['quality', <Filter size={16} />, '质量分析'],
            ['monthly', <Calendar size={16} />, '月度报告'],
            ['workload', <Users size={16} />, '工作量'],
          ] as [string, React.ReactNode, string][]).map(([key, icon, label]) => (
            <button key={key} style={{
              ...S.btnSecondary, padding: '10px 20px',
              backgroundColor: activeTab === key ? '#2563eb' : 'transparent',
              color: activeTab === key ? 'white' : '#64748b',
              borderBottom: activeTab === key ? '2px solid #2563eb' : '2px solid transparent',
              marginBottom: '-2px', borderRadius: '8px 8px 0 0',
            }} onClick={() => setActiveTab(key as typeof activeTab)}>
              {icon}<span style={{ marginLeft: '6px' }}>{label}</span>
            </button>
          ))}
        </div>

        {/* 概览 */}
        {activeTab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b', marginBottom: '16px' }}>模态分布</h3>
                <PieChartSVG data={modalityStats.map(s => ({ label: modalityLabels[s.modality] || s.modality, value: s.examCount, color: s.color }))} size={220} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b', marginBottom: '16px' }}>每日检查量趋势</h3>
                <LineChart data={dailyTrend.slice(-14).map(d => ({ label: d.label, value: d.examCount, color: '#2563eb' }))} width={400} height={240} />
              </div>
            </div>

            <div style={{ marginTop: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b', marginBottom: '16px' }}>今日详细统计</h3>
              <table style={S.table}>
                <thead>
                  <tr>
                    <th style={S.th}>模态</th><th style={S.th}>检查量</th><th style={S.th}>报告量</th>
                    <th style={S.th}>完成率</th><th style={S.th}>收入</th><th style={S.th}>趋势</th>
                  </tr>
                </thead>
                <tbody>
                  {modalityStats.map(s => {
                    const yesterdayData = stats.find(st => st.date === yesterday && st.modality === s.modality);
                    const pctChange = yesterdayData && yesterdayData.examCount > 0
                      ? ((s.examCount - yesterdayData.examCount) / yesterdayData.examCount * 100).toFixed(1)
                      : '0';
                    return (
                      <tr key={s.modality}>
                        <td style={S.td}>
                          <span style={{ padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 600, color: 'white', backgroundColor: s.color }}>{s.modality}</span>
                        </td>
                        <td style={{ ...S.td, fontWeight: 600 }}>{s.examCount}</td>
                        <td style={S.td}>{s.reportCount}</td>
                        <td style={S.td}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ flex: 1, height: '6px', backgroundColor: '#e5e7eb', borderRadius: '3px' }}>
                              <div style={{ width: `${s.completionRate}%`, height: '100%', backgroundColor: '#10b981', borderRadius: '3px' }} />
                            </div>
                            <span style={{ fontSize: '13px', fontWeight: 600, color: '#10b981' }}>{s.completionRate}%</span>
                          </div>
                        </td>
                        <td style={{ ...S.td, fontWeight: 600, color: '#f59e0b' }}>{formatMoney(s.revenue)}</td>
                        <td style={S.td}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: Number(pctChange) >= 0 ? '#10b981' : '#ef4444', fontSize: '13px' }}>
                            {Number(pctChange) >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            {Number(pctChange) >= 0 ? '+' : ''}{pctChange}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  <tr style={{ backgroundColor: '#f8fafc', fontWeight: 600 }}>
                    <td style={{ ...S.td, color: '#1e293b' }}>合计</td>
                    <td style={S.td}>{overviewStats.todayExams}</td>
                    <td style={S.td}>{overviewStats.todayReports}</td>
                    <td style={S.td}>{overviewStats.todayExams > 0 ? Math.round((overviewStats.todayReports / overviewStats.todayExams) * 100) : 0}%</td>
                    <td style={{ ...S.td, color: '#f59e0b' }}>{formatMoney(revenueStats.todayRevenue)}</td>
                    <td style={S.td}>-</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 收入统计 */}
        {activeTab === 'revenue' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
              <Card style={{ backgroundColor: '#f8fafc' }}>
                <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>今日收入</div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#1e293b' }}>{formatMoney(revenueStats.todayRevenue)}</div>
              </Card>
              <Card style={{ backgroundColor: '#f8fafc' }}>
                <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>本周收入</div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#1e293b' }}>{formatMoney(revenueStats.weekRevenue)}</div>
              </Card>
              <Card style={{ backgroundColor: '#f8fafc' }}>
                <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>周期总收入</div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#1e293b' }}>{formatMoney(revenueStats.totalRevenue)}</div>
              </Card>
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b', marginBottom: '16px' }}>每日收入趋势（近14天）</h3>
            <BarChart data={dailyTrend.slice(-14).map(d => ({ label: d.label, value: d.revenue, color: '#f59e0b' }))} width={700} height={300} />
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b', marginBottom: '16px', marginTop: '24px' }}>各模态收入分布</h3>
            <BarChart data={modalityStats.map(s => ({ label: s.modality, value: s.revenue, color: s.color }))} width={700} height={300} />
          </div>
        )}

        {/* 模态分析 */}
        {activeTab === 'modality' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {modalityStats.map(s => {
                const periodData = filteredStats.filter(st => st.modality === s.modality);
                const periodTotal = periodData.reduce((sum, d) => sum + d.examCount, 0);
                const periodRevenue = periodData.reduce((sum, d) => sum + d.revenue, 0);
                return (
                  <Card key={s.modality} style={{ borderTop: `4px solid ${s.color}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b' }}>
                        <span style={{ padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 600, color: 'white', backgroundColor: s.color, marginRight: '8px' }}>{s.modality}</span>
                      </h3>
                      <span style={{ fontSize: '13px', color: '#64748b' }}>完成率 {s.completionRate}%</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                      <Card style={{ backgroundColor: '#f8fafc' }}>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>今日检查</div>
                        <div style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b' }}>{s.examCount}</div>
                      </Card>
                      <Card style={{ backgroundColor: '#f8fafc' }}>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>周期检查</div>
                        <div style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b' }}>{periodTotal}</div>
                      </Card>
                      <Card style={{ backgroundColor: '#f8fafc' }}>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>今日收入</div>
                        <div style={{ fontSize: '24px', fontWeight: 700, color: '#f59e0b' }}>{formatMoney(s.revenue)}</div>
                      </Card>
                      <Card style={{ backgroundColor: '#f8fafc' }}>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>周期收入</div>
                        <div style={{ fontSize: '24px', fontWeight: 700, color: '#f59e0b' }}>{formatMoney(periodRevenue)}</div>
                      </Card>
                    </div>
                    <div style={{ marginTop: '12px', height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px' }}>
                      <div style={{ width: `${s.completionRate}%`, height: '100%', backgroundColor: s.color, borderRadius: '4px' }} />
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* 质量分析 */}
        {activeTab === 'quality' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
              <Card style={{ backgroundColor: '#f8fafc', textAlign: 'center' }}>
                <div style={{ fontSize: '36px', fontWeight: 700, color: '#1e293b' }}>{qualityStats.total}</div>
                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>报告总数</div>
              </Card>
              <Card style={{ backgroundColor: '#d1fae5', textAlign: 'center' }}>
                <div style={{ fontSize: '36px', fontWeight: 700, color: '#065f46' }}>{qualityStats.completed}</div>
                <div style={{ fontSize: '13px', color: '#065f46', marginTop: '4px' }}>已完成</div>
              </Card>
              <Card style={{ backgroundColor: '#fef3c7', textAlign: 'center' }}>
                <div style={{ fontSize: '36px', fontWeight: 700, color: '#92400e' }}>{qualityStats.urgent}</div>
                <div style={{ fontSize: '13px', color: '#92400e', marginTop: '4px' }}>急诊报告</div>
              </Card>
              <Card style={{ backgroundColor: '#fef2f2', textAlign: 'center' }}>
                <div style={{ fontSize: '36px', fontWeight: 700, color: '#991b1b' }}>{qualityStats.critical}</div>
                <div style={{ fontSize: '13px', color: '#991b1b', marginTop: '4px' }}>含危急值</div>
              </Card>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              {(['待书写', '待审核', '已完成', '已发布'] as const).map((status, idx) => {
                const count = reports.filter(r => r.status === status).length;
                const percentage = qualityStats.total > 0 ? (count / qualityStats.total * 100).toFixed(1) : '0';
                const colors = ['#f59e0b', '#7c3aed', '#10b981', '#059669'];
                return (
                  <div key={status} style={{ flex: 1, padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', textAlign: 'center', borderLeft: `4px solid ${colors[idx]}` }}>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b' }}>{count}</div>
                    <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>{status}</div>
                    <div style={{ fontSize: '12px', color: colors[idx], marginTop: '4px' }}>{percentage}%</div>
                  </div>
                );
              })}
            </div>

            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b', marginBottom: '16px' }}>报告质量明细（前10条）</h3>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.th}>报告ID</th><th style={S.th}>检查项目</th><th style={S.th}>模态</th>
                  <th style={S.th}>状态</th><th style={S.th}>危急值</th><th style={S.th}>报告医师</th>
                </tr>
              </thead>
              <tbody>
                {reports.slice(0, 10).map(r => (
                  <tr key={r.id}>
                    <td style={S.td}>{r.accessionNumber}</td>
                    <td style={S.td}>{r.examItemName}</td>
                    <td style={S.td}>
                      <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, color: 'white', backgroundColor: modalityColors[r.modality] || '#6b7280' }}>{r.modality}</span>
                    </td>
                    <td style={S.td}>{r.status}</td>
                    <td style={S.td}>{r.criticalValue ? <span style={{ color: '#dc2626', fontWeight: 600 }}>{r.criticalValue}</span> : '-'}</td>
                    <td style={S.td}>{r.radiologist}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 月度报告 */}
        {activeTab === 'monthly' && currentMonthly && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b', margin: 0 }}>月度报告汇总</h3>
              <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} style={S.select}>
                {monthlyReports.map(m => (
                  <option key={m.id} value={`${m.year}-${String(m.month).padStart(2, '0')}`}>{m.year}年{m.month}月</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              {[
                { label: '总检查量', value: currentMonthly.totalExams, color: '#2563eb' },
                { label: '总报告量', value: currentMonthly.totalReports, color: '#10b981' },
                { label: '月收入', value: formatMoney(currentMonthly.totalRevenue), color: '#f59e0b' },
                { label: '平均TAT', value: `${currentMonthly.avgReportTAT}h`, color: '#7c3aed' },
                { label: '危急值数', value: currentMonthly.criticalValueCount, color: '#ef4444' },
                { label: '报告差错', value: currentMonthly.reportErrorCount, color: '#dc2626' },
                { label: '设备停机', value: `${currentMonthly.equipmentDowntimeHours}h`, color: '#6b7280' },
                { label: '患者满意度', value: `${currentMonthly.patientSatisfaction}%`, color: '#10b981' },
              ].map(item => (
                <Card key={item.label} style={{ borderLeft: `4px solid ${item.color}` }}>
                  <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '6px' }}>{item.label}</div>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b' }}>{item.value}</div>
                </Card>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b', marginBottom: '16px' }}>检查项目TOP5</h3>
                <table style={S.table}>
                  <thead>
                    <tr><th style={S.th}>排名</th><th style={S.th}>检查项目</th><th style={S.th}>数量</th><th style={S.th}>占比</th></tr>
                  </thead>
                  <tbody>
                    {currentMonthly.topExams.slice(0, 5).map((item, idx) => (
                      <tr key={item.examItemName}>
                        <td style={S.td}>
                          <span style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: idx === 0 ? '#f59e0b' : idx === 1 ? '#94a3b8' : idx === 2 ? '#cd7f32' : '#e5e7eb', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: idx < 3 ? 'white' : '#64748b' }}>
                            {idx + 1}
                          </span>
                        </td>
                        <td style={{ ...S.td, fontWeight: 500 }}>{item.examItemName}</td>
                        <td style={{ ...S.td, fontWeight: 600 }}>{item.count}</td>
                        <td style={S.td}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ flex: 1, height: '6px', backgroundColor: '#e5e7eb', borderRadius: '3px' }}>
                              <div style={{ width: `${(item.count / currentMonthly.topExams[0].count) * 100}%`, height: '100%', backgroundColor: '#2563eb', borderRadius: '3px' }} />
                            </div>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>{(item.count / currentMonthly.totalExams * 100).toFixed(1)}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b', marginBottom: '16px' }}>模态分布</h3>
                <table style={S.table}>
                  <thead>
                    <tr><th style={S.th}>模态</th><th style={S.th}>检查量</th><th style={S.th}>收入</th><th style={S.th}>占比</th></tr>
                  </thead>
                  <tbody>
                    {currentMonthly.modalityDistribution.map(m => (
                      <tr key={m.modality}>
                        <td style={S.td}>
                          <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, color: 'white', backgroundColor: modalityColors[m.modality] || '#6b7280' }}>{m.modality}</span>
                        </td>
                        <td style={{ ...S.td, fontWeight: 600 }}>{m.count}</td>
                        <td style={{ ...S.td, color: '#f59e0b', fontWeight: 600 }}>{formatMoney(m.revenue)}</td>
                        <td style={S.td}>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>{(m.count / currentMonthly.totalExams * 100).toFixed(1)}%</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 医师工作量 */}
        {activeTab === 'workload' && (
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b', marginBottom: '16px' }}>医师工作量排名</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              {physicianStats.map((p, idx) => (
                <Card key={p.name} style={{ borderLeft: `4px solid ${['#f59e0b', '#94a3b8', '#cd7f32', '#2563eb', '#7c3aed'][idx % 5]}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#2563eb', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700 }}>{idx + 1}</span>
                      <div>
                        <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '15px' }}>{p.name}</div>
                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>{p.modalities.join('/')} · {p.days}天</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b' }}>{p.totalReports}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>份报告</div>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    <Card style={{ backgroundColor: '#f8fafc', textAlign: 'center', padding: '8px' }}>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: '#ef4444' }}>{p.totalUrgent}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>急诊</div>
                    </Card>
                    <Card style={{ backgroundColor: '#f8fafc', textAlign: 'center', padding: '8px' }}>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: '#dc2626' }}>{p.totalCritical}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>危急值</div>
                    </Card>
                    <Card style={{ backgroundColor: '#f8fafc', textAlign: 'center', padding: '8px' }}>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: '#7c3aed' }}>{p.avgMinutes}m</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>均耗时</div>
                    </Card>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
