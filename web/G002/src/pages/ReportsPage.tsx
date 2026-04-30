import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Search, Clock, AlertTriangle, CheckCircle,
  Edit3, Eye, Printer, X,
} from 'lucide-react';
import { Badge, PrimaryBtn, SecondaryBtn, PageTitle, Card, SectionTitle } from '../App';
import {
  initialReports, initialPatients, initialExams, initialExamItems,
  reportTemplates,
} from '../data/initialData';
import type { Report, ReportStatus, Modality, Exam, Patient, ExamItem } from '../types';
import { useReports } from '../context/ReportsContext';

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



const CRITICAL_VALUE_KEYWORDS = [
  // 气胸/血胸
  '气胸', '血胸', '张力性气胸', '液气胸',
  // 肺栓塞/梗死
  '肺栓塞', '肺梗死', '肺动脉栓塞',
  // 颅内
  '脑疝', '颅内出血', '蛛网膜下腔出血', '硬膜外血肿', '硬膜下血肿', '脑出血',
  // 主动脉
  '主动脉夹层', '主动脉瘤破裂',
  // 腹腔
  '消化道穿孔', '肠梗阻', '腹腔实质脏器破裂',
  // 四肢/脊柱
  '骨折', '脊柱骨折', '股骨骨折', '骨盆骨折',
  // 其他
  '心脏压塞', '心包填塞', '异物', '妊娠相关',
  // 数值类（用正则）
  '血糖[<>]', '血钾[<>]', '血钠[<>]',
];

const modalityColors: Record<string, string> = {
  'CT': '#2563eb',
  'MR': '#7c3aed',
  'DR': '#10b981',
  '超声': '#0891b2',
  '乳腺钼靶': '#db2777',
  '胃肠造影': '#f59e0b',
  '骨密度': '#6b7280',
};

