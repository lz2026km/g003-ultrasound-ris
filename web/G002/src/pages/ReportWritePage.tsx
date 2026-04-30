import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileText, Search, Clock, AlertTriangle, CheckCircle,
  Edit3, Eye, Printer, X, Bold, List, Plus, Save,
} from 'lucide-react';
import { Badge, PrimaryBtn, SecondaryBtn, PageTitle, Card, SectionTitle } from '../App';
import {
  initialReports, initialPatients, initialExams, initialExamItems,
  reportTemplates,
} from '../data/initialData';
import type { Report, ReportStatus, Exam, Patient, ExamItem } from '../types';
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
  '脑出血', '脑疝', '肺栓塞', '心包填塞', '张力性气胸', '主动脉夹层', '急性心肌梗死',
];

export default function ReportWritePage() {
  const { id: reportId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // P0-2: 本地 reports 状态，支持完整状态机流转
  const { reports, setReports } = useReports();
  const [currentReport, setCurrentReport] = useState<Report | null>(null);

  const [findings, setFindings] = useState('');
  const [impression, setImpression] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [showCriticalModal, setShowCriticalModal] = useState(false);
  const [pendingCriticalValue, setPendingCriticalValue] = useState<string>('');

  // P0-2: 从本地状态查找报告，禁止直接引用 initialReports
  const report = currentReport;

  // P0-2: 初始化 currentReport
  useEffect(() => {
    const found = reports.find(r => r.id === reportId);
    if (found) {
      setCurrentReport(found);
      setFindings(found.findings || '');
      setImpression(found.impression || '');
      setSuggestion(found.suggestion || '');
    }
  }, [reportId, reports]);

  const patient = report ? initialPatients.find(p => p.id === report.patientId) : null;
  const exam = report ? initialExams.find(e => e.id === report.examId) : null;
  const examItem = exam ? initialExamItems.find(i => i.id === exam.examItemId) : null;

  // Check for critical values — P0-2: 自动标记危急值
  const detectedCriticalValues = useMemo(() => {
    const text = `${findings} ${impression}`;
    return CRITICAL_VALUE_KEYWORDS.filter(kw => text.includes(kw));
  }, [findings, impression]);

  // P0-2: 检测到危急值时自动设置 criticalValue 标记
  useEffect(() => {
    if (detectedCriticalValues.length > 0 && currentReport && !currentReport.criticalValue) {
      const val = detectedCriticalValues[0];
      setCurrentReport(prev => prev ? { ...prev, criticalValue: val } : null);
    }
  }, [detectedCriticalValues]);

  // Templates filtered by modality
  const filteredTemplates = useMemo(() => {
    if (!report) return reportTemplates;
    return reportTemplates.filter(t => !t.modality || t.modality === report.modality);
  }, [report]);

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

  const handleCriticalValueReport = () => {
    if (detectedCriticalValues.length === 0) return;
    setPendingCriticalValue(detectedCriticalValues.join('、'));
    setShowCriticalModal(true);
  };

  const confirmCriticalValueReport = () => {
    // P0-2: 实际上报危急值并标记 report.criticalValue
    if (currentReport) {
      setReports(prev => prev.map(r =>
        r.id === currentReport.id ? { ...r, criticalValue: pendingCriticalValue } : r
      ));
      setCurrentReport(prev => prev ? { ...prev, criticalValue: pendingCriticalValue } : null);
    }
    console.log('Critical value reported:', pendingCriticalValue, 'for report:', reportId);
    setShowCriticalModal(false);
    alert(`危急值「${pendingCriticalValue}」已上报！`);
  };

  const handleSaveDraft = () => {
    // P0-2: 保存草稿到本地状态
    if (!currentReport) return;
    setReports(prev => prev.map(r =>
      r.id === currentReport.id
        ? { ...r, findings, impression, suggestion, status: (r.status === '待书写' ? '草稿' : r.status) as ReportStatus }
        : r
    ));
    setCurrentReport(prev => prev ? { ...prev, findings, impression, suggestion } : null);
    alert('报告已保存');
  };

  const handleSubmitForReview = () => {
    if (!findings.trim() || !impression.trim()) {
      alert('请填写检查所见和诊断意见');
      return;
    }
    // P0-2: 实际更新状态为待审核
    if (currentReport) {
      setReports(prev => prev.map(r =>
        r.id === currentReport.id
          ? { ...r, findings, impression, suggestion, status: '待审核' as ReportStatus }
          : r
      ));
      setCurrentReport(prev => prev ? { ...prev, findings, impression, suggestion, status: '待审核' as ReportStatus } : null);
    }
    alert('报告已提交审核');
    navigate('/reports');
  };

  const handleBack = () => {
    navigate('/reports');
  };

  // Format date
  const formatDateTime = (str: string) => {
    if (!str) return '-';
    try {
      const d = new Date(str);
      return d.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    } catch { return str; }
  };

  if (!report || !patient || !exam) {
    return (
      <div>
        <PageTitle>
          <FileText size={28} />
          报告书写
        </PageTitle>
        <Card>
          <div style={S.emptyState}>未找到对应的报告记录</div>
          <div style={{ marginTop: '16px' }}>
            <SecondaryBtn onClick={handleBack}>返回报告列表</SecondaryBtn>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageTitle>
        <FileText size={28} />
        报告书写
        {report.isUrgent && <Badge type="red">急诊</Badge>}
      </PageTitle>

      {/* P0-2: 危急值已标记Banner */}
      {currentReport?.criticalValue && (
        <div style={{ background: '#fff2f0', border: '1px solid #ffccc7', borderRadius: 6, padding: '10px 16px', marginBottom: 12, color: '#cf1322', fontSize: 14 }}>
          ⚠️ 危急值提醒：报告内容包含危急值关键词，已自动标记，请确认后及时上报。
        </div>
      )}

      {/* P0-2: 已发布报告禁止编辑 */}
      {currentReport?.status === '已发布' && (
        <Card style={{ marginBottom: 20, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#64748b' }}>
            <CheckCircle size={18} />
            <span style={{ fontSize: 14, fontWeight: 600 }}>此报告已发布，仅供查看。如需修改请联系审核医师驳回。</span>
          </div>
        </Card>
      )}

      {/* 报告信息卡片 */}
      <Card style={{ marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>患者姓名</div>
            <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '15px' }}>{patient.name}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>性别/年龄</div>
            <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '15px' }}>{patient.gender} / {patient.age}岁</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>病历号</div>
            <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '15px' }}>{patient.medicalRecordNo}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>检查项目</div>
            <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '15px' }}>{exam.examItemName}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>检查设备</div>
            <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '15px' }}>{exam.modality}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>预约号</div>
            <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '15px' }}>{exam.accessionNumber}</div>
          </div>
        </div>
        {exam.clinicalDiagnosis && (
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>临床诊断</div>
            <div style={{ color: '#374151', fontSize: '14px' }}>{exam.clinicalDiagnosis}</div>
          </div>
        )}
      </Card>

      {/* 左右分栏布局 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px' }}>
        {/* 左侧：报告编辑器 */}
        <div>
          <Card>
            <SectionTitle>检查所见</SectionTitle>
            <textarea
              value={findings}
              onChange={(e) => setFindings(e.target.value)}
              placeholder="请填写检查所见..."
              readOnly={currentReport?.status === '已发布'}
              style={{ ...S.input, minHeight: '160px', resize: 'vertical', width: '100%', marginBottom: '20px', fontFamily: "'Segoe UI', 'Microsoft YaHei', system-ui, sans-serif", lineHeight: 1.8, ...(currentReport?.status === '已发布' ? { backgroundColor: '#f8fafc', color: '#64748b' } : {}) }}
            />

            <SectionTitle>诊断意见</SectionTitle>
            <textarea
              value={impression}
              onChange={(e) => setImpression(e.target.value)}
              placeholder="请填写诊断意见..."
              readOnly={currentReport?.status === '已发布'}
              style={{ ...S.input, minHeight: '120px', resize: 'vertical', width: '100%', marginBottom: '20px', fontFamily: "'Segoe UI', 'Microsoft YaHei', system-ui, sans-serif", lineHeight: 1.8, ...(currentReport?.status === '已发布' ? { backgroundColor: '#f8fafc', color: '#64748b' } : {}) }}
            />

            <SectionTitle>建议</SectionTitle>
            <textarea
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              placeholder="请填写建议..."
              readOnly={currentReport?.status === '已发布'}
              style={{ ...S.input, minHeight: '80px', resize: 'vertical', width: '100%', fontFamily: "'Segoe UI', 'Microsoft YaHei', system-ui, sans-serif", lineHeight: 1.8, ...(currentReport?.status === '已发布' ? { backgroundColor: '#f8fafc', color: '#64748b' } : {}) }}
            />

            {/* 危急值提示 */}
            {detectedCriticalValues.length > 0 && (
              <div style={{ marginTop: '16px', padding: '14px', backgroundColor: '#fef2f2', border: '2px solid #ef4444', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertTriangle size={18} color="#dc2626" />
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#dc2626' }}>
                    检测到危急值关键词: {detectedCriticalValues.join('、')}
                  </span>
                </div>
                <button
                  onClick={handleCriticalValueReport}
                  style={{ ...S.btnDanger, backgroundColor: '#dc2626', color: 'white', borderColor: '#dc2626' }}
                >
                  上报危急值
                </button>
              </div>
            )}
          </Card>

          {/* 底部操作按钮 — P0-2: 已发布报告隐藏保存/提交 */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <SecondaryBtn style={{ flex: 1 }} onClick={handleBack}>
              <X size={16} />
              取消
            </SecondaryBtn>
            {currentReport?.status !== '已发布' && (
              <>
                <SecondaryBtn style={{ flex: 1 }} onClick={handleSaveDraft}>
                  <Save size={16} />
                  保存草稿
                </SecondaryBtn>
                <PrimaryBtn style={{ flex: 2 }} onClick={handleSubmitForReview}>
                  <CheckCircle size={16} />
                  提交审核
                </PrimaryBtn>
              </>
            )}
          </div>
        </div>

        {/* 右侧：模板选择 */}
        <div>
          <Card style={{ marginBottom: '20px' }}>
            <SectionTitle>选择模板</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filteredTemplates.map(template => (
                <button
                  key={template.id}
                  style={{
                    padding: '12px 14px', borderRadius: '8px',
                    border: `1px solid ${selectedTemplateId === template.id ? '#2563eb' : '#e5e7eb'}`,
                    backgroundColor: selectedTemplateId === template.id ? '#eff6ff' : 'white',
                    color: selectedTemplateId === template.id ? '#2563eb' : '#475569',
                    cursor: 'pointer', textAlign: 'left', fontSize: '13px',
                    display: 'flex', alignItems: 'center', gap: '10px',
                    transition: 'all 0.15s',
                  }}
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  <FileText size={14} />
                  <div>
                    <div style={{ fontWeight: 500 }}>{template.examItemName}</div>
                    {template.modality && (
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{template.modality}</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <SectionTitle>快捷短语</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                { label: '未见明显异常', field: 'impression' as const },
                { label: '建议定期复查', field: 'suggestion' as const },
                { label: '请结合临床', field: 'suggestion' as const },
                { label: '未见外伤', field: 'findings' as const },
              ].map((item, idx) => (
                <button
                  key={idx}
                  style={{
                    padding: '8px 12px', borderRadius: '6px',
                    border: '1px solid #e5e7eb', backgroundColor: 'white',
                    color: '#475569', cursor: 'pointer', textAlign: 'left',
                    fontSize: '12px', transition: 'all 0.15s',
                  }}
                  onClick={() => {
                    if (item.field === 'findings') {
                      setFindings(prev => prev + (prev ? '\n' : '') + item.label);
                    } else if (item.field === 'impression') {
                      setImpression(prev => prev + (prev ? '\n' : '') + item.label);
                    } else {
                      setSuggestion(prev => prev + (prev ? '\n' : '') + item.label);
                    }
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>

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
              <div style={{ padding: '14px', backgroundColor: '#fef2f2', borderRadius: '8px', color: '#dc2626', fontWeight: 600, fontSize: '15px' }}>
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
