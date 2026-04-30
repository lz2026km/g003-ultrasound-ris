import React from 'react';
import { FileText, Clock, CheckCircle, AlertCircle, User, Calendar } from 'lucide-react';
import type { Report } from '../types';

interface ReportCardProps {
  report: Report;
  patientName?: string;
  onClick?: () => void;
  compact?: boolean;
}

const styles = {
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb',
    cursor: 'pointer',
    transition: 'all 0.2s',
  } as React.CSSProperties,
  cardHover: {
    borderColor: '#2563eb',
    boxShadow: '0 4px 12px rgba(37,99,235,0.15)',
  } as React.CSSProperties,
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
  } as React.CSSProperties,
  title: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#1e293b',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  } as React.CSSProperties,
  badge: {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 500,
  } as React.CSSProperties,
  modality: {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
  } as React.CSSProperties,
  info: {
    fontSize: '13px',
    color: '#64748b',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  } as React.CSSProperties,
  content: {
    fontSize: '13px',
    color: '#374151',
    lineHeight: 1.6,
    marginBottom: '12px',
  } as React.CSSProperties,
  impression: {
    fontSize: '13px',
    color: '#1e293b',
    fontWeight: 500,
    backgroundColor: '#f8fafc',
    padding: '10px 12px',
    borderRadius: '6px',
    borderLeft: '3px solid #2563eb',
    marginBottom: '12px',
  } as React.CSSProperties,
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '12px',
    borderTop: '1px solid #e5e7eb',
    fontSize: '12px',
    color: '#94a3b8',
  } as React.CSSProperties,
  criticalTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 500,
    backgroundColor: '#fef2f2',
    color: '#991b1b',
  } as React.CSSProperties,
};

const getStatusBadge = (status: string) => {
  const config: Record<string, { bg: string; color: string; label: string }> = {
    '待书写': { bg: '#f1f5f9', color: '#64748b', label: '待书写' },
    '待审核': { bg: '#fef3c7', color: '#92400e', label: '待审核' },
    '已完成': { bg: '#d1fae5', color: '#065f46', label: '已完成' },
    '已发布': { bg: '#dbeafe', color: '#1e40af', label: '已发布' },
  };
  const c = config[status] || { bg: '#f1f5f9', color: '#64748b', label: status };
  return (
    <span style={{ ...styles.badge, backgroundColor: c.bg, color: c.color }}>
      {c.label}
    </span>
  );
};

const getModalityStyle = (modality: string) => {
  const config: Record<string, { bg: string; color: string }> = {
    'DR': { bg: '#dbeafe', color: '#1e40af' },
    'CT': { bg: '#fef3c7', color: '#92400e' },
    'MR': { bg: '#d1fae5', color: '#065f46' },
    '超声': { bg: '#e0f2fe', color: '#0369a1' },
    '乳腺钼靶': { bg: '#fce7f3', color: '#9d174d' },
  };
  return config[modality] || { bg: '#f1f5f9', color: '#64748b' };
};

export default function ReportCard({ report, patientName, onClick, compact = false }: ReportCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const modalityStyle = getModalityStyle(report.modality);

  const formatDateTime = (dateTimeStr: string) => {
    if (!dateTimeStr) return '-';
    const dt = new Date(dateTimeStr);
    return dt.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (compact) {
    return (
      <div
        style={{
          ...styles.card,
          ...(isHovered ? styles.cardHover : {}),
          padding: '12px',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onClick}
      >
        <div style={styles.header}>
          <div style={styles.title}>
            <FileText size={16} />
            {report.examItemName}
          </div>
          {getStatusBadge(report.status)}
        </div>
        <div style={{ ...styles.info, marginBottom: 0 }}>
          <Calendar size={14} />
          {formatDateTime(report.reportTime)}
          <span style={{ marginLeft: '12px' }}>{report.radiologist}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        ...styles.card,
        ...(isHovered ? styles.cardHover : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div style={styles.header}>
        <div style={styles.title}>
          <FileText size={18} />
          {report.examItemName}
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {report.isUrgent && (
            <span style={styles.criticalTag}>
              <AlertCircle size={12} />
              危急值
            </span>
          )}
          <span style={{ ...styles.modality, backgroundColor: modalityStyle.bg, color: modalityStyle.color }}>
            {report.modality}
          </span>
          {getStatusBadge(report.status)}
        </div>
      </div>

      {patientName && (
        <div style={styles.info}>
          <User size={14} />
          {patientName}
          <span style={{ marginLeft: '12px' }}>检查号: {report.accessionNumber}</span>
        </div>
      )}

      {report.findings && (
        <div style={styles.content}>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>所见:</div>
          {report.findings.length > 150 ? `${report.findings.substring(0, 150)}...` : report.findings}
        </div>
      )}

      {report.impression && (
        <div style={styles.impression}>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>印象:</div>
          {report.impression}
        </div>
      )}

      {report.suggestion && (
        <div style={{ ...styles.content, marginBottom: 0 }}>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>建议:</div>
          {report.suggestion}
        </div>
      )}

      <div style={styles.footer}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span>报告医师: {report.radiologist}</span>
          {report.审核医师 && <span>审核医师: {report.审核医师}</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Clock size={12} />
          {formatDateTime(report.reportTime)}
        </div>
      </div>
    </div>
  );
}
