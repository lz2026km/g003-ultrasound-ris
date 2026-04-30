import React, { useState, useMemo } from 'react';
import { FileCheck, FileX, Clock, CheckCircle, XCircle, History, Filter, MessageSquare } from 'lucide-react';
import { Badge, PrimaryBtn, SecondaryBtn, PageTitle, Card } from '../App';
import { initialReportAuditRecords, initialReports } from '../data/initialData';
import type { Report, ReportStatus } from '../types';

const S: Record<string, React.CSSProperties> = {
  filterGroup: { display: 'flex', gap: '8px', flexWrap: 'wrap' as const },
  filterTag: { padding: '6px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', border: '1px solid #e2e8f0', backgroundColor: 'white', color: '#475569' },
  filterTagActive: { backgroundColor: '#1d4ed8', color: 'white', borderColor: '#1d4ed8' },
  table: { width: '100%', borderCollapse: 'collapse' as const, fontSize: '14px', color: '#1e293b' },
  th: { textAlign: 'left' as const, padding: '12px 16px', backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', fontSize: '13px', fontWeight: 700, color: '#475569' },
  td: { padding: '13px 16px', borderBottom: '1px solid #f1f5f9', verticalAlign: 'middle' as const },
  trHover: { backgroundColor: '#f8fafc' },
  toolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '16px' },
  toolbarLeft: { display: 'flex', gap: '10px', alignItems: 'center', flex: 1 },
  modalOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' },
  modal: { backgroundColor: 'white', borderRadius: '16px', padding: '28px', minWidth: '500px', maxWidth: '600px', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' },
  modalTitle: { fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' },
  input: { backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '9px 14px', fontSize: '14px', color: '#1e293b', outline: 'none', width: '100%' },
  textarea: { backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '9px 14px', fontSize: '14px', color: '#1e293b', outline: 'none', width: '100%', minHeight: '100px', resize: 'vertical' as const },
  formGroup: { marginBottom: '16px' },
  formLabel: { display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' },
  historyItem: { padding: '14px', borderBottom: '1px solid #f1f5f9' },
  historyItemLast: { borderBottom: 'none' },
  statCard: { display: 'flex', alignItems: 'center', gap: '12px' },
  badgeGreen: { backgroundColor: '#f0fdf4', color: '#16a34a' },
  badgeYellow: { backgroundColor: '#fffbeb', color: '#d97706' },
  badgeRed: { backgroundColor: '#fef2f2', color: '#dc2626' },
};

type AuditFilter = '全部' | '通过' | '修改' | '驳回';
type ModalType = 'approve' | 'reject' | null;

export default function AuditCenterPage() {
  const [activeFilter, setActiveFilter] = useState<AuditFilter>('全部');
  const [showModal, setShowModal] = useState<ModalType>(null);
  const [selectedRecord, setSelectedRecord] = useState<typeof initialReportAuditRecords[0] | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [auditOpinion, setAuditOpinion] = useState(''); // P0-10: 审核意见（通过时用）

  // P0-9: 本地状态管理审核记录，支持审核操作后状态更新
  const [auditRecords, setAuditRecords] = useState(initialReportAuditRecords);

  // P0-2: 本地 reports 状态，支持审核通过/驳回时更新报告状态
  const [reports, setReports] = useState<Report[]>(initialReports);

  const stats = useMemo(() => {
    const total = auditRecords.length;
    const passed = auditRecords.filter(r => r.auditResult === '通过').length;
    const modified = auditRecords.filter(r => r.auditResult === '修改').length;
    const rejected = auditRecords.filter(r => r.auditResult === '驳回').length;
    return { total, passed, modified, rejected };
  }, [auditRecords]);

  const filteredRecords = useMemo(() => {
    if (activeFilter === '全部') return auditRecords;
    return auditRecords.filter(r => r.auditResult === activeFilter);
  }, [activeFilter, auditRecords]);

  const handleApprove = (record: typeof initialReportAuditRecords[0]) => {
    setSelectedRecord(record);
    setShowModal('approve');
  };

  const handleReject = (record: typeof initialReportAuditRecords[0]) => {
    setSelectedRecord(record);
    setShowModal('reject');
    setRejectReason('');
  };

  const handleModalConfirm = () => {
    if (!selectedRecord) return;
    // P0-9: 实际更新审核记录状态
    // P0-2: 同时更新报告状态
    const newResult = showModal === 'approve' ? '通过' : '驳回';
    const opinion = showModal === 'approve' ? auditOpinion : rejectReason;
    const reportId = selectedRecord.reportId || selectedRecord.id.replace('audit_', '');

    setAuditRecords(prev => prev.map(r =>
      r.id === selectedRecord.id
        ? { ...r, auditResult: newResult as '通过' | '驳回', modifyReason: opinion }
        : r
    ));

    if (reportId && reports.find(r => r.id === reportId)) {
      setReports(prev => prev.map(r =>
        r.id === reportId
          ? { ...r, status: newResult === '通过' ? '已发布' as ReportStatus : '已驳回' as ReportStatus }
          : r
      ));
    }

    setShowModal(null);
    setSelectedRecord(null);
    setRejectReason('');
    setAuditOpinion('');
  };

  const handleModalCancel = () => {
    setShowModal(null);
    setSelectedRecord(null);
    setRejectReason('');
    setAuditOpinion('');
  };

  // 导出审计记录CSV
  const handleExport = () => {
    const headers = ['患者姓名', '检查项目', '模态', '报告医师', '审核医师', '审核时间', '审核结果', '修改原因'];
    const rows = filteredRecords.map(r => [
      r.patientName, r.examItemName, r.modality,
      r.authorName, r.auditorName,
      r.auditTime.slice(0, 16).replace('T', ' '),
      r.auditResult, r.modifyReason || ''
    ]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_records_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <PageTitle>
        <FileCheck size={28} />
        审核中心
        <span style={{ fontSize: '14px', fontWeight: 400, color: '#64748b', marginLeft: '8px' }}>
          报告审核与历史记录
        </span>
      </PageTitle>

      {/* 统计卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: '审核总数', value: stats.total, icon: <FileCheck size={20} />, color: '#2563eb', bg: '#dbeafe' },
          { label: '通过', value: stats.passed, icon: <CheckCircle size={20} />, color: '#10b981', bg: '#d1fae5' },
          { label: '修改', value: stats.modified, icon: <FileCheck size={20} />, color: '#d97706', bg: '#fef3c7' },
          { label: '驳回', value: stats.rejected, icon: <XCircle size={20} />, color: '#dc2626', bg: '#fef2f2' },
        ].map(stat => (
          <Card key={stat.label}>
            <div style={S.statCard}>
              <div style={{ padding: '10px', backgroundColor: stat.bg, borderRadius: '8px' }}>
                <div style={{ color: stat.color }}>{stat.icon}</div>
              </div>
              <div>
                <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '2px' }}>{stat.label}</div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b' }}>{stat.value}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* 筛选标签 */}
      <Card>
        <div style={S.toolbar}>
          <div style={S.toolbarLeft}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '8px' }}>
              <Filter size={16} color="#64748b" />
              <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>筛选</span>
            </div>
            <div style={S.filterGroup}>
              {(['全部', '通过', '修改', '驳回'] as AuditFilter[]).map(filter => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  style={{
                    ...S.filterTag,
                    ...(activeFilter === filter ? S.filterTagActive : {}),
                  }}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <SecondaryBtn onClick={handleExport}>
              <History size={15} />
              导出记录
            </SecondaryBtn>
          </div>
        </div>

        {/* 审核记录表格 */}
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>患者姓名</th>
              <th style={S.th}>检查项目</th>
              <th style={S.th}>报告医师</th>
              <th style={S.th}>审核医师</th>
              <th style={S.th}>审核时间</th>
              <th style={S.th}>审核结果</th>
              <th style={S.th}>修改原因</th>
              <th style={{ ...S.th, width: '160px', textAlign: 'center' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map(record => (
              <tr key={record.id} style={S.trHover}>
                <td style={S.td}>
                  <div style={{ fontWeight: 600, color: '#1e293b' }}>{record.patientName}</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>{record.patientId}</div>
                </td>
                <td style={S.td}>
                  <div style={{ fontWeight: 500, color: '#374151' }}>{record.examItemName}</div>
                  <Badge type="blue">{record.modality}</Badge>
                </td>
                <td style={S.td}>
                  <div style={{ fontWeight: 500 }}>{record.authorName}</div>
                </td>
                <td style={S.td}>
                  <div style={{ fontWeight: 500 }}>{record.auditorName}</div>
                </td>
                <td style={S.td}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#64748b' }}>
                    <Clock size={13} />
                    {record.auditTime.slice(0, 16).replace('T', ' ')}
                  </div>
                </td>
                <td style={S.td}>
                  {record.auditResult === '通过' && <Badge type="green">✓ 通过</Badge>}
                  {record.auditResult === '修改' && <Badge type="yellow">⟳ 修改</Badge>}
                  {record.auditResult === '驳回' && <Badge type="red">✗ 驳回</Badge>}
                </td>
                <td style={S.td}>
                  {record.modifyReason ? (
                    <div style={{ fontSize: '13px', color: '#64748b', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={record.modifyReason}>
                      {record.modifyReason}
                    </div>
                  ) : (
                    <span style={{ fontSize: '13px', color: '#cbd5e1' }}>-</span>
                  )}
                </td>
                <td style={{ ...S.td, textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                    <button
                      onClick={() => handleApprove(record)}
                      style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #bbf7d0', backgroundColor: '#f0fdf4', color: '#16a34a', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <CheckCircle size={13} />
                      通过
                    </button>
                    <button
                      onClick={() => handleReject(record)}
                      style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #fecaca', backgroundColor: '#fef2f2', color: '#dc2626', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <XCircle size={13} />
                      驳回
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredRecords.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
            <FileCheck size={40} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
            <div>暂无审核记录</div>
          </div>
        )}
      </Card>

      {/* 审核历史（最近5条） */}
      <Card style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={18} />
            审核历史
          </h3>
          <SecondaryBtn>查看全部</SecondaryBtn>
        </div>
        <div>
          {auditRecords.slice(0, 5).map((record, idx) => (
            <div
              key={record.id}
              style={{
                ...S.historyItem,
                ...(idx === auditRecords.slice(0, 5).length - 1 ? S.historyItemLast : {}),
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>{record.patientName}</span>
                    <Badge type="blue">{record.examItemName}</Badge>
                    {record.auditResult === '通过' && <Badge type="green">通过</Badge>}
                    {record.auditResult === '修改' && <Badge type="yellow">修改</Badge>}
                    {record.auditResult === '驳回' && <Badge type="red">驳回</Badge>}
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>
                    由 {record.authorName} 书写 → {record.auditorName} 审核
                    {record.modifyReason && (
                      <span style={{ marginLeft: '8px' }}>
                        <MessageSquare size={12} style={{ verticalAlign: 'middle', marginRight: '2px' }} />
                        {record.modifyReason}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                  {record.auditTime.slice(0, 16).replace('T', ' ')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 通过确认模态框 */}
      {showModal === 'approve' && selectedRecord && (
        <div style={S.modalOverlay} onClick={handleModalCancel}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <div style={S.modalTitle}>
              <CheckCircle size={22} color="#16a34a" />
              确认通过审核
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '10px', marginBottom: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>患者</div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{selectedRecord.patientName}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>检查项目</div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{selectedRecord.examItemName}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>报告医师</div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{selectedRecord.authorName}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>审核医师</div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{selectedRecord.auditorName}</div>
                  </div>
                </div>
              </div>

              <div style={S.formGroup}>
                <label style={S.formLabel}>审核意见（可选）</label>
                <textarea
                  style={S.textarea}
                  placeholder="请输入审核意见..."
                  value={auditOpinion}
                  onChange={e => setAuditOpinion(e.target.value)}
                />
              </div>
            </div>

            <div style={S.modalFooter}>
              <SecondaryBtn onClick={handleModalCancel}>取消</SecondaryBtn>
              <PrimaryBtn onClick={handleModalConfirm}>
                <CheckCircle size={15} />
                确认通过
              </PrimaryBtn>
            </div>
          </div>
        </div>
      )}

      {/* 驳回模态框 */}
      {showModal === 'reject' && selectedRecord && (
        <div style={S.modalOverlay} onClick={handleModalCancel}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <div style={S.modalTitle}>
              <XCircle size={22} color="#dc2626" />
              驳回报告
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ padding: '16px', backgroundColor: '#fef2f2', borderRadius: '10px', marginBottom: '16px', border: '1px solid #fecaca' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>患者</div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{selectedRecord.patientName}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>检查项目</div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{selectedRecord.examItemName}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>报告医师</div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{selectedRecord.authorName}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>报告内容</div>
                    <div style={{ fontSize: '13px', color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {selectedRecord.originalImpression || '（空）'}
                    </div>
                  </div>
                </div>
              </div>

              <div style={S.formGroup}>
                <label style={{ ...S.formLabel, color: '#dc2626' }}>驳回原因 *</label>
                <textarea
                  style={{ ...S.textarea, borderColor: '#fecaca' }}
                  placeholder="请输入驳回原因，说明需要修改的内容..."
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                />
              </div>
            </div>

            <div style={S.modalFooter}>
              <SecondaryBtn onClick={handleModalCancel}>取消</SecondaryBtn>
              <PrimaryBtn
                onClick={handleModalConfirm}
                style={{ backgroundColor: '#dc2626' }}
                disabled={!rejectReason.trim()}
              >
                <XCircle size={15} />
                确认驳回
              </PrimaryBtn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