export default function ReportsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'list' | 'write'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReportStatus | '全部'>('全部');
  const [modalityFilter, setModalityFilter] = useState<string>('全部');
  const [hoveredReport, setHoveredReport] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Report writing state
  const [selectedReportId, setSelectedReportId] = useState<string>('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [findings, setFindings] = useState('');
  const [impression, setImpression] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [showCriticalModal, setShowCriticalModal] = useState(false);
  const [pendingCriticalValue, setPendingCriticalValue] = useState<string>('');

  // P0-2: 本地 reports 状态，支持完整状态机流转
  const { reports, setReports } = useReports();
  const patients = initialPatients;
  const exams = initialExams;

  // 统计数据
  const stats = useMemo(() => {
    const today = '2025-04-28';
    const todayReports = reports.filter(r => r.reportTime?.startsWith(today));
    const pending = reports.filter(r => r.status === '待书写').length;
    const urgent = reports.filter(r => r.isUrgent && r.status === '待书写').length;
    const completed = reports.filter(r => r.status === '已完成' || r.status === '已发布').length;
    const critical = reports.filter(r => r.criticalValue && r.status !== '已发布').length;
    return { pending, urgent, completed, critical, total: reports.length, todayCount: todayReports.length };
  }, [reports]);

  const filteredReports = reports.filter(report => {
    const patient = patients.find(p => p.id === report.patientId);
    const exam = exams.find(e => e.id === report.examId);
    const matchSearch =
      report.accessionNumber.includes(searchTerm) ||
      patient?.name.includes(searchTerm) ||
      report.examItemName.includes(searchTerm) ||
      report.radiologist.includes(searchTerm);
    const matchStatus = statusFilter === '全部' || report.status === statusFilter;
    const matchModality = modalityFilter === '全部' || report.modality === modalityFilter;
    return matchSearch && matchStatus && matchModality;
  });

  const getPatient = (patientId: string) => patients.find(p => p.id === patientId);
  const getExam = (examId: string) => exams.find(e => e.id === examId);
  const getReport = (reportId: string) => reports.find(r => r.id === reportId);

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '-';
    try {
      const d = new Date(timeStr);
      return d.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    } catch { return timeStr; }
  };

  const handleWriteReport = (reportId: string) => {
    navigate(`/reports/write/${reportId}`);
  };

  // Check for critical values in findings or impression
  const detectedCriticalValues = useMemo(() => {
    const text = `${findings} ${impression}`;
    return CRITICAL_VALUE_KEYWORDS.filter(kw => {
      if (/[<>]/.test(kw)) {
        return new RegExp(kw).test(text);
      }
      return text.includes(kw);
    });
  }, [findings, impression]);

  // Get exam items for template selection
  const examItemsForTemplate = useMemo(() => {
    const pendingReportExamIds = reports
      .filter(r => r.status === '待书写')
      .map(r => r.examId);
    const items = exams.filter((e: Exam) => pendingReportExamIds.includes(e.id) || e.status === '已完成');
    return items.map(e => {
      const examItem = initialExamItems.find(i => i.id === e.examItemId);
      const patient = patients.find(p => p.id === e.patientId);
      const report = reports.find(r => r.examId === e.id);
      return {
        ...e,
        examItem,
        patient,
        report,
        displayName: `${patient?.name || '未知'} - ${e.examItemName} (${e.accessionNumber})`,
      };
    });
  }, [exams, patients, reports]);

  // Selected report for writing
  const writingReport = useMemo(() => {
    if (!selectedReportId) return null;
    return getReport(selectedReportId);
  }, [selectedReportId, reports]);

  const writingPatient = useMemo(() => {
    if (!writingReport) return null;
    return getPatient(writingReport.patientId);
  }, [writingReport, patients]);

  const writingExam = useMemo(() => {
    if (!writingReport) return null;
    return getExam(writingReport.examId);
  }, [writingReport, exams]);

  // Handle template selection
  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const template = reportTemplates.find(t => t.id === templateId);
    if (template) {
      // P0-5: Confirm before overwriting existing content
      if (findings && findings.length > 50 && template.examination) {
        const ok = window.confirm(`选择模板将覆盖当前已填写的报告内容（当前${findings.length}字），是否继续？`);
        if (!ok) return;
      }
      setFindings(template.examination);
      setImpression(template.normalImpression);
    }
  };

  // Handle insert template fragment
  const handleInsertFragment = (field: 'findings' | 'impression' | 'suggestion', text: string) => {
    if (field === 'findings') {
      setFindings(prev => prev + (prev ? '\n' : '') + text);
    } else if (field === 'impression') {
      setImpression(prev => prev + (prev ? '\n' : '') + text);
    } else {
      setSuggestion(prev => prev + (prev ? '\n' : '') + text);
    }
  };

  // Handle critical value report
  const handleCriticalValueReport = () => {
    if (detectedCriticalValues.length === 0) return;
    setPendingCriticalValue(detectedCriticalValues.join('、'));
    setShowCriticalModal(true);
  };

  const confirmCriticalValueReport = () => {
    // P0-2: 实际上报危急值并标记 report.criticalValue
    if (selectedReportId) {
      setReports(prev => prev.map(r =>
        r.id === selectedReportId ? { ...r, criticalValue: pendingCriticalValue } : r
      ));
    }
    console.log('Critical value reported:', pendingCriticalValue, 'for report:', selectedReportId);
    setShowCriticalModal(false);
    setPendingCriticalValue('');
    alert(`危急值「${pendingCriticalValue}」已上报！`);
  };

  // Preview content
  const previewContent = useMemo(() => ({
    patient: writingPatient ? {
      name: writingPatient.name,
      gender: writingPatient.gender,
      age: writingPatient.age,
      medicalRecordNo: writingPatient.medicalRecordNo,
    } : null,
    exam: writingExam ? {
      accessionNumber: writingExam.accessionNumber,
      examItemName: writingExam.examItemName,
      modality: writingExam.modality,
      clinicalDiagnosis: writingExam.clinicalDiagnosis,
    } : null,
    findings,
    impression,
    suggestion,
    hasCriticalValue: detectedCriticalValues.length > 0,
    criticalValues: detectedCriticalValues,
  }), [writingPatient, writingExam, findings, impression, suggestion, detectedCriticalValues]);

  // Handle report selection change
  const handleReportChange = (reportId: string) => {
    setSelectedReportId(reportId);
    setFindings('');
    setImpression('');
    setSuggestion('');
    setSelectedTemplateId('');
  };

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case '待书写': return <Badge type="yellow">待书写</Badge>;
      case '待审核': return <Badge type="blue">待审核</Badge>;
      case '已完成': return <Badge type="green">已完成</Badge>;
      case '已发布': return <Badge type="green">已发布</Badge>;
      default: return <Badge type="gray">{status}</Badge>;
    }
  };

  return (
    <div>
      <PageTitle>
        <FileText size={28} />
        报告管理
      </PageTitle>

      {/* Tab切换 */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', borderBottom: '2px solid #e2e8f0', paddingBottom: '0' }}>
        <button
          style={{
            padding: '10px 20px', cursor: 'pointer', fontSize: '14px', fontWeight: 500,
            color: activeTab === 'list' ? '#2563eb' : '#64748b',
            borderBottom: activeTab === 'list' ? '2px solid #2563eb' : '2px solid transparent',
            marginBottom: '-2px', backgroundColor: 'transparent', border: 'none', borderRadius: '8px 8px 0 0',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}
          onClick={() => setActiveTab('list')}
        >
          <Search size={16} />
          报告查询
        </button>
        <button
          style={{
            padding: '10px 20px', cursor: 'pointer', fontSize: '14px', fontWeight: 500,
            color: activeTab === 'write' ? '#2563eb' : '#64748b',
            borderBottom: activeTab === 'write' ? '2px solid #2563eb' : '2px solid transparent',
            marginBottom: '-2px', backgroundColor: 'transparent', border: 'none', borderRadius: '8px 8px 0 0',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}
          onClick={() => setActiveTab('write')}
        >
          <Edit3 size={16} />
          报告书写
        </button>
      </div>

      {activeTab === 'list' ? (
        <>
          {/* 统计卡片 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <Card style={{ borderLeft: '4px solid #f59e0b' }}>
              <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '6px' }}>待书写报告</div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#1e293b' }}>{stats.pending}</div>
              <div style={{ fontSize: '12px', color: '#f59e0b', marginTop: '4px' }}>
                {stats.urgent > 0 && `含${stats.urgent}例急诊`}
              </div>
            </Card>
            <Card style={{ borderLeft: '4px solid #ef4444' }}>
              <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '6px' }}>危急值待处理</div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#1e293b' }}>{stats.critical}</div>
              <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>需立即通知临床</div>
            </Card>
            <Card style={{ borderLeft: '4px solid #10b981' }}>
              <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '6px' }}>今日完成</div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#1e293b' }}>{stats.todayCount}</div>
              <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>份报告</div>
            </Card>
            <Card style={{ borderLeft: '4px solid #2563eb' }}>
              <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '6px' }}>报告总数</div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#1e293b' }}>{stats.total}</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>份记录</div>
            </Card>
          </div>

          <Card>
            {/* 搜索过滤 */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', color: '#94a3b8', pointerEvents: 'none' }} />
                <input
                  type="text"
                  placeholder="搜索报告号、患者姓名、检查项目、报告医师..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ ...S.searchInput, paddingLeft: '38px' }}
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ReportStatus | '全部')}
                style={S.select}
              >
                <option value="全部">全部状态</option>
                <option value="待书写">待书写</option>
                <option value="待审核">待审核</option>
                <option value="已完成">已完成</option>
                <option value="已发布">已发布</option>
              </select>
              <select
                value={modalityFilter}
                onChange={(e) => setModalityFilter(e.target.value)}
                style={S.select}
              >
                <option value="全部">全部模态</option>
                <option value="CT">CT</option>
                <option value="MR">MR</option>
                <option value="DR">DR</option>
                <option value="超声">超声</option>
                <option value="乳腺钼靶">乳腺钼靶</option>
              </select>
              <div style={{ display: 'flex', gap: '4px', marginLeft: 'auto' }}>
                <button
                  onClick={() => setViewMode('table')}
                  style={{
                    ...S.btnSecondary, padding: '8px 16px',
                    backgroundColor: viewMode === 'table' ? '#2563eb' : '#f1f5f9',
                    color: viewMode === 'table' ? 'white' : '#64748b',
                  }}
                >
                  表格
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  style={{
                    ...S.btnSecondary, padding: '8px 16px',
                    backgroundColor: viewMode === 'cards' ? '#2563eb' : '#f1f5f9',
                    color: viewMode === 'cards' ? 'white' : '#64748b',
                  }}
                >
                  卡片
                </button>
              </div>
            </div>

            {/* 表格视图 */}
            {viewMode === 'table' ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={S.table}>
                  <thead>
                    <tr>
                      <th style={S.th}>状态</th>
                      <th style={S.th}>患者姓名</th>
                      <th style={S.th}>检查项目</th>
                      <th style={S.th}>模态</th>
                      <th style={S.th}>报告医师</th>
                      <th style={S.th}>报告时间</th>
                      <th style={S.th}>危急值</th>
                      <th style={S.th}>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReports.map(report => {
                      const patient = getPatient(report.patientId);
                      return (
                        <tr
                          key={report.id}
                          style={hoveredReport === report.id ? S.trHover : {}}
                          onMouseEnter={() => setHoveredReport(report.id)}
                          onMouseLeave={() => setHoveredReport(null)}
                        >
                          <td style={S.td}>{getStatusBadge(report.status)}</td>
                          <td style={S.td}>
                            <div style={{ fontWeight: 500, color: '#1e293b' }}>{patient?.name || '-'}</div>
                            <div style={{ fontSize: '12px', color: '#94a3b8' }}>{patient?.medicalRecordNo || ''}</div>
                          </td>
                          <td style={S.td}>
                            <div style={{ color: '#374151' }}>{report.examItemName}</div>
                            <div style={{ fontSize: '12px', color: '#94a3b8' }}>{report.accessionNumber}</div>
                          </td>
                          <td style={S.td}>
                            <span style={{
                              padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600,
                              color: 'white', backgroundColor: modalityColors[report.modality] || '#6b7280',
                            }}>
                              {report.modality}
                            </span>
                          </td>
                          <td style={S.td}><div style={{ color: '#374151' }}>{report.radiologist || '-'}</div></td>
                          <td style={S.td}><div style={{ color: '#64748b', fontSize: '13px' }}>{formatTime(report.reportTime || '')}</div></td>
                          <td style={S.td}>
                            {report.criticalValue ? (
                              <Badge type="red">危急值</Badge>
                            ) : report.isUrgent ? (
                              <Badge type="yellow">急诊</Badge>
                            ) : '-'}
                          </td>
                          <td style={S.td}>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button style={S.btnSmall} onClick={() => handleWriteReport(report.id)}>
                                <Eye size={12} /> 查看
                              </button>
                              {report.status === '待书写' && (
                                <button style={{ ...S.btnSmall, backgroundColor: '#2563eb', color: 'white' }} onClick={() => handleWriteReport(report.id)}>
                                  <Edit3 size={12} /> 书写
                                </button>
                              )}
                              <button style={S.btnSmall}>
                                <Printer size={12} /> 打印
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filteredReports.length === 0 && (
                  <div style={S.emptyState}>暂无报告数据</div>
                )}
              </div>
            ) : (
              /* 卡片视图 */
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                {filteredReports.map(report => {
                  const patient = getPatient(report.patientId);
                  return (
                    <div
                      key={report.id}
                      style={{
                        padding: '16px', border: '1px solid #e5e7eb', borderRadius: '10px',
                        marginBottom: '12px', cursor: 'pointer', transition: 'all 0.2s',
                        backgroundColor: 'white',
                        borderLeft: `4px solid ${report.status === '待书写' ? '#f59e0b' : report.status === '待审核' ? '#7c3aed' : '#10b981'}`,
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLDivElement).style.borderColor = '#2563eb';
                        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 12px rgba(37,99,235,0.1)';
                        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLDivElement).style.borderColor = '#e5e7eb';
                        (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                        (e.currentTarget as HTMLDivElement).style.transform = 'none';
                      }}
                      onClick={() => handleWriteReport(report.id)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                          <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '15px' }}>{patient?.name || '-'}</div>
                          <div style={{ fontSize: '12px', color: '#94a3b8' }}>{patient?.medicalRecordNo}</div>
                        </div>
                        {getStatusBadge(report.status)}
                      </div>
                      <div style={{ fontSize: '14px', color: '#374151', marginBottom: '8px' }}>{report.examItemName}</div>
                      <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#64748b' }}>
                        <span style={{
                          padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 600,
                          color: 'white', backgroundColor: modalityColors[report.modality] || '#6b7280',
                        }}>
                          {report.modality}
                        </span>
                        <span>{report.accessionNumber}</span>
                      </div>
                      {report.criticalValue && (
                        <div style={{ marginTop: '8px' }}>
                          <Badge type="red">危急值: {report.criticalValue}</Badge>
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: '6px', marginTop: '12px' }}>
                        <button style={S.btnSmall} onClick={(e) => { e.stopPropagation(); handleWriteReport(report.id); }}>
                          <Eye size={12} /> 查看
                        </button>
                        {report.status === '待书写' && (
                          <button style={{ ...S.btnSmall, backgroundColor: '#2563eb', color: 'white' }} onClick={(e) => { e.stopPropagation(); handleWriteReport(report.id); }}>
                            <Edit3 size={12} /> 书写
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </>
      ) : (
        /* 报告书写 Tab */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px' }}>
          {/* 左侧：检查列表和报告编辑器 */}
          <div>
            <Card>
              <SectionTitle>选择检查</SectionTitle>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', color: '#94a3b8', pointerEvents: 'none' }} />
                  <input
                    type="text"
                    placeholder="搜索检查..."
                    style={{ ...S.searchInput, paddingLeft: '38px' }}
                  />
                </div>
              </div>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {examItemsForTemplate.length === 0 ? (
                  <div style={S.emptyState}>暂无待书写报告</div>
                ) : examItemsForTemplate.map(item => (
                  <div
                    key={item.id}
                    style={{
                      padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '8px',
                      cursor: 'pointer', backgroundColor: selectedReportId === item.report?.id ? '#eff6ff' : 'white',
                      borderColor: selectedReportId === item.report?.id ? '#2563eb' : '#e5e7eb',
                    }}
                    onClick={() => item.report && handleReportChange(item.report.id)}
                  >
                    <div style={{ fontWeight: 500, color: '#1e293b' }}>{item.displayName}</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                      {item.examItemName} · {item.report?.radiologist || '未分配'}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {writingReport && (
              <Card style={{ marginTop: '20px' }}>
                <SectionTitle>检查所见</SectionTitle>
                <textarea
                  value={findings}
                  onChange={(e) => setFindings(e.target.value)}
                  placeholder="请填写检查所见..."
                  style={{ ...S.input, minHeight: '120px', resize: 'vertical', width: '100%', marginBottom: '16px' }}
                />
                <SectionTitle>诊断意见</SectionTitle>
                <textarea
                  value={impression}
                  onChange={(e) => setImpression(e.target.value)}
                  placeholder="请填写诊断意见..."
                  style={{ ...S.input, minHeight: '100px', resize: 'vertical', width: '100%', marginBottom: '16px' }}
                />
                <SectionTitle>建议</SectionTitle>
                <textarea
                  value={suggestion}
                  onChange={(e) => setSuggestion(e.target.value)}
                  placeholder="请填写建议..."
                  style={{ ...S.input, minHeight: '80px', resize: 'vertical', width: '100%' }}
                />
                {detectedCriticalValues.length > 0 && (
                  <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#fef2f2', border: '2px solid #ef4444', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertTriangle size={16} color="#dc2626" />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#dc2626' }}>
                      检测到危急值关键词: {detectedCriticalValues.join('、')}
                    </span>
                    <button
                      onClick={handleCriticalValueReport}
                      style={{ ...S.btnSmall, backgroundColor: '#dc2626', color: 'white', marginLeft: 'auto' }}
                    >
                      上报危急值
                    </button>
                  </div>
                )}
              </Card>
            )}
          </div>

          {/* 右侧：患者信息和模板 */}
          <div>
            {writingReport && writingPatient && (
              <Card style={{ marginBottom: '20px' }}>
                <SectionTitle>患者信息</SectionTitle>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>姓名</div>
                    <div style={{ fontWeight: 500, color: '#1e293b' }}>{writingPatient.name}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>性别/年龄</div>
                    <div style={{ fontWeight: 500, color: '#1e293b' }}>{writingPatient.gender} / {writingPatient.age}岁</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>病历号</div>
                    <div style={{ fontWeight: 500, color: '#1e293b' }}>{writingPatient.medicalRecordNo}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>检查项目</div>
                    <div style={{ fontWeight: 500, color: '#1e293b' }}>{writingReport.examItemName}</div>
                  </div>
                </div>
              </Card>
            )}

            <Card>
              <SectionTitle>报告模板</SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {reportTemplates.filter(t => !selectedReportId || t.modality === writingReport?.modality).map(template => (
                  <button
                    key={template.id}
                    style={{
                      padding: '10px 14px', borderRadius: '8px', border: '1px solid #e5e7eb',
                      backgroundColor: selectedTemplateId === template.id ? '#2563eb' : 'white',
                      color: selectedTemplateId === template.id ? 'white' : '#475569',
                      cursor: 'pointer', textAlign: 'left', fontSize: '13px',
                      display: 'flex', alignItems: 'center', gap: '8px',
                    }}
                    onClick={() => handleTemplateSelect(template.id)}
                  >
                    <FileText size={14} />
                    {template.examItemName}
                  </button>
                ))}
              </div>
            </Card>

            {writingReport && (
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <SecondaryBtn style={{ flex: 1 }} onClick={() => {
                  // P0-2: 保存草稿
                  if (selectedReportId) {
                    setReports(prev => prev.map(r =>
                      r.id === selectedReportId
                        ? { ...r, findings, impression, suggestion, status: (r.status === '待书写' ? '草稿' : r.status) as ReportStatus }
                        : r
                    ));
                  }
                  alert('报告已保存');
                }}>
                  保存草稿
                </SecondaryBtn>
                <PrimaryBtn style={{ flex: 1 }} onClick={() => {
                  // P0-2: 提交审核
                  if (!findings.trim() || !impression.trim()) {
                    alert('请填写检查所见和诊断意见');
                    return;
                  }
                  if (selectedReportId) {
                    setReports(prev => prev.map(r =>
                      r.id === selectedReportId
                        ? { ...r, findings, impression, suggestion, status: '待审核' as ReportStatus }
                        : r
                    ));
                  }
                  alert('报告已提交审核');
                }}>
                  提交审核
                </PrimaryBtn>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 危急值弹窗 */}
      {showCriticalModal && (
        <div style={S.modalOverlay}>
          <div style={S.modal}>
            <div style={S.modalTitle}>
              <AlertTriangle size={20} color="#dc2626" />
              危急值上报确认
            </div>
            <div style={{ marginBottom: '20px' }}>
              <p style={{ color: '#374151', marginBottom: '12px' }}>
                检测到以下危急值关键词，是否确认上报？
              </p>
              <div style={{ padding: '12px', backgroundColor: '#fef2f2', borderRadius: '8px', color: '#dc2626', fontWeight: 600 }}>
                {pendingCriticalValue}
              </div>
            </div>
            <div style={S.modalFooter}>
              <SecondaryBtn onClick={() => setShowCriticalModal(false)}>取消</SecondaryBtn>
              <PrimaryBtn onClick={confirmCriticalValueReport}>确认上报</PrimaryBtn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
