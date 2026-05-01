// ============================================================
// G004 MWL Context - 工作列表流转状态管理 & HL7消息推送
// ============================================================
import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import type { Appointment, EndoscopyExam, AppointmentStatus } from '../types';
import { initialAppointments, initialEndoscopyExams } from '../data/initialData';
import {
  HL7Message,
  addHL7Log,
  getHL7Log,
  simulateCheckIn,
  simulateStartExam,
  simulateCompleteExam,
  toDicomMWLStatus,
  canTransition,
  type MWLTransition,
  type HL7LogEntry,
} from '../services/mwlService';

interface MWLState {
  appointments: Appointment[];
  exams: EndoscopyExam[];
  hl7Log: HL7LogEntry[];
  selectedApt: Appointment | null;
  isPanelOpen: boolean;
  panelTab: 'detail' | 'hl7' | 'workflow';
  lastHL7Msg: HL7LogEntry | null;
}

interface MWLContextValue extends MWLState {
  // 工作列表操作
  refreshAppointments: () => void;
  selectAppointment: (apt: Appointment | null) => void;
  openPanel: (apt: Appointment, tab?: MWLState['panelTab']) => void;
  closePanel: () => void;
  // 流转操作
  checkIn: (apt: Appointment) => void;
  startExam: (apt: Appointment) => void;
  completeExam: (apt: Appointment) => void;
  cancelApt: (apt: Appointment) => void;
  // HL7日志
  refreshHL7Log: () => void;
  clearHL7Log: () => void;
  getExamByAptId: (aptId: string) => EndoscopyExam | undefined;
}

const MWLContext = createContext<MWLContextValue | null>(null);

export function MWLProvider({ children }: { children: React.ReactNode }) {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [exams, setExams] = useState<EndoscopyExam[]>(initialEndoscopyExams);
  const [hl7Log, setHl7Log] = useState<HL7LogEntry[]>([]);
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [panelTab, setPanelTab] = useState<MWLState['panelTab']>('detail');
  const [lastHL7Msg, setLastHL7Msg] = useState<HL7LogEntry | null>(null);
  const hl7TimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refreshAppointments = useCallback(() => {
    setAppointments(initialAppointments);
  }, []);

  const selectAppointment = useCallback((apt: Appointment | null) => {
    setSelectedApt(apt);
  }, []);

  const openPanel = useCallback((apt: Appointment, tab: MWLState['panelTab'] = 'detail') => {
    setSelectedApt(apt);
    setPanelTab(tab);
    setIsPanelOpen(true);
  }, []);

  const closePanel = useCallback(() => {
    setIsPanelOpen(false);
    setSelectedApt(null);
  }, []);

  const refreshHL7Log = useCallback(() => {
    setHl7Log(getHL7Log());
  }, []);

  const clearHL7Log = useCallback(() => {
    setHl7Log([]);
  }, []);

  const getExamByAptId = useCallback((aptId: string) => {
    return exams.find(e => e.appointmentId === aptId);
  }, [exams]);

  // 接诊
  const checkIn = useCallback((apt: Appointment) => {
    const mwlStatus = toDicomMWLStatus(apt.status);
    if (!canTransition(mwlStatus, 'CHECKED_IN')) return;

    const { updatedApt, hl7msg, exam } = simulateCheckIn(apt);
    setAppointments(prev => prev.map(a => a.id === apt.id ? updatedApt : a));
    if (exam) setExams(prev => [...prev, exam]);
    const logEntry = addHL7Log(hl7msg, apt.patientId, apt.patientName, '接诊登记');
    setLastHL7Msg(logEntry);
    setHl7Log(getHL7Log());
    setSelectedApt(updatedApt);

    // 模拟异步发送
    if (hl7TimerRef.current) clearTimeout(hl7TimerRef.current);
    hl7TimerRef.current = setTimeout(() => {
      setHl7Log(getHL7Log());
      setLastHL7Msg(prev => prev ? { ...prev, status: '发送成功' } : null);
    }, 800);
  }, []);

  // 开始检查
  const startExam = useCallback((apt: Appointment) => {
    const mwlStatus = toDicomMWLStatus(apt.status);
    if (!canTransition(mwlStatus, 'IN_PROGRESS')) return;

    const { updatedApt, hl7msg } = simulateStartExam(apt);
    setAppointments(prev => prev.map(a => a.id === apt.id ? updatedApt : a));
    const logEntry = addHL7Log(hl7msg, apt.patientId, apt.patientName, '开始检查');
    setHl7Log(getHL7Log());
    setSelectedApt(updatedApt);
    void logEntry;
  }, []);

  // 完成检查
  const completeExam = useCallback((apt: Appointment) => {
    const exam = exams.find(e => e.appointmentId === apt.id);
    if (!exam) return;
    const { updatedApt, updatedExam, hl7msg } = simulateCompleteExam(apt, exam);
    setAppointments(prev => prev.map(a => a.id === apt.id ? updatedApt : a));
    setExams(prev => prev.map(e => e.id === exam.id ? updatedExam : e));
    const logEntry = addHL7Log(hl7msg, apt.patientId, apt.patientName, '检查完成');
    setHl7Log(getHL7Log());
    setSelectedApt(updatedApt);
    void logEntry;
  }, [exams]);

  // 取消预约
  const cancelApt = useCallback((apt: Appointment) => {
    const mwlStatus = toDicomMWLStatus(apt.status);
    if (!canTransition(mwlStatus, 'CANCELLED')) return;

    const updatedApt: Appointment = { ...apt, status: '已取消' };
    setAppointments(prev => prev.map(a => a.id === apt.id ? updatedApt : a));
    const logEntry = addHL7Log(
      { type: 'SDM', timestamp: new Date().toISOString(), raw: '', fields: {} },
      apt.patientId,
      apt.patientName,
      '取消预约'
    );
    setHl7Log(getHL7Log());
    setSelectedApt(updatedApt);
    void logEntry;
  }, []);

  return (
    <MWLContext.Provider value={{
      appointments,
      exams,
      hl7Log,
      selectedApt,
      isPanelOpen,
      panelTab,
      lastHL7Msg,
      refreshAppointments,
      selectAppointment,
      openPanel,
      closePanel,
      checkIn,
      startExam,
      completeExam,
      cancelApt,
      refreshHL7Log,
      clearHL7Log,
      getExamByAptId,
    }}>
      {children}
    </MWLContext.Provider>
  );
}

export function useMWL(): MWLContextValue {
  const ctx = useContext(MWLContext);
  if (!ctx) throw new Error('useMWL must be used within MWLProvider');
  return ctx;
}
