import React from 'react';
import { Calendar, Clock, User, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import type { Exam, ExamStatus, Priority } from '../types';

interface ExamCardProps {
  exam: Exam;
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
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '12px',
    borderTop: '1px solid #e5e7eb',
    fontSize: '12px',
    color: '#94a3b8',
  } as React.CSSProperties,
};

const statusConfig: Record<ExamStatus, { label: string; color: string; bg: string }> = {
  '已预约': { label: '已预约', color: '#2563eb', bg: '#dbeafe' },
  '已登记': { label: '已登记', color: '#7c3aed', bg: '#ede9fe' },
  '检查中': { label: '检查中', color: '#f59e0b', bg: '#fef3c7' },
  '已完成': { label: '已完成', color: '#10b981', bg: '#d1fae5' },
  '已报告': { label: '已报告', color: '#059669', bg: '#a7f3d0' },
  '已取消': { label: '已取消', color: '#64748b', bg: '#f1f5f9' },
};

const priorityConfig: Record<Priority, { label: string; color: string; bg: string }> = {
  '普通': { label: '普通', color: '#64748b', bg: '#f1f5f9' },
  '急诊': { label: '急诊', color: '#dc2626', bg: '#fef2f2' },
  '优先': { label: '优先', color: '#f59e0b', bg: '#fef3c7' },
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

export default function ExamCard({ exam, patientName, onClick, compact = false }: ExamCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const status = statusConfig[exam.status];
  const priority = priorityConfig[exam.priority];
  const modalityStyle = getModalityStyle(exam.modality);

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
            {exam.examItemName}
          </div>
          <span style={{ ...styles.badge, backgroundColor: status.bg, color: status.color }}>
            {status.label}
          </span>
        </div>
        <div style={{ ...styles.info, marginBottom: 0 }}>
          <Calendar size={14} />
          {exam.scheduledDate} {exam.scheduledTime}
          {patientName && <span style={{ marginLeft: '12px' }}>{patientName}</span>}
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
          {exam.examItemName}
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{
            ...styles.badge,
            backgroundColor: priority.bg,
            color: priority.color,
          }}>
            {priority.label}
          </span>
          <span style={{ ...styles.modality, backgroundColor: modalityStyle.bg, color: modalityStyle.color }}>
            {exam.modality}
          </span>
          <span style={{ ...styles.badge, backgroundColor: status.bg, color: status.color }}>
            {status.label}
          </span>
        </div>
      </div>

      {patientName && (
        <div style={styles.info}>
          <User size={14} />
          {patientName}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
        <div style={styles.info}>
          <FileText size={14} />
          检查号: {exam.accessionNumber}
        </div>
        <div style={styles.info}>
          <Calendar size={14} />
          {exam.scheduledDate} {exam.scheduledTime}
        </div>
      </div>

      <div style={{
        ...styles.info,
        backgroundColor: '#f8fafc',
        padding: '8px 12px',
        borderRadius: '6px',
        marginBottom: '12px',
      }}>
        <AlertCircle size={14} style={{ color: '#64748b', flexShrink: 0 }} />
        <span style={{ color: '#374151' }}>{exam.clinicalDiagnosis}</span>
      </div>

      {exam.technitian && (
        <div style={{ ...styles.info, marginBottom: 0 }}>
          <span>技师: {exam.technitian}</span>
          {exam.radiologist && <span style={{ marginLeft: '16px' }}>诊断医师: {exam.radiologist}</span>}
        </div>
      )}

      <div style={styles.footer}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span>申请医生: {exam.requestingPhysician}</span>
          {exam.charge > 0 && <span>费用: ¥{exam.charge}</span>}
        </div>
        {exam.priority === '急诊' && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#dc2626', fontWeight: 500 }}>
            <AlertCircle size={14} />
            急诊优先
          </span>
        )}
      </div>
    </div>
  );
}
