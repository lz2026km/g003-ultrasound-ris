import React from 'react';
import { User, Phone, MapPin, Calendar, CreditCard, FileText } from 'lucide-react';
import type { Patient } from '../types';

interface PatientCardProps {
  patient: Patient;
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
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
  } as React.CSSProperties,
  avatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: '#dbeafe',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#1e40af',
    fontSize: '20px',
    fontWeight: 600,
  } as React.CSSProperties,
  avatarFemale: {
    backgroundColor: '#fce7f3',
    color: '#9d174d',
  } as React.CSSProperties,
  title: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#1e293b',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  } as React.CSSProperties,
  subtitle: {
    fontSize: '13px',
    color: '#64748b',
    marginTop: '2px',
  } as React.CSSProperties,
  genderBadge: {
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 500,
  } as React.CSSProperties,
  info: {
    fontSize: '13px',
    color: '#374151',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  } as React.CSSProperties,
  infoLabel: {
    fontSize: '12px',
    color: '#94a3b8',
    width: '60px',
    flexShrink: 0,
  } as React.CSSProperties,
  infoValue: {
    fontSize: '13px',
    color: '#374151',
    flex: 1,
  } as React.CSSProperties,
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '12px',
    borderTop: '1px solid #e5e7eb',
    marginTop: '12px',
  } as React.CSSProperties,
  footerItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    color: '#64748b',
  } as React.CSSProperties,
};

export default function PatientCard({ patient, onClick, compact = false }: PatientCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const isFemale = patient.gender === '女';
  const age = patient.age || (() => {
    const birth = new Date(patient.birthDate);
    const now = new Date();
    return Math.floor((now.getTime() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  })();

  const getAge = () => {
    if (patient.age) return patient.age;
    const birth = new Date(patient.birthDate);
    const now = new Date();
    return Math.floor((now.getTime() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  };

  const actualAge = getAge();

  const formatBirthDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            ...styles.avatar,
            ...(isFemale ? styles.avatarFemale : {}),
            width: '40px',
            height: '40px',
            fontSize: '16px',
          }}>
            {patient.name.charAt(0)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ ...styles.title, fontSize: '14px' }}>
              {patient.name}
              <span style={{
                ...styles.genderBadge,
                backgroundColor: isFemale ? '#fce7f3' : '#dbeafe',
                color: isFemale ? '#9d174d' : '#1e40af',
              }}>
                {patient.gender}
              </span>
              <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 400 }}>
                {actualAge}岁
              </span>
            </div>
            <div style={{ ...styles.subtitle, marginTop: 0 }}>
              病历号: {patient.medicalRecordNo}
            </div>
          </div>
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
        <div style={{
          ...styles.avatar,
          ...(isFemale ? styles.avatarFemale : {}),
        }}>
          {patient.name.charAt(0)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={styles.title}>
            {patient.name}
            <span style={{
              ...styles.genderBadge,
              backgroundColor: isFemale ? '#fce7f3' : '#dbeafe',
              color: isFemale ? '#9d174d' : '#1e40af',
            }}>
              {patient.gender}
            </span>
            <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 400 }}>
              {actualAge}岁
            </span>
          </div>
          <div style={styles.subtitle}>
            病历号: {patient.medicalRecordNo}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '8px' }}>
        <div style={styles.info}>
          <User size={14} style={{ color: '#94a3b8' }} />
          <span style={styles.infoLabel}>身份证</span>
          <span style={styles.infoValue}>{patient.idCard}</span>
        </div>

        <div style={styles.info}>
          <Phone size={14} style={{ color: '#94a3b8' }} />
          <span style={styles.infoLabel}>电话</span>
          <span style={styles.infoValue}>{patient.phone}</span>
        </div>

        <div style={styles.info}>
          <Calendar size={14} style={{ color: '#94a3b8' }} />
          <span style={styles.infoLabel}>出生</span>
          <span style={styles.infoValue}>
            {formatBirthDate(patient.birthDate)} ({actualAge}岁)
          </span>
        </div>

        <div style={styles.info}>
          <MapPin size={14} style={{ color: '#94a3b8' }} />
          <span style={styles.infoLabel}>地址</span>
          <span style={{ ...styles.infoValue, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {patient.address}
          </span>
        </div>
      </div>

      <div style={styles.footer}>
        <span style={{ ...styles.footerItem, cursor: 'pointer' }}>
          <FileText size={14} />
          查看检查记录
        </span>
        <span style={{ ...styles.footerItem, cursor: 'pointer' }}>
          <CreditCard size={14} />
          {patient.medicalRecordNo}
        </span>
      </div>
    </div>
  );
}
